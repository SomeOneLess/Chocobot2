import { chargeInteraction } from '../../services/economy/history.js';
export default {
  name: 'poseer',
  aliases: ['possess'],
  category: 'nsfw',
  description: 'Interacción: poseer',
  react: '😈',
  reactSuccess: '😈',
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
    'poseyó a',
    'tomó posesión de',
    'poseyó con deseo a',
    'reclamó a',
    'poseyó en la cama a',
    'tomó como suyo/a a',
    'poseyó con pasión a',
    'reclamó el cuerpo de',
    'poseyó intensamente a',
    'tomó posesión de',
    'poseyó con lujuria a',
    'reclamó a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `😈 @${clean(sender)} ${phrase} @${clean(target)}`,
      mentions: [sender, target],
    });
  },
};
