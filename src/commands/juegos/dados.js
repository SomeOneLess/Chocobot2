import { getUser, updateUser } from '../../services/database/users.js';
import { saveEconomyFile } from '../../services/database/economyFile.js';

export default {
  name: 'dados',
  aliases: ['dice'],
  category: 'juegos',
  description: 'Dos dados. Apuesta a la suma (2-12). Acierto x5',
  react: '🎲',
  async execute({ sock, remoteJid, sender, args, msg }) {
    const amount = parseInt(args[0], 10);
    const guess = parseInt(args[1], 10);
    if (!amount || amount <= 0 || !guess || guess < 2 || guess > 12) {
      await sock.sendMessage(remoteJid, { text: 'Uso: .dados <cantidad> <suma 2-12>' }, { quoted: msg });
      return;
    }
    const user = getUser(sender);
    if ((user.wallet || 0) < amount) {
      await sock.sendMessage(remoteJid, { text: 'No tienes suficiente dinero.' }, { quoted: msg });
      return;
    }

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2;
    const win = total === guess;
    const net = win ? amount * 4 : -amount;

    updateUser(sender, { wallet: user.wallet + net });
    saveEconomyFile();

    await sock.sendMessage(remoteJid, {
      text: `🎲 ${d1} + ${d2} = *${total}*\n${win ? `¡Acertaste! Ganaste *$${amount * 5}*!` : `Perdiste *$${amount}*`}`,
    }, { quoted: msg });
  },
};
