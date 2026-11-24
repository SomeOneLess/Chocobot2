export default {
  name: 'kick',
  aliases: ['ban', 'expulsar'],
  category: 'admin',
  description: 'Expulsa al etiquetado o citado',
  react: '👢',
  async execute({ sock, remoteJid, mentions, quoted, isGroup }) {
    if (!isGroup) return sock.sendMessage(remoteJid, { text: 'Solo en grupos.' });
    const target = mentions?.[0] || quoted?.participant;
    if (!target) return sock.sendMessage(remoteJid, { text: 'Etiqueta o cita a alguien.' });
    try {
      await sock.groupParticipantsUpdate(remoteJid, [target], 'remove');
      await sock.sendMessage(remoteJid, { text: `👢 Expulsado @${target.split('@')[0]}`, mentions: [target] });
    } catch {
      await sock.sendMessage(remoteJid, { text: 'No se pudo expulsar (el bot debe ser admin).' });
    }
  },
};
