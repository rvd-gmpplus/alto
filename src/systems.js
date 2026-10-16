/* ===================== systems.js: beginauto van het framework, wordt vervangen door de domeineigenaar ===================== */
function buildCooling() {
  // beginauto: één blok als plaatshouder; de eigenaar van systems.js vervangt dit door de echte onderdelen
  return A('Koeling en luchtinlaat', { d: 'Plaatshouder voor de hoofdgroep Koeling en luchtinlaat.', ex: [0, 0.25, 2.0] }, [
    P('Koeling en luchtinlaat (plaatshouder)', G.box(0.6, 0.4, 0.1), MAT.plasticGrey, { d: 'Blok op de plek van de hoofdgroep; wordt vervangen.', p: [0, 0.6, 1.9], ex: [0, 0.2, 0] }),
  ]);
}
function buildExhaust() {
  // beginauto: één blok als plaatshouder; de eigenaar van systems.js vervangt dit door de echte onderdelen
  return A('Uitlaatsysteem', { d: 'Plaatshouder voor de hoofdgroep Uitlaatsysteem.', ex: [0.4, -1.5, -0.6] }, [
    P('Uitlaatsysteem (plaatshouder)', G.box(0.15, 0.1, 2.8), MAT.plasticGrey, { d: 'Blok op de plek van de hoofdgroep; wordt vervangen.', p: [0.3, 0.25, -0.6], ex: [0, 0.2, 0] }),
  ]);
}
function buildFuel() {
  // beginauto: één blok als plaatshouder; de eigenaar van systems.js vervangt dit door de echte onderdelen
  return A('Brandstofsysteem', { d: 'Plaatshouder voor de hoofdgroep Brandstofsysteem.', ex: [-0.75, -0.95, -0.3] }, [
    P('Brandstofsysteem (plaatshouder)', G.box(0.8, 0.25, 0.5), MAT.plasticGrey, { d: 'Blok op de plek van de hoofdgroep; wordt vervangen.', p: [-0.2, 0.3, -1.0], ex: [0, 0.2, 0] }),
  ]);
}
function buildElectrical() {
  // beginauto: één blok als plaatshouder; de eigenaar van systems.js vervangt dit door de echte onderdelen
  return A('Elektrisch systeem', { d: 'Plaatshouder voor de hoofdgroep Elektrisch systeem.', ex: [0.4, 0.6, 0.9] }, [
    P('Elektrisch systeem (plaatshouder)', G.box(0.3, 0.2, 0.2), MAT.plasticGrey, { d: 'Blok op de plek van de hoofdgroep; wordt vervangen.', p: [0.45, 0.75, 1.5], ex: [0, 0.2, 0] }),
  ]);
}
function buildCar() {
  // de wortel heet zoals auto.json zegt (AUTO.wortel) en heeft precies de acht hoofdgroepen, in deze volgorde
  return A(AUTO.wortel, { d: 'Beginauto van het framework: acht plaatshouders. Klik op een onderdeel om het uit te klappen.' },
    [buildBody(), buildInterior(), buildPowertrain(), buildChassis(), buildCooling(), buildExhaust(), buildFuel(), buildElectrical()]);
}
