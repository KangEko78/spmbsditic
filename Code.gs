/**
 * Google Apps Script Web App untuk SPMB SDIT INSAN CENDIKIA KALIBARU
 * Spreadsheet ID: 1_zt6amQtAr3eGjSPqwaJrIT_irLZvICla9j5lOX2kEM
 * 
 * Pasang melalui Extensions > Apps Script pada spreadsheet, lalu simpan file ini.
 * Jalankan setBackendSecret() dan initializeFirstAdmin() satu kali dari editor.
 * Deploy sebagai Web App, Execute as Me, access Anyone, lalu set
 * GAS_WEB_APP_URL dan GAS_API_SECRET pada environment server proyek Vercel.
 * Rahasia API tidak boleh ditaruh di frontend atau file source.
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
  // Fail closed: never silently write to a different active spreadsheet.
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
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
    if (data.apiRequest) {
      return jsonOutput(handleApiRequest(data.apiRequest));
    }
    const configuredSecret = PropertiesService.getScriptProperties().getProperty(APP_API_SECRET_PROPERTY);
    if (!configuredSecret || data.apiSecret !== configuredSecret) return jsonOutput({ _httpStatus: 401, error: 'Akses backend ditolak.' });
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
  
  const safeRowData = rowData.map(value => typeof value === 'string' && /^[=+@-]/.test(value) ? "'" + value : value);
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, safeRowData.length).setValues([safeRowData]);
  } else {
    sheet.appendRow(safeRowData);
  }
}

// Vercel serverless proxy -> Apps Script API -> Google Sheets.
// Set APP_API_SECRET in Script Properties and the same value as GAS_API_SECRET in Vercel.
const APP_DATA_SHEET = 'APP_DATA';
const APP_API_SECRET_PROPERTY = 'APP_API_SECRET';
const APP_SESSION_TTL_SECONDS = 21600;
const APP_CHUNK_SIZE = 45000;
const APP_MAX_UPLOAD_CHARS = 3500000;

function jsonOutput(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

function getAppDataSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(APP_DATA_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(APP_DATA_SHEET);
    sheet.getRange(1, 1, 1, 4).setValues([['Collection', 'ID', 'Part', 'JSON']]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function readAppRecords(collection) {
  const values = getAppDataSheet().getDataRange().getValues();
  const parts = {};
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] !== collection) continue;
    const id = String(values[i][1]);
    if (!parts[id]) parts[id] = [];
    parts[id].push([Number(values[i][2]), String(values[i][3])]);
  }
  return Object.keys(parts).map(id => {
    const json = parts[id].sort((a, b) => a[0] - b[0]).map(part => part[1]).join('');
    try { return JSON.parse(json); } catch (_) { return null; }
  }).filter(Boolean);
}

function writeAppRecord(collection, id, value) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = getAppDataSheet();
    const rows = sheet.getDataRange().getValues();
    const existingRows = [];
    for (let i = 1; i < rows.length; i++) if (rows[i][0] === collection && String(rows[i][1]) === String(id)) existingRows.push(i + 1);
    const json = JSON.stringify(value);
    const chunks = [];
    for (let i = 0; i < json.length; i += APP_CHUNK_SIZE) chunks.push(json.slice(i, i + APP_CHUNK_SIZE));
    const updateCount = Math.min(existingRows.length, chunks.length);
    const existingRangeRows = existingRows.slice(0, updateCount);
    const contiguous = !existingRangeRows.length || existingRangeRows.every((row, index) => row === existingRangeRows[0] + index);
    if (updateCount && contiguous) {
      const range = sheet.getRange(existingRangeRows[0], 1, updateCount, 4);
      range.setNumberFormat('@');
      range.setValues(chunks.slice(0, updateCount).map((chunk, index) => [collection, String(id), index, chunk]));
    } else if (updateCount) {
      for (let i = 0; i < updateCount; i++) {
        const range = sheet.getRange(existingRows[i], 1, 1, 4);
        range.setNumberFormat('@');
        range.setValues([[collection, String(id), i, chunks[i]]]);
      }
    }
    if (existingRows.length > chunks.length) existingRows.slice(chunks.length).sort((a, b) => b - a).forEach(row => sheet.deleteRow(row));
    if (chunks.length > existingRows.length) {
      const newRows = chunks.slice(existingRows.length).map((chunk, index) => [collection, String(id), index + existingRows.length, chunk]);
      const range = sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, 4);
      range.setNumberFormat('@');
      range.setValues(newRows);
    }
  } finally {
    lock.releaseLock();
  }
}

function deleteAppRecord(collection, id) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = getAppDataSheet();
    const values = sheet.getDataRange().getValues();
    const rowsToDelete = [];
    for (let i = 1; i < values.length; i++) if (values[i][0] === collection && String(values[i][1]) === String(id)) rowsToDelete.push(i + 1);
    rowsToDelete.sort((a, b) => b - a).forEach(row => sheet.deleteRow(row));
  } finally {
    lock.releaseLock();
  }
}

function appendChunkRows(rows, collection, id, value) {
  const json = JSON.stringify(value);
  for (let i = 0, part = 0; i < json.length; i += APP_CHUNK_SIZE, part++)
    rows.push([collection, String(id), part, json.slice(i, i + APP_CHUNK_SIZE)]);
}

function initializeAppRecords(data) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = getAppDataSheet();
    const existing = sheet.getDataRange().getValues().slice(1);
    const rows = existing.filter(row => row[0] === 'users' || !['meta:schoolProfile', 'meta:spmbWave', 'meta:settings', 'meta:whatsappSettings', 'meta:googleSheetSettings', 'programs', 'extracurriculars', 'teachers', 'gallery', 'achievements', 'news', 'stages', 'waves'].includes(row[0]));
    const singles = { schoolProfile: 'meta:schoolProfile', spmbWave: 'meta:spmbWave', settings: 'meta:settings', whatsappSettings: 'meta:whatsappSettings' };
    Object.keys(singles).forEach(key => { if (data[key]) appendChunkRows(rows, singles[key], 'value', data[key]); });
    if (data.settings && data.settings.googleSheetSettings) appendChunkRows(rows, 'meta:googleSheetSettings', 'value', data.settings.googleSheetSettings);
    const lists = { programs: 'programs', extracurriculars: 'extracurriculars', teachers: 'teachers', gallery: 'gallery', achievements: 'achievements', news: 'news', spmbStages: 'stages', spmbWaves: 'waves' };
    Object.keys(lists).forEach(key => (data[key] || []).forEach(item => { if (item && item.id) appendChunkRows(rows, lists[key], item.id, item); }));
    sheet.clearContents();
    sheet.getRange(1, 1, 1, 4).setValues([['Collection', 'ID', 'Part', 'JSON']]);
    if (rows.length) {
      const range = sheet.getRange(2, 1, rows.length, 4);
      range.setNumberFormat('@');
      range.setValues(rows);
    }
  } finally {
    lock.releaseLock();
  }
}

function syncRegistrationIfEnabled(registration) {
  const settings = readAppRecords('meta:googleSheetSettings')[0] || {};
  if (settings.autoSync === false) return;
  upsertRegistration(getTargetSheet(), registration);
}

function appCollection(name) {
  const map = {
    teachers: 'teachers', programs: 'programs', extracurriculars: 'extracurriculars',
    gallery: 'gallery', achievements: 'achievements', news: 'news', users: 'users',
    registrations: 'registrations', media: 'media', stages: 'stages', waves: 'waves',
    'activity-logs': 'activityLogs'
  };
  return map[name] || null;
}

function sha256Hex(text) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8)
    .map(b => ('0' + ((b + 256) % 256).toString(16)).slice(-2)).join('');
}

function safeUser(user) {
  const copy = Object.assign({}, user);
  delete copy.passwordHash;
  delete copy.passwordSalt;
  delete copy.password;
  delete copy.confirmPassword;
  return copy;
}

function recordActivity(actor, action, details) {
  const log = {
    id: Utilities.getUuid(), userId: actor && actor.id || 'system',
    userName: actor && actor.name || 'Sistem SPMB', userRole: actor && actor.role || 'system',
    action: action, details: details, timestamp: new Date().toISOString()
  };
  writeAppRecord('activityLogs', log.id, log);
}

function getAuthorizedUser(token) {
  if (!token) return null;
  const raw = CacheService.getScriptCache().get('session:' + token);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw);
    const current = readAppRecords('users').find(user => user.id === session.id);
    if (!current || current.isActive === false || Number(current.sessionVersion || 1) !== Number(session.sessionVersion || 1)) {
      CacheService.getScriptCache().remove('session:' + token);
      return null;
    }
    return safeUser(current);
  } catch (_) { return null; }
}

function apiFailure(status, error) { return { _httpStatus: status, error: error }; }

function roleCanUse(user, path, method) {
  if (user.role === 'super_admin') return true;
  if (['auth/session', 'auth/profile', 'auth/change-password'].indexOf(path) >= 0) return true;
  if (/^cms\/users(?:\/|$)/.test(path) || path.indexOf('settings/google-sheet') === 0 || path === 'cms/reset-demo') return false;
  if (user.role === 'admin_sekolah') return path.indexOf('cms/') === 0 || path.indexOf('settings/') === 0;
  if (user.role === 'panitia_spmb') return path.indexOf('spmb/registrations') === 0 || path.indexOf('spmb/waves') === 0 || path.indexOf('spmb/stages') === 0 || path === 'cms/activity-logs';
  if (user.role === 'tim_seleksi') return path.indexOf('spmb/registrations') === 0 && (method === 'GET' || /selection|stages/.test(path));
  if (user.role === 'kepala_sekolah') return method === 'GET';
  return false;
}

function handleApiRequest(request) {
  const props = PropertiesService.getScriptProperties();
  if (!request || !request.apiSecret || request.apiSecret !== props.getProperty(APP_API_SECRET_PROPERTY))
    return apiFailure(401, 'Akses backend ditolak.');

  const method = String(request.method || 'GET').toUpperCase();
  const path = String(request.path || '').split('?')[0].replace(/^\/?api\/?/, '').replace(/^\//, '');
  const query = request.query || {};
  const body = request.body || {};
  const token = String(request.sessionToken || '');
  const user = getAuthorizedUser(token);
  const publicRoutes = ['bootstrap', 'health', 'auth/login', 'auth/forgot-password', 'spmb/check-status', 'spmb/upload-revision', 'spmb/upload-payment-proof', 'spmb/whatsapp-group', 'spmb/registrations'];
  const isPublic = publicRoutes.indexOf(path) >= 0 && (path !== 'spmb/registrations' || method === 'POST');

  if (path === 'health' && method === 'GET') return { status: 'ok', backend: 'apps-script', spreadsheetId: SPREADSHEET_ID };
  if (path === 'bootstrap' && method === 'GET') {
    const profile = readAppRecords('meta:schoolProfile')[0];
    if (!profile) return apiFailure(503, 'Data website belum diinisialisasi.');
    return {
      schoolProfile: profile,
      programs: readAppRecords('programs'), extracurriculars: readAppRecords('extracurriculars'),
      teachers: readAppRecords('teachers'), gallery: readAppRecords('gallery'),
      achievements: readAppRecords('achievements'), news: readAppRecords('news'),
      spmbWave: readAppRecords('meta:spmbWave')[0] || {},
      settings: readAppRecords('meta:settings')[0] || {},
      whatsappSettings: readAppRecords('meta:whatsappSettings')[0] || {},
      spmbStages: readAppRecords('stages')
    };
  }

  if (!isPublic && !user) return apiFailure(401, 'Sesi admin tidak valid atau sudah berakhir. Silakan masuk kembali.');
  if (user && user.isActive === false) return apiFailure(403, 'Akun admin dinonaktifkan.');
  if (user && !roleCanUse(user, path, method)) return apiFailure(403, 'Peran akun tidak memiliki akses ke fitur ini.');

  if (path === 'auth/login' && method === 'POST') {
    const id = String(body.identifier || body.username || body.email || '').trim().toLowerCase();
    const loginKey = 'login:' + sha256Hex(id);
    const cache = CacheService.getScriptCache();
    const attempts = Number(cache.get(loginKey) || 0);
    if (attempts >= 10) return apiFailure(429, 'Terlalu banyak percobaan masuk. Coba kembali dalam 15 menit.');
    const candidate = readAppRecords('users').find(u => String(u.username || '').toLowerCase() === id || String(u.email || '').toLowerCase() === id);
    if (!candidate || !candidate.passwordSalt || !candidate.passwordHash || sha256Hex(candidate.passwordSalt + String(body.password || '')) !== candidate.passwordHash) {
      cache.put(loginKey, String(attempts + 1), 900);
      return apiFailure(401, 'Username/email atau kata sandi salah.');
    }
    cache.remove(loginKey);
    if (candidate.isActive === false) return apiFailure(403, 'Akun admin dinonaktifkan.');
    const sessionToken = Utilities.getUuid() + Utilities.getUuid();
    candidate.sessionVersion = Number(candidate.sessionVersion || 1);
    const sessionUser = safeUser(candidate);
    CacheService.getScriptCache().put('session:' + sessionToken, JSON.stringify(sessionUser), APP_SESSION_TTL_SECONDS);
    candidate.lastLoginAt = new Date().toISOString();
    writeAppRecord('users', candidate.id, candidate);
    recordActivity(candidate, 'Login', 'Admin berhasil masuk ke sistem.');
    return { user: sessionUser, token: sessionToken };
  }
  if (path === 'auth/logout' && method === 'POST') {
    if (token) CacheService.getScriptCache().remove('session:' + token);
    return { success: true };
  }
  if (path === 'auth/session' && method === 'GET') return { user: user };
  if (path === 'bootstrap/initialize' && method === 'POST') {
    if (user.role !== 'super_admin') return apiFailure(403, 'Hanya admin utama yang dapat menyiapkan data awal.');
    if (props.getProperty('APP_INITIALIZED') === 'true') return { success: true, initialized: false };
    const data = body || {};
    initializeAppRecords(data);
    props.setProperty('APP_INITIALIZED', 'true');
    return { success: true, initialized: true };
  }
  if (path === 'auth/profile' && method === 'PUT') {
    const updated = Object.assign({}, user, body);
    delete updated.password;
    writeAppRecord('users', user.id, updated);
    return safeUser(updated);
  }
  if (path === 'auth/change-password' && method === 'POST') {
    const users = readAppRecords('users');
    const target = users.find(u => u.id === user.id);
    if (!target || (body.currentPassword && sha256Hex(target.passwordSalt + body.currentPassword) !== target.passwordHash))
      return apiFailure(400, 'Kata sandi saat ini tidak cocok.');
    if (String(body.newPassword || '').length < 10) return apiFailure(400, 'Kata sandi baru minimal 10 karakter.');
    target.passwordSalt = Utilities.getUuid(); target.passwordHash = sha256Hex(target.passwordSalt + body.newPassword);
    writeAppRecord('users', target.id, target);
    return { success: true, message: 'Kata sandi berhasil diperbarui.' };
  }
  if (path === 'auth/forgot-password' && method === 'POST') return apiFailure(501, 'Pemulihan kata sandi belum tersedia. Hubungi administrator sekolah untuk mengatur ulang akun.');
  if (path === 'cms/reset-demo' && method === 'POST') return apiFailure(403, 'Reset data demo dinonaktifkan untuk melindungi data pendaftar.');
  if (path === 'settings/google-sheet/script-code' && method === 'GET') return apiFailure(501, 'Ambil file Code.gs dari paket proyek.');

  const waveCollection = path === 'spmb/waves' ? 'waves' : null;
  if (waveCollection && method === 'GET') return readAppRecords(waveCollection);
  const waveMatch = path.match(/^spmb\/waves\/([^/]+)$/);
  if (waveMatch && (method === 'PUT' || method === 'PATCH')) {
    const waveId = decodeURIComponent(waveMatch[1]);
    const wave = Object.assign({}, readAppRecords('waves').find(item => item.id === waveId) || {}, body, { id: waveId });
    writeAppRecord('waves', waveId, wave);
    writeAppRecord('meta:spmbWave', 'value', wave);
    return wave;
  }

  if (path.indexOf('spmb/stages') === 0) {
    const draft = path.indexOf('/draft') >= 0;
    const bucket = draft ? 'draftStages' : 'stages';
    const base = readAppRecords(bucket);
    if (path === 'spmb/stages' || path === 'spmb/stages/draft') {
      if (method === 'GET') return base;
      if (method === 'PUT') {
        const stages = Array.isArray(body) ? body : (body.stages || []);
        base.forEach(item => deleteAppRecord(bucket, item.id));
        stages.forEach(item => { if (item && item.id) writeAppRecord(bucket, item.id, item); });
        return stages;
      }
      if (method === 'POST') {
        if (path.endsWith('/draft')) return apiFailure(400, 'Format draft tidak valid.');
        const item = Object.assign({}, body, { id: body.id || Utilities.getUuid() });
        writeAppRecord(bucket, item.id, item); return item;
      }
    }
    if (path === 'spmb/stages/publish' && method === 'POST') {
      const draftsToPublish = readAppRecords('draftStages');
      const live = readAppRecords('stages'); live.forEach(item => deleteAppRecord('stages', item.id));
      draftsToPublish.forEach(item => writeAppRecord('stages', item.id, item));
      return { success: true, stages: draftsToPublish };
    }
    if (path === 'spmb/stages/revert-draft' && method === 'POST') {
      const drafts = readAppRecords('draftStages'); drafts.forEach(item => deleteAppRecord('draftStages', item.id));
      readAppRecords('stages').forEach(item => writeAppRecord('draftStages', item.id, item));
      return { success: true };
    }
    const stageMatch = path.match(/^spmb\/stages\/([^/]+)(?:\/(.+))?$/);
    if (stageMatch && !['draft', 'publish', 'revert-draft'].includes(stageMatch[1])) {
      const id = decodeURIComponent(stageMatch[1]);
      const action = stageMatch[2] || '';
      const stage = base.find(item => item.id === id);
      if (!stage && method !== 'POST') return apiFailure(404, 'Tahap tidak ditemukan.');
      if (action === 'toggle-global' && method === 'POST') {
        const completed = body.isCompleted !== undefined ? Boolean(body.isCompleted) : (body.isCompletedGlobally !== undefined ? Boolean(body.isCompletedGlobally) : !stage.isCompletedGlobally);
        const updated = Object.assign({}, stage, { isCompletedGlobally: completed, updatedAt: new Date().toISOString(), updatedBy: body.updatedBy || user.name });
        writeAppRecord(bucket, id, updated); return updated;
      }
      if (method === 'DELETE') { deleteAppRecord(bucket, id); return { success: true }; }
      if (method === 'PUT') { const updated = Object.assign({}, stage, body, { id }); writeAppRecord(bucket, id, updated); return updated; }
    }
  }

  if (path === 'cms/teachers/upload-photo' && method === 'POST') {
    if (String(body.dataUrl || '').length > APP_MAX_UPLOAD_CHARS) return apiFailure(413, 'Ukuran foto terlalu besar.');
    return { url: body.dataUrl || '' };
  }
  if (path === 'spmb/whatsapp-group' && method === 'GET') return readAppRecords('meta:whatsappSettings')[0] || {};
  if (path === 'media/upload' && method === 'POST') {
    if (String(body.dataUrl || '').length > APP_MAX_UPLOAD_CHARS) return apiFailure(413, 'Ukuran berkas terlalu besar.');
    const item = Object.assign({}, body, { id: body.id || Utilities.getUuid(), url: body.dataUrl || body.url || '' });
    delete item.dataUrl;
    writeAppRecord('media', item.id, item); return item;
  }

  const userAction = path.match(/^cms\/users\/([^/]+)\/(reset-password|change-password|status)$/);
  if (userAction) {
    const id = decodeURIComponent(userAction[1]);
    const target = readAppRecords('users').find(item => item.id === id);
    if (!target) return apiFailure(404, 'Akun tidak ditemukan.');
    if (userAction[2] === 'status') {
      target.isActive = Boolean(body.isActive); writeAppRecord('users', id, target); return safeUser(target);
    }
    let password = String(body.newPassword || '');
    if (userAction[2] === 'reset-password') password = Utilities.getUuid().replace(/-/g, '').slice(0, 16) + 'aA!';
    if (password.length < 10) return apiFailure(400, 'Kata sandi minimal 10 karakter.');
    target.passwordSalt = Utilities.getUuid(); target.passwordHash = sha256Hex(target.passwordSalt + password);
    if (target.id !== user.id) target.sessionVersion = Number(target.sessionVersion || 1) + 1;
    writeAppRecord('users', id, target);
    return userAction[2] === 'reset-password' ? { success: true, temporaryPassword: password, user: safeUser(target) } : { success: true, user: safeUser(target) };
  }

  if (path === 'spmb/registrations' && method === 'POST') {
    const ip = String(request.clientIp || 'unknown');
    const submitKey = 'submit:' + sha256Hex(ip);
    const cache = CacheService.getScriptCache();
    const submits = Number(cache.get(submitKey) || 0);
    if (submits >= 10) return apiFailure(429, 'Batas pengiriman formulir tercapai. Coba lagi nanti.');
    cache.put(submitKey, String(submits + 1), 3600);
    const reg = Object.assign({}, body);
    if (!reg.student || !reg.student.fullName || !reg.student.birthDate || !reg.student.nik || !reg.parent)
      return apiFailure(400, 'Data siswa dan orang tua belum lengkap.');
    const submittedNik = String(reg.student && reg.student.nik || '').trim();
    if (submittedNik && readAppRecords('registrations').some(item => String(item.student && item.student.nik || '').trim() === submittedNik))
      return apiFailure(409, 'NIK siswa ini sudah pernah digunakan untuk pendaftaran.');
    reg.id = reg.id || Utilities.getUuid();
    reg.registrationNumber = reg.registrationNumber || ('SPMB-' + new Date().getFullYear() + '-' + Utilities.getUuid().slice(0, 6).toUpperCase());
    reg.status = reg.status || 'Menunggu Verifikasi';
    reg.submittedAt = reg.submittedAt || new Date().toISOString(); reg.updatedAt = new Date().toISOString();
    writeAppRecord('registrations', reg.id, reg);
    recordActivity(null, 'Pendaftaran Baru', 'Nomor pendaftaran ' + reg.registrationNumber + ' dibuat.');
    try { syncRegistrationIfEnabled(reg); } catch (err) { console.error('Sheet export failed', err); }
    return reg;
  }
  if ((path === 'spmb/upload-revision' || path === 'spmb/upload-payment-proof') && method === 'POST') {
    if (String(body.dataUrl || '').length > APP_MAX_UPLOAD_CHARS) return apiFailure(413, 'Ukuran berkas terlalu besar.');
    const reg = readAppRecords('registrations').find(item => item.registrationNumber === body.registrationNumber && item.student && item.student.birthDate === body.birthDate);
    if (!reg) return apiFailure(404, 'Nomor pendaftaran atau tanggal lahir tidak cocok.');
    if (path === 'spmb/upload-revision') {
      const doc = (reg.documents || []).find(item => item.id === body.documentId);
      if (!doc) return apiFailure(404, 'Dokumen yang perlu diperbaiki tidak ditemukan.');
      doc.fileUrl = body.dataUrl; doc.fileName = body.fileName || doc.fileName;
      doc.uploadedAt = new Date().toISOString(); doc.status = 'Sudah Diunggah'; doc.needsRevision = false;
      reg.status = 'Menunggu Verifikasi';
    } else {
      reg.paymentProof = { method: body.method, paymentDate: body.paymentDate, amount: body.amount, senderName: body.senderName, fileUrl: body.dataUrl, fileName: body.fileName, uploadedAt: new Date().toISOString(), status: 'Menunggu Verifikasi' };
    }
    reg.updatedAt = new Date().toISOString();
    writeAppRecord('registrations', reg.id, reg);
    recordActivity(null, 'Dokumen Diperbarui', 'Berkas pendaftaran ' + reg.registrationNumber + ' diperbarui.');
    try { syncRegistrationIfEnabled(reg); } catch (err) { console.error('Sheet export failed', err); }
    return path === 'spmb/upload-revision' ? { success: true, message: 'Dokumen berhasil diterima.', document: reg.documents.find(item => item.id === body.documentId), newStatus: reg.status } : { success: true, message: 'Bukti pembayaran diterima.', paymentProof: reg.paymentProof };
  }
  if (path === 'spmb/check-status' && method === 'POST') {
    const match = readAppRecords('registrations').find(r => r.registrationNumber === body.registrationNumber && r.student && r.student.birthDate === body.birthDate);
    if (!match) return apiFailure(404, 'Nomor pendaftaran atau tanggal lahir tidak cocok.');
    const docsToRevise = (match.documents || []).filter(doc => doc.needsRevision || doc.status === 'Perlu Perbaikan').map(doc => ({ id: doc.id, name: doc.name, label: doc.label, currentFileName: doc.fileName, revisionNote: doc.revisionNote || '', status: doc.status || 'Perlu Perbaikan', currentUrl: doc.fileUrl }));
    const group = readAppRecords('meta:whatsappSettings')[0] || {};
    const admin = readAppRecords('meta:adminWhatsAppSettings')[0] || {};
    return {
      registrationNumber: match.registrationNumber, childName: match.student.fullName,
      academicYear: match.academicYear || '', waveName: match.waveName || '',
      submittedAt: match.submittedAt, updatedAt: match.updatedAt, status: match.status,
      panitiaNotes: match.revisionNotes || '', verificationHistory: match.verificationLogs || [],
      needsDocumentRevision: docsToRevise.length > 0, documentsToRevise: docsToRevise,
      stages: match.stages || [], paymentProof: match.paymentProof || null,
      selectionResult: match.selectionResult || null,
      whatsAppGroup: { isEligible: Boolean(group.isActive && (group.allowedStatuses || []).includes(match.status)), groupName: group.groupName || '', inviteLink: group.inviteLink || group.groupLink || '', infoMessage: group.infoMessage || '', isActive: Boolean(group.isActive) },
      adminWhatsApp: { adminPhone: admin.adminPhone || admin.phoneNumber || '', enableObservation: Boolean(admin.enableObservationButton || admin.enableObservasiButton), observationLink: '', enablePayment: Boolean(admin.enablePaymentButton || admin.enableDaftarUlangButton), paymentLink: '' },
      reRegistration: Object.assign({ isEligible: false, isCompleted: false, deadline: '', totalCost: 0, paymentAccount: '', instructions: '' }, match.reRegistration || {})
    };
  }

  const regMatch = path.match(/^spmb\/registrations\/([^/]+)(?:\/(.+))?$/);
  if (regMatch) {
    const id = decodeURIComponent(regMatch[1]);
    const reg = readAppRecords('registrations').find(r => r.id === id || r.registrationNumber === id);
    if (!reg && method !== 'POST') return apiFailure(404, 'Data pendaftaran tidak ditemukan.');
    const action = regMatch[2] || '';
    if (method === 'GET') return reg;
    if (method === 'DELETE') { deleteAppRecord('registrations', reg.id); return { success: true }; }
    const next = Object.assign({}, reg, body, { updatedAt: new Date().toISOString() });
    if (action === 'status') {
      next.status = body.status || next.status;
      next.verificationLogs = (reg.verificationLogs || []).concat([{ id: Utilities.getUuid(), verifiedBy: body.verifiedBy || user.name, verifierRole: body.verifierRole || user.role, status: next.status, notes: body.notes || '', timestamp: new Date().toISOString() }]);
    }
    if (action === 'selection') {
      const totalScore = Number(((Number(body.observasiKesiapan || 0) * 0.4) + (Number(body.bacaQuranIqro || 0) * 0.3) + (Number(body.wawancaraOrtu || 0) * 0.3)).toFixed(1));
      next.selection = Object.assign({}, reg.selection || {}, body, { totalScore, evaluatedAt: new Date().toISOString() });
      next.status = body.isPassed === true ? 'Diterima' : (body.isPassed === false ? 'Tidak Diterima' : 'Dalam Seleksi');
      next.verificationLogs = (reg.verificationLogs || []).concat([{ id: Utilities.getUuid(), verifiedBy: body.evaluatedBy || user.name, verifierRole: user.role, status: next.status, notes: 'Skor seleksi: ' + totalScore + '. ' + (body.catatanSeleksi || ''), timestamp: new Date().toISOString() }]);
    }
    if (action === 're-registration') {
      next.reRegistration = Object.assign({}, reg.reRegistration || {}, body);
      if (body.isConfirmed) next.status = 'Selesai Daftar Ulang';
    }
    if (action === 'reregistration-approval') {
      next.reRegistration = Object.assign({}, reg.reRegistration || {}, { status: body.status, approvedBy: body.approverName || user.name, approvedAt: new Date().toISOString(), adminNotes: body.adminNotes || '' });
    }
    if (action === 'verify-payment') {
      next.paymentProof = Object.assign({}, reg.paymentProof || {}, { status: body.status, adminNotes: body.adminNotes || '', verifiedBy: body.verifierName || '', verifiedAt: new Date().toISOString() });
    }
    if (action === 'stages') {
      if (Array.isArray(body.stages)) next.stages = body.stages;
      else {
        const stages = Array.isArray(reg.stages) ? reg.stages.slice() : [];
        const index = stages.findIndex(stage => stage.stageId === body.stageId);
        if (index >= 0) stages[index] = Object.assign({}, stages[index], body, { updatedAt: new Date().toISOString() });
        else if (body.stageId) stages.push(Object.assign({}, body, { updatedAt: new Date().toISOString() }));
        next.stages = stages;
      }
    }
    writeAppRecord('registrations', reg.id, next);
    recordActivity(user, action || 'Perbarui Pendaftar', 'Nomor pendaftaran ' + reg.registrationNumber + ' diperbarui.');
    try { syncRegistrationIfEnabled(next); } catch (err) { console.error('Sheet export failed', err); }
    if (action === 'verify-payment') return { success: true, message: 'Status bukti pembayaran diperbarui.', registration: next };
    if (action === 'reregistration-approval') return { success: true, message: 'Daftar ulang diperbarui.', registration: next };
    return next;
  }
  if (path === 'spmb/registrations' && method === 'GET') {
    return readAppRecords('registrations').filter(r => (!query.userId || r.userId === query.userId || r.userEmail === user.email) && (!query.status || r.status === query.status) && (!query.waveId || r.waveId === query.waveId) && (!query.search || JSON.stringify(r).toLowerCase().includes(String(query.search).toLowerCase())));
  }

  const singletons = {
    'cms/profile': 'meta:schoolProfile', 'cms/wave': 'meta:spmbWave',
    'cms/settings': 'meta:settings', 'cms/whatsapp': 'meta:whatsappSettings',
    'settings/whatsapp-admin': 'meta:adminWhatsAppSettings', 'settings/google-sheet': 'meta:googleSheetSettings',
    'cms/branding': 'meta:branding'
  };
  if (singletons[path]) {
    const collection = singletons[path];
    if (method === 'GET') return readAppRecords(collection)[0] || {};
    if (method === 'PUT' || method === 'POST') { writeAppRecord(collection, 'value', body); return body; }
  }

  const collectionMatch = path.match(/^(?:cms\/([a-z-]+)|media)(?:\/([^/]+))?(?:\/(.+))?$/);
  if (collectionMatch) {
    const name = path.startsWith('media') ? 'media' : collectionMatch[1];
    const collection = appCollection(name || '');
    if (collection) {
      const id = collectionMatch[2] ? decodeURIComponent(collectionMatch[2]) : '';
      const action = collectionMatch[3] || '';
      if (!id && method === 'GET') return readAppRecords(collection).map(safeUser);
      if (!id && method === 'POST') {
        const item = Object.assign({}, body); item.id = item.id || Utilities.getUuid();
        if (collection === 'users') {
          const password = String(item.password || ''); delete item.password;
          delete item.confirmPassword;
          if (password.length < 10) return apiFailure(400, 'Kata sandi minimal 10 karakter wajib ditentukan.');
          item.passwordSalt = Utilities.getUuid(); item.passwordHash = sha256Hex(item.passwordSalt + password);
        }
        writeAppRecord(collection, item.id, item); recordActivity(user, 'Tambah Data', 'Data ' + name + ' ditambahkan.'); return safeUser(item);
      }
      const existing = readAppRecords(collection).find(item => item.id === id);
      if (!existing) return apiFailure(404, 'Data tidak ditemukan.');
      if (method === 'GET') return safeUser(existing);
      if (method === 'DELETE') { deleteAppRecord(collection, id); return { success: true }; }
      if (method === 'PUT' || method === 'PATCH') {
        const updated = Object.assign({}, existing, body, { id: existing.id, updatedAt: new Date().toISOString() });
        delete updated.password;
        if (collection === 'users' && body.password) {
          if (String(body.password).length < 10) return apiFailure(400, 'Kata sandi minimal 10 karakter.');
          updated.passwordSalt = Utilities.getUuid(); updated.passwordHash = sha256Hex(updated.passwordSalt + body.password);
          if (updated.id !== user.id) updated.sessionVersion = Number(existing.sessionVersion || 1) + 1;
        }
        writeAppRecord(collection, id, updated); recordActivity(user, 'Perbarui Data', 'Data ' + name + ' diperbarui.'); return safeUser(updated);
      }
    }
  }
  if (path === 'cms/activity-logs' && method === 'GET') return readAppRecords('activityLogs').sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp))).slice(0, 500);
  if (path === 'spmb/sync-google-sheet' && method === 'POST') {
    const regs = readAppRecords('registrations'); const target = getTargetSheet();
    regs.forEach(reg => upsertRegistration(target, reg));
    const sheetSettings = readAppRecords('meta:googleSheetSettings')[0] || {};
    writeAppRecord('meta:googleSheetSettings', 'value', Object.assign({}, sheetSettings, { lastSyncAt: new Date().toISOString(), lastSyncStatus: 'success', syncedCount: regs.length, lastSyncMessage: 'Data pendaftar berhasil disinkronkan.' }));
    return { success: true, count: regs.length, message: 'Data pendaftar tersinkron ke Google Sheet.' };
  }
  return apiFailure(501, 'Endpoint belum didukung Apps Script: ' + method + ' ' + path);
}

function initializeFirstAdmin() {
  const username = Browser.inputBox('Akun Admin Awal', 'Masukkan username admin (bukan kata sandi):', Browser.Buttons.OK_CANCEL);
  if (username === 'cancel') return;
  const password = Browser.inputBox('Kata Sandi Admin', 'Masukkan kata sandi minimal 10 karakter. Nilai hanya dipakai untuk membuat hash.', Browser.Buttons.OK_CANCEL);
  if (password === 'cancel') return;
  if (password.length < 10) throw new Error('Kata sandi minimal 10 karakter.');
  const users = readAppRecords('users');
  if (users.some(user => user.role === 'super_admin')) throw new Error('Admin utama sudah dibuat.');
  const salt = Utilities.getUuid();
  const user = { id: Utilities.getUuid(), username: String(username).trim(), email: '', name: 'Administrator', role: 'super_admin', jabatan: 'Administrator', isActive: true, createdAt: new Date().toISOString(), passwordSalt: salt, passwordHash: sha256Hex(salt + password) };
  writeAppRecord('users', user.id, user);
  SpreadsheetApp.getUi().alert('Admin awal berhasil dibuat. Kata sandi tidak disimpan sebagai teks.');
}

function setBackendSecret() {
  const secret = Browser.inputBox('Rahasia API Backend', 'Tempelkan nilai rahasia acak yang sama dengan GAS_API_SECRET pada Vercel.', Browser.Buttons.OK_CANCEL);
  if (secret === 'cancel') return;
  if (String(secret).length < 32) throw new Error('Rahasia API harus memiliki setidaknya 32 karakter.');
  PropertiesService.getScriptProperties().setProperty(APP_API_SECRET_PROPERTY, String(secret));
  SpreadsheetApp.getUi().alert('Rahasia backend disimpan di Script Properties.');
}
