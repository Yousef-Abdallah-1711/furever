import {
  getNextNewOwnerRoute,
  getNextReturningOwnerRoute,
  onboardingRoutes,
  type NewOwnerProgress,
} from './router';
import { describe, expect, test } from '@jest/globals';

describe('new-owner onboarding routes', () => {
  test('returns every route in the specified new-user order', () => {
    const progress: NewOwnerProgress[] = [
      'not-started',
      'language-selected',
      'onboarding-complete',
      'welcome-complete',
      'email-sign-in-complete',
      'email-verified',
      'profile-complete',
      'pet-setup-complete',
      'permissions-complete',
      'summary-complete',
    ];

    expect(progress.map(getNextNewOwnerRoute)).toEqual([
      onboardingRoutes.language,
      onboardingRoutes.onboarding,
      onboardingRoutes.welcome,
      onboardingRoutes.signIn,
      onboardingRoutes.otp,
      onboardingRoutes.completeProfile,
      onboardingRoutes.newPet,
      onboardingRoutes.permissions,
      onboardingRoutes.summary,
      onboardingRoutes.home,
    ]);
  });

  test('keeps an incomplete pet setup on the D03 pet route', () => {
    expect(getNextNewOwnerRoute('pet-setup-in-progress')).toBe(onboardingRoutes.newPet);
  });
});

describe('returning-owner onboarding routes', () => {
  test('routes email sign-in through OTP before Home', () => {
    expect(getNextReturningOwnerRoute({ stage: 'not-started' })).toBe(onboardingRoutes.welcome);
    expect(getNextReturningOwnerRoute({ stage: 'welcome-complete' })).toBe(onboardingRoutes.signIn);
    expect(getNextReturningOwnerRoute({ stage: 'sign-in', provider: 'email' })).toBe(onboardingRoutes.otp);
    expect(getNextReturningOwnerRoute({ stage: 'email-verified' })).toBe(onboardingRoutes.home);
  });

  test('keeps Google selection at Sign-in until authentication is complete', () => {
    expect(getNextReturningOwnerRoute({ stage: 'not-started' })).toBe(onboardingRoutes.welcome);
    expect(getNextReturningOwnerRoute({ stage: 'welcome-complete' })).toBe(onboardingRoutes.signIn);
    expect(getNextReturningOwnerRoute({ stage: 'sign-in', provider: 'google' })).toBe(onboardingRoutes.signIn);
    expect(getNextReturningOwnerRoute({ stage: 'google-sign-in-complete' })).toBe(onboardingRoutes.home);
  });

  test('holds at sign-in until the provider outcome is known', () => {
    expect(getNextReturningOwnerRoute({ stage: 'sign-in' })).toBe(onboardingRoutes.signIn);
  });
});
