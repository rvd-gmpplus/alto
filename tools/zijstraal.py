"""zijstraal.py: harde poort voor platen en onderdelen die zijdelings door de buitenhuid van de carrosserie steken.

Waarom
  integrity.py kijkt alleen naar onderdelen buiten de carrosserie en vergelijkt hoekpunten met de analytische huid (surfX); clash.py ziet een dunne
  plaat door een open schaal niet als doordringing. Zo kwam d2ae9f1 door alle poorten: twee sluitplaten op x 0,715, samengevoegd in de mesh
  Wielkast achter links en rechts (carrosserie), staken links tot 17 mm en rechts tot 23 mm door het achterscherm (docs/onderzoek/beslissingen.md).

Ontwerpregel
  1. Stralen evenwijdig aan de x-as, per kant van buiten naar binnen (links: kant +1, van x groot naar klein; rechts: kant -1), op een raster in
     (y, z): z van ZR + 5 cm tot ZF - 5 cm (de zijkant, niet de voor- en achterkant), y van YB(z) (onderkant) tot YT(z) - 1 cm (schouderlijn),
     beide uit body.js, zoals de zijkantregel in integrity.py; stap --stap mm (standaard 5). Het raster ligt 0,37 mm naast de millimeterlijnen,
     zodat stralen niet precies over de randen van platen op ronde maten lopen.
  2. Per straal tellen alle treffers, niet alleen de eerste. De huid van die kant is de buitenste treffer van een huidknoop (lijst HUID) met
     kant * x > 0, genomen als maximum over de stralen binnen 5 mm in y en z (de 'buurt'; bij een stap boven 5 mm alleen de straal zelf). Zonder
     die buurt was de huid op een strijkende straal langs een omgezette rand de naar binnen gezette flens in plaats van het buitenvlak: op HEAD
     gaf dat bij stap 1 tot 3 mm de Vulpijp (46,7 mm buiten de naar binnen gezette onderrand van de achterbumper, y 0,274), de rand van het knipperlicht voor
     (3,9 mm, voorhoek) en het achterlicht (3,8 mm, achterhoek). Die waren geen doorsteek.
  3. Een treffer van een andere knoop (geen huid) steekt door de huid als hij meer dan 2 mm buiten die huid ligt: kant * x_knoop >
     kant * x_huid + 2 mm, of meer dan zijn toegestane uitsteek (lijst UITZONDERING). Dit is de voorgestelde regel ('dezelfde straal raakt
     daarna huid van dezelfde kant met kant * x_huid < kant * x_A - 2 mm'), beperkt tot de buitenste huidlaag: een onderdeel tussen twee
     huidlagen (scherm en binnenflens, portierbuitenpaneel en portierrand) telt niet als fout.
  4. Binnen de wielboog en andere openingen ligt achter de bekleding geen huid van dezelfde kant: daar is niets te vergelijken en blijft het
     groen. De voorwielkastbekleding binnen de boog (x ca. 0,5 tot 0,645) is dus verwacht en geen fout, en wielen, tankklep en uitlaat hoeven
     geen uitzondering.
  5. Alleen de gesloten stand. Proef op f3b77bd met openAll(1): rood op de open Klepplaat tankklep (105 mm) en het Portierrubber van de open
     portieren (20 mm), dus de open stand meet het openen zelf; opentest.py en clash.py dekken die stand. Verborgen meshes (ook een verborgen
     voorouder) en doorzichtige (dekking < 0,5, zoals in meet.py) tellen niet.

Rekenwijze (deterministisch, zonder renderer)
  Geen beeldpunten. Omdat alle stralen evenwijdig aan x lopen, berekent het script het snijpunt per driehoek analytisch: elke driehoek
  (wereldcoordinaten) wordt in het (y, z)-vlak geprojecteerd, voor elk rasterpunt binnen die projectie volgt x uit de barycentrische
  coordinaten. Dat is dezelfde wiskunde als THREE.Raycaster (zijde van het materiaal en spiegeling van de matrix meegenomen, drawRange), maar
  in een doorgang over de driehoeken in plaats van een doorgang over alle meshes per straal (ca. 40 ms tegen minuten). Ter controle schiet het
  script op een vaste steekproef van rasterlijnen (ca. 1 op 97) echte THREE.Raycaster-stralen (layers.enableAll) van beide kanten en vergelijkt
  alle treffers (knoop en x op 0,1 mm); een verschil bij meer dan 1 procent van de steekproef is een mislukte meting (exitcode 2).

Wat de poort niet ziet (bekende zwaktes)
  - Boven de schouderlijn (ruiten, stijlen, dak, spiegel) en onder de onderkant (onder dorpel en bumpers); de voor- en achterkant (stralen in
    z), de bovenkant (stralen in y) en de eerste en laatste 5 cm van de lengte.
  - Een onderdeel buiten de huid waar binnen 5 mm geen huid van dezelfde kant ligt: in een opening of voorbij de rand van een scherm. Op
    d2ae9f1 links ziet de poort de plaat alleen boven y 0,375; lager eindigt het achterscherm links en staat de plaat vrij onder de rand.
  - Vlakken evenwijdig aan de straal: een koker of flens die langs x naar buiten loopt, raakt de straal alleen op zijn rand. Synthetisch: de
    hele Wielkast voor links 30 mm naar buiten geeft maar 11 stralen (5 mm stap), alleen waar de wand onder de bumper uitkomt.
  - Uitsteeksels van minder dan 2 mm (of de toegestane uitsteek) of smaller dan de stap; verborgen knopen (inner, hideWhen), doorzichtige
    meshes en de open stand.

Uitvoer en exitcode
  JSON (--json; anders UIT/zijstraal.json, met --uit of een nieuwe tijdelijke map): per kant het aantal stralen, het aantal stralen met een treffer door de huid per knoop, met
  het y- en z-bereik, de grootste uitsteek in mm met een voorbeeldpunt (y, z, x, x_huid) en de huidknoop erachter; de huid- en
  uitzonderingslijst, de controle met de Raycaster en de console-fouten.
  Het veld dekking telt per patroon van HUID ('huid') en UITZONDERING ('uit') het aantal gematchte zichtbare meshes. Een patroon zonder mesh (n = 0)
  is een mislukte meting: een hernoemde knoop (bijvoorbeeld Voorscherm) laat anders de dekking van de huid stil wegvallen terwijl de poort groen
  blijft, en een uitzondering zonder mesh is een verouderde vrijstelling. De telling van 'uit' slaat knopen over die al onder HUID vallen (die
  indeling gaat voor). De telling is per patroon, niet per alternatief in een groep: valt alleen 'Voorscherm' uit (Voorscherm|Achterscherm|Schermflens)
  weg, dan staat n lager (4 in plaats van 6) maar niet op 0; die hernoeming valt dan op via de poort zelf (Voorscherm wordt kandidaat, rood met exitcode 1).
  Exitcode 0 groen, 1 rood (een knoop door de huid of een console-fout), 2 meting mislukt (raycaster-controle wijkt af, geen huid geraakt of
  een patroon zonder mesh; de melding is dan 'METING MISLUKT: huidpatroon zonder mesh: <patroon>' of 'METING MISLUKT: uitzondering zonder mesh: <patroon>').

Gebruik
  . ~/.config/web3d/env.sh
  python3 -I tools/zijstraal.py [--root WERKBOOM] [--json BESTAND] [--uit MAP] [--stap MM] [--sw] [--straal Y,Z ...]
  --root  werkboom met tools/harness.py en src/ (standaard de repowortel boven tools/); de harness van die wortel bouwt die src/
  --sw    SwiftShader in plaats van de GPU (standaard op macOS ANGLE Metal, elders SwiftShader). Er wordt niets getekend, dus de uitkomst hoort
          gelijk te zijn; --sw is de controle daarop.
  --straal  toont alle treffers van een straal door (y, z) van beide kanten, met soort (huid, kandidaat, uitzondering), zoals rays.py
"""
import sys, os, json, argparse, tempfile, time, platform, subprocess, re, shutil

