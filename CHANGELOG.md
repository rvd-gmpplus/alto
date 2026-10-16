# Wijzigingen

## Voorkant, ronde 2 (tak golf3-front, nog niet gepubliceerd)

Aanleiding: een premortem op ronde 1. Elke poort was groen, maar de lamp bleef een wit vlak en de grille grijs fijngaas. Metingen nu op de GPU (DPR 2) vanuit een camera die op de melding van de eigenaar is afgestemd. Zie `docs/onderzoek/beslissingen.md`, punt 17.

- Koplamp: reflectorbak zonder raster (vlekken, heldere zone rond de lamp, lampkap, donkere rand); lens 0,52 tot 0,62 helder met een spreiding van 0,2 (was een egaal wit vlak van 0,9).
- Grille: grof gaas met 25 kolommen, donker (0,12 tegen 0,38) en een donkere S zonder schijf.
- Bumperlijn vrijwel waterpas: de hoekkap is geen hoektand meer en staat 4 mm boven de hoofdlens. Donkere voeg langs de bumperrand, lip op 225 mm, geen kier tussen scherm en bumper.
- Lak dieper en matter: de kap is vanuit de lage blik van de eigenaar niet meer wit (verzadiging kap gedeeld door scherm 0,65 tot 0,73, was 0,30 tot 0,36).
- Uitklappen: de naadvulling (zwart masker) is weg en de zijrepeaters blijven op het scherm.
- Nog open: verlaging van het neusprofiel (verzoek aan de orkestrator), onafhankelijk oordeel, basislijn van `visdiff`, terugmelding van de uv-reparatie aan laguna3.

## Voorkant, ronde 1 (tak golf3-front, nog niet gepubliceerd)

Aanleiding: "de basis ziet er goed uit, maar de koplampen zien er ruk uit in combinatie met de grille". Zie `docs/onderzoek/beslissingen.md`, punt 16, voor wat anders is gedaan dan het ontwerpplan.

- Hoofdoorzaak: de samenvoegmodus (`uiBatchAdd`, generiek) nam geen uv mee, waardoor grille, kentekenplaat en reflector in de standaardweergave zwart waren. Nu gebundeld gelijk aan los.
- Gedeelde grenzen voor kap, lamp, paneel, scherm en bumper (`bodXP`, `bodYBT` en andere): geen kieren meer met zicht op motorruimte of onderstel (stralenraster: 0,0 tot 0,7 procent buiten de voorkantlijst, was 3 tot 11 procent).
- Kap met afgeronde voorhoeken (70 mm) en een zwarte afdichtrand; de kap oogt massief.
- Koplamp: hoofdlens met ribbels, aparte gladde hoekkap, zilveren facettenreflector, zwarte scheiding en een gesloten huis; helder glas aan de buitenkant gezien.
- Voorpaneel in carrosseriekleur vlak met de lampen, met één smalle gaasopening (650 x 76 mm) met fijn honingraatgaas en een donker embleem; het rode trapezium met het zwarte vlak is weg.
- Bumper: bovenrand volgt de lamponderrand, zachte hoeken (analytische normalen), lip langs de onderkant (185 mm boven de grond), zwarte onderzijde, luchtsleuven links, rechts en onder het kentekenvlak, afgeronde oranje knipperlichten van 190 x 50 mm met rand en schroefjes.
- Lak: minder clearcoat en een zachtere weerspiegeling; de kap is niet meer roze uitgewassen. Zijrepeaters op de voorschermen.
- Carrosserie 94,6 duizend driehoeken (was 86,8 duizend; grens 105,7 duizend).
- De basislijn van `visdiff` moet de orkestrator vernieuwen: de presets met de voorkant zijn bewust veranderd.

## Versie 1 (16 oktober 2026)

Eerste publicatie op GitHub Pages. Gebouwd met het framework uit laguna3 (zie `FRAMEWORK` voor de bron-commit).

- Onderzoek: Suzuki Alto 1.0-16V Twist (2001), Zen-basis, G10BB, 3-deurs, handgeschakelde vijfbak, Bright Red 2; bron en status per feit.
- Contract, carrosserie op het gemeten silhouet met Twist-uitrusting (bumpers in carrosseriekleur, dakrails, elektrische spiegels), Nederlandse kentekenplaten zonder tekens.
- Vijf domeinen parallel: motor G10BB (SOHC met tuimelaars, 16 kleppen), handbak met koppeling, differentieel en aandrijfassen, onderstel (McPherson voor, torsie-as achter, 145/70 R13, schijf voor en trommel achter, tandheugel zonder bekrachtiging), interieur, koeling, uitlaat, brandstof en elektra.
- Samenvoegen: doordringingstoets tussen domeinen; wielkastwanden, schutbord, stabilisatorstang, tank met leidingen, torsiesteun, motorkapslot en koppelingsplaat gecorrigeerd. Wat bewust blijft staan: `docs/contract.md`, hoofdstuk 11.
- 35 presets, rondleiding van 12 stappen, openers met ondergrens, interactietest (222 controles).
- Strikte set groen: lint, smoke, integrity, silhouet, inner, opentest, itest, budget, publicatie, visdiff (34 van 34) en ankerpoort, op de basislijn van deze versie.
- Generieke verbeteringen die hier ontstonden en via laguna3 terugkwamen: GPU-drivermelding in `IGNORE` van de harness; `uiPlaceMore` wist de onthouden plek bij verbergen.
