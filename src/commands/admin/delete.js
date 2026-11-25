export default {
  name: 'delete',
  aliases: ['del', 'borrar'],
  category: 'admin',
  description: 'Elimina el mensaje citado',
  react: '🗑️',
  async execute({ sock, remoteJid, quoted }) {
    if (!quoted) {
      await sock.sendMessage(remoteJid, { text: 'Cita el mensaje que quieres eliminar.' });
      return;
    }

    // Construir key válida para Baileys
    const key = {
      remoteJid,
      id: quoted.stanzaId || quoted.key?.id,
      fromMe: quoted.key?.fromMe || false,
      participant: quoted.participant || quoted.key?.participant,
    };

    if (!key.id) {
      await sock.sendMessage(remoteJid, { text: 'No se pudo obtener el ID del mensaje citado.' });
      return;
    }

    try {
      await sock.sendMessage(remoteJid, { delete: key });
    } catch (err) {
      await sock.sendMessage(remoteJid, { text: 'No se pudo eliminar. Verifica que el bot sea admin y el mensaje sea reciente.' });
    }
  },
};
