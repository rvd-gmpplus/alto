/* ===================== carrosserie: hoofdmaten en parametrisch oppervlak ===================== */
// assen: x = links(+)/rechts(-), y = omhoog, z = voor(+)/achter(-); maten in meter
// Alle steunpunten komen uit data/silhouet.json (zijaanzicht en bovenaanzicht van de 3-deurs hatchback, geschat uit foto's;
// fout ca. 3 cm tussen de assen, 5 cm in de overhang). De onderbak is een loft in (z, s), de kas een loft in (z, q).
// Uitzondering: de neus van YT, bodC en HW vanaf z 1,40 volgt de foto van de modelreeks 1993-2001 (beslissing 29, golf 6; keuze van de eigenaar): een vrijwel
// verticaal front (helling ca. 10 graden: op x = 0 van y 0,697 op z 1,663 naar 0,555 op z 1,688) met de kapvoorrand op z 1,66 en y 0,704, een vrijwel rechte
// kapvoorrand (bodC 0,006 op de neus: 6 mm daling van x 0 naar x 0,6) en vollere hoeken (halve breedte 0,646 op y 0,62 en z 1,65; HW tot z 1,70 boven 0,645 en een schouderstraal van 15 mm
// op de neus, zodat het vlakke front tot x 0,60 reikt). De lijn van de flank
// (YT) loopt vloeiend van 0,81 op z 1,35 naar 0,69 op de neus. De stations van data/silhouet.json blijven binnen hun tolerantie (top z 1,6: 0,744 tegen 0,746).
// Daarvoor (beslissing 17, golf 4) helde het front 34 graden en zakte de kaprand 45 mm naar buiten.
const ZF = 1.7475, ZR = -1.7475;                    // lengte 3495 mm (uiterste punten van de bumpers)
const BOD_WMAX = 0.7535, BOD_MIRW = 0.904, BOD_H = 1.405; // framework: halve breedte zonder en met spiegels (plus 6 mm), hoogte; integrity.py leest ze
const AXF = 1.087, AXR = -1.248, AY = 0.265;        // wielbasis 2335 mm; bandstraal 145/70 R13 is 0,2666 m, min indrukking
const ARCH = 0.30;                                   // wielbooguitsparing (straal om de wielas)
const TRACK_F = 0.6675, TRACK_R = 0.6525;           // halve spoorbreedte voor en achter (1335 en 1305 mm)
// Staart (golf 6, besluit orkestrator): de bumper is het achterste punt op ZR (3495 mm), het staartvlak (klep, achterpaneel, achterlichten, zijwand erachter) eindigt BOD_TD = 40 mm
// eerder, op BOD_ZE. Alle profielen (HW, YB, YT, bodC, bodDP, YR) worden daarvoor achter z -1,55 naar voren geschoven: de verschuiving loopt met een gladde stap op van 0 bij
// z -1,55 (daar eindigt de achterboog en past de bekleding van het interieur op de huid) tot 40 mm vanaf z -1,70 (bodTwz); het profiel op BOD_ZE is dus het oude profiel op ZR.
// bodTwi(z) geeft de nieuwe plaats van een punt dat op de oude huid op z lag: delen met een vaste z achter -1,55 (achterlicht, ruit, kas) gebruiken die.
const BOD_TD = 0.040, BOD_ZE = ZR + BOD_TD;
const bodTwz = z => { const u = clamp((-1.55 - z) / 0.15, 0, 1); return z - BOD_TD * u * u * (3 - 2 * u); };
const bodTw = f => z => f(bodTwz(z));
const bodTwi = z => { let lo = z, hi = z + BOD_TD + 0.01; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (bodTwz(m) < z) lo = m; else hi = m; } return (lo + hi) / 2; };
const BOD_ZG0 = bodTwi(-1.70), BOD_ZG1 = 0.905;       // kas: van de onderrand van de achterruit tot de waterkast (was -1,70; schuift mee met de staart)
function pchip(pts) {
  const n = pts.length, xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), h = [], dl = [], m = new Array(n);
  for (let i = 0; i < n - 1; i++) { h[i] = xs[i + 1] - xs[i]; dl[i] = (ys[i + 1] - ys[i]) / h[i]; }
  m[0] = dl[0]; m[n - 1] = dl[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (dl[i - 1] * dl[i] <= 0) m[i] = 0;
    else { const w1 = 2 * h[i] + h[i - 1], w2 = h[i] + 2 * h[i - 1]; m[i] = (w1 + w2) / (w1 / dl[i - 1] + w2 / dl[i]); }
  }
  return x => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0; while (i < n - 2 && x > xs[i + 1]) i++;
    const t = (x - xs[i]) / h[i], t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h[i] * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h[i] * m[i + 1];
  };
}
// grootste halve breedte (bovenaanzicht, zonder spiegels): vlak middenstuk, ronde hoeken in de bumpers
const HW = bodTw(pchip([[-1.7475, 0.50], [-1.735, 0.555], [-1.70, 0.615], [-1.65, 0.66], [-1.55, 0.70], [-1.45, 0.72], [-1.30, 0.74], [-1.20, 0.7475],
  [0.90, 0.7475], [1.20, 0.735], [1.45, 0.703], [1.60, 0.672], [1.63, 0.663], [1.65, 0.651], [1.67, 0.632], [1.69, 0.612], [1.72, 0.584], [1.735, 0.563], [1.7475, 0.53]]));
