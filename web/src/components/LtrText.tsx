import type { HTMLAttributes, PropsWithChildren } from 'react';

export function LtrText({ children, ...props }: PropsWithChildren<HTMLAttributes<HTMLSpanElement>>) {
  return <span dir="ltr" style={{ unicodeBidi: 'isolate' }} {...props}>{children}</span>;
}
