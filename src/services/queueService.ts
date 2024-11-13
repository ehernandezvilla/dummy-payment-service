// src/services/queueService.ts
import Queue from 'queue';
import logger from '../config/logger';
import { WebhookEvent, WebhookError } from '../types/webhook';

class QueueService {
    private queue: Queue;
    private static instance: QueueService;

    private constructor() {
        this.queue = new Queue({
            concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '2', 10),
            autostart: true
        });

        this.queue.on('error', (error, job) => {
            logger.error('Queue job error:', { error, job });
        });

        this.queue.on('success', (result, job) => {
            logger.info('Queue job completed:', { result, job });
        });
    }

    public static getInstance(): QueueService {
        if (!QueueService.instance) {
            QueueService.instance = new QueueService();
        }
        return QueueService.instance;
    }

    public addJob(event: WebhookEvent, processor: (event: WebhookEvent) => Promise<void>): void {
        this.queue.push(async () => {
            try {
                await processor(event);
            } catch (error) {
                const webhookError: WebhookError = {
                    code: 'PROCESSING_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown error',
                    timestamp: new Date(),
                    eventId: event.id
                };
                logger.error('Webhook processing error:', webhookError);
                throw error;
            }
        });
    }

    public getQueueStatus() {
        return {
            length: this.queue.length,
            running: this.queue.running,
            concurrency: this.queue.concurrency
        };
    }
}

export default QueueService.getInstance();