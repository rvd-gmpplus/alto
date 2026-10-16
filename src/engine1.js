/* ===================== engine1.js: beginauto van het framework, wordt vervangen door de domeineigenaar ===================== */
function buildPowertrain() {
  // beginauto: één blok als plaatshouder; de eigenaar van engine1.js vervangt dit door de echte onderdelen
  return A('Aandrijflijn', { d: 'Plaatshouder voor de hoofdgroep Aandrijflijn.', ex: [0, 0.45, 0.6] }, [
    P('Aandrijflijn (plaatshouder)', G.box(0.76, 0.42, 0.40), MAT.plasticGrey, { d: 'Blok op de plek van de hoofdgroep (motor en bak, dwars voorin, onder de motorkap); wordt vervangen.', p: [0, 0.42, 1.2], ex: [0, 0.2, 0] }),
  ]);
}
