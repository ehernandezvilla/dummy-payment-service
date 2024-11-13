// src/services/queueService.ts
import BetterQueue, { QueueEvent } from 'better-queue';
import { EventEmitter } from 'events';
import logger from '../config/logger';
import { WebhookEvent, WebhookError } from '../types/webhook';

interface QueueTask {
    event: WebhookEvent;
    processor: (event: WebhookEvent) => Promise<void>;
}

interface QueueResult {
    success: boolean;
    eventId: string;
}

// Definimos los eventos como un tipo
type QueueEventType = 
    | 'task_queued'
    | 'task_started'
    | 'task_finish'
    | 'task_failed'
    | 'task_retry'
    | 'task_progress';

class QueueService {
    private queue: BetterQueue<QueueTask, QueueResult>;
    private static instance: QueueService;
    private stats: {
        pending: number;
        total: number;
        active: number;
    };

    private constructor() {
        this.stats = {
            pending: 0,
            total: 0,
            active: 0
        };

        this.queue = new BetterQueue<QueueTask, QueueResult>(
            async (task: QueueTask, cb: BetterQueue.ProcessFunctionCb<QueueResult>) => {
                try {
                    await task.processor(task.event);
                    this.stats.active--;
                    this.stats.pending--;
                    cb(null, { 
                        success: true, 
                        eventId: task.event.id 
                    });
                } catch (error) {
                    const webhookError: WebhookError = {
                        code: 'PROCESSING_ERROR',
                        message: error instanceof Error ? error.message : 'Unknown error',
                        timestamp: new Date(),
                        eventId: task.event.id
                    };
                    logger.error('Webhook processing error:', webhookError);
                    this.stats.active--;
                    cb(error as Error);
                }
            },
            {
                concurrent: parseInt(process.env.QUEUE_CONCURRENCY || '2', 10),
                maxRetries: 3,
                retryDelay: 1000,
                // Removemos la configuración del store para usar memoria por defecto
                store: {
                    type: 'memory'
                }
            }
        );

        // Event handlers con tipado correcto usando strings
        this.queue.on('task_queued', () => {
            this.stats.pending++;
            this.stats.total++;
            logger.debug('Task queued', { stats: this.stats });
        });

        this.queue.on('task_started', () => {
            this.stats.active++;
            logger.debug('Task started', { stats: this.stats });
        });

        this.queue.on('task_finish', (taskId: string, result: QueueResult) => {
            logger.info('Task completed successfully:', { 
                taskId, 
                eventId: result.eventId,
                stats: this.stats 
            });
        });

        this.queue.on('task_failed', (taskId: string, error: Error) => {
            logger.error('Task failed:', { 
                taskId, 
                error: error.message,
                stats: this.stats 
            });
            this.stats.pending--;
        });

        this.queue.on('task_retry' as QueueEvent, (taskId: string, error: Error) => {
            logger.warn('Task will retry:', { 
                taskId, 
                error: error.message,
                stats: this.stats 
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
        const task: QueueTask = {
            event,
            processor
        };

        this.queue.push(task);
        logger.info('Task added to queue:', { 
            eventId: event.id,
            queueStats: this.getQueueStatus()
        });
    }

    public getQueueStatus() {
        return {
            pending: this.stats.pending,
            active: this.stats.active,
            total: this.stats.total,
            isActive: this.stats.active > 0,
            maxConcurrency: parseInt(process.env.QUEUE_CONCURRENCY || '2', 10)
        };
    }

    public async clearQueue(): Promise<void> {
        return new Promise((resolve) => {
            this.queue.destroy(() => {
                this.stats = {
                    pending: 0,
                    total: 0,
                    active: 0
                };
                resolve();
            });
        });
    }
}

export default QueueService.getInstance();