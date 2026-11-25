import { getUser, updateUser } from '../../services/database/users.js';
import { saveEconomyFile } from '../../services/database/economyFile.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import config from '../../config/index.js';

const execAsync = promisify(exec);

const categories = {
  stickers: {
    name: 'Stickers',
    emoji: '🖼️',
    items: {
      hug:   { name: 'Abrazo',    price: 800,  action: 'hug' },
      kiss:  { name: 'Beso',      price: 1000, action: 'kiss' },
      pat:   { name: 'Caricia',   price: 700,  action: 'pat' },
      cuddle:{ name: 'Acurrucar', price: 900,  action: 'cuddle' },
      slap:  { name: 'Cachetada', price: 850,  action: 'slap' },
      nsfw:  { name: 'NSFW',      price: 2500, action: 'waifu', nsfw: true },
    },
  },
  sonidos: {
    name: 'Sonidos',
    emoji: '🔊',
    items: {
      airhorn: { name: 'Airhorn', price: 300, sound: 'airhorn' },
      bruh:    { name: 'Bruh',    price: 250, sound: 'bruh' },
      wow:     { name: 'Wow',     price: 200, sound: 'wow' },
      oof:     { name: 'Oof',     price: 200, sound: 'oof' },
      yeet:    { name: 'Yeet',    price: 350, sound: 'yeet' },
    },
  },
  boosts: {
    name: 'Mejoras',
    emoji: '⭐',
    items: {
      xp:   { name: '+50 XP',          price: 500,  type: 'xp',   amount: 50 },
      bank: { name: 'Banco +1000',     price: 1500, type: 'bank', amount: 1000 },
    },
  },
};

const soundUrls = {
  airhorn: 'https://www.myinstants.com/media/sounds/mlg-airhorn.mp3',
  bruh:    'https://www.myinstants.com/media/sounds/bruh.mp3',
  wow:     'https://www.myinstants.com/media/sounds/anime-wow-sound-effect.mp3',
  oof:     'https://www.myinstants.com/media/sounds/roblox-death-sound_1.mp3',
  yeet:    'https://www.myinstants.com/media/sounds/yeet.mp3',
};

async function gifToSticker(gifBuffer) {
  const id = Date.now();
  const tempDir = config.paths.temp;
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  const input = path.join(tempDir, `gif_${id}`);
  const output = path.join(tempDir, `stk_${id}.webp`);
  fs.writeFileSync(input, gifBuffer);
  try {
    await execAsync(`ffmpeg -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000" -c:v libwebp -quality 70 -loop 0 -an -vsync 0 "${output}" -y`);
    if (fs.existsSync(output)) {
      const sticker = fs.readFileSync(output);
      fs.unlinkSync(input);
      fs.unlinkSync(output);
      return sticker;
    }
  } catch {}
  try { fs.unlinkSync(input); } catch {}
  try { fs.unlinkSync(output); } catch {}
  return null;
}

async function getGif(action) {
  try {
    const map = { hug: 'hug', kiss: 'kiss', pat: 'pat', cuddle: 'cuddle', slap: 'slap', waifu: 'waifu' };
    const cat = map[action] || 'hug';
    const endpoint = action === 'waifu' ? `https://api.waifu.pics/nsfw/${cat}` : `https://api.waifu.pics/sfw/${cat}`;
    const res = await fetch(endpoint);
    const data = await res.json();
    return data.url || null;
  } catch {
    return null;
  }
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

    // Lista de categorías
    if (!catKey || catKey === 'lista') {
      let text = '*🛒 Tienda*\n\n';
      for (const [key, cat] of Object.entries(categories)) {
        text += `${cat.emoji} *${key}* — ${cat.name}\n`;
      }
      text += '\n*Precios de interacciones*\n';
      text += '• Roleplay SFW: $10\n';
      text += '• NSFW: $100\n';
      text += '\nUso: .tienda <categoría> [item]';
      await sock.sendMessage(remoteJid, { text });
      return;
    }

    const category = categories[catKey];
    if (!category) {
      await sock.sendMessage(remoteJid, { text: 'Categoría no encontrada. Usa .tienda' });
      return;
    }

    // Lista de items de la categoría
    if (!itemKey) {
      let text = `*${category.emoji} ${category.name}*\n\n`;
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

    updateUser(sender, { wallet: user.wallet - item.price });
    saveEconomyFile();

    // Stickers
    if (item.action) {
      const url = await getGif(item.action);
      if (url) {
        try {
          const res = await fetch(url);
          const gifBuffer = Buffer.from(await res.arrayBuffer());
          const sticker = await gifToSticker(gifBuffer);
          if (sticker) {
            await sock.sendMessage(remoteJid, { sticker });
            await sock.sendMessage(remoteJid, { text: `🖼️ Compraste *${item.name}*` });
            return;
          }
        } catch {}
      }
      await sock.sendMessage(remoteJid, { text: `Compraste *${item.name}* pero no se pudo generar el sticker.` });
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
          const mp3Path = path.join(tempDir, `snd_${id}.mp3`);
          const oggPath = path.join(tempDir, `snd_${id}.ogg`);
          fs.writeFileSync(mp3Path, mp3);
          await execAsync(`ffmpeg -i "${mp3Path}" -c:a libopus -b:a 64k "${oggPath}" -y`);
          const audio = fs.readFileSync(oggPath);
          await sock.sendMessage(remoteJid, { audio, mimetype: 'audio/ogg; codecs=opus', ptt: true });
          fs.unlinkSync(mp3Path);
          fs.unlinkSync(oggPath);
          await sock.sendMessage(remoteJid, { text: `🔊 Compraste *${item.name}*` });
          return;
        } catch {}
      }
      await sock.sendMessage(remoteJid, { text: `Compraste *${item.name}* pero no se pudo enviar el sonido.` });
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
