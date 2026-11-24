import { Bot } from './core/bot.js';
import logger from './utils/logger.js';
import config from './config/index.js';

// Silenciar errores conocidos de libsignal / Baileys que no afectan el funcionamiento
const originalConsoleError = console.error;
console.error = (...args) => {
  const msg = typeof args[0] === 'string' ? args[0] : '';
  if (
    msg.includes('Failed to decrypt message') ||
    msg.includes('Bad MAC') ||
    msg.includes('Session error') ||
    msg.includes('No matching sessions found') ||
    msg.includes('No session found to decrypt') ||
    msg.includes('MessageCounterError') ||
    msg.includes('Key used already or never filled')
  ) {
    return; // ignorar silenciosamente
  }
  originalConsoleError(...args);
};

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Excepción no capturada');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Rechazo no controlado');
  process.exit(1);
});

async function main() {
  logger.info(`Iniciando ${config.botName} 2.0`);
  const bot = new Bot();
  await bot.start();
}

main().catch((err) => {
  logger.fatal({ err }, 'Fallo al arrancar');
  process.exit(1);
});

