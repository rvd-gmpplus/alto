/* ===================== drivetrain.js: handbak (koppeling, vijfbak, differentieel), aandrijfassen, startmotor en motorsteunen =====================
   Handgeschakelde vijfbak van de G10BB, dwars voorin, voorwielaandrijving. Bevestigd (handboek): enkele droge koppelplaat met
   diafragmaveer en kabelbediening, gesynchroniseerde 5-bak met differentieel in het bakhuis, tripodekoppeling aan de differentieelzijde
   en kogelkoppeling aan de wielzijde van de aandrijfassen. Niet gevonden: tandentallen, overbrengingen en de inwendige opbouw van de bak.
   Het tandwielstel is daarom schematisch (tandentallen zijn rekenwaarden voor een constante hartafstand, geen feiten) en krijgt nergens een `spec`.
   Alles in dit bestand is opgebouwd in het motorframe (docs/contract.md, hoofdstuk 3); de hoofdgroepen krijgen PT_POS en PT_TILT als plaats. */
const PT_POS = V3(-0.13, 0.36, 1.217), PT_TILT = 0, GB_X = 0.30;
const PTM = new THREE.Matrix4().compose(PT_POS, new THREE.Quaternion().setFromEuler(new THREE.Euler(PT_TILT, 0, 0)), V3(1, 1, 1));
const PTI = PTM.clone().invert();
const toPT = p => V3(...p).applyMatrix4(PTI);
const fromPT = p => V3(...p).applyMatrix4(PTM);
const ENG2CAR = p => fromPT(p).toArray();             // motorframe = aandrijflijnframe
const DIFF = [0.13, -0.095, -0.13];                    // differentieel in bakframe (x vanaf het vlak GB_X, y, z)

/* ---------- maten (motorframe, meter) ---------- */
const DRV_RB = 0.122;                     // straal van het koppelingshuis
const DRV_ST = [-0.035, 0.115];           // startmotoras (y, z): hartafstand 0,12 tot de krukas, rondsel op de startkrans van het vliegwiel
const DRV_ZC = 0.07, DRV_M = 0.0035;      // hartafstand primaire en secundaire as, modulus van de tandwielparen (schematisch)
const DRV_FM = 0.0037, DRV_ZK = 44, DRV_ZR = 12;   // kroonwiel en aandrijfrondsel (tandentallen schematisch)
const DRV_DX = GB_X + DIFF[0];            // x van het hart van het differentieel
const DRV_GW = 0.0075, DRV_GAP = 0.001;   // breedte van een tandwiel en de speling ertussen
const DRV_Z = { 1: [9, 31], 2: [14, 26], 3: [17, 23], 4: [20, 20], 5: [22, 18] };   // [primair, secundair]; som 40 houdt de hartafstand gelijk
const DRV_RAIL_Y = 0.05, DRV_RAIL_Z = [-0.0455, -0.034, -0.0225, 0.0225];            // schakelstangen 1-2, 3-4, 5 en achteruit
const DRV_SH = [0.455, 0.0635];           // schakelas (x, y), loopt langs z
const DRV_START = { x: 0.138, sy: 0.0525 };        // einde (aansluiting) van de startmotor en hoogte van de solenoïde boven de as

// snijpunt van twee cirkels in het (y, z)-vlak; pick(p, q) is waar voor het gewenste punt p
function drvIsect(c1, r1, c2, r2, pick) {
  const dy = c2[0] - c1[0], dz = c2[1] - c1[1], d = Math.hypot(dy, dz);
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, r1 * r1 - a * a)), ux = dy / d, uz = dz / d;
  const p = [c1[0] + a * ux - h * uz, c1[1] + a * uz + h * ux], q = [c1[0] + a * ux + h * uz, c1[1] + a * uz - h * ux];
  return pick(p, q) ? p : q;
}
const DRV_DIFFYZ = [DIFF[1], DIFF[2]];
// secundaire as: DRV_ZC van de primaire as en precies zo ver van het differentieel dat het rondsel in het kroonwiel grijpt (het lage punt)
const DRV_SEC = drvIsect([0, 0], DRV_ZC, DRV_DIFFYZ, DRV_FM * (DRV_ZK + DRV_ZR) / 2, (p, q) => p[0] < q[0]);
// achteruit-tussenwiel (14 tanden): grijpt in het achteruitwiel (10 tanden) op de primaire as en in de tanden (28) op de schakelmof 1-2
const DRV_REV = drvIsect([0, 0], (10 + 14) / 2 * DRV_M, DRV_SEC, (14 + 28) / 2 * DRV_M, (p, q) => p[1] > q[1]);
// x-standen van de vrijlopende tandwielen en de synchronisatie-eenheden op de secundaire as
const DRV_X = (() => {
  const seq = [['g1', DRV_GW], ['s12', 0.018], ['g2', DRV_GW], ['g3', DRV_GW], ['s34', 0.018], ['g4', DRV_GW], ['g5', DRV_GW], ['s5', 0.012]];
  const o = { start: 0.396 }; let x = o.start;
  for (const [k, w] of seq) { o[k] = +(x + w / 2).toFixed(5); x += w + DRV_GAP; }
  o.end = x;
  return o;
})();
const DRV_XR = DRV_X.s12 - 0.0035;        // x van het achteruitwiel en het tussenwiel

// Aansluitpunten van bak en startmotor in het motorframe (contract, hoofdstuk 5). De sleutels blijven bestaan.
// clutchLever en shiftIn zijn verfijnd naar de buitenkant van het huis: de beginwaarden lagen binnenin de bak.
const DRV_PORTS = {
  starterTerminal: [GB_X + DRV_START.x, DRV_ST[0] + DRV_START.sy + 0.0085, DRV_ST[1]],
  diffOutL: [DRV_DX + 0.082, DIFF[1], DIFF[2]],
  diffOutR: [DRV_DX - 0.082, DIFF[1], DIFF[2]],
  clutchLever: [0.289, -0.145, -0.1035],
  shiftIn: [DRV_SH[0], DRV_SH[1] + 0.045, -0.12],
};

std('drvBrass', 0xb89a5e, 0.9, 0.35);
std('drvMagnet', 0x6c7077, 0.8, 0.4);

/* ---------- hulpen ---------- */
// vereenvoudigde bout (zeskantkop en schacht met 6 vlakken); kop bij de oorsprong, schacht langs +as
function drvBolt(len, d, ax = 'y') {
  return cache(`drvBolt${len}|${d}|${ax}`, () => {
    const head = new THREE.CylinderGeometry(d * 0.9, d * 0.9, d * 0.65, 6); head.translate(0, -d * 0.325, 0);
    const shank = new THREE.CylinderGeometry(d / 2, d / 2, len, 6); shank.translate(0, len / 2, 0);
    return yTo(merge([head, shank]), ax);
  });
}
// tandwiel met modulus m en N tanden: kopcirkel (N/2+1)m, voetcirkel (N/2-1,25)m
function drvG(N, m, w, hole = 0, ax = 'x') { return gear(N, +(m * (N / 2 + 1)).toFixed(5), +(m * (N / 2 - 1.25)).toFixed(5), w, hole, ax); }
const drvL = (key, pts, seg = 32, ax = 'x') => G.lathe(ax, pts, seg, 'drv' + key);   // pts = [straal, plaats langs de as]
const drvAn = (rIn, rOut, t, seg = 22) => annulus(rIn, rOut, t, 'x', seg);
// n kopieen van fn(hoek) op een cirkel (y, z) om een as langs x; zonder hoek volstaat ringPattern() uit core.js
function drvRing(key, n, r, fn, phase = 0, c = [0, 0], x = 0) {
  return cache(key, () => merge(Array.from({ length: n }, (_, k) => { const a = phase + k * PI * 2 / n; return xf(fn(a), [x, c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]); })));
}
function drvBellows(r1, r2, len, n) { const pts = []; for (let k = 0; k <= n * 2; k++) { const t = k / (n * 2); pts.push([lerp(r1, r2, t) - (k % 2 ? 0.004 : 0), t * len]); } return pts; }
const drvZY = (p, r) => [p[1], p[0], r];   // punt (y, z) naar cirkel [z, y, r] voor de huisomtrek (side() zet z op de horizontale as van de vorm)
function drvHull(circ, grow) {   // zoals circlesHull, met 24 punten per cirkel (minder driehoeken)
  const pts = [];
  circ.forEach(([a, b, r]) => { for (let i = 0; i < 24; i++) { const t = i / 24 * PI * 2; pts.push([a + (r + grow) * Math.cos(t), b + (r + grow) * Math.sin(t)]); } });
  return hull(pts);
}
const drvPts = h => h.map(p => new THREE.Vector2(p[0], p[1]));
// holle schaal (wand `wall`) om de omtrek van de cirkels, langs x tussen x0 en x1
function drvShell(key, circ, wall, x0, x1) {
  return cache('drvShell' + key, () => {
    const s = shapeOf(drvHull(circ, 0)); s.holes.push(new THREE.Path(drvPts(drvHull(circ.map(c => [c[0], c[1], c[2] - wall]), 0))));
    return xf(side(s, x1 - x0), [(x0 + x1) / 2, 0, 0]);
  });
}
// massieve plaat (of ring met een gat) met de omtrek van de cirkels; grow vergroot de omtrek
function drvPlate(key, circ, x0, x1, hole, grow = 0) {
  return cache('drvPlate' + key, () => {
    const s = shapeOf(drvHull(circ, grow));
    if (hole) s.holes.push(new THREE.Path(drvPts(drvHull(hole, 0))));
    return xf(side(s, x1 - x0), [(x0 + x1) / 2, 0, 0]);
  });
}
const drvShrink = (circ, d) => circ.map(c => [c[0], c[1], c[2] - d]);
const drvP = (name, geo, mat, d, p, ex, o) => P(name, geo, mat, Object.assign({ d, p, ex }, o));
// huisomtrek: voor de primaire en secundaire as, plus de differentieelkamer vanaf x 0,348
const DRV_OUT_A = [drvZY([0, 0], 0.075), drvZY(DRV_SEC, 0.064)];
const DRV_OUT_B = [drvZY([0, 0], 0.075), drvZY(DRV_SEC, 0.075), drvZY(DRV_DIFFYZ, 0.105)];
const DRV_OUT_BELL = [drvZY([0, 0], DRV_RB), drvZY(DRV_ST, 0.048)];

