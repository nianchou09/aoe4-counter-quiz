// Build compact unit data for the AoE4 counter quiz from data.aoe4world.com unified json
const fs = require("fs");
const j = require("./unified.json");

const CIVS = {
  ab: ["Abbasid Dynasty", "阿拔斯王朝"], ay: ["Ayyubids", "阿育布王朝"], by: ["Byzantines", "拜占庭"],
  ch: ["Chinese", "中國"], de: ["Delhi Sultanate", "德里蘇丹國"], en: ["English", "英格蘭"],
  fr: ["French", "法蘭西"], gol: ["Golden Horde", "金帳汗國"], hr: ["Holy Roman Empire", "神聖羅馬帝國"],
  hl: ["House of Lancaster", "蘭卡斯特家族"], ja: ["Japanese", "日本"], je: ["Jeanne d'Arc", "聖女貞德"],
  jin: ["Jin Dynasty", "金朝"], kt: ["Knights Templar", "聖殿騎士團"], ma: ["Malians", "馬利"],
  mac: ["Macedonian Dynasty", "馬其頓王朝"], mo: ["Mongols", "蒙古"], od: ["Order of the Dragon", "龍騎士團"],
  ot: ["Ottomans", "鄂圖曼"], ru: ["Rus", "羅斯"], sen: ["Sengoku Daimyo", "戰國大名"],
  tug: ["Tughlaq Dynasty", "圖格魯克王朝"], zx: ["Zhu Xi's Legacy", "朱熹遺產"],
};

