import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import db from '../services/database/index.js';
import { react, defaultReactions } from '../utils/reactions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class MessageHandler {
  constructor() {
    this.prefix = config.prefix;
    this.commands = new Map();
    this.processed = new Map();
  }

  async loadCommands() {
    const commandsDir = path.join(__dirname, '../commands');
    const files = this.getJsFiles(commandsDir);

    for (const file of files) {
      try {
        const mod = await import(pathToFileURL(file).href);
        const cmd = mod.default;
        if (Array.isArray(cmd)) {
          for (const c of cmd) {
            if (c?.name && typeof c.execute === 'function') {
              this.commands.set(c.name.toLowerCase(), c);
              if (Array.isArray(c.aliases)) {
                for (const alias of c.aliases) this.commands.set(alias.toLowerCase(), c);
              }
              logger.info(`Comando cargado: ${c.name}`);
            }
          }
        } else if (cmd?.name && typeof cmd.execute === 'function') {
          this.commands.set(cmd.name.toLowerCase(), cmd);
          if (Array.isArray(cmd.aliases)) {
            for (const alias of cmd.aliases) {
              this.commands.set(alias.toLowerCase(), cmd);
            }
          }
          logger.info(`Comando cargado: ${cmd.name}`);
        }
      } catch (err) {
        logger.error({ err, file }, 'Error cargando comando');
      }
    }

    logger.info(`Total de comandos: ${this.commands.size}`);
  }

  getJsFiles(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) results = results.concat(this.getJsFiles(full));
      else if (entry.name.endsWith('.js')) results.push(full);
    }
    return results;
  }

  isDuplicate(msg) {
    const key = `${msg.key.remoteJid}:${msg.key.id}`;
    const now = Date.now();
    if (this.processed.has(key) && now - this.processed.get(key) < 60_000) return true;
    this.processed.set(key, now);
    if (this.processed.size > 5000) {
      for (const [k, t] of this.processed) {
        if (now - t > 60_000) this.processed.delete(k);
      }
    }
    return false;
  }

  extractText(message) {
    if (!message) return '';
    return (
      message.conversation ||
      message.extendedTextMessage?.text ||
      message.imageMessage?.caption ||
      message.videoMessage?.caption ||
      ''
    ).trim();
  }

  extractMentions(msg) {
    const ctx = msg.message?.extendedTextMessage?.contextInfo ||
                msg.message?.imageMessage?.contextInfo ||
                msg.message?.videoMessage?.contextInfo ||
                msg.message?.stickerMessage?.contextInfo;
    return ctx?.mentionedJid || [];
  }

  extractQuoted(msg) {
    const unwrapped = msg.message || {};
    const ctx =
      unwrapped.extendedTextMessage?.contextInfo ||
      unwrapped.imageMessage?.contextInfo ||
      unwrapped.videoMessage?.contextInfo ||
      unwrapped.stickerMessage?.contextInfo ||
      unwrapped.documentMessage?.contextInfo ||
      null;

    if (!ctx?.quotedMessage) return null;

    return {
      message: ctx.quotedMessage,
      participant: ctx.participant || null,
      stanzaId: ctx.stanzaId || null,
      key: ctx.stanzaId
        ? {
            remoteJid: msg.key.remoteJid,
            id: ctx.stanzaId,
            fromMe: false,
            participant: ctx.participant,
          }
        : null,
    };
  }

  extractMedia(msg) {
    const m = msg.message || {};
    if (m.imageMessage) return { type: 'image', message: m.imageMessage };
    if (m.videoMessage) return { type: 'video', message: m.videoMessage };
    if (m.stickerMessage) return { type: 'sticker', message: m.stickerMessage };
    if (m.documentMessage) return { type: 'document', message: m.documentMessage };
    return null;
  }

  async handleMessages(sock, m) {
    if (m.type !== 'notify' || !m.messages) return;

    for (const msg of m.messages) {
      if (!msg.message || msg.key.remoteJid === 'status@broadcast') continue;

      const remoteJid = msg.key.remoteJid;
      const isGroup = remoteJid.endsWith('@g.us');
      const isFromMe = msg.key.fromMe;
      const sender = isFromMe ? sock.user.id : (msg.key.participant || remoteJid);
      const text = this.extractText(msg.message);

      if (!text.startsWith(this.prefix)) continue;

      const [name, ...args] = text.slice(this.prefix.length).trim().split(/\s+/);
      const command = this.commands.get(name.toLowerCase());
      if (!command) continue;

      if (this.isDuplicate(msg)) {
        logger.debug(`Comando duplicado omitido: ${name}`);
        continue;
      }

      // Reacción inicial
      const reactEmoji = command.react || defaultReactions[name.toLowerCase()] || defaultReactions[command.category] || defaultReactions.default;
      await react(sock, msg, reactEmoji);

      if (command.category === 'nsfw' && isGroup) {
        const group = db.prepare('SELECT nsfw FROM groups WHERE jid = ?').get(remoteJid);
        if (!group?.nsfw) {
          await sock.sendMessage(remoteJid, { text: config.messages.nsfwDisabled });
          await react(sock, msg, '🚫');
          continue;
        }
      }

      try {
        await command.execute({
          sock,
          msg,
          remoteJid,
          sender,
          isGroup,
          isFromMe,
          args,
          mentions: this.extractMentions(msg),
          quoted: this.extractQuoted(msg),
          media: this.extractMedia(msg),
          prefix: this.prefix,
          config,
          db,
          commands: this.commands,
          handler: this,
          react: (emoji) => react(sock, msg, emoji),
        });

        // Reacción de éxito
        await react(sock, msg, command.reactSuccess || defaultReactions.success);
      } catch (err) {
        logger.error({ err, command: name }, 'Error ejecutando comando');
        await sock.sendMessage(remoteJid, { text: config.messages.error }).catch(() => {});
        await react(sock, msg, defaultReactions.error);
      }
    }
  }
}
