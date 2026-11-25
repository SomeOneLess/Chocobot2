import { chargeInteraction } from '../../services/economy/history.js';
export default {
  name: 'acompanar',
  aliases: ['acompañar'],
  category: 'roleplay',
  description: 'Interacción: acompanar',
  react: '🤝',
  reactSuccess: '🤝',
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
    'acompañó a',
    'se quedó acompañando a',
    'acompañó en silencio a',
    'acompañó con apoyo a',
    'se ofreció a acompañar a',
    'acompañó en su camino a',
    'acompañó con cariño a',
    'se quedó al lado de',
    'acompañó fielmente a',
    'acompañó en los buenos y malos momentos a',
    'acompañó con paciencia a',
    'se ofreció a hacer compañía a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `🤝 @${clean(sender)} ${phrase} @${clean(target)}`,
      mentions: [sender, target],
    });
  },
};
