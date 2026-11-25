# Whitelist opcional

Este módulo **no está activo por defecto**.

## Para qué sirve
Restringe el bot para que solo responda en chats donde se haya ejecutado `.whitelist true`.
Útil cuando el bot corre en un teléfono personal y no quieres que responda en todos los chats.

## Cómo activarlo
1. Copia `optional/whitelist/whitelist.js` a `src/commands/admin/whitelist.js`
2. En `src/core/commandHandler.js`, agrega el import y el chequeo (ver instrucciones abajo).
3. Reinicia el bot.

## Instrucciones de integración

En `src/core/commandHandler.js`:

```js
import { isWhitelisted } from '../commands/admin/whitelist.js';
```

Dentro de `handleMessages`, después de obtener el comando:

```js
if (!['whitelist', 'wl'].includes(name.toLowerCase())) {
  if (!isWhitelisted(remoteJid)) continue;
}
```

El archivo de datos se guarda en `data/whitelist.json`.
