export default {
  name: 'cachetear',
  aliases: ['slapnsfw'],
  category: 'nsfw',
  description: 'Interacción: cachetear',
  react: '👋',
  reactSuccess: '👋',
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
    'cacheteó a',
    'le dio una cachetada a',
    'cacheteó juguetonamente a',
    'le propinó una cachetada a',
    'cacheteó con deseo a',
    'le dio una cachetada suave a',
    'cacheteó en la cara a',
    'le propinó una cachetada a',
    'cacheteó sensualmente a',
    'le dio una cachetada a',
    'cacheteó con fuerza a',
    'le propinó una cachetada a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `👋 @${clean(sender)} ${phrase} @${clean(target)}`,
      mentions: [sender, target],
    });
  },
};
