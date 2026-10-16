/* ===================== engine3.js: motor G10BB, deel 3: smering, inlaat met injectie, uitlaatspruitstuk, ontsteking, sensoren, kabelboom en buildEngine() ===================== */

/* ---------- smering ---------- */
function engBuildLube() {
  const pump = G.lathe('x', [[0.0165, -0.006], [0.0285, -0.006], [0.0285, 0.006], [0.0165, 0.006], [0.0165, -0.006]], 28, 'engOpHouse');
  const reliefBoss = G.cyl('y', 0.0065, 0.0065, 0.014, 10);
  const strainer = merge([G.box(0.075, 0.01, 0.05), xf(G.box(0.06, 0.003, 0.04), [0, 0.0065, 0])]);
  const pipe = tube([[-0.17, -0.03, 0], [-0.17, -0.085, 0], [-0.15, -0.125, 0], [-0.12, -0.16, 0]], 0.007, 24, 8);
  const filt = G.lathe('z', [[0.012, 0], [0.034, 0], [0.037, 0.004], [0.037, 0.07], [0.034, 0.077], [0, 0.077]], 24, 'engFilt');
  const elem = G.lathe('z', [[0.012, 0.005], [0.033, 0.005], [0.033, 0.07], [0.012, 0.07], [0.012, 0.005]], 20, 'engFiltEl');
  const [fx, fy] = ENG_FILT;
  const zf = 0.0985;
  return A('Smering', { d: 'Smeersysteem: oliepomp op de krukasneus achter de distributiekap, zuigkorf in het carter, oliefilter aan de voorzijde van het blok en de peilstok. Inhoud, druk en alle maten zijn voor de G10BB niet bevestigd (circa 3,6 liter olie uit een enkele bron).', ex: [0, -0.05, 0.22] }, [
    A('Oliepomp', { d: 'Rotorpomp (trochoide) op de krukasneus: zuigt olie uit het carter en perst die door het filter naar de lagers. Opbouw schematisch.', ex: [-0.12, 0, 0] }, [
      P('Oliepomphuis', pump, MAT.aluCast, { d: 'Aluminium pomphuis tegen de voorkant van het blok.', p: [-0.184, 0, 0], ex: [0, 0, 0] }),
      P('Oliepompdeksel', annulus(0.0225, 0.0285, 0.004, 'x', 28), MAT.aluCast, { d: 'Plaat die de pomp afsluit.', p: [-0.1925, 0, 0], ex: [-0.05, 0, 0] }),
      A('Pompelement', { d: 'Binnenrotor op de krukas en buitenrotor in het huis: de olie wordt tussen de rotoren verplaatst.', ex: [-0.03, 0, 0], inner: true }, [
        P('Binnenrotor', gear(5, 0.022, 0.0175, 0.01, 0.0155, 'x'), MAT.darkSteel, { d: 'Binnenrotor met vijf lobben, op de krukasneus gedreven (aantal lobben geschat).', p: [-0.184, 0, 0], ex: [-0.03, 0, 0] }),
        P('Buitenrotor', ringGear(6, 0.0275, 0.0235, 0.0205, 0.01, 'x'), MAT.darkSteel, { d: 'Buitenrotor met zes lobben.', p: [-0.184, 0, 0], ex: [-0.015, 0, 0] }),
      ]),
      P('Keerring krukas poeliezijde', annulus(0.0155, 0.0225, 0.006, 'x', 20), MAT.rubber, { d: 'Oliekeerring rond de krukasneus.', p: [-0.1935, 0, 0], ex: [-0.08, 0, 0] }),
      A('Reduceerventiel', { d: 'Overdrukventiel: begrenst de oliedruk (opbouw schematisch).', ex: [0, -0.07, 0] }, [
        P('Reduceerventielhuis', reliefBoss, MAT.aluCast, { d: 'Boring in het pomphuis voor het reduceerventiel.', p: [-0.184, -0.0215, 0], ex: [0, 0, 0] }),
        P('Reduceerventielveer', engSpring(0.004, 0.0005, 0.012, 6, 6), MAT.steel, { d: 'Veer die de plunjer sluit.', p: [-0.184, -0.0215, 0], ex: [0, -0.03, 0], inner: true }),
        P('Reduceerventielplug', G.cyl('y', 0.005, 0.005, 0.004, 8), MAT.darkSteel, { d: 'Plug die de boring afsluit.', p: [-0.184, -0.0275, 0], ex: [0, -0.06, 0] }),
      ]),
    ]),
    A('Zuigkorf met buis', { d: 'Zuigkorf met gaas in de oliebak en de buis naar de oliepomp.', ex: [0, -0.15, 0], inner: true }, [
      P('Zuigbuis', pipe, MAT.steel, { d: 'Buis van de zuigkorf naar het pomphuis.', ex: [0, 0, 0] }),
      P('Zuigkorf', strainer, MAT.steel, { d: 'Zuigkorf met fijn gaas dat vuil tegenhoudt.', p: [-0.115, -0.17, 0], ex: [0, -0.03, 0] }),
    ]),
    A('Oliefilter', { d: 'Wegwerp-schroeffilter op de voorzijde van het blok; de filtermaat is niet voor deze auto bevestigd.', ex: [0, -0.04, 0.15] }, [
      P('Filterhuis', filt, MAT.oilFilter, { d: 'Blauw gelakt plaatstalen filterhuis met rubber afdichtring.', p: [fx, fy, zf], ex: [0, 0, 0.05] }),
      P('Filterelement', elem, MAT.filter, { d: 'Papieren filterelement in het huis (schematisch).', p: [fx, fy, zf], ex: [0, 0, 0.0], inner: true }),
      P('Filterpakking', annulus(0.027, 0.036, 0.003, 'z', 24), MAT.rubber, { d: 'Rubber ring tussen filter en blok.', p: [fx, fy, zf - 0.001], ex: [0, 0, 0.02] }),
      P('Filternippel', merge([G.cyl('z', 0.0085, 0.0085, 0.05, 12)]), MAT.steel, { d: 'Draadnippel in het blok waarop het filter geschroefd wordt.', p: [fx, fy, zf + 0.0], ex: [0, 0, 0.03] }),
    ]),
    A('Peilstok', { d: 'Oliepeilstok met buis aan de voorzijde van het blok.', ex: [0.06, 0.08, 0.1] }, [
      P('Peilstokbuis', G.cyl('y', 0.0065, 0.0065, 0.225, 10), MAT.steel, { d: 'Dunwandige buis van het carter omhoog langs het blok.', p: [0.152, 0.0525, 0.0975], ex: [0, 0, 0] }),
      P('Peilstok', G.cyl('y', 0.0022, 0.0022, 0.235, 8), MAT.steel, { d: 'Stalen meetstok met merken voor minimaal en maximaal peil.', p: [0.152, 0.0575, 0.0975], ex: [0, 0.12, 0], inner: true }),
      P('Peilstokgreep', G.torus('z', 0.008, 0.0018, 16, 5), MAT.handle, { d: 'Gele greep van de peilstok.', p: [0.152, 0.1755, 0.0975], ex: [0, 0.2, 0] }),
      P('Peilstokbus', G.cyl('y', 0.009, 0.009, 0.012, 10), MAT.aluCast, { d: 'Bus in het blok waarin de peilstokbuis geperst zit.', p: [0.152, -0.02, 0.0925], ex: [0, -0.04, 0.03] }),
    ]),
  ]);
}

