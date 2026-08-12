import React, { useState, useEffect, useCallback, useRef } from 'react';

export interface Customer {
    id?: number | string;
    customer_name: string;
    customer_phone: string;
    feedback?: string;
}

export interface CustomerSegment {
    id: number | string;
    segment_name: string;
    total_customers: number;
    customer_list?: Customer[];
}

export const CustomerSegmentsList: React.FC = () => {
    const [segments, setSegments] = useState<CustomerSegment[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [apiError, setApiError] = useState<string | null>(null);

    // Modal States
    const [activeSegment, setActiveSegment] = useState<CustomerSegment | null>(null);
    const [customerSearch, setCustomerSearch] = useState<string>('');

    // Refs
    const abortControllerRef = useRef<AbortController | null>(null);
    const triggerBtnRef = useRef<HTMLButtonElement | null>(null);
    const modalContainerRef = useRef<HTMLDivElement | null>(null);
    const searchInputRef = useRef<HTMLInputElement | null>(null);

    // Fetch Segments with clean AbortController & unknown error handling
    const fetchSegments = useCallback(async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();

        setIsLoading(true);
        setApiError(null);

        try {
            const token = localStorage.getItem('admin_token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://slip.nexonsys.com/v/api/v1';

            const response = await fetch(`${baseUrl}/segments`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - Failed to fetch segments.`);
            }

            const data = await response.json();
            const rawSegments = Array.isArray(data)
                ? data
                : (data?.segments || data?.data || []);

            setSegments(rawSegments);
        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.name !== 'AbortError') {
                    setApiError(error.message);
                }
            } else {
                setApiError('An unexpected error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSegments();
        return () => {
            if (abortControllerRef.current) abortControllerRef.current.abort();
        };
    }, [fetchSegments]);

    // Modal Handlers
    const handleOpenModal = (segment: CustomerSegment, btnElement: HTMLButtonElement) => {
        triggerBtnRef.current = btnElement;
        setActiveSegment(segment);
        setCustomerSearch('');
    };

    const handleCloseModal = () => {
        setActiveSegment(null);
        setCustomerSearch('');
        triggerBtnRef.current?.focus();
    };

    const handleModalKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape') {
            handleCloseModal();
            return;
        }

        if (e.key === 'Tab' && modalContainerRef.current) {
            const focusables = Array.from(
                modalContainerRef.current.querySelectorAll<HTMLElement>(
                    'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
                )
            );

            if (focusables.length === 0) return;

            const firstEl = focusables[0];
            const lastEl = focusables[focusables.length - 1];

            if (e.shiftKey && document.activeElement === firstEl) {
                e.preventDefault();
                lastEl.focus();
            } else if (!e.shiftKey && document.activeElement === lastEl) {
                e.preventDefault();
                firstEl.focus();
            }
        }
    };

    // A11y Fix: Focus search input immediately when modal opens for screen reader users
    useEffect(() => {
        if (activeSegment && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [activeSegment]);

    const modalCustomers = ((): Customer[] => {
        if (!activeSegment?.customer_list) return [];
        const query = customerSearch.trim().toLowerCase();
        if (!query) return activeSegment.customer_list;

        return activeSegment.customer_list.filter((c) => {
            const nameMatch = c.customer_name?.toLowerCase().includes(query) ?? false;
            const phoneMatch = c.customer_phone?.includes(query) ?? false;
            return nameMatch || phoneMatch;
        });
    })();

    const handleSendToWhatsApp = (segmentName: string) => {
        alert(`send to whats app: ${segmentName}`);
    };

    return (
        <main className="p-4 max-w-5xl mx-auto space-y-4">
            <header className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h1 className="text-base font-bold text-slate-900">Customer Segments</h1>
                <span className="text-xs font-semibold text-slate-500">
                    Total Segments: {segments.length}
                </span>
            </header>

            <section aria-label="Segments List">
                {isLoading ? (
                    <div className="p-6 text-center text-xs font-medium text-slate-500 bg-white border rounded-lg">
                        Loading segments...
                    </div>
                ) : apiError ? (
                    <div className="p-4 text-center text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                        <span>{apiError}</span>
                        <button
                            type="button"
                            onClick={fetchSegments}
                            className="px-3 py-1 bg-red-600 text-white rounded text-xs"
                        >
                            Retry
                        </button>
                    </div>
                ) : segments.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 bg-white border rounded-lg">
                        No segments available.
                    </div>
                ) : (
                    <ul className="space-y-2" role="list">
                        {segments.map((segment) => (
                            <li
                                key={segment.id}
                                className="bg-white px-4 py-3 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between gap-4"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="font-mono text-xs text-slate-400">#{segment.id}</span>
                                    <h2 className="text-sm font-bold text-slate-800 truncate">
                                        {segment.segment_name}
                                    </h2>
                                </div>

                                <div className="flex items-center gap-4 shrink-0">
                                    <span className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-full">
                                        {segment.total_customers.toLocaleString()} Customers
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => handleSendToWhatsApp(segment.segment_name)}
                                        className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        Action
                                    </button>

                                    <button
                                        type="button"
                                        aria-haspopup="dialog"
                                        aria-label={`View customers in ${segment.segment_name}`}
                                        onClick={(e) => handleOpenModal(segment, e.currentTarget)}
                                        className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-white border border-blue-300 hover:bg-blue-50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        View
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {activeSegment && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3"
                    onClick={handleCloseModal}
                >
                    <div
                        ref={modalContainerRef}
                        role="dialog"
                        tabIndex={-1}
                        aria-modal="true"
                        aria-labelledby="modal-title"
                        onKeyDown={handleModalKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-lg max-w-lg w-full max-h-[80vh] flex flex-col border border-slate-200 shadow-xl focus:outline-none"
                    >
                        <header className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <div>
                                <h2 id="modal-title" className="text-sm font-bold text-slate-900">
                                    {activeSegment.segment_name}
                                </h2>
                                <p className="text-[11px] text-slate-500">
                                    Total: {activeSegment.total_customers} Customers
                                </p>
                            </div>
                            <button
                                type="button"
                                aria-label="Close modal"
                                onClick={handleCloseModal}
                                className="text-slate-400 hover:text-slate-600 p-1 text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                ✕
                            </button>
                        </header>

                        <div className="p-3 border-b border-slate-200 bg-slate-50">
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search customer name or phone..."
                                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                value={customerSearch}
                                onChange={(e) => setCustomerSearch(e.target.value)}
                            />
                        </div>

                        <div className="p-4 overflow-y-auto flex-1">
                            {modalCustomers.length === 0 ? (
                                <p className="text-center text-xs text-slate-500 py-6">
                                    No customer records found.
                                </p>
                            ) : (
                                <ul className="divide-y divide-slate-100" role="list">
                                    {modalCustomers.map((cust, idx) => (
                                        <li
                                            key={cust.id || idx}
                                            className="py-2.5 flex justify-between items-center text-xs"
                                        >
                                            <span className="font-semibold text-slate-800">
                                                {cust.customer_name || 'Unnamed Customer'}
                                            </span>
                                            <span className="font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                                {cust.customer_phone || 'No Phone'}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <footer className="px-4 py-2.5 border-t border-slate-200 bg-slate-50 flex justify-end">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Close
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </main>
    );
};