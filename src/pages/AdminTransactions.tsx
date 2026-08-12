import React, { useState, useEffect, useMemo, useCallback } from 'react';

interface Feedback {
    id: number;
    rating: string;
    comment: string | null;
    submitted_at: string;
}

interface Item {
    id: number;
    invoice_id: number;
    product_name: string;
    color: string | null;
    size: string | null;
    item_name: string;
    quantity: number;
    unit_price: string;
    gst_percent: string;
    total_price: string;
}

interface Invoice {
    id: number;
    receipt_hash: string;
    invoice_no: string;
    fbr_invoice_no?: string | null;
    idempotency_key?: string;
    store_id?: number;
    shop_name?: string;
    shop_address?: string | null;
    shop_phone?: string | null;
    cashier_name: string;
    customer_name: string;
    customer_phone: string;
    price_excl_tax?: string;
    total_amount?: string;
    discount?: string;
    gst_amount?: string;
    pos_fee?: string;
    payable_amount: string;
    payment_mode: string;
    created_at: string;
    items: Item[];
    feedback: Feedback | null;
}

type SortOption = 'latest' | 'oldest' | 'amount_high' | 'amount_low';



export const AdminTransactions: React.FC = () => {
    // const [modalHash, setModalHash] = useState<string | null>(null);
    const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);

    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);



    // Filter States
    const [search, setSearch] = useState<string>('');
    const [ratingFilter, setRatingFilter] = useState<string>('all');
    const [shopFilter, setShopFilter] = useState<string>('all');
    const [colorFilter, setColorFilter] = useState<string>('all');
    const [sizeFilter, setSizeFilter] = useState<string>('all');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [sortBy, setSortBy] = useState<SortOption>('latest');

    // Customer Segment States
    const [segmentName, setSegmentName] = useState<string>('');
    const [isSaving, setIsSaving] = useState<boolean>(false);

    // expanded ids
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

    const toggleExpand = (id: number) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

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

                if (!response.ok) throw new Error('Failed to fetch transaction records');

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



    useEffect(() => {
        if (!activeInvoice) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setActiveInvoice(null);
            }
        };

        // Modal open hone par background page scroll band karo
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [activeInvoice]);

    const uniqueShops = useMemo(() => {
        const shops = invoices.map(inv => inv.shop_name).filter((name): name is string => Boolean(name));
        return Array.from(new Set(shops));
    }, [invoices]);

    const uniqueColors = useMemo(() => {
        const colors = invoices.flatMap(inv => inv.items.map(item => item.color)).filter((c): c is string => Boolean(c));
        return Array.from(new Set(colors));
    }, [invoices]);

    const uniqueSizes = useMemo(() => {
        const sizes = invoices.flatMap(inv => inv.items.map(item => item.size)).filter((s): s is string => Boolean(s));
        return Array.from(new Set(sizes));
    }, [invoices]);

    const processedInvoices = useMemo(() => {
        const filtered = invoices.filter((inv) => {
            const matchesSearch =
                search.trim() === '' ||
                inv.invoice_no.toLowerCase().includes(search.toLowerCase()) ||
                (inv.customer_phone && inv.customer_phone.includes(search)) ||
                (inv.customer_name && inv.customer_name.toLowerCase().includes(search.toLowerCase())) ||
                inv.items.some(item => item.item_name.toLowerCase().includes(search.toLowerCase()));

            let matchesRating = true;
            if (ratingFilter === 'unrated') matchesRating = inv.feedback === null;
            else if (ratingFilter !== 'all') matchesRating = inv.feedback?.rating === ratingFilter;

            let matchesShop = shopFilter === 'all' || inv.shop_name === shopFilter;
            let matchesColor = colorFilter === 'all' || inv.items.some(item => item.color === colorFilter);
            let matchesSize = sizeFilter === 'all' || inv.items.some(item => item.size === sizeFilter);

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

            return matchesSearch && matchesRating && matchesShop && matchesColor && matchesSize && matchesDateRange;
        });

        return filtered.sort((a, b) => {
            if (sortBy === 'latest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            if (sortBy === 'amount_high') return parseFloat(b.payable_amount) - parseFloat(a.payable_amount);
            if (sortBy === 'amount_low') return parseFloat(a.payable_amount) - parseFloat(b.payable_amount);
            return 0;
        });
    }, [invoices, search, ratingFilter, shopFilter, colorFilter, sizeFilter, startDate, endDate, sortBy]);

    const resetFilters = () => {
        setSearch('');
        setRatingFilter('all');
        setShopFilter('all');
        setColorFilter('all');
        setSizeFilter('all');
        setStartDate('');
        setEndDate('');
        setSortBy('latest');
    };

    const renderRatingBadge = (feedback: Feedback | null) => {
        if (!feedback) {
            return <span className="px-2 py-0.5 text-xs font-medium rounded bg-slate-100 text-slate-500">Unrated</span>;
        }
        const rating = feedback.rating.toLowerCase();
        const styles: Record<string, string> = {
            best: 'bg-emerald-100 text-emerald-800',
            good: 'bg-emerald-100 text-emerald-700',
            fine: 'bg-amber-100 text-amber-800',
            not_good: 'bg-rose-100 text-rose-700',
            worst: 'bg-rose-100 text-rose-800'
        };
        return (
            <span className={`px-2 py-0.5 text-xs font-semibold rounded capitalize ${styles[rating] || 'bg-slate-100 text-slate-700'}`}>
                {rating.replace('_', ' ')}
            </span>
        );
    };

    const handleSaveSegment = async () => {
        if (!segmentName.trim()) {
            alert("Pehle segment ka naam likhein (e.g. Black 48 List)!");
            return;
        }

        const customerMap = new Map<string, { customer_name: string; customer_phone: string; feedback: string }>();

        processedInvoices.forEach(inv => {
            const phone = inv.customer_phone;

            if (phone && !customerMap.has(phone)) {
                customerMap.set(phone, {
                    customer_name: inv.customer_name || 'Walk-In Customer',
                    customer_phone: phone,
                    feedback: inv.feedback?.rating || 'Unrated'
                });
            }
        });

        const uniqueCustomers = Array.from(customerMap.values());

        if (uniqueCustomers.length === 0) {
            alert("Is active filter ke mutabiq koi valid customer phone nahi mila!");
            return;
        }

        try {
            setIsSaving(true);
            const token = localStorage.getItem('admin_token');

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/segments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    segment_name: segmentName.trim(),
                    filter_criteria: {
                        color: colorFilter !== 'all' ? colorFilter : null,
                        size: sizeFilter !== 'all' ? sizeFilter : null,
                        shop: shopFilter !== 'all' ? shopFilter : null,
                        rating: ratingFilter !== 'all' ? ratingFilter : null
                    },
                    customer_list: uniqueCustomers
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert(`Success! Segment "${segmentName}" save ho gaya hai. Total unique customers: ${uniqueCustomers.length}`);
                setSegmentName('');
            } else {
                alert(`Error: ${data.message || 'Segment save nahi ho saka.'}`);
            }
        } catch (err) {
            console.error('Error saving segment:', err);
            alert('Server connection error.');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePrint = useCallback(() => {
        window.print();
    }, []);

    if (loading) return <div className="p-8 text-center font-medium text-slate-600">Loading Dashboard...</div>;
    if (error) return <div className="p-8 text-center text-rose-600">Error: {error}</div>;




    return (
        <div className="w-full">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col gap-3">
                <div className="flex justify-between items-center border-b pb-2">
                    <h2 className="font-semibold text-slate-700 text-xs uppercase tracking-wider">Filters & Controls</h2>

                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Segment Name (e.g., Black 48 List)..."
                            value={segmentName}
                            onChange={(e) => setSegmentName(e.target.value)}
                            className="px-3 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 w-56"
                        />
                        <button
                            onClick={handleSaveSegment}
                            disabled={isSaving}
                            className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded shadow-sm transition disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save Segment'}
                        </button>
                        {(search || startDate || endDate || ratingFilter !== 'all' || shopFilter !== 'all' || colorFilter !== 'all' || sizeFilter !== 'all') && (
                            <button onClick={resetFilters} className="text-xs font-semibold text-rose-600 hover:underline ml-2">
                                Reset Filters
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-3">
                    <div className="lg:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Search</label>
                        <input
                            type="text"
                            placeholder="Invoice #, Customer, Phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-800"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">From Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">To Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Shop</label>
                        <select value={shopFilter} onChange={(e) => setShopFilter(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white">
                            <option value="all">All Shops</option>
                            {uniqueShops.map(shop => <option key={shop} value={shop}>{shop}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Color</label>
                        <select value={colorFilter} onChange={(e) => setColorFilter(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white">
                            <option value="all">All Colors</option>
                            {uniqueColors.map(color => <option key={color} value={color}>{color}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Size</label>
                        <select value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white">
                            <option value="all">All Sizes</option>
                            {uniqueSizes.map(size => <option key={size} value={size}>{size}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Rating</label>
                        <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white">
                            <option value="all">All Ratings</option>
                            <option value="best">Best</option>
                            <option value="good">Good</option>
                            <option value="fine">Fine</option>
                            <option value="not_good">Not Good</option>
                            <option value="worst">Worst</option>
                            <option value="unrated">Unrated</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Sort By</label>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white">
                            <option value="latest">Latest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="amount_high">Highest Amount</option>
                            <option value="amount_low">Lowest Amount</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {processedInvoices.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
                        No transaction records matched your active filters.
                    </div>
                ) : (
                    processedInvoices.map((inv) => (
                        <div key={inv.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all overflow-hidden">
                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 items-center bg-white border-b border-slate-100">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-slate-900 text-sm">#{inv.invoice_no}</span>
                                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                                            {inv.shop_name || 'HeadOffice'}
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-slate-400 mt-0.5">
                                        <span className="font-medium text-slate-500">Date:</span> {new Date(inv.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    <div className="text-xs font-medium text-slate-800">
                                        <span className="text-slate-400 font-normal">Customer:</span> {inv.customer_name || 'Walk-in'}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        <span className="text-slate-400 font-normal">Ph:</span> {inv.customer_phone || 'N/A'}
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    <div className="text-xs text-slate-600">
                                        <span className="text-slate-400">Cashier:</span> <span className="font-medium text-slate-800">{inv.cashier_name}</span>
                                    </div>
                                    <div className="text-xs text-slate-600">
                                        <span className="text-slate-400">Mode:</span> <span className="font-medium text-slate-800">{inv.payment_mode}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col ">
                                    <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Invoice Total</span>
                                    <span className="text-sm font-bold text-slate-900">
                                        {parseFloat(inv.payable_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>

                                <div className="flex flex-col ">
                                    <div>{renderRatingBadge(inv.feedback)}</div>
                                    <div className="text-[11px] text-slate-400">{inv.items.length} item(s) purchased</div>
                                </div>



                                <div className="flex sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setActiveInvoice(inv)}
                                        className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        View Receipt
                                    </button>
                                </div>
                            </div>

                            <div className="bg-slate-50/50 p-4">
                                <button
                                    onClick={() => toggleExpand(inv.id)}
                                    className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 mb-2 uppercase tracking-wide hover:text-slate-900"
                                >
                                    <span>{expandedIds.has(inv.id) ? '▲' : '▼'}</span>
                                    Purchased Item Line Details ({inv.items.length})
                                </button>
                                {expandedIds.has(inv.id) && (
                                    <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                                        <table className="w-full text-left text-xs text-slate-600 border-collapse">
                                            <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold">
                                                <tr>
                                                    <th className="p-2.5">Item Description</th>
                                                    <th className="p-2.5">Color</th>
                                                    <th className="p-2.5">Size</th>
                                                    <th className="p-2.5 text-center">Qty</th>
                                                    <th className="p-2.5 text-right">Unit Price</th>
                                                    <th className="p-2.5 text-right">GST %</th>
                                                    <th className="p-2.5 text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {inv.items.map((item) => (
                                                    <tr key={item.id} className="hover:bg-slate-50">
                                                        <td className="p-2.5 font-medium text-slate-800">{item.item_name}</td>
                                                        <td className="p-2.5"><span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[11px]">{item.color || 'N/A'}</span></td>
                                                        <td className="p-2.5"><span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[11px]">{item.size || 'N/A'}</span></td>
                                                        <td className="p-2.5 text-center font-semibold text-slate-800">{item.quantity}</td>
                                                        <td className="p-2.5 text-right">{parseFloat(item.unit_price).toFixed(2)}</td>
                                                        <td className="p-2.5 text-right text-slate-500">{item.gst_percent}%</td>
                                                        <td className="p-2.5 text-right font-semibold text-slate-800">{parseFloat(item.total_price).toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                <div className="flex justify-end gap-6 mt-2.5 text-xs text-slate-500 pr-1">
                                    {inv.price_excl_tax && <div>Excl. Tax: <span className="font-semibold text-slate-700">{inv.price_excl_tax}</span></div>}
                                    {inv.gst_amount && <div>GST Tax: <span className="font-semibold text-slate-700">{inv.gst_amount}</span></div>}
                                    {inv.discount && <div>Discount: <span className="font-semibold text-emerald-600">-{inv.discount}</span></div>}
                                </div>
                            </div>


                            {activeInvoice && (
                                <div
                                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:p-0"
                                    role="dialog"
                                    aria-modal="true"
                                    aria-labelledby="modal-receipt-title"
                                    onClick={() => setActiveInvoice(null)} // Outside click closes popup
                                >
                                    {/* Modal Content Box */}
                                    <div
                                        className="bg-white rounded-xl shadow-2xl relative w-full max-w-[420px] max-h-[90vh] flex flex-col overflow-hidden print:max-h-none print:shadow-none print:w-[80mm]"
                                        onClick={(e) => e.stopPropagation()} // Prevent inside clicks from closing modal
                                    >
                                        {/* Header Controls (Screen Only) */}
                                        <div className="p-3 bg-slate-100 border-b border-slate-200 flex justify-between items-center print:hidden">
                                            <button
                                                type="button"
                                                onClick={handlePrint}
                                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-md shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                Print Thermal Slip
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveInvoice(null)}
                                                aria-label="Close receipt view"
                                                className="w-7 h-7 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-full flex items-center justify-center transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <span aria-hidden="true" className="text-lg leading-none">&times;</span>
                                            </button>
                                        </div>

                                        {/* Thermal Receipt Payload Body */}
                                        <div id="printable-receipt-area" className="p-6 overflow-y-auto font-mono text-xs text-slate-900 bg-white leading-tight">
                                            {/* Shop Title */}
                                            <div className="text-center mb-4">
                                                <h2 id="modal-receipt-title" className="font-bold text-sm uppercase text-slate-900">
                                                    {activeInvoice.shop_name || 'STORE RECEIPT'}
                                                </h2>
                                                {activeInvoice.shop_address && <p className="text-[10px] text-slate-500 mt-0.5">{activeInvoice.shop_address}</p>}
                                                {activeInvoice.shop_phone && <p className="text-[10px] text-slate-500">Ph: {activeInvoice.shop_phone}</p>}
                                            </div>

                                            {/* Meta Information */}
                                            <div className="border-b border-dashed border-slate-400 pb-2 mb-3 space-y-1">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Invoice:</span>
                                                    <span className="font-bold">{activeInvoice.invoice_no}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Date:</span>
                                                    <span>{new Date(activeInvoice.created_at).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Customer:</span>
                                                    <span>{activeInvoice.customer_name || 'Walk-In'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Cashier:</span>
                                                    <span>{activeInvoice.cashier_name}</span>
                                                </div>
                                            </div>

                                            {/* Items List Table */}
                                            <table className="w-full text-left mb-3">
                                                <thead>
                                                    <tr className="border-b border-slate-400 text-[10px] uppercase">
                                                        <th className="py-1">Item</th>
                                                        <th className="py-1 text-center">Qty</th>
                                                        <th className="py-1 text-right">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {activeInvoice.items.map((item) => (
                                                        <tr key={item.id}>
                                                            <td className="py-1.5 pr-1 align-top">
                                                                <div className="font-medium text-slate-900">{item.item_name}</div>
                                                                {(item.color || item.size) && (
                                                                    <div className="text-[9px] text-slate-400">
                                                                        {item.color && `Color: ${item.color}`} {item.size && `| Size: ${item.size}`}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="py-1.5 text-center align-top text-slate-700">{item.quantity}</td>
                                                            <td className="py-1.5 text-right align-top font-medium text-slate-900">
                                                                {Number(item.total_price).toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>

                                            {/* Totals Calculation */}
                                            <div className="border-t border-dashed border-slate-400 pt-2 space-y-1 text-right">
                                                {activeInvoice.price_excl_tax !== undefined && (
                                                    <div className="flex justify-between text-slate-500">
                                                        <span>Subtotal:</span>
                                                        <span>{Number(activeInvoice.price_excl_tax).toFixed(2)}</span>
                                                    </div>
                                                )}
                                                {activeInvoice.gst_amount !== undefined && (
                                                    <div className="flex justify-between text-slate-500">
                                                        <span>Tax (GST):</span>
                                                        <span>{Number(activeInvoice.gst_amount).toFixed(2)}</span>
                                                    </div>
                                                )}

                                                <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-400 pt-1 mt-1">
                                                    <span>TOTAL:</span>
                                                    <span>{Number(activeInvoice.payable_amount).toFixed(2)}</span>
                                                </div>
                                            </div>

                                            <div className="mt-6 text-center text-[10px] text-slate-400 uppercase tracking-widest">
                                                Thank You For Shopping!
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};