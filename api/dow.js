export const config = { runtime: "edge" };

var YAHOO =
  "https://query1.finance.yahoo.com/v8/finance/chart/%5EDJI?interval=5m&range=1d&includePrePost=false";

function corsHeaders(req) {
  var origin = (req && req.headers && req.headers.get("origin")) || "";
  var allow = "*";
  if (
    origin === "https://samsamskies.github.io" ||
    /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin) ||
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
  ) {
    allow = origin;
  }
  return {
    "access-control-allow-origin": allow,
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "content-type",
    vary: "Origin",
  };
}

export default async function handler(req) {
  var cors = corsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }
  if (req.method && req.method !== "GET") {
    return new Response("method not allowed", { status: 405, headers: cors });
  }
  try {
    var r = await fetch(YAHOO, {
      headers: {
        accept: "application/json",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      cache: "no-store",
    });
    var body = await r.text();
    var headers = Object.assign({}, cors, {
      "content-type": r.headers.get("content-type") || "application/json; charset=utf-8",
      "cache-control": "public, max-age=15, s-maxage=15",
    });
    return new Response(body, { status: r.status, headers: headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: "dow proxy failed" }), {
      status: 502,
      headers: Object.assign({}, cors, { "content-type": "application/json" }),
    });
  }
}