/* ---------- koppeling ---------- */
function drvClutch() {
  const XP = 0.2095;                                   // midden van de koppelingsplaat; het wrijvingsvlak van het vliegwiel (motor) ligt op x 0,2045 (golf 2: de plaat zweefde er 7 mm vandaan)
  const cover = cache('drvCover', () => merge([drvL('Cover', [[0.0985, 0.2045], [0.0985, 0.2075], [0.0935, 0.2075], [0.0935, 0.255], [0.074, 0.262], [0.036, 0.262]], 40), xf(drvAn(0.08, 0.0985, 0.003), [0.206, 0, 0])]));
  const diaph = cache('drvDiaph', () => merge([drvL('Diaph', [[0.088, 0.2405], [0.078, 0.2435], [0.028, 0.2545]], 40), drvL('Diaph2', [[0.088, 0.2425], [0.078, 0.2455], [0.028, 0.2565]], 40)]));
  const straps = drvRing('drvStraps', 3, 0.084, a => xf(G.box(0.0012, 0.044, 0.008), [0, 0, 0], [a + HALF, 0, 0]), 0.3, [0, 0], 0.2265);
  const tors = drvRing('drvTors', 6, 0.034, a => xf(G.cyl('z', 0.0035, 0.0035, 0.02, 8), [0, 0, 0], [a, 0, 0]), 0.2, [0, 0], XP);
  const bearing = cache('drvRelBrg', () => merge([drvAn(0.0205, 0.0285, 0.016), xf(drvAn(0.0285, 0.0365, 0.005), [0.0055, 0, 0])]));
  const fork = cache('drvFork', () => {
    const y0 = -0.085;
    const arms = [-1, 1].map(s => rodBetween([0.289, y0, s * 0.03], [0.289, -0.002, s * 0.03], 0.0035, 8));
    const pads = [-1, 1].map(s => xf(G.box(0.006, 0.014, 0.012), [0.285, 0.0, s * 0.03]));
    return merge([...arms, ...pads, xf(G.cyl('z', 0.0085, 0.0085, 0.08, 14), [0.289, y0, 0])]);
  });
  const lever = cache('drvLever', () => merge([G.cyl('z', 0.0105, 0.0105, 0.012, 16), rodBetween([0, 0, 0], [0, -0.06, 0], 0.0035, 8), xf(G.torus('z', 0.006, 0.0017, 14, 5), [0, -0.06, 0])]));
  const stop = cache('drvCableStop', () => merge([rodBetween([0.245, -0.097, -0.071], [0.245, -0.126, -0.098], 0.003, 6), xf(G.rbox(0.022, 0.012, 0.004, 0.001), [0.245, -0.126, -0.098], [0.4, 0, 0])]));
  return A('Koppeling', {
    d: 'Enkele droge koppeling met diafragmaveer en kabelbediening: koppelt het vliegwiel van de motor aan de primaire as van de bak. Zit in het koppelingshuis; alleen de koppelingsarm met de kabelaansluiting steekt erbuiten.',
    spec: [['Uitvoering', 'enkele droge plaat met diafragmaveer'], ['Bediening', 'kabel'], ['Vrije slag pedaal', '15 tot 20 mm'], ['Vrije slag aan de hefboom', '2 tot 4 mm']],
    ex: [-0.26, 0, 0],
  }, [
    A('Drukgroep', { d: 'Deksel met drukplaat en diafragmaveer; draait met het vliegwiel mee en klemt de koppelingsplaat ertegen. De maten zijn geschat.', ex: [-0.04, 0.12, 0], inner: true }, [
      drvP('Koppelingsdeksel', cover, MAT.darkSteel, 'Stalen deksel dat met zes bouten aan het vliegwiel zit en de drukplaat en de diafragmaveer draagt.', undefined, [0.07, 0, 0]),
      drvP('Drukplaat', drvAn(0.056, 0.0885, 0.012), MAT.iron, 'Gietijzeren ring die de koppelingsplaat tegen het vliegwiel drukt.', [0.2205, 0, 0], [-0.02, 0, 0]),
      drvP('Diafragmaveer', diaph, MAT.steel, 'Schotelveer: houdt de koppeling ingeschakeld; het druklager drukt de binnenrand in om te ontkoppelen.', undefined, [0.07, 0, 0]),
      drvP('Bladveren drukplaat', straps, MAT.steel, 'Drie bladveren (tangentiaal, aantal schematisch) die de drukplaat aan het deksel koppelen en bij het ontkoppelen terugtrekken.', undefined, [0.05, 0.04, 0]),
      drvP('Dekselbouten', ringPattern('drvDekB', 6, 0.0965, () => drvBolt(0.016, 0.007, '-x'), 0.2, [0, 0], 0.2098), MAT.darkSteel, 'Zes bouten (aantal schematisch) die het deksel aan het vliegwiel vasthouden.', undefined, [-0.12, 0, 0]),
    ]),
    A('Koppelingsplaat', { d: 'Plaat met frictievoeringen op de spiebaan van de primaire as: neemt het koppel van het vliegwiel mee als de koppeling ingeschakeld is. Veertjes in de naaf dempen de schokken.', ex: [-0.09, -0.1, 0], inner: true }, [
      drvP('Naaf koppelingsplaat', drvL('PlHub', [[0.0095, 0.2105], [0.0225, 0.2105], [0.0225, 0.2215], [0.0095, 0.2215]], 28), MAT.steel, 'Naaf met spiebaan voor de primaire as.', undefined, [0.05, 0, 0]),
      drvP('Plaatschijf', drvAn(0.0225, 0.0885, 0.0016), MAT.darkSteel, 'Stalen schijf waarop de voeringen zitten.', [XP, 0, 0], [0, 0, 0.0001]),
      drvP('Frictievoering motorzijde', drvAn(0.055, 0.0885, 0.0035), MAT.friction, 'Frictievoering aan de kant van het vliegwiel.', [0.207, 0, 0], [-0.06, 0, 0]),
      drvP('Frictievoering bakzijde', drvAn(0.055, 0.0885, 0.0035), MAT.friction, 'Frictievoering aan de kant van de drukplaat.', [0.212, 0, 0], [0.03, 0, 0]),
      drvP('Torsiedemperveren', tors, MAT.darkSteel, 'Zes schroefveertjes in de naaf die schokken in de aandrijving dempen (aantal schematisch).', undefined, [0, 0.06, 0.06]),
    ]),
    A('Druklager', { d: 'Druklager op de geleidehuls van het bakhuis: wordt door de koppelingsvork tegen de diafragmaveer gedrukt om te ontkoppelen.', ex: [-0.06, -0.13, 0], inner: true }, [
      drvP('Druklager (lager)', bearing, MAT.bearing, 'Axiaal kogellager met kraag, waarop de koppelingsvork duwt.', [0.2735, 0, 0], [-0.03, 0, 0]),
      drvP('Geleidehuls', drvL('Guide', [[0.0195, 0.2635], [0.0195, 0.294], [0.0345, 0.294], [0.0345, 0.2985]], 28), MAT.aluCast, 'Hals op het bakhuis waarover het druklager schuift; de primaire as loopt erdoorheen.', undefined, [0.03, 0, 0]),
    ]),
    drvP('Koppelingsvork', fork, MAT.iron, 'Vork op de ontkoppelas: duwt het druklager bij het intrappen van het pedaal naar de diafragmaveer.', undefined, [-0.04, -0.06, 0], { inner: true }),
    drvP('Ontkoppelas', G.cyl('z', 0.0065, 0.0065, 0.195, 12), MAT.steel, 'As waarop de vork en de koppelingsarm zitten; steekt door het koppelingshuis naar buiten.', [0.289, -0.085, -0.0075], [0, 0, 0.1]),
    drvP('Lagerbussen ontkoppelas', cache('drvForkBush', () => merge([-1, 1].map(s => xf(G.cyl('z', 0.0125, 0.0125, 0.018, 14), [0.289, -0.085, s * 0.0845])))), MAT.drvBrass, 'Twee bussen in het koppelingshuis waarin de ontkoppelas draait.', undefined, [0, 0, 0.18]),
    drvP('Koppelingsarm', lever, MAT.darkSteel, 'Arm aan het uiteinde van de ontkoppelas; de koppelingskabel van het pedaal trekt aan het oog (DRV_PORTS.clutchLever).', [0.289, -0.085, -0.1035], [0, -0.08, -0.1]),
    drvP('Kabelaansluiting', cache('drvNipple', () => merge([G.cyl('z', 0.0045, 0.0045, 0.012, 10), xf(G.sphere(0.0058, 8), [0, 0, -0.008])])), MAT.chrome, 'Kabelnippel in het oog van de koppelingsarm; hier eindigt de koppelingskabel uit het interieur.', DRV_PORTS.clutchLever, [0, -0.1, -0.2]),
    drvP('Kabelsteun', stop, MAT.darkSteel, 'Beugel op het koppelingshuis waartegen de kabelhuls rust (plaats geschat).', undefined, [0, -0.1, -0.12]),
  ]);
}