/* ---------- inlaatspruitstuk met gasklephuis en brandstofverdeelleiding ---------- */
function engBuildIntake() {
  const PY = ENG_PORT_Y, [, py, pz] = ENG_PLEN;
  const flShape = shapeOf(engOff(rrectPts(0.34, 0.036, 0.01), 0, PY)); ENG_XC.forEach(x => { const h = new THREE.Path(); h.absarc(x, PY, 0.0118, 0, PI * 2, true); flShape.holes.push(h); });
  const flange = front(flShape, 0.01);
  const runners = merge(ENG_XC.map(x => tube([[x, PY, 0.0917], [x, PY, 0.112], [x, PY + 0.006, 0.135], [x, 0.222, 0.153], [x, 0.24, pz]], 0.0123, 20, 8)));
  const plenum = G.lathe('x', [[0, -0.142], [0.028, -0.142], [0.032, -0.138], [0.032, 0.138], [0.028, 0.142], [0, 0.142]], 24, 'engPlenum');
  const tb = G.lathe('x', [[0.0205, 0.0], [0.036, 0.0], [0.036, 0.006], [0.027, 0.006], [0.027, 0.048], [0.0205, 0.048], [0.0205, 0.0]], 20, 'engTB');
  const thr = merge([xf(G.cyl('x', 0.0198, 0.0198, 0.002, 18), [0, 0, 0]), xf(G.box(0.01, 0.002, 0.004), [0, 0, 0])]);
  const inj = G.lathe('y', [[0, 0], [0.0095, 0], [0.0095, -0.014], [0.0075, -0.016], [0.0075, -0.05], [0.0045, -0.052], [0.0045, -0.0575], [0.003, -0.0614], [0, -0.0614]], 12, 'engInj');
  const theta = Math.atan2(0.017, 0.059);
  const injectors = ENG_XC.map((x, i) => A(`Injector ${i + 1}`, { d: `Injector van cilinder ${i + 1}: spuit brandstof tegen de inlaatkleppen (meerpuntsinspuiting, vier injectoren, handboek). Lengte en hoek zijn geschat.`, p: [x, ENG_RAIL[1], ENG_RAIL[2]], r: [theta, 0, 0], ex: [0, 0.07, 0] }, [
    P('Injectorlichaam', inj, MAT.darkSteel, { d: 'Elektromagnetisch bediend spuitventiel met stekker bovenop.', ex: [0, 0, 0] }),
    P('Injectorstekker', G.box(0.012, 0.014, 0.016), MAT.engCoil, { d: 'Stekkerhuis op de injector voor de twee draden.', p: [0, 0.006, 0.0085], ex: [0, 0.05, 0.03] }),
    P('O-ring injector boven', G.torus('y', 0.0092, 0.0014, 12, 4), MAT.rubber, { d: 'Afdichting tussen injector en verdeelleiding.', p: [0, -0.011, 0], ex: [0, 0.03, 0] }),
    P('O-ring injector onder', G.torus('y', 0.0073, 0.0014, 12, 4), MAT.rubber, { d: 'Afdichting tussen injector en inlaatpijp.', p: [0, -0.054, 0], ex: [0, -0.03, 0] }),
  ]));
  return A('Inlaatspruitstuk', { d: 'Inlaatspruitstuk met vier pijpen naar de poorten aan de voorzijde van de kop, inlaatkast, gasklephuis en brandstofverdeelleiding met vier injectoren (meerpuntsinspuiting). Materiaal, vorm en afmetingen zijn geschat.', ex: [0, 0.12, 0.25] }, [
    P('Inlaatpijpen', merge([xf(flange, [0, 0, 0.0917]), runners]), MAT.aluCast, { d: 'Flens met vier gebogen inlaatpijpen die van de poorten naar de inlaatkast lopen.', ex: [0, 0, 0] }),
    P('Pakking inlaatspruitstuk', front(flShape, 0.0008), MAT.rubber, { d: 'Pakking tussen kop en inlaatspruitstuk.', p: [0, 0, ENG_HZ + 0.0064], ex: [0, 0, -0.05] }),
    P('Inlaatkast', plenum, MAT.aluCast, { d: 'Inlaatkast (plenum): verdeelt de lucht van het gasklephuis over de vier pijpen.', p: [0, py, pz], ex: [0, 0.06, 0.04] }),
    P('Inlaatsteun', rodBetween([0, 0.232, 0.16], [0, 0.105, 0.0925], 0.0055), MAT.steel, { d: 'Steun van de inlaatkast naar het blok.', ex: [0, -0.04, 0.0] }),
    A('Gasklephuis', { d: 'Gasklephuis aan de bakzijde van de inlaatkast: de bestuurder regelt hier met de gaskabel de luchtstroom. Sensor en stationairklep horen hier ook bij.', ex: [0.12, 0, 0] }, [
      P('Gasklephuis (behuizing)', tb, MAT.aluCast, { d: 'Aluminium huis met ronde doorlaat van Ø41 mm (geschat).', p: [0.142, py, pz], ex: [0, 0, 0] }),
      P('Gasklep', thr, MAT.steel, { d: 'Ronde klep op de gasklepas, nu bijna dicht getekend.', p: [0.166, py, pz], r: [0, 0, 0.35], ex: [0, 0.03, 0] }),
      P('Gasklepas', G.cyl('z', 0.004, 0.004, 0.095, 10), MAT.steel, { d: 'Dwarse as waarop de gasklep zit.', p: [0.166, py, pz], ex: [0, 0, -0.04] }),
      P('Gaskabelarm', merge([xf(G.box(0.008, 0.026, 0.004), [0, 0.011, 0]), G.cyl('z', 0.007, 0.007, 0.004, 12)]), MAT.darkSteel, { d: 'Hefboom waaraan de gaskabel trekt.', p: [0.166, py, pz + 0.036], ex: [0, 0, 0.05] }),
      P('Terugtrekveer gasklep', engSpring(0.006, 0.0007, 0.014, 5, 6, 'z'), MAT.steel, { d: 'Veer die de klep sluit.', p: [0.166, py, pz + 0.0445], ex: [0, 0, 0.08] }),
      P('Stationairregelklep', merge([G.cyl('y', 0.012, 0.012, 0.03, 14), xf(G.box(0.014, 0.012, 0.016), [0, 0.019, 0])]), MAT.engCoil, { d: 'Luchtregelklep (IAC) voor het stationair toerental; laat lucht langs de gasklep (handboek).', p: [0.158, py + 0.035, pz], ex: [0, 0.06, 0] }),
      P('Pakking gasklephuis', annulus(0.0205, 0.034, 0.0015, 'x', 20), MAT.rubber, { d: 'Pakking tussen gasklephuis en inlaatkast.', p: [0.1415, py, pz], ex: [-0.03, 0, 0] }),
      ...[[0.0215, 0.0215], [-0.0215, 0.0215], [0.0215, -0.0215], [-0.0215, -0.0215]].map(([dy, dz], k) => P(`Bout gasklephuis ${k + 1}`, hexBolt(0.016, 0.006, '-x'), MAT.darkSteel, { d: 'Bout van het gasklephuis.', p: [0.148, py + dy, pz + dz], ex: [0.05, 0, 0] })),
    ]),
    A('Brandstofverdeelleiding', { d: 'Verdeelleiding met vier injectoren boven de inlaatpijpen. De brandstofdrukregelaar zit op de leiding; de pomp zit in de tank (handboek).', ex: [0, 0.04, 0.05] }, [
      P('Verdeelbuis', G.cyl('x', 0.0085, 0.0085, 0.26, 12), MAT.alu, { d: 'Aluminium buis waarop de vier injectoren steken (afmetingen geschat).', p: [0.01, ENG_RAIL[1], ENG_RAIL[2]], ex: [0, 0, 0] }),
      P('Brandstofaansluiting', merge([G.cyl('x', 0.0065, 0.0065, 0.05, 10), xf(G.cyl('x', 0.0085, 0.0085, 0.006, 10), [0.02, 0, 0])]), MAT.steel, { d: 'Aansluiting voor de brandstofleiding aan het einde van de verdeelleiding.', p: [0.175, ENG_RAIL[1], ENG_RAIL[2]], ex: [0.08, 0, 0] }),
      P('Brandstofdrukregelaar', merge([G.cyl('y', 0.0145, 0.0145, 0.022, 16), xf(G.cyl('y', 0.004, 0.004, 0.01, 8), [0, 0.016, 0])]), MAT.steel, { d: 'Houdt de brandstofdruk constant ten opzichte van de inlaatdruk (handboek).', p: [0.12, ENG_RAIL[1] + 0.019, ENG_RAIL[2]], ex: [0, 0.07, 0] }),
      A('Injectoren', { d: 'Vier injectoren, een per cilinder.', ex: [0, 0.05, 0.05] }, injectors),
    ]),
    A('Inlaatslangen', { d: 'Dunne rubber slangen op de inlaatkast voor ontluchting en vacuum.', ex: [0, 0.15, 0.0] }, [
      P('Spoelnippel EVAP', G.cyl('y', 0.006, 0.006, 0.014, 10), MAT.plastic, { d: 'Aansluiting voor de slang van het koolstoffilter (EVAP).', p: [0.05, py + 0.037, pz], ex: [0, 0.05, 0] }),
      P('Ontluchtingsslang', tube([[-0.09, 0.296, 0.0845], [-0.09, 0.302, 0.11], [-0.09, 0.292, 0.135]], 0.005, 20, 6), MAT.rubber, { d: 'Slang van het kleppendeksel naar de inlaatkast (carterontluchting).', ex: [0, 0.04, 0] }),
      P('Vacuumslang drukregelaar', tube([[0.12, 0.29, ENG_RAIL[2]], [0.12, 0.297, 0.14], [0.12, 0.288, 0.152]], 0.003, 16, 6), MAT.rubber, { d: 'Dunne slang van de brandstofdrukregelaar naar de inlaatkast.', ex: [0, 0.08, 0] }),
    ]),
  ]);
}

