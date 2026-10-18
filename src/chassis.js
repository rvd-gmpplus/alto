/* ===================== chassis.js: onderstel van de Suzuki Alto 1.0-16V Twist (voorvoegsel chs) ===================== */
// Hoek-assemblages worden voor links gebouwd (x > 0) en voor rechts gespiegeld (schaal x = -1); de geometrie staat dan in
// autocoordinaten van de linkerkant. Lijnen en leidingen zijn niet gespiegeld maar krijgen hun x per zijde.
// Bronnen (docs/specificaties-en-bronnen.md): McPherson voor met draagarm en stabilisatorstang, semi-onafhankelijke
// torsie-as achter met panhardstang en schroefveren, schijven voor, trommels achter, onderdrukservo, tandheugel zonder
// bekrachtiging. Wat de bronnen niet geven (maten van schijf, trommel, subframe, leidingroutes) is geschat en zo beschreven.
// Wielen: 145/70 R13 op een stalen velg 13 inch met volle wieldop; montagevlak = wielmidden + inzet ET 40 (geschat).
const chsET = 0.040;
const chsMF = TRACK_F + chsET, chsMR = TRACK_R + chsET;   // x van het montagevlak van het wiel (naafvlak) voor en achter
// Aansluitpunt stuurkolom naar het interieur (autoframe): het uiteinde van de bovenste stuuras waar het stuurwiel op komt
// (spiebaan, naafvlak). Richting = asrichting van de kolom naar de bestuurder toe. Geschat.
const CHS_STEER = { p: [0.37, 0.85, 0.35], dir: [0, 0.375, -0.927] };

std('chsPaint', 0x1b1d20, 0.5, 0.55);          // zwart gelakt plaatstaal (draagarm, torsiebalk, dwarsbalk)
std('chsCaliper', 0x6a6f76, 0.55, 0.5);        // remklauw, ongelakt gegoten
std('chsSpring', 0x202225, 0.5, 0.5);          // gelakte schroefveren
std('chsRim', 0xa9aeb4, 0.7, 0.45);            // gelakte stalen velg
std('chsCover', 0xa3a8ae, 0.15, 0.45);          // volle wieldop van kunststof
std('chsDisc', 0x8d9196, 0.85, 0.38);          // remschijf en remtrommel van gietijzer
std('chsZinc', 0xc2c6ca, 0.8, 0.35);           // verzinkte remleidingen

const chsPt = (M, p) => V3(...p).applyMatrix4(M).toArray();
const chsMat = (p, r) => new THREE.Matrix4().compose(V3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)), V3(1, 1, 1));
const chsMir = sg => (sg < 0 ? [-1, 1, 1] : null);
const chsSn = sg => (sg > 0 ? 'links' : 'rechts');
// draaivlak met kreuknormalen: scherpe profielhoeken blijven scherp, de omtrek blijft glad
function chsLathe(ax, pts, seg, key) {
  return cache('chsL' + ax + key + seg, () => THREE.BufferGeometryUtils.toCreasedNormals(yTo(new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg), ax), 0.6));
}
// zeskantbout, kop bij de oorsprong, steel richting +as (goedkoper dan hexBolt)
function chsBolt(len, d, ax = 'y') {
  return cache(`chsB${len}|${d}|${ax}`, () => {
    const h = new THREE.CylinderGeometry(d * 0.9, d * 0.9, d * 0.6, 6); h.translate(0, -d * 0.3, 0);
    const s = new THREE.CylinderGeometry(d / 2, d / 2, len, 8); s.translate(0, len / 2, 0);
    return yTo(merge([h, s]), ax);
  });
}
// dunne schroefveer met 3 zijden per draaddoorsnede voor de kleine trommelremveren (spring() van core.js heeft er altijd 5);
// de schroefveren van de wielophanging gebruiken spring() met 9 punten per winding
function chsCoil(R, wire, h, turns, ax = 'y', per = 9, rad = 5) {
  return cache(`chsCo${R}|${wire}|${h}|${turns}|${ax}|${per}|${rad}`, () => {
    const N = Math.ceil(turns * per), pts = [];
    for (let i = 0; i <= N; i++) { const t = i / N, a = t * turns * PI * 2; pts.push(V3(R * Math.cos(a), t * h - h / 2, R * Math.sin(a))); }
    return yTo(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), N, wire, rad, false), ax);
  });
}
// profiel van een balg (straal, hoogte) met n plooien
function chsBellows(r1, r2, h, n) {
  const pts = [];
  for (let i = 0; i <= n * 2; i++) { const t = i / (n * 2); pts.push([lerp(r1, r2, t) + (i % 2 ? 0.0035 : 0), t * h - h / 2]); }
  return pts;
}
// ringsector in het (z,y)-vlak (hoek vanaf +z naar +y), dikte w langs x, gecentreerd op x = 0
function chsSector(a0, a1, rIn, rOut, w) {
  const s = new THREE.Shape(); s.absarc(0, 0, rOut, a0, a1, false); s.absarc(0, 0, rIn, a1, a0, true); s.closePath();
  return side(s, w);
}
const chsLine = (pts, r = 0.003, rad = 6) => tube(pts, r, Math.max(16, pts.length * 8), rad);
// onderdeel op een plek met een standaardzijde: s = +1 links, -1 rechts, x gespiegeld
const chsXs = (sg, pts) => pts.map(p => [sg * p[0], p[1], p[2]]);

/* ---------- wielen ---------- */
function chsTireG() {
  return cache('chsTireG', () => {
    const R = 0.2666, B = 0.2626;    // loopvlak en groefbodem
    const h = [[0.1651, 0.050], [0.1790, 0.0625], [0.2050, 0.0725], [0.2330, 0.0680], [0.2540, 0.0560], [B, 0.0480]];
    const crown = [[R - 0.002, -0.048], [R, -0.0455], [R, -0.027], [B, -0.027], [B, -0.023], [R, -0.023], [R, -0.002], [B, -0.002], [B, 0.002], [R, 0.002],
      [R, 0.023], [B, 0.023], [B, 0.027], [R, 0.027], [R, 0.0455], [R - 0.002, 0.048]];
    const pts = [...h.map(([r, x]) => [r, -x]), ...crown, ...h.slice().reverse(), [0.1651, -0.050]];
    return chsLathe('x', pts, 44, 'Tire');
  });
}
const chsRimBarrelG = () => chsLathe('x', [[0.1795, -0.0600], [0.1795, -0.0585], [0.1700, -0.0540], [0.1651, -0.0500], [0.1560, -0.0380], [0.1476, -0.0300],
  [0.1476, 0.0300], [0.1560, 0.0380], [0.1651, 0.0500], [0.1700, 0.0540], [0.1795, 0.0585], [0.1795, 0.0600]], 40, 'RimB');
const chsRimDishG = () => chsLathe('x', [[0.1600, 0.0400], [0.0345, 0.0400], [0.0345, 0.0600], [0.0, 0.0600], [0.0, 0.0630], [0.0375, 0.0630], [0.0375, 0.0435],
  [0.1600, 0.0435], [0.1600, 0.0400]], 40, 'RimD');
// wieldop: gewelfde schijf met vier boogvormige sleuven bij de rand (B-006, naar foto's van een Alto GL uit 2001); de ring met de
// sleuven bestaat uit vier draaivlaksectoren met daartussen open hoeken, zodat de donkere velgschijf erdoor te zien is
function chsCoverG() {
  return cache('chsCoverG', () => {
    const lathe = (pts, seg, a0 = 0, da = PI * 2) => THREE.BufferGeometryUtils.toCreasedNormals(yTo(new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg, a0, da), 'x'), 0.6);
    const inner = lathe([[0.0, 0.0790], [0.0430, 0.0790], [0.0480, 0.0750], [0.0640, 0.0710], [0.0900, 0.0700], [0.1150, 0.069375]], 40);
    const outer = lathe([[0.1500, 0.067857], [0.1650, 0.0670], [0.1775, 0.0640], [0.1775, 0.0615], [0.1740, 0.0610]], 40);
    const SLOT = 0.55, band = [[0.1150, 0.069375], [0.1300, 0.0690], [0.1500, 0.067857]];   // sleuf 0,55 rad breed (ongeveer 70 mm op de middenstraal)
    const ring = [0, 1, 2, 3].map(k => lathe(band, 8, k * HALF + SLOT / 2, HALF - SLOT));
    return merge([inner, outer, ...ring]);
  });
}
function chsWheel(sg, front) {
  const z = front ? AXF : AXR, tr = front ? TRACK_F : TRACK_R, fr = front ? 'voor' : 'achter', n = chsSn(sg) + fr, pcd = 0.05;
  const va = 0.9, vr = [0.1476, 0.1076];
  const valve = merge([rodBetween([-0.012, vr[0] * Math.cos(va), vr[0] * Math.sin(va)], [-0.012, vr[1] * Math.cos(va), vr[1] * Math.sin(va)], 0.0036, 8),
    rodBetween([-0.012, vr[1] * Math.cos(va), vr[1] * Math.sin(va)], [-0.012, 0.0976 * Math.cos(va), 0.0976 * Math.sin(va)], 0.0046, 8)]);
  return A(`Wiel ${n}`, {
    d: `Wiel ${chsSn(sg)} ${fr}: stalen velg 13 inch met band 145/70 R13 en volle kunststof wieldop (Twist). Het montagevlak ligt 40 mm buiten het wielmidden (inzet geschat).`,
    p: [sg * tr, AY, z], s: chsMir(sg), ex: [sg * 0.4, 0, 0],
  }, [
    P('Band', chsTireG(), MAT.rubber, { d: 'Radiaalband 145/70 R13 met vier brede loopvlakribben, drie lengtegroeven en een bol zijwand. Wikkelt zich om de velgflenzen.', spec: [['Maat', '145/70 R13']], ex: [0, 0, 0] }),
    P('Velgbed', chsRimBarrelG(), MAT.chsRim, { d: 'Stalen velgbed (ton) van 13 inch met twee wulpen, diepbed en bandzittingen; de breedte van 4J of 4,5J is aannemelijk.', spec: [['Maat', '13 inch']], ex: [0.06, 0, 0] }),
    P('Velgschijf', chsRimDishG(), MAT.chsRim, { d: 'Geperste stalen velgschijf met vier boutgaten, steek 4 x 100 mm (geschat), en een holle middenkap voor de naafmoer. Aan het velgbed gelast.', ex: [0.12, 0, 0] }),
    ...[0, 1, 2, 3].map(k => P(`Wielbout ${k + 1}`, chsBolt(0.024, 0.012, '-x'), MAT.steel, {
      d: 'Wielbout met kegelvormige zitting; trekt het wiel op de naafflens. De bronnen noemen bouten, geen moeren.', spec: [['Aanhaalmoment', '70 tot 100 Nm']],
      p: [0.0435, pcd * Math.cos(PI / 4 + k * HALF), pcd * Math.sin(PI / 4 + k * HALF)], ex: [0.2, 0, 0] })),   // geen inner: ui_inner vindt een straal tussen wieldop en velg door naar bout 4 (golf 2)
    P('Wieldop', chsCoverG(), MAT.chsCover, { d: 'Volle kunststof wieldop over de hele velgschijf, met vier boogvormige sleuven bij de rand; klikt op de velgflens. Vorm naar foto\'s van een Alto GL uit 2001; voor de Twist niet apart bevestigd.', ex: [0.3, 0, 0] }),
    P('Wieldopembleem', chsLathe('x', [[0, 0.0790], [0.0300, 0.0790], [0.0300, 0.0805], [0, 0.0805]], 24, 'Cap'), MAT.chsCover, { d: 'Ingeperst embleem midden op de wieldop, in dezelfde grijze kunststof (schematisch: rond, zonder letter).', ex: [0.36, 0, 0] }),
    P('Ventiel', valve, MAT.rubber, { d: 'Bandenventiel in het diepbed, wijst naar de wielas.', ex: [-0.04, 0.1, 0.1] }),
  ]);
}
function chsBuildWheels() {
  return A('Wielen', { d: 'Vier wielen: stalen velg 13 inch, band 145/70 R13 en volle kunststof wieldop (Twist). Het reservewiel is niet gevonden en ontbreekt.', ex: [0, -0.05, 0] },
    [chsWheel(1, true), chsWheel(-1, true), chsWheel(1, false), chsWheel(-1, false)]);
}

