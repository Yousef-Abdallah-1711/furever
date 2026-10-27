import { describe, expect, it } from "vitest";
import { breedSchema, petCreateSchema, petUpdateSchema } from "./pet";

describe("pet schemas", () => {
  it("accepts the required owner pet fields and optional profile details", () => {
    expect(
      petCreateSchema.parse({ name: "Miso", species: "cat", gender: "female" }),
    ).toMatchObject({ name: "Miso", species: "cat", gender: "female" });
  });

  it("trims names and validates optional pet details", () => {
    expect(
      petCreateSchema.parse({
        name: "  Miso  ",
        species: "cat",
        gender: "female",
        breed_id: "a0000000-0000-4000-8000-000000000014",
        birth_date: "2022-05-01",
        weight_kg: 4.25,
      }),
    ).toMatchObject({ name: "Miso", weight_kg: 4.25 });
  });

  it.each([
    { name: " ", species: "cat", gender: "female" },
    { name: "Miso", species: "dragon", gender: "female" },
    { name: "Miso", species: "cat", gender: "unknown", breed_id: "not-a-uuid" },
    { name: "Miso", species: "cat", gender: "unknown", birth_date: "2026-02-30" },
    { name: "Miso", species: "cat", gender: "unknown", weight_kg: 0 },
  ])("rejects invalid pet input %#", (value) => {
    expect(petCreateSchema.safeParse(value).success).toBe(false);
  });

  it("rejects an empty edit and accepts a partial edit", () => {
    expect(petUpdateSchema.safeParse({}).success).toBe(false);
    expect(petUpdateSchema.parse({ weight_kg: 5.1 })).toEqual({ weight_kg: 5.1 });
  });

  it("validates a localized active breed catalog entry", () => {
    expect(
      breedSchema.parse({
        id: "a0000000-0000-4000-8000-000000000014",
        species: "cat",
        slug: "persian",
        name_en: "Persian",
        name_ar: "فارسي",
        is_active: true,
      }).slug,
    ).toBe("persian");
  });
});
