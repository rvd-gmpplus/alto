# Wijzigingen

## Versie 2 (tak golf3-front, nog niet gepubliceerd)

Aanleiding: "de basis ziet er goed uit, maar de koplampen zien er ruk uit in combinatie met de grille". Deze versie herbouwt de voorkant in vier rondes met premortem en advies na elke ronde. Uitleg, cijfers en afwijkingen per stap staan in `docs/onderzoek/beslissingen.md` (punt 16 tot en met 25); kerncijfers in `docs/cijfers.md`. Alleen wat een meting of opname draagt staat hier.

- Koplamp: helder glas met zilveren facettenreflector, zonder raster; de hoekreflector is hoogstens 0,055 helderder dan de hoofdreflector, zwart binnen de lens hoogstens 0,14 procent (was tot 3,9). In de gespiegelde camera's (eig-r, lamphoek-r) is de hoekreflector 0,14 tot 0,24 donkerder; dat is nog niet door de eigenaar of de adviseur beoordeeld.
- Grille en embleem: honingraatgaas in een smalle opening, donker; het embleem is een doorlopende, gekantelde S die niet meer als een 5 leest (helderheid 1,5 tot 1,6 keer die van het gaas).
- Bumper en lak: zachte hoeken, lip langs de onderkant, bumperschouder 18,9 graden, de lijn is vrijwel waterpas (hoekkap +3,9 en -6,2 mm). Lak dieper en matter; de kap is niet meer wit. Verhouding bumper/lamp op x = 0: 2,70 tot de lip en 3,08 tot de afscherming.
- Afscherming onder de bumper: antraciet lint van 50 mm langs de lip (0,55 tot 0,74 keer het luchtrooster); zicht op onderstel en motor onder de bumper 0,00 tot 0,32 procent van het beeld (grens 0,5).
- Kieren en doorkijk: kaphoek, hoekstuk van het voorscherm, scharnieren onder de kap en de uv-fout in de samenvoegmodus (grille, kentekenplaat en reflector waren zwart) zijn hersteld.
- Voorwielkast van opzij: het venster boven de band (Hoofdremcilinder 3.978 beeldpunten in wielkast-recht) en de gaten onderin de boog (langsligger, vloermat, scharnierblad) zijn dicht; de scharnieren staan hoger (y 0,53 en 0,62). Tegenover c9ce3fb: 0 nieuwe camera's met doorkijk (vrije sweep 923 naar 721, rondgang 811 naar 698); lamp, grille en bumper beeldpunt voor beeldpunt gelijk.
- Voetruimte bij een open portier: de binnenplaat volgt de boog en de wandplaat is vervallen; Voetsteun 86 tot 88 procent van c9ce3fb (premortem: 90), koppelingspedaalarm 100 procent, vloermatten 98 procent.
- Preset Cilinderkop en tuimelaars: pad 1,16 (was 1,04), zodat het kader in Chromium op Linux in het vrije beeld valt (itest controle 7).
- Meting: `meet.py` ronde 4 (99 harde poorten, 13 zachte), op `976eaf2` door het advies zelf gedraaid: 99 van 99 harde en 12 van 13 zachte groen (zijhoek-r licht 0,80); op c9ce3fb 71 van 99. Lokaal en in de container alle losse tests groen behalve visdiff (container 0 van 34 beelden, lokaal 21 van 34 binnen de drempel; bekend: lettertypen en lak). De driehoekstelling in `docs/cijfers.md` is van `d2ae9f1` en nog niet opnieuw gemeten na het terugdraaien van de achterplaten.
- Teruggedraaid: sluitplaten voor en achter de achterband (`d2ae9f1`, teruggedraaid in `dc4b70e`). Ze stonden op x 0,715, terwijl de huid achter het wiel op x 0,696 tot 0,716 ligt, en staken links tot 17 mm en rechts tot 23 mm door het achterscherm: een zwarte plaat in gewone zijblikken die geen poort zag. De achterwielkast valt buiten deze versie.
- Door de orkestrator geaccepteerd als bekend punt: de buitenplaat als zwart blad vooraan in de deuropening bij een open portier (x 0,625, vanaf z 0,70) en de rode voorrand van het portier in de voorwielboog (8.587 beeldpunten in wielkast-recht, c9ce3fb 8.333; 16.914 tegen 8.405 in k-portier-scharnier). Beide zijn geen doorkijk.
- Open voor een volgende golf: de achterwielkast (doorkijk naar achterbank, bagagebekleding en vloer, 18 van 21 achterste poorten rood; vraagt `interior.js`) en beslissing 17 (neus: kapvoorrand 0,745 tegen 0,685 tot 0,715 op de foto's; de lamp- en grillecamera's zijn daar niet door beoordeeld). Voor de orkestrator: `meet.py` en `rays.py` in `tools/` en in `finaltests.sh` (met een zijstraalcontrole voor platen die door de huid steken), de basislijn van `visdiff` na akkoord, de uv-reparatie naar laguna3 (controle `kentekenplaat gebundeld`) en itest controle 7, die in de container om en om valt.

## Versie 1 (16 oktober 2026)

Eerste publicatie op GitHub Pages. Gebouwd met het framework uit laguna3 (zie `FRAMEWORK` voor de bron-commit).

- Onderzoek: Suzuki Alto 1.0-16V Twist (2001), Zen-basis, G10BB, 3-deurs, handgeschakelde vijfbak, Bright Red 2; bron en status per feit.
- Contract, carrosserie op het gemeten silhouet met Twist-uitrusting (bumpers in carrosseriekleur, dakrails, elektrische spiegels), Nederlandse kentekenplaten zonder tekens.
- Vijf domeinen parallel: motor G10BB (SOHC met tuimelaars, 16 kleppen), handbak met koppeling, differentieel en aandrijfassen, onderstel (McPherson voor, torsie-as achter, 145/70 R13, schijf voor en trommel achter, tandheugel zonder bekrachtiging), interieur, koeling, uitlaat, brandstof en elektra.
- Samenvoegen: doordringingstoets tussen domeinen; wielkastwanden, schutbord, stabilisatorstang, tank met leidingen, torsiesteun, motorkapslot en koppelingsplaat gecorrigeerd. Wat bewust blijft staan: `docs/contract.md`, hoofdstuk 11.
- 35 presets, rondleiding van 12 stappen, openers met ondergrens, interactietest (222 controles).
- Strikte set groen: lint, smoke, integrity, silhouet, inner, opentest, itest, budget, publicatie, visdiff (34 van 34) en ankerpoort, op de basislijn van deze versie.
- Generieke verbeteringen die hier ontstonden en via laguna3 terugkwamen: GPU-drivermelding in `IGNORE` van de harness; `uiPlaceMore` wist de onthouden plek bij verbergen.
