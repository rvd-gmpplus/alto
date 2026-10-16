/* ===================== engine1.js: beginauto van het framework, wordt vervangen door de domeineigenaar ===================== */
function buildPowertrain() {
  // beginauto: één blok als plaatshouder; de eigenaar van engine1.js vervangt dit door de echte onderdelen
  return A('Aandrijflijn', { d: 'Plaatshouder voor de hoofdgroep Aandrijflijn.', ex: [0, 0.45, 1.25] }, [
    P('Aandrijflijn (plaatshouder)', G.box(0.7, 0.5, 0.6), MAT.plasticGrey, { d: 'Blok op de plek van de hoofdgroep; wordt vervangen.', p: [0, 0.6, 1.4], ex: [0, 0.2, 0] }),
  ]);
}
