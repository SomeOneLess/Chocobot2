# Chocobot 2.0 🍫

Bot de WhatsApp modular, estable y extensible construido desde cero con Node.js, Baileys y SQLite.

Diseñado para Debian 13 + PM2.

## Instalación rápida (Debian 13)

```bash
# Node.js LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs ffmpeg

# PM2
sudo npm install -g pm2

# Proyecto
git clone <este-repo> Chocobot
cd Chocobot
cp .env.example .env
# Edita .env con tu número de propietario

npm install
```

## Primera vinculación

```bash
npm start
# Escanea el QR o usa: npm start -- --code
```

## Ejecución permanente

```bash
npm run pm2:start
pm2 save
pm2 startup
# Sigue las instrucciones que imprime pm2 startup
```

## Scripts

| Comando              | Descripción              |
|----------------------|--------------------------|
| `npm start`          | Inicia en primer plano   |
| `npm run dev`        | Modo watch               |
| `npm run pm2:start`  | Inicia con PM2           |
| `npm run pm2:logs`   | Ver logs                 |
| `npm run pm2:restart`| Reinicia                 |

## Estructura

- `src/config/` — Configuración centralizada
- `src/core/` — Conexión, handler, loader
- `src/commands/` — Comandos (uno por archivo)
- `src/services/` — Lógica de negocio (DB, economía, media, etc.)
- `data/` — Base de datos SQLite

## Próximos módulos

Los comandos de economía, admin, media, NSFW y roleplay se irán implementando sobre esta base limpia.

Para agregar un comando nuevo: crea un archivo en `src/commands/<categoría>/nombre.js` que exporte `default` con `name`, `aliases`, `category` y `execute`.

## Comandos ocultos de prueba

Estos comandos **no aparecen en `.help`** y solo funcionan para números en la whitelist de testers.

### Configurar whitelist
Edita `data/testers.json` (créalo si no existe):

```json
["5491123456789", "5491198765432"]
```

O configura `owner.number` en `src/config/defaults.js`.

### Comandos
| Comando | Descripción |
|---------|-------------|
| `.addmoney` | Suma $10.000 al objetivo |
| `.addpremium` | Añade 1 día de premium |
| `.resetcd` | Resetea cooldown de trabajo |
| `.clearwarns` | Elimina todos los warns |
| `.tester on/off @usuario` | Agrega o quita un tester |
| `.clearteseters` | Limpia toda la lista de testers |

Respuesta mínima (`✅`) para no generar ruido en grupos.
