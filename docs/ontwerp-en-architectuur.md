# Ontwerp en architectuur

Dit document beschrijft hoe de pagina is opgebouwd, welke afspraken de delen met elkaar hebben en waarom de bediening zo werkt. Waar een getal pas na de laatste samenvoeging bekend is, staat een open plaatsmarkering die de orkestrator invult.

Het komt als sjabloon uit laguna3 (`framework.json`: sjabloon) en is voor de Suzuki Alto bijgewerkt. De uitleg van de engine en de app (knoop-API, uitklaplogica, klikregel, presets, labels, camera, `inner`, bundelen, robuustheid, modus Openen) is generiek en geldt hier ongewijzigd. Maten, motorframe, aansluitpunten, ankers en openers van deze auto staan in [contract.md](contract.md); tellingen (knopen, onderdelen, presets, driehoeken, tekenopdrachten) in [cijfers.md](cijfers.md). Meetwaarden die hieronder bij een golf van laguna3 horen (golf 1 tot en met 5, de carrosserieronde), gaan over de Laguna en staan er alleen als achtergrond van een ontwerpkeuze.

## Uitgangspunten

- Eén zelfstandig HTML-bestand, publiceerbaar als artefact. Alleen three.js (r147, UMD-build) van jsDelivr en lettertypes van Google Fonts komen van buiten.
- Alle geometrie wordt in code opgebouwd. Er zijn geen 3D-bestanden of afbeeldingen.
- Elk onderdeel is een knoop in één boom. Uitklappen werkt per groep, zodat je zo diep kunt gaan als je wilt.
- Een klik op een onderdeel doet wat de zin in de opdracht zegt: het klapt uit. Zie "Klikregel" hieronder.
- Werkt op desktop en telefoon, in licht en donker thema.
- Elke domeineigenaar bouwt in een eigen bronbestand. De delen kennen elkaar alleen via namen (ankers), vaste getallen en een kleine set gedeelde symbolen.

## Coördinaten

Alle maten zijn in meter.

### Autoframe

- x is links (+) en rechts (−), y omhoog vanaf de grond, z naar voren (+). De auto is in de lengte gecentreerd: de neus ligt op `ZF`, de staart op `ZR`.
- De waarden van `ZF`, `ZR`, vooras `AXF`, achteras `AXR`, wielmiddelpunt `AY`, halve spoorbreedtes `TRACK_F` en `TRACK_R`, wielboogstraal `ARCH` en de breedtes met en zonder spiegels staan in [contract.md](contract.md), paragraaf 2. `integrity.py` bewaakt lengte en breedte.

### Motorframe

- Oorsprong op de krukas-as. +x loopt langs de krukas naar de vliegwiel- en versnellingsbakzijde (links in de auto), +y langs de cilinders omhoog, +z naar de inlaatzijde (naar de voorkant van de auto).
- Waar de oorsprong op de krukas ligt en hoe de cilinders genummerd zijn, staat in [contract.md](contract.md), paragraaf 3 (bij de G10BB staat cilinder 1 aan de poeliezijde, dus op −x).
- De handbak deelt dit frame (aandrijflijnframe).

### Aandrijflijn in de auto

De aandrijflijn staat dwars: `auto = PT_POS + Rx(PT_TILT) · motor`. De waarden van `PT_POS`, `PT_TILT` en `GB_X` staan in [contract.md](contract.md), paragraaf 3. In code gebruik je de hulpfuncties uit `drivetrain.js` (`fromPT`, `toPT`, `ENG2CAR`, matrix `PTM`) en reken je niet met de hand om.

## Bronbestanden en bouwvolgorde

`build.py` plakt de bestanden uit `src/` in de volgorde van `ORDER` aan elkaar tot één script. Ze delen dus één globale naamruimte; wat eerder staat, kan wat later staat niet missen, en `const` en `let` moeten voor gebruik gedeclareerd zijn. `head.html` komt als opmaak voor het script; het is een sjabloon waarin `build.py` de velden `{{naam}}` uit `auto.json` invult, en vóór het script zet `build.py` het bevroren object `AUTO` met dezelfde gegevens (zie [framework.md](framework.md)). Het bouwen stopt bij dubbele functienamen op het hoogste niveau, dubbele materiaalnamen in `std()` en `phys()` en bij een syntaxfout (`node --check`).

| Nr | Bestand | Inhoud |
|---|---|---|
| 0 | `head.html` | Titel, lettertypes, CSS (designtokens voor licht en donker, touch-stijlregels), opbouw van paneel, dock, menu's, hulpvenster en bovenbalk. |
| 1 | `core.js` | Renderer, scène, belichting, materialen, geometriehulpen (lathe, extrusie, tandwielen, veren, buizen, schoepen, en sinds de carrosserieronde `notchRect` en `roundPlate`, zie onder), geometriecache en de bouwstenen `A()` (groep) en `P()` (onderdeel). |
| 2 | `body.js` | Parametrisch carrosserieoppervlak: halve breedte, onder-, schouder- en daklijn als vloeiende krommen langs z, doorsnede met afgeronde hoeken, tumblehome. Exporteert `HW`, `YB`, `YT`, `YR`, `surfX`, `skin`. |
| 3 | `bodyparts.js` | Panelen uit dat oppervlak gesneden: portieren, schermen, motorkap, achterklep, bumpers, ruiten, verlichting, spiegels, wissers, sierlijsten; `Carrosseriekooi` met onder meer de `Torpedoplaat`. |
| 4 | `panorama.js` | Leeg bij deze auto: de Alto heeft geen glazen dak. Het bestand staat in `ORDER` van `build.py` en blijft daarom bestaan; eigenaar is de carrosserie. |
| 5 | `engine1.js` | Motor G10BB, deel 1: maten en `ENG_PORTS`, hulpfuncties, motorblok met carterpan, krukmechanisme, vliegwiel. |
| 6 | `engine2.js` | Motor G10BB, deel 2: cilinderkop met nokkenas, tuimelaars en kleppen, kleppendeksel, distributie, hulpaandrijving, koelcircuit. |
| 7 | `engine3.js` | Motor G10BB, deel 3: smering, inlaat met injectie, uitlaatspruitstuk, ontsteking, sensoren, kabelboom en `buildEngine()`. |
| 8 | `drivetrain.js` | Handbak (koppeling, vijfbak, differentieel), aandrijfassen, startmotor, motorsteunen; `PT_POS`, `PT_TILT`, `GB_X`, `DRV_PORTS`. |
| 9 | `chassis.js` | Vooras met McPherson-veerpoten, stuurinrichting zonder bekrachtiging, torsie-as achter, wielen, schijfremmen voor en trommelremmen achter, remsysteem met handrem. |
| 10 | `interior.js` | Dashboard, middenconsole, stoelen, gordels, bekleding, pedalen, binnenspiegel. |
| 11 | `systems.js` | Koeling en luchtinlaat, uitlaat, brandstof, elektra, en `buildCar()`, dat alles samenvoegt en de beschrijving van de wortel zet. |
| 12 | `partnumbers.js` | De onderdeelnummers als gegevens (`PN_DATA`): verkoopeenheden, nummers met bewijsniveau, de map van pad naar eenheid en onderhoudsinformatie. Gemaakt door `tools/orkestratie/build_pn.py`; niet met de hand bewerken. |
| 13 | `app1.js` | Boom doorlopen, uitklapvectoren berekenen, animatie, zichtbaarheid en materialen, camera-inpassing, vloer, stap-terug-geschiedenis, het blok openmodus (stand van de openers, volgers, telescopen, bundelen, uitnemen met `hideWhen`) en het dimmen van de rest bij duiken (U19). |
| 14 | `presetdata.js` | De presets van deze auto als gegevens: categorieën, `PRESETS` en de stappen van de rondleiding (autolaag van het framework). De categorie Openen gebruikt het veld `opens`. |
| 15 | `presets.js` | De toepassingsmotor van presets en de rondleiding (generiek). |
| 15 | `app2.js` | Selectie, paneel (met de sectie Onderdeelnummers), onderdelenboom, aanwijzen en tikken, toetsenbord, labels, formaat, thema, beeldkwaliteit, de bediening van Openen, renderlus, en `window.__model` voor de tests. |

