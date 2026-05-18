import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, User, Loader2, Sun, Moon, Plus, Minus, Copy, KeyRound, Download, Settings, Zap, Brain, Globe } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { getLanguageName } from "@/lib/translations";
import type { Language } from "@/lib/translations";
import logo from "@/assets/logo.png";
import mosqueBg from "@/assets/mosque-bg.jpg";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { TypewriterEffect } from "@/components/TypewriterEffect";
import { ChatSidebar } from "@/components/ChatSidebar";
import { useConversations } from "@/hooks/useConversations";
import { InstallPrompt } from "@/components/InstallPrompt";
import { ModelSelector, ResponseMode } from "@/components/ModelSelector";
import { ListenButton } from "@/components/ListenButton";
import { callAIMLApi } from "@/lib/aiml-config";
import { callManusApi } from "@/lib/manus-config";
import { getModelById } from "@/lib/admin-config";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

declare global {
  interface Window {
    puter: {
      ai: {
        chat: (message: string, options?: { model?: string }) => Promise<unknown>;
      };
      auth: {
        isSignedIn: () => boolean;
        signIn: (options?: { attempt_temp_user_creation?: boolean }) => Promise<unknown>;
      };
    };
  }
}

type FontSize = "small" | "medium" | "large";

const fontSizeClasses: Record<FontSize, string> = {
  small: "text-xs",
  medium: "text-sm",
  large: "text-base",
};

const fontSizeLabels: Record<FontSize, string> = {
  small: "بچووک",
  medium: "مامناوەند",
  large: "گەورە",
};

