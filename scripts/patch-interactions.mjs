import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const targets = [
  { dir: 'src/commands/roleplay', kind: 'sfw' },
  { dir: 'src/commands/nsfw', kind: 'nsfw' },
];

const callRe = /await sock\.sendMessage\(remoteJid, \{\s*text: (`(?:[^`\\]|\\.)*`),\s*mentions: \[sender, target\],?\s*\}\);/;
const importLine = "import { sendInteraction } from '../../services/roleplay/interaction.js';";

for (const { dir, kind } of targets) {
  const abs = path.join(root, dir);
  for (const file of fs.readdirSync(abs).filter((f) => f.endsWith('.js'))) {
    const full = path.join(abs, file);
    let src = fs.readFileSync(full, 'utf-8');
    if (!src.includes('chargeInteraction') || src.includes('sendInteraction')) continue;
    if (!callRe.test(src)) { console.log(`⚠️  sin coincidencia: ${dir}/${file}`); continue; }

    src = src.replace(callRe, (_, tpl) =>
      `await sendInteraction({ sock, remoteJid, sender, target, text: ${tpl}, command: this.name, kind: '${kind}' });`);
    src = src.replace(/(import \{ chargeInteraction \} from [^\n]*\n)/, (m) => `${m}${importLine}\n`);
    fs.writeFileSync(full, src);
    console.log(`✅ ${dir}/${file}`);
  }
}
