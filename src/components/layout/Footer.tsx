/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SchoolProfile } from '../../types';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';
import { PublicPage } from './Navbar';

interface FooterProps {
  schoolProfile: SchoolProfile;
  onNavigate: (page: PublicPage) => void;
  onOpenPrivacy: () => void;
  onGoToDashboard: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  schoolProfile,
  onNavigate,
  onOpenPrivacy,
  onGoToDashboard
}) => {
  return (
    <footer className="bg-[#123B35] text-stone-300 pt-16 pb-12 border-t border-[#1b544b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#1b544b]">
          {/* Col 1: Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {schoolProfile.branding?.footerLogoUrl || schoolProfile.branding?.mainLogoUrl ? (
                <img
                  src={schoolProfile.branding?.footerLogoUrl || schoolProfile.branding?.mainLogoUrl}
                  alt={schoolProfile.name}
                  className="h-11 w-auto max-w-[140px] object-contain rounded-lg bg-white p-1 shrink-0 shadow-xs"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-[#D5AA53] flex items-center justify-center font-bold text-[#123B35] text-base shrink-0 shadow-xs">
                  IC
                </div>
              )}
              <div>
                <h3 className="font-extrabold text-white text-base tracking-tight leading-tight">
                  {schoolProfile.name}
                </h3>
                <p className="text-xs text-[#D5AA53] uppercase font-semibold">
                  NPSN: {schoolProfile.npsn} · Akreditasi {schoolProfile.accreditation}
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Membangun Generasi Islami, Cerdas, dan Berakhlak Mulia berlandaskan Al-Qur'an dan As-Sunnah di lereng asri Gunung Raung Kalibaru Banyuwangi.
            </p>

            <div className="pt-1">
              <span className="text-[11px] text-stone-400 block font-medium">Naungan Yayasan:</span>
              <p className="text-xs font-semibold text-white">Yayasan Bina Insan Cendikia Kalibaru</p>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#D5AA53] font-bold mb-4">
              Jelajahi Sekolah
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('profil')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Profil & Visi Misi
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('program')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Program Tahfidz & BPI
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('ekstrakurikuler')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Ekstrakurikuler Panahan & Pramuka SIT
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('prestasi')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Prestasi Siswa Cendikia
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('galeri')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Galeri Dokumentasi KBM
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('berita')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Berita & Pengumuman
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: SPMB Online */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#D5AA53] font-bold mb-4">
              Penerimaan Murid Baru
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('spmb')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Informasi & Jadwal Gelombang
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('cek-status')}
                  className="hover:text-[#D5AA53] transition-colors cursor-pointer font-semibold text-emerald-300"
                >
                  Cek Status Pendaftaran (2FA)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('wizard')}
                  className="text-[#D5AA53] font-bold hover:underline cursor-pointer"
                >
                  Daftar Online Calon Murid
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('portal')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Cek Status / Login Wali Murid
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenPrivacy}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Kebijakan Privasi & Data Anak
                </button>
              </li>
              <li>
                <button
                  onClick={onGoToDashboard}
                  className="text-stone-400 hover:text-[#D5AA53] transition-colors cursor-pointer pt-2 block"
                >
                  Portal Petugas & Admin (20 Modul)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contacts & Hours */}
          <div className="space-y-3 text-xs">
            <h4 className="text-xs uppercase tracking-widest text-[#D5AA53] font-bold mb-4">
              Kontak & Alamat
            </h4>

            <p className="flex items-start gap-2.5 text-stone-300">
              <MapPin className="w-4 h-4 text-[#D5AA53] shrink-0 mt-0.5" />
              <span>{schoolProfile.address}, {schoolProfile.district}, {schoolProfile.regency}, {schoolProfile.province} {schoolProfile.postalCode}</span>
            </p>

            <p className="flex items-center gap-2.5 text-stone-300">
              <Phone className="w-4 h-4 text-[#D5AA53] shrink-0" />
              <span>Telp: {schoolProfile.phone} · WA: {schoolProfile.whatsapp}</span>
            </p>

            <p className="flex items-center gap-2.5 text-stone-300">
              <Mail className="w-4 h-4 text-[#D5AA53] shrink-0" />
              <span>{schoolProfile.email}</span>
            </p>

            <div className="pt-2 border-t border-[#1b544b] text-[11px] text-stone-400">
              <p className="flex items-center gap-1.5 font-medium text-stone-300">
                <Clock className="w-3.5 h-3.5 text-[#D5AA53]" />
                <span>Jam Pelayanan Tata Usaha:</span>
              </p>
              <p className="mt-0.5">Senin - Jumat: 07.30 - 15.30 WIB</p>
              <p>Sabtu: 08.00 - 12.00 WIB (Sesi Observasi)</p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>
            &copy; {new Date().getFullYear()} SDIT Insan Cendikia Kalibaru Banyuwangi. Hak Cipta Dilindungi Undang-Undang.
          </p>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={onOpenPrivacy}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Kebijakan Privasi
            </button>
            <span>·</span>
            <span>Didukung SPMB Cloud Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
