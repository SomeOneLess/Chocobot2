export default {
  name: 'op',
  aliases: ['promote', 'admin'],
  category: 'admin',
  description: 'Da admin al etiquetado o citado',
  react: '👑',
  async execute({ sock, remoteJid, mentions, quoted, isGroup }) {
    if (!isGroup) return sock.sendMessage(remoteJid, { text: 'Solo en grupos.' });
    const target = mentions?.[0] || quoted?.participant;
    if (!target) return sock.sendMessage(remoteJid, { text: 'Etiqueta o cita a alguien.' });
    try {
      await sock.groupParticipantsUpdate(remoteJid, [target], 'promote');
      await sock.sendMessage(remoteJid, { text: `👑 @${target.split('@')[0]} ahora es admin`, mentions: [target] });
    } catch {
      await sock.sendMessage(remoteJid, { text: 'No se pudo promover (el bot debe ser admin).' });
    }
  },
};
