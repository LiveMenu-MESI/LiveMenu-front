# Stage 1: Build
FROM node:20-alpine AS build

# Variable de entorno para la URL del API (ej: http://backend:8080)
ARG API_URL=http://localhost:8080
ENV API_URL=${API_URL}

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build:prod

# Stage 2: Serve con nginx
FROM nginx:alpine

COPY --from=build /app/dist/live-menu-app/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
