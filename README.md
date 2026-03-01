# LiveMenu – Frontend (Admin Portal + Vista Pública)

Aplicación Angular para el sistema **LiveMenu**: portal de administración de restaurantes y menús, y vista pública del menú optimizada para móvil (acceso vía QR).

## Contenido de la documentación

| Documento | Descripción |
|-----------|-------------|
| [README.md](README.md) | Este archivo: requisitos, setup y uso local |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Diagramas de arquitectura (sistema completo y contexto frontend) |
| [docs/API.md](docs/API.md) | Documentación de la API consumida por este frontend |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Instrucciones de despliegue (Docker, variables, HTTPS) |

---

## Requisitos

- **Node.js** 20+
- **npm** (o compatible)

El backend LiveMenu (Quarkus + Keycloak + PostgreSQL) debe estar desplegado y accesible; la URL se configura en `.env` (ver más abajo).

---

## Estructura del proyecto

```
src/app/
├── core/                      # Lógica compartida
│   ├── constants/             # API URLs, endpoints
│   ├── generated/             # config.ts (generado desde .env)
│   ├── guards/                # authGuard para rutas protegidas
│   ├── interceptors/          # auth, error-notification
│   └── services/              # auth, restaurant, category, dish, public-menu, etc.
├── shared/                    # Componentes reutilizables
│   └── components/            # layout, sidebar, modal, notification, qr-display, etc.
├── features/                  # Vistas (lazy-loaded)
│   ├── auth/                  # login, signup, logout
│   ├── restaurants/           # listado y CRUD restaurantes
│   ├── restaurant-menu/       # categorías, platos, reorden, QR
│   ├── restaurant-menu-preview/
│   ├── public-menu/           # menú público /m/:slug
│   ├── public-dish-detail/
│   └── analytics/             # dashboard y export
├── app.config.ts
├── app.routes.ts
└── app.component.ts
```

---

## Variables de entorno

Las variables se leen **solo** del archivo **`.env`** en la raíz. Antes de `npm start` y `npm run build` se ejecuta `scripts/load-env.js`, que genera `src/app/core/generated/config.ts` a partir de `.env`.

1. Copia la plantilla:
   ```bash
   cp .env.example .env
   ```
2. Edita `.env` con tus valores:

```env
# URL base del API (sin /api/v1)
API_URL=https://api.naing.co

# URL del frontend (para enlaces en QR y correos)
FRONTEND_URL=https://livemenu.naing.co

# Opcional: UUID de restaurante para "Acceso directo a menú (pruebas)"
# DEV_RESTAURANT_ID=550e8400-e29b-41d4-a716-446655440000
```

- El archivo `.env` está en `.gitignore`; no se sube al repositorio.
- En Docker, `API_URL` y `FRONTEND_URL` se pueden pasar como build-args (ver [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)).

---

## Setup y desarrollo local

```bash
npm install
cp .env.example .env   # si aún no tienes .env
# Edita .env con tu API_URL (y FRONTEND_URL si aplica)
npm start
```

Abre **http://localhost:4200**.

- **Login:** usa las credenciales del backend (Keycloak). Tras el login, el `access_token` se guarda en `localStorage` (`livemenu_access_token`) y se envía en `Authorization: Bearer` en todas las peticiones al API.

---

## Build

```bash
npm run build
```

Salida en `dist/live-menu-app/browser`.

Para build de producción con variables de entorno de producción:

```bash
npm run build:prod
```

(Equivale a `node scripts/load-env.js production && ng build`.)

---

## Tests

```bash
npm test
```

---

## Docker

```bash
docker compose up --build -d
```

- **HTTP:** http://localhost:4200  
- **HTTPS:** https://localhost:4443 (certificado autofirmado; el navegador puede mostrar advertencia)

Por defecto la imagen usa `API_URL` y `FRONTEND_URL` del `.env` o los valores por defecto del `docker-compose.yml`. Para certificados reales (Let's Encrypt), monta los PEM en `/etc/nginx/ssl/` (ver [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)).

---

## Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/login`, `/signup` | Autenticación |
| `/logout` | Cierre de sesión |
| `/restaurants` | Listado de restaurantes (protegido) |
| `/restaurants/:restaurantId` | Gestión de menú (categorías, platos, QR) (protegido) |
| `/restaurants/:restaurantId/menu` | Vista previa del menú (protegido) |
| `/analytics` | Analytics (protegido) |
| `/m/:slug` | **Menú público** (sin auth; acceso por QR) |
| `/m/:slug/dish/:dishId` | Detalle de plato en vista pública |

---

## Licencia

Privado / uso interno según política del proyecto.
