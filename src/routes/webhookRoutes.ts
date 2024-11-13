// src/routes/webhookRoutes.ts
import express from 'express';
import { handlePaymentWebhook, getWebhookQueueStatus } from '../controllers/webhookController';
import { validateWebhookSignature } from '../middleware/webhookAuth';

const router = express.Router();

// Ruta principal para webhooks de pagos
router.post('/payment', validateWebhookSignature, handlePaymentWebhook);

// Ruta para monitorear el estado de la cola (opcional, podría requerir autenticación adicional)
router.get('/status', getWebhookQueueStatus);

export default router;