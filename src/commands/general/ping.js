export default {
  name: 'ping',
  aliases: ['p'],
  category: 'general',
  description: 'Mide la latencia en un solo mensaje',
  react: '🏓',
  async execute({ sock, remoteJid, msg }) {
    const start = Date.now();
    const sent = await sock.sendMessage(remoteJid, { text: '🏓 Pong...' }, { quoted: msg });
    const latency = Date.now() - start;

    // Editar el mensaje con la latencia
    await sock.sendMessage(remoteJid, {
      text: `🏓 Pong! *${latency}ms*`,
      edit: sent.key,
    });
  },
};
