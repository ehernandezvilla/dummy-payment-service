// src/index.ts
import express from 'express';
import paymentRoutes from './routes/paymentRoutes';
import { specs, swaggerUi } from './swagger';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear el cuerpo de las solicitudes en formato JSON
app.use(express.json());

// Configuración de Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Rutas de la API de pagos
app.use('/api/payments', paymentRoutes);

// Iniciar el servidor en el puerto especificado
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});