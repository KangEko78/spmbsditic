/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Registration,
  SchoolProfile,
  Teacher,
  ProgramUnggulan,
  Extracurricular,
  GalleryItem,
  Achievement,
  NewsItem,
  SpmbWave,
  User,
  ActivityLog,
  SystemSettings,
  MediaItem,
  SchoolBranding,
  CheckStatusResult,
  WhatsAppGroupSettings,
  SpmbStageDefinition,
  ApplicantStageProgress,
  PaymentProof,
  AdminWhatsAppSettings,
  GoogleSheetSettings
} from '../types';
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
  INITIAL_REGISTRATIONS,
  INITIAL_SETTINGS,
  INITIAL_WHATSAPP_SETTINGS,
  INITIAL_SPMB_STAGES
} from '../data/initialData';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const SESSION_KEY = 'sdit_spmb_session';

async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = typeof window !== 'undefined' ? window.sessionStorage.getItem(SESSION_KEY) : null;
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return window.fetch(input, { ...init, headers });
}

export interface BootstrapData {
  schoolProfile: SchoolProfile;
  programs: ProgramUnggulan[];
  extracurriculars: Extracurricular[];
  teachers: Teacher[];
  gallery: GalleryItem[];
  achievements: Achievement[];
  news: NewsItem[];
  spmbWave: SpmbWave;
  settings: SystemSettings;
  whatsappSettings?: WhatsAppGroupSettings;
  spmbStages?: SpmbStageDefinition[];
}

