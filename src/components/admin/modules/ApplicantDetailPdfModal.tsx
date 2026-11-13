/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Registration, SchoolProfile, ApplicantStageProgress, StageStatus } from '../../../types';
import { api } from '../../../lib/api';
import { formatDateId } from '../../../lib/utils';
import { useModalDismiss } from '../../../hooks/useModalDismiss';
import { downloadElementAsPdf } from '../../../lib/pdfGenerator';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Users,
  GraduationCap,
  FileText,
  Save,
  Check,
  Calendar,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Loader2,
  CreditCard
} from 'lucide-react';

interface ApplicantDetailPdfModalProps {
  registration: Registration;
  schoolProfile: SchoolProfile;
  onClose: () => void;
  onRefresh: () => void;
}

export const ApplicantDetailPdfModal: React.FC<ApplicantDetailPdfModalProps> = ({
  registration,
  schoolProfile,
  onClose,
  onRefresh
}) => {
  useModalDismiss(true, onClose);

  const [activeTab, setActiveTab] = useState<'preview' | 'stages' | 'documents'>('preview');
  const [stages, setStages] = useState<ApplicantStageProgress[]>(
    registration.stages && registration.stages.length > 0
      ? [...registration.stages].sort((a, b) => a.order - b.order)
      : []
  );
  const [isSavingStages, setIsSavingStages] = useState(false);
  const [stageSaveSuccess, setStageSaveSuccess] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [paymentActionMessage, setPaymentActionMessage] = useState<string | null>(null);
  const [paymentAdminNotes, setPaymentAdminNotes] = useState('');

  const handleVerifyPayment = async (status: 'Disetujui' | 'Ditolak' | 'Perlu Upload Ulang') => {
    try {
      setIsVerifyingPayment(true);
      await api.verifyPaymentProof(registration.id, {
        status,
        adminNotes: paymentAdminNotes,
        verifierName: 'Panitia SPMB',
        verifierRole: 'panitia_spmb'
      });
      setPaymentActionMessage(`Status pembayaran berhasil diperbarui menjadi: ${status}`);
      setTimeout(() => setPaymentActionMessage(null), 4000);
      onRefresh();
    } catch (err: any) {
      alert('Gagal memverifikasi pembayaran: ' + (err.message || 'Error'));
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const sanitizedName = (registration.student?.fullName || 'Peserta').replace(/[^a-zA-Z0-9]/g, '_');
      const cleanReg = (registration.registrationNumber || 'SPMB').replace(/[^a-zA-Z0-9]/g, '_');
      await downloadElementAsPdf(
        'spmb-printable-receipt',
        `Formulir_Pendaftaran_${sanitizedName}_${cleanReg}.pdf`
      );
    } catch (err: any) {
      console.error(err);
      alert('Gagal mengunduh file PDF secara otomatis: ' + (err.message || 'Error') + '. Silakan gunakan tombol Cetak.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleUpdateStageStatus = (stageId: string, status: StageStatus) => {
    setStages(prev =>
      prev.map(s => {
        if (s.stageId === stageId) {
          return {
            ...s,
            status,
            completedAt: status === 'completed' ? new Date().toISOString() : undefined,
            actionRequired: status === 'action_needed',
            updatedAt: new Date().toISOString(),
            updatedBy: 'Panitia SPMB'
          };
        }
        return s;
      })
    );
  };

  const handleUpdateStageNotes = (stageId: string, notes: string) => {
    setStages(prev =>
      prev.map(s => (s.stageId === stageId ? { ...s, notes } : s))
    );
  };

  const handleSaveStages = async () => {
    try {
      setIsSavingStages(true);
      await api.updateApplicantStages(registration.id, {
        stages,
        updatedBy: 'Panitia SPMB'
      });
      setStageSaveSuccess(true);
      setTimeout(() => setStageSaveSuccess(false), 3000);
      onRefresh();
    } catch (err: any) {
      alert('Gagal menyimpan tahapan: ' + (err.message || 'Error'));
    } finally {
      setIsSavingStages(false);
    }
  };

  const { student, parent } = registration;
  const branding = schoolProfile.branding;
  const logoUrl = branding?.receiptLogoUrl || branding?.mainLogoUrl;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl border border-stone-200 w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto relative">
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print bg-[#123B35] text-white p-3.5 sm:p-4 px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 shrink-0 border-b border-[#1a544b]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D5AA53] block">
              Detail Calon Siswa SPMB
            </span>
            <h3 className="font-bold text-sm sm:text-base text-white">
              {student.fullName} ({registration.registrationNumber})
            </h3>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-black/25 p-1 rounded-xl text-xs">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                activeTab === 'preview' ? 'bg-white text-[#123B35] shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              Lihat Formulir
            </button>
            <button
              onClick={() => setActiveTab('stages')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'stages' ? 'bg-[#D5AA53] text-stone-900 font-bold shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              <span>Checklist Tahapan</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                activeTab === 'documents' ? 'bg-white text-[#123B35] shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              Berkas ({registration.documents?.length || 0})
            </button>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            {activeTab === 'preview' && (
              <div className="hidden sm:flex items-center gap-1 bg-black/25 p-0.5 rounded-lg mr-1 text-xs">
                <button
                  type="button"
                  onClick={() => setZoomScale(z => Math.max(0.7, z - 0.1))}
                  className="p-1 text-stone-300 hover:text-white rounded cursor-pointer"
                  title="Perkecil Tampilan"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono px-1">{Math.round(zoomScale * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoomScale(z => Math.min(1.4, z + 0.1))}
                  className="p-1 text-stone-300 hover:text-white rounded cursor-pointer"
                  title="Perbesar Tampilan"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomScale(1)}
                  className="p-1 text-stone-300 hover:text-white rounded cursor-pointer"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="px-3.5 py-1.5 bg-[#174C80] hover:bg-[#2065AA] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Unduh Formulir Pendaftaran PDF"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D5AA53]" />
              ) : (
                <Download className="w-3.5 h-3.5 text-[#D5AA53]" />
              )}
              <span>{isDownloadingPdf ? 'Mengunduh...' : 'Unduh Formulir PDF'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#D5AA53] hover:bg-[#c49942] text-stone-900 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Cetak Formulir Pendaftaran"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Formulir</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white font-bold transition-all cursor-pointer shadow-xs focus:ring-2 focus:ring-white shrink-0"
              title="Tutup Jendela (Esc)"
              aria-label="Tutup jendela pratinjau"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-8 bg-[#F7F8F5]">
          {/* TAB 1: Official Printable Document (PDF Layout) */}
          {activeTab === 'preview' && (
            <div className="overflow-x-auto pb-6">
              <div
                id="spmb-printable-receipt"
                style={{ transform: `scale(${zoomScale})`, transformOrigin: 'top center', transition: 'transform 0.15s ease' }}
                className="bg-white rounded-2xl border border-stone-300 p-5 sm:p-8 shadow-sm text-stone-900 font-sans text-xs min-w-[560px] sm:min-w-0 mx-auto"
              >
              {/* Kop Surat Resmi */}
              <div className="flex items-center gap-4 pb-4 border-b-2 border-stone-800 mb-6">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo Sekolah"
                    className="w-16 h-16 object-contain rounded-xl p-1 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-[#123B35] flex items-center justify-center text-white shrink-0 shadow-xs">
                    <span className="font-serif font-black text-xl text-[#D5AA53]">IC</span>
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-extrabold uppercase tracking-tight text-[#123B35]">
                    {schoolProfile.name}
                  </h2>
                  <p className="text-xs font-bold text-[#174C80] uppercase tracking-wider">
                    Yayasan Bina Insan Cendikia Kalibaru · NPSN: {schoolProfile.npsn} · Terakreditasi {schoolProfile.accreditation}
                  </p>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    {schoolProfile.address}, Kec. {schoolProfile.district}, {schoolProfile.regency}, {schoolProfile.province} {schoolProfile.postalCode}
                  </p>
                  <p className="text-[11px] text-stone-500 font-mono">
                    Telp/WA: {schoolProfile.whatsapp} · Email: {schoolProfile.email} · Web: sditinsancendikia-kalibaru.sch.id
                  </p>
                </div>
              </div>

              {/* Title Header */}
              <div className="text-center my-4 pb-2 border-b border-stone-200">
                <h3 className="text-sm font-black uppercase tracking-wider text-stone-900">
                  FORMULIR PENDAFTARAN RESMI SPMB
                </h3>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Tahun Ajaran 2027/2028 · Dicetak Resmi oleh Sistem Informasi Sekolah pada: {formatDateId(new Date().toISOString())}
                </p>
              </div>

              {/* Identification Block */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200 mb-5">
                <div>
                  <span className="text-stone-500 block text-[10px] uppercase">Nomor Pendaftaran:</span>
                  <span className="font-mono font-bold text-[#123B35] text-sm">{registration.registrationNumber}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px] uppercase">Tanggal Daftar:</span>
                  <span className="font-medium">{formatDateId(registration.submittedAt)}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px] uppercase">Gelombang:</span>
                  <span className="font-medium">{registration.waveName || 'Gelombang 1'}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px] uppercase">Status Berkas:</span>
                  <span className="font-bold text-emerald-800">{registration.status}</span>
                </div>
              </div>

              {/* SECTION A: BIODATA CALON SISWA */}
              <div className="mb-5">
                <h4 className="font-bold text-[#123B35] text-xs uppercase tracking-wider mb-2 pb-1 border-b border-stone-200 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>A. Identitas Calon Siswa Baru</span>
                </h4>
                <table className="w-full text-left text-[11px] border border-stone-200">
                  <tbody className="divide-y divide-stone-100">
                    <tr className="bg-stone-50/50">
                      <td className="p-2 font-semibold text-stone-600 w-1/3">Nama Lengkap Sesuai Akta</td>
                      <td className="p-2 font-bold text-stone-900">{student.fullName}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold text-stone-600">Nama Panggilan</td>
                      <td className="p-2">{student.nickname || '-'}</td>
                    </tr>
                    <tr className="bg-stone-50/50">
                      <td className="p-2 font-semibold text-stone-600">Jenis Kelamin / Gol. Darah</td>
                      <td className="p-2">{student.gender} / Gol. {student.bloodType || 'A'}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold text-stone-600">Tempat, Tanggal Lahir</td>
                      <td className="p-2 font-medium">{student.birthPlace}, {formatDateId(student.birthDate)}</td>
                    </tr>
                    <tr className="bg-stone-50/50">
                      <td className="p-2 font-semibold text-stone-600">NIK Calon Siswa (16 Digit)</td>
                      <td className="p-2 font-mono font-bold text-[#123B35]">{student.nik}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold text-stone-600">Urutan & Jumlah Saudara</td>
                      <td className="p-2">
                        Anak ke-<span className="font-bold">{student.childNumber ?? 1}</span> dari <span className="font-bold">{student.totalSiblings ?? 0}</span> bersaudara
                      </td>
                    </tr>
                    <tr className="bg-stone-50/50">
                      <td className="p-2 font-semibold text-stone-600">Status Anak</td>
                      <td className="p-2 font-semibold">
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[10px]">
                          {student.childStatus || 'Tidak termasuk ketiganya'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold text-stone-600">Kebutuhan Khusus (ABK)</td>
                      <td className="p-2">
                        {student.hasSpecialNeeds ? (
                          <span className="text-amber-800 font-semibold">
                            Ya - {student.specialNeedsDescription || 'Ada kebutuhan khusus'}
                          </span>
                        ) : (
                          <span className="text-stone-600">Tidak Berkebutuhan Khusus</span>
                        )}
                      </td>
                    </tr>
                    <tr className="bg-stone-50/50">
                      <td className="p-2 font-semibold text-stone-600">Hobi & Cita-cita</td>
                      <td className="p-2">{student.hobby || '-'} / {student.ambition || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* SECTION B: DATA ORANG TUA / WALI */}
              <div className="mb-5">
                <h4 className="font-bold text-[#123B35] text-xs uppercase tracking-wider mb-2 pb-1 border-b border-stone-200 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>B. Identitas Orang Tua / Wali</span>
                </h4>
                <table className="w-full text-left text-[11px] border border-stone-200">
                  <thead className="bg-[#F7F8F5] text-stone-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2">Keterangan</th>
                      <th className="p-2">Data Ayah Kandung</th>
                      <th className="p-2">Data Ibu Kandung</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    <tr className="bg-stone-50/50">
                      <td className="p-2 font-semibold text-stone-600">Status Keberadaan</td>
                      <td className="p-2 font-medium">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          parent.fatherStatus === 'Meninggal Dunia' ? 'bg-stone-200 text-stone-700' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          {parent.fatherStatus || 'Masih Hidup'}
                        </span>
                      </td>
                      <td className="p-2 font-medium">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          parent.motherStatus === 'Meninggal Dunia' ? 'bg-stone-200 text-stone-700' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          {parent.motherStatus || 'Masih Hidup'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold text-stone-600">Nama Lengkap</td>
                      <td className="p-2 font-bold text-stone-900">{parent.fatherName || '-'}</td>
                      <td className="p-2 font-bold text-stone-900">{parent.motherName || '-'}</td>
                    </tr>
                    <tr className="bg-stone-50/50">
                      <td className="p-2 font-semibold text-stone-600">NIK (16 Digit)</td>
                      <td className="p-2 font-mono">{parent.fatherNik || '-'}</td>
                      <td className="p-2 font-mono">{parent.motherNik || '-'}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold text-stone-600">No. WhatsApp / HP</td>
                      <td className="p-2 font-mono font-medium">{parent.fatherPhone || '-'}</td>
                      <td className="p-2 font-mono font-medium">{parent.motherPhone || '-'}</td>
                    </tr>
                    <tr className="bg-stone-50/50">
                      <td className="p-2 font-semibold text-stone-600">Pekerjaan</td>
                      <td className="p-2">{parent.fatherJob || '-'}</td>
                      <td className="p-2">{parent.motherJob || '-'}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold text-stone-600">Pendidikan Terakhir</td>
                      <td className="p-2">{parent.fatherEducation || '-'}</td>
                      <td className="p-2">{parent.motherEducation || '-'}</td>
                    </tr>
                    <tr className="bg-stone-50/50">
                      <td className="p-2 font-semibold text-stone-600">Rentang Penghasilan Bulanan</td>
                      <td className="p-2 font-semibold text-emerald-800">{parent.fatherIncome || '-'}</td>
                      <td className="p-2 font-semibold text-emerald-800">{parent.motherIncome || '-'}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Data Wali Jika Ada */}
                {parent.hasGuardian && (
                  <div className="mt-3 p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-[11px] space-y-1.5">
                    <span className="font-bold text-amber-900 uppercase text-[10px] block">
                      Data Wali Murid (Pengasuh Utama)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div>
                        <span className="text-stone-500 block text-[10px]">Hubungan:</span>
                        <span className="font-semibold">{parent.guardianRelation || 'Wali'}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">Nama Wali:</span>
                        <span className="font-bold text-stone-900">{parent.guardianName || '-'}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">NIK Wali:</span>
                        <span className="font-mono">{parent.guardianNik || '-'}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">Pekerjaan & Pendidikan:</span>
                        <span>{parent.guardianJob || '-'} ({parent.guardianEducation || '-'})</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">Penghasilan Bulanan:</span>
                        <span className="font-semibold text-emerald-800">{parent.guardianIncome || '-'}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">No. WhatsApp:</span>
                        <span className="font-mono font-bold">{parent.guardianPhone || '-'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION C: DATA TEMPAT TINGGAL CALON SISWA */}
              {(() => {
                const res = registration.residence || student.residence;
                const livingWith = res?.livingWith === 'Lainnya' && res?.livingWithOtherNote ? `Lainnya: ${res.livingWithOtherNote}` : (res?.livingWith || 'Ayah dan Ibu');
                const houseStatus = res?.houseStatus === 'Lainnya' && res?.houseStatusOtherNote ? `Lainnya: ${res.houseStatusOtherNote}` : (res?.houseStatus || 'Hak Milik');
                const vehicleCount = res?.vehicleCount !== undefined ? res.vehicleCount : 1;
                const address = res?.currentAddress || student.address;
                const rtRw = res?.rtRw || student.rtRw || '01/01';
                const village = res?.village || student.village;
                const district = res?.district || student.district;
                const regency = res?.regency || student.regency;
                const province = res?.province || student.province || 'Jawa Timur';

                return (
                  <div className="mb-5">
                    <h4 className="font-bold text-[#123B35] text-xs uppercase tracking-wider mb-2 pb-1 border-b border-stone-200 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>C. Data Tempat Tinggal Calon Siswa</span>
                    </h4>
                    <table className="w-full text-left text-[11px] border border-stone-200">
                      <tbody className="divide-y divide-stone-100">
                        <tr className="bg-stone-50/50">
                          <td className="p-2 font-semibold text-stone-600 w-1/3">Bertempat Tinggal Dengan</td>
                          <td className="p-2 font-bold text-stone-900">{livingWith}</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-semibold text-stone-600">Alamat Tempat Tinggal Saat Ini</td>
                          <td className="p-2 font-medium">{address}</td>
                        </tr>
                        <tr className="bg-stone-50/50">
                          <td className="p-2 font-semibold text-stone-600">Wilayah Administratif</td>
                          <td className="p-2">RT/RW {rtRw}, Desa/Kel. {village}, Kec. {district}, {regency}, Prov. {province}</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-semibold text-stone-600">Status Kepemilikan Rumah</td>
                          <td className="p-2">
                            <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-800 font-semibold border border-stone-200 text-[10px]">
                              {houseStatus}
                            </span>
                          </td>
                        </tr>
                        <tr className="bg-stone-50/50">
                          <td className="p-2 font-semibold text-stone-600">Jumlah Kepemilikan Kendaraan</td>
                          <td className="p-2 font-bold text-stone-900">{vehicleCount} Unit (Motor / Mobil)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              })()}

              {/* SECTION D: PENDIDIKAN SEBELUMNYA */}
              <div className="mb-5">
                <h4 className="font-bold text-[#123B35] text-xs uppercase tracking-wider mb-2 pb-1 border-b border-stone-200 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>D. Pendidikan Sebelumnya (TK / RA / PAUD)</span>
                </h4>
                <table className="w-full text-left text-[11px] border border-stone-200">
                  <tbody className="divide-y divide-stone-100">
                    <tr>
                      <td className="p-2 font-semibold text-stone-600 w-1/3">Nama Sekolah Asal</td>
                      <td className="p-2 font-bold text-stone-900">{student.previousSchool || 'TK Bina Mandiri Kalibaru'}</td>
                    </tr>
                    <tr className="bg-stone-50/50">
                      <td className="p-2 font-semibold text-stone-600">Alamat Sekolah Asal</td>
                      <td className="p-2">{student.previousSchoolAddress || 'Kecamatan Kalibaru, Kabupaten Banyuwangi'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* SECTION E: STATUS KELENGKAPAN BERKAS & CHECKLIST TAHAPAN */}
              <div className="mb-6">
                <h4 className="font-bold text-[#123B35] text-xs uppercase tracking-wider mb-2 pb-1 border-b border-stone-200 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>E. Ringkasan Kelengkapan Berkas & Progres Tahapan SPMB</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                    <span className="font-bold text-stone-800 block">Daftar Dokumen Terunggah:</span>
                    <ul className="space-y-1">
                      {registration.documents?.map(doc => (
                        <li key={doc.id} className="flex items-center justify-between">
                          <span className="text-stone-700">{doc.label}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            doc.needsRevision ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {doc.needsRevision ? 'Perlu Revisi' : 'Sah / Terunggah'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                    <span className="font-bold text-stone-800 block">Perkembangan Tahapan Peserta:</span>
                    <ul className="space-y-1">
                      {stages.slice(0, 5).map(st => (
                        <li key={st.stageId} className="flex items-center justify-between">
                          <span className="text-stone-700">{st.title}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            st.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : st.status === 'action_needed'
                              ? 'bg-rose-100 text-rose-800'
                              : st.status === 'in_progress'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-stone-200 text-stone-600'
                          }`}>
                            {st.status === 'completed' ? 'Selesai' : st.status === 'action_needed' ? 'Perlu Tindakan' : st.status === 'in_progress' ? 'Proses' : 'Menunggu'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* SECTION F: BIAYA PENDAFTARAN & STATUS PEMBAYARAN */}
              {(() => {
                const proof = registration.paymentProof || registration.reRegistration?.paymentProof;
                return (
                  <div className="mb-6">
                    <h4 className="font-bold text-[#123B35] text-xs uppercase tracking-wider mb-2 pb-1 border-b border-stone-200 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>F. Administrasi Pendaftaran & Bukti Pembayaran (Rp 50.000,-)</span>
                    </h4>
                    <table className="w-full text-left text-[11px] border border-stone-200">
                      <tbody className="divide-y divide-stone-100">
                        <tr className="bg-stone-50/50">
                          <td className="p-2 font-semibold text-stone-600 w-1/3">Biaya Pendaftaran Resmi</td>
                          <td className="p-2 font-bold font-mono text-emerald-800">Rp 50.000,- (Tepat Lima Puluh Ribu Rupiah)</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-semibold text-stone-600">Rekening Tujuan / Saluran</td>
                          <td className="p-2 font-medium">Bank Jatim No. Rek: 1592015532 a.n. SDIT INSAN CENDEKIA PPDB</td>
                        </tr>
                        <tr className="bg-stone-50/50">
                          <td className="p-2 font-semibold text-stone-600">Metode & Tanggal Bayar</td>
                          <td className="p-2">{proof?.method || 'Transfer Bank Jatim'} {proof?.paymentDate ? `· Tanggal: ${proof.paymentDate}` : ''}</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-semibold text-stone-600">Nama Penyetor / Pengirim</td>
                          <td className="p-2 font-medium">{proof?.senderName || parent.fatherName || parent.motherName || '-'}</td>
                        </tr>
                        <tr className="bg-stone-50/50">
                          <td className="p-2 font-semibold text-stone-600">Status Pembayaran</td>
                          <td className="p-2">
                            <span className={`px-2.5 py-0.5 rounded font-bold text-[10px] uppercase ${
                              proof?.status === 'Disetujui'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : proof?.status === 'Menunggu Verifikasi'
                                ? 'bg-sky-100 text-sky-900 border border-sky-300'
                                : proof?.status === 'Perlu Upload Ulang'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-rose-100 text-rose-900 border border-rose-300'
                            }`}>
                              {proof?.status || 'Belum Upload / Menunggu Konfirmasi'}
                            </span>
                          </td>
                        </tr>
                        {proof?.fileUrl && (
                          <tr>
                            <td className="p-2 font-semibold text-stone-600">Lampiran Bukti Bayar</td>
                            <td className="p-2">
                              <a
                                href={proof.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-bold hover:underline"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Lihat Berkas Struk Transfer / Kuitansi Tunai</span>
                              </a>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                );
              })()}

              {/* Tanda Tangan / Lembar Pengesahan */}
              <div className="pt-6 border-t border-stone-300 mt-6 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <p className="text-stone-500">Orang Tua / Wali Calon Siswa,</p>
                  <div className="h-16 flex items-center justify-center">
                    <span className="italic text-stone-400 text-[10px]">(Tanda Tangan)</span>
                  </div>
                  <p className="font-bold text-stone-900 border-t border-stone-400 pt-1 inline-block min-w-[180px]">
                    {parent.fatherName || parent.motherName}
                  </p>
                </div>

                <div>
                  <p className="text-stone-500">Kalibaru, {formatDateId(new Date().toISOString())}<br />Panitia Penerimaan Murid Baru,</p>
                  <div className="h-16 flex items-center justify-center">
                    <div className="border border-emerald-800 text-emerald-900 px-3 py-1 rounded-md font-serif text-[10px] font-bold tracking-widest uppercase rotate-[-3deg]">
                      VERIFIKASI RESMI SPMB
                    </div>
                  </div>
                  <p className="font-bold text-stone-900 border-t border-stone-400 pt-1 inline-block min-w-[180px]">
                    ( {schoolProfile.spmbChairmanName || 'Tasyantik Salsabilla, S.Pd.'} )
                  </p>
                  <p className="text-[10px] text-stone-500">Ketua Panitia SPMB</p>
                </div>
              </div>
            </div>
            </div>
          )}

          {/* TAB 2: Interactive 9-Stage Checklist for this Individual Applicant */}
          {activeTab === 'stages' && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                    Tier 2 · Checklist Tahapan Individual Peserta
                  </span>
                  <h3 className="font-bold text-base text-stone-900">
                    Progres Penerimaan Siswa: {student.fullName}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Ubah status tahapan khusus untuk calon siswa ini. Perubahan akan langsung terlihat oleh orang tua pada menu Cek Status.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isSavingStages}
                  onClick={handleSaveStages}
                  className="px-5 py-2.5 bg-[#123B35] hover:bg-[#1a544b] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer text-xs"
                >
                  <Save className="w-4 h-4 text-[#D5AA53]" />
                  <span>{isSavingStages ? 'Menyimpan...' : 'Simpan Perkembangan'}</span>
                </button>
              </div>

              {stageSaveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Perkembangan tahapan calon siswa berhasil diperbarui!</span>
                </div>
              )}

              <div className="space-y-3">
                {stages.map(st => (
                  <div
                    key={st.stageId}
                    className={`p-4 rounded-xl border text-xs space-y-3 transition-colors ${
                      st.status === 'completed'
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : st.status === 'action_needed'
                        ? 'bg-rose-50/50 border-rose-200'
                        : st.status === 'in_progress'
                        ? 'bg-sky-50/50 border-sky-200'
                        : 'bg-white border-stone-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-700 font-mono font-bold flex items-center justify-center text-xs">
                          {st.order}
                        </span>
                        <span className="font-bold text-stone-900 text-sm">{st.title}</span>
                      </div>

                      {/* Status Selector Pills */}
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateStageStatus(st.stageId, 'completed')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                            st.status === 'completed'
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          [✓] Selesai
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStageStatus(st.stageId, 'in_progress')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                            st.status === 'in_progress'
                              ? 'bg-sky-600 text-white shadow-xs'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          [●] Sedang Proses
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStageStatus(st.stageId, 'action_needed')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                            st.status === 'action_needed'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          [!] Perlu Perbaikan
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStageStatus(st.stageId, 'waiting')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                            st.status === 'waiting'
                              ? 'bg-stone-700 text-white shadow-xs'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          [○] Menunggu
                        </button>
                      </div>
                    </div>

                    {/* Notes Field */}
                    <div>
                      <input
                        type="text"
                        value={st.notes || ''}
                        onChange={e => handleUpdateStageNotes(st.stageId, e.target.value)}
                        placeholder="Catatan dari panitia untuk orang tua pada tahapan ini..."
                        className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-[#123B35] focus:outline-hidden"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Uploaded Documents with revision notes */}
          {activeTab === 'documents' && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-stone-900 pb-2 border-b border-stone-100">
                Dokumen Persyaratan Calon Siswa
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {registration.documents?.map(doc => (
                  <div key={doc.id} className="p-4 rounded-xl border border-stone-200 bg-[#F7F8F5] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-stone-900">{doc.label}</h5>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        doc.needsRevision ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {doc.needsRevision ? 'Perlu Perbaikan' : 'Terverifikasi'}
                      </span>
                    </div>

                    <p className="text-stone-500 font-mono text-[11px]">
                      {doc.fileName} ({doc.fileSizeKb} KB)
                    </p>

                    {doc.fileUrl && (
                      <div className="pt-2">
                        {doc.fileUrl.startsWith('data:image') || doc.fileUrl.includes('images.unsplash.com') || doc.fileUrl.startsWith('/uploads') ? (
                          <img
                            src={doc.fileUrl}
                            alt={doc.label}
                            className="max-h-48 w-full object-contain rounded-lg bg-stone-900/10 p-1 border border-stone-200"
                          />
                        ) : (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-bold hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Buka Berkas Digital</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* BUKTI PEMBAYARAN BIAYA PENDAFTARAN (RP 50.000) */}
              {(() => {
                const proof = registration.paymentProof || registration.reRegistration?.paymentProof;
                return (
                  <div className="mt-6 p-5 rounded-2xl border-2 border-emerald-600/30 bg-emerald-50/20 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-900/10">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                          Biaya Pendaftaran SPMB · Rp 50.000,- (Wajib)
                        </span>
                        <h4 className="font-bold text-base text-stone-900 flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-emerald-700" />
                          <span>Verifikasi Bukti Pembayaran Pendaftaran</span>
                        </h4>
                      </div>
                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          proof?.status === 'Disetujui'
                            ? 'bg-emerald-600 text-white'
                            : proof?.status === 'Menunggu Verifikasi'
                            ? 'bg-sky-600 text-white'
                            : proof?.status === 'Perlu Upload Ulang'
                            ? 'bg-amber-600 text-white'
                            : 'bg-rose-600 text-white'
                        }`}>
                          {proof?.status || 'Belum Ada Bukti'}
                        </span>
                      </div>
                    </div>

                    {paymentActionMessage && (
                      <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-950 font-medium text-xs rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>{paymentActionMessage}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Info */}
                      <div className="space-y-2 text-xs">
                        <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-stone-500">Nominal Resmi:</span>
                            <span className="font-mono font-bold text-emerald-800">Rp 50.000,-</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-500">Rekening Tujuan:</span>
                            <span className="font-medium text-stone-800 text-right">Bank Jatim (1592015532)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-500">Metode Bayar:</span>
                            <span className="font-medium text-stone-800">{proof?.method || 'Transfer Bank'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-500">Tanggal Bayar:</span>
                            <span className="font-medium text-stone-800">{proof?.paymentDate || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-500">Nama Penyetor:</span>
                            <span className="font-medium text-stone-800">{proof?.senderName || '-'}</span>
                          </div>
                          {proof?.adminNotes && (
                            <div className="pt-2 border-t border-stone-100 text-[11px]">
                              <span className="text-stone-500 block">Catatan Verifikator:</span>
                              <span className="text-amber-800 font-medium italic">{proof.adminNotes}</span>
                            </div>
                          )}
                        </div>

                        {/* Admin Action Box */}
                        <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-2">
                          <label className="text-[11px] font-bold text-stone-700 block">
                            Catatan Panitia untuk Wali Murid:
                          </label>
                          <input
                            type="text"
                            value={paymentAdminNotes}
                            onChange={(e) => setPaymentAdminNotes(e.target.value)}
                            placeholder="Contoh: Bukti transfer valid & dana telah masuk rekening."
                            className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-[#123B35] focus:outline-hidden"
                          />
                          <div className="flex flex-wrap gap-2 pt-1">
                            <button
                              type="button"
                              disabled={isVerifyingPayment}
                              onClick={() => handleVerifyPayment('Disetujui')}
                              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Setujui (Lolos)</span>
                            </button>
                            <button
                              type="button"
                              disabled={isVerifyingPayment}
                              onClick={() => handleVerifyPayment('Perlu Upload Ulang')}
                              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs transition-colors disabled:opacity-50"
                            >
                              <span>Minta Upload Ulang</span>
                            </button>
                            <button
                              type="button"
                              disabled={isVerifyingPayment}
                              onClick={() => handleVerifyPayment('Ditolak')}
                              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs transition-colors disabled:opacity-50"
                            >
                              <span>Tolak</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right: Preview */}
                      <div className="p-3 bg-white rounded-xl border border-stone-200 flex flex-col items-center justify-center min-h-[200px]">
                        {proof?.fileUrl ? (
                          <div className="w-full text-center space-y-2">
                            {proof.fileUrl.startsWith('data:image') || proof.fileUrl.includes('images.unsplash.com') || proof.fileUrl.startsWith('/uploads') ? (
                              <img
                                src={proof.fileUrl}
                                alt="Bukti Pembayaran"
                                className="max-h-56 max-w-full mx-auto object-contain rounded-lg border border-stone-200 shadow-2xs"
                              />
                            ) : (
                              <div className="py-8">
                                <CreditCard className="w-12 h-12 text-stone-400 mx-auto mb-2" />
                                <p className="text-xs text-stone-600 font-semibold">{proof.fileName || 'Berkas Pembayaran'}</p>
                              </div>
                            )}
                            <a
                              href={proof.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-bold hover:underline"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Buka File Bukti Ukuran Penuh</span>
                            </a>
                          </div>
                        ) : (
                          <div className="text-center text-stone-400 py-6">
                            <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p className="text-xs font-medium">Belum ada file bukti pembayaran yang diunggah.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Bottom Sticky Action Bar */}
        <div className="no-print p-3 sm:p-4 px-6 bg-white border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
          <div className="text-stone-500 text-[11px] hidden sm:block">
            Tekan <kbd className="px-1.5 py-0.5 rounded bg-stone-100 border border-stone-300 font-mono text-[10px]">Esc</kbd> atau klik di luar jendela untuk menutup
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-50 font-semibold text-xs cursor-pointer transition-colors"
            >
              Tutup & Kembali
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="px-4 py-2 bg-[#123B35] hover:bg-[#1a544b] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Download className="w-4 h-4 text-[#D5AA53]" />
              <span>{isDownloadingPdf ? 'Memproses PDF...' : 'Download File PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
