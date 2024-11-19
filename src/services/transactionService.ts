// src/services/transactionService.ts
import logger from '../config/logger';
import { Transaction, TransactionStatus, updateTransactionStatus } from '../models/Transaction';

export class TransactionService {
    private static instance: TransactionService;
    private readonly maxRetries = 3;
    private readonly retryDelay = 500; // ms

    private constructor() {}

    public static getInstance(): TransactionService {
        if (!TransactionService.instance) {
            TransactionService.instance = new TransactionService();
        }
        return TransactionService.instance;
    }

    public async updateStatus(
        transactionId: string, 
        status: TransactionStatus, 
        attempt: number = 1
    ): Promise<Transaction | null> {
        try {
            const transaction = await updateTransactionStatus(transactionId, status);
            if (transaction) {
                logger.info('Transaction status updated successfully', {
                    transactionId,
                    newStatus: status,
                    attempt
                });
                return transaction;
            }

            if (attempt < this.maxRetries) {
                logger.warn('Retrying transaction status update', {
                    transactionId,
                    attempt,
                    nextAttempt: attempt + 1
                });
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this.updateStatus(transactionId, status, attempt + 1);
            }

            logger.error('Failed to update transaction status after retries', {
                transactionId,
                status,
                attempts: attempt
            });
            return null;

        } catch (error) {
            logger.error('Error updating transaction status', {
                transactionId,
                status,
                error: error instanceof Error ? error.message : 'Unknown error',
                attempt
            });

            if (attempt < this.maxRetries) {
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this.updateStatus(transactionId, status, attempt + 1);
            }

            throw error;
        }
    }
}

export default TransactionService.getInstance();