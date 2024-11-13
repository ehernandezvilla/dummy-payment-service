// src/routes/paymentRoutes.ts
import express from 'express';
import { initiatePayment, getPaymentStatus } from '../controllers/paymentController';

const router = express.Router();

/**
 * @swagger
 * /api/payments/initiate:
 *   post:
 *     summary: Inicia una nueva transacción de pago
 *     tags: [Payments]
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
 *                 description: Monto del pago
 *               userId:
 *                 type: string
 *                 description: ID del usuario
 *               metadata:
 *                 type: object
 *                 description: Datos adicionales opcionales
 *     responses:
 *       201:
 *         description: Transacción creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactionId:
 *                   type: string
 *                 status:
 *                   $ref: '#/components/schemas/Transaction/properties/status'
 *                 amount:
 *                   type: number
 *                 _links:
 *                   type: object
 *                   properties:
 *                     self:
 *                       type: string
 *                     status:
 *                       type: string
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/initiate', initiatePayment);

/**
 * @swagger
 * /api/payments/{transactionId}/status:
 *   get:
 *     summary: Obtiene el estado de una transacción
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la transacción
 *     responses:
 *       200:
 *         description: Estado de la transacción
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