HERE = os.path.dirname(os.path.abspath(__file__))
_PAR = os.path.dirname(HERE)
ap = argparse.ArgumentParser(description='Zijstraalpoort: platen die zijdelings door de huid steken.')
ap.add_argument('--root', default=_PAR, help='werkboom (standaard de repowortel boven tools/)')
ap.add_argument('--json', help='uitvoerbestand (standaard UIT/zijstraal.json)')
ap.add_argument('--uit', help='uitvoermap voor zijstraal.json als --json ontbreekt (standaard een nieuwe tijdelijke map)')
ap.add_argument('--stap', type=float, default=5.0, help='rasterstap in mm (standaard 5)')
ap.add_argument('--sw', action='store_true', help='SwiftShader in plaats van de GPU')
ap.add_argument('--straal', action='append', default=[], metavar='Y,Z', help='toon alle treffers van de straal door (y, z), per kant (zoals rays.py); herhaalbaar')
a = ap.parse_args()

DREMPEL_MM = 2.0
RAND_MM = 50.0        # zijkant: z van ZR + 5 cm tot ZF - 5 cm (zoals de zijkantregel in integrity.py)
SCHOUDER_MM = 10.0    # bovengrens YT(z) - 1 cm (zoals integrity.py)
VERSCHUIVING_MM = 0.37
BUURT_MM = 5.0        # huid in de buurt: de buitenste huid binnen 5 mm in y en z (docstring, ontwerpregel 2)

