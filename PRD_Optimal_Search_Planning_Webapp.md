# Product Requirements Document
## Optimal Search Planning Web App (NavSAR)

Version: 0.1 draft
Status: For review

> **Correction, 2026-09-14.** Earlier drafts of this document called the
> method "IAMSAR ISPM". That acronym has no basis in IAMSAR, in the AMSA
> NATSAR manual, or in any other source consulted, and appears to have been
> introduced here in error; it has been removed from the codebase. The method
> is simply IAMSAR search planning. The product was also renamed from SARPlan
> to NavSAR.

---

## 1. Purpose

Search and rescue teams currently calculate optimal search areas by hand, using the IAMSAR search planning method. This means manually pulling wind and current data, computing drift vectors, computing probable error, and looking up correction factors in printed tables. It is slow and error prone under time pressure.

NavSAR automates this calculation chain. A user enters a small set of case facts. The app pulls weather and current data automatically where possible, lets the user pin locations on a map, runs the full calculation, and renders the predicted search area as a map overlay.

## 2. Goals

- Cut the time to produce a search area from tens of minutes to under two minutes for a standard case.
- Remove manual lookup errors from IAMSAR correction tables.
- Let a user with no GIS background place and read search area predictions on a map.
- Support iterative searches (day 2, day 3) that account for cumulative effort.
- Keep every automatic calculation editable, since search planners must be able to override any input with local knowledge.

## 3. Non-Goals

- NavSAR does not dispatch assets or manage live communications with search units.
- NavSAR does not replace the on-scene coordinator's judgment. It produces a recommendation, not a directive.
- V1 does not include mobile native apps. It targets a browser, usable on a tablet in an operations room.
- V1 does not include multi-agency case sharing or permissions systems. That is a later phase.

## 4. Target Users

- Search and rescue coordinators at coast guard or maritime rescue centers, planning the search.
- On-scene commanders who need a quick reference during an active search.
- Training instructors who need to run worked exercises (matches the exercises in the JICA lecture material).

## 5. Core User Flow

1. User starts a new case. Enters distress type (LKP known, EIP only, or continuing search from a previous datum).
2. User places the drifting start point on the map, or enters coordinates directly.
3. User enters or confirms drift time (distress time to search start time).
4. App fetches wind and current data for that location and time window. User can accept or override with manual values.
5. User selects the search object type (life raft, person in water, vessel) to pull the correct leeway table.
6. App calculates the datum point, total probable error, and separation ratio. Shows the datum and error circle on the map.
7. User enters available search assets (speed, endurance, sensor/sweep width, fatigue status).
8. App calculates total search effort, optimal search radius, optimal search area, coverage factor, and track spacing.
9. Map renders the optimal search area as an overlay, with suggested track spacing lines for each asset.
10. After a search is flown, user marks it complete. App logs the relative effort used and updates cumulative probability of success.
11. If not found, user starts the next search. App recalculates using cumulative effort and updated drift.

## 6. Functional Requirements

### 6.1 Case Setup and Input

- Create, save, and reopen a case. Each case stores its full input and calculation history.
- Support the three datum types: single point, leeway divergence, widely diverging, and line datum.
- Every input field accepts manual entry. No field is automation-only.
- Support multiple drifting elements per case (life raft plus debris, for example) with separate leeway values.

### 6.2 Map Interaction

- Interactive map (pan, zoom, satellite or nautical chart layer).
- Click or tap to drop a pin for LKP, EIP, or datum. Pin shows editable lat/long.
- Draw a track line or bearing line for line datum cases.
- Render the calculated datum point, error circle, and optimal search area as overlays.
- Render track spacing lines within the search area, one color per assigned asset.
- Layer toggle to show or hide wind vectors, current vectors, and past search coverage.
- Support placing multiple search asset start positions and simple coverage visualization per asset.

### 6.3 External Data Integration