// id -> [zh name, archetype]
// archetypes: SPEAR LMI HMI ARCHER XBOW GUN LMC HMC HA ELE
const UNITS = {
  archer: ["弓兵", "ARCHER"], "camel-archer": ["駱駝射手", "HA"], "camel-rider": ["駱駝騎兵", "LMC"],
  crossbowman: ["弩兵", "XBOW"], ghulam: ["古拉姆", "HMI"], handcannoneer: ["火槍兵", "GUN"],
  horseman: ["騎手", "LMC"], lancer: ["長矛騎兵", "HMC"], spearman: ["長槍兵", "SPEAR"],
  "bedouin-skirmisher": ["貝都因擲矛手", "ARCHER"], "bedouin-swordsman": ["貝都因劍士", "LMI"],
  "camel-lancer": ["駱駝長矛騎兵", "HMC"], arbaletrier: ["弓弩手", "XBOW"], cataphract: ["拜占庭聖騎兵", "HMC"], "horse-archer": ["騎馬弓兵", "HA"], "javelin-thrower": ["標槍投擲者", "ARCHER"],
  keshik: ["怯薛", "HMC"], landsknecht: ["國土傭僕", "LMI"], limitanei: ["邊防軍", "SPEAR"],
  longbowman: ["長弓兵", "ARCHER"], mangudai: ["蒙古突騎", "HA"], "musofadi-warrior": ["穆索法迪戰士", "LMI"],
  "royal-knight": ["皇家騎士", "HMC"], sipahi: ["采邑騎兵", "LMC"], streltsy: ["射手衛隊", "GUN"],
  "varangian-guard": ["瓦蘭吉衛隊", "HMI"], "war-elephant": ["戰象", "ELE"], "zhuge-nu": ["諸葛弩兵", "ARCHER"],
  "fire-lancer": ["火長矛騎兵", "LMC"], "palace-guard": ["皇宮衛兵", "HMI"], "ghazi-raider": ["加齊掠奪者", "LMC"],
  "man-at-arms": ["裝甲步兵", "HMI"], knight: ["騎士", "HMC"], "wynguard-footman": ["溫嘉德步兵", "HMI"],
  "wynguard-ranger": ["溫嘉德遊俠", "ARCHER"], "kipchak-archer": ["欽察", "HA"], "rus-tribute": ["羅斯貢兵", "HMI"],
  torguud: ["土爾扈特", "HMC"], "black-rider": ["黑騎士", "HA"], "earls-guard": ["伯爵衛隊", "HMI"],
  hobelar: ["輕裝騎兵", "LMC"], yeoman: ["自耕農", "ARCHER"], "handcannon-ashigaru": ["火槍足輕", "GUN"],
  "mounted-samurai": ["薙刀騎兵", "HMC"], "onna-bugeisha": ["女武藝者", "LMI"],
  "onna-musha": ["女武者", "HA"], ozutsu: ["大筒", "GUN"], samurai: ["日本武士", "HMI"],
  "yumi-ashigaru": ["弓足輕", "ARCHER"],
  "jeannes-champion": ["貞德勇士", "HMI"],
  "jeannes-rider": ["貞德騎兵", "LMC"], eruptor: ["突火槍兵", "GUN"], "iron-pagoda": ["鐵浮屠", "HMC"],
  "mohe-tribesman": ["靺鞨部民", "HA"], "zhanma-swordsman": ["斬馬刀兵", "HMI"], "chevalier-confrere": ["伴行騎士", "HMC"],
  condottiero: ["傭兵", "HMI"], genitour: ["標槍騎兵", "HA"], "genoese-crossbowman": ["熱那亞弩手", "ARCHER"],
  "heavy-spearman": ["重裝長槍兵", "HMI"], serjeant: ["軍士", "HMI"], "szlachta-cavalry": ["貴族騎兵", "HMC"],
  "templar-brother": ["聖殿弟兄", "HMC"], "teutonic-knight": ["條頓騎士", "HMI"], atgeirmadr: ["阿特蓋爾", "SPEAR"],
  bogmadr: ["波莫", "ARCHER"], "hippodrome-horseman": ["競技場騎手", "LMC"], "hippodrome-riddari": ["競技場瑞塔利", "HMC"],
  riddari: ["瑞塔利", "HMC"], donso: ["當佐兵", "SPEAR"], "freeborn-warrior": ["自由之子", "LMI"],
  "mansa-javelineer": ["曼薩標槍投擲者", "ARCHER"], "mansa-musofadi-warrior": ["曼薩穆索法迪戰士", "LMI"],
  "musofadi-gunner": ["穆索法迪火槍兵", "GUN"], sofa: ["索法騎手", "HMC"], "gilded-archer": ["鍍金弓兵", "ARCHER"],
  "gilded-crossbowman": ["鍍金弩兵", "XBOW"], "gilded-handcannoneer": ["鍍金火槍兵", "GUN"], "gilded-horseman": ["鍍金騎手", "LMC"],
  "gilded-knight": ["鍍金騎士", "HMC"], "gilded-landsknecht": ["鍍金國土傭僕", "LMI"], "gilded-man-at-arms": ["鍍金裝甲步兵", "HMI"],
  "gilded-spearman": ["鍍金長槍兵", "SPEAR"], akinji: ["阿肯哲", "HA"], janissary: ["蘇丹親兵", "GUN"], "kanabo-samurai": ["金碎棒武士", "HMI"], "naginata-samurai": ["薙刀武士", "HMI"],
  "tanegashima-ashigaru": ["火繩槍足輕", "GUN"], "yari-cavalry": ["日本長槍騎兵", "LMC"], "amir-warrior": ["親王戰士", "HMI"],
  "raider-elephant": ["突襲戰象", "ELE"], "tower-elephant": ["塔台戰象", "ELE"], "sultans-elite-tower-elephant": ["蘇丹的塔台戰象", "ELE"], "ballista-elephant": ["弩砲戰象", "ELE"], "imperial-guard": ["禁衛軍", "HMC"],
};

// Units available in "basic" mode (main-line, non-unique)
const BASIC = new Set(["archer", "crossbowman", "handcannoneer", "horseman", "lancer", "spearman", "man-at-arms", "knight",
  "longbowman", "horse-archer", "keshik", "royal-knight", "landsknecht", "streltsy", "mangudai", "zhuge-nu", "javelin-thrower"]);
// Even simpler core: only fully generic units
const CORE = new Set(["archer", "crossbowman", "handcannoneer", "horseman", "lancer", "spearman", "man-at-arms", "knight", "horse-archer"]);

