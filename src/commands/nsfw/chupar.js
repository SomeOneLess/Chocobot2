import { chargeInteraction } from '../../services/economy/history.js';
import { sendInteraction } from '../../services/roleplay/interaction.js';
export default {
  name: 'chupar',
  aliases: ['suck','oral'],
  category: 'nsfw',
  description: 'Interacción: chupar',
  react: '🫦',
  reactSuccess: '🫦',
  async execute({ sock, remoteJid, sender, mentions, quoted, args }) {
    const charge = chargeInteraction(sender, 100, this.name || 'nsfw');
    if (!charge.ok) {
      await sock.sendMessage(remoteJid, { text: `Necesitas $100. Tienes $${charge.wallet}.` });
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
    'le está chupando a',
    'le realiza sexo oral a',
    'chupa con pasión a',
    'le está haciendo oral a',
    'le chupa con deseo a',
    'le realiza una mamada a',
    'chupa intensamente a',
    'le está chupando con ganas a',
    'le hace un oral a',
    'le chupa apasionadamente a',
    'le está realizando sexo oral a',
    'le chupa con lujuria a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sendInteraction({ sock, remoteJid, sender, target, text: `🫦 @${clean(sender)} ${phrase} @${clean(target)}`, command: this.name, kind: 'nsfw' });
  },
};
