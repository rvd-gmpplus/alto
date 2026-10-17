/* ===================== presetgegevens van deze auto (de motor en de uitleg van de velden staan in presets.js) ===================== */
// Per auto: appCats (categorieën, in volgorde), PRESETS (de standen) en appTourSteps (de rondleiding, preset-id's).
// Alleen namen die in de boom precies één keer voorkomen; een preset waarvan een naam niet oplost, verschijnt niet in de menu's.
const appCar = AUTO.wortel;   // de wortel van de boom (auto.json)
const appCats = ['Overzicht', 'Motor', 'Aandrijving', 'Onderstel', 'Carrosserie', 'Interieur', 'Openen'];
const PRESETS = [
  // Overzicht
  { id: 'assembled', cat: 'Overzicht', label: 'Gemonteerd', key: '0', note: 'De complete auto in elkaar: Suzuki Alto 1.0-16V Twist, driedeurs hatchback uit 2001.', cam: { dir: [1, 0.42, 1.08], pad: 1.04 } },
  { id: 'main', cat: 'Overzicht', label: 'Hoofdgroepen', key: '1', note: 'De acht hoofdgroepen uit elkaar: carrosserie, interieur, aandrijflijn, onderstel en vier systemen.', open: [appCar], labels: appCar, cam: { dir: [1, 0.5, 1.08], pad: 1.04 } },
  { id: 'bodyOff', cat: 'Overzicht', label: 'Carrosserie eraf', note: 'Carrosserie en interieur opgetild, zodat motor, versnellingsbak en onderstel op hun plek te zien zijn.', pull: { 'Carrosserie': [0, 1.2, 0], 'Interieur': [0, 0.45, 0] }, labels: appCar, cam: { dir: [1, 0.3, 0.8], pad: 1.04 } },
  { id: 'xray', cat: 'Overzicht', label: 'Röntgen', key: '8', note: 'Carrosserie doorzichtig: de techniek in de gemonteerde auto, van opzij.', xray: true, cam: { dir: [1, 0.12, 0.02], pad: 1.03 } },
  { id: 'everything', cat: 'Overzicht', label: 'Alles uit elkaar', key: '9', note: 'Elke groep uitgeklapt tot op het kleinste onderdeel, gekleurd per hoofdgroep.', deep: [appCar], sys: true, labels: appCar, cam: { dir: [1, 0.6, 1.0], pad: 1.0 } },
  { id: 'tour', cat: 'Overzicht', label: 'Rondleiding', note: 'Speelt de belangrijkste presets na elkaar af, met uitleg bij elke stap.', tour: true },
  // Motor
  { id: 'engine', cat: 'Motor', label: 'Motor G10BB', key: '2', note: '1,0 liter viercilinder-benzinemotor (993 cm³, 16 kleppen, 43 kW): eerste laag uit elkaar.', iso: ['Motor G10BB'], open: ['Motor G10BB'], cam: { dir: [0.3, 0.42, 1], pad: 1.08 } },
  { id: 'engineAll', cat: 'Motor', label: 'Motor tot op de bout', key: '3', note: 'Alle groepen van de motor uitgeklapt, tot op de kleinste onderdelen.', iso: ['Motor G10BB'], deep: ['Motor G10BB'], cam: { dir: [0.3, 0.45, 1], pad: 1.02 } },
  { id: 'head', cat: 'Motor', label: 'Cilinderkop en tuimelaars', note: 'Cilinderkop met bovenliggende nokkenas, tuimelaars en kleppen, helemaal uit elkaar.', iso: ['Cilinderkop'], deep: ['Cilinderkop'], cam: { dir: [0.7, 0.5, 1], pad: 1.16 } },
  { id: 'crank', cat: 'Motor', label: 'Krukmechanisme', note: 'Krukas met zuigers en drijfstangen, uit elkaar.', iso: ['Krukmechanisme'], deep: ['Krukmechanisme'], cam: { dir: [0.35, 0.4, 1], pad: 1.04 } },
  { id: 'timing', cat: 'Motor', label: 'Distributie', note: 'Distributieriem met spanner die de nokkenas aandrijft, op de motor uitgeklapt.', iso: ['Motor G10BB'], deep: ['Distributie'], select: 'Distributie', labels: 'Distributie', frame: ['Motor G10BB'], cam: { dir: [-1, 0.35, 0.45], pad: 1.06 } },
  { id: 'intake', cat: 'Motor', label: 'Inlaat en injectie', note: 'Inlaatspruitstuk met gasklephuis, brandstofverdeelleiding en injectoren, uit elkaar.', iso: ['Inlaatspruitstuk'], deep: ['Inlaatspruitstuk'], labels: 'Inlaatspruitstuk', cam: { dir: [0.6, 0.6, 1], pad: 1.05 } },
  { id: 'manifold', cat: 'Motor', label: 'Uitlaatspruitstuk', note: 'Het uitlaatspruitstuk op de cilinderkop met zijn studs, uit elkaar.', iso: ['Uitlaatspruitstuk'], deep: ['Uitlaatspruitstuk'], labels: 'Uitlaatspruitstuk', cam: { dir: [-0.6, 0.5, -1], pad: 1.06 } },
  { id: 'exhaust', cat: 'Motor', label: 'Uitlaatsysteem', note: 'De uitlaat van voorpijp tot einddemper, met katalysator, ophangingen en hitteschilden.', iso: ['Uitlaatsysteem'], open: ['Uitlaatsysteem'], labels: 'Uitlaatsysteem', cam: { dir: [0.9, 0.4, 0.55], pad: 1.03 } },
  // Aandrijving
  { id: 'gearbox', cat: 'Aandrijving', label: 'Handbak', key: '4', note: 'Vijfversnellingsbak, eerste laag uit elkaar: koppeling, assen, schakelmechanisme en differentieel.', iso: ['Handbak 5-versnellingen'], open: ['Handbak 5-versnellingen'], cam: { dir: [0.45, 0.5, 1], pad: 1.06 } },
  { id: 'clutch', cat: 'Aandrijving', label: 'Koppeling', note: 'Drukgroep, koppelingsplaat en druklager tussen vliegwiel en bak.', iso: ['Koppeling'], deep: ['Koppeling'], cam: { dir: [0.9, 0.4, 0.7], pad: 1.05 } },
  { id: 'diff', cat: 'Aandrijving', label: 'Differentieel', note: 'Differentieel dat het koppel over de twee aandrijfassen verdeelt.', iso: ['Differentieel'], deep: ['Differentieel'], cam: { dir: [0.8, 0.5, 1], pad: 1.05 } },
  { id: 'shafts', cat: 'Aandrijving', label: 'Aandrijfassen', note: 'Linker en rechter aandrijfas met homokinetische koppelingen naar de voorwielen.', iso: ['Aandrijfassen'], deep: ['Aandrijfassen'], cam: { dir: [0.35, 1, 0.9], pad: 1.04 } },
  // Onderstel
  { id: 'chassis', cat: 'Onderstel', label: 'Onderstel', key: '5', note: 'Vooras met McPherson-veerpoten, achteras, de vier wielen en het remsysteem.', iso: ['Onderstel'], open: ['Onderstel', 'Vooras en stuurinrichting', 'Achteras'], cam: { dir: [1, 0.55, 1.08], pad: 1.04 } },
  { id: 'frontAxle', cat: 'Onderstel', label: 'Vooras McPherson', note: 'McPherson-voorwielophanging met dwarsbalk, stabilisator en tandheugelbesturing.', iso: ['Vooras en stuurinrichting'], open: ['Vooras en stuurinrichting', 'Stuurinrichting', 'Wielophanging linksvoor'], cam: { dir: [0.7, 0.55, 1], pad: 1.04 } },
  { id: 'rearAxle', cat: 'Onderstel', label: 'Achteras', note: 'Achteras met panhardstang, schroefveren en schokdempers.', iso: ['Achteras'], open: ['Achteras', 'Wielophanging linksachter'], cam: { dir: [0.75, 0.6, -1], pad: 1.04 } },
  { id: 'wheelLF', cat: 'Onderstel', label: 'Wiel linksvoor', note: 'Wiel met band, uit elkaar.', iso: ['Wiel linksvoor'], deep: ['Wiel linksvoor'], cam: { dir: [1, 0.35, 0.65], pad: 1.05 } },
  { id: 'brakeLF', cat: 'Onderstel', label: 'Rem linksvoor', note: 'Schijfrem linksvoor tot op de remblokken uit elkaar.', iso: ['Schijfrem linksvoor'], deep: ['Schijfrem linksvoor'], labels: 'Remklauw linksvoor', select: 'Remklauw linksvoor', cam: { dir: [0.7, 0.45, 0.75], pad: 1.05 } },
  // Carrosserie
  { id: 'body', cat: 'Carrosserie', label: 'Carrosserie en kooi', key: '6', note: 'Kooi met portieren, kleppen, bumpers, verlichting en ruiten: eerste laag uit elkaar.', iso: ['Carrosserie'], open: ['Carrosserie'], cam: { dir: [1, 0.5, 1.08], pad: 1.03 } },
  { id: 'doorL', cat: 'Carrosserie', label: 'Portier links', note: 'Linkerportier tot op de onderdelen, met de buitenspiegel.', iso: ['Portier links'], deep: ['Portier links'], cam: { dir: [0.85, 0.5, 0.75], pad: 1.05 } },
  { id: 'headlampL', cat: 'Carrosserie', label: 'Koplamp links', note: 'Koplamp links uit elkaar.', iso: ['Koplamp links'], deep: ['Koplamp links'], cam: { dir: [0.8, 0.35, 1], pad: 1.06 } },
  { id: 'tailgate', cat: 'Carrosserie', label: 'Achterklep', note: 'Achterklep met achterruit, wisser, slot en gasveren, uit elkaar.', iso: ['Achterklep'], deep: ['Achterklep'], cam: { dir: [0.55, 0.45, -1], pad: 1.05 } },
  // Interieur
  { id: 'interior', cat: 'Interieur', label: 'Interieur', key: '7', note: 'Dashboard, middenconsole, stoelen, bekleding en pedalen uit elkaar.', iso: ['Interieur'], open: ['Interieur', 'Stoelen'], cam: { dir: [0.9, 0.85, 0.7], pad: 1.04 } },
  { id: 'driverSeat', cat: 'Interieur', label: 'Bestuurdersstoel', note: 'Bestuurdersstoel tot op de onderdelen: frame, zitting, rugleuning en hoofdsteun.', iso: ['Bestuurdersstoel'], deep: ['Bestuurdersstoel'], cam: { dir: [1, 0.45, 0.8], pad: 1.05 } },
  { id: 'dash', cat: 'Interieur', label: 'Dashboard', note: 'Dashboard met instrumentenpaneel, luchtroosters en bedieningsdelen uit elkaar.', iso: ['Dashboard'], deep: ['Dashboard'], cam: { dir: [0.3, 0.45, -1], pad: 1.05 } },
  // Openen
  { id: 'openHood', cat: 'Openen', label: 'Motorruimte', note: 'Motorkap open: de motorruimte van boven en voren, met de kap in de eindstand.', opens: ['Motorkap'], frame: ['Motorkap', 'Motor G10BB'], cam: { pad: 1.1 } },
  { id: 'openDoors', cat: 'Openen', label: 'Instappen', note: 'Beide portieren open, schuin van boven.', opens: ['Portier links', 'Portier rechts'], frame: [appCar], cam: { dir: [1, 0.85, 0.55], pad: 1.04 } },
  { id: 'openTrunk', cat: 'Openen', label: 'Bagageruimte', note: 'Achterklep open en het grote deel van de achterbank neergeklapt.', opens: ['Achterklep', 'Rugleuning groot deel'], frame: [appCar], cam: { dir: [-0.8, 0.6, -1], pad: 1.05 } },
  { id: 'openFuel', cat: 'Openen', label: 'Tanken', note: 'Tankklep open met de vulopening.', opens: ['Tankklep'], frame: ['Tankvulopening', 'Achterlicht rechts'], cam: { dir: [-1, 0.3, -0.5], pad: 1.5 } },
  { id: 'openAll', cat: 'Openen', label: 'Alles open', note: 'Elke opener open: portieren, kap, klep, ruiten, spiegels en rugleuningen.', opens: 'all', frame: [appCar], cam: { dir: [1, 0.55, 1.08], pad: 1.04 } },
];
const appTourSteps = ['assembled', 'main', 'bodyOff', 'engine', 'head', 'intake', 'gearbox', 'frontAxle', 'brakeLF', 'chassis', 'interior', 'assembled'];
