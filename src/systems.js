/* ===================== systems.js: koeling en luchtinlaat, uitlaat, brandstof, elektra en de samenstelling van de auto ===================== */
// Alles wat aan de motor of de startmotor hangt begint op ENG_PORTS.* (via ENG2CAR) of DRV_PORTS.starterTerminal.
// Plaatsen die de bronnen niet geven (accu links voor, tank onder de achterbank, einddemper links achter, ECU op het schutbord)
// zijn aangenomen en staan zo in de beschrijving (docs/onderzoek/beslissingen.md, besluit 12).
std('sysHose', 0x1b1d20, 0, 0.8);
std('sysBattery', 0x2c3947, 0, 0.55);
std('sysCable', 0xa3201f, 0, 0.7);                              // pluskabel en poolkap: rood
std('sysWire', 0x16181b, 0, 0.75);                              // massakabels en kabelboom: zwart
std('sysTank', 0x555c64, 0.5, 0.6);                             // stalen tank, gelakt
std('sysLine', 0x34383d, 0, 0.7);                               // kunststof brandstof- en dampleiding
std('sysDemper', 0x4a4642, 0.35, 0.88);                         // dempers: donker, ruw plaatstaal

const sysE = (port, d = 0) => ENG2CAR(portAt(port, d));         // punt op afstand d buiten een aansluiting (autoframe)
const sysM = p => ENG2CAR(p);                                   // punt in het motorframe naar het autoframe
const sysPlus = (p, a, b, c) => [p[0] + a, p[1] + b, p[2] + c];
const sysLerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const sysPart = (name, geo, mat, p, d, ex, o) => P(name, geo, mat, Object.assign({ d, p, ex }, o || {}));
function sysDir(a, b) { return V3(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize(); }
function sysAt(p, t, k) { return [p[0] + t.x * k, p[1] + t.y * k, p[2] + t.z * k]; }
// buis langs een lijn van punten; het aantal stukken volgt de lengte, zodat lange leidingen niet te zwaar worden
function sysTube(pts, r, rad = 8, step = 0.03) {
  let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]);
  return tube(pts, r, clamp(Math.ceil(len / step), 8, 120), rad);
}
// slangklem (hoseClamp uit core.js, met stelschroef) om een slang of pijp met straal r; as langs t (eenheidsvector), schuift bij uitklappen langs out
function sysClamp(name, at, t, r, out) {
  const o = out || t;
  return P(name, hoseClamp('z', r + 0.0035, { screw: true }), MAT.steel, { d: 'Slangklem van verzinkt staal met een stelschroef; klemt de slang vast op de aansluiting.', p: at, q: quatFromTo(V3(0, 0, 1), t), ex: [o.x * 0.05, o.y * 0.05 + 0.02, o.z * 0.05] });
}
// slang als groep: slang plus klemmen. pts in het autoframe; de uiteinden liggen op de aansluitingen.
function sysHoseG(name, d, pts, r, o = {}) {
  const n = pts.length, t0 = sysDir(pts[0], pts[1]), t1 = sysDir(pts[n - 1], pts[n - 2]);
  const kids = [P('Slang', sysTube(pts, r, o.rad || 8, o.step || 0.03), o.mat || MAT.sysHose, { d: o.dh || 'Slang van versterkt rubber; volgt de route tussen beide aansluitingen.', ex: o.hex || [0, 0.06, 0] })];
  if (o.c0 !== false) kids.push(sysClamp(o.n0 || 'Klem begin', sysAt(pts[0], t0, 0.016), t0, r, t0.clone().negate()));
  if (o.c1 !== false) kids.push(sysClamp(o.n1 || 'Klem eind', sysAt(pts[n - 1], t1, 0.016), t1, r, t1.clone().negate()));
  return A(name, { d, spec: o.spec, ex: o.ex || [0, 0.1, 0] }, kids);
}

