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
const intPart = (name, geo, mat, d, o) => P(name, geo, mat, Object.assign({ d }, o));
const intBx = (w, h, d, r, p, rot) => xf(G.rbox(w, h, d, r), p, rot);
const intBox = (w, h, d, p, rot) => xf(G.box(w, h, d), p, rot);
const intCy = (ax, r, h, p, seg = 12) => xf(G.cyl(ax, r, r, h, seg), p);
// scharnier om een as; pivot in het frame van de ouder van de knoop (zelfde frame als p)
const intHinge = (pivot, axis, angle, extra) => Object.assign({ type: 'hinge', pivot, axis, angle }, extra);
const intFollow = (lead, pivot, axis, angle, min) => ({ type: 'hinge', pivot, axis, angle, min, follow: lead });
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
  handremhendel: [0.065, 0.40, -0.02],
};

/* ---------- voorstoelen ---------- */
// zitting met rails en hoogteverstelling; de rugleuning kantelt naar voren (instap achter bij een 3-deurs) en draagt de hoofdsteun
function intFrontSeat(s) {
  const drv = s > 0, who = drv ? 'Bestuurdersstoel' : 'Passagiersstoel', ver = drv ? 'bestuurder' : 'passagier', bx = intBx, cy = intCy;
  const frame = A('Stoelframe', { d: 'Stalen onderstel van de zitting: zitplaat, buizen, rails en de hoogteverstelling.', ex: [0, -0.08, 0] }, [
    intPart('Onderrails', merge([intBox(0.034, 0.02, 0.46, [0.165, 0.012, 0]), intBox(0.034, 0.02, 0.46, [-0.165, 0.012, 0])]), MAT.steel, 'Twee vaste rails op de vloer; de bovenrails schuiven erin voor de lengteverstelling.', { ex: [0, -0.05, 0] }),
    intPart('Bovenrails', merge([intBox(0.03, 0.02, 0.4, [0.165, 0.034, 0]), intBox(0.03, 0.02, 0.4, [-0.165, 0.034, 0])]), MAT.darkSteel, 'Twee bovenrails die in de onderrails schuiven en de zitting dragen.', { ex: [0, 0, 0.04] }),
    intPart('Hoogtearmen', merge([[0.165, 0.17], [-0.165, 0.17], [0.165, -0.17], [-0.165, -0.17]].map(([x, z]) => rodBetween([x, 0.045, z * 0.92], [x, 0.115, z], 0.007, 8))), MAT.darkSteel, 'Vier draaiarmen tussen de bovenrails en de zitplaat; ze heffen en laten de zitting zakken (hoogteverstelling).', { ex: [0, 0.02, 0] }),
    intPart('Zitplaat', merge([intBx(0.4, 0.012, 0.42, 0.005, [0, 0.125, 0]), cy('z', 0.008, 0.44, [0.19, 0.125, 0]), cy('z', 0.008, 0.44, [-0.19, 0.125, 0]), cy('x', 0.008, 0.38, [0, 0.125, 0.21])]), MAT.darkSteel, 'Geperste stalen plaat waarop het zitschuim rust, met stalen buizen langs de randen.', { ex: [0, 0.04, 0] }),
    intPart('Lengtebeugel', merge([cy('x', 0.007, 0.34, [0, 0.02, 0.27], 8), rodBetween([0.17, 0.02, 0.27], [0.17, 0.05, 0.2], 0.007, 6), rodBetween([-0.17, 0.02, 0.27], [-0.17, 0.05, 0.2], 0.007, 6)]), MAT.steel, 'Beugel onder de voorkant van de zitting waarmee de stoel in de lengte wordt ontgrendeld.', { ex: [0, -0.03, 0.08] }),
  ]);
  const cushion = A('Zitting', { d: 'Zitkussen van schuim met stoffen bekleding en zijwangen.', ex: [0, 0.14, 0] }, [
    intPart('Zitschuim', bx(0.42, 0.085, 0.46, 0.03, [0, 0.172, 0]), MAT.intFoam, 'Gevormd polyurethaanschuim van het zitkussen.', { inner: true, ex: [0, 0.03, 0] }),
    intPart('Zitbekleding', merge([bx(0.44, 0.094, 0.48, 0.034, [0, 0.176, 0]), bx(0.055, 0.045, 0.36, 0.02, [0.18, 0.232, 0.06]), bx(0.055, 0.045, 0.36, 0.02, [-0.18, 0.232, 0.06])]), MAT.intCloth, 'Stoffen bekleding van de zitting met verstevigde zijwangen (stof en kleur aangenomen).', { ex: [0, 0.1, 0.02] }),
  ]);
  // bediening aan de buitenzijde (de portierzijde): hoogtehendel en hellingshendel
  const ctl = A('Stoelbediening', { d: 'Handbediening van de stoel aan de portierzijde: hoogtehendel en hendel voor de hellingsverstelling van de rugleuning.', ex: [s * 0.14, 0, 0] }, [
    intPart('Hoogtehendel', merge([rodBetween([s * 0.205, 0.125, -0.06], [s * 0.225, 0.125, 0.0], 0.006, 6), rodBetween([s * 0.225, 0.125, 0.0], [s * 0.225, 0.125, 0.07], 0.01, 8)]), MAT.plasticGrey, 'Pompende hendel aan de buitenzijde van de zitting die de hoogte van de zitting verstelt.', { ex: [s * 0.04, 0, 0.03] }),
    intPart('Hellinghendel', merge([cy('x', 0.012, 0.012, [s * 0.215, 0.19, -0.2], 10), rodBetween([s * 0.215, 0.19, -0.2], [s * 0.23, 0.15, -0.13], 0.006, 6), rodBetween([s * 0.23, 0.15, -0.13], [s * 0.23, 0.15, -0.06], 0.009, 8)]), MAT.plasticGrey, 'Hendel voor de hellingsverstelling van de rugleuning, onder de rugleuning aan de portierzijde.', { ex: [s * 0.05, 0.02, 0] }),
  ]);
  const head = A('Hoofdsteun', { d: 'In hoogte verstelbare hoofdsteun met twee geleidestangen in de bovenkant van de rugleuning.', p: [0, 0.6, -0.005], ex: [0, 0.22, 0] }, [
    intPart('Hoofdsteunkussen', bx(0.27, 0.15, 0.09, 0.04, [0, 0.105, 0]), MAT.intCloth, 'Gevoerd kussen met stoffen bekleding.', { ex: [0, 0.08, 0] }),
    intPart('Hoofdsteunstangen', merge([cy('y', 0.0075, 0.14, [0.07, 0.0, 0], 8), cy('y', 0.0075, 0.14, [-0.07, 0.0, 0], 8)]), MAT.chrome, 'Twee stangen die in de bussen van de rugleuning schuiven en de hoogte bepalen.', { ex: [0, -0.04, 0] }),
  ]);
  const lead = `Rugleuning ${ver}`;
  const back = A(lead, { d: `Rugleuning van de ${who.toLowerCase()} met frame, schuim en stoffen bekleding. Kantelt naar voren (geschat 40 graden) zodat een achterpassagier kan instappen; de hoofdsteun gaat mee.`,
    p: [0, 0.235, -0.205], r: [-0.22, 0, 0], ex: [0, 0.1, -0.24],
    open: intHinge([0, 0.235, -0.205], [1, 0, 0], 0.7, Object.assign({ min: 0.58, label: `Rugleuning ${who.toLowerCase()}`, look: { dir: [s * 1, 0.55, -0.25], nodes: [lead] } }, intNeed(`Portier ${drv ? 'links' : 'rechts'}`))) }, [
    intPart('Rugframe', merge([cy('y', 0.009, 0.46, [0.19, 0.32, -0.015]), cy('y', 0.009, 0.46, [-0.19, 0.32, -0.015]), cy('x', 0.009, 0.38, [0, 0.54, -0.015]), cy('x', 0.009, 0.38, [0, 0.1, -0.015])]), MAT.steel, 'Stalen buisframe van de rugleuning.', { inner: true, ex: [0, 0, -0.03] }),
    intPart('Rugschuim', bx(0.42, 0.54, 0.06, 0.028, [0, 0.32, 0.005]), MAT.intFoam, 'Gevormd schuim van de rugleuning.', { inner: true, ex: [0, 0, 0.04] }),
    intPart('Rugbekleding', merge([bx(0.44, 0.56, 0.09, 0.035, [0, 0.32, 0.005]), bx(0.055, 0.5, 0.05, 0.02, [0.19, 0.31, 0.04]), bx(0.055, 0.5, 0.05, 0.02, [-0.19, 0.31, 0.04])]), MAT.intCloth, 'Stoffen bekleding van de rugleuning met verstevigde zijwangen.', { ex: [0, 0, 0.14] }),
    intPart('Rugachterschaal', bx(0.42, 0.54, 0.012, 0.006, [0, 0.32, -0.06]), MAT.plastic, 'Kunststof schaal aan de achterkant van de rugleuning.', { ex: [0, 0, -0.14] }),
    intPart('Instaphendel', bx(0.035, 0.02, 0.05, 0.007, [s * 0.18, 0.585, -0.025]), MAT.plasticGrey, 'Hendel op de bovenzijde van de rugleuning waarmee deze naar voren wordt gekanteld om achter in te stappen.', { ex: [s * 0.04, 0.08, 0] }),
    head,
  ]);
  const buckle = A('Gordelslot voor', { d: 'Gordelslot naast de zitting aan de tunnelzijde, met rode ontgrendelknop en gordelverklikker.', p: [-s * 0.235, 0.2, -0.13], ex: [-s * 0.1, 0.1, 0] }, [
    intPart('Slotbehuizing', intBx(0.03, 0.07, 0.04, 0.008), MAT.plastic, 'Behuizing van het gordelslot met schakelaar voor de gordelverklikker.', { ex: [0, 0.02, 0] }),
    intPart('Ontgrendelknop', intBx(0.016, 0.012, 0.024, 0.004, [0, 0.038, 0.002]), MAT.red, 'Rode knop om de gordel los te maken.', { ex: [0, 0.05, 0] }),
  ]);
  return A(who, { d: `${who}: in hoogte en lengte verstelbaar, met een rugleuning die naar voren kantelt voor de instap achter en een in hoogte verstelbare hoofdsteun. Stoffen bekleding (aangenomen).`,
    spec: [['Verstelling', 'lengte, zitting in hoogte, helling rugleuning'], ['Hoofdsteun', 'in hoogte verstelbaar']], p: [s * INT_SX, INT_YF, INT_SZ], ex: [s * 0.42, 0.04, 0.05] }, [frame, cushion, ctl, back, buckle]);
}

