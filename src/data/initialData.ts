/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SchoolProfile,
  Teacher,
  ProgramUnggulan,
  Extracurricular,
  GalleryItem,
  Achievement,
  NewsItem,
  SpmbWave,
  User,
  Registration,
  ActivityLog,
  SystemSettings,
  MediaItem,
  WhatsAppGroupSettings,
  AdminWhatsAppSettings,
  SpmbStageDefinition,
  ApplicantStageProgress,
  StageStatus,
  RegistrationStatus
} from '../types';

export const INITIAL_SCHOOL_PROFILE: SchoolProfile = {
  name: 'SDIT INSAN CENDIKIA KALIBARU',
  tagline: 'Membangun Generasi Islami, Cerdas, dan Berakhlak Mulia',
  npsn: '20573193',
  accreditation: 'A (Unggul)',
  address: 'Jl. Pahlawan, Kalibaru Kulon, Kecamatan Kalibaru',
  district: 'Kalibaru',
  regency: 'Kabupaten Banyuwangi',
  province: 'Jawa Timur',
  postalCode: '68467',
  phone: '(0333) 897654',
  whatsapp: '0812-3456-7890',
  email: 'info@sditinsancendikia-kalibaru.sch.id',
  website: 'https://sditinsancendikia-kalibaru.sch.id',
  coordinates: {
    lat: -8.2871,
    lng: 113.9758
  },
  headmasterName: 'Jaya Saputra Ria Novandanu, S.Pd., Gr.',
  headmasterGreeting: 'Bismillahir-rahmaanir-rahiim. Alhamdulillahi Rabbil \'Alamin. Selamat datang di portal resmi SPMB SDIT Insan Cendikia Kalibaru. Kami berkomitmen menyelenggarakan pendidikan dasar Islam terpadu yang memadukan keunggulan tsaqafah Islamiyah, pembiasaan adab mulia, dan kecakapan abad 21 dengan visi Sholih, Cerdas, dan Mandiri. Bersama dewan asatidz berdedikasi tinggi di lereng Gunung Raung Kalibaru Banyuwangi, kami siap membimbing putra-putri tercinta menjadi generasi Qur\'ani yang berkarakter kuat dan berprestasi.',
  spmbChairmanName: 'Tasyantik Salsabilla, S.Pd.',
  history: 'SDIT Insan Cendikia Kalibaru didirikan oleh Yayasan Bina Insan Cendikia Kalibaru dengan semangat menghadirkan pendidikan dasar Islam terpadu berkualitas tinggi di wilayah Banyuwangi Barat. Berangkat dari kesadaran pentingnya menanamkan pondasi akidah, hafalan Al-Qur\'an, dan kecakapan abad 21 sejak usia dini, sekolah ini terus bertumbuh dengan sarana belajar representatif, tenaga pendidik berkompeten, dan kemitraan erat bersama wali murid serta masyarakat.',
  vision: 'Sholih, Cerdas, Mandiri',
  mission: [
    "Membekali Peserta Didik Taat Beribadah, Berakhlak Mulia, dan Cinta Al-Qur'an.",
    "Mengembangkan Proses Pembelajaran yang Menyenangkan dan Prestatif (IQ dan EQ).",
    "Membiasakan Hidup Bersih dan Disiplin (AQ)."
  ],
  goals: [
    'Lulusan hafal minimal 2-3 Juz Al-Qur\'an dengan bacaan tartil dan memahami makna dasar.',
    'Memiliki kesadaran mandiri melaksanakan sholat fardhu berjamaah dan sholat dhuha.',
    'Memiliki kemampuan literasi numerasi tinggi dan lolos ke jenjang pendidikan lanjutan favorit.',
    'Mampu berkomunikasi adabiyah dalam bahasa Indonesia, pengenalan bahasa Arab, dan bahasa Inggris dasar.'
  ],
  facilities: [
    {
      id: 'f1',
      name: 'Musholla As-Salam',
      description: 'Pusat ibadah harian, sholat dhuha, sholat dzuhur berjamaah, dan kegiatan tahfidz Al-Qur\'an.'
    },
    {
      id: 'f2',
      name: 'Ruang Kelas Ber-AC & Multimedia',
      description: 'Kelas nyaman dengan pencahayaan alami, proyektor edukatif, dan sudut pojok baca literasi.'
    },
    {
      id: 'f3',
      name: 'Laboratorium Komputer & Coding',
      description: 'Dilengkapi 30 unit komputer modern untuk pengenalan literasi digital dan robotika ramah anak.'
    },
    {
      id: 'f4',
      name: 'Perpustakaan Baitul Hikmah',
      description: 'Koleksi buku cerita anak Islami, ensiklopedia sains, dan area baca lesehan bertingkat.'
    },
    {
      id: 'f5',
      name: 'Lapangan Olahraga & Arena Panahan',
      description: 'Area rumput dan lapangan serbaguna untuk futsal, basket mini, senam, dan latihan panahan sunnah.'
    },
    {
      id: 'f6',
      name: 'UKS & Ruang Bimbingan Konseling',
      description: 'Layanan pertolongan pertama kesehatan siswa dan pendampingan tumbuh kembang psikologis anak.'
    },
    {
      id: 'f7',
      name: 'Kantin Halal & Sehat',
      description: 'Penyedia jajanan higienis terbebas dari pewarna dan pengawet buatan dengan edukasi adab makan islami.'
    },
    {
      id: 'f8',
      name: 'Taman Edukasi Hijau',
      description: 'Kebun sekolah untuk praktek budidaya tanaman dan pembelajaran sains ramah lingkungan.',
      imageUrl: '/src/assets/images/hero_school_building_1793682340462.jpg'
    }
  ],
  branding: {
    mainLogoUrl: '/assets/aistudio/5_4164f3ac.png',
    faviconUrl: '/assets/aistudio/5_4164f3ac.png',
    navbarLogoUrl: '/assets/aistudio/5_4164f3ac.png',
    footerLogoUrl: '/assets/aistudio/5_4164f3ac.png',
    loginLogoUrl: '/assets/aistudio/5_4164f3ac.png',
    receiptLogoUrl: '/assets/aistudio/5_4164f3ac.png',
    heroBannerUrl: '/src/assets/images/hero_school_building_1793682340462.jpg',
    spmbBannerUrl: '/src/assets/images/student_learning_activity_1793682341759.jpg',
    logoScale: 100,
    showSchoolNameNextToLogo: true,
    updatedAt: '2026-11-08T10:00:00Z'
  }
};

