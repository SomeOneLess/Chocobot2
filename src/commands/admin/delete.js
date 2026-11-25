export default {
  name: 'delete',
  aliases: ['del', 'borrar'],
  category: 'admin',
  description: 'Elimina el mensaje citado',
  react: '🗑️',
  async execute({ sock, remoteJid, quoted, msg }) {
    if (!quoted?.key && !quoted?.stanzaId) {
      await sock.sendMessage(remoteJid, { text: 'Cita el mensaje que quieres eliminar.' });
      return;
    }

    const key = quoted.key || {
      remoteJid,
      id: quoted.stanzaId,
      fromMe: false,
      participant: quoted.participant,
    };

    try {
      await sock.sendMessage(remoteJid, { delete: key });
    } catch (err) {
      await sock.sendMessage(remoteJid, { text: 'No se pudo eliminar. El bot debe ser admin o el mensaje debe ser reciente.' });
    }
  },
};
