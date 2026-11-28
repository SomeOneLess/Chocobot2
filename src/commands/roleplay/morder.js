import { chargeInteraction } from '../../services/economy/history.js';
import { sendInteraction } from '../../services/roleplay/interaction.js';

export default {
  name: 'morder',
  aliases: ['bite'],
  category: 'roleplay',
  description: 'Interacción: morder',
  react: '👄',
  reactSuccess: '👄',
  async execute({ sock, remoteJid, sender, mentions, quoted, args }) {
    const charge = chargeInteraction(sender, 10, 'morder');
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
    'interactuó con',
    'le hizo algo a',
    'se acercó a',
    'jugó con',
    'se puso cariñoso/a con',
    'le dedicó atención a',
    'compartió un momento con',
    'se mostró cercano/a con',
    'le dio cariño a',
    'se acurrucó con',
    'le hizo compañía a',
    'compartió un instante con',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    const text = `👄 @${clean(sender)} ${phrase} @${clean(target)}`;

    await sendInteraction({ sock, remoteJid, sender, target, text, command: 'morder', kind: 'sfw' });
  },
};
