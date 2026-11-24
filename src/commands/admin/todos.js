export default {
  name: 'todos',
  aliases: ['hidetag', 'notificar', 'tagall'],
  category: 'admin',
  description: 'Menciona a todos sin mostrar las etiquetas (hidetag)',
  react: '📢',
  async execute({ sock, remoteJid, args, isGroup }) {
    if (!isGroup) {
      await sock.sendMessage(remoteJid, { text: 'Solo funciona en grupos.' });
      return;
    }

    const metadata = await sock.groupMetadata(remoteJid);
    const participants = metadata.participants.map(p => p.id);
    const text = args.join(' ') || '📢 Atención a todos';

    await sock.sendMessage(remoteJid, {
      text,
      mentions: participants,
    });
  },
};