// onderkant carrosserie (bumperranden, dorpel; in de wielbogen snijdt de boog)
const YB = bodTw(pchip([[-1.7475, 0.34], [-1.73, 0.30], [-1.70, 0.285], [-1.60, 0.275], [-1.45, 0.27], [-1.2, 0.25], [-0.9, 0.225], [0.0, 0.215], [0.7, 0.222], [0.9, 0.232],
  [1.2, 0.25], [1.42, 0.265], [1.55, 0.265], [1.68, 0.27], [1.73, 0.285], [1.7475, 0.31]]));
// schouderlijn van de onderbak = gordellijn (onderkant zijruiten) in de kas; voor en achter de rand van motorkap en staartplaat
// Gordel tussen z 0,6 en -1,0 (golf 7, pakket FLANK, beslissing FLANK-1): tot 25 mm lager naar de foto's van de modelreeks (onderrand zijruit op de foto 0,89 tot 0,92 tegen
// 0,91 tot 0,95 in het model); was 0,6 0,897; 0,4 0,894; 0,2 0,901; 0,0 0,913; -0,2 0,925; -0,4 0,936; -0,8 0,955; -1,0 0,960.
// Voorrand portier (golf 8, pakket KAS, beslissing KAS-3): z 0,6 0,884 (was 0,892) en nieuw z 0,78 0,886 (was 0,901 tussen de punten): de onderrand van de zijruit ligt
// daar op 0,899 (was 0,914; foto's 0,89 tot 0,90). Vanaf z 0,85 (waterkast, voet van de voorruit, achterrand motorkap) ongewijzigd; de stijging van 17 mm valt onder de voet van de A-stijl.
const YT = bodTw(pchip([[-1.7475, 0.85], [-1.70, 0.875], [-1.62, 0.893], [-1.50, 0.915], [-1.35, 0.940], [-1.20, 0.955], [-1.0, 0.955], [-0.8, 0.942], [-0.6, 0.924], [-0.4, 0.910],
  [-0.2, 0.899], [0.0, 0.890], [0.2, 0.884], [0.4, 0.884], [0.6, 0.884], [0.78, 0.886], [0.85, 0.903], [0.975, 0.895], [1.10, 0.875], [1.225, 0.845], [1.35, 0.8101], [1.40, 0.7930], [1.45, 0.7680], [1.50, 0.7460], [1.55, 0.7300], [1.60, 0.7200], [1.63, 0.7130], [1.65, 0.7050], [1.66, 0.6980], [1.664, 0.6880], [1.67, 0.6560], [1.68, 0.5950], [1.688, 0.5480], [1.70, 0.5320], [1.71, 0.5240], [1.725, 0.5150], [1.7475, 0.5000]]));   // neus, beslissing 29: vlak tot z 1,66, dan het steile front tot de bumper op z 1,70 (beslissing 17 had 1,50 0,722; 1,60 0,654; 1,65 0,616; 1,70 0,530; 1,7475 0,472). HW: vollere neus (was 1,60 0,662; 1,68 0,62; 1,73 0,555; 1,7475 0,50)
