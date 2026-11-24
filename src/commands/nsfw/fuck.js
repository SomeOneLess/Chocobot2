export default {
  name: 'fuck',
  aliases: ['coger','penetrar','follar'],
  category: 'nsfw',
  description: 'Interacción: fuck',
  react: '🔞',
  reactSuccess: '🔞',
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
    'se folló a',
    'penetró con fuerza a',
    'cogió intensamente a',
    'se la metió a',
    'folló con pasión a',
    'penetró profundamente a',
    'cogió sin piedad a',
    'se folló duro a',
    'penetró con deseo a',
    'cogió apasionadamente a',
    'se la folló a',
    'penetró salvajemente a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `🔞 @${clean(sender)} ${phrase} @${clean(target)}`,
      mentions: [sender, target],
    });
  },
};
