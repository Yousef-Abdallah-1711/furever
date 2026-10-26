import { describe, expect, it, vi } from "vitest";
import { readLocalInboxCode } from "./read-local-inbox";

function jsonResponse(value: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => value,
  } as Response;
}

const recipient = "owner@example.test";

describe("readLocalInboxCode", () => {
  it("reads the newest exact-recipient message, ignoring newer unrelated mail", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({
          messages: [
            {
              ID: "wrong-recipient",
              Created: "2026-10-26T12:03:00Z",
              To: [{ Address: "other@example.test" }],
            },
            {
              ID: "old-match",
              Created: "2026-10-26T12:01:00Z",
              To: [{ Address: recipient }],
            },
            {
              ID: "new-match",
              Created: "2026-10-26T12:02:00Z",
              To: [{ Address: recipient.toUpperCase() }],
            },
          ],
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ Text: "Your code is 482901." }));

    await expect(
      readLocalInboxCode(recipient, { fetch: fetchMock }),
    ).resolves.toBe("482901");
    expect(String(fetchMock.mock.calls[0][0])).toContain("/api/v1/search?");
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      "to%3A%22owner%40example.test%22",
    );
    expect(String(fetchMock.mock.calls[1][0])).toContain(
      "/api/v1/message/new-match",
    );
  });

  it("extracts a standalone code from visible HTML text", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({
          messages: [
            {
              ID: "html-message",
              Created: "2026-10-26T12:02:00Z",
              To: [{ Address: recipient }],
            },
          ],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          Text: "Reference 1234567 is not a code.",
          HTML: '<html><body><p>Your code: <strong>073514</strong></p><a href="https://example.test">Sign in</a></body></html>',
        }),
      );

    await expect(
      readLocalInboxCode(recipient, { fetch: fetchMock }),
    ).resolves.toBe("073514");
  });

  it("times out clearly when there is no matching recipient", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ messages: [] }));

    await expect(
      readLocalInboxCode(recipient, {
        fetch: fetchMock,
        timeoutMs: 15,
        pollIntervalMs: 5,
      }),
    ).rejects.toThrow("Timed out waiting for a matching email");
    expect(fetchMock).toHaveBeenCalled();
  });

  it("rejects malformed responses and HTTP failures without exposing message data", async () => {
    const malformedFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ unexpected: [] }));
    await expect(
      readLocalInboxCode(recipient, { fetch: malformedFetch }),
    ).rejects.toThrow("Mailpit search returned a malformed response");

    const errorFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        jsonResponse({ detail: "private response content" }, 503),
      );
    await expect(
      readLocalInboxCode(recipient, { fetch: errorFetch }),
    ).rejects.toThrow("Mailpit search failed with HTTP 503");
  });

  it("rejects a magic-link-only message without a numeric code", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({
          messages: [
            {
              ID: "link-only",
              Created: "2026-10-26T12:02:00Z",
              To: [{ Address: recipient }],
            },
          ],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          Text: "Sign in using this link: https://example.test/auth/confirm?token=123456",
          HTML: '<a href="https://example.test/auth/confirm?token=123456">Sign in</a>',
        }),
      );

    await expect(
      readLocalInboxCode(recipient, { fetch: fetchMock }),
    ).rejects.toThrow("no standalone six-digit code");
  });

  it("validates recipient and Mailpit URL", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    await expect(
      readLocalInboxCode("not-an-email", { fetch: fetchMock }),
    ).rejects.toThrow("Invalid recipient email address");
    await expect(
      readLocalInboxCode(recipient, {
        fetch: fetchMock,
        baseUrl: "ftp://127.0.0.1:54324",
      }),
    ).rejects.toThrow("Mailpit base URL must be an HTTP(S) URL");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
