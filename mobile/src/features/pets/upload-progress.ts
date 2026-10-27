export function uploadProgressPercent(loaded: number, total: number): number | null {
  if (!Number.isFinite(loaded) || !Number.isFinite(total) || total <= 0 || loaded < 0) return null;
  return Math.min(99, Math.floor((loaded / total) * 100));
}
