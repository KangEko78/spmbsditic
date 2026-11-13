/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WhatsAppGroupSettings, RegistrationStatus, User } from '../../../types';
import { api } from '../../../lib/api';
import { formatDateId } from '../../../lib/utils';
import {
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  History,
  ToggleLeft,
  ToggleRight,
  Save,
  Clock,
  Sparkles,
  Users
} from 'lucide-react';

interface WhatsAppGroupSettingsModuleProps {
  currentUser: User | null;
}

const AVAILABLE_STATUSES: RegistrationStatus[] = [
  'Terverifikasi',
  'Dalam Seleksi',
  'Diterima',
  'Menunggu Daftar Ulang',
  'Selesai Daftar Ulang'
];

export const WhatsAppGroupSettingsModule: React.FC<WhatsAppGroupSettingsModuleProps> = ({
  currentUser
}) => {
  const [settings, setSettings] = useState<WhatsAppGroupSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [groupName, setGroupName] = useState('Grup Resmi SPMB SDIT INSAN CENDIKIA KALIBARU');
  const [groupLink, setGroupLink] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [allowedStatuses, setAllowedStatuses] = useState<RegistrationStatus[]>([
    'Terverifikasi',
    'Dalam Seleksi',
    'Diterima',
    'Menunggu Daftar Ulang',
    'Selesai Daftar Ulang'
  ]);
  const [infoMessage, setInfoMessage] = useState(
    'Terima kasih telah mendaftar di SDIT INSAN CENDIKIA KALIBARU. Silakan bergabung dengan Grup WhatsApp Resmi SPMB untuk memperoleh informasi terbaru mengenai tahapan dan proses penerimaan siswa baru.'
  );

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getWhatsAppSettings();
      setSettings(data);
      setGroupName(data.groupName || 'Grup Resmi SPMB SDIT INSAN CENDIKIA KALIBARU');
      setGroupLink(data.groupLink || data.inviteLink || '');
      setIsActive(data.isActive ?? true);
      setAllowedStatuses(data.allowedStatuses || ['Terverifikasi']);
      setInfoMessage(
        data.infoMessage ||
          'Terima kasih telah mendaftar di SDIT INSAN CENDIKIA KALIBARU. Silakan bergabung dengan Grup WhatsApp Resmi SPMB untuk memperoleh informasi terbaru mengenai tahapan dan proses penerimaan siswa baru.'
      );
    } catch (err: any) {
      console.error(err);
      setFeedback({ type: 'error', message: err.message || 'Gagal memuat pengaturan grup WhatsApp.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleToggleStatus = (status: RegistrationStatus) => {
    if (allowedStatuses.includes(status)) {
      if (allowedStatuses.length === 1) {
        setFeedback({ type: 'error', message: 'Minimal harus memilih satu status pendaftar untuk Cek Status.' });
        return;
      }
      setAllowedStatuses(allowedStatuses.filter(s => s !== status));
    } else {
      setAllowedStatuses([...allowedStatuses, status]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Validate link if active
    const trimmed = groupLink.trim();
    if (isActive) {
      if (!trimmed) {
        setFeedback({
          type: 'error',
          message: 'Tautan grup WhatsApp wajib diisi jika fitur diaktifkan.'
        });
        return;
      }
      if (!trimmed.startsWith('https://chat.whatsapp.com/') && !trimmed.startsWith('https://wa.me/')) {
        setFeedback({
          type: 'error',
          message: 'Tautan harus berupa link undangan WhatsApp yang valid (contoh: https://chat.whatsapp.com/KodeGrup).'
        });
        return;
      }
    }

    try {
      setSaving(true);
      const updated = await api.updateWhatsAppSettings({
        groupName: groupName.trim() || 'Grup Resmi SPMB SDIT INSAN CENDIKIA KALIBARU',
        groupLink: trimmed,
        inviteLink: trimmed,
        isActive,
        allowedStatuses,
        infoMessage: infoMessage.trim(),
        updatedBy: currentUser?.name || 'Super Admin',
        notes: `Pembaruan link: ${trimmed}`
      });
      setSettings(updated);
      setFeedback({
        type: 'success',
        message: 'Pengaturan Grup WhatsApp SPMB berhasil disimpan ke database! Tombol gabung grup pada halaman Bukti Pendaftaran & Cek Status otomatis diperbarui.'
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Gagal menyimpan pengaturan.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-xs text-stone-500">
        Memuat data pengaturan WhatsApp SPMB...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-xs text-stone-800">
      {/* Title Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase text-[#D5AA53] tracking-wider">
            Pengaturan Khusus Super Admin
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mt-0.5 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-700" />
            <span>Pengaturan Grup WhatsApp SPMB</span>
          </h2>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
            Kelola tautan undangan resmi Grup WhatsApp yang muncul secara otomatis pada halaman <strong>Bukti Pendaftaran</strong> pendaftar baru serta halaman <strong>Cek Status Pendaftaran</strong>. Perubahan langsung tersimpan di database dan berlaku otomatis tanpa ubah kode program.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-2xs ${
            isActive ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-stone-100 text-stone-600 border border-stone-300'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-600 animate-pulse' : 'bg-stone-400'}`} />
            {isActive ? 'Tombol WhatsApp: AKTIF' : 'Tombol WhatsApp: NONAKTIF'}
          </span>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-700 shrink-0" />
            )}
            <span className="font-semibold">{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-stone-400 hover:text-stone-700 font-bold p-1 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: 7 cols */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs">
          <form onSubmit={handleSave} className="space-y-5">
            {/* Status Switch */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="pr-4">
                <span className="font-bold text-sm text-stone-900 block">Aktifkan Tombol Gabung Grup WhatsApp</span>
                <span className="text-[11px] text-stone-500 leading-relaxed block mt-0.5">
                  {isActive
                    ? 'Tombol GABUNG GRUP WHATSAPP SPMB akan tampil di akhir halaman Bukti Pendaftaran dan Cek Status.'
                    : 'Tombol gabung grup disembunyikan sepenuhnya dari formulir dan halaman publik.'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className="cursor-pointer focus:outline-hidden shrink-0"
                title={isActive ? 'Klik untuk menonaktifkan' : 'Klik untuk mengaktifkan'}
              >
                {isActive ? (
                  <ToggleRight className="w-10 h-10 text-emerald-700 hover:text-emerald-800 transition-colors" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-stone-400 hover:text-stone-500 transition-colors" />
                )}
              </button>
            </div>

            {/* Group Name */}
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                Nama Grup WhatsApp SPMB <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Grup Resmi SPMB SDIT INSAN CENDIKIA KALIBARU"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-semibold text-xs focus:ring-2 focus:ring-[#123B35] focus:outline-hidden text-stone-900"
              />
              <span className="text-[11px] text-stone-500 mt-1 block">
                Nama grup ini akan ditampilkan sebagai judul kartu ajakan bergabung.
              </span>
            </div>

            {/* Invite Link */}
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                Tautan Undangan Grup WhatsApp (Invite Link) <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  required={isActive}
                  placeholder="https://chat.whatsapp.com/KodeUndanganGrup"
                  value={groupLink}
                  onChange={e => setGroupLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-xs focus:ring-2 focus:ring-[#123B35] focus:outline-hidden text-emerald-950 font-bold pr-24"
                />
                {groupLink && (
                  <a
                    href={groupLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-2.5 top-2 px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <span>Uji Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <span className="text-[11px] text-stone-500 mt-1 block">
                Format resmi WhatsApp: <code className="bg-stone-100 px-1 py-0.5 rounded font-mono">https://chat.whatsapp.com/...</code>. Anda dapat mengganti tautan ini kapan saja dan perubahan akan langsung aktif.
              </span>
            </div>

            {/* Info Message Box */}
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                Keterangan / Pesan Ajakan Bergabung:
              </label>
              <textarea
                rows={3}
                value={infoMessage}
                onChange={e => setInfoMessage(e.target.value)}
                placeholder="Tuliskan keterangan ajakan bergabung ke grup WhatsApp..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#123B35] focus:outline-hidden leading-relaxed text-stone-900"
              />
              <span className="text-[11px] text-stone-500 mt-1 block">
                Pesan ini ditampilkan tepat di atas tombol "GABUNG GRUP WHATSAPP SPMB" pada halaman Bukti Pendaftaran.
              </span>
            </div>

            {/* Allowed Statuses (Multi-select for Cek Status) */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <label className="block font-bold text-stone-800">
                Pendaftar yang Berhak Melihat di Halaman "Cek Status":
              </label>
              <p className="text-[11px] text-stone-500">
                Pada halaman Bukti Pendaftaran (setelah submit awal), tombol WhatsApp otomatis tampil jika fitur aktif. Pada halaman Cek Status berkala, tombol hanya tampil pada status yang dicentang di bawah:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {AVAILABLE_STATUSES.map(st => {
                  const isChecked = allowedStatuses.includes(st);
                  return (
                    <label
                      key={st}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-emerald-50/70 border-emerald-600 text-emerald-950 font-bold'
                          : 'bg-white border-stone-200 text-stone-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleStatus(st)}
                        className="rounded border-stone-300 text-emerald-700 focus:ring-emerald-700"
                      />
                      <span>{st}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <span className="text-[11px] text-stone-500">
                Terakhir diubah: {settings?.updatedAt ? formatDateId(settings.updatedAt) : 'Belum pernah'}
              </span>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-[#123B35] hover:bg-[#1a544b] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
              >
                <Save className="w-4 h-4 text-[#D5AA53]" />
                <span>{saving ? 'Menyimpan Pengaturan...' : 'Simpan Pengaturan WhatsApp'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Preview & History: 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Preview Box: Bukti Pendaftaran */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D5AA53]" />
                Pratinjau di Halaman Bukti Pendaftaran
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                Alur Akhir Pendaftaran
              </span>
            </div>

            {isActive && groupLink ? (
              <div className="p-4 rounded-2xl bg-gradient-to-b from-[#F7F8F5] to-emerald-50/40 border-2 border-[#25D366]/40 space-y-3 text-center">
                <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center mx-auto shadow-xs">
                  <MessageSquare className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h5 className="font-bold text-stone-900 text-xs">
                    {groupName || 'Grup Resmi SPMB SDIT INSAN CENDIKIA KALIBARU'}
                  </h5>
                  <p className="text-[11px] text-stone-600 mt-1 leading-relaxed max-w-sm mx-auto">
                    {infoMessage || 'Terima kasih telah mendaftar di SDIT INSAN CENDIKIA KALIBARU. Silakan bergabung dengan Grup WhatsApp Resmi SPMB untuk memperoleh informasi terbaru mengenai tahapan dan proses penerimaan siswa baru.'}
                  </p>
                </div>

                <div className="pt-1">
                  <a
                    href={groupLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer min-h-[44px]"
                  >
                    <MessageSquare className="w-4 h-4 fill-current" />
                    <span>GABUNG GRUP WHATSAPP SPMB</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-[10px] text-stone-400">
                  Tautan aktif: <code className="font-mono text-[9px] text-stone-600">{groupLink}</code>
                </p>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 text-center text-stone-500 text-xs">
                Tombol WhatsApp <strong>Nonaktif</strong> atau link belum diisi. Tombol tidak akan muncul bagi orang tua/wali murid.
              </div>
            )}
          </div>

          {/* History Log */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
            <h4 className="font-bold text-stone-900 text-xs flex items-center gap-2 mb-3 pb-2 border-b border-stone-100">
              <History className="w-4 h-4 text-stone-500" />
              <span>Riwayat Perubahan Tautan WhatsApp</span>
            </h4>

            {settings?.history && settings.history.length > 0 ? (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {settings.history.slice(-6).reverse().map((h, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-[11px] space-y-1">
                    <div className="flex justify-between items-center text-stone-500">
                      <span className="font-semibold text-stone-800">{h.updatedBy || h.changedBy || 'Admin'}</span>
                      <span>{formatDateId(h.timestamp || h.changedAt || '')}</span>
                    </div>
                    <div className="font-mono text-[10px] text-stone-600 truncate">
                      {h.previousLink || '(awal)'} &rarr; {h.newLink || h.link}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-stone-500 text-center py-4">
                Belum ada riwayat perubahan.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
