/**
 * Indonesian for the labels that originate in the engine's reference tables.
 *
 * Keyed by the English original rather than by an id, because the engine is a
 * standalone, language-free module: its rows carry the source manual's own
 * wording, and translating in the engine would put a UI concern inside the
 * calculation. Looking the English up here keeps the engine untouched and its
 * tests meaningful.
 *
 * Every lookup falls back to the English original, so a row added to a table
 * and not translated shows the manual's own wording instead of nothing. That
 * matters more here than elsewhere: these strings name what the crew is
 * looking for.
 *
 * Composite labels (a leeway category plus its sub-category plus a
 * descriptor) are translated part by part and reassembled by the caller, so
 * the table can grow without every combination needing an entry.
 */

export const DATA_ID: Record<string, string> = {
  // --- leeway categories, Table D-5:1/2 ----------------------------------
  'Person in water': 'Orang di air',
  'Maritime life raft, no ballast': 'Rakit penolong maritim, tanpa pemberat',
  'Maritime life raft, shallow ballast + canopy':
    'Rakit penolong maritim, pemberat dangkal + kanopi',
  'Maritime life raft, deep ballast + canopy': 'Rakit penolong maritim, pemberat dalam + kanopi',
  'Life raft, deep ballast + canopy, 4-6 person':
    'Rakit penolong, pemberat dalam + kanopi, 4-6 orang',
  'Life raft, deep ballast + canopy, 15-25 person':
    'Rakit penolong, pemberat dalam + kanopi, 15-25 orang',
  'Aviation life raft, no ballast w/ canopy':
    'Rakit penolong penerbangan, tanpa pemberat dengan kanopi',
  'Other maritime survival craft': 'Wahana penyelamat maritim lainnya',
  'Person-powered craft': 'Wahana bertenaga manusia',
  'Sailing vessel, mono-hull': 'Kapal layar, lambung tunggal',
  'Power vessel': 'Kapal bermotor',
  'Power vessel, skiff': 'Kapal bermotor, perahu kecil',
  'Commercial fishing vessel': 'Kapal ikan komersial',
  'Boating debris': 'Serpihan kapal',

  // --- leeway sub-categories ---------------------------------------------
  '4-6 person': '4-6 orang',
  'Bait/wharf box (holds 1 m3 ice)': 'Kotak umpan/dermaga (muat 1 m3 es)',
  'Bait/wharf box, fully loaded': 'Kotak umpan/dermaga, muatan penuh',
  'Bait/wharf box, lightly loaded': 'Kotak umpan/dermaga, muatan ringan',
  Base: 'Dasar',
  'Canopy, no drogue': 'Berkanopi, tanpa jangkar apung',
  'Canopy, with drogue': 'Berkanopi, dengan jangkar apung',
  Capsized: 'Terbalik',
  'Coastal freighter': 'Kapal barang pantai',
  'Evac/slide': 'Seluncur evakuasi',
  'F/V debris': 'Serpihan kapal ikan',
  'Fin keel, shoal draft': 'Lunas sirip, sarat dangkal',
  'Flat bottom (Boston whaler)': 'Dasar rata (Boston whaler)',
  'Full keel, deep draft': 'Lunas penuh, sarat dalam',
  General: 'Umum',
  'Gill-netter w/ rear reel': 'Kapal jaring insang dengan gulungan belakang',
  Horizontal: 'Horizontal',
  Junk: 'Kapal jung',
  'Life capsule': 'Kapsul penyelamat',
  Longliner: 'Kapal rawai',
  'No canopy, no drogue': 'Tanpa kanopi, tanpa jangkar apung',
  'No canopy, with drogue': 'Tanpa kanopi, dengan jangkar apung',
  'No drogue': 'Tanpa jangkar apung',
  Sampan: 'Sampan',
  'Sea kayak w/ person on aft deck': 'Kayak laut dengan orang di dek belakang',
  'Side/stern trawler': 'Pukat samping/buritan',
  Sitting: 'Duduk',
  'Sport boat, cuddy cabin, modified V-hull': 'Perahu sport, kabin kecil, lambung V modifikasi',
  'Sport fisher, center console, open cockpit':
    'Perahu pancing sport, konsol tengah, kokpit terbuka',
  'Surfboard w/ person': 'Papan selancar dengan orang',
  Swamped: 'Terisi air',
  'USCG sea rescue kit': 'Perangkat penyelamat laut USCG',
  'V-hull, standard configuration': 'Lambung V, konfigurasi standar',
  'V-hull, swamped': 'Lambung V, terisi air',
  Vertical: 'Vertikal',
  'Windsurfer w/ person, mast and sail in water':
    'Selancar angin dengan orang, tiang dan layar di air',
  'With drogue': 'Dengan jangkar apung',
  'Without drogue': 'Tanpa jangkar apung',
  'Unlabelled row': 'Baris tanpa label',
  'second dataset, label unconfirmed': 'kumpulan data kedua, label belum dipastikan',
  'label unconfirmed in source': 'label belum dipastikan di sumber',
  'With drogue, heavy loading': 'Dengan jangkar apung, muatan berat',
  'With drogue, light loading': 'Dengan jangkar apung, muatan ringan',
  'Without drogue, heavy loading': 'Tanpa jangkar apung, muatan berat',
  'Without drogue, light loading': 'Tanpa jangkar apung, muatan ringan',

  // --- leeway descriptors -------------------------------------------------
  Deceased: 'Meninggal',
  'Deceased (second dataset, label unconfirmed)':
    'Meninggal (kumpulan data kedua, label belum dipastikan)',
  'Scuba suit': 'Pakaian selam',
  'Survival suit': 'Pakaian penyelamat',
  'see 4-6 / 15-25 person rows for detail': 'lihat baris 4-6 / 15-25 orang untuk rincian',
  'variant a': 'varian a',
  'variant b': 'varian b',

  'see the 4-6 / 15-25 person rows for detail': 'lihat baris 4-6 / 15-25 orang untuk rincian',
  '4-6 person, without drogue': '4-6 orang, tanpa jangkar apung',
  'Evac/slide, 46-person': 'Seluncur evakuasi, 46 orang',
  'Sport fisher, centre console, open cockpit':
    'Perahu pancing sport, konsol tengah, kokpit terbuka',
  'Side-stern trawler': 'Pukat samping/buritan',

  // --- sweep width tables, Appendix D-7 -----------------------------------
  'Vessel, visual over water, observer eye height 8 ft':
    'Kapal, visual di atas air, tinggi mata pengamat 8 ft',
  'Vessel, visual over water, observer eye height 14 ft':
    'Kapal, visual di atas air, tinggi mata pengamat 14 ft',
  'Merchant ship bridge height, visual over water':
    'Kapal niaga setinggi anjungan, visual di atas air',
  'Fixed-wing aircraft at 500 ft, over water': 'Pesawat sayap tetap pada 500 ft, di atas air',
  'Fixed-wing aircraft at 1500 ft, over water': 'Pesawat sayap tetap pada 1500 ft, di atas air',
  'Helicopter at 500 ft, over water': 'Helikopter pada 500 ft, di atas air',
  'Visual search over land, 500 ft': 'Pencarian visual di atas darat, 500 ft',
  'Visual search over land, 1000 ft': 'Pencarian visual di atas darat, 1000 ft',
  'Visual search over land, 2000 ft': 'Pencarian visual di atas darat, 2000 ft',

  // --- sweep width search objects -----------------------------------------
  '15-person life raft': 'Rakit penolong 15 orang',
  '25-person life raft': 'Rakit penolong 25 orang',
  '4-person life raft': 'Rakit penolong 4 orang',
  '6-person life raft': 'Rakit penolong 6 orang',
  'Aircraft <5700kg': 'Pesawat <5700 kg',
  'Aircraft >5700kg': 'Pesawat >5700 kg',
  'Boat <5m': 'Perahu <5 m',
  'Boat <7m': 'Perahu <7 m',
  'Boat <12m': 'Perahu <12 m',
  'Boat <24m': 'Perahu <24 m',
  'Life raft, 1 person': 'Rakit penolong, 1 orang',
  'Life raft, 4 person': 'Rakit penolong, 4 orang',
  'Life raft, 6 person': 'Rakit penolong, 6 orang',
  'Life raft, 8 person': 'Rakit penolong, 8 orang',
  'Life raft, 10 person': 'Rakit penolong, 10 orang',
  'Life raft, 15 person': 'Rakit penolong, 15 orang',
  'Life raft, 20 person': 'Rakit penolong, 20 orang',
  'Life raft, 25 person': 'Rakit penolong, 25 orang',
  Person: 'Orang',
  'Power boat <5m': 'Perahu motor <5 m',
  'Power boat 5-8m': 'Perahu motor 5-8 m',
  'Power boat 8-12m': 'Perahu motor 8-12 m',
  'Power boat 12-20m': 'Perahu motor 12-20 m',
  'Power boat 20-27m': 'Perahu motor 20-27 m',
  'Sail boat 5m': 'Perahu layar 5 m',
  'Sail boat 6m': 'Perahu layar 6 m',
  'Sail boat 8m': 'Perahu layar 8 m',
  'Sail boat 9m': 'Perahu layar 9 m',
  'Sail boat 12m': 'Perahu layar 12 m',
  'Sail boat 15m': 'Perahu layar 15 m',
  'Sail boat 20-23m': 'Perahu layar 20-23 m',
  'Sail boat 23-27m': 'Perahu layar 23-27 m',
  'Ship >91m': 'Kapal >91 m',
  Vehicle: 'Kendaraan',

  'Ship 27-46m': 'Kapal 27-46 m',
  'Ship 46-91m': 'Kapal 46-91 m',
  'Fixed-wing aircraft at 1000 ft, over water': 'Pesawat sayap tetap pada 1000 ft, di atas air',
  'Fixed-wing aircraft at 2000 ft, over water': 'Pesawat sayap tetap pada 2000 ft, di atas air',
  'Helicopter at 1000 ft, over water': 'Helikopter pada 1000 ft, di atas air',
  'Helicopter at 1500 ft, over water': 'Helikopter pada 1500 ft, di atas air',
  'Helicopter at 2000 ft, over water': 'Helikopter pada 2000 ft, di atas air',
  'Visual search over land, 1500 ft': 'Pencarian visual di atas darat, 1500 ft',
  'At 500 ft only, this value may be multiplied by 4 if the person is known to be wearing a flotation device.':
    'Hanya pada 500 ft, nilai ini boleh dikalikan 4 bila orang diketahui memakai alat apung.',

  // --- sweep width footnotes ----------------------------------------------
  'Source row is the 10 ft craft row.': 'Baris sumber adalah baris wahana 10 ft.',

  // --- fix error, Table D-6:1 / D-6:2 --------------------------------------
  'Visual fix (3 lines)': 'Penentuan visual (3 garis)',
  'Celestial fix (3 lines)': 'Penentuan benda langit (3 garis)',
  'Marine radio beacon (3-beacon fix)': 'Suar radio maritim (penentuan 3 suar)',
  '0.5 nm per flight hour without update': '0,5 nm per jam terbang tanpa pembaruan',
  '+/-3 deg arc and 3% of distance, or 0.5 nm radius, whichever is greater':
    'busur +/-3 derajat dan 3% dari jarak, atau radius 0,5 nm, mana yang lebih besar',
  'Ships, military submarines': 'Kapal, kapal selam militer',
  'Ship, military submarine': 'Kapal, kapal selam militer',
  'Aircraft, self-contained navigation': 'Pesawat, navigasi mandiri',
  'Aircraft, other': 'Pesawat, lainnya',
  Aircraft: 'Pesawat',
  'Small craft, submersibles': 'Wahana kecil, kapal selam kecil',

  // --- weather correction bands, Table D-5:4 -------------------------------
  'Winds <28 km/h (<15 kt) or seas 0-1 m': 'Angin <28 km/jam (<15 kt) atau gelombang 0-1 m',
  'Winds 28-46 km/h (15-25 kt) or seas 1-1.5 m':
    'Angin 28-46 km/jam (15-25 kt) atau gelombang 1-1,5 m',
  'Winds >46 km/h (>25 kt) or seas >1.5 m': 'Angin >46 km/jam (>25 kt) atau gelombang >1,5 m',

  // --- terrain classes ------------------------------------------------------
  '<15% vegetation / open': 'vegetasi <15% / terbuka',
  '15-60% vegetation / hilly': 'vegetasi 15-60% / berbukit',
  '60-85% vegetation / mountainous': 'vegetasi 60-85% / pegunungan',
  '>85% vegetation / rainforest': 'vegetasi >85% / hutan hujan',
  // --- map overlay labels produced by the engine's geometry ----------------
  'Search area': 'Area pencarian',
  'Combined search area': 'Area pencarian gabungan',
  'Area A (left divergence datum)': 'Area A (datum divergensi kiri)',
  'Area B (right divergence datum)': 'Area B (datum divergensi kanan)',
  'Line search area': 'Area pencarian garis',
  'Probable error E': 'Galat perkiraan E',
  'Probable error E (left datum)': 'Galat perkiraan E (datum kiri)',
  'Probable error E (right datum)': 'Galat perkiraan E (datum kanan)',
  'Drift track': 'Jalur hanyut',
  'Drift track (left of downwind)': 'Jalur hanyut (kiri dari arah angin)',
  'Drift track (right of downwind)': 'Jalur hanyut (kanan dari arah angin)',
  'Drift track (line end point)': 'Jalur hanyut (titik ujung garis)',
};
