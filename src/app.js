import "./styles.css";
import {
  Canvas,
  Circle,
  FabricImage,
  FabricObject,
  Line,
  Rect,
  StaticCanvas,
  Textbox,
} from "fabric";
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
} from "./storage.js";
import { BRAND, getTemplate, SAFE_MARGIN, STORY_HEIGHT, STORY_WIDTH, TEMPLATES } from "./templates.js";
import { prepareImageFile } from "./media.js";
import { ensureFontFaces } from "./fonts.js";

FabricObject.customProperties = ["saiaType", "saiaUppercase", "saiaCaseText", "saiaId"];

const FAVICON_URL = `${import.meta.env.BASE_URL}assets/saia-favicon.png`;
const HISTORY_LIMIT = 40;
const FONT_FAMILY = "aktiv-grotesk";
const FONT_WEIGHTS = [300, 400, 500, 600, 700];

const app = document.querySelector("#app");
app.innerHTML = `
  <div class="app-shell">
    <header class="topbar">
      <div class="brand-lockup">
        <img src="${FAVICON_URL}" width="192" height="192" alt="" />
        <div><h1>Story Maker</h1><p>1080 × 1920</p></div>
      </div>
      <div class="top-actions">
        <button class="icon-button" id="undo" title="Undo" aria-label="Undo" disabled>↶</button>
        <button class="icon-button" id="redo" title="Redo" aria-label="Redo" disabled>↷</button>
        <button class="primary-button" id="download">Save / Share</button>
      </div>
    </header>

    <div class="save-status" id="save-status" role="alert" hidden></div>

    <main class="workspace">
      <section class="stage-region" aria-label="Story canvas">
        <div class="stage-wrap" id="stage-wrap">
          <canvas id="story-canvas" width="1080" height="1920" aria-label="Editable Instagram Story"></canvas>
          <div class="safe-guide" aria-hidden="true"></div>
        </div>
        <p class="stage-help">Tap an object to select it. Double-tap text to edit.</p>
      </section>

      <aside class="editor-panel" aria-label="Story tools">
        <nav class="tool-tabs" aria-label="Editor sections">
          <button class="tool-tab is-active" data-panel="templates">Templates</button>
          <button class="tool-tab" data-panel="add">Add</button>
          <button class="tool-tab" data-panel="edit">Edit</button>
          <button class="tool-tab" data-panel="arrange">Arrange</button>
          <button class="tool-tab" data-panel="drafts">Drafts</button>
        </nav>

        <div class="panel-scroll">
          <section class="tool-panel is-active" id="panel-templates">
            <div class="panel-heading"><div><p class="eyebrow">Start here</p><h2>Templates</h2></div></div>
            <div class="template-list" id="template-list"></div>
            <div class="field-group">
              <span class="field-label">Background</span>
              <div class="swatches" id="background-swatches"></div>
            </div>
          </section>

          <section class="tool-panel" id="panel-add">
            <div class="panel-heading"><div><p class="eyebrow">Build</p><h2>Add elements</h2></div></div>
            <div class="action-grid">
              <button data-add="text"><span class="action-icon">T</span><span>Text</span></button>
              <button data-add="photo"><span class="action-icon">▧</span><span>Photo</span></button>
              <button data-add="logo"><span class="action-icon">S</span><span>Logo</span></button>
              <button data-add="meeting"><span class="action-icon">#</span><span>Meeting details</span></button>
              <button data-add="rect"><span class="action-icon">□</span><span>Rectangle</span></button>
              <button data-add="circle"><span class="action-icon">○</span><span>Circle</span></button>
              <button data-add="line"><span class="action-icon">—</span><span>Line</span></button>
            </div>
            <input id="photo-input" class="visually-hidden" type="file" accept="image/png,image/jpeg,image/webp" />
            <div class="field-group">
              <label class="field-label" for="meeting-number">Meeting helper</label>
              <div class="compact-fields">
                <input id="meeting-number" value="031" maxlength="3" inputmode="numeric" aria-label="Meeting number" />
                <input id="meeting-date" value="WEDNESDAY · 6–8 PM" aria-label="Meeting date and time" />
                <input id="meeting-location" value="SMOOTHIE VORTEX" aria-label="Meeting location" />
              </div>
              <button class="secondary-button full" id="add-meeting-details">Add details to canvas</button>
            </div>
          </section>

          <section class="tool-panel" id="panel-edit">
            <div class="panel-heading"><div><p class="eyebrow">Selected object</p><h2>Edit</h2></div></div>
            <p class="empty-state" id="edit-empty">Select a text or shape on the canvas.</p>
            <div id="object-controls" hidden>
              <div class="text-controls" id="text-controls">
                <label class="field-group"><span class="field-label">Text</span><textarea id="text-value" rows="3"></textarea></label>
                <div class="two-column">
                  <label class="field-group"><span class="field-label">Size</span><input id="font-size" type="number" min="12" max="400" step="1" /></label>
                  <label class="field-group"><span class="field-label">Weight</span><select id="font-weight"><option value="300">Light</option><option value="400">Regular</option><option value="500">Medium</option><option value="600">Semibold</option><option value="700">Bold</option></select></label>
                  <label class="field-group"><span class="field-label">Line height</span><input id="line-height" type="number" min="0.7" max="2" step="0.05" /></label>
                  <label class="field-group"><span class="field-label">Letter spacing</span><input id="letter-spacing" type="number" min="-100" max="500" step="5" /></label>
                </div>
                <div class="segmented" aria-label="Text alignment">
                  <button data-align="left">Left</button><button data-align="center">Center</button><button data-align="right">Right</button>
                </div>
                <div class="toggle-row">
                  <button class="secondary-button" id="italic">Italic</button>
                  <button class="secondary-button" id="uppercase">Uppercase</button>
                </div>
              </div>
              <div class="field-group">
                <span class="field-label">Color</span>
                <div class="swatches" id="object-swatches"></div>
              </div>
            </div>
          </section>

          <section class="tool-panel" id="panel-arrange">
            <div class="panel-heading"><div><p class="eyebrow">Canvas objects</p><h2>Arrange</h2></div></div>
            <div class="field-group">
              <span class="field-label" id="element-list-label">Select an element</span>
              <div class="element-list" id="element-list" role="list" aria-labelledby="element-list-label"></div>
            </div>
            <div class="geometry-controls" id="geometry-controls" hidden>
              <div class="two-column">
                <label class="field-group"><span class="field-label">X position</span><input id="object-left" type="number" step="1" /></label>
                <label class="field-group"><span class="field-label">Y position</span><input id="object-top" type="number" step="1" /></label>
                <label class="field-group"><span class="field-label">Width</span><input id="object-width" type="number" min="1" step="1" /></label>
                <label class="field-group"><span class="field-label">Height</span><input id="object-height" type="number" min="1" step="1" /></label>
              </div>
              <div class="nudge-grid" aria-label="Move selected element">
                <button data-nudge="up" aria-label="Move up">↑</button>
                <button data-nudge="left" aria-label="Move left">←</button>
                <button data-nudge="down" aria-label="Move down">↓</button>
                <button data-nudge="right" aria-label="Move right">→</button>
              </div>
            </div>
            <div class="action-list">
              <button data-arrange="forward">Bring forward <span>↑</span></button>
              <button data-arrange="backward">Send backward <span>↓</span></button>
              <button data-arrange="center-h">Center horizontally <span>↔</span></button>
              <button data-arrange="center-v">Center vertically <span>↕</span></button>
              <button data-arrange="duplicate">Duplicate <span>＋</span></button>
              <button class="danger" data-arrange="delete">Delete <span>×</span></button>
            </div>
          </section>

          <section class="tool-panel" id="panel-drafts">
            <div class="panel-heading"><div><p class="eyebrow">This browser</p><h2>Drafts</h2></div></div>
            <label class="field-group"><span class="field-label">Current story name</span><input id="story-name" maxlength="80" value="Untitled story" /></label>
            <button class="primary-button full" id="save-draft">Save named draft</button>
            <div class="draft-list" id="draft-list"></div>
            <div class="file-actions">
              <button class="secondary-button" id="export-project">Export project</button>
              <button class="secondary-button" id="import-project">Import project</button>
              <input id="project-input" class="visually-hidden" type="file" accept="application/json,.json" />
            </div>
          </section>
        </div>
      </aside>
    </main>
  </div>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
`;

