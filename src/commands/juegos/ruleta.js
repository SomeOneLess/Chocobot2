import { getUser, updateUser } from '../../services/database/users.js';
import { saveEconomyFile } from '../../services/database/economyFile.js';

export default {
  name: 'ruleta',
  aliases: ['roulette'],
  category: 'juegos',
  description: 'Ruleta (rojo/negro/verde)',
  react: '🎡',
  async execute({ sock, remoteJid, sender, args, msg }) {
    const amount = parseInt(args[0], 10);
    const color = (args[1] || '').toLowerCase();
    if (!amount || amount <= 0 || !['rojo', 'negro', 'verde'].includes(color)) {
      await sock.sendMessage(remoteJid, { text: 'Uso: .ruleta <cantidad> <rojo|negro|verde>' }, { quoted: msg });
      return;
    }
    const user = getUser(sender);
    if ((user.wallet || 0) < amount) {
      await sock.sendMessage(remoteJid, { text: 'No tienes suficiente dinero.' }, { quoted: msg });
      return;
    }

    const colors = ['rojo', 'negro', 'verde'];
    const result = colors[Math.floor(Math.random() * 3)];
    const win = color === result;
    const multiplier = result === 'verde' ? 14 : 2;
    const net = win ? amount * (multiplier - 1) : -amount;

    updateUser(sender, { wallet: user.wallet + net });
    saveEconomyFile();

    await sock.sendMessage(remoteJid, {
      text: `🎡 Salió *${result}*. ${win ? `Ganaste *$${amount * multiplier}*!` : `Perdiste *$${amount}*`}`,
    }, { quoted: msg });
  },
};
