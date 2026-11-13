/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  INITIAL_SCHOOL_PROFILE,
  INITIAL_PROGRAMS,
  INITIAL_EXTRACURRICULARS,
  INITIAL_TEACHERS,
  INITIAL_GALLERY,
  INITIAL_ACHIEVEMENTS,
  INITIAL_NEWS,
  INITIAL_SPMB_WAVE,
  INITIAL_SPMB_WAVES,
  INITIAL_USERS,
  INITIAL_REGISTRATIONS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_SETTINGS,
  INITIAL_MEDIA_LIBRARY,
  INITIAL_WHATSAPP_SETTINGS,
  INITIAL_ADMIN_WHATSAPP_SETTINGS,
  INITIAL_SPMB_STAGES,
  createDefaultApplicantStages
} from './src/data/initialData.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');
const UPLOADS_DIR = path.resolve(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

interface AppDatabase {
  schoolProfile: typeof INITIAL_SCHOOL_PROFILE;
  programs: typeof INITIAL_PROGRAMS;
  extracurriculars: typeof INITIAL_EXTRACURRICULARS;
  teachers: typeof INITIAL_TEACHERS;
  gallery: typeof INITIAL_GALLERY;
  achievements: typeof INITIAL_ACHIEVEMENTS;
  news: typeof INITIAL_NEWS;
  spmbWave: typeof INITIAL_SPMB_WAVE;
  spmbWaves: typeof INITIAL_SPMB_WAVES;
  users: typeof INITIAL_USERS;
  registrations: typeof INITIAL_REGISTRATIONS;
  activityLogs: typeof INITIAL_ACTIVITY_LOGS;
  settings: typeof INITIAL_SETTINGS;
  mediaLibrary: typeof INITIAL_MEDIA_LIBRARY;
  whatsappSettings: typeof INITIAL_WHATSAPP_SETTINGS;
  adminWhatsAppSettings: typeof INITIAL_ADMIN_WHATSAPP_SETTINGS;
  spmbStages: typeof INITIAL_SPMB_STAGES;
  draftStages?: typeof INITIAL_SPMB_STAGES;
  flowSettings?: {
    publishedAt?: string;
    publishedBy?: string;
    isDraft: boolean;
  };
}

function getInitialDatabase(): AppDatabase {
  return {
    schoolProfile: JSON.parse(JSON.stringify(INITIAL_SCHOOL_PROFILE)),
    programs: JSON.parse(JSON.stringify(INITIAL_PROGRAMS)),
    extracurriculars: JSON.parse(JSON.stringify(INITIAL_EXTRACURRICULARS)),
    teachers: JSON.parse(JSON.stringify(INITIAL_TEACHERS)),
    gallery: JSON.parse(JSON.stringify(INITIAL_GALLERY)),
    achievements: JSON.parse(JSON.stringify(INITIAL_ACHIEVEMENTS)),
    news: JSON.parse(JSON.stringify(INITIAL_NEWS)),
    spmbWave: JSON.parse(JSON.stringify(INITIAL_SPMB_WAVE)),
    spmbWaves: JSON.parse(JSON.stringify(INITIAL_SPMB_WAVES)),
    users: JSON.parse(JSON.stringify(INITIAL_USERS)),
    registrations: JSON.parse(JSON.stringify(INITIAL_REGISTRATIONS)),
    activityLogs: JSON.parse(JSON.stringify(INITIAL_ACTIVITY_LOGS)),
    settings: JSON.parse(JSON.stringify(INITIAL_SETTINGS)),
    mediaLibrary: JSON.parse(JSON.stringify(INITIAL_MEDIA_LIBRARY)),
    whatsappSettings: JSON.parse(JSON.stringify(INITIAL_WHATSAPP_SETTINGS)),
    adminWhatsAppSettings: JSON.parse(JSON.stringify(INITIAL_ADMIN_WHATSAPP_SETTINGS)),
    spmbStages: JSON.parse(JSON.stringify(INITIAL_SPMB_STAGES)),
    draftStages: JSON.parse(JSON.stringify(INITIAL_SPMB_STAGES)),
    flowSettings: {
      publishedAt: '2026-11-01T08:00:00Z',
      publishedBy: 'Super Admin',
      isDraft: false
    }
  };
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(String(password || '') + '_sdit_insan_cendikia_salt_2027').digest('hex');
}

function loadDatabase(): AppDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialDatabase();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    let changed = false;
    if (!parsed.mediaLibrary || !Array.isArray(parsed.mediaLibrary)) {
      parsed.mediaLibrary = JSON.parse(JSON.stringify(INITIAL_MEDIA_LIBRARY));
      changed = true;
    }
    if (!parsed.schoolProfile.branding) {
      parsed.schoolProfile.branding = JSON.parse(JSON.stringify(INITIAL_SCHOOL_PROFILE.branding));
      changed = true;
    }
    if (!parsed.whatsappSettings) {
      parsed.whatsappSettings = JSON.parse(JSON.stringify(INITIAL_WHATSAPP_SETTINGS));
      changed = true;
    }
    if (!parsed.adminWhatsAppSettings) {
      parsed.adminWhatsAppSettings = JSON.parse(JSON.stringify(INITIAL_ADMIN_WHATSAPP_SETTINGS));
      changed = true;
    }
    if (!parsed.spmbWaves || !Array.isArray(parsed.spmbWaves) || parsed.spmbWaves.length === 0) {
      parsed.spmbWaves = JSON.parse(JSON.stringify(INITIAL_SPMB_WAVES));
      changed = true;
    }
    if (!parsed.spmbStages || !Array.isArray(parsed.spmbStages)) {
      parsed.spmbStages = JSON.parse(JSON.stringify(INITIAL_SPMB_STAGES));
      changed = true;
    }
    if (!parsed.draftStages || !Array.isArray(parsed.draftStages)) {
      parsed.draftStages = JSON.parse(JSON.stringify(parsed.spmbStages));
      changed = true;
    }
    if (!parsed.flowSettings) {
      parsed.flowSettings = {
        publishedAt: '2026-11-01T08:00:00Z',
        publishedBy: 'Super Admin',
        isDraft: false
      };
      changed = true;
    }
    if (!parsed.settings) {
      parsed.settings = JSON.parse(JSON.stringify(INITIAL_SETTINGS));
      changed = true;
    }
    if (!parsed.settings.googleSheetSettings) {
      parsed.settings.googleSheetSettings = {
        spreadsheetId: '1_zt6amQtAr3eGjSPqwaJrIT_irLZvICla9j5lOX2kEM',
        appsScriptUrl: '',
        autoSync: true,
        lastSyncStatus: 'idle',
        lastSyncMessage: 'Siap menghubungkan ke Google Apps Script Spreadsheet 1_zt6amQtAr3eGjSPqwaJrIT_irLZvICla9j5lOX2kEM'
      };
      changed = true;
    } else if (!parsed.settings.googleSheetSettings.spreadsheetId) {
      parsed.settings.googleSheetSettings.spreadsheetId = '1_zt6amQtAr3eGjSPqwaJrIT_irLZvICla9j5lOX2kEM';
      changed = true;
    }
    if (Array.isArray(parsed.registrations)) {
      parsed.registrations.forEach((r: any) => {
        if (!r.stages || !Array.isArray(r.stages) || r.stages.length === 0) {
          r.stages = createDefaultApplicantStages(r.status);
          changed = true;
        }
      });
    }
    if (Array.isArray(parsed.users)) {
      // Remove any wali_murid accounts from internal users list
      const beforeCount = parsed.users.length;
      parsed.users = parsed.users.filter((u: any) => u.role !== 'wali_murid');
      if (parsed.users.length !== beforeCount) {
        changed = true;
      }
      parsed.users.forEach((u: any) => {
        if (u.isActive === undefined) {
          u.isActive = true;
          changed = true;
        }
        if (!u.username) {
          u.username = u.email ? u.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_') : `user_${u.id}`;
          changed = true;
        }
        if (!u.jabatan) {
          const roleLabels: Record<string, string> = {
            super_admin: 'Administrator Utama & IT',
            admin_sekolah: 'Waka Kurikulum & Konten Web',
            panitia_spmb: 'Sekretaris & Verifikator SPMB',
            tim_seleksi: 'Koordinator Tim Observasi',
            kepala_sekolah: 'Kepala Sekolah'
          };
          u.jabatan = roleLabels[u.role] || 'Staf Sekolah';
          changed = true;
        }
        // Ensure passwordHash exists and delete plain text password
        if (!u.passwordHash) {
          // Never create a shared/default admin password. Provision credentials explicitly.
          if (u.password) {
            u.passwordHash = hashPassword(u.password);
            delete u.password;
            changed = true;
          }
        } else if (u.password) {
          delete u.password;
          changed = true;
        }
      });
    }
    if (changed) {
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    return parsed;
  } catch (err) {
    console.error('Error loading database, returning fresh state:', err);
    return getInitialDatabase();
  }
}

function saveDatabase(db: AppDatabase): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database to file:', err);
  }
}

let db = loadDatabase();

