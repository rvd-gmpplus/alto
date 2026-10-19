# Bouwcontract: Suzuki Alto 1.0-16V Twist (2001)

Dit contract legt vast wat de domeineigenaars van elkaar mogen verwachten. Het volgt het sjabloon in [sjabloon-contract.md](sjabloon-contract.md); de architectuur van de app (knoop-API, uitklaplogica, modus Openen, bundelen, `inner`, `hideWhen`) staat in [ontwerp-en-architectuur.md](ontwerp-en-architectuur.md) en verandert per auto niet. Wie een waarde wijzigt, meldt dat aan de orkestrator. De feiten en hun status staan in [specificaties-en-bronnen.md](specificaties-en-bronnen.md); de keuzes bij open vragen in [onderzoek/beslissingen.md](onderzoek/beslissingen.md). De getallen komen uit `src/body.js` (de carrosserie, stap 3); waar een waarde geschat is, staat dat erbij.

## 1. De auto

| Onderwerp | Keuze | Bron |
|---|---|---|
| Model en fase | Suzuki Alto, Zen-gebaseerde Europese uitvoering ("Alto 16V", 2000 tot 2002), 3-deurs hatchback, bouwjaar 2001 | onderzoek, eigenaar |
| Uitvoering | 1.0-16V Twist (geleverd november 2000 tot april 2002) | eigenaar, Autowereld (aannemelijk) |
| Lak | Bright Red 2, code Z9T (aannemelijk), effen rood zonder metallic; kleurwaarde ongeveer #C8323C (geschat); voor- en achterbumper van ongelakt zwart kunststof (keuze eigenaar naar de foto van de modelreeks 1993-2001, beslissing 29 en pakket ACHTER van golf 6; de bron noemt voor de Twist bumpers in carrosseriekleur) | eigenaar, RDW-kleurverdeling, foto's |
| Wielen en banden | 145/70 R13 (TR) op stalen velgen van 13 inch met volle kunststof wieldoppen; vier bouten, steek 4 x 100 mm (geschat); bandstraal 0,2666 m | Autoweek, foto's |
| Motor | G10BB: viercilinder in lijn, 16 kleppen, SOHC, 993 cc, 72,0 x 61,0 mm, 43 kW (58 pk) bij 6000 tpm, 78 Nm bij 4500 tpm, multipoint-inspuiting, Euro 3 | werkplaatshandboek, Autoweek |
| Bak | Handgeschakelde 5-bak, voorwielaandrijving | eigenaar (bevestigd) |
| Bijzonderheden | Twist-uitrusting: elektrische ramen voor, centrale vergrendeling, elektrisch verstelbare en verwarmde buitenspiegels (handmatig inklapbaar), getint glas, dakrails (los te verwijderen), hoofdsteunen voor (geen achter, bevestigd door de eigenaar), deelbare achterbank. Geen stuurbekrachtiging, geen airbags, geen ABS, geen glazen dak (`panorama.js` blijft leeg) | eigenaar, Autowereld (aannemelijk), Autoweek |
| Tank, gewicht | 35 l; leeggewicht 705 of 725 kg | Autoweek, RDW, Autowereld |

Open punten bij de eigenaar: of het motorplaatje G10BB (43 kW, Euro 3) zegt, gezien de vermelding "E2" en "145 km/u" op de Autowereld-pagina van de Twist; de exacte lakcode; een recht zijaanzicht om het silhouet te verscherpen.

Kenteken en chassisnummer komen nooit in de repo, de pagina of een commitbericht; de kentekenplaten in het model zijn blanco.

## 2. Assen en hoofdmaten (autoframe)

Meter. x links (+) en rechts (-), y omhoog vanaf de grond, z naar voren (+). De auto is in de lengte gecentreerd. `src/body.js` exporteert deze symbolen.

