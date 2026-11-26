import { getPremiumInfo } from '../../services/premium/index.js';

export default {
  name: 'premium',
  aliases: ['vip'],
  category: 'economy',
  description: 'Consulta el estado de Premium',
  react: '👑',
  async execute({ sock, remoteJid, sender }) {
    const info = getPremiumInfo(sender);
    let text = '*👑 Estado Premium*\n\n';
    if (info.active) {
      text += `Activo — ${info.daysLeft} día(s) restantes`;
    } else {
      text += 'Inactivo\n\nCompra en la tienda: .tienda premium';
    }
    await sock.sendMessage(remoteJid, { text });
  },
};
