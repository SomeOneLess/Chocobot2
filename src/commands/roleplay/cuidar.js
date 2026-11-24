export default {
  name: 'cuidar',
  aliases: ['care'],
  category: 'roleplay',
  description: 'Interacción: cuidar',
  react: '🩺',
  reactSuccess: '🩺',
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
    'cuidó de',
    'se encargó de cuidar a',
    'cuidó con dedicación a',
    'veló por',
    'cuidó con cariño a',
    'se preocupó por cuidar a',
    'cuidó atentamente a',
    'veló por el bienestar de',
    'cuidó con amor a',
    'se encargó de',
    'cuidó con paciencia a',
    'veló por',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `🩺 @${clean(sender)} ${phrase} @${clean(target)}`,
      mentions: [sender, target],
    });
  },
};
