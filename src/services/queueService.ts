// src/services/queueService.ts
import Queue from 'queue';
import { EventEmitter } from 'events';
import logger from '../config/logger';
import { WebhookEvent, WebhookError } from '../types/webhook';

// Extendemos Queue para tipar correctamente sus eventos y propiedades
interface TypedQueue extends Queue {
    on(event: 'error', listener: (error: Error, job: QueueJob) => void): this;
    on(event: 'success', listener: (result: any, job: QueueJob) => void): this;
    on(event: string, listener: Function): this;
    
    // Propiedades adicionales de Queue
    length: number;
    concurrency: number;
    started: boolean;
    paused: boolean;
    pending: number;
}

// Definimos el tipo para los trabajos en la cola
type QueueJob = {
    event: WebhookEvent;
    processor: (event: WebhookEvent) => Promise<void>;
};

class QueueService {
    private queue: TypedQueue;
    private static instance: QueueService;

    private constructor() {
        this.queue = new Queue({
            concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '2', 10),
            autostart: true
        }) as TypedQueue;

        this.queue.on('error', (error: Error, job: QueueJob) => {
            logger.error('Queue job error:', { 
                error: error.message, 
                jobEvent: job.event.id 
            });
        });

        this.queue.on('success', (result: any, job: QueueJob) => {
            logger.info('Queue job completed:', { 
                jobEvent: job.event.id,
                result 
            });
        });
    }

    public static getInstance(): QueueService {
        if (!QueueService.instance) {
            QueueService.instance = new QueueService();
        }
        return QueueService.instance;
    }

    public addJob(event: WebhookEvent, processor: (event: WebhookEvent) => Promise<void>): void {
        const job: QueueJob = {
            event,
            processor
        };

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
            pending: this.queue.pending,
            isStarted: this.queue.started,
            isPaused: this.queue.paused,
            concurrency: this.queue.concurrency
        };
    }
}

export default QueueService.getInstance();