import { getUser, updateUser } from '../../services/database/users.js';
import { saveEconomyFile } from '../../services/database/economyFile.js';

export default {
  name: 'mines',
  aliases: ['buscaminas'],
  category: 'economy',
  description: 'Elige casillas sin mina. Más casillas = más premio.',
  react: '💣',
  async execute({ sock, remoteJid, sender, args }) {
    const amount = parseInt(args[0], 10);
    const picks = parseInt(args[1], 10) || 3;
    if (!amount || amount <= 0 || picks < 1 || picks > 5) {
      await sock.sendMessage(remoteJid, { text: 'Uso: .mines <cantidad> <casillas 1-5>' });
      return;
    }
    const user = getUser(sender);
    if ((user.wallet || 0) < amount) {
      await sock.sendMessage(remoteJid, { text: 'No tienes suficiente dinero.' });
      return;
    }

    const mines = 3;
    const safe = 25 - mines;
    let survived = true;
    for (let i = 0; i < picks; i++) {
      if (Math.random() < mines / (25 - i)) {
        survived = false;
        break;
      }
    }

    const multiplier = survived ? (1 + picks * 0.8) : 0;
    const net = survived ? Math.floor(amount * (multiplier - 1)) : -amount;

    updateUser(sender, { wallet: user.wallet + net });
    saveEconomyFile();

    await sock.sendMessage(remoteJid, {
      text: survived
        ? `💎 Sobreviviste ${picks} casillas. Ganaste *$${Math.floor(amount * multiplier)}*!`
        : `💥 Pisaste una mina. Perdiste *$${amount}*`,
    });
  },
};