const canvas = new Canvas("story-canvas", {
  width: STORY_WIDTH,
  height: STORY_HEIGHT,
  backgroundColor: BRAND.lavender,
  preserveObjectStacking: true,
  enableRetinaScaling: false,
  controlsAboveOverlay: true,
  selectionColor: "rgba(225, 222, 232, .28)",
  selectionBorderColor: BRAND.dark,
  selectionLineWidth: 3,
});

let storyName = "Untitled story";
let currentDraftId = null;
let history = [];
let historyIndex = -1;
let restoring = false;
let saveTimer;
let toastTimer;
let stageScale = 1;

const palette = Object.entries(BRAND);
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function announce(message, type = "success") {
  const toast = $("#toast");
  toast.textContent = message;
  toast.dataset.type = type;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

function showSaveError(message) {
  const status = $("#save-status");
  status.textContent = `${message} Export the project file now to avoid losing work.`;
  status.hidden = false;
}

function clearSaveError() {
  $("#save-status").hidden = true;
}

function serializeCanvas() {
  return canvas.toJSON(["saiaType", "saiaUppercase", "saiaCaseText", "saiaId"]);
}

function currentProject() {
  return createProject({ name: storyName, canvas: serializeCanvas() });
}

function scheduleAutosave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      saveAutosave(localStorage, currentProject());
      clearSaveError();
    } catch (error) {
      console.warn("Autosave failed", error);
      showSaveError("This story could not be autosaved because browser storage is full.");
    }
  }, 350);
}

