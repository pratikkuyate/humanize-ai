import { useCases } from "../lib/useCases.js";
import { aiModels } from "../lib/aiModels.js";

const HOST = "simplyhumanize.com";
const KEY = "c582fa0fc6164535be121b054a3b0ab8"; // matches public/<KEY>.txt
const BASE = `https://${HOST}`;

const staticPaths = [
  "/",
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms",
  "/use-cases",
  "/tools",
  "/tools/ai-content-detector",
];

const urlList = [
  ...staticPaths,
  ...useCases.map((uc) => `/ai-humanizer-for/${uc.slug}`),
  ...aiModels.map((m) => m.urlPath),
].map((p) => `${BASE}${p}`);

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `${BASE}/${KEY}.txt`,
    urlList,
  }),
});

console.log(`Submitted ${urlList.length} URLs → ${res.status} ${res.statusText}`);
const text = await res.text();
if (text) console.log(text);