# Buitenhuid: knopen (pad vanaf de wortel, delen gescheiden door '/') die samen het buitenoppervlak van de zijkant vormen tussen onderkant en
# schouderlijn. Alleen de buitenste treffer van deze knopen per straal en kant telt als huid.
HUID = [
    (r'^Carrosserie/Carrosseriekooi/Zijwanden en dak/(Voorscherm|Achterscherm|Schermflens) (links|rechts)$', 'schermen en de flens tussen voorscherm en portier'),
    (r'^Carrosserie/Carrosseriekooi/Zijwanden en dak/[ABC]-stijl (links|rechts)$', 'stijlen: buitenkant boven de portieropening'),
    (r'^Carrosserie/Carrosseriekooi/Zijwanden en dak/Achterpaneel$', 'achterpaneel: hoeken achter'),
    (r'^Carrosserie/Carrosseriekooi/Vloer en dorpels/Dorpel (links|rechts)$', 'dorpels: onderkant van de zijkant'),
    (r'^Carrosserie/Portier (links|rechts)/(Buitenpaneel|Portierrand)$', 'portierbuitenpaneel en de omgezette rand ervan'),
    (r'^Carrosserie/Voorbumper/(Bumperschaal voor|Bumperlip voor|Onderplaat voorbumper)$', 'voorbumper: schaal, lip en onderplaat'),
    (r'^Carrosserie/Achterbumper/Bumperschaal achter$', 'achterbumperschaal'),
    (r'^Carrosserie/Motorkap/(Buitenpaneel motorkap|Kaprand)$', 'motorkap: buitenpaneel en rand (bij de schouderlijn voor)'),
    (r'^Carrosserie/Achterklep/Buitenpaneel achterklep$', 'achterklep: buitenpaneel (hoeken achter)'),
]
# Uitzonderingen: knopen die buiten de buitenste huid horen te zitten, elk met een reden. Tweede veld: de toegestane uitsteek in mm (None:
# niet meten). Een toegestane uitsteek houdt de poort scherp: een greep of lijst die verder naar buiten schuift, wordt alsnog rood.
# Geijkt op golf4-basis f3b77bd (17 oktober 2026); de gemeten uitsteek staat bij elk item. De lijst van integrity.py (banden, velgen,
# wielbouten, naafdoppen, ventielen, sensoren, balansgewichten, tankklep en -dop, uitlaateindstukken) is bewust NIET overgenomen: zonder
# die uitzonderingen is HEAD groen, want die delen liggen in de wielboog of in een kom zonder huid erachter. Zo blijft een band die door het
# scherm steekt (spoorbreedte, velgmaat) een rode poort.
UITZONDERING = [
    (r'^Carrosserie/Achterlicht (links|rechts)/', None, 'achterlichtunit: lens en lichthuis vormen de achterhoek van de buitenkant; erachter ligt alleen de zijkant van de achterklep (sinds het staartvlak in golf 6 40 mm naar voren ligt). Gemeten 51 tot 223 mm buiten het klepbuitenpaneel'),
    (r'^Carrosserie/Carrosseriekooi/Zijwanden en dak/Beschermlijst achterscherm (links|rechts)$', 8.0, 'stootstrip op het achterscherm (zwart, 6 mm dik, keuze eigenaar). Gemeten tot 5,0 mm'),
    (r'^Carrosserie/Koplamp (links|rechts)/', None, 'koplampunit: hoekreflector en lamphuis vormen de voorhoek van de buitenkant (onder de doorzichtige hoekkap); erachter ligt alleen de kaprand. Gemeten 51 tot 134 mm buiten de kaprand (stap 1 tot 10 mm)'),
    (r'^Carrosserie/Portier (links|rechts)/Buitendeurgreep/', 15.0, 'buitendeurgreep: greepschaal en greepdrager liggen op het portierbuitenpaneel. Gemeten tot 10,8 mm (Greepschaal) en 6,8 mm (Greepdrager)'),
    (r'^Carrosserie/Portier (links|rechts)/Zijlijsten/', 8.0, 'beschermlijst en gordelrubber liggen op het portierbuitenpaneel. Gemeten tot 5,8 mm (Beschermlijst)'),
    (r'^Carrosserie/Carrosseriekooi/Zijwanden en dak/Zijrepeater (links|rechts)$', 5.0, 'zijknipperlicht op het voorscherm. Gemeten tot 3,5 mm'),
    (r'^Carrosserie/Voorbumper/Bumpernaad voor$', 5.0, 'donkere voeg van 5 mm in de naad tussen bumperschaal en voorscherm, op de afgeronde bovenrand van de schaal (y 0,604 tot 0,622); geen plaat door de huid. Gemeten tot 3,1 mm (stap 1 mm; bij 5 mm onder de drempel)'),
]
for _p in [p for p, _ in HUID] + [p for p, _, _ in UITZONDERING]: re.compile(_p)   # syntaxcontrole; de pagina gebruikt dezelfde patronen als RegExp

