/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AdminWhatsAppSettings, User } from '../../../types';
import { api } from '../../../lib/api';
import {
  MessageCircle,
  Save,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  CreditCard,
  UserCheck,
  Sparkles,
  Info,
  ExternalLink,
  RotateCcw
} from 'lucide-react';

interface AdminWhatsAppSettingsModuleProps {
  currentUser: User | null;
}

export const AdminWhatsAppSettingsModule: React.FC<AdminWhatsAppSettingsModuleProps> = ({ currentUser }) => {
  const [settings, setSettings] = useState<AdminWhatsAppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sample data for preview
  const sampleStudent = {
    nama_siswa: 'M. Fatih Al-Habsyi',
    nomor_pendaftaran: 'SPMB-2027-001'
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminWhatsAppSettings();
      setSettings({
        ...data,
        phoneNumber: data.phoneNumber || data.adminPhone || '',
        adminPhone: data.adminPhone || data.phoneNumber || '',
        observasiTemplate: data.observasiTemplate || data.observationMessageTemplate || '',
        observationMessageTemplate: data.observationMessageTemplate || data.observasiTemplate || '',
        daftarUlangTemplate: data.daftarUlangTemplate || data.paymentMessageTemplate || '',
        paymentMessageTemplate: data.paymentMessageTemplate || data.daftarUlangTemplate || '',
        enableObservasiButton: data.enableObservasiButton ?? data.enableObservationButton ?? true,
        enableObservationButton: data.enableObservationButton ?? data.enableObservasiButton ?? true,
        enableDaftarUlangButton: data.enableDaftarUlangButton ?? data.enablePaymentButton ?? true,
        enablePaymentButton: data.enablePaymentButton ?? data.enableDaftarUlangButton ?? true
      });
    } catch (err: any) {
      console.error(err);
      setNotification({ type: 'error', message: err.message || 'Gagal memuat pengaturan WhatsApp Admin.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    // Validate phone number format
    const rawPhone = settings.phoneNumber || settings.adminPhone || '';
    let cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }
    if (!cleanPhone.startsWith('62')) {
      setNotification({ type: 'error', message: 'Nomor WhatsApp harus berformat Indonesia diawali 628 (contoh: 6281234567890).' });
      return;
    }

    try {
      setSaving(true);
      setNotification(null);
      const updated = await api.updateAdminWhatsAppSettings({
        ...settings,
        adminPhone: cleanPhone,
        phoneNumber: cleanPhone,
        observationMessageTemplate: settings.observasiTemplate || settings.observationMessageTemplate || '',
        observasiTemplate: settings.observasiTemplate || settings.observationMessageTemplate || '',
        paymentMessageTemplate: settings.daftarUlangTemplate || settings.paymentMessageTemplate || '',
        daftarUlangTemplate: settings.daftarUlangTemplate || settings.paymentMessageTemplate || '',
        enableObservationButton: settings.enableObservasiButton ?? settings.enableObservationButton ?? true,
        enableObservasiButton: settings.enableObservasiButton ?? settings.enableObservationButton ?? true,
        enablePaymentButton: settings.enableDaftarUlangButton ?? settings.enablePaymentButton ?? true,
        enableDaftarUlangButton: settings.enableDaftarUlangButton ?? settings.enablePaymentButton ?? true,
        updatedBy: currentUser?.name || 'Super Admin'
      });
      setSettings(updated);
      setNotification({
        type: 'success',
        message: 'Pengaturan WhatsApp Admin berhasil disimpan dan aktif di halaman Cek Status!'
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal menyimpan pengaturan WhatsApp Admin.' });
    } finally {
      setSaving(false);
    }
  };

  // Preview message generator
  const getPreviewMessage = (template: string) => {
    return template
      .replace(/{{nama_siswa}}/g, sampleStudent.nama_siswa)
      .replace(/{{nomor_pendaftaran}}/g, sampleStudent.nomor_pendaftaran);
  };

  if (loading || !settings) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-xs text-stone-500">
        Memuat pengaturan WhatsApp Admin...
      </div>
    );
  }

  const observasiPreview = getPreviewMessage(settings.observasiTemplate || settings.observationMessageTemplate || '');
  const daftarUlangPreview = getPreviewMessage(settings.daftarUlangTemplate || settings.paymentMessageTemplate || '');

  return (
    <form onSubmit={handleSave} className="space-y-6 text-xs text-stone-800">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase text-[#D5AA53] tracking-wider block">
            Layanan Komunikasi Wali Murid
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mt-0.5 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-[#123B35]" />
            <span>Pengaturan WhatsApp Admin (Observasi & Daftar Ulang)</span>
          </h2>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
            Atur nomor WhatsApp resmi panitia dan pesan otomatis yang akan dikirim oleh orang tua saat menanyakan informasi observasi maupun pembayaran daftar ulang di halaman Cek Status.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#123B35] hover:bg-[#1a544b] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4 text-[#D5AA53]" />
          <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
        </button>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-700 shrink-0" />
          )}
          <span className="font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Main Form Block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Number and Toggles */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#123B35] border-b border-stone-100 pb-2 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#D5AA53]" />
              <span>Nomor Kontak WhatsApp Admin</span>
            </h3>

            <div>
              <label className="block font-bold text-stone-800 mb-1">
                Nomor WhatsApp Panitia / Admin SPMB:
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Contoh: 6285231234567"
                  value={settings.phoneNumber}
                  onChange={e => setSettings({ ...settings, phoneNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-mono font-bold text-stone-900 focus:ring-2 focus:ring-[#123B35]"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                Gunakan kode negara <strong>62</strong> di awal tanpa tanda plus (+) atau spasi. Contoh: 6285231234567.
              </p>
            </div>

            {/* Variable tags guide */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-950 space-y-1">
              <span className="font-bold block">Variabel Otomatis yang Didukung:</span>
              <p>
                Gunakan tag <code className="font-mono bg-white px-1 py-0.5 rounded border border-amber-300">{'{{nama_siswa}}'}</code> untuk menyisipkan nama lengkap calon murid, dan <code className="font-mono bg-white px-1 py-0.5 rounded border border-amber-300">{'{{nomor_pendaftaran}}'}</code> untuk nomor registrasi resmi.
              </p>
            </div>
          </div>

          {/* Section 1: Observasi */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-purple-600" />
                <span>1. Tombol & Pesan Informasi Observasi</span>
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableObservasiButton}
                  onChange={e => setSettings({ ...settings, enableObservasiButton: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-purple-600 cursor-pointer"
                />
                <span className="font-bold text-xs text-purple-900">Aktif</span>
              </label>
            </div>

            <div>
              <label className="block font-bold text-stone-800 mb-1">
                Template Pesan WhatsApp Observasi:
              </label>
              <textarea
                rows={3}
                required
                value={settings.observasiTemplate}
                onChange={e => setSettings({ ...settings, observasiTemplate: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-medium"
              />
            </div>
          </div>

          {/* Section 2: Daftar Ulang */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-teal-600" />
                <span>2. Tombol & Pesan Pembayaran Daftar Ulang</span>
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableDaftarUlangButton}
                  onChange={e => setSettings({ ...settings, enableDaftarUlangButton: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-600 cursor-pointer"
                />
                <span className="font-bold text-xs text-teal-900">Aktif</span>
              </label>
            </div>

            <div>
              <label className="block font-bold text-stone-800 mb-1">
                Template Pesan WhatsApp Daftar Ulang:
              </label>
              <textarea
                rows={3}
                required
                value={settings.daftarUlangTemplate}
                onChange={e => setSettings({ ...settings, daftarUlangTemplate: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-medium"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Chat Simulation Preview */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#123B35] border-b border-stone-100 pb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D5AA53]" />
              <span>Simulasi Tampilan Pesan WhatsApp (Real-time Preview)</span>
            </h3>

            {/* Simulation 1: Observasi */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-800 text-[11px] uppercase tracking-wide">
                  Pratinjau Pesan Observasi:
                </span>
                <span className="text-[10px] text-stone-500">
                  Target Nomor: +{settings.phoneNumber}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#EFEAE2] border border-[#d1d7db] space-y-2">
                <div className="max-w-[90%] ml-auto bg-[#D9FDD3] text-[#111B21] p-3 rounded-2xl rounded-tr-xs shadow-xs text-xs leading-relaxed">
                  <p>{observasiPreview}</p>
                  <span className="text-[9px] text-[#667781] text-right block mt-1">10:45 ✓✓</span>
                </div>
              </div>

              <div className="text-right">
                <a
                  href={`https://wa.me/${settings.phoneNumber}?text=${encodeURIComponent(observasiPreview)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#123B35] hover:underline"
                >
                  <span>Uji Coba Kirim Link WhatsApp Observasi</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Simulation 2: Daftar Ulang */}
            <div className="space-y-2 pt-4 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-800 text-[11px] uppercase tracking-wide">
                  Pratinjau Pesan Daftar Ulang:
                </span>
                <span className="text-[10px] text-stone-500">
                  Target Nomor: +{settings.phoneNumber}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#EFEAE2] border border-[#d1d7db] space-y-2">
                <div className="max-w-[90%] ml-auto bg-[#D9FDD3] text-[#111B21] p-3 rounded-2xl rounded-tr-xs shadow-xs text-xs leading-relaxed">
                  <p>{daftarUlangPreview}</p>
                  <span className="text-[9px] text-[#667781] text-right block mt-1">11:15 ✓✓</span>
                </div>
              </div>

              <div className="text-right">
                <a
                  href={`https://wa.me/${settings.phoneNumber}?text=${encodeURIComponent(daftarUlangPreview)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:underline"
                >
                  <span>Uji Coba Kirim Link WhatsApp Daftar Ulang</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
