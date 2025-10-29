import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'metric';
}

export const Card: React.FC<CardProps> = ({
    children,
    className,
    padding = 'md',
    variant = 'default'
}) => {
    const paddingClasses = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
    };

    // Para cards de métricas, usar padding consistente
    const finalPadding = variant === 'metric' ? 'p-6' : paddingClasses[padding];

    return (
        <div className={cn(
            'bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/25 border border-gray-200 dark:border-gray-700',
            'transition-all duration-200 hover:shadow-md dark:hover:shadow-gray-900/40',
            'ring-1 ring-black/5 dark:ring-white/5',
            finalPadding,
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

// Componente específico para cards de métricas/estadísticas
interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode; // Acepta cualquier icono de Lucide React o SVG
    iconColor?: 'green' | 'blue' | 'red' | 'yellow' | 'purple' | 'orange' | 'gray';
    valueColor?: 'green' | 'blue' | 'red' | 'yellow' | 'purple' | 'orange' | 'gray' | 'default';
    className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    iconColor = 'blue',
    valueColor = 'default',
    className
}) => {
    const iconColorClasses = {
        green: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400',
        blue: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
        red: 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400',
        yellow: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400',
        purple: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400',
        orange: 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400',
        gray: 'bg-gray-100 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400'
    };

    const valueColorClasses = {
        green: 'text-green-600 dark:text-green-400',
        blue: 'text-blue-600 dark:text-blue-400',
        red: 'text-red-600 dark:text-red-400',
        yellow: 'text-yellow-600 dark:text-yellow-400',
        purple: 'text-purple-600 dark:text-purple-400',
        orange: 'text-orange-600 dark:text-orange-400',
        gray: 'text-gray-600 dark:text-gray-400',
        default: 'text-gray-900 dark:text-white'
    };

    return (
        <Card variant="metric" className={className}>
            <div className="flex items-center">
                <div className="flex-shrink-0">
                    <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200',
                        iconColorClasses[iconColor]
                    )}>
                        {icon}
                    </div>
                </div>
                <div className="ml-4 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-200 truncate">
                        {title}
                    </p>
                    <p className={cn(
                        'text-2xl font-semibold transition-colors duration-200 truncate',
                        valueColorClasses[valueColor]
                    )}>
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200 truncate">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
        </Card>
    );
};