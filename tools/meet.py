"""meet.py (ronde 4): herbruikbare meting van de voorkant (ronde 2 plus helderheidspoort afscherming, wielkastcamera's met kierpoort en afwerkingsmetingen). Eén exitcode (0 groen, 1 minstens één rode poort, 2 meting mislukt), JSON-uitvoer.

Wat het doet
  1. Id-pass zonder z- of y-filter: elke knoop krijgt een eigen kleur, glas met dekking < 0,5 (koplamp, hoekkap) is verborgen, de pass gaat naar een
     rendertarget zonder antialias, dus elk beeldpunt heeft precies één id (ook kieren van 1 of 2 beeldpunten). Per camera telt het script de beeldpunten
     per knoop (DPR 2, 1000 x 738 css = 2000 x 1476) en geeft elke knoop een klasse: buitenkant, wiel, wielkast, interieur, motorruimte, onderstel, overig.
     Elke knoop uit de motorruimte of het onderstel wordt gemeld met aantal beeldpunten, omkadering, een voorbeeldbeeldpunt (voor rays.py) en de verdeling
     naar breedte: dun (<= 2 beeldpunten breed, een naad), smal (3 tot 4) en breed (>= 5).
  2. Camera's: per kant (links en gespiegeld rechts) vijf hoge, dichte hoekcamera's (lamphoek, hoekboven, bovenlamp, kapnaad, flankhoog) en een
     ingezoomde beginstand (assembled-zoom); de camera's van de eigenaar (eig met beeldverschuiving 125 css-px, eig-dicht) en een vooraanzicht van
     boven (voor-hoog) en van laag (voor-laag). `--cams assembled` geeft de kale beginstand.
  3. Geometrie: bumperschouderhoek (grens 25 graden; bepaling van ronde 1: grootste hoek tussen de normalen aan de uiteinden van een driehoeksrand van
     Bumperschaal voor, y > 0,50, z 1,45 tot 1,70), lip-aansluiting (afstand en normaalhoek tussen de bovenrand van Bumperlip voor en het oppervlak van de schaal,
     en de grootste normaalsprong langs de lip, vanaf z 1,50), y-bereik van hoekkap en hoofdlens, verhouding bumper/lamp op x = 0, aantal driehoeken.
  4. Poorten (zie onder) -> 'ok' in de JSON en de exitcode.

Poorten
  kier <cam>               hoekcamera's, voor-hoog, assembled-zoom: geen knoop uit motorruimte of onderstel met meer dan 50 smalle of brede beeldpunten
                           (stroken van hoogstens 2 beeldpunten breed zijn naden en tellen niet; ze staan wel als dun_px in de JSON)
  zicht onder de bumper    eig, eig-dicht, voor-laag (en gespiegeld): motorruimte plus onderstel van de voorste helft (knoopmiddelpunt z > 0,6) hoogstens
                           0,5 procent van het beeld; het onderstel achter de auto telt niet mee (de lage blik ziet onder de drempel door)
  bumperschouderhoek       <= 25 graden (streef 20)
  hoekkap boven/onder      hoekkap hoogstens 15 mm boven en 10 mm onder de hoofdlens
  lip afstand / aansluithoek / normaalsprong   <= 3 mm / <= 30 graden / <= 25 graden
  verhouding bumper/lamp   <= 2,8
  console                  geen fouten of waarschuwingen
  aantal poorten           alleen in volle modus (zonder --cams, --geen-geo en --geen-rondgang): precies VERWACHT_HARD (99) harde en VERWACHT_ZACHT (13) zachte poorten; anders is deze extra poort rood (exitcode 1).
                           Staat ook in het groene geval in de lijst (extra: true in de JSON) en telt niet mee in de 99. In de beperkte modus meldt het script 'aantal poorten niet gecontroleerd (beperkte modus)'.
  invoer ontbreekt         in volle modus worden de geo-poorten (bumperschouderhoek, hoekkap, lip, verhouding bumper/lamp, afscherming, wielkastbekleding) en 'onderplaat tegenover gaas in eig' altijd
                           aangemaakt: ontbreekt hun invoer (hernoemde knoop, geo-meting null), dan staan ze rood met de waarde 'invoer ontbreekt: <sleutel>' in plaats van te verdwijnen

Toegevoegd in ronde 3 (adv.nodig 1, 2 en afwerking a tot e; kolom 'zacht' = telt niet mee voor de exitcode, regel begint met GEEL)
  helderheid onderplaat <cam> <licht|donker>   luminantie Onderplaat voorbumper hoogstens die van Luchtrooster voor, in eig, eig-r, eig-dicht, eig-dicht-r, recht-lamp en voor-laag
  wielkast kier <cam>      wielkastcamera's baan-r3.0-h1.7-a105, baan-r3.0-h1.1-a75, baan-r3.0-h1.1-a120, bumpL-r1.8-a130-e12 en zijhoek, elk ook gespiegeld (-r): geen knoop uit de
                           motorruimte of de cabine (klasse interieur) boven 50 smalle of brede beeldpunten. Alleen binnen het interessegebied: omkadering van voorwiel en
                           voorwielkast plus 25 procent (anders telt de cabine langs de ruitranden mee). Het glas blijft zichtbaar in deze camera's. Onderstel telt niet mee
                           (de lage blik door de wielkast ziet de ophanging) maar staat als onderstel_info in de JSON.
  wielkastbekleding raakt onderstel en aandrijving niet   bewaking: geen hoekpunt van Onderstel, Aandrijflijn of Uitlaatsysteem (zonder remleidingen en slangbeugels) binnen 5 mm van Wielkast voor links
  sikkel Schutbord eig     Schutbord in eig (en eig-r) hoogstens 50 beeldpunten: de donkerrode sikkel boven de band
  afwerking a (zacht)      Bumperbalk voor hoogstens 200 px in bumpL-r0.6-a50-e70 (60 cm boven de bumperhoek)
  afwerking c (zacht)      Onderplaat voorbumper die binnen 2 beeldpunten Bumperschaal voor en Bumperlip voor raakt (de spleet tussen schaal en lip: de dunne lijn) hoogstens 50 px in eig-dicht, eig-dicht-r, sleuf-schuin
  afwerking d (zacht)      driehoeken van Bumperschaal voor (y > 0,50, z 1,45 tot 1,70) waarvan het vlak meer dan 30 graden afwijkt van de gemiddelde hoekpuntnormaal: hoogstens 12 driehoeken en 319 mm2
  afwerking e (zacht)      embleem 0,9 tot 2,0 keer de helderheid van het gaas in eig, eig-r, zijhoek en zijhoek-r (licht en donker)
  afwerking b              niet als getal opgenomen: het treetje en het tandje bij de kaphoek zijn met een randmeting niet betrouwbaar te vangen (proef gaf een knik van 8 px op de verkeerde plaats).
                           Beoordeel op beeld: `--cams lamphoek,lamphoek-r --shots` en uitsnede (1000, 450, 1700, 800) van lamphoek-light.png
  Nieuwe camera's gebruiken near/far zoals uiNearFar in de app (dichtbij); de camera's van ronde 2 zijn ongewijzigd, zodat hun cijfers vergelijkbaar blijven.

Toegevoegd in ronde 4 (adv.nodig 2 van ronde 3: de regressie van a28dff6 en de gaten onderin de boog; alles harde poorten)
  Camera's     wielkast-recht, wielkast-achter, zij-laag (was beeldcamera zonder poort), wk-zij-laag, elk ook gespiegeld (-r), en een lage rondgang: 432 camera's (doelen baanm = midden van de auto en baanv = de voorkant, 2,0 / 3,0 / 4,5 m,
               0,23 en 0,45 m hoogte, om de 10 graden, namen als in de sweep van de adviseur: baanv-r2.0-h0.23-a120). `--cams rondgang` of `--cams wielkast` kiest een groep; `--geen-rondgang` slaat de rondgang over (ca. 1 minuut in plaats van ca. 4).
  Klasse       voor de wielkastcamera's en de rondgang telt de hele groep Remleidingen (leidingen, remslangen, slangbeugels, klemmen) als wielkasthardware: geen doorkijk (WK_HARDWARE). Veerpoottoren en Langsligger tellen mee (klasse motorruimte).
  Zone         van elk gevlagd beeldpunt dat geen naad is (breder dan 2 beeldpunten) wordt de wereldpositie bepaald (tweede pass). Een camera naast de auto (|x| > 0,6) die het wielkastvlak |x| = 0,50 passeert op y 0,26 tot 0,90 en z 0,707 tot 1,467 kijkt door de wielkast:
               zone onder (y < 0,50, behalve midden onder de boog: |z - 1,087| < 0,20, daar loopt de aandrijfas op naafhoogte vrij door de wand), venster (0,50 tot 0,66) of boven (0,66 tot 0,90). Een knoop zelf in de wielkastruimte (|x| >= 0,50) en lager dan y 0,50 telt als onder
               (vloermat, dorpelbekleding). Al het andere is 'overig': onder de auto door, van voren of achteren, of tussen de aandrijfas. De zones staan per knoop in de JSON (gevlagd[].zone_px, kruis_yz).
  wielkast kier <cam>   de camera's van ronde 4 tellen alleen blikken door de wielkast (zone onder, venster of boven); de tien van ronde 3 tellen alles, ongewijzigd.
  wielkast venster boven de band <kant>      geen knoop boven 50 px (smal en breed) in de zone venster, over alle wielkastcamera's en de rondgang van die kant (links: camera op x > 0). De regressie van a28dff6: venster van ca. 45 mm tussen schot (y 0,555 tot 0,574) en veerpoottoren (y 0,62).
  wielkast gat onder de boog <kant>          idem in de zone onder: de blote langsligger voor de band en de vloermat achter de band (punt 3). Het gat midden onder de boog (aandrijfas) telt niet.
  wielkast opening boven het venster <kant>  idem in de zone boven (kapnaad, schermrand).
  wielkast venster tegenover V1 <kant>       tussenpoort: hoogstens 2.500 px motorruimte- of cabinebeeld door het venster per camera. V1 (9578e6f) haalt 2.155 (wielkast-achter), a28dff6 en later 2.663 tot 5.981: V1 had nog twee spleten naast de ronde toren en is dus rood op de strenge poort hierboven, niet op deze.
  wielkast scharnier achter de band <kant>   geen Scharnierblad of Scharnierbout boven 50 px per knoop in de lage camera's van ronde 4 (HEAD wielkast-recht: Scharnierblad carrosserie 15.520). De portierrand staat als scharnier_px in de JSON, niet als poort.
  wielkast rondgang h<hoogte> r<afstand> <kant>   12 poorten: geen knoop boven 50 px in de zones onder, venster of boven, per hoogte, afstand en kant (links: camera op x > 0, rechts: x < 0; de voorste en achterste camera's op x = 0 tellen voor beide).

Achtermodus (--achter; open punt AWK, stage S1, 18 oktober 2026): de doorkijk door de achterwielkasten naar de cabine (achterbank, bagagebekleding, vloer, zijbekleding achter).
  Herkomst  front-ronde4/v2/meet_achter.py (beslissing 25 punt 2): meet.py ronde 4 met vier verschillen, hier letterlijk overgenomen; de voormodus verandert niet.
            1. interessegebied ROI_WIEL_L_ACHTER en ROI_WIEL_R_ACHTER: '^(Wiel linksachter/|.*/Wielkast achter links )' en rechts, marge 25 procent. Het tweede deel (met de spatie aan het eind,
               zoals voor) past op geen knoop; het gebied is dus de omkadering van het achterwiel plus 25 procent, zoals in meet_achter.py
            2. zone ZONE_Z_ACHTER z -1,628 tot -0,868 (de achterboog AXR -1,248 +- ARCH 0,30 plus 80 mm)
            3. as van de vrijstelling midden onder de boog: AXR_ACHTER -1,248 in plaats van 1,087 (ZONE_DEND 0,20 en ZONE_Y ongewijzigd)
            4. WK_HARDWARE_ACHTER: ook Remleiding achter en Remslang achter tellen als remhardware in de wielkast, niet als doorkijk
  Camera's  de lage rondgang (432 camera's, als voor) en de wielkastcamera's achter (WIELKAST_ACHTER); geen hoek-, eigenaar-, voor-, detail-, afwerking- of beeldcamera's en geen geometrie.
  Poorten   drempels als voor: 50 px (smal en breed) per interieur- of motorruimteknoop, tussenpoort 2.500 px per camera. Namen met 'achter' voor de kant:
            wielkast venster boven de band achter <kant>, wielkast gat onder de boog achter <kant>, wielkast opening boven het venster achter <kant>   over de rondgang van die kant
            wielkast venster tegenover V1 achter <kant>   tussenpoort (getal uit de voormeting; achter niet apart geijkt)
            wielkast rondgang h<hoogte> r<afstand> achter <kant>   12 poorten
            console zonder fouten achter
  Controle  volle achtermodus (zonder --cams en --geen-rondgang): precies VERWACHT_HARD_ACHTER harde en VERWACHT_ZACHT_ACHTER zachte poorten (extra poort 'aantal poorten achter'), en de extra poort
            'interessegebied achterwielen in beeld' (minstens een rondgangcamera met het linker- en een met het rechterachterwiel, elke wielkastcamera achter met interessegebied). Een poort zonder
            invoer (geen camera van die kant) staat in volle modus rood met 'invoer ontbreekt: ...'. Beide extra poorten tellen niet mee in het aantal, wel in de exitcode.
  JSON      per gevlagde knoop ook zone_px.midden: de beeldpunten die de vrijstelling midden onder de boog (|z - as| < 0,20) naar 'overig' zet (een deel van overig); per camera roi_gevonden.
  Gebruik   python3 -I tools/meet.py --achter --uit MAP --json MAP/meet-achter.json --geen-png   (--cams rondgang: alleen de rondgang, de 21 poorten van meet_achter.py; beperkte modus)

Gebruik
  . ~/.config/web3d/env.sh
  python3 -I tools/meet.py [--achter] [--root WERKBOOM] [--uit MAP] [--json BESTAND] [--cams a,b,c|rondgang|wielkast] [--geen-rondgang] [--sw] [--geen-geo] [--geen-png] [--shots] [--basis EERDERE.json]
  --achter  achtermodus (zie hierboven)
  --root    werkboom met tools/harness.py en src/ (standaard: de repowortel waarin tools/meet.py staat, anders $MEET_ROOT; ontbreekt tools/harness.py in de gekozen wortel, dan een duidelijke fout met exitcode 2); in de container: de uitgepakte ref
  --uit     map voor de id-beelden <cam>-ids.png (grijs = buitenkant, magenta = motorruimte, oranje = onderstel); standaard een nieuwe tijdelijke map (het pad staat in de uitvoer); verplicht kiezen als de uitvoer bewaard moet blijven, zoals in finaltests
  --json    standaard UIT/meet.json
  --sw      SwiftShader in plaats van de GPU (standaard op macOS: ANGLE Metal; elders SwiftShader). De id-pass is rasterexact genoeg voor beide.
  --shots   maak ook gewone opnamen (donker en licht) per camera, voor de galerij
  --basis   eerdere meet.json: toon het verschil per camera
Tip: tools/rays.py schiet stralen door een beeldpunt uit meet.json (gevlagd[].voorbeeld_px) en toont wat de opening begrenst.
"""
import sys, os, json, argparse, tempfile, base64, time, platform, subprocess, io, math

