/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Registration, SchoolProfile, SpmbWave, RegistrationStatus, PaymentStatus } from '../../../types';
import { formatDateId } from '../../../lib/utils';
import { downloadElementAsPdf } from '../../../lib/pdfGenerator';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Users,
  CheckCircle,
  BarChart3,
  Filter,
  RotateCcw,
  Eye,
  Calendar,
  CreditCard,
  Building2,
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2
} from 'lucide-react';

interface ReportExportModuleProps {
  registrations: Registration[];
  schoolProfile: SchoolProfile;
  wave: SpmbWave;
}

export const ReportExportModule: React.FC<ReportExportModuleProps> = ({
  registrations,
  schoolProfile,
  wave
}) => {
  // Filter States
  const [waveFilter, setWaveFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [documentStatusFilter, setDocumentStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [selectionStatusFilter, setSelectionStatusFilter] = useState<string>('all');
  const [graduationStatusFilter, setGraduationStatusFilter] = useState<string>('all');
  const [reRegStatusFilter, setReRegStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Filtered registrations logic
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(r => {
      // 1. Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = r.student.fullName.toLowerCase().includes(query);
        const matchReg = r.registrationNumber.toLowerCase().includes(query);
        const matchParent = (r.parent.fatherName || '').toLowerCase().includes(query) || (r.parent.motherName || '').toLowerCase().includes(query);
        if (!matchName && !matchReg && !matchParent) return false;
      }

      // 2. Wave filter
      if (waveFilter !== 'all') {
        if (waveFilter === 'gelombang-1' && r.waveId !== 'wave-1' && r.waveId !== 'gelombang-1') return false;
        if (waveFilter === 'gelombang-2' && r.waveId !== 'wave-2' && r.waveId !== 'gelombang-2') return false;
      }

      // 3. Date range filter
      if (startDate) {
        const regDate = r.submittedAt.split('T')[0];
        if (regDate < startDate) return false;
      }
      if (endDate) {
        const regDate = r.submittedAt.split('T')[0];
        if (regDate > endDate) return false;
      }

      // 4. Document / Status Berkas filter
      if (documentStatusFilter !== 'all') {
        if (documentStatusFilter === 'Menunggu Verifikasi' && r.status !== 'Menunggu Verifikasi') return false;
        if (documentStatusFilter === 'Perlu Perbaikan' && r.status !== 'Perlu Perbaikan') return false;
        if (documentStatusFilter === 'Terverifikasi' && !['Terverifikasi', 'Dalam Seleksi', 'Diterima', 'Menunggu Daftar Ulang', 'Selesai Daftar Ulang'].includes(r.status)) return false;
      }

      // 5. Payment Status filter
      const proof = r.paymentProof || r.reRegistration?.paymentProof;
      const payStatus = proof?.status || 'Belum Upload';
      if (paymentStatusFilter !== 'all') {
        if (payStatus !== paymentStatusFilter) return false;
      }

      // 6. Selection / Nilai filter
      const hasScore = r.selection && (r.selection.totalScore > 0 || r.selection.catatanSeleksi);
      if (selectionStatusFilter !== 'all') {
        if (selectionStatusFilter === 'scored' && !hasScore) return false;
        if (selectionStatusFilter === 'unscored' && hasScore) return false;
      }

      // 7. Graduation / Status Kelulusan filter
      if (graduationStatusFilter !== 'all') {
        if (graduationStatusFilter === 'Diterima' && r.status !== 'Diterima' && r.status !== 'Menunggu Daftar Ulang' && r.status !== 'Selesai Daftar Ulang') return false;
        if (graduationStatusFilter === 'Tidak Diterima' && r.status !== 'Tidak Diterima') return false;
        if (graduationStatusFilter === 'Dalam Seleksi' && r.status !== 'Dalam Seleksi') return false;
      }

      // 8. Re-registration / Status Daftar Ulang filter
      if (reRegStatusFilter !== 'all') {
        const currentReRegStatus = r.reRegistration?.status || (r.status === 'Selesai Daftar Ulang' ? 'Selesai Daftar Ulang' : 'Belum Daftar Ulang');
        if (currentReRegStatus !== reRegStatusFilter) return false;
      }

      return true;
    });
  }, [
    registrations,
    searchTerm,
    waveFilter,
    startDate,
    endDate,
    documentStatusFilter,
    paymentStatusFilter,
    selectionStatusFilter,
    graduationStatusFilter,
    reRegStatusFilter
  ]);

  // Statistics from filtered data
  const stats = useMemo(() => {
    const total = filteredRegistrations.length;
    const male = filteredRegistrations.filter(r => r.student.gender === 'Laki-laki').length;
    const female = filteredRegistrations.filter(r => r.student.gender === 'Perempuan').length;
    const verified = filteredRegistrations.filter(r => ['Terverifikasi', 'Dalam Seleksi', 'Diterima', 'Menunggu Daftar Ulang', 'Selesai Daftar Ulang'].includes(r.status)).length;
    const paymentApproved = filteredRegistrations.filter(r => {
      const p = r.paymentProof || r.reRegistration?.paymentProof;
      return p?.status === 'Disetujui';
    }).length;
    const accepted = filteredRegistrations.filter(r => ['Diterima', 'Menunggu Daftar Ulang', 'Selesai Daftar Ulang'].includes(r.status)).length;
    const reRegistered = filteredRegistrations.filter(r => r.status === 'Selesai Daftar Ulang' || r.reRegistration?.status === 'Selesai Daftar Ulang').length;

    return { total, male, female, verified, paymentApproved, accepted, reRegistered };
  }, [filteredRegistrations]);

  const handleResetFilters = () => {
    setWaveFilter('all');
    setStartDate('');
    setEndDate('');
    setDocumentStatusFilter('all');
    setPaymentStatusFilter('all');
    setSelectionStatusFilter('all');
    setGraduationStatusFilter('all');
    setReRegStatusFilter('all');
    setSearchTerm('');
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      await downloadElementAsPdf('spmb-printable-report', {
        fileName: `Laporan_Seluruh_Pendaftar_SPMB_${new Date().toISOString().slice(0, 10)}.pdf`,
        orientation: 'landscape'
      });
    } catch (err: any) {
      console.error(err);
      alert('Gagal mengunduh PDF secara otomatis. Silakan gunakan tombol Cetak.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Export to standard CSV with UTF-8 BOM
  const handleExportCsv = () => {
    const headers = [
      'No',
      'No Registrasi',
      'Nama Calon Murid',
      'Jenis Kelamin',
      'Tanggal Lahir',
      'NIK Siswa',
      'Anak Ke',
      'Jml Saudara',
      'Status Anak',
      'Berkebutuhan Khusus',
      'Tinggal Dengan',
      'Alamat Domisili',
      'Status Rumah',
      'Jml Kendaraan',
      'Asal TK/PAUD',
      'Nama Ayah',
      'Status Ayah',
      'Penghasilan Ayah',
      'Nama Ibu',
      'Status Ibu',
      'Penghasilan Ibu',
      'Nama Wali',
      'Penghasilan Wali',
      'No WhatsApp',
      'Gelombang',
      'Tanggal Daftar',
      'Status Berkas',
      'Biaya Pendaftaran',
      'Status Pembayaran',
      'Metode Bayar',
      'Nilai Seleksi',
      'Status Kelulusan',
      'Status Daftar Ulang'
    ];

    const rows = filteredRegistrations.map((r, index) => {
      const proof = r.paymentProof || r.reRegistration?.paymentProof;
      const reRegStatus = r.reRegistration?.status || (r.status === 'Selesai Daftar Ulang' ? 'Selesai Daftar Ulang' : 'Belum Daftar Ulang');
      const waveLabel = r.waveId === 'wave-2' ? 'Gelombang 2' : 'Gelombang 1';
      const res = r.residence || r.student.residence;
      const livingWith = res?.livingWith === 'Lainnya' && res?.livingWithOtherNote ? `Lainnya: ${res.livingWithOtherNote}` : (res?.livingWith || 'Ayah dan Ibu');
      const houseStatus = res?.houseStatus === 'Lainnya' && res?.houseStatusOtherNote ? `Lainnya: ${res.houseStatusOtherNote}` : (res?.houseStatus || 'Hak Milik');
      const vehicleCount = res?.vehicleCount !== undefined ? res.vehicleCount : 1;
      const fullAddress = `${res?.currentAddress || r.student.address}, RT/RW ${res?.rtRw || r.student.rtRw || '01/01'}, Desa ${res?.village || r.student.village}, Kec. ${res?.district || r.student.district}, ${res?.regency || r.student.regency}`;

      return [
        index + 1,
        `"${r.registrationNumber}"`,
        `"${r.student.fullName.replace(/"/g, '""')}"`,
        `"${r.student.gender}"`,
        `"${r.student.birthDate}"`,
        `"'${r.student.nik}"`,
        r.student.childNumber ?? 1,
        r.student.totalSiblings ?? 0,
        `"${(r.student.childStatus || 'Tidak termasuk ketiganya').replace(/"/g, '""')}"`,
        `"${r.student.hasSpecialNeeds ? `Ya (${r.student.specialNeedsDescription || 'Ada'})` : 'Tidak'}"`,
        `"${livingWith.replace(/"/g, '""')}"`,
        `"${fullAddress.replace(/"/g, '""')}"`,
        `"${houseStatus.replace(/"/g, '""')}"`,
        vehicleCount,
        `"${(r.student.previousSchool || '').replace(/"/g, '""')}"`,
        `"${(r.parent.fatherName || '-').replace(/"/g, '""')}"`,
        `"${(r.parent.fatherStatus || 'Masih Hidup').replace(/"/g, '""')}"`,
        `"${(r.parent.fatherIncome || '-').replace(/"/g, '""')}"`,
        `"${(r.parent.motherName || '-').replace(/"/g, '""')}"`,
        `"${(r.parent.motherStatus || 'Masih Hidup').replace(/"/g, '""')}"`,
        `"${(r.parent.motherIncome || '-').replace(/"/g, '""')}"`,
        `"${(r.parent.hasGuardian ? r.parent.guardianName || '-' : '-').replace(/"/g, '""')}"`,
        `"${(r.parent.hasGuardian ? r.parent.guardianIncome || '-' : '-').replace(/"/g, '""')}"`,
        `"'${r.parent.fatherPhone || r.parent.motherPhone || ''}"`,
        `"${waveLabel}"`,
        `"${r.submittedAt.split('T')[0]}"`,
        `"${r.status}"`,
        `"Rp 50.000"`,
        `"${proof?.status || 'Belum Upload'}"`,
        `"${proof?.method || 'Transfer Bank Jatim'}"`,
        `"${r.selection?.totalScore || '-'}"`,
        `"${['Diterima', 'Menunggu Daftar Ulang', 'Selesai Daftar Ulang'].includes(r.status) ? 'Diterima' : r.status}"`,
        `"${reRegStatus}"`
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Pendaftar_SPMB_SDIT_Insan_Cendikia_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to Excel XML Spreadsheet (.xlsx compatible)
  const handleExportExcel = () => {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="11"/>
   <Interior ss:Color="#123B35" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
   </Borders>
  </Style>
  <Style ss:ID="Title">
   <Font ss:Bold="1" ss:Size="14" ss:Color="#123B35"/>
  </Style>
  <Style ss:ID="Row">
   <Alignment ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EEEEEE"/>
   </Borders>
  </Style>
 </Styles>
 <Worksheet ss:Name="Laporan Pendaftar">
  <Table>
   <Row ss:StyleID="Title">
    <Cell><Data ss:Type="String">LAPORAN RESMI REKAPITULASI PENDAFTAR SPMB SDIT INSAN CENDIKIA KALIBARU</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Dicetak pada: ${formatDateId(new Date().toISOString())} | Total Data: ${filteredRegistrations.length} Siswa</Data></Cell>
   </Row>
   <Row></Row>
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">No</Data></Cell>
    <Cell><Data ss:Type="String">No Registrasi</Data></Cell>
    <Cell><Data ss:Type="String">Nama Calon Murid</Data></Cell>
    <Cell><Data ss:Type="String">L/P</Data></Cell>
    <Cell><Data ss:Type="String">Tanggal Lahir</Data></Cell>
    <Cell><Data ss:Type="String">NIK Siswa</Data></Cell>
    <Cell><Data ss:Type="String">Anak Ke</Data></Cell>
    <Cell><Data ss:Type="String">Jml Sdr</Data></Cell>
    <Cell><Data ss:Type="String">Status Anak</Data></Cell>
    <Cell><Data ss:Type="String">ABK</Data></Cell>
    <Cell><Data ss:Type="String">Tinggal Dengan</Data></Cell>
    <Cell><Data ss:Type="String">Alamat Domisili</Data></Cell>
    <Cell><Data ss:Type="String">Status Rumah</Data></Cell>
    <Cell><Data ss:Type="String">Jml Kendaraan</Data></Cell>
    <Cell><Data ss:Type="String">Asal TK/PAUD</Data></Cell>
    <Cell><Data ss:Type="String">Nama Ayah</Data></Cell>
    <Cell><Data ss:Type="String">Penghasilan Ayah</Data></Cell>
    <Cell><Data ss:Type="String">Nama Ibu</Data></Cell>
    <Cell><Data ss:Type="String">Penghasilan Ibu</Data></Cell>
    <Cell><Data ss:Type="String">No WhatsApp</Data></Cell>
    <Cell><Data ss:Type="String">Gelombang</Data></Cell>
    <Cell><Data ss:Type="String">Tanggal Daftar</Data></Cell>
    <Cell><Data ss:Type="String">Status Berkas</Data></Cell>
    <Cell><Data ss:Type="String">Biaya Pendaftaran</Data></Cell>
    <Cell><Data ss:Type="String">Status Bayar</Data></Cell>
    <Cell><Data ss:Type="String">Metode Bayar</Data></Cell>
    <Cell><Data ss:Type="String">Skor Seleksi</Data></Cell>
    <Cell><Data ss:Type="String">Status Kelulusan</Data></Cell>
    <Cell><Data ss:Type="String">Status Daftar Ulang</Data></Cell>
   </Row>`;

    filteredRegistrations.forEach((r, idx) => {
      const proof = r.paymentProof || r.reRegistration?.paymentProof;
      const reRegStatus = r.reRegistration?.status || (r.status === 'Selesai Daftar Ulang' ? 'Selesai Daftar Ulang' : 'Belum Daftar Ulang');
      const waveLabel = r.waveId === 'wave-2' ? 'Gelombang 2' : 'Gelombang 1';
      const res = r.residence || r.student.residence;
      const livingWith = res?.livingWith === 'Lainnya' && res?.livingWithOtherNote ? `Lainnya: ${res.livingWithOtherNote}` : (res?.livingWith || 'Ayah dan Ibu');
      const houseStatus = res?.houseStatus === 'Lainnya' && res?.houseStatusOtherNote ? `Lainnya: ${res.houseStatusOtherNote}` : (res?.houseStatus || 'Hak Milik');
      const vehicleCount = res?.vehicleCount !== undefined ? res.vehicleCount : 1;
      const fullAddress = `${res?.currentAddress || r.student.address}, RT/RW ${res?.rtRw || r.student.rtRw || '01/01'}, Desa ${res?.village || r.student.village}, Kec. ${res?.district || r.student.district}`;

      xml += `
   <Row ss:StyleID="Row">
    <Cell><Data ss:Type="Number">${idx + 1}</Data></Cell>
    <Cell><Data ss:Type="String">${r.registrationNumber}</Data></Cell>
    <Cell><Data ss:Type="String">${r.student.fullName}</Data></Cell>
    <Cell><Data ss:Type="String">${r.student.gender}</Data></Cell>
    <Cell><Data ss:Type="String">${r.student.birthDate}</Data></Cell>
    <Cell><Data ss:Type="String">${r.student.nik}</Data></Cell>
    <Cell><Data ss:Type="Number">${r.student.childNumber ?? 1}</Data></Cell>
    <Cell><Data ss:Type="Number">${r.student.totalSiblings ?? 0}</Data></Cell>
    <Cell><Data ss:Type="String">${r.student.childStatus || 'Tidak termasuk ketiganya'}</Data></Cell>
    <Cell><Data ss:Type="String">${r.student.hasSpecialNeeds ? `Ya (${r.student.specialNeedsDescription || 'Ada'})` : 'Tidak'}</Data></Cell>
    <Cell><Data ss:Type="String">${livingWith}</Data></Cell>
    <Cell><Data ss:Type="String">${fullAddress}</Data></Cell>
    <Cell><Data ss:Type="String">${houseStatus}</Data></Cell>
    <Cell><Data ss:Type="Number">${vehicleCount}</Data></Cell>
    <Cell><Data ss:Type="String">${r.student.previousSchool || '-'}</Data></Cell>
    <Cell><Data ss:Type="String">${r.parent.fatherName || '-'}</Data></Cell>
    <Cell><Data ss:Type="String">${r.parent.fatherIncome || '-'}</Data></Cell>
    <Cell><Data ss:Type="String">${r.parent.motherName || '-'}</Data></Cell>
    <Cell><Data ss:Type="String">${r.parent.motherIncome || '-'}</Data></Cell>
    <Cell><Data ss:Type="String">${r.parent.fatherPhone || r.parent.motherPhone || '-'}</Data></Cell>
    <Cell><Data ss:Type="String">${waveLabel}</Data></Cell>
    <Cell><Data ss:Type="String">${r.submittedAt.split('T')[0]}</Data></Cell>
    <Cell><Data ss:Type="String">${r.status}</Data></Cell>
    <Cell><Data ss:Type="String">Rp 50.000</Data></Cell>
    <Cell><Data ss:Type="String">${proof?.status || 'Belum Upload'}</Data></Cell>
    <Cell><Data ss:Type="String">${proof?.method || 'Transfer Bank Jatim'}</Data></Cell>
    <Cell><Data ss:Type="String">${r.selection?.totalScore || '-'}</Data></Cell>
    <Cell><Data ss:Type="String">${['Diterima', 'Menunggu Daftar Ulang', 'Selesai Daftar Ulang'].includes(r.status) ? 'Diterima' : r.status}</Data></Cell>
    <Cell><Data ss:Type="String">${reRegStatus}</Data></Cell>
   </Row>`;
    });

    xml += `
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Pendaftar_SPMB_SDIT_Insan_Cendikia_${new Date().toISOString().slice(0, 10)}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-xs text-stone-800">
      {/* Top Banner / Actions Bar */}
      <div className="no-print bg-white rounded-3xl border border-stone-200 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider block">
            Modul 20 · Rekapitulasi & Pusat Ekspor Data
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mt-0.5 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-[#123B35]" />
            <span>Laporan Seluruh Pendaftar SPMB</span>
          </h2>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
            Filter, pratinjau, unduh dalam format Microsoft Excel (.xlsx), CSV UTF-8, atau cetak dokumen PDF resmi untuk arsip sekolah dan dinas pendidikan.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrintReport}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl border border-stone-300 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
            title="Cetak Laporan ke Printer"
          >
            <Printer className="w-4 h-4 text-[#123B35]" />
            <span>Cetak Seluruh Pendaftar</span>
          </button>

          <button
            type="button"
            disabled={isDownloadingPdf}
            onClick={handleDownloadPdf}
            className="px-3.5 py-2 bg-[#174C80] hover:bg-[#2065AA] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer text-xs disabled:opacity-50"
            title="Unduh Lembar Laporan PDF"
          >
            {isDownloadingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#D5AA53]" />
            ) : (
              <Download className="w-4 h-4 text-[#D5AA53]" />
            )}
            <span>{isDownloadingPdf ? 'Membuat PDF...' : 'Unduh PDF'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-[#123B35] hover:bg-[#1a544b] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
            title="Unduh File Microsoft Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#D5AA53]" />
            <span>Unduh Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
            title="Unduh Format CSV UTF-8"
          >
            <Download className="w-4 h-4 text-[#D5AA53]" />
            <span>Unduh CSV</span>
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="no-print bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-800" />
            <h3 className="font-bold text-xs uppercase tracking-wide text-stone-900">
              Filter Data Pendaftar
            </h3>
            <span className="text-[11px] text-stone-500 font-mono">
              (Ditemukan: <strong>{filteredRegistrations.length}</strong> dari {registrations.length} siswa)
            </span>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Semua Filter</span>
          </button>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* 1. Search */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">Pencarian Nama / No. Reg:</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ketik nama murid/wali..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full p-2 pl-8 rounded-xl border border-stone-300 text-xs"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* 2. Gelombang */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">Gelombang:</label>
            <select
              value={waveFilter}
              onChange={e => setWaveFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-stone-300 bg-white text-xs font-medium"
            >
              <option value="all">Semua Gelombang</option>
              <option value="gelombang-1">Gelombang 1</option>
              <option value="gelombang-2">Gelombang 2</option>
            </select>
          </div>

          {/* 3. Tanggal Mulai */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">Tanggal Mulai:</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full p-2 rounded-xl border border-stone-300 text-xs font-medium"
            />
          </div>

          {/* 4. Tanggal Selesai */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">Tanggal Selesai:</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full p-2 rounded-xl border border-stone-300 text-xs font-medium"
            />
          </div>

          {/* 5. Status Berkas */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">Status Berkas:</label>
            <select
              value={documentStatusFilter}
              onChange={e => setDocumentStatusFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-stone-300 bg-white text-xs font-medium"
            >
              <option value="all">Semua Status Berkas</option>
              <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
              <option value="Terverifikasi">Terverifikasi Sah</option>
              <option value="Perlu Perbaikan">Perlu Perbaikan Berkas</option>
            </select>
          </div>

          {/* 6. Status Pembayaran */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">Status Pembayaran:</label>
            <select
              value={paymentStatusFilter}
              onChange={e => setPaymentStatusFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-stone-300 bg-white text-xs font-medium"
            >
              <option value="all">Semua Status Pembayaran</option>
              <option value="Belum Upload">Belum Upload</option>
              <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
              <option value="Disetujui">Disetujui (Lunas Rp 50.000)</option>
              <option value="Perlu Upload Ulang">Perlu Upload Ulang</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>

          {/* 7. Status Seleksi / Penilaian */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">Status Penilaian Seleksi:</label>
            <select
              value={selectionStatusFilter}
              onChange={e => setSelectionStatusFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-stone-300 bg-white text-xs font-medium"
            >
              <option value="all">Semua Penilaian</option>
              <option value="scored">Sudah Dinilai (Ada Skor)</option>
              <option value="unscored">Belum Dinilai</option>
            </select>
          </div>

          {/* 8. Status Kelulusan */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">Status Kelulusan:</label>
            <select
              value={graduationStatusFilter}
              onChange={e => setGraduationStatusFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-stone-300 bg-white text-xs font-medium"
            >
              <option value="all">Semua Kelulusan</option>
              <option value="Diterima">Diterima</option>
              <option value="Tidak Diterima">Tidak Diterima</option>
              <option value="Dalam Seleksi">Dalam Proses Seleksi</option>
            </select>
          </div>

          {/* 9. Status Daftar Ulang */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">Status Daftar Ulang:</label>
            <select
              value={reRegStatusFilter}
              onChange={e => setReRegStatusFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-stone-300 bg-white text-xs font-medium"
            >
              <option value="all">Semua Daftar Ulang</option>
              <option value="Belum Daftar Ulang">Belum Daftar Ulang</option>
              <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
              <option value="Disetujui Admin Sekolah">Disetujui Admin Sekolah</option>
              <option value="Selesai Daftar Ulang">Selesai Daftar Ulang (Aktif)</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Dynamic Stat Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="p-3 bg-white rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-stone-500 block text-[11px]">Total Terfilter</span>
          <span className="text-xl font-bold font-mono text-[#123B35]">{stats.total} siswa</span>
        </div>
        <div className="p-3 bg-white rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-stone-500 block text-[11px]">Laki / Perempuan</span>
          <span className="text-xl font-bold font-mono text-stone-900">{stats.male} L / {stats.female} P</span>
        </div>
        <div className="p-3 bg-white rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-stone-500 block text-[11px]">Berkas Sah</span>
          <span className="text-xl font-bold font-mono text-emerald-800">{stats.verified}</span>
        </div>
        <div className="p-3 bg-white rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-stone-500 block text-[11px]">Bayar Rp 50.000 Sah</span>
          <span className="text-xl font-bold font-mono text-sky-800">{stats.paymentApproved}</span>
        </div>
        <div className="p-3 bg-white rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-stone-500 block text-[11px]">Lulus Diterima</span>
          <span className="text-xl font-bold font-mono text-teal-800">{stats.accepted}</span>
        </div>
        <div className="p-3 bg-white rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-stone-500 block text-[11px]">Daftar Ulang Tuntas</span>
          <span className="text-xl font-bold font-mono text-purple-800">{stats.reRegistered}</span>
        </div>
      </div>

      {/* Printable Report Layout Container (Also visual preview in dashboard) */}
      <div id="spmb-printable-report" className="bg-white rounded-3xl border border-stone-300 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Kop Surat Resmi */}
        <div className="flex items-center gap-4 pb-4 border-b-2 border-stone-800">
          <div className="w-16 h-16 rounded-xl bg-[#123B35] flex items-center justify-center text-white shrink-0">
            <span className="font-serif font-black text-2xl text-[#D5AA53]">IC</span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-extrabold uppercase tracking-tight text-[#123B35]">
              {schoolProfile.name}
            </h2>
            <p className="text-xs font-bold text-[#174C80] uppercase tracking-wider">
              Yayasan Bina Insan Cendikia Kalibaru · NPSN: {schoolProfile.npsn} · Terakreditasi {schoolProfile.accreditation}
            </p>
            <p className="text-[11px] text-stone-600 mt-0.5">
              {schoolProfile.address}, Kec. {schoolProfile.district}, {schoolProfile.regency}, {schoolProfile.province}
            </p>
            <p className="text-[10px] text-stone-500 font-mono">
              Telp/WA: {schoolProfile.whatsapp} · Email: {schoolProfile.email}
            </p>
          </div>
        </div>

        {/* Title Header */}
        <div className="text-center pb-2 border-b border-stone-200">
          <h3 className="text-base font-extrabold uppercase tracking-wider text-stone-900">
            LAPORAN REKAPITULASI RESMI PENDAFTAR SPMB
          </h3>
          <p className="text-xs text-stone-600 mt-0.5">
            Tahun Ajaran {wave.academicYear} · Dicetak otomatis oleh Sistem Informasi Sekolah pada: {formatDateId(new Date().toISOString())}
          </p>
        </div>

        {/* Table of Applicants */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border border-stone-300">
            <thead className="bg-[#F7F8F5] text-stone-800 font-bold uppercase text-[9px] border-b-2 border-stone-300">
              <tr>
                <th className="py-2 px-2.5 border-r border-stone-300 text-center w-8">No</th>
                <th className="py-2 px-2.5 border-r border-stone-300">No. Registrasi</th>
                <th className="py-2 px-2.5 border-r border-stone-300">Nama Calon Siswa</th>
                <th className="py-2 px-2 border-r border-stone-300 text-center">L/P</th>
                <th className="py-2 px-2.5 border-r border-stone-300">Gelombang</th>
                <th className="py-2 px-2.5 border-r border-stone-300">Tgl Daftar</th>
                <th className="py-2 px-2.5 border-r border-stone-300">Asal TK</th>
                <th className="py-2 px-2.5 border-r border-stone-300">Nama Orang Tua</th>
                <th className="py-2 px-2.5 border-r border-stone-300">Status Berkas</th>
                <th className="py-2 px-2.5 border-r border-stone-300">Pembayaran (Rp 50.000)</th>
                <th className="py-2 px-2 border-r border-stone-300 text-center">Skor</th>
                <th className="py-2 px-2.5 border-r border-stone-300">Kelulusan</th>
                <th className="py-2 px-2.5">Daftar Ulang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-8 text-center text-stone-500 italic">
                    Tidak ada data pendaftar yang cocok dengan filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((r, i) => {
                  const proof = r.paymentProof || r.reRegistration?.paymentProof;
                  const reRegStatus = r.reRegistration?.status || (r.status === 'Selesai Daftar Ulang' ? 'Selesai Daftar Ulang' : 'Belum Daftar Ulang');
                  const waveLabel = r.waveId === 'wave-2' ? 'Gel 2' : 'Gel 1';
                  const isAccepted = ['Diterima', 'Menunggu Daftar Ulang', 'Selesai Daftar Ulang'].includes(r.status);

                  return (
                    <tr key={r.id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-2 px-2.5 border-r border-stone-200 font-mono text-center">{i + 1}</td>
                      <td className="py-2 px-2.5 border-r border-stone-200 font-mono font-bold text-[#123B35]">
                        {r.registrationNumber}
                      </td>
                      <td className="py-2 px-2.5 border-r border-stone-200">
                        <span className="font-bold text-stone-900 block">{r.student.fullName}</span>
                        <span className="text-[9px] text-stone-500 block">
                          Anak ke-{r.student.childNumber ?? 1}/{r.student.totalSiblings ?? 0} · {r.student.childStatus || 'Normal'} {r.student.hasSpecialNeeds ? '· (ABK)' : ''}
                        </span>
                      </td>
                      <td className="py-2 px-2 border-r border-stone-200 text-center font-medium">
                        {r.student.gender === 'Laki-laki' ? 'L' : 'P'}
                      </td>
                      <td className="py-2 px-2.5 border-r border-stone-200 whitespace-nowrap">
                        {waveLabel}
                      </td>
                      <td className="py-2 px-2.5 border-r border-stone-200 whitespace-nowrap text-stone-600">
                        {r.submittedAt.split('T')[0]}
                      </td>
                      <td className="py-2 px-2.5 border-r border-stone-200 text-stone-700 max-w-[140px]">
                        <span className="font-medium block truncate">{r.student.previousSchool || '-'}</span>
                        <span className="text-[9px] text-stone-500 block truncate">
                          {r.residence?.livingWith || 'Ayah dan Ibu'} · {r.residence?.village || r.student.village || ''}
                        </span>
                      </td>
                      <td className="py-2 px-2.5 border-r border-stone-200 text-stone-800">
                        <span className="font-medium block">{r.parent.fatherName || r.parent.motherName}</span>
                        <span className="text-[9px] text-emerald-800 block">
                          {r.parent.fatherIncome ? `Ayah: ${r.parent.fatherIncome}` : (r.parent.motherIncome ? `Ibu: ${r.parent.motherIncome}` : '-')}
                        </span>
                      </td>
                      <td className="py-2 px-2.5 border-r border-stone-200">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap ${
                          r.status === 'Perlu Perbaikan'
                            ? 'bg-rose-100 text-rose-900'
                            : ['Terverifikasi', 'Dalam Seleksi', 'Diterima', 'Menunggu Daftar Ulang', 'Selesai Daftar Ulang'].includes(r.status)
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-stone-100 text-stone-800'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-2 px-2.5 border-r border-stone-200 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          proof?.status === 'Disetujui'
                            ? 'bg-emerald-100 text-emerald-950 font-bold'
                            : proof?.status === 'Menunggu Verifikasi'
                            ? 'bg-sky-100 text-sky-900'
                            : proof?.status === 'Ditolak'
                            ? 'bg-rose-100 text-rose-900'
                            : 'bg-stone-100 text-stone-600'
                        }`}>
                          {proof?.status || 'Belum Upload'}
                        </span>
                      </td>
                      <td className="py-2 px-2 border-r border-stone-200 text-center font-mono font-bold">
                        {r.selection?.totalScore !== undefined ? r.selection.totalScore : '-'}
                      </td>
                      <td className="py-2 px-2.5 border-r border-stone-200">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isAccepted
                            ? 'bg-teal-100 text-teal-950'
                            : r.status === 'Tidak Diterima'
                            ? 'bg-rose-100 text-rose-950'
                            : 'bg-amber-100 text-amber-950'
                        }`}>
                          {isAccepted ? 'Diterima' : r.status === 'Tidak Diterima' ? 'Tidak Lulus' : 'Seleksi'}
                        </span>
                      </td>
                      <td className="py-2 px-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          reRegStatus === 'Selesai Daftar Ulang'
                            ? 'bg-purple-100 text-purple-950 font-bold'
                            : reRegStatus === 'Disetujui Admin Sekolah'
                            ? 'bg-sky-100 text-sky-950'
                            : 'bg-stone-100 text-stone-600'
                        }`}>
                          {reRegStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Tanda Tangan Pengesahan Resmi */}
        <div className="pt-8 flex justify-between items-start text-xs text-center">
          <div className="w-56">
            <p className="text-stone-600">Ketua Panitia SPMB,</p>
            <div className="h-16 flex items-center justify-center">
              <span className="italic text-stone-400 text-[10px]">(Tanda Tangan & Stempel)</span>
            </div>
            <p className="font-bold underline text-stone-900">
              ( {schoolProfile.spmbChairmanName || 'Tasyantik Salsabilla, S.Pd.'} )
            </p>
          </div>

          <div className="w-56">
            <p className="text-stone-600">Kalibaru, {formatDateId(new Date().toISOString())}</p>
            <p className="text-stone-600 font-bold">Kepala SDIT Insan Cendikia,</p>
            <div className="h-16 flex items-center justify-center">
              <div className="border border-emerald-800 text-emerald-900 px-3 py-1 rounded font-serif text-[10px] font-bold tracking-widest uppercase rotate-[-2deg]">
                PENGESAHAN KEPSEK
              </div>
            </div>
            <p className="font-bold underline text-stone-900">
              ( {schoolProfile.headmasterName || 'Jaya Saputra Ria Novandanu, S.Pd., Gr.'} )
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