if not os.path.isfile(os.path.join(a.root, 'tools', 'harness.py')):
    print(f'FOUT: tools/harness.py ontbreekt in de wortel {a.root!r}; geef --root WERKBOOM', file=sys.stderr); sys.exit(2)
sys.path.insert(0, os.path.join(a.root, 'tools'))
import harness

JS = r"""([cfg]) => {
  const L = window.__model, T0 = performance.now();
  const wasB = L.batching(); if (wasB) L.batching(false);
  L.ROOT.obj.updateMatrixWorld(true);
  const pad = n => { const p = []; for (let q = n; q && q.parent; q = q.parent) p.unshift(q.name); return p.join('/'); };
  const zichtbaar = m => { for (let o = m; o; o = o.parent) if (!o.visible) return false; const mt = m.userData.base || m.material; return !(mt.transparent && mt.opacity < 0.5); };
  const huidRe = cfg.huid.map(s => new RegExp(s)), uitRe = cfg.uit.map(([s, mm]) => [new RegExp(s), mm]);
  if (typeof YT !== 'function' || typeof YB !== 'function' || typeof ZF !== 'number' || typeof ZR !== 'number') throw new Error('YT, YB, ZF of ZR ontbreekt in de pagina (body.js)');
  const st = cfg.stap / 1000, off = cfg.verschuiving / 1000, rand = cfg.rand / 1000, sch = cfg.schouder / 1000;
  // kk: buurt in rasterlijnen (hoogstens cfg.buurt mm); het rekenraster ligt kk lijnen ruimer dan het raster van de poort, zodat de huid ook net
  // buiten het raster bekend is
  const kk = Math.floor(cfg.buurt / cfg.stap + 1e-9);   // nooit ruimer dan cfg.buurt: bij een stap boven 5 mm geen buurt
  const zA = Math.ceil((ZR + rand) / st) * st + off, nzA = Math.floor((ZF - rand - zA) / st) + 1;
  const z0 = zA - kk * st, nz = nzA + 2 * kk;
  const ylo = new Float64Array(nz), yhi = new Float64Array(nz);
  let ymin = Infinity, ymax = -Infinity;
  for (let i = 0; i < nz; i++) { const z = z0 + i * st; ylo[i] = YB(z); yhi[i] = YT(z) - sch; if (i >= kk && i < nz - kk) { ymin = Math.min(ymin, ylo[i]); ymax = Math.max(ymax, yhi[i]); } }
  const y0 = Math.floor(ymin / st) * st + off - kk * st, ny = Math.floor((ymax - y0) / st) + 1 + kk, N = ny * nz;
  const inRaster = new Uint8Array(N); let nStr = 0;
  for (let i = kk; i < nz - kk; i++) for (let j = 0; j < ny; j++) { const y = y0 + j * st; if (y >= ylo[i] && y <= yhi[i]) { inRaster[i * ny + j] = 1; nStr++; } }
  // meshes: soort 1 huid, 2 uitzondering, 0 kandidaat
  const meshes = [], namen = [], soort = [], toe = [];   // toe: toegestane uitsteek in m per knoop
  const kn = new Map();
  // dekking: per patroon het aantal gematchte zichtbare meshes (een patroon zonder mesh is een mislukte meting, zie Python)
  const dekH = cfg.huid.map(() => 0), dekU = cfg.uit.map(() => 0), nodeH = [], nodeU = [];
  for (const m of L.MESHES) {
    if (!zichtbaar(m) || !m.userData.node) continue;
    const p = pad(m.userData.node);
    let k = kn.get(p);
    if (k === undefined) {
      k = namen.length; namen.push(p); kn.set(p, k);
      const u = uitRe.find(([r]) => r.test(p));
      const hH = huidRe.map((r, i) => r.test(p) ? i : -1).filter(i => i >= 0);
      nodeH.push(hH); nodeU.push(hH.length ? [] : uitRe.map(([r], i) => r.test(p) ? i : -1).filter(i => i >= 0));   // huid gaat voor uitzondering
      if (huidRe.some(r => r.test(p))) { soort.push(1); toe.push(0); }
      else if (u && u[1] === null) { soort.push(2); toe.push(0); }
      else { soort.push(0); toe.push(u ? u[1] / 1000 : cfg.drempel / 1000); }
    }
    meshes.push([m, k]);
    for (const i of nodeH[k]) dekH[i]++;
    for (const i of nodeU[k]) dekU[i]++;
  }
  const SKIN = [new Float64Array(N).fill(-Infinity), new Float64Array(N).fill(-Infinity)], SKINK = [new Int32Array(N).fill(-1), new Int32Array(N).fill(-1)];
  const v = new THREE.Vector3();
  // driehoeken doorlopen; cb(lijn, x, frontVoorKant[2]) per snijpunt
  function snij(m, cb, alle) {
    const g = m.geometry, pos = g.attributes.position, idx = g.index, mw = m.matrixWorld;
    const n = pos.count, W = new Float64Array(n * 3);
    for (let i = 0; i < n; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(mw); W[3 * i] = v.x; W[3 * i + 1] = v.y; W[3 * i + 2] = v.z; }
    const det = mw.determinant() < 0 ? -1 : 1, side = (m.userData.base || m.material).side;
    const cnt = idx ? idx.count : n, s0 = Math.max(0, g.drawRange.start), s1 = Math.min(cnt, g.drawRange.start + g.drawRange.count);
    for (let t = s0; t + 2 < s1; t += 3) {
      const a = idx ? idx.getX(t) : t, b = idx ? idx.getX(t + 1) : t + 1, c = idx ? idx.getX(t + 2) : t + 2;
      const ax = W[3*a], ay = W[3*a+1], az = W[3*a+2], bx = W[3*b], by = W[3*b+1], bz = W[3*b+2], cx = W[3*c], cy = W[3*c+1], cz = W[3*c+2];
      const d = (by - ay) * (cz - az) - (bz - az) * (cy - ay);   // x-component van de normaal (b-a) x (c-a)
      if (Math.abs(d) < 1e-14) continue;                          // driehoek evenwijdig aan de straal
      // Raycaster: FrontSide raakt alleen als dir . n_lokaal < 0; dir = (-kant, 0, 0) -> front voor kant +1 als n_x * det > 0
      const fr = d * det > 0;
      const okL = side === 2 || (side === 0 ? fr : !fr), okR = side === 2 || (side === 0 ? !fr : fr);
      if (!okL && !okR) continue;
      const zlo = Math.min(az, bz, cz), zhi = Math.max(az, bz, cz), yl = Math.min(ay, by, cy), yh = Math.max(ay, by, cy);
      const i0 = Math.max(0, Math.ceil((zlo - z0) / st - 1e-9)), i1 = Math.min(nz - 1, Math.floor((zhi - z0) / st + 1e-9));
      const j0 = Math.max(0, Math.ceil((yl - y0) / st - 1e-9)), j1 = Math.min(ny - 1, Math.floor((yh - y0) / st + 1e-9));
      if (i0 > i1 || j0 > j1) continue;
      for (let i = i0; i <= i1; i++) {
        const z = z0 + i * st;
        for (let j = j0; j <= j1; j++) {
          const L_ = i * ny + j; if (!alle && !inRaster[L_]) continue;
          const y = y0 + j * st;
          const w1 = ((y - ay) * (cz - az) - (z - az) * (cy - ay)) / d, w2 = ((by - ay) * (z - az) - (bz - az) * (y - ay)) / d, w0 = 1 - w1 - w2;
          if (w0 < -1e-9 || w1 < -1e-9 || w2 < -1e-9) continue;
          cb(L_, ax * w0 + bx * w1 + cx * w2, okL, okR);
        }
      }
    }
  }
  // doorgang 1: buitenste huidtreffer per lijn en kant (op het ruime rekenraster)
  for (const [m, k] of meshes) if (soort[k] === 1) snij(m, (l, x, okL, okR) => {
    if (okL && x > 0 && x > SKIN[0][l]) { SKIN[0][l] = x; SKINK[0][l] = k; }
    if (okR && x < 0 && -x > SKIN[1][l]) { SKIN[1][l] = -x; SKINK[1][l] = k; }
  }, true);
  // huid in de buurt: grootste kant * x over de lijnen binnen kk stappen in y en z (scheidbaar maximumfilter, met de knoop erbij)
  const HB = [], HBK = [];
  for (let s = 0; s < 2; s++) {
    const A = new Float64Array(N).fill(-Infinity), AK = new Int32Array(N).fill(-1), B = new Float64Array(N).fill(-Infinity), BK = new Int32Array(N).fill(-1);
    for (let i = 0; i < nz; i++) for (let j = 0; j < ny; j++) { const l = i * ny + j;
      for (let q = Math.max(0, j - kk); q <= Math.min(ny - 1, j + kk); q++) { const m = i * ny + q; if (SKIN[s][m] > A[l]) { A[l] = SKIN[s][m]; AK[l] = SKINK[s][m]; } } }
    for (let i = 0; i < nz; i++) for (let j = 0; j < ny; j++) { const l = i * ny + j;
      for (let q = Math.max(0, i - kk); q <= Math.min(nz - 1, i + kk); q++) { const m = q * ny + j; if (A[m] > B[l]) { B[l] = A[m]; BK[l] = AK[m]; } } }
    HB.push(B); HBK.push(BK);
  }
  // doorgang 2: kandidaten buiten de huid
  const res = [new Map(), new Map()];
  const lijnen = [new Uint8Array(N), new Uint8Array(N)];
  for (const [m, k] of meshes) if (soort[k] === 0) {
    const per = [new Map(), new Map()];
    snij(m, (l, x, okL, okR) => {
      for (let s = 0; s < 2; s++) {
        if (!(s === 0 ? okL : okR)) continue;
        const kx = s === 0 ? x : -x, h = HB[s][l];
        if (h === -Infinity || kx <= h + toe[k]) continue;
        const u = kx - h, o = per[s].get(l);
        if (!o || u > o[0]) per[s].set(l, [u, x]);
      }
    });
    for (let s = 0; s < 2; s++) for (const [l, [u, x]] of per[s]) {
      lijnen[s][l] = 1;
      let r = res[s].get(k); if (!r) { r = { knoop: namen[k], toegestaan_mm: +(toe[k] * 1000).toFixed(1), stralen: 0, max_mm: 0, voorbeeld: null, huid: null, bereik: { y: [Infinity, -Infinity], z: [Infinity, -Infinity] } }; res[s].set(k, r); }
      r.stralen++;
      { const yy = +(y0 + (l % ny) * st).toFixed(5), zz = +(z0 + Math.floor(l / ny) * st).toFixed(5), b = r.bereik; b.y = [Math.min(b.y[0], yy), Math.max(b.y[1], yy)]; b.z = [Math.min(b.z[0], zz), Math.max(b.z[1], zz)]; }
      if (u > r.max_mm / 1000 + 1e-12) { const i = Math.floor(l / ny), j = l % ny; r.max_mm = +(u * 1000).toFixed(2); r.voorbeeld = { y: +(y0 + j * st).toFixed(5), z: +(z0 + i * st).toFixed(5), x: +x.toFixed(5), x_huid: +((s === 0 ? 1 : -1) * HB[s][l]).toFixed(5), x_huid_straal: SKIN[s][l] > -Infinity ? +((s === 0 ? 1 : -1) * SKIN[s][l]).toFixed(5) : null }; r.huid = namen[HBK[s][l]]; }
    }
  }
  const T1 = performance.now();
  // controle: echte Raycaster op een vaste steekproef van lijnen
  const rc = new THREE.Raycaster(); rc.layers.enableAll(); rc.near = 0; rc.far = 10;
  const obj = meshes.map(([m]) => m), kOf = new Map(meshes.map(([m, k]) => [m, k]));
  const relevant = k => soort[k] !== 2;
  let steek = 0, verschil = 0; const vb = [];
  const lijst = []; for (let l = 0; l < N; l++) if (inRaster[l] && ((l * 2654435761) >>> 0) % cfg.steekproef === 0) lijst.push(l);
  // analytische treffers van de steekproeflijnen
  const ana = new Map(lijst.map(l => [l, [[], []]]));
  for (const [m, k] of meshes) if (relevant(k)) snij(m, (l, x, okL, okR) => { const e = ana.get(l); if (!e) return; if (okL) e[0].push([k, x]); if (okR) e[1].push([k, x]); });
  for (const l of lijst) {
    const i = Math.floor(l / ny), j = l % ny, y = y0 + j * st, z = z0 + i * st;
    for (let s = 0; s < 2; s++) {
      const kant = s === 0 ? 1 : -1;
      rc.set(new THREE.Vector3(kant * 3, y, z), new THREE.Vector3(-kant, 0, 0));
      const h = rc.intersectObjects(obj, false).filter(q => relevant(kOf.get(q.object))).map(q => [kOf.get(q.object), q.point.x]);
      const A = ana.get(l)[s].slice();
      const zelfde = (p, q) => p[0] === q[0] && Math.abs(p[1] - q[1]) < 1e-4;
      // ontdubbelen: een straal door een gedeelde rand geeft twee gelijke treffers
      const uniq = arr => arr.filter((p, n) => !arr.slice(0, n).some(q => zelfde(p, q)));
      const U = uniq(h), V = uniq(A);
      const mis = U.filter(p => !V.some(q => zelfde(p, q))).length + V.filter(p => !U.some(q => zelfde(p, q))).length;
      steek++;
      if (mis) { verschil++; if (vb.length < 5) vb.push({ y: +y.toFixed(5), z: +z.toFixed(5), kant, raycaster: U.length, analytisch: V.length }); }
    }
  }
  // losse stralen (--straal): alle treffers per kant, van buiten naar binnen
  const los = cfg.stralen.map(([y, z]) => { const r = { y, z }; for (let s = 0; s < 2; s++) { const kant = s === 0 ? 1 : -1;
    rc.set(new THREE.Vector3(kant * 3, y, z), new THREE.Vector3(-kant, 0, 0));
    r[s === 0 ? 'links' : 'rechts'] = rc.intersectObjects(obj, false).slice(0, 12).map(q => { const k = kOf.get(q.object); return { knoop: namen[k], soort: ['kandidaat', 'huid', 'uitzondering'][soort[k]], x: +q.point.x.toFixed(5) }; }); }
    return r; });
  if (wasB) { L.batching(true); L.batchFlush(); }
  const pk = s => [...res[s].values()].sort((p, q) => q.max_mm - p.max_mm);
  let huidS = [0, 0]; for (let l = 0; l < N; l++) if (inRaster[l]) for (let s = 0; s < 2; s++) if (HB[s][l] > -Infinity) huidS[s]++;
  const kant = s => ({ stralen: nStr, stralen_met_huid: huidS[s], stralen_door_huid: lijnen[s].reduce((p, q) => p + q, 0), knopen: pk(s) });
  return {
    raster: { stap_mm: cfg.stap, buurt_lijnen: kk, z: [+zA.toFixed(5), +(zA + (nzA - 1) * st).toFixed(5)], nz: nzA, y: [+(y0 + kk * st).toFixed(5), +(y0 + (ny - 1 - kk) * st).toFixed(5)], stralen_per_kant: nStr },
    meshes: meshes.length, huid_meshes: meshes.filter(([, k]) => soort[k] === 1).length, uitzondering_meshes: meshes.filter(([, k]) => soort[k] === 2).length,
    huid_knopen: namen.filter((_, k) => soort[k] === 1), uitzondering_knopen: namen.filter((_, k) => soort[k] === 2),
    toegestane_uitsteek: Object.fromEntries(namen.map((n, k) => [n, toe[k]]).filter(([, t], k) => soort[k] === 0 && Math.abs(t * 1000 - cfg.drempel) > 1e-9).map(([n, t]) => [n, +(t * 1000).toFixed(1)])),
    dekking: { huid: Object.fromEntries(cfg.huid.map((s, i) => [s, dekH[i]])), uit: Object.fromEntries(cfg.uit.map(([s], i) => [s, dekU[i]])) },
    links: kant(0), rechts: kant(1),
    raycaster_controle: { stralen: steek, verschil, voorbeelden: vb }, losse_stralen: los,
    ms_rekenen: Math.round(T1 - T0), ms_controle: Math.round(performance.now() - T1)
  };
}"""


