/**
 * Carga variables desde .env y genera src/app/core/generated/config.ts.
 * Se ejecuta antes de start y build. Solo .env; no se usa la carpeta environments.
 * Uso: node scripts/load-env.js [production]
 */
const fs = require('fs');
const path = require('path');

const isProduction = process.argv[2] === 'production';
const envPath = path.join(__dirname, '../.env');
const env = { ...process.env };

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        let value = trimmed.slice(idx + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        env[key] = value;
      }
    }
  });
}

const apiUrl = env.API_URL !== undefined ? String(env.API_URL) : 'http://api.naing.co:8080';
const devRestaurantId = env.DEV_RESTAURANT_ID;

const outDir = path.join(__dirname, '../src/app/core/generated');
const outFile = path.join(outDir, 'config.ts');

const content = `/**
 * Generado desde .env (scripts/load-env.js). No editar a mano.
 */
export const config = {
  production: ${isProduction},
  apiUrl: '${String(apiUrl).replace(/'/g, "\\'")}',
  devRestaurantId: ${devRestaurantId ? `'${String(devRestaurantId).replace(/'/g, "\\'")}'` : 'undefined'},
};
`;

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
fs.writeFileSync(outFile, content, 'utf8');

