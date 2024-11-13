// src/services/webhookProcessor.ts
import { WebhookEvent } from '../types/webhook';
import { updateTransactionStatus } from '../models/Transaction';
import logger from '../config/logger';

export class WebhookProcessor {
    public async processEvent(event: WebhookEvent): Promise<void> {
        logger.info('Processing webhook event:', { eventId: event.id, type: event.type });

        switch (event.type) {
            case 'payment.created':
                await this.handlePaymentCreated(event);
                break;
            case 'payment.processing':
                await this.handlePaymentProcessing(event);
                break;
            case 'payment.success':
                await this.handlePaymentSuccess(event);
                break;
            case 'payment.failed':
                await this.handlePaymentFailed(event);
                break;
            case 'payment.cancelled':
                await this.handlePaymentCancelled(event);
                break;
            case 'payment.expired':
                await this.handlePaymentExpired(event);
                break;
            default:
                logger.warn('Unknown event type:', { eventType: event.type });
                throw new Error(`Unknown event type: ${event.type}`);
        }
    }

    private async handlePaymentCreated(event: WebhookEvent): Promise<void> {
        await updateTransactionStatus(event.data.transactionId, 'payment_pending');
        // Implementar lógica adicional aquí
    }

    private async handlePaymentProcessing(event: WebhookEvent): Promise<void> {
        await updateTransactionStatus(event.data.transactionId, 'payment_processing');
        // Implementar lógica adicional aquí
    }

    private async handlePaymentSuccess(event: WebhookEvent): Promise<void> {
        await updateTransactionStatus(event.data.transactionId, 'payment_success');
        // Implementar lógica adicional aquí, como:
        // - Enviar confirmación por email
        // - Actualizar inventario
        // - Notificar a otros servicios
    }

    private async handlePaymentFailed(event: WebhookEvent): Promise<void> {
        await updateTransactionStatus(event.data.transactionId, 'payment_failed');
        // Implementar lógica de manejo de fallos
    }

    private async handlePaymentCancelled(event: WebhookEvent): Promise<void> {
        await updateTransactionStatus(event.data.transactionId, 'payment_cancelled');
        // Implementar lógica de cancelación
    }

    private async handlePaymentExpired(event: WebhookEvent): Promise<void> {
        await updateTransactionStatus(event.data.transactionId, 'payment_expired');
        // Implementar lógica de expiración
    }
}

export default new WebhookProcessor();