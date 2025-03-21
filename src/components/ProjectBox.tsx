// Portfolio  Copyright (C) 2025  LunarcatOwO
// This program comes with ABSOLUTELY NO WARRANTY.
// This is free software, and you are welcome to redistribute it
// under certain conditions.
// In accordance with Apache2.0 license as aquired from naterfute
import React, { useState, useEffect, ReactNode } from "react";

type Props = Readonly<
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
        title?: string;
        borderColor?: string;
        url?: string; 
        language: string;
        obfuscationDuration?: number; // Duration of the obfuscation effect in ms
    }
>;

const defaultClasses = 'p-8 bg-contentBackground border-[1px] border-contentBorder shadow-sm rounded-xl w-full hover:bg-gray-900 space-y-10';

// Characters used for obfuscation
const matrixChars = '01░▒▓█▄▀■□▣▢@#*%$!?;:+=-_&^~';

// Get a random character for obfuscation
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

// Function to gradually reveal content
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

const ProjectBox = ({ 
    title, 
    children, 
    className, 
    url = '', 
    language, 
    obfuscationDuration = 1000,
    ...props 
}: Props) => {
    const [revealProgress, setRevealProgress] = useState(0);
    const [isRevealing, setIsRevealing] = useState(false);
    const [originalContent, setOriginalContent] = useState<ReactNode>(children);
    const [originalTitle, setOriginalTitle] = useState<string>(title || '');
    const [originalLanguage, setOriginalLanguage] = useState<string>(language || '');
    const [obfuscatedContent, setObfuscatedContent] = useState<ReactNode>(obfuscateContent(children));
    
    // Process content when children change
    useEffect(() => {
        setOriginalContent(children);
        setOriginalTitle(title || '');
        setOriginalLanguage(language || '');
        setObfuscatedContent(obfuscateContent(children));
        
        setIsRevealing(true);
        setRevealProgress(0);
    }, [children, title, language]);
    
    // Initial loading effect
    useEffect(() => {
        if (!isRevealing) return;
        
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
    }, [isRevealing, obfuscationDuration]);
    
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
        <a {...(url && { href: url })} target={url ? '_blank' : '_self'} className='block' rel="noreferrer">
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
                {language && language !== '' && (
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs text-gray-500">Built with</span>
                        <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs">
                            {isRevealing ? 
                                processContentForDisplay(language) : 
                                language
                            }
                        </span>
                    </div>
                )}
            </div>
        </a>
    );
};

export default ProjectBox;
