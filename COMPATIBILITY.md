# FurEver Platform Compatibility Pins

Checked: 2026-10-19 (live fetches of official documentation)

| Package | Pinned version | Official source URL | Date checked |
|---|---|---|---|
| Expo SDK | 57 (generated package pin: 57.0.30) | https://docs.expo.dev/versions/v57.0.0/ (SDK/RN/React compatibility table); official `default@sdk-57` create-expo-app template | 2026-10-19 |
| React Native (SDK 57 pairing) | 0.86.3 (Expo SDK table: 0.86) | https://docs.expo.dev/versions/v57.0.0/ (SDK/RN pairing); official `default@sdk-57` create-expo-app template | 2026-10-19 |
| React (SDK 57 pairing) | 19.2.3 | https://docs.expo.dev/versions/v57.0.0/ | 2026-10-19 |
| react-native-reanimated | 4.5.1 (Expo SDK 57 recommended version) | https://docs.expo.dev/versions/v57.0.0/sdk/reanimated/ | 2026-10-19 |
| Nativewind | 4.2.7 (current stable) | https://www.nativewind.dev/docs (stable release overview); https://www.nativewind.dev/docs/getting-started/installation | 2026-10-19 |
| Node.js | 22.13.0 minimum (Expo permits 22.13 or newer on the 22.x line) | https://expo.dev/changelog/sdk-58 | 2026-10-19 |
| Next.js + React | Next.js 16.4 + React 19.3 | https://nextjs.org/blog/next-16-4 | 2026-10-19 |

## Compatibility finding

Expo’s SDK 57 reference pairs SDK 57 with React Native 0.86, React 19.2.3, and Node 22.13.x. The SDK 57 versioned Reanimated reference recommends 4.5.1. Expo’s official `default@sdk-57` template plus `expo install` resolves the exact application pins used here (Expo 57.0.30 and React Native 0.86.3). Nativewind 4.2.7 explicitly documents SDK 57 support; the isolated export and computed-style smoke also passed on this pairing. The separate web pin remains Next.js 16.4 with React 19.3.

## Source details and limitations

- Expo’s SDK 57 versioned reference lists the SDK pairing as React Native 0.86, React 19.2.3, React Native Web 0.21.0, and Node 22.13.x. The SDK 57 versioned Reanimated reference recommends 4.5.1.
- Expo’s official `default@sdk-57` project generator emitted Expo `~57.0.30` and React Native `0.86.3`; `expo install` resolved SDK-specific packages from that template. Dependency ranges will be converted to exact installed versions in `mobile/package.json`.
- Nativewind’s docs identify 4.2.7 as stable and explicitly document Expo SDK 57 support. The SDK 57 isolated app used `react-native-css-interop` 0.2.7 explicitly because pnpm’s isolated dependency layout otherwise failed to resolve Nativewind’s JSX runtime.
- Expo’s SDK 57 reference sets Node 22.13.x as the minimum supported line. `.nvmrc` remains pinned to 22.13.0.
- Next.js 16.4’s official release post says it ships with React 19.3. The Next.js release documentation discusses App Router React Canary behavior; 19.3 here is the release’s stated React version, not an independently checked npm patch build.

## Tooling

Checked: 2026-10-19 (official npm package pages)

| Package | Pinned version | Official source URL | Date checked |
|---|---|---|---|
| turbo | 2.10.13 | https://www.npmjs.com/package/turbo | 2026-10-19 |
| @biomejs/biome | 2.5.15 | https://www.npmjs.com/package/@biomejs/biome | 2026-10-19 |
| typescript | 7.0.2 | https://www.npmjs.com/package/typescript | 2026-10-19 |
| husky | 9.1.7 | https://www.npmjs.com/package/husky | 2026-10-19 |
| @commitlint/cli | 21.2.3 | https://www.npmjs.com/package/@commitlint/cli | 2026-10-19 |
| @commitlint/config-conventional | 21.2.3 | https://www.npmjs.com/package/@commitlint/config-conventional | 2026-10-19 |
| lint-staged | 17.6.0 | https://www.npmjs.com/package/lint-staged | 2026-10-19 |
| tsx | 4.23.15 | https://www.npmjs.com/package/tsx | 2026-10-19 |
| @types/node | 26.6.5 | https://www.npmjs.com/package/@types/node | 2026-10-19 |
| vitest | 5.0.5 | https://www.npmjs.com/package/vitest | 2026-10-19 |
| jest-expo | 58.0.11 | https://www.npmjs.com/package/jest-expo | 2026-10-19 |
| jest | 30.5.2 | https://www.npmjs.com/package/jest | 2026-10-19 |

## Tailwind major-version decision (2026-10-19)

- **Mobile:** NativeWind 4.2.7 requires Tailwind CSS 3.x. Pin Tailwind 3.4.x in the mobile workspace and use the generated tailwind-preset.js with the standard JavaScript presets configuration. NativeWind's stable installation guide specifies tailwindcss@^3.4.17 and states v4.2.7 keeps Tailwind CSS 3 configuration.
- **Web:** use Tailwind CSS 4.x, matching Tailwind's current official Next.js setup (@tailwindcss/postcss and CSS @import "tailwindcss"). Consume packages/design-tokens/dist/variables.css and map its CSS custom properties through Tailwind 4 @theme inline definitions where utility classes are needed. The web app does not consume the v3 tailwind-preset.js.
- **Preset compatibility:** Tailwind 4 can load legacy JavaScript configs explicitly with @config, and its documentation says config support remains for backward compatibility; config files are no longer auto-detected. The design-system generator's preset is a Tailwind 3 preset, so it is intentionally used only by mobile. The generated CSS variables serve web independently of Tailwind's preset format.
- **Official sources:** [NativeWind stable installation](https://www.nativewind.dev/docs/getting-started/installation) (2026-10-19); [Tailwind CSS Next.js installation](https://tailwindcss.com/docs/installation/framework-guides/nextjs) (2026-10-19); [Tailwind CSS upgrade guide: JavaScript config compatibility](https://tailwindcss.com/docs/upgrade-guide) (2026-10-19); [Tailwind CSS directives: @config](https://tailwindcss.com/docs/functions-and-directives) (2026-10-19).
