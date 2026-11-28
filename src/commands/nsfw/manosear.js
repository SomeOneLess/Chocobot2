import { chargeInteraction } from '../../services/economy/history.js';
import { sendInteraction } from '../../services/roleplay/interaction.js';
export default {
  name: 'manosear',
  aliases: ['grope'],
  category: 'nsfw',
  description: 'Interacción: manosear',
  react: '✋',
  reactSuccess: '✋',
  async execute({ sock, remoteJid, sender, mentions, quoted, args }) {
    const charge = chargeInteraction(sender, 100, this.name || 'nsfw');
    if (!charge.ok) {
      await sendInteraction({ sock, remoteJid, sender, target, text: `Necesitas $100. Tienes $${charge.wallet}.` });
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
    'manoseó a',
    'le manoseó el cuerpo a',
    'manoseó con deseo a',
    'le tocó las partes íntimas a',
    'manoseó sensualmente a',
    'le manoseó con lujuria a',
    'manoseó apasionadamente a',
    'le recorrió el cuerpo a',
    'manoseó con ganas a',
    'le manoseó íntimamente a',
    'manoseó eróticamente a',
    'le tocó con deseo a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `✋ @${clean(sender)} ${phrase} @${clean(target)}`, command: this.name, kind: 'nsfw' });
  },
};
