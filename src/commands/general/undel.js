// Anti-delete básico en memoria (se puede persistir después)
const deleted = new Map();

export function trackMessage(msg) {
  if (!msg.key || !msg.message) return;
  const chat = msg.key.remoteJid;
  if (!deleted.has(chat)) deleted.set(chat, []);
  const list = deleted.get(chat);
  list.push({
    key: msg.key,
    message: msg.message,
    timestamp: Date.now(),
    participant: msg.key.participant || msg.key.remoteJid,
  });
  if (list.length > 50) list.shift();
}

export function getLastDeleted(chat, count = 5) {
  return (deleted.get(chat) || []).slice(-count);
}

export default {
  name: 'undel',
  aliases: ['undelete', 'recuperar'],
  category: 'general',
  description: 'Muestra los últimos mensajes eliminados del chat',
  react: '♻️',
  async execute({ sock, remoteJid }) {
    const list = getLastDeleted(remoteJid, 5);
    if (list.length === 0) {
      await sock.sendMessage(remoteJid, { text: 'No hay mensajes eliminados recientes en este chat.' });
      return;
    }
    let text = '*Últimos mensajes eliminados:*\n\n';
    for (const item of list.reverse()) {
      const sender = item.participant?.split('@')[0] || 'desconocido';
      const content = item.message?.conversation || item.message?.extendedTextMessage?.text || '[media]';
      text += `@${sender}: ${content.slice(0, 200)}\n`;
    }
    await sock.sendMessage(remoteJid, { text, mentions: list.map(i => i.participant).filter(Boolean) });
  },
};
