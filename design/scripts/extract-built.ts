import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type KitArea = "mobile" | "clinic" | "admin";
type KitFile = { path: string; source: string };
type BuiltScreen = {
  route: string;
  additionalRoutes?: string[];
  title: string;
  phase: number;
  area: KitArea;
  inventory: string;
  sourceGroup?: "mobile-entry";
};

const scriptPath = fileURLToPath(import.meta.url);
const repositoryRoot = resolve(dirname(scriptPath), "../..");
const sourceRoot = resolve(repositoryRoot, "FurEver Design System");
const outputRoot = resolve(repositoryRoot, "design/screens");
const inventoryPath = resolve(sourceRoot, "guidelines/screen-inventory.md");
const overridesPath = resolve(repositoryRoot, "design/overrides.md");
const specPath = resolve(repositoryRoot, "specs/001-furever-platform/spec.md");

const componentNames: Record<string, string> = {
  "/language": "Language",
  "/onboarding": "Onboarding",
  "/welcome": "Welcome",
  "/sign-in": "SignIn",
  "/otp": "Otp",
  "/complete-profile": "CompleteProfile",
  "/permissions": "Permissions",
  "/(tabs)/index": "Home",
  "/(tabs)/pets": "Pets",
  "/pets/new": "AddPet",
  "/pets/[id]": "Passport",
  "/pets/[id]/vaccinations/new": "AddVax",
  "/pets/[id]/passport": "PassportShare",
  "/clinics": "Clinics",
  "/clinics/[id]": "Clinic",
  "/book/service": "BService",
  "/book/doctor": "BDoctor",
  "/book/time": "BTime",
  "/book/details": "BDetails",
  "/book/summary": "BSummary",
  "/book/success": "BSuccess",
  "/(tabs)/bookings": "Bookings",
  "/bookings/[id]": "Booking",
  "/bookings/[id]/review": "Review",
  "/emergency": "Emergency",
  "/notifications": "Notifications",
  "/(tabs)/profile": "Profile",
  "/profile/settings": "Settings",
  "/profile/account": "Account",
  "/login": "Login",
  "/mfa": "Login",
  "/clinic": "Today",
  "/clinic/queue": "Queue",
  "/clinic/appointments": "Appointments",
  "/clinic/services": "Services",
  "/clinic/profile": "Profile",
  "/clinic/staff": "Staff",
  "/admin": "Overview",
  "/admin/users": "Users",
  "/admin/clinics": "Clinics",
  "/admin/reference-data": "RefData",
  "/admin/notifications": "Broadcast",
  "/admin/flags": "Flags",
  "/admin/audit-logs": "Audit",
};

const mobileEntryComponents: Record<string, string> = {
  "/language": "Language",
  "/onboarding": "Slides",
  "/welcome": "Welcome",
  "/sign-in": "Phone",
  "/otp": "Otp",
  "/complete-profile": "Profile",
  "/permissions": "Perms",
};

const overrideSections: Record<string, string> = {
  "/welcome": "/welcome",
  "/sign-in": "/sign-in",
  "/otp": "/otp",
  "/complete-profile": "/complete-profile",
  "/profile/account": "/profile/account",
  "/onboarding": "Onboarding copy",
};

function splitRoutes(cell: string): string[] {
  const pieces = cell.split(/,\s*/).map((piece) => piece.trim());
  if (pieces.length < 2) return pieces;
  const anchor = pieces[0];
  return pieces.map((piece) => {
    if (piece.startsWith("/")) return piece;
    if (anchor.startsWith("/book/")) return `/book/${piece}`;
    return piece;
  });
}

function parseBuiltScreens(markdown: string): BuiltScreen[] {
  const screens: BuiltScreen[] = [];
  let area: KitArea = "mobile";

  for (const line of markdown.split(/\r?\n/)) {
    if (line.startsWith("## Owner mobile")) area = "mobile";
    else if (line.startsWith("## Clinic dashboard")) area = "clinic";
    else if (line.startsWith("## Admin dashboard")) area = "admin";

    const cells = line.split("|").map((cell) => cell.trim());
    if (cells.length < 5 || !/^\d+$/.test(cells[3])) continue;
    const phase = Number(cells[3]);
    const status = cells[4];
    if (phase !== 1 || !/\bBuilt\b/.test(status)) continue;

    const rowRoutes = splitRoutes(cells[1]);
    if (rowRoutes[0] === "/login" && rowRoutes[1] === "/mfa") {
      screens.push({
        route: "/login",
        additionalRoutes: ["/mfa"],
        title: cells[2],
        phase,
        area,
        inventory: line,
      });
      continue;
    }
    for (const route of rowRoutes) {
      if (!route.startsWith("/")) continue;
      screens.push({ route, title: cells[2], phase, area, inventory: line });
    }
  }

  return screens;
}

