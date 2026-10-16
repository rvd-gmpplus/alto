/* ===================== chassis.js: beginauto van het framework, wordt vervangen door de domeineigenaar ===================== */
function buildChassis() {
  // beginauto: de vier vaste kinderen van Onderstel als plaatshouders; de eigenaar van chassis.js vervangt ze
  const ph = (name, size, pos) => A(name, { d: 'Plaatshouder voor ' + name + '.' }, [P(name + ' (plaatshouder)', G.box(...size), MAT.plasticGrey, { d: 'Blok op de plek van ' + name + '; wordt vervangen.', p: pos, ex: [0, -0.2, 0] })]);
  return A('Onderstel', { d: 'Plaatshouder voor het onderstel.', ex: [0, -0.55, 0] }, [
    ph('Vooras en stuurinrichting', [1.4, 0.15, 0.3], [0, 0.3, 1.3]), ph('Achteras', [1.4, 0.15, 0.3], [0, 0.3, -1.3]),
    ph('Wielen', [1.7, 0.6, 0.3], [0, 0.3, 0]), ph('Remsysteem', [0.3, 0.1, 0.3], [0, 0.2, 0.6]),
  ]);
}