- Pull wind data (speed and direction) for a given location and time.
- Pull surface current data (speed and direction) for a given location and time.
- Pull sunrise and sunset times for endurance calculations.
- Where a live forecast is not available for the requested time, fall back to the nearest available forecast and flag it to the user.
- Cache all pulled data with the case, so a saved case is reproducible even if the external source later changes its data.
- All auto-filled fields are visibly marked as "auto-filled from [source]" and remain editable.

### 6.4 Drift and Datum Calculation Engine

Implements, per the IAMSAR search planning method:
- Drift vector synthesis from leeway, tidal current, sea current, wind current, and other water current.
- Datum position and, where relevant, leeway divergence distance (DD).
- Drift velocity error, from average surface wind error, total water current error, and leeway error.
- Positional fix error for the drifting start point and for search facility position.
- Total probable error (E) and separation ratio (SR).
- Automatic datum type selection based on SR, with manual override.

### 6.5 Search Area and Effort Calculation Engine

- Search effort (Z) per asset from sweep width, search speed, and search endurance.
- Sweep width correction using weather, speed, and fatigue correction factors.
- Total available search effort across all assigned assets.
- Effort factor based on datum type.
- Cumulative relative effort across searches.
- Optimal search factor lookup (ideal or normal search condition).
- Optimal search radius and optimal search area size, by datum type.
- Optimal coverage factor and per-subarea allocation when more than one asset searches concurrently.
- Optimal track spacing per asset, based on that asset's corrected sweep width.

### 6.6 Multi-Search / Iterative Planning

- Support a sequence of searches against the same case.
- Carry forward cumulative relative effort and cumulative probability of success across searches.
- Recompute drift and error for a new search day using the previous datum as the new starting point.
- Show cumulative POS on a simple chart so planners can judge whether continued searching in the same area is worthwhile.

### 6.7 Evaluation and Reporting

- Show POS, POC, and POD for each individual search.
- Show cumulative POS after each search.
- Generate a printable or exportable search plan (PDF), including inputs used, all calculated values, and the map view with overlays.

### 6.8 Manual Override

- Every auto-calculated or auto-fetched value can be edited by the user.
- Changing an upstream value (for example, wind speed) flags all downstream calculated values as stale until recalculated.

## 7. Data Model (high level entities)

- Case: id, name, status, created_at, search object type(s)
- DriftingStartPoint: type (LKP/EIP/previous datum), position, timestamp, fix error source
- EnvironmentSnapshot: wind vector, current vector(s), source, timestamp, case_id
- DatumResult: position, datum type, DD, total probable error, separation ratio
- SearchAsset: name, speed, endurance, sweep width inputs, fatigue flag, sensor altitude
- SearchEffortResult: Z per asset, total Z, effort factor, relative effort, cumulative relative effort
- SearchAreaResult: optimal radius, optimal area, coverage factor, track spacing per asset
- SearchAttempt: sequence number, date, assets used, area searched, POS, cumulative POS

## 8. System Architecture (high level)

- Frontend: map-based web UI (for example, MapLibre or Leaflet) plus a form-based input panel and a results panel.
- Backend calculation service: stateless service implementing the planning formulas, takes case inputs and returns all derived values. Keeping this isolated makes it independently testable against the worked exercises in the IAMSAR manual.
- Data ingestion service: scheduled and on-demand calls to external weather and ocean current sources, normalized into a common format before reaching the calculation service.
- Database: stores cases, inputs, environment snapshots, and results for reproducibility and audit.
- Export service: renders the case into a PDF report.

## 9. Candidate External Data Sources

- Wind and weather forecast: Open-Meteo Marine API, NOAA GFS/NOMADS, or a commercial provider such as StormGlass, depending on coverage and licensing needs.
- Ocean surface currents: Copernicus Marine Service, NOAA OSCAR, or a regional hydrographic agency feed, depending on the operating region.
- Bathymetry and nautical chart base layer: GEBCO or a regional charting authority, for map context only.
- Sunrise and sunset: standard astronomical calculation, no external dependency needed.

Final choice depends on the operating region and any existing data agreements the rescue agency already holds. This should be confirmed before backend work starts.

## 10. Non-Functional Requirements

