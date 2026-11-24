export default {
  name: 'add',
  aliases: ['agregar', 'añadir'],
  category: 'admin',
  description: 'Añade al etiquetado o citado al grupo',
  react: '➕',
  async execute({ sock, remoteJid, mentions, quoted, isGroup }) {
    if (!isGroup) return sock.sendMessage(remoteJid, { text: 'Solo en grupos.' });
    const target = mentions?.[0] || quoted?.participant;
    if (!target) return sock.sendMessage(remoteJid, { text: 'Etiqueta o cita a alguien.' });
    try {
      await sock.groupParticipantsUpdate(remoteJid, [target], 'add');
      await sock.sendMessage(remoteJid, { text: `✅ Añadido @${target.split('@')[0]}`, mentions: [target] });
    } catch {
      await sock.sendMessage(remoteJid, { text: 'No se pudo añadir (puede que el bot no sea admin o el número sea inválido).' });
    }
  },
};
