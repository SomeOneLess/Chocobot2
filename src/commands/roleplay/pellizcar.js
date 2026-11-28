import { chargeInteraction } from '../../services/economy/history.js';
import { sendInteraction } from '../../services/roleplay/interaction.js';
export default {
  name: 'pellizcar',
  aliases: ['pinch'],
  category: 'roleplay',
  description: 'Interacción: pellizcar',
  react: '🤏',
  reactSuccess: '🤏',
  async execute({ sock, remoteJid, sender, mentions, quoted, args }) {
    const charge = chargeInteraction(sender, 10, this.name || 'roleplay');
    if (!charge.ok) {
      await sendInteraction({ sock, remoteJid, sender, target, text: `Necesitas $10. Tienes $${charge.wallet}.` });
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
    'pellizcó juguetonamente a',
    'le dio un pellizco a',
    'pellizcó suavemente a',
    'le dio un pellizquito a',
    'pellizcó con cariño a',
    'le dio un pellizco juguetón a',
    'pellizcó la mejilla de',
    'le dio un pellizco suave a',
    'pellizcó divertidamente a',
    'le dio un pellizquito a',
    'pellizcó en broma a',
    'le dio un pellizco a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `🤏 @${clean(sender)} ${phrase} @${clean(target)}`, command: this.name, kind: 'sfw' });
  },
};