- Calculation results must match the IAMSAR worked examples exactly, within rounding tolerance. This needs a test suite built from the manual's own exercises.
- The app must remain usable when external weather or current data is unavailable, using manual entry as a full fallback path, not a degraded one.
- Map and calculation state must be recoverable after a browser refresh or connection drop, since this tool may be used in unstable network conditions on a vessel or aircraft.
- Response time for a full recalculation should stay under two seconds.
- All position and time inputs must support both manual entry and map-based entry without one blocking the other.

## 11. Assumptions

- Users have basic familiarity with IAMSAR terminology, so the UI can use standard terms (POC, POD, POS, datum, sweep width) rather than inventing new labels.
- Initial deployment targets a single search and rescue authority or training context, not a multi-agency shared platform.
- Internet connectivity is available for data fetching, with manual entry as the offline fallback.

## 12. Risks and Open Questions

- Data licensing: some marine forecast and current data sources require paid subscriptions or usage agreements. This needs to be resolved before committing to a specific source.
- Regional coverage: current data quality varies a lot by region. The tool needs a graceful path for regions with sparse data.
- Liability: since this tool supports a real rescue decision, the UI needs to make clear that all outputs are planning aids, not authoritative determinations, and every automated input needs to stay visibly editable.
- Which map base layer and hosting approach the responsible agency will approve for security and connectivity reasons is still open.
- Target region and language localization needs are still open.

## 13. Phased Roadmap

Phase 1, MVP:
- Manual and map-based input for a single search, single datum type at a time.
- Full calculation engine (drift, error, effort, area, coverage, track spacing).
- Map overlay of datum, error circle, and optimal search area.
- One external weather and current data source, with manual override.
- Exportable PDF report.

Phase 2:
- Multi-search support with cumulative effort and cumulative POS tracking.
- Multiple concurrent search assets with per-asset track spacing overlays.
- Additional data source options per region.

Phase 3:
- Case history and comparison across past incidents.
- Multi-user case sharing with role-based access.
- Training mode with built-in exercises matching the JICA course material.

## 14. Reference: Core Formulas

Full calculation chain, in build order. This is the exact sequence the calculation engine (6.4 and 6.5) must implement, and it should ship as a standalone module with its own test suite, checked against the lecture's worked exercises, before any UI work starts.

**Search success**
POS = POC × POD

**Drift velocity error**
Dve = sqrt(ASWDve² + TWCe² + LWe²)
ASWDve: probable error of drift velocity from average surface wind. 0.3 kt for steady or gradually changing winds, 0.5 kt for forecast or highly variable winds.
LWe: leeway error, from the leeway chart (see 15.3).

**Total water current error**
TWCe = sqrt(TCe² + SCe² + WCe² + OWCe²)
TCe, SCe, WCe, OWCe: probable error of tidal current, sea current, wind current, and other water current. Default 0.3 kt each if no better estimate exists.

**Total probable error**
E = sqrt(X² + De² + Y²)
X: drifting start point error. Fixe alone if the fix is known; Fixe + DRe if only dead reckoning is available; or the previous search's total error E if this is a repeat search on the same case.
De: drift error, De = Dve × drift time.
Y: search facility position error, same fix-error logic as X, applied to the searching unit.

**Separation ratio and datum type**
SR = DD / E, where DD is the divergence distance between the two leeway-divergence datums.
SR < 4: leeway divergence datum, one combined search area.
SR ≥ 4: widely diverging datums, two independent search areas.
DD = 0 (no leeway divergence angle entered): single point datum.

**Search effort**
Z = W × V × T
W = W0 × fw × fv × ff (uncorrected sweep width × weather, velocity, and fatigue correction factors)
V: search speed. T: search endurance.
Zta = Zf-1 + Zf-2 + ... (sum across all assigned facilities)

**Effort factor**
Point-type datum (single, leeway divergence, or widely diverging): fz = E²
Line datum: fz = E × L, where L = DD + 2E

**Relative and cumulative effort**
Zr = Zta / fz
Zrc = Zr-1 + Zr-2 + ... + Zr-i (sum across all searches to date, including this one)

