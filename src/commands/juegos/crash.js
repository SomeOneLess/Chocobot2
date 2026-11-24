import { getUser, updateUser } from '../../services/database/users.js';
import { saveEconomyFile } from '../../services/database/economyFile.js';

export default {
  name: 'crash',
  aliases: ['cohete'],
  category: 'juegos',
  description: 'Crash. Retira antes de que explote.',
  react: '🚀',
  async execute({ sock, remoteJid, sender, args, msg }) {
    const amount = parseInt(args[0], 10);
    const cashout = parseFloat(args[1]) || 2;
    if (!amount || amount <= 0 || cashout < 1.2 || cashout > 10) {
      await sock.sendMessage(remoteJid, { text: 'Uso: .crash <cantidad> <multiplicador>' }, { quoted: msg });
      return;
    }
    const user = getUser(sender);
    if ((user.wallet || 0) < amount) {
      await sock.sendMessage(remoteJid, { text: 'No tienes suficiente dinero.' }, { quoted: msg });
      return;
    }

    const crashPoint = Math.max(1.0, Math.random() * Math.random() * 6 + 1);
    const win = cashout <= crashPoint;
    const net = win ? Math.floor(amount * (cashout - 1)) : -amount;

    updateUser(sender, { wallet: user.wallet + net });
    saveEconomyFile();

    await sock.sendMessage(remoteJid, {
      text: `🚀 Crash en *${crashPoint.toFixed(2)}x*. Retiraste en *${cashout}x*.\n${win ? `Ganaste *$${Math.floor(amount * cashout)}*!` : `Perdiste *$${amount}*`}`,
    }, { quoted: msg });
  },
};
