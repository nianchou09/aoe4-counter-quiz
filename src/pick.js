// choose one model image per (unit, civ) and download it
const fs = require("fs"), path = require("path");
eval(fs.readFileSync("data.js", "utf8") + ";global.D=DATA");
const M = require("./models.json");
const TOK = { ab: ["ABB", "ABBASID"], ay: ["AYY", "AYYUBID"], by: ["BYZ"], ch: ["CHI", "CHINESE"], de: ["DEL", "DELHI"], en: ["ENG", "ENGLISH"], fr: ["FRE", "FRA", "FRENCH"], gol: ["GH", "GOL"], hr: ["HRE"], hl: ["HOL", "LAN"], ja: ["JAP", "JPN", "JAPANESE"], je: ["JDA"], jin: ["JIN"], kt: ["KT"], ma: ["MAL", "MALI"], mac: ["MAC", "MD"], mo: ["MON", "MONGOL"], od: ["OOTD", "OD"], ot: ["OTT", "OTTO", "OTTOMAN"], ru: ["RUS"], sen: ["SEN"], tug: ["TUG"], zx: ["ZHU", "ZX"] };
const CIVKEY = {
  ab: /abbasid/i, ay: /ayyubid/i, by: /byzantine/i, ch: /chinese|china/i, de: /delhi/i, en: /english|england/i,
  fr: /french|france/i, gol: /golden horde/i, hr: /holy roman|hre/i, hl: /lancaster/i, ja: /japanese|japan/i,
  je: /jeanne/i, jin: /jin dynasty|\bjin\b/i, kt: /templar/i, ma: /malian|\bmali\b/i, mac: /macedon/i, mo: /mongol/i,
  od: /order of the dragon/i, ot: /ottoman/i, ru: /\brus\b/i, sen: /sengoku|daimyo/i, tug: /tughlaq/i, zx: /zhu xi/i,
};
const BAD = /icon|painting|concept|campaign|art\b|pirate|portrait|historical|real life|reenact|museum|manuscript|illustration|photo/i;
const OUT = "models"; fs.mkdirSync(OUT, { recursive: true });
const pick = {}; const need = new Map();
for (const u of D.units) {
  const imgs = (M[u.id] ? M[u.id].imgs : []).filter(i => !BAD.test(i.cap) && !BAD.test(i.key) && !/\.jpg$/i.test(i.key) || /Hobelar_KoCaR/.test(i.key));
  const civs = [...new Set(u.vars.map(v => v.c))];
  const nameRe = new RegExp(u.en.replace(/[-']/g, ".").replace(/s$/, "").split(" ")[0], "i");
  for (const c of civs) {
    const byCap = imgs.filter(i => CIVKEY[c].test(i.cap));
    const byTok = imgs.filter(i => i.key.toUpperCase().split(/[^A-Z0-9]+/).some(t => TOK[c].includes(t)));
    const byName = imgs.filter(i => nameRe.test(i.cap) && !Object.keys(CIVKEY).some(k => k !== c && CIVKEY[k].test(i.cap)));
    const anyName = imgs.filter(i => nameRe.test(i.cap) || nameRe.test(i.key));
    const cand = byCap[0] || byTok[0] || byName[0] || anyName[0] || imgs[0];
    if (cand) { pick[u.id + "|" + c] = cand.key; need.set(cand.key, cand.src); }
    else console.error("no model:", u.id, c);
  }
}
Object.assign(pick, {"knight|hl":"English_Knights.png","crossbowman|jin":"Chinese_Crossbowmen.png","horseman|jin":"Chinese_Horsemen.png","spearman|jin":"Chinese_Spearmen.png","spearman|kt":"French_Spearmen.png","mansa-javelineer|ma":"Mali_Javelin_Throwers.png","mansa-musofadi-warrior|ma":"MALI_MUSOFADI_WARRIOR.png"});
fs.writeFileSync("pick.json", JSON.stringify(pick, null, 1));
console.error("unique images:", need.size);
(async () => {
  let n = 0;
  for (const [key, src] of need) {
    const f = path.join(OUT, key);
    if (fs.existsSync(f) && fs.statSync(f).size > 1000) continue;
    const url = src + "/scale-to-width-down/420";
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!r.ok) { console.error("fail", key, r.status); continue; }
    fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
    if (++n % 20 === 0) console.error("downloaded", n);
  }
  let total = 0; for (const key of need.keys()) { const f = path.join(OUT, key); if (fs.existsSync(f)) total += fs.statSync(f).size; }
  console.error("total bytes:", total);
})();
