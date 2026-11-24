export default {
  name: 'masajear',
  aliases: ['massage'],
  category: 'roleplay',
  description: 'Interacción: masajear',
  react: '💆',
  reactSuccess: '💆',
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
    'masajeó a',
    'le dio un masaje a',
    'masajeó los hombros de',
    'le hizo un masaje a',
    'masajeó con cuidado a',
    'le dio un masaje relajante a',
    'masajeó la espalda de',
    'le hizo un masaje con cariño a',
    'masajeó suavemente a',
    'le dio un masaje a',
    'masajeó con dedicación a',
    'le hizo un masaje a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `💆 @${clean(sender)} ${phrase} @${clean(target)}`,
      mentions: [sender, target],
    });
  },
};
