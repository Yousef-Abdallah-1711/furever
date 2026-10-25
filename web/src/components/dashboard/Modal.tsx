'use client';
import { Dialog } from '@base-ui/react/dialog';
import type { ReactNode } from 'react';
import { Icon } from '../Icon';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-overlay" />
        <Dialog.Popup className="fixed start-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-r-card bg-surface p-sp-6 shadow-sheet">
          <Dialog.Close render={<button type="button" aria-label="Close dialog" className="absolute end-sp-4 top-sp-4 rounded-r-control p-sp-2" />}>
            <Icon name="x" size={20} />
          </Dialog.Close>
          {title ? <Dialog.Title className="mb-sp-4 text-fs-h3 text-text-primary">{title}</Dialog.Title> : null}
          <div className="text-fs-body text-text-primary">{children}</div>
          {footer ? <div className="mt-sp-6 flex justify-end gap-sp-3">{footer}</div> : null}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
