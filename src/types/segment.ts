export interface FilterCriteria {
    shop?: string | null;
    size?: string | null;
    color?: string | null;
    rating?: string | null;
    [key: string]: string | null | undefined;
}

export interface Customer {
    feedback: string;
    customer_name: string;
    customer_phone: string;
}

export interface CustomerSegment {
    id: number;
    segment_name: string;
    filter_criteria: FilterCriteria;
    total_customers: number; // Backslash removed
    created_at: string;
    customer_list: Customer[];
}

export interface ApiResponse {
    success: boolean;
    count: number;
    segments: CustomerSegment[];
}