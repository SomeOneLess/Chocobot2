export default {
  name: 'nalgadansfw',
  aliases: ['nalgada'],
  category: 'nsfw',
  description: 'Interacción: nalgadansfw',
  react: '🍑',
  reactSuccess: '🍑',
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
    'le dio una nalgada fuerte a',
    'palmeó con fuerza el culo de',
    'le propinó una nalgada a',
    'le dio una palmada en el trasero a',
    'le dio una nalgada sensual a',
    'palmeó el culo de',
    'le dio una nalgada a',
    'le propinó una palmada fuerte a',
    'le dio una nalgada con deseo a',
    'palmeó con ganas a',
    'le dio una nalgada a',
    'le propinó una nalgada a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `🍑 @${clean(sender)} ${phrase} @${clean(target)}`,
      mentions: [sender, target],
    });
  },
};