function drvBell() {
  const wall = 0.006;
  const shell = cache('drvBellGeo', () => merge([
    drvShell('Bell', DRV_OUT_BELL, wall, 0.184, 0.294),
    drvPlate('BellBack', DRV_OUT_BELL, 0.294, 0.30),
    drvPlate('BellFl', DRV_OUT_BELL, 0.178, 0.186, drvShrink(DRV_OUT_BELL, wall), 0.012),
  ]));
  const bolts = ringPattern('drvBellBolts', 6, 0.1285, () => drvBolt(0.022, 0.009, '-x'), 0.2, [0, 0], 0.19);
  return A('Koppelingshuis', {
    d: 'Aluminium huis om de koppeling, vastgeschroefd aan het blok. Heeft een oor voor de startmotor en lagerplaatsen voor de ontkoppelas; schematisch weergegeven.',
    ex: [-0.07, 0, 0],
  }, [
    drvP('Huisschaal koppelingshuis', shell, MAT.aluCast, 'Klokvormig huis van gegoten aluminium met de flens naar het motorblok en de achterwand naar de bak.', undefined, [0, 0, 0.0001]),
    drvP('Bouten koppelingshuis', bolts, MAT.darkSteel, 'Zes bouten (aantal schematisch) die het koppelingshuis aan het motorblok bevestigen.', undefined, [-0.12, 0, 0]),
  ]);
}

/* ---------- bakhuis in twee helften ---------- */
function drvCaseParts() {
  const wall = 0.006, SPLIT = 0.39, END = 0.504;
  const front = cache('drvFront', () => merge([
    drvShell('FA', DRV_OUT_A, wall, 0.30, 0.348), drvPlate('FAp', DRV_OUT_A, 0.30, 0.306),
    drvShell('FB', DRV_OUT_B, wall, 0.348, SPLIT), drvPlate('FBs', DRV_OUT_B, 0.348, 0.354, drvShrink(DRV_OUT_A, wall)),
    drvPlate('FFl', DRV_OUT_B, SPLIT - 0.006, SPLIT, drvShrink(DRV_OUT_B, wall), 0.01),
  ]));
  const back = cache('drvBack', () => merge([
    drvShell('BB', DRV_OUT_B, wall, SPLIT, END), drvPlate('BBe', DRV_OUT_B, END, END + 0.008),
    drvPlate('BFl', DRV_OUT_B, SPLIT, SPLIT + 0.006, drvShrink(DRV_OUT_B, wall), 0.01),
  ]));
  // bouten op de scheidingsvlakflens: gelijk verdeeld langs de omtrek
  const hp = drvHull(DRV_OUT_B, 0.0075), nb = 10, bp = Array.from({ length: nb }, (_, k) => hp[Math.floor(k * hp.length / nb)]);
  const bolts = cache('drvCaseBolts', () => merge(bp.map(p => xf(drvBolt(0.02, 0.008, '-x'), [SPLIT + 0.0125, p[1], p[0]]))));
  return [
    drvP('Bakhuis voor', front, MAT.aluCast, 'Voorste helft van het bakhuis (koppelingszijde): draagt de lagers van de primaire en secundaire as en de differentieelkamer met het kroonwiel. Schematische omtrek.', undefined, [0, 0, 0.0001]),
    drvP('Bakhuis achter', back, MAT.aluCast, 'Achterste helft van het bakhuis (einddeksel): sluit de tandwielen af en draagt de lagers aan de einden van de assen en de linker aandrijfas-afdichting. Schematische omtrek.', undefined, [0.3, 0, 0]),
    drvP('Bouten bakhuis', bolts, MAT.darkSteel, 'Tien bouten (aantal schematisch) die de twee helften van het bakhuis verbinden.', undefined, [0.15, 0, 0]),
    drvP('Aftapplug', drvBolt(0.014, 0.016, 'y'), MAT.darkSteel, 'Aftapplug onderin het bakhuis naast de linker aandrijfas (handboek): hier loopt de bakolie af.', [0.485, DIFF[1] - 0.104, DIFF[2]], [0.3, -0.12, 0]),
    drvP('Vulplug', drvBolt(0.014, 0.016, 'z'), MAT.darkSteel, 'Vul- en peilplug aan de voorkant van het bakhuis; de bakolie is 2,4 liter (75W-80 of 90, API GL4 of GL5).', [0.5, 0.0, 0.0735], [0.3, 0.0, 0.12], { r: [PI, 0, 0] }),
    drvP('Ontluchting', G.cyl('y', 0.006, 0.006, 0.016, 10), MAT.plastic, 'Ontluchtingsdop bovenop het bakhuis, naast de beugel van de linker motorsteun; laat overdruk door de opwarming weg.', [0.405, 0.083, 0.0], [0.3, 0.12, 0]),
  ];
}

/* ---------- primaire as, secundaire as, synchronisatie ---------- */
function drvPrimary() {
  const gearP = k => drvG(DRV_Z[k][0], DRV_M, DRV_GW, 0.01);
  const shaft = cache('drvPriShaft', () => merge([drvL('PriAs', [[0.0045, 0.2], [0.0045, 0.2055], [0.0095, 0.2055], [0.0095, 0.262], [0.0105, 0.262], [0.0105, 0.4985], [0.009, 0.4985], [0.009, 0.516]], 20),
    xf(gear(12, 0.0098, 0.0086, 0.05, 0, 'x'), [0.231, 0, 0])]));
  const names = ['1e', '2e', '3e', '4e', '5e'];
  return A('Primaire as', { d: 'Ingaande as met de vaste tandwielen van de vijf versnellingen en het achteruitwiel; draait met de koppelingsplaat mee. Het tandwielstel is schematisch: tandentallen en overbrengingen zijn niet gevonden.', ex: [0.2, 0.1, 0] }, [
    drvP('Primaire as', shaft, MAT.steel, 'Ingaande as in lijn met de krukas: begint met de spiebaan voor de koppelingsplaat en draagt de vaste tandwielen van de versnellingen. Schematisch weergegeven.', undefined, [0, 0, 0.0001]),
    ...[1, 2, 3, 4, 5].map((k, i) => drvP(`Tandwiel ${names[i]} versnelling primair`, gearP(k), MAT.steel, `Tandwiel van de ${names[i]} versnelling op de primaire as; het tandental is schematisch (niet gevonden).`, [DRV_X['g' + k], 0, 0], [(i - 2) * 0.03, 0.06 + i * 0.01, 0])),
    drvP('Achteruitwiel primair', drvG(10, DRV_M, 0.01, 0.01), MAT.steel, 'Tandwiel op de primaire as dat het tussenwiel voor achteruit aandrijft; tandental schematisch.', [DRV_XR, 0, 0], [0, 0.1, 0.04]),
    drvP('Lagers primaire as', cache('drvPriBrg', () => merge([0.3085, 0.498].map(x => xf(drvAn(0.0105, 0.0245, 0.012), [x, 0, 0])))), MAT.bearing, 'Twee kogellagers van de primaire as: voor in de voorwand van het bakhuis, achter in het einddeksel.', undefined, [0.0, 0.03, 0]),
  ]);
}