/* ---------- achterbank: zitting en twee neerklapbare rugleuningdelen ---------- */
// De rugleuning staat 14 graden achterover; het deel klapt om een as iets boven en voor zijn onderkant naar voren (geschat 104 graden)
const INT_RB = { y: 0.5, z: -1.05, tilt: -0.25 };
const INT_RBP = { y: 0.548, z: -1.013, ang: 1.82 };
const INT_RBH = 0.52;
function intRearBack(cx, w, name, d, label) {
  const bx = intBx, cy = intCy, hw = w / 2, out = cx > 0 ? 1 : -1;
  return A(name, { d, p: [cx, INT_RB.y, INT_RB.z], r: [INT_RB.tilt, 0, 0], ex: [out * 0.12, 0.12, -0.12],
    open: intHinge([cx, INT_RBP.y, INT_RBP.z], [1, 0, 0], INT_RBP.ang, Object.assign({ min: 1.46, label, look: { dir: [0.5, 0.6, -0.65], nodes: [name, 'Zitting achterbank', 'Achterklep'] } }, intNeed('Achterklep'))) }, [
    intPart('Rugframe', merge([cy('y', 0.009, INT_RBH - 0.1, [hw - 0.04, INT_RBH / 2, -0.02]), cy('y', 0.009, INT_RBH - 0.1, [-hw + 0.04, INT_RBH / 2, -0.02]), cy('x', 0.009, w - 0.08, [0, INT_RBH - 0.06, -0.02]), cy('x', 0.009, w - 0.08, [0, 0.06, -0.02])]), MAT.steel, 'Stalen buisframe van het rugleuningdeel.', { inner: true, ex: [0, 0, -0.02] }),
    intPart('Rugschuim', bx(w - 0.01, INT_RBH - 0.02, 0.065, 0.028, [0, INT_RBH / 2, 0.0]), MAT.intFoam, 'Schuimlaag van het rugleuningdeel.', { inner: true, ex: [0, 0, 0.04] }),
    intPart('Rugbekleding', bx(w, INT_RBH, 0.11, 0.035, [0, INT_RBH / 2, 0.0]), MAT.intCloth, 'Stoffen bekleding van het rugleuningdeel.', { ex: [0, 0, 0.14] }),
    intPart('Rugachterbekleding', bx(w - 0.01, INT_RBH - 0.01, 0.012, 0.005, [0, INT_RBH / 2, -0.062]), MAT.carpet, 'Bekleding aan de bagageruimtezijde van het rugleuningdeel.', { ex: [0, 0, -0.14] }),
    intPart('Rugvergrendeling', bx(0.04, 0.05, 0.03, 0.008, [out * (hw - 0.05), INT_RBH - 0.03, -0.04]), MAT.steel, 'Vergrendeling in de bovenrand die het rugleuningdeel aan de carrosserie vastzet; ontgrendeld met een hendel op de bank of in de bagageruimte.', { ex: [out * 0.06, 0.06, -0.04] }),
    intPart('Scharnierbeugels', merge([bx(0.05, 0.03, 0.06, 0.008, [hw - 0.045, 0.02, -0.04]), bx(0.05, 0.03, 0.06, 0.008, [-hw + 0.045, 0.02, -0.04])]), MAT.darkSteel, 'Beugels waarmee het rugleuningdeel om de onderrand scharniert.', { ex: [0, -0.06, -0.06] }),
  ]);
}
function intRearHead(x, name, lead) {
  const t = INT_RBH, bx = intBx, cy = intCy;
  return A(name, { d: 'Achterhoofdsteun met twee geleidestangen; twee stuks (een per buitenste zitplaats).', p: [x, INT_RB.y + t * Math.cos(INT_RB.tilt), INT_RB.z + t * Math.sin(INT_RB.tilt)], r: [INT_RB.tilt, 0, 0], ex: [0, 0.22, 0],
    open: intFollow(lead, [x, INT_RBP.y, INT_RBP.z], [1, 0, 0], INT_RBP.ang, 1.46) }, [
    intPart('Hoofdsteunkussen', bx(0.22, 0.13, 0.08, 0.035, [0, 0.07, 0]), MAT.intCloth, 'Gevoerd kussen met stoffen bekleding.', { ex: [0, 0.07, 0] }),
    intPart('Hoofdsteunstangen', merge([cy('y', 0.006, 0.12, [0.06, -0.01, 0], 8), cy('y', 0.006, 0.12, [-0.06, -0.01, 0], 8)]), MAT.chrome, 'Twee stangen die in de rugleuning schuiven.', { ex: [0, -0.05, 0] }),
  ]);
}
function intRearBench() {
  // zitting en rugleuningen blijven binnen de wand van de achterwielkast (|x| 0,50): de zitting 10 mm (bekleding 0,98 breed, tot |x| 0,49), de rugleuningen 5 mm (tot |x| 0,495); de bekleding stak er tot 10 mm doorheen of lag er precies in (open punt AWK)
  const bx = intBx;
  const cush = A('Zitting achterbank', { d: 'Zitkussen van de achterbank: plaat, schuim en stoffen bekleding, met de gordelsloten.', p: [0, 0, -0.81], ex: [0, 0.06, 0.14] }, [
    intPart('Zitplaat achter', intBx(0.94, 0.012, 0.4, 0.004, [0, 0.414, 0]), MAT.darkSteel, 'Stalen plaat onder het zitschuim.', { inner: true, ex: [0, 0.02, 0] }),
    intPart('Zitschuim achter', bx(0.96, 0.07, 0.42, 0.03, [0, 0.44, 0]), MAT.intFoam, 'Schuimlaag van de achterbankzitting.', { inner: true, ex: [0, 0.04, 0] }),
    intPart('Zitbekleding achter', bx(0.98, 0.1, 0.44, 0.032, [0, 0.45, 0]), MAT.intCloth, 'Stoffen bekleding van de zitting.', { ex: [0, 0.1, 0.04] }),
    ...[[0.33, 'links'], [-0.33, 'rechts']].map(([x, n]) => intPart(`Gordelslot achter ${n}`, merge([bx(0.03, 0.05, 0.04, 0.008, [x, 0.5, -0.2]), bx(0.014, 0.01, 0.02, 0.003, [x, 0.528, -0.2])]), MAT.plastic, 'Gordelslot van de achterbank met gordelverklikker.', { ex: [0, 0.1, 0] })),
  ]);
  return A('Achterbank', { d: 'Achterbank met in delen neerklapbare rugleuning (een derde en twee derde), twee hoofdsteunen en de gordelsloten voor de twee buitenste zitplaatsen.', spec: [['Rugleuning', 'in twee delen neerklapbaar'], ['Hoofdsteunen', '2']], ex: [0, 0.1, -0.36] }, [
    cush,
    intRearBack(-0.1675, 0.655, 'Rugleuning groot deel', 'Het grote (twee derde) deel van de gedeelde rugleuning; de verdeling en de zijde zijn geschat. Klapt om de onderrand naar voren neer (geschat 104 graden), met de hoofdsteun.', 'Rugleuning groot deel (rechts)'),
    intRearBack(0.3325, 0.325, 'Rugleuning klein deel', 'Het kleine (een derde) deel van de gedeelde rugleuning; klapt om de onderrand naar voren neer (geschat 104 graden), met de hoofdsteun.', 'Rugleuning klein deel (links)'),
    intRearHead(0.335, 'Hoofdsteun achter links', 'Rugleuning klein deel'), intRearHead(-0.335, 'Hoofdsteun achter rechts', 'Rugleuning groot deel'),
  ]);
}

