import { addPremiumDays, getPremiumInfo } from '../../services/premium/index.js';
import { getUser, updateUser } from '../../services/database/users.js';
import { saveEconomyFile } from '../../services/database/economyFile.js';
import { addHistory } from '../../services/economy/history.js';

const plans = {
  '1':  { days: 1,  price: 1500,  name: '1 día' },
  '7':  { days: 7,  price: 8000,  name: '7 días' },
  '30': { days: 30, price: 25000, name: '30 días' },
};

export default {
  name: 'premium',
  aliases: ['vip'],
  category: 'economy',
  description: 'Compra o consulta Premium',
  react: '👑',
  async execute({ sock, remoteJid, sender, args }) {
    const sub = (args[0] || '').toLowerCase();

    if (!sub || sub === 'info') {
      const info = getPremiumInfo(sender);
      let text = '*👑 Premium*\n\n';
      if (info.active) {
        text += `Estado: Activo (${info.daysLeft} días restantes)\n`;
      } else {
        text += 'Estado: Inactivo\n';
      }
      text += '\n*Planes*\n';
      for (const [key, p] of Object.entries(plans)) {
        text += `• .premium ${key} — $${p.price} (${p.name})\n`;
      }
      text += '\nBeneficios: GIFs en interacciones, 50% NSFW, .voz e .ia gratis, XP x2';
      await sock.sendMessage(remoteJid, { text });
      return;
    }

    const plan = plans[sub];
    if (!plan) {
      await sock.sendMessage(remoteJid, { text: 'Uso: .premium | .premium 1 | .premium 7 | .premium 30' });
      return;
    }

    const user = getUser(sender);
    if ((user.wallet || 0) < plan.price) {
      await sock.sendMessage(remoteJid, { text: `Necesitas $${plan.price}. Tienes $${user.wallet || 0}.` });
      return;
    }

    updateUser(sender, { wallet: user.wallet - plan.price });
    saveEconomyFile();
    addHistory(sender, 'premium', -plan.price, plan.name);

    const until = addPremiumDays(sender, plan.days);
    const days = Math.ceil((until - Date.now()) / (24 * 60 * 60 * 1000));
    await sock.sendMessage(remoteJid, { text: `👑 Premium activado. Expira en ${days} días.` });
  },
};
