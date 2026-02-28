# App (Frontend)

Aplicación Angular básica con Docker.

## Estructura del proyecto

```
src/app/
├── core/                   # Guards, interceptors, servicios API, constantes
├── shared/                 # Componentes reutilizables (layout, sidebar, notification)
├── features/               # Vistas (lazy-loaded)
│   ├── auth/               # login, signup, logout
│   ├── restaurants/       # listado y CRUD restaurantes
│   ├── restaurant-menu/   # categorías, platos, reorden, QR
│   ├── public-menu/       # menú público /m/:slug
│   └── analytics/         # dashboard y export
├── app.config.ts
├── app.routes.ts
└── app.component.ts
```

## Requisitos

- Node.js 20+
- npm

## Variables de entorno (.env)

Las variables se leen solo del archivo **`.env`** en la raíz. Antes de `npm start` y `npm run build` se ejecuta `scripts/load-env.js`, que genera `src/app/core/generated/config.ts` a partir de `.env`.

1. Copia la plantilla: `cp .env.example .env`
2. Edita `.env` con tus valores:

```env
# URL base del API (sin /api/v1)
API_URL=https://api.naing.co

# URL del frontend (para enlaces en QR)
FRONTEND_URL=http://localhost:4200

# UUID de restaurante para el enlace "Acceso directo a menú (pruebas)" (opcional)
# DEV_RESTAURANT_ID=550e8400-e29b-41d4-a716-446655440000
```

El archivo `.env` está en `.gitignore`; no se sube al repositorio.

## Desarrollo local

```bash
npm install
cp .env.example .env   # si aún no tienes .env
npm start
```

Abre http://localhost:4200

## Build

```bash
npm run build
```

Salida en `dist/live-menu-app/browser`.

## Docker

```bash
docker compose up --build
```

La app se sirve en http://localhost:4200.

## API (Restaurant Management CU-02)

El listado de restaurantes usa el backend según la colección Postman. El **host del API** se configura en **`.env`** con `API_URL`. Si no existe `.env`, se usan los valores por defecto del script.

- **Endpoints:** `GET/POST /api/v1/admin/restaurants`, `GET/PUT/DELETE /api/v1/admin/restaurants/:id`
- **Docker:** puedes pasar `API_URL` como build-arg o crear un `.env` antes del build

Todas las peticiones llevan `Authorization: Bearer <token>`. Para probar:

1. Haz login con `POST /api/v1/auth/login` (email, password).
2. Guarda el `access_token` de la respuesta en `localStorage` con clave `livemenu_access_token`, o implementa el flujo de login en la app para que `AuthService` lo guarde.