function updateHistoryButtons() {
  $("#undo").disabled = historyIndex <= 0;
  $("#redo").disabled = historyIndex >= history.length - 1;
}

function captureHistory() {
  if (restoring) return;
  const snapshot = JSON.stringify(serializeCanvas());
  if (history[historyIndex] === snapshot) return;
  history = history.slice(0, historyIndex + 1);
  history.push(snapshot);
  if (history.length > HISTORY_LIMIT) history.shift();
  historyIndex = history.length - 1;
  updateHistoryButtons();
  scheduleAutosave();
}

async function restoreHistory(index) {
  if (index < 0 || index >= history.length) return;
  restoring = true;
  try {
    canvas.discardActiveObject();
    await canvas.loadFromJSON(JSON.parse(history[index]));
    canvas.getObjects().forEach(configureObject);
    canvas.requestRenderAll();
    historyIndex = index;
  } finally {
    restoring = false;
  }
  updateHistoryButtons();
  syncSelectionControls();
  scheduleAutosave();
}

function resetHistory() {
  history = [JSON.stringify(serializeCanvas())];
  historyIndex = 0;
  updateHistoryButtons();
  scheduleAutosave();
}

function configureObject(object) {
  const scale = Math.max(stageScale, 0.1);
  object.set({
    originX: "left",
    originY: "top",
    cornerColor: BRAND.dark,
    cornerStrokeColor: BRAND.white,
    borderColor: BRAND.dark,
    cornerStyle: "circle",
    transparentCorners: false,
    borderScaleFactor: Math.max(2, 2 / scale),
    cornerSize: 22 / scale,
    touchCornerSize: 48 / scale,
    padding: 4 / scale,
    saiaId: object.saiaId || globalThis.crypto?.randomUUID?.() || `object-${Date.now()}-${Math.random()}`,
  });
  return object;
}

function addAndSelect(object) {
  configureObject(object);
  canvas.add(object);
  canvas.setActiveObject(object);
  canvas.requestRenderAll();
  captureHistory();
  syncSelectionControls();
}

function addText(value = "Tap to edit", options = {}) {
  addAndSelect(new Textbox(value, {
    left: 120,
    top: 760,
    width: 840,
    fontFamily: FONT_FAMILY,
    fontSize: 96,
    fontWeight: 400,
    lineHeight: 1,
    fill: BRAND.dark,
    textAlign: "left",
    editable: true,
    lockScalingFlip: true,
    saiaType: "text",
    ...options,
  }));
}

async function addImage(url, options = {}) {
  try {
    const image = await FabricImage.fromURL(url, { crossOrigin: url.startsWith("data:") ? undefined : "anonymous" });
    const maxWidth = options.maxWidth || 820;
    const maxHeight = options.maxHeight || 1200;
    image.scale(Math.min(maxWidth / image.width, maxHeight / image.height, 1));
    image.set({
      left: (STORY_WIDTH - image.getScaledWidth()) / 2,
      top: (STORY_HEIGHT - image.getScaledHeight()) / 2,
      lockScalingFlip: true,
      saiaType: options.saiaType || "image",
      ...options,
    });
    delete image.maxWidth;
    delete image.maxHeight;
    addAndSelect(image);
  } catch (error) {
    console.error(error);
    announce("That image could not be added. Try a PNG or JPEG.", "error");
  }
}

