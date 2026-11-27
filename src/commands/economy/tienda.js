import { getUser, updateUser } from '../../services/database/users.js';
import { saveEconomyFile } from '../../services/database/economyFile.js';
import { addPremiumDays } from '../../services/premium/index.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import config from '../../config/index.js';

const execAsync = promisify(exec);

const categories = {
  cajas: {
    name: 'Cajas de stickers',
    emoji: '📦',
    items: {
      caja: { name: 'Caja de stickers', price: 100, type: 'caja' },
    },
  },
  servicios: {
    name: 'Servicios',
    emoji: '🛠️',
    items: {
      anonimo:   { name: 'Mensaje anónimo',       price: 800, type: 'anonimo' },
      unwarn:    { name: 'Quitar 1 warn',         price: 5000, type: 'unwarn' },
      marco:     { name: 'Marco foto de perfil',  price: 600, type: 'marco' },
    },
  },
  sonidos: {
    name: 'Sonidos',
    emoji: '🔊',
    items: {
      airhorn: { name: 'Airhorn', price: 300, sound: 'airhorn' },
      bruh:    { name: 'Bruh',    price: 250, sound: 'bruh' },
      wow:     { name: 'Wow',     price: 200, sound: 'wow' },
    },
  },
  premium: {
    name: 'Premium',
    emoji: '👑',
    items: {
      d1:  { name: 'Premium 1 día',  price: 1350,  type: 'premium', days: 1 },
      d7:  { name: 'Premium 7 días', price: 7200,  type: 'premium', days: 7 },
      d30: { name: 'Premium 30 días',price: 22500, type: 'premium', days: 30 },
    },
  },
};

const soundUrls = {
  airhorn: 'https://www.myinstants.com/media/sounds/mlg-airhorn.mp3',
  bruh:    'https://www.myinstants.com/media/sounds/bruh.mp3',
  wow:     'https://www.myinstants.com/media/sounds/anime-wow-sound-effect.mp3',
};

// Stickers de fallback (favoritos / genéricos)
const fallbackStickers = [
  'https://api.waifu.pics/sfw/hug',
  'https://api.waifu.pics/sfw/kiss',
  'https://api.waifu.pics/sfw/pat',
  'https://api.waifu.pics/sfw/cuddle',
];

async function gifToSticker(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return null;
    const data = await res.json();
    const gifUrl = data.url;
    if (!gifUrl) return null;

    const gifRes = await fetch(gifUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!gifRes.ok) return null;
    const gifBuffer = Buffer.from(await gifRes.arrayBuffer());

    const id = Date.now() + Math.floor(Math.random() * 1000);
    const tempDir = config.paths.temp;
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const input = path.join(tempDir, `g_${id}.gif`);
    const output = path.join(tempDir, `s_${id}.webp`);

    fs.writeFileSync(input, gifBuffer);
    await execAsync(`ffmpeg -y -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000" -c:v libwebp -quality 60 -loop 0 -an -vsync 0 "${output}"`);

    if (fs.existsSync(output) && fs.statSync(output).size > 100) {
      const sticker = fs.readFileSync(output);
      fs.unlinkSync(input);
      fs.unlinkSync(output);
      return sticker;
    }
  } catch (err) {
    console.error('gifToSticker error:', err.message);
  }
  return null;
}

