const answers = [
  'Sí.',
  'No.',
  'Definitivamente.',
  'Probablemente no.',
  'Pregunta de nuevo más tarde.',
  'No cuentes con ello.',
  'Mis fuentes dicen que sí.',
  'Mis fuentes dicen que no.',
  'Sin duda.',
  'Muy dudoso.',
  'Las señales apuntan a que sí.',
  'Mejor no te lo digo ahora.',
  'Concéntrate y pregunta otra vez.',
  'Es cierto.',
  'No lo creo.',
  'Puede ser.',
  'Absolutamente.',
  'Ni en sueños.',
  'Sí, pero con cuidado.',
  'No está claro.',
];

export default {
  name: 'b8',
  aliases: ['bola8', '8ball', 'magic8'],
  category: 'juegos',
  description: 'Pregúntale a la bola 8',
  react: '🎱',
  async execute({ sock, remoteJid, args }) {
    const question = args.join(' ').trim();
    if (!question) {
      await sock.sendMessage(remoteJid, { text: 'Uso: .b8 <pregunta>' });
      return;
    }
    const answer = answers[Math.floor(Math.random() * answers.length)];
    await sock.sendMessage(remoteJid, { text: `🎱 *${question}*\n\n${answer}` });
  },
};
