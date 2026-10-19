# Kerncijfers

Gegenereerd door `tools/orkestratie/cijfers.py` uit `stats.json` op 2026-10-19, bron `5c98d05 2026-10-19`. Niet met de hand bewerken; andere documenten verwijzen hiernaar in plaats van getallen te herhalen.

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
| Carrosserie | 301 | 123.015 | 160.000 |
| Aandrijflijn | 550 | 110.304 | 133.500 |
| Interieur | 187 | 88.492 | 100.000 |
| Onderstel | 264 | 62.484 | 69.500 |
| Koeling en luchtinlaat | 41 | 6.436 | 13.900 |
| Uitlaatsysteem | 35 | 5.826 | 11.100 |
| Elektrisch systeem | 37 | 5.688 | 6.700 |
| Brandstofsysteem | 30 | 5.518 | 6.700 |
| Totaal | 1.445 | 407.763 | 447.100 |

## Tekenopdrachten (gemonteerd)

| Stand | Waarde |
|---|---|
| Met gebundeld renderen | 291 |
| Zonder bundelen | 1.129 |
| Batches | 34 groepen, 236 batchmeshes, 1.074 losse meshes vervangen, 20,9 MB van 31,8 MB |

## Opstarttijdlijn (software-rendering van Chromium op de Mac die de cijfers meet, niet in de container; ms sinds het begin van de navigatie)

| Moment | ms |
|---|---|
| script | 76 |
| buildStart | 275 |
| buildCar | 474 |
| startUp | 801 |
| render0 | 2.299 |
| firstFrame | 2.873 |
| interactive | 2.882 |
| ready | 5.222 |
| batches | 5.245 |
| duur buildCar() | 199 |

Deze tijden zeggen niets over een echt apparaat; zie `docs/telefoontest.md`.