/* ---------- uitlaatspruitstuk (achterzijde) met hitteschild ---------- */
function engBuildExhaust() {
  const PY = ENG_PORT_Y, [cx, cy, cz] = ENG_COLL;
  const flShape = shapeOf(engOff(rrectPts(0.34, 0.036, 0.01), 0, PY)); ENG_XC.forEach(x => { const h = new THREE.Path(); h.absarc(x, PY, 0.0112, 0, PI * 2, true); flShape.holes.push(h); });
  const flange = xf(front(flShape, 0.01), [0, 0, -0.0917]);
  const runners = ENG_XC.map(x => tube([[x, PY, -0.0917], [x, PY, -0.115], [x + (cx - x) * 0.45, PY - 0.008, -0.15], [cx + (x - cx) * 0.2, 0.176, -0.195], [cx, cy, cz + 0.004]], 0.0118, 22, 8));
  const coll = xf(G.lathe('y', [[0, 0.172], [0.03, 0.172], [0.0185, 0.148], [0.0185, 0.144], [0.032, 0.144], [0.032, 0.138], [0, 0.138]], 24, 'engColl'), [cx, 0, cz]);
  // hitteschild: dunne gebogen plaat boven de pijpen (zijprofiel in z, y)
  const path = [[-0.082, 0.238], [-0.12, 0.241], [-0.165, 0.238], [-0.205, 0.226], [-0.236, 0.2], [-0.246, 0.17]];
  const shield = side(shapeOf([...path, ...path.slice().reverse().map(([z, y]) => [z + 0.0015, y - 0.002])]), 0.3); shield.translate(-0.03, 0, 0);
  const stud = merge([G.cyl('z', 0.004, 0.004, 0.026, 8), xf(engNut(0.01, 0.007, 'z'), [0, 0, -0.0115])]);
  return A('Uitlaatspruitstuk', { d: 'Vier-in-een spruitstuk aan de achterzijde van de kop met een verzamelaar die naar beneden de voorkatalysator ingaat, plus hitteschild. Vorm en materiaal zijn geschat.', ex: [0, 0.03, -0.25] }, [
    P('Uitlaatspruitstuk (buizen)', merge([flange, ...runners, coll]), MAT.exhaust, { d: 'Flens met vier pijpen die in een verzamelaar samenkomen; de verzamelaar eindigt in een flens naar de voorkatalysator.', ex: [0, 0, 0] }),
    P('Pakking uitlaatspruitstuk', front(flShape, 0.0008), MAT.steel, { d: 'Metalen pakking tussen kop en spruitstuk.', p: [0, 0, -(ENG_HZ + 0.0064)], ex: [0, 0, 0.05] }),
    P('Hitteschild', shield, MAT.heat, { d: 'Gebogen plaat die de hitte van het spruitstuk van de motorkap en de aanliggende onderdelen houdt.', ex: [0, 0.08, 0] }),
    P('Pakking collectorflens', annulus(0.0145, 0.032, 0.0015, 'y', 24), MAT.steel, { d: 'Pakking onder de uitlaatflens; hier sluit de voorkatalysator aan.', p: [cx, 0.1365, cz], ex: [0, -0.06, 0] }),
    A('Studs spruitstuk', { d: 'Vijf tapeinden met moeren die het spruitstuk op de kop klemmen (aantal geschat).', ex: [0, 0, -0.14] }, ENG_XM.map((x, k) => P(`Stud ${k + 1}`, stud, MAT.darkSteel, { d: 'Tapeind met moer van de uitlaatflens.', p: [x, PY, -0.0865], ex: [0, 0, -0.04] }))),
  ]);
}

