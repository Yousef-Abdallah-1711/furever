import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

const mailpitUrl = "http://127.0.0.1:54324";
const fixtureTag = `d02-browser-${crypto.randomUUID().replace(/-/g, "")}`;
const managerEmail = `${fixtureTag}-manager@example.test`;
const inviteeEmail = `${fixtureTag}-invitee-en@example.test`;
const arabicInviteeEmail = `${fixtureTag}-invitee-ar@example.test`;
const managerPassword = `Mgr-${crypto.randomUUID()}-Aa1!`;
const inviteePassword = `Vet-${crypto.randomUUID()}-Aa1!`;
const arabicInviteePassword = `Vet-${crypto.randomUUID()}-Aa1!`;

let url: string;
let publicKey: string;
let serviceKey: string;
let admin: SupabaseClient;
let clinicId: string | null = null;
let acceptedEnglishInvitationLink: string | null = null;

function localSupabaseSettings() {
  const output = execFileSync(
    "pnpm.cmd",
    ["exec", "supabase", "status", "-o", "env"],
    { cwd: resolve(process.cwd(), "../backend"), encoding: "utf8", shell: true },
  );
  const values = new Map<string, string>();
  for (const line of output.split(/\r?\n/)) {
    const match = /^(API_URL|ANON_KEY|SERVICE_ROLE_KEY)=(.*)$/.exec(line);
    if (match) values.set(match[1], match[2].replace(/^"|"$/g, ""));
  }
  const apiUrl = values.get("API_URL");
  const anon = values.get("ANON_KEY");
  const service = values.get("SERVICE_ROLE_KEY");
  if (!apiUrl || !anon || !service) {
    throw new Error("Local Supabase public/service settings are unavailable.");
  }
  return { apiUrl, anon, service };
}

