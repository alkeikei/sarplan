# Reference Tables for the Drift and Search Planning Engine

Source: *National Search and Rescue Manual*, 2023 Edition, Version 1 (February 2023). Published by the Australian Maritime Safety Authority (AMSA) on behalf of the Australian National Search and Rescue Council. Appendices D-5 through D-7.
Public URL: https://www.marinerescueportjackson.com.au/ddlfiles/NATSAR-Manual.pdf (mirrored via the SAR Tools page at marinerescueportjackson.com.au/sartools.htm)

This manual was developed "with due regard to" IAMSAR and uses the same formulas (POC, POD, POS, E, SR, Ao, track spacing). Its own text flags the handful of places its values deviate from IAMSAR, and those notes are reproduced below wherever they occur. Treat this as a well-sourced, publicly available stand-in for the IAMSAR Appendix N tables, not as the IAMSAR manual itself. IAMSAR Volume II is IMO/ICAO copyrighted; if the team has a licensed copy, its Appendix N values should replace these before the app ships.

Everything below is transcribed directly from the source PDF, not estimated.

---

## 1. Leeway table (Table D-5:1 and D-5:2)

Formula: **Leeway speed (kt) = (Multiplier x Wind speed in kt) ± Modifier**. Divergence angle is applied both + and - of the downwind direction to get the two leeway-divergence datums.

| Category | Sub-category | Descriptor | Multiplier | Modifier | Divergence angle (deg) |
|---|---|---|---|---|---|
| PIW | Vertical | | 0.011 | 0.07 | 30 |
| PIW | Vertical | | 0.005 | 0.07 | 18 |
| PIW | Sitting | | 0.012 | 0.00 | 18 |
| PIW | Horizontal | Survival suit | 0.014 | 0.10 | 30 |
| PIW | Horizontal | Scuba suit | 0.007 | 0.08 | 30 |
| PIW | Horizontal | Deceased | 0.015 | 0.08 | 30 |
| Maritime life raft, no ballast | no canopy, no drogue | | 0.042 | 0.03 | 28 |
| Maritime life raft, no ballast | no canopy, no drogue | | 0.057 | 0.21 | 24 |
| Maritime life raft, no ballast | no canopy, with drogue | | 0.044 | -0.20 | 28 |
| Maritime life raft, no ballast | canopy, no drogue | | 0.037 | 0.11 | 24 |
| Maritime life raft, no ballast | canopy, with drogue | | 0.030 | 0.00 | 28 |
| Maritime life raft, shallow ballast + canopy | no drogue | | 0.029 | 0.00 | 22 |
| Maritime life raft, shallow ballast + canopy | no drogue | | 0.032 | -0.02 | 22 |
| Maritime life raft, shallow ballast + canopy | with drogue | | 0.025 | 0.01 | 22 |
| Maritime life raft, shallow ballast + canopy | capsized | | 0.017 | -0.10 | 8 |
| Maritime life raft, deep ballast + canopy (see 4-6 person sub-table below) | | | 0.030 | 0.02 | 13 |
| Other maritime survival craft | Life capsule | | 0.038 | -0.08 | 22 |
| Other maritime survival craft | USCG sea rescue kit | | 0.025 | -0.04 | 7 |
| Aviation life raft, no ballast w/ canopy | Evac/slide | | 0.037 | 0.11 | 24 |
| Aviation life raft, no ballast w/ canopy | 4-6 person | | 0.028 | -0.01 | 15 |
| Person-powered craft | Sea kayak w/ person on aft deck | | 0.011 | 0.24 | 15 |
| Person-powered craft | Surfboard w/ person | | 0.020 | 0.00 | 15 |
| Person-powered craft | Windsurfer w/ person, mast and sail in water | | 0.023 | 0.10 | 12 |
| Sailing vessel, mono-hull | Full keel, deep draft | | 0.030 | 0.00 | 48 |
| Sailing vessel, mono-hull | Fin keel, shoal draft | | 0.040 | 0.00 | 48 |
| Power vessel, skiff | Flat bottom (Boston whaler) | | 0.034 | 0.04 | 22 |
| Power vessel, skiff | V-hull, standard configuration | | 0.030 | 0.08 | 15 |
| Power vessel, skiff | V-hull, swamped | | 0.017 | 0.00 | 15 |
| Power vessel | Sport boat, cuddy cabin, modified V-hull | | 0.069 | -0.08 | 19 |
| Power vessel | Sport fisher, center console, open cockpit | | 0.060 | -0.09 | 22 |
| Commercial fishing vessel | (general) | | 0.037 | 0.02 | 48 |
| Commercial fishing vessel | Sampan | | 0.040 | 0.00 | 48 |
| Commercial fishing vessel | Side/stern trawler | | 0.042 | 0.00 | 48 |
| Commercial fishing vessel | Longliner | | 0.037 | 0.00 | 48 |
| Commercial fishing vessel | Junk | | 0.027 | 0.10 | 48 |
| Commercial fishing vessel | Gill-netter w/ rear reel | | 0.040 | 0.01 | 33 |
| Commercial fishing vessel | Coastal freighter | | 0.028 | 0.00 | 48 |
| Boating debris | F/V debris | | 0.020 | 0.00 | 10 |
| Boating debris | Bait/wharf box (holds 1 m³ ice) | | 0.013 | 0.27 | 31 |
| Boating debris | Bait/wharf box, lightly loaded | | 0.026 | 0.18 | 15 |
| Boating debris | Bait/wharf box, fully loaded | | 0.016 | 0.16 | 33 |

