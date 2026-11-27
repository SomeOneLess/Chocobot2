import { getUser, updateUser } from '../../services/database/users.js';
import { saveEconomyFile } from '../../services/database/economyFile.js';
import { hasActivePremium } from '../../services/premium/index.js';
import { addHistory } from '../../services/economy/history.js';

const jobs = [
  'trabajó de programador y ganó',
  'repartió pedidos y ganó',
  'trabajó en una tienda y ganó',
  'hizo horas extra y ganó',
  'vendió artesanías y ganó',
  'trabajó de freelance y ganó',
  'ayudó en una mudanza y ganó',
  'trabajó en un café y ganó',
  'hizo un trabajo rápido y ganó',
  'completó una tarea y ganó',
];

export default {
  name: 'work',
  aliases: ['trabajar'],
  category: 'economy',
  description: 'Trabaja una vez por hora',
  react: '💼',
  async execute({ sock, remoteJid, sender }) {
    const user = getUser(sender);
    const now = Date.now();
    const cooldown = 60 * 60 * 1000;
    if (now - (user.last_work || 0) < cooldown) {
      const mins = Math.ceil((cooldown - (now - user.last_work)) / 60000);
      await sock.sendMessage(remoteJid, { text: `⏳ Debes esperar ${mins} minutos.` });
      return;
    }

    const isPremium = hasActivePremium(sender);
    const reward = isPremium
      ? Math.floor(Math.random() * 4001) + 1000  // 1000-5000
      : Math.floor(Math.random() * 901) + 100;   // 100-1000

    const job = jobs[Math.floor(Math.random() * jobs.length)];
    updateUser(sender, { wallet: (user.wallet || 0) + reward, last_work: now });
    saveEconomyFile();
    addHistory(sender, 'work', reward, isPremium ? 'trabajo premium' : 'trabajo');

    await sock.sendMessage(remoteJid, { text: `💼 ${job} *$${reward}*${isPremium ? ' (Premium)' : ''}` });
  },
};
