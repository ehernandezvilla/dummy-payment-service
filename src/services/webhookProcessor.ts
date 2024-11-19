// src/services/webhookProcessor.ts
import { WebhookEvent } from '../types/webhook';
import transactionService from './transactionService';
import logger from '../config/logger';

export class WebhookProcessor {
    public async processEvent(event: WebhookEvent): Promise<void> {
        logger.info('Processing webhook event:', { 
            eventId: event.id, 
            type: event.type,
            transactionId: event.data.transactionId 
        });

        try {
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
                    logger.warn('Unknown event type:', { 
                        eventType: event.type,
                        eventId: event.id,
                        transactionId: event.data.transactionId
                    });
                    throw new Error(`Unknown event type: ${event.type}`);
            }

            logger.info('Webhook event processed successfully:', {
                eventId: event.id,
                type: event.type,
                transactionId: event.data.transactionId
            });

        } catch (error) {
            logger.error('Error processing webhook event:', { 
                eventId: event.id, 
                type: event.type,
                transactionId: event.data.transactionId,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }

    private async handlePaymentCreated(event: WebhookEvent): Promise<void> {
        const transaction = await transactionService.updateStatus(
            event.data.transactionId, 
            'payment_pending'
        );

        if (!transaction) {
            throw new Error(`Failed to update transaction ${event.data.transactionId} to pending status`);
        }

        // Aquí podrías agregar lógica adicional como:
        // - Notificar al sistema de inventario
        // - Enviar email de confirmación al usuario
        // - Actualizar estadísticas

        logger.info('Payment creation processed', { 
            transactionId: event.data.transactionId,
            eventId: event.id
        });
    }

    private async handlePaymentProcessing(event: WebhookEvent): Promise<void> {
        const transaction = await transactionService.updateStatus(
            event.data.transactionId, 
            'payment_processing'
        );

        if (!transaction) {
            throw new Error(`Failed to update transaction ${event.data.transactionId} to processing status`);
        }

        // Aquí podrías agregar lógica adicional como:
        // - Actualizar estado en sistemas externos
        // - Enviar notificación de procesamiento al usuario
        
        logger.info('Payment processing status updated', { 
            transactionId: event.data.transactionId,
            eventId: event.id
        });
    }

    private async handlePaymentSuccess(event: WebhookEvent): Promise<void> {
        const transaction = await transactionService.updateStatus(
            event.data.transactionId, 
            'payment_success'
        );

        if (!transaction) {
            throw new Error(`Failed to update transaction ${event.data.transactionId} to success status`);
        }

        // Aquí podrías agregar lógica adicional como:
        // - Enviar confirmación por email
        // - Actualizar inventario
        // - Generar factura
        // - Actualizar estadísticas de ventas
        // - Notificar a otros servicios

        logger.info('Payment success processed', { 
            transactionId: event.data.transactionId,
            eventId: event.id,
            amount: event.data.amount
        });
    }

    private async handlePaymentFailed(event: WebhookEvent): Promise<void> {
        const transaction = await transactionService.updateStatus(
            event.data.transactionId, 
            'payment_failed'
        );

        if (!transaction) {
            throw new Error(`Failed to update transaction ${event.data.transactionId} to failed status`);
        }

        // Aquí podrías agregar lógica adicional como:
        // - Notificar al usuario del fallo
        // - Registrar el motivo del fallo
        // - Iniciar proceso de recuperación si es apropiado
        // - Actualizar métricas de fallos

        logger.info('Payment failure processed', { 
            transactionId: event.data.transactionId,
            eventId: event.id
        });
    }

    private async handlePaymentCancelled(event: WebhookEvent): Promise<void> {
        const transaction = await transactionService.updateStatus(
            event.data.transactionId, 
            'payment_cancelled'
        );

        if (!transaction) {
            throw new Error(`Failed to update transaction ${event.data.transactionId} to cancelled status`);
        }

        // Aquí podrías agregar lógica adicional como:
        // - Liberar inventario reservado
        // - Notificar al usuario
        // - Actualizar métricas de cancelaciones
        
        logger.info('Payment cancellation processed', { 
            transactionId: event.data.transactionId,
            eventId: event.id
        });
    }

    private async handlePaymentExpired(event: WebhookEvent): Promise<void> {
        const transaction = await transactionService.updateStatus(
            event.data.transactionId, 
            'payment_expired'
        );

        if (!transaction) {
            throw new Error(`Failed to update transaction ${event.data.transactionId} to expired status`);
        }

        // Aquí podrías agregar lógica adicional como:
        // - Liberar recursos reservados
        // - Notificar al usuario
        // - Actualizar métricas de expiración
        // - Iniciar proceso de recuperación si es apropiado

        logger.info('Payment expiration processed', { 
            transactionId: event.data.transactionId,
            eventId: event.id
        });
    }

    // Método helper para validar la existencia de datos requeridos
    private validateEventData(event: WebhookEvent): void {
        if (!event.data.transactionId) {
            throw new Error('Missing transaction ID in webhook event');
        }

        if (!event.data.amount || event.data.amount <= 0) {
            throw new Error('Invalid or missing amount in webhook event');
        }

        if (!event.data.userId) {
            throw new Error('Missing user ID in webhook event');
        }
    }
}

export default new WebhookProcessor();