// src/routes/paymentRoutes.ts
import express from 'express';
import { initiatePayment, getPaymentStatus } from '../controllers/paymentController';

const router = express.Router();

/**
 * @swagger
 * /api/payments/initiate:
 *   post:
 *     summary: Initiate a new payment transaction
 *     description: |
 *       Creates a new payment transaction and returns the transaction details.
 *       The transaction will be in a pending state until processed.
 *     tags: [Payments]
 *     security:
 *       - ApiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - userId
 *             properties:
 *               amount:
 *                 type: number
 *                 format: double
 *                 minimum: 0.01
 *                 description: Payment amount
 *                 example: 99.99
 *               userId:
 *                 type: string
 *                 description: User identifier
 *                 example: "user_123"
 *               metadata:
 *                 type: object
 *                 description: Additional payment metadata
 *                 example:
 *                   orderId: "ORDER123"
 *                   description: "Premium subscription"
 *     responses:
 *       201:
 *         description: Payment transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactionId:
 *                   type: string
 *                   format: uuid
 *                 status:
 *                   $ref: '#/components/schemas/Transaction/properties/status'
 *                 amount:
 *                   type: number
 *                   format: double
 *                 _links:
 *                   type: object
 *                   properties:
 *                     self:
 *                       type: string
 *                       description: URL to get transaction details
 *                     status:
 *                       type: string
 *                       description: URL to check transaction status
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/initiate', initiatePayment);

/**
 * @swagger
 * /api/payments/{transactionId}/status:
 *   get:
 *     summary: Get payment transaction status
 *     description: |
 *       Retrieves the current status and details of a payment transaction.
 *       This endpoint can be polled to track the payment progress.
 *     tags: [Payments]
 *     security:
 *       - ApiKey: []
 *     parameters:
 *       - $ref: '#/components/parameters/transactionId'
 *     responses:
 *       200:
 *         description: Transaction details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/:transactionId/status', getPaymentStatus);

export default router;