import { getHistory } from '../../services/economy/history.js';

export default {
  name: 'historial',
  aliases: ['gastos', 'history'],
  category: 'economy',
  description: 'Últimos 10 movimientos de dinero',
  react: '📜',
  async execute({ sock, remoteJid, sender }) {
    const list = getHistory(sender, 10);
    if (list.length === 0) {
      await sock.sendMessage(remoteJid, { text: 'No hay movimientos registrados.' });
      return;
    }
    let text = '*📜 Últimos movimientos*\n\n';
    for (const h of list) {
      const sign = h.monto >= 0 ? '+' : '';
      text += `${sign}$${h.monto} — ${h.detalle || h.tipo}\n`;
    }
    await sock.sendMessage(remoteJid, { text });
  },
};
