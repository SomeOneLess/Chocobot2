export default {
  name: 'excitar',
  aliases: ['arouse'],
  category: 'nsfw',
  description: 'Interacción: excitar',
  react: '🔥',
  reactSuccess: '🔥',
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
    'excitó a',
    'puso caliente a',
    'excitó con sus caricias a',
    'le provocó excitación a',
    'excitó con sus palabras a',
    'puso a mil a',
    'excitó con su cuerpo a',
    'le hizo excitarse a',
    'excitó intensamente a',
    'puso muy caliente a',
    'excitó con deseo a',
    'le provocó a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `🔥 @${clean(sender)} ${phrase} @${clean(target)}`,
      mentions: [sender, target],
    });
  },
};
