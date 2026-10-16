/* ===================== engine1.js: motor G10BB, deel 1: maten, aansluitpunten, hulpen, motorblok met carterpan, krukmechanisme, vliegwiel ===================== */
// Motorframe (docs/contract.md, hoofdstuk 3): oorsprong op de krukas-as, in het midden van het blok (tussen cilinder 2 en 3),
// +x naar de vliegwiel- en bakzijde (links in de auto), +y langs de cilinders omhoog, +z naar de inlaatzijde (voor).
// Cilinder 1 staat aan de poeliezijde (-x, rechts in de auto). Distributie en krukaspoelie zitten rechts.
// Alleen boring x slag (72,0 x 61,0 mm) en inhoud (993 cc) zijn geverifieerd; alle andere maten in dit domein zijn geschat.
const ENG_XC = [-0.1185, -0.0395, 0.0395, 0.1185];       // cilinderhartlijnen 1..4 (steek 79 mm, geschat; contract hoofdstuk 3)
const ENG_XM = [-0.158, -0.079, 0, 0.079, 0.158];        // hoofdlagers 1..5 (het axiaallager zit tussen cilinder 2 en 3)
const ENG_BORE_R = 0.036, ENG_THROW = 0.0305, ENG_ROD = 0.1045;   // boring 72,0 mm, slag 61,0 mm (kruktap 30,5 mm uit het hart), drijfstang geschat
const ENG_PIN_UP = [1, -1, -1, 1];                       // krukpennen 1 en 4 boven, 2 en 3 onder (180 graden krukas)
const ENG_MJ_R = 0.0225, ENG_PIN_R = 0.0195;             // hoofdlagertap Ø45 mm, krukpen Ø39 mm (geschat)
const ENG_DECK = 0.1625, ENG_GASKET = 0.0012;            // blokvlak en geklemde kopkoppakking
const ENG_HX = 0.178, ENG_HZ = 0.080;                    // halve lengte en halve breedte van blok en kop (blokeinde 0,178: contract)
const ENG_HEAD_Y0 = ENG_DECK + ENG_GASKET;               // onderkant kop
const ENG_FLOOR = 0.206;                                 // bovenkant van de kopplaat: zetel van de klepveren
const ENG_VT = 0.19, ENG_VZ = 0.0255, ENG_VY = ENG_DECK + 0.014, ENG_VDX = 0.0135, ENG_VAX = 0.105;   // klephoek, klepzitting, afstand zitting tot nokkenas
const ENG_CAMY = ENG_VY + ENG_VAX * Math.cos(ENG_VT);    // hartlijn nokkenassen (hoogte)
const ENG_CAMZ = ENG_VZ + ENG_VAX * Math.sin(ENG_VT);    // nokkenas inlaat op +z, uitlaat op -z
const ENG_COVER_TOP = ENG_CAMY + 0.0345;                 // bovenkant kleppendeksel (contract: hoogstens 0,40 boven de krukas)
const ENG_XT = -0.2075, ENG_XA = -0.245;                 // vlak van de distributieriem en van de multiriem (poeliezijde)
const ENG_PORT_Y = 0.188;                                // hoogte van de inlaat- en uitlaatpoorten in de kop
const ENG_PLEN = [0, 0.262, 0.165];                      // hart van de inlaatkast
const ENG_RAIL = [0, 0.255, 0.112];                      // hart van de verdeelleiding
const ENG_COLL = [0.02, 0.17, -0.215];                   // bovenkant van de verzamelaar van het uitlaatspruitstuk
const ENG_PUMP = [-0.189, 0.09, 0.12];                   // waterpompas (x, y, z)
const ENG_ALT = [0.145, -0.02];                          // dynamo-as (z, y)
const ENG_FILT = [0.075, 0.0];                           // oliefilter (x, y)