Namen van functies en constanten, materialen en cache-sleutels krijgen een voorvoegsel van hun eigenaar (`bod`, `eng`, `drv`, `chs`, `int`, `sys`, `ui`, `app`; [contract.md](contract.md), paragraaf 7), zodat bestanden elkaar niet stil overschrijven.

Twee geometriehulpen in `src/core.js` zijn nieuw sinds de carrosserieronde:

- `notchRect(u0, u1, v0, v1, cut)` geeft de omtrek van een rechthoek in het vlak u-v (hoekpunten tegen de klok in) met inkepingen: elke `[kant, u, v]` in `cut` haalt aan die kant (+1 of −1) het stuk onder v en voorbij u weg. Zo krijgt een zitkussen of een vloerplaat een inkeping bij een wielkast.
- `roundPlate(poly, t, b, ri, seg)` extrudeert zo'n rechthoekige omtrek met dikte `t` (gecentreerd) uit één stuk, met rondom afgeronde randen van straal `b`. Holle hoeken van de omtrek krijgen straal `ri`. Er zijn geen naden zoals bij losse blokken en de normalen zijn glad met een knik boven 30 graden. De achterbank (zitkussen en rugleuning, in `src/interior.js`) en de kofferbakvloer (`bodBootPlate` in `src/bodyparts.js`) gebruiken het.

## Knoop-API

Een knoop is `{ id, name, d, spec, obj, kids, parent, asm, ... }`. Bouw knopen met twee functies uit `core.js`; dit contract is vast.

```js
A(naam, opties, kinderen)           // groep (THREE.Group); kinderen mogen geneste arrays zijn, lege waarden vallen weg
P(naam, geometrie, materiaal, opties) // onderdeel (THREE.Mesh)
```

| Optie | Betekenis |
|---|---|
| `d` | Verplicht. Nederlandse beschrijving van één of twee zinnen: wat het is en wat het doet. Is de opbouw schematisch of niet voor deze auto geverifieerd, dan staat dat erin. |
| `spec` | Lijst `[[label, waarde], ...]` met alleen geverifieerde feiten, in Nederlandse notatie ("82,7 mm"). |
| `p`, `r`, `q`, `s` | Positie `[x,y,z]`, Euler-hoeken `[rx,ry,rz]`, quaternion en schaal `[sx,sy,sz]` in het frame van de ouder. Negatieve x-schaal spiegelt (alle materialen zijn dubbelzijdig). |
| `ex` | Uitklapvector `[dx,dy,dz]` in het frame van de ouder, in meter bij spreiding 100 %. Zonder `ex` rekent de app er een uit: de richting van het midden van de ouder naar het midden van het kind, met een afstand die schaalt met de groottes. |
| `exs` | Schaalfactor op die berekende afstand (standaard 1). |
| `inner` | `true` voor een groep of onderdeel dat volledig verborgen zit in de andere delen van zijn ouder zolang die ouder dicht is (zuigers in het blok, kleppen in de kop, planetaire sets in het huis, remzuigers in de klauw, ruitenmechanisme in het portier). De app tekent een `inner`-knop met zijn deelboom niet zolang de ouder dicht is. Nooit zetten op iets dat van buiten te zien is in de gemonteerde stand. |

Ankernamen (zie "Ankers") moeten precies één keer in de boom voorkomen.

## Uitklaplogica

De regel, per kind van een groep:

```
positie(kind) = basis(kind) + ex(kind) · amt(ouder) · SPREAD
```

- `basis` is de gemonteerde positie in het frame van de ouder, `amt` de animatiewaarde van de ouder tussen 0 en 1 en `SPREAD` de spreiding (40 tot 220 %, standaard 100 %).
- De kinderen van een groep bewegen alleen als die groep zelf uitklapt. Een gesloten groep beweegt als één stijf geheel mee met de explosie van zijn ouder. Omdat de regel per niveau stapelt, gaan diepere lagen vanzelf mee.
- Alleen het ankeronderdeel van een groep (waar de rest op gemonteerd is, zoals het motorblok) mag een uitklapvector nul houden.
- Uitklapvectoren liggen langs de montage-as, met afstanden evenredig met de grootte van het onderdeel. Niets vliegt door de scène of in de ruimte van een ander systeem.

## Klikregel

Dit is de belangrijkste ontwerpkeuze van versie 2 van laguna3 en ze komt rechtstreeks uit de premortem daar (`docs/premortem.md` in laguna3).

