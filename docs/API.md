# Documentación de API – LiveMenu (consumida por el Frontend)

Esta documentación describe los endpoints del **backend LiveMenu** que utiliza este frontend. La base URL del API se configura en `.env` con `API_URL` (sin el prefijo `/api/v1`).

**Prefijo base:** `{API_URL}/api/v1`

Todas las peticiones a rutas **admin** deben incluir:

```http
Authorization: Bearer <access_token>
```

El frontend obtiene el token con `POST /auth/login` y lo guarda en `localStorage` bajo la clave `livemenu_access_token`. Si el backend responde 401, el frontend intenta refrescar con `POST /auth/refresh` y reenvía la petición.

---

## Autenticación

### POST `/auth/register`

Registro de nuevo usuario.

**Request:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response:** `201 Created` (cuerpo según backend).

---

### POST `/auth/login`

Login con email y contraseña. Devuelve tokens.

**Request:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "Bearer",
  "expires_in": 300
}
```

El frontend guarda `access_token` y `refresh_token` y envía `Authorization: Bearer <access_token>` en las peticiones siguientes.

---

### POST `/auth/refresh`

Refrescar el access token usando el refresh token.

**Request:**

```json
{
  "refresh_token": "string"
}
```

**Response:**

```json
{
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "Bearer",
  "expires_in": 300
}
```

---

### GET `/auth/user`

Obtener el usuario actual. Requiere `Authorization: Bearer <access_token>`.

**Response:**

```json
{
  "id": "string",
  "email": "string"
}
```

---

### POST `/auth/logout`

Cerrar sesión (invalidar token en backend si aplica). Requiere token.

---

## Restaurantes (Admin)

### GET `/admin/restaurants`

Listar restaurantes del usuario. Requiere token.

**Response:** array de restaurantes (campos según backend, típicamente `id`, `name`, `slug`, `description`, `address`, `phone`, `email`, `logo_url`, `opening_hours`, etc.).

---

### POST `/admin/restaurants`

Crear restaurante. Requiere token.

**Request:** cuerpo JSON con `name`, `slug`, `description`, `address`, `phone`, `email`, etc., según el backend.

**Response:** `201 Created` + cuerpo del restaurante creado.

---

### GET `/admin/restaurants/:id`

Obtener un restaurante por ID. Requiere token.

**Response:** objeto restaurante.

---

### PUT `/admin/restaurants/:id`

Actualizar restaurante. Requiere token.

**Request:** cuerpo JSON con los campos a actualizar.

**Response:** objeto restaurante actualizado.

---

### DELETE `/admin/restaurants/:id`

Eliminar restaurante. Requiere token.

**Response:** `204 No Content` o según backend.

---

## Categorías (Admin)

### GET `/admin/restaurants/:restaurantId/categories`

Listar categorías del restaurante. Requiere token.

**Response:** array de categorías (p. ej. `id`, `name`, `description`, `position`).

---

### POST `/admin/restaurants/:restaurantId/categories`

Crear categoría. Requiere token.

**Request:** p. ej. `{ "name": "string", "description": "string", "position": number }`.

**Response:** `201 Created` + categoría.

---

### GET `/admin/restaurants/:restaurantId/categories/:categoryId`

Obtener categoría por ID. Requiere token.

---

### PUT `/admin/restaurants/:restaurantId/categories/:categoryId`

Actualizar categoría. Requiere token.

---

### DELETE `/admin/restaurants/:restaurantId/categories/:categoryId`

Eliminar categoría. Requiere token.

---

### PATCH `/admin/restaurants/:restaurantId/categories/reorder`

Reordenar categorías. Requiere token.

**Request:** array de IDs en el orden deseado (formato según backend).

**Response:** según backend.

---

## Platos (Admin)

### GET `/admin/restaurants/:restaurantId/dishes`

Listar platos. Requiere token.

**Query params (opcionales):**

- `categoryId` – filtrar por categoría
- `available` – filtrar por disponibilidad (`true`/`false`)

**Response:** array de platos (p. ej. `id`, `name`, `description`, `price`, `offer_price`, `image_url`, `available`, `featured`, `tags`, `position`, `category_id`).

---

### GET `/admin/restaurants/:restaurantId/dishes/:dishId`

Obtener un plato. Requiere token.

---

### POST `/admin/restaurants/:restaurantId/dishes`

Crear plato (sin imagen). Requiere token.

**Request:** JSON con `name`, `description`, `price`, `offer_price`, `available`, `featured`, `tags`, `position`, `category_id`, etc.

**Response:** `201 Created` + plato.

---

### POST `/admin/restaurants/:restaurantId/dishes/with-image`

Crear plato con imagen. Requiere token.

**Request:** `multipart/form-data` con campos del plato + archivo de imagen.

**Response:** `201 Created` + plato con URLs de imagen (thumbnail, medium, large, original).

---

### PUT `/admin/restaurants/:restaurantId/dishes/:dishId`

Actualizar plato (sin imagen). Requiere token.

---

### PUT `/admin/restaurants/:restaurantId/dishes/:dishId/with-image`

Actualizar plato con imagen. Requiere token.

**Request:** `multipart/form-data`.

---

### PATCH `/admin/restaurants/:restaurantId/dishes/:dishId/availability`

Cambiar disponibilidad del plato. Requiere token.

**Request:** p. ej. `{ "available": true }`.

---

### DELETE `/admin/restaurants/:restaurantId/dishes/:dishId`

Eliminar (o soft-delete) plato. Requiere token.

---

## QR (Admin)

### GET `/admin/restaurants/:restaurantId/qr`

Obtener información del QR (URL pública del menú, etc.). Requiere token.

**Response:** objeto con datos para generar/mostrar el QR (p. ej. URL que apunta a `FRONTEND_URL/m/{slug}`).

---

### GET `/admin/restaurants/:restaurantId/qr/download`

Descargar imagen del QR. Requiere token.

**Query params (opcionales):**

- `size` – `S` | `M` | `L` | `XL`
- `format` – `PNG` | `SVG`
- `includeLogo` – boolean
- `url` – URL personalizada para el QR

**Response:** imagen (PNG/SVG según `format`).

---

## Menú público (sin autenticación)

### GET `/public/menu/:slug`

Obtener menú completo para la vista pública (restaurante + categorías + platos). No requiere token. Puede tener rate limiting.

**Response:** objeto con restaurante, categorías y platos (campos necesarios para renderizar `/m/:slug`).

---

### GET `/public/menu/:slug/dishes/:dishId`

Obtener detalle de un plato en contexto público (para métricas de vistas por plato). No requiere token.

**Response:** objeto plato.

---

## Imágenes (Admin)

### POST `/images/upload`

Subir imagen (p. ej. logo del restaurante). Requiere token.

**Request:** `multipart/form-data` con el archivo.

**Response:** URL(es) de la imagen subida (según backend).

---

### DELETE `/images/:filename`

Eliminar imagen por nombre. Requiere token.

**Response:** según backend.

---

## Analytics (Admin)

### GET `/admin/restaurants/:restaurantId/analytics`

Obtener datos de analytics del restaurante. Requiere token.

**Response:** objeto con métricas (vistas de menú, vistas por plato, etc.).

---

### GET `/admin/restaurants/:restaurantId/analytics/export`

Exportar analytics. Requiere token.

**Query params (opcionales):**

- `startDate` – ISO date string
- `endDate` – ISO date string

**Response:** archivo (CSV/Excel según backend).

---

## Códigos de estado habituales

| Código | Significado |
|--------|-------------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request (validación, formato) |
| 401 | Unauthorized (token inválido o expirado) |
| 403 | Forbidden (sin permisos) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limit) |
| 500 | Error interno del servidor |

El frontend usa un interceptor para mostrar notificaciones en errores y, en 401, intentar refresh del token y reenviar la petición.

---

## Uso en el frontend

- **Constantes y URLs:** `src/app/core/constants/api.constants.ts` (usa `config.apiUrl` generado desde `.env`).
- **Servicios:** `AuthService`, `RestaurantApiService`, `CategoryApiService`, `DishApiService`, `PublicMenuService`, `QrService`, `ImageUploadService`.
- **Token:** se añade automáticamente con `AuthInterceptor`; el refresh se gestiona en el mismo interceptor.

Para cambiar el host del API, edita `API_URL` en `.env` y vuelve a ejecutar `npm start` o `npm run build`.
