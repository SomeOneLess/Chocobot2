import { chargeInteraction } from '../../services/economy/history.js';
import { sendInteraction } from '../../services/roleplay/interaction.js';
export default {
  name: 'cocinar',
  aliases: ['cook'],
  category: 'roleplay',
  description: 'Interacción: cocinar',
  react: '🍳',
  reactSuccess: '🍳',
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
    'cocinó para',
    'le preparó comida a',
    'cocinó con amor para',
    'le hizo de comer a',
    'cocinó un plato especial para',
    'le preparó la cena a',
    'cocinó con cariño para',
    'le hizo un plato a',
    'cocinó algo rico para',
    'le preparó el desayuno a',
    'cocinó con dedicación para',
    'le hizo de comer con amor a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sendInteraction({ sock, remoteJid, sender, target, text: `🍳 @${clean(sender)} ${phrase} @${clean(target)}`, command: this.name, kind: 'sfw' });
  },
};