/* ============================ koeling en luchtinlaat ============================ */
function buildCooling() {
  const tO = ENG_PORTS.thermostatOut, wI = ENG_PORTS.waterPumpIn, thr = ENG_PORTS.throttleIn;
  const RY = 0.495, RZ = 1.545;                  // hartlijn van het koelblok; het koelpakket loopt van z 1,44 (ventilator) tot 1,575 (frontmodule)
  // ---------- radiateur ----------
  const coreGeo = cache('sysRadCore', () => merge([G.box(0.52, 0.22, 0.03), ...[-0.08, -0.04, 0, 0.04, 0.08].map(y => xf(G.box(0.52, 0.003, 0.034), [0, y, 0]))]));
  const radiateur = A('Radiateur', { d: 'Neerwaarts stromende radiateur met aluminium blok en kunststof waterkasten boven en onder, tussen de frontmodule en de koelventilator (opbouw schematisch; afmetingen geschat).', ex: [0, 0, 0.2] }, [
    sysPart('Koelblok', coreGeo, MAT.alu, [0, RY, RZ], 'Aluminium blok met buisjes en lamellen waar de lucht doorheen stroomt.', [0, 0, 0.08]),
    sysPart('Bovenste waterkast', G.rbox(0.56, 0.05, 0.05, 0.01), MAT.plastic, [0, 0.63, RZ], 'Kunststof waterkast boven op het blok; hier komt de warme koelvloeistof van de bovenste slang binnen.', [0, 0.12, 0]),
    sysPart('Onderste waterkast', G.rbox(0.56, 0.05, 0.05, 0.01), MAT.plastic, [0, 0.36, RZ], 'Kunststof waterkast onder het blok; de afgekoelde vloeistof gaat hier naar de onderste slang.', [0, -0.12, 0]),
    sysPart('Inlaatstomp', G.cyl('z', 0.0185, 0.0185, 0.045, 12), MAT.plastic, [-0.20, 0.63, RZ - 0.0475], 'Aansluiting van de bovenste radiateurslang op de bovenste waterkast.', [0, 0.06, -0.1]),
    sysPart('Uitlaatstomp', G.cyl('z', 0.0185, 0.0185, 0.045, 12), MAT.plastic, [-0.20, 0.36, RZ - 0.0475], 'Aansluiting van de onderste radiateurslang op de onderste waterkast.', [0, -0.06, -0.1]),
    sysPart('Overloopstomp', G.cyl('x', 0.007, 0.007, 0.03, 8), MAT.plastic, [-0.295, 0.63, RZ], 'Kleine stomp op de rechterkant van de bovenste waterkast voor de slang naar het expansievat.', [-0.1, 0.04, 0]),
    sysPart('Aftapkraan', merge([G.cyl('y', 0.008, 0.008, 0.026, 10), xf(G.box(0.03, 0.008, 0.008), [0, -0.016, 0])]), MAT.plastic, [0.22, 0.3225, RZ], 'Kraan onder in de onderste waterkast om de koelvloeistof af te tappen.', [0, -0.1, 0]),
    sysPart('Ontluchtingsschroef', G.cyl('y', 0.007, 0.007, 0.02, 8), MAT.bearing, [-0.10, 0.664, RZ], 'Schroef boven in de bovenste waterkast om lucht uit het koelcircuit te laten ontsnappen.', [0, 0.12, 0]),
    sysPart('Ophangrubbers', cache('sysRadMounts', () => merge([-1, 1].map(s => merge([xf(G.cyl('y', 0.011, 0.011, 0.018, 12), [s * 0.26, 0, 0]), xf(G.cyl('y', 0.005, 0.005, 0.03, 8), [s * 0.26, 0.012, 0])])))), MAT.rubber, [0, 0.675, RZ + 0.02], 'Twee rubber ophangpennen waarmee de radiateur boven in de frontmodule rust.', [0, 0.14, 0.05]),
    sysPart('Steunblokken', cache('sysRadBlocks', () => merge([-1, 1].map(s => xf(G.box(0.04, 0.02, 0.04), [s * 0.2, 0, 0])))), MAT.rubber, [0, 0.32, RZ], 'Twee rubber steunblokken onder de radiateur in de frontmodule.', [0, -0.14, 0.04]),
  ]);
  // ---------- koelventilator met kap ----------
  const FY = 0.50, FZ = 1.485;
  const shroudGeo = cache('sysShroud', () => {
    const s = shapeOf(rrectPts(0.52, 0.20, 0.012, 2)); s.holes.push(circlePath(0, 0, 0.092));
    return merge([xf(extrude(s, 0.01, 16), [0, 0, 0.027]), xf(G.box(0.52, 0.012, 0.07), [0, 0.094, -0.003]), xf(G.box(0.52, 0.012, 0.07), [0, -0.094, -0.003]),
      xf(G.box(0.012, 0.2, 0.07), [0.254, 0, -0.003]), xf(G.box(0.012, 0.2, 0.07), [-0.254, 0, -0.003]), xf(G.cyl('z', 0.097, 0.097, 0.04, 24, true), [0, 0, 0.01])]);
  });
  const spokes = cache('sysFanSpokes', () => merge([0, 1, 2, 3].map(k => { const a = k * HALF + PI / 4; return xf(G.box(0.008, 0.065, 0.01), [0.065 * Math.cos(a), 0.065 * Math.sin(a), 0], [0, 0, a - HALF]); })));
  const ventilator = A('Koelventilator', { d: 'Elektrische koelventilator in een kunststof kap tegen de achterkant van de radiateur; trekt lucht door het blok bij stilstand en lage snelheid en wordt via een relais ingeschakeld (aantal ventilatoren niet gevonden, een gekozen).', ex: [0, 0, -0.34] }, [
    sysPart('Ventilatorkap', shroudGeo, MAT.plastic, [0, FY, FZ], 'Kap die de luchtstroom door het hele koelblok leidt en de ventilator draagt.', [0, 0, 0.0], { ex: [0, 0, 0.05] }),
    sysPart('Ventilatorwaaier', merge([blades(5, 0.032, 0.088, 0.02, 0.004, 0.5, 'z'), G.cyl('z', 0.034, 0.034, 0.03, 16)]), MAT.plastic, [0, FY, FZ + 0.01], 'Vijfbladige waaier van kunststof.', [0, 0, 0.14]),
    sysPart('Ventilatormotor', G.cyl('z', 0.034, 0.034, 0.05, 18), MAT.darkSteel, [0, FY, FZ - 0.03], 'Gelijkstroommotor in het midden van de kap; drijft de waaier rechtstreeks aan.', [0, 0, -0.14]),
    sysPart('Motorsteunen', spokes, MAT.plastic, [0, FY, FZ - 0.012], 'Vier spaken die de ventilatormotor in de kap dragen.', [0, 0, -0.07]),
    sysPart('Ventilatorstekker', G.box(0.03, 0.022, 0.02), MAT.plastic, [0.20, FY - 0.08, FZ - 0.05], 'Stekker met de voeding van de ventilatormotor.', [0.05, -0.08, -0.1]),
  ]);
  // ---------- expansievat ----------
  const EV = [-0.41, 0.60, 1.458];               // rechts naast het koelpakket, onder de kap, boven de rechter langsligger; z 1,458 houdt het vat 5 mm achter de stofkap van de rechter koplamp (B-028)
  const vatGeo = cache('sysVat', () => merge([G.rbox(0.10, 0.12, 0.11, 0.015), xf(G.cyl('y', 0.025, 0.025, 0.03, 16), [0, 0.075, 0]), xf(G.cyl('x', 0.006, 0.006, 0.02, 8), [0.06, 0.02, 0.04]), xf(G.cyl('z', 0.006, 0.006, 0.02, 8), [0, 0.02, -0.065])]));
  const expansie = A('Expansievat', { d: 'Doorzichtig kunststof expansievat met min- en maxmarkering; vangt de uitzetting van de koelvloeistof op en houdt het systeem onder druk. Plaats rechts voor naast het koelpakket aangenomen.', ex: [-0.2, 0.18, 0] }, [
    sysPart('Vat', vatGeo, MAT.tank, EV, 'Vat met de niveaumarkering voor koelvloeistof, met stompen voor de overloopslang en de ontluchtingsslang.', [-0.05, 0, 0]),
    sysPart('Expansiedop', merge([G.cyl('y', 0.03, 0.03, 0.014, 16), xf(G.box(0.05, 0.008, 0.012), [0, 0.011, 0])]), MAT.plastic, [EV[0], EV[1] + 0.097, EV[2]], 'Drukdop met overdrukklep op de vulhals van het expansievat.', [0, 0.14, 0]),
    sysPart('Vathouder', merge([xf(G.box(0.11, 0.012, 0.12), [0, 0, 0]), xf(G.box(0.012, 0.15, 0.02), [0, -0.075, 0.03])]), MAT.darkSteel, [EV[0], EV[1] - 0.066, EV[2]], 'Beugel die het expansievat op de rechter langsligger vasthoudt.', [0, -0.12, 0]),
  ]);
  // ---------- koelslangen ----------
  const Tp = sysE(tO, 0), T1 = sysE(tO, 0.04), Wp = sysE(wI, 0), W1 = sysE(wI, 0.03);
  const sIn = [-0.20, 0.63, RZ - 0.06], sOut = [-0.20, 0.36, RZ - 0.06];
  const dTop = sysPlus(T1, 0.04, 0.0, 0.12);
  const hoseTop = sysHoseG('Bovenste radiateurslang', 'Voert de warme koelvloeistof van het thermostaathuis naar de bovenste waterkast van de radiateur. Loopt van de motor naar voren langs het expansievat.',
    [Tp, T1, sysPlus(T1, 0.002, 0.012, 0.055), dTop, sysPlus(sysLerp(dTop, sIn, 0.5), 0, 0.012, 0), sIn], 0.02, { n0: 'Klem thermostaathuis', n1: 'Klem radiateur', rad: 10, ex: [0, 0.16, 0.08] });
  const w2 = sysPlus(W1, 0.012, -0.012, 0.04);
  const hoseBot = sysHoseG('Onderste radiateurslang', 'Brengt de afgekoelde vloeistof van de onderste waterkast terug naar de aanvoer van de waterpomp.',
    [Wp, W1, w2, sysLerp(w2, sOut, 0.6), sOut], 0.02, { n0: 'Klem waterpomp', n1: 'Klem radiateur', rad: 10, ex: [0, -0.14, 0.1] });
  // kachelslangen: lopen achter over de motor naar de doorvoer in het schutbord (schutbord op z 0,866; slangen eindigen op 4 cm ervoor)
  const S0 = sysM([tO.p[0] + 0.03, tO.p[1] - 0.012, tO.p[2] - 0.04]), R0 = sysM([tO.p[0] + 0.065, tO.p[1] - 0.03, tO.p[2] - 0.015]);
  const HX = [-0.17, -0.125], HY = 0.675, HZ = 0.935;
  const hoseHeatA = sysHoseG('Kachelslang aanvoer', 'Voert warme koelvloeistof van de motor naar de kachelradiateur achter het schutbord.',
    [S0, sysPlus(S0, 0.005, 0.07, -0.01), [-0.27, 0.793, 1.20], [-0.24, 0.795, 1.10], [-0.205, 0.78, 1.01], [-0.18, 0.71, 0.955], [HX[0], HY + 0.003, HZ]], 0.0095, { n0: 'Klem motor', c1: false, ex: [0, 0.12, -0.1] });
  const hoseHeatR = sysHoseG('Kachelslang retour', 'Brengt de afgekoelde vloeistof van de kachelradiateur terug naar het koelcircuit.',
    [R0, sysPlus(R0, 0.008, 0.07, 0.012), [-0.235, 0.785, 1.23], [-0.205, 0.785, 1.10], [-0.17, 0.78, 1.01], [-0.14, 0.71, 0.955], [HX[1], HY + 0.003, HZ]], 0.0095, { n0: 'Klem motor', c1: false, ex: [0, 0.16, -0.1] });
  const verwarming = A('Kachelslangen', { d: 'De twee slangen tussen het koelcircuit en de kachelradiateur achter het schutbord, met de doorvoer door het schutbord.', ex: [0, 0.1, -0.1] }, [
    hoseHeatA, hoseHeatR,
    sysPart('Doorvoer kachel', merge([...HX.map(x => xf(G.cyl('z', 0.0085, 0.0085, 0.06, 10), [x, HY, 0])), xf(G.rbox(0.09, 0.05, 0.008, 0.003), [(HX[0] + HX[1]) / 2, HY, -0.026])]), MAT.alu, [0, 0, 0.908], 'Twee aluminium stompen van de kachelradiateur die door het schutbord steken, met een rubber doorvoerplaat.', [0, 0, 0.1]),
  ]);
  const OV = sysPlus(EV, 0.0, 0.02, 0.04);
  const slangOverloop = P('Overloopslang', sysTube([[-0.31, 0.63, RZ], [-0.335, 0.632, RZ - 0.01], [OV[0] + 0.05, OV[1], OV[2] + 0.005]], 0.0065, 6, 0.02), MAT.sysHose, { d: 'Dunne slang tussen de overloopstomp van de radiateur en het expansievat; het vat vangt de vloeistof op die bij het opwarmen uitzet.', ex: [-0.04, 0.1, 0.06] });
  const slangOntlucht = P('Ontluchtingsslang', sysTube([sysPlus(Tp, -0.015, -0.005, 0.02), [-0.36, 0.665, 1.35], [-0.385, 0.652, 1.37], [EV[0], EV[1] + 0.025, EV[2] - 0.075]], 0.0065, 6, 0.02), MAT.sysHose, { d: 'Dunne slang van het thermostaathuis naar het expansievat; voert damp en lucht uit het koelcircuit af.', ex: [-0.08, 0.14, -0.04] });
  const slangen = A('Koelslangen', { d: 'De slangen van het koelcircuit: boven- en onderslang naar de radiateur, de kachelslangen en de slangen naar het expansievat. Elke slang zit met klemmen op zijn aansluiting.', ex: [0, 0.16, 0.1] }, [hoseTop, hoseBot, verwarming, slangOverloop, slangOntlucht]);
  // ---------- luchtinlaat: huis boven de ventilator, aanzuigmond achter de bovenbalk van de frontmodule ----------
  const AX = 0.22, AZ = 1.395;                   // hart van het luchtfilterhuis (x 0,165 tot 0,275, z 1,29 tot 1,50)
  const sluitClips = cache('sysAirClips', () => merge([-1, 1].map(s => xf(G.box(0.006, 0.05, 0.016), [s * 0.058, 0, 0]))));
  const hoseAir = sysHoseG('Luchtslang gasklep', 'Voert de gefilterde lucht van het luchtfilterhuis naar het gasklephuis op het inlaatspruitstuk.',
    [sysE(thr, 0), sysE(thr, 0.02), sysE(thr, 0.065)], 0.02, { n0: 'Klem gasklep', c1: false, ex: [0.1, 0.1, 0] });
  const luchtfilter = A('Luchtfilter', { d: 'Luchtfilterhuis met papieren element boven de koelventilator, de aanzuigmond achter de bovenbalk van de frontmodule en de slang naar het gasklephuis. Geen luchtmassameter in de bronnen gevonden; plaats van het huis aangenomen.', ex: [0.15, 0.3, 0.2] }, [
    sysPart('Luchtfilterhuis', merge([G.rbox(0.11, 0.05, 0.21, 0.012), xf(G.cyl('x', 0.0225, 0.0225, 0.035, 12), [-0.0725, 0.005, 0.0]), xf(G.cyl('z', 0.022, 0.022, 0.03, 12), [0, 0, 0.11])]), MAT.plastic, [AX, 0.655, AZ], 'Onderbak van het luchtfilter met de stomp naar het gasklephuis en de aanzuigstomp aan de voorkant.', [0, -0.1, 0]),
    sysPart('Luchtfilterelement', cache('sysAirEl', () => merge([G.rbox(0.098, 0.016, 0.19, 0.004), ...[-0.035, 0, 0.035].map(x => xf(G.box(0.005, 0.01, 0.18), [x, 0.011, 0]))])), MAT.filter, [AX, 0.688, AZ], 'Geplisseerd papieren filterelement.', [0, 0.1, 0]),
    sysPart('Luchtfilterdeksel', G.rbox(0.11, 0.034, 0.21, 0.012), MAT.plastic, [AX, 0.713, AZ], 'Deksel van het luchtfilterhuis; met twee veerclips op de onderbak geklemd.', [0, 0.2, 0]),
    sysPart('Sluitclips', sluitClips, MAT.steel, [AX, 0.69, AZ], 'Twee veerclips die het deksel op de onderbak klemmen.', [0, 0.14, 0.1]),
    sysPart('Luchtfilterhuis voeten', cache('sysAirFeet', () => merge([1.32, 1.45].map(z => xf(G.cyl('y', 0.01, 0.01, 0.03, 10), [0, 0, z - AZ])))), MAT.rubber, [AX, 0.615, AZ], 'Twee rubber voeten waarmee het huis op de carrosserie rust.', [0, -0.12, 0]),
    sysPart('Inlaattemperatuursensor', merge([G.cyl('y', 0.007, 0.007, 0.02, 8), xf(G.box(0.02, 0.014, 0.02), [0, 0.014, 0])]), MAT.plastic, [AX + 0.04, 0.737, AZ - 0.04], 'Meet de temperatuur van de aangezogen lucht.', [0, 0.1, 0]),
    P('Aanzuigkanaal', sysTube([[AX, 0.655, 1.49], [AX, 0.662, 1.505], [AX, 0.676, 1.522], [AX, 0.686, 1.54], [AX, 0.686, 1.555]], 0.022, 10, 0.02), MAT.plastic, { d: 'Kunststof kanaal dat koude buitenlucht achter de bovenbalk van de frontmodule opvangt en naar het luchtfilterhuis leidt.', ex: [0, 0.06, 0.2] }),
    sysPart('Aanzuigmond', G.lathe('z', [[0.022, 0], [0.026, 0.006], [0.0285, 0.014], [0.029, 0.02]], 20, 'sysAirMouth'), MAT.plastic, [AX, 0.686, 1.55], 'Trompetvormige aanzuigmond die lucht uit de ruimte achter de grille opvangt.', [0, 0.04, 0.24]),
    hoseAir,
  ]);
  return A('Koeling en luchtinlaat', { d: 'Koelpakket (radiateur en elektrische koelventilator), expansievat, koelslangen met de kachelslangen en het luchtinlaattraject. Geen intercooler en geen airconditioning: die staan niet in de Twist-uitrusting.', spec: [['Koelvloeistof in het systeem', '4,0 l (50/50 ethyleenglycol)']], ex: [0, 0.25, 1.2] },
    [radiateur, ventilator, expansie, slangen, luchtfilter]);
}

