// src/controllers/paymentController.ts
import { RequestHandler } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createTransaction, getTransaction } from '../models/Transaction';
import logger from '../config/logger';

export const initiatePayment: RequestHandler = (req, res) => {
    try {
        const { amount, userId, metadata } = req.body;

        if (!amount || !userId) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                required: ['amount', 'userId']
            });
        }

        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ 
                error: 'Invalid amount',
                message: 'Amount must be a positive number'
            });
        }

        const transactionId = uuidv4();
        const transaction = createTransaction(transactionId, amount, userId, metadata);

        logger.info('Payment initiated:', { 
            transactionId,
            userId,
            amount
        });

        return res.status(201).json({
            transactionId: transaction.id,
            status: transaction.status,
            amount: transaction.amount,
            _links: {
                self: `/api/payments/${transaction.id}`,
                status: `/api/payments/${transaction.id}/status`
            }
        });
    } catch (error) {
        logger.error('Error initiating payment:', error);
        return res.status(500).json({ error: 'Error initiating payment' });
    }
};

export const getPaymentStatus: RequestHandler = (req, res) => {
    try {
        const { transactionId } = req.params;
        const transaction = getTransaction(transactionId);

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        return res.json({
            transactionId: transaction.id,
            status: transaction.status,
            amount: transaction.amount,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt
        });
    } catch (error) {
        logger.error('Error getting payment status:', error);
        return res.status(500).json({ error: 'Error getting payment status' });
    }
};