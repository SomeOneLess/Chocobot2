import { chargeInteraction } from '../../services/economy/history.js';
import { sendInteraction } from '../../services/roleplay/interaction.js';
export default {
  name: 'mamar',
  aliases: ['blow'],
  category: 'nsfw',
  description: 'Interacción: mamar',
  react: '🫦',
  reactSuccess: '🫦',
  async execute({ sock, remoteJid, sender, mentions, quoted, args }) {
    const charge = chargeInteraction(sender, 100, this.name || 'nsfw');
    if (!charge.ok) {
      await sock.sendMessage(remoteJid, { text: `Necesitas $100. Tienes $${charge.wallet}.` });
      return;
    }
    let target = mentions?.[0];
    if (!target && quoted?.participant) target = quoted.participant;
    if (!target && args?.[0]) {
      const num = args[0].replace(/\D/g, '');
      if (num.length >= 8) target = num + '@s.whatsapp.net';
    }
    if (!target) {
      await sock.sendMessage(remoteJid, { text: 'Menciona o cita a alguien.' });
      return;
    }
    const clean = (j) => j.split(':')[0].split('@')[0];
    const phrases = [
    'le mamó a',
    'le hizo una mamada a',
    'mamó con pasión a',
    'le chupó la verga a',
    'mamó con deseo a',
    'le hizo un oral a',
    'mamó intensamente a',
    'le mamó con ganas a',
    'mamó apasionadamente a',
    'le hizo una mamada a',
    'mamó con lujuria a',
    'le chupó a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sendInteraction({ sock, remoteJid, sender, target, text: `🫦 @${clean(sender)} ${phrase} @${clean(target)}`, command: this.name, kind: 'nsfw' });
  },
};