In versie 1 opende een klik de buitenste nog dichte groep op het pad naar het aangeklikte onderdeel. Tik je op de motorkap, dan viel de auto in acht hoofdgroepen uiteen en de motorkap zelf bleef dicht. De opdracht zegt: "als je een onderdeel aanklikt moet dat uitklappen". Het criterium in het eerste plan ("een groep die het onderdeel bevat klapt uit") was ook voor versie 1 waar, dus alle testen hadden groen kunnen zijn terwijl de gebruiker de klacht opnieuw had gekregen. De premortem oordeelde dat een fatale fout.

De regel nu, in de standaardmodus `Onderdeel`:

1. Klik op onderdeel P met eigen groep G (de directe ouder). Is G dicht, dan klapt alleen G ter plekke uit. De rest van de auto beweegt niet, ook niet als de ouders van G dicht zijn.
2. Is G al open, dan wordt P geselecteerd en een stukje uitgelicht.
3. De weg naar buiten of naar binnen loopt via aparte gebaren: `Groter geheel` (knop) en Enter klappen de eerstvolgende dichte groep erboven uit; dubbelklik duikt naar P (alle groepen erboven open, laag voor laag, met de pick van de eerste klik); rechtsklik, Shift+klik of lang drukken klappen de diepste open groep in.
4. De gelaagde explosie van buiten naar binnen zit in de schuif `Explosie`, in `Demonteren` en in de presets. De modus `Laag voor laag` houdt het gedrag van versie 1 beschikbaar.

De keuze heeft een bijwerking die bewust is aanvaard: een onderdeel dat onder een dichte groep zit (de motor onder de kap) is niet met klikken van buitenaf bereikbaar zonder eerst die groep te openen. De schuif, de presets, de labels en de onderdelenboom dekken dat.

Tests: [testen.md](testen.md), controle 1 van `tools/itest.py` meet na een klik vanuit Gemonteerd op Motorkap, Portier links, Wiel linksvoor en Koplamp links hoeveel knopen buiten de eigen subboom meer dan 1 mm verschuiven (moet 0 zijn), en of een dubbeltik met 250 ms tussenpoos het onderdeel van de eerste tik kiest.

### Gebaren en tijdsbepaling

- Pointer-events met een drempel van 7 pixels voor slepen en 600 ms voor een klik; dubbelklik binnen 420 ms en 26 pixels; lang drukken na 500 ms, met een ring als terugkoppeling vanaf 150 ms.
- De pick (welk onderdeel is geraakt) wordt bij `pointerdown` bepaald en door de latere afhandeling hergebruikt. Zo valt een dubbeltik nooit op een bewegend beeld.
- Op een telefoon valt de tweede tik op een scherm waar al onderdelen bewegen. Daarom gebruikt de duik de pick van de eerste tik.
- Een tik op het canvas stuurt in de browser nog compatibele muisgebeurtenissen na (`mousedown`, `mouseup`, `click`). Die konden op een label vallen dat door de nieuwe selectie onder de vinger was geschoven en gaven dan een tweede actie. Daarom krijgt `touchend` op het canvas `preventDefault()`, en reageert een label alleen op een `click` die op dat label begon (de aanwijzer ging op dat label omlaag), of op een `click` zonder aanwijzer (toetsenbord, schermlezer). Dit is de oplossing van het itest-randgeval; zie [testen.md](testen.md), "Het itest-randgeval".
- Gebaren beslissen op `event.timeStamp` en niet op het moment waarop een handler draait (`src/app2.js`, `uiCommitPress` en de afhandeling van `pointerup`). Aanleiding was de ene itest-fout uit golf 1: een telefoontik die onder belasting als lang drukken werd gelezen. De timer die de ring toont en het lang drukken wapent, laat eerst wachtende invoer afhandelen (een animatieframe en een nul-timeout); komt er in die tijd een `pointerup` of `pointercancel` binnen, dan beslist die op zijn eigen tijdstempel. Resultaat: itest 78 van 78 na de samenvoeging van golf 2 en 79 van 79 op `6eca637`, zonder terugkerende telefoontikfout.

## Presets

Een preset is alleen gegevens in `src/presetdata.js`: `id`, `cat` (categorie), `label`, `key` (sneltoets), `note`, `iso` (alleen deze groepen tonen), `open` (precies deze groepen uitklappen), `deep` (met hun hele deelboom), `pull` (hele groep verschuiven), `xray`, `sys`, `spread`, `cam` (richting en marge), `select`, `labels` en `frame`. Zeven categorieën (`appCats` in `src/presetdata.js`): Overzicht, Motor, Aandrijving, Onderstel, Carrosserie, Interieur en Openen. Het aantal presets, ook per categorie, staat in [cijfers.md](cijfers.md).

- Een preset verwijst naar groepen met hun naam. `checkPresets()` (bereikbaar als `__model.checkPresets`) controleert dat elke naam precies één keer bestaat, dat `open`, `deep`, `select` en `labels` onder de `iso`-groep liggen (bevatting), dat id's en sneltoetsen uniek zijn en dat de rondleiding bestaande presets noemt. Een preset waarvan een naam niet oplost, verschijnt niet in de menu's. `tools/integrity.py` faalt op elke presetfout.
- Toepassen gaat in fasen: eerst klapt dicht wat dicht moet (diepste eerst), dan beweegt de camera naar de eindkadrering terwijl open gaat wat open moet (ondiepste eerst). Alles samen duurt hoogstens 2,5 seconden. Groepen die in de eindstand verborgen zijn, springen direct dicht.
- Elke preset is bereikbaar met twee klikken (categorie, item). Sneltoetsen 0 tot 9 gaan naar de tien belangrijkste.
- De rondleiding speelt een vaste lijst presets af met een bijschrift per stap.
- Wie een groep hernoemt die een preset gebruikt, moet de preset aanpassen. De namen die presets nu gebruiken, staan in `tools/anchors.json` en in het contract.

## Ankers

`tools/anchors.json` bevat de namen die precies één keer in de boom moeten voorkomen, per domein (carrosserie, interieur, motor, aandrijflijn, onderstel, systemen), plus:

