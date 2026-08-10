import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface Feedback {
    id: number;
    rating: string;
    comment: string | null;
    submitted_at: string;
}

interface Item {
    id: number;
    item_name: string;
    quantity: number;
    unit_price: string;
    total_price: string;
}

interface Invoice {
    id: number;
    receipt_hash: string;
    invoice_no: string;
    cashier_name: string;
    customer_name: string;
    customer_phone: string;
    payable_amount: string;
    payment_mode: string;
    created_at: string;
    items: Item[];
    feedback: Feedback | null;
}

export const AdminTransactions: React.FC = () => {
    const navigate = useNavigate();
    // Logout Handler Function
    const handleLogout = () => {
        // 1. Storage se token delete karo
        localStorage.removeItem('admin_token');

        // 2. User ko Login screen par redirect karo (replace: true taake browser back button se dashboard na khule)
        navigate('/admin/login', { replace: true });
    };
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState<string>('');
    const [ratingFilter, setRatingFilter] = useState<string>('all');

    useEffect(() => {
        async function fetchAdminInvoices() {
            try {
                const token = localStorage.getItem('admin_token');
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/invoices`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch administrative records');
                }

                const data = await response.json();
                if (data.success) {
                    setInvoices(data.invoices);
                }
            } catch (err: any) {
                setError(err.message || 'Something went wrong');
            } finally {
                setLoading(false);
            }
        }

        fetchAdminInvoices();
    }, []);

    const filteredInvoices = useMemo(() => {
        return invoices.filter((inv) => {
            const matchesSearch =
                inv.invoice_no.toLowerCase().includes(search.toLowerCase()) ||
                (inv.customer_phone && inv.customer_phone.includes(search)) ||
                (inv.customer_name && inv.customer_name.toLowerCase().includes(search.toLowerCase()));

            let matchesRating = true;
            if (ratingFilter === 'unrated') {
                matchesRating = inv.feedback === null;
            } else if (ratingFilter !== 'all') {
                matchesRating = inv.feedback?.rating === ratingFilter;
            }

            return matchesSearch && matchesRating;
        });
    }, [invoices, search, ratingFilter]);

    const renderRatingBadge = (feedback: Feedback | null) => {
        if (!feedback) {
            return (
                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-500">
                    No Feedback
                </span>
            );
        }

        const rating = feedback.rating.toLowerCase();
        switch (rating) {
            case 'best':
            case 'good':
                return (
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 capitalize">
                        {rating.replace('_', ' ')}
                    </span>
                );
            case 'fine':
                return (
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700 capitalize">
                        {rating}
                    </span>
                );
            case 'worst':
            case 'not_good':
                return (
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-rose-100 text-rose-700 capitalize">
                        {rating.replace('_', ' ')}
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 capitalize">
                        {rating}
                    </span>
                );
        }
    };

    if (loading) {
        return <div className="p-8 text-center font-medium text-slate-600">Loading Dashboard...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-rose-600">Error: {error}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header / Navbar */}
            <header className="bg-white shadow p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>

                {/* LOGOUT BUTTON */}
                <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded shadow transition"
                >
                    Logout
                </button>
            </header>

            {/* Main Content Area */}
            <main className="p-6">
                <div className="p-6 max-w-7xl mx-auto font-sans">

                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Invoices & Feedback</h1>
                            <p className="text-sm text-slate-500">Overview of generated digital receipts and customer ratings.</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <input
                                type="text"
                                placeholder="Search Invoice # or Phone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                            />

                            <select
                                value={ratingFilter}
                                onChange={(e) => setRatingFilter(e.target.value)}
                                className="px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 bg-white"
                            >
                                <option value="all">All Ratings</option>
                                <option value="best">Best</option>
                                <option value="good">Good</option>
                                <option value="fine">Fine</option>
                                <option value="not_good">Not Good</option>
                                <option value="worst">Worst</option>
                                <option value="unrated">Unrated</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
                        <table className="w-full text-left border-collapse text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-medium">
                                <tr>
                                    <th className="p-4">Invoice #</th>
                                    <th className="p-4">Date & Time</th>
                                    <th className="p-4">Customer</th>
                                    <th className="p-4">Cashier</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Feedback</th>
                                    <th className="p-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredInvoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-slate-400">
                                            No records matching criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredInvoices.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="p-4 font-semibold text-slate-800">#{inv.invoice_no}</td>
                                            <td className="p-4 text-xs">
                                                {new Date(inv.created_at).toLocaleString('en-US', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short'
                                                })}
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-slate-800">{inv.customer_name || 'N/A'}</div>
                                                <div className="text-xs text-slate-400">{inv.customer_phone}</div>
                                            </td>
                                            <td className="p-4 text-xs text-slate-600">{inv.cashier_name}</td>
                                            <td className="p-4 font-medium text-slate-800">
                                                PKR {parseFloat(inv.payable_amount).toLocaleString('en-US')}
                                            </td>
                                            <td className="p-4">{renderRatingBadge(inv.feedback)}</td>
                                            <td className="p-4 text-center">
                                                <a
                                                    href={`/v/${inv.receipt_hash}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                                                >
                                                    View Receipt
                                                </a>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};