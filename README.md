# API de Pagos con TypeScript y Express

Este proyecto implementa una API RESTful para gestionar pagos y transacciones, construida con TypeScript, Express y documentada con Swagger/OpenAPI.

## 🚀 Características

- Gestión completa de transacciones de pago
- Documentación interactiva con Swagger UI
- Tipado estático con TypeScript
- Arquitectura modular y escalable
- Sistema de estados de transacción
- Manejo de errores robusto

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn
- TypeScript

## 🛠️ Instalación

1. Clona el repositorio:
```bash
git clone [[dummy-payment-service](https://github.com/ehernandezvilla/dummy-payment-service)]
cd dummy-payment-service
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env
# Edita .env con tus configuraciones
```

## 📦 Estructura del Proyecto

```
src/
├── controllers/
│   └── paymentController.ts
├── models/
│   └── Transaction.ts
├── routes/
│   └── paymentRoutes.ts
├── swagger.ts
└── index.ts
```

## 🔧 Configuración

El proyecto utiliza las siguientes dependencias principales:

```json
{
  "express": "^4.17.1",
  "typescript": "^4.5.0",
  "swagger-jsdoc": "^6.0.0",
  "swagger-ui-express": "^4.1.6",
  "uuid": "^8.3.2"
}
```

## 🚀 Uso

1. Inicia el servidor en modo desarrollo:
```bash
npm run dev
```

2. Para compilar y ejecutar en producción:
```bash
npm run build
npm start
```

La API estará disponible en: `http://localhost:3000`
Documentación Swagger UI: `http://localhost:3000/api-docs`

## 📡 Endpoints API

### Pagos

#### Iniciar Pago
- **POST** `/api/payments/initiate`
- Body:
```json
{
  "amount": number,
  "userId": string
}
```

#### Actualizar Estado
- **POST** `/api/payments/update-status`
- Body:
```json
{
  "transactionId": string,
  "status": "payment_pending" | "payment_processing" | "payment_success" | "payment_failed" | "payment_cancelled" | "payment_expired"
}
```

#### Consultar Estado
- **GET** `/api/payments/:transactionId/status`

## 📊 Estados de Transacción

- `payment_pending`: Pago iniciado pero no procesado
- `payment_processing`: Pago en proceso
- `payment_success`: Pago completado exitosamente
- `payment_failed`: Pago fallido
- `payment_cancelled`: Pago cancelado
- `payment_expired`: Pago expirado

## 🔒 Seguridad

- Validación de datos de entrada
- Manejo seguro de transacciones
- Tipado estricto con TypeScript

## ⚙️ Scripts Disponibles

```bash
npm run dev     # Inicia el servidor en modo desarrollo
npm start       # Inicia el servidor en modo producción
```

## 📝 Documentación

La documentación completa de la API está disponible a través de Swagger UI en la ruta `/api-docs` cuando el servidor está en ejecución.

## 🤝 Contribución

1. Haz un Fork del proyecto
2. Crea una rama para tu característica (`git checkout -b feature/AmazingFeature`)
3. Realiza tus cambios y haz commit (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📜 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## 👥 Autor

[TU_NOMBRE]
- GitHub: [@ehernandezvilla](https://github.com/ehernandezvilla)
- LinkedIn: [/ehernandezvilla](https://www.linkedin.com/in/ehernandezvilla/)

## 🙏 Agradecimientos

- Agradecimientos especiales a los contribuidores y mantenedores de las librerías utilizadas
- Inspirado en las mejores prácticas de la comunidad de TypeScript y Express

---
⌨️ con ❤️ 