import { categories } from '../../config/categories.js';

export default {
  name: 'help',
  aliases: ['ayuda', 'h'],
  category: 'general',
  description: 'Comandos generales, economía y multimedia',
  react: 'ℹ️',
  async execute({ sock, remoteJid, commands, prefix }) {
    const allowed = ['general', 'economy', 'media', 'ai'];
    const unique = new Map();
    for (const cmd of commands.values()) {
      if (!unique.has(cmd.name) && allowed.includes(cmd.category)) {
        unique.set(cmd.name, cmd);
      }
    }

    const byCategory = {};
    for (const cmd of unique.values()) {
      const cat = cmd.category || 'general';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(cmd);
    }

    let text = `*Comandos*\n\n`;
    for (const [cat, cmds] of Object.entries(byCategory)) {
      const catInfo = categories[cat] || { name: cat, emoji: '📁' };
      text += `${catInfo.emoji} *${catInfo.name}*\n`;
      for (const c of cmds.sort((a, b) => a.name.localeCompare(b.name))) {
        text += `• ${prefix}${c.name}\n`;
      }
      text += '\n';
    }
    text += `_Admin: ${prefix}hop | Rol: ${prefix}rolplay | NSFW: ${prefix}rolnsfw_`;
    await sock.sendMessage(remoteJid, { text: text.trim() });
  },
};
