/**
 * Helper para reaccionar a mensajes.
 * Uso: await react(sock, msg, '🧠')
 */
export async function react(sock, msg, emoji) {
  if (!emoji || !msg?.key) return;
  try {
    await sock.sendMessage(msg.key.remoteJid, {
      react: {
        text: emoji,
        key: msg.key,
      },
    });
  } catch (err) {
    // Silencioso: las reacciones no deben romper el comando
  }
}

/**
 * Mapa de reacciones por comando o categoría.
 * Se puede ampliar o sobrescribir desde config.
 */
export const defaultReactions = {
  // Generales
  help: 'ℹ️',
  ping: '🏓',
  info: '📊',
  echo: '🔁',

  // Economía
  work: '💼',
  saldo: '💰',
  rob: '🦹',
  pay: '💸',
  top: '🏆',
  slot: '🎰',
  ruleta: '🎡',
  ppt: '✂️',

  // Juegos
  ttt: '❌',
  connect4: '🔴',
  mines: '💣',

  // Media
  sticker: '🖼️',
  s: '🖼️',
  toimg: '🖼️',
  tovideo: '🎬',
  ia: '🧠',
  imagine: '🎨',
  play: '🎵',
  video: '🎥',

  // Roleplay
  besar: '💋',
  abrazar: '🤗',
  acariciar: '🥰',
  bed: '🛏️',

  // Admin
  kick: '👢',
  warn: '⚠️',
  mute: '🔇',

  // Fallback
  default: '⏳',
  success: '✅',
  error: '❌',
};
