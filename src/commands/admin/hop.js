export default {
  name: 'hop',
  aliases: ['adminhelp'],
  category: 'admin',
  description: 'Comandos de administración',
  react: '👑',
  async execute({ sock, remoteJid, commands, prefix }) {
    const list = [];
    const seen = new Set();
    for (const cmd of commands.values()) {
      if (cmd.category === 'admin' && !seen.has(cmd.name)) {
        seen.add(cmd.name);
        list.push(cmd);
      }
    }
    const text = `*Comandos de Administración*\n\n` +
      list.sort((a, b) => a.name.localeCompare(b.name))
        .map(c => `• ${prefix}${c.name}`).join('\n');
    await sock.sendMessage(remoteJid, { text });
  },
};
