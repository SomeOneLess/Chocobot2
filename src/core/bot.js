import { makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore } from '@whiskeysockets/baileys';
import NodeCache from 'node-cache';
import qrcode from 'qrcode-terminal';
import readline from 'readline';
import path from 'path';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import { MessageHandler } from './commandHandler.js';
import { storeMessage } from '../commands/general/undel.js';

const usePairingCode = process.argv.includes('--code') || process.env.USE_PAIRING_CODE === 'true';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

let isStarting = false;
let reconnectTimer = null;
let reconnectAttempts = 0;

export class Bot {
  constructor() {
    this.handler = new MessageHandler();
    this.sock = null;
  }

  async start() {
    if (isStarting) {
      logger.warn('Inicio ya en curso, omitiendo');
      return;
    }
    isStarting = true;

    try {
      await this.handler.loadCommands();

      const { state, saveCreds } = await useMultiFileAuthState(config.paths.auth);
      const msgRetryCounterCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

      this.sock = makeWASocket({
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        msgRetryCounterCache,
        logger,
        printQRInTerminal: false,
        browser: ['Debian', 'Chrome', '13.0.0'],
        syncFullHistory: false,
        shouldSyncHistoryMessage: () => false,
        connectTimeoutMs: config.connection.connectTimeoutMs,
        keepAliveIntervalMs: config.connection.keepAliveIntervalMs,
        defaultQueryTimeoutMs: config.connection.defaultQueryTimeoutMs,
      });

      this.sock.ev.on('creds.update', saveCreds);

      if (usePairingCode && !this.sock.authState.creds.registered) {
        setTimeout(async () => {
          try {
            let phone = process.env.BOT_PHONE || config.owner.number || '';
            if (!phone) {
              phone = await question('📱 Número con código de país (ej. 5491123456789): ');
            }
            phone = phone.replace(/\D/g, '');
            if (phone) {
              const code = await this.sock.requestPairingCode(phone);
              const formatted = code?.match(/.{1,4}/g)?.join('-') || code;
              logger.info(`🔑 Código de vinculación: ${formatted}`);
            }
          } catch (err) {
            logger.error({ err }, 'Error generando código de vinculación');
          }
        }, 3000);
      }

      this.sock.ev.on('connection.update', (update) => this.handleConnection(update));
      this.sock.ev.on('messages.upsert', (m) => {
        // Guardar mensajes para undel
        if (m.messages) {
          for (const msg of m.messages) {
            if (msg.message && !msg.key.fromMe) storeMessage(msg);
          }
        }
        this.handler.handleMessages(this.sock, m);
      });
      this.sock.ev.on('messages.update', (updates) => this.handleMessagesUpdate(updates));
      this.sock.ev.on('group-participants.update', (update) => this.handleGroupParticipants(update));

      logger.info('Bot iniciado');
    } catch (err) {
      logger.error({ err }, 'Error al iniciar el bot');
      throw err;
    } finally {
      isStarting = false;
    }
  }

  handleConnection({ connection, lastDisconnect, qr }) {
    if (qr && !usePairingCode) {
      logger.info('📱 Escanea el código QR:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      reconnectAttempts = 0;
      logger.info(`✅ Conectado como ${this.sock.user?.id || 'desconocido'}`);
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const isLoggedOut = statusCode === DisconnectReason.loggedOut;

      logger.warn({ statusCode, message: lastDisconnect?.error?.message }, 'Conexión cerrada');

      try {
        this.sock?.ws?.close();
        this.sock?.ev?.removeAllListeners();
      } catch {}

      if (!isLoggedOut) {
        this.scheduleReconnect();
      } else {
        logger.error('Sesión revocada. No se borraron las credenciales. Revisa dispositivos vinculados.');
      }
    }
  }

  scheduleReconnect() {
    if (reconnectTimer) return;
    if (reconnectAttempts >= config.connection.maxReconnectAttempts) {
      logger.error('Máximo de reconexiones alcanzado. Saliendo.');
      process.exit(1);
    }

    reconnectAttempts++;
    logger.info(`Reconectando en ${config.connection.reconnectDelayMs}ms (intento ${reconnectAttempts})`);

    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      this.start().catch(() => this.scheduleReconnect());
    }, config.connection.reconnectDelayMs);
  }

  async handleMessagesUpdate(updates) {
    // Anti-delete se implementará en events/antiDelete.js
    logger.debug({ updates }, 'messages.update');
  }

  async handleGroupParticipants(update) {
    const { id, participants, action } = update;
    if (action !== 'add') return;

    // Welcome se implementará con servicio de grupos
    logger.debug({ id, participants }, 'Nuevos participantes');
  }
}
