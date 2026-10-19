import { describe, expect, it } from "vitest";
import { precomputedMixes, readTokenThemes } from "./build";

describe("OKLab color-mix resolution", () => {
  it("matches independently calculated light and dark token colors", async () => {
    const mixes = precomputedMixes(await readTokenThemes());

    // Expected hex values were calculated independently with Python 3.11.9 and the CSS Color 4 OKLab matrices.
    expect(mixes).toEqual({
      light: {
        "--success-bg": "#E4EFE7",
        "--warning-bg": "#F6ECE1",
        "--danger-bg": "#FAE9E7",
        "--info-bg": "#E5ECF4",
        "--primary-bg": "#F4E8E8",
        "--fe-skel-mix-1": "#F5E9E7",
        "--fe-ph-mix-1": "#F3E5E3",
      },
      dark: {
        "--success-bg": "#30302C",
        "--warning-bg": "#3B2D26",
        "--danger-bg": "#392627",
        "--info-bg": "#302C33",
        "--primary-bg": "#3A2A2C",
        "--fe-skel-mix-1": "#312426",
        "--fe-ph-mix-1": "#342628",
      },
    });
  });
});
