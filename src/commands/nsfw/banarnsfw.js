export default {
  name: 'banarnsfw',
  aliases: ['bañarnsfw'],
  category: 'nsfw',
  description: 'Interacción: banarnsfw',
  react: '🚿',
  reactSuccess: '🚿',
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
    'bañó sensualmente a',
    'le dio un baño íntimo a',
    'bañó con deseo a',
    'le lavó el cuerpo a',
    'bañó eróticamente a',
    'le dio un baño juntos a',
    'bañó con lujuria a',
    'le enjabonó el cuerpo a',
    'bañó apasionadamente a',
    'le dio un baño sensual a',
    'bañó íntimamente a',
    'le lavó con deseo a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `🚿 @${clean(sender)} ${phrase} @${clean(target)}`,
      mentions: [sender, target],
    });
  },
};
