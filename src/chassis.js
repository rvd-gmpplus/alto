/* ===================== chassis.js: beginauto van het framework, wordt vervangen door de domeineigenaar ===================== */
function buildChassis() {
  // beginauto: de vier vaste kinderen van Onderstel als plaatshouders; de eigenaar van chassis.js vervangt ze.
  // Maten en plaatsen volgen het contract van de Alto (assen AXF en AXR, spoor TRACK_F en TRACK_R, wielstraal 145/70 R13).
  const ph = (name, geo, pos, d) => A(name, { d: 'Plaatshouder voor ' + name + '.' }, [P(name + ' (plaatshouder)', geo, MAT.plasticGrey, { d: d || ('Blok op de plek van ' + name + '; wordt vervangen.'), p: pos, ex: [0, -0.2, 0] })]);
  const wheel = (x, z) => xf(G.cyl('x', 0.2666, 0.2666, 0.145, 28), [x, AY, z]);
  const wheels = merge([wheel(TRACK_F, AXF), wheel(-TRACK_F, AXF), wheel(TRACK_R, AXR), wheel(-TRACK_R, AXR)]);
  return A('Onderstel', { d: 'Plaatshouder voor het onderstel.', ex: [0, -0.55, 0] }, [
    ph('Vooras en stuurinrichting', G.box(1.2, 0.08, 0.2), [0, 0.21, AXF]), ph('Achteras', G.box(1.2, 0.08, 0.1), [0, 0.30, AXR]),
    ph('Wielen', wheels, [0, 0, 0], 'Vier cilinders op de plaats van de wielen (145/70 R13); wordt vervangen door banden, velgen en wieldoppen.'),
    ph('Remsysteem', G.box(0.3, 0.08, 0.2), [0, 0.22, 0.6]),
  ]);
}
