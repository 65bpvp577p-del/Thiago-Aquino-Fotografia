const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");

// Validate the files actually used by the current published site.
// Older tests referenced album-dialog/admin.html from a retired prototype.
for (const file of ["site.js", "admin.js", "site.config.js", "painel.js"]) {
  if (fs.existsSync(file)) new vm.Script(fs.readFileSync(file, "utf8"), { filename: file });
}
const context = { window: {} };
vm.runInNewContext(fs.readFileSync("site.config.js", "utf8"), context);
const cfg = context.window.SITE_CONFIG;
assert(cfg && cfg.brand && cfg.hero && cfg.features);
assert(Array.isArray(cfg.services) && cfg.services.length > 0);
assert(Array.isArray(cfg.portfolio) && Array.isArray(cfg.albums));
for (const album of cfg.albums) {
  assert.equal(typeof album.title, "string");
  assert(Array.isArray(album.photos));
}
const html = fs.readFileSync("index.html", "utf8");
for (const id of ["hero-media", "filters", "masonry", "lightbox", "large", "close", "prev", "next", "zoom", "count", "contact"]) {
  assert(html.includes('id="' + id + '"'), "Falta elemento " + id);
}
assert(fs.existsSync("painel.html"), "Falta painel.html");
assert(fs.existsSync("painel.css"), "Falta painel.css");
console.log("Verificações estáticas concluídas.");
