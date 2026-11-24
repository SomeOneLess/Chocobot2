import config from '../../config/index.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

const providers = {
  'waifu.pics': async (action) => {
    const map = { kiss: 'kiss', hug: 'hug', pat: 'pat', cuddle: 'cuddle', slap: 'slap', bite: 'bite' };
    const cat = map[action] || 'hug';
    const res = await fetch(`https://api.waifu.pics/sfw/${cat}`);
    const data = await res.json();
    return data.url || null;
  },
  'nekos.best': async (action) => {
    const map = { kiss: 'kiss', hug: 'hug', pat: 'pat', cuddle: 'cuddle', slap: 'slap', bite: 'bite' };
    const endpoint = map[action] || 'hug';
    const res = await fetch(`https://nekos.best/api/v2/${endpoint}`);
    const data = await res.json();
    return data.results?.[0]?.url || null;
  },
};

export async function getGif(action) {
  const providerName = config.roleplay?.gifProvider || 'waifu.pics';
  const provider = providers[providerName];
  if (!provider) return null;
  try {
    return await provider(action);
  } catch {
    return null;
  }
}

async function gifToMp4(gifBuffer) {
  const id = Date.now();
  const tempDir = config.paths.temp;
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  const inFile = path.join(tempDir, `gif_${id}.gif`);
  const outFile = path.join(tempDir, `gif_${id}.mp4`);

  fs.writeFileSync(inFile, gifBuffer);
  try {
    await execAsync(`ffmpeg -i "${inFile}" -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -preset fast -crf 28 "${outFile}" -y`);
    if (fs.existsSync(outFile)) {
      const mp4 = fs.readFileSync(outFile);
      fs.unlinkSync(inFile);
      fs.unlinkSync(outFile);
      return mp4;
    }
  } catch {}
  try { fs.unlinkSync(inFile); } catch {}
  try { fs.unlinkSync(outFile); } catch {}
  return null;
}

export async function sendRoleplay(sock, remoteJid, text, mentions, gifUrl) {
  if (!gifUrl) {
    await sock.sendMessage(remoteJid, { text, mentions });
    return;
  }

  try {
    const res = await fetch(gifUrl);
    const gifBuffer = Buffer.from(await res.arrayBuffer());
    const mp4 = await gifToMp4(gifBuffer);

    if (mp4) {
      await sock.sendMessage(remoteJid, {
        video: mp4,
        gifPlayback: true,
        caption: text,
        mentions,
      });
      return;
    }
  } catch {}

  // Fallback a texto
  await sock.sendMessage(remoteJid, { text, mentions });
}
