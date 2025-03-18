import React from "react";

type Props = Readonly<
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
        title?: string;
        borderColor?: string;
        url?: string; 
        language: string;
    }
>;

const defaultClasses = 'p-8 bg-contentBackground border-[1px] border-contentBorder shadow-sm rounded-xl w-full hover:bg-gray-900 space-y-10';

const ProjectBox = ({ title, children, className, url = '', language, ...props }: Props) => (
    <a {...(url && { href: url })} target={url ? '_blank' : '_self'} className='block' rel="noreferrer">
        <div className={`${defaultClasses} ${className || ''}`} {...props}>
            {title && (
                <h2 className={`font-extrabold mb-4 text-2xl`}>
                    {title}
                </h2>
            )}
            <div>
                {children}
            </div>
            {language && language !== '' && (
                <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs text-gray-500">Built with</span>
                    <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs">
                        {language}
                    </span>
                </div>
            )}
        </div>
    </a>
);

export default ProjectBox;