// synchronisatie-eenheid (naaf, schakelmof, synchronisatieringen en blokkeerstukken) op de secundaire as
// uitklappen op de secundaire as: elk deel schuift langs de as naar buiten, evenredig met zijn afstand tot het midden van het
// tandwielpakket (factor DRV_FAN), zodat tandwielen en synchronisaties uitgeklapt naast elkaar liggen in plaats van in elkaar (B-020)
const DRV_FAN = 3, drvFanX = x => +((x - (DRV_X.start + DRV_X.end) / 2) * DRV_FAN).toFixed(4);
function drvSync(name, d, key, rings, reverse) {
  const xc = DRV_X[key];
  const sleeve = cache('drvSleeve' + (reverse ? 'R' : ''), () => {
    const l = drvL('Slv', [[0.034, -0.006], [0.0485, -0.006], [0.0485, -0.0035], [0.0425, -0.0035], [0.0425, 0.0035], [0.0485, 0.0035], [0.0485, 0.006], [0.034, 0.006]], 32);
    return reverse ? merge([l, xf(gear(28, 0.0525, 0.0446, 0.005, 0.034, 'x'), [-0.0035, 0, 0])]) : l;
  });
  const ring = drvL('SynRing', [[0.0225, 0], [0.0335, 0], [0.0335, 0.0035], [0.0285, 0.0035]], 28);
  const keys = drvRing('drvSynKeys', 3, 0.0305, a => xf(G.box(0.008, 0.004, 0.005), [0, 0, 0], [a, 0, 0]), 0.5, [0, 0], 0);
  const kids = [
    drvP('Naaf', gear(20, 0.0335, 0.031, 0.008, 0.0105, 'x'), MAT.steel, 'Naaf met buitenvertanding, op de secundaire as gespied; de schakelmof schuift erover.', [0, 0, 0], [0, 0, 0], { inner: true }),
    drvP('Schakelmof', sleeve, MAT.steel, reverse ? 'Schakelmof met groef voor de schakelvork; heeft rechte tanden waarin het tussenwiel voor achteruit grijpt.' : 'Schakelmof met groef voor de schakelvork: schuift over de naaf en koppelt een tandwiel aan de as.', [0, 0, 0], [0.02, 0, 0]),
  ];
  if (rings.includes(-1)) kids.push(drvP('Synchronisatiering a', ring, MAT.drvBrass, 'Koperen conusring die de toerentallen gelijk maakt voordat de mof het tandwiel pakt.', [-0.0045, 0, 0], [-0.02, 0, 0], { s: [-1, 1, 1] }));
  if (rings.includes(1)) kids.push(drvP('Synchronisatiering b', ring, MAT.drvBrass, 'Koperen conusring aan de andere kant van de naaf.', [0.0045, 0, 0], [0.04, 0, 0]));
  kids.push(drvP('Blokkeerstukken', keys, MAT.drvBrass, 'Drie blokkeerstukken (aantal schematisch): houden de mof tegen tot de toerentallen gelijk zijn.', [0, 0, 0], [0, -0.06, 0], { inner: true }));
  return A(name, { d, p: [xc, DRV_SEC[0], DRV_SEC[1]], ex: [drvFanX(xc), 0, 0] }, kids);
}

function drvSecondary() {
  const [sy, sz] = DRV_SEC, names = ['1e', '2e', '3e', '4e', '5e'], sd = { 1: 1, 2: -1, 3: 1, 4: -1, 5: 1 };
  const shaft = cache('drvSecShaft', () => merge([drvL('SecAs', [[0.009, 0.34], [0.0115, 0.34], [0.0115, 0.504], [0.009, 0.504], [0.009, 0.514]], 20), xf(drvG(DRV_ZR, DRV_FM, 0.02, 0), [0.38, 0, 0])]));
  const free = k => cache(`drvFree${k}`, () => merge([drvG(DRV_Z[k][1], DRV_M, DRV_GW, 0.0165), xf(drvAn(0.0165, 0.0285, 0.003), [sd[k] * (DRV_GW / 2 + 0.0015), 0, 0])]));
  return A('Secundaire as', { d: 'Uitgaande as onder de primaire as: draagt de vrijlopende tandwielen van de versnellingen, de synchronisatie-eenheden en het rondsel dat het kroonwiel van het differentieel aandrijft. Schematisch: tandentallen zijn niet gevonden.', ex: [0.2, -0.05, 0], inner: true }, [
    drvP('Secundaire as met rondsel', shaft, MAT.steel, 'Uitgaande as met aan het voorste uiteinde het rondsel dat in het kroonwiel van het differentieel grijpt (tandental schematisch).', [0, sy, sz], [0, 0, 0.0001]),
    ...[1, 2, 3, 4, 5].map((k, i) => drvP(`Tandwiel ${names[i]} versnelling secundair`, free(k), MAT.steel, `Vrijlopend tandwiel van de ${names[i]} versnelling met koppelingskrans naar de synchronisatie-eenheid; tandental schematisch.`, [DRV_X['g' + k], sy, sz], [drvFanX(DRV_X['g' + k]), 0, 0])),
    drvP('Lagers secundaire as', cache('drvSecBrg', () => merge([0.359, 0.498].map(x => xf(drvAn(0.0115, 0.0245, 0.012), [x, 0, 0])))), MAT.bearing, 'Twee kogellagers van de secundaire as: voor in de voorwand van de differentieelkamer, achter in het einddeksel.', [0, sy, sz], [0.0, -0.03, 0]),
    drvSync('Synchronisatie 1-2', 'Synchronisatie-eenheid voor de 1e en 2e versnelling tussen de twee tandwielen; de mof draagt de tanden voor achteruit.', 's12', [-1, 1], true),
    drvSync('Synchronisatie 3-4', 'Synchronisatie-eenheid voor de 3e en 4e versnelling.', 's34', [-1, 1], false),
    drvSync('Synchronisatie 5', 'Synchronisatie-eenheid voor de 5e versnelling aan het einde van de as.', 's5', [-1], false),
  ]);
}

function drvReverse() {
  const [ry, rz] = DRV_REV;
  return A('Achteruitas', { d: 'Korte as met het tussenwiel voor achteruit: schuift naar de primaire as en de tanden op de schakelmof 1-2 en keert zo de draairichting om. Plaats en tandentallen zijn schematisch.', ex: [0.2, 0.0, 0.14], inner: true }, [
    drvP('Achteruitas (as)', G.cyl('x', 0.007, 0.007, 0.06, 12), MAT.steel, 'Vaste as in het bakhuis waarop het tussenwiel schuift.', [DRV_XR, ry, rz], [0, 0, 0.0001]),
    drvP('Tussenwiel achteruit', cache('drvIdler', () => merge([drvG(14, DRV_M, 0.01, 0.009), xf(drvAn(0.009, 0.027, 0.006), [0.008, 0, 0])])), MAT.steel, 'Tussenwiel (schuifwiel) met kraag voor de achteruitvork; tandental schematisch.', [DRV_XR, ry, rz], [0.03, 0.05, 0]),
  ]);
}

