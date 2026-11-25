import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import config from '../../config/index.js';

const execAsync = promisify(exec);

export default {
  name: 'download',
  aliases: ['dl'],
  category: 'media',
  description: 'Descarga video de un enlace (requiere yt-dlp)',
  react: '⬇️',
  async execute({ sock, remoteJid, args }) {
    const url = args[0];
    if (!url || !url.startsWith('http')) {
      await sock.sendMessage(remoteJid, { text: 'Uso: .dl <enlace>' });
      return;
    }

    const id = Date.now();
    const tempDir = config.paths.temp;
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const out = path.join(tempDir, `dl_${id}.mp4`);

    try {
      await sock.sendMessage(remoteJid, { text: '⏳ Descargando...' });
      await execAsync(`yt-dlp -f "best[ext=mp4]/best" --no-playlist -o "${out}" "${url}"`, { timeout: 60000 });

      if (!fs.existsSync(out)) throw new Error('No se generó el archivo');

      const video = fs.readFileSync(out);
      await sock.sendMessage(remoteJid, { video, caption: '⬇️ Descargado' });
      fs.unlinkSync(out);
    } catch (err) {
      await sock.sendMessage(remoteJid, { text: '❌ No se pudo descargar. Instala yt-dlp: `sudo apt install yt-dlp`' });
      try { fs.unlinkSync(out); } catch {}
    }
  },
};
