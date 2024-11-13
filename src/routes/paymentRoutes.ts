// src/routes/paymentRoutes.ts
import express from 'express';
import { initiatePayment, updatePaymentStatus, getPaymentStatus } from '../controllers/paymentController';

const router = express.Router();

/**
 * @swagger
 * /api/payments/initiate:
 *   post:
 *     summary: Iniciar una nueva transacción de pago
 *     tags:
 *       - Payments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Monto de la transacción
 *               userId:
 *                 type: string
 *                 description: ID del usuario
 *             required:
 *               - amount
 *               - userId
 *     responses:
 *       201:
 *         description: Transacción creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 */
router.post('/initiate', initiatePayment);

/**
 * @swagger
 * /api/payments/update-status:
 *   post:
 *     summary: Actualizar el estado de una transacción
 *     tags:
 *       - Payments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transactionId:
 *                 type: string
 *                 description: ID de la transacción
 *               status:
 *                 type: string
 *                 enum: [payment_pending, payment_processing, payment_success, payment_failed, payment_cancelled, payment_expired]
 *                 description: Nuevo estado de la transacción
 *             required:
 *               - transactionId
 *               - status
 *     responses:
 *       200:
 *         description: Estado de la transacción actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Transacción no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/update-status', updatePaymentStatus);

/**
 * @swagger
 * /api/payments/{transactionId}/status:
 *   get:
 *     summary: Obtener el estado de una transacción
 *     tags:
 *       - Payments
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la transacción
 *     responses:
 *       200:
 *         description: Estado de la transacción recuperado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Transacción no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:transactionId/status', getPaymentStatus);

export default router;