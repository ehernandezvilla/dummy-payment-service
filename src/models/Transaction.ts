// src/models/Transaction.ts

// Define Transaction y TransactionStatus para representar estados de pago

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
}


const transactions: Record<string, Transaction> = {};

// Funciones para crear, actualizar y obtener transacciones

export const createTransaction = (id: string, amount: number, userId: string): Transaction => {
  const transaction: Transaction = {
    id,
    amount,
    userId,
    status: 'payment_processing',
    createdAt: new Date(),
  };
  transactions[id] = transaction;
  return transaction;
};

export const updateTransactionStatus = (id: string, status: TransactionStatus): Transaction | null => {
  const transaction = transactions[id];
  if (!transaction) return null;
  transaction.status = status;
  return transaction;
};

export const getTransaction = (id: string): Transaction | null => transactions[id] || null;
