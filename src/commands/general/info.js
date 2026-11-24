export default {
  name: 'info',
  aliases: ['botinfo'],
  category: 'general',
  description: 'Información del bot',
  react: '📊',
  async execute({ sock, remoteJid, config }) {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    await sock.sendMessage(remoteJid, {
      text: `*${config.botName} 2.0*\n\nPrefijo: ${config.prefix}\nUptime: ${hours}h ${minutes}m\nNode: ${process.version}\nPlataforma: Debian + Baileys + SQLite`,
    });
  },
};
