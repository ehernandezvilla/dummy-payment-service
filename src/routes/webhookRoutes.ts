// src/routes/webhookRoutes.ts
import express from 'express';
import { handlePaymentWebhook, getWebhookQueueStatus } from '../controllers/webhookController';
import { validateWebhookSignature } from '../middleware/webhookAuth';

const router = express.Router();

/**
 * @swagger
 * /webhooks/payment:
 *   post:
 *     summary: Receive payment webhook events
 *     description: |
 *       Endpoint for receiving payment-related webhook events. All requests must include
 *       a valid HMAC SHA-256 signature in the x-webhook-signature header.
 *       
 *       Events are processed asynchronously through a queue system to ensure reliable
 *       processing and handling of concurrent events.
 *       
 *       ## Event Types
 *       - payment.created: Initial payment creation
 *       - payment.processing: Payment is being processed
 *       - payment.success: Payment completed successfully
 *       - payment.failed: Payment processing failed
 *       - payment.cancelled: Payment was cancelled
 *       - payment.expired: Payment expired
 *       
 *       ## Signature Verification
 *       The signature is created by signing the entire request body with your webhook
 *       secret using HMAC SHA-256. Example (Node.js):
 *       ```javascript
 *       const signature = crypto
 *         .createHmac('sha256', webhookSecret)
 *         .update(JSON.stringify(body))
 *         .digest('hex');
 *       ```
 *       
 *       ## Retry Policy
 *       Failed webhook deliveries will be retried up to 3 times with exponential
 *       backoff. Events older than 5 minutes will be rejected.
 *     tags: [Webhooks]
 *     security:
 *       - WebhookSignature: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WebhookEvent'
 *           examples:
 *             payment.created:
 *               summary: Payment Created Event
 *               value: {
 *                 id: "123e4567-e89b-12d3-a456-426614174000",
 *                 type: "payment.created",
 *                 created: 1624294965000,
 *                 data: {
 *                   transactionId: "456e4567-e89b-12d3-a456-426614174000",
 *                   amount: 99.99,
 *                   userId: "user_123",
 *                   metadata: {
 *                     orderId: "ORDER123"
 *                   }
 *                 }
 *               }
 *             payment.success:
 *               summary: Payment Success Event
 *               value: {
 *                 id: "789e4567-e89b-12d3-a456-426614174000",
 *                 type: "payment.success",
 *                 created: 1624294965000,
 *                 data: {
 *                   transactionId: "456e4567-e89b-12d3-a456-426614174000",
 *                   amount: 99.99,
 *                   userId: "user_123",
 *                   metadata: {
 *                     orderId: "ORDER123"
 *                   }
 *                 }
 *               }
 *     responses:
 *       200:
 *         description: Event received and queued for processing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - received
 *                 - eventId
 *               properties:
 *                 received:
 *                   type: boolean
 *                   description: Indicates if the event was received successfully
 *                   example: true
 *                 eventId:
 *                   type: string
 *                   format: uuid
 *                   description: ID of the received event
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *       400:
 *         description: Invalid event data or expired timestamp
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalid_event:
 *                 summary: Invalid Event Structure
 *                 value: {
 *                   error: "Invalid event structure",
 *                   code: "INVALID_EVENT",
 *                   details: {
 *                     missing: ["type", "data.transactionId"]
 *                   }
 *                 }
 *               expired_event:
 *                 summary: Expired Event
 *                 value: {
 *                   error: "Event expired or invalid timestamp",
 *                   code: "EVENT_EXPIRED"
 *                 }
 *       401:
 *         description: Invalid or missing webhook signature
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               missing_signature:
 *                 summary: Missing Signature
 *                 value: {
 *                   error: "No signature provided",
 *                   code: "MISSING_SIGNATURE"
 *                 }
 *               invalid_signature:
 *                 summary: Invalid Signature
 *                 value: {
 *                   error: "Invalid signature",
 *                   code: "INVALID_SIGNATURE"
 *                 }
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/payment', validateWebhookSignature, handlePaymentWebhook);

/**
 * @swagger
 * /webhooks/status:
 *   get:
 *     summary: Get webhook processing queue status
 *     description: |
 *       Returns the current status of the webhook processing queue, including
 *       the number of pending events, active processors, and total processed events.
 *       
 *       This endpoint is useful for monitoring the health and performance of
 *       the webhook processing system.
 *       
 *       ## Queue Metrics
 *       - pending: Number of events waiting to be processed
 *       - active: Number of events currently being processed
 *       - total: Total number of events processed since start
 *       - isActive: Whether the queue is currently processing events
 *       - maxConcurrency: Maximum number of events that can be processed simultaneously
 *     tags: [Webhooks]
 *     security:
 *       - ApiKey: []
 *     responses:
 *       200:
 *         description: Queue status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QueueStatus'
 *             example:
 *               pending: 5
 *               active: 2
 *               total: 1000
 *               isActive: true
 *               maxConcurrency: 5
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/status', getWebhookQueueStatus);

export default router;