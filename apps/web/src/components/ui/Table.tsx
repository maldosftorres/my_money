import React from 'react';
import { cn } from '../../utils/cn';

interface TableProps {
    children: React.ReactNode;
    className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className }) => (
    <div className="overflow-auto -mx-3 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
            <table className={cn(
                'w-full divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200',
                className
            )}>
                {children}
            </table>
        </div>
    </div>
);

interface TableHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => (
    <thead className={cn(
        'bg-gray-50 dark:bg-gray-800/50 transition-colors duration-200',
        className
    )}>
        {children}
    </thead>
);

interface TableBodyProps {
    children: React.ReactNode;
    className?: string;
}

export const TableBody: React.FC<TableBodyProps> = ({ children, className }) => (
    <tbody className={cn(
        'bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200',
        className
    )}>
        {children}
    </tbody>
);

interface TableRowProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const TableRow: React.FC<TableRowProps> = ({ children, className, onClick }) => (
    <tr
        className={cn(
            'hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200',
            onClick && 'cursor-pointer hover:shadow-sm',
            className
        )}
        onClick={onClick}
    >
        {children}
    </tr>
);

interface TableHeadProps {
    children: React.ReactNode;
    className?: string;
}

export const TableHead: React.FC<TableHeadProps> = ({ children, className }) => (
    <th className={cn(
        'px-3 sm:px-6 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-200',
        className
    )}>
        {children}
    </th>
);

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
    children: React.ReactNode;
    className?: string;
}

export const TableCell: React.FC<TableCellProps> = ({ children, className, ...props }) => (
    <td className={cn(
        'px-3 sm:px-6 py-3 text-xs text-gray-900 dark:text-gray-100 transition-colors duration-200',
        className
    )} {...props}>
        {children}
    </td>
);