export default {
  name: 'tienda',
  aliases: ['shop', 'comprar'],
  category: 'economy',
  description: 'Tienda por categorías',
  react: '🛒',
  async execute({ sock, remoteJid, sender, args }) {
    const catKey = (args[0] || '').toLowerCase();
    const itemKey = (args[1] || '').toLowerCase();

    if (!catKey || catKey === 'lista') {
      let text = '*🛒 Tienda*\n\n';
      for (const [key, cat] of Object.entries(categories)) {
        text += `${cat.emoji} *${key}* — ${cat.name}\n`;
      }
      text += '\n*Precios de interacciones*\n';
      text += '• Roleplay SFW: $10\n';
      text += '• NSFW: $100\n';
      text += '• .voz: $20\n';
      text += '• .ia: $50\n';
      text += '\nUso: .tienda <categoría> [item]';
      await sock.sendMessage(remoteJid, { text });
      return;
    }

    const category = categories[catKey];
    if (!category) {
      await sock.sendMessage(remoteJid, { text: 'Categoría no encontrada. Usa .tienda' });
      return;
    }

    if (!itemKey) {
      let text = `*${category.emoji} ${category.name}*\n\n`;
      if (catKey === 'premium') {
        text += 'Beneficios:\n';
        text += '• GIFs en interacciones\n';
        text += '• NSFW al 50%\n';
        text += '• .voz e .ia gratis\n';
        text += '• XP x2\n\n';
      }
      for (const [key, item] of Object.entries(category.items)) {
        text += `• *${key}* — $${item.price} (${item.name})\n`;
      }
      text += `\nUso: .tienda ${catKey} <item>`;
      await sock.sendMessage(remoteJid, { text });
      return;
    }

    const item = category.items[itemKey];
    if (!item) {
      await sock.sendMessage(remoteJid, { text: 'Item no encontrado.' });
      return;
    }

    const user = getUser(sender);
    if ((user.wallet || 0) < item.price) {
      await sock.sendMessage(remoteJid, { text: `Necesitas $${item.price}. Tienes $${user.wallet || 0}.` });
      return;
    }

    // Validaciones especiales antes de cobrar
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

    // Caja de stickers
    if (item.type === 'caja') {
      const count = 3;
      let sent = 0;
      for (let i = 0; i < count; i++) {
        const url = fallbackStickers[Math.floor(Math.random() * fallbackStickers.length)];
        const sticker = await gifToSticker(url);
        if (sticker) {
          await sock.sendMessage(remoteJid, { sticker });
          sent++;
        }
      }
      await sock.sendMessage(remoteJid, { text: `📦 Caja abierta. Stickers enviados: ${sent}` });
      return;
    }

    // Reset work
    if (item.type === 'resetwork') {
      updateUser(sender, { last_work: 0 });
      await sock.sendMessage(remoteJid, { text: '⏱️ Cooldown de trabajo reiniciado.' });
      return;
    }

    // Mensaje anónimo
    if (item.type === 'anonimo') {
      const target = args[2];
      const text = args.slice(3).join(' ');
      if (!target || !text) {
        await sock.sendMessage(remoteJid, { text: 'Uso: .tienda servicios anonimo <número> <texto>' });
        updateUser(sender, { wallet: user.wallet });
        return;
      }
      const jid = target.replace(/\D/g, '') + '@s.whatsapp.net';
      try {
        const sent = await sock.sendMessage(jid, { text: `📨 Mensaje anónimo:\n${text}` });
        await sock.sendMessage(remoteJid, { text: '✅ Mensaje anónimo enviado.' });

        // Eliminar "para mí" después de 5 minutos en ambos chats
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

    // Quitar warn
    if (item.type === 'unwarn') {
      const newWarns = Math.max(0, (user.warns || 0) - 1);
      updateUser(sender, { warns: newWarns });
      await sock.sendMessage(remoteJid, { text: `✅ Warn quitado. Ahora tienes ${newWarns}.` });
      return;
    }

    // Marco (simplificado por ahora)
    if (item.type === 'marco') {
      try {
        const url = await sock.profilePictureUrl(sender, 'image');
        await sock.sendMessage(remoteJid, {
          image: { url },
          caption: '🖼️ Foto de perfil (marco en desarrollo)',
        });
      } catch {
        await sock.sendMessage(remoteJid, { text: 'No se pudo obtener la foto de perfil.' });
        updateUser(sender, { wallet: user.wallet }); // reembolso
      }
      return;
    }

    // Sonidos
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

    // Premium
    if (item.type === 'premium') {
      const until = addPremiumDays(sender, item.days);
      const days = Math.ceil((until - Date.now()) / (24 * 60 * 60 * 1000));
      await sock.sendMessage(remoteJid, { text: `👑 Premium activado. Expira en ${days} días.` });
      return;
    }

    // Boosts
    if (item.type === 'xp') {
      updateUser(sender, { exp: (user.exp || 0) + item.amount });
      await sock.sendMessage(remoteJid, { text: `⭐ +${item.amount} XP` });
    } else if (item.type === 'bank') {
      updateUser(sender, { bank: (user.bank || 0) + item.amount });
      await sock.sendMessage(remoteJid, { text: `🏦 +$${item.amount} en el banco` });
    }
  },
};