/* ---------- ontsteking ---------- */
function engBuildIgnition() {
  const PSY = 0.18, yTop = ENG_COVER_TOP;
  const plug = G.lathe('y', [[0.0012, -0.003], [0.0035, -0.003], [0.0035, 0], [0.007, 0], [0.007, 0.02], [0.0092, 0.02], [0.0092, 0.028], [0.007, 0.028], [0.007, 0.03], [0, 0.03]], 12, 'engPlug');
  const ins = G.lathe('y', [[0, 0.03], [0.0062, 0.03], [0.0062, 0.07], [0.0042, 0.075], [0, 0.075]], 12, 'engPlugIns');
  const boot = G.lathe('y', [[0.0042, 0.07], [0.0085, 0.07], [0.0095, 0.074], [0.0095, 0.145], [0.0075, 0.15], [0.0045, 0.15], [0.0042, 0.07]], 14, 'engBoot');
  const bougies = ENG_XC.map((x, i) => A(`Bougie ${i + 1}`, { d: `Bougie van cilinder ${i + 1} met isolator en rubber dop; zit in een diepe bougieput naast de nokkenas. Type en maten zijn niet bevestigd.`, p: [x, PSY, ENG_PLZ], ex: [0, 0.18, 0] }, [
    P('Bougie', plug, MAT.steel, { d: 'Bougie met zeskant en elektrode.', ex: [0, -0.04, 0] }),
    P('Isolator bougie', ins, MAT.ceramic, { d: 'Keramische isolator van de bougie.', ex: [0, 0.04, 0] }),
    P('Bougiedop', boot, MAT.rubber, { d: 'Rubber dop die de hoogspanningskabel op de bougie sluit.', ex: [0, 0.12, 0] }),
  ]));
  // verdeler op de nokkenas aan de bakzijde; torens straalsgewijs op de kap (hoek vanaf boven, in het (z, y)-vlak)
  const dz = -ENG_CAMZ, dy = ENG_CAMY, ang = [-0.7, -0.25, 0.25, 0.7];
  const tip = ang.map(a => [dz + 0.044 * Math.sin(a), dy + 0.044 * Math.cos(a)]);
  const cap = merge([G.lathe('x', [[0, 0], [0.03, 0], [0.03, 0.026], [0.026, 0.03], [0, 0.03]], 20, 'engDistCap'), ...ang.map(a => xf(G.cyl('y', 0.0055, 0.0055, 0.014, 8), [0.014, 0.037 * Math.cos(a), 0.037 * Math.sin(a)], [a, 0, 0]))]);
  const cables = ENG_XC.map((x, i) => {
    const [tz, ty] = tip[i];
    return tube([[x, PSY + 0.15, ENG_PLZ], [x + 0.012, 0.345, ENG_PLZ - 0.012 * (i - 1.5)], [0.14 + 0.015 * i, 0.352, tz * 0.5], [0.205, ty + 0.012, tz], [0.219, ty, tz]], 0.0032, 40, 5);
  });
  return A('Ontsteking', { d: 'Elektronische ontsteking: ontstekingsmodule en een bobine, stroomverdeler op de nokkenas, vier hoogspanningskabels en vier bougies (handboek). Plaats, type en uitvoering zijn geschat.', ex: [0.1, 0.1, -0.1] }, [
    A('Bougies', { d: 'Vier bougies, een per cilinder, met isolator en dop.', ex: [0, 0.1, 0] }, bougies),
    A('Stroomverdeler', { d: 'Stroomverdeler met toerentalsensor op het uiteinde van de nokkenas aan de bakzijde (handboek: stroomverdeler met toerentalsensor).', ex: [0.12, 0, 0] }, [
      P('Verdelerhuis', G.lathe('x', [[0, 0], [0.026, 0], [0.026, 0.027], [0, 0.027]], 20, 'engDistHouse'), MAT.aluCast, { d: 'Aluminium huis dat tegen het uiteinde van de kop gemonteerd is.', p: [0.178, dy, dz], ex: [0, 0, 0] }),
      P('Verdelerrotor', merge([G.cyl('x', 0.004, 0.004, 0.02, 8), xf(G.box(0.004, 0.026, 0.008), [0.008, 0.013, 0])]), MAT.copper, { d: 'Verdelerarm die de hoogspanning naar de juiste bougiekabel brengt.', p: [0.2, dy, dz], ex: [0.06, 0, 0], inner: true }),
      P('Verdelerkap', cap, MAT.engCoil, { d: 'Kunststof kap met vier torens voor de bougiekabels (en een middentoren, niet getekend).', p: [0.205, dy, dz], ex: [0.07, 0, 0] }),
      P('Toerentalsensor verdeler', G.box(0.02, 0.014, 0.014), MAT.engCoil, { d: 'Opnemer in het verdelerhuis die het toerental en de krukstand aan de regeleenheid doorgeeft.', p: [0.188, dy + 0.026, dz], ex: [0, 0.05, 0] }),
    ]),
    A('Bobine en module', { d: 'Eén ontstekingsbobine en de ontstekingsmodule op het kleppendeksel aan de uitlaatzijde.', ex: [0, 0.1, -0.12] }, [
      P('Ontstekingsbobine', merge([G.box(0.04, 0.05, 0.035), xf(G.cyl('y', 0.007, 0.007, 0.012, 10), [0.01, 0.031, 0])]), MAT.engCoil, { d: 'Bobine die de hoogspanning voor alle vier de bougies opwekt (een bobine, handboek).', p: [0.09, 0.305, -0.098], ex: [0, 0.06, 0] }),
      P('Ontstekingsmodule', G.box(0.045, 0.02, 0.035), MAT.ecu, { d: 'Schakelmodule die de stroom door de bobine onderbreekt, op commando van de motorregeleenheid (handboek: ontstekingsmodule).', p: [0.025, 0.296, -0.098], ex: [0, 0.03, -0.05] }),
      P('Bobinebeugel', xf(G.box(0.12, 0.003, 0.03), [0, 0, 0]), MAT.steel, { d: 'Plaatstalen beugel waarop bobine en module aan de achterzijde van het kleppendeksel zitten.', p: [0.058, 0.278, -0.0985], ex: [0, -0.03, 0] }),
      P('Hoogspanningskabel bobine', tube([[0.09, 0.332, -0.098], [0.13, 0.352, -0.07], [0.19, 0.356, -0.05], [0.219, dy + 0.034, dz]], 0.0035, 40, 5), MAT.rubber, { d: 'Kabel van de bobine naar de middentoren van de verdelerkap.', ex: [0, 0.05, 0] }),
    ]),
    A('Hoogspanningskabels', { d: 'Vier hoogspanningskabels van de verdelerkap naar de bougies.', ex: [0.0, 0.14, 0.0] }, cables.map((c, i) => P(`Bougiekabel ${i + 1}`, c, MAT.rubber, { d: `Bougiekabel naar cilinder ${i + 1}; lengte geschat.`, ex: [0, 0.02 * (i + 1), 0] }))),
  ]);
}