/* ---------- vooras: veerpoot, fusee, draagarm, stuurinrichting ---------- */
const chsSB = V3(0.552, 0.36, 1.107), chsST = V3(0.50, 0.745, AXF);        // veerpootvoet (fuseeklem) en top (veerpoottoren)
const chsSD = chsST.clone().sub(chsSB).normalize(), chsSQ = quatFromTo(V3(0, 1, 0), chsSD);
const chsQM = new THREE.Matrix4().compose(chsSB, chsSQ, V3(1, 1, 1));
const chsSA = p => chsPt(chsQM, p);                      // punt in het veerpootframe (y langs de poot) naar het autoframe
const chsBJ = [0.580, 0.185, 1.116];                     // middelpunt kogelgewricht (op de kingpin-as)
const chsTRE = [0.585, 0.355, 0.985];                    // spoorstangeind: de pen staat in de stuurarm van de fusee
const chsPHI = 0.10;                                     // standhoek remklauw voor: vlak voor de as, 6 graden omhoog
const chsRY = 0.42, chsRZ = 0.945;                       // as van de tandheugel (achter de motor, voor het schutbord)
const chsQ = (v) => quatFromTo(V3(0, 1, 0), v instanceof THREE.Vector3 ? v : V3(...v));

function chsStrut(sg, n) {
  const sp = s => [0, s, 0];
  const seat = (dir, key) => G.lathe('y', [[0.022, 0], [0.047, dir * 0.002], [0.049, dir * 0.009], [0.047, dir * 0.011], [0.022, dir * 0.006]], 28, key);
  const studs = [0, 1, 2].map(k => [0.03 * Math.cos(PI / 2 + k * 2.0944), 0.03 * Math.sin(PI / 2 + k * 2.0944)]);
  const foot = merge([G.cyl('y', 0.0268, 0.0268, 0.07, 20, true), xf(G.box(0.037, 0.09, 0.006), [0.0395, 0.03, 0.011]), xf(G.box(0.037, 0.09, 0.006), [0.0395, 0.03, -0.011])]);
  return A(`Veerpoot ${n}`, {
    d: 'McPherson-veerpoot: schokdemper met schroefveer die tevens het fuseedraaipunt vormt. De top zit in de veerpoottoren, de voet in de fuseeklem. Opbouw schematisch, maten geschat.',
    p: chsSB.toArray(), q: chsSQ, ex: [0, 0.34, 0],
  }, [
    P('Demperbuis', G.cyl('y', 0.0215, 0.0215, 0.235, 22), MAT.darkSteel, { d: 'Buis van de hydraulische schokdemper; de onderkant is aan de veerpootvoet gelast.', p: sp(0.0975), ex: [0, 0, 0] }),
    P('Demperzuiger', G.cyl('y', 0.018, 0.018, 0.012, 16), MAT.iron, { d: 'Zuiger met kleppen in de demperbuis; remt de beweging van de veer af.', p: sp(0.13), ex: [0, 0.25, 0], inner: true }),
    P('Zuigerstang', G.cyl('y', 0.0055, 0.0055, 0.206, 12), MAT.chrome, { d: 'Verchroomde zuigerstang die de zuiger met de bovenste lagerplaat verbindt.', p: sp(0.293), ex: [0, 0.25, 0] }),
    P('Veerschotel onder', seat(1, 'chsSeatL'), MAT.darkSteel, { d: 'Onderste veerschotel, aan de demperbuis gelast.', p: sp(0.12), ex: [0, 0.07, 0] }),
    P('Schroefveer voor', spring(0.040, 0.0055, 0.172, 6, 'y', 9), MAT.chsSpring, { d: 'Schroefveer die het voorgewicht draagt; zit tussen de twee veerschotels rond de demper.', p: sp(0.217), ex: [0, 0.13, 0] }),
    P('Veerschotel boven', seat(-1, 'chsSeatU'), MAT.darkSteel, { d: 'Bovenste veerschotel onder de rubberen steunring.', p: sp(0.303), ex: [0, 0.2, 0] }),
    P('Stofhoes veerpoot', G.lathe('y', chsBellows(0.019, 0.016, 0.09, 5), 20, 'chsDb'), MAT.rubber, { d: 'Balg om de zuigerstang die vuil uit de demper houdt.', p: sp(0.26), ex: [0, 0.3, 0] }),
    P('Aanslagrubber', G.cyl('y', 0.0165, 0.0125, 0.04, 14), MAT.rubber, { d: 'Rubberen aanslag die het inveren aan het einde van de slag opvangt.', p: sp(0.33), ex: [0, 0.36, 0] }),
    P('Veerpootsteunrubber', annulus(0.012, 0.046, 0.022, 'y', 28), MAT.rubber, { d: 'Rubberen steunring in de veerpoottoren: dempt trillingen en laat de poot draaien bij het sturen.', p: sp(0.361), ex: [0, 0.42, 0] }),
    P('Bovenste lagerplaat', merge([G.cyl('y', 0.046, 0.046, 0.006, 24), ...studs.map(([x, z]) => xf(G.cyl('y', 0.004, 0.004, 0.03, 8), [x, 0.018, z]))]), MAT.steel, { d: 'Stalen plaat met drie tapeinden die onder de veerpoottoren zit (x = 0,50 m, z 1,02 tot 1,16 m).', p: sp(0.375), ex: [0, 0.5, 0] }),
    P('Torenmoeren', merge([...studs.map(([x, z]) => xf(hexNut('y', 0.0066, 0.008), [x, 0.404 - 0.375, z])), xf(hexNut('y', 0.0105, 0.012), [0, 0.015, 0])]), MAT.steel, { d: 'Drie moeren op de tapeinden en een moer op de zuigerstang, boven op de veerpoottoren.', p: sp(0.375), ex: [0, 0.62, 0] }),
    P('Veerpootvoet', foot, MAT.darkSteel, { d: 'Aangelaste klemplaat met twee oren voor de fuseeklem.', p: sp(0.0), ex: [0.05, -0.04, 0] }),
    ...[0, 1].map(k => P(`Fuseeklembout ${k + 1}`, chsBolt(0.048, 0.010, 'z'), MAT.steel, { d: 'Klembout door de oren van de veerpootvoet en de tong van de fusee.', p: [0.045, 0.012 + k * 0.05, -0.0225], ex: [0, 0, -0.18] })),
  ]);
}

