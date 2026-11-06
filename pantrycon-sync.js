import {
  loadSharedView,
  nationalFields,
  safeHref,
} from "./pantrycon-reader.mjs";

export const ASSESSMENT_URLS = [
  "https://raw.githubusercontent.com/SamSamskies/pantrycon/main/assessment.json",
];

export function localContextNote(nationalLevel, localLevel) {
  const base =
    "Local board context. The card below is this board's own note. It may describe one place. It is separate from the national level. A local evacuation, boil-water notice, or other official local alert overrides both.";
  if (nationalLevel && localLevel && Number(nationalLevel) !== Number(localLevel)) {
    return base + " This board card is level " + localLevel + ". The national snapshot is level " + nationalLevel + ".";
  }
  return base;
}

export function renderNationalCard(doc, view) {
  const fields = nationalFields(view);
  const article = doc.createElement("article");
  article.className = "card pantry";
  article.id = "pantrycon-national";
  if (fields.showLevel) article.setAttribute("data-level", fields.level);
  article.setAttribute("aria-label", "National PANTRYCON assessment for U.S. households");

  const head = doc.createElement("div");
  head.className = "pantry-head item-top";
  head.append(
    span(doc, "pantry-badge", fields.badge),
    span(doc, "pantry-headline", fields.headline),
    span(doc, "pantry-sub", fields.sub)
  );

  const rationale = doc.createElement("p");
  rationale.className = "pantry-rationale";
  rationale.textContent = fields.rationale;
  article.append(head, rationale);

  if (fields.warning) {
    const warning = doc.createElement("p");
    warning.className = "pantry-sub";
    warning.setAttribute("role", "status");
    warning.textContent = fields.warning;
    article.append(warning);
  }

  const links = doc.createElement("div");
  links.className = "sources";
  const seen = new Set();
  (view.evidence || []).forEach((item) => {
    if (!item || item.status !== "confirmed" || !item.source) return;
    const href = safeHref(item.source.href);
    if (!href || href.startsWith("/") || seen.has(href) || seen.size >= 3) return;
    seen.add(href);
    const link = doc.createElement("a");
    link.href = href;
    link.textContent = item.source.label;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    links.append(link);
  });
  if (view.publicSite) {
    const link = doc.createElement("a");
    link.href = view.publicSite;
    link.textContent = "Full national assessment";
    links.append(link);
  }
  if (links.children && links.children.length) article.append(links);
  return article;
}

function span(doc, className, value) {
  const node = doc.createElement("span");
  node.className = className;
  node.textContent = value;
  return node;
}

export async function bootDashboard(doc, deps) {
  const section = doc.getElementById("pantry-section");
  if (!section) return null;
  const view = await loadSharedView({
    fetchImpl: deps.fetchImpl,
    urls: ASSESSMENT_URLS,
    storage: deps.storage,
    now: deps.now,
  });
  const previous = doc.getElementById("pantrycon-national");
  if (previous && previous.remove) previous.remove();
  const card = renderNationalCard(doc, view);
  const head = section.querySelector(".section-head");
  if (head && head.after) head.after(card);
  else section.insertBefore(card, section.firstChild);

  const baked = Array.from(section.querySelectorAll("article.pantry")).find((node) => node.id !== "pantrycon-national");
  const localLevel = baked ? Number(baked.getAttribute("data-level")) : null;
  let note = doc.getElementById("pantrycon-local-note");
  if (!note) {
    note = doc.createElement("p");
    note.id = "pantrycon-local-note";
    note.className = "pantry-scale-hint";
    if (baked && baked.before) baked.before(note);
    else section.appendChild(note);
  }
  note.textContent = localContextNote(view.showLevel ? view.level : null, Number.isInteger(localLevel) ? localLevel : null);
  return { view, card, note };
}

if (typeof document !== "undefined") {
  bootDashboard(document, {
    fetchImpl: fetch,
    storage: window.localStorage,
    now: Date.now(),
  }).catch(function () {});
}