/* ---------- gordels ---------- */
function intBelts() {
  const out = [];
  const bandGeo = (pts, w) => merge(pts.slice(1).map((p, i) => intStrip(pts[i], p, w, 0.0015)));
  for (const s of [1, -1]) {
    const n = sideName(s), zB = -0.66, xr = s * (surfX(zB, 0.55) - 0.07), xg = s * (surfX(zB, 1.06) - 0.05), xpil = y => s * (surfX(zB, y) - 0.05);
    // rusttand: de band hangt van de bovenste geleider langs de B-stijl omlaag; de tong zit onderaan
    const restPts = [[xg, 1.06, zB + 0.012], [xpil(0.86), 0.86, zB + 0.016], [xpil(0.66), 0.66, zB + 0.018]], tong = [xpil(0.62), 0.62, zB + 0.02];
    out.push(A(`Gordel voor ${n}`, { d: 'Driepuntsgordel van de voorstoel: oprolautomaat in de B-stijl, hoogteversteller, geleider, band, tong en onderste verankering.', ex: [s * 0.05, 0.12, 0] }, [
      intPart(`Gordelrolautomaat voor ${n}`, intBx(0.05, 0.1, 0.06, 0.01), MAT.plastic, 'Oprolautomaat met gordelspanner onderin de B-stijl, onder een kunststof kap.', { p: [xr, 0.55, zB], ex: [s * 0.1, 0, 0] }),
      intPart(`Hoogteversteller voor ${n}`, intBx(0.03, 0.18, 0.012, 0.004), MAT.plasticGrey, 'Geleiderail op de B-stijl waarmee de bovenste gordelgeleider in hoogte wordt versteld.', { p: [xg, 1.0, zB - 0.02], ex: [s * 0.1, 0.1, 0] }),
      intPart(`Gordelgeleider voor ${n}`, G.torus('z', 0.018, 0.004, 14, 6), MAT.steel, 'Geleideoog waar de gordelband doorheen loopt.', { p: [xg, 1.06, zB], ex: [s * 0.1, 0.16, 0] }),
      intPart(`Gordelband voor ${n}`, bandGeo(restPts, 0.046), MAT.intBelt, 'Gordelband in de rusttand: van de bovenste geleider langs de B-stijl omlaag naar het onderste ankerpunt, met de tong onderaan.', { ex: [s * 0.1, 0.1, 0.06] }),
      intPart(`Gordeltong voor ${n}`, intBx(0.03, 0.05, 0.008, 0.003), MAT.steel, 'Metalen tong op de gordelband die in het gordelslot klikt; in de rusttand hangt hij onderaan de stijl.', { p: tong, ex: [0, 0.14, 0.04] }),
    ]));
  }
  [[0.335, 'links'], [-0.335, 'rechts']].forEach(([x, n]) => {
    const s = Math.sign(x), zr = -1.13, xr = s * (surfX(zr, 0.85) - 0.07), xg = s * (surfX(zr, 1.08) - 0.06);
    // rusttand: de band hangt van de geleider langs de C-stijl omlaag, de tong zit onderaan (de band klapt dus niet met de rugleuning mee)
    const xp = y => s * (surfX(zr, y) - 0.06), restPts = [[xg, 1.08, zr + 0.005], [xp(0.95), 0.95, zr + 0.01], [xp(0.8), 0.8, zr + 0.012]];
    out.push(A(`Gordel achter ${n}`, { d: 'Driepuntsgordel van de achterbank: oprolautomaat in de zijbekleding, geleider, band en tong; het slot zit in de zitting. De band hangt in rust langs de achterstijl.', ex: [s * 0.04, 0.1, 0] }, [
      intPart(`Gordelrolautomaat achter ${n}`, intBx(0.05, 0.1, 0.07, 0.01), MAT.plastic, 'Oprolautomaat in de zijbekleding achter, boven de wielkast.', { p: [xr, 0.85, zr], ex: [s * 0.1, 0.1, 0] }),
      intPart(`Gordelgeleider achter ${n}`, intBx(0.05, 0.2, 0.09, 0.012, [xg, 1.1, zr - 0.02]), MAT.intSide, 'Kunststof kap op de C-stijl waarin de gordelband omhoog loopt en over de geleider naar beneden gaat.', { ex: [s * 0.1, 0.14, 0] }),
      intPart(`Gordelband achter ${n}`, bandGeo(restPts, 0.046), MAT.intBelt, 'Gordelband van de achterbank in de rusttand: van de geleider langs de achterstijl omlaag.', { ex: [s * 0.08, 0.12, 0.05] }),
      intPart(`Gordeltong achter ${n}`, intBx(0.03, 0.05, 0.008, 0.003), MAT.steel, 'Metalen tong die in het gordelslot klikt; in de rusttand hangt hij onderaan de stijl.', { p: [xp(0.77), 0.77, zr + 0.016], ex: [0, 0.14, 0.04] }),
    ]));
  });
  return A('Veiligheidsgordels', { d: 'Driepuntsgordels met oprolautomaten, geleiders en tongen voor de twee voorstoelen en de twee buitenste plaatsen achter; de gordelsloten zitten in de stoelen en de achterbank.', ex: [0, 0.3, 0] }, out);
}

