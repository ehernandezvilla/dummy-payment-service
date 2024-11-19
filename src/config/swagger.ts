// src/config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Payment Gateway API',
      version: '1.0.0',
      description: `
Payment Gateway API with Webhook Support

This API provides a complete payment processing solution with real-time webhook notifications.

## Features
- Asynchronous payment processing
- Real-time webhook notifications
- Queue-based event processing
- Secure webhook validation
- Comprehensive payment lifecycle management

## Authentication
All webhook notifications are signed using HMAC-SHA256. Verify signatures using the webhook secret.
      `,
      contact: {
        name: 'API Support',
        email: 'eduardo.hvilla@gmail.com',
        url: 'https://github.com/ehernandezvilla'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.example.com',
        description: 'Production server'
      }
    ],
    tags: [
      {
        name: 'Payments',
        description: 'Payment processing operations'
      },
      {
        name: 'Webhooks',
        description: 'Webhook management and configuration'
      }
    ],
    components: {
      schemas: {
        Transaction: {
          type: 'object',
          required: ['id', 'amount', 'userId', 'status'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique transaction identifier',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            amount: {
              type: 'number',
              format: 'double',
              minimum: 0.01,
              description: 'Transaction amount',
              example: 99.99
            },
            userId: {
              type: 'string',
              description: 'ID of the user who initiated the transaction',
              example: 'user_123'
            },
            status: {
              type: 'string',
              enum: [
                'payment_pending',
                'payment_processing',
                'payment_success',
                'payment_failed',
                'payment_cancelled',
                'payment_expired'
              ],
              description: 'Current status of the transaction'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Transaction creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            },
            metadata: {
              type: 'object',
              additionalProperties: true,
              description: 'Additional transaction metadata',
              example: {
                orderId: 'ORDER123',
                productId: 'PROD456',
                customerEmail: 'customer@example.com'
              }
            }
          }
        },
        WebhookEvent: {
          type: 'object',
          required: ['id', 'type', 'created', 'data'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique event identifier',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            type: {
              type: 'string',
              enum: [
                'payment.created',
                'payment.processing',
                'payment.success',
                'payment.failed',
                'payment.cancelled',
                'payment.expired'
              ],
              description: 'Type of webhook event'
            },
            created: {
              type: 'number',
              description: 'Unix timestamp when the event was created',
              example: 1624294965000
            },
            data: {
              type: 'object',
              required: ['transactionId', 'amount', 'userId'],
              properties: {
                transactionId: {
                  type: 'string',
                  format: 'uuid',
                  description: 'ID of the associated transaction'
                },
                amount: {
                  type: 'number',
                  format: 'double',
                  description: 'Transaction amount'
                },
                userId: {
                  type: 'string',
                  description: 'ID of the user'
                },
                metadata: {
                  type: 'object',
                  additionalProperties: true,
                  description: 'Additional event metadata'
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          required: ['error'],
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            },
            code: {
              type: 'string',
              description: 'Error code for machine handling',
              example: 'INVALID_AMOUNT'
            },
            message: {
              type: 'string',
              description: 'Detailed error message (only in development)'
            },
            details: {
              type: 'object',
              description: 'Additional error details',
              additionalProperties: true
            }
          }
        },
        QueueStatus: {
          type: 'object',
          required: ['pending', 'active', 'total', 'isActive', 'maxConcurrency'],
          properties: {
            pending: {
              type: 'number',
              description: 'Number of pending tasks in queue',
              minimum: 0
            },
            active: {
              type: 'number',
              description: 'Number of active tasks being processed',
              minimum: 0
            },
            total: {
              type: 'number',
              description: 'Total number of tasks processed',
              minimum: 0
            },
            isActive: {
              type: 'boolean',
              description: 'Whether the queue is currently processing'
            },
            maxConcurrency: {
              type: 'number',
              description: 'Maximum number of concurrent tasks',
              minimum: 1
            }
          }
        }
      },
      securitySchemes: {
        WebhookSignature: {
          type: 'apiKey',
          in: 'header',
          name: 'x-webhook-signature',
          description: 'HMAC SHA-256 signature for webhook validation'
        },
        ApiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API key for authentication'
        }
      },
      parameters: {
        transactionId: {
          name: 'transactionId',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid'
          },
          description: 'Transaction identifier'
        }
      },
      responses: {
        BadRequest: {
          description: 'Bad Request - The request is invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        Unauthorized: {
          description: 'Unauthorized - Authentication failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        NotFound: {
          description: 'Not Found - The requested resource was not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        InternalError: {
          description: 'Internal Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts'], // Rutas donde buscar anotaciones
};

export const specs = swaggerJsdoc(options);