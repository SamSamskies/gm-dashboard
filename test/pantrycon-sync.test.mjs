import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { nationalFields, presentAssessment } from "../pantrycon-reader.mjs";
import {
  ASSESSMENT_URLS,
  bootDashboard,
  localContextNote,
  renderNationalCard,
} from "../pantrycon-sync.js";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

function fixture(overrides = {}) {
  const base = {
    schemaVersion: 1,
    instrument: "PANTRYCON",
    level: 4,
    reviewedAt: "2026-11-06T20:12:00Z",
    staleAfterHours: 36,
    scope: { geography: "United States households", weighting: "national" },
    headline: "Top Off the Pantry",
    summary: "Elevated background risk. No panic buying.",
    rationale: "Shared national rationale for the household card.",
    supplyWindow: "About 2 weeks of food and water",
    disclaimer: "Not a government alert.",
    overrides: "Local alerts always override.",
    evidence: [
      {
        id: "stocks",
        factor: "energy",
        title: "Distillate stocks",
        status: "confirmed",
        summary: "Published national stocks.",
        source: { href: "https://www.eia.gov/petroleum/supply/weekly/", label: "EIA weekly report" },
      },
    ],
    factors: { raise: ["A verified multi-region outage."], lower: ["Stocks rebuild without a distribution failure."] },
    levels: [5, 4, 3, 2, 1].map((level) => ({
      level,
      name: "Level " + level,
      window: "window",
      means: "means",
      doesNotMean: "does not mean",
    })),
    checklist: { intro: "Rotate what you will use.", groups: [{ id: "food", title: "Food", items: ["About 14 days"] }] },
    methodology: "Human review. Not a live feed.",
    limitations: ["Not a live feed."],
    sources: [{ href: "https://www.ready.gov/kit", label: "Ready.gov", usedFor: "Basic kit" }],
    links: { publicSite: "" },
  };
  return Object.assign(base, overrides);
}

function memoryStore(seed) {
  const data = new Map(seed || []);
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, String(value)); },
  };
}

function el(doc, tag) {
  const node = {
    tag,
    id: "",
    className: "",
    textContent: "",
    hidden: false,
    attrs: {},
    children: [],
    ownerDocument: doc,
    parent: null,
    get firstChild() { return this.children[0] || null; },
    append(...kids) { kids.forEach((kid) => this.appendChild(kid)); },
    appendChild(kid) {
      kid.parent = this;
      this.children.push(kid);
      return kid;
    },
    insertBefore(kid, before) {
      kid.parent = this;
      const index = this.children.indexOf(before);
      if (index < 0) this.children.push(kid);
      else this.children.splice(index, 0, kid);
      return kid;
    },
    after(kid) {
      if (!this.parent) return;
      const index = this.parent.children.indexOf(this);
      kid.parent = this.parent;
      this.parent.children.splice(index + 1, 0, kid);
    },
    before(kid) {
      if (!this.parent) return;
      this.parent.insertBefore(kid, this);
    },
    remove() {
      if (!this.parent) return;
      this.parent.children = this.parent.children.filter((child) => child !== this);
      this.parent = null;
    },
    setAttribute(name, value) { this.attrs[name] = String(value); },
    getAttribute(name) { return Object.prototype.hasOwnProperty.call(this.attrs, name) ? this.attrs[name] : null; },
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; },
    querySelectorAll(selector) {
      const all = [];
      const walk = (node) => {
        node.children.forEach((child) => {
          if (matches(child, selector)) all.push(child);
          walk(child);
        });
      };
      walk(this);
      return all;
    },
  };
  return node;
}

function matches(node, selector) {
  if (selector === "article.pantry") return node.tag === "article" && node.className.split(/\s+/).includes("pantry");
  if (selector === ".section-head") return node.className.split(/\s+/).includes("section-head");
  return false;
}

function makeDoc(localLevel) {
  const doc = {
    nodes: new Map(),
    createElement(tag) { return el(doc, tag); },
    getElementById(id) { return this.nodes.get(id) || null; },
  };
  const section = el(doc, "section");
  section.id = "pantry-section";
  const head = el(doc, "div");
  head.className = "section-head";
  head.parent = section;
  const baked = el(doc, "article");
  baked.className = "card pantry";
  baked.attrs["data-level"] = String(localLevel);
  baked.textContent = "Local board card stays in place.";
  baked.parent = section;
  section.children.push(head, baked);
  doc.nodes.set("pantry-section", section);
  const track = (node) => {
    const original = node.setAttribute.bind(node);
    node.setAttribute = (name, value) => {
      original(name, value);
      if (name === "id") doc.nodes.set(value, node);
    };
  };
  const create = doc.createElement.bind(doc);
  doc.createElement = (tag) => {
    const node = create(tag);
    track(node);
    const assign = (prop) => {
      let current = "";
      Object.defineProperty(node, prop, {
        configurable: true,
        get() { return current; },
        set(value) {
          current = value;
          if (prop === "id" && value) doc.nodes.set(value, node);
        },
      });
    };
    assign("id");
    return node;
  };
  return { doc, section, baked };
}

