/* === HAVEN (level 3): containerterrein, kade, scheepsdek, kraan, vishal, havenkantoor, botenloods, pier, havenmeester, terminalpoort.
   Draai: soldaten springen uit containers met deuren die openzwaaien. === */
// container met de deuren naar de speler (n = [0, 1]); deur = echte deur die opengetrapt wordt
function kContainer(B, R, x, z, o){ o = o || {}; const L = o.lang || 6, kl = o.kl || kKies(R, [[0.62, 0.22, 0.16], [0.18, 0.36, 0.52], [0.26, 0.42, 0.26], [0.7, 0.52, 0.18], [0.5, 0.5, 0.52]]), y0 = o.y0 || 0;
  B.doos('golf_grijs', x - 1.22, z - L, x + 1.22, z - 0.16, y0, y0 + 2.6, {tint:kl});
  if (!o.deur){ B.doos('golf_grijs', x - 1.22, z - 0.16, x + 1.22, z, y0, y0 + 2.6, {tint:kl.map(v => v*0.85)}); return {deuren:[], ramen:[]}; }
  return kGevel(B, R, {x0:x - 1.22, z0:z, x1:x + 1.22, z1:z, n:[0, 1], H:2.6, mat:'golf_grijs', tint:kl.map(v => v*0.85), deuren:[1.22]}); }

