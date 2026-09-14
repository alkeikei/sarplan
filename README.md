# NavSAR

A browser tool that runs the IAMSAR search planning chain: case facts and
drift inputs in, datum, total probable error, optimal search area and track
spacing out, drawn on a map and exportable as a PDF search plan.

**Outputs are a planning aid.** They support the search coordinator's
judgement; they are not an authoritative determination of where a search
object is. Every automated value in the app is visibly tagged with its source
and stays editable.

This is Phase 1 (MVP) of `PRD_Optimal_Search_Planning_Webapp.md`: a single
search, one datum type at a time. Phase 2 and 3 features (multi-search
cumulative tracking, multi-agency sharing, training mode) are not built.

## Running it

```bash
npm install
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on http://localhost:5173 |
| `npm test` | Engine and app test suite (Vitest) |
| `npm run test:watch` | The same suite, watching |
| `npm run typecheck` | TypeScript, no emit |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | oxlint |
| `npm run tiles` | Cut the base map archive (see below) |
| `npm run tiles:upload` | Push that archive to R2 |
| `npm run deploy` | Build and deploy the Worker |

## Base map

Protomaps vector tiles, from a single `.pmtiles` archive this project hosts
itself in Cloudflare R2 and serves through its own Worker. No API key, no
quota, no account to sign up for. The data underneath is still OpenStreetMap;
only the server changes.

The reasoning is the same one the rest of the app is built on. `tile.openstreet
map.org` is volunteer-run infrastructure whose usage policy excludes production
apps, so it may throttle or block without warning. A keyed commercial tile
service trades that for a monthly quota and a key to keep secret, which an
open-source tool that anyone can access cannot honestly promise to stay inside.
A basemap that disappears mid-search is not a failure this tool should be
capable of having, and self-hosting removes that failure mode rather than
adding a fallback for it.

There is deliberately no third-party fallback. The archive is served from the
app's own origin, by the same Worker that serves the app, so the map now has
exactly the availability the app has: if the tiles are unreachable, the page
that would have drawn them did not load either. Same-origin also matters to the
PDF export, which rasterises the map — a cross-origin read would taint the
canvas.

### Cutting and uploading the archive

```bash
npm run tiles          # extract the region from the Protomaps planet build
npm run tiles:upload   # push it to R2
npm run deploy
```

`scripts/build-tiles.sh` pulls a regional extract straight out of the remote
planet archive over range requests, so only the region's bytes are downloaded
— there is no 100 GB intermediate file. It defaults to the Indonesian search
and rescue region with sea room either side (`92,-14` to `142,8`), at the
planet build's full z15. Both are overridable, and `MAXZOOM=13` cuts the file
substantially while keeping everything that matters at search-planning scale,
where the useful detail is coastline and navigation rather than building
footprints:

```bash
BBOX=110,-9,116,-7 MAXZOOM=13 npm run tiles
```

It needs the [pmtiles CLI](https://github.com/protomaps/go-pmtiles)
(`brew install pmtiles`). The archive is gitignored: it is data,
not source, and it is re-cut rather than versioned.

Re-cut it periodically — the Protomaps planet builds track OpenStreetMap, and
a coastline is not the sort of thing to leave five years stale.

### Running it locally

`npm run dev` serves `./tiles/basemap.pmtiles` from disk over byte ranges,
standing in for the Worker. Cut an archive with `npm run tiles`, or skip the
download entirely and point the dev server at a remote one by copying
`.env.example` to `.env` and setting `VITE_PMTILES_URL`. The Protomaps daily
planet build works directly and serves cross-origin range requests:

```
VITE_PMTILES_URL=https://build.protomaps.com/20260914.pmtiles
```

Those builds are kept for about a week, so the date needs to be a recent one.

### How it is styled

Protomaps' `light` flavour — a plain, legible road map. Someone working a
search should be reading the map, not a theme.

The one change is the water, taken from the flavour's own saturated cyan down
to a pale tint of it. Everything the app draws on top — the search rectangle,
the error circle, the track legs — is cyan or teal, and almost all of it lands
on open water; against the original those lines were another shade of the same
colour. The base map gives up saturation it was not using so the plan can have
it. It also prints legibly, which the earlier dark treatment did not.

### What it does not have

Bathymetry. The Protomaps basemap is an OpenStreetMap rendering: coastline,
place names and navigation detail, with open water as flat colour. A depth
contour under a drifting datum would be worth having and is not there. The
schema has no room for it either, so it would arrive as a separate overlay —
GEBCO or EMODnet — rather than as a different basemap.

## How it is put together

```
src/
  engine/          the calculation chain. Framework free: no React, no
                   DOM, no network, no clock. Pure functions over plain data.
    tables/        the reference tables as typed data modules
    __tests__/     one test per formula, plus a full worked case
  app/             case state, overrides and provenance, persistence, wind fetch
  components/      map and the step panels
  export/          PDF report
