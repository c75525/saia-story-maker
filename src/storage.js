export const PROJECT_VERSION = 1;
export const AUTOSAVE_KEY = "saia-story-maker:autosave:v1";
export const DRAFTS_KEY = "saia-story-maker:drafts:v1";
const SUPPORTED_OBJECT_TYPES = new Set(["textbox", "rect", "circle", "line", "image"]);

function validateCanvasObjects(objects) {
  for (const object of objects) {
    const type = String(object?.type || "").toLowerCase();
    if (!object || typeof object !== "object" || !SUPPORTED_OBJECT_TYPES.has(type)) {
      throw new Error(`The story contains an unsupported canvas element${type ? ` (${type})` : ""}.`);
    }
  }
}

export function createProject({ name = "Untitled story", canvas, updatedAt = new Date().toISOString() } = {}) {
  if (!canvas || typeof canvas !== "object") throw new TypeError("A canvas object is required.");
  return { version: PROJECT_VERSION, name: cleanName(name), updatedAt, canvas };
}

export function cleanName(value) {
  const name = String(value ?? "").trim().replace(/\s+/g, " ");
  return name.slice(0, 80) || "Untitled story";
}

export function parseProject(value) {
  const raw = typeof value === "string" ? JSON.parse(value) : value;
  if (!raw || typeof raw !== "object" || raw.version !== PROJECT_VERSION) {
    throw new Error("This is not a supported S.A.I.A. Story Maker file.");
  }
  if (!raw.canvas || typeof raw.canvas !== "object" || !Array.isArray(raw.canvas.objects)) {
    throw new Error("The story file does not contain a valid canvas.");
  }
  validateCanvasObjects(raw.canvas.objects);
  return createProject(raw);
}

export function loadDrafts(storage = localStorage) {
  try {
    const value = JSON.parse(storage.getItem(DRAFTS_KEY) || "[]");
    return Array.isArray(value)
      ? value.filter((draft) => draft && typeof draft.id === "string" && draft.project)
      : [];
  } catch {
    return [];
  }
}

export function saveDraft(storage, project, id = globalThis.crypto?.randomUUID?.() || `${Date.now()}`) {
  const drafts = loadDrafts(storage);
  const normalized = parseProject(project);
  const index = drafts.findIndex((draft) => draft.id === id);
  const record = { id, project: normalized };
  if (index >= 0) drafts[index] = record;
  else drafts.unshift(record);
  storage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  return record;
}

export function renameDraft(storage, id, name) {
  const drafts = loadDrafts(storage);
  const draft = drafts.find((item) => item.id === id);
  if (!draft) return null;
  draft.project.name = cleanName(name);
  draft.project.updatedAt = new Date().toISOString();
  storage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  return draft;
}

export function deleteDraft(storage, id) {
  const drafts = loadDrafts(storage);
  const remaining = drafts.filter((draft) => draft.id !== id);
  storage.setItem(DRAFTS_KEY, JSON.stringify(remaining));
  return remaining.length !== drafts.length;
}

export function saveAutosave(storage, project) {
  storage.setItem(AUTOSAVE_KEY, JSON.stringify(parseProject(project)));
}

export function loadAutosave(storage = localStorage) {
  const value = storage.getItem(AUTOSAVE_KEY);
  if (!value) return null;
  try {
    return parseProject(value);
  } catch {
    return null;
  }
}
