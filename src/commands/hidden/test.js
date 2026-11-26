/**
 * Comandos ocultos de prueba.
 * Solo documentados en README.
 * Whitelist en config.owner.number o en data/testers.json
 */
import { getUser, updateUser } from '../../services/database/users.js';
import { saveEconomyFile } from '../../services/database/economyFile.js';
import fs from 'fs';
import path from 'path';
import config from '../../config/index.js';

function isTester(jid) {
  const clean = (jid || '').split('@')[0];
  if (config.owner.number && clean.includes(config.owner.number.replace(/\D/g, ''))) return true;
  try {
    const file = path.join(config.paths.data, 'testers.json');
    if (!fs.existsSync(file)) return false;
    const list = JSON.parse(fs.readFileSync(file, 'utf-8'));
    return list.includes(clean);
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
      if (!isTester(sender)) return;
      const target = getTarget(mentions, quoted, args, sender);
      const user = getUser(target);
      updateUser(target, { wallet: (user.wallet || 0) + 10000 });
      saveEconomyFile();
      await sock.sendMessage(remoteJid, { text: '✅' });
    },
  },
  {
    name: 'premium',
    category: 'hidden',
    description: 'Activa premium 1 día (oculto)',
    async execute({ sock, remoteJid, sender, mentions, quoted, args }) {
      if (!isTester(sender)) return;
      const target = getTarget(mentions, quoted, args, sender);
      const until = Date.now() + 24 * 60 * 60 * 1000;
      updateUser(target, { premiumUntil: until });
      await sock.sendMessage(remoteJid, { text: '✅' });
    },
  },
  {
    name: 'resetcd',
    category: 'hidden',
    description: 'Resetea cooldowns (oculto)',
    async execute({ sock, remoteJid, sender, mentions, quoted, args }) {
      if (!isTester(sender)) return;
      const target = getTarget(mentions, quoted, args, sender);
      updateUser(target, { last_work: 0 });
      await sock.sendMessage(remoteJid, { text: '✅' });
    },
  },
  {
    name: 'clearwarns',
    category: 'hidden',
    description: 'Limpia warns (oculto)',
    async execute({ sock, remoteJid, sender, mentions, quoted, args }) {
      if (!isTester(sender)) return;
      const target = getTarget(mentions, quoted, args, sender);
      updateUser(target, { warns: 0 });
      await sock.sendMessage(remoteJid, { text: '✅' });
    },
  },
];
