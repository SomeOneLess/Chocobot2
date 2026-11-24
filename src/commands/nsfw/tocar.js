export default {
  name: 'tocar',
  aliases: ['touch'],
  category: 'nsfw',
  description: 'Interacción: tocar',
  react: '✋',
  reactSuccess: '✋',
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
    'tocó íntimamente a',
    'le tocó el cuerpo a',
    'tocó con deseo a',
    'le pasó las manos por',
    'tocó sensualmente a',
    'le tocó las zonas erógenas a',
    'tocó con lujuria a',
    'le recorrió el cuerpo a',
    'tocó apasionadamente a',
    'le tocó con ganas a',
    'tocó eróticamente a',
    'le pasó las manos por el cuerpo a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `✋ @${clean(sender)} ${phrase} @${clean(target)}`,
      mentions: [sender, target],
    });
  },
};