/* ---------- dashboard ---------- */
// zijprofiel (z, y) van het dashboard; ver naar voren een lage rand onder de voorruit, achterrand en voorvlak naar de bestuurder
const intDashPf = [[0.85, 0.905], [0.74, 0.925], [0.62, 0.925], [0.55, 0.905], [0.505, 0.84], [0.49, 0.76], [0.505, 0.68], [0.53, 0.6], [0.56, 0.52], [0.85, 0.52], [0.85, 0.6]];
const intDashHW = 0.52;      // tot de portierbekleding (binnenkant op 0,549); eerder 0,572 en dus door het portier
// rooster met lamellen op het dashboard: huis en lamellen in een stuk
function intVent(name, d, p, r, w, h) {
  const n = Math.max(2, Math.round(h / 0.012));
  return intPart(name, merge([intBx(w, h, 0.02, 0.006), ...Array.from({ length: n }, (_, i) => intBox(w - 0.014, 0.003, 0.012, [0, -h / 2 + 0.01 + (h - 0.02) * (i + 0.5) / n, -0.006]))]), MAT.plasticGrey, d, { p, r, ex: [0, 0.02, -0.08] });
}
function intDashboard() {
  const bx = intBx, cy = intCy;
  const dashShell = A('Dashboardkap', { d: 'Dashboardkap van zwart kunststof met de kniebeschermer onder de stuurkolom en de zijkappen.', ex: [0, 0.18, 0.3] }, [
    intPart('Dashboardbovenkant', intSideBlock(intDashPf, -intDashHW, intDashHW), MAT.dash, 'Dashboardkap: zachte bovenkant, voorvlak en onderrand in een stuk; achter de voorruit onder de waterkast.', { ex: [0, 0.1, 0.1] }),
    intPart('Kniebeschermer', bx(0.36, 0.2, 0.05, 0.015, [0.35, 0.6, 0.5], [-0.3, 0, 0]), MAT.dash, 'Gevoerde plaat onder de stuurkolom die de knieën van de bestuurder beschermt.', { ex: [0, -0.05, -0.14] }),
    ...[1, -1].map(s => intPart(`Dashboardzijkap ${sideName(s)}`, bx(0.02, 0.35, 0.36, 0.006, [s * (intDashHW + 0.01), 0.72, 0.67]), MAT.plastic, 'Zijkap die het uiteinde van het dashboard afsluit tegen de portierstijl.', { ex: [s * 0.1, 0, 0] })),
  ]);
  // instrumenten voor de bestuurder: wijzerplaten kijken schuin naar boven naar de ogen
  const cl = { x: 0.37, y: 0.855, z: 0.545 };
  const dial = (x, label) => merge([xf(G.cyl('z', 0.04, 0.04, 0.004, 24), [x, 0, -0.031]), xf(G.torus('z', 0.0415, 0.0035, 24, 5), [x, 0, -0.033])]);
  const cluster = A('Instrumentenpaneel', { d: 'Instrumentenpaneel met twee ronde wijzerplaten (snelheidsmeter en toerenteller), twee kleine meters en een rij waarschuwingslampjes (indeling schematisch).', p: [cl.x, cl.y, cl.z], r: [0.35, 0, 0], ex: [0, 0.05, -0.15] }, [
    intPart('Instrumentenbehuizing', bx(0.3, 0.11, 0.06, 0.012), MAT.plastic, 'Behuizing met printplaat achter het glas.', { ex: [0, 0, 0.06] }),
    intPart('Snelheidsmeter', dial(0.08), MAT.screen, 'Snelheidsmeter met chromen ring.', { ex: [0, 0, -0.03] }),
    intPart('Toerenteller', dial(-0.08), MAT.screen, 'Toerenteller met chromen ring.', { ex: [0, 0, -0.03] }),
    intPart('Schaalverdeling', merge([0.08, -0.08].map(x => merge(Array.from({ length: 9 }, (_, i) => { const a = -2.2 + i * 0.55; return xf(G.box(0.003, 0.009, 0.001), [x + 0.031 * Math.sin(a), 0.031 * Math.cos(a), -0.0335], [0, 0, -a]); })))), MAT.intDial, 'Streepjes van de schaalverdeling op de twee wijzerplaten.', { ex: [0, 0, -0.05] }),
    intPart('Wijzers', merge([xf(G.box(0.003, 0.034, 0.002), [0.08 + 0.012, 0.012, -0.036], [0, 0, 0.7]), xf(G.box(0.003, 0.034, 0.002), [-0.08 - 0.01, 0.01, -0.036], [0, 0, -0.9])]), MAT.red, 'Wijzers van snelheidsmeter en toerenteller.', { ex: [0, 0, -0.08] }),
    intPart('Brandstof- en temperatuurmeter', merge([xf(G.cyl('z', 0.014, 0.014, 0.004, 14), [0, 0.022, -0.031]), xf(G.cyl('z', 0.014, 0.014, 0.004, 14), [0, -0.022, -0.031])]), MAT.screen, 'Twee kleine meters tussen de wijzerplaten: brandstofvoorraad en koelwatertemperatuur.', { ex: [0, 0, -0.04] }),
    intPart('Waarschuwingslampjes', merge([-0.12, -0.08, -0.04, 0, 0.04, 0.08, 0.12].map(x => intBox(0.016, 0.006, 0.002, [x, 0.047, -0.0315]))), MAT.amber, 'Rij waarschuwingslampjes boven de wijzerplaten (richtingaanwijzers, accu, olie, handrem).', { ex: [0, 0.03, -0.06] }),
    intPart('Instrumentenglas', G.box(0.29, 0.1, 0.004), MAT.lensClear, 'Doorzichtig kapglas voor de instrumenten.', { p: [0, 0, -0.037], ex: [0, 0, -0.14] }),
  ]);
  const hood = intPart('Instrumentenkap', bx(0.36, 0.05, 0.2, 0.02, [cl.x, 0.945, 0.615], [0.05, 0, 0]), MAT.dash, 'Kap boven de instrumenten tegen reflecties in de voorruit.', { ex: [0, 0.1, 0] });
  // handschoenenkastje: open bak met bodem en wanden; de klep sluit af
  const gk = A('Handschoenenkastje', { d: 'Handschoenenkastje voor de voorpassagier: bak in het dashboard met klep.', ex: [-0.14, -0.02, -0.18] }, [
    intPart('Handschoenenkastbak', merge([intBox(0.32, 0.008, 0.2, [-0.34, 0.545, 0.64]), intBox(0.32, 0.008, 0.2, [-0.34, 0.685, 0.64]), intBox(0.008, 0.14, 0.2, [-0.5, 0.615, 0.64]), intBox(0.008, 0.14, 0.2, [-0.18, 0.615, 0.64]), intBox(0.32, 0.14, 0.008, [-0.34, 0.615, 0.74])]), MAT.plastic, 'Open bak van het handschoenenkastje, in het dashboard weggewerkt achter de klep.', { inner: true, ex: [0, 0, 0.1] }),
    intPart('Handschoenenkastklep', bx(0.34, 0.17, 0.02, 0.008, [-0.34, 0.615, 0.512], [-0.3, 0, 0]), MAT.dash, 'Klep van het handschoenenkastje (in dit model dicht).', { ex: [0, -0.06, -0.12] }),
    intPart('Handschoenenkastslot', bx(0.045, 0.02, 0.012, 0.005, [-0.34, 0.67, 0.5], [-0.3, 0, 0]), MAT.plasticGrey, 'Drukknop van het slot.', { ex: [0, 0.03, -0.1] }),
  ]);
  const vents = A('Luchtroosters dashboard', { d: 'Luchtroosters voor de verwarming en de ventilatie: twee in het midden, twee aan de zijkanten, en de ontwasemroosters onder de voorruit en bij de zijruiten.', ex: [0, 0.1, 0.1] }, [
    intVent('Rooster midden bestuurder', 'Verstelbaar luchtrooster met horizontale lamellen links in het midden van het dashboard.', [0.095, 0.845, 0.495], [0.19, 0, 0], 0.09, 0.045),
    intVent('Rooster midden passagier', 'Verstelbaar luchtrooster met horizontale lamellen rechts in het midden van het dashboard.', [-0.095, 0.845, 0.495], [0.19, 0, 0], 0.09, 0.045),
    intVent('Rooster zijkant bestuurder', 'Luchtrooster aan de uiterste zijde van het dashboard bij de bestuurder.', [0.475, 0.84, 0.502], [0.19, 0, 0], 0.075, 0.045),
    intVent('Rooster zijkant passagier', 'Luchtrooster aan de uiterste zijde van het dashboard bij de passagier.', [-0.475, 0.84, 0.502], [0.19, 0, 0], 0.075, 0.045),
    intPart('Ontwasemrooster voorruit', merge(Array.from({ length: 9 }, (_, i) => intBox(0.04, 0.003, 0.012, [-0.4 + i * 0.1, 0, 0]))), MAT.plastic, 'Gleuf op de bovenkant van het dashboard die lucht tegen de voorruit blaast.', { p: [0, 0.9255, 0.8], ex: [0, 0.1, 0.0] }),
    intPart('Ontwasemroosters zijruit', merge([1, -1].map(s => intBox(0.07, 0.004, 0.02, [s * 0.48, 0.9235, 0.8]))), MAT.plastic, 'Twee kleine roosters aan de uiteinden van het dashboard die lucht langs de zijruiten blazen.', { ex: [0, 0.08, 0] }),
  ]);
  const spk = intPart('Luidsprekerroosters', merge([1, -1].map(s => bx(0.1, 0.004, 0.06, 0.002, [s * 0.46, 0.9255, 0.7]))), MAT.plastic, 'Twee roosters boven de luidsprekers van het audiopakket, links en rechts in de bovenkant van het dashboard (plaats aangenomen).', { ex: [0, 0.14, 0.1] });
  const rel = A('Dashboardbediening', { d: 'Schakelaars en ontgrendelingen onder het dashboard bij de bestuurder: zekeringkast, kapontgrendeling.', ex: [0.1, -0.1, -0.2] }, [
    intPart('Zekeringkastklep', bx(0.1, 0.07, 0.01, 0.004, [0.47, 0.64, 0.495], [0.1, 0, 0]), MAT.plasticGrey, 'Klepje onder het dashboard waarachter de zekeringen zitten.', { ex: [0.04, -0.04, -0.06] }),
    intPart('Motorkapontgrendeling', merge([bx(0.035, 0.012, 0.05, 0.004, [0.5, 0.58, 0.51]), rodBetween([0.5, 0.58, 0.535], [0.5, 0.58, 0.8], 0.002, 4)]), MAT.plasticGrey, 'Trekgreep onder het dashboard die de motorkap via een kabel ontgrendelt.', { ex: [0.04, -0.04, -0.06] }),
  ]);
  return A('Dashboard', { d: 'Dashboard met instrumentenpaneel, luchtroosters, handschoenenkastje en de luidsprekers van het audiopakket; kappen en bedieningspanelen rond de stuurkolom.', spec: [['Instrumenten', 'snelheidsmeter, toerenteller, brandstof, temperatuur']], ex: [0, 0.2, 0.55] }, [dashShell, cluster, hood, gk, vents, spk, rel]);
}

