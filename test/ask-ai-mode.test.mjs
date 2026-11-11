import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const skill = readFileSync(new URL("../SKILL.md", import.meta.url), "utf8");

test("sparkle buttons default to copy, with a runtime bridge switch", () => {
  assert.match(html, /var USE_INFERENCE_BRIDGE = false/);
  assert.match(html, /AI_MODE_STORAGE_KEY = "gm-ai-mode"/);
  assert.match(html, /Copy AI prompt/);
  assert.match(html, /Inference Bridge/);
  assert.match(html, /URLSearchParams\(window\.location\.search\)\.get\("ai"\)/);
  assert.match(html, /value === "bridge"/);
  assert.match(html, /value === "copy"/);
  assert.match(html, /navigator\.clipboard\.writeText/);
  assert.match(html, /document\.execCommand\("copy"\)/);
  assert.match(html, /function offerPromptCopy\(/);
  assert.match(html, /ai-copy-fallback/);
  assert.equal((html.match(/\bSYSTEM\b/g) || []).length, 2);
  assert.equal((html.match(/seedHistory/g) || []).length, 3);
  assert.equal((html.match(/runInference/g) || []).length, 4);
});

test("SKILL.md documents copy mode, the flag, and the toggle", () => {
  assert.match(skill, /USE_INFERENCE_BRIDGE/);
  assert.match(skill, /gm-ai-mode/);
  assert.match(skill, /\?ai=copy/);
  assert.match(skill, /\?ai=bridge/);
  assert.match(skill, /Copy prompt/);
  assert.match(skill, /Inference Bridge/);
});