/* ---------- schakelmechanisme ---------- */
function drvShift() {
  const [shx, shy] = DRV_SH;
  const rail = cache('drvRail', () => merge([G.cyl('x', 0.0055, 0.0055, 0.125, 12), xf(G.box(0.008, 0.012, 0.012), [shx - 0.4375, 0.008, 0])]));
  const fork = (i, axis, R, rz, x) => cache('drvFk' + i, () => {
    const rl = [DRV_RAIL_Y, rz], a0 = Math.atan2(rl[1] - axis[1], rl[0] - axis[0]), pts = [];
    for (let k = 0; k <= 10; k++) { const a = a0 + (k / 10 * 2 - 1) * 1.15; pts.push([x, axis[0] + R * Math.cos(a), axis[1] + R * Math.sin(a)]); }
    const tip = [x, axis[0] + R * Math.cos(a0), axis[1] + R * Math.sin(a0)];
    return merge([tube(pts, 0.0028, 20, 6), rodBetween(tip, [x, rl[0], rl[1]], 0.0035, 8), xf(G.cyl('x', 0.0085, 0.0085, 0.012, 12), [x, rl[0], rl[1]])]);
  });
  const detent = cache('drvDetent', () => merge(DRV_RAIL_Z.flatMap(z => [xf(G.sphere(0.003, 6), [0.402, DRV_RAIL_Y - 0.0085, z]), xf(G.cyl('y', 0.0025, 0.0025, 0.012, 6), [0.402, DRV_RAIL_Y - 0.0165, z])])));
  const names = ['1-2', '3-4', '5', 'achteruit'];
  const xs = [DRV_X.s12, DRV_X.s34, DRV_X.s5, DRV_XR + 0.005];
  const axes = [DRV_SEC, DRV_SEC, DRV_SEC, DRV_REV], Rs = [0.0458, 0.0458, 0.0458, 0.0305];
  const boot = drvL('ShBoot', [[0.006, 0], [0.0105, 0.004], [0.007, 0.01], [0.0115, 0.015], [0.0065, 0.021]], 14, 'z');
  const arm = cache('drvShArm', () => merge([G.cyl('z', 0.009, 0.009, 0.012, 14), rodBetween([0, 0, 0], [0, 0.045, 0], 0.004, 8), xf(G.torus('z', 0.0055, 0.0016, 14, 5), [0, 0.045, 0])]));
  const finger = cache('drvFinger', () => merge([G.box(0.012, 0.011, 0.006), xf(G.cyl('z', 0.006, 0.006, 0.01, 10), [0, 0.0055, 0])]));
  return A('Schakelmechanisme', { d: 'Schakelas met vinger, vier schakelstangen met schakelvorken en de borgkogels: de pook trekt en duwt via de schakelstang aan de arm buiten het bakhuis, de vinger kiest een stang en de vork schuift de schakelmof. De opbouw is schematisch.', ex: [0.2, 0.14, 0] }, [
    drvP('Schakelas', G.cyl('z', 0.005, 0.005, 0.105, 10), MAT.steel, 'As die door de achterwand van het bakhuis naar buiten steekt; draait (kiest de stang) en schuift (schakelt).', [shx, shy, -0.0625], [0, 0.0, -0.1]),
    drvP('Schakelvinger', finger, MAT.darkSteel, 'Vinger op de schakelas die in de nok van de gekozen schakelstang grijpt.', [shx, shy - 0.0075, DRV_RAIL_Z[1]], [0, 0.05, 0], { inner: true }),
    drvP('Schakelarm', arm, MAT.darkSteel, 'Arm buiten het bakhuis; het oog neemt de schakelstang van de pook op (DRV_PORTS.shiftIn).', [shx, shy, -0.12], [0, 0.1, -0.1]),
    drvP('Stofhoes schakelas', boot, MAT.rubber, 'Rubber stofhoes waar de schakelas het bakhuis verlaat.', [shx, shy, -0.095], [0, 0.06, -0.05]),
    ...DRV_RAIL_Z.map((z, i) => drvP(`Schakelstang ${names[i]}`, rail, MAT.steel, `Schakelstang voor ${i < 3 ? 'de synchronisatie ' + names[i] : 'het tussenwiel voor achteruit'}, met een nok voor de vinger.`, [0.4375, DRV_RAIL_Y, z], [0.0, 0.05 + i * 0.015, 0.0], { inner: true })),
    ...DRV_RAIL_Z.map((z, i) => drvP(`Schakelvork ${names[i]}`, fork(i, axes[i], Rs[i], z, xs[i]), MAT.iron, `Vork die ${i < 3 ? 'de schakelmof van synchronisatie ' + names[i] : 'het tussenwiel voor achteruit'} verschuift.`, undefined, [0.0, -0.04 - i * 0.02, 0], { inner: true })),
    drvP('Borgkogels met veren', detent, MAT.steel, 'Vier kogels met veertjes die de schakelstangen in de stand houden (aantal schematisch).', undefined, [0, -0.1, 0], { inner: true }),
  ]);
}

/* ---------- differentieel ---------- */
function drvDiff() {
  const [dy, dz] = DRV_DIFFYZ, cx = DRV_DX;
  const carrier = drvL('Carrier', [[0.024, 0.356], [0.024, 0.372], [0.044, 0.372], [0.044, 0.389], [0.06, 0.389], [0.06, 0.396], [0.044, 0.398], [0.044, 0.482], [0.025, 0.486], [0.025, 0.502]], 36);
  const bevelSat = cache('drvBevS', () => merge([gear(11, 0.0165, 0.0135, 0.005, 0, 'y'), G.lathe('y', [[0.0135, 0], [0.0055, -0.019]], 16, 'drvBevSC')]));
  const bevelSide = cache('drvBevD', () => merge([gear(13, 0.021, 0.0175, 0.006, 0.0095, 'x'), G.lathe('x', [[0.0175, 0], [0.0105, -0.02]], 18, 'drvBevDC')]));
  const brg = cache('drvTapBrg', () => drvAn(0.025, 0.0425, 0.014));
  return A('Differentieel', {
    d: 'Verdeelt het koppel over beide voorwielen en laat ze in bochten verschillend snel draaien. Het kroonwiel zit aan de differentieelhuls, de satellieten draaien op een as in de huls en grijpen in de planetaire tandwielen waarin de aandrijfassen gespied zijn. Tandentallen zijn niet gevonden en schematisch.',
    ex: [0.17, -0.12, -0.1],
  }, [
    drvP('Kroonwiel', drvG(DRV_ZK, DRV_FM, 0.018, 0.045), MAT.steel, 'Kroonwiel van de eindoverbrenging: wordt door het rondsel van de secundaire as aangedreven. Tandental schematisch.', [0.38, dy, dz], [-0.1, 0.0, 0.0]),
    drvP('Kroonwielbouten', ringPattern('drvKroonB', 6, 0.052, () => drvBolt(0.025, 0.008, 'x'), 0.2, [dy, dz], 0.3685), MAT.darkSteel, 'Zes bouten (aantal schematisch) die het kroonwiel aan de differentieelhuls vasthouden.', undefined, [-0.16, 0, 0]),
    drvP('Differentieelhuls', carrier, MAT.iron, 'Gegoten huls die met het kroonwiel meedraait en de satellieten draagt.', [0, dy, dz], [0, 0, 0.0001]),
    drvP('Satellietas', G.cyl('y', 0.005, 0.005, 0.062, 10), MAT.steel, 'As waarop de twee satellieten draaien.', [cx, dy, dz], [0, 0, 0.08], { inner: true }),
    drvP('Satellietwiel boven', bevelSat, MAT.steel, 'Satelliet (kegeltandwiel): laat de planetaire tandwielen in bochten verschillend snel draaien.', [cx, dy + 0.0365, dz], [0, 0.1, 0.08], { inner: true }),
    drvP('Satellietwiel onder', bevelSat, MAT.steel, 'Tweede satelliet (kegeltandwiel).', [cx, dy - 0.0365, dz], [0, -0.1, 0.08], { inner: true, r: [PI, 0, 0] }),
    drvP('Planetair tandwiel links', bevelSide, MAT.steel, 'Planetair tandwiel (zijwiel) met spiebaan voor de linker aandrijfas.', [cx + 0.0375, dy, dz], [0.1, 0, 0], { inner: true }),
    drvP('Planetair tandwiel rechts', bevelSide, MAT.steel, 'Planetair tandwiel (zijwiel) met spiebaan voor de rechter aandrijfas.', [cx - 0.0375, dy, dz], [-0.1, 0, 0], { inner: true, s: [-1, 1, 1] }),
    drvP('Dikteringen', cache('drvThrust', () => merge([0.0425, -0.0425].map(x => xf(drvAn(0.0095, 0.022, 0.002), [x, 0, 0])))), MAT.drvBrass, 'Dunne ringen achter de planetaire tandwielen (aantal en plaats schematisch).', [cx, dy, dz], [0, 0, -0.1], { inner: true }),
    drvP('Kegellager links', brg, MAT.bearing, 'Kegelrollager van de differentieelhuls in het einddeksel (schematisch weergegeven).', [0.4925, dy, dz], [0.1, 0, 0], { inner: true }),
    drvP('Kegellager rechts', brg, MAT.bearing, 'Kegelrollager van de differentieelhuls in de voorwand van de differentieelkamer (schematisch weergegeven).', [0.361, dy, dz], [-0.1, 0, 0], { inner: true }),
    drvP('Afstelringen', drvAn(0.025, 0.0385, 0.0015), MAT.steel, 'Ringen waarmee de lagervoorspanning wordt afgesteld (plaats schematisch).', [0.351, dy, dz], [-0.16, 0, 0], { inner: true }),
  ]);
}

function drvSeals() {
  const [dy, dz] = DRV_DIFFYZ;
  const seal = cache('drvSeal', () => drvAn(0.0125, 0.0255, 0.011));
  return [
    drvP('Aandrijfas-afdichting links', seal, MAT.rubber, 'Keerring waar de linker aandrijfas het bakhuis verlaat; houdt de bakolie binnen.', [0.509, dy, dz], [0.16, -0.15, 0]),
    drvP('Aandrijfas-afdichting rechts', seal, MAT.rubber, 'Keerring waar de rechter aandrijfas het bakhuis verlaat; houdt de bakolie binnen.', [0.351, dy, dz], [-0.16, -0.15, 0], { s: [-1, 1, 1] }),
  ];
}

function buildGearbox() {
  return A('Handbak 5-versnellingen', {
    d: 'Handgeschakelde, gesynchroniseerde vijfbak met ingebouwd differentieel, dwars naast het blok aan de linkerkant van de auto, met de koppeling in een eigen huis. Het bakhuis heeft twee helften. De inwendige opbouw (tandentallen, overbrengingen, plaats van de assen) is niet gevonden en schematisch getekend.',
    spec: [['Uitvoering', 'handgeschakeld, 5 versnellingen, gesynchroniseerd'], ['Bakolie', '2,4 liter, 75W-80 of 90 (API GL4 of GL5)']],
    p: PT_POS.toArray(), r: [PT_TILT, 0, 0], ex: [0.3, 0, 0],
  }, [
    drvClutch(), drvBell(), ...drvCaseParts(), drvPrimary(), drvSecondary(), drvReverse(), drvShift(), drvDiff(), ...drvSeals(),
  ]);
}

