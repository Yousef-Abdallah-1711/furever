import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type ScreenArea = "owner" | "clinic" | "admin";
type PlanPhase = { phase: string; screenNames: string[]; index: number };
type ScreenRecord = {
  id: string;
  route: string;
  area: ScreenArea;
  planName: string;
  phase: string;
  phaseIndex: number;
  source: string;
};

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const screenDirectory = resolve(repositoryRoot, "design/screens");
const planPath = resolve(repositoryRoot, "specs/001-furever-platform/plan.md");
const outputPath = resolve(repositoryRoot, "design/screen-map.md");

const planNames: Record<string, string> = {
  "/": "Splash",
  "/language": "Language",
  "/onboarding": "Onboarding",
  "/welcome": "Welcome",
  "/sign-in": "Sign-in",
  "/otp": "Verify code",
  "/complete-profile": "Complete profile",
  "/onboarding/summary": "Setup Summary",
  "/permissions": "Permissions primer",
  "/(tabs)/index": "Home",
  "/(tabs)/pets": "My pets",
  "/pets/new": "Add pet",
  "/pets/[id]": "Pet passport",
  "/pets/[id]/edit": "Edit pet",
  "/pets/[id]/vaccinations/new": "Add vaccination",
  "/pets/[id]/records/new": "Add record",
  "/pets/[id]/passport": "Passport share",
  "/documents/[path]": "Document viewer",
  "/clinics": "Clinics",
  "/clinics/[id]": "Clinic detail",
  "/clinics/[id]/doctors/[id]": "Doctor",
  "/book/service": "Book service/doctor/time/details/summary",
  "/book/doctor": "Book service/doctor/time/details/summary",
  "/book/time": "Book service/doctor/time/details/summary",
  "/book/details": "Book service/doctor/time/details/summary",
  "/book/summary": "Book service/doctor/time/details/summary",
  "/book/success": "Confirmation",
  "/(tabs)/bookings": "My bookings",
  "/bookings/[id]": "Booking detail",
  "/bookings/[id]/review": "Rate visit",
  "/emergency": "Emergency",
  "/notifications": "Inbox",
  "/(tabs)/profile": "Profile",
  "/profile/settings": "Settings",
  "/profile/account": "Account",
  "/profile/edit": "Edit profile",
  "/profile/help": "Help",
  "/profile/about": "About",
  "/legal/terms": "Legal (terms/privacy)",
  "/force-update": "Force-update",
  "/maintenance": "Maintenance",
  "/login": "Sign in",
  "/mfa": "Sign in",
  "/clinic": "Today",
  "/clinic/queue": "Live queue board",
  "/clinic/appointments": "Appointments",
  "/clinic/services": "Services",
  "/clinic/profile": "Clinic profile",
  "/clinic/staff": "Staff",
  "/clinic/patients": "Patients + detail",
  "/clinic/doctors": "Doctors + schedule editor",
  "/clinic/reviews": "Reviews",
  "/clinic/reports": "Reports",
  "/clinic/settings": "Settings",
  "/admin": "Overview",
  "/admin/users": "Users",
  "/admin/clinics": "Clinics",
  "/admin/reference-data": "Reference data",
  "/admin/notifications": "Broadcast",
  "/admin/flags": "Flags",
  "/admin/audit-logs": "Audit log",
  "/admin/users/[id]": "User detail",
  "/admin/pets": "Pets (support view)",
  "/admin/clinics/[id]": "Clinic detail + creation wizard",
  "/admin/appointments": "Appointments (admin view)",
  "/admin/reviews": "Reviews moderation",
  "/admin/team": "Admin team",
  "/admin/settings": "Settings",
  "/accept-invite": "/accept-invite",
  "/forgot-password": "/forgot-password",
  "/no-access": "/no-access",
};

function splitCommaList(source: string): string[] {
  const values: string[] = [];
  let depth = 0;
  let inCode = false;
  let start = 0;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === "`") inCode = !inCode;
    if (!inCode && character === "(") depth += 1;
    if (!inCode && character === ")") depth -= 1;
    if (!inCode && depth === 0 && character === ",") {
      values.push(source.slice(start, index).trim());
      start = index + 1;
    }
  }
  values.push(source.slice(start).trim());
  return values.filter(Boolean);
}

function normalizeScreenName(value: string): string {
  return value
    .replaceAll("**", "")
    .replaceAll("`", "")
    .replace(/\s+\([^)]*\/login[^)]*\)/, "")
    .trim();
}

function parsePlanPhases(markdown: string): Record<ScreenArea, PlanPhase[]> {
  const start = markdown.indexOf(
    "### Screens (",
    markdown.indexOf("## Coverage Table"),
  );
  if (start < 0) throw new Error("Coverage Table screen section is missing");
  const coverage = markdown.slice(start);
  const phases: Record<ScreenArea, PlanPhase[]> = {
    owner: [],
    clinic: [],
    admin: [],
  };
  let area: ScreenArea | undefined;
  let index = 0;

  for (const line of coverage.split(/\r?\n/)) {
    if (line.startsWith("**Owner mobile")) area = "owner";
    else if (line.startsWith("**Clinic dashboard")) area = "clinic";
    else if (line.startsWith("**Admin dashboard")) area = "admin";
    const match = /^\|\s*(D\d\d)\s*\|\s*(.*?)\s*\|$/.exec(line);
    if (!area || !match) continue;
    const [, phase, screens] = match;
    phases[area].push({
      phase,
      screenNames: splitCommaList(screens).map(normalizeScreenName),
      index: index++,
    });
  }

  for (const areaName of ["owner", "clinic", "admin"] as const) {
    if (phases[areaName].length === 0) {
      throw new Error(
        `No Coverage Table delivery phases found for ${areaName}`,
      );
    }
  }
  return phases;
}

