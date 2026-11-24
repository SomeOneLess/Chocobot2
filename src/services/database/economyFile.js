import fs from 'fs';
import path from 'path';
import config from '../../config/index.js';
import { exportEconomy } from './users.js';

const ECONOMY_FILE = path.join(config.paths.data, 'economia.json');

export function saveEconomyFile() {
  try {
    const data = exportEconomy();
    fs.writeFileSync(ECONOMY_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error guardando economia.json:', err.message);
  }
}

export function loadEconomyFile() {
  if (!fs.existsSync(ECONOMY_FILE)) return;
  try {
    const raw = fs.readFileSync(ECONOMY_FILE, 'utf-8');
    const data = JSON.parse(raw);
    // Opcional: sincronizar de vuelta a SQLite si se edita manualmente
    console.log(`economia.json cargado (${data.length} usuarios)`);
  } catch {}
}
