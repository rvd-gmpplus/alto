/* ===================== carrosserie: onderdelen ===================== */
// Panelen zijn stukken van het parametrische oppervlak uit body.js: onderbak in (z, s), kas in (z, q), eindvlakken in (x, y).
// Rode lak (Bright Red 2, aannemelijk), effen: geen metallic. Bumpers, spiegels en grepen van de GA-uitvoering zijn zwart kunststof.
MAT.paint.color.setHex(0xa8161f); MAT.paint.metalness = 0.04; MAT.paint.roughness = 0.4; MAT.paint.clearcoat = 0.05; MAT.paint.clearcoatRoughness = 0.55; MAT.paint.envMapIntensity = 0.22; MAT.paint.specularIntensity = 0.12;
// Lak: nauwelijks clearcoat en een lage speculariteit (f90 van een diëlektricum is gelijk aan specularIntensity, dus ook de reflectie onder een flauwe hoek blijft laag), en een iets
// diepere basiskleur: de heldere plafondlichten van de omgeving spoelden bijna horizontale vlakken (kap, neus) uit tot roze. Verzadiging kap gedeeld door scherm vanuit de lage blik
// van de eigenaar (GPU, DPR 2): 0,65 donker en 0,73 licht (was 0,30 en 0,36).
MAT.paintIn.color.setHex(0x7a2025); MAT.paintIn.metalness = 0; MAT.paintIn.roughness = 0.85; MAT.paintIn.envMapIntensity = 0.25;
// ruiten: licht getint autoglas (de 2001-uitvoering heeft geen donker privacyglas)
MAT.lensClear.opacity = 0.26; MAT.lensClear.color.setHex(0xb9c6d0);
MAT.glass.color.setHex(0x0d161c); MAT.glass.opacity = 0.8; MAT.glass.envMapIntensity = 0.35; MAT.glass.roughness = 0.06;
std('bodBumper', 0x2b2d31, 0, 0.72);                                       // ongelakt kunststof van de GA-bumpers
std('bodShield', 0x232529, 0, 0.8, { envMapIntensity: 0.12 });              // afscherming onder de bumper: donker antraciet, nauwelijks omgevingsweerkaatsing (de onderzijde las anders als grijs); 0x232529 geeft 0,55 tot 0,74 keer het luchtrooster (0x060607 gaf 0,28 tot 0,34 en las als zwarte plank)
std('bodLiner', 0x1a1b1e, 0, 0.9);                                         // zwarte kunststof bekleding van de wielkasten
std('bodBlack', 0x0f1012, 0, 0.62);                                        // zwart kunststof: spiegels, grepen, wissers
std('bodPillar', 0x060607, 0, 0.8, { envMapIntensity: 0.12 });             // zwart rubber en kader
std('bodPillarGloss', 0x08090b, 0.05, 0.3, { envMapIntensity: 0.35 });     // hoogglans zwarte B-stijl
std('bodChrome', 0xa9b0b7, 1, 0.06, { envMapIntensity: 2.1 });
std('bodHoney', 0x131519, 0, 0.9, { envMapIntensity: 0.1 });           // honingraatgrille
std('bodMirror', 0xb4bec6, 1, 0.04, { envMapIntensity: 1.1 });
std('bodSeal', 0x151618, 0, 0.9);
std('bodEmblem', 0x26292e, 0, 0.85, { envMapIntensity: 0.12 });          // embleem 2001: graphietgrijs, mat (ruw 0,85): minder kijkhoekafhankelijk dan het vorige donkere, glanzende (0,55 tot 1,6 keer het gaas, nu 0,8 tot 1,9); op het gaas hoogstens twee keer zo helder
std('bodAmber', 0xe05a08, 0, 0.42, { emissive: 0x4d1c00, emissiveIntensity: 0.3, envMapIntensity: 0.3 });   // oranje knipperlichtlens: echt oranje, niet bleekgeel
std('bodPlate', 0xffffff, 0.05, 0.42);                                     // Nederlandse plaat: geel met zwarte rand, blauwe EU-strook en streepjes (map volgt in bodPlateTex)
std('bodLamp', 0xc4c9ce, 0.3, 0.42, { envMapIntensity: 0.7 });                                       // binnenkant van de koplamp: twee verchroomde reflectorbakken (map volgt in bodLampTex)
phys('bodLens', { color: 0xe4edf5, metalness: 0, roughness: 0.03, transparent: true, opacity: 0.10, depthWrite: false, envMapIntensity: 0.6, clearcoat: 0.5, clearcoatRoughness: 0.04, side: THREE.FrontSide });   // helder koplampglas: aan de buitenkant gezien (FrontSide), dunner dan lensClear zodat de reflector zichtbaar blijft
phys('bodLensRib', { color: 0xe4edf5, metalness: 0, roughness: 0.03, transparent: true, opacity: 0.10, depthWrite: false, envMapIntensity: 0.6, clearcoat: 0.5, clearcoatRoughness: 0.04, side: THREE.FrontSide });   // hoofdlens met ribbelnormaal (prismaglas); de map volgt in bodHeadlamp
std('bodLampC', 0x9a9fa5, 0.3, 0.45, { envMapIntensity: 0.25 });          // hoekreflector: dezelfde map als de hoofdreflector, maar donkerder en minder weerkaatsend (de hoekkap zit schuin op de omgeving en las als witte vlek)
std('bodLampRim', 0x2a2c30, 0, 0.5, { envMapIntensity: 0.2 });           // lamprand tussen hoofdlens en hoekkap: donkergrijs kunststof met een lichte glans, geen zwart gat
std('bodRefl', 0x5f656c, 0.7, 0.5);                                    // reflectorschaal achter helder glas (donkerder dan spiegelend chroom)
const bodBoth = f => [1, -1].map(f);
const bodSn = s => sideName(s);
const bodPp = (s, sv) => (s > 0 ? sv : 2 - sv);                         // s van de linkerhelft naar p voor zijde s
const bodDense = (a, b, n) => { const out = []; for (let i = 1; i < n; i++) out.push(a + (b - a) * i / n); return out; };
const bodQy = (z, y) => { const g = bodGh(z); return clamp((y - g.yb) / Math.max(1e-6, g.ye - g.yb), 0, 1) * bodQS; };   // q op de zijwand bij hoogte y
// punt op de onderbak (linkerhelft) op hoogte y met verschuiving langs de normaal (out > 0 = naar buiten)
function bodAt(z, y, out = 0) { const sv = sAtY(z, y), [x, yy] = halfPt(z, sv), n = bodN(z, sv); return [x + n[0] * out, yy + n[1] * out, z + n[2] * out]; }
// kaspunt (linkerhelft) bij (z, q) met verschuiving naar buiten
function bodGhAt(z, q, out = 0) { const [x, y] = bodGhHalf(z, q); return [x + out, y + (q > bodQS ? out * 0.6 : 0), z]; }
// lijst op de huid van de onderbak tussen y0 en y1 en z zA..zB; hgt = hoogte van het profiel boven de huid; de uiteinden lopen in de huid weg
function bodMould(s, y0, y1, zA, zB, hgt, nz = 36, nv = 6) {
  return patch((z, t) => {
    const e = sstep((z - zA) / 0.05) * sstep((zB - z) / 0.05), o = hgt * e * Math.pow(Math.sin(PI * t), 0.6) - 0.001;
    const p = bodAt(z, y0 + (y1 - y0) * t, o); return [s * p[0], p[1], p[2]];
  }, zA, zB, nz, () => [0, 1], nv);
}
// rand (rubber) rond een ruit: gesloten buis langs de ruitrand, qLo(z) onderrand, qHi(z) bovenrand, tussen z0 en z1
function bodRim(s, z0, z1, qLo, qHi, r = 0.0045, out = 0.003, n = 26, open = false) {
  const at = (z, q) => { const p = bodGhAt(z, q, out); return [s * p[0], p[1], p[2]]; }, pts = [];
  if (!open) for (let i = 0; i <= n; i++) { const z = z0 + (z1 - z0) * i / n; pts.push(at(z, qLo(z))); }
  else pts.push(at(z0, qLo(z0)));
  for (let i = n; i >= 0; i--) { const z = z0 + (z1 - z0) * i / n; pts.push(at(z, qHi(z))); }
  if (open) pts.push(at(z1, qLo(z1)));
  return tube(pts, r, 120, 5, !open);
}
// z waar de hartlijn van het dek op het voorvlak hoogte y heeft (z > 1,6, de neus loopt steil omlaag)
function bodZAtYd(y) { let lo = 1.6, hi = ZF; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (YT(m) + bodC(m) > y) lo = m; else hi = m; } return (lo + hi) / 2; }
/* ---------- naden en grenzen (links; rechts gespiegeld) ---------- */
const bodZDF = 0.78, bodZDR = -0.56;              // voorrand en achterrand van het portier
const bodYSill = 0.268;                            // onderrand portier; de dorpel eindigt 6 mm lager
const bodZFe = 1.54, bodZLh = 1.60;                // achterrand koplamp (voorscherm tot hier), voorrand motorkap
const bodZCe = bodZLh - 0.008;                       // einde van het hoekstuk en de bovenstrook van het scherm: 8 mm voor de voorrand van de motorkap (was 15 mm: in dicht-lamp-zij sprong de rode rand ongeveer 3 mm en lag de kaprand als donkere wig onder het glas)
const bodYBF = 0.50, bodYBR = 0.575;                // bovenrand van de voor- en achterbumper op de flank
const bodZT0 = -1.62;                              // voorrand achterlicht en bumperhoek achter
const bodZHB = 0.917;                              // achterrand motorkap
// Motorkap: halve breedte, met een afgeronde voorhoek (straal bodHoodR) in bovenaanzicht; de rand loopt via een kwartcirkel naar de voorrand bij bodZLh
const bodHoodR = 0.07;
const bodHoodX0 = z => 0.62 - 0.07 * sstep((z - 1.2) / 0.4);
const bodHoodX = z => {
  const z0 = bodZLh - bodHoodR; if (z <= z0) return bodHoodX0(z);
  const dz = Math.min(z - z0, bodHoodR); return bodHoodX0(z0) - bodHoodR + Math.sqrt(bodHoodR * bodHoodR - dz * dz);
};
// extra onderverdeling voor de voorhoek van de kap: gelijke hoekstappen, dus gelijke boogstappen
const bodHoodArcZ = (n = 14) => Array.from({ length: n }, (_, k) => bodZLh - bodHoodR + bodHoodR * Math.sin((k + 1) / n * HALF)).filter(z => z < bodZLh - 1e-4);
/* ---------- gedeelde grenzen van de voorkant (links; rechts gespiegeld) ----------
   De echte voorkant is één band van ca. 130 mm: koplamp, lichaamskleurig paneel met een smalle gaasstrook, koplamp. Alle onderdelen van die band
   (lamp, paneel, grille, bumper, scherm, kap) lezen hun grenzen uit deze constanten, zodat er geen naden met eigen getallen ontstaan. */
const bodXP = 0.355;                              // halve breedte van het paneel: grens paneel en lamp
const bodXG = 0.325;                              // halve breedte van de gaasopening
const bodYG0 = 0.637, bodYG1 = 0.713;             // onder- en bovenrand van de gaasopening (76 mm hoog, breedte 650 mm: verhouding 8,5)
const bodYBT = z => 0.60 + 0.012 * sstep((z - 1.43) / 0.23);   // bovenrand bumper = onderrand lamp, paneel en scherm: vrijwel waterpas (0,600 op de flank, 0,612 op de neus), zoals op foto F1; een schuine lijn gaf de hoekkap een hoektand
const bodTuck = 0.005;                            // het onderliggende deel loopt zoveel onder het bovenliggende
const bodArchLo = (z, az, yOut) => (Math.abs(z - az) <= ARCH ? archS(z) : sAtY(z, yOut(z)));   // onderrand van een paneel boven de boog
// kas: bovenrand zijruit, onderrand voorruit en achterruit (zijkant), schuine achterrand van de hoekruit
const bodQGl = z => Math.max(bodQy(z, YT(z) + 0.013) + 1e-4, bodQy(z, bodGh(z).ye - 0.03));
const bodQLoW = z => bodQAtX(z, bodGh(z).xr - 0.04);
const bodQLoH = z => bodQAtX(z, bodGh(z).xr - 0.05);
const bodQSlant = z => bodQy(z, YT(z) + 0.013) + clamp((z + 1.17) / 0.10, 0, 1) * 0.5;
const bodZW0 = 0.16, bodZW1 = 0.875;               // voorruit: bovenrand en onderrand
const bodZH0 = -1.20, bodZH1 = -1.64;              // achterruit: bovenrand en onderrand
const bodZGR = -1.17;
const bodTkZ = [-1.52, -1.38], bodTkY = [0.66, 0.78];   // opening van de tankklep in het rechter achterscherm                              // voorrand achterklep (achterrand dak)

