import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export type ThemeName = "light" | "dark";
export type TokenTheme = Record<string, string>;

type SourceTokens = {
  light: Map<string, string>;
  dark: Map<string, string>;
  componentMixes: Array<{ name: string; expression: string }>;
};

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "../../..");
const tokenDirectory = resolve(repositoryRoot, "design/system/tokens");
const colorSpaceName = "oklab";

function parseDeclarations(body: string): Array<[string, string]> {
  return body
    .split(";")
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .flatMap((declaration) => {
      const separator = declaration.indexOf(":");
      if (separator < 0) return [];
      const name = declaration.slice(0, separator).trim();
      if (!name.startsWith("--")) return [];
      return [
        [name, declaration.slice(separator + 1).trim()] as [string, string],
      ];
    });
}

function cssRules(css: string): Array<{ selector: string; body: string }> {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(
    ([, selector, body]) => ({
      selector: selector.trim(),
      body,
    }),
  );
}

function extractFunctions(source: string, functionName: string): string[] {
  const expressions: string[] = [];
  const prefix = `${functionName}(`;
  let searchAt = 0;

  while (searchAt < source.length) {
    const start = source.indexOf(prefix, searchAt);
    if (start < 0) break;
    let depth = 1;
    let end = start + prefix.length;
    while (end < source.length && depth > 0) {
      if (source[end] === "(") depth += 1;
      if (source[end] === ")") depth -= 1;
      end += 1;
    }
    if (depth !== 0)
      throw new Error(`Unclosed ${functionName}() expression in token CSS`);
    expressions.push(source.slice(start, end));
    searchAt = end;
  }

  return expressions;
}

function collectSourceTokens(
  files: Array<{ name: string; css: string }>,
): SourceTokens {
  const light = new Map<string, string>();
  const dark = new Map<string, string>();
  const componentMixes: SourceTokens["componentMixes"] = [];

  for (const file of files) {
    for (const { selector, body } of cssRules(file.css)) {
      const declarations = parseDeclarations(body);
      if (selector.split(",").some((part) => part.trim() === ":root")) {
        for (const [name, value] of declarations) light.set(name, value);
      }
      if (selector.includes('[data-theme="dark"]')) {
        for (const [name, value] of declarations) dark.set(name, value);
      }

      if (file.name === "components.css" && selector.includes(".fe-skel")) {
        for (const expression of extractFunctions(body, "color-mix")) {
          const index =
            componentMixes.filter((mix) =>
              mix.name.startsWith("--fe-skel-mix-"),
            ).length + 1;
          componentMixes.push({ name: `--fe-skel-mix-${index}`, expression });
        }
      }
      if (file.name === "components.css" && selector.includes(".fe-ph")) {
        for (const expression of extractFunctions(body, "color-mix")) {
          const index =
            componentMixes.filter((mix) => mix.name.startsWith("--fe-ph-mix-"))
              .length + 1;
          componentMixes.push({ name: `--fe-ph-mix-${index}`, expression });
        }
      }
    }
  }

  return { light, dark, componentMixes };
}

function splitTopLevel(value: string): string[] {
  const pieces: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === "(") depth += 1;
    if (value[index] === ")") depth -= 1;
    if (value[index] === "," && depth === 0) {
      pieces.push(value.slice(start, index).trim());
      start = index + 1;
    }
  }
  pieces.push(value.slice(start).trim());
  return pieces;
}

function hexToLinearRgb(color: string): [number, number, number] {
  const match = /^#([\da-f]{6})$/i.exec(color);
  if (!match)
    throw new Error(
      `Expected an opaque six-digit hex color, received ${color}`,
    );
  const channels = [0, 2, 4].map(
    (offset) => Number.parseInt(match[1].slice(offset, offset + 2), 16) / 255,
  );
  return channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  ) as [number, number, number];
}

function linearRgbToHex([red, green, blue]: [number, number, number]): string {
  const encoded = [red, green, blue].map((channel) => {
    const clipped = Math.min(1, Math.max(0, channel));
    return clipped <= 0.0031308
      ? 12.92 * clipped
      : 1.055 * clipped ** (1 / 2.4) - 0.055;
  });
  return `#${encoded
    .map((channel) =>
      Math.round(channel * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")
    .toUpperCase()}`;
}

