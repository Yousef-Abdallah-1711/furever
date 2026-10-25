'use client';

export interface AvatarProps {
  name?: string;
  size?: number;
  src?: string;
}

function initialsFromName(name?: string) {
  return (name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function Avatar({ name, size = 40, src }: AvatarProps) {
  return (
    <div
      className="flex items-center justify-center overflow-hidden rounded-r-full bg-primary-bg text-text-primary text-fs-body"
      style={{ width: size, height: size }}
      role="img"
      aria-label={name || 'Avatar'}
    >
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : initialsFromName(name)}
    </div>
  );
}
