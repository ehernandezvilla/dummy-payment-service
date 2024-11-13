// src/controllers/paymentController.ts
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createTransaction, getTransaction } from '../models/Transaction';
import logger from '../config/logger';

export const initiatePayment = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { amount, userId, metadata } = req.body;

        if (!amount || !userId) {
            res.status(400).json({ 
                error: 'Missing required fields',
                required: ['amount', 'userId']
            });
            return;
        }

        if (typeof amount !== 'number' || amount <= 0) {
            res.status(400).json({ 
                error: 'Invalid amount',
                message: 'Amount must be a positive number'
            });
            return;
        }

        const transactionId = uuidv4();
        const transaction = createTransaction(transactionId, amount, userId, metadata);

        logger.info('Payment initiated:', { 
            transactionId,
            userId,
            amount
        });

        res.status(201).json({
            transactionId: transaction.id,
            status: transaction.status,
            amount: transaction.amount,
            _links: {
                self: `/api/payments/${transaction.id}`,
                status: `/api/payments/${transaction.id}/status`
            }
        });
        return;

    } catch (error) {
        logger.error('Error initiating payment:', error);
        res.status(500).json({ error: 'Error initiating payment' });
        return;
    }
};

export const getPaymentStatus = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { transactionId } = req.params;
        const transaction = getTransaction(transactionId);

        if (!transaction) {
            res.status(404).json({ error: 'Transaction not found' });
            return;
        }

        res.json({
            transactionId: transaction.id,
            status: transaction.status,
            amount: transaction.amount,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt
        });
        return;

    } catch (error) {
        logger.error('Error getting payment status:', error);
        res.status(500).json({ error: 'Error getting payment status' });
        return;
    }
};