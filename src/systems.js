/* ===================== systems.js: beginauto van het framework, wordt vervangen door de domeineigenaar ===================== */
function buildCooling() {
  // beginauto: één blok als plaatshouder; de eigenaar van systems.js vervangt dit door de echte onderdelen
  return A('Koeling en luchtinlaat', { d: 'Plaatshouder voor de hoofdgroep Koeling en luchtinlaat.', ex: [0, 0.25, 1.2] }, [
    P('Koeling en luchtinlaat (plaatshouder)', G.box(0.55, 0.36, 0.05), MAT.plasticGrey, { d: 'Blok op de plek van de hoofdgroep (radiateur achter de grille); wordt vervangen.', p: [0, 0.5, 1.52], ex: [0, 0.2, 0] }),
  ]);
}
function buildExhaust() {
  // beginauto: één blok als plaatshouder; de eigenaar van systems.js vervangt dit door de echte onderdelen
  return A('Uitlaatsysteem', { d: 'Plaatshouder voor de hoofdgroep Uitlaatsysteem.', ex: [0.4, -1.5, -0.6] }, [
    P('Uitlaatsysteem (plaatshouder)', G.box(0.12, 0.08, 2.4), MAT.plasticGrey, { d: 'Blok op de plek van de hoofdgroep (onder de vloer); wordt vervangen.', p: [-0.2, 0.15, -0.45], ex: [0, 0.2, 0] }),
  ]);
}
function buildFuel() {
  // beginauto: één blok als plaatshouder; de eigenaar van systems.js vervangt dit door de echte onderdelen
  return A('Brandstofsysteem', { d: 'Plaatshouder voor de hoofdgroep Brandstofsysteem.', ex: [-0.75, -0.95, -0.3] }, [
    P('Brandstofsysteem (plaatshouder)', G.box(0.7, 0.16, 0.45), MAT.plasticGrey, { d: 'Blok op de plek van de hoofdgroep (tank onder de achterbank); wordt vervangen.', p: [0, 0.34, -0.85], ex: [0, 0.2, 0] }),
  ]);
}
function buildElectrical() {
  // beginauto: één blok als plaatshouder; de eigenaar van systems.js vervangt dit door de echte onderdelen
  return A('Elektrisch systeem', { d: 'Plaatshouder voor de hoofdgroep Elektrisch systeem.', ex: [0.4, 0.6, 0.9] }, [
    P('Elektrisch systeem (plaatshouder)', G.box(0.26, 0.2, 0.18), MAT.plasticGrey, { d: 'Blok op de plek van de hoofdgroep (accu in de motorruimte); wordt vervangen.', p: [-0.3, 0.55, 1.35], ex: [0, 0.2, 0] }),
  ]);
}
function buildCar() {
  // de wortel heet zoals auto.json zegt (AUTO.wortel) en heeft precies de acht hoofdgroepen, in deze volgorde
  return A(AUTO.wortel, { d: 'Suzuki Alto 1.0-16V Twist (2001), 3-deurs hatchback. De carrosserie is uitgewerkt; de andere zeven hoofdgroepen zijn nog plaatshouders. Klik op een onderdeel om het uit te klappen.' },
    [buildBody(), buildInterior(), buildPowertrain(), buildChassis(), buildCooling(), buildExhaust(), buildFuel(), buildElectrical()]);
}
