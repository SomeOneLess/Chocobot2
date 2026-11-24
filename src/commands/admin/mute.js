import db from '../../services/database/index.js';

export default {
  name: 'mute',
  aliases: ['silenciar'],
  category: 'admin',
  description: 'Silencia a un usuario (sus mensajes se eliminan)',
  react: '🔇',
  async execute({ sock, remoteJid, args, mentions, quoted, isGroup }) {
    if (!isGroup) return sock.sendMessage(remoteJid, { text: 'Solo en grupos.' });
    const mode = (args[0] || '').toLowerCase();
    const target = mentions?.[0] || quoted?.participant;
    if (!target || !['on', 'off'].includes(mode)) {
      await sock.sendMessage(remoteJid, { text: 'Uso: .mute on/off @usuario (o cita)' });
      return;
    }
    const group = db.prepare('SELECT muted FROM groups WHERE jid = ?').get(remoteJid) || { muted: '[]' };
    let muted = JSON.parse(group.muted || '[]');
    const clean = target.split('@')[0];
    if (mode === 'on') {
      if (!muted.includes(clean)) muted.push(clean);
    } else {
      muted = muted.filter(m => m !== clean);
    }
    db.prepare(`
      INSERT INTO groups (jid, muted) VALUES (?, ?)
      ON CONFLICT(jid) DO UPDATE SET muted = excluded.muted
    `).run(remoteJid, JSON.stringify(muted));
    await sock.sendMessage(remoteJid, { text: mode === 'on' ? `🔇 @${clean} silenciado` : `🔊 @${clean} desilenciado`, mentions: [target] });
  },
};
