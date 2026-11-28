import fs from 'fs';
import { execFileAsync, tempPath, safeUnlink } from './ffmpegTools.js';

const MAX_STICKER_BYTES = 900_000;

const vf = (fps) =>
  `fps=${fps},scale=512:512:force_original_aspect_ratio=decrease,format=rgba,` +
  `pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000`;

/** Convierte un GIF (Buffer) en sticker animado webp 512x512 (máx. 10 s). */
export async function gifToSticker(gifBuffer, { maxSeconds = 10 } = {}) {
  const input = tempPath('stk_in', 'gif');
  const output = tempPath('stk_out', 'webp');
  try {
    fs.writeFileSync(input, gifBuffer);
    const attempts = [
      { quality: 60, fps: 15 },
      { quality: 40, fps: 12 },
      { quality: 25, fps: 10 },
    ];
    for (const { quality, fps } of attempts) {
      await execFileAsync('ffmpeg', [
        '-y', '-v', 'error', '-i', input, '-t', String(maxSeconds),
        '-vf', vf(fps), '-c:v', 'libwebp', '-quality', String(quality),
        '-compression_level', '6', '-loop', '0', '-an', output,
      ], { timeout: 60_000 });
      if (fs.existsSync(output)) {
        const size = fs.statSync(output).size;
        if (size > 100 && size <= MAX_STICKER_BYTES) return fs.readFileSync(output);
      }
    }
    throw new Error('el sticker resultante pesa demasiado');
  } finally {
    safeUnlink(input, output);
  }
}
