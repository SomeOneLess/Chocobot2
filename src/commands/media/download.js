import fs from 'fs';
import path from 'path';
import { getUser, updateUser } from '../../services/database/users.js';
import { saveEconomyFile } from '../../services/database/economyFile.js';
import { hasActivePremium } from '../../services/premium/index.js';
import { addHistory, refund } from '../../services/economy/history.js';
import { execFileAsync, probeVideoCodec, safeUnlink } from '../../services/media/ffmpegTools.js';
import config from '../../config/index.js';

const COST = 300;
const TIMEOUT_MS = 180_000;
const MAX_MB = config.media?.maxFileSizeMB || 50;
const COOKIES_FILE = path.join(config.paths.data, 'cookies.txt'); // opcional (YouTube)
const VIDEO_EXT = new Set(['.mp4', '.mkv', '.webm', '.mov', '.m4v', '.flv', '.avi']);

function detectPlatform(url) {
  let u;
  try { u = new URL(url); } catch { return null; }
  if (!['http:', 'https:'].includes(u.protocol)) return null;
  const host = u.hostname.toLowerCase().replace(/^www\./, '');
  if (/(^|\.)(youtube\.com|youtu\.be|youtube-nocookie\.com)$/.test(host)) return 'youtube';
  return 'generic';
}

function baseArgs() {
  const args = [
    '--no-playlist', '--no-warnings', '--no-progress', '--restrict-filenames',
    '--socket-timeout', '20', '--retries', '2', '--fragment-retries', '2',
    '--max-filesize', `${MAX_MB}M`,
  ];
  if (fs.existsSync(COOKIES_FILE)) args.push('--cookies', COOKIES_FILE);
  return args;
}

// Cada estrategia se prueba por separado: si una falla, se intenta la siguiente.
function buildStrategies(platform) {
  const merge = ['--merge-output-format', 'mp4'];
  const list = [
    { name: 'h264-720', args: ['-S', 'vcodec:h264,res:720,acodec:aac', '-f', 'bv*+ba/b', ...merge] },
    { name: 'single-file', args: ['-f', 'b/best'] }, // X, Facebook, etc. con un solo archivo
  ];
  if (platform === 'youtube') {
    list.splice(1, 0, {
      name: 'youtube-mweb',
      args: ['--extractor-args', 'youtube:player_client=mweb', '-S', 'vcodec:h264,res:720', '-f', 'bv*+ba/b', ...merge],
    });
  }
  return list;
}

function explain(err) {
  const s = `${err.stderr || ''} ${err.message || ''}`;
  if (err.code === 'ENOENT') return 'yt-dlp no está instalado o no está en el PATH';
  if (err.fatal) return err.message;
  if (err.killed || /timed out/i.test(s)) return 'la descarga tardó demasiado';
  if (/Sign in to confirm|not a bot|cookies/i.test(s)) return 'la plataforma pidió verificación (prueba actualizar yt-dlp o añadir data/cookies.txt)';
  if (/Unsupported URL/i.test(s)) return 'enlace no soportado';
  if (/private|login required|members-only|Sign in/i.test(s)) return 'el video es privado o requiere iniciar sesión';
  if (/Requested format is not available/i.test(s)) return 'no hay un formato compatible';
  return 'error de yt-dlp (revisa los logs)';
}

function listFiles(tempDir, prefix) {
  try { return fs.readdirSync(tempDir).filter((f) => f.startsWith(prefix)); } catch { return []; }
}

function findOutput(tempDir, id) {
  const files = listFiles(tempDir, `dl_${id}.`)
    .filter((f) => VIDEO_EXT.has(path.extname(f).toLowerCase()))
    .map((f) => ({ f, size: fs.statSync(path.join(tempDir, f)).size }))
    .sort((a, b) => b.size - a.size);
  return files.length ? path.join(tempDir, files[0].f) : null;
}

function cleanup(tempDir, id) {
  for (const f of listFiles(tempDir, `dl_${id}`)) safeUnlink(path.join(tempDir, f));
}

async function runStrategy(url, tempDir, id, strategy) {
  const out = path.join(tempDir, `dl_${id}.%(ext)s`);
  const args = [...baseArgs(), ...strategy.args, '-o', out, '--', url];
  const { stdout = '', stderr = '' } = await execFileAsync('yt-dlp', args, {
    timeout: TIMEOUT_MS,
    maxBuffer: 20 * 1024 * 1024,
  });
  const file = findOutput(tempDir, id);
  if (!file) {
    const e = new Error(/larger than max-filesize/i.test(`${stdout} ${stderr}`)
      ? `el video pesa más de ${MAX_MB} MB`
      : 'yt-dlp no generó ningún archivo');
    e.fatal = /larger than/i.test(e.message);
    throw e;
  }
  return file;
}

// WhatsApp reproduce bien mp4 + h264. Si no, se recodifica.
async function ensureWhatsappMp4(file, tempDir, id) {
  const isMp4 = path.extname(file).toLowerCase() === '.mp4';
  const codec = isMp4 ? await probeVideoCodec(file) : null;
  if (isMp4 && codec === 'h264') return file;

  const out = path.join(tempDir, `dl_${id}_wa.mp4`);
  await execFileAsync('ffmpeg', [
    '-y', '-v', 'error', '-i', file,
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '28', '-pix_fmt', 'yuv420p',
    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
    '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', out,
  ], { timeout: TIMEOUT_MS });
  return out;
}

export default {
  name: 'download',
  aliases: ['dl'],
  category: 'media',
  description: 'Descarga video de un enlace',
  react: '⬇️',
  async execute({ sock, remoteJid, args, sender }) {
    const url = args[0];
    const platform = url ? detectPlatform(url) : null;
    if (!platform) {
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

    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const tempDir = config.paths.temp;
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    try {
      await sock.sendMessage(remoteJid, { text: '⏳ Descargando...' });

      let file = null;
      const failures = [];
      for (const strategy of buildStrategies(platform)) {
        try {
          file = await runStrategy(url, tempDir, id, strategy);
          break;
        } catch (err) {
          failures.push(explain(err));
          console.error(`[download] ${platform}/${strategy.name} falló:`, String(err.stderr || err.message).slice(0, 800));
          cleanup(tempDir, id);
          if (err.fatal || err.code === 'ENOENT') break;
        }
      }
      if (!file) throw new Error(failures[failures.length - 1] || 'no se pudo descargar');

      file = await ensureWhatsappMp4(file, tempDir, id);
      const size = fs.statSync(file).size;
      if (size > MAX_MB * 1024 * 1024) throw new Error(`el video pesa más de ${MAX_MB} MB`);

      await sock.sendMessage(remoteJid, { video: fs.readFileSync(file), caption: '⬇️ Descargado' });
    } catch (err) {
      console.error('[download] error final:', err.message);
      if (!isPremium) refund(sender, COST, 'reembolso descarga');
      await sock.sendMessage(remoteJid, {
        text: `❌ No se pudo descargar: ${err.message}.${isPremium ? '' : ` Se te devolvieron $${COST}.`}`,
      }).catch(() => {});
    } finally {
      cleanup(tempDir, id);
    }
  },
};