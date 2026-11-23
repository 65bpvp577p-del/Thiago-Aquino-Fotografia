#!/usr/bin/env node
// Exporta dados do site atual para um JSON portável, sem dependências externas.
// Uso: node scripts/exportar-migracao.cjs [arquivo-de-saida]
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const output = process.argv[2] || "migracao-export.json";
const source = fs.readFileSync("site.config.js", "utf8");
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox, { filename: "site.config.js", timeout: 1000 });
const cfg = JSON.parse(JSON.stringify(sandbox.window.SITE_CONFIG));
if (!cfg || !Array.isArray(cfg.albums)) throw new Error("Configuração de álbuns inválida");
const refs = new Set();
const add = url => { if (typeof url === "string" && url.trim()) refs.add(url.trim()); };
add(cfg.hero?.imageUrl);
for (const album of cfg.albums) {
  add(album.imageUrl);
  for (const photo of album.photos || []) add(photo.imageUrl);
}
for (const item of cfg.portfolio || []) add(item.imageUrl);
const assets = [...refs].map(url => {
  const relative = url.replace(/^\.\//, "");
  const local = !/^(?:https?:)?\/\//i.test(url) && !relative.startsWith("/");
  const exists = local && !relative.split("/").includes("..") && fs.existsSync(path.resolve(relative));
  return { url, local, exists: local ? exists : null };
});
const payload = {
  format: "thiago-aquino-fotografia-export-v1",
  source: "site.config.js",
  site: cfg,
  assets,
  summary: {
    albums: cfg.albums.length,
    photoReferences: cfg.albums.reduce((n, a) => n + (a.photos || []).length, 0),
    uniqueAssets: assets.length,
    missingLocalAssets: assets.filter(a => a.local && !a.exists).map(a => a.url)
  }
};
fs.writeFileSync(output, JSON.stringify(payload, null, 2) + "\n");
console.log(JSON.stringify(payload.summary, null, 2));
console.log("Exportação criada em " + output);
if (payload.summary.missingLocalAssets.length) console.warn("Atenção: há imagens locais ausentes; não importar antes de corrigir.");
