import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import config from '../../config/index.js';

export const execFileAsync = promisify(execFile);

export function tempPath(prefix, ext) {
  const dir = config.paths.temp;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return path.join(dir, `${prefix}_${id}.${ext}`);
}

export function safeUnlink(...files) {
  for (const f of files) {
    try { if (f && fs.existsSync(f)) fs.unlinkSync(f); } catch {}
  }
}

export async function probeDuration(file) {
  try {
    const { stdout } = await execFileAsync('ffprobe', [
      '-v', 'error', '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1', file,
    ], { timeout: 15_000 });
    const d = parseFloat(stdout.trim());
    return Number.isFinite(d) ? d : null;
  } catch {
    return null;
  }
}

export async function probeVideoCodec(file) {
  try {
    const { stdout } = await execFileAsync('ffprobe', [
      '-v', 'error', '-select_streams', 'v:0',
      '-show_entries', 'stream=codec_name', '-of', 'csv=p=0', file,
    ], { timeout: 15_000 });
    return stdout.trim().split('\n')[0] || null;
  } catch {
    return null;
  }
}
