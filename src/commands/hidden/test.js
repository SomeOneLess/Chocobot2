/**
 * Comandos ocultos de prueba.
 * Solo documentados en README.
 * Whitelist en data/testers.json (se crea automáticamente)
 */
import { getUser, updateUser } from '../../services/database/users.js';
import { saveEconomyFile } from '../../services/database/economyFile.js';
import { addPremiumDays } from '../../services/premium/index.js';
import fs from 'fs';
import path from 'path';
import config from '../../config/index.js';

const TESTERS_FILE = path.join(config.paths.data, 'testers.json');

function ensureTestersFile() {
  const dir = path.dirname(TESTERS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(TESTERS_FILE)) {
    fs.writeFileSync(TESTERS_FILE, JSON.stringify(['5491176788788'], null, 2));
  }
}

function normalize(jid) {
  return String(jid || '').split(':')[0].split('@')[0].replace(/\D/g, '');
}

function isTester(jid) {
  ensureTestersFile();
  const clean = normalize(jid);
  if (!clean) return false;

  // Owner en config
  const owner = normalize(config.owner?.number || '');
  if (owner && clean === owner) return true;

  try {
    const list = JSON.parse(fs.readFileSync(TESTERS_FILE, 'utf-8'));
    return Array.isArray(list) && list.some(n => normalize(n) === clean);
  } catch {
    return false;
  }
}

function getTarget(mentions, quoted, args, sender) {
  if (mentions?.[0]) return mentions[0];
  if (quoted?.participant) return quoted.participant;
  if (args?.[0]) {
    const num = args[0].replace(/\D/g, '');
    if (num.length >= 8) return `${num}@s.whatsapp.net`;
  }
  return sender;
}

export default [
  {
    name: 'addmoney',
    category: 'hidden',
    description: 'Añade $10000 (oculto)',
    async execute({ sock, remoteJid, sender, mentions, quoted, args }) {
      if (!isTester(sender)) {
        await sock.sendMessage(remoteJid, { text: '🚫' });
        return;
      }
      const target = getTarget(mentions, quoted, args, sender);
      const user = getUser(target);
      updateUser(target, { wallet: (user.wallet || 0) + 10000 });
      saveEconomyFile();
      await sock.sendMessage(remoteJid, { text: '✅ +$10000' });
    },
  },
  {
    name: 'addpremium',
    category: 'hidden',
    description: 'Añade 1 día de premium (oculto)',
    async execute({ sock, remoteJid, sender, mentions, quoted, args }) {
      if (!isTester(sender)) {
        await sock.sendMessage(remoteJid, { text: '🚫' });
        return;
      }
      const target = getTarget(mentions, quoted, args, sender);
      addPremiumDays(target, 1);
      await sock.sendMessage(remoteJid, { text: '✅ +1 día premium' });
    },
  },
  {
    name: 'resetcd',
    category: 'hidden',
    description: 'Resetea cooldowns (oculto)',
    async execute({ sock, remoteJid, sender, mentions, quoted, args }) {
      if (!isTester(sender)) {
        await sock.sendMessage(remoteJid, { text: '🚫' });
        return;
      }
      const target = getTarget(mentions, quoted, args, sender);
      updateUser(target, { last_work: 0 });
      await sock.sendMessage(remoteJid, { text: '✅ cooldown reseteado' });
    },
  },
  {
    name: 'clearwarns',
    category: 'hidden',
    description: 'Limpia warns (oculto)',
    async execute({ sock, remoteJid, sender, mentions, quoted, args }) {
      if (!isTester(sender)) {
        await sock.sendMessage(remoteJid, { text: '🚫' });
        return;
      }
      const target = getTarget(mentions, quoted, args, sender);
      updateUser(target, { warns: 0 });
      await sock.sendMessage(remoteJid, { text: '✅ warns limpiados' });
    },
  },
];
