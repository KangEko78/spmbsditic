/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Registration, RegistrationStatus, UploadedDocument } from '../../../types';
import { formatDateId } from '../../../lib/utils';
import {
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Eye,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

interface DocumentVerificationProps {
  registrations: Registration[];
  onUpdateStatus: (id: string, status: RegistrationStatus, notes?: string) => Promise<void>;
}

export const DocumentVerification: React.FC<DocumentVerificationProps> = ({
  registrations,
  onUpdateStatus
}) => {
  const pendingOrNeedReview = registrations.filter(
    r => r.status === 'Menunggu Verifikasi' || r.status === 'Perlu Perbaikan' || r.status === 'Terverifikasi'
  );

  const [selectedReg, setSelectedReg] = useState<Registration | null>(
    pendingOrNeedReview[0] || registrations[0] || null
  );
  const [activeDoc, setActiveDoc] = useState<UploadedDocument | null>(
    selectedReg?.documents[0] || null
  );
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (status: RegistrationStatus) => {
    if (!selectedReg) return;
    setIsProcessing(true);
    try {
      await onUpdateStatus(
        selectedReg.id,
        status,
        verificationNotes || (status === 'Terverifikasi' ? 'Seluruh berkas lengkap dan sah.' : 'Perlu perbaikan berkas.')
      );
      setVerificationNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
        <span className="text-xs font-semibold uppercase text-emerald-800 tracking-wider">
          Modul 3 · Verifikasi Berkas & Validasi Dokumen
        </span>
        <h2 className="text-2xl font-bold text-stone-900 mt-0.5">
          Pemeriksaan Kelayakan Dokumen Persyaratan
        </h2>
        <p className="text-xs text-stone-600 mt-1">
          Periksa keaslian Kartu Keluarga, Akta Kelahiran, dan Pas Foto calon murid baru sebelum diteruskan ke sesi observasi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Applicant List */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-2">
          <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider px-2 mb-2">
            Antrean Berkas ({pendingOrNeedReview.length})
          </h4>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {pendingOrNeedReview.map(reg => {
              const isSelected = selectedReg?.id === reg.id;
              return (
                <div
                  key={reg.id}
                  onClick={() => {
                    setSelectedReg(reg);
                    setActiveDoc(reg.documents[0] || null);
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-700 shadow-xs'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono font-bold text-[#123B35]">
                      {reg.registrationNumber}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      reg.status === 'Terverifikasi'
                        ? 'bg-sky-100 text-sky-800'
                        : reg.status === 'Perlu Perbaikan'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {reg.status}
                    </span>
                  </div>
                  <p className="font-bold text-stone-900">{reg.student.fullName}</p>
                  <p className="text-[11px] text-stone-500">{reg.documents.length} dokumen terunggah</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Document Viewer & Decision Panel */}
        {selectedReg ? (
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4 mb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-800">
                    {selectedReg.registrationNumber}
                  </span>
                  <h3 className="text-lg font-bold text-stone-900">
                    {selectedReg.student.fullName}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Orang Tua: {selectedReg.parent.fatherName} ({selectedReg.parent.fatherPhone})
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {selectedReg.documents.map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => setActiveDoc(doc)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        activeDoc?.id === doc.id
                          ? 'bg-[#123B35] text-white shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {doc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Document Preview Box */}
              <div className="bg-stone-900 rounded-xl overflow-hidden min-h-[350px] max-h-[450px] flex items-center justify-center p-2 relative">
                {activeDoc ? (
                  activeDoc.fileUrl.startsWith('data:image') || activeDoc.fileUrl.includes('images.unsplash.com') || activeDoc.fileUrl.startsWith('/src/assets') ? (
                    <img
                      src={activeDoc.fileUrl}
                      alt={activeDoc.label}
                      className="max-h-[430px] w-auto max-w-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="text-center text-stone-300 p-8">
                      <FileText className="w-16 h-16 text-stone-400 mx-auto mb-3" />
                      <p className="font-semibold text-sm">{activeDoc.fileName}</p>
                      <p className="text-xs text-stone-500 mt-1">Dokumen format PDF atau berkas digital ({activeDoc.fileSizeKb} KB)</p>
                      <a
                        href={activeDoc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Buka di Tab Baru</span>
                      </a>
                    </div>
                  )
                ) : (
                  <div className="text-stone-500 text-xs">Pilih dokumen untuk melihat pratinjau.</div>
                )}
              </div>

              {/* Decision Box */}
              <div className="mt-6 pt-4 border-t border-stone-200 space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">
                    Catatan Verifikasi / Alasan Perbaikan (opsional bila valid):
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Dokumen lengkap dan sesuai NIK kependudukan, atau: Foto akta terpotong di bagian nomor akta."
                    value={verificationNotes}
                    onChange={e => setVerificationNotes(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-[#123B35]"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <button
                    disabled={isProcessing}
                    onClick={() => handleAction('Perlu Perbaikan')}
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Minta Perbaikan Berkas</span>
                  </button>

                  <button
                    disabled={isProcessing}
                    onClick={() => handleAction('Terverifikasi')}
                    className="px-5 py-2.5 bg-[#123B35] hover:bg-[#1a544b] text-white font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#D5AA53]" />
                    <span>Verifikasi Berkas Sah (Lolos)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500 text-xs">
            Pilih pendaftar dari kolom kiri untuk memulai verifikasi dokumen.
          </div>
        )}
      </div>
    </div>
  );
};