/* ---------- stuurwiel met kolomkap ---------- */
// Frame met het midden van de naaf in de oorsprong en +z naar de bestuurder; de kolom loopt langs -z. De kolom zelf (met de
// stuurinrichting) is van het onderstel en sluit aan op INT_PORTS.stuurkolom.
// stand van het stuurwiel: +z naar de bestuurder (tegen de kolomrichting in), +y omhoog, +x naar rechts van de bestuurder
function intWheelQ(dir) {
  const z = dir.clone().multiplyScalar(-1).normalize(), x = V3(-1, 0, 0), y = z.clone().cross(x).normalize();
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
}
function intSteering() {
  const dir = V3(...INT_COLDIR), bx = intBx, cy = intCy;
  return A('Stuurwiel met kolomkap', { d: 'Stuurwiel met naaf, claxonpad en schakelaars, en de kunststof kap rond de stuurkolom tot het dashboard. De stuurkolom zelf is van het onderstel; zij sluit aan op het punt in het verlengde van de kolom tegen het dashboard (zie INT_PORTS.stuurkolom). Geen airbag.',
    p: INT_WHEEL, q: intWheelQ(dir), ex: [0, 0.18, -0.35] }, [
    intPart('Stuurwielkrans', G.torus('z', 0.17, 0.0135, 36, 8), MAT.plastic, 'Rubber kunststof stuurkrans met een doorsnede van 36 cm (maat geschat); geen stuurbekrachtiging.', { ex: [0, 0, -0.1] }),
    intPart('Stuurwielspaken', merge([rodBetween([0.04, 0, 0], [0.16, 0, 0.0], 0.011, 8), rodBetween([-0.04, 0, 0], [-0.16, 0, 0], 0.011, 8), rodBetween([0, -0.04, 0], [0, -0.16, 0], 0.011, 8)]), MAT.plastic, 'Drie spaken tussen naaf en krans.', { ex: [0, 0, -0.06] }),
    intPart('Stuurwielnaaf', merge([cy('z', 0.05, 0.04, [0, 0, 0.0], 20), bx(0.09, 0.07, 0.014, 0.015, [0, 0, 0.026])]), MAT.plastic, 'Naaf met claxonpad; de naaf zit met een gekartelde as op de stuurkolom.', { ex: [0, 0, -0.1] }),
    intPart('Kolomkap boven', cy('z', 0.048, 0.14, [0, 0.005, -0.1], 16), MAT.plastic, 'Bovenste helft van de kap om de stuurkolom, tot het dashboard.', { ex: [0, 0.06, 0] }),
    intPart('Kolomkap onder', bx(0.1, 0.05, 0.14, 0.015, [0, -0.04, -0.1]), MAT.plastic, 'Onderste helft van de kap om de stuurkolom met het contactslot.', { ex: [0, -0.06, 0] }),
    intPart('Combischakelaar links', merge([rodBetween([-0.04, 0.0, -0.05], [-0.14, 0.01, -0.03], 0.007, 8), bx(0.03, 0.024, 0.024, 0.008, [-0.15, 0.012, -0.03])]), MAT.plasticGrey, 'Hendel links van de kolom voor de richtingaanwijzers en de verlichting.', { ex: [-0.08, 0, 0] }),
    intPart('Combischakelaar rechts', merge([rodBetween([0.04, 0.0, -0.05], [0.14, 0.01, -0.03], 0.007, 8), bx(0.03, 0.024, 0.024, 0.008, [0.15, 0.012, -0.03])]), MAT.plasticGrey, 'Hendel rechts van de kolom voor de voor- en achterruitwissers.', { ex: [0.08, 0, 0] }),
    intPart('Contactslot', merge([cy('z', 0.015, 0.02, [0.045, -0.04, -0.045], 12), bx(0.006, 0.014, 0.008, 0.002, [0.045, -0.04, -0.056])]), MAT.chrome, 'Contactslot met sleutel rechts op de kolomkap.', { ex: [0.04, -0.04, 0] }),
  ]);
}

