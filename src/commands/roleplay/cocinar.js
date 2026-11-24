export default {
  name: 'cocinar',
  aliases: ['cook'],
  category: 'roleplay',
  description: 'Interacción: cocinar',
  react: '🍳',
  reactSuccess: '🍳',
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
    'cocinó para',
    'le preparó comida a',
    'cocinó con amor para',
    'le hizo de comer a',
    'cocinó un plato especial para',
    'le preparó la cena a',
    'cocinó con cariño para',
    'le hizo un plato a',
    'cocinó algo rico para',
    'le preparó el desayuno a',
    'cocinó con dedicación para',
    'le hizo de comer con amor a',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    await sock.sendMessage(remoteJid, {
      text: `🍳 @${clean(sender)} ${phrase} @${clean(target)}`,
      mentions: [sender, target],
    });
  },
};
