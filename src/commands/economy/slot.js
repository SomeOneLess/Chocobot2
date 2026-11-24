import { getUser, updateUser } from '../../services/database/users.js';
import { saveEconomyFile } from '../../services/database/economyFile.js';

const symbols = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎'];

export default {
  name: 'slot',
  aliases: ['tragamonedas'],
  category: 'economy',
  description: 'Máquina tragamonedas',
  react: '🎰',
  async execute({ sock, remoteJid, sender, args }) {
    const amount = parseInt(args[0], 10);
    if (!amount || amount <= 0) {
      await sock.sendMessage(remoteJid, { text: 'Uso: .slot <cantidad>' });
      return;
    }
    const user = getUser(sender);
    if ((user.wallet || 0) < amount) {
      await sock.sendMessage(remoteJid, { text: 'No tienes suficiente dinero.' });
      return;
    }

    const roll = () => symbols[Math.floor(Math.random() * symbols.length)];
    const a = roll(), b = roll(), c = roll();

    let multiplier = 0;
    if (a === b && b === c) multiplier = a === '💎' ? 10 : 5;
    else if (a === b || b === c || a === c) multiplier = 2;

    // Restar apuesta y sumar premio neto
    const net = multiplier ? amount * (multiplier - 1) : -amount;
    updateUser(sender, { wallet: user.wallet + net });
    saveEconomyFile();

    const resultText = multiplier
      ? `¡Ganaste *$${amount * multiplier}*! (neto +$${net})`
      : `Perdiste *$${amount}*`;

    await sock.sendMessage(remoteJid, {
      text: `🎰 ${a} ${b} ${c}\n${resultText}`,
    });
  },
};
