export default {
  botName: 'Chocobot',
  owner: {
    name: 'Propietario',
    number: '',
    jid: '',
  },
  prefix: '.',
  language: 'es',
  timezone: 'America/Argentina/Buenos_Aires',

  paths: {
    auth: './auth',
    data: './data',
    temp: './temp',
    logs: './logs',
  },

  logLevel: 'info',
  nodeEnv: 'production',

  connection: {
    connectTimeoutMs: 60_000,
    keepAliveIntervalMs: 25_000,
    defaultQueryTimeoutMs: 60_000,
    reconnectDelayMs: 3_000,
    maxReconnectAttempts: 10,
  },

  economy: {
    initialWallet: 500,
    workRewardMin: 50,
    workRewardMax: 200,
    workCooldownMs: 15 * 60 * 1000,
    robSuccessChance: 0.45,
    robCooldownMs: 10 * 60 * 1000,
  },

  moderation: {
    maxWarns: 3,
    muteDurationMs: 0,
  },

  media: {
    maxFileSizeMB: 50,
    maxVideoDurationSec: 60,
    stickerQuality: 80,
  },

  roleplay: {
    gifProvider: 'none', // 'none' | 'waifu.pics' | 'nekos.best'
    gifTimeoutMs: 8000,
    fallbackTextOnly: true,
  },

  messages: {
    error: '❌ Ocurrió un error al procesar el comando.',
    noPermission: '🚫 No tienes permiso para usar este comando.',
    nsfwDisabled: '🔞 La categoría NSFW está desactivada en este grupo. Un admin debe activarla con `.nsfw on`.',
  },
};
