export interface ImportEvent {
    detail: {
        event_id: string;
        trace_id: string;
        correlation_id?: string;
        payload: {
            table: string;
            items: any[];
            batchId: string;
        };
    };
}

export interface StandardEvent {
    event_id: string;
    event_type: string;
    trace_id: string;
    correlation_id?: string;
    timestamp: string;
    source: string;
    version: string;
    status: 'SUCCESS' | 'FAILED' | 'PENDING';
    payload: {
        restaurant_id?: string;
        name?: string;
        operation: string;
        table: string;
        batchId: string;
        importId?: string;
        error?: string;
        successCount?: number;
        failureCount?: number;
        remainingItems?: number;
        totalItems?: number;
    };
}
