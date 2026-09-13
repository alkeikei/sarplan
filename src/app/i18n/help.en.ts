/**
 * English help content: the text behind every "?" in the app.
 *
 * The audience is not only a trained SAR coordinator. Someone who has never
 * run a search plan should be able to hover a "?" and learn what the field
 * means, what to type into it, and where the app's own answer came from,
 * without opening the manual.
 *
 * House rules for writing an entry:
 *   what      one or two sentences, no jargon that is not immediately
 *             unpacked. Say what the quantity IS before saying what it does.
 *   entering  what the user should actually do. Omit on read-only results.
 *   formula   the arithmetic, in the same notation the panels use. Plain
 *             ASCII: this string is also safe to reuse in the PDF, whose
 *             built-in font has no square-root or sigma glyph.
 *   source    where the app's automatic value comes from, so a user can see
 *             it is a table lookup and not an opinion.
 *
 * Keep these honest. Where the reference tables leave a figure undigitised
 * (LWe, POD, fv) the entry says so rather than implying a lookup exists.
 *
 * This is the source of truth for the id set: help.id.ts is typed against it,
 * so an entry added here and not translated fails the build.
 */

export interface HelpEntry {
  title: string;
  what: string;
  entering?: string;
  formula?: string;
  source?: string;
}

export const HELP_EN = {
  /* ---------------------------------------------------------------- case */

  caseName: {
    title: 'Case name',
    what: 'A label for this search, used in the case list and at the top of the exported report. It changes nothing in the calculation.',
    entering:
      'Anything you will recognise later, such as the vessel name, the incident number, or the date and area.',
  },

  distressType: {
    title: 'Distress type',
    what: 'How well you know where the search object started drifting. A last known position is an observed fix; an estimated initial position is a best guess; continuing from a previous datum means this search starts where an earlier search calculation ended.',
    entering:
      'Pick the one that matches your information. It decides which position you place on the map next, and it is how you should read the start point error X: a guessed position deserves a much larger X than an observed fix.',
  },

  searchObject: {
    title: 'Search object',
    what: 'What you are looking for: a person in the water, a particular size of life raft, a fishing vessel, and so on. Different objects sit differently in the water, so the wind pushes them at different speeds and angles.',
    entering:
      'Choose the closest match. Picking the object fills in the three leeway coefficients below from the table; you can still edit any of them.',
    source: 'Leeway table, AMSA National SAR Manual 2023, Appendix D-5.',
  },

  leewayMultiplier: {
    title: 'Leeway multiplier',
    what: 'The fraction of the wind speed that this object drifts at. A multiplier of 0.03 means the object moves downwind at about 3% of the wind speed.',
    entering:
      'Filled in from the search object you chose. Override it only if you have a better figure for this particular object.',
    formula: 'leeway speed = (multiplier x wind speed) + modifier',
  },

  leewayModifier: {
    title: 'Leeway modifier',
    what: 'A small fixed correction, in knots, added to the multiplier result. It is part of the same table row as the multiplier and is usually negative.',
    entering: 'Filled in from the search object. Edit only with a better source.',
    formula: 'leeway speed = (multiplier x wind speed) + modifier',
  },

  leewayDivergence: {
    title: 'Leeway divergence angle',
    what: 'Objects rarely drift straight downwind. Most crab off to one side, and which side is unpredictable, so the planner assumes both. This angle is how far off downwind the object may track, left or right.',
    entering:
      'Filled in from the search object. A larger angle spreads the two possible datums further apart.',
    formula: 'one datum at (downwind - angle), one at (downwind + angle)',
  },

  applyDivergence: {
    title: 'Apply leeway divergence',
    what: 'Whether to plan for the object having crabbed to either side of downwind, giving two datums, or to treat it as drifting straight downwind, giving one.',
    entering:
      'Leave it on unless you have a reason to believe the object tracks straight downwind. Switching it off forces the divergence distance DD to zero and a single point datum, which gives a smaller search area but assumes more than you probably know.',
  },

  /* --------------------------------------------------------- start point */

  startPoint: {
    title: 'Drifting start point',
    what: 'The position the object was at when it began drifting: the last known position, the estimated initial position, or a previous datum. Everything downstream is measured from here.',
    entering:
      'Drop a pin on the map, drag the existing pin, or type the latitude and longitude. Positive latitude is north, positive longitude is east. The map and the boxes always agree; use whichever is easier.',
  },

  distressTime: {
    title: 'Distress time',
    what: 'When the object was at the drifting start point, that is, when it began to drift.',
    entering:
      'Enter it in UTC, not local time. It is also the time used when fetching the wind, so that the wind matches the start of the drift.',
  },

  searchStartTime: {
    title: 'Search start time',
    what: 'When the search facilities will actually be on scene and looking.',
    entering:
      'Enter it in UTC. The gap between this and the distress time is how long the object has been drifting, which is what moves the datum away from the start point.',
  },

  driftTime: {
    title: 'Drift time',
    what: 'How many hours the object has been drifting: the search start time minus the distress time. It scales both how far the datum moves and how uncertain that position is.',
    entering:
      'Calculated from the two times above. Override it if you want to plan for a different on-scene time without changing the times themselves.',
    formula: 'drift error De = Dve x drift time',
  },

  lineDatumEnd: {
    title: 'Line datum end point',
    what: 'Use this when the object was somewhere along a track rather than at a single spot, for example an aircraft or vessel overdue on a known route. The whole line drifts, and you search a long rectangle along it instead of a square around a point.',
    entering:
      'Add the end point, then place it at the other end of the track. You must also set the datum type to "Line datum" on the Datum step for it to be used.',
  },

  /* --------------------------------------------------------- environment */

  windSpeed: {
    title: 'Wind speed',
    what: 'The average surface wind over the drift period, in knots. Wind is what pushes the object across the water, so this is usually the largest single influence on where the datum lands.',
    entering:
      'Fetch it from Open-Meteo for the start position and distress time, or type your own. A fetched value is tagged with its source; typing over it re-tags the field as a manual entry.',
    source: 'Open-Meteo forecast API, 10 m wind, nearest hour to the distress time.',
  },

  windDirection: {
    title: 'Wind direction',
    what: 'The direction the wind is blowing FROM, in degrees true. This is the meteorological convention: a wind of 090 is an easterly, blowing from the east toward the west.',
    entering:
      'Degrees true, not magnetic. Everywhere else in this app a direction is the direction something moves toward; wind is the one exception, and it is labelled "from" wherever it appears.',
  },

  windSteadiness: {
    title: 'Wind steadiness',
    what: 'How much you trust the wind figure. A measured, steady wind is worth more than a forecast for a gusty day, and that difference becomes part of the error budget.',
    entering:
      'Choose "steady" for an observed or gradually changing wind, "variable" for a forecast or a wind that has been shifting. It sets ASWDve, the drift error contributed by the wind: 0.3 kt or 0.5 kt.',
    formula: 'Dve = sqrt(ASWDve^2 + TWCe^2 + LWe^2)',
  },

  visibility: {
    title: 'Meteorological visibility',
    what: 'How far a searcher can see, in kilometres. It is the main thing that decides how wide a strip of sea each facility can effectively search.',
    entering:
      'Enter the visibility expected on scene. It is read straight into the sweep width table for every facility, so changing it changes every W0 at once.',
  },

  seaHeight: {
    title: 'Significant sea height',
    what: 'The wave height on scene, in metres. Rough seas hide a small object between the swells, which cuts how far away it can be spotted.',
    entering:
      'Optional. Tick the box to use it, then enter the height. The weather correction factor fw then takes the worse of the wind band and the sea band. Left off, fw comes from the wind alone.',
  },

  currents: {
    title: 'Water currents',
    what: 'Wind pushes the object across the water; the water itself also moves, carrying the object with it. These four components are added together as vectors to give the total water current.',
    entering:
      'Manual entry in this build: no live ocean current source is wired up. Enter what you have from tidal atlases, current charts or local knowledge, and leave a component at zero if it does not apply.',
    formula: 'drift = leeway + total water current',
  },

  currentTidal: {
    title: 'Tidal current',
    what: 'The back-and-forth flow caused by the tide. It dominates near coasts, in channels and in estuaries, and is close to nothing in the open ocean.',
    entering: 'From a tidal atlas or tidal stream diamond for the area and the state of the tide.',
  },

  currentSea: {
    title: 'Sea current',
    what: 'The large-scale ocean circulation: the steady, more or less permanent flow of a current system. It matters most offshore, where the tide does not.',
    entering: 'From a current chart or pilot for the area.',
  },

  currentWind: {
    title: 'Wind current',
    what: 'The thin surface layer of water that the wind itself drags along. This is water moving, which is different from the wind pushing the object directly; that is leeway and it is handled separately.',
    entering:
      'Estimated from the wind that has been blowing over the last day or so, not just the wind right now.',
  },

  currentOther: {
    title: 'Other water current',
    what: 'Anything else moving the water: river outflow, harbour flushing, a local eddy.',
    entering: 'Leave at zero unless you know of something specific.',
  },

  currentSpeed: {
    title: 'Current speed',
    what: 'How fast this component of the water is moving, in knots.',
    entering: 'Zero if this component does not apply here.',
  },

  currentSet: {
    title: 'Sets toward',
    what: 'The direction the water is flowing TOWARD, in degrees true. A current setting 180 flows toward the south.',
    entering:
      'Degrees true. Note this is the opposite convention to the wind, which is given as the direction it blows from.',
  },

  currentError: {
    title: 'Probable error of the current',
    what: 'How wrong this current figure might be, in knots. It does not move the datum; it widens the circle of uncertainty around it.',
    entering:
      'Defaults to 0.3 kt, which is what the manual suggests when you have no better estimate. Lower it if the figure is measured, raise it if it is a guess.',
    formula: 'TWCe = sqrt(tidal^2 + sea^2 + wind^2 + other^2)',
  },

  lwe: {
    title: 'LWe, leeway error',
    what: 'How wrong the leeway estimate might be, in knots. Leeway depends on how the object floats, how loaded it is and how the waves are running, none of which you can see from the coordination centre.',
    entering:
      'Read from the search object you chose, as the error of the leeway regression measured for that craft type. Editable. A craft the source has no row for falls back to 0.3 kt, and a row whose error the source prints only as a floor is flagged as a minimum rather than a measurement.',
    formula: 'Dve = sqrt(ASWDve^2 + TWCe^2 + LWe^2)',
    source: 'Allen & Plourde 1999, USCG R&D Center CG-D-08-99, Table 8-1.',
  },

  positionError: {
    title: 'Position error',
    what: 'Two separate uncertainties: X, how well you know where the object started, and Y, how well the searching facility will know where it itself is. Both make the search area larger.',
    formula: 'E = sqrt(X^2 + De^2 + Y^2)',
  },

  xSource: {
    title: 'X source: how the start point was fixed',
    what: 'What kind of position report the drifting start point came from. A GPS fix is worth a few hundred metres; a bearing from a passing ship, or a position relayed over a poor radio, could be many miles out.',
    entering:
      'Pick the method used. It fills in X from the fix error table. Some entries are stated in the manual as a rule rather than a number, and those show the rule text instead of a fabricated figure: type your own X in that case.',
    source: 'Fix error table, AMSA National SAR Manual 2023, Table D-6:1.',
  },

  x: {
    title: 'X, drifting start point error',
    what: 'How far the true starting position might be from the one you entered, in nautical miles.',
    entering:
      'Filled in from the X source above. Override it freely. If you are continuing from a previous datum, set X to that search’s total probable error E.',
  },

  ySource: {
    title: 'Y source: how the facility fixes its position',
    what: 'How the searching facility knows where it is. A crew that is slightly lost searches slightly the wrong piece of sea, so their navigation accuracy is part of the error budget too.',
    entering:
      'Pick the navigation method the facility will use. Most modern facilities are on GPS, which gives a small Y.',
  },

  y: {
    title: 'Y, search facility position error',
    what: 'How far the facility might be from where it believes it is, in nautical miles.',
    entering: 'Filled in from the Y source above, and editable.',
  },

  /* --------------------------------------------------------------- datum */

  datum: {
    title: 'Datum',
    what: 'The single most likely position of the search object right now: the start point, moved along by the wind and the water for the length of the drift time. It is the centre of the search, not a promise.',
    formula: 'datum = start point + (leeway + total water current) x drift time',
  },

  driftDistance: {
    title: 'Drift',
    what: 'How far the object has moved from the start point, in nautical miles, and in which direction. It is the combined effect of the wind pushing the object and the water carrying it.',
    formula: 'drift vector = leeway vector + total water current vector',
  },

  leewaySpeed: {
    title: 'Leeway',
    what: 'The speed at which the wind alone pushes the object through the water, in knots, and the direction it pushes it. The divergence angle is how far either side of straight downwind the object may actually track.',
    formula: 'leeway = (multiplier x wind speed) + modifier',
  },

  e: {
    title: 'E, total probable error',
    what: 'The single number that says how uncertain the datum is, in nautical miles. It combines the three independent uncertainties: where the object started, how far it has drifted, and where the searcher thinks it is. It is the radius the whole search area is built from.',
    formula: 'E = sqrt(X^2 + De^2 + Y^2)',
  },

  de: {
    title: 'De, drift error',
    what: 'How far the drift calculation itself could be wrong, in nautical miles. The longer the object has been drifting, the more a small error in the estimated drift speed grows: this is why a search launched late needs a much larger area.',
    formula: 'De = Dve x drift time',
  },

  dve: {
    title: 'Dve, drift velocity error',
    what: 'How wrong the estimated drift SPEED might be, in knots. Three things are uncertain and none depends on the others: the wind, the water current, and the leeway behaviour of the object. They are combined as a root sum of squares rather than added, because they are unlikely all to be wrong in the same direction at once.',
    formula: 'Dve = sqrt(ASWDve^2 + TWCe^2 + LWe^2)',
  },

  twce: {
    title: 'TWCe, total water current error',
    what: 'The combined uncertainty of the four water current components, in knots.',
    formula: 'TWCe = sqrt(tidal^2 + sea^2 + wind^2 + other^2)',
  },

  dd: {
    title: 'DD, divergence distance',
    what: 'How far apart the two divergence datums are, in nautical miles: the gap between where the object ends up if it crabbed left and where it ends up if it crabbed right. For a line datum, DD is the length of the drifted line instead.',
    formula: 'DD = distance between the left and right datums',
  },

  sr: {
    title: 'SR, separation ratio',
    what: 'DD measured in units of E: it asks whether the two possible datums are far apart compared with how uncertain each one is. Below 4 their uncertainty circles overlap enough that one combined area covers both. At 4 and above they are genuinely separate places and are searched as two independent areas.',
    formula: 'SR = DD / E',
  },

  datumType: {
    title: 'Datum type',
    what: 'Which shape of search area to build. Single point gives a square around one datum. Leeway divergence gives one stretched rectangle covering both. Widely diverging gives two separate squares. Line datum gives a long rectangle along a track.',
    entering:
      'Chosen automatically from the separation ratio. Override it if local knowledge says otherwise, for example to force a line datum for an overdue vessel on a known route.',
  },

  /* ---------------------------------------------------------- facilities */

  facilities: {
    title: 'Search facilities',
    what: 'The aircraft, vessels and ground parties assigned to this search. Together they decide how much sea can actually be covered, which is what turns an uncertainty circle into a practical search area.',
    entering:
      'Add one per facility. The datum and the probable error do not need any; the coverage factor and track spacing do.',
    formula: 'Zta = Z of facility 1 + Z of facility 2 + ...',
  },

  assetName: {
    title: 'Facility name',
    what: 'A label for this facility, used in the results, on the map legend and in the report.',
    entering: 'The callsign or the vessel or aircraft name.',
  },

  sweepTable: {
    title: 'Sensor platform and height',
    what: 'What is doing the looking, and from how high. A helicopter at 500 feet sees a much wider strip than a lookout on a small boat, and each combination has its own table of sweep widths.',
    entering:
      'Pick the platform and altitude or eye height that matches. It sets which sweep width table W0 is read from.',
    source: 'Sweep width tables, AMSA National SAR Manual 2023, Appendix D-7.',
  },

  sweepObject: {
    title: 'Search object, as the table names it',
    what: 'The sweep width tables use their own list of object sizes, which is coarser than the leeway table. This is the row of the table to read.',
    entering:
      'Pick the closest match to what you are looking for. It can differ from the search object chosen on the Case step: that one sets how the object drifts, this one sets how easily it is seen.',
  },

  w0: {
    title: 'W0, uncorrected sweep width',
    what: 'The width of the strip of sea this facility can effectively search in one pass, in nautical miles, before any allowance for weather, speed or a tired crew. Not how far you can see: it already allows for the fact that objects are missed even inside the strip.',
    entering:
      'Read from the table for the platform, the object and the visibility. If the visibility falls between two columns the value is interpolated and flagged as such. Override it if you have a better figure.',
  },

  weatherObjectClass: {
    title: 'Weather correction applies to',
    what: 'Small objects are hidden by waves and whitecaps far more readily than large ones, so the weather penalty differs. This picks which of the two weather bands to use.',
    entering:
      'Choose the small-object band for a person in the water, a life raft or a boat under 10 m; the other band for anything larger. Asked once on the Case step, because it describes the search object rather than the facility, and every facility inherits it.',
  },

  fw: {
    title: 'fw, weather correction factor',
    what: 'How much the weather cuts the sweep width. 1.0 means no penalty; 0.5 means rough conditions have halved the strip this facility can usefully search.',
    entering:
      'Looked up from the wind speed, and from the sea height if you have enabled it, taking whichever is worse. Editable.',
    source: 'Weather correction table, AMSA National SAR Manual 2023, Appendix D-7.',
  },

  fv: {
    title: 'fv, speed correction factor',
    what: 'An allowance for the speed the facility searches at. Go faster and the crew has less time over each patch of sea, so the effective strip narrows; go slowly and it widens.',
    entering:
      'Read from the facility\'s platform and search speed. The table covers aircraft searching for maritime objects only, so a vessel, or an aircraft searching over land, takes 1.0 and says so. A speed between two printed columns is interpolated and flagged. Editable.',
    source: 'Speed correction factors, AMSA National SAR Manual 2026, Table D-5:8.',
  },

  ff: {
    title: 'ff, fatigue correction factor',
    what: 'An allowance for a tired crew, who miss more. 1.0 means a fresh crew.',
    entering: 'Set by the crew fatigue checkbox below, and editable.',
  },

  crewFatigue: {
    title: 'Crew fatigue',
    what: 'Whether this crew has been working long enough for their detection performance to have dropped, for example late in a long multi-sortie day.',
    entering: 'Ticking it sets the fatigue correction factor ff below.',
  },

  assetSpeed: {
    title: 'V, search speed',
    what: 'The speed the facility will fly or steam while actually searching, in knots. Not its transit or maximum speed.',
    entering: 'A realistic on-task search speed.',
    formula: 'Z = W x V x T',
  },

  assetEndurance: {
    title: 'T, search endurance',
    what: 'How many hours this facility can spend searching on scene, in hours. Not total endurance: subtract the transit out and back, and any reserve.',
    entering: 'Hours actually available over the search area.',
    formula: 'Z = W x V x T',
  },

  w: {
    title: 'W, corrected sweep width',
    what: 'The sweep width after weather, speed and fatigue have been allowed for: the strip this facility can really search today, in nautical miles.',
    formula: 'W = W0 x fw x fv x ff',
  },

  z: {
    title: 'Z, search effort',
    what: 'How much sea this facility can cover, in square nautical miles: its effective strip width multiplied by how fast it goes and for how long. This is the facility’s contribution to the search.',
    formula: 'Z = W x V x T',
  },

  /* --------------------------------------------------------- search area */

  searchStage: {
    title: 'Search stage',
    what: 'Which round of searching this is. The first search covers the most likely ground tightly; if the object is not found, each later search expands outward to cover the possibility that the datum itself was wrong.',
    entering:
      'Start at the initial probability area. Step up only after a search has been flown and found nothing.',
    source: 'Safety factor table, AMSA National SAR Manual 2023, Table 3-2.',
  },

  fs: {
    title: 'fs, optimal search factor',
    what: 'How many times the probable error E to make the search radius. A low fs searches a small area thoroughly; a high fs searches a large area thinly. It steps up as the search expands.',
    entering: 'Set by the search stage above, and editable.',
    formula: 'Ro = fs x E',
  },

  ro: {
    title: 'Ro, optimal search radius',
    what: 'The half-width of the search area, in nautical miles: how far out from the datum to search.',
    formula: 'Ro = fs x E',
  },

  ao: {
    title: 'Ao, optimal search area',
    what: 'The total area to be searched, in square nautical miles. Its shape depends on the datum type: a square around a single datum, a stretched rectangle covering two diverging datums, two separate squares, or a long rectangle along a line.',
    formula:
      'single point: Ao = 4Ro^2 | divergence: Ao = 4Ro^2 + 2 x Ro x DD | line: Ao = 2 x Ro x L',
  },

  co: {
    title: 'Co, coverage factor',
    what: 'How thoroughly the area will be searched: all the effort available, divided by the area to cover. Above 1 the facilities can cover the area more than once over. Below 1 they cannot cover it even once, so the tracks are spaced wider than the sweep width and gaps are left between them.',
    entering:
      'Below 0.5 the app raises a warning: the source manual states that such a coverage is unsatisfactory in itself and that searching an area at less than 0.5 is not recommended. Add effort or reduce the area rather than accepting it.',
    formula: 'Co = Zta / Ao',
  },

  zta: {
    title: 'Zta, total available effort',
    what: 'All the search effort you have, in square nautical miles: every facility’s effort added together.',
    formula: 'Zta = Z of facility 1 + Z of facility 2 + ...',
  },

  fz: {
    title: 'fz, effort factor',
    what: 'The size of the problem, in square nautical miles, used as the yardstick for how much effort is enough. For a point datum it is E squared; for a line datum it is E times the line length L.',
    formula: 'point: fz = E^2 | line: fz = E x L, where L = DD + 2E',
  },

  zr: {
    title: 'Zr, relative effort',
    what: 'Effort measured against the size of the problem. It answers "is this enough for a search this uncertain?" better than the raw hours do: 40 units of effort is generous for a tight datum and thin for a vague one.',
    formula: 'Zr = Zta / fz',
  },

  zrc: {
    title: 'Zrc, cumulative relative effort',
    what: 'Relative effort added up across every search so far, this one included. It is what tells you how much has already been invested in this datum, and in the full IAMSAR method it is what the optimal search factor is read against.',
    formula: 'Zrc = Zr of search 1 + Zr of search 2 + ...',
  },

  searchCondition: {
    title: 'Search condition',
    what: 'Whether conditions are working for you or against you. "Ideal" means none of the three correction factors is cutting the sweep width; "normal" means at least one is.',
    formula: 'ideal when fw, fv and ff are all 1 or above',
  },

  so: {
    title: 'So, optimal track spacing',
    what: 'How far apart to fly or steam the parallel search legs, in nautical miles. Each facility gets its own spacing, from its own corrected sweep width: a helicopter that sees a wide strip flies wider legs than a small boat covering the same area.',
    formula: 'So = W / Co',
  },

  poc: {
    title: 'POC, probability of containment',
    what: 'The chance, between 0 and 1, that the search object is actually inside the area you are going to search. Even a perfect search of the wrong piece of sea finds nothing.',
    entering:
      'A judgement call. A search area built at the recommended radius around a sound datum is usually taken as high; lower it if you doubt the datum itself.',
  },

  pod: {
    title: 'POD, probability of detection',
    what: 'The chance, between 0 and 1, that the searchers spot the object given that it is inside the area and they pass over it. It rises with the coverage factor: search the same water twice and you are more likely to see it.',
    entering:
      'A manual entry: the detection curve is a graph the manual does not tabulate. It does print two points, shown under the field, which are the anchors to judge against: a single search achieves 78% at a coverage factor of 1.0 and 47% at 0.5. The app will not interpolate between them or extrapolate beyond them.',
    source: 'Table 4-2, Coverage Data Example, AMSA National SAR Manual 2026.',
  },

  pos: {
    title: 'POS, probability of success',
    what: 'The overall chance this search finds the object: the chance it is in the area, multiplied by the chance you see it if it is. This is the number to compare one plan against another with.',
    formula: 'POS = POC x POD',
  },

  /* -------------------------------------------------------------- export */

  report: {
    title: 'The exported report',
    what: 'A PDF search plan holding the inputs used, the full calculation chain, every facility, the calculated positions, and a picture of the map as it looks on screen.',
    entering:
      'Set the map up the way you want it first: the capture follows your current pan, zoom and layer toggles. The report always uses the inputs from the last calculation, so recalculate first if you have edited anything since.',
  },

  staleness: {
    title: 'Why results go amber',
    what: 'Changing an input does not silently move the numbers underneath you. Anything calculated from a value you have just changed is flagged as out of date, and keeps showing the old answer, until you press Recalculate.',
    entering: 'Press Recalculate in the header when you are ready to see the new numbers.',
  },
} as const satisfies Record<string, HelpEntry>;

export type HelpId = keyof typeof HELP_EN;
