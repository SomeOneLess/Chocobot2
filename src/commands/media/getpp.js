import { hasActivePremium } from '../../services/premium/index.js';

export default {
  name: 'getpp',
  aliases: ['perfil', 'pfp', 'avatar'],
  category: 'media',
  description: 'Foto de perfil (Premium)',
  react: '🖼️',
  async execute({ sock, remoteJid, mentions, quoted, sender }) {
    if (!hasActivePremium(sender)) {
      await sock.sendMessage(remoteJid, { text: '👑 Esta función es exclusiva de Premium.' });
      return;
    }
    let target = mentions?.[0] || quoted?.participant || sender;
    try {
      const url = await sock.profilePictureUrl(target, 'image');
      await sock.sendMessage(remoteJid, {
        image: { url },
        caption: `Foto de perfil de @${target.split('@')[0]}`,
        mentions: [target],
      });
    } catch {
      await sock.sendMessage(remoteJid, { text: 'No se pudo obtener la foto de perfil.' });
    }
  },
};
