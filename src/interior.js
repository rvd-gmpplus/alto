/* ===================== interior.js: beginauto van het framework, wordt vervangen door de domeineigenaar ===================== */
function buildInterior() {
  // beginauto: één blok als plaatshouder; de eigenaar van interior.js vervangt dit door de echte onderdelen
  return A('Interieur', { d: 'Plaatshouder voor de hoofdgroep Interieur.', ex: [0, 0.85, -0.2] }, [
    P('Interieur (plaatshouder)', G.box(1.2, 0.25, 1.5), MAT.plasticGrey, { d: 'Blok op de plek van de hoofdgroep (onder de gordellijn, in de cabine); wordt vervangen.', p: [0, 0.5, -0.2], ex: [0, 0.2, 0] }),
  ]);
}