function chsKnuckle(sg, n) {
  const z0 = AXF, H = [chsMF, AY, z0], wx = H[0] - 0.070;
  const calY = AY + 0.075 * Math.sin(chsPHI);
  const body = merge([
    xf(G.cyl('x', 0.046, 0.046, 0.042, 24), [H[0] - 0.0415, AY, z0]),
    xf(G.box(0.015, 0.20, 0.075), [wx, AY + 0.02, z0]),
    ...[-1, 1].map(k => xf(G.box(0.015, 0.012, 0.05), [wx, calY + k * 0.0455, z0 + 0.06])),
    xf(G.box(0.033, 0.08, 0.016), [0.0415, 0.04, 0]).applyMatrix4(chsQM),
    rodBetween([wx, AY + 0.085, z0], chsSA([0.05, 0.03, 0]), 0.016, 10),
    xf(G.cyl('y', 0.021, 0.021, 0.03, 16), [chsBJ[0], 0.243, chsBJ[2]]),
    rodBetween([wx, AY - 0.075, z0], [chsBJ[0], 0.243, chsBJ[2]], 0.017, 10),
    rodBetween([wx, AY + 0.065, z0 - 0.02], chsTRE, 0.012, 10),
    xf(G.cyl('y', 0.0145, 0.0145, 0.04, 14), chsTRE)]);
  return A(`Fusee ${n}`, { d: 'Gegoten fusee met naaflagerhuis, klemtong voor de veerpoot, kogelgewrichtsoog onderaan en stuurarm naar achteren (voor het spoorstangeind). Vormen geschat.', ex: [0.1, 0, 0] }, [
    P('Fuseelichaam', body, MAT.iron, { d: 'Gegoten ijzeren fusee: draagt het wiellager, klemt de veerpoot, houdt het kogelgewricht van de draagarm en de spoorstang.', ex: [0, 0, 0] }),
    P('Wiellager', chsLathe('x', [[0.0300, -0.058], [0.0390, -0.058], [0.0390, -0.020], [0.0300, -0.020], [0.0300, -0.058]], 28, 'Brg'), MAT.bearing, { d: 'Dubbelrijig kogellager in het fuseehuis (schematisch, uitwendige maten geschat).', p: H, ex: [-0.05, 0.14, 0], inner: true }),
    P('Naaf', chsLathe('x', [[0.0145, 0.004], [0.0320, 0.004], [0.0320, -0.004], [0.0520, -0.004], [0.0520, -0.016], [0.0300, -0.016], [0.0300, -0.0625], [0.0145, -0.0625], [0.0145, 0.004]], 32, 'Hub'), MAT.steel, {
      d: 'Wielnaaf met flens voor het wiel en de remschijf; de aandrijfas van de aandrijflijn eindigt in de naafboring.', p: H, ex: [0.2, 0, 0] }),
    P('Naafmoer', hexNut('x', 0.0165, 0.009), MAT.steel, { d: 'Kroonmoer op het uiteinde van de aandrijfas in het midden van de naaf.', spec: [['Aanhaalmoment', '150 tot 200 Nm']], p: [H[0] + 0.0045, AY, z0], ex: [0.36, 0, 0] }),
    P('Splitpen', rodBetween([H[0] + 0.0045, AY, z0 - 0.016], [H[0] + 0.0045, AY, z0 + 0.016], 0.0015, 6), MAT.steel, { d: 'Splitpen die de kroonmoer borgt.', ex: [0.42, 0.06, 0] }),
  ]);
}

function chsArm(sg, n) {
  const F = [0.43, 0.205, 1.30], R = [0.45, 0.205, 1.075], BJ = chsBJ;
  const tri = [[F[0], F[2]], [BJ[0], BJ[2]], [R[0], R[2]]], cx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3, cz = (tri[0][1] + tri[1][1] + tri[2][1]) / 3;
  const shr = k => tri.map(p => new THREE.Vector2(cx + (p[0] - cx) * k, cz + (p[1] - cz) * k));
  const s1 = shapeOf(tri); s1.holes.push(new THREE.Path(shr(0.5)));
  const s2 = shapeOf(tri); s2.holes.push(new THREE.Path(shr(0.93)));
  const arm = merge([xf(plan(s1, 0.004), [0, 0.198, 0]), xf(plan(s2, 0.016), [0, 0.206, 0])]);
  const bracket = merge([xf(G.box(0.065, 0.100, 0.005), [F[0], 0.2335, F[2] - 0.0285]), xf(G.box(0.065, 0.100, 0.005), [F[0], 0.2335, F[2] + 0.0285]), xf(G.box(0.07, 0.005, 0.062), [F[0], 0.2825, F[2]])]);
  return A(`Draagarm ${n}`, { d: 'Onderste draagarm (driehoeksarm) van geperst plaatstaal: twee rubberen bussen aan de carrosserie- en dwarsbalkzijde en het kogelgewricht aan de fusee. Plaatsing en vorm geschat.', ex: [0.05, -0.2, 0.05] }, [
    P('Draagarm', arm, MAT.chsPaint, { d: 'Geperste stalen driehoeksarm met opstaande rand en uitsparing; voert de wielkrachten naar de carrosserie.', ex: [0, 0, 0] }),
    A(`Kogelgewricht ${n}`, { d: 'Kogelgewricht tussen draagarm en fusee: de kogel zit in een huis dat aan de arm geklemd is; de pen steekt door de fusee.', ex: [0.1, -0.05, 0] }, [
      P('Kogelhuis', chsLathe('y', [[0, 0.165], [0.0155, 0.165], [0.0185, 0.175], [0.0185, 0.196], [0.026, 0.196], [0.026, 0.204], [0, 0.204]], 20, 'Bj'), MAT.darkSteel, { d: 'Stalen huis met kunststof schaal waarin de kogel draait.', p: [BJ[0], 0, BJ[2]], ex: [0, -0.1, 0] }),
      P('Kogelpen', G.cyl('y', 0.0065, 0.0085, 0.062, 10), MAT.steel, { d: 'Taps toelopende pen met kogel; steekt in het onderste oog van de fusee.', p: [BJ[0], 0.235, BJ[2]], ex: [0, 0.1, 0] }),
      P('Kogelstofhoes', G.lathe('y', chsBellows(0.0195, 0.011, 0.026, 3), 18, 'chsKb'), MAT.rubber, { d: 'Rubber hoes over het kogelgewricht; houdt vet erin en vuil buiten.', p: [BJ[0], 0.217, BJ[2]], ex: [0.06, 0.04, 0] }),
      P('Kogelpenmoer', hexNut('y', 0.011, 0.012), MAT.steel, { d: 'Kroonmoer op de kogelpen, geborgd met een splitpen (niet getekend).', p: [BJ[0], 0.272, BJ[2]], ex: [0, 0.2, 0] })]),
    P('Draagarmbus voor', G.cyl('z', 0.021, 0.021, 0.05, 16), MAT.rubber, { d: 'Rubber-metaalbus in het voorste oog van de arm.', p: F, ex: [0, 0, 0.16] }),
    P('Draagarmbout voor', chsBolt(0.09, 0.012, 'z'), MAT.steel, { d: 'Draaibout door het voorste oog en de beugel.', p: [F[0], F[1], F[2] - 0.05], ex: [0, 0, 0.3] }),
    P('Draagarmbeugel voor', bracket, MAT.chsPaint, { d: 'Beugel onder de langsligger waarin de voorste bus hangt (plaats geschat).', ex: [0, 0.15, 0.1] }),
    P('Draagarmbus achter', G.cyl('z', 0.021, 0.021, 0.05, 16), MAT.rubber, { d: 'Rubber-metaalbus in het achterste oog van de arm, aan de dwarsbalk.', p: R, ex: [0, 0, -0.16] }),
    P('Draagarmbout achter', chsBolt(0.09, 0.012, 'z'), MAT.steel, { d: 'Draaibout door het achterste oog en de dwarsbalkbeugel.', p: [R[0], R[1], R[2] - 0.05], ex: [0, 0, -0.3] }),
    P('Stabilisatorrubber', G.cyl('y', 0.015, 0.015, 0.02, 14), MAT.rubber, { d: 'Rubber om het uiteinde van de stabilisatorstang bij de draagarm.', p: [0.49, 0.226, 1.20], ex: [0.1, 0.12, 0] }),
    P('Stabilisatorbout', chsBolt(0.052, 0.010, 'y'), MAT.steel, { d: 'Bout die het stabilisatoroog met de draagarm verbindt.', p: [0.49, 0.2455, 1.20], r: [PI, 0, 0], ex: [0.1, 0.25, 0] }),
  ]);
}

function chsFrontCorner(sg) {
  const n = chsSn(sg) + 'voor';
  return A(`Wielophanging ${n}`, { d: `Voorwielophanging ${chsSn(sg)}: McPherson-veerpoot, fusee met naaf en lager en onderste draagarm met kogelgewricht.`, s: chsMir(sg), ex: [sg * 0.5, 0, 0] },
    [chsStrut(sg, n), chsKnuckle(sg, n), chsArm(sg, n)]);
}

