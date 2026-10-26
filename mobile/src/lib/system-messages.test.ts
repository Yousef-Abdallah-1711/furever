import { describe, expect, it } from "@jest/globals";
import {
  readMaintenanceMessage,
  readMinimumMobileVersion,
} from "./system-messages";

describe("system screen app config", () => {
  it("reads the supported version from the min_mobile_version contract", () => {
    expect(
      readMinimumMobileVersion({ min_mobile_version: { version: "1.2.3" } }),
    ).toBe("1.2.3");
    expect(
      readMinimumMobileVersion({ min_mobile_version: { version: "1.2" } }),
    ).toBeNull();
    expect(
      readMinimumMobileVersion({ min_mobile_version: "1.2.3" }),
    ).toBeNull();
  });

  it("selects the localized maintenance message and rejects empty or oversized content", () => {
    const config = {
      maintenance: {
        message_en: "Service work is in progress.",
        message_ar: "الصيانة جارية.",
      },
    };
    expect(readMaintenanceMessage(config, "en")).toBe(
      "Service work is in progress.",
    );
    expect(readMaintenanceMessage(config, "ar")).toBe("الصيانة جارية.");
    expect(
      readMaintenanceMessage({ maintenance: { message_en: "  " } }, "en"),
    ).toBeNull();
    expect(
      readMaintenanceMessage(
        { maintenance: { message_en: "x".repeat(501) } },
        "en",
      ),
    ).toBeNull();
  });
});
