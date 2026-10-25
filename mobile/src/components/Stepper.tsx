import type { ReactElement } from 'react';
import { Text, View } from 'react-native';

export interface StepperProps {
  steps: string[];
  current?: number;
}

export function Stepper({ steps, current = 0 }: StepperProps): ReactElement {
  return (
    <View accessibilityRole="progressbar" className="flex-row">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;

        return (
          <View key={`${step}-${index}`} className="min-w-0 flex-1">
            <View className="flex-row items-center">
              <View
                className={`h-sp-6 w-sp-6 items-center justify-center rounded-r-full ${done || active ? 'bg-primary' : 'border border-border bg-surface'}`}
              >
                {done ? (
                  <Text className="text-fs-caption text-on-primary">✓</Text>
                ) : active ? null : (
                  <View className="h-sp-2 w-sp-2 rounded-r-full bg-text-secondary" />
                )}
              </View>
              {index < steps.length - 1 ? (
                <View className={`flex-1 border-t ${done ? 'border-primary' : 'border-border'}`} />
              ) : null}
            </View>
            <Text className={`mt-sp-2 pe-sp-2 text-fs-caption ${done || active ? 'text-text-primary' : 'text-text-secondary'}`}>
              {step}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
