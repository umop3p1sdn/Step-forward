# Step Forward — recept voor een level

Dit is hoe level 1 (OLD TOWN) en 2 (DOWNTOWN) gebouwd zijn, en hoe elk volgend level op dezelfde manier gemaakt wordt.

## De formule
- **8 levels**, elk een eigen **thema** (wereld) en eigen **soldaten** (kit).
- Elk level = **10 waves**, elke wave = **een eigen set** ("schiettent"): een losse, afgesloten plek. Tussen waves wordt het zwart en sta je ergens anders — zoals de scènes in Virtua Cop / Time Crisis. Afwisselen: buiten, binnen, smal, breed, hoog.
- Wave 10 = **baas** (gun truck, zware jongens, schilden, heli of tank). Die set heeft een dwarsweg (`wagZ`) als er voertuigen komen.

## Een set bouwen (`kaart/kaart_<wereld>.js`)
- Elke set staat op `oz = -100 * k` (k = 0..9). Jij staat op `(0, oz)` en kijkt naar **-z**.
- **Alles binnen ~12 m**: ramen max 13,5 m, deuren/spawns max 12,5 m (`kDichtbij`). Achterwand ±11–12,5 m.
- **Ramen en deuren naar je toe** (achtergevel of schuin). Zijgevels dichtbij zijn te steil: luiken blokkeren het zicht.
- Sluit de set af: muur achter je (`oz + 3..4`), zijkanten dicht. Buiten: eigen hemel (staat onderaan elke wereld).
- Bouwstenen:
  - `kGevel(B, R, {x0,z0,x1,z1, n:[kant naar jou], H, mat, tint, deuren:[a], ramen:[[a, y]], gaten})` — muur met **echte deuren** (dicht tot ze opengetrapt worden) en **open ramen** (met donkere kamer erachter).
  - `kRij` — rij huizen met daken (buiten). `kProp` — auto, kratten, vaten, pallets, zand, muurtje, kast, tafel, bank, container.
  - `kKraam` (kraampje), `kPilaar`, `kContainer` (met deur), `B.doos/B.cilinder/B.box` (eigen dingen; `B.box` = onzichtbare botsing, bv. kaderand).
  - Binnen: `binnen(...)` = vloer + plafond + licht, `B.lamp(...)`.
- **Dekking die werkt**:
  - Hoog (≥ 2 m: pilaar, stelling, container, hoek van een gebouw) → soldaat **leunt/stapt/rolt** er omheen (`hoeken`).
  - Laag (0,8–1,35 m: toonbank, muurtje, hooibaal, fontein) → soldaat zit **gehurkt en komt omhoog** (`dek`-post). Geef eigen blokken een `props`-regel `{x, z, w, d, h}`.
- Zet elke set in `KAART_STAND.<wereld>` (naam + `binnen`/`lucht`) en `KAART_TITELS`, en de wereld in `volg` (+ `KITS`) in `maakLevels`.

## Hoe soldaten in beeld komen (draaiboek)
- Per level/wave/plek ligt een **vaste volgorde** vast (`draaiboek`, met vaste seed): wie, waar, hoe. Elke keer hetzelfde → uit je hoofd te leren.
- Soorten posten: **deur** (eerste keer intrappen, daarna uitstappen), **hoek** (leunen / stappen / rollen), **raam**, **dek** (gehurkt achter lage dekking), **loop** (binnenlopen van opzij, alleen als er weinig posten zijn).
- Regels: steeds **een andere kant** (links/midden/rechts/boven), niet dezelfde post als de laatste paar, **2–3 tegelijk in beeld**, nieuwe komt na een vaste korte pauze als er één neergaat.
- Niemand loopt door muren (botsing met dozen + echte driehoeken + open deurbladen), niemand loopt het water in (`B.box` langs de kade).

## Soldaten per level (`SOLDAAT_KITS` in `kaart_levels.js`)
- `camo` = 4 kleuren voor de print op het pak, de helm en het vest.
- `koppen` = hoofddeksels (helm, muts, pet, baret). `kap` + `kapKans` = hoes over het gezicht (`bivak`, `sjaal`, `gas`), `kap2` = tweede soort.
- `dun` (SWAT, 0,88) of `breed` (elite, 1,08) = lichaamsvorm. `print` = hoe sterk de camo over het pak ligt.
- `mix` = mengsel van andere kits (finale).

| Lvl | Thema | Soldaten |
|---|---|---|
| 1 | OLD TOWN | standaard |
| 2 | DOWNTOWN | standaard |
| 3 | HARBOUR | marine (blauwgrijs) |
| 4 | DESERT TOWN | zand, sjaals |
| 5 | HOTEL (lift, 3 verdiepingen) | zwart SWAT, dunner, bivakmuts/gasmasker |
| 6 | WINTER BASE | sneeuw |
| 7 | JUNGLE CAMP | woodland |
| 8 | HQ (finale) | elite + mix |

## Testen (in `/home/claude/work`)
- `deur_t.py <lvl>` — per set: deuren vóór je, aantal posten, hoeken.
- `muur_t.py <lvl> <sec>` — telt soldaten die door muren lopen (moet 0).
- `stuck_t.py <lvl> <wave> <sec> 3` — loopt de wave door naar de volgende?
- `volg_t.py <lvl> <sec> 3,5` — zelfde volgorde bij snel en langzaam schieten?
- `shot_t.py <lvl> <wave>` — screenshot per set. `fuzz2.py` — 0 fouten.