/* ---------- wielkast: binnenscherm en bekleding ---------- */
const WH_AE = 0.34;   // hoek (radialen, ongeveer 19 graden) waarover de koker onder de boog doorloopt (0,26 liet bij de bumperhoek nog het sproeierreservoir zien)
// Binnenscherm van de wielkast: een wand op |x| 0,50 en een koker (dak) tot |x| 0,68. De wand begint pas op yb: eronder lopen de
// aandrijfas, de stuurstangen, de draagarmen en de achteras vrij door (golf 2: ze doorboorden de wand). Voor staat een inkeping
// (halve breedte hw, tot x 0,58) voor de veerpoot, die door de wand en het dak naar de veerpoottoren loopt.
function bodWheelHouse(s, az, yb = 0.21, hw = 0, xn = 0.58, ae = 0, dEnd = 0.20) {
  const R = ARCH + 0.012, xin = 0.50, a0 = Math.asin((yb - AY) / R), c0 = R * Math.cos(a0), V = (z, y) => new THREE.Vector2(z, y);
  const arcPt = a => V(az + R * Math.cos(a), AY + R * Math.sin(a)), N = 12;
  // buitenrand van de koker: de binnenkant van het scherm op de boogrand (1 mm erachter), in plaats van een vaste |x| 0,68: het scherm begint op |x| 0,70 tot 0,747 en het Schutbord
  // (tot |x| 0,69) lichtte als donkerrode sikkel op in de spleet tussen koker en scherm
  const xo = a => { const q = arcPt(a); return Math.max(xin + 0.05, ringX(q.x, q.y) - 0.001); };
  const half = (zA, aA, zB, aB) => {   // stuk wand tussen twee hoeken op de boog, onderrand yb
    const pts = [V(zA, yb)]; for (let k = 0; k <= N; k++) pts.push(arcPt(aA + (aB - aA) * k / N)); pts.push(V(zB, yb)); return pts;
  };
  const aN = hw > 0 ? Math.acos(hw / R) : 0;
  // de inkeping in de wand volgt de schroefveer (z 1,047 tot 1,144, vanaf y 0,474) in plaats van de veerpoottoren (z 1,017 tot 1,157): breder liet schuin de motorruimte zien (de rembekrachtiger);
  // onder y 0,46 is de wand dicht; achter de inkeping staat een schot (x 0,46, 14 mm achter de veer) dat de blik tot y 0,555 opvangt (daarboven staat de veerpoottoren). Het dak (de koker) houdt de volle inkeping van de toren (hw).
  const wl = 0.05, wr = 0.067, yn = 0.46, xb = 0.46;   // xb: vlak van het schot achter de inkeping
  const polys = hw > 0 ? [(() => {
    const aR = Math.acos(wr / R), aL = Math.acos(-wl / R), pts = [V(az + c0, yb)];
    for (let k = 0; k <= N; k++) pts.push(arcPt(a0 + (aR - a0) * k / N));
    pts.push(V(az + wr, yn), V(az - wl, yn));
    for (let k = 0; k <= N; k++) pts.push(arcPt(aL + (PI - a0 - aL) * k / N));
    pts.push(V(az - c0, yb)); return pts;
  })()] : [half(az + c0, a0, az - c0, PI - a0)];
  // sluitstukken: aan beide einden van de boog loopt de bekleding onder yb door tot hoek -ae (en PI + ae), alleen waar |z - az| groter is dan dEnd: daar kruist geen aandrijfas,
  // stuurstang of draagarm de wand. Zonder deze stukken bleef onder de boog een sleuf waardoor je schuin de motorruimte en de cabine zag.
  if (ae > 0) {
    const eP = (aA, aB, dz) => { const pts = [V(az + dz, yb)], n = 8; for (let k = 0; k <= n; k++) pts.push(arcPt(aA + (aB - aA) * k / n)); pts.push(V(az + dz, AY + R * Math.sin(aB))); return pts; };
    const eW = Math.asin((AY - 0.245) / R);   // de wand loopt tot y 0,245: lager ligt de stabilisatorstang (y 0,227) in het vlak x 0,50; de koker (x 0,50 tot het scherm) loopt door tot -ae
    polys.push(eP(a0, -eW, dEnd), eP(PI - a0, PI + eW, -dEnd));
  }
  const wall = merge(polys.map(pp => { const g = new THREE.ShapeGeometry(new THREE.Shape(pp), 1); g.rotateY(-HALF); g.translate(s * xin, 0, 0); return g; }));
  const inN = a => (hw > 0 && a > aN && a < PI - aN) ? (xn - xin) / (xo(a) - xin) : 0;
  const arc = patch((a, t) => [s * lerp(xin, xo(a), t), AY + R * Math.sin(a), az + R * Math.cos(a)], a0 - ae, PI - a0 + ae, 28 + Math.round(ae / 0.0436), a => [inN(a), 1], 3, hw > 0 ? [aN - 1e-4, aN + 1e-4, PI - aN - 1e-4, PI - aN + 1e-4] : []);
  // Platen in een vlak x = constant: het veelhoekpunt is (z, y), het vlak wordt op s * x gezet.
  const plaat = (pts, x) => { const g = new THREE.ShapeGeometry(new THREE.Shape(pts.map(([z, y]) => V(z, y))), 1); g.rotateY(-HALF); g.translate(s * x, 0, 0); return g; };
  const extra = [];
  let schot = null;
  if (hw > 0) {
    // Venster boven de band (poort `wielkast venster boven de band`): het schot loopt over de volle breedte van de inkeping (z tot az plus en min hw) en tot 15 mm in de veerpoottoren (y 0,635), en een bak van drie dunne platen
    // (buitenplaat op x xn, voorplaat en achterplaat tussen x xb en xn) sluit de inkeping van de koker. Schuine blikken kwamen anders langs het schot of door de koker heen. De voorplaat staat op z az + hw + 0,0165 (1,1785):
    // 2,5 mm achter de remslang (tot z 1,175) en 2,5 mm voor de motorsteunbeugel rechts (vanaf z 1,182).
    const zr = az - hw - 0.004, zf = az + hw + 0.0165, t = 0.002, y0 = yn - 0.01, hh = 0.635 - y0, xm = (xb + xn) / 2;
    schot = plaat([[zr, y0], [zf, y0], [zf, 0.635], [zr, 0.635]], xb);
    extra.push(xf(new THREE.BoxGeometry(t, 0.08, zf - zr), [s * xn, 0.595, (zr + zf) / 2]), xf(new THREE.BoxGeometry(xn - xb, hh, t), [s * xm, y0 + hh / 2, zr]), xf(new THREE.BoxGeometry(xn - xb, hh, t), [s * xm, y0 + hh / 2, zf]));
    // Gaten onderin de boog (poort `wielkast gat onder de boog`): sluitplaten voor en achter de band. Buitenplaten vlak binnen de huid (x 0,645 voor, x 0,625 achter) volgen de band op 6 mm (straal 0,2666 + 0,006);
    // de band mag er niet binnen 5 mm van komen (poort `wielkastbekleding raakt onderstel en aandrijving niet`). Voor: z tot 1,435 (de bumperschaal begint op z 1,446, de onderplaat op 1,443). Achter: z vanaf 0,70 en tot y 0,50 (de buitenplaat moet er zijn: de instaplijst staat op z 0,716 en schemert er anders doorheen).
    // De binnenplaat achter de band begint op de wielboog zelf (zA: de rand van het scherm, straal ARCH) en niet in de voetruimte: bij een open portier stonden hij en de wandplaat 9 tot 11 cm in de cabine (Voetsteun ingeklemd, vloermat afgesneden).
    // De wandplaat achter (x 0,50, z 0,68 tot az min dEnd) is vervallen: binnen de boog dekken wand en sluitstuk dat vlak al, en daarbuiten stond hij in de voetruimte en verborg hij de koppelingspedaalarm.
    const zA = y => az - Math.sqrt(ARCH * ARCH - (y - AY) * (y - AY)) + 0.002;
    const RB = 0.2666 + 0.006, ar = y => Math.sqrt(RB * RB - (y - AY) * (y - AY)), ys = [0.245, 0.26, 0.28, 0.30, 0.32, 0.34, 0.36, 0.38, 0.40, 0.42], ys2 = [...ys, 0.45, 0.48, 0.50];
    extra.push(plaat([...ys.map(y => [az + ar(y), y]), [az + ar(0.42), 0.60], [1.435, 0.60], [1.435, 0.245]], 0.645));
    extra.push(plaat([[0.70, 0.245], ...ys2.map(y => [az - ar(y), y]), [0.70, 0.50]], 0.625));
    // Binnenplaat achter op x 0,572 (de band begint op x 0,595; 17 mm van de voetsteun): vangt de blik door de spleet van 6 mm tussen band en buitenplaat op naar de voetsteun en de vloerbedekking. Tot z 0,79 ligt de onderrand op y 0,2865
    // (3 mm boven de vloermat, die tot z 0,779 en y 0,282 loopt), daarachter op y 0,245 (daar loopt geen vloermat meer; de vloerbedekking ligt dan op x 0,50).
    extra.push(plaat([[0.79, 0.2865], [0.79, 0.245], [0.90, 0.245], [0.90, 0.50], ...[0.50, 0.48, 0.45, 0.42, 0.40, 0.38, 0.36, 0.34, 0.32, 0.30, 0.2865].map(y => [zA(y), y])], 0.572));
    // Platen in het wandvlak tussen het einde van de sluitstukken (z az plus en min dEnd) en de bumper of de portierstijl; voor eindigt op z 1,427 omdat het sproeierreservoir (x 0,50 tot 0,61) op z 1,43 begint.
    // Strook onder de voetsteun (y 0,245 tot 0,26, x 0,50, z 0,68 tot 0,80): sluit de blik onder de drempel door naar de instaplijst aan de overkant (rondgang baanm-r2.0-h0.23-a-60); hoger zou de voetsteun en de koppelingspedaalarm van buiten verbergen.
    extra.push(plaat([[0.68, 0.245], [0.80, 0.245], [0.80, 0.26], [0.68, 0.26]], xin));
    extra.push(plaat([[1.30, 0.245], [1.427, 0.245], [1.427, 0.485], [1.30, 0.485]], xin));
    // Verlenging voor tot z 1,50 in de lage strook onder het sproeierreservoir (y 0,32), in twee delen met de onderplaat van de bumper (y 0,265) ertussen (2 mm vrij): de blik onder de zijrand van de bumper door bereikt de langsligger en het koppelingshuis niet meer.
    extra.push(plaat([[1.427, 0.245], [1.50, 0.245], [1.50, 0.2628], [1.427, 0.2628]], xin), plaat([[1.427, 0.2672], [1.50, 0.2672], [1.50, 0.315], [1.427, 0.315]], xin));
  }
  return merge(schot ? [wall, arc, schot, ...extra] : [wall, arc]);
}
/* ---------- carrosserieschil ---------- */
function bodSkinParts() {
  const kids = [];
  // voorscherm: van de portierspleet tot de koplamp, boven de wielboog, met de strook langs de motorkap
  const fenderHi = z => bodSAtX(z, bodHoodX(z) + 0.004);
  const fenderLo = z => bodArchLo(z, AXF, zz => (zz > AXF ? bodYBT(zz) + 0.003 : bodYSill + 0.004));
  // hoekstuk boven de lamp: tussen bovenrand lamp (3 mm bedekt) en kaprand, van bodZFe tot waar de lamp zelf onder de kap loopt
  // De onderrand ligt 6 mm onder de waterpas lopende lampbovenrand (bodHoodFrontY, 0,745) en blijft daar tot de strook (schermhoogte min 1,5 mm) hem inhaalt: de lamprand volgt achter z 1,572
  // de kaplijn omlaag en gaf met lampbovenrand min 6 mm een rood tandje van 5 mm onder de kaprand en een treetje naar de kaprand. Nu loopt de onderrand gelijk met de kaprand (verschil hoogstens 2 mm).
  const fenderCLo = z => Math.min(sAtY(z, bodHoodFrontY - 0.006), fenderHi(z) - 0.0015);
  const fenderTop = s => lowSide(s, bodZDF + 0.004, bodZCe, 70, z => [bodSAtX(z, bodHoodX(z) + 0.007), bodSAtX(z, bodHoodX(z) + 0.0005)], 2, undefined, 0.003);
  const fender = s => P(`Voorscherm ${bodSn(s)}`, merge([lowSide(s, bodZDF + 0.004, bodZFe, 44, z => [fenderLo(z), fenderHi(z)], 18, ARCH_BREAKS), lowSide(s, bodZFe - 0.002, bodZCe, 12, z => [fenderCLo(z), fenderHi(z)], 6), fenderTop(s)]), MAT.paint,
    { d: 'Voorscherm van plaatstaal met de uitsparing voor het voorwiel, gelakt in het rood. Zit met bouten aan de A-stijl, de veerpoottoren en de voorkopplaat.', ex: [s * 0.46, 0.06, 0.1] });
  // achterscherm: van de portierspleet tot het achterlicht, boven de wielboog, tot de schouderlijn
  // Onderrand boven de achterboog met een epsilon: bodArchLo en archS vergelijken |z - AXR| exact met ARCH, en op de breekkolom z = AXR - ARCH geeft de afronding
  // 0,30000000000000004; dan lag de onderrand daar op de bumperlijn (0,578) in plaats van op de boog, en links (kolommen 22 mm uit elkaar) bleef achter de boog een driehoek
  // zonder huid. De extra breekkolommen QB laten de rand de boog aan het achtereinde volgen (een koorde van 22 mm zakte tot 2 cm onder de boog).
  const quarterLo = z => { const dz = Math.abs(z - AXR); return dz <= ARCH + 1e-9 ? sAtY(z, AY + Math.sqrt(Math.max(0, ARCH * ARCH - dz * dz))) : sAtY(z, z > AXR ? bodYSill + 0.004 : bodYBR + 0.003); };
  const QB = ARCH_BREAKS.concat([AXR - ARCH + 0.004, AXR - ARCH + 0.010, AXR - ARCH + 0.020]);
  const quarterGeo = s => {
    if (s > 0) return lowSide(s, bodZT0, bodZDR - 0.004, 46, z => [quarterLo(z), S4], 18, QB);
    const [k0, k1] = bodTkZ, [y0, y1] = bodTkY;   // rechts: opening voor de tankklep
    return merge([lowSide(s, bodZT0, k0, 12, z => [quarterLo(z), S4], 12, QB), lowSide(s, k1, bodZDR - 0.004, 30, z => [quarterLo(z), S4], 14, QB),
      lowSide(s, k0, k1, 6, z => [quarterLo(z), sAtY(z, y0)], 6), lowSide(s, k0, k1, 6, z => [sAtY(z, y1), S4], 4)]);
  };
  const quarter = s => P(`Achterscherm ${bodSn(s)}`, quarterGeo(s), MAT.paint,
    { d: 'Achterscherm: de zijwand achter het portier, met de wielboog, de schouder en de plaats voor het achterlicht. Aan het dak, de vloer en het achterpaneel gelast.' + (s < 0 ? ' Rechts met de opening voor de tankklep.' : ''), ex: [s * 0.46, 0.04, -0.14] });
  const rails = s => P(`Dakrand ${bodSn(s)}`, bodGhSide(s, bodZGR + 0.10, bodZW0, 36, z => [bodQGl(z), bodQR], 8), MAT.paint,
    { d: 'Dakrand (dakligger) boven de portieren en de hoekruit, gelakt in het rood; de ruitrubbers sluiten er onderlangs op aan. De dakrails (Twist) staan er los bovenop.', ex: [s * 0.1, 0.06, 0] });
  const aPillar = s => P(`A-stijl ${bodSn(s)}`, merge([
    bodGhSide(s, bodZDF + 0.004, bodZW1 + 0.03, 12, z => [0.004, bodQLoW(Math.min(z, bodZW1))], 6),
    bodGhSide(s, bodZW0, bodZDF + 0.004, 30, z => [bodQGl(z), bodQLoW(z)], 5),
  ]), MAT.paint, { d: 'Voorste dakstijl langs de voorruit, hellend naar achteren; gelakt in het rood. Het deel voor het portier loopt door tot de gordellijn.', ex: [s * 0.1, 0.06, 0.06] });
  // B-stijl: hoogglans zwarte afdekking tussen portierruit en hoekruit (3-deurs: één brede stijl)
  const bPillar = s => P(`B-stijl ${bodSn(s)}`, bodGhSide(s, -0.74, bodZDR - 0.004, 10, z => [0.004, bodQGl(z)], 6, [], 0.0015), MAT.bodPillarGloss,
    { d: 'Zwarte afdekking op de middenstijl tussen portierruit en hoekruit; de sluitplaat van het portierslot zit erachter.', ex: [s * 0.1, 0.04, 0] });
  const cPillar = s => P(`C-stijl ${bodSn(s)}`, bodGhSide(s, BOD_ZG0, -1.07, 40, z => [z < bodZGR ? 0.004 : bodQSlant(z) + 0.004, bodQR], 12, bodDense(-1.27, -1.1, 6)), MAT.paint,
    { d: 'Achterste dakstijl die de hoekruit en de achterklep omlijst; schuin hellend naar de achterkant.', ex: [s * 0.1, 0.05, -0.1] });
  const qGlass = s => A(`Hoekruit ${bodSn(s)}`, { d: 'Vaste hoekruit achter het portier, in de carrosserie gelijmd en omlijst met zwart rubber.', ex: [s * 0.2, 0.06, -0.08] }, [
    P('Ruit', bodGhSide(s, -1.17, -0.74, 22, z => [bodQy(z, YT(z) + 0.013), Math.min(bodQGl(z), Math.max(bodQy(z, YT(z) + 0.013) + 1e-4, bodQSlant(z)))], 7, bodDense(-1.17, -1.07, 6), -0.003), MAT.glass,
      { d: 'Vast veiligheidsglas, licht getint.', ex: [s * 0.04, 0, 0] }),
    P('Rubber hoekruit', bodRim(s, -1.169, -0.741, z => bodQy(z, YT(z) + 0.013), z => Math.min(bodQGl(z), Math.max(bodQy(z, YT(z) + 0.013) + 1e-4, bodQSlant(z)))), MAT.bodSeal,
      { d: 'Zwart rubber dat de ruit in de sponning houdt en afdicht.', ex: [s * 0.06, 0.03, 0] }),
  ]);
  // afdekstrook achter de portierspleet (z 0,780 tot 0,784, tussen de voorrand van het portier en het scherm): een strook van 28 mm breed (z 0,768 tot 0,796) die 3 mm achter de huid meeloopt,
  // van y 0,30 tot onder de bovenrand. Zonder strook zag je door de spleet (3 tot 4 beeldpunten breed) het Schutbord en de zijkap van het dashboard; een vlak dwars op de spleet vangt de
  // schuine blikken niet die de spleet binnenkomen en pas bij z > 0,784 de huid van het scherm passeren. Zwart, zoals de spleet er in het echt uitziet.
  const flange = s => P(`Schermflens ${bodSn(s)}`, patch((y, t) => { const z = lerp(0.768, 0.796, t); return [s * (ringX(z, y) - 0.003), y, z]; }, 0.30, Math.min(0.90, bodSec(0.78).yd - 0.02), 12, () => [0, 1], 2), MAT.bodLiner,
    { d: 'Strook langs de achterrand van het voorscherm, achter de portierspleet: sluit de spleet tussen scherm en portier af, zodat je er niet in de motorruimte of de cabine kijkt.', ex: [s * 0.46, 0.06, 0.1] });
  kids.push(...bodBoth(fender), ...bodBoth(flange), ...bodBoth(quarter), ...bodBoth(rails), ...bodBoth(aPillar), ...bodBoth(bPillar), ...bodBoth(cPillar));
  return { kids, qGlass };
}
/* ---------- kas: dak, voorruit, achterruit ---------- */
// lus om een ruit op het dakvlak (dakdeel van de kas): z0..z1 en halve breedte via qLo(z)
function bodDeckRim(z0, z1, qLo, r = 0.005, out = 0.003) {
  const at = (z, w) => { const p = ghPt(z, w); return [p[0], p[1] + out, z]; }, pts = [], n = 24;
  for (let i = 0; i <= n; i++) { const z = z0 + (z1 - z0) * i / n; pts.push(at(z, qLo(z) / 2)); }
  for (let i = 0; i <= 8; i++) pts.push(at(z1, qLo(z1) / 2 + (1 - qLo(z1)) * i / 8));
  for (let i = n; i >= 0; i--) { const z = z0 + (z1 - z0) * i / n; pts.push(at(z, 1 - qLo(z) / 2)); }
  for (let i = 8; i >= 0; i--) pts.push(at(z0, qLo(z0) / 2 + (1 - qLo(z0)) * i / 8));
  return tube(pts, r, 160, 5, true);
}
function bodWindscreen() {
  return A('Voorruit', { d: 'Gelaagde voorruit met zwart rubber en een bandje in de bovenrand; de ruit is van getint veiligheidsglas.', ex: [0, 0.4, 0.4] }, [
    P('Voorruitglas', bodGhDeck(bodZW0, bodZW1, 30, bodQLoW, 22, [], -0.003), MAT.glass, { d: 'Gelaagd veiligheidsglas, licht getint, in de carrosserie gelijmd.', ex: [0, 0.08, 0.04] }),
    P('Voorruitrubber', bodDeckRim(bodZW0 + 0.002, bodZW1 - 0.002, z => bodQLoW(z) + 0.012, 0.0045), MAT.bodSeal, { d: 'Zwart sierrubber rondom de voorruit.', ex: [0, 0.05, 0.02] }),
  ]);
}
// stukken van de dakplaat, de waterkast en de klepdelen (geometrie)
const bodRoofGeo = () => bodGhDeck(bodZGR, bodZW0, 64, () => bodQR, 16);
const bodCowlGeo = () => merge([bodGhDeck(bodZW1, BOD_ZG1, 6, bodQLoW, 18), bodDeck(BOD_ZG1 - 0.004, bodZHB, 5, z => bodSAtX(z, bodHoodX(z) + 0.004), 14)]);
function bodTailSkinGeo(out = 0, zLow = BOD_ZG0) {
  return merge([bodGhDeck(bodZGR - 0.004, bodZH0, 5, () => bodQR, 14, [], out), bodGhDeck(zLow, bodZH1, 6, () => bodQR, 14, [], out),
    ...bodBoth(s => bodGhSide(s, bodZH1, bodZH0, 22, z => [bodQR, bodQLoH(z)], 3, [], out))]);
}
/* ---------- constructie: vloer, voorbouw, wielkasten ---------- */
function bodStructure() {
  const both = bodBoth, sn = bodSn;
  const floor = A('Vloer en dorpels', { d: 'Vloerplaat met dwarsbalken, de langsliggers achter en de dorpels onder de portieren.', ex: [0, -0.32, 0] }, [
    P('Bodemplaat', patch((z, p) => bodLow(z, p, 0.002), -1.62, 0.80, 60, z => { const l = z < AXR - ARCH ? S1 : (z < AXR + ARCH ? S1 * 0.102 / 0.14 * 0.14 : S1 * 0.55); return [-l, l]; }, 10, ARCH_BREAKS.concat([AXR - ARCH - 0.002, AXR - ARCH + 0.002])), MAT.underbody, { d: 'Gelaste vloerplaat van de ruwbouw met bevestigingspunten voor de stoelen en het onderstel.', ex: [0, -0.1, 0] }),
    P('Dwarsbalk voorstoelen', G.box(0.86, 0.05, 0.08), MAT.paintIn, { d: 'Dwarsbalk onder de voorstoelen die vloer en dorpels verbindt.', p: [0, 0.245, 0.15], ex: [0, 0.06, 0.04] }),
    P('Dwarsbalk achterbank', G.box(0.86, 0.05, 0.08), MAT.paintIn, { d: 'Dwarsbalk onder de achterbank, vóór de brandstoftank.', p: [0, 0.245, -0.92], ex: [0, 0.06, -0.04] }),
    ...both(s => P(`Langsligger achter ${sn(s)}`, G.box(0.05, 0.1, 0.62), MAT.paintIn, { d: 'Langsligger onder de bagageruimte die de achterbumperbalk draagt (plaats schematisch).', p: [s * 0.42, 0.34, -1.40], ex: [s * 0.06, -0.06, 0] })),
    ...both(s => bodSill(s)),
  ]);
  const front = A('Voorbouw', { d: 'Dragende voorbouw: langsliggers, veerpoottorens, schutbord, frontmodule en bumperbalk.', ex: [0, 0.05, 0.42] }, [
    ...both(s => P(`Langsligger voor ${sn(s)}`, G.box(0.05, 0.09, 0.80), MAT.paintIn, { d: 'Kokerprofiel in de motorruimte dat botsenergie opvangt (plaats en maten schematisch).', p: [s * 0.42, 0.33, 1.20], ex: [s * 0.08, 0, 0] })),
    // onderkant op y 0,62 (was 0,56): hij lag onder de bovenkant van de wielkastbekleding (y 0,577) en stak als rood blok boven de band uit in de wielkastcamera's van opzij
    ...both(s => P(`Veerpoottoren ${sn(s)}`, merge([G.cyl('y', 0.05, 0.07, 0.14, 24, true), xf(G.cyl('y', 0.05, 0.05, 0.006, 24), [0, 0.07, 0])]), MAT.paintIn, { d: 'Bevestigingspunt van de veerpoot in de carrosserie.', p: [s * 0.50, 0.69, AXF], ex: [s * 0.1, 0.06, 0] })),
    // onder y 0,58 loopt het schutbord alleen tot de wielkastwanden (|x| 0,50): daarbuiten zit het voorwiel (de band stak erdoorheen)
    P('Schutbord', cache('bodSchutbord', () => roundPlate([[-0.5, -0.3], [0.5, -0.3], [0.5, -0.02], [0.69, -0.02], [0.69, 0.3], [-0.69, 0.3], [-0.69, -0.02], [-0.5, -0.02]], 0.012, 0.004, 0.004)), MAT.paintIn, { d: 'Scheidingswand tussen motorruimte en interieur met doorvoeren voor stuurkolom, pedalen en kabelboom.', p: [0, 0.60, 0.86], ex: [0, 0, -0.08] }),
    P('Frontmodule', merge([xf(G.box(0.84, 0.05, 0.05), [0, 0.67, 0]), xf(G.box(1.0, 0.05, 0.05), [0, 0.33, 0]), xf(G.box(0.05, 0.36, 0.05), [0.33, 0.5, 0]), xf(G.box(0.05, 0.36, 0.05), [-0.33, 0.5, 0]), xf(G.box(0.05, 0.3, 0.05), [0, 0.5, 0])]), MAT.plastic, { d: 'Kunststof en stalen voorkopplaat die radiateur, koplampen en motorkapslot draagt.', p: [0, 0, 1.575], ex: [0, 0.04, 0.12] }),
    P('Motorkapslot', merge([G.rbox(0.07, 0.05, 0.04, 0.008), xf(G.rbox(0.02, 0.04, 0.015, 0.004), [0.04, 0.01, 0.015])]), MAT.darkSteel, { d: 'Slot op de voorkopplaat waarin de slotbeugel van de motorkap grijpt; ontgrendeling met een kabel vanuit het interieur.', p: [0, 0.682, 1.55], ex: [0, 0.06, 0.06] }),   // boven de bovenste waterkast van de radiateur (y 0,655); op y 0,625 zat het slot erin
    P('Bumperbalk voor', tube([-0.55, -0.35, -0.17, 0, 0.17, 0.35, 0.55].map(x => [x, 0.40, 1.655 - 0.12 * x * x]), 0.032, 24, 8), MAT.steel, { d: 'Gebogen stalen botsbalk achter de voorbumper.', ex: [0, 0, 0.1] }),
    ...both(s => bodWheelHousePart(s, true)),
  ]);
  const rear = A('Achterbouw', { d: 'Achterbouw: wielkasten, bumperbalk en de wand achter de achterbank.', ex: [0, 0.05, -0.4] }, [
    P('Bumperbalk achter', tube([-0.5, -0.3, -0.15, 0, 0.15, 0.3, 0.5].map(x => [x, 0.45, -1.665 + 0.12 * x * x]), 0.03, 24, 8), MAT.steel, { d: 'Stalen botsbalk achter de achterbumper.', ex: [0, 0, -0.1] }),
    ...both(s => bodWheelHousePart(s, false)),
  ]);
  return [floor, front, rear];
}
const bodWheelHousePart = (s, fr) => P(`Wielkast ${fr ? 'voor' : 'achter'} ${bodSn(s)}`, fr ? bodWheelHouse(s, AXF, 0.42, 0.075, 0.58, WH_AE) : bodWheelHouseAchter(s), MAT.bodLiner,
  { d: `Binnenscherm van de ${fr ? 'voor' : 'achter'}wielkast met zwarte kunststof bekleding: een halve koker om het wiel met een wand aan de binnenzijde, gelast aan langsligger, vloer en buitenscherm. ${fr ? 'De wand begint boven de aandrijfas, de draagarmen en de achteras; voor heeft hij een uitsparing waar de veerpoot naar de veerpoottoren loopt' : 'Achter loopt de wand ook onder de boog door, met ruimte voor torsiebalk, panhardstang en remslang, en wijkt hij bij de schroefveer in naar een veerkoker'}.`, ex: [s * 0.12, 0.04, 0] });
