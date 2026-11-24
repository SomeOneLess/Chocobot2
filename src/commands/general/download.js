export default {
  name: 'download',
  aliases: ['dl'],
  category: 'general',
  description: 'Intenta descargar video de un enlace (YouTube, TikTok, Instagram)',
  react: '⬇️',
  async execute({ sock, remoteJid, args }) {
    const url = args[0];
    if (!url || !url.startsWith('http')) {
      await sock.sendMessage(remoteJid, { text: 'Uso: .dl <enlace>' });
      return;
    }
    await sock.sendMessage(remoteJid, { text: '⏳ Función de descarga en desarrollo. Por ahora usa el enlace directamente o espera una actualización con yt-dlp.' });
  },
};
