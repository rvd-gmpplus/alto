/* ===================== engine2.js: motor G10BB, deel 2: cilinderkop met nokkenas, tuimelaars en kleppen en kleppendeksel, distributie, hulpaandrijving, koelcircuit ===================== */
// SOHC met tuimelaars (handboek, docs/specificaties-en-bronnen.md): een nokkenas midden in de kop bedient via twee tuimelaarsassen
// (inlaat voor, uitlaat achter) en stelschroeven met borgmoer de zestien kleppen.

/* ---------- cilinderkop ---------- */
function engHeadGeo() {
  const L = [], out = rrectPts(2 * ENG_HX, 2 * ENG_HZ, 0.02), tw = 0.0052;
  const bolts = []; ENG_XM.forEach(x => [-1, 1].forEach(sg => bolts.push([x, sg * 0.0215, tw])));
  const plugs = ENG_XC.map(x => [x, ENG_PLZ, 0.0098]);
  const slab = engPlanHoles(out, bolts.concat(plugs), ENG_FLOOR - ENG_HEAD_Y0); slab.translate(0, (ENG_FLOOR + ENG_HEAD_Y0) / 2, 0); L.push(slab);
  const well = [[-0.168, -0.067], [0.168, -0.067], [0.168, 0.067], [-0.168, 0.067]];
  const rim = plan(engRing(out, well), ENG_CAMY - ENG_FLOOR); rim.translate(0, (ENG_CAMY + ENG_FLOOR) / 2, 0); L.push(rim);
  // boutentorens en bougiebuizen
  const tower = G.lathe('y', [[tw, 0], [0.0105, 0], [0.0105, 0.016], [tw, 0.016], [tw, 0]], 10, 'engTower');
  bolts.forEach(([x, z]) => L.push(xf(tower, [x, ENG_FLOOR, z])));
  const ph = 0.285 - 0.19, plugTube = G.lathe('y', [[0.0098, 0], [0.0125, 0], [0.0125, ph], [0.0098, ph], [0.0098, 0]], 12, 'engPlugTube');
  ENG_XC.forEach(x => L.push(xf(plugTube, [x, 0.19, ENG_PLZ])));
  // klepgeleiders met veerzetel
  const pad = G.cyl('y', 0.0105, 0.0105, 0.012, 10), neck = G.cyl('y', 0.0065, 0.0065, 0.016, 8);
  ENG_XC.forEach(xc => [-1, 1].forEach(dk => [-1, 1].forEach(sg => {
    const x = xc + dk * (sg > 0 ? ENG_VXI : ENG_VXE), zs = sg * ENG_VZ, tilt = sg * ENG_VT, c = Math.cos(ENG_VT), s = Math.sin(ENG_VT);
    L.push(xf(pad, [x, ENG_VY + 0.024 * c, zs + sg * 0.024 * s], [tilt, 0, 0]));
    L.push(xf(neck, [x, ENG_VY + 0.038 * c, zs + sg * 0.038 * s], [tilt, 0, 0]));
  })));
  // lagerbokken van de nokkenas (midden) en van de twee tuimelaarsassen: onderste helft van het lager
  const ped = (zc, yc, r, w) => {
    const pts = [[zc - w, ENG_FLOOR], [zc + w, ENG_FLOOR], [zc + w, yc], [zc + r, yc]];
    for (let k = 1; k < 12; k++) { const a = -k / 12 * PI; pts.push([zc + r * Math.cos(a), yc + r * Math.sin(a)]); }
    pts.push([zc - r, yc], [zc - w, yc]);
    return side(shapeOf(pts), 0.016);
  };
  const pc = ped(0, ENG_CAMY, 0.0128, 0.0155), pr = [1, -1].map(sg => ped(sg * ENG_RSZ, ENG_RSY, 0.0088, 0.0125));
  ENG_XM.forEach(x => { L.push(xf(pc, [x, 0, 0])); pr.forEach(g => L.push(xf(g, [x, 0, 0]))); });
  // flenzen van de inlaat- en uitlaatpoorten
  const portBoss = G.lathe('z', [[0.0118, 0], [0.0165, 0], [0.0165, 0.006], [0.0118, 0.006], [0.0118, 0]], 16, 'engPortBoss');
  ENG_XC.forEach(x => { L.push(xf(portBoss, [x, ENG_PORT_Y, ENG_HZ])); L.push(xf(portBoss, [x, ENG_PORT_Y, -ENG_HZ], [0, PI, 0])); });
  return merge(L);
}
function engCamGeo() {
  return cache('engCam1', () => {
    const base = 0.0145, nose = 0.022, L = [xf(G.cyl('x', 0.0105, 0.0105, 0.4015, 12), [-0.0247, 0, 0])];
    ENG_XM.forEach(x => L.push(xf(G.cyl('x', 0.0125, 0.0125, 0.016, 14), [x, 0, 0])));
    L.push(xf(G.cyl('x', 0.0125, 0.0125, 0.008, 14), [-0.1845, 0, 0]));          // kraag voor de axiale geleiding
    const bi = [-0.5, 0.9, -0.2, 0.5], be = [0.7, -0.6, 0.3, -0.9];
    ENG_XC.forEach((xc, i) => {
      [[ENG_VXI, bi[i]], [ENG_VXE, be[i]]].forEach(([dx, beta]) => {
        const pts = [];
        for (let k = 0; k < 24; k++) { const t = k / 24 * PI * 2, r = base + (nose - base) * Math.pow(Math.max(0, Math.cos(t)), 3), a = t - HALF + beta; pts.push([r * Math.cos(a), r * Math.sin(a)]); }
        const lobe = zTo(extrude(shapeOf(pts), 0.005), 'x');
        [-dx, dx].forEach(d => L.push(xf(lobe, [xc + d, 0, 0])));
      });
    });
    return merge(L);
  });
}
// tuimelaar: zijprofiel in (z, y) voor de inlaatzijde (+z); sg = -1 spiegelt naar de uitlaatzijde
function engRockerGeo(sg) {
  return cache('engRocker' + sg, () => {
    const q = [[0.002, 0.2965], [0.024, 0.2965], [0.0275, 0.2905], [0.0345, 0.2785], [0.0385, 0.267], [0.0455, 0.267], [0.0465, 0.2765], [0.0465, 0.2865]];
    for (let k = 0; k <= 8; k++) { const a = -0.35 + k / 8 * (PI * 0.5 + 0.35 + 0.4); q.push([0.036 + 0.0105 * Math.cos(a), 0.297 + 0.0105 * Math.sin(a)]); }
    q.push([0.002, 0.3075]);
    return side(shapeOf(q.map(([z, y]) => [sg * z, y])), 0.0055);
  });
}
function engCapGeo() {
  return cache('engCap', () => {
    const ri = 0.0127, ro = 0.0195, pts = [[-0.0215, 0], [-ri, 0]];
    for (let k = 1; k < 8; k++) { const a = PI - k / 8 * PI; pts.push([ri * Math.cos(a), ri * Math.sin(a)]); }
    pts.push([ri, 0], [0.0215, 0], [0.0215, 0.005]);
    const a0 = Math.asin(0.005 / ro);
    for (let k = 0; k <= 8; k++) { const a = a0 + k / 8 * (PI - 2 * a0); pts.push([ro * Math.cos(a), ro * Math.sin(a)]); }
    pts.push([-0.0215, 0.005]);
    return merge([side(shapeOf(pts), 0.016), xf(G.cyl('y', 0.0042, 0.0042, 0.004, 8), [0, 0.0072, 0.0172]), xf(G.cyl('y', 0.0042, 0.0042, 0.004, 8), [0, 0.0072, -0.0172])]);
  });
}
// klepgroep: lokaal frame met y langs de klepas, oorsprong in het zittingvlak; kind 'in' (inlaat, +z) of 'ex' (uitlaat, -z)
function engValve(kind, cyl, k) {
  const inl = kind === 'in', sg = inl ? 1 : -1, hr = inl ? 0.011 : 0.0095, L = 0.086;
  const lab = `${cyl + 1}${k ? 'b' : 'a'}`;
  const valve = G.lathe('y', [[0, 0], [hr, 0], [hr, 0.0012], [0.0035, 0.0125], [0.0025, 0.0165], [0.0025, L], [0, L]], 10, 'engValve' + kind);
  const ret = G.lathe('y', [[0.0035, 0.0665], [0.0105, 0.0665], [0.0105, 0.0685], [0.0065, 0.0715], [0.0035, 0.0715], [0.0035, 0.0665]], 12, 'engRet');
  const keys = G.lathe('y', [[0.0025, 0.0715], [0.005, 0.0715], [0.0042, 0.0795], [0.0025, 0.0795], [0.0025, 0.0715]], 8, 'engKeys');
  const name = inl ? 'Inlaatklep' : 'Uitlaatklep';
  return A(`${name} ${lab}`, {
    d: `${name} van cilinder ${cyl + 1} (vier kleppen per cilinder, twee inlaat en twee uitlaat). Diameters, lengte en klephoek zijn geschat.`,
    p: [ENG_XC[cyl] + (k ? 1 : -1) * (inl ? ENG_VXI : ENG_VXE), ENG_VY, sg * ENG_VZ], r: [sg * ENG_VT, 0, 0], ex: [(k ? 1 : -1) * 0.03, 0, sg * 0.05],
  }, [
    P('Klep', valve, inl ? MAT.steel : MAT.darkSteel, { d: inl ? 'Inlaatklep met holle kop (schematisch), steel Ø5 mm (geschat).' : 'Uitlaatklep, kleiner van kop dan de inlaatklep, steel Ø5 mm (geschat).', ex: [0, 0, 0] }),
    P('Klepveer', engSpring(0.0085, 0.0008, 0.036, 4.5, 5), MAT.steel, { d: 'Schroefveer die de klep sluit; windingen en draaddikte geschat.', p: [0, 0.048, 0], ex: [0, 0.03, 0] }),
    P('Veerschotel', ret, MAT.darkSteel, { d: 'Bovenste veerschotel; houdt de veer op de klepsteel.', ex: [0, 0.05, 0] }),
    P('Klepkeggen', keys, MAT.steel, { d: 'Twee halve kegels die het veerschotel op de klepsteel vergrendelen (samengetekend als een onderdeel).', ex: [0, 0.07, 0] }),
  ]);
}
function engBuildCover() {
  const out = rrectPts(2 * ENG_HX, 2 * ENG_HZ, 0.02), inn = rrectPts(2 * ENG_HX - 0.006, 2 * ENG_HZ - 0.006, 0.017);
  const y1 = ENG_CAMY + 0.002, yTop = ENG_COVER_TOP;
  const skirt = plan(engRing(out, inn), yTop - 0.006 - y1); skirt.translate(0, (yTop - 0.006 + y1) / 2, 0);
  const top = engPlanHoles(out, ENG_XC.map(x => [x, ENG_PLZ, 0.0135]), 0.006); top.translate(0, yTop - 0.003, 0);
  const cover = merge([skirt, top, ...[-0.12, -0.04, 0.04, 0.12].map(x => xf(G.box(0.012, 0.0016, 0.05), [x, yTop + 0.0004, -0.03])), xf(G.cyl('y', 0.019, 0.019, 0.008, 20), [0.098, yTop + 0.003, -0.035]), xf(G.cyl('z', 0.0065, 0.0065, 0.016, 10), [-0.09, ENG_CAMY + 0.016, 0.0765])]);
  const coverBolts = [];
  [-0.15, -0.05, 0.05, 0.15].forEach(x => [-1, 1].forEach(sg => coverBolts.push([x, sg * 0.0705])));
  return A('Kleppendeksel', { d: 'Aluminium kleppendeksel met rubber pakking en oliedop: sluit de nokkenas, tuimelaars en kleppen af. De vorm is schematisch; de hoogte blijft binnen 0,40 m boven de krukas.', ex: [0, 0.3, 0] }, [
    P('Kleppendeksel', cover, MAT.engCover, { d: 'Zwart gelakt aluminium deksel met gaten voor de bougies, een opstaande rand voor de oliedop en een ontluchtingsnippel aan de voorzijde.', ex: [0, 0, 0] }),
    P('Pakking kleppendeksel', plan(engRing(out, inn), 0.002), MAT.rubber, { d: 'Rubber pakking tussen kop en kleppendeksel.', p: [0, ENG_CAMY + 0.001, 0], ex: [0, -0.04, 0] }),
    P('Olievuldop', G.lathe('y', [[0, 0], [0.016, 0], [0.0165, 0.004], [0.013, 0.012], [0, 0.012]], 16, 'engFillCap'), MAT.plastic, { d: 'Kunststof dop op de vulopening voor motorolie.', p: [0.098, yTop + 0.007, -0.035], ex: [0, 0.08, 0] }),
    P('Bougieputafdichtingen', merge(ENG_XC.map(x => xf(annulus(0.0125, 0.0155, 0.004, 'y', 16), [x, yTop - 0.003, ENG_PLZ]))), MAT.rubber, { d: 'Vier rubber ringen die de bougieputten in het kleppendeksel afdichten.', ex: [0, 0.05, 0] }),
    A('Dekselbouten', { d: 'Acht bouten van het kleppendeksel (aantal geschat).', ex: [0, 0.14, 0] }, coverBolts.map(([x, z], k) => P(`Dekselbout ${k + 1}`, hexBolt(0.016, 0.007), MAT.darkSteel, { d: 'Bout van het kleppendeksel.', p: [x, yTop, z], r: [PI, 0, 0], ex: [0, 0.03, 0] }))),
  ]);
}
function engBuildHead() {
  const hb = [];
  ENG_XM.forEach((x, i) => [-1, 1].forEach((sg, j) => hb.push([x, sg * 0.0215, i * 2 + j + 1])));
  const cap = engCapGeo();
  const caps = ENG_XM.map((x, i) => P(`Lagerdop nokkenas ${i + 1}`, cap, MAT.aluCast, { d: `Lagerdop ${i + 1} van de nokkenas.`, p: [x, ENG_CAMY, 0], ex: [0, 0.05, 0] }));
  // per cilinder een uitklapstap van een volle cilindersteek langs x: de kleppen spreiden binnen hun cilinder 30 mm naar weerszijden
  // en kwamen met 0,4 maal de steek uitgeklapt in de kleppen van de buurcilinder terecht (B-020)
  const valves = ENG_XC.map((_, i) => A(`Kleppen cilinder ${i + 1}`, { d: `De vier kleppen van cilinder ${i + 1} met veren, schotels en keggen.`, ex: [ENG_XC[i], 0.02, 0] }, [engValve('in', i, 0), engValve('in', i, 1), engValve('ex', i, 0), engValve('ex', i, 1)]));
  const adj = cache('engAdj', () => merge([xf(G.cyl('y', 0.003, 0.003, 0.0105, 8), [0, 0.00525, 0]), xf(engNut(0.0105, 0.0035, 'y'), [0, 0.0072, 0])]));
  const rockers = ENG_XC.map((xc, i) => A(`Tuimelaars cilinder ${i + 1}`, { d: `De acht tuimelaars van cilinder ${i + 1} (vier inlaat, vier uitlaat; een per klep) met stelschroef en borgmoer.`, ex: [xc * 0.3, 0.03, 0] },
    [[1, ENG_VXI, 'inlaat'], [-1, ENG_VXE, 'uitlaat']].flatMap(([sg, dx, nm]) => [-1, 1].flatMap((dk, k) => {
      const lab = `${nm} ${i + 1}${k ? 'b' : 'a'}`, x = xc + dk * dx, tz = sg * (ENG_VZ + Math.sin(ENG_VT) * 0.086), ty = ENG_VY + Math.cos(ENG_VT) * 0.086;
      return [
        P(`Tuimelaar ${lab}`, engRockerGeo(sg), MAT.darkSteel, { d: `Tuimelaar van de ${nm}klep ${i + 1}${k ? 'b' : 'a'}: draait op de tuimelaarsas, de nok drukt de ene kant omlaag en de andere kant opent de klep (vorm geschat).`, p: [x, 0, 0], ex: [dk * 0.01, 0.03, sg * 0.04] }),
        P(`Stelschroef ${lab}`, adj, MAT.steel, { d: `Stelschroef met borgmoer in de tuimelaar boven de klepsteel: stelt de klepspeling in (handboek).`, p: [x, ty, tz], ex: [0, 0.07, sg * 0.04] }),
      ];
    }))));
  return A('Cilinderkop', { d: 'Aluminium cilinderkop met vier kleppen per cilinder (16 in totaal), een bovenliggende nokkenas midden in de kop en tuimelaars op twee tuimelaarsassen die de inlaat- en uitlaatkleppen bedienen (handboek). Het aantal nokken, de vorm en alle maten zijn geschat.', spec: [['Kleppen', '16 (vier per cilinder)'], ['Kleppenbediening', 'een bovenliggende nokkenas met tuimelaars'], ['Klepspeling koud', 'inlaat 0,13 tot 0,17 mm, uitlaat 0,23 tot 0,27 mm']], ex: [0, 0.22, 0] }, [
    P('Cilinderkop (gietwerk)', engHeadGeo(), MAT.aluCast, { d: 'Kop met kanalen aan de inlaatzijde (voor) en de uitlaatzijde (achter), kleppengeleiders, lagerbokken van de nokkenas en de tuimelaarsassen en bougiebuizen. Alle maten zijn geschat.', ex: [0, 0, 0] }),
    P('Kopkoppakking', engPlanHoles(rrectPts(2 * ENG_HX, 2 * ENG_HZ, 0.02), ENG_XC.map(x => [x, 0, 0.0378]).concat(ENG_XM.flatMap(x => [[x, 0.0215, 0.0045], [x, -0.0215, 0.0045]])), ENG_GASKET), MAT.steel, { d: 'Metalen koppakking tussen blok en kop met gaten voor de cilinders en bouten (geklemde dikte geschat).', p: [0, ENG_DECK + ENG_GASKET / 2, 0], ex: [0, -0.06, 0] }),
    A('Kopbouten', { d: 'Tien kopbouten (aantal en plaats geschat) die de kop op het blok klemmen.', ex: [0, 0.2, 0] }, hb.map(([x, z, n]) => P(`Kopbout ${n}`, hexBolt(0.125, 0.009), MAT.darkSteel, { d: 'Kopbout; wordt in een vaste volgorde en hoeken aangehaald (waarden niet bevestigd).', p: [x, ENG_FLOOR + 0.016, z], r: [PI, 0, 0], ex: [0, 0.04, 0] }))),
    A('Nokkenas', { d: 'De ene bovenliggende nokkenas midden in de kop, met een keerring aan de distributiezijde.', ex: [0, 0.19, 0] }, [   // geen inner: een straal kan er tussen kop en deksel bij (golf 2)
      P('Nokkenas', engCamGeo(), MAT.steel, { d: 'Nokkenas met vijf lagertappen en zestien nokken (een per klep, schematisch); nokvorm en tappen geschat.', p: [0, ENG_CAMY, 0], ex: [0, 0, 0] }),
      P('Keerring nokkenas', annulus(0.0105, 0.0165, 0.007, 'x', 18), MAT.rubber, { d: 'Oliekeerring van de nokkenas aan de distributiezijde.', p: [-0.1815, ENG_CAMY, 0], ex: [-0.08, 0, 0] }),
    ]),
    A('Nokkenaslagerdoppen', { d: 'Vijf lagerdoppen die de nokkenas in de lagerbokken van de kop houden.', ex: [0, 0.25, 0], inner: true }, caps),
    A('Tuimelaarsassen en tuimelaars', { d: 'Twee tuimelaarsassen (inlaat voor, uitlaat achter) met zestien tuimelaars en stelschroeven; de nokkenas drukt de tuimelaars, die de kleppen openen. Zitten onder het kleppendeksel.', ex: [0, 0.13, 0], inner: true }, [
      P('Tuimelaarsas inlaat', G.cyl('x', 0.0075, 0.0075, 0.35, 12), MAT.steel, { d: 'As waarop de inlaattuimelaars draaien.', p: [0, ENG_RSY, ENG_RSZ], ex: [0, 0, 0.08] }),
      P('Tuimelaarsas uitlaat', G.cyl('x', 0.0075, 0.0075, 0.35, 12), MAT.steel, { d: 'As waarop de uitlaattuimelaars draaien.', p: [0, ENG_RSY, -ENG_RSZ], ex: [0, 0, -0.08] }),
      ...rockers,
    ]),
    A('Kleppentrein', { d: 'De zestien kleppen met veren, schotels en keggen. Zitten volledig onder het kleppendeksel.', ex: [0, 0.07, 0], inner: true }, valves),
    engBuildCover(),
  ]);
}

