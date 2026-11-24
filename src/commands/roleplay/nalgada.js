export default {
  name: 'nalgada',
  aliases: ['spank'],
  category: 'roleplay',
  description: 'Interacción: nalgada',
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
    'le dio una nalgada a',
    'palmeó el trasero de',
    'le propinó una nalgada a',
    'le dio una palmada en el culo a',
    'le dio una nalgada juguetona a',
    'palmeó suavemente a',
    'le dio una nalgada fuerte a',
    'le propinó una palmada a',
    'le dio una nalgada con cariño a',
    'palmeó el trasero de',
    'le dio una nalgadita a',
    'le propinó una nalgada a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `🍑 @${clean(sender)} ${phrase} @${clean(target)}`,
      mentions: [sender, target],
    });
  },
};
