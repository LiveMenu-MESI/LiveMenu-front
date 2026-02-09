# App (Frontend)

Aplicación Angular básica con Docker.

## Estructura del proyecto

```
src/app/
├── shared/                  # Componentes reutilizables
│   └── components/
│       └── layout/         # Header, Footer, MainLayout
├── features/               # Vistas (lazy-loaded)
│   ├── home/
│   └── about/
├── app.config.ts
├── app.routes.ts
└── app.component.ts
```

## Requisitos

- Node.js 20+
- npm

## Desarrollo local

```bash
npm install
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

El listado de restaurantes usa el backend según la colección Postman. El **host del API** es una variable de entorno:

- **Desarrollo:** por defecto `http://localhost:8080` en `src/environments/environment.ts`
- **Producción:** se usa `src/environments/environment.prod.ts`; la URL se define con la variable **`API_URL`**
  - Build local: `API_URL=https://api.ejemplo.com npm run build:prod`
  - Docker: `docker build --build-arg API_URL=http://backend:8080 .` o en `docker-compose.yml` pasar `API_URL`
- **Endpoints:** `GET/POST /api/v1/admin/restaurants`, `GET/PUT/DELETE /api/v1/admin/restaurants/:id`

Todas las peticiones llevan `Authorization: Bearer <token>`. Para probar:

1. Haz login con `POST /api/v1/auth/login` (email, password).
2. Guarda el `access_token` de la respuesta en `localStorage` con clave `livemenu_access_token`, o implementa el flujo de login en la app para que `AuthService` lo guarde.
