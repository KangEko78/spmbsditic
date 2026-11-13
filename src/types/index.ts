/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 
  | 'super_admin' 
  | 'admin_sekolah' 
  | 'panitia_spmb' 
  | 'tim_seleksi' 
  | 'kepala_sekolah';

export type ProcessType = 
  | 'pendaftaran' 
  | 'verifikasi' 
  | 'perbaikan' 
  | 'observasi' 
  | 'seleksi' 
  | 'pengumuman' 
  | 'daftar_ulang' 
  | 'lainnya';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  avatarUrl?: string;
  phone?: string;
  jabatan: string; // e.g. "Kepala Sekolah", "Koordinator Kurikulum", "Sekretaris SPMB"
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  lastLogin?: string; // Compatibility alias
  mustChangePassword?: boolean;
  password?: string; // Stored hashed/salted or server state
  passwordHash?: string;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  name: string;
  password?: string;
  avatarUrl?: string;
  phone?: string;
  jabatan: string;
  role: UserRole;
  isActive: boolean;
}

export interface UpdateUserPayload {
  id: string;
  username?: string;
  email?: string;
  name?: string;
  password?: string;
  avatarUrl?: string;
  phone?: string;
  jabatan?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserProfileUpdatePayload {
  name: string;
  phone?: string;
  avatarUrl?: string;
}

export interface PasswordChangePayload {
  currentPassword?: string;
  newPassword: string;
}

export type RegistrationStatus = 
  | 'Draft'
  | 'Menunggu Verifikasi'
  | 'Perlu Perbaikan'
  | 'Terverifikasi'
  | 'Dalam Seleksi'
  | 'Diterima'
  | 'Tidak Diterima'
  | 'Menunggu Daftar Ulang'
  | 'Selesai Daftar Ulang'
  | 'Daftar Ulang';

export type IncomeRange = 
  | 'Tidak Berpenghasilan'
  | 'Rp500.000 – Rp1.000.000'
  | 'Lebih dari Rp1.000.000 – Rp2.000.000'
  | 'Lebih dari Rp2.000.000 – Rp3.000.000'
  | 'Lebih dari Rp3.000.000 – Rp5.000.000'
  | 'Lebih dari Rp5.000.000 – Rp10.000.000'
  | 'Lebih dari Rp10.000.000';

export type ChildStatus = 'Yatim' | 'Piatu' | 'Yatim Piatu' | 'Tidak termasuk ketiganya';

export type LivingWith = 'Ayah dan Ibu' | 'Ayah' | 'Ibu' | 'Wali' | 'Kakek/Nenek' | 'Saudara' | 'Lainnya';

export type HouseStatus = 'Hak Milik' | 'Kontrak/Sewa' | 'Rumah Keluarga' | 'Menumpang' | 'Lainnya';

export interface ResidenceData {
  livingWith: LivingWith;
  livingWithOtherNote?: string;
  currentAddress: string;
  rtRw?: string;
  village: string;
  district: string;
  regency: string;
  province?: string;
  postalCode?: string;
  houseStatus: HouseStatus;
  houseStatusOtherNote?: string;
  vehicleCount: number;
}

export interface StudentData {
  fullName: string;
  nickname: string;
  gender: 'Laki-laki' | 'Perempuan';
  birthPlace: string;
  birthDate: string;
  nik: string;
  childNumber: number; // Anak ke-
  totalSiblings: number; // Jumlah saudara
  childStatus?: ChildStatus; // Yatim | Piatu | Yatim Piatu | Tidak termasuk ketiganya
  hasSpecialNeeds?: 'Ya' | 'Tidak'; // Berkebutuhan khusus
  specialNeedsDescription?: string; // Keterangan jika Ya
  religion: string;
  bloodType?: string;
  address: string;
  rtRw?: string;
  village: string;
  district: string;
  regency: string;
  province?: string;
  postalCode?: string;
  residence?: ResidenceData; // Data Tempat Tinggal
  previousSchool?: string; // TK / RA / PAUD
  previousSchoolAddress?: string;
  specialNeeds?: string; // compatibility
  hobby?: string;
  ambition?: string;
}

export interface ParentData {
  fatherStatus?: 'Masih Hidup' | 'Meninggal Dunia' | 'Tidak Diketahui';
  fatherName: string;
  fatherNik: string;
  fatherPhone: string;
  fatherJob: string;
  fatherEducation: string;
  fatherIncome: string; // IncomeRange | string
  motherStatus?: 'Masih Hidup' | 'Meninggal Dunia' | 'Tidak Diketahui';
  motherName: string;
  motherNik: string;
  motherPhone: string;
  motherJob: string;
  motherEducation: string;
  motherIncome: string; // IncomeRange | string
  hasGuardian?: boolean;
  guardianName?: string;
  guardianNik?: string;
  guardianPhone?: string;
  guardianRelation?: string;
  guardianEducation?: string;
  guardianJob?: string;
  guardianIncome?: string; // IncomeRange | string
  parentAddress: string;
}

export interface DocumentRevision {
  id: string;
  fileUrl: string;
  fileName: string;
  fileSizeKb: number;
  uploadedAt: string;
  notes?: string;
}

export interface UploadedDocument {
  id: string;
  name: string;
  type: 'kk' | 'akta' | 'foto' | 'ijazah' | 'ktp_ortu' | 'bukti_bayar' | 'surat_keterangan';
  label: string;
  fileUrl: string; // base64 or stored URL
  fileName: string;
  fileSizeKb: number;
  uploadedAt: string;
  isVerified?: boolean;
  needsRevision?: boolean;
  revisionNote?: string;
  status?: 'Perlu Perbaikan' | 'Menunggu Upload' | 'Sudah Diunggah' | 'Sedang Diverifikasi' | 'Terverifikasi';
  revisionHistory?: DocumentRevision[];
}

export interface VerificationLog {
  id: string;
  verifiedBy: string;
  verifierRole: string;
  status: RegistrationStatus;
  notes: string;
  timestamp: string;
}

export interface SelectionScore {
  observasiKesiapan: number; // 0-100 (kognitif dasar, motorik)
  bacaQuranIqro: number; // 0-100 (pengenalan huruf hijaiyah / iqro)
  wawancaraOrtu: number; // 0-100 (komitmen pendampingan)
  totalScore: number;
  catatanSeleksi: string;
  evaluatedBy: string;
  evaluatedAt: string;
}

export type PaymentStatus = 
  | 'Belum Upload' 
  | 'Menunggu Verifikasi' 
  | 'Disetujui' 
  | 'Ditolak' 
  | 'Perlu Upload Ulang';

export interface PaymentProof {
  method: 'Tunai di Sekretariat' | 'Transfer Bank Jatim';
  paymentDate: string;
  amount: number; // 50000
  senderName: string;
  fileUrl: string;
  fileName: string;
  fileSizeKb?: number;
  uploadedAt: string;
  status: PaymentStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  adminNotes?: string;
  history?: Array<{
    status: PaymentStatus;
    notes?: string;
    timestamp: string;
    operator?: string;
  }>;
}

export type ReRegistrationStatus =
  | 'Belum Daftar Ulang'
  | 'Menunggu Persetujuan'
  | 'Perlu Perbaikan'
  | 'Disetujui Admin Sekolah'
  | 'Selesai Daftar Ulang';

export interface ReRegistrationData {
  isConfirmed: boolean;
  confirmedAt?: string;
  paymentReceiptUrl?: string;
  paymentAmount?: number;
  status?: ReRegistrationStatus;
  paymentProof?: PaymentProof;
  approvedBy?: string;
  approvedAt?: string;
  adminNotes?: string;
  notes?: string;
}

export type StageStatus = 'completed' | 'in_progress' | 'waiting' | 'action_needed' | 'not_applicable';

export interface SpmbStageDefinition {
  id: string; // e.g. "stage-1" or uuid
  order: number; // 1, 2, 3...
  title: string; // e.g. "Pendaftaran Online"
  description: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  isRequired: boolean;
  showToParents: boolean;
  processType?: 'pendaftaran' | 'verifikasi' | 'perbaikan' | 'observasi' | 'seleksi' | 'pengumuman' | 'daftar_ulang' | 'lainnya' | string;
  actionInstruction?: string;
  hasForm?: boolean;
  hasDocumentUpload?: boolean;
  hasObservation?: boolean;
  hasReRegistration?: boolean;
  colorStatus?: string;
  isCompletedGlobally?: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export interface SpmbFlowSettings {
  stages: SpmbStageDefinition[];
  draftStages?: SpmbStageDefinition[];
  isDraft: boolean;
  publishedAt?: string;
  publishedBy?: string;
}

export interface AdminWhatsAppSettings {
  adminPhone: string; // e.g. "6281234567890"
  enableObservationButton: boolean;
  observationMessageTemplate: string;
  enablePaymentButton: boolean;
  paymentMessageTemplate: string;
  updatedAt?: string;
  updatedBy?: string;
  phoneNumber?: string;
  enableObservasiButton?: boolean;
  observasiTemplate?: string;
  enableDaftarUlangButton?: boolean;
  daftarUlangTemplate?: string;
}

export interface ApplicantStageProgress {
  stageId: string;
  order: number;
  title: string;
  status: StageStatus;
  completedAt?: string;
  notes?: string;
  actionInstruction?: string;
  actionRequired?: boolean;
  updatedBy?: string;
  updatedAt?: string;
}

export interface Registration {
  id: string;
  registrationNumber: string; // e.g. SPMB-2026-001
  userId: string;
  userEmail: string;
  waveId: string;
  waveName?: string;
  status: RegistrationStatus;
  student: StudentData;
  parent: ParentData;
  residence?: ResidenceData;
  documents: UploadedDocument[];
  verificationLogs: VerificationLog[];
  stages?: ApplicantStageProgress[];
  selection?: SelectionScore;
  reRegistration?: ReRegistrationData;
  paymentProof?: PaymentProof;
  academicYear?: string;
  selectionResult?: {
    isPassed: boolean;
    evaluatedAt: string;
    catatanSeleksi: string;
  };
  submittedAt: string;
  updatedAt: string;
  revisionNotes?: string;
}

export interface Teacher {
  id: string;
  name: string;
  title: string; // e.g. "S.Pd.I", "M.Pd"
  role: string; // e.g. "Kepala Sekolah", "Guru Kelas 1", "Guru Tahfidz"
  division: 'Pimpinan' | 'Guru Kelas' | 'Guru Bidang Studi' | 'Guru Al-Qur\'an' | 'Tenaga Kependidikan';
  education: string;
  imageUrl?: string;
  quote?: string;
  order: number;
}

export interface ProgramUnggulan {
  id: string;
  title: string;
  category: 'Pendidikan Islam' | 'Tahfidz Al-Qur\'an' | 'Akademik' | 'Karakter & Adab';
  description: string;
  detailedPoints: string[];
  imageUrl?: string;
  isPublished: boolean;
  order: number;
}

export interface Extracurricular {
  id: string;
  name: string;
  category: 'Keagamaan' | 'Olahraga & Beladiri' | 'Kecakapan Hidup' | 'Sains & Teknologi' | 'Seni Budaya';
  coach: string;
  schedule: string;
  description: string;
  imageUrl?: string;
  additionalImages?: string[];
  isPublished: boolean;
}

export interface SchoolBranding {
  mainLogoUrl?: string;
  navbarLogoUrl?: string;
  footerLogoUrl?: string;
  loginLogoUrl?: string;
  receiptLogoUrl?: string;
  faviconUrl?: string;
  heroBannerUrl?: string;
  spmbBannerUrl?: string;
  profilePhotoUrl?: string;
  logoHeightPx?: number;
  logoScale?: number;
  showTextWithLogo?: boolean;
  showSchoolNameNextToLogo?: boolean;
  updatedAt?: string;
}

export interface MediaItem {
  id: string;
  title: string;
  name?: string;
  fileName?: string;
  url: string;
  category: string;
  description?: string;
  fileSizeKb?: number;
  mimeType?: string;
  uploadedAt: string;
  uploadedBy?: string;
  activityDate?: string;
  isThumbnail?: boolean;
  order?: number;
  usageLocations?: string[];
  isPublished: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Kegiatan Belajar' | 'Keagamaan' | 'Olahraga' | 'Seni' | 'Ekstrakurikuler' | 'Acara Sekolah';
  imageUrl: string;
  date: string;
  description: string;
  isPublished: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  studentName: string;
  level: 'Kecamatan' | 'Kabupaten' | 'Karesidenan' | 'Provinsi' | 'Nasional';
  category: 'Tahfidz & Agama' | 'Sains & Matematika' | 'Olahraga & Seni' | 'Literasi';
  rank: string; // e.g. "Juara 1", "Medali Emas"
  date: string;
  description: string;
  imageUrl?: string;
  isDemo: boolean;
}

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  category: 'Berita Sekolah' | 'SPMB' | 'Kegiatan Siswa' | 'Prestasi' | 'Artikel Parenting';
  summary: string;
  content: string;
  author: string;
  publishedAt: string;
  imageUrl?: string;
  isPublished: boolean;
  views: number;
}

export interface SchoolProfile {
  name: string;
  tagline: string;
  npsn: string;
  accreditation: string;
  address: string;
  district: string;
  regency: string;
  province: string;
  postalCode: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  headmasterName: string;
  headmasterGreeting: string;
  headmasterPhoto?: string;
  spmbChairmanName?: string;
  history: string;
  vision: string;
  mission: string[];
  goals: string[];
  facilities: Array<{
    id: string;
    name: string;
    description: string;
    icon?: string;
    imageUrl?: string;
  }>;
  branding?: SchoolBranding;
}

export interface SpmbWave {
  id: string;
  name: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  announcementDate: string;
  reRegistrationStartDate: string;
  reRegistrationEndDate: string;
  quota: number;
  registeredCount: number;
  acceptedCount: number;
  registrationFee: number;
  isActive: boolean;
  status?: 'Akan Dibuka' | 'Dibuka' | 'Ditutup';
  waveType?: 'gelombang_1' | 'gelombang_2';
  requirements: string[];
  selectionFlow: Array<{
    step: number;
    title: string;
    description: string;
  }>;
  faq: Array<{
    question: string;
    answer: string;
  }>;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface GoogleSheetSettings {
  spreadsheetId: string; // '1_zt6amQtAr3eGjSPqwaJrIT_irLZvICla9j5lOX2kEM'
  appsScriptUrl?: string;
  autoSync: boolean;
  lastSyncAt?: string;
  lastSyncStatus?: 'success' | 'error' | 'idle';
  lastSyncMessage?: string;
  syncedCount?: number;
}

export interface SystemSettings {
  isSpmbOpen: boolean;
  currentAcademicYear: string;
  enableOnlinePaymentReceipt: boolean;
  showDemoNotice: boolean;
  dataSource: 'local_database' | 'firebase_firestore';
  firebaseConfigured: boolean;
  googleSheetSettings?: GoogleSheetSettings;
  lastBackupDate?: string;
}

export interface WhatsAppGroupHistory {
  id: string;
  link: string;
  changedBy: string;
  changedAt: string;
  notes?: string;
  updatedBy?: string;
  timestamp?: string;
  previousLink?: string;
  newLink?: string;
}

export interface WhatsAppGroupSettings {
  groupName: string;
  inviteLink: string;
  groupLink?: string;
  isActive: boolean;
  allowedStatuses: RegistrationStatus[];
  infoMessage: string;
  updatedAt: string;
  updatedBy: string;
  history?: WhatsAppGroupHistory[];
}

export interface CheckStatusResult {
  registrationNumber: string;
  childName: string;
  academicYear: string;
  waveName: string;
  submittedAt: string;
  updatedAt: string;
  status: RegistrationStatus;
  panitiaNotes: string;
  sessionToken?: string;
  verificationHistory: Array<{
    status: string;
    notes: string;
    timestamp: string;
  }>;
  stages?: ApplicantStageProgress[];
  needsDocumentRevision: boolean;
  documentsToRevise?: Array<{
    id: string;
    name: string;
    label: string;
    currentFileName?: string;
    revisionNote: string;
    status: 'Perlu Perbaikan' | 'Menunggu Upload' | 'Sudah Diunggah' | 'Sedang Diverifikasi' | 'Terverifikasi';
    currentUrl?: string;
  }>;
  whatsAppGroup?: {
    isEligible: boolean;
    groupName: string;
    inviteLink: string;
    infoMessage: string;
    isActive: boolean;
  } | null;
  adminWhatsApp?: {
    adminPhone: string;
    enableObservation: boolean;
    observationLink: string;
    observasiUrl?: string;
    enablePayment: boolean;
    paymentLink: string;
    daftarUlangUrl?: string;
  } | null;
  selectionResult?: {
    isPassed: boolean;
    evaluatedAt: string;
    catatanSeleksi: string;
  } | null;
  paymentProof?: PaymentProof | null;
  reRegistration: {
    isEligible: boolean;
    isCompleted: boolean;
    deadline: string;
    totalCost: number;
    paymentAccount: string;
    instructions: string;
  };
}
