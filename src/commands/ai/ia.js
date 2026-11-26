import { getUser, updateUser } from '../../services/database/users.js';
import { saveEconomyFile } from '../../services/database/economyFile.js';
import { addHistory } from '../../services/economy/history.js';

const COST = 50;

export default {
  name: 'ia',
  aliases: ['gpt', 'ai'],
  category: 'ai',
  description: 'Consulta a la inteligencia artificial',
  react: '🧠',
  reactSuccess: '✅',
  async execute({ sock, remoteJid, args, sender }) {
    const user = getUser(sender);
    if ((user.wallet || 0) < COST) {
      await sock.sendMessage(remoteJid, { text: `Necesitas $${COST} para usar .ia.` });
      return;
    }

    const query = args.join(' ').trim();
    if (!query) {
      await sock.sendMessage(remoteJid, { text: 'Uso: .ia <pregunta>' });
      return;
    }

    updateUser(sender, { wallet: user.wallet - COST });
    saveEconomyFile();
    addHistory(sender, 'ia', -COST, 'consulta IA');

    try {
      const url = `https://text.pollinations.ai/${encodeURIComponent(query)}`;
      const res = await fetch(url);
      const text = await res.text();
      const reply = text.slice(0, 1500) || 'No obtuve respuesta.';
      await sock.sendMessage(remoteJid, { text: `🧠 *IA*\n\n${reply}` });
    } catch {
      await sock.sendMessage(remoteJid, { text: '❌ No pude consultar la IA en este momento.' });
      updateUser(sender, { wallet: user.wallet }); // reembolso
    }
  },
};

    const query = args.join(' ').trim();
    if (!query) {
      await sock.sendMessage(remoteJid, { text: 'Uso: .ia <pregunta>' });
      return;
    }

    await react('🧠');
    try {
      // Endpoint gratuito de Pollinations (sin clave)
      const url = `https://text.pollinations.ai/${encodeURIComponent(query)}`;
      const res = await fetch(url);
      const text = await res.text();
      const reply = text.slice(0, 1500) || 'No obtuve respuesta.';
      await sock.sendMessage(remoteJid, { text: `🧠 *IA*\n\n${reply}` });
    } catch (err) {
      await sock.sendMessage(remoteJid, { text: '❌ No pude consultar la IA en este momento.' });
      throw err;
    }
  },
};
