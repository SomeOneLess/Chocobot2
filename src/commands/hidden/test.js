/**
 * Comandos ocultos de prueba.
 * Solo documentados en README.
 * Whitelist en data/testers.json
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
    fs.writeFileSync(TESTERS_FILE, '[]');
  }
}

function normalize(jid) {
  return String(jid || '').split(':')[0].split('@')[0].replace(/\D/g, '');
}

function loadTesters() {
  ensureTestersFile();
  try {
    const list = JSON.parse(fs.readFileSync(TESTERS_FILE, 'utf-8'));
    return Array.isArray(list) ? list.map(normalize).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function saveTesters(list) {
  ensureTestersFile();
  const unique = [...new Set(list.map(normalize).filter(Boolean))];
  fs.writeFileSync(TESTERS_FILE, JSON.stringify(unique, null, 2));
}

function isTester(jid, isFromMe = false) {
  if (isFromMe) return true;
  const clean = normalize(jid);
  if (!clean) return false;
  const owner = normalize(config.owner?.number || '');
  if (owner && (clean === owner || clean.endsWith(owner))) return true;
  return loadTesters().some(n => n === clean || clean.endsWith(n) || n.endsWith(clean));
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
    async execute({ sock, remoteJid, sender, isFromMe, mentions, quoted, args }) {
      if (!isTester(sender, isFromMe)) return sock.sendMessage(remoteJid, { text: '🚫' });
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
    async execute({ sock, remoteJid, sender, isFromMe, mentions, quoted, args }) {
      if (!isTester(sender, isFromMe)) return sock.sendMessage(remoteJid, { text: '🚫' });
      const target = getTarget(mentions, quoted, args, sender);
      addPremiumDays(target, 1);
      await sock.sendMessage(remoteJid, { text: '✅ +1 día premium' });
    },
  },
  {
    name: 'resetcd',
    category: 'hidden',
    async execute({ sock, remoteJid, sender, isFromMe, mentions, quoted, args }) {
      if (!isTester(sender, isFromMe)) return sock.sendMessage(remoteJid, { text: '🚫' });
      const target = getTarget(mentions, quoted, args, sender);
      updateUser(target, { last_work: 0 });
      await sock.sendMessage(remoteJid, { text: '✅ cooldown reseteado' });
    },
  },
  {
    name: 'clearwarns',
    category: 'hidden',
    async execute({ sock, remoteJid, sender, isFromMe, mentions, quoted, args }) {
      if (!isTester(sender, isFromMe)) return sock.sendMessage(remoteJid, { text: '🚫' });
      const target = getTarget(mentions, quoted, args, sender);
      updateUser(target, { warns: 0 });
      await sock.sendMessage(remoteJid, { text: '✅ warns limpiados' });
    },
  },
  {
    name: 'tester',
    category: 'hidden',
    async execute({ sock, remoteJid, sender, isFromMe, mentions, quoted, args }) {
      if (!isTester(sender, isFromMe)) return sock.sendMessage(remoteJid, { text: '🚫' });
      const mode = (args[0] || '').toLowerCase();
      const target = getTarget(mentions, quoted, args.slice(1), null);
      if (!['on', 'off'].includes(mode) || !target) {
        await sock.sendMessage(remoteJid, { text: 'Uso: .tester on/off @usuario' });
        return;
      }
      const num = normalize(target);
      let list = loadTesters();
      if (mode === 'on') {
        if (!list.includes(num)) list.push(num);
      } else {
        list = list.filter(n => n !== num);
      }
      saveTesters(list);
      await sock.sendMessage(remoteJid, { text: mode === 'on' ? '✅ Tester añadido' : '✅ Tester quitado' });
    },
  },
  {
    name: 'clearteseters',
    aliases: ['cleantesters'],
    category: 'hidden',
    async execute({ sock, remoteJid, sender, isFromMe }) {
      if (!isTester(sender, isFromMe)) return sock.sendMessage(remoteJid, { text: '🚫' });
      saveTesters([]);
      await sock.sendMessage(remoteJid, { text: '✅ Lista de testers limpiada' });
    },
  },
];
