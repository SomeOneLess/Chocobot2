export default {
  name: 'someter',
  aliases: ['submit'],
  category: 'nsfw',
  description: 'Interacción: someter',
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
    'sometió a',
    'dominó y sometió a',
    'sometió a su voluntad a',
    'puso de rodillas a',
    'sometió en la cama a',
    'dominó completamente a',
    'sometió con autoridad a',
    'puso bajo su control a',
    'sometió con deseo a',
    'dominó y sometió a',
    'sometió intensamente a',
    'puso de rodillas a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `⛓️ @${clean(sender)} ${phrase} @${clean(target)}`,
      mentions: [sender, target],
    });
  },
};