export const api = {
  // Bootstrap data
  async getBootstrap(): Promise<BootstrapData> {
    try {
      const res = await apiFetch(`${BASE_URL}/bootstrap`);
      if (res.ok) {
        const data = await res.json();
        return {
          schoolProfile: INITIAL_SCHOOL_PROFILE,
          programs: INITIAL_PROGRAMS,
          extracurriculars: INITIAL_EXTRACURRICULARS,
          teachers: INITIAL_TEACHERS,
          gallery: INITIAL_GALLERY,
          achievements: INITIAL_ACHIEVEMENTS,
          news: INITIAL_NEWS,
          spmbWave: INITIAL_SPMB_WAVE,
          settings: INITIAL_SETTINGS,
          whatsappSettings: INITIAL_WHATSAPP_SETTINGS,
          ...data
        };
      }
    } catch (err) {
      console.warn('API getBootstrap failed, using fallback:', err);
    }
    return {
      schoolProfile: INITIAL_SCHOOL_PROFILE,
      programs: INITIAL_PROGRAMS,
      extracurriculars: INITIAL_EXTRACURRICULARS,
      teachers: INITIAL_TEACHERS,
      gallery: INITIAL_GALLERY,
      achievements: INITIAL_ACHIEVEMENTS,
      news: INITIAL_NEWS,
      spmbWave: INITIAL_SPMB_WAVE,
      settings: INITIAL_SETTINGS,
      whatsappSettings: INITIAL_WHATSAPP_SETTINGS
    };
  },

  // Auth: Internal Personnel Login
  async login(payload: {
    identifier?: string;
    username?: string;
    email?: string;
    password?: string;
  }): Promise<{ user: User; token: string }> {
    const res = await apiFetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login gagal. Periksa kembali username/email dan password Anda.');
    }
    if (data.token) {
      window.sessionStorage.setItem(SESSION_KEY, data.token);
      try {
        await apiFetch(`${BASE_URL}/bootstrap/initialize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schoolProfile: INITIAL_SCHOOL_PROFILE,
            programs: INITIAL_PROGRAMS,
            extracurriculars: INITIAL_EXTRACURRICULARS,
            teachers: INITIAL_TEACHERS,
            gallery: INITIAL_GALLERY,
            achievements: INITIAL_ACHIEVEMENTS,
            news: INITIAL_NEWS,
            spmbWave: INITIAL_SPMB_WAVE,
            spmbWaves: INITIAL_SPMB_WAVES,
            settings: INITIAL_SETTINGS,
            whatsappSettings: INITIAL_WHATSAPP_SETTINGS,
            spmbStages: INITIAL_SPMB_STAGES
          })
        });
      } catch (err) {
        console.warn('Penyiapan data awal server dilewati:', err);
      }
    }
    return data;
  },

  async getCurrentUser(): Promise<User | null> {
    const token = window.sessionStorage.getItem(SESSION_KEY);
    if (!token) return null;
    try {
      const res = await apiFetch(`${BASE_URL}/auth/session`);
      if (!res.ok) return null;
      const result = await res.json();
      return result.user || null;
    } catch {
      return null;
    }
  },

  // Auth: Logout
  async logout(userId?: string, userName?: string, userRole?: string): Promise<void> {
    try {
      await apiFetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userName, userRole })
      });
    } catch (err) {
      console.warn('Logout notification error:', err);
    } finally {
      window.sessionStorage.removeItem(SESSION_KEY);
    }
  },

  // Auth: Update Own Profile
  async updateUserProfile(userId: string, data: { name?: string; phone?: string; avatarUrl?: string }): Promise<User> {
    const res = await apiFetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...data })
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Gagal memperbarui profil.');
    }
    return result;
  },

  // Auth: Change Password
  async changePassword(userId: string, newPassword: string, currentPassword?: string): Promise<{ success: boolean; message: string }> {
    const res = await apiFetch(`${BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, newPassword, currentPassword })
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Gagal memperbarui kata sandi.');
    }
    return result;
  },

  // Auth: Forgot Password Flow
  async forgotPassword(identifier: string): Promise<{ success: boolean; message: string }> {
    const res = await apiFetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier })
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Gagal memproses permintaan lupa password.');
    }
    return result;
  },

  // Registrations: List
  async getRegistrations(params?: { userId?: string; status?: string; search?: string; waveId?: string }): Promise<Registration[]> {
    try {
      const q = new URLSearchParams();
      if (params?.userId) q.set('userId', params.userId);
      if (params?.status) q.set('status', params.status);
      if (params?.search) q.set('search', params.search);
      if (params?.waveId) q.set('waveId', params.waveId);

      const res = await apiFetch(`${BASE_URL}/spmb/registrations?${q.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('API getRegistrations failed, using fallback:', err);
    }
    return INITIAL_REGISTRATIONS;
  },

  // Registrations: Create
  async createRegistration(data: Partial<Registration>): Promise<Registration> {
    const res = await apiFetch(`${BASE_URL}/spmb/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Pendaftaran gagal disimpan. Periksa koneksi dan coba kembali.');
    }
    return result;
  },

  // Registrations: Update / Revision
  async updateRegistration(id: string, data: Partial<Registration>): Promise<Registration> {
    const res = await apiFetch(`${BASE_URL}/spmb/registrations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Gagal memperbarui data pendaftaran');
    const updated = await res.json();
    return updated;
  },

  // Registrations: Update Status
  async updateRegistrationStatus(id: string, payload: {
    status: string;
    notes?: string;
    verifiedBy?: string;
    verifierRole?: string;
  }): Promise<Registration> {
    const res = await apiFetch(`${BASE_URL}/spmb/registrations/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Gagal memperbarui status');
    const updated = await res.json();
    return updated;
  },

  // Registrations: Selection Assessment
  async updateSelectionScore(id: string, payload: {
    observasiKesiapan: number;
    bacaQuranIqro: number;
    wawancaraOrtu: number;
    catatanSeleksi: string;
    evaluatedBy: string;
    isPassed?: boolean;
  }): Promise<Registration> {
    const res = await apiFetch(`${BASE_URL}/spmb/registrations/${id}/selection`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Gagal menginput nilai seleksi');
    const updated = await res.json();
    return updated;
  },

  // Registrations: Re-Registration
  async updateReRegistration(id: string, payload: {
    isConfirmed: boolean;
    uniformSize?: string;
    paymentReceiptUrl?: string;
    paymentAmount?: number;
    notes?: string;
    operatorName?: string;
  }): Promise<Registration> {
    const res = await apiFetch(`${BASE_URL}/spmb/registrations/${id}/re-registration`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Gagal konfirmasi daftar ulang');
    const updated = await res.json();
    return updated;
  },

  // Registrations: Delete
  async deleteRegistration(id: string): Promise<void> {
    const res = await apiFetch(`${BASE_URL}/spmb/registrations/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Gagal menghapus pendaftaran');
  },

  // CMS: School Profile
  async updateProfile(profile: Partial<SchoolProfile>): Promise<SchoolProfile> {
    const res = await apiFetch(`${BASE_URL}/cms/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    if (!res.ok) throw new Error('Gagal memperbarui profil');
    return await res.json();
  },

  // CMS: SPMB Wave & Quota
  async updateWave(wave: Partial<SpmbWave>): Promise<SpmbWave> {
    const res = await apiFetch(`${BASE_URL}/cms/wave`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(wave)
    });
    if (!res.ok) throw new Error('Gagal memperbarui pengaturan gelombang');
    return await res.json();
  },

  // CMS: Teachers
  async getTeachers(): Promise<Teacher[]> {
    const res = await apiFetch(`${BASE_URL}/cms/teachers`);
    return await res.json();
  },
  async saveTeacher(teacher: Partial<Teacher>): Promise<Teacher> {
    const isEdit = !!teacher.id;
    const url = isEdit ? `${BASE_URL}/cms/teachers/${teacher.id}` : `${BASE_URL}/cms/teachers`;
    const res = await apiFetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teacher)
    });
    return await res.json();
  },
  async deleteTeacher(id: string): Promise<void> {
    await apiFetch(`${BASE_URL}/cms/teachers/${id}`, { method: 'DELETE' });
  },
  async uploadTeacherPhoto(dataUrl: string, teacherName?: string): Promise<{ url: string }> {
    const res = await apiFetch(`${BASE_URL}/cms/teachers/upload-photo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl, teacherName })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal mengunggah foto guru');
    }
    return await res.json();
  },

  // CMS: Programs
  async getPrograms(): Promise<ProgramUnggulan[]> {
    const res = await apiFetch(`${BASE_URL}/cms/programs`);
    return await res.json();
  },
  async saveProgram(program: Partial<ProgramUnggulan>): Promise<ProgramUnggulan> {
    const isEdit = !!program.id;
    const url = isEdit ? `${BASE_URL}/cms/programs/${program.id}` : `${BASE_URL}/cms/programs`;
    const res = await apiFetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(program)
    });
    return await res.json();
  },
  async deleteProgram(id: string): Promise<void> {
    await apiFetch(`${BASE_URL}/cms/programs/${id}`, { method: 'DELETE' });
  },

  // CMS: Extracurriculars
  async getExtracurriculars(): Promise<Extracurricular[]> {
    const res = await apiFetch(`${BASE_URL}/cms/extracurriculars`);
    return await res.json();
  },
  async saveExtracurricular(item: Partial<Extracurricular>): Promise<Extracurricular> {
    const isEdit = !!item.id;
    const url = isEdit ? `${BASE_URL}/cms/extracurriculars/${item.id}` : `${BASE_URL}/cms/extracurriculars`;
    const res = await apiFetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  },
  async deleteExtracurricular(id: string): Promise<void> {
    await apiFetch(`${BASE_URL}/cms/extracurriculars/${id}`, { method: 'DELETE' });
  },

  // CMS: Gallery
  async getGallery(): Promise<GalleryItem[]> {
    const res = await apiFetch(`${BASE_URL}/cms/gallery`);
    return await res.json();
  },
  async saveGallery(item: Partial<GalleryItem>): Promise<GalleryItem> {
    const isEdit = !!item.id;
    const url = isEdit ? `${BASE_URL}/cms/gallery/${item.id}` : `${BASE_URL}/cms/gallery`;
    const res = await apiFetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  },
  async deleteGallery(id: string): Promise<void> {
    await apiFetch(`${BASE_URL}/cms/gallery/${id}`, { method: 'DELETE' });
  },

  // CMS: Achievements
  async getAchievements(): Promise<Achievement[]> {
    const res = await apiFetch(`${BASE_URL}/cms/achievements`);
    return await res.json();
  },
  async saveAchievement(item: Partial<Achievement>): Promise<Achievement> {
    const isEdit = !!item.id;
    const url = isEdit ? `${BASE_URL}/cms/achievements/${item.id}` : `${BASE_URL}/cms/achievements`;
    const res = await apiFetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  },
  async deleteAchievement(id: string): Promise<void> {
    await apiFetch(`${BASE_URL}/cms/achievements/${id}`, { method: 'DELETE' });
  },

  // CMS: News
  async getNews(): Promise<NewsItem[]> {
    const res = await apiFetch(`${BASE_URL}/cms/news`);
    return await res.json();
  },
  async saveNews(item: Partial<NewsItem>): Promise<NewsItem> {
    const isEdit = !!item.id;
    const url = isEdit ? `${BASE_URL}/cms/news/${item.id}` : `${BASE_URL}/cms/news`;
    const res = await apiFetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return await res.json();
  },
  async deleteNews(id: string): Promise<void> {
    await apiFetch(`${BASE_URL}/cms/news/${id}`, { method: 'DELETE' });
  },

  // CMS: Users
  async getUsers(): Promise<User[]> {
    const res = await apiFetch(`${BASE_URL}/cms/users`);
    return await res.json();
  },
  async saveUser(user: Partial<User> & { password?: string }): Promise<User & { temporaryPassword?: string }> {
    const isEdit = !!user.id;
    const url = isEdit ? `${BASE_URL}/cms/users/${user.id}` : `${BASE_URL}/cms/users`;
    const res = await apiFetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal menyimpan data pengguna.');
    }
    return data;
  },
  async deleteUser(id: string): Promise<void> {
    await apiFetch(`${BASE_URL}/cms/users/${id}`, { method: 'DELETE' });
  },

  // CMS: Activity Logs
  async getActivityLogs(): Promise<ActivityLog[]> {
    const res = await apiFetch(`${BASE_URL}/cms/activity-logs`);
    return await res.json();
  },

  // CMS: Settings
  async getSettings(): Promise<SystemSettings> {
    const res = await apiFetch(`${BASE_URL}/cms/settings`);
    return await res.json();
  },
  async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    const res = await apiFetch(`${BASE_URL}/cms/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return await res.json();
  },

  // Public Check Status with Rate-limiting & 2FA
  async checkStatus(registrationNumber: string, birthDate: string): Promise<CheckStatusResult> {
    const res = await apiFetch(`${BASE_URL}/spmb/check-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registrationNumber, birthDate })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal memverifikasi status pendaftaran.');
    }
    return data;
  },

  // SPMB Upload Document Revision (Public via 2FA session)
  async uploadRevision(payload: {
    registrationNumber: string;
    birthDate?: string;
    sessionToken?: string;
    documentId: string;
    dataUrl: string;
    fileName: string;
  }): Promise<{ success: boolean; message: string; document: any; newStatus: string }> {
    const res = await apiFetch(`${BASE_URL}/spmb/upload-revision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal mengunggah dokumen perbaikan.');
    }
    return data;
  },

  // WhatsApp Group Settings (CMS & Public)
  async getWhatsAppSettings(): Promise<WhatsAppGroupSettings> {
    const res = await apiFetch(`${BASE_URL}/cms/whatsapp`);
    return await res.json();
  },

  async getPublicWhatsAppGroup(): Promise<{
    groupName: string;
    inviteLink: string;
    groupLink?: string;
    isActive: boolean;
    infoMessage: string;
    updatedAt?: string;
  }> {
    const res = await apiFetch(`${BASE_URL}/spmb/whatsapp-group`);
    return await res.json();
  },

  async updateWhatsAppSettings(payload: Partial<WhatsAppGroupSettings> & { notes?: string }): Promise<WhatsAppGroupSettings> {
    const res = await apiFetch(`${BASE_URL}/cms/whatsapp`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal menyimpan pengaturan WhatsApp SPMB.');
    }
    return data;
  },

  // Toggle User Active Status
  async toggleUserStatus(id: string, isActive: boolean): Promise<User> {
    const res = await apiFetch(`${BASE_URL}/cms/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal memperbarui status akun.');
    }
    return data;
  },

  // Reset User Password by Super Admin
  async resetUserPassword(userId: string, newPassword: string, adminName?: string): Promise<{ success: boolean; temporaryPassword?: string; message: string }> {
    const res = await apiFetch(`${BASE_URL}/cms/users/${userId}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword, adminName })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal mereset kata sandi pengguna.');
    }
    return data;
  },

  // Change User Password by Super Admin (dedicated endpoint without touching other profile data)
  async changeUserPassword(userId: string, newPassword: string, adminName?: string): Promise<{ success: boolean; temporaryPassword?: string; message: string }> {
    const res = await apiFetch(`${BASE_URL}/cms/users/${userId}/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword, adminName })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal memperbarui kata sandi pengguna.');
    }
    return data;
  },

  // Upload Bukti Pembayaran Daftar Ulang (Public Check Status)
  async uploadPaymentProof(payload: {
    registrationNumber: string;
    birthDate?: string;
    sessionToken?: string;
    method: string;
    paymentDate: string;
    amount: number;
    senderName: string;
    dataUrl: string;
    fileName: string;
  }): Promise<{ success: boolean; message: string; paymentProof: PaymentProof }> {
    const res = await apiFetch(`${BASE_URL}/spmb/upload-payment-proof`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal mengunggah bukti pembayaran.');
    }
    return data;
  },

  // Verify Payment Proof by Admin
  async verifyPaymentProof(registrationId: string, payload: {
    status: 'Disetujui' | 'Ditolak' | 'Perlu Upload Ulang';
    adminNotes?: string;
    verifierName: string;
    verifierRole: string;
  }): Promise<{ success: boolean; message: string; registration: Registration }> {
    const res = await apiFetch(`${BASE_URL}/spmb/registrations/${registrationId}/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal memverifikasi bukti pembayaran.');
    }
    return data;
  },

  // SPMB Stage Management (Tier 1: General Stages)
  async getSpmbStages(): Promise<SpmbStageDefinition[]> {
    try {
      const res = await apiFetch(`${BASE_URL}/spmb/stages`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('API getSpmbStages failed:', err);
    }
    return INITIAL_SPMB_STAGES;
  },

  async updateSpmbStages(stages: SpmbStageDefinition[], updatedBy?: string): Promise<SpmbStageDefinition[]> {
    const res = await apiFetch(`${BASE_URL}/spmb/stages`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stages, updatedBy })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal menyimpan pengaturan tahapan SPMB.');
    }
    return data;
  },

  async getDraftSpmbStages(): Promise<{ stages: SpmbStageDefinition[]; flowSettings: any }> {
    const res = await apiFetch(`${BASE_URL}/spmb/stages/draft`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal memuat draf alur SPMB.');
    return data;
  },

  async saveDraftSpmbStages(stages: SpmbStageDefinition[], updatedBy?: string): Promise<{ success: boolean; stages: SpmbStageDefinition[]; flowSettings: any }> {
    const res = await apiFetch(`${BASE_URL}/spmb/stages/draft`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stages, updatedBy })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal menyimpan draf tahapan SPMB.');
    return data;
  },

  async publishSpmbStages(stages?: SpmbStageDefinition[], updatedBy?: string): Promise<{ success: boolean; message: string; stages: SpmbStageDefinition[]; flowSettings: any }> {
    const res = await apiFetch(`${BASE_URL}/spmb/stages/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stages, updatedBy })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal mempublikasikan alur tahapan SPMB.');
    return data;
  },

  async revertDraftSpmbStages(): Promise<{ success: boolean; stages: SpmbStageDefinition[]; flowSettings: any }> {
    const res = await apiFetch(`${BASE_URL}/spmb/stages/revert-draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal membatalkan draf alur SPMB.');
    return data;
  },

  async createSpmbStage(stage: Partial<SpmbStageDefinition>, isDraft = true, updatedBy?: string): Promise<SpmbStageDefinition> {
    const res = await apiFetch(`${BASE_URL}/spmb/stages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage, isDraft, updatedBy })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal menambah tahapan baru.');
    return data;
  },

  async deleteSpmbStage(stageId: string, isDraft = true, updatedBy?: string): Promise<{ success: boolean; message: string }> {
    const res = await apiFetch(`${BASE_URL}/spmb/stages/${stageId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDraft, updatedBy })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal menghapus tahapan.');
    return data;
  },

  async updateSpmbStage(stageId: string, stage: Partial<SpmbStageDefinition>, updatedBy?: string, isDraft = true): Promise<SpmbStageDefinition> {
    const res = await apiFetch(`${BASE_URL}/spmb/stages/${stageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...stage, updatedBy, isDraft })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal memperbarui detail tahapan SPMB.');
    }
    return data;
  },

  async toggleGlobalStage(stageId: string, isCompleted?: boolean, updatedBy?: string): Promise<SpmbStageDefinition> {
    const res = await apiFetch(`${BASE_URL}/spmb/stages/${stageId}/toggle-global`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCompleted, updatedBy })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal mengubah status checklist tahapan.');
    }
    return data;
  },

  // Waves Management (Gelombang 1 & 2)
  async getSpmbWaves(): Promise<SpmbWave[]> {
    const res = await apiFetch(`${BASE_URL}/spmb/waves`);
    return await res.json();
  },

  async updateSpmbWave(id: string, waveData: Partial<SpmbWave>): Promise<SpmbWave> {
    const res = await apiFetch(`${BASE_URL}/spmb/waves/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(waveData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal memperbarui gelombang SPMB.');
    return data;
  },

  // WhatsApp Admin Settings (Observasi & Pembayaran)
  async getAdminWhatsAppSettings(): Promise<AdminWhatsAppSettings> {
    const res = await apiFetch(`${BASE_URL}/settings/whatsapp-admin`);
    return await res.json();
  },

  async updateAdminWhatsAppSettings(payload: Partial<AdminWhatsAppSettings>): Promise<AdminWhatsAppSettings> {
    const res = await apiFetch(`${BASE_URL}/settings/whatsapp-admin`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal menyimpan pengaturan WhatsApp Admin.');
    return data;
  },

  // Re-Registration Final Approval (Admin Sekolah only)
  async approveReRegistration(
    registrationId: string,
    payload: {
      approverRole: string;
      approverName: string;
      status: string;
      adminNotes?: string;
    }
  ): Promise<{ success: boolean; message: string; registration: Registration }> {
    const res = await apiFetch(`${BASE_URL}/spmb/registrations/${registrationId}/reregistration-approval`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal memproses persetujuan daftar ulang.');
    return data;
  },

  // SPMB Stage Management (Tier 2: Individual Applicant Stages)
  async updateApplicantStages(
    registrationId: string,
    payload: {
      stages?: ApplicantStageProgress[];
      stageId?: string;
      status?: string;
      notes?: string;
      updatedBy?: string;
    }
  ): Promise<{ success: boolean; registration: Registration }> {
    const res = await apiFetch(`${BASE_URL}/spmb/registrations/${registrationId}/stages`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal memperbarui checklist tahapan calon siswa.');
    }
    return data;
  },

  // Media Library
  async getMedia(): Promise<MediaItem[]> {
    const res = await apiFetch(`${BASE_URL}/media`);
    return await res.json();
  },
  async uploadMedia(payload: {
    fileName: string;
    dataUrl: string;
    title: string;
    description?: string;
    category?: string;
    activityDate?: string;
    isThumbnail?: boolean;
    order?: number;
    isPublished?: boolean;
    usageLocation?: string;
    uploadedBy?: string;
  }): Promise<MediaItem> {
    const res = await apiFetch(`${BASE_URL}/media/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal mengunggah foto.');
    }
    return data;
  },
  async updateMedia(id: string, payload: Partial<MediaItem>): Promise<MediaItem> {
    const res = await apiFetch(`${BASE_URL}/media/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },
  async deleteMedia(id: string, force = false): Promise<{ success: boolean; message?: string; inUse?: boolean; usageLocations?: string[] }> {
    const res = await apiFetch(`${BASE_URL}/media/${id}?force=${force ? 'true' : 'false'}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) {
      const err: any = new Error(data.error || 'Gagal menghapus foto.');
      err.inUse = data.inUse;
      err.usageLocations = data.usageLocations;
      throw err;
    }
    return data;
  },

  // CMS: Branding
  async getBranding(): Promise<SchoolBranding> {
    const res = await apiFetch(`${BASE_URL}/cms/branding`);
    return await res.json();
  },
  async updateBranding(branding: Partial<SchoolBranding>): Promise<SchoolBranding> {
    const res = await apiFetch(`${BASE_URL}/cms/branding`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(branding)
    });
    return await res.json();
  },

  // CMS: Reset Demo Data
  async resetDemoData(): Promise<void> {
    await apiFetch(`${BASE_URL}/cms/reset-demo`, { method: 'POST' });
  },

  // Google Sheet & Apps Script Integration
  async getGoogleSheetSettings(): Promise<GoogleSheetSettings> {
    const res = await apiFetch(`${BASE_URL}/settings/google-sheet`);
    return await res.json();
  },

  async updateGoogleSheetSettings(payload: Partial<GoogleSheetSettings>): Promise<GoogleSheetSettings> {
    const res = await apiFetch(`${BASE_URL}/settings/google-sheet`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async getGoogleSheetScriptCode(): Promise<{ spreadsheetId: string; spreadsheetUrl: string; sheetName: string; scriptCode: string }> {
    const spreadsheetId = '1_zt6amQtAr3eGjSPqwaJrIT_irLZvICla9j5lOX2kEM';
    const res = await window.fetch('/Code.gs');
    if (!res.ok) throw new Error('File Code.gs tidak tersedia pada website.');
    return {
      spreadsheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
      sheetName: 'DATA_PENDAFTAR_SPMB',
      scriptCode: await res.text()
    };
  },

  async syncAllToGoogleSheet(): Promise<{ success: boolean; count: number; message: string }> {
    const res = await apiFetch(`${BASE_URL}/spmb/sync-google-sheet`, {
      method: 'POST'
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal menyinkronkan data ke Google Sheet.');
    }
    return data;
  }
};