// stuurinrichting: tandheugel zonder stuurbekrachtiging, spoorstangen en stuurkolom tot het aansluitpunt in het interieur
function chsSteering() {
  const RY = chsRY, RZ = chsRZ, P0 = [0.20, RY, RZ], J1 = [0.2155, 0.458, 0.9165], J2 = [0.37, 0.70, 0.72], I = CHS_STEER.p;
  const v1 = V3(J2[0] - J1[0], J2[1] - J1[1], J2[2] - J1[2]).normalize(), v2 = V3(I[0] - J2[0], I[1] - J2[1], I[2] - J2[2]).normalize();
  const at = (p, d, k) => [p[0] + d.x * k, p[1] + d.y * k, p[2] + d.z * k];
  const Gp = [0.255, 0.520, 0.866];                      // doorvoer in het schutbord
  const uj = cache('chsUJ', () => merge([G.cyl('y', 0.011, 0.011, 0.05, 14), G.cyl('x', 0.0035, 0.0035, 0.03, 8), G.cyl('z', 0.0035, 0.0035, 0.03, 8), xf(G.box(0.026, 0.012, 0.004), [0, 0.012, 0]), xf(G.box(0.026, 0.012, 0.004), [0, -0.012, 0])]));
  const housing = merge([xf(G.cyl('x', 0.0185, 0.0185, 0.55, 24), [0, RY, RZ]), ...[1, -1].map(s => xf(G.cyl('x', 0.022, 0.022, 0.03, 18), [s * 0.265, RY, RZ])),
    rodBetween(P0, J1, 0.022, 14), xf(G.cyl('z', 0.018, 0.018, 0.03, 14), [0.20, RY, RZ + 0.03])]);
  const tie = sg => {
    const J = [sg * 0.355, RY, RZ], E = [sg * chsTRE[0], 0.315, chsTRE[2]], d = V3(E[0] - J[0], E[1] - J[1], E[2] - J[2]).normalize(), nm = chsSn(sg);
    return A(`Spoorstang ${nm}`, { d: `Spoorstang ${nm}: van het uiteinde van de tandheugel naar de stuurarm van de fusee. De lengte is instelbaar met een contramoer (voorspoor).`, ex: [sg * 0.12, -0.08, 0] }, [
      P(`Axiaal kogelgewricht ${nm}`, rodBetween(J, at(J, d, 0.06), 0.013, 12), MAT.darkSteel, { d: 'Kogelgewricht op het einde van de tandheugel, onder de stuurhoes; laat de spoorstang schommelen.', ex: [sg * -0.05, 0, 0] }),
      P(`Staaf ${nm}`, rodBetween(at(J, d, 0.05), at(E, d, -0.05), 0.0075, 8), MAT.steel, { d: 'Stalen staaf met schroefdraad voor de lengte-instelling.', ex: [0, 0, 0] }),
      P(`Contramoer ${nm}`, hexNut('y', 0.0115, 0.012), MAT.steel, { d: 'Contramoer die het spoorstangeind in de ingestelde lengte vastzet.', p: at(E, d, -0.075), q: chsQ(d), ex: [sg * 0.05, 0.06, 0] }),
      P(`Spoorstangeind ${nm}`, merge([rodBetween(at(E, d, -0.065), E, 0.0125, 10), xf(G.cyl('y', 0.0055, 0.008, 0.075, 10), [E[0], E[1] + 0.03, E[2]])]), MAT.darkSteel, { d: 'Buitenste kogelgewricht met taps toelopende pen die in de stuurarm van de fusee steekt.', ex: [sg * 0.1, -0.1, 0] }),
      P(`Spoorstangeindhoes ${nm}`, G.lathe('y', chsBellows(0.0135, 0.009, 0.02, 2), 14, 'chsTb'), MAT.rubber, { d: 'Rubber hoes over het spoorstangeind.', p: [E[0], E[1] + 0.014, E[2]], ex: [sg * 0.1, 0.0, 0] }),
      P(`Kogelpenmoer spoorstangeind ${nm}`, hexNut('y', 0.0095, 0.011), MAT.steel, { d: 'Kroonmoer op de pen van het spoorstangeind, geborgd met een splitpen (niet getekend).', p: [E[0], 0.3875, E[2]], ex: [sg * 0.1, 0.2, 0] })]);
  };
  const clamp = (sg, x) => P(`Stuurhuisklem ${chsSn(sg)}`, merge([G.torus('x', 0.0205, 0.004, 20, 5), xf(G.box(0.045, 0.03, 0.022), [0, 0, -0.0315])]), MAT.darkSteel, {
    d: 'Beugel met rubber die het stuurhuis tegen de voorkant van het schutbord klemt.', p: [x, RY, RZ], ex: [0, 0.1, -0.15] });
  const boot = sg => P(`Stuurhoes ${chsSn(sg)}`, G.lathe('x', chsBellows(0.0285, 0.019, 0.075, 4), 22, 'chsRb'), MAT.rubber, { d: 'Balg over het uiteinde van de tandheugel en het axiale kogelgewricht.', p: [sg * 0.3125, RY, RZ], ex: [sg * 0.2, 0, 0] });
  const column = A('Stuurkolom', {
    d: 'Stuurkolom van het onderstel: de rondselas met twee kruiskoppelingen en een tussenas door het schutbord, daarna de kolombuis tot het aansluitpunt waar het stuurwiel van het interieur op komt. De kolom is niet verstelbaar. Aansluitpunt: autoframe (0,37; 0,85; 0,35), asrichting naar de bestuurder (0; 0,375; -0,927), 22 graden onder de horizon; schematisch en geschat.',
    ex: [0.0, 0.25, -0.5],
  }, [
    P('Kruiskoppeling onder', uj, MAT.steel, { d: 'Kruiskoppeling tussen de rondselas en de tussenas; vangt de hoek tussen rondsel en kolom op.', p: J1, q: chsQ(v1), ex: [0, 0.1, 0.1] }),
    P('Tussenas', merge([rodBetween(at(J1, v1, 0.025), at(J1, v1, 0.12), 0.0165, 14), rodBetween(at(J1, v1, 0.1), at(J2, v1, -0.025), 0.0125, 12)]), MAT.steel, { d: 'Tussenas met telescopische hals (aannemelijk, bij een schokabsorberende kolom): loopt door het schutbord de cabine in.', ex: [0, 0.18, -0.2] }),
    P('Stuurkolomdoorvoer', G.lathe('y', chsBellows(0.04, 0.018, 0.05, 2), 18, 'chsKd'), MAT.rubber, { d: 'Rubber doorvoer van de tussenas door het schutbord.', p: Gp, q: chsQ(v1), ex: [0.1, 0.1, 0.3] }),
    P('Kruiskoppeling boven', uj, MAT.steel, { d: 'Tweede kruiskoppeling, in de cabine achter het schutbord; stuurt de kolom naar de gewenste hoek.', p: J2, q: chsQ(v2), ex: [0, 0.2, -0.3] }),
    P('Stuuras', rodBetween(at(J2, v2, 0.02), I, 0.0095, 10), MAT.steel, { d: 'Bovenste stuuras; het uiteinde bij het aansluitpunt draagt het stuurwiel (spiebaan, getekend als glad uiteinde).', ex: [0, 0.3, -0.5] }),
    P('Kolombuis', rodBetween(at(J2, v2, 0.07), at(I, v2, -0.08), 0.0275, 18), MAT.chsPaint, { d: 'Stalen kolombuis om de stuuras; hangt aan het dashboard. De kolom is niet verstelbaar.', ex: [0, 0.35, -0.5] }),
    P('Kolombeugel', xf(G.box(0.07, 0.025, 0.045), [0, 0.0, 0]), MAT.darkSteel, { d: 'Beugel waarmee de kolombuis aan de dwarsligger onder het dashboard hangt (plaats geschat).', p: at(I, v2, -0.13), q: chsQ(v2), ex: [0, 0.4, -0.5] })]);
  return A('Stuurinrichting', {
    d: 'Handbediende tandheugelbesturing zonder stuurbekrachtiging (linksgestuurd): stuurhuis met rondsel, twee spoorstangen en de stuurkolom. Het stuurwiel zelf is van het interieur; de kolom eindigt op het aansluitpunt (autoframe 0,37; 0,85; 0,35, naafmidden van het stuurwiel van het interieur). Opbouw schematisch.',
    spec: [['Type', 'tandheugel, geen stuurbekrachtiging'], ['Draaicirkel', '9,8 m']], ex: [0, 0.1, -0.5],
  }, [
    P('Stuurhuis', housing, MAT.aluCast, { d: 'Aluminium stuurhuis met het rondselhuis aan de bestuurderszijde (links); de tandheugel schuift erin.', ex: [0, 0, 0] }),
    P('Tandheugel', G.cyl('x', 0.0125, 0.0125, 0.62, 16), MAT.steel, { d: 'Heugel met vertanding die door het rondsel zijdelings wordt verschoven (slag circa 2 x 75 mm, geschat).', p: [0, RY, RZ], ex: [0, 0, 0.2], inner: true }),
    P('Rondsel', rodBetween(P0, at(P0, V3(0.31, 0.76, -0.57), 0.045), 0.0085, 10), MAT.steel, { d: 'Rondsel op de onderkant van de stuurkolom; draait de heugel.', ex: [0, 0.2, 0], inner: true }),
    P('Heugelgeleider', G.cyl('z', 0.014, 0.014, 0.02, 12), MAT.brass || MAT.bearing, { d: 'Geleidestuk dat de heugel tegen het rondsel drukt.', p: [0.20, RY, RZ + 0.021], ex: [0, 0, 0.2], inner: true }),
    clamp(1, 0.10), clamp(-1, -0.15), boot(1), boot(-1), tie(1), tie(-1), column]);
}

// stabilisatorstang: voor de motor langs, uiteinden aan de draagarmen (schematisch, geschat)
function chsStabilizer() {
  const half = [[0.49, 0.226, 1.20], [0.50, 0.226, 1.28], [0.47, 0.226, 1.36], [0.38, 0.226, 1.405], [0.15, 0.226, 1.41]];
  const pts = [...half.map(p => [-p[0], p[1], p[2]]), ...half.slice().reverse()];   // een U van rechts (-x) naar links; de oude volgorde trok een rechte lijn van uiteinde naar uiteinde dwars door carterpan en bak
  const clip = sg => P(`Stabilisatorbeugel ${chsSn(sg)}`, merge([G.torus('x', 0.0115, 0.0035, 16, 5), xf(G.box(0.03, 0.035, 0.012), [0, 0.0235, 0])]), MAT.darkSteel, { d: 'Beugel met rubber die de stabilisatorstang tegen de onderkant van de langsligger houdt (plaats geschat).', p: [sg * 0.41, 0.226, 1.385], q: chsQ(V3(0, 1, 0)), ex: [sg * 0.1, 0.1, 0.1] });
  return A('Stabilisator', { d: 'Stabilisatorstang voor: een U-vormige torsiestaaf die de rolbeweging beperkt. Ligt voor de motor en eindigt aan beide draagarmen (schematisch, geschat).', ex: [0, -0.1, 0.5] }, [
    P('Stabilisatorstang', chsLine(pts, 0.0085, 8), MAT.chsSpring, { d: 'Stalen staaf van 17 mm; verdraait bij het scheef inveren en werkt dan tegen de rol.', ex: [0, 0, 0] }),
    clip(1), clip(-1)]);
}