/* ============================ uitlaatsysteem ============================ */
// Pijpen onder de vloer op PY (bodemvrijheid circa 16 cm, geschat); de vloer ligt er op 0,215 tot 0,235. Einddemper links achter aangenomen:
// de tankklep zit rechts, dus de uitlaat links; foto's van de eigenaar kunnen dat omkeren.
function sysOvalGeo(key, hw, hh, bodyLen, dome) {
  return cache(key, () => merge([xf(G.cyl('z', 1, 1, bodyLen, 28), [0, 0, 0], [0, 0, 0], [hw, hh, 1]), xf(G.sphere(1, 14), [0, 0, bodyLen / 2], [0, 0, 0], [hw, hh, dome]), xf(G.sphere(1, 14), [0, 0, -bodyLen / 2], [0, 0, 0], [hw, hh, dome])]));
}
function sysHanger(name, d, x, yLow, z, ex) {
  const yTop = YB(z) + 0.0015, len = yTop - yLow;
  return P(name, merge([xf(G.cyl('y', 0.009, 0.009, len, 10), [0, len / 2, 0]), xf(G.box(0.036, 0.004, 0.026), [0, -0.002, 0]), xf(G.cyl('y', 0.012, 0.012, 0.003, 10), [0, len - 0.0015, 0])]), MAT.rubber, { d, p: [x, yLow, z], ex });
}
function buildExhaust() {
  const E = sysE(ENG_PORTS.exhaustOut, 0), xE = E[0], yE = E[1], zE = E[2];
  const PY = 0.18, R = 0.021;
  const xC = xE + 0.03, zC0 = zE - 0.115;         // voorpijp wordt horizontaal op x xC; de katalysator begint op zC0
  const zC1 = zC0 - 0.24;                         // einde katalysator
  // ---------- voorpijp met flexstuk ----------
  const flexGeo = cache('sysFlex', () => { const pts = [[0.021, 0.006]]; for (let i = 0; i < 6; i++) { const y = -i * 0.0105; pts.push([0.0245, y - 0.0025], [0.029, y - 0.005], [0.0245, y - 0.0075]); } pts.push([0.021, -0.07]); return G.lathe('y', pts, 16, 'sysFlexL'); });
  const flens = merge([G.box(0.075, 0.01, 0.06), ...[-1, 1].map(s => xf(hexBolt(0.02, 0.008, 'y'), [s * 0.027, -0.005, 0]))]);
  const voor = [[xE, yE - 0.085, zE], [xE, yE - 0.16, zE - 0.003], [xE + 0.002, 0.32, zE - 0.014], [xE + 0.01, 0.245, zE - 0.045], [xE + 0.022, 0.2, zE - 0.075], [xC, PY, zE - 0.10], [xC, PY, zC0 + 0.01]];
  const voorpijp = A('Voorpijp met flexstuk', { d: 'Voorpijp van het uitlaatspruitstuk (achterzijde van de motor) naar de katalysator, met een flexibel stuk dat de bewegingen van de motor opvangt. Loopt van de motorruimte onder het schutbord door.', ex: [0, -0.2, -0.3] }, [
    sysPart('Flens voorpijp', flens, MAT.steel, [xE, yE - 0.005, zE], 'Tweegatsflens met pakking tegen de uitlaatflens van het spruitstuk.', [0, 0.08, 0]),
    sysPart('Flexstuk', flexGeo, MAT.steel, [xE, yE - 0.011, zE], 'Stalen golfbalg tussen spruitstuk en voorpijp; vangt het schommelen van de dwarsgeplaatste motor op.', [0, 0.04, 0.1]),
    P('Voorpijp', sysTube(voor, R, 12, 0.03), MAT.exhaust, { d: 'Stalen pijp die van de flexibele balg omlaag en daarna naar achteren loopt, naar de ingang van de katalysator.', ex: [0, -0.1, 0] }),
  ]);
  // ---------- katalysator met twee lambdasondes ----------
  const sonde = (name, d, base, dir, cEnd, ex, via) => {
    const t = V3(...dir).normalize(), q = quatFromTo(V3(0, 1, 0), t), tip = sysAt(base, t, 0.058);
    return A(name, { d, ex }, [
      sysPart('Sondelichaam', cache('sysSonde', () => merge([G.cyl('y', 0.0045, 0.0045, 0.02, 8), xf(hexNut('y', 0.0105, 0.007), [0, 0.022, 0]), xf(G.cyl('y', 0.0065, 0.0065, 0.03, 10), [0, 0.04, 0])])), MAT.steel, base, 'Verwarmde zuurstofsonde met zeskantmoer, ingeschroefd in de pijp.', [t.x * 0.1, t.y * 0.1, t.z * 0.1], { q }),
      P('Sondekabel', sysTube([tip, ...(via || [sysLerp(tip, cEnd, 0.4), cEnd])], 0.002, 5, 0.02), MAT.sysWire, { d: 'Dunne signaal- en verwarmingskabel van de sonde naar de stekker.', ex: [t.x * 0.15, t.y * 0.15 + 0.03, t.z * 0.15] }),
      sysPart('Sondestekker', G.box(0.014, 0.02, 0.014), MAT.plastic, cEnd, 'Stekker van de sonde op de kabelboom.', [t.x * 0.2, t.y * 0.2 + 0.05, t.z * 0.2]),
    ]);
  };
  // de kabel van de voorste sonde loopt voor het stuurhuis langs omhoog naar de stekker op het eind van de motorkabelboom (ENG_O2PLUG)
  const plugV = sysM(ENG_O2PLUG);
  const sondeVoor = sonde('Lambdasonde voor', 'Zuurstofsonde in de voorpijp, voor de katalysator: meet het zuurstofgehalte voor de mengselregeling (OBD). Een van de twee sondes uit het handboek; de stekker zit op de motorkabelboom. Plaats op de pijp geschat.', [xE + 0.0125, 0.245, zE - 0.045], [0.7, 0.7, 0], plugV, [0.1, 0.1, 0],
    [[xE + 0.08, 0.33, zE - 0.017], [xE + 0.10, 0.37, zE - 0.002], [plugV[0] - 0.02, plugV[1] - 0.045, plugV[2] - 0.002], [plugV[0], plugV[1] - 0.01, plugV[2]]]);
  const sondeNa = sonde('Lambdasonde na', 'Zuurstofsonde achter de katalysator: controleert of de katalysator werkt (OBD). Plaats op de pijp geschat.', [xC + 0.015, PY + 0.012, zC1 - 0.06], [0.8, 0.5, 0], [xC + 0.1, 0.205, zC1 - 0.12], [0.1, 0.05, 0]);
  const cat = A('Katalysator', { d: 'Driewegkatalysator onder het schutbord, met een lambdasonde ervoor en een erachter. Zet CO, koolwaterstoffen en NOx om. Euro 3 volgens het handboek; de Autowereld-vermelding E2 is niet bevestigd, daarom geen kengetal.', ex: [0, -0.3, -0.5] }, [
    sysPart('Inlaatconus', G.lathe('z', [[0.021, 0], [0.0225, -0.004], [0.036, -0.05]], 20, 'sysCatIn'), MAT.steel, [xC, PY, zC0], 'Conus die de voorpijp verwijdt naar de katalysatorbehuizing.', [0, 0, 0.1]),
    sysPart('Katalysatorhuis', G.cyl('z', 0.036, 0.036, 0.14, 24), MAT.steel, [xC, PY, zC0 - 0.05 - 0.07], 'Stalen behuizing om de keramische monoliet.', [0, -0.08, 0]),
    sysPart('Monoliet', G.cyl('z', 0.032, 0.032, 0.13, 18), MAT.ceramic, [xC, PY, zC0 - 0.05 - 0.07], 'Keramische honingraat met edelmetaalcoating waar de uitlaatgassen overheen stromen.', [0, 0.1, 0], { inner: true }),
    sysPart('Steunmat', annulus(0.032, 0.0355, 0.13, 'z', 24), MAT.filter, [xC, PY, zC0 - 0.05 - 0.07], 'Uitzettende mat die de monoliet beschermt tegen trillingen en hitte.', [0, -0.1, 0], { inner: true }),
    sysPart('Uitlaatconus', G.lathe('z', [[0.036, 0], [0.0225, -0.05]], 20, 'sysCatOut'), MAT.steel, [xC, PY, zC0 - 0.19], 'Conus die de katalysatorbehuizing aansluit op de middenpijp.', [0, 0, -0.1]),
    sondeVoor, sondeNa,
  ]);
  // ---------- middenpijp: bocht naar links ----------
  const X_T = 0.30, zM = -0.62;
  const mp = []; for (let i = 0; i <= 10; i++) { const z = zC1 - 0.01 - i * ((zC1 - 0.01 - (zM + 0.24)) / 10), t = i / 10, s = t * t * (3 - 2 * t); mp.push([xC + (X_T - xC) * s, PY, z]); }
  const clampGeo = cache('sysPipeClamp', () => merge([G.torus('z', R + 0.005, 0.003, 14, 5), xf(G.box(0.018, 0.008, 0.012), [0, R + 0.01, 0]), xf(hexBolt(0.016, 0.006, 'x'), [-0.009, R + 0.012, 0])]));
  const midPijp = A('Middenpijp', { d: 'Pijp van de katalysator naar de middendemper; buigt onder de vloer naar de linkerkant van de auto.', ex: [0.1, -0.3, 0] }, [
    P('Pijp', sysTube(mp, R, 12, 0.04), MAT.exhaust, { d: 'Stalen pijp onder de vloer, ongeveer 42 mm (maat geschat).', ex: [0, -0.1, 0] }),
    sysPart('Uitlaatklem', clampGeo, MAT.steel, mp[0], 'Beugelklem die de middenpijp op de katalysator klemt.', [0, -0.08, 0.05]),
  ]);
  // ---------- middendemper en einddemper ----------
  const MH = 0.085, MV = 0.033;
  const mid = A('Middendemper', { d: 'Eerste demper, onder de vloer links voor de tank, in lengte opgebouwd uit twee kamers. Plaats aangenomen.', ex: [0.2, -0.4, 0] }, [
    sysPart('Dempermantel', sysOvalGeo('sysMidBody', MH, MV, 0.30, 0.04), MAT.sysDemper, [X_T, PY, zM], 'Ovale plaatstalen mantel met twee afgeronde eindkappen.', [0.1, -0.08, 0]),
    sysPart('Demperpijpen', cache('sysMidPipes', () => merge([xf(G.cyl('z', R, R, 0.13, 12), [0, 0, 0.18]), xf(G.cyl('z', R, R, 0.13, 12), [0, 0, -0.18])])), MAT.exhaust, [X_T, PY, zM], 'Ingaande en uitgaande pijp, aan de eindkappen gelast.', [0, 0, 0.12]),
    sysPart('Demperschotten', cache('sysMidBaffles', () => merge([-0.06, 0.06].map(z => xf(G.cyl('z', 1, 1, 0.004, 24), [0, 0, z], [0, 0, 0], [MH - 0.005, MV - 0.004, 1])))), MAT.steel, [X_T, PY, zM], 'Twee schotten met gaten die het geluid in kamers verdelen.', [0, 0.1, 0], { inner: true }),
  ]);
  const zE0 = zM - 0.24, zEnd = -1.46;
  const verb = [[X_T, PY, zE0 - 0.005], [X_T, PY, -1.0], [X_T, PY + 0.005, -1.12], [X_T, PY + 0.015, -1.20], [X_T, 0.20, zEnd + 0.22]];
  const verbinding = A('Verbindingspijp', { d: 'Rechte pijp van de middendemper naar de einddemper, onder de tank langs aan de linkerkant; stijgt aan het eind iets.', ex: [0.2, -0.3, -0.3] }, [
    P('Pijp', sysTube(verb, R, 12, 0.05), MAT.exhaust, { d: 'Stalen pijp, ongeveer 42 mm (maat geschat).', ex: [0, -0.1, 0] }),
    sysPart('Uitlaatklem', clampGeo, MAT.steel, verb[0], 'Beugelklem op de uitgaande pijp van de middendemper.', [0, -0.08, 0.05]),
  ]);
  const EH = 0.10, EV2 = 0.042;
  const eind = A('Einddemper', { d: 'Tweede demper achter de achteras, links achter onder de bumper. De zijde is aangenomen (tankklep rechts); foto\'s van de onderkant kunnen dit omkeren.', ex: [0.3, -0.4, -0.5] }, [
    sysPart('Dempermantel', sysOvalGeo('sysEndBody', EH, EV2, 0.26, 0.04), MAT.sysDemper, [X_T, 0.20, zEnd], 'Grote ovale plaatstalen mantel met afgeronde eindkappen.', [0.1, -0.08, 0]),
    sysPart('Demperpijpen', cache('sysEndPipes', () => merge([xf(G.cyl('z', R, R, 0.1, 12), [0, 0, 0.17]), xf(G.cyl('z', R, R, 0.1, 12), [0, 0, -0.17])])), MAT.exhaust, [X_T, 0.20, zEnd], 'Ingaande pijp en uitgaande pijp, aan de eindkappen gelast.', [0, 0, -0.12]),
    sysPart('Demperschotten', cache('sysEndBaffles', () => merge([-0.07, 0, 0.07].map(z => xf(G.cyl('z', 1, 1, 0.004, 24), [0, 0, z], [0, 0, 0], [EH - 0.005, EV2 - 0.004, 1])))), MAT.steel, [X_T, 0.20, zEnd], 'Drie schotten met gaten die het geluid dempen.', [0, 0.1, 0], { inner: true }),
    sysPart('Uitlaateindstuk', cache('sysTip', () => merge([G.cyl('z', 0.026, 0.026, 0.03, 20), xf(G.cyl('z', 0.0235, 0.0235, 0.031, 20, true), [0, 0, 0])])), MAT.exhaust, [X_T, 0.20, zEnd - 0.24], 'Kaal stalen eindstuk dat net onder de achterbumper uitkomt.', [0, -0.05, -0.2]),
  ]);
  // ---------- ophangrubbers ----------
  const zH = 0.30, tH = Math.max(0, Math.min(1, (zC1 - 0.01 - zH) / (zC1 - 0.01 - (zM + 0.24)))), xH = xC + (X_T - xC) * tH * tH * (3 - 2 * tH);
  const ophanging = A('Ophanging', { d: 'Rubber ophangingen waarmee het hele uitlaatsysteem onder de vloer hangt, zodat trillingen niet doorkomen in de carrosserie. Plaatsen en aantal geschat.', ex: [0, 0.2, 0] }, [
    sysHanger('Ophangrubber voorpijp', 'Rubber ophanging onder de vloer op de bocht van de middenpijp.', xH, PY + R, zH, [0, 0.12, 0]),
    sysHanger('Ophangrubber middendemper voor', 'Rubber ophanging aan de zijkant van de middendemper, voor.', X_T + MH + 0.015, PY + 0.01, zM + 0.1, [0.08, 0.12, 0]),
    sysHanger('Ophangrubber middendemper achter', 'Rubber ophanging aan de zijkant van de middendemper, achter.', X_T + MH + 0.015, PY + 0.01, zM - 0.1, [0.08, 0.12, 0]),
    sysHanger('Ophangrubber verbindingspijp', 'Rubber ophanging op de verbindingspijp onder de tank.', X_T, PY + R, -1.02, [0, 0.12, 0]),
    sysHanger('Ophangrubber einddemper voor', 'Rubber ophanging aan de zijkant van de einddemper, voor.', X_T + EH + 0.015, 0.205, zEnd + 0.09, [0.08, 0.12, 0]),
    sysHanger('Ophangrubber einddemper achter', 'Rubber ophanging aan de zijkant van de einddemper, achter.', X_T + EH + 0.015, 0.205, zEnd - 0.09, [0.08, 0.12, 0]),
  ]);
  // ---------- hitteschilden onder de vloer ----------
  const plate = (w, len) => merge([G.box(w, 0.003, len), xf(G.box(0.003, 0.014, len), [w / 2 - 0.0015, -0.0085, 0]), xf(G.box(0.003, 0.014, len), [-w / 2 + 0.0015, -0.0085, 0]), ...[-0.3, 0, 0.3].map(f => xf(G.box(w - 0.02, 0.004, 0.006), [0, 0.0035, len * f * 0.5]))]);
  const schilden = A('Hitteschilden', { d: 'Aluminium hitteschilden tussen de hete delen en de vloer, zodat de bodemplaat en de tank niet te heet worden.', ex: [0, 0.15, 0] }, [
    // schuin achter de voorpijp, onder het stuurhuis (bovenrand y 0,39; het stuurhuis begint op 0,398): van (y 0,25; z 0,924) tot (y 0,39; z 0,9635), 35 mm achter de pijp (B-029)
    sysPart('Hitteschild voorpijp', cache('sysShieldFront', () => merge([G.box(0.12, 0.1455, 0.003), ...[-0.04, 0, 0.04].map(x => xf(G.box(0.006, 0.135, 0.005), [x, 0, 0.003]))])), MAT.heat, [xE + 0.01, 0.32, zE - 0.058], 'Aluminium plaat schuin achter de voorpijp, onder het stuurhuis; houdt de hitte van de pijp weg van het stuurhuis en het schutbord.', [0, 0, -0.1], { r: [Math.atan2(0.0395, 0.14), 0, 0] }),
    sysPart('Hitteschild katalysator', plate(0.13, 0.26), MAT.heat, [xC, 0.2195, zC0 - 0.12], 'Geribd aluminium schild boven de katalysator, direct onder de vloer.', [0, 0.1, 0]),
    sysPart('Hitteschild middendemper', plate(0.2, 0.40), MAT.heat, [X_T, 0.2155, zM], 'Geribd aluminium schild boven de middendemper, direct onder de vloer.', [0, 0.1, 0]),
    sysPart('Hitteschild einddemper', plate(0.24, 0.36), MAT.heat, [X_T, 0.2485, zEnd], 'Geribd aluminium schild boven de einddemper.', [0, 0.1, 0]),
  ]);
  return A('Uitlaatsysteem', { d: 'Uitlaat vanaf de achterzijde van de motor: voorpijp met flexstuk, driewegkatalysator met twee lambdasondes, middendemper en einddemper links achter, met ophangrubbers en hitteschilden onder de vloer. Plaatsen van de dempers zijn aangenomen.', ex: [0.4, -1.5, -0.6] },
    [voorpijp, cat, midPijp, mid, verbinding, eind, ophanging, schilden]);
}

