import { chargeInteraction } from '../../services/economy/history.js';
import { sendInteraction } from '../../services/roleplay/interaction.js';
export default {
  name: 'acariciar',
  aliases: ['pat','mimos'],
  category: 'roleplay',
  description: 'Interacción: acariciar',
  react: '🥰',
  reactSuccess: '🥰',
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
    'acarició suavemente a',
    'le hizo mimos a',
    'acarició la cabeza de',
    'le dio caricias a',
    'acarició con ternura a',
    'le pasó la mano por el pelo a',
    'acarició la mejilla de',
    'le dio mimos a',
    'acarició con cariño a',
    'le hizo cosquillas suaves a',
    'acarició la espalda de',
    'le dio caricias reconfortantes a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `🥰 @${clean(sender)} ${phrase} @${clean(target)}`, command: this.name, kind: 'sfw' });
  },
};