- `root_children_order`: de wortel (`AUTO.wortel`, hier `Suzuki Alto`) heeft precies acht kinderen in vaste volgorde: Carrosserie, Interieur, Aandrijflijn, Onderstel, Koeling en luchtinlaat, Uitlaatsysteem, Brandstofsysteem, Elektrisch systeem.
- `onderstel_children`: Vooras en stuurinrichting, Achteras, Wielen, Remsysteem.
- `contains`: paren (ouder, nakomeling) die in de boom onder elkaar moeten hangen.
- `content`: per anker een minimum aantal knopen dat op een patroon past (bijvoorbeeld dat `Krukmechanisme` vier zuigergroepen bevat). Dit vangt een anker met de juiste naam op de verkeerde plek of met de verkeerde inhoud.
- `openers`: de paden van de leiders in de modus Openen ([contract.md](contract.md), paragraaf 9), en `preset_ids`: de preset-id's (het aantal staat in [cijfers.md](cijfers.md)). `integrity.py` eist dat de pagina precies deze heeft, niet meer en niet minder.
- `triangle_budgets`: de budgetten aan driehoeken per hoofdgroep en in totaal; `tools/tri.py --gate` bewaakt ze. Alleen-lezen voor domeineigenaars.

`buildCar()` in `systems.js` zet de uitklapvectoren van de acht hoofdgroepen en van de vier kinderen van Onderstel. Alle andere uitklapvectoren zijn van de eigenaar van de groep.

## Labels

Labels zijn genummerde bijschriften met een leiderlijn. Ze verschijnen bij de kinderen van de laatst uitgeklapte groep, de grootste eerst. Een label ankert op het gelabelde deel zelf en niet op het midden van het kader van de groep, want dat midden lag in laguna3 bij 52 van de 345 ankers in de lucht en bij 175 op het eigen deel. De ankers worden over meerdere frames opgebouwd, zodat het openen van een zware groep geen groot frame kost, met een terugval op het eerste zichtbare deel. `tools/anchorcheck.py` meet per preset waar de ankers liggen (de basis staat in `docs/baseline/anchorcheck.json`). Een klik op een label werkt alleen als de aanwijzer op dat label begon, ook bij een lange muisdruk, zodat een label na een tik op het canvas geen tweede actie geeft. Elk label zoekt een vrije plek (eerst op het onderdeel, dan erboven of eronder, in kandidaten) en wordt weggelaten als er geen ruimte is. Zo vallen ze niet over elkaar, niet over de bediening en niet buiten het vrije beeld. De indeling alloceert niets per frame en schrijft alleen naar de DOM als er iets verandert. Een test controleert dit in zes standen (`tools/itest.py`, controle 8).

## Camera

`fitBox` berekent de afstand waarop alle hoekpunten van de verwachte eindbox (na de animatie) binnen het vrije beeld vallen. Het paneel en de dock worden als marge meegenomen via `setViewOffset`, zodat het model in het zichtbare deel gecentreerd staat. `focusNodes` kadreert een lijst knopen; `freeView()` geeft het vrije beeld terug.

## Verbergen van ingesloten delen (`inner`)

Een knoop met `inner: true` en een dichte ouder wordt niet getekend en niet aangeklikt (`uiInnerHidden`): `ouder.target === 0`, `ouder.amt < 1e-4` en de ouder ligt binnen de isolatie. Zodra de ouder gaat openen, is het deel direct zichtbaar. Röntgen toont alles. Isoleer je het ingesloten deel zelf, dan verbergt niets het. De doorsteekcontrole van `integrity.py` draait met alle onderdelen zichtbaar.

Dit is de belangrijkste maatregel tegen een te hoog aantal tekenopdrachten in de gemonteerde stand. De risico's zijn een ten onrechte verborgen onderdeel (een gat in de auto) en een vlag op iets dat van buiten te zien is. `tools/ui_inner.py` controleert vanuit 200 richtingen, op de hele auto en op elke hoofdgroep geïsoleerd, of een `inner`-knop de eerste treffer van buitenaf is. Het aantal ingesloten knopen staat in [cijfers.md](cijfers.md); `ui_inner.py --open --strict` in de volledige set eist 0 overtreders, ook met de openers open.

## Prestaties

- Geometrie wordt gecachet via `cache(sleutel, bouwfunctie)`. De sleutel moet alle parameters bevatten die de vorm bepalen. In `core.js` doen `G.box`, `G.rbox`, `G.cyl`, `G.half`, `G.torus`, `G.sphere`, `hexBolt`, `spring`, `gear`, `ringGear` en `annulus` dat. De sleutel van `torus` bevatte eerst de buisstraal niet, `ringGear` de voetstraal niet en `annulus` het aantal segmenten niet; dat is hersteld (audit C24).
- In testmodus (`window.__MODEL_CACHECHECK`, door `tools/harness.py` gezet) bouwt `cache()` bij hergebruik de geometrie opnieuw en meldt een botsing als consolefout: dezelfde sleutel voor andere vorm. Een gemuteerde proef (een geplante botsing) wordt gevangen.
- Sleutels voor eigen geometrie beginnen met het voorvoegsel van de eigenaar. `build.py --lint` controleert dat niet; het is een afspraak in het contract en de botsingscontrole in testmodus vangt de gevolgen. De lint is hiervoor niet uitgebreid.
- Tekenopdrachten: de gemonteerde auto moet met bundelen onder 1.500 blijven (grens uit de premortem van laguna3, tripwire 5); volledig uitgeklapt is de grens 3.000. De actuele aantallen, met en zonder bundelen, staan in [cijfers.md](cijfers.md).
- Gebundeld renderen van gesloten groepen: een groep waarvan het hele deel is gemonteerd, wordt met één samengevoegde mesh per materiaal getekend in plaats van met elk onderdeel apart. De losse meshes blijven in de scène voor aanwijzen, labels en de lijst. Een groep die gaat openen, bewegen of oplichten schakelt in hetzelfde frame terug. Het staat standaard aan; de schakelaar `Gesloten groepen samenvoegen` in Weergave zet het uit. Tekenopdrachten in Gemonteerd met en zonder bundelen: [cijfers.md](cijfers.md).
  - Werking (`src/app1.js`): voor elke weergave kiest `uiBatchSync` per tak de hoogste geschikte groep met een klare batch (minstens twee onderdelen en hoogstens 60.000 driehoeken; grotere groepen worden over hun kinderen verdeeld) en wisselt waar nodig in hetzelfde frame. Onderdelen onder een ingesloten knoop doen niet mee. Een batch krijgt per basismateriaal een samengevoegde mesh; de materialen volgen Röntgen en de systeemkleuren, en de diepte-sortering van doorzichtige vlakken blijft gelijk.
  - Opbouw: lui, in de vrije tijd van het frame (3 ms tijdens een animatie, 10 ms in rust, 25 ms in de eerste 8 seconden). Tests die gebundelde aantallen meten roepen eerst `__model.batchFlush()` aan.
  - Geheugen: de batches mogen samen 1,25 maal de geometriebytes van alle meshes gebruiken (stand: [cijfers.md](cijfers.md), rij Batches). Past een nieuwe batch niet, dan worden de langst ongebruikte batches vrijgegeven die nu niet getekend worden; past hij dan nog niet, dan blijft die groep los getekend.
  - Aanwijzen: de losse meshes van een gebundelde groep staan op THREE-laag 1 (`UI_HIDE_LAYER`). De camera tekent die laag niet; de raycaster van de app doet `layers.enableAll()` en raakt ze dus wel. Elke eigen `THREE.Raycaster` in een testscript moet dat ook doen; `integrity.py`, `silhouette.py` en `ui_inner.py` doen het.
  - Stand (`__model.batchStats()`, na `batchFlush()`): [cijfers.md](cijfers.md), rij Batches.
