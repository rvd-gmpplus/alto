# Kerncijfers

Gegenereerd door `tools/orkestratie/cijfers.py` uit `stats.json` op 2026-10-16, bron `c454cec 2026-10-16`. Niet met de hand bewerken; andere documenten verwijzen hiernaar in plaats van getallen te herhalen.

## Boom

| Grootheid | Waarde |
|---|---|
| Knopen | 1.687 |
| Groepen | 319 |
| Onderdelen | 1.368 |
| Diepte | 7 |
| Ingesloten knopen (`inner`) | 125 |
| Presets | 35 |
| Presets per categorie | Overzicht 6, Motor 8, Aandrijving 4, Onderstel 5, Carrosserie 4, Interieur 3, Openen 5 |

## Driehoeken per hoofdgroep

| Hoofdgroep | Onderdelen | Driehoeken | Budget |
|---|---|---|---|
| Aandrijflijn | 549 | 111.492 | 133.500 |
| Carrosserie | 234 | 86.776 | 105.700 |
| Onderstel | 267 | 62.460 | 69.500 |
| Interieur | 176 | 49.156 | 52.900 |
| Koeling en luchtinlaat | 41 | 6.036 | 13.900 |
| Uitlaatsysteem | 35 | 6.012 | 11.100 |
| Elektrisch systeem | 37 | 5.716 | 6.700 |
| Brandstofsysteem | 29 | 4.704 | 6.700 |
| Totaal | 1.368 | 332.352 | 400.000 |

## Tekenopdrachten (gemonteerd)

| Stand | Waarde |
|---|---|
| Met gebundeld renderen | 237 |
| Zonder bundelen | 1.051 |
| Batches | 28 groepen, 196 batchmeshes, 1.010 losse meshes vervangen, 14.9 MB van 25.2 MB |

## Opstarttijdlijn (software-rendering in de container, ms sinds het begin van de navigatie)

| Moment | ms |
|---|---|
| script | 60 |
| buildStart | 100 |
| buildCar | 170 |
| startUp | 291 |
| render0 | 909 |
| firstFrame | 3.046 |
| interactive | 3.048 |
| ready | 5.846 |
| batches | 89 |
| duur buildCar() | 70 |

Deze tijden zeggen niets over een echt apparaat; zie `docs/telefoontest.md`.