| Symbool | Waarde | Herkomst |
|---|---|---|
| `ZF`, `ZR` | +1,7475 en -1,7475 | lengte 3495 mm |
| `AXF`, `AXR` | +1,087 en -1,248 | wielbasis 2335 mm; overhang voor 0,661 m en achter 0,499 m (geschat uit een zijaanzicht, fout 3 tot 5 cm) |
| `AY` | 0,265 | bandstraal 0,2666 m minus 1,6 mm indrukking |
| `ARCH` | 0,30 | wielboogstraal (band 0,267 m, speling 3 cm) |
| `TRACK_F`, `TRACK_R` | 0,6675 en 0,6525 | spoor 1335 en 1305 mm |
| `BOD_WMAX` | 0,7535 | halve breedte zonder spiegels 0,7475 plus 6 mm (breedte 1495 mm) |
| `BOD_MIRW` | 0,904 | halve breedte met spiegels plus 6 mm; de liggende spiegels reiken tot 0,898, 150 mm buiten de huid (geschat; de opvolger van 2002 heeft volgens de ADAC 1475 mm zonder en 1775 mm met spiegels, ook 150 mm per kant) |
| `BOD_H` | 1,405 | hoogte onbeladen (brochure); de dakrails staan er 3 cm bovenop |
| `HW(z)` | 0,7475 van z -1,20 tot +0,90; neus 0,651 bij +1,65, 0,612 bij +1,69 en 0,53 bij +1,7475 (beslissing 29: vollere hoeken); staart 0,50 bij -1,7475 | silhouet (bovenaanzicht) |
| `YB(z)` | dorpel 0,215 tot 0,25; voorbumper 0,27 (rand 0,31); achterbumper 0,275 (rand 0,34) | geschat |
| `YT(z)` | gordellijn: 0,886 (z 0,78), 0,884 (z 0,6 en 0,4), 0,890 (0,0), 0,910 (-0,4), 0,942 (-0,8), 0,955 (-1,0 tot -1,2) (beslissing FLANK-1, golf 7: tot 25 mm lager naar de foto's; was 0,894, 0,913, 0,936, 0,955 en 0,960; z 0,6 en 0,78 beslissing KAS-3, golf 8: was 0,892 en 0,901); schouder voor 0,903 (z 0,85) dalend naar 0,720 (z 1,60) en 0,698 (z 1,66), dan het steile front tot 0,548 (z 1,688) en 0,500 (nok); bolling van de kap op de neus 6 mm (beslissing 29) | silhouet, belt, foto 1993-2001 |
| `YR(z)` | daklijn op de hartlijn: 0,930 (z 0,90), 1,105 (0,6), 1,285 (0,35), 1,380 (0,1), 1,405 (-0,4 tot -0,65), 1,382 (-1,15), 1,17 (-1,45), 0,90 (-1,70) | silhouet (top) |
| `BOD_KASD`, `bodKasD(z)` | 0,035 | de kas begint op de gordel zoveel verder naar buiten dan de schouder van FLANK-2: vol van z -1,15 tot 0,70, glad naar 0 op z -1,50 en 1,0 (beslissing KAS-2, golf 8, naar de foto's van de modelreeks); halve breedte van de kas op de gordel 0,719 (was 0,684) |
| `surfX(z, y)` | buitenhuid in x op hoogte y; boven de gordel de halve breedte van ruit, stijl of dak; boven dek of dak 0 | carrosserie |
| `skin(z, y, s, out)` | punt op de huid | carrosserie |

De doorsnede van de onderbak is een loft in (z, s): vlakke onderkant, bodemhoek (straal 0,045), flank als boog (breedst op y ca. 0,54, onderaan 12 mm en bovenaan 14 mm langs het portier, 26 mm bij de hoekruit en 61 mm op de achterhoek ingelopen), schouder (straal 0,016 langs portier en voorscherm, 0,003 op het achterscherm), dek met kroon (3 cm voor de kap); de schouder eindigt op de plek van het oude profiel (flank met 12 mm bolling, schouder 0,055) plus `bodKasD(z)` (beslissing KAS-2: de kas begint 35 mm verder naar buiten). Vóór z 1,0 loopt het profiel naar het oude terug (vol op z 1,4: de neus van beslissing 29). `ringX0(z, y)` geeft de halve breedte van het oude profiel, voor delen binnen de huid die op hun plaats blijven (binnenkant portier). Beslissing FLANK-2 en FLANK-3 (golf 7). De kas (ruiten, stijlen, dak) is een loft in (z, q); bovenrand van de zijwand en dakrand liggen waar ze lagen met 0,28 hellende ruitstijlen vanaf de oude gordel, de zijwand loopt van de bredere gordel (`bodKasD`) naar die bovenrand en helt dus 0,365 tot 0,38 langs portier en hoekruit (KAS-2); daklijn en gordel volgen `data/silhouet.json` (alle stations binnen de tolerantie, de voorruit aan de bovengrens, de achterruit zo steil als de tolerantie toelaat).

## 3. Motorframe en aandrijflijn

Oorsprong op de krukas-as, in het midden van het blok (tussen cilinder 2 en 3, waar het axiaallager zit). +x loopt langs de krukas naar de vliegwiel- en bakzijde (links in de auto), +y langs de cilinders omhoog, +z naar de inlaatzijde (naar de voorkant van de auto). Cilinder 1 staat aan de poeliezijde, dus op -x (rechts in de auto): de cilinders staan op x = -0,1185, -0,0395, +0,0395 en +0,1185 (steek 0,079 m, geschat). De distributie en de krukaspoelie zitten rechts, de koppeling en de bak links (handboek).

| Symbool | Beginwaarde | Reden |
|---|---|---|
| `PT_POS` | (-0,13; 0,36; 1,217) | motor en bak (breedte 0,78 m, van motor-x -0,26 tot +0,52) staan in de breedte gecentreerd; de krukas ligt 0,095 m boven het differentieel; de onderkant van de carterpan komt daarmee op circa y 0,17 (bodemvrijheid 160 mm, geschat) |
| `PT_TILT` | 0 rad | geen hoek in de bronnen gevonden; rechtopstaand (besluit 11) |
| `GB_X` | 0,30 | vlak tussen blok en bak: blokeinde 0,178 plus 0,12 m koppelingshuis |
| `DIFF` (bakframe) | (0,13; -0,095; -0,13) | differentieelas op x = +0,30, y = 0,265 en z = 1,087 in het autoframe |

Eisen: de as van het differentieel ligt binnen 3 cm van de hartlijn van de voorwielen (y 0,265, z 1,087, dus op 0 cm); gebruik altijd `fromPT`, `toPT`, `ENG2CAR` en `PTM` (`drivetrain.js`). De aandrijfassen zijn ongelijk van lengte: links circa 0,37 m, rechts circa 0,97 m met een tussenas of schuine stand (de rechterkant is het langste stuk, handboek hoofdstuk 9).

**Keuze inlaat en uitlaat: inlaat aan de voorkant (+z), uitlaat aan de achterkant (-z).** Redenen: (1) de motorkap is voor het laagst (0,745 bij de neus) en achter het hoogst (0,93); de lage inlaatzijde krijgt de compacte inlaatkast en luchtfilter, de hoge ruimte achter het blok past bij spruitstuk en katalysator. (2) Het spruitstuk met driewegkatalysator en twee lambdasondes zit zo vlak voor het schutbord (z 0,866) en de pijp loopt de kortste weg onder de vloer naar achter; de hete delen blijven bij het radiatorpakket vandaan. (3) Het is dezelfde conventie als het sjabloon (+z naar de inlaatzijde); de koelventilator en radiator zitten voor de inlaatkast. De bronnen geven geen inlaat- of uitlaatzijde (besluit 11, Niet gevonden): dit is dus een representatieve keuze, geschat; foto's van de motorruimte van de eigenaar kunnen hem omkeren. Er is geen turbo en geen intercooler.

## 4. Motorkap en ruimte in de motorruimte

Het kapprofiel staat in `body.js`. `integrity.py` faalt als een onderdeel minder dan 2,5 cm onder de buitenhuid van de motorkap blijft, of minder dan 0,5 cm onder de laagste laag van de kap (binnenframe 3 cm, isolatiemat 4 cm onder de huid, tussen z 1,01 en 1,48). Met marge voor afronding:

| z (m) | Buitenkant kap op de hartlijn | Hoogste punt van onderdelen bij x = 0 | Bij \|x\| = 0,55 |
|---|---|---|---|
| 0,95 (achterrand kap) | 0,923 | 0,875 | 0,865 |
| 1,05 | 0,910 | 0,865 | 0,855 |
| 1,15 | 0,889 | 0,845 | 0,835 |
| 1,25 | 0,863 | 0,820 | 0,805 |
| 1,35 | 0,834 | 0,790 | 0,780 |
| 1,45 | 0,804 | 0,760 | 0,745 |
| 1,55 | 0,770 | 0,725 | 0,710 |
| 1,60 | 0,745 (sinds beslissing 29 0,744) | 0,700 | 0,685 |
| 1,66 (voorrand kap, beslissing 29) | 0,704 | 0,675 | 0,670 |

De kap is 0,62 m halfbreed tot z 1,2 en versmalt naar 0,55 bij de neus, met een voorhoek van 25 mm straal (beslissing 29; was 70 mm); de voorrand ligt sinds beslissing 29 op z 1,66 (was 1,60); de koplampen en schermstroken liggen daarbuiten. Gereserveerde ruimte in de motorruimte:

| Zone | Wat | Eigenaar |
|---|---|---|
| Schutbord op z 0,866 (voorvlak) en 0,854 (achtervlak), kap-scharnieren op z 0,92 tot 1,0, x = +-0,50 | niets plaatsen binnen 4 cm van het schutbord; de uitlaat (katalysator) mag er vlak voor, tot z 0,95. Het schutbord loopt onder y 0,58 alleen tot |x| 0,50 (de wielkastwanden) en daarboven tot |x| 0,69. Uitzondering: doorvoeren en bevestigingen mogen het schutbord raken en er doorheen steken (golf 2): de rembekrachtiger met zijn vier pennen (tot z 0,854) en de duwstang, de stuurkolomdoorvoer met de tussenas en de onderste kruiskoppeling, de stompen en doorvoerplaat van de kachel, de doorvoer van de kabelboom, de klemmen van het stuurhuis en de steunplaten van zekeringkast en regeleenheid. Het dashboard begint op z 0,85, achter het schutbord; de wissermotor zit in de waterkast ervoor (z 0,867 tot 0,957) | carrosserie, systemen, onderstel, interieur |
| Veerpoottorens x = +-0,50, z 1,02 tot 1,16, y 0,56 tot 0,76 (straal 0,05 bovenaan, 0,07 onderaan) | alleen de veerpoot en de bovenste lagerplaat | onderstel |
| Wielkasten: binnenwand op |x| = 0,50, boog met straal 0,312 om (z 1,087, y 0,265); de wand begint pas op y 0,42 (voor) en y 0,485 (achter), daaronder lopen aandrijfas, stuurstangen, draagarmen en achteras vrij; voor heeft de wand en het dak een uitsparing (halve breedte 7,5 cm, tot |x| 0,58) voor de veerpoot | de motor blijft binnen |x| < 0,49 onder y 0,58 | motor, aandrijving, onderstel |
| Frontmodule (z 1,575 tot 1,625) en koelpakket (z 1,41 tot 1,55) | radiator, koelventilator, slot, bumperbalk (z 1,66, y 0,40). Sinds beslissing 29 staan koplampen en grille op het steile front (z 1,66 tot 1,69) met hun huis tot ongeveer z 1,59, en een schot van 1 mm op z 1,6405 (y 0,640 tot 0,696, over de volle breedte van grille en lampen) sluit de ruimte onder de kapvoorrand af | systemen, carrosserie |
| Motorkapsteun (x = -0,575, voet op z 1,0 en y 0,84; open tot y 1,29) | stang van 0,51 m met de voet naast de rechter veerpoottoren; in rust ligt hij schuin naar voren langs de rechter binnenwand; houd x -0,60 tot -0,55 tussen z 1,0 en 1,37 vrij | carrosserie |
| Accu | links voor, tussen luchtfilterhuis en wielkast (x 0,305 tot 0,495, y 0,50 tot 0,69, z 1,378 tot 1,508, sinds golf 5 22 mm naar achteren): vrij onder de tabel hierboven en 38 cm voor de rembekrachtiger | systemen |

De motor (met inlaat) houdt tot de samenvoeging de hoogte van de tabel aan; het ventieldeksel reikt tot y 0,76 (krukas plus 0,40) en de inlaatkast tot y 0,79; bij z 1,35 is 0,79 de grens.

## 5. Aansluitpunten

`ENG_PORTS` (motorframe, `engine1.js`): elke poort is `{ p, dir }`; `portAt(poort, afstand)` geeft een punt op die afstand langs de richting. Beginwaarden, alle geschat en door de motoreigenaar te bevestigen.

| Poort | Plaats p | Richting | Gebruiker |
|---|---|---|---|
| `exhaustOut` | (0,02; 0,17; -0,215) | (0, -1, 0) | uitlaatspruitstuk naar de voorkatalysator |
| `throttleIn` | (0,20; 0,30; 0,19) | (1, 0, 0) | luchtfilterslang naar de gasklep |
| `thermostatOut` | (-0,19; 0,30; 0,10) | (0, 1, 0) | koelslang boven naar de radiateur |
| `waterPumpIn` | (-0,155; 0,06; 0,15) | (0, 0, 1) | koelslang onder van de radiateur |
| `fuelRailIn` | (0,205; 0,285; 0,17) | (1, 0, 0) | brandstofleiding naar de verdeelleiding |
| `evapPurge` | (0,05; 0,33; 0,20) | (0, 1, 0) | slang van het koolstoffilter (EVAP) naar de inlaat |

Vervallen ten opzichte van laguna3: `compIn` en `compOut` (geen turbo en geen intercooler), `turbineOut` (wordt `exhaustOut`), en `psOut` en `psIn` (geen stuurbekrachtiging). Het onderstel gebruikt `ENG_PORTS` zonder terugvalwaarden voor de stuurpomp.

`DRV_PORTS` (`drivetrain.js`): `starterTerminal` (motorframe, beginwaarde [GB_X + 0,10; -0,04 + 0,062; 0,147 + 0,012], door de startmotor gezet op het plusklemmetje), `diffOutL` en `diffOutR` (aandrijfas-uitgangen links en rechts van het differentieel: x = GB_X + 0,13 +- 0,082, y -0,095, z -0,13 in het motorframe), `clutchLever` (de koppelingsarm op het huis: (GB_X + 0,03; -0,05; -0,03), kabel naar het pedaal in het interieur) en `shiftIn` (de ingang van de schakelstang op de bak: (GB_X + 0,15; 0,0; -0,05), naar de pook).

## 6. Namen (ankers)

Elke naam komt precies een keer voor in de boom; `tools/anchors.json` is de lijst die getoetst wordt (alleen de carrosserie staat er nu volledig in, de andere groepen staan als `contains` en worden pas getoetst als ze bestaan).

- Wortel: `Suzuki Alto`, met precies acht kinderen in deze volgorde: Carrosserie, Interieur, Aandrijflijn, Onderstel, Koeling en luchtinlaat, Uitlaatsysteem, Brandstofsysteem, Elektrisch systeem.
- `Onderstel` heeft precies vier kinderen: Vooras en stuurinrichting, Achteras, Wielen, Remsysteem.
- De motor heet **Motor G10BB** (kind van Aandrijflijn). De motorkap heet `Motorkap`.

| Hoofdgroep | Ankernamen (eigenaar) |
|---|---|
| Carrosserie | Carrosseriekooi (Vloer en dorpels met Bodemplaat, Voorbouw met Schutbord en Frontmodule, Achterbouw, Zijwanden en dak met Dakpaneel, Waterkast, Hoekruit links en rechts), Motorkap (met Motorkapsteun), Achterklep (met Gasveer links en rechts), Voorbumper, Achterbumper, Portier links en rechts (met Buitenspiegel links en rechts, elk met Zijruit), Voorruit, Koplamp links en rechts, Achterlicht links en rechts, Grille en voorpaneel, Kentekenvlak achter, Ruitenwissers, Tankvulopening (met Tankklep), Dakrail links en rechts |
| Aandrijflijn | Motor G10BB (Motorblok, Krukmechanisme, Cilinderkop, Distributie, Hulpaandrijving, Smering, Inlaatspruitstuk, Uitlaatspruitstuk), Handbak 5-versnellingen (Koppeling, Differentieel), Aandrijfassen (Aandrijfas links, Aandrijfas rechts), Startmotor |
| Interieur | Dashboard, Middenconsole, Stoelen (Bestuurdersstoel, Passagiersstoel, Achterbank met deelbare rugleuning), Bekleding |
| Onderstel | Vooras en stuurinrichting (Stuurinrichting met Stuurwiel, Wielophanging linksvoor en rechtsvoor), Achteras (Wielophanging linksachter en rechtsachter), Wielen (Wiel linksvoor, rechtsvoor, linksachter, rechtsachter), Remsysteem (Handrem) |
| Koeling en luchtinlaat | Radiateur, Koelventilator, Expansievat, Luchtfilter |
| Uitlaatsysteem | Katalysator, Middendemper, Einddemper |
| Brandstofsysteem | Brandstoftank, Vulsysteem (de vulhals hoort achter de Tankklep, de opening zit in de carrosserie), Brandstofpomp |
| Elektrisch systeem | Accu, Motorregeleenheid, Kabelboom |

## 7. Eigendom en voorvoegsels

| Domein | Bestanden | Voorvoegsel |
|---|---|---|
| Carrosserie | `body.js`, `bodyparts.js` (`panorama.js` blijft leeg: geen glazen dak) | `bod` |
| Motor | `engine1.js`, `engine2.js`, `engine3.js` | `eng` |
| Aandrijving | `drivetrain.js` | `drv` |
| Onderstel | `chassis.js` | `chs` |
| Interieur | `interior.js` | `int` |
| Systemen | `systems.js` (met `buildCar()`) | `sys` |
| App en framework | alles in `framework.json` onder generiek, plus `presetdata.js` | `ui`, `app` |

Functies, materialen en cachesleutels krijgen het voorvoegsel van de eigenaar. Alleen-lezen voor domeineigenaars: `core.js`, `body.js`, `tools/anchors.json`, `tools/open_allow.json`, de testscripts en `IGNORE` in `tools/harness.py`.

## 8. Budgetten

In `tools/anchors.json` (`triangle_budgets`): de driehoeken per hoofdgroep en in totaal, bij het begin verdeeld naar verhouding van laguna3 (190.000 van 719.000 voor de carrosserie, enzovoort; op honderdtallen afgerond); tekenopdrachten gemonteerd met bundelen onder 1.500. `tools/tri.py --gate` bewaakt de driehoeken. Budget en stand per hoofdgroep, en het aantal onderdelen, staan in [cijfers.md](cijfers.md).

## 9. Openers (modus Openen)

De leiders hieronder zijn de openers van de pagina (de openerlijst in de modus Openen; `tools/anchors.json: openers`); `tools/opentest.py --strikt-min` toetst ze. Hoeken in graden, slag in meter; `open.min` is minstens 0,8 maal de volle hoek of slag. De hoeken en slagen zijn geschat. De waarden komen uit `src/bodyparts.js` en `src/interior.js` en zijn nagemeten met `opentest.py` op `658afcf` (de Achterzijruit uit golf 6 op `57fd751` plus pakket KIEP).

| Opener | Soort | Eindstand | Ondergrens | Bijzonderheden |
|---|---|---|---|---|
| Motorkap | scharnier achterrand (z 0,925, y 0,915) | 65 | 55 | steunstang van 0,51 m als volger (`Motorkapsteun`, rechter veerpoottoren); camera van linksvoor |
| Portier links, rechts | scharnier vlak voor de voorrand (z 0,79, verticale as) | 62 | 52 | lang portier (3-deurs); scharnierbladen op de A-stijl blijven staan (`stay`); de spiegel hoort bij het portier |
| Zijruit (links, rechts) | schuif in het portier, met helling 0,18 (het glas helt 0,37; langs het eigen vlak kwam de onderrand door de flank, beslissing KAS-2) | 0,25 omlaag en 0,045 naar buiten (0,254 totaal) | 0,21 | volgers: Ruitdrager en Rubber zijruit; de elektrische raambediening zit in het portier |
| Achterzijruit (Hoekruit links, rechts) | scharnier aan de voorrand van de ruit (z -0,74, bij de B-stijl); de as loopt langs die schuine voorrand (ongeveer 15 graden uit het verticaal, 5 mm achter het glas) | 4 (kiepstand: ongeveer 30 mm open bij de onderste achterhoek, 0,43 m van de as) | 3,3 | twee scharniertjes (het blad op de stijl blijft staan), kiepslot met kiephendel, slotplaat (blijft staan) en uitzetter als volger (ongeveer 23 graden, `open.min` 18,5), rubber hoekruit draait mee, sponningrubber blijft staan; camera van linksachter boven, label Achterzijruit links en rechts; eigenaar carrosserie |
| Buitenspiegel links, rechts | scharnier aan de achterbinnenkant van het huis | 80 naar achteren | 64 | spiegelzeil en spiegelarm blijven staan (`stay`) |
| Achterklep | scharnier dakrand (z -1,165, y 1,385) | 66 | 60 | twee gasveren als telescoop (0,30 m in, 0,50 m uit), onderaan tegen de C-stijl, bovenaan op de zijrand van de klep; de hoedenplank is een volger (31,5, ondergrens 26,4) |
| Tankklep | scharnier voorrand (z -1,40), linker achterscherm, ovale klep 100 x 130 mm | 140 | 115 | opening met tankkom in het scherm; de vulhals zit in het brandstofsysteem |
| Rugleuning bestuurder, Rugleuning passagier (label Rugleuning bestuurdersstoel en passagiersstoel) | scharnier onderaan de rugleuning | 40,1 naar voren | 33,2 | needs het portier aan dezelfde kant; eigenaar interieur |
| Rugleuning groot deel (rechts), Rugleuning klein deel (links) | scharnier onderaan de achterbank | 104,3 naar voren | 83,7 | needs Achterklep; eigenaar interieur |

Uitzonderingen op de botsingstoets staan in `tools/open_allow.json` (nu geen). Wat een opening laat zien, heeft een eigenaar: de tankkom (carrosserie), de vulhals (brandstofsysteem), de achterbank en de bagageruimte (interieur), het motorcompartiment (motor, aandrijving, systemen).

## 10. Regels voor alle eigenaars

- `d` verplicht (Nederlandse beschrijving), `spec` alleen voor geverifieerde feiten in Nederlandse notatie, `ex` als uitklapvector, `inner` alleen voor wat van buiten nooit te zien is.
- Elke wijziging met `python3 build.py --lint`; voor samenvoegen `tools/orkestratie/mergecheck.py`; na samenvoegen de volledige set (`tools/orkestratie/finaltests.sh`).
- Een melding eerst narekenen met `pick.py`, `probe.py` of stralen; dan pas wijzigen.
- De plaatshouders uit de beginauto in `engine1.js`, `interior.js`, `chassis.js` en `systems.js` (blokken binnen de huid, vier cilinders als wielen) zijn in versie 1 door de domeinen vervangen (zie `CHANGELOG.md`). De beschrijving van de wortel in `src/systems.js` noemt aandrijflijn, onderstel en interieur nog plaatshouders; die tekst is van de eigenaar systemen.

## 11. Doordringing tussen domeinen (golf 2)

Na de samenvoeging van de vijf domeinen is elk paar meshes uit verschillende hoofdgroepen of domeinen getoetst op doordringing: een driehoek-driehoektoets op de wereldmeshes van de gemonteerde stand (alle openers dicht), met de diepte van de binnendringing langs de snijlijn. Van 369 doordringende paren bleven er 217 over; boven 1,5 cm zijn er nog 38. Wat blijft staan is bedoeld contact of een plaatshouder die erbij hoort:

| Contact | Reden |
|---|---|
| Veerpoot, schroefveer, veerschotel en lagerplaat in de veerpoottoren | de veerpoot loopt in de toren (bedoeld); de uitsparing in de wielkastwand voor staat voor de doorgang |
| Stuurkolom, onderste en bovenste kruiskoppeling, duwstang en kabelboom in het dashboardblok | het dashboard is een gesloten blok; kolom, pedaalarmen en kabels lopen er verborgen in |
| Handremkabel voor in de tunnelconsole en de vloerbedekking | de kabel loopt van de vereffenaar naar het aansluitpunt van de interieurhendel (`INT_PORTS.handremkabel`); de hendel zelf is van het interieur |
| Buitenste homokineet in de fusee, vulhals in de tankkom, naaf op de stuuras, bout in de lagerbus | bevestigingen: het ene deel zit in het andere |
| Linker aandrijfas (binnenste homokineet en hoes) tegen de beugel en de bouten van de dwarsbalk, tot 2,7 cm | beugel en bouten zitten op de plaats van de homokineet; oplossing is een herontwerp van het hulpframe (beugel lager, bouten naast de as) |
| Panhardbus in de langsligger achter, remslangbeugels op de wielkastwand, vulpijp door de bumperrand (1,5 cm) | bevestigingen en een plaats waar de pijp de rand van de bumper raakt |
| Vliegwiel met koppelingsdeksel, startkrans in het koppelingshuis, primaire as in het vliegwiel | vlak tegen elkaar (het deksel ligt in de rand van het vliegwiel), de as steekt in het pilotlager |
| Kachelhuis (schaal, kern, aanjager) in de dashboardblokken, kachelpijpen door de dashboardonderkant en het schutbord (golf 7) | het dashboard is een gesloten blok (B-064); de pijpen gaan door de doorvoer in het schutbord. De doorvoer zelf ligt 12 mm voor het schutbord; aansluiten staat open voor versie 7 |

Wat wel is opgelost: de wielkastwanden (begin op y 0,42 voor en 0,485 achter, uitsparing voor de veerpoot), het schutbord onder y 0,58 smaller dan de wielkasten, de brandstoftank (3,5 cm lager, 2 cm naar links) met de remleidingen, handremkabels en kabelboom eromheen, de stabilisatorstang (puntvolgorde: ging als rechte lijn door carter en bak), de torsiesteun (nu boven het stuurhuis), het motorkapslot (boven de waterkast van de radiateur), de koppelingsplaat (tegen het vliegwiel), het dashboard (0,52 breed, voorvlak op z 0,85), de stoelen, de C-stijlbekleding, de wielkastbekleding (schil), de vloerbedekking, de achterwandbekleding en de wissermotor.

### Aanvulling golf 5 (review, bevinding B-034)

De review van golf 5 mat alle doordringingen tussen gesloten meshes. Het merendeel valt onder de tabel hierboven of zit binnen een hoofdgroep (schuim in bekleding, assen in huizen). Drie paren tussen domeinen ontbraken hier en zijn bedoeld contact van een bevestiging. Nagemeten met `tools/orkestratie/clash.py` op `658afcf`, gemonteerde stand, alle openers dicht (diepte als grootste afstand van een binnenpunt tot het oppervlak):

| Contact | Diepte | Reden |
|---|---|---|
| Kabelboom motorruimte (systemen) in de Wissermotor (carrosserie, Ruitenwissers) | 12,9 mm | de kabelboom eindigt in de stekker van de wissermotor |
| Hemelbekleding (interieur) om Klepscharnier links en rechts (carrosserie, Achterklep) | 6,8 mm | de scharnieren zijn door het dak aan de dakrand geschroefd; de hemel ligt over die bevestiging |
| C-stijlbekleding links en rechts (interieur) om de cilinder van Gasveer links en rechts (carrosserie, Achterklep) | 10,4 mm (cilinder), 3,9 mm (zuigerstang) | de gasveer is onderaan aan de C-stijl bevestigd; de bekleding is een gesloten schil om die bevestiging |

De overige paren uit de review buiten deze tabel (Kabelboom achter en Ontluchtingsslang vulpijp in de Bagagevloer, 6 tot 6,7 mm; Claxonbeugel in de Vathouder, 6 mm) zijn niet als bedoeld beoordeeld en staan open voor hun eigenaars. Het oordeel "bedoeld" over de drie paren in de tabel is gebaseerd op de plek en de functie van de delen; de eigenaars van interieur, carrosserie en systemen bevestigen het of verschuiven de delen in hun volgende golf.
