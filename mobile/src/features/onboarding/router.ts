/**
 * Route identifiers for the D02 onboarding flow.
 *
 * Expo Router route groups such as `(auth)` and `(tabs)` are included in the
 * href used to target a group, but are omitted from the browser/deep-link URL.
 * For example, `/(auth)/sign-in` resolves to `/sign-in` and
 * `/(tabs)/home` resolves to `/home`. Root `/` remains the Splash route.
 */
export const onboardingRoutes = {
  language: '/language',
  onboarding: '/onboarding',
  welcome: '/welcome',
  signIn: '/(auth)/sign-in',
  otp: '/(auth)/otp',
  completeProfile: '/(auth)/complete-profile',
  newPet: '/pets/new',
  permissions: '/permissions',
  summary: '/onboarding/summary',
  home: '/(tabs)/home',
} as const;

export type OnboardingRoute = (typeof onboardingRoutes)[keyof typeof onboardingRoutes];

/** The latest completed milestone in a new owner's setup flow. */
export type NewOwnerProgress =
  | 'not-started'
  | 'language-selected'
  | 'onboarding-complete'
  | 'welcome-complete'
  | 'email-sign-in-complete'
  | 'email-verified'
  | 'profile-complete'
  | 'pet-setup-in-progress'
  | 'pet-setup-complete'
  | 'permissions-complete'
  | 'summary-complete';

/**
 * Return the next D02 route for a new owner from explicit completed progress.
 * Pet creation and skipping are owned by the pet flow; callers report when
 * those steps are complete so this router does not choose pet policy.
 */
export function getNextNewOwnerRoute(progress: NewOwnerProgress): OnboardingRoute {
  switch (progress) {
    case 'not-started':
      return onboardingRoutes.language;
    case 'language-selected':
      return onboardingRoutes.onboarding;
    case 'onboarding-complete':
      return onboardingRoutes.welcome;
    case 'welcome-complete':
      return onboardingRoutes.signIn;
    case 'email-sign-in-complete':
      return onboardingRoutes.otp;
    case 'email-verified':
      return onboardingRoutes.completeProfile;
    case 'profile-complete':
    case 'pet-setup-in-progress':
      return onboardingRoutes.newPet;
    case 'pet-setup-complete':
      return onboardingRoutes.permissions;
    case 'permissions-complete':
      return onboardingRoutes.summary;
    case 'summary-complete':
      return onboardingRoutes.home;
  }
}

export type SignInProvider = 'email' | 'google';

/** The latest completed milestone and available provider state for a returning owner. */
export type ReturningOwnerProgress =
  | { stage: 'not-started' }
  | { stage: 'welcome-complete' }
  | { stage: 'sign-in'; provider?: SignInProvider }
  | { stage: 'email-verified' }
  | { stage: 'google-sign-in-complete' };

/**
 * Return the next D02 route for a returning owner.
 * Email selection proceeds through OTP; Google goes home only after completion.
 */
export function getNextReturningOwnerRoute(progress: ReturningOwnerProgress): OnboardingRoute {
  switch (progress.stage) {
    case 'not-started':
      return onboardingRoutes.welcome;
    case 'welcome-complete':
      return onboardingRoutes.signIn;
    case 'sign-in':
      if (progress.provider === 'email') return onboardingRoutes.otp;
      return onboardingRoutes.signIn;
    case 'email-verified':
    case 'google-sign-in-complete':
      return onboardingRoutes.home;
  }
}
