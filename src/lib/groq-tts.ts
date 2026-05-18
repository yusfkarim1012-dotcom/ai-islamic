// Text-to-Speech using Browser's Web Speech API
// Falls back to Arabic voice if available, otherwise uses default

export interface TTSOptions {
    text: string;
    lang?: string;
}

const MAX_TTS_CHARS = 3500;

// Clean text for TTS - remove diacritics, punctuation, sources, etc.
const cleanTextForTTS = (text: string): string => {
    let cleaned = text;

    // Remove sources section
    cleaned = cleaned.replace(/##\s*(المصادر|سەرچاوەکان|Sources|References)[\s\S]*/gi, '');

    // Remove footnote references like [١], [1], [٢], etc.
    cleaned = cleaned.replace(/\[[\u0660-\u0669\u06F0-\u06F90-9]+\]/g, '');

    // Remove Arabic diacritics/harakat (tashkeel)
    cleaned = cleaned.replace(/[\u064B-\u065F\u0670\u0640]/g, '');

    // Remove Quran brackets ﴿ ﴾
    cleaned = cleaned.replace(/[﴿﴾]/g, '');

    // Remove markdown formatting
    cleaned = cleaned.replace(/[#*_`~>]/g, '');
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // Remove excessive punctuation
    cleaned = cleaned.replace(/[،,:;!?؟!\-–—]/g, ' ');
    cleaned = cleaned.replace(/[()[\]{}""«»]/g, '');

    // Remove extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    // Limit to MAX_TTS_CHARS
    if (cleaned.length > MAX_TTS_CHARS) {
        const cutText = cleaned.substring(0, MAX_TTS_CHARS);
        const lastPeriod = cutText.lastIndexOf('.');
        if (lastPeriod > MAX_TTS_CHARS * 0.8) {
            cleaned = cutText.substring(0, lastPeriod + 1);
        } else {
            cleaned = cutText;
        }
    }

    return cleaned;
};

// Find best Arabic voice
const getArabicVoice = (): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();

    // Try to find an Arabic voice
    const arabicVoice = voices.find(v =>
        v.lang.startsWith('ar') ||
        v.name.toLowerCase().includes('arabic') ||
        v.name.includes('عربي')
    );

    return arabicVoice || null;
};

export const speakText = (options: TTSOptions): SpeechSynthesisUtterance | null => {
    const { text, lang = 'ar-SA' } = options;

    if (!('speechSynthesis' in window)) {
        console.error('Web Speech API not supported');
        return null;
    }

    const cleanedText = cleanTextForTTS(text);

    if (!cleanedText || cleanedText.length < 10) {
        return null;
    }

    console.log(`🔊 TTS: Original ${text.length} chars -> Cleaned ${cleanedText.length} chars`);

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1;

    // Wait for voices to load and get Arabic voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
        const arabicVoice = getArabicVoice();
        if (arabicVoice) {
            utterance.voice = arabicVoice;
        }
    }

    window.speechSynthesis.speak(utterance);
    return utterance;
};

export const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
};

export const isSpeaking = (): boolean => {
    if ('speechSynthesis' in window) {
        return window.speechSynthesis.speaking;
    }
    return false;
};
