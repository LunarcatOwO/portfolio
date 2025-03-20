import React, { useState, useEffect, ReactNode } from "react";

type Props = Readonly<
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
        title?: string;
        borderColor?: string;
        showFlashes?: string | boolean;
        showLoadingOverlay?: boolean;
        obfuscationDuration?: number; // Duration of the obfuscation effect in ms
    }
>;

const defaultClasses = 'p-8 bg-contentBackground border-[1px] border-contentBorder shadow-sm rounded-xl';

// Characters used for obfuscation
const matrixChars = '01░▒▓█▄▀■□▣▢@#*%$!?;:+=-_&^~';

// Fix: Ensure we always return a string character
const getRandomChar = (): string => {
    return matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
};

// Function to obfuscate text content
const obfuscateContent = (content: ReactNode): ReactNode => {
    if (typeof content === 'string') {
        return content.replace(/[a-zA-Z0-9]/g, () => getRandomChar());
    } else if (React.isValidElement(content)) {
        return React.cloneElement(
            content,
            content.props,
            React.Children.map(content.props.children, obfuscateContent)
        );
    } else if (Array.isArray(content)) {
        return content.map(obfuscateContent);
    }
    return content;
};

// Function to gradually reveal content character by character
const revealContent = (
    originalText: string, 
    obfuscatedText: string, 
    progress: number
): string => {
    if (typeof originalText !== 'string' || typeof obfuscatedText !== 'string') {
        return String(originalText || '');
    }
    
    const revealPoint = Math.floor(originalText.length * progress);
    return originalText.substring(0, revealPoint) + 
           obfuscatedText.substring(revealPoint);
};

const ContentBox = ({ 
    title, 
    children, 
    className, 
    obfuscationDuration = 1000, 
    ...props 
}: Props) => {
    const [revealProgress, setRevealProgress] = useState(0);
    const [isRevealing, setIsRevealing] = useState(false);
    const [originalContent, setOriginalContent] = useState<ReactNode>(children);
    const [obfuscatedContent, setObfuscatedContent] = useState<ReactNode>(obfuscateContent(children));
    
    // Process content when children change
    useEffect(() => {
        setOriginalContent(children);
        setObfuscatedContent(obfuscateContent(children));
    }, [children]);
    
    // Initial loading effect
    useEffect(() => {
        setIsRevealing(true);
        setRevealProgress(0);
        
        // Animation timing
        const startTime = Date.now();
        
        // Animation frame for smooth transition
        const animateReveal = () => {
            const now = Date.now();
            const progress = Math.min(1, (now - startTime) / obfuscationDuration);
            
            setRevealProgress(progress);
            
            if (progress < 1) {
                requestAnimationFrame(animateReveal);
            } else {
                setIsRevealing(false);
            }
        };
        
        const animationFrame = requestAnimationFrame(animateReveal);
        
        return () => {
            cancelAnimationFrame(animationFrame);
        };
    }, [obfuscatedContent, originalContent, obfuscationDuration]);
    
    // Process text content for display during reveal
    const processContentForDisplay = (content: ReactNode): ReactNode => {
        if (!isRevealing) return content;
        
        if (typeof content === 'string') {
            // For string content, do the character-by-character reveal
            return revealContent(
                content, 
                obfuscateContent(content) as string, 
                revealProgress
            );
        } else if (React.isValidElement(content)) {
            // For React elements, clone and process their children
            return React.cloneElement(
                content,
                content.props,
                React.Children.map(content.props.children, processContentForDisplay)
            );
        } else if (Array.isArray(content)) {
            return content.map(processContentForDisplay);
        }
        
        return content;
    };
    
    return (
        <div className={`${defaultClasses} ${className || ''}`} {...props}>
            {title && (
                <h2 className={`font-extrabold mb-4 text-2xl ${isRevealing ? 'text-primary' : ''}`}>
                    {processContentForDisplay(title)}
                </h2>
            )}
            <div className={`transition-opacity duration-300 ${isRevealing ? 'text-accent' : ''}`}>
                {typeof children === 'string' ? 
                    processContentForDisplay(children) : 
                    (isRevealing ? processContentForDisplay(children) : children)
                }
            </div>
        </div>
    );
};

export default ContentBox;
