'use client';

import type { ReactElement } from 'react';

export interface StepperProps {
  steps: string[];
  current?: number;
}

export function Stepper({ steps, current = 0 }: StepperProps): ReactElement {
  return (
    <div aria-valuemax={steps.length - 1} aria-valuenow={current} aria-label="Progress" role="progressbar" className="flex flex-row">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;

        return (
          <div key={`${step}-${index}`} className="min-w-0 flex-1">
            <div className="flex flex-row items-center">
              <span
                aria-current={active ? 'step' : undefined}
                className={`flex h-sp-6 w-sp-6 items-center justify-center rounded-r-full ${done || active ? 'bg-primary' : 'border border-border bg-surface'}`}
              >
                {done ? (
                  <span className="text-fs-caption text-on-primary">✓</span>
                ) : active ? null : (
                  <span className="h-sp-2 w-sp-2 rounded-r-full bg-text-secondary" />
                )}
              </span>
              {index < steps.length - 1 ? (
                <span className={`flex-1 border-t ${done ? 'border-primary' : 'border-border'}`} />
              ) : null}
            </div>
            <p className={`mt-sp-2 pe-sp-2 text-fs-caption ${done || active ? 'text-text-primary' : 'text-text-secondary'}`}>
              {step}
            </p>
          </div>
        );
      })}
    </div>
  );
}

