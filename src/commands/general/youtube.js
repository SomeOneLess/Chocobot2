export default {
  name: 'youtube',
  aliases: ['yt'],
  category: 'general',
  description: 'Busca un video de YouTube y envía un enlace aleatorio',
  react: '▶️',
  async execute({ sock, remoteJid, args, quoted }) {
    let query = args.join(' ').trim();
    if (!query && quoted?.message) {
      const text = quoted.message.conversation || quoted.message.extendedTextMessage?.text || '';
      query = text.slice(0, 100);
    }
    if (!query) {
      await sock.sendMessage(remoteJid, { text: 'Uso: .yt <búsqueda> o cita un mensaje.' });
      return;
    }
    try {
      const res = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
      const html = await res.text();
      const ids = [...html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)].map(m => m[1]);
      const unique = [...new Set(ids)].slice(0, 15);
      if (unique.length === 0) {
        await sock.sendMessage(remoteJid, { text: 'No se encontraron resultados.' });
        return;
      }
      const id = unique[Math.floor(Math.random() * unique.length)];
      await sock.sendMessage(remoteJid, { text: `▶️ https://youtu.be/${id}` });
    } catch {
      await sock.sendMessage(remoteJid, { text: 'Error al buscar en YouTube.' });
    }
  },
};