async function applyTemplate(id, { skipConfirm = false } = {}) {
  if (!skipConfirm && canvas.getObjects().length && !confirm("Replace the current canvas with this template? Your autosaved version will be replaced.")) return;
  const template = getTemplate(id);
  restoring = true;
  canvas.clear();
  canvas.backgroundColor = template.background;
  template.objects.forEach((object) => canvas.add(configureObject(object)));
  canvas.discardActiveObject();
  canvas.requestRenderAll();
  restoring = false;
  resetHistory();
  syncSelectionControls();
  announce(`${TEMPLATES.find((item) => item.id === id)?.name || "Template"} applied.`);
}

async function loadProject(project, { name = project.name, draftId = null } = {}) {
  const normalized = parseProject(project);
  const validationCanvas = new StaticCanvas(undefined, { width: STORY_WIDTH, height: STORY_HEIGHT });
  try {
    await validationCanvas.loadFromJSON(normalized.canvas);
  } finally {
    validationCanvas.dispose();
  }

  restoring = true;
  try {
    canvas.discardActiveObject();
    await canvas.loadFromJSON(normalized.canvas);
    canvas.getObjects().forEach(configureObject);
    canvas.requestRenderAll();
    storyName = cleanName(name);
    currentDraftId = draftId;
    $("#story-name").value = storyName;
    resetHistory();
    syncSelectionControls();
  } finally {
    restoring = false;
  }
}

function objectColorProperty(object) {
  return object.type === "line" ? "stroke" : "fill";
}

function objectLabel(object, index) {
  if (object instanceof Textbox) {
    const preview = String(object.text || "Empty text").replace(/\s+/g, " ").slice(0, 34);
    return `Text ${index + 1}: ${preview}`;
  }
  if (object.saiaType === "logo") return `S.A.I.A. logo ${index + 1}`;
  if (object.saiaType === "image") return `Photo ${index + 1}`;
  return `${object.type || "Shape"} ${index + 1}`;
}

function renderElementList() {
  const active = canvas.getActiveObject();
  const objects = canvas.getObjects();
  const list = $("#element-list");
  if (!objects.length) {
    list.innerHTML = '<p class="empty-state">No elements on the canvas.</p>';
    return;
  }
  list.innerHTML = objects.map((object, index) => `
    <div role="listitem"><button type="button" data-object-index="${index}" aria-pressed="${object === active}">${escapeHtml(objectLabel(object, index))}</button></div>
  `).join("");
}

function syncGeometryControls(active) {
  const controls = $("#geometry-controls");
  controls.hidden = !active;
  if (!active) return;
  $("#object-left").value = Math.round(active.left || 0);
  $("#object-top").value = Math.round(active.top || 0);
  $("#object-width").value = Math.round(active.getScaledWidth());
  $("#object-height").value = Math.round(active.getScaledHeight());
}

function syncSelectionControls() {
  const active = canvas.getActiveObject();
  renderElementList();
  syncGeometryControls(active);
  const controls = $("#object-controls");
  const empty = $("#edit-empty");
  controls.hidden = !active;
  empty.hidden = Boolean(active);
  if (!active) return;

  const isText = active.saiaType === "text" || active instanceof Textbox;
  $("#text-controls").hidden = !isText;
  if (isText) {
    $("#text-value").value = active.text || "";
    $("#font-size").value = Math.round(active.fontSize || 72);
    $("#font-weight").value = String(active.fontWeight || 400);
    $("#line-height").value = active.lineHeight || 1;
    $("#letter-spacing").value = active.charSpacing || 0;
    const italicPressed = active.fontStyle === "italic";
    const uppercasePressed = Boolean(active.saiaUppercase);
    $("#italic").classList.toggle("is-pressed", italicPressed);
    $("#italic").setAttribute("aria-pressed", String(italicPressed));
    $("#uppercase").classList.toggle("is-pressed", uppercasePressed);
    $("#uppercase").setAttribute("aria-pressed", String(uppercasePressed));
    $$('[data-align]').forEach((button) => {
      const pressed = button.dataset.align === active.textAlign;
      button.classList.toggle("is-pressed", pressed);
      button.setAttribute("aria-pressed", String(pressed));
    });
  }

  const color = active[objectColorProperty(active)]?.toUpperCase?.();
  $$("#object-swatches button").forEach((button) => button.classList.toggle("is-selected", button.dataset.color === color));
}

