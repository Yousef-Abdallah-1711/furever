import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const templateNames = [
  "login-code.html",
  "staff-invite.html",
  "password-reset.html",
] as const;

async function loadTemplate(name: (typeof templateNames)[number]) {
  return readFile(new URL(`./${name}`, import.meta.url), "utf8");
}

function renderSupabaseVariables(
  template: string,
  variables: { Token?: string; ConfirmationURL?: string },
) {
  const escapeHtml = (value: string) =>
    value.replaceAll("&", "&amp;").replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;").replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  return template
    .replaceAll("{{ .Token }}", escapeHtml(variables.Token ?? ""))
    .replaceAll(
      "{{ .ConfirmationURL }}",
      escapeHtml(variables.ConfirmationURL ?? ""),
    );
}

describe("bilingual Supabase email templates", () => {
  it.each(templateNames)("renders both language sections in %s", async (name) => {
    const template = await loadTemplate(name);
    const rendered = renderSupabaseVariables(template, {
      Token: "123456",
      ConfirmationURL: "https://example.test/auth/confirm?token=safe",
    });

    expect(rendered).toContain('<section lang="en" dir="ltr"');
    expect(rendered).toContain('<section lang="ar" dir="rtl"');
    expect(rendered).toContain("FurEver");
    expect(rendered).not.toMatch(/{{\s*\.[^}]+}}/);
    expect(rendered).toMatch(/<!doctype html>/i);
    expect(rendered).toContain('role="presentation"');
  });

  it("keeps login codes as text and escapes template values", async () => {
    const template = await loadTemplate("login-code.html");
    const rendered = renderSupabaseVariables(template, {
      Token: '<img src=x onerror="alert(1)">',
    });

    expect(rendered).toContain(
      "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;",
    );
    expect(rendered).not.toContain('<img src=x');
  });

  it.each(["staff-invite.html", "password-reset.html"] as const)(
    "uses the Auth confirmation URL in %s",
    async (name) => {
      const template = await loadTemplate(name);
      const rendered = renderSupabaseVariables(template, {
        ConfirmationURL: "https://example.test/auth/verify?token=abc&next=%2F",
      });

      expect(rendered).toContain(
        'href="https://example.test/auth/verify?token=abc&amp;next=%2F"',
      );
      expect(rendered).not.toContain("{{ .ConfirmationURL }}");
    },
  );
});