export const INITIAL_PROGRAMS: ProgramUnggulan[] = [
  {
    id: 'prog-1',
    title: 'Tahfidz Al-Qur\'an & Tahsin Bersanad',
    category: 'Tahfidz Al-Qur\'an',
    description: 'Program akselerasi dan pendampingan hafalan Al-Qur\'an dengan metode Talaqqi dan bimbingan guru hafidz/hafidzah berkompeten.',
    detailedPoints: [
      'Target lulusan minimal 2 hingga 3 Juz (Juz 30, 29, dan pilihan).',
      'Muroja\'ah harian terprogram setiap pagi sebelum jam pelajaran inti.',
      'Ujian tahfidz berkala dan sertifikasi tasmi\' Al-Qur\'an satu majelis.',
      'Pemberian mahkota tahfidz dalam wisuda tahunan bersama orang tua.'
    ],
    imageUrl: '/src/assets/images/tahfidz_quran_activity_1793682341601.jpg',
    isPublished: true,
    order: 1
  },
  {
    id: 'prog-2',
    title: 'Bina Pribadi Islami & Pembiasaan Akhlak',
    category: 'Pendidikan Islam',
    description: 'Pendidikan karakter komprehensif yang menanamkan kesadaran beribadah, integritas, kejujuran, dan adab sopan santun.',
    detailedPoints: [
      'Sholat Dhuha dan Sholat Dzuhur berjamaah setiap hari sekolah.',
      'Al-Matsurat (dzikir pagi) dan tilawah Al-Qur\'an rutin.',
      'Buku mutaba\'ah yaumiyah terpantau bersama antara guru dan orang tua.',
      'Gerakan senyum, salam, sapa, sopan, dan santun (5S) di lingkungan sekolah.'
    ],
    imageUrl: '/src/assets/images/student_learning_activity_1793682341759.jpg',
    isPublished: true,
    order: 2
  },
  {
    id: 'prog-3',
    title: 'Pembelajaran Tematik & Sains Qur\'ani',
    category: 'Akademik',
    description: 'Penerapan Kurikulum Merdeka yang memadukan pemahaman sains alam dengan ayat-ayat kauniyah Al-Qur\'an.',
    detailedPoints: [
      'Projek Penguatan Profil Pelajar Pancasila berorientasi nilai keislaman.',
      'Eksperimen sains sederhana dan kunjungan edukatif outdoor (field trip).',
      'Pemanfaatan teknologi interaktif dalam pembelajaran visual dan audio.',
      'Pendampingan bimbingan olimpiade matematika dan IPA tingkat SD.'
    ],
    imageUrl: '/src/assets/images/student_learning_activity_1793682341759.jpg',
    isPublished: true,
    order: 3
  },
  {
    id: 'prog-4',
    title: 'Pengenalan Bahasa Arab & English Fun',
    category: 'Karakter & Adab',
    description: 'Pembiasaan kosa kata harian (mufradat) dan ungkapan sederhana bahasa Arab dan Inggris untuk menumbuhkan rasa percaya diri anak.',
    detailedPoints: [
      'Yaumul Lughah (Hari Berbahasa) tematik mingguan.',
      'Lagu, dongeng, dan storytelling interaktif bernuansa kebaikan.',
      'Percakapan adab sehari-hari di kelas dan lingkungan sekolah.'
    ],
    imageUrl: '/src/assets/images/hero_school_building_1793682340462.jpg',
    isPublished: true,
    order: 4
  }
];

