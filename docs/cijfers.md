# Kerncijfers

Gegenereerd door `tools/orkestratie/cijfers.py` uit `stats.json` op 2026-10-18, bron `7cee818 2026-10-18`. Niet met de hand bewerken; andere documenten verwijzen hiernaar in plaats van getallen te herhalen.

## Boom

| Grootheid | Waarde |
|---|---|
| Knopen | 1.713 |
| Groepen | 319 |
| Onderdelen | 1.394 |
| Diepte | 7 |
| Ingesloten knopen (`inner`) | 125 |
| Presets | 35 |
| Presets per categorie | Overzicht 6, Motor 8, Aandrijving 4, Onderstel 5, Carrosserie 4, Interieur 3, Openen 5 |

## Driehoeken per hoofdgroep

| Hoofdgroep | Onderdelen | Driehoeken | Budget |
|---|---|---|---|
| Aandrijflijn | 549 | 108.132 | 133.500 |
| Carrosserie | 260 | 101.124 | 105.700 |
| Onderstel | 267 | 62.460 | 69.500 |
| Interieur | 176 | 49.476 | 52.900 |
| Koeling en luchtinlaat | 41 | 6.036 | 13.900 |
| Uitlaatsysteem | 35 | 5.820 | 11.100 |
| Elektrisch systeem | 37 | 5.716 | 6.700 |
| Brandstofsysteem | 29 | 4.704 | 6.700 |
| Totaal | 1.394 | 343.468 | 400.000 |

## Tekenopdrachten (gemonteerd)

| Stand | Waarde |
|---|---|
| Met gebundeld renderen | 249 |
| Zonder bundelen | 1.075 |
| Batches | 28 groepen, 208 batchmeshes, 1.034 losse meshes vervangen, 19 MB van 29 MB |

## Opstarttijdlijn (software-rendering van Chromium op de Mac die de cijfers meet, niet in de container; ms sinds het begin van de navigatie)

| Moment | ms |
|---|---|
| script | 40 |
| buildStart | 98 |
| buildCar | 367 |
| startUp | 514 |
| render0 | 1.094 |
| firstFrame | 1.607 |
| interactive | 1.611 |
| ready | 3.705 |
| batches | 3.715 |
| duur buildCar() | 269 |

Deze tijden zeggen niets over een echt apparaat; zie `docs/telefoontest.md`.

