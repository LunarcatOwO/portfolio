import React from "react";

type Props = Readonly<
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
        title?: string;
        borderColor?: string;
        showFlashes?: string | boolean;
        showLoadingOverlay?: boolean;
    }
>;
const defaultClasses = 'p-8 bg-contentBackground border-[1px] border-contentBorder shadow-sm rounded-xl';

const ContentBox = ({ title, children, className, ...props }: Props) => (
    
    <div className={`${defaultClasses} ${className || ''}`} {...props}>
        {title && <h2 className={`font-extrabold mb-4 text-2xl`}>{title}</h2>}
        <div>
            {children}
        </div>
    </div>
);

export default ContentBox;
