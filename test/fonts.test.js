import { describe, expect, it, vi } from "vitest";
import { ensureFontFaces } from "../src/fonts.js";

describe("Aktiv Grotesk readiness", () => {
  it("requires every requested web-font face to load and check successfully", async () => {
    const fontSet = { load: vi.fn(async () => [{}]), check: vi.fn(() => true) };
    await expect(ensureFontFaces(fontSet, { faces: [{ weight: 300 }, { weight: 700 }] })).resolves.toBe(true);
    expect(fontSet.load).toHaveBeenCalledTimes(2);
    expect(fontSet.check).toHaveBeenCalledTimes(2);
  });

  it("rejects fallback-only matches and missing font APIs", async () => {
    const fallbackOnly = { load: vi.fn(async () => []), check: vi.fn(() => true) };
    await expect(ensureFontFaces(fallbackOnly, { faces: [{ weight: 400 }] })).resolves.toBe(false);
    await expect(ensureFontFaces(null)).resolves.toBe(false);
  });
});
