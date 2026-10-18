# Kerncijfers

Gegenereerd door `tools/orkestratie/cijfers.py` uit `stats.json` op 2026-10-18, bron `684f86c 2026-10-18`. Niet met de hand bewerken; andere documenten verwijzen hiernaar in plaats van getallen te herhalen.

## Boom

| Grootheid | Waarde |
|---|---|
| Knopen | 1.711 |
| Groepen | 319 |
| Onderdelen | 1.392 |
| Diepte | 7 |
| Ingesloten knopen (`inner`) | 125 |
| Presets | 35 |
| Presets per categorie | Overzicht 6, Motor 8, Aandrijving 4, Onderstel 5, Carrosserie 4, Interieur 3, Openen 5 |

## Driehoeken per hoofdgroep

| Hoofdgroep | Onderdelen | Driehoeken | Budget |
|---|---|---|---|
| Aandrijflijn | 549 | 108.132 | 133.500 |
| Carrosserie | 258 | 98.212 | 105.700 |
| Onderstel | 267 | 62.460 | 69.500 |
| Interieur | 176 | 49.476 | 52.900 |
| Koeling en luchtinlaat | 41 | 6.036 | 13.900 |
| Uitlaatsysteem | 35 | 5.820 | 11.100 |
| Elektrisch systeem | 37 | 5.716 | 6.700 |
| Brandstofsysteem | 29 | 4.704 | 6.700 |
| Totaal | 1.392 | 340.556 | 400.000 |

## Tekenopdrachten (gemonteerd)

| Stand | Waarde |
|---|---|
| Met gebundeld renderen | 249 |
| Zonder bundelen | 1.073 |
| Batches | 28 groepen, 208 batchmeshes, 1.032 losse meshes vervangen, 18,7 MB van 28,7 MB |

## Opstarttijdlijn (software-rendering van Chromium op de Mac die de cijfers meet, niet in de container; ms sinds het begin van de navigatie)

| Moment | ms |
|---|---|
| script | 27 |
| buildStart | 66 |
| buildCar | 187 |
| startUp | 272 |
| render0 | 777 |
| firstFrame | 3.452 |
| interactive | 3.453 |
| ready | 4.708 |
| batches | 3.476 |
| duur buildCar() | 121 |

Deze tijden zeggen niets over een echt apparaat; zie `docs/telefoontest.md`.

