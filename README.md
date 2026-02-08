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