function logActivity(userId: string, userName: string, userRole: string, action: string, details: string) {
  const newLog = {
    id: `log-${Date.now()}`,
    userId,
    userName,
    userRole,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  db.activityLogs.unshift(newLog);
  if (db.activityLogs.length > 200) {
    db.activityLogs = db.activityLogs.slice(0, 200);
  }
  saveDatabase(db);
}

const GOOGLE_APPS_SCRIPT_CODE = `/**
 * Google Apps Script Web App untuk SPMB SDIT INSAN CENDIKIA KALIBARU
 * Spreadsheet ID: 1_zt6amQtAr3eGjSPqwaJrIT_irLZvICla9j5lOX2kEM
 * 
 * Petunjuk Pemasangan:
 * 1. Buka Google Sheet: https://docs.google.com/spreadsheets/d/1_zt6amQtAr3eGjSPqwaJrIT_irLZvICla9j5lOX2kEM/edit
 * 2. Klik menu "Ekstensi" > "Apps Script" (Extensions > Apps Script).
 * 3. Hapus kode default, lalu tempelkan seluruh kode ini ke dalam Code.gs.
 * 4. Klik tombol "Simpan" (Save).
 * 5. Klik "Terapkan" (Deploy) > "Penerapan Baru" (New Deployment).
 * 6. Pilih jenis: "Aplikasi Web" (Web app).
 *    - Deskripsi: SPMB SDIT Insan Cendikia Web App Sync
 *    - Jalankan sebagai (Execute as): "Saya" (Me - pemilik spreadsheet)
 *    - Siapa yang memiliki akses (Who has access): "Siapa saja" (Anyone)
 * 7. Klik "Terapkan" (Deploy), berikan izin otorisasi Google jika diminta.
 * 8. Salin URL Aplikasi Web (Web App URL) dan simpan ke menu Pengaturan Integrasi Google Sheet di dashboard sekolah.
 */

const SPREADSHEET_ID = '1_zt6amQtAr3eGjSPqwaJrIT_irLZvICla9j5lOX2kEM';
const SHEET_NAME = 'DATA_PENDAFTAR_SPMB';

const HEADERS = [
  'No',
  'Waktu Submit',
  'No Registrasi',
  'Status Pendaftaran',
  'Gelombang',
  'Tahun Ajaran',
  'Nama Lengkap Siswa',
  'Nama Panggilan',
  'Jenis Kelamin',
  'Tempat Lahir',
  'Tanggal Lahir',
  'NIK Siswa',
  'Anak Ke',
  'Dari Bersaudara',
  'Status Anak',
  'Berkebutuhan Khusus',
  'Keterangan ABK',
  'Hobi / Cita-cita',
  'Bertempat Tinggal Dengan',
  'Alamat Domisili',
  'RT / RW',
  'Desa / Kelurahan',
  'Kecamatan',
  'Kabupaten / Kota',
  'Provinsi',
  'Status Kepemilikan Rumah',
  'Jumlah Kendaraan',
  'Asal TK / PAUD',
  'Alamat Asal TK',
  'Status Ayah',
  'Nama Ayah',
  'NIK Ayah',
  'Pendidikan Ayah',
  'Pekerjaan Ayah',
  'Penghasilan Ayah',
  'No WA Ayah',
  'Status Ibu',
  'Nama Ibu',
  'NIK Ibu',
  'Pendidikan Ibu',
  'Pekerjaan Ibu',
  'Penghasilan Ibu',
  'No WA Ibu',
  'Memiliki Wali',
  'Hubungan Wali',
  'Nama Wali',
  'NIK Wali',
  'Pendidikan Wali',
  'Pekerjaan Wali',
  'Penghasilan Wali',
  'No WA Wali',
  'Biaya Pendaftaran',
  'Status Pembayaran',
  'Metode Bayar',
  'Tanggal Bayar',
  'Nama Penyetor',
  'Link Bukti Pembayaran',
  'Skor Seleksi',
  'Status Kelulusan',
  'Status Daftar Ulang',
  'Terakhir Diperbarui'
];

function getTargetSheet() {
  let ss;
  try {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (e) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setBackground('#123B35')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    service: 'SPMB SDIT Insan Cendikia Kalibaru Apps Script Sync',
    spreadsheetId: SPREADSHEET_ID,
    sheetName: SHEET_NAME,
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getTargetSheet();
    
    if (Array.isArray(data.registrations)) {
      data.registrations.forEach(reg => upsertRegistration(sheet, reg));
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        count: data.registrations.length,
        message: 'Berhasil menyinkronkan seluruh data pendaftar ke Google Sheet.'
      })).setMimeType(ContentService.MimeType.JSON);
    } else if (data.registration) {
      upsertRegistration(sheet, data.registration);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        registrationNumber: data.registration.registrationNumber,
        message: 'Berhasil mencatat pendaftaran ke Google Sheet.'
      })).setMimeType(ContentService.MimeType.JSON);
    } else if (data.action === 'ping') {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Koneksi ke Google Apps Script berhasil teruji aktif.'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Format data tidak dikenali.'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function upsertRegistration(sheet, r) {
  const regNum = r.registrationNumber;
  const values = sheet.getDataRange().getValues();
  let rowIndex = -1;
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][2] === regNum) {
      rowIndex = i + 1;
      break;
    }
  }
  
  const proof = r.paymentProof || (r.reRegistration && r.reRegistration.paymentProof) || {};
  const res = r.residence || (r.student && r.student.residence) || {};
  const parent = r.parent || {};
  const student = r.student || {};
  
  const rowData = [
    rowIndex > 0 ? rowIndex - 1 : values.length,
    r.submittedAt || new Date().toISOString(),
    regNum,
    r.status || 'Menunggu Verifikasi',
    r.waveName || 'Gelombang 1',
    r.academicYear || '2027/2028',
    student.fullName || '',
    student.nickname || '',
    student.gender || '',
    student.birthPlace || '',
    student.birthDate || '',
    "'" + (student.nik || ''),
    student.childNumber || 1,
    student.totalSiblings || 0,
    student.childStatus || 'Tidak termasuk ketiganya',
    student.hasSpecialNeeds ? 'Ya' : 'Tidak',
    student.specialNeedsDescription || '',
    (student.hobby || '') + ' / ' + (student.ambition || ''),
    res.livingWith === 'Lainnya' ? (res.livingWithOther || 'Lainnya') : (res.livingWith || 'Ayah dan Ibu'),
    res.currentAddress || student.address || '',
    res.rtRw || student.rtRw || '01/01',
    res.village || student.village || '',
    res.district || student.district || '',
    res.regency || student.regency || '',
    res.province || student.province || 'Jawa Timur',
    res.houseStatus === 'Lainnya' ? (res.houseStatusOther || 'Lainnya') : (res.houseStatus || 'Hak Milik'),
    res.vehicleCount !== undefined ? res.vehicleCount : 1,
    student.previousSchool || '',
    student.previousSchoolAddress || '',
    parent.fatherStatus || 'Masih Hidup',
    parent.fatherName || '',
    "'" + (parent.fatherNik || ''),
    parent.fatherEducation || '',
    parent.fatherJob || '',
    parent.fatherIncome || '',
    "'" + (parent.fatherPhone || ''),
    parent.motherStatus || 'Masih Hidup',
    parent.motherName || '',
    "'" + (parent.motherNik || ''),
    parent.motherEducation || '',
    parent.motherJob || '',
    parent.motherIncome || '',
    "'" + (parent.motherPhone || ''),
    parent.hasGuardian ? 'Ya' : 'Tidak',
    parent.guardianRelation || '',
    parent.guardianName || '',
    "'" + (parent.guardianNik || ''),
    parent.guardianEducation || '',
    parent.guardianJob || '',
    parent.guardianIncome || '',
    "'" + (parent.guardianPhone || ''),
    'Rp 50.000',
    proof.status || 'Menunggu Verifikasi',
    proof.method || 'Transfer Bank Jatim',
    proof.paymentDate || '',
    proof.senderName || '',
    proof.fileUrl || '',
    (r.selection && r.selection.totalScore) || '-',
    ['Diterima', 'Menunggu Daftar Ulang', 'Selesai Daftar Ulang'].includes(r.status) ? 'Diterima' : r.status,
    (r.reRegistration && r.reRegistration.status) || 'Belum Daftar Ulang',
    new Date().toISOString()
  ];
  
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
}
`;

async function syncRegistrationToGoogleSheet(registration: any) {
  const gSettings = db.settings?.googleSheetSettings;
  if (!gSettings || !gSettings.autoSync || !gSettings.appsScriptUrl) {
    return;
  }
  try {
    await fetch(gSettings.appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registration })
    });
    gSettings.lastSyncAt = new Date().toISOString();
    gSettings.lastSyncStatus = 'success';
    gSettings.lastSyncMessage = `Berhasil sinkron nomor ${registration.registrationNumber} ke Google Sheet`;
    saveDatabase(db);
  } catch (err: any) {
    console.error('Apps Script Sync Error:', err.message);
    gSettings.lastSyncAt = new Date().toISOString();
    gSettings.lastSyncStatus = 'error';
    gSettings.lastSyncMessage = `Gagal sinkron: ${err.message}`;
    saveDatabase(db);
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));
  app.use('/uploads', express.static(UPLOADS_DIR));

  // API Routes
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'SDIT Insan Cendikia Kalibaru Server',
      timestamp: new Date().toISOString()
    });
  });

  // Get full bootstrap state for client
  app.get('/api/bootstrap', (req: Request, res: Response) => {
    res.json({
      schoolProfile: db.schoolProfile,
      programs: db.programs.filter(p => p.isPublished),
      extracurriculars: db.extracurriculars.filter(e => e.isPublished),
      teachers: db.teachers.sort((a, b) => a.order - b.order),
      gallery: db.gallery.filter(g => g.isPublished),
      achievements: db.achievements,
      news: db.news.filter(n => n.isPublished),
      spmbWave: db.spmbWave,
      spmbWaves: db.spmbWaves || [db.spmbWave],
      settings: db.settings,
      mediaLibrary: db.mediaLibrary,
      whatsappSettings: db.whatsappSettings,
      adminWhatsAppSettings: db.adminWhatsAppSettings,
      spmbStages: db.spmbStages,
      draftStages: db.draftStages || db.spmbStages,
      flowSettings: db.flowSettings
    });
  });

  // In-memory Session Store for Check Status & Document Revision
  interface CheckStatusSession {
    registrationNumber: string;
    birthDate: string;
    expiresAt: number;
  }
  const checkStatusSessions = new Map<string, CheckStatusSession>();

  // Login Rate Limiting (Internal accounts protection)
  interface LoginRateLimit {
    attempts: number;
    firstAttemptAt: number;
    blockedUntil?: number;
  }
  const loginRateLimits = new Map<string, LoginRateLimit>();

  // Auth: Internal School Personnel Login (Username or Email + Password)
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const rateLimitKey = `${ip}`;
    const limitRecord = loginRateLimits.get(rateLimitKey) || { attempts: 0, firstAttemptAt: now };

    if (limitRecord.blockedUntil && limitRecord.blockedUntil > now) {
      const waitMin = Math.ceil((limitRecord.blockedUntil - now) / 60000);
      return res.status(429).json({
        error: `Terlalu banyak percobaan login gagal. Demi keamanan sistem internal sekolah, akses masuk ditangguhkan sementara selama ${waitMin} menit.`
      });
    }

    if (now - limitRecord.firstAttemptAt > 10 * 60 * 1000) {
      limitRecord.attempts = 0;
      limitRecord.firstAttemptAt = now;
      delete limitRecord.blockedUntil;
    }

    const { email, username, identifier, password } = req.body;
    const loginKey = String(identifier || username || email || '').trim().toLowerCase();

    const allowedInternalRoles = ['super_admin', 'admin_sekolah', 'panitia_spmb', 'tim_seleksi', 'kepala_sekolah'];

    let user: any = null;

    if (loginKey) {
      user = db.users.find(u => 
        (u.email && u.email.toLowerCase() === loginKey) || 
        (u.username && u.username.toLowerCase() === loginKey)
      );

      // Verify password securely when logging in with identifier + password
      if (user) {
        const hashedInput = hashPassword(String(password || ''));
        const isMatch = Boolean(password && user.passwordHash && user.passwordHash === hashedInput);

        if (!isMatch) {
          limitRecord.attempts += 1;
          if (limitRecord.attempts >= 5) {
            limitRecord.blockedUntil = now + 15 * 60 * 1000;
          }
          loginRateLimits.set(rateLimitKey, limitRecord);
          return res.status(401).json({
            error: 'Kata sandi (password) atau username/email salah. Silakan coba kembali atau hubungi Super Admin.'
          });
        }
      }
    }

    if (!user || !allowedInternalRoles.includes(user.role)) {
      limitRecord.attempts += 1;
      if (limitRecord.attempts >= 5) {
        limitRecord.blockedUntil = now + 15 * 60 * 1000; // 15 mins block
      }
      loginRateLimits.set(rateLimitKey, limitRecord);

      return res.status(401).json({
        error: 'Username/Email atau Password salah. Halaman ini khusus untuk login resmi petugas internal SDIT Insan Cendikia Kalibaru.'
      });
    }

    // Check account status
    if (user.isActive === false) {
      logActivity(user.id, user.name, user.role, 'Login Ditolak', `Mencoba login pada akun nonaktif (${user.username || user.email})`);
      return res.status(403).json({
        error: 'Akun Anda berstatus NONAKTIF. Akses sistem ditangguhkan oleh Administrator. Silakan hubungi bagian tata usaha SDIT Insan Cendikia Kalibaru.'
      });
    }

    // Reset rate limit on success
    loginRateLimits.delete(rateLimitKey);

    // Update lastLoginAt
    user.lastLoginAt = new Date().toISOString();
    saveDatabase(db);

    logActivity(user.id, user.name, user.role, 'User Login', `Petugas ${user.name} (${user.role}) berhasil masuk ke sistem.`);
    res.json({ user, token: `token-${user.id}-${Date.now()}` });
  });

  // Auth: Logout
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const { userId, userName, userRole } = req.body;
    if (userId) {
      logActivity(userId, userName || 'Petugas', userRole || 'staff', 'User Logout', `Petugas ${userName || userId} keluar dari sesi sistem.`);
    }
    res.json({ success: true, message: 'Berhasil logout' });
  });

  // Auth: Update Own Profile
  app.put('/api/auth/profile', (req: Request, res: Response) => {
    const { userId, name, phone, avatarUrl } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID wajib disertakan.' });

    const idx = db.users.findIndex(u => u.id === userId);
    if (idx === -1) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });

    const user = db.users[idx];
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    user.updatedAt = new Date().toISOString();

    saveDatabase(db);
    logActivity(user.id, user.name, user.role, 'Update Profil Akun', `Petugas memperbarui informasi profil akun sendiri.`);
    res.json(user);
  });

  // Auth: Change Password
  app.post('/api/auth/change-password', (req: Request, res: Response) => {
    const { userId, currentPassword, newPassword } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID wajib disertakan.' });
    if (!newPassword || newPassword.length < 10) {
      return res.status(400).json({ error: 'Password baru minimal harus 10 karakter.' });
    }

    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });

    user.mustChangePassword = false;
    user.updatedAt = new Date().toISOString();
    saveDatabase(db);

    logActivity(user.id, user.name, user.role, 'Ganti Password', `Petugas memperbarui kata sandi akun secara mandiri.`);
    res.json({ success: true, message: 'Password akun Anda berhasil diperbarui.' });
  });

  // Auth: Forgot Password Flow
  app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
    const { identifier } = req.body;
    if (!identifier) return res.status(400).json({ error: 'Username atau email wajib diisi.' });

    const clean = String(identifier).trim().toLowerCase();
    const user = db.users.find(u => 
      (u.email && u.email.toLowerCase() === clean) || 
      (u.username && u.username.toLowerCase() === clean)
    );

    if (user) {
      logActivity(user.id, user.name, user.role, 'Permintaan Reset Password', `Petugas meminta bantuan reset kata sandi untuk akun @${user.username}.`);
      return res.json({
        success: true,
        message: `Instruksi pemulihan kata sandi telah dikirim ke email terdaftar: ${user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}. Anda juga dapat menghubungi Super Admin secara langsung di ruang IT.`
      });
    }

    res.json({
      success: true,
      message: 'Jika akun terdaftar pada sistem internal SDIT Insan Cendikia Kalibaru, instruksi telah disiapkan. Hubungi Super Admin bila memerlukan bantuan.'
    });
  });

  // Rate Limiting Store for Public Check Status
  interface CheckStatusRateLimit {
    attempts: number;
    firstAttemptAt: number;
    blockedUntil?: number;
  }
  const checkStatusRateLimits = new Map<string, CheckStatusRateLimit>();

  function getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
    return req.socket.remoteAddress || '127.0.0.1';
  }

  // SPMB Public Check Status (Two-factor verification: Nomor Pendaftaran + Tanggal Lahir)
  app.post('/api/spmb/check-status', (req: Request, res: Response) => {
    const ip = getClientIp(req);
    const now = Date.now();
    const record = checkStatusRateLimits.get(ip) || { attempts: 0, firstAttemptAt: now };

    // Check if temporarily blocked
    if (record.blockedUntil && record.blockedUntil > now) {
      const remainingMinutes = Math.ceil((record.blockedUntil - now) / 60000);
      return res.status(429).json({
        error: `Terlalu banyak percobaan verifikasi. Demi perlindungan data pribadi calon murid, akses ditangguhkan sementara. Silakan coba kembali dalam ${remainingMinutes} menit.`
      });
    }

    // Reset window after 15 minutes
    if (now - record.firstAttemptAt > 15 * 60 * 1000) {
      record.attempts = 0;
      record.firstAttemptAt = now;
      delete record.blockedUntil;
    }

    const { registrationNumber, birthDate } = req.body;
    if (!registrationNumber || !birthDate) {
      return res.status(400).json({
        error: 'Nomor pendaftaran dan tanggal lahir calon murid wajib diisi.'
      });
    }

    const cleanRegNo = String(registrationNumber).trim().toUpperCase();
    const cleanBirthDate = String(birthDate).trim().replace(/\//g, '-');

    // Find registration record
    const reg = db.registrations.find(r => r.registrationNumber.toUpperCase() === cleanRegNo);

    // Normalize student's registered birthDate
    const studentBirth = reg?.student?.birthDate ? String(reg.student.birthDate).trim().replace(/\//g, '-') : '';
    const isBirthMatch = reg && studentBirth === cleanBirthDate;

    if (!reg || !isBirthMatch) {
      record.attempts += 1;
      if (record.attempts >= 5) {
        record.blockedUntil = now + 15 * 60 * 1000; // 15 mins lock
      }
      checkStatusRateLimits.set(ip, record);

      return res.status(404).json({
        error: 'Nomor pendaftaran tidak ditemukan atau verifikasi tanggal lahir calon murid tidak sesuai. Silakan periksa kembali tanda bukti pendaftaran Anda.'
      });
    }

    // Reset attempt on success
    checkStatusRateLimits.delete(ip);

    // Issue secure session token for uploading revisions without login
    const sessionToken = `ses_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
    checkStatusSessions.set(sessionToken, {
      registrationNumber: reg.registrationNumber,
      birthDate: cleanBirthDate,
      expiresAt: now + 2 * 3600 * 1000 // 2 hours validity
    });

    // Check documents needing revision
    const documentsToRevise = (reg.documents || [])
      .filter(d => d.needsRevision || d.status === 'Perlu Perbaikan')
      .map(d => ({
        id: d.id,
        name: d.name,
        label: d.label,
        currentFileName: d.fileName,
        revisionNote: d.revisionNote || reg.revisionNotes || 'Harap unggah ulang dokumen yang lebih jelas dan lengkap.',
        status: (d.status || 'Perlu Perbaikan') as any,
        currentUrl: d.fileUrl
      }));

    // Check WhatsApp Group eligibility
    let whatsAppGroup = null;
    const wa = db.whatsappSettings;
    if (wa && wa.isActive && (wa.allowedStatuses || []).includes(reg.status) && wa.inviteLink) {
      whatsAppGroup = {
        isEligible: true,
        groupName: wa.groupName || 'Grup Resmi SPMB SDIT Insan Cendikia Kalibaru',
        inviteLink: wa.inviteLink,
        infoMessage: wa.infoMessage || 'Selamat! Pendaftaran Anda telah terverifikasi. Silakan bergabung ke Grup WhatsApp Resmi SPMB SDIT INSAN CENDIKIA KALIBARU untuk mendapatkan informasi dan pengumuman selanjutnya.',
        isActive: true
      };
    }

    // Generate WhatsApp direct links for Observasi and Payment
    let adminWhatsApp = null;
    const adminWa = db.adminWhatsAppSettings || INITIAL_ADMIN_WHATSAPP_SETTINGS;
    if (adminWa && adminWa.adminPhone) {
      const cleanPhone = adminWa.adminPhone.replace(/[^0-9]/g, '');
      const obsMsg = (adminWa.observationMessageTemplate || '')
        .replace(/\{\{nama_siswa\}\}/g, reg.student.fullName)
        .replace(/\{\{nomor_pendaftaran\}\}/g, reg.registrationNumber);
      const payMsg = (adminWa.paymentMessageTemplate || '')
        .replace(/\{\{nama_siswa\}\}/g, reg.student.fullName)
        .replace(/\{\{nomor_pendaftaran\}\}/g, reg.registrationNumber);

      adminWhatsApp = {
        adminPhone: cleanPhone,
        enableObservation: adminWa.enableObservationButton !== false,
        observationLink: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(obsMsg)}`,
        observasiUrl: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(obsMsg)}`,
        enablePayment: adminWa.enablePaymentButton !== false,
        paymentLink: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(payMsg)}`,
        daftarUlangUrl: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(payMsg)}`
      };
    }

    // Sanitize output for public viewing (Strict privacy: NO NIK, NO address, NO contact, NO docs)
    const sanitizedResult = {
      registrationNumber: reg.registrationNumber,
      childName: reg.student.fullName,
      academicYear: (reg as any).academicYear || '2027/2028',
      waveName: reg.waveId === 'wave-2' ? 'Gelombang 2 (Reguler Lanjutan)' : 'Gelombang 1 (Reguler & Prestasi)',
      submittedAt: reg.submittedAt,
      updatedAt: reg.updatedAt,
      status: reg.status,
      panitiaNotes: reg.revisionNotes || '',
      sessionToken,
      verificationHistory: (reg.verificationLogs || []).map(log => ({
        status: log.status,
        notes: log.notes,
        timestamp: log.timestamp
      })),
      stages: (reg.stages || createDefaultApplicantStages(reg.status)).filter(s => {
        const def = (db.spmbStages || []).find(ds => ds.id === s.stageId);
        return def ? def.showToParents !== false : true;
      }),
      needsDocumentRevision: reg.status === 'Perlu Perbaikan' || documentsToRevise.length > 0,
      documentsToRevise,
      whatsAppGroup,
      adminWhatsApp,
      selectionResult: (reg as any).selectionResult ? {
        isPassed: (reg as any).selectionResult.isPassed,
        evaluatedAt: (reg as any).selectionResult.evaluatedAt,
        catatanSeleksi: (reg as any).selectionResult.catatanSeleksi
      } : null,
      paymentProof: reg.reRegistration?.paymentProof || reg.paymentProof || null,
      reRegistration: {
        isEligible: ['Diterima', 'Menunggu Daftar Ulang', 'Selesai Daftar Ulang', 'Daftar Ulang'].includes(reg.status),
        isCompleted: reg.status === 'Selesai Daftar Ulang' || reg.reRegistration?.status === 'Selesai Daftar Ulang',
        status: reg.reRegistration?.status || 'Belum Daftar Ulang',
        deadline: '25 Januari 2027',
        totalCost: 50000,
        bankName: 'Bank Jatim',
        bankAccount: '1592015532',
        accountHolder: 'SDIT INSAN CENDEKIA PPDB',
        paymentAccount: 'Bank Jatim No. Rek: 1592015532 a.n. SDIT INSAN CENDEKIA PPDB',
        officeSchedule: {
          daysMonThu: 'Senin – Kamis: 07.00 – 15.00 WIB',
          daysFri: 'Jumat: 07.00 – 12.30 WIB',
          address: 'Kantor Sekretariat SDIT Insan Cendikia, Jl. Pahlawan, Desa Kalibaru Kulon, Kec. Kalibaru'
        },
        instructions: 'Biaya pendaftaran resmi sebesar Rp50.000,- (lima puluh ribu rupiah). Tidak ada biaya seragam atau biaya tersembunyi lainnya pada tahap pendaftaran awal.'
      }
    };

    res.json(sanitizedResult);
  });

  // SPMB Upload Document Revision (Public via Check Status 2FA / Session Token)
  app.post('/api/spmb/upload-revision', (req: Request, res: Response) => {
    try {
      const { registrationNumber, birthDate, sessionToken, documentId, dataUrl, fileName } = req.body;

      if (!registrationNumber || !documentId || !dataUrl) {
        return res.status(400).json({ error: 'Data upload revisi berkas tidak lengkap.' });
      }

      // Validate session token or birthDate
      const cleanRegNo = String(registrationNumber).trim().toUpperCase();
      let isVerifiedSession = false;

      if (sessionToken && checkStatusSessions.has(sessionToken)) {
        const ses = checkStatusSessions.get(sessionToken)!;
        if (ses.registrationNumber === cleanRegNo && ses.expiresAt > Date.now()) {
          isVerifiedSession = true;
        }
      }

      const reg = db.registrations.find(r => r.registrationNumber.toUpperCase() === cleanRegNo);
      if (!reg) {
        return res.status(404).json({ error: 'Pendaftaran tidak ditemukan.' });
      }

      if (!isVerifiedSession) {
        if (!birthDate) {
          return res.status(403).json({ error: 'Verifikasi sesi telah kedaluwarsa. Silakan masukkan tanggal lahir kembali di halaman Cek Status.' });
        }
        const studentBirth = reg.student?.birthDate ? String(reg.student.birthDate).trim().replace(/\//g, '-') : '';
        const cleanBirthDate = String(birthDate).trim().replace(/\//g, '-');
        if (studentBirth !== cleanBirthDate) {
          return res.status(403).json({ error: 'Verifikasi tanggal lahir calon murid tidak sesuai.' });
        }
      }

      // Parse dataUrl
      const matches = dataUrl.match(/^data:([A-Za-z0-9\/\-+.]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: 'Format file tidak valid. Gunakan format JPG, PNG, atau PDF.' });
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      if (buffer.length > 5 * 1024 * 1024) {
        return res.status(400).json({ error: 'Ukuran file perbaikan melebihi batas maksimal 5MB.' });
      }

      const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedMimes.includes(mimeType)) {
        return res.status(400).json({ error: 'Format berkas harus berupa JPG, PNG, WEBP, atau PDF.' });
      }

      const extMap: Record<string, string> = {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/webp': '.webp',
        'application/pdf': '.pdf'
      };
      const ext = extMap[mimeType] || '.jpg';
      const cleanFileName = `rev_${cleanRegNo}_${documentId}_${Date.now()}${ext}`;
      const savePath = path.resolve(UPLOADS_DIR, cleanFileName);

      fs.writeFileSync(savePath, buffer);
      const publicUrl = `/uploads/${cleanFileName}`;

      // Locate document in registration
      const doc = reg.documents.find(d => d.id === documentId);
      if (!doc) {
        return res.status(404).json({ error: 'Dokumen yang dimaksud tidak ditemukan dalam berkas pendaftaran.' });
      }

      // Initialize revision history if needed
      if (!doc.revisionHistory) {
        doc.revisionHistory = [];
      }

      // Archive previous version
      doc.revisionHistory.push({
        id: `rev-${Date.now()}`,
        fileUrl: doc.fileUrl,
        fileName: doc.fileName,
        fileSizeKb: doc.fileSizeKb,
        uploadedAt: doc.uploadedAt,
        notes: doc.revisionNote || 'Dokumen sebelum revisi'
      });

      // Update document with new file
      doc.fileUrl = publicUrl;
      doc.fileName = fileName || cleanFileName;
      doc.fileSizeKb = Math.round(buffer.length / 1024);
      doc.uploadedAt = new Date().toISOString();
      doc.status = 'Sudah Diunggah';
      doc.needsRevision = false;

      // Add verification log
      reg.verificationLogs.push({
        id: `vlog-${Date.now()}`,
        verifiedBy: 'Wali Murid (Online)',
        verifierRole: 'Pendaftar',
        status: 'Menunggu Verifikasi',
        notes: `Wali murid mengunggah berkas perbaikan untuk: ${doc.label} (${doc.fileName}). Menunggu verifikasi ulang panitia.`,
        timestamp: new Date().toISOString()
      });

      // Check if all documents needing revision are now uploaded
      const remainingUnfixed = reg.documents.filter(d => d.needsRevision === true);
      if (remainingUnfixed.length === 0) {
        reg.status = 'Menunggu Verifikasi';
      }
      reg.updatedAt = new Date().toISOString();

      saveDatabase(db);

      logActivity(
        'system',
        'Wali Murid Online',
        'pendaftar',
        'Upload Dokumen Perbaikan',
        `Pendaftar ${reg.registrationNumber} (${reg.student.fullName}) mengunggah perbaikan untuk ${doc.label}`
      );

      res.json({
        success: true,
        message: `Berkas ${doc.label} berhasil diperbarui. Panitia SPMB telah menerima notifikasi perbaikan berkas ananda.`,
        document: doc,
        newStatus: reg.status
      });
    } catch (err: any) {
      console.error('Error uploading document revision:', err);
      res.status(500).json({ success: false, error: 'Gagal mengunggah berkas perbaikan' });
    }
  });

  // SPMB Upload Bukti Pembayaran Daftar Ulang (Public Check Status)
  app.post('/api/spmb/upload-payment-proof', (req: Request, res: Response) => {
    try {
      const {
        registrationNumber,
        birthDate,
        sessionToken,
        method,
        paymentDate,
        amount,
        senderName,
        dataUrl,
        fileName
      } = req.body;

      if (!registrationNumber || !dataUrl || !senderName || !method) {
        return res.status(400).json({ error: 'Mohon lengkapi metode pembayaran, nama pengirim/penyetor, tanggal bayar, dan berkas bukti pembayaran.' });
      }

      const cleanRegNo = String(registrationNumber).trim().toUpperCase();
      let isVerified = false;

      if (sessionToken && checkStatusSessions.has(sessionToken)) {
        const sess = checkStatusSessions.get(sessionToken)!;
        if (sess.registrationNumber.toUpperCase() === cleanRegNo && sess.expiresAt > Date.now()) {
          isVerified = true;
        }
      }

      if (!isVerified && birthDate) {
        const cleanBirthDate = String(birthDate).trim().replace(/\//g, '-');
        const regCheck = db.registrations.find(r => r.registrationNumber.toUpperCase() === cleanRegNo);
        const stBirth = regCheck?.student?.birthDate ? String(regCheck.student.birthDate).trim().replace(/\//g, '-') : '';
        if (regCheck && stBirth === cleanBirthDate) {
          isVerified = true;
        }
      }

      if (!isVerified) {
        return res.status(401).json({
          error: 'Sesi akses telah kedaluwarsa atau verifikasi identitas tidak valid. Silakan ulangi pencarian nomor pendaftaran ananda.'
        });
      }

      const reg = db.registrations.find(r => r.registrationNumber.toUpperCase() === cleanRegNo);
      if (!reg) {
        return res.status(404).json({ error: 'Pendaftaran tidak ditemukan.' });
      }

      // Process base64 file
      let publicUrl = dataUrl;
      let fileSizeKb = 0;
      if (typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
        const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          return res.status(400).json({ error: 'Format berkas bukti pembayaran tidak valid.' });
        }

        const mimeType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');

        if (buffer.length > 5 * 1024 * 1024) {
          return res.status(400).json({ error: 'Ukuran berkas bukti pembayaran maksimal 5MB.' });
        }

        const extMap: Record<string, string> = {
          'image/jpeg': '.jpg',
          'image/jpg': '.jpg',
          'image/png': '.png',
          'image/webp': '.webp',
          'application/pdf': '.pdf'
        };
        const ext = extMap[mimeType] || '.jpg';
        const cleanFileName = `bukti_bayar_${cleanRegNo}_${Date.now()}${ext}`;
        const savePath = path.resolve(UPLOADS_DIR, cleanFileName);

        fs.writeFileSync(savePath, buffer);
        publicUrl = `/uploads/${cleanFileName}`;
        fileSizeKb = Math.round(buffer.length / 1024);
      }

      const nowIso = new Date().toISOString();
      const existingProof = reg.paymentProof || reg.reRegistration?.paymentProof;
      const history = existingProof?.history ? [...existingProof.history] : [];
      history.push({
        status: 'Menunggu Verifikasi',
        notes: `Wali murid mengunggah bukti pembayaran ${method} senilai Rp50.000 atas nama ${senderName}.`,
        timestamp: nowIso
      });

      const paymentProofData = {
        method: method === 'Tunai di Sekretariat' ? 'Tunai di Sekretariat' : 'Transfer Bank Jatim',
        paymentDate: paymentDate || nowIso.split('T')[0],
        amount: 50000,
        senderName: String(senderName).trim(),
        fileUrl: publicUrl,
        fileName: fileName || `Bukti_Bayar_${cleanRegNo}`,
        fileSizeKb,
        uploadedAt: nowIso,
        status: 'Menunggu Verifikasi',
        history
      };

      reg.paymentProof = paymentProofData as any;
      if (!reg.reRegistration) {
        reg.reRegistration = { isConfirmed: true, confirmedAt: nowIso };
      }
      reg.reRegistration.paymentProof = paymentProofData as any;
      reg.reRegistration.paymentAmount = 50000;
      reg.reRegistration.paymentReceiptUrl = publicUrl;
      reg.reRegistration.status = 'Menunggu Persetujuan';
      reg.updatedAt = nowIso;

      reg.verificationLogs.push({
        id: `vlog-${Date.now()}`,
        verifiedBy: 'Wali Murid (Online)',
        verifierRole: 'Pendaftar',
        status: reg.status,
        notes: `Wali murid mengunggah bukti pembayaran daftar ulang: ${method} Rp50.000 (${senderName}). Menunggu verifikasi admin.`,
        timestamp: nowIso
      });

      saveDatabase(db);
      logActivity(
        'system',
        'Wali Murid Online',
        'pendaftar',
        'Upload Bukti Pembayaran',
        `Pendaftar ${reg.registrationNumber} (${reg.student.fullName}) mengunggah bukti pembayaran daftar ulang Rp50.000.`
      );

      res.json({
        success: true,
        message: 'Bukti pembayaran daftar ulang sebesar Rp50.000,- berhasil dikirim dan sedang dalam antrean verifikasi panitia/admin sekolah.',
        paymentProof: paymentProofData
      });
    } catch (err: any) {
      console.error('Error uploading payment proof:', err);
      res.status(500).json({ error: 'Gagal mengunggah bukti pembayaran: ' + (err.message || 'Kesalahan server') });
    }
  });

  // SPMB Verify Payment Proof (Admin: Super Admin, Admin Sekolah, Panitia SPMB)
  app.post('/api/spmb/registrations/:id/verify-payment', (req: Request, res: Response) => {
    const { status, adminNotes, verifierName, verifierRole } = req.body;
    const validStatuses = ['Disetujui', 'Ditolak', 'Perlu Upload Ulang', 'Menunggu Verifikasi'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status verifikasi pembayaran tidak valid.' });
    }

    const idx = db.registrations.findIndex(r => r.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Data pendaftaran tidak ditemukan.' });
    }

    const reg = db.registrations[idx];
    const nowIso = new Date().toISOString();

    if (!reg.paymentProof && !reg.reRegistration?.paymentProof) {
      return res.status(400).json({ error: 'Calon siswa ini belum mengunggah bukti pembayaran.' });
    }

    const currentProof = reg.paymentProof || reg.reRegistration!.paymentProof!;
    currentProof.status = status as any;
    currentProof.verifiedBy = verifierName || 'Panitia SPMB';
    currentProof.verifiedAt = nowIso;
    currentProof.adminNotes = adminNotes || '';

    if (!currentProof.history) currentProof.history = [];
    currentProof.history.push({
      status: status as any,
      notes: adminNotes || `Status pembayaran diubah menjadi: ${status}`,
      timestamp: nowIso,
      operator: verifierName || 'Petugas SPMB'
    });

    reg.paymentProof = currentProof;
    if (!reg.reRegistration) reg.reRegistration = { isConfirmed: true, confirmedAt: nowIso };
    reg.reRegistration.paymentProof = currentProof;

    if (status === 'Disetujui') {
      reg.reRegistration.paymentAmount = 50000;
      reg.reRegistration.paymentReceiptUrl = currentProof.fileUrl;
      reg.reRegistration.status = 'Menunggu Persetujuan'; // Ready for Admin Sekolah final approval
    } else if (status === 'Ditolak' || status === 'Perlu Upload Ulang') {
      reg.reRegistration.status = 'Perlu Perbaikan';
    }

    reg.updatedAt = nowIso;

    reg.verificationLogs.push({
      id: `vlog-${Date.now()}`,
      verifiedBy: verifierName || 'Panitia SPMB',
      verifierRole: verifierRole || 'panitia_spmb',
      status: reg.status,
      notes: `Verifikasi pembayaran daftar ulang: ${status}. Catatan: ${adminNotes || '-'}`,
      timestamp: nowIso
    });

    saveDatabase(db);
    logActivity(
      verifierName || 'petugas',
      verifierName || 'Petugas SPMB',
      verifierRole || 'panitia_spmb',
      'Verifikasi Pembayaran',
      `Verifikasi pembayaran ${reg.registrationNumber} (${reg.student.fullName}): ${status}`
    );

    // Asynchronously sync update to Google Sheet
    syncRegistrationToGoogleSheet(reg).catch(e => console.error('Auto-sync error:', e));

    res.json({
      success: true,
      message: `Bukti pembayaran berhasil diverifikasi dengan status: ${status}`,
      registration: reg
    });
  });

  // Public WhatsApp Group Info for Registration & Confirmation
  app.get('/api/spmb/whatsapp-group', (req: Request, res: Response) => {
    const wa = db.whatsappSettings || INITIAL_WHATSAPP_SETTINGS;
    const finalLink = wa.inviteLink || wa.groupLink || '';
    res.json({
      groupName: wa.groupName || 'Grup Resmi SPMB SDIT INSAN CENDIKIA KALIBARU',
      inviteLink: finalLink,
      groupLink: finalLink,
      isActive: Boolean(wa.isActive),
      infoMessage: wa.infoMessage || 'Terima kasih telah mendaftar di SDIT INSAN CENDIKIA KALIBARU. Silakan bergabung dengan Grup WhatsApp Resmi SPMB untuk memperoleh informasi terbaru mengenai tahapan dan proses penerimaan siswa baru.',
      updatedAt: wa.updatedAt
    });
  });

  // CMS WhatsApp Group Settings
  app.get('/api/cms/whatsapp', (req: Request, res: Response) => {
    res.json(db.whatsappSettings);
  });

  app.put('/api/cms/whatsapp', (req: Request, res: Response) => {
    const { groupName, inviteLink, groupLink, isActive, allowedStatuses, infoMessage, updatedBy, notes } = req.body;

    const current = db.whatsappSettings || INITIAL_WHATSAPP_SETTINGS;
    const resolvedLink = inviteLink !== undefined ? inviteLink : (groupLink !== undefined ? groupLink : (current.inviteLink || current.groupLink || ''));

    const historyItem = {
      id: `wahist-${Date.now()}`,
      link: resolvedLink,
      changedBy: updatedBy || 'Super Admin',
      changedAt: new Date().toISOString(),
      notes: notes || 'Pembaruan konfigurasi grup WhatsApp SPMB'
    };

    const updated = {
      ...current,
      groupName: groupName !== undefined ? groupName : current.groupName,
      inviteLink: resolvedLink,
      groupLink: resolvedLink,
      isActive: isActive !== undefined ? Boolean(isActive) : current.isActive,
      allowedStatuses: allowedStatuses || current.allowedStatuses,
      infoMessage: infoMessage !== undefined ? infoMessage : current.infoMessage,
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy || 'Super Admin',
      history: [historyItem, ...(current.history || [])].slice(0, 50)
    };

    db.whatsappSettings = updated;
    saveDatabase(db);

    logActivity(
      'admin',
      updatedBy || 'Super Admin',
      'super_admin',
      'Update Pengaturan WhatsApp SPMB',
      `Memperbarui tautan grup WhatsApp SPMB: ${updated.isActive ? 'Aktif' : 'Nonaktif'}`
    );

    res.json(updated);
  });

  // SPMB Registrations: List
  app.get('/api/spmb/registrations', (req: Request, res: Response) => {
    const { userId, status, search, waveId } = req.query;
    let results = [...db.registrations];

    if (userId) {
      results = results.filter(r => r.userId === userId || r.userEmail === userId);
    }
    if (status && status !== 'all') {
      results = results.filter(r => r.status === status);
    }
    if (waveId) {
      results = results.filter(r => r.waveId === waveId);
    }
    if (search) {
      const q = String(search).toLowerCase();
      results = results.filter(r => 
        r.registrationNumber.toLowerCase().includes(q) ||
        r.student.fullName.toLowerCase().includes(q) ||
        r.parent.fatherName.toLowerCase().includes(q) ||
        r.parent.motherName.toLowerCase().includes(q) ||
        (r.student.previousSchool || '').toLowerCase().includes(q)
      );
    }

    res.json(results);
  });

  // SPMB Registrations: Detail
  app.get('/api/spmb/registrations/:id', (req: Request, res: Response) => {
    const item = db.registrations.find(r => r.id === req.params.id || r.registrationNumber === req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Data pendaftaran tidak ditemukan' });
    }
    res.json(item);
  });

  // SPMB Registrations: Create
  app.post('/api/spmb/registrations', (req: Request, res: Response) => {
    const regData = req.body;
    const year = new Date().getFullYear();
    const count = db.registrations.length + 1;
    const regNumber = `SPMB-${year}-${String(count).padStart(4, '0')}`;

    const newRegistration = {
      ...regData,
      id: `reg-${Date.now()}`,
      registrationNumber: regNumber,
      status: regData.status || 'Menunggu Verifikasi',
      stages: createDefaultApplicantStages(regData.status || 'Menunggu Verifikasi'),
      verificationLogs: [
        {
          id: `vlog-${Date.now()}`,
          verifiedBy: 'Sistem SPMB',
          verifierRole: 'System',
          status: regData.status || 'Menunggu Verifikasi',
          notes: 'Formulir pendaftaran berhasil dikirimkan secara resmi.',
          timestamp: new Date().toISOString()
        }
      ],
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.registrations.unshift(newRegistration);
    db.spmbWave.registeredCount += 1;
    saveDatabase(db);

    logActivity(
      regData.userId || 'guest',
      regData.parent?.fatherName || 'Pendaftar Online',
      'pendaftar',
      'Submit Pendaftaran SPMB',
      `Mendaftarkan calon siswa ${newRegistration.student.fullName} dengan nomor ${regNumber}`
    );

    // Asynchronously sync new registration to Google Sheet
    syncRegistrationToGoogleSheet(newRegistration).catch(e => console.error('Auto-sync error:', e));

    res.status(201).json(newRegistration);
  });

  // SPMB Registrations: Update / Edit Revision
  app.put('/api/spmb/registrations/:id', (req: Request, res: Response) => {
    const idx = db.registrations.findIndex(r => r.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Pendaftaran tidak ditemukan' });
    }

    const current = db.registrations[idx];
    const updated = {
      ...current,
      ...req.body,
      id: current.id,
      registrationNumber: current.registrationNumber,
      updatedAt: new Date().toISOString()
    };

    if (current.status === 'Perlu Perbaikan') {
      updated.status = 'Menunggu Verifikasi';
      updated.verificationLogs.push({
        id: `vlog-${Date.now()}`,
        verifiedBy: 'Wali Murid',
        verifierRole: 'wali_murid',
        status: 'Menunggu Verifikasi',
        notes: 'Wali murid telah memperbaiki dan mengunggah ulang dokumen/data sesuai catatan.',
        timestamp: new Date().toISOString()
      });
    }

    db.registrations[idx] = updated;
    saveDatabase(db);

    logActivity(
      updated.userId,
      updated.parent.fatherName || 'Wali Murid',
      'wali_murid',
      'Perbaikan Berkas SPMB',
      `Wali murid memperbarui data untuk ${updated.registrationNumber}`
    );

    // Asynchronously sync update to Google Sheet
    syncRegistrationToGoogleSheet(updated).catch(e => console.error('Auto-sync error:', e));

    res.json(updated);
  });

  // SPMB Status Update (Verifikasi / Tolak / Perbaikan)
  app.patch('/api/spmb/registrations/:id/status', (req: Request, res: Response) => {
    const { status, notes, verifiedBy, verifierRole } = req.body;
    const idx = db.registrations.findIndex(r => r.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Pendaftaran tidak ditemukan' });
    }

    const reg = db.registrations[idx];
    reg.status = status;
    if (notes) {
      reg.revisionNotes = notes;
    }
    reg.updatedAt = new Date().toISOString();

    reg.verificationLogs.push({
      id: `vlog-${Date.now()}`,
      verifiedBy: verifiedBy || 'Panitia SPMB',
      verifierRole: verifierRole || 'panitia_spmb',
      status,
      notes: notes || `Status diubah menjadi ${status}`,
      timestamp: new Date().toISOString()
    });

    saveDatabase(db);
    logActivity(
      verifiedBy || 'admin',
      verifiedBy || 'Panitia SPMB',
      verifierRole || 'panitia_spmb',
      `Ubah Status: ${status}`,
      `Nomor ${reg.registrationNumber} (${reg.student.fullName}): ${notes || 'Status diperbarui'}`
    );

    res.json(reg);
  });

  // SPMB Selection Assessment
  app.patch('/api/spmb/registrations/:id/selection', (req: Request, res: Response) => {
    const { observasiKesiapan, bacaQuranIqro, wawancaraOrtu, catatanSeleksi, evaluatedBy, isPassed } = req.body;
    const idx = db.registrations.findIndex(r => r.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Pendaftaran tidak ditemukan' });
    }

    const reg = db.registrations[idx];
    const totalScore = Number(((observasiKesiapan * 0.4) + (bacaQuranIqro * 0.3) + (wawancaraOrtu * 0.3)).toFixed(1));

    reg.selection = {
      observasiKesiapan,
      bacaQuranIqro,
      wawancaraOrtu,
      totalScore,
      catatanSeleksi: catatanSeleksi || '',
      evaluatedBy: evaluatedBy || 'Tim Seleksi',
      evaluatedAt: new Date().toISOString()
    };

    if (isPassed !== undefined) {
      reg.status = isPassed ? 'Diterima' : 'Tidak Diterima';
      if (isPassed) {
        db.spmbWave.acceptedCount += 1;
      }
    } else {
      reg.status = 'Dalam Seleksi';
    }

    reg.updatedAt = new Date().toISOString();
    reg.verificationLogs.push({
      id: `vlog-${Date.now()}`,
      verifiedBy: evaluatedBy || 'Tim Seleksi',
      verifierRole: 'tim_seleksi',
      status: reg.status,
      notes: `Skor Seleksi: ${totalScore}. ${catatanSeleksi || ''}`,
      timestamp: new Date().toISOString()
    });

    saveDatabase(db);
    logActivity(
      evaluatedBy || 'tim_seleksi',
      evaluatedBy || 'Tim Seleksi',
      'tim_seleksi',
      'Penilaian Seleksi Calon Siswa',
      `Penilaian ${reg.registrationNumber} - Skor: ${totalScore} - Status: ${reg.status}`
    );

    res.json(reg);
  });

  // SPMB Re-Registration Submission & Update
  app.patch('/api/spmb/registrations/:id/re-registration', (req: Request, res: Response) => {
    const { isConfirmed, paymentReceiptUrl, paymentAmount, notes, operatorName, status: customStatus } = req.body;
    const idx = db.registrations.findIndex(r => r.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Pendaftaran tidak ditemukan' });
    }

    const reg = db.registrations[idx];
    const newStatus = customStatus || 'Menunggu Persetujuan';

    reg.reRegistration = {
      isConfirmed: isConfirmed ?? true,
      confirmedAt: new Date().toISOString(),
      paymentReceiptUrl: paymentReceiptUrl || reg.reRegistration?.paymentReceiptUrl,
      paymentAmount: paymentAmount !== undefined ? paymentAmount : reg.reRegistration?.paymentAmount,
      status: newStatus as any,
      notes: notes || reg.reRegistration?.notes
    };

    reg.status = newStatus === 'Disetujui Admin Sekolah' ? 'Selesai Daftar Ulang' : 'Daftar Ulang';
    reg.updatedAt = new Date().toISOString();

    reg.verificationLogs.push({
      id: `vlog-${Date.now()}`,
      verifiedBy: operatorName || 'Panitia SPMB',
      verifierRole: 'panitia_spmb',
      status: reg.status,
      notes: notes || `Berkas daftar ulang tercatat. Status: ${newStatus}.`,
      timestamp: new Date().toISOString()
    });

    saveDatabase(db);
    logActivity(
      operatorName || 'panitia',
      operatorName || 'Panitia SPMB',
      'panitia_spmb',
      'Update Daftar Ulang',
      `Pembaruan data daftar ulang ${reg.registrationNumber} (${reg.student.fullName}) - Status: ${newStatus}`
    );

    res.json(reg);
  });

  // SPMB Re-Registration Final Approval (Restricted strictly to Admin Sekolah & Super Admin)
  app.post('/api/spmb/registrations/:id/reregistration-approval', (req: Request, res: Response) => {
    const { approverRole, approverName, status: approvalStatus, adminNotes } = req.body;

    // Strict Role Validation in Backend
    if (approverRole !== 'admin_sekolah' && approverRole !== 'super_admin') {
      return res.status(403).json({
        error: 'Kewenangan ditolak. Persetujuan final daftar ulang hanya dapat dilakukan oleh Admin Sekolah atau Super Admin.'
      });
    }

    const validApprovalStatuses = [
      'Belum Daftar Ulang',
      'Menunggu Persetujuan',
      'Perlu Perbaikan',
      'Disetujui Admin Sekolah',
      'Selesai Daftar Ulang'
    ];

    if (!validApprovalStatuses.includes(approvalStatus)) {
      return res.status(400).json({ error: 'Status persetujuan daftar ulang tidak valid.' });
    }

    const idx = db.registrations.findIndex(r => r.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Pendaftaran tidak ditemukan' });
    }

    const reg = db.registrations[idx];
    const nowIso = new Date().toISOString();

    if (!reg.reRegistration) {
      reg.reRegistration = { isConfirmed: true, confirmedAt: nowIso };
    }

    reg.reRegistration.status = approvalStatus as any;
    reg.reRegistration.approvedBy = approverName || 'Admin Sekolah';
    reg.reRegistration.approvedAt = nowIso;
    reg.reRegistration.adminNotes = adminNotes || '';

    if (approvalStatus === 'Disetujui Admin Sekolah' || approvalStatus === 'Selesai Daftar Ulang') {
      const paymentProof = reg.reRegistration?.paymentProof || reg.paymentProof;
      if (!paymentProof || paymentProof.status !== 'Disetujui') {
        return res.status(400).json({
          error: 'Persetujuan final daftar ulang belum dapat diselesaikan karena bukti pembayaran daftar ulang belum disetujui. Pastikan status bukti pembayaran adalah "Disetujui" terlebih dahulu.'
        });
      }
      reg.status = 'Selesai Daftar Ulang';
    } else if (approvalStatus === 'Perlu Perbaikan') {
      reg.status = 'Perlu Perbaikan';
    }

    reg.updatedAt = nowIso;

    reg.verificationLogs.push({
      id: `vlog-${Date.now()}`,
      verifiedBy: approverName || 'Admin Sekolah',
      verifierRole: approverRole,
      status: reg.status,
      notes: `Persetujuan Daftar Ulang: ${approvalStatus}. ${adminNotes || ''}`,
      timestamp: nowIso
    });

    saveDatabase(db);
    logActivity(
      approverName || 'admin_sekolah',
      approverName || 'Admin Sekolah',
      approverRole,
      'Keputusan Daftar Ulang',
      `Keputusan daftar ulang ${reg.registrationNumber}: ${approvalStatus} oleh ${approverName} (Role: ${approverRole})`
    );

    res.json({
      success: true,
      message: `Persetujuan daftar ulang berhasil diproses dengan status: ${approvalStatus}.`,
      registration: reg
    });
  });

  // SPMB Delete Registration
  app.delete('/api/spmb/registrations/:id', (req: Request, res: Response) => {
    const idx = db.registrations.findIndex(r => r.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Pendaftaran tidak ditemukan' });
    }
    const removed = db.registrations.splice(idx, 1)[0];
    saveDatabase(db);

    logActivity(
      'admin',
      'Administrator',
      'super_admin',
      'Hapus Data Pendaftaran',
      `Menghapus pendaftaran ${removed.registrationNumber} (${removed.student.fullName})`
    );

    res.json({ success: true, message: 'Data pendaftaran berhasil dihapus' });
  });

  // Export CSV
  app.get('/api/export/registrations.csv', (req: Request, res: Response) => {
    const header = [
      'No Registrasi',
      'Nama Lengkap',
      'Jenis Kelamin',
      'Tanggal Lahir',
      'NIK Siswa',
      'Asal Sekolah TK',
      'Nama Ayah',
      'No HP Ayah',
      'Nama Ibu',
      'Alamat',
      'Status Pendaftaran',
      'Status Pembayaran',
      'Biaya Pendaftaran',
      'Skor Seleksi',
      'Tanggal Daftar'
    ].join(',');

    const rows = db.registrations.map(r => {
      const proof = r.paymentProof || r.reRegistration?.paymentProof;
      return [
        `"${r.registrationNumber}"`,
        `"${r.student.fullName.replace(/"/g, '""')}"`,
        `"${r.student.gender}"`,
        `"${r.student.birthDate}"`,
        `"${r.student.nik}"`,
        `"${(r.student.previousSchool || '').replace(/"/g, '""')}"`,
        `"${r.parent.fatherName.replace(/"/g, '""')}"`,
        `"${r.parent.fatherPhone}"`,
        `"${r.parent.motherName.replace(/"/g, '""')}"`,
        `"${r.student.address.replace(/"/g, '""')}"`,
        `"${r.status}"`,
        `"${proof?.status || 'Belum Upload'}"`,
        `"Rp 50.000"`,
        `"${r.selection?.totalScore || '-'}"`,
        `"${r.submittedAt}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [header, ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="SPMB_SDIT_Insan_Cendikia_Kalibaru.csv"');
    res.send(csvContent);
  });

  // CMS: School Profile
  app.put('/api/cms/profile', (req: Request, res: Response) => {
    db.schoolProfile = { ...db.schoolProfile, ...req.body };
    saveDatabase(db);
    logActivity('admin', 'Admin Sekolah', 'admin_sekolah', 'Update Profil Sekolah', 'Memperbarui profil, visi-misi, atau koordinat sekolah.');
    res.json(db.schoolProfile);
  });

  // CMS: SPMB Wave & Quota Settings
  app.put('/api/cms/wave', (req: Request, res: Response) => {
    db.spmbWave = { ...db.spmbWave, ...req.body };
    saveDatabase(db);
    logActivity('admin', 'Panitia SPMB', 'panitia_spmb', 'Update Gelombang & Kuota SPMB', `Kuota diperbarui: ${db.spmbWave.quota}`);
    res.json(db.spmbWave);
  });

  // Helper to persist base64 photo for teacher
  const persistTeacherPhoto = (dataUrlOrPath?: string, teacherName?: string): string | undefined => {
    if (!dataUrlOrPath) return dataUrlOrPath;
    if (dataUrlOrPath.startsWith('data:image/')) {
      const match = dataUrlOrPath.match(/^data:image\/([a-zA-Z0-9-+.]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const base64Data = match[2];
        const buffer = Buffer.from(base64Data, 'base64');
        const ext = mimeType.includes('png') ? '.png' : mimeType.includes('webp') ? '.webp' : '.jpg';
        const cleanName = (teacherName || 'guru').toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20);
        const fileName = `guru_${cleanName}_${Date.now()}${ext}`;
        const filePath = path.resolve(UPLOADS_DIR, fileName);
        fs.writeFileSync(filePath, buffer);
        return `/uploads/${fileName}`;
      }
    }
    return dataUrlOrPath;
  };

  // CMS: Upload Teacher Photo endpoint
  app.post('/api/cms/teachers/upload-photo', (req: Request, res: Response) => {
    try {
      const { dataUrl, teacherName } = req.body;
      if (!dataUrl) {
        return res.status(400).json({ error: 'Data foto tidak valid atau kosong' });
      }
      const savedUrl = persistTeacherPhoto(dataUrl, teacherName);
      if (!savedUrl) {
        return res.status(400).json({ error: 'Gagal memproses data gambar foto' });
      }
      res.json({ success: true, url: savedUrl });
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal mengunggah foto: ' + (err.message || 'Error') });
    }
  });

  // CMS: Teachers CRUD
  app.get('/api/cms/teachers', (req: Request, res: Response) => {
    res.json(db.teachers);
  });
  app.post('/api/cms/teachers', (req: Request, res: Response) => {
    let photoUrl = req.body.imageUrl;
    if (photoUrl && photoUrl.startsWith('data:image/')) {
      photoUrl = persistTeacherPhoto(photoUrl, req.body.name);
    }
    const newTeacher = { ...req.body, imageUrl: photoUrl, id: `tch-${Date.now()}` };
    db.teachers.push(newTeacher);
    saveDatabase(db);
    res.status(201).json(newTeacher);
  });
  app.put('/api/cms/teachers/:id', (req: Request, res: Response) => {
    const idx = db.teachers.findIndex(t => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Guru tidak ditemukan' });
    let photoUrl = req.body.imageUrl;
    if (photoUrl && photoUrl.startsWith('data:image/')) {
      photoUrl = persistTeacherPhoto(photoUrl, req.body.name || db.teachers[idx].name);
    }
    db.teachers[idx] = {
      ...db.teachers[idx],
      ...req.body,
      imageUrl: photoUrl !== undefined ? photoUrl : db.teachers[idx].imageUrl
    };
    saveDatabase(db);
    res.json(db.teachers[idx]);
  });
  app.delete('/api/cms/teachers/:id', (req: Request, res: Response) => {
    db.teachers = db.teachers.filter(t => t.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // CMS: Programs CRUD
  app.get('/api/cms/programs', (req: Request, res: Response) => {
    res.json(db.programs);
  });
  app.post('/api/cms/programs', (req: Request, res: Response) => {
    const newProgram = { ...req.body, id: `prog-${Date.now()}` };
    db.programs.push(newProgram);
    saveDatabase(db);
    res.status(201).json(newProgram);
  });
  app.put('/api/cms/programs/:id', (req: Request, res: Response) => {
    const idx = db.programs.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Program tidak ditemukan' });
    db.programs[idx] = { ...db.programs[idx], ...req.body };
    saveDatabase(db);
    res.json(db.programs[idx]);
  });
  app.delete('/api/cms/programs/:id', (req: Request, res: Response) => {
    db.programs = db.programs.filter(p => p.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // CMS: Extracurriculars CRUD
  app.get('/api/cms/extracurriculars', (req: Request, res: Response) => {
    res.json(db.extracurriculars);
  });
  app.post('/api/cms/extracurriculars', (req: Request, res: Response) => {
    const item = { ...req.body, id: `ekskul-${Date.now()}` };
    db.extracurriculars.push(item);
    saveDatabase(db);
    res.status(201).json(item);
  });
  app.put('/api/cms/extracurriculars/:id', (req: Request, res: Response) => {
    const idx = db.extracurriculars.findIndex(e => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Ekstrakurikuler tidak ditemukan' });
    db.extracurriculars[idx] = { ...db.extracurriculars[idx], ...req.body };
    saveDatabase(db);
    res.json(db.extracurriculars[idx]);
  });
  app.delete('/api/cms/extracurriculars/:id', (req: Request, res: Response) => {
    db.extracurriculars = db.extracurriculars.filter(e => e.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // CMS: Gallery CRUD
  app.get('/api/cms/gallery', (req: Request, res: Response) => {
    res.json(db.gallery);
  });
  app.post('/api/cms/gallery', (req: Request, res: Response) => {
    const item = { ...req.body, id: `gal-${Date.now()}` };
    db.gallery.unshift(item);
    saveDatabase(db);
    res.status(201).json(item);
  });
  app.put('/api/cms/gallery/:id', (req: Request, res: Response) => {
    const idx = db.gallery.findIndex(g => g.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Item galeri tidak ditemukan' });
    db.gallery[idx] = { ...db.gallery[idx], ...req.body };
    saveDatabase(db);
    res.json(db.gallery[idx]);
  });
  app.delete('/api/cms/gallery/:id', (req: Request, res: Response) => {
    db.gallery = db.gallery.filter(g => g.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // CMS: Achievements CRUD
  app.get('/api/cms/achievements', (req: Request, res: Response) => {
    res.json(db.achievements);
  });
  app.post('/api/cms/achievements', (req: Request, res: Response) => {
    const item = { ...req.body, id: `ach-${Date.now()}`, isDemo: true };
    db.achievements.unshift(item);
    saveDatabase(db);
    res.status(201).json(item);
  });
  app.put('/api/cms/achievements/:id', (req: Request, res: Response) => {
    const idx = db.achievements.findIndex(a => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Prestasi tidak ditemukan' });
    db.achievements[idx] = { ...db.achievements[idx], ...req.body, isDemo: true };
    saveDatabase(db);
    res.json(db.achievements[idx]);
  });
  app.delete('/api/cms/achievements/:id', (req: Request, res: Response) => {
    db.achievements = db.achievements.filter(a => a.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // CMS: News CRUD
  app.get('/api/cms/news', (req: Request, res: Response) => {
    res.json(db.news);
  });
  app.post('/api/cms/news', (req: Request, res: Response) => {
    const item = {
      ...req.body,
      id: `news-${Date.now()}`,
      slug: (req.body.title || 'berita').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      views: 0
    };
    db.news.unshift(item);
    saveDatabase(db);
    res.status(201).json(item);
  });
  app.put('/api/cms/news/:id', (req: Request, res: Response) => {
    const idx = db.news.findIndex(n => n.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Berita tidak ditemukan' });
    db.news[idx] = { ...db.news[idx], ...req.body };
    saveDatabase(db);
    res.json(db.news[idx]);
  });
  app.delete('/api/cms/news/:id', (req: Request, res: Response) => {
    db.news = db.news.filter(n => n.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Helper to sanitize users (strip password hashes)
  function sanitizeUser(u: any) {
    const { password, passwordHash, ...rest } = u;
    return rest;
  }

  // CMS: Users & RBAC (Internal Staff Accounts Managed by Super Admin)
  app.get('/api/cms/users', (req: Request, res: Response) => {
    res.json(db.users.map(sanitizeUser));
  });

  app.post('/api/cms/users', (req: Request, res: Response) => {
    const { username, email, name, jabatan, role, phone, isActive, password, avatarUrl, createdBy } = req.body;

    if (!username || !email || !name) {
      return res.status(400).json({ error: 'Nama lengkap, username, dan email wajib diisi.' });
    }

    const cleanUsername = String(username).trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const cleanEmail = String(email).trim().toLowerCase();

    // Check duplicate
    if (db.users.some(u => u.username?.toLowerCase() === cleanUsername)) {
      return res.status(409).json({ error: `Username @${cleanUsername} sudah digunakan oleh petugas lain.` });
    }
    if (db.users.some(u => u.email?.toLowerCase() === cleanEmail)) {
      return res.status(409).json({ error: `Email ${cleanEmail} sudah terdaftar pada sistem.` });
    }

    const allowedRoles = ['super_admin', 'admin_sekolah', 'panitia_spmb', 'tim_seleksi', 'kepala_sekolah'];
    const assignedRole = allowedRoles.includes(role) ? role : 'panitia_spmb';

    const plainPassword = password && String(password).trim().length >= 10 ? String(password).trim() : '';
    if (!plainPassword) {
      return res.status(400).json({ error: 'Kata sandi minimal 10 karakter wajib ditentukan.' });
    }

    const newUser: any = {
      id: `usr-${Date.now()}`,
      username: cleanUsername,
      email: cleanEmail,
      name: String(name).trim(),
      jabatan: jabatan || 'Staf Sekolah',
      role: assignedRole,
      phone: phone || '',
      avatarUrl: avatarUrl || '',
      isActive: isActive !== false,
      createdAt: new Date().toISOString(),
      mustChangePassword: false,
      passwordHash: hashPassword(plainPassword)
    };

    db.users.push(newUser);
    saveDatabase(db);

    logActivity(
      'admin',
      createdBy || 'Super Admin',
      'super_admin',
      'Buat Akun Petugas Baru',
      `Super Admin membuat akun petugas baru "${newUser.name}" (@${newUser.username}) dengan peran ${newUser.role}.`
    );

    res.status(201).json({
      ...sanitizeUser(newUser),
      temporaryPassword: plainPassword
    });
  });

  app.put('/api/cms/users/:id', (req: Request, res: Response) => {
    const idx = db.users.findIndex(u => u.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });

    const current = db.users[idx];
    const { username, email, name, jabatan, role, phone, isActive, avatarUrl, password, updatedBy } = req.body;

    // Check username uniqueness if changed
    if (username) {
      const cleanUsername = String(username).trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (cleanUsername !== current.username && db.users.some(u => u.id !== current.id && u.username?.toLowerCase() === cleanUsername)) {
        return res.status(409).json({ error: `Username @${cleanUsername} sudah digunakan oleh petugas lain.` });
      }
      current.username = cleanUsername;
    }

    // Check email uniqueness if changed
    if (email) {
      const cleanEmail = String(email).trim().toLowerCase();
      if (cleanEmail !== current.email && db.users.some(u => u.id !== current.id && u.email?.toLowerCase() === cleanEmail)) {
        return res.status(409).json({ error: `Email ${cleanEmail} sudah terdaftar pada akun lain.` });
      }
      current.email = cleanEmail;
    }

    if (name) current.name = String(name).trim();
    if (jabatan !== undefined) current.jabatan = jabatan;
    if (phone !== undefined) current.phone = phone;
    if (avatarUrl !== undefined) current.avatarUrl = avatarUrl;

    // Protect main super_admin
    if (current.id === 'usr-superadmin') {
      current.isActive = true;
      current.role = 'super_admin';
    } else {
      if (isActive !== undefined) current.isActive = Boolean(isActive);
      if (role && ['super_admin', 'admin_sekolah', 'panitia_spmb', 'tim_seleksi', 'kepala_sekolah'].includes(role)) {
        current.role = role;
      }
    }

    let updatedPasswordStr: string | null = null;
    let logDetail = `Super Admin memperbarui data akun @${current.username} (${current.name}).`;
    if (password && String(password).trim().length >= 10) {
      updatedPasswordStr = String(password).trim();
      current.passwordHash = hashPassword(updatedPasswordStr);
      delete current.password;
      current.mustChangePassword = false;
      logDetail += ' Kata sandi pengguna telah diatur ulang secara resmi.';
    }

    current.updatedAt = new Date().toISOString();
    saveDatabase(db);

    logActivity(
      'admin',
      updatedBy || 'Super Admin',
      'super_admin',
      'Update Akun Petugas',
      logDetail
    );

    res.json({
      ...sanitizeUser(current),
      ...(updatedPasswordStr ? { temporaryPassword: updatedPasswordStr } : {})
    });
  });

  // Dedicated Password Reset Endpoint by Super Admin
  app.post('/api/cms/users/:id/reset-password', (req: Request, res: Response) => {
    const idx = db.users.findIndex(u => u.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });

    const user = db.users[idx];
    const { newPassword, adminName } = req.body;

    if (!newPassword || String(newPassword).length < 10) {
      return res.status(400).json({ error: 'Password baru minimal harus 10 karakter.' });
    }

    const cleanPass = String(newPassword).trim();
    user.passwordHash = hashPassword(cleanPass);
    delete user.password;
    user.mustChangePassword = true;
    user.updatedAt = new Date().toISOString();
    saveDatabase(db);

    logActivity(
      'admin',
      adminName || 'Super Admin',
      'super_admin',
      'Reset Password Pengguna',
      `Super Admin berhasil mengatur ulang (reset) kata sandi untuk akun @${user.username} (${user.name}).`
    );

    res.json({
      success: true,
      temporaryPassword: cleanPass,
      message: `Kata sandi akun @${user.username} berhasil diatur ulang. Petugas dapat masuk menggunakan kata sandi baru ini.`
    });
  });

  // Dedicated Password Change Endpoint by Super Admin (without modifying other user data)
  app.post('/api/cms/users/:id/change-password', (req: Request, res: Response) => {
    const idx = db.users.findIndex(u => u.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });

    const user = db.users[idx];
    const { newPassword, adminName } = req.body;

    if (!newPassword || String(newPassword).length < 10) {
      return res.status(400).json({ error: 'Password baru minimal harus 10 karakter.' });
    }

    const cleanPass = String(newPassword).trim();
    user.passwordHash = hashPassword(cleanPass);
    delete user.password;
    user.mustChangePassword = false;
    user.updatedAt = new Date().toISOString();
    saveDatabase(db);

    logActivity(
      'admin',
      adminName || 'Super Admin',
      'super_admin',
      'Ubah Password Petugas',
      `Super Admin berhasil memperbarui kata sandi untuk akun @${user.username} (${user.name}).`
    );

    res.json({
      success: true,
      temporaryPassword: cleanPass,
      message: `Password akun @${user.username} (${user.name}) berhasil diperbarui secara aman.`
    });
  });

  // Toggle User Active / Inactive Status
  app.patch('/api/cms/users/:id/status', (req: Request, res: Response) => {
    const idx = db.users.findIndex(u => u.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });

    const user = db.users[idx];
    if (user.id === 'usr-superadmin') {
      return res.status(403).json({ error: 'Akun Super Admin Utama tidak dapat dinonaktifkan demi stabilitas sistem.' });
    }

    const { isActive, adminName } = req.body;
    user.isActive = isActive !== undefined ? Boolean(isActive) : !user.isActive;
    user.updatedAt = new Date().toISOString();
    saveDatabase(db);

    logActivity(
      'admin',
      adminName || 'Super Admin',
      'super_admin',
      'Ubah Status Akun Petugas',
      `Super Admin mengubah status akun @${user.username} menjadi ${user.isActive ? 'AKTIF' : 'NONAKTIF'}.`
    );

    res.json(sanitizeUser(user));
  });

  app.delete('/api/cms/users/:id', (req: Request, res: Response) => {
    const user = db.users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });

    if (user.id === 'usr-superadmin' || user.role === 'super_admin') {
      return res.status(403).json({ error: 'Akun Super Admin tidak dapat dihapus demi keamanan sistem.' });
    }

    db.users = db.users.filter(u => u.id !== req.params.id);
    saveDatabase(db);

    logActivity(
      'admin',
      'Super Admin',
      'super_admin',
      'Hapus Akun Petugas',
      `Super Admin menghapus permanen akun @${user.username} (${user.name}).`
    );

    res.json({ success: true, message: `Akun @${user.username} berhasil dihapus.` });
  });

  // ==========================================
  // SPMB STAGE MANAGEMENT (DYNAMIC WORKFLOW)
  // ==========================================

  // Get Published Stage Definitions (Active on Public Cek Status)
  app.get('/api/spmb/stages', (req: Request, res: Response) => {
    res.json(db.spmbStages || INITIAL_SPMB_STAGES);
  });

  // Get Draft Stage Definitions (For Super Admin Editor & Preview)
  app.get('/api/spmb/stages/draft', (req: Request, res: Response) => {
    const draft = db.draftStages || db.spmbStages || INITIAL_SPMB_STAGES;
    res.json({
      stages: draft,
      flowSettings: db.flowSettings || { isDraft: false }
    });
  });

  // Save Stages as Draft
  app.put('/api/spmb/stages/draft', (req: Request, res: Response) => {
    const { stages, updatedBy } = req.body;
    if (!Array.isArray(stages)) {
      return res.status(400).json({ error: 'Data tahapan harus berupa array.' });
    }

    db.draftStages = stages;
    db.flowSettings = {
      ...(db.flowSettings || { publishedAt: '2026-11-01T08:00:00Z', publishedBy: 'Super Admin' }),
      isDraft: true
    };
    saveDatabase(db);

    logActivity(
      'admin',
      updatedBy || 'Super Admin',
      'super_admin',
      'Simpan Draft Alur SPMB',
      `Super Admin menyimpan draf konfigurasi alur SPMB (${stages.length} tahapan).`
    );

    res.json({
      success: true,
      stages: db.draftStages,
      flowSettings: db.flowSettings
    });
  });

  // Publish Stages to Live Public Cek Status & Migrate Applicants Safely
  app.post('/api/spmb/stages/publish', (req: Request, res: Response) => {
    const { stages, updatedBy } = req.body;
    const stagesToPublish = Array.isArray(stages) ? stages : (db.draftStages || db.spmbStages);

    const sorted = [...stagesToPublish].sort((a, b) => a.order - b.order).map((s, idx) => ({
      ...s,
      order: idx + 1,
      id: s.id || `stage-${Date.now()}-${idx + 1}`
    }));

    db.spmbStages = sorted;
    db.draftStages = JSON.parse(JSON.stringify(sorted));
    db.flowSettings = {
      publishedAt: new Date().toISOString(),
      publishedBy: updatedBy || 'Super Admin',
      isDraft: false
    };

    // Safe migration of existing applicants' stage history:
    // Retain existing progress for matching stageIds, add new ones with waiting, without losing any history
    db.registrations.forEach(r => {
      const existing = r.stages || [];
      const updatedStages = sorted.map(st => {
        const found = existing.find(e => e.stageId === st.id);
        if (found) {
          return {
            ...found,
            order: st.order,
            title: st.title,
            actionInstruction: st.actionInstruction
          };
        }
        return {
          stageId: st.id,
          order: st.order,
          title: st.title,
          status: 'waiting' as any,
          notes: st.description || 'Menunggu tahapan dimulai.',
          actionInstruction: st.actionInstruction,
          actionRequired: false,
          updatedBy: updatedBy || 'Super Admin',
          updatedAt: new Date().toISOString()
        };
      });
      r.stages = updatedStages;
    });

    saveDatabase(db);

    logActivity(
      'admin',
      updatedBy || 'Super Admin',
      'super_admin',
      'Publikasikan Alur SPMB',
      `Super Admin mempublikasikan alur penerimaan murid baru (${sorted.length} tahapan aktif).`
    );

    res.json({
      success: true,
      message: `Alur SPMB dengan ${sorted.length} tahapan berhasil dipublikasikan ke halaman Cek Status.`,
      stages: db.spmbStages,
      flowSettings: db.flowSettings
    });
  });

  // Revert Draft to Current Published Live Stages
  app.post('/api/spmb/stages/revert-draft', (req: Request, res: Response) => {
    db.draftStages = JSON.parse(JSON.stringify(db.spmbStages));
    db.flowSettings = {
      ...(db.flowSettings || {}),
      isDraft: false
    };
    saveDatabase(db);
    res.json({
      success: true,
      stages: db.draftStages,
      flowSettings: db.flowSettings
    });
  });

  // Add a New Stage (Live or Draft)
  app.post('/api/spmb/stages', (req: Request, res: Response) => {
    const { stage, isDraft, updatedBy } = req.body;
    if (!stage || !stage.title) {
      return res.status(400).json({ error: 'Nama tahapan wajib diisi.' });
    }

    const targetList = isDraft ? (db.draftStages || db.spmbStages) : db.spmbStages;
    const newStage = {
      id: stage.id || `stage-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      order: stage.order || targetList.length + 1,
      title: stage.title,
      description: stage.description || '',
      startDate: stage.startDate || '',
      endDate: stage.endDate || '',
      isActive: stage.isActive !== false,
      isRequired: stage.isRequired !== false,
      showToParents: stage.showToParents !== false,
      processType: stage.processType || 'lainnya',
      actionInstruction: stage.actionInstruction || '',
      hasForm: Boolean(stage.hasForm),
      hasDocumentUpload: Boolean(stage.hasDocumentUpload),
      hasObservation: Boolean(stage.hasObservation),
      hasReRegistration: Boolean(stage.hasReRegistration),
      colorStatus: stage.colorStatus || 'neutral',
      isCompletedGlobally: false,
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy || 'Super Admin'
    };

    targetList.push(newStage);
    targetList.sort((a, b) => a.order - b.order);

    if (isDraft) {
      db.draftStages = targetList;
      db.flowSettings = { ...(db.flowSettings || {}), isDraft: true };
    } else {
      db.spmbStages = targetList;
      db.draftStages = JSON.parse(JSON.stringify(targetList));
    }
    saveDatabase(db);

    logActivity('admin', updatedBy || 'Super Admin', 'super_admin', 'Tambah Tahapan SPMB', `Tambah tahapan baru "${newStage.title}".`);
    res.json(newStage);
  });

  // Delete a Stage
  app.delete('/api/spmb/stages/:stageId', (req: Request, res: Response) => {
    const { stageId } = req.params;
    const { isDraft, updatedBy } = req.body || {};

    if (isDraft) {
      db.draftStages = (db.draftStages || []).filter(s => s.id !== stageId);
      db.draftStages.forEach((s, idx) => { s.order = idx + 1; });
      db.flowSettings = { ...(db.flowSettings || {}), isDraft: true };
    } else {
      db.spmbStages = (db.spmbStages || []).filter(s => s.id !== stageId);
      db.spmbStages.forEach((s, idx) => { s.order = idx + 1; });
      db.draftStages = JSON.parse(JSON.stringify(db.spmbStages));
    }
    saveDatabase(db);

    logActivity('admin', updatedBy || 'Super Admin', 'super_admin', 'Hapus Tahapan SPMB', `Hapus tahapan id ${stageId}.`);
    res.json({ success: true, message: 'Tahapan berhasil dihapus.' });
  });

  // Update Single Stage Definition
  app.put('/api/spmb/stages/:stageId', (req: Request, res: Response) => {
    const { stageId } = req.params;
    const { isDraft, ...stageData } = req.body;
    const targetList = isDraft ? (db.draftStages || db.spmbStages) : db.spmbStages;
    const idx = targetList.findIndex(s => s.id === stageId);
    if (idx === -1) {
      return res.status(404).json({ error: 'Tahapan tidak ditemukan.' });
    }

    targetList[idx] = {
      ...targetList[idx],
      ...stageData,
      id: stageId,
      updatedAt: new Date().toISOString()
    };

    if (isDraft) {
      db.draftStages = targetList;
      db.flowSettings = { ...(db.flowSettings || {}), isDraft: true };
    } else {
      db.spmbStages = targetList;
      db.draftStages = JSON.parse(JSON.stringify(targetList));
    }
    saveDatabase(db);

    logActivity(
      'admin',
      req.body.updatedBy || 'Super Admin',
      'super_admin',
      'Update Detail Tahapan SPMB',
      `Super Admin memperbarui tahapan "${targetList[idx].title}".`
    );

    res.json(targetList[idx]);
  });

  // Toggle Global Completion of a Stage
  app.post('/api/spmb/stages/:stageId/toggle-global', (req: Request, res: Response) => {
    const { stageId } = req.params;
    const { isCompleted, updatedBy } = req.body;
    const idx = (db.spmbStages || []).findIndex(s => s.id === stageId);
    if (idx === -1) {
      return res.status(404).json({ error: 'Tahapan tidak ditemukan.' });
    }

    const current = db.spmbStages[idx];
    current.isCompletedGlobally = isCompleted !== undefined ? Boolean(isCompleted) : !current.isCompletedGlobally;
    current.updatedAt = new Date().toISOString();
    current.updatedBy = updatedBy || 'Super Admin';
    saveDatabase(db);

    logActivity(
      'admin',
      updatedBy || 'Super Admin',
      'super_admin',
      'Checklist Tahapan Umum SPMB',
      `Super Admin menandai tahapan "${current.title}" sebagai ${current.isCompletedGlobally ? 'SELESAI' : 'BELUM SELESAI'}.`
    );

    res.json(current);
  });

  // Update Individual Applicant Stages (Tier 2: Checklist per peserta)
  app.put('/api/spmb/registrations/:id/stages', (req: Request, res: Response) => {
    const { id } = req.params;
    const { stages, stageId, status: newStageStatus, notes, updatedBy } = req.body;

    const reg = db.registrations.find(r => r.id === id || r.registrationNumber === id);
    if (!reg) {
      return res.status(404).json({ error: 'Data pendaftaran tidak ditemukan.' });
    }

    if (!reg.stages || !Array.isArray(reg.stages) || reg.stages.length === 0) {
      reg.stages = createDefaultApplicantStages(reg.status);
    }

    if (Array.isArray(stages)) {
      reg.stages = stages;
    } else if (stageId) {
      const sIdx = reg.stages.findIndex(s => s.stageId === stageId);
      if (sIdx !== -1) {
        reg.stages[sIdx] = {
          ...reg.stages[sIdx],
          status: newStageStatus || reg.stages[sIdx].status,
          notes: notes !== undefined ? notes : reg.stages[sIdx].notes,
          completedAt: newStageStatus === 'completed' ? new Date().toISOString() : undefined,
          actionRequired: newStageStatus === 'action_needed',
          updatedBy: updatedBy || 'Panitia SPMB',
          updatedAt: new Date().toISOString()
        };
      }
    }

    reg.updatedAt = new Date().toISOString();
    saveDatabase(db);

    logActivity(
      'admin',
      updatedBy || 'Petugas SPMB',
      'panitia_spmb',
      'Update Tahapan Individual Peserta',
      `Memperbarui checklist tahapan untuk calon siswa ${reg.student.fullName} (${reg.registrationNumber}).`
    );

    res.json({ success: true, registration: reg });
  });

  // ==========================================
  // SPMB WAVES (GELOMBANG 1 & 2) MANAGEMENT
  // ==========================================
  app.get('/api/spmb/waves', (req: Request, res: Response) => {
    res.json(db.spmbWaves || [db.spmbWave]);
  });

  app.put('/api/spmb/waves/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const waveData = req.body;

    if (!db.spmbWaves || !Array.isArray(db.spmbWaves)) {
      db.spmbWaves = JSON.parse(JSON.stringify(INITIAL_SPMB_WAVES));
    }

    const idx = db.spmbWaves.findIndex(w => w.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Gelombang tidak ditemukan.' });
    }

    db.spmbWaves[idx] = {
      ...db.spmbWaves[idx],
      ...waveData,
      id
    };

    // If updating primary or active wave, sync db.spmbWave
    if (id === 'wave-1' || db.spmbWaves[idx].isActive) {
      db.spmbWave = {
        ...db.spmbWave,
        ...db.spmbWaves[idx]
      };
    }

    saveDatabase(db);
    logActivity('admin', waveData.updatedBy || 'Super Admin', 'super_admin', 'Update Gelombang SPMB', `Update data ${db.spmbWaves[idx].name} (Status: ${db.spmbWaves[idx].status || 'Aktif'})`);
    res.json(db.spmbWaves[idx]);
  });

  // ==========================================
  // ADMIN WHATSAPP SETTINGS (OBSERVASI & PEMBAYARAN)
  // ==========================================
  app.get('/api/settings/whatsapp-admin', (req: Request, res: Response) => {
    res.json(db.adminWhatsAppSettings || INITIAL_ADMIN_WHATSAPP_SETTINGS);
  });

  app.put('/api/settings/whatsapp-admin', (req: Request, res: Response) => {
    const payload = req.body;
    db.adminWhatsAppSettings = {
      ...(db.adminWhatsAppSettings || INITIAL_ADMIN_WHATSAPP_SETTINGS),
      ...payload,
      updatedAt: new Date().toISOString(),
      updatedBy: payload.updatedBy || 'Super Admin'
    };

    saveDatabase(db);
    logActivity('admin', payload.updatedBy || 'Super Admin', 'super_admin', 'Update WhatsApp Admin', `Super Admin memperbarui nomor WhatsApp Admin (${db.adminWhatsAppSettings.adminPhone}) dan template pesan.`);
    res.json(db.adminWhatsAppSettings);
  });

  // CMS: Activity Logs
  app.get('/api/cms/activity-logs', (req: Request, res: Response) => {
    res.json(db.activityLogs);
  });

  // CMS: Settings
  app.get('/api/cms/settings', (req: Request, res: Response) => {
    res.json(db.settings);
  });
  app.put('/api/cms/settings', (req: Request, res: Response) => {
    db.settings = { ...db.settings, ...req.body };
    saveDatabase(db);
    res.json(db.settings);
  });

  // Google Sheet & Apps Script Integration Endpoints
  app.get('/api/settings/google-sheet', (req: Request, res: Response) => {
    if (!db.settings.googleSheetSettings) {
      db.settings.googleSheetSettings = {
        spreadsheetId: '1_zt6amQtAr3eGjSPqwaJrIT_irLZvICla9j5lOX2kEM',
        appsScriptUrl: '',
        autoSync: true,
        lastSyncStatus: 'idle',
        lastSyncMessage: 'Siap menghubungkan ke Google Apps Script Spreadsheet 1_zt6amQtAr3eGjSPqwaJrIT_irLZvICla9j5lOX2kEM'
      };
      saveDatabase(db);
    }
    res.json(db.settings.googleSheetSettings);
  });

  app.put('/api/settings/google-sheet', (req: Request, res: Response) => {
    const payload = req.body || {};
    db.settings.googleSheetSettings = {
      ...(db.settings.googleSheetSettings || {
        spreadsheetId: '1_zt6amQtAr3eGjSPqwaJrIT_irLZvICla9j5lOX2kEM',
        autoSync: true
      }),
      ...payload,
      // Always enforce the requested target spreadsheet ID
      spreadsheetId: '1_zt6amQtAr3eGjSPqwaJrIT_irLZvICla9j5lOX2kEM'
    };
    saveDatabase(db);
    logActivity('admin', 'Super Admin', 'super_admin', 'Update Google Sheet Sync', `Pengaturan integrasi Google Sheet (ID: 1_zt6amQtAr3eGjSPqwaJrIT_irLZvICla9j5lOX2kEM) diperbarui.`);
    res.json(db.settings.googleSheetSettings);
  });

  app.get('/api/settings/google-sheet/script-code', (req: Request, res: Response) => {
    res.json({
      spreadsheetId: '1_zt6amQtAr3eGjSPqwaJrIT_irLZvICla9j5lOX2kEM',
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1_zt6amQtAr3eGjSPqwaJrIT_irLZvICla9j5lOX2kEM/edit',
      sheetName: 'DATA_PENDAFTAR_SPMB',
      scriptCode: GOOGLE_APPS_SCRIPT_CODE
    });
  });

  app.post('/api/spmb/sync-google-sheet', async (req: Request, res: Response) => {
    const gSettings = db.settings.googleSheetSettings;
    if (!gSettings || !gSettings.appsScriptUrl) {
      return res.status(400).json({
        success: false,
        error: 'URL Web App Apps Script belum diisi. Silakan pasang dan masukkan Web App URL di Pengaturan.'
      });
    }

    try {
      const response = await fetch(gSettings.appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrations: db.registrations })
      });
      const data = await response.json();

      gSettings.lastSyncAt = new Date().toISOString();
      gSettings.lastSyncStatus = 'success';
      gSettings.syncedCount = db.registrations.length;
      gSettings.lastSyncMessage = `Sukses sinkron ${db.registrations.length} data pendaftar ke Google Sheet.`;
      saveDatabase(db);

      logActivity('admin', 'Super Admin', 'super_admin', 'Manual Google Sheet Sync', `Sinkronisasi massal ${db.registrations.length} data pendaftar ke Spreadsheet 1_zt6amQtAr3eGjSPqwaJrIT_irLZvICla9j5lOX2kEM`);

      res.json({
        success: true,
        count: db.registrations.length,
        message: `Berhasil menyinkronkan ${db.registrations.length} data pendaftar ke Google Sheet.`
      });
    } catch (err: any) {
      gSettings.lastSyncAt = new Date().toISOString();
      gSettings.lastSyncStatus = 'error';
      gSettings.lastSyncMessage = `Gagal sinkron: ${err.message}`;
      saveDatabase(db);
      res.status(500).json({
        success: false,
        error: `Gagal menghubungi Google Apps Script: ${err.message}`
      });
    }
  });

  // CMS: Media Library
  app.get('/api/media', (req: Request, res: Response) => {
    res.json(db.mediaLibrary || []);
  });

  app.post('/api/media/upload', (req: Request, res: Response) => {
    try {
      const {
        fileName,
        dataUrl,
        title,
        description,
        category,
        activityDate,
        isThumbnail,
        order,
        isPublished,
        usageLocation,
        uploadedBy
      } = req.body;

      if (!dataUrl) {
        return res.status(400).json({ error: 'Data foto tidak ditemukan' });
      }

      // Parse dataUrl
      const matches = dataUrl.match(/^data:([A-Za-z0-9\/\-+.]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: 'Format data foto tidak valid' });
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      if (buffer.length > 5 * 1024 * 1024) {
        return res.status(400).json({ error: 'Ukuran foto melebihi batas maksimal 5MB' });
      }

      const extMap: Record<string, string> = {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/webp': '.webp'
      };
      const ext = extMap[mimeType] || '.jpg';
      const safePrefix = fileName ? fileName.replace(/[^a-zA-Z0-9_-]/g, '_') : 'foto';
      const cleanFileName = `${safePrefix}_${Date.now()}${ext}`;
      const savePath = path.resolve(UPLOADS_DIR, cleanFileName);

      fs.writeFileSync(savePath, buffer);
      const publicUrl = `/uploads/${cleanFileName}`;

      const newMedia = {
        id: `med-${Date.now()}`,
        title: title || fileName || 'Foto Dokumentasi',
        description: description || '',
        url: publicUrl,
        category: category || 'kegiatan_belajar',
        fileSizeKb: Math.round(buffer.length / 1024),
        mimeType,
        activityDate: activityDate || new Date().toISOString().split('T')[0],
        isThumbnail: Boolean(isThumbnail),
        order: Number(order) || (db.mediaLibrary.length + 1),
        isPublished: isPublished !== false,
        usageLocations: usageLocation ? [usageLocation] : [],
        uploadedAt: new Date().toISOString(),
        uploadedBy: uploadedBy || 'Admin'
      };

      db.mediaLibrary.unshift(newMedia);
      saveDatabase(db);

      logActivity(
        'admin',
        uploadedBy || 'Admin',
        'super_admin',
        'Upload Foto',
        `Menambahkan foto "${newMedia.title}" ke Media Library`
      );

      res.status(201).json(newMedia);
    } catch (err: any) {
      console.error('Upload media error:', err);
      res.status(500).json({ error: 'Gagal mengunggah foto: ' + (err.message || 'Error internal') });
    }
  });

  app.put('/api/media/:id', (req: Request, res: Response) => {
    const idx = db.mediaLibrary.findIndex(m => m.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Foto tidak ditemukan' });
    }

    const current = db.mediaLibrary[idx];
    const updated = {
      ...current,
      ...req.body,
      id: current.id,
      url: req.body.url || current.url
    };

    db.mediaLibrary[idx] = updated;
    saveDatabase(db);
    res.json(updated);
  });

  app.delete('/api/media/:id', (req: Request, res: Response) => {
    const idx = db.mediaLibrary.findIndex(m => m.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Foto tidak ditemukan' });
    }

    const media = db.mediaLibrary[idx];
    const force = req.query.force === 'true';

    // Scan for actual usage locations across system
    const detectedLocations: string[] = [];
    const mUrl = media.url;

    if (db.schoolProfile?.branding) {
      const b = db.schoolProfile.branding;
      if (b.mainLogoUrl === mUrl) detectedLocations.push('Logo Utama Sekolah');
      if (b.navbarLogoUrl === mUrl) detectedLocations.push('Logo Navbar');
      if (b.footerLogoUrl === mUrl) detectedLocations.push('Logo Footer');
      if (b.heroBannerUrl === mUrl) detectedLocations.push('Hero Banner Beranda');
      if (b.spmbBannerUrl === mUrl) detectedLocations.push('Banner SPMB');
    }

    (db.extracurriculars || []).forEach(e => {
      if (e.imageUrl === mUrl) detectedLocations.push(`Ekstrakurikuler: ${e.name} (Foto Utama)`);
      if (e.additionalImages && e.additionalImages.includes(mUrl)) detectedLocations.push(`Ekstrakurikuler: ${e.name} (Dokumentasi)`);
    });

    (db.programs || []).forEach(p => {
      if (p.imageUrl === mUrl) detectedLocations.push(`Program: ${p.title}`);
    });

    (db.schoolProfile?.facilities || []).forEach(f => {
      if (f.imageUrl === mUrl) detectedLocations.push(`Fasilitas: ${f.name}`);
    });

    (db.gallery || []).forEach(g => {
      if (g.imageUrl === mUrl) detectedLocations.push(`Galeri: ${g.title}`);
    });

    (db.news || []).forEach(n => {
      if (n.imageUrl === mUrl) detectedLocations.push(`Berita: ${n.title}`);
    });

    if (detectedLocations.length > 0 && !force) {
      return res.status(409).json({
        error: 'Foto masih digunakan pada beberapa bagian website.',
        inUse: true,
        usageLocations: detectedLocations
      });
    }

    // Unlink physical file if inside /uploads/
    if (media.url.startsWith('/uploads/')) {
      const fileName = path.basename(media.url);
      const diskPath = path.resolve(UPLOADS_DIR, fileName);
      if (fs.existsSync(diskPath)) {
        try {
          fs.unlinkSync(diskPath);
        } catch (e) {
          console.error('Gagal menghapus file foto fisik:', e);
        }
      }
    }

    db.mediaLibrary.splice(idx, 1);
    saveDatabase(db);

    logActivity(
      'admin',
      'Admin Utama',
      'super_admin',
      'Hapus Foto',
      `Menghapus foto "${media.title}" dari Media Library`
    );

    res.json({ success: true, message: 'Foto berhasil dihapus' });
  });

  // CMS: Branding Settings
  app.get('/api/cms/branding', (req: Request, res: Response) => {
    res.json(db.schoolProfile.branding || {});
  });

  app.put('/api/cms/branding', (req: Request, res: Response) => {
    const current = db.schoolProfile.branding || {
      mainLogoUrl: '/assets/aistudio/5_4164f3ac.png',
      faviconUrl: '/assets/aistudio/5_4164f3ac.png',
      navbarLogoUrl: '/assets/aistudio/5_4164f3ac.png',
      footerLogoUrl: '/assets/aistudio/5_4164f3ac.png',
      loginLogoUrl: '/assets/aistudio/5_4164f3ac.png',
      receiptLogoUrl: '/assets/aistudio/5_4164f3ac.png',
      heroBannerUrl: '',
      spmbBannerUrl: '',
      logoScale: 100,
      showSchoolNameNextToLogo: true,
      updatedAt: new Date().toISOString()
    };

    const updatedBranding = {
      ...current,
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    db.schoolProfile.branding = updatedBranding;
    saveDatabase(db);

    logActivity(
      'admin',
      'Admin Utama',
      'super_admin',
      'Update Branding Sekolah',
      'Memperbarui logo dan identitas visual website sekolah'
    );

    res.json(updatedBranding);
  });

  // CMS: Reset Demo Data
  app.post('/api/cms/reset-demo', (req: Request, res: Response) => {
    db = getInitialDatabase();
    saveDatabase(db);
    res.json({ success: true, message: 'Database telah direset ke data awal demo resmi.' });
  });

  // Setup Vite in Dev or Static in Production
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server SDIT Insan Cendikia Kalibaru berjalan di port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
