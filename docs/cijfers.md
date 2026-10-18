# Kerncijfers

Gegenereerd door `tools/orkestratie/cijfers.py` uit `stats.json` op 2026-10-19, bron `a2a1d5a 2026-10-18`. Niet met de hand bewerken; andere documenten verwijzen hiernaar in plaats van getallen te herhalen.

## Boom

| Grootheid | Waarde |
|---|---|
| Knopen | 1.757 |
| Groepen | 326 |
| Onderdelen | 1.431 |
| Diepte | 7 |
| Ingesloten knopen (`inner`) | 124 |
| Presets | 35 |
| Presets per categorie | Overzicht 6, Motor 8, Aandrijving 4, Onderstel 5, Carrosserie 4, Interieur 3, Openen 5 |

## Driehoeken per hoofdgroep

| Hoofdgroep | Onderdelen | Driehoeken | Budget |
|---|---|---|---|
| Carrosserie | 294 | 112.312 | 160.000 |
| Aandrijflijn | 550 | 109.248 | 133.500 |
| Onderstel | 264 | 62.484 | 69.500 |
| Interieur | 180 | 51.620 | 52.900 |
| Koeling en luchtinlaat | 41 | 6.456 | 13.900 |
| Uitlaatsysteem | 35 | 5.826 | 11.100 |
| Elektrisch systeem | 37 | 5.700 | 6.700 |
| Brandstofsysteem | 30 | 5.518 | 6.700 |
| Totaal | 1.431 | 359.164 | 400.000 |

## Tekenopdrachten (gemonteerd)

| Stand | Waarde |
|---|---|
| Met gebundeld renderen | 261 |
| Zonder bundelen | 1.118 |
| Batches | 28 groepen, 210 batchmeshes, 1.067 losse meshes vervangen, 20,2 MB van 30,4 MB |

## Opstarttijdlijn (software-rendering van Chromium op de Mac die de cijfers meet, niet in de container; ms sinds het begin van de navigatie)

| Moment | ms |
|---|---|
| script | 54 |
| buildStart | 196 |
| buildCar | 424 |
| startUp | 661 |
| render0 | 2.426 |
| firstFrame | 3.067 |
| interactive | 3.075 |
| ready | 5.450 |
| batches | 3.093 |
| duur buildCar() | 228 |

Deze tijden zeggen niets over een echt apparaat; zie `docs/telefoontest.md`.

