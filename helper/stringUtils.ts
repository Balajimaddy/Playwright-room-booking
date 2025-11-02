export function capitalizeFirst(s: string): string {
  const t = s.trim().toLowerCase();
  return t ? t[0].toUpperCase() + t.slice(1) : t;
}