// Aansluitpunten in het motorframe. systems.js sluit slangen en leidingen hierop aan. De sleutels blijven bestaan (contract
// hoofdstuk 5); p = punt, dir = richting waarin een slang of pijp de aansluiting verlaat. Alle plaatsen zijn geschat.
const ENG_PORTS = {
  exhaustOut: { p: [ENG_COLL[0], 0.138, ENG_COLL[2]], dir: [0, -1, 0] },            // onderkant van de verzamelaar (flens naar de voorkatalysator)
  throttleIn: { p: [0.19, ENG_PLEN[1], ENG_PLEN[2]], dir: [1, 0, 0] },              // ingang van het gasklephuis (luchtfilterslang)
  thermostatOut: { p: [-0.162, 0.30, 0.10], dir: [0, 1, 0] },                       // hals van het thermostaathuis (koelslang boven naar de radiateur)
  waterPumpIn: { p: [ENG_PUMP[0], ENG_PUMP[1], 0.1755], dir: [0, 0, 1] },             // aanzuigstomp van de waterpomp (koelslang onder)
  fuelRailIn: { p: [0.20, ENG_RAIL[1], ENG_RAIL[2]], dir: [1, 0, 0] },               // koppeling aan het einde van de verdeelleiding
  evapPurge: { p: [0.05, ENG_PLEN[1] + 0.044, ENG_PLEN[2]], dir: [0, 1, 0] },        // aansluiting op de inlaatkast voor het koolstoffilter (EVAP)
};
// punt op afstand d buiten een aansluiting, langs dir (motorframe)
function portAt(port, d = 0) { return [port.p[0] + port.dir[0] * d, port.p[1] + port.dir[1] * d, port.p[2] + port.dir[2] * d]; }

/* ---------- materialen (voorvoegsel eng) ---------- */
std('engCover', 0x2c3035, 0.5, 0.55);          // zwart gelakt aluminium (kleppendeksel, distributiekappen)
std('engHarness', 0x17181a, 0, 0.8);           // omwikkelde kabelboom
std('engCoil', 0x23262b, 0.1, 0.5);            // kunststof bobine en stroomverdelerkap

/* ---------- kleine hulpen ---------- */
function engNut(d, h, ax = 'y') { return cache(`engNut${d}|${h}|${ax}`, () => yTo(new THREE.CylinderGeometry(d * 0.92, d * 0.92, h, 6), ax)); }
// schroefveer met weinig segmenten
function engSpring(R, wire, h, turns, per = 6, ax = 'y') {
  return cache(`engSp${R}|${wire}|${h}|${turns}|${per}|${ax}`, () => {
    const pts = [], N = Math.ceil(turns * per);
    for (let i = 0; i <= N; i++) { const t = i / N, a = t * turns * PI * 2; pts.push(V3(R * Math.cos(a), t * h - h / 2, R * Math.sin(a))); }
    return yTo(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), N, wire, 4, false), ax);
  });
}
// halve ring rond de x-as: upper = bovenste helft (y >= 0), anders de onderste
function engHalfRing(rIn, rOut, t, key, upper = true) {
  return cache('engHalf' + key + upper, () => yTo(new THREE.LatheGeometry([[rIn, -t / 2], [rOut, -t / 2], [rOut, t / 2], [rIn, t / 2], [rIn, -t / 2]].map(p => new THREE.Vector2(...p)), 18, upper ? PI : 0, PI), 'x'));
}
// vorm uit punten met gaten (gaten als lijst [x, y, straal]) in het (x,z)-vlak, dikte langs y
function engPlanHoles(outline, holes, depth, seg = 12) {
  const s = shapeOf(outline);
  holes.forEach(([x, z, r]) => { const h = new THREE.Path(); h.absarc(x, z, r, 0, PI * 2, true); s.holes.push(h); });
  return plan(s, depth);
}
function engRing(outline, inner) { const s = shapeOf(outline); s.holes.push(new THREE.Path(inner.map(p => new THREE.Vector2(p[0], p[1])))); return s; }
function engOff(pts, dx, dy) { return pts.map(p => [p[0] + dx, p[1] + dy]); }
// riem langs poelies in het (z,y)-vlak met de breedte langs x. pulleys: [z, y, r, s] in looprichting;
// s = +1: poelie binnen de lus, s = -1: rol tegen de rug van de riem. Geeft de geometrie.
function engBelt(pulleys, w, t, step = 0.12) {
  const R = pulleys.map(([z, y, r, s]) => [z, y, s * (r + t / 2)]), n = R.length, tang = [];
  for (let i = 0; i < n; i++) {
    const [z1, y1, p1] = R[i], [z2, y2, p2] = R[(i + 1) % n];
    const dist = Math.hypot(z2 - z1, y2 - y1), a = Math.atan2(y2 - y1, z2 - z1) - Math.asin((p2 - p1) / dist);
    const L = [-Math.sin(a), Math.cos(a)];
    tang.push([[z1 - p1 * L[0], y1 - p1 * L[1]], [z2 - p2 * L[0], y2 - p2 * L[1]]]);
  }
  const pts = [];
  for (let i = 0; i < n; i++) {
    const [z, y, p] = R[i], pin = tang[(i + n - 1) % n][1], pout = tang[i][0];
    const a0 = Math.atan2(pin[1] - y, pin[0] - z), a1 = Math.atan2(pout[1] - y, pout[0] - z);
    const sw = p > 0 ? ((a1 - a0) % (2 * PI) + 2 * PI) % (2 * PI) : -(((a0 - a1) % (2 * PI) + 2 * PI) % (2 * PI));
    const k = Math.max(2, Math.ceil(Math.abs(sw) / step)), ar = Math.abs(p);
    for (let j = 0; j <= k; j++) { const a = a0 + sw * j / k; pts.push([z + ar * Math.cos(a), y + ar * Math.sin(a)]); }
  }
  // strook met rechthoekige doorsnede
  const pos = [], nor = [], idx = [], N = pts.length;
  const norm = i => { const a = pts[(i + N - 1) % N], b = pts[(i + 1) % N]; const dz = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dz, dy) || 1; return [-dy / l, dz / l]; };
  let v = 0;
  for (let f = 0; f < 4; f++) {
    for (let i = 0; i <= N; i++) {
      const q = pts[i % N], L = norm(i % N);
      const corners = f === 0 ? [[1, 1], [1, -1]] : f === 1 ? [[1, -1], [-1, -1]] : f === 2 ? [[-1, -1], [-1, 1]] : [[-1, 1], [1, 1]];
      for (const [so, sx] of corners) {
        pos.push(sx * w / 2, q[1] + L[1] * so * t / 2, q[0] + L[0] * so * t / 2);
        if (f === 0) nor.push(0, L[1], L[0]); else if (f === 2) nor.push(0, -L[1], -L[0]); else if (f === 1) nor.push(-1, 0, 0); else nor.push(1, 0, 0);
      }
      if (i < N) { const b = v + i * 2; idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2); }
    }
    v += (N + 1) * 2;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
}

