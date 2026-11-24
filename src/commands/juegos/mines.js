import { getUser, updateUser } from '../../services/database/users.js';
import { saveEconomyFile } from '../../services/database/economyFile.js';

export default {
  name: 'mines',
  aliases: ['buscaminas'],
  category: 'juegos',
  description: 'Elige casillas sin mina.',
  react: '💣',
  async execute({ sock, remoteJid, sender, args, msg }) {
    const amount = parseInt(args[0], 10);
    const picks = parseInt(args[1], 10) || 3;
    if (!amount || amount <= 0 || picks < 1 || picks > 5) {
      await sock.sendMessage(remoteJid, { text: 'Uso: .mines <cantidad> <casillas>' }, { quoted: msg });
      return;
    }
    const user = getUser(sender);
    if ((user.wallet || 0) < amount) {
      await sock.sendMessage(remoteJid, { text: 'No tienes suficiente dinero.' }, { quoted: msg });
      return;
    }

    let survived = true;
    for (let i = 0; i < picks; i++) {
      if (Math.random() < 0.25) { survived = false; break; }
    }

    const multiplier = survived ? 1 + picks * 0.6 : 0;
    const net = survived ? Math.floor(amount * (multiplier - 1)) : -amount;

    updateUser(sender, { wallet: user.wallet + net });
    saveEconomyFile();

    await sock.sendMessage(remoteJid, {
      text: survived
        ? `💎 Sobreviviste. Ganaste *$${Math.floor(amount * multiplier)}*!`
        : `💥 Mina. Perdiste *$${amount}*`,
    }, { quoted: msg });
  },
};
