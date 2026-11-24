import { getUser, updateUser } from '../../services/database/users.js';
import { saveEconomyFile } from '../../services/database/economyFile.js';

export default {
  name: 'moneda',
  aliases: ['coinflip', 'cf', 'caraocruz'],
  category: 'juegos',
  description: 'Cara o cruz. Sin apuesta o con apuesta (x2)',
  react: '🪙',
  async execute({ sock, remoteJid, sender, args, msg }) {
    const amount = parseInt(args[0], 10);
    const choice = (args[1] || args[0] || '').toLowerCase();

    // Sin apuesta: solo tirar
    if (!amount || amount <= 0) {
      const result = Math.random() < 0.5 ? 'cara' : 'cruz';
      await sock.sendMessage(remoteJid, { text: `🪙 Salió *${result}*` }, { quoted: msg });
      return;
    }

    if (!['cara', 'cruz', 'heads', 'tails'].includes(choice)) {
      await sock.sendMessage(remoteJid, { text: 'Uso: .moneda  o  .moneda <cantidad> <cara|cruz>' }, { quoted: msg });
      return;
    }

    const user = getUser(sender);
    if ((user.wallet || 0) < amount) {
      await sock.sendMessage(remoteJid, { text: 'No tienes suficiente dinero.' }, { quoted: msg });
      return;
    }

    const result = Math.random() < 0.5 ? 'cara' : 'cruz';
    const win = (choice.startsWith('c') && result === 'cara') ||
                (choice.startsWith('t') && result === 'cruz') ||
                (choice === 'heads' && result === 'cara') ||
                (choice === 'tails' && result === 'cruz');

    const net = win ? amount : -amount;
    updateUser(sender, { wallet: user.wallet + net });
    saveEconomyFile();

    await sock.sendMessage(remoteJid, {
      text: `🪙 Salió *${result}*. ${win ? `Ganaste *$${amount * 2}*!` : `Perdiste *$${amount}*`}`,
    }, { quoted: msg });
  },
};
