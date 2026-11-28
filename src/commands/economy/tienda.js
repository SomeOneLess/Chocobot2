import { getUser, updateUser } from '../../services/database/users.js';
import { saveEconomyFile } from '../../services/database/economyFile.js';
import { addPremiumDays } from '../../services/premium/index.js';
import { addHistory, refund } from '../../services/economy/history.js';
import { fetchStickerGif } from '../../services/gif/index.js';
import { gifToSticker } from '../../services/media/stickers.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import config from '../../config/index.js';

const execAsync = promisify(exec);

const directItems = {
  sticker: {
    name: 'Sticker de GIF aleatorio',
    price: 100,
    type: 'sticker',
    emoji: '📦',
  },
};
const legacyAliases = { caja: 'sticker', cajas: 'sticker' };

const categories = {
  servicios: {
    name: 'Servicios',
    emoji: '🛠️',
    items: {
      anonimo: { name: 'Mensaje anónimo', price: 800, type: 'anonimo' },
      unwarn:  { name: 'Quitar 1 warn', price: 5000, type: 'unwarn' },
      marco:   { name: 'Marco foto de perfil', price: 600, type: 'marco' },
    },
  },
  sonidos: {
    name: 'Sonidos',
    emoji: '🔊',
    items: {
      airhorn: { name: 'Airhorn', price: 300, sound: 'airhorn' },
      bruh:    { name: 'Bruh', price: 250, sound: 'bruh' },
      wow:     { name: 'Wow', price: 200, sound: 'wow' },
    },
  },
  premium: {
    name: 'Premium',
    emoji: '👑',
    items: {
      d1:  { name: 'Premium 1 día', price: 1350, type: 'premium', days: 1 },
      d7:  { name: 'Premium 7 días', price: 7200, type: 'premium', days: 7 },
      d30: { name: 'Premium 30 días', price: 22500, type: 'premium', days: 30 },
    },
  },
};

const soundUrls = {
  airhorn: 'https://www.myinstants.com/media/sounds/mlg-airhorn.mp3',
  bruh:    'https://www.myinstants.com/media/sounds/bruh.mp3',
  wow:     'https://www.myinstants.com/media/sounds/anime-wow-sound-effect.mp3',
};