function textOf(node) {
  return [node.textContent || ""].concat(node.children.map(textOf)).join(" ");
}

test("dashboard invariants survive the national hook", () => {
  const ids = [
    "wx-temp", "wx-cond-main", "wx-cond-sub", "wx-cond-obs", "wx-high", "wx-high-s", "wx-low",
    "wx-hi", "wx-rain", "wx-rain-s", "wx-adv-until", "wx-hourly-cap", "wx-hourly-row", "wx-now-use",
    "wx-live", "pm-live", "pm-grid", "btc-price", "btc-chg", "btc-meta", "btc-series", "dow-session",
    "dow-price", "dow-chg", "dow-meta", "dow-series", "pantry-label", "imp-label", "care-label",
    "pm-label", "watch-label",
  ];
  ids.forEach((id) => assert.match(html, new RegExp("id=\"" + id + "\"")));
  const order = ["wx-label", "mkt-label", "pantry-label", "imp-label", "care-label", "pm-label", "watch-label"]
    .map((id) => html.indexOf("id=\"" + id + "\""));
  assert.deepEqual(order, order.slice().sort((a, b) => a - b));
  assert.equal(html.includes("nostr-label"), false);
  assert.equal(html.includes("nav class=\"jump\""), false);
  assert.equal((html.match(/\bSYSTEM\b/g) || []).length, 2);
  assert.equal((html.match(/seedHistory/g) || []).length, 3);
  assert.equal((html.match(/runInference/g) || []).length, 4);
  assert.match(html, /"o":\d/);
  assert.match(html, /src="\/pantrycon-sync\.js"/);
  assert.match(html, /Household readiness/);
});

test("the national card and the shared reader use one assessment", async () => {
  const data = fixture();
  const now = Date.parse(data.reviewedAt);
  let fetched = "";
  const { doc, baked } = makeDoc(3);
  const result = await bootDashboard(doc, {
    fetchImpl: async (url) => {
      fetched = url;
      return { ok: true, status: 200, json: async () => data };
    },
    storage: memoryStore(),
    now,
  });
  assert.equal(fetched, ASSESSMENT_URLS[0]);
  const fields = nationalFields(presentAssessment(data, { now }));
  assert.equal(result.view.level, 4);
  assert.equal(result.view.rationale, data.rationale);
  assert.match(textOf(result.card), new RegExp(fields.badge));
  assert.match(textOf(result.card), new RegExp(fields.rationale));
  assert.match(textOf(result.card), /Reviewed/);
  assert.match(result.note.textContent, /level 3/);
  assert.match(result.note.textContent, /level 4/);
  assert.match(baked.textContent, /Local board card stays/);
  assert.equal(doc.getElementById("pantrycon-national"), result.card);
});

test("stale data stays visible with the review time", () => {
  const data = fixture();
  const now = Date.parse(data.reviewedAt) + 36 * 60 * 60 * 1000 + 5;
  const view = presentAssessment(data, { now });
  const card = renderNationalCard(makeDoc(4).doc, view);
  assert.equal(view.mode, "stale");
  assert.equal(view.level, 4);
  assert.equal(view.reviewedAt, data.reviewedAt);
  assert.match(textOf(card), /not a live feed/);
  assert.match(textOf(card), /PANTRYCON 4/);
});

test("a fetch error does not invent a level, and a saved copy keeps its review time", async () => {
  const missed = await bootDashboard(makeDoc(4).doc, {
    fetchImpl: async () => { throw new Error("down"); },
    storage: memoryStore(),
    now: Date.parse("2026-11-06T20:12:00Z"),
  });
  assert.equal(missed.view.mode, "error");
  assert.equal(missed.view.level, null);
  assert.match(textOf(missed.card), /National assessment unavailable/);
  assert.match(textOf(missed.card), /No level is shown/);
  assert.equal(localContextNote(null, 4).includes("level 4"), false);

  const saved = fixture();
  const storage = memoryStore([
    ["pantrycon-assessment-v1", JSON.stringify({ assessment: saved })],
  ]);
  const cached = await bootDashboard(makeDoc(4).doc, {
    fetchImpl: async () => ({ ok: false, status: 502, json: async () => ({}) }),
    storage,
    now: Date.parse(saved.reviewedAt),
  });
  assert.equal(cached.view.mode, "cached-error");
  assert.equal(cached.view.level, 4);
  assert.equal(cached.view.reviewedAt, saved.reviewedAt);
  assert.match(cached.view.warning, /could not be refreshed/);
  assert.match(textOf(cached.card), /PANTRYCON 4/);
});

test("new dashboard files do not copy a private pantry note", () => {
  const sync = readFileSync(new URL("../pantrycon-sync.js", import.meta.url), "utf8");
  const reader = readFileSync(new URL("../pantrycon-reader.mjs", import.meta.url), "utf8");
  [/austin/i, /ercot/i, /already stocked/i, /gmail/i, /\bpassword\b/i].forEach((pattern) => {
    assert.equal(pattern.test(sync), false);
    assert.equal(pattern.test(reader), false);
  });
});