function updateActive(values) {
  const active = canvas.getActiveObject();
  if (!active) return;
  active.set(values);
  if (active instanceof Textbox) active.initDimensions();
  active.setCoords();
  canvas.requestRenderAll();
  syncSelectionControls();
  captureHistory();
}

function updateActiveGeometry() {
  const active = canvas.getActiveObject();
  if (!active) return;
  const desiredWidth = Math.max(1, Number($("#object-width").value));
  const desiredHeight = Math.max(1, Number($("#object-height").value));
  active.set({
    left: Number($("#object-left").value) || 0,
    top: Number($("#object-top").value) || 0,
    scaleX: desiredWidth / Math.max(1, active.width || 1),
    scaleY: desiredHeight / Math.max(1, active.height || 1),
  });
  active.setCoords();
  canvas.requestRenderAll();
  syncSelectionControls();
  captureHistory();
}

function nudgeActive(direction, amount = 10) {
  const active = canvas.getActiveObject();
  if (!active) return;
  const delta = {
    up: [0, -amount], down: [0, amount], left: [-amount, 0], right: [amount, 0],
  }[direction];
  if (!delta) return;
  active.set({ left: (active.left || 0) + delta[0], top: (active.top || 0) + delta[1] });
  active.setCoords();
  canvas.requestRenderAll();
  syncSelectionControls();
  captureHistory();
}

function renderTemplates() {
  $("#template-list").innerHTML = TEMPLATES.map((template, index) => `
    <button class="template-card" data-template="${template.id}">
      <span class="template-number">0${index + 1}</span>
      <span><strong>${template.name}</strong><small>${template.summary}</small></span>
      <span aria-hidden="true">→</span>
    </button>
  `).join("");
}

function swatchMarkup(prefix) {
  return palette.map(([name, color]) => `<button title="${name}" aria-label="${name}" data-${prefix}="${color}" data-color="${color}" style="--swatch:${color}"></button>`).join("");
}

function renderSwatches() {
  $("#background-swatches").innerHTML = swatchMarkup("background");
  $("#object-swatches").innerHTML = swatchMarkup("object-color");
}

function renderDrafts() {
  const drafts = loadDrafts(localStorage);
  const list = $("#draft-list");
  if (!drafts.length) {
    list.innerHTML = '<p class="empty-state draft-empty">No named drafts yet. Your current canvas is still autosaved.</p>';
    return;
  }
  list.innerHTML = drafts.map(({ id, project }) => `
    <article class="draft-card" data-draft="${id}">
      <button class="draft-load"><strong>${escapeHtml(project.name)}</strong><small>${new Date(project.updatedAt).toLocaleString()}</small></button>
      <div><button class="draft-rename" aria-label="Rename ${escapeHtml(project.name)}">Rename</button><button class="draft-delete" aria-label="Delete ${escapeHtml(project.name)}">Delete</button></div>
    </article>
  `).join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function resizeStage() {
  const region = $(".stage-region");
  const wrap = $("#stage-wrap");
  const availableWidth = Math.max(120, region.clientWidth - 32);
  const availableHeight = Math.max(180, region.clientHeight - 36);
  stageScale = Math.max(0.08, Math.min(availableWidth / STORY_WIDTH, availableHeight / STORY_HEIGHT));
  wrap.style.width = `${STORY_WIDTH * stageScale}px`;
  wrap.style.height = `${STORY_HEIGHT * stageScale}px`;
  canvas.setDimensions({ width: STORY_WIDTH * stageScale, height: STORY_HEIGHT * stageScale }, { cssOnly: true });
  canvas.getObjects().forEach(configureObject);
  canvas.calcOffset();
  canvas.requestRenderAll();
}

function refreshFontObjects() {
  canvas.getObjects().forEach((object) => {
    if (object instanceof Textbox) {
      object.dirty = true;
      object.initDimensions();
      object.setCoords();
    }
  });
  canvas.requestRenderAll();
}

async function waitForAktivGrotesk() {
  const faces = FONT_WEIGHTS.map((weight) => ({ weight, style: "normal" }));
  const italicFaces = canvas.getObjects()
    .filter((object) => object instanceof Textbox && object.fontStyle === "italic")
    .map((object) => ({ weight: Number(object.fontWeight) || 400, style: "italic" }));
  return ensureFontFaces(document.fonts, { family: FONT_FAMILY, faces: [...faces, ...italicFaces] });
}

async function downloadPng() {
  const button = $("#download");
  const previous = canvas.getActiveObject();
  button.disabled = true;
  button.textContent = "Preparing…";
  try {
    const fontReady = await waitForAktivGrotesk();
    if (!fontReady) throw new Error("Aktiv Grotesk is unavailable. Connect to the internet, reload the app, and try again.");
    refreshFontObjects();
    canvas.discardActiveObject();
    canvas.requestRenderAll();

    const dataUrl = canvas.toDataURL({ format: "png", quality: 1, multiplier: 1, enableRetinaScaling: false });
    const blob = await (await fetch(dataUrl)).blob();
    const filename = `${cleanName(storyName).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "saia-story"}.png`;
    const file = new File([blob], filename, { type: "image/png", lastModified: Date.now() });
    const shareData = { files: [file], title: "S.A.I.A. Story" };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        announce("Story shared. On iPhone, choose Save Image to add it to Photos.");
      } catch (shareError) {
        if (shareError.name === "AbortError") {
          announce("Save cancelled.");
          return;
        }
        throw shareError;
      }
    } else {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
      announce("PNG downloaded. On a phone, find it in your browser’s Downloads or Files folder.");
    }
  } catch (error) {
    console.error(error);
    announce(error.message || "The story could not be exported.", "error");
    alert(error.message || "The story could not be exported.");
  } finally {
    if (previous) canvas.setActiveObject(previous);
    canvas.requestRenderAll();
    button.disabled = false;
    button.textContent = "Save / Share";
  }
}

