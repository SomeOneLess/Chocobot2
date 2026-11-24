export default {
  name: 'strip',
  aliases: ['desvestir','striptease'],
  category: 'nsfw',
  description: 'Interacción: strip',
  react: '👗',
  reactSuccess: '👗',
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
    'le quitó la ropa a',
    'desvistió seductoramente a',
    'le arrancó la ropa a',
    'desnudó lentamente a',
    'le quitó las prendas a',
    'desvistió con deseo a',
    'le arrancó la ropa con pasión a',
    'desnudó a',
    'le quitó la ropa sensualmente a',
    'desvistió apasionadamente a',
    'le arrancó las prendas a',
    'desnudó con lujuria a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `👗 @${clean(sender)} ${phrase} @${clean(target)}`,
      mentions: [sender, target],
    });
  },
};
