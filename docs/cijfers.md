# Kerncijfers

Gegenereerd door `tools/orkestratie/cijfers.py` uit `stats.json` op 2026-10-18, bron `dc5b5de 2026-10-18`. Niet met de hand bewerken; andere documenten verwijzen hiernaar in plaats van getallen te herhalen.

## Boom

| Grootheid | Waarde |
|---|---|
| Knopen | 1.721 |
| Groepen | 318 |
| Onderdelen | 1.403 |
| Diepte | 7 |
| Ingesloten knopen (`inner`) | 124 |
| Presets | 35 |
| Presets per categorie | Overzicht 6, Motor 8, Aandrijving 4, Onderstel 5, Carrosserie 4, Interieur 3, Openen 5 |

## Driehoeken per hoofdgroep

| Hoofdgroep | Onderdelen | Driehoeken | Budget |
|---|---|---|---|
| Aandrijflijn | 550 | 109.248 | 133.500 |
| Carrosserie | 269 | 102.336 | 160.000 |
| Onderstel | 264 | 62.484 | 69.500 |
| Interieur | 177 | 49.968 | 52.900 |
| Koeling en luchtinlaat | 41 | 6.456 | 13.900 |
| Uitlaatsysteem | 35 | 5.826 | 11.100 |
| Elektrisch systeem | 37 | 5.700 | 6.700 |
| Brandstofsysteem | 30 | 5.518 | 6.700 |
| Totaal | 1.403 | 347.536 | 400.000 |

## Tekenopdrachten (gemonteerd)

| Stand | Waarde |
|---|---|
| Met gebundeld renderen | 259 |
| Zonder bundelen | 1.090 |
| Batches | 28 groepen, 208 batchmeshes, 1.039 losse meshes vervangen, 19,4 MB van 29,5 MB |

## Opstarttijdlijn (software-rendering van Chromium op de Mac die de cijfers meet, niet in de container; ms sinds het begin van de navigatie)

| Moment | ms |
|---|---|
| script | 46 |
| buildStart | 132 |
| buildCar | 435 |
| startUp | 600 |
| render0 | 1.102 |
| firstFrame | 1.700 |
| interactive | 1.712 |
| ready | 4.103 |
| batches | 4.170 |
| duur buildCar() | 303 |

Deze tijden zeggen niets over een echt apparaat; zie `docs/telefoontest.md`.

