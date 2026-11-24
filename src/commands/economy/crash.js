import { getUser, updateUser } from '../../services/database/users.js';
import { saveEconomyFile } from '../../services/database/economyFile.js';

export default {
  name: 'crash',
  aliases: ['cohete'],
  category: 'economy',
  description: 'Crash: el multiplicador sube y explota. Retira a tiempo.',
  react: '🚀',
  async execute({ sock, remoteJid, sender, args }) {
    const amount = parseInt(args[0], 10);
    const cashout = parseFloat(args[1]) || 2.0;
    if (!amount || amount <= 0 || cashout < 1.1 || cashout > 10) {
      await sock.sendMessage(remoteJid, { text: 'Uso: .crash <cantidad> <multiplicador 1.1-10>' });
      return;
    }
    const user = getUser(sender);
    if ((user.wallet || 0) < amount) {
      await sock.sendMessage(remoteJid, { text: 'No tienes suficiente dinero.' });
      return;
    }

    // Crash point aleatorio (más probable en bajos)
    const crashPoint = Math.max(1.0, (Math.random() * Math.random() * 8) + 1);
    const win = cashout <= crashPoint;
    const net = win ? Math.floor(amount * (cashout - 1)) : -amount;

    updateUser(sender, { wallet: user.wallet + net });
    saveEconomyFile();

    await sock.sendMessage(remoteJid, {
      text: `🚀 Crash en *${crashPoint.toFixed(2)}x*. Tú retiraste en *${cashout}x*.\n${win ? `Ganaste *$${Math.floor(amount * cashout)}*!` : `Perdiste *$${amount}*`}`,
    });
  },
};
