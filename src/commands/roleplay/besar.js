export default {
  name: 'besar',
  aliases: ['kiss'],
  category: 'roleplay',
  description: 'Besar a alguien',
  react: '💋',
  reactSuccess: '💋',
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
      'besó suavemente a', 'le dio un beso tierno a', 'besó con pasión a',
      'le robó un beso a', 'besó contra la pared a', 'le dio un beso en la frente a',
      'besó apasionadamente a', 'le dio un beso dulce a', 'besó con ternura a',
      'le dio un beso de película a', 'besó los labios de', 'le dio un beso lento a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `💋 @${clean(sender)} ${phrase} @${clean(target)}`,
      mentions: [sender, target],
    });
  },
};
