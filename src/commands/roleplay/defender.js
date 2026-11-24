export default {
  name: 'defender',
  aliases: ['defend'],
  category: 'roleplay',
  description: 'Interacción: defender',
  react: '🛡️',
  reactSuccess: '🛡️',
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
    'defendió a',
    'salió en defensa de',
    'defendió con firmeza a',
    'protegió a',
    'defendió de los ataques a',
    'salió en defensa de',
    'defendió valientemente a',
    'protegió con su vida a',
    'defendió con uñas y dientes a',
    'salió en defensa de',
    'defendió incondicionalmente a',
    'protegió a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `🛡️ @${clean(sender)} ${phrase} @${clean(target)}`,
      mentions: [sender, target],
    });
  },
};