export const INITIAL_EXTRACURRICULARS: Extracurricular[] = [
  {
    id: 'ekskul-1',
    name: 'Pramuka Satuan Komunitas SIT',
    category: 'Kecakapan Hidup',
    coach: 'Kak Danang Prasetyo & Kak Nurul Aini',
    schedule: 'Jumat, 14.00 - 16.00 WIB',
    description: 'Kepanduan berbasis nilai Islam yang mengasah ketangkasan fisik, kemandirian kemah, tali temali, dan jiwa kepemimpinan.',
    imageUrl: '/src/assets/images/extracurricular_activities_1793682342535.jpg',
    isPublished: true
  },
  {
    id: 'ekskul-2',
    name: 'Panahan Sunnah (Archery Club)',
    category: 'Olahraga & Beladiri',
    coach: 'Coach Ardiansyah, S.Or.',
    schedule: 'Sabtu, 08.00 - 10.00 WIB',
    description: 'Melatih konsentrasi, ketenangan pikiran, fokus pandangan, dan kebugaran otot sesuai olahraga anjuran Rasulullah SAW.',
    imageUrl: '/src/assets/images/extracurricular_activities_1793682342535.jpg',
    isPublished: true
  },
  {
    id: 'ekskul-3',
    name: 'Pencak Silat Tapak Suci',
    category: 'Olahraga & Beladiri',
    coach: 'Pendekar Fauzi Kurniawan',
    schedule: 'Rabu, 15.30 - 17.00 WIB',
    description: 'Seni bela diri warisan nusantara untuk melatih fisik, kedisiplinan diri, dan perlindungan diri berakhlak mulia.',
    imageUrl: '/src/assets/images/extracurricular_activities_1793682342535.jpg',
    isPublished: true
  },
  {
    id: 'ekskul-4',
    name: 'Coding & Robotika Cilik',
    category: 'Sains & Teknologi',
    coach: 'Ir. Ahmad Fawaid, M.Kom.',
    schedule: 'Kamis, 15.30 - 17.00 WIB',
    description: 'Pengenalan algoritma pemrograman berbasis visual block (Scratch) dan perakitan robot mekanik sederhana.',
    imageUrl: '/src/assets/images/student_learning_activity_1793682341759.jpg',
    isPublished: true
  },
  {
    id: 'ekskul-5',
    name: 'Seni Kaligrafi & Khat Qur\'ani',
    category: 'Seni Budaya',
    coach: 'Ust. M. Ridwan, S.Pd.I.',
    schedule: 'Selasa, 15.30 - 17.00 WIB',
    description: 'Mempelajari keindahan aksara Arab jenis Naskhi dan Riq\'ah untuk memupuk cita rasa seni dan kecintaan pada mushaf.',
    imageUrl: '/src/assets/images/tahfidz_quran_activity_1793682341601.jpg',
    isPublished: true
  },
  {
    id: 'ekskul-6',
    name: 'Futsal & Mini Soccer Cendikia',
    category: 'Olahraga & Beladiri',
    coach: 'Bambang Irawan, S.Pd.',
    schedule: 'Senin, 15.30 - 17.00 WIB',
    description: 'Olahraga kegemaran anak yang mengasah kerjasama tim, sportivitas, daya tahan stamina, dan koordinasi motorik.',
    imageUrl: '/src/assets/images/extracurricular_activities_1793682342535.jpg',
    isPublished: true
  }
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'tch-1',
    name: 'Jaya Saputra Ria Novandanu, S.Pd., Gr.',
    title: 'S.Pd., Gr.',
    role: 'Kepala Sekolah',
    division: 'Pimpinan',
    education: 'S1 Pendidikan Guru / Profesi Guru (Gr.)',
    quote: 'Membentuk generasi sholih, cerdas, dan mandiri dengan keteladanan akhlak mulia.',
    order: 1
  },
  {
    id: 'tch-spmb',
    name: 'Tasyantik Salsabilla, S.Pd.',
    title: 'S.Pd.',
    role: 'Ketua Panitia SPMB & Pendidik',
    division: 'Pimpinan',
    education: 'S1 Pendidikan Guru',
    quote: 'Menyambut putra-putri calon generasi penerus bangsa dengan pelayanan prima dan ramah.',
    order: 2
  },
  {
    id: 'tch-2',
    name: 'Ustazah Siti Aminah',
    title: 'S.Pd.',
    role: 'Wakil Kepala Bidang Kurikulum',
    division: 'Pimpinan',
    education: 'S1 Pendidikan Guru Sekolah Dasar - Universitas Negeri Malang',
    quote: 'Pembelajaran yang bermakna menghidupkan rasa ingin tahu anak.',
    order: 3
  },
  {
    id: 'tch-3',
    name: 'Ust. Muhammad Ilyas',
    title: 'Al-Hafidz, S.Ag.',
    role: 'Koordinator Tahfidz Al-Qur\'an',
    division: 'Guru Al-Qur\'an',
    education: 'Tahfidz 30 Juz Bersanad, S1 Ilmu Al-Qur\'an dan Tafsir',
    quote: 'Al-Qur\'an adalah pelita hati dan pedoman hidup sepanjang hayat.',
    order: 3
  },
  {
    id: 'tch-4',
    name: 'Ustazah Fatimah Az-Zahra',
    title: 'S.Psi.',
    role: 'Wali Kelas 1 & Konselor Anak',
    division: 'Guru Kelas',
    education: 'S1 Psikologi Pendidikan - Universitas Airlangga',
    quote: 'Masa transisi dari TK ke SD harus penuh kehangatan dan rasa aman.',
    order: 4
  },
  {
    id: 'tch-5',
    name: 'Ust. Hendra Wijaya',
    title: 'S.Pd.',
    role: 'Guru Sains & Pembina Ekskul Robotik',
    division: 'Guru Bidang Studi',
    education: 'S1 Pendidikan Fisika - Universitas Jember',
    quote: 'Sains membuktikan kebesaran Allah di alam semesta.',
    order: 5
  },
  {
    id: 'tch-6',
    name: 'Ustazah Nur Laili',
    title: 'S.Pd.',
    role: 'Wali Kelas 2 & Koordinator Literasi',
    division: 'Guru Kelas',
    education: 'S1 Pendidikan Bahasa Indonesia - UNEJ',
    quote: 'Membaca membuka jendela dunia dan memperkaya nurani.',
    order: 6
  },
  {
    id: 'tch-7',
    name: 'Ust. Danang Prasetyo',
    title: 'S.Or.',
    role: 'Guru Olahraga & Pembina Pramuka SIT',
    division: 'Guru Bidang Studi',
    education: 'S1 Pendidikan Kepelatihan Olahraga',
    quote: 'Jiwa yang tangguh berakar dari raga yang sehat dan bugar.',
    order: 7
  },
  {
    id: 'tch-8',
    name: 'Ahmad Syafii',
    title: 'A.Md.Kom.',
    role: 'Kepala Tata Usaha & Operator Dapodik',
    division: 'Tenaga Kependidikan',
    education: 'D3 Manajemen Informatika',
    quote: 'Melayani administrasi sekolah dengan rapi, akurat, dan ramah.',
    order: 8
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'KBM Tematik di Ruang Kelas Nyaman',
    category: 'Kegiatan Belajar',
    imageUrl: '/src/assets/images/student_learning_activity_1793682341759.jpg',
    date: '2026-10-14',
    description: 'Suasana riang siswa-siswi saat berdiskusi tematik kelompok dipandu guru pendamping.',
    isPublished: true
  },
  {
    id: 'gal-2',
    title: 'Halaqah Tahfidz & Tilawah Pagi',
    category: 'Keagamaan',
    imageUrl: '/src/assets/images/tahfidz_quran_activity_1793682341601.jpg',
    date: '2026-10-18',
    description: 'Ananda melantunkan ayat suci Al-Qur\'an dengan khusyuk di musholla sekolah.',
    isPublished: true
  },
  {
    id: 'gal-3',
    title: 'Latihan Kepanduan & Memanah Terbuka',
    category: 'Ekstrakurikuler',
    imageUrl: '/src/assets/images/extracurricular_activities_1793682342535.jpg',
    date: '2026-10-22',
    description: 'Aktivitas kepanduan Pramuka SIT dan latihan panahan di lapangan asri sekolah.',
    isPublished: true
  },
  {
    id: 'gal-4',
    title: 'Gedung dan Taman Belajar SDIT Kalibaru',
    category: 'Acara Sekolah',
    imageUrl: '/src/assets/images/hero_school_building_1793682340462.jpg',
    date: '2026-10-25',
    description: 'Pemandangan lingkungan sekolah yang asri, bersih, dan ramah bagi anak-anak.',
    isPublished: true
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    title: 'Juara 1 Musabaqah Hifdzil Qur\'an (MHQ) 2 Juz',
    studentName: 'Muhammad Rayyan Al-Ghifari (Siswa Kelas 3)',
    level: 'Kabupaten',
    category: 'Tahfidz & Agama',
    rank: 'Juara 1',
    date: '2026-09-12',
    description: 'Meraih skor tertinggi kefasihan makharijul huruf dan tajwid dalam Festival Anak Sholeh Kabupaten Banyuwangi.',
    imageUrl: '/src/assets/images/tahfidz_quran_activity_1793682341601.jpg',
    isDemo: true
  },
  {
    id: 'ach-2',
    title: 'Medali Emas Olimpiade Sains & Matematika SD Terpadu',
    studentName: 'Aisyah Nur Khadijah (Siswi Kelas 5)',
    level: 'Karesidenan',
    category: 'Sains & Matematika',
    rank: 'Medali Emas',
    date: '2026-08-20',
    description: 'Unggul dalam penyelesaian soal penalaran numerasi dan eksperimen sains dasar se-Karesidenan Besuki.',
    imageUrl: '/src/assets/images/student_learning_activity_1793682341759.jpg',
    isDemo: true
  },
  {
    id: 'ach-3',
    title: 'Juara 2 Lomba Panahan Tradisional Junior U-10',
    studentName: 'Farhan Dwi Pratama (Siswa Kelas 4)',
    level: 'Kabupaten',
    category: 'Olahraga & Seni',
    rank: 'Juara 2',
    date: '2026-07-15',
    description: 'Kategori sasaran jarak 15 meter pada Kejurkab Panahan Junior Banyuwangi.',
    imageUrl: '/src/assets/images/extracurricular_activities_1793682342535.jpg',
    isDemo: true
  },
  {
    id: 'ach-4',
    title: 'Sekolah Adiwiyata & Lingkungan Sehat Tingkat SD',
    studentName: 'SDIT Insan Cendikia Kalibaru',
    level: 'Kabupaten',
    category: 'Literasi',
    rank: 'Penghargaan Khusus',
    date: '2026-06-05',
    description: 'Apresiasi dari Dinas Lingkungan Hidup Kabupaten Banyuwangi atas pemeliharaan ruang hijau dan bank sampah sekolah.',
    imageUrl: '/src/assets/images/hero_school_building_1793682340462.jpg',
    isDemo: true
  }
];

