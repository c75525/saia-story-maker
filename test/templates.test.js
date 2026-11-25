// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { BRAND, getTemplate, TEMPLATES } from "../src/templates.js";

describe("starter templates", () => {
  it("builds every advertised template from editable Fabric objects", () => {
    for (const template of TEMPLATES) {
      const result = getTemplate(template.id);
      expect(Object.values(BRAND)).toContain(result.background);
      expect(result.objects.length).toBeGreaterThan(0);
      expect(result.objects.every((object) => object.selectable !== false)).toBe(true);
      expect(result.objects.some((object) => object.saiaType === "text")).toBe(true);
    }
  });

  it("rejects unknown template ids", () => {
    expect(() => getTemplate("missing")).toThrow(/unknown template/i);
  });
});
