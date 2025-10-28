import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
    children,
    className,
    padding = 'md'
}) => {
    const paddingClasses = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
    };

    return (
        <div className={cn(
            'bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/25 border border-gray-200 dark:border-gray-700',
            'transition-all duration-200 hover:shadow-md dark:hover:shadow-gray-900/40',
            'ring-1 ring-black/5 dark:ring-white/5',
            paddingClasses[padding],
            className
        )}>
            {children}
        </div>
    );
};

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => (
    <div className={cn(
        'border-b border-gray-200 dark:border-gray-700 pb-4 mb-4 transition-colors duration-200', 
        className
    )}>
        {children}
    </div>
);

interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => (
    <h3 className={cn(
        'text-base font-semibold text-gray-900 dark:text-white transition-colors duration-200', 
        className
    )}>
        {children}
    </h3>
);