export default {
  name: 'tienda',
  aliases: ['shop', 'comprar'],
  category: 'economy',
  description: 'Tienda por categorías',
  react: '🛒',
  async execute({ sock, remoteJid, sender, args }) {
    const rawCat = (args[0] || '').toLowerCase();
    const isLegacy = Boolean(legacyAliases[rawCat]);
    const catKey = legacyAliases[rawCat] || rawCat;

    if (!catKey || catKey === 'lista') {
      let text = '*🛒 Tienda*\n\n';
      for (const [key, it] of Object.entries(directItems)) {
        text += `${it.emoji} *${key}* — $${it.price} (${it.name})\n`;
      }
      for (const [key, cat] of Object.entries(categories)) {
        text += `${cat.emoji} *${key}* — ${cat.name}\n`;
      }
      text += '\n*Precios de interacciones*\n';
      text += '• Roleplay SFW: $10\n• NSFW: $100\n• .voz: $20\n• .ia: $50\n';
      text += '\nUso: .tienda sticker [búsqueda] | .tienda <categoría>';
      await sock.sendMessage(remoteJid, { text });
      return;
    }

    let item, extra;

    const direct = directItems[catKey];
    if (direct) {
      item = direct;
      extra = args.slice(1);
      if (isLegacy && (extra[0] || '').toLowerCase() === 'caja') extra = extra.slice(1);
    } else {
      const category = categories[catKey];
      if (!category) {
        await sock.sendMessage(remoteJid, { text: 'Categoría no encontrada. Usa .tienda' });
        return;
      }

      const itemKey = (args[1] || '').toLowerCase();
      if (!itemKey) {
        let text = `*${category.emoji} ${category.name}*\n\n`;
        if (catKey === 'premium') {
          text += 'Beneficios:\n• GIFs en interacciones\n• NSFW al 50%\n• .voz e .ia gratis\n• XP x2\n\n';
        }
        for (const [key, it] of Object.entries(category.items)) {
          text += `• *${key}* — $${it.price} (${it.name})\n`;
        }
        text += `\nUso: .tienda ${catKey} <item>`;
        await sock.sendMessage(remoteJid, { text });
        return;
      }

      item = category.items[itemKey];
      if (!item) {
        await sock.sendMessage(remoteJid, { text: 'Item no encontrado.' });
        return;
      }
      extra = args.slice(2);
    }

    const user = getUser(sender);
    if ((user.wallet || 0) < item.price) {
      await sock.sendMessage(remoteJid, { text: `Necesitas $${item.price}. Tienes $${user.wallet || 0}.` });
      return;
    }

    if (item.type === 'marco') {
      try {
        await sock.profilePictureUrl(sender, 'image');
      } catch {
        await sock.sendMessage(remoteJid, { text: 'No se pudo obtener tu foto de perfil.' });
        return;
      }
    }

    updateUser(sender, { wallet: user.wallet - item.price });
    saveEconomyFile();
    addHistory(sender, 'tienda', -item.price, item.name);

    if (item.type === 'sticker') {
      try {
        const query = extra.join(' ').trim();
        await sock.sendMessage(remoteJid, { text: '⏳ Buscando un GIF y creando tu sticker...' });
        const gif = await fetchStickerGif({ query });
        const sticker = await gifToSticker(gif.buffer, { maxSeconds: config.sticker?.maxDurationSec ?? 10 });
        await sock.sendMessage(remoteJid, { sticker });
        if (gif.ignoredQuery) {
          await sock.sendMessage(remoteJid, { text: 'ℹ️ La búsqueda por texto necesita GIPHY_API_KEY; se usó un GIF aleatorio.' });
        }
      } catch (err) {
        console.error('tienda/sticker error:', err.message);
        refund(sender, item.price, 'reembolso sticker');
        await sock.sendMessage(remoteJid, { text: `❌ No se pudo crear el sticker: ${err.message}. Se te devolvieron $${item.price}.` }).catch(() => {});
      }
      return;
    }

    if (item.type === 'anonimo') {
      const target = extra[0];
      const text = extra.slice(1).join(' ');
      if (!target || !text) {
        await sock.sendMessage(remoteJid, { text: 'Uso: .tienda servicios anonimo <número> <texto>' });
        updateUser(sender, { wallet: user.wallet });
        return;
      }
      const jid = target.replace(/\D/g, '') + '@s.whatsapp.net';
      try {
        const sent = await sock.sendMessage(jid, { text: `📨 Mensaje anónimo:\n${text}` });
        await sock.sendMessage(remoteJid, { text: '✅ Mensaje anónimo enviado.' });
        setTimeout(async () => {
          try {
            if (sent?.key) {
              await sock.chatModify({ deleteForMe: { deleteMedia: false, key: sent.key, timestamp: Date.now() } }, jid);
            }
          } catch {}
        }, 5 * 60 * 1000);
      } catch {
        await sock.sendMessage(remoteJid, { text: 'No se pudo enviar el mensaje.' });
        updateUser(sender, { wallet: user.wallet });
      }
      return;
    }

    if (item.type === 'unwarn') {
      const newWarns = Math.max(0, (user.warns || 0) - 1);
      updateUser(sender, { warns: newWarns });
      await sock.sendMessage(remoteJid, { text: `✅ Warn quitado. Ahora tienes ${newWarns}.` });
      return;
    }

    if (item.type === 'marco') {
      try {
        const url = await sock.profilePictureUrl(sender, 'image');
        await sock.sendMessage(remoteJid, { image: { url }, caption: '🖼️ Foto de perfil (marco en desarrollo)' });
      } catch {
        await sock.sendMessage(remoteJid, { text: 'No se pudo obtener la foto de perfil.' });
        updateUser(sender, { wallet: user.wallet });
      }
      return;
    }

    if (item.sound) {
      const soundUrl = soundUrls[item.sound];
      if (soundUrl) {
        try {
          const res = await fetch(soundUrl);
          const mp3 = Buffer.from(await res.arrayBuffer());
          const id = Date.now();
          const tempDir = config.paths.temp;
          if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
          const mp3Path = path.join(tempDir, `s_${id}.mp3`);
          const oggPath = path.join(tempDir, `s_${id}.ogg`);
          fs.writeFileSync(mp3Path, mp3);
          await execAsync(`ffmpeg -i "${mp3Path}" -c:a libopus -b:a 64k "${oggPath}" -y`);
          const audio = fs.readFileSync(oggPath);
          await sock.sendMessage(remoteJid, { audio, mimetype: 'audio/ogg; codecs=opus', ptt: true });
          fs.unlinkSync(mp3Path);
          fs.unlinkSync(oggPath);
        } catch {}
      }
      await sock.sendMessage(remoteJid, { text: `🔊 ${item.name}` });
      return;
    }

    if (item.type === 'premium') {
      const until = addPremiumDays(sender, item.days);
      const days = Math.ceil((until - Date.now()) / (24 * 60 * 60 * 1000));
      await sock.sendMessage(remoteJid, { text: `👑 Premium activado. Expira en ${days} días.` });
      return;
    }
  },
};
