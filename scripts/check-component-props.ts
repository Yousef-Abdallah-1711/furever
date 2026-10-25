/**
 * Checks that the mobile and web component prop interfaces match the
 * authoritative design-system declarations. The mobile `style` prop may use
 * its platform-specific StyleProp<ViewStyle> type; all other props must match.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, join, relative, resolve } from 'node:path';
import * as ts from 'typescript';

interface PropInfo {
  type: string;
  optional: boolean;
}

const root = resolve(process.cwd());
// TypeScript 7's root package entry point in this workspace only exposes
// version metadata. The mobile workspace still provides the compiler API.
const compiler = createRequire(join(root, 'mobile/package.json'))('typescript');
void ts.version;
const contractDirectories = [
  join(root, 'design/system/components/core'),
  join(root, 'design/system/components/domain'),
];
const platforms = ['mobile', 'web'] as const;
const violations: string[] = [];

function normalizeType(type: any, sourceFile: any): string {
  if (!type) return 'any';
  return type.getText(sourceFile)
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s+/g, '')
    .replace(/\bReact\./g, '');
}

function findPropsInterface(sourceFile: any, interfaceName: string): any | undefined {
  return sourceFile.statements.find((statement: any) =>
    compiler.isInterfaceDeclaration(statement)
    && statement.name.text === interfaceName
    && statement.modifiers?.some((modifier: any) => modifier.kind === compiler.SyntaxKind.ExportKeyword) === true,
  );
}

function extractProps(declaration: any, sourceFile: any): Map<string, PropInfo> {
  const props = new Map<string, PropInfo>();
  for (const member of declaration.members) {
    if (!compiler.isPropertySignature(member) || !member.name) continue;
    const propName = compiler.isComputedPropertyName(member.name)
      ? member.name.getText(sourceFile)
      : member.name.getText(sourceFile).replace(/^(?:'|")|(?:'|")$/g, '');
    props.set(propName, {
      type: normalizeType(member.type, sourceFile),
      optional: member.questionToken !== undefined,
    });
  }
  return props;
}

function parseProps(filePath: string, componentName: string, description: string): Map<string, PropInfo> | undefined {
  const sourceText = readFileSync(filePath, 'utf8');
  const sourceFile = compiler.createSourceFile(filePath, sourceText, compiler.ScriptTarget.Latest, true, compiler.ScriptKind.TSX);
  const interfaceName = `${componentName}Props`;
  const declaration = findPropsInterface(sourceFile, interfaceName);
  if (!declaration) {
    const sourceKind = filePath.endsWith('.d.ts') ? 'the .d.ts' : 'the port';
    violations.push(`${description}: no ${interfaceName} interface found in ${sourceKind}`);
    return undefined;
  }
  return extractProps(declaration, sourceFile);
}

function compareProps(
  contractPath: string,
  contractProps: Map<string, PropInfo>,
  portPath: string,
  portProps: Map<string, PropInfo>,
  platform: typeof platforms[number],
): void {
  const label = `${relative(root, contractPath)} vs ${relative(root, portPath)}`;

  for (const [propName, expected] of contractProps) {
    const actual = portProps.get(propName);
    if (!actual) {
      violations.push(`${label}: missing prop "${propName}" from port`);
      continue;
    }
    if (expected.optional !== actual.optional) {
      violations.push(`${label}: prop "${propName}" optionality mismatch: expected ${expected.optional ? 'optional' : 'required'}, got ${actual.optional ? 'optional' : 'required'}`);
    }
    // The mobile implementation intentionally uses StyleProp<ViewStyle> where
    // the shared contract uses React.CSSProperties. See implementation-log.md.
    if (!(platform === 'mobile' && propName === 'style') && expected.type !== actual.type) {
      violations.push(`${label}: prop "${propName}" type mismatch: expected "${expected.type}", got "${actual.type}"`);
    }
  }

  for (const propName of portProps.keys()) {
    if (!contractProps.has(propName) && propName !== 'style') {
      violations.push(`${label}: unexpected prop "${propName}" in port`);
    }
  }
}

const contractFiles = contractDirectories.flatMap((directory) =>
  readdirSync(directory)
    .filter((fileName) => fileName.endsWith('.d.ts'))
    .map((fileName) => join(directory, fileName)),
).sort();

for (const contractPath of contractFiles) {
  const componentName = basename(contractPath, '.d.ts');
  const contractProps = parseProps(contractPath, componentName, relative(root, contractPath));
  if (!contractProps) continue;

  for (const platform of platforms) {
    const portPath = join(root, platform, 'src/components', `${componentName}.tsx`);
    if (!existsSync(portPath)) {
      violations.push(`${relative(root, contractPath)}: missing port for ${componentName} on ${platform}`);
      continue;
    }
    const portProps = parseProps(portPath, componentName, relative(root, portPath));
    if (portProps) compareProps(contractPath, contractProps, portPath, portProps, platform);
  }
}

if (violations.length) {
  process.stdout.write(`${violations.join('\n')}\n${violations.length} prop-drift violation(s)\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`0 prop-drift violations across ${contractFiles.length} components (${contractFiles.length * platforms.length} port files checked)\n`);
}
