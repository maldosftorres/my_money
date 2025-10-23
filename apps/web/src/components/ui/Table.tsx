import React from 'react';
import { cn } from '../../utils/cn';

interface TableProps {
    children: React.ReactNode;
    className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className }) => (
    <div className="overflow-x-auto">
        <table className={cn('min-w-full divide-y divide-gray-200', className)}>
            {children}
        </table>
    </div>
);

interface TableHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => (
    <thead className={cn('bg-gray-50', className)}>
        {children}
    </thead>
);

interface TableBodyProps {
    children: React.ReactNode;
    className?: string;
}

export const TableBody: React.FC<TableBodyProps> = ({ children, className }) => (
    <tbody className={cn('bg-white divide-y divide-gray-200', className)}>
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
            'hover:bg-gray-50',
            onClick && 'cursor-pointer',
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
        'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
        className
    )}>
        {children}
    </th>
);

interface TableCellProps {
    children: React.ReactNode;
    className?: string;
}

export const TableCell: React.FC<TableCellProps> = ({ children, className }) => (
    <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-900', className)}>
        {children}
    </td>
);