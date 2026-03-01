# Instrucciones de Deployment – LiveMenu Frontend

Este documento describe cómo desplegar el frontend de LiveMenu (Angular + Nginx) en distintos entornos.

---

## Resumen

- **Build:** imagen Docker multi-stage: Node 20 para compilar Angular, Nginx Alpine para servir los estáticos.
- **Configuración en build:** `API_URL` y `FRONTEND_URL` se inyectan en tiempo de build vía `scripts/load-env.js` (genera `config.ts`). En Docker se pasan como **build-args**.
- **Servidor:** Nginx sirve la SPA en `/` (fallback a `index.html` para rutas como `/m/:slug`). Opcionalmente HTTPS con certificados montados.

El backend (Quarkus), Keycloak y PostgreSQL se despliegan por separado; el frontend solo necesita poder llamar al API en `API_URL`.

---

## 1. Requisitos previos

- Docker y Docker Compose instalados.
- Backend LiveMenu accesible en una URL (p. ej. `https://api.tudominio.com`).
- Dominio (opcional pero recomendado) para el frontend (p. ej. `https://livemenu.tudominio.com`).

---

## 2. Variables de entorno / Build args

| Variable | Uso | Ejemplo |
|----------|-----|---------|
| `API_URL` | URL base del backend (sin `/api/v1`) | `https://api.tudominio.com` |
| `FRONTEND_URL` | URL pública del frontend (para enlaces en QR y correos) | `https://livemenu.tudominio.com` |

- **Desarrollo local:** se leen de `.env` (ver README).
- **Docker:** se pasan como build-args en `docker-compose` o en `docker build --build-arg API_URL=... --build-arg FRONTEND_URL=...`.

---

## 3. Deployment con Docker Compose

### 3.1 Archivo `.env` en la raíz del repo

Crea un `.env` junto a `docker-compose.yml`:

```env
API_URL=https://api.tudominio.com
FRONTEND_URL=https://livemenu.tudominio.com
```

### 3.2 Build y puesta en marcha

```bash
docker compose up --build -d
```

Por defecto el `docker-compose.yml` expone:

- **Puerto 4200** → HTTP (Nginx puerto 80)
- **Puerto 4443** → HTTPS (Nginx puerto 443)

Accesos:

- **HTTP:** http://localhost:4200  
- **HTTPS:** https://localhost:4443 (certificado autofirmado; el navegador mostrará advertencia si no usas certs reales)

### 3.3 Certificados reales (Let's Encrypt)

Para usar HTTPS con certificados reales, el `docker-compose.yml` ya monta los PEM en el contenedor:

```yaml
volumes:
  - /etc/letsencrypt/live/livemenu.naing.co/fullchain.pem:/etc/nginx/ssl/cert.pem:ro
  - /etc/letsencrypt/live/livemenu.naing.co/privkey.pem:/etc/nginx/ssl/key.pem:ro
```

Ajusta las rutas a tu dominio y a dónde tengas los certificados (p. ej. `/etc/letsencrypt/live/tudominio.com/`). Si no montas estos volúmenes, la imagen usa el certificado autofirmado generado en el Dockerfile.

### 3.4 Detener y limpiar

```bash
docker compose down
```

Para reconstruir sin caché:

```bash
docker compose build --no-cache
docker compose up -d
```

---

## 4. Deployment con Docker (sin Compose)

```bash
# Build con variables de producción
docker build \
  --build-arg API_URL=https://api.tudominio.com \
  --build-arg FRONTEND_URL=https://livemenu.tudominio.com \
  -t livemenu-frontend .

# Ejecutar
docker run -d -p 4200:80 -p 4443:443 --name livemenu-frontend livemenu-frontend
```

Para certificados reales, monta los PEM al ejecutar:

```bash
docker run -d \
  -p 4200:80 -p 4443:443 \
  -v /etc/letsencrypt/live/tudominio.com/fullchain.pem:/etc/nginx/ssl/cert.pem:ro \
  -v /etc/letsencrypt/live/tudominio.com/privkey.pem:/etc/nginx/ssl/key.pem:ro \
  --name livemenu-frontend livemenu-frontend
```

