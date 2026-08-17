import React from 'react';

export type ActiveTab = 'dashboard' | 'transactions' | 'segments' | 'customers';

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
    activeTab: ActiveTab;
    onTabChange: (tab: ActiveTab) => void;
    onLogout?: () => void; // Added Logout Handler
}

interface NavItem {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: (
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 00-1 1m-6 0h6" />
            </svg>
        ),
    },
    {
        id: 'transactions',
        label: 'Transactions List',
        icon: (
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
    },
    {
        id: 'segments',
        label: 'Customer Segments List',
        icon: (
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
    },
    {
        id: 'customers',
        label: 'Customers List',
        icon: (
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ),
    },
];

export const Sidebar: React.FC<SidebarProps> = ({
    isCollapsed,
    onToggle,
    activeTab,
    onTabChange,
    onLogout,
}) => {
    return (
        <aside
            aria-label="Admin Navigation Sidebar"
            className={`${isCollapsed ? 'w-16' : 'w-64'
                } bg-white border-r border-slate-200 text-slate-700 flex flex-col justify-between transition-all duration-300 ease-in-out z-20 shrink-0 h-screen select-none`}
        >
            <div>
                {/* Header / Collapse Toggle */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    {!isCollapsed && (
                        <span className="font-bold text-slate-900 text-base tracking-tight truncate">
                            Green Slip Admin
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={onToggle}
                        aria-expanded={!isCollapsed}
                        aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="p-2 space-y-1 mt-2" aria-label="Main Menu">
                    {NAV_ITEMS.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => onTabChange(item.id)}
                                aria-current={isActive ? 'page' : undefined}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isActive
                                    ? 'bg-indigo-50 text-indigo-600'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                title={item.label}
                            >
                                <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>
                                    {item.icon}
                                </span>
                                {!isCollapsed && <span className="truncate">{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Footer Profile & Logout Block */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 truncate">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                            A
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col truncate">
                                <span className="text-xs font-bold text-slate-900 truncate">Admin Account</span>
                                <span className="text-[10px] text-slate-500 font-medium truncate">System Operator</span>
                            </div>
                        )}
                    </div>

                    {!isCollapsed && onLogout && (
                        <button
                            type="button"
                            onClick={onLogout}
                            aria-label="Logout from Admin Account"
                            title="Logout"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition focus:outline-none focus:ring-2 focus:ring-rose-500"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Collapsed View Logout Option */}
                {isCollapsed && onLogout && (
                    <button
                        type="button"
                        onClick={onLogout}
                        aria-label="Logout from Admin Account"
                        title="Logout"
                        className="w-full flex justify-center items-center py-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                )}
            </div>
        </aside>
    );
};