/* ============================ brandstofsysteem ============================ */
// Tank onder de achterbank, achter de dwarsbalk (aangenomen, besluit 12); de toevoer loopt links onder de vloer naar de motorruimte,
// de dampleiding rechts. Alle leidingen beginnen of eindigen op een poort via ENG2CAR.
function buildFuel() {
  const fr = ENG_PORTS.fuelRailIn, evp = ENG_PORTS.evapPurge;
  const TX = -0.13, TY = 0.1375, TZ = -0.92, TW = 0.64, TH = 0.085, TD = 0.60;   // tank: x -0,45 tot 0,19, y 0,095 tot 0,18, z -0,62 tot -1,22 (golf 2: 3,5 cm lager en 2 cm naar links: de remleiding, de handremkabels en de achterasbout liepen erdoor)
  // ---------- tank ----------
  const strap = z => merge([xf(G.box(TW, 0.004, 0.04), [0, -TH / 2 - 0.002, z]), ...[-1, 1].map(s => xf(G.box(0.004, TH + 0.02, 0.04), [s * (TW / 2 + 0.002), 0.01, z])), ...[-1, 1].map(s => xf(G.box(0.03, 0.004, 0.04), [s * (TW / 2 + 0.017), TH / 2 + 0.008, z]))]);
  const tank = A('Brandstoftank', { d: 'Platte stalen tank van 35 l onder de achterbank, tussen de achterwielkasten en voor de torsiebalk. Plaats aangenomen; de inhoud is bevestigd.', spec: [['Inhoud', '35 l']], ex: [0, -0.5, 0] }, [
    sysPart('Tankhuis', G.rbox(TW, TH, TD, 0.02), MAT.sysTank, [TX, TY, TZ], 'Gelaste stalen tank met schotten tegen klotsen; plat gebouwd om onder de achterbank te passen.', [0, -0.08, 0]),
    sysPart('Spanband voor', strap(0.18), MAT.darkSteel, [TX, TY, TZ], 'Stalen spanband die de tank aan de vloer houdt, voor.', [0, -0.2, 0.05]),
    sysPart('Spanband achter', strap(-0.18), MAT.darkSteel, [TX, TY, TZ], 'Stalen spanband die de tank aan de vloer houdt, achter.', [0, -0.2, -0.05]),
    sysPart('Tankstomp vulhals', merge([G.cyl('z', 0.027, 0.027, 0.03, 14), xf(G.cyl('x', 0.007, 0.007, 0.03, 8), [0.02, 0.012, 0.01])]), MAT.sysTank, [-0.40, 0.15, -1.235], 'Stomp op de achterkant van de tank voor de vulpijp, met een kleine stomp voor de ontluchting.', [0, 0, -0.1]),
  ]);
  // ---------- brandstofpomp met niveaumeter, in de tank (niet van buiten te zien) ----------
  const PX = -0.20, PZ = -0.85;
  const pomp = A('Brandstofpomp', { d: 'Elektrische brandstofpomp in de tank met de niveaumeter, voorfilter en stekker. De pomp zit in de tank onder de achterbank, bereikbaar via de flens boven op de tank; motor, zeef en niveaumeter zitten er helemaal in.', ex: [0, 0.3, 0] }, [
    sysPart('Pompflens', merge([G.cyl('y', 0.05, 0.05, 0.006, 24), xf(G.cyl('y', 0.012, 0.012, 0.014, 10), [0.02, 0.008, 0])]), MAT.darkSteel, [PX, 0.183, PZ], 'Ronde flens boven op de tank met de leidingaansluiting en de stekker.', [0, 0.2, 0]),
    sysPart('Pompmotor', merge([G.cyl('y', 0.028, 0.028, 0.07, 18), xf(G.cyl('y', 0.012, 0.012, 0.04, 10), [0.0, 0.025, 0])]), MAT.steel, [PX, 0.135, PZ], 'Gelijkstroommotor met rollenpomp, hangend in de tank.', [0, 0.05, 0], { inner: true }),
    sysPart('Zeef', G.box(0.07, 0.012, 0.05), MAT.filter, [PX, 0.105, PZ], 'Zeef op de zuigmond die vuil uit de tank houdt.', [0, -0.1, 0], { inner: true }),
    A('Niveaumeter', { d: 'Vlotter op een arm met een glijweerstand; geeft het brandstofniveau door aan de brandstofmeter in het dashboard.', ex: [0.1, 0, 0], inner: true }, [
      P('Vlotterarm', sysTube([[PX + 0.03, 0.165, PZ], [PX + 0.06, 0.135, PZ + 0.02], [PX + 0.12, 0.12, PZ + 0.06]], 0.0018, 5, 0.02), MAT.steel, { d: 'Dunne metalen arm die op en neer draait met het niveau.', ex: [0.05, 0.05, 0] }),
      sysPart('Vlotter', G.sphere(0.014, 10), MAT.red, [PX + 0.12, 0.117, PZ + 0.06], 'Kunststof vlotter die op de brandstof drijft.', [0.08, 0, 0.05]),
    ]),
    sysPart('Pompstekker', G.box(0.03, 0.02, 0.02), MAT.plastic, [PX + 0.02, 0.195, PZ], 'Stekker van de pomp en de niveaumeter.', [0, 0.1, 0]),
  ]);
  // ---------- vulsysteem: van de tankklep (achter het rechter achterscherm) naar de tank ----------
  const [k0, k1] = bodTkZ, [y0, y1] = bodTkY, ym = (y0 + y1) / 2, xs = surfX(k1, ym), zm = (k0 + k1) / 2;
  const xk = -(xs - 0.06);                       // voorvlak van de tankkom
  const neck = [[-(xs - 0.09), ym, zm], [-(xs - 0.12), ym - 0.01, zm - 0.01], [-0.60, 0.69, -1.52], [-0.62, 0.62, -1.575], [-0.62, 0.45, -1.58], [-0.60, 0.32, -1.578], [-0.55, 0.255, -1.57], [-0.48, 0.235, -1.52], [-0.42, 0.18, -1.42], [-0.40, 0.165, -1.31]];
  const vulslang = sysHoseG('Vulslang', 'Korte rubber slang tussen de stalen vulpijp en de stomp op de tank; vangt de beweging van de tank op.', [[-0.40, 0.165, -1.31], [-0.40, 0.155, -1.27], [-0.40, 0.15, -1.225]], 0.027, { n0: 'Klem vulpijp', n1: 'Klem tank', ex: [0, -0.1, -0.05] });
  const vul = A('Vulsysteem', { d: 'Vulpijp van de opening in het rechter achterscherm (achter de tankklep) langs de achterkant van het wiel onder de vloer naar de tank, met de tankdop, een rubber vulslang en een ontluchtingsslang.', ex: [-0.3, -0.2, -0.3] }, [
    sysPart('Vulhals', G.lathe('-x', [[0.02, 0], [0.027, 0.014], [0.03, 0.03]], 20, 'sysFillNeck'), MAT.steel, [-(xs - 0.09), ym, zm], 'Trechtervormige vulhals achter de tankklep, in de tankkom.', [-0.1, 0, 0]),
    sysPart('Tankdop', merge([G.cyl('x', 0.026, 0.026, 0.018, 20), xf(G.box(0.012, 0.06, 0.012), [-0.008, 0, 0])]), MAT.plastic, [xk - 0.012, ym, zm], 'Dop van de vulhals; de onderdruk in de tank wordt via een klepje in de dop geregeld.', [-0.2, 0.05, 0]),
    P('Vulpijp', sysTube(neck, 0.02, 10, 0.03), MAT.sysTank, { d: 'Stalen vulpijp die achter het wiel langs naar beneden en onder de vloer naar de tank loopt.', ex: [-0.08, -0.1, -0.1] }),
    vulslang,
    P('Ontluchtingsslang vulpijp', sysTube(neck.slice(2).map(p => sysPlus(p, 0.035, 0, 0.03)).concat([[-0.41, 0.18, -1.215], [-0.40, 0.19, -1.2]]), 0.006, 6, 0.04), MAT.sysHose, { d: 'Dunne slang die de lucht uit de tank naar de bovenkant van de vulpijp voert, zodat de tank sneller vol kan.', ex: [0.05, 0, -0.05] }),
  ]);
  // ---------- brandstofleiding: toevoer links van het midden onder de vloer, over de bak naar de verdeelleiding ----------
  const FX = -0.20, FY = 0.207;
  const toevoer = [[FX, 0.17, -0.62], [FX, 0.205, -0.55], [FX, FY, -0.3], [FX, FY, 0.5], [FX, FY, 0.78], [FX, 0.215, 0.86], [FX, 0.30, 0.90], [FX, 0.45, 0.915], [FX, 0.575, 0.92], [-0.10, 0.575, 0.92], [0.0, 0.575, 0.92], [0.22, 0.575, 0.93], [0.22, 0.572, 1.2], [0.2, 0.58, 1.36], [0.15, 0.60, 1.375], sysE(fr, 0.05), sysE(fr, 0.015), sysE(fr, 0)];
  const clipsAt = [[FX, FY, -0.1], [FX, FY, 0.4], [FX, FY, 0.75], [FX, 0.45, 0.915]];
  const leidingen = A('Brandstofleidingen', { d: 'Toevoerleiding van de tank naar de verdeelleiding op de motor, met het brandstoffilter onder de vloer. Een retourleiding is niet gemodelleerd: de uitvoering is niet gevonden.', ex: [-0.2, -0.1, 0.2] }, [
    sysPart('Brandstoffilter', merge([G.cyl('z', 0.019, 0.019, 0.1, 18), xf(G.cyl('z', 0.011, 0.011, 0.14, 10), [0, 0, 0])]), MAT.steel, [FX, 0.17, -0.5], 'Cilindervormig filter in de leiding onder de vloer dat vuil uit de brandstof houdt.', [0, -0.1, 0]),
    sysPart('Filterbeugel', merge([G.box(0.05, 0.004, 0.06), xf(G.box(0.004, 0.03, 0.06), [0, 0.017, 0])]), MAT.darkSteel, [FX, 0.205, -0.5], 'Beugel die het filter aan de vloer houdt.', [0, 0.1, 0]),
    P('Toevoerleiding', sysTube(toevoer, 0.0035, 5, 0.04), MAT.sysLine, { d: 'Dunne kunststof leiding van het filter langs de vloer, het schutbord en over de bak naar de verdeelleiding. Loopt links van het midden, naast de uitlaat.', ex: [0, 0.1, 0.1] }),
    sysPart('Leidingclips', cache('sysClips', () => merge(clipsAt.map(p => xf(G.box(0.016, 0.01, 0.016), [p[0], p[1] + 0.006, p[2]])))), MAT.plastic, [0, 0, 0], 'Kunststof clips die de leiding aan de vloer en het schutbord vasthouden.', [0, 0.08, 0]),
    sysPart('Koppeling verdeelleiding', merge([G.cyl('x', 0.007, 0.007, 0.03, 8), xf(G.cyl('x', 0.01, 0.01, 0.008, 8), [0.015, 0, 0])]), MAT.plastic, sysE(fr, 0.015), 'Snelkoppeling op de aansluiting van de verdeelleiding.', [0.1, 0.04, 0]),
  ]);
  // ---------- koolstoffilter (EVAP) en dampleiding naar de inlaat ----------
  const CX = -0.35, CY = 0.172, CZ = -0.50;
  const dampPad = [[-0.29, CY, CZ + 0.05], [-0.30, 0.205, -0.35], [-0.33, 0.207, -0.2], [-0.34, 0.207, 0.3], [-0.34, 0.207, 0.78], [-0.35, 0.215, 0.86], [-0.34, 0.30, 0.90], [-0.33, 0.45, 0.925],
    [-0.32, 0.58, 0.99], [-0.37, 0.72, 1.03], [-0.39, 0.793, 1.10], [-0.39, 0.795, 1.20], [-0.38, 0.79, 1.30], [-0.25, 0.775, 1.36], [-0.15, 0.755, 1.40], [-0.10, 0.74, 1.417]];
  const evap = A('Koolstoffilter', { d: 'Koolstoffilter (EVAP) dat benzinedamp uit de tank opvangt en bij het rijden naar de inlaat laat afzuigen via een spoelklep. Plaats voor de tank aangenomen.', ex: [-0.3, -0.3, 0.3] }, [
    sysPart('Canisterhuis', merge([G.cyl('x', 0.04, 0.04, 0.2, 20), ...[-1, 1].map(s => xf(G.cyl('x', 0.043, 0.043, 0.008, 20), [s * 0.1, 0, 0]))]), MAT.plastic, [CX, CY, CZ], 'Zwart kunststof huis met actieve kool voor het opvangen van benzinedamp.', [0, -0.08, 0]),
    sysPart('Koolgranulaat', G.cyl('x', 0.036, 0.036, 0.18, 14), MAT.sysWire, [CX, CY, CZ], 'Actieve kool die de dampen bindt.', [0, 0.1, 0], { inner: true }),
    sysPart('Canisterpoorten', merge([xf(G.cyl('z', 0.006, 0.006, 0.03, 8), [-0.06, 0, -0.045]), xf(G.cyl('z', 0.006, 0.006, 0.03, 8), [0.06, 0, 0.05]), xf(G.cyl('y', 0.008, 0.008, 0.02, 8), [0.0, -0.045, 0])]), MAT.plastic, [CX, CY, CZ], 'Aansluitingen voor de dampleiding van de tank, de spoelleiding naar de inlaat en de ontluchting.', [0, 0, 0.1]),
    sysPart('Canisterbeugel', merge([G.box(0.2, 0.004, 0.03), xf(G.box(0.004, 0.05, 0.03), [0.1, 0.025, 0]), xf(G.box(0.004, 0.05, 0.03), [-0.1, 0.025, 0])]), MAT.darkSteel, [CX, CY - 0.043, CZ], 'Stalen beugel die het canisterhuis aan de vloer vasthoudt.', [0, -0.12, 0]),
    P('Dampleiding tank', sysTube([[CX - 0.06, CY, CZ - 0.06], [CX - 0.06, 0.175, -0.58], [CX - 0.06, 0.175, -0.625]], 0.005, 6, 0.02), MAT.sysLine, { d: 'Korte slang van de tank naar het koolstoffilter.', ex: [-0.04, 0, -0.05] }),
    P('Spoelleiding', sysTube(dampPad, 0.005, 6, 0.04), MAT.sysLine, { d: 'Dunne dampleiding van het koolstoffilter rechts langs de vloer, het schutbord en over de rechterkant van de motor naar de spoelklep op de inlaat.', ex: [-0.1, 0.1, 0.1] }),
    sysPart('Spoelklep', merge([G.cyl('y', 0.013, 0.013, 0.05, 12), xf(G.cyl('x', 0.006, 0.006, 0.02, 8), [0.013, 0.012, 0])]), MAT.plastic, sysPlus(sysE(evp, 0), 0, 0.025, 0), 'Magneetklep die de dampen gestuurd door de regeleenheid naar de inlaat laat stromen; zit op de aansluiting evapPurge van de motor.', [0, 0.12, 0]),
  ]);
  return A('Brandstofsysteem', { d: 'Tank van 35 l onder de achterbank met pomp en niveaumeter, vulpijp naar de opening in het rechter achterscherm, brandstoffilter en toevoerleiding naar de motor, en het koolstoffilter (EVAP) met de spoelleiding. Plaatsen aangenomen.', ex: [-0.75, -0.95, -0.3] },
    [tank, pomp, vul, leidingen, evap]);
}