const out = { civs: CIVS, units: [] };
for (const u of j.data) {
  const meta = UNITS[u.id];
  if (!meta) continue;
  const rec = { id: u.id, en: u.name, zh: meta[0], arch: meta[1], unique: u.unique, core: CORE.has(u.id), basic: BASIC.has(u.id), vars: [] };
  for (const v of u.variations) {
    const desc = v.description || "";
    if (/Mercenary/.test(desc)) continue; // Byzantine mercenary copies
    const w = (v.weapons || []).find(x => (x.type === "melee" || x.type === "ranged") && x.name !== "Torch" && x.name !== "Charge" && x.name !== "Spear Charge" && x.name !== "Spearwall");
    if (!w) continue;
    const mods = [];
    for (const m of (w.modifiers || [])) {
      if (m.effect !== "change" || !(m.value > 0)) continue;
      if (!/Attack$/.test(m.property)) continue;
      const cls = (m.target && m.target.class) || [];
      if (!cls.length) continue;
      if (cls.every(g => g.some(x => /building|siege|ship|naval|wall|gate|worker/.test(x)))) continue; // irrelevant here
      if (m.value / w.damage < 0.4) continue; // negligible bonus
      mods.push({ c: cls, v: m.value });
    }
    const arm = { m: 0, r: 0 };
    for (const a of (v.armor || [])) { if (a.type === "melee") arm.m = a.value; if (a.type === "ranged") arm.r = a.value; }
    const civs = v.civs;
    for (const c of civs) {
      if (!CIVS[c]) continue;
      // landmark-only units carry age 1 in the data; the Imperial Hippodrome is a Feudal Age landmark
      const ageFix = (v.producedBy||[]).includes("imperial-hippodrome") ? 2 : v.age;
      rec.vars.push({
        c, a: ageFix, n: v.name, i: v.icon, hp: v.hitpoints,
        ma: arm.m, ra: arm.r,
        w: { t: w.type, d: w.damage, s: w.speed, r: w.range ? w.range.max : 0, b: (w.burst && w.burst.count > 1) ? w.burst.count : 1 },
        sp: v.movement ? v.movement.speed : 0,
        cost: { f: v.costs.food, w: v.costs.wood, g: v.costs.gold, s: v.costs.stone, o: v.costs.oliveoil || 0, sv: v.costs.silver || 0 },
        cls: v.classes.filter(x => !/^(annihilation_condition|find_non_siege_land_military|formational|human|included_by_military_hotkeys|land_military|military|torch_thrower)$/.test(x)),
        mods,
      });
    }
  }
  if (rec.vars.length) out.units.push(rec);
}
// sanity
const missing = Object.keys(UNITS).filter(id => !out.units.find(u => u.id === id));
console.error("missing:", missing.join(","));
console.error("units:", out.units.length, "variants:", out.units.reduce((s, u) => s + u.vars.length, 0));
// embed in-game model screenshots (from pick.json / models/) as data URIs
const path = require("path");
const pick = JSON.parse(fs.readFileSync("pick.json", "utf8"));
out.icons = {};
for (const u of out.units) for (const v of u.vars) {
  const key = pick[u.id + "|" + v.c] || Object.entries(pick).find(([k]) => k.startsWith(u.id + "|"))?.[1];
  if (!key) { console.error("no model for", u.id, v.c); v.i = ""; continue; }
  if (!out.icons[key]) {
    const f = path.join("models", key);
    if (fs.existsSync(f)) { const b = fs.readFileSync(f); const mime = b.slice(0, 4).toString() === "RIFF" ? "image/webp" : "image/png"; out.icons[key] = `data:${mime};base64,` + b.toString("base64"); }
    else console.error("no model file", key);
  }
  v.i = key;
}
const js = "const DATA=" + JSON.stringify(out) + ";";
fs.writeFileSync("data.js", js);
const tpl = fs.readFileSync("template.html", "utf8");
const html = tpl.replace("/*__DATA__*/", () => js);
const outPath = process.argv[2] || "aoe4-counter-quiz.html";
fs.writeFileSync(outPath, html);
console.error("wrote", outPath, html.length, "bytes");
