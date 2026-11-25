export const AKTIV_WEIGHTS = Object.freeze([300, 400, 500, 600, 700]);

export async function ensureFontFaces(fontSet, {
  family = "aktiv-grotesk",
  faces = AKTIV_WEIGHTS.map((weight) => ({ weight, style: "normal" })),
  timeoutMs = 8000,
} = {}) {
  if (!fontSet?.load) return false;
  const unique = [...new Map(faces.map((face) => [`${face.style || "normal"}:${face.weight}`, face])).values()];
  const loads = unique.map(async ({ weight, style = "normal" }) => {
    const descriptor = `${style} ${weight} 72px "${family}"`;
    const matchedFaces = await fontSet.load(descriptor, "S.A.I.A.");
    return Array.isArray(matchedFaces) && matchedFaces.length > 0 && fontSet.check(descriptor, "S.A.I.A.");
  });
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Font loading timed out")), timeoutMs);
  });
  const results = await Promise.race([Promise.all(loads), timeout]);
  return results.every(Boolean);
}
