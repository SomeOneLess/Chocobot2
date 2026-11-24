export default {
  name: 'dado',
  aliases: ['roll', 'tirardado'],
  category: 'juegos',
  description: 'Tira un dado (sin apuesta)',
  react: '🎲',
  async execute({ sock, remoteJid, msg }) {
    const roll = Math.floor(Math.random() * 6) + 1;
    await sock.sendMessage(remoteJid, { text: `🎲 Salió *${roll}*` }, { quoted: msg });
  },
};
