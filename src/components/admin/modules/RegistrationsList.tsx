/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Registration, RegistrationStatus, SchoolProfile } from '../../../types';
import { getStatusBadge, formatDateId } from '../../../lib/utils';
import { RegistrationReceipt } from '../../spmb/RegistrationReceipt';
import { ApplicantDetailPdfModal } from './ApplicantDetailPdfModal';
import {
  Search,
  Filter,
  FileSpreadsheet,
  Printer,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  X,
  Layers,
  Download,
  FileText,
  Sparkles
} from 'lucide-react';

interface RegistrationsListProps {
  registrations: Registration[];
  schoolProfile: SchoolProfile;
  onUpdateStatus: (id: string, status: RegistrationStatus, notes?: string) => Promise<void>;
  onDeleteRegistration: (id: string) => Promise<void>;
  onRefresh?: () => void;
}

export const RegistrationsList: React.FC<RegistrationsListProps> = ({
  registrations,
  schoolProfile,
  onUpdateStatus,
  onDeleteRegistration,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [waveFilter, setWaveFilter] = useState<string>('all');
  const [academicYearFilter, setAcademicYearFilter] = useState<string>('all');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [selectedForPdfModal, setSelectedForPdfModal] = useState<Registration | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showBulkPrintModal, setShowBulkPrintModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter
  const filtered = registrations.filter(r => {
    const matchesSearch = 
      r.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.parent.fatherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.student.previousSchool || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesWave = waveFilter === 'all' || (r.waveId && r.waveId.includes(waveFilter)) || true;
    const matchesYear = academicYearFilter === 'all' || (r.academicYear && r.academicYear === academicYearFilter) || true;
    return matchesSearch && matchesStatus && matchesWave && matchesYear;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportToExcel = () => {
    const headers = [
      'No',
      'No. Registrasi',
      'Nama Calon Siswa',
      'Jenis Kelamin',
      'Tempat Lahir',
      'Tanggal Lahir',
      'NIK',
      'Asal TK/Sekolah',
      'Nama Ayah',
      'No. HP Ayah',
      'Nama Ibu',
      'No. HP Ibu',
      'Alamat Domisili',
      'Status Pendaftaran',
      'Tanggal Mendaftar'
    ];

    const rows = filtered.map((r, i) => [
      i + 1,
      `"${r.registrationNumber}"`,
      `"${r.student.fullName.replace(/"/g, '""')}"`,
      `"${r.student.gender}"`,
      `"${r.student.birthPlace.replace(/"/g, '""')}"`,
      `"${r.student.birthDate}"`,
      `'${r.student.nik}`,
      `"${(r.student.previousSchool || '-').replace(/"/g, '""')}"`,
      `"${r.parent.fatherName.replace(/"/g, '""')}"`,
      `"${r.parent.fatherPhone}"`,
      `"${r.parent.motherName.replace(/"/g, '""')}"`,
      `"${r.parent.motherPhone}"`,
      `"${(r.student.address + ', ' + r.student.village + ', ' + r.student.district).replace(/"/g, '""')}"`,
      `"${r.status}"`,
      `"${r.submittedAt.split('T')[0]}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rekap_SPMB_SDIT_Insan_Cendikia_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id: string) => {
    await onDeleteRegistration(id);
    setDeleteConfirmId(null);
    if (selectedReg?.id === id) setSelectedReg(null);
    if (selectedForPdfModal?.id === id) setSelectedForPdfModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase text-emerald-800 tracking-wider">
            Modul 2 · Basis Data SPMB
          </span>
          <h2 className="text-2xl font-bold text-stone-900 mt-0.5">
            Daftar Lengkap Pendaftar Calon Siswa Baru
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Total {filtered.length} dari {registrations.length} data pendaftar tersaring.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowBulkPrintModal(true)}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-[#123B35] hover:bg-[#1a544b] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer min-h-[40px]"
            title="Cetak tabel rekapitulasi seluruh pendaftar yang tersaring"
          >
            <Printer className="w-4 h-4 text-[#D5AA53]" />
            <span>Cetak Rekap Peserta (PDF)</span>
          </button>

          <button
            type="button"
            onClick={exportToExcel}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer min-h-[40px]"
            title="Download file Excel (.xlsx / .csv) data pendaftar tersaring"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#D5AA53]" />
            <span>Ekspor Excel (.CSV)</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari nomor registrasi, nama calon siswa, nama ayah, atau TK asal..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-[#123B35]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-stone-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs py-2 px-3 rounded-lg border border-stone-300 bg-white font-medium text-stone-700 focus:outline-hidden focus:ring-2 focus:ring-[#123B35]"
          >
            <option value="all">Semua Status</option>
            <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
            <option value="Perlu Perbaikan">Perlu Perbaikan</option>
            <option value="Terverifikasi">Terverifikasi</option>
            <option value="Dalam Seleksi">Dalam Seleksi</option>
            <option value="Diterima">Diterima</option>
            <option value="Daftar Ulang">Daftar Ulang</option>
            <option value="Tidak Diterima">Tidak Diterima</option>
          </select>

          <select
            value={waveFilter}
            onChange={e => { setWaveFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs py-2 px-3 rounded-lg border border-stone-300 bg-white font-medium text-stone-700 focus:outline-hidden focus:ring-2 focus:ring-[#123B35]"
          >
            <option value="all">Semua Gelombang</option>
            <option value="Gelombang 1">Gelombang 1</option>
            <option value="Gelombang 2">Gelombang 2</option>
          </select>

          <select
            value={academicYearFilter}
            onChange={e => { setAcademicYearFilter(e.target.value); setCurrentPage(1); }}
            className="text-xs py-2 px-3 rounded-lg border border-stone-300 bg-white font-medium text-stone-700 focus:outline-hidden focus:ring-2 focus:ring-[#123B35]"
          >
            <option value="all">Semua Tahun Ajaran</option>
            <option value="2027/2028">2027/2028</option>
            <option value="2026/2027">2026/2027</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-[#F7F8F5] border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">No. Registrasi</th>
                <th className="py-3.5 px-4">Nama Calon Siswa</th>
                <th className="py-3.5 px-4">L/P</th>
                <th className="py-3.5 px-4">TK Asal</th>
                <th className="py-3.5 px-4">Orang Tua / Wali</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Tgl Daftar</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-500">
                    Tidak ada pendaftar yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                paginated.map(reg => {
                  const b = getStatusBadge(reg.status);
                  return (
                    <tr key={reg.id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#123B35]">
                        {reg.registrationNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-stone-900 block">{reg.student.fullName}</span>
                        <span className="text-[11px] text-stone-500">{reg.student.birthPlace}, {formatDateId(reg.student.birthDate)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-stone-700">
                          {reg.student.gender === 'Laki-laki' ? 'L' : 'P'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-600">
                        {reg.student.previousSchool || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-stone-900 block">{reg.parent.fatherName}</span>
                        <span className="text-[11px] text-stone-500 font-mono">{reg.parent.fatherPhone}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full font-semibold text-[10px] ${b.bg} ${b.text}`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-500 text-[11px] font-mono">
                        {formatDateId(reg.submittedAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedForPdfModal(reg)}
                            title="Lihat Detail Lengkap, Berkas, & Verifikasi Pembayaran"
                            className="p-1.5 text-emerald-800 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReg(reg);
                              setShowReceiptModal(true);
                            }}
                            title="Cetak Bukti Pendaftaran"
                            className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(reg.id)}
                            title="Hapus Data"
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="p-4 border-t border-stone-200 bg-[#F7F8F5] flex items-center justify-between text-xs text-stone-600">
          <span>
            Halaman {currentPage} dari {totalPages} ({filtered.length} total)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1.5 border border-stone-300 rounded-lg hover:bg-white disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 border border-stone-300 rounded-lg hover:bg-white disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedReg && !showReceiptModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedReg(null);
          }}
        >
          <div className="bg-white rounded-3xl border border-stone-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl my-auto relative">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3 mb-4">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-800">
                  {selectedReg.registrationNumber}
                </span>
                <h3 className="text-lg font-bold text-stone-900">
                  {selectedReg.student.fullName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReg(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-stone-800">
              <div className="grid grid-cols-2 gap-3 bg-[#F7F8F5] p-3 rounded-xl border border-stone-200">
                <div>
                  <span className="text-stone-500 block">NIK Calon Siswa:</span>
                  <span className="font-mono font-bold">{selectedReg.student.nik}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">TTL:</span>
                  <span>{selectedReg.student.birthPlace}, {formatDateId(selectedReg.student.birthDate)}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Jenis Kelamin:</span>
                  <span>{selectedReg.student.gender}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Asal TK:</span>
                  <span>{selectedReg.student.previousSchool || '-'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-stone-500 block">Alamat Domisili:</span>
                  <span>{selectedReg.student.address}, {selectedReg.student.village}, {selectedReg.student.district}</span>
                </div>
              </div>

              {/* Parents info */}
              <div className="grid grid-cols-2 gap-3 bg-[#F7F8F5] p-3 rounded-xl border border-stone-200">
                <div>
                  <span className="text-stone-500 block">Nama Ayah:</span>
                  <span className="font-semibold">{selectedReg.parent.fatherName}</span>
                  <span className="text-stone-500 block text-[11px]">{selectedReg.parent.fatherJob} ({selectedReg.parent.fatherPhone})</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Nama Ibu:</span>
                  <span className="font-semibold">{selectedReg.parent.motherName}</span>
                  <span className="text-stone-500 block text-[11px]">{selectedReg.parent.motherJob} ({selectedReg.parent.motherPhone})</span>
                </div>
              </div>

              {/* Status Update Quick Bar */}
              <div className="p-3 border border-stone-200 rounded-xl space-y-2">
                <span className="font-bold text-stone-900 block">Ubah Status Cepat:</span>
                <div className="flex flex-wrap gap-2">
                  {(['Menunggu Verifikasi', 'Terverifikasi', 'Perlu Perbaikan', 'Diterima', 'Daftar Ulang'] as RegistrationStatus[]).map(st => (
                    <button
                      key={st}
                      onClick={() => onUpdateStatus(selectedReg.id, st, `Status diubah oleh petugas melalui panel cepat.`)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-colors cursor-pointer ${
                        selectedReg.status === st
                          ? 'bg-[#123B35] text-white border-[#123B35]'
                          : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-stone-200 flex justify-end gap-2">
              <button
                onClick={() => setShowReceiptModal(true)}
                className="px-4 py-2 bg-[#123B35] text-white text-xs font-semibold rounded-lg hover:bg-[#1a544b]"
              >
                Cetak Kartu Peserta
              </button>
              <button
                onClick={() => setSelectedReg(null)}
                className="px-4 py-2 border border-stone-300 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteConfirmId(null);
          }}
        >
          <div className="bg-white rounded-3xl border border-stone-200 max-w-sm w-full p-6 text-center shadow-xl">
            <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-stone-900">Konfirmasi Hapus Data</h4>
            <p className="text-xs text-stone-600 mt-2">
              Apakah Anda yakin ingin menghapus data pendaftaran ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-2 justify-center mt-5">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs"
              >
                Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Printable Modal */}
      {showReceiptModal && selectedReg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowReceiptModal(false);
          }}
        >
          <div className="max-w-3xl w-full my-auto">
            <RegistrationReceipt
              registration={selectedReg}
              schoolProfile={schoolProfile}
              onClose={() => setShowReceiptModal(false)}
            />
          </div>
        </div>
      )}

      {/* Comprehensive Applicant Detail, Stages & Payment Verification Modal */}
      {selectedForPdfModal && (
        <ApplicantDetailPdfModal
          registration={selectedForPdfModal}
          schoolProfile={schoolProfile}
          onClose={() => setSelectedForPdfModal(null)}
          onRefresh={() => {
            onRefresh?.();
            const fresh = registrations.find(r => r.id === selectedForPdfModal.id);
            if (fresh) setSelectedForPdfModal(fresh);
          }}
        />
      )}
    </div>
  );
};
