import { chargeInteraction } from '../../services/economy/history.js';
import { sendInteraction } from '../../services/roleplay/interaction.js';
export default {
  name: 'masturbar',
  aliases: ['jerk'],
  category: 'nsfw',
  description: 'Interacción: masturbar',
  react: '💦',
  reactSuccess: '💦',
  async execute({ sock, remoteJid, sender, mentions, quoted, args }) {
    const charge = chargeInteraction(sender, 100, this.name || 'nsfw');
    if (!charge.ok) {
      await sendInteraction({ sock, remoteJid, sender, target, text: `Necesitas $100. Tienes $${charge.wallet}.` });
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
    'masturbó a',
    'le hizo una paja a',
    'masturbó con la mano a',
    'le masturbó con deseo a',
    'masturbó intensamente a',
    'le hizo llegar con la mano a',
    'masturbó con pasión a',
    'le masturbó a',
    'masturbó eróticamente a',
    'le hizo una paja a',
    'masturbó con ganas a',
    'le masturbó intensamente a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `💦 @${clean(sender)} ${phrase} @${clean(target)}`, command: this.name, kind: 'nsfw' });
  },
};
