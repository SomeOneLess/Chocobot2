export default {
  name: 'grunir',
  aliases: ['gruñir','growl'],
  category: 'roleplay',
  description: 'Interacción: grunir',
  react: '😠',
  reactSuccess: '😠',
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
    'gruñó a',
    'le gruñó juguetonamente a',
    'gruñó en broma a',
    'le hizo un gruñido a',
    'gruñó con cariño a',
    'le gruñó suavemente a',
    'gruñó divertidamente a',
    'le hizo un gruñido juguetón a',
    'gruñó en tono de broma a',
    'le gruñó a',
    'gruñó con una sonrisa a',
    'le hizo un gruñido a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `😠 @${clean(sender)} ${phrase} @${clean(target)}`,
      mentions: [sender, target],
    });
  },
};
