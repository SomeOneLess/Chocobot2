import { getGif, sendRoleplay } from '../../services/roleplay/index.js';

function getTarget(mentions, quoted, args) {
  if (mentions?.[0]) return mentions[0];
  if (quoted?.participant) return quoted.participant;
  if (args?.[0]) {
    const num = args[0].replace(/\D/g, '');
    if (num.length >= 8) return `${num}@s.whatsapp.net`;
  }
  return null;
}

function clean(jid) {
  return jid.split(':')[0].split('@')[0];
}

/**
 * Factory para crear comandos de roleplay.
 * Uso: createRoleplayCommand({ name, aliases, emoji, action, phrases, category })
 */
export function createRoleplayCommand({ name, aliases = [], emoji = '💞', action = 'hug', phrases = [], category = 'roleplay' }) {
  return {
    name,
    aliases,
    category,
    description: `Interacción: ${name}`,
    react: emoji,
    reactSuccess: emoji,
    async execute({ sock, remoteJid, sender, mentions, quoted, args }) {
      const target = getTarget(mentions, quoted, args);
      if (!target) {
        await sock.sendMessage(remoteJid, { text: 'Menciona o cita a alguien.' });
        return;
      }

      const phrase = phrases[Math.floor(Math.random() * phrases.length)] || `interactuó con`;
      const text = `${emoji} @${clean(sender)} ${phrase} @${clean(target)}`;
      const gif = await getGif(action);

      await sendRoleplay(sock, remoteJid, text, [sender, target], gif);
    },
  };
}
