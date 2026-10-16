/* ===================== drivetrain.js: aandrijflijnframe en koppelvlak (orkestrator); bak, koppeling en aandrijfassen volgen van de eigenaar ===================== */
// Aandrijflijnframe = motorframe (docs/contract.md, hoofdstuk 3): oorsprong op de krukas-as tussen cilinder 2 en 3,
// +x naar de vliegwiel- en bakzijde (links in de auto), +y langs de cilinders omhoog, +z naar de inlaatzijde (voor).
const PT_POS = V3(-0.13, 0.36, 1.217), PT_TILT = 0, GB_X = 0.30;
const PTM = new THREE.Matrix4().compose(PT_POS, new THREE.Quaternion().setFromEuler(new THREE.Euler(PT_TILT, 0, 0)), V3(1, 1, 1));
const PTI = PTM.clone().invert();
const toPT = p => V3(...p).applyMatrix4(PTI);
const fromPT = p => V3(...p).applyMatrix4(PTM);
const ENG2CAR = p => fromPT(p).toArray();             // motorframe = aandrijflijnframe
const DIFF = [0.13, -0.095, -0.13];                    // differentieel in bakframe (x vanaf het vlak GB_X, y, z)

// Aansluitpunten van bak en startmotor in het motorframe (contract, hoofdstuk 5). De sleutels blijven bestaan.
const DRV_PORTS = {
  starterTerminal: [GB_X + 0.10, -0.04 + 0.062, 0.147 + 0.012],
  diffOutL: [GB_X + DIFF[0] + 0.082, DIFF[1], DIFF[2]],
  diffOutR: [GB_X + DIFF[0] - 0.082, DIFF[1], DIFF[2]],
  clutchLever: [GB_X + 0.03, -0.05, -0.03],
  shiftIn: [GB_X + 0.15, 0.0, -0.05],
};

function buildGearbox() {
  // plaatshouder; de eigenaar van drivetrain.js vervangt dit door koppelingshuis, bak, differentieel en schakelmechanisme
  return A('Handbak 5-versnellingen', { d: 'Plaatshouder voor de handgeschakelde vijfbak met differentieel.', ex: [0.3, 0, 0] }, [
    P('Handbak (plaatshouder)', G.box(0.22, 0.30, 0.34), MAT.plasticGrey, { d: 'Blok op de plek van de bak, links naast het blok; wordt vervangen.', p: ENG2CAR([GB_X + 0.11, -0.02, -0.06]), ex: [0.2, 0, 0] }),
  ]);
}

function buildPowertrain() {
  // koppelvlak: buildEngine() komt uit de motorbestanden (engine1-3.js), buildGearbox() uit dit bestand
  return A('Aandrijflijn', { d: 'Dwarsgeplaatste viercilinder G10BB met handgeschakelde vijfbak en voorwielaandrijving.', ex: [0, 0.45, 0.6] }, [
    buildEngine(), buildGearbox(),
  ]);
}
