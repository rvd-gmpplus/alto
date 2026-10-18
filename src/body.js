/* ===================== carrosserie: hoofdmaten en parametrisch oppervlak ===================== */
// assen: x = links(+)/rechts(-), y = omhoog, z = voor(+)/achter(-); maten in meter
// Alle steunpunten komen uit data/silhouet.json (zijaanzicht en bovenaanzicht van de 3-deurs hatchback, geschat uit foto's;
// fout ca. 3 cm tussen de assen, 5 cm in de overhang). De onderbak is een loft in (z, s), de kas een loft in (z, q).
// Uitzondering: de neus van YT, bodC en HW vanaf z 1,40 volgt de foto van de modelreeks 1993-2001 (beslissing 29, golf 6; keuze van de eigenaar): een vrijwel
// verticaal front (helling ca. 11 graden: op x = 0 van y 0,697 op z 1,663 naar 0,555 op z 1,691) met de kapvoorrand op z 1,66 en y 0,704, een vrijwel rechte
// kapvoorrand (bodC 0,012 op de neus: 12 mm daling van x 0 naar x 0,6) en vollere hoeken (halve breedte 0,658 op y 0,62 en z 1,65; HW tot z 1,70 boven 0,645 en een schouderstraal van 15 mm
// op de neus, zodat het vlakke front tot x 0,60 reikt). De lijn van de flank
// (YT) loopt vloeiend van 0,81 op z 1,35 naar 0,69 op de neus. De stations van data/silhouet.json blijven binnen hun tolerantie (top z 1,6: 0,744 tegen 0,746).
// Daarvoor (beslissing 17, golf 4) helde het front 34 graden en zakte de kaprand 45 mm naar buiten.
const ZF = 1.7475, ZR = -1.7475;                    // lengte 3495 mm (uiterste punten van de bumpers)
const BOD_WMAX = 0.7535, BOD_MIRW = 0.904, BOD_H = 1.405; // framework: halve breedte zonder en met spiegels (plus 6 mm), hoogte; integrity.py leest ze
const AXF = 1.087, AXR = -1.248, AY = 0.265;        // wielbasis 2335 mm; bandstraal 145/70 R13 is 0,2666 m, min indrukking
const ARCH = 0.30;                                   // wielbooguitsparing (straal om de wielas)
const TRACK_F = 0.6675, TRACK_R = 0.6525;           // halve spoorbreedte voor en achter (1335 en 1305 mm)
const BOD_ZG0 = -1.70, BOD_ZG1 = 0.905;               // kas: van de onderrand van de achterruit tot de waterkast
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
const HW = pchip([[-1.7475, 0.50], [-1.735, 0.555], [-1.70, 0.615], [-1.65, 0.66], [-1.55, 0.70], [-1.45, 0.72], [-1.30, 0.74], [-1.20, 0.7475],
  [0.90, 0.7475], [1.20, 0.735], [1.45, 0.703], [1.60, 0.672], [1.63, 0.663], [1.65, 0.651], [1.67, 0.632], [1.69, 0.612], [1.72, 0.584], [1.735, 0.563], [1.7475, 0.53]]);
// onderkant carrosserie (bumperranden, dorpel; in de wielbogen snijdt de boog)
const YB = pchip([[-1.7475, 0.34], [-1.73, 0.30], [-1.70, 0.285], [-1.60, 0.275], [-1.45, 0.27], [-1.2, 0.25], [-0.9, 0.225], [0.0, 0.215], [0.7, 0.222], [0.9, 0.232],
  [1.2, 0.25], [1.42, 0.265], [1.55, 0.265], [1.68, 0.27], [1.73, 0.285], [1.7475, 0.31]]);
// schouderlijn van de onderbak = gordellijn (onderkant zijruiten) in de kas; voor en achter de rand van motorkap en staartplaat
const YT = pchip([[-1.7475, 0.85], [-1.70, 0.875], [-1.62, 0.893], [-1.50, 0.915], [-1.35, 0.940], [-1.20, 0.955], [-1.0, 0.960], [-0.8, 0.955], [-0.4, 0.936],
  [-0.2, 0.925], [0.0, 0.913], [0.2, 0.901], [0.4, 0.894], [0.6, 0.897], [0.85, 0.903], [0.975, 0.895], [1.10, 0.875], [1.225, 0.845], [1.35, 0.8101], [1.40, 0.7930], [1.45, 0.7680], [1.50, 0.7460], [1.55, 0.7300], [1.60, 0.7180], [1.63, 0.7090], [1.65, 0.7000], [1.66, 0.6920], [1.664, 0.6820], [1.67, 0.6520], [1.68, 0.5950], [1.688, 0.5480], [1.70, 0.5320], [1.71, 0.5240], [1.725, 0.5150], [1.7475, 0.5000]]);   // neus, beslissing 29: vlak tot z 1,66, dan het steile front tot de bumper op z 1,70 (beslissing 17 had 1,50 0,722; 1,60 0,654; 1,65 0,616; 1,70 0,530; 1,7475 0,472). HW: vollere neus (was 1,60 0,662; 1,68 0,62; 1,73 0,555; 1,7475 0,50)