// Binnenscherm van de achterwielkast (open punt AWK): eigen functie, zodat de voorwielkast (bodWheelHouse met AXF) ongewijzigd blijft. Zelfde opbouw als voor
// (wand op |x| 0,50 boven yb, sluitstukken aan de boogeinden, koker tot de huid), met deze verschillen, elk tegen doorkijk naar het interieur door de achterboog:
// - de koker loopt aan beide einden verder omlaag: voor tot y 0,250 (was 0,398; de blik liep onder het vooreinde door naar de zijbekleding achter en de vloer), achter tot
//   y 0,280 links (boven de bodemplaat, 0,278) en 0,380 rechts (vulpijp en ontluchtingsslang lopen lager door het vlak van de koker);
// - de rand van de wand ligt 2 mm buiten de koker (straal R + 0,002): tussen de koorden van wand (12) en koker (48) bleef anders een spleet tot 0,4 mm;
// - het midden onder de boog is dicht (voor is het open voor de aandrijfas; achter loopt die niet), rond de asdelen met minstens 5 mm vrij: achter de as (z -1,448 tot -1,240)
//   tot y 0,245, rechts onder y 0,340 open voor de panhardbeugel; tussen torsiebalk en veer (z -1,240 tot -1,174) vanaf y 0,300 (torsiebalk tot 0,295); voor de veer een strook;
// - de schroefveer kruist het vlak x 0,50 (x 0,477 tot 0,575): daar wijkt de wand in naar een veerkoker (binnenplaat op |x| 0,466, zijplaten op z -1,174 en -1,056, dak
//   op y 0,477, 5 mm boven het veerrubber). De remslang loopt door de veerkoker naar buiten: doorvoeren in de wand, de achterste zijplaat en de binnenplaat.
function bodWheelHouseAchter(s) {
  const az = AXR, yb = 0.485, R = ARCH + 0.012, RW = R + 0.002, xin = 0.50, dEnd = 0.20, V = (z, y) => new THREE.Vector2(z, y), N = 12;
  const a0 = Math.asin((yb - AY) / R), c0 = R * Math.cos(a0);
  const arcPt = a => V(az + R * Math.cos(a), AY + R * Math.sin(a)), wPt = a => V(az + RW * Math.cos(a), AY + RW * Math.sin(a));
  const xo = a => { const q = arcPt(a); return Math.max(xin + 0.05, ringX(q.x, q.y) - 0.001); };
  const polys = [];
  { const pts = [V(az + c0, yb)]; for (let k = 0; k <= N; k++) pts.push(wPt(a0 + (PI - 2 * a0) * k / N)); pts.push(V(az - c0, yb)); polys.push(pts); }
  // sluitstukken aan de boogeinden (|z - az| > dEnd), tot y 0,245
  const eW = Math.asin((AY - 0.245) / R);
  const eP = (aA, aB, dz) => { const pts = [V(az + dz, yb)], n = 8; for (let k = 0; k <= n; k++) pts.push(wPt(aA + (aB - aA) * k / n)); pts.push(V(az + dz, AY + R * Math.sin(aB))); return pts; };
  polys.push(eP(a0, -eW, dEnd), eP(PI - a0, PI + eW, -dEnd));
  // midden achter de as: z -1,448 tot -1,240; rechts begint hij voor z -1,386 pas op y 0,340 (panhardbeugel as tot y 0,335, z -1,366 tot -1,191)
  polys.push(s > 0 ? [V(-1.240, 0.245), V(-1.240, yb), V(az - dEnd, yb), V(az - dEnd, 0.245)]
                   : [V(-1.240, 0.340), V(-1.240, yb), V(az - dEnd, yb), V(az - dEnd, 0.245), V(-1.386, 0.245), V(-1.386, 0.340)]);
  // tussen torsiebalk en veer: z -1,240 tot -1,174 vanaf y 0,300; links een doorvoer voor de remslang (die kruist het vlak bij y 0,349 tot 0,363, z -1,185 tot -1,171);
  // rechts vanaf y 0,380, ruim boven de panhardbeugel en de remslang
  polys.push(s > 0 ? [V(-1.240, 0.300), V(-1.174, 0.300), V(-1.174, 0.338), V(-1.192, 0.338), V(-1.192, 0.375), V(-1.174, 0.375), V(-1.174, yb), V(-1.240, yb)]
                   : [V(-1.240, 0.380), V(-1.174, 0.380), V(-1.174, yb), V(-1.240, yb)]);
  // boven de veerkoker (y 0,477 tot yb) en voor de veer (z -1,056 tot az + dEnd, y 0,245 tot 0,477; het veerpakket loopt tot z -1,061)
  polys.push([V(-1.174, 0.477), V(az + dEnd, 0.477), V(az + dEnd, yb), V(-1.174, yb)]);
  polys.push([V(-1.056, 0.245), V(az + dEnd, 0.245), V(az + dEnd, 0.477), V(-1.056, 0.477)]);
  const plaatX = (pts, x) => { const g = new THREE.ShapeGeometry(new THREE.Shape(pts), 1); g.rotateY(-HALF); g.translate(s * x, 0, 0); return g; };
  const wall = merge(polys.map(pp => plaatX(pp, xin)));
  // koker: van y 0,250 voor tot y 0,280 (links) of 0,380 (rechts) achter
  const aF = Math.asin((0.250 - AY) / R), aR = PI - Math.asin(((s > 0 ? 0.280 : 0.380) - AY) / R);
  const arc = patch((a, t) => [s * lerp(xin, xo(a), t), AY + R * Math.sin(a), az + R * Math.cos(a)], aF, aR, 48, () => [0, 1], 3, []);
  // veerkoker: binnenplaat op |x| 0,466 met onderrand 0,300 achter z -1,100 (torsiebalk) en 0,255 ervoor, met een doorvoer voor de remslang (die kruist |x| 0,466 bij
  // y 0,316 tot 0,338, z -1,158 tot -1,139)
  const xi = 0.466, yt = 0.477, z0 = -1.174, z1 = -1.056;
  const binnen = plaatX([V(z0, 0.300), V(-1.168, 0.300), V(-1.168, 0.352), V(-1.126, 0.352), V(-1.126, 0.300), V(-1.100, 0.300), V(-1.100, 0.255), V(z1, 0.255), V(z1, yt), V(z0, yt)], xi);
  // zijplaten in de vlakken z0 en z1 tussen |x| xi en xin; de achterste met een doorvoer aan de buitenrand (de remslang kruist z0 bij |x| 0,485 tot 0,50)
  const plaatZ = (pts, z) => { const g = new THREE.ShapeGeometry(new THREE.Shape(pts.map(([x, y]) => V(x, y))), 1); if (s < 0) g.scale(-1, 1, 1); g.translate(0, 0, z); return g; };
  const zijA = plaatZ([[xi, 0.300], [xin, 0.300], [xin, 0.336], [0.478, 0.336], [0.478, 0.375], [xin, 0.375], [xin, yt], [xi, yt]], z0);
  const zijV = plaatZ([[xi, 0.255], [xin, 0.255], [xin, yt], [xi, yt]], z1);
  const dak = (() => { const g = new THREE.PlaneGeometry(xin - xi, z1 - z0); g.rotateX(-HALF); g.translate(s * (xi + xin) / 2, yt, (z0 + z1) / 2); return g; })();
  return merge([wall, arc, binnen, zijA, zijV, dak]);
}
function bodSill(s) {
  return P(`Dorpel ${bodSn(s)}`, patch((z, p) => bodLow(z, p), AXR + ARCH + 0.002, AXF - ARCH - 0.002, 40, z => sideR(s, S1 * 0.55, sAtY(z, bodYSill - 0.006)), 8), MAT.paint,
    { d: 'Dorpel: dragend kokerprofiel onder de portieren, gelakt in carrosseriekleur.', ex: [s * 0.14, -0.05, 0] });
}
/* ---------- voorzijde: motorkap, koplampen, grille, bumper ---------- */
// Motorkap: draaias op de achterrand (z 0,925) op de hoogte van de hartlijn; hoek 65 graden. Punten van de achterrand liggen er net onder.
const bodHoodPv = [0, 0.915, 0.925], bodHoodAng = -65 * PI / 180;
function bodHoodPt(p) {
  const c = Math.cos(bodHoodAng), s = Math.sin(bodHoodAng), dy = p[1] - bodHoodPv[1], dz = p[2] - bodHoodPv[2];
  return [p[0], bodHoodPv[1] + dy * c - dz * s, bodHoodPv[2] + dy * s + dz * c];
}
// Motorkapsteun (stang): voet F op de rechter binnenscherm, rustpunt in de richting van de achterkant van de motorruimte, grijppunt G in het binnenframe
const bodStG = [-0.54, 0.775, 1.40], bodStGw = bodHoodPt(bodStG), bodStF = [-0.575, 0.84, 1.0];
const bodStL = Math.hypot(bodStGw[0] - bodStF[0], bodStGw[1] - bodStF[1], bodStGw[2] - bodStF[2]);
const bodStRot = (() => {
  const c = Math.min(0.99, 0.36 / bodStL), r0 = V3(0, -Math.sqrt(1 - c * c), c), r1 = V3(bodStGw[0] - bodStF[0], bodStGw[1] - bodStF[1], bodStGw[2] - bodStF[2]).normalize();
  const ax = r0.clone().cross(r1).normalize();
  return { r0, ax: [ax.x, ax.y, ax.z], ang: Math.acos(clamp(r0.dot(r1), -1, 1)) };
})();
// Kaprand: terugslag (flens) langs de voorrand, de afgeronde voorhoeken en de zijranden vanaf z 1,2; 18 mm diep, schuin naar binnen en 6 mm naar achteren
function bodHoodRim() {
  const R = bodHoodR, z0 = bodZLh - R, xc = bodHoodX0(z0) - R, arc = 10, nf = 12, zE = bodZLh - 0.0003;
  const L = [];   // linkerhelft van de zijrand (achter) naar de voorrand: [x, z, uitwaartse x, uitwaartse z]
  for (let k = 0; k <= 16; k++) { const z = (bodZHB + 0.004) + (z0 - (bodZHB + 0.004)) * k / 16; L.push([bodHoodX(z), z, 1, 0]); }
  for (let k = 1; k <= arc; k++) { const th = k / arc * HALF; L.push([xc + R * Math.cos(th), Math.min(zE, z0 + R * Math.sin(th)), Math.cos(th), Math.sin(th)]); }
  const mid = []; for (let k = 1; k < nf; k++) mid.push([xc - 2 * xc * k / nf, zE, 0, 1]);
  const R2 = L.map(([x, z, ox, oz]) => [-x, z, -ox, oz]).reverse();
  const pts = [...L, ...mid, ...R2].map(([x, z, ox, oz]) => { const sv = bodSAtX(z, Math.abs(x)); return { z, p: x >= 0 ? sv : 2 - sv, ox, oz }; });
  const N = pts.length - 1;
  return patch((u, v) => {
    const i = Math.min(N - 1, Math.floor(u)), f = u - i, a = pts[i], b = pts[i + 1];
    const z = lerp(a.z, b.z, f), pp = lerp(a.p, b.p, f), ox = lerp(a.ox, b.ox, f), oz = lerp(a.oz, b.oz, f);
    const q = bodLow(z, pp, 0.018 * v);
    return [q[0] - ox * 0.006 * v, q[1], q[2] - oz * 0.006 * v];
  }, 0, N, N, () => [0, 1], 2);
}
function bodHoodParts() {
  const hs = z => bodSAtX(z, bodHoodX(z)), both = bodBoth, sn = bodSn;
  const deckIn = (z0, z1, off, da, nu = 24) => bodDeck(z0, z1, nu, z => Math.min(0.995, hs(z) + da), 8, bodHoodArcZ(8), off);
  return A('Motorkap', { d: 'Motorkap van plaatstaal met binnenframe, isolatiemat, scharnieren, slotbeugel en sproeiers. Scharniert aan de achterrand en wordt met een steunstang open gehouden.', ex: [0, 0.52, 0.3],
    open: { type: 'hinge', pivot: bodHoodPv, axis: [1, 0, 0], angle: bodHoodAng, min: 55 * PI / 180, label: 'Motorkap', look: { dir: [0.5, 0.55, 1], nodes: ['Motorkap'] } } }, [
    P('Buitenpaneel motorkap', bodDeck(bodZHB, bodZLh - 0.0003, 44, hs, 14, bodDense(1.4, bodZLh, 6).concat(bodHoodArcZ(14))), MAT.paint, { d: 'Buitenhuid van de motorkap in het rood, licht bol over de breedte.', ex: [0, 0.14, 0] }),
    P('Kaprand', bodHoodRim(), MAT.bodSeal, { d: 'Zwarte afdichtrand: de terugslag van de kapbuitenhuid langs de voorrand, de voorhoeken en de zijranden. Hij maakt de naad met scherm, lamp en paneel donker en houdt de kap massief.', ex: [0, 0.04, 0.02] }),
    P('Binnenframe motorkap', deckIn(bodZHB + 0.02, bodZLh - 0.02, 0.03, 0.012), MAT.paintIn, { d: 'Verstevigend binnenframe met de bevestigingspunten van de scharnieren en de slotbeugel.', ex: [0, 0.03, 0] }),
    P('Motorkapisolatie', deckIn(bodZHB + 0.09, bodZLh - 0.12, 0.04, 0.05, 16), MAT.carpet, { d: 'Geluids- en hitte-isolatiemat aan de onderzijde.', ex: [0, -0.1, 0] }),
    ...both(s => A(`Kapscharnier ${sn(s)}`, { d: 'Scharnier achteraan de motorkap: een arm aan het binnenframe en een voet op de carrosserie. De draaias is in dit model de achterrand van de kap (schematisch).', ex: [s * 0.08, -0.04, -0.06] }, [
      P('Scharnierarm', G.rbox(0.02, 0.045, 0.12, 0.006), MAT.darkSteel, { d: 'Gebogen scharnierarm aan het binnenframe; draait met de kap mee.', p: [s * 0.50, 0.870, 0.97], ex: [0, -0.03, 0] }),
      ...[0, 1].map(i => P(`Kapscharnierbout ${i + 1}`, hexBolt(0.02, 0.008, 'y'), MAT.steel, { d: 'Bout M8 tussen scharnier en binnenframe.', p: [s * 0.50, 0.893, 0.94 + i * 0.05], r: [PI, 0, 0], ex: [0, 0.05, 0] })),
      P('Scharnierbasis', merge([G.rbox(0.05, 0.012, 0.11, 0.004), xf(G.rbox(0.012, 0.034, 0.09, 0.003), [s * 0.019, -0.022, 0])]), MAT.darkSteel, { d: 'Scharnierbasis op het schutbord: het deel aan de carrosseriezijde; blijft staan als de kap opent.', p: [s * 0.50, 0.85, 0.96], stay: true, ex: [0, -0.05, 0] }),
    ])),
    P('Slotbeugel motorkap', tube([[-0.02, 0.0, 0], [-0.02, -0.04, 0], [0.02, -0.04, 0], [0.02, 0, 0]].map(([x, y]) => [x, bodSec(1.55).yd - 0.02 + y, 1.55]), 0.004, 12, 6), MAT.steel, { d: 'Beugel aan het binnenframe die in het motorkapslot op de voorkopplaat grijpt.', ex: [0, -0.08, 0.04] }),
    P('Motorkapsteun', rodBetween([0, 0, 0], bodStRot.r0.clone().multiplyScalar(bodStL).toArray(), 0.007, 10), MAT.darkSteel, { d: 'Steunstang (lengte geschat) die de geopende kap ondersteunt. In rust ligt hij langs de rechter binnenscherm; open draait hij om zijn voet omhoog naar de opvanger in het binnenframe.', p: bodStF, stay: true, ex: [-0.04, 0.06, 0],
      open: { type: 'hinge', pivot: bodStF, axis: bodStRot.ax, angle: bodStRot.ang, follow: 'Motorkap', label: 'Motorkapsteun' } }),
    P('Steunopvanger', merge([G.rbox(0.03, 0.016, 0.03, 0.005), xf(G.rbox(0.03, 0.012, 0.03, 0.005), [0, -0.012, 0])]), MAT.plastic, { d: 'Kunststof opvanger in het binnenframe waarin de bovenkant van de steunstang valt.', p: [bodStG[0], bodStG[1] + 0.012, bodStG[2]], ex: [0, -0.06, 0] }),
    P('Kapafdichting', tube([-0.55, -0.3, 0, 0.3, 0.55].map(x => [x, bodSec(0.96).yd - 0.035 - 0.1 * x * x, 0.96]), 0.007, 20, 6), MAT.rubber, { d: 'Rubber afdichting tussen kap en waterkast.', stay: true, ex: [0, -0.05, -0.04] }),
    ...both(s => A(`Ruitensproeier ${sn(s)}`, { d: 'Sproeier van de ruitensproeierinstallatie aan de achterrand van de kap.', ex: [0, 0.05, 0] }, [
      P('Sproeierkop', G.lathe('y', [[0, 0.0045], [0.004, 0.0043], [0.0085, 0.003], [0.0112, 0.0008], [0.0112, -0.005], [0, -0.005]], 20, 'bodSprHead'), MAT.plasticGrey, { d: 'Grijze kunststof sproeierkop, half in de kap verzonken.', p: [s * 0.28, halfPt(1.0, bodSAtX(1.0, 0.28))[1] - 0.0015, 1.0], ex: [0, 0.04, 0] }),
      P('Sproeierslang', tube([[s * 0.28, 0.87, 1.0], [s * 0.3, 0.87, 1.1], [s * 0.4, 0.86, 1.2]], 0.0025, 12, 5), MAT.rubber, { d: 'Dunne slang van de sproeier naar het sproeierreservoir.', inner: true, ex: [0, -0.04, 0.05] }),
    ])),
  ]);
}
// Koplamp: wrap-around eenheid op de hoek van de neus. Flank (z 1,534 tot de kapvoorrand, onder scherm en kap) en het stuk op het voorvlak (z > 1,60).
// Onderrand = bumperbovenrand (bodYBT), binnenrand = paneel (bodXP); alle randen lopen 6 tot 8 mm onder het bovenliggende deel (kap, scherm, paneel, bumper),
// zodat er geen kier ontstaat (regel R1). Het glas ligt 4 mm onder de huid, het paneel 2,5 mm.
const bodLampZ0 = bodZFe - 0.014, bodLampIn = 0.004, bodZH = bodZLh - 0.0003;
const bodLLo = (z, d = -0.004) => sAtY(z, bodYBT(z) + d);                  // onderrand ten opzichte van de bumperbovenrand
const bodHoodFrontY = halfPt(bodZLh - 0.0003, 1)[1];                // hoogte van de voorrand van de motorkap op de hartlijn (0,745)
const bodLHi1 = z => Math.min(bodSAtX(z, bodHoodX(z) - 0.008), sAtY(z, bodHoodFrontY));   // bovenrand flank: 8 mm onder de kap, hoogstens op de voorrand van de kap (0,745; afgeleid van de kapvorm in body.js, zodat een lagere neus de hoekkap meeneemt) (hoekkap hoogstens 4 mm boven de hoofdlens (gemeten +3,7 mm), foto's: lager)
const bodLHi2 = z => bodSAtX(z, bodXP - 0.008);                             // binnenrand neus: 8 mm onder het paneel
const bodLSpl = z => bodSAtX(z, bodSec(z).xe - 0.012);                      // scheiding hoofdlens en hoekkap, op de dekrand
const bodLampZE = (() => { let z = bodZH; while (z < ZF - 0.01 && bodLHi2(z) - bodLLo(z, 0.002) > 0.006) z += 0.001; return z - 0.001; })();   // einde lens op de neus: onderrand snijdt binnenrand
const bodLampZC = (() => { let z = bodZH; while (z < bodLampZE && bodLSpl(z) - 0.0025 - bodLLo(z, 0.002) > 0.004) z += 0.001; return z; })();    // einde hoekkap op de neus
const bodLmLo = z => Math.max(bodLLo(z, 0.002), bodLSpl(z) + 0.0025);
const bodLmHi = z => Math.max(bodLmLo(z) + 0.0005, bodLHi2(z));
const bodLcLo = z => bodLLo(z, 0.002);
const bodLcHi = z => Math.max(bodLcLo(z) + 0.0005, bodLSpl(z) - 0.0025);
// stuk van de onderbak aan zijde sd tussen de s-grenzen lo(z) en hi(z); t loopt van 0 (lo) tot 1 (hi); inw(z, t, q) is de verschuiving naar binnen
function bodReg(sd, z0, z1, nu, nv, lo, hi, inw = 0, breaks = []) {
  return patch((z, t) => { const a = lo(z), sv = a + (hi(z) - a) * t; return bodLow(z, sd > 0 ? sv : 2 - sv, typeof inw === 'function' ? inw(z, t, (z - z0) / (z1 - z0)) : inw); }, z0, z1, nu, () => [0, 1], nv, breaks);
}
// wand langs een rand: pt(u) geeft [z, s]; de diepte loopt van d0 tot d1
function bodWall(sd, pt, u0, u1, nu, d0, d1, nv = 3) {
  return patch((u, d) => { const [z, sv] = pt(u); return bodLow(z, sd > 0 ? sv : 2 - sv, d); }, u0, u1, nu, u => [typeof d0 === 'function' ? d0(u) : d0, d1], nv);   // d0 mag een functie van u zijn
}
// zet de wikkeling zo dat de normalen naar buiten wijzen (nodig voor een FrontSide-lens): vergelijk met de richting weg van het midden van de voorbouw
function bodOutward(g) {
  const p = g.attributes.position, n = g.attributes.normal; let d = 0;
  for (let i = 0; i < p.count; i++) d += n.getX(i) * p.getX(i) + n.getY(i) * (p.getY(i) - 0.45) + n.getZ(i) * (p.getZ(i) - 1.2);
  if (d < 0) { const ix = g.index; for (let i = 0; i < ix.count; i += 3) { const b = ix.getX(i + 1); ix.setX(i + 1, ix.getX(i + 2)); ix.setX(i + 2, b); } g.computeVertexNormals(); }
  return g;
}
// uv voor het glas: u over |x| (6 mm per herhaling, twee ribbels), v over y
function bodLensUV(g) {
  const p = g.attributes.position, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) { uv[2 * i] = Math.abs(p.getX(i)) / 0.006; uv[2 * i + 1] = p.getY(i) / 0.05; }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); return g;
}
// ribbelnormaal van het prismaglas: sinus over de breedte, twee ribbels per herhaling
function bodLensRibTex() {
  const W = 64, H = 4, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), im = g.createImageData(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const a = Math.sin(x / W * PI * 4) * 0.55, l = Math.hypot(a, 1), k = (y * W + x) * 4;
    im.data[k] = Math.round((a / l * 0.5 + 0.5) * 255); im.data[k + 1] = 128; im.data[k + 2] = Math.round((1 / l * 0.5 + 0.5) * 255); im.data[k + 3] = 255;
  }
  g.putImageData(im, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t;
}
const bodRefBowl = (z, t, q) => 0.011 + 0.019 * Math.pow(Math.sin(PI * clamp(t, 0, 1)), 0.6) * Math.pow(Math.sin(PI * clamp(q, 0, 1)), 0.5);
function bodHeadlamp(s) {
  if (!MAT.bodLamp.map) { MAT.bodLamp.map = bodLampTex(); MAT.bodLamp.needsUpdate = true; }
  if (!MAT.bodLampC.map) { MAT.bodLampC.map = MAT.bodLamp.map; MAT.bodLampC.needsUpdate = true; }
  if (!MAT.bodLensRib.normalMap) { MAT.bodLensRib.normalMap = bodLensRibTex(); MAT.bodLensRib.normalScale.set(0.6, 0.6); MAT.bodLensRib.needsUpdate = true; }
  const n = bodSn(s), sd = s, Z0 = bodLampZ0, ZE = bodLampZE, ZC = bodLampZC;
  const mainLens = bodOutward(bodLensUV(bodReg(sd, bodZH, ZE, 14, 8, bodLmLo, bodLmHi, bodLampIn)));
  const capLens = merge([bodReg(sd, Z0, bodZH, 8, 8, bodLcLo, z => Math.max(bodLcLo(z) + 0.001, bodLHi1(z)), bodLampIn), bodReg(sd, bodZH, ZC, 8, 8, bodLcLo, bodLcHi, bodLampIn)].map(bodOutward));
  const refl = bodPlanarUV(bodReg(sd, bodZH, ZE, 14, 10, bodLmLo, bodLmHi, bodRefBowl), 0.34, 0.60, 0.60, 0.745);
  // hoekreflector: een zilveren vlak onder de hoekkap met een kleine schotel (positielicht)
  const zD = 1.578, sD = lerp(bodLcLo(zD), bodLHi1(zD) - 0.03, 0.42), pD = bodLow(zD, bodPp(sd, sD), 0.012), nD = bodN(zD, sD);
  const dish = G.lathe('x', [[0, -0.012], [0.008, -0.0105], [0.016, -0.0072], [0.023, -0.0030], [0.028, 0]], 28, 'bodHLdish').clone().applyQuaternion(quatFromTo(V3(1, 0, 0), V3(sd * nD[0], nD[1], nD[2]))).translate(pD[0], pD[1], pD[2]);
  // dezelfde textuur als de hoofdreflector, maar alleen het deel zonder gloeilamp: u loopt langs de hoek (zijkant z, dan voorkant x), v over de hoogte
  const cornerRefl = bodArcUV(merge([bodReg(sd, Z0, bodZH, 5, 5, bodLcLo, z => Math.max(bodLcLo(z) + 0.001, bodLHi1(z)), 0.012), bodReg(sd, bodZH, ZC, 5, 5, bodLcLo, bodLcHi, 0.012), dish, bodWall(sd, z => [z, bodLSpl(z)], bodZH, ZC, 8, 0.004, 0.07, 2)]));
  // Lamprand: 6 mm brede donkergrijze scheiding tussen hoofdlens en hoekkap, vlak met het glas
  const rim = bodReg(sd, bodZH, ZC, 8, 2, z => bodLSpl(z) - 0.0030, z => bodLSpl(z) + 0.0030, bodLampIn - 0.0004);
  // Lamphuis: gesloten kuip (vloer op 70 mm, vier wanden) zodat het zicht door het glas nooit op frontmodule, koelblok of waterkast valt
  // de onderwand van het huis begint op de diepte van de bumperrand (niet vast 4 mm): tussen wand en bumperrand bleef een spleet waardoor je van boven de bumperbalk zag (afwerking a)
  const lo = z => bodLLo(z, 0.004), hi2 = z => Math.max(lo(z) + 0.0005, bodLHi2(z)), D = 0.07;
  const housing = merge([
    bodReg(sd, Z0, bodZH, 4, 3, lo, bodLHi1, D), bodReg(sd, bodZH, ZE, 8, 4, lo, hi2, D),
    bodWall(sd, z => [z, lo(z)], Z0, ZE, 20, z => bodBumperInw(z) + 0.0005, D, 2), bodWall(sd, z => [z, bodLHi1(z)], Z0, bodZH, 6, 0.004, D, 2), bodWall(sd, z => [z, hi2(z)], bodZH, ZE, 10, 0.004, D, 2),
    bodWall(sd, t => [bodZH, lerp(bodLHi1(bodZH), hi2(bodZH), t)], 0, 1, 3, 0.004, D, 2), bodWall(sd, t => [Z0, lerp(lo(Z0), bodLHi1(Z0), t)], 0, 1, 4, 0.004, D, 2)]);
  const bulb = bodLow(1.645, bodPp(sd, lerp(bodLmLo(1.645), bodLmHi(1.645), 0.5)), 0.06);
  return A(`Koplamp ${n}`, { d: 'Rechthoekige koplamp met helder glas, om de hoek van de neus gewikkeld naar het scherm: een hoofdlens met ribbels, een gladde hoekkap, een zilveren reflector en een zwart huis. De onderrand volgt de bumper, de kap en het scherm lopen erover.', ex: [s * 0.32, 0.1, 0.55] }, [
    P('Afdekglas', mainLens, MAT.bodLensRib, { d: 'Heldere hoofdlens met fijne verticale ribbels (prismaglas), vlak met het voorpaneel en onder de kap en de bumperrand geschoven.', ex: [s * 0.1, 0.04, 0.2] }),
    P('Hoekkap', capLens, MAT.bodLens, { d: 'Gladde heldere hoekkap die om de voorhoek van het scherm loopt (positielicht, schematisch), met een donkergrijze scheiding naar de hoofdlens.', ex: [s * 0.14, 0.04, 0.12] }),
    P('Reflector', refl, MAT.bodLamp, { d: 'Zilveren reflectorschaal met facetten achter de hoofdlens: een groot parabolisch vlak met de lamp midden boven (dim- en grootlicht, schematisch).', ex: [0, 0, 0.06] }),
    P('Hoekreflector', cornerRefl, MAT.bodLampC, { d: 'Zilveren reflectorvlak met facetten en een kleine ronde schotel achter de hoekkap (positielicht, aannemelijk; niet bevestigd), met de lage scheidingswand naar de hoofdreflector.', ex: [s * 0.04, 0, 0.03] }),
    P('Lamprand', rim, MAT.bodLampRim, { d: 'Donkergrijze scheiding van ongeveer 6 mm tussen de hoofdlens en de hoekkap (echte lamp: 8 tot 10 mm, geschat).', ex: [s * 0.1, 0.04, 0.2] }),
    P('Lamphuis', housing, MAT.plastic, { d: 'Zwart kunststof lamphuis: een gesloten kuip met vier wanden waarin de lamp en reflector zijn gemonteerd.', ex: [0, 0, -0.03] }),
    P('Lampfitting', G.cyl('z', 0.022, 0.022, 0.05, 14), MAT.plastic, { d: 'Fitting met stekker voor de halogeenlamp (H4, plaats schematisch).', p: [bulb[0], bulb[1], bulb[2] - 0.03], ex: [0, 0.03, -0.1] }),
    P('Halogeenlamp', G.cyl('z', 0.011, 0.011, 0.06, 12), MAT.ceramic, { d: 'Halogeenlamp voor dim- en grootlicht (type niet voor deze auto geverifieerd).', p: [bulb[0], bulb[1], bulb[2] + 0.0], ex: [0, 0.04, 0.05] }),
    P('Stofkap lamp', G.lathe('z', [[0, 0.02], [0.035, 0.02], [0.04, 0], [0.035, -0.004]], 16, 'bodHLcap'), MAT.rubber, { d: 'Rubberen kap op de achterzijde van de lamp.', p: [bulb[0], bulb[1], bulb[2] - 0.06], r: [PI, 0, 0], ex: [0, 0.02, -0.14] }),
  ]);
}
// Nederlandse kentekenplaat (520 x 110 mm) zonder echte tekens: geel met zwarte rand, blauwe EU-strook met sterren en NL, zes streepjes.
// Het kenteken van de eigenaar komt nergens in het model.
function bodPlateTex() {
  const W = 1040, H = 220, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const rr = (x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  g.fillStyle = '#16171a'; g.fillRect(0, 0, W, H);
  rr(3, 3, W - 6, H - 6, 22); g.fillStyle = '#ebb405'; g.fill();
  rr(12, 12, W - 24, H - 24, 16); g.strokeStyle = '#111214'; g.lineWidth = 7; g.stroke();
  g.save(); rr(17, 17, 112, H - 34, 12); g.clip(); g.fillStyle = '#0c3a9c'; g.fillRect(17, 17, 112, H - 34); g.restore();
  g.fillStyle = '#f7d21e'; for (let k = 0; k < 12; k++) { const a = k / 12 * PI * 2; g.beginPath(); g.arc(73 + 34 * Math.cos(a), 74 + 34 * Math.sin(a), 5, 0, PI * 2); g.fill(); }
  g.fillStyle = '#ffffff'; g.font = 'bold 54px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillText('NL', 73, 188);
  g.fillStyle = '#111214'; for (let k = 0; k < 6; k++) g.fillRect(185 + k * 138 + (k >= 3 ? 24 : 0), H / 2 - 11, 92, 22);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t;
}
// Binnenkant van de koplamp (hoofdlens): een parabolische reflectorbak zonder raster. Midden-grijs met een heldere zone rond de lamp, facetten als zachte
// waaiers vanuit de lamp (geen lijnen), een donkere lampkap onder de gloeilamp, een schaduwband onderin en een donkere buitenrand van 9 procent.
// Foto's (F1, F2): helderheid gemiddeld 0,50 tot 0,58, spreiding 0,24 tot 0,26, donker 24 tot 32 procent, glans 12 tot 20 procent.
function bodLampTex() {
  const W = 512, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = '#101113'; g.fillRect(0, 0, W, H);
  const bx = W * 0.115, by = H * 0.13, iw = W - 2 * bx, ih = H - 2 * by, lx = W * 0.5, ly = H * 0.34;
  g.save(); g.beginPath(); g.rect(bx, by, iw, ih); g.clip();
  const rg = g.createRadialGradient(lx, ly, 6, W * 0.5, H * 0.55, W * 0.58); rg.addColorStop(0, '#d0d5d9'); rg.addColorStop(0.2, '#8f979e'); rg.addColorStop(0.55, '#4d535a'); rg.addColorStop(1, '#1f2226');
  g.fillStyle = rg; g.fillRect(bx, by, iw, ih);
  // facetten: zachte vlekken (spiegelende vlakken van de bak die licht of donker vangen), geen regelmatig raster en geen lijnen
  const blob = (x, y, rx, ry, k) => {
    g.save(); g.translate(x * W, y * H); g.scale(rx * W, ry * H);
    const q = g.createRadialGradient(0, 0, 0, 0, 0, 1); const col = k > 0 ? '240,244,247' : '10,12,14', a = Math.abs(k);
    q.addColorStop(0, `rgba(${col},${a})`); q.addColorStop(0.6, `rgba(${col},${a * 0.6})`); q.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = q; g.beginPath(); g.arc(0, 0, 1, 0, PI * 2); g.fill(); g.restore();
  };
  [[0.27, 0.30, 0.16, 0.20, 0.30], [0.72, 0.34, 0.15, 0.22, -0.38], [0.50, 0.62, 0.20, 0.17, 0.26], [0.18, 0.66, 0.12, 0.20, -0.40], [0.82, 0.70, 0.13, 0.18, 0.24],
    [0.38, 0.80, 0.18, 0.12, -0.42], [0.63, 0.20, 0.12, 0.14, 0.26], [0.10, 0.28, 0.10, 0.28, -0.40], [0.92, 0.40, 0.10, 0.26, -0.42], [0.55, 0.88, 0.22, 0.10, -0.40], [0.80, 0.18, 0.10, 0.12, -0.34], [0.28, 0.52, 0.09, 0.14, -0.30]].forEach(b => blob(...b));
  // schaduwband in het onderste derde en donkere ringen aan de zijkanten (de bak loopt steil op)
  const sg = g.createLinearGradient(0, by + ih * 0.42, 0, by + ih); sg.addColorStop(0, 'rgba(8,9,10,0)'); sg.addColorStop(1, 'rgba(8,9,10,0.9)');
  g.fillStyle = sg; g.fillRect(bx, by, iw, ih);
  const sg2 = g.createLinearGradient(bx, 0, bx + iw, 0); sg2.addColorStop(0, 'rgba(8,9,10,0.7)'); sg2.addColorStop(0.2, 'rgba(8,9,10,0)'); sg2.addColorStop(0.8, 'rgba(8,9,10,0)'); sg2.addColorStop(1, 'rgba(8,9,10,0.7)');
  g.fillStyle = sg2; g.fillRect(bx, by, iw, ih);
  // heldere zone rond de lamp: de bak vangt hier het licht van de gloeidraad
  const hz = g.createRadialGradient(W * 0.46, H * 0.44, 4, W * 0.46, H * 0.44, W * 0.2); hz.addColorStop(0, 'rgba(250,252,255,0.78)'); hz.addColorStop(1, 'rgba(250,252,255,0)');
  g.fillStyle = hz; g.fillRect(bx, by, iw, ih);
  g.restore();
  // lampkap: de afschermkap van de halogeenlamp, donker, onder de gloeidraad
  g.fillStyle = '#17191c'; g.beginPath(); g.ellipse(lx, ly + 12, 27, 12, 0, 0, PI * 2); g.fill();
  const bg = g.createRadialGradient(lx, ly - 4, 1, lx, ly - 4, 20); bg.addColorStop(0, '#fffdf2'); bg.addColorStop(0.45, '#f4e9b5'); bg.addColorStop(1, 'rgba(60,58,50,0)');
  g.fillStyle = bg; g.beginPath(); g.arc(lx, ly - 4, 20, 0, PI * 2); g.fill();
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t;
}
// uv uit de plaats: u van x0 (binnen) naar x1 (buiten) op |x|, v van y0 naar y1 (voor wikkelende vlakken die geen eigen uv hebben)
function bodPlanarUV(g, x0, x1, y0, y1) {
  const p = g.attributes.position, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) { uv[2 * i] = clamp((Math.abs(p.getX(i)) - x0) / (x1 - x0), 0, 1); uv[2 * i + 1] = clamp((p.getY(i) - y0) / (y1 - y0), 0, 1); }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); return g;
}
// uv voor de hoekreflector: langs de hoek (|x| van de zijkant naar de voorkant gerekend als z + (0,671 - |x|)) en over de hoogte, in het deel van de lamptextuur zonder gloeilamp (u 0,22 tot 0,44, v 0,38 tot 0,88)
function bodArcUV(g, U0 = 0.22, U1 = 0.44, V0 = 0.38, V1 = 0.88) {
  const p = g.attributes.position, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    const a = clamp(((p.getZ(i) - 1.521) + (0.671 - Math.abs(p.getX(i)))) / 0.34, 0, 1), b = clamp((p.getY(i) - 0.60) / 0.14, 0, 1);
    uv[2 * i] = U0 + (U1 - U0) * a; uv[2 * i + 1] = V0 + (V1 - V0) * b;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); return g;
}
// Gaas van de grille: zeshoekig raster dat naadloos herhaalt (4 cellen over de breedte van de tegel, 7 rijparen over de hoogte), dikke donkergrijze wanden op zwart
function bodHoneyTex() {
  const W = 256, c = document.createElement('canvas'); c.width = W; c.height = W; const g = c.getContext('2d');
  g.fillStyle = '#060607'; g.fillRect(0, 0, W, W); g.strokeStyle = '#1b1d20'; g.lineWidth = 6; g.lineJoin = 'round';
  const r = W / 12, h = W / 7, ky = h / (r * Math.sqrt(3));
  for (let row = -1; row < 16; row++) for (let col = -1; col < 6; col++) {
    const cx = col * r * 3 + (row % 2 ? r * 1.5 : 0), cy = row * h / 2;
    g.beginPath(); for (let k = 0; k < 6; k++) { const a = PI / 3 * k; g.lineTo(cx + r * Math.cos(a), cy + ky * r * Math.sin(a)); } g.closePath(); g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t;
}
// uv van het gaas: u over x, v over de lengte langs de neushelling; k herhalingen per meter (k 4,8: celbreedte 35 mm, kolomafstand 26 mm, ca. 25 kolommen over 650 mm; foto F1: ca. 25 grove cellen)
const bodHoneyUV = (g, k) => { const p = g.attributes.position, uv = new Float32Array(p.count * 2); for (let i = 0; i < p.count; i++) { uv[2 * i] = p.getX(i) * k; uv[2 * i + 1] = p.getY(i) / 1.0 * k; } g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); return g; };
// gaasopening op de neus: boven- en onderrand uit bodYG1 en bodYG0, afgeronde uiteinden (de halve breedte loopt over 12 mm terug naar boven en onder)
const bodGZ1 = bodZAtYd(bodYG1), bodGZ0 = bodZAtYd(bodYG0);
const bodGXe = z => { const w = 2 * clamp((z - bodGZ1) / (bodGZ0 - bodGZ1), 0, 1) - 1; return bodXG - 0.012 * (1 - Math.sqrt(Math.max(0, 1 - w * w))); };
function bodFrontPanel() {
  const off = 0.0025, sP = z => bodSAtX(z, bodXP), sE = z => bodSAtX(z, bodGXe(z)), sG = z => bodSAtX(z, bodXG + 0.0012);
  // paneel: bovenstrook (onder de kap geschoven), twee zijposten, onderstrook (onder de bumper geschoven); alles 2,5 mm onder de huid
  const top = bodDeck(bodZLh - 0.008, bodGZ1 + 0.0005, 8, sP, 10, [], off), low = bodDeck(bodGZ0 - 0.0005, 1.705, 6, sP, 10, [], off);
  const post = sd => bodReg(sd, bodGZ1, bodGZ0, 10, 1, sP, sE, off);
  const honey = bodHoneyUV(bodDeck(bodZAtYd(bodYG1 + 0.0012), bodZAtYd(bodYG0 - 0.0012), 10, sG, 12, [], 0.008), 4.8);
  MAT.bodHoney.map = bodHoneyTex(); MAT.bodHoney.color.setHex(0xffffff); MAT.bodHoney.needsUpdate = true;
  // kuip: vier zwarte wanden van de paneelrand naar het gaas (8 mm diep)
  const zt = bodGZ1, zb = bodGZ0, st = sE(zt), sb = sE(zb);
  const kuip = merge([...[1, -1].map(sd => bodWall(sd, z => [z, sE(z)], zt, zb, 10, off, 0.0085, 1)),
    bodWall(1, t => [zt, lerp(st, 2 - st, t)], 0, 1, 8, off, 0.0085, 1), bodWall(1, t => [zb, lerp(sb, 2 - sb, t)], 0, 1, 8, off, 0.0085, 1)]);
  // embleem: gestileerde Suzuki-S, een doorlopende streep (twee squircle-bogen, schuin afgesneden uiteinden, 11 graden naar rechts gekanteld), ca. 70 mm hoog en 41 mm breed, 4 mm dik.
  // Vijf losse balkjes lazen als het cijfer 5 (zevensegmentvorm); een doorlopende streep met schuine punten leest als S (foto F1 en F2)
  const embS = cache('bodEmblemS', () => {
    const a = 0.0155, b = 0.015, t = 0.0105, n = 2.6, sh = 0.2, N = 14, c = 0.0055, pw = (v, e) => Math.sign(v) * Math.pow(Math.abs(v), e), C = [];
    for (let k = 0; k <= N; k++) { const th = lerp(35, 270, k / N) * PI / 180; C.push([a * pw(Math.cos(th), 2 / n), b + b * pw(Math.sin(th), 2 / n)]); }
    for (let k = 1; k <= N; k++) { const th = lerp(90, -145, k / N) * PI / 180; C.push([a * pw(Math.cos(th), 2 / n), -b + b * pw(Math.sin(th), 2 / n)]); }
    const M = C.length, Lp = [], Rp = [];
    C.forEach((q, i) => {
      const p0 = C[Math.max(0, i - 1)], p1 = C[Math.min(M - 1, i + 1)], tx = p1[0] - p0[0], ty = p1[1] - p0[1], l = Math.hypot(tx, ty) || 1, ux = tx / l, uy = ty / l, e = i === 0 || i === M - 1 ? c : 0;
      Lp.push([q[0] - uy * t / 2 - ux * e, q[1] + ux * t / 2 - uy * e]); Rp.push([q[0] + uy * t / 2 + ux * e, q[1] - ux * t / 2 + uy * e]);
    });
    const poly = Lp.concat(Rp.reverse()).map(q => [q[0] + sh * q[1], q[1]]);
    return front(shapeOf(poly), 0.004);
  });
  const emb = merge([xf(embS, [0, 0, 0.004])]);
  const yE = (bodYG0 + bodYG1) / 2, zE = bodZAtYd(yE), pE = bodAt(zE, yE, -0.006), nE = bodN(zE, sAtY(zE, yE));
  return A('Grille en voorpaneel', { d: 'Voorpaneel tussen de koplampen: lichaamskleurig, vlak met de lampen, met één smalle zwarte gaasopening met honingraatgaas en het embleem (uitvoering 2001).', ex: [0, 0.04, 0.4] }, [
    P('Voorpaneel', merge([top, low, post(1), post(-1)]), MAT.paint, { d: 'Neuspaneel in carrosseriekleur boven en onder de gaasopening en ernaast, tussen de koplampen. Het loopt 8 mm onder de kap en onder de bumperrand.', ex: [0, 0.04, 0.06] }),
    P('Grillekuip', kuip, MAT.bodBlack, { d: 'Zwarte wanden rond de gaasopening: het gaas ligt 8 mm dieper dan het paneel.', ex: [0, 0, 0.1] }),
    P('Honingraatgrille', honey, MAT.bodHoney, { d: 'Zwart kunststof gaas met fijne honingraatstructuur (uitvoering 2001, één doorlopende opening) voor de luchtinlaat van de radiateur.', ex: [0, 0, 0.14] }),
    P('Embleem', emb, MAT.bodEmblem, { d: 'Donker metallic embleem op het gaas: een gestileerde letter S van ongeveer 70 mm hoog, zonder schijf eronder (schematisch, zonder merkletters).', p: [0, pE[1], pE[2]], r: [-Math.atan2(nE[1], nE[2]), 0, 0], ex: [0, 0.03, 0.12] }),
  ]);
}
// kolomverdeling over de doorsnede: dicht op de hoeken (onderkant, schouder), ruim op de vlakke delen. bodWarp(a, b, t) geeft s tussen a en b voor t in [0, 1],
// zodat elke rij van een schaal evenveel kolommen heeft die op dezelfde plek in de doorsnede liggen (4 op de onderhoek, 3 op de wand, 8 op de schouder, 12 op het dek; bodNC is het totaal)
const bodNC = 27;
const bodWK = [[S1, 0], [S2, 4], [S3, 7], [S4, 15], [1, bodNC]];
const bodWC = sv => { for (let i = 0; i < bodWK.length - 1; i++) if (sv <= bodWK[i + 1][0]) return bodWK[i][1] + (bodWK[i + 1][1] - bodWK[i][1]) * (sv - bodWK[i][0]) / (bodWK[i + 1][0] - bodWK[i][0]); return bodNC; };
const bodWI = c => { for (let i = 0; i < bodWK.length - 1; i++) if (c <= bodWK[i + 1][1]) return bodWK[i][0] + (bodWK[i + 1][0] - bodWK[i][0]) * (c - bodWK[i][1]) / (bodWK[i + 1][1] - bodWK[i][1]); return 1; };
const bodWarp = (a, b, t) => bodWI(bodWC(a) + (bodWC(b) - bodWC(a)) * t);
// normaal van de onderbak in (z, p) voor beide helften (p > 1 is de rechterhelft)
const bodNrm = (z, p) => { const q = ((p % 2) + 2) % 2, sd = q <= 1 ? 1 : -1, sv = q <= 1 ? q : 2 - q, n = bodN(z, sv); return [sd * n[0], n[1], n[2]]; };
// zoals patch(), maar met normalen uit het analytische oppervlak in plaats van uit de driehoeken: geen naden of kreukels bij versprongen rijen of waar de uiteinden van het vlak samenkomen
function bodPatchN(fn, u0, u1, nu, vr, nv, breaks = [], nfix = null, pOf = null, diag = false, geomZ = 0) {
  const g = patch(fn, u0, u1, nu, vr, nv, breaks), us = [];
  for (let i = 0; i <= nu; i++) us.push(u0 + (u1 - u0) * i / nu);
  breaks.forEach(b => { if (b > u0 + 1e-4 && b < u1 - 1e-4) us.push(b); });
  us.sort((a, b) => a - b);
  const n = g.attributes.normal; let k = 0;
  for (const u of us) { const [v0, v1] = vr(u); for (let j = 0; j <= nv; j++, k++) { let q = bodNrm(u, pOf ? pOf(u, v0 + (v1 - v0) * j / nv) : v0 + (v1 - v0) * j / nv); if (nfix) q = nfix(q, u); n.setXYZ(k, q[0], q[1], q[2]); } }
  // gladde normalen uit de driehoeken zelf (voor z < geomZ, daarna geleidelijk de analytische normalen): de analytische normalen kloppen niet met de gelineariseerde posities op de hoek van de
  // bumper en gaven doekachtige plooien in de glans; aan het eindvlak blijven ze nodig omdat daar de naad met het eindvlak (bodEndBlend) op aansluit
  if (geomZ) {
    const pg = g.clone(); pg.deleteAttribute('normal'); const wg = THREE.BufferGeometryUtils.mergeVertices(pg, 1e-6); wg.computeVertexNormals();
    const key = (x, y, z) => Math.round(x * 1e6) + ',' + Math.round(y * 1e6) + ',' + Math.round(z * 1e6), mp = new Map(), wp = wg.attributes.position, wn = wg.attributes.normal;
    for (let i = 0; i < wp.count; i++) mp.set(key(wp.getX(i), wp.getY(i), wp.getZ(i)), [wn.getX(i), wn.getY(i), wn.getZ(i)]);
    const P0 = g.attributes.position, N0 = g.attributes.normal;
    for (let i = 0; i < P0.count; i++) {
      const q = mp.get(key(P0.getX(i), P0.getY(i), P0.getZ(i))); if (!q) continue;
      const w = 1 - sstep((P0.getZ(i) - geomZ) / 0.02), a = [N0.getX(i), N0.getY(i), N0.getZ(i)], sg = a[0] * q[0] + a[1] * q[1] + a[2] * q[2] < 0 ? -1 : 1, m = [lerp(a[0], sg * q[0], w), lerp(a[1], sg * q[1], w), lerp(a[2], sg * q[2], w)], l = Math.hypot(...m) || 1;
      N0.setXYZ(i, m[0] / l, m[1] / l, m[2] / l);
    }
  }
  // diagonaal per vlakje: kies de diagonaal tussen de hoekpunten met de meest gelijke normalen (de normalen van de driehoeken worden over de diagonaal geinterpoleerd; op lange smalle
  // vlakjes gaf de vaste diagonaal zaagtand-plooien in de glans)
  if (diag) {
    const ii = g.index, nn0 = g.attributes.normal, ang = (p, q) => nn0.getX(p) * nn0.getX(q) + nn0.getY(p) * nn0.getY(q) + nn0.getZ(p) * nn0.getZ(q);
    for (let q = 0; q < ii.count; q += 6) {
      const a = ii.getX(q), b = ii.getX(q + 1), d0 = ii.getX(q + 2), c = ii.getX(q + 4);
      if (ang(a, c) > ang(b, d0)) { ii.setX(q, a); ii.setX(q + 1, b); ii.setX(q + 2, c); ii.setX(q + 3, a); ii.setX(q + 4, c); ii.setX(q + 5, d0); }
    }
  }
  // de wikkeling moet bij de normalen passen (DoubleSide keert de normaal om voor achterkanten): keer de driehoeken om als de meeste ervan achterstevoren staan
  const ix = g.index, pos = g.attributes.position; let d = 0; const a = V3(), b = V3(), c = V3(), nn = V3();
  for (let t = 0; t < ix.count; t += 3) {
    a.fromBufferAttribute(pos, ix.getX(t)); b.fromBufferAttribute(pos, ix.getX(t + 1)); c.fromBufferAttribute(pos, ix.getX(t + 2));
    b.sub(a); c.sub(a); b.cross(c); nn.fromBufferAttribute(n, ix.getX(t)); d += Math.sign(b.dot(nn)) * Math.min(1, b.length() * 1e4);
  }
  if (d < 0) for (let t = 0; t < ix.count; t += 3) { const q = ix.getX(t + 1); ix.setX(t + 1, ix.getX(t + 2)); ix.setX(t + 2, q); }
  return g;
}
// bumperschaal: bovenrand yTop (getal of functie van z), inw(z) is de verschuiving naar binnen (voor onder het scherm: 3 mm; op de neus 1 mm voor het paneel)
const bodBumperGeo = (yTop, z0, zEnd, dir, inw = () => 0, nu = 36, nv = 34) => {
  const yt = typeof yTop === 'function' ? yTop : () => yTop;
  return merge([
    patch((z, p) => bodLow(z, p, inw(z)), dir > 0 ? z0 : zEnd + 0.0005, dir > 0 ? zEnd - 0.0005 : z0, nu, z => { const sb = sAtY(z, yt(z)); return [-sb, sb]; }, nv),
    bodFace(zEnd, dir, -9, 9, YB(zEnd) + 0.001, dir > 0 ? bodSec(zEnd).yd - 0.001 : yt(zEnd), 0, 8, 30)]);
};
const bodBumperTop = z => bodYBT(z) + 0.008;                                    // bovenrand voorbumper: 8 mm boven de lijn waar lamp, paneel en scherm op aansluiten
const bodBumperInw = z => lerp(0.003, -0.001, sstep((z - 1.52) / 0.06)) * (1 - sstep((z - 1.70) / 0.04));   // onder het scherm 3 mm naar binnen, op de neus 1 mm voor het paneel, aan het eindvlak 0 (sluit op het eindvlak aan)
// punt op de huid van de voorbumper vanuit het vooraanzicht (x, y): op het eindvlak als |x| daar binnen de breedte ligt, anders op de hoek of de flank (z gezocht);
// off > 0 is naar buiten. Geeft [punt, normaal]; de normaal loopt bij het eindvlak mee naar voren (zachte hoek, zie bodEndBlend).
function bodSkinXY(x, y, off = 0) {
  const sg = x >= 0 ? 1 : -1, ax = Math.abs(x), XF = ringX(ZF, y);
  let z = ZF;
  if (ax > XF) { let lo = 1.40, hi = ZF; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (ringX(m, y) > ax) lo = m; else hi = m; } z = (lo + hi) / 2; }
  const sv = sAtY(z, y), n = bodEndBlend(bodN(z, sv), z, 1), nn = [sg * n[0], n[1], n[2]], px = ax > XF ? ringX(z, y) : ax;
  return [[sg * px + nn[0] * off, y + nn[1] * off, z + nn[2] * off], nn];
}
// de normaal loopt over de laatste 30 mm van de hoek mee naar het eindvlak (richting +z voor voor, -z voor achter): de hoek leest als afgerond in plaats van als kreuk
function bodEndBlend(n, z, dir) {
  const w = 0.85 * sstep(dir > 0 ? (z - (ZF - 0.03)) / 0.03 : ((ZR + 0.03) - z) / 0.03), m = [n[0] * (1 - w), n[1] * (1 - w), n[2] * (1 - w) + dir * w], l = Math.hypot(...m) || 1;
  return [m[0] / l, m[1] / l, m[2] / l];
}
// afgeronde rechthoek (superellips) van het vierkant [-1, 1]^2
const bodSq = (a, b, n = 5) => { const m = Math.max(Math.abs(a), Math.abs(b)); if (m < 1e-9) return [0, 0]; const r = Math.pow(Math.pow(Math.abs(a), n) + Math.pow(Math.abs(b), n), 1 / n); return [a * m / r, b * m / r]; };
// afgeronde plaat van w x h op de bumperhuid, middelpunt (cx, cy); ze wikkelt mee om de hoek (één patch, geen naad)
function bodSkinPlate(cx, cy, w, h, off, nu = 24, nv = 8) {
  const g = patch((a, b) => { const [qa, qb] = bodSq(a, b); return bodSkinXY(cx + w / 2 * qa, cy + h / 2 * qb, off)[0]; }, -1, 1, nu, () => [-1, 1], nv);
  const n = g.attributes.normal; let k = 0;   // normalen uit het oppervlak, zodat de lens aan de hoek niet kreukt
  for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++, k++) { const [qa, qb] = bodSq(-1 + 2 * i / nu, -1 + 2 * j / nv), q = bodSkinXY(cx + w / 2 * qa, cy + h / 2 * qb, 0)[1]; n.setXYZ(k, q[0], q[1], q[2]); }
  return g;
}
// pose van een klein onderdeel op de bumperhuid: positie plus een draaiing die de z-as langs de huidnormaal legt
function bodSkinPose(x, y, off) { const [p, n] = bodSkinXY(x, y, off); return { p, q: quatFromTo(V3(0, 0, 1), V3(...n)) }; }
// Bumperlip: gesloten rand in carrosseriekleur langs de onderkant van de schaal, van achter links (z 1,43) om de voorkant naar achter rechts; de wand loopt door vanaf het
// einde van de onderhoek (s = S2) en rondt onderaan af naar binnen, onderrand op y 0,225 (225 mm boven de grond, uitlopend over 140 mm vanaf z 1,425)
// pad van de lip in het bovenaanzicht: van links (z 1,425, begin van de uitloop) over de neus naar rechts, op de buitenwand van de schaal (s = S2); yBot is de onderrand van de lip.
// De lip en de afscherming eronder (Onderplaat voorbumper) delen dit pad, zodat ze samen met de bumper meebewegen en dezelfde omtrek volgen.
function bodLipPath() {
  const zA = 1.425, zE = ZF - 0.0005, xo = z => halfPt(z, S2)[0] - 0.002, yo = z => halfPt(z, S2)[1], N1 = 22, N2 = 16;
  const pts = [];
  for (let k = 0; k <= N1; k++) { const t = k / N1, z = zA + (zE - zA) * (1 - Math.pow(1 - t, 1.5)); pts.push([xo(z), z]); }
  for (let k = 1; k < N2; k++) pts.push([xo(zE) * (1 - 2 * k / N2), zE]);
  for (let k = N1; k >= 0; k--) { const [x, z] = pts[k]; pts.push([-x, z]); }
  const N = pts.length - 1;
  const yBot = z => lerp(yo(z), 0.225, sstep((z - zA) / 0.14));
  // uitwaartse normaal van het pad in het bovenaanzicht (pad loopt links naar voren, dwars over de neus, rechts naar achteren): (tz, -tx)
  const nr = pts.map((q, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N, i + 1)], tx = b[0] - a[0], tz = b[1] - a[1], l = Math.hypot(tx, tz) || 1; return [tz / l, -tx / l]; });
  const at = u => { const i = Math.min(N - 1, Math.floor(u)), f = u - i, a = pts[i], b = pts[i + 1], nx = lerp(nr[i][0], nr[i + 1][0], f), nz = lerp(nr[i][1], nr[i + 1][1], f), nl = Math.hypot(nx, nz) || 1;
    return { x: lerp(a[0], b[0], f), z: lerp(a[1], b[1], f), nx: nx / nl, nz: nz / nl }; };
  return { zA, zE, yo, yBot, N, at };
}
function bodBumperLip() {
  // buitenwand van de schaal (s = S2, einde van de onderhoek) loopt door naar beneden en rondt af naar binnen (straal rr): de wang eindigt op de lip, geen losse plank
  const { yo, yBot, N, at } = bodLipPath(), rr = 0.012;
  return patch((u, v) => {
    const q = at(u), x = q.x, z = q.z, yb = yBot(z), r = Math.min(rr, (yo(z) - yb) / 2);
    const wall = Math.max(yo(z) - yb - r, 0);
    if (v <= 0.25) return [x, yo(z) - wall * (v / 0.25), z];                      // rechte wand
    const t = (v - 0.25) / 0.75 * HALF, k = r * (1 - Math.cos(t));
    return [x - q.nx * k, yb + r - r * Math.sin(t), z - q.nz * k];                 // afronding naar binnen, loodrecht op het pad
  }, 0, N, N, () => [0, 1], 8);
}
// afscherming onder de bumper: een dun donker lint dat de omtrek van de lip volgt, 40 mm erachter, en vanaf de onderrand van de lip 'drop' omlaag loopt (loopt vloeiend op vanaf z 1,44, vol vanaf z 1,68).
// Het verbergt de lage delen van het onderstel (carter, dwarsbalk, draagarmen) voor een lage camera zonder een plank te zijn: geen dwarsplaten, geen zijschermen langs de aandrijfas.
function bodBumperShield() {
  const { yBot, N, at } = bodLipPath(), INS = 0.04, DROP = 0.05, drop = z => DROP * sstep((z - 1.44) / 0.24);   // de diepte loopt vloeiend op over de hele lipbocht (was z 1,50 tot 1,60: een tand van 50 mm onder de bumperhoek)
  return patch((u, v) => { const q = at(u), y0 = yBot(q.z); return [q.x - q.nx * INS, lerp(y0 + 0.02, y0 - drop(q.z), v), q.z - q.nz * INS]; }, 0, N, N, () => [0, 1], 2);
}
// Naad op de bovenrand van de bumper: een donkere voeg langs de rand waar paneel, lampen en scherm onder de bumper verdwijnen. Hij volgt de rand van links (z 1,381, het begin van de schaal) over
// de neus naar rechts, op de huid via bodSkinXY (vooraanzicht), zodat de bumper vanuit elke hoek als apart deel van het paneel leest. De laatste zes punten aan elk eind zakken tot 4 mm naar
// binnen, zodat de buis onder de schermrand verdwijnt in plaats van midden op het scherm af te knippen.
function bodBumperSeam() {
  const X0 = ringX(1.381, bodBumperTop(1.381)) - 0.002, pts = [], N = 64, TAIL = 6;
  for (let k = 0; k <= N; k++) {
    const x = Math.max(0.0015, Math.abs(X0 * Math.sin((k / N * 2 - 1) * HALF))) * (k < N / 2 ? -1 : 1);
    let y = bodBumperTop(1.7), pt = null;
    for (let it = 0; it < 3; it++) { pt = bodSkinXY(x, y, 0.0006)[0]; y = bodBumperTop(Math.min(pt[2], 1.7)) - 0.0012; }
    const [p, n] = bodSkinXY(x, y, 0.0006), e = Math.min(k, N - k), sink = e < TAIL ? 0.004 * (1 - e / TAIL) : 0;
    pts.push(sink ? [p[0] - n[0] * sink, p[1] - n[1] * sink, p[2] - n[2] * sink] : p);
  }
  return tube(pts, 0.0026, 128, 6);
}
function bodFrontBumper() {
  const both = bodBoth, sn = bodSn;
  if (!MAT.bodPlate.map) { MAT.bodPlate.map = bodPlateTex(); MAT.bodPlate.needsUpdate = true; }
  // knipperlicht: één afgeronde lens van 190 x 50 mm op de bumperhuid, wikkelt om de hoek; donkere rand met twee schroefjes; huis en lamp erachter
  const KX = 0.50, KY = 0.345, KW = 0.19, KH = 0.05;
  const sig = s => A(`Knipperlicht voor ${sn(s)}`, { d: 'Oranje richtingaanwijzer laag in de hoek van de bumper: een afgeronde lens van ongeveer 190 x 50 mm in een donkere rand met twee schroefjes, om de hoek gewikkeld.', ex: [s * 0.22, -0.02, 0.2] }, [
    P('Lens knipperlicht voor', bodSkinPlate(s * KX, KY, KW, KH, 0.0030), MAT.bodAmber, { d: 'Oranje lens van de richtingaanwijzer, afgerond rechthoekig (ongeveer 190 x 50 mm); de plaats is geschat op foto\'s van de uitvoering.', ex: [s * 0.05, 0, 0.08] }),
    P('Rand knipperlicht voor', merge([bodSkinPlate(s * KX, KY, KW + 0.012, KH + 0.012, 0.0014), ...[-1, 1].map(e => { const o = bodSkinPose(s * (KX + e * (KW / 2 + 0.003)), KY, 0.0030); return xf(G.cyl('z', 0.0022, 0.0022, 0.0016, 10).clone().applyQuaternion(o.q), o.p); })]), MAT.bodBlack, { d: 'Zwarte rand van ongeveer 6 mm om de lens, met twee schroefjes (de bumper zelf heeft hier geen echte uitsparing; de diepte komt van de rand).', ex: [s * 0.04, 0, 0.06] }),
    P('Lamphuis knipperlicht voor', bodSkinPlate(s * KX, KY, KW - 0.012, KH - 0.012, -0.012, 14, 5), MAT.plastic, { d: 'Kunststof huis met fitting achter de lens.', ex: [0, 0, -0.03] }),
    P('Lamp knipperlicht voor', G.cyl('z', 0.009, 0.009, 0.035, 10), MAT.ceramic, { d: 'Steeklamp van de richtingaanwijzer.', p: [s * 0.46, KY, ZF - 0.05], ex: [0, 0, -0.06] }),
  ]);
  // schaal: twee helften van de onderrand (s = S1) tot de bovenrand die bij de lamp past; de onderkant is een apart zwart deel
  const zS = 1.381, zE = ZF, sbF = z => Math.max(S1 + 0.002, sAtY(z, bodBumperTop(z)));
  const nfix = (n, z) => bodEndBlend(n, z, 1), NR = bodNC;
  const pW = (s, z, t) => (s > 0 ? bodWarp(S1, sbF(z), t) : 2 - bodWarp(S1, sbF(z), t));
  // extra rijen op de plaatsen waar de schaal sterk draait; een extra rij die binnen 2,6 mm van een bestaande rij valt maakt een smalle sliert (de vlaknormaal wijkt daar meer dan 30 graden af van de hoekpuntnormalen: plooien in de glans) en wordt weggelaten
  const rijen = Array.from({ length: 29 }, (_, k) => zS + (zE - zS) * k / 28), breaks = [];
  [1.50, 1.56, 1.62, 1.70, 1.72, 1.735, ...Array.from({ length: 14 }, (_, k) => 1.658 + k * 0.0026)].forEach(b => { if (!rijen.concat(breaks).some(r => Math.abs(r - b) < 0.0026)) breaks.push(b); });
  const shell = s => bodPatchN((z, t) => bodLow(z, pW(s, z, t), bodBumperInw(z)), zS, zE, 28, () => [0, 1], NR, breaks, nfix, (z, t) => pW(s, z, t), true, 1.70);
  // eindvlak: rijen op dezelfde hoogtes als de laatste rij van de schaal (zelfde z, zelfde s-verdeling), zodat er geen sliert tussen vlak en schaal overblijft
  const face = patch((j, t) => { const [x, y] = halfPt(ZF, bodWarp(S1, 1, j / NR)); return [lerp(x, -x, t), y, ZF]; }, 0, NR, NR, () => [0, 1], 14);
  // luchtsleuven: de sleuf ligt vrijwel vlak met het vlak (0,5 mm erboven), een kader van 5 mm breed en 2 mm hoog in carrosseriekleur eromheen laat hem 1,5 mm verdiept ogen
  const slot = (x, y, w, h) => xf(G.rbox(w, h, 0.003, 0.004), [x, y, ZF - 0.001]);
  const rib = (x, y, w, h, k) => Array.from({ length: k }, (_, i) => xf(G.box(w, 0.0035, 0.002), [x, y - h / 2 + h * (i + 1) / (k + 1), ZF + 0.0013]));
  const kader = (x, y, w, h, t = 0.005) => [xf(G.box(w + 2 * t, t, 0.002), [x, y + h / 2 + t / 2, ZF + 0.001]), xf(G.box(w + 2 * t, t, 0.002), [x, y - h / 2 - t / 2, ZF + 0.001]),
    xf(G.box(t, h, 0.002), [x - w / 2 - t / 2, y, ZF + 0.001]), xf(G.box(t, h, 0.002), [x + w / 2 + t / 2, y, ZF + 0.001])];
  return A('Voorbumper', { d: 'Bumperschaal in carrosseriekleur (Twist) met de hoeken om de wielbogen, een lip langs de onderkant, luchtsleuven rond het kentekenvlak en richtingaanwijzers laag in de hoeken; erachter de stalen bumperbalk.', ex: [0, -0.04, 0.72] }, [
    P('Bumperschaal voor', merge([shell(1), shell(-1), face]), MAT.paint, { d: 'Kunststof bumperschaal in het rood met afgeronde hoeken die om de voorwielboog lopen; de bovenrand sluit op de lamp, het paneel en het scherm aan.', ex: [0, -0.02, 0.12] }),
    P('Bumpernaad voor', cache('bodBumperSeam', bodBumperSeam), MAT.bodSeal, { d: 'Donkere voeg van ongeveer 5 mm langs de bovenrand van de bumper, waar het voorpaneel, de koplampen en de schermen eronder verdwijnen: de bumper is een apart deel (de echte voeg is nauwelijks breder).', ex: [0, -0.02, 0.12] }),
    P('Bumperlip voor', bodBumperLip(), MAT.paint, { d: 'Rand in carrosseriekleur langs de onderkant van de bumper: de buitenwand van de schaal loopt door tot ongeveer 225 mm boven de grond en rondt daar af naar binnen (achter uitlopend naar niets), zodat de wang op de lip uitloopt. Hij houdt het zicht op onderstel en stabilisatorstang van normale hoogte af.', ex: [0, -0.05, 0.04] }),
    P('Onderplaat voorbumper', merge([bodPatchN((z, p) => bodLow(z, p, 0.0), 1.425, zE - 0.003, 18, () => [-S1, S1], 6, [], (n) => n), bodBumperShield()]), MAT.bodShield, { d: 'Zwarte onderzijde van de bumper met een donker lint van 50 mm onder de lip, 40 mm achter de lipwand en met dezelfde omtrek als de lip, schematisch (de echte afscherming onder de bumper is niet vast te stellen): het houdt carter, dwarsbalk en draagarmen uit het zicht van een lage camera, zonder platen langs de aandrijfas.', ex: [0, -0.06, 0.02] }),
    P('Luchtrooster voor', merge([slot(0.34, 0.415, 0.12, 0.06), slot(-0.34, 0.415, 0.12, 0.06), slot(0, 0.328, 0.54, 0.022)]), MAT.bodBlack, { d: 'Zwarte luchtsleuven: links en rechts van het kentekenvlak en een smalle sleuf eronder, voor extra koellucht.', ex: [0, -0.04, 0.1] }),
    P('Luchtroosterkader voor', merge([...kader(0.34, 0.415, 0.12, 0.06), ...kader(-0.34, 0.415, 0.12, 0.06), ...kader(0, 0.328, 0.54, 0.022)]), MAT.paint, { d: 'Kader van ongeveer 5 mm breed in carrosseriekleur om de luchtsleuven, 2 mm boven het bumpervlak: de sleuven liggen daardoor verdiept.', ex: [0, -0.04, 0.11] }),
    P('Luchtroosterribben voor', merge([...rib(0.34, 0.415, 0.12, 0.06, 2), ...rib(-0.34, 0.415, 0.12, 0.06, 2)]), MAT.bodBumper, { d: 'Horizontale ribben in de luchtsleuven naast het kentekenvlak.', ex: [0, -0.04, 0.12] }),
    P('Kentekenplaathouder voor', G.rbox(0.532, 0.118, 0.006, 0.004), MAT.bodBumper, { d: 'Zwarte houder voor de voorste kentekenplaat in het midden van de bumper.', p: [0, 0.405, ZF + 0.0], ex: [0, 0, 0.1] }),
    P('Kentekenplaat voor', G.rbox(0.52, 0.11, 0.003, 0.002), MAT.bodPlate, { d: 'Gele Nederlandse plaat met zwarte rand en blauwe EU-strook, met streepjes op de plaats van het kenteken (geen kenteken in dit model).', p: [0, 0.405, ZF + 0.0035], ex: [0, 0, 0.16] }),
    ...both(sig),
  ]);
}
/* ---------- portieren en spiegels ---------- */
// punt van de onderbak met een zuiver zijwaartse verschuiving naar binnen (dx), voor binnenpanelen die niet met de schouder mee krullen
function bodLowX(z, p, dx) { const q = ((p % 2) + 2) % 2, sd = q <= 1 ? 1 : -1, s = q <= 1 ? q : 2 - q, [x, y] = halfPt(z, s); return [sd * (x - dx), y, z]; }
const bodSideX = (s, z0, z1, nu, vr, nv, dx) => patch((z, p) => bodLowX(z, p, dx), z0, z1, nu, z => sideR(s, ...vr(z)), nv);
// buitenwaartse normaal (linkerhelft) en pose op de huid; rechts wordt gespiegeld
function bodPose(s, p, nLeft, extra = {}) {
  const q = quatFromTo(V3(1, 0, 0), V3(...nLeft));
  if (s > 0) return Object.assign({ p, q }, extra);
  return Object.assign({ p: [-p[0], p[1], p[2]], q: new THREE.Quaternion(q.x, -q.y, -q.z, q.w), s: [-1, 1, 1] }, extra);
}
function bodMirror(s) {
  const n = bodSn(s), cx = 0.7875, cy = 0.995, cz = 0.745, M = (x, y, z) => [s * x, y, z];
  // de scharnierlijn ligt aan de binnenachterkant van het huis; het huis klapt naar achteren langs het portier
  return A(`Buitenspiegel ${n}`, { d: 'Elektrisch verstelbare en verwarmde buitenspiegel in zwart kunststof (Twist). Klapt met de hand ongeveer 80 graden naar achteren (hoek geschat).', ex: [s * 0.3, 0.1, 0.08],
    open: { type: 'hinge', pivot: [s * 0.745, 0.99, 0.69], axis: [0, 1, 0], angle: s * 80 * PI / 180, min: 64 * PI / 180, label: `Buitenspiegel ${n}`, look: { dir: [s * 0.8, 0.3, 0.75], nodes: [`Buitenspiegel ${n}`] } } }, [
    P('Spiegelvoet', merge([G.rbox(0.07, 0.035, 0.08, 0.01), xf(G.rbox(0.04, 0.05, 0.05, 0.01), [0, 0.03, 0.0])]), MAT.bodBlack, { d: 'Voet met bevestigingsplaat op het portier; blijft staan als de spiegel inklapt.', p: M(0.715, 0.93, 0.725), stay: true, ex: [-s * 0.05, -0.05, 0] }),
    P('Spiegelhuis', G.rbox(0.085, 0.125, 0.11, 0.03), MAT.bodBlack, { d: 'Zwart kunststof huis dat glas, motoren en verwarming draagt.', p: M(cx, cy, cz), ex: [0, 0.02, 0.1] }),
    P('Spiegelglas', G.rbox(0.07, 0.108, 0.004, 0.02), MAT.bodMirror, { d: 'Bol spiegelglas, verwarmd.', p: M(cx, cy, cz - 0.0575), ex: [0, 0, -0.12] }),
    P('Glasdrager', G.rbox(0.072, 0.11, 0.006, 0.02), MAT.plastic, { d: 'Kunststof drager waarop het glas is geklikt.', p: M(cx, cy, cz - 0.05), ex: [0, 0, -0.07] }),
    P('Verwarmingsfolie', G.box(0.05, 0.08, 0.002), MAT.heater, { d: 'Verwarmingsfolie achter het glas tegen condens en ijs.', inner: true, p: M(cx, cy, cz - 0.04), ex: [0, 0, -0.1] }),
    P('Verstelmotor', G.rbox(0.05, 0.05, 0.03, 0.008), MAT.darkSteel, { d: 'Motor met twee assen voor het elektrisch verstellen van het glas.', inner: true, p: M(cx, cy, cz - 0.02), ex: [0, 0.06, -0.04] }),
  ]);
}
function bodDoor(s) {
  const n = bodSn(s), dName = `Portier ${n}`, dPath = `${AUTO.wortel}/Carrosserie/${dName}`, z0 = bodZDR, z1 = bodZDF, zm = (z0 + z1) / 2;
  const sLo = z => sAtY(z, bodYSill), sHi = S4 - 0.0008, eIn = 0.13, pp = sv => bodPp(s, sv);
  const qLo = z => bodQy(z, YT(z) + 0.013), qHi = z => Math.max(qLo(z) + 1e-4, bodQy(z, bodGh(z).ye - 0.042));
  const zg0 = z0 + 0.03, zg1 = z1 - 0.005;
  const outer = lowSide(s, z0, z1, 44, z => [sLo(z), sHi], 18);
  const inner = bodSideX(s, z0 + 0.012, z1 - 0.012, 22, z => [sAtY(z, bodYSill + 0.016), S4 - 0.012], 10, eIn);
  const trimP = bodSideX(s, z0 + 0.016, z1 - 0.016, 22, z => [sAtY(z, 0.33), S4 - 0.004], 10, eIn + 0.008);   // 1,2 cm minder diep dan eerst: dashboard en stoelen botsten (golf 2)
  const edge = merge([
    patch((z, t) => bodLowX(z, pp(sAtY(z, bodYSill + 0.002)), eIn * t), z0 + 0.012, z1 - 0.012, 26, () => [0, 1], 2),
    ...[z0 + 0.006, z1 - 0.006].map(zz => patch((u, t) => bodLowX(zz, pp(lerp(sAtY(zz, bodYSill + 0.002), S4 - 0.004, u)), eIn * t), 0, 1, 10, () => [0, 1], 2)),
  ]);
  const glass = bodGhSide(s, zg0, zg1, 40, z => [qLo(z), qHi(z)], 8, [], -0.045);
  const hz = -0.40, hy = 0.80, hp = bodAt(hz, hy, 0.0), hn = bodN(hz, sAtY(hz, hy));
  const xin = z => s * 0.635, xAt = y => s * (0.635 + 0.28 * (0.88 - y));   // geleiders langs het glasvlak (het glas helt 0,28)
  const winSlide = extra => ({ type: 'slide', move: [s * 0.07, -0.25, 0], ...extra });   // het glas zakt langs zijn eigen vlak (helling 0,28)
  const hingeZ = z1 + 0.006;
  const hinge = (nm, y) => A(`Scharnier ${nm}`, { d: `${nm === 'boven' ? 'Bovenste' : 'Onderste'} portierscharnier: een blad aan het portier en een blad op de A-stijl met een scharnierpen. In dit model draait het portier om een as vlak voor de voorrand (schematisch).`, ex: [-s * 0.03, 0, 0.12] }, [
    P('Scharnierblad', G.rbox(0.03, 0.07, 0.05, 0.006), MAT.darkSteel, { d: 'Stalen scharnierblad aan het portier; draait met het portier mee.', p: [s * (surfX(z1, y) - 0.04), y, z1 - 0.02], ex: [0, 0, 0.04] }),
    P('Scharnierblad carrosserie', G.rbox(0.03, 0.07, 0.04, 0.006), MAT.darkSteel, { d: 'Scharnierblad aan de carrosseriezijde, geschroefd op de stijl; blijft staan als het portier opent.', p: [s * (surfX(z1 + 0.03, y) - 0.045), y, z1 + 0.035], stay: true, ex: [0, 0, 0.04] }),
    ...[0.022, -0.022].map((dy, i) => P(`Scharnierbout ${i + 1}`, hexBolt(0.025, 0.008, s > 0 ? '-x' : 'x'), MAT.steel, { d: 'Bout M8 waarmee het scharnierblad aan het portier vastzit.', p: [s * (surfX(z1, y) - 0.055), y + dy, z1 - 0.01], ex: [-s * 0.05, 0, 0] })),
  ]);
  const kids = [
    P('Buitenpaneel', outer, MAT.paint, { d: 'Geperste plaatstalen buitenhuid van het portier in het rood; het portier is lang omdat de 3-deurs geen achterportier heeft.', ex: [s * 0.4, 0.14, 0.5] }),
    P('Portierrand', edge, MAT.paintIn, { d: 'Gevouwen rand rond het portier (onderkant en zijkanten) die buitenpaneel en binnenpaneel verbindt.', ex: [-s * 0.1, -0.06, 0] }),
    P('Binnenpaneel', inner, MAT.paintIn, { d: 'Draagframe van het portier waarop raammechaniek, slot en bekleding zitten.', ex: [-s * 0.05, 0, 0] }),
    P('Zijdelingse botsbalk', tube([[xin(z0 + 0.08), 0.42, z0 + 0.08], [xin(zm), 0.44, zm], [xin(z1 - 0.1), 0.43, z1 - 0.1]], 0.016, 16, 8), MAT.steel, { d: 'Stalen buis in het portier die bij een zijaanrijding de indringing beperkt.', ex: [s * 0.22, 0, 0.3] }),
    P('Waterscherm', bodSideX(s, z0 + 0.05, z1 - 0.05, 12, z => [sAtY(z, 0.4), sAtY(z, 0.86)], 6, 0.075), MAT.plastic, { d: 'Kunststof folie tussen binnenpaneel en bekleding die vocht uit de bekleding houdt.', ex: [-s * 0.14, 0.12, -0.26] }),
    P('Zijruit', glass, MAT.glass, { d: 'Zakbare zijruit van gehard, licht getint veiligheidsglas. Zakt elektrisch ongeveer 25 cm in het portier, langs zijn eigen vlak.', ex: [0, 0.32, 0],
      open: winSlide({ min: 0.21, label: `Zijruit ${n}`, look: { dir: [s * 1, 0.7, 0.3], nodes: [dName] } }) }),
    P('Rubber zijruit', bodRim(s, zg0 + 0.001, zg1 - 0.001, qLo, qHi, 0.005, -0.045), MAT.bodSeal, { d: 'Zwart afdichtrubber rond de zijruit; zakt mee met de ruit.', ex: [s * 0.05, 0.03, 0], open: winSlide({ follow: `${dPath}/Zijruit` }) }),
    A('Zijlijsten', { d: 'Beschermlijst op het portier in carrosseriekleur en het gordelrubber onder de ruit.', ex: [s * 0.1, 0, 0] }, [
      P('Beschermlijst', bodMould(s, 0.40, 0.46, z0 + 0.03, z1 - 0.05, 0.007, 36), MAT.paint, { d: 'Verhoogde beschermlijst langs het portier tegen deuken; in carrosseriekleur (Twist).', ex: [s * 0.03, 0, 0] }),
      P('Gordelrubber', bodGhSide(s, zg0, zg1, 30, z => [0, qLo(z)], 2, [], 0.002), MAT.bodSeal, { d: 'Zwarte afstrijkrubbers op de gordellijn onder de zijruit.', ex: [s * 0.06, 0.03, 0] }),
    ]),
    A('Raambediening', { d: 'Elektrische raambediening (Twist) met kabeltrommel: twee geleiderails, een ruitdrager en een motor.', ex: [-s * 0.3, -0.02, 0] }, [
      P('Geleiderail voor', rodBetween([xAt(0.64), 0.64, zm + 0.3], [xAt(0.86), 0.86, zm + 0.3], 0.008, 8), MAT.steel, { d: 'Stalen geleiderail voor de ruitdrager.', ex: [0, 0, 0.05] }),
      P('Geleiderail achter', rodBetween([xAt(0.64), 0.64, zm - 0.3], [xAt(0.86), 0.86, zm - 0.3], 0.008, 8), MAT.steel, { d: 'Stalen geleiderail voor de ruitdrager.', ex: [0, 0, -0.05] }),
      P('Ruitdrager', G.rbox(0.02, 0.03, 0.7, 0.006), MAT.darkSteel, { d: 'Drager waarop de onderrand van de zijruit is geklemd; zakt mee met de ruit.', p: [xin(zm), 0.85, zm], ex: [0, 0.08, 0], open: winSlide({ follow: `${dPath}/Zijruit` }) }),
      P('Bedieningskabels', merge([rodBetween([xAt(0.86) - s * 0.012, 0.86, zm + 0.3], [xAt(0.64) - s * 0.012, 0.64, zm - 0.3], 0.003, 6), rodBetween([xAt(0.86) - s * 0.012, 0.86, zm - 0.3], [xAt(0.64) - s * 0.012, 0.64, zm + 0.3], 0.003, 6)]), MAT.steel, { d: 'Staalkabels die de ruitdrager langs de rails trekken.', ex: [-s * 0.03, 0, 0] }),
      P('Raammotor', merge([G.cyl('x', 0.032, 0.032, 0.045, 20), xf(G.cyl('x', 0.022, 0.022, 0.03, 16), [-0.035, 0, 0])]), MAT.darkSteel, { d: 'Elektromotor met kabeltrommel van de elektrische ruitbediening.', p: [xAt(0.64) - s * 0.012, 0.52, zm], s: [s, 1, 1], ex: [-s * 0.06, -0.06, 0] }),
    ]),
    A('Deurslot', { d: 'Slotmechanisme in de achterrand van het portier met slotmotor voor de centrale vergrendeling (Twist).', ex: [-s * 0.08, 0, -0.16] }, [
      P('Slotkast', G.rbox(0.03, 0.1, 0.04, 0.008), MAT.darkSteel, { d: 'Slotkast met vanghaak die om de slotbeugel in de stijl grijpt; zit binnen de achterrand van het portier.', p: [s * (surfX(z0 + 0.04, 0.78) - 0.02), 0.78, z0 + 0.05], ex: [0, 0, -0.04] }),
      P('Slotmotor', G.rbox(0.03, 0.05, 0.04, 0.008), MAT.plastic, { d: 'Elektrische stelmotor van de centrale vergrendeling.', p: [s * (surfX(z0 + 0.06, 0.72) - 0.02), 0.72, z0 + 0.09], ex: [-s * 0.04, -0.03, 0] }),
      P('Bedieningsstang', rodBetween([s * (surfX(z0 + 0.05, 0.78) - 0.02), 0.79, z0 + 0.06], [s * (hp[0] - 0.02), hy, hz + 0.04], 0.003, 6), MAT.steel, { d: 'Stang tussen buitendeurgreep en slot.', ex: [-s * 0.03, 0, 0] }),
    ]),
    A('Buitendeurgreep', { d: 'Trekgreep van zwart kunststof (Twist: in carrosseriekleur zou ook kunnen; hier zwart aangenomen) met sleutelslot aan de bestuurderszijde.', ex: [s * 0.62, 0, 0] }, [
      P('Greepschaal', G.rbox(0.014, 0.034, 0.16, 0.006), MAT.bodBlack, { d: 'Zwarte trekgreep in een kleine uitsparing van het portier.', ...bodPose(s, [hp[0] + hn[0] * 0.004, hp[1], hp[2]], hn) }),
      P('Greepdrager', G.rbox(0.03, 0.05, 0.2, 0.006), MAT.plastic, { d: 'Kunststof drager achter de buitenhuid waarin de greep scharniert.', ...bodPose(s, bodAt(hz, hy, -0.008), hn), ex: [-s * 0.05, 0, 0] }),
    ]),
    A('Deurbekleding', { d: 'Binnenbekleding van het portier met armsteun, raamschakelaar, binnengreep en kaartvak.', ex: [-s * 0.52, 0, -0.68] }, [
      P('Bekledingspaneel', trimP, MAT.dash, { d: 'Gespoten kunststof bekledingspaneel met stoffen inzet.', ex: [-s * 0.03, 0, 0] }),
      P('Armsteun', G.rbox(0.07, 0.045, 0.34, 0.018), MAT.dash, { d: 'Armsteun in de bekleding, tegelijk greep om het portier dicht te trekken.', p: [s * (surfX(zm, 0.64) - 0.14), 0.64, zm - 0.1], ex: [-s * 0.06, 0, 0] }),
      P('Raamschakelaar', G.rbox(0.05, 0.02, 0.07, 0.006), MAT.plastic, { d: 'Schakelaar van de elektrische ruit.', p: [s * (surfX(zm, 0.67) - 0.15), 0.673, zm + 0.1], ex: [-s * 0.04, 0.04, 0] }),
      P('Binnendeurgreep', G.rbox(0.02, 0.03, 0.12, 0.008), MAT.satin, { d: 'Binnengreep met kabel naar het slot.', p: [s * (surfX(z0 + 0.22, 0.8) - 0.115), 0.8, z0 + 0.22], ex: [-s * 0.06, 0, 0] }),
    ]),
    P('Portierrubber', tube([[z0 + 0.03, 0.80], [z0 + 0.03, 0.34], [zm, 0.34], [z1 - 0.03, 0.34], [z1 - 0.03, 0.80]].map(([z, y]) => { const p = bodAt(z, y, -0.05); return [s * p[0], p[1], p[2]]; }), 0.008, 72, 6), MAT.rubber, { d: 'Rubber afdichting langs de voorrand, onderrand en achterrand van het portier.', ex: [-s * 0.26, -0.1, -0.46] }),
    P('Deurvanger', G.rbox(0.012, 0.03, 0.2, 0.004), MAT.darkSteel, { d: 'Vanger die het portier in twee standen openhoudt.', p: [s * (surfX(z1 - 0.1, 0.62) - 0.016), 0.62, z1 - 0.1], ex: [-s * 0.05, 0, 0.06] }),
    A('Scharnieren', { d: 'Twee portierscharnieren aan de voorrand met elk twee bouten.', ex: [-s * 0.04, 0, 0.1] }, [hinge('boven', 0.62), hinge('onder', 0.53)]),
    bodMirror(s),
  ];
  const piv = [s * (surfX(z1, 0.62) + 0.012), 0.62, z1 + 0.012];
  return A(dName, { d: `Compleet portier aan de ${n}kant (3-deurs): plaatwerk, elektrisch bediende ruit, slot, greep, bekleding, scharnieren en buitenspiegel.`, ex: [s * 0.78, 0.02, 0.16],
    open: { type: 'hinge', pivot: piv, axis: [0, 1, 0], angle: -s * 62 * PI / 180, min: 52 * PI / 180, label: dName, look: { dir: [s * 1, 0.4, 0.12], nodes: [dName] } } }, kids);
}
/* ---------- achterzijde: bumper, achterlichten, achterpaneel ---------- */
const bodTLy0 = 0.59, bodTLy1 = 0.845, bodTLx = 0.40, bodZTL = -1.665;
const bodTLy = f => lerp(bodTLy0, bodTLy1, f);
const bodTLreg = (s, off, f0 = 0, f1 = 1) => merge([
  lowSide(s, ZR + 0.0005, bodZTL, 12, z => [sAtY(z, bodTLy(f0)), sAtY(z, bodTLy(f1))], 4, [], off),
  bodHalfFace(ZR, -1, s, bodTLx, bodTLy(f0), bodTLy(f1), off, 3, 6)]);