export const INITIAL_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    slug: 'pembukaan-spmb-ta-2027-2028',
    title: 'Penerimaan Murid Baru (SPMB) Tahun Ajaran 2027/2028 Resmi Dibuka',
    category: 'SPMB',
    summary: 'SDIT Insan Cendikia Kalibaru resmi membuka pendaftaran murid baru Gelombang 1 mulai November 2026 dengan kuota terbatas.',
    content: `Alhamdulillah, panitia SPMB SDIT Insan Cendikia Kalibaru mengumumkan dibukanya pendaftaran murid baru untuk Tahun Ajaran 2027/2028. Pendaftaran dilakukan secara terintegrasi melalui portal online ini guna mempermudah bapak/ibu wali murid.

Pada gelombang pertama ini, sekolah menyediakan kuota sebanyak 60 calon siswa yang akan dibagi ke dalam dua rombel kelas paralel dengan rasio pendampingan ideal (maksimal 28-30 siswa per kelas didampingi wali kelas dan asisten).

Tahapan pendaftaran meliputi pengisian formulir, upload berkas, observasi kesiapan belajar, dan wawancara pemetaan minat bakat. Seluruh informasi dapat dipantau langsung melalui menu Cek Status Pendaftaran.`,
    author: 'Panitia SPMB',
    publishedAt: '2026-11-01',
    imageUrl: '/src/assets/images/hero_school_building_1793682340462.jpg',
    isPublished: true,
    views: 412
  },
  {
    id: 'news-2',
    slug: 'tasmi-al-quran-akbar-siswa-sdit',
    title: 'Semarak Tasmi\' Al-Qur\'an Akbar Siswa Penghafal Kalam Ilahi',
    category: 'Kegiatan Siswa',
    summary: 'Sebanyak 35 siswa berhasil memperdengarkan hafalan Juz 30 dan Juz 29 sekali duduk di hadapan orang tua dan asatidz.',
    content: `Musholla As-Salam SDIT Insan Cendikia Kalibaru dipenuhi suasana haru dan syahdu pada Sabtu lalu. Kegiatan Tasmi' Al-Qur'an Akbar diselenggarakan sebagai ajang uji kualitas hafalan siswa yang telah menyelesaikan target juz tertentu.

Para orang tua menyaksikan ananda melantunkan ayat demi ayat dengan tajwid yang fasih. Kepala Sekolah menyampaikan rasa syukur dan apresiasi mendalam kepada para guru tahfidz serta orang tua yang terus istiqomah menemani muroja'ah di rumah.`,
    author: 'Tim Media Sekolah',
    publishedAt: '2026-10-20',
    imageUrl: '/src/assets/images/tahfidz_quran_activity_1793682341601.jpg',
    isPublished: true,
    views: 298
  },
  {
    id: 'news-3',
    slug: 'projek-pancasila-market-day-cilik',
    title: 'Market Day Siswa Cendikia: Menanamkan Jiwa Entrepreneur Islami',
    category: 'Kegiatan Siswa',
    summary: 'Siswa kelas 1 hingga 6 mempraktikkan muamalah jual beli halal dan sedekah barokah dalam gelaran Market Day tahunan.',
    content: `Dalam rangka Projek Penguatan Profil Pelajar Pancasila (P5), sekolah menggelar Market Day. Siswa belajar menghitung harga pokok, membuat kreasi makanan tradisional sehat, melayani pembeli dengan senyum dan kejujuran, serta menyisihkan sebagian keuntungan untuk dana infaq peduli yatim.`,
    author: 'Koordinator P5',
    publishedAt: '2026-10-08',
    imageUrl: '/src/assets/images/student_learning_activity_1793682341759.jpg',
    isPublished: true,
    views: 345
  }
];

