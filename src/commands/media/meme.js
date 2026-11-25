import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import config from '../../config/index.js';

const execAsync = promisify(exec);

export default {
  name: 'meme',
  aliases: ['memegen'],
  category: 'media',
  description: 'Crea un meme con texto arriba | abajo',
  react: '😂',
  async execute({ sock, remoteJid, args, quoted, media, msg }) {
    const text = args.join(' ');
    const parts = text.split('|').map(s => s.trim());
    const top = parts[0] || '';
    const bottom = parts[1] || '';

    if (!top && !bottom) {
      await sock.sendMessage(remoteJid, { text: 'Uso: .meme texto arriba | texto abajo\n(con imagen o citando una)' });
      return;
    }

    let buffer = null;
    try {
      if (media?.type === 'image') {
        buffer = await downloadMediaMessage(msg, 'buffer', {});
      } else if (quoted?.message?.imageMessage) {
        buffer = await downloadMediaMessage({ key: quoted.key, message: quoted.message }, 'buffer', {});
      }
    } catch {}

    if (!buffer) {
      await sock.sendMessage(remoteJid, { text: 'Envía o cita una imagen.' });
      return;
    }

    const id = Date.now();
    const tempDir = config.paths.temp;
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const input = path.join(tempDir, `meme_in_${id}.jpg`);
    const output = path.join(tempDir, `meme_out_${id}.jpg`);

    try {
      fs.writeFileSync(input, buffer);
      const topEsc = top.replace(/'/g, "'\\''").replace(/:/g, '\\:');
      const botEsc = bottom.replace(/'/g, "'\\''").replace(/:/g, '\\:');
      const filter = `drawtext=text='${topEsc}':fontsize=48:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=20,drawtext=text='${botEsc}':fontsize=48:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=h-th-20`;
      await execAsync(`ffmpeg -i "${input}" -vf "${filter}" "${output}" -y`);

      const result = fs.readFileSync(output);
      await sock.sendMessage(remoteJid, { image: result });
      fs.unlinkSync(input);
      fs.unlinkSync(output);
    } catch {
      await sock.sendMessage(remoteJid, { text: 'Error creando el meme. ¿FFmpeg tiene fuentes?' });
      try { fs.unlinkSync(input); } catch {}
      try { fs.unlinkSync(output); } catch {}
    }
  },
};