// bolling van het dek boven de schouderlijn (motorkap, staartplaat); in de kas is het dek onder de ruiten verborgen
// bolling: tussen z 1,44 en 1,55 iets groter (tot 0,040), naar de neus toe 0,012: de kapvoorrand loopt vrijwel recht (beslissing 29; in beslissing 17 tot 0,070 voor een
// flank die naar de lamp zakte); de rest ongewijzigd
const bodC = pchip([[-1.7475, 0.015], [-1.62, 0.012], [0.3, 0.012], [0.9, 0.026], [1.30, 0.02464], [1.38, 0.0241], [1.44, 0.035], [1.50, 0.040], [1.55, 0.036], [1.60, 0.026], [1.63, 0.018], [1.65, 0.013], [1.66, 0.012], [1.7475, 0.012]]);
const bodDP = pchip([[-1.7475, 3], [-1.0, 3.5], [0.9, 3.5], [1.3, 4], [1.7475, 3]]);   // exponent van het dekprofiel (vlak midden, afgeronde randen)
// daklijn op de hartlijn: voorruit, dak, achterruit (bij de voorruit en achterruit op de bovengrens van de silhouettolerantie)
const YR = pchip([[-1.7475, 0.862], [-1.70, 0.900], [-1.60, 1.010], [-1.45, 1.170], [-1.30, 1.290], [-1.15, 1.382], [-1.0, 1.400], [-0.65, 1.405], [-0.4, 1.405],
  [-0.15, 1.398], [0.1, 1.380], [0.35, 1.285], [0.6, 1.105], [0.75, 1.02], [0.9, 0.930]]);
const S1 = 0.14, S2 = 0.22, S3 = 0.60, S4 = 0.72, BUL = 0.012, CRW = 0.03;
const sstep = t => { const u = clamp(t, 0, 1); return u * u * (3 - 2 * u); };
// doorsnede van de onderbak op z
function bodSec(z) {
  const hw = HW(z), yb = YB(z), yt = YT(z), d = yt - yb, bul = Math.min(BUL, hw * 0.15);
  const rb = Math.min(0.045, d * 0.28, (hw - bul) * 0.45), rs = Math.min(0.055 - 0.040 * sstep((z - 1.58) / 0.06), d * 0.3, (hw - bul) * 0.45);   // schouder op de neus 15 mm (beslissing 29)
  const yd = Math.max(yt + 0.004, yt + bodC(z)), c = yd - yt, p = bodDP(z);
  const cx = hw - bul - rs;                       // middelpunt van de schouderboog
  let xe = cx + rs * 0.3, th = 1.2;
  for (let i = 0; i < 3; i++) { th = Math.atan2(xe, c * p); xe = cx + rs * Math.cos(th); }
  const cy = yt - rs * Math.sin(th);
  return { hw, yb, yt, rb, rs, yd, c, p, cx, cy, th, xe, bul };
}
// halve doorsnede (linkerhelft), s van 0 (onderkant midden) tot 1 (dek midden)
function bodHalf(z, s, c) {
  const { hw, yb, yt, rb, rs, cx, cy, th, xe, c: cr, p, bul } = c;
  if (s <= S1) return [s / S1 * (hw - bul - rb), yb];
  if (s <= S2) { const a = -HALF + (s - S1) / (S2 - S1) * HALF; return [hw - bul - rb + rb * Math.cos(a), yb + rb + rb * Math.sin(a)]; }
  if (s <= S3) { const t = (s - S2) / (S3 - S2); return [hw - bul + bul * Math.sin(PI * t), yb + rb + t * (cy - yb - rb)]; }
  if (s <= S4) { const a = (s - S3) / (S4 - S3) * th; return [cx + rs * Math.cos(a), cy + rs * Math.sin(a)]; }
  const t = (s - S4) / (1 - S4);
  return [xe * (1 - t), yt + cr * (1 - Math.pow(1 - t, p))];
}
function halfPt(z, s) { return bodHalf(z, s, bodSec(z)); }
function lowPt(z, p) {
  const q = ((p % 2) + 2) % 2;
  if (q <= 1) { const [x, y] = halfPt(z, q); return [x, y, z]; }
  const [x, y] = halfPt(z, 2 - q); return [-x, y, z];
}
// parameter s van de doorsnede bij hoogte y (flank, schouder en dek)
function sAtY(z, y) {
  const c = bodSec(z), y0 = c.yb + c.rb, y1 = c.cy;
  if (y <= y0) { const a = Math.asin(clamp((y - y0) / c.rb, -1, 0)); return S1 + (a + HALF) / HALF * (S2 - S1); }
  if (y <= y1) return S2 + (y - y0) / Math.max(1e-6, y1 - y0) * (S3 - S2);
  if (y <= c.yt) { const a = Math.asin(clamp((y - c.cy) / c.rs, 0, 1)); return S3 + Math.min(1, a / c.th) * (S4 - S3); }
  const u = clamp((y - c.yt) / Math.max(1e-6, c.c), 0, 1), t = 1 - Math.pow(1 - u, 1 / c.p);
  return S4 + t * (1 - S4);
}
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
function bodGh(z) {
  const yb = YT(z), xb = bodSec(z).xe, yc = Math.max(yb + 0.002, YR(z)), h = yc - yb;
  const cr = Math.min(CRW, h * 0.3), yre = yc - cr, rr = Math.min(0.06, (yre - yb) * 0.3), ye = yre - rr;
  const xe = xb - bodTUMB * (ye - yb), xr = xe - rr * 0.8;
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