export const INITIAL_SPMB_WAVE: SpmbWave = {
  id: 'wave-1',
  name: 'Gelombang 1 (Reguler & Prestasi)',
  academicYear: '2027/2028',
  startDate: '2026-11-01',
  endDate: '2026-12-31',
  announcementDate: '2027-01-10',
  reRegistrationStartDate: '2027-01-12',
  reRegistrationEndDate: '2027-01-25',
  quota: 60,
  registeredCount: 38,
  acceptedCount: 24,
  registrationFee: 200000,
  isActive: true,
  requirements: [
    'Berusia minimal 6 tahun pada 1 Juli 2027 (atau 5 tahun 6 bulan dengan surat rekomendasi psikolog/TK).',
    'Mengisi formulir pendaftaran online secara lengkap.',
    'Upload scan Kartu Keluarga (KK) asli atau legalisir.',
    'Upload scan Akta Kelahiran calon siswa.',
    'Upload Pas Foto formal ananda 3x4 berlatar belakang merah/biru.',
    'Upload scan Surat Keterangan / Ijazah TK / RA / PAUD (jika sudah tersedia).',
    'Mengikuti sesi observasi kesiapan belajar dan wawancara orang tua sesuai jadwal.'
  ],
  selectionFlow: [
    {
      step: 1,
      title: 'Pendaftaran Online',
      description: 'Wali murid membuat akun, melengkapi data siswa, orang tua, dan mengunggah berkas persyaratan.'
    },
    {
      step: 2,
      title: 'Verifikasi Berkas',
      description: 'Panitia SPMB memeriksa keabsahan dokumen yang diunggah dan memberikan status kelayakan.'
    },
    {
      step: 3,
      title: 'Observasi Kesiapan Belajar',
      description: 'Ananda diajak beraktivitas ramah anak untuk memetakan motorik, kognitif, dan pengenalan huruf hijaiyah.'
    },
    {
      step: 4,
      title: 'Wawancara Wali Murid',
      description: 'Dialog santai untuk menyamakan visi pendidikan islami antara pihak sekolah dan keluarga.'
    },
    {
      step: 5,
      title: 'Pengumuman Hasil',
      description: 'Pengumuman kelulusan dapat dicek secara langsung melalui dashboard akun wali murid.'
    },
    {
      step: 6,
      title: 'Daftar Ulang',
      description: 'Penyelesaian administrasi seragam, buku paket, dan konfirmasi keikutsertaan sebagai siswa resmi.'
    }
  ],
  faq: [
    {
      question: 'Berapa usia minimal calon siswa untuk mendaftar kelas 1 SD?',
      answer: 'Usia ideal adalah genap 6 tahun per 1 Juli tahun pelajaran baru. Untuk ananda berusia 5 tahun 6 bulan hingga 6 tahun dapat dipertimbangkan jika memiliki kesiapan psikologis yang didukung surat rekomendasi.'
    },
    {
      question: 'Apakah calon murid wajib sudah bisa membaca Al-Qur\'an atau berhitung?',
      answer: 'Tidak wajib. SDIT Insan Cendikia Kalibaru mendidik ananda dari tahap dasar (metode Talaqqi & Iqro). Tahap observasi kesiapan belajar semata-mata untuk memetakan gaya belajar ananda.'
    },
    {
      question: 'Bagaimana jam kegiatan belajar di SDIT Insan Cendikia Kalibaru?',
      answer: 'Pembelajaran diselenggarakan full day (Senin s.d. Jumat pukul 07.00 - 15.30 WIB), diawali dengan Sholat Dhuha, dzikir pagi, KBM tematik terpadu, makan siang sehat, Sholat Dzuhur berjamaah, dan kegiatan tahfidz/ekskul.'
    },
    {
      question: 'Apakah ada fasilitas antar-jemput atau katering makan siang?',
      answer: 'Ya, sekolah bermitra dengan paguyuban wali murid untuk akomodasi antar-jemput rute Kalibaru Kulon - Kalibaru Wetan - Krikilan, serta layanan katering makan siang higienis dari kantin sekolah.'
    }
  ]
};

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-superadmin',
    username: 'admin_utama',
    email: 'admin@sdit-insancendikia.sch.id',
    name: 'Ustadz Admin Utama',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    role: 'super_admin',
    jabatan: 'Administrator Utama & IT Sekolah',
    isActive: true,
    phone: '081234567800',
    createdAt: '2026-01-01T08:00:00Z',
    lastLoginAt: '2026-11-02T10:15:00Z'
  },
  {
    id: 'usr-adminsekolah',
    username: 'siti_aminah',
    email: 'kurikulum@sdit-insancendikia.sch.id',
    name: 'Ustazah Siti Aminah, S.Pd.',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    role: 'admin_sekolah',
    jabatan: 'Waka Kurikulum & Pengelola Konten Web',
    isActive: true,
    phone: '081234567801',
    createdAt: '2026-01-05T09:00:00Z',
    lastLoginAt: '2026-11-01T14:30:00Z'
  },
  {
    id: 'usr-panitia',
    username: 'panitia_spmb',
    email: 'spmb@sdit-insancendikia.sch.id',
    name: 'Tasyantik Salsabilla, S.Pd.',
    avatarUrl: '',
    role: 'panitia_spmb',
    jabatan: 'Ketua Panitia SPMB',
    isActive: true,
    phone: '081234567802',
    createdAt: '2026-01-10T10:00:00Z',
    lastLoginAt: '2026-11-02T11:45:00Z'
  },
  {
    id: 'usr-seleksi',
    username: 'fatimah_seleksi',
    email: 'seleksi@sdit-insancendikia.sch.id',
    name: 'Ustazah Fatimah, S.Psi.',
    avatarUrl: '',
    role: 'tim_seleksi',
    jabatan: 'Koordinator Tim Observasi & Psikolog Anak',
    isActive: true,
    phone: '081234567803',
    createdAt: '2026-01-12T11:00:00Z',
    lastLoginAt: '2026-10-30T16:20:00Z'
  },
  {
    id: 'usr-kepsek',
    username: 'kepsek_jaya',
    email: 'kepsek@sdit-insancendikia.sch.id',
    name: 'Jaya Saputra Ria Novandanu, S.Pd., Gr.',
    avatarUrl: '',
    role: 'kepala_sekolah',
    jabatan: 'Kepala Sekolah SDIT Insan Cendikia Kalibaru',
    isActive: true,
    phone: '081234567804',
    createdAt: '2026-01-02T08:30:00Z',
    lastLoginAt: '2026-11-02T07:45:00Z'
  }
];