async function readKit(
  indexPath: string,
): Promise<{ index: string; files: KitFile[] }> {
  const index = await readFile(indexPath, "utf8");
  const indexDirectory = dirname(indexPath);
  const sources = [...index.matchAll(/src="([^"]+\.babel)"/g)].map(
    ([, path]) => path,
  );
  const files = await Promise.all(
    sources.map(async (sourcePath) => {
      const path = resolve(indexDirectory, sourcePath);
      return { path, source: await readFile(path, "utf8") };
    }),
  );
  return { index, files };
}

function findComponentSource(
  files: KitFile[],
  componentName: string,
): KitFile | undefined {
  return files.find((file) =>
    new RegExp(`\\bfunction\\s+${componentName}\\s*\\(`).test(file.source),
  );
}

function componentBody(source: string, componentName: string): string {
  const start = source.search(
    new RegExp(`\\bfunction\\s+${componentName}\\s*\\(`),
  );
  if (start < 0) return "";
  const rest = source.slice(start);
  const nextFunction = rest
    .slice(1)
    .search(/\bfunction\s+[A-Za-z_$][\w$]*\s*\(/);
  const end = nextFunction < 0 ? rest.length : nextFunction + 1;
  return rest.slice(0, end);
}

function extractComponents(body: string): string[] {
  return [
    ...new Set(
      [...body.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)].map(([, name]) => name),
    ),
  ].sort();
}

function extractStates(screen: BuiltScreen, body: string): string[] {
  const haystack = `${screen.inventory}\n${body}`.toLowerCase();
  const states = new Set<string>();
  const patterns: Array<[string, RegExp]> = [
    ["loading", /loading|setld|isloading/],
    ["empty", /empty|emptystate/],
    ["error", /error|seterr|\.error/],
    ["offline", /offline/],
    ["closed day", /closed day|closedday/],
    ["disabled slots", /disabled slots|disabledslots/],
    ["dialog", /dialog|modal/],
    ["restricted", /restricted|restricted state/],
  ];
  for (const [name, pattern] of patterns)
    if (pattern.test(haystack)) states.add(name);

  if (
    ["/(tabs)/pets", "/clinics", "/(tabs)/bookings", "/notifications"].includes(
      screen.route,
    )
  ) {
    states.add("loading");
    states.add("empty");
    states.add("error");
  }

  return [...states].sort();
}

function screenFileName(route: string): string {
  if (route === "/") return "root.md";
  const routeId = route
    .replace(/^\/+/, "")
    .replaceAll("/(tabs)/", "tabs-")
    .replaceAll("/", "-")
    .replace(/[[\]()]/g, "")
    .replace(/[^A-Za-z0-9._-]+/g, "-");
  return `${routeId}.md`;
}

function overrideLabel(route: string): string | undefined {
  return overrideSections[route];
}