function bodTaillamp(s) {
  const n = bodSn(s);
  const lamp = (nm, y) => P(`Lamp ${nm}`, G.cyl('z', 0.011, 0.011, 0.04, 10), MAT.ceramic, { d: `Steeklamp van het ${nm}.`, inner: false, p: [s * 0.45, y, ZR + 0.06], ex: [0, 0, 0.1] });
  return A(`Achterlicht ${n}`, { d: 'Verticaal achterlicht laag in de achterhoek, om de hoek van het achterscherm gewikkeld: rood remlicht en achterlicht, oranje richtingaanwijzer en een helder achteruitrijlicht.', ex: [s * 0.3, 0.1, -0.5] }, [
    P('Lens achterlicht', bodTLreg(s, -0.002, 0.28, 0.72), MAT.lensRed, { d: 'Rode afdeklens van achterlicht en remlicht.', ex: [s * 0.05, 0, -0.1] }),
    P('Lens richtingaanwijzer achter', bodTLreg(s, -0.002, 0.72, 1), MAT.amber, { d: 'Oranje lens van de richtingaanwijzer bovenin het achterlicht.', ex: [s * 0.05, 0.04, -0.1] }),
    P('Lens achteruitrijlicht', bodTLreg(s, -0.002, 0, 0.28), MAT.lensClear, { d: 'Heldere lens van het achteruitrijlicht onderin het achterlicht.', ex: [s * 0.05, -0.04, -0.1] }),
    P('Lichthuis achterlicht', bodTLreg(s, 0.03), MAT.plastic, { d: 'Kunststof behuizing met reflector, in het achterscherm geschroefd.', ex: [-s * 0.04, 0, 0.06] }),
    P('Reflector achterlicht', bodTLreg(s, 0.015), MAT.bodRefl, { d: 'Verchroomde reflector achter de lenzen.', ex: [0, 0, 0.04] }),
    lamp('achterlicht en remlicht', bodTLy(0.5)), lamp('richtingaanwijzer', bodTLy(0.86)), lamp('achteruitrijlicht', bodTLy(0.14)),
  ]);
}
// achterpaneel: staartvlak tussen de achterlichten en onder de achterklep, het dek achter de lip en de randen boven en onder de lichten
function bodRearPanel() {
  const top = bodSec(ZR).yd - 0.001;
  const dk = bodDeck(ZR + 0.0005, BOD_ZG0 - 0.004, 6, () => S4, 10);
  const bands = bodBoth(s => [bodHalfFace(ZR, -1, s, bodTLx, bodTLy1, top, 0, 2, 6), bodHalfFace(ZR, -1, s, bodTLx, bodYBR, bodTLy0, 0, 2, 6),
    lowSide(s, ZR + 0.0005, bodZT0, 8, z => [sAtY(z, bodTLy1), S4], 3), lowSide(s, ZR + 0.0005, bodZT0, 8, z => [sAtY(z, bodYBR + 0.003), sAtY(z, bodTLy0)], 2),
    lowSide(s, bodZTL, bodZT0, 3, z => [sAtY(z, bodTLy0), sAtY(z, bodTLy1)], 4)]).flat();
  return merge([bodFace(ZR, -1, -bodTLx, bodTLx, bodYBR, top, 0, 8, 10), dk, ...bands]);
}
function bodRearBumper() {
  const both = bodBoth;
  return A('Achterbumper', { d: 'Bumperschaal in carrosseriekleur (Twist) met kentekenvlak, reflectoren en richel onder de achterklep; erachter de stalen bumperbalk.', ex: [0, -0.04, -0.7] }, [
    // de schaal begint op z -1,550 (was -1,556): de kier met het boogeinde van het achterscherm (z -1,548) is 2 mm in plaats van 8, zoals de dorpel voor de boog
    P('Bumperschaal achter', bodBumperGeo(bodYBR, -1.550, ZR, -1), MAT.paint, { d: 'Kunststof bumperschaal in het rood met afgeronde hoeken die om de achterwielboog lopen.', ex: [0, -0.02, -0.12] }),
    ...both(s => P(`Reflector achter ${bodSn(s)}`, bodHalfFace(ZR, -1, s, 0.30, 0.43, 0.48, -0.002, 2, 5), MAT.lensRed, { d: 'Rode reflector laag in de bumperhoek.', ex: [s * 0.05, 0, -0.08] })),
    P('Onderrand achterbumper', bodFace(ZR, -1, -0.30, 0.30, 0.345, 0.38, -0.002, 2, 14), MAT.bodBumper, { d: 'Zwarte kunststof afwerkstrook onder in de bumper.', ex: [0, -0.04, -0.1] }),
  ]);
}
function bodRearPlate() {
  return A('Kentekenvlak achter', { d: 'Kentekenplaathouder en verlichting op het achterpaneel, tussen de achterlichten.', ex: [0, 0, -0.3] }, [
    P('Kentekenplaathouder achter', G.rbox(0.54, 0.125, 0.006, 0.004), MAT.bodBumper, { d: 'Zwarte houder voor de achterste kentekenplaat.', p: [0, 0.69, ZR - 0.0], ex: [0, 0, -0.1] }),
    P('Kentekenplaat achter', G.rbox(0.52, 0.11, 0.003, 0.002), MAT.bodPlate, { d: 'Gele Nederlandse plaat met zwarte rand en blauwe EU-strook, met streepjes op de plaats van het kenteken (geen kenteken in dit model).', p: [0, 0.69, ZR - 0.0035], ex: [0, 0, -0.16] }),
    P('Kentekenverlichting', G.rbox(0.1, 0.014, 0.016, 0.004), MAT.lensClear, { d: 'Kleine lamp boven de plaat die het kenteken verlicht.', p: [0, 0.768, ZR + 0.004], ex: [0, 0.06, -0.06] }),
  ]);
}
/* ---------- achterklep ---------- */
const bodTgPv = [0, 1.385, -1.165], bodTgAng = 66 * PI / 180;
// gasveer: carrosseriepunt A binnen de C-stijl, klepunt B op de zijrand van de klep; lengte gesloten en bij 66 graden volgen uit de punten
function bodGsPts(s) {
  const g = bodGh(-1.30), a = [s * 0.616, 0.95, -1.375], b = [s * (g.xr - 0.03), g.yre - 0.035, -1.30];
  const c = Math.cos(bodTgAng), sg = Math.sin(bodTgAng), ry = b[1] - bodTgPv[1], rz = b[2] - bodTgPv[2];
  const bo = [b[0], bodTgPv[1] + ry * c - rz * sg, bodTgPv[2] + ry * sg + rz * c], d = (u, v) => Math.hypot(u[0] - v[0], u[1] - v[1], u[2] - v[2]);
  return { a, b, L0: d(a, b), L1: d(a, bo) };
}
function bodTailgate() {
  const both = bodBoth, sn = bodSn;
  const lo = bodQLoH, zm = (bodZH0 + bodZH1) / 2;
  const heat = merge([-1.28, -1.34, -1.40, -1.46, -1.52, -1.58].map(z => { const pts = []; for (let i = 0; i <= 14; i++) { const w = lo(z) / 2 + 0.003 + (1 - lo(z) - 0.006) * i / 14, p = ghPt(z, w); pts.push([p[0], p[1] - 0.004, z]); } return tube(pts, 0.0013, 20, 3); }));
  const wp = ghPt(-1.585, 0.5 - 0.04), wt = ghPt(-1.585, 0.5 - 0.17), wm = ghPt(-1.585, 0.5 - 0.105);
  const wiper = A('Achterruitwisser', { d: 'Achterruitwisser (standaard op de Alto): arm met blad en motor, onderaan de achterruit.', ex: [0.06, 0.14, 0] }, [
    P('Wisserarm achter', tube([[wp[0], wp[1] + 0.012, wp[2]], [wm[0], wm[1] + 0.014, wm[2] + 0.01], [wt[0], wt[1] + 0.012, wt[2] + 0.02]], 0.0045, 16, 6), MAT.bodBlack, { d: 'Wisserarm.', ex: [0, 0.03, 0] }),
    P('Wisserblad achter', tube([[wm[0] + 0.02, wm[1] + 0.008, wm[2] + 0.062], [wt[0] - 0.05, wt[1] + 0.008, wt[2] + 0.062]].map(p => p), 0.005, 8, 5), MAT.rubber, { d: 'Wisserblad.', ex: [0, 0.06, 0] }),
    P('Asmoerkap', G.cyl('y', 0.013, 0.015, 0.02, 12), MAT.bodBlack, { d: 'Kap over de asmoer van de wisserarm.', p: [wp[0], wp[1] + 0.012, wp[2]], ex: [0, 0.03, 0] }),
    P('Wissermotor achter', merge([G.cyl('z', 0.028, 0.028, 0.07, 16), xf(G.rbox(0.06, 0.045, 0.045, 0.01), [0, 0, -0.05])]), MAT.darkSteel, { d: 'Motor van de achterruitwisser in de klep.', p: [wp[0], wp[1] - 0.06, wp[2] + 0.02], ex: [0, -0.06, 0.06] }),
  ]);
  const gp = bodGsPts(1), Lc = gp.L0 * 0.52, Lr = Math.max(gp.L0 * 0.52, gp.L1 - gp.L0 + 0.1);
  const gasveer = s => { const q = bodGsPts(s); return A(`Gasveer ${sn(s)}`, { d: `Gasveer die de geopende achterklep omhoog houdt; onderaan bevestigd tegen de zijwand van de opening (C-stijl), bovenaan op de zijrand van de klep. Lengte gesloten ${(q.L0 * 1000).toFixed(0)} mm, open ${(q.L1 * 1000).toFixed(0)} mm (geschat; de catalogusmaat is niet gevonden).`, p: q.a, q: quatFromTo(V3(0, 0, 1), V3(q.b[0] - q.a[0], q.b[1] - q.a[1], q.b[2] - q.a[2])), ex: [s * 0.14, 0, 0],
    strut: { a: { node: `Gasveerbevestiging ${sn(s)}`, p: [0, 0, 0] }, b: { node: `${AUTO.wortel}/Carrosserie/Achterklep`, p: q.b }, rod: 'Zuigerstang', lead: `${AUTO.wortel}/Carrosserie/Achterklep`, restLen: q.L0 } }, [
    P('Cilinder', merge([xf(G.cyl('z', 0.0125, 0.0125, Lc, 14), [0, 0, Lc / 2]), G.sphere(0.0145, 10)]), MAT.bodBlack, { d: 'Gasgevulde cilinder van de gasveer met kogelkom aan de carrosseriezijde.', ex: [0, 0, -0.05] }),
    P('Zuigerstang', merge([xf(G.cyl('z', 0.006, 0.006, Lr, 10), [0, 0, q.L0 - Lr / 2]), xf(G.sphere(0.0115, 10), [0, 0, q.L0])]), MAT.steel, { d: 'Verchroomde zuigerstang die uit de cilinder schuift; kogelkom aan de klepzijde.', ex: [0, 0.03, 0.05] }),
  ]); };
  return A('Achterklep', { d: 'Grote achterklep met de hele achterruit, bijna verticaal en met achterruitwisser en verwarmde ruit; scharniert aan de dakrand en wordt door twee gasveren omhooggehouden.', ex: [0, 0.42, -0.5],
    open: { type: 'hinge', pivot: bodTgPv, axis: [1, 0, 0], angle: bodTgAng, min: 60 * PI / 180, label: 'Achterklep', look: { dir: [0.4, 0.6, -1], nodes: ['Achterklep', 'Gasveer links', 'Gasveer rechts'] } } }, [
    P('Buitenpaneel achterklep', bodTailSkinGeo(0), MAT.paint, { d: 'Plaatwerk van de achterklep rond en onder de ruit, in het rood.', ex: [0, 0, -0.08] }),
    P('Binnenpaneel achterklep', bodTailSkinGeo(-0.04, -1.66), MAT.paintIn, { d: 'Binnenframe van de achterklep met scharnier- en slotversteviging; rond de ruit een smalle lijmrand.', ex: [0, 0, 0.04] }),
    P('Binnenbekleding achterklep', bodTailSkinGeo(-0.055, -1.66), MAT.dash, { d: 'Kunststof binnenbekleding van de klep met greep om de klep te sluiten.', ex: [0, 0, 0.12] }),
    P('Achterruit', bodGhDeck(bodZH1, bodZH0, 22, lo, 18, [], -0.003), MAT.glass, { d: 'Verwarmde achterruit van gehard, licht getint glas.', ex: [0, 0.14, 0.02] }),
    P('Rubber achterruit', bodDeckRim(bodZH1 + 0.002, bodZH0 - 0.002, z => lo(z) + 0.01, 0.0045), MAT.bodSeal, { d: 'Zwart afdichtrubber rond de achterruit.', ex: [0, 0.05, 0] }),
    P('Achterruitverwarming', heat, MAT.copper, { d: 'Dunne verwarmingsdraden in de achterruit tegen condens en ijs (patroon schematisch).', ex: [0, 0.1, 0.06] }),
    wiper,
    A('Achterklepslot', { d: 'Slot onderin de klep met slotmotor voor de centrale vergrendeling.', ex: [0, -0.08, 0.04] }, [
      P('Slotkast achterklep', G.rbox(0.08, 0.05, 0.03, 0.008), MAT.darkSteel, { d: 'Slot met vanghaak die om de slotbeugel in het achterpaneel grijpt.', p: [0, 0.905, -1.655], ex: [0, -0.04, 0] }),
      P('Slotmotor achterklep', G.rbox(0.05, 0.04, 0.025, 0.008), MAT.plastic, { d: 'Elektrische ontgrendelmotor.', p: [0.07, 0.905, -1.65], ex: [0.04, 0, 0] }),
    ]),
    ...both(s => { const q = bodGsPts(s); return gasveer(s); }),
    ...both(s => { const q = bodGsPts(s); return P(`Gasveerbeugel ${sn(s)}`, merge([G.sphere(0.012, 10), xf(G.rbox(0.03, 0.02, 0.02, 0.004), [0, 0.016, 0])]), MAT.darkSteel, { d: 'Beugel met kogelpen aan de zijrand van de klep waarop de gasveer draait (plaats geschat).', p: q.b, ex: [s * 0.04, 0.05, 0] }); }),
    ...both(s => P(`Klepscharnierblad ${sn(s)}`, G.rbox(0.026, 0.007, 0.06, 0.003), MAT.bodPillar, { d: 'Plat zwart scharnierblad aan de achterklep, draait om de scharnierpen op de dakrand.', p: [s * 0.42, bodGhHalf(-1.19, bodQAtX(-1.19, 0.42))[1] + 0.001, -1.19], ex: [0, 0.05, -0.02] })),
    ...both(s => P(`Klepscharnier ${sn(s)}`, G.rbox(0.03, 0.014, 0.08, 0.005), MAT.darkSteel, { d: 'Scharnier tussen dak en achterklep, het deel aan de carrosseriezijde; blijft staan als de klep opent.', p: [s * 0.42, bodGh(-1.15).yre - 0.019, -1.15], stay: true, ex: [0, 0.04, 0.04] })),
    ...both(s => P(`Klepbuffer ${sn(s)}`, G.cyl('z', 0.012, 0.012, 0.02, 10), MAT.rubber, { d: 'Rubberen aanslag op de carrosserie die het rammelen van de klep voorkomt.', stay: true, p: [s * 0.45, 0.80, -1.69], ex: [s * 0.03, 0, 0.04] })),
  ]);
}
// gasveerbevestigingen op de C-stijl (carrosseriezijde)
const bodGsMount = s => P(`Gasveerbevestiging ${bodSn(s)}`, merge([G.sphere(0.012, 10), xf(G.cyl('x', 0.004, 0.004, 0.012, 8), [s * 0.009, 0, 0]), xf(G.rbox(0.008, 0.05, 0.04, 0.003), [s * 0.018, 0, 0])]), MAT.darkSteel,
  { d: 'Kogelpen op een plaatje tegen de binnenkant van de C-stijl, waarop de gasveer van de achterklep draait (plaats geschat).', p: bodGsPts(s).a, ex: [s * 0.04, 0, 0] });