### Sub-table: maritime life rafts with deep ballast systems and canopies (Table D-5:2)

| Capacity | Drogue / loading | Multiplier | Modifier | Divergence angle (deg) |
|---|---|---|---|---|
| 4-6 person | (base) | 0.029 | 0.04 | 15 |
| 4-6 person | without drogue, light loading | 0.038 | -0.04 | 15 |
| 4-6 person | without drogue, heavy loading | 0.036 | -0.03 | 15 |
| 4-6 person | with drogue, light loading | 0.018 | 0.03 | 12 |
| 4-6 person | with drogue, heavy loading | 0.016 | 0.05 | 24 |
| 4-6 person | with drogue, heavy loading (alt.) | 0.021 | 0.00 | 20 |
| 15-25 person | without drogue, light loading | 0.036 | -0.09 | 10 |
| 15-25 person | without drogue, light loading (alt.) | 0.039 | -0.06 | 9 |
| 15-25 person | with drogue, heavy loading | 0.031 | -0.07 | 9 |
| 15-25 person | Capsized | 0.009 | 0.00 | 12 |
| 15-25 person | Swamped | 0.010 | -0.04 | 8 |

Source note in the manual: these leeway values are adapted from Allen and Plourde 1999 ("Review of Leeway: Field Experiments and Implementation," USCG R&D Centre Report No. CG-D-08-99), the same origin as IAMSAR's own leeway tables.

---

## 2. Sweep width tables

Formula: **Sweep width (W) = Uncorrected sweep width (W0) x Weather correction factor x Fatigue correction factor**

### 2.1 Visual search over water, vessel-based (Table D-5:3), nm

Columns are meteorological visibility in km/nm, at two observer eye heights.

