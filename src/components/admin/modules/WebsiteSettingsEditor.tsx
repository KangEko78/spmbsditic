/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SchoolProfile, SystemSettings } from '../../../types';
import { Globe, Save, CheckCircle2 } from 'lucide-react';

interface WebsiteSettingsEditorProps {
  profile: SchoolProfile;
  settings: SystemSettings;
  onUpdateProfile: (p: Partial<SchoolProfile>) => Promise<void>;
  onUpdateSettings: (s: Partial<SystemSettings>) => Promise<void>;
}

export const WebsiteSettingsEditor: React.FC<WebsiteSettingsEditorProps> = ({
  profile,
  settings,
  onUpdateProfile,
  onUpdateSettings
}) => {
  const [tagline, setTagline] = useState(profile.tagline);
  const [phone, setPhone] = useState(profile.phone);
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp);
  const [email, setEmail] = useState(profile.email);
  const [isSpmbOpen, setIsSpmbOpen] = useState(settings.isSpmbOpen);
  const [showDemoNotice, setShowDemoNotice] = useState(settings.showDemoNotice);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateProfile({ tagline, phone, whatsapp, email });
      await onUpdateSettings({ isSpmbOpen, showDemoNotice });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 text-xs text-stone-800">
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase text-emerald-800 tracking-wider">
            Modul 16 · Pengaturan Tampilan Halaman Website
          </span>
          <h2 className="text-2xl font-bold text-stone-900 mt-0.5">
            Konfigurasi Beranda & Kontak Publik
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Ubah headline hero banner utama, hotline WhatsApp, tombol pendaftaran, dan notifikasi beranda.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#123B35] hover:bg-[#1a544b] text-white font-bold rounded-lg shadow-xs cursor-pointer"
        >
          <Save className="w-4 h-4 text-[#D5AA53]" />
          <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Pengaturan halaman berhasil diperbarui dan tampil langsung di website publik!</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#123B35] border-b border-stone-100 pb-2">
          Headline & Banner Utama
        </h3>

        <div>
          <label className="block font-medium mb-1">Headline Utama Hero Section:</label>
          <input
            type="text"
            value={tagline}
            onChange={e => setTagline(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-stone-300 font-bold text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-medium mb-1">Nomor Hotline Telepon:</label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-stone-300"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">WhatsApp Resmi SPMB:</label>
            <input
              type="text"
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-stone-300 font-mono"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Email Resmi Sekolah:</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-stone-300"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-stone-100 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isSpmbOpen}
              onChange={e => setIsSpmbOpen(e.target.checked)}
              className="w-4 h-4 rounded text-[#123B35] focus:ring-[#123B35]"
            />
            <span className="font-semibold text-stone-900">
              Buka Pendaftaran SPMB Online di Beranda (Tampilkan tombol "Daftar Sekarang")
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showDemoNotice}
              onChange={e => setShowDemoNotice(e.target.checked)}
              className="w-4 h-4 rounded text-[#123B35] focus:ring-[#123B35]"
            />
            <span className="font-semibold text-stone-900">
              Tampilkan label keterangan data contoh DEMO pada modul prestasi dan simulasi
            </span>
          </label>
        </div>
      </div>
    </form>
  );
};
