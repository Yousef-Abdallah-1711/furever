'use client';

export interface SkeletonProps {
  w?: number | string;
  h?: number | string;
  r?: number | string;
}

export function Skeleton({ w = '100%', h = 16, r = 8 }: SkeletonProps) {
  return (
    <div
      className="animate-pulse bg-fe-skel-mix-1"
      style={{ width: w, height: h, borderRadius: r }}
      aria-hidden="true"
    />
  );
}