| Search object | 2/1.1 (8ft) | 5/2.7 | 10/5.4 | 15/8.1 | 20/10.8 | >25/13.5 | 2/1.1 (14ft) | 5/2.7 | 10/5.4 | 15/8.1 | 20/10.8 | >25/13.5 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Person in water | 0.2 | 0.2 | 0.3 | 0.3 | 0.3 | 0.3 | 0.3 | 0.4 | 0.5 | 0.6 | 0.6 | 0.6 |
| Life raft, 1 person | 0.7 | 1.2 | 1.8 | 2.1 | 2.4 | 2.5 | 1.0 | 1.6 | 2.5 | 2.9 | 3.2 | 3.3 |
| Life raft, 4 person | 0.8 | 1.5 | 2.3 | 2.9 | 3.2 | 3.4 | 1.1 | 2.0 | 3.1 | 3.8 | 4.2 | 4.4 |
| Life raft, 6 person | 0.9 | 1.7 | 2.7 | 3.4 | 3.8 | 4.1 | 1.2 | 2.2 | 3.5 | 4.4 | 5.0 | 5.3 |
| Life raft, 8 person | 0.9 | 1.7 | 2.8 | 3.5 | 4.0 | 4.2 | 1.2 | 2.3 | 3.6 | 4.5 | 5.1 | 5.4 |
| Life raft, 10 person | 0.9 | 1.8 | 2.9 | 3.7 | 4.2 | 4.6 | 1.2 | 2.3 | 3.7 | 4.7 | 5.4 | 5.8 |
| Life raft, 15 person | 1.0 | 2.0 | 3.2 | 4.0 | 4.5 | 4.9 | 1.2 | 2.5 | 4.0 | 5.1 | 5.7 | 6.2 |
| Life raft, 20 person | 1.0 | 2.1 | 3.5 | 4.4 | 5.1 | 5.6 | 1.3 | 2.6 | 4.3 | 5.7 | 6.4 | 6.9 |
| Life raft, 25 person | 1.0 | 2.2 | 3.7 | 4.7 | 5.5 | 6.0 | 1.3 | 2.7 | 4.3 | 5.8 | 6.7 | 7.5 |
| Power boat <5m | 0.5 | 0.7 | 1.0 | 1.2 | 1.3 | 1.4 | 0.5 | 1.0 | 1.5 | 1.8 | 1.9 | 2.0 |
| Power boat 5-8m | 0.8 | 1.4 | 2.3 | 2.9 | 3.4 | 3.8 | 1.0 | 1.9 | 3.0 | 3.9 | 4.5 | 5.0 |
| Power boat 8-12m | 0.8 | 1.8 | 3.1 | 4.1 | 4.9 | 5.6 | 1.2 | 2.3 | 4.0 | 5.3 | 6.4 | 7.3 |
| Power boat 12-20m | 0.9 | 2.2 | 4.2 | 5.9 | 7.4 | 8.7 | 1.2 | 3.0 | 5.4 | 7.6 | 9.6 | 11.3 |
| Power boat 20-27m | 0.9 | 2.3 | 4.6 | 6.8 | 8.8 | 10.6 | 1.2 | 3.0 | 6.0 | 8.7 | 11.3 | 13.6 |
| Sail boat 5m | 0.8 | 1.4 | 2.2 | 2.7 | 3.1 | 3.4 | 1.0 | 1.8 | 2.8 | 3.5 | 4.1 | 4.5 |
| Sail boat 6m | 0.8 | 1.6 | 2.6 | 3.3 | 3.9 | 4.4 | 1.1 | 2.0 | 3.3 | 4.3 | 5.0 | 5.6 |
| Sail boat 8m | 0.9 | 1.8 | 2.9 | 3.9 | 4.6 | 5.1 | 1.1 | 2.2 | 3.8 | 5.0 | 5.9 | 6.7 |
| Sail boat 9m | 0.9 | 2.0 | 3.4 | 4.6 | 5.5 | 6.3 | 1.2 | 2.5 | 4.4 | 5.9 | 7.1 | 8.1 |
| Sail boat 12m | 0.9 | 2.2 | 4.1 | 5.7 | 7.0 | 8.1 | 1.3 | 2.8 | 5.2 | 7.2 | 9.0 | 10.5 |
| Sail boat 15m | 0.9 | 2.2 | 4.3 | 6.1 | 7.7 | 9.1 | 1.2 | 2.9 | 5.2 | 7.9 | 9.9 | 11.7 |
| Sail boat 20-23m | 0.9 | 2.3 | 4.5 | 6.5 | 8.3 | 9.9 | 1.2 | 3.0 | 5.8 | 8.4 | 10.8 | 12.9 |
| Sail boat 23-27m | 0.9 | 2.4 | 4.7 | 6.8 | 8.9 | 10.7 | 1.2 | 3.1 | 6.1 | 8.9 | 11.5 | 13.8 |

Note: a sailboat is only classed as a sailboat if its sails are up; otherwise use the power boat row for the same size.

### 2.2 Visual search over water, merchant ship bridge height (Table D-5:5), nm

| Search object | 5 km | 10 km | 20 km | 30 km | 40 km |
|---|---|---|---|---|---|
| Person in water | 0.4 | 0.5 | 0.6 | 0.7 | 0.7 |
| 4-person life raft | 2.3 | 3.2 | 4.2 | 4.9 | 5.5 |
| 6-person life raft | 2.5 | 3.6 | 5.0 | 6.2 | 6.9 |
| 15-person life raft | 2.6 | 4.0 | 5.1 | 6.4 | 7.3 |
| 25-person life raft | 2.7 | 4.2 | 5.2 | 6.5 | 7.5 |
| Boat <5m | 1.1 | 1.4 | 1.9 | 2.1 | 2.3 |
| Boat <7m | 2.0 | 2.9 | 4.3 | 5.2 | 5.8 |
| Boat <12m | 2.8 | 4.5 | 7.6 | 9.4 | 11.6 |
| Boat <24m | 3.2 | 5.6 | 10.7 | 14.7 | 18.1 |

