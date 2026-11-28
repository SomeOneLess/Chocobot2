import { chargeInteraction } from '../../services/economy/history.js';
import { sendInteraction } from '../../services/roleplay/interaction.js';
export default {
  name: 'apoyar',
  aliases: ['support'],
  category: 'roleplay',
  description: 'Interacción: apoyar',
  react: '💪',
  reactSuccess: '💪',
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
    'apoyó a',
    'le dio su apoyo a',
    'apoyó incondicionalmente a',
    'le brindó apoyo a',
    'apoyó en su decisión a',
    'le dio ánimos a',
    'apoyó con palabras a',
    'le ofreció su apoyo a',
    'apoyó en los momentos difíciles a',
    'le dio su respaldo a',
    'apoyó con cariño a',
    'le brindó su apoyo a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sendInteraction({ sock, remoteJid, sender, target, text: `💪 @${clean(sender)} ${phrase} @${clean(target)}`, command: this.name, kind: 'sfw' });
  },
};