/* ---------- motorblok ---------- */
function engBlockGeo() {
  const L = [], HX = ENG_HX, HZ = ENG_HZ;
  // bovendeel met de boringen (de gietijzeren bussen zitten er los in), van y 0,04 tot het blokvlak
  const s = shapeOf(rrectPts(2 * HX, 2 * HZ, 0.02));
  ENG_XC.forEach(x => { const h = new THREE.Path(); h.absarc(x, 0, ENG_BORE_R + 0.0016, 0, PI * 2, true); s.holes.push(h); });
  const up = plan(s, ENG_DECK - 0.04); up.translate(0, 0.04 + (ENG_DECK - 0.04) / 2, 0); L.push(up);
  // lange carterwanden (y -0,065 tot 0,04) en de eindplaten met het gat voor de krukas
  [-1, 1].forEach(sg => L.push(xf(G.box(2 * HX, 0.105, 0.008), [0, -0.0125, sg * 0.085])));
  const endShape = () => { const e = shapeOf([[-0.089, -0.065], [0.089, -0.065], [0.089, 0.04], [-0.089, 0.04]]); e.holes.push(circlePath(0, 0, 0.0325)); return e; };
  [-1, 1].forEach(sg => L.push(xf(side(endShape(), 0.012), [sg * (HX - 0.006), 0, 0])));
  // lagerbruggen: bovenste helft van de hoofdlagerboring in een dwarsschot
  const bulk = () => {
    const pts = [[-0.083, 0], [-0.0268, 0]];
    for (let k = 1; k < 12; k++) { const a = PI - k / 12 * PI; pts.push([0.0268 * Math.cos(a), 0.0268 * Math.sin(a)]); }
    pts.push([0.0268, 0], [0.083, 0], [0.083, 0.04], [-0.083, 0.04]);
    return shapeOf(pts);
  };
  const bg = side(bulk(), 0.02);
  ENG_XM.forEach(x => L.push(xf(bg, [x, 0, 0])));
  // ribben op de carterwanden, opname voor het oliefilter en de peilstok
  ENG_XM.forEach(x => [-1, 1].forEach(sg => L.push(xf(G.box(0.012, 0.1, 0.006), [x, -0.0125, sg * 0.092]))));
  L.push(xf(G.cyl('z', 0.034, 0.034, 0.012, 20), [ENG_FILT[0], ENG_FILT[1], 0.0925]));
  L.push(xf(G.cyl('z', 0.009, 0.009, 0.012, 10), [0.152, -0.02, 0.0925]));
  return merge(L);
}
function engMainBearing(i) {
  const x = ENG_XM[i];
  const cap = cache('engMainCap', () => {
    const pts = [[-0.0268, 0]];
    for (let k = 1; k < 12; k++) { const a = PI + k / 12 * PI; pts.push([0.0268 * Math.cos(a), 0.0268 * Math.sin(a)]); }
    pts.push([0.0268, 0], [0.052, 0], [0.052, -0.03], [0.037, -0.045], [-0.037, -0.045], [-0.052, -0.03], [-0.052, 0]);
    return side(shapeOf(pts), 0.02);
  });
  const kids = [
    P(`Hoofdlagerkap ${i + 1}`, cap, MAT.iron, { d: `Losse gietijzeren lagerkap van hoofdlager ${i + 1}, geteld vanaf de poeliezijde; houdt samen met de lagerbrug in het blok de krukas vast. Vorm geschat.`, ex: [0, -0.07, 0] }),
    P('Lagerschaal boven', G.half('x', 0.0242, 0.018, PI, 16), MAT.bearing, { d: 'Bovenste hoofdlagerschaal in het blok, met oliegroef en oliegat (schematisch).', ex: [0, 0.04, 0] }),
    P('Lagerschaal onder', G.half('x', 0.0242, 0.018, 0, 16), MAT.bearing, { d: 'Onderste, gladde hoofdlagerschaal in de lagerkap.', ex: [0, -0.04, 0] }),
    P('Lagerkapbout voor', hexBolt(0.06, 0.009), MAT.darkSteel, { d: 'Bout van de hoofdlagerkap; bij elke montage nieuw (schematisch).', p: [0, -0.045, 0.037], ex: [0, -0.12, 0] }),
    P('Lagerkapbout achter', hexBolt(0.06, 0.009), MAT.darkSteel, { d: 'Bout van de hoofdlagerkap; bij elke montage nieuw (schematisch).', p: [0, -0.045, -0.037], ex: [0, -0.12, 0] }),
  ];
  if (i === 2) {
    const tw = engHalfRing(0.0245, 0.036, 0.0024, 'Thrust', true);
    kids.push(P('Aanloopring poeliezijde', tw, MAT.bearing, { d: 'Halve aanloopring (axiaallager) naast hoofdlager 3: begrenst de axiale speling van de krukas; het axiaallager zit tussen cilinder 2 en 3 (handboek).', p: [-0.0112, 0, 0], ex: [-0.04, 0.03, 0] }));
    kids.push(P('Aanloopring bakzijde', tw, MAT.bearing, { d: 'Halve aanloopring aan de andere kant van hoofdlager 3.', p: [0.0112, 0, 0], ex: [0.04, 0.03, 0] }));
  }
  return A(`Hoofdlager ${i + 1}`, { d: `Hoofdlager ${i + 1} (geteld vanaf de poeliezijde): lagerkap, twee schalen en twee bouten${i === 2 ? ', plus de twee aanloopringen van het axiaallager' : ''}.`, p: [x, 0, 0], ex: [0, -0.2, 0] }, kids);
}
function engPanGeo() {
  const rr = (hx, hz, r) => rrectPts(2 * hx, 2 * hz, r);
  const L = [];
  const wall = (hx, hz, r, t, h, y, dx = 0) => { const g = plan(engRing(engOff(rr(hx, hz, r), dx, 0), engOff(rr(hx - t, hz - t, Math.max(r - t, 0.004)), dx, 0)), h); g.translate(0, y, 0); return g; };
  L.push(wall(0.178, 0.089, 0.018, 0.004, 0.075, -0.1025));                       // bovenste, ondiepe deel
  L.push(wall(0.1, 0.083, 0.015, 0.004, 0.05, -0.165, -0.05));                     // diepere oliebak
  L.push(wall(0.181, 0.092, 0.02, 0.014, 0.004, -0.067));                          // flens
  const floor = shapeOf(rr(0.178, 0.089, 0.018)); floor.holes.push(new THREE.Path(engOff(rr(0.096, 0.079, 0.012), -0.05, 0).map(p => new THREE.Vector2(p[0], p[1]))));
  const fl = plan(floor, 0.004); fl.translate(0, -0.138, 0); L.push(fl);
  const bot = plan(shapeOf(engOff(rr(0.1, 0.083, 0.015), -0.05, 0)), 0.004); bot.translate(0, -0.19, 0); L.push(bot);
  [-0.1, -0.05, 0].forEach(x => L.push(xf(G.box(0.006, 0.04, 0.14), [x - 0.05, -0.17, 0])));   // ribben
  return merge(L);
}
function engBuildBlock() {
  const liner = G.lathe('y', [[0.036, 0], [0.0375, 0], [0.0375, 0.1175], [0.036, 0.1175], [0.036, 0]], 28, 'engLiner');
  const boltPan = [];
  for (let k = 0; k < 5; k++) { const x = -0.14 + k * 0.07; boltPan.push([x, 0.0845], [x, -0.0845]); }
  const plug = G.cyl('x', 0.0075, 0.0075, 0.01, 10);
  return A('Motorblok', { d: 'Aluminium cilinderblok van de G10BB met vier gietijzeren cilinderbussen, vijf hoofdlagers en carterpan. Opbouw en alle maten behalve boring x slag zijn schematisch weergegeven.', ex: [0, 0, 0] }, [
    P('Cilinderblok', engBlockGeo(), MAT.aluCast, { d: 'Aluminium cilinderblok met vier boringen (siamees), lagerbruggen, ribben en opnames voor oliefilter en peilstok. Lengte 356 mm tussen de eindplaten en breedte 160 mm zijn geschat.', spec: [['Materiaal', 'aluminium'], ['Boring x slag', '72,0 x 61,0 mm'], ['Cilinderinhoud', '993 cm³']], ex: [0, 0, 0] }),
    A('Cilinderbussen', { d: 'Vier gietijzeren cilinderbussen waarin de zuigers lopen. Of de G10BB gegoten of geperste bussen heeft, is niet bevestigd.', ex: [0, 0.2, 0], inner: true },
      ENG_XC.map((x, i) => P(`Cilinderbus ${i + 1}`, liner, MAT.iron, { d: `Gietijzeren bus van cilinder ${i + 1} (geteld vanaf de poeliezijde), binnendiameter 72,0 mm; wanddikte geschat.`, p: [x, ENG_DECK - 0.1175, 0], ex: [0, 0.03, 0] }))),
    A('Hoofdlagers', { d: 'De vijf hoofdlagers met kappen en schalen, waarin de krukas draait. Het axiaallager zit tussen cilinder 2 en 3.', ex: [0, -0.1, 0], inner: true }, ENG_XM.map((_, i) => engMainBearing(i))),
    A('Keerringhuis bakzijde', { d: 'Afsluitplaat met de keerring van de krukas aan de vliegwielzijde (opbouw schematisch).', ex: [0.09, 0, 0] }, [
      P('Pakking keerringhuis', annulus(0.0495, 0.07, 0.0008, 'x', 32), MAT.rubber, { d: 'Pakking tussen blok en keerringhuis.', p: [0.1784, 0, 0], ex: [0.015, 0, 0] }),
      P('Keerringhuis', annulus(0.0495, 0.07, 0.008, 'x', 32), MAT.aluCast, { d: 'Aluminium huis rond de achterste krukaskeerring.', p: [0.1828, 0, 0], ex: [0.03, 0, 0] }),
      P('Keerring krukas bakzijde', annulus(0.0405, 0.0495, 0.006, 'x', 32), MAT.rubber, { d: 'Oliekeerring op de flens van de krukas.', p: [0.1838, 0, 0], ex: [0.06, 0, 0] }),
    ]),
    P('Centreerbus voor', G.cyl('y', 0.0065, 0.0065, 0.016, 10), MAT.steel, { d: 'Holle centreerbus die de kop op het blok positioneert (plaats geschat).', p: [-0.158, ENG_DECK, 0.062], ex: [0, 0.05, 0] }),
    P('Centreerbus achter', G.cyl('y', 0.0065, 0.0065, 0.016, 10), MAT.steel, { d: 'Tweede centreerbus tussen blok en kop.', p: [0.158, ENG_DECK, -0.062], ex: [0, 0.05, 0] }),
    A('Vorstpluggen', { d: 'Ingeperste expansiepluggen in de watermantel van het blok (aantal en plaats geschat).', ex: [0, 0, 0.0] }, [
      P('Vorstplug 1', plug, MAT.steel, { d: 'Expansieplug van de watermantel aan de poeliezijde.', p: [-0.1835, 0.1, 0.03], ex: [-0.05, 0, 0] }),
      P('Vorstplug 2', plug, MAT.steel, { d: 'Expansieplug van de watermantel aan de poeliezijde.', p: [-0.1835, 0.1, -0.03], ex: [-0.05, 0, 0] }),
      P('Vorstplug 3', plug, MAT.steel, { d: 'Expansieplug van de watermantel aan de bakzijde.', p: [0.1835, 0.1, 0.03], ex: [0.05, 0, 0] }),
      P('Vorstplug 4', plug, MAT.steel, { d: 'Expansieplug van de watermantel aan de bakzijde.', p: [0.1835, 0.1, -0.03], ex: [0.05, 0, 0] }),
    ]),
    A('Carterpan', { d: 'Plaatstalen oliecarter onder het blok met een diepere oliebak aan de poeliezijde. De inhoud van circa 3,6 liter olie is niet voor deze auto bevestigd.', ex: [0, -0.3, 0] }, [
      P('Pakking carter', plan(engRing(rrectPts(0.358, 0.182, 0.02), rrectPts(0.34, 0.164, 0.014)), 0.0008), MAT.rubber, { d: 'Rubber pakking tussen de carterflens en het blok.', p: [0, -0.0653, 0], ex: [0, 0.04, 0] }),
      P('Oliecarter', engPanGeo(), MAT.darkSteel, { d: 'Geperst plaatstalen carter met flens en ribben. De bodem ligt 190 mm onder de krukas (geschat), de onderkant van de pan op circa 0,17 m boven de grond.', ex: [0, 0, 0] }),
      P('Aftapplug', hexBolt(0.012, 0.016), MAT.steel, { d: 'Aftapplug in de bodem van de oliebak.', p: [-0.05, -0.1925, 0], ex: [0, -0.08, 0] }),
      P('Afdichtring aftapplug', annulus(0.0065, 0.0105, 0.002, 'y', 20), MAT.copper, { d: 'Koperen afdichtring onder de aftapplug; wordt bij elke olieverversing vervangen.', p: [-0.05, -0.1913, 0], ex: [0, -0.05, 0] }),
      A('Carterbouten', { d: 'Tien bouten rond de carterflens (aantal geschat).', ex: [0, -0.1, 0] }, boltPan.map(([x, z], k) => P(`Carterbout ${k + 1}`, hexBolt(0.02, 0.007), MAT.darkSteel, { d: 'Bout van de carterflens.', p: [x, -0.069, z], ex: [0, -0.04, 0] }))),
    ]),
  ]);
}

