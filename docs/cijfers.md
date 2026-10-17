# Kerncijfers

Gegenereerd door `tools/orkestratie/cijfers.py` uit `stats.json` op 2026-10-17, bron `b0201d0 2026-10-17`. Niet met de hand bewerken; andere documenten verwijzen hiernaar in plaats van getallen te herhalen.

## Boom

| Grootheid | Waarde |
|---|---|
| Knopen | 1.706 |
| Groepen | 319 |
| Onderdelen | 1.387 |
| Diepte | 7 |
| Ingesloten knopen (`inner`) | 125 |
| Presets | 35 |
| Presets per categorie | Overzicht 6, Motor 8, Aandrijving 4, Onderstel 5, Carrosserie 4, Interieur 3, Openen 5 |

## Driehoeken per hoofdgroep

| Hoofdgroep | Onderdelen | Driehoeken | Budget |
|---|---|---|---|
| Aandrijflijn | 549 | 108.132 | 133.500 |
| Carrosserie | 253 | 96.964 | 105.700 |
| Onderstel | 267 | 62.460 | 69.500 |
| Interieur | 176 | 49.156 | 52.900 |
| Koeling en luchtinlaat | 41 | 6.036 | 13.900 |
| Uitlaatsysteem | 35 | 5.820 | 11.100 |
| Elektrisch systeem | 37 | 5.716 | 6.700 |
| Brandstofsysteem | 29 | 4.704 | 6.700 |
| Totaal | 1.387 | 338.988 | 400.000 |

## Tekenopdrachten (gemonteerd)

| Stand | Waarde |
|---|---|
| Met gebundeld renderen | 248 |
| Zonder bundelen | 1.068 |
| Batches | 28 groepen, 207 batchmeshes, 1.027 losse meshes vervangen, 18.7 MB van 28.5 MB |

## Opstarttijdlijn (software-rendering in de container, ms sinds het begin van de navigatie)

| Moment | ms |
|---|---|
| script | 28 |
| buildStart | 69 |
| buildCar | 198 |
| startUp | 287 |
| render0 | 857 |
| firstFrame | 3.925 |
| interactive | 3.927 |
| ready | 5.418 |
| batches | 3.943 |
| duur buildCar() | 129 |

Deze tijden zeggen niets over een echt apparaat; zie `docs/telefoontest.md`.


## Meting en testduur (P1, 17 oktober 2026)

Handmatig toegevoegd op `d044bae`: `tools/orkestratie/cijfers.py` kent deze sectie niet en laat haar vervallen bij opnieuw genereren. Bronnen: `meet.json` en `zijstraal.json` en `tests.txt` van de volledige set (container `~/alto-linux/run-aqHG/uit/ft`, macOS `~/alto-wt/s4-meet/ft-mac`). Uitleg per script: `docs/testen.md`.

| Grootheid | Waarde |
|---|---|
| Poorten van `meet.py` | 112: 99 harde en 13 zachte |
| Zachte poorten groen | 12 van 13 (geel: `afwerking e: embleem leesbaar zijhoek-r light`) |
| Camera's in `meet.json` | 484 |
| Raster van `zijstraal.py` | stap 5 mm, 88.454 stralen per kant, 1.041 meshes (26 huid, 14 uitzondering) |
| Controle van `zijstraal.py` met de Raycaster | 1.774 stralen, 0 verschil |
| Duur `meet`, macOS (GPU) | 243 s (242,3 s in `meet.json`) |
| Duur `meet`, Linux-container in de volledige set | 1.228 s |
| Duur `meet`, Linux-container los | 704 s (`run-PXBQ`) |
| Duur `zijstraal` | macOS 2 s; Linux-container in de volledige set 16 s |
| Volledige set, Linux-container, met `meet` en `zijstraal` | 20 min 46 s |
| Volledige set, Linux-container, zonder extra tests | 6 min 52 s |
| Volledige set, macOS | 7 min 33 s |
