import db from './index.js';

export function getUser(jid) {
  const clean = (jid || '').split(':')[0].split('@')[0] + '@s.whatsapp.net';
  let user = db.prepare('SELECT * FROM users WHERE jid = ?').get(clean);
  if (!user) {
    db.prepare('INSERT INTO users (jid, wallet) VALUES (?, ?)').run(clean, 500);
    user = db.prepare('SELECT * FROM users WHERE jid = ?').get(clean);
  }
  return user;
}

export function updateUser(jid, changes) {
  const clean = (jid || '').split(':')[0].split('@')[0] + '@s.whatsapp.net';
  getUser(clean);
  const sets = Object.keys(changes).map(k => `${k} = @${k}`).join(', ');
  db.prepare(`UPDATE users SET ${sets} WHERE jid = @jid`).run({ ...changes, jid: clean });
  return getUser(clean);
}

export function exportEconomy() {
  const users = db.prepare('SELECT jid, wallet, bank, level, exp, warns FROM users').all();
  return users.map(u => ({
    numero: u.jid.split('@')[0],
    cartera: u.wallet,
    banco: u.bank,
    nivel: u.level,
    exp: u.exp,
    warns: u.warns,
  }));
}
