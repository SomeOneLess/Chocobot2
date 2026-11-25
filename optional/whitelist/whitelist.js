import fs from 'fs';
import path from 'path';
import config from '../../config/index.js';

const FILE = path.join(config.paths.data, 'whitelist.json');

function load() {
  try {
    if (!fs.existsSync(FILE)) return {};
    return JSON.parse(fs.readFileSync(FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function save(data) {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export function isWhitelisted(jid) {
  const data = load();
  return !!data[jid];
}

export function setWhitelist(jid, enabled) {
  const data = load();
  if (enabled) data[jid] = true;
  else delete data[jid];
  save(data);
}

export default {
  name: 'whitelist',
  aliases: ['wl'],
  category: 'admin',
  description: 'Activa o desactiva el bot en este chat',
  react: '✅',
  async execute({ sock, remoteJid, args }) {
    const mode = (args[0] || '').toLowerCase();
    if (!['true', 'false', 'on', 'off'].includes(mode)) {
      await sock.sendMessage(remoteJid, { text: 'Uso: .whitelist true | .whitelist false' });
      return;
    }
    const enabled = mode === 'true' || mode === 'on';
    setWhitelist(remoteJid, enabled);
    await sock.sendMessage(remoteJid, {
      text: enabled
        ? '✅ Bot activado en este chat.'
        : '❌ Bot desactivado en este chat.',
    });
  },
};