HERE = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser()
_PAR = os.path.dirname(HERE)   # staat meet.py in <werkboom>/tools/, dan is de werkboom de standaard
ap.add_argument('--root', default=_PAR if os.path.exists(os.path.join(_PAR, 'tools', 'harness.py')) else os.environ.get('MEET_ROOT'))
ap.add_argument('--uit', help='map voor de id-beelden en meet.json (standaard: een nieuwe tijdelijke map, zie de uitvoer)')
ap.add_argument('--json')
ap.add_argument('--cams')
ap.add_argument('--sw', action='store_true')
ap.add_argument('--geen-geo', action='store_true')
ap.add_argument('--geen-rondgang', action='store_true', help='sla de 432 rondgangcamera\'s over (snelle tussenmeting; de rondgangpoorten ontbreken dan)')
ap.add_argument('--geen-png', action='store_true')
ap.add_argument('--shots', action='store_true')
ap.add_argument('--basis')
ap.add_argument('--achter', action='store_true', help='achtermodus: de achterwielkasten (rondgang en wielkastcamera\'s achter, zie de docstring); de voormodus blijft ongewijzigd')
a = ap.parse_args()
if not a.root or not os.path.isfile(os.path.join(a.root, 'tools', 'harness.py')):
    print(f"FOUT: tools/harness.py ontbreekt in de wortel {a.root!r}; geef --root WERKBOOM of zet $MEET_ROOT (standaard: de repowortel boven tools/meet.py)", file=sys.stderr); sys.exit(2)
sys.path.insert(0, os.path.join(a.root, 'tools'))
import harness
from PIL import Image
import numpy as np

VW, VH, DPR = 1000, 738, 2
OYCSS = 125   # verticale beeldverschuiving (css-px) die de camera 'eig' op front-melding.png afstemt

# ---------------------------------------------------------------- camera's
# naam: (positie, doel, viewoffset-y, soort). soort: 'hoek' (hoge, dichte hoekcamera, scherpste poort), 'eigenaar' (lage blik), 'voor' (vooraanzicht)
LINKS = {
    'lamphoek':  ([0.78, 0.86, 2.05], [0.55, 0.70, 1.62]),
    'hoekboven': ([0.95, 1.05, 2.30], [0.52, 0.72, 1.62]),
    'bovenlamp': ([0.70, 1.55, 1.95], [0.55, 0.72, 1.60]),
    'kapnaad':   ([0.30, 1.00, 2.35], [0.52, 0.73, 1.60]),     # langs de kaprand van de neus naar de hoek
    'flankhoog': ([1.45, 1.00, 1.95], [0.55, 0.70, 1.56]),     # van opzij en boven op de hoek tussen scherm, kap en lamp
    # ronde 2, premortem: dichtbij op lamphoogte en vrije camera's die in ronde 1 niet bestonden (de eigenaar zoomt en draait zelf)
    'dicht-lamp': ([0.62, 0.70, 1.95], [0.52, 0.66, 1.62]),   # 30 cm van de lens, op lamphoogte: sikkel boven de hoekkap
    'dicht-hoek': ([0.95, 0.66, 1.80], [0.60, 0.62, 1.55]),   # de hoek onder de lamp: plooien in de bumperwang
    'schuin-ver': ([2.60, 1.30, 3.60], [0.00, 0.55, 1.00]),
    'ruit':       ([0.35, 1.25, 0.90], [0.45, 0.72, 1.70]),
    'eig-hoger':  ([1.761, 0.55, 3.389], [-0.386, 1.486, 0.258]),   # de eigenaar, 32 cm hoger
}
EIGENAAR = {
    'eig':       ([1.761, 0.227, 3.389], [-0.386, 1.486, 0.258]),
    'eig-dicht': ([1.15, 0.28, 2.75], [0.15, 0.62, 1.55]),
}
VOOR = {
    'voor-hoog': ([0.0, 1.20, 3.0], [0.0, 0.68, 1.6]),
    'voor-laag': ([0.0, 0.30, 3.0], [0.0, 0.50, 1.6]),
}
# detailcamera's voor de helderheid van het embleem tegenover het gaas (licht en donker); ze hebben geen kier- of onderzichtpoort
# beeldcamera's voor de galerij (zij- en onderaanzichten van de voorkant): geen poorten, wel id-pass en opnamen
BEELD = {
    'top-hoek':   ([0.90, 2.20, 2.40], [0.40, 0.65, 1.55]),   # van boven: door de voorruit zie je een streep van de bovenrand van het schutbord (ca. 1000 beeldpunten); geen poort, zie beslissing 21
    'wiel-voor':  ([1.20, 0.35, 2.20], [0.60, 0.35, 1.30]),
}
DETAIL = {
    'dicht-grille': ([0.0, 0.66, 2.10], [0.0, 0.62, 1.70]),
    'recht-lamp':   ([0.0, 0.66, 3.60], [0.0, 0.60, 1.60]),
}
# ronde 3, adv.nodig 2: wielkastcamera's (linkervoorwiel; elk ook gespiegeld als <naam>-r) uit adv/cams-baan-sel2.json, adv/cams-wb.json en adv/cams-lum.json. Kierpoort: geen motorruimte- of cabineknoop boven 50 px breed.
ROI_WIEL = {'re': r'^(Wiel (links|rechts)voor/|.*/Wielkast voor )', 'marge': 0.25}   # interessegebied: omkadering van voorwiel en voorwielkast plus 25 procent van de langste zijde
WIELKAST = {
    'baan-r3.0-h1.7-a105': ([2.898, 1.7, -0.526], [0.0, 0.55, 0.25]),    # staand op 3 m, schuin van achteren op het voorwiel (advies: Sproeierreservoir 1.483 px)
    'baan-r3.0-h1.1-a75':  ([2.898, 1.1, 1.026], [0.0, 0.55, 0.25]),     # op 1,1 m hoogte (advies: Langsligger 5.426 px)
    'baan-r3.0-h1.1-a120': ([2.598, 1.1, -1.25], [0.0, 0.55, 0.25]),     # idem van achter het wiel (door de wielkast de cabine in)
    'bumpL-r1.8-a130-e12': ([1.8487, 0.6942, 0.4483], [0.5, 0.32, 1.58]),   # gehurkt naast de auto (advies: Sproeierreservoir 6.686 px)
    'zijhoek':             ([1.95, 0.62, 2.05], [0.62, 0.56, 1.52]),     # ook camera voor de lage blik op het embleem (afwerking e)
    # ronde 4, adv.nodig 2: de lage blikken op de voorwielkast die de regressie van a28dff6 (venster boven de band) en de gaten onderin de boog (langsligger voor, vloermat en scharnier achter) lieten zien (adv/cams/cams-wk.json)
    'wielkast-recht':      ([1.60, 0.35, 1.10], [0.62, 0.42, 1.087]),    # recht op de wielkast, gehurkt: Hoofdremcilinder 3.978 px door het venster; gat onderin de boog voor (Langsligger) en achter (Vloerbedekking)
    'wielkast-achter':     ([1.40, 0.30, 0.30], [0.60, 0.40, 1.10]),     # schuin van achteren op de wielkast: scharnierblad, portierrand en vloermat achter de band
    'zij-laag':            ([1.70, 0.25, 1.90], [0.55, 0.30, 1.45]),     # was beeldcamera zonder poort (Rembekrachtiger 2.424 px door het venster)
    'wk-zij-laag':         ([1.92, 0.35, 1.087], [0.62, 0.40, 1.087]),   # laag van opzij op de wielkast
}
# ronde 4, adv.nodig 2: lage rondgang zoals een bezoeker: 2,0, 3,0 en 4,5 m van het midden van de auto (baanm) en van de voorkant (baanv), op 0,23 en 0,45 m hoogte, om de 10 graden.
# Namen zoals in de sweep van de adviseur (baanv-r2.0-h0.23-a120). Links en rechts zitten beide in de cirkel (az > 0 is de linkerkant); gemeten wordt in de omkadering van het linker- en rechtervoorwiel apart.
WIELKAST_ZONE = ('wielkast-recht', 'wielkast-achter', 'zij-laag', 'wk-zij-laag')
RONDGANG_DOELEN = {'baanm': [0.0, 0.55, 0.25], 'baanv': [0.0, 0.50, 1.20]}
RONDGANG_R = (2.0, 3.0, 4.5)
RONDGANG_H = (0.23, 0.45)
RONDGANG_AZ = range(-180, 180, 10)
ROI_WIEL_L = {'re': r'^(Wiel linksvoor/|.*/Wielkast voor links )', 'marge': 0.25}
ROI_WIEL_R = {'re': r'^(Wiel rechtsvoor/|.*/Wielkast voor rechts )', 'marge': 0.25}
# zones van een doorkijk (alleen wielkastcamera's en rondgang): waar de blik het wielkastwandvlak |x| = 0,50 passeert (y op dat vlak): onder de boog (< 0,50), het venster boven de band (0,50 tot 0,66) of boven (>= 0,66)
ZONE_NAMEN = ('onder', 'venster', 'boven', 'overig')
ZONE_Y = [0.26, 0.50, 0.66, 0.90]   # onderrand dorpel (bodYSill 0,268, dorpel 6 mm lager): daaronder kijk je onder de auto door; grenzen onder | venster | boven; daarboven de kap
ZONE_DEND = 0.20                    # midden onder de boog (|z - 1,087| < dEnd van bodWheelHouse) loopt de aandrijfas op naafhoogte door de wand: dat gat is bedoeld en telt niet
ZONE_Z = [0.707, 1.467]             # de wielboog (AXF 1,087 +- ARCH 0,30) plus 80 mm: alleen blikken die het wielkastvlak in dit z-bereik passeren gaan door de wielkast
WK_HARDWARE = r'^(Remleiding voor|Remslang voor|Slangbeugel|Remleidingklem)'   # remhardware in de wielkast zelf (|x| 0,50 tot 0,53): telt in de wielkastpoort niet als doorkijk
# achtermodus (--achter, open punt AWK): de vier verschillen met de voormodus uit front-ronde4/v2/meet_achter.py (beslissing 25 punt 2), letterlijk overgenomen. Let op: het deel '.*/Wielkast achter links ' van het
# interessegebied van de rondgang (met spatie aan het eind, zoals voor) past op geen knoop (de knoop heet 'Wielkast achter links'); het interessegebied is dus de omkadering van het achterwiel plus 25 procent, zoals in meet_achter.py.
AXR_ACHTER = -1.248                 # achteras (AXR in body.js); as van de vrijstelling midden onder de boog
ROI_WIEL_L_ACHTER = {'re': r'^(Wiel linksachter/|.*/Wielkast achter links )', 'marge': 0.25}
ROI_WIEL_R_ACHTER = {'re': r'^(Wiel rechtsachter/|.*/Wielkast achter rechts )', 'marge': 0.25}
ROI_WIEL_ACHTER = {'re': r'^(Wiel (links|rechts)achter/|.*/Wielkast achter )', 'marge': 0.25}   # wielkastcamera's achter: achterwielen en achterwielkasten samen, zoals ROI_WIEL voor
ZONE_Z_ACHTER = [-1.628, -0.868]    # de achterboog (AXR -1,248 +- ARCH 0,30) plus 80 mm
WK_HARDWARE_ACHTER = r'^(Remleiding voor|Remslang voor|Remleiding achter|Remslang achter|Slangbeugel|Remleidingklem)'
# wielkastcamera's achter (achtermodus): naam -> (positie, doel), linkerkant; elk ook gespiegeld als <naam>-r
WIELKAST_ACHTER = {}
# ronde 3, afwerking a: 60 cm boven de bumperhoek (adv/cams-naad.json, Bumperbalk 5.646 px tussen lamphuis en bumpernaad)
AFWERKING = {
    'bumpL-r0.6-a50-e70': ([0.6572, 0.8838, 1.7119], [0.5, 0.32, 1.58]),
    'sleuf-schuin':       ([0.75, 0.55, 2.15], [0.34, 0.415, 1.74]),    # afwerking c: dunne lijn tussen eindvlak en schaal (adv/cams-sleuf.json)
}
# helderheid per knoop (licht en donker): kolom 'maskers' van de camera. LUM_NAMEN = embleem, gaas, onderplaat, luchtroosters
LUM_NAMEN = ['Embleem', 'Honingraatgrille', 'Onderplaat voorbumper', 'Luchtrooster voor', 'Bumperschaal voor', 'Bumperlip voor']
LUM_ONDERPLAAT = ('eig', 'eig-r', 'eig-dicht', 'eig-dicht-r', 'recht-lamp', 'voor-laag')   # camera's met de poort onderplaat <= luchtrooster
NAADSTROOK_CAMS = ('eig-dicht', 'eig-dicht-r', 'sleuf-schuin')           # afwerking c
LUM_EMBLEEM_LAAG = ('eig', 'eig-r', 'zijhoek', 'zijhoek-r')                               # camera's met de afwerkingspoort embleem leesbaar (e)
HOEK_NAMEN = list(LINKS)


def spiegel(v): return [-v[0], v[1], v[2]]


def cam_lijst():
    c = {}
    for k, (p, t) in LINKS.items():
        c[k] = dict(p=p, t=t, soort='hoek', kant='links')
        c[k + '-r'] = dict(p=spiegel(p), t=spiegel(t), soort='hoek', kant='rechts')
    for k, (p, t) in EIGENAAR.items():
        mk = LUM_NAMEN if k in LUM_ONDERPLAAT or k in LUM_EMBLEEM_LAAG else None
        c[k] = dict(p=p, t=t, soort='eigenaar', kant='links', oy=OYCSS if k == 'eig' else 0, maskers=mk)
        c[k + '-r'] = dict(p=spiegel(p), t=spiegel(t), soort='eigenaar', kant='rechts', oy=OYCSS if k == 'eig' else 0, maskers=mk)
    for k, (p, t) in VOOR.items():
        c[k] = dict(p=p, t=t, soort='voor', kant='midden', maskers=LUM_NAMEN if k in LUM_ONDERPLAAT else None)
    for k, (p, t) in DETAIL.items():
        c[k] = dict(p=p, t=t, soort='detail', kant='midden', maskers=LUM_NAMEN if k in LUM_ONDERPLAAT else HELDER_NAMEN)
    for k, (p, t) in WIELKAST.items():
        mk = ['Embleem', 'Honingraatgrille'] if k == 'zijhoek' else None
        zd = k in WIELKAST_ZONE   # nieuwe camera's (ronde 4): alleen blikken die door de wielkast gaan tellen (zone onder, venster of boven); de tien van ronde 3 tellen alles, zoals in ronde 3
        c[k] = dict(p=p, t=t, soort='wielkast', kant='links', flag=[4, 5], maskers=mk, zoned=zd)
        c[k + '-r'] = dict(p=spiegel(p), t=spiegel(t), soort='wielkast', kant='rechts', flag=[4, 5], maskers=mk, zoned=zd)
    rondgang_cams(c)
    for k, (p, t) in AFWERKING.items():
        c[k] = dict(p=p, t=t, soort='afwerking', kant='links', afw='a' if k.startswith('bumpL') else 'c', maskers=['Bumperschaal voor', 'Bumperlip voor', 'Onderplaat voorbumper'] if not k.startswith('bumpL') else None)
    for k, (p, t) in BEELD.items():
        c[k] = dict(p=p, t=t, soort='beeld', kant='links')
    # ingezoomde beginstand: de positie en richting van 'assembled' (uiFitPoints) wordt in de pagina gelezen en op de linkervoorhoek ingezoomd; p/t volgen later
    c['assembled'] = dict(p=None, t=None, soort='hoek', kant='links', assembled=True, kaal=True)
    c['assembled-zoom'] = dict(p=None, t=None, soort='hoek', kant='links', assembled=True)
    c['assembled-zoom-r'] = dict(p=None, t=None, soort='hoek', kant='rechts', assembled=True)
    return c


