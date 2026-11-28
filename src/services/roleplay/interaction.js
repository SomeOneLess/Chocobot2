import { hasActivePremium, benefits } from '../premium/index.js';
import { getGif, sendRoleplay } from './index.js';

export async function sendInteraction({ sock, remoteJid, sender, target, text, command, kind = 'sfw' }) {
  const mentions = [sender, target];
  let gif = null;
  if (benefits.gifs && hasActivePremium(sender)) {
    gif = await getGif(command, kind);
  }
  await sendRoleplay(sock, remoteJid, text, mentions, gif);
}