- Adaptieve kwaliteit: bij gemiddeld meer dan 40 ms per frame over 20 frames tijdens een animatie schakelt de pagina één keer naar pixelratio 1 en lakglans uit, met een melding in Weergave en de schuif `Volle kwaliteit`. Tijdens grote animaties zakt de pixelratio tijdelijk naar driekwart.
- Er wordt alleen gerenderd als er iets beweegt of verandert. Geen backdrop-blur: vervagen van het WebGL-canvas kostte volgens een meting 60 beelden per seconde naar 1,5.
- Materialen worden vooraf gecompileerd, in kleine stukjes na de eerste weergave, zodat de eerste keer aanwijzen of selecteren niet hapert.
- Frametijd: `__model.profileFrames('Motor G10BB', 120)` meet de JavaScript-tijd per animatieframe zonder `finishAll()` (explosie-update en labelindeling, zonder `render`). Grens: p95 hoogstens 8 ms. Dit is JavaScript-tijd, geen GPU-tijd.
- Aantallen driehoeken per hoofdgroep en de budgetten: [cijfers.md](cijfers.md) en `tools/anchors.json` (`triangle_budgets`); `tools/tri.py --gate` bewaakt ze.
- Opstarttijden: `__model.timing()` geeft de tijdlijn van het opstarten in milliseconden sinds het begin van de navigatie (`script`, `buildStart`, `buildCar`, `startUp`, `render0`, `firstFrame`, `interactive`, `ready`, `batches`, plus `batchesDone`). De duur van `buildCar()` is `buildCar` min `buildStart`. `ready` wacht hoogstens 2 seconden op de batches van de beginstand. De gemeten tijdlijn staat in [cijfers.md](cijfers.md); die tijden zeggen niets over een echt apparaat.

## Robuustheid, thema en toegankelijkheid (golf 5c-1)

- Foutafhandeling: een inline script in `src/head.html`, vóór de scripttags, vangt `error` en `unhandledrejection`. Zolang `#loading` zichtbaar is vervangt het de voortgangsmelding door "De pagina kon niet worden geladen (…). Laad de pagina opnieuw. Versie X." (een eigen melding van `core.js` of `app1.js` blijft staan en krijgt de versie erbij); na `ready` alleen `console.error`. De laatste fout staat op `window.__modelLastError` en `__model.lastError`. Hetzelfde script zet het onthouden thema op `<html>` vóór het tekenen. `build.py --lint` controleert het inline script apart met `node --check`.
- Contextverlies: `webglcontextlost` (met `preventDefault`, zodat herstel kan) toont `#notice`; bij `webglcontextrestored` maakt `uiRemakeEnvironment` (`src/core.js`, naast `uiMakeEnvironment`) een nieuwe PMREM-omgevingskaart; geometrie en texturen laadt three.js zelf opnieuw.
- `uiLastFit` is het contract voor herkadreren bij een formaatwissel: het staat in `src/app1.js` bij `focusNodes`, dat het zelf zet; `appApplyPreset` zet daarna `{ preset }`. Niemand wijst het nog los toe. `uiRefitNow` kadreert direct (`delay: 0`).
- Rondleiding (`src/presets.js`): een toestand `{ i, due, left, paused, auto }` met `uiTourStep(dir)`, `uiTourArm` en `uiTourPause` (de resttijd blijft staan); knoppen vorige, pauze of hervat, volgende en stop in `#tourBar`; `visibilitychange` pauzeert en hervat vanzelf, een eigen pauze blijft staan. Staptijd `APP_TOUR_STEP_MS`.
- CDN: `build.py` zet `integrity` (sha384) en `crossorigin="anonymous"` op de drie scripttags, berekend uit het lokale npm-pakket (`THREE_DIR` of `~/.cache/explosietekening/three-0.147.0/package`); zonder pakket stopt de bouw. `tools/pubsmoke.py` bewijst dat de CDN dezelfde bytes levert.
- Labels: past niet alles (`UI_LABEL_MAX` 24, `UI_LABEL_MAX_NARROW` 10), dan staat er een `.lmore` ("+n meer", geen `.lbl`, telt niet in `labelRects()`) in een hoek van het vrije beeld; een klik opent de lijst van de groep.
- Isoleren: `uiFadeFrom`, `uiStepFade` en `uiFadeEnd` in `src/app1.js` laten de rest in `UI_ISO_FADE_MS` (0,3 s) vervagen met één gedeeld spookmateriaal `uiFade`; zichtbaarheid en aanwijzen staan meteen op de nieuwe stand, alleen `obj.visible` van de vervagende meshes blijft kort aan; `finishAll()` beëindigt de fade. De badge `#isoBadge` (naam plus Alles tonen) staat bovenin het dock en telt mee in `layoutView` en `uiMeasureUi`.
- Thema: `#themeSeg` (radiogroup) in Weergave, `uiSetTheme`, sleutel `UI_THEME_KEY` (`AUTO.id + '-theme'`, hier `alto-theme`) in `localStorage` (try/catch); systeem is geen `data-theme`-attribuut.
- Toegankelijkheid: het hulpvenster zet `inert` op zijn broers en houdt een Tab-focusval; `#menu` heeft geen rol meer, binnenin staat een `div[role=menu]` met alleen menuitems; de werkbalk van de presets heeft één tabstop met pijlen, Home en End; `#stage:focus-visible` heeft een rand (focus zonder rand blijft onzichtbaar); `--switch-off` geeft een uitgeschakelde schakelaar 4,4:1 (licht) en 3,7:1 (donker); de tabs hebben roving `tabindex`; `#selName` en `#selMeta` worden alleen bij verandering geschreven; Esc sluit het mobiele paneel. Nooit `aria-hidden` op het canvas.
- Hulpvenster: `uiFillHelp` vult de categorieën en sneltoetsen uit `appCats` en `PRESETS`; `uiOpenRootDesc` vervangt de regex die een zin uit de wortelbeschrijving knipte.
- Zoeken: `uiNorm` (`src/app1.js`, ook voor `n.norm`) normaliseert op kleine letters zonder accenten; `uiSynonyms` en `uiSearchTerms` (`src/app2.js`) zoeken synoniemen mee en de zoekinfo noemt ze.
- Aanraken: een toast (`UI_TOAST_MS`) met de volledige naam bij een afgekapt label, één suggestie "Probeer: tik op de motorkap" na de hint tot de eerste handeling (`uiHintStage`), `navigator.vibrate(UI_PRESS_VIBRATE_MS)` bij het vollopen van de ring.
- Exporteren: `uiSaveImage` rendert op verzoek, tekent het WebGL-canvas op een 2D-canvas met naam, onderdeelnummer en versie en downloadt `<AUTO.id>-<slug>.png` (hier `alto-<slug>.png`); de knop Kaart afdrukken gebruikt een `@media print` die alleen de onderdeelkaart overlaat.
- Constanten van de app-laag staan bij elkaar bovenin `src/app2.js` (`UI_ISO_FADE_MS`, `UI_TOAST_MS`, `UI_HINT_MS`, `UI_LABEL_MAX`, `UI_LABEL_MAX_NARROW`, `UI_THEME_KEY`, `UI_PRESS_VIBRATE_MS`, `UI_LINK_REL`).

