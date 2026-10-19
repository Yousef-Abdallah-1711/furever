# FurEver Platform Compatibility Pins

Checked: 2026-10-19 (live fetches of official documentation)

| Package | Pinned version | Official source URL | Date checked |
|---|---|---|---|
| Expo SDK | 58 | https://expo.dev/changelog/sdk-58 | 2026-10-19 |
| React Native (SDK 58 pairing) | 0.88.0-rc.0 | https://expo.dev/changelog/sdk-58 (Expo identifies SDK 58 as including React Native 0.88 and links the 0.88.0-rc.0 release notes); https://reactnative.dev/releases/overview | 2026-10-19 |
| react-native-reanimated | 4.7.1 (Expo SDK 58 recommended version) | https://docs.expo.dev/versions/v58.0.0/sdk/reanimated/ | 2026-10-19 |
| Nativewind | 4.2.7 (current stable) | https://www.nativewind.dev/docs (stable release overview); https://www.nativewind.dev/docs/getting-started/installation | 2026-10-19 |
| Node.js | 22.13.0 minimum (Expo permits 22.13 or newer on the 22.x line) | https://expo.dev/changelog/sdk-58 | 2026-10-19 |
| Next.js + React | Next.js 16.4 + React 19.3 | https://nextjs.org/blog/next-16-4 | 2026-10-19 |

## Compatibility finding

Expo’s SDK 58 changelog says SDK 58 is released and includes React Native 0.88; Expo’s SDK 58 package reference recommends Reanimated 4.7.1, and its changelog sets Node.js 22.13 or newer on the 22.x line (or 24.3 or newer on 24.x, or 26+). Those are the Expo-published pairing and tool requirements. I cannot confirm the full requested mobile set as a mutually compatible **stable** set from official sources: React Native’s release overview still labels 0.88.x “Future” despite listing its release date as 2026-10-12, and Nativewind’s current stable 4.2.7 docs explicitly say that its SDK-support addition is for Expo SDK 57, with no SDK 58 compatibility statement. Nativewind 4.2.7 supports Reanimated 3 and 4, but that alone does not verify its compatibility with SDK 58 / React Native 0.88. The React Native and Nativewind gaps are flagged rather than inferred away. The separate web pin is Next.js 16.4 with React 19.3; the Next.js 16.4 release post states it ships with React 19.3.

## Source details and limitations

- Expo’s SDK 58 release post is dated October 15, 2026, identifies SDK 58 as released, and says it includes React Native 0.88. It points specifically to React Native 0.88.0-rc.0 release notes. The official React Native release overview lists 0.88.x as “Future” and its release date as October 12, 2026. This is an official-source status contradiction for a stable React Native pin.
- Expo’s SDK 58 versioned Reanimated reference recommends 4.7.1. The version is sourced from Expo’s own package reference, not a third-party compatibility tracker.
- Nativewind’s docs identify 4.2.7 as stable, say it adds Expo SDK 57 support, and say it supports Reanimated 3 and 4. They do not explicitly state SDK 58 / React Native 0.88 compatibility. Nativewind v5 is labeled a release candidate, so it is not substituted as a stable pin.
- Expo’s SDK 58 changelog sets Node requirements by major line: Node 22.13 or newer on 22.x; 24.3 or newer on 24.x; or Node 26 and later. Odd-numbered 23 and 25 are unsupported. The 22.13.0 entry above records the minimum binding floor on a supported line, not the latest Node.js patch release.
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