/* ---------- pedalen ---------- */
// Linksgestuurd: koppeling links (|x| groot), rem in de lijn van de stuurkolom, gas rechts; alles aan de schutbordzijde (z 0,85).
function intPedals() {
  const bx = intBx;
  const padAt = (x, y, z, w, h, tilt) => bx(w, h, 0.016, 0.006, [x, y, z], [tilt, 0, 0]);
  return A('Pedalen', { d: 'Gaspedaal, rempedaal en koppelingspedaal met de pedaalbok onder het dashboard, plus een voetsteun. De rem- en gasbediening en de koppelingskabel sluiten aan op de punten in INT_PORTS.', ex: [0.12, -0.1, 0.38] }, [
    intPart('Pedaalbok', merge([bx(0.34, 0.1, 0.02, 0.006, [0.36, 0.62, 0.835]), intBox(0.02, 0.1, 0.08, [0.2, 0.62, 0.8]), intBox(0.02, 0.1, 0.08, [0.52, 0.62, 0.8]), intAxisX(0.37, 0.6, 0.8, 0.34)]), MAT.darkSteel, 'Steun aan het schutbord waarin het rem- en het koppelingspedaal scharnieren.', { ex: [0, 0.1, 0.08] }),
    intPart('Rempedaalarm', rodBetween([0.37, 0.6, 0.8], [0.37, 0.4, 0.745], 0.009, 8), MAT.steel, 'Pedaalarm die de rembekrachtiger bedient (stang naar het schutbord op INT_PORTS.rempedaal).', { ex: [0.04, 0, 0.04] }),
    intPart('Rempedaalrubber', padAt(0.37, 0.375, 0.738, 0.09, 0.07, -0.28), MAT.rubber, 'Rubber pad van het rempedaal.', { ex: [0.04, 0, -0.06] }),
    intPart('Koppelingspedaalarm', rodBetween([0.47, 0.6, 0.8], [0.47, 0.4, 0.745], 0.009, 8), MAT.steel, 'Pedaalarm van de koppeling; de koppelingskabel loopt door het schutbord naar de koppelingsarm op de bak (INT_PORTS.koppelingspedaal).', { ex: [0.1, 0, 0.04] }),
    intPart('Koppelingspedaalrubber', padAt(0.47, 0.375, 0.738, 0.08, 0.07, -0.28), MAT.rubber, 'Rubber pad van het koppelingspedaal.', { ex: [0.1, 0, -0.06] }),
    intPart('Gaspedaalarm', merge([rodBetween([0.255, 0.31, 0.72], [0.255, 0.43, 0.8], 0.008, 8), rodBetween([0.255, 0.43, 0.8], [0.255, 0.43, 0.84], 0.004, 6)]), MAT.steel, 'Arm van het gaspedaal, scharnierend op de vloer; de gaskabel gaat door het schutbord (INT_PORTS.gaspedaal).', { ex: [-0.04, 0, 0.04] }),
    intPart('Gaspedaalrubber', bx(0.06, 0.016, 0.18, 0.006, [0.255, 0.395, 0.775], [0.9, 0, 0]), MAT.rubber, 'Gaspedaal met rubber pad, schuin vooruit omhoog.', { ex: [-0.06, 0, -0.06] }),
    intPart('Remlichtschakelaar', xf(G.cyl('z', 0.012, 0.012, 0.04, 8), [0.37, 0.67, 0.81]), MAT.plasticGrey, 'Schakelaar die de remlichten inschakelt.', { ex: [0, 0.06, 0] }),
    intPart('Voetsteun', bx(0.05, 0.17, 0.02, 0.006, [0.53, 0.33, 0.77], [-0.7, 0, 0]), MAT.satin, 'Steun voor de linkervoet.', { ex: [0.08, 0, -0.04] }),
  ]);
}
// cilinder langs x tussen x0 en x0+len op (y, z): as van de pedalen
function intAxisX(x0, y, z, len) { return xf(G.cyl('x', 0.007, 0.007, len, 8), [x0, y, z]); }