## Openmodus

Sinds golf 4 van laguna3 heeft de pagina een tweede modus naast Uitklappen: Openen. Een deel gaat dan open zoals bij de echte auto, terwijl de rest gemonteerd blijft. De openers van deze auto, met hoeken, slagen en ondergrenzen, staan in [contract.md](contract.md), paragraaf 9. De hoeken en slagen zijn geschat; er is geen tekening van de fabrikant gebruikt. De engine-optie `hideWhen` en de bediening van Openen op de telefoon komen uit golf 5 van laguna3 (zie hieronder).

### Engine (`src/core.js` en `src/app1.js`, blok openmodus)

Knoopopties in `A()` en `P()`:

| Optie | Betekenis |
|---|---|
| `open` | De opener. `type` is `hinge` of `slide`. Verder `pivot`, `axis`, `angle`, `min` (ondergrens), `label`, `dur`, `look: { dir, nodes }` (waar de camera heen kijkt), `follow` (volger van een leider) en `needs` (eerst die opener openen; sluiten sluit eerst de afhankelijke). Bij `slide` komen `move` (de slag), `arc` (draaien om een verre as, voor de dakkromming) en `tilt` (eerst kantelen over het eerste deel van de beweging) erbij. |
| `stay` | `true` laat het deel staan als de opener draait: de carrosseriezijde van een scharnier. Een volger met `stay` beweegt in het frame van de rustende opener, zoals de motorkapsteun. |
| `hideWhen` | Lijst van openers (naam of pad). De knoop is uitgenomen (onzichtbaar, niet aanklikbaar) zolang een van die openers open staat, zoals een eigenaar de hoedenplank uitneemt voordat hij een rugleuning neerklapt. De app zet de knopen in `hideN`; een verwijzing die niet oplost is een consolefout. |
| `strut` | Een telescoop: `{ a: { node, p }, b: { node, p }, rod, lead, restLen }`. Bij deze auto de gasveren van de achterklep en de koordjes van de hoedenplank. |
| `hideWhen` | Lijst met openers (een pad vanaf de wortel of een unieke naam). Zolang een van die openers open staat (doelstand groter dan 0) is de knoop uitgenomen: hij wordt niet getekend en niet aangeklikt, zoals een eigenaar de hoedenplank uit de auto haalt. Het werkt alleen in de modus Openen; in Uitklappen en bij gesloten openers staat de knoop er gewoon. Een verwijzing die niet oplost, of die naar een volger wijst, is een consolefout. De genoemde openers krijgen de vlag `vis`, zodat hun zichtbaarheid bij elke wijziging wordt bijgewerkt. Het uitnemen springt; er is geen animatie. Bij deze auto gebruikt de hoedenplank met de koordjes het voor Rugleuning groot deel en Rugleuning klein deel (`plankHide` in `src/interior.js`). In de engine: `src/core.js` (`mkNode`) en `src/app1.js` (`applyVisibility`). |

In de knoop staan `opn` (de opties), `ou` (stand 0 tot 1), `ot` (doelstand), `stay`, `strut` en `hideN` (de opgeloste `hideWhen`-lijst). Verwijzingen in `follow`, `needs`, `look.nodes` en `strut.a.node` zijn een pad vanaf de wortel (de wortelnaam mag weg) of een naam die maar een keer voorkomt. Een niet-unieke naam geeft een consolefout.

De stand volgt uit: positie = pivot + R(u maal angle)(basis min pivot) + uitklapverschuiving + eigen verschuiving, en draaiing = R maal de basisdraaiing. Uitklappen en openen werken samen: in Openen staat alles gemonteerd. Vaste delen in een draaiende opener worden elk frame teruggezet met de inverse van de openerdraaiing. Telescopen worden elk frame van a naar b gericht, met alleen de betrokken wereldmatrices; de zuigerstang schuift mee met (afstand min rustafstand).

### Bundelen

Batches worden altijd in de gebouwde stand gemaakt: `uiBaseRel` gebruikt basis, `q0` en `s0`. Een groep met een open opener, een volger, een vast deel of een telescoop eronder wordt niet gebundeld, en de groep van een telescoop niet zolang hij uitschuift. Dat sluit de spookbatch uit: een batch die de gedraaide stand inbakt en na het sluiten als dubbele kap of portier in de gemonteerde auto blijft staan. De toetsen roepen eerst `batchFlush()` of `finishAll()` aan en zouden dat niet zien; `tools/opentest.py` heeft daarom een eigen proef (controle 6).

