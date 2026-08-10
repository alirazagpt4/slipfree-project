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
    shop_name?: string;
    created_at: string;
    items: Item[];
    feedback: Feedback | null;
}

type SortColumn = 'invoice_no' | 'created_at' | 'customer_name' | 'cashier_name' | 'payable_amount' | 'rating' | 'shop_name';
type SortOrder = 'asc' | 'desc';

export const AdminTransactions: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        navigate('/admin/login', { replace: true });
    };

    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Filters State
    const [search, setSearch] = useState<string>('');
    const [ratingFilter, setRatingFilter] = useState<string>('all');
    const [shopFilter, setShopFilter] = useState<string>('all');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    // Sorting State
    const [sortColumn, setSortColumn] = useState<SortColumn>('created_at');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

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
                    setInvoices(data.invoices || []);
                }
            } catch (err: any) {
                setError(err.message || 'Something went wrong');
            } finally {
                setLoading(false);
            }
        }

        fetchAdminInvoices();
    }, []);

    const uniqueShops = useMemo(() => {
        const shops = invoices.map((inv) => inv.shop_name).filter((name): name is string => Boolean(name));
        return Array.from(new Set(shops));
    }, [invoices]);

    // Column Sort Click Handler
    const handleSort = (column: SortColumn) => {
        if (sortColumn === column) {
            setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortColumn(column);
            setSortOrder('asc');
        }
    };

    // Filter & Sort Pipeline
    const processedInvoices = useMemo(() => {
        // 1. Filtering
        const filtered = invoices.filter((inv) => {
            const matchesSearch =
                search.trim() === '' ||
                inv.invoice_no.toLowerCase().includes(search.toLowerCase()) ||
                (inv.customer_phone && inv.customer_phone.includes(search)) ||
                (inv.customer_name && inv.customer_name.toLowerCase().includes(search.toLowerCase()));

            let matchesRating = true;
            if (ratingFilter === 'unrated') {
                matchesRating = inv.feedback === null;
            } else if (ratingFilter !== 'all') {
                matchesRating = inv.feedback?.rating === ratingFilter;
            }

            let matchesShop = true;
            if (shopFilter !== 'all') {
                matchesShop = inv.shop_name === shopFilter;
            }

            let matchesDateRange = true;
            const invDate = new Date(inv.created_at).getTime();

            if (startDate) {
                const start = new Date(startDate).setHours(0, 0, 0, 0);
                if (invDate < start) matchesDateRange = false;
            }

            if (endDate && matchesDateRange) {
                const end = new Date(endDate).setHours(23, 59, 59, 999);
                if (invDate > end) matchesDateRange = false;
            }

            return matchesSearch && matchesRating && matchesShop && matchesDateRange;
        });

        // 2. Sorting Logic
        return filtered.sort((a, b) => {
            let valA: any = '';
            let valB: any = '';

            switch (sortColumn) {
                case 'invoice_no':
                    valA = parseInt(a.invoice_no, 10) || 0;
                    valB = parseInt(b.invoice_no, 10) || 0;
                    break;
                case 'created_at':
                    valA = new Date(a.created_at).getTime();
                    valB = new Date(b.created_at).getTime();
                    break;
                case 'customer_name':
                    valA = (a.customer_name || '').toLowerCase();
                    valB = (b.customer_name || '').toLowerCase();
                    break;
                case 'cashier_name':
                    valA = (a.cashier_name || '').toLowerCase();
                    valB = (b.cashier_name || '').toLowerCase();
                    break;
                case 'payable_amount':
                    valA = parseFloat(a.payable_amount) || 0;
                    valB = parseFloat(b.payable_amount) || 0;
                    break;
                case 'shop_name':
                    valA = (a.shop_name || '').toLowerCase();
                    valB = (b.shop_name || '').toLowerCase();
                    break;
                case 'rating':
                    valA = a.feedback?.rating || '';
                    valB = b.feedback?.rating || '';
                    break;
                default:
                    return 0;
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [invoices, search, ratingFilter, shopFilter, startDate, endDate, sortColumn, sortOrder]);

    const resetFilters = () => {
        setSearch('');
        setRatingFilter('all');
        setShopFilter('all');
        setStartDate('');
        setEndDate('');
        setSortColumn('created_at');
        setSortOrder('desc');
    };

    const renderSortIndicator = (column: SortColumn) => {
        if (sortColumn !== column) {
            return <span className="text-slate-300 ml-1">↕</span>;
        }
        return <span className="text-slate-800 ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>;
    };

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
            <header className="bg-white shadow p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
                <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded shadow transition"
                >
                    Logout
                </button>
            </header>

            <main className="p-6">
                <div className="p-6 max-w-7xl mx-auto font-sans">
                    <div className="flex flex-col gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Invoices & Feedback</h1>
                            <p className="text-sm text-slate-500">Overview of generated digital receipts and customer ratings.</p>
                        </div>

                        {/* FILTERS TOOLBAR */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-end gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Search</label>
                                <input
                                    type="text"
                                    placeholder="Search Invoice # or Phone..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 text-slate-700"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 text-slate-700"
                                />
                            </div>

                            {uniqueShops.length > 0 && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Shop Name</label>
                                    <select
                                        value={shopFilter}
                                        onChange={(e) => setShopFilter(e.target.value)}
                                        className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 bg-white text-slate-700"
                                    >
                                        <option value="all">All Shops</option>
                                        {uniqueShops.map((shop) => (
                                            <option key={shop} value={shop}>
                                                {shop}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Rating</label>
                                <select
                                    value={ratingFilter}
                                    onChange={(e) => setRatingFilter(e.target.value)}
                                    className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 bg-white text-slate-700"
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

                            {(search || startDate || endDate || ratingFilter !== 'all' || shopFilter !== 'all') && (
                                <button
                                    onClick={resetFilters}
                                    className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline"
                                >
                                    Reset Filters
                                </button>
                            )}
                        </div>
                    </div>

                    {/* TABLE DISPLAY WITH SORTABLE HEADERS */}
                    <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
                        <table className="w-full text-left border-collapse text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-medium select-none">
                                <tr>
                                    <th
                                        onClick={() => handleSort('invoice_no')}
                                        className="p-4 cursor-pointer hover:bg-slate-100 transition-colors"
                                    >
                                        Invoice # {renderSortIndicator('invoice_no')}
                                    </th>
                                    <th
                                        onClick={() => handleSort('created_at')}
                                        className="p-4 cursor-pointer hover:bg-slate-100 transition-colors"
                                    >
                                        Date & Time {renderSortIndicator('created_at')}
                                    </th>
                                    <th
                                        onClick={() => handleSort('customer_name')}
                                        className="p-4 cursor-pointer hover:bg-slate-100 transition-colors"
                                    >
                                        Customer {renderSortIndicator('customer_name')}
                                    </th>
                                    <th
                                        onClick={() => handleSort('cashier_name')}
                                        className="p-4 cursor-pointer hover:bg-slate-100 transition-colors"
                                    >
                                        Cashier {renderSortIndicator('cashier_name')}
                                    </th>
                                    <th
                                        onClick={() => handleSort('shop_name')}
                                        className="p-4 cursor-pointer hover:bg-slate-100 transition-colors">
                                        Shop {renderSortIndicator('shop_name')}
                                    </th>
                                    <th
                                        onClick={() => handleSort('payable_amount')}
                                        className="p-4 cursor-pointer hover:bg-slate-100 transition-colors"
                                    >
                                        Amount {renderSortIndicator('payable_amount')}
                                    </th>
                                    <th
                                        onClick={() => handleSort('rating')}
                                        className="p-4 cursor-pointer hover:bg-slate-100 transition-colors"
                                    >
                                        Feedback {renderSortIndicator('rating')}
                                    </th>
                                    <th className="p-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {processedInvoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-slate-400">
                                            No records matching criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    processedInvoices.map((inv) => (
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
                                            <td className="p-4 text-xs text-slate-600">{inv.shop_name}</td>
                                            <td className="p-4 font-medium text-slate-800">
                                                {parseFloat(inv.payable_amount).toLocaleString('en-US')}
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