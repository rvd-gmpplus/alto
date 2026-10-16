/* ===================== engine1.js: koppelvlak van de motor (orkestrator); de motoreigenaar vervangt de plaatshouder ===================== */
// Motorframe (docs/contract.md, hoofdstuk 3): oorsprong op de krukas-as tussen cilinder 2 en 3, +x naar de bakzijde (links),
// +y omhoog, +z naar de inlaatzijde (voor). Cilinder 1 aan de poeliezijde (-x).

// Aansluitpunten in het motorframe (contract, hoofdstuk 5). systems.js sluit slangen en leidingen hierop aan.
// Contract: de sleutels blijven bestaan; p = punt, dir = richting waarin een slang of pijp de aansluiting verlaat.
const ENG_PORTS = {
  exhaustOut: { p: [0.02, 0.17, -0.215], dir: [0, -1, 0] },       // uitlaatspruitstuk naar de voorkatalysator
  throttleIn: { p: [0.20, 0.30, 0.19], dir: [1, 0, 0] },          // luchtfilterslang naar de gasklep
  thermostatOut: { p: [-0.19, 0.30, 0.10], dir: [0, 1, 0] },      // koelslang boven naar de radiateur
  waterPumpIn: { p: [-0.155, 0.06, 0.15], dir: [0, 0, 1] },       // koelslang onder van de radiateur
  fuelRailIn: { p: [0.205, 0.285, 0.17], dir: [1, 0, 0] },        // brandstofleiding naar de verdeelleiding
  evapPurge: { p: [0.05, 0.33, 0.20], dir: [0, 1, 0] },           // slang van het koolstoffilter naar de inlaat
};
// punt op afstand d buiten een aansluiting, langs dir (motorframe)
function portAt(port, d = 0) { return [port.p[0] + port.dir[0] * d, port.p[1] + port.dir[1] * d, port.p[2] + port.dir[2] * d]; }

function buildEngine() {
  // plaatshouder; de motoreigenaar vervangt dit door blok, krukmechanisme, kop, distributie, inlaat, smering en hulpstukken
  return A('Motor G10BB', { d: 'Plaatshouder voor de motor G10BB, 993 cc viercilinder met 16 kleppen.', ex: [-0.24, 0.12, 0] }, [
    P('Motorblok (plaatshouder)', G.box(0.44, 0.50, 0.36), MAT.plasticGrey, { d: 'Blok op de plek van de motor; wordt vervangen.', p: ENG2CAR([-0.04, 0.12, 0]), ex: [0, 0.2, 0] }),
  ]);
}
