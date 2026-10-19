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
std('bodBumperZwart', 0x1c1d1f, 0, 0.7, { envMapIntensity: 0.15 });   // ongelakt zwart kunststof (voor- en achterbumper, stootstrip en grilleraam, keuze eigenaar naar foto 1993-2001; beslissing 29)
std('bodShield', 0x232529, 0, 0.8, { envMapIntensity: 0.12 });              // afscherming onder de bumper: donker antraciet, nauwelijks omgevingsweerkaatsing (de onderzijde las anders als grijs); 0x232529 geeft 0,55 tot 0,74 keer het luchtrooster (0x060607 gaf 0,28 tot 0,34 en las als zwarte plank)
// lak voor een plaat die van opzij precies op de kant staat achter een dunne huid (Dorpeleinde achter): zonder polygonOffset tekende de GPU hem in een zijblik als lijn van
// 1 beeldpunt door de dorpel heen, terwijl een straal de dorpel eerst raakt. Verder gelijk aan MAT.paint (kloon na de instellingen hierboven).
MAT.bodPaintKant = Object.assign(MAT.paint.clone(), { name: 'bodPaintKant', polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 2 });
std('bodLiner', 0x1a1b1e, 0, 0.9);                                         // zwarte kunststof bekleding van de wielkasten
std('bodBlack', 0x0f1012, 0, 0.62);                                        // zwart kunststof: spiegels, grepen, wissers
std('bodPillar', 0x060607, 0, 0.8, { envMapIntensity: 0.12 });             // zwart rubber en kader
std('bodMirror', 0xb4bec6, 1, 0.04, { envMapIntensity: 1.1 });
std('bodSeal', 0x151618, 0, 0.9);
std('bodChrome', 0xdfe3e7, 1, 0.16, { envMapIntensity: 1.0 });          // verchroomd embleem op de grille (beslissing 29, foto 1993-2001; was 0x26292e graphietgrijs op het honingraatgaas)
std('bodAmber', 0xe05a08, 0, 0.42, { emissive: 0x4d1c00, emissiveIntensity: 0.3, envMapIntensity: 0.3, transparent: true, opacity: 0.82 });   // oranje knipperlichtlens: echt oranje, niet bleekgeel; doorschijnend (B-044), het lamphuis schemert erdoorheen
std('bodPlate', 0xffffff, 0.05, 0.42);                                     // Nederlandse plaat: geel met zwarte rand, blauwe EU-strook en streepjes (map volgt in bodPlateTex)
std('bodEmbleemAchter', 0xffffff, 0.85, 0.25, { envMapIntensity: 0.9 });  // embleem ALTO / SUZUKI op de klep: chroom met donkere letters (map volgt in bodEmbleemTex)
std('bodLamp', 0xe6eaed, 0.3, 0.38, { envMapIntensity: 0.8 });                                       // binnenkant van de koplamp: zilverwitte verchroomde reflectorbak (map volgt in bodLampTex; beslissing 29: lichter, was 0xc4c9ce)
phys('bodLens', { color: 0xd3e0ea, metalness: 0, roughness: 0.01, transparent: true, opacity: 0.16, depthWrite: false, envMapIntensity: 1.5, clearcoat: 1, clearcoatRoughness: 0.02, specularIntensity: 1, side: THREE.FrontSide });   // helder koplampglas: aan de buitenkant gezien (FrontSide), dunner dan lensClear zodat de reflector zichtbaar blijft
phys('bodLensRib', { color: 0xe4edf5, metalness: 0, roughness: 0.03, transparent: true, opacity: 0.10, depthWrite: false, envMapIntensity: 0.6, clearcoat: 0.5, clearcoatRoughness: 0.04, side: THREE.FrontSide });   // hoofdlens met ribbelnormaal (prismaglas); de map volgt in bodHeadlamp
std('bodLampC', 0xaeb4ba, 0.15, 0.55, { envMapIntensity: 0.25 });          // hoekreflector met eigen map (bodLampCTex: zilverwit met donkere facetten en rand), mat genoeg om niet te verzadigen zodat het glas ervoor als glas leest (BODY7-4; was 0xd0d5da, metaal 0,3, ruwheid 0,42)
std('bodLampRim', 0x2a2c30, 0, 0.5, { envMapIntensity: 0.2 });           // lamprand tussen hoofdlens en hoekkap: donkergrijs kunststof met een lichte glans, geen zwart gat
std('bodRefl', 0x5f656c, 0.7, 0.5);                                    // reflectorschaal achter helder glas (donkerder dan spiegelend chroom)
std('bodReflWit', 0xe9ecef, 0.3, 0.3, { envMapIntensity: 0.8 });          // reflector van het achterlicht: licht wit/chroom (de grijze bodRefl las als grijs vlak achter het heldere glas, foto 1993-2001)
phys('bodTLHelder', { color: 0xf6f8fa, metalness: 0, roughness: 0.08, transparent: true, opacity: 0.4, depthWrite: false, envMapIntensity: 0.5 });   // helder deel van het achterlicht: lichter dan lensClear (0xb9c6d0)
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
// stootstrip (zwart kunststof) op de huid: vlakke bovenkant met afgeronde schouders van hgt, tussen y0 en y1 en z zB..zA (zA achter, zB voor), uiteinden lopen in de huid weg over ta (achter) en tb (voor)
function bodStoot(s, y0, y1, zA, zB, hgt, ta, tb, nz = 40, nv = 10) {
  return patch((z, t) => {
    const e = sstep((z - zA) / ta) * sstep((zB - z) / tb), sh = sstep(t / 0.2) * sstep((1 - t) / 0.2), o = hgt * e * sh - 0.001;
    const p = bodAt(z, y0 + (y1 - y0) * t, o); return [s * p[0], p[1], p[2]];
  }, zA, zB, nz, () => [0, 1], nv);
}
// rand (rubber) rond een ruit: gesloten buis langs de ruitrand, qLo(z) onderrand, qHi(z) bovenrand, tussen z0 en z1
function bodRim(s, z0, z1, qLo, qHi, r = 0.0045, out = 0.003, n = 26, open = false, segs = 120, rad = 5) {
  const at = (z, q) => { const p = bodGhAt(z, q, out); return [s * p[0], p[1], p[2]]; }, pts = [];
  if (!open) for (let i = 0; i <= n; i++) { const z = z0 + (z1 - z0) * i / n; pts.push(at(z, qLo(z))); }
  else pts.push(at(z0, qLo(z0)));
  for (let i = n; i >= 0; i--) { const z = z0 + (z1 - z0) * i / n; pts.push(at(z, qHi(z))); }
  if (open) pts.push(at(z1, qLo(z1)));
  return tube(pts, r, segs, rad, !open);
}
// rubber langs de contour van de hoekruit, ook langs de voor- en achterrand gevolgd op de huid: een rechte lijn tussen onder- en bovenhoek van de voorrand lag 12 mm
// binnen de bolling van de wand (bodGhHalf) en verdween in de B-stijl (golf 7). Onderrand en bovenrand volgen qLo en qHi, de schuine achterrand loopt van (z0, qLo) naar (zc, qHi).
function bodKpRim(s, z0, z1, zc, qLo, qHi, r, out, nz, nq, ns, segs, rad) {
  const at = (z, q) => { const p = bodGhAt(z, q, out); return [s * p[0], p[1], p[2]]; }, pts = [];
  for (let i = 0; i < nz; i++) { const z = z0 + (z1 - z0) * i / nz; pts.push(at(z, qLo(z))); }                       // onderrand, van achter naar voor
  for (let i = 0; i < nq; i++) pts.push(at(z1, qLo(z1) + (qHi(z1) - qLo(z1)) * i / nq));                          // voorrand omhoog
  for (let i = 0; i < nz; i++) { const z = z1 + (zc - z1) * i / nz; pts.push(at(z, qHi(z))); }                    // bovenrand, van voor naar achter
  for (let i = 0; i < ns; i++) { const z = zc + (z0 - zc) * i / ns; pts.push(at(z, qHi(z))); }                    // schuine achterrand omlaag
  return tube(pts, r, segs, rad, true);
}
// z waar de hartlijn van het dek op het voorvlak hoogte y heeft (z > 1,6, de neus loopt steil omlaag)
function bodZAtYd(y) { let lo = 1.6, hi = ZF; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (YT(m) + bodC(m) > y) lo = m; else hi = m; } return (lo + hi) / 2; }
/* ---------- naden en grenzen (links; rechts gespiegeld) ---------- */
const bodZDF = 0.78, bodZDR = -0.56;              // voorrand en achterrand van het portier
const bodYSill = 0.268;                            // onderrand portier; de dorpel eindigt 6 mm lager
const bodZFe = 1.63, bodZLh = 1.66;                // achterrand koplamp (voorscherm tot hier), voorrand motorkap (beslissing 29: was 1,54 en 1,60; de kap loopt door tot het steile front)
const bodYBF = 0.50, bodYBR = 0.575;                // bovenrand van de voor- en achterbumper op de flank
const bodZT0 = bodTwi(-1.62);                              // voorrand achterlicht en bumperhoek achter
const bodZHB = 0.917;                              // achterrand motorkap
// Motorkap: halve breedte, met een afgeronde voorhoek (straal bodHoodR) in bovenaanzicht; de rand loopt via een kwartcirkel naar de voorrand bij bodZLh
const bodHoodR = 0.025;
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
const bodXP = 0.385;                              // grens grille en lamp: buitenrand van het grilleraam (beslissing 29; was 0,355, de rand van het rode paneel)
const bodXG = 0.373;                              // halve breedte van de grilleopening: 12 mm binnen de buitenrand van het raam (bodXP)
// grille (beslissing 29, keuze eigenaar naar de foto van de modelreeks 1993-2001): een zwart raam van y 0,555 tot 0,697 over de volle breedte tussen de lampen;
// opening van y 0,567 tot 0,677: onderrand 12 mm, bovenbalk 20 mm (tot de bovenrand 0,697; daarboven ligt de kaprand)
const bodYG0 = 0.567, bodYG1 = 0.677;
// bovenrand bumper = onderrand lamp, paneel en scherm: vrijwel waterpas (0,538 op de flank, 0,550 op de neus), zoals op foto F1; een schuine lijn gaf de hoekkap een hoektand.
// Beslissing 17: 62 mm lager dan eerst (0,600 en 0,612), samen met de neus in body.js; de bumper staat nu 325 mm boven de lip (0,225).
const bodYBT = z => 0.538 + 0.012 * sstep((z - 1.43) / 0.23);
const bodTuck = 0.005;                            // het onderliggende deel loopt zoveel onder het bovenliggende
const bodArchLo = (z, az, yOut) => (Math.abs(z - az) <= ARCH ? archS(z) : sAtY(z, yOut(z)));   // onderrand van een paneel boven de boog
// kas: bovenrand zijruit, onderrand voorruit en achterruit (zijkant), schuine achterrand van de hoekruit
// onderrand van de hoekruit: 3 mm boven de bovenrand van het achterscherm (YT). Was 13 mm: het rubber (straal 4,5 mm) liet dan een kier van 8,5 mm open waardoor je de
// cabine inkeek (golf 7, ruit).
const bodKpY0 = 0.003;
const bodQGl = z => Math.max(bodQy(z, YT(z) + bodKpY0) + 1e-4, bodQy(z, bodGh(z).ye - 0.03));
const bodQLoW = z => bodQAtX(z, bodGh(z).xr - 0.04);
const bodQLoH = z => bodQAtX(z, bodGh(z).xr - 0.05);
const bodQSlant = z => bodQy(z, YT(z) + bodKpY0) + clamp((z + 1.17) / 0.10, 0, 1) * 0.5;
// z waar de schuine achterrand de bovenrand (bodQGl) bereikt: de bovenhoek achter van het gat; ruit, rubber, C-stijl en dakrand sluiten er op aan
const bodKpZc = (() => { let a = -1.17, b = -1.07; for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (bodQSlant(m) < bodQGl(m)) a = m; else b = m; } return (a + b) / 2; })();
// Kiepstand van de hoekruit (achterzijruit): de ruit scharniert aan de voorrand (z -0,74, bij de B-stijl) om een as langs die rand en klapt aan de achterkant naar buiten,
// gehouden door de uitzetter. De voorrand helt met de ruit mee (ongeveer 15 graden uit het verticaal), dus de as helt ook. Alles in de linkerhelft; per zijde gespiegeld.
// De kiephoek volgt uit de opening die de uitzetter achter laat: ongeveer 30 mm bij de onderste achterhoek, 0,43 m van de as (4 graden; geschat, geen maat van de fabrikant).
const bodKpZF = -0.74, bodKpZE = -1.14;                  // voorrand van de ruit; plek van de kiephendel op de achterrand
const bodKpTh = 4 * PI / 180, bodKpMin = 3.3 * PI / 180; // eindhoek en ondergrens (0,8 maal de eindhoek is 3,2 graden)
const bodKpLo = z => bodQy(z, YT(z) + bodKpY0);
const bodKp = (() => {
  const zF = bodKpZF, gB = V3(...bodGhAt(zF, bodKpLo(zF), -0.003)), gT = V3(...bodGhAt(zF, bodQGl(zF), -0.003));   // onder- en bovenhoek van de voorrand op het glasvlak
  const a = gT.clone().sub(gB).normalize(), n = V3(a.y, -a.x, 0);                                                  // as langs de voorrand; n = normaal van het glasvlak, naar buiten en omhoog
  const dep = 0.005, pv = gB.clone().addScaledVector(n, -dep);                                                     // de as ligt 5 mm achter het glas, zodat de scharnierpennen niet door het glas steken
  const at = (z, q, d) => V3(...bodGhAt(z, q, -0.003)).addScaledVector(n, -d);                                      // punt op het glasvlak, d mm achter het glas (naar binnen)
  const hinge = t => gB.clone().lerp(gT, t).addScaledVector(n, -dep);
  const E = at(bodKpZE, bodQSlant(bodKpZE), 0);                                                                  // punt op de achterrand
  // uitzetter: draait om een nagel in de slotplaat, 12 mm voor de achterrand, en loopt naar voren naar de sleufpen van de kiephendel
  const Pb = E.clone().add(V3(0, 0, 0.012)).addScaledVector(n, -0.0105), T0 = Pb.clone().add(V3(0, 0, 0.055));
  const T1 = T0.clone().sub(pv).applyAxisAngle(a, -bodKpTh).add(pv);                                              // de sleufpen na het openen (de ruit draait met -hoek om de as, links)
  const v0 = T0.clone().sub(Pb), v1 = T1.clone().sub(Pb); v1.addScaledVector(a, -a.dot(v1));
  const phi = Math.atan2(a.dot(v0.clone().cross(v1)), v0.dot(v1));
  return { a, n, pv, hinge, at, E, Pb, phi, glide: v1.length() - v0.length(), lean: Math.atan2(-a.x, a.y) };
})();
const bodZW0 = 0.16, bodZW1 = 0.875;               // voorruit: bovenrand en onderrand
const bodZH0 = -1.20, bodZH1 = bodTwi(-1.64);              // achterruit: bovenrand en onderrand
const bodZGR = -1.17;
// opening van de tankklep in het linker achterscherm (bevinding B-005: op de foto's van de 2001 GL staat de klep links, de rechterflank is leeg); bodTkS is de zijde (+1 links).
// systems.js leest dezelfde constanten voor de vulhals.
// De klep is ovaal (foto's van de uitvoering: ongeveer 100 mm breed en 130 mm hoog, geschat); bodTkZ en bodTkY blijven de rechthoek om de opening (hart z -1,45, y 0,72, daar zit de vulhals),
// de halve assen van de ovaal staan in bodTkA.
const bodTkZ = [-1.52, -1.38], bodTkY = [0.65, 0.79], bodTkS = 1, bodTkA = [0.05, 0.065];

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
    extra.push(xf(G.box(t, 0.08, zf - zr), [s * xn, 0.595, (zr + zf) / 2]), xf(G.box(xn - xb, hh, t), [s * xm, y0 + hh / 2, zr]), xf(G.box(xn - xb, hh, t), [s * xm, y0 + hh / 2, zf]));
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
  // hoekstuk boven de lamp: tussen bovenrand lamp en kaprand, van bodZFe tot de punt zTip. De onderrand ligt 6 mm onder de waterpas lopende lampbovenrand (bodHoodFrontY,
  // 0,702) tot hij de schermrand raakt (zTip, ca. z 1,577); daar eindigt het hoekstuk in een punt. Tot cyclus 2 van beslissing 17 liep er na dat punt nog een strook van
  // 3 mm langs de kaprand door tot bodZCe (1,592), over het glas van de hoekkap: een rood flapje met de goot erachter, en van voren een haakje aan het eind van de naad.
  // Voorbij zTip ligt de kaprand direct boven het glas, zoals langs de voorrand van de kap.
  const fenderCLo = z => Math.min(sAtY(z, bodHoodFrontY - 0.006), fenderHi(z));
  const zTip = (() => { let lo = 1.55, hi = bodZCe; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (sAtY(m, bodHoodFrontY - 0.006) < fenderHi(m)) lo = m; else hi = m; } return lo; })();
  const tipBrk = bodDense(1.55, zTip, 8);
  // strook onder de kier en goot volgen in de voorhoek de onderrand van het hoekstuk, zodat ze er nergens onderuit steken
  const cornerLo = (z, sv) => (z > bodZFe ? Math.max(sv, fenderCLo(z) + 0.0002) : sv);
  // De binnenste mm van de strook (vanaf z 1,44 tot 1,50 ingelopen) hoort bij de goot en is zwart: op de steilere flank van de lagere neus las de kier van boven anders als
  // een haarlijn van 1 px of minder; nu, zoals voor beslissing 17, als een donkere lijn van ca. 2 px. De binnenrand blijft 0,5 mm naast de kap: een bredere opening liet
  // stralen van voren langs de kaprand de motorruimte in (veerpoottoren, schutbord).
  const darkW = z => 0.001 * sstep((z - 1.44) / 0.06), topBrk = tipBrk.concat(bodDense(1.40, 1.55, 15));
  // strook en zwarte binnenstrook eindigen 1 mm vóór de punt (cyclus 2, bevinding 4): op dezelfde z stak de laatste driehoek van de strook als rood tandje onder de kaprand uit
  const fenderTop = s => lowSide(s, bodZDF + 0.004, zTip - 0.001, 70, z => [cornerLo(z, bodSAtX(z, bodHoodX(z) + 0.007)), bodSAtX(z, bodHoodX(z) + 0.0005 + darkW(z))], 2, topBrk, 0.003);
  const darkTop = s => bodReg(s, 1.44, zTip - 0.001, 24, 1, z => cornerLo(z, bodSAtX(z, bodHoodX(z) + 0.0005 + darkW(z))), z => bodSAtX(z, bodHoodX(z) + 0.0005), 0.003, topBrk);
  // Goot onder de kier tussen kap en scherm (z 1,38 tot zTip, inloop 60 mm): een zwarte strook die van onder de strook van het scherm (fenderTop, 3 mm diep) schuin
  // omlaag naar binnen loopt, tot 25 mm diep en 7 mm (vanaf z 1,53 13 mm) binnen de kaprand, zodat een straal van boven of van voren die tussen kaprand en strook door de
  // kier komt niet de motorruimte in kijkt (Sproeierreservoir, Veerpoottoren, Schutbord). De kaprand (18 mm, schuin naar binnen) blijft erbinnen, ook bij het openen; de
  // motorkapsteun (bodStF) zwaait er binnen langs.
  // Cyclus 2 van beslissing 17: (1) de bovenrand ligt 0,6 mm onder de strook en niet meer op de schermrand: op de huid las de goot als een tweede, grijze streep naast de
  // kaprand, met een hard blok waar hij begon, en van boven als een donkere wig tot 4 mm breed. (2) Hij begint op z 1,38 in plaats van 1,47 en loopt vanaf z 1,53 verder
  // naar binnen: op een raster van 1 mm liepen stralen van voren langs de schuine naad, onder de kaprand door, naar schutbord en veerpoottoren (46 voor, 1 nu, 17 in B0).
  // (3) De diepte is begrensd door de bovenwand van het lamphuis eronder (3 mm vrij), gemeten waar de goot ligt (14 mm binnen tot 7 mm buiten de kaprand), en niet meer
  // door de lampbovenrand min 9 mm, die tot 20 mm boven het lamphuis lag (z 1,54: goot 16 mm, lamphuis 50 mm diep). Waar het glas van de hoekkap onder de goot komt
  // (vanaf z 1,571) blijft de goot vlak op de diepte van de bovenrand.
  const gootHuis = z => {
    if (z < bodLampZ0 || z > bodZH) return 1;
    const hx = bodHoodX(z), rim = halfPt(z, bodSAtX(z, hx))[1], sL = bodLHi1(z), wall = dd => bodLow(z, sL, dd);
    if (halfPt(z, sL)[0] < hx + 0.0075) return 0;
    let best = 1;
    for (const dx of [-0.014, -0.007, 0, 0.007]) {
      const xt = hx + dx; let a = 0.004, b = 0.073, xa = wall(a)[0];
      if ((xa - xt) * (wall(b)[0] - xt) > 0) continue;
      for (let i = 0; i < 30; i++) { const m = (a + b) / 2, xm = wall(m)[0]; if ((xa - xt) * (xm - xt) <= 0) b = m; else { a = m; xa = xm; } }
      best = Math.min(best, rim - wall(a)[1] - 0.003);
    }
    return Math.max(0, best);
  };
  const gootD = (z, z0) => Math.min(0.025 * sstep((z - z0) / 0.06), gootHuis(z));
  const gootT = 0.0036;   // diepte van de bovenrand: 0,6 mm onder de strook
  // binnenrand op volle diepte 7 mm binnen de kaprand, ruim van de motorkapsteun (die tot z 1,51 door de kier zwaait); vanaf z 1,53 13 mm: de kaprand helt op de bollere
  // flank zo ver naar binnen (onderrand ca. 11 mm binnen de rand) dat er anders een gang tussen kaprand en goot open bleef
  const gootIn = z => 0.008 + 0.006 * sstep((z - 1.50) / 0.03);
  const fenderGoot = s => { const z0 = 1.38;
    return bodReg(s, z0, zTip, 36, 3, z => cornerLo(z, bodSAtX(z, bodHoodX(z) + 0.0065)), z => bodSAtX(z, bodHoodX(z) + 0.001 - gootIn(z) * gootD(z, z0) / 0.025),
      (z, t) => gootT + Math.max(0, gootD(z, z0) - gootT) * t, tipBrk); };
  const fender = s => P(`Voorscherm ${bodSn(s)}`, merge([lowSide(s, bodZDF + 0.004, bodZFe, 44, z => [fenderLo(z), fenderHi(z)], 18, ARCH_BREAKS), lowSide(s, bodZFe - 0.002, zTip, 12, z => [fenderCLo(z), fenderHi(z)], 6, tipBrk), fenderTop(s)]), MAT.paint,
    { d: 'Voorscherm van plaatstaal met de uitsparing voor het voorwiel, gelakt in het rood. Zit met bouten aan de A-stijl, de veerpoottoren en de voorkopplaat.', ex: [s * 0.46, 0.06, 0.1] });
  // de goot is een eigen, donker onderdeel: gelakt las hij van boven als een rode dubbele streep met een donkerrode vouw in plaats van als een donkere naad
  const goot = s => P(`Goot kier kap en scherm ${bodSn(s)}`, merge([fenderGoot(s), darkTop(s)]), MAT.bodSeal,
    { d: 'Goot onder de kier tussen motorkap en voorscherm, schematisch: een zwarte strook onder de kaprand die de kier dichthoudt, zodat je er niet in de motorruimte kijkt.', ex: [s * 0.46, 0.06, 0.1] });
  // achterscherm: van de portierspleet tot het achterlicht, boven de wielboog, tot de schouderlijn
  // Onderrand boven de achterboog met een epsilon: bodArchLo en archS vergelijken |z - AXR| exact met ARCH, en op de breekkolom z = AXR - ARCH geeft de afronding
  // 0,30000000000000004; dan lag de onderrand daar op de bumperlijn (0,578) in plaats van op de boog, en links (kolommen 22 mm uit elkaar) bleef achter de boog een driehoek
  // zonder huid. De extra breekkolommen QB laten de rand de boog aan het achtereinde volgen (een koorde van 22 mm zakte tot 2 cm onder de boog).
  const quarterLo = z => { const dz = Math.abs(z - AXR); return dz <= ARCH + 1e-9 ? sAtY(z, AY + Math.sqrt(Math.max(0, ARCH * ARCH - dz * dz))) : sAtY(z, z > AXR ? bodYSill + 0.004 : bodYBR + 0.003); };
  const QB = ARCH_BREAKS.concat([AXR - ARCH + 0.004, AXR - ARCH + 0.010, AXR - ARCH + 0.020]);
  const quarterGeo = s => {
    // beide kanten met dezelfde kolommen (de dichte kolommen achter de tankklep houden de huid boven de achterboog strak: de strook achter de kier van de
    // wielkast rechts lag met 46 kolommen 2,1 mm buiten de koorde, zijstraal); aan zijde bodTkS (links) is het middenstuk de opening voor de tankklep
    const [k0, k1] = bodTkZ, [y0, y1] = bodTkY;
    const midden = s === bodTkS ? [lowSide(s, k0, k1, 6, z => [quarterLo(z), sAtY(z, y0)], 6), lowSide(s, k0, k1, 6, z => [sAtY(z, y1), S4], 4), bodTkRing(s)] : [lowSide(s, k0, k1, 6, z => [quarterLo(z), S4], 12)];
    return merge([lowSide(s, bodZT0, k0, 16, z => [quarterLo(z), S4], 12, QB), lowSide(s, k1, bodZDR - 0.004, 30, z => [quarterLo(z), S4], 14, QB), ...midden]);
  };
  const quarter = s => P(`Achterscherm ${bodSn(s)}`, quarterGeo(s), MAT.paint,
    { d: 'Achterscherm: de zijwand achter het portier, met de wielboog, de schouder en de plaats voor het achterlicht. Aan het dak, de vloer en het achterpaneel gelast.' + (s === bodTkS ? ' Links met de opening voor de tankklep.' : ''), ex: [s * 0.46, 0.04, -0.14] });
  // stootstrip op het achterscherm: de voortzetting van die op het portier, tot voor de achterboog (de boog begint op deze hoogte op z -1,05; de strip eindigt op z -0,95)
  const stootQ = s => P(`Beschermlijst achterscherm ${bodSn(s)}`, bodStoot(s, 0.49, 0.52, -0.95, bodZDR - 0.004 - 0.003, 0.006, 0.03, 0.006), MAT.bodBumperZwart,
    { d: 'Stootstrip van ongelakt zwart kunststof op het achterscherm, ongeveer 30 mm hoog en 6 mm dik (y 0,49 tot 0,52); voortzetting van de strip op het portier tot voor de achterboog. Keuze eigenaar naar foto 1993-2001.', ex: [s * 0.1, 0, -0.1] });
  const rails = s => P(`Dakrand ${bodSn(s)}`, bodGhSide(s, bodZGR + 0.10, bodZW0, 36, z => [bodQGl(z), bodQR], 12), MAT.paint,   // 12 rijen zoals de C-stijl: geen scheur op de naad bij z -1,07
    { d: 'Dakrand (dakligger) boven de portieren en de hoekruit, gelakt in het rood; de ruitrubbers sluiten er onderlangs op aan. De dakrails (Twist) staan er los bovenop.', ex: [s * 0.1, 0.06, 0] });
  const aPillar = s => P(`A-stijl ${bodSn(s)}`, merge([
    bodGhSide(s, bodZDF + 0.004, bodZW1 + 0.03, 12, z => [0.004, bodQLoW(Math.min(z, bodZW1))], 6),
    bodGhSide(s, bodZW0, bodZDF + 0.004, 30, z => [bodQGl(z), bodQLoW(z)], 5),
  ]), MAT.paint, { d: 'Voorste dakstijl langs de voorruit, hellend naar achteren; gelakt in het rood. Het deel voor het portier loopt door tot de gordellijn.', ex: [s * 0.1, 0.06, 0.06] });
  // B-stijl in carrosseriekleur (keuze eigenaar naar foto 1993-2001; was hoogglans zwart over 176 mm), met hoogstens 30 mm zwart rubber langs de achterrand van het portier
  // De B-stijl en het rubber liggen 1,5 en 3 mm boven de huid; aan de bovenrand loopt die opstaande rand uit naar de huid van de dakrand (anders bleef daar een spleet van 1,5 tot 3 mm
  // waardoor je de cabine inkeek: de lichte lijn boven het raam, golf 7).
  const bodTaper = (z, q, o) => o * sstep((bodQGl(z) - q) / 0.08);
  const bodGhSideT = (s, z0, z1, nu, vr, nv, o) => patch((z, q) => { const [x, y] = bodGhHalf(z, q), d = bodTaper(z, q, o) * (q <= bodQS ? 1 : 0.7); return [s * (x + d), y + (q > bodQS ? d : 0), z]; }, z0, z1, nu, vr, nv);
  const bPillar = s => P(`B-stijl ${bodSn(s)}`, bodGhSideT(s, -0.74, bodZDR - 0.004, 10, z => [0, bodQGl(z)], 8, 0.0015), MAT.paint,
    { d: 'Middenstijl tussen portierruit en hoekruit in carrosseriekleur (keuze eigenaar naar foto 1993-2001); langs het portier loopt een smalle zwarte rubber strook, de sluitplaat van het portierslot zit erachter.', ex: [s * 0.1, 0.04, 0] });
  const bRubber = s => P(`Rubber B-stijl ${bodSn(s)}`, bodGhSideT(s, bodZDR - 0.034, bodZDR - 0.004, 4, z => [0, bodQGl(z)], 8, 0.003), MAT.bodSeal,
    { d: 'Zwart rubber van 30 mm breed langs het portier op de middenstijl; dicht de spleet tussen portier en stijl af (keuze eigenaar naar foto 1993-2001).', ex: [s * 0.12, 0.04, 0] });
  const cPillar = s => P(`C-stijl ${bodSn(s)}`, bodGhSide(s, BOD_ZG0, -1.07, 40, z => [z < bodZGR ? 0 : Math.min(bodQSlant(z) + 0.004, bodQGl(z)), bodQR], 12, bodDense(-1.27, -1.1, 6).concat([bodZGR, bodKpZc])), MAT.paint,
    { d: 'Achterste dakstijl die de hoekruit en de achterklep omlijst; schuin hellend naar de achterkant.', ex: [s * 0.1, 0.05, -0.1] });
  // Hoekruit = achterzijruit: op de 3-deurs kiept hij aan de achterkant een paar cm naar buiten (kiepstand, zie bodKp). Rubber, scharniertjes, kiephendel en uitzetter horen erbij.
  const qTop = z => Math.min(bodQGl(z), Math.max(bodKpLo(z) + 1e-4, bodQSlant(z)));
  const qGlass = s => {
    const n = bodSn(s), K = bodKp, M = v => [s * v.x, v.y, v.z], lean = s * K.lean, ax = [s * K.a.x, K.a.y, 0], path = `Hoekruit ${n}`;
    const bx = (w, h, d, c) => xf(G.box(w, h, d), M(c), [0, 0, lean]);                 // plaatje evenwijdig aan het glasvlak (x = normaal, y = langs de voorrand)
    const back = (c, d) => c.clone().addScaledVector(K.n, -d);                           // d meter achter het glasvlak
    // scharniertje: blad aan de ruit (draait mee), blad op de stijl (blijft staan) en de pen op de draaias
    const hinge = (nm, t) => {
      const c = K.hinge(t), cr = c.clone().addScaledVector(K.n, -0.0015);
      return A(`Scharniertje ${nm}`, { d: `${nm === 'boven' ? 'Bovenste' : 'Onderste'} scharniertje van de kiepruit: een klein blad aan de ruit en een blad op de achterkant van de B-stijl, met een pen op de draailijn langs de voorrand van de ruit. Plaats en maten geschat.`, ex: [-s * 0.05, 0, 0.08] }, [
        P('Scharnierblad ruit', bx(0.003, 0.04, 0.032, cr.clone().add(V3(0, 0, -0.016))), MAT.darkSteel, { d: 'Stalen blad dat aan de binnenkant van de ruit zit; draait met de ruit mee.', ex: [-s * 0.02, 0, -0.05] }),
        P('Scharnierblad stijl', bx(0.003, 0.04, 0.032, cr.clone().add(V3(0, 0, 0.016))), MAT.darkSteel, { d: 'Stalen blad dat aan de achterkant van de B-stijl zit, achter de afdekking; blijft staan als de ruit kiept.', stay: true, ex: [-s * 0.02, 0, 0.05] }),
        P('Scharnierpen', rodBetween(M(c.clone().addScaledVector(K.a, -0.022)), M(c.clone().addScaledVector(K.a, 0.022)), 0.0032, 8), MAT.steel, { d: 'Pen die de twee bladen verbindt; ligt op de draailijn van de ruit.', ex: [-s * 0.04, 0, 0] }),
      ]);
    };
    // kiepslot: kiephendel op de ruit, slotplaat op de stijl en de uitzetter die de ruit in de kiepstand houdt
    const T0 = K.Pb.clone().add(V3(0, 0, 0.055)), lever = back(K.E.clone().add(V3(0, 0, 0.0425)), 0.006);
    const slot = A(`Kiepslot ${n}`, { d: 'Kiepslot aan de achterrand van de ruit: een kiephendel op de ruit, een slotplaat op de C-stijl en een uitzetter die de ruit ongeveer 30 mm naar buiten open houdt (maat geschat).', ex: [-s * 0.06, 0, -0.1] }, [
      P('Kiephendel', merge([bx(0.004, 0.045, 0.075, lever), rodBetween(M(back(T0, -0.003)), M(back(T0, 0.002)), 0.0025, 8)]), MAT.plastic, { d: 'Zwart kunststof hendeltje dat op de achterrand van de ruit zit en de ruit sluit; met een pen die in de sleuf van de uitzetter loopt. Zo wordt de ruit ontgrendeld, naar buiten gekanteld en weer vergrendeld.', ex: [-s * 0.04, 0, -0.04] }),
      P('Slotplaat', bx(0.003, 0.06, 0.085, back(K.E.clone().add(V3(0, 0, -0.0125)), 0.0155)), MAT.darkSteel, { d: 'Stalen plaat op de C-stijl, achter de rand van de ruit; draagt de draaipen van de uitzetter en blijft staan als de ruit kiept.', stay: true, ex: [-s * 0.08, 0, 0] }),
      P('Uitzetter', merge([xf(G.box(0.003, 0.012, 0.081), [0, 0, 0.0345]), xf(G.cyl('x', 0.004, 0.004, 0.006, 10), [-0.0005, 0, 0])]), MAT.steel,
        { d: `Stalen arm die om een pen in de slotplaat draait en de ruit in de kiepstand houdt (ongeveer ${Math.round(K.phi * 180 / PI)} graden bij een ruithoek van 4 graden, geschat); de pen van de kiephendel glijdt in een sleuf in de arm (de sleuf is niet gemodelleerd).`, p: M(K.Pb), r: [0, 0, lean], stay: true, ex: [-s * 0.05, 0, -0.04],
          open: { type: 'hinge', pivot: M(K.Pb), axis: ax, angle: s * K.phi, min: 0.82 * K.phi, follow: path, label: `Uitzetter ${n}` } }),
    ]);
    return A(path, { d: 'Achterzijruit in de C-stijl (3-deurs): een vaste ruit in een kiepframe. Hij scharniert aan de voorrand, bij de B-stijl, en klapt aan de achterkant ongeveer 30 mm naar buiten; de uitzetter en het kiepslot zitten aan de achterrand. Kiephoek ongeveer 4 graden (geschat).', ex: [s * 0.2, 0.06, -0.08],
      open: { type: 'hinge', pivot: M(K.pv), axis: ax, angle: -s * bodKpTh, min: bodKpMin, label: `Achterzijruit ${n}`, look: { dir: [s * 0.7, 0.75, -0.55], nodes: [path] } } }, [
      P('Ruit', bodGhSide(s, -1.17, -0.74, 22, z => [bodKpLo(z), qTop(z)], 7, bodDense(-1.17, -1.07, 6).concat([bodKpZc]), -0.003), MAT.glass,
        { d: 'Veiligheidsglas, licht getint, in een kiepframe; kiept mee met het scharnier aan de voorrand.', ex: [s * 0.04, 0, 0] }),
      P('Rubber hoekruit', bodKpRim(s, -1.169, -0.741, bodKpZc, bodKpLo, qTop, 0.0045, 0.003, 24, 10, 8, 240, 6), MAT.bodSeal,
        { d: 'Zwart rubber langs de rand van de ruit dat de ruit in het kiepframe houdt en tegen de sponning afdicht; kiept met de ruit mee.', ex: [s * 0.06, 0.03, 0] }),
      P('Sponningrubber hoekruit', bodKpRim(s, -1.169, -0.741, bodKpZc, bodKpLo, qTop, 0.002, -0.0097, 12, 6, 5, 120, 4), MAT.bodSeal,
        { d: 'Dun zwart rubber op de rand van de sponning in de carrosserie waar de gesloten ruit tegenaan valt; blijft staan als de ruit kiept.', stay: true, ex: [-s * 0.06, 0, 0] }),
      A('Scharniertjes', { d: 'Twee kleine scharniertjes aan de voorrand van de ruit, bij de B-stijl.', ex: [-s * 0.04, 0, 0.1] }, [hinge('boven', 0.78), hinge('onder', 0.22)]),
      slot,
    ]);
  };
  // afdekstrook achter de portierspleet (z 0,780 tot 0,784, tussen de voorrand van het portier en het scherm): een strook van 28 mm breed (z 0,768 tot 0,796) die 3 mm achter de huid meeloopt,
  // van y 0,30 tot onder de bovenrand. Zonder strook zag je door de spleet (3 tot 4 beeldpunten breed) het Schutbord en de zijkap van het dashboard; een vlak dwars op de spleet vangt de
  // schuine blikken niet die de spleet binnenkomen en pas bij z > 0,784 de huid van het scherm passeren. Zwart, zoals de spleet er in het echt uitziet.
  const flange = s => P(`Schermflens ${bodSn(s)}`, patch((y, t) => { const z = lerp(0.768, 0.796, t); return [s * (ringX(z, y) - 0.003), y, z]; }, 0.30, Math.min(0.90, bodSec(0.78).yd - 0.02), 12, () => [0, 1], 2), MAT.bodLiner,
    { d: 'Strook langs de achterrand van het voorscherm, achter de portierspleet: sluit de spleet tussen scherm en portier af, zodat je er niet in de motorruimte of de cabine kijkt.', ex: [s * 0.46, 0.06, 0.1] });
  kids.push(...bodBoth(fender), ...bodBoth(goot), ...bodBoth(flange), ...bodBoth(quarter), ...bodBoth(stootQ), ...bodBoth(rails), ...bodBoth(aPillar), ...bodBoth(bPillar), ...bodBoth(bRubber), ...bodBoth(cPillar));
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
    P('Bodemplaat', bodBodemplaat(), MAT.underbody, { d: 'Gelaste vloerplaat van de ruwbouw met bevestigingspunten voor de stoelen en het onderstel; onder de achterbank een opening voor de tankkuip.', ex: [0, -0.1, 0] }),
    P('Tankkuip', bodTankkuip(), MAT.underbody, { d: 'Verhoogd deel van de vloer onder de achterbank waarin de brandstoftank van onderen hangt: binnen 530 x 140 x 330 mm (x -0,18 tot 0,35, tot y 0,375, z -0,96 tot -0,63), 10 mm ruimte rond de tank en 25 mm onder de zitting.', ex: [0, -0.1, 0] }),
    P('Dwarsbalk voorstoelen', G.box(0.86, 0.05, 0.08), MAT.paintIn, { d: 'Dwarsbalk onder de voorstoelen die vloer en dorpels verbindt.', p: [0, 0.245, 0.15], ex: [0, 0.06, 0.04] }),
    // voor de tankkuip (was z -0,96 tot -0,88, waar de tank nu zit); 48 mm hoog (y 0,222 tot 0,270): het hitteschild van de middendemper loopt eronder tot y 0,221
    P('Dwarsbalk achterbank', G.box(0.86, 0.048, 0.08), MAT.paintIn, { d: 'Dwarsbalk onder de voorkant van de achterbank, vóór de tankkuip.', p: [0, 0.246, -0.585], ex: [0, 0.06, -0.04] }),
    // naast de kuip op de oude plaats van de dwarsbalk (z -0,946 tot -0,88, 1 mm voor de vloerstrook van de achtervloer): de balk sloot de laag tussen vloer en
    // vloerbedekking van achteren af; zonder deze stukken zag je van laag achter (meet.py --achter, onderdoorkijk onder de dorpel) de vloerbedekking en de
    // instaplijsten. Onderkant 0,5 mm boven de vloer (0,229), bovenkant 1 mm onder de vloerbedekking (0,267); buiten |x| 0,4305 sluit Dorpeleinde achter aan.
    ...both(s => { const xa = s > 0 ? bodKuip.x1 + 0.001 : -bodKuip.x0 + 0.001, xb = 0.43, y0 = 0.2295, y1 = 0.266, z0 = -0.946, z1 = -0.88;
      return P(`Dwarsbalk naast tankkuip ${sn(s)}`, G.box(xb - xa, y1 - y0, z1 - z0), MAT.paintIn, { d: 'Stuk dwarsbalk tussen de tankkuip en de dorpel onder de achterbank; sluit de ruimte tussen vloer en vloerbedekking af.', p: [s * (xa + xb) / 2, (y0 + y1) / 2, (z0 + z1) / 2], ex: [s * 0.06, 0.06, -0.04] }); }),
    ...both(s => P(`Langsligger achter ${sn(s)}`, G.box(0.05, 0.1, 0.62), MAT.paintIn, { d: 'Langsligger onder de bagageruimte die de achterbumperbalk draagt (plaats schematisch).', p: [s * 0.42, 0.34, -1.40], ex: [s * 0.06, -0.06, 0] })),
    P('Achtervloer', bodAchtervloer(), MAT.underbody, { d: 'Gelaste achtervloer boven de achteras: de bodem onder de bagagevloer tussen de wielkasten, de hielplaat achter de achterbank en de vloerstrook tot de dwarsbalk achterbank, met donkere onderbodembescherming.', ex: [0, -0.1, 0] }),
    ...both(s => bodSill(s)),
    // flens achter de naad tussen dorpel (tot y 0,262) en achterscherm (vanaf 0,272), van z -0,935 (1 mm voor het vooreinde van de koker achter, die tot z -0,936 loopt)
    // tot 4 cm achter de portierspleet, 4 mm binnen de huid: door de naad keek je anders vanuit de lage rondgang op de vloerbedekking (open punt AWK). Gelakt, zodat de naad
    // leest als een schaduwlijn in de doorlopende plaat en niet als zwarte band onder het scherm. Hoort bij de dorpel (klasse buitenkant in meet.py): in Achterbouw telde
    // hij als onderstel en vlagden de kierpoorten van de voorkant (schuin-ver, eig-hoger) hem door de naad.
    ...both(s => P(`Dorpelflens achter ${sn(s)}`, lowSide(s, AXR + ARCH + 0.013, -0.60, 20, z => [sAtY(z, 0.255), sAtY(z, 0.280)], 2, [], 0.004), MAT.paint,
      { d: 'Gelakte flens van de dorpel achter de naad met het achterscherm, voor de achterwielboog; sluit de naad af, zodat je er niet op de vloer van het interieur kijkt.', ex: [s * 0.14, -0.05, 0] })),
    // achtereinde van de vloerkoker (open punt VLOER): tussen dorpel en bodemplaat (y 0,221) en de vloerbedekking (0,267) liep de koker voor de achterboog open naar achteren. Onder het
    // vooreinde van de wielkastkoker (y 0,250) en de wand (0,245) door keek je vanuit een zeer lage blik (h 0,15 m of lager) op de onderkant van de vloerbedekking. Zie bodDorpelEinde.
    ...both(s => P(`Dorpeleinde achter ${sn(s)}`, bodDorpelEinde(s), MAT.bodPaintKant,
      { d: 'Gelakte sluitplaat aan het achtereinde van de dorpel, voor de achterwielboog: sluit de koker tussen dorpel, bodemplaat en vloer af, zodat je van onderen niet op de vloerbedekking kijkt.', ex: [s * 0.14, -0.05, 0] })),
  ]);
  const front = A('Voorbouw', { d: 'Dragende voorbouw: langsliggers, veerpoottorens, schutbord, frontmodule en bumperbalk.', ex: [0, 0.05, 0.42] }, [
    // 65 mm hoog (y 0,306 tot 0,371) in plaats van 90 mm (0,285 tot 0,375): de linker aandrijfas (tripodehuis tot y 0,3005, klem tot 0,303)
    // loopt eronder door en de spoorstang en de accusteun liggen erboven; op de oude maat stak de as 15 mm in de ligger (B-030). Beide kanten gelijk.
    ...both(s => P(`Langsligger voor ${sn(s)}`, G.box(0.05, 0.065, 0.80), MAT.paintIn, { d: 'Kokerprofiel in de motorruimte dat botsenergie opvangt (plaats en maten schematisch).', p: [s * 0.42, 0.3385, 1.20], ex: [s * 0.08, 0, 0] })),
    // onderkant op y 0,62 (was 0,56): hij lag onder de bovenkant van de wielkastbekleding (y 0,577) en stak als rood blok boven de band uit in de wielkastcamera's van opzij
    ...both(s => P(`Veerpoottoren ${sn(s)}`, merge([G.cyl('y', 0.05, 0.07, 0.14, 24, true), xf(G.cyl('y', 0.05, 0.05, 0.006, 24), [0, 0.07, 0])]), MAT.paintIn, { d: 'Bevestigingspunt van de veerpoot in de carrosserie.', p: [s * 0.50, 0.69, AXF], ex: [s * 0.1, 0.06, 0] })),
    // onder y 0,58 loopt het schutbord alleen tot de wielkastwanden (|x| 0,50): daarbuiten zit het voorwiel (de band stak erdoorheen)
    P('Schutbord', cache('bodSchutbord', () => roundPlate([[-0.5, -0.3], [0.5, -0.3], [0.5, -0.02], [0.69, -0.02], [0.69, 0.3], [-0.69, 0.3], [-0.69, -0.02], [-0.5, -0.02]], 0.012, 0.004, 0.004)), MAT.paintIn, { d: 'Scheidingswand tussen motorruimte en interieur met doorvoeren voor stuurkolom, pedalen en kabelboom.', p: [0, 0.60, 0.86], ex: [0, 0, -0.08] }),
    // bovenbalk 0,645 tot 0,670 (was tot 0,695) en 680 mm breed (was 840, tot over de stijlen): de lagere kapvoorrand (beslissing 17) met de kaprand en het voorpaneel ligt er
    // nu vlak boven, en de lagere koplampen liggen ervoor; een bredere balk stak achter het glas door de reflector. De onderkant blijft op 0,645
    P('Frontmodule', merge([xf(G.box(0.68, 0.025, 0.05), [0, 0.6575, 0]), xf(G.box(1.0, 0.05, 0.05), [0, 0.33, 0]), xf(G.box(0.05, 0.35, 0.05), [0.33, 0.495, 0]), xf(G.box(0.05, 0.35, 0.05), [-0.33, 0.495, 0]), xf(G.box(0.05, 0.3, 0.05), [0, 0.5, 0])]), MAT.plastic, { d: 'Kunststof en stalen voorkopplaat die radiateur, koplampen en motorkapslot draagt.', p: [0, 0, 1.575], ex: [0, 0.04, 0.12] }),
    P('Motorkapslot', merge([G.rbox(0.07, 0.05, 0.04, 0.008), xf(G.rbox(0.02, 0.04, 0.015, 0.004), [0.04, 0.01, 0.015])]), MAT.darkSteel, { d: 'Slot op de voorkopplaat waarin de slotbeugel van de motorkap grijpt; ontgrendeling met een kabel vanuit het interieur.', p: [0, bodSlotY, 1.55], ex: [0, 0.06, 0.06] }),   // boven de bovenste waterkast van de radiateur (y 0,655); op y 0,625 zat het slot erin
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
//   op y 0,477, 5 mm boven het veerrubber). De remslang loopt door de veerkoker naar buiten: doorvoeren in de wand, de achterste zijplaat en de binnenplaat;
// - een strook 4 mm binnen de huid achter de kier tussen het boogeinde van het achterscherm (z -1,548) en de bumperschaal (z -1,550), van y 0,27 tot 0,585.
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
  // strook achter de kier bij het boogeinde: binnen de boog 4 mm boven de boogrand (achter de huid), daarbuiten vanaf y 0,27
  const lo = z => { const dz = Math.abs(z - az); return dz < ARCH + 1e-9 ? AY + Math.sqrt(Math.max(0, ARCH * ARCH - dz * dz)) + 0.004 : 0.27; };   // tolerantie zoals quarterLo: |-1,548 + 1,248| is 0,30000000000000004
  const kier = lowSide(s, -1.572, -1.536, 10, z => [sAtY(z, lo(z)), sAtY(z, 0.585)], 10, [az - ARCH + 1e-6], 0.004);
  return merge([wall, arc, binnen, zijA, zijV, dak, kier]);
}
// Achtervloer (open punt AWK, B3): tussen de achterwielkasten is de bodemplaat maar 0,14 breed (de achteras loopt eronder door), en de bagagevloer (interieur, y 0,455)
// was van onderen de enige afsluiting. Vanuit een lage blik achter het achterwiel (h 0,15 m) keek je onder de bumper door, onder de bagagevloer langs tot onder de
// achterbank (zijbekleding achter en achterbank, zitting). Drie platen, alle drie binnen de wanden van de wielkast (|x| 0,498) en boven alle asdelen:
// - bodem 8 mm onder de bagagevloer (y 0,447) van z -1,595 (10 mm voor de bumperbalk) tot de hielplaat; achter de boog tot |x| 0,56 (vulpijp vanaf |x| 0,597), bij de
//   veerkoker tot |x| 0,465 (binnenplaat op 0,466) en links om de kabelboom achter tot |x| 0,476 (die kruist y 0,447 bij |x| 0,486 tot 0,504, z -1,543 tot -1,511);
// - hielplaat op z -1,036 (6 mm achter de zitting, z -1,030) van y 0,262 tot 0,447;
// - vloerstrook op y 0,262 (5 mm onder de vloerbedekking, 6 mm boven de langsarm) van de hielplaat tot de dwarsbalk achterbank (z -0,961) en naast de dwarsbalk tot z -0,947.
// Tankkuip (golf 5, op verzoek van de orkestrator): onder de achterbank lag de vloer op y 0,221 tot 0,229, zodat de tank er maar 37,5 mm hoog paste. De kuip is een
// verhoogd vloerdeel: vier wanden vanaf de vloer (YB + 2 mm) en een dak op y 0,375, binnenmaten x -0,18 tot 0,35 en z -0,96 tot -0,63 (tank x -0,17 tot 0,34,
// y 0,225 tot 0,365, z -0,95 tot -0,64, 10 mm ruimte rondom). De zitting van de achterbank begint op y 0,400 (Zitbekleding achter), 25 mm boven het dak.
// De bodemplaat heeft hier een opening; de dwarsbalk achterbank staat voor de kuip.
const bodKuip = { x0: -0.18, x1: 0.35, z0: -0.96, z1: -0.63, yT: 0.375 };
const bodFloorP = (z, x) => { const c = bodSec(z); return x / c.cxb * S1; };   // p van de vlakke bodem bij x (negatief rechts)
function bodBodemplaat() {
  const K = bodKuip, f = (z, p) => bodLow(z, p, 0.002), L = z => (z < AXR - ARCH ? S1 : (z < AXR + ARCH ? S1 * 0.102 / 0.14 * 0.14 : S1 * 0.55));
  const brk = ARCH_BREAKS.concat([AXR - ARCH - 0.002, AXR - ARCH + 0.002]), zC = AXR + ARCH + 0.0005;
  // tussen K.z0 en de achterboog (z -0,948) is de bodem maar |x| 0,07 breed en valt hij helemaal binnen de kuip
  return merge([patch(f, -1.62, K.z0, 26, z => [-L(z), L(z)], 10, brk), patch(f, K.z1, 0.80, 34, z => [-L(z), L(z)], 10, brk),
    patch(f, zC, K.z1, 8, z => [-L(z), bodFloorP(z, K.x0)], 3), patch(f, zC, K.z1, 8, z => [bodFloorP(z, K.x1), L(z)], 2)]);
}
function bodTankkuip() {
  const K = bodKuip, yb = z => YB(z) + 0.002;
  const wandX = x => patch((z, t) => [x, lerp(yb(z), K.yT, t), z], K.z0, K.z1, 8, () => [0, 1], 2);
  const wandZ = z => patch((x, t) => [x, lerp(yb(z), K.yT, t), z], K.x0, K.x1, 8, () => [0, 1], 2);
  const dak = patch((x, z) => [x, K.yT, z], K.x0, K.x1, 4, () => [K.z0, K.z1], 4);
  return merge([wandX(K.x0), wandX(K.x1), wandZ(K.z0), wandZ(K.z1), dak]);
}
function bodAchtervloer() {
  const V = (a, b) => new THREE.Vector2(a, b), xw = 0.498, xa = 0.56, xv = 0.465, xk = 0.476, yB = 0.447, yV = 0.262, zH = -1.036, zA = -1.595;
  const vlak = (pts, y) => { const g = new THREE.ShapeGeometry(new THREE.Shape(pts.map(([x, z]) => V(x, z))), 1); g.rotateX(HALF); g.translate(0, y, 0); return g; };   // (x, z) -> (x, y, z)
  const bodem = vlak([[-xa, zA], [xa, zA], [xa, -1.556], [xk, -1.556], [xk, -1.480], [xw, -1.480], [xw, -1.175], [xv, -1.175], [xv, -1.055], [xw, -1.055], [xw, zH],
    [-xw, zH], [-xw, -1.055], [-xv, -1.055], [-xv, -1.175], [-xw, -1.175], [-xw, -1.556], [-xa, -1.556]], yB);
  const hiel = (() => { const g = new THREE.ShapeGeometry(new THREE.Shape([V(-xw, yV), V(xw, yV), V(xw, yB), V(-xw, yB)]), 1); g.translate(0, 0, zH); return g; })();
  // naast de tankkuip tot z -0,947 (de dwarsbalk achterbank lag hier tot golf 5 en sloot de strook af); binnen de kuip tot 1 mm voor de achterwand
  const strook = vlak([[-xw, zH], [xw, zH], [xw, -0.947], [bodKuip.x1 + 0.001, -0.947], [bodKuip.x1 + 0.001, bodKuip.z0 - 0.001], [bodKuip.x0 - 0.001, bodKuip.z0 - 0.001], [bodKuip.x0 - 0.001, -0.947], [-xw, -0.947]], yV);
  return merge([bodem, hiel, strook]);
}
// sluitplaat in het vlak z -0,930: 4 mm voor wielkastkoker en wand (tot z -0,934) en tussen de Dwarsbalk achterbank (|x| tot 0,430, z -0,96 tot -0,88) en de dorpel.
// De onderrand volgt de dorpel (0,8 mm erbinnen, zie hieronder), de bovenrand ligt op y 0,265 (2 mm onder de vloerbedekking) en buiten |x| 0,7275 op 0,254,
// onder de Dorpelflens achter (|x| 0,729 tot 0,732, vanaf y 0,255 en z -0,935). Blijft binnen de huid. Gelakt zoals de dorpel: schuin van achteren zie je de plaat in de
// onderste hoek van de boog, waar eerst de binnenkant van de dorpel te zien was; donker las hij daar als zwarte plaat. Langsarm en Kabelboom achter lopen erdoorheen, zoals
// de langsarm al door de dorpel loopt (clash.py: onzeker, niet gesloten; geen doordringing).
function bodDorpelEinde(s) {
  const z = -0.930, sX = x => { let a = 0, b = 2 * S1; for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (halfPt(z, m)[0] < x) a = m; else b = m; } return (a + b) / 2; };
  const s0 = sX(0.4305), sA = sX(0.7275), sB = sAtY(z, 0.254);
  // onderrand op het vlak van de dorpel zoals bodSill het tekent (rijen in z, 8 vakken van S1 * 0,55 tot de dorpelrand), lineair tussen de twee rijen rond z en tussen de
  // knopen, 0,8 mm naar binnen: op de exacte doorsnede stak de rand in de bocht door de koorden van de dorpel en las als lijn op de dorpel
  const zd0 = AXR + ARCH + 0.002, dzd = (AXF - ARCH - 0.002 - zd0) / 40, j = Math.floor((z - zd0) / dzd), zr = [zd0 + j * dzd, zd0 + (j + 1) * dzd], fz = (z - zr[0]) / dzd;
  const sa = S1 * 0.55, ns = 8, knoop = (zz, k) => sa + (sAtY(zz, bodYSill - 0.006) - sa) * k / ns, sb = lerp(knoop(zr[0], ns), knoop(zr[1], ns), fz);
  const kp = k => { const p = halfPt(zr[0], knoop(zr[0], k)), q = halfPt(zr[1], knoop(zr[1], k)); return [lerp(p[0], q[0], fz), lerp(p[1], q[1], fz)]; };
  const rand = u => { const f = (u - sa) / (sb - sa) * ns, k = Math.min(ns - 1, Math.max(0, Math.floor(f))), p = kp(k), q = kp(k + 1), n = bodN(z, u);
    return [lerp(p[0], q[0], f - k) - n[0] * 0.0008, lerp(p[1], q[1], f - k) - n[1] * 0.0008]; };
  const breaks = Array.from({ length: ns + 1 }, (_, k) => sa + (sb - sa) * k / ns);
  const deel = (u0, u1, n, yT) => patch((u, t) => { const [x, y] = rand(u); return [s * x, lerp(y, yT, t), z]; }, u0, u1, n, () => [0, 1], 1, breaks);
  return merge([deel(s0, sA, 14, 0.265), deel(sA, sB, 2, 0.254)]);
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
// Beslissing 17 (kap op de flank lager): de steun staat 15 mm verder naar binnen (x -0,56 en -0,525). Bij de lagere kaprand ging zijn top bij het openen (tot z 1,51) eerder door de schermrand;
// nu blijft hij 6 mm binnen de rand van de goot onder de kier tussen kap en scherm (vanaf z 1,38, 7 mm binnen de kaprand). Beslissing 29 (flank tot 24 mm hoger): de bovenkant
// staat nog 10 mm verder naar binnen (x -0,515); op -0,525 raakte de stang bij het openen de goot rechts (39 mm, opentest).
const bodStG = [-0.515, 0.775, 1.40], bodStGw = bodHoodPt(bodStG), bodStF = [-0.56, 0.84, 1.0];
const bodStL = Math.hypot(bodStGw[0] - bodStF[0], bodStGw[1] - bodStF[1], bodStGw[2] - bodStF[2]);
const bodStRot = (() => {
  const c = Math.min(0.99, 0.36 / bodStL), r0 = V3(0, -Math.sqrt(1 - c * c), c), r1 = V3(bodStGw[0] - bodStF[0], bodStGw[1] - bodStF[1], bodStGw[2] - bodStF[2]).normalize();
  const ax = r0.clone().cross(r1).normalize();
  return { r0, ax: [ax.x, ax.y, ax.z], ang: Math.acos(clamp(r0.dot(r1), -1, 1)) };
})();
// Kaprand: terugslag (flens) langs de voorrand, de afgeronde voorhoeken en de zijranden vanaf z 1,2; 18 mm diep, schuin naar binnen en 6 mm naar achteren
// De bovenrand van de kaprand ligt op precies dezelfde punten als de rand van het buitenpaneel (zelfde rijen in z, zelfde kolommen op de voorrand): met eigen rijen
// (16 langs de zijrand) week de koorde bij de sterker gebogen neus van beslissing 17 tot enkele mm af van de paneelrand, en in de lage hoekcamera's keek je door die
// spleet onder de kap (Steunopvanger, Binnenframe).
function bodHoodRim() {
  const R = bodHoodR, z0 = bodZLh - R, zE = bodZLh - 0.0003, hs = z => bodSAtX(z, bodHoodX(z));
  const rows = [], NU = 44, brk = bodDense(1.4, bodZLh, 6).concat(bodHoodArcZ(14));   // de rijen van 'Buitenpaneel motorkap' (bodHoodParts)
  for (let i = 0; i <= NU; i++) rows.push(bodZHB + (zE - bodZHB) * i / NU);
  brk.forEach(b => { if (b > bodZHB + 1e-4 && b < zE - 1e-4) rows.push(b); });
  rows.sort((a, b) => a - b);
  const zs = [bodZHB + 0.004, ...rows.filter(z => z > bodZHB + 0.004 + 1e-4)];
  const L = zs.map(z => {   // linkerhelft van de zijrand (achter) naar de voorhoek: { z, p, uitwaartse x en z }
    const th = z > z0 ? Math.asin(clamp((z - z0) / R, 0, 1)) : 0;
    return { z, p: hs(z), ox: Math.cos(th), oz: Math.sin(th) };
  });
  const hE = hs(zE), NV = 14, mid = [];   // voorrand: de kolommen van het paneel op de laatste rij
  for (let j = 1; j < NV; j++) mid.push({ z: zE, p: hE + (2 - 2 * hE) * j / NV, ox: 0, oz: 1 });
  const R2 = L.map(q => ({ z: q.z, p: 2 - q.p, ox: -q.ox, oz: q.oz })).reverse();
  const pts = [...L, ...mid, ...R2];
  const N = pts.length - 1;
  return patch((u, v) => {
    const i = Math.min(N - 1, Math.floor(u)), f = u - i, a = pts[i], b = pts[i + 1];
    const z = lerp(a.z, b.z, f), pp = lerp(a.p, b.p, f), ox = lerp(a.ox, b.ox, f), oz = lerp(a.oz, b.oz, f);
    const q = bodLow(z, pp, 0.018 * v);
    return [q[0] - ox * 0.006 * v, q[1], q[2] - oz * 0.006 * v];
  }, 0, N, N, () => [0, 1], 2);
}
// diepte van het binnenframe onder de buitenhuid: 30 mm, naar de voorrand toe 19 mm (echte kap: het binnenpaneel loopt naar de felsnaad aan de voorrand). Met de lagere
// neus van beslissing 17 blijft het zo 7 mm boven de aanzuigmond van het luchtfilter (top y 0,715 op z 1,57); ondieper (8 mm) kwam het frame op de hoogte van de
// bovenwand van de koplamp en keek je in de lage hoekcamera's tussen beide door de motorruimte in.
const bodFrameOff = z => lerp(0.03, 0.019, sstep((z - 1.48) / 0.08));
const bodSlotY = 0.682;   // hart van het motorkapslot (hoogte 50 mm, top 0,707); de slotbeugel loopt van het binnenframe tot 28 mm boven dit hart en steekt (met de boog van de buis) 5,5 mm in het slot
function bodHoodParts() {
  const hs = z => bodSAtX(z, bodHoodX(z)), both = bodBoth, sn = bodSn;
  const deckIn = (z0, z1, off, da, nu = 24) => bodDeck(z0, z1, nu, z => Math.min(0.995, hs(z) + da), 8, bodHoodArcZ(8), off);
  return A('Motorkap', { d: 'Motorkap van plaatstaal met binnenframe, isolatiemat, scharnieren, slotbeugel en sproeiers. Scharniert aan de achterrand en wordt met een steunstang open gehouden.', ex: [0, 0.52, 0.3],
    open: { type: 'hinge', pivot: bodHoodPv, axis: [1, 0, 0], angle: bodHoodAng, min: 55 * PI / 180, label: 'Motorkap', look: { dir: [0.5, 0.55, 1], nodes: ['Motorkap'] } } }, [
    P('Buitenpaneel motorkap', bodDeck(bodZHB, bodZLh - 0.0003, 44, hs, 14, bodDense(1.4, bodZLh, 6).concat(bodHoodArcZ(14))), MAT.paint, { d: 'Buitenhuid van de motorkap in het rood, licht bol over de breedte.', ex: [0, 0.14, 0] }),
    P('Kaprand', bodHoodRim(), MAT.bodSeal, { d: 'Zwarte afdichtrand: de terugslag van de kapbuitenhuid langs de voorrand, de voorhoeken en de zijranden. Hij maakt de naad met scherm, lamp en paneel donker en houdt de kap massief.', ex: [0, 0.04, 0.02] }),
    P('Binnenframe motorkap', deckIn(bodZHB + 0.02, bodZLh - 0.02, bodFrameOff, 0.012), MAT.paintIn, { d: 'Verstevigend binnenframe met de bevestigingspunten van de scharnieren en de slotbeugel.', ex: [0, 0.03, 0] }),
    P('Motorkapisolatie', deckIn(bodZHB + 0.09, bodZLh - 0.12, 0.04, 0.05, 16), MAT.carpet, { d: 'Geluids- en hitte-isolatiemat aan de onderzijde.', ex: [0, -0.1, 0] }),
    ...both(s => A(`Kapscharnier ${sn(s)}`, { d: 'Scharnier achteraan de motorkap: een arm aan het binnenframe en een voet op de carrosserie. De draaias is in dit model de achterrand van de kap (schematisch).', ex: [s * 0.08, -0.04, -0.06] }, [
      P('Scharnierarm', G.rbox(0.02, 0.045, 0.12, 0.006), MAT.darkSteel, { d: 'Gebogen scharnierarm aan het binnenframe; draait met de kap mee.', p: [s * 0.50, 0.870, 0.97], ex: [0, -0.03, 0] }),
      ...[0, 1].map(i => P(`Kapscharnierbout ${i + 1}`, hexBolt(0.02, 0.008, 'y'), MAT.steel, { d: 'Bout M8 tussen scharnier en binnenframe.', p: [s * 0.50, 0.893, 0.94 + i * 0.05], r: [PI, 0, 0], ex: [0, 0.05, 0] })),
      P('Scharnierbasis', merge([G.rbox(0.05, 0.012, 0.11, 0.004), xf(G.rbox(0.012, 0.034, 0.09, 0.003), [s * 0.019, -0.022, 0])]), MAT.darkSteel, { d: 'Scharnierbasis op het schutbord: het deel aan de carrosseriezijde; blijft staan als de kap opent.', p: [s * 0.50, 0.85, 0.96], stay: true, ex: [0, -0.05, 0] }),
    ])),
    P('Slotbeugel motorkap', tube([[-0.02, 0, 0], [-0.02, 1, 0], [0.02, 1, 0], [0.02, 0, 0]].map(([x, t]) => [x, lerp(bodSec(1.55).yd - bodFrameOff(1.55), bodSlotY + 0.028, t), 1.55]), 0.004, 12, 6), MAT.steel, { d: 'Beugel aan het binnenframe die in het motorkapslot op de voorkopplaat grijpt.', ex: [0, -0.08, 0.04] }),
    P('Motorkapsteun', rodBetween([0, 0, 0], bodStRot.r0.clone().multiplyScalar(bodStL).toArray(), 0.007, 10), MAT.darkSteel, { d: 'Steunstang (lengte geschat) die de geopende kap ondersteunt. In rust ligt hij langs de rechter binnenscherm; open draait hij om zijn voet omhoog naar de opvanger in het binnenframe.', p: bodStF, stay: true, ex: [-0.04, 0.06, 0],
      open: { type: 'hinge', pivot: bodStF, axis: bodStRot.ax, angle: bodStRot.ang, follow: 'Motorkap', label: 'Motorkapsteun' } }),
    P('Steunopvanger', merge([G.box(0.03, 0.016, 0.03), xf(G.box(0.03, 0.012, 0.03), [0, -0.012, 0])]), MAT.plastic, { d: 'Kunststof opvanger in het binnenframe waarin de bovenkant van de steunstang valt.', p: [bodStG[0], bodStG[1] + 0.012, bodStG[2]], ex: [0, -0.06, 0] }),
    P('Kapafdichting', tube([-0.55, -0.3, 0, 0.3, 0.55].map(x => [x, bodSec(0.96).yd - 0.035 - 0.1 * x * x, 0.96]), 0.007, 20, 6), MAT.rubber, { d: 'Rubber afdichting tussen kap en waterkast.', stay: true, ex: [0, -0.05, -0.04] }),
    // de slang is niet ingesloten (inner): bij een open kap zie je hem van voren over het voorpaneel, maar zijn groep (Ruitensproeier) opent zelf niet, dus de app hield hem
    // verborgen (ui_inner --open: 1 treffer met alle openers open)
    ...both(s => A(`Ruitensproeier ${sn(s)}`, { d: 'Sproeier van de ruitensproeierinstallatie aan de achterrand van de kap.', ex: [0, 0.05, 0] }, [
      P('Sproeierkop', G.lathe('y', [[0, 0.0045], [0.004, 0.0043], [0.0085, 0.003], [0.0112, 0.0008], [0.0112, -0.005], [0, -0.005]], 20, 'bodSprHead'), MAT.plasticGrey, { d: 'Grijze kunststof sproeierkop, half in de kap verzonken.', p: [s * 0.28, halfPt(1.0, bodSAtX(1.0, 0.28))[1] - 0.0015, 1.0], ex: [0, 0.04, 0] }),
      P('Sproeierslang', tube([[s * 0.28, 0.87, 1.0], [s * 0.3, 0.87, 1.1], [s * 0.4, 0.86, 1.2]], 0.0025, 12, 5), MAT.rubber, { d: 'Dunne slang van de sproeier naar het sproeierreservoir, onder de kap; bij een open kap van voren te zien.', ex: [0, -0.04, 0.05] }),
    ])),
  ]);
}
// Koplamp: wrap-around eenheid op de hoek van de neus. Flank (z 1,534 tot de kapvoorrand, onder scherm en kap) en het stuk op het voorvlak (z > 1,60).
// Onderrand = bumperbovenrand (bodYBT), binnenrand = paneel (bodXP); alle randen lopen 6 tot 8 mm onder het bovenliggende deel (kap, scherm, paneel, bumper),
// zodat er geen kier ontstaat (regel R1). Het glas ligt 4 mm onder de huid, het paneel 2,5 mm.
const bodHoodFrontY = halfPt(bodZLh - 0.0003, 1)[1];                // hoogte van de voorrand van de motorkap op de hartlijn (0,704 sinds beslissing 29; 0,702 na en 0,745 voor beslissing 17)
// grens tussen hoekdeel en front van de lamp en bovenrand van de hoofdlens: waar het front op de hartlijn 6 mm onder de kapvoorrand ligt (z ca. 1,663). Beslissing 29: op de
// voorrand van de kap zelf (bodZLh) ligt het dek nog vlak, de wanden van het lamphuis liepen daar omlaag in plaats van naar achteren en tussen kaprand en reflector keek je
// onder de kap door de motorruimte in (kier dicht-lamp). Zo ligt de bovenrand op het steile front en sluit de kaprand (18 mm) de naad erboven af.
const bodLampZ0 = bodZFe - 0.014, bodLampIn = 0.004, bodZH = bodZAtYd(bodHoodFrontY - 0.006);
// einde van het hoekstuk van het scherm boven de lamp: tot de bovenrand van de hoofdlens op het front (beslissing 29). Daarvoor 8 mm voor de voorrand van de kap
// (en eerder 15 mm, beslissing 23): met het steile front bleef tussen de afgeronde kaphoek en het einde van het hoekstuk een gat waardoor je onder de kap keek.
const bodZCe = bodZH;
const bodLLo = (z, d = -0.004) => sAtY(z, bodYBT(z) + d);                  // onderrand ten opzichte van de bumperbovenrand
const bodLHi1 = z => Math.min(bodSAtX(z, bodHoodX(z) - 0.008), sAtY(z, bodHoodFrontY));   // bovenrand flank: 8 mm onder de kap, hoogstens op de voorrand van de kap (0,702; afgeleid van de kapvorm in body.js, zodat een lagere neus de hoekkap meeneemt) (hoekkap hoogstens 4 mm boven de hoofdlens (gemeten +3,7 mm), foto's: lager)
const bodLHi2 = z => bodSAtX(z, bodXP - 0.008);                             // binnenrand neus: 8 mm onder het paneel
const bodXS = 0.59;                                                         // scheiding hoofdlens en hoeklens: verticaal op x 0,59 (foto 1993-2001; beslissing 29)
const bodLSpl = z => bodSAtX(z, Math.min(bodXS, bodSec(z).xe - 0.006));      // op het vlakke front (xe 0,61 tot 0,62); de klem houdt hem op het dek
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
  if (!MAT.bodLampC.map) { MAT.bodLampC.map = bodLampCTex(); MAT.bodLampC.needsUpdate = true; }
  if (!MAT.bodLensRib.normalMap) { MAT.bodLensRib.normalMap = bodLensRibTex(); MAT.bodLensRib.normalScale.set(0.6, 0.6); MAT.bodLensRib.needsUpdate = true; }
  const n = bodSn(s), sd = s, Z0 = bodLampZ0, ZE = bodLampZE, ZC = bodLampZC;
  const mainLens = bodOutward(bodLensUV(bodReg(sd, bodZH, ZE, 14, 8, bodLmLo, bodLmHi, bodLampIn)));
  const capLens = merge([bodReg(sd, Z0, bodZH, 8, 8, bodLcLo, z => Math.max(bodLcLo(z) + 0.001, bodLHi1(z)), bodLampIn), bodReg(sd, bodZH, ZC, 8, 8, bodLcLo, bodLcHi, bodLampIn)].map(bodOutward));
  const refl = bodPlanarUV(bodReg(sd, bodZH, ZE, 14, 10, bodLmLo, bodLmHi, bodRefBowl), bodXP - 0.008, bodXS, bodYBT(ZF), bodHoodFrontY);   // v over het lampbereik: bumperlijn op de flank tot de kapvoorrand
  // hoekreflector: een zilveren vlak onder de hoekkap met een kleine schotel (positielicht)
  // schotel in het vlakke deel van de hoekkap, rand 1,5 mm vóór het vlak met een kraag van 3 mm terug: bij de lagere, bollere neus van beslissing 17 lag het vlak
  // (12 mm) op z 1,578 aan de onderkant vóór de rand en las de ring als sikkel (cyclus 2, bevinding 2). Straal 22,4 mm (was 28), hart z 1,565 en 0,65 (was 1,578 en 0,42);
  // zichtbare ring rondom ca. 2 tot 8 mm (was 0 op de halve omtrek)
  const zD = bodZH - 0.022, sD = lerp(bodLcLo(zD), bodLHi1(zD), 0.5), pD = bodLow(zD, bodPp(sd, sD), 0.0105), nD = bodN(zD, sD);
  const dish = G.lathe('x', [[0, -0.0096], [0.0064, -0.0084], [0.0128, -0.0058], [0.0184, -0.0024], [0.0224, 0], [0.0224, -0.003]], 28, 'bodHLdish2').clone().applyQuaternion(quatFromTo(V3(1, 0, 0), V3(sd * nD[0], nD[1], nD[2]))).translate(pD[0], pD[1], pD[2]);
  // oranje lampje in het midden van de schotel (9,6 mm achter de rand van de schotel, 5 mm vrij van de bodem), met een zwart voetje tot de bodem
  const nDw = V3(sd * nD[0], nD[1], nD[2]), cB = [pD[0] - nDw.x * 0.0046, pD[1] - nDw.y * 0.0046, pD[2] - nDw.z * 0.0046];
  const bulbAmber = merge([G.sphere(0.0062, 12), xf(G.cyl('x', 0.0045, 0.0045, 0.006, 10), [-0.0045, 0, 0])]).clone().applyQuaternion(quatFromTo(V3(1, 0, 0), nDw)).translate(cB[0], cB[1], cB[2]);
  // dezelfde textuur als de hoofdreflector, maar alleen het deel zonder gloeilamp: u loopt langs de hoek (zijkant z, dan voorkant x), v over de hoogte
  // fijner dan eerst (5 x 5) en 3 mm over de grens bodZH heen: bij de lagere, sterker gebogen neus (beslissing 17) liet de koorde tussen de twee vlakken een spleet.
  // Het overlapstuk duikt als rok van 12 naar 32 mm achter de reflectorschaal (die op bodZH op 11 mm begint): op 12 mm lag het vóór de schaal en las het als lichte
  // dubbele streep met zaagtand over de bovenkant van de hoofdreflector (cyclus 2, bevinding 1). De rok is een eigen vlak met dezelfde kolommen: als één vlak trokken
  // de steile driehoeken de normalen op de rij bodZH scheef en stond de grens als lichte lijn over de hoekkap.
  const cHi = z => Math.max(bodLcLo(z) + 0.001, bodLHi1(z));
  const cornerRefl = bodArcUV(merge([bodReg(sd, Z0, bodZH, 10, 10, bodLcLo, cHi, 0.012), bodReg(sd, bodZH, bodZH + 0.003, 2, 10, bodLcLo, cHi, z => lerp(0.012, 0.032, (z - bodZH) / 0.003)), bodReg(sd, bodZH, ZC, 8, 10, bodLcLo, bodLcHi, 0.012), dish, bodWall(sd, z => [z, bodLSpl(z)], bodZH - 0.003, ZC, 8, 0.004, 0.07, 2)]), 0, 1, 0, 1);
  // Lamprand: 6 mm brede donkergrijze scheiding tussen hoofdlens en hoekkap, vlak met het glas
  // rand en scheidingswand beginnen 3 mm vóór bodZH (cyclus 2, bevinding 3): hun boveneinde viel samen met de grens van de hoekreflector en liet daar een vlaggetje
  // met tandjes en een spleetje naar het lamphuis zien
  const rim = bodReg(sd, bodZH - 0.003, ZC, 8, 2, z => bodLSpl(z) - 0.0030, z => bodLSpl(z) + 0.0030, bodLampIn - 0.0004);
  // Lamphuis: gesloten kuip (vloer op 70 mm, vier wanden) zodat het zicht door het glas nooit op frontmodule, koelblok of waterkast valt
  // de onderwand van het huis begint op de diepte van de bumperrand (niet vast 4 mm): tussen wand en bumperrand bleef een spleet waardoor je van boven de bumperbalk zag (afwerking a)
  const lo = z => bodLLo(z, 0.004), hi2 = z => Math.max(lo(z) + 0.0005, bodLHi2(z)), D = 0.07;
  // fijner verdeeld (vloer 12 x 8 in plaats van 4 x 3) en de bovenwand 3 mm door de vloer heen: de lage hoekcamera op lamphoogte (dicht-lamp) keek na beslissing 17 langs de
  // bovenwand door de naad tussen wand en vloer de motorruimte in
  const housing = merge([
    bodReg(sd, Z0, bodZH + 0.003, 12, 8, lo, bodLHi1, D), bodReg(sd, bodZH, ZE, 14, 8, lo, hi2, D),
    bodWall(sd, z => [z, lo(z)], Z0, ZE, 20, z => bodBumperInw(z) + 0.0005, D, 2), bodWall(sd, z => [z, bodLHi1(z)], Z0, bodZH, 16, 0.004, D + 0.003, 3), bodWall(sd, z => [z, hi2(z)], bodZH, ZE, 14, 0.004, D + 0.003, 3),
    bodWall(sd, t => [bodZH, lerp(bodLHi1(bodZH), hi2(bodZH), t)], 0, 1, 3, 0.004, D, 2), bodWall(sd, t => [Z0, lerp(lo(Z0), bodLHi1(Z0), t)], 0, 1, 4, 0.004, D, 2),
    // achterschot boven in het huis (beslissing 29): door het glas boven de reflector keek je onder de kaprand door naar achteren (Frontmodule); een plaat van 1 mm
    // tussen het einde van het binnenframe van de kap (z 1,64) en de kaprand, tot y 0,696 (onder het binnenframe)
    xf(G.box(0.63 - (bodXP - 0.008), 0.056, 0.001), [sd * (0.63 + bodXP - 0.008) / 2, 0.668, 1.6405])]);
  const zB = lerp(bodZH, ZE, 0.4), bulb = bodLow(zB, bodPp(sd, lerp(bodLmLo(zB), bodLmHi(zB), 0.5)), 0.06);   // midden achter de hoofdlens, iets boven het midden
  return A(`Koplamp ${n}`, { d: 'Rechthoekige koplamp met helder glas, om de hoek van de neus gewikkeld naar het scherm: een hoofdlens met ribbels, een gladde hoekkap met een oranje lampje erachter (positie- en knipperlicht, aannemelijk; niet bevestigd), een zilveren reflector en een zwart huis. De onderrand volgt de bumper, de kap en het scherm lopen erover.', ex: [s * 0.32, 0.1, 0.55] }, [
    P('Afdekglas', mainLens, MAT.bodLensRib, { d: 'Heldere hoofdlens met fijne verticale ribbels (prismaglas), vlak met het voorpaneel en onder de kap en de bumperrand geschoven.', ex: [s * 0.1, 0.04, 0.2] }),
    P('Hoekkap', capLens, MAT.bodLens, { d: 'Gladde, doorzichtig heldere hoekkap die om de voorhoek van het scherm loopt, met een donkergrijze scheiding naar de hoofdlens; je ziet de reflector en het oranje lampje erachter (positie- en knipperlicht, aannemelijk; niet bevestigd).', ex: [s * 0.14, 0.04, 0.12] }),
    P('Reflector', refl, MAT.bodLamp, { d: 'Zilveren reflectorschaal met facetten achter de hoofdlens: een groot parabolisch vlak met de lamp midden boven (dim- en grootlicht, schematisch).', ex: [0, 0, 0.06] }),
    P('Hoekreflector', cornerRefl, MAT.bodLampC, { d: 'Zilveren reflectorvlak met facetten en een kleine ronde schotel achter de hoekkap (positielicht, aannemelijk; niet bevestigd), met de lage scheidingswand naar de hoofdreflector.', ex: [s * 0.04, 0, 0.03] }),
    P('Knipperlichtje', bulbAmber, MAT.bodAmber, { d: 'Oranje gloeilampje (positie- en knipperlicht, aannemelijk; niet bevestigd) van ongeveer 12 mm doorsnede in de schotel van de hoekreflector, achter de heldere hoekkap.', ex: [s * 0.03, 0, 0.06] }),
    P('Lamprand', rim, MAT.bodLampRim, { d: 'Donkergrijze scheiding van ongeveer 6 mm tussen de hoofdlens en de hoekkap (echte lamp: 8 tot 10 mm, geschat).', ex: [s * 0.1, 0.04, 0.2] }),
    P('Lamphuis', housing, MAT.plastic, { d: 'Zwart kunststof lamphuis: een gesloten kuip met vier wanden waarin de lamp en reflector zijn gemonteerd.', ex: [0, 0, -0.03] }),
    P('Lampfitting', G.cyl('z', 0.022, 0.022, 0.05, 14), MAT.plastic, { d: 'Fitting met stekker voor de halogeenlamp (H4, plaats schematisch).', p: [bulb[0], bulb[1], bulb[2] - 0.03], ex: [0, 0.03, -0.1] }),
    P('Halogeenlamp', G.cyl('z', 0.011, 0.011, 0.06, 12), MAT.ceramic, { d: 'Halogeenlamp voor dim- en grootlicht (type niet voor deze auto geverifieerd).', p: [bulb[0], bulb[1], bulb[2] + 0.0], ex: [0, 0.04, 0.05] }),
    P('Stofkap lamp', G.lathe('z', [[0, 0.02], [0.035, 0.02], [0.04, 0], [0.035, -0.004]], 16, 'bodHLcap'), MAT.rubber, { d: 'Rubberen kap op de achterzijde van de lamp.', p: [bulb[0], bulb[1], bulb[2] - 0.06], r: [PI, 0, 0], ex: [0, 0.02, -0.14] }),
  ]);
}
// Nederlandse kentekenplaat (520 x 110 mm) zonder echte tekens: geel met zwarte rand, blauwe EU-strook met sterren en NL, zes streepjes.
// Het kenteken van de eigenaar komt nergens in het model.
// Embleem op de achterklep (90 x 40 mm): chroomplaatje met een donkere rand, ALTO groot en SUZUKI klein eronder
function bodEmbleemTex() {
  const W = 450, H = 200, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#f4f6f8'); gr.addColorStop(1, '#cdd2d7');
  g.fillStyle = '#3a3d42'; g.fillRect(0, 0, W, H);
  g.fillStyle = gr; g.fillRect(10, 10, W - 20, H - 20);
  g.fillStyle = '#23262a'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.font = 'bold 96px sans-serif'; g.fillText('ALTO', W / 2, 98);
  g.font = 'bold 54px sans-serif'; g.fillText('SUZUKI', W / 2, 170);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t;
}
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
// Binnenkant van de hoekkap: zilveren reflector zoals op de foto van de modelreeks (helder wit met een paar donkere schuine facetten en een donkere rand rondom, zodat het
// glas ervoor als glas leest en niet als een mat wit vlak). u loopt langs de hoek (0 = zijkant, 1 = de scheiding naar de hoofdlens), v over de hoogte (1 = boven).
function bodLampCTex() {
  const W = 256, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#eef1f3'); gr.addColorStop(0.55, '#d6dadd'); gr.addColorStop(1, '#a9afb5');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const band = (x0, x1, w, a) => { const q = g.createLinearGradient(x0 - w, 0, x0 + w, 0); q.addColorStop(0, 'rgba(70,76,82,0)'); q.addColorStop(0.5, `rgba(70,76,82,${a})`); q.addColorStop(1, 'rgba(70,76,82,0)');
    g.save(); g.translate(x0, 0); g.transform(1, 0, (x1 - x0) / H, 1, 0, 0); g.translate(-x0, 0); g.fillStyle = q; g.fillRect(x0 - w, 0, 2 * w, H); g.restore(); };
  band(W * 0.28, W * 0.20, 11, 0.6); band(W * 0.47, W * 0.40, 8, 0.5); band(W * 0.70, W * 0.78, 14, 0.45);
  const hz = g.createRadialGradient(W * 0.62, H * 0.38, 4, W * 0.62, H * 0.38, W * 0.3); hz.addColorStop(0, 'rgba(255,255,255,0.7)'); hz.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = hz; g.fillRect(0, 0, W, H);
  const rim = (x, y, w, h, a, dx, dy) => { const q = g.createLinearGradient(x, y, x + dx, y + dy); q.addColorStop(0, `rgba(48,52,56,${a})`); q.addColorStop(1, 'rgba(48,52,56,0)'); g.fillStyle = q; g.fillRect(x, y, w, h); };
  rim(0, 0, W * 0.16, H, 0.62, W * 0.16, 0); rim(W, 0, -W * 0.14, H, 0.58, -W * 0.14, 0); rim(0, H, W, -H * 0.2, 0.55, 0, -H * 0.2); rim(0, 0, W, H * 0.12, 0.45, 0, H * 0.12);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t;
}
function bodLampTex() {
  const W = 512, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = '#4c5258'; g.fillRect(0, 0, W, H);
  const bx = W * 0.115, by = H * 0.13, iw = W - 2 * bx, ih = H - 2 * by, lx = W * 0.5, ly = H * 0.34;
  g.save(); g.beginPath(); g.rect(bx, by, iw, ih); g.clip();
  const rg = g.createRadialGradient(lx, ly, 6, W * 0.5, H * 0.55, W * 0.58); rg.addColorStop(0, '#f6f8f9'); rg.addColorStop(0.2, '#dfe3e6'); rg.addColorStop(0.55, '#b8bec3'); rg.addColorStop(1, '#8a9097');
  g.fillStyle = rg; g.fillRect(bx, by, iw, ih);
  // facetten: zachte vlekken (spiegelende vlakken van de bak die licht of donker vangen), geen regelmatig raster en geen lijnen
  const blob = (x, y, rx, ry, k) => {
    g.save(); g.translate(x * W, y * H); g.scale(rx * W, ry * H);
    const q = g.createRadialGradient(0, 0, 0, 0, 0, 1); const col = k > 0 ? '250,252,253' : '70,76,82', a = Math.abs(k) * (k > 0 ? 1 : 0.45);
    q.addColorStop(0, `rgba(${col},${a})`); q.addColorStop(0.6, `rgba(${col},${a * 0.6})`); q.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = q; g.beginPath(); g.arc(0, 0, 1, 0, PI * 2); g.fill(); g.restore();
  };
  [[0.27, 0.30, 0.16, 0.20, 0.30], [0.72, 0.34, 0.15, 0.22, -0.38], [0.50, 0.62, 0.20, 0.17, 0.26], [0.18, 0.66, 0.12, 0.20, -0.40], [0.82, 0.70, 0.13, 0.18, 0.24],
    [0.38, 0.80, 0.18, 0.12, -0.42], [0.63, 0.20, 0.12, 0.14, 0.26], [0.10, 0.28, 0.10, 0.28, -0.40], [0.92, 0.40, 0.10, 0.26, -0.42], [0.55, 0.88, 0.22, 0.10, -0.40], [0.80, 0.18, 0.10, 0.12, -0.34], [0.28, 0.52, 0.09, 0.14, -0.30]].forEach(b => blob(...b));
  // schaduwband in het onderste derde en donkere ringen aan de zijkanten (de bak loopt steil op)
  const sg = g.createLinearGradient(0, by + ih * 0.42, 0, by + ih); sg.addColorStop(0, 'rgba(60,64,68,0)'); sg.addColorStop(1, 'rgba(60,64,68,0.45)');
  g.fillStyle = sg; g.fillRect(bx, by, iw, ih);
  const sg2 = g.createLinearGradient(bx, 0, bx + iw, 0); sg2.addColorStop(0, 'rgba(60,64,68,0.4)'); sg2.addColorStop(0.2, 'rgba(60,64,68,0)'); sg2.addColorStop(0.8, 'rgba(60,64,68,0)'); sg2.addColorStop(1, 'rgba(60,64,68,0.4)');
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
// uv voor de hoekreflector: langs de hoek (|x| van de zijkant naar de voorkant gerekend als z - bodLampZ0 + (0,662 - |x|), over 120 mm) en over de hoogte, in het deel van de lamptextuur zonder gloeilamp (u 0,22 tot 0,44, v 0,38 tot 0,88)
function bodArcUV(g, U0 = 0.22, U1 = 0.44, V0 = 0.38, V1 = 0.88) {
  const p = g.attributes.position, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    const a = clamp(((p.getZ(i) - bodLampZ0) + (0.662 - Math.abs(p.getX(i)))) / 0.12, 0, 1), y0 = bodYBT(1.43), b = clamp((p.getY(i) - y0) / (bodHoodFrontY - 0.005 - y0), 0, 1);
    uv[2 * i] = U0 + (U1 - U0) * a; uv[2 * i + 1] = V0 + (V1 - V0) * b;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); return g;
}
// Grille (beslissing 29): een raam van zwart kunststof tussen de koplampen met een opening waarin vier horizontale lamellen liggen, en een verchroomd S-embleem
// in het midden. Keuze van de eigenaar naar de foto van de modelreeks 1993-2001; de bronnen noemen voor de 16V van 2000 tot 2002 een honingraatgrille.
function bodFrontPanel() {
  const off = 0.0025, sP = z => bodSAtX(z, bodXP), sG = z => bodSAtX(z, bodXG), zT = bodZAtYd(bodYG1), zB = bodZAtYd(bodYG0), D = 0.04;
  // raam: bovenbalk (onder de kap geschoven), twee zijstijlen, onderrand (onder de bumper geschoven); 2,5 mm onder de huid, zoals de lampen ernaast
  const top = bodDeck(bodZLh - 0.008, zT + 0.0005, 10, sP, 12, [], off), low = bodDeck(zB - 0.0005, 1.72, 6, sP, 12, [], off);
  const post = sd => bodReg(sd, zT, zB, 10, 1, sP, sG, off);
  // kuip: wanden van de opening tot 40 mm diep en een achterwand; door de spleten tussen de lamellen zie je zwart en niet de radiateur
  const kuip = merge([...[1, -1].map(sd => bodWall(sd, z => [z, sG(z)], zT, zB, 10, off, D, 2)),
    bodWall(1, t => [zT, lerp(sG(zT), 2 - sG(zT), t)], 0, 1, 8, off, D, 2), bodWall(1, t => [zB, lerp(sG(zB), 2 - sG(zB), t)], 0, 1, 8, off, D, 2),
    bodDeck(zT - 0.001, zB + 0.001, 10, sG, 12, [], D),
    xf(G.box(2 * bodXP, 0.056, 0.001), [0, 0.668, 1.6405])]);   // schot boven de kuip, zoals in het lamphuis: onder de kaprand door keek je anders naar achteren
  // lamellen: vier stroken van 14 mm hoog met 12 mm tussenruimte (9 mm vrij boven en onder), 3 mm dik, 10 mm achter het raam en 15 graden omlaag gekanteld
  const yL = k => bodYG1 - 0.009 - 0.007 - k * 0.026;
  const lam = merge([0, 1, 2, 3].map(k => { const y = yL(k); return xf(G.box(2 * bodXG - 0.002, 0.014, 0.003), [0, y, bodZAtYd(y) - off - 0.010 - 0.0015], [15 * PI / 180, 0, 0]); }));
  // embleem: gestileerde Suzuki-S, een doorlopende streep (twee squircle-bogen, schuin afgesneden uiteinden, 11 graden gekanteld), 60 mm hoog en 35 mm breed, 4 mm dik
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
  const emb = xf(embS, [0, 0, 0.004], null, [0.857, 0.857, 1]);
  const yE = (bodYG0 + bodYG1) / 2, zE = bodZAtYd(yE), pE = bodAt(zE, yE, -0.008), nE = bodN(zE, sAtY(zE, yE));
  const dk = 'keuze eigenaar naar foto 1993-2001; de bronnen noemen voor de 16V 2000-2002 een honingraatgrille';
  return A('Grille en voorpaneel', { d: `Grille tussen de koplampen: een raam van zwart kunststof met vier horizontale lamellen en een verchroomd S-embleem in het midden (${dk}).`, ex: [0, 0.04, 0.4] }, [
    P('Grilleraam', merge([top, low, post(1), post(-1)]), MAT.bodBumperZwart, { d: `Raam van ongelakt zwart kunststof tussen de koplampen, ongeveer 770 x 142 mm: zijkanten en onderrand 12 mm, bovenbalk 20 mm. Het loopt onder de kap en onder de bumperrand door (${dk}).`, ex: [0, 0.04, 0.06] }),
    P('Grillekuip', kuip, MAT.bodPillar, { d: 'Zwarte kuip achter de grilleopening, 40 mm diep met een achterwand: door de spleten tussen de lamellen zie je zwart (schematisch; de echte grille laat koellucht door).', ex: [0, 0, 0.1] }),
    P('Grillelamellen', lam, MAT.bodBlack, { d: `Vier horizontale lamellen van zwart kunststof, ongeveer 14 mm hoog met 12 mm tussenruimte, 10 mm achter het raam en 15 graden omlaag gekanteld (${dk}).`, ex: [0, 0, 0.14] }),
    P('Embleem', emb, MAT.bodChrome, { d: 'Verchroomd embleem in het midden van de grille: een gestileerde letter S van ongeveer 60 mm hoog, zonder schijf eronder (schematisch, zonder merkletters; foto 1993-2001).', p: [0, pE[1], pE[2]], r: [-Math.atan2(nE[1], nE[2]), 0, 0], ex: [0, 0.03, 0.12] }),
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
// Bumperlip: gesloten rand (zwart kunststof, zoals de schaal) langs de onderkant van de schaal, van achter links (z 1,43) om de voorkant naar achter rechts; de wand loopt door vanaf het
// einde van de onderhoek (s = S2) en rondt onderaan af naar binnen, onderrand op y 0,225 (225 mm boven de grond, uitlopend over 140 mm vanaf z 1,425)
// pad van de lip in het bovenaanzicht: van links (z 1,425, begin van de uitloop) over de neus naar rechts, op de buitenwand van de schaal (s = S2); yBot is de onderrand van de lip.
// De lip en de afscherming eronder (Onderplaat voorbumper) delen dit pad, zodat ze samen met de bumper meebewegen en dezelfde omtrek volgen.
function bodLipPath() {
  const zA = 1.425, zE = ZF - 0.0005, xo = z => halfPt(z, S2)[0] - 0.0019, yo = z => halfPt(z, S2)[1], N1 = 22, N2 = 16;   // 1,9 mm binnen de schaal (was 2,0: na beslissing 17 werd de afstand lip-schaal 3,02 mm)
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
  return tube(pts, 0.0026, 64, 4);   // 64 x 4 (was 128 x 6, 1.536 driehoeken): de buis loopt door de 65 punten, een segment per punt; B-062
}
function bodFrontBumper() {
  const both = bodBoth, sn = bodSn;
  if (!MAT.bodPlate.map) { MAT.bodPlate.map = bodPlateTex(); MAT.bodPlate.needsUpdate = true; }
  // knipperlicht: één afgeronde lens van 190 x 50 mm op de bumperhuid, wikkelt om de hoek; donkere rand met twee schroefjes; huis en lamp erachter
  const KX = 0.52, KY = 0.43, KW = 0.15, KH = 0.05;   // beslissing 29: hoog in de bumperhoek, naast de luchtsleuven (foto 1993-2001; was 0,50, 0,345 en 190 mm breed, laag zoals de uitvoering 2000-2002)
  const sig = s => A(`Knipperlicht voor ${sn(s)}`, { d: 'Oranje richtingaanwijzer hoog in de hoek van de bumper, op de hoogte van de kentekenplaat: een afgeronde lens van ongeveer 150 x 50 mm in een donkere rand met twee schroefjes, om de hoek gewikkeld (keuze eigenaar naar foto 1993-2001).', ex: [s * 0.22, -0.02, 0.2] }, [
    P('Lens knipperlicht voor', bodSkinPlate(s * KX, KY, KW, KH, 0.0030), MAT.bodAmber, { d: 'Oranje lens van de richtingaanwijzer, afgerond rechthoekig (ongeveer 150 x 50 mm); maat en plaats geschat op de foto van de modelreeks 1993-2001.', ex: [s * 0.05, 0, 0.08] }),
    P('Rand knipperlicht voor', merge([bodSkinPlate(s * KX, KY, KW + 0.012, KH + 0.012, 0.0014), ...[-1, 1].map(e => { const o = bodSkinPose(s * (KX + e * (KW / 2 + 0.003)), KY, 0.0030); return xf(G.cyl('z', 0.0022, 0.0022, 0.0016, 10).clone().applyQuaternion(o.q), o.p); })]), MAT.bodBlack, { d: 'Zwarte rand van ongeveer 6 mm om de lens, met twee schroefjes (de bumper zelf heeft hier geen echte uitsparing; de diepte komt van de rand).', ex: [s * 0.04, 0, 0.06] }),
    // huis 2,5 mm achter de huid (3,5 mm achter de bumperschaal) en de lamp in de fitting op de achterkant van het huis, langs de huidnormaal (B-037: huis en lamp
    // zweefden 10,9 en 20,5 mm los)
    P('Lamphuis knipperlicht voor', bodSkinPlate(s * KX, KY, KW - 0.012, KH - 0.012, -0.0025, 14, 5), MAT.plastic, { d: 'Kunststof huis met fitting achter de lens, tegen de binnenkant van de bumper.', ex: [0, 0, -0.03] }),
    P('Lamp knipperlicht voor', (() => { const o = bodSkinPose(s * KX, KY, -0.0125); return xf(G.cyl('z', 0.008, 0.008, 0.02, 10).clone().applyQuaternion(o.q), o.p); })(), MAT.amber, { d: 'Oranje steeklamp van de richtingaanwijzer in de fitting op de achterkant van het lamphuis.', ex: [0, 0, -0.06] }),
  ]);
  // schaal: twee helften van de onderrand (s = S1) tot de bovenrand die bij de lamp past; de onderkant is een apart zwart deel
  const zS = 1.381, zE = ZF, sbF = z => Math.max(S1 + 0.002, sAtY(z, bodBumperTop(z)));
  const nfix = (n, z) => bodEndBlend(n, z, 1), NR = bodNC;
  const pW = (s, z, t) => (s > 0 ? bodWarp(S1, sbF(z), t) : 2 - bodWarp(S1, sbF(z), t));
  // extra rijen op de plaatsen waar de schaal sterk draait; een extra rij die binnen 2,6 mm van een bestaande rij valt maakt een smalle sliert (de vlaknormaal wijkt daar meer dan 30 graden af van de hoekpuntnormalen: plooien in de glans) en wordt weggelaten
  const rijen = Array.from({ length: 29 }, (_, k) => zS + (zE - zS) * k / 28), breaks = [];
  [1.50, 1.56, 1.62, 1.70, 1.72, 1.735, ...Array.from({ length: 14 }, (_, k) => 1.658 + k * 0.0026)].forEach(b => { if (!rijen.concat(breaks).some(r => Math.abs(r - b) < 0.0026)) breaks.push(b); });
  // Beslissing 29: met het steile front loopt de bovenrand (y 0,558) tussen z 1,681 en 1,689 in 8 mm van de flank over schouder en front naar het midden. Met de kolommen
  // als deel van [S1, bovenrand] sprong een kolom per rij van de flank naar het front (een vouw over de hele bumperhoek, schouderhoek 135 graden). Nu twee stukken: de
  // flank (S1 tot S3, de oude kolomverdeling zolang de bovenrand op de flank ligt) en daarboven schouder en front (S3 tot de bovenrand, 20 kolommen), met rijen om de
  // 0,6 mm waar de bovenrand oversteekt. Onder de flank blijft alles zoals het was.
  const NU = 20, sLo = z => Math.min(sbF(z), S3), zU = (() => { let lo = 1.60, hi = zE; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (sbF(m) < S3 + 0.001) lo = m; else hi = m; } return hi; })();   // de bovenrand verlaat de flank
  const pL = (s, z, t) => (s > 0 ? bodWarp(S1, sLo(z), t) : 2 - bodWarp(S1, sLo(z), t)), pU = (s, z, t) => (s > 0 ? bodWarp(sLo(z), sbF(z), t) : 2 - bodWarp(sLo(z), sbF(z), t));
  // beide stukken hebben vanaf zU precies dezelfde rijen: met eigen rijen weken de koorden op de naad (s = S3) van elkaar af en zat er een spleetje in de bumperhoek
  const rowsL = rijen.concat(breaks), dense = Array.from({ length: 21 }, (_, k) => 1.6795 + k * 0.0006).concat([1.695, 1.71, 1.725, 1.74]).filter(b => b > zU + 1e-4 && !rowsL.some(r => Math.abs(r - b) < 0.0003));
  const brL = breaks.concat(dense, Math.abs(rowsL.reduce((m, r) => (Math.abs(r - zU) < Math.abs(m - zU) ? r : m), 9) - zU) > 1e-4 ? [zU] : []);
  const brU = rowsL.filter(r => r > zU + 1e-4 && r < zE - 1e-4).concat(dense);
  const shell = s => merge([bodPatchN((z, t) => bodLow(z, pL(s, z, t), bodBumperInw(z)), zS, zE, 28, () => [0, 1], NR, brL, nfix, (z, t) => pL(s, z, t), true, 1.70),
    bodPatchN((z, t) => bodLow(z, pU(s, z, t), bodBumperInw(z)), zU, zE, 1, () => [0, 1], NU, brU, nfix, (z, t) => pU(s, z, t), true, 0)]);   // analytische normalen: de smalle driehoeken bij zU gaven scheve normalen uit de driehoeken
  // eindvlak: rijen op dezelfde hoogtes als de laatste rij van de schaal (zelfde z, zelfde s-verdeling: NR kolommen op de flank, NU op schouder en front), zodat er geen sliert tussen vlak en schaal overblijft
  const colF = j => (j <= NR ? bodWarp(S1, S3, j / NR) : bodWarp(S3, 1, (j - NR) / NU));
  const face = patch((j, t) => { const [x, y] = halfPt(ZF, colF(j)); return [lerp(x, -x, t), y, ZF]; }, 0, NR + NU, NR + NU, () => [0, 1], 14);
  // luchtsleuven: de sleuf ligt vrijwel vlak met het vlak (0,5 mm erboven), een kader van 5 mm breed en 2 mm hoog (zwart kunststof, zoals de schaal) eromheen laat hem 1,5 mm verdiept ogen
  const slot = (x, y, w, h) => xf(G.rbox(w, h, 0.003, 0.004), [x, y, ZF - 0.001]);
  const rib = (x, y, w, h, k) => Array.from({ length: k }, (_, i) => xf(G.box(w, 0.0035, 0.002), [x, y - h / 2 + h * (i + 1) / (k + 1), ZF + 0.0013]));
  const kader = (x, y, w, h, t = 0.005) => [xf(G.box(w + 2 * t, t, 0.002), [x, y + h / 2 + t / 2, ZF + 0.001]), xf(G.box(w + 2 * t, t, 0.002), [x, y - h / 2 - t / 2, ZF + 0.001]),
    xf(G.box(t, h, 0.002), [x - w / 2 - t / 2, y, ZF + 0.001]), xf(G.box(t, h, 0.002), [x + w / 2 + t / 2, y, ZF + 0.001])];
  return A('Voorbumper', { d: 'Voorbumper van ongelakt zwart kunststof met de hoeken om de wielbogen, een lip langs de onderkant, luchtsleuven naast het kentekenvlak en richtingaanwijzers hoog in de hoeken; erachter de stalen bumperbalk (keuze eigenaar naar foto 1993-2001).', ex: [0, -0.04, 0.72] }, [
    P('Bumperschaal voor', merge([shell(1), shell(-1), face]), MAT.bodBumperZwart, { d: 'Bumperschaal van ongelakt zwart kunststof met afgeronde hoeken die om de voorwielboog lopen; de bovenrand sluit op de lampen, de grille en het scherm aan (keuze eigenaar naar foto 1993-2001).', ex: [0, -0.02, 0.12] }),
    P('Bumpernaad voor', cache('bodBumperSeam', bodBumperSeam), MAT.bodSeal, { d: 'Donkere voeg van ongeveer 5 mm langs de bovenrand van de bumper, waar het voorpaneel, de koplampen en de schermen eronder verdwijnen: de bumper is een apart deel (de echte voeg is nauwelijks breder).', ex: [0, -0.02, 0.12] }),
    P('Bumperlip voor', bodBumperLip(), MAT.bodBumperZwart, { d: 'Rand van ongelakt zwart kunststof langs de onderkant van de bumper: de buitenwand van de schaal loopt door tot ongeveer 225 mm boven de grond en rondt daar af naar binnen (achter uitlopend naar niets), zodat de wang op de lip uitloopt. Hij houdt het zicht op onderstel en stabilisatorstang van normale hoogte af.', ex: [0, -0.05, 0.04] }),
    P('Onderplaat voorbumper', merge([bodPatchN((z, p) => bodLow(z, p, 0.0), 1.425, zE - 0.003, 18, () => [-S1, S1], 6, [], (n) => n), bodBumperShield()]), MAT.bodShield, { d: 'Zwarte onderzijde van de bumper met een donker lint van 50 mm onder de lip, 40 mm achter de lipwand en met dezelfde omtrek als de lip, schematisch (de echte afscherming onder de bumper is niet vast te stellen): het houdt carter, dwarsbalk en draagarmen uit het zicht van een lage camera, zonder platen langs de aandrijfas.', ex: [0, -0.06, 0.02] }),
    P('Luchtrooster voor', merge([slot(0.34, 0.415, 0.12, 0.06), slot(-0.34, 0.415, 0.12, 0.06), slot(0, 0.328, 0.54, 0.022)]), MAT.bodBlack, { d: 'Zwarte luchtsleuven: links en rechts van het kentekenvlak en een smalle sleuf eronder, voor extra koellucht.', ex: [0, -0.04, 0.1] }),
    P('Luchtroosterkader voor', merge([...kader(0.34, 0.415, 0.12, 0.06), ...kader(-0.34, 0.415, 0.12, 0.06), ...kader(0, 0.328, 0.54, 0.022)]), MAT.bodBumperZwart, { d: 'Kader van ongeveer 5 mm breed van ongelakt zwart kunststof om de luchtsleuven, 2 mm boven het bumpervlak: de sleuven liggen daardoor verdiept.', ex: [0, -0.04, 0.11] }),
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
// zelfde, maar dx gemeten vanaf het oude flankprofiel (ringX0, tot golf 6): de binnenkant van het portier blijft staan nu de flank naar de gordel toe inloopt (beslissing FLANK-2)
function bodLowX0(z, p, dx) { const q = ((p % 2) + 2) % 2, sd = q <= 1 ? 1 : -1, y = halfPt(z, q <= 1 ? q : 2 - q)[1]; return [sd * (ringX0(z, y) - dx), y, z]; }
const bodSideX0 = (s, z0, z1, nu, vr, nv, dx) => patch((z, p) => bodLowX0(z, p, dx), z0, z1, nu, z => sideR(s, ...vr(z)), nv);
// buitenwaartse normaal (linkerhelft) en pose op de huid; rechts wordt gespiegeld
function bodPose(s, p, nLeft, extra = {}) {
  const q = quatFromTo(V3(1, 0, 0), V3(...nLeft));
  if (s > 0) return Object.assign({ p, q }, extra);
  return Object.assign({ p: [-p[0], p[1], p[2]], q: new THREE.Quaternion(q.x, -q.y, -q.z, q.w), s: [-1, 1, 1] }, extra);
}
// buitenspiegel liggend (golf 5): breder dan hoog, zoals de Alto van 2001. Maten geschat uit foto's en de gangbare maat in deze klasse
// (zie docs/onderzoek/beslissingen.md): huis 168 mm breed, 92 mm hoog bij de voet en 112 mm aan de buitenkant, 70 mm diep bij de voet
// en 52 mm aan de buitenkant; glas 151 mm breed en 83 tot 101 mm hoog. De buitenkant reikt tot x 0,898 (150 mm buiten de huid).
// Lokaal frame van het huis: x van de voet af, y omhoog, z naar voren; de achterrand (glaszijde) ligt op z 0, het middelpunt op x 0.
const bodMirW = 0.168, bodMirHi = 0.092, bodMirHo = 0.112, bodMirR = 0.026, bodMirD = [0.07, 0.052], bodMirLip = 0.007;
const bodMirT = x => clamp(x / bodMirW + 0.5, 0, 1);                   // 0 bij de voet, 1 aan de buitenkant
// omtrek van het huis tegen de klok in: afgeronde rechthoek waarvan de hoogte lineair toeneemt van de voet naar buiten
const bodMirRing = (() => {
  const hw = bodMirW / 2, r = bodMirR, h = x => lerp(bodMirHi, bodMirHo, bodMirT(x)) / 2, pts = [];
  const cs = [[hw - r, 1, 0], [-hw + r, 1, HALF], [-hw + r, -1, PI], [hw - r, -1, PI * 1.5]];
  cs.forEach(([cx, sy, a0], c) => {
    for (let i = 0; i <= 5; i++) { const a = a0 + i / 5 * HALF; pts.push([cx + r * Math.cos(a), sy * (h(cx) - r) + r * Math.sin(a)]); }
    if (c % 2 === 0) for (const t of [1 / 3, 2 / 3]) { const x = lerp(cx, -cx, t); pts.push([x, sy * h(x)]); }   // tussenpunten op de lange boven- en onderrand
  });
  return pts;
})();
// meridiaan [k, z]: k schaalt de omtrek, z is diepte; een bolle schaal (superellips) naar voren en achter een omgezette rand van 7 mm
// die naar binnen terugloopt tot achter de glasdrager, zodat de schaal van achteren dikte heeft
const bodMirProf = (() => {
  const out = [];
  for (let j = 0; j <= 5; j++) { const a = j / 5 * HALF; out.push([Math.pow(Math.sin(a), 0.8), Math.pow(Math.cos(a), 0.8), true]); }
  out.push([1, -bodMirLip, false], [0.94, -bodMirLip, false], [0.94, 0.006, false]);
  return out;
})();
const bodMirShell = () => cache('bodMirShell', () => {
  const N = bodMirRing.length;
  const g = patch((u, v) => {
    const [x0, y0] = bodMirRing[Math.round(u) % N], [k, f, dome] = bodMirProf[Math.round(v)];
    if (!dome) return [x0 * k, y0 * k, f];
    // naar de top toe gaat de afgeronde rechthoek over in een ellips: zo krijgt de bolling geen graten langs de diagonalen
    const hh = lerp(bodMirHi, bodMirHo, bodMirT(x0)) / 2, th = Math.atan2(y0 / hh, x0 / (bodMirW / 2)), w = k * k * k;
    const x = k * lerp(bodMirW / 2 * Math.cos(th), x0, w), y = k * lerp(hh * Math.sin(th), y0, w);
    return [x, y, f * lerp(bodMirD[0], bodMirD[1], bodMirT(x))];
  }, 0, N, N, () => [0, bodMirProf.length - 1], bodMirProf.length - 1);
  return creasedWeld(g, 0.6);
});
// vlakke plaat met de omtrek van het huis, geschaald met k, dikte t (gecentreerd op z 0)
const bodMirPlate = (key, k, t) => cache(key, () => extrude(shapeOf(bodMirRing.map(([x, y]) => [x * k, y * k])), t, 4));
// punt op de buitenhuid van de kas (linkerhelft) bij z en y, met out in x naar buiten; boven de gordel loopt het over de A-stijl (boog van het dakrandprofiel)
function bodKasPt(z, y, out = 0) {
  const g = bodGh(z), q = y <= g.ye ? clamp((y - g.yb) / (g.ye - g.yb), 0, 1) * bodQS : bodQS + Math.asin(clamp((y - g.ye) / (g.yre - g.ye), 0, 1)) / HALF * (bodQR - bodQS);
  const [x, yy] = bodGhHalf(z, q, g);
  return [x + out, yy, z];
}
// zeilplaat van de spiegel (linkerhelft, [z, y] van de hoekpunten): driehoek met de basis langs de gordel, de voorrand tegen de A-stijl en de top bovenin, 7 mm dik
// basis 4 mm boven de gordel (KAS-3: de gordel zakte daar 15 mm; was vast 0,905)
const bodMirSailV = [[0.778, YT(0.778) + 0.004], [0.690, YT(0.690) + 0.004], [0.752, 0.975]], bodMirSailT = 0.007;
function bodMirSail() {
  const V = bodMirSailV, T = bodMirSailT;
  const pt = (u, v, o) => bodKasPt(lerp(lerp(V[0][0], V[1][0], u), V[2][0], v), lerp(lerp(V[0][1], V[1][1], u), V[2][1], v), o);
  const wall = fn => patch(fn, 0, 1, 8, () => [0, 1], 1);
  return merge([patch((u, v) => pt(u, v, T), 0, 1, 8, () => [0, 1], 6), patch((u, v) => pt(u, v, 0), 0, 1, 8, () => [0, 1], 6),
    wall((u, t) => pt(u, 0, T * t)), wall((v, t) => pt(1, v, T * t)), wall((v, t) => pt(0, v, T * t))]);
}
function bodMirror(s) {
  const n = bodSn(s), M = (x, y, z) => [s * x, y, z];
  const hx = 0.73 + bodMirW / 2, hy = 0.975, hz = 0.697;             // middelpunt van de achterrand; binnenrand op x 0,730, omgezette rand achter op z 0,690 (scharnierlijn)
  const H = (dz, extra) => Object.assign({ p: M(hx, hy, hz + dz), s: [s, 1, 1] }, extra);
  // de scharnierlijn ligt aan de binnenachterkant van het huis (x 0,733); het huis klapt naar achteren langs het portier en blijft daarbij buiten x 0,729, de voet binnen 0,728
  // uitklapvector (KAS-4): 0,45 omhoog en 0,40 naar voren (was 0,10 en 0,08): in preset Portier links lag de spiegel achter de labels Raambediening, Waterscherm en Buitenspiegel links
  return A(`Buitenspiegel ${n}`, { d: 'Elektrisch verstelbare en verwarmde buitenspiegel in zwart kunststof (Twist), liggend: breder dan hoog. Klapt met de hand ongeveer 80 graden naar achteren (hoek geschat).', ex: [s * 0.3, 0.45, 0.4],
    open: { type: 'hinge', pivot: [s * 0.733, 0.99, 0.69], axis: [0, 1, 0], angle: s * 80 * PI / 180, min: 64 * PI / 180, label: `Buitenspiegel ${n}`, look: { dir: [s * 0.8, 0.3, 0.75], nodes: [`Buitenspiegel ${n}`] } } }, [
    // de spiegel hangt aan een korte arm uit een zwarte driehoekige zeilplaat in de voorhoek van het raamframe tegen de A-stijl (foto's van de modelreeks); beide blijven staan als de spiegel inklapt
    P('Spiegelzeil', bodMirSail(), MAT.bodBlack, { d: 'Zwarte driehoekige zeilplaat van kunststof in de voorhoek van het raamframe tegen de A-stijl, ongeveer 88 mm breed, 70 mm hoog en 7 mm dik (z 0,69 tot 0,778, y 0,905 tot 0,975; maat geschat op de foto\'s, hoger loopt hij over de bocht van de A-stijl); hij zit op het portier en draagt de spiegelarm. Blijft staan als de spiegel inklapt.', s: [s, 1, 1], stay: true, ex: [s * 0.01, 0, 0.03] }),
    // KAS-2: binnenkant 4,5 mm naar buiten (0,6685, was 0,664): de bredere voet van de A-stijl kwam anders 4,5 mm dieper in de arm; buitenkant 0,728 zoals eerst
    P('Spiegelarm', xf(G.rbox(0.0595, 0.035, 0.042, 0.009), [0.69825, 0.953, 0.738]), MAT.bodBlack, { d: 'Korte arm van ongeveer 60 x 35 x 42 mm uit de zeilplaat tot tegen de binnenkant van het spiegelhuis; het scharnier van de spiegel zit aan het huis. Blijft staan als de spiegel inklapt.', s: [s, 1, 1], stay: true, ex: [s * 0.04, 0, -0.03] }),
    P('Spiegelhuis', bodMirShell(), MAT.bodBlack, H(0, { d: 'Zwart kunststof huis, liggend: ongeveer 168 mm breed, 92 mm hoog bij de voet en 112 mm aan de buitenkant (geschat). Naar voren bol en smaller in de diepte (70 mm bij de voet, 52 mm buiten); draagt glas, verstelmotor en verwarming.', ex: [0, 0.02, 0.1] })),
    P('Spiegelglas', bodMirPlate('bodMirGlass', 0.9, 0.003), MAT.bodMirror, H(-0.004, { d: 'Spiegelglas van ongeveer 151 mm breed en 83 tot 101 mm hoog (geschat), verwarmd; in het model vlak.', ex: [0, 0, -0.12] })),
    P('Glasdrager', bodMirPlate('bodMirCarrier', 0.93, 0.006), MAT.plastic, H(0.0005, { d: 'Kunststof drager waarop het glas is geklikt.', ex: [0, 0, -0.07] })),
    P('Verwarmingsfolie', G.box(0.12, 0.065, 0.002), MAT.heater, H(0.0055, { d: 'Verwarmingsfolie achter het glas tegen condens en ijs.', inner: true, ex: [0, 0, -0.1] })),
    P('Verstelmotor', G.rbox(0.05, 0.045, 0.03, 0.008), MAT.darkSteel, H(0.024, { d: 'Motor met twee assen voor het elektrisch verstellen van het glas.', inner: true, ex: [0, 0.06, -0.04] })),
  ]);
}
function bodDoor(s) {
  const n = bodSn(s), dName = `Portier ${n}`, dPath = `${AUTO.wortel}/Carrosserie/${dName}`, z0 = bodZDR, z1 = bodZDF, zm = (z0 + z1) / 2;
  const sLo = z => sAtY(z, bodYSill), sHi = S4 - 0.0008, eIn = 0.13, pp = sv => bodPp(s, sv);
  const bodEdgePt = (z, p, t) => { const a = bodLowX(z, p, 0), b = bodLowX0(z, p, eIn); return [lerp(a[0], b[0], t), a[1], z]; };   // van de buitenhuid naar het binnenpaneel
  const qLo = z => bodQy(z, YT(z) + 0.013), qHi = z => Math.max(qLo(z) + 1e-4, bodQy(z, bodGh(z).ye - 0.042));
  const zg0 = z0 + 0.03, zg1 = z1 - 0.005;
  const outer = lowSide(s, z0, z1, 44, z => [sLo(z), sHi], 18);
  const inner = bodSideX0(s, z0 + 0.012, z1 - 0.012, 22, z => [sAtY(z, bodYSill + 0.016), S4 - 0.012], 10, eIn);
  const trimP = bodSideX0(s, z0 + 0.016, z1 - 0.016, 22, z => [sAtY(z, 0.33), sAtY(z, YT(z) - 0.012)], 10, eIn + 0.008);   // 1,2 cm minder diep dan eerst: dashboard en stoelen botsten (golf 2); bovenrand 12 mm onder de gordel: met de lagere gordel (FLANK-1) rolde de rand anders tegen de stuurkrans
  const edge = merge([
    patch((z, t) => bodEdgePt(z, pp(sAtY(z, bodYSill + 0.002)), t), z0 + 0.012, z1 - 0.012, 26, () => [0, 1], 2),
    ...[z0 + 0.006, z1 - 0.006].map(zz => patch((u, t) => bodEdgePt(zz, pp(lerp(sAtY(zz, bodYSill + 0.002), S4 - 0.004, u)), t), 0, 1, 10, () => [0, 1], 2)),
  ]);
  const glass = bodGhSide(s, zg0, zg1, 40, z => [qLo(z), qHi(z)], 8, [], -0.045);
  const hz = -0.40, hy = 0.80, hp = bodAt(hz, hy, 0.0), hn = bodN(hz, sAtY(hz, hy));
  // Geleiders langs de baan van de onderrand van het glas; het vlak volgt de gordel (was 0,88 vast, beslissing FLANK-1) en ligt BOD_KASD verder naar buiten (KAS-2).
  // Het glas zakt schuiner dan zijn eigen vlak (helling bodWinK, het glas helt sinds KAS-2 ongeveer 0,37): langs het vlak kwam de onderrand van de gezakte ruit door de
  // flank, die onder de bredere gordel minder inloopt. Met 0,18 blijft de onderrand ruim 30 mm binnen de huid en het glas ruim 40 mm buiten het binnenpaneel.
  const bodWinK = 0.18, xg0 = 0.635 + bodKasD(zm);
  const xin = z => s * xg0, xAt = y => s * (xg0 + bodWinK * (YT(zm) - 0.025 - y));
  // vlak van de geheel gezakte ruit (helling van het glas, kg): de kabels lopen 12 mm erbinnen; op de baan van de onderrand (xAt) sneed het glas erdoorheen
  const gzm = bodGh(zm), kg = (gzm.xb - gzm.xe) / (gzm.ye - gzm.yb), yLow = YT(zm) + 0.013 - 0.25, xCab = y => s * (Math.abs(xAt(yLow)) - kg * (y - yLow) - 0.012);
  const winSlide = extra => ({ type: 'slide', move: [s * 0.25 * bodWinK, -0.25, 0], ...extra });
  const hingeZ = z1 + 0.006;
  const hinge = (nm, y) => A(`Scharnier ${nm}`, { d: `${nm === 'boven' ? 'Bovenste' : 'Onderste'} portierscharnier: een blad aan het portier en een blad op de A-stijl met een scharnierpen. In dit model draait het portier om een as vlak voor de voorrand (schematisch).`, ex: [-s * 0.03, 0, 0.12] }, [
    P('Scharnierblad', G.rbox(0.03, 0.07, 0.05, 0.006), MAT.darkSteel, { d: 'Stalen scharnierblad aan het portier; draait met het portier mee.', p: [s * (surfX(z1, y) - 0.04), y, z1 - 0.02], ex: [0, 0, 0.04] }),
    // bovenste blad aan de carrosseriezijde 50 mm diep tot tegen het portierblad (z1 + 0,005): op 40 mm zweefde het 10 mm los (B-037); het portierblad draait er bij het openen
    // van weg. Het onderste blijft 40 mm: het ligt 3 mm van het portierrubber, langer stak het er 5,5 mm in (clash.py)
    P('Scharnierblad carrosserie', G.rbox(0.03, 0.07, nm === 'boven' ? 0.05 : 0.04, 0.006), MAT.darkSteel, { d: 'Scharnierblad aan de carrosseriezijde, geschroefd op de stijl; blijft staan als het portier opent.', p: [s * (surfX(z1 + 0.03, y) - 0.045), y, z1 + (nm === 'boven' ? 0.030 : 0.035)], stay: true, ex: [0, 0, 0.04] }),
    ...[0.022, -0.022].map((dy, i) => P(`Scharnierbout ${i + 1}`, hexBolt(0.025, 0.008, s > 0 ? '-x' : 'x'), MAT.steel, { d: 'Bout M8 waarmee het scharnierblad aan het portier vastzit.', p: [s * (surfX(z1, y) - 0.055), y + dy, z1 - 0.01], ex: [-s * 0.05, 0, 0] })),
  ]);
  const kids = [
    P('Buitenpaneel', outer, MAT.paint, { d: 'Geperste plaatstalen buitenhuid van het portier in het rood; het portier is lang omdat de 3-deurs geen achterportier heeft.', ex: [s * 0.4, 0.14, 0.5] }),
    P('Portierrand', edge, MAT.paintIn, { d: 'Gevouwen rand rond het portier (onderkant en zijkanten) die buitenpaneel en binnenpaneel verbindt.', ex: [-s * 0.1, -0.06, 0] }),
    P('Binnenpaneel', inner, MAT.paintIn, { d: 'Draagframe van het portier waarop raammechaniek, slot en bekleding zitten.', ex: [-s * 0.05, 0, 0] }),
    P('Zijdelingse botsbalk', tube([[xin(z0 + 0.08), 0.42, z0 + 0.08], [xin(zm), 0.44, zm], [xin(z1 - 0.1), 0.43, z1 - 0.1]], 0.016, 16, 8), MAT.steel, { d: 'Stalen buis in het portier die bij een zijaanrijding de indringing beperkt.', ex: [s * 0.22, 0, 0.3] }),
    P('Waterscherm', bodSideX0(s, z0 + 0.05, z1 - 0.05, 12, z => [sAtY(z, 0.4), sAtY(z, 0.86)], 6, 0.075), MAT.plastic, { d: 'Kunststof folie tussen binnenpaneel en bekleding die vocht uit de bekleding houdt.', ex: [-s * 0.14, 0.12, -0.26] }),
    P('Zijruit', glass, MAT.glass, { d: 'Zakbare zijruit van gehard, licht getint veiligheidsglas. Zakt elektrisch ongeveer 25 cm in het portier, langs zijn eigen vlak.', ex: [0, 0.32, 0],
      open: winSlide({ min: 0.21, label: `Zijruit ${n}`, look: { dir: [s * 1, 0.7, 0.3], nodes: [dName] } }) }),
    P('Rubber zijruit', bodRim(s, zg0 + 0.001, zg1 - 0.001, qLo, qHi, 0.005, -0.045), MAT.bodSeal, { d: 'Zwart afdichtrubber rond de zijruit; zakt mee met de ruit.', ex: [s * 0.05, 0.03, 0], open: winSlide({ follow: `${dPath}/Zijruit` }) }),
    A('Zijlijsten', { d: 'Zwarte stootstrip op het portier en het gordelrubber onder de ruit.', ex: [s * 0.1, 0, 0] }, [
      P('Beschermlijst', bodStoot(s, 0.49, 0.52, z0 + 0.003, z1 - 0.05, 0.006, 0.006, 0.05), MAT.bodBumperZwart, { d: 'Stootstrip van ongelakt zwart kunststof op het portier, ongeveer 30 mm hoog en 6 mm dik (y 0,49 tot 0,52); loopt door op het achterscherm. Keuze eigenaar naar foto 1993-2001.', ex: [s * 0.03, 0, 0] }),
      P('Gordelrubber', bodGhSide(s, zg0, zg1, 30, z => [0, qLo(z)], 2, [], 0.002), MAT.bodSeal, { d: 'Zwarte afstrijkrubbers op de gordellijn onder de zijruit.', ex: [s * 0.06, 0.03, 0] }),
    ]),
    A('Raambediening', { d: 'Elektrische raambediening (Twist) met kabeltrommel: twee geleiderails, een ruitdrager en een motor.', ex: [-s * 0.3, -0.02, 0] }, [
      P('Geleiderail voor', rodBetween([xAt(0.64), 0.64, zm + 0.3], [xAt(0.86), 0.86, zm + 0.3], 0.008, 8), MAT.steel, { d: 'Stalen geleiderail voor de ruitdrager.', ex: [0, 0, 0.05] }),
      P('Geleiderail achter', rodBetween([xAt(0.64), 0.64, zm - 0.3], [xAt(0.86), 0.86, zm - 0.3], 0.008, 8), MAT.steel, { d: 'Stalen geleiderail voor de ruitdrager.', ex: [0, 0, -0.05] }),
      P('Ruitdrager', G.rbox(0.02, 0.03, 0.7, 0.006), MAT.darkSteel, { d: 'Drager waarop de onderrand van de zijruit is geklemd; zakt mee met de ruit.', p: [xin(zm), 0.85, zm], ex: [0, 0.08, 0], open: winSlide({ follow: `${dPath}/Zijruit` }) }),
      P('Bedieningskabels', merge([rodBetween([xCab(0.86), 0.86, zm + 0.3], [xCab(0.64), 0.64, zm - 0.3], 0.003, 6), rodBetween([xCab(0.86), 0.86, zm - 0.3], [xCab(0.64), 0.64, zm + 0.3], 0.003, 6)]), MAT.steel, { d: 'Staalkabels die de ruitdrager langs de rails trekken.', ex: [-s * 0.03, 0, 0] }),
      P('Raammotor', merge([G.cyl('x', 0.032, 0.032, 0.045, 20), xf(G.cyl('x', 0.022, 0.022, 0.03, 16), [-0.035, 0, 0])]), MAT.darkSteel, { d: 'Elektromotor met kabeltrommel van de elektrische ruitbediening.', p: [xAt(0.64) - s * 0.012, 0.52, zm], s: [s, 1, 1], ex: [-s * 0.06, -0.06, 0] }),
    ]),
    A('Deurslot', { d: 'Slotmechanisme in de achterrand van het portier met slotmotor voor de centrale vergrendeling (Twist).', ex: [-s * 0.08, 0, -0.16] }, [
      P('Slotkast', G.rbox(0.016, 0.1, 0.04, 0.006), MAT.darkSteel, { d: 'Slotkast met vanghaak die om de slotbeugel in de stijl grijpt; zit binnen de achterrand van het portier.', p: [s * (surfX(z0 + 0.04, 0.83) - 0.012), 0.78, z0 + 0.05], ex: [0, 0, -0.04] }),   // 16 mm dik (was 30), x naar de huid op de bovenkant (y 0,83): de flank loopt daar in en de gezakte ruit loopt erlangs (FLANK-2)
      P('Slotmotor', G.rbox(0.03, 0.05, 0.04, 0.008), MAT.plastic, { d: 'Elektrische stelmotor van de centrale vergrendeling.', p: [xCab(0.72) - s * 0.02, 0.72, z0 + 0.09], ex: [-s * 0.04, -0.03, 0] }),   // binnen het vlak van de gezakte ruit (KAS-2; op de huid min 20 mm raakte de ruit hem)
      P('Bedieningsstang', rodBetween([s * (surfX(z0 + 0.05, 0.78) - 0.02), 0.79, z0 + 0.06], [s * (hp[0] - 0.02), hy, hz + 0.04], 0.003, 6), MAT.steel, { d: 'Stang tussen buitendeurgreep en slot.', ex: [-s * 0.03, 0, 0] }),
    ]),
    A('Buitendeurgreep', { d: 'Trekgreep van zwart kunststof (Twist: in carrosseriekleur zou ook kunnen; hier zwart aangenomen) met sleutelslot aan de bestuurderszijde.', ex: [s * 0.62, 0, 0] }, [
      P('Greepschaal', G.rbox(0.014, 0.034, 0.16, 0.006), MAT.bodBlack, { d: 'Zwarte trekgreep in een kleine uitsparing van het portier.', ...bodPose(s, [hp[0] + hn[0] * 0.004, hp[1], hp[2]], hn) }),
      P('Greepdrager', G.rbox(0.03, 0.05, 0.2, 0.006), MAT.plastic, { d: 'Kunststof drager achter de buitenhuid waarin de greep scharniert.', ...bodPose(s, bodAt(hz, hy, -0.008), hn), ex: [-s * 0.05, 0, 0] }),
    ]),
    A('Deurbekleding', { d: 'Binnenbekleding van het portier met armsteun, raamschakelaar, binnengreep en kaartvak.', ex: [-s * 0.52, 0, -0.68] }, [
      P('Bekledingspaneel', trimP, MAT.dash, { d: 'Gespoten kunststof bekledingspaneel met stoffen inzet.', ex: [-s * 0.03, 0, 0] }),
      P('Armsteun', G.rbox(0.07, 0.045, 0.34, 0.018), MAT.dash, { d: 'Armsteun in de bekleding, tegelijk greep om het portier dicht te trekken.', p: [s * (ringX0(zm, 0.64) - 0.14), 0.64, zm - 0.1], ex: [-s * 0.06, 0, 0] }),
      P('Raamschakelaar', G.rbox(0.05, 0.02, 0.07, 0.006), MAT.plastic, { d: 'Schakelaar van de elektrische ruit.', p: [s * (ringX0(zm, 0.67) - 0.15), 0.673, zm + 0.1], ex: [-s * 0.04, 0.04, 0] }),
      P('Binnendeurgreep', G.rbox(0.02, 0.03, 0.12, 0.008), MAT.satin, { d: 'Binnengreep met kabel naar het slot.', p: [s * (ringX0(z0 + 0.22, 0.8) - 0.115), 0.8, z0 + 0.22], ex: [-s * 0.06, 0, 0] }),
    ]),
    // het rubber zit op de binnenrand van het portier en blijft waar het in versie 6 lag: met de bredere kas (KAS-2) staat de huid op y 0,80 minder schuin en schoof het
    // bovenste punt 16 mm naar buiten (x 0,689 in plaats van 0,673); de rechte buis kwam dan 4 tot 5 mm in de scharnierbladen. De bovenste punten 16,4 mm terug.
    P('Portierrubber', tube([[z0 + 0.03, 0.80], [z0 + 0.03, 0.34], [zm, 0.34], [z1 - 0.03, 0.34], [z1 - 0.03, 0.80]].map(([z, y]) => { const p = bodAt(z, y, -0.05), dx = y > 0.5 ? 0.0164 : 0; return [s * (p[0] - dx), p[1], p[2]]; }), 0.008, 72, 6), MAT.rubber, { d: 'Rubber afdichting langs de voorrand, onderrand en achterrand van het portier.', ex: [-s * 0.26, -0.1, -0.46] }),
    P('Deurvanger', G.rbox(0.012, 0.03, 0.2, 0.004), MAT.darkSteel, { d: 'Vanger die het portier in twee standen openhoudt.', p: [s * (surfX(z1 - 0.1, 0.62) - 0.016), 0.62, z1 - 0.1], ex: [-s * 0.05, 0, 0.06] }),
    // bovenste scharnier op y 0,61 (was 0,62): met de lagere gordel aan de voorrand (KAS-3) kwam de voorste onderhoek van de gezakte ruit 7 tot 10 mm in het bovenste blad
    A('Scharnieren', { d: 'Twee portierscharnieren aan de voorrand met elk twee bouten.', ex: [-s * 0.04, 0, 0.1] }, [hinge('boven', 0.61), hinge('onder', 0.53)]),
    bodMirror(s),
  ];
  const piv = [s * (surfX(z1, 0.62) + 0.012), 0.62, z1 + 0.012];
  return A(dName, { d: `Compleet portier aan de ${n}kant (3-deurs): plaatwerk, elektrisch bediende ruit, slot, greep, bekleding, scharnieren en buitenspiegel.`, ex: [s * 0.78, 0.02, 0.16],
    open: { type: 'hinge', pivot: piv, axis: [0, 1, 0], angle: -s * 62 * PI / 180, min: 52 * PI / 180, label: dName, look: { dir: [s * 1, 0.4, 0.12], nodes: [dName] } } }, kids);
}
/* ---------- achterzijde: bumper, achterlichten, achterpaneel ---------- */
// Achterlichten liggend (ca. 1,3 : 1, hoogte 210 mm; keuze eigenaar naar foto 1993-2001): bodTLy1 0,80 (was 0,845).
// Achterkant volgens de foto's van de 2001 GL (Brits, Wikimedia; Duits, Mannheim), bevinding B-002: de klep loopt van de dakrand tot vlak boven de bumper (slot onderin de klep),
// de achterlichten staan in de hoeken naast de klep, de kentekenplaat zit in een uitsparing in de bumper met de verlichting erboven, en de bagageopening loopt tot de
// laaddrempel achter de bovenrand van de bumper. Alle maten zijn geschat op de foto's; zie docs/onderzoek/beslissingen.md, Beslissing BODY-1.
const bodTLy0 = 0.59, bodTLy1 = 0.80, bodTLx = 0.40, bodZTL = bodTwi(-1.665);
const bodTLy = f => lerp(bodTLy0, bodTLy1, f);
const bodTLf = 0.64;                               // grens in het achterlicht: rood eronder, helder erboven (foto's: het heldere deel is ongeveer een derde)
const bodTLreg = (s, off, f0 = 0, f1 = 1) => merge([
  lowSide(s, BOD_ZE + 0.0005, bodZTL, 12, z => [sAtY(z, bodTLy(f0)), sAtY(z, bodTLy(f1))], 4, [], off),
  bodHalfFace(BOD_ZE, -1, s, bodTLx, bodTLy(f0), bodTLy(f1), off, 3, 6)]);
// achterklep onderin (eindvlak tussen de achterlichten): halve breedte, onderrand (4 mm boven de bumper op 0,575) en diepte (binnenpaneel op ZR + bodKlD)
const bodKlX = 0.3965, bodKlY0 = 0.579, bodKlD = 0.040;
// bagageopening: sponning (rand van de opening) in het vlak bodZFl, 6 mm voor het binnenpaneel van de klep; halve breedte tussen de sponningen, laaddrempel,
// bovenrand van de sponning en het vlak waar de drempel en de zakken naast de opening ophouden (4 mm achter de achterwandbekleding van het interieur op z -1,646)
const bodZFl = BOD_ZE + 0.046, bodXO = 0.36, bodYDr = 0.60, bodYFlT = 0.855, bodZDrV = -1.650;
// klepgrens op het dek tussen eindvlak en kas: van bodKlX op het eindvlak schuin naar de rand van het kasdeel (x 0,544 op BOD_ZG0), langs de bovenhoek van het achterlicht
const bodKlXk = z => lerp(bodKlX, bodGh(BOD_ZG0).xr, clamp((z - BOD_ZE) / (BOD_ZG0 - BOD_ZE), 0, 1));
const bodDeckY = (z, x) => halfPt(z, bodSAtX(z, Math.abs(x)))[1];   // hoogte van het dek van de onderbak op |x|
// kentekenvlak in de bumper: uitsparing (halve breedte, onder- en bovenrand, diepte) voor een plaat van 520 x 110 mm met 100 mm bumper erboven, zoals op de foto's
const bodPlX = 0.275, bodPlY0 = 0.358, bodPlY1 = 0.492, bodPlD = 0.022;
const bodMistX = 0.19;                             // mistachterlicht onder de bumper aan de bestuurderskant (links, +x), 19 cm uit het midden zoals op de Duitse foto
function bodTaillamp(s) {
  const n = bodSn(s), zL = -0.002, zH = 0.03;
  // lamp: tussen reflector (15 mm) en lens, 0,5 mm voor de reflector: zo zit hij in zijn fitting en zweeft hij niet 10 mm achter het lichthuis (B-037)
  const lamp = (nm, x, y, m, dd) => P(`Lamp ${nm}`, G.cyl('z', 0.008, 0.008, 0.012, 10), m, { d: dd, p: [s * x, y, BOD_ZE + 0.0085], ex: [0, 0, 0.1] });
  // lichthuis als gesloten bak: achterwand, binnenwand naast de klep (x 0,40), boven- en onderkap en de eindwand van de omslag om de hoek
  const kap = y => merge([patch((x, t) => [s * x, y, BOD_ZE + lerp(zL, zH, t)], bodTLx, ringX(BOD_ZE, y), 6, () => [0, 1], 1),
    patch((z, t) => bodLow(z, bodPp(s, sAtY(z, y)), lerp(zL, zH, t)), BOD_ZE + 0.0005, bodZTL, 10, () => [0, 1], 1)]);
  const huis = merge([bodTLreg(s, zH), kap(bodTLy0), kap(bodTLy1), patch((y, t) => [s * bodTLx, y, BOD_ZE + lerp(zL, zH, t)], bodTLy0, bodTLy1, 3, () => [0, 1], 1),
    patch((y, t) => bodLow(bodZTL, bodPp(s, sAtY(bodZTL, y)), lerp(zL, zH, t)), bodTLy0, bodTLy1, 4, () => [0, 1], 1)]);
  return A(`Achterlicht ${n}`, { d: 'Liggend achterlicht (verhouding ongeveer 1,3 op 1, hoogte 210 mm; keuze eigenaar naar foto 1993-2001) in de achterhoek naast de klep, om de hoek van het achterscherm gewikkeld: boven een heldere lens met de richtingaanwijzer (oranje lamp) en het achteruitrijlicht, onder een rode lens voor achterlicht en remlicht. Volgorde zoals op de foto\'s van de 2001 GL.', ex: [s * 0.3, 0.1, -0.5] }, [
    P('Lens achterlicht', bodTLreg(s, zL, 0, bodTLf), MAT.lensRed, { d: 'Rode afdeklens van achterlicht en remlicht: het onderste en grootste deel van het achterlicht.', ex: [s * 0.05, -0.02, -0.1] }),
    P('Lens richtingaanwijzer en achteruitrijlicht', bodTLreg(s, zL, bodTLf, 1), MAT.bodTLHelder, { d: 'Heldere (lichte) lens bovenin het achterlicht, ongeveer een derde van de hoogte; erachter de oranje lamp van de richtingaanwijzer en de lamp van het achteruitrijlicht.', ex: [s * 0.05, 0.04, -0.1] }),
    P('Lichthuis achterlicht', huis, MAT.plastic, { d: 'Kunststof behuizing met fittingen, in het achterscherm geschroefd; een gesloten bak met een wand langs de klep.', ex: [-s * 0.04, 0, 0.06] }),
    P('Reflector achterlicht', bodTLreg(s, 0.015), MAT.bodReflWit, { d: 'Lichte, verchroomde reflector (wit) achter de lenzen.', ex: [0, 0, 0.04] }),
    lamp('achterlicht en remlicht', 0.44, bodTLy(0.32), MAT.ceramic, 'Steeklamp met twee gloeidraden voor achterlicht en remlicht, achter de rode lens.'),
    lamp('richtingaanwijzer', 0.452, bodTLy(0.82), MAT.amber, 'Oranje steeklamp van de richtingaanwijzer achter de heldere lens (op de foto\'s schemert het oranje door het heldere glas).'),
    lamp('achteruitrijlicht', 0.42, bodTLy(0.82), MAT.ceramic, 'Steeklamp van het achteruitrijlicht achter de heldere lens, naast de richtingaanwijzer.'),
  ]);
}
// Achterpaneel: de vaste delen rond de klep. huid: het staartvlak naast de achterlichten (boven en onder de lichten) en het dek buiten de klep. opening: de
// bagageopening, een eigen knoop binnen de huid (zijstraal telt Achterpaneel als buitenhuid): een sponning in het vlak bodZFl (de klep valt erop met het
// afdichtrubber ertussen), de wanden naast de opening (zakken achter de achterlichten dicht) en de laaddrempel: achterwand boven de bumperbalk tot bodYDr,
// bovenkant tot bodZDrV en een voorwand tot de bagagevloer.
function bodRearPanel() {
  const top = bodSec(BOD_ZE).yd - 0.001, zE = BOD_ZG0 - 0.004, gap = 0.0035;
  const bands = bodBoth(s => [bodHalfFace(BOD_ZE, -1, s, bodTLx, bodTLy1, top, 0, 2, 6), bodHalfFace(BOD_ZE, -1, s, bodTLx, bodYBR, bodTLy0, 0, 2, 6),
    lowSide(s, BOD_ZE + 0.0005, bodZT0, 8, z => [sAtY(z, bodTLy1), S4], 3), lowSide(s, BOD_ZE + 0.0005, bodZT0, 8, z => [sAtY(z, bodYBR + 0.003), sAtY(z, bodTLy0)], 2),
    lowSide(s, bodZTL, bodZT0, 3, z => [sAtY(z, bodTLy0), sAtY(z, bodTLy1)], 4),
    lowSide(s, BOD_ZE + 0.0005, zE, 8, z => [S4, Math.max(S4, bodSAtX(z, bodKlXk(z) + gap))], 3)]).flat();
  // sponning: buitenrand 36 mm binnen de huid (het lichthuis loopt in de omslag 30 mm binnen de huid), van y 0,42 (boven de langsliggers) tot bodYFlT
  const V = (a, b) => new THREE.Vector2(a, b), ys = [0.42, 0.46, 0.50, 0.54, 0.575, 0.60, 0.65, 0.70, 0.75, 0.80, 0.84, bodYFlT], xo = y => ringX(bodZFl, y) - 0.036;
  const rand = [...ys.map(y => V(xo(y), y)), V(bodXO, bodYFlT), V(bodXO, bodYDr), V(-bodXO, bodYDr), V(-bodXO, bodYFlT), ...ys.slice().reverse().map(y => V(-xo(y), y))];
  const sponning = (() => { const g = new THREE.ShapeGeometry(new THREE.Shape(rand), 1); g.translate(0, 0, bodZFl); return g; })();
  const dz = bodZDrV - bodZFl, zc = (bodZDrV + bodZFl) / 2;
  const zak = bodBoth(s => {   // wand naast de opening en bovenkant van de zak achter het achterlicht
    const wx = (bodXO + xo(bodYFlT)) / 2, ww = xo(bodYFlT) - bodXO;
    return [xf(G.box(0.002, bodYFlT - bodYDr, dz), [s * (bodXO + 0.001), (bodYDr + bodYFlT) / 2, zc]), xf(G.box(ww, 0.002, dz), [s * wx, bodYFlT - 0.001, zc])];
  }).flat();
  const drempel = [xf(G.box(2 * xo(bodYDr), 0.002, dz), [0, bodYDr - 0.001, zc]), xf(G.box(0.99, bodYDr - 0.455, 0.002), [0, (bodYDr + 0.455) / 2, bodZDrV - 0.001])];
  return { huid: merge(bands), opening: merge([sponning, ...zak, ...drempel]) };
}
// afdichtrubber op de sponning: zijstroken onder de kier tussen klep en achterlicht, onderstrook onder de kier tussen klep en bumper (1,5 mm voor de sponning)
function bodTgSeal() {
  const z = bodZFl - 0.0015, y0 = 0.572, x0 = bodKlX - 0.0045, x1 = 0.412;
  const strip = (xa, xb, ya, yb) => patch((u, v) => [lerp(xa, xb, u), lerp(ya, yb, v), z], 0, 1, 1, () => [0, 1], 1);
  return merge([strip(x0, x1, y0, 0.852), strip(-x1, -x0, y0, 0.852), strip(-x0, x0, y0, 0.590)]);
}
// De achterbumper is het achterste punt van de auto (z = ZR, 3495 mm) en steekt bodBpD (40 mm) voorbij het staartvlak (klep, achterpaneel, achterlichten; eindvlak op BOD_ZE) uit, met een
// vlakke bovenkant als richel onder de klep (foto's 1993-2001). De schaal is gebouwd op het eindvlak BOD_ZE en schuift 40 mm naar achteren: nul vanaf de zijkant (z -1,55), vol
// op het eindvlak; in de breedte vol tot |x| 0,45 en nul vanaf |x| 0,60, zodat de hoeken en het bovenaanzicht van de staart niet breder worden (silhouet).
const bodBpD = BOD_TD;
const bodBpA = z => sstep((-1.55 - z) / (-1.55 - BOD_ZE));
const bodBpB = x => 1 - sstep((Math.abs(x) - 0.45) / 0.15);
const bodBpDz = (x, z) => bodBpD * bodBpA(z) * bodBpB(x);
// oorspronkelijke z van een punt dat op x na de verschuiving op zNieuw ligt (de afbeelding z -> z - bodBpDz is stijgend)
const bodBpZ0 = (x, zNieuw) => { let lo = zNieuw, hi = zNieuw + bodBpD + 0.01; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (m - bodBpDz(x, m) < zNieuw) lo = m; else hi = m; } return (lo + hi) / 2; };
function bodBpMove(g) {
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) - bodBpDz(p.getX(i), p.getZ(i)));
  p.needsUpdate = true; g.computeVertexNormals(); return g;
}
function bodRearBumper() {
  const both = bodBoth;
  return A('Achterbumper', { d: 'Bumperschaal in ongelakt zwart kunststof (keuze eigenaar naar foto 1993-2001) met een vlakke bovenrichel die 40 mm onder de klep uitsteekt, de uitsparing voor de kentekenplaat en de kentekenverlichting, kleine reflectoren in de hoeken en het mistachterlicht eronder; erachter de stalen bumperbalk.', ex: [0, -0.04, -0.7] }, [
    // de schaal begint op z -1,550 (was -1,556): de kier met het boogeinde van het achterscherm (z -1,548) is 2 mm in plaats van 8, zoals de dorpel voor de boog;
    // de onderkant tussen de langsliggers begint op z -1,568 (bodRearBumperGeo)
    P('Bumperschaal achter', bodRearBumperGeo(), MAT.bodBumperZwart, { d: 'Bumperschaal in ongelakt zwart kunststof (keuze eigenaar naar foto 1993-2001) met afgeronde hoeken die om de achterwielboog lopen, een vlakke bovenkant van 40 mm die onder de klep uitsteekt, een omgezette bovenrand en een verdiept vlak voor de kentekenplaat.', ex: [0, -0.02, -0.12] }),
    P('Sluitwand achterbumper', bodRearBumperCap(), MAT.bodBumperZwart, { d: 'Zwarte wand van ongelakt kunststof (3 mm achter de voorrand van de schaal) die de schaal aan de voorkant sluit, van de onderkant tot de bovenrichel: de omgezette rand van de echte bumper. Daardoor kijk je van onderen en van voren niet in de holle bumper, op de lak van het achterpaneel en de stalen bumperbalk.', ex: [0, -0.02, -0.12] }),
    // zwarte strook 4 mm binnen de huid achter de naad van 3 mm tussen bumperschaal (tot y 0,575) en achterscherm en achterpaneel (vanaf 0,578): door de naad zag je de bagagebekleding
    ...both(s => P(`Naadstrook achterbumper ${bodSn(s)}`, lowSide(s, BOD_ZE + 0.001, -1.535, 30, z => [sAtY(z, 0.562), sAtY(z, 0.592)], 2, [], 0.004), MAT.bodLiner,
      { d: 'Zwarte strook achter de naad tussen de bovenrand van de bumperschaal en het achterscherm; de naad leest als een donkere lijn en je kijkt er niet in de bagageruimte.', ex: [s * 0.05, -0.02, -0.12] })),
    // reflector 60 x 25 mm in de bumperhoek (x 0,39 tot 0,45, y 0,435 tot 0,46), 2 mm voor het eindvlak van de bumper
    ...both(s => P(`Reflector achter ${bodSn(s)}`, patch((u, v) => { const x = lerp(0.39, 0.45, u); return [s * x, lerp(0.435, 0.46, v), BOD_ZE - bodBpDz(x, BOD_ZE) - 0.002]; }, 0, 1, 4, () => [0, 1], 1), MAT.lensRed,
      { d: 'Kleine rode reflector van ongeveer 60 x 25 mm laag in de bumperhoek.', ex: [s * 0.05, 0, -0.08] })),
    bodRearFog(),
  ]);
}
// Mistachterlicht (B-039): verplicht in de EU (ECE R48) en op beide foto's een rode rechthoekige lamp onder de bumper; in Nederland aan de bestuurderskant, dus links
// (+x) op deze linksgestuurde auto, zoals op de Duitse foto. Ongeveer 110 x 34 mm (geschat); hangt met twee lipjes onder de bumper, 13 mm voor het eindvlak van de bumper (die 40 mm achter het klepvlak eindigt).
function bodRearFog() {
  const x = bodMistX, z0 = ZR + 0.013, z1 = ZR + 0.041, yB = z => YB(bodBpZ0(x, z)), yT = Math.min(yB(z0), yB(z1)) - 0.003, h = 0.034, zc = (z0 + z1) / 2, zl = ZR + 0.0255;
  const lip = (Math.min(yB(zl - 0.006), yB(zl + 0.006)) - 0.0005) - yT;   // de onderkant van de bumper loopt naar voren omlaag: de lipjes reiken tot de laagste kant
  return A('Mistachterlicht', { d: 'Rood mistachterlicht onder de achterbumper aan de bestuurderskant (links); verplicht voor een in de EU toegelaten auto (ECE R48). Maat en plaats geschat op de foto\'s van de 2001 GL.', ex: [0, -0.06, -0.14] }, [
    P('Lamphuis mistachterlicht', G.rbox(0.11, h, z1 - z0, 0.005), MAT.plastic, { d: 'Zwart kunststof huis met de lamp, onder de bumper geschroefd.', p: [x, yT - h / 2, zc], ex: [0, -0.03, 0] }),
    P('Lens mistachterlicht', G.rbox(0.1, h - 0.008, 0.004, 0.0015), MAT.lensRed, { d: 'Rode lens van het mistachterlicht, naar achteren gericht.', p: [x, yT - h / 2, z0 - 0.002], ex: [0, 0, -0.06] }),
    P('Houder mistachterlicht', merge([-0.04, 0.04].map(dx => xf(G.box(0.012, lip, 0.012), [dx, 0, 0]))), MAT.darkSteel, { d: 'Twee lipjes waarmee het huis aan de onderkant van de bumper vastzit.', p: [x, yT + lip / 2, zl], ex: [0, 0.03, 0] }),
  ]);
}
// bumperschaal achter (open punt AWK, B5): als bodBumperGeo(bodYBR, -1,550, ZR, -1), maar de onderkant tussen de langsliggers (s < 0,100 in bodLow, |x| tot 0,458) begint 18 mm
// verder naar achteren, op z -1,568: het Ophangrubber einddemper achter (|x| 0,397 tot 0,433, tot y 0,275, z -1,563 tot -1,537) stak daar 1,3 mm in de schaal (op fa5c619 1,2 mm,
// toen de schaal op z -1,556 begon). Vanaf s 0,110 (|x| 0,503) naar buiten en omhoog begint de schaal op z -1,550, op de kier met het boogeinde van het achterscherm.
// Het eindvlak heeft een uitsparing van bodPlD diep voor de kentekenplaat; de bovenrand onder de klep is 42 mm naar binnen omgezet (bovenkant van de bumper), zodat je
// door de kier tussen klep en bumper op lak kijkt en niet in de bumper.
function bodRearBumperGeo() {
  const z0 = -1.550, zB = -1.568, zE = BOD_ZE + 0.0005, zv = p => lerp(zB, z0, sstep((Math.abs(p) - 0.100) / 0.010));
  const zb = BOD_ZE + bodPlD, X = bodPlX;
  const wand = (f, nu) => patch(f, 0, 1, nu, () => [0, 1], 1);
  // eindvlak als bodFace, maar de zijrand volgt de doorsnede op de rand van de schil (zE), niet op BOD_ZE: de staart loopt daar scherp samen (2,3 mm in x op 0,5 mm in z) en bodFace liet
  // een kier van 2 mm tussen eindvlak en schil; de buitenste kolom ligt ook op die z, zodat er geen kier in z blijft
  const vlak = (x0, x1, y0, y1, ny, nx, kw = 1) => patch((u, t) => { const y = lerp(y0, y1, Math.pow(u, kw)), X = ringX(zE, y), xa = clamp(x0, -X, X), xb = Math.max(xa, clamp(x1, -X, X)), rand = (t === 0 && x0 <= -X) || (t === 1 && x1 >= X); return [xa + (xb - xa) * t, y, rand ? zE : BOD_ZE]; }, 0, 1, ny, () => [0, 1], nx);
  // alles behalve de binnenlip wordt met bodBpMove 40 mm naar achteren verschoven (alleen midden van de staart, zie bodBpD)
  const schil = [
    patch((z, p) => bodLow(lerp(zE, zv(p), (z - zE) / (z0 - zE)), p, 0), zE, z0, 36, z => { const sb = sAtY(z, bodYBR); return [-sb, sb]; }, 34),
    vlak(-9, 9, YB(BOD_ZE) + 0.001, bodPlY0, 16, 30, 2), vlak(-9, 9, bodPlY1, bodYBR, 8, 30),
    vlak(X, 9, bodPlY0, bodPlY1, 6, 8), vlak(-9, -X, bodPlY0, bodPlY1, 6, 8),
    wand((u, t) => [lerp(-X, X, u), lerp(bodPlY0, bodPlY1, t), zb], 4),
    wand((u, t) => [lerp(-X, X, u), bodPlY0, BOD_ZE + bodPlD * t], 4), wand((u, t) => [lerp(-X, X, u), bodPlY1, BOD_ZE + bodPlD * t], 4),
    wand((u, t) => [X, lerp(bodPlY0, bodPlY1, u), BOD_ZE + bodPlD * t], 1), wand((u, t) => [-X, lerp(bodPlY0, bodPlY1, u), BOD_ZE + bodPlD * t], 1)].map(bodBpMove);
  // vlakke bovenkant: strook op y bodYBR tussen de bovenrand van het eindvlak (met de zijkanten) en dezelfde rand na de verschuiving
  const rand = [];
  for (let i = 0; i <= 12; i++) { const z = lerp(z0, zE, i / 12), q = bodLow(z, sAtY(z, bodYBR), 0); rand.push(q); }
  const xe = ringX(BOD_ZE, bodYBR);
  for (let i = 1; i < 24; i++) rand.push([lerp(xe, -xe, i / 24), bodYBR, BOD_ZE]);
  for (let i = 12; i >= 0; i--) { const z = lerp(z0, zE, i / 12), q = bodLow(z, -sAtY(z, bodYBR), 0); rand.push(q); }
  const pos = [], idx = [];
  rand.forEach(q => { pos.push(q[0], bodYBR, q[2]); pos.push(q[0], bodYBR, q[2] - bodBpDz(q[0], q[2])); });
  for (let i = 0; i < rand.length - 1; i++) { const a = 2 * i; idx.push(a, a + 2, a + 1, a + 2, a + 3, a + 1); }
  const richel = new THREE.BufferGeometry();
  richel.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); richel.setIndex(idx); richel.computeVertexNormals();
  return merge([...schil, richel, wand((u, t) => [lerp(-bodTLx, bodTLx, u), bodYBR - 0.0005, BOD_ZE + 0.042 * t], 8)]);
}
// Sluitwand van de achterbumper: vlakke plaat in de doorsnede van de voorrand van de schaal (de U van de onderkant en de flanken, dicht met de bovenrichel op y bodYBR),
// 3 mm achter die rand zodat hij binnen de schaal ligt. De voorrand ligt op z -1,568 onder de langsliggers (|x| < 0,54) en op -1,550 daarbuiten (zie bodRearBumperGeo);
// de wand volgt dat met dezelfde stap in |x|.
function bodRearBumperCap() {
  const z0 = -1.550, zB = -1.568, zv = p => lerp(zB, z0, sstep((Math.abs(p) - 0.100) / 0.010)), sb = sAtY(z0, bodYBR), N = 72, V = (a, b) => new THREE.Vector2(a, b);
  const rand = [];
  for (let i = 0; i <= N; i++) { const p = lerp(-sb, sb, i / N), q = bodLow(zv(p), p, 0); rand.push(q); }
  const g = new THREE.ShapeGeometry(new THREE.Shape(rand.map(q => V(q[0], q[1]))), 1);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) { const ax = Math.abs(pos.getX(i)); pos.setZ(i, lerp(zB, z0, sstep((ax - 0.5405) / 0.0045)) - 0.003); }
  pos.needsUpdate = true; g.computeVertexNormals(); return g;
}
function bodRearPlate() {
  const yc = (bodPlY0 + bodPlY1) / 2, zh = BOD_ZE - bodBpD + bodPlD - 0.003, zp = zh - 0.003 - 0.0015;
  return A('Kentekenvlak achter', { d: 'Kentekenplaat in de uitsparing van de ongelakte zwarte achterbumper, met houder en kentekenverlichting in de bovenkant van de uitsparing.', ex: [0, -0.04, -0.95] }, [
    P('Kentekenplaathouder achter', G.rbox(0.54, 0.125, 0.006, 0.004), MAT.bodBumper, { d: 'Zwarte houder voor de achterste kentekenplaat, tegen de achterwand van de uitsparing.', p: [0, yc, zh], ex: [0, 0, -0.1] }),
    P('Kentekenplaat achter', G.rbox(0.52, 0.11, 0.003, 0.002), MAT.bodPlate, { d: 'Gele Nederlandse plaat met zwarte rand en blauwe EU-strook, met streepjes op de plaats van het kenteken (geen kenteken in dit model).', p: [0, yc, zp], ex: [0, 0, -0.16] }),
    P('Kentekenverlichting', merge([-0.16, 0.16].map(x => xf(G.rbox(0.05, 0.01, 0.014, 0.003), [x, 0, 0]))), MAT.lensClear, { d: 'Twee kleine lampen in de bovenkant van de uitsparing die de plaat van boven verlichten (aantal en plaats geschat).', p: [0, bodPlY1 - 0.005, BOD_ZE - bodBpD + 0.0075], ex: [0, 0.04, -0.06] }),
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
// Onderste deel van de klep (B-002): het dek tussen kas en eindvlak (klepgrens bodKlXk), de opstap van het dek naar het kasdeel op BOD_ZG0 (daar ligt het kasdek
// 11 tot 17 mm hoger dan het dek van de onderbak) en het eindvlak tussen de achterlichten tot bodKlY0, met de omgezette randen onder en opzij (diepte bodKlD).
function bodTgLowSkin() {
  const zE = BOD_ZG0, xr = bodGh(zE).xr, yS = bodDeckY(BOD_ZE, bodKlX) - 0.001;
  const dek = bodDeck(BOD_ZE + 0.0005, zE, 10, z => bodSAtX(z, bodKlXk(z)), 24);
  const opstap = patch((u, t) => { const x = u * xr, yl = bodDeckY(zE, x), yh = bodGhHalf(zE, bodQAtX(zE, x))[1]; return [x, lerp(yl, yh, t), zE]; }, -1, 1, 24, () => [0, 1], 1);
  const vlak = patch((u, v) => { const x = u * bodKlX; return [x, lerp(bodKlY0, bodDeckY(BOD_ZE, x) - 0.0002, v), BOD_ZE]; }, -1, 1, 20, () => [0, 1], 10);
  const onder = patch((u, t) => [u * bodKlX, bodKlY0, BOD_ZE + bodKlD * t], -1, 1, 8, () => [0, 1], 1);
  const zij = bodBoth(s => patch((v, t) => [s * bodKlX, lerp(bodKlY0, yS, v), BOD_ZE + bodKlD * t], 0, 1, 4, () => [0, 1], 1));
  return merge([dek, opstap, vlak, onder, ...zij]);
}
// binnenpaneel onderin: vlak op ZR + bodKlD tot 8 mm onder het dek, en een overgang naar de onderrand van het binnenpaneel van het kasdeel (z -1,66, 40 mm binnen de huid)
function bodTgLowInner() {
  const zi = BOD_ZE + bodKlD, zg = bodTwi(-1.66), a = bodQR / 2, yI = x => bodDeckY(zi, x) - 0.008;
  const vlak = patch((u, v) => { const x = u * bodKlX; return [x, lerp(bodKlY0, yI(x), v), zi]; }, -1, 1, 12, () => [0, 1], 6);
  const kas = u => { const w = lerp(1 - a, a, (u + 1) / 2), sd = w <= 0.5 ? 1 : -1, q = w <= 0.5 ? 2 * w : 2 - 2 * w, [x, y] = bodGhHalf(zg, q); return [sd * (x - 0.028), y - 0.028, zg]; };
  const overgang = patch((u, t) => { const x = u * bodKlX, p = [x, yI(x), zi], k = kas(u); return [lerp(p[0], k[0], t), lerp(p[1], k[1], t), lerp(p[2], k[2], t)]; }, -1, 1, 24, () => [0, 1], 3);
  return merge([vlak, overgang]);
}
function bodTailgate() {
  const both = bodBoth, sn = bodSn;
  const lo = bodQLoH, zm = (bodZH0 + bodZH1) / 2;
  const heat = merge([-1.28, -1.34, -1.40, -1.46, -1.52, -1.58].map(bodTwi).map(z => { const pts = []; for (let i = 0; i <= 14; i++) { const w = lo(z) / 2 + 0.003 + (1 - lo(z) - 0.006) * i / 14, p = ghPt(z, w); pts.push([p[0], p[1] - 0.004, z]); } return tube(pts, 0.0013, 20, 3); }));
  const wp = ghPt(bodTwi(-1.585), 0.5 - 0.04), wt = ghPt(bodTwi(-1.585), 0.5 - 0.17), wm = ghPt(bodTwi(-1.585), 0.5 - 0.105);
  const wiper = A('Achterruitwisser', { d: 'Achterruitwisser (standaard op de Alto): arm met blad en motor, onderaan de achterruit.', ex: [0.06, 0.14, 0] }, [
    P('Wisserarm achter', tube([[wp[0], wp[1] + 0.012, wp[2]], [wm[0], wm[1] + 0.014, wm[2] + 0.01], [wt[0], wt[1] + 0.012, wt[2] + 0.02]], 0.0045, 16, 6), MAT.bodBlack, { d: 'Zwarte wisserarm van de achterruitwisser; de veer in de arm drukt het blad op de ruit.', ex: [0, 0.03, 0] }),
    P('Wisserblad achter', tube([[wm[0] + 0.02, wm[1] + 0.008, wm[2] + 0.062], [wt[0] - 0.05, wt[1] + 0.008, wt[2] + 0.062]].map(p => p), 0.005, 8, 5), MAT.rubber, { d: 'Rubber wisserblad van de achterruitwisser, in een stalen beugel aan de arm.', ex: [0, 0.06, 0] }),
    P('Asmoerkap', G.cyl('y', 0.013, 0.015, 0.02, 12), MAT.bodBlack, { d: 'Kap over de asmoer van de wisserarm.', p: [wp[0], wp[1] + 0.012, wp[2]], ex: [0, 0.03, 0] }),
    P('Wissermotor achter', merge([G.cyl('z', 0.028, 0.028, 0.07, 16), xf(G.rbox(0.06, 0.045, 0.045, 0.01), [0, 0, -0.05])]), MAT.darkSteel, { d: 'Motor van de achterruitwisser in de klep.', p: [wp[0], wp[1] - 0.06, wp[2] + 0.02], ex: [0, -0.06, 0.06] }),
  ]);
  const gp = bodGsPts(1), Lc = gp.L0 * 0.52, Lr = Math.max(gp.L0 * 0.52, gp.L1 - gp.L0 + 0.1);
  const gasveer = s => { const q = bodGsPts(s); return A(`Gasveer ${sn(s)}`, { d: `Gasveer die de geopende achterklep omhoog houdt; onderaan bevestigd tegen de zijwand van de opening (C-stijl), bovenaan op de zijrand van de klep. Lengte gesloten ${(q.L0 * 1000).toFixed(0)} mm, open ${(q.L1 * 1000).toFixed(0)} mm (geschat; de catalogusmaat is niet gevonden).`, p: q.a, q: quatFromTo(V3(0, 0, 1), V3(q.b[0] - q.a[0], q.b[1] - q.a[1], q.b[2] - q.a[2])), ex: [s * 0.14, 0, 0],
    strut: { a: { node: `Gasveerbevestiging ${sn(s)}`, p: [0, 0, 0] }, b: { node: `${AUTO.wortel}/Carrosserie/Achterklep`, p: q.b }, rod: 'Zuigerstang', lead: `${AUTO.wortel}/Carrosserie/Achterklep`, restLen: q.L0 } }, [
    P('Cilinder', merge([xf(G.cyl('z', 0.0125, 0.0125, Lc, 14), [0, 0, Lc / 2]), G.sphere(0.0145, 10)]), MAT.bodBlack, { d: 'Gasgevulde cilinder van de gasveer met kogelkom aan de carrosseriezijde.', ex: [0, 0, -0.05] }),
    P('Zuigerstang', merge([xf(G.cyl('z', 0.006, 0.006, Lr, 10), [0, 0, q.L0 - Lr / 2]), xf(G.sphere(0.0115, 10), [0, 0, q.L0])]), MAT.steel, { d: 'Verchroomde zuigerstang die uit de cilinder schuift; kogelkom aan de klepzijde.', ex: [0, 0.03, 0.05] }),
  ]); };
  const yC = 0.73, zi = BOD_ZE + bodKlD;   // slotcilinder halverwege de achterlichten, zoals op de foto's
  return A('Achterklep', { d: 'Grote achterklep van de dakrand tot vlak boven de bumper: de hele achterruit, het staartvlak tussen de achterlichten met het slot onderin, achterruitwisser en verwarmde ruit. Scharniert aan de dakrand en wordt door twee gasveren omhooggehouden.', ex: [0, 0.42, -0.5],
    open: { type: 'hinge', pivot: bodTgPv, axis: [1, 0, 0], angle: bodTgAng, min: 60 * PI / 180, label: 'Achterklep', look: { dir: [0.4, 0.6, -1], nodes: ['Achterklep', 'Gasveer links', 'Gasveer rechts'] } } }, [
    P('Buitenpaneel achterklep', merge([bodTailSkinGeo(0), bodTgLowSkin()]), MAT.paint, { d: 'Plaatwerk van de achterklep in het rood: rond en onder de ruit, over de bovenhoek en het staartvlak tussen de achterlichten tot vlak boven de bumper, met een omgezette rand onder en opzij.', ex: [0, 0, -0.08] }),
    P('Binnenpaneel achterklep', merge([bodTailSkinGeo(-0.04, bodTwi(-1.66)), bodTgLowInner()]), MAT.paintIn, { d: 'Binnenframe van de achterklep met scharnier- en slotversteviging; rond de ruit een smalle lijmrand, onderin een vlakke plaat 40 mm achter de buitenhuid.', ex: [0, 0, 0.04] }),
    P('Binnenbekleding achterklep', merge([bodTailSkinGeo(-0.055, bodTwi(-1.66)), xf(G.box(0.66, 0.22, 0.006), [0, 0.735, zi + 0.0035])]), MAT.dash, { d: 'Kunststof binnenbekleding van de klep, onderin een paneel binnen de bagageopening met de greep om de klep te sluiten.', ex: [0, 0, 0.12] }),
    P('Achterruit', bodGhDeck(bodZH1, bodZH0, 22, lo, 18, [], -0.003), MAT.glass, { d: 'Verwarmde achterruit van gehard, licht getint glas.', ex: [0, 0.14, 0.02] }),
    P('Rubber achterruit', bodDeckRim(bodZH1 + 0.002, bodZH0 - 0.002, z => lo(z) + 0.01, 0.0045), MAT.bodSeal, { d: 'Zwart afdichtrubber rond de achterruit.', ex: [0, 0.05, 0] }),
    P('Achterruitverwarming', heat, MAT.copper, { d: 'Dunne verwarmingsdraden in de achterruit tegen condens en ijs (patroon schematisch).', ex: [0, 0.1, 0.06] }),
    P('Embleem ALTO SUZUKI', (() => { if (!MAT.bodEmbleemAchter.map) { MAT.bodEmbleemAchter.map = bodEmbleemTex(); MAT.bodEmbleemAchter.needsUpdate = true; } return G.rbox(0.09, 0.04, 0.003, 0.002); })(), MAT.bodEmbleemAchter,
      { d: 'Chroomplaatje van ongeveer 90 x 40 mm met de letters ALTO en SUZUKI, links op de klep (keuze eigenaar naar foto 1993-2001); geplakt op het staartvlak.', p: [0.25, 0.70, BOD_ZE - 0.0015], ex: [0.04, 0, -0.1] }),
    wiper,
    A('Achterklepslot', { d: 'Slot onderin de klep met slotmotor voor de centrale vergrendeling en een slotcilinder in het staartvlak; de vanghaak grijpt om de slotbeugel in de laaddrempel.', ex: [0, -0.08, -0.06] }, [
      P('Slotkast achterklep', G.rbox(0.08, 0.05, 0.03, 0.008), MAT.darkSteel, { d: 'Slot met vanghaak onderin de klep, tussen buitenhuid en binnenpaneel.', p: [0, bodKlY0 + 0.03, BOD_ZE + 0.022], ex: [0, -0.04, 0] }),
      P('Slotmotor achterklep', G.rbox(0.05, 0.04, 0.025, 0.008), MAT.plastic, { d: 'Elektrische ontgrendelmotor naast het slot.', p: [0.07, bodKlY0 + 0.042, BOD_ZE + 0.025], ex: [0.04, 0, 0] }),
      P('Slotcilinder achterklep', merge([G.cyl('z', 0.0115, 0.0115, 0.0034, 16), xf(G.cyl('z', 0.007, 0.007, 0.02, 12), [0, 0, 0.0128])]), MAT.satin, { d: 'Slotcilinder met een metalen rand in het staartvlak van de klep, op de hoogte van het midden van de achterlichten (foto\'s); met de sleutel gaat de klep open.', p: [0, yC, BOD_ZE - 0.0018], ex: [0, 0, -0.06] }),
      P('Slotstang achterklep', rodBetween([0, yC - 0.01, BOD_ZE + 0.02], [0, bodKlY0 + 0.055, BOD_ZE + 0.02], 0.0025, 8), MAT.steel, { d: 'Stang van de slotcilinder naar het slot onderin de klep.', ex: [0, 0, 0.04] }),
    ]),
    ...both(s => { const q = bodGsPts(s); return gasveer(s); }),
    ...both(s => { const q = bodGsPts(s); return P(`Gasveerbeugel ${sn(s)}`, merge([G.sphere(0.012, 10), xf(G.rbox(0.03, 0.02, 0.02, 0.004), [0, 0.016, 0])]), MAT.darkSteel, { d: 'Beugel met kogelpen aan de zijrand van de klep waarop de gasveer draait (plaats geschat).', p: q.b, ex: [s * 0.04, 0.05, 0] }); }),
    ...both(s => P(`Klepscharnierblad ${sn(s)}`, G.rbox(0.026, 0.007, 0.06, 0.003), MAT.bodPillar, { d: 'Plat zwart scharnierblad aan de achterklep, draait om de scharnierpen op de dakrand.', p: [s * 0.42, bodGhHalf(-1.19, bodQAtX(-1.19, 0.42))[1] + 0.001, -1.19], ex: [0, 0.05, -0.02] })),
    ...both(s => P(`Klepscharnier ${sn(s)}`, G.rbox(0.03, 0.014, 0.08, 0.005), MAT.darkSteel, { d: 'Scharnier tussen dak en achterklep, het deel aan de carrosseriezijde; blijft staan als de klep opent.', p: [s * 0.42, bodGh(-1.15).yre - 0.019, -1.15], stay: true, ex: [0, 0.04, 0.04] })),
    // aanslag op de sponning naast de opening, 0,5 mm achter het binnenpaneel van de klep (de klep sluit er tegenaan); klapt naar achteren
    // uit, van de sponning af en voorbij de buitenhuid van de klep, zodat hij in de preset Achterklep niet achter het buitenpaneel valt
    ...both(s => P(`Klepbuffer ${sn(s)}`, G.cyl('z', 0.009, 0.009, 0.0055, 10), MAT.rubber, { d: 'Rubberen aanslag op de sponning naast de bagageopening die het rammelen van de klep voorkomt.', stay: true, p: [s * 0.375, 0.80, bodZFl - 0.00275], ex: [s * 0.03, 0, -0.14] })),
  ]);
}
// gasveerbevestigingen op de C-stijl (carrosseriezijde)
const bodGsMount = s => P(`Gasveerbevestiging ${bodSn(s)}`, merge([G.sphere(0.012, 10), xf(G.cyl('x', 0.004, 0.004, 0.012, 8), [s * 0.009, 0, 0]), xf(G.rbox(0.008, 0.05, 0.04, 0.003), [s * 0.018, 0, 0])]), MAT.darkSteel,
  { d: 'Kogelpen op een plaatje tegen de binnenkant van de C-stijl, waarop de gasveer van de achterklep draait (plaats geschat).', p: bodGsPts(s).a, ex: [s * 0.04, 0, 0] });
/* ---------- tankklep (links achter) ---------- */
// punt op de buitenhuid (aan zijde s) bij z en y; de ovaal van de klep en de ring tussen ovaal en rechthoek lopen over de huid van het achterscherm
const bodTkPt = (s, z, y) => bodLow(z, bodPp(s, sAtY(z, y)), 0);
// ring van huid tussen de rechthoek van de opening (bodTkZ, bodTkY) en de ovaal: per hoek theta een straal van de ovaal naar de rand van de rechthoek
function bodTkRing(s) {
  const [k0, k1] = bodTkZ, [y0, y1] = bodTkY, [az, ay] = bodTkA, zc = (k0 + k1) / 2, yc = (y0 + y1) / 2, hz = (k1 - k0) / 2, hy = (y1 - y0) / 2;
  const th = Math.atan((az * hy) / (ay * hz)), breaks = [th, PI - th, PI + th, 2 * PI - th];   // th: hoek waar de straal door een hoek van de rechthoek gaat
  return patch((a, t) => {
    const ex = az * Math.cos(a), ey = ay * Math.sin(a), f = 1 / Math.max(Math.abs(ex) / hz, Math.abs(ey) / hy);
    return bodTkPt(s, zc + lerp(ex, ex * f, t), yc + lerp(ey, ey * f, t));
  }, 0, 2 * PI, 48, () => [0, 1], 3, breaks);
}
// Gespiegeld naar links (B-005): klep, kom en opener aan zijde bodTkS; dezelfde y en z. De klep scharniert aan de voorrand en klapt naar voren open;
// min 115 van 140 graden (0,82; op 112 lag hij precies op de grens van 0,8, B-025).
function bodFuelFlap() {
  const s = bodTkS, [k0, k1] = bodTkZ, [y0, y1] = bodTkY, [az, ay] = bodTkA, zc = (k0 + k1) / 2, ym = (y0 + y1) / 2, zr = zc + az, xs = surfX(zr, ym);
  // ovale plaat 3 mm kleiner dan de opening (r = 1 aan de rand), op de huid
  // 1 mm onder de huid: met de inlopende flank (FLANK-3) is het scherm hier sterker gebogen en lag de plaat tussen de koorden van het scherm 2 mm erbuiten
  const plaat = patch((a, t) => { const z = zc + (az - 0.003) * t * Math.cos(a), y = ym + (ay - 0.003) * t * Math.sin(a); return bodLow(z, bodPp(s, sAtY(z, y)), 0.001); }, 0, 2 * PI, 48, () => [0, 1], 6);
  return A('Tankvulopening', { d: 'Ovale opening van ongeveer 100 x 130 mm in het linker achterscherm met de klep en de tankkom; de vulhals en dop zitten in het brandstofsysteem.', ex: [s * 0.2, 0.05, 0] }, [
    A('Tankklep', { d: 'Kleine ovale klep in carrosseriekleur voor de brandstofvulling, links achter, ongeveer 100 mm breed en 130 mm hoog (geschat op de foto\'s van de modelreeks, waar de klep rond tot ovaal is); scharniert aan de voorrand (z -1,40) en klapt naar voren open (openingshoek geschat).', ex: [s * 0.12, 0, 0.1],
      open: { type: 'hinge', pivot: [s * (xs + 0.004), ym, zr - 0.003], axis: [0, 1, 0], angle: -s * 140 * PI / 180, min: 115 * PI / 180, label: 'Tankklep', look: { dir: [s * 1, 0.3, -0.5], nodes: ['Tankklep'] } } }, [
      P('Klepplaat tankklep', plaat, MAT.paint, { d: 'Het ovale paneel van de tankklep in het rood.', ex: [s * 0.04, 0, 0.04] }),
      P('Klepveer tankklep', G.rbox(0.012, 0.03, 0.012, 0.003), MAT.darkSteel, { d: 'Veerscharnier waarmee de klep dicht blijft; blijft aan de carrosserie zitten, in de voorhoek van de tankkom.', p: [s * (xs - 0.012), ym, zr - 0.008], stay: true, ex: [s * 0.03, 0, 0.03] }),
    ]),
    P('Tankkom', bodTankKom(s), MAT.plastic, { d: 'Zwarte kom achter de klep: een ovale wand van de opening in het scherm naar binnen en een bodem op x 0,6695 met een gat waar de vulhals doorheen komt; de dop zit in de kom.', ex: [s * 0.04, 0, 0] }),
  ]);
}
// Tankkom als kuip (was een blok van 30 mm waar de vulhals 14 mm in stak): de vulhals van systems.js eindigt op x 0,669 (hart y 0,72, z -1,45, straal 30 mm) en de dop
// zit op x 0,671 tot 0,694. Bodem op xb met een gat van 32 mm straal, een ovale wand langs de rand van de opening (bodTkA) tot 1 mm binnen de huid.
function bodTankKom(s) {
  const [k0, k1] = bodTkZ, [y0, y1] = bodTkY, [az, ay] = bodTkA, zc = (k0 + k1) / 2, yc = (y0 + y1) / 2, xb = 0.6695;
  const sh = new THREE.Shape(); sh.absellipse(zc, yc, az, ay, 0, 2 * PI, false);
  sh.holes.push(new THREE.Path().absarc(zc, yc, 0.032, 0, 2 * PI, true));
  const bodem = new THREE.ShapeGeometry(sh, 32); bodem.rotateY(-HALF); bodem.translate(s * xb, 0, 0);
  const wand = patch((a, t) => { const z = zc + az * Math.cos(a), y = yc + ay * Math.sin(a), x = surfX(z, y) - 0.001; return [s * lerp(xb, x, t), y, z]; }, 0, 2 * PI, 48, () => [0, 1], 1);
  return merge([bodem, wand]);
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
// Staafantenne (B-042): op twee foto's van de modelreeks (witte en blauwe auto, linkerkant) zit een zwarte ovale voet van ongeveer 70 x 25 mm op de dakrand links, net achter de A-stijl,
// met een kort stompje; de lengte van de staaf is geschat. De voet volgt de helling van het dak (normaal uit de dakhoogte in x en z).
function bodAntenna() {
  const z = 0.06, g = bodGh(z), x = g.xr - 0.02, roofY = (zz, xx) => { const q = bodGh(zz), t = clamp(1 - Math.abs(xx) / q.xr, 0, 1); return q.yre + q.cr * t * (2 - t); };
  const e = 0.004, dx = (roofY(z, x + e) - roofY(z, x - e)) / (2 * e), dz = (roofY(z + e, x) - roofY(z - e, x)) / (2 * e), n = V3(-dx, 1, -dz).normalize();
  const voet = xf(G.cyl('y', 0.0125, 0.0125, 0.008, 20), [0, 0.004, 0], [0, 0, 0], [1, 1, 2.8]);
  const staaf = merge([rodBetween([0, 0.006, 0.006], [0, 0.114, -0.045], 0.0015, 8), xf(G.sphere(0.0034, 8), [0, 0.114, -0.045])]);
  const pose = { p: [x, roofY(z, x), z], q: quatFromTo(V3(0, 1, 0), n) };
  return A('Antenne', { d: 'Staafantenne op het dak links voorin, net achter de A-stijl (zoals op twee foto\'s van de modelreeks): een zwarte ovale voet met een dunne staaf die schuin naar achteren staat. Plaats en lengte zijn geschat.', ex: [0.2, 0.3, 0.1] }, [
    P('Antennevoet', voet, MAT.bodBlack, Object.assign({ d: 'Zwarte kunststof voet van ongeveer 70 x 25 mm en 8 mm hoog op de dakrand links (z 0,06 en 20 mm van de rand van het dakpaneel; geschat naar de foto\'s), volgt de helling van het dak.', ex: [0, 0.03, 0] }, pose)),
    P('Antennestaaf', staaf, MAT.bodBlack, Object.assign({ d: 'Dunne zwarte staaf van 3 mm doorsnede en ongeveer 120 mm lang, 25 graden naar achteren gekanteld en met een knopje aan het uiteinde (lengte en stand geschat: de foto\'s tonen alleen een stompje boven de voet).', ex: [0, 0.07, 0] }, pose)),
  ]);
}
/* ---------- opbouw ---------- */
// Zijrepeater: klein oranje herhalingsknipperlicht (ca. 40 x 20 mm) op het voorscherm, net voor de portiervoorrand en boven de wielkast. Plaats en hoogte zijn geschat (niet bevestigd): op de foto's van de
// witte (1997) en de blauwe auto (2001) zit het lichtje ongeveer 140 tot 200 mm boven de top van de wielboog, dus op y 0,70 tot 0,75 (perspectief, schaal uit de bandhoogte; de review gaf 0,65 tot 0,70).
// Hij hangt in dezelfde groep als het voorscherm en schuift met dezelfde uitklapvector mee, zodat hij bij een uitgeklapte carrosserie op het scherm blijft zitten.
function bodRepeater(s) {
  const z = 0.84, y = 0.70, sv = sAtY(z, y), n = bodN(z, sv);
  return P(`Zijrepeater ${bodSn(s)}`, G.rbox(0.006, 0.02, 0.04, 0.004), MAT.bodAmber, { d: 'Oranje herhalingsknipperlicht op het voorscherm (ongeveer 40 x 20 mm); plaats en hoogte (y 0,70, 140 mm boven de top van de wielboog) zijn geschat op twee foto\'s van de modelreeks en niet bevestigd; een recht zijaanzicht zou de hoogte op ongeveer 30 mm nauwkeurig vastleggen.', ...bodPose(s, bodAt(z, y, 0.0005), n), ex: [s * 0.46, 0.06, 0.1] });
}
function buildBody() {
  const sk = bodSkinParts(), rp = bodRearPanel(), both = bodBoth, sn = bodSn;
  const frame = A('Zijwanden en dak', { d: 'Schermen, stijlen, dakrand en dakplaat met de vaste ruiten van de 3-deurs.', ex: [0, 0.32, 0] }, [
    P('Dakpaneel', bodRoofGeo(), MAT.paint, { d: 'Dakplaat van staal in het rood, gelast op de dakranden en de dakbogen; zonder glazen dak.', ex: [0, 0.16, 0] }),
    A('Dakbogen', { d: 'Drie dwarsliggers onder het dakpaneel.', ex: [0, 0.1, 0] }, [[0.30, 'voor'], [-0.45, 'midden'], [-1.05, 'achter']].map(([z, nm]) => P(`Dakboog ${nm}`, (() => { const pts = []; for (let i = 0; i <= 12; i++) { const w = bodQR / 2 + (1 - bodQR) * i / 12, p = ghPt(z, w); pts.push([p[0] * 0.97, p[1] - 0.012, z]); } return tube(pts, 0.0045, 24, 6); })(), MAT.paintIn, { d: 'Dwarsligger onder het dakpaneel.', ex: [0, -0.04, z * 0.05] }))),
    P('Waterkast', bodCowlGeo(), MAT.bodBlack, { d: 'Zwarte kunststof afdekplaat met luchtinlaat voor het interieur, tussen motorkap en voorruit; hierin staan de wisserassen.', ex: [0, 0.1, 0.02] }),
    bodAntenna(),
    ...sk.kids, ...both(sk.qGlass), ...both(bodRepeater),
    P('Achterpaneel', rp.huid, MAT.paint, { d: 'Staartvlak naast de achterklep: de randen boven en onder de achterlichten en het dek buiten de klep; aan de schermen en de bagageopening gelast.', ex: [0, 0, -0.2] }),
    P('Bagageopening', rp.opening, MAT.paint, { d: 'Rand van de bagageopening: de sponning waarop de achterklep sluit, de wanden naast de opening achter de achterlichten en de laaddrempel (bovenkant op ongeveer 600 mm, 25 mm boven de bumper; geschat).', ex: [0, 0.04, -0.12] }),
    P('Afdichtrubber achterklep', bodTgSeal(), MAT.bodSeal, { d: 'Zwart afdichtrubber op de sponning van de bagageopening, onder de kieren tussen klep en achterlichten en tussen klep en bumper; de klep valt erop dicht.', ex: [0, 0, -0.16] }),
    ...both(s => P(`Slotbeugel B-stijl ${sn(s)}`, merge([xf(G.rbox(0.05, 0.14, 0.01, 0.002), [0, 0, 0.0]), tube([[s * 0.018, 0, 0.0], [s * 0.018, 0, 0.06], [-s * 0.018, 0, 0.06], [-s * 0.018, 0, 0.0]], 0.008, 16, 6)]), MAT.darkSteel, { d: 'Sluitplaat met U-beugel in de achterrand van de portieropening waar het slot van het portier in grijpt (plaats geschat); alleen te zien bij open portier.', p: [s * 0.68, 0.66, bodZDR - 0.04], ex: [s * 0.09, 0, -0.05] })),
    ...both(bodGsMount),
  ]);
  const cage = A('Carrosseriekooi', { d: 'Zelfdragende ruwbouw van de 3-deurs hatchback: vloer, voorbouw, wielkasten, stijlen, dak en schermen.', ex: [0, 0.3, 0] }, [...bodStructure(), frame]);
  return A('Carrosserie', { d: 'Zelfdragende carrosserie van de 3-deurs hatchback in effen rood (Bright Red 2, aannemelijk) met voor- en achterbumper van ongelakt zwart kunststof (keuze eigenaar naar foto 1993-2001), dakrails, alle aanbouwdelen, ruiten en verlichting.', ex: [0, 2.0, 0],
    spec: [['Lengte', '3.495 mm'], ['Breedte zonder spiegels', '1.495 mm'], ['Hoogte', '1.405 mm'], ['Wielbasis', '2.335 mm'], ['Spoorbreedte voor / achter', '1.335 / 1.305 mm']] }, [
    cage, bodHoodParts(), bodTailgate(), bodFrontBumper(), bodRearBumper(), bodDoor(1), bodDoor(-1), bodWindscreen(), bodHeadlamp(1), bodHeadlamp(-1), bodTaillamp(1), bodTaillamp(-1),
    bodFrontPanel(), bodRearPlate(), bodWipers(), bodFuelFlap(), bodRoofRails(1), bodRoofRails(-1),
  ]);
}
