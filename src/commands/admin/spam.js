export default {
  name: 'spam',
  aliases: ['repetir'],
  category: 'admin',
  description: 'Repite un mensaje N veces con menciones ocultas',
  react: '📢',
  async execute({ sock, remoteJid, args, quoted, isGroup }) {
    if (!isGroup) return sock.sendMessage(remoteJid, { text: 'Solo en grupos.' });
    const count = parseInt(args[0], 10);
    if (!count || count < 1 || count > 20) {
      await sock.sendMessage(remoteJid, { text: 'Uso: .spam <1-20> <mensaje> o cita un mensaje.' });
      return;
    }
    let text = args.slice(1).join(' ');
    if (!text && quoted?.message) {
      text = quoted.message.conversation || quoted.message.extendedTextMessage?.text || '';
    }
    if (!text) return sock.sendMessage(remoteJid, { text: 'Escribe o cita el mensaje.' });

    const metadata = await sock.groupMetadata(remoteJid);
    const participants = metadata.participants.map(p => p.id);

    for (let i = 0; i < count; i++) {
      await sock.sendMessage(remoteJid, { text, mentions: participants });
      await new Promise(r => setTimeout(r, 500));
    }
  },
};
