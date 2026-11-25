import { chargeInteraction } from '../../services/economy/history.js';
export default {
  name: 'acurrucar',
  aliases: ['cuddle'],
  category: 'roleplay',
  description: 'Interacción: acurrucar',
  react: '🛌',
  reactSuccess: '🛌',
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
    'se acurrucó con',
    'se acurrucó junto a',
    'se hizo un ovillo con',
    'se acurrucó en el regazo de',
    'se acurrucó cariñosamente con',
    'se acurrucó para dormir con',
    'se acurrucó cálidamente con',
    'se acurrucó protectoramente con',
    'se acurrucó tiernamente con',
    'se acurrucó en los brazos de',
    'se acurrucó cómodamente con',
    'se acurrucó con amor con',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `🛌 @${clean(sender)} ${phrase} @${clean(target)}`,
      mentions: [sender, target],
    });
  },
};
