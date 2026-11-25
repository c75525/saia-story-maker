import { describe, expect, it } from "vitest";
import { fittedImageSize } from "../src/media.js";

describe("image preparation sizing", () => {
  it("keeps small images and bounds large decoded images", () => {
    expect(fittedImageSize(800, 600)).toEqual({ width: 800, height: 600 });
    const result = fittedImageSize(8000, 6000);
    expect(Math.max(result.width, result.height)).toBeLessThanOrEqual(1920);
    expect(result.width * result.height).toBeLessThanOrEqual(2_500_000);
    expect(result.width / result.height).toBeCloseTo(4 / 3, 2);
  });

  it("rejects invalid dimensions", () => {
    expect(() => fittedImageSize(0, 100)).toThrow(/invalid/i);
  });
});
