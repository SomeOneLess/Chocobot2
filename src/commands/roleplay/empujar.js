import { chargeInteraction } from '../../services/economy/history.js';
export default {
  name: 'empujar',
  aliases: ['push'],
  category: 'roleplay',
  description: 'Interacción: empujar',
  react: '👐',
  reactSuccess: '👐',
  async execute({ sock, remoteJid, sender, mentions, quoted, args }) {
    const charge = chargeInteraction(sender, 10, this.name || 'roleplay');
    if (!charge.ok) {
      await sock.sendMessage(remoteJid, { text: `Necesitas $10. Tienes $${charge.wallet}.` });
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
    'empujó juguetonamente a',
    'le dio un empujón a',
    'empujó suavemente a',
    'le dio un empujoncito a',
    'empujó con cariño a',
    'le dio un empujón juguetón a',
    'empujó divertidamente a',
    'le dio un empujón suave a',
    'empujó juguetonamente a',
    'le dio un empujoncito a',
    'empujó con una sonrisa a',
    'le dio un empujón a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `👐 @${clean(sender)} ${phrase} @${clean(target)}`,
      mentions: [sender, target],
    });
  },
};
