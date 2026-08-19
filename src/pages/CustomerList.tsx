import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

export interface Customer {
    id?: string | number;
    name: string;
    phone: string;
    email?: string;
    city?: string;
    created_at?: string;
}

export const CustomerList: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [apiError, setApiError] = useState<string | null>(null);

    // Track selected items using standard phone/ID composite keys
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

    const abortControllerRef = useRef<AbortController | null>(null);
    const itemsPerPage = 10;

    const fetchCustomers = useCallback(async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();

        setIsLoading(true);
        setApiError(null);

        try {
            const token = localStorage.getItem('admin_token');
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://slip.nexonsys.com/api/v1';

            const response = await fetch(`${baseUrl}/customers/customers-list`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - Failed to fetch customers.`);
            }

            const data = await response.json();
            const rawCustomers: Customer[] = Array.isArray(data)
                ? data
                : (data?.customers || data?.data || []);

            setCustomers(rawCustomers);

        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.name !== 'AbortError') {
                    setApiError(error.message);
                }
            } else {
                setApiError('An unexpected error occurred while fetching customers.');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    // Generate unique key helper for items without DB id
    const getCustomerKey = (customer: Customer, index: number): string => {
        return customer.id ? String(customer.id) : `${customer.phone}-${index}`;
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const filteredCustomers = useMemo(() => {
        const query = searchTerm.toLowerCase().trim();
        if (!query) return customers;

        return customers.filter((customer) => {
            const nameMatch = customer.name?.toLowerCase().includes(query);
            const phoneMatch = customer.phone?.toString().includes(query);
            const emailMatch = customer.email?.toLowerCase().includes(query);
            const cityMatch = customer.city?.toLowerCase().includes(query);

            return nameMatch || phoneMatch || emailMatch || cityMatch;
        });
    }, [customers, searchTerm]);

    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
    const paginatedCustomers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredCustomers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredCustomers, currentPage]);

    // ---------------------------------------------------------------------------
    // Selection Logic ($O(1)$ set key lookup)
    // ---------------------------------------------------------------------------
    const isAllPageSelected = useMemo(() => {
        if (paginatedCustomers.length === 0) return false;
        return paginatedCustomers.every((item, idx) =>
            selectedKeys.has(getCustomerKey(item, idx))
        );
    }, [paginatedCustomers, selectedKeys]);

    const handleSelectAllOnPage = () => {
        setSelectedKeys((prev) => {
            const next = new Set(prev);
            if (isAllPageSelected) {
                paginatedCustomers.forEach((item, idx) => {
                    next.delete(getCustomerKey(item, idx));
                });
            } else {
                paginatedCustomers.forEach((item, idx) => {
                    next.add(getCustomerKey(item, idx));
                });
            }
            return next;
        });
    };

    const handleToggleSelectRow = (key: string) => {
        setSelectedKeys((prev) => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    };

    const handleClearSelection = () => {
        setSelectedKeys(new Set());
    };

    return (
        <section className="p-6 max-w-7xl mx-auto space-y-6" aria-labelledby="customer-list-heading">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 id="customer-list-heading" className="text-xl font-bold text-slate-900 tracking-tight whitespace-nowrap">
                        Customers
                    </h1>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="relative w-full sm:w-80">
                        <label htmlFor="customer-search" className="sr-only">
                            Search customers
                        </label>
                        <input
                            id="customer-search"
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Search name, phone, email or city..."
                            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                        />
                        <svg
                            className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <span className="text-xs font-semibold text-slate-500 whitespace-nowrap bg-slate-100 px-3 py-2 rounded-lg">
                        Total: {filteredCustomers.length}
                    </span>
                </div>
            </div>

            {/* Dynamic Selection Batch Toolbar */}
            {selectedKeys.size > 0 && (
                <div
                    role="region"
                    aria-label="Selection options"
                    className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-900"
                >
                    <span className="font-semibold" aria-live="polite">
                        {selectedKeys.size} customer{selectedKeys.size > 1 ? 's' : ''} selected
                    </span>
                    <button
                        type="button"
                        onClick={handleClearSelection}
                        className="text-indigo-700 hover:text-indigo-900 font-medium underline focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded"
                    >
                        Deselect all
                    </button>
                </div>
            )}

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto relative" aria-busy={isLoading}>
                    <table className="w-full text-left border-collapse">
                        <caption className="sr-only">List of registered customers</caption>
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th scope="col" className="py-3.5 px-4 w-10 text-center">
                                    <input
                                        type="checkbox"
                                        checked={isAllPageSelected}
                                        onChange={handleSelectAllOnPage}
                                        aria-label="Select all customers on this page"
                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                    />
                                </th>
                                <th scope="col" className="py-3.5 px-4">Name</th>
                                <th scope="col" className="py-3.5 px-4">Phone</th>
                                <th scope="col" className="py-3.5 px-4">Email</th>
                                <th scope="col" className="py-3.5 px-4 text-right">City</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-500 font-normal">
                                        <div role="status" aria-live="polite" className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span>Loading records...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : apiError ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-rose-600 font-normal">
                                        <p>{apiError}</p>
                                        <button
                                            type="button"
                                            onClick={fetchCustomers}
                                            className="mt-2 text-xs font-semibold text-indigo-600 hover:underline focus:outline-none"
                                        >
                                            Retry Request
                                        </button>
                                    </td>
                                </tr>
                            ) : paginatedCustomers.length > 0 ? (
                                paginatedCustomers.map((customer, index) => {
                                    const key = getCustomerKey(customer, index);
                                    const isSelected = selectedKeys.has(key);

                                    return (
                                        <tr
                                            key={key}
                                            aria-selected={isSelected}
                                            className={`hover:bg-slate-50/60 transition-colors ${
                                                isSelected ? 'bg-indigo-50/40' : ''
                                            }`}
                                        >
                                            <td className="py-3.5 px-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleToggleSelectRow(key)}
                                                    aria-label={`Select ${customer.name || 'customer'}`}
                                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                />
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-700 capitalize font-medium">
                                                {customer.name?.trim() || 'N/A'}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap font-mono">
                                                {customer.phone || 'N/A'}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-700">
                                                {customer.email && customer.email !== 'N/A' ? customer.email : 'N/A'}
                                            </td>
                                            <td className="py-3.5 px-4 text-right text-slate-700 capitalize">
                                                {customer.city || 'N/A'}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-500 font-normal">
                                        No customer records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <p className="text-slate-500 font-normal" aria-live="polite">
                        Showing <span className="font-semibold text-slate-800">{paginatedCustomers.length}</span> of{' '}
                        <span className="font-semibold text-slate-800">{filteredCustomers.length}</span> records
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1 || isLoading}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            Previous
                        </button>
                        <span className="text-slate-600 font-normal px-2">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            type="button"
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || isLoading}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};