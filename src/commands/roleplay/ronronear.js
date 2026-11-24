export default {
  name: 'ronronear',
  aliases: ['purr'],
  category: 'roleplay',
  description: 'Interacción: ronronear',
  react: '😺',
  reactSuccess: '😺',
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
    'ronroneó junto a',
    'se puso a ronronear con',
    'ronroneó de felicidad con',
    'le ronroneó a',
    'ronroneó cariñosamente con',
    'se acurrucó y ronroneó con',
    'ronroneó contento/a con',
    'le hizo ronronear a',
    'ronroneó suavemente con',
    'se puso a ronronear junto a',
    'ronroneó de gusto con',
    'le ronroneó a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `😺 @${clean(sender)} ${phrase} @${clean(target)}`,
      mentions: [sender, target],
    });
  },
};
