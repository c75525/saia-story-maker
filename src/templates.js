import { Circle, Line, Rect, Textbox } from "fabric";

export const STORY_WIDTH = 1080;
export const STORY_HEIGHT = 1920;
export const SAFE_MARGIN = 96;

export const BRAND = Object.freeze({
  lavender: "#E1DEE8",
  light: "#F2F2F2",
  gray: "#848484",
  white: "#FFFFFF",
  dark: "#2A2A2A",
});

export const TEMPLATES = Object.freeze([
  { id: "meeting", name: "Meeting announcement", summary: "Number, date, time, and location" },
  { id: "research", name: "Research / resource", summary: "Share a link, reference, or finding" },
  { id: "opportunity", name: "Opportunity", summary: "Deadline-led open call or grant" },
  { id: "quote", name: "Discussion prompt", summary: "A quote or question for the club" },
  { id: "blank", name: "Blank create mode", summary: "Start with a brand color" },
]);

const commonText = {
  fontFamily: "aktiv-grotesk",
  fill: BRAND.dark,
  editable: true,
  splitByGrapheme: false,
  lockScalingFlip: true,
};

function text(value, options = {}) {
  return new Textbox(value, {
    ...commonText,
    left: SAFE_MARGIN,
    top: SAFE_MARGIN,
    width: STORY_WIDTH - SAFE_MARGIN * 2,
    fontSize: 72,
    lineHeight: 1,
    fontWeight: 400,
    ...options,
    saiaType: "text",
  });
}

function shape(ShapeClass, options) {
  return new ShapeClass({ ...options, saiaType: "shape", lockScalingFlip: true });
}

function line([x1, y1, x2, y2], options) {
  return new Line([0, 0, x2 - x1, y2 - y1], {
    left: x1,
    top: y1,
    originX: "left",
    originY: "top",
    ...options,
    saiaType: "shape",
    lockScalingFlip: true,
  });
}

function wordmark(fill = BRAND.dark) {
  return text("S.A.I.A.", {
    left: SAFE_MARGIN,
    top: STORY_HEIGHT - 155,
    width: 360,
    fontSize: 38,
    fontWeight: 600,
    charSpacing: 80,
    fill,
  });
}

function meetingTemplate() {
  return {
    background: BRAND.lavender,
    objects: [
      shape(Rect, { left: 0, top: 0, width: 1080, height: 260, fill: BRAND.white }),
      text("MEETING", { top: 84, fontSize: 48, fontWeight: 500, charSpacing: 150, fill: BRAND.gray }),
      text("031", { top: 298, left: 72, width: 936, fontSize: 360, fontWeight: 600, lineHeight: 0.85 }),
      line([96, 770, 984, 770], { stroke: BRAND.dark, strokeWidth: 5 }),
      text("WEDNESDAY", { top: 835, fontSize: 52, fontWeight: 500, charSpacing: 80 }),
      text("NOVEMBER 25\n6–8 PM", { top: 920, fontSize: 108, fontWeight: 300, lineHeight: 0.95 }),
      shape(Circle, { left: 768, top: 1255, radius: 160, fill: BRAND.white, opacity: 0.8 }),
      text("SMOOTHIE\nVORTEX", { left: 96, top: 1320, width: 790, fontSize: 78, fontWeight: 500, lineHeight: 0.9 }),
      text("610 E ROOSEVELT ST · PHOENIX", { top: 1530, width: 770, fontSize: 32, fontWeight: 400, charSpacing: 30 }),
      wordmark(),
    ],
  };
}

function researchTemplate() {
  return {
    background: BRAND.dark,
    objects: [
      shape(Rect, { left: 0, top: 0, width: 230, height: 1920, fill: BRAND.lavender }),
      shape(Circle, { left: 37, top: 110, radius: 78, fill: BRAND.dark }),
      text("RESEARCH\nCHEMICALS", { left: 300, top: 130, width: 680, fontSize: 76, fontWeight: 500, fill: BRAND.white, lineHeight: 0.9 }),
      line([300, 390, 984, 390], { stroke: BRAND.lavender, strokeWidth: 4 }),
      text("A resource title goes here", { left: 300, top: 520, width: 680, fontSize: 112, fontWeight: 300, fill: BRAND.white, lineHeight: 0.95 }),
      text("Add a short note about why this matters to internet culture, art, archives, or the group’s current research.", { left: 300, top: 1040, width: 650, fontSize: 52, fontWeight: 400, fill: BRAND.lavender, lineHeight: 1.15 }),
      text("SOURCE / AUTHOR / YEAR", { left: 300, top: 1570, width: 680, fontSize: 30, fontWeight: 500, charSpacing: 80, fill: BRAND.gray }),
      wordmark(BRAND.white),
    ],
  };
}

function opportunityTemplate() {
  return {
    background: BRAND.gray,
    objects: [
      shape(Circle, { left: 610, top: -140, radius: 350, fill: BRAND.lavender }),
      text("OPEN\nCALL", { top: 120, fontSize: 188, fontWeight: 600, fill: BRAND.white, lineHeight: 0.78 }),
      shape(Rect, { left: 96, top: 670, width: 888, height: 8, fill: BRAND.white }),
      text("Opportunity name", { top: 770, width: 840, fontSize: 102, fontWeight: 400, fill: BRAND.white, lineHeight: 0.95 }),
      text("For artists, researchers, and experimental technologists", { top: 1100, width: 800, fontSize: 48, fontWeight: 300, fill: BRAND.light, lineHeight: 1.12 }),
      shape(Rect, { left: 96, top: 1435, width: 710, height: 180, rx: 90, ry: 90, fill: BRAND.dark }),
      text("DUE  DEC 08", { left: 155, top: 1482, width: 600, fontSize: 58, fontWeight: 500, charSpacing: 35, fill: BRAND.white }),
      wordmark(BRAND.white),
    ],
  };
}

function quoteTemplate() {
  return {
    background: BRAND.light,
    objects: [
      shape(Circle, { left: 710, top: 100, radius: 135, fill: BRAND.lavender }),
      text("“", { left: 100, top: 30, width: 420, fontSize: 390, fontWeight: 300, fill: BRAND.gray }),
      text("What changes when the internet becomes an archaeological site?", { left: 96, top: 440, width: 888, fontSize: 116, fontWeight: 400, lineHeight: 0.98 }),
      line([96, 1350, 984, 1350], { stroke: BRAND.gray, strokeWidth: 3 }),
      text("DISCUSSION PROMPT", { top: 1420, fontSize: 38, fontWeight: 500, charSpacing: 130, fill: BRAND.gray }),
      text("Bring an artifact, link, or question.", { top: 1505, fontSize: 54, fontWeight: 300, fill: BRAND.dark }),
      wordmark(),
    ],
  };
}

function blankTemplate() {
  return {
    background: BRAND.lavender,
    objects: [
      text("Double-tap text to edit", { left: 140, top: 760, width: 800, fontSize: 104, fontWeight: 400, textAlign: "center", fill: BRAND.dark }),
      wordmark(),
    ],
  };
}

export function getTemplate(id) {
  switch (id) {
    case "meeting": return meetingTemplate();
    case "research": return researchTemplate();
    case "opportunity": return opportunityTemplate();
    case "quote": return quoteTemplate();
    case "blank": return blankTemplate();
    default: throw new Error(`Unknown template: ${id}`);
  }
}
