// Rule: merge generated screens into packages/i18n; never replace the screens
// object. Hand-added keys and older generated keys are retained on every run.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

type Pair = { en: string; ar: string };
type ScreenCopy = { route: string; component: string; source: string };
type Dictionary = Record<string, unknown>;

// Generated screen values merge into existing namespaces; hand-added keys and
// older generated keys remain available across extractor runs.
export function mergeScreenDictionaries(
  existing: Dictionary,
  generated: Record<string, Record<string, string>>,
): Dictionary {
  const oldScreens = (existing.screens ?? {}) as Record<
    string,
    Record<string, unknown>
  >;
  const screens = { ...oldScreens };
  for (const [screen, entries] of Object.entries(generated)) {
    screens[screen] = { ...(screens[screen] ?? {}), ...entries };
  }
  return { ...existing, screens };
}

export function mergeDraftKeys(
  existing: unknown,
  generated: string[],
): string[] {
  const previous = Array.isArray(existing)
    ? existing.filter((key): key is string => typeof key === "string")
    : [];
  return [...new Set([...previous, ...generated])].sort();
}

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const screensRoot = resolve(repositoryRoot, "design/screens");
const overridesPath = resolve(repositoryRoot, "design/overrides.md");
const enPath = resolve(repositoryRoot, "packages/i18n/en.json");
const arPath = resolve(repositoryRoot, "packages/i18n/ar.json");
const draftPath = resolve(repositoryRoot, "packages/i18n/draft-keys.json");