/* ---------- krukmechanisme ---------- */
function engWebGeo(up) {
  return cache('engWeb' + up, () => {
    const pts = [];
    for (let k = 0; k < 16; k++) { const a = k / 16 * PI * 2; pts.push([0.031 * Math.cos(a), 0.031 * Math.sin(a)]); }
    for (let k = 0; k < 12; k++) { const a = k / 12 * PI * 2; pts.push([0.0215 * Math.cos(a), up * ENG_THROW + 0.0215 * Math.sin(a)]); }
    const cw = [[0, 0]];
    for (let k = 0; k <= 10; k++) { const a = -up * HALF - 1.1 + k / 10 * 2.2; cw.push([0.058 * Math.cos(a), 0.058 * Math.sin(a)]); }
    return merge([side(shapeOf(hull(pts)), 0.013), side(shapeOf(cw), 0.013)]);
  });
}
function engCrankGeo() {
  const L = [];
  ENG_XM.forEach(x => L.push(xf(G.cyl('x', ENG_MJ_R, ENG_MJ_R, 0.026, 18), [x, 0, 0])));
  ENG_XC.forEach((x, i) => {
    const up = ENG_PIN_UP[i];
    L.push(xf(G.cyl('x', ENG_PIN_R, ENG_PIN_R, 0.028, 18), [x, up * ENG_THROW, 0]));
    [-0.02, 0.02].forEach(dx => L.push(xf(engWebGeo(up), [x + dx, 0, 0])));
  });
  L.push(xf(G.cyl('x', 0.0155, 0.0155, 0.0485, 14), [-0.19425, 0, 0]));       // neus onder het distributiewiel
  L.push(xf(G.cyl('x', 0.0125, 0.0125, 0.037, 14), [-0.237, 0, 0]));          // neus onder de poelie
  L.push(xf(G.cyl('x', 0.0225, 0.0225, 0.0078, 14), [0.1749, 0, 0]));         // hals achter hoofdlager 5
  L.push(xf(G.cyl('x', 0.04, 0.04, 0.0107, 28), [0.18415, 0, 0]));            // flens voor het vliegwiel
  return merge(L);
}
let ENG_ROD_GEOS = null;
function engRodShapes() {
  if (ENG_ROD_GEOS) return ENG_ROD_GEOS;
  const bo = 0.0285, bi = 0.0213, sr = 0.0125, sy = ENG_ROD, ph = 1.0, rodPts = [], capPts = [];
  rodPts.push([bi, 0], [bo, 0]);
  for (let k = 1; k <= 5; k++) { const a = k / 5 * ph; rodPts.push([bo * Math.cos(a), bo * Math.sin(a)]); }
  for (let k = 0; k <= 10; k++) { const a = -0.25 + k / 10 * (PI + 0.5); rodPts.push([sr * Math.cos(a), sy + sr * Math.sin(a)]); }
  for (let k = 5; k >= 1; k--) { const a = PI - k / 5 * ph; rodPts.push([bo * Math.cos(a), bo * Math.sin(a)]); }
  rodPts.push([-bo, 0], [-bi, 0]);
  for (let k = 1; k < 10; k++) { const a = PI - k / 10 * PI; rodPts.push([bi * Math.cos(a), bi * Math.sin(a)]); }
  const rod = shapeOf(rodPts); rod.holes.push(circlePath(0, sy, 0.0095));
  capPts.push([bi, 0], [bo, 0]);
  for (let k = 1; k < 10; k++) { const a = -k / 10 * PI; capPts.push([bo * Math.cos(a), bo * Math.sin(a)]); }
  capPts.push([-bo, 0], [-bi, 0]);
  for (let k = 1; k < 10; k++) { const a = PI + k / 10 * PI; capPts.push([bi * Math.cos(a), bi * Math.sin(a)]); }
  ENG_ROD_GEOS = [side(rod, 0.018), side(shapeOf(capPts), 0.018)];
  return ENG_ROD_GEOS;
}
function engPistonGroup(i) {
  const py = ENG_PIN_UP[i] * ENG_THROW, pp = py + ENG_ROD, n = i + 1, rg = engRodShapes();
  const piston = cache('engPiston', () => merge([
    G.lathe('y', [[0, 0.027], [0.0356, 0.027], [0.0357, 0.0255], [0.0357, -0.025], [0.0325, -0.025], [0.0325, 0.015], [0, 0.015]], 24, 'engPistonLathe'),
    G.cyl('x', 0.0125, 0.0125, 0.052, 12),
  ]));
  const ring = (r, k) => G.torus('y', 0.0356, r, 24, 4);
  return A(`Zuiger en drijfstang ${n}`, { d: `Zuiger-drijfstanggroep van cilinder ${n}, geteld vanaf de poeliezijde (cilinder 1 aan de poeliezijde, handboek). Ontsteekvolgorde en alle maten zijn voor de G10BB niet bevestigd.`, p: [ENG_XC[i], 0, 0], ex: [ENG_XC[i] * 0.5, 0.1, 0] }, [
    P('Zuiger', piston, MAT.alu, { d: 'Aluminium zuiger, diameter 72 mm minus speling, met drie veergroeven (schematisch).', p: [0, pp, 0], ex: [0, 0.05, 0] }),
    A('Zuigerveren', { d: 'De drie zuigerveren: twee compressieveren en een olieschraapveer.', p: [0, pp, 0], ex: [0, 0.12, 0] }, [
      P('Compressieveer 1', ring(0.0012), MAT.darkSteel, { d: 'Bovenste compressieveer: dicht de verbrandingsruimte af.', p: [0, 0.0205, 0], ex: [0, 0.03, 0] }),
      P('Compressieveer 2', ring(0.0012), MAT.darkSteel, { d: 'Tweede compressieveer; schraapt ook olie terug.', p: [0, 0.0155, 0], ex: [0, 0.015, 0] }),
      P('Olieschraapveer', ring(0.0016), MAT.steel, { d: 'Olieschraapveer in de onderste groef (opbouw schematisch).', p: [0, 0.0095, 0], ex: [0, -0.005, 0] }),
    ]),
    P('Zuigerpen', G.cyl('x', 0.009, 0.009, 0.055, 12), MAT.steel, { d: 'Vrij zwevende zuigerpen (afmeting geschat).', p: [0, pp, 0], ex: [ENG_XC[i] < 0 ? -0.05 : 0.05, 0, 0] }),
    P('Borgveren zuigerpen', merge([xf(G.torus('x', 0.0088, 0.0007, 14, 4), [0.0262, 0, 0]), xf(G.torus('x', 0.0088, 0.0007, 14, 4), [-0.0262, 0, 0])]), MAT.steel, { d: 'Twee borgveren die de zuigerpen in de zuiger houden.', p: [0, pp, 0], ex: [0, 0.03, 0.07] }),
    P('Drijfstang', rg[0], MAT.steel, { d: 'Gesmede drijfstang (I-profiel schematisch als vlakke balk); hartafstand 104,5 mm is geschat.', p: [0, py, 0], ex: [0, 0, 0] }),
    P('Kleinoogbus', annulus(0.009, 0.0098, 0.018, 'x', 16), MAT.bearing, { d: 'Bronzen bus in het kleine drijfstangoog waarin de zuigerpen draait.', p: [0, pp, 0], ex: [ENG_XC[i] < 0 ? 0.04 : -0.04, 0.02, 0] }),
    P('Drijfstanglagerschaal boven', G.half('x', 0.0198, 0.0165, PI, 16), MAT.bearing, { d: 'Glijlagerschaal in het grote oog van de drijfstang.', p: [0, py, 0], ex: [0, 0.03, 0.05] }),
    P('Drijfstanglagerschaal onder', G.half('x', 0.0198, 0.0165, 0, 16), MAT.bearing, { d: 'Glijlagerschaal in de drijfstangkap.', p: [0, py, 0], ex: [0, -0.03, 0.05] }),
    P('Drijfstangkap', rg[1], MAT.steel, { d: 'Afneembare kap van het grote drijfstangoog.', p: [0, py, 0], ex: [0, -0.07, 0] }),
    P('Drijfstangbout voor', hexBolt(0.036, 0.007), MAT.darkSteel, { d: 'Bout van de drijfstangkap; na demontage vervangen (schematisch).', p: [0, py - 0.0285, 0.0235], ex: [0, -0.12, 0.02] }),
    P('Drijfstangbout achter', hexBolt(0.036, 0.007), MAT.darkSteel, { d: 'Bout van de drijfstangkap; na demontage vervangen (schematisch).', p: [0, py - 0.0285, -0.0235], ex: [0, -0.12, -0.02] }),
  ]);
}
function engBuildCrank() {
  return A('Krukmechanisme', { d: 'Krukas met de vier zuiger-drijfstanggroepen: zet de op- en neergaande beweging van de zuigers om in draaiing. Viercilinder in lijn, krukpennen 1 en 4 tegenover 2 en 3.', ex: [0, -0.2, 0], inner: true }, [
    P('Krukas', engCrankGeo(), MAT.steel, { d: 'Krukas met vijf hoofdlagertappen, vier krukpennen en acht tegengewichten; slag 61,0 mm. Tegengewichten en tapdiameters zijn geschat.', spec: [['Slag', '61,0 mm'], ['Hoofdlagers', '5']], ex: [0, 0, 0] }),
    ...ENG_XC.map((_, i) => engPistonGroup(i)),
  ]);
}