def rondgang_cams(c):
    for dn, t in RONDGANG_DOELEN.items():
        for r in RONDGANG_R:
            for h in RONDGANG_H:
                for az in RONDGANG_AZ:
                    p = [round(t[0] + r * math.sin(math.radians(az)), 4), h, round(t[2] + r * math.cos(math.radians(az)), 4)]
                    c[f'{dn}-r{r}-h{h}-a{az}'] = dict(p=p, t=t, soort='rondgang', kant='links' if p[0] > 1e-6 else ('rechts' if p[0] < -1e-6 else 'midden'), flag=[4, 5], maskers=None, r=r, h=h, az=az, doel=dn)


def cam_lijst_achter():
    """achtermodus: dezelfde lage rondgang als de voormodus (432 camera's, doelen baanm en baanv) plus de wielkastcamera's achter (WIELKAST_ACHTER, elk ook gespiegeld als -r)"""
    c = {}
    rondgang_cams(c)
    for k, (p, t) in WIELKAST_ACHTER.items():
        c[k] = dict(p=p, t=t, soort='wielkast', kant='links', flag=[4, 5], maskers=None, zoned=True)
        c[k + '-r'] = dict(p=spiegel(p), t=spiegel(t), soort='wielkast', kant='rechts', flag=[4, 5], maskers=None, zoned=True)
    return c


# ---------------------------------------------------------------- id-pass (in de pagina)
IDPASS_JS = r"""(opt) => {
  const L = window.__model; L.ROOT.obj.updateMatrixWorld(true);
  const wasB = L.batching(); L.batching(false);
  const set = new Set(L.MESHES), hid = [], saved = [], glas = [], labels = [], klassen = [];
  const wkhw = opt && opt.wkhw ? new RegExp(opt.wkhw) : null;   // wielkastcamera's: remhardware in de wielkast zelf is geen doorkijk
  const klasse = (p) => {
    const g = p[1] || '', h = p[2] || '', k = p[3] || '';
    if (wkhw && p[0] === 'Onderstel' && g === 'Remsysteem' && h === 'Remleidingen' && wkhw.test(k)) return 'wielkast';
    if (wkhw && p[0] === 'Carrosserie' && /^Portier /.test(g) && (h === 'Portierrand' || h === 'Scharnieren')) return 'scharnier';   // wielkastcamera's: portierrand en scharnieren (blad aan het portier en op de stijl) die achter de band in de boog zichtbaar zijn
    if (p[0] === 'Interieur') return 'interieur';
    if (p[0] === 'Carrosserie') {
      if (g === 'Carrosseriekooi') {
        if (h === 'Voorbouw') return /^Wielkast/.test(k) ? 'wielkast' : 'motorruimte';
        if (h === 'Vloer en dorpels') return /^Dorpel/.test(k) ? 'buitenkant' : 'onderstel';
        if (h === 'Achterbouw') return /^Wielkast/.test(k) ? 'wielkast' : 'onderstel';
        return 'buitenkant';
      }
      if (g === 'Motorkap') return (h === 'Buitenpaneel motorkap' || h === 'Kaprand' || (/^Ruitensproeier/.test(h) && k === 'Sproeierkop')) ? 'buitenkant' : 'motorruimte';
      if (g === 'Ruitenwissers' && /^(Wissermotor|Wisserstangen)/.test(h)) return 'motorruimte';
      return 'buitenkant';
    }
    if (p[0] === 'Onderstel') {
      if (g === 'Wielen') return 'wiel';
      if (g === 'Remsysteem') return /^(Schijfrem|Trommelrem)/.test(h) ? 'wiel' : (/^Handrem/.test(h) ? 'onderstel' : 'motorruimte');
      return 'onderstel';
    }
    if (p[0] === 'Aandrijflijn' || p[0] === 'Koeling en luchtinlaat' || p[0] === 'Elektrisch systeem') return 'motorruimte';
    if (p[0] === 'Uitlaatsysteem' || p[0] === 'Brandstofsysteem') return 'onderstel';
    return 'overig';
  };
  const mk = id => new THREE.ShaderMaterial({ uniforms: { c: { value: new THREE.Vector3(((id >> 16) & 255) / 255, ((id >> 8) & 255) / 255, (id & 255) / 255) } },
    vertexShader: 'void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}', fragmentShader: 'uniform vec3 c; void main(){gl_FragColor=vec4(c,1.0);}', side: THREE.DoubleSide });
  scene.traverse(o => { if ((o.isMesh || o.isLine || o.isPoints || o.isSprite) && !set.has(o) && o.visible) { hid.push(o); o.visible = false; } });
  const zc = [];
  L.MESHES.forEach((m, i) => {
    const mt = (m.userData.base || m.material); saved.push([m, m.material]);
    { const g = m.geometry; if (!g.boundingBox) g.computeBoundingBox(); zc.push(g.boundingBox.clone().applyMatrix4(m.matrixWorld).getCenter(new THREE.Vector3()).z); }
    const p = []; let q = m.userData.node; while (q && q.parent) { p.unshift(q.name); q = q.parent; }
    labels.push(p.slice(-2).join('/')); klassen.push(klasse(p));
    if ((!opt || opt.glas !== false) && mt.transparent && mt.opacity < 0.5 && m.visible) { glas.push(m); m.visible = false; }   // wielkastcamera's: glas blijft zichtbaar, anders telt de cabine achter de ruiten als doorkijk
    const id = mk(i + 1); id.side = mt.side; m.material = id;
  });
  const bg = scene.background, fog = scene.fog; scene.background = null; scene.fog = null;
  const cc = renderer.getClearColor(new THREE.Color()), ca = renderer.getClearAlpha();
  const sz = renderer.getDrawingBufferSize(new THREE.Vector2()), W = sz.x, H = sz.y;
  const rt = new THREE.WebGLRenderTarget(W, H, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat, type: THREE.UnsignedByteType, depthBuffer: true });
  renderer.setClearColor(0x000000, 1); renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene, camera);
  const buf = new Uint8Array(W * H * 4); renderer.readRenderTargetPixels(rt, 0, 0, W, H, buf); renderer.setRenderTarget(null); rt.dispose();
  const herstel = () => { saved.forEach(([m, mt]) => { m.material = mt; }); hid.forEach(o => { o.visible = true; }); glas.forEach(m => { m.visible = true; });
    scene.background = bg; scene.fog = fog; renderer.setClearColor(cc, ca); L.batching(wasB); if (wasB) L.batchFlush(); requestRender(); };
  // ids (rij 0 onderaan in readPixels: omdraaien naar boven = 0)
  const ids = new Int32Array(W * H);
  for (let y = 0; y < H; y++) { const ro = (H - 1 - y) * W * 4; for (let x = 0; x < W; x++) { const k = ro + x * 4; ids[y * W + x] = (buf[k] << 16) | (buf[k + 1] << 8) | buf[k + 2]; } }
  // maskers: per beeldpunt de index (1 en hoger) van een knoopnaam uit opt.masks, voor de helderheidsmeting
  let maskB64 = null;
  if (opt && opt.masks) {
    const names = opt.masks, idx = new Uint8Array(labels.length + 1), lm = new Uint8Array(W * H);
    labels.forEach((l, i) => { idx[i + 1] = names.indexOf(l.split('/').pop()) + 1; });
    for (let i = 0; i < ids.length; i++) { const id = ids[i]; if (id > 0 && id <= labels.length) lm[i] = idx[id]; }
    let bin = ''; const CH = 0x8000; for (let i = 0; i < lm.length; i += CH) bin += String.fromCharCode.apply(null, lm.subarray(i, i + CH)); maskB64 = btoa(bin);
  }
  // tellen per knoop (label) en per klasse
  const perLabel = {}, perKlasse = {};
  const lab = new Int32Array(labels.length + 1); const labIdx = {}, labList = [];
  labels.forEach((l, i) => { const key = l + '|' + klassen[i]; if (!(key in labIdx)) { labIdx[key] = labList.length; labList.push({ naam: l, klasse: klassen[i], zs: [] }); } labList[labIdx[key]].zs.push(zc[i]); lab[i + 1] = labIdx[key] + 1; });
  const n = labList.length, cnt = new Float64Array(n + 1), x0 = new Int32Array(n + 1).fill(1e9), y0 = new Int32Array(n + 1).fill(1e9), x1 = new Int32Array(n + 1).fill(-1), y1 = new Int32Array(n + 1).fill(-1);
  const FL = (opt && opt.flag) || [5, 6];   // klasse-indexen die telt als gevlagd: standaard motorruimte (5) en onderstel (6); wielkastcamera's: interieur (4) en motorruimte (5)
  const gevlagd = new Uint8Array(W * H), kl = new Uint8Array(W * H);   // gevlagd: motorruimte of onderstel
  const KLN = ['achtergrond', 'buitenkant', 'wiel', 'wielkast', 'interieur', 'motorruimte', 'onderstel', 'overig', 'scharnier'];
  const klIdx = {}; KLN.forEach((k, i) => { klIdx[k] = i; });
  const tot = new Float64Array(KLN.length);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, id = ids[i]; if (id <= 0 || id > labels.length) { tot[0]++; continue; }
    const l = lab[id]; cnt[l]++; if (x < x0[l]) x0[l] = x; if (x > x1[l]) x1[l] = x; if (y < y0[l]) y0[l] = y; if (y > y1[l]) y1[l] = y;
    const k = klIdx[labList[l - 1].klasse]; kl[i] = k; tot[k]++;
  }
  const sch = new Float64Array(n + 1);   // scharnier: beeldpunten per knoop (portierrand en scharnieren) binnen het interessegebied; apart van de gevlagde doorkijk
  // interessegebied (wielkastcamera's): omkadering van het voorwiel en de voorwielkast (knopen 'Wiel links|rechtsvoor/..' en '../Wielkast voor ..') plus een marge; alleen daarin telt een beeldpunt als gevlagd
  // opt.roi: een omkadering {re, marge} of een lijst daarvan (rondgang: linker- en rechtervoorwiel apart); een beeldpunt telt als het in minstens een ervan ligt
  let roi = null; const gcnt = new Float64Array(n + 1); const rois = [], roiGevonden = [];   // roiGevonden: per omkadering van opt.roi of hij in beeld is (achtermodus: controle op een weggevallen interessegebied)
  if (opt && opt.roi) {
    for (const rd of [].concat(opt.roi)) {
      const re = new RegExp(rd.re); let bx0 = 1e9, by0 = 1e9, bx1 = -1, by1 = -1;
      labList.forEach((q, j) => { if (re.test(q.naam) && cnt[j + 1] > 0) { bx0 = Math.min(bx0, x0[j + 1]); by0 = Math.min(by0, y0[j + 1]); bx1 = Math.max(bx1, x1[j + 1]); by1 = Math.max(by1, y1[j + 1]); } });
      roiGevonden.push(bx1 >= 0);
      if (bx1 >= 0) { const m = rd.marge * Math.max(bx1 - bx0, by1 - by0); rois.push([Math.max(0, Math.round(bx0 - m)), Math.max(0, Math.round(by0 - m)), Math.min(W - 1, Math.round(bx1 + m)), Math.min(H - 1, Math.round(by1 + m))]); }
    }
    roi = Array.isArray(opt.roi) ? rois : (rois[0] || null);
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x; if (!FL.includes(kl[i]) || ids[i] <= 0 || ids[i] > labels.length) continue;
    if (opt && opt.roi && !rois.some(r => x >= r[0] && x <= r[2] && y >= r[1] && y <= r[3])) continue;
    gevlagd[i] = 1; gcnt[lab[ids[i]]]++;
  }
  if (opt && opt.roi) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; if (kl[i] !== 8 || ids[i] <= 0 || ids[i] > labels.length) continue; if (rois.some(r => x >= r[0] && x <= r[2] && y >= r[1] && y <= r[3])) sch[lab[ids[i]]]++; }
  // dunne stroken: gevlagde beeldpunten die na twee erosies (5 x 5) weg zijn en niet terugkomen na dilatatie = breedte <= 4 beeldpunten
  const er = (src) => { const d = new Uint8Array(W * H); for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; if (src[i] && src[i - 1] && src[i + 1] && src[i - W] && src[i + W] && src[i - W - 1] && src[i - W + 1] && src[i + W - 1] && src[i + W + 1]) d[i] = 1; } return d; };
  const di = (src) => { const d = new Uint8Array(W * H); for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; if (src[i] || src[i - 1] || src[i + 1] || src[i - W] || src[i + W] || src[i - W - 1] || src[i - W + 1] || src[i + W - 1] || src[i + W + 1]) d[i] = 1; } return d; };
  let any = 0; for (let i = 0; i < gevlagd.length; i++) if (gevlagd[i]) { any = 1; break; }
  let op1 = null;
  const dun = new Float64Array(n + 1), mid = new Float64Array(n + 1), vr = new Uint8Array(n + 1), vx = new Int32Array(n + 1), vy = new Int32Array(n + 1);   // dun: breedte <= 2 beeldpunten; mid: 3 tot 4 beeldpunten; de rest is breed (>= 5)
  if (any) {
    const e1 = er(gevlagd); op1 = di(e1); const op2 = di(di(er(e1)));
    for (let i = 0; i < gevlagd.length; i++) if (gevlagd[i]) { const l = lab[ids[i]]; if (!op1[i]) dun[l]++; else if (!op2[i]) mid[l]++;
      const rang = op2[i] ? 3 : (op1[i] ? 2 : 1); if (rang > vr[l]) { vr[l] = rang; vx[l] = i % W; vy[l] = (i / W) | 0; } }
  }
  // zones (wielkastcamera's en rondgang): van elk gevlagd beeldpunt dat geen naad is (breedte >= 3) de wereldpositie uit een tweede pass; ligt het punt achter het wielkastwandvlak |x| = 0,50 (gezien vanaf de camerakant), dan is de zone
  // bepaald door de hoogte y waarop de blik dat vlak passeert: onder de boog, het venster boven de band of boven. Ligt het punt zelf in de wielkastruimte (|x| >= 0,50), dan telt het als 'onder' als het lager ligt dan y 0,50 (vloermat, dorpelbekleding), anders is de zone 'overig'; kijkt de camera niet van opzij, dan is de zone ook 'overig'.
  const zone = new Float64Array((n + 1) * 4), cr = new Float64Array((n + 1) * 5).fill(0);
  const midden = new Float64Array(n + 1);   // opt.midden (achtermodus): beeldpunten die de vrijstelling midden onder de boog (|z - as| < zoneDz) naar 'overig' zet; een deel van 'overig', alleen info   // cr: per knoop aantal, som y, som z van het kruispunt met het wielkastvlak, kleinste en grootste z (alleen info)
  if (opt && opt.zone && any) {
    const pm = new THREE.ShaderMaterial({ vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }', fragmentShader: 'varying vec3 vW; void main(){ gl_FragColor = vec4(vW, 1.0); }', side: THREE.DoubleSide });
    L.MESHES.forEach(m => { m.material = pm; });
    const rtf = new THREE.WebGLRenderTarget(W, H, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat, type: THREE.FloatType, depthBuffer: true });
    renderer.setClearColor(0x000000, 1); renderer.setRenderTarget(rtf); renderer.clear(); renderer.render(scene, camera);
    const fb = new Float32Array(W * H * 4); renderer.readRenderTargetPixels(rtf, 0, 0, W, H, fb); renderer.setRenderTarget(null); rtf.dispose(); pm.dispose();
    const cp = camera.position, sg = Math.sign(cp.x), vlak = sg * 0.5, kant = Math.abs(cp.x) > 0.6;
    for (let y = 0; y < H; y++) { const ro = (H - 1 - y) * W * 4; for (let x = 0; x < W; x++) { const i = y * W + x; if (!gevlagd[i] || !op1[i]) continue;
      const k = ro + x * 4, wx = fb[k], wy = fb[k + 1]; let z = 3;
      if (kant && sg * wx < 0.5) { const t = (vlak - cp.x) / (wx - cp.x), yc = cp.y + t * (wy - cp.y), zc = cp.z + t * (fb[k + 2] - cp.z); const Y = opt.zoneY, Z = opt.zoneZ;
        if (zc >= Z[0] && zc <= Z[1] && yc >= Y[0] && yc < Y[3]) { z = yc < Y[1] ? 0 : (yc < Y[2] ? 1 : 2); if (z === 0 && Math.abs(zc - opt.zoneAx) < opt.zoneDz) { z = 3; if (opt.midden) midden[lab[ids[i]]]++; } }   // onder de boog tellen alleen de uiteinden (|z - as| >= dEnd): midden ligt de aandrijfas op naafhoogte vrij door de wand
        const q = lab[ids[i]] * 5; cr[q]++; cr[q + 1] += yc; cr[q + 2] += zc; cr[q + 3] = cr[q] === 1 ? zc : Math.min(cr[q + 3], zc); cr[q + 4] = cr[q] === 1 ? zc : Math.max(cr[q + 4], zc); }
      else if (kant && wy >= opt.zoneY[0] && wy < opt.zoneY[1] && fb[k + 2] >= opt.zoneZ[0] && fb[k + 2] <= opt.zoneZ[1] && Math.abs(fb[k + 2] - opt.zoneAx) >= opt.zoneDz) z = 0;
      else if (opt.midden && kant && wy >= opt.zoneY[0] && wy < opt.zoneY[1] && fb[k + 2] >= opt.zoneZ[0] && fb[k + 2] <= opt.zoneZ[1]) midden[lab[ids[i]]]++;   // idem in de wielkastruimte zelf, midden onder de boog (z blijft 'overig')   // het punt zelf ligt in de wielkastruimte (|x| >= 0,50) en laag, zoals de vloermat en de dorpelbekleding achter de band: onder de boog
      zone[lab[ids[i]] * 4 + z]++; } }
  }
  herstel();
  const knopen = [];
  for (let l = 1; l <= n; l++) if (cnt[l] > 0) knopen.push({ naam: labList[l - 1].naam, klasse: labList[l - 1].klasse, voor: labList[l - 1].zs.reduce((a, b) => a + b, 0) / labList[l - 1].zs.length > 0.6, px: cnt[l], g: gcnt[l], dun: dun[l], mid: mid[l], vb: [vx[l], vy[l]], box: [x0[l], y0[l], x1[l], y1[l]], sch: sch[l], midden: midden[l], zone: [zone[l * 4], zone[l * 4 + 1], zone[l * 4 + 2], zone[l * 4 + 3]], kruis: cr[l * 5] ? [cr[l * 5], cr[l * 5 + 1] / cr[l * 5], cr[l * 5 + 2] / cr[l * 5], cr[l * 5 + 3], cr[l * 5 + 4]] : null });
  knopen.sort((p, q) => q.px - p.px);
  // beeld: kleur per klasse; gevlagd = magenta (motorruimte) of oranje (onderstel)
  let url = null;
  if (opt && opt.png) {
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), im = g.createImageData(W, H);
    const KC = [[0, 0, 0], [205, 208, 212], [120, 124, 130], [196, 170, 120], [70, 90, 120], [255, 0, 200], [255, 140, 0], [60, 200, 90], [230, 60, 60]];   // laatste: scharnier en portierrand (alleen wielkastcamera's)
    for (let i = 0; i < W * H; i++) { const k = kl[i], c3 = KC[ids[i] > 0 && ids[i] <= labels.length ? k : 0]; im.data[4 * i] = c3[0]; im.data[4 * i + 1] = c3[1]; im.data[4 * i + 2] = c3[2]; im.data[4 * i + 3] = 255; }
    g.putImageData(im, 0, 0); url = c.toDataURL('image/png');
  }
  return { W, H, tot: Object.fromEntries(KLN.map((k, i) => [k, tot[i]])), knopen, url, mask: maskB64, roi, roiGevonden };
}"""

