export default {
  name: 'getpp',
  aliases: ['perfil', 'pfp', 'avatar'],
  category: 'media',
  description: 'Obtiene la foto de perfil del citado o etiquetado',
  react: '🖼️',
  async execute({ sock, remoteJid, mentions, quoted, sender }) {
    let target = mentions?.[0] || quoted?.participant || sender;
    try {
      const url = await sock.profilePictureUrl(target, 'image');
      await sock.sendMessage(remoteJid, { image: { url }, caption: `Foto de perfil de @${target.split('@')[0]}` , mentions: [target] });
    } catch {
      await sock.sendMessage(remoteJid, { text: 'No se pudo obtener la foto de perfil (puede ser privada o no tener).' });
    }
  },
};
