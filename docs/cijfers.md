# Kerncijfers

Gegenereerd door `tools/orkestratie/cijfers.py` uit `stats.json` op 2026-10-17, bron `4e43bad 2026-10-17`. Niet met de hand bewerken; andere documenten verwijzen hiernaar in plaats van getallen te herhalen.

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
| Aandrijflijn | 549 | 111.492 | 133.500 |
| Carrosserie | 253 | 97.540 | 105.700 |
| Onderstel | 267 | 62.460 | 69.500 |
| Interieur | 176 | 49.156 | 52.900 |
| Koeling en luchtinlaat | 41 | 6.036 | 13.900 |
| Uitlaatsysteem | 35 | 6.012 | 11.100 |
| Elektrisch systeem | 37 | 5.716 | 6.700 |
| Brandstofsysteem | 29 | 4.704 | 6.700 |
| Totaal | 1.387 | 343.116 | 400.000 |

## Tekenopdrachten (gemonteerd)

| Stand | Waarde |
|---|---|
| Met gebundeld renderen | 248 |
| Zonder bundelen | 1.068 |
| Batches | 28 groepen, 207 batchmeshes, 1.027 losse meshes vervangen, 19 MB van 29 MB |

## Opstarttijdlijn (software-rendering in de container, ms sinds het begin van de navigatie)

| Moment | ms |
|---|---|
| script | 62 |
| buildStart | 105 |
| buildCar | 212 |
| startUp | 340 |
| render0 | 770 |
| firstFrame | 1.079 |
| interactive | 1.082 |
| ready | 4.929 |
| batches | 1.104 |
| duur buildCar() | 107 |

Deze tijden zeggen niets over een echt apparaat; zie `docs/telefoontest.md`.