// dwarsbalk achter de motor: gaat tussen de langsliggers en draagt de achterste bussen van de draagarmen (geschat)
function chsCrossmember() {
  const u = [[-0.025, 0.02], [-0.025, -0.02], [0.025, -0.02], [0.025, 0.02], [0.0215, 0.02], [0.0215, -0.0165], [-0.0215, -0.0165], [-0.0215, 0.02]];
  const end = sg => P(`Beugel dwarsbalk ${chsSn(sg)}`, merge([
    xf(G.box(0.07, 0.005, 0.06), [sg * 0.435, 0.2825, 1.075]), xf(G.box(0.008, 0.08, 0.05), [sg * 0.427, 0.2425, 1.075]),
    xf(G.box(0.07, 0.10, 0.005), [sg * 0.45, 0.2325, 1.075 - 0.0285]), xf(G.box(0.07, 0.10, 0.005), [sg * 0.45, 0.2325, 1.075 + 0.0285])]), MAT.chsPaint, {
    d: 'Beugel aan het einde van de dwarsbalk: schroeft aan de langsligger en houdt de achterste draagarmbus.', ex: [sg * 0.2, 0, 0] });
  const bolts = sg => P(`Dwarsbalkbouten ${chsSn(sg)}`, merge([-0.02, 0.02].map(dz => xf(chsBolt(0.04, 0.012, 'y'), [sg * 0.435, 0.2875, 1.075 + dz], [PI, 0, 0]))), MAT.steel, { d: 'Twee bouten door de bovenplaat in de langsligger.', ex: [0, 0.3, 0] });
  return A('Dwarsbalk', { d: 'Dwarsbalk van geperst plaatstaal achter de motor, tussen de beide langsliggers; houdt de achterste draagarmbussen. De exacte opbouw van het hulpframe is niet gevonden: schematisch en geschat.', ex: [0, -0.2, -0.3] }, [
    P('Dwarsbalk', xf(side(shapeOf(u), 0.86), [0, 0.20, 1.07]), MAT.chsPaint, { d: 'Omgekeerd hoedprofiel van 4 mm plaatstaal dat de langsliggers verbindt.', ex: [0, 0, 0] }),
    end(1), end(-1), bolts(1), bolts(-1)]);
}

function chsBuildFront() {
  return A('Vooras en stuurinrichting', {
    d: 'Voorwielophanging met McPherson-veerpoten, onderste draagarmen, stabilisatorstang en dwarsbalk, plus de tandheugelbesturing (zonder stuurbekrachtiging) met stuurkolom tot het interieur.', ex: [0, -0.35, 0.35],
  }, [chsSteering(), chsFrontCorner(1), chsFrontCorner(-1), chsStabilizer(), chsCrossmember()]);
}

/* ---------- achteras: torsie-as met langsarmen, schroefveren, schokdempers en panhardstang ---------- */
const chsRArm = [[0.505, 0.195, -0.80], [0.518, 0.216, -0.92], [0.530, 0.240, -1.07], [0.540, 0.260, -1.20], [0.545, AY, AXR]];

function chsDamper(sg, n) {
  const B = [0.552, 0.29, -1.31], T = [0.534, 0.545, -1.305], d = V3(T[0] - B[0], T[1] - B[1], T[2] - B[2]), L = d.length();
  const sp = s => [0, s, 0];
  return A(`Schokdemper ${n}`, {
    d: 'Dubbelwerkende hydraulische schokdemper achter, achter de wielas tussen langsarm en wielkast; apart van de schroefveer. Opbouw schematisch.', p: B, q: chsQ(d.normalize()), ex: [0.0, 0.2, -0.2],
  }, [
    P('Demperoog', merge([G.torus('x', 0.0105, 0.0035, 16, 5), xf(G.cyl('y', 0.006, 0.006, 0.03, 8), [0, 0.02, 0])]), MAT.steel, { d: 'Onderoog met rubberbus, tussen de oren van de langsarm.', ex: [0, -0.06, 0] }),
    P('Demperbuis', G.cyl('y', 0.0165, 0.0165, 0.14, 18), MAT.chsPaint, { d: 'Werkcilinder met olie en gas.', p: sp(0.10), ex: [0, 0, 0] }),
    P('Stofkap', G.cyl('y', 0.0205, 0.0205, 0.12, 18), MAT.darkSteel, { d: 'Stalen stofkap over de zuigerstang; beschermt hem tegen steenslag en vuil.', p: sp(0.18), ex: [0, 0.1, 0] }),
    P('Zuigerstang', G.cyl('y', 0.006, 0.006, 0.042, 10), MAT.chrome, { d: 'Zuigerstang, bovenaan zichtbaar boven de stofkap.', p: sp(0.241), ex: [0, 0.18, 0] }),
    P('Demperrubber boven', G.cyl('y', 0.026, 0.026, 0.018, 16), MAT.rubber, { d: 'Rubber bovenbevestiging in de wielkast.', p: sp(0.256), ex: [0, 0.28, 0] }),
    P('Demperbout onder', chsBolt(0.05, 0.010, 'x'), MAT.steel, { d: 'Bout door het onderoog en de oren van de langsarm.', p: [-0.031, 0, 0], ex: [-0.15, 0, 0] }),
  ]);
}

function chsRearCorner(sg) {
  const n = chsSn(sg) + 'achter', z0 = AXR, H = [chsMR, AY, z0], P0 = chsRArm[0];
  const arm = merge([tube(chsRArm, 0.0215, 28, 10), xf(G.cyl('x', 0.03, 0.03, 0.07, 16, true), P0),
    rodBetween(chsRArm[4], [0.6295, AY, z0], 0.02, 12), xf(G.box(0.008, 0.12, 0.10), [0.6335, AY, z0]),
    rodBetween([0.545, AY, -1.24], [0.552, 0.29, -1.31], 0.012, 8),
    xf(G.box(0.004, 0.04, 0.04), [0.5395, 0.29, -1.31]), xf(G.box(0.004, 0.04, 0.04), [0.5645, 0.29, -1.31])]);
  const bracket = merge([xf(G.box(0.005, 0.061, 0.08), [P0[0] - 0.035, 0.1955, P0[2]]), xf(G.box(0.005, 0.061, 0.08), [P0[0] + 0.035, 0.1955, P0[2]]), xf(G.box(0.09, 0.005, 0.08), [P0[0], 0.2265, P0[2]])]);
  const SX = 0.525, SZ = -1.115;
  return A(`Wielophanging ${n}`, { d: `Achterwielophanging ${chsSn(sg)}: langsarm van de torsie-as met schroefveer, schokdemper en naaf met lagers. Semi-onafhankelijk; opbouw schematisch.`, s: chsMir(sg), ex: [sg * 0.5, 0, 0] }, [
    P('Langsarm', arm, MAT.chsPaint, { d: 'Buisvormige langsarm van de torsie-as: voor in een rubberen bus aan de carrosserie, achter de astap voor het wiel. Aan de achterzijde zit de oren voor de schokdemper.', ex: [0, 0, 0] }),
    P('Lagerbus voor', G.cyl('x', 0.0265, 0.0265, 0.06, 16), MAT.rubber, { d: 'Grote rubberbus in het voorste oog van de langsarm; de arm draait er om een dwarse as in.', p: P0, ex: [0.2, 0, 0.1] }),
    P('Lagerbout voor', chsBolt(0.11, 0.014, 'x'), MAT.steel, { d: 'Draaibout door bus en beugel.', p: [P0[0] - 0.055, P0[1], P0[2]], ex: [-0.2, 0, 0.1] }),
    P('Lagerbeugel voor', bracket, MAT.chsPaint, { d: 'Beugel onder de vloer waarin de voorste bus van de langsarm hangt (plaats geschat).', ex: [0, 0.2, 0.2] }),
    P('Astap', chsLathe('x', [[0, -0.055], [0.0155, -0.055], [0.0155, -0.020], [0.0120, -0.020], [0.0120, 0.0], [0.0095, 0.0], [0.0095, 0.0105], [0, 0.0105]], 20, 'Spin'), MAT.steel, { d: 'Astap op de plaat aan het einde van de langsarm; draagt de naaf op twee lagers.', p: H, ex: [0.12, 0, 0] }),
    P('Naaf achter', chsLathe('x', [[0.0255, -0.052], [0.0295, -0.052], [0.0295, -0.012], [0.045, -0.012], [0.045, -0.004], [0.0255, -0.004], [0.0255, -0.052]], 28, 'RHub'), MAT.steel, { d: 'Naaf met flens: de remtrommel en het wiel worden op de flens geklemd.', p: H, ex: [0.25, 0, 0] }),
    P('Wiellager binnen', chsLathe('x', [[0.0155, -0.048], [0.0255, -0.048], [0.0255, -0.038], [0.0155, -0.038], [0.0155, -0.048]], 24, 'RBi'), MAT.bearing, { d: 'Binnenste kegelrollager van de naaf (aannemelijk bij een ongedreven as).', p: H, ex: [0.05, 0.1, 0], inner: true }),
    P('Wiellager buiten', chsLathe('x', [[0.0155, -0.030], [0.0255, -0.030], [0.0255, -0.020], [0.0155, -0.020], [0.0155, -0.030]], 24, 'RBo'), MAT.bearing, { d: 'Buitenste kegelrollager van de naaf.', p: H, ex: [0.1, 0.1, 0], inner: true }),
    P('Naafmoer achter', hexNut('x', 0.0125, 0.0105), MAT.steel, { d: 'Moer op de astap die het lagerspel instelt.', p: [H[0] + 0.0052, AY, z0], ex: [0.35, 0, 0] }),
    P('Naafdop', chsLathe('x', [[0, 0.0145], [0.0255, 0.0145], [0.0295, 0.0105], [0.0295, -0.004], [0.0255, -0.004]], 22, 'RCap'), MAT.steel, { d: 'Stofdop met vet over het naafuiteinde.', p: H, ex: [0.42, 0, 0] }),
    P('Schroefveer achter', spring(0.045, 0.0055, 0.175, 7, 'y', 9), MAT.chsSpring, { d: 'Schroefveer die het achtergewicht draagt; staat op de langsarm vlak voor de wielas.', p: [SX, 0.3705, SZ], ex: [-0.2, 0.2, 0] }),
    P('Veerzetel', G.lathe('y', [[0.022, 0], [0.052, 0.002], [0.054, 0.008], [0.051, 0.010], [0.022, 0.005]], 28, 'chsRSeat'), MAT.darkSteel, { d: 'Onderste veerzetel op de langsarm.', p: [SX, 0.275, SZ], ex: [0, 0.07, 0] }),
    P('Veerrubber boven', annulus(0.02, 0.053, 0.012, 'y', 28), MAT.rubber, { d: 'Rubber steunring tussen veer en carrosserie.', p: [SX, 0.466, SZ], ex: [0, 0.35, 0] }),
    P('Aanslagrubber achter', G.cyl('y', 0.02, 0.015, 0.05, 14), MAT.rubber, { d: 'Rubberen aanslag in de veer; vangt het inveren op.', p: [SX, 0.435, SZ], ex: [0, 0.3, 0] }),
    chsDamper(sg, n),
  ]);
}

