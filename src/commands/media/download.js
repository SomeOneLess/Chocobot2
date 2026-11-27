import { getUser, updateUser } from '../../services/database/users.js';
import { saveEconomyFile } from '../../services/database/economyFile.js';
import { hasActivePremium } from '../../services/premium/index.js';
import { addHistory } from '../../services/economy/history.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import config from '../../config/index.js';

const execAsync = promisify(exec);
const COST = 300;

export default {
  name: 'download',
  aliases: ['dl'],
  category: 'media',
  description: 'Descarga video de un enlace',
  react: '⬇️',
  async execute({ sock, remoteJid, args, sender }) {
    const url = args[0];
    if (!url || !url.startsWith('http')) {
      await sock.sendMessage(remoteJid, { text: 'Uso: .dl <enlace>' });
      return;
    }

    const isPremium = hasActivePremium(sender);
    const user = getUser(sender);
    if (!isPremium && (user.wallet || 0) < COST) {
      await sock.sendMessage(remoteJid, { text: `Necesitas $${COST} para descargar. (Premium: gratis)` });
      return;
    }

    if (!isPremium) {
      updateUser(sender, { wallet: user.wallet - COST });
      saveEconomyFile();
      addHistory(sender, 'download', -COST, 'descarga');
    }

    const id = Date.now();
    const tempDir = config.paths.temp;
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const out = path.join(tempDir, `dl_${id}.%(ext)s`);

    try {
      await sock.sendMessage(remoteJid, { text: '⏳ Descargando...' });

      // Mejor selector para YouTube y otros
      const cmd = `yt-dlp -f "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/best" --merge-output-format mp4 --no-playlist -o "${out}" "${url}"`;
      await execAsync(cmd, { timeout: 120000 });

      const files = fs.readdirSync(tempDir).filter(f => f.startsWith(`dl_${id}`));
      if (files.length === 0) throw new Error('No se generó archivo');

      const filePath = path.join(tempDir, files[0]);
      const video = fs.readFileSync(filePath);
      await sock.sendMessage(remoteJid, { video, caption: '⬇️ Descargado' });
      fs.unlinkSync(filePath);
    } catch (err) {
      await sock.sendMessage(remoteJid, { text: '❌ No se pudo descargar. Verifica que yt-dlp esté actualizado.' });
      if (!isPremium) updateUser(sender, { wallet: user.wallet });
      try {
        const files = fs.readdirSync(tempDir).filter(f => f.startsWith(`dl_${id}`));
        files.forEach(f => fs.unlinkSync(path.join(tempDir, f)));
      } catch {}
    }
  },
};
