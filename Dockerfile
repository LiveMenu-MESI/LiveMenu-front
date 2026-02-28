# Stage 1: Build
FROM node:20-alpine AS build

# URLs para producción: livemenu.naing.co + api.naing.co (inyectadas en build)
ARG API_URL=https://api.naing.co
ARG FRONTEND_URL=https://livemenu.naing.co
ENV API_URL=${API_URL}
ENV FRONTEND_URL=${FRONTEND_URL}

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# load-env.js lee process.env.API_URL y FRONTEND_URL y genera config.ts antes de ng build
RUN npm run build:prod

# Stage 2: Serve con nginx + HTTPS
FROM nginx:alpine

# Certificado autofirmado por defecto (el navegador mostrará advertencia). En producción montar certs reales.
RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout /etc/nginx/ssl/key.pem -out /etc/nginx/ssl/cert.pem \
      -subj "/CN=livemenu.naing.co"

COPY --from=build /app/dist/live-menu-app/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
