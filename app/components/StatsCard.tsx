import React from 'react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: {
        value: number;
        label: string;
        isPositive: boolean;
    };
    className?: string;
}

export default function StatsCard({ title, value, icon, trend, className = '' }: StatsCardProps) {
    return (
        <div className={`bg-card border border-border rounded-xl p-6 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-400">{title}</h3>
                {icon && <div className="text-primary-400">{icon}</div>}
            </div>

            <div className="flex items-end justify-between">
                <div className="text-2xl font-bold text-white">{value}</div>

                {trend && (
                    <div className={`flex items-center text-sm ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
                        <span className="ml-1 text-gray-500">{trend.label}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
