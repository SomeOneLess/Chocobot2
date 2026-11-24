export default {
  name: 'mimar',
  aliases: ['pamper'],
  category: 'roleplay',
  description: 'Interacción: mimar',
  react: '💕',
  reactSuccess: '💕',
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
    'mimó a',
    'consintió y mimó a',
    'mimó con cariño a',
    'le dio muchos mimos a',
    'mimó con amor a',
    'consintió a',
    'mimó con ternura a',
    'le dio mimos a',
    'mimó mucho a',
    'consintió con detalles a',
    'mimó con dedicación a',
    'le dio todos los mimos a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `💕 @${clean(sender)} ${phrase} @${clean(target)}`,
      mentions: [sender, target],
    });
  },
};