function chsBuildRear() {
  const vee = [[-0.045, 0.035], [0, -0.035], [0.045, 0.035], [0.038, 0.035], [0, -0.0245], [-0.038, 0.035]];
  const L = [0.43, 0.30, -1.34], R = [-0.50, 0.30, -1.34];
  const eye = (p, k) => xf(G.cyl('z', 0.0235, 0.0235, 0.03, 16, true), p);
  const bodyBr = merge([xf(G.box(0.06, 0.005, 0.07), [L[0], 0.2875, L[2]]), xf(G.box(0.06, 0.09, 0.005), [L[0], 0.2425, L[2] - 0.0235]), xf(G.box(0.06, 0.09, 0.005), [L[0], 0.2425, L[2] + 0.0235])]);
  const axleBr = merge([rodBetween([-0.535, 0.255, -1.195], [R[0], R[1], R[2]], 0.012, 8), xf(G.box(0.06, 0.07, 0.005), [R[0], R[1], R[2] - 0.0235]), xf(G.box(0.06, 0.07, 0.005), [R[0], R[1], R[2] + 0.0235])]);
  return A('Achteras', {
    d: 'Semi-onafhankelijke torsie-as (isolated trailing link): twee langsarmen verbonden door een torsiebalk, met panhardstang, schroefveren en schokdempers. Geen achterstabilisator. Opbouw schematisch, geschat.', ex: [0, -0.3, -0.35],
  }, [
    P('Torsiebalk', xf(side(shapeOf(vee), 1.04), [0, 0.26, -1.19]), MAT.chsPaint, { d: 'V-vormige dwarsbalk die de langsarmen verbindt en als torsiestaaf de rol van de as opvangt (geschat: vorm en plaats).', ex: [0, 0, 0] }),
    A('Panhardstang', { d: 'Dwarse stang die de as zijdelings stuurt: links aan de carrosserie, rechts aan de langsarm.', ex: [0, -0.1, -0.3] }, [
      P('Panhardstang', merge([rodBetween(L, R, 0.011, 12), eye(L), eye(R)]), MAT.chsPaint, { d: 'Stalen stang met rubberbussen in de ogen.', ex: [0, 0, 0] }),
      P('Panhardbus links', G.cyl('z', 0.0185, 0.0185, 0.04, 14), MAT.rubber, { d: 'Rubberbus bij de carrosserie.', p: L, ex: [0.1, 0, 0] }),
      P('Panhardbus rechts', G.cyl('z', 0.0185, 0.0185, 0.04, 14), MAT.rubber, { d: 'Rubberbus bij de langsarm.', p: R, ex: [-0.1, 0, 0] }),
      P('Panhardbout links', chsBolt(0.07, 0.010, 'z'), MAT.steel, { d: 'Bout door beugel en bus; ligt geheel in de linker langsligger achter en is van buiten niet te zien.', p: [L[0], L[1], L[2] - 0.035], ex: [0.1, 0, -0.1], inner: true }),
      P('Panhardbout rechts', chsBolt(0.07, 0.010, 'z'), MAT.steel, { d: 'Bout door beugel en bus.', p: [R[0], R[1], R[2] - 0.035], ex: [-0.1, 0, -0.1] }),
      P('Panhardbeugel carrosserie', bodyBr, MAT.chsPaint, { d: 'Beugel onder de linker achterlangsligger (plaats geschat).', ex: [0.1, 0.1, 0] }),
      P('Panhardbeugel as', axleBr, MAT.chsPaint, { d: 'Beugel aan de rechter langsarm.', ex: [-0.1, 0.1, 0] })]),
    chsRearCorner(1), chsRearCorner(-1)]);
}

/* ---------- remsysteem ---------- */
function chsDiscG() {
  return cache('chsDiscG', () => merge([
    chsLathe('x', [[0.0335, 0.0], [0.0605, 0.0], [0.0605, -0.0475], [0.0575, -0.0475], [0.0575, -0.004], [0.0335, -0.004], [0.0335, 0.0]], 36, 'DiscH'),
    chsLathe('x', [[0.0575, -0.043], [0.091, -0.043], [0.091, -0.0475], [0.0575, -0.0475], [0.0575, -0.043]], 36, 'DiscO'),
    chsLathe('x', [[0.0605, -0.0565], [0.091, -0.0565], [0.091, -0.061], [0.0605, -0.0565], [0.0605, -0.0565]], 36, 'DiscI'),
    xf(blades(28, 0.0605, 0.091, 0.009, 0.004, 0, 'x'), [-0.052, 0, 0])]));
}

function chsCaliper(sg, n, H) {
  const bx = (w, h, d, p) => xf(G.box(w, h, d), p);
  const housing = merge([bx(0.039, 0.062, 0.082, [-0.0955, 0.075, 0]), bx(0.0945, 0.012, 0.026, [-0.068, 0.099, 0.030]), bx(0.0945, 0.012, 0.026, [-0.068, 0.099, -0.030]),
    bx(0.008, 0.058, 0.082, [-0.0245, 0.078, 0]), xf(G.cyl('x', 0.034, 0.034, 0.012, 18), [-0.121, 0.075, 0]), bx(0.02, 0.022, 0.012, [-0.11, 0.052, 0.0465]), bx(0.02, 0.022, 0.012, [-0.11, 0.052, -0.0465])]);
  const carrier = merge([bx(0.068, 0.026, 0.009, [-0.054, 0.070, 0.0465]), bx(0.068, 0.026, 0.009, [-0.054, 0.070, -0.0465]), bx(0.022, 0.045, 0.010, [-0.089, 0.0625, 0.0465]), bx(0.022, 0.045, 0.010, [-0.089, 0.0625, -0.0465])]);
  const pad = (nm, d, rx, lx) => A(nm, { d, ex: [rx > -0.05 ? 0.08 : -0.1, 0.12, 0] }, [
    P('Rugplaat', G.box(0.005, 0.036, 0.075), MAT.steel, { d: 'Stalen rugplaat van het remblok.', p: [rx, 0.070, 0], ex: [rx > -0.05 ? 0.02 : -0.02, 0, 0] }),
    P('Remvoering', G.box(0.010, 0.034, 0.073), MAT.friction, { d: 'Wrijvingsmateriaal dat tegen de schijf klemt.', p: [lx, 0.070, 0], ex: [rx > -0.05 ? -0.02 : 0.02, 0, 0] })]);
  return A(`Remklauw ${n}`, {
    d: 'Zwevende remklauw met één zuiger aan de binnenkant: de klauw schuift over twee geleidepennen op de drager, zodat de vuist het buitenste blok tegen de schijf trekt. Maten geschat.', p: H, r: [HALF - chsPHI, 0, 0], ex: [0.12, 0.1, 0.1],
  }, [
    P('Klauwhuis', housing, MAT.chsCaliper, { d: 'Gegoten klauwhuis met cilinder, brug over de schijf en vuist aan de buitenkant.', ex: [-0.04, 0, 0] }),
    P('Klauwdrager', carrier, MAT.darkSteel, { d: 'Drager die met twee bouten aan de fusee zit en de remblokken geleidt.', ex: [-0.12, -0.04, 0] }),
    pad('Remblok binnen', 'Remblok aan de zuigerzijde: rugplaat en voering.', -0.0735, -0.066),
    pad('Remblok buiten', 'Remblok aan de vuistzijde: rugplaat en voering.', -0.0305, -0.038),
    P('Zuiger', G.cyl('x', 0.027, 0.027, 0.030, 18), MAT.steel, { d: 'Hydraulische zuiger in het klauwhuis; drukt het binnenste blok tegen de schijf.', p: [-0.091, 0.075, 0], ex: [-0.1, 0, 0], inner: true }),
    ...[1, -1].map(k => P(`Geleidepen ${k > 0 ? 'boven' : 'onder'}`, G.cyl('x', 0.006, 0.006, 0.052, 8), MAT.steel, { d: 'Glijpen waarover de zwevende klauw schuift; geschroefd in de drager.', p: [-0.097, 0.052, k * 0.0465], ex: [-0.15, 0.04, k * 0.05] })),
    P('Ontluchtingsnippel', G.cyl('y', 0.0035, 0.0045, 0.016, 8), MAT.steel, { d: 'Nippel om lucht uit het remcircuit te laten.', p: [-0.095, 0.1085, 0.02], ex: [0, 0.2, 0] }),
    P('Remslangaansluiting', G.cyl('x', 0.006, 0.006, 0.014, 8), MAT.chsZinc, { d: 'Holle bout waarmee de remslang op het klauwhuis zit.', p: [-0.1235, 0.085, -0.02], ex: [-0.2, 0.05, 0] }),
    P('Dragerbouten', merge([1, -1].map(k => xf(chsBolt(0.045, 0.011, 'x'), [-0.106, 0.0625, k * 0.0465]))), MAT.steel, { d: 'Twee bouten die de drager op de fusee houden.', ex: [-0.3, 0, 0] }),
  ]);
}

