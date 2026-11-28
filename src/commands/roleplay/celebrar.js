import { chargeInteraction } from '../../services/economy/history.js';
import { sendInteraction } from '../../services/roleplay/interaction.js';
export default {
  name: 'celebrar',
  aliases: ['celebrate'],
  category: 'roleplay',
  description: 'Interacción: celebrar',
  react: '🎉',
  reactSuccess: '🎉',
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
    'celebró con',
    'festejó junto a',
    'celebró el logro de',
    'festejó alegremente con',
    'celebró con alegría a',
    'festejó el éxito de',
    'celebró con entusiasmo con',
    'festejó junto a',
    'celebró con cariño a',
    'festejó el momento con',
    'celebró con alegría junto a',
    'festejó con',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sendInteraction({ sock, remoteJid, sender, target, text: `🎉 @${clean(sender)} ${phrase} @${clean(target)}`, command: this.name, kind: 'sfw' });
  },
};
