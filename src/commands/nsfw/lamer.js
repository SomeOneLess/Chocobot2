import { chargeInteraction } from '../../services/economy/history.js';
import { sendInteraction } from '../../services/roleplay/interaction.js';
export default {
  name: 'lamer',
  aliases: ['lick'],
  category: 'nsfw',
  description: 'Interacción: lamer',
  react: '👅',
  reactSuccess: '👅',
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
    'lamió eróticamente a',
    'le pasó la lengua a',
    'lamió con deseo a',
    'le lamió el cuerpo a',
    'lamió sensualmente a',
    'le recorrió con la lengua a',
    'lamió con lujuria a',
    'le lamió íntimamente a',
    'lamió apasionadamente a',
    'le pasó la lengua por el cuerpo a',
    'lamió con pasión a',
    'le lamió con ganas a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sendInteraction({ sock, remoteJid, sender, target, text: `👅 @${clean(sender)} ${phrase} @${clean(target)}`, command: this.name, kind: 'nsfw' });
  },
};
