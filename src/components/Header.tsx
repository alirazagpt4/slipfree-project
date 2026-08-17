import React from 'react';
import type { ActiveTab } from './Sidebar';

interface HeaderProps {
    activeTab: ActiveTab;
}

export const Header: React.FC<HeaderProps> = ({ activeTab }) => {
    const titles: Record<ActiveTab, string> = {
        transactions: 'Transactions',
        segments: 'Customer Segments List',
        dashboard: 'Dashboard',
        customers: 'Customers List'
    };

    return (
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shrink-0">
            <h1 className="text-lg font-bold text-slate-800 capitalize">
                {titles[activeTab]}
            </h1>
        </header>
    );
};