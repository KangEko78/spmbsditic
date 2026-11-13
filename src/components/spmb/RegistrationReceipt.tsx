/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Registration, SchoolProfile } from '../../types';
import { formatDateId } from '../../lib/utils';
import { downloadElementAsPdf } from '../../lib/pdfGenerator';
import { Printer, CheckCircle, ShieldCheck, Download, X, Loader2 } from 'lucide-react';

interface RegistrationReceiptProps {
  registration: Registration;
  schoolProfile: SchoolProfile;
  onClose?: () => void;
}

export const RegistrationReceipt: React.FC<RegistrationReceiptProps> = ({
  registration,
  schoolProfile,
  onClose
}) => {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const sanitizedName = (registration.student?.fullName || 'Peserta').replace(/[^a-zA-Z0-9]/g, '_');
      await downloadElementAsPdf(
        'spmb-printable-receipt',
        `Bukti_Pendaftaran_SPMB_${registration.registrationNumber}_${sanitizedName}.pdf`
      );
    } catch (err: any) {
      console.error(err);
      alert('Gagal mengunduh file PDF secara otomatis: ' + (err.message || 'Error') + '. Silakan gunakan tombol Cetak.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const { student, parent } = registration;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xl p-5 sm:p-8 max-w-3xl mx-auto relative">
      {/* Action Buttons (Hidden on Print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 pb-5 mb-5 border-b border-stone-200">
        <div>
          <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider block">
            Bukti Pendaftaran Sah
          </span>
          <h3 className="text-base sm:text-lg font-bold text-stone-900">Kartu Tanda Peserta SPMB</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#174C80] hover:bg-[#2065AA] text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer transition-colors disabled:opacity-50"
            title="Download file PDF asli"
          >
            {isDownloadingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#D5AA53]" />
            ) : (
              <Download className="w-4 h-4 text-[#D5AA53]" />
            )}
            <span>{isDownloadingPdf ? 'Memproses...' : 'Download PDF'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#123B35] hover:bg-[#1a544b] text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer transition-colors"
            title="Cetak lewat printer browser"
          >
            <Printer className="w-4 h-4 text-[#D5AA53]" />
            <span>Cetak</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 transition-colors cursor-pointer"
              title="Tutup (Esc)"
              aria-label="Tutup pratinjau bukti pendaftaran"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Printable Paper Area */}
      <div id="spmb-printable-receipt" className="text-stone-900 bg-white">
        {/* Kop Surat Resmi */}
        <div className="flex items-center gap-4 pb-4 border-b-2 border-stone-800 mb-6">
          {schoolProfile.branding?.receiptLogoUrl || schoolProfile.branding?.mainLogoUrl ? (
            <img
              src={schoolProfile.branding?.receiptLogoUrl || schoolProfile.branding?.mainLogoUrl}
              alt="Logo Resmi Sekolah"
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
            <p className="text-xs font-semibold text-[#174C80] uppercase tracking-wider">
              Yayasan Bina Insan Cendikia Kalibaru · NPSN: {schoolProfile.npsn} · Terakreditasi {schoolProfile.accreditation}
            </p>
            <p className="text-[11px] text-stone-600 mt-0.5">
              {schoolProfile.address}, {schoolProfile.district}, {schoolProfile.regency}, {schoolProfile.province} {schoolProfile.postalCode}
            </p>
            <p className="text-[11px] text-stone-500">
              Telp: {schoolProfile.phone} · WhatsApp: {schoolProfile.whatsapp} · Email: {schoolProfile.email}
            </p>
          </div>
        </div>

        {/* Title & Registration Number Card */}
        <div className="text-center my-4">
          <h3 className="text-base font-bold uppercase tracking-wider text-stone-900">
            Tanda Bukti Pendaftaran Calon Murid Baru
          </h3>
          <p className="text-xs text-stone-500">Tahun Ajaran 2027 / 2028</p>

          <div className="mt-3 inline-block bg-[#F7F8F5] border border-stone-300 rounded-xl px-6 py-2.5">
            <span className="text-[10px] text-stone-500 uppercase tracking-widest font-semibold block">
              Nomor Registrasi Resmi
            </span>
            <span className="text-xl font-mono font-black text-[#123B35] tracking-widest">
              {registration.registrationNumber}
            </span>
          </div>
        </div>

        {/* Status Alert Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 my-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span className="font-semibold text-emerald-900">
              Status Berkas Saat Ini: <strong className="uppercase">{registration.status}</strong>
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 font-mono">
            Tercatat: {formatDateId(registration.submittedAt)}
          </span>
        </div>

        {/* Data Calon Murid */}
        <div className="mt-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#123B35] bg-stone-100 px-3 py-1.5 rounded-md mb-2">
            A. Identitas Calon Murid
          </h4>
          <table className="w-full text-xs text-stone-800">
            <tbody>
              <tr className="border-b border-stone-100">
                <td className="py-1.5 font-medium text-stone-600 w-44">Nama Lengkap</td>
                <td className="py-1.5 font-bold uppercase">: {student.fullName}</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-1.5 font-medium text-stone-600">Nama Panggilan</td>
                <td className="py-1.5">: {student.nickname}</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-1.5 font-medium text-stone-600">Jenis Kelamin</td>
                <td className="py-1.5">: {student.gender}</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-1.5 font-medium text-stone-600">Tempat, Tanggal Lahir</td>
                <td className="py-1.5">: {student.birthPlace}, {formatDateId(student.birthDate)}</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-1.5 font-medium text-stone-600">NIK Calon Murid</td>
                <td className="py-1.5 font-mono">: {student.nik}</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-1.5 font-medium text-stone-600">Asal Satuan TK/RA/PAUD</td>
                <td className="py-1.5">: {student.previousSchool || '-'}</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-1.5 font-medium text-stone-600">Alamat Tempat Tinggal</td>
                <td className="py-1.5">: {student.address}, {student.village}, {student.district}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Data Orang Tua / Wali */}
        <div className="mt-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#123B35] bg-stone-100 px-3 py-1.5 rounded-md mb-2">
            B. Identitas Orang Tua / Wali
          </h4>
          <table className="w-full text-xs text-stone-800">
            <tbody>
              <tr className="border-b border-stone-100">
                <td className="py-1.5 font-medium text-stone-600 w-44">Nama Ayah Kandung</td>
                <td className="py-1.5">: {parent.fatherName}</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-1.5 font-medium text-stone-600">Pekerjaan Ayah</td>
                <td className="py-1.5">: {parent.fatherJob} ({parent.fatherPhone})</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-1.5 font-medium text-stone-600">Nama Ibu Kandung</td>
                <td className="py-1.5">: {parent.motherName}</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-1.5 font-medium text-stone-600">Pekerjaan Ibu</td>
                <td className="py-1.5">: {parent.motherJob} ({parent.motherPhone})</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Petunjuk & Syarat Observasi */}
        <div className="mt-5 p-3 rounded-lg border border-stone-200 bg-[#F7F8F5] text-[11px] text-stone-600">
          <p className="font-bold text-stone-900 mb-1">Catatan & Petunjuk Penting:</p>
          <ol className="list-decimal pl-4 space-y-0.5 leading-relaxed">
            <li>Harap simpan dan bawa bukti pendaftaran ini (dalam bentuk cetak atau PDF di smartphone) saat menghadiri observasi.</li>
            <li>Jadwal observasi pemetaan belajar ananda dan wawancara orang tua akan dikonfirmasikan melalui WhatsApp Panitia SPMB.</li>
            <li>Wali murid dapat terus memantau pembaruan status pendaftaran melalui menu <strong>Cek Status Pendaftaran</strong> di website sekolah.</li>
          </ol>
        </div>

        {/* Tanda Tangan */}
        <div className="mt-8 pt-4 flex justify-between items-start text-xs text-center">
          <div className="w-48">
            <p className="text-stone-600">Wali Murid Calon Siswa,</p>
            <div className="h-16"></div>
            <p className="font-semibold text-stone-900 underline">({parent.fatherName || parent.motherName})</p>
          </div>

          <div className="w-56">
            <p className="text-stone-600">Kalibaru, {formatDateId(registration.submittedAt)}</p>
            <p className="text-stone-600">Ketua Panitia SPMB,</p>
            <div className="h-14 flex items-center justify-center">
              <span className="text-[10px] text-stone-400 italic">[Stempel & Tanda Tangan]</span>
            </div>
            <p className="font-semibold text-stone-900 underline">
              ( {schoolProfile.spmbChairmanName || 'Tasyantik Salsabilla, S.Pd.'} )
            </p>
          </div>
        </div>
      </div>

      {onClose && (
        <div className="no-print mt-6 pt-4 border-t border-stone-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Tutup Pratinjau
          </button>
        </div>
      )}
    </div>
  );
};
