import { hasActivePremium, benefits } from '../premium/index.js';
import { getGif, sendRoleplay } from './index.js';

/**
 * Envía el resultado de una interacción.
 * Premium activo -> con GIF acorde (si hay). Resto -> solo texto, como antes.
 * kind: 'sfw' (roleplay) | 'nsfw'
 */
export async function sendInteraction({ sock, remoteJid, sender, target, text, command, kind = 'sfw' }) {
  const mentions = [sender, target];
  let gif = null;
  if (benefits.gifs && hasActivePremium(sender)) {
    gif = await getGif(command, kind); // nunca lanza
  }
  await sendRoleplay(sock, remoteJid, text, mentions, gif);
}

