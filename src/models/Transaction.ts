// src/models/Transaction.ts
import logger from '../config/logger';

export type TransactionStatus = 
  | 'payment_pending'
  | 'payment_processing'
  | 'payment_success'
  | 'payment_failed'
  | 'payment_cancelled'
  | 'payment_expired';

export interface Transaction {
  id: string;
  amount: number;
  userId: string;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

// Validaciones de transiciones de estado válidas
const validTransitions: Record<TransactionStatus, TransactionStatus[]> = {
  payment_pending: ['payment_processing', 'payment_cancelled', 'payment_expired'],
  payment_processing: ['payment_success', 'payment_failed', 'payment_cancelled'],
  payment_success: [],  // Estado final
  payment_failed: ['payment_pending'],  // Permite reintentos
  payment_cancelled: [], // Estado final
  payment_expired: ['payment_pending']  // Permite reintentos
};

// En una aplicación real, esto sería una base de datos
const transactions: Record<string, Transaction> = {};

export const createTransaction = (id: string, amount: number, userId: string, metadata?: Record<string, any>): Transaction => {
  const now = new Date();
  const transaction: Transaction = {
    id,
    amount,
    userId,
    status: 'payment_pending',
    createdAt: now,
    updatedAt: now,
    metadata
  };
  
  transactions[id] = transaction;
  logger.info('Transaction created:', { transactionId: id, userId, amount });
  
  return transaction;
};

export const updateTransactionStatus = async (id: string, newStatus: TransactionStatus): Promise<Transaction | null> => {
  const transaction = transactions[id];
  if (!transaction) {
    logger.warn('Transaction not found:', { transactionId: id });
    return null;
  }

  // Validar la transición de estado
  const allowedTransitions = validTransitions[transaction.status];
  if (!allowedTransitions.includes(newStatus) && newStatus !== transaction.status) {
    const error = `Invalid status transition from ${transaction.status} to ${newStatus}`;
    logger.error(error, { transactionId: id });
    throw new Error(error);
  }
  
  const oldStatus = transaction.status;
  transaction.status = newStatus;
  transaction.updatedAt = new Date();
  
  logger.info('Transaction status updated:', { 
    transactionId: id, 
    oldStatus, 
    newStatus 
  });
  
  return transaction;
};

export const getTransaction = (id: string): Transaction | null => {
  const transaction = transactions[id];
  if (!transaction) {
    logger.debug('Transaction lookup failed:', { transactionId: id });
  }
  return transaction || null;
};