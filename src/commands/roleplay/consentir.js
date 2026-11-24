export default {
  name: 'consentir',
  aliases: ['spoil'],
  category: 'roleplay',
  description: 'Interacción: consentir',
  react: '🎁',
  reactSuccess: '🎁',
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
    'consintió a',
    'mimó y consintió a',
    'consintió con regalos a',
    'le dio todos los gustos a',
    'consintió con cariño a',
    'mimó mucho a',
    'consintió con atenciones a',
    'le dio caprichos a',
    'consintió con amor a',
    'mimó y consintió a',
    'consintió con detalles a',
    'le dio todos los gustos a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `🎁 @${clean(sender)} ${phrase} @${clean(target)}`,
      mentions: [sender, target],
    });
  },
};