worker/            the Cloudflare Worker: serves the tile archive from R2,
                   and hands everything else to the static assets
scripts/           cutting and uploading that archive
```

### The calculation engine

`src/engine` is standalone and independently testable, which is the point: the
formulas can be checked against worked examples without a browser. Nothing in
it imports from the UI. Canonical units throughout are **knots, nautical
miles, hours, square nautical miles, and degrees true**; the one exception to
the "directions are toward" rule is wind, which is stored as a FROM direction
because that is how wind is reported.

`calculateCase()` in `src/engine/calculate.ts` runs the whole chain in the
order PRD section 14 sets out:

1. **Drift** — leeway speed `(multiplier × wind) ± modifier`, split ± the
   divergence angle; vector-summed with the four water currents; applied over
   the drift time to give the datum(s) and DD.
2. **Error** — `TWCe → Dve → De → E → SR`, and the datum type SR selects.
3. **Effort** — `W = W0 × fw × fv × ff`, `Z = W × V × T`, `Zta`, `fz`, `Zr`, `Zrc`.
4. **Area** — `Ro = fs × E`, `Ao` by datum type, `Co = Zta / Ao`, `So = W / Co`
   per facility.
5. **Success** — `POS = POC × POD`, `POSc`.
6. **Geometry** — the rectangles, error circles and track legs the map draws.

All four `Ao` cases are implemented: single point `4Ro²`, leeway divergence
`4Ro² + 2·Ro·DD`, widely diverging (two areas of `4Ro²`), and line datum
`2·Ro·L` with `L = DD + 2E`.

### Reference tables

Every lookup value lives in `src/engine/tables/` as typed data, not as a
number inline in a formula, so a licensed IAMSAR Appendix N copy can replace a
table without touching the calculation code. Each module's header carries its
source citation and the source manual's own deviation notes.

Source: *National Search and Rescue Manual*, 2023 Edition (AMSA / Australian
National Search and Rescue Council), Appendices D-5 to D-7 and Table 3-2, used
as a publicly citable stand-in for IAMSAR Volume II Appendix N. See
`SAR_Reference_Tables.md`.

Three things the source flags as **its own values, differing from IAMSAR**:

- the weather correction factor for search objects other than a person in
  water, life raft or boat under 10 m, above 15 kt of wind;
- fix error by type of craft (Tables D-6:2 and D-6:3), which the manual
  states is where it departs from IAMSAR;
- the stepped safety factor table (Table 3-2), which stands in for IAMSAR's
  continuous optimal-search-factor graph.

**LWe**, the leeway error, comes from a second source: Allen, A.A. and
Plourde, J.V. (1999), *Review of Leeway: Field Experiments and
Implementation*, U.S. Coast Guard R&D Center CG-D-08-99, Table 8-1 — a U.S.
federal government work in the public domain, and the study AMSA's own leeway
table derives from. Table 8-1 prints Sy/x, the standard error of the leeway
regression, per craft type; LWe is that figure converted to knots
(`Sy/x cm/s x 0.0194385`). The app reads it from the search object already
chosen rather than asking for the craft a second time, so the two cannot
disagree. Where the source prints Sy/x as a floor (`> 15 cm/s`) the
value is flagged as a minimum, not a measurement, and the one leeway object
with no counterpart in Table 8-1 — the generic fishing vessel — falls back to
the 0.3 kt default rather than borrowing a named hull type's number.

**fv**, the speed correction factor, comes from Table D-5:8, read from each
facility's platform and search speed. The table covers aircraft searching for
maritime objects only, so a vessel — or an aircraft searching over land — has
no row there and takes 1.0, which is the source declining to correct rather
than the app inventing a value. Speeds between two printed columns are
interpolated and flagged.

One value has **no source table** and is therefore manual entry, marked as
such in the UI rather than given a fabricated default:

- **POD** — the detection curve is a graph the manual does not tabulate. It
  does print two points (Table 4-2: 78% at a coverage factor of 1.0, 47% at
  0.5), which are shown under the field as anchors to judge against. The app
  does not interpolate between them or extrapolate beyond them.

The manual's own **coverage floor** is enforced as a warning rather than a
limit: below 0.5 it states that the coverage "is unsatisfactory in itself"
and that searching at less than 0.5 "is not recommended" (4.3.49, 4.3.55), so
the app says so in amber and leaves the decision with the coordinator.

Every sweep width table is transcribed in full from the printed appendix and
verified value by value: 1,483 figures across 15 tables — vessels at two eye
heights (D-5:3), merchant ships (D-5:5), fixed-wing aircraft and helicopters
at 500, 1000, 1500 and 2000 ft (D-5:6 and D-5:7), and land search at four
altitudes (D-5:9). A test pins each table's row and column count so a future
truncation fails the build.

Sweep width between two visibility columns is linearly interpolated and the
result is flagged as interpolated, not passed off as a table value.

### Nothing recalculates silently

Per PRD 6.8, changing any input marks every downstream result stale and leaves
it stale until the user presses **Recalculate**. The header names how many
inputs moved, the results panels carry an amber notice listing them, and the
map draws stale overlays faded. Amber, not red: a stale result is the expected
state after an edit, not an error.

### Auto-filled values

Anything the app filled in shows a tag saying where it came from, and the
input itself is the edit affordance. Overriding a value swaps the tag for
"Manual override" with a reset back to the source value. This covers the wind
fetch, every table lookup, and the derived drift time.

### Two languages

English and Indonesian, switched from the EN / ID control in the header. The
app is aimed first at Indonesian SAR crews, so Indonesian is a full
translation and not a veneer: the panels, every "?" explanation, the map
legend and tooltips, the provenance tags, the reference-table labels and the
exported PDF all switch together.

The base map switches with them. Protomaps carries OpenStreetMap's
`name:<lang>` tags, so place names are re-labelled in place on an EN / ID
switch — Indonesian where the data has it, the local name where it does not.
Place names are part of the translation, not furniture around it: a
coordinator reading the panels in Indonesian should not be reading the map
underneath them in English.

`src/app/i18n/` holds it. `en.ts` is the source of truth for the key set and
`id.ts` is typed `Record<TextKey, string>`, so a string added in English and
forgotten in Indonesian fails the build rather than shipping a blank label
into an operations room; `help.id.ts` is typed against `help.en.ts` the same
way, and `enums.ts` maps each engine enum to a key so a new datum type or
search stage cannot reach a select menu unlabelled.

Three rules hold the translation together:

- **Notation is never translated.** E, Ro, Ao, Co, So, DD, SR, W0, fw, fv, ff,
  Zta, POC, POD and POS are international symbols read off the same manual in
  either language, and the `formula` lines in the help are identical in both.
  What changes is the prose around them.
- **Table citations stay in English.** "Table D-6:1" is a pointer into an
  English source manual; a translated table name cannot be looked up. The
  descriptions *around* the citation are translated.
- **Numbers keep the full stop** as the decimal mark in both languages.
  Indonesian prose normally uses a comma, but the numeric inputs write a full
  stop, and the app deliberately shows one decimal mark everywhere so two
  figures read side by side under pressure cannot be misread.

The labels that come out of the engine's reference tables — leeway object
descriptions, sweep width object names, fix error methods — are translated in
`data.ts`, keyed by their English original and falling back to it. The engine
itself stays language-free: translating inside it would put a UI concern in
the calculation, and the fallback means an untranslated new table row shows
the source manual's own wording rather than nothing.

Fetched values record *why* they may not fit — the nearest forecast hour, a
distant port — as dictionary keys and values rather than a finished sentence,
because the case is persisted: one fetched in English and reopened in
Indonesian has to read in Indonesian, and a stored sentence cannot.

The language is a user preference, so it lives in localStorage and not in the
case record: a case exported by an Indonesian coordinator and reopened by an
English one reads in the reader's language. Names the user can edit — the case
name, a facility name — are created in whichever language was active at the
time and then left alone, because renaming someone's saved case on a language
switch would be worse than a stray English default.

### Explaining itself

Every input and every calculated value carries a "?" that opens a plain-language
explanation: what the quantity is, what to type into it, the formula behind it,
and which table the app's own answer came from. It is written for someone who
has never planned a search, on the assumption that the person in front of the
screen is not always a trained SAR coordinator.

All of the text lives in `src/app/i18n/help.en.ts` and `help.id.ts`, one entry
per concept, keyed by an id that is a closed union — a typo in a `help="..."` prop is a compile error,
and an entry nothing references is dead weight that shows up in review. The
`?` itself is `src/components/ui/HelpTip.tsx` and is behaviour only: it opens
on hover and on keyboard focus, pins open on click or tap so touch users are
not locked out, closes on Escape or an outside click, renders through a portal
so the scrolling side panel cannot clip it, flips above the button when there
is no room below, and closes if its button scrolls out of view.

Where the reference tables leave a figure undigitised — POD — the help says so
rather than implying a lookup exists.

### External data

Wind speed and direction come from **Open-Meteo** (no API key). If the
requested hour is not available the nearest forecast hour is used and the gap
is flagged.

Meteorological visibility can be fetched from **BMKG**, the Indonesian met
agency (no API key). It forecasts for 294 named ports rather than on a grid,
so the app finds the nearest one, reports how far away it is, and flags a
reading from beyond 20 nm — a port figure is not necessarily the visibility on
scene. BMKG publishes 12-hour blocks, so a search start time that falls
outside every published block is flagged too. Only visibility is taken: the
same payload carries currents and wind, but as 12-hour min/max ranges with
directions given as 16-point compass *names* ("Timur Laut"), which cannot
become a drift vector without inventing precision the source does not have.
BMKG also emits bare `NaN`, which is not valid JSON, so the payload is
repaired before parsing (`repairBmkgJson`, tested).

Everything else is manual: **no live ocean current source is wired up in this
build**, and the current fields say so.

Manual entry is a complete path, not a degraded one. Aside from that one wind
call the app works offline, and the case is written to IndexedDB so it
survives a refresh or a dropped connection.

## Tests

```bash
npm test
```

146 tests. One per formula in PRD section 14, plus the reference tables, the
geodesy, the map geometry, and the override and provenance layer. The
end-to-end test in `src/engine/__tests__/workedCase.test.ts` runs a complete
case from drifting start point to track spacing against a hand calculation
that is written out in full in the file header, checking each of its ten
steps.

## Known limits

- No bathymetry under the search area. See "Base map" above.
- The base map is a single regional extract, so a case outside the cut region
  gets no tiles. PRD 12 leaves the base layer and hosting approach open,
  pending the responsible agency's approval.
- The PDF is rendered with jsPDF's built-in Helvetica, which is WinAnsi
  encoded. Text is checked against that character set in development.
- The map capture for the PDF uses html2canvas for the map furniture only —
  the attribution and the scale bar. Everything carrying information is
  composited by hand in `src/components/mapCapture.ts`, because html2canvas
  silently drops both halves of it: the Protomaps tiles, each drawn into its
  own canvas, come back blank, and Leaflet's vector overlay pane is a single
  transform-positioned SVG element that in some browsers rasterises empty —
  a report showing the base map and the datum marker but missing the search
  area and the error circle. So the tiles are copied across as bitmaps from
  the positions the live map has them at, and every overlay is redrawn,
  projected through the live map. If the capture fails outright the report is
  still produced without the map and says so; every calculated position is
  listed in the text.