### Ingesloten delen

Een `inner`-knop wordt zichtbaar als een opener erboven open is. De zichtbaarheid wordt alleen bijgewerkt voor openers met ingesloten delen eronder (vlag `vis`), zodat openen niet de hele boom doorloopt. Een `inner`-vlag op iets dat door een opening te zien is, moet weg; `ui_inner.py --open` vangt dat.

### Bediening (`src/app2.js`, `src/head.html`, `src/presets.js`)

- Segmentknop `Uitklappen | Openen` in de bovenbalk, sneltoets O. Ingang: alles gemonteerd, isolatie weg, de openers blijven staan. Uitgang: de openers blijven staan, zodat een open motorkap of achterklep in Uitklappen mee kan doen (uitklappen rekent daarna volgers, vaste delen en telescopen van open openers opnieuw uit, `uiOpenResync` in `app1.js`). Een preset of Alles dicht sluit ze.
- Klikregel: neem de openers op het pad van het geraakte onderdeel, van buiten naar binnen; volgers tellen als hun leider. De eerste dichte opener gaat open. Zijn ze allemaal open, dan sluit de binnenste. Een klik op de ruit of spiegel van een dicht portier opent dus eerst het portier.
- Dubbelklik is gelijk aan een enkele klik. Rechtsklik, Shift+klik en lang drukken sluiten de binnenste open opener op het pad. Groter geheel, de klikmodi en de explosieschuif zijn verborgen.
- Bij openen beweegt de camera naar `look` (richting, kader in de eindstand, pad 1,1); bij sluiten niet.
- Dock: `Alles open`, `Alles dicht`, `Openers n/totaal` (een lijst met een knop per opener, `aria-pressed`) en Stap terug. Snapshot en stap terug bewaren de openstand (`o`) en de modus (`om`).
- Paneel: badge Open of Dicht bij een opener, Gemonteerd bij een groep. Staat de selectie zelf voor een opener, dan werkt de knop Openen of Sluiten op die opener; anders volgt hij de klikregel. Enter doet hetzelfde, Shift+Enter sluit de binnenste open opener.
- Presetcategorie Openen: Motorruimte, Instappen, Bagageruimte, Tanken en Alles open (`src/presetdata.js`). Een preset zet met het veld `opens` (namen of paden, of `'all'`) openers open. Presets in andere categorieën zetten de modus terug op Uitklappen.

#### De bediening op de telefoon (golf 5)

- Telefoon staand (breder dan 920 px telt als bureaublad): de zeven presetcategorieën staan in één rij die zijwaarts schuift in plaats van drie rijen van drie. De rij loopt tot de rand van het scherm en een vervagende rand wijst op meer. De kaart in Openen zet zijn knop naast de naam. Op 390 x 844 daalt de dock van 194 naar 106 px en stijgt het vrije beeld bij een gekozen opener van 368 naar 501 px. Dit geldt voor schermen van minstens 601 px hoog (media query in `src/head.html`).
- De openerlijst is op een smal scherm (onder 920 px breed) een keuzemenu: na een keuze gaat hij dicht (`uiCloseOpenList` in `src/app2.js`), zodat hij het beeld niet afdekt en het vrije beeld de volle hoogte heeft voordat de camera de opener kadreert. Op het bureaublad staat hij naast het beeld en blijft open. Een lijst die opengaat of dichtgaat laat de auto opnieuw passen in wat overblijft (`uiRefitSoon`).
- Het kader van de opener volgt de echte hoogte van kaart en dock. `uiOpenTo` selecteert eerst het onderdeel (de kaart wordt dan hoger), meet daarna de lade opnieuw (`syncSheetHeight`, `layoutView`) en kadreert dan pas, zodat het kader boven kaart en dock past. Controle 16 van `tools/itest.py` toetst dit voor zes openers.
- Telefoon liggend (hoogte tot 520 px): een zijkolom. Het paneel staat als kolom rechts over de volle hoogte (breedte tussen 250 en 330 px, op een scherm tot 640 px breed tussen 210 en 330 px), zoals op het bureaublad; de lade, de peek-stand en de knoppen voor de lade vervallen en `setSheet` zet de stand altijd op open. De voorwaarde staat twee keer: in de media query van `src/head.html` en in `uiMqSide` in `src/app2.js`; wie een van beide wijzigt, wijzigt ook de ander. Bij draaien of formaat wisselen bepaalt de pagina de stand en het vrije beeld opnieuw.
- U19, de rest dimmen bij duiken: bij een dubbelklik (of een treffer in de onderdelenlijst) wordt alles buiten de focus gedimd met een vlak, eenzijdig, doorschijnend materiaal (`uiDimMat`, dekking 0,14, geen diepteschrijving), zodat het onderdeel eruit springt en niets ervoor staat. Een dubbelzijdig doorschijnend PBR-materiaal kostte op 2.500 meshes zes keer zoveel tekentijd. De focus is de groep zelf, of bij een onderdeel zijn ouder (de broers blijven zichtbaar). Aanwijzen en klikken werken door; een klik raakt liever iets in de focus dan een gedimd deel ervoor. De dimming vervalt als de selectie de focus verlaat (omhoog, kruimelpad, ander deel), bij de explosieschuif, `Demonteren`, isoleren, een preset en met de knop `Rest tonen` in het paneel; de schakelaar `Rest dimmen bij duiken` in Weergave (standaard aan) zet het uit. In Openen dimt niets. De stand zit in de snapshot van Stap terug (`dim`) en in de sleutel van de batches.

### Contract met de eigenaars

- Een opener heeft een bron voor hoek of slag (in `d` of in de brief) en een ondergrens `open.min` van minstens 0,8 maal de volle hoek of slag; `tools/opentest.py --strikt-min` eist dat van elke leider. Zonder ondergrens beloont de botsingstoets kleinere hoeken, en met een lage ondergrens kan een agent eerst de hoek verkleinen en dan de ondergrens meenemen.
- Asregel: de as ligt aan de scharnierzijde, buiten of op de omtrek van de delen van de opener. De bestaande scharnierdelen (het scharnierblad van een portier, de kapopzet) als as botsen aantoonbaar. Een volger of telescoop noemt het frame waarin zijn punten gelden; een verwijzing zonder knoop is niet toegestaan.
- Delen die aan de carrosseriezijde van een scharnier horen, krijgen `stay`.
- Blootleglijst: wat een opening laat zien, heeft een eigenaar. Voorbeelden bij deze auto: de tankkom in het rechter achterscherm (carrosserie, met de vulhals in het brandstofsysteem) en de achterbank en de bagageruimte achter de achterklep (interieur). Openers die twee bestanden raken, worden in een golf gebouwd.
- Botsing is geen schending als het contact al in de gesloten stand bestond. De uitzonderingen staan in `tools/open_allow.json` (elk met reden; bij deze auto leeg) en zijn voor domeineigenaars alleen-lezen.