---

## 5. Nginx (contenedor)

La configuración está en `nginx.conf`:

- **HTTP (80):** sirve estáticos y `try_files $uri $uri/ /index.html` para la SPA.
- **HTTPS (443):** mismo contenido con TLS; certificados en `/etc/nginx/ssl/cert.pem` y `key.pem`.
- **`location /api`:** devuelve 502 (el API está en otro servicio; el frontend llama a `API_URL` en el cliente).

No es necesario cambiar `nginx.conf` solo por cambiar `API_URL` o `FRONTEND_URL`: esas variables se usan en el build de Angular, no en Nginx.

---

## 6. Proxy inverso delante del contenedor

En producción es habitual poner un proxy (Nginx, Caddy, Traefik) en el host que:

- Termina HTTPS con Let's Encrypt.
- Hace proxy hacia el contenedor por HTTP.

Ejemplo con **Caddy** (HTTPS automático):

```text
livemenu.tudominio.com {
    reverse_proxy localhost:4200
}
```

Ejemplo con **Nginx** en el host:

```nginx
server {
    listen 443 ssl;
    server_name livemenu.tudominio.com;
    ssl_certificate     /etc/letsencrypt/live/livemenu.tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/livemenu.tudominio.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:4200;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

En ese caso puedes exponer solo el puerto 80 del contenedor (mapeado p. ej. a 4200) y dejar que el proxy gestione HTTPS.

---

## 7. Kubernetes (opcional)

Si despliegas en Kubernetes:

1. **Build y push** de la imagen a un registro (p. ej. GCR, Docker Hub):
   ```bash
   docker build --build-arg API_URL=... --build-arg FRONTEND_URL=... -t tu-registry/livemenu-frontend:tag .
   docker push tu-registry/livemenu-frontend:tag
   ```

2. **Deployment:** un Deployment que use esa imagen y sirva los estáticos (Nginx ya va dentro de la imagen).

3. **Configuración:** `API_URL` y `FRONTEND_URL` deben ser los correctos **en el momento del build**, porque se compilan en el bundle. No se pueden cambiar solo con variables de entorno en runtime.

4. **Servicio e Ingress:** un Service (ClusterIP o NodePort) y un Ingress que apunte al frontend (p. ej. `livemenu.tudominio.com`). TLS puede gestionarse con cert-manager + Let's Encrypt.

5. **Secrets:** no hace falta inyectar secrets en el frontend para API_URL si ya está fijado en el build; el backend es quien debe tener sus propios secrets.

---

## 8. Comprobaciones post-deployment

1. **Página de login:** `https://tu-frontend/login` carga y el formulario envía a `API_URL`.
2. **Menú público:** `https://tu-frontend/m/{slug}` carga el menú (comprueba que `FRONTEND_URL` sea la misma que usa el usuario, para que los QR lleven al mismo origen).
3. **Consola del navegador:** no debe haber errores 404 a `index.html` en rutas como `/m/xxx` (fallback SPA correcto).
4. **CORS:** el backend debe permitir el origen del frontend (`FRONTEND_URL`) en las cabeceras CORS.

---

## 9. Resumen de archivos relevantes

| Archivo | Descripción |
|---------|-------------|
| `Dockerfile` | Multi-stage: Node 20 build → Nginx Alpine + estáticos + cert autofirmado |
| `docker-compose.yml` | Build con `API_URL`/`FRONTEND_URL`, puertos 4200/4443, volúmenes opcionales para PEM |
| `nginx.conf` | Servidor HTTP/HTTPS, SPA fallback, `location /api` → 502 |
| `.env.example` | Plantilla de variables (API_URL, FRONTEND_URL) |
| `scripts/load-env.js` | Genera `src/app/core/generated/config.ts` desde `.env` o env (build) |

Si necesitas cambiar el dominio o el API, actualiza `API_URL` y `FRONTEND_URL`, vuelve a hacer **build** de la imagen y vuelve a desplegar.
