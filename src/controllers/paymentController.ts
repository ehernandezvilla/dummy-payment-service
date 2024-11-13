import { RequestHandler } from 'express';
import { createTransaction, updateTransactionStatus, getTransaction } from '../models/Transaction';
import { v4 as uuidv4 } from 'uuid';

export const initiatePayment: RequestHandler = async (req, res) => {
  try {
    const { amount, userId } = req.body;
    const transactionId = uuidv4();
    const transaction = createTransaction(transactionId, amount, userId);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Error initiating payment' });
  }
};

export const updatePaymentStatus: RequestHandler = async (req, res) => {
  try {
    const { transactionId, status } = req.body;
    const updatedTransaction = updateTransactionStatus(transactionId, status);
    
    if (!updatedTransaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    
    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ error: 'Error updating payment status' });
  }
};

export const getPaymentStatus: RequestHandler = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = getTransaction(transactionId);
    
    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Error getting payment status' });
  }
};