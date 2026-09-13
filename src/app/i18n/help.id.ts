/**
 * Indonesian help content.
 *
 * Typed as Record<HelpId, HelpEntry> against the English set, so an entry
 * added there and forgotten here fails the build rather than leaving a "?"
 * that opens onto nothing.
 *
 * The `formula` lines are deliberately identical to the English: they are
 * notation, not prose, and a crew reads them off the same manual. What
 * changes is the explanation around them.
 */

import type { HelpEntry, HelpId } from './help.en';

export const HELP_ID: Record<HelpId, HelpEntry> = {
  /* ---------------------------------------------------------------- case */

  caseName: {
    title: 'Nama kasus',
    what: 'Label untuk pencarian ini, dipakai pada daftar kasus dan di bagian atas laporan yang diekspor. Tidak mengubah apa pun dalam perhitungan.',
    entering:
      'Apa saja yang nanti mudah Anda kenali, misalnya nama kapal, nomor kejadian, atau tanggal dan wilayahnya.',
  },

  distressType: {
    title: 'Jenis posisi musibah',
    what: 'Seberapa yakin Anda mengetahui tempat objek pencarian mulai hanyut. LKP adalah posisi hasil pengamatan; EIP hanya perkiraan terbaik; melanjutkan dari datum sebelumnya berarti pencarian ini dimulai dari tempat perhitungan pencarian terdahulu berakhir.',
    entering:
      'Pilih yang sesuai dengan informasi Anda. Pilihan ini menentukan posisi mana yang Anda tandai berikutnya, dan menjadi dasar membaca galat titik awal X: posisi hasil tebakan pantas diberi X yang jauh lebih besar daripada posisi hasil pengamatan.',
  },

  searchObject: {
    title: 'Objek pencarian',
    what: 'Apa yang Anda cari: orang di air, rakit penolong ukuran tertentu, kapal ikan, dan seterusnya. Setiap objek mengapung dengan cara berbeda, sehingga angin mendorongnya pada kecepatan dan sudut yang berbeda pula.',
    entering:
      'Pilih yang paling mendekati. Memilih objek akan mengisi ketiga koefisien leeway di bawah dari tabel; semuanya tetap dapat Anda ubah.',
    source: 'Tabel leeway, AMSA National SAR Manual 2023, Appendix D-5.',
  },

  leewayMultiplier: {
    title: 'Pengali leeway',
    what: 'Bagian dari kecepatan angin yang menjadi kecepatan hanyut objek. Pengali 0,03 berarti objek bergerak searah angin dengan kecepatan sekitar 3% dari kecepatan angin.',
    entering:
      'Terisi dari objek pencarian yang Anda pilih. Ubah hanya bila Anda punya angka yang lebih tepat untuk objek ini.',
    formula: 'leeway speed = (multiplier x wind speed) + modifier',
  },

  leewayModifier: {
    title: 'Penambah leeway',
    what: 'Koreksi tetap yang kecil, dalam knot, ditambahkan pada hasil pengali. Berasal dari baris tabel yang sama dengan pengali dan biasanya bernilai negatif.',
    entering: 'Terisi dari objek pencarian. Ubah hanya bila ada sumber yang lebih baik.',
    formula: 'leeway speed = (multiplier x wind speed) + modifier',
  },

  leewayDivergence: {
    title: 'Sudut divergensi leeway',
    what: 'Objek jarang hanyut lurus searah angin. Kebanyakan menyamping, dan ke sisi mana tidak dapat diduga, sehingga perencana mengandaikan keduanya. Sudut ini adalah seberapa jauh objek dapat menyimpang dari arah angin, ke kiri atau ke kanan.',
    entering:
      'Terisi dari objek pencarian. Sudut yang lebih besar membuat kedua datum makin berjauhan.',
    formula: 'one datum at (downwind - angle), one at (downwind + angle)',
  },

  applyDivergence: {
    title: 'Terapkan divergensi leeway',
    what: 'Apakah perencanaan memperhitungkan objek menyimpang ke salah satu sisi arah angin, sehingga menghasilkan dua datum, atau menganggapnya hanyut lurus searah angin sehingga hanya satu datum.',
    entering:
      'Biarkan aktif kecuali Anda punya alasan meyakini objek hanyut lurus searah angin. Mematikannya memaksa jarak divergensi DD menjadi nol dan datum titik tunggal, yang memberi area pencarian lebih kecil tetapi mengandaikan lebih banyak daripada yang sebenarnya Anda ketahui.',
  },

  /* --------------------------------------------------------- start point */

  startPoint: {
    title: 'Titik awal hanyut',
    what: 'Posisi objek saat mulai hanyut: posisi terakhir diketahui, perkiraan posisi awal, atau datum sebelumnya. Semua perhitungan berikutnya diukur dari sini.',
    entering:
      'Tandai di peta, geser penanda yang ada, atau ketik lintang dan bujurnya. Lintang positif berarti utara, bujur positif berarti timur. Peta dan kolom isian selalu selaras; pakai mana yang lebih mudah.',
  },

  distressTime: {
    title: 'Waktu musibah',
    what: 'Waktu objek berada di titik awal hanyut, yaitu saat ia mulai hanyut.',
    entering:
      'Isi dalam UTC, bukan waktu setempat. Waktu ini juga dipakai saat mengambil data angin, agar angin sesuai dengan awal masa hanyut.',
  },

  searchStartTime: {
    title: 'Waktu mulai pencarian',
    what: 'Waktu unsur SAR benar-benar berada di lokasi dan mulai mencari.',
    entering:
      'Isi dalam UTC. Selisih antara waktu ini dan waktu musibah adalah lama objek hanyut, dan itulah yang menggeser datum menjauh dari titik awal.',
  },

  driftTime: {
    title: 'Lama hanyut',
    what: 'Berapa jam objek telah hanyut: waktu mulai pencarian dikurangi waktu musibah. Nilai ini menentukan sejauh mana datum bergeser sekaligus seberapa tidak pasti posisi itu.',
    entering:
      'Dihitung dari kedua waktu di atas. Ubah bila Anda ingin merencanakan untuk waktu tiba di lokasi yang berbeda tanpa mengubah waktunya sendiri.',
    formula: 'drift error De = Dve x drift time',
  },

  lineDatumEnd: {
    title: 'Titik ujung datum garis',
    what: 'Dipakai bila objek berada di suatu tempat sepanjang jalur, bukan di satu titik, misalnya pesawat atau kapal yang terlambat pada rute yang diketahui. Seluruh garis ikut hanyut, dan Anda mencari pada persegi panjang memanjang, bukan persegi di sekitar satu titik.',
    entering:
      'Tambahkan titik ujung, lalu tempatkan di ujung lain jalur tersebut. Jenis datum juga harus diatur ke “Datum garis” pada langkah Datum agar dipakai.',
  },

  /* --------------------------------------------------------- environment */

  windSpeed: {
    title: 'Kecepatan angin',
    what: 'Rata-rata angin permukaan selama masa hanyut, dalam knot. Angin adalah yang mendorong objek melintasi air, sehingga biasanya inilah pengaruh tunggal terbesar terhadap letak datum.',
    entering:
      'Ambil dari Open-Meteo untuk posisi awal dan waktu musibah, atau ketik sendiri. Nilai hasil pengambilan diberi tanda sumbernya; mengetik menimpanya akan menandai kolom ini sebagai isian manual.',
    source: 'Open-Meteo forecast API, angin 10 m, jam terdekat dengan waktu musibah.',
  },

  windDirection: {
    title: 'Arah angin',
    what: 'Arah angin bertiup DARI, dalam derajat sejati. Ini konvensi meteorologi: angin 090 adalah angin timur, bertiup dari timur menuju barat.',
    entering:
      'Derajat sejati, bukan magnetis. Di tempat lain dalam aplikasi ini arah berarti arah sesuatu bergerak menuju; angin adalah satu-satunya pengecualian, dan selalu diberi label “dari arah”.',
  },

  windSteadiness: {
    title: 'Kemantapan angin',
    what: 'Seberapa jauh Anda memercayai angka angin tersebut. Angin terukur yang mantap lebih berharga daripada prakiraan untuk hari berangin kencang, dan selisih itu masuk ke dalam anggaran galat.',
    entering:
      'Pilih “mantap” untuk angin hasil pengamatan atau yang berubah perlahan, “berubah-ubah” untuk prakiraan atau angin yang terus bergeser. Pilihan ini menetapkan ASWDve, galat hanyut yang berasal dari angin: 0,3 kt atau 0,5 kt.',
    formula: 'Dve = sqrt(ASWDve^2 + TWCe^2 + LWe^2)',
  },

  visibility: {
    title: 'Jarak pandang meteorologis',
    what: 'Sejauh mana pencari dapat melihat, dalam kilometer. Inilah hal utama yang menentukan selebar apa jalur laut yang dapat disapu efektif oleh tiap unsur.',
    entering:
      'Isi jarak pandang yang diperkirakan di lokasi. Angka ini langsung dibaca ke tabel sweep width untuk semua unsur, jadi mengubahnya mengubah seluruh W0 sekaligus.',
  },

  seaHeight: {
    title: 'Tinggi gelombang signifikan',
    what: 'Tinggi gelombang di lokasi, dalam meter. Laut yang berombak menyembunyikan objek kecil di antara alun, sehingga memperpendek jarak objek masih dapat terlihat.',
    entering:
      'Opsional. Centang kotaknya untuk memakai, lalu isi tingginya. Faktor koreksi cuaca fw kemudian mengambil yang lebih buruk antara pita angin dan pita gelombang. Bila tidak diaktifkan, fw berasal dari angin saja.',
  },

  currents: {
    title: 'Arus air',
    what: 'Angin mendorong objek melintasi air; airnya sendiri juga bergerak dan ikut membawa objek. Keempat komponen ini dijumlahkan sebagai vektor untuk memperoleh total arus air.',
    entering:
      'Isian manual di versi ini: belum ada sumber arus laut langsung. Isi dari atlas pasang surut, peta arus atau pengetahuan setempat, dan biarkan nol untuk komponen yang tidak berlaku.',
    formula: 'drift = leeway + total water current',
  },

  currentTidal: {
    title: 'Arus pasang surut',
    what: 'Aliran bolak-balik akibat pasang surut. Mendominasi di dekat pantai, di alur dan di muara, dan hampir tidak ada di laut lepas.',
    entering: 'Dari atlas pasang surut atau data arus pasang surut untuk wilayah dan keadaan pasang tersebut.',
  },

  currentSea: {
    title: 'Arus laut',
    what: 'Sirkulasi laut berskala besar: aliran tetap yang kurang lebih permanen dari suatu sistem arus. Paling berpengaruh di lepas pantai, tempat pasang surut tidak berperan.',
    entering: 'Dari peta arus atau buku pandu bahari untuk wilayah tersebut.',
  },

  currentWind: {
    title: 'Arus akibat angin',
    what: 'Lapisan tipis air permukaan yang terseret oleh angin. Ini adalah air yang bergerak, berbeda dari angin yang mendorong objek secara langsung; yang terakhir itu leeway dan ditangani terpisah.',
    entering:
      'Diperkirakan dari angin yang bertiup selama kira-kira sehari terakhir, bukan hanya angin saat ini.',
  },

  currentOther: {
    title: 'Arus air lainnya',
    what: 'Apa pun lain yang menggerakkan air: aliran sungai, pembilasan pelabuhan, pusaran setempat.',
    entering: 'Biarkan nol kecuali Anda mengetahui adanya sesuatu yang khusus.',
  },

  currentSpeed: {
    title: 'Kecepatan arus',
    what: 'Seberapa cepat komponen air ini bergerak, dalam knot.',
    entering: 'Isi nol bila komponen ini tidak berlaku di sini.',
  },

  currentSet: {
    title: 'Mengalir ke',
    what: 'Arah air mengalir MENUJU, dalam derajat sejati. Arus dengan nilai 180 mengalir ke selatan.',
    entering:
      'Derajat sejati. Perhatikan bahwa konvensi ini kebalikan dari angin, yang dinyatakan sebagai arah angin bertiup dari.',
  },

  currentError: {
    title: 'Galat perkiraan arus',
    what: 'Seberapa meleset angka arus ini mungkin, dalam knot. Nilai ini tidak menggeser datum; ia memperlebar lingkaran ketidakpastian di sekelilingnya.',
    entering:
      'Bawaannya 0,3 kt, sesuai saran manual bila tidak ada perkiraan yang lebih baik. Turunkan bila angkanya hasil pengukuran, naikkan bila hanya terkaan.',
    formula: 'TWCe = sqrt(tidal^2 + sea^2 + wind^2 + other^2)',
  },

  lwe: {
    title: 'LWe, galat leeway',
    what: 'Seberapa meleset perkiraan leeway mungkin, dalam knot. Leeway bergantung pada cara objek mengapung, seberapa bermuatan, dan bagaimana gelombang berjalan, yang semuanya tidak terlihat dari pusat koordinasi.',
    entering:
      'Dibaca dari objek pencarian yang Anda pilih, yaitu galat regresi leeway yang diukur untuk jenis wahana tersebut. Dapat diubah. Wahana yang tidak punya baris di sumber memakai bawaan 0,3 kt, dan baris yang galatnya hanya dicetak sebagai batas bawah ditandai sebagai nilai minimum, bukan hasil pengukuran.',
    formula: 'Dve = sqrt(ASWDve^2 + TWCe^2 + LWe^2)',
    source: 'Allen & Plourde 1999, USCG R&D Center CG-D-08-99, Table 8-1.',
  },

  positionError: {
    title: 'Galat posisi',
    what: 'Dua ketidakpastian terpisah: X, seberapa yakin Anda tahu tempat objek bermula, dan Y, seberapa yakin unsur yang mencari tahu posisinya sendiri. Keduanya memperbesar area pencarian.',
    formula: 'E = sqrt(X^2 + De^2 + Y^2)',
  },

  xSource: {
    title: 'Sumber X: bagaimana titik awal ditentukan',
    what: 'Jenis laporan posisi asal titik awal hanyut. Penentuan GPS bernilai beberapa ratus meter; baringan dari kapal yang lewat, atau posisi yang diteruskan lewat radio buruk, bisa meleset bermil-mil.',
    entering:
      'Pilih metode yang dipakai. Pilihan ini mengisi X dari tabel galat penentuan posisi. Beberapa entri dinyatakan dalam manual sebagai aturan, bukan angka, dan entri itu menampilkan teks aturannya alih-alih angka karangan: dalam hal itu ketik sendiri nilai X Anda.',
    source: 'Tabel galat penentuan posisi, AMSA National SAR Manual 2023, Table D-6:1.',
  },

  x: {
    title: 'X, galat titik awal hanyut',
    what: 'Seberapa jauh posisi awal yang sebenarnya mungkin menyimpang dari yang Anda isikan, dalam mil laut.',
    entering:
      'Terisi dari sumber X di atas. Bebas Anda ubah. Bila melanjutkan dari datum sebelumnya, isi X dengan total galat perkiraan E dari pencarian tersebut.',
  },

  ySource: {
    title: 'Sumber Y: bagaimana unsur menentukan posisinya',
    what: 'Cara unsur yang mencari mengetahui posisinya sendiri. Awak yang sedikit tersesat akan menyapu petak laut yang sedikit keliru, sehingga ketelitian navigasi mereka juga bagian dari anggaran galat.',
    entering:
      'Pilih metode navigasi yang akan dipakai unsur. Sebagian besar unsur modern memakai GPS, yang memberi Y kecil.',
  },

  y: {
    title: 'Y, galat posisi unsur SAR',
    what: 'Seberapa jauh unsur mungkin menyimpang dari posisi yang diyakininya, dalam mil laut.',
    entering: 'Terisi dari sumber Y di atas, dan dapat diubah.',
  },

  /* --------------------------------------------------------------- datum */

  datum: {
    title: 'Datum',
    what: 'Satu posisi paling mungkin objek pencarian saat ini: titik awal, digeser oleh angin dan air selama masa hanyut. Ini pusat pencarian, bukan jaminan.',
    formula: 'datum = start point + (leeway + total water current) x drift time',
  },

  driftDistance: {
    title: 'Hanyut',
    what: 'Sejauh mana objek telah bergerak dari titik awal, dalam mil laut, dan ke arah mana. Ini gabungan dorongan angin pada objek dan bawaan arus air.',
    formula: 'drift vector = leeway vector + total water current vector',
  },

  leewaySpeed: {
    title: 'Leeway',
    what: 'Kecepatan angin mendorong objek menembus air, dalam knot, beserta arah dorongannya. Sudut divergensi adalah seberapa jauh ke salah satu sisi arah angin objek mungkin sebenarnya bergerak.',
    formula: 'leeway = (multiplier x wind speed) + modifier',
  },

  e: {
    title: 'E, total galat perkiraan',
    what: 'Satu angka yang menyatakan seberapa tidak pasti datum itu, dalam mil laut. Menggabungkan tiga ketidakpastian yang saling bebas: tempat objek bermula, sejauh mana ia telah hanyut, dan di mana pencari mengira dirinya berada. Inilah radius yang menjadi dasar seluruh area pencarian.',
    formula: 'E = sqrt(X^2 + De^2 + Y^2)',
  },

  de: {
    title: 'De, galat hanyut',
    what: 'Seberapa meleset perhitungan hanyut itu sendiri mungkin, dalam mil laut. Makin lama objek hanyut, makin besar pengaruh galat kecil pada perkiraan kecepatan hanyut: inilah sebabnya pencarian yang terlambat dimulai membutuhkan area jauh lebih luas.',
    formula: 'De = Dve x drift time',
  },

  dve: {
    title: 'Dve, galat kecepatan hanyut',
    what: 'Seberapa meleset perkiraan KECEPATAN hanyut mungkin, dalam knot. Tiga hal tidak pasti dan tidak saling bergantung: angin, arus air, dan perilaku leeway objek. Ketiganya digabung sebagai akar jumlah kuadrat, bukan dijumlahkan langsung, karena kecil kemungkinan semuanya meleset ke arah yang sama sekaligus.',
    formula: 'Dve = sqrt(ASWDve^2 + TWCe^2 + LWe^2)',
  },

  twce: {
    title: 'TWCe, galat arus air',
    what: 'Gabungan ketidakpastian keempat komponen arus air, dalam knot.',
    formula: 'TWCe = sqrt(tidal^2 + sea^2 + wind^2 + other^2)',
  },

  dd: {
    title: 'DD, jarak divergensi',
    what: 'Seberapa jauh kedua datum divergensi terpisah, dalam mil laut: jarak antara posisi akhir bila objek menyimpang ke kiri dan bila menyimpang ke kanan. Untuk datum garis, DD justru berarti panjang garis setelah hanyut.',
    formula: 'DD = distance between the left and right datums',
  },

  sr: {
    title: 'SR, rasio pemisahan',
    what: 'DD yang diukur dalam satuan E: menanyakan apakah kedua datum yang mungkin itu berjauhan dibandingkan tingkat ketidakpastian masing-masing. Di bawah 4, lingkaran ketidakpastian keduanya cukup bertumpang tindih sehingga satu area gabungan mencakup keduanya. Pada 4 ke atas, keduanya benar-benar tempat berbeda dan dicari sebagai dua area terpisah.',
    formula: 'SR = DD / E',
  },

  datumType: {
    title: 'Jenis datum',
    what: 'Bentuk area pencarian yang dibangun. Titik tunggal memberi persegi di sekitar satu datum. Divergensi leeway memberi satu persegi panjang memanjang yang mencakup keduanya. Divergensi lebar memberi dua persegi terpisah. Datum garis memberi persegi panjang memanjang sepanjang jalur.',
    entering:
      'Dipilih otomatis dari rasio pemisahan. Ganti bila pengetahuan lapangan menunjukkan lain, misalnya untuk memaksa datum garis bagi kapal yang terlambat pada rute yang diketahui.',
  },

  /* ---------------------------------------------------------- facilities */

  facilities: {
    title: 'Unsur SAR',
    what: 'Pesawat, kapal dan tim darat yang ditugaskan pada pencarian ini. Bersama-sama mereka menentukan seberapa luas laut yang benar-benar dapat disapu, dan itulah yang mengubah lingkaran ketidakpastian menjadi area pencarian yang dapat dikerjakan.',
    entering:
      'Tambahkan satu untuk tiap unsur. Datum dan galat perkiraan tidak memerlukan satu pun; faktor cakupan dan jarak antar lintasan memerlukannya.',
    formula: 'Zta = Z of facility 1 + Z of facility 2 + ...',
  },

  assetName: {
    title: 'Nama unsur',
    what: 'Label untuk unsur ini, dipakai pada hasil, pada keterangan peta dan dalam laporan.',
    entering: 'Tanda panggil atau nama kapal atau pesawatnya.',
  },

  sweepTable: {
    title: 'Wahana sensor dan ketinggian',
    what: 'Apa yang melakukan pengamatan, dan dari ketinggian berapa. Helikopter pada 500 kaki melihat jalur yang jauh lebih lebar daripada pengamat di perahu kecil, dan tiap kombinasi punya tabel sweep width sendiri.',
    entering:
      'Pilih wahana dan ketinggian atau tinggi mata pengamat yang sesuai. Pilihan ini menentukan tabel sweep width mana yang dipakai untuk membaca W0.',
    source: 'Tabel sweep width, AMSA National SAR Manual 2023, Appendix D-7.',
  },

  sweepObject: {
    title: 'Objek pencarian menurut tabel',
    what: 'Tabel sweep width memakai daftar ukuran objeknya sendiri, yang lebih kasar daripada tabel leeway. Ini baris tabel yang akan dibaca.',
    entering:
      'Pilih yang paling mendekati objek yang Anda cari. Pilihan ini boleh berbeda dari objek pencarian pada langkah Kasus: yang itu menentukan bagaimana objek hanyut, yang ini menentukan seberapa mudah ia terlihat.',
  },

  w0: {
    title: 'W0, sweep width belum terkoreksi',
    what: 'Lebar jalur laut yang dapat disapu efektif oleh unsur ini dalam satu lintasan, dalam mil laut, sebelum memperhitungkan cuaca, kecepatan atau kelelahan awak. Bukan sejauh mana mata dapat melihat: angka ini sudah memperhitungkan bahwa objek tetap bisa terlewat meski berada di dalam jalur.',
    entering:
      'Dibaca dari tabel menurut wahana, objek dan jarak pandang. Bila jarak pandang jatuh di antara dua kolom, nilainya diinterpolasi dan diberi tanda. Ubah bila Anda punya angka yang lebih baik.',
  },

  weatherObjectClass: {
    title: 'Koreksi cuaca berlaku untuk',
    what: 'Objek kecil jauh lebih mudah tersembunyi oleh gelombang dan buih daripada objek besar, sehingga hukuman cuacanya berbeda. Pilihan ini menentukan pita cuaca mana dari dua yang dipakai.',
    entering:
      'Pilih pita objek kecil untuk orang di air, rakit penolong atau perahu di bawah 10 m; pita satunya untuk apa pun yang lebih besar. Ditanyakan sekali pada langkah Kasus, karena menggambarkan objek pencarian dan bukan unsurnya, lalu diwarisi setiap unsur.',
  },

  fw: {
    title: 'fw, faktor koreksi cuaca',
    what: 'Seberapa besar cuaca memangkas sweep width. 1,0 berarti tanpa hukuman; 0,5 berarti kondisi berat telah memotong separuh jalur yang dapat disapu berguna oleh unsur ini.',
    entering:
      'Dicari dari kecepatan angin, dan dari tinggi gelombang bila Anda mengaktifkannya, dengan mengambil yang lebih buruk. Dapat diubah.',
    source: 'Tabel koreksi cuaca, AMSA National SAR Manual 2023, Appendix D-7.',
  },

  fv: {
    title: 'fv, faktor koreksi kecepatan',
    what: 'Kelonggaran untuk kecepatan unsur saat mencari. Makin cepat, makin sedikit waktu awak pada tiap petak laut sehingga jalur efektifnya menyempit; makin lambat, makin lebar.',
    entering:
      'Dibaca dari wahana dan kecepatan pencarian unsur tersebut. Tabel ini hanya mencakup pesawat yang mencari objek maritim, sehingga kapal, atau pesawat yang mencari di atas darat, memakai 1,0 dan menyatakannya. Kecepatan di antara dua kolom yang dicetak akan diinterpolasi dan ditandai. Dapat diubah.',
    source: 'Faktor koreksi kecepatan, AMSA National SAR Manual 2026, Table D-5:8.',
  },

  ff: {
    title: 'ff, faktor koreksi kelelahan',
    what: 'Kelonggaran untuk awak yang lelah, yang lebih banyak melewatkan objek. 1,0 berarti awak masih segar.',
    entering: 'Ditentukan oleh kotak centang kelelahan awak di bawah, dan dapat diubah.',
  },

  crewFatigue: {
    title: 'Kelelahan awak',
    what: 'Apakah awak ini sudah bekerja cukup lama sehingga kemampuan deteksinya menurun, misalnya di akhir hari panjang dengan banyak sortie.',
    entering: 'Mencentangnya akan menetapkan faktor koreksi kelelahan ff di bawah.',
  },

  assetSpeed: {
    title: 'V, kecepatan pencarian',
    what: 'Kecepatan unsur saat benar-benar mencari, dalam knot. Bukan kecepatan jelajah menuju lokasi atau kecepatan maksimum.',
    entering: 'Kecepatan pencarian yang realistis saat bertugas.',
    formula: 'Z = W x V x T',
  },

  assetEndurance: {
    title: 'T, lama pencarian',
    what: 'Berapa jam unsur ini dapat mencari di lokasi. Bukan total daya jelajah: kurangi waktu tempuh pergi dan pulang, serta cadangannya.',
    entering: 'Jam yang benar-benar tersedia di atas area pencarian.',
    formula: 'Z = W x V x T',
  },

  w: {
    title: 'W, sweep width terkoreksi',
    what: 'Sweep width setelah memperhitungkan cuaca, kecepatan dan kelelahan: jalur yang benar-benar dapat disapu unsur ini hari itu, dalam mil laut.',
    formula: 'W = W0 x fw x fv x ff',
  },

  z: {
    title: 'Z, daya pencarian',
    what: 'Seberapa luas laut yang dapat disapu unsur ini, dalam mil laut persegi: lebar jalur efektifnya dikalikan kecepatannya dan lamanya bertugas. Inilah sumbangan unsur tersebut pada pencarian.',
    formula: 'Z = W x V x T',
  },

  /* --------------------------------------------------------- search area */

  searchStage: {
    title: 'Tahap pencarian',
    what: 'Putaran pencarian keberapa ini. Pencarian pertama menyapu petak paling mungkin secara rapat; bila objek tidak ditemukan, tiap pencarian berikutnya meluas keluar untuk menutup kemungkinan bahwa datumnya sendiri keliru.',
    entering:
      'Mulai dari area probabilitas awal. Naikkan tahap hanya setelah satu pencarian dijalankan dan tidak membuahkan hasil.',
    source: 'Tabel faktor keselamatan, AMSA National SAR Manual 2023, Table 3-2.',
  },

  fs: {
    title: 'fs, faktor pencarian optimal',
    what: 'Berapa kali galat perkiraan E dipakai sebagai radius pencarian. fs rendah menyapu area kecil secara menyeluruh; fs tinggi menyapu area luas secara tipis. Nilainya naik bertahap seiring pencarian diperluas.',
    entering: 'Ditentukan oleh tahap pencarian di atas, dan dapat diubah.',
    formula: 'Ro = fs x E',
  },

  ro: {
    title: 'Ro, radius pencarian optimal',
    what: 'Setengah lebar area pencarian, dalam mil laut: seberapa jauh keluar dari datum harus disapu.',
    formula: 'Ro = fs x E',
  },

  ao: {
    title: 'Ao, area pencarian optimal',
    what: 'Total luas yang harus disapu, dalam mil laut persegi. Bentuknya bergantung jenis datum: persegi di sekitar satu datum, persegi panjang memanjang yang mencakup dua datum divergen, dua persegi terpisah, atau persegi panjang memanjang sepanjang garis.',
    formula:
      'single point: Ao = 4Ro^2 | divergence: Ao = 4Ro^2 + 2 x Ro x DD | line: Ao = 2 x Ro x L',
  },

  co: {
    title: 'Co, faktor cakupan',
    what: 'Seberapa menyeluruh area akan disapu: seluruh daya pencarian yang tersedia dibagi luas yang harus ditutup. Di atas 1, unsur mampu menyapu area itu lebih dari sekali. Di bawah 1, sekali pun tidak tertutup, sehingga jarak antar lintasan lebih lebar daripada sweep width dan tersisa celah di antaranya.',
    entering:
      'Di bawah 0,5 aplikasi memunculkan peringatan: manual sumber menyatakan cakupan sebesar itu tidak memadai dengan sendirinya dan pencarian area di bawah 0,5 tidak dianjurkan. Tambah daya pencarian atau perkecil areanya, jangan menerimanya begitu saja.',
    formula: 'Co = Zta / Ao',
  },

  zta: {
    title: 'Zta, total daya pencarian tersedia',
    what: 'Seluruh daya pencarian yang Anda miliki, dalam mil laut persegi: daya setiap unsur dijumlahkan.',
    formula: 'Zta = Z of facility 1 + Z of facility 2 + ...',
  },

  fz: {
    title: 'fz, faktor daya pencarian',
    what: 'Besarnya persoalan, dalam mil laut persegi, dipakai sebagai tolok ukur apakah daya pencarian sudah memadai. Untuk datum titik nilainya E kuadrat; untuk datum garis nilainya E dikali panjang garis L.',
    formula: 'point: fz = E^2 | line: fz = E x L, where L = DD + 2E',
  },

  zr: {
    title: 'Zr, daya pencarian relatif',
    what: 'Daya pencarian diukur terhadap besarnya persoalan. Angka ini menjawab “apakah ini cukup untuk pencarian dengan ketidakpastian sebesar ini?” lebih baik daripada jumlah jam mentah: 40 satuan daya terbilang berlimpah untuk datum yang rapat dan tipis untuk datum yang kabur.',
    formula: 'Zr = Zta / fz',
  },

  zrc: {
    title: 'Zrc, daya pencarian relatif kumulatif',
    what: 'Daya pencarian relatif dijumlahkan dari seluruh pencarian sejauh ini, termasuk yang sekarang. Inilah yang menunjukkan seberapa besar upaya sudah ditanamkan pada datum ini, dan dalam metode IAMSAR penuh, angka inilah yang menjadi dasar pembacaan faktor pencarian optimal.',
    formula: 'Zrc = Zr of search 1 + Zr of search 2 + ...',
  },

  searchCondition: {
    title: 'Kondisi pencarian',
    what: 'Apakah keadaan mendukung atau merugikan Anda. “Ideal” berarti tidak satu pun dari ketiga faktor koreksi memangkas sweep width; “normal” berarti setidaknya satu memangkasnya.',
    formula: 'ideal when fw, fv and ff are all 1 or above',
  },

  so: {
    title: 'So, jarak antar lintasan optimal',
    what: 'Seberapa jauh jarak antar lintasan pencarian sejajar yang diterbangi atau dilayari, dalam mil laut. Tiap unsur punya jaraknya sendiri, dari sweep width terkoreksinya sendiri: helikopter yang melihat jalur lebar terbang dengan jarak lintasan lebih lebar daripada perahu kecil yang menyapu area yang sama.',
    formula: 'So = W / Co',
  },

  poc: {
    title: 'POC, probabilitas keberadaan',
    what: 'Peluang, antara 0 dan 1, bahwa objek pencarian memang berada di dalam area yang akan Anda sapu. Pencarian sesempurna apa pun di petak laut yang salah tidak akan menemukan apa-apa.',
    entering:
      'Ini penilaian. Area pencarian yang dibangun pada radius yang dianjurkan di sekitar datum yang kuat biasanya dianggap tinggi; turunkan bila Anda meragukan datumnya sendiri.',
  },

  pod: {
    title: 'POD, probabilitas deteksi',
    what: 'Peluang, antara 0 dan 1, bahwa pencari melihat objek dengan syarat objek berada di dalam area dan mereka melintasinya. Nilainya naik seiring faktor cakupan: menyapu perairan yang sama dua kali membuat Anda lebih mungkin melihatnya.',
    entering:
      'Isian manual: kurva deteksi adalah grafik yang tidak ditabelkan manual. Namun manual mencetak dua titik, ditampilkan di bawah kolom ini, sebagai acuan penilaian: satu kali pencarian mencapai 78% pada faktor cakupan 1,0 dan 47% pada 0,5. Aplikasi tidak akan menginterpolasi di antara keduanya maupun mengekstrapolasi di luarnya.',
    source: 'Table 4-2, Coverage Data Example, AMSA National SAR Manual 2026.',
  },

  pos: {
    title: 'POS, probabilitas keberhasilan',
    what: 'Peluang keseluruhan pencarian ini menemukan objek: peluang objek berada di dalam area, dikalikan peluang Anda melihatnya bila memang di sana. Inilah angka untuk membandingkan satu rencana dengan rencana lain.',
    formula: 'POS = POC x POD',
  },

  /* -------------------------------------------------------------- export */

  report: {
    title: 'Laporan yang diekspor',
    what: 'PDF rencana pencarian berisi masukan yang dipakai, seluruh rantai perhitungan, setiap unsur, posisi hasil perhitungan, dan gambar peta seperti tampak di layar.',
    entering:
      'Atur dulu peta sesuai keinginan: pengambilan gambar mengikuti geseran, perbesaran dan lapisan yang sedang aktif. Laporan selalu memakai masukan dari perhitungan terakhir, jadi hitung ulang dulu bila Anda sudah mengubah sesuatu.',
  },

  staleness: {
    title: 'Mengapa hasil berubah kuning',
    what: 'Mengubah masukan tidak diam-diam menggeser angka di bawahnya. Apa pun yang dihitung dari nilai yang baru Anda ubah akan ditandai usang, dan tetap menampilkan jawaban lama, sampai Anda menekan Hitung ulang.',
    entering: 'Tekan Hitung ulang di bagian atas bila Anda siap melihat angka yang baru.',
  },
};