function areaForRoute(route: string): ScreenArea {
  if (
    route.startsWith("/admin/") ||
    ["/admin", "/accept-invite", "/forgot-password", "/no-access"].includes(
      route,
    )
  ) {
    return "admin";
  }
  if (
    route === "/login" ||
    route === "/mfa" ||
    route === "/clinic" ||
    route.startsWith("/clinic/")
  ) {
    return "clinic";
  }
  return "owner";
}

function valueFromLine(source: string, pattern: RegExp): string | undefined {
  return pattern.exec(source)?.[1]?.trim();
}

function additionalRoutesFromDocument(source: string): string[] {
  const value = valueFromLine(source, /^- Additional routes:\s*(.+)$/m);
  return value
    ? [...value.matchAll(/`([^`]+)`/g)].map(([, route]) => route)
    : [];
}

async function screenRecord(
  fileName: string,
  phases: Record<ScreenArea, PlanPhase[]>,
): Promise<ScreenRecord> {
  const path = resolve(screenDirectory, fileName);
  const source = await readFile(path, "utf8");
  const route = valueFromLine(source, /^- Route:\s*`([^`]+)`/m);
  const id = valueFromLine(source, /^- Screen ID:\s*`([^`]+)`/m);
  if (!route || !id)
    throw new Error(`Missing screen ID or route in ${fileName}`);

  const area = areaForRoute(route);
  const planName = planNames[route];
  if (!planName)
    throw new Error(`No Coverage Table screen name mapping for ${route}`);
  const delivery = phases[area].find((phase) =>
    phase.screenNames.includes(planName),
  );
  if (!delivery) {
    throw new Error(
      `Coverage Table has no delivery phase for ${area} screen ${planName} (${route})`,
    );
  }

  const sourceFile = /^- Kit source file: \[([^\]]+)\]\(([^)]+)\)/m.exec(
    source,
  );
  const pattern = /^- Pattern: \[`([^`]+)`\]\(([^)]+)\)/m.exec(source);
  const sourceLink = sourceFile
    ? `[${sourceFile[1]}](${relative(
        dirname(outputPath),
        resolve(screenDirectory, sourceFile[2]),
      ).replaceAll("\\", "/")})`
    : pattern
      ? `[\`${pattern[1]}\`](${relative(
          dirname(outputPath),
          resolve(screenDirectory, pattern[2]),
        ).replaceAll("\\", "/")})`
      : "";
  const sourceDescription = sourceFile
    ? `Kit: ${sourceLink}`
    : pattern
      ? `Pattern: ${sourceLink}`
      : "";
  if (!sourceDescription)
    throw new Error(`Missing kit source or pattern for ${route}`);

  const routeAliases = [route, ...additionalRoutesFromDocument(source)].join(
    ", ",
  );
  return {
    id,
    route: routeAliases,
    area,
    planName,
    phase: delivery.phase,
    phaseIndex: delivery.index,
    source: sourceDescription,
  };
}

async function main() {
  const [plan, files] = await Promise.all([
    readFile(planPath, "utf8"),
    readdir(screenDirectory),
  ]);
  const phases = parsePlanPhases(plan);
  const screens = await Promise.all(
    files
      .filter((file) => file.endsWith(".md"))
      .map((file) => screenRecord(file, phases)),
  );
  screens.sort((first, second) => {
    const areaOrder: Record<ScreenArea, number> = {
      owner: 0,
      clinic: 1,
      admin: 2,
    };
    return (
      areaOrder[first.area] - areaOrder[second.area] ||
      first.phaseIndex - second.phaseIndex ||
      first.planName.localeCompare(second.planName) ||
      first.id.localeCompare(second.id)
    );
  });

  const rows = screens.map(
    (screen) =>
      `| \`${screen.id}\` | ${screen.route
        .split(", ")
        .map((route) => `\`${route}\``)
        .join(", ")} | ${screen.source} | ${screen.phase} |`,
  );
  const document = [
    "# Phase 1 Screen Map",
    "",
    "Built-screen kit sources and Spec-screen patterns are linked from each screen record. Delivery phases are read from `specs/001-furever-platform/plan.md`'s Coverage Table.",
    "",
    "| Screen ID | Route | Kit source or pattern | Delivery phase |",
    "| --- | --- | --- | --- |",
    ...rows,
    "",
  ].join("\n");
  await writeFile(outputPath, document, "utf8");
  process.stdout.write(
    `Mapped ${screens.length} Phase 1 screens from the plan Coverage Table\n`,
  );
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
