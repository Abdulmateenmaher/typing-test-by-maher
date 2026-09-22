/**
 * Deterministic avatar helpers.
 *
 * Email/password accounts created with `createUserWithEmailAndPassword` never get a
 * `photoURL` (unlike Google sign-in), so Firebase stores an empty picture for them.
 * Instead of leaving those users without an image we generate a stable, unique
 * gradient + initials avatar locally from their uid/email.
 *
 * The avatar is a plain SVG data-URI, so it needs no network, no external service
 * and no Firestore field (which keeps `photoURL` docs clean and small).
 */

/** FNV-1a style string hash. Same input always yields the same unsigned 32-bit number. */
export function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Builds 1-2 letter initials from a display name, falling back to the email local part. */
function initialsFromValue(value: string): string {
  const atIndex = value.indexOf('@');
  // For an email address only the local part is meaningful ("maher@x.com" -> "M").
  const base = atIndex > 0 ? value.slice(0, atIndex) : value;
  const parts = base.split(/[\s._\-+]+/).filter(Boolean);
  if (parts.length === 0) return '';

  const first = parts[0].charAt(0);
  const second = parts.length > 1 ? parts[1].charAt(0) : '';
  return (first + second).toUpperCase();
}

/** Resolves initials from the first source that yields usable characters. */
export function getInitials(...sources: (string | null | undefined)[]): string {
  for (const source of sources) {
    const value = (source || '').trim();
    if (!value) continue;

    const initials = initialsFromValue(value);
    if (initials) return initials;
  }
  return 'T';
}

/**
 * Generates a deterministic SVG avatar as a data-URI: a two-stop gradient whose hue
 * comes from the seed, with the account initials rendered on top.
 */
export function getGeneratedAvatarUrl(seed: string, initials: string): string {
  const hash = hashSeed(seed || 'typist');
  const hue = hash % 360;
  const hueShift = (hue + 35) % 360;
  const label = (initials || 'T').slice(0, 2);

  // 96x96 viewBox keeps the image crisp from 20px (header) up to 64px (account modal).
  const fontSize = label.length > 1 ? 34 : 44;
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">',
    '<defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1">',
    `<stop offset="0%" stop-color="hsl(${hue}, 72%, 52%)"/>`,
    `<stop offset="100%" stop-color="hsl(${hueShift}, 68%, 34%)"/>`,
    '</linearGradient></defs>',
    '<rect width="96" height="96" fill="url(#a)"/>',
    `<text x="48" y="48" dy="0.35em" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="${fontSize}" font-weight="800" fill="#ffffff">${label}</text>`,
    '</svg>'
  ].join('');

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Picks the best available avatar for an account:
 * the real Firebase photo when present, otherwise the generated one.
 */
export function resolveAvatarUrl(
  photoURL: string | null | undefined,
  seed: string,
  label: string
): string {
  return photoURL && photoURL.trim() ? photoURL : getGeneratedAvatarUrl(seed, label);
}