/* ---------- aandrijfassen ---------- */
// as van de differentieeluitgang naar de naaf; lokaal loopt x van de afdichting naar het wiel (links zonder, rechts met een halve slag om y)
function drvShaft(name, o) {
  const L = o.len, mk = k => `${k}${o.tag}`;
  const hx = L - 0.075;                              // begin van de stompas van de buitenste kogelkoppeling (de klok eindigt 0,075 voor de naaf)
  const inH = drvL(mk('TriH'), [[0.0115, -0.05], [0.0115, 0.012], [0.0165, 0.016], [0.0355, 0.024], [0.0355, 0.054], [0.03, 0.058]], 28);
  const star = cache('drvTriStar', () => merge([G.cyl('x', 0.013, 0.013, 0.014, 12), ...[0, 1, 2].map(k => xf(G.cyl('y', 0.0042, 0.0042, 0.03, 8), [0, 0, 0], [k * PI * 2 / 3, 0, 0]))]));
  const rollers = cache('drvTriRol', () => merge([0, 1, 2].map(k => { const a = k * PI * 2 / 3 + HALF; return xf(merge([G.cyl('y', 0.008, 0.008, 0.011, 12), G.cyl('y', 0.0052, 0.0052, 0.013, 8)]), [0, 0.0225 * Math.cos(a), 0.0225 * Math.sin(a)], [k * PI * 2 / 3, 0, 0]); })));
  // hoezen: binnen 70 mm, buiten 75 mm lang; past dat niet tussen tripodehuis (0,045) en klok (hx - 0,065) met 12 mm tussenruimte,
  // dan worden beide korter (korte linker as; de hoezen lagen daar 45 mm in elkaar, B-020)
  const room = hx - 0.065 - 0.045, sc = Math.min(1, (room - 0.012) / 0.145), bIn = +(0.07 * sc).toFixed(4), bOut = +(0.075 * sc).toFixed(4);
  const bootIn = G.lathe('x', drvBellows(0.0345, 0.0165, bIn, 3), 20, sc < 1 ? mk('drvBootIn') : 'drvBootIn');
  const bootOut = G.lathe('x', drvBellows(0.0385, 0.0165, bOut, 3), 20, sc < 1 ? mk('drvBootOut') : 'drvBootOut');
  const klok = drvL('CvBell', [[0.026, -0.065], [0.04, -0.057], [0.0405, -0.04], [0.0405, -0.02], [0.032, -0.005], [0.0155, 0.0], [0.0125, 0.0], [0.0125, 0.075]], 32);
  const balls = cache('drvCvBalls', () => merge(Array.from({ length: 6 }, (_, k) => xf(G.sphere(0.0072, 10), [0, 0.0315 * Math.cos(k * PI / 3), 0.0315 * Math.sin(k * PI / 3)]))));
  const cage = drvL('CvCage', [[0.0255, -0.052], [0.0375, -0.04], [0.0375, -0.02], [0.0255, -0.008]], 24);
  const race = drvL('CvRace', [[0.0125, -0.046], [0.0255, -0.044], [0.0255, -0.014], [0.0125, -0.012]], 24);
  const clampB = G.torus('x', 0.0365, 0.0016, 28, 6), clampS = G.torus('x', 0.0185, 0.0016, 24, 6);
  return A(name, { d: o.d, spec: o.spec, p: o.p, r: o.r, ex: o.ex }, [
    A('Binnenste homokineet (tripode)', { d: 'Glijdende tripodekoppeling aan de differentieelzijde: de stam steekt in het planetaire tandwiel van het differentieel en de koppeling vangt de lengteverandering van de ophanging op. Schematisch weergegeven.', ex: [-0.07, 0, 0] }, [
      drvP('Tripodehuis', inH, MAT.steel, 'Huis met drie loopbanen voor de rollen en de gespiede stam die in het differentieel steekt.', undefined, [-0.03, 0, 0]),
      drvP('Tripodester', star, MAT.darkSteel, 'Ster met drie tappen op het uiteinde van de as.', [0.036, 0, 0], [0.03, 0, 0], { inner: true }),
      drvP('Tripoderollen', rollers, MAT.steel, 'Drie rollen met naaldlager op de tappen van de ster.', [0.036, 0, 0], [0.03, 0.06, 0], { inner: true }),
    ]),
    A('Hoes binnen', { d: 'Rubber stofhoes met twee klemmen die het vet in de tripodekoppeling houdt.', ex: [-0.02, 0.12, 0] }, [
      drvP('Hoes', bootIn, MAT.rubber, 'Balgvormige stofhoes.', [0.045, 0, 0], [0, 0, 0.0001]),
      drvP('Klemmen', merge([xf(clampB, [0.049, 0, 0]), xf(clampS, [0.045 + bIn - 0.003, 0, 0])]), MAT.steel, 'Twee klemmen: de grote op het tripodehuis, de kleine op de as.', undefined, [0.0, 0.09, 0]),
    ]),
    drvP('Aandrijfas (schacht)', drvL(mk('Sch'), [[0.0115, 0.03], [0.0115, hx - 0.045]], 18), MAT.steel, 'Stalen schacht (diameter geschat 23 mm).', undefined, [0, -0.08, 0]),
    A('Hoes buiten', { d: 'Rubber stofhoes met twee klemmen op de buitenste kogelkoppeling.', ex: [0.02, 0.12, 0] }, [
      drvP('Hoes', bootOut, MAT.rubber, 'Balgvormige stofhoes.', [hx - 0.065, 0, 0], [0, 0, 0.0001], { s: [-1, 1, 1] }),
      drvP('Klemmen', merge([xf(clampB, [hx - 0.062, 0, 0]), xf(clampS, [hx - 0.065 - bOut + 0.002, 0, 0])]), MAT.steel, 'Twee klemmen: de grote op de kogelkoppeling, de kleine op de as.', undefined, [0.0, 0.09, 0]),
    ]),
    A('Buitenste homokineet (kogelkoppeling)', { d: 'Vaste homokinetische kogelkoppeling aan de wielzijde: laat sturen en veren toe. De stompas gaat door het wiellager van het onderstel naar de naaf; schematisch weergegeven.', ex: [0.06, 0, 0] }, [
      drvP('Koppelingsklok', klok, MAT.steel, 'Klok met de loopbanen voor de kogels en de gegroefde stompas voor de wielnaaf.', [hx, 0, 0], [0.06, 0, 0]),
      drvP('Kogelkooi', cage, MAT.drvBrass, 'Kooi die de kogels op hun plaats houdt.', [hx, 0, 0], [-0.02, 0, 0], { inner: true }),
      drvP('Kogels', balls, MAT.chrome, 'Zes stalen kogels (aantal schematisch) die het koppel van de binnenring op de klok overbrengen.', [hx - 0.03, 0, 0], [0, 0.08, 0], { inner: true }),
      drvP('Binnenring kogelkoppeling', race, MAT.darkSteel, 'Binnenring met loopbanen, op de schacht gespied.', [hx, 0, 0], [-0.07, 0, 0], { inner: true }),
    ]),
  ]);
}

function drvShafts() {
  const hubL = toPT([TRACK_F, AY, AXF]).toArray(), hubR = toPT([-TRACK_F, AY, AXF]).toArray();
  const oL = DRV_PORTS.diffOutL, oR = DRV_PORTS.diffOutR, lenL = hubL[0] - oL[0], lenR = oR[0] - hubR[0];
  const spec = [['Binnenste koppeling', 'tripodekoppeling'], ['Buitenste koppeling', 'homokinetische kogelkoppeling']];
  return A('Aandrijfassen', {
    d: 'Linker (kort) en rechter (lang) aandrijfas van het differentieel naar de voorwielen. Elke as heeft aan de bakzijde een tripodekoppeling en aan de wielzijde een kogelkoppeling, beide met een rubber hoes. De lengtes volgen uit de plaats van het differentieel en de wielnaven.',
    p: PT_POS.toArray(), r: [PT_TILT, 0, 0], ex: [0, -0.45, -0.25],
  }, [
    drvShaft('Aandrijfas links', { tag: 'L', len: lenL, p: oL, spec, ex: [0.14, 0, 0.06], d: 'Korte linker aandrijfas van de differentieeluitgang naar de naaf linksvoor; totale lengte circa 0,37 m (geschat), met de stam in het differentieel meegerekend.' }),
    drvShaft('Aandrijfas rechts', { tag: 'R', len: lenR, p: oR, r: [0, PI, 0], spec, ex: [-0.14, 0, 0.06], d: 'Lange rechter aandrijfas van de differentieeluitgang naar de naaf rechtsvoor; totale lengte circa 0,97 m (geschat), met de stam in het differentieel meegerekend. Loopt achter het motorblok langs; een tussenas is niet gevonden.' }),
  ]);
}

