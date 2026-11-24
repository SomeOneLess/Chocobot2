import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import config from '../../config/index.js';

const execAsync = promisify(exec);

export default {
  name: 'sticker',
  aliases: ['s', 'stiker'],
  category: 'media',
  description: 'Convierte imagen o video en sticker',
  react: '🖼️',
  reactSuccess: '✅',
  async execute({ sock, remoteJid, msg, quoted, media, react }) {
    await react('⏳');

    let buffer = null;
    let isVideo = false;

    try {
      if (media && (media.type === 'image' || media.type === 'video')) {
        buffer = await downloadMediaMessage(msg, 'buffer', {});
        isVideo = media.type === 'video';
      } else if (quoted?.message) {
        const qMsg = { key: quoted.key || msg.key, message: quoted.message };
        buffer = await downloadMediaMessage(qMsg, 'buffer', {});
        isVideo = !!quoted.message.videoMessage;
      }
    } catch (err) {
      await sock.sendMessage(remoteJid, { text: '❌ No pude descargar el archivo.' });
      return;
    }

    if (!buffer || buffer.length === 0) {
      await sock.sendMessage(remoteJid, { text: 'Envía o cita una imagen/video con .s' });
      return;
    }

    const id = Date.now();
    const tempIn = path.join(config.paths.temp, `in_${id}`);
    const tempOut = path.join(config.paths.temp, `out_${id}.webp`);

    try {
      if (!fs.existsSync(config.paths.temp)) fs.mkdirSync(config.paths.temp, { recursive: true });
      fs.writeFileSync(tempIn, buffer);

      const vf = 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000';
      const cmd = isVideo
        ? `ffmpeg -i "${tempIn}" -t 6 -vf "${vf}" -c:v libwebp -quality 75 -loop 0 -an -vsync 0 "${tempOut}" -y`
        : `ffmpeg -i "${tempIn}" -vf "${vf}" -c:v libwebp -quality 75 -loop 0 -an "${tempOut}" -y`;

      await execAsync(cmd);

      if (!fs.existsSync(tempOut)) throw new Error('FFmpeg no generó el archivo');

      const sticker = fs.readFileSync(tempOut);
      await sock.sendMessage(remoteJid, { sticker });

      fs.unlinkSync(tempIn);
      fs.unlinkSync(tempOut);
    } catch (err) {
      await sock.sendMessage(remoteJid, { text: `❌ Error creando sticker: ${err.message}` });
      try { fs.unlinkSync(tempIn); } catch {}
      try { fs.unlinkSync(tempOut); } catch {}
    }
  },
};