/* ---------- distributie ---------- */
const ENG_TCIRC = [[0, 0, 0.0215], [0, ENG_CAMY, 0.0415], [-0.052, 0.12, 0.0165]];
function engBuildTiming() {
  const X = ENG_XT;
  const belt = engBelt([[0, 0, 0.0215, 1], [0, ENG_CAMY, 0.0415, 1], [-0.052, 0.12, 0.0165, -1]], 0.022, 0.004);
  const hullPts = g => hull(ENG_TCIRC.flatMap(([a, b, r]) => Array.from({ length: 28 }, (_, i) => { const t = i / 28 * PI * 2; return [a + (r + g) * Math.cos(t), b + (r + g) * Math.sin(t)]; })));
  const rim = side(engRing(hullPts(0.0115), hullPts(0.008)), 0.045); rim.translate(-0.201, 0, 0);
  const faceS = shapeOf(hullPts(0.0115)); faceS.holes.push(circlePath(0, 0, 0.0145));
  const face = side(faceS, 0.003); face.translate(-0.2250, 0, 0);
  const gasket = side(engRing(hullPts(0.0115), hullPts(0.008)), 0.0015); gasket.translate(-0.1793, 0, 0);
  const pts = [[-0.052, 0.12, 0.0165], [-0.058, 0.07, 0.011]];
  const arm = side(shapeOf(hull(pts.flatMap(([a, b, r]) => Array.from({ length: 16 }, (_, i) => { const t = i / 16 * PI * 2; return [a + r * Math.cos(t), b + r * Math.sin(t)]; })))), 0.006); arm.translate(-0.1905, 0, 0);
  const roller = G.lathe('x', [[0.006, -0.011], [0.019, -0.011], [0.019, -0.0095], [0.0165, -0.0095], [0.0165, 0.0095], [0.019, 0.0095], [0.019, 0.011], [0.006, 0.011], [0.006, -0.011]], 20, 'engTRoller');
  const camGear = gear(36, 0.0415, 0.0388, 0.02, 0.0105, 'x'), crGear = gear(18, 0.0215, 0.0185, 0.02, 0.0155, 'x');
  const coverBolts = [[0.02, 0.31], [-0.02, 0.31], [0, 0.2], [-0.052, 0.12], [0.02, 0.12], [0, 0.05]];
  return A('Distributie', { d: 'Getande distributieriem van de krukas naar het tandwiel van de ene nokkenas, met een spanrol en een kunststof beschermkap. De riem, het aantal tanden en de plaats van de spanrol zijn geschat; het handboek bevestigt alleen een distributieriem met spanrol en veer.', ex: [-0.13, 0, 0] }, [
    P('Distributieriem', belt, MAT.belt, { d: 'Getande riem (tanden niet getekend) die krukas en nokkenas koppelt in verhouding 1 op 2; breedte 22 mm geschat.', p: [X, 0, 0], ex: [-0.08, 0, 0] }),
    P('Krukastandwiel distributie', crGear, MAT.steel, { d: 'Tandwiel op de krukasneus (18 tanden, schematisch).', p: [X, 0, 0], ex: [-0.1, 0, 0] }),
    P('Nokkenwiel', camGear, MAT.steel, { d: 'Tandwiel op de nokkenas (36 tanden, schematisch: twee maal het krukaswiel).', p: [X, ENG_CAMY, 0], ex: [-0.1, 0, 0] }),
    P('Nokkenwielbout', hexBolt(0.03, 0.012, 'x'), MAT.darkSteel, { d: 'Bout die het nokkenwiel op de nokkenas vastzet.', p: [X - 0.0105, ENG_CAMY, 0], ex: [-0.17, 0, 0] }),
    A('Spanner distributieriem', { d: 'Spanrol met arm, veer en bout: houdt de riem op spanning (opbouw schematisch).', ex: [-0.04, 0, -0.1] }, [
      P('Spanrol', roller, MAT.darkSteel, { d: 'Rol die tegen de rug van de riem loopt.', p: [X, 0.12, -0.052], ex: [-0.07, 0, 0] }),
      P('Spanarm', arm, MAT.steel, { d: 'Draaiarm waarop de spanrol zit.', ex: [0, 0, 0] }),
      P('Spanveer', engSpring(0.005, 0.0008, 0.03, 7, 6, 'x'), MAT.steel, { d: 'Veer die de arm tegen de riem drukt.', p: [-0.1905, 0.09, -0.04], ex: [0, 0, -0.06] }),
      P('Spanbout', hexBolt(0.03, 0.01, 'x'), MAT.darkSteel, { d: 'Draaipuntbout van de spanarm in het blok.', p: [-0.1935, 0.07, -0.058], ex: [-0.1, 0, 0] }),
    ]),
    P('Distributiekap', merge([rim, face]), MAT.engCover, { d: 'Beschermkap over riem, wielen en spanrol, met een opening voor de krukasneus. Vorm geschat; in werkelijkheid vaak in een boven- en onderdeel.', ex: [-0.24, 0, 0] }),
    P('Pakking distributiekap', gasket, MAT.rubber, { d: 'Rubber pakking tussen het blok en de distributiekap.', ex: [-0.03, 0, 0] }),
    A('Kapbouten', { d: 'Zes bouten van de distributiekap (aantal en plaats geschat).', ex: [-0.26, 0, 0] }, coverBolts.map(([z, y], k) => P(`Kapbout ${k + 1}`, hexBolt(0.02, 0.008, 'x'), MAT.darkSteel, { d: 'Bout van de distributiekap.', p: [-0.2265, y, z], ex: [-0.04, 0, 0] }))),
  ]);
}