/* ---------- middenconsole ---------- */
function intConsole() {
  const bx = intBx, cy = intCy;
  const tunnel = intPart('Tunnelconsole', intSideBlock([[0.54, 0.275], [0.54, 0.52], [0.5, 0.46], [0.32, 0.44], [0.12, 0.42], [-0.1, 0.4], [-0.24, 0.385], [-0.27, 0.275]], -0.1, 0.1), MAT.plasticGrey, 'Console over de middentunnel van het dashboard tot achter de handrem; ze bergt de schakelmechaniek, de handremkabels en de uitlaat in de tunnel.', { ex: [0, 0.12, 0.05] });
  const stack = intPart('Middenstapel', bx(0.26, 0.3, 0.1, 0.012, [0, 0.65, 0.505]), MAT.plasticGrey, 'Middenpaneel in het dashboard waarin de radio en de kachelbediening zitten.', { ex: [0, 0.04, -0.16] });
  const radio = A('Radio', { d: 'Radio van het audiopakket van de Twist in het midden van het dashboard (uitvoering en bediening schematisch).', ex: [0, 0.1, -0.22] }, [
    intPart('Radiobehuizing', bx(0.18, 0.05, 0.18, 0.006, [0, 0.725, 0.56]), MAT.darkSteel, 'Metalen behuizing van de radio in het dashboard, achter het voorpaneel.', { inner: true, ex: [0, 0, 0.1] }),
    intPart('Radiopaneel', bx(0.19, 0.05, 0.012, 0.005, [0, 0.725, 0.458]), MAT.blackGloss, 'Zwart voorpaneel van de radio.', { ex: [0, 0, -0.04] }),
    intPart('Radioknoppen', merge([cy('z', 0.014, 0.016, [0.07, 0.725, 0.45], 14), cy('z', 0.014, 0.016, [-0.07, 0.725, 0.45], 14)]), MAT.chrome, 'Draaiknoppen voor volume en afstemming.', { ex: [0, 0, -0.08] }),
    intPart('Radiodisplay', intBox(0.07, 0.02, 0.003, [0, 0.73, 0.451]), MAT.screen, 'Display met de zenderfrequentie.', { ex: [0, 0.02, -0.06] }),
  ]);
  const heater = A('Kachelbediening', { d: 'Bediening van de verwarming en ventilatie: schuiven voor temperatuur en luchtverdeling en een draaiknop voor de ventilator.', ex: [0, -0.05, -0.18] }, [
    intPart('Kachelpaneel', bx(0.2, 0.09, 0.012, 0.005, [0, 0.62, 0.458]), MAT.plastic, 'Paneel met de bediening van de kachel.', { ex: [0, 0, -0.03] }),
    intPart('Kachelschuiven', merge([-0.065, 0, 0.065].map(x => bx(0.012, 0.045, 0.016, 0.003, [x - 0.0, 0.63 + (x === 0 ? 0.0 : x * 0.1), 0.45]))), MAT.satin, 'Drie schuiven voor temperatuur, luchtverdeling en luchtbron.', { ex: [0, 0, -0.07] }),
    intPart('Ventilatorknop', cy('z', 0.016, 0.016, [0, 0.58, 0.45], 16), MAT.satin, 'Draaiknop voor de ventilatorstand.', { ex: [0, -0.02, -0.08] }),
    intPart('Achterruitverwarmingsknop', bx(0.02, 0.014, 0.01, 0.003, [0.07, 0.58, 0.452]), MAT.plasticGrey, 'Drukknop voor de achterruitverwarming.', { ex: [0.03, -0.02, -0.08] }),
  ]);
  const small = A('Consolevoorkant', { d: 'Sigarettenaansteker en asbak in de voorkant van de console.', ex: [0, 0, -0.14] }, [
    intPart('Sigarettenaansteker', merge([cy('z', 0.012, 0.02, [0.04, 0.5, 0.485], 12), cy('z', 0.016, 0.004, [0.04, 0.5, 0.475], 12)]), MAT.satin, 'Sigarettenaansteker onder de middenstapel.', { ex: [0, 0, -0.06] }),
    intPart('Asbak', bx(0.07, 0.03, 0.05, 0.006, [-0.04, 0.5, 0.485]), MAT.plasticGrey, 'Asbak voor in de console, onder de middenstapel.', { ex: [0, 0, -0.06] }),
  ]);
  // pook met hoes: de schakelstang van de bak (DRV_PORTS.shiftIn) sluit onder de tunnel aan op INT_PORTS.pookvoet
  const gx = INT_PORTS.pookvoet;
  const shifter = A('Pook met hoes', { d: 'Pook van de handgeschakelde vijfbak met rubber hoes in de console; de schakelstang naar de bak komt onder de tunnel aan op het voetpunt (INT_PORTS.pookvoet).', p: [gx[0], gx[1], gx[2]], ex: [0, 0.2, 0] }, [
    intPart('Pookhoes', G.lathe('y', [[0.075, 0], [0.07, 0.012], [0.05, 0.035], [0.028, 0.06], [0.016, 0.075], [0.014, 0.08]], 20, 'intPookhoes'), MAT.rubber, 'Rubber hoes rond het onderste deel van de pook, afgedicht op de console.', { ex: [0, 0.03, 0] }),
    intPart('Pookstang', cy('y', 0.0075, 0.19, [0, 0.17, 0], 10), MAT.steel, 'Stalen pookstang die door de hoes naar de schakelmechaniek loopt.', { ex: [0, 0.06, 0] }),
    intPart('Pookknop', merge([G.sphere(0.026, 16), xf(G.box(0.002, 0.002, 0.002), [0, 0, 0])]), MAT.plastic, 'Zwarte pookknop met het schakelschema (schematisch).', { p: [0, 0.285, 0], ex: [0, 0.12, 0] }),
  ]);
  // handrem: hendel met knop en hoes naast de pook, tegen de tunnel (kabels van het remsysteem sluiten aan op INT_PORTS.handremhendel)
  const hx = INT_PORTS.handremhendel;
  const hb = A('Handremhendel met hoes', { d: 'Handremhendel naast de pook, op de console. De kabels van de handrem lopen onder de console naar achter (aansluitpunt INT_PORTS.handremhendel).', p: [hx[0], hx[1], hx[2]], ex: [0.06, 0.12, -0.06] }, [
    intPart('Handremhendel', merge([rodBetween([0, 0.0, 0.04], [0, 0.1, -0.1], 0.008, 8), bx(0.032, 0.03, 0.1, 0.012, [0, 0.12, -0.13], [0.3, 0, 0])]), MAT.plastic, 'Hendel met grip die de handrem aantrekt; ratelt vast met een pal.', { ex: [0, 0.08, -0.04] }),
    intPart('Handremknop', bx(0.014, 0.012, 0.02, 0.004, [0, 0.14, -0.175], [0.3, 0, 0]), MAT.plasticGrey, 'Drukknop in de grip om de handrem te ontgrendelen.', { ex: [0, 0.1, -0.06] }),
    intPart('Handremhoes', bx(0.07, 0.01, 0.18, 0.004, [0, 0.008, -0.02]), MAT.rubber, 'Rubber hoes over de gleuf waar de handremhendel door de console steekt.', { ex: [0, 0.03, 0] }),
  ]);
  return A('Middenconsole', { d: 'Console over de tunnel met de middenstapel (radio, kachelbediening), pook met hoes en handrem.', ex: [0, 0.3, 0.1] }, [tunnel, stack, radio, heater, small, shifter, hb]);
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
  const handle = (s, z, n) => intPart(`Dakgreep ${n} ${sideName(s)}`, merge([bx(0.022, 0.024, 0.15, 0.008), bx(0.03, 0.03, 0.025, 0.006, [0, 0.01, 0.075]), bx(0.03, 0.03, 0.025, 0.006, [0, 0.01, -0.075])]), MAT.plasticGrey, 'Handgreep boven het portier met klapscharnier.', { p: [s * hx(z), hl(z, hx(z)) - 0.021, z], r: [-slope(z, hx(z)), 0, 0], ex: [s * 0.1, -0.08, 0] });
  // zonneklep: paneel met spiegeltje, langs de bovenrand van de voorruit
  const visor = s => { const zc = 0.3, vx = s * 0.36, vy = hl(zc, 0.36) - 0.0085, rx = -slope(zc, 0.36), rz = s * (hl(zc, 0.46) - hl(zc, 0.26)) / 0.2;
    return A(`Zonneklep ${sideName(s)}`, { d: 'Zonneklep (gevoerd paneel met spiegeltje aan de kant van de passagier), schuin langs de bovenrand van de voorruit; in dit model opgeklapt.', p: [vx, vy, zc], r: [rx, 0, rz], ex: [0, 0.3, 0.1] }, [
      intPart('Zonnekleppaneel', merge([bx(0.4, 0.012, 0.17, 0.006), xf(G.cyl('x', 0.005, 0.005, 0.32, 8), [0, 0, 0.081])]), MAT.intHead, 'Gevoerd paneel van de zonneklep met de draaias langs de dakrand.', { ex: [0, 0.06, 0] }),
      intPart('Make-upspiegel', bx(0.14, 0.002, 0.07, 0.001, [0, -0.007, 0]), MAT.reflector, 'Spiegel in de zonneklep van de passagier.', { ex: [0, -0.06, 0] }),
    ]); };
  const roofLamp = (z) => { const y = intRoofY(z, 0) - 0.016, tilt = -(intRoofY(z + 0.05, 0) - intRoofY(z - 0.05, 0)) / 0.1; return { y, tilt }; };
  const lp = roofLamp(-0.3);
  const pil = (s, z, q, dy) => { const h = bodGhHalf(z, q); return [s * (h[0] - 0.036), h[1] - 0.028 + dy, z]; };
  const aPillar = s => intPart(`A-stijlbekleding ${sideName(s)}`, tube([pil(s, 0.82, 0.62, -0.01), pil(s, 0.6, 0.6, -0.02), pil(s, 0.4, 0.6, -0.025), pil(s, 0.2, 0.62, -0.03)], 0.016, 30, 6), MAT.intSide, 'Smalle stijlbekleding langs de A-stijl.', { ex: [s * 0.1, 0.06, 0.04] });
  // B-stijl: tussen de portierruit en de hoekruit (z -0.585 tot -0.74), van de dorpel tot de dakrand; achter de portierrand
  const topAt = z => bodGh(z).ye - 0.05;
  const bPillar = s => intPart(`B-stijlbekleding ${sideName(s)}`, intPanel(s, -0.585, -0.74, () => 0.285, z => bodGh(z).ye - 0.04, 0.035, 4, 12), MAT.intSide, 'Kunststof bekleding van de brede B-stijl achter het portier, met de bevestiging van de voorgordel.', { ex: [s * 0.08, 0.04, -0.04] });
  // zijbekleding achter: onder de hoekruit, tussen B-stijl en achterklep; boven de wielkast met de gordelrolautomaat
  const sideRear = s => intPart(`Zijbekleding achter ${sideName(s)}`, intPanel(s, -0.74, -1.17, z => 0.3 + 0.3 * clamp((-0.93 - z) / 0.1, 0, 1), z => YT(z) - 0.03, 0.035, 20, 6), MAT.intSide, 'Kunststof zijbekleding onder de hoekruit bij de achterbank, tot de achterklep.', { ex: [s * 0.1, 0, -0.04] });
  const sideFront = s => intPart(`Zijbekleding achterbank ${sideName(s)}`, intPanel(s, -0.585, -0.74, () => 0.285, () => 0.55, 0.036, 4, 4), MAT.intSide, 'Onderste deel van de bekleding naast de achterbank.', { ex: [s * 0.1, 0, 0] });
  // de gasveerbevestiging (z -1,40 tot -1,36, y 0,93 tot 0,98) en rechts de tankkom met de vulhals zitten achter de bekleding: die ligt 4 cm van de huid, daar 9,5 cm (vulhals rechts onder y 0,9: 16,5 cm)
  const cPillar = s => intPart(`C-stijlbekleding ${sideName(s)}`, patch((z, v) => { const tank = s < 0 ? sstep((-1.33 - z) / 0.05) * sstep((0.9 - v) / 0.08) : 0, gas = sstep((z + 1.46) / 0.03) * sstep((-1.30 - z) / 0.03) * sstep((v - 0.86) / 0.03) * sstep((1.05 - v) / 0.03); return [s * (surfX(z, v) - 0.04 - 0.055 * gas - 0.125 * tank), v, z]; }, -1.17, -1.6, 26, z => [0.62, Math.max(bodGh(z).ye - 0.04, 0.7)], 8), MAT.intSide, 'Bekleding van de achterste stijl naast de achterklep, onder de rand van de hemel.', { ex: [s * 0.1, 0.04, -0.06] });
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
  const carpet = (() => { const hx = 0.62, g = roundPlate([[-0.495, -1.02], [0.495, -1.02], [0.495, -0.9], [hx, -0.9], [hx, 0.775], [0.5, 0.775], [0.5, 0.85], [-0.5, 0.85], [-0.5, 0.775], [-hx, 0.775], [-hx, -0.9], [-0.495, -0.9]], 0.008, 0.003); g.rotateX(HALF); g.translate(0, INT_YF - 0.004, 0); return g; })();
  const mat = (s, n, z) => intPart(`Vloermat ${n}`, bx(0.4, 0.008, 0.52, 0.003, [s * 0.38, INT_YF + 0.004, z]), MAT.rubber, 'Losse rubber vloermat in de voetruimte.', { ex: [0, 0.12, 0.1] });
  const sill = s => intPart(`Instaplijst ${sideName(s)}`, bx(0.09, 0.012, 1.3, 0.004, [s * 0.575, 0.262, 0.07]), MAT.plasticGrey, 'Kunststof dorpellijst bij het instappen.', { ex: [s * 0.1, 0.05, 0] });
  // bagageruimte: vloer tussen de wielkasten (tot |x| 0,495, 5 mm binnen de wand van de wielkast, met een uitsparing tot |x| 0,461 om de veerkoker vanaf z -1,205: de afronding van de binnenhoek (straal 29 mm) bolt in de uitsparing uit en sneed de achterste zijplaat), afdekplaat (hoedenplank) boven de bagage
  const bootFloor = (() => { const g = roundPlate([[-0.6, -1.63], [0.6, -1.63], [0.6, -1.52], [0.495, -1.52], [0.495, -1.205], [0.461, -1.205], [0.461, -1.02], [-0.461, -1.02], [-0.461, -1.205], [-0.495, -1.205], [-0.495, -1.52], [-0.6, -1.52]], 0.015, 0.004); g.rotateX(HALF); g.translate(0, 0.4625, 0); return g; })();
  const plankY = 0.85, plankZ0 = -1.075, plankZ1 = -1.625, plankHW = (z) => surfX(z, plankY) - 0.05;
  const plankGeo = (() => { const hw0 = plankHW(plankZ0), hw1 = plankHW(plankZ1), zc = (plankZ0 + plankZ1) / 2, hd = (plankZ0 - plankZ1) / 2;
    const g = roundPlate([[-hw1, -hd], [hw1, -hd], [hw0, hd], [-hw0, hd]], 0.012, 0.004); g.rotateX(HALF); return g; })();
  const tgNode = NODES.find(n => n.name === 'Achterklep'), tgOpen = !!(tgNode && tgNode.opn);
  const plankOpen = tgOpen ? { open: intFollow(intPath('Achterklep'), [0, plankY, plankZ0], [1, 0, 0], 0.55, 0.46) } : {};
  const plankHide = ['Rugleuning groot deel', 'Rugleuning klein deel'];
  const uit = n => { n.hideWhen = plankHide; return n; };
  const hw0 = plankHW(plankZ0), hw1 = plankHW(plankZ1), pc = (plankZ0 + plankZ1) / 2;
  const cords = [1, -1].map(s => {
    const a = [s * (hw1 - 0.05), plankY + 0.006, plankZ1 + 0.03], b = [s * 0.5, 0.98, -1.57], dir = V3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), L = dir.length();
    const o = { d: 'Koordje dat de hoedenplank aan de achterklep hangt (plaats geschat): een dun nylon koord van de achterhoek van de plank naar de binnenkant van de klep, dat strak komt als de klep omhoog gaat.', p: a, q: quatFromTo(V3(0, 0, 1), dir), ex: [s * 0.1, 0.1, -0.1] };
    if (tgOpen) o.strut = { a: { node: 'Hoedenplank', p: [s * (hw1 - 0.05), 0.006, plankZ1 + 0.03 - pc] }, b: { node: intPath('Achterklep'), p: b }, rod: 'Koordstuk', lead: intPath('Achterklep'), restLen: L };
    return uit(A(`Hoedenplankkoord ${sideName(s)}`, o, [
      intPart('Koordhuls', merge([xf(G.cyl('z', 0.0028, 0.0028, L * 0.5, 6), [0, 0, L * 0.25]), G.sphere(0.007, 8)]), MAT.fabric, 'Koordhuls met oog aan de hoedenplank.', { ex: [0, 0.04, -0.04] }),
      intPart('Koordstuk', merge([xf(G.cyl('z', 0.0022, 0.0022, L * 0.5, 6), [0, 0, L * 0.75]), xf(G.sphere(0.006, 8), [0, 0, L])]), MAT.fabric, 'Beweegbaar deel van het koordje met oog aan de achterklep.', { ex: [0, 0.04, 0.04] }),
    ]));
  });
  const boot = A('Bagageruimte', { d: 'Bagageruimte met vloer tussen de wielkasten, zijbekleding in vilt, wielkastbekleding, de afdekplaat (hoedenplank) en de achterwandbekleding.', ex: [0, 0.0, -0.3] }, [
    intPart('Bagagevloer', bootFloor, MAT.carpet, 'Vloerplaat met tapijt van de bagageruimte, tussen de achterwielkasten.', { ex: [0, -0.1, -0.1] }),
    intPart('Achterwandbekleding', bx(1.2, 0.34, 0.012, 0.004, [0, 0.68, -1.64]), MAT.intFelt, 'Bekleding van het achterpaneel onder de achterklep.', { ex: [0, 0, -0.2] }),
    ...[1, -1].map(bootSide), ...[1, -1].map(wheelCover),
    uit(intPart('Hoedenplank', plankGeo, MAT.intFelt, 'Afdekplaat achter de achterbank boven de bagageruimte; hangt met koordjes aan de achterklep en komt mee omhoog als die opent (geschat 31 graden). Wordt uitgenomen als een rugleuning achter neerklapt.', Object.assign({ p: [0, plankY, pc], ex: [0, 0.3, -0.2] }, plankOpen))),
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
      intPart('Vloerbedekking', carpet, MAT.carpet, 'Vloerbedekking in een stuk over de voetruimte en onder de achterbank.', { ex: [0, -0.22, 0] }),
      mat(1, 'bestuurder', 0.52), mat(-1, 'passagier', 0.52),
      intPart('Vloermat achter', bx(0.7, 0.008, 0.3, 0.003, [0, INT_YF + 0.004, -0.74]), MAT.rubber, 'Losse rubber vloermat achter de voorstoelen.', { ex: [0, 0.1, -0.1] }),
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
  return A('Interieur', { d: 'Interieur van de Twist: stoffen stoelen, dashboard met instrumenten, stuurwiel, pedalen, console met radio en kachelbediening, bekleding en bagageruimte met afdekplaat.', ex: [0, 0.66, 0] }, [intDashboard(), intSteering(), intPedals(), intConsole(), seats, intTrim(), intMirror()]);
}