function decodeLiteral(value: string): string {
  return value.replace(/\\([\\'"`])/g, "$1").replaceAll("\\n", "\n");
}

export function componentBody(source: string, component: string): string {
  const start = source.search(new RegExp(`\\bfunction\\s+${component}\\s*\\(`));
  if (start < 0) throw new Error(`Kit component ${component} was not found`);
  const rest = source.slice(start);
  const nextFunction = rest
    .slice(1)
    .search(/\bfunction\s+[A-Za-z_$][\w$]*\s*\(/);
  return rest.slice(0, nextFunction < 0 ? rest.length : nextFunction + 1);
}

function extractPairs(source: string): Pair[] {
  const call =
    /\bt\(\s*(?:"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)')\s*,\s*(?:"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)')\s*\)/g;
  const unique = new Map<string, Pair>();
  for (const match of source.matchAll(call)) {
    const pair = {
      en: decodeLiteral(match[1] ?? match[2]),
      ar: decodeLiteral(match[3] ?? match[4]),
    };
    if (pair.en && pair.ar) unique.set(`${pair.en}\u0000${pair.ar}`, pair);
  }
  return [...unique.values()];
}

export function unextractedCalls(source: string): string[] {
  const calls: string[] = [];
  const starts = /\bt\s*\(/g;
  for (const match of source.matchAll(starts)) {
    const opening = source.indexOf("(", match.index);
    let depth = 0;
    let quote = "";
    let escaped = false;
    let end = opening;
    for (; end < source.length; end += 1) {
      const character = source[end];
      if (quote) {
        if (escaped) escaped = false;
        else if (character === "\\") escaped = true;
        else if (character === quote) quote = "";
        continue;
      }
      if (character === "'" || character === '"' || character === "`") {
        quote = character;
        continue;
      }
      if (character === "(") depth += 1;
      if (character === ")" && --depth === 0) break;
    }
    const call = source.slice(match.index, Math.min(end + 1, source.length));
    if (
      !/^t\s*\(\s*(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')\s*,\s*(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')\s*\)$/.test(
        call,
      )
    ) {
      calls.push(call.replace(/\s+/g, " ").slice(0, 180));
    }
  }
  return calls;
}

function quotedValues(value: string): string[] {
  return [...value.matchAll(/"((?:\\.|[^"\\])*)"/g)].map((match) =>
    decodeLiteral(match[1]),
  );
}

function overrideMaps(markdown: string): Map<string, Map<string, string>> {
  const sections = new Map<string, string>();
  const headings = [
    ...markdown.matchAll(
      /^###\s+`([^`]+)`[^\r\n]*|^###\s+(Onboarding copy[^\r\n]*)/gm,
    ),
  ];
  for (const [index, match] of headings.entries()) {
    const start = match.index + match[0].length;
    const next = headings[index + 1]?.index ?? -1;
    const name = match[1] ?? match[2];
    sections.set(
      name.trim(),
      markdown.slice(start, next < 0 ? undefined : next),
    );
  }

  const routeAliases: Record<string, string[]> = {
    "/welcome": ["/welcome"],
    "/sign-in": ["/sign-in"],
    "/otp": ["/otp"],
    "/complete-profile": ["/complete-profile"],
    "/profile/account": ["/profile/account"],
    "Onboarding copy (summary/progress strings, not a single screen)": [
      "/onboarding",
      "/onboarding/summary",
    ],
  };
  const result = new Map<string, Map<string, string>>();
  for (const [sectionName, routes] of Object.entries(routeAliases)) {
    const section = sections.get(sectionName);
    if (!section) continue;
    const replacements = new Map<string, string>();
    for (const line of section.split(/\r?\n/)) {
      if (!line.startsWith("|") || line.includes("---")) continue;
      const cells = line.split("|").map((cell) => cell.trim());
      if (cells.length < 4) continue;
      const before = quotedValues(cells[2]);
      const after = quotedValues(cells[3]);
      if (before.length === 1 && after.length === 0) {
        replacements.set(before[0], "");
      } else if (
        before.length === 1 &&
        after.length === 1 &&
        before[0] !== after[0]
      ) {
        replacements.set(before[0], after[0]);
      }
    }
    for (const route of routes) result.set(route, replacements);
  }
  return result;
}

function overridePairs(markdown: string): Map<string, Pair[]> {
  const routeSections: Record<string, string> = {
    "/welcome": "/welcome",
    "/sign-in": "/sign-in",
    "/otp": "/otp",
    "/complete-profile": "/complete-profile",
    "/profile/account": "/profile/account",
    "Onboarding copy (summary/progress strings, not a single screen)":
      "/onboarding",
  };
  const headings = [
    ...markdown.matchAll(
      /^###\s+`([^`]+)`[^\r\n]*|^###\s+(Onboarding copy[^\r\n]*)/gm,
    ),
  ];
  const result = new Map<string, Pair[]>();
  for (const [index, heading] of headings.entries()) {
    const name = (heading[1] ?? heading[2]).trim();
    const route = routeSections[name];
    if (!route) continue;
    const start = heading.index + heading[0].length;
    const end = headings[index + 1]?.index ?? markdown.length;
    const section = markdown.slice(start, end);
    const english = new Map<string, string[]>();
    const arabic = new Map<string, string[]>();
    for (const line of section.split(/\r?\n/)) {
      if (!line.startsWith("|") || line.includes("---")) continue;
      const cells = line.split("|").map((cell) => cell.trim());
      if (cells.length < 4) continue;
      const label = cells[1];
      const language = /\(EN\)/i.test(label)
        ? english
        : /\(AR(?:,|\))/i.test(label)
          ? arabic
          : undefined;
      if (!language) continue;
      const cleanLabel = label.replace(/\s*\((?:EN|AR)[^)]*\)/i, "").trim();
      const desired = quotedValues(cells[3]);
      if (desired.length !== 1) continue;
      const values = language.get(cleanLabel) ?? [];
      values.push(desired[0]);
      language.set(cleanLabel, values);
    }
    const pairs: Pair[] = [];
    for (const [label, englishValues] of english) {
      const arabicValues = arabic.get(label) ?? [];
      for (const [pairIndex, en] of englishValues.entries()) {
        const ar = arabicValues[pairIndex];
        if (ar) pairs.push({ en, ar });
      }
    }
    result.set(route, pairs);
  }
  return result;
}

function keyPart(value: string): string {
  const words = value
    .normalize("NFKD")
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return (
    words
      .map((word, index) =>
        index === 0
          ? word[0].toLowerCase() + word.slice(1)
          : word[0].toUpperCase() + word.slice(1),
      )
      .join("") || "copy"
  );
}

function screenKey(route: string, component: string): string {
  if (route === "/(tabs)/index") return "home";
  if (route === "/") return "splash";
  const componentSlug = keyPart(component);
  if (componentSlug !== "settings") return componentSlug;
  return route.startsWith("/admin/")
    ? "adminSettings"
    : route.startsWith("/clinic/")
      ? "clinicSettings"
      : "profileSettings";
}

async function readScreen(fileName: string): Promise<ScreenCopy | undefined> {
  const markdown = await readFile(resolve(screensRoot, fileName), "utf8");
  if (!/^- Status: Built$/m.test(markdown)) return undefined;
  const route = /^- Route: `([^`]+)`/m.exec(markdown)?.[1];
  const component = /^- Kit component: `([^`]+)`/m.exec(markdown)?.[1];
  const sourceLink = /^- Kit source file: \[[^\]]+\]\(([^)]+)\)/m.exec(
    markdown,
  )?.[1];
  if (!route || !component || !sourceLink) {
    throw new Error(`Built screen record is missing kit metadata: ${fileName}`);
  }
  const sourcePath = resolve(screensRoot, sourceLink);
  return {
    route,
    component,
    source: await readFile(sourcePath, "utf8"),
  };
}

async function main() {
  const [files, overrides, en, ar] = await Promise.all([
    readdir(screensRoot),
    readFile(overridesPath, "utf8"),
    readFile(enPath, "utf8").then(
      (value) => JSON.parse(value) as Record<string, unknown>,
    ),
    readFile(arPath, "utf8").then(
      (value) => JSON.parse(value) as Record<string, unknown>,
    ),
  ]);
  const replacements = overrideMaps(overrides);
  const additions = overridePairs(overrides);
  const screenRecords = (
    await Promise.all(
      files.filter((file) => file.endsWith(".md")).map(readScreen),
    )
  ).filter((screen): screen is ScreenCopy => screen !== undefined);
  const slugCounts = new Map<string, number>();
  for (const screen of screenRecords) {
    const base = screenKey(screen.route, screen.component);
    slugCounts.set(base, (slugCounts.get(base) ?? 0) + 1);
  }
  const englishScreens: Record<string, Record<string, string>> = {};
  const arabicScreens: Record<string, Record<string, string>> = {};
  const draftKeys: string[] = [];
  const dynamicCalls = new Set<string>();

  for (const screen of screenRecords) {
    const baseSlug = screenKey(screen.route, screen.component);
    const routeSlug = keyPart(
      screen.route
        .replace(/^\/+/, "")
        .replaceAll("/(tabs)/", "")
        .replaceAll("[", "")
        .replaceAll("]", "")
        .replaceAll("/", " "),
    );
    const slug = (slugCounts.get(baseSlug) ?? 0) > 1 ? routeSlug : baseSlug;
    const body = componentBody(screen.source, screen.component);
    for (const call of unextractedCalls(body)) dynamicCalls.add(call);
    const routeAliases =
      screen.route === "/login" ? ["/login", "/mfa"] : [screen.route];
    const routeReplacements = routeAliases.flatMap((route) => [
      ...(replacements.get(route)?.entries() ?? []),
    ]);
    let pairs = extractPairs(body)
      .map((pair) => {
        for (const [before, after] of routeReplacements) {
          pair.en = pair.en.replaceAll(before, after);
          pair.ar = pair.ar.replaceAll(before, after);
        }
        return pair;
      })
      .filter((pair) => pair.en && pair.ar);
    if (screen.route === "/sign-in") {
      pairs = pairs.filter(
        (pair) => !/phone number|sms|text you/i.test(pair.en),
      );
    } else if (screen.route === "/otp") {
      pairs = pairs.filter((pair) => pair.en !== "Verify code");
    } else if (screen.route === "/profile/account") {
      pairs = pairs.map((pair) => {
        if (pair.en === "Phone") {
          return { en: "Phone number (optional)", ar: "رقم الهاتف (اختياري)" };
        }
        if (pair.en === "Link Google") {
          return { en: "Add Google account", ar: "إضافة حساب Google" };
        }
        return pair;
      });
    }
    if (screen.route === "/onboarding") {
      pairs = pairs.filter((pair) => pair.en !== "Phone");
    }
    for (const route of routeAliases)
      pairs.push(...(additions.get(route) ?? []));
    if (!englishScreens[slug]) englishScreens[slug] = {};
    if (!arabicScreens[slug]) arabicScreens[slug] = {};
    const enEntries = englishScreens[slug];
    const arEntries = arabicScreens[slug];
    for (const pair of pairs) {
      const baseKey = keyPart(pair.en);
      let localKey = baseKey;
      let suffix = 2;
      while (
        enEntries[localKey] !== undefined &&
        enEntries[localKey] !== pair.en
      ) {
        localKey = `${baseKey}${suffix++}`;
      }
      const key = `screens.${slug}.${localKey}`;
      enEntries[localKey] = pair.en;
      arEntries[localKey] = pair.ar;
      if (!draftKeys.includes(key)) draftKeys.push(key);
    }
  }

  const existingDraftKeys = await readFile(draftPath, "utf8")
    .then((value) => JSON.parse(value) as unknown)
    .catch(() => []);
  const outputEn = mergeScreenDictionaries(en, englishScreens);
  const outputAr = mergeScreenDictionaries(ar, arabicScreens);
  const mergedDraftKeys = mergeDraftKeys(existingDraftKeys, draftKeys);
  await Promise.all([
    writeFile(enPath, `${JSON.stringify(outputEn, null, 2)}\n`, "utf8"),
    writeFile(arPath, `${JSON.stringify(outputAr, null, 2)}\n`, "utf8"),
    writeFile(
      draftPath,
      `${JSON.stringify(mergedDraftKeys, null, 2)}\n`,
      "utf8",
    ),
  ]);
  process.stdout.write(
    `Extracted ${draftKeys.length} screen translation keys from ${screenRecords.length} Built screens; draft list now has ${mergedDraftKeys.length} keys\n`,
  );
  process.stdout.write(
    `Unextracted dynamic/template t() calls: ${dynamicCalls.size}\n${[...dynamicCalls].map((call) => `- ${call}`).join("\n")}\n`,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  main().catch((error: unknown) => {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  });
}
