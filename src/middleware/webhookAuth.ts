// src/middleware/webhookAuth.ts
import { RequestHandler } from 'express';
import crypto from 'crypto';
import logger from '../config/logger';

export const validateWebhookSignature: RequestHandler = async (req, res, next) => {
    try {
        const signature = req.headers['x-webhook-signature'];
        const webhookSecret = process.env.WEBHOOK_SECRET;

        if (!webhookSecret) {
            logger.error('WEBHOOK_SECRET not configured');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        if (!signature) {
            logger.warn('Webhook signature missing');
            return res.status(401).json({ error: 'No signature provided' });
        }

        const payload = JSON.stringify(req.body);
        const hmac = crypto.createHmac('sha256', webhookSecret);
        const computedSignature = hmac.update(payload).digest('hex');

        if (signature !== computedSignature) {
            logger.warn('Invalid webhook signature', {
                receivedSignature: signature,
                expectedSignature: computedSignature
            });
            return res.status(401).json({ error: 'Invalid signature' });
        }

        // Validar timestamp para prevenir replay attacks
        const timestamp = req.body.created;
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        
        if (!timestamp || timestamp < fiveMinutesAgo) {
            logger.warn('Webhook event expired or invalid timestamp', { timestamp });
            return res.status(400).json({ error: 'Event expired or invalid timestamp' });
        }

        return next();
    } catch (error) {
        logger.error('Error validating webhook signature:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};