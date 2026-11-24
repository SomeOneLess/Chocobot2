import { getUser, updateUser } from '../../services/database/users.js';

export default {
  name: 'unwarn',
  aliases: ['quitarwarn'],
  category: 'admin',
  description: 'Quita una advertencia al etiquetado o citado',
  react: '✅',
  async execute({ sock, remoteJid, mentions, quoted }) {
    const target = mentions?.[0] || quoted?.participant;
    if (!target) return sock.sendMessage(remoteJid, { text: 'Etiqueta o cita al usuario.' });
    const user = getUser(target);
    const newWarns = Math.max(0, (user.warns || 0) - 1);
    updateUser(target, { warns: newWarns });
    await sock.sendMessage(remoteJid, {
      text: `✅ Advertencia retirada. @${target.split('@')[0]} tiene ${newWarns}/3`,
      mentions: [target],
    });
  },
};
