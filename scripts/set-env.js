/**
 * Escribe environment.prod.ts con API_URL desde variable de entorno.
 * Uso: API_URL=https://api.ejemplo.com node scripts/set-env.js
 */
const fs = require('fs');
const path = require('path');

const apiUrl = process.env.API_URL || 'http://localhost:8080';
const outPath = path.join(__dirname, '../src/environments/environment.prod.ts');
const content = `/**
 * Entorno de producción.
 * La URL del API se inyecta con la variable de entorno API_URL al construir (Docker/build).
 */
export const environment = {
  production: true,
  /** Base URL del backend (sin /api/v1). Variable de entorno: API_URL */
  apiUrl: '${apiUrl.replace(/'/g, "\\'")}',
};
`;

fs.writeFileSync(outPath, content, 'utf8');
console.log('environment.prod.ts written with apiUrl:', apiUrl);
