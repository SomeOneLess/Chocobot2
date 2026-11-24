export default {
  name: 'rolplay',
  aliases: ['roleplay', 'rp'],
  category: 'general',
  description: 'Lista de interacciones SFW',
  react: '💞',
  async execute({ sock, remoteJid, commands, prefix }) {
    const list = [];
    const seen = new Set();
    for (const cmd of commands.values()) {
      if (cmd.category === 'roleplay' && !seen.has(cmd.name)) {
        seen.add(cmd.name);
        list.push(cmd.name);
      }
    }
    const text = `*Interacciones SFW*\n\n` +
      list.sort().map(n => `• ${prefix}${n}`).join('\n');
    await sock.sendMessage(remoteJid, { text });
  },
};