export const INITIAL_REGISTRATIONS: Registration[] = [];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    userId: 'usr-panitia',
    userName: 'Ahmad Syafii',
    userRole: 'panitia_spmb',
    action: 'Verifikasi Berkas',
    details: 'Memverifikasi berkas pendaftaran SPMB-2026-0002 atas nama Aisyah Putri Azzahra.',
    timestamp: '2026-11-01T16:00:00Z'
  },
  {
    id: 'log-2',
    userId: 'usr-panitia',
    userName: 'Ahmad Syafii',
    userRole: 'panitia_spmb',
    action: 'Minta Perbaikan Berkas',
    details: 'Mengirim catatan revisi akta kelahiran buram untuk SPMB-2026-0003.',
    timestamp: '2026-11-01T16:15:00Z'
  },
  {
    id: 'log-3',
    userId: 'usr-seleksi',
    userName: 'Ustazah Fatimah, S.Psi.',
    userRole: 'tim_seleksi',
    action: 'Penilaian Observasi',
    details: 'Menginput hasil observasi dan wawancara untuk SPMB-2026-0004 dengan skor 92.3.',
    timestamp: '2026-10-28T14:00:00Z'
  },
  {
    id: 'log-4',
    userId: 'usr-superadmin',
    userName: 'Ustadz Admin Utama',
    userRole: 'super_admin',
    action: 'Update Kuota SPMB',
    details: 'Menyesuaikan kuota Gelombang 1 menjadi 60 siswa untuk TA 2027/2028.',
    timestamp: '2026-10-20T09:30:00Z'
  }
];

export const INITIAL_SETTINGS: SystemSettings = {
  isSpmbOpen: true,
  currentAcademicYear: '2027/2028',
  enableOnlinePaymentReceipt: true,
  showDemoNotice: true,
  dataSource: 'local_database',
  firebaseConfigured: true,
  googleSheetSettings: {
    spreadsheetId: '1_zt6amQtAr3eGjSPqwaJrIT_irLZvICla9j5lOX2kEM',
    appsScriptUrl: '',
    autoSync: true,
    lastSyncStatus: 'idle',
    lastSyncMessage: 'Siap menghubungkan ke Google Apps Script Spreadsheet 1_zt6amQtAr3eGjSPqwaJrIT_irLZvICla9j5lOX2kEM'
  },
  lastBackupDate: '2026-11-02'
};

export const INITIAL_MEDIA_LIBRARY: MediaItem[] = [
  {
    id: 'med-1',
    title: 'Gedung Utama SDIT Insan Cendikia Kalibaru',
    description: 'Foto fasad dan lingkungan asri sekolah berlatar pegunungan Kalibaru Banyuwangi.',
    url: '/src/assets/images/hero_school_building_1793682340462.jpg',
    category: 'fasilitas',
    fileSizeKb: 340,
    mimeType: 'image/jpeg',
    activityDate: '2026-09-15',
    isThumbnail: true,
    order: 1,
    isPublished: true,
    usageLocations: ['Hero Banner Halaman Utama', 'Fasilitas Sekolah', 'Branding Profil'],
    uploadedAt: '2026-09-15T08:00:00Z',
    uploadedBy: 'Ustadz Admin Utama'
  },
  {
    id: 'med-2',
    title: 'Suasana Belajar Aktif & Berkarakter',
    description: 'Dokumentasi interaksi siswa dalam pembelajaran sains interaktif dan diskusi kelompok.',
    url: '/src/assets/images/student_learning_activity_1793682341759.jpg',
    category: 'kegiatan_belajar',
    fileSizeKb: 385,
    mimeType: 'image/jpeg',
    activityDate: '2026-10-10',
    isThumbnail: false,
    order: 2,
    isPublished: true,
    usageLocations: ['Banner SPMB Pendaftaran', 'Galeri Kegiatan Belajar'],
    uploadedAt: '2026-10-10T09:30:00Z',
    uploadedBy: 'Ustadz Admin Utama'
  },
  {
    id: 'med-3',
    title: 'Halaqah Tahfidz Al-Qur\'an Bersama Asatidz',
    description: 'Kegiatan muroja\'ah dan setoran hafalan Al-Qur\'an metode Talaqqi di musholla As-Salam.',
    url: '/src/assets/images/tahfidz_quran_activity_1793682341601.jpg',
    category: 'keagamaan',
    fileSizeKb: 360,
    mimeType: 'image/jpeg',
    activityDate: '2026-10-18',
    isThumbnail: false,
    order: 3,
    isPublished: true,
    usageLocations: ['Program Unggulan Tahfidz', 'Galeri Keagamaan'],
    uploadedAt: '2026-10-18T07:45:00Z',
    uploadedBy: 'Ustadz Admin Utama'
  },
  {
    id: 'med-4',
    title: 'Kegiatan Ekstrakurikuler & Kepanduan SIT',
    description: 'Dokumentasi keceriaan dan kedisiplinan siswa dalam kepanduan Pramuka SIT dan latihan fisik.',
    url: '/src/assets/images/extracurricular_activities_1793682342535.jpg',
    category: 'ekstrakurikuler',
    fileSizeKb: 395,
    mimeType: 'image/jpeg',
    activityDate: '2026-10-22',
    isThumbnail: false,
    order: 4,
    isPublished: true,
    usageLocations: ['Ekstrakurikuler Pramuka SIT', 'Ekstrakurikuler Panahan Sunnah', 'Galeri Ekstrakurikuler'],
    uploadedAt: '2026-10-22T15:00:00Z',
    uploadedBy: 'Ustadz Admin Utama'
  }
];

export const INITIAL_WHATSAPP_SETTINGS: WhatsAppGroupSettings = {
  groupName: 'Grup Resmi SPMB SDIT INSAN CENDIKIA KALIBARU',
  inviteLink: 'https://chat.whatsapp.com/SDITInsanCendikia2027SPMB',
  groupLink: 'https://chat.whatsapp.com/SDITInsanCendikia2027SPMB',
  isActive: true,
  allowedStatuses: [
    'Terverifikasi',
    'Dalam Seleksi',
    'Diterima',
    'Menunggu Daftar Ulang',
    'Selesai Daftar Ulang',
    'Daftar Ulang'
  ],
  infoMessage: 'Terima kasih telah mendaftar di SDIT INSAN CENDIKIA KALIBARU. Silakan bergabung dengan Grup WhatsApp Resmi SPMB untuk memperoleh informasi terbaru mengenai tahapan dan proses penerimaan siswa baru.',
  updatedAt: '2026-11-08T08:00:00Z',
  updatedBy: 'Super Admin',
  history: [
    {
      id: 'wahist-1',
      link: 'https://chat.whatsapp.com/SDITInsanCendikia2027SPMB',
      changedBy: 'Ustadz Admin Utama',
      changedAt: '2026-11-01T08:00:00Z',
      notes: 'Inisialisasi link grup resmi WhatsApp SPMB TA 2027/2028'
    }
  ]
};

