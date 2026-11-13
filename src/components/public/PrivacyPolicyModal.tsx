import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { useModalDismiss } from '../../hooks/useModalDismiss';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  useModalDismiss(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl border border-stone-200 max-w-2xl w-full max-h-[88vh] overflow-y-auto p-6 sm:p-8 shadow-2xl text-stone-800 text-xs space-y-4 my-auto relative">
        <div className="flex justify-between items-start border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-800" />
            <h3 className="text-base font-bold text-stone-900">
              Kebijakan Privasi & Perlindungan Data Siswa
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 transition-colors cursor-pointer"
            title="Tutup (Esc)"
            aria-label="Tutup kebijakan privasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 leading-relaxed text-stone-600">
          <p>
            SDIT Insan Cendikia Kalibaru berkomitmen penuh melindungi privasi calon peserta didik dan keluarga besar wali murid. Seluruh informasi data pribadi yang dikumpulkan melalui portal Sistem Penerimaan Murid Baru (SPMB) ini diatur dengan standar kerahasiaan ketat.
          </p>

          <h4 className="font-bold text-stone-900 text-xs">1. Data yang Dikumpulkan</h4>
          <p>
            Data yang dikumpulkan meliputi data identitas calon murid (nama lengkap, tanggal lahir, NIK, alamat domisili) serta identitas orang tua/wali dan dokumen pendukung kependudukan (Kartu Keluarga, Akta Kelahiran, Pas Foto).
          </p>

          <h4 className="font-bold text-stone-900 text-xs">2. Tujuan Penggunaan Data</h4>
          <p>
            Seluruh data digunakan semata-mata untuk verifikasi administrasi penerimaan siswa baru, pencatatan Buku Induk Sekolah, sinkronisasi Dapodik Kemendikbudristek, dan komunikasi resmi terkait jadwal observasi atau daftar ulang.
          </p>

          <h4 className="font-bold text-stone-900 text-xs">3. Perlindungan & Kerahasiaan (Tidak Dipublikasikan)</h4>
          <p>
            Data pribadi seperti Nomor Induk Kependudukan (NIK), alamat tempat tinggal lengkap, nomor telepon orang tua, dan berkas pindai tidak pernah ditampilkan pada halaman publik website. Data hanya dapat diakses oleh Panitia SPMB yang terotentikasi dan wali murid bersangkutan.
          </p>

          <h4 className="font-bold text-stone-900 text-xs">4. Hak Akses & Koreksi</h4>
          <p>
            Wali murid berhak meninjau, mengoreksi, atau mengajukan perbaikan data melalui menu Cek Status Pendaftaran atau dengan menghubungi sekretariat panitia SPMB di sekolah SDIT Insan Cendikia Kalibaru.
          </p>
        </div>

        <div className="pt-4 border-t border-stone-100 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#123B35] text-white font-bold rounded-xl text-xs hover:bg-[#1a544b] cursor-pointer shadow-xs"
          >
            Saya Memahami & Menyetujui
          </button>
        </div>
      </div>
    </div>
  );
};
