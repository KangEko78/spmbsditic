/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Registration, User, ReRegistrationStatus, PaymentStatus } from '../../../types';
import { api } from '../../../lib/api';
import { formatDateId } from '../../../lib/utils';
import {
  CheckCircle,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  Lock,
  Building2,
  FileCheck2,
  HelpCircle,
  CreditCard,
  Eye,
  Download,
  X,
  Check,
  Ban,
  RotateCcw,
  FileText
} from 'lucide-react';

interface ReRegistrationModuleProps {
  registrations: Registration[];
  onRefresh: () => void;
  currentUser?: User | null;
}

export const ReRegistrationModule: React.FC<ReRegistrationModuleProps> = ({
  registrations,
  onRefresh,
  currentUser
}) => {
  // Eligible candidates: Diterima or in daftar ulang process
  const acceptedOrReRegistered = registrations.filter(
    r => r.status === 'Diterima' || r.status === 'Menunggu Daftar Ulang' || r.status === 'Selesai Daftar Ulang'
  );

  const [selectedReg, setSelectedReg] = useState<Registration | null>(acceptedOrReRegistered[0] || null);
  const [selectedStatus, setSelectedStatus] = useState<ReRegistrationStatus>(
    (selectedReg?.reRegistration?.status as ReRegistrationStatus) || 'Menunggu Persetujuan'
  );
  const [adminNotes, setAdminNotes] = useState(selectedReg?.reRegistration?.adminNotes || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Payment proof modal & preview state
  const [paymentActionModal, setPaymentActionModal] = useState<{
    targetStatus: 'Disetujui' | 'Ditolak' | 'Perlu Upload Ulang';
    notes: string;
  } | null>(null);
  const [viewingProofUrl, setViewingProofUrl] = useState<{ url: string; fileName?: string } | null>(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  // Strictly check if current user is Admin Sekolah or Super Admin
  const userRole = currentUser?.role || 'admin_sekolah';
  const canApprove = userRole === 'admin_sekolah' || userRole === 'super_admin';

  // Stats KPI
  const stats = {
    totalAccepted: acceptedOrReRegistered.length,
    waiting: acceptedOrReRegistered.filter(r => (r.reRegistration?.status || 'Menunggu Persetujuan') === 'Menunggu Persetujuan').length,
    approved: acceptedOrReRegistered.filter(r => r.reRegistration?.status === 'Disetujui Admin Sekolah').length,
    completed: acceptedOrReRegistered.filter(r => r.status === 'Selesai Daftar Ulang' || r.reRegistration?.status === 'Selesai Daftar Ulang').length
  };

  const handleProcessApproval = async (statusToSet: ReRegistrationStatus) => {
    if (!selectedReg) return;
    if (!canApprove) {
      alert('Akses Ditolak: Persetujuan akhir daftar ulang hanya memiliki wewenang resmi oleh Admin Sekolah.');
      return;
    }

    const paymentProof = selectedReg.paymentProof || selectedReg.reRegistration?.paymentProof;
    if ((statusToSet === 'Disetujui Admin Sekolah' || statusToSet === 'Selesai Daftar Ulang') && paymentProof?.status !== 'Disetujui') {
      alert('Peringatan: Bukti pembayaran daftar ulang harus diverifikasi dan berstatus "Disetujui" terlebih dahulu sebelum memberikan persetujuan final.');
      return;
    }

    setIsProcessing(true);
    setFeedback(null);
    try {
      const res = await api.approveReRegistration(selectedReg.id, {
        approverRole: userRole,
        approverName: currentUser?.name || 'Admin Sekolah',
        status: statusToSet,
        adminNotes: adminNotes.trim() || undefined
      });

      setFeedback({
        type: 'success',
        message: res.message || `Status pendaftaran ${selectedReg.student.fullName} berhasil diperbarui menjadi ${statusToSet}.`
      });

      // Update local selectedReg
      setSelectedReg(res.registration);
      setSelectedStatus(statusToSet);
      onRefresh();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Gagal memproses persetujuan daftar ulang.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecutePaymentVerification = async () => {
    if (!selectedReg || !paymentActionModal) return;
    setIsVerifyingPayment(true);
    setFeedback(null);
    try {
      const res = await api.verifyPaymentProof(selectedReg.id, {
        status: paymentActionModal.targetStatus,
        adminNotes: paymentActionModal.notes.trim() || undefined,
        verifierName: currentUser?.name || 'Admin Sekolah',
        verifierRole: userRole
      });

      setFeedback({
        type: 'success',
        message: `Status bukti pembayaran berhasil diubah menjadi: ${paymentActionModal.targetStatus}.`
      });

      setSelectedReg(res.registration);
      setPaymentActionModal(null);
      onRefresh();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Gagal memverifikasi bukti pembayaran.'
      });
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  const statusBadges: Record<ReRegistrationStatus, { label: string; color: string }> = {
    'Belum Daftar Ulang': { label: 'Belum Daftar Ulang', color: 'bg-stone-100 text-stone-700 border-stone-200' },
    'Menunggu Persetujuan': { label: 'Menunggu Persetujuan', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    'Perlu Perbaikan': { label: 'Perlu Perbaikan', color: 'bg-rose-100 text-rose-900 border-rose-300' },
    'Disetujui Admin Sekolah': { label: 'Disetujui Admin Sekolah', color: 'bg-sky-100 text-sky-900 border-sky-300 font-bold' },
    'Selesai Daftar Ulang': { label: 'Selesai Daftar Ulang', color: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold' }
  };

  return (
    <div className="space-y-6 text-xs text-stone-800">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider block">
            Wewenang Khusus: Admin Sekolah
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mt-0.5 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#123B35]" />
            <span>Persetujuan & Validasi Daftar Ulang Siswa Baru</span>
          </h2>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
            Tahap final penerimaan murid baru. Admin Sekolah memverifikasi bukti pembayaran infaq pengembangan, berkas asli kependudukan, dan memberikan persetujuan resmi status murid aktif.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canApprove ? (
            <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1.5 border border-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Hak Akses Persetujuan Aktif ({userRole})</span>
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 text-xs font-bold flex items-center gap-1.5 border border-stone-300">
              <Lock className="w-4 h-4 text-stone-500" />
              <span>Hanya Dapat Dilihat (Peran: {userRole})</span>
            </span>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-700 shrink-0" />
          )}
          <span className="font-semibold">{feedback.message}</span>
        </div>
      )}

      {/* KPI Cards (No uniform counters) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="text-stone-500 mb-1 text-xs">Total Calon Lulus</div>
          <p className="text-2xl font-black font-mono text-stone-900">{stats.totalAccepted}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="text-stone-500 mb-1 text-xs">Menunggu Persetujuan</div>
          <p className="text-2xl font-black font-mono text-amber-700">{stats.waiting}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="text-stone-500 mb-1 text-xs">Disetujui Admin Sekolah</div>
          <p className="text-2xl font-black font-mono text-sky-700">{stats.approved}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="text-stone-500 mb-1 text-xs">Selesai Daftar Ulang</div>
          <p className="text-2xl font-black font-mono text-emerald-700">{stats.completed}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Applicant List */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-stone-200 p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between px-2 mb-2">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Calon Siswa ({acceptedOrReRegistered.length})
            </h4>
          </div>

          <div className="space-y-1.5 max-h-[620px] overflow-y-auto pr-1">
            {acceptedOrReRegistered.map(reg => {
              const isSelected = selectedReg?.id === reg.id;
              const currentStatus: ReRegistrationStatus =
                (reg.reRegistration?.status as ReRegistrationStatus) ||
                (reg.status === 'Selesai Daftar Ulang' ? 'Selesai Daftar Ulang' : 'Menunggu Persetujuan');
              const badge = statusBadges[currentStatus] || statusBadges['Menunggu Persetujuan'];

              return (
                <div
                  key={reg.id}
                  onClick={() => {
                    setSelectedReg(reg);
                    setSelectedStatus(currentStatus);
                    setAdminNotes(reg.reRegistration?.adminNotes || '');
                  }}
                  className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-700 shadow-xs ring-1 ring-emerald-600'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono font-bold text-[#123B35]">
                      {reg.registrationNumber}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="font-bold text-stone-900 text-xs sm:text-sm">{reg.student.fullName}</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Wali: {reg.parent.fatherName || reg.parent.motherName} ({reg.parent.fatherPhone})
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Administrative Approval Panel */}
        {selectedReg ? (
          <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-6 text-xs">
            {/* Candidate Header */}
            <div className="border-b border-stone-100 pb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-mono font-bold text-[#123B35] text-xs">
                  {selectedReg.registrationNumber}
                </span>
                <h3 className="text-xl font-bold text-stone-900 mt-0.5">
                  {selectedReg.student.fullName}
                </h3>
                <p className="text-stone-500 text-[11px] mt-0.5">
                  NIK: <span className="font-mono">{selectedReg.student.nik}</span> · Asal Sekolah: {selectedReg.student.previousSchool || 'TK Bina Mandiri'}
                </p>
              </div>

              <div>
                {(() => {
                  const currStatus: ReRegistrationStatus =
                    (selectedReg.reRegistration?.status as ReRegistrationStatus) ||
                    (selectedReg.status === 'Selesai Daftar Ulang' ? 'Selesai Daftar Ulang' : 'Menunggu Persetujuan');
                  const badge = statusBadges[currStatus] || statusBadges['Menunggu Persetujuan'];
                  return (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
                      Status: {badge.label}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Approval Info Block if already approved */}
            {selectedReg.reRegistration?.approvedBy && (
              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Persetujuan Terverifikasi:</span>
                  <p className="text-[11px] leading-relaxed">
                    Disetujui oleh <strong>{selectedReg.reRegistration.approvedBy}</strong> pada{' '}
                    {selectedReg.reRegistration.approvedAt ? formatDateId(selectedReg.reRegistration.approvedAt) : 'Hari ini'}.
                  </p>
                </div>
              </div>
            )}

            {/* SECTION: Verifikasi Bukti Pembayaran Daftar Ulang (Rp 50.000) */}
            {(() => {
              const proof = selectedReg.paymentProof || selectedReg.reRegistration?.paymentProof;
              const isPaymentApproved = proof?.status === 'Disetujui';

              const paymentBadgeMap: Record<PaymentStatus, { label: string; color: string }> = {
                'Belum Upload': { label: 'Belum Upload Bukti', color: 'bg-stone-100 text-stone-700 border-stone-300' },
                'Menunggu Verifikasi': { label: 'Menunggu Verifikasi Admin', color: 'bg-sky-100 text-sky-900 border-sky-300 font-bold' },
                'Disetujui': { label: 'Pembayaran Disetujui (Lunas)', color: 'bg-emerald-100 text-emerald-950 border-emerald-400 font-bold' },
                'Ditolak': { label: 'Pembayaran Ditolak', color: 'bg-rose-100 text-rose-950 border-rose-400 font-bold' },
                'Perlu Upload Ulang': { label: 'Perlu Upload Ulang Bukti', color: 'bg-amber-100 text-amber-950 border-amber-400 font-bold' }
              };

              const currentProofStatus = proof?.status || 'Belum Upload';
              const pBadge = paymentBadgeMap[currentProofStatus];

              return (
                <div className="p-4 rounded-2xl bg-[#F7F8F5] border-2 border-stone-200 space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-2.5">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#D5AA53]" />
                      <span className="font-bold text-stone-900 text-xs uppercase tracking-wide">
                        Bukti Pembayaran Daftar Ulang (Rp 50.000)
                      </span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] border ${pBadge.color}`}>
                      {pBadge.label}
                    </span>
                  </div>

                  {proof ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
                        <div className="p-2.5 bg-white rounded-xl border border-stone-200">
                          <span className="text-stone-400 block text-[10px]">Metode Pembayaran</span>
                          <strong className="text-stone-800">{proof.method}</strong>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl border border-stone-200">
                          <span className="text-stone-400 block text-[10px]">Tanggal Bayar</span>
                          <strong className="text-stone-800">{proof.paymentDate}</strong>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl border border-stone-200">
                          <span className="text-stone-400 block text-[10px]">Nominal Transfer/Tunai</span>
                          <strong className="text-emerald-700 font-mono">Rp 50.000,-</strong>
                        </div>
                        <div className="p-2.5 bg-white rounded-xl border border-stone-200">
                          <span className="text-stone-400 block text-[10px]">Penyetor / Pengirim</span>
                          <strong className="text-stone-800">{proof.senderName}</strong>
                        </div>
                      </div>

                      {/* File preview and verification actions */}
                      <div className="p-3 bg-white rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-stone-900 block truncate max-w-xs sm:max-w-md">
                              {proof.fileName || 'Bukti_Pembayaran_Daftar_Ulang'}
                            </span>
                            <span className="text-[10px] text-stone-400">
                              Diunggah: {proof.uploadedAt ? formatDateId(proof.uploadedAt) : '-'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setViewingProofUrl({ url: proof.fileUrl, fileName: proof.fileName })}
                            className="px-3 py-1.5 bg-[#123B35] hover:bg-[#1a544b] text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#D5AA53]" />
                            <span>Lihat Bukti</span>
                          </button>

                          <a
                            href={proof.fileUrl}
                            download={proof.fileName || `Bukti_Bayar_${selectedReg.registrationNumber}.jpg`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Unduh</span>
                          </a>
                        </div>
                      </div>

                      {proof.adminNotes && (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                          <strong>Catatan Verifikasi Pembayaran:</strong> {proof.adminNotes}
                        </div>
                      )}

                      {/* Payment Verification Buttons */}
                      <div className="pt-2 border-t border-stone-200 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold text-stone-600 mr-1">Tindakan Bukti:</span>
                        <button
                          type="button"
                          onClick={() => setPaymentActionModal({ targetStatus: 'Disetujui', notes: 'Bukti pembayaran sah dan tervalidasi masuk rekening sekolah.' })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                            isPaymentApproved
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{isPaymentApproved ? 'Sudah Disetujui' : 'Setujui Pembayaran'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentActionModal({ targetStatus: 'Perlu Upload Ulang', notes: 'Foto struk/kwitansi buram atau tidak terbaca. Harap foto ulang dengan jelas.' })}
                          className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                          <span>Minta Upload Ulang</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentActionModal({ targetStatus: 'Ditolak', notes: 'Nominal atau data rekening tidak sesuai dengan mutasi bank sekolah.' })}
                          className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Ban className="w-3.5 h-3.5 text-rose-700" />
                          <span>Tolak Pembayaran</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>
                        Wali murid belum mengunggah bukti pembayaran daftar ulang (Rp 50.000). Persetujuan akhir daftar ulang belum dapat diselesaikan sebelum bukti diverifikasi.
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Admin Notes Field */}
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                Catatan Keputusan Admin Sekolah (Dapat dilihat oleh orang tua di Cek Status):
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Administrasi daftar ulang telah lengkap dan diverifikasi resmi. Ananda resmi terdaftar sebagai siswa baru TA 2027/2028."
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                disabled={!canApprove || isProcessing}
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#123B35] disabled:bg-stone-100"
              />
            </div>

            {/* Action Buttons for Admin Sekolah */}
            {canApprove ? (
              <div className="pt-3 border-t border-stone-100 space-y-3">
                <span className="font-bold text-stone-800 block text-xs">
                  Tindakan Persetujuan Admin Sekolah:
                </span>

                {!(selectedReg.paymentProof?.status === 'Disetujui' || selectedReg.reRegistration?.paymentProof?.status === 'Disetujui') && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-[11px] flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Pemberitahuan: Bukti pembayaran daftar ulang harus diverifikasi dan disetujui terlebih dahulu sebelum tombol persetujuan final aktif.</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2.5">
                  {(() => {
                    const isPayApproved = selectedReg.paymentProof?.status === 'Disetujui' || selectedReg.reRegistration?.paymentProof?.status === 'Disetujui';
                    return (
                      <>
                        <button
                          type="button"
                          disabled={isProcessing || !isPayApproved}
                          onClick={() => handleProcessApproval('Disetujui Admin Sekolah')}
                          title={!isPayApproved ? 'Bukti pembayaran harus disetujui terlebih dahulu' : 'Setujui daftar ulang'}
                          className="px-4 py-2.5 bg-[#174C80] hover:bg-[#2065AA] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle className="w-4 h-4 text-[#D5AA53]" />
                          <span>Disetujui Admin Sekolah</span>
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing || !isPayApproved}
                          onClick={() => handleProcessApproval('Selesai Daftar Ulang')}
                          title={!isPayApproved ? 'Bukti pembayaran harus disetujui terlebih dahulu' : 'Selesaikan daftar ulang resmi'}
                          className="px-4 py-2.5 bg-[#123B35] hover:bg-[#1a544b] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Selesai Daftar Ulang (Resmi Murid Aktif)</span>
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleProcessApproval('Perlu Perbaikan')}
                          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <AlertCircle className="w-4 h-4" />
                          <span>Minta Perbaikan Administrasi</span>
                        </button>
                      </>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  Tombol persetujuan hanya dapat diakses saat login sebagai <strong>Admin Sekolah</strong> (atau Super Admin).
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-200 p-12 text-center text-stone-500 text-xs">
            Pilih calon siswa di kolom kiri untuk memverifikasi berkas dan memproses persetujuan daftar ulang.
          </div>
        )}
      </div>

      {/* Modal: Verifikasi Bukti Pembayaran */}
      {paymentActionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPaymentActionModal(null);
          }}
        >
          <div className="bg-white rounded-3xl border border-stone-200 max-w-md w-full p-6 shadow-2xl space-y-4 my-auto relative">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white ${
                  paymentActionModal.targetStatus === 'Disetujui'
                    ? 'bg-emerald-600'
                    : paymentActionModal.targetStatus === 'Perlu Upload Ulang'
                    ? 'bg-amber-600'
                    : 'bg-rose-600'
                }`}>
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900">
                    Konfirmasi {paymentActionModal.targetStatus === 'Disetujui' ? 'Setujui Pembayaran' : paymentActionModal.targetStatus === 'Perlu Upload Ulang' ? 'Minta Upload Ulang' : 'Tolak Pembayaran'}
                  </h3>
                  <p className="text-[11px] text-stone-500">{selectedReg?.student.fullName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPaymentActionModal(null)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block font-bold text-stone-800 mb-1 text-xs">
                Catatan Verifikasi (Akan Dilihat Wali Murid di Cek Status):
              </label>
              <textarea
                rows={3}
                value={paymentActionModal.notes}
                onChange={e => setPaymentActionModal({ ...paymentActionModal, notes: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#123B35]"
                placeholder="Tuliskan catatan verifikasi atau alasan perbaikan..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setPaymentActionModal(null)}
                className="px-4 py-2 border border-stone-300 rounded-xl text-stone-600 hover:bg-stone-50 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isVerifyingPayment}
                onClick={handleExecutePaymentVerification}
                className={`px-5 py-2 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer ${
                  paymentActionModal.targetStatus === 'Disetujui'
                    ? 'bg-emerald-700 hover:bg-emerald-800'
                    : paymentActionModal.targetStatus === 'Perlu Upload Ulang'
                    ? 'bg-amber-700 hover:bg-amber-800'
                    : 'bg-rose-700 hover:bg-rose-800'
                }`}
              >
                {isVerifyingPayment ? 'Memproses...' : 'Simpan Status Pembayaran'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Fullscreen Preview Bukti Pembayaran */}
      {viewingProofUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewingProofUrl(null);
          }}
        >
          <div className="bg-white rounded-3xl border border-stone-300 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4 my-auto relative">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <div>
                <h3 className="font-bold text-sm text-stone-900">Pratinjau Bukti Pembayaran</h3>
                <p className="text-[11px] text-stone-500 font-mono">{viewingProofUrl.fileName || 'Bukti_Bayar'}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewingProofUrl(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-center bg-stone-100 rounded-2xl p-4 min-h-[300px]">
              {viewingProofUrl.url.startsWith('data:image') || viewingProofUrl.url.endsWith('.jpg') || viewingProofUrl.url.endsWith('.png') || viewingProofUrl.url.endsWith('.webp') ? (
                <img
                  src={viewingProofUrl.url}
                  alt="Bukti Pembayaran"
                  className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-xs"
                />
              ) : (
                <iframe
                  src={viewingProofUrl.url}
                  title="Pratinjau Dokumen PDF"
                  className="w-full h-[60vh] rounded-xl border border-stone-200"
                />
              )}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-stone-200">
              <a
                href={viewingProofUrl.url}
                download={viewingProofUrl.fileName || 'Bukti_Pembayaran.jpg'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File Asli</span>
              </a>

              <button
                type="button"
                onClick={() => setViewingProofUrl(null)}
                className="px-5 py-2 bg-[#123B35] hover:bg-[#1a544b] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReRegistrationModule;
