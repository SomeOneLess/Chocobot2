import { getUser, updateUser } from '../database/users.js';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Beneficios Premium (extensible).
 * Para agregar uno nuevo: añade la clave aquí y úsala en el comando correspondiente.
 */
export const benefits = {
  gifs: true,           // Interacciones con GIF
  nsfwDiscount: 0.5,    // 50% descuento en NSFW
  freeVoz: true,        // .voz gratis
  freeIa: true,         // .ia gratis
  xpMultiplier: 2,      // XP x2
};

export function hasActivePremium(jid) {
  const user = getUser(jid);
  if (!user?.premiumUntil) return false;
  return user.premiumUntil > Date.now();
}

export function addPremiumDays(jid, days) {
  const user = getUser(jid);
  const now = Date.now();
  const current = user.premiumUntil && user.premiumUntil > now ? user.premiumUntil : now;
  const newUntil = current + days * DAY_MS;
  updateUser(jid, { premiumUntil: newUntil });
  return newUntil;
}

export function getPremiumInfo(jid) {
  const user = getUser(jid);
  if (!user?.premiumUntil || user.premiumUntil <= Date.now()) {
    return { active: false, until: null, daysLeft: 0 };
  }
  const daysLeft = Math.ceil((user.premiumUntil - Date.now()) / DAY_MS);
  return { active: true, until: user.premiumUntil, daysLeft };
}

export function getNsfwCost(baseCost, jid) {
  if (hasActivePremium(jid) && benefits.nsfwDiscount) {
    return Math.max(1, Math.floor(baseCost * benefits.nsfwDiscount));
  }
  return baseCost;
}

export function getXpGain(baseXp, jid) {
  if (hasActivePremium(jid) && benefits.xpMultiplier) {
    return baseXp * benefits.xpMultiplier;
  }
  return baseXp;
}
