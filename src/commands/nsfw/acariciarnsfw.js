import { chargeInteraction } from '../../services/economy/history.js';
import { sendInteraction } from '../../services/roleplay/interaction.js';
export default {
  name: 'acariciarnsfw',
  aliases: ['acariciar'],
  category: 'nsfw',
  description: 'Interacción: acariciarnsfw',
  react: '🔥',
  reactSuccess: '🔥',
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
    'acarició íntimamente a',
    'le acarició el cuerpo a',
    'acarició con deseo a',
    'le pasó las manos por el cuerpo a',
    'acarició sensualmente a',
    'le acarició las zonas íntimas a',
    'acarició con lujuria a',
    'le recorrió el cuerpo con las manos a',
    'acarició apasionadamente a',
    'le acarició con deseo a',
    'acarició eróticamente a',
    'le pasó las manos por',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `🔥 @${clean(sender)} ${phrase} @${clean(target)}`, command: this.name, kind: 'nsfw' });
  },
};
