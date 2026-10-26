const DEFAULT_MAILPIT_URL = "http://127.0.0.1:54324";
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_POLL_INTERVAL_MS = 500;

type MailpitAddress = { Address: string };
type MailpitSummary = {
  ID: string;
  Created: string;
  To: MailpitAddress[];
};
type MailpitMessage = {
  Text?: string | null;
  HTML?: string | null;
};

export type ReadLocalInboxOptions = {
  /** Mailpit origin, optionally with a path prefix. */
  baseUrl?: string;
  timeoutMs?: number;
  pollIntervalMs?: number;
  fetch?: typeof fetch;
};

/**
 * Waits for a Mailpit message addressed to `recipient` and returns its standalone
 * six-digit code. Mailpit's API exposes local test email; this does not verify
 * delivery through a real SMTP provider.
 */
export async function readLocalInboxCode(
  recipient: string,
  options: ReadLocalInboxOptions = {},
): Promise<string> {
  if (!isValidEmail(recipient)) {
    throw new Error("Invalid recipient email address.");
  }

  const baseUrl = validateBaseUrl(options.baseUrl ?? DEFAULT_MAILPIT_URL);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const pollIntervalMs = options.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error("timeoutMs must be a positive number.");
  }
  if (!Number.isFinite(pollIntervalMs) || pollIntervalMs <= 0) {
    throw new Error("pollIntervalMs must be a positive number.");
  }

  const fetchImpl = options.fetch ?? globalThis.fetch;
  if (typeof fetchImpl !== "function") {
    throw new Error(
      "A fetch implementation is required to read the local inbox.",
    );
  }

  const deadline = Date.now() + timeoutMs;
  const searchUrl = new URL(`${baseUrl}/api/v1/search`);
  searchUrl.searchParams.set("query", `to:"${recipient}"`);
  searchUrl.searchParams.set("limit", "100");

  while (Date.now() < deadline) {
    const search = await getJson(
      fetchImpl,
      searchUrl,
      deadline,
      "Mailpit search",
    );
    const summaries = parseSummaries(search);
    const matching = summaries
      .filter((summary) =>
        summary.To.some(
          (address) =>
            address.Address.toLowerCase() === recipient.toLowerCase(),
        ),
      )
      .sort((a, b) => Date.parse(b.Created) - Date.parse(a.Created));

    if (matching.length > 0) {
      const newest = matching[0];
      const detailUrl = new URL(
        `${baseUrl}/api/v1/message/${encodeURIComponent(newest.ID)}`,
      );
      const message = parseMessage(
        await getJson(
          fetchImpl,
          detailUrl,
          deadline,
          "Mailpit message retrieval",
        ),
      );
      const code = extractCode(message);
      if (!code) {
        throw new Error(
          "The newest matching email contains no standalone six-digit code. It may use a magic link template; check the local Auth email template.",
        );
      }
      return code;
    }

    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(pollIntervalMs, remaining)),
    );
  }

  throw new Error(
    "Timed out waiting for a matching email in the local Mailpit inbox.",
  );
}

function isValidEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);
}

function validateBaseUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Invalid Mailpit base URL.");
  }
  if (
    (url.protocol !== "http:" && url.protocol !== "https:") ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "Mailpit base URL must be an HTTP(S) URL without credentials, query, or fragment.",
    );
  }
  return url.toString().replace(/\/+$/, "");
}

async function getJson(
  fetchImpl: typeof fetch,
  url: URL,
  deadline: number,
  operation: string,
): Promise<unknown> {
  const remaining = deadline - Date.now();
  if (remaining <= 0) {
    throw new Error(`Timed out during ${operation}.`);
  }
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error(`Timed out during ${operation}.`));
    }, remaining);
  });
  try {
    return await Promise.race([
      (async () => {
        let response: Response;
        try {
          response = await fetchImpl(url, { signal: controller.signal });
        } catch {
          throw new Error(`Could not reach Mailpit during ${operation}.`);
        }
        if (!response.ok) {
          throw new Error(`${operation} failed with HTTP ${response.status}.`);
        }
        try {
          return await response.json();
        } catch {
          throw new Error(`${operation} returned malformed JSON.`);
        }
      })(),
      timeout,
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

function parseSummaries(value: unknown): MailpitSummary[] {
  if (!isRecord(value) || !Array.isArray(value.messages)) {
    throw new Error("Mailpit search returned a malformed response.");
  }
  return value.messages.map((item): MailpitSummary => {
    if (
      !isRecord(item) ||
      typeof item.ID !== "string" ||
      item.ID.length === 0 ||
      typeof item.Created !== "string" ||
      !Number.isFinite(Date.parse(item.Created)) ||
      !Array.isArray(item.To) ||
      !item.To.every(
        (address) => isRecord(address) && typeof address.Address === "string",
      )
    ) {
      throw new Error("Mailpit search returned a malformed message summary.");
    }
    return item as MailpitSummary;
  });
}

function parseMessage(value: unknown): MailpitMessage {
  if (
    !isRecord(value) ||
    (value.Text !== undefined &&
      value.Text !== null &&
      typeof value.Text !== "string") ||
    (value.HTML !== undefined &&
      value.HTML !== null &&
      typeof value.HTML !== "string") ||
    (typeof value.Text !== "string" && typeof value.HTML !== "string")
  ) {
    throw new Error("Mailpit returned a malformed message body.");
  }
  return value as MailpitMessage;
}

function extractCode(message: MailpitMessage): string | undefined {
  const text = message.Text ?? "";
  const textCode = findStandaloneCode(text);
  if (textCode) return textCode;

  const visibleHtml = (message.HTML ?? "")
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
  return findStandaloneCode(visibleHtml);
}

function findStandaloneCode(value: string): string | undefined {
  return value
    .replace(/https?:\/\/\S+/gi, " ")
    .match(/(?<!\d)\d{6}(?!\d)/)?.[0];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
