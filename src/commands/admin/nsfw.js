export default {
  name: 'nsfw',
  aliases: ['+18'],
  category: 'admin',
  description: 'Activa o desactiva NSFW en el grupo',
  react: '🔞',
  async execute({ sock, remoteJid, args, isGroup, db }) {
    if (!isGroup) {
      await sock.sendMessage(remoteJid, { text: 'Solo funciona en grupos.' });
      return;
    }
    const mode = (args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(mode)) {
      await sock.sendMessage(remoteJid, { text: 'Uso: .nsfw on | .nsfw off' });
      return;
    }
    const enabled = mode === 'on' ? 1 : 0;
    db.prepare(`
      INSERT INTO groups (jid, nsfw) VALUES (?, ?)
      ON CONFLICT(jid) DO UPDATE SET nsfw = excluded.nsfw
    `).run(remoteJid, enabled);
    await sock.sendMessage(remoteJid, {
      text: enabled ? '🔞 NSFW activado en este grupo.' : '🔞 NSFW desactivado en este grupo.',
    });
  },
};