const Index = () => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [responseMode, setResponseMode] = useState<ResponseMode>(() => {
    const saved = localStorage.getItem('aikurdi_response_mode');
    return (saved as ResponseMode) || 'manus';
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastAssistantMessageId, setLastAssistantMessageId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const {
    conversations,
    activeId,
    activeConversation,
    createNew,
    updateMessages,
    rename,
    remove,
    selectConversation,
  } = useConversations();

  const messages = activeConversation?.messages || [];

  const increaseFontSize = () => {
    if (fontSize === "small") setFontSize("medium");
    else if (fontSize === "medium") setFontSize("large");
  };

  const decreaseFontSize = () => {
    if (fontSize === "large") setFontSize("medium");
    else if (fontSize === "medium") setFontSize("small");
  };

  // Persist responseMode to localStorage
  useEffect(() => {
    localStorage.setItem('aikurdi_response_mode', responseMode);
  }, [responseMode]);

  useEffect(() => {
    if (lastAssistantMessageId && messageRefs.current.has(lastAssistantMessageId)) {
      const messageElement = messageRefs.current.get(lastAssistantMessageId);
      if (messageElement && scrollRef.current) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setLastAssistantMessageId(null);
    }
  }, [lastAssistantMessageId, messages]);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    if (scrollRef.current) {
      const scrollViewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages, activeConversation]);

  // Handle Clean up URL parameters after Puter redirects back
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has('token') || url.searchParams.has('puter_token') || url.searchParams.has('code')) {
        console.log("🧹 Cleaning up auth parameters from URL");
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    } catch (e) {
      console.error("Error cleaning up URL params:", e);
    }
  }, []);

  const connectPuter = async () => {
    if (!window.puter?.auth?.signIn) {
      toast.error("Puter ئامادە نییە. تکایە دووبارە page refresh بکە.");
      return;
    }

    const isNativeApp = !!(window as any).Capacitor?.isNativePlatform?.();
    let originalOpen = window.open;

    try {
      if (isNativeApp) {
        // Native app: override window.open to redirect the main webview directly to Puter
        // This keeps the auth session in the app's webview so it returns successfully
        window.open = (url) => {
          console.log("📱 Native app Puter signIn: redirecting to", url);
          window.location.href = url || '';
          return null;
        };
      }

      await window.puter.auth.signIn({ attempt_temp_user_creation: true });
      
      if (isNativeApp) {
        window.open = originalOpen;
      }
      
      toast.success("پەیوەندیکردن سەرکەوتوو بوو");
    } catch (error) {
      if (isNativeApp) {
        window.open = originalOpen;
      }
      console.error("Puter connection error:", error);
      toast.error("نەتوانرا پەیوەندیبکرێت. تکایە دووبارە هەوڵبدەرەوە.");
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Create new conversation if none exists
    let currentId = activeId;
    if (!currentId) {
      currentId = createNew();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    const newMessages = [...messages, userMessage];
    updateMessages(newMessages, currentId);
    setInput("");
    setIsLoading(true);

    try {
      const systemPromptKu = `تۆ زانایەکی ئیسلامیت کە تەنها لەسەر مەنهەجی سەلەفی صالح وەڵام دەدەیتەوە.

## دەربارەی ئەم ئەپە:
- ئەم ئەپە لەلایەن یوسف دەربەندییەوە دروست کراوە
- کاتێک کەسێک پرسیار کرد "کێ تۆی دروست کردووە؟"، بڵێ: "من لەلایەن یوسف دەربەندییەوە دروست کراوم"
- هەرگیز لە کۆتایی وەڵامەکان مەڵێ "من لەلایەن یوسف..."، تەنها ئەگەر پرسیارت لێ کرا.

## پلەبەندی وەڵامدانەوە (زۆر گرنگ):
وەڵامەکانت دەبێت بەم ڕیزبەندییە بن:
1. ئایەتی قورئانی پیرۆز (سەرەتا بەمە دەست پێ بکە)
2. فەرموودەی سەحیح (سونەت)
3. وتەی هاوەڵان (سەحابە)
4. وتەی شوێنکەوتووان (تابعین)
5. وتەی شوێنکەوتووی شوێنکەوتووان (تابعی تابعین)
6. وتەی زانایانی سەلەف (بەپێی لیستی ڕێگەپێدراو)

## شێوازی سەرچاوە و ژمارە (Footnotes):
- لە کۆتایی هەموو وتە و فەرموودەیەک، ژمارەیەک دابنێ لەنێوان []، بۆ نموونە: [١]
- لە کۆتایی وەڵامەکە، بەشی "## سەرچاوەکان" دروست بکە
- **زۆر گرنگ:** هەموو سەرچاوەکان دەبێت بە شێوەی لیستی ژمارەدار بنووسرێن، هەر سەرچاوەیەک لە هێڵی جیا:

1. [١]: ناوی سەرچاوە، بەرگ/لاپەڕە
2. [٢]: ناوی سەرچاوە، بەرگ/لاپەڕە
3. [٣]: ناوی سەرچاوە، بەرگ/لاپەڕە

- **هەرگیز** سەرچاوەکان لە یەک پاراگراف مەنووسە، هەموویان دەبێت جیا بن

## ڕێنماییەکان:
- تەنها فەتوای زانایانی سەلەفی نقڵ بکە بەسەرچاوەوە
- هەرگیز لەخۆت شتێک دانەنێ، تەنها نقڵی وتەی زانایان بکە
- ناوی زانایان بە عەرەبی بنووسە (بۆ نموونە: الشيخ عبدالعزيز بن باز)

## شێوازی وەڵامدانەوە:
- کاتێک کەسێک سڵاو دەکات، وەڵامی بە عەرەبی بدەرەوە (وەک: "وعليكم السلام ورحمة الله وبركاته")
- کاتێک پرسیارێکی شەرعی دەکرێت، وەڵامێکی **یەکجار درێژ و تێر و تەسەل** بدەرەوە بە هەموو وردەکارییەکانەوە.
- هەوڵبدە وەڵامەکانت لە ٥٠٠ وشە زیاتر بن ئەگەر بابەتەکە هەڵینەگرت.
- کاتێک پرسیار بەراوردکردن لەخۆ دەگرێت، خشتە (table) بەکاربهێنە

## زانایانی ڕێگەپێدراو (ناوەکانیان بە عەرەبی بنووسە):
- العلامة ابن تيمية، العلامة ابن القيم، العلامة ابن كثير، العلامة الذهبي
- العلامة محمد بن عبد الوهاب
- الشيخ عبدالعزيز بن باز رحمه الله
- الشيخ محمد ناصر الدين الألباني رحمه الله
- الشيخ محمد بن صالح العثيمين رحمه الله
- الشيخ صالح الفوزان حفظه الله
- الشيخ ربيع بن هادي المدخلي حفظه الله
- الشيخ عبيد الجابري رحمه الله
- الشيخ عبدالله البخاري حفظه الله

## کەسانی تحذیر لێکراو (هەرگیز باسیان مەکە و هیچ شتێکیان لێ نقڵ مەکە):
- سلیمان الرحيلي، عبدالرزاق البدر، سالم الطويل
- محمد بن هادي، صالح السحيمي
- ئەگەر پرسیار لەسەر ئەمانە کرا، بڵێ: "زانایان تحذیریان لێ کردوون" و وەسفیان مەکە.

## وەرگێڕانی و شێوازی نووسینی دەقە عەرەبییەکان (زۆر زۆر گرنگ):
کاتێک دەقێکی عەرەبی دەنووسیت (ئایەت، حەدیس، وتەی سەحابە، وتەی زانا)، دەبێت هەمیشە بەم شێوەیە بنووسیت:

**شێوازی نووسین (هەمیشە بەکاربهێنە):**
- دەقی عەرەبی تەنها لەناو کارتەکەدا (blockquote بە >) بنووسە
- واتای کوردی لە دەرەوەی کارتەکەدا بنووسە (بەبێ >)
- تەنها بنووسە "واتا:" نەک "واتا بەکوردی:"

**نموونە بۆ ئایەتی قورئان (هەمیشە بەم شێوەیە بنووسە):**
> ﴿ قُلْ هُوَ اللَّهُ أَحَدٌ ﴾

واتا: بڵێ ئەو خوایە یەکێکی تاکە

**نموونە بۆ حەدیس (هەمیشە بەم شێوەیە بنووسە):**
> «إنما الأعمال بالنيات»

واتا: بێگومان کارەکان بە نیەتەوەیە

**نموونە بۆ وتەی زانا (هەمیشە بەم شێوەیە بنووسە):**
> الشيخ ابن باز رحمه الله: «العلم قبل القول والعمل»

واتا: زانین پێش قسەکردن و کارە

**ئاگاداری گرنگ:**
- هەرگیز ئایەت، حەدیس، یان وتەیەک بەعەرەبی تەنها مەنووسە بەبێ وەرگێڕانی کوردی
- دەقی عەرەبی لەناو > و واتای کوردی لە دەرەوەی > دەبێت
- ئەم ڕێسایە بۆ هەموو دەقێکی عەرەبی دەبێت بەجێ بهێنرێت، هیچ استثنایەک نییە

## ڕێزمانی کوردی (زۆر گرنگ):
- هەمیشە بە کوردی سۆرانی ڕاست و ڕێک بنووسە
- پیتەکان بە تەواوی بنووسە، هیچ پیتێک مەپەڕێنە
- وشەکان بە ڕاستی بنووسە، غەڵەت مەکە
- کوردی سۆرانی بەکاربهێنە نەک کرمانجی
- وشەی "شرط" بنووسە "مەرج"
- وشەی "فتوی" بنووسە "فەتوا"
- وشەی "مثلاً" بنووسە "بۆ نموونە"

پرسیار: `;

      const systemPromptAr = `أنت عالم إسلامي تجيب فقط على منهج السلف الصالح.

## عن هذا التطبيق:
- تم إنشاء هذا التطبيق بواسطة يوسف دربندي
- عندما يسأل أحد "من أنشأك؟" أو "من صنع هذا التطبيق؟"، قل: "تم إنشائي بواسطة يوسف دربندي"
- لا تذكر اسم "يوسف دربندي" في نهاية كل إجابة، فقط اذكر ذلك إذا سُئلت "من صنعك؟".

## ترتيب الإجابة (مهم جداً):
يجب أن تكون إجاباتك بهذا الترتيب:
1. آيات القرآن الكريم (ابدأ بها أولاً)
2. الأحاديث الصحيحة (السنة)
3. أقوال الصحابة
4. أقوال التابعين
5. أقوال تابعي التابعين
6. أقوال علماء السلف (حسب القائمة المسموحة)

## طريقة المصادر والترقيم (Footnotes):
- في نهاية كل قول أو حديث، ضع رقماً بين []، مثال: [١] (استخدم الأرقام الشرقية ١، ٢، ٣)
- في أسفل الإجابة، أنشئ قسماً بعنوان "## المصادر"
- **مهم جداً:** اكتب جميع المصادر على شكل قائمة مرقمة، كل مصدر في سطر منفصل:

1. [١]: اسم المصدر، المجلد/الصفحة
2. [٢]: اسم المصدر، المجلد/الصفحة
3. [٣]: اسم المصدر، المجلد/الصفحة

- **لا تكتب** المصادر في فقرة واحدة أبداً، كل مصدر يجب أن يكون منفصلاً

## الإرشادات:
- انقل فقط فتاوى العلماء السلفيين مع ذكر المصدر
- لا تختلق شيئاً من نفسك، انقل فقط أقوال العلماء
- اكتب "الشيخ" أو "العلامة" قبل اسم كل عالم

## أسلوب الإجابة:
- عندما يسلم أحد أو يقول كلاماً عادياً، أجب بالعربية (مثلاً: "وعليكم السلام ورحمة الله وبركاته")
- عند السؤال الشرعي، أعط إجابة **طويلة جداً ومفصلة** مع ذكر كل التفاصيل (أكثر من 500 كلمة).
- عند المقارنة أو طلب قائمة، استخدم الجداول

## العلماء المسموح النقل عنهم:
- العلامة ابن تيمية، العلامة ابن القيم، العلامة ابن كثير، العلامة الذهبي
- العلامة محمد بن عبد الوهاب
- الشيخ عبد العزيز بن باز، الشيخ محمد ناصر الدين الألباني، الشيخ محمد بن صالح العثيمين
- الشيخ صالح الفوزان، الشيخ ربيع بن هادي المدخلي، الشيخ عبيد الجابري
- الشيخ عبدالله البخاري

## أشخاص مُحذّر منهم (لا تذكرهم أبداً ولا تنقل عنهم شيئاً):
- سليمان الرحيلي، عبد الرزاق البدر، سالم الطويل
- محمد بن هادي، صالح السحيمي
- إذا سُئلت عنهم، قل: "حذر منهم العلماء" ولا تصفهم بأي وصف مدح.

## اللغة:
- أجب دائماً باللغة العربية الفصحى
- اكتب بوضوح واستخدم علامات الترقيم الصحيحة

السؤال: `;

      const systemPrompt = language === 'ar' ? systemPromptAr : systemPromptKu;


      // Prevent Puter from auto-opening login in a new tab (only for fast mode which uses Puter)
      if (responseMode === 'fast' && !window.puter?.auth?.isSignedIn?.()) {
        const authMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: t.puterAuthMessage,
        };
        updateMessages([...newMessages, authMessage], currentId);
        return;
      }

      // Build conversation history (up to 10,000 messages)
      const historyLimit = 10000;
      const conversationHistory = newMessages.slice(-historyLimit).map(msg =>
        `${msg.role === 'user' ? 'بەکارهێنەر' : 'یارمەتیدەر'}: ${msg.content}`
      ).join('\n\n');

      const fullPrompt = `${systemPrompt}

## مێژووی گفتوگۆ:
${conversationHistory}

وەڵام بدەرەوە بۆ دوایین پرسیاری بەکارهێنەر.`;

      let response;
      let messageContent: string;

      if (responseMode === 'fast') {
        // Use Puter API - ONLY use the model from admin config, no fallbacks
        const fastModel = getModelById('fast');
        const modelName = fastModel?.model || 'gemini-3-flash-preview';

        console.log(`🔮 Using Puter API with model: ${modelName}`);

        try {
          response = await window.puter.ai.chat(fullPrompt, { model: modelName });

          if (!response) {
            throw new Error(`مۆدێلی ${modelName} وەڵامی نەدایەوە`);
          }

          // Check if the response contains the model info
          console.log('✅ Puter API response:', response);

        } catch (err: any) {
          console.error(`❌ Model ${modelName} failed:`, err);
          throw new Error(`مۆدێلی "${modelName}" کار ناکات. تکایە ناوی مۆدێل بپشکنە یان مۆدێلێکی تر هەڵبژێرە.`);
        }

        messageContent = typeof response === 'object' && response !== null && (response as any).message
          ? (response as any).message.content?.[0]?.text || String(response)
          : String(response) || "No response";
      } else {
        // Use AIML API for detailed, very_detailed, and premium modes
        const modeToAIML: Record<string, 'detailed' | 'very_detailed' | 'premium'> = {
          'detailed': 'detailed',
          'very_detailed': 'very_detailed',
          'premium': 'premium'
        };

        const aimlMode = modeToAIML[responseMode];
        if (!aimlMode) {
          // Check if it's manus mode
          if (responseMode === 'manus') {
            messageContent = await callManusApi(fullPrompt, systemPrompt);
          } else {
            throw new Error(`Unknown response mode: ${responseMode}`);
          }
        } else {
          messageContent = await callAIMLApi(fullPrompt, aimlMode, systemPrompt);
        }
      }

      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: messageContent,
      };

      updateMessages([...newMessages, assistantMessage], currentId);
      setLastAssistantMessageId(assistantMessageId);
    } catch (error) {
      console.error("AI Error:", error);
      let errorContent = t.errorMessage;
      if (responseMode === 'manus') {
        errorContent = language === 'ar' 
          ? "عذراً، هناك مشكلة في الاتصال. يرجى فتح القائمة الجانبية (الإعدادات) والضغط على زر 'تسجيل دخول' وإنشاء حساب لتتمكن من الاستمرار في استخدام الذكاء الاصطناعي."
          : "ببورە، کێشەیەک هەیە لە پەیوەندیکردن. تکایە لە مینیوی لاکێشەوە کرتە لە دوگمەی 'تسجیل دخول' بکە و هەژمارێک دروستبکە بۆ بەردەوامبوون لە بەکارهێنانی زیرەکی دەستکردەکە.";
      }

      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: errorContent,
      };
      updateMessages([...newMessages, errorMsg], currentId);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Mosque Background - Clear and Bright */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-95 dark:opacity-85 pointer-events-none"
        style={{ backgroundImage: `url(${mosqueBg})` }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-background/10 via-background/15 to-background/30 pointer-events-none" />
      <InstallPrompt />
      {/* Header */}
      <header className="relative border-b-2 border-primary/30 bg-gradient-to-r from-primary/10 via-card/95 to-primary/10 px-3 py-3 shadow-xl backdrop-blur-md islamic-glow overflow-hidden">
        {/* Islamic Pattern Overlay */}
        <div className="absolute inset-0 opacity-5 islamic-pattern pointer-events-none"></div>

        {/* Decorative top border with gradient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/30 via-accent to-primary/30"></div>

        {/* Left Islamic Corner Decoration */}
        <div className="absolute top-0 left-0 w-16 h-16">
          <svg viewBox="0 0 64 64" className="w-full h-full">
            <path d="M0 0 L32 0 Q16 16 0 32 Z" fill="currentColor" className="text-primary/20" />
            <path d="M0 0 L16 0 Q8 8 0 16 Z" fill="currentColor" className="text-accent/30" />
            <circle cx="8" cy="8" r="2" fill="currentColor" className="text-accent/40" />
          </svg>
        </div>

        {/* Right Islamic Corner Decoration */}
        <div className="absolute top-0 right-0 w-16 h-16">
          <svg viewBox="0 0 64 64" className="w-full h-full">
            <path d="M64 0 L32 0 Q48 16 64 32 Z" fill="currentColor" className="text-primary/20" />
            <path d="M64 0 L48 0 Q56 8 64 16 Z" fill="currentColor" className="text-accent/30" />
            <circle cx="56" cy="8" r="2" fill="currentColor" className="text-accent/40" />
          </svg>
        </div>

        {/* Decorative crescents */}
        <div className="absolute top-1/2 left-4 -translate-y-1/2 text-accent/30 text-lg hidden sm:block">☪</div>
        <div className="absolute top-1/2 right-4 -translate-y-1/2 text-accent/30 text-lg hidden sm:block">☪</div>

        {/* Bottom decorative border */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>

        <div className="relative mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-2">
            <ChatSidebar
              conversations={conversations}
              activeId={activeId}
              onSelect={selectConversation}
              onNew={createNew}
              onRename={rename}
              onDelete={remove}
            />
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-sm"></div>
              <img src={logo} alt="لۆگۆ" className="relative h-9 w-9 aspect-square object-cover rounded-full shadow-lg ring-2 ring-primary/30" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-amiri text-lg font-bold text-gradient-islamic leading-tight">
                {t.appName}
              </h1>
              <span className="text-[10px] text-muted-foreground/70 hidden sm:block">{t.createdBy}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Response Mode Toggle */}
            <ModelSelector
              currentMode={responseMode}
              onSelectMode={setResponseMode}
              lang={language}
            />

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/10"
              title="پەیوەندیکردن"
              onClick={connectPuter}
            >
              <KeyRound className="h-4 w-4 text-primary" />
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-primary/10"
                  title="ڕێکخستنەکان"
                >
                  <Settings className="h-4 w-4 text-primary" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 border-r-0 bg-gradient-to-b from-card via-card to-primary/5 p-0">
                {/* Decorative Header */}
                <div className="relative border-b border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 px-6 py-6">
                  {/* Islamic Pattern Overlay */}
                  <div className="absolute inset-0 opacity-10 islamic-pattern"></div>

                  {/* Decorative Top Border */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>

                  <SheetHeader className="relative">
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-px w-8 bg-gradient-to-r from-transparent to-primary/50"></div>
                      <div className="h-1.5 w-1.5 rotate-45 bg-accent"></div>
                      <SheetTitle className="font-amiri text-xl font-bold text-gradient-islamic">
                        {t.settings}
                      </SheetTitle>
                      <div className="h-1.5 w-1.5 rotate-45 bg-accent"></div>
                      <div className="h-px w-8 bg-gradient-to-l from-transparent to-primary/50"></div>
                    </div>
                  </SheetHeader>
                </div>

                <div className="space-y-1 p-4">
                  {/* Login Section */}
                  <div className="rounded-xl border border-primary/10 bg-card/50 p-4 shadow-sm backdrop-blur-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-1 w-1 rotate-45 bg-accent"></div>
                      <span className="font-bold text-foreground">
                        {language === 'ar' ? 'الحساب' : 'هەژمار'}
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full justify-center gap-3 border-primary/20 py-5"
                      onClick={connectPuter}
                    >
                      <KeyRound className="h-5 w-5 text-primary" />
                      <span className="font-medium">تسجیل دخول</span>
                    </Button>
                  </div>
                  {/* Font Size Section */}
                  <div className="rounded-xl border border-primary/10 bg-card/50 p-4 shadow-sm backdrop-blur-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-1 w-1 rotate-45 bg-accent"></div>
                      <span className="font-bold text-foreground">{t.fontSize}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 rounded-lg border border-primary/20 bg-background/80 p-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-primary/10"
                        onClick={decreaseFontSize}
                        disabled={fontSize === "small"}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="min-w-[70px] text-center font-medium">
                        {fontSize === "small" ? t.fontSizeSmall : fontSize === "medium" ? t.fontSizeMedium : t.fontSizeLarge}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-primary/10"
                        onClick={increaseFontSize}
                        disabled={fontSize === "large"}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Theme Section */}
                  <div className="rounded-xl border border-primary/10 bg-card/50 p-4 shadow-sm backdrop-blur-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-1 w-1 rotate-45 bg-accent"></div>
                      <span className="font-bold text-foreground">{t.theme}</span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full justify-center gap-3 border-primary/20 py-5"
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    >
                      {theme === "dark" ? (
                        <>
                          <Sun className="h-5 w-5 text-yellow-500" />
                          <span className="font-medium">{t.themeLight}</span>
                        </>
                      ) : (
                        <>
                          <Moon className="h-5 w-5 text-blue-500" />
                          <span className="font-medium">{t.themeDark}</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Language Section */}
                  <div className="rounded-xl border border-primary/10 bg-card/50 p-4 shadow-sm backdrop-blur-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-1 w-1 rotate-45 bg-accent"></div>
                      <span className="font-bold text-foreground">{t.language}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={language === 'ku' ? 'default' : 'outline'}
                        className="flex-1 justify-center gap-2 border-primary/20 py-5"
                        onClick={() => setLanguage('ku')}
                      >
                        <Globe className="h-4 w-4" />
                        <span className="font-medium">کوردی</span>
                      </Button>
                      <Button
                        variant={language === 'ar' ? 'default' : 'outline'}
                        className="flex-1 justify-center gap-2 border-primary/20 py-5"
                        onClick={() => setLanguage('ar')}
                      >
                        <Globe className="h-4 w-4" />
                        <span className="font-medium">العربية</span>
                      </Button>
                    </div>
                  </div>

                  {/* Install App Section */}
                  <div className="rounded-xl border border-primary/10 bg-card/50 p-4 shadow-sm backdrop-blur-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-1 w-1 rotate-45 bg-accent"></div>
                      <span className="font-bold text-foreground">{t.downloadApp}</span>
                    </div>
                    <Link to="/install" className="block">
                      <Button variant="outline" className="w-full justify-center gap-3 border-primary/20 py-5">
                        <Download className="h-5 w-5 text-primary" />
                        <span className="font-medium">{t.download}</span>
                      </Button>
                    </Link>
                  </div>

                  {/* Admin Panel Section */}
                  <div className="rounded-xl border border-primary/10 bg-card/50 p-4 shadow-sm backdrop-blur-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-1 w-1 rotate-45 bg-accent"></div>
                      <span className="font-bold text-foreground">
                        {language === 'ar' ? 'لوحة التحكم' : 'لوحەی تحکم'}
                      </span>
                    </div>
                    <Link to="/admin" className="block">
                      <Button variant="outline" className="w-full justify-center gap-3 border-primary/20 py-5">
                        <Settings className="h-5 w-5 text-primary" />
                        <span className="font-medium">
                          {language === 'ar' ? 'إدارة النماذج' : 'بەڕێوەبردنی مۆدێلەکان'}
                        </span>
                      </Button>
                    </Link>
                  </div>

                  {/* About Section */}
                  <div className="rounded-xl border border-primary/10 bg-gradient-to-br from-primary/5 to-accent/5 p-4 shadow-sm backdrop-blur-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-1 w-1 rotate-45 bg-accent"></div>
                      <span className="font-bold text-foreground">{t.aboutApp}</span>
                    </div>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p className="text-center font-amiri text-base text-foreground">
                        {t.appName}
                      </p>
                      <p className="text-center leading-relaxed">
                        {t.aboutDescription}
                      </p>
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <div className="h-px w-6 bg-primary/20"></div>
                        <span className="text-xs text-primary">{t.version}</span>
                        <div className="h-px w-6 bg-primary/20"></div>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Footer */}
                  <div className="flex items-center justify-center gap-3 pt-4">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/30"></div>
                    <div className="h-2 w-2 rotate-45 border border-primary/30"></div>
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/30"></div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-160px)]" ref={scrollRef}>
          <div className="mx-auto max-w-3xl space-y-4 p-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                {/* Islamic Decorative Frame */}
                <div className="relative islamic-frame islamic-glow p-8 bg-gradient-to-br from-card/90 via-card/80 to-primary/5">
                  {/* Corner Decorations */}
                  <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-primary/40 rounded-tl-lg"></div>
                  <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-primary/40 rounded-tr-lg"></div>
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-primary/40 rounded-bl-lg"></div>
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-primary/40 rounded-br-lg"></div>

                  {/* Decorative Islamic Header */}
                  <div className="relative mb-6">
                    <div className="absolute -inset-6 rounded-full bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 blur-2xl animate-pulse"></div>
                    <div className="absolute -inset-3 rounded-full border border-primary/20"></div>
                    <img src={logo} alt="لۆگۆ" className="relative h-24 w-24 rounded-full shadow-2xl ring-4 ring-primary/30 ring-offset-2 ring-offset-background" />
                    {/* Crescent decorations */}
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-accent text-lg">☪</span>
                  </div>

                  {/* Decorative Stars */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-accent/60 text-xs">✦</span>
                    <span className="text-primary/60 text-sm">✧</span>
                    <span className="text-accent/80 text-base">✦</span>
                    <span className="text-primary/60 text-sm">✧</span>
                    <span className="text-accent/60 text-xs">✦</span>
                  </div>

                  {/* Bismillah with decorative frame */}
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"></div>
                    <p className="relative font-amiri text-2xl md:text-3xl text-primary drop-shadow-sm">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                  </div>

                  {/* Islamic Divider */}
                  <div className="islamic-divider mb-4">
                    <div className="h-3 w-3 rotate-45 bg-gradient-to-br from-primary to-accent shadow-sm"></div>
                  </div>

                  <h2 className="mb-2 font-amiri text-3xl md:text-4xl font-bold text-gradient-islamic">
                    {t.appName}
                  </h2>

                  {/* Subtitle */}
                  <p className="mb-6 text-sm text-muted-foreground">{t.subtitle}</p>

                  {/* Decorative Divider with Stars */}
                  <div className="mb-6 flex items-center justify-center gap-3">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent via-primary/50 to-primary/30"></div>
                    <span className="text-accent/70 text-xs">✧</span>
                    <div className="h-2.5 w-2.5 rotate-45 border-2 border-accent bg-accent/20"></div>
                    <span className="text-accent/70 text-xs">✧</span>
                    <div className="h-px w-12 bg-gradient-to-l from-transparent via-primary/50 to-primary/30"></div>
                  </div>

                  {/* Welcome Message */}
                  <div className="relative rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-card/90 to-primary/5 p-6 shadow-lg backdrop-blur-sm islamic-glow">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-card rounded-full border border-primary/20">
                      <span className="text-accent text-sm">☪</span>
                    </div>
                    <p className="mb-2 text-lg font-medium text-foreground">{t.welcomeMessage}</p>
                    <p className="text-sm text-muted-foreground">{t.welcomeSubtitle}</p>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                ref={(el) => {
                  if (el) messageRefs.current.set(message.id, el);
                }}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "flex-col"
                  }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full overflow-hidden ring-2 ring-primary/30 shadow-md">
                      <img src={logo} alt="لۆگۆ" className="h-8 w-8" />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-50 hover:opacity-100"
                      onClick={() => {
                        navigator.clipboard.writeText(message.content);
                        toast.success("کۆپی کرا!");
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <ListenButton text={message.content} language={language} />
                  </div>
                )}
                <Card
                  className={`relative px-5 py-4 shadow-lg overflow-hidden ${message.role === "user"
                    ? "max-w-[85%] bg-gradient-to-br from-primary to-primary/90 text-primary-foreground"
                    : "w-full bg-gradient-to-br from-card via-card to-primary/5 border-2 border-primary/15 islamic-glow"
                    }`}
                >
                  {/* Islamic Corner Decorations for Assistant Messages */}
                  {message.role === "assistant" && (
                    <>
                      {/* Top Left Corner */}
                      <div className="absolute top-0 left-0 w-8 h-8">
                        <svg viewBox="0 0 32 32" className="w-full h-full">
                          <path d="M0 0 L16 0 Q8 8 0 16 Z" fill="currentColor" className="text-primary/15" />
                          <path d="M0 0 L8 0 Q4 4 0 8 Z" fill="currentColor" className="text-accent/25" />
                        </svg>
                      </div>
                      {/* Top Right Corner */}
                      <div className="absolute top-0 right-0 w-8 h-8">
                        <svg viewBox="0 0 32 32" className="w-full h-full">
                          <path d="M32 0 L16 0 Q24 8 32 16 Z" fill="currentColor" className="text-primary/15" />
                          <path d="M32 0 L24 0 Q28 4 32 8 Z" fill="currentColor" className="text-accent/25" />
                        </svg>
                      </div>
                      {/* Bottom Left Corner */}
                      <div className="absolute bottom-0 left-0 w-8 h-8">
                        <svg viewBox="0 0 32 32" className="w-full h-full">
                          <path d="M0 32 L16 32 Q8 24 0 16 Z" fill="currentColor" className="text-primary/15" />
                          <path d="M0 32 L8 32 Q4 28 0 24 Z" fill="currentColor" className="text-accent/25" />
                        </svg>
                      </div>
                      {/* Bottom Right Corner */}
                      <div className="absolute bottom-0 right-0 w-8 h-8">
                        <svg viewBox="0 0 32 32" className="w-full h-full">
                          <path d="M32 32 L16 32 Q24 24 32 16 Z" fill="currentColor" className="text-primary/15" />
                          <path d="M32 32 L24 32 Q28 28 32 24 Z" fill="currentColor" className="text-accent/25" />
                        </svg>
                      </div>
                      {/* Decorative Inner Border */}
                      <div className="absolute inset-2 border border-primary/10 rounded-lg pointer-events-none" />
                    </>
                  )}
                  {/* Islamic Corner Decorations for User Messages */}
                  {message.role === "user" && (
                    <>
                      <div className="absolute top-0 left-0 w-6 h-6">
                        <svg viewBox="0 0 24 24" className="w-full h-full">
                          <path d="M0 0 L12 0 Q6 6 0 12 Z" fill="currentColor" className="text-primary-foreground/20" />
                        </svg>
                      </div>
                      <div className="absolute bottom-0 right-0 w-6 h-6">
                        <svg viewBox="0 0 24 24" className="w-full h-full">
                          <path d="M24 24 L12 24 Q18 18 24 12 Z" fill="currentColor" className="text-primary-foreground/20" />
                        </svg>
                      </div>
                    </>
                  )}
                  {message.role === "assistant" ? (
                    message.id === lastAssistantMessageId ? (
                      <TypewriterEffect
                        content={message.content}
                        fontSizeClass={fontSizeClasses[fontSize]}
                      />
                    ) : (
                      <div
                        className={`ai-response prose dark:prose-invert max-w-none ${fontSizeClasses[fontSize]}`}
                        dir="rtl"
                      >
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            a: ({ href, children }) => (
                              <a href={href} target="_self" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )
                  ) : (
                    <p
                      className={`whitespace-pre-wrap ${fontSizeClasses[fontSize]}`}
                    >
                      {message.content}
                    </p>
                  )}
                </Card>
                {message.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full overflow-hidden ring-2 ring-primary/30">
                  <img src={logo} alt="لۆگۆ" className="h-8 w-8" />
                </div>
                <Card className="bg-muted/80 px-4 py-3 border border-primary/10 backdrop-blur-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="relative border-t-2 border-primary/30 bg-gradient-to-r from-primary/10 via-card/95 to-primary/10 p-3 islamic-corner-bl islamic-corner-br islamic-glow">
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent/50 to-transparent"></div>

        {/* Decorative elements */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-40">
          <span className="text-primary text-xs">✧</span>
          <span className="text-accent text-xs">☪</span>
          <span className="text-primary text-xs">✧</span>
        </div>

        <div className="mx-auto flex max-w-3xl gap-2 pt-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={t.placeholder}
            disabled={isLoading}
            className="flex-1 border-2 border-primary/20 bg-card/90 backdrop-blur-sm focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-inner"
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg ring-2 ring-primary/20"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
