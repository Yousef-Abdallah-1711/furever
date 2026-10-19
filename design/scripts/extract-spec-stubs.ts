import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type ScreenArea = "owner" | "clinic" | "admin";
type SpecScreen = {
  route: string;
  additionalRoutes: string[];
  title: string;
  area: ScreenArea;
};

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const specPath = resolve(repositoryRoot, "specs/001-furever-platform/spec.md");
const outputRoot = resolve(repositoryRoot, "design/screens");

const missingRouteIds: Record<string, Partial<Record<ScreenArea, string>>> = {
  "User detail": { admin: "/admin/users/[id]" },
  "Pets (read-only support view)": { admin: "/admin/pets" },
  "Clinic detail and creation wizard": { admin: "/admin/clinics/[id]" },
  "Appointments (admin view)": { admin: "/admin/appointments" },
  "Reviews moderation": { admin: "/admin/reviews" },
  "Admin team": { admin: "/admin/team" },
  Settings: { admin: "/admin/settings", clinic: "/clinic/settings" },
};

const patterns: Record<string, string> = {
  "/": "/welcome",
  "/pets/[id]/edit": "/pets/new",
  "/pets/[id]/records/new": "/pets/[id]/vaccinations/new",
  "/documents/[path]": "/pets/[id]/passport",
  "/clinics/[id]/doctors/[id]": "/clinics/[id]",
  "/profile/edit": "/(tabs)/profile",
  "/profile/help": "/(tabs)/profile",
  "/profile/about": "/(tabs)/profile",
  "/legal/terms": "/(tabs)/profile",
  "/legal/privacy": "/(tabs)/profile",
  "/force-update": "/welcome",
  "/maintenance": "/welcome",
  "/clinic/patients": "/clinic/appointments",
  "/clinic/patients/[id]": "/clinic/appointments",
  "/clinic/doctors": "/clinic/services",
  "/clinic/reviews": "/clinic/appointments",
  "/clinic/reports": "/admin",
  "/clinic/settings": "/clinic/profile",
  "/admin/users/[id]": "/admin/users",
  "/admin/pets": "/admin/users",
  "/admin/clinics/[id]": "/admin/clinics",
  "/admin/appointments": "/admin/users",
  "/admin/reviews": "/admin/audit-logs",
  "/admin/team": "/admin/users",
  "/admin/settings": "/admin/flags",
  "/accept-invite": "/login",
  "/forgot-password": "/login",
  "/no-access": "/login",
};

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

function routeIds(
  screenCell: string,
  title: string,
  area: ScreenArea,
): { route: string; additionalRoutes: string[] } {
  const routes = [...screenCell.matchAll(/`(\/[^`]*)`/g)].map(
    ([, route]) => route,
  );
  if (
    area === "clinic" &&
    screenCell.includes("/clinic/patients") &&
    /patient detail/i.test(title)
  ) {
    routes.push("/clinic/patients/[id]");
  }
  if (routes.length > 0) {
    const uniqueRoutes = [...new Set(routes)];
    return { route: uniqueRoutes[0], additionalRoutes: uniqueRoutes.slice(1) };
  }
  const canonicalTitle = screenCell.replaceAll("`", "").trim();
  const route = missingRouteIds[canonicalTitle]?.[area];
  if (!route)
    throw new Error(
      `No route ID is defined for Spec screen ${canonicalTitle} (${area})`,
    );
  return { route, additionalRoutes: [] };
}

function parseSpecScreens(markdown: string): SpecScreen[] {
  const coverageStart = markdown.indexOf("## Screen Coverage");
  const coverageEnd = markdown.indexOf("## Success Criteria", coverageStart);
  if (coverageStart < 0 || coverageEnd < 0)
    throw new Error("Screen Coverage section is missing");

  const coverage = markdown.slice(coverageStart, coverageEnd);
  const screens: SpecScreen[] = [];
  let area: ScreenArea = "owner";

  for (const line of coverage.split(/\r?\n/)) {
    if (line.startsWith("### Owner mobile")) area = "owner";
    else if (line.startsWith("### Clinic dashboard")) area = "clinic";
    else if (line.startsWith("### Admin dashboard")) area = "admin";

    const cells = line.split("|").map((cell) => cell.trim());
    if (cells.length < 5 || cells[2] !== "1" || cells[3] !== "Spec") continue;

    const routeGroup = routeIds(cells[1], cells[1], area);
    screens.push({
      ...routeGroup,
      title: cells[1].replaceAll("`", ""),
      area,
    });
  }

  return screens;
}

async function main() {
  const spec = await readFile(specPath, "utf8");
  const screens = parseSpecScreens(spec);
  await mkdir(outputRoot, { recursive: true });

  for (const screen of screens) {
    const pattern = patterns[screen.route];
    if (!pattern)
      throw new Error(`No Built-screen pattern is defined for ${screen.route}`);
    const patternFile = resolve(outputRoot, screenFileName(pattern));
    const output = resolve(outputRoot, screenFileName(screen.route));
    const patternContent = await readFile(patternFile, "utf8");
    if (!patternContent.includes(`- Status: Built`)) {
      throw new Error(`Pattern ${pattern} does not point to a Built screen`);
    }
    const patternLink = relative(outputRoot, patternFile).replaceAll("\\", "/");
    const additionalRoutes = screen.additionalRoutes.length
      ? `\n- Additional routes: ${screen.additionalRoutes.map((route) => `\`${route}\``).join(", ")}`
      : "";
    const document = `# Screen: ${screen.route}\n\n- Screen ID: \`${screen.route}\`\n- Route: \`${screen.route}\`${additionalRoutes}\n- Delivery phase: 1\n- Status: spec\n- Pattern: [\`${pattern}\`](${patternLink})\n- Source: \`spec.md\` Screen Coverage, Phase 1 (${screen.area})\n- Screen description: ${screen.title}\n`;
    await writeFile(output, document, "utf8");
  }

  process.stdout.write(
    `Generated ${screens.length} Phase 1 Spec screen stubs in ${relative(repositoryRoot, outputRoot)}\n`,
  );
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