export const INITIAL_ADMIN_WHATSAPP_SETTINGS: AdminWhatsAppSettings = {
  adminPhone: '6281234567890',
  enableObservationButton: true,
  observationMessageTemplate: "Assalamu'alaikum Panitia SPMB SDIT Insan Cendikia Kalibaru. Saya wali murid dari ananda {{nama_siswa}} (No. Pendaftaran: {{nomor_pendaftaran}}), ingin menanyakan jadwal dan informasi teknis pelaksanaan observasi calon siswa baru. Terima kasih.",
  enablePaymentButton: true,
  paymentMessageTemplate: "Assalamu'alaikum Panitia SPMB SDIT Insan Cendikia Kalibaru. Saya wali murid dari ananda {{nama_siswa}} (No. Pendaftaran: {{nomor_pendaftaran}}), ingin melakukan konfirmasi dan penyelesaian administrasi pembayaran daftar ulang. Mohon informasi rekening dan petunjuk selanjutnya. Terima kasih.",
  updatedAt: '2026-11-01T08:00:00Z',
  updatedBy: 'Ustadz Admin Utama'
};

export const INITIAL_SPMB_WAVES: SpmbWave[] = [
  {
    ...INITIAL_SPMB_WAVE,
    id: 'wave-1',
    name: 'Gelombang 1 (Reguler & Prestasi)',
    waveType: 'gelombang_1',
    status: 'Dibuka',
    academicYear: '2027/2028',
    startDate: '2026-11-01',
    endDate: '2026-12-31',
    announcementDate: '2027-01-10',
    reRegistrationStartDate: '2027-01-12',
    reRegistrationEndDate: '2027-01-25',
    quota: 60,
    registeredCount: 38,
    acceptedCount: 24,
    registrationFee: 200000,
    isActive: true
  },
  {
    ...INITIAL_SPMB_WAVE,
    id: 'wave-2',
    name: 'Gelombang 2 (Reguler Lanjutan)',
    waveType: 'gelombang_2',
    status: 'Akan Dibuka',
    academicYear: '2027/2028',
    startDate: '2027-01-05',
    endDate: '2027-03-31',
    announcementDate: '2027-04-10',
    reRegistrationStartDate: '2027-04-12',
    reRegistrationEndDate: '2027-04-25',
    quota: 30,
    registeredCount: 0,
    acceptedCount: 0,
    registrationFee: 250000,
    isActive: false
  }
];

export const INITIAL_SPMB_STAGES: SpmbStageDefinition[] = [
  {
    id: 'stage-1',
    order: 1,
    title: 'Pendaftaran Online',
    description: 'Pengisian biodata calon siswa, data orang tua/wali, data pendidikan TK, dan kelengkapan kontak.',
    startDate: '2026-11-01',
    endDate: '2026-12-31',
    isActive: true,
    isRequired: true,
    showToParents: true,
    processType: 'pendaftaran',
    hasForm: true,
    isCompletedGlobally: true,
    actionInstruction: 'Pendaftaran online berhasil dikirim. Simpan Nomor Pendaftaran dan Tanggal Lahir ananda dengan baik.'
  },
  {
    id: 'stage-2',
    order: 2,
    title: 'Verifikasi Berkas',
    description: 'Pemeriksaan keabsahan dokumen kependudukan (Kartu Keluarga, Akta Kelahiran, dan Pas Foto calon siswa) oleh Panitia SPMB.',
    startDate: '2026-11-02',
    endDate: '2027-01-05',
    isActive: true,
    isRequired: true,
    showToParents: true,
    processType: 'verifikasi',
    hasDocumentUpload: true,
    isCompletedGlobally: false,
    actionInstruction: 'Dokumen sedang dalam antrean verifikasi panitia. Hasil pemeriksaan akan diperbarui dalam 1-2 hari kerja.'
  },
  {
    id: 'stage-3',
    order: 3,
    title: 'Perbaikan Berkas',
    description: 'Tahapan unggah ulang dokumen persyaratan jika terdapat foto atau scan yang buram, terpotong, atau belum lengkap.',
    startDate: '2026-11-02',
    endDate: '2027-01-06',
    isActive: true,
    isRequired: false,
    showToParents: true,
    processType: 'perbaikan',
    hasDocumentUpload: true,
    isCompletedGlobally: false,
    actionInstruction: 'Jika panitia meminta perbaikan, silakan klik tombol upload berkas perbaikan pada halaman ini.'
  },
  {
    id: 'stage-4',
    order: 4,
    title: 'Verifikasi Akhir',
    description: 'Validasi final seluruh berkas persyaratan dan penerbitan tanda lolos verifikasi administrasi.',
    startDate: '2026-11-03',
    endDate: '2027-01-07',
    isActive: true,
    isRequired: true,
    showToParents: true,
    processType: 'verifikasi',
    isCompletedGlobally: false,
    actionInstruction: 'Seluruh berkas persyaratan telah dinyatakan sah dan lengkap. Calon siswa berhak mengikuti observasi.'
  },
  {
    id: 'stage-5',
    order: 5,
    title: 'Observasi Calon Siswa',
    description: 'Sesi ramah anak untuk mengenal kesiapan belajar, motorik dasar, pengenalan huruf hijaiyah, dan wawancara pemetaan bersama orang tua.',
    startDate: '2027-01-08',
    endDate: '2027-01-09',
    isActive: true,
    isRequired: true,
    showToParents: true,
    processType: 'observasi',
    hasObservation: true,
    isCompletedGlobally: false,
    actionInstruction: 'Mohon hadir tepat waktu di sekolah SDIT Insan Cendikia Kalibaru sesuai pembagian sesi yang tertera.'
  },
  {
    id: 'stage-6',
    order: 6,
    title: 'Penilaian dan Seleksi',
    description: 'Pengolahan hasil observasi kesiapan belajar dan wawancara kemitraan keluarga oleh Tim Seleksi.',
    startDate: '2027-01-09',
    endDate: '2027-01-10',
    isActive: true,
    isRequired: true,
    showToParents: true,
    processType: 'seleksi',
    isCompletedGlobally: false,
    actionInstruction: 'Tim Seleksi sedang merumuskan hasil observasi dan alokasi daya tampung kelas.'
  },
  {
    id: 'stage-7',
    order: 7,
    title: 'Pengumuman Hasil Seleksi',
    description: 'Pengumuman resmi kelulusan calon siswa baru TA 2027/2028.',
    startDate: '2027-01-10',
    endDate: '2027-01-12',
    isActive: true,
    isRequired: true,
    showToParents: true,
    processType: 'pengumuman',
    isCompletedGlobally: false,
    actionInstruction: 'Pengumuman kelulusan resmi dapat diakses langsung melalui menu Cek Status Pendaftaran.'
  },
  {
    id: 'stage-8',
    order: 8,
    title: 'Daftar Ulang',
    description: 'Konfirmasi penerimaan, penyelesaian administrasi sekolah, dan pengambilan perlengkapan belajar.',
    startDate: '2027-01-12',
    endDate: '2027-01-25',
    isActive: true,
    isRequired: true,
    showToParents: true,
    processType: 'daftar_ulang',
    hasReRegistration: true,
    isCompletedGlobally: false,
    actionInstruction: 'Silakan lakukan daftar ulang dan konfirmasi keikutsertaan sebelum batas waktu berakhir.'
  },
  {
    id: 'stage-9',
    order: 9,
    title: 'Selesai',
    description: 'Calon siswa resmi tercatat sebagai siswa baru SDIT Insan Cendikia Kalibaru dan siap menyambut Masa Pengenalan Lingkungan Sekolah (MPLS).',
    startDate: '2027-01-26',
    endDate: '2027-07-15',
    isActive: true,
    isRequired: true,
    showToParents: true,
    processType: 'lainnya',
    isCompletedGlobally: false,
    actionInstruction: 'Alhamdulillah, seluruh rangkaian SPMB telah selesai. Selamat bergabung di keluarga besar SDIT Insan Cendikia Kalibaru!'
  }
];

