/**
 * Indonesian UI dictionary.
 *
 * Typed against the English key set, so a key added there and forgotten here
 * fails the build instead of rendering blank.
 *
 * Terminology follows Indonesian SAR usage rather than literal translation:
 * a search facility is an "unsur SAR", a probable error is a "galat", and the
 * notation symbols (E, Ro, Ao, Co, So, DD, SR, W0, fw, fv, ff, Zta, POC, POD,
 * POS) are left alone because they are international notation read off the
 * same manual in either language. Loanwords already standard in the field -
 * datum, leeway, sweep width, knot - are kept and glossed in the help text
 * rather than replaced with coinages a crew would not recognise.
 *
 * Table references (Table D-6:1, Table 3-2) stay in English: they are
 * citations into an English source manual, and a translated table name cannot
 * be looked up.
 */

import type { TextKey } from './en';

export const id: Record<TextKey, string> = {
  // --- shell -------------------------------------------------------------
  'app.tagline': 'Perencanaan pencarian optimal · IAMSAR',
  'app.language': 'Bahasa',
  'app.saving': 'Menyimpan…',
  'app.savedAt': 'Tersimpan {time}',
  'app.calculatedIn': 'Dihitung {time} dalam {ms} ms',
  'app.notCalculated': 'Belum dihitung',
  'app.changesPending': '{count} perubahan belum dihitung',
  'app.changesPending.plural': '{count} perubahan belum dihitung',
  'app.changedFields': 'Berubah: {fields}',
  'app.recalculate': 'Hitung ulang',
  'app.cases': 'Kasus…',
  'app.newCase': 'Kasus baru',
  'app.hidePanel': '◀ Sembunyikan',
  'app.hidePanelTitle': 'Sembunyikan panel dan beri peta seluruh jendela',
  'app.showPanel': '▶ Tampilkan panel',
  'app.restoring': 'Memulihkan kasus terakhir…',
  'app.back': '← Kembali',
  'app.next': 'Lanjut: {step} →',
  'app.developedBy': 'Dikembangkan oleh',
  'app.planningAidShort':
    'Hanya alat bantu perencanaan, bukan penentuan resmi. Setiap nilai otomatis dapat diubah.',
  'app.planningAid':
    'Hanya alat bantu perencanaan. Keluaran ini mendukung penilaian koordinator pencarian; bukan penentuan resmi di mana objek pencarian berada. Setiap nilai otomatis dalam laporan ini dapat diubah dan mungkin telah diganti secara manual.',

  // --- steps -------------------------------------------------------------
  'nav.case': 'Kasus',
  'nav.case.title': 'Kasus baru',
  'nav.start': 'Titik awal',
  'nav.start.title': 'Titik awal hanyut',
  'nav.environment': 'Lingkungan',
  'nav.environment.title': 'Lingkungan dan galat',
  'nav.datum': 'Datum',
  'nav.datum.title': 'Hasil datum',
  'nav.assets': 'Unsur SAR',
  'nav.assets.title': 'Unsur SAR',
  'nav.area': 'Area pencarian',
  'nav.area.title': 'Hasil area pencarian',
  'nav.export': 'Ekspor',
  'nav.export.title': 'Ekspor rencana pencarian',

  // --- shared primitives -------------------------------------------------
  'ui.autoFilledFrom': 'Terisi otomatis dari {source}',
  'ui.manualOverride': 'Diisi manual',
  'ui.resetToAuto': 'Kembalikan ke otomatis',
  'ui.resetToAutoValue': 'Kembalikan ke otomatis ({value})',
  'ui.stale': 'Usang',
  'ui.helpAria': 'Apa itu {title}?',
  'ui.helpWhatToDo': 'Yang harus dilakukan:',
  'ui.helpSource': 'Sumber: {source}',
  'ui.helpDismiss': 'Klik ? lagi, atau tekan Esc, untuk menutup.',

  // --- stale notice ------------------------------------------------------
  'stale.title': 'Hasil ini sudah usang',
  'stale.titleNever': 'Belum dihitung',
  'stale.body':
    'Masukan berubah sejak perhitungan terakhir. Tidak ada yang dihitung ulang sendiri, agar Anda bisa melihat dulu apa yang berubah.',
  'stale.bodyNever': 'Jalankan perhitungan untuk menghasilkan datum dan area pencarian.',
  'stale.failed': 'Perhitungan tidak dapat dijalankan',

  // --- case step ---------------------------------------------------------
  'section.case': 'Kasus',
  'section.case.sub': 'Beri nama kasus ini dan tentukan jenis posisi musibah yang Anda miliki.',
  'case.defaultName': 'Kasus tanpa nama',
  'case.newNamed': 'Kasus {stamp}',
  'field.caseName': 'Nama kasus',
  'field.distressType': 'Jenis posisi musibah',
  'field.distressType.hint':
    'Menentukan posisi mana yang Anda tandai berikutnya dan bagaimana galat titik awal X diambil.',
  'note.previousDatum':
    'Melanjutkan dari datum sebelumnya: isi X dengan total galat perkiraan E dari pencarian tersebut, dengan mengganti galat titik awal hanyut pada langkah Lingkungan.',
  'section.searchObject': 'Objek pencarian',
  'section.searchObject.sub':
    'Menentukan koefisien leeway. Setiap koefisien tetap dapat diubah.',
  'field.objectType': 'Jenis objek',
  'field.leewayMultiplier': 'Pengali',
  'field.leewayModifier': 'Penambah',
  'field.leewayDivergence': 'Divergensi',
  'field.applyDivergence': 'Terapkan divergensi leeway (dua datum)',
  'note.leewayFormula':
    'Kecepatan leeway = (pengali × kecepatan angin) ± penambah. Mematikan divergensi memaksa DD = 0 dan datum titik tunggal.',

  // --- start point step --------------------------------------------------
  'section.startPoint': 'Titik awal hanyut',
  'action.dropPin': 'Tandai di peta',
  'action.clickMap': 'Klik peta…',
  'action.moveEndPoint': 'Pindahkan titik ujung',
  'field.latitude': 'Lintang',
  'field.longitude': 'Bujur',
  'field.endLatitude': 'Lintang ujung',
  'field.endLongitude': 'Bujur ujung',
  'unit.degTrue': 'derajat sejati',
  'unit.hours': 'jam',
  'unit.deg': 'derajat',
  'unit.degNorth': 'derajat, + utara',
  'unit.degEast': 'derajat, + timur',
  'note.pinOrType':
    'Geser penanda di peta atau ketik posisinya di sini. Keduanya bisa dipakai bergantian.',
  'section.driftTime': 'Lama hanyut',
  'section.driftTime.sub':
    'Waktu musibah sampai waktu mulai pencarian. Menentukan De = Dve × lama hanyut.',
  'field.distressTime': 'Waktu musibah',
  'field.searchStartTime': 'Waktu mulai pencarian',
  'field.driftTime': 'Lama hanyut',
  'section.lineDatum': 'Datum garis (opsional)',
  'section.lineDatum.sub':
    'Tandai titik kedua untuk mencari sepanjang jalur, bukan di satu titik.',
  'action.removeLineEnd': 'Hapus titik ujung garis',
  'action.addLineEnd': 'Tambah titik ujung garis',
  'note.lineDatum':
    'Pilih jenis datum “Datum garis” pada langkah Datum untuk memakainya. Seluruh garis ikut hanyut bersama datum, dan DD menjadi panjang garis setelah hanyut.',

  // --- environment step --------------------------------------------------
  'section.wind': 'Angin',
  'section.wind.sub':
    'Satu-satunya sumber data langsung di versi ini. Setiap kolom tetap dapat diubah.',
  'action.fetchWind': 'Ambil dari Open-Meteo',
  'action.fetching': 'Mengambil…',
  'field.windSpeed': 'Kecepatan angin',
  'field.windFrom': 'Angin dari arah',
  'field.windSteadiness': 'Kemantapan angin',
  'field.windSteadiness.hint':
    'Menentukan ASWDve, galat kecepatan hanyut yang berasal dari angin permukaan.',
  'source.windFetched': '{source}, diambil {time}',
  'section.seaState': 'Keadaan laut dan jarak pandang',
  'section.seaState.sub':
    'Jarak pandang menentukan pencarian sweep width; tinggi gelombang dapat menentukan fw. Tinggi gelombang diisi manual.',
  'field.visibility': 'Jarak pandang meteorologis',
  'field.seaHeight': 'Tinggi gelombang signifikan',
  'field.seaHeight.off': 'Tidak dipakai: fw diambil dari pita angin saja.',
  'field.seaHeight.on': 'Yang lebih buruk antara pita angin dan pita gelombang menentukan fw.',
  'field.useSeaHeight': 'Pakai tinggi gelombang dalam faktor koreksi cuaca',
  'section.currents': 'Arus air',
  'section.currents.sub':
    'Isian manual di versi ini: belum ada sumber arus laut langsung. Arah yang diisi adalah arah arus mengalir menuju.',
  'current.tidal': 'Arus pasang surut',
  'current.sea': 'Arus laut',
  'current.wind': 'Arus akibat angin',
  'current.other': 'Arus air lainnya',
  'field.currentSpeed': 'Kecepatan',
  'field.currentSet': 'Mengalir ke',
  'field.currentError': 'Galat perkiraan',
  'section.leewayError': 'Galat leeway',
  'section.leewayError.sub': 'LWe masuk ke Dve = sqrt(ASWDve² + TWCe² + LWe²).',
  'field.lwe': 'LWe',
  'section.positionError': 'Galat posisi',
  'section.positionError.sub':
    'X untuk titik awal hanyut, Y untuk unsur SAR. Keduanya masuk ke E.',
  'field.xSource': 'Sumber X: bagaimana titik awal ditentukan',
  'field.x': 'X, galat titik awal hanyut',
  'field.ySource': 'Sumber Y: bagaimana unsur SAR menentukan posisinya sendiri',
  'field.y': 'Y, galat posisi unsur SAR',

  // --- datum step --------------------------------------------------------
  'section.datum': 'Datum',
  'section.datum.sub': 'Tempat objek pencarian paling mungkin berada saat ini.',
  'metric.datumPosition': 'Posisi datum',
  'metric.datumLeft': 'Datum, kiri dari arah angin',
  'metric.datumRight': 'Datum, kanan dari arah angin',
  'metric.drift': 'Hanyut',
  'metric.drift.sub': 'Menuju {bearing} pada {speed} kt',
  'metric.leeway': 'Leeway',
  'metric.leeway.sub': 'Searah angin {bearing}, divergensi ±{angle}°',
  'section.probableError': 'Galat perkiraan',
  'metric.datumType': 'Jenis datum',
  'metric.e': 'E, total galat perkiraan',
  'metric.de': 'De, galat hanyut',
  'metric.dve': 'Dve, galat kecepatan hanyut',
  'metric.twce': 'TWCe, galat arus air',
  'metric.x': 'X, galat titik awal',
  'metric.y': 'Y, galat unsur SAR',
  'section.datumType': 'Jenis datum',
  'section.datumType.sub':
    'SR = DD / E. Di bawah 4 kedua datum divergensi berbagi satu area; pada 4 ke atas keduanya dicari terpisah.',
  'metric.dd': 'DD, jarak divergensi',
  'metric.sr': 'SR, rasio pemisahan',
  'metric.sr.above': 'Sama dengan atau di atas 4',
  'metric.sr.below': 'Di bawah 4',
  'field.datumType': 'Jenis datum',
  'field.datumType.hint':
    'Dipilih otomatis dari SR. Ganti bila pengetahuan lapangan menunjukkan lain.',
  'opt.datumTypeAuto': 'Otomatis ({type})',
  'source.separationRatio': 'rasio pemisahan {value}',
  'note.lineDatumNoEnd':
    'Datum garis tanpa titik ujung memakai DD = 0, sehingga L = 2E. Tandai titik ujung pada langkah Titik awal untuk mencari sepanjang jalur sebenarnya.',

  // --- facilities step ---------------------------------------------------
  'section.facilities': 'Unsur SAR',
  'section.facilities.sub':
    'Setiap unsur menyumbang Z = W × V × T ke total daya pencarian tersedia Zta.',
  'action.addFacility': 'Tambah unsur',
  'action.remove': 'Hapus',
  'note.noFacilities':
    'Belum ada unsur yang ditugaskan. Datum dan galat perkiraan tetap dihitung; area pencarian memerlukan setidaknya satu unsur untuk menghasilkan faktor cakupan dan jarak antar lintasan.',
  'field.facilityName': 'Nama',
  'facility.fallbackName': 'Unsur {n}',
  'field.sweepTable': 'Wahana sensor dan ketinggian / tinggi mata pengamat',
  'field.sweepObject': 'Objek pencarian, sesuai penamaan tabel sweep width',
  'field.w0': 'W0, sweep width belum terkoreksi',
  'field.w0.hint': 'Dibaca pada jarak pandang {km} km, diatur di langkah Lingkungan.',
  'field.weatherObjectClass': 'Koreksi cuaca berlaku untuk',
  'field.fw': 'fw, cuaca',
  'field.fv': 'fv, kecepatan',
  'field.ff': 'ff, kelelahan',
  'field.crewFatigued': 'Kelelahan awak menjadi faktor',
  'field.assetSpeed': 'V, kecepatan pencarian',
  'field.assetEndurance': 'T, lama pencarian',
  'source.noFvTable': 'tidak ada tabel sumber; bawaan 1,0',

  // --- search area step --------------------------------------------------
  'section.searchFactor': 'Faktor pencarian',
  'section.searchFactor.sub': 'fs naik bertahap saat pencarian diperluas. Ro = fs × E.',
  'field.searchStage': 'Tahap pencarian',
  'field.fs': 'fs, faktor pencarian optimal',
  'section.searchArea': 'Area pencarian',
  'metric.ro': 'Ro, radius optimal',
  'metric.ao': 'Ao, area optimal',
  'metric.co': 'Co, faktor cakupan',
  'metric.co.below': 'Di bawah 1: jarak lintasan lebih lebar daripada sweep width',
  'metric.co.unsatisfactory': 'Di bawah 0,5: manual tidak menganjurkan pencarian pada cakupan ini',
  'note.coverageTooLow':
    'Manual sumber menyatakan bahwa faktor cakupan di bawah 0,5 tidak memadai dengan sendirinya dan pencarian area pada nilai di bawah 0,5 tidak dianjurkan. Tambah daya pencarian, atau perkecil areanya, sebelum menetapkan rencana ini.',
  'field.pod.reference': 'Manual mencetak dua titik: {points}.',
  'metric.zta': 'Zta, total daya pencarian',
  'section.effort': 'Daya pencarian',
  'section.effort.sub': 'fz, daya pencarian relatif dan relatif kumulatif.',
  'metric.fz': 'fz, faktor daya pencarian',
  'metric.zr': 'Zr, daya pencarian relatif',
  'metric.zrc': 'Zrc, kumulatif',
  'metric.searchCondition': 'Kondisi pencarian',
  'metric.searchCondition.sub': 'fw, fv, ff semuanya ≥ 1 berarti ideal',
  'opt.conditionIdeal': 'Ideal',
  'opt.conditionNormal': 'Normal',
  'section.trackSpacing': 'Jarak antar lintasan',
  'section.trackSpacing.sub':
    'So = W / Co, per unsur, dari sweep width terkoreksi unsur itu sendiri.',
  'note.needFacility':
    'Tambahkan unsur SAR untuk mendapatkan faktor cakupan dan jarak antar lintasan.',
  'asset.summary': 'W {w} nm · Z {z} nm² · {share} dari Zta',
  'asset.summaryLegs': '{legs} lintasan berjarak {spacing} nm, total {total} nm',
  'section.evaluation': 'Evaluasi',
  'section.evaluation.sub':
    'POS = POC × POD. POD diisi manual: kurva deteksi tidak didigitalkan dalam tabel acuan.',
  'field.poc': 'POC, probabilitas keberadaan',
  'field.pod': 'POD, probabilitas deteksi',
  'metric.pos': 'POS, probabilitas keberhasilan',

  // --- export step -------------------------------------------------------
  'section.export': 'Ekspor',
  'section.export.sub':
    'PDF rencana pencarian berisi masukan yang dipakai, seluruh rantai perhitungan, daftar unsur, dan tampilan peta.',
  'action.exportPdf': 'Ekspor PDF',
  'action.generating': 'Membuat…',
  'note.calculateFirst': 'Jalankan perhitungan terlebih dahulu.',
  'note.exportStale':
    'Laporan akan memakai masukan dari perhitungan terakhir, bukan perubahan setelahnya. Hitung ulang dulu bila ingin masukan terkini yang masuk.',
  'note.exportMapHint':
    'Peta diambil persis seperti tampilan di layar saat ini, termasuk lapisan yang aktif. Geser, perbesar dan atur lapisan sesuai keinginan sebelum mengekspor.',
  'export.savedWithMap': 'Laporan tersimpan, lengkap dengan tampilan peta.',
  'export.savedWithoutMap':
    'Laporan tersimpan tanpa tampilan peta{reason}. Laporan hanya berisi teks; setiap posisi hasil perhitungan tetap tercantum di dalamnya.',
  'export.failed': 'Laporan tidak dapat dibuat.',
  'section.reportPreview': 'Pratinjau laporan',
  'section.reportPreview.sub': 'Dihitung {time} dalam {ms} ms',
  'section.reportNote': 'Catatan yang dibawa setiap laporan',

  // --- map ---------------------------------------------------------------
  'map.offArchive':
    'Tidak ada peta dasar di sini. Arsip petak hanya mencakup satu wilayah; perhitungan tidak terpengaruh.',
  'map.layers': 'Lapisan',
  'map.driftTrack': 'Jalur hanyut',
  'map.errorCircle': 'Lingkaran galat (E)',
  'map.searchArea': 'Area pencarian optimal',
  'map.trackLines': 'Garis jarak lintasan',
  'map.datum': 'Datum',
  'map.startPoint': 'Titik awal',
  'map.fitToResults': 'Sesuaikan ke hasil',
  'map.tracksAll': 'Lintasan: semua unsur',
  'map.tracksOne': 'Lintasan: {name}',
  'map.placeStart': 'Klik peta untuk menandai titik awal hanyut',
  'map.placeLineEnd': 'Klik peta untuk menandai titik ujung garis',
  'map.startPointTip': 'Titik awal hanyut',
  'map.lineEndTip': 'Titik ujung datum garis',
  'map.datumLeftTip': 'Datum (kiri dari arah angin)',
  'map.datumRightTip': 'Datum (kanan dari arah angin)',
  'map.driftTrackTip': '{label}: {distance} nm',
  'map.rectTip': '{label}: {width} × {length} nm',
  'map.circleTip': '{label}: {radius} nm',
  'map.legsTip': '{name}: {legs} lintasan berjarak {spacing} nm',
  'map.legsTipStride':
    '{name}: {legs} lintasan berjarak {spacing} nm (digambar tiap ke-{stride})',

  // --- enumerated options ------------------------------------------------
  'opt.distress.lkp': 'Posisi terakhir diketahui (LKP)',
  'opt.distress.eip': 'Hanya perkiraan posisi awal (EIP)',
  'opt.distress.previousDatum': 'Melanjutkan dari datum sebelumnya',
  'opt.steadiness.steady': 'Angin mantap atau berubah perlahan (0,3 kt)',
  'opt.steadiness.variable': 'Angin prakiraan atau sangat berubah-ubah (0,5 kt)',
  'opt.datumType.singlePoint': 'Datum titik tunggal',
  'opt.datumType.leewayDivergence': 'Datum divergensi leeway',
  'opt.datumType.widelyDiverging': 'Datum divergensi lebar',
  'opt.datumType.line': 'Datum garis',
  'opt.weatherClass.small': 'Orang di air, rakit penolong, atau perahu <10 m',
  'opt.weatherClass.other': 'Objek pencarian lainnya',
  'opt.stage.initial': 'Area probabilitas awal',
  'opt.stage.firstExpansion': 'Perluasan pertama',
  'opt.stage.secondExpansion': 'Perluasan kedua',
  'opt.stage.thirdExpansion': 'Perluasan ketiga',
  'opt.stage.finalExpansion': 'Perluasan terakhir',
  'opt.stageWithFs': '{label} (fs {fs})',
  'group.navMeans': 'Sarana navigasi (Table D-6:1)',
  'group.navUnknown': 'Navigasi tidak diketahui, menurut wahana (Table D-6:2)',
  'platform.vesselWater': 'Kapal, visual di atas air',
  'platform.merchantShip': 'Kapal niaga',
  'platform.fixedWing': 'Pesawat sayap tetap',
  'platform.helicopter': 'Helikopter',
  'platform.land': 'Di atas darat',

  // --- provenance labels built by the selectors --------------------------
  'source.distressToStart': 'Waktu musibah sampai waktu mulai pencarian',
  'source.leewayTable': 'Tabel leeway D-5:1/2',
  'source.lweTable': 'Allen & Plourde 1999, Table 8-1 baris {ref}',
  'source.lweDefault': 'bawaan 0,3 kt — Table 8-1 tidak punya baris untuk objek ini',
  'source.lweFloor':
    'Sumber mencetak Sy/x sebagai batas bawah (> {syx} cm/detik), bukan hasil pengukuran, sehingga LWe ini adalah nilai minimum, bukan angka pasti.',
  'field.lwe.caption': 'Per jenis wahana dari {source}. Domain publik.',
  'source.safetyTable': 'Faktor keselamatan Table 3-2',
  'source.manualEntry': 'Isian manual',
  'source.currentDefault': 'bawaan 0,3 kt, dipakai bila tidak ada perkiraan yang lebih baik',
  'source.fixError': '{label}, {table}',
  'source.fixErrorRule':
    '{label}: sumber memberi aturan, bukan nilai tetap - {rule}. Masukkan angka hasil hitungan.',
  'source.weatherClassFromCase': 'objek pencarian, diatur pada langkah Kasus',
  'source.fixEvaluateUpward':
    'Sumber menandai angka ini untuk dinaikkan sesuai keadaan, dan menyatakan bahwa setiap galat penentuan posisi pada Table D-6:1 sampai D-6:3 adalah nilai minimum.',
  'source.fvTable': 'Table D-5:8, {row}',
  'source.fvNoRow':
    'bawaan 1,0 — Table D-5:8 hanya mencakup pesawat yang mencari objek maritim',
  'source.fvInterpolated':
    'Diinterpolasi antara kecepatan pencarian yang dicetak Table D-5:8, untuk {speed} kt.',
  'source.sweepWidthTable': 'Tabel sweep width',
  'source.sweepWidthFrom': '{table}, {platform}',
  'source.noTableRow': 'Tidak ada baris tabel yang cocok - isi W0 secara manual',
  'source.interpolated': 'Diinterpolasi antara kolom tetangga {km} km dalam tabel.',
  'source.weatherBand': 'Table D-5:4, {band}, berdasarkan {drivenBy}',
  'source.fatigueTired': 'tabel kelelahan: awak lelah',
  'source.fatigueRested': 'tabel kelelahan: awak segar',
  'drivenBy.wind': 'angin',
  'drivenBy.sea': 'gelombang',

  // --- BMKG visibility ---------------------------------------------------
  'bmkg.badTime': 'Waktu yang diminta tidak valid.',
  'bmkg.unreachable':
    'Tidak dapat menghubungi BMKG. Masukkan jarak pandang secara manual; isian manual adalah jalur penuh, bukan cadangan.',
  'bmkg.httpStatus': 'BMKG mengembalikan {status}. Masukkan jarak pandang secara manual.',
  'bmkg.noPorts': 'BMKG tidak mengembalikan daftar pelabuhan, sehingga pelabuhan terdekat tidak dapat ditemukan.',
  'bmkg.noVisibility': 'BMKG tidak memiliki angka jarak pandang untuk {port} saat ini.',
  'bmkg.farPort':
    'Pelabuhan BMKG terdekat adalah {port}, {distance} nm dari titik awal hanyut. Jarak pandang di pelabuhan mungkin berbeda dengan di lokasi kejadian.',
  'bmkg.outsidePeriod':
    'Tidak ada periode BMKG yang mencakup waktu mulai pencarian; memakai {from} sampai {to}.',
  'bmkg.failed': 'Pengambilan jarak pandang gagal. Masukkan jarak pandang secara manual.',
  'action.fetchVisibility': 'Ambil dari BMKG',
  'source.bmkgVisibility': 'BMKG {port}, {distance} nm dari titik awal',
  // --- wind service ------------------------------------------------------
  'wind.badTime': 'Waktu yang diminta tidak valid.',
  'wind.unreachable':
    'Tidak dapat menghubungi Open-Meteo. Masukkan angin secara manual; isian manual adalah jalur penuh, bukan cadangan.',
  'wind.httpStatus':
    'Open-Meteo mengembalikan {status}. Tanggal yang diminta mungkin di luar jangkauan prakiraannya. Masukkan angin secara manual.',
  'wind.noData': 'Open-Meteo tidak mengembalikan data angin untuk posisi ini.',
  'wind.noHours': 'Open-Meteo tidak mengembalikan jam angin yang dapat dipakai untuk hari itu.',
  'wind.nearestHour':
    'Prakiraan terdekat yang tersedia berjarak {gap} jam dari waktu yang diminta ({time} UTC).',
  'wind.failed': 'Pengambilan angin gagal. Masukkan angin secara manual.',

  // --- map capture -------------------------------------------------------
  'capture.notReady': 'Peta belum siap untuk diambil.',
  'capture.noContext': 'Tidak dapat memperoleh konteks gambar untuk pengambilan peta.',

  // --- report ------------------------------------------------------------
  'report.subtitle': 'Rencana pencarian NavSAR  ·  dihitung {calc}  ·  laporan dibuat {gen}',
  'report.untitled': 'Kasus tanpa nama',
  'report.fileCase': 'kasus',
  'report.h.summary': 'Ringkasan hasil',
  'report.h.positions': 'Posisi',
  'report.h.map': 'Peta',
  'report.h.inputs': 'Masukan yang dipakai',
  'report.h.currents': 'Arus air (isian manual: belum ada sumber arus langsung di versi ini)',
  'report.h.chain': 'Rantai perhitungan',
  'report.h.facilities': 'Unsur SAR dan jarak antar lintasan',
  'report.h.sources': 'Sumber',
  'report.lbl.datumType': 'Jenis datum',
  'report.lbl.e': 'E, total galat perkiraan',
  'report.lbl.ro': 'Ro, radius pencarian optimal',
  'report.lbl.ao': 'Ao, area pencarian optimal',
  'report.lbl.co': 'Co, faktor cakupan optimal',
  'report.lbl.zta': 'Zta, total daya pencarian tersedia',
  'report.lbl.sr': 'SR, rasio pemisahan',
  'report.lbl.pos': 'POS, probabilitas keberhasilan',
  'report.lbl.startPoint': 'Titik awal hanyut',
  'report.lbl.distressType': 'Jenis posisi musibah',
  'report.lbl.datum': 'Datum',
  'report.lbl.datumLeft': 'Datum, kiri dari arah angin',
  'report.lbl.datumRight': 'Datum, kanan dari arah angin',
  'report.lbl.lineEnd': 'Titik ujung datum garis',
  'report.lbl.driftDistance': 'Jarak hanyut dari titik awal',
  'report.lbl.dd': 'DD, jarak divergensi',
  'report.lbl.weatherClass': 'Koreksi cuaca berlaku untuk',
  'report.lbl.searchObject': 'Objek pencarian',
  'report.lbl.leewayMultiplier': 'Pengali leeway',
  'report.lbl.leewayModifier': 'Penambah leeway',
  'report.lbl.leewayDivergence': 'Sudut divergensi leeway',
  'report.lbl.distressTime': 'Waktu musibah',
  'report.lbl.searchStartTime': 'Waktu mulai pencarian',
  'report.lbl.driftTime': 'Lama hanyut',
  'report.lbl.wind': 'Angin',
  'report.lbl.windSource': 'Sumber angin',
  'report.lbl.windSteadiness': 'Kemantapan angin',
  'report.lbl.visibility': 'Jarak pandang',
  'report.lbl.seaHeight': 'Tinggi gelombang',
  'report.lbl.x': 'X, galat titik awal',
  'report.lbl.y': 'Y, galat posisi unsur SAR',
  'report.lbl.lwe': 'LWe, galat leeway',
  'report.lbl.fs': 'fs, faktor pencarian optimal',
  'report.windValue': '{speed} kt dari {bearing}',
  'report.val.manual': '(manual)',
  'report.val.manualShort': 'manual',
  'report.val.notApplied': '(tidak diterapkan)',
  'report.val.manualEntry': 'Isian manual',
  'report.val.notUsed': 'Tidak dipakai',
  'report.val.manualOverride': 'diganti manual',
  'report.val.fromSr': 'dari SR',
  'report.windFlag': 'Tanda data angin: {reason}',
  'report.mapUnavailable':
    'Tampilan peta tidak dapat diambil untuk laporan ini ({reason}). Semua posisi hasil perhitungan tercantum di atas.',
  'report.legend.searchArea': 'Area pencarian',
  'report.legend.errorCircle': 'Lingkaran galat E',
  'report.legend.datum': 'Datum',
  'report.legend.driftTrack': 'Jalur hanyut / titik awal',
  'report.tbl.component': 'Komponen',
  'report.tbl.speedKt': 'Kecepatan (kt)',
  'report.tbl.setsToward': 'Mengalir ke',
  'report.tbl.errorKt': 'Galat perkiraan (kt)',
  'report.cur.tidal': 'Pasang surut',
  'report.cur.sea': 'Laut',
  'report.cur.wind': 'Angin',
  'report.cur.other': 'Lainnya',
  'report.tbl.step': 'Langkah',
  'report.tbl.formula': 'Rumus',
  'report.tbl.value': 'Nilai',
  'report.tbl.facility': 'Unsur',
  'report.step.leewaySpeed': 'Kecepatan leeway',
  'report.step.twc': 'Total arus air',
  'report.step.driftVector': 'Vektor hanyut',
  'report.formula.leeway': '(pengali × angin) ± penambah',
  'report.formula.vectorSum': 'jumlah vektor 4 komponen',
  'report.formula.driftSum': 'leeway + total arus air',
  'report.formula.sumZ': 'jumlah (W × V × T)',
  'report.formula.sumZr': 'jumlah Zr',
  'report.formula.driftTime': 'Dve × lama hanyut',
  'report.ktToward': '{speed} kt menuju {bearing}',
  'report.noFacilities': 'Tidak ada unsur SAR yang ditugaskan pada pencarian ini.',
  'report.facilityKey':
    'W0 sweep width belum terkoreksi (nm) · fw cuaca · fv kecepatan · ff kelelahan · W sweep width terkoreksi (nm) · V kecepatan pencarian (kt) · T lama pencarian (jam) · Z daya pencarian (nm²) · So jarak antar lintasan optimal (nm).',
  'report.sources':
    'Nilai leeway, sweep width, faktor koreksi, galat posisi dan faktor keselamatan diambil dari National Search and Rescue Manual, 2023 Edition (AMSA / Australian National Search and Rescue Council), Appendices D-5 sampai D-7 dan Table 3-2, dipakai sebagai pengganti yang dapat dikutip publik untuk IAMSAR Volume II Appendix N. Faktor koreksi cuaca untuk objek pencarian selain orang di air, rakit penolong atau perahu di bawah 10 m, serta tabel galat penentuan posisi menurut sarana navigasi, adalah nilai milik manual tersebut dan berbeda dari IAMSAR. LWe berasal dari Allen, A.A. dan Plourde, J.V. (1999), Review of Leeway: Field Experiments and Implementation, U.S. Coast Guard R&D Center CG-D-08-99, Table 8-1, karya pemerintah federal AS yang berada dalam domain publik: nilainya adalah galat baku regresi leeway terukur untuk jenis wahana tersebut, dan wahana yang tidak punya baris di sana memakai bawaan 0,3 kt. fv berasal dari Table D-5:8, faktor koreksi kecepatan untuk unsur pencari udara, dibaca dari wahana dan kecepatan pencarian tiap unsur; kapal, atau pesawat di atas darat, tidak punya baris di sana dan memakai 1,0. Kurva probabilitas deteksi tidak didigitalkan, sehingga POD adalah isian manual.',
};
