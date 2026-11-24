export default {
  name: 'delete',
  aliases: ['del', 'borrar'],
  category: 'admin',
  description: 'Elimina el mensaje citado',
  react: '🗑️',
  async execute({ sock, remoteJid, quoted }) {
    if (!quoted?.key) {
      await sock.sendMessage(remoteJid, { text: 'Cita el mensaje que quieres eliminar.' });
      return;
    }
    try {
      await sock.sendMessage(remoteJid, { delete: quoted.key });
    } catch {
      await sock.sendMessage(remoteJid, { text: 'No se pudo eliminar el mensaje.' });
    }
  },
};
