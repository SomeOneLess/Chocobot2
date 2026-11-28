import config from '../../config/index.js';
import fs from 'fs';
import { execFileAsync, tempPath, safeUnlink } from '../media/ffmpegTools.js';
import { sfwActions, nsfwActions } from './actions.js';

const NEKOS_SFW = new Set(['hug', 'kiss', 'pat', 'cuddle', 'slap', 'bite', 'poke', 'tickle', 'punch', 'kick', 'handhold',
  'highfive', 'handshake', 'feed', 'yeet', 'blush', 'smile', 'wave', 'wink', 'dance', 'laugh', 'nom', 'pout', 'happy',
  'thumbsup', 'smug', 'cry', 'baka', 'shrug', 'sleep', 'stare', 'peck']);
const WAIFU_SFW = new Set(['hug', 'kiss', 'pat', 'cuddle', 'slap', 'bite', 'poke', 'bonk', 'yeet', 'happy', 'dance',
  'wave', 'highfive', 'handhold', 'smile', 'wink', 'nom', 'blush', 'kick', 'lick', 'glomp', 'cry', 'smug']);
const WAIFU_NSFW = new Set(['waifu', 'neko', 'trap', 'blowjob']);

async function getJson(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(config.roleplay?.gifTimeoutMs || 8000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const providers = {
  'nekos.best': {
    sfw: async (action) => {
      if (!NEKOS_SFW.has(action)) return null;
      const data = await getJson(`https://nekos.best/api/v2/${action}`);
      return data.results?.[0]?.url || null;
    },
  },
  'waifu.pics': {
    sfw: async (action) => {
      if (!WAIFU_SFW.has(action)) return null;
      const data = await getJson(`https://api.waifu.pics/sfw/${action}`);
      return data.url || null;
    },
    nsfw: async (action) => {
      if (!WAIFU_NSFW.has(action)) return null;
      const data = await getJson(`https://api.waifu.pics/nsfw/${action}`);
      return data.url || null;
    },
  },
};

export async function getGif(name, kind = 'sfw') {
  const configured = config.roleplay?.gifProvider;
  if (!configured || configured === 'none') return null;

  const action = kind === 'nsfw' ? nsfwActions[name] : (sfwActions[name] || name);
  if (!action) return null;

  const order = [configured, ...Object.keys(providers)]
    .filter((p, i, arr) => providers[p] && arr.indexOf(p) === i);

  for (const p of order) {
    const fn = providers[p][kind];
    if (!fn) continue;
    try {
      const url = await fn(action);
      if (url) return url;
    } catch {}
  }
  return null;
}

async function gifToMp4(gifBuffer) {
  const inFile = tempPath('gif', 'gif');
  const outFile = tempPath('gif', 'mp4');
  try {
    fs.writeFileSync(inFile, gifBuffer);
    await execFileAsync('ffmpeg', [
      '-y', '-v', 'error', '-i', inFile, '-movflags', 'faststart', '-pix_fmt', 'yuv420p',
      '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-c:v', 'libx264', '-preset', 'fast', '-crf', '28', outFile,
    ], { timeout: 60_000 });
    if (fs.existsSync(outFile)) return fs.readFileSync(outFile);
  } catch {}
  finally { safeUnlink(inFile, outFile); }
  return null;
}

export async function sendRoleplay(sock, remoteJid, text, mentions, gifUrl) {
  if (!gifUrl) {
    await sock.sendMessage(remoteJid, { text, mentions });
    return;
  }
  try {
    const res = await fetch(gifUrl, { signal: AbortSignal.timeout(15_000) });
    if (res.ok) {
      const mp4 = await gifToMp4(Buffer.from(await res.arrayBuffer()));
      if (mp4) {
        await sock.sendMessage(remoteJid, { video: mp4, gifPlayback: true, caption: text, mentions });
        return;
      }
    }
  } catch {}
  await sock.sendMessage(remoteJid, { text, mentions });
}
