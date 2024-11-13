// src/types/webhook.ts
export type WebhookEventType =
    | 'payment.created'
    | 'payment.processing'
    | 'payment.success'
    | 'payment.failed'
    | 'payment.cancelled'
    | 'payment.expired';

export interface WebhookEvent {
    id: string;
    type: WebhookEventType;
    created: number;
    data: {
        transactionId: string;
        amount: number;
        userId: string;
        metadata?: Record<string, any>;
    };
}

export interface WebhookError {
    code: string;
    message: string;
    timestamp: Date;
    eventId: string;
}