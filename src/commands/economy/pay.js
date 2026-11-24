import { getUser, updateUser } from '../../services/database/users.js';
import { saveEconomyFile } from '../../services/database/economyFile.js';

export default {
  name: 'pay',
  aliases: ['pagar', 'transferir'],
  category: 'economy',
  description: 'Transfiere dinero a otro usuario',
  react: '💸',
  async execute({ sock, remoteJid, sender, mentions, quoted, args }) {
    const target = mentions?.[0] || quoted?.participant;
    const amount = parseInt(args[args.length - 1], 10);
    if (!target || !amount || amount <= 0) {
      await sock.sendMessage(remoteJid, { text: 'Uso: .pay @usuario <cantidad> o cita y .pay <cantidad>' });
      return;
    }
    const from = getUser(sender);
    if ((from.wallet || 0) < amount) {
      await sock.sendMessage(remoteJid, { text: 'No tienes suficiente dinero.' });
      return;
    }
    const to = getUser(target);
    updateUser(sender, { wallet: from.wallet - amount });
    updateUser(target, { wallet: (to.wallet || 0) + amount });
    saveEconomyFile();
    await sock.sendMessage(remoteJid, {
      text: `💸 Transferiste *$${amount}* a @${target.split('@')[0]}`,
      mentions: [target],
    });
  },
};
