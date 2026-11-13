/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Palette,
  Sparkles,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Eye,
  Sliders,
  Type,
  Layers,
  Save,
  Globe,
  Upload,
  Info
} from 'lucide-react';
import { SchoolBranding, SchoolProfile } from '../../../types';
import { api } from '../../../lib/api';
import { ImageUploadPicker } from '../../common/ImageUploadPicker';

interface BrandingSettingsProps {
  onBrandingUpdated?: (newBranding: SchoolBranding) => void;
}

export const BrandingSettings: React.FC<BrandingSettingsProps> = ({ onBrandingUpdated }) => {
  const [branding, setBranding] = useState<SchoolBranding>({
    mainLogoUrl: '',
    faviconUrl: '',
    navbarLogoUrl: '',
    footerLogoUrl: '',
    loginLogoUrl: '',
    receiptLogoUrl: '',
    heroBannerUrl: '',
    spmbBannerUrl: '',
    logoScale: 100,
    showSchoolNameNextToLogo: true,
    updatedAt: new Date().toISOString()
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Image Picker Control
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<keyof SchoolBranding>('mainLogoUrl');
  const [pickerTitle, setPickerTitle] = useState('Pilih Foto Logo');

  useEffect(() => {
    loadBranding();
  }, []);

  const loadBranding = async () => {
    setLoading(true);
    try {
      const data = await api.getBranding();
      if (data && typeof data === 'object') {
        setBranding(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error('Failed to load branding:', err);
    } finally {
      setLoading(false);
    }
  };

  const openPickerFor = (target: keyof SchoolBranding, title: string) => {
    setPickerTarget(target);
    setPickerTitle(title);
    setPickerOpen(true);
  };

  const handlePickerSelect = (imageUrl: string) => {
    setBranding(prev => ({
      ...prev,
      [pickerTarget]: imageUrl
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateBranding(branding);
      setBranding(updated);
      if (onBrandingUpdated) {
        onBrandingUpdated(updated);
      }
      setSuccessToast('Pengaturan identitas & logo sekolah berhasil disimpan!');
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      alert('Gagal menyimpan branding: ' + err);
    } finally {
      setSaving(false);
    }
  };

  const defaultSchoolCrest = (
    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#123B35] to-[#174C80] border-2 border-[#D5AA53] flex items-center justify-center text-[#D5AA53] font-bold text-xs shadow-inner">
      SDIT
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#123B35] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-emerald-400 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-[#D5AA53]" />
          <span className="text-sm font-semibold">{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#123B35] uppercase tracking-wider mb-1">
            <Palette className="w-4 h-4 text-[#D5AA53]" />
            Identitas Visual & Branding Terpadu
          </div>
          <h2 className="text-2xl font-extrabold text-[#123B35]">Identitas & Branding Sekolah</h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Pusat konfigurasi logo, favicon, banner beranda, dan banner SPMB. Perubahan di sini otomatis berlaku di seluruh website publik dan dashboard.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-[#123B35] hover:bg-[#0e2f2a] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-60"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-[#D5AA53]" />
              Simpan Pengaturan Branding
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Logo Utama & Skala Tampilan */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D5AA53]" />
                Logo Utama Sekolah
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Logo resmi SDIT Insan Cendikia Kalibaru yang digunakan sebagai identitas utama.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Logo Preview Box */}
            <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center space-y-3">
              <span className="text-xs font-semibold text-gray-500">Pratinjau Logo Utama</span>
              <div
                className="transition-transform duration-200 flex items-center justify-center"
                style={{ transform: `scale(${(branding.logoScale || 100) / 100})` }}
              >
                {branding.mainLogoUrl ? (
                  <img
                    src={branding.mainLogoUrl}
                    alt="Logo Utama Sekolah"
                    className="max-h-24 max-w-44 object-contain shadow-xs"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    {defaultSchoolCrest}
                    <span className="text-[11px] text-gray-400 italic">Logo default aktif</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => openPickerFor('mainLogoUrl', 'Pilih Logo Utama Sekolah')}
                  className="px-3.5 py-1.5 bg-[#123B35] text-white rounded-lg text-xs font-semibold hover:bg-[#0e2f2a] flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {branding.mainLogoUrl ? 'Ganti Logo' : 'Pilih / Unggah Logo'}
                </button>
                {branding.mainLogoUrl && (
                  <button
                    type="button"
                    onClick={() => setBranding(prev => ({ ...prev, mainLogoUrl: '' }))}
                    className="px-3 py-1.5 border border-gray-300 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50"
                  >
                    Reset ke Default
                  </button>
                )}
              </div>
            </div>

            {/* Controls for Scale and Text Display */}
            <div className="lg:col-span-2 space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-[#123B35]" />
                    Skala Ukuran Logo: <span className="text-[#123B35] font-extrabold">{branding.logoScale || 100}%</span>
                  </label>
                  <span className="text-[11px] text-gray-400">Rentang 60% s/d 140%</span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={140}
                  step={5}
                  value={branding.logoScale || 100}
                  onChange={(e) => setBranding(prev => ({ ...prev, logoScale: Number(e.target.value) }))}
                  className="w-full accent-[#123B35] cursor-pointer"
                />
              </div>

              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="showNameCheck"
                  checked={branding.showSchoolNameNextToLogo !== false}
                  onChange={(e) => setBranding(prev => ({ ...prev, showSchoolNameNextToLogo: e.target.checked }))}
                  className="mt-1 rounded text-[#123B35] focus:ring-[#123B35]"
                />
                <label htmlFor="showNameCheck" className="cursor-pointer text-xs sm:text-sm text-gray-700">
                  <strong className="text-gray-900 block font-semibold">Tampilkan Nama Sekolah di Samping Logo</strong>
                  Tampilkan tulisan <span className="font-semibold text-[#123B35]">SDIT Insan Cendikia Kalibaru</span> di samping logo pada header navigasi.
                </label>
              </div>

              {/* Favicon Setting */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-gray-300 flex items-center justify-center overflow-hidden shrink-0">
                    {branding.faviconUrl ? (
                      <img src={branding.faviconUrl} alt="Favicon" className="w-6 h-6 object-contain" />
                    ) : (
                      <Globe className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-gray-900">Favicon Website (Browser Tab)</h5>
                    <p className="text-[11px] text-gray-500">Ikon kecil yang muncul di tab browser pengguna (32x32 atau 64x64).</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openPickerFor('faviconUrl', 'Pilih Favicon Website')}
                  className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700"
                >
                  {branding.faviconUrl ? 'Ganti Favicon' : 'Pilih Favicon'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Logo Khusus Bagian Tertentu (Navbar, Footer, Login, Bukti Cetak) */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#123B35]" />
              Logo Khusus Per Bagian (Opsional)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Jika dikosongkan, bagian-bagian ini akan otomatis menggunakan <strong>Logo Utama</strong> di atas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {/* Navbar Logo */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-bold text-gray-800 block">Header / Navbar Logo</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Tampilan atas website publik</span>
              </div>
              <div className="h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-2">
                {branding.navbarLogoUrl || branding.mainLogoUrl ? (
                  <img src={branding.navbarLogoUrl || branding.mainLogoUrl} alt="Navbar Logo" className="max-h-12 object-contain" />
                ) : (
                  <span className="text-[10px] text-gray-400">Logo Utama</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => openPickerFor('navbarLogoUrl', 'Pilih Logo Header / Navbar')}
                className="w-full py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold"
              >
                {branding.navbarLogoUrl ? 'Ganti' : 'Pilih Khusus'}
              </button>
            </div>

            {/* Footer Logo */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-bold text-gray-800 block">Footer Logo</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Tampilan bawah website publik</span>
              </div>
              <div className="h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-2">
                {branding.footerLogoUrl || branding.mainLogoUrl ? (
                  <img src={branding.footerLogoUrl || branding.mainLogoUrl} alt="Footer Logo" className="max-h-12 object-contain" />
                ) : (
                  <span className="text-[10px] text-gray-400">Logo Utama</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => openPickerFor('footerLogoUrl', 'Pilih Logo Footer')}
                className="w-full py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold"
              >
                {branding.footerLogoUrl ? 'Ganti' : 'Pilih Khusus'}
              </button>
            </div>

            {/* Login Modal Logo */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-bold text-gray-800 block">Logo Modal Login</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Tampilan dialog masuk akun</span>
              </div>
              <div className="h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-2">
                {branding.loginLogoUrl || branding.mainLogoUrl ? (
                  <img src={branding.loginLogoUrl || branding.mainLogoUrl} alt="Login Logo" className="max-h-12 object-contain" />
                ) : (
                  <span className="text-[10px] text-gray-400">Logo Utama</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => openPickerFor('loginLogoUrl', 'Pilih Logo Modal Login')}
                className="w-full py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold"
              >
                {branding.loginLogoUrl ? 'Ganti' : 'Pilih Khusus'}
              </button>
            </div>

            {/* Receipt / Print Logo */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-bold text-gray-800 block">Logo Cetak Bukti</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Kop surat bukti pendaftaran</span>
              </div>
              <div className="h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-2">
                {branding.receiptLogoUrl || branding.mainLogoUrl ? (
                  <img src={branding.receiptLogoUrl || branding.mainLogoUrl} alt="Receipt Logo" className="max-h-12 object-contain" />
                ) : (
                  <span className="text-[10px] text-gray-400">Logo Utama</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => openPickerFor('receiptLogoUrl', 'Pilih Logo Cetak Bukti SPMB')}
                className="w-full py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold"
              >
                {branding.receiptLogoUrl ? 'Ganti' : 'Pilih Khusus'}
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Hero & SPMB Banner Backgrounds */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#D5AA53]" />
              Foto Banner Halaman Utama & SPMB
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Ganti foto gedung sekolah utama dan banner ajakan pendaftaran murid baru.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hero Banner */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-700 block">
                Foto Hero Banner Halaman Utama
              </label>
              <div className="relative aspect-16/9 rounded-xl overflow-hidden border border-gray-300 bg-gray-100 group">
                {branding.heroBannerUrl ? (
                  <img
                    src={branding.heroBannerUrl}
                    alt="Hero Banner"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-gray-400">
                    Foto Default Aktif
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => openPickerFor('heroBannerUrl', 'Pilih Foto Hero Banner')}
                    className="px-4 py-2 bg-white text-gray-900 rounded-lg text-xs font-bold shadow-md hover:bg-gray-100"
                  >
                    Ganti Foto Hero
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-gray-500">
                Tampil sebagai latar belakang utama di bagian atas Beranda.
              </p>
            </div>

            {/* SPMB Banner */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-700 block">
                Foto Banner SPMB Pendaftaran
              </label>
              <div className="relative aspect-16/9 rounded-xl overflow-hidden border border-gray-300 bg-gray-100 group">
                {branding.spmbBannerUrl ? (
                  <img
                    src={branding.spmbBannerUrl}
                    alt="SPMB Banner"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-gray-400">
                    Foto Default Aktif
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => openPickerFor('spmbBannerUrl', 'Pilih Foto Banner SPMB')}
                    className="px-4 py-2 bg-white text-gray-900 rounded-lg text-xs font-bold shadow-md hover:bg-gray-100"
                  >
                    Ganti Foto Banner SPMB
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-gray-500">
                Tampil pada section ajakan daftar murid baru dan informasi gelombang.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Bottom Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-[#123B35] hover:bg-[#0e2f2a] text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center gap-2"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Menyimpan Perubahan...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-[#D5AA53]" />
                Simpan & Terapkan Identitas Sekolah
              </>
            )}
          </button>
        </div>
      </form>

      {/* Reusable Image Picker Modal */}
      <ImageUploadPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handlePickerSelect}
        title={pickerTitle}
        currentImageUrl={String(branding[pickerTarget] || '')}
      />
    </div>
  );
};