/* ---------- hulpaandrijving: krukaspoelie, multiriem, dynamo ---------- */
function engPoly(R, key, hubR = 0.0125) {
  const pts = [[hubR, -0.0125], [R, -0.0125]];
  [-0.0095, -0.0065, -0.0035, -0.0005, 0.0025, 0.0055, 0.0085, 0.0115].forEach((x, i) => pts.push([i % 2 ? R : R - 0.0015, x]));
  pts.push([R, 0.0125], [R - 0.006, 0.0125], [R - 0.006, 0.0045], [hubR + 0.01, 0.0045], [hubR + 0.01, 0.016], [hubR, 0.016], [hubR, -0.0125]);
  return G.lathe('x', pts, 32, key);
}
function engBuildAccessory() {
  const XA = ENG_XA;
  const ptop = [0, 0, 0.052], alt = [ENG_ALT[0], ENG_ALT[1], 0.028], pump = [ENG_PUMP[2], ENG_PUMP[1], 0.032], rol = [0.075, -0.074, 0.02];
  const belt = engBelt([[ptop[0], ptop[1], ptop[2], 1], [rol[0], rol[1], rol[2], -1], [alt[0], alt[1], alt[2], 1], [pump[0], pump[1], pump[2], 1]], 0.024, 0.0045);
  const [az, ay] = ENG_ALT;
  const frontH = G.lathe('x', [[0.011, -0.0125], [0.03, -0.0125], [0.058, -0.0125], [0.058, 0.0125], [0.056, 0.0235], [0.0, 0.0235], [0, -0.0125]], 28, 'engAltFront');
  const rearH = G.lathe('x', [[0.011, 0.0], [0.056, 0.0], [0.056, 0.014], [0.05, 0.026], [0.0, 0.026], [0, 0]], 28, 'engAltRear');
  const stator = G.lathe('x', [[0.04, -0.015], [0.0565, -0.015], [0.0565, 0.015], [0.04, 0.015], [0.04, -0.015]], 28, 'engAltStator');
  const rotor = G.cyl('x', 0.0345, 0.0345, 0.052, 16), shaft = G.cyl('x', 0.0085, 0.0085, 0.15, 10);
  const lug = side(shapeOf([[0.088 - az, 0.03 - ay], [0.112 - az, 0.03 - ay], [0.112 - az, 0.07 - ay], [0.088 - az, 0.07 - ay]]), 0.012);
  const regul = G.box(0.03, 0.02, 0.05);
  const post = G.cyl('x', 0.006, 0.006, 0.0525, 10);
  const armPts = [[0.045, -0.062, 0.011], [rol[0], rol[1], 0.012]];
  const arm = side(shapeOf(hull(armPts.flatMap(([a, b, r]) => Array.from({ length: 14 }, (_, i) => { const t = i / 14 * PI * 2; return [a + r * Math.cos(t), b + r * Math.sin(t)]; })))), 0.005);
  const rolG = G.lathe('x', [[0.006, -0.012], [0.0215, -0.012], [0.0215, -0.0105], [0.019, -0.0105], [0.019, 0.0105], [0.0215, 0.0105], [0.0215, 0.012], [0.006, 0.012], [0.006, -0.012]], 20, 'engPRoller');
  return A('Hulpaandrijving', { d: 'Multiriem (poly-V) van de krukaspoelie naar de dynamo en de waterpomp, met spanrol. Het handboek noemt alleen een eigen riem van de krukaspoelie naar de koelvloeistofpomp; de dynamo-aandrijving en de lusvorm zijn hier aangenomen.', ex: [-0.26, 0, 0] }, [
    P('Krukaspoelie', engPoly(0.052, 'engCPul'), MAT.steel, { d: 'Stalen poelie met vier groeven op de krukasneus voor de multiriem (diameter geschat).', p: [XA, 0, 0], ex: [-0.04, 0, 0] }),
    P('Krukasbout', hexBolt(0.032, 0.016, 'x'), MAT.darkSteel, { d: 'Centrale bout die de poelie op de krukasneus vastzet.', p: [XA - 0.0125, 0, 0], ex: [-0.12, 0, 0] }),
    P('Multiriem', belt, MAT.belt, { d: 'Geribde riem (ribben niet getekend) over krukaspoelie, spanrol, dynamo en waterpomp; breedte en lengte geschat.', p: [XA, 0, 0], ex: [-0.07, 0, 0] }),
    A('Spanrol multiriem', { d: 'Rol met arm en as die de multiriem onder de krukaspoelie aanspant (aangenomen).', ex: [-0.1, -0.1, 0] }, [
      P('Spanrol', rolG, MAT.darkSteel, { d: 'Gladde rol tegen de rug van de multiriem.', p: [XA, rol[1], rol[0]], ex: [-0.05, 0, 0] }),
      P('Spanarm', arm, MAT.steel, { d: 'Draaiarm van de spanrol.', p: [-0.2285, 0, 0], ex: [-0.02, 0, 0] }),
      P('Spanas', post, MAT.darkSteel, { d: 'As waarop de arm draait, in het blok geschroefd.', p: [-0.2045, -0.062, 0.045], ex: [-0.1, 0, 0] }),
    ]),
    A('Dynamo', { d: 'Wisselstroomdynamo met ingebouwde regelaar, aangedreven door de multiriem. Type, vermogen en afmetingen zijn niet bevestigd; de plaats aan de voorzijde onder de kop is aangenomen.', p: [0, ay, az], ex: [-0.04, -0.07, 0.12] }, [
      P('Dynamo voorhuis', frontH, MAT.aluCast, { d: 'Aluminium voorhuis met lager en bevestigingsoog (schematisch).', p: [-0.1855, 0, 0], ex: [-0.07, 0, 0] }),
      P('Dynamo stator', stator, MAT.iron, { d: 'Gelamelleerde statorring met wikkelingen (schematisch als massieve ring).', p: [-0.147, 0, 0], ex: [-0.02, 0, 0] }),
      P('Dynamo achterhuis', rearH, MAT.aluCast, { d: 'Achterhuis met koelopeningen en de diodebrug (niet getekend).', p: [-0.132, 0, 0], ex: [0.04, 0, 0] }),
      P('Spanningsregelaar', regul, MAT.engCoil, { d: 'Elektronische spanningsregelaar met borstelhouder op de achterzijde (schematisch).', p: [-0.12, 0.06, 0], ex: [0.06, 0.03, 0] }),
      P('Dynamoas', shaft, MAT.steel, { d: 'As van de dynamorotor met lagers; draagt aan het uiteinde de poelie.', p: [-0.1675, 0, 0], ex: [-0.09, 0, 0] }),
      P('Dynamorotor', rotor, MAT.darkSteel, { d: 'Rotor met klauwpolen en slepringen op de as (schematisch).', p: [-0.147, 0, 0], ex: [0.0, 0, 0.0] }),
      P('Dynamopoelie', engPoly(0.028, 'engAPul', 0.0085), MAT.steel, { d: 'Poelie met groeven voor de multiriem.', p: [XA, 0, 0], ex: [-0.05, 0, 0] }),
      P('Dynamomoer', engNut(0.018, 0.008, 'x'), MAT.darkSteel, { d: 'Moer die de poelie op de dynamoas vasthoudt.', p: [XA - 0.0165, 0, 0], ex: [-0.1, 0, 0] }),
      P('Dynamosteun', lug, MAT.aluCast, { d: 'Gietaluminium beugel waarmee de dynamo aan het uiteinde van het blok hangt.', p: [-0.184, 0, 0], ex: [0.0, 0.0, -0.07] }),
    ]),
  ]);
}

