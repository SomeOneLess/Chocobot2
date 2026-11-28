import fs from 'fs';
import config from '../../config/index.js';
import { tempPath, safeUnlink, probeDuration } from '../media/ffmpegTools.js';

const UA = { 'User-Agent': 'Mozilla/5.0' };
const MAX_GIF_BYTES = 8 * 1024 * 1024;
const MAX_TRIES = 5;
const FALLBACK_CATEGORIES = ['hug', 'pat', 'cuddle', 'smile', 'wave', 'happy', 'dance', 'wink', 'highfive', 'blush'];

const rand = (n) => Math.floor(Math.random() * n);
const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);

async function fetchJson(url) {
  const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchGifBuffer(url) {
  const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (!buf.length || buf.length > MAX_GIF_BYTES) throw new Error('GIF vacío o demasiado pesado');
  return buf;
}

async function isShortEnough(buffer, maxSec) {
  const file = tempPath('gifchk', 'gif');
  try {
    fs.writeFileSync(file, buffer);
    const d = await probeDuration(file);
    return d === null || d <= maxSec + 0.5;
  } finally {
    safeUnlink(file);
  }
}

async function giphyCandidates(query) {
  const key = config.apis?.giphy;
  if (!key) return null;
  const params = new URLSearchParams({ api_key: key, limit: '50', rating: 'g', lang: 'es' });
  let endpoint = 'trending';
  if (query) {
    endpoint = 'search';
    params.set('q', query);
    params.set('offset', String(rand(30)));
  }
  const data = await fetchJson(`https://api.giphy.com/v1/gifs/${endpoint}?${params}`);
  const list = (data.data || [])
    .map((g) => {
      const o = g.images?.original;
      const w = Number(o?.width), h = Number(o?.height);
      if (!o?.url || !w || !h) return null;
      const ratio = w / h;
      return { url: o.url, dev: Math.abs(Math.log(ratio)), ratio };
    })
    .filter((c) => c && c.ratio >= 0.66 && c.ratio <= 1.5)
    .sort((a, b) => a.dev - b.dev)
    .slice(0, 15);
  return shuffle(list);
}

async function waifuRandomUrl() {
  const cat = FALLBACK_CATEGORIES[rand(FALLBACK_CATEGORIES.length)];
  const data = await fetchJson(`https://api.waifu.pics/sfw/${cat}`);
  if (!data.url) throw new Error('sin URL');
  return data.url;
}

export async function fetchStickerGif({ query = '' } = {}) {
  const maxSec = config.sticker?.maxDurationSec ?? 10;
  const errors = [];

  let candidates = null;
  try {
    candidates = await giphyCandidates(query.trim());
  } catch (err) {
    errors.push(`giphy: ${err.message}`);
  }

  if (candidates?.length) {
    let tries = 0;
    for (const c of candidates) {
      if (tries++ >= MAX_TRIES) break;
      try {
        const buffer = await fetchGifBuffer(c.url);
        if (await isShortEnough(buffer, maxSec)) return { buffer, source: 'giphy', ignoredQuery: false };
      } catch (err) {
        errors.push(`giphy: ${err.message}`);
      }
    }
  }

  for (let i = 0; i < 3; i++) {
    try {
      const buffer = await fetchGifBuffer(await waifuRandomUrl());
      if (await isShortEnough(buffer, maxSec)) {
        return { buffer, source: 'waifu.pics', ignoredQuery: Boolean(query.trim()) };
      }
    } catch (err) {
      errors.push(`waifu.pics: ${err.message}`);
    }
  }

  throw new Error(`no se encontró un GIF válido (${errors.slice(-2).join('; ') || 'sin resultados'})`);
}