/* ---------- tankklep (rechts achter) ---------- */
function bodFuelFlap() {
  const [k0, k1] = bodTkZ, [y0, y1] = bodTkY, ym = (y0 + y1) / 2, xs = surfX(k1, ym);
  return A('Tankvulopening', { d: 'Opening in het rechter achterscherm met de klep en de tankkom; de vulhals en dop zitten in het brandstofsysteem.', ex: [-0.2, 0.05, 0] }, [
    A('Tankklep', { d: 'Kleine klep in carrosseriekleur voor de brandstofvulling; scharniert aan de voorrand (z -1,38) en klapt naar voren open.', ex: [-0.12, 0, 0.1],
      open: { type: 'hinge', pivot: [-(xs + 0.004), ym, k1 - 0.003], axis: [0, 1, 0], angle: 140 * PI / 180, min: 112 * PI / 180, label: 'Tankklep', look: { dir: [-1, 0.3, -0.5], nodes: ['Tankklep'] } } }, [
      P('Klepplaat tankklep', lowSide(-1, k0 + 0.003, k1 - 0.003, 6, z => [sAtY(z, y0 + 0.003), sAtY(z, y1 - 0.003)], 4, [], 0.0), MAT.paint, { d: 'Het paneel van de tankklep in het rood.', ex: [-0.04, 0, 0.04] }),
      P('Klepveer tankklep', G.rbox(0.012, 0.03, 0.012, 0.003), MAT.darkSteel, { d: 'Veerscharnier waarmee de klep dicht blijft; blijft aan de carrosserie zitten.', p: [-(xs - 0.01), ym, k1 + 0.004], stay: true, ex: [-0.03, 0, 0.03] }),
    ]),
    P('Tankkom', G.rbox(0.03, y1 - y0 + 0.02, k1 - k0 + 0.02, 0.006), MAT.plastic, { d: 'Zwarte kom achter de klep rond de vulhals.', p: [-(xs - 0.075), ym, (k0 + k1) / 2], ex: [-0.04, 0, 0] }),
  ]);
}
/* ---------- voorruitwissers en dakrails ---------- */
function bodWipers() {
  const on = (x, z, lift) => { const g = bodGh(z), q = bodQR + (1 - bodQR) * (1 - Math.abs(x) / g.xr), p = bodGhHalf(z, Math.min(1, q), g); return [x, p[1] + lift, z]; };
  const arm = (x0, x1, lift) => tube([0, 0.33, 0.66, 1].map(t => on(lerp(x0, x1, t), 0.835 - 0.02 * Math.sin(PI * t), lift)), 0.0055, 24, 6);
  return A('Ruitenwissers', { d: 'Wisserinstallatie: twee armen met bladen, een motor en een stangenstelsel onder de waterkast.', ex: [0, 1.0, 0.1] }, [
    P('Wisserarm links', arm(-0.03, 0.40, 0.022), MAT.bodBlack, { d: 'Wisserarm aan de bestuurderszijde (linksgestuurd).', ex: [0, 0.08, 0] }),
    P('Wisserarm rechts', arm(-0.47, -0.03, 0.022), MAT.bodBlack, { d: 'Wisserarm aan de passagierszijde.', ex: [0, 0.08, 0] }),
    P('Wisserblad links', arm(0.0, 0.46, 0.008), MAT.rubber, { d: 'Wisserblad bestuurderszijde.', ex: [0, 0.14, 0] }),
    P('Wisserblad rechts', arm(-0.44, 0.02, 0.008), MAT.rubber, { d: 'Wisserblad passagierszijde.', ex: [0, 0.14, 0] }),
    ...[[-0.03, 'bestuurderszijde'], [-0.47, 'passagierszijde']].map(([x, nm]) => P(`Wisseraskap ${nm}`, G.cyl('y', 0.014, 0.016, 0.02, 12), MAT.bodBlack, { d: 'Kap over de asmoer van de wisserarm, op de waterkast.', p: on(x, 0.835, 0.014), ex: [0, 0.05, 0] })),
    P('Wissermotor', merge([G.cyl('z', 0.04, 0.04, 0.09, 16), xf(G.rbox(0.08, 0.06, 0.05, 0.01), [0, 0, 0.06])]), MAT.darkSteel, { d: 'Elektromotor van de ruitenwissers onder de waterkast.', p: [0.3, 0.84, 0.91], ex: [0, -0.1, 0.06] }),   // 5 cm naar voren: de motor stak door het dashboard
    P('Wisserstangenmechaniek', merge([rodBetween([-0.47, 0.86, 0.9], [0.3, 0.84, 0.895], 0.007, 8), rodBetween([0.3, 0.84, 0.895], [-0.03, 0.86, 0.9], 0.007, 8)]), MAT.steel, { d: 'Stangenstelsel dat beide wisserassen aandrijft.', ex: [0, -0.06, 0.12] }),
  ]);
}
// dakrails (Twist): buis op twee voeten langs de dakrand, losse onderdelen zodat ze eenvoudig weg te laten zijn
function bodRoofRails(s) {
  const roofY = (z, x) => { const g = bodGh(z), t = clamp(1 - Math.abs(x) / g.xr, 0, 1); return g.yre + g.cr * t * (2 - t); };
  const xr = z => s * (bodGh(z).xr - 0.06), z0 = -0.93, z1 = -0.08, lift = 0.03;
  const pts = [[z0 - 0.0, 0.012], [z0 + 0.02, lift], [(z0 + z1) / 2, lift], [z1 - 0.02, lift], [z1, 0.012]].map(([z, l]) => [xr(z), roofY(z, xr(z)) + l, z]);
  const foot = (z, nm) => P(`Railvoet ${nm} ${bodSn(s)}`, G.rbox(0.045, 0.026, 0.07, 0.008), MAT.bodBlack, { d: 'Kunststof voet waarop het rail op het dak is geschroefd.', p: [xr(z), roofY(z, xr(z)) + 0.008, z], ex: [s * 0.03, 0.05, 0] });
  return A(`Dakrail ${bodSn(s)}`, { d: 'Dakrail (Twist) langs de dakrand: een zwarte buis op twee voeten. Los gemonteerd en eenvoudig te verwijderen.', ex: [s * 0.3, 0.5, 0] }, [
    P('Railbuis', tube(pts, 0.011, 40, 8), MAT.bodBlack, { d: 'Zwarte kunststof buis over een stalen kern; dient om bagage vast te zetten.', ex: [0, 0.06, 0] }),
    foot(z0, 'voor'), foot(z1, 'achter'),
  ]);
}
/* ---------- opbouw ---------- */
// Zijrepeater: klein oranje herhalingsknipperlicht (ca. 40 x 20 mm) op het voorscherm, net voor de portiervoorrand en boven de wielkast; de plaats is aannemelijk (foto 2001), niet bevestigd
// Hij hangt in dezelfde groep als het voorscherm en schuift met dezelfde uitklapvector mee, zodat hij bij een uitgeklapte carrosserie op het scherm blijft zitten.
function bodRepeater(s) {
  const z = 0.84, y = 0.60, sv = sAtY(z, y), n = bodN(z, sv);
  return P(`Zijrepeater ${bodSn(s)}`, G.rbox(0.006, 0.02, 0.04, 0.004), MAT.bodAmber, { d: 'Oranje herhalingsknipperlicht op het voorscherm (ongeveer 40 x 20 mm); de plaats is aannemelijk op foto\'s van de uitvoering, niet bevestigd.', ...bodPose(s, bodAt(z, y, 0.0005), n), ex: [s * 0.46, 0.06, 0.1] });
}
function buildBody() {
  const sk = bodSkinParts(), both = bodBoth, sn = bodSn;
  const frame = A('Zijwanden en dak', { d: 'Schermen, stijlen, dakrand en dakplaat met de vaste ruiten van de 3-deurs.', ex: [0, 0.32, 0] }, [
    P('Dakpaneel', bodRoofGeo(), MAT.paint, { d: 'Dakplaat van staal in het rood, gelast op de dakranden en de dakbogen; zonder glazen dak.', ex: [0, 0.16, 0] }),
    A('Dakbogen', { d: 'Drie dwarsliggers onder het dakpaneel.', ex: [0, 0.1, 0] }, [[0.30, 'voor'], [-0.45, 'midden'], [-1.05, 'achter']].map(([z, nm]) => P(`Dakboog ${nm}`, (() => { const pts = []; for (let i = 0; i <= 12; i++) { const w = bodQR / 2 + (1 - bodQR) * i / 12, p = ghPt(z, w); pts.push([p[0] * 0.97, p[1] - 0.012, z]); } return tube(pts, 0.0045, 24, 6); })(), MAT.paintIn, { d: 'Dwarsligger onder het dakpaneel.', ex: [0, -0.04, z * 0.05] }))),
    P('Waterkast', bodCowlGeo(), MAT.bodBlack, { d: 'Zwarte kunststof afdekplaat met luchtinlaat voor het interieur, tussen motorkap en voorruit; hierin staan de wisserassen.', ex: [0, 0.1, 0.02] }),
    ...sk.kids, ...both(sk.qGlass), ...both(bodRepeater),
    P('Achterpaneel', bodRearPanel(), MAT.paint, { d: 'Staartvlak tussen de achterlichten, het dek achter de lip en de randen boven en onder de lichten; hierin ligt de sponning van de achterklep.', ex: [0, 0, -0.2] }),
    ...both(s => P(`Slotbeugel B-stijl ${sn(s)}`, merge([xf(G.rbox(0.05, 0.14, 0.01, 0.002), [0, 0, 0.0]), tube([[s * 0.018, 0, 0.0], [s * 0.018, 0, 0.06], [-s * 0.018, 0, 0.06], [-s * 0.018, 0, 0.0]], 0.008, 16, 6)]), MAT.darkSteel, { d: 'Sluitplaat met U-beugel in de achterrand van de portieropening waar het slot van het portier in grijpt (plaats geschat); alleen te zien bij open portier.', p: [s * 0.68, 0.66, bodZDR - 0.04], ex: [s * 0.09, 0, -0.05] })),
    ...both(bodGsMount),
  ]);
  const cage = A('Carrosseriekooi', { d: 'Zelfdragende ruwbouw van de 3-deurs hatchback: vloer, voorbouw, wielkasten, stijlen, dak en schermen.', ex: [0, 0.3, 0] }, [...bodStructure(), frame]);
  return A('Carrosserie', { d: 'Zelfdragende carrosserie van de 3-deurs hatchback in effen rood (Bright Red 2, aannemelijk) met bumpers in carrosseriekleur (Twist), dakrails, alle aanbouwdelen, ruiten en verlichting.', ex: [0, 2.0, 0],
    spec: [['Lengte', '3.495 mm'], ['Breedte zonder spiegels', '1.495 mm'], ['Hoogte', '1.405 mm'], ['Wielbasis', '2.335 mm'], ['Spoorbreedte voor / achter', '1.335 / 1.305 mm']] }, [
    cage, bodHoodParts(), bodTailgate(), bodFrontBumper(), bodRearBumper(), bodDoor(1), bodDoor(-1), bodWindscreen(), bodHeadlamp(1), bodHeadlamp(-1), bodTaillamp(1), bodTaillamp(-1),
    bodFrontPanel(), bodRearPlate(), bodWipers(), bodFuelFlap(), bodRoofRails(1), bodRoofRails(-1),
  ]);
}