### 2.3 Fixed-wing aircraft, nm (Table D-5:6, condensed to the two most-used altitudes)

Visibility columns: 2, 5, 10, 20, 30, >40 km.

**At 500 ft**
| Search object | 2 | 5 | 10 | 20 | 30 | >40 |
|---|---|---|---|---|---|---|
| Person in water | 0.0 | 0.1 | 0.1 | 0.1 | 0.1 | 0.1 |
| Life raft, 6 person | 0.4 | 1.1 | 1.5 | 2.2 | 2.5 | 2.8 |
| Life raft, 25 person | 0.5 | 1.6 | 2.3 | 3.4 | 4.1 | 4.6 |
| Power boat 8-12m | 0.6 | 2.1 | 3.3 | 5.3 | 6.7 | 7.7 |
| Ship >91m | 0.7 | 3.0 | 5.8 | 13.2 | 20.6 | 27.9 |

**At 1500 ft**
| Search object | 2 | 5 | 10 | 20 | 30 | >40 |
|---|---|---|---|---|---|---|
| Person in water | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.1 |
| Life raft, 6 person | 0.3 | 1.1 | 1.6 | 2.3 | 2.6 | 2.9 |
| Life raft, 25 person | 0.4 | 1.6 | 2.4 | 3.6 | 4.3 | 4.8 |
| Power boat 8-12m | 0.5 | 2.2 | 3.4 | 5.5 | 6.8 | 7.9 |
| Ship >91m | 0.6 | 3.0 | 5.8 | 13.2 | 20.7 | 27.9 |

Note: for 500 ft only, multiply the person-in-water value by 4 if the person is known to be wearing a flotation device. Full tables (all four altitudes: 500/1000/1500/2000 ft) are in the source PDF, Appendix D-5, Tables D-5:6(1) and D-5:6(2), pages 406 and 408.

### 2.4 Helicopters, maritime, nm (Table D-5:7, condensed)

**At 500 ft**
| Search object | 2 | 5 | 10 | 20 | 30 | >40 |
|---|---|---|---|---|---|---|
| Person in water | 0.0 | 0.1 | 0.1 | 0.1 | 0.1 | 0.1 |
| Life raft, 6 person | 0.5 | 1.4 | 1.9 | 2.7 | 3.2 | 3.5 |
| Life raft, 25 person | 0.6 | 1.9 | 2.7 | 4.1 | 5.0 | 5.6 |
| Power boat 8-12m (10 ft craft row) | 0.8 | 2.5 | 3.9 | 6.2 | 7.8 | 9.0 |
| Ship >91m | 0.8 | 3.5 | 6.4 | 14.3 | 22.1 | 29.8 |

Full tables (500/1000/1500/2000 ft) are in the source PDF, Appendix D-5, Tables D-5:7(1) and D-5:7(2), pages 410 and 412.

### 2.5 Visual search over land, nm (Table D-5:9)

| Search object | Height (ft) | 5 km | 10 km | 20 km | 30 km | 40 km |
|---|---|---|---|---|---|---|
| Person | 500 | 0.4 | 0.4 | 0.5 | 0.5 | 0.5 |
| Person | 1000 | 0.4 | 0.4 | 0.5 | 0.5 | 0.5 |
| Vehicle | 500 | 0.9 | 1.3 | 1.3 | 1.3 | 1.3 |
| Vehicle | 2000 | 1.0 | 1.5 | 2.0 | 2.0 | 2.0 |
| Aircraft <5700kg | 2000 | 1.0 | 1.6 | 2.0 | 2.0 | 2.0 |
| Aircraft >5700kg | 2000 | 2.2 | 2.9 | 3.5 | 3.5 | 3.5 |

Vegetation/terrain correction factor (Table D-5:10) multiplies these:

