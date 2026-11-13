/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Search,
  Calendar,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  CreditCard,
  MessageCircle,
  Printer,
  ChevronRight,
  ArrowRight,
  HelpCircle,
  RefreshCw,
  UploadCloud,
  FileCheck,
  Image as ImageIcon,
  ExternalLink,
  Check,
  Sparkles,
  Lock,
  Trash2,
  Eye,
  Building2,
  Landmark,
  XCircle,
  Upload
} from 'lucide-react';
import { api } from '../../lib/api';
import { CheckStatusResult, RegistrationStatus, PaymentProof } from '../../types';
import { getStatusBadgeClass } from '../../lib/utils';

interface CheckStatusSectionProps {
  onNavigate: (tab: any) => void;
  onOpenLoginModal?: () => void;
  initialRegNumber?: string;
}

export const CheckStatusSection: React.FC<CheckStatusSectionProps> = ({ onNavigate, initialRegNumber }) => {
  const [regNumber, setRegNumber] = useState(initialRegNumber || '');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<CheckStatusResult | null>(null);

  // Document revision upload state
  const [selectedFiles, setSelectedFiles] = useState<Record<string, { file: File; dataUrl: string; name: string }>>({});
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null);

  // Payment proof form state
  const [paymentMethod, setPaymentMethod] = useState<'Transfer Bank Jatim' | 'Tunai di Sekretariat'>('Transfer Bank Jatim');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentSenderName, setPaymentSenderName] = useState<string>('');
  const [paymentFile, setPaymentFile] = useState<{ dataUrl: string; fileName: string; fileSizeKb: number } | null>(null);
  const [isUploadingPayment, setIsUploadingPayment] = useState(false);
  const [paymentUploadMessage, setPaymentUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const paymentFileInputRef = useRef<HTMLInputElement>(null);

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setUploadSuccessMsg(null);
    setUploadErrorMsg(null);
    setSelectedFiles({});

    const cleanNo = regNumber.trim().toUpperCase();
    const cleanBirth = birthDate.trim();

    if (!cleanNo) {
      setErrorMsg('Harap masukkan nomor pendaftaran.');
      return;
    }
    if (!cleanBirth) {
      setErrorMsg('Harap masukkan tanggal lahir calon murid sebagai verifikasi keamanan.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.checkStatus(cleanNo, cleanBirth);
      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Data pendaftaran tidak ditemukan. Silakan periksa kembali nomor dan tanggal lahir.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadErrorMsg('Ukuran file melebihi batas maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFiles(prev => ({
        ...prev,
        [docId]: {
          file,
          dataUrl: reader.result as string,
          name: file.name
        }
      }));
      setUploadErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadRevision = async (docId: string) => {
    const fileItem = selectedFiles[docId];
    if (!fileItem || !result) return;

    setUploadingDocId(docId);
    setUploadErrorMsg(null);
    setUploadSuccessMsg(null);

    try {
      const res = await api.uploadRevision({
        registrationNumber: result.registrationNumber,
        birthDate: birthDate.trim(),
        sessionToken: result.sessionToken,
        documentId: docId,
        dataUrl: fileItem.dataUrl,
        fileName: fileItem.name
      });

      setUploadSuccessMsg(res.message);

      // Re-fetch updated status
      const updated = await api.checkStatus(result.registrationNumber, birthDate.trim());
      setResult(updated);

      // Clear the selected file for this document
      setSelectedFiles(prev => {
        const next = { ...prev };
        delete next[docId];
        return next;
      });
    } catch (err: any) {
      setUploadErrorMsg(err.message || 'Gagal mengunggah dokumen perbaikan. Silakan coba kembali.');
    } finally {
      setUploadingDocId(null);
    }
  };

  const handlePaymentFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(`Ukuran berkas "${file.name}" melebihi batas 5MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPaymentFile({
        dataUrl: reader.result as string,
        fileName: file.name,
        fileSizeKb: Math.round(file.size / 1024)
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePaymentFile = () => {
    setPaymentFile(null);
    if (paymentFileInputRef.current) {
      paymentFileInputRef.current.value = '';
    }
  };

  const handleSubmitPaymentProof = async () => {
    if (!result) return;
    if (!paymentSenderName.trim()) {
      alert('Mohon isi nama pengirim atau penyetor pembayaran.');
      return;
    }
    if (!paymentFile) {
      alert('Mohon pilih foto struk atau berkas bukti pembayaran.');
      return;
    }

    setIsUploadingPayment(true);
    setPaymentUploadMessage(null);
    try {
      const res = await api.uploadPaymentProof({
        registrationNumber: result.registrationNumber,
        birthDate: birthDate,
        sessionToken: result.sessionToken,
        method: paymentMethod,
        paymentDate,
        amount: 50000,
        senderName: paymentSenderName.trim(),
        dataUrl: paymentFile.dataUrl,
        fileName: paymentFile.fileName
      });

      setPaymentUploadMessage({
        type: 'success',
        text: res.message || 'Bukti pembayaran berhasil dikirim ke panitia SPMB.'
      });

      setResult(prev => prev ? {
        ...prev,
        paymentProof: res.paymentProof
      } : null);

      setPaymentFile(null);
      if (paymentFileInputRef.current) {
        paymentFileInputRef.current.value = '';
      }
    } catch (err: any) {
      setPaymentUploadMessage({
        type: 'error',
        text: err.message || 'Gagal mengirim bukti pembayaran.'
      });
    } finally {
      setIsUploadingPayment(false);
    }
  };

  const getTimelineSteps = (currentStatus: RegistrationStatus) => {
    const steps = [
      {
        id: 1,
        title: 'Pendaftaran Online',
        desc: 'Formulir data & dokumen persyaratan terkirim',
        completed: true,
        active: currentStatus === 'Menunggu Verifikasi'
      },
      {
        id: 2,
        title: 'Verifikasi Berkas',
        desc: currentStatus === 'Perlu Perbaikan'
          ? 'Terdapat berkas yang perlu diperbaiki'
          : 'Pemeriksaan keabsahan dokumen persyaratan',
        completed: ['Terverifikasi', 'Dalam Seleksi', 'Diterima', 'Menunggu Daftar Ulang', 'Selesai Daftar Ulang'].includes(currentStatus),
        active: ['Menunggu Verifikasi', 'Perlu Perbaikan'].includes(currentStatus),
        warning: currentStatus === 'Perlu Perbaikan'
      },
      {
        id: 3,
        title: 'Observasi & Seleksi',
        desc: 'Observasi kesiapan belajar, tes mengaji, & wawancara orang tua',
        completed: ['Diterima', 'Menunggu Daftar Ulang', 'Selesai Daftar Ulang'].includes(currentStatus),
        active: currentStatus === 'Dalam Seleksi'
      },
      {
        id: 4,
        title: 'Pengumuman Kelulusan',
        desc: currentStatus === 'Tidak Diterima' ? 'Belum memenuhi kuota' : 'Penetapan siswa baru yang diterima',
        completed: ['Diterima', 'Menunggu Daftar Ulang', 'Selesai Daftar Ulang', 'Tidak Diterima'].includes(currentStatus),
        active: currentStatus === 'Diterima' || currentStatus === 'Tidak Diterima',
        failed: currentStatus === 'Tidak Diterima'
      },
      {
        id: 5,
        title: 'Daftar Ulang',
        desc: 'Penyelesaian administrasi pendidikan & konfirmasi resmi',
        completed: currentStatus === 'Selesai Daftar Ulang',
        active: currentStatus === 'Menunggu Daftar Ulang' || currentStatus === 'Diterima'
      }
    ];
    return steps;
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#123B35] text-xs font-semibold shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#D5AA53]" />
            Layanan Resmi SPMB Online SDIT Insan Cendikia Kalibaru
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#123B35] tracking-tight">
            Cek Status Pendaftaran SPMB
          </h1>
          <p className="text-stone-600 max-w-2xl mx-auto text-xs sm:text-sm leading-relaxed">
            Wali murid dapat mengetahui perkembangan proses pendaftaran, mengunggah perbaikan dokumen, serta mendapatkan tautan grup WhatsApp resmi secara mandiri tanpa memerlukan akun login.
          </p>
        </div>

        {/* Input Card with 2-Factor Privacy Protection */}
        <div className="bg-white rounded-3xl shadow-md border border-stone-200 p-6 sm:p-8">
          <form onSubmit={handleCheckStatus} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Registration Number */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Nomor Pendaftaran <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                    placeholder="Contoh: SPMB-2026-0001"
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#123B35] uppercase font-mono tracking-wider font-bold text-stone-900"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Nomor tertera pada lembar bukti pendaftaran online Anda.
                </p>
              </div>

              {/* Birth Date (2nd Factor) */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Tanggal Lahir Calon Murid (Verifikasi 2FA) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#123B35] font-semibold text-stone-900"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Diperlukan untuk melindungi privasi data ananda dari pihak lain.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed font-medium">{errorMsg}</div>
              </div>
            )}

            {/* Quick Demo Button for Evaluator */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100">
              <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                <span>Contoh Uji Coba:</span>
                <button
                  type="button"
                  onClick={() => {
                    setRegNumber('SPMB-2026-0002');
                    setBirthDate('2020-02-18');
                  }}
                  className="font-bold text-[#174C80] hover:underline"
                >
                  SPMB-2026-0002 (Terverifikasi + Grup WA)
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => {
                    setRegNumber('SPMB-2026-0003');
                    setBirthDate('2020-06-25');
                  }}
                  className="font-bold text-amber-700 hover:underline"
                >
                  SPMB-2026-0003 (Revisi Dokumen)
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#123B35] hover:bg-[#1a544b] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer ml-auto"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Data...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-[#D5AA53]" />
                    <span>Cek Status Pendaftaran</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results Card */}
        {result && (
          <div className="bg-white rounded-3xl shadow-lg border border-stone-200 overflow-hidden animate-in fade-in duration-200">
            {/* Header of Result */}
            <div className="bg-[#123B35] px-6 py-5 text-white flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#D5AA53] tracking-widest block">
                  Informasi Hasil Pemeriksaan SPMB
                </span>
                <h3 className="text-xl font-extrabold text-white mt-0.5">
                  {result.childName}
                </h3>
                <p className="text-xs text-stone-300 font-mono mt-0.5">
                  Nomor Pendaftaran: <span className="text-[#D5AA53] font-bold">{result.registrationNumber}</span> · TA {result.academicYear}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  result.status === 'Terverifikasi'
                    ? 'bg-sky-100 text-sky-900 border border-sky-300'
                    : result.status === 'Perlu Perbaikan'
                    ? 'bg-rose-100 text-rose-900 border border-rose-300'
                    : result.status === 'Diterima' || result.status === 'Selesai Daftar Ulang'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  {result.status}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-7">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 bg-[#F7F8F5] rounded-2xl border border-stone-200">
                  <span className="text-[11px] text-stone-500 block">Jalur / Gelombang</span>
                  <span className="font-bold text-stone-900 text-xs mt-0.5 block truncate">{result.waveName}</span>
                </div>
                <div className="p-3.5 bg-[#F7F8F5] rounded-2xl border border-stone-200">
                  <span className="text-[11px] text-stone-500 block">Tanggal Mendaftar</span>
                  <span className="font-bold text-stone-900 text-xs mt-0.5 block truncate">
                    {new Date(result.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="p-3.5 bg-[#F7F8F5] rounded-2xl border border-stone-200">
                  <span className="text-[11px] text-stone-500 block">Status Terakhir</span>
                  <span className="font-bold text-emerald-800 text-xs mt-0.5 block truncate">{result.status}</span>
                </div>
                <div className="p-3.5 bg-[#F7F8F5] rounded-2xl border border-stone-200">
                  <span className="text-[11px] text-stone-500 block">Pembaruan Sistem</span>
                  <span className="font-bold text-stone-900 text-xs mt-0.5 block truncate">
                    {new Date(result.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>

              {/* Dynamic Progress Milestones Timeline */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#D5AA53]" />
                    <span>Tahapan Perkembangan Pendaftaran SPMB</span>
                  </h4>
                  <span className="text-[11px] text-stone-500 hidden sm:block">
                    ← Geser horizontal untuk melihat seluruh tahapan →
                  </span>
                </div>

                {/* DESKTOP VIEW: Horizontal Scrollable Cards */}
                <div className="hidden sm:flex gap-3.5 overflow-x-auto pb-3 pt-1">
                  {(result.stages && result.stages.length > 0 ? result.stages : getTimelineSteps(result.status).map(s => ({
                    stageId: `step-${s.id}`,
                    order: s.id,
                    title: s.title,
                    description: s.desc,
                    status: s.completed ? ('completed' as const) : s.warning ? ('action_needed' as const) : s.active ? ('in_progress' as const) : ('waiting' as const)
                  }))).map((st: any) => {
                    const isDone = st.status === 'completed';
                    const isProgress = st.status === 'in_progress';
                    const isActionNeeded = st.status === 'action_needed';
                    const isWaiting = !isDone && !isProgress && !isActionNeeded;

                    const isObservasiStage = st.stageId?.includes('observasi') || st.title?.toLowerCase().includes('observasi') || st.hasObservation;
                    const isDaftarUlangStage = st.stageId?.includes('daftar_ulang') || st.stageId?.includes('daftar-ulang') || st.title?.toLowerCase().includes('daftar ulang') || st.hasReRegistration;

                    return (
                      <div
                        key={st.stageId || st.order}
                        className={`min-w-[270px] max-w-[290px] p-4 rounded-2xl border flex flex-col justify-between shadow-2xs transition-all shrink-0 ${
                          isDone
                            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                            : isProgress
                            ? 'bg-sky-50/70 border-sky-300 text-sky-950 ring-2 ring-sky-300'
                            : isActionNeeded
                            ? 'bg-amber-50/80 border-amber-300 text-amber-950 ring-2 ring-amber-300'
                            : 'bg-stone-50 border-stone-200 text-stone-500'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-black/5">
                              Tahap {st.order}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isDone
                                ? 'bg-emerald-200 text-emerald-900'
                                : isProgress
                                ? 'bg-sky-200 text-sky-900'
                                : isActionNeeded
                                ? 'bg-amber-200 text-amber-900'
                                : 'bg-stone-200 text-stone-600'
                            }`}>
                              {isDone ? 'Selesai' : isProgress ? 'Sedang Berlangsung' : isActionNeeded ? 'Perlu Tindakan' : 'Belum Dimulai'}
                            </span>
                          </div>

                          <h5 className="font-bold text-xs leading-snug">{st.title}</h5>
                          {st.description && (
                            <p className="text-[11px] opacity-80 leading-relaxed line-clamp-3">
                              {st.description}
                            </p>
                          )}

                          {st.notes && (
                            <div className="p-2 rounded-lg bg-white/70 border border-stone-200 text-[10px] italic">
                              <strong>Catatan:</strong> {st.notes}
                            </div>
                          )}
                        </div>

                        {/* WhatsApp Admin Action Buttons */}
                        <div className="pt-3 mt-3 border-t border-stone-200/60 space-y-2">
                          {isObservasiStage && result.adminWhatsApp?.observasiUrl && (
                            <a
                              href={result.adminWhatsApp.observasiUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#123B35] hover:bg-[#1a544b] text-white rounded-xl font-bold text-[10px] shadow-xs transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-[#D5AA53]" />
                              <span>Hubungi Admin untuk Observasi</span>
                            </a>
                          )}

                          {isDaftarUlangStage && result.adminWhatsApp?.daftarUlangUrl && (
                            <a
                              href={result.adminWhatsApp.daftarUlangUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-[10px] shadow-xs transition-colors"
                            >
                              <CreditCard className="w-3.5 h-3.5 text-[#D5AA53]" />
                              <span>Hubungi Admin untuk Daftar Ulang</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* MOBILE VIEW: Vertical Responsive Stack */}
                <div className="flex sm:hidden flex-col gap-3">
                  {(result.stages && result.stages.length > 0 ? result.stages : getTimelineSteps(result.status).map(s => ({
                    stageId: `step-${s.id}`,
                    order: s.id,
                    title: s.title,
                    description: s.desc,
                    status: s.completed ? ('completed' as const) : s.warning ? ('action_needed' as const) : s.active ? ('in_progress' as const) : ('waiting' as const)
                  }))).map((st: any) => {
                    const isDone = st.status === 'completed';
                    const isProgress = st.status === 'in_progress';
                    const isActionNeeded = st.status === 'action_needed';

                    const isObservasiStage = st.stageId?.includes('observasi') || st.title?.toLowerCase().includes('observasi') || st.hasObservation;
                    const isDaftarUlangStage = st.stageId?.includes('daftar_ulang') || st.stageId?.includes('daftar-ulang') || st.title?.toLowerCase().includes('daftar ulang') || st.hasReRegistration;

                    return (
                      <div
                        key={st.stageId || st.order}
                        className={`p-4 rounded-2xl border ${
                          isDone
                            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                            : isProgress
                            ? 'bg-sky-50/70 border-sky-300 text-sky-950 ring-2 ring-sky-300'
                            : isActionNeeded
                            ? 'bg-amber-50/80 border-amber-300 text-amber-950 ring-2 ring-amber-300'
                            : 'bg-stone-50 border-stone-200 text-stone-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-black/5">
                            Tahap {st.order}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isDone
                              ? 'bg-emerald-200 text-emerald-900'
                              : isProgress
                              ? 'bg-sky-200 text-sky-900'
                              : isActionNeeded
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-stone-200 text-stone-600'
                          }`}>
                            {isDone ? 'Selesai' : isProgress ? 'Sedang Berlangsung' : isActionNeeded ? 'Perlu Tindakan' : 'Belum Dimulai'}
                          </span>
                        </div>
                        <h5 className="font-bold text-xs">{st.title}</h5>
                        {st.description && <p className="text-[11px] opacity-80 mt-1">{st.description}</p>}
                        {st.notes && (
                          <div className="p-2 rounded-lg bg-white/70 border border-stone-200 text-[10px] italic mt-2">
                            <strong>Catatan:</strong> {st.notes}
                          </div>
                        )}

                        {/* WhatsApp Buttons on Mobile */}
                        {isObservasiStage && result.adminWhatsApp?.observasiUrl && (
                          <a
                            href={result.adminWhatsApp.observasiUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#123B35] text-white rounded-xl font-bold text-[10px]"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-[#D5AA53]" />
                            <span>Hubungi Admin untuk Observasi</span>
                          </a>
                        )}

                        {isDaftarUlangStage && result.adminWhatsApp?.daftarUlangUrl && (
                          <a
                            href={result.adminWhatsApp.daftarUlangUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white rounded-xl font-bold text-[10px]"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-[#D5AA53]" />
                            <span>Hubungi Admin untuk Pembayaran Daftar Ulang</span>
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION E: FITUR GABUNG GRUP WHATSAPP SPMB (Khusus Terverifikasi) */}
              {result.whatsAppGroup && result.whatsAppGroup.isEligible && result.whatsAppGroup.isActive && result.whatsAppGroup.inviteLink && (
                <div className="bg-linear-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-7 text-white shadow-xl space-y-4 border-2 border-[#D5AA53]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 max-w-xl">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-[#D5AA53] text-[11px] font-bold tracking-wide">
                        <Sparkles className="w-3.5 h-3.5" />
                        Pendaftaran Telah Terverifikasi Resmi
                      </div>
                      <h4 className="text-xl font-extrabold text-white leading-tight">
                        Bergabung ke Grup WhatsApp Resmi SPMB
                      </h4>
                      <p className="text-xs text-emerald-100 leading-relaxed">
                        {result.whatsAppGroup.infoMessage}
                      </p>
                    </div>

                    <a
                      href={result.whatsAppGroup.inviteLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3.5 bg-white hover:bg-emerald-50 text-[#123B35] font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2.5 shrink-0 group hover:scale-[1.02]"
                    >
                      <MessageCircle className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                      <span>Gabung Grup WhatsApp SPMB</span>
                      <ExternalLink className="w-4 h-4 text-emerald-600" />
                    </a>
                  </div>

                  <div className="text-[11px] text-emerald-200 border-t border-white/20 pt-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#D5AA53] shrink-0" />
                    <span>Nama Grup: <strong>{result.whatsAppGroup.groupName}</strong> (Dikelola oleh Panitia SPMB SDIT Insan Cendikia Kalibaru)</span>
                  </div>
                </div>
              )}

              {/* SECTION D: FITUR PERBAIKAN DOKUMEN MELALUI CEK STATUS (Jika Perlu Perbaikan) */}
              {result.needsDocumentRevision && (
                <div className="bg-rose-50/70 rounded-3xl p-6 sm:p-7 border-2 border-rose-300 space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-rose-950">
                        Unggah Perbaikan Dokumen Persyaratan
                      </h4>
                      <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
                        Panitia SPMB menemukan beberapa dokumen yang memerlukan revisi (buram, terpotong, atau kurang lengkap). Silakan unggah perbaikan berkas di bawah ini tanpa perlu membuat akun login.
                      </p>
                    </div>
                  </div>

                  {/* Feedback alerts */}
                  {uploadSuccessMsg && (
                    <div className="p-3.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>{uploadSuccessMsg}</span>
                    </div>
                  )}

                  {uploadErrorMsg && (
                    <div className="p-3.5 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 text-xs flex items-center gap-2 font-medium">
                      <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                      <span>{uploadErrorMsg}</span>
                    </div>
                  )}

                  {/* List of documents to fix */}
                  <div className="space-y-4">
                    {(result.documentsToRevise || []).map(doc => {
                      const selected = selectedFiles[doc.id];
                      const isUploading = uploadingDocId === doc.id;
                      const isFixed = doc.status === 'Sudah Diunggah';

                      return (
                        <div
                          key={doc.id}
                          className="bg-white rounded-2xl p-5 border border-rose-200 shadow-xs space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-stone-400">Berkas Persyaratan</span>
                              <h5 className="text-sm font-bold text-stone-900">{doc.label}</h5>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase w-fit ${
                              isFixed
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}>
                              {doc.status}
                            </span>
                          </div>

                          {/* Panitia Revision Note */}
                          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                            <span className="font-bold block text-amber-950 mb-0.5">Catatan Perbaikan Panitia:</span>
                            <p className="leading-relaxed italic">"{doc.revisionNote}"</p>
                          </div>

                          {/* Upload Actions */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                            <div className="flex items-center gap-3">
                              <label className="px-4 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-stone-500" />
                                <span>{selected ? 'Ganti File Pilihan' : 'Pilih File Pengganti'}</span>
                                <input
                                  type="file"
                                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                                  onChange={e => handleFileChange(doc.id, e)}
                                  className="hidden"
                                />
                              </label>

                              {selected && (
                                <span className="text-xs font-medium text-stone-700 truncate max-w-[200px]">
                                  {selected.name}
                                </span>
                              )}
                            </div>

                            {selected && (
                              <button
                                type="button"
                                disabled={isUploading}
                                onClick={() => handleUploadRevision(doc.id)}
                                className="px-5 py-2 bg-[#123B35] hover:bg-[#1a544b] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                              >
                                {isUploading ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Mengunggah...</span>
                                  </>
                                ) : (
                                  <>
                                    <UploadCloud className="w-3.5 h-3.5 text-[#D5AA53]" />
                                    <span>Kirim Berkas Perbaikan</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          {/* Image Preview if available */}
                          {selected && selected.dataUrl.startsWith('data:image') && (
                            <div className="mt-2 p-2 bg-stone-50 rounded-xl border border-stone-200 w-fit">
                              <p className="text-[10px] text-stone-500 font-bold mb-1">Preview Berkas Pilihan:</p>
                              <img
                                src={selected.dataUrl}
                                alt="Preview Berkas"
                                className="h-28 w-auto rounded-lg object-contain border border-stone-300"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notes & Verification History */}
              <div className="bg-[#F7F8F5] rounded-3xl p-6 border border-stone-200 space-y-4">
                <h4 className="text-xs font-bold text-[#123B35] uppercase tracking-wider flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#D5AA53]" />
                  Catatan Panitia & Riwayat Verifikasi
                </h4>

                {result.panitiaNotes ? (
                  <div className="p-3.5 bg-white rounded-xl border border-stone-200 text-xs text-stone-800 leading-relaxed shadow-2xs font-medium">
                    "{result.panitiaNotes}"
                  </div>
                ) : (
                  <p className="text-xs text-stone-500 italic">
                    Belum ada catatan khusus dari panitia. Berkas dalam proses penjadwalan.
                  </p>
                )}

                {/* History list */}
                {result.verificationHistory && result.verificationHistory.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-stone-600 block">Kronologi Catatan Verifikasi:</span>
                    <div className="space-y-1.5">
                      {result.verificationHistory.map((h, i) => (
                        <div key={i} className="p-2.5 bg-white rounded-xl border border-stone-200 text-[11px] text-stone-700 flex items-start justify-between gap-3">
                          <div>
                            <span className="font-bold text-stone-900 block">{h.status}</span>
                            <span className="text-stone-600">{h.notes}</span>
                          </div>
                          <span className="text-[10px] text-stone-400 whitespace-nowrap">
                            {new Date(h.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION: PEMBAYARAN DAFTAR ULANG (Wajib Upload Bukti Pembayaran) */}
              {result.reRegistration && result.reRegistration.isEligible && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#D5AA53] shadow-md space-y-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-5">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700 text-white text-xs font-bold mb-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#D5AA53]" />
                        <span>Selamat! Calon Murid Dinyatakan DITERIMA</span>
                      </div>
                      <h4 className="text-xl font-black text-[#123B35] font-serif">
                        PEMBAYARAN DAFTAR ULANG
                      </h4>
                      <p className="text-xs text-stone-600 mt-1">
                        Batas akhir penyelesaian administrasi daftar ulang:{' '}
                        <strong className="text-rose-600 font-bold">{result.reRegistration.deadline}</strong>
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D5AA53] shrink-0">
                      <CreditCard className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Payment Verification Status Badge / Banner */}
                  {(() => {
                    const proof = result.paymentProof;
                    const status = proof?.status || 'Belum Upload';

                    if (status === 'Disetujui') {
                      return (
                        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 space-y-2">
                          <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            <span>Status Pembayaran: DISETUJUI & TERVERIFIKASI RESMI</span>
                          </div>
                          <p className="text-xs text-emerald-800 leading-relaxed">
                            Alhamdulillah, bukti pembayaran daftar ulang senilai <strong>Rp 50.000,-</strong> ({proof?.method}) atas nama <strong>{proof?.senderName}</strong> telah diverifikasi dan disetujui oleh panitia/admin sekolah pada {proof?.verifiedAt ? new Date(proof.verifiedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}.
                          </p>
                          {proof?.adminNotes && (
                            <p className="text-xs bg-white/80 p-2.5 rounded-xl border border-emerald-200 text-emerald-900">
                              <strong>Catatan Admin:</strong> {proof.adminNotes}
                            </p>
                          )}
                        </div>
                      );
                    }

                    if (status === 'Menunggu Verifikasi') {
                      return (
                        <div className="p-4 rounded-2xl bg-sky-50 border-2 border-sky-400 text-sky-950 space-y-2">
                          <div className="flex items-center gap-2 font-bold text-sm text-sky-900">
                            <Clock className="w-5 h-5 text-sky-600 shrink-0 animate-pulse" />
                            <span>Status Pembayaran: MENUNGGU VERIFIKASI PANITIA</span>
                          </div>
                          <p className="text-xs text-sky-800 leading-relaxed">
                            Bukti pembayaran ({proof?.method} - Rp 50.000,- an. {proof?.senderName}) telah berhasil diunggah pada {proof?.uploadedAt ? new Date(proof.uploadedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : '-'}. Tim SPMB sedang memvalidasi transaksi Anda.
                          </p>
                        </div>
                      );
                    }

                    if (status === 'Ditolak' || status === 'Perlu Upload Ulang') {
                      return (
                        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-400 text-rose-950 space-y-2">
                          <div className="flex items-center gap-2 font-bold text-sm text-rose-900">
                            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                            <span>Status Pembayaran: {status === 'Ditolak' ? 'DITOLAK' : 'PERLU UPLOAD ULANG'}</span>
                          </div>
                          <p className="text-xs text-rose-800 leading-relaxed">
                            Bukti pembayaran sebelumnya belum dapat disetujui. Mohon periksa kembali transfer atau kwitansi Anda dan unggah ulang berkas yang valid.
                          </p>
                          {proof?.adminNotes && (
                            <div className="text-xs bg-white p-3 rounded-xl border border-rose-300 text-rose-950 font-medium">
                              <strong>Catatan Panitia:</strong> "{proof.adminNotes}"
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-xs font-bold text-amber-900">Status: Belum Mengunggah Bukti Pembayaran</strong>
                          <p className="text-xs text-amber-800 mt-0.5">
                            Silakan lakukan pembayaran biaya pendaftaran sebesar <strong>Rp 50.000,-</strong> melalui Transfer Bank Jatim atau langsung di kantor sekretariat, kemudian unggah bukti transfer/kwitansi pada formulir di bawah.
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Info A & Info B: Saluran Pembayaran */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Info A: Pembayaran Langsung di Sekretariat */}
                    <div className="p-4 rounded-2xl bg-[#F7F8F5] border border-stone-200 space-y-2.5">
                      <div className="flex items-center gap-2 text-[#123B35] font-bold text-xs uppercase tracking-wide">
                        <Building2 className="w-4 h-4 text-[#D5AA53]" />
                        <span>A. Pembayaran Langsung (Tunai)</span>
                      </div>
                      <div className="text-xs text-stone-700 space-y-1">
                        <p className="font-bold text-stone-900">Kantor Sekretariat SDIT Insan Cendekia</p>
                        <p className="text-stone-600">Jl. Pahlawan, Desa Kalibaru Kulon, Kec. Kalibaru, Kab. Banyuwangi</p>
                        <div className="pt-1.5 border-t border-stone-200 text-[11px] text-stone-600 space-y-0.5">
                          <p><strong className="text-stone-800">Senin – Kamis:</strong> 07.00 – 15.00 WIB</p>
                          <p><strong className="text-stone-800">Jumat:</strong> 07.00 – 12.30 WIB</p>
                        </div>
                      </div>
                    </div>

                    {/* Info B: Transfer Bank Jatim */}
                    <div className="p-4 rounded-2xl bg-[#F7F8F5] border border-stone-200 space-y-2.5">
                      <div className="flex items-center gap-2 text-[#123B35] font-bold text-xs uppercase tracking-wide">
                        <Landmark className="w-4 h-4 text-[#D5AA53]" />
                        <span>B. Transfer Bank Jatim</span>
                      </div>
                      <div className="text-xs text-stone-700 space-y-1">
                        <p className="font-bold text-stone-900">Bank Jatim</p>
                        <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-stone-200 font-mono">
                          <div>
                            <span className="text-[10px] text-stone-400 block font-sans">No. Rekening Resmi PPDB</span>
                            <span className="text-sm font-bold text-stone-900 tracking-wider">1592015532</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText('1592015532');
                              alert('Nomor rekening Bank Jatim (1592015532) berhasil disalin!');
                            }}
                            className="px-2.5 py-1 text-[11px] font-sans font-semibold rounded-md border border-stone-300 hover:bg-stone-50 text-stone-700 cursor-pointer"
                          >
                            Salin No. Rek
                          </button>
                        </div>
                        <p className="text-[11px] text-stone-600">
                          Atas Nama: <strong className="text-stone-900">SDIT INSAN CENDEKIA PPDB</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Info C: Rincian Biaya */}
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-emerald-950 uppercase tracking-wide block text-[11px]">
                        C. Rincian Biaya Pendaftaran Resmi
                      </span>
                      <p className="text-emerald-800 mt-0.5">
                        Biaya pendaftaran resmi calon murid baru SDIT Insan Cendikia Kalibaru.
                      </p>
                      <p className="text-[11px] text-emerald-700 italic">
                        * Tepat Rp 50.000,- (lima puluh ribu rupiah). Tidak ada biaya seragam atau biaya tersembunyi lainnya pada tahap pendaftaran awal.
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-2xl font-black text-emerald-900 font-mono block">
                        Rp 50.000
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold uppercase">Lunas Satu Kali</span>
                    </div>
                  </div>

                  {/* Info D: Form Upload Bukti Pembayaran */}
                  {result.paymentProof?.status !== 'Disetujui' && (
                    <div className="p-5 rounded-2xl bg-white border border-stone-300 shadow-xs space-y-4">
                      <div className="border-b border-stone-200 pb-3">
                        <span className="font-bold text-[#123B35] text-xs uppercase tracking-wide flex items-center gap-2">
                          <UploadCloud className="w-4 h-4 text-[#D5AA53]" />
                          D. Unggah Bukti Pembayaran Daftar Ulang
                        </span>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Lengkapi data di bawah ini dan lampirkan foto struk transfer ATM / m-Banking / kwitansi tunai dari sekretariat.
                        </p>
                      </div>

                      {paymentUploadMessage && (
                        <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                          paymentUploadMessage.type === 'success'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-rose-50 border-rose-200 text-rose-800'
                        }`}>
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{paymentUploadMessage.text}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block font-bold text-stone-800 mb-1">
                            Metode Pembayaran: <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={paymentMethod}
                            onChange={e => setPaymentMethod(e.target.value as any)}
                            className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-xs font-medium"
                          >
                            <option value="Transfer Bank Jatim">Transfer Bank Jatim (No. Rek: 1592015532)</option>
                            <option value="Tunai di Sekretariat">Tunai di Sekretariat Sekolah</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-stone-800 mb-1">
                            Tanggal Pembayaran: <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={paymentDate}
                            onChange={e => setPaymentDate(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-medium"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-800 mb-1">
                            Nominal Pembayaran:
                          </label>
                          <input
                            type="text"
                            readOnly
                            value="Rp 50.000,-"
                            className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-100 font-mono font-bold text-emerald-800 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-800 mb-1">
                            Nama Pengirim / Penyetor: <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Contoh: Bpk. Hendra / Ibu Siti"
                            value={paymentSenderName}
                            onChange={e => setPaymentSenderName(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-medium"
                          />
                        </div>
                      </div>

                      {/* File Picker */}
                      <div>
                        <label className="block font-bold text-stone-800 mb-1 text-xs">
                          Berkas Struk / Bukti Pembayaran: <span className="text-rose-500">*</span>
                        </label>

                        <input
                          ref={paymentFileInputRef}
                          type="file"
                          accept="image/jpeg, image/jpg, image/png, image/webp, application/pdf"
                          onChange={handlePaymentFileSelect}
                          className="hidden"
                        />

                        {paymentFile ? (
                          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-300 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs">
                                <FileCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                                <span className="font-bold text-stone-900">{paymentFile.fileName}</span>
                                <span className="text-stone-400">({paymentFile.fileSizeKb} KB)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => paymentFileInputRef.current?.click()}
                                  className="text-[11px] text-stone-600 hover:text-stone-900 underline cursor-pointer"
                                >
                                  Ganti File
                                </button>
                                <button
                                  type="button"
                                  onClick={handleRemovePaymentFile}
                                  className="text-[11px] text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer font-semibold"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Hapus</span>
                                </button>
                              </div>
                            </div>

                            {/* Image preview if image */}
                            {paymentFile.dataUrl.startsWith('data:image') && (
                              <div className="pt-2">
                                <img
                                  src={paymentFile.dataUrl}
                                  alt="Pratinjau Bukti Bayar"
                                  className="h-32 w-auto object-contain rounded-xl border border-stone-200 bg-white"
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => paymentFileInputRef.current?.click()}
                            className="w-full p-4 border-2 border-dashed border-stone-300 hover:border-[#123B35] rounded-2xl bg-stone-50 hover:bg-stone-100/70 transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer text-stone-600"
                          >
                            <Upload className="w-5 h-5 text-stone-400" />
                            <span className="font-bold text-xs text-stone-800">Pilih Berkas Struk / Bukti Pembayaran</span>
                            <span className="text-[11px] text-stone-400">Format: JPG, PNG, WEBP, atau PDF (Maksimal 5MB)</span>
                          </button>
                        )}
                      </div>

                      {/* Submit Button */}
                      <button
                        type="button"
                        disabled={isUploadingPayment || !paymentSenderName.trim() || !paymentFile}
                        onClick={handleSubmitPaymentProof}
                        className="w-full py-3 bg-[#123B35] hover:bg-[#1a544b] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUploadingPayment ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-[#D5AA53]" />
                            <span>MENGIRIM BUKTI PEMBAYARAN...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-[#D5AA53]" />
                            <span>KIRIM BUKTI PEMBAYARAN DAFTAR ULANG</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Direct WhatsApp to Admin for payment help */}
                  {result.adminWhatsApp?.enablePayment && result.adminWhatsApp.paymentLink && (
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-600">
                      <span>Membutuhkan bantuan konfirmasi pembayaran?</span>
                      <a
                        href={result.adminWhatsApp.paymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer w-fit"
                      >
                        <MessageCircle className="w-4 h-4 text-[#D5AA53]" />
                        <span>Konfirmasi via WhatsApp Panitia SPMB</span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-stone-300 text-stone-700 hover:bg-stone-50 rounded-xl text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-stone-500" />
                  Cetak Lembar Status
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setResult(null);
                      setRegNumber('');
                      setBirthDate('');
                      setSelectedFiles({});
                    }}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
                  >
                    Pencarian Baru
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('spmb')}
                    className="px-4 py-2 bg-[#123B35] hover:bg-[#1a544b] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Informasi SPMB</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ & Help Section */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-bold text-[#123B35] flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#D5AA53]" />
            Bantuan & Panduan Cek Status SPMB
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-stone-600">
            <div className="p-4 bg-[#F7F8F5] rounded-2xl border border-stone-200 space-y-1">
              <p className="font-bold text-stone-900">Di mana saya bisa melihat nomor pendaftaran?</p>
              <p className="leading-relaxed text-[11px]">
                Nomor pendaftaran resmi (misalnya: SPMB-2026-0001) tertera pada lembar bukti pendaftaran online setelah Anda mengirimkan formulir pendaftaran SPMB.
              </p>
            </div>
            <div className="p-4 bg-[#F7F8F5] rounded-2xl border border-stone-200 space-y-1">
              <p className="font-bold text-stone-900">Apakah wali murid perlu membuat akun login?</p>
              <p className="leading-relaxed text-[11px]">
                Tidak perlu. Seluruh proses mulai dari pendaftaran, pengecekan berkas, perbaikan dokumen, hingga bergabung grup WhatsApp dilakukan langsung melalui halaman publik ini.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
