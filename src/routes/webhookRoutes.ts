// src/routes/webhookRoutes.ts
import express from 'express';
import { handlePaymentWebhook, getWebhookQueueStatus } from '../controllers/webhookController';
import { validateWebhookSignature } from '../middleware/webhookAuth';

const router = express.Router();

/**
 * @swagger
 * /webhooks/payment:
 *   post:
 *     summary: Endpoint para recibir eventos de webhook
 *     tags: [Webhooks]
 *     security:
 *       - WebhookSignature: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WebhookEvent'
 *     responses:
 *       200:
 *         description: Evento recibido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received:
 *                   type: boolean
 *                 eventId:
 *                   type: string
 *       401:
 *         description: Firma inválida o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Evento inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/payment', validateWebhookSignature, handlePaymentWebhook);

/**
 * @swagger
 * /webhooks/status:
 *   get:
 *     summary: Obtiene el estado de la cola de procesamiento de webhooks
 *     tags: [Webhooks]
 *     responses:
 *       200:
 *         description: Estado actual de la cola
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 length:
 *                   type: number
 *                   description: Número total de trabajos en la cola
 *                 pending:
 *                   type: number
 *                   description: Número de trabajos pendientes
 *                 isStarted:
 *                   type: boolean
 *                   description: Si la cola está iniciada
 *                 isPaused:
 *                   type: boolean
 *                   description: Si la cola está pausada
 *                 concurrency:
 *                   type: number
 *                   description: Número máximo de trabajos simultáneos
 */
router.get('/status', getWebhookQueueStatus);

export default router;