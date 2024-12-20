// src/controllers/webhookController.ts
import { Request, Response } from 'express';
import { WebhookEvent } from '../types/webhook';
import webhookProcessor from '../services/webhookProcessor';
import queueService from '../services/queueService';
import logger from '../config/logger';

export const handlePaymentWebhook = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const event = req.body as WebhookEvent;

        // Validar la estructura del evento
        if (!event.id || !event.type || !event.data) {
            logger.warn('Invalid webhook event structure', { event });
            res.status(400).json({ error: 'Invalid event structure' });
            return;
        }

        // Responder rápidamente
        res.status(200).json({ 
            received: true, 
            eventId: event.id 
        });

        // Agregar el evento a la cola de procesamiento
        queueService.addJob(event, async (event: WebhookEvent) => {
            await webhookProcessor.processEvent(event);
        });

        logger.info('Webhook event queued for processing', { 
            eventId: event.id, 
            type: event.type 
        });

    } catch (error) {
        logger.error('Error handling webhook:', error);
        // Si aún no hemos enviado una respuesta, enviamos error
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        }
        return;
    }
};

// Endpoint para verificar el estado de la cola
export const getWebhookQueueStatus = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const status = queueService.getQueueStatus();
        res.json(status);
    } catch (error) {
        logger.error('Error getting queue status:', error);
        res.status(500).json({ error: 'Error getting queue status' });
    }
    return;
};