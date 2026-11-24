export default {
  name: 'banar',
  aliases: ['bañar','bath'],
  category: 'roleplay',
  description: 'Interacción: banar',
  react: '🛁',
  reactSuccess: '🛁',
  async execute({ sock, remoteJid, sender, mentions, quoted, args }) {
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
    'bañó con cuidado a',
    'le dio un baño a',
    'bañó suavemente a',
    'le preparó un baño a',
    'bañó con cariño a',
    'le dio un baño relajante a',
    'bañó con ternura a',
    'le ayudó a bañarse a',
    'bañó con delicadeza a',
    'le dio un baño cálido a',
    'bañó con amor a',
    'le preparó un baño especial a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `🛁 @${clean(sender)} ${phrase} @${clean(target)}`,
      mentions: [sender, target],
    });
  },
};
