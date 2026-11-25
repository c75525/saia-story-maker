import { describe, expect, it } from "vitest";
import {
  AUTOSAVE_KEY,
  cleanName,
  createProject,
  deleteDraft,
  loadAutosave,
  loadDrafts,
  parseProject,
  renameDraft,
  saveAutosave,
  saveDraft,
} from "../src/storage.js";

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

const canvas = { version: "7.4.0", objects: [], background: "#E1DEE8" };

describe("project serialization", () => {
  it("normalizes names and creates a versioned project", () => {
    const project = createProject({ name: "  Meeting   031  ", canvas, updatedAt: "2026-11-24T00:00:00.000Z" });
    expect(project).toEqual({ version: 1, name: "Meeting 031", updatedAt: "2026-11-24T00:00:00.000Z", canvas });
  });

  it("parses JSON and rejects incompatible or malformed projects", () => {
    expect(parseProject(JSON.stringify(createProject({ canvas }))).canvas).toEqual(canvas);
    expect(() => parseProject({ version: 2, canvas })).toThrow(/not a supported/i);
    expect(() => parseProject({ version: 1, canvas: {} })).toThrow(/valid canvas/i);
    expect(() => parseProject({ version: 1, canvas: { objects: [{ type: "UnknownWidget" }] } })).toThrow(/unsupported canvas element/i);
  });

  it("uses a safe default for blank and overly long names", () => {
    expect(cleanName("   ")).toBe("Untitled story");
    expect(cleanName("x".repeat(100))).toHaveLength(80);
  });
});

describe("browser-local persistence", () => {
  it("saves and restores the autosave", () => {
    const storage = memoryStorage();
    const project = createProject({ name: "Autosaved", canvas });
    saveAutosave(storage, project);
    expect(storage.getItem(AUTOSAVE_KEY)).toContain("Autosaved");
    expect(loadAutosave(storage).name).toBe("Autosaved");
  });

  it("returns null for a corrupt autosave", () => {
    const storage = memoryStorage();
    storage.setItem(AUTOSAVE_KEY, "not-json");
    expect(loadAutosave(storage)).toBeNull();
  });

  it("creates, updates, renames, and deletes named drafts", () => {
    const storage = memoryStorage();
    const first = saveDraft(storage, createProject({ name: "First", canvas }), "draft-1");
    expect(first.id).toBe("draft-1");
    expect(loadDrafts(storage)).toHaveLength(1);

    saveDraft(storage, createProject({ name: "Updated", canvas }), "draft-1");
    expect(loadDrafts(storage)).toHaveLength(1);
    expect(loadDrafts(storage)[0].project.name).toBe("Updated");

    renameDraft(storage, "draft-1", "  Renamed  ");
    expect(loadDrafts(storage)[0].project.name).toBe("Renamed");
    expect(deleteDraft(storage, "draft-1")).toBe(true);
    expect(loadDrafts(storage)).toEqual([]);
  });
});
