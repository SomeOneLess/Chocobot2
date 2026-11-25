import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import config from '../../config/index.js';

const execAsync = promisify(exec);

export default {
  name: 'voz',
  aliases: ['tts', 'say'],
  category: 'media',
  description: 'Convierte texto en nota de voz',
  react: '🗣️',
  async execute({ sock, remoteJid, args, quoted }) {
    let text = args.join(' ').trim();
    if (!text && quoted?.message) {
      text = quoted.message.conversation || quoted.message.extendedTextMessage?.text || '';
    }
    if (!text) {
      await sock.sendMessage(remoteJid, { text: 'Uso: .voz <texto> o cita un mensaje.' });
      return;
    }
    text = text.slice(0, 200);

    const id = Date.now();
    const tempDir = config.paths.temp;
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const mp3 = path.join(tempDir, `tts_${id}.mp3`);
    const ogg = path.join(tempDir, `tts_${id}.ogg`);

    try {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=es&client=tw-ob`;
      const res = await fetch(url);
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(mp3, buffer);

      // Convertir a ogg/opus para WhatsApp PTT
      await execAsync(`ffmpeg -i "${mp3}" -c:a libopus -b:a 64k -vbr on "${ogg}" -y`);

      const audio = fs.readFileSync(ogg);
      await sock.sendMessage(remoteJid, {
        audio,
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true,
      });

      fs.unlinkSync(mp3);
      fs.unlinkSync(ogg);
    } catch (err) {
      await sock.sendMessage(remoteJid, { text: 'No se pudo generar la nota de voz. ¿FFmpeg está instalado?' });
      try { fs.unlinkSync(mp3); } catch {}
      try { fs.unlinkSync(ogg); } catch {}
    }
  },
};
