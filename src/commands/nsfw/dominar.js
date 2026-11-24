export default {
  name: 'dominar',
  aliases: ['dominate'],
  category: 'nsfw',
  description: 'Interacción: dominar',
  react: '⛓️',
  reactSuccess: '⛓️',
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
    'dominó a',
    'tomó el control de',
    'dominó con autoridad a',
    'sometió a',
    'dominó en la cama a',
    'tomó el control de la situación con',
    'dominó con firmeza a',
    'sometió a su voluntad a',
    'dominó apasionadamente a',
    'tomó el control de',
    'dominó con deseo a',
    'sometió a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `⛓️ @${clean(sender)} ${phrase} @${clean(target)}`,
      mentions: [sender, target],
    });
  },
};
