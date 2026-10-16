/* ===================== body.js: beginauto van het framework, wordt vervangen door de domeineigenaar ===================== */
// hoofdmaten in het autoframe (contract §2); de generieke tests lezen ze. Vervang ze door de gemeten waarden.
const ZF = 2.1, ZR = -2.1, AXF = 1.3, AXR = -1.3;
const BOD_WMAX = 0.9, BOD_MIRW = 1.0, BOD_H = 1.45;
function buildBody() {
  // beginauto: één blok als plaatshouder; de eigenaar van body.js vervangt dit door de echte onderdelen
  return A('Carrosserie', { d: 'Plaatshouder voor de hoofdgroep Carrosserie.', ex: [0, 1.9, 0.1] }, [
    P('Carrosserie (plaatshouder)', G.box(1.8, 0.9, 4.2), MAT.plasticGrey, { d: 'Blok op de plek van de hoofdgroep; wordt vervangen.', p: [0, 0.95, 0], ex: [0, 0.2, 0] }),
  ]);
}
