// src/config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Payment Processing API with Webhooks',
      version: '1.0.0',
      description: 'API para procesamiento de pagos con soporte de webhooks',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
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
              description: 'ID único de la transacción'
            },
            amount: {
              type: 'number',
              description: 'Monto de la transacción'
            },
            userId: {
              type: 'string',
              description: 'ID del usuario'
            },
            status: {
              type: 'string',
              enum: ['payment_pending', 'payment_processing', 'payment_success', 'payment_failed', 'payment_cancelled', 'payment_expired'],
              description: 'Estado actual de la transacción'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización'
            },
            metadata: {
              type: 'object',
              additionalProperties: true,
              description: 'Metadatos adicionales de la transacción'
            }
          }
        },
        WebhookEvent: {
          type: 'object',
          required: ['id', 'type', 'data'],
          properties: {
            id: {
              type: 'string',
              description: 'ID único del evento'
            },
            type: {
              type: 'string',
              enum: ['payment.created', 'payment.processing', 'payment.success', 'payment.failed', 'payment.cancelled', 'payment.expired'],
              description: 'Tipo de evento'
            },
            created: {
              type: 'number',
              description: 'Timestamp de creación del evento'
            },
            data: {
              type: 'object',
              properties: {
                transactionId: {
                  type: 'string',
                  description: 'ID de la transacción'
                },
                amount: {
                  type: 'number',
                  description: 'Monto de la transacción'
                },
                userId: {
                  type: 'string',
                  description: 'ID del usuario'
                },
                metadata: {
                  type: 'object',
                  additionalProperties: true,
                  description: 'Metadatos adicionales'
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error'
            },
            message: {
              type: 'string',
              description: 'Descripción detallada del error (solo en desarrollo)'
            }
          }
        }
      },
      securitySchemes: {
        WebhookSignature: {
          type: 'apiKey',
          in: 'header',
          name: 'x-webhook-signature',
          description: 'Firma HMAC SHA-256 para validar webhooks'
        }
      }
    }
  },
  apis: ['./src/routes/*.ts'], // Archivos donde buscar anotaciones
};

export const specs = swaggerJsdoc(options);