| Search object | <15% veg / open | 15-60% veg / hilly | 60-85% veg / mountainous | >85% veg / rainforest |
|---|---|---|---|---|
| Person | 0.8 | 0.5 | 0.3 | 0.1 |
| Vehicle | 1.0 | 0.7 | 0.4 | 0.1 |
| Aircraft <5700kg | 1.0 | 0.7 | 0.4 | 0.1 |
| Aircraft >5700kg | 1.0 | 0.8 | 0.4 | 0.1 |

---

## 3. Correction factors (apply to all sweep widths above)

### Weather correction factor (Table D-5:4)

| Conditions | Person in water, raft, or boat <10m | Other search objects |
|---|---|---|
| Winds <28 km/h (<15 kt) or seas 0-1m | 1.0 | 1.0 |
| Winds 28-46 km/h (15-25 kt) or seas 1-1.5m | 0.5 | 0.8 |
| Winds >46 km/h (>25 kt) or seas >1.5m | 0.25 | 0.5 |

The manual flags this explicitly: **this table differs from IAMSAR** for "other search objects" in winds over 15kt. It's the Australian council's own adjustment based on observed SAR outcomes, not an IAMSAR figure.

### Fatigue correction factor

| Crew fatigue a factor? | Multiplier |
|---|---|
| No | 1.0 |
| Yes | 0.9 |

---

## 4. Position error tables (Appendix D-6)

### Fix error by means of navigation (Table D-6:1)

| Means of navigation | Fix error |
|---|---|
| GPS | 0.1 nm |
| RADAR | 1 nm |
| Visual fix (3 lines) | 1 nm |
| Celestial fix (3 lines) | 2 nm |
| Marine radio beacon (3-beacon fix) | 4 nm |
| INS | 0.5 nm per flight hour without update |
| VOR | ±3° arc and 3% of distance, or 0.5 nm radius, whichever is greater |
| TACAN | ±3° arc and 3% of distance, or 0.5 nm radius, whichever is greater |

The manual notes this table is **its own variant, not IAMSAR's** — JRCC Australia found it more practical to base fix error on the navigation equipment actually carried.

### Fix error when means of navigation is unknown (Table D-6:2)

| Type of craft | Fix error |
|---|---|
| Ships, military submarines | 5 nm radius |
| Aircraft, self-contained navigation | 5 nm radius |
| Aircraft, other | 10 nm radius |
| Small craft, submersibles | 15 nm radius |

### Dead reckoning error (Table D-6:3)

| Type of craft | DR error |
|---|---|
| Ship, military submarine | Last fix error + 5% of distance since that fix |
| Aircraft | Last fix error + 10% of distance since that fix |
| Small craft, submersibles | Last fix error + 15% of distance since that fix |

Practical defaults used elsewhere in the manual when the method is simply unknown: **X = 5 nm** (target), **Y = 1 nm** (search asset, since search craft take near-continuous GPS fixes).

---

## 5. Safety factor / optimal search factor (Table 3-2)

This is the manual's discretized stand-in for IAMSAR's continuous optimal-search-factor graph (Figure N-5/N-6). Instead of reading fs off a curve against cumulative relative effort, it steps fs up by search stage:

| Search stage | Safety factor (fs) |
|---|---|
| Initial probability area | 1.1 |
| First expansion | 1.6 |
| Second expansion | 2.0 |
| Third expansion | 2.3 |
| Final expansion | 2.5 |

Search radius R = E x fs. Note: JRCC Australia's own computer-generated search planning does not use this stepped table; it's provided for manual/coastal planning. The app should treat this as a sensible default curve for fs, with the field still manually editable per 6.8.

---

## 6. What's still not digitized here

Two IAMSAR-equivalent components in this manual are presented as graphs/figures rather than tables, so they aren't reproduced as numbers above:

- **Figure D-5:1**, Local Wind Current Graph (estimates wind current from sustained surface wind).
- **Figure D-5:13**, Probability of Detection curve.

If the team wants these digitized too, the source PDF page images can be extracted and the curves read off manually, or the team can supply a licensed IAMSAR copy with the same figures at higher resolution.

---

## 7. How this maps to the PRD's formula list

Everything in this file plugs into PRD section 14 as follows: the leeway table (section 1 here) supplies leeway multiplier, modifier, and divergence angle; the sweep width tables (section 2) plus correction factors (section 3) build W in Z = W x V x T; the position error tables (section 4) supply X and Y for E = sqrt(X² + De² + Y²); and the safety factor table (section 5) supplies fs for Ro = fs x E.