# ---------------------------------------------------------------- geometrie (in de pagina)
GEO_JS = r"""() => {
  const L = window.__model; L.batching(false); L.finishAll(); L.ROOT.obj.updateMatrixWorld(true);
  const v = new THREE.Vector3(), n = new THREE.Vector3(), nm = new THREE.Matrix3(), ang = (p, q) => Math.acos(Math.max(-1, Math.min(1, p[0] * q[0] + p[1] * q[1] + p[2] * q[2]))) * 180 / Math.PI;
  const wereld = (m) => { const G = m.geometry, P = G.attributes.position, N = G.attributes.normal; nm.getNormalMatrix(m.matrixWorld); const W = [], WN = [];
    for (let i = 0; i < P.count; i++) { v.set(P.getX(i), P.getY(i), P.getZ(i)).applyMatrix4(m.matrixWorld); W.push(v.toArray()); if (N) { n.set(N.getX(i), N.getY(i), N.getZ(i)).applyMatrix3(nm).normalize(); WN.push(n.toArray()); } }
    return { W, WN, ix: G.index, nt: (G.index ? G.index.count : P.count) / 3 }; };
  const by = {}; for (const m of L.MESHES) { const nd = m.userData.node, p = []; let q = nd; while (q && q.parent) { p.unshift(q.name); q = q.parent; } (by[nd.name] = by[nd.name] || []).push({ m, path: p }); }
  const out = { afdek: [1e9, -1e9], hoek: [1e9, -1e9], bumper: 0, bumperAt: null, facet: 0, facetAt: null, bumperTop: 0, lipOnder: null, kapVoorrand: null, kapVoorrandMax: null, paneelY: null, tri: 0, dev30: { n: 0, mm2: 0 } };
  const inReg = (P1) => P1[1] > 0.50 && P1[2] > 1.45 && P1[2] < 1.70;
  for (const m of L.MESHES) out.tri += (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) / 3;
  for (const nm0 of ['Afdekglas', 'Hoekkap']) for (const { m } of (by[nm0] || [])) { const { W } = wereld(m); const t = nm0 === 'Afdekglas' ? out.afdek : out.hoek; for (const w of W) { if (w[0] < 0) continue; t[0] = Math.min(t[0], w[1]); t[1] = Math.max(t[1], w[1]); } }
  // bumperschouder: hoek tussen de normalen aan de uiteinden van een driehoeksrand (bepaling ronde 1) en tussen de vlaknormalen van twee driehoeken aan een rand (facet)
  const S = (by['Bumperschaal voor'] || [])[0];
  let shell = null;
  const pk = P => Math.round(P[0] * 1e4) + ',' + Math.round(P[1] * 1e4) + ',' + Math.round(P[2] * 1e4);
  if (S) {
    const { W, WN, ix, nt } = shell = wereld(S.m), I = t => (ix ? ix.getX(t) : t), edges = new Map(), fn = [];
    for (let t = 0; t < nt; t++) {
      const a = I(3 * t), b = I(3 * t + 1), c = I(3 * t + 2);
      const e1 = [W[b][0] - W[a][0], W[b][1] - W[a][1], W[b][2] - W[a][2]], e2 = [W[c][0] - W[a][0], W[c][1] - W[a][1], W[c][2] - W[a][2]];
      const cr = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]], l = Math.hypot(...cr) || 1; fn.push([cr[0] / l, cr[1] / l, cr[2] / l, l]);
      if (inReg(W[a]) && inReg(W[b]) && inReg(W[c])) {   // afwerking d: driehoeken waarvan het vlak meer dan 30 graden afwijkt van de gemiddelde hoekpuntnormaal (plooien in de glans)
        const avg = [0, 1, 2].map(k => WN[a][k] + WN[b][k] + WN[c][k]), al = Math.hypot(...avg) || 1, d0 = ang(fn[t], avg.map(x => x / al)), dd = Math.min(d0, 180 - d0);
        if (dd > 30) { out.dev30.n++; out.dev30.mm2 += l / 2 * 1e6; }
      }
      for (const [p, q] of [[a, b], [b, c], [c, a]]) {
        const P1 = W[p], P2 = W[q]; if (!(inReg(P1) && inReg(P2))) continue;
        const d = ang(WN[p], WN[q]); if (d > out.bumper) { out.bumper = d; out.bumperAt = [+((P1[0] + P2[0]) / 2).toFixed(3), +((P1[1] + P2[1]) / 2).toFixed(3), +((P1[2] + P2[2]) / 2).toFixed(3)]; }
        const k1 = pk(P1), k2 = pk(P2), key = k1 < k2 ? k1 + '|' + k2 : k2 + '|' + k1; if (edges.has(key)) edges.get(key).push(t); else edges.set(key, [t]);
      }
    }
    for (const [key, ts] of edges) if (ts.length === 2 && fn[ts[0]][3] > 1e-9 && fn[ts[1]][3] > 1e-9) {
      let d = ang(fn[ts[0]], fn[ts[1]]); d = Math.min(d, 180 - d); if (d > out.facet) { const [p, q] = key.split('|').map(s => s.split(',').map(Number)); out.facet = d; out.facetAt = [+((p[0] + q[0]) / 2e4).toFixed(3), +((p[1] + q[1]) / 2e4).toFixed(3), +((p[2] + q[2]) / 2e4).toFixed(3)]; }
    }
    for (const w of W) if (w[0] > -0.01 && w[0] < 0.01 && w[2] > 1.7) out.bumperTop = Math.max(out.bumperTop, w[1]);
  }
  // lip: onderrand op de hartlijn; aansluiting op de schaal: voor elk lipbeeldpunt dat binnen 8 mm van het schaaloppervlak ligt (de aansluitrand) de afstand tot dat oppervlak en de hoek tussen
  // de lipnormaal en de (geinterpoleerde) schaalnormaal op het dichtstbijzijnde punt; verder de grootste normaalsprong tussen aangrenzende lipbeeldpunten (randen > 2 mm, z >= 1,50: de uitloop van de lip bij z 1,425 telt niet mee), met plaats
  const LP = (by['Bumperlip voor'] || [])[0];
  if (LP && shell) {
    const lw = wereld(LP.m); let lo = 9; for (const w of lw.W) if (Math.abs(w[0]) < 0.05 && w[2] > 1.7) lo = Math.min(lo, w[1]); out.lipOnder = lo;
    const sI = shell.ix, snt = shell.nt, sIx = t => (sI ? sI.getX(t) : t), tri = new THREE.Triangle(), tgt = new THREE.Vector3(), bc = new THREE.Vector3(), pt = new THREE.Vector3();
    const tv = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
    let dmax = 0, hmax = 0, hsom = 0, hn = 0, at = null;
    const top = new Map(); for (let i = 0; i < lw.W.length; i++) { const P1 = lw.W[i]; const key = Math.round(P1[0] * 1000) + '_' + Math.round(P1[2] * 1000); if (!top.has(key) || lw.W[top.get(key)][1] < P1[1]) top.set(key, i); }   // bovenrand van de lip: hoogste punt per (x, z)
    for (const i of top.values()) {
      const P1 = lw.W[i]; if (P1[0] < 0 || P1[2] < 1.50) continue; pt.set(P1[0], P1[1], P1[2]);
      let best = 1e9, bt = -1, bb = null;
      for (let t = 0; t < snt; t++) {
        const ia = sIx(3 * t), ib = sIx(3 * t + 1), ic = sIx(3 * t + 2), A = shell.W[ia];
        if (Math.abs(A[2] - P1[2]) > 0.08 || Math.abs(A[0] - P1[0]) > 0.15) continue;
        tri.a.set(...shell.W[ia]); tri.b.set(...shell.W[ib]); tri.c.set(...shell.W[ic]); tri.closestPointToPoint(pt, tgt); const d = tgt.distanceTo(pt);
        if (d < best) { best = d; bt = t; if (THREE.Triangle.getBarycoord(tgt, tri.a, tri.b, tri.c, bc)) bb = [bc.x, bc.y, bc.z]; else bb = [1, 0, 0]; }
      }
      if (bt < 0 || best > 0.015) continue;
      const ia = sIx(3 * bt), ib = sIx(3 * bt + 1), ic = sIx(3 * bt + 2), sn = [0, 1, 2].map(k => bb[0] * shell.WN[ia][k] + bb[1] * shell.WN[ib][k] + bb[2] * shell.WN[ic][k]);
      const h = ang(lw.WN[i], sn); hn++; hsom += h; dmax = Math.max(dmax, best); if (h > hmax) { hmax = h; at = [+P1[0].toFixed(3), +P1[1].toFixed(3), +P1[2].toFixed(3)]; }
    }
    out.lipNaad = { n: hn, afstand_mm_max: +(dmax * 1000).toFixed(2), hoek_max: +hmax.toFixed(1), hoek_gem: hn ? +(hsom / hn).toFixed(1) : null, hoek_at: at };
    const ix = LP.m.geometry.index, nt = (ix ? ix.count : lw.W.length) / 3, I = t => (ix ? ix.getX(t) : t); let sm = 0, sat = null;
    for (let t = 0; t < nt; t++) for (const [p, q] of [[I(3 * t), I(3 * t + 1)], [I(3 * t + 1), I(3 * t + 2)], [I(3 * t + 2), I(3 * t)]]) {
      const P1 = lw.W[p], P2 = lw.W[q]; if (P1[0] < 0 || P2[0] < 0 || P1[2] < 1.50 || P2[2] < 1.50) continue;
      if (Math.hypot(P1[0] - P2[0], P1[1] - P2[1], P1[2] - P2[2]) < 0.002) continue;
      const d = ang(lw.WN[p], lw.WN[q]); if (d > sm) { sm = d; sat = [+((P1[0] + P2[0]) / 2).toFixed(3), +((P1[1] + P2[1]) / 2).toFixed(3), +((P1[2] + P2[2]) / 2).toFixed(3)]; }
    }
    out.lipSprong = { hoek_max: +sm.toFixed(1), at: sat };
  }
  // onderplaat: laagste punt op de hartlijn (voor de verhouding bumper/lamp: het laagste zichtbare voordeel) en nabijheid van aandrijfas, koppeling en draagarm (hoekpunten binnen 10 mm van de plaat)
  const OP = (by['Onderplaat voorbumper'] || [])[0];
  if (OP) {
    const ow = wereld(OP.m); let lo = 9; for (const w of ow.W) if (Math.abs(w[0]) < 0.6 && w[2] > 1.6) lo = Math.min(lo, w[1]); out.plaatOnder = lo;   // voorste deel binnen de wielbogen (|x| < 0,6): het laagste punt van het voorschort
    let bb = new THREE.Box3(); for (const w of ow.W) bb.expandByPoint(v.set(...w)); bb.expandByScalar(0.012);
    const oix = OP.m.geometry.index, ont = (oix ? oix.count : ow.W.length) / 3, oI = t => (oix ? oix.getX(t) : t), tri2 = new THREE.Triangle(), tg2 = new THREE.Vector3(), pt2 = new THREE.Vector3();
    const tris = []; for (let t = 0; t < ont; t++) { const a = ow.W[oI(3 * t)], b = ow.W[oI(3 * t + 1)], c = ow.W[oI(3 * t + 2)]; tris.push([new THREE.Vector3(...a), new THREE.Vector3(...b), new THREE.Vector3(...c)]); }
    const treffers = {}; let nbij = 0;
    for (const m of L.MESHES) { const nn = m.userData.node.name; if (!/Klemmen|Hoes|Koppelingsklok|Draagarm/.test(nn)) continue; const { W } = wereld(m);
      for (const w of W) { pt2.set(...w); if (!bb.containsPoint(pt2)) continue; let best = 1e9; for (const T of tris) { tri2.a.copy(T[0]); tri2.b.copy(T[1]); tri2.c.copy(T[2]); tri2.closestPointToPoint(pt2, tg2); best = Math.min(best, tg2.distanceTo(pt2)); if (best < 0.01) break; }
        if (best < 0.01) { treffers[nn] = (treffers[nn] || 0) + 1; nbij++; } } }
    out.plaatNabij = { n: nbij, per_knoop: treffers };
  }
  // wielkastbekleding (adv.nodig 2, bewaking): hoekpunten van onderstel, aandrijving en wiel binnen 5 mm van Wielkast voor links (golf 2: de wand doorboorde aandrijfas, stuurstangen en draagarmen)
  const WK = (by['Wielkast voor links'] || [])[0];
  if (WK) {
    const ww = wereld(WK.m); const bb = new THREE.Box3(); for (const w of ww.W) bb.expandByPoint(v.set(...w)); bb.expandByScalar(0.006);
    const wix = WK.m.geometry.index, wnt = (wix ? wix.count : ww.W.length) / 3, wI = t => (wix ? wix.getX(t) : t), tr = new THREE.Triangle(), tg = new THREE.Vector3(), pq = new THREE.Vector3(), tris = [];
    for (let t = 0; t < wnt; t++) tris.push([new THREE.Vector3(...ww.W[wI(3 * t)]), new THREE.Vector3(...ww.W[wI(3 * t + 1)]), new THREE.Vector3(...ww.W[wI(3 * t + 2)])]);
    const tf = {}; let n = 0;
    for (const m of L.MESHES) { const pth = []; let q = m.userData.node; while (q && q.parent) { pth.unshift(q.name); q = q.parent; } if (!['Onderstel', 'Aandrijflijn', 'Uitlaatsysteem'].includes(pth[0]) || pth.some(nm => /^Remleidingen/.test(nm))) continue;   // remleidingen en slangbeugels zitten bewust aan de wand vast
      const g = m.geometry; if (!g.boundingBox) g.computeBoundingBox(); if (!g.boundingBox.clone().applyMatrix4(m.matrixWorld).intersectsBox(bb)) continue;
      const { W } = wereld(m); for (const w of W) { pq.set(...w); if (!bb.containsPoint(pq)) continue; let best = 1e9; for (const T of tris) { tr.a.copy(T[0]); tr.b.copy(T[1]); tr.c.copy(T[2]); tr.closestPointToPoint(pq, tg); best = Math.min(best, tg.distanceTo(pq)); if (best < 0.005) break; }
        if (best < 0.005) { tf[pth.slice(-2).join('/')] = (tf[pth.slice(-2).join('/')] || 0) + 1; n++; } } }
    out.wielkastNabij = { n, per_knoop: tf };
  }
  const KP = (by['Buitenpaneel motorkap'] || [])[0];
  if (KP) { const { W } = wereld(KP.m); let hi = -9, zf = -9, yf = 0; for (const w of W) { if (Math.abs(w[0]) < 0.02) hi = Math.max(hi, w[1]); if (Math.abs(w[0]) < 0.02 && w[2] > zf) { zf = w[2]; yf = w[1]; } } out.kapVoorrandMax = hi; out.kapVoorrand = [zf, yf]; }
  const VP = (by['Voorpaneel'] || [])[0];
  if (VP) { const { W } = wereld(VP.m); let lo = 9, hi = -9; for (const w of W) if (Math.abs(w[0]) < 0.3) { lo = Math.min(lo, w[1]); hi = Math.max(hi, w[1]); } out.paneelY = [lo, hi]; }
  return out;
}"""

