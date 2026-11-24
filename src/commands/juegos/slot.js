import { getUser, updateUser } from '../../services/database/users.js';
import { saveEconomyFile } from '../../services/database/economyFile.js';

const AMOUNT = 50;
const symbols = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '7️⃣'];

export default {
  name: 'slot',
  aliases: ['tragamonedas'],
  category: 'juegos',
  description: 'Tragamonedas automático ($50)',
  react: '🎰',
  async execute({ sock, remoteJid, sender, msg }) {
    const user = getUser(sender);
    if ((user.wallet || 0) < AMOUNT) {
      await sock.sendMessage(remoteJid, { text: `Necesitas al menos $${AMOUNT}.` }, { quoted: msg });
      return;
    }

    const roll = () => symbols[Math.floor(Math.random() * symbols.length)];
    const a = roll(), b = roll(), c = roll();

    let multiplier = 0;
    if (a === b && b === c) {
      multiplier = a === '💎' || a === '7️⃣' ? 15 : 8;
    } else if (a === b || b === c || a === c) {
      multiplier = 3;
    } else if (a === '⭐' || b === '⭐' || c === '⭐') {
      multiplier = 1.5;
    }

    const net = multiplier ? Math.floor(AMOUNT * (multiplier - 1)) : -AMOUNT;
    updateUser(sender, { wallet: user.wallet + net });
    saveEconomyFile();

    const result = multiplier
      ? `¡Ganaste *$${Math.floor(AMOUNT * multiplier)}*!`
      : `Perdiste *$${AMOUNT}*`;

    await sock.sendMessage(remoteJid, {
      text: `🎰 ${a} ${b} ${c}\n${result}\nSaldo: $${user.wallet + net}`,
    }, { quoted: msg });
  },
};