/* ---------- koelcircuit van de motor: waterpomp en thermostaathuis ---------- */
function engBuildCooling() {
  const [px, py, pz] = ENG_PUMP;
  const arm = side(shapeOf(hull([...Array.from({ length: 16 }, (_, i) => { const t = i / 16 * PI * 2; return [pz + 0.034 * Math.cos(t), py + 0.034 * Math.sin(t)]; }), [0.07, 0.055], [0.07, 0.125]])), 0.012); arm.translate(-0.184, 0, 0);
  const volute = merge([G.lathe('x', [[0, -0.006], [0.03, -0.006], [0.03, 0.006], [0, 0.006]], 24, 'engVolute'), xf(G.cyl('z', 0.0145, 0.0145, 0.0445, 14), [0, 0, 0.02225])]);
  const impeller = merge([G.lathe('x', [[0, -0.004], [0.026, -0.004], [0.026, 0.0], [0, 0.0]], 20, 'engImp'), ...[0, 1, 2, 3, 4, 5].map(k => xf(G.box(0.006, 0.024, 0.0025), [-0.0035, 0.012, 0], [k / 6 * PI * 2, 0, 0]))]);
  const hullTherm = G.lathe('y', [[0.0, 0], [0.019, 0], [0.019, 0.05], [0.0125, 0.052], [0.0125, 0.075], [0.0, 0.075]], 16, 'engThHouse');
  const arm2 = G.box(0.032, 0.03, 0.02);
  return A('Koelcircuit motor', { d: 'Waterpomp met thermostaathuis op de kop. Het handboek noemt een koelvloeistofpomp met eigen aandrijfriem van de krukaspoelie en een thermostaat; plaats en opbouw zijn hier aangenomen.', ex: [-0.08, 0.04, 0.2] }, [
    A('Waterpomp', { d: 'Centrifugaalpomp aan de poeliezijde van het blok; zuigt koelvloeistof uit de onderste radiateurslang en perst die door het blok. Maten en plaats geschat.', ex: [-0.04, 0, 0.0] }, [
      P('Pomphuis', merge([arm, xf(volute, [px - 0.0, py, pz])]), MAT.aluCast, { d: 'Aluminium pomphuis met steun tegen de kopse kant van het blok en de aanzuigstomp naar voren.', ex: [0, 0, 0] }),
      P('Pakking waterpomp', annulus(0.011, 0.034, 0.0008, 'x', 20), MAT.rubber, { d: 'Pakking tussen pomphuis en blok.', p: [-0.1784, py, pz], ex: [0.03, 0, 0] }),
      P('Waaier', impeller, MAT.steel, { d: 'Waaier met zes schoepen in de pompkamer (aantal geschat).', p: [-0.185, py, pz], ex: [0.03, 0, 0], inner: true }),
      P('Pompas met lager', G.cyl('x', 0.007, 0.007, 0.07, 10), MAT.steel, { d: 'Pompas met lager en asafdichting (schematisch als een as).', p: [px - 0.0207, py, pz], ex: [-0.07, 0, 0] }),
      P('Poelie waterpomp', engPoly(0.032, 'engWPul', 0.007), MAT.steel, { d: 'Poelie voor de multiriem op de pompas.', p: [ENG_XA, py, pz], ex: [-0.1, 0, 0] }),
      P('Slangstomp waterpomp', G.lathe('z', [[0.0105, 0], [0.0145, 0], [0.0145, 0.004], [0.0135, 0.004], [0.0135, 0.006], [0.0145, 0.006], [0.0145, 0.01], [0.0105, 0.01], [0.0105, 0]], 14, 'engBarb'), MAT.aluCast, { d: 'Afgeronde stomp met rand waarop de onderste radiateurslang klemt.', p: [px, py, 0.1655], ex: [0, 0, 0.06] }),
      ...[[0.075, 0.11], [0.075, 0.07]].map(([z, y], k) => P(`Pompbout ${k + 1}`, hexBolt(0.024, 0.008, 'x'), MAT.darkSteel, { d: 'Bout die het pomphuis op het blok vastzet.', p: [-0.196, y, z], ex: [-0.07, 0, 0] })),
    ]),
    A('Thermostaathuis', { d: 'Huis met thermostaat aan de poeliezijde van de kop: laat koelvloeistof pas naar de radiateur als de motor warm is. Plaats aangenomen.', ex: [-0.04, 0.12, 0.02] }, [
      P('Thermostaatbehuizing', merge([xf(hullTherm, [-0.162, 0.225, 0.1]), xf(arm2, [-0.162, 0.235, 0.0905])]), MAT.aluCast, { d: 'Aluminium behuizing met hals naar boven voor de bovenste radiateurslang; vastgeschroefd aan de voorzijde van de kop.', ex: [0, 0, 0.08] }),
      P('Thermostaat', merge([G.cyl('y', 0.012, 0.012, 0.03, 14), xf(annulus(0.012, 0.0185, 0.003, 'y', 16), [0, 0.015, 0])]), MAT.copper, { d: 'Wasthermostaat met klepschijf (schematisch).', p: [-0.162, 0.255, 0.1], ex: [0, 0.05, 0], inner: true }),
      P('Thermostaatveer', engSpring(0.0075, 0.0007, 0.025, 6, 6), MAT.steel, { d: 'Veer die de thermostaat sluit.', p: [-0.162, 0.26, 0.1], ex: [0, 0.08, 0], inner: true }),
      P('Pakking thermostaat', annulus(0.0125, 0.0195, 0.0015, 'y', 18), MAT.rubber, { d: 'Rubber afdichting onder de thermostaat.', p: [-0.162, 0.2745, 0.1], ex: [0, 0.03, 0] }),
      P('Slangklem thermostaathuis', G.torus('y', 0.0135, 0.0015, 18, 4), MAT.steel, { d: 'Klem op de hals van het thermostaathuis.', p: [-0.162, 0.292, 0.1], r: [0, 0, 0], ex: [0, 0.1, 0] }),
      ...[[-0.172, 0.082], [-0.152, 0.082]].map(([x, z], k) => P(`Bout thermostaathuis ${k + 1}`, hexBolt(0.02, 0.007, 'z'), MAT.darkSteel, { d: 'Bout die het thermostaathuis op de kop houdt.', p: [x, 0.235, 0.1005], r: [0, PI, 0], ex: [0, 0, 0.06] })),
    ]),
  ]);
}