// bolling van het dek boven de schouderlijn (motorkap, staartplaat); in de kas is het dek onder de ruiten verborgen
// bolling: tussen z 1,44 en 1,55 iets groter (tot 0,040), naar de neus toe 0,006: de kapvoorrand loopt vrijwel recht (beslissing 29; in beslissing 17 tot 0,070 voor een
// flank die naar de lamp zakte); de rest ongewijzigd
const bodC = bodTw(pchip([[-1.7475, 0.015], [-1.62, 0.012], [0.3, 0.012], [0.9, 0.026], [1.30, 0.02464], [1.38, 0.0241], [1.44, 0.035], [1.50, 0.040], [1.55, 0.036], [1.60, 0.024], [1.63, 0.014], [1.65, 0.008], [1.66, 0.006], [1.7475, 0.006]]));
const bodDP = bodTw(pchip([[-1.7475, 3], [-1.0, 3.5], [0.9, 3.5], [1.3, 4], [1.7475, 3]]));   // exponent van het dekprofiel (vlak midden, afgeronde randen)
// daklijn op de hartlijn: voorruit, dak, achterruit (bij de voorruit en achterruit op de bovengrens van de silhouettolerantie)
const YR = bodTw(pchip([[-1.7475, 0.862], [-1.70, 0.900], [-1.60, 1.010], [-1.45, 1.170], [-1.30, 1.290], [-1.15, 1.382], [-1.0, 1.400], [-0.65, 1.405], [-0.4, 1.405],
  [-0.15, 1.398], [0.1, 1.380], [0.35, 1.285], [0.6, 1.105], [0.75, 1.02], [0.9, 0.930]]));