/* ---------- vliegwiel ---------- */
function engBuildFlywheel() {
  const X0 = 0.1985, bolts = [0, 1, 2, 3, 4, 5].map(k => { const a = k / 6 * PI * 2; return [0.0325 * Math.cos(a), 0.0325 * Math.sin(a)]; });
  const wheel = G.lathe('x', [[0.0, -0.009], [0.1205, -0.009], [0.1205, 0.009], [0.1, 0.009], [0.1, 0.006], [0.05, 0.006], [0.044, 0.009], [0.0, 0.009]].map(p => [p[0], p[1]]), 40, 'engFly');
  return A('Vliegwiel', { d: 'Gietijzeren vliegwiel met startkrans aan de bakzijde van de krukas; de koppeling (drukplaat en plaat) hoort bij de bak. Diameter en tandental zijn geschat.', ex: [0.2, 0, 0] }, [
    P('Vliegwiel', wheel, MAT.iron, { d: 'Vliegwielschijf met naaf en wrijvingsvlak voor de koppelingsplaat (maten geschat).', p: [X0, 0, 0], ex: [0, 0, 0] }),
    P('Startkrans', gear(64, 0.1255, 0.1215, 0.012, 0.1195, 'x'), MAT.darkSteel, { d: 'Getande krans waarin het rondsel van de startmotor grijpt (tandental schematisch).', p: [X0 - 0.003, 0, 0], ex: [0, 0.04, 0] }),
    P('Pasdop vliegwiel', G.cyl('x', 0.006, 0.006, 0.012, 10), MAT.steel, { d: 'Pasbus die het vliegwiel op de krukasflens centreert.', p: [0.1905, 0.0, 0.02], ex: [-0.05, 0, 0] }),
    A('Vliegwielbouten', { d: 'Zes bouten die het vliegwiel op de krukasflens klemmen.', ex: [0.12, 0, 0] }, bolts.map(([y, z], k) => P(`Vliegwielbout ${k + 1}`, hexBolt(0.03, 0.009, '-x'), MAT.darkSteel, { d: 'Bout van het vliegwiel.', p: [X0 + 0.009, y, z], ex: [0.03, 0, 0] }))),
  ]);
}
