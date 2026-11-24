export default {
  name: 'rolnsfw',
  aliases: ['hnsfw', 'helpnsfw', 'nsfwhelp'],
  category: 'nsfw',
  description: 'Lista de interacciones NSFW',
  react: '🔞',
  async execute({ sock, remoteJid, commands, prefix, isGroup, db }) {
    if (isGroup) {
      const group = db.prepare('SELECT nsfw FROM groups WHERE jid = ?').get(remoteJid);
      if (!group?.nsfw) {
        await sock.sendMessage(remoteJid, { text: '🔞 NSFW desactivado. Un admin debe usar .nsfw on' });
        return;
      }
    }
    const list = [];
    const seen = new Set();
    for (const cmd of commands.values()) {
      if (cmd.category === 'nsfw' && !seen.has(cmd.name) && cmd.name !== 'nsfw' && cmd.name !== 'rolnsfw') {
        seen.add(cmd.name);
        list.push(cmd.name);
      }
    }
    const text = `*Interacciones NSFW*\n\n` +
      list.sort().map(n => `• ${prefix}${n}`).join('\n');
    await sock.sendMessage(remoteJid, { text });
  },
};