HIDE_UI = "(()=>{const st=document.createElement('style');st.textContent='body *:not(canvas){visibility:hidden !important} canvas{visibility:visible !important}';document.head.appendChild(st);})()"
SETCAM = "([p,t,oy,nf])=>{camera.position.set(...p);controls.target.set(...t);controls.update();camera.lookAt(...t);if(nf){const d=camera.position.distanceTo(controls.target);camera.near=Math.min(0.08,Math.max(0.004,d/250));camera.far=Math.max(80,d*30);}camera.updateMatrixWorld(true);if(oy){camera.setViewOffset(1000,738,0,oy,1000,738);}else{camera.clearViewOffset();}camera.updateProjectionMatrix();}"
HELDER_NAMEN = ['Embleem', 'Honingraatgrille']
ASSEMBLED_JS = "()=>({p:camera.position.toArray(),t:controls.target.toArray()})"

# ---------------------------------------------------------------- poorten
SCHARNIER_MAX_PX = 50     # punt 3: scharnier en portierrand achter de band
VENSTER_TOT_MAX = 2500   # tussenpoort tegenover V1: totaal px door het venster per wielkastcamera
KAP_MAX_PX = 50        # eis uit het advies: geen knoop uit de motorruimte (of het onderstel, in de hoekcamera's) boven 50 beeldpunten bij DPR 2
SCHOUDER_MAX = 25.0    # graden, bepaling ronde 1
EMBLEEM_MAX = 2.0      # helderheid embleem / gaas (premortem: 5,5 tot 5,7 op HEAD a9035fc, F1: 1,0)
PLAAT_MAX = 3.0        # Onderplaat voorbumper in eig: hoogstens zoveel keer het aantal beeldpunten van Honingraatgrille (a9035fc: 4,56). De eis van het advies, 0,25, is niet te combineren met zicht onder de bumper hoogstens 0,5 procent: zie beslissing 21
VERH_AFSCH_MAX = 3.1   # verhouding bumper/lamp tot de onderrand van de afscherming (bewaking)
SCHERM_DIEP_MAX_MM = 55  # afscherming hoogstens zoveel mm onder de liponderrand
FACET_MAX = 25.0       # graden tussen de vlaknormalen van aangrenzende driehoeken van Bumperschaal voor in het hoekgebied (premortem: 59,6)
NAADSTROOK_MAX_PX = 50   # afwerking c (voorstel)
SPLEET_MAX_PX = 200       # afwerking a: Bumperbalk voor in de hoekspleet (voorstel; HEAD 5.646)
SIKKEL_MAX_PX = 50        # adv.nodig 2: Schutbord door de wielboog in eig (HEAD 698)
EMBLEEM_MIN_LAAG = 0.9    # afwerking e: embleem in de lage blik minstens zo helder als het gaas (voorstel; foto F1: 1,0)
DEV30_MAX_N, DEV30_MAX_MM2 = 12, 319   # afwerking d: driehoeken met een afwijking > 30 graden tussen vlak- en hoekpuntnormaal (stand voor ronde 2: 12 driehoeken, 319 mm2; HEAD: 22, 990)
# Verwacht aantal poorten in volle modus (zonder --cams, --geen-geo en --geen-rondgang). Bron: nulmeting van 17 oktober 2026 op d044bae (run-v9eG): 112 poorten, waarvan 99 harde en 13 zachte.
# Wie bewust een poort toevoegt of schrapt, past deze twee getallen mee aan (en docs/cijfers.md). De controle zelf ('aantal poorten') telt niet mee in de 99.
VERWACHT_HARD = 99
VERWACHT_ZACHT = 13
ONDERZICHT_MAX_PCT = 0.5   # motorruimte en onderstel van de voorste helft hoogstens 0,5 procent van het beeld in de lage camera's (HEAD eig 1,6; V1: zie nul/README)


def naadstrook(mask, namen, beeld=None, uit=None):
    # afwerking c: beeldpunten van Onderplaat voorbumper die binnen 2 beeldpunten zowel Bumperschaal voor als Bumperlip voor raken: de onderplaat schemert door een spleet tussen schaal en lip (dunne donkere lijn over het bumpervlak)
    sch, lip, pl = (mask == namen.index(n) + 1 for n in ('Bumperschaal voor', 'Bumperlip voor', 'Onderplaat voorbumper'))
    def dil(x, r=2):
        o = x.copy()
        for dy in range(-r, r + 1):
            for dx in range(-r, r + 1):
                o[max(dy, 0):x.shape[0] + min(dy, 0), max(dx, 0):x.shape[1] + min(dx, 0)] |= x[max(-dy, 0):x.shape[0] + min(-dy, 0), max(-dx, 0):x.shape[1] + min(-dx, 0)]
        return o
    st = pl & dil(sch) & dil(lip)
    if beeld is not None and uit:   # controlebeeld: de strook in geel over de opname
        im = np.asarray(Image.open(beeld).convert('RGB')).copy(); d = dil(st, 3); im[d] = (255, 255, 0); Image.fromarray(im).save(uit)
    return int(st.sum())


def wk_slecht(e, alleen_zone=False):
    """gevlagde knopen van een wielkastcamera of rondgangcamera boven de grens: [(smalle+brede px, knoop, klasse, zone met de meeste px)], grootste eerst.
    alleen_zone: tel alleen beeldpunten waarvan de blik door de wielkast gaat (zone onder, venster of boven; niet 'overig': onder de auto door, van voren of achteren, of een knoop in de wielkastruimte zelf)"""
    uit = []
    for n in e['gevlagd']:
        zp = n.get('zone_px') or {}
        px = sum(zp.get(q, 0) for q in ZONE_NAMEN[:3]) if alleen_zone else n['breed_px'] + n['smal_px']
        if px > KAP_MAX_PX:
            z = max(ZONE_NAMEN, key=lambda q: zp.get(q, 0)) if zp else 'overig'
            uit.append((px, n['knoop'], n['klasse'], z))
    return sorted(uit, reverse=True)


def wk_zone_hits(e, zone):
    """knopen die in een zone (onder, venster, boven) boven de grens komen: smalle+brede px van de beeldpunten in die zone"""
    return sorted([(n['zone_px'][zone], n['knoop'], n['klasse']) for n in e['gevlagd'] if n.get('zone_px', {}).get(zone, 0) > KAP_MAX_PX], reverse=True)


def stabiel(pg, path):
    prev = None
    for _ in range(10):
        pg.screenshot(path=path)
        im = np.asarray(Image.open(path).convert('RGB')).astype(float) / 255
        if prev is not None and prev.shape == im.shape and float(np.abs(prev - im).mean()) < 0.0005:
            return
        prev = im; pg.wait_for_timeout(500)


def git_info():
    try:
        h = subprocess.run(['git', '-C', a.root, 'rev-parse', '--short', 'HEAD'], capture_output=True, text=True).stdout.strip()
        d = subprocess.run(['git', '-C', a.root, 'status', '--short', '--', 'src'], capture_output=True, text=True).stdout.strip()
        return h or None, bool(d)
    except Exception:
        return None, None


# Verwacht aantal poorten in volle achtermodus (--achter zonder --cams en --geen-rondgang). Bron: nulmeting van 18 oktober 2026 op fa5c619 (open punt AWK, stage S1): de 21 poorten van
# front-ronde4/v2/meet_achter.py. Wie bewust een poort toevoegt of schrapt, past deze twee getallen mee aan. De extra controles ('interessegebied achterwielen in beeld', 'aantal poorten achter') tellen niet mee.
VERWACHT_HARD_ACHTER = 21
VERWACHT_ZACHT_ACHTER = 0


