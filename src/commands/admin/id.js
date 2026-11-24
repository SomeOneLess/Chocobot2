export default {
  name: 'id',
  aliases: ['jid'],
  category: 'admin',
  description: 'Muestra el ID del chat o grupo',
  react: '🆔',
  async execute({ sock, remoteJid }) {
    await sock.sendMessage(remoteJid, { text: `🆔 ID: \`${remoteJid}\`` });
  },
};