**Optimal search radius**
Ro = fs × E
fs: optimal search factor, read from the IAMSAR graph against Zrc (see 15.5). Ideal or normal search condition curve, chosen by whether the correction factors fw, fv, ff are all ≥ 1 (ideal) or any are < 1 (normal).

**Optimal search area size**
Single point datum: Ao = 4 × Ro²
Leeway divergence datum (SR < 4): Ao = 4 × Ro² + 2 × Ro × DD, one elongated area spanning both datums
Widely diverging datums (SR ≥ 4): two separate areas, each 4 × Ro², centered on each datum
Line datum: Ao = 2 × Ro × L

**Coverage factor**
C = Z / A (general form)
Co = Zta / Ao = Z1/A1 = Z2/A2 ... (optimal coverage factor, equal across every subarea when the search area is split among assets)

**Optimal track spacing**
S = W / C (general form)
So = W / Co, computed per facility using that facility's own corrected sweep width

**Cumulative probability of success**
POSc = POS1 + POS2 + ... + POSi
A high POSc after repeated searches signals that continuing to search the same area is probably not worthwhile.

## 15. Reference: Manual Lookup Graphs and Tables

IAMSAR Manual Volume 2, Appendix N is the canonical source for these (the lecture cites it by name and table number), but it's IMO/ICAO copyrighted material, so it isn't reproduced here directly. Instead, this section is backed by real digitized numbers pulled from a public, citable equivalent: the Australian *National Search and Rescue Manual*, 2023 Edition (AMSA / National Search and Rescue Council), Appendices D-5 through D-7, found via browser search and downloaded directly from marinerescueportjackson.com.au. That manual is built "with due regard to" IAMSAR and uses the same formulas throughout; where its values deviate from IAMSAR, the manual says so explicitly, and those notes are carried through below.

The full transcribed tables, formulas, and source citation live in a companion file: **SAR_Reference_Tables.md**. Summary of what's in it and what each piece feeds:

**15.1 Fix error tables**
Fix error by means of navigation (GPS 0.1nm, RADAR 1nm, visual fix 1nm, celestial fix 2nm, etc.), plus fallback values by craft type when the means of navigation is unknown, and dead-reckoning error rules. Feeds X (drifting start point error) and Y (search facility position error). The source manual flags this table as its own variant, not IAMSAR's, chosen because it's more practical to base fix error on the navigation equipment actually carried.

**15.2 Leeway table**
Full multiplier, modifier, and divergence angle values for every craft and object type the manual covers, from person-in-water postures through life raft configurations, sailing vessels, power vessels, and boating debris. This directly replaces the "leeway graph" lookup with a plain formula: leeway speed = (multiplier x wind speed) ± modifier. Feeds leeway rate, leeway direction, leeway divergence angle, and leeway error.

**15.3 Sweep width tables**
Uncorrected sweep width by search object and sensor type, for visual search over water (small boats, merchant ships), fixed-wing aircraft at four altitudes, helicopters at four altitudes, and visual search over land. Feeds search effort Z for each facility.

**15.4 Correction factors**
Weather correction factor (differs from IAMSAR for winds over 15kt, per the source manual's own note) and fatigue correction factor (0.9 / 1.0, matching the lecture exactly). Combine with uncorrected sweep width to get corrected W.

**15.5 Safety factor (the app's default for fs)**
The source manual doesn't carry IAMSAR's continuous optimal-search-factor graph. It uses a stepped table instead: 1.1 for the initial probability area, rising to 1.6, 2.0, 2.3, and 2.5 across successive search expansions. This is a reasonable default curve for fs in the calculation engine, still manually editable per 6.8.

**15.6 Not digitized**
Two pieces remain graph-only in the source: the local wind current graph (for estimating wind current from surface wind) and the probability-of-detection curve. Both would need the source PDF's page images read manually, or a licensed IAMSAR copy, to digitize.

Given this, the phased plan changes slightly from the original draft: v1 can ship with these digitized tables as built-in defaults (not just blank manual-entry fields), all still editable, with the wind current graph and POD curve remaining manual entry until someone digitizes them from source images.
