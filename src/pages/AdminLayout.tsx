import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AdminTransactions } from './AdminTransactions';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import type { ActiveTab } from '../components/Sidebar';
import { CustomerSegmentsList } from './CustomerSegmentsList';

// 1. IMPORT ACTUAL SCHEMA FROM YOUR TYPES FILE
// import type { CustomerSegment, ApiResponse } from '../types/segment';

export const AdminLayout: React.FC = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<ActiveTab>('transactions');


    const navigate = useNavigate();

    const handleToggleSidebar = () => {
        setIsSidebarCollapsed((prev) => !prev);
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };



    return (
        <div className="flex h-screen w-full bg-slate-100 overflow-hidden font-sans">
            {/* Sidebar Component */}
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                onToggle={handleToggleSidebar}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onLogout={handleLogout}
            />

            {/* Main Content Area */}
            <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100 focus:outline-none">
                <Header activeTab={activeTab} />

                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'transactions' && <AdminTransactions />}

                    {activeTab === 'segments' && (
                        <CustomerSegmentsList

                        />
                    )}

                    {activeTab === 'dashboard' && (
                        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-sm shadow-sm">
                            Dashboard Analytics View Placeholder
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};