/* ============================ elektrisch systeem ============================ */
// Accu links voor, tussen luchtfilterhuis en wielkast, dicht bij de startmotor (contract hoofdstuk 4: rechts voor of links boven de bak).
function buildElectrical() {
  const ST = sysM(DRV_PORTS.starterTerminal);
  const BX = 0.40, BY = 0.59, BZ = 1.443;        // hart van de accu: x 0,305 tot 0,495, y 0,50 tot 0,68, z 1,378 tot 1,508 (B-028: 22 mm naar achteren, 10 mm achter de stofkap van de linker koplamp)
  const BP = [BX - 0.065, 0.695, BZ - 0.04], BN = [BX + 0.065, 0.695, BZ - 0.04];
  // ---------- accu ----------
  const lidGeo = cache('sysBatLid', () => merge([G.box(0.19, 0.008, 0.13), ...[-3, -2, -1, 0, 1, 2].map(i => xf(G.cyl('y', 0.009, 0.009, 0.006, 10), [i * 0.028 + 0.014, 0.007, 0.03]))]));
  const accu = A('Accu', { d: 'Onderhoudsarme accu met houder, klemmen en spanbeugel, links voor in de motorruimte naast het luchtfilterhuis (zijde in de bronnen niet gevonden, aangenomen). Inhoud en type niet gevonden.', ex: [0.25, 0.3, 0.2] }, [
    sysPart('Accublok', G.rbox(0.19, 0.18, 0.13, 0.008), MAT.sysBattery, [BX, BY, BZ], 'Kunststof accublok met zes cellen.', [0, 0.05, 0]),
    sysPart('Accudeksel', lidGeo, MAT.sysBattery, [BX, 0.684, BZ], 'Deksel met de ontluchtingsdoppen.', [0, 0.2, 0]),
    sysPart('Pluspool', merge([G.cyl('y', 0.009, 0.0075, 0.016, 12), xf(G.cyl('y', 0.011, 0.011, 0.008, 12), [0, 0.01, 0])]), MAT.sysCable, [BP[0], 0.692, BP[2]], 'Pluspool met rode poolkap.', [-0.05, 0.25, 0]),
    sysPart('Minpool', G.cyl('y', 0.009, 0.0075, 0.016, 12), MAT.sysWire, [BN[0], 0.692, BN[2]], 'Minpool met zwarte poolkap.', [0.05, 0.25, 0]),
    sysPart('Accuhouder', merge([G.box(0.2, 0.01, 0.14), xf(G.box(0.01, 0.2, 0.02), [-0.06, -0.105, 0.0])]), MAT.darkSteel, [BX, 0.495, BZ], 'Stalen plaat met opstaande rand waarop de accu staat, op een steun van de linker langsligger (links voor).', [0, -0.15, 0]),
    sysPart('Accusteun', merge([G.box(0.012, 0.115, 0.02), xf(G.box(0.05, 0.004, 0.03), [0, -0.0575, 0])]), MAT.darkSteel, [BX + 0.02, 0.4325, BZ - 0.015], 'Steun tussen de linker langsligger en de accuhouder.', [0, -0.2, 0]),
    sysPart('Spanbeugel', cache('sysBatBar', () => merge([xf(G.box(0.012, 0.006, 0.15), [0, 0.0, 0]), ...[-1, 1].map(s => xf(G.cyl('y', 0.004, 0.004, 0.19, 6), [0, -0.095, s * 0.073]))])), MAT.steel, [BX, 0.692, BZ], 'Brug over de accu met twee spanstangen aan de houder; houdt de accu vast.', [0, 0.35, 0]),
  ]);
  // ---------- accukabels ----------
  const GBend = sysM([GB_X + 0.05, 0.125, 0.12]);
  const pluskabel = P('Pluskabel', sysTube([BP, [BP[0] - 0.01, 0.712, BP[2]], [0.298, 0.705, BP[2]], [0.29, 0.68, BP[2]], [0.29, 0.5, BP[2]], [0.29, 0.43, 1.395], sysPlus(ST, 0.012, 0.016, 0.012), ST], 0.0075, 8, 0.03), MAT.sysCable, { d: 'Dikke rode pluskabel van de accu naar de aansluiting op de startmotor (DRV_PORTS.starterTerminal); loopt tussen het luchtfilterhuis en de accu omlaag.', ex: [0, 0.1, 0.05] });
  const massaMotor = P('Massakabel motor', sysTube([BN, [BN[0] + 0.01, 0.71, 1.39], [0.505, 0.69, 1.37], [0.50, 0.60, 1.36], [0.46, 0.53, 1.352], [0.38, 0.50, 1.345], GBend], 0.0065, 8, 0.03), MAT.sysWire, { d: 'Zwarte massakabel van de minpool naar de bak (en daarmee de motor); loopt langs de achterkant van de accu.', ex: [0.1, 0.1, -0.05] });
  const massaBody = P('Massakabel carrosserie', sysTube([BN, [BN[0] + 0.012, 0.712, BN[2]], [0.505, 0.70, 1.408], [0.515, 0.64, 1.418], [0.52, 0.57, 1.43], [0.53, 0.545, 1.44]], 0.0065, 8, 0.03), MAT.sysWire, { d: 'Zwarte massakabel van de minpool naar het massapunt op de binnenwand van het linker voorscherm.', ex: [0.15, 0.1, 0] });
  const schoenen = sysPart('Kabelschoenen', cache('sysLugs', () => merge([BP, BN, ST, GBend, [0.53, 0.545, 1.44]].map(p => xf(G.cyl('x', 0.011, 0.011, 0.006, 10), p)))), MAT.chrome, [0, 0, 0], 'Vertinde kabelschoenen op de accupolen, de startmotor, de bak en het massapunt.', [0, 0.1, 0.05]);
  const kabels = A('Accukabels', { d: 'De pluskabel naar de startmotor en de massakabels naar de bak en de carrosserie.', ex: [0.2, 0.2, 0.1] }, [pluskabel, massaMotor, massaBody, schoenen]);
  // ---------- zekeringkast en relais (rechts op het schutbord) ----------
  const FBx = -0.43, FBy = 0.61, FBz = 0.95;
  const fuseGeo = cache('sysFuses', () => merge([-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5].map(i => xf(G.box(0.01, 0.018, 0.004), [i * 0.0125, 0, 0]))));
  const zekeringkast = A('Zekeringkast', { d: 'Zekeringkast met relaisplaats in de motorruimte op het schutbord, rechts voor het stuurhuis. Plaats aangenomen (links of rechts niet gevonden).', ex: [-0.25, 0.25, -0.1] }, [
    sysPart('Zekeringkast huis', G.rbox(0.12, 0.10, 0.07, 0.008), MAT.plasticGrey, [FBx, FBy, FBz], 'Kunststof kast met de zekeringen en de aansluiting van de kabelboom.', [0, 0, 0.05]),
    sysPart('Zekeringkast deksel', G.box(0.12, 0.012, 0.07), MAT.plastic, [FBx, FBy + 0.056, FBz], 'Deksel met de zekeringindeling; klikt op de kast.', [0, 0.12, 0]),
    sysPart('Zekeringen', fuseGeo, MAT.amber, [FBx, FBy + 0.01, FBz + 0.037], 'Rij steekzekeringen op de voorkant van de kast.', [0, 0.05, 0.1]),
    sysPart('Hoofdzekering', G.box(0.03, 0.025, 0.02), MAT.red, [FBx + 0.045, FBy - 0.045, FBz + 0.045], 'Smeltveiligheid van de hoofdvoeding.', [0.05, 0, 0.1]),
    sysPart('Zekeringkast steun', merge([G.box(0.14, 0.12, 0.004), xf(G.box(0.14, 0.004, 0.03), [0, -0.06, 0.017])]), MAT.darkSteel, [FBx, FBy, FBz - 0.037], 'Steunplaat tegen het schutbord.', [0, 0, -0.08]),
  ]);
  const relayBox = G.box(0.026, 0.03, 0.03);
  const relais = A('Relais', { d: 'Relaisbank onder de zekeringkast: hoofdrelais, brandstofpomprelais, koelventilatorrelais en claxonrelais.', ex: [-0.2, -0.1, 0.1] }, [
    sysPart('Relaisbeugel', G.box(0.13, 0.004, 0.04), MAT.darkSteel, [FBx, 0.475, 0.935], 'Beugel met vier relaisvoeten.', [0, -0.1, 0]),
    ...[['Hoofdrelais', 'Steekrelais dat de hoofdvoeding van de motorregeleenheid en de injectie inschakelt.'],
      ['Relais brandstofpomp', 'Steekrelais dat de brandstofpomp in de tank van stroom voorziet; de regeleenheid schakelt het.'],
      ['Relais koelventilator', 'Steekrelais dat de elektrische koelventilator inschakelt als de koelvloeistof te warm wordt.'],
      ['Relais claxon', 'Steekrelais dat de stroom naar de claxon schakelt als de claxonknop wordt ingedrukt.']]
      .map(([n, d], i) => sysPart(n, relayBox, MAT.plastic, [FBx - 0.045 + i * 0.03, 0.492, 0.935], d, [0, 0.1 + i * 0.02, 0.05])),
  ]);
  // ---------- motorregeleenheid ----------
  const EX_ = 0.12, EY_ = 0.67, EZ_ = 0.945;
  const ecu = A('Motorregeleenheid', { d: 'Motorregeleenheid (ECU) voor inspuiting en ontsteking op het schutbord, midden in de motorruimte. De plaats is aangenomen; de bronnen geven motorruimte of onder het dashboard.', ex: [0, 0.3, -0.2] }, [
    sysPart('ECU behuizing', merge([G.rbox(0.20, 0.14, 0.04, 0.006), ...[-0.06, -0.03, 0, 0.03, 0.06].map(x => xf(G.box(0.006, 0.12, 0.008), [x, 0, 0.022]))]), MAT.ecu, [EX_, EY_, EZ_], 'Aluminium behuizing met koelribben.', [0, 0.1, 0.05]),
    sysPart('ECU stekker', G.box(0.07, 0.05, 0.03), MAT.plastic, [EX_, EY_ - 0.03, EZ_ + 0.035], 'Grote stekker van de kabelboom op de regeleenheid.', [0, -0.05, 0.12]),
    sysPart('ECU beugel', merge([G.box(0.22, 0.15, 0.004), ...[-1, 1].map(s => xf(G.box(0.02, 0.02, 0.012), [s * 0.115, 0.07, 0.004]))]), MAT.darkSteel, [EX_, EY_, EZ_ - 0.022], 'Steunplaat van de regeleenheid tegen het schutbord.', [0, 0, -0.1]),
  ]);
  // ---------- kabelboom op hoofdlijnen ----------
  const trunk = [[FBx + 0.03, FBy + 0.06, FBz], [FBx + 0.03, 0.74, 0.94], [FBx + 0.03, 0.80, 0.935], [-0.2, 0.80, 0.935], [0.0, 0.80, 0.935], [0.2, 0.80, 0.935], [0.38, 0.80, 0.935], [0.40, 0.79, 0.99], [0.40, 0.775, 1.10], [0.40, 0.76, 1.22], [0.40, 0.735, 1.31], [0.395, 0.715, 1.375]];
  const fan = [[0.205, 0.42, 1.435], [0.25, 0.425, 1.44], [0.32, 0.43, 1.45], [0.36, 0.44, 1.44], [0.385, 0.46, 1.40], [0.385, 0.50, 1.38], [0.385, 0.60, 1.38], [0.395, 0.70, 1.385]];
  const cabin = [[FBx, 0.50, 0.915], [FBx, 0.50, 0.872], [FBx, 0.49, 0.80], [-0.40, 0.44, 0.72], [-0.30, 0.33, 0.68], [-0.1, 0.25, 0.66], [0.2, 0.24, 0.66], [0.45, 0.24, 0.66]];
  const rear = [[0.45, 0.24, 0.66], [0.48, 0.24, 0.5], [0.48, 0.24, 0.0], [0.48, 0.24, -0.6], [0.48, 0.24, -1.0], [0.48, 0.26, -1.3], [0.49, 0.40, -1.5], [0.52, 0.65, -1.60]];
  const kabelboom = A('Kabelboom', { d: 'Hoofdlijnen van de kabelboom: de motorruimte (van de zekeringkast over het schutbord naar de accu), de tak naar de koelventilator, de tak door het schutbord de cabine in en de achterste boom langs de linkerdorpel naar de achterlichten. Schematisch; geen losse draden.', ex: [0, 0.4, 0] }, [
    P('Kabelboom motorruimte', sysTube(trunk, 0.012, 8, 0.03), MAT.sysWire, { d: 'Dikke bundel zwarte kabels met tape en gaas; loopt langs de bovenkant van het schutbord naar links en dan langs de linkerwielkast naar de accu.', ex: [0, 0.2, 0.05] }),
    P('Kabelboom koelventilator', sysTube(fan, 0.005, 6, 0.03), MAT.sysWire, { d: 'Tak van de kabelboom van de stekker van de koelventilator naar de motorruimteboom bij de accu.', ex: [0.1, 0.1, 0.1] }),
    P('Kabelboom cabine', sysTube(cabin, 0.014, 8, 0.04), MAT.sysWire, { d: 'Deel van de boom dat door een rubber doorvoer in het schutbord de cabine ingaat en laag onder het dashboard naar links loopt.', ex: [0, -0.1, -0.2] }),
    P('Kabelboom achter', sysTube(rear, 0.008, 6, 0.04), MAT.sysWire, { d: 'Achterste boom langs de linkerdorpel naar de achterlichten en de kentekenverlichting.', ex: [0.1, 0, -0.3] }),
    sysPart('Stekkers kabelboom', cache('sysPlugs', () => merge([trunk[trunk.length - 1], cabin[cabin.length - 1], rear[rear.length - 1], [FBx + 0.03, FBy + 0.06, FBz]].map(p => xf(G.box(0.022, 0.022, 0.03), p)))), MAT.plastic, [0, 0, 0], 'Stekkers op de uiteinden van de hoofdlijnen.', [0, 0.15, 0]),
  ]);
  // ---------- claxon ----------
  const CLx = -0.50, CLy = 0.46, CLz = 1.50;
  const claxon = A('Claxon', { d: 'Elektrische claxon (schijftoeter) rechts voor naast het expansievat, bevestigd aan de rechter langsligger. Aantal toeters niet gevonden; een aangenomen.', ex: [-0.3, -0.1, 0.3] }, [
    sysPart('Claxontoeter', merge([G.cyl('z', 0.045, 0.045, 0.03, 24), xf(G.lathe('z', [[0.045, 0], [0.036, 0.03], [0.026, 0.05]], 24, 'sysHornCone'), [0, 0, 0.015]), xf(G.cyl('z', 0.014, 0.014, 0.035, 10), [0, 0, -0.03])]), MAT.darkSteel, [CLx, CLy, CLz], 'Schijftoeter met membraan; geeft het signaal als de claxon wordt ingedrukt.', [0, 0, 0.12]),
    sysPart('Claxonbeugel', merge([G.box(0.1, 0.006, 0.05), xf(G.box(0.006, 0.035, 0.05), [0.04, -0.0175, 0])]), MAT.darkSteel, [CLx + 0.04, CLy - 0.05, CLz], 'Beugel die de toeter aan de rechter langsligger houdt.', [0.05, -0.12, 0]),
  ]);
  // ---------- ruitensproeierreservoir met pomp ----------
  const WX = 0.555, WY = 0.40, WZ = 1.49;
  const sproeier = A('Ruitensproeier', { d: 'Reservoir met pomp voor de ruitensproeiers, links voor achter het voorscherm. Een slang loopt omhoog naar de spuitmonden in de motorkap. Plaats aangenomen.', ex: [0.4, -0.1, 0.3] }, [
    sysPart('Sproeierreservoir', merge([G.rbox(0.11, 0.16, 0.12, 0.012), xf(G.cyl('y', 0.02, 0.02, 0.03, 14), [0.0, 0.095, -0.03])]), MAT.tank, [WX, WY, WZ], 'Kunststof reservoir voor sproeivloeistof, met vulhals.', [0.1, 0, 0]),
    sysPart('Reservoirdop', merge([G.cyl('y', 0.025, 0.025, 0.012, 14), xf(G.box(0.04, 0.008, 0.01), [0, 0.01, 0])]), MAT.plastic, [WX, WY + 0.122, WZ - 0.03], 'Dop op de vulhals, met een klepje.', [0, 0.15, 0]),
    sysPart('Sproeierpomp', merge([G.cyl('x', 0.014, 0.014, 0.035, 12), xf(G.cyl('x', 0.007, 0.007, 0.012, 8), [0.0, 0.0, 0.0])]), MAT.darkSteel, [WX - 0.07, WY - 0.04, WZ + 0.0], 'Kleine elektrische pomp in de zijkant van het reservoir.', [-0.1, 0, 0]),
    P('Sproeierslang', sysTube([[WX - 0.088, WY - 0.04, WZ], [0.505, 0.45, 1.50], [0.515, 0.58, 1.49], [0.52, 0.70, 1.48]], 0.0035, 6, 0.03), MAT.sysHose, { d: 'Dunne slang van de pomp omhoog langs het voorscherm naar de spuitmonden in de motorkap.', ex: [0.1, 0.15, 0] }),
    sysPart('Sproeierverdeelstuk', merge([G.cyl('x', 0.004, 0.004, 0.04, 6), xf(G.cyl('y', 0.004, 0.004, 0.02, 6), [0, 0.01, 0])]), MAT.plastic, [0.52, 0.70, 1.48], 'T-stuk dat de slang over de twee spuitmonden verdeelt.', [0.05, 0.15, 0]),
    sysPart('Reservoirbeugel', merge([G.box(0.06, 0.01, 0.1), xf(G.box(0.01, 0.1, 0.1), [0.025, 0.05, 0])]), MAT.darkSteel, [0.475, 0.33, WZ], 'Beugel die het reservoir aan de linker langsligger houdt.', [0, -0.12, 0]),
  ]);
  return A('Elektrisch systeem', { d: 'Accu met houder en klemmen, pluskabel naar de startmotor en massakabels, zekeringkast met relais, motorregeleenheid, de kabelboom op hoofdlijnen, claxon en ruitensproeier. Accu links voor naast het luchtfilterhuis; zekeringkast en regeleenheid op het schutbord (plaatsen aangenomen).', ex: [0.4, 0.6, 0.9] },
    [accu, kabels, zekeringkast, relais, ecu, kabelboom, claxon, sproeier]);
}
function buildCar() {
  // de wortel heet zoals auto.json zegt (AUTO.wortel) en heeft precies de acht hoofdgroepen, in deze volgorde
  return A(AUTO.wortel, { d: 'Suzuki Alto 1.0-16V Twist (2001), 3-deurs hatchback, in acht hoofdgroepen: carrosserie, interieur, aandrijflijn (motor G10BB, handbak, aandrijfassen en startmotor), onderstel (vooras met stuurinrichting, achteras, wielen en remmen) en de systemen koeling en luchtinlaat, uitlaat, brandstof en elektra. Vormen en plaatsen zijn schematisch. Klik op een onderdeel om het uit te klappen.' },
    [buildBody(), buildInterior(), buildPowertrain(), buildChassis(), buildCooling(), buildExhaust(), buildFuel(), buildElectrical()]);
}
