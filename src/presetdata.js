/* ===================== presetgegevens van deze auto (de motor en de uitleg van de velden staan in presets.js) ===================== */
const appCar = AUTO.wortel;   // de wortel van de boom (auto.json)
const appCats = ['Overzicht', 'Motor', 'Aandrijving', 'Onderstel', 'Carrosserie', 'Interieur', 'Openen'];
const PRESETS = [
  { id: 'assembled', cat: 'Overzicht', label: 'Gemonteerd', key: '0', note: 'De hele auto, alles dicht.', cam: { dir: [1, 0.45, 1.1], pad: 1.05 } },
  { id: 'main', cat: 'Overzicht', label: 'Hoofdgroepen', key: '1', note: 'De acht hoofdgroepen uit elkaar.', open: [appCar], labels: appCar, cam: { dir: [1, 0.5, 1.08], pad: 1.04 } },
  { id: 'tour', cat: 'Overzicht', label: 'Rondleiding', note: 'Alle stappen achter elkaar.', tour: true },
];
const appTourSteps = ['assembled', 'main', 'assembled'];