const S1 = 0.14, S2 = 0.22, S3 = 0.60, S4 = 0.72, BUL = 0.012, CRW = 0.03;
const sstep = t => { const u = clamp(t, 0, 1); return u * u * (3 - 2 * u); };
// doorsnede van de onderbak op z
// Flank (golf 7, pakket FLANK, beslissing FLANK-2): tot golf 6 een verticale flank met 12 mm bolling en een schouder van 55 mm straal, die op de gordel een vlakke
// richel van ruim 50 mm onder de kas legde (op de achterzijde las die als heup). Nu loopt de flank vanaf het breedste punt (op bodFlU van de flankhoogte, y ca. 0,54)
// in een boog naar binnen: onderaan bodFlB, bovenaan dT, gekozen zodat de schouder (straal bodFlRs) op dezelfde xe eindigt als het oude profiel. De kas (ruiten,
// stijlen, dak, portieren boven de gordel, kiepruit) blijft dus op de millimeter gelijk. Naar de neus (beslissing 29) loopt het profiel tussen z 1,0 en 1,4 terug
// naar het oude (bodFlankW), zodat kap, koplamp, grille en bumper niet veranderen.
const bodFlU = 0.45, bodFlB = 0.012;
// schouderstraal: 16 mm langs portier en voorscherm; op het achterscherm (achter z -0,8, vol vanaf -1,05) 3 mm, zodat de flank vrijwel zonder knik in de C-stijl
// overgaat zoals op de foto's (beslissing FLANK-3: de heup; met 16 mm bleef daar een ronde rand tussen C-stijl en achterscherm staan)
const bodFlRs = z => lerp(0.016, 0.003, sstep((-0.80 - z) / 0.25));
const bodFlankW = z => 1 - sstep((z - 1.0) / 0.4);
// Kas breder op de gordel (golf 8, pakket KAS, beslissing KAS-2): de kas begint BOD_KASD verder naar buiten dan het profiel van FLANK-2 (xe), langs portier en hoekruit
// volledig (z -1,15 tot 0,70), naar de waterkast (z 1,0) en naar de achterkant (z -1,50) glad terug naar 0: voorruitvoet, kap, neus, achterruit en klep blijven. De flank
// loopt daardoor minder in (dT kleiner; schouderstraal en breedste punt blijven). In KAS-2 bleef de bovenkant van de kas gelijk en helde de zijruit 0,37; sinds golf 9
// (pakket DAK, beslissing DAK-2) gaat de bovenkant mee: de zijwand helt weer bodTUMB (0,28) vanaf de bredere gordel, dus bovenrand van de zijwand, dakrand en dak liggen
// bodKasD(z) verder naar buiten (de foto's: 0,24 tot 0,27, op dakrandhoogte 35 tot 47 mm breder).
const BOD_KASD = 0.035;
const bodKasD = z => BOD_KASD * sstep((z + 1.50) / 0.35) * sstep((1.0 - z) / 0.30);
// inloop van de flank ten opzichte van de breedste lijn bij flankparameter t (0 onderaan, 1 bovenaan)
const bodFlD = (t, dB, dT) => (t < bodFlU ? dB * Math.pow((bodFlU - t) / bodFlU, 2) : dT * Math.pow((t - bodFlU) / (1 - bodFlU), 2));
function bodSecW(z, w) {
  const hw = HW(z), yb = YB(z), yt = YT(z), d = yt - yb, bul = Math.min(BUL, hw * 0.15);
  const rb = Math.min(0.045, d * 0.28, (hw - bul) * 0.45), rs0 = Math.min(0.055 - 0.040 * sstep((z - 1.58) / 0.06), d * 0.3, (hw - bul) * 0.45);   // schouder op de neus 15 mm (beslissing 29)
  const yd = Math.max(yt + 0.004, yt + bodC(z)), c = yd - yt, p = bodDP(z);
  const cx0 = hw - bul - rs0;                     // middelpunt van de oude schouderboog
  let xe = cx0 + rs0 * 0.3, th = 1.2;
  for (let i = 0; i < 3; i++) { th = Math.atan2(xe, c * p); xe = cx0 + rs0 * Math.cos(th); }
  if (w <= 1e-6) { const cy = yt - rs0 * Math.sin(th); return { hw, yb, yt, rb, rs: rs0, yd, c, p, cx: cx0, cy, th, xe, bul, bw: bul, dB: 0, dT: 0, a0: 0, ab: 0, cxb: hw - bul - rb, cyb: yb + rb, y0: yb + rb, y1: cy }; }
  // nieuw profiel: xe bodKasD verder naar buiten (KAS-2; FLANK-2 hield xe en th gelijk), th opnieuw zodat de schouder met de raaklijn van het dek aansluit,
  // kleinere schouder, de flank loopt in
  xe += bodKasD(z) * w; th = Math.atan2(xe, c * p);
  const rs = lerp(rs0, Math.min(bodFlRs(z), rs0), w), bw = bul * (1 - w), dB = bodFlB * w, cx = xe - rs * Math.cos(th), cy = yt - rs * Math.sin(th), cyb = yb + rb;
  let a0 = 0, ab = 0, dT = 0, y0 = cyb, y1 = cy;
  for (let i = 0; i < 6; i++) {
    dT = hw - bw - cx - rs * Math.cos(a0);
    y1 = cy + rs * Math.sin(a0); y0 = cyb + rb * Math.sin(ab);
    const hf = Math.max(0.05, y1 - y0);
    a0 = Math.atan(2 * dT / ((1 - bodFlU) * hf)); ab = -Math.atan(2 * dB / (bodFlU * hf));   // raaklijn van flank en schouder, flank en bodemhoek gelijk
  }
  return { hw, yb, yt, rb, rs, yd, c, p, cx, cy, th, xe, bul, bw, dB, dT, a0, ab, cxb: hw - bw - dB - rb * Math.cos(ab), cyb, y0, y1 };
}
const bodSecMem = new Map();
function bodSec(z) {
  let c = bodSecMem.get(z); if (c) return c;
  if (bodSecMem.size > 60000) bodSecMem.clear();
  c = bodSecW(z, bodFlankW(z)); bodSecMem.set(z, c); return c;
}
// halve doorsnede (linkerhelft), s van 0 (onderkant midden) tot 1 (dek midden)
function bodHalf(z, s, c) {
  const { rb, rs, cx, cy, th, xe, c: cr, p, hw, yt, bw, dB, dT, a0, ab, cxb, cyb, y0, y1 } = c;
  if (s <= S1) return [s / S1 * cxb, c.yb];
  if (s <= S2) { const a = -HALF + (s - S1) / (S2 - S1) * (ab + HALF); return [cxb + rb * Math.cos(a), cyb + rb * Math.sin(a)]; }
  if (s <= S3) { const t = (s - S2) / (S3 - S2); return [hw - bw + bw * Math.sin(PI * t) - bodFlD(t, dB, dT), y0 + t * (y1 - y0)]; }
  if (s <= S4) { const a = a0 + (s - S3) / (S4 - S3) * (th - a0); return [cx + rs * Math.cos(a), cy + rs * Math.sin(a)]; }
  const t = (s - S4) / (1 - S4);
  return [xe * (1 - t), yt + cr * (1 - Math.pow(1 - t, p))];
}
function halfPt(z, s) { return bodHalf(z, s, bodSec(z)); }
function lowPt(z, p) {
  const q = ((p % 2) + 2) % 2;
  if (q <= 1) { const [x, y] = halfPt(z, q); return [x, y, z]; }
  const [x, y] = halfPt(z, 2 - q); return [-x, y, z];
}
// parameter s van de doorsnede c bij hoogte y (flank, schouder en dek)
function bodSAtYc(c, y) {
  if (y <= c.y0) { const a = Math.asin(clamp((y - c.cyb) / c.rb, -1, Math.sin(c.ab))); return S1 + (a + HALF) / (c.ab + HALF) * (S2 - S1); }
  if (y <= c.y1) return S2 + (y - c.y0) / Math.max(1e-6, c.y1 - c.y0) * (S3 - S2);
  if (y <= c.yt) { const a = Math.asin(clamp((y - c.cy) / c.rs, Math.sin(c.a0), 1)); return S3 + Math.min(1, (a - c.a0) / Math.max(1e-6, c.th - c.a0)) * (S4 - S3); }
  const u = clamp((y - c.yt) / Math.max(1e-6, c.c), 0, 1), t = 1 - Math.pow(1 - u, 1 / c.p);
  return S4 + t * (1 - S4);
}
function sAtY(z, y) { return bodSAtYc(bodSec(z), y); }
// halve breedte van het oude profiel (tot golf 6) op hoogte y: voor delen binnen de huid die op hun plaats blijven (portierbinnenkant, bekleding)
function ringX0(z, y) { const c = bodSecW(z, 0); if (y > c.yd) return 0; return Math.max(0, bodHalf(z, bodSAtYc(c, y), c)[0]); }
// parameter s op het dek bij |x|
function bodSAtX(z, x) { const c = bodSec(z); return S4 + (1 - S4) * clamp(1 - Math.abs(x) / c.xe, 0, 1); }
// halve breedte van de onderbak op hoogte y (0 boven het dek)
function ringX(z, y) { const c = bodSec(z); if (y > c.yd) return 0; return Math.max(0, bodHalf(z, sAtY(z, y), c)[0]); }
function archS(z) {
  for (const az of [AXF, AXR]) { const dz = z - az; if (Math.abs(dz) <= ARCH) return sAtY(z, AY + Math.sqrt(ARCH * ARCH - dz * dz)); }
  return 0;
}
const inArch = z => Math.abs(z - AXF) < ARCH + 0.01 || Math.abs(z - AXR) < ARCH + 0.01;
const ARCH_BREAKS = [AXF - ARCH - 0.001, AXF - ARCH, AXF + ARCH, AXF + ARCH + 0.001, AXR - ARCH - 0.001, AXR - ARCH, AXR + ARCH, AXR + ARCH + 0.001];
/* ---------- kas (ruiten, stijlen, dak) ---------- */
// ghPt(z, w): w = 0 gordel links, 0,27 bovenrand zijruit, 0,36 dakrand, 0,5 hartlijn dak, 1 gordel rechts
const bodQS = 0.54, bodQR = 0.72, bodTUMB = 0.28;
// straal van de dakrand (ronding van de bovenrand van de zijwand naar het dak). Golf 9 (pakket DAK, beslissing DAK-3): 0,02, was 0,06. Op de foto's van de modelreeks
// ligt de bovenrand van de zijruiten ongeveer 45 mm hoger (25 tot 75 mm) en zit boven het raam alleen een smalle dakrand met de goot; de kroon (CRW) en de daklijn YR blijven,
// dus de zijwand loopt 40 mm hoger door en de ruiten, het portierraam en de stijlen worden zoveel hoger. Achter de bovenhoek van de hoekruit (z -1,24, DAK-4) gaat de straal
// glad terug naar 0,06 (vol vanaf z -1,44): daar zeggen de foto's binnen de meetfout niets anders dan het model (DAK-1), dus de achterruit houdt vrijwel zijn breedte.
const BOD_DAKRR = 0.02;
const bodDakRr = z => lerp(BOD_DAKRR, 0.06, sstep((-1.24 - z) / 0.20));
function bodGh(z) {
  const yb = YT(z), xb = bodSec(z).xe, yc = Math.max(yb + 0.002, YR(z)), h = yc - yb;
  const cr = Math.min(CRW, h * 0.3), yre = yc - cr, rr = Math.min(bodDakRr(z), (yre - yb) * 0.3), ye = yre - rr;
  const xe = xb - bodTUMB * (ye - yb), xr = xe - rr * 0.8;   // DAK-2: de zijwand helt 0,28 vanaf de gordel van KAS-2 (in KAS-2 stond hier xb - bodKasD(z) - ...: dak vast, helling 0,37)
  return { yb, xb, yc, cr, yre, rr, ye, xe, xr };
}
function bodGhHalf(z, q, g) {
  g = g || bodGh(z);
  if (q <= bodQS) { const t = q / bodQS; return [g.xb + (g.xe - g.xb) * t + 0.012 * Math.sin(PI * t) * Math.min(1, (g.ye - g.yb) / 0.2), g.yb + (g.ye - g.yb) * t]; }
  if (q <= bodQR) { const a = (q - bodQS) / (bodQR - bodQS) * HALF; return [g.xr + (g.xe - g.xr) * Math.cos(a), g.ye + (g.yre - g.ye) * Math.sin(a)]; }
  const t = (q - bodQR) / (1 - bodQR), x = g.xr * (1 - t); return [x, g.yre + g.cr * t * (2 - t)];
}
function ghPt(z, w) {
  const sd = w <= 0.5 ? 1 : -1, q = w <= 0.5 ? 2 * w : 2 - 2 * w, [x, y] = bodGhHalf(z, q);
  return [sd * x, y, z];
}
// parameter q op x langs het dak (alleen het dakdeel q > bodQR), bij |x|
function bodQAtX(z, x) { const g = bodGh(z); return bodQR + (1 - bodQR) * clamp(1 - Math.abs(x) / g.xr, 0, 1); }
/* ---------- buitenhuid voor andere onderdelen ---------- */
// halve breedte van de buitenhuid op hoogte y; boven de gordel in het kasbereik de halve breedte van ruit, stijl of dak; boven dek of dak 0
function surfX(z, y) {
  const c = bodSec(z);
  if (y <= c.yt || z < BOD_ZG0 || z > BOD_ZG1) return ringX(z, Math.min(y, c.yd));
  const g = bodGh(z);
  if (y >= g.yc) return 0;
  if (y <= g.ye) return bodGhHalf(z, clamp((y - g.yb) / Math.max(1e-6, g.ye - g.yb), 0, 1) * bodQS, g)[0];
  if (y <= g.yre) { const a = Math.asin(clamp((y - g.ye) / Math.max(1e-6, g.yre - g.ye), 0, 1)); return g.xr + (g.xe - g.xr) * Math.cos(a); }
  const u = clamp((y - g.yre) / g.cr, 0, 1), t = 1 - Math.sqrt(1 - u); return g.xr * (1 - t);
}
// punt op de buitenhuid (voor onderdelen die erop zitten)
function skin(z, y, s, out = 0) { const x = surfX(z, y); return [s * (x + out), y, z]; }
/* ---------- vlakken bouwen ---------- */
function patch(fn, u0, u1, nu, vr, nv, breaks = []) {
  const us = [];
  for (let i = 0; i <= nu; i++) us.push(u0 + (u1 - u0) * i / nu);
  breaks.forEach(b => { if (b > u0 + 1e-4 && b < u1 - 1e-4) us.push(b); });
  us.sort((a, b) => a - b);
  const pos = [], idx = [], rows = nv + 1;
  for (const u of us) { const [v0, v1] = vr(u); for (let j = 0; j <= nv; j++) { const p = fn(u, v0 + (v1 - v0) * j / nv); pos.push(p[0], p[1], p[2]); } }
  for (let i = 0; i < us.length - 1; i++) for (let j = 0; j < nv; j++) {
    const a = i * rows + j, b = (i + 1) * rows + j, c = b + 1, d = a + 1;
    idx.push(a, b, d, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}
// naar buiten wijzende normaal van de onderbak (linkerhelft) in (z, s)
function bodN(z, s) {
  const e = 1e-3, a = halfPt(z, Math.max(0, s - e)), b = halfPt(z, Math.min(1, s + e)), f = halfPt(z + e, s), k = halfPt(z - e, s);
  const ds = [b[0] - a[0], b[1] - a[1], 0], dz = [f[0] - k[0], f[1] - k[1], 2 * e];
  const n = [ds[1] * dz[2] - ds[2] * dz[1], ds[2] * dz[0] - ds[0] * dz[2], ds[0] * dz[1] - ds[1] * dz[0]], l = Math.hypot(...n) || 1;
  return [n[0] / l, n[1] / l, n[2] / l];
}
// punt van de onderbak met verschuiving langs de normaal (inw > 0 = naar binnen)
function bodLow(z, p, inw = 0) {
  const q = ((p % 2) + 2) % 2, sd = q <= 1 ? 1 : -1, s = q <= 1 ? q : 2 - q, [x, y] = halfPt(z, s);
  if (!inw) return [sd * x, y, z];
  const n = bodN(z, s); return [sd * (x - n[0] * inw), y - n[1] * inw, z - n[2] * inw];
}
const sideR = (s, a, b) => (s > 0 ? [a, b] : [2 - b, 2 - a]);
const sideW = (s, a, b) => (s > 0 ? [a, b] : [1 - b, 1 - a]);
function offsetFn(fn, s, dx, dy = 0, dz = 0) { return (u, v) => { const p = fn(u, v); return [p[0] - s * dx, p[1] + dy, p[2] + dz]; }; }
// paneel op de onderbak aan zijde s; vr(z) geeft [s0, s1] van de linkerhelft; off = verschuiving naar binnen
function lowSide(s, z0, z1, nu, vr, nv, breaks, off) {
  return patch((z, p) => bodLow(z, p, off || 0), z0, z1, nu, z => sideR(s, ...vr(z)), nv, breaks);
}
// dekpaneel over beide helften: sLo(z) geeft de s-ondergrens; het paneel loopt over de hartlijn
function bodDeck(z0, z1, nu, sLo, nv, breaks, off) {   // off: verschuiving naar binnen, een getal of een functie van z
  return patch((z, p) => bodLow(z, p, (typeof off === 'function' ? off(z) : off) || 0), z0, z1, nu, z => { const a = sLo(z); return [a, 2 - a]; }, nv, breaks);
}
function ghSide(s, z0, z1, nu, w0, w1, nv, off) {
  const fn = off ? offsetFn(ghPt, s, off) : ghPt;
  return patch(fn, z0, z1, nu, () => sideW(s, w0, w1), nv);
}
// kaspaneel aan zijde s met q-bereik per z (linkerhelft, q in [0,1]); out = verschuiving naar buiten
function bodGhSide(s, z0, z1, nu, vr, nv, breaks, out = 0) {
  return patch((z, q) => { const [x, y] = bodGhHalf(z, q); const o = out * (q <= bodQS ? 1 : 0.7); return [s * (x + o), y + (q > bodQS ? out * 0.7 : 0), z]; }, z0, z1, nu, vr, nv, breaks);
}
// kasdak over beide helften tussen q0 en 1 (q0 = bodQR geeft de dakplaat zonder dakrand)
function bodGhDeck(z0, z1, nu, qLo, nv, breaks, out = 0) {
  return patch((z, w) => { const sd = w <= 0.5 ? 1 : -1, q = w <= 0.5 ? 2 * w : 2 - 2 * w, [x, y] = bodGhHalf(z, q); return [sd * (x + out * 0.7), y + out * 0.7, z]; },
    z0, z1, nu, z => { const a = qLo(z) / 2; return [a, 1 - a]; }, nv, breaks);
}
/* ---------- eindvlakken ---------- */
// vlak op de uiterste z (voorkant of achterkant): x in [x0, x1] (afgekapt op de doorsnede), y in [y0, y1]; off schuift naar binnen
function bodFace(zEnd, dir, x0, x1, y0, y1, off = 0, ny = 6, nx = 10) {
  const sg = dir > 0 ? 1 : -1;
  return patch((y, t) => { const X = ringX(zEnd, y), xa = clamp(x0, -X, X), xb = Math.max(xa, clamp(x1, -X, X)); return [xa + (xb - xa) * t, y, zEnd - sg * off]; }, y0, y1, ny, () => [0, 1], nx);
}
const bodHalfFace = (zEnd, dir, sd, xin, y0, y1, off, ny, nx) => (sd > 0 ? bodFace(zEnd, dir, xin, 9, y0, y1, off, ny, nx) : bodFace(zEnd, dir, -9, -xin, y0, y1, off, ny, nx));
