// Almacén de mensajes recientes por chat (para undel)
const messageStore = new Map();

export function storeMessage(msg) {
  if (!msg?.key || !msg.message) return;
  const chat = msg.key.remoteJid;
  if (!messageStore.has(chat)) messageStore.set(chat, []);
  const list = messageStore.get(chat);
  list.push({
    key: msg.key,
    message: msg.message,
    participant: msg.key.participant || msg.key.remoteJid,
    timestamp: Date.now(),
  });
  if (list.length > 100) list.shift();
}

export function getStored(chat, count = 10) {
  return (messageStore.get(chat) || []).slice(-count);
}

export function findById(chat, id) {
  const list = messageStore.get(chat) || [];
  return list.find(m => m.key.id === id);
}

export default {
  name: 'undel',
  aliases: ['undelete', 'recuperar'],
  category: 'general',
  description: 'Muestra los últimos mensajes eliminados del chat',
  react: '♻️',
  async execute({ sock, remoteJid }) {
    const list = getStored(remoteJid, 8);
    if (list.length === 0) {
      await sock.sendMessage(remoteJid, { text: 'No hay mensajes recientes almacenados en este chat.' });
      return;
    }
    let text = '*Últimos mensajes (posiblemente eliminados):*\n\n';
    for (const item of list.reverse()) {
      const sender = (item.participant || '').split('@')[0] || '?';
      const content = item.message?.conversation ||
                      item.message?.extendedTextMessage?.text ||
                      item.message?.imageMessage?.caption ||
                      '[media/otro]';
      text += `@${sender}: ${String(content).slice(0, 180)}\n`;
    }
    await sock.sendMessage(remoteJid, {
      text,
      mentions: list.map(i => i.participant).filter(Boolean),
    });
  },
};
