import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TypewriterEffectProps {
    content: string;
    fontSizeClass: string;
}

export const TypewriterEffect = ({ content, fontSizeClass }: TypewriterEffectProps) => {
    const [displayedContent, setDisplayedContent] = useState('');
    const [isCompleted, setIsCompleted] = useState(false);
    const indexRef = useRef(0);

    useEffect(() => {
        // If content hasn't changed, do nothing
        if (displayedContent === content) {
            setIsCompleted(true);
            return;
        }

        const intervalId = setInterval(() => {
            if (indexRef.current < content.length) {
                setDisplayedContent((prev) => prev + content.charAt(indexRef.current));
                indexRef.current += 1;
            } else {
                setIsCompleted(true);
                clearInterval(intervalId);
            }
        }, 15); // Adjust speed here (ms)

        return () => clearInterval(intervalId);
    }, [content]);

    // Common components configuration for ReactMarkdown
    const markdownComponents = {
        a: ({ href, children }: any) => (
            <a
                href={href}
                target="_self"
                rel="noopener noreferrer"
                className="text-primary underline hover:text-primary/80"
            >
                {children}
            </a>
        ),
    };

    return (
        <div className={`ai-response prose dark:prose-invert max-w-none ${fontSizeClass}`} dir="rtl">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
            >
                {isCompleted ? content : displayedContent + '▍'}
            </ReactMarkdown>
        </div>
    );
};
