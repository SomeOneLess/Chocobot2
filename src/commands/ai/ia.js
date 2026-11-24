export default {
  name: 'ia',
  aliases: ['gpt', 'ai'],
  category: 'ai',
  description: 'Consulta a la inteligencia artificial',
  react: '🧠',
  reactSuccess: '✅',
  async execute({ sock, remoteJid, args, react }) {
    const query = args.join(' ').trim();
    if (!query) {
      await sock.sendMessage(remoteJid, { text: 'Uso: .ia <pregunta>' });
      return;
    }

    await react('🧠');
    try {
      // Endpoint gratuito de Pollinations (sin clave)
      const url = `https://text.pollinations.ai/${encodeURIComponent(query)}`;
      const res = await fetch(url);
      const text = await res.text();
      const reply = text.slice(0, 1500) || 'No obtuve respuesta.';
      await sock.sendMessage(remoteJid, { text: `🧠 *IA*\n\n${reply}` });
    } catch (err) {
      await sock.sendMessage(remoteJid, { text: '❌ No pude consultar la IA en este momento.' });
      throw err;
    }
  },
};
