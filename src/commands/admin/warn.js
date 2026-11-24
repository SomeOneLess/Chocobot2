import { getUser, updateUser } from '../../services/database/users.js';

export default {
  name: 'warn',
  aliases: ['advertir'],
  category: 'admin',
  description: 'Da una advertencia al citado (máx 3)',
  react: '⚠️',
  async execute({ sock, remoteJid, quoted, args }) {
    const target = quoted?.participant;
    if (!target) return sock.sendMessage(remoteJid, { text: 'Cita el mensaje del usuario a advertir.' });
    const reason = args.join(' ') || 'Sin motivo especificado';
    const user = getUser(target);
    const newWarns = (user.warns || 0) + 1;
    updateUser(target, { warns: newWarns });
    await sock.sendMessage(remoteJid, {
      text: `⚠️ Advertencia ${newWarns}/3 a @${target.split('@')[0]}\nMotivo: ${reason}`,
      mentions: [target],
    });
    if (newWarns >= 3) {
      await sock.sendMessage(remoteJid, { text: `🚫 @${target.split('@')[0]} alcanzó 3 advertencias.`, mentions: [target] });
    }
  },
};