def git_info(root):
    try:
        h = subprocess.run(['git', '-C', root, 'rev-parse', '--short', 'HEAD'], capture_output=True, text=True).stdout.strip()
        d = subprocess.run(['git', '-C', root, 'status', '--short', '--', 'src'], capture_output=True, text=True).stdout.strip()
        return h or None, bool(d)
    except Exception:
        return None, None


def main():
    t0 = time.time()
    gpu = (not a.sw) and platform.system() == 'Darwin'
    if gpu:
        harness.ARGS = ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist']
    if a.json:
        jp = os.path.abspath(a.json)
    else:
        if not a.uit:
            a.uit = tempfile.mkdtemp(prefix='zijstraal-uit-'); print('uitvoermap (tijdelijk):', a.uit)
        jp = os.path.join(a.uit, 'zijstraal.json')
    os.makedirs(os.path.dirname(jp), exist_ok=True)
    cfg = {'stap': a.stap, 'verschuiving': VERSCHUIVING_MM, 'rand': RAND_MM, 'schouder': SCHOUDER_MM, 'drempel': DREMPEL_MM, 'buurt': BUURT_MM, 'steekproef': 97,
           'huid': [p for p, _ in HUID], 'uit': [[p, mm] for p, mm, _ in UITZONDERING],
           'stralen': [[float(v) for v in t.split(',')] for t in a.straal]}
    d = harness.build_test(tempfile.mkdtemp(prefix='zijstraal-'))
    try:
        with harness.session(d) as s:
            pg = s.page(800, 600)
            pg.evaluate('window.__model.finishAll()')
            r = pg.evaluate(JS, [cfg])
            s.report()
            console = s.errors()
    finally:
        shutil.rmtree(d, ignore_errors=True)   # testmap opruimen (three/ is een symlink; het pakket blijft staan)
    h, vuil = git_info(a.root)
    r['meta'] = {'root': os.path.abspath(a.root), 'commit': h, 'src_gewijzigd': vuil, 'gpu': gpu, 'stand': 'gesloten', 'drempel_mm': DREMPEL_MM,
                 'secs': round(time.time() - t0, 1), 'datum': time.strftime('%Y-%m-%d %H:%M:%S')}
    r['huid_regels'] = [{'patroon': p, 'reden': w} for p, w in HUID]
    r['uitzonderingen'] = [{'patroon': p, 'toegestaan_mm': mm, 'reden': w} for p, mm, w in UITZONDERING]
    r['console'] = console
    rc = r['raycaster_controle']
    dek = r.get('dekking') or {'huid': {}, 'uit': {}}
    zonder = [('huidpatroon', p) for p, _ in HUID if dek['huid'].get(p, 0) == 0] + [('uitzondering', p) for p, _, _ in UITZONDERING if dek['uit'].get(p, 0) == 0]   # n == 0 of niet gemeten
    stralen_ok = rc['stralen'] > 0 and rc['verschil'] <= 0.01 * rc['stralen'] and r['links']['stralen_met_huid'] > 0 and r['rechts']['stralen_met_huid'] > 0
    meting_ok = stralen_ok and not zonder
    rood = [k for k in ('links', 'rechts') if r[k]['knopen']]
    r['ok'] = meting_ok and not rood and not console
    r['meting_ok'] = meting_ok
    with open(jp, 'w', encoding='utf-8') as f:
        json.dump(r, f, ensure_ascii=False, indent=1)
    rs = r['raster']
    print(f"raster: stap {rs['stap_mm']} mm, z {rs['z'][0]} tot {rs['z'][1]}, y {rs['y'][0]} tot {rs['y'][1]} (YB tot YT - 1 cm), {rs['stralen_per_kant']} stralen per kant; "
          f"{r['meshes']} meshes ({r['huid_meshes']} huid, {r['uitzondering_meshes']} uitzondering); rekenen {r['ms_rekenen']} ms, controle {r['ms_controle']} ms")
    for k in ('links', 'rechts'):
        e = r[k]
        print(f"{k}: {e['stralen_met_huid']} stralen met huid, {e['stralen_door_huid']} met een treffer door de huid, {len(e['knopen'])} knopen")
        for n in e['knopen'][:15]:
            vbp = n['voorbeeld']
            print(f"  {n['knoop']}: {n['stralen']} stralen (y {n['bereik']['y'][0]} tot {n['bereik']['y'][1]}, z {n['bereik']['z'][0]} tot {n['bereik']['z'][1]}), tot {n['max_mm']} mm buiten {n['huid']} (y {vbp['y']}, z {vbp['z']}, x {vbp['x']}, huid x {vbp['x_huid']}; toegestaan {n['toegestaan_mm']} mm)")
    for t in r['losse_stralen']:
        for k in ('links', 'rechts'):
            print(f"straal y {t['y']} z {t['z']} {k}: " + '; '.join(f"{h['knoop']} ({h['soort']}) x {h['x']}" for h in t[k]))
    print(f"raycaster-controle: {rc['stralen']} stralen, {rc['verschil']} met verschil" + (f" {rc['voorbeelden']}" if rc['verschil'] else ''))
    print('dekking per patroon (aantal gematchte zichtbare meshes): huid ' + ', '.join(str(dek['huid'].get(p, 0)) for p, _ in HUID) + ' | uitzondering ' + ', '.join(str(dek['uit'].get(p, 0)) for p, _, _ in UITZONDERING))
    for soort, p in zonder:
        print(f'METING MISLUKT: {soort} zonder mesh: {p}')
    if not stralen_ok:
        print('METING MISLUKT: raycaster-controle wijkt af of er is geen huid geraakt | json:', jp)
    if not meting_ok:
        print('json:', jp); return 2
    print(('GROEN' if r['ok'] else 'ROOD') + f" | {round(time.time() - t0, 1)} s | json: {jp}")
    return 0 if r['ok'] else 1


if __name__ == '__main__':
    try:
        sys.exit(main())
    except SystemExit:
        raise
    except Exception as e:
        import traceback; traceback.print_exc(); print('METING MISLUKT:', e); sys.exit(2)