function linearRgbToOklab([red, green, blue]: [number, number, number]): [
  number,
  number,
  number,
] {
  const l = Math.cbrt(
    0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue,
  );
  const m = Math.cbrt(
    0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue,
  );
  const s = Math.cbrt(
    0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue,
  );
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function oklabToLinearRgb([lightness, axisA, axisB]: [
  number,
  number,
  number,
]): [number, number, number] {
  const lRoot = lightness + 0.3963377774 * axisA + 0.2158037573 * axisB;
  const mRoot = lightness - 0.1055613458 * axisA - 0.0638541728 * axisB;
  const sRoot = lightness - 0.0894841775 * axisA - 1.291485548 * axisB;
  const l = lRoot ** 3;
  const m = mRoot ** 3;
  const s = sRoot ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

export function mixOklabColors(
  first: string,
  second: string,
  firstPercent: number,
): string {
  const firstLab = linearRgbToOklab(hexToLinearRgb(first));
  const secondLab = linearRgbToOklab(hexToLinearRgb(second));
  const firstWeight = firstPercent / 100;
  const mixedLab = firstLab.map(
    (channel, index) =>
      channel * firstWeight + secondLab[index] * (1 - firstWeight),
  ) as [number, number, number];
  return linearRgbToHex(oklabToLinearRgb(mixedLab));
}

function parseMixExpression(
  expression: string,
  resolveColor: (source: string) => string,
): string {
  const inner = expression.slice(expression.indexOf("(") + 1, -1);
  const [colorSpace, first, second] = splitTopLevel(inner);
  if (colorSpace !== `in ${colorSpaceName}` || !first || !second) {
    throw new Error(`Unsupported color-mix expression: ${expression}`);
  }

  const firstMatch = /^(.*?)\s+(\d+(?:\.\d+)?)%$/.exec(first);
  if (!firstMatch)
    throw new Error(`Expected a percentage on the first color: ${expression}`);
  const secondMatch = /^(.*?)\s+(\d+(?:\.\d+)?)%$/.exec(second);
  const firstColor = resolveColor(firstMatch[1].trim());
  const secondColor = resolveColor((secondMatch?.[1] ?? second).trim());
  const firstPercent = Number(firstMatch[2]);
  const secondPercent = secondMatch
    ? Number(secondMatch[2])
    : 100 - firstPercent;
  const total = firstPercent + secondPercent;
  if (total <= 0)
    throw new Error(`Invalid color-mix percentage total: ${expression}`);
  return mixOklabColors(firstColor, secondColor, (firstPercent / total) * 100);
}

function resolveVariableValue(
  value: string,
  source: Map<string, string>,
  resolved: Map<string, string>,
  visiting: Set<string>,
): string {
  if (value.startsWith("color-mix(")) {
    return parseMixExpression(value, (color) =>
      resolveVariableValue(color, source, resolved, visiting),
    );
  }

  return value.replace(/var\((--[\w-]+)\)/g, (_match, variable: string) => {
    const cached = resolved.get(variable);
    if (cached) return cached;
    const raw = source.get(variable);
    if (!raw)
      throw new Error(`Token references undefined variable ${variable}`);
    if (visiting.has(variable))
      throw new Error(`Circular token variable reference: ${variable}`);
    visiting.add(variable);
    const resolvedValue = resolveVariableValue(raw, source, resolved, visiting);
    visiting.delete(variable);
    resolved.set(variable, resolvedValue);
    return resolvedValue;
  });
}

function resolveTheme(source: SourceTokens, theme: ThemeName): TokenTheme {
  const values = new Map(source.light);
  if (theme === "dark")
    for (const [name, value] of source.dark) values.set(name, value);
  const resolved = new Map<string, string>();
  const result: TokenTheme = {};
  for (const [name, value] of values) {
    result[name] = resolveVariableValue(
      value,
      values,
      resolved,
      new Set([name]),
    );
  }
  for (const { name, expression } of source.componentMixes) {
    result[name] = parseMixExpression(expression, (color) =>
      resolveVariableValue(color, values, resolved, new Set()),
    );
  }
  return result;
}

export async function readTokenThemes(
  directory = tokenDirectory,
): Promise<Record<ThemeName, TokenTheme>> {
  const files = (await readdir(directory))
    .filter((name) => name.endsWith(".css"))
    .sort()
    .map(async (name) => ({
      name,
      css: await readFile(resolve(directory, name), "utf8"),
    }));
  const source = collectSourceTokens(await Promise.all(files));
  return {
    light: resolveTheme(source, "light"),
    dark: resolveTheme(source, "dark"),
  };
}

export function precomputedMixes(
  themes: Record<ThemeName, TokenTheme>,
): Record<ThemeName, TokenTheme> {
  const mixNames = [
    "--success-bg",
    "--warning-bg",
    "--danger-bg",
    "--info-bg",
    "--primary-bg",
    ...Object.keys(themes.light).filter(
      (name) =>
        name.startsWith("--fe-skel-mix-") || name.startsWith("--fe-ph-mix-"),
    ),
  ];
  return {
    light: Object.fromEntries(
      mixNames.map((name) => [name, themes.light[name]]),
    ),
    dark: Object.fromEntries(mixNames.map((name) => [name, themes.dark[name]])),
  };
}