def poorten_achter(res, namen, poort):
    """poorten van de achtermodus (open punt AWK): de doorkijk door de achterwielkasten naar de cabine (achterbank, bagagebekleding, vloer, zijbekleding).
    Geeft terug of de modus vol is (zonder --cams en --geen-rondgang). In volle modus bestaat elke poort altijd: ontbreekt zijn invoer (geen camera van die kant, of het
    interessegebied valt weg doordat een knoop hernoemd is), dan staat hij rood met 'invoer ontbreekt: ...' in plaats van te verdwijnen of stil groen te zijn."""
    vol = not (a.cams or a.geen_rondgang)
    zz = f'z {ZONE_Z_ACHTER[0]} tot {ZONE_Z_ACHTER[1]}'
    rg = [k for k in namen if res['cams'][k]['soort'] == 'rondgang']
    def kant_cams(ks, kant): return [k for k in ks if res['cams'][k]['kant'] in (kant, 'midden')]
    def leeg(naam, eis, wat):
        if vol: poort(naam, False, f'invoer ontbreekt: {wat}', eis)
    # de zones per kant over de rondgang (zoals de voormodus over wielkast- en rondgangcamera's; achter alleen de rondgang, zodat deze poorten gelijk blijven aan meet_achter.py)
    ZP = (('venster', 'wielkast venster boven de band', f'geen motorruimte- of cabineknoop boven {KAP_MAX_PX} px breed door het venster boven de achterband; de blik passeert het wielkastvlak |x| 0,50 op y {ZONE_Y[1]} tot {ZONE_Y[2]} en {zz}'),
          ('onder', 'wielkast gat onder de boog', f'geen motorruimte- of cabineknoop boven {KAP_MAX_PX} px breed door het gat onderin de achterboog (zijbekleding achter, achterbank, vloer); de blik passeert het wielkastvlak |x| 0,50 op y {ZONE_Y[0]} tot {ZONE_Y[1]} en {zz} (daaronder kijk je onder de auto door; midden onder de boog, |z - ({AXR_ACHTER})| < {ZONE_DEND}, telt hier niet)'),
          ('boven', 'wielkast opening boven het venster', f'geen motorruimte- of cabineknoop boven {KAP_MAX_PX} px breed door een opening bovenin de achterboog: wielkastvlak |x| 0,50 gepasseerd op y {ZONE_Y[2]} tot {ZONE_Y[3]} en {zz}'))
    for kant in ('links', 'rechts'):
        ks = kant_cams(rg, kant)
        for zn, naam, eis in ZP:
            nm = f'{naam} achter {kant}'
            if not ks: leeg(nm, eis, f"rondgangcamera's {kant}"); continue
            hits = sorted([(px, kn, kl, k) for k in ks for px, kn, kl in wk_zone_hits(res['cams'][k], zn)], reverse=True)
            cams_rood = sorted({h[3] for h in hits})
            poort(nm, not hits, f'ok ({len(ks)} camera\'s)' if not hits else f"{len(cams_rood)} van {len(ks)} camera's rood: " + '; '.join(f'{k}: {kn} ({kl}) {px}' for px, kn, kl, k in hits[:6]) + (f' (+{len(hits) - 6} meer)' if len(hits) > 6 else ''), eis)
    # tussenpoort: hetzelfde getal als voor (2.500 px door het venster per camera); de ijking (V1 9578e6f) gold de voorwielkast, achter is dit getal niet apart geijkt
    for kant in ('links', 'rechts'):
        ks = kant_cams(rg, kant)
        nm, eis = f'wielkast venster tegenover V1 achter {kant}', f'tussenpoort: hoogstens {VENSTER_TOT_MAX} px motorruimte- of cabinebeeld door het venster boven de achterband per camera (getal uit de voormeting, V1 9578e6f; achter niet apart geijkt). De poort wielkast venster boven de band achter (50 px per knoop) is de eis en is strenger'
        if not ks: leeg(nm, eis, f"rondgangcamera's {kant}"); continue
        tot = sorted([(sum(n['zone_px']['venster'] for n in res['cams'][k]['gevlagd']), k) for k in ks], reverse=True)
        rood = [t for t in tot if t[0] > VENSTER_TOT_MAX]
        poort(nm, not rood, f"ok (grootste {tot[0][0]} px in {tot[0][1]})" if not rood else f"{len(rood)} van {len(ks)} camera's boven {VENSTER_TOT_MAX} px: " + '; '.join(f'{k} {px}' for px, k in rood[:6]), eis)
    # rondgang per hoogte, afstand en kant
    if rg or vol:
        for h in RONDGANG_H:
            for r in RONDGANG_R:
                for kant in ('links', 'rechts'):
                    ks = [k for k in kant_cams(rg, kant) if res['cams'][k]['h'] == h and res['cams'][k]['r'] == r]
                    nm = f'wielkast rondgang h{h} r{r} achter {kant}'
                    eis = (f'lage rondgang op {h} m hoogte en {r} m van het doel (baanm en baanv, om de 10 graden): geen motorruimte- of cabineknoop boven {KAP_MAX_PX} px breed (smalle en brede beeldpunten) waar de blik door de achterwielkast gaat '
                           f'(zone onder, venster of boven: camera naast de auto, wielkastvlak |x| 0,50 gepasseerd op y {ZONE_Y[0]} tot {ZONE_Y[3]} en {zz}; onder de auto door telt niet). Remhardware in de wielkast (ook Remleiding achter en Remslang achter) telt niet')
                    if not ks and vol: leeg(nm, eis, f"rondgangcamera's h{h} r{r} {kant}"); continue
                    rood = [(k, wk_slecht(res['cams'][k], True)) for k in ks]; rood = [(k, sl) for k, sl in rood if sl]
                    poort(nm, not rood, f"ok ({len(ks)} camera's)" if not rood else f"{len(rood)} van {len(ks)} camera's rood: " + '; '.join(f'{k}: {sl[0][1]} ({sl[0][2]}, {sl[0][3]}) {sl[0][0]}' for k, sl in sorted(rood, key=lambda t: -t[1][0][0])[:5]), eis)
    # extra controle (volle modus): het interessegebied rond de achterwielen bestaat; zonder omkadering telt geen enkel beeldpunt en zou elke poort hierboven stil groen zijn
    if vol:
        gev = [0, 0]
        for k in rg:
            rv = res['cams'][k].get('roi_gevonden') or []
            if len(rv) == 2: gev[0] += bool(rv[0]); gev[1] += bool(rv[1])
        wka = [k for k in namen if res['cams'][k]['soort'] == 'wielkast']
        zonder = [k for k in wka if not any(res['cams'][k].get('roi_gevonden') or [])]
        poort('interessegebied achterwielen in beeld', gev[0] > 0 and gev[1] > 0 and not zonder,
              f"rondgang: achterwiel links in {gev[0]}, rechts in {gev[1]} van {len(rg)} camera's" + (f"; wielkastcamera's achter zonder interessegebied: {', '.join(zonder)}" if zonder else (f"; wielkastcamera's achter: alle {len(wka)} met interessegebied" if wka else '')),
              "minstens een rondgangcamera met het linker- en een met het rechterachterwiel in beeld (ROI_WIEL_L_ACHTER, ROI_WIEL_R_ACHTER), en elke wielkastcamera achter met interessegebied; anders is de knoopnaam weg en telt de meting niets", extra=True)
    return vol


