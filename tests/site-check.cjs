const fs=require("node:fs");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const files=["site.js","admin.js","site.config.js"];
for(const file of files)new vm.Script(fs.readFileSync(file,"utf8"),{filename:file});
const context={window:{}};vm.runInNewContext(fs.readFileSync("site.config.js","utf8"),context);
const cfg=context.window.SITE_CONFIG;
assert(cfg&&cfg.brand&&cfg.hero&&cfg.features);
assert(Array.isArray(cfg.services)&&cfg.services.length>0);
assert(Array.isArray(cfg.portfolio)&&Array.isArray(cfg.albums));
for(const album of cfg.albums){assert.equal(typeof album.title,"string");assert(Array.isArray(album.photos));}
const html=fs.readFileSync("index.html","utf8");
const admin=fs.readFileSync("admin.html","utf8");
for(const id of ["album-dialog","album-photos","photo-dialog","photo-large","album-close","photo-close","albums-grid","request-form"])assert(html.includes('id="'+id+'"'),"Falta elemento "+id);
for(const id of ["album-editor","add-album","save-draft","load-draft","clear-draft","servicesJson","portfolioJson"])assert(admin.includes('id="'+id+'"'),"Falta campo "+id);
for(const path of ["styles.css","admin.css"])assert(fs.existsSync(path));
console.log("Verificações estáticas concluídas.");