### Openers van deze auto

De tabel met soort, eindstand, ondergrens en bijzonderheden per opener staat in [contract.md](contract.md), paragraaf 9; `tools/anchors.json` (`openers`) noemt de paden en `tools/opentest.py --strikt-min` toetst ze. De hoedenplank is een volger van de achterklep met een eigen `open.min`; de volgers Motorkapsteun, Ruitdrager en Rubber zijruit hebben er geen en geven daarom een melding in de opentest.

Deze auto heeft geen glazen dak: het panoramadak van laguna3 valt hier weg en `src/panorama.js` is leeg.

### Prestaties in Openen

Controle 5 van `tools/opentest.py` meet met alle openers open de tekenopdrachten (grens 3.000) en de frametijd p95 bij `openAll(1)` en `openAll(0)` (grens 8 ms); de uitkomst staat in de uitvoer van de volledige set. Dat zijn meetwaarden uit software-rendering.

## Contracten tussen de eigenaars

De delen bouwen parallel en kennen elkaar alleen via de volgende afspraken. Wie een waarde wijzigt, meldt dat.

### Gedeelde carrosseriefuncties (`body.js`)

| Symbool | Betekenis |
|---|---|
| `ZF`, `ZR` | Bumperpunten voor en achter. |
| `AXF`, `AXR`, `AY` | Vooras, achteras, wielmiddelpunt. |
| `TRACK_F`, `TRACK_R`, `ARCH` | Halve spoor voor en achter, wielboogstraal rond beide assen. |
| `HW(z)` | Halve breedte in bovenaanzicht. |
| `YB(z)` | Onderkant van de carrosserie. |
| `YT(z)` | Schouderlijn, gelijk aan de raamlijn in de cabine. |
| `YR(z)` | Daklijn op de hartlijn. |
| `surfX(z, y)` | Buitenhuid in x op hoogte y. Boven `YT` in het kasbereik geeft hij de halve breedte van ruit, stijl of dak; boven dek of dak 0. |
| `skin(z, y, s, out)` | Punt op de huid. |

De waarden en krommen van deze auto staan in [contract.md](contract.md), paragraaf 2. Het interieur, de motor, de systemen en het onderstel leiden hun raakvlakken met de carrosserie af uit deze functies in plaats van uit vaste getallen.

### Kapprofiel en ruimte in de motorruimte

De tabel met de buitenkant van de motorkap en de hoogste punten van de onderdelen eronder, en de gereserveerde zones in de motorruimte, staan in [contract.md](contract.md), paragraaf 4. `tools/integrity.py` faalt als een onderdeel buiten de carrosserie minder dan 2,5 cm onder de buitenhuid van de motorkap blijft, minder dan 0,5 cm onder de laagste laag van de motorkap (binnenframe of isolatiemat) blijft, of boven de carrosserie uitsteekt. Dezelfde controle toetst de lengte (binnen `ZR` tot `ZF` met 6 mm marge) en de breedte met en zonder spiegels.

### Aansluitpunten (`ENG_PORTS`, `DRV_PORTS`)

Elke poort is `{ p, dir }`; `portAt(poort, afstand)` geeft een punt op die afstand langs de richting. `ENG_PORTS` (motorframe, `engine1.js`) en `DRV_PORTS` (`drivetrain.js`) van deze auto, met waarden en gebruikers, staan in [contract.md](contract.md), paragraaf 5. De G10BB heeft geen turbo, geen intercooler en geen stuurbekrachtiging, dus de poorten en de gereserveerde ruimte die laguna3 daarvoor had, vallen weg.

## Ontwikkelgeschiedenis

De geschiedenis van deze auto staat per versie in [CHANGELOG.md](../CHANGELOG.md) en per beslissing in [onderzoek/beslissingen.md](onderzoek/beslissingen.md). De geschiedenis van het framework (laguna3, golf 1 tot en met 5 en de carrosserieronde) staat in `docs/ontwerp-en-architectuur.md` van laguna3; [framework.md](framework.md) beschrijft de stand van het framework en de exports.

## Bewuste keuzes

- Geen typebadges of exacte kopie van het carrosseriedesign; het model volgt wel de hoofdmaten en het gemeten silhouet. Het embleem op de grille is een vereenvoudigde S (`CHANGELOG.md`, versie 2), geen kopie van het merklogo.
- Kentekenplaten zonder kenteken.
- Eén bouwbestand per domein en een contract met namen, in plaats van één groot bestand: agents kunnen parallel werken en samenvoegen is bijna vrij van conflicten.
- Geen opvulling om een onderdelendoel te halen. Geen groep met meer dan 12 identieke onderdelen die in werkelijkheid niet zo vaak voorkomen.
- Lettertypes: Saira Condensed (koppen), Atkinson Hyperlegible (tekst), IBM Plex Mono (gegevens).
- Geen backdrop-blur boven het canvas en een eenvoudige schaduwvlek onder de auto in plaats van echte schaduwen, voor de framesnelheid op telefoons.
- Het model toont de Twist-uitrusting van de auto van de gebruiker ([contract.md](contract.md), paragraaf 1).
- Openen is een tweede modus naast Uitklappen en vervangt het uitklappen niet. In Openen staat alles gemonteerd.
- Een opener heeft altijd een ondergrens (`open.min`). Zonder ondergrens zou een botsingstoets agents naar kleine hoeken sturen.
- Elke onderdeelstatus heeft een bron. `Past volgens catalogus` zegt niet dat het nummer op deze auto past, en de pagina vraagt altijd om controle op het chassisnummer. Wat niet onderzocht is, blijft `Niet onderzocht`.
- Waar het onderzoek geen bron had, staat de opbouw als schematisch in de beschrijving en in [specificaties-en-bronnen.md](specificaties-en-bronnen.md).
