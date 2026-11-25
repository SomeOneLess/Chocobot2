import { chargeInteraction } from '../../services/economy/history.js';
export default {
  name: 'abrazar',
  aliases: ['hug'],
  category: 'roleplay',
  description: 'Abrazar a alguien',
  react: '🤗',
  reactSuccess: '🤗',
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
      'abrazó con fuerza a', 'le dio un abrazo cálido a', 'envolvió en sus brazos a',
      'abrazó por detrás a', 'le dio un abrazo de oso a', 'abrazó suavemente a',
      'le dio un abrazo reconfortante a', 'abrazó con cariño a', 'le dio un abrazo largo a',
      'abrazó protectoramente a', 'le dio un abrazo tierno a', 'abrazó con amor a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `🤗 @${clean(sender)} ${phrase} @${clean(target)}`,
      mentions: [sender, target],
    });
  },
};
