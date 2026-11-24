import { getUser, updateUser } from '../../services/database/users.js';
import { saveEconomyFile } from '../../services/database/economyFile.js';

export default {
  name: 'coinflip',
  aliases: ['cf', 'moneda', 'caraocruz'],
  category: 'economy',
  description: 'Cara o cruz. Ganas x2',
  react: '🪙',
  async execute({ sock, remoteJid, sender, args }) {
    const amount = parseInt(args[0], 10);
    const choice = (args[1] || '').toLowerCase();
    if (!amount || amount <= 0 || !['cara', 'cruz', 'heads', 'tails'].includes(choice)) {
      await sock.sendMessage(remoteJid, { text: 'Uso: .coinflip <cantidad> <cara|cruz>' });
      return;
    }
    const user = getUser(sender);
    if ((user.wallet || 0) < amount) {
      await sock.sendMessage(remoteJid, { text: 'No tienes suficiente dinero.' });
      return;
    }

    const result = Math.random() < 0.5 ? 'cara' : 'cruz';
    const win = (choice.startsWith('c') && result === 'cara') || (choice.startsWith('t') && result === 'cruz') ||
                (choice === 'heads' && result === 'cara') || (choice === 'tails' && result === 'cruz');

    const net = win ? amount : -amount; // x2 means net +amount
    updateUser(sender, { wallet: user.wallet + net });
    saveEconomyFile();

    await sock.sendMessage(remoteJid, {
      text: `🪙 Salió *${result}*. ${win ? `Ganaste *$${amount * 2}*!` : `Perdiste *$${amount}*`}`,
    });
  },
};
