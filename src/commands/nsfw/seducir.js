export default {
  name: 'seducir',
  aliases: ['seduce'],
  category: 'nsfw',
  description: 'Interacción: seducir',
  react: '💋',
  reactSuccess: '💋',
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
    'sedujo a',
    'se puso a seducir a',
    'sedujo con su cuerpo a',
    'le hizo una seducción a',
    'sedujo sensualmente a',
    'encantó y sedujo a',
    'sedujo con deseo a',
    'le sedujo con la mirada a',
    'sedujo intensamente a',
    'se puso a seducir a',
    'sedujo con lujuria a',
    'le hizo una seducción a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `💋 @${clean(sender)} ${phrase} @${clean(target)}`,
      mentions: [sender, target],
    });
  },
};
