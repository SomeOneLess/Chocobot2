import { getUser, updateUser } from '../../services/database/users.js';
import { saveEconomyFile } from '../../services/database/economyFile.js';
import { addHistory } from '../../services/economy/history.js';
import { hasActivePremium } from '../../services/premium/index.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import config from '../../config/index.js';

const execAsync = promisify(exec);
const COST = 20;

export default {
  name: 'voz',
  aliases: ['tts', 'say'],
  category: 'media',
  description: 'Convierte texto en nota de voz',
  react: '🗣️',
  async execute({ sock, remoteJid, args, quoted, sender }) {
    const isPremium = hasActivePremium(sender);
    const user = getUser(sender);

    if (!isPremium && (user.wallet || 0) < COST) {
      await sock.sendMessage(remoteJid, { text: `Necesitas $${COST} para usar .voz. (Premium: gratis)` });
      return;
    }

    let text = args.join(' ').trim();
    if (!text && quoted?.message) {
      text = quoted.message.conversation || quoted.message.extendedTextMessage?.text || '';
    }
    if (!text) {
      await sock.sendMessage(remoteJid, { text: 'Uso: .voz <texto> o cita un mensaje.' });
      return;
    }
    text = text.slice(0, 200);

    if (!isPremium) {
      updateUser(sender, { wallet: user.wallet - COST });
      saveEconomyFile();
      addHistory(sender, 'voz', -COST, 'nota de voz');
    }

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
      await execAsync(`ffmpeg -i "${mp3}" -c:a libopus -b:a 64k -vbr on "${ogg}" -y`);
      const audio = fs.readFileSync(ogg);
      await sock.sendMessage(remoteJid, { audio, mimetype: 'audio/ogg; codecs=opus', ptt: true });
      fs.unlinkSync(mp3);
      fs.unlinkSync(ogg);
    } catch {
      await sock.sendMessage(remoteJid, { text: 'No se pudo generar la nota de voz.' });
      if (!isPremium) updateUser(sender, { wallet: user.wallet });
    }
  },
};