/* ---------- startmotor ---------- */
// lokaal: x vanaf het bevestigingsvlak op het koppelingshuis (wereld x 0,30), de as van de startmotor loopt door de oorsprong; het rondsel steekt naar voren in de startkrans
function drvStarter() {
  const sy = DRV_START.sy, xe = DRV_START.x;
  const nose = cache('drvStNose', () => merge([drvL('StNose', [[0.0105, -0.082], [0.02, -0.078], [0.027, -0.05], [0.027, -0.006], [0.036, 0.0], [0.036, 0.006]], 28), G.box(0.008, 0.086, 0.018)]));
  const mags = cache('drvStMag', () => merge([0, 1, 2, 3].flatMap(k => [xf(yTo(new THREE.CylinderGeometry(0.0345, 0.0345, 0.07, 6, 1, true, k * HALF + 0.12, 1.3), 'x'), [0.07, 0, 0]), xf(yTo(new THREE.CylinderGeometry(0.0315, 0.0315, 0.07, 6, 1, true, k * HALF + 0.12, 1.3), 'x'), [0.07, 0, 0])])));
  const brushes = drvRing('drvStBr', 4, 0.0185, a => xf(G.box(0.011, 0.007, 0.007), [0, 0, 0], [a, 0, 0]), 0.4, [0, 0], 0.105);
  const bsp = drvRing('drvStBS', 4, 0.025, a => xf(G.box(0.008, 0.003, 0.003), [0, 0, 0], [a, 0, 0]), 0.4, [0, 0], 0.105);
  const windings = cache('drvStWind', () => merge([xf(G.cyl('x', 0.0235, 0.0235, 0.012, 20), [0.035, 0, 0]), xf(G.cyl('x', 0.0235, 0.0235, 0.012, 20), [0.095, 0, 0])]));
  return A('Startmotor', {
    d: 'Elektrische startmotor met solenoïde: schuift bij het starten het rondsel naar voren in de startkrans van het vliegwiel. Zit met twee bouten aan het koppelingshuis, het rondsel steekt in het huis. Type en afmetingen zijn niet gevonden en geschat.',
    p: ENG2CAR([GB_X, DRV_ST[0], DRV_ST[1]]), r: [PT_TILT, 0, 0], ex: [0.15, -0.3, 0.15],
  }, [
    drvP('Rondsel', drvG(9, 0.0025, 0.014, 0.0045), MAT.steel, 'Rondsel met negen tanden (schematisch) dat bij het starten naar voren schuift en in de startkrans van het vliegwiel grijpt.', [-0.095, 0, 0], [-0.1, 0, 0]),
    A('Rondselas met vrijloop', { d: 'Aandrijfas met rondsel en vrijloop: de vrijloop voorkomt dat de draaiende motor de startmotor meeneemt.', ex: [-0.05, 0.1, 0], inner: true }, [
      drvP('Rondselas', drvL('StAs', [[0.0095, -0.09], [0.0095, 0.03]], 14), MAT.steel, 'Gegroefde as waarover het rondsel met de vrijloop schuift.', undefined, [0, 0, 0.0001]),
      drvP('Vrijloopmantel', G.lathe('x', [[0.018, 0.0], [0.018, 0.03], [0.0125, 0.03], [0.0125, 0.0]], 24, 'drvStFw'), MAT.darkSteel, 'Buitenmantel van de vrijloop (overrun-koppeling).', undefined, [0.04, 0, 0]),
    ]),
    drvP('Aandrijfschild', nose, MAT.aluCast, 'Voorste lagerschild met de montageflens en twee oren voor de bevestigingsbouten.', undefined, [-0.06, 0, 0]),
    drvP('Montagebouten startmotor', cache('drvStMB', () => merge([-1, 1].map(s => xf(drvBolt(0.03, 0.009, '-x'), [0.02, s * 0.043, 0])))), MAT.darkSteel, 'Twee bouten die de startmotor aan het koppelingshuis vastzetten.', undefined, [0.1, 0, 0]),
    drvP('Veldhuis', G.lathe('x', [[0.0375, 0.006], [0.0375, 0.12], [0.0355, 0.12], [0.0355, 0.006]], 32, 'drvStYoke'), MAT.darkSteel, 'Stalen huis (juk) van de startmotor.', undefined, [0.12, 0, 0]),
    drvP('Permanente magneten', mags, MAT.drvMagnet, 'Vier magneetsegmenten in het huis (uitvoering geschat).', undefined, [0.12, 0.1, 0], { inner: true }),
    A('Anker', { d: 'Anker (rotor) met ankerpakket, wikkeling en collector.', ex: [0.28, 0, 0], inner: true }, [
      drvP('Ankeras', G.cyl('x', 0.006, 0.006, 0.13, 12), MAT.steel, 'As van het anker.', [0.065, 0, 0], [0, 0, 0.0001]),
      drvP('Ankerpakket', G.cyl('x', 0.0255, 0.0255, 0.062, 24), MAT.iron, 'Gelamelleerd ijzerpakket van het anker.', [0.065, 0, 0], [0.04, 0, 0]),
      drvP('Ankerwikkeling', windings, MAT.copper, 'Koperwikkeling, schematisch als kopbochten weergegeven.', undefined, [0.08, 0.04, 0]),
      drvP('Collector', G.lathe('x', [[0.0125, 0.096], [0.0125, 0.114]], 24, 'drvStCol'), MAT.copper, 'Collector met koperen lamellen waarop de koolborstels lopen.', undefined, [0.2, 0, 0]),
    ]),
    A('Borstelhouder', { d: 'Borstelplaat met koolborstels en veertjes; voert de stroom naar de collector.', ex: [0.4, 0, 0], inner: true }, [
      drvP('Borstelplaat', drvAn(0.014, 0.0345, 0.004), MAT.plastic, 'Kunststof plaat met de borstelhouders.', [0.1105, 0, 0], [0, 0, 0.0001]),
      drvP('Koolborstels', brushes, MAT.darkSteel, 'Vier koolborstels (aantal schematisch) die op de collector sleept.', undefined, [0.05, 0.04, 0]),
      drvP('Borstelveren', bsp, MAT.steel, 'Veertjes die de borstels tegen de collector drukken.', undefined, [0.1, 0.06, 0]),
    ]),
    drvP('Eindschild', G.lathe('x', [[0.0375, 0.12], [0.0375, 0.1325], [0.012, 0.1325], [0.012, 0.12]], 28, 'drvStEnd'), MAT.aluCast, 'Achterste lagerschild met het lager voor de ankeras.', undefined, [0.38, 0, 0]),
    drvP('Trekbouten', cache('drvStTB', () => merge([1.2, 4.3].map(a => xf(drvBolt(0.125, 0.006, '-x'), [0.1325, 0.034 * Math.cos(a), 0.034 * Math.sin(a)])))), MAT.darkSteel, 'Twee doorgaande bouten die de startmotor bij elkaar houden.', undefined, [0.45, 0, 0]),
    A('Solenoïde', { d: 'Startrelais (solenoïde) bovenop de startmotor: trekt het rondsel via de schakelvork naar voren en sluit de contacten voor de stroom van de accu.', ex: [0.05, 0.1, 0] }, [
      drvP('Solenoïdehuis', G.lathe('x', [[0, 0.02], [0.0165, 0.02], [0.0165, 0.114], [0.0145, 0.114], [0.0145, 0.026], [0, 0.026]], 24, 'drvStSol'), MAT.darkSteel, 'Stalen huis van de solenoïde, aan de voorkant dicht; achter sluit het deksel het af.', [0, sy, 0], [0, 0, 0.0001]),
      drvP('Trek- en houdspoel', cache('drvStCoil', () => merge([xf(drvAn(0.0075, 0.0138, 0.026), [0.045, 0, 0]), xf(drvAn(0.0075, 0.0138, 0.026), [0.075, 0, 0])])), MAT.copper, 'Twee spoelen: de trekspoel trekt de plunjer aan en de houdspoel houdt hem vast.', [0, sy, 0], [0.03, 0.05, 0], { inner: true }),
      drvP('Plunjer', G.cyl('x', 0.0065, 0.0065, 0.052, 14), MAT.steel, 'Plunjer die de schakelvork bedient.', [0.055, sy, 0], [-0.08, 0, 0], { inner: true }),
      drvP('Terugstelveer', G.cyl('x', 0.0062, 0.0062, 0.018, 8), MAT.darkSteel, 'Veer die de plunjer terugdrukt (schematisch als cilinder).', [0.035, sy, 0], [-0.12, 0, 0], { inner: true }),
      drvP('Contactplaat', G.cyl('x', 0.0115, 0.0115, 0.003, 18), MAT.drvBrass, 'Plaat die de twee hoofdcontacten verbindt.', [0.1, sy, 0], [0.1, 0, 0], { inner: true }),
      drvP('Solenoïdedeksel', G.cyl('x', 0.0165, 0.0165, 0.012, 20), MAT.plastic, 'Kunststof deksel met de aansluitingen.', [0.12, sy, 0], [0.16, 0, 0]),
      drvP('Contactbout plus (B+)', drvBolt(0.012, 0.007, 'x'), MAT.drvBrass, 'Hoofdaansluiting van de accukabel (DRV_PORTS.starterTerminal).', [xe - 0.012, sy + 0.0085, 0], [0.22, 0.04, 0]),
      drvP('Contactbout motor', drvBolt(0.012, 0.007, 'x'), MAT.drvBrass, 'Aansluiting naar de wikkeling van de startmotor.', [xe - 0.012, sy - 0.0085, 0], [0.22, -0.04, 0]),
    ]),
    drvP('Schakelvork startmotor', tube([[0.07, sy, 0], [0.05, sy * 0.6, 0], [0.0, 0.0, 0.0], [-0.02, 0, 0]], 0.0025, 16, 6), MAT.steel, 'Hefboom die de beweging van de plunjer op de vrijloop en het rondsel overbrengt.', undefined, [-0.03, 0.05, 0], { inner: true }),
  ]);
}

