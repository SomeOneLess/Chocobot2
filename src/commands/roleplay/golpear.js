import { chargeInteraction } from '../../services/economy/history.js';
import { sendInteraction } from '../../services/roleplay/interaction.js';
export default {
  name: 'golpear',
  aliases: ['hit','punch'],
  category: 'roleplay',
  description: 'Interacción: golpear',
  react: '👊',
  reactSuccess: '👊',
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
    'golpeó juguetonamente a',
    'le dio un golpe suave a',
    'golpeó en el brazo a',
    'le dio un puñetazo juguetón a',
    'golpeó con cariño a',
    'le dio un golpe ligero a',
    'golpeó divertidamente a',
    'le dio un golpe juguetón a',
    'golpeó suavemente a',
    'le dio un puñetazo suave a',
    'golpeó en broma a',
    'le dio un golpe a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sendInteraction({ sock, remoteJid, sender, target, text: `👊 @${clean(sender)} ${phrase} @${clean(target)}`, command: this.name, kind: 'sfw' });
  },
};
