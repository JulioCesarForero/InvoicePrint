# ---------- Etapa 1: compilación con Vite ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# Las variables VITE_* se fijan en tiempo de compilación.
# La API se consume por el mismo origen (/api/) a través de nginx, así la imagen funciona en cualquier host o IP.
ARG VITE_APP_NAME=InvoicePrint
ARG VITE_LOCALE=en-US
ARG VITE_BASE_URL=/
ARG VITE_API_PATH=/api/
ARG VITE_STORAGE_KEY=invoiceprint
ENV VITE_APP_NAME=$VITE_APP_NAME \
    VITE_LOCALE=$VITE_LOCALE \
    VITE_BASE_URL=$VITE_BASE_URL \
    VITE_API_PATH=$VITE_API_PATH \
    VITE_STORAGE_KEY=$VITE_STORAGE_KEY \
    VITE_PORT=8050

RUN npx vite build

# ---------- Etapa 2: servir con nginx ----------
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