function downloadProject() {
  const blob = new Blob([JSON.stringify(currentProject(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${cleanName(storyName).replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.saia-story.json`;
  link.click();
  URL.revokeObjectURL(url);
  announce("Editable project exported.");
}

function installEvents() {
  $$(".tool-tab").forEach((button) => button.addEventListener("click", () => {
    $$(".tool-tab").forEach((tab) => tab.classList.toggle("is-active", tab === button));
    $$(".tool-panel").forEach((panel) => panel.classList.toggle("is-active", panel.id === `panel-${button.dataset.panel}`));
    if (button.dataset.panel === "drafts") renderDrafts();
  }));

  $("#template-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-template]");
    if (button) applyTemplate(button.dataset.template);
  });

  $("#background-swatches").addEventListener("click", (event) => {
    const button = event.target.closest("[data-background]");
    if (!button) return;
    canvas.backgroundColor = button.dataset.background;
    canvas.requestRenderAll();
    captureHistory();
  });

  $("#object-swatches").addEventListener("click", (event) => {
    const button = event.target.closest("[data-object-color]");
    const active = canvas.getActiveObject();
    if (!button || !active) return;
    updateActive({ [objectColorProperty(active)]: button.dataset.objectColor });
  });

  $("#panel-add").addEventListener("click", async (event) => {
    const button = event.target.closest("[data-add]");
    if (!button) return;
    switch (button.dataset.add) {
      case "text": addText(); break;
      case "photo": $("#photo-input").click(); break;
      case "logo": await addImage(FAVICON_URL, { maxWidth: 420, maxHeight: 420, saiaType: "logo" }); break;
      case "meeting": addMeetingDetails(); break;
      case "rect": addAndSelect(new Rect({ left: 250, top: 690, width: 580, height: 420, fill: BRAND.white, rx: 12, ry: 12, saiaType: "shape" })); break;
      case "circle": addAndSelect(new Circle({ left: 330, top: 650, radius: 210, fill: BRAND.white, saiaType: "shape" })); break;
      case "line": addAndSelect(new Line([0, 0, 740, 0], { left: 170, top: 900, originX: "left", originY: "top", stroke: BRAND.dark, strokeWidth: 8, saiaType: "shape" })); break;
    }
  });

  $("#photo-input").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      announce("Preparing photo…");
      const url = await prepareImageFile(file);
      await addImage(url, { saiaType: "image" });
    } catch (error) {
      console.error(error);
      announce(error.message || "That image could not be prepared.", "error");
    } finally {
      event.target.value = "";
    }
  });

  $("#add-meeting-details").addEventListener("click", addMeetingDetails);

  $("#text-value").addEventListener("input", (event) => {
    const active = canvas.getActiveObject();
    const value = active?.saiaUppercase ? event.target.value.toUpperCase() : event.target.value;
    updateActive({ text: value });
  });
  $("#font-size").addEventListener("change", (event) => updateActive({ fontSize: Number(event.target.value) }));
  $("#font-weight").addEventListener("change", (event) => updateActive({ fontWeight: Number(event.target.value) }));
  $("#line-height").addEventListener("change", (event) => updateActive({ lineHeight: Number(event.target.value) }));
  $("#letter-spacing").addEventListener("change", (event) => updateActive({ charSpacing: Number(event.target.value) }));
  $("#italic").addEventListener("click", () => {
    const active = canvas.getActiveObject();
    if (active) updateActive({ fontStyle: active.fontStyle === "italic" ? "normal" : "italic" });
  });
  $("#uppercase").addEventListener("click", () => {
    const active = canvas.getActiveObject();
    if (!active || !(active instanceof Textbox)) return;
    if (active.saiaUppercase) updateActive({ text: active.saiaCaseText || active.text, saiaUppercase: false, saiaCaseText: "" });
    else updateActive({ text: active.text.toUpperCase(), saiaUppercase: true, saiaCaseText: active.text });
  });
  $$("[data-align]").forEach((button) => button.addEventListener("click", () => updateActive({ textAlign: button.dataset.align })));

  $("#element-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-object-index]");
    if (!button) return;
    const object = canvas.getObjects()[Number(button.dataset.objectIndex)];
    if (!object) return;
    canvas.setActiveObject(object);
    canvas.requestRenderAll();
    syncSelectionControls();
  });
  ["#object-left", "#object-top", "#object-width", "#object-height"].forEach((selector) => {
    $(selector).addEventListener("change", updateActiveGeometry);
  });
  $("#geometry-controls").addEventListener("click", (event) => {
    const button = event.target.closest("[data-nudge]");
    if (button) nudgeActive(button.dataset.nudge);
  });

  $("#panel-arrange").addEventListener("click", async (event) => {
    const button = event.target.closest("[data-arrange]");
    const active = canvas.getActiveObject();
    if (!button || !active) { if (button) announce("Select an object first.", "error"); return; }
    switch (button.dataset.arrange) {
      case "forward": canvas.bringObjectForward(active); break;
      case "backward": canvas.sendObjectBackwards(active); break;
      case "center-h": canvas.centerObjectH(active); active.setCoords(); break;
      case "center-v": canvas.centerObjectV(active); active.setCoords(); break;
      case "duplicate": {
        const clone = await active.clone(["saiaType", "saiaUppercase", "saiaCaseText"]);
        clone.set({ left: (active.left || 0) + 36, top: (active.top || 0) + 36 });
        addAndSelect(clone);
        return;
      }
      case "delete": canvas.remove(active); canvas.discardActiveObject(); break;
    }
    canvas.requestRenderAll();
    captureHistory();
    syncSelectionControls();
  });

  $("#undo").addEventListener("click", () => restoreHistory(historyIndex - 1));
  $("#redo").addEventListener("click", () => restoreHistory(historyIndex + 1));
  $("#download").addEventListener("click", downloadPng);

  $("#story-name").addEventListener("input", (event) => { storyName = cleanName(event.target.value); scheduleAutosave(); });
  $("#save-draft").addEventListener("click", () => {
    storyName = cleanName($("#story-name").value);
    try {
      const record = saveDraft(localStorage, currentProject(), currentDraftId || undefined);
      currentDraftId = record.id;
      clearSaveError();
      renderDrafts();
      announce("Draft saved in this browser.");
    } catch (error) {
      console.error("Draft save failed", error);
      showSaveError("This named draft could not be saved because browser storage is full.");
      announce("Draft not saved. Browser storage is full.", "error");
    }
  });
  $("#draft-list").addEventListener("click", async (event) => {
    const card = event.target.closest("[data-draft]");
    if (!card) return;
    const id = card.dataset.draft;
    const draft = loadDrafts(localStorage).find((item) => item.id === id);
    if (!draft) return;
    if (event.target.closest(".draft-delete")) {
      if (confirm(`Delete “${draft.project.name}”?`)) {
        deleteDraft(localStorage, id);
        if (currentDraftId === id) currentDraftId = null;
        renderDrafts();
      }
    } else if (event.target.closest(".draft-rename")) {
      const name = prompt("Rename draft", draft.project.name);
      if (name !== null) {
        try {
          const renamed = renameDraft(localStorage, id, name);
          if (currentDraftId === id && renamed) {
            storyName = renamed.project.name;
            $("#story-name").value = storyName;
          }
          clearSaveError();
          renderDrafts();
        } catch (error) {
          showSaveError("This draft could not be renamed because browser storage is full.");
        }
      }
    } else if (event.target.closest(".draft-load")) {
      if (confirm(`Load “${draft.project.name}” and replace the current canvas?`)) {
        await loadProject(draft.project, { draftId: id });
        announce("Draft loaded.");
      }
    }
  });

  $("#export-project").addEventListener("click", downloadProject);
  $("#import-project").addEventListener("click", () => $("#project-input").click());
  $("#project-input").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const project = parseProject(await file.text());
      if (confirm(`Import “${project.name}” and replace the current canvas?`)) {
        await loadProject(project);
        currentDraftId = null;
        announce("Editable project imported.");
      }
    } catch (error) { announce(error.message, "error"); }
    event.target.value = "";
  });

  canvas.on("selection:created", syncSelectionControls);
  canvas.on("selection:updated", syncSelectionControls);
  canvas.on("selection:cleared", syncSelectionControls);
  canvas.on("object:modified", captureHistory);
  canvas.on("text:changed", () => { syncSelectionControls(); scheduleAutosave(); });
  canvas.on("text:editing:exited", captureHistory);

  window.addEventListener("resize", resizeStage);
  window.addEventListener("orientationchange", () => setTimeout(resizeStage, 100));
  window.addEventListener("keydown", (event) => {
    const active = canvas.getActiveObject();
    const editingDomField = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);
    const editingCanvasText = active instanceof Textbox && active.isEditing;
    if (editingDomField || editingCanvasText) return;

    if ((event.key === "Delete" || event.key === "Backspace") && active) {
      event.preventDefault();
      canvas.remove(active); canvas.discardActiveObject(); canvas.requestRenderAll(); captureHistory(); syncSelectionControls();
      return;
    }
    const arrowDirections = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
    if (active && arrowDirections[event.key]) {
      event.preventDefault();
      nudgeActive(arrowDirections[event.key], event.shiftKey ? 10 : 1);
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
      event.preventDefault();
      restoreHistory(event.shiftKey ? historyIndex + 1 : historyIndex - 1);
    }
  });
}

function addMeetingDetails() {
  const number = $("#meeting-number").value.padStart(3, "0").slice(-3);
  const date = $("#meeting-date").value || "WEDNESDAY · 6–8 PM";
  const location = $("#meeting-location").value || "SMOOTHIE VORTEX";
  const objects = [
    new Textbox(`MEETING ${number}`, { left: 96, top: 260, width: 888, fontFamily: FONT_FAMILY, fontSize: 118, fontWeight: 600, fill: BRAND.dark, lineHeight: 1, saiaType: "text" }),
    new Textbox(date, { left: 96, top: 450, width: 888, fontFamily: FONT_FAMILY, fontSize: 58, fontWeight: 400, fill: BRAND.dark, charSpacing: 35, saiaType: "text" }),
    new Textbox(location, { left: 96, top: 570, width: 888, fontFamily: FONT_FAMILY, fontSize: 76, fontWeight: 300, fill: BRAND.dark, saiaType: "text" }),
  ];
  objects.forEach((object) => canvas.add(configureObject(object)));
  canvas.setActiveObject(objects[0]);
  canvas.requestRenderAll();
  captureHistory();
  syncSelectionControls();
}

async function initialize() {
  renderTemplates();
  renderSwatches();
  renderDrafts();
  installEvents();
  resizeStage();

  try { await waitForAktivGrotesk(); }
  catch (error) { console.warn("Aktiv Grotesk will retry before export.", error); }

  const autosave = loadAutosave(localStorage);
  if (autosave) {
    try {
      await loadProject(autosave);
      announce("Autosaved story restored.");
    } catch (error) {
      console.warn("Could not restore autosave", error);
      await applyTemplate("blank", { skipConfirm: true });
    }
  } else {
    await applyTemplate("blank", { skipConfirm: true });
  }
  requestAnimationFrame(resizeStage);
  document.fonts?.ready.then(refreshFontObjects);
}

initialize();
