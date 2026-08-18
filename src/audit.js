const fs=require("fs");
const html=fs.readFileSync("aoe4-counter-quiz.html","utf8");
const dataJs=html.match(/const DATA=.*?;\n/s)[0];
const logic=html.split("(function(){")[1].split("// ---------- state")[0];
const ctx={}; const D=eval(dataJs+"DATA");
new Function("DATA","store","exports", logic+"; exports.verdict=verdict;")(D,{overrides:{}},ctx);

// 1) elephants present?
console.log("=== 大象單位 ===");
for(const u of D.units) if(/elephant/.test(u.id)) console.log(" ", u.id, u.zh, u.arch, "vars:", u.vars.map(v=>v.c+"a"+v.a).join(","), "basic="+u.basic);

// 2) verdict coverage per unit (same-age pairs only, as the game does)
const cov={};
for(const A of D.units) for(const B of D.units){
  if(A===B) continue;
  for(const av of A.vars) for(const bv of B.vars){
    if(av.a!==bv.a) continue;
    if(A.id===B.id && av.c===bv.c) continue;
    const r=ctx.verdict({u:A,v:av},{u:B,v:bv});
    const c=cov[A.id]=cov[A.id]||{ok:0,skip:0};
    if(r) c.ok++; else c.skip++;
  }
}
const rows=Object.entries(cov).map(([id,c])=>({id, zh:D.units.find(u=>u.id===id).zh, ok:c.ok, skip:c.skip, rate:c.ok/(c.ok+c.skip)})).sort((a,b)=>a.rate-b.rate);
console.log("\n=== 最容易被跳過（不出題）的單位 top10 ===");
for(const r of rows.slice(0,10)) console.log("  "+r.zh.padEnd(10), "可出題率", (r.rate*100).toFixed(0)+"%", "("+r.ok+"/"+(r.ok+r.skip)+")");
console.log("整體可出題率:", (rows.reduce((s,r)=>s+r.ok,0)/rows.reduce((s,r)=>s+r.ok+r.skip,0)*100).toFixed(1)+"%");

// 3) images / data sanity
console.log("\n=== 資料檢查 ===");
let noImg=[], zeroCost=[], zeroDmg=[], ageBad=[];
for(const u of D.units) for(const v of u.vars){
  if(!v.i || !D.icons[v.i]) noImg.push(u.zh+"/"+v.c);
  const cost=v.cost.f+v.cost.w+v.cost.g+v.cost.s+(v.cost.o||0)+(v.cost.sv||0);
  if(!cost) zeroCost.push(u.zh+"/"+v.c);
  if(!v.w.d) zeroDmg.push(u.zh+"/"+v.c);
  if(!(v.a>=1&&v.a<=4)) ageBad.push(u.zh+"/"+v.c+"=a"+v.a);
}
console.log("無圖:", noImg.join(",")||"無");
console.log("零成本:", zeroCost.join(",")||"無");
console.log("零傷害:", zeroDmg.join(",")||"無");
console.log("時代異常:", ageBad.join(",")||"無");
// duplicate image usage across different units
const imgUse={};
for(const u of D.units) for(const v of u.vars) (imgUse[v.i]=imgUse[v.i]||new Set()).add(u.zh);
const shared=Object.entries(imgUse).filter(([k,s])=>s.size>1);
console.log("同一張圖用在不同單位:", shared.length? shared.map(([k,s])=>[...s].join("/")).join(" | ") : "無");

// 4) simulate rounds to measure repetition (mirror makeQ logic incl. 30% wrong-replay off)
function rnd(a){return a[Math.floor(Math.random()*a.length)];}
for(const adv of [false,true]){
  const P=D.units.filter(u=>adv?true:u.basic);
  const counts={};
  const N=200; // 200 rounds of 20 questions
  let dupInRound=0;
  for(let r=0;r<N;r++){
    const seenU={};
    let q=0, guard=0;
    while(q<20 && guard<4000){
      guard++;
      const ul=rnd(P), ur=rnd(P);
      const L={u:ul,v:rnd(ul.vars)};
      const same=ur.vars.filter(v=>v.a===L.v.a); if(!same.length) continue;
      const R={u:ur,v:rnd(same)};
      if(L.u.id===R.u.id && L.v.c===R.v.c) continue;
      if(!ctx.verdict(L,R)) continue;
      q++;
      for(const x of [ul.id,ur.id]){ counts[x]=(counts[x]||0)+1; seenU[x]=(seenU[x]||0)+1; }
    }
    dupInRound += Object.values(seenU).filter(c=>c>1).length;
  }
  const tot=Object.values(counts).reduce((a,b)=>a+b,0);
  const list=Object.entries(counts).map(([k,c])=>({zh:(D.units.find(u=>u.id===k)||{}).zh,c})).sort((a,b)=>b.c-a.c);
  console.log(`\n=== 抽樣（${adv?"進階":"初階"}，200 回合 × 20 題）===`);
  console.log("  最常出現:", list.slice(0,6).map(x=>x.zh+" "+(x.c/tot*100).toFixed(1)+"%").join(", "));
  console.log("  最少出現:", list.slice(-6).map(x=>x.zh+" "+(x.c/tot*100).toFixed(1)+"%").join(", "));
  console.log("  平均每回合有", (dupInRound/N).toFixed(1), "個單位重複出現（20 題共 40 個位置）");
}
