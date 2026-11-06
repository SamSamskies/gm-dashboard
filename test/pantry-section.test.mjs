import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const repoText = ["../AGENTS.md", "../SKILL.md"].map((p) => readFileSync(new URL(p, import.meta.url), "utf8")).join("\n");

test("the original PANTRYCON section survives exactly once", () => {
  assert.equal((html.match(/id="pantry-section"/g) || []).length, 1);
  assert.equal((html.match(/id="pantry-label"/g) || []).length, 1);
  assert.equal((html.match(/<article class="card pantry"/g) || []).length, 1);
  assert.equal((html.match(/class="pantry-meter"/g) || []).length, 1);
  assert.equal((html.match(/class="pantry-step l[1-5]/g) || []).length, 5);
  assert.match(html, /Household readiness · PANTRYCON/);
});

test("no national PANTRYCON card, mount, or script is present", () => {
  [
    /pantrycon-national/,
    /pantrycon-local-note/,
    /pantrycon-sync/,
    /pantrycon-reader/,
    /raw\.githubusercontent\.com\/SamSamskies\/pantrycon/,
    /type="module"/,
  ].forEach((pattern) => assert.equal(pattern.test(html), false, String(pattern)));
  assert.equal(existsSync(new URL("../pantrycon-sync.js", import.meta.url)), false);
  assert.equal(existsSync(new URL("../pantrycon-reader.mjs", import.meta.url)), false);
  assert.equal(/pantrycon-sync|pantrycon-reader/.test(repoText), false);
});

test("dashboard invariants are intact", () => {
  [
    "wx-temp", "wx-cond-main", "wx-cond-sub", "wx-cond-obs", "wx-high", "wx-high-s", "wx-low",
    "wx-hi", "wx-rain", "wx-rain-s", "wx-adv-until", "wx-hourly-cap", "wx-hourly-row", "wx-now-use",
    "wx-live", "pm-live", "pm-grid", "btc-price", "btc-chg", "btc-meta", "btc-series", "dow-session",
    "dow-price", "dow-chg", "dow-meta", "dow-series", "wx-label", "mkt-label", "imp-label",
    "care-label", "pm-label", "watch-label",
  ].forEach((id) => assert.match(html, new RegExp("id=\"" + id + "\""), id));
  const order = ["wx-label", "mkt-label", "pantry-label", "imp-label", "care-label", "pm-label", "watch-label"]
    .map((id) => html.indexOf("id=\"" + id + "\""));
  assert.deepEqual(order, order.slice().sort((a, b) => a - b));
  assert.equal(html.includes("nostr-label"), false);
  assert.equal(html.includes("nav class=\"jump\""), false);
  assert.equal((html.match(/\bSYSTEM\b/g) || []).length, 2);
  assert.equal((html.match(/seedHistory/g) || []).length, 3);
  assert.equal((html.match(/runInference/g) || []).length, 4);
  assert.match(html, /\/api\/dow/);
  assert.match(html, /gamma-api\.polymarket\.com/);
  assert.match(html, /"o":\d/);
  assert.equal((html.match(/<!-- gm-media:start -->/g) || []).length, 1);
  assert.equal((html.match(/<!-- gm-media:end -->/g) || []).length, 1);
  assert.match(html, /<footer class="foot">[\s\S]*<\/footer>/);
});
