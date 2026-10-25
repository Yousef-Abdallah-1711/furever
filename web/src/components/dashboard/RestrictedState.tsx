'use client';
import type { ReactNode } from 'react';
import { EmptyState } from '../EmptyState';

export interface RestrictedStateProps {
  allowed: boolean;
  children: ReactNode;
  message?: string;
}

export function RestrictedState({ allowed, children, message }: RestrictedStateProps) {
  if (allowed) return <>{children}</>;
  return <EmptyState icon="lock" title="You do not have access" body={message ?? 'This page needs manager or super admin access.'} />;
}
