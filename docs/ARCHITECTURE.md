# Diagramas de Arquitectura – LiveMenu

Este documento contiene diagramas de la arquitectura del sistema LiveMenu en formato Mermaid. El **frontend** (este repositorio) es el Admin Portal y la Vista Pública del menú; el backend es Quarkus + Keycloak + PostgreSQL.

## Contexto: este repositorio (Frontend)

Este repo incluye:

- **Angular (Admin Portal):** login, restaurantes, categorías, platos, QR, analytics.
- **Vista pública del menú:** rutas `/m/:slug` y `/m/:slug/dish/:dishId`, optimizada para móvil y acceso por QR.

Todas las peticiones de datos van al backend vía `API_URL` configurada en `.env`.

---

## Diagrama de Componentes (sistema completo)

```mermaid
graph TB
    subgraph "Capa de Presentación"
        A[Angular Frontend<br/>Admin Portal]
        B[Public Menu View<br/>Mobile Optimized]
    end
    
    subgraph "Capa de Aplicación - Quarkus Backend"
        C[REST Resources]
        D[Security Filters<br/>Token Validation<br/>Rate Limiting]
        E[Services Layer]
        F[Data Layer<br/>Hibernate ORM]
    end
    
    subgraph "Capa de Infraestructura"
        G[(PostgreSQL<br/>livemenu DB)]
        H[(PostgreSQL<br/>keycloak DB)]
        I[Keycloak<br/>OAuth2/OIDC]
        J[Google Cloud Storage<br/>Images]
    end
    
    A -->|HTTPS/REST| C
    B -->|HTTPS/REST| C
    C --> D
    D --> E
    E --> F
    F --> G
    E --> I
    E --> J
    I --> H
    
    style A fill:#4CAF50
    style B fill:#4CAF50
    style C fill:#2196F3
    style D fill:#2196F3
    style E fill:#2196F3
    style F fill:#2196F3
    style G fill:#FF9800
    style H fill:#FF9800
    style I fill:#9C27B0
    style J fill:#F44336
```

---

## Flujo de autenticación (Frontend ↔ Backend)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant B as Backend
    participant K as Keycloak
    
    U->>F: 1. Registro (email, password)
    F->>B: POST /api/v1/auth/register
    B->>K: Crear usuario (Admin API)
    K-->>B: Usuario creado
    B-->>F: 201 Created
    F-->>U: Registro exitoso
    
    U->>F: 2. Login (email, password)
    F->>B: POST /api/v1/auth/login
    B->>K: Token request (password grant)
    K-->>B: access_token + refresh_token
    B-->>F: Tokens + cookies
    F-->>U: Login exitoso
    
    U->>F: 3. Request protegido
    F->>B: GET /api/v1/admin/restaurants<br/>Authorization: Bearer token
    B->>K: Validar token
    K-->>B: Token válido
    B-->>F: Datos del restaurante
    F-->>U: Mostrar datos
```

En el frontend, el token se guarda en `localStorage` (`livemenu_access_token`) y se envía mediante el `AuthInterceptor`. El refresh se hace con `POST /api/v1/auth/refresh` cuando el backend responde 401.

---

## Flujo de gestión de menú (Admin)

```mermaid
sequenceDiagram
    participant A as Admin
    participant F as Frontend
    participant B as Backend
    participant DB as PostgreSQL
    participant GCS as Google Cloud Storage
    
    A->>F: 1. Crear restaurante
    F->>B: POST /api/v1/admin/restaurants
    B->>DB: INSERT restaurant
    DB-->>B: Restaurant creado
    B-->>F: 201 Created
    
    A->>F: 2. Crear categoría
    F->>B: POST /api/v1/admin/restaurants/{id}/categories
    B->>DB: INSERT category
    DB-->>B: Category creada
    B-->>F: 201 Created
    
    A->>F: 3. Crear plato con imagen
    F->>B: POST /api/v1/admin/restaurants/{id}/dishes/with-image<br/>(multipart/form-data)
    B->>B: Procesar imagen<br/>(resize, compress)
    B->>GCS: Upload variantes<br/>(thumbnail, medium, large)
    GCS-->>B: URLs públicas
    B->>DB: INSERT dish con URLs
    DB-->>B: Dish creado
    B-->>F: 201 Created con URLs
    F-->>A: Plato creado
```

---

## Flujo de vista pública (menú por QR)

```mermaid
sequenceDiagram
    participant C as Cliente
    participant QR as Código QR
    participant F as Frontend
    participant B as Backend
    participant Cache as Caché
    participant DB as PostgreSQL
    
    C->>QR: 1. Escanear QR
    QR->>F: Redirigir a /m/{slug}
    F->>B: GET /api/v1/public/menu/{slug}
    
    B->>Cache: Verificar caché
    alt Caché disponible
        Cache-->>B: Menú cacheado
    else Caché no disponible
        B->>DB: Query restaurant + categories + dishes
        DB-->>B: Datos del menú
        B->>Cache: Guardar en caché
    end
    
    B->>DB: Registrar vista (analytics)
    B-->>F: JSON con menú completo
    F-->>C: Renderizar menú
```

La URL del QR apunta a `FRONTEND_URL/m/{slug}` (configurada en `.env` como `FRONTEND_URL`).

---

## Diagrama de deployment del frontend (Docker)

```mermaid
graph TB
    subgraph "Docker Compose - Frontend"
        subgraph "Frontend Container"
            A[Nginx<br/>Port 80/443]
            B[Angular App<br/>Static Files]
        end
        H[Build args:<br/>API_URL, FRONTEND_URL]
    end
    
    I[Backend API]
    J[Internet/Users]
    
    J -->|HTTPS/HTTP| A
    A --> B
    B -->|API Calls| I
    H -.->|Build time| B
    
    style A fill:#4CAF50
    style B fill:#4CAF50
    style I fill:#2196F3
    style J fill:#607D8B
```

El backend, Keycloak y PostgreSQL se despliegan por separado; este repo solo construye y sirve el frontend con Nginx.

---

## Convenciones de color en los diagramas

- **Verde (#4CAF50):** Frontend / Cliente
- **Azul (#2196F3):** Backend / Aplicación
- **Naranja (#FF9800):** Base de datos
- **Morado (#9C27B0):** Autenticación (Keycloak)
- **Rojo (#F44336):** Almacenamiento externo / Errores
- **Gris (#607D8B):** Infraestructura / Red

---

## Cómo visualizar los diagramas

Los diagramas están en formato Mermaid y se pueden ver en:

- **GitHub / GitLab:** renderizado automático en `.md`
- **VS Code:** extensión "Markdown Preview Mermaid Support"
- **Online:** [mermaid.live](https://mermaid.live)

---