export default {
  name: 'voz',
  aliases: ['tts', 'say'],
  category: 'general',
  description: 'Convierte texto en nota de voz (Google TTS)',
  react: '🗣️',
  async execute({ sock, remoteJid, args, quoted }) {
    let text = args.join(' ').trim();
    if (!text && quoted?.message) {
      text = quoted.message.conversation || quoted.message.extendedTextMessage?.text || '';
    }
    if (!text) {
      await sock.sendMessage(remoteJid, { text: 'Uso: .voz <texto> o cita un mensaje.' });
      return;
    }
    text = text.slice(0, 200);
    try {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=es&client=tw-ob`;
      const res = await fetch(url);
      const buffer = Buffer.from(await res.arrayBuffer());
      await sock.sendMessage(remoteJid, {
        audio: buffer,
        mimetype: 'audio/mpeg',
        ptt: true,
      });
    } catch {
      await sock.sendMessage(remoteJid, { text: 'No se pudo generar la nota de voz.' });
    }
  },
};
