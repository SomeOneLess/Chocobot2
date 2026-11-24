import { getUser, updateUser } from '../../services/database/users.js';
import { saveEconomyFile } from '../../services/database/economyFile.js';

export default {
  name: 'blackjack',
  aliases: ['bj', '21'],
  category: 'juegos',
  description: 'Blackjack simple. Ganas x2',
  react: '🃏',
  async execute({ sock, remoteJid, sender, args, msg }) {
    const amount = parseInt(args[0], 10);
    if (!amount || amount <= 0) {
      await sock.sendMessage(remoteJid, { text: 'Uso: .blackjack <cantidad>' }, { quoted: msg });
      return;
    }
    const user = getUser(sender);
    if ((user.wallet || 0) < amount) {
      await sock.sendMessage(remoteJid, { text: 'No tienes suficiente dinero.' }, { quoted: msg });
      return;
    }

    const draw = () => Math.floor(Math.random() * 11) + 1;
    const player = draw() + draw();
    const dealer = draw() + draw();

    let win = false, push = false;
    if (player > 21) win = false;
    else if (dealer > 21 || player > dealer) win = true;
    else if (player === dealer) push = true;

    const net = push ? 0 : (win ? amount : -amount);
    updateUser(sender, { wallet: user.wallet + net });
    saveEconomyFile();

    const result = push ? 'Empate' : (win ? `Ganaste *$${amount * 2}*!` : `Perdiste *$${amount}*`);
    await sock.sendMessage(remoteJid, {
      text: `🃏 Tú: *${player}* | Bot: *${dealer}*\n${result}`,
    }, { quoted: msg });
  },
};