function chsFrontBrake(sg) {
  const n = chsSn(sg) + 'voor', H = [chsMF, AY, AXF];
  return A(`Schijfrem ${n}`, { d: `Schijfrem ${chsSn(sg)} voor: geventileerde remschijf (geventileerd volgens Autoweek, diameter 182 mm geschat) met zwevende remklauw.`, s: chsMir(sg), ex: [sg * 0.5, 0, 0] }, [
    P(`Remschijf ${n}`, chsDiscG(), MAT.chsDisc, { d: 'Geventileerde remschijf van gietijzer met naafkap; zit tussen naafflens en wiel. Diameter 182 mm is geschat (Indiase Zen-waarde).', p: H, ex: [0.12, 0, 0] }),
    chsCaliper(sg, n, H)]);
}

function chsRearBrake(sg) {
  const n = chsSn(sg) + 'achter', H = [chsMR, AY, AXR];
  const rad = d => d * PI / 180, F = [rad(-65), rad(75)], R = [rad(105), rad(245)];
  const shoeWeb = (a) => merge([xf(chsSector(a[0], a[1], 0.042, 0.0805, 0.003), [-0.049, 0, 0]), xf(chsSector(a[0], a[1], 0.0805, 0.0835, 0.030), [-0.0355, 0, 0])]);
  const lining = (a) => xf(chsSector(a[0] + 0.04, a[1] - 0.04, 0.0835, 0.0895, 0.030), [-0.0355, 0, 0]);
  const drum = merge([chsLathe('x', [[0.0295, 0.0], [0.0985, 0.0], [0.0985, -0.0510], [0.0905, -0.0510], [0.0905, -0.0040], [0.0295, -0.0040], [0.0295, 0.0]], 36, 'Drum'),
    chsLathe('x', [[0.0985, -0.026], [0.1010, -0.026], [0.1010, -0.0215], [0.0985, -0.0215], [0.0985, -0.026]], 36, 'DrumR')]);
  const plate = merge([chsLathe('x', [[0.030, -0.0550], [0.0955, -0.0550], [0.0955, -0.0505], [0.0935, -0.0505], [0.0935, -0.0530], [0.030, -0.0530], [0.030, -0.0550]], 32, 'Bp'), xf(G.box(0.012, 0.014, 0.030), [-0.0455, -0.0765, 0])]);
  const holder = merge([1, -1].map(k => merge([xf(G.cyl('x', 0.003, 0.003, 0.03, 6), [-0.041, 0.0054, k * 0.0618]), xf(G.cyl('x', 0.007, 0.007, 0.004, 10), [-0.0265, 0.0054, k * 0.0618])])));
  return A(`Trommelrem ${n}`, { d: `Trommelrem ${chsSn(sg)} achter: remtrommel (180 mm, geschat) met twee remschoenen, wielremcilinder en stelmechanisme op de remschildplaat; de parkeerrem werkt mechanisch op dezelfde schoenen.`, s: chsMir(sg), ex: [sg * 0.5, 0, 0] }, [
    P(`Remtrommel ${n}`, drum, MAT.chsDisc, { d: 'Gietijzeren trommel met koelrib; zit tegen de naafflens. Diameter 180 mm is geschat (Indiase Zen-waarde).', p: H, ex: [0.18, 0, 0] }),
    P(`Remschildplaat ${n}`, plate, MAT.darkSteel, { d: 'Stalen plaat op de astap waaraan wielremcilinder, schoenen en veren zitten; heeft een aangegoten steunblok voor de schoenen.', p: H, ex: [0, 0, 0] }),
    P('Remschoen voor', shoeWeb(F), MAT.steel, { d: 'Voorlopende remschoen: stalen schoen met flens.', p: H, ex: [0.07, 0.0, 0.1], inner: true }),
    P('Remvoering voor', lining(F), MAT.friction, { d: 'Wrijvingsmateriaal op de voorste schoen.', p: H, ex: [0.1, 0, 0.1], inner: true }),
    P('Remschoen achter', shoeWeb(R), MAT.steel, { d: 'Naloopende remschoen: stalen schoen met flens.', p: H, ex: [0.07, 0, -0.1], inner: true }),
    P('Remvoering achter', lining(R), MAT.friction, { d: 'Wrijvingsmateriaal op de achterste schoen.', p: H, ex: [0.1, 0, -0.1], inner: true }),
    P('Wielremcilinder', merge([xf(G.cyl('z', 0.0115, 0.0115, 0.05, 14), [-0.045, 0.0795, 0]), ...[1, -1].map(k => xf(G.cyl('z', 0.009, 0.009, 0.012, 10), [-0.045, 0.0795, k * 0.027]))]), MAT.aluCast, { d: 'Hydraulische cilinder met twee zuigertjes die de schoenen uit elkaar duwen.', p: H, ex: [0, 0.14, 0], inner: true }),
    P('Stelmechanisme', merge([rodBetween([-0.047, -0.035, -0.060], [-0.047, -0.035, 0.060], 0.004, 8), xf(G.cyl('z', 0.011, 0.011, 0.01, 12), [-0.047, -0.035, 0])]), MAT.darkSteel, { d: 'Automatisch stelmechanisme met stelrad: houdt de speling tussen voering en trommel constant.', p: H, ex: [0.0, -0.12, 0], inner: true }),
    P('Terugtrekveer boven', chsCoil(0.0035, 0.0009, 0.05, 7, 'z', 6, 3), MAT.steel, { d: 'Veer die de schoenen bij de cilinder naar elkaar trekt.', p: [H[0] - 0.044, H[1] + 0.05, H[2]], ex: [0.1, 0.1, 0], inner: true }),
    P('Terugtrekveer onder', chsCoil(0.0035, 0.0009, 0.066, 8, 'z', 6, 3), MAT.steel, { d: 'Veer die de schoenen bij het steunblok naar elkaar trekt.', p: [H[0] - 0.044, H[1] - 0.060, H[2]], ex: [0.1, -0.1, 0], inner: true }),
    P('Schoenhouders', holder, MAT.steel, { d: 'Twee pennen met kopjes en veertjes die de schoenen tegen de plaat houden.', p: H, ex: [0.05, 0.0, 0.2], inner: true }),
    P('Handremhefboom', rodBetween([-0.046, 0.075, -0.022], [-0.065, 0.03, -0.085], 0.0045, 8), MAT.steel, { d: 'Hefboom op de achterste schoen: de handremkabel trekt eraan en spreidt de schoenen mechanisch.', p: H, ex: [0.0, 0.1, -0.2] }),
    P('Ontluchtingsnippel achter', G.cyl('x', 0.0035, 0.0045, 0.012, 8), MAT.steel, { d: 'Nippel om lucht uit de wielremcilinder te laten.', p: [H[0] - 0.061, H[1] + 0.0795, H[2] + 0.012], ex: [-0.15, 0.1, 0] }),
  ]);
}