/* ---------- sensoren ---------- */
function engBuildSensors() {
  const dz = -ENG_CAMZ, [, py, pz] = ENG_PLEN;
  return A('Sensoren', { d: 'De sensoren en schakelaars op de motor die de regeleenheid voeden. De lijst volgt het handboek (gaskleppositie, inlaatdruk, koelvloeistoftemperatuur, krukaspositie, zuurstof); de plaats en het type zijn geschat.', ex: [0.15, 0.1, 0.05] }, [
    P('Krukaspositiesensor', merge([G.cyl('x', 0.0075, 0.0075, 0.0105, 10), xf(G.box(0.01, 0.012, 0.014), [0.0, 0.006, 0.0])]), MAT.engCoil, { d: 'Magnetische opnemer die de tanden van de startkrans aftast: geeft de krukaspositie door (handboek: krukaspositiesensor bij de krukas). Plaats geschat.', p: [0.1832, 0.115, 0], ex: [0.1, 0, 0] }),
    P('Koelvloeistoftemperatuursensor', merge([G.cyl('z', 0.005, 0.005, 0.02, 8), xf(G.cyl('z', 0.008, 0.008, 0.006, 6), [0, 0, 0.012])]), MAT.copper, { d: 'Voeler in het thermostaathuis die de temperatuur van de koelvloeistof doorgeeft.', p: [-0.162, 0.245, 0.1245], ex: [0, 0, 0.08] }),
    P('Inlaatdruksensor', merge([G.box(0.026, 0.02, 0.014), xf(G.cyl('z', 0.004, 0.004, 0.012, 8), [0.0, 0.0, -0.012])]), MAT.engCoil, { d: 'MAP-sensor aan de achterzijde van de inlaatkast die de inlaatdruk meet.', p: [-0.06, 0.283, 0.1245], ex: [0, 0.05, -0.04] }),
    P('Gaskleppositiesensor', merge([G.box(0.02, 0.02, 0.014)]), MAT.engCoil, { d: 'Sensor op de gasklepas die de stand van de gasklep aan de regeleenheid doorgeeft.', p: [0.166, py, pz - 0.0415], ex: [0, 0, -0.07] }),
    P('Lambdasonde voor', merge([G.cyl('x', 0.006, 0.006, 0.035, 10), xf(engNut(0.022, 0.008, 'x'), [-0.012, 0, 0]), xf(G.cyl('x', 0.0085, 0.0085, 0.02, 10), [0.027, 0, 0])]), MAT.steel, { d: 'Zuurstofsensor in de verzamelaar, voor de katalysator (handboek: twee lambdasondes; de tweede zit achter de katalysator en hoort bij het uitlaatsysteem).', p: [ENG_COLL[0] + 0.043, 0.158, ENG_COLL[2]], ex: [0.07, 0, 0] }),
    P('Oliedrukschakelaar', merge([G.cyl('z', 0.006, 0.006, 0.02, 8), xf(engNut(0.016, 0.008, 'z'), [0, 0, 0.002])]), MAT.steel, { d: 'Schakelaar die het waarschuwingslampje van de oliedruk bedient.', p: [0.025, 0.03, 0.099], ex: [0, 0, 0.06] }),
  ]);
}

