import { chargeInteraction } from '../../services/economy/history.js';
import { sendInteraction } from '../../services/roleplay/interaction.js';
export default {
  name: 'palmear',
  aliases: ['patback'],
  category: 'roleplay',
  description: 'Interacción: palmear',
  react: '👋',
  reactSuccess: '👋',
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
    'palmeó la espalda de',
    'le dio una palmada en la espalda a',
    'palmeó amistosamente a',
    'le dio una palmada a',
    'palmeó con cariño a',
    'le dio una palmada de apoyo a',
    'palmeó la espalda de',
    'le dio una palmada amistosa a',
    'palmeó con ánimo a',
    'le dio una palmada en la espalda a',
    'palmeó divertidamente a',
    'le dio una palmada a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sendInteraction({ sock, remoteJid, sender, target, text: `👋 @${clean(sender)} ${phrase} @${clean(target)}`, command: this.name, kind: 'sfw' });
  },
};
