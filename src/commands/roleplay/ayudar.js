export default {
  name: 'ayudar',
  aliases: [],
  category: 'roleplay',
  description: 'Interacción: ayudar',
  react: '🆘',
  reactSuccess: '🆘',
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
    'ayudó a',
    'le echó una mano a',
    'ayudó con gusto a',
    'le prestó ayuda a',
    'ayudó en lo que pudo a',
    'le ofreció su ayuda a',
    'ayudó desinteresadamente a',
    'le dio una mano a',
    'ayudó con paciencia a',
    'le brindó ayuda a',
    'ayudó de corazón a',
    'le prestó su ayuda a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `🆘 @${clean(sender)} ${phrase} @${clean(target)}`,
      mentions: [sender, target],
    });
  },
};