def main():
    gpu = (not a.sw) and platform.system() == 'Darwin'
    if gpu:
        harness.ARGS = ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist']
    if not a.uit:
        a.uit = tempfile.mkdtemp(prefix='meet-uit-'); print('uitvoermap (tijdelijk):', a.uit)
    os.makedirs(a.uit, exist_ok=True)
    cams = cam_lijst_achter() if a.achter else cam_lijst()
    groepen = {'rondgang': [k for k, c in cams.items() if c['soort'] == 'rondgang'], 'wielkast': [k for k, c in cams.items() if c['soort'] == 'wielkast']}   # --cams rondgang,wielkast,eig
    namen = [x for k in a.cams.split(',') for x in (groepen[k] if k in groepen else [k])] if a.cams else list(cams)
    if not a.cams and 'assembled' in cams: namen.remove('assembled')   # de kale beginstand is een uitgebreide camera: alleen op verzoek (--cams assembled)
    if not a.cams and a.geen_rondgang: namen = [k for k in namen if cams[k]['soort'] != 'rondgang']
    unknown = [k for k in namen if k not in cams]
    if unknown: raise SystemExit('onbekende camera: ' + ','.join(unknown))
    d = harness.build_test(tempfile.mkdtemp(prefix='meet-alto-'))
    res = {'meta': {}, 'cams': {}, 'geo': None, 'poorten': []}
    t0 = time.time()
    with harness.session(d) as s:
        if not a.geen_geo and not a.achter:   # achtermodus: geen geometrie (alle geometriepoorten gaan over de voorkant)
            pg = s.page(800, 600)
            res['geo'] = pg.evaluate(GEO_JS)
            pg.close()
        pg = s.page(VW, VH, scale=DPR)
        pg.evaluate("window.__model.setTheme('dark')"); pg.evaluate("window.__model.finishAll()"); pg.evaluate(HIDE_UI)
        pg.evaluate("window.__model.batching(false)")
        pg.wait_for_timeout(800)
        asm = pg.evaluate(ASSEMBLED_JS)
        res['meta']['assembled_camera'] = asm
        # assembled-zoom: richting van de beginstand, ingezoomd op de linkervoorhoek (en gespiegeld)
        dv = np.array(asm['p']) - np.array(asm['t']); dv = dv / np.linalg.norm(dv)
        tz = np.array([0.45, 0.62, 1.55]); pz = tz + dv * 2.1
        if 'assembled' in cams:   # niet in de achtermodus
            cams['assembled'].update(p=asm['p'], t=asm['t'])
            cams['assembled-zoom'].update(p=[round(float(x), 3) for x in pz], t=[round(float(x), 3) for x in tz])
            cams['assembled-zoom-r'].update(p=spiegel(cams['assembled-zoom']['p']), t=spiegel(cams['assembled-zoom']['t']))
        for k in namen:
            c = cams[k]
            pg.evaluate(SETCAM, [c['p'], c['t'], c.get('oy', 0), c['soort'] in ('wielkast', 'afwerking', 'rondgang')])   # nieuwe camera's: near/far zoals uiNearFar in de app (dichtbij); de camera's van ronde 2 blijven ongewijzigd, zodat de cijfers vergelijkbaar blijven
            pg.wait_for_timeout(250)
            wk = c['soort'] in ('wielkast', 'rondgang')   # wielkastcamera's en rondgang: glas zichtbaar, interessegebied rond voorwiel en voorwielkast, remhardware in de wielkast geen doorkijk, zones van de doorkijk
            opt = {'png': not a.geen_png and c['soort'] != 'rondgang', 'masks': c.get('maskers'), 'flag': c.get('flag'), 'glas': not wk,
                   'roi': (ROI_WIEL if c['soort'] == 'wielkast' else [ROI_WIEL_L, ROI_WIEL_R]) if wk else None, 'wkhw': WK_HARDWARE if wk else None, 'zone': wk, 'zoneY': ZONE_Y, 'zoneZ': ZONE_Z, 'zoneAx': 1.087, 'zoneDz': ZONE_DEND}
            if a.achter:   # de vier verschillen van meet_achter.py: interessegebied achterwielen, zone van de achterboog, as AXR, remhardware achter; plus de telling midden onder de boog (info)
                opt.update(roi=(ROI_WIEL_ACHTER if c['soort'] == 'wielkast' else [ROI_WIEL_L_ACHTER, ROI_WIEL_R_ACHTER]) if wk else None, wkhw=WK_HARDWARE_ACHTER if wk else None,
                           zoneZ=ZONE_Z_ACHTER, zoneAx=AXR_ACHTER, midden=True)
            r = pg.evaluate(IDPASS_JS, opt)
            r2 = r
            W, H = r['W'], r['H']
            tot = W * H
            KLN = ['achtergrond', 'buitenkant', 'wiel', 'wielkast', 'interieur', 'motorruimte', 'onderstel', 'overig', 'scharnier']
            fl = [KLN[i] for i in (c.get('flag') or [5, 6])]
            flagged = [n for n in r['knopen'] if n['klasse'] in fl and n['g'] > 0]
            ent = {'roi': r.get('roi'), 'zoned': bool(c.get('zoned') or c['soort'] == 'rondgang'), 'soort': c['soort'], 'kant': c['kant'], 'positie': c['p'], 'doel': c['t'], 'viewoffset_y': c.get('oy', 0), 'beeld': [W, H],
                   'klassen_px': {kk: int(v) for kk, v in r['tot'].items()},
                   'motorruimte_pct': round(100 * r['tot']['motorruimte'] / tot, 3), 'onderstel_pct': round(100 * r['tot']['onderstel'] / tot, 3),
                   'gevlagd': [{'knoop': n['naam'], 'klasse': n['klasse'], 'voor': bool(n['voor']), 'px': int(n['g']), 'dun_px': int(n['dun']), 'smal_px': int(n['mid']), 'breed_px': int(n['g'] - n['dun'] - n['mid']), 'voorbeeld_px': n['vb'], 'box': n['box'], 'zone_px': dict(zip(ZONE_NAMEN, (int(z) for z in n['zone']))), 'kruis_yz': ([round(n['kruis'][1], 3), round(n['kruis'][2], 3), round(n['kruis'][3], 3), round(n['kruis'][4], 3)] if n.get('kruis') else None)} for n in flagged],
                   'wielkast_px': int(r['tot']['wielkast']), 'px_per_knoop': {n['naam']: int(n['px']) for n in r['knopen']} if c['soort'] != 'rondgang' else {}, 'top_knopen': [{'knoop': n['naam'], 'klasse': n['klasse'], 'px': int(n['px'])} for n in r['knopen'][:12]] if c['soort'] != 'rondgang' else []}
            if wk: ent['scharnier_px'] = {n['naam']: int(n['sch']) for n in r['knopen'] if n.get('sch', 0) > 0}
            if a.achter:   # midden: beeldpunten die de vrijstelling midden onder de boog naar 'overig' zet (een deel van overig); roi_gevonden: welke omkadering van het interessegebied in beeld is
                for gv, n in zip(ent['gevlagd'], flagged): gv['zone_px']['midden'] = int(n['midden'])
                ent['roi_gevonden'] = r.get('roiGevonden')
            if c['soort'] == 'rondgang': ent.update(kant=c['kant'], r=c['r'], h=c['h'], az=c['az'], doel=c['doel'])
            mr = [n['px'] for n in ent['gevlagd'] if n['klasse'] == 'motorruimte']; os_ = [n['px'] for n in ent['gevlagd'] if n['klasse'] == 'onderstel']
            ent['onderzicht_voor_pct'] = round(100 * sum(n['px'] for n in ent['gevlagd'] if n['voor']) / tot, 3)
            ent['onderzicht_achter_pct'] = round(100 * sum(n['px'] for n in ent['gevlagd'] if not n['voor']) / tot, 3)
            ent['kier_px_breed_totaal'] = sum(n['breed_px'] + n['smal_px'] for n in ent['gevlagd']); ent['naad_px_dun_totaal'] = sum(n['dun_px'] for n in ent['gevlagd'])
            ent['motorruimte_max_knoop_px'] = max(mr) if mr else 0
            ent['interieur_max_knoop_px'] = max([n['px'] for n in ent['gevlagd'] if n['klasse'] == 'interieur'] or [0])
            ent['onderstel_max_knoop_px'] = max(os_) if os_ else 0
            if c['soort'] == 'wielkast':   # onderstel telt hier niet mee (geen poort), maar staat in de uitvoer
                ent['onderstel_info'] = [{'knoop': n['naam'], 'px': int(n['px'])} for n in r['knopen'] if n['klasse'] == 'onderstel'][:8]
            if c['soort'] == 'afwerking':
                ent['top_overig'] = [{'knoop': n['naam'], 'klasse': n['klasse'], 'px': int(n['px'])} for n in r['knopen']][:25]
            if c.get('maskers'):
                mask = np.frombuffer(base64.b64decode(r2['mask']), dtype=np.uint8).reshape(H, W)
                nstr = 'Bumperlip voor' in c['maskers']
                ent['helderheid'] = {}
                for th in ('dark', 'light'):
                    pg.evaluate(f"window.__model.setTheme('{th}')"); pg.evaluate("window.__model.batching(true)"); pg.evaluate("window.__model.batchFlush()"); pg.wait_for_timeout(700)
                    pth = f'{a.uit}/{k}-{th}.png'; stabiel(pg, pth)
                    im = np.asarray(Image.open(pth).convert('RGB')).astype(float) / 255
                    lum = 0.2126 * im[..., 0] + 0.7152 * im[..., 1] + 0.0722 * im[..., 2]
                    m = {}
                    for j, nm in enumerate(c['maskers']):
                        mk = mask == j + 1
                        if mk.shape != lum.shape: m[nm] = None; continue
                        e = mk.copy(); e[1:] &= mk[:-1]; e[:-1] &= mk[1:]; e[:, 1:] &= mk[:, :-1]; e[:, :-1] &= mk[:, 1:]   # een beeldpunt erosie: geen randbeeldpunten met antialias
                        m[nm] = (float(lum[e].mean()), int(e.sum())) if e.sum() > 20 else None
                    ent['helderheid'][th] = {nm: (None if v is None else {'lum': round(v[0], 3), 'px': v[1]}) for nm, v in m.items()}
                    if nstr and th == 'light': ent['naadstrook_px'] = naadstrook(mask, c['maskers'], pth, None if a.geen_png else f'{a.uit}/{k}-naadstrook.png')

                pg.evaluate("window.__model.setTheme('dark')"); pg.evaluate("window.__model.batching(false)"); pg.wait_for_timeout(300)
            res['cams'][k] = ent
            if r.get('url'):
                with open(f'{a.uit}/{k}-ids.png', 'wb') as f: f.write(base64.b64decode(r['url'].split(',')[1]))
            if a.shots and c['soort'] != 'rondgang':   # opnamen voor de rondgang zijn te veel (432 camera's): vraag ze per camera met --cams
                for th in ('dark', 'light'):
                    pg.evaluate(f"window.__model.setTheme('{th}')"); pg.evaluate("window.__model.batching(true)"); pg.evaluate("window.__model.batchFlush()"); pg.wait_for_timeout(700)
                    stabiel(pg, f'{a.uit}/{k}-{th}.png')
                pg.evaluate("window.__model.setTheme('dark')"); pg.evaluate("window.__model.batching(false)"); pg.wait_for_timeout(300)
            if c['soort'] == 'rondgang' and not ent['kier_px_breed_totaal']: continue   # geen regel per schone rondgangcamera
            print(f'{k:18s} breed {ent["kier_px_breed_totaal"]:6d} dun {ent["naad_px_dun_totaal"]:6d} | motorruimte {ent["motorruimte_pct"]:6.3f}% (max knoop {ent["motorruimte_max_knoop_px"]:6d} px)  onderstel {ent["onderstel_pct"]:6.3f}% (max knoop {ent["onderstel_max_knoop_px"]:6d} px) | onderzicht voor {ent["onderzicht_voor_pct"]:6.3f}%', flush=True)
        s.report()
        res['meta']['console_ok'] = not s.errors()
    h, vuil = git_info()
    res['meta'].update(root=a.root, commit=h, src_gewijzigd=vuil, dpr=DPR, viewport_css=[VW, VH], gpu=gpu, secs=round(time.time() - t0, 1), glas_verborgen='alle camera\'s behalve wielkast',
                       datum=time.strftime('%Y-%m-%d %H:%M:%S'))

    # ---- poorten
    P = res['poorten']
    def poort(naam, ok, waarde, eis, zacht=False, extra=False):
        P.append({'naam': naam, 'groen': bool(ok), 'waarde': waarde, 'eis': eis, 'zacht': bool(zacht), **({'extra': True} if extra else {})})   # extra: controle op de meting zelf, niet een van de 99 harde poorten
    def lum(e, th, nm): return (e.get('helderheid') or {}).get(th, {}).get(nm)
    g = res['geo']
    if a.achter:
        vol = poorten_achter(res, namen, poort)
    else:
        for k in namen:
            e = res['cams'][k]
            if e['soort'] == 'beeld': continue
            if e.get('helderheid'):
                for th in ('dark', 'light'):
                    em, gz = lum(e, th, 'Embleem'), lum(e, th, 'Honingraatgrille')
                    if e['soort'] == 'detail':
                        if em and gz:
                            ver = em['lum'] / max(gz['lum'], 1e-6)
                            poort(f'embleem helderheid {k} {th}', ver <= EMBLEEM_MAX, f"embleem {em['lum']} gaas {gz['lum']} verhouding {ver:.2f}", f'embleem hoogstens {EMBLEEM_MAX} keer zo helder als het gaas (foto F1: 1,0)')
                        else:
                            poort(f'embleem helderheid {k} {th}', False, 'embleem of gaas niet in beeld', 'beide in beeld')
                    if k in LUM_ONDERPLAAT:   # adv.nodig 1: de afscherming leest als schaduw, niet als grijze plank
                        op, lr = lum(e, th, 'Onderplaat voorbumper'), lum(e, th, 'Luchtrooster voor')
                        eis = 'luminantie Onderplaat voorbumper hoogstens die van Luchtrooster voor (eigen meting HEAD: 0,31 tot 0,35 tegen 0,19 tot 0,26; proef MAT.bodPillar: 0,06 tot 0,08)'
                        if lr is None: poort(f'helderheid onderplaat {k} {th}', False, 'Luchtrooster voor niet in beeld', eis)
                        elif op is None: poort(f'helderheid onderplaat {k} {th}', True, f"Onderplaat niet in beeld (minder dan 20 px na erosie), luchtrooster {lr['lum']}", eis)
                        else: poort(f'helderheid onderplaat {k} {th}', op['lum'] <= lr['lum'], f"onderplaat {op['lum']} ({op['px']} px) luchtrooster {lr['lum']} ({lr['px']} px) verhouding {op['lum'] / max(lr['lum'], 1e-6):.2f}", eis)
                    if k in LUM_EMBLEEM_LAAG:   # afwerking e: het embleem is vanuit de lage blik bijna onzichtbaar
                        eis = f'embleem {EMBLEEM_MIN_LAAG} tot {EMBLEEM_MAX} keer de helderheid van het gaas (HEAD: 0,55 tot 0,78; foto F1: 1,0)'
                        if em and gz:
                            ver = em['lum'] / max(gz['lum'], 1e-6)
                            poort(f'afwerking e: embleem leesbaar {k} {th}', EMBLEEM_MIN_LAAG <= ver <= EMBLEEM_MAX, f"embleem {em['lum']} ({em['px']} px) gaas {gz['lum']} verhouding {ver:.2f}", eis, zacht=True)
                        else:
                            poort(f'afwerking e: embleem leesbaar {k} {th}', False, 'embleem of gaas niet in beeld (minder dan 20 px na erosie)', eis, zacht=True)
            if k in NAADSTROOK_CAMS and 'naadstrook_px' in e:
                poort(f'afwerking c: spleet tussen schaal en lip {k}', e['naadstrook_px'] <= NAADSTROOK_MAX_PX, f"{e['naadstrook_px']} px Onderplaat tussen Bumperschaal en Bumperlip", f'<= {NAADSTROOK_MAX_PX} px (de lip sluit aan op de schaal, geen donkere lijn over het vlak)', zacht=True)
            if e['soort'] == 'detail': continue
            if e['soort'] == 'hoek' or k == 'voor-hoog':
                slecht = [f"{n['knoop']} {n['breed_px'] + n['smal_px']}" for n in e['gevlagd'] if n['breed_px'] + n['smal_px'] > KAP_MAX_PX]
                poort(f'kier {k}', not slecht, 'ok' if not slecht else '; '.join(slecht[:6]), f'geen knoop uit motorruimte of onderstel boven {KAP_MAX_PX} px breed (stroken van hoogstens 2 px breed tellen niet)')
            elif e['soort'] == 'wielkast':   # adv.nodig 2: geen doorkijk door de wielkast naar de motorruimte of de cabine
                slecht = wk_slecht(e, e['zoned'])
                poort(f'wielkast kier {k}', not slecht, 'ok' if not slecht else '; '.join(f'{kn} ({kl}, {z}) {px}' for px, kn, kl, z in slecht[:6]) + (f' (+{len(slecht) - 6} meer)' if len(slecht) > 6 else ''),
                      f'geen knoop uit motorruimte of cabine (interieur) boven {KAP_MAX_PX} px breed (onderstel en remhardware in de wielkast tellen niet; stroken van hoogstens 2 px breed tellen niet; Veerpoottoren en Langsligger tellen mee)' + (f'; alleen blikken door de wielkast (zone onder, venster of boven: wielkastvlak |x| 0,50 gepasseerd op y {ZONE_Y[0]} tot {ZONE_Y[3]} en z {ZONE_Z[0]} tot {ZONE_Z[1]}), niet onder de auto door' if e['zoned'] else ''))
            elif e['soort'] == 'rondgang':
                pass   # poorten per hoogte, afstand en kant hieronder
            elif e['soort'] == 'afwerking' and k.startswith('bumpL'):   # afwerking a: witte spleet (Bumperbalk) tussen lamphuis en bumpernaad op de hoek
                bb = sum(n['px'] for n in e['gevlagd'] if n['knoop'].split('/')[-1].startswith('Bumperbalk'))
                bb = bb or sum(v for kn, v in e['px_per_knoop'].items() if kn.split('/')[-1].startswith('Bumperbalk') and 'achter' not in kn)
                poort(f'afwerking a: Bumperbalk in de hoekspleet {k}', bb <= SPLEET_MAX_PX, f'{bb} px (HEAD: 5.646 px vanaf 60 cm boven de hoek)', f'<= {SPLEET_MAX_PX} px van Bumperbalk voor zichtbaar vanaf 60 cm boven de bumperhoek (een naad van 1 tot 2 px mag)', zacht=True)
            elif e['soort'] == 'afwerking':
                pass   # afwerking c: poort hierboven (naadstrook)
            else:
                poort(f'zicht onder de bumper {k}', e['onderzicht_voor_pct'] <= ONDERZICHT_MAX_PCT, f"{e['onderzicht_voor_pct']} procent van het beeld (achterkant {e['onderzicht_achter_pct']}, telt niet mee)", f'<= {ONDERZICHT_MAX_PCT} procent: motorruimte en onderstel van de voorste helft (z > 0,6)')
            if k in ('eig', 'eig-r'):   # adv.nodig 2: de donkerrode sikkel boven de band in eig is Schutbord dat door de wielboog zichtbaar is
                sk = sum(v for kn, v in e['px_per_knoop'].items() if kn.endswith('/Schutbord'))
                poort(f'sikkel Schutbord {k}', sk <= SIKKEL_MAX_PX, f'{sk} px Schutbord in beeld (HEAD: 698)', f'<= {SIKKEL_MAX_PX} px: de wielkastbekleding is zwart tot aan de boog, geen rode sikkel')
        # ronde 4, adv.nodig 2 (punt 1 en 3): doorkijk door de voorwielkast per zone van de blik, over alle wielkastcamera's en de rondgang van een camerakant (links: camera op x > 0, rechts: x < 0)
        wkc = [k for k in namen if res['cams'][k]['soort'] in ('wielkast', 'rondgang')]
        if wkc:
            ZP = (('venster', 'wielkast venster boven de band', f'geen motorruimte- of cabineknoop boven {KAP_MAX_PX} px breed door het venster tussen wand/schot (y 0,555 tot 0,574) en de veerpoottoren (y 0,62); de blik passeert het wielkastvlak |x| 0,50 op y {ZONE_Y[1]} tot {ZONE_Y[2]} en z {ZONE_Z[0]} tot {ZONE_Z[1]}'),
                  ('onder', 'wielkast gat onder de boog', f'geen motorruimte- of cabineknoop boven {KAP_MAX_PX} px breed door het gat onderin de boog (langsligger voor, vloermat en scharnier achter); de blik passeert het wielkastvlak |x| 0,50 op y {ZONE_Y[0]} tot {ZONE_Y[1]} (daaronder kijk je onder de auto door)'),
                  ('boven', 'wielkast opening boven het venster', f'geen motorruimte- of cabineknoop boven {KAP_MAX_PX} px breed door een opening op y {ZONE_Y[2]} tot {ZONE_Y[3]} (kapnaad, schermrand)'))
            for kant in ('links', 'rechts'):
                ks = [k for k in wkc if res['cams'][k]['kant'] in (kant, 'midden')]
                if not ks: continue
                for zn, naam, eis in ZP:
                    hits = [(px, kn, kl, k) for k in ks for px, kn, kl in wk_zone_hits(res['cams'][k], zn)]
                    hits.sort(reverse=True)
                    cams_rood = sorted({h[3] for h in hits})
                    poort(f'{naam} {kant}', not hits, f'ok ({len(ks)} camera\'s)' if not hits else f"{len(cams_rood)} van {len(ks)} camera's rood: " + '; '.join(f'{k}: {kn} ({kl}) {px}' for px, kn, kl, k in hits[:6]) + (f' (+{len(hits) - 6} meer)' if len(hits) > 6 else ''), eis)
            # tussenpoort tegenover V1 (9578e6f): V1 had nog twee spleten naast de ronde veerpoottoren (z 1,006 tot 1,02 en 1,155 tot 1,165) en laat daardoor in de strenge poort hierboven ook rood zien; de regressie van a28dff6 (volle breedte van het venster open) is
            # van een andere orde: V1 hoogstens 2.155 px venster per camera (grootste: wielkast-achter), HEAD 2.663 tot 5.981 in de zes wielkastcamera's van het advies
            for kant in ('links', 'rechts'):
                ks = [k for k in wkc if res['cams'][k]['kant'] in (kant, 'midden')]
                if not ks: continue
                tot = [(sum(n['zone_px']['venster'] for n in res['cams'][k]['gevlagd']), k) for k in ks]; tot.sort(reverse=True)
                rood = [t for t in tot if t[0] > VENSTER_TOT_MAX]
                poort(f'wielkast venster tegenover V1 {kant}', not rood, f"ok (grootste {tot[0][0]} px in {tot[0][1]})" if not rood else f"{len(rood)} van {len(ks)} camera's boven {VENSTER_TOT_MAX} px: " + '; '.join(f'{k} {px}' for px, k in rood[:6]),
                      f'tussenpoort: hoogstens {VENSTER_TOT_MAX} px motorruimte- of cabinebeeld door het venster per camera (V1 9578e6f hoogstens 2.155; HEAD a28dff6 tot 5.981). De poort wielkast venster boven de band hierboven (50 px per knoop) is de eis en is strenger')
            # punt 3, achter de band: het onderste portierscharnier (blad aan het portier en op de stijl) en de portierrand liggen in de wielboog (de voorrand van het portier staat op z 0,82, de boog begint op z 0,787)
            for kant in ('links', 'rechts'):
                ks = [k for k in wkc if res['cams'][k]['kant'] in (kant, 'midden') and res['cams'][k]['soort'] == 'wielkast' and res['cams'][k]['zoned']]   # de lage camera's van ronde 4 (wielkast-recht, wielkast-achter, zij-laag, wk-zij-laag, ook gespiegeld)
                if not ks: continue
                hits = sorted([(px, kn, k) for k in ks for kn, px in res['cams'][k]['scharnier_px'].items() if px > SCHARNIER_MAX_PX and kn.split('/')[-1].startswith('Scharnier')], reverse=True)
                cams_rood = sorted({h[2] for h in hits})
                poort(f'wielkast scharnier achter de band {kant}', not hits, f"ok ({len(ks)} camera's)" if not hits else f"{len(cams_rood)} van {len(ks)} camera's rood: " + '; '.join(f"{k}: {kn.split('/')[-1]} {px}" for px, kn, k in hits[:6]) + (f' (+{len(hits) - 6} meer)' if len(hits) > 6 else ''),
                      f'geen scharnierblad of scharnierbout boven {SCHARNIER_MAX_PX} px per knoop in de omkadering van voorwiel en voorwielkast (zicht op het portierscharnier door de boog achter de band; HEAD wielkast-recht: Scharnierblad carrosserie 15.520). De portierrand zelf (de voorrand van het portier staat in de boog, HEAD wielkast-recht 8.333) staat als scharnier_px in de JSON, niet als poort')
        rg = [k for k in namen if res['cams'][k]['soort'] == 'rondgang']
        if rg:
            for h in RONDGANG_H:
                for r in RONDGANG_R:
                    for kant in ('links', 'rechts'):
                        ks = [k for k in rg if res['cams'][k]['h'] == h and res['cams'][k]['r'] == r and res['cams'][k]['kant'] in (kant, 'midden')]
                        rood = [(k, wk_slecht(res['cams'][k], True)) for k in ks]; rood = [(k, sl) for k, sl in rood if sl]
                        poort(f'wielkast rondgang h{h} r{r} {kant}', not rood, f"ok ({len(ks)} camera's)" if not rood else f"{len(rood)} van {len(ks)} camera's rood: " + '; '.join(f'{k}: {sl[0][1]} ({sl[0][2]}, {sl[0][3]}) {sl[0][0]}' for k, sl in sorted(rood, key=lambda t: -t[1][0][0])[:5]),
                              f'lage rondgang op {h} m hoogte en {r} m van het doel (baanm en baanv, om de 10 graden): geen motorruimte- of cabineknoop boven {KAP_MAX_PX} px breed (smalle en brede beeldpunten) waar de blik door de wielkast gaat (zone onder, venster of boven: camera naast de auto, wielkastvlak |x| 0,50 gepasseerd op y {ZONE_Y[0]} tot {ZONE_Y[3]} en z {ZONE_Z[0]} tot {ZONE_Z[1]}; onder de auto door telt niet). Veerpoottoren en Langsligger tellen mee, remhardware in de wielkast niet')
        # Volle modus: alle camera's, de geo-meting en de rondgang. Daar moet elke harde poort bestaan: ontbreekt de invoer van een poort (hernoemde knoop, geo-meting die null of een beginwaarde geeft),
        # dan komt de poort alsnog in de lijst, rood, met 'invoer ontbreekt: <sleutel>'. In de beperkte modus blijft het oude gedrag: een poort zonder invoer wordt overgeslagen.
        vol = not (a.cams or a.geen_geo or a.geen_rondgang)
        gg = g or {}
        def heeft(sl):   # is de geo-invoer 'sl' echt gemeten? (de beginwaarden van GEO_JS tellen niet: [1e9, -1e9] voor hoek en afdek, 9 voor de laagste punten, 0 voor bumperTop)
            v = gg.get(sl)
            if sl in ('hoek', 'afdek'): return bool(v) and v[0] < 1e8 and v[1] > -1e8
            if sl in ('lipOnder', 'plaatOnder'): return v is not None and v < 9
            if sl == 'bumperTop': return bool(v) and v > 0
            if sl == 'lipNaad': return v is not None and v.get('n', 0) > 0   # n = 0: geen enkel lippunt binnen 15 mm van de schaal, dus de poorten zouden vanzelf groen zijn
            return v is not None
        def geo_poort(naam, nodig, ok, waarde, eis):
            ontbr = [sl for sl in nodig if not heeft(sl)]
            if ontbr:
                if vol: poort(naam, False, 'invoer ontbreekt: ' + ', '.join(ontbr), eis)
                return
            poort(naam, ok(), waarde(), eis)
        geo_poort('bumperschouderhoek', ['bumperAt'], lambda: gg['bumper'] <= SCHOUDER_MAX, lambda: f"{gg['bumper']:.1f} graden bij {gg['bumperAt']}", f'<= {SCHOUDER_MAX} graden (streef 20)')
        hk = lambda: ((gg['hoek'][1] - gg['afdek'][1]) * 1000, (gg['hoek'][0] - gg['afdek'][0]) * 1000)   # (boven, onder) in mm
        geo_poort('hoekkap boven hoofdlens', ['hoek', 'afdek'], lambda: hk()[0] <= 15, lambda: f'{hk()[0]:.1f} mm', '<= 15 mm')
        geo_poort('hoekkap onder hoofdlens', ['hoek', 'afdek'], lambda: hk()[1] >= -10, lambda: f'{hk()[1]:.1f} mm', '>= -10 mm')
        geo_poort('lip afstand tot schaal', ['lipNaad'], lambda: gg['lipNaad']['afstand_mm_max'] <= 3, lambda: f"{gg['lipNaad']['afstand_mm_max']} mm", '<= 3 mm')
        geo_poort('lip aansluithoek (normaal)', ['lipNaad'], lambda: gg['lipNaad']['hoek_max'] <= 30, lambda: f"max {gg['lipNaad']['hoek_max']} gem {gg['lipNaad']['hoek_gem']} graden bij {gg['lipNaad']['hoek_at']}", '<= 30 graden')
        geo_poort('lip normaalsprong langs de rand', ['lipSprong'], lambda: gg['lipSprong']['hoek_max'] <= 25, lambda: f"{gg['lipSprong']['hoek_max']} graden bij {gg['lipSprong']['at']}", '<= 25 graden')
        # de neus: lamphoogte uit de motorkap en de hoekkap, bumperhoogte op x = 0, tot de liponderrand en tot het laagste zichtbare voordeel (lip of afscherming, premortem H5)
        noem = lambda: gg['kapVoorrand'][1] - gg['afdek'][0]
        ver_lip = lambda: (gg['bumperTop'] - gg['lipOnder']) / max(1e-6, noem())
        ver_afs = lambda: (gg['bumperTop'] - min(gg['lipOnder'], gg['plaatOnder'])) / max(1e-6, noem())
        geo_poort('verhouding bumper/lamp op x=0 (tot de lip)', ['lipOnder', 'kapVoorrand', 'afdek', 'bumperTop'], lambda: ver_lip() <= 2.8, lambda: round(ver_lip(), 3), '<= 2,8 (tot de liponderrand)')
        # plaatOnder (Onderplaat voorbumper, bodyparts.js onder Voorbumper) bestaat op de huidige stand altijd: een vaste knoop zonder hideWhen of opener, ook in de luminantiepoorten en in 'onderplaat tegenover gaas in eig' verplicht.
        # Daarom is plaatOnder hier invoer van de poort zoals de rest; de oude terugval 'zonder plaat alleen de lip' (min met 9) is vervallen.
        geo_poort('verhouding bumper/lamp op x=0 (tot de afscherming)', ['lipOnder', 'plaatOnder', 'kapVoorrand', 'afdek', 'bumperTop'], lambda: ver_afs() <= VERH_AFSCH_MAX,
                  lambda: f"{ver_afs():.3f} tot {min(gg['lipOnder'], gg['plaatOnder']):.3f} m", f'<= {VERH_AFSCH_MAX} (bewaking: de afscherming mag de neus niet zwaarder maken; doel 2,8 bij beslissing 17)')
        geo_poort('afscherming onder de lip', ['lipOnder', 'plaatOnder'], lambda: (gg['lipOnder'] - gg['plaatOnder']) * 1000 <= SCHERM_DIEP_MAX_MM, lambda: f"{(gg['lipOnder'] - gg['plaatOnder']) * 1000:.0f} mm onder de liponderrand", f'<= {SCHERM_DIEP_MAX_MM} mm (een lint, geen plank)')
        if g:
            print(f"info: vlaknormaalhoek tussen aangrenzende driehoeken in het hoekgebied {g['facet']:.1f} graden bij {g['facetAt']} (meet slanke driehoeken op de neusbovenrand, geen poort: zie beslissing 21)")
        geo_poort('afscherming raakt aandrijving niet', ['plaatNabij'], lambda: gg['plaatNabij']['n'] == 0, lambda: f"{gg['plaatNabij']['n']} hoekpunten binnen 10 mm {gg['plaatNabij']['per_knoop']}", '0 hoekpunten van Klemmen, Hoes, Koppelingsklok en Draagarm binnen 10 mm van Onderplaat voorbumper')
        geo_poort('wielkastbekleding raakt onderstel en aandrijving niet', ['wielkastNabij'], lambda: gg['wielkastNabij']['n'] == 0, lambda: f"{gg['wielkastNabij']['n']} hoekpunten binnen 5 mm {gg['wielkastNabij']['per_knoop']}",
                  '0 hoekpunten van Onderstel, Aandrijflijn of Uitlaatsysteem (zonder remleidingen en slangbeugels, die zitten vast aan de wand: HEAD 17 hoekpunten) binnen 5 mm van Wielkast voor links (bewaking bij het sluiten van de doorkijk)')
        if g and g.get('dev30') is not None:   # zacht: ontbreken van de invoer blijft zonder gevolg voor de exitcode; het aantal zachte poorten wordt apart bewaakt
            poort('afwerking d: plooien in de glans (bumperbovenrand bij de hoek)', g['dev30']['n'] <= DEV30_MAX_N and g['dev30']['mm2'] <= DEV30_MAX_MM2, f"{g['dev30']['n']} driehoeken, {g['dev30']['mm2']:.0f} mm2 met afwijking > 30 graden",
                  f'<= {DEV30_MAX_N} driehoeken en <= {DEV30_MAX_MM2} mm2 (stand voor ronde 2; streef 0)', zacht=True)
        eis_plaat = f'<= {PLAAT_MAX} keer het gaas (a9035fc: 4,6 keer)'
        if 'eig' in res['cams']:
            px = res['cams']['eig']['px_per_knoop']; op = sum(v for kk, v in px.items() if kk.endswith('Onderplaat voorbumper')); gz = sum(v for kk, v in px.items() if kk.endswith('Honingraatgrille'))
            poort('onderplaat tegenover gaas in eig', gz > 0 and op <= PLAAT_MAX * gz, f'{op} px tegen {gz} px gaas ({op / max(gz, 1):.2f} keer)', eis_plaat)
        elif vol:
            poort('onderplaat tegenover gaas in eig', False, 'invoer ontbreekt: cams.eig', eis_plaat)
    poort('console zonder fouten' + (' achter' if a.achter else ''), res['meta'].get('console_ok', False), res['meta'].get('console_ok'), 'geen fouten of waarschuwingen')
    # aantal poorten: een poort die stilletjes verdwijnt (hernoemde knoop, camera of lijst die korter wordt) mag niet als ALLES GROEN eindigen. Alleen in volle modus; de controle is een extra harde poort buiten de 99
    # en staat ook in het groene geval in de lijst (extra: true in de JSON), zodat in meet.txt en meet.json te zien is dat de controle gedraaid heeft.
    vh, vz = (VERWACHT_HARD_ACHTER, VERWACHT_ZACHT_ACHTER) if a.achter else (VERWACHT_HARD, VERWACHT_ZACHT)
    gev_h, gev_z = sum(not p['zacht'] and not p.get('extra') for p in P), sum(p['zacht'] for p in P)   # extra poorten (achtermodus: interessegebied) tellen niet mee; in de voormodus bestaan ze hier nog niet
    res['meta']['aantal_poorten'] = {'harde': gev_h, 'zachte': gev_z, 'verwacht_harde': vh, 'verwacht_zachte': vz, 'gecontroleerd': vol, 'modus': 'achter' if a.achter else 'voor'}
    if vol:
        if a.achter:
            poort('aantal poorten achter', gev_h == vh and gev_z == vz, f'{gev_h} harde en {gev_z} zachte poorten gevonden, verwacht {vh} en {vz}',
                  f'precies {vh} harde en {vz} zachte poorten in volle achtermodus (VERWACHT_HARD_ACHTER en VERWACHT_ZACHT_ACHTER; nulmeting 18 oktober 2026 op fa5c619); een poort die verdwijnt maakt de meting rood', extra=True)
        else:
            poort('aantal poorten', gev_h == vh and gev_z == vz, f'{gev_h} harde en {gev_z} zachte poorten gevonden, verwacht {vh} en {vz}',
                  f'precies {vh} harde en {vz} zachte poorten in volle modus (VERWACHT_HARD en VERWACHT_ZACHT; nulmeting 17 oktober 2026); een poort die verdwijnt maakt de meting rood', extra=True)
    res['ok'] = all(p['groen'] for p in P if not p['zacht'])
    res['ok_afwerking'] = all(p['groen'] for p in P if p['zacht'])
    jp = a.json or os.path.join(a.uit, 'meet.json')
    json.dump(res, open(jp, 'w'), indent=1, ensure_ascii=False)

    # ---- uitvoer
    w = max(len(p['naam']) for p in P)
    print()
    for p in P: print(('GROEN ' if p['groen'] else ('GEEL  ' if p['zacht'] else 'ROOD  ')) + p['naam'].ljust(w), '|', p['waarde'], '|', p['eis'])
    if g: print('\ngeo:', json.dumps({k: g[k] for k in ('bumper', 'bumperAt', 'facet', 'facetAt', 'lipNaad', 'lipSprong', 'lipOnder', 'plaatOnder', 'plaatNabij', 'bumperTop', 'afdek', 'hoek', 'kapVoorrand') if k in g}))
    if a.basis and os.path.exists(a.basis):
        B = json.load(open(a.basis)); print('\nverschil met', a.basis)
        for k in namen:
            if k in B['cams']:
                o, nw = B['cams'][k], res['cams'][k]
                print(f'  {k:18s} motorruimte {o["motorruimte_pct"]} -> {nw["motorruimte_pct"]} %   onderstel {o["onderstel_pct"]} -> {nw["onderstel_pct"]} %   max knoop {o["motorruimte_max_knoop_px"]} -> {nw["motorruimte_max_knoop_px"]} px')
    harde = [p for p in P if not p['zacht'] and not p.get('extra')]; zachte = [p for p in P if p['zacht']]; extra = [p for p in P if p.get('extra')]
    if not vol: print('\naantal poorten niet gecontroleerd (beperkte modus: ' + ('--cams of --geen-rondgang)' if a.achter else '--cams, --geen-geo of --geen-rondgang)'))
    elif not all(p['groen'] for p in extra) and not a.achter: print(f"\nAANTAL POORTEN WIJKT AF: {gev_h} harde en {gev_z} zachte gevonden, verwacht {VERWACHT_HARD} en {VERWACHT_ZACHT}: een poort ontbreekt of is erbij gekomen (meting rood)")
    elif not all(p['groen'] for p in extra): print(f"\nEXTRA CONTROLE ROOD (achtermodus): {gev_h} harde en {gev_z} zachte poorten gevonden, verwacht {vh} en {vz}; zie 'aantal poorten achter' en 'interessegebied achterwielen in beeld' (meting rood)")
    print(('\nACHTERMODUS: ' if a.achter else '\n') + ('ALLES GROEN' if res['ok'] else f"{sum(not p['groen'] for p in harde)} RODE POORTEN van {len(harde)}" + ((' en een extra controle (aantal poorten of interessegebied) is rood' if a.achter else ' en de controle op het aantal poorten is rood') if not all(p['groen'] for p in extra) else '')), f"| afwerking (zacht, telt niet mee): {sum(p['groen'] for p in zachte)} van {len(zachte)} groen", f'| json: {jp}')
    return 0 if res['ok'] else 1


if __name__ == '__main__':
    try:
        sys.exit(main())
    except SystemExit:
        raise
    except Exception as e:
        import traceback; traceback.print_exc(); print('METING MISLUKT:', e); sys.exit(2)
