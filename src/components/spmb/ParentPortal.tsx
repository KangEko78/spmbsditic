/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Registration, SchoolProfile, User } from '../../types';
import { api } from '../../lib/api';
import { getStatusBadge, formatDateId } from '../../lib/utils';
import { RegistrationReceipt } from './RegistrationReceipt';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  ChevronRight,
  Upload,
  RefreshCw,
  PlusCircle,
  HelpCircle,
  Phone
} from 'lucide-react';

interface ParentPortalProps {
  currentUser: User | null;
  schoolProfile: SchoolProfile;
  onStartNewRegistration: () => void;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({
  currentUser,
  schoolProfile,
  onStartNewRegistration
}) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'revisi' | 'daftar_ulang'>('status');

  // Revision form state
  const [revisionNotes, setRevisionNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Re-registration form state
  const [uniformSize, setUniformSize] = useState<'S' | 'M' | 'L' | 'XL'>('M');
  const [reRegNotes, setReRegNotes] = useState('');
  const [receiptSuccess, setReceiptSuccess] = useState(false);

  const fetchParentData = async () => {
    setLoading(true);
    try {
      const all = await api.getRegistrations({ userId: currentUser?.id });
      // If none found for this specific userId, let's load registrations matching the user email or show all demo registrations for testing
      if (all.length > 0) {
        setRegistrations(all);
        setSelectedReg(all[0]);
      } else {
        const fallback = await api.getRegistrations();
        setRegistrations(fallback);
        setSelectedReg(fallback[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParentData();
  }, [currentUser]);

  // Submit revised documents/info
  const handleFixRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReg) return;
    setIsUpdating(true);
    try {
      const updated = await api.updateRegistration(selectedReg.id, {
        revisionNotes: `Wali murid mengunggah perbaikan: ${revisionNotes}`
      });
      setSelectedReg(updated);
      setRegistrations(prev => prev.map(r => r.id === updated.id ? updated : r));
      setActiveTab('status');
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Submit Re-registration
  const handleConfirmReRegistration = async () => {
    if (!selectedReg) return;
    setIsUpdating(true);
    try {
      const updated = await api.updateReRegistration(selectedReg.id, {
        isConfirmed: true,
        uniformSize,
        notes: reRegNotes || 'Wali murid telah mengonfirmasi ukuran seragam dan kesediaan daftar ulang.',
        operatorName: currentUser?.name || 'Wali Murid'
      });
      setSelectedReg(updated);
      setRegistrations(prev => prev.map(r => r.id === updated.id ? updated : r));
      setReceiptSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-800 mx-auto mb-2" />
        <p className="text-xs text-stone-600">Memuat data pendaftaran...</p>
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-stone-200 p-8 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-stone-900">Belum Ada Pendaftaran</h3>
        <p className="text-xs text-stone-600 mt-2 mb-6">
          Anda belum memiliki berkas pendaftaran calon murid di akun ini. Silakan mulai pendaftaran baru secara mudah.
        </p>
        <button
          onClick={onStartNewRegistration}
          className="w-full py-2.5 bg-[#123B35] hover:bg-[#1a544b] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
        >
          Mulai Formulir Pendaftaran Baru
        </button>
      </div>
    );
  }

  const badge = selectedReg ? getStatusBadge(selectedReg.status) : null;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Top Banner */}
      <div className="bg-[#123B35] text-white rounded-2xl p-6 sm:p-8 mb-6 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#D5AA53] uppercase tracking-wider mb-1">
              <span>Portal Wali Murid Resmi</span>
              <span>·</span>
              <span>SDIT Insan Cendikia Kalibaru</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Selamat Datang, {currentUser?.name || 'Bapak/Ibu Wali Murid'}
            </h2>
            <p className="text-xs text-stone-200 mt-1 max-w-xl">
              Pantau status verifikasi berkas, pengumuman hasil observasi, dan lakukan daftar ulang calon siswa ananda.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onStartNewRegistration}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#D5AA53] hover:bg-[#c49942] text-stone-900 text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Daftarkan Siswa Lain</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: List of Registrations */}
        <div className="lg:col-span-1 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 px-1">
            Daftar Calon Murid Anda ({registrations.length})
          </h4>

          {registrations.map(reg => {
            const b = getStatusBadge(reg.status);
            const isSelected = selectedReg?.id === reg.id;
            return (
              <div
                key={reg.id}
                onClick={() => setSelectedReg(reg)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-[#123B35] shadow-sm ring-1 ring-[#123B35]'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-bold text-[#123B35]">
                    {reg.registrationNumber}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${b.bg} ${b.text}`}>
                    {reg.status}
                  </span>
                </div>
                <h5 className="text-sm font-bold text-stone-900">
                  {reg.student.fullName}
                </h5>
                <p className="text-xs text-stone-500 mt-0.5">
                  Lahir: {formatDateId(reg.student.birthDate)} ({reg.student.gender})
                </p>
              </div>
            );
          })}

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-stone-700">
            <h5 className="font-bold flex items-center gap-1.5 text-stone-900 mb-1">
              <Phone className="w-4 h-4 text-emerald-800" />
              <span>Bantuan Panitia SPMB</span>
            </h5>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Ada pertanyaan seputar syarat atau jadwal observasi? Hubungi panitia via WhatsApp: <strong>{schoolProfile.whatsapp}</strong>
            </p>
          </div>
        </div>

        {/* Right Col: Detail Card of Selected Registration */}
        {selectedReg && (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            {/* Header with Status Banner */}
            <div className="p-6 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F7F8F5]">
              <div>
                <span className="font-mono text-xs font-black text-[#123B35]">
                  {selectedReg.registrationNumber}
                </span>
                <h3 className="text-xl font-bold text-stone-900 mt-0.5">
                  {selectedReg.student.fullName}
                </h3>
                <p className="text-xs text-stone-500">
                  Diajukan pada {formatDateId(selectedReg.submittedAt)} · Gelombang 1 TA 2027/2028
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowReceiptModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-stone-300 hover:border-stone-400 text-stone-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Cetak Bukti</span>
                </button>
              </div>
            </div>

            {/* Current Status Box */}
            <div className="p-6 border-b border-stone-100">
              <div className={`p-4 rounded-xl border ${badge?.bg} ${badge?.border}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-600">Status Terkini:</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md bg-white border border-stone-200 ${badge?.text}`}>
                    {selectedReg.status}
                  </span>
                </div>

                {/* Status-specific banners */}
                {selectedReg.status === 'Perlu Perbaikan' && (
                  <div className="mt-3 pt-3 border-t border-rose-200 text-xs text-rose-900">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Catatan Revisi dari Panitia:</span>
                    </p>
                    <p className="mt-1 bg-white p-2.5 rounded-lg border border-rose-200 font-medium">
                      {selectedReg.revisionNotes || 'Mohon periksa kembali kelengkapan dokumen sesuai persyaratan.'}
                    </p>
                    <button
                      onClick={() => setActiveTab('revisi')}
                      className="mt-3 px-4 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-semibold rounded-lg text-xs"
                    >
                      Unggah Perbaikan Sekarang
                    </button>
                  </div>
                )}

                {selectedReg.status === 'Diterima' && (
                  <div className="mt-3 pt-3 border-t border-emerald-200 text-xs text-emerald-900">
                    <p className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Alhamdulillah, Ananda Dinyatakan LULUS SELEKSI!</span>
                    </p>
                    <p className="mt-1 text-emerald-800">
                      Selamat, ananda resmi diterima di SDIT Insan Cendikia Kalibaru. Silakan lengkapi konfirmasi daftar ulang dan pemilihan ukuran seragam di bawah ini.
                    </p>
                    <button
                      onClick={() => setActiveTab('daftar_ulang')}
                      className="mt-3 px-4 py-1.5 bg-[#123B35] hover:bg-[#1a544b] text-white font-semibold rounded-lg text-xs"
                    >
                      Proses Daftar Ulang
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-stone-200 px-6 text-xs font-semibold text-stone-600">
              <button
                onClick={() => setActiveTab('status')}
                className={`py-3 mr-6 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'status'
                    ? 'border-[#123B35] text-[#123B35]'
                    : 'border-transparent hover:text-stone-900'
                }`}
              >
                Riwayat & Alur
              </button>
              {selectedReg.status === 'Perlu Perbaikan' && (
                <button
                  onClick={() => setActiveTab('revisi')}
                  className={`py-3 mr-6 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'revisi'
                      ? 'border-rose-600 text-rose-700'
                      : 'border-transparent text-rose-600 hover:text-rose-800'
                  }`}
                >
                  Form Perbaikan Berkas
                </button>
              )}
              {selectedReg.status === 'Diterima' && (
                <button
                  onClick={() => setActiveTab('daftar_ulang')}
                  className={`py-3 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'daftar_ulang'
                      ? 'border-teal-700 text-teal-800'
                      : 'border-transparent text-teal-700 hover:text-teal-900'
                  }`}
                >
                  Konfirmasi Daftar Ulang
                </button>
              )}
            </div>

            {/* Tab 1: Status & Verification Logs */}
            {activeTab === 'status' && (
              <div className="p-6 space-y-6 text-xs">
                {/* Timeline Progress */}
                <div>
                  <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] mb-3">
                    Progres Tahapan Pendaftaran
                  </h4>
                  <div className="space-y-4 border-l-2 border-stone-200 pl-4 ml-2">
                    <div className="relative">
                      <div className="absolute -left-[23px] top-0 w-3.5 h-3.5 rounded-full bg-emerald-600"></div>
                      <h5 className="font-bold text-stone-900">1. Pengisian Formulir & Berkas</h5>
                      <p className="text-stone-500 text-[11px]">Terkirim pada {formatDateId(selectedReg.submittedAt)}</p>
                    </div>

                    <div className="relative">
                      <div className={`absolute -left-[23px] top-0 w-3.5 h-3.5 rounded-full ${
                        ['Terverifikasi', 'Dalam Seleksi', 'Diterima', 'Daftar Ulang'].includes(selectedReg.status)
                          ? 'bg-emerald-600'
                          : selectedReg.status === 'Perlu Perbaikan'
                          ? 'bg-rose-500'
                          : 'bg-amber-400'
                      }`}></div>
                      <h5 className="font-bold text-stone-900">2. Verifikasi Dokumen Kependudukan</h5>
                      <p className="text-stone-500 text-[11px]">
                        Status berkas: {selectedReg.status}
                      </p>
                    </div>

                    <div className="relative">
                      <div className={`absolute -left-[23px] top-0 w-3.5 h-3.5 rounded-full ${
                        ['Diterima', 'Daftar Ulang'].includes(selectedReg.status)
                          ? 'bg-emerald-600'
                          : selectedReg.status === 'Dalam Seleksi'
                          ? 'bg-indigo-500'
                          : 'bg-stone-300'
                      }`}></div>
                      <h5 className="font-bold text-stone-900">3. Observasi Siswa & Wawancara Wali</h5>
                      <p className="text-stone-500 text-[11px]">
                        {selectedReg.selection ? `Skor Total: ${selectedReg.selection.totalScore}` : 'Menunggu jadwal dari panitia'}
                      </p>
                    </div>

                    <div className="relative">
                      <div className={`absolute -left-[23px] top-0 w-3.5 h-3.5 rounded-full ${
                        selectedReg.status === 'Daftar Ulang'
                          ? 'bg-emerald-600'
                          : selectedReg.status === 'Diterima'
                          ? 'bg-teal-500'
                          : 'bg-stone-300'
                      }`}></div>
                      <h5 className="font-bold text-stone-900">4. Kelulusan & Daftar Ulang</h5>
                      <p className="text-stone-500 text-[11px]">
                        {selectedReg.status === 'Daftar Ulang' ? 'Daftar ulang tuntas tercatat' : 'Tahap akhir pendaftaran'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Audit logs */}
                <div>
                  <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] mb-2">
                    Catatan Verifikasi Panitia
                  </h4>
                  <div className="bg-[#F7F8F5] rounded-xl border border-stone-200 divide-y divide-stone-200 overflow-hidden">
                    {selectedReg.verificationLogs?.map((log, idx) => (
                      <div key={idx} className="p-3 text-stone-700">
                        <div className="flex justify-between items-center text-[11px] text-stone-500 mb-0.5">
                          <span className="font-semibold text-stone-800">{log.verifiedBy} ({log.verifierRole})</span>
                          <span>{formatDateId(log.timestamp)}</span>
                        </div>
                        <p className="font-medium text-stone-900">{log.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Revision Form */}
            {activeTab === 'revisi' && (
              <div className="p-6 text-xs">
                <form onSubmit={handleFixRevision} className="space-y-4">
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
                    <p className="font-bold">Catatan Perbaikan:</p>
                    <p className="mt-1">{selectedReg.revisionNotes}</p>
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Keterangan Perbaikan yang Dilakukan:
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Contoh: Saya telah mengunggah ulang foto akta kelahiran yang lebih jelas dan nomor akta terbaca dengan terang."
                      value={revisionNotes}
                      onChange={e => setRevisionNotes(e.target.value)}
                      className="w-full p-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-[#123B35]"
                    />
                  </div>

                  <div className="p-3 border border-stone-200 rounded-lg bg-stone-50 text-[11px] text-stone-600">
                    <p className="font-semibold text-stone-800 mb-1">Pilih Dokumen yang Diperbaiki:</p>
                    <input type="file" accept="image/*,.pdf" className="text-xs" />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('status')}
                      className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-5 py-2 bg-[#123B35] hover:bg-[#1a544b] text-white font-semibold rounded-lg shadow-xs"
                    >
                      {isUpdating ? 'Mengirim...' : 'Kirim Perbaikan ke Panitia'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab 3: Re-Registration */}
            {activeTab === 'daftar_ulang' && (
              <div className="p-6 text-xs space-y-4">
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-teal-900">
                  <h5 className="font-bold text-sm">Formulir Konfirmasi Daftar Ulang</h5>
                  <p className="mt-1 text-[11px] leading-relaxed">
                    Selamat atas kelulusan ananda. Mohon lengkapi data ukuran seragam sekolah dan konfirmasi kesediaan masuk.
                  </p>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Pilihan Ukuran Seragam Sekolah (Kemeja & Celana/Rok):
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['S', 'M', 'L', 'XL'] as const).map(sz => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setUniformSize(sz)}
                        className={`py-2 rounded-lg border text-center font-bold cursor-pointer transition-colors ${
                          uniformSize === sz
                            ? 'bg-[#123B35] text-white border-[#123B35]'
                            : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        Ukuran {sz}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-stone-400 mt-1">
                    *Ukuran standar SDIT: S (TB 110-115cm), M (TB 116-122cm), L (TB 123-130cm), XL (&gt;130cm).
                  </p>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Catatan Tambahan untuk Panitia (Opsional):
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Kami akan mengambil seragam di kantor tata usaha pada hari Kamis."
                    value={reRegNotes}
                    onChange={e => setReRegNotes(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-stone-300"
                  />
                </div>

                {receiptSuccess ? (
                  <div className="p-3 bg-emerald-100 text-emerald-900 font-semibold rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    <span>Konfirmasi daftar ulang berhasil disimpan! Selamat bergabung di SDIT Insan Cendikia Kalibaru.</span>
                  </div>
                ) : (
                  <button
                    onClick={handleConfirmReRegistration}
                    disabled={isUpdating}
                    className="w-full py-3 bg-[#123B35] hover:bg-[#1a544b] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer text-sm"
                  >
                    {isUpdating ? 'Menyimpan...' : 'Konfirmasi Daftar Ulang Sekarang'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Lightbox for Receipt Print */}
      {showReceiptModal && selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="max-w-3xl w-full my-8">
            <RegistrationReceipt
              registration={selectedReg}
              schoolProfile={schoolProfile}
              onClose={() => setShowReceiptModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