/* ---------- kabelboom ---------- */
function engBuildHarness() {
  const dz = -ENG_CAMZ, [, py, pz] = ENG_PLEN, rz = ENG_RAIL[2];
  const branch = ENG_XC.map(x => tube([[x, 0.278, 0.11], [x, 0.272, 0.108], [x, 0.268, 0.106]], 0.0025, 6, 5));
  return A('Kabelboom', { d: 'Motorkabelboom met de bundel over de injectoren en de aftakkingen naar sensoren en de bobine. Het verloop is schematisch weergegeven; de aansluiting op de regeleenheid hoort bij het elektrisch systeem.', ex: [0.1, 0.25, 0.05] }, [
    P('Injectorbundel', tube([[-0.13, 0.278, 0.11], [-0.05, 0.28, 0.11], [0.05, 0.28, 0.11], [0.19, 0.278, 0.11]], 0.0045, 24, 6), MAT.engHarness, { d: 'Omwikkelde bundel op de injectorstekkers.', ex: [0, 0.06, 0] }),
    P('Injectoraftakkingen', merge(branch), MAT.engHarness, { d: 'Korte aftakkingen van de bundel naar de vier injectorstekkers.', ex: [0, 0.03, 0.02] }),
    P('Hoofdbundel', tube([[0.19, 0.278, 0.11], [0.225, 0.29, 0.07], [0.23, 0.3, 0.03]], 0.0055, 24, 6), MAT.engHarness, { d: 'Hoofdbundel die aan de bakzijde naar boven de motor verlaat richting regeleenheid en elektrisch systeem.', ex: [0.08, 0.05, 0] }),
    P('Motorstekker', G.box(0.03, 0.02, 0.03), MAT.engCoil, { d: 'Stekker van de motorkabelboom naar de hoofdkabelboom van de auto (plaats geschat).', p: [0.23, 0.3, 0.012], ex: [0.06, 0.04, 0] }),
    P('Kabel gaskleppositiesensor', tube([[0.18, 0.278, 0.11], [0.172, 0.27, 0.118], [0.166, py, pz - 0.0485]], 0.0025, 12, 5), MAT.engHarness, { d: 'Draden naar de gaskleppositiesensor.', ex: [0, 0.04, -0.04] }),
    P('Kabel inlaatdruksensor', tube([[-0.05, 0.28, 0.11], [-0.055, 0.284, 0.118], [-0.06, 0.283, 0.1315]], 0.0025, 10, 5), MAT.engHarness, { d: 'Draden naar de inlaatdruksensor.', ex: [0, 0.05, -0.02] }),
    P('Kabel koelvloeistofsensor', tube([[-0.13, 0.278, 0.11], [-0.15, 0.27, 0.125], [-0.162, 0.245, 0.14]], 0.0025, 12, 5), MAT.engHarness, { d: 'Draden naar de koelvloeistoftemperatuursensor.', ex: [-0.04, 0.05, 0.04] }),
    P('Kabel krukaspositiesensor', tube([[0.23, 0.3, 0.012], [0.205, 0.22, 0.0], [0.19, 0.14, 0.0], [0.1865, 0.125, 0.0]], 0.0025, 18, 5), MAT.engHarness, { d: 'Draden naar de krukaspositiesensor, langs het blok naar beneden.', ex: [0.08, 0, 0] }),
    P('Kabel zuurstofsensor', tube([[0.23, 0.3, 0.012], [0.252, 0.28, -0.02], [0.252, 0.22, -0.1], [0.23, 0.185, -0.19], [0.085, 0.158, -0.215]], 0.0025, 30, 5), MAT.engHarness, { d: 'Draden naar de lambdasonde voor, om het uiteinde van de kop naar de achterzijde.', ex: [0.08, 0, -0.06] }),
    P('Kabel oliedrukschakelaar', tube([[0.025, 0.03, 0.109], [0.012, 0.06, 0.106], [0.012, 0.12, 0.101], [0.012, 0.19, 0.1], [0.012, 0.27, 0.1], [0.012, 0.278, 0.108]], 0.0025, 30, 5), MAT.engHarness, { d: 'Draad naar de oliedrukschakelaar, langs het blok omhoog naar de bundel; verloop schematisch.', ex: [0, -0.06, 0.04] }),
    P('Kabelbinders', merge([[0.0, 0.28, 0.11], [0.1, 0.28, 0.11], [-0.09, 0.28, 0.11], [0.226, 0.298, 0.05]].map(([x, y, z]) => xf(G.box(0.006, 0.012, 0.012), [x, y, z]))), MAT.plastic, { d: 'Kunststof binders die de bundel op zijn plaats houden (aantal en plaats geschat).', ex: [0, 0.08, 0] }),
  ]);
}

