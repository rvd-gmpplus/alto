# Kerncijfers

Gegenereerd door `tools/orkestratie/cijfers.py` uit `stats.json` op 2026-10-19, bron `28f48bd 2026-10-19`. Niet met de hand bewerken; andere documenten verwijzen hiernaar in plaats van getallen te herhalen.

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
| Carrosserie | 301 | 121.191 | 160.000 |
| Aandrijflijn | 550 | 110.304 | 133.500 |
| Onderstel | 264 | 62.484 | 69.500 |
| Interieur | 187 | 52.508 | 52.900 |
| Koeling en luchtinlaat | 41 | 6.436 | 13.900 |
| Uitlaatsysteem | 35 | 5.826 | 11.100 |
| Elektrisch systeem | 37 | 5.688 | 6.700 |
| Brandstofsysteem | 30 | 5.518 | 6.700 |
| Totaal | 1.445 | 369.955 | 400.000 |

## Tekenopdrachten (gemonteerd)

| Stand | Waarde |
|---|---|
| Met gebundeld renderen | 268 |
| Zonder bundelen | 1.129 |
| Batches | 28 groepen, 213 batchmeshes, 1.074 losse meshes vervangen, 20,5 MB van 30,9 MB |

## Opstarttijdlijn (software-rendering van Chromium op de Mac die de cijfers meet, niet in de container; ms sinds het begin van de navigatie)

| Moment | ms |
|---|---|
| script | 65 |
| buildStart | 215 |
| buildCar | 386 |
| startUp | 641 |
| render0 | 2.370 |
| firstFrame | 2.971 |
| interactive | 2.978 |
| ready | 5.419 |
| batches | 5.496 |
| duur buildCar() | 171 |

Deze tijden zeggen niets over een echt apparaat; zie `docs/telefoontest.md`.

