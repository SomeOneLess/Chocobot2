import { getUser, updateUser } from '../../services/database/users.js';
import { saveEconomyFile } from '../../services/database/economyFile.js';
import fs from 'fs';
import path from 'path';
import config from '../../config/index.js';

const HISTORY_FILE = path.join(config.paths.data, 'historial.json');

function loadHistory() {
  try {
    if (!fs.existsSync(HISTORY_FILE)) return [];
    return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveHistory(data) {
  const dir = path.dirname(HISTORY_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(data.slice(-500), null, 2));
}

export function addHistory(jid, type, amount, detail = '') {
  const clean = (jid || '').split('@')[0];
  const history = loadHistory();
  history.push({
    numero: clean,
    tipo: type,
    monto: amount,
    detalle: detail,
    fecha: new Date().toISOString(),
  });
  saveHistory(history);
}

export function getHistory(jid, limit = 10) {
  const clean = (jid || '').split('@')[0];
  return loadHistory()
    .filter(h => h.numero === clean)
    .slice(-limit)
    .reverse();
}

export function chargeInteraction(jid, cost, name) {
  const user = getUser(jid);
  if ((user.wallet || 0) < cost) {
    return { ok: false, wallet: user.wallet || 0 };
  }
  updateUser(jid, { wallet: user.wallet - cost });
  saveEconomyFile();
  addHistory(jid, 'interaccion', -cost, name);
  return { ok: true, wallet: user.wallet - cost };
}
