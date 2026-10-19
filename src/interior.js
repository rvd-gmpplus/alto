/* ===================== interieur: stoelen, dashboard, console, bekleding, bagageruimte ===================== */
// Alles wat de carrosserie raakt (hemel, stijlen, zijbekleding, gordelgeleiders) volgt de huidfuncties HW, YB, YT, YR, surfX en ghPt van body.js.
// Autoframe: x links (+), y omhoog, z naar voren (+). Bestuurder links (linksgestuurd). Voorstoelen met de oorsprong op de vloerbedekking.
std('intFoam', 0x3a3834, 0, 1);
std('intCloth', 0x3b3e44, 0, 0.96);    // grijs stoelweefsel (kleur aangenomen)
std('intHead', 0xb9b5aa, 0, 1);        // lichtgrijze hemelstof
std('intSide', 0x4f5359, 0, 0.88);     // grijs kunststof van stijl- en zijbekleding
std('intBelt', 0x25272c, 0, 0.9);
std('intFelt', 0x34332f, 0, 1);        // donker vilt van de bagageruimte
std('intDial', 0xdfe3e6, 0, 0.5);      // wijzerplaat en schaalverdeling
// Dashboard in twee grijstinten volgens de foto van de eigenaar (golf 7, beslissing INT-11): bovenste deel (bovenkant en voorvlak tot y 0,70) en onderste deel
// (kniebeschermer, onderrand, klep en tunnelconsole). Het middenpaneel is donker antraciet in het bestaande `MAT.dash`.
std('intDashTop', 0x545e68, 0, 0.8);
std('intDashLow', 0x3c444a, 0, 0.8);
const intPart = (name, geo, mat, d, o) => P(name, geo, mat, Object.assign({ d }, o));
const intBx = (w, h, d, r, p, rot) => xf(G.rbox(w, h, d, r), p, rot);
const intBox = (w, h, d, p, rot) => xf(G.box(w, h, d), p, rot);
const intCy = (ax, r, h, p, seg = 12) => xf(G.cyl(ax, r, r, h, seg), p);
const intPath = name => `${AUTO.wortel}/Carrosserie/${name}`;
// de opener moet bestaan voordat een afhankelijke opener hem als voorwaarde (needs) noemt
const intNeed = name => { const k = NODES.find(n => n.name === name); return k && k.opn ? { needs: intPath(name) } : {}; };
// zijprofiel (z,y) als blok tussen twee x-waarden
const intSideBlock = (poly, x0, x1) => xf(side(shapeOf(poly), x1 - x0), [(x0 + x1) / 2, 0, 0]);
// vlakke band (gordelband) tussen twee punten; het vlak kijkt naar voren
function intStrip(a, b, w, t) {
  const A0 = V3(...a), B0 = V3(...b), z = B0.clone().sub(A0), L = z.length(); z.normalize();
  const y = V3(0, 0, 1).sub(z.clone().multiplyScalar(z.z)).normalize(), x = y.clone().cross(z).normalize();
  const g = new THREE.BoxGeometry(w, t, L), m = new THREE.Matrix4().makeBasis(x, y, z);
  m.setPosition(A0.add(B0).multiplyScalar(0.5)); g.applyMatrix4(m); return g;
}
// hoogte van het dak aan de binnenzijde op dwarsafstand |x| bij langsplaats z (uit de kasfunctie ghPt)
function intRoofY(z, ax) {
  let best = null;
  for (let i = 0; i <= 60; i++) { const p = ghPt(z, 0.27 + 0.23 * i / 60); const e = Math.abs(Math.abs(p[0]) - ax); if (!best || e < best.e) best = { e, y: p[1] }; }
  return best.y - 0.02;
}

