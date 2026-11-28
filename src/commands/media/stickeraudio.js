
import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import config from '../../config/index.js';

const execFileAsync = promisify(execFile);

export default {
  name: 'stickeraudio',
  aliases: ['sa'],
  category: 'media',
  description: 'Prepara un video con sonido para sticker de WhatsApp (máx. 10s)',
  react: '🎵',
  reactSuccess: '✅',

  async execute({ sock, remoteJid, msg, quoted, media, react }) {
    await react('⏳');

    let buffer = null;
    let tempIn = null;
    let tempOut = null;

    try {
      let sourceMsg = null;

      // Video enviado directamente
      if (media?.type === 'video') {
        sourceMsg = msg;
      }

      // Video citado
      else if (quoted?.message) {
        const qMsg = {
          key: quoted.key || msg.key,
          message: quoted.message,
        };

        if (quoted.message.videoMessage) {
          sourceMsg = qMsg;
        }
      }

      if (!sourceMsg) {
        await sock.sendMessage(remoteJid, {
          text: '🎵 Envía o cita un video con .stickeraudio o .sa',
        });
        return;
      }

      buffer = await downloadMediaMessage(
        sourceMsg,
        'buffer',
        {}
      );

      if (!buffer || buffer.length === 0) {
        throw new Error('El video está vacío.');
      }

      const id = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;

      if (!fs.existsSync(config.paths.temp)) {
        fs.mkdirSync(config.paths.temp, { recursive: true });
      }

      tempIn = path.join(config.paths.temp, `sa_in_${id}.mp4`);
      tempOut = path.join(config.paths.temp, `sa_out_${id}.mp4`);

      fs.writeFileSync(tempIn, buffer);

      const vf = [
        'scale=512:512:force_original_aspect_ratio=decrease',
        'pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black',
        'fps=15'
      ].join(',');

      await execFileAsync('ffmpeg', [
        '-hide_banner',
        '-loglevel', 'error',
        '-y',

        '-i', tempIn,

        // Duración máxima
        '-t', '10',

        // Video y audio original, si existe
        '-map', '0:v:0',
        '-map', '0:a:0?',

        '-vf', vf,

        // Video compatible
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-crf', '28',
        '-pix_fmt', 'yuv420p',

        // Audio
        '-c:a', 'aac',
        '-b:a', '96k',
        '-ar', '48000',
        '-ac', '1',

        '-movflags', '+faststart',

        tempOut,
      ]);

      if (!fs.existsSync(tempOut)) {
        throw new Error('FFmpeg no generó el video.');
      }

      const output = fs.readFileSync(tempOut);

      if (output.length === 0) {
        throw new Error('El archivo generado está vacío.');
      }

      await sock.sendMessage(remoteJid, {
        video: output,
        mimetype: 'video/mp4',
        caption:
          '🎵 Video preparado para sticker con sonido.\n' +
          'Duración máxima: 10 segundos.\n\n' +
          'Guardalo en tu galería y elegilo desde ' +
          'Crear sticker en WhatsApp.',
      });

    } catch (err) {
      console.error('[stickeraudio]', err);

      await sock.sendMessage(remoteJid, {
        text: `❌ Error preparando el video: ${err.message}`,
      });

    } finally {
      if (tempIn) {
        try { fs.unlinkSync(tempIn); } catch {}
      }

      if (tempOut) {
        try { fs.unlinkSync(tempOut); } catch {}
      }
    }
  },
};
