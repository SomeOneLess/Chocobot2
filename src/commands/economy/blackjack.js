import { getUser, updateUser } from '../../services/database/users.js';
import { saveEconomyFile } from '../../services/database/economyFile.js';

export default {
  name: 'blackjack',
  aliases: ['bj', '21'],
  category: 'economy',
  description: 'Blackjack simple contra el bot. Ganas x2',
  react: '🃏',
  async execute({ sock, remoteJid, sender, args }) {
    const amount = parseInt(args[0], 10);
    if (!amount || amount <= 0) {
      await sock.sendMessage(remoteJid, { text: 'Uso: .blackjack <cantidad>' });
      return;
    }
    const user = getUser(sender);
    if ((user.wallet || 0) < amount) {
      await sock.sendMessage(remoteJid, { text: 'No tienes suficiente dinero.' });
      return;
    }

    const draw = () => Math.floor(Math.random() * 11) + 1; // 1-11
    const player = draw() + draw();
    const dealer = draw() + draw();

    let win = false;
    let push = false;
    if (player > 21) win = false;
    else if (dealer > 21) win = true;
    else if (player > dealer) win = true;
    else if (player === dealer) push = true;

    const net = push ? 0 : (win ? amount : -amount);
    updateUser(sender, { wallet: user.wallet + net });
    saveEconomyFile();

    const result = push ? 'Empate (recuperas la apuesta)' : (win ? `Ganaste *$${amount * 2}*!` : `Perdiste *$${amount}*`);
    await sock.sendMessage(remoteJid, {
      text: `🃏 Tú: *${player}* | Bot: *${dealer}*\n${result}`,
    });
  },
};
