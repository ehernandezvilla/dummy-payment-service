# Etapa de desarrollo
FROM node:18-alpine AS builder

WORKDIR /app

# Instalar dependencias de desarrollo
COPY package*.json ./
RUN npm install

# Copiar archivos de configuración
COPY tsconfig.json ./

# Copiar el código fuente
COPY src/ ./src/

# Verificar la estructura y compilar TypeScript
RUN ls -la && \
    echo "Compiling TypeScript..." && \
    npm run build

# Etapa de producción
FROM node:18-alpine AS production

WORKDIR /app

# Copiar archivos necesarios
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Exponer puerto
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# Comando para iniciar la aplicación
CMD ["npm", "start"]

# Etapa de desarrollo
FROM builder AS development

# Instalar nodemon globalmente para desarrollo
RUN npm install -g ts-node-dev

# Comando para desarrollo con hot-reload
CMD ["npm", "run", "dev"]