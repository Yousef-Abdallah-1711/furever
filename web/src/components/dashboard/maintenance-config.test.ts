import { describe, expect, it } from "vitest";
import { readMaintenanceMessage } from "./maintenance-config";

describe("readMaintenanceMessage", () => {
  it("ignores missing and malformed configuration", () => {
    expect(readMaintenanceMessage(null, "en")).toBeNull();
    expect(readMaintenanceMessage({ enabled: "yes" }, "en")).toBeNull();
  });

  it("does not show disabled maintenance", () => {
    expect(readMaintenanceMessage({ enabled: false }, "en")).toEqual({
      enabled: false,
      message: null,
    });
  });

  it("selects localized copy and supplies a safe fallback", () => {
    expect(
      readMaintenanceMessage(
        { enabled: true, message_en: "Planned work", message_ar: "تحديث" },
        "ar",
      ),
    ).toEqual({ enabled: true, message: "تحديث" });
    expect(readMaintenanceMessage({ enabled: true }, "en")?.message).toContain(
      "improving the service",
    );
  });
});
