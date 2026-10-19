# Kerncijfers

Gegenereerd door `tools/orkestratie/cijfers.py` uit `stats.json` op 2026-10-19, bron `8c7a4b2 2026-10-19`. Niet met de hand bewerken; andere documenten verwijzen hiernaar in plaats van getallen te herhalen.

## Boom

| Grootheid | Waarde |
|---|---|
| Knopen | 1.773 |
| Groepen | 328 |
| Onderdelen | 1.445 |
| Diepte | 7 |
| Ingesloten knopen (`inner`) | 129 |
| Presets | 35 |
| Presets per categorie | Overzicht 6, Motor 8, Aandrijving 4, Onderstel 5, Carrosserie 4, Interieur 3, Openen 5 |

## Driehoeken per hoofdgroep

| Hoofdgroep | Onderdelen | Driehoeken | Budget |
|---|---|---|---|
| Carrosserie | 301 | 117.175 | 160.000 |
| Aandrijflijn | 550 | 109.248 | 133.500 |
| Onderstel | 264 | 62.484 | 69.500 |
| Interieur | 187 | 52.684 | 52.900 |
| Koeling en luchtinlaat | 41 | 6.436 | 13.900 |
| Uitlaatsysteem | 35 | 5.826 | 11.100 |
| Elektrisch systeem | 37 | 5.688 | 6.700 |
| Brandstofsysteem | 30 | 5.518 | 6.700 |
| Totaal | 1.445 | 365.059 | 400.000 |

## Tekenopdrachten (gemonteerd)

| Stand | Waarde |
|---|---|
| Met gebundeld renderen | 268 |
| Zonder bundelen | 1.129 |
| Batches | 28 groepen, 213 batchmeshes, 1.074 losse meshes vervangen, 20,4 MB van 30,7 MB |

## Opstarttijdlijn (software-rendering van Chromium op de Mac die de cijfers meet, niet in de container; ms sinds het begin van de navigatie)

| Moment | ms |
|---|---|
| script | 119 |
| buildStart | 285 |
| buildCar | 452 |
| startUp | 784 |
| render0 | 2.714 |
| firstFrame | 3.343 |
| interactive | 3.352 |
| ready | 6.282 |
| batches | 6.367 |
| duur buildCar() | 167 |

Deze tijden zeggen niets over een echt apparaat; zie `docs/telefoontest.md`.

