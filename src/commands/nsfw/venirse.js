import { chargeInteraction } from '../../services/economy/history.js';
import { sendInteraction } from '../../services/roleplay/interaction.js';
export default {
  name: 'venirse',
  aliases: ['cum'],
  category: 'nsfw',
  description: 'Interacción: venirse',
  react: '💦',
  reactSuccess: '💦',
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
    'se vino sobre',
    'se corrió en',
    'se vino dentro de',
    'eyaculó sobre',
    'se vino con fuerza en',
    'se corrió sobre',
    'se vino intensamente en',
    'eyaculó en',
    'se vino apasionadamente sobre',
    'se corrió dentro de',
    'se vino con deseo en',
    'eyaculó sobre',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sendInteraction({ sock, remoteJid, sender, target, text: `💦 @${clean(sender)} ${phrase} @${clean(target)}`, command: this.name, kind: 'nsfw' });
  },
};