function chsMaster() {
  const X = 0.39, Y = 0.60, Z0 = 0.870;
  const boost = merge([chsLathe('z', [[0, 0], [0.080, 0], [0.088, 0.008], [0.088, 0.040], [0.0915, 0.042], [0.0915, 0.050], [0.088, 0.052], [0.088, 0.096], [0.080, 0.104], [0, 0.104]], 32, 'Boost'),
    ...[[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([a, b]) => xf(G.cyl('z', 0.004, 0.004, 0.016, 8), [a * 0.055, b * 0.055, -0.008]))]);   // de vier bevestigingspennen steken alleen door de plaat van het schutbord (z 0,854 tot 0,866), niet door tot in het dashboard
  const mc = merge([xf(G.cyl('z', 0.0127, 0.0127, 0.166, 16), [0, 0, 0.083]), xf(G.cyl('z', 0.0205, 0.0205, 0.01, 16), [0, 0, 0.005]), xf(G.cyl('z', 0.0145, 0.0145, 0.014, 14), [0, 0, 0.159])]);
  return A('Hoofdremcilinder en rembekrachtiger', {
    d: 'Onderdrukservo met tandemhoofdcilinder en reservoir, op het schutbord links in de motorruimte (linksgestuurd). De servo trekt onderdruk uit het inlaatspruitstuk (slang niet getekend, de inlaat heeft daar geen poort). Plaats en maten geschat.', ex: [0.2, 0.2, 0.5],
  }, [
    P('Rembekrachtiger', boost, MAT.chsPaint, { d: 'Onderdrukservo (membraan in een stalen dubbele schaal) tegen het schutbord; versterkt de pedaalkracht, geen ABS.', spec: [['Type', 'onderdrukservo']], p: [X, Y, Z0], ex: [0, 0, 0] }),
    P('Duwstang', merge([rodBetween([0, 0, 0], [-0.02, -0.02, -0.035], 0.0075, 10), xf(G.box(0.016, 0.03, 0.012), [-0.02, -0.02, -0.04])]), MAT.chsZinc, { d: 'Duwstang door het schutbord naar het rempedaal (het rempedaal hoort bij het interieur).', p: [X, Y, Z0], ex: [0, 0, -0.3] }),
    P('Hoofdremcilinder', mc, MAT.aluCast, { d: 'Tandemhoofdcilinder met twee remcircuits (voor en achter, geschat), vastgeschroefd op de servo.', p: [X, Y, 0.974], ex: [0, 0, 0.25] }),
    P('Remvloeistofreservoir', G.rbox(0.05, 0.065, 0.09, 0.008), MAT.tank, { d: 'Doorzichtig reservoir met remvloeistof, op de hoofdcilinder.', p: [X, 0.6455, 1.045], ex: [0, 0.2, 0.1] }),
    P('Reservoirdop', G.cyl('y', 0.017, 0.017, 0.014, 14), MAT.plastic, { d: 'Dop met peilschakelaar (niet getekend).', p: [X, 0.685, 1.045], ex: [0, 0.35, 0.1] }),
  ]);
}

function chsHydraulics() {
  const calM = chsMat([chsMF, AY, AXF], [HALF - chsPHI, 0, 0]);
  const ban = chsPt(calM, [-0.131, 0.085, -0.02]);
  const FL = [[0.39, 0.587, 1.125], [0.39, 0.55, 1.125], [0.39, 0.50, 1.14], [0.40, 0.50, 1.15], [0.46, 0.50, 1.16], [0.515, 0.50, 1.16]];
  const FR = [[0.39, 0.587, 1.125], [0.39, 0.575, 1.125], [0.33, 0.58, 1.12], [0.215, 0.58, 1.10], [0.215, 0.58, 0.905], [-0.35, 0.575, 0.905], [-0.46, 0.52, 0.97], [-0.50, 0.50, 1.05], [-0.515, 0.50, 1.16]];
  const RM = [[0.39, 0.587, 1.085], [0.39, 0.50, 1.085], [0.33, 0.50, 0.99], [0.30, 0.51, 0.912], [0.30, 0.40, 0.909], [0.30, 0.26, 0.905], [0.33, 0.215, 0.80], [0.36, 0.205, 0.5], [0.36, 0.205, -0.5], [0.36, 0.213, -0.9], [0.40, 0.213, -0.98]];
  const RL = [[0.40, 0.213, -0.98], [0.42, 0.22, -1.04], [0.43, 0.235, -1.095]];
  // de leiding naar rechts loopt dwars onder de vloer (y 0,23) en boven de tank (y 0,19) naar de rechter achterlangsligger; de verhoging bij x 0,27 tot 0,34
  // (y 0,2255) liet haar over de verbindingspijp van de uitlaat lopen toen die links (+x) lag. Met het systemenpakket van golf 5 loopt de uitlaat
  // rechts (-x); deze route is daarop nog niet nagemeten
  const RR = [[0.40, 0.213, -0.98], [0.34, 0.2255, -0.98], [0.27, 0.2255, -0.98], [0.2, 0.213, -0.98], [0.0, 0.213, -0.98], [-0.36, 0.215, -1.04], [-0.43, 0.235, -1.095]];
  const hoseF = sg => chsXs(sg, [[0.515, 0.495, 1.16], [0.53, 0.46, 1.165], [0.58, 0.40, 1.17], [0.575, 0.34, 1.17], ban]);
  const hoseR = sg => chsXs(sg, [[0.43, 0.235, -1.095], [0.47, 0.33, -1.15], [0.54, 0.37, -1.20], [0.60, 0.375, -1.22], [chsMR - 0.067, AY + 0.0795, AXR - 0.012]]);
  const hf = sg => P(`Remslang voor ${chsSn(sg)}`, chsLine(hoseF(sg), 0.0045, 8), MAT.rubber, { d: 'Flexibele remslang van de carrosserie naar de remklauw; volgt de veer- en stuurbeweging.', ex: [sg * 0.2, 0.1, 0.1] });
  const hr = sg => P(`Remslang achter ${chsSn(sg)}`, chsLine(hoseR(sg), 0.0045, 8), MAT.rubber, { d: 'Flexibele remslang van de carrosserie naar de wielremcilinder, door de velg heen.', ex: [sg * 0.2, 0.1, -0.1] });
  const bk = sg => P(`Slangbeugel ${chsSn(sg)}`, xf(G.box(0.03, 0.02, 0.012), [sg * 0.515, 0.50, 1.16]), MAT.chsZinc, { d: 'Beugel op de wielkastwand waar de stijve leiding in de remslang overgaat.', ex: [sg * 0.15, 0.1, 0] });
  const clip = (z, i) => P(`Remleidingklem ${i}`, merge([xf(G.box(0.03, 0.008, 0.02), [0.36, 0.2105, z]), xf(G.cyl('x', 0.006, 0.006, 0.02, 8), [0.36, 0.208, z])]), MAT.plasticGrey, { d: 'Klem die de remleiding onder de vloer vasthoudt.', ex: [0, -0.1, 0] });
  return A('Remleidingen', { d: 'Stijve remleidingen en flexibele remslangen: twee circuits (voor en achter, geschat) van de hoofdcilinder naar de vier wielen. De routes zijn schematisch.', ex: [0, -0.3, 0] }, [
    P('Remleiding voor links', chsLine(FL, 0.003), MAT.chsZinc, { d: 'Verzinkte stalen leiding van de hoofdcilinder naar de linker voorwielkast.', ex: [0, 0.12, 0] }),
    P('Remleiding voor rechts', chsLine(FR, 0.003), MAT.chsZinc, { d: 'Verzinkte stalen leiding langs het schutbord naar de rechter voorwielkast.', ex: [0, 0.12, 0] }),
    P('Remleiding achter', chsLine(RM, 0.003), MAT.chsZinc, { d: 'Leiding van de hoofdcilinder achter het stuurhuis langs, onder de vloer naar de achterwielen.', ex: [0, -0.1, 0] }),
    P('Remverdeler achter', merge([xf(G.box(0.03, 0.02, 0.03), [0.40, 0.213, -0.98])]), MAT.chsZinc, { d: 'T-stuk dat het achtercircuit naar links en rechts verdeelt.', ex: [0, -0.1, 0] }),
    P('Remleiding achter links', chsLine(RL, 0.003), MAT.chsZinc, { d: 'Leiding van het T-stuk naar de linker achterlangsligger.', ex: [0.1, -0.1, 0] }),
    P('Remleiding achter rechts', chsLine(RR, 0.003), MAT.chsZinc, { d: 'Leiding van het T-stuk dwars onder de vloer naar de rechter achterlangsligger.', ex: [-0.1, -0.1, 0] }),
    hf(1), hf(-1), hr(1), hr(-1), bk(1), bk(-1), clip(0.45, 1), clip(-0.25, 2), clip(-0.86, 3),
    P('Remdrukbegrenzer', merge([xf(G.cyl('z', 0.014, 0.014, 0.05, 14), [0.30, 0.40, 0.935]), xf(G.box(0.03, 0.01, 0.03), [0.30, 0.43, 0.935])]), MAT.chsZinc, { d: 'Remdrukbegrenzer in het achtercircuit: beperkt de druk op de achterwielen (schematisch, aannemelijk).', ex: [0.1, 0.2, 0] }),
  ]);
}

function chsHandbrake() {
  // De hendel met scharnier en steun is van het interieur (Middenconsole/Handremhendel met hoes; scharnier op (0,065; 0,34; 0,104),
  // as langs x). Het onderstel levert alleen de kabels en de egalisator: de voorste kabel begint op het kabelaansluitpunt 40 mm onder
  // het scharnier (INT_PORTS.handremkabel, uit het interieurpakket van golf 5; tot dat is samengevoegd geldt dezelfde waarde hier).
  // B-035: hier stond een tweede hendel met greep en steun op x 0, 60 mm diep in de tunnelconsole. Vloerbedekking boven op y 0,275.
  const H = INT_PORTS.handremkabel || [0.065, 0.30, 0.104], hx = H[0];
  const K = sg => [sg * (chsMR - 0.065), AY + 0.03, AXR - 0.085];
  const cab = sg => [[sg * 0.02, 0.215, -0.64], [sg * 0.15, 0.216, -0.85], [sg * 0.35, 0.215, -1.0], [sg * 0.50, 0.217, -1.12], [sg * 0.52, 0.22, -1.29], [sg * 0.60, 0.27, -1.325], K(sg)];
  const rear = sg => P(`Handremkabel ${chsSn(sg)}`, chsLine(cab(sg), 0.0035, 6), MAT.rubber, { d: `Handremkabel naar de ${chsSn(sg)} achtertrommel (buitenkabel met binnenkabel, getekend als geheel).`, ex: [sg * 0.2, -0.1, -0.2] });
  const klem = sg => P(`Kabelklem ${chsSn(sg)}`, xf(G.box(0.025, 0.008, 0.02), [sg * 0.35, 0.2125, -1.0]), MAT.plasticGrey, { d: 'Klem die de handremkabel aan de vloer vasthoudt.', ex: [sg * 0.1, -0.1, 0] });
  return A('Handrem', { d: 'Parkeerrem: de hendel op de middenconsole (interieur) trekt via de voorste kabel aan een egalisator onder de vloer, die twee kabels naar de schoenen van de achtertrommels verdeelt. Hendel, steun en console zijn van het interieur; het onderstel levert de kabels en de egalisator.', ex: [0, -0.2, -0.3] }, [
    P('Handremkabel voor', chsLine([H, [hx, 0.288, H[2] - 0.05], [hx - 0.003, 0.285, -0.10], [0.04, 0.24, -0.22], [0.02, 0.205, -0.30], [0, 0.205, -0.60]], 0.0035, 6), MAT.rubber, { d: 'Voorste kabel van de handremhendel (aansluitpunt onder het scharnier in de console) door de vloer naar de egalisator.', ex: [0, -0.15, 0] }),
    P('Egalisator', merge([xf(G.box(0.04, 0.02, 0.03), [0, 0.205, -0.63])]), MAT.steel, { d: 'Verdeelstuk dat de kabelspanning over links en rechts gelijk verdeelt.', ex: [0, -0.15, -0.1] }),
    rear(1), rear(-1), klem(1), klem(-1)]);
}

function chsBuildBrakes() {
  return A('Remsysteem', {
    d: 'Hydraulisch remsysteem met onderdrukservo en geen ABS: geventileerde schijfremmen voor met zwevende klauw, trommelremmen achter, hoofdcilinder met reservoir, leidingen en handrem op de achterwielen.', ex: [0, -0.5, 0],
  }, [chsFrontBrake(1), chsFrontBrake(-1), chsRearBrake(1), chsRearBrake(-1), chsMaster(), chsHydraulics(), chsHandbrake()]);
}

function buildChassis() {
  return A('Onderstel', {
    d: 'Onderstel: McPherson-voorwielophanging met tandheugelbesturing zonder bekrachtiging, torsie-as achter, vier stalen wielen met band 145/70 R13 en een remsysteem met schijven voor en trommels achter.', ex: [0, -0.55, 0],
  }, [chsBuildFront(), chsBuildRear(), chsBuildWheels(), chsBuildBrakes()]);
}
