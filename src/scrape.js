// Scrape in-game model screenshots from the AoE fandom wiki gallery sections
const fs = require("fs");
eval(fs.readFileSync("data.js", "utf8") + ";global.D=DATA");
const UA = { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120" } };
const CIVKEY = {
  ab: /abbasid/i, ay: /ayyubid/i, by: /byzantine/i, ch: /chinese|china/i, de: /delhi/i, en: /english|england/i,
  fr: /french|france/i, gol: /golden horde/i, hr: /holy roman|hre/i, hl: /lancaster/i, ja: /japanese|japan/i,
  je: /jeanne/i, jin: /jin dynasty|jin/i, kt: /templar/i, ma: /malian|mali/i, mac: /macedon/i, mo: /mongol/i,
  od: /order of the dragon|dragon/i, ot: /ottoman/i, ru: /\brus\b|rus/i, sen: /sengoku|daimyo/i, tug: /tughlaq/i, zx: /zhu xi/i,
};
const FILEKEY = { ab: /ABB|abbasid/i, ay: /AYY|ayyub/i, by: /BYZ|byz/i, ch: /CHI|chinese/i, de: /DELHI|DEL/i, en: /ENG|english/i, fr: /FRE|FRA|french/i, gol: /GOL/i, hr: /HRE/i, hl: /LAN/i, ja: /JAP|JPN|japanese/i, je: /JDA|jeanne/i, jin: /JIN/i, kt: /KT|templar/i, ma: /MAL/i, mac: /MAC/i, mo: /MON|mongol/i, od: /ODR|OD_|dragon/i, ot: /OTT|OTTO/i, ru: /RUS/i, sen: /SEN/i, tug: /TUG/i, zx: /ZHU|ZX/i };
const OVERRIDE = { "man-at-arms": "Man-at-Arms_(Age_of_Empires_IV)" };

async function get(title){ const r=await fetch("https://ageofempires.fandom.com/api.php?action=parse&prop=text&format=json&redirects=1&page="+encodeURIComponent(title),UA); if(!r.ok) return null; const j=await r.json(); if(j.error) return null; return j.parse.text["*"]; }
async function findPage(u) {
  const base = u.en.replace(/ /g, "_");
  const cands = OVERRIDE[u.id] ? [OVERRIDE[u.id]] : [`${base}_(Age_of_Empires_IV)`, base, `${base}_(unit)`];
  for (const c of cands) {
    const html = await get(c);
    if (html && /Age of Empires IV|AoE4|Age_of_Empires_IV/.test(html)) return { title: c, html };
  }
  return null;
}
function galleryItems(html) {
  const out = [];
  const re = /<div class="wikia-gallery-item"[\s\S]*?data-image-key="([^"]+)"[\s\S]*?data-caption="([^"]*)"[\s\S]*?data-src="([^"]+)"/g;
  let m; while ((m = re.exec(html))) out.push({ key: m[1], cap: m[2].replace(/&#039;/g, "'").replace(/&amp;/g, "&").replace(/&quot;/g, '"'), src: m[3].replace(/\/revision\/latest.*$/, "/revision/latest") });
  // also plain thumbs (figure) images
  const re2 = /<figure class="thumb[\s\S]*?data-image-key="([^"]+)"[\s\S]*?(?:data-caption="([^"]*)")?[\s\S]*?(?:data-src|src)="(https:\/\/static\.wikia[^"]+)"/g;
  while ((m = re2.exec(html))) out.push({ key: m[1], cap: m[2] || "", src: m[3].replace(/\/revision\/latest.*$/, "/revision/latest") });
  return out.filter(x => /\.(png|jpe?g|webp)$/i.test(x.key) && !/^AoE4_[A-Za-z0-9]+\.png$/.test(x.key) && !/icon|Icon|CivPortrait|flag|Flag|_AoE4\.png$/.test(x.key));
}
(async () => {
  const result = {};
  for (const u of D.units) {
    const p = await findPage(u);
    if (!p) { console.error("NO PAGE", u.id, u.en); result[u.id] = { page: null, imgs: [] }; continue; }
    const items = galleryItems(p.html);
    const civsOfUnit = [...new Set(u.vars.map(v => v.c))];
    const imgs = items.map(it => {
      let civ = civsOfUnit.filter(c => CIVKEY[c].test(it.cap));
      if (!civ.length) civ = civsOfUnit.filter(c => FILEKEY[c].test(it.key));
      return { key: it.key, cap: it.cap, src: it.src, civ };
    });
    result[u.id] = { page: p.title, imgs };
    console.error(u.id.padEnd(24), p.title.padEnd(40), items.length, "imgs; civ-matched:", imgs.filter(i => i.civ.length).map(i => i.civ.join("+")).join(","));
    await new Promise(r => setTimeout(r, 300));
  }
  fs.writeFileSync("models.json", JSON.stringify(result, null, 1));
})();