/* ---------- de hele motor ---------- */
function buildEngine() {
  return A('Motor G10BB', {
    d: 'Suzuki G10BB: dwars voorin geplaatste vloeistofgekoelde viercilinder in lijn van 993 cc met 16 kleppen en meerpuntsinspuiting (Euro 3), blok en kop van aluminium. Krukaspoelie en distributie zitten rechts in de auto, koppeling en bak links; inlaat voor, uitlaat achter. Alleen boring x slag en inhoud komen uit het handboek; de opbouw en alle overige maten zijn schematisch en geschat.',
    spec: [['Motorcode', 'G10BB'], ['Opbouw', 'viercilinder in lijn, 16 kleppen'], ['Cilinderinhoud', '993 cm³'], ['Boring x slag', '72,0 x 61,0 mm'], ['Vermogen', '43 kW (58 pk) bij 6000 tpm'], ['Koppel', '78 Nm bij 4500 tpm'], ['Inspuiting', 'elektronisch, meerpunts'], ['Emissie', 'Euro 3']],
    p: PT_POS.toArray(), r: [PT_TILT, 0, 0], ex: [-0.24, 0.12, 0],
  }, [
    engBuildBlock(), engBuildCrank(), engBuildHead(), engBuildTiming(), engBuildAccessory(), engBuildCooling(), engBuildLube(),
    engBuildIntake(), engBuildExhaust(), engBuildIgnition(), engBuildSensors(), engBuildHarness(), engBuildFlywheel(),
  ]);
}
