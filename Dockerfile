# Etapa de desarrollo
FROM node:18-alpine as builder

WORKDIR /app

# Instalar dependencias de desarrollo
COPY package*.json ./
RUN npm install

# Copiar el código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Etapa de producción
FROM node:18-alpine as production

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
FROM builder as development

# Comando para desarrollo con hot-reload
CMD ["npm", "run", "dev"]