KWERELD.kade = (T, R) => {
  const B = new KBouw(T); B.lucht(); B.weg = 'beton'; B.stoep = 'beton2';
  const ST = [], dS = (deuren, x, z, extra) => kDeurSpawns(deuren, {x, z}, p => p[1] < z - 2.5).concat(extra || []);
  const binnen = (xa, za, xb, zb, H, vloer, plaf) => { const r = B.ruimte(xa, zb, xb, za, H, 0.3); B.vlakH(vloer, xa, zb, xb, za, 0.005, {stap:1.4}); B.vlakH(plaf || 'plafond', xa, zb, xb, za, H, {plafond:true, stap:1.5}); return r; };
  const zw = (n, x0, z0, x1, z1, H, o) => B.wand(n, x0, z0, x1, z1, 0, H, Object.assign({dik:0.3}, o || {}));
  const water = (x0, z0, x1, z1) => { B.vlakH('kleur', x0, z0, x1, z1, -0.6, {tint:[0.16, 0.27, 0.3]}); };
  const rand = (x0, z0, x1, z1) => B.box(Math.min(x0, x1), -1, Math.min(z0, z1), Math.max(x0, x1), 0.95, Math.max(z0, z1));   // onzichtbare kaderand: niemand loopt het water in
  const cat = (a, b) => ({deuren:a.deuren.concat(b.deuren), ramen:a.ramen.concat(b.ramen)});
  const alle = l => l.reduce(cat, {deuren:[], ramen:[]});

  // 0 · CONTAINERTERREIN: gangen tussen gestapelde containers, deuren springen open
  { const oz = 0; B.vlakH('beton', -14, oz - 14, 14, oz + 4, 0, {stap:2.2});
    const C = alle([kContainer(B, R, -4.6, oz - 6.5, {deur:true}), kContainer(B, R, 4.4, oz - 8.2, {deur:true}), kContainer(B, R, -0.4, oz - 11.4, {deur:true}), kContainer(B, R, -7.6, oz - 9.5, {deur:true})]);
    kContainer(B, R, -4.6, oz - 6.5, {y0:2.6}); kContainer(B, R, 4.4, oz - 8.2, {y0:2.6}); kContainer(B, R, 7.2, oz - 4, {lang:6}); kContainer(B, R, 7.2, oz - 4, {y0:2.6});
    kContainer(B, R, -0.4, oz - 11.4, {y0:2.6}); kContainer(B, R, 2.2, oz - 12.8); kContainer(B, R, -3, oz - 13.2);
    zw('golf_grijs', -14, oz + 4, 14, oz + 4, 6); zw('golf_grijs', -14, oz - 18, 14, oz - 18, 6); zw('golf_grijs', -14, oz + 4, -14, oz - 18, 6); zw('golf_grijs', 14, oz - 18, 14, oz + 4, 6);
    const props = [kProp(B, R, 'pallets', 1.8, oz - 4.2, {as:'x'}), kProp(B, R, 'vaten', -1.9, oz - 9)].filter(Boolean);
    ST.push({x:0, z:oz, naam:'CONTAINER YARD', lucht:true, geenWagens:true, geenMuur:true, breed:3, props, plek:[], spawns:dS(C.deuren, 0, oz, [{p:[12, oz - 10.5], via:[[6.5, oz - 10.5]]}, {p:[-12, oz - 3], via:[[-7, oz - 3]]}])}); }

  // 1 · KADE: links het water met een scheepsromp, rechts loodsen met deuren, bolders en kratten
  { const oz = -100, xW = -3.2; B.vlakH('beton', xW, oz - 14, 9, oz + 4, 0, {stap:2.2}); water(-16, oz - 14, xW, oz + 4); rand(xW - 0.3, oz - 14, xW, oz + 4);
    B.doos('golf_grijs', -13, oz - 16, -7, oz + 2, -0.6, 7, {tint:[0.25, 0.28, 0.33]}); B.doos('kleur', -13, oz - 16, -7, oz + 2, 6.95, 7.05, {tint:[0.6, 0.2, 0.15]});   // scheepsromp
    const Rr = kGevel(B, R, {x0:6, z0:oz - 14, x1:6, z1:oz + 4, n:[-1, 0], H:8, mat:'golf_roest', deuren:[5, 10], ramen:[[7.5, 3.4], [12.5, 3.4]]});
    const E = kGevel(B, R, {x0:xW, z0:oz - 12, x1:6, z1:oz - 12, n:[0, 1], H:8, mat:'baksteen5', deuren:[4.6], ramen:[[2, 3.4], [7.2, 3.4]]});
    zw('golf_grijs', xW, oz + 4, 6, oz + 4, 6);
    [[xW + 0.5, oz - 3], [xW + 0.5, oz - 8.5]].forEach(([x, z]) => { B.cilinder('kleur', x, z, 0.25, 0, 0.7, {tint:[0.15, 0.15, 0.16]}); B.box(x - 0.25, 0, z - 0.25, x + 0.25, 0.7, z + 0.25); });
    const props = [kProp(B, R, 'kratten', 2.6, oz - 5.5, {as:'z'}), kProp(B, R, 'vaten', -1, oz - 9.6), kProp(B, R, 'pallets', 3.4, oz - 9.4, {as:'x'})].filter(Boolean);
    ST.push({x:1, z:oz, naam:'QUAYSIDE', lucht:true, geenWagens:true, geenMuur:true, breed:2.4, props, plek:kRaamPlekken(Rr.ramen.concat(E.ramen), () => true), spawns:dS(Rr.deuren.concat(E.deuren), 1, oz)}); }

  // 2 · SCHEEPSDEK: op het dek, voor je de brug met deuren en patrijspoorten, luiken als dekking
  { const oz = -200, HW = 6; B.vlakH('plank', -HW, oz - 12, HW, oz + 4, 0, {stap:1.6}); water(-30, oz - 30, 30, oz + 20);
    [-1, 1].forEach(s => { B.doos('kleur', s*HW - 0.05, oz - 12, s*HW + 0.05, oz + 4, 0, 1.0, {tint:[0.85, 0.85, 0.82]}); B.doos('golf_grijs', s*HW, oz - 12, s*(HW + 0.4), oz + 4, -3, 0.2, {tint:[0.25, 0.27, 0.3]}); });
    const E = kGevel(B, R, {x0:-HW, z0:oz - 10.5, x1:HW, z1:oz - 10.5, n:[0, 1], H:9, mat:'golf_grijs', tint:[0.9, 0.9, 0.92], deuren:[3, 9], ramen:[[6, 0], [1.6, 3.4], [6, 3.4], [10.4, 3.4], [6, 6.6]]});
    zw('golf_grijs', -HW, oz + 4, HW, oz + 4, 3, {tint:[0.9, 0.9, 0.92]});
    const luik = [[-3, oz - 4.4, 2.6], [2.8, oz - 6.4, 2.4]], props = []; luik.forEach(([x, z, w]) => { B.doos('golf_grijs', x - w/2, z - 0.9, x + w/2, z + 0.9, 0, 1.0, {tint:[0.3, 0.38, 0.32]}); props.push({x, z, w, d:1.8, h:1.0}); });
    kContainer(B, R, -3.6, oz - 7.4, {lang:2.4}); kContainer(B, R, 3.8, oz - 2.8, {lang:2.4});
    ST.push({x:0, z:oz, naam:'SHIP DECK', lucht:true, geenWagens:true, geenMuur:true, breed:3, props, plek:kRaamPlekken(E.ramen, () => true), spawns:dS(E.deuren, 0, oz, [{p:[-5.4, oz - 9.6], via:[[-4.6, oz - 8.2]]}, {p:[5.4, oz - 9.6], via:[[4.8, oz - 8.6]]}])}); }

  // 3 · KRAANBAAN: poten van een havenkraan, containerstapels, open terrein
  { const oz = -300; B.vlakH('beton', -14, oz - 14, 14, oz + 4, 0, {stap:2.2});
    [[-4.8, oz - 5], [4.8, oz - 5], [-4.8, oz - 11], [4.8, oz - 11]].forEach(([x, z]) => B.doos('kleur', x - 0.45, z - 0.45, x + 0.45, z + 0.45, 0, 14, {tint:[0.85, 0.62, 0.12]}));
    B.doos('kleur', -5.3, oz - 11.5, 5.3, oz - 4.5, 14, 15.2, {tint:[0.85, 0.62, 0.12], geenBots:true});
    const C = alle([kContainer(B, R, 0, oz - 9.2, {deur:true}), kContainer(B, R, -8.5, oz - 7.6, {deur:true}), kContainer(B, R, 8.6, oz - 10.2, {deur:true})]);
    kContainer(B, R, 0, oz - 9.2, {y0:2.6}); kContainer(B, R, 0, oz - 9.2, {y0:5.2}); kContainer(B, R, -8.5, oz - 7.6, {y0:2.6});
    zw('golf_grijs', -14, oz + 4, 14, oz + 4, 6); zw('golf_grijs', -14, oz - 18, 14, oz - 18, 6); zw('golf_grijs', -14, oz + 4, -14, oz - 18, 6); zw('golf_grijs', 14, oz - 18, 14, oz + 4, 6);
    const props = [kProp(B, R, 'vaten', -2.4, oz - 5.6), kProp(B, R, 'pallets', 2.6, oz - 6.6, {as:'x'})].filter(Boolean);
    ST.push({x:0, z:oz, naam:'CRANE YARD', lucht:true, geenWagens:true, geenMuur:true, breed:3, props, plek:[], spawns:dS(C.deuren, 0, oz, [{p:[-12, oz - 12], via:[[-5.6, oz - 12]]}, {p:[12, oz - 3.6], via:[[6.4, oz - 3.6]]}])}); }

  // 4 · VISHAL: binnen, kramen met ijs en vis, koelcel-deuren achterin
  { const oz = -400, H = 5, xa = -7, xb = 7, zE = oz - 11.5; const r = binnen(xa, oz + 3, xb, zE, H, 'tegels'); const tint = [0.85, 0.92, 0.95];
    const E = kGevel(B, R, {x0:xa, z0:zE, x1:xb, z1:zE, n:[0, 1], H, mat:'tegels', tint, deuren:[2.5, 7, 11.5], ramen:[[4.8, 2.4], [9.2, 2.4]]});
    const L = kGevel(B, R, {x0:xa, z0:oz + 3, x1:xa, z1:zE, n:[1, 0], H, tint, deuren:[10]});
    const Rr = kGevel(B, R, {x0:xb, z0:zE, x1:xb, z1:oz + 3, n:[-1, 0], H, tint, deuren:[4]});
    zw('pleister1', xa, oz + 3, xb, oz + 3, H, {tint});
    const props = [kKraam(B, R, -3.2, oz - 4.6, 2.6), kKraam(B, R, 3, oz - 6, 2.6), kKraam(B, R, -0.6, oz - 8.6, 2.2)];
    for (let z = oz - 1; z > zE; z -= 3.5) [-3, 3].forEach(x => B.lamp(r, x, H - 0.05, z, 0.7));
    ST.push({x:0, z:oz, naam:'FISH MARKET', binnen:true, geenWagens:true, geenMuur:true, breed:3, props, plek:kRaamPlekken(E.ramen, () => true), spawns:dS(E.deuren.concat(L.deuren, Rr.deuren), 0, oz)}); }

  // 5 · HAVENKANTOOR: kantoortjes met deuren, archiefkasten, een balie
  { const oz = -500, H = 3, xa = -6, xb = 6, zE = oz - 10.5; const r = binnen(xa, oz + 3, xb, zE, H, 'parket'); const tint = [0.9, 0.95, 1];
    const E = kGevel(B, R, {x0:xa, z0:zE, x1:xb, z1:zE, n:[0, 1], H, tint, deuren:[2, 6, 10], ramen:[[4, 0], [8, 0]]});
    const L = kGevel(B, R, {x0:xa, z0:oz + 3, x1:xa, z1:zE, n:[1, 0], H, tint, deuren:[9]});
    const Rr = kGevel(B, R, {x0:xb, z0:zE, x1:xb, z1:oz + 3, n:[-1, 0], H, tint, deuren:[5.2]});
    zw('pleister1', xa, oz + 3, xb, oz + 3, H, {tint});
    B.doos('plank', -2.6, oz - 4.6, 2.2, oz - 4, 0, 1.05, {tint:[0.45, 0.4, 0.38]});
    [[-5.4, oz - 7], [5, oz - 2.4]].forEach(([x, z]) => B.doos('golf_grijs', x - 0.35, z - 1.2, x + 0.35, z + 1.2, 0, 2.1, {tint:[0.55, 0.58, 0.6]}));   // archiefkasten
    const props = [{x:-0.2, z:oz - 4.3, w:4.8, d:0.6, h:1.05}, kProp(B, R, 'kast', 2.6, oz - 7.6, {as:'x'})].filter(Boolean);
    for (let z = oz - 1; z > zE; z -= 3.5) [-2.5, 2.5].forEach(x => B.lamp(r, x, H - 0.02, z, 0.6));
    ST.push({x:0, z:oz, naam:'HARBOUR OFFICE', binnen:true, geenWagens:true, geenMuur:true, breed:2.4, props, plek:kRaamPlekken(E.ramen, () => true), spawns:dS(E.deuren.concat(L.deuren, Rr.deuren), 0, oz)}); }

  // 6 · BOTENLOODS: een boot op bokken in het midden, werkbanken, grote deur naar het water
  { const oz = -600, H = 7, xa = -8, xb = 8, zE = oz - 12; const r = binnen(xa, oz + 3, xb, zE, H, 'beton', 'golf_grijs');
    const E = kGevel(B, R, {x0:xa, z0:zE, x1:xb, z1:zE, n:[0, 1], H, mat:'plank', tint:[0.6, 0.5, 0.42], deuren:[2.5, 13.5], ramen:[[4.5, 3.6], [11.5, 3.6]], gaten:[{a0:6, a1:10, b0:0, b1:4.2}]});
    const L = kGevel(B, R, {x0:xa, z0:oz + 3, x1:xa, z1:zE, n:[1, 0], H, mat:'plank', tint:[0.6, 0.5, 0.42], deuren:[10.5]});
    const Rr = kGevel(B, R, {x0:xb, z0:zE, x1:xb, z1:oz + 3, n:[-1, 0], H, mat:'plank', tint:[0.6, 0.5, 0.42], deuren:[4]});
    zw('plank', xa, oz + 3, xb, oz + 3, H, {tint:[0.6, 0.5, 0.42]}); B.kamer(0, zE - 0.3, 0, 1, 4, 4, 0, 4.2, {f:0.4});
    { const wit = {tint:[0.86, 0.86, 0.83]}, rood = {tint:[0.62, 0.12, 0.1]}, blauw = {tint:[0.16, 0.3, 0.5]};   // boot op bokken: laag (je kijkt eroverheen), spitse boeg naar jou toe, klein stuurhuis achterop
      [[-1.1, 1.1, oz - 9.4, oz - 5.2], [-0.8, 0.8, oz - 5.2, oz - 4.5], [-0.45, 0.45, oz - 4.5, oz - 4.0]].forEach(([x0, x1, z0, z1]) => {
        B.doos('plank', x0, z0, x1, z1, 0.62, 1.3, wit); B.doos('kleur', x0 - 0.01, z0 - 0.01, x1 + 0.01, z1 + 0.01, 0.55, 0.68, rood); B.doos('kleur', x0 - 0.02, z0 - 0.02, x1 + 0.02, z1 + 0.02, 1.3, 1.36, blauw); });
      B.doos('plank', -0.7, oz - 9.0, 0.7, oz - 7.4, 1.36, 2.05, wit); B.doos('kleur', -0.75, oz - 9.05, 0.75, oz - 7.35, 2.05, 2.12, blauw);
      [oz - 8.6, oz - 5.8].forEach(z => B.doos('plank', -1.3, z - 0.12, 1.3, z + 0.12, 0, 0.55, {tint:[0.5, 0.42, 0.34]}));   // bokken
      B.box(-1.1, 0, oz - 9.4, 1.1, 1.36, oz - 4.0); B.box(-0.7, 1.36, oz - 9.0, 0.7, 2.12, oz - 7.4); }
    const props = [kProp(B, R, 'kratten', -4.6, oz - 5.6, {as:'x'}), kProp(B, R, 'tafel', 4.4, oz - 7.2, {as:'x'}), kProp(B, R, 'vaten', -4.4, oz - 9.6)].filter(Boolean);
    for (let z = oz - 1; z > zE; z -= 4) [-4, 4].forEach(x => B.lamp(r, x, H - 0.05, z, 0.7));
    ST.push({x:0, z:oz, naam:'BOAT SHED', binnen:true, geenWagens:true, geenMuur:true, breed:3, props, plek:kRaamPlekken(E.ramen, () => true), spawns:dS(E.deuren.concat(L.deuren, Rr.deuren), 0, oz, [{p:[0, zE - 3], via:[[0, zE + 1]]}])}); }

  // 7 · PIER: houten steiger met schuurtjes links en rechts, netten en kisten
  { const oz = -700, HW = 2.6; B.vlakH('plank', -HW - 4, oz - 13, HW + 4, oz + 4, 0, {stap:1.4}); water(-30, oz - 30, 30, oz + 20);
    const L = kGevel(B, R, {x0:-HW, z0:oz + 3, x1:-HW, z1:oz - 6, n:[1, 0], H:3.4, mat:'plank', tint:[0.55, 0.45, 0.35], deuren:[6.2]});
    const Rr = kGevel(B, R, {x0:HW, z0:oz - 9.5, x1:HW, z1:oz + 3, n:[-1, 0], H:3.4, mat:'plank', tint:[0.5, 0.42, 0.34], deuren:[5], ramen:[[8.5, 0]]});
    const E = kGevel(B, R, {x0:-4, z0:oz - 12, x1:4, z1:oz - 12, n:[0, 1], H:4.4, mat:'plank', tint:[0.62, 0.5, 0.4], deuren:[4], ramen:[[1.6, 0], [6.4, 0]]});
    zw('plank', -HW - 4, oz - 6, -HW, oz - 6, 3.4, {tint:[0.55, 0.45, 0.35]}); zw('plank', -HW - 4, oz + 3, -HW - 4, oz - 6, 3.4); zw('plank', HW, oz - 9.5, HW + 4, oz - 9.5, 3.4); zw('plank', HW + 4, oz - 9.5, HW + 4, oz + 3, 3.4);
    zw('plank', -4, oz - 12, -4, oz - 13, 4.4); zw('plank', 4, oz - 13, 4, oz - 12, 4.4); rand(-HW - 4, oz - 13, -4, oz - 12.6); rand(4, oz - 13, HW + 4, oz - 12.6); rand(-HW - 4.3, oz - 6, -HW - 4, oz - 12.6); rand(HW + 4, oz - 9.5, HW + 4.3, oz - 12.6);
    const props = [kProp(B, R, 'kratten', -1.4, oz - 7.8, {as:'x'}), kProp(B, R, 'vaten', 1.6, oz - 4.6)].filter(Boolean);
    ST.push({x:0, z:oz, naam:'PIER', lucht:true, geenWagens:true, geenMuur:true, breed:1.6, props, plek:kRaamPlekken(Rr.ramen.concat(E.ramen), () => true).concat([kHoek([-HW - 1.4, oz - 7.6], [-HW + 0.4, oz - 7.6]), kHoek([HW + 1.4, oz - 10.6], [HW - 0.4, oz - 10.6])]),
      spawns:dS(L.deuren.concat(Rr.deuren, E.deuren), 0, oz, [{p:[-HW - 3.4, oz - 9], via:[[-HW - 0.6, oz - 8.6]]}, {p:[HW + 3.4, oz - 11.6], via:[[HW + 0.6, oz - 11]]}])}); }

  // 8 · HAVENMEESTER: hoog kantoorgebouw met torentje over een kadeplein, meerpalen en netten
  { const oz = -800, HW = 7; B.vlakH('kinderkop', -HW, oz - 13, HW, oz + 4, 0, {stap:2.2});
    const E = kGevel(B, R, {x0:-HW, z0:oz - 11.5, x1:HW, z1:oz - 11.5, n:[0, 1], H:10, mat:'baksteen', deuren:[4, 10], ramen:[[1.6, 0], [7, 0], [12.4, 0], [1.6, 3.4], [4, 3.4], [7, 3.4], [10, 3.4], [12.4, 3.4], [7, 6.8]]});
    B.wand('baksteen', -1.8, oz - 11.6, 1.8, oz - 11.6, 10, 14, {dik:0.3});
    const L = kRij(B, R, {x0:-HW, z0:oz + 4, x1:-HW, z1:oz - 11.5, n:[1, 0], verd:[2, 3], echteDeur:() => true, raamOpen:(p, f, Rr) => Rr() < 0.6});
    const Rr = kRij(B, R, {x0:HW, z0:oz - 11.5, x1:HW, z1:oz + 4, n:[-1, 0], verd:[2, 3], echteDeur:() => true, raamOpen:(p, f, Rr2) => Rr2() < 0.6});
    zw('baksteen', -HW, oz + 4, HW, oz + 4, 7);
    const props = [kProp(B, R, 'kratten', -3, oz - 5, {as:'x'}), kProp(B, R, 'muurtje', 3.4, oz - 7, {as:'x'})].filter(Boolean);
    ST.push({x:0, z:oz, naam:'HARBOUR MASTER', lucht:true, geenWagens:true, breed:3, props, plek:kRaamPlekken(E.ramen.concat(L.ramen, Rr.ramen), c => c[1] < oz - 3), spawns:dS(E.deuren.concat(L.deuren, Rr.deuren), 0, oz)}); }

  // 9 · TERMINALPOORT: slagbomen en poorthuisjes, containers, de zware jongens komen
  { const oz = -900, HW = 8; B.vlakH('asfalt', -HW, oz - 13, HW, oz + 4, 0, {stap:2.2});
    const P1 = kGevel(B, R, {x0:-5.4, z0:oz - 6, x1:-2.4, z1:oz - 6, n:[0, 1], H:2.8, mat:'pleister1', tint:[0.9, 0.9, 0.85], deuren:[1.5]}), P2 = kGevel(B, R, {x0:2.4, z0:oz - 6, x1:5.4, z1:oz - 6, n:[0, 1], H:2.8, mat:'pleister1', tint:[0.9, 0.9, 0.85], ramen:[[1.5, 0]]});
    [[-5.4, -2.4], [2.4, 5.4]].forEach(([a, b]) => { zw('pleister1', a, oz - 6, a, oz - 9, 2.8, {tint:[0.9, 0.9, 0.85]}); zw('pleister1', b, oz - 9, b, oz - 6, 2.8, {tint:[0.9, 0.9, 0.85]}); zw('pleister1', a, oz - 9, b, oz - 9, 2.8, {tint:[0.9, 0.9, 0.85]}); B.vlakH('beton', a, oz - 9, b, oz - 6, 2.8, {plafond:true}); });
    B.doos('kleur', -2.3, oz - 5.6, 2.3, oz - 5.5, 1.0, 1.1, {tint:[0.9, 0.15, 0.12], geenBots:true});
    const C = alle([kContainer(B, R, -6, oz - 12, {deur:true}), kContainer(B, R, 0, oz - 13, {deur:true}), kContainer(B, R, 6.2, oz - 12, {deur:true})]);
    zw('golf_grijs', -HW, oz + 4, HW, oz + 4, 6); zw('golf_grijs', -HW, oz + 4, -HW, oz - 19, 6); zw('golf_grijs', HW, oz - 19, HW, oz + 4, 6); zw('golf_grijs', -HW, oz - 19, HW, oz - 19, 6);
    const props = [kProp(B, R, 'zand', -3.6, oz - 3.6, {as:'x'}), kProp(B, R, 'vaten', 3.2, oz - 10.4)].filter(Boolean);
    ST.push({x:0, z:oz, naam:'TERMINAL GATE', lucht:true, geenWagens:true, geenMuur:true, breed:3, props, plek:kRaamPlekken(P2.ramen, () => true).concat([kHoek([-6.2, oz - 7.4], [-5, oz - 5.6])]), spawns:dS(P1.deuren.concat(C.deuren), 0, oz, [{p:[-7, oz - 15], via:[[-3.2, oz - 10.6]]}, {p:[7, oz - 15], via:[[3.4, oz - 10.6]]}])}); }

  { const lu = B.extra[0]; ST.forEach(S => { if (S.lucht && Math.abs(S.z) > 150){ const m = lu.clone(); m.position.set(S.x, 0, S.z); B.extra.push(m); } }); }
  B.standen.push(...ST);
  return B.maak();
};