function renderScreen(
  screen: BuiltScreen,
  kitIndexPath: string,
  sourceFile: KitFile,
  override: string | undefined,
): string {
  const component =
    screen.sourceGroup === "mobile-entry"
      ? screen.route === "/onboarding/summary"
        ? "Summary"
        : mobileEntryComponents[screen.route]
      : componentNames[screen.route];
  const body = componentBody(sourceFile.source, component);
  const components = extractComponents(body);
  const states = extractStates(screen, body);
  const sourceRelative = relative(repositoryRoot, sourceFile.path).replaceAll(
    "\\",
    "/",
  );
  const indexRelative = relative(repositoryRoot, kitIndexPath).replaceAll(
    "\\",
    "/",
  );
  const stateList = states.length
    ? states.map((state) => `\`${state}\``).join(", ")
    : "Not explicitly identified";
  const componentList = components.length
    ? components.map((name) => `\`${name}\``).join(", ")
    : "None identified";
  const additionalRoutes = screen.additionalRoutes?.length
    ? `\n- Additional routes: ${screen.additionalRoutes.map((route) => `\`${route}\``).join(", ")}`
    : "";
  const overrideNote = override
    ? `\n## Copy override\n\nUse the \`${override}\` section in [design/overrides.md](../overrides.md) in place of conflicting kit copy.\n`
    : "";

  return `# Screen: ${screen.route}\n\n- Screen ID: \`${screen.route}\`\n- Route: \`${screen.route}\`${additionalRoutes}\n- Delivery phase: ${screen.phase}\n- Status: Built\n- Kit source file: [${basename(sourceFile.path)}](../../${sourceRelative})\n- Kit entry file: [${basename(kitIndexPath)}](../../${indexRelative})\n- Kit component: \`${component}\`\n- States present: ${stateList}\n- Components used: ${componentList}\n${overrideNote}`;
}

async function main() {
  const inventory = await readFile(inventoryPath, "utf8");
  const overrides = await readFile(overridesPath, "utf8");
  const spec = await readFile(specPath, "utf8");
  if (
    !overrides.includes("## Screen-by-screen overrides") ||
    !spec.includes("## Screen Coverage")
  ) {
    throw new Error(
      "Required override or Phase 1 screen coverage section is missing",
    );
  }

  const mobileIndexPath = resolve(sourceRoot, "ui_kits/mobile/index.html");
  const mobileEntryIndexPath = resolve(
    sourceRoot,
    "ui_kits/mobile-entry/index.html",
  );
  const dashboardIndexPath = resolve(
    sourceRoot,
    "ui_kits/dashboard/index.html",
  );
  const [mobileKit, mobileEntryKit, dashboardKit] = await Promise.all([
    readKit(mobileIndexPath),
    readKit(mobileEntryIndexPath),
    readKit(dashboardIndexPath),
  ]);
  const screens = parseBuiltScreens(inventory);
  for (const screen of screens) {
    if (mobileEntryComponents[screen.route]) {
      screen.sourceGroup = "mobile-entry";
    }
  }
  const coverageStart = spec.indexOf("## Screen Coverage");
  const coverageEnd = spec.indexOf("## Success Criteria", coverageStart);
  const summaryRow = spec
    .slice(coverageStart, coverageEnd)
    .split(/\r?\n/)
    .find(
      (line) =>
        line.includes("`/onboarding/summary`") && line.includes("| Built |"),
    );
  if (
    summaryRow &&
    !screens.some((screen) => screen.route === "/onboarding/summary")
  ) {
    screens.push({
      route: "/onboarding/summary",
      title: "Setup Summary",
      phase: 1,
      area: "mobile",
      inventory: summaryRow,
      sourceGroup: "mobile-entry",
    });
  }
  await mkdir(outputRoot, { recursive: true });

  for (const screen of screens) {
    const kit =
      screen.sourceGroup === "mobile-entry"
        ? mobileEntryKit
        : screen.area === "mobile"
          ? mobileKit
          : dashboardKit;
    const component =
      screen.sourceGroup === "mobile-entry"
        ? screen.route === "/onboarding/summary"
          ? "Summary"
          : mobileEntryComponents[screen.route]
        : componentNames[screen.route];
    if (!component)
      throw new Error(
        `No kit component mapping found for Built screen ${screen.route}`,
      );
    const sourceFile = findComponentSource(kit.files, component);
    if (!sourceFile)
      throw new Error(
        `No kit source function ${component} found for ${screen.route}`,
      );
    const output = resolve(outputRoot, screenFileName(screen.route));
    const kitIndexPath =
      screen.sourceGroup === "mobile-entry"
        ? mobileEntryIndexPath
        : screen.area === "mobile"
          ? mobileIndexPath
          : dashboardIndexPath;
    await writeFile(
      output,
      renderScreen(
        screen,
        kitIndexPath,
        sourceFile,
        overrideLabel(screen.route),
      ),
      "utf8",
    );
  }

  process.stdout.write(
    `Extracted ${screens.length} Phase 1 Built screens to ${relative(repositoryRoot, outputRoot)}\n`,
  );
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
