import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>((
    { label, error, helperText, className, ...props },
    ref
) => {
    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                className={cn(
                    'block w-full rounded-md shadow-sm transition-all duration-200 sm:text-xs',
                    'border-gray-300 dark:border-gray-500',
                    'bg-white dark:bg-gray-700',
                    'text-gray-900 dark:text-white',
                    'placeholder-gray-400 dark:placeholder-gray-300',
                    'focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-1',
                    'hover:border-gray-400 dark:hover:border-gray-400',
                    error && 'border-red-300 dark:border-red-500 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500 dark:focus:ring-red-400',
                    className
                )}
                {...props}
            />
            {error && (
                <p className="text-xs text-red-600 dark:text-red-400 transition-colors duration-200">{error}</p>
            )}
            {helperText && !error && (
                <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">{helperText}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';