export function createDefaultApplicantStages(status: RegistrationStatus): ApplicantStageProgress[] {
  return INITIAL_SPMB_STAGES.map(s => {
    let stageStatus: StageStatus = 'waiting';
    let notes = '';

    if (s.order === 1) {
      stageStatus = 'completed';
      notes = 'Pendaftaran online telah berhasil dikirim.';
    } else if (s.order === 2) {
      if (status === 'Menunggu Verifikasi') {
        stageStatus = 'in_progress';
        notes = 'Berkas sedang dalam antrean pemeriksaan panitia.';
      } else if (status === 'Perlu Perbaikan') {
        stageStatus = 'action_needed';
        notes = 'Terdapat berkas yang memerlukan perbaikan dari orang tua.';
      } else {
        stageStatus = 'completed';
        notes = 'Pemeriksaan berkas telah selesai dan dinyatakan sah.';
      }
    } else if (s.order === 3) {
      if (status === 'Perlu Perbaikan') {
        stageStatus = 'action_needed';
        notes = 'Mohon unggah dokumen perbaikan sesuai catatan panitia.';
      } else if (['Terverifikasi', 'Dalam Seleksi', 'Diterima', 'Menunggu Daftar Ulang', 'Selesai Daftar Ulang', 'Daftar Ulang'].includes(status)) {
        stageStatus = 'completed';
        notes = 'Berkas telah lengkap dan sah.';
      } else {
        stageStatus = 'waiting';
      }
    } else if (s.order === 4) {
      if (['Terverifikasi', 'Dalam Seleksi', 'Diterima', 'Menunggu Daftar Ulang', 'Selesai Daftar Ulang', 'Daftar Ulang'].includes(status)) {
        stageStatus = 'completed';
        notes = 'Verifikasi berkas selesai dan dinyatakan lolos administrasi.';
      } else {
        stageStatus = 'waiting';
      }
    } else if (s.order === 5) {
      if (status === 'Dalam Seleksi') {
        stageStatus = 'in_progress';
        notes = 'Menunggu pelaksanaan sesi observasi calon siswa.';
      } else if (['Diterima', 'Tidak Diterima', 'Menunggu Daftar Ulang', 'Selesai Daftar Ulang', 'Daftar Ulang'].includes(status)) {
        stageStatus = 'completed';
        notes = 'Sesi observasi calon siswa telah selesai dilaksanakan.';
      } else {
        stageStatus = 'waiting';
      }
    } else if (s.order === 6) {
      if (['Diterima', 'Tidak Diterima', 'Menunggu Daftar Ulang', 'Selesai Daftar Ulang', 'Daftar Ulang'].includes(status)) {
        stageStatus = 'completed';
        notes = 'Penilaian observasi dan wawancara telah selesai diolah.';
      } else if (status === 'Dalam Seleksi') {
        stageStatus = 'in_progress';
        notes = 'Proses rekapitulasi penilaian seleksi.';
      } else {
        stageStatus = 'waiting';
      }
    } else if (s.order === 7) {
      if (['Diterima', 'Tidak Diterima', 'Menunggu Daftar Ulang', 'Selesai Daftar Ulang', 'Daftar Ulang'].includes(status)) {
        stageStatus = 'completed';
        notes = status === 'Tidak Diterima' ? 'Hasil seleksi telah diumumkan (Belum memenuhi kuota).' : 'Hasil seleksi diumumkan: Diterima.';
      } else {
        stageStatus = 'waiting';
      }
    } else if (s.order === 8) {
      if (status === 'Selesai Daftar Ulang') {
        stageStatus = 'completed';
        notes = 'Daftar ulang dan administrasi telah selesai.';
      } else if (['Diterima', 'Menunggu Daftar Ulang', 'Daftar Ulang'].includes(status)) {
        stageStatus = 'in_progress';
        notes = 'Menunggu penyelesaian administrasi daftar ulang sekolah.';
      } else {
        stageStatus = 'waiting';
      }
    } else if (s.order === 9) {
      if (status === 'Selesai Daftar Ulang') {
        stageStatus = 'completed';
        notes = 'Alhamdulillah, ananda resmi terdaftar sebagai siswa baru SDIT Insan Cendikia Kalibaru.';
      } else {
        stageStatus = 'waiting';
      }
    }

    return {
      stageId: s.id,
      order: s.order,
      title: s.title,
      status: stageStatus,
      completedAt: stageStatus === 'completed' ? '2026-11-02T10:00:00Z' : undefined,
      notes: notes || s.description,
      actionInstruction: s.actionInstruction,
      actionRequired: stageStatus === 'action_needed',
      updatedBy: 'Panitia SPMB',
      updatedAt: '2026-11-02T10:00:00Z'
    };
  });
}



