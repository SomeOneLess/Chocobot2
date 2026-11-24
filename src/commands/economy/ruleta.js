import { getUser, updateUser } from '../../services/database/users.js';
import { saveEconomyFile } from '../../services/database/economyFile.js';

export default {
  name: 'ruleta',
  aliases: ['roulette'],
  category: 'economy',
  description: 'Apuesta en la ruleta (rojo/negro/verde)',
  react: '🎡',
  async execute({ sock, remoteJid, sender, args }) {
    const amount = parseInt(args[0], 10);
    const color = (args[1] || '').toLowerCase();
    if (!amount || amount <= 0 || !['rojo', 'negro', 'verde', 'red', 'black', 'green'].includes(color)) {
      await sock.sendMessage(remoteJid, { text: 'Uso: .ruleta <cantidad> <rojo|negro|verde>' });
      return;
    }
    const user = getUser(sender);
    if ((user.wallet || 0) < amount) {
      await sock.sendMessage(remoteJid, { text: 'No tienes suficiente dinero.' });
      return;
    }

    const colors = ['rojo', 'negro', 'verde'];
    const result = colors[Math.floor(Math.random() * 3)];
    const win = (color.startsWith('r') && result === 'rojo') ||
                (color.startsWith('n') && result === 'negro') ||
                (color.startsWith('v') && result === 'verde') ||
                (color.startsWith('g') && result === 'verde');

    const multiplier = result === 'verde' ? 14 : 2;
    const net = win ? amount * (multiplier - 1) : -amount;

    updateUser(sender, { wallet: user.wallet + net });
    saveEconomyFile();

    const resultText = win
      ? `Ganaste *$${amount * multiplier}*! (neto +$${net})`
      : `Perdiste *$${amount}*`;

    await sock.sendMessage(remoteJid, {
      text: `🎡 Salió *${result}*. ${resultText}`,
    });
  },
};