async function latestInvitationLink(email: string, locale: "en" | "ar"): Promise<string> {
  const search = new URL("/api/v1/search", mailpitUrl);
  search.searchParams.set("query", `to:"${email}"`);
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    const searchResponse = await fetch(search);
    if (searchResponse.ok) {
      const result = await searchResponse.json() as {
        messages?: Array<{ ID?: string }>;
      };
      const messageId = result.messages?.[0]?.ID;
      if (messageId) {
        const messageResponse = await fetch(
          new URL(`/api/v1/message/${encodeURIComponent(messageId)}`, mailpitUrl),
        );
        if (messageResponse.ok) {
          const message = await messageResponse.json() as {
            HTML?: string;
            Text?: string;
          };
          const content = `${message.HTML ?? ""}\n${message.Text ?? ""}`
            .replace(/&amp;/gi, "&")
            .replace(/&quot;/gi, '"')
            .replace(/&#x3D;/gi, "=");
          const match = /https?:\/\/[^\s"<>]*\/api\/auth\/confirm\?[^\s"<>]+/i.exec(content);
          if (match) {
            const invitationUrl = new URL(match[0].replace(/[),.;]+$/, ""));
            if (
              !["localhost", "127.0.0.1"].includes(invitationUrl.hostname)
              || invitationUrl.pathname !== "/api/auth/confirm"
              || invitationUrl.searchParams.get("type") !== "invite"
              || invitationUrl.searchParams.get("next") !== `/${locale}/accept-invite`
              || !invitationUrl.searchParams.has("token_hash")
            ) continue;
            invitationUrl.host = "localhost:3010";
            return invitationUrl.toString();
          }
        }
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Local Mailpit did not expose a usable invitation link.");
}

async function cleanupFixtures() {
  if (!admin) return;
  const userResult = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const fixtureEmails = new Set([managerEmail, inviteeEmail, arabicInviteeEmail]);
  const ids = (userResult.data?.users ?? [])
    .filter((user) => user.email && fixtureEmails.has(user.email))
    .map((user) => user.id);
  const invitationResult = clinicId
    ? await admin.from("staff_invitations").select("id").eq("clinic_id", clinicId)
    : { data: [] as Array<{ id: string }> };
  const invitationIds = (invitationResult.data ?? []).map((row) => row.id);
  const uuidList = ids.map((id) => `'${id}'`).join(",") || "NULL";
  const invitationList = invitationIds.map((id) => `'${id}'`).join(",") || "NULL";
  if (clinicId || ids.length || invitationIds.length) {
    const sql = [
      `DELETE FROM public.audit_logs WHERE actor_id IN (${uuidList}) OR entity_id IN (${invitationList}) OR entity_id LIKE ${clinicId ? `'${clinicId}:%'` : "'__no_fixture__%'"};`,
      `DELETE FROM public.clinic_staff WHERE user_id IN (${uuidList}) OR clinic_id = ${clinicId ? `'${clinicId}'` : "NULL"}::uuid;`,
      `DELETE FROM public.staff_invitations WHERE id IN (${invitationList}) OR clinic_id = ${clinicId ? `'${clinicId}'` : "NULL"}::uuid;`,
      `DELETE FROM public.account_deletion_requests WHERE user_id IN (${uuidList});`,
      `DELETE FROM auth.users WHERE id IN (${uuidList});`,
      `DELETE FROM public.clinics WHERE id = ${clinicId ? `'${clinicId}'` : "NULL"}::uuid;`,
    ].join("\n");
    execFileSync(
      "docker",
      ["exec", "supabase_db_backend", "psql", "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-c", sql],
      { encoding: "utf8", stdio: "ignore" },
    );
  }
}

test.describe("authenticated local invitation acceptance", () => {
  test.beforeAll(async () => {
    const settings = localSupabaseSettings();
    url = settings.apiUrl;
    publicKey = settings.anon;
    serviceKey = settings.service;
    admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    });

    const manager = await admin.auth.admin.createUser({
      email: managerEmail,
      password: managerPassword,
      email_confirm: true,
      user_metadata: { full_name: "Synthetic D02 Clinic Manager" },
    });
    if (manager.error || !manager.data.user) throw new Error("Could not create local manager fixture.");

    const { data: clinic, error: clinicError } = await admin
      .from("clinics")
      .insert({ name_en: "D02 Synthetic Clinic", name_ar: "عيادة اختبار", status: "active" })
      .select("id")
      .single();
    if (clinicError || !clinic) throw new Error("Could not create local clinic fixture.");
    clinicId = clinic.id;

    const roleUpdate = await admin.from("profiles")
      .update({ role: "clinic_staff" })
      .eq("id", manager.data.user.id);
    if (roleUpdate.error) throw new Error("Could not configure local manager role.");
    execFileSync(
      "docker",
      ["exec", "supabase_db_backend", "psql", "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-c",
        `INSERT INTO public.clinic_staff (clinic_id,user_id,staff_level) VALUES ('${clinicId}','${manager.data.user.id}','manager');`],
      { encoding: "utf8", stdio: "ignore" },
    );

    const managerClient = createClient(url, publicKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    });
    const managerSession = await managerClient.auth.signInWithPassword({
      email: managerEmail,
      password: managerPassword,
    });
    if (managerSession.error || !managerSession.data.session) {
      throw new Error("Could not establish the local manager session.");
    }

    for (const [email, locale] of [[inviteeEmail, "en"], [arabicInviteeEmail, "ar"]] as const) {
      const inviteResponse = await fetch(`${url}/functions/v1/admin-create-staff`, {
        method: "POST",
        headers: {
          apikey: publicKey,
          authorization: `Bearer ${managerSession.data.session.access_token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email,
          full_name: locale === "ar" ? "Synthetic D02 Vet Arabic" : "Synthetic D02 Vet",
          clinic_id: clinicId,
          staff_level: "vet",
          locale,
        }),
      });
      if (inviteResponse.status !== 201) {
        throw new Error(`Local ${locale} staff invitation returned HTTP ${inviteResponse.status}.`);
      }
    }
  });

  test.afterAll(async () => {
    await cleanupFixtures();
  });

  test("follows the Mailpit invite, accepts it, refreshes staff claims, and navigates", async ({ page }) => {
    const invitationLink = await latestInvitationLink(inviteeEmail, "en");
    acceptedEnglishInvitationLink = invitationLink;
    await page.goto(invitationLink);
    await page.waitForURL(/\/en\/accept-invite/);
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Confirm password")).toBeVisible();
    await page.getByLabel("Password", { exact: true }).fill(inviteePassword);
    await page.getByLabel("Confirm password").fill(inviteePassword);
    await page.getByRole("button", { name: "Set password and continue" }).click();
    await page.waitForURL(/\/en\/clinic$/);

    const profile = await admin.from("profiles")
      .select("id,role,status")
      .eq("email", inviteeEmail)
      .single();
    expect(profile.error).toBeNull();
    expect(profile.data).toMatchObject({ role: "clinic_staff", status: "active" });
    const membership = await admin.from("clinic_staff")
      .select("staff_level")
      .eq("clinic_id", clinicId)
      .eq("user_id", profile.data!.id)
      .single();
    expect(membership.error).toBeNull();
    expect(membership.data?.staff_level).toBe("vet");
    const accepted = execFileSync(
      "docker",
      [
        "exec", "supabase_db_backend", "psql", "-U", "postgres", "-d", "postgres",
        "-At", "-v", "ON_ERROR_STOP=1", "-c",
        `SELECT (accepted_at IS NOT NULL AND accepted_user_id = '${profile.data!.id}')::text FROM public.staff_invitations WHERE email = '${inviteeEmail}';`,
      ],
      { encoding: "utf8" },
    ).trim();
    expect(accepted).toBe("true");
  });

  test("rejects a reused invitation link in a fresh browser session", async ({ browser }) => {
    if (!acceptedEnglishInvitationLink) {
      throw new Error("The English invitation acceptance test did not produce a link.");
    }
    const context = await browser.newContext();
    try {
      const page = await context.newPage();
      await page.goto(acceptedEnglishInvitationLink);
      await page.waitForURL(/\/en\/accept-invite/);
      await expect(page.getByRole("alert").first()).toContainText(/invalid|expired/i);
      await expect(page.getByLabel("Password", { exact: true })).toHaveCount(0);
    } finally {
      await context.close();
    }
  });

  test("fails closed for an invalid invite token hash", async ({ browser }) => {
    const context = await browser.newContext();
    try {
      const page = await context.newPage();
      await page.goto(
        "http://localhost:3010/api/auth/confirm?token_hash=invalid-test-hash&type=invite&next=%2Fen%2Faccept-invite",
      );
      await page.waitForURL(/\/en\/accept-invite/);
      await expect(page.getByRole("alert").first()).toContainText(/invalid|expired/i);
      await expect(page.getByLabel("Password", { exact: true })).toHaveCount(0);
    } finally {
      await context.close();
    }
  });

  test("accepts an Arabic invitation with RTL and refreshed clinic staff claims", async ({ page }) => {
    await page.goto(await latestInvitationLink(arabicInviteeEmail, "ar"));
    await page.waitForURL(/\/ar\/accept-invite/);
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByLabel("كلمة المرور", { exact: true })).toBeVisible();
    await page.getByLabel("كلمة المرور", { exact: true }).fill(arabicInviteePassword);
    await page.getByLabel("تأكيد كلمة المرور").fill(arabicInviteePassword);
    await page.getByRole("button", { name: "حفظ كلمة المرور والمتابعة" }).click();
    await page.waitForURL(/\/ar\/clinic$/);

    const profile = await admin.from("profiles")
      .select("id,role,status")
      .eq("email", arabicInviteeEmail)
      .single();
    expect(profile.error).toBeNull();
    expect(profile.data).toMatchObject({ role: "clinic_staff", status: "active" });
    const membership = await admin.from("clinic_staff")
      .select("staff_level")
      .eq("clinic_id", clinicId)
      .eq("user_id", profile.data!.id)
      .single();
    expect(membership.error).toBeNull();
    expect(membership.data?.staff_level).toBe("vet");
  });
});
