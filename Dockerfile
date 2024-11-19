# Etapa de desarrollo
FROM node:18-alpine AS builder

WORKDIR /app

# Instalar dependencias
COPY package*.json ./

# Instalar todas las dependencias, incluyendo devDependencies
RUN npm install

# Copiar archivos de configuración
COPY tsconfig.json ./

# Copiar el código fuente
COPY src/ ./src/

# Limpiar y compilar
RUN npm run build:clean

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

# Instalar nodemon para desarrollo
RUN npm install -g ts-node-dev

# Comando para desarrollo con hot-reload
CMD ["npm", "run", "dev"]