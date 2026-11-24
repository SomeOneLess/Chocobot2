import { getUser } from '../../services/database/users.js';

export default {
  name: 'saldo',
  aliases: ['bal', 'cartera'],
  category: 'economy',
  description: 'Muestra tu saldo, banco y nivel',
  async execute({ sock, remoteJid, sender }) {
    const user = getUser(sender);
    const total = user.wallet + user.bank;
    await sock.sendMessage(remoteJid, {
      text: `💰 *Tu saldo*\n\nCartera: ${user.wallet}\nBanco: ${user.bank}\nTotal: ${total}\nNivel: ${user.level} (XP: ${user.exp})`,
    });
  },
};
