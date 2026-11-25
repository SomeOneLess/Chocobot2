import { getUser, updateUser } from '../../services/database/users.js';
import { saveEconomyFile } from '../../services/database/economyFile.js';

const shop = {
  // Stickers / GIFs por categoría
  sticker_hug: { name: 'Sticker Abrazo', price: 800, action: 'hug', emoji: '🤗' },
  sticker_kiss: { name: 'Sticker Beso', price: 1000, action: 'kiss', emoji: '💋' },
  sticker_pat: { name: 'Sticker Acariciar', price: 700, action: 'pat', emoji: '🥰' },
  sticker_cuddle: { name: 'Sticker Acurrucar', price: 900, action: 'cuddle', emoji: '🛌' },
  sticker_nsfw: { name: 'Sticker NSFW', price: 2500, action: 'waifu', emoji: '🔞', nsfw: true },
  // Otros
  xp_boost: { name: '+50 XP', price: 500, type: 'xp', amount: 50, emoji: '⭐' },
  bank_slot: { name: 'Espacio banco +1000', price: 1500, type: 'bank', amount: 1000, emoji: '🏦' },
};

async function getGifUrl(action) {
  try {
    const map = { hug: 'hug', kiss: 'kiss', pat: 'pat', cuddle: 'cuddle', waifu: 'waifu' };
    const cat = map[action] || 'hug';
    const res = await fetch(`https://api.waifu.pics/sfw/${cat}`);
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
  description: 'Tienda de items y stickers',
  react: '🛒',
  async execute({ sock, remoteJid, sender, args }) {
    const itemKey = (args[0] || '').toLowerCase();

    if (!itemKey || itemKey === 'lista') {
      let text = '*🛒 Tienda*\n\n';
      for (const [key, item] of Object.entries(shop)) {
        text += `${item.emoji} *${key}* — $${item.price}\n   ${item.name}\n`;
      }
      text += '\nUso: .tienda <item>';
      await sock.sendMessage(remoteJid, { text });
      return;
    }

    const item = shop[itemKey];
    if (!item) {
      await sock.sendMessage(remoteJid, { text: 'Item no encontrado. Usa .tienda lista' });
      return;
    }

    const user = getUser(sender);
    if ((user.wallet || 0) < item.price) {
      await sock.sendMessage(remoteJid, { text: `Necesitas $${item.price}. Tienes $${user.wallet || 0}.` });
      return;
    }

    updateUser(sender, { wallet: user.wallet - item.price });
    saveEconomyFile();

    if (item.action) {
      const url = await getGifUrl(item.action);
      if (url) {
        try {
          const res = await fetch(url);
          const buffer = Buffer.from(await res.arrayBuffer());
          await sock.sendMessage(remoteJid, { sticker: buffer });
          await sock.sendMessage(remoteJid, { text: `${item.emoji} Compraste *${item.name}*` });
          return;
        } catch {}
      }
      await sock.sendMessage(remoteJid, { text: `${item.emoji} Compraste *${item.name}* (no se pudo enviar el sticker)` });
    } else if (item.type === 'xp') {
      updateUser(sender, { exp: (user.exp || 0) + item.amount });
      await sock.sendMessage(remoteJid, { text: `⭐ +${item.amount} XP` });
    } else if (item.type === 'bank') {
      updateUser(sender, { bank: (user.bank || 0) + item.amount });
      await sock.sendMessage(remoteJid, { text: `🏦 +$${item.amount} en el banco` });
    }
  },
};
