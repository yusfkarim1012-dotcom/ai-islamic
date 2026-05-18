import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';

interface CopyButtonProps {
    text: string;
    language: 'ku' | 'ar';
}

// Clean text function
const cleanText = (text: string): string => {
    let cleaned = text;

    // 1. Remove sources section (## المصادر or ## سەرچاوەکان and everything after)
    cleaned = cleaned.replace(/##\s*(المصادر|سەرچاوەکان|Sources|References)[\s\S]*/gi, '');

    // 2. Remove footnote references like [١], [1], [٢], etc.
    cleaned = cleaned.replace(/\[[\u0660-\u0669\u06F0-\u06F90-9]+\]/g, '');

    // 3. Remove markdown formatting but handle tables specially
    // Remove table row separators (---)
    cleaned = cleaned.replace(/\|?\s*:?-+:?\s*\|/g, '');
    // Remove table vertical bars (|)
    cleaned = cleaned.replace(/\|/g, ' ');
    // Remove other markdown
    cleaned = cleaned.replace(/[#*_`~>]/g, '');
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Links

    // 4. Handle "Preserve Quranic Harakat"
    const segments = cleaned.split(/(﴿[^﴾]+﴾)/g);

    cleaned = segments.map(segment => {
        // If segment is wrapped in Quranic brackets, keep it (but remove brackets?)
        if (segment.startsWith('﴿') && segment.endsWith('﴾')) {
            return segment.replace(/[﴿﴾]/g, '');
        }

        // For non-Quranic text: Remove Arabic diacritics/harakat (tashkeel)
        return segment.replace(/[\u064B-\u065F\u0670\u0640]/g, '');
    }).join(' ');

    // 5. Remove excessive punctuation
    cleaned = cleaned.replace(/[،,:;!?؟!\-–—]/g, ' ');
    cleaned = cleaned.replace(/[()[\]{}""«»]/g, '');

    // 6. Remove extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
};

export const ListenButton = ({ text, language }: CopyButtonProps) => {
    // Only show for Arabic language
    if (language !== 'ar') {
        return null;
    }

    const handleCopy = () => {
        const cleanedText = cleanText(text);

        if (!cleanedText || cleanedText.length < 5) {
            toast.error('النص قصير جداً');
            return;
        }

        navigator.clipboard.writeText(cleanedText);
        toast.success('تم نسخ النص (منظف)');
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-50 hover:opacity-100"
            onClick={handleCopy}
            title="نسخ (بدون مصادر/حركات)"
        >
            <FileText className="h-3.5 w-3.5" />
        </Button>
    );
};