/* ---------- motorsteunen ---------- */
function drvMounts() {
  const bolt = (nm, d, p, ax, ex, r) => drvP(nm, drvBolt(0.022, 0.009, ax), MAT.darkSteel, d, p, ex, { r });
  // torsiesteun: van de bovenkant van de achterkant van het bakhuis (auto y 0,455) schuin omhoog naar een beugel boven de stuurkolomdoorvoer (auto y 0,60, x 0,26);
  // de oude plaats (x 0,28, y 0,29 tot 0,40) lag in de stuurhoes en het stuurhuis en tegen de remdrukbegrenzer (golf 2)
  const topY = 0.075, rodA = [0.39, 0.095, -0.244], sub = [0.39, 0.24, -0.282];
  return A('Motorsteunen', { d: 'Rubber-metalen steunen die motor en bak trillingsarm aan de carrosserie hangen: rechts aan de distributiezijde van het blok, links op de bak en een torsiesteun achter. Plaats en uitvoering zijn geschat; de bronnen geven geen afbeelding.', p: PT_POS.toArray(), r: [PT_TILT, 0, 0], ex: [0, 0.6, 0] }, [
    // de rechter en linker steun zijn verschillend gebouwd (rechts een liggend rubber tussen twee beugels langs x, links een staand
    // rubber onder een bovenplaat); hun rubbers klappen daarom bewust niet gespiegeld uit (B-022)
    A('Motorsteun rechts', { d: 'Rechter steun aan de distributiezijde: rubberblok tussen een beugel op het blok en een beugel naar de carrosserie (naast de veerpoot). Uitvoering geschat.', ex: [-0.14, 0.08, 0] }, [
      drvP('Beugel motorzijde rechts', G.rbox(0.03, 0.05, 0.06, 0.004), MAT.aluCast, 'Aluminium beugel die met twee bouten aan het blok zit.', [-0.255, 0.25, 0], [0, 0, 0.0001]),
      drvP('Rubber steun rechts', G.cyl('x', 0.026, 0.026, 0.045, 20), MAT.rubber, 'Rubberelement dat de trillingen dempt.', [-0.3, 0.25, 0], [-0.08, 0, 0]),
      drvP('Begrenzer rechts', merge([G.cyl('x', 0.008, 0.008, 0.095, 10), xf(G.cyl('x', 0.014, 0.014, 0.005, 14), [0.05, 0, 0])]), MAT.darkSteel, 'Bout door het rubber die de beweging van de motor begrenst.', [-0.3, 0.25, 0], [-0.12, 0.04, 0]),
      drvP('Beugel carrosserie rechts', merge([G.rbox(0.008, 0.08, 0.07, 0.003), xf(G.box(0.03, 0.01, 0.07), [0.019, -0.04, 0])]), MAT.darkSteel, 'Beugel naar de carrosserie (vorm schematisch).', [-0.33, 0.25, 0], [-0.2, 0, 0]),
      bolt('Bout beugel motorzijde 1', 'Bout van de motorbeugel.', [-0.245, 0.27, -0.02], 'x', [0.1, 0.06, 0]),
      bolt('Bout beugel motorzijde 2', 'Bout van de motorbeugel.', [-0.245, 0.23, 0.02], 'x', [0.1, -0.06, 0]),
    ]),
    A('Motorsteun links', { d: 'Linker steun op de bak: rubberblok tussen een beugel op het bakhuis en een arm naar de carrosserie (langsligger). Uitvoering geschat.', ex: [0.14, 0.08, 0] }, [
      drvP('Beugel bak', merge([G.rbox(0.06, 0.02, 0.07, 0.004), xf(G.box(0.02, 0.03, 0.07), [-0.02, -0.025, 0])]), MAT.aluCast, 'Aluminium beugel op het bakhuis.', [0.45, topY + 0.01, 0.0], [0, 0, 0.0001]),
      drvP('Rubber steun links', G.cyl('y', 0.026, 0.026, 0.04, 20), MAT.rubber, 'Rubberblok van de steun.', [0.45, topY + 0.04, 0.0], [0, 0.08, 0]),
      drvP('Bovenplaat steun links', G.rbox(0.06, 0.01, 0.07, 0.003), MAT.darkSteel, 'Plaat die het rubber met de arm naar de carrosserie verbindt.', [0.45, topY + 0.065, 0.0], [0, 0.14, 0]),
      drvP('Arm carrosserie links', merge([G.rbox(0.05, 0.01, 0.07, 0.003), xf(G.box(0.008, 0.07, 0.07), [0.029, 0.03, 0])]), MAT.darkSteel, 'Arm naar de linker langsligger (vorm schematisch).', [0.485, topY + 0.082, 0.0], [0.12, 0.2, 0]),
      ...[-1, 1].map((k, i) => bolt(`Bout steun links ${i + 1}`, 'Bout van de bakbeugel.', [0.45, topY + 0.016, k * 0.025], 'y', [0, 0.26, 0], [PI, 0, 0])),
    ]),
    A('Motorsteun achter (torsiesteun)', { d: 'Staaf met rubberbussen die het reactiekoppel van de aandrijflijn bij optrekken en remmen opvangt: aan de achterkant van het bakhuis bevestigd en naar de carrosserie voor het schutbord (4 cm vrij). Uitvoering geschat.', ex: [0, -0.1, -0.2] }, [
      drvP('Torsiestaaf', rodBetween(rodA, sub, 0.01), MAT.darkSteel, 'Staaf met aan beide uiteinden een oog.', undefined, [0, 0, 0.0001]),
      drvP('Rubberbus motorzijde', G.cyl('x', 0.02, 0.02, 0.028, 18), MAT.rubber, 'Rubberbus in het oog aan de kant van het bakhuis.', rodA, [0.1, 0.03, 0]),
      drvP('Rubberbus carrosseriezijde', G.cyl('x', 0.02, 0.02, 0.028, 18), MAT.rubber, 'Rubberbus in het oog aan de carrosseriezijde.', sub, [-0.1, 0.0, 0]),
      drvP('Beugel bakhuis', G.rbox(0.045, 0.03, 0.016, 0.004), MAT.aluCast, 'Beugel aan de achterkant van het bakhuis waaraan de staaf vastzit.', [0.39, 0.095, -0.25], [0, 0.1, 0.1]),
      drvP('Beugel carrosserie torsie', G.rbox(0.05, 0.05, 0.01, 0.003), MAT.darkSteel, 'Beugel op de carrosserie (vorm schematisch).', [0.39, 0.24, -0.288], [0, 0.1, -0.1]),
      drvP('Doorgaande bout motorzijde', drvBolt(0.06, 0.01, 'x'), MAT.darkSteel, 'Bout door de bus en de beugel.', [rodA[0] - 0.03, rodA[1], rodA[2]], [-0.14, 0.04, 0]),
      drvP('Doorgaande bout carrosseriezijde', drvBolt(0.06, 0.01, 'x'), MAT.darkSteel, 'Bout door de bus en de carrosseriebeugel.', [sub[0] - 0.03, sub[1], sub[2]], [-0.16, 0.0, 0]),
    ]),
  ]);
}

function buildPowertrain() {
  // koppelvlak: buildEngine() komt uit de motorbestanden (engine1-3.js), de rest uit dit bestand
  return A('Aandrijflijn', { d: 'Dwarsgeplaatste viercilinder G10BB met handgeschakelde vijfbak en voorwielaandrijving.', ex: [0, 0.45, 0.6] }, [
    buildEngine(), buildGearbox(), drvShafts(), drvStarter(), drvMounts(),
  ]);
}
