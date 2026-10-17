# Wijzigingen

## Voorkant, ronde 3: afscherming, voorwielkast en afwerking (tak golf3-front, nog niet gepubliceerd)

Aanleiding: het advies op de herbouw (verdict bijsturen). Metingen met `meet.py` ronde 3 (45 camera's, 69 harde poorten en 13 zachte; 67 van 69 harde poorten groen, de twee rode zijn remhardware in de boog), opnamen en uitleg in `docs/onderzoek/beslissingen.md`, punt 22. Kerncijfers staan in `docs/cijfers.md`.

- Afscherming onder de bumper: eigen zwart materiaal, geen grijze weerkaatsing meer (Onderplaat tegenover Luchtrooster 0,28 tot 0,34, was 1,32 tot 1,69) en geen tand onder de bumperhoek: de diepte van het lint loopt vloeiend over de hele lipbocht.
- Dunne lijn over het bumpervlak weg: de voorrand van de onderplaat stak 0,5 mm voor de lipwand uit (1.150 tot 2.550 beeldpunten, nu 0).
- Voorwielkast dicht: de koker loopt tot de huid, de wand en de koker lopen onder de boog door, de inkeping voor de veerpoot volgt de schroefveer, en een strook achter de portierspleet vangt de schuine blikken. Het Schutbord is niet meer als donkerrode sikkel zichtbaar (698 beeldpunten in eig, nu 0) en door de wielkast zie je geen motorruimte of cabine meer, op de slangbeugel en de remleiding na (93 beeldpunten in een enkele camera).
- Afwerking: plooien in de glans op de bumperbovenrand weg (22 driehoeken naar 0), geen witte spleet met de bumperbalk meer tussen lamphuis en bumpernaad (6.068 beeldpunten naar 0), embleem leesbaarder en matter (0,8 tot 1,9 keer het gaas, was 0,5 tot 1,6), geen rood tandje en treetje meer bij de kaphoek.
- Nog open: de ondergrens van de embleempoort voor de grazende kijkhoek (0,8 haalbaar, 0,9 niet naast de bovengrens 2,0), de twee remhardwarepoorten, `meet.py` in `tools/orkestratie` en `finaltests.sh`, de basislijn van `visdiff`, neusprofiel (beslissing 17, buiten deze publicatie) en de uv-reparatie naar laguna3.

## Voorkant, herbouw na de premortem (tak golf3-front, nog niet gepubliceerd)

Aanleiding: een premortem op de bijsturing hieronder. Alle poorten waren groen, maar twee nieuwe elementen stonden in het beeld van de eigenaar: een embleem dat als het cijfer 5 las en een zwart bord onder de bumper. Metingen met `meet.py` (nu 33 camera's en 44 poorten, alle groen; de vorige set had 26 poorten), opnamen en uitleg in `docs/onderzoek/beslissingen.md`, punt 21.

- Embleem: een doorlopende, gekantelde Suzuki-S met schuine punten in een donker matglanzend materiaal. Helderheid 1,5 tot 1,6 keer die van het gaas (was 4,9 tot 5,2 keer; eis hoogstens 2,0), in licht en donker, van dichtbij en van voren.
- Afscherming onder de bumper: een donker lint van 50 mm dat de omtrek van de lip volgt en 40 mm achter de lipwand zit, in plaats van een voorschort van 90 mm en twee zijschermen van 760 mm. Het lint raakt de aandrijfas niet meer (0 hoekpunten binnen 10 mm, was 1.360). Onderplaat 2,4 keer het gaas in beeld (was 4,6). Zicht onder de bumper blijft onder de eis: 0,31 procent (eig), 0,28 (eig-r), 0,15 (eig-dicht), 0,00 (voor-laag).
- Bumperwang: gladde normalen en geen halve-millimeterrijen meer; de doekachtige plooien en de V-vouw onder de hoekkap zijn weg (kijk naar de opnamen wiel-voor en dicht-hoek). Bumperschouder 19,0 graden.
- Hoekkap van dichtbij: scherm 6 mm over de lamp (sikkel boven de hoekkap weg: Schutbord 4.569 naar 0 beeldpunten), ronde schotel in de hoekreflector, mat zwarte Lamprand, waterkast overlapt de deelnaad.
- Carrosserie 97,7 duizend driehoeken (grens 98 duizend uit ronde 1; harde grens 105,7 duizend).
- Nog open: de afscherming maakt de neus visueel zwaarder (verhouding bumper/lamp tot de onderrand van de afscherming 3,08; tot de lip 2,70), op te lossen met beslissing 17 (ronde 3). Voorkant pas publiceren als de basislijn van `visdiff` per beeld is beoordeeld en het laguna3-issue voor de uv-reparatie bestaat.

## Voorkant, bijsturing na het advies (tak golf3-front, nog niet gepubliceerd)

Aanleiding: het advies op ronde 1 (verdict bijsturen). Metingen met `meet.py` (id-pass zonder z- of y-filter, DPR 2, 18 camera's links en rechts, geijkt op V1); de plannen en cijfers staan in `docs/onderzoek/beslissingen.md`, punt 20.

- Kaphoek en doorkijk dicht: hoekstuk van het voorscherm boven de hoekkap, strook langs de kaprand, lamp 8 mm dieper onder het scherm, lamphuis 8 mm hoger met een scheidingswand onder de Lamprand, kaprand ook achter, scharnieren onder de kap. Alle kierpoorten groen in 18 camera's: geen knoop uit de motorruimte of het onderstel boven 50 beeldpunten breed (lamphoek: 22.313 beeldpunten motorruimte voor, 0 breed na; naden van hoogstens 2 beeldpunten blijven).
- Bumperschouder 18,2 graden (was 26,7) door 27 kolommen met 8 op de schouder. Lip sluit aan op de wang: aansluithoek gemiddeld 4,0 graden (was 50,9).
- Onderplaat voorbumper met voorschort en twee zijschermen: zicht op onderstel en motor onder de bumper 0,00 tot 0,03 procent van het beeld (was 1,1 tot 1,4 procent). **Vervangen in de herbouw hieronder:** het voorschort en de zijschermen hingen als zwart bord onder de bumper en sneden door de aandrijfas.
- Afwerking: bumpernaad onder de schermrand, verdiepte luchtsleuven, lichtere en glaziger hoekreflector, hoekige S van vijf balkjes als embleem (las als een 5, vervangen in de herbouw hieronder), Lamprand stopt op de lamponderrand, zwarte wielkastbekleding en donkerder binnenlak.
- Carrosserie 97,6 duizend driehoeken (was 95,6 duizend; grens 105,7 duizend).
- Nog open: neusprofiel (beslissing 17, ronde 3), basislijn van `visdiff` en de uv-reparatie naar laguna3 (orkestrator), `meet.py` in `tools/orkestratie` en `finaltests.sh`.

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
- Gedeelde grenzen voor kap, lamp, paneel, scherm en bumper (`bodXP`, `bodYBT` en andere): minder kieren met zicht op motorruimte of onderstel (stralenraster: 0,0 tot 0,7 procent buiten de voorkantlijst, was 3 tot 11 procent). Dat raster sloot z < 1,25 en y > 0,95 uit en zag de kaphoek niet; zie het kopje Voorkant, bijsturing hieronder voor de meting zonder filter.
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