// raster zoals patch (body.js), maar met de rijen per kolom uit een lijst vs(u) (oplopend, overal even lang), zodat een rij precies op een knik kan liggen
function intGrid(fn, u0, u1, nu, vs) {
  const pos = [], idx = [];
  let rows = 0;
  for (let i = 0; i <= nu; i++) { const u = u0 + (u1 - u0) * i / nu, v = vs(u); rows = v.length; v.forEach(w => { const p = fn(u, w); pos.push(p[0], p[1], p[2]); }); }
  for (let i = 0; i < nu; i++) for (let j = 0; j < rows - 1; j++) { const a = i * rows + j, b = a + rows; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}
// gesloten lijst langs z: doorsnede van vier hoeken sec(z) = [[x, y], ...] rondom, n vakken tussen z0 en z1, met eindkappen; vlak gearceerd (hoekpunten niet gedeeld)
function intSweep(sec, z0, z1, n) {
  const pos = [], idx = [];
  for (let i = 0; i <= n; i++) { const z = z0 + (z1 - z0) * i / n; sec(z).forEach(p => pos.push(p[0], p[1], z)); }
  for (let i = 0; i < n; i++) for (let k = 0; k < 4; k++) { const a = i * 4 + k, b = i * 4 + (k + 1) % 4; idx.push(a, a + 4, b, b, a + 4, b + 4); }
  const L = n * 4; idx.push(0, 2, 1, 0, 3, 2, L, L + 1, L + 2, L, L + 2, L + 3);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  const f = g.toNonIndexed(); f.computeVertexNormals(); return f;
}

/* ---------- maten en aansluitpunten ---------- */
const INT_YF = 0.275;                       // bovenkant vloerbedekking (over de dwarsbalken)
const INT_SX = 0.325, INT_SZ = -0.10;       // hartlijn van de voorstoelen (|x|) en langsplaats van het midden van de zitting
// Stuurwiel: midden van de naaf en de richting van de stuurkolom (naar voren en omlaag, 22 graden onder de horizon)
const INT_WHEEL = [0.37, 0.85, 0.35];
const INT_COLDIR = [0, -0.375, 0.927];
// Aansluitpunten voor andere eigenaars (autoframe, geschat): de onderstelgroep sluit de stuurkolom aan op `stuurkolom.p`, een punt op de
// kolomas 0,16 m voor de naaf (waar de kolomkap het schutbord van het dashboard raakt), de bak de schakelstang op `pookvoet`,
// de remmen en de motor de kabels en stangen op de pedaalarmen en de handremhendel.
const INT_PORTS = {
  stuurkolom: { p: [0.37, 0.789, 0.51], dir: INT_COLDIR },
  pookvoet: [0, 0.405, 0.30],
  rempedaal: [0.37, 0.58, 0.835],
  koppelingspedaal: [0.47, 0.60, 0.835],
  gaspedaal: [0.255, 0.42, 0.84],
  // scharnier van de handremhendel (as langs x), in de console boven de tunnel; de kabel van het onderstel sluit aan op `handremkabel`, 40 mm onder het scharnier
  handremhendel: [0.065, 0.34, 0.104],
  handremkabel: [0.065, 0.30, 0.104],
};

/* ---------- voorstoelen ---------- */
// zitting op rails (lengteverstelling, geen hoogteverstelling: verstelling beperkt tot lengte en leuning volgens Autoweek); de rugleuning kantelt naar voren (instap achter bij een 3-deurs) en draagt de hoofdsteun
function intFrontSeat(s) {
  const drv = s > 0, who = drv ? 'Bestuurdersstoel' : 'Passagiersstoel', ver = drv ? 'bestuurder' : 'passagier', bx = intBx, cy = intCy;
  const frame = A('Stoelframe', { d: 'Stalen onderstel van de zitting: zitplaat, buizen, vaste steunen en de rails voor de lengteverstelling.', ex: [0, -0.08, 0] }, [
    intPart('Onderrails', merge([intBox(0.034, 0.02, 0.46, [0.165, 0.012, 0]), intBox(0.034, 0.02, 0.46, [-0.165, 0.012, 0])]), MAT.steel, 'Twee vaste rails op de vloer; de bovenrails schuiven erin voor de lengteverstelling.', { ex: [0, -0.05, 0] }),
    intPart('Bovenrails', merge([intBox(0.03, 0.02, 0.4, [0.165, 0.034, 0]), intBox(0.03, 0.02, 0.4, [-0.165, 0.034, 0])]), MAT.darkSteel, 'Twee bovenrails die in de onderrails schuiven en de zitting dragen.', { ex: [0, 0, 0.04] }),
    intPart('Zittingsteunen', merge([intBox(0.006, 0.074, 0.36, [0.165, 0.0815, 0]), intBox(0.006, 0.074, 0.36, [-0.165, 0.0815, 0])]), MAT.darkSteel, 'Twee vaste stalen steunen tussen de bovenrails en de zitplaat; de zitting is niet in hoogte verstelbaar.', { ex: [0, 0.02, 0] }),
    intPart('Zitplaat', merge([intBx(0.4, 0.012, 0.42, 0.005, [0, 0.125, 0]), cy('z', 0.008, 0.44, [0.19, 0.125, 0]), cy('z', 0.008, 0.44, [-0.19, 0.125, 0]), cy('x', 0.008, 0.38, [0, 0.125, 0.21])]), MAT.darkSteel, 'Geperste stalen plaat waarop het zitschuim rust, met stalen buizen langs de randen.', { ex: [0, 0.04, 0] }),
    intPart('Lengtebeugel', merge([cy('x', 0.007, 0.34, [0, 0.02, 0.27], 8), rodBetween([0.17, 0.02, 0.27], [0.17, 0.05, 0.2], 0.007, 6), rodBetween([-0.17, 0.02, 0.27], [-0.17, 0.05, 0.2], 0.007, 6)]), MAT.steel, 'Beugel onder de voorkant van de zitting waarmee de stoel in de lengte wordt ontgrendeld.', { ex: [0, -0.03, 0.08] }),
  ]);
  const cushion = A('Zitting', { d: 'Zitkussen van schuim met stoffen bekleding en zijwangen.', ex: [0, 0.14, 0] }, [
    intPart('Zitschuim', bx(0.42, 0.085, 0.46, 0.03, [0, 0.172, 0]), MAT.intFoam, 'Gevormd polyurethaanschuim van het zitkussen.', { inner: true, ex: [0, 0.03, 0] }),
    intPart('Zitbekleding', merge([bx(0.44, 0.094, 0.48, 0.034, [0, 0.176, 0]), bx(0.055, 0.045, 0.36, 0.02, [0.18, 0.232, 0.06]), bx(0.055, 0.045, 0.36, 0.02, [-0.18, 0.232, 0.06])]), MAT.intCloth, 'Stoffen bekleding van de zitting met verstevigde zijwangen (stof en kleur aangenomen).', { ex: [0, 0.1, 0.02] }),
  ]);
  // bediening aan de buitenzijde (de portierzijde): hellingshendel; de lengte wordt met de beugel voor onder de zitting ontgrendeld
  // de groep Stoelbediening verviel met de hoogtehendel: een groep met één onderdeel is een waarschuwing van integrity.py
  const ctl = intPart('Hellinghendel', merge([cy('x', 0.012, 0.012, [s * 0.215, 0.19, -0.2], 10), rodBetween([s * 0.215, 0.19, -0.2], [s * 0.23, 0.15, -0.13], 0.006, 6), rodBetween([s * 0.23, 0.15, -0.13], [s * 0.23, 0.15, -0.06], 0.009, 8)]), MAT.plasticGrey, 'Hendel voor de hellingsverstelling van de rugleuning, onder de rugleuning aan de portierzijde.', { ex: [s * 0.19, 0.02, 0] });
  const head = A('Hoofdsteun', { d: 'Hoofdsteun met twee geleidestangen in de bovenkant van de rugleuning; in hoogte verstelbaar (aangenomen).', p: [0, 0.6, -0.005], ex: [0, 0.22, 0] }, [
    intPart('Hoofdsteunkussen', bx(0.27, 0.15, 0.09, 0.04, [0, 0.105, 0]), MAT.intCloth, 'Gevoerd kussen met stoffen bekleding.', { ex: [0, 0.08, 0] }),
    intPart('Hoofdsteunstangen', merge([cy('y', 0.0075, 0.14, [0.07, 0.0, 0], 8), cy('y', 0.0075, 0.14, [-0.07, 0.0, 0], 8)]), MAT.chrome, 'Twee stangen die in de bussen van de rugleuning schuiven en de hoogte bepalen.', { ex: [0, -0.04, 0] }),
  ]);
  const lead = `Rugleuning ${ver}`;
  const back = A(lead, { d: `Rugleuning van de ${who.toLowerCase()} met frame, schuim en stoffen bekleding. Kantelt naar voren (geschat 40 graden) zodat een achterpassagier kan instappen; de hoofdsteun gaat mee.`,
    p: [0, 0.235, -0.205], r: [-0.22, 0, 0], ex: [0, 0.1, -0.24],
    open: hinge([0, 0.235, -0.205], [1, 0, 0], 0.7, Object.assign({ min: 0.58, label: `Rugleuning ${who.toLowerCase()}`, look: { dir: [s * 1, 0.55, -0.25], nodes: [lead] } }, intNeed(`Portier ${drv ? 'links' : 'rechts'}`))) }, [
    intPart('Rugframe', merge([cy('y', 0.009, 0.46, [0.19, 0.32, -0.015]), cy('y', 0.009, 0.46, [-0.19, 0.32, -0.015]), cy('x', 0.009, 0.38, [0, 0.54, -0.015]), cy('x', 0.009, 0.38, [0, 0.1, -0.015])]), MAT.steel, 'Stalen buisframe van de rugleuning.', { inner: true, ex: [0, 0, -0.03] }),
    intPart('Rugschuim', bx(0.42, 0.54, 0.06, 0.028, [0, 0.32, 0.005]), MAT.intFoam, 'Gevormd schuim van de rugleuning.', { inner: true, ex: [0, 0, 0.04] }),
    intPart('Rugbekleding', merge([bx(0.44, 0.56, 0.09, 0.035, [0, 0.32, 0.005]), bx(0.055, 0.5, 0.05, 0.02, [0.19, 0.31, 0.04]), bx(0.055, 0.5, 0.05, 0.02, [-0.19, 0.31, 0.04])]), MAT.intCloth, 'Stoffen bekleding van de rugleuning met verstevigde zijwangen.', { ex: [0, 0, 0.14] }),
    intPart('Rugachterschaal', bx(0.42, 0.54, 0.012, 0.006, [0, 0.32, -0.06]), MAT.plastic, 'Kunststof schaal aan de achterkant van de rugleuning.', { ex: [0, 0, -0.14] }),
    intPart('Instaphendel', bx(0.035, 0.02, 0.05, 0.007, [s * 0.18, 0.585, -0.025]), MAT.plasticGrey, 'Hendel op de bovenzijde van de rugleuning waarmee deze naar voren wordt gekanteld om achter in te stappen.', { ex: [s * 0.04, 0.08, 0] }),
    head,
  ]);
  const buckle = A('Gordelslot voor', { d: 'Gordelslot naast de zitting aan de tunnelzijde, met rode ontgrendelknop.', p: [-s * 0.235, 0.2, -0.13], ex: [-s * 0.1, 0.1, 0] }, [
    intPart('Slotbehuizing', intBx(0.03, 0.07, 0.04, 0.008), MAT.plastic, 'Behuizing van het gordelslot.', { ex: [0, 0.02, 0] }),
    intPart('Ontgrendelknop', intBx(0.016, 0.012, 0.024, 0.004, [0, 0.038, 0.002]), MAT.red, 'Rode knop om de gordel los te maken.', { ex: [0, 0.05, 0] }),
  ]);
  return A(who, { d: `${who}: verstelbaar in lengte en in de helling van de rugleuning, met een rugleuning die naar voren kantelt voor de instap achter en een hoofdsteun (in hoogte verstelbaar: aangenomen). Stoffen bekleding (aangenomen).`,
    spec: [['Verstelling', 'lengte, helling rugleuning']], p: [s * INT_SX, INT_YF, INT_SZ], ex: [s * 0.42, 0.04, 0.05] }, [frame, cushion, ctl, back, buckle]);
}

/* ---------- achterbank: zitting en twee neerklapbare rugleuningdelen ---------- */
// De rugleuning staat 14 graden achterover; het deel klapt om een as iets boven en voor zijn onderkant naar voren (geschat 104 graden)
const INT_RB = { y: 0.5, z: -1.05, tilt: -0.25 };
const INT_RBP = { y: 0.548, z: -1.013, ang: 1.82 };
const INT_RBH = 0.52;
function intRearBack(cx, w, name, d, label) {
  const bx = intBx, cy = intCy, hw = w / 2, out = cx > 0 ? 1 : -1;
  return A(name, { d, p: [cx, INT_RB.y, INT_RB.z], r: [INT_RB.tilt, 0, 0], ex: [out * 0.12, 0.12, -0.12],
    open: hinge([cx, INT_RBP.y, INT_RBP.z], [1, 0, 0], INT_RBP.ang, Object.assign({ min: 1.46, label, look: { dir: [0.5, 0.6, -0.65], nodes: [name, 'Zitting achterbank', 'Achterklep'] } }, intNeed('Achterklep'))) }, [
    intPart('Rugframe', merge([cy('y', 0.009, INT_RBH - 0.1, [hw - 0.04, INT_RBH / 2, -0.02]), cy('y', 0.009, INT_RBH - 0.1, [-hw + 0.04, INT_RBH / 2, -0.02]), cy('x', 0.009, w - 0.08, [0, INT_RBH - 0.06, -0.02]), cy('x', 0.009, w - 0.08, [0, 0.06, -0.02])]), MAT.steel, 'Stalen buisframe van het rugleuningdeel.', { inner: true, ex: [0, 0, -0.02] }),
    intPart('Rugschuim', bx(w - 0.01, INT_RBH - 0.02, 0.065, 0.028, [0, INT_RBH / 2, 0.0]), MAT.intFoam, 'Schuimlaag van het rugleuningdeel.', { inner: true, ex: [0, 0, 0.04] }),
    intPart('Rugbekleding', bx(w, INT_RBH, 0.11, 0.035, [0, INT_RBH / 2, 0.0]), MAT.intCloth, 'Stoffen bekleding van het rugleuningdeel.', { ex: [0, 0, 0.14] }),
    intPart('Rugachterbekleding', bx(w - 0.01, INT_RBH - 0.01, 0.012, 0.005, [0, INT_RBH / 2, -0.062]), MAT.carpet, 'Bekleding aan de bagageruimtezijde van het rugleuningdeel.', { ex: [0, 0, -0.14] }),
    intPart('Rugvergrendeling', bx(0.04, 0.05, 0.03, 0.008, [out * (hw - 0.05), INT_RBH - 0.03, -0.04]), MAT.steel, 'Vergrendeling in de bovenrand die het rugleuningdeel aan de carrosserie vastzet; ontgrendeld met een hendel op de bank of in de bagageruimte.', { ex: [out * 0.06, 0.06, -0.04] }),
    intPart('Scharnierbeugels', merge([bx(0.05, 0.03, 0.06, 0.008, [hw - 0.045, 0.02, -0.04]), bx(0.05, 0.03, 0.06, 0.008, [-hw + 0.045, 0.02, -0.04])]), MAT.darkSteel, 'Beugels waarmee het rugleuningdeel om de onderrand scharniert.', { ex: [0, -0.06, -0.06] }),
  ]);
}
function intRearBench() {
  // zitting en rugleuningen blijven binnen de wand van de achterwielkast (|x| 0,50): de zitting 10 mm (bekleding 0,98 breed, tot |x| 0,49), de rugleuningen 5 mm (tot |x| 0,495); de bekleding stak er tot 10 mm doorheen of lag er precies in (open punt AWK)
  const bx = intBx;
  const cush = A('Zitting achterbank', { d: 'Zitkussen van de achterbank: plaat, schuim en stoffen bekleding, met de gordelsloten.', p: [0, 0, -0.81], ex: [0, 0.06, 0.14] }, [
    intPart('Zitplaat achter', intBx(0.94, 0.012, 0.4, 0.004, [0, 0.414, 0]), MAT.darkSteel, 'Stalen plaat onder het zitschuim.', { inner: true, ex: [0, 0.02, 0] }),
    intPart('Zitschuim achter', bx(0.96, 0.07, 0.42, 0.03, [0, 0.44, 0]), MAT.intFoam, 'Schuimlaag van de achterbankzitting.', { inner: true, ex: [0, 0.04, 0] }),
    intPart('Zitbekleding achter', bx(0.98, 0.1, 0.44, 0.032, [0, 0.45, 0]), MAT.intCloth, 'Stoffen bekleding van de zitting.', { ex: [0, 0.1, 0.04] }),
    ...[[0.33, 'links'], [-0.33, 'rechts']].map(([x, n]) => intPart(`Gordelslot achter ${n}`, merge([bx(0.03, 0.05, 0.04, 0.008, [x, 0.5, -0.2]), bx(0.014, 0.01, 0.02, 0.003, [x, 0.528, -0.2])]), MAT.plastic, 'Gordelslot van de achterbank.', { ex: [0, 0.1, 0] })),
  ]);
  // geen hoofdsteunen achter (de eigenaar bevestigt het, Beslissing INT-1); de deelbare rugleuning staat in de uitrustingslijst van de Twist bij Autowereld (aannemelijk, geen spec)
  return A('Achterbank', { d: 'Achterbank met in delen neerklapbare rugleuning (een derde en twee derde, verdeling geschat) en de gordelsloten voor de twee buitenste zitplaatsen, zonder hoofdsteunen (bevestigd door de eigenaar). De deelbare rugleuning volgt de uitrustingslijst van de Twist (Autowereld); aannemelijk, niet bevestigd.', ex: [0, 0.1, -0.36] }, [
    cush,
    intRearBack(-0.1675, 0.655, 'Rugleuning groot deel', 'Het grote (twee derde) deel van de gedeelde rugleuning; de verdeling en de zijde zijn geschat. Klapt om de onderrand naar voren neer (geschat 104 graden).', 'Rugleuning groot deel (rechts)'),
    intRearBack(0.3325, 0.325, 'Rugleuning klein deel', 'Het kleine (een derde) deel van de gedeelde rugleuning; klapt om de onderrand naar voren neer (geschat 104 graden).', 'Rugleuning klein deel (links)'),
  ]);
}

/* ---------- gordels ---------- */
function intBelts() {
  const out = [];
  const bandGeo = (pts, w) => merge(pts.slice(1).map((p, i) => intStrip(pts[i], p, w, 0.0015)));
  for (const s of [1, -1]) {
    // zB: oprolautomaat onder de gordel (blijft); zG: geleider, hoogteversteller en band op de smallere B-stijl (DAK-4: -0,65 tot -0,564; was zB, -0,66, op de stijl van -0,74)
    const n = sideName(s), zB = -0.66, zG = -0.63,xr = s * (surfX(zB, 0.55) - 0.07), xg = s * (surfX(zG, 1.06) - 0.05), xpil = y => s * (surfX(zG, y) - 0.05);
    // rusttand: de band hangt van de bovenste geleider langs de B-stijl omlaag; de tong zit onderaan
    const restPts = [[xg, 1.06, zG + 0.012], [xpil(0.86), 0.86, zG + 0.016], [xpil(0.66), 0.66, zG + 0.018]], tong = [xpil(0.62), 0.62, zG + 0.02];
    out.push(A(`Gordel voor ${n}`, { d: 'Driepuntsgordel van de voorstoel: oprolautomaat in de B-stijl, hoogteversteller, geleider, band, tong en onderste verankering.', ex: [s * 0.05, 0.12, 0] }, [
      intPart(`Gordelrolautomaat voor ${n}`, intBx(0.05, 0.1, 0.06, 0.01), MAT.plastic, 'Oprolautomaat onderin de B-stijl, onder een kunststof kap.', { p: [xr, 0.55, zB], ex: [s * 0.1, 0, 0] }),
      intPart(`Hoogteversteller voor ${n}`, intBx(0.03, 0.18, 0.012, 0.004), MAT.plasticGrey, 'Geleiderail op de B-stijl waarmee de bovenste gordelgeleider in hoogte wordt versteld.', { p: [xg, 1.0, zG - 0.02], ex: [s * 0.1, 0.1, 0] }),
      intPart(`Gordelgeleider voor ${n}`, G.torus('z', 0.018, 0.004, 14, 6), MAT.steel, 'Geleideoog waar de gordelband doorheen loopt.', { p: [xg, 1.06, zG], ex: [s * 0.1, 0.16, 0] }),
      intPart(`Gordelband voor ${n}`, bandGeo(restPts, 0.046), MAT.intBelt, 'Gordelband in de rusttand: van de bovenste geleider langs de B-stijl omlaag naar het onderste ankerpunt, met de tong onderaan.', { ex: [s * 0.1, 0.1, 0.06] }),
      intPart(`Gordeltong voor ${n}`, intBx(0.03, 0.05, 0.008, 0.003), MAT.steel, 'Metalen tong op de gordelband die in het gordelslot klikt; in de rusttand hangt hij onderaan de stijl.', { p: tong, ex: [0, 0.14, 0.04] }),
    ]));
  }
  [[0.335, 'links'], [-0.335, 'rechts']].forEach(([x, n]) => {
    // geleider op de C-stijl achter de gasveer, ver achter de schuine achterrand van de hoekruit (DAK-4): z -1,45 en y 0,94 (was -1,13 en 1,10, dat ligt nu achter het glas); de oprolautomaat blijft
    // op z -1,13 in de zijbekleding (zR) en de band loopt schuin van de geleider naar voren omlaag, voor de hoedenplank langs
    const s = Math.sign(x), zr = -1.43, zR = -1.13, yG = 0.94, xr = s * (surfX(zR, 0.85) - 0.07), xg = s * (surfX(zr, yG - 0.02) - 0.06);
    // rusttand: de band hangt van de geleider langs de C-stijl omlaag, de tong zit onderaan (de band klapt dus niet met de rugleuning mee)
    const xp = y => s * (surfX(zr, y) - 0.06), xpR = y => s * (surfX(zR, y) - 0.06), restPts = [[s * (surfX(zr - 0.02, yG - 0.02) - 0.12), yG - 0.02, zr - 0.02], [s * (surfX(-1.22, 0.88) - 0.10), 0.88, -1.22], [xpR(0.8), 0.8, zR - 0.03]];   // de band loopt binnen de gasveer langs (bevestiging op z -1,375)
    out.push(A(`Gordel achter ${n}`, { d: 'Driepuntsgordel van de achterbank: oprolautomaat in de zijbekleding, geleider, band en tong; het slot zit in de zitting. De band hangt in rust langs de achterstijl.', ex: [s * 0.04, 0.1, 0] }, [
      intPart(`Gordelrolautomaat achter ${n}`, intBx(0.05, 0.1, 0.07, 0.01), MAT.plastic, 'Oprolautomaat in de zijbekleding achter, boven de wielkast.', { p: [xr, 0.85, zR], ex: [s * 0.1, 0.1, 0] }),
      // de kap staat schuin met de C-stijl mee (golf 8, KAS-2: de stijl helt sinds de bredere gordel meer en de rechte kap stak bovenaan 7 mm door de stijl)
      intPart(`Gordelgeleider achter ${n}`, intBx(0.05, 0.14, 0.09, 0.012), MAT.intSide, 'Kunststof kap op de C-stijl waarin de gordelband omhoog loopt en over de geleider naar beneden gaat.', { p: [s * (surfX(zr - 0.02, yG) - 0.12), yG, zr - 0.02], r: [0, 0, s * Math.atan2(surfX(zr, yG - 0.07) - surfX(zr, yG + 0.07), 0.14)], ex: [s * 0.1, 0.14, 0] }),
      intPart(`Gordelband achter ${n}`, bandGeo(restPts, 0.046), MAT.intBelt, 'Gordelband van de achterbank in de rusttand: van de geleider langs de achterstijl omlaag.', { ex: [s * 0.08, 0.12, 0.05] }),
      intPart(`Gordeltong achter ${n}`, intBx(0.03, 0.05, 0.008, 0.003), MAT.steel, 'Metalen tong die in het gordelslot klikt; in de rusttand hangt hij onderaan de stijl.', { p: [xpR(0.77), 0.77, zR - 0.028], ex: [0, 0.14, 0.04] }),
    ]));
  });
  return A('Veiligheidsgordels', { d: 'Driepuntsgordels met oprolautomaten, geleiders en tongen voor de twee voorstoelen en de twee buitenste plaatsen achter; de gordelsloten zitten in de stoelen en de achterbank.', ex: [0, 0.3, 0] }, out);
}

/* ---------- dashboard ---------- */
// zijprofiel (z, y) van het dashboard; ver naar voren een lage rand onder de voorruit, achterrand en voorvlak naar de bestuurder
const intDashPf = [[0.85, 0.905], [0.74, 0.925], [0.62, 0.925], [0.55, 0.905], [0.505, 0.84], [0.49, 0.76], [0.505, 0.68], [0.53, 0.6], [0.56, 0.52], [0.85, 0.52], [0.85, 0.6]];
// het profiel in twee delen op y 0,70: het snijpunt ligt op het schuine voorvlak tussen (0,49; 0,76) en (0,505; 0,68)
const intDashSplit = 0.70, intDashSplitZ = 0.49 + 0.015 * (0.76 - intDashSplit) / 0.08;
const intDashTopPf = [[0.85, 0.905], [0.74, 0.925], [0.62, 0.925], [0.55, 0.905], [0.505, 0.84], [0.49, 0.76], [intDashSplitZ, intDashSplit], [0.85, intDashSplit]];
const intDashLowPf = [[intDashSplitZ, intDashSplit], [0.505, 0.68], [0.53, 0.6], [0.56, 0.52], [0.85, 0.52], [0.85, intDashSplit]];
const intDashHW = 0.52;      // tot de portierbekleding (binnenkant op 0,549); eerder 0,572 en dus door het portier
// rooster met lamellen op het dashboard: huis en lamellen in een stuk
function intVent(name, d, p, r, w, h, mat = MAT.plasticGrey) {
  const n = Math.max(2, Math.round(h / 0.012));
  return intPart(name, merge([intBx(w, h, 0.02, 0.006), ...Array.from({ length: n }, (_, i) => intBox(w - 0.014, 0.003, 0.012, [0, -h / 2 + 0.01 + (h - 0.02) * (i + 0.5) / n, -0.006]))]), mat, d, { p, r, ex: [0, 0.02, -0.08] });
}
function intDashboard() {
  const bx = intBx, cy = intCy;
  const dashShell = A('Dashboardkap', { d: 'Dashboardkap van zwart kunststof met de kniebeschermer onder de stuurkolom en de zijkappen.', ex: [0, 0.18, 0.3] }, [
    intPart('Dashboardbovenkant', intSideBlock(intDashTopPf, -intDashHW, intDashHW), MAT.intDashTop, 'Dashboardkap, bovenste deel in lichter grijs: zachte bovenkant en voorvlak tot y 0,70; achter de voorruit onder de waterkast.', { ex: [0, 0.1, 0.1] }),
    intPart('Dashboardonderkant', intSideBlock(intDashLowPf, -intDashHW, intDashHW), MAT.intDashLow, 'Dashboardkap, onderste deel in donkerder grijs: voorvlak onder y 0,70 en onderrand tot het schutbord.', { ex: [0, -0.06, 0.04] }),
    intPart('Kniebeschermer', bx(0.36, 0.2, 0.05, 0.015, [0.35, 0.6, 0.5], [-0.3, 0, 0]), MAT.intDashLow, 'Gevoerde plaat onder de stuurkolom die de knieën van de bestuurder beschermt.', { ex: [0, -0.05, -0.14] }),
    ...[1, -1].map(s => intPart(`Dashboardzijkap ${sideName(s)}`, bx(0.02, 0.35, 0.36, 0.006, [s * (intDashHW + 0.01), 0.72, 0.67]), MAT.plastic, 'Zijkap die het uiteinde van het dashboard afsluit tegen de portierstijl.', { ex: [s * 0.1, 0, 0] })),
  ]);
  // instrumenten voor de bestuurder: wijzerplaten kijken schuin naar boven naar de ogen. Volgens de bron (handboek 1.2, Autoweek):
  // snelheidsmeter met kilometer- en dagteller, brandstofmeter, temperatuurmeter en waarschuwingslampjes; geen toerenteller.
  // Het paneel staat 20 mm hoger dan in golf 4, zodat de kolomkap en de kolombuis van het onderstel eronder vrij blijven (B-031).
  const cl = { x: 0.355, y: 0.875, z: 0.545 };
  const dial = (x, y, r) => merge([xf(G.cyl('z', r, r, 0.004, 24), [x, y, -0.031]), xf(G.torus('z', r + 0.0015, 0.0035, 24, 5), [x, y, -0.033])]);
  // schaalstreepjes over een boog van 220 graden rond (x, y)
  const ticks = (x, y, r, n) => Array.from({ length: n }, (_, i) => { const a = -1.92 + i * 3.84 / (n - 1); return xf(G.box(0.003, 0.008, 0.001), [x + r * Math.sin(a), y + r * Math.cos(a), -0.0335], [0, 0, -a]); });
  const needle = (x, y, len, a) => xf(G.box(0.003, len, 0.002), [x - len / 2 * Math.sin(a), y + len / 2 * Math.cos(a), -0.036], [0, 0, a]);
  const SP = [0, 0.003, 0.042], KL = [0.085, 0.003 - 0.025, 0.024];   // snelheidsmeter (x, y, straal) en de kleine meters: x = +-0,085, 25 mm lager dan de snelheidsmeter
  const cluster = A('Instrumentenpaneel', { d: 'Instrumentenpaneel met een grote snelheidsmeter met kilometer- en dagteller in het midden, links de temperatuurmeter en rechts de brandstofmeter (kleiner en lager), daarboven waarschuwingslampjes in rode blokken, onder een diepe kap; geen toerenteller. De plaats van de kleine meters en de lampjes is schematisch (aangenomen).', p: [cl.x, cl.y, cl.z], r: [0.35, 0, 0], ex: [0, 0.05, -0.15] }, [
    intPart('Instrumentenbehuizing', bx(0.3, 0.11, 0.06, 0.012), MAT.plastic, 'Behuizing met printplaat achter het glas.', { ex: [0, 0, 0.06] }),
    intPart('Snelheidsmeter', dial(SP[0], SP[1], SP[2]), MAT.screen, 'Snelheidsmeter met chromen ring, in het midden voor de bestuurder.', { ex: [0, 0, -0.03] }),
    intPart('Kilometer- en dagteller', merge([intBox(0.032, 0.008, 0.001, [0, -0.017, -0.0335]), intBox(0.022, 0.007, 0.001, [0, -0.028, -0.0335])]), MAT.intDial, 'Telwerken in de snelheidsmeter: kilometerteller en daaronder de dagteller.', { ex: [0, -0.02, -0.05] }),
    intPart('Temperatuurmeter', dial(KL[0], KL[1], KL[2]), MAT.screen, 'Koelvloeistoftemperatuurmeter, kleiner en lager links van de snelheidsmeter.', { ex: [0.03, 0, -0.04] }),
    intPart('Brandstofmeter', dial(-KL[0], KL[1], KL[2]), MAT.screen, 'Brandstofmeter, kleiner en lager rechts van de snelheidsmeter.', { ex: [-0.03, 0, -0.04] }),
    intPart('Schaalverdeling', merge([...ticks(SP[0], SP[1], SP[2] - 0.008, 11), ...ticks(KL[0], KL[1], KL[2] - 0.006, 5), ...ticks(-KL[0], KL[1], KL[2] - 0.006, 5)]), MAT.intDial, 'Streepjes van de schaalverdeling op de drie wijzerplaten.', { ex: [0, 0, -0.05] }),
    intPart('Wijzers', merge([needle(SP[0], SP[1], 0.036, 0.9), needle(KL[0], KL[1], 0.02, 0.3), needle(-KL[0], KL[1], 0.02, -0.5)]), MAT.red, 'Wijzers van de snelheidsmeter, de temperatuurmeter en de brandstofmeter.', { ex: [0, 0, -0.08] }),
    intPart('Waarschuwingslampjes', merge([[0.068, 0.041], [0.092, 0.041], [0.116, 0.041], [0.068, 0.027], [0.092, 0.027]].flatMap(([x, y]) => [intBox(0.019, 0.011, 0.002, [x, y, -0.0315]), intBox(0.019, 0.011, 0.002, [-x, y, -0.0315])])), MAT.red, 'Waarschuwingslampjes als rode blokken boven de kleine meters, links en rechts van de snelheidsmeter (welke lampjes en hun plaats schematisch).', { ex: [0, 0.03, -0.06] }),
    intPart('Instrumentenglas', G.box(0.29, 0.1, 0.004), MAT.lensClear, 'Doorzichtig kapglas voor de instrumenten.', { p: [0, 0, -0.037], ex: [0, 0, -0.14] }),
  ]);
  // diepe kap om het paneel: dak en twee zijwangen in het vlak van het paneel (kapframe), 328 mm breed en 80 mm voor het glas uit; het dak ligt 15 mm boven de behuizing.
  // De wangen zijn een zijprofiel dat aan de achterkant het dashboardvlak volgt (op 1 mm ervoor), zodat de kap niet in het dashboardblok zinkt; ze reiken tot 75 mm onder
  // het midden van het paneel. De kolomkap blijft onder de wangen (B-031: 7 mm vrij van het glas). Het paneel staat 15 mm dichter bij het midden dan het stuur: de
  // kap eindigt zo op de zijkant van het dashboard (x 0,52) en niet erin.
  const hoodW = 0.328, hoodT = 0.01, hoodZ0 = -0.037 - 0.003 - 0.08, hoodZ1 = 0.02, hoodTop = 0.07;
  const hoodPf = [[hoodZ0, hoodTop + 0.005], [hoodZ1, hoodTop + 0.005], [hoodZ1, 0.05], [-0.0085, 0.03], [-0.0285, -0.0466], [-0.0235, -0.075], [hoodZ0, -0.075]];
  const hood = intPart('Instrumentenkap', merge([bx(hoodW, hoodT, hoodZ1 - hoodZ0, 0.004, [0, hoodTop, (hoodZ0 + hoodZ1) / 2]),
    ...[1, -1].map(sg => intSideBlock(hoodPf, sg * (hoodW / 2 - hoodT), sg * hoodW / 2))]), MAT.dash,
    'Diepe kap om het instrumentenpaneel tegen reflecties in de voorruit: een dak met twee zijwangen, ongeveer 330 mm breed en 80 mm voor het glas uit.', { p: [cl.x, cl.y, cl.z], r: [0.35, 0, 0], ex: [0, 0.1, 0] });
  // handschoenenkastje: open bak met bodem en wanden; de klep sluit af
  const gk = A('Handschoenenkastje', { d: 'Handschoenenkastje voor de voorpassagier: bak in het dashboard met klep.', ex: [-0.14, -0.02, -0.18] }, [
    intPart('Handschoenenkastbak', merge([intBox(0.32, 0.008, 0.2, [-0.34, 0.545, 0.64]), intBox(0.32, 0.008, 0.2, [-0.34, 0.685, 0.64]), intBox(0.008, 0.14, 0.2, [-0.5, 0.615, 0.64]), intBox(0.008, 0.14, 0.2, [-0.18, 0.615, 0.64]), intBox(0.32, 0.14, 0.008, [-0.34, 0.615, 0.74])]), MAT.plastic, 'Open bak van het handschoenenkastje, in het dashboard weggewerkt achter de klep.', { inner: true, ex: [0, 0, 0.1] }),
    intPart('Handschoenenkastklep', bx(0.34, 0.17, 0.02, 0.008, [-0.34, 0.615, 0.512], [-0.3, 0, 0]), MAT.intDashLow, 'Klep van het handschoenenkastje (in dit model dicht).', { ex: [0, -0.06, -0.12] }),
    intPart('Handschoenenkastslot', bx(0.045, 0.02, 0.012, 0.005, [-0.34, 0.67, 0.5], [-0.3, 0, 0]), MAT.plasticGrey, 'Drukknop van het slot.', { ex: [0, 0.03, -0.1] }),
  ]);
  // de zijroosters zitten onder de hoogte van het instrumentenpaneel; op y 0,84 stond het rooster bij de bestuurder voor de onderhoek van het paneel
  const vents = A('Luchtroosters dashboard', { d: 'Luchtroosters voor de verwarming en de ventilatie: twee aan de zijkanten, en de ontwasemroosters onder de voorruit en bij de zijruiten (de twee roosters in het midden zitten in de middenconsole).', ex: [0, 0.1, 0.1] }, [
    intVent('Rooster zijkant bestuurder', 'Luchtrooster aan de uiterste zijde van het dashboard bij de bestuurder.', [0.475, 0.79, 0.493], [0.19, 0, 0], 0.075, 0.045),
    intVent('Rooster zijkant passagier', 'Luchtrooster aan de uiterste zijde van het dashboard bij de passagier.', [-0.475, 0.79, 0.493], [0.19, 0, 0], 0.075, 0.045),
    intPart('Ontwasemrooster voorruit', merge(Array.from({ length: 9 }, (_, i) => intBox(0.04, 0.003, 0.012, [-0.4 + i * 0.1, 0, 0]))), MAT.plastic, 'Gleuf op de bovenkant van het dashboard die lucht tegen de voorruit blaast.', { p: [0, 0.9255, 0.8], ex: [0, 0.1, 0.0] }),
    intPart('Ontwasemroosters zijruit', merge([1, -1].map(s => intBox(0.07, 0.004, 0.02, [s * 0.48, 0.9235, 0.8]))), MAT.plastic, 'Twee kleine roosters aan de uiteinden van het dashboard die lucht langs de zijruiten blazen.', { ex: [0, 0.08, 0] }),
  ]);
  // kachelhuis (B-041, beslissing INT-12): achter het dashboard tegen het schutbord, onzichtbaar van buiten (inner). De kachelradiateur zit op x -0,17 en -0,125 (y 0,675) tegenover
  // de twee stompen van de doorvoer in het schutbord (systems.js, `Doorvoer kachel`, stompen vanaf z 0,860, in het schutbord); de aanvoerpijpen van de kern lopen door het schutbord naar die stompen.
  const hz = { x0: -0.17, xl: -0.222, x1: 0.09, y0: 0.625, y1: 0.795, zb: 0.66, zs: 0.752, zf: 0.848, t: 0.004 };   // x0 en xl: linkerwand achter en voor de stap; zs: z van de stap
  const wall = (xa, xb, ya, yb, za, zb) => intBox(xb - xa, yb - ya, zb - za, [(xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2]);
  const kachelschaal = intPart('Kachelhuisschaal', merge([
    wall(hz.x0, hz.x1, hz.y0, hz.y1, hz.zb, hz.zb + hz.t),                                     // achterwand
    wall(hz.x1 - hz.t, hz.x1, hz.y0, hz.y1, hz.zb, hz.zf),                                     // rechterwand (bestuurderszijde)
    wall(hz.x0, hz.x0 + hz.t, hz.y0, hz.y1, hz.zb, hz.zs),                                     // linkerwand achter de stap
    wall(hz.xl, hz.x0, hz.y0, hz.y1, hz.zs, hz.zs + hz.t),                                     // stap
    wall(hz.xl, hz.xl + hz.t, hz.y0, hz.y1, hz.zs, hz.zf),                                     // linkerwand van het voorste deel
    wall(hz.x0, hz.x1, hz.y1 - hz.t, hz.y1, hz.zb, hz.zf), wall(hz.xl, hz.x0, hz.y1 - hz.t, hz.y1, hz.zs, hz.zf),   // dak
    wall(hz.x0, hz.x1, hz.y0, hz.y0 + hz.t, hz.zb, hz.zf), wall(hz.xl, hz.x0, hz.y0, hz.y0 + hz.t, hz.zs, hz.zf),   // bodem
  ]), MAT.plastic, 'Holle kunststof schaal van het kachelhuis, open aan de voorkant waar hij achter het dashboardblok tegen het schutbord staat (6 mm ervoor); een stap links zorgt dat hij de bak van het handschoenenkastje niet raakt. Plaats en maten geschat (de bron noemt ze niet).', { inner: true, ex: [0, 0.05, 0] });
  // kachelradiateur: kern met horizontale lamellen tussen twee kopkokers, en twee aansluitpijpen van de kern door het schutbord naar de stompen van de doorvoer
  const rad = { x0: -0.205, x1: -0.095, y0: 0.635, y1: 0.755, z0: 0.795, z1: 0.843 };
  const lam = Array.from({ length: 9 }, (_, i) => wall(rad.x0, rad.x1, rad.y0 + 0.002 + i * 0.0135, rad.y0 + 0.006 + i * 0.0135, rad.z0, rad.z1));
  const kachelkern = intPart('Kachelradiatorkern', merge([wall(rad.x0, rad.x1, rad.y0, rad.y0 + 0.002, rad.z0, rad.z1), wall(rad.x0, rad.x1, rad.y1 - 0.002, rad.y1, rad.z0, rad.z1), ...lam]), MAT.alu, 'Kern van de kachelradiateur: dunne aluminium lamellen (ongeveer 110 x 120 x 50 mm) waar de warme koelvloeistof doorheen stroomt en de lucht van de aanjager langs gaat.', { inner: true, ex: [0, -0.06, -0.06] });
  const kachelkokers = intPart('Kachelradiatorkokers', merge([wall(rad.x0 - 0.01, rad.x0, rad.y0, rad.y1, rad.z0, rad.z1), wall(rad.x1, rad.x1 + 0.01, rad.y0, rad.y1, rad.z0, rad.z1)]), MAT.darkSteel, 'Twee kopkokers aan de uiteinden van de kern die de vloeistof verdelen over de buisjes.', { inner: true, ex: [0, -0.06, -0.06] });
  const kachelpijpen = intPart('Kachelradiatoraansluitingen', merge([-0.17, -0.125].map(x => rodBetween([x, 0.675, rad.z1], [x, 0.675, 0.860], 0.0085, 10))), MAT.alu, 'Twee aansluitpijpen van de kachelradiateur (aanvoer en retour); ze lopen tot in het schutbord en sluiten daar op de stompen van de doorvoer, waar de kachelslangen op komen. Niet inner: in de uitgeklapte stand liggen ze vrij.', { ex: [0, 0, 0.05] });
  // aanjager: radiaal waaierrad (schoepen tussen twee ringen) met een elektromotor erachter; het wiel zuigt langs de kern in het midden van het huis
  const ab = { x: 0.03, y: 0.71, z0: 0.72, z1: 0.775, r: 0.045 };
  const schoepen = Array.from({ length: 12 }, (_, i) => { const a = i / 12 * 2 * PI; return xf(G.box(0.003, 0.016, ab.z1 - ab.z0), [ab.x + (ab.r - 0.008) * Math.sin(a), ab.y + (ab.r - 0.008) * Math.cos(a), (ab.z0 + ab.z1) / 2], [0, 0, -a]); });
  const aanjagerwiel = intPart('Aanjagerwiel', merge([xf(G.cyl('z', ab.r, ab.r, 0.003, 16), [ab.x, ab.y, ab.z0 + 0.0015]), xf(G.torus('z', ab.r - 0.008, 0.004, 16, 3), [ab.x, ab.y, ab.z1 - 0.004]), ...schoepen]), MAT.plasticGrey, 'Radiaal waaierrad van de kachelaanjager: 12 schoepen tussen een achterplaat en een ring; perst de lucht door de kern.', { inner: true, ex: [0.04, -0.04, -0.06] });
  const aanjagermotor = intPart('Aanjagermotor', merge([intCy('z', 0.024, ab.z0 - hz.zb - 0.01, [ab.x, ab.y, (hz.zb + 0.01 + ab.z0) / 2], 12), intBx(0.07, 0.012, 0.008, 0.003, [ab.x, ab.y, hz.zb + 0.006])]), MAT.darkSteel, 'Elektromotor van de aanjager, met een bevestigingsplaat tegen de achterwand van het kachelhuis; de ventilatorstand van de kachelbediening schakelt hem.', { inner: true, ex: [0.04, -0.04, -0.12] });
  const kachelhuis = A('Kachelhuis', { d: 'Kachelhuis met kachelradiateur en aanjager, achter het dashboard tegen het schutbord. De kachelslangen van de motor lopen naar de stompen van de doorvoer; daarachter geven de pijpen de warme vloeistof aan de kern. De aanjager blaast lucht langs de kern naar de roosters en de ontwasemroosters. Plaats en maten geschat (de bron noemt ze niet).', ex: [0, -0.16, -0.18] }, [kachelschaal, kachelkern, kachelkokers, kachelpijpen, aanjagerwiel, aanjagermotor]);
  const spk = intPart('Luidsprekerroosters', merge([1, -1].map(s => bx(0.1, 0.004, 0.06, 0.002, [s * 0.46, 0.9255, 0.7]))), MAT.plastic, 'Twee roosters boven de luidsprekers, links en rechts in de bovenkant van het dashboard (luidsprekers en plaats aangenomen).', { ex: [0, 0.14, 0.1] });
  const rel = A('Dashboardbediening', { d: 'Schakelaars en ontgrendelingen onder het dashboard bij de bestuurder: zekeringkast, kapontgrendeling.', ex: [0.1, -0.1, -0.2] }, [
    // op het voorvlak van de kniebeschermer (lokaal 105 mm naar buiten, 30 mm omhoog, 0,5 mm voor het vlak); lag 25 mm diep in de kniebeschermer (B-043)
    intPart('Zekeringkastklep', bx(0.1, 0.07, 0.01, 0.004, [0.455, 0.6197, 0.462], [-0.3, 0, 0]), MAT.plasticGrey, 'Klepje in de kniebeschermer onder het dashboard waarachter de zekeringen zitten (plaats aangenomen).', { ex: [0.04, -0.04, -0.06] }),
    intPart('Motorkapontgrendeling', merge([bx(0.035, 0.012, 0.05, 0.004, [0.5, 0.58, 0.51]), rodBetween([0.5, 0.58, 0.535], [0.5, 0.58, 0.8], 0.002, 4)]), MAT.plasticGrey, 'Trekgreep onder het dashboard die de motorkap via een kabel ontgrendelt.', { ex: [0.04, -0.04, -0.06] }),
  ]);
  return A('Dashboard', { d: 'Dashboard met instrumentenpaneel, luchtroosters, handschoenenkastje, kachelhuis (verborgen achter het dashboard) en luidsprekerroosters (aangenomen); kappen en bedieningspanelen rond de stuurkolom.', spec: [['Instrumenten', 'snelheidsmeter met kilometer- en dagteller, brandstofmeter, temperatuurmeter, waarschuwingslampjes; geen toerenteller']], ex: [0, 0.2, 0.55] }, [dashShell, cluster, hood, gk, vents, spk, rel, kachelhuis]);
}

/* ---------- stuurwiel met kolomkap ---------- */
// Frame met het midden van de naaf in de oorsprong en +z naar de bestuurder; de kolom loopt langs -z. De kolom zelf (met de
// stuurinrichting) is van het onderstel en sluit aan op INT_PORTS.stuurkolom.
// stand van het stuurwiel: +z naar de bestuurder (tegen de kolomrichting in), +y omhoog, +x naar rechts van de bestuurder
function intWheelQ(dir) {
  const z = dir.clone().multiplyScalar(-1).normalize(), x = V3(-1, 0, 0), y = z.clone().cross(x).normalize();
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
}
// platte spaak van de naaf naar de krans in het vlak van het stuurwiel; uur is de plaats op de klok vanuit de bestuurder gezien (4 uur is rechtsonder)
const INT_SPOKES = [4, 6, 8];
function intSpoke(uur) {
  const hoek = (uur % 12) / 12 * 2 * PI, dx = Math.sin(hoek), dy = Math.cos(hoek), r0 = 0.07, r1 = 0.168;
  return xf(G.rbox(0.055, r1 - r0, 0.018, 0.007), [dx * (r0 + r1) / 2, dy * (r0 + r1) / 2, 0], [0, 0, Math.atan2(-dx, dy)]);
}
// Ovaal kussen: afgeplatte ellips (breedte w, hoogte h, voordiepte df) met een vlakke bolling voor en een ondiepe achterkant (8 mm); de pool van de bol ligt op de stuuras.
// De normalen volgen uit de afgeleide van de afbeelding (n ~ J^-T s), zodat de naad van de bol glad blijft.
function intPillow(w, h, df, seg = 20, ring = 10, db = 0.008, e = 0.6) {
  const g = new THREE.SphereGeometry(1, seg, ring), pos = g.attributes.position, nor = g.attributes.normal;
  for (let i = 0; i < pos.count; i++) {
    const sx = pos.getX(i), sy = pos.getY(i), sz = pos.getZ(i), a = Math.abs(sy), dd = sy >= 0 ? df : db;
    pos.setXYZ(i, sx * w / 2, sz * h / 2, Math.sign(sy) * Math.pow(a, e) * dd);
    const nz = a < 1e-6 ? 0 : Math.sign(sy) * Math.pow(a, 2 - e) / (dd * e);
    const n = V3(sx / (w / 2), sz / (h / 2), nz).normalize();
    nor.setXYZ(i, n.x, n.y, n.z);
  }
  pos.needsUpdate = true; nor.needsUpdate = true;
  return g;
}
const INT_PAD = [0.17, 0.108, 0.04, -0.012];   // breedte, hoogte, voordiepte en hoogteverschuiving (m) van het claxonkussen in het stuurframe
function intSteering() {
  const dir = V3(...INT_COLDIR), bx = intBx, cy = intCy;
  return A('Stuurwiel met kolomkap', { d: 'Driespaaks stuurwiel met een groot ovaal kussen op de naaf, platte brede spaken en schakelaars, en de kunststof kap rond de stuurkolom tot het dashboard. De stuurkolom zelf hoort bij het onderstel en draagt het stuurwiel op de naaf. Geen airbag.',
    spec: [['Stuur', 'driespaaks, zonder airbag']], p: INT_WHEEL, q: intWheelQ(dir), ex: [0, 0.18, -0.35] }, [
    intPart('Stuurwielkrans', G.torus('z', 0.17, 0.0135, 36, 8), MAT.plastic, 'Rubber kunststof stuurkrans met een doorsnede van 36 cm (maat geschat); geen stuurbekrachtiging.', { ex: [0, 0, -0.1] }),
    intPart('Stuurwielspaken', merge(INT_SPOKES.map(a => intSpoke(a))), MAT.plastic, 'Drie platte, brede spaken (ongeveer 55 mm) van de naaf naar de krans, naar 4, 6 en 8 uur (Beslissing INT-7); met leer of kunststof bekleed.', { ex: [0, 0, -0.06] }),
    intPart('Claxonkussen', intPillow(INT_PAD[0], INT_PAD[1], INT_PAD[2]), MAT.plastic, 'Groot ovaal kussen van de naaf (ongeveer 170 x 108 mm en 40 mm diep, een afgeplatte ellips zoals op de foto) met het claxonpad; geen airbag. Het kussen is laag genoeg om de onderste helft van de kleine meters vrij te laten.', { p: [0, INT_PAD[3], 0.012], ex: [0, 0, -0.14] }),
    intPart('Stuurwielnaaf', cy('z', 0.05, 0.04, [0, 0, 0.0], 20), MAT.plastic, 'Naaf waarop de spaken en het kussen zitten; de naaf zit met een gekartelde as op de stuurkolom.', { ex: [0, 0, -0.1] }),
    // taps: straal 48 mm bij het stuur, 32 mm bij het dashboard, zodat de kap onder het instrumentenglas blijft (B-031) en de kolombuis (straal 27,5 mm) omsluit
    intPart('Kolomkap boven', xf(G.cyl('z', 0.048, 0.032, 0.14, 16), [0, 0, -0.1]), MAT.plastic, 'Bovenste helft van de kap om de stuurkolom, tot het dashboard; loopt taps toe onder het instrumentenpaneel.', { ex: [0, 0.06, 0] }),
    intPart('Kolomkap onder', bx(0.1, 0.05, 0.14, 0.015, [0, -0.04, -0.1]), MAT.plastic, 'Onderste helft van de kap om de stuurkolom met het contactslot.', { ex: [0, -0.06, 0] }),
    intPart('Combischakelaar links', merge([rodBetween([-0.04, 0.0, -0.05], [-0.14, 0.01, -0.03], 0.007, 8), bx(0.03, 0.024, 0.024, 0.008, [-0.15, 0.012, -0.03])]), MAT.plasticGrey, 'Hendel links van de kolom voor de richtingaanwijzers en de verlichting.', { ex: [-0.08, 0, 0] }),
    intPart('Combischakelaar rechts', merge([rodBetween([0.04, 0.0, -0.05], [0.14, 0.01, -0.03], 0.007, 8), bx(0.03, 0.024, 0.024, 0.008, [0.15, 0.012, -0.03])]), MAT.plasticGrey, 'Hendel rechts van de kolom voor de voor- en achterruitwissers.', { ex: [0.08, 0, 0] }),
    intPart('Contactslot', merge([cy('z', 0.015, 0.02, [0.048, -0.04, -0.045], 12), bx(0.006, 0.014, 0.008, 0.002, [0.048, -0.04, -0.056])]), MAT.chrome, 'Contactslot met sleutel rechts op de kolomkap.', { ex: [0.04, -0.04, 0] }),
  ]);
}

/* ---------- pedalen ---------- */
// Linksgestuurd: koppeling links (|x| groot), rem in de lijn van de stuurkolom, gas rechts; alles aan de schutbordzijde (z 0,85).
function intPedals() {
  const bx = intBx;
  const padAt = (x, y, z, w, h, tilt) => bx(w, h, 0.016, 0.006, [x, y, z], [tilt, 0, 0]);
  return A('Pedalen', { d: 'Gaspedaal, rempedaal en koppelingspedaal met de pedaalbok onder het dashboard, plus een voetsteun. De duwstang van de rembekrachtiger, de gaskabel en de koppelingskabel lopen van de pedaalarmen door het schutbord.', ex: [0.12, -0.1, 0.38] }, [
    intPart('Pedaalbok', merge([bx(0.34, 0.1, 0.02, 0.006, [0.36, 0.62, 0.835]), intBox(0.02, 0.1, 0.08, [0.2, 0.62, 0.8]), intBox(0.02, 0.1, 0.08, [0.52, 0.62, 0.8]), intAxisX(0.37, 0.6, 0.8, 0.34)]), MAT.darkSteel, 'Steun aan het schutbord waarin het rem- en het koppelingspedaal scharnieren.', { ex: [0, 0.1, 0.08] }),
    intPart('Rempedaalarm', rodBetween([0.37, 0.6, 0.8], [0.37, 0.4, 0.745], 0.009, 8), MAT.steel, 'Pedaalarm die via de duwstang door het schutbord de rembekrachtiger bedient.', { ex: [0.04, 0, 0.04] }),
    intPart('Rempedaalrubber', padAt(0.37, 0.375, 0.738, 0.09, 0.07, -0.28), MAT.rubber, 'Rubber pad van het rempedaal.', { ex: [0.04, 0, -0.06] }),
    intPart('Koppelingspedaalarm', rodBetween([0.47, 0.6, 0.8], [0.47, 0.4, 0.745], 0.009, 8), MAT.steel, 'Pedaalarm van de koppeling; de koppelingskabel loopt door het schutbord naar de koppelingsarm op de bak.', { ex: [0.1, 0, 0.04] }),
    intPart('Koppelingspedaalrubber', padAt(0.47, 0.375, 0.738, 0.08, 0.07, -0.28), MAT.rubber, 'Rubber pad van het koppelingspedaal.', { ex: [0.1, 0, -0.06] }),
    intPart('Gaspedaalarm', merge([rodBetween([0.255, 0.31, 0.72], [0.255, 0.43, 0.8], 0.008, 8), rodBetween([0.255, 0.43, 0.8], [0.255, 0.43, 0.84], 0.004, 6)]), MAT.steel, 'Arm van het gaspedaal, scharnierend op de vloer; de gaskabel gaat door het schutbord.', { ex: [-0.04, 0, 0.04] }),
    intPart('Gaspedaalrubber', bx(0.06, 0.016, 0.18, 0.006, [0.255, 0.395, 0.775], [0.9, 0, 0]), MAT.rubber, 'Gaspedaal met rubber pad, schuin vooruit omhoog.', { ex: [-0.06, 0, -0.06] }),
    intPart('Remlichtschakelaar', xf(G.cyl('z', 0.012, 0.012, 0.04, 8), [0.37, 0.67, 0.81]), MAT.plasticGrey, 'Schakelaar op de pedaalbok boven de pedaalarm die de remlichten inschakelt; zit binnen het dashboard.', { inner: true, ex: [0, 0.06, 0] }),
    intPart('Voetsteun', bx(0.05, 0.17, 0.02, 0.006, [0.53, 0.33, 0.77], [-0.7, 0, 0]), MAT.satin, 'Steun voor de linkervoet.', { ex: [0.08, 0, -0.04] }),
  ]);
}
// cilinder langs x tussen x0 en x0+len op (y, z): as van de pedalen
function intAxisX(x0, y, z, len) { return xf(G.cyl('x', 0.007, 0.007, len, 8), [x0, y, z]); }

/* ---------- middenconsole ---------- */
function intConsole() {
  const bx = intBx, cy = intCy;
  const tunnel = intPart('Tunnelconsole', intSideBlock([[0.54, 0.275], [0.54, 0.52], [0.5, 0.46], [0.32, 0.44], [0.12, 0.42], [-0.1, 0.4], [-0.24, 0.385], [-0.27, 0.275]], -0.1, 0.1), MAT.intDashLow, 'Console over de middentunnel van het dashboard tot achter de handrem; ze bergt de schakelmechaniek, de handremkabels en de uitlaat in de tunnel.', { ex: [0, 0.12, 0.05] });
  // middenstapel van boven naar onder (foto van de eigenaar): twee roosters in een rand (y 0,815), de kachelbediening (y 0,73), een bakje (y 0,667),
  // de radio (y 0,60) en onder de radio de aansteker en de asbak (y 0,545). Alles op het voorvlak van de stapel (z 0,455); het kachelpaneel staat 6 mm
  // voor dat vlak, de rand van de roosters 12 mm, zodat de roosters 3 mm achter de rand liggen.
  const ZF = 0.455;
  const stack = intPart('Middenstapel', bx(0.27, 0.345, 0.1, 0.012, [0, 0.6875, 0.505]), MAT.dash, 'Middenpaneel in het dashboard: boven twee ventilatieroosters, daaronder de kachelbediening en een bakje, onderaan de radio (aannemelijk).', { ex: [0, 0.04, -0.16] });
  const grilles = A('Ventilatieroosters midden', { d: 'Twee verstelbare luchtroosters naast elkaar in een gezamenlijke rand, boven in de middenstapel.', ex: [0, 0.06, -0.12] }, [
    intPart('Roosterrand', merge([[0.262, 0.01, 0, 0.035], [0.262, 0.01, 0, -0.035], [0.011, 0.08, 0.1255, 0], [0.011, 0.08, -0.1255, 0], [0.02, 0.08, 0, 0]].map(([w, h, x, y]) => intBox(w, h, 0.015, [x, 0.815 + y, ZF + 0.002]))), MAT.dash, 'Gezamenlijke rand om de twee ventilatieroosters in het midden van het dashboard.', { ex: [0, 0.02, -0.06] }),
    intVent('Rooster midden bestuurder', 'Verstelbaar luchtrooster met horizontale lamellen links in het midden van het dashboard (ongeveer 110 x 60 mm).', [0.065, 0.815, ZF + 0.009], [0, 0, 0], 0.11, 0.06, MAT.plastic),
    intVent('Rooster midden passagier', 'Verstelbaar luchtrooster met horizontale lamellen rechts in het midden van het dashboard (ongeveer 110 x 60 mm).', [-0.065, 0.815, ZF + 0.009], [0, 0, 0], 0.11, 0.06, MAT.plastic),
  ]);
  const heater = A('Kachelbediening', { d: 'Bediening van de verwarming en ventilatie: een draaiknop (70 mm) voor de luchtverdeling, twee liggende schuiven voor temperatuur en luchtbron, een A/C-knop, een knop voor de achterruitverwarming en de ventilatorknop.', ex: [0, -0.05, -0.18] }, [
    intPart('Kachelpaneel', bx(0.25, 0.092, 0.012, 0.005, [0, 0.73, ZF]), MAT.dash, 'Paneel met de bediening van de kachel.', { ex: [0, 0, -0.03] }),
    intPart('Kachelknop', merge([cy('z', 0.035, 0.008, [0.06, 0.73, ZF - 0.008], 24), cy('z', 0.027, 0.012, [0.06, 0.73, ZF - 0.015], 20), intBx(0.05, 0.012, 0.012, 0.004, [0.045, 0.73, ZF - 0.024])]), MAT.satin, 'Grote draaiknop (70 mm) in een ronde rand voor de luchtverdeling, met een hendel als wijzer.', { ex: [0, 0, -0.08] }),
    intPart('Kachelschuifsleuven', merge([0.752, 0.726].map(y => intBox(0.095, 0.014, 0.002, [-0.065, y, ZF - 0.0055]))), MAT.blackGloss, 'Twee liggende sleuven waarin de schuiven lopen.', { ex: [0, 0, -0.04] }),
    intPart('Kachelschuiven', merge([[-0.088, 0.752], [-0.05, 0.726]].map(([x, y]) => bx(0.016, 0.017, 0.012, 0.003, [x, y, ZF - 0.012]))), MAT.satin, 'Twee liggende schuiven: de bovenste voor de luchtbron (buiten of binnen), de onderste voor de temperatuur.', { ex: [0, 0, -0.07] }),
    intPart('A/C-knop', bx(0.03, 0.018, 0.01, 0.004, [-0.098, 0.700, ZF - 0.0085]), MAT.plasticGrey, 'Drukknop voor de airconditioning (A/C).', { ex: [-0.02, -0.02, -0.08] }),
    intPart('Ventilatorknop', cy('z', 0.015, 0.016, [-0.04, 0.700, ZF - 0.012], 18), MAT.satin, 'Draaiknop voor de ventilatorstand.', { ex: [0.02, -0.02, -0.08] }),
    intPart('Achterruitverwarmingsknop', bx(0.018, 0.014, 0.01, 0.003, [-0.07, 0.700, ZF - 0.0085]), MAT.plasticGrey, 'Drukknop voor de achterruitverwarming.', { ex: [0, -0.04, -0.08] }),
  ]);
  const tray = A('Consolebakje', { d: 'Open bakje voor kleine spullen onder de kachelbediening, in de middenstapel.', ex: [0, -0.04, -0.12] }, [
    intPart('Bakjerand', merge([bx(0.22, 0.006, 0.022, 0.002, [0, 0.65, ZF - 0.011]), bx(0.006, 0.042, 0.022, 0.002, [0.107, 0.667, ZF - 0.011]), bx(0.006, 0.042, 0.022, 0.002, [-0.107, 0.667, ZF - 0.011])]), MAT.dash, 'Bodem en zijwanden van het bakje, voor het voorvlak van de middenstapel.', { ex: [0, -0.02, -0.06] }),
    intPart('Bakjeachterwand', intBox(0.208, 0.03, 0.002, [0, 0.667, ZF - 0.0015]), MAT.blackGloss, 'Donkere achterwand van het bakje.', { ex: [0, 0, -0.03] }),
  ]);
  const radio = A('Radio', { d: 'Radio onderaan de middenstapel. Autowereld noemt een audiopakket in de uitrusting van de Twist (aannemelijk); uitvoering en bediening schematisch.', ex: [0, 0.1, -0.22] }, [
    intPart('Radiobehuizing', bx(0.18, 0.05, 0.18, 0.006, [0, 0.60, 0.56]), MAT.darkSteel, 'Metalen behuizing van de radio in het dashboard, achter het voorpaneel.', { inner: true, ex: [0, 0, 0.1] }),
    intPart('Radiopaneel', bx(0.225, 0.05, 0.012, 0.005, [0, 0.60, ZF + 0.003]), MAT.blackGloss, 'Zwart voorpaneel van de radio.', { ex: [0, 0, -0.04] }),
    intPart('Radioknoppen', merge([cy('z', 0.012, 0.016, [0.092, 0.60, ZF - 0.005], 14), cy('z', 0.012, 0.016, [-0.092, 0.60, ZF - 0.005], 14)]), MAT.chrome, 'Draaiknoppen voor volume en afstemming.', { ex: [0, 0, -0.08] }),
    intPart('Radiodisplay', intBox(0.07, 0.02, 0.003, [0, 0.605, ZF - 0.0035]), MAT.screen, 'Display met de zenderfrequentie.', { ex: [0, 0.02, -0.06] }),
  ]);
  const small = A('Consolevoorkant', { d: 'Sigarettenaansteker en asbak onder de radio in de middenstapel.', ex: [0, 0, -0.14] }, [
    intPart('Sigarettenaansteker', merge([cy('z', 0.012, 0.02, [0.05, 0.545, ZF - 0.004], 12), cy('z', 0.016, 0.004, [0.05, 0.545, ZF - 0.0], 12)]), MAT.satin, 'Sigarettenaansteker onder de radio.', { ex: [0, 0, -0.06] }),
    intPart('Asbak', bx(0.075, 0.028, 0.012, 0.004, [-0.05, 0.545, ZF - 0.0]), MAT.dash, 'Asbak onder de radio (klepje).', { ex: [0, 0, -0.06] }),
  ]);
  // pook met hoes: de schakelstang van de bak (DRV_PORTS.shiftIn) sluit onder de tunnel aan op INT_PORTS.pookvoet
  const gx = INT_PORTS.pookvoet;
  const shifter = A('Pook met hoes', { d: 'Pook van de handgeschakelde vijfbak met rubber hoes in de console; de schakelstang naar de bak sluit onder de console aan op de voet van de pook.', p: [gx[0], gx[1], gx[2]], ex: [0, 0.2, 0] }, [
    intPart('Pookhoes', G.lathe('y', [[0.075, 0], [0.07, 0.012], [0.05, 0.035], [0.028, 0.06], [0.016, 0.075], [0.014, 0.08]], 20, 'intPookhoes'), MAT.rubber, 'Rubber hoes rond het onderste deel van de pook, afgedicht op de console.', { ex: [0, 0.03, 0] }),
    intPart('Pookstang', cy('y', 0.0075, 0.19, [0, 0.17, 0], 10), MAT.steel, 'Stalen pookstang die door de hoes naar de schakelmechaniek loopt.', { ex: [0, 0.06, 0] }),
    intPart('Pookknop', merge([G.sphere(0.026, 16), xf(G.box(0.002, 0.002, 0.002), [0, 0, 0])]), MAT.plastic, 'Zwarte pookknop met het schakelschema (schematisch).', { p: [0, 0.285, 0], ex: [0, 0.12, 0] }),
  ]);
  // handrem: hendel met knop en hoes naast de pook, op de console tussen de voorstoelen. De oorsprong van de groep is het scharnier
  // (INT_PORTS.handremhendel); de korte kabelarm wijst omlaag naar het aansluitpunt van de kabel (INT_PORTS.handremkabel). Trekken
  // aan de grip draait de hendel om x en trekt de kabelarm naar achter.
  const hx = INT_PORTS.handremhendel, hk = INT_PORTS.handremkabel;
  const hb = A('Handremhendel met hoes', { d: 'Handremhendel naast de pook, op de console tussen de voorstoelen. De hendel scharniert in de console boven de tunnel; de handremkabel loopt van daar onder de vloer naar de achterwielen.', p: [hx[0], hx[1], hx[2]], ex: [0.06, 0.12, -0.06] }, [
    intPart('Handremhendel', merge([rodBetween([0, 0, 0], [0, 0.16, -0.224], 0.008, 8), bx(0.032, 0.03, 0.1, 0.012, [0, 0.18, -0.254], [0.3, 0, 0])]), MAT.plastic, 'Hendel met grip die de handrem aantrekt; ratelt vast met een pal.', { ex: [0, 0.08, -0.04] }),
    intPart('Handremknop', bx(0.014, 0.012, 0.02, 0.004, [0, 0.2, -0.299], [0.3, 0, 0]), MAT.plasticGrey, 'Drukknop in de grip om de handrem te ontgrendelen.', { ex: [0, 0.1, -0.06] }),
    intPart('Handremhoes', bx(0.07, 0.01, 0.18, 0.004, [0, 0.068, -0.144]), MAT.rubber, 'Rubber hoes over de gleuf waar de handremhendel door de console steekt.', { ex: [0, 0.03, 0] }),
    intPart('Handremscharnier', merge([cy('x', 0.008, 0.04, [0, 0, 0], 10), intBox(0.004, 0.05, 0.06, [-0.012, -0.005, 0.01]), rodBetween([0, 0, 0], [hk[0] - hx[0], hk[1] - hx[1], hk[2] - hx[2]], 0.005, 6)]), MAT.darkSteel, 'Scharnierpen met palsegment en de korte kabelarm waaraan de handremkabel trekt; zit in de console.', { inner: true, ex: [0, -0.06, 0.04] }),
  ]);
  return A('Middenconsole', { d: 'Console over de tunnel met de middenstapel (van boven naar onder: twee ventilatieroosters, kachelbediening, een bakje en de radio, aannemelijk), pook met hoes en handrem.', ex: [0, 0.3, 0.1] }, [tunnel, stack, grilles, heater, tray, radio, small, shifter, hb]);
}

/* ---------- bekleding: hemel, stijlen, vloer, zijwanden, bagageruimte ---------- */
const intHemD = 0.034;     // de hemel hangt 3,4 cm onder het dakvlak
// binnenvlak aan zijde s op (z, y): halve breedte van de buitenhuid min de dikte van de bekleding
const intWall = (s, d) => (z, y) => [s * (surfX(z, y) - d), y, z];
// paneel langs de zijwand tussen z0 en z1 en tussen de hoogten lo(z) en hi(z)
const intPanel = (s, z0, z1, lo, hi, d, nu = 24, nv = 6) => patch((z, v) => intWall(s, d)(z, v), z0, z1, nu, z => [lo(z), hi(z)], nv);
function intTrim() {
  const bx = intBx, cy = intCy;
  const linP = (z, w) => { const p = ghPt(z, w); return [p[0] * 0.965, p[1] - intHemD, p[2]]; };
  const hemel = patch(linP, 0.2, -1.165, 36, () => [0.31, 0.69], 10);
  const hl = (z, ax) => intRoofY(z, ax / 0.965) - (intHemD - 0.02), slope = (z, ax) => (hl(z + 0.05, ax) - hl(z - 0.05, ax)) / 0.1;
  const hx = z => Math.abs(ghPt(z, 0.34)[0]) - 0.07;   // net binnen de dakrand
  const handle = (s, z, n) => intPart(`Dakgreep ${n} ${sideName(s)}`, merge([bx(0.022, 0.024, 0.15, 0.008), bx(0.03, 0.03, 0.025, 0.006, [0, 0.01, 0.075]), bx(0.03, 0.03, 0.025, 0.006, [0, 0.01, -0.075])]), MAT.plasticGrey, n === 'voor' ? 'Handgreep boven het portier met klapscharnier.' : 'Handgreep boven de hoekruit voor de achterpassagier, met klapscharnier.', { p: [s * hx(z), hl(z, hx(z)) - 0.021, z], r: [-slope(z, hx(z)), 0, 0], ex: [s * 0.1, -0.08, 0] });
  // zonneklep: paneel langs de bovenrand van de voorruit; alleen die van de passagier heeft een make-upspiegel (aangenomen)
  const visor = s => { const zc = 0.3, vx = s * 0.36, vy = hl(zc, 0.36) - 0.0085, rx = -slope(zc, 0.36), rz = s * (hl(zc, 0.46) - hl(zc, 0.26)) / 0.2;
    const paneel = merge([bx(0.4, 0.012, 0.17, 0.006), xf(G.cyl('x', 0.005, 0.005, 0.32, 8), [0, 0, 0.081])]), at = { p: [vx, vy, zc], r: [rx, 0, rz] };
    // de klep van de bestuurder is zonder spiegel een los onderdeel (een groep met één onderdeel geeft een waarschuwing van integrity.py)
    if (s > 0) return intPart(`Zonneklep ${sideName(s)}`, paneel, MAT.intHead, 'Zonneklep van de bestuurder: gevoerd paneel zonder spiegel (aangenomen) met de draaias langs de dakrand, schuin langs de bovenrand van de voorruit; in dit model opgeklapt.', Object.assign({ ex: [0, 0.3, 0.1] }, at));
    return A(`Zonneklep ${sideName(s)}`, Object.assign({ d: 'Zonneklep van de passagier: gevoerd paneel met make-upspiegel (aangenomen), schuin langs de bovenrand van de voorruit; in dit model opgeklapt.', ex: [0, 0.3, 0.1] }, at), [
      intPart('Zonnekleppaneel', paneel, MAT.intHead, 'Gevoerd paneel van de zonneklep met de draaias langs de dakrand.', { ex: [0, 0.06, 0] }),
      intPart('Make-upspiegel', bx(0.14, 0.002, 0.07, 0.001, [0, -0.007, 0]), MAT.reflector, 'Spiegel in de zonneklep van de passagier.', { ex: [0, -0.06, 0] }),
    ]); };
  const roofLamp = (z) => { const y = intRoofY(z, 0) - 0.016, tilt = -(intRoofY(z + 0.05, 0) - intRoofY(z - 0.05, 0)) / 0.1; return { y, tilt }; };
  const lp = roofLamp(-0.3);
  const pil = (s, z, q, dy) => { const h = bodGhHalf(z, q); return [s * (h[0] - 0.036), h[1] - 0.028 + dy, z]; };
  // A-stijl: de buis ligt boven de bovenrand van de zijruit, 45 mm binnen de bovenrand van de zijwand (xe) en 12 mm onder die rand (ye). Tot golf 9 hing hij op een vaste q in
  // de dakrand (0,6 tot 0,62); met de kleinere dakrand van pakket DAK (straal 0,02, DAK-3) kwam die q 20 mm lager en raakte de buis het rubber van de zijruit (3,5 mm).
  const pilA = (s, z) => { const g = bodGh(z); return [s * (g.xe - 0.045), g.ye - 0.012, z]; };
  const aPillar = s => intPart(`A-stijlbekleding ${sideName(s)}`, tube([0.82, 0.68, 0.54, 0.40].map(z => pilA(s, z)), 0.016, 30, 6), MAT.intSide, 'Smalle stijlbekleding langs de A-stijl.', { ex: [s * 0.1, 0.06, 0.04] });
  // B-stijl: tussen de portierruit en de hoekruit (z -0.585 tot bodKpZF, -0,65; was -0,74 tot golf 9, pakket DAK-4: de hoekruit begint verder naar voren), van de dorpel tot de dakrand; achter de portierrand
  const topAt = z => bodGh(z).ye - 0.05;
  const bPillar = s => intPart(`B-stijlbekleding ${sideName(s)}`, intPanel(s, -0.585, bodKpZF, () => 0.285, z => bodGh(z).ye - 0.04, 0.035, 4, 12), MAT.intSide, 'Kunststof bekleding van de brede B-stijl achter het portier, met de bevestiging van de voorgordel.', { ex: [s * 0.08, 0.04, -0.04] });
  // zijbekleding achter: onder de hoekruit, tussen B-stijl en C-stijl (DAK-4: van bodKpZF tot bodKpZB, -0,65 tot -1,37; was -0,74 tot -1,17); boven de wielkast met de gordelrolautomaat
  const sideRear = s => intPart(`Zijbekleding achter ${sideName(s)}`, intPanel(s, bodKpZF, bodKpZB, z => 0.3 + 0.3 * clamp((-0.93 - z) / 0.1, 0, 1), z => YT(z) - 0.03, 0.035, 28, 6), MAT.intSide, 'Kunststof zijbekleding onder de hoekruit bij de achterbank, tot de achterklep.', { ex: [s * 0.1, 0, -0.04] });
  const sideFront = s => intPart(`Zijbekleding achterbank ${sideName(s)}`, intPanel(s, -0.585, -0.74, () => 0.285, () => 0.55, 0.036, 4, 4), MAT.intSide, 'Onderste deel van de bekleding naast de achterbank.', { ex: [s * 0.1, 0, 0] });
  // de gasveerbevestiging (z -1,40 tot -1,36, y 0,93 tot 0,98) zit achter de bekleding: die ligt 4 cm van de huid, daar 9,5 cm (DAK-4: tot z -1,50, daar zit de geleider van de gordel achter op). Aan de tankzijde (bodTkS, links) wijkt ze
  // achter z -1,38 en onder y 0,79 uit tot |x| 0,555, voor de tankkom (bodem op 0,6695, tot y 0,78) en de vulpijp (binnenkant ongeveer 0,58); niet dieper, want de stekker
  // van de kabelboom achter (tot |x| 0,531, z -1,6) zit ervoor. Vanaf y 0,82 weer 4 cm, zodat de hoedenplank en haar steunlijst vrij blijven.
  const intCF = s => (z, v) => { const tank = s === bodTkS ? sstep((-1.33 - z) / 0.05) * sstep((0.82 - v) / 0.03) : 0, gas = sstep((z + 1.53) / 0.03) * sstep((-1.30 - z) / 0.03) * sstep((v - 0.86) / 0.03) * sstep((1.05 - v) / 0.03);
    const x = surfX(z, v) - 0.04; return [s * (lerp(x, Math.min(x, 0.555), tank) - 0.055 * gas), v, z]; };
  // de gasveer loopt van die bevestiging door de bovenrand van de bekleding naar de klep: een uitsparing in de bovenrand (z -1,40 tot -1,325, vanaf y 1,02) houdt
  // cilinder en zuigerstang in elke stand van de klep vrij (doorgerekend van 0 tot 66 graden: binnen 4 mm speling raakt de veer de bekleding op z -1,392 tot -1,334, y 1,028 en hoger)
  // rijen op vaste hoogten waar de uitwijkingen beginnen en eindigen (0,79 en 0,82 tank, 0,86 en 0,89 gasveer): met gelijke rijen lag het vlak tussen twee rijen schuin over
  // de hoedenplank (0,02 mm vrij) en over de plaats van haar steunlijst
  // DAK-4: de bekleding begint achter de grotere hoekruit (bodKpZB, z -1,37; was -1,17), de uitsparing voor de gasveer loopt van daar tot z -1,40 (zoals eerst)
  const intCTop = z => Math.max(bodGh(z).ye - 0.04, 0.7), intGsN = { z0: -1.40, z1: bodKpZB, y: 1.02 }, intCRows = [0.62, 0.70, 0.79, 0.805, 0.82, 0.86, 0.89];
  const intCFull = z => intCRows.concat([1, 2, 3, 4].map(k => lerp(0.89, intCTop(z), k / 4))), intCNotch = () => intCRows.concat([0.955, intGsN.y]);
  const cPillar = s => { const f = intCF(s), n = intGsN;
    return intPart(`C-stijlbekleding ${sideName(s)}`, merge([intGrid(f, n.z1, n.z0, 6, intCNotch), intGrid(f, n.z0, -1.6, 12, intCFull)]), MAT.intSide,
      'Bekleding van de achterste stijl naast de achterklep, onder de rand van de hemel, met een uitsparing in de bovenrand waar de gasveer van de achterklep doorheen gaat.', { ex: [s * 0.1, 0.04, -0.06] }); };
  // wielkast achter: schil over de wielkast (straal 0,322 tot 0,35 om de as, de koker van de carrosserie heeft straal 0,312), onder de zijbekleding en
  // naast de bagagevloer; geen massief blok, want dat liep dwars door de band en de schokdemperbevestiging (golf 2)
  const arch = (() => { const y0 = 0.47, ring = R => { const t0 = Math.asin((y0 - AY) / R), pts = []; for (let i = 0; i <= 10; i++) { const t = t0 + (PI - 2 * t0) * i / 10; pts.push([AXR + R * Math.cos(t), AY + R * Math.sin(t)]); } return pts; };
    return ring(0.35).concat(ring(0.322).reverse()); })();
  const wheelCover = s => intPart(`Wielkastbekleding ${sideName(s)}`, intSideBlock(arch.map(p => [p[0], p[1]]), s > 0 ? 0.51 : -0.7, s > 0 ? 0.7 : -0.51), MAT.intFelt, 'Beklede verhoging over de achterwielkast in de bagageruimte, tot de zijbekleding.', { ex: [s * 0.1, 0.06, 0] });
  // boven de achterband (y 0,53) langs de wielkast begint de zijbekleding op y 0,56, en boven de boog niet lager dan straal 0,326 om de as (binnen de wielkastbekleding, straal 0,322
  // tot 0,35): op y 0,56 stak de onderrand tot 13 mm onder de koker van de achterwielkast (straal 0,312) uit en zag je het vilt bovenin de boog (open punt AWK, cyclus 2)
  const bootLo = z => { const dz = Math.abs(z - AXR), R = 0.326; return Math.max(0.47 + 0.09 * sstep((z + 1.56) / 0.04), dz < R ? AY + Math.sqrt(R * R - dz * dz) : 0); };
  const bootSide = s => intPart(`Zijbekleding bagageruimte ${sideName(s)}`, intPanel(s, -1.17, -1.66, bootLo, () => 0.64, 0.03, 20, 3), MAT.intFelt, 'Beklede zijwand van de bagageruimte in donker vilt, onder het achterscherm.', { ex: [s * 0.12, 0, -0.08] });
  // vloer: vloerbedekking in een stuk over de voetruimte en onder de achterbank; naast de achterwielkast tot |x| 0,495, 5 mm binnen de wand (lag er precies in)
  // onder de achterbank een uitsparing van de achterrand tot voor de tankkuip van de carrosserie (bodKuip, x -0,18 tot 0,35, z -0,96 tot -0,63, dak y 0,375), 11 mm
  // rondom: de holle hoeken van roundPlate (straal 28 mm) bollen 8 mm in de uitsparing uit; de bedekking stak 4 mm door de wanden van de kuip
  const kx0 = bodKuip.x0 - 0.011, kx1 = bodKuip.x1 + 0.011, kz = bodKuip.z1 + 0.011;
  const carpet = (() => { const hx = 0.62, g = roundPlate([[-0.495, -1.02], [kx0, -1.02], [kx0, kz], [kx1, kz], [kx1, -1.02], [0.495, -1.02], [0.495, -0.9], [hx, -0.9], [hx, 0.775], [0.5, 0.775], [0.5, 0.85], [-0.5, 0.85], [-0.5, 0.775], [-hx, 0.775], [-hx, -0.9], [-0.495, -0.9]], 0.008, 0.003); g.rotateX(HALF); g.translate(0, INT_YF - 0.004, 0); return g; })();
  const mat = (s, n, z) => intPart(`Vloermat ${n}`, bx(0.4, 0.008, 0.52, 0.003, [s * 0.38, INT_YF + 0.004, z]), MAT.rubber, 'Losse rubber vloermat in de voetruimte.', { ex: [0, 0.12, 0.1] });
  const sill = s => intPart(`Instaplijst ${sideName(s)}`, bx(0.09, 0.012, 1.3, 0.004, [s * 0.575, 0.262, 0.07]), MAT.plasticGrey, 'Kunststof dorpellijst bij het instappen.', { ex: [s * 0.1, 0.05, 0] });
  // bagageruimte: vloer tussen de wielkasten (tot |x| 0,495, 5 mm binnen de wand van de wielkast, met een uitsparing tot |x| 0,461 om de veerkoker vanaf z -1,205: de afronding van de binnenhoek (straal 29 mm) bolt in de uitsparing uit en sneed de achterste zijplaat), afdekplaat (hoedenplank) boven de bagage
  const bootFloor = (() => { const g = roundPlate([[-0.6, -1.63], [0.6, -1.63], [0.6, -1.52], [0.495, -1.52], [0.495, -1.205], [0.461, -1.205], [0.461, -1.02], [-0.461, -1.02], [-0.461, -1.205], [-0.495, -1.205], [-0.495, -1.52], [-0.6, -1.52]], 0.015, 0.004); g.rotateX(HALF); g.translate(0, 0.4625, 0); return g; })();
  // voorrand achter de rugleuning achter: de achterkant van de rugleuning (met de bekleding aan de bagagezijde) ligt op de hoogte van de plank op z -1,207 tot -1,213;
  // op -1,075 sneed de plank 54 mm door de rugleuning en 24 mm door de gordelrolautomaten achter (B-032)
  // de zijranden 53 mm binnen de huid: met 50 mm raakte de schuine rand de C-stijlbekleding links op z -1,33 na het verplaatsen van de voorrand
  const plankY = 0.85, plankZ0 = -1.22, plankZ1 = -1.625, plankHW = (z) => surfX(z, plankY) - 0.053;
  const plankGeo = (() => { const hw0 = plankHW(plankZ0), hw1 = plankHW(plankZ1), zc = (plankZ0 + plankZ1) / 2, hd = (plankZ0 - plankZ1) / 2;
    const g = roundPlate([[-hw1, -hd], [hw1, -hd], [hw0, hd], [-hw0, hd]], 0.012, 0.004); g.rotateX(HALF); return g; })();
  const tgNode = NODES.find(n => n.name === 'Achterklep'), tgOpen = !!(tgNode && tgNode.opn);
  const plankOpen = tgOpen ? { open: follow(intPath('Achterklep'), [0, plankY, plankZ0], [1, 0, 0], 0.55, { min: 0.46 }) } : {};
  const plankHide = ['Rugleuning groot deel', 'Rugleuning klein deel'];
  const uit = n => { n.hideWhen = plankHide; return n; };
  const hw0 = plankHW(plankZ0), hw1 = plankHW(plankZ1), pc = (plankZ0 + plankZ1) / 2;
  // steunlijst: de achterrand van de plank rustte op de vilten achterwand, die nu alleen de voorkant van de laaddrempel bekleedt. Een lijst op elke C-stijlbekleding
  // (z -1,36 tot -1,595) draagt de zijranden van de plank achter: van 1,5 mm voor de bekleding tot 15 mm onder de plank, bovenkant 0,5 mm onder de plank (0,844),
  // onderkant vanaf y 0,8215, boven de uitwijking voor de tankkom (tot 0,82)
  const plankEdge = z => lerp(hw0, hw1, (z - plankZ0) / (plankZ1 - plankZ0));
  const ledge = s => { const f = intCF(s), xo = (z, y) => Math.abs(f(z, y)[0]) - 0.0015, yT = plankY - 0.0065, yI = 0.833, yB = 0.8215;
    return intPart(`Steunlijst hoedenplank ${sideName(s)}`, intSweep(z => [[s * xo(z, yT), yT], [s * (plankEdge(z) - 0.015), yT], [s * (plankEdge(z) - 0.015), yI], [s * xo(z, yB), yB]], -1.36, -1.595, 12), MAT.intSide,
      'Kunststof lijst op de C-stijlbekleding waarop de zijrand van de hoedenplank achter rust (vorm en plaats geschat).', { ex: [s * 0.1, 0.02, -0.06] }); };
  const cords = [1, -1].map(s => {
    const a = [s * (hw1 - 0.047), plankY + 0.006, plankZ1 + 0.03], b = [s * 0.5, 0.98, -1.57], dir = V3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), L = dir.length();
    const o = { d: 'Koordje dat de hoedenplank aan de achterklep hangt (plaats geschat): een dun nylon koord van de achterhoek van de plank naar de binnenkant van de klep, dat strak komt als de klep omhoog gaat.', p: a, q: quatFromTo(V3(0, 0, 1), dir), ex: [s * 0.1, 0.1, -0.1] };
    if (tgOpen) o.strut = { a: { node: 'Hoedenplank', p: [s * (hw1 - 0.047), 0.006, plankZ1 + 0.03 - pc] }, b: { node: intPath('Achterklep'), p: b }, rod: 'Koordstuk', lead: intPath('Achterklep'), restLen: L };
    return uit(A(`Hoedenplankkoord ${sideName(s)}`, o, [
      intPart('Koordhuls', merge([xf(G.cyl('z', 0.0028, 0.0028, L * 0.5, 6), [0, 0, L * 0.25]), G.sphere(0.007, 8)]), MAT.fabric, 'Koordhuls met oog aan de hoedenplank.', { ex: [0, 0.04, -0.04] }),
      intPart('Koordstuk', merge([xf(G.cyl('z', 0.0022, 0.0022, L * 0.5, 6), [0, 0, L * 0.75]), xf(G.sphere(0.006, 8), [0, 0, L])]), MAT.fabric, 'Beweegbaar deel van het koordje met oog aan de achterklep.', { ex: [0, 0.04, 0.04] }),
    ]));
  });
  const boot = A('Bagageruimte', { d: 'Bagageruimte met vloer tussen de wielkasten, zijbekleding in vilt, wielkastbekleding, de afdekplaat (hoedenplank) met haar steunlijsten en de bekleding van de laaddrempel.', ex: [0, 0.0, -0.3] }, [
    intPart('Bagagevloer', bootFloor, MAT.carpet, 'Vloerplaat met tapijt van de bagageruimte, tussen de achterwielkasten.', { ex: [0, -0.1, -0.1] }),
    // de bagageopening loopt tot de laaddrempel (bovenkant y 0,60, voorwand op z -1,651 van y 0,455 tot 0,60, |x| tot 0,495): de bekleding stond als vilten wand tot
    // y 0,85 in de opening en bekleedt nu alleen de voorkant van de drempel, 4 mm ervoor en achter de bagagevloer (tot z -1,63); de onderkant op y 0,4825, 2,5 mm boven
    // de bumperbalk achter (tot y 0,48, die op |x| 0,5 tot z -1,606 naar voren buigt; vanaf y 0,455 stak de balk er 6 mm in)
    intPart('Achterwandbekleding', bx(0.99, 0.1175, 0.012, 0.004, [0, 0.54125, -1.640]), MAT.intFelt, 'Vilten bekleding van de voorkant van de laaddrempel, tussen de bagagevloer en de bovenkant van de drempel.', { ex: [0, 0, -0.2] }),
    ...[1, -1].map(bootSide), ...[1, -1].map(wheelCover), ...[1, -1].map(ledge),
    uit(intPart('Hoedenplank', plankGeo, MAT.intFelt, 'Afdekplaat achter de achterbank boven de bagageruimte; rust achter op twee steunlijsten op de C-stijlbekleding, hangt met koordjes aan de achterklep en komt mee omhoog als die opent (geschat 31 graden). Wordt uitgenomen als een rugleuning achter neerklapt.', Object.assign({ p: [0, plankY, pc], ex: [0, 0.3, -0.2] }, plankOpen))),
    ...cords,
  ]);
  return A('Bekleding', { d: 'Hemel met zonkleppen, grepen en plafonnier, stijl- en zijbekleding, vloerbedekking met matten, dorpellijsten en de bekleding van de bagageruimte met de afdekplaat.', ex: [0, 0.4, 0] }, [
    A('Dakbekleding', { d: 'Hemel met zonkleppen, handgrepen en plafonnier.', ex: [0, 0.3, 0] }, [
      intPart('Hemelbekleding', hemel, MAT.intHead, 'Lichtgrijze hemelbekleding onder het dakpaneel, van de voorruit tot de achterklep.', { ex: [0, 0.4, 0] }),
      visor(1), visor(-1),
      handle(1, 0.0, 'voor'), handle(-1, 0.0, 'voor'), handle(1, -0.9, 'achter'), handle(-1, -0.9, 'achter'),
      intPart('Plafonnier', merge([bx(0.14, 0.016, 0.07, 0.006), bx(0.1, 0.004, 0.05, 0.002, [0, -0.01, 0])]), MAT.plasticGrey, 'Plafonnier met lens en schakelaar, midden in de hemel.', { p: [0, lp.y, -0.3], r: [lp.tilt, 0, 0], ex: [0, 0.2, 0] }),
    ]),
    A('Stijlbekleding', { d: 'Bekleding van de dakstijlen en de zijwanden: A-stijl, B-stijl, zijbekleding achter en C-stijl.', ex: [0, 0.1, 0] }, [
      aPillar(1), aPillar(-1), bPillar(1), bPillar(-1), sideFront(1), sideFront(-1), sideRear(1), sideRear(-1), cPillar(1), cPillar(-1),
    ]),
    A('Vloerbekleding', { d: 'Vloerbedekking met losse matten en de dorpellijsten.', ex: [0, -0.1, 0] }, [
      intPart('Vloerbedekking', carpet, MAT.carpet, 'Vloerbedekking in een stuk over de voetruimte en onder de achterbank, uitgespaard rond de tankkuip.', { ex: [0, -0.22, 0] }),
      mat(1, 'bestuurder', 0.52), mat(-1, 'passagier', 0.52),
      // voor de tankkuip (voorwand z -0,63) en achter de onderrails van de voorstoelen (tot z -0,33): z -0,615 tot -0,40; lag op z -0,89 tot -0,59, door de kuip
      intPart('Vloermat achter', bx(0.7, 0.008, 0.215, 0.003, [0, INT_YF + 0.004, -0.5075]), MAT.rubber, 'Losse rubber vloermat in de voetruimte achter, voor de achterbank.', { ex: [0, 0.1, -0.1] }),
      sill(1), sill(-1),
    ]),
    boot,
  ]);
}
function intMirror() {
  const zc = 0.46, yg = YR(zc) - 0.012, tilt = Math.atan((YR(zc - 0.05) - YR(zc + 0.05)) / 0.1), hy = yg - 0.09, hz = zc - 0.04;
  return A('Binnenspiegel', { d: 'Binnenspiegel aan de voorruit met een kantelhendeltje voor dag en nacht.', ex: [0, 0.32, 0.2] }, [
    intPart('Spiegelvoet binnen', intBx(0.04, 0.012, 0.05, 0.004, [0, yg + 0.005, zc], [tilt, 0, 0]), MAT.plastic, 'Voet die op de voorruit is gelijmd.', { ex: [0, 0.06, 0.04] }),
    intPart('Spiegelarm', rodBetween([0, yg - 0.004, zc], [0, hy + 0.03, hz], 0.006, 8), MAT.plastic, 'Arm tussen voet en spiegelhuis.', { ex: [0, 0.04, 0] }),
    intPart('Spiegelhuis binnen', intBx(0.26, 0.065, 0.035, 0.015, [0, hy, hz]), MAT.plastic, 'Behuizing van de binnenspiegel.', { ex: [0, -0.03, 0] }),
    intPart('Spiegelglas binnen', intBox(0.24, 0.05, 0.003, [0, hy, hz - 0.019]), MAT.reflector, 'Spiegelglas van de binnenspiegel.', { ex: [0, 0, -0.08] }),
  ]);
}

function buildInterior() {
  const seats = A('Stoelen', { d: 'Twee voorstoelen met een kantelbare rugleuning voor de instap achter, de achterbank met in delen neerklapbare rugleuning en de veiligheidsgordels.', ex: [0, 0.26, -0.1] }, [intFrontSeat(1), intFrontSeat(-1), intRearBench(), intBelts()]);
  return A('Interieur', { d: 'Interieur van de Twist: stoffen stoelen, dashboard met instrumenten, stuurwiel, pedalen, console met radio (aannemelijk) en kachelbediening, bekleding en bagageruimte met afdekplaat.', ex: [0, 0.66, 0] }, [intDashboard(), intSteering(), intPedals(), intConsole(), seats, intTrim(), intMirror()]);
}
