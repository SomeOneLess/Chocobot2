import { getUser, updateUser } from '../../services/database/users.js';
import { saveEconomyFile } from '../../services/database/economyFile.js';

export default {
  name: 'dados',
  aliases: ['dice', 'dados'],
  category: 'economy',
  description: 'Apuesta a un número del 1 al 6. Acierto x5',
  react: '🎲',
  async execute({ sock, remoteJid, sender, args }) {
    const amount = parseInt(args[0], 10);
    const guess = parseInt(args[1], 10);
    if (!amount || amount <= 0 || !guess || guess < 1 || guess > 6) {
      await sock.sendMessage(remoteJid, { text: 'Uso: .dados <cantidad> <1-6>' });
      return;
    }
    const user = getUser(sender);
    if ((user.wallet || 0) < amount) {
      await sock.sendMessage(remoteJid, { text: 'No tienes suficiente dinero.' });
      return;
    }

    const roll = Math.floor(Math.random() * 6) + 1;
    const win = roll === guess;
    const net = win ? amount * 4 : -amount; // x5 total = net +4x

    updateUser(sender, { wallet: user.wallet + net });
    saveEconomyFile();

    await sock.sendMessage(remoteJid, {
      text: `🎲 Salió *${roll}*. ${win ? `¡Acertaste! Ganaste *$${amount * 5}*!` : `Perdiste *$${amount}*`}`,
    });
  },
};
