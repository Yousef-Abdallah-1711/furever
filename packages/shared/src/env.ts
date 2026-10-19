import * as z from "zod";

export type EnvSource = Record<string, string | undefined>;

const runtimeEnv: EnvSource =
  (globalThis as typeof globalThis & {
    process?: { env?: EnvSource };
  }).process?.env ?? {};

export function loadEnv<Schema extends z.ZodType>(
  schema: Schema,
  source: EnvSource = runtimeEnv,
): z.output<Schema> {
  const result = schema.safeParse(source);

  if (!result.success) {
    const details = result.error.issues.map((issue) => {
      const variable = issue.path.length > 0 ? issue.path.join(".") : "environment";
      return `- ${variable}: ${issue.message}`;
    });

    // Fail fast with every invalid or missing variable so configuration is fixed at startup.
    throw new Error(`Invalid environment configuration:\n${details.join("\n")}`);
  }

  return result.data;
}
