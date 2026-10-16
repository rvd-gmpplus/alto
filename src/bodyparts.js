/* ===================== carrosserie: onderdelen ===================== */
// Panelen zijn stukken van het parametrische oppervlak uit body.js: onderbak in (z, s), kas in (z, q), eindvlakken in (x, y).
// Rode lak (Bright Red 2, aannemelijk), effen: geen metallic. Bumpers, spiegels en grepen van de GA-uitvoering zijn zwart kunststof.
MAT.paint.color.setHex(0xb8222b); MAT.paint.metalness = 0.04; MAT.paint.roughness = 0.34; MAT.paint.clearcoat = 1; MAT.paint.clearcoatRoughness = 0.08; MAT.paint.envMapIntensity = 0.7;
MAT.paintIn.color.setHex(0x8a2429); MAT.paintIn.metalness = 0.2;
// ruiten: licht getint autoglas (de 2001-uitvoering heeft geen donker privacyglas)
MAT.lensClear.opacity = 0.26; MAT.lensClear.color.setHex(0xb9c6d0);
MAT.glass.color.setHex(0x0d161c); MAT.glass.opacity = 0.8; MAT.glass.envMapIntensity = 0.35; MAT.glass.roughness = 0.06;
std('bodBumper', 0x2b2d31, 0, 0.72);                                       // ongelakt kunststof van de GA-bumpers
std('bodBlack', 0x0f1012, 0, 0.62);                                        // zwart kunststof: spiegels, grepen, wissers
std('bodPillar', 0x060607, 0, 0.8, { envMapIntensity: 0.12 });             // zwart rubber en kader
std('bodPillarGloss', 0x08090b, 0.05, 0.3, { envMapIntensity: 0.35 });     // hoogglans zwarte B-stijl
std('bodChrome', 0xa9b0b7, 1, 0.06, { envMapIntensity: 2.1 });
std('bodHoney', 0x131519, 0.1, 0.6, { envMapIntensity: 0.4 });           // honingraatgrille
std('bodMirror', 0xb4bec6, 1, 0.04, { envMapIntensity: 1.1 });
std('bodSeal', 0x151618, 0, 0.9);
std('bodRefl', 0x7b8087, 0.7, 0.5);                                    // reflectorschaal achter helder glas (donkerder dan spiegelend chroom)
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
const bodYBF = 0.50, bodYBR = 0.575;                // bovenrand van de voor- en achterbumper op de flank
const bodZT0 = -1.62;                              // voorrand achterlicht en bumperhoek achter
const bodZHB = 0.917;                              // achterrand motorkap
const bodHoodX = z => 0.62 - 0.07 * sstep((z - 1.2) / 0.4);   // halve breedte van de motorkap
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
function bodWheelHouse(s, az) {
  const R = ARCH + 0.012, xin = 0.50, xout = 0.68, yb = 0.21, pts = [new THREE.Vector2(az - R, yb), new THREE.Vector2(az - R, AY)];
  for (let k = 1; k < 24; k++) { const a = PI - PI * k / 24; pts.push(new THREE.Vector2(az + R * Math.cos(a), AY + R * Math.sin(a))); }
  pts.push(new THREE.Vector2(az + R, AY), new THREE.Vector2(az + R, yb));
  const wall = new THREE.ShapeGeometry(new THREE.Shape(pts), 1); wall.rotateY(-HALF); wall.translate(s * xin, 0, 0);
  const arc = patch((a, t) => [s * lerp(xin, xout, t), AY + R * Math.sin(a), az + R * Math.cos(a)], 0, PI, 28, () => [0, 1], 3);
  return merge([wall, arc]);
}
/* ---------- carrosserieschil ---------- */
function bodSkinParts() {
  const kids = [];
  // voorscherm: van de portierspleet tot de koplamp, boven de wielboog, met de strook langs de motorkap
  const fenderHi = z => bodSAtX(z, bodHoodX(z) + 0.004);
  const fenderLo = z => bodArchLo(z, AXF, zz => (zz > AXF ? bodYBF + 0.003 : bodYSill + 0.004));
  const fender = s => P(`Voorscherm ${bodSn(s)}`, lowSide(s, bodZDF + 0.004, bodZFe, 44, z => [fenderLo(z), fenderHi(z)], 18, ARCH_BREAKS), MAT.paint,
    { d: 'Voorscherm van plaatstaal met de uitsparing voor het voorwiel, gelakt in het rood. Zit met bouten aan de A-stijl, de veerpoottoren en de voorkopplaat.', ex: [s * 0.46, 0.06, 0.1] });
  // achterscherm: van de portierspleet tot het achterlicht, boven de wielboog, tot de schouderlijn
  const quarterLo = z => bodArchLo(z, AXR, zz => (zz > AXR ? bodYSill + 0.004 : bodYBR + 0.003));
  const quarterGeo = s => {
    if (s > 0) return lowSide(s, bodZT0, bodZDR - 0.004, 46, z => [quarterLo(z), S4], 18, ARCH_BREAKS);
    const [k0, k1] = bodTkZ, [y0, y1] = bodTkY;   // rechts: opening voor de tankklep
    return merge([lowSide(s, bodZT0, k0, 12, z => [quarterLo(z), S4], 12, ARCH_BREAKS), lowSide(s, k1, bodZDR - 0.004, 30, z => [quarterLo(z), S4], 14, ARCH_BREAKS),
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
  kids.push(...bodBoth(fender), ...bodBoth(quarter), ...bodBoth(rails), ...bodBoth(aPillar), ...bodBoth(bPillar), ...bodBoth(cPillar));
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
const bodCowlGeo = () => merge([bodGhDeck(bodZW1, BOD_ZG1, 6, bodQLoW, 18), bodDeck(BOD_ZG1, bodZHB, 4, z => bodSAtX(z, bodHoodX(z) + 0.004), 14)]);
function bodTailSkinGeo(out = 0, zLow = BOD_ZG0) {
  return merge([bodGhDeck(bodZGR - 0.004, bodZH0, 5, () => bodQR, 14, [], out), bodGhDeck(zLow, bodZH1, 6, () => bodQR, 14, [], out),
    ...bodBoth(s => bodGhSide(s, bodZH1, bodZH0, 22, z => [bodQR, bodQLoH(z)], 3, [], out))]);
}
/* ---------- constructie: vloer, voorbouw, wielkasten ---------- */
function bodStructure() {
  const both = bodBoth, sn = bodSn;
  const floor = A('Vloer en dorpels', { d: 'Vloerplaat met dwarsbalken, de langsliggers achter en de dorpels onder de portieren.', ex: [0, -0.32, 0] }, [
    P('Bodemplaat', patch((z, p) => bodLow(z, p, 0.002), -1.62, 0.80, 60, z => { const l = z < AXR - ARCH ? S1 : (z < AXR + ARCH ? S1 * 0.102 / 0.14 * 0.14 : S1 * 0.55); return [-l, l]; }, 10, ARCH_BREAKS.concat([AXR - ARCH - 0.002, AXR - ARCH + 0.002])), MAT.underbody, { d: 'Gelaste vloerplaat van de ruwbouw met bevestigingspunten voor de stoelen en het onderstel.', ex: [0, -0.1, 0] }),
    P('Dwarsbalk voorstoelen', G.box(1.18, 0.05, 0.08), MAT.paintIn, { d: 'Dwarsbalk onder de voorstoelen die vloer en dorpels verbindt.', p: [0, 0.245, 0.15], ex: [0, 0.06, 0.04] }),
    P('Dwarsbalk achterbank', G.box(1.18, 0.05, 0.08), MAT.paintIn, { d: 'Dwarsbalk onder de achterbank, vóór de brandstoftank.', p: [0, 0.245, -0.92], ex: [0, 0.06, -0.04] }),
    ...both(s => P(`Langsligger achter ${sn(s)}`, G.box(0.05, 0.1, 0.62), MAT.paintIn, { d: 'Langsligger onder de bagageruimte die de achterbumperbalk draagt (plaats schematisch).', p: [s * 0.42, 0.34, -1.40], ex: [s * 0.06, -0.06, 0] })),
    ...both(s => bodSill(s)),
  ]);
  const front = A('Voorbouw', { d: 'Dragende voorbouw: langsliggers, veerpoottorens, schutbord, frontmodule en bumperbalk.', ex: [0, 0.05, 0.42] }, [
    ...both(s => P(`Langsligger voor ${sn(s)}`, G.box(0.05, 0.09, 0.80), MAT.paintIn, { d: 'Kokerprofiel in de motorruimte dat botsenergie opvangt (plaats en maten schematisch).', p: [s * 0.42, 0.33, 1.20], ex: [s * 0.08, 0, 0] })),
    ...both(s => P(`Veerpoottoren ${sn(s)}`, merge([G.cyl('y', 0.05, 0.07, 0.2, 24, true), xf(G.cyl('y', 0.05, 0.05, 0.006, 24), [0, 0.1, 0])]), MAT.paintIn, { d: 'Bevestigingspunt van de veerpoot in de carrosserie.', p: [s * 0.50, 0.66, AXF], ex: [s * 0.1, 0.06, 0] })),
    P('Schutbord', G.rbox(1.38, 0.60, 0.012, 0.004), MAT.paintIn, { d: 'Scheidingswand tussen motorruimte en interieur met doorvoeren voor stuurkolom, pedalen en kabelboom.', p: [0, 0.60, 0.86], ex: [0, 0, -0.08] }),
    P('Frontmodule', merge([xf(G.box(1.04, 0.05, 0.05), [0, 0.67, 0]), xf(G.box(1.0, 0.05, 0.05), [0, 0.33, 0]), xf(G.box(0.05, 0.36, 0.05), [0.5, 0.5, 0]), xf(G.box(0.05, 0.36, 0.05), [-0.5, 0.5, 0]), xf(G.box(0.05, 0.3, 0.05), [0, 0.5, 0])]), MAT.plastic, { d: 'Kunststof en stalen voorkopplaat die radiateur, koplampen en motorkapslot draagt.', p: [0, 0, 1.60], ex: [0, 0.04, 0.12] }),
    P('Motorkapslot', merge([G.rbox(0.07, 0.05, 0.04, 0.008), xf(G.rbox(0.02, 0.04, 0.015, 0.004), [0.04, 0.01, 0.015])]), MAT.darkSteel, { d: 'Slot op de voorkopplaat waarin de slotbeugel van de motorkap grijpt; ontgrendeling met een kabel vanuit het interieur.', p: [0, 0.625, 1.55], ex: [0, 0.06, 0.06] }),
    P('Bumperbalk voor', tube([-0.55, -0.35, -0.17, 0, 0.17, 0.35, 0.55].map(x => [x, 0.40, 1.655 - 0.12 * x * x]), 0.032, 24, 8), MAT.steel, { d: 'Gebogen stalen botsbalk achter de voorbumper.', ex: [0, 0, 0.1] }),
    ...both(s => bodWheelHousePart(s, true)),
  ]);
  const rear = A('Achterbouw', { d: 'Achterbouw: wielkasten, bumperbalk en de wand achter de achterbank.', ex: [0, 0.05, -0.4] }, [
    P('Bumperbalk achter', tube([-0.5, -0.3, -0.15, 0, 0.15, 0.3, 0.5].map(x => [x, 0.45, -1.665 + 0.12 * x * x]), 0.03, 24, 8), MAT.steel, { d: 'Stalen botsbalk achter de achterbumper.', ex: [0, 0, -0.1] }),
    ...both(s => bodWheelHousePart(s, false)),
  ]);
  return [floor, front, rear];
}
const bodWheelHousePart = (s, fr) => P(`Wielkast ${fr ? 'voor' : 'achter'} ${bodSn(s)}`, bodWheelHouse(s, fr ? AXF : AXR), MAT.paintIn,
  { d: `Binnenscherm van de ${fr ? 'voor' : 'achter'}wielkast: een halve koker om het wiel met een wand aan de binnenzijde, gelast aan langsligger, vloer en buitenscherm.`, ex: [s * 0.12, 0.04, 0] });
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
function bodHoodParts() {
  const hs = z => bodSAtX(z, bodHoodX(z)), both = bodBoth, sn = bodSn;
  const deckIn = (z0, z1, off, da, nu = 24) => bodDeck(z0, z1, nu, z => Math.min(0.995, hs(z) + da), 8, [], off);
  return A('Motorkap', { d: 'Motorkap van plaatstaal met binnenframe, isolatiemat, scharnieren, slotbeugel en sproeiers. Scharniert aan de achterrand en wordt met een steunstang open gehouden.', ex: [0, 0.52, 0.3],
    open: { type: 'hinge', pivot: bodHoodPv, axis: [1, 0, 0], angle: bodHoodAng, min: 55 * PI / 180, label: 'Motorkap', look: { dir: [0.5, 0.55, 1], nodes: ['Motorkap'] } } }, [
    P('Buitenpaneel motorkap', bodDeck(bodZHB, bodZLh - 0.0003, 44, hs, 14, bodDense(1.4, bodZLh, 6)), MAT.paint, { d: 'Buitenhuid van de motorkap in het rood, licht bol over de breedte.', ex: [0, 0.14, 0] }),
    P('Binnenframe motorkap', deckIn(bodZHB + 0.02, bodZLh - 0.02, 0.03, 0.012), MAT.paintIn, { d: 'Verstevigend binnenframe met de bevestigingspunten van de scharnieren en de slotbeugel.', ex: [0, 0.03, 0] }),
    P('Motorkapisolatie', deckIn(bodZHB + 0.09, bodZLh - 0.12, 0.04, 0.05, 16), MAT.carpet, { d: 'Geluids- en hitte-isolatiemat aan de onderzijde.', ex: [0, -0.1, 0] }),
    ...both(s => A(`Kapscharnier ${sn(s)}`, { d: 'Scharnier achteraan de motorkap: een arm aan het binnenframe en een voet op de carrosserie. De draaias is in dit model de achterrand van de kap (schematisch).', ex: [s * 0.08, -0.04, -0.06] }, [
      P('Scharnierarm', G.rbox(0.02, 0.045, 0.12, 0.006), MAT.darkSteel, { d: 'Gebogen scharnierarm aan het binnenframe; draait met de kap mee.', p: [s * 0.50, 0.885, 0.97], ex: [0, -0.03, 0] }),
      ...[0, 1].map(i => P(`Kapscharnierbout ${i + 1}`, hexBolt(0.02, 0.008, 'y'), MAT.steel, { d: 'Bout M8 tussen scharnier en binnenframe.', p: [s * 0.50, 0.906, 0.94 + i * 0.05], r: [PI, 0, 0], ex: [0, 0.05, 0] })),
      P('Scharnierbasis', merge([G.rbox(0.05, 0.012, 0.11, 0.004), xf(G.rbox(0.012, 0.034, 0.09, 0.003), [s * 0.019, -0.022, 0])]), MAT.darkSteel, { d: 'Scharnierbasis op het schutbord: het deel aan de carrosseriezijde; blijft staan als de kap opent.', p: [s * 0.50, 0.85, 0.96], stay: true, ex: [0, -0.05, 0] }),
    ])),
    P('Slotbeugel motorkap', tube([[-0.02, 0.0, 0], [-0.02, -0.04, 0], [0.02, -0.04, 0], [0.02, 0, 0]].map(([x, y]) => [x, bodSec(1.55).yd - 0.05 + y, 1.55]), 0.004, 12, 6), MAT.steel, { d: 'Beugel aan het binnenframe die in het motorkapslot op de voorkopplaat grijpt.', ex: [0, -0.08, 0.04] }),
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
// Koplamp: wrap-around eenheid op de hoek van de neus; flank (z 1,54 tot 1,60) en het stuk op het voorvlak (z > 1,60)
const bodHLlo = z => sAtY(z, bodYBF + 0.004), bodHLhi1 = z => bodSAtX(z, bodHoodX(z) + 0.004), bodHLhi2 = z => bodSAtX(z, 0.285);
const bodHLreg = (s, off, f0 = 0, f1 = 1, inset = 0) => merge([
  lowSide(s, bodZFe + 0.002, bodZLh, 8, z => [lerp(bodHLlo(z), bodHLhi1(z), f0), lerp(bodHLlo(z), bodHLhi1(z), f1) - inset], 6, [], off),
  lowSide(s, bodZLh, ZF - 0.0005, 16, z => [lerp(bodHLlo(z), bodHLhi2(z), f0) + inset * 0, lerp(bodHLlo(z), bodHLhi2(z), f1) - inset], 8, [], off)]);
function bodHeadlamp(s) {
  const n = bodSn(s), at = (z, f, inw) => { const sv = lerp(bodHLlo(z), bodHLhi2(z), f), [x, y] = halfPt(z, sv), nn = bodN(z, sv); return [s * (x - nn[0] * inw), y - nn[1] * inw, z - nn[2] * inw]; };
  const bulb = at(1.66, 0.45, 0.06);
  return A(`Koplamp ${n}`, { d: 'Rechthoekige koplamp met helder glas, om de hoek van de neus gewikkeld naar het scherm, met halogeenlamp en reflector.', ex: [s * 0.32, 0.1, 0.55] }, [
    P('Afdekglas', bodHLreg(s, 0.0), MAT.lensClear, { d: 'Heldere afdekking van polycarbonaat die het voorvlak en de hoek van het scherm volgt.', ex: [s * 0.1, 0.04, 0.2] }),
    P('Reflector', bodHLreg(s, 0.03, 0.08, 0.92, 0.01), MAT.bodRefl, { d: 'Verchroomde reflectorschaal achter het glas.', ex: [0, 0, 0.06] }),
    P('Lamphuis', bodHLreg(s, 0.07), MAT.plastic, { d: 'Kunststof lamphuis waarin de lamp en reflector zijn gemonteerd.', ex: [0, 0, -0.03] }),
    P('Lampfitting', G.cyl('z', 0.022, 0.022, 0.05, 14), MAT.plastic, { d: 'Fitting met stekker voor de halogeenlamp (H4, plaats schematisch).', p: [bulb[0], bulb[1], bulb[2] - 0.03], ex: [0, 0.03, -0.1] }),
    P('Halogeenlamp', G.cyl('z', 0.011, 0.011, 0.06, 12), MAT.ceramic, { d: 'Halogeenlamp voor dim- en grootlicht (type niet voor deze auto geverifieerd).', p: [bulb[0], bulb[1], bulb[2] + 0.0], ex: [0, 0.04, 0.05] }),
    P('Stofkap lamp', G.lathe('z', [[0, 0.02], [0.035, 0.02], [0.04, 0], [0.035, -0.004]], 16, 'bodHLcap'), MAT.rubber, { d: 'Rubberen kap op de achterzijde van de lamp.', p: [bulb[0], bulb[1], bulb[2] - 0.06], r: [PI, 0, 0], ex: [0, 0.02, -0.14] }),
  ]);
}
function bodHoneyTex() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d');
  g.fillStyle = '#0b0c0e'; g.fillRect(0, 0, 256, 256); g.strokeStyle = '#8a9099'; g.lineWidth = 4; const r = 22, h = r * Math.sqrt(3);
  for (let row = -1; row < 12; row++) for (let col = -1; col < 8; col++) {
    const cx = col * r * 3 + (row % 2 ? r * 1.5 : 0), cy = row * h / 2;
    g.beginPath(); for (let k = 0; k < 6; k++) { const a = PI / 3 * k; g.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a)); } g.closePath(); g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t;
}
const bodSTri = (g, k) => { const p = g.attributes.position, uv = new Float32Array(p.count * 2); for (let i = 0; i < p.count; i++) { uv[2 * i] = p.getX(i) * k; uv[2 * i + 1] = (p.getY(i) + p.getZ(i) * 0.5) * k; } g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); return g; };
function bodFrontPanel() {
  const zA = bodZAtYd(0.70), zB = bodZAtYd(0.545), xs = 0.285, xg = 0.25, sA = z => bodSAtX(z, xs), sG = z => bodSAtX(z, xg);
  const strip = (z0, z1, nu) => bodDeck(z0, z1, nu, sA, 8);
  const side = sd => patch((z, p) => bodLow(z, p), zA, zB, 8, z => (sd > 0 ? [sA(z), sG(z)] : [2 - sG(z), 2 - sA(z)]), 1);
  const honey = bodSTri(bodDeck(zA, zB, 10, sG, 12, [], 0.012), 3.2);
  MAT.bodHoney.map = bodHoneyTex(); MAT.bodHoney.color.setHex(0xffffff); MAT.bodHoney.needsUpdate = true;
  const S = [[0.014, 0.016], [0.004, 0.022], [-0.010, 0.018], [-0.012, 0.008], [-0.002, 0.0], [0.010, -0.008], [0.012, -0.018], [0.0, -0.024], [-0.014, -0.018]];
  const emb = merge([xf(G.cyl('z', 0.03, 0.03, 0.003, 24), [0, 0, 0], [0, 0, 0], [1.4, 1, 1]), tube(S.map(([u, v]) => [u * 1.1, v * 1.1, 0.004]), 0.0032, 40, 5)]);
  const yE = 0.625, zE = bodZAtYd(yE) - 0.012;
  return A('Grille en voorpaneel', { d: 'Voorpaneel tussen de koplampen met de honingraatgrille en het embleem (uitvoering 2000 tot 2002).', ex: [0, 0.04, 0.4] }, [
    P('Voorpaneel', merge([strip(bodZLh, zA, 8), strip(zB, ZF - 0.0005, 4), side(1), side(-1)]), MAT.paint, { d: 'Neuspaneel in carrosseriekleur boven en onder de grille, tussen de koplampen.', ex: [0, 0.04, 0.06] }),
    P('Honingraatgrille', honey, MAT.bodHoney, { d: 'Zwarte kunststof grille met honingraatstructuur voor de luchtinlaat van de radiateur.', ex: [0, 0, 0.14] }),
    P('Embleem', emb, MAT.bodChrome, { d: 'Verchroomd embleem op de grille (een gestileerde letter S op een ovaal; schematisch, zonder merkletters).', p: [0, yE + 0.0, zE + 0.0], r: [-0.532, 0, 0], ex: [0, 0.03, 0.12] }),
  ]);
}
const bodBumperGeo = (yTop, z0, zEnd, dir) => merge([
  patch((z, p) => bodLow(z, p), dir > 0 ? z0 : zEnd + 0.0005, dir > 0 ? zEnd - 0.0005 : z0, 36, z => { const sb = sAtY(z, yTop); return [-sb, sb]; }, 34),
  bodFace(zEnd, dir, -9, 9, YB(zEnd) + 0.001, dir > 0 ? bodSec(zEnd).yd - 0.001 : yTop, 0, 8, 30)]);
function bodFrontBumper() {
  const both = bodBoth, sn = bodSn;
  const sig = s => A(`Knipperlicht voor ${sn(s)}`, { d: 'Oranje richtingaanwijzer laag in de hoek van de bumper, om de hoek gewikkeld.', ex: [s * 0.22, -0.02, 0.2] }, [
    P('Lens knipperlicht voor', merge([lowSide(s, 1.665, ZF - 0.0005, 8, z => [sAtY(z, 0.385), sAtY(z, 0.465)], 3, [], -0.002), bodHalfFace(ZF, 1, s, 0.36, 0.385, 0.465, -0.002, 3, 5)]), MAT.amber, { d: 'Oranje lens van de richtingaanwijzer.', ex: [s * 0.05, 0, 0.08] }),
    P('Lamphuis knipperlicht voor', merge([lowSide(s, 1.665, ZF - 0.0005, 8, z => [sAtY(z, 0.385), sAtY(z, 0.465)], 3, [], 0.03), bodHalfFace(ZF, 1, s, 0.36, 0.385, 0.465, 0.03, 3, 5)]), MAT.plastic, { d: 'Kunststof huis met fitting achter de lens.', ex: [0, 0, -0.03] }),
    P('Lamp knipperlicht voor', G.cyl('z', 0.009, 0.009, 0.035, 10), MAT.ceramic, { d: 'Steeklamp van de richtingaanwijzer.', p: [s * 0.42, 0.425, ZF - 0.05], ex: [0, 0, -0.06] }),
  ]);
  return A('Voorbumper', { d: 'Bumperschaal in carrosseriekleur (Twist) met de hoeken om de wielbogen, richtingaanwijzers laag in de hoeken en een kentekenvlak; erachter de stalen bumperbalk.', ex: [0, -0.04, 0.72] }, [
    P('Bumperschaal voor', bodBumperGeo(bodYBF, 1.395, ZF, 1), MAT.paint, { d: 'Kunststof bumperschaal in het rood met afgeronde hoeken die om de voorwielboog lopen.', ex: [0, -0.02, 0.12] }),
    P('Luchtrooster voor', bodFace(ZF, 1, -0.30, 0.30, 0.325, 0.36, -0.002, 2, 14), MAT.bodBumper, { d: 'Zwart rooster in de onderrand van de bumper voor extra koellucht.', ex: [0, -0.04, 0.1] }),
    P('Kentekenplaathouder voor', G.rbox(0.54, 0.125, 0.006, 0.004), MAT.bodBumper, { d: 'Zwarte houder voor de voorste kentekenplaat in het midden van de bumper.', p: [0, 0.405, ZF + 0.0], ex: [0, 0, 0.1] }),
    P('Kentekenplaat voor', G.rbox(0.52, 0.11, 0.003, 0.002), MAT.plateYellow, { d: 'Blanco gele plaat op de plaats van het kenteken (geen kenteken in dit model).', p: [0, 0.405, ZF + 0.0035], ex: [0, 0, 0.16] }),
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
  const trimP = bodSideX(s, z0 + 0.016, z1 - 0.016, 22, z => [sAtY(z, 0.33), S4 - 0.004], 10, eIn + 0.02);
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
    P('Deurvanger', G.rbox(0.012, 0.03, 0.2, 0.004), MAT.darkSteel, { d: 'Vanger die het portier in twee standen openhoudt.', p: [s * (surfX(z1 - 0.1, 0.62) - 0.022), 0.62, z1 - 0.1], ex: [-s * 0.05, 0, 0.06] }),
    A('Scharnieren', { d: 'Twee portierscharnieren aan de voorrand met elk twee bouten.', ex: [-s * 0.04, 0, 0.1] }, [hinge('boven', 0.56), hinge('onder', 0.34)]),
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
    P('Bumperschaal achter', bodBumperGeo(bodYBR, -1.556, ZR, -1), MAT.paint, { d: 'Kunststof bumperschaal in het rood met afgeronde hoeken die om de achterwielboog lopen.', ex: [0, -0.02, -0.12] }),
    ...both(s => P(`Reflector achter ${bodSn(s)}`, bodHalfFace(ZR, -1, s, 0.30, 0.43, 0.48, -0.002, 2, 5), MAT.lensRed, { d: 'Rode reflector laag in de bumperhoek.', ex: [s * 0.05, 0, -0.08] })),
    P('Onderrand achterbumper', bodFace(ZR, -1, -0.30, 0.30, 0.345, 0.38, -0.002, 2, 14), MAT.bodBumper, { d: 'Zwarte kunststof afwerkstrook onder in de bumper.', ex: [0, -0.04, -0.1] }),
  ]);
}
function bodRearPlate() {
  return A('Kentekenvlak achter', { d: 'Kentekenplaathouder en verlichting op het achterpaneel, tussen de achterlichten.', ex: [0, 0, -0.3] }, [
    P('Kentekenplaathouder achter', G.rbox(0.54, 0.125, 0.006, 0.004), MAT.bodBumper, { d: 'Zwarte houder voor de achterste kentekenplaat.', p: [0, 0.69, ZR - 0.0], ex: [0, 0, -0.1] }),
    P('Kentekenplaat achter', G.rbox(0.52, 0.11, 0.003, 0.002), MAT.plateYellow, { d: 'Blanco gele plaat op de plaats van het kenteken (geen kenteken in dit model).', p: [0, 0.69, ZR - 0.0035], ex: [0, 0, -0.16] }),
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
    ...both(s => P(`Klepscharnier ${sn(s)}`, G.rbox(0.03, 0.03, 0.08, 0.006), MAT.darkSteel, { d: 'Scharnier tussen dak en achterklep, het deel aan de carrosseriezijde; blijft staan als de klep opent.', p: [s * 0.42, bodGh(-1.15).yre - 0.03, -1.15], stay: true, ex: [0, 0.04, 0.04] })),
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
    P('Wissermotor', merge([G.cyl('z', 0.04, 0.04, 0.09, 16), xf(G.rbox(0.08, 0.06, 0.05, 0.01), [0, 0, 0.06])]), MAT.darkSteel, { d: 'Elektromotor van de ruitenwissers onder de waterkast.', p: [0.3, 0.84, 0.86], ex: [0, -0.1, 0.06] }),
    P('Wisserstangenmechaniek', merge([rodBetween([-0.47, 0.86, 0.88], [0.3, 0.84, 0.87], 0.007, 8), rodBetween([0.3, 0.84, 0.87], [-0.03, 0.86, 0.88], 0.007, 8)]), MAT.steel, { d: 'Stangenstelsel dat beide wisserassen aandrijft.', ex: [0, -0.06, 0.12] }),
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
function buildBody() {
  const sk = bodSkinParts(), both = bodBoth, sn = bodSn;
  const frame = A('Zijwanden en dak', { d: 'Schermen, stijlen, dakrand en dakplaat met de vaste ruiten van de 3-deurs.', ex: [0, 0.32, 0] }, [
    P('Dakpaneel', bodRoofGeo(), MAT.paint, { d: 'Dakplaat van staal in het rood, gelast op de dakranden en de dakbogen; zonder glazen dak.', ex: [0, 0.16, 0] }),
    A('Dakbogen', { d: 'Drie dwarsliggers onder het dakpaneel.', ex: [0, 0.1, 0] }, [[0.30, 'voor'], [-0.45, 'midden'], [-1.05, 'achter']].map(([z, nm]) => P(`Dakboog ${nm}`, (() => { const pts = []; for (let i = 0; i <= 12; i++) { const w = bodQR / 2 + (1 - bodQR) * i / 12, p = ghPt(z, w); pts.push([p[0] * 0.97, p[1] - 0.012, z]); } return tube(pts, 0.0045, 24, 6); })(), MAT.paintIn, { d: 'Dwarsligger onder het dakpaneel.', ex: [0, -0.04, z * 0.05] }))),
    P('Waterkast', bodCowlGeo(), MAT.bodBlack, { d: 'Zwarte kunststof afdekplaat met luchtinlaat voor het interieur, tussen motorkap en voorruit; hierin staan de wisserassen.', ex: [0, 0.1, 0.02] }),
    ...sk.kids, ...both(sk.qGlass),
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
