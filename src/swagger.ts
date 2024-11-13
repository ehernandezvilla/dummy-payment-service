// src/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Pagos',
      version: '1.0.0',
      description: 'API para procesar pagos y gestionar transacciones',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      schemas: {
        Transaction: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID único de la transacción',
            },
            amount: {
              type: 'number',
              description: 'Monto de la transacción',
            },
            userId: {
              type: 'string',
              description: 'ID del usuario que realiza la transacción',
            },
            status: {
              type: 'string',
              enum: [
                'payment_pending',
                'payment_processing',
                'payment_success',
                'payment_failed',
                'payment_cancelled',
                'payment_expired',
              ],
              description: 'Estado actual de la transacción',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha y hora de creación de la transacción',
            },
          },
          required: ['id', 'amount', 'userId', 'status', 'createdAt'],
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // Rutas donde están los comentarios de Swagger
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };