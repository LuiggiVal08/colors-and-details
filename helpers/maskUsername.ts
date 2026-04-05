// --- Helpers ---
export function maskUsername(username: string) {
  if (!username || username.length < 2) return username;
  const first = username[0];
  const last = username[username.length - 1];
  const middleMask = '*'.repeat(Math.max(1, username.length - 2));
  return `${first}${middleMask}${last}`;
}
