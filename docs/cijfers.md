# Kerncijfers

Gegenereerd door `tools/orkestratie/cijfers.py` uit `stats.json` op 2026-10-16, bron `bedb699 2026-10-16`. Niet met de hand bewerken; andere documenten verwijzen hiernaar in plaats van getallen te herhalen.

## Boom

| Grootheid | Waarde |
|---|---|
| Knopen | 1.703 |
| Groepen | 319 |
| Onderdelen | 1.384 |
| Diepte | 7 |
| Ingesloten knopen (`inner`) | 125 |
| Presets | 35 |
| Presets per categorie | Overzicht 6, Motor 8, Aandrijving 4, Onderstel 5, Carrosserie 4, Interieur 3, Openen 5 |

## Driehoeken per hoofdgroep

| Hoofdgroep | Onderdelen | Driehoeken | Budget |
|---|---|---|---|
| Aandrijflijn | 549 | 111.492 | 133.500 |
| Carrosserie | 250 | 94.584 | 105.700 |
| Onderstel | 267 | 62.460 | 69.500 |
| Interieur | 176 | 49.156 | 52.900 |
| Koeling en luchtinlaat | 41 | 6.036 | 13.900 |
| Uitlaatsysteem | 35 | 6.012 | 11.100 |
| Elektrisch systeem | 37 | 5.716 | 6.700 |
| Brandstofsysteem | 29 | 4.704 | 6.700 |
| Totaal | 1.384 | 340.160 | 400.000 |

## Tekenopdrachten (gemonteerd)

| Stand | Waarde |
|---|---|
| Met gebundeld renderen | 247 |
| Zonder bundelen | 1.065 |
| Batches | 28 groepen, 204 batchmeshes, 1.022 losse meshes vervangen, 18.6 MB van 28.5 MB |

## Opstarttijdlijn (software-rendering in de container, ms sinds het begin van de navigatie)

| Moment | ms |
|---|---|
| script | 60 |
| buildStart | 106 |
| buildCar | 204 |
| startUp | 332 |
| render0 | 976 |
| firstFrame | 3.712 |
| interactive | 3.715 |
| ready | 5.421 |
| batches | 3.740 |
| duur buildCar() | 98 |

Deze tijden zeggen niets over een echt apparaat; zie `docs/telefoontest.md`.

