/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SchoolProfile, Teacher } from '../../types';
import { Building2, Award, Users, BookOpen, CheckCircle2, MapPin } from 'lucide-react';

interface ProfileSectionProps {
  schoolProfile: SchoolProfile;
  teachers: Teacher[];
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ schoolProfile, teachers }) => {
  const [selectedDivision, setSelectedDivision] = useState<string>('all');

  const filteredTeachers = selectedDivision === 'all'
    ? teachers
    : teachers.filter(t => t.division === selectedDivision);

  const divisions = ['all', 'Pimpinan', 'Guru Kelas', 'Guru Al-Qur\'an', 'Guru Bidang Studi', 'Tenaga Kependidikan'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 text-stone-800">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold text-emerald-800 uppercase tracking-widest block">
          Profil Lembaga Pendidikan
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-serif">
          Mengenal Lebih Dekat SDIT Insan Cendikia Kalibaru
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Pondasi akidah kokoh, akhlak mulia, hafalan Al-Qur'an tartil, dan kecakapan akademik berkualitas tinggi di Kalibaru Banyuwangi.
        </p>
      </div>

      {/* Identitas Sekolah Grid */}
      <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-xs">
        <h3 className="text-base font-bold text-[#123B35] border-b border-stone-100 pb-3 mb-4">
          Identitas & Legalitas Sekolah
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          <div>
            <span className="text-stone-500 block">Nama Resmi:</span>
            <span className="font-bold text-stone-900">{schoolProfile.name}</span>
          </div>
          <div>
            <span className="text-stone-500 block">NPSN:</span>
            <span className="font-mono font-bold text-emerald-800">{schoolProfile.npsn}</span>
          </div>
          <div>
            <span className="text-stone-500 block">Akreditasi:</span>
            <span className="font-bold text-stone-900">{schoolProfile.accreditation}</span>
          </div>
          <div>
            <span className="text-stone-500 block">Jenjang Pendidikan:</span>
            <span className="font-bold text-stone-900">Sekolah Dasar (SD)</span>
          </div>
          <div className="lg:col-span-2">
            <span className="text-stone-500 block">Alamat Sekolah:</span>
            <span>{schoolProfile.address}, {schoolProfile.district}, {schoolProfile.regency}, {schoolProfile.province}</span>
          </div>
          <div>
            <span className="text-stone-500 block">Yayasan Pembina:</span>
            <span className="font-semibold text-stone-900">Yayasan Bina Insan Cendikia</span>
          </div>
          <div>
            <span className="text-stone-500 block">Kontak Resmi:</span>
            <span className="font-mono">{schoolProfile.phone} / {schoolProfile.whatsapp}</span>
          </div>
        </div>
      </div>

      {/* Sejarah & Sambutan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-xs space-y-4">
          <span className="text-xs font-semibold uppercase text-emerald-800 tracking-wider block">
            Kilas Perjalanan
          </span>
          <h3 className="text-2xl font-bold text-stone-900 font-serif">
            Sejarah Pendirian Sekolah
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {schoolProfile.history}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-xs space-y-4">
          <span className="text-xs font-semibold uppercase text-emerald-800 tracking-wider block">
            Kepala Sekolah
          </span>
          <h3 className="text-2xl font-bold text-stone-900 font-serif">
            Sambutan {schoolProfile.headmasterName}
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed italic">
            "{schoolProfile.headmasterGreeting}"
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BAGIAN VISI SEKOLAH (MENONJOL, ELEGAN, SESUAI IDENTITAS ISLAM TERPADU) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#123B35] via-[#164740] to-[#0c2824] text-white p-8 sm:p-14 shadow-xl border border-emerald-900/40">
        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xs border border-[#D5AA53]/30 text-[#D5AA53] text-xs font-bold uppercase tracking-widest">
            <span>✨</span>
            <span>Visi Utama Sekolah</span>
          </div>

          <div className="py-2">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-serif text-[#D5AA53] tracking-tight drop-shadow-xs">
              "{schoolProfile.vision}"
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-2xl mx-auto">
            Komitmen terpadu SDIT Insan Cendikia Kalibaru dalam mengantarkan setiap peserta didik menjadi pribadi berakhlak mulia, berpikiran maju dan cemerlang, serta memiliki ketangguhan karakter mandiri.
          </p>

          {/* 3 Pilar Penjabaran Visi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-left">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-xs font-bold text-[#D5AA53] block mb-1">01. SHOLIH</span>
              <p className="text-[11px] text-stone-200 leading-relaxed">
                Taat beribadah, mencintai Al-Qur'an, santun beradab, dan meneladani Rasulullah SAW dalam keseharian.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-xs font-bold text-[#D5AA53] block mb-1">02. CERDAS</span>
              <p className="text-[11px] text-stone-200 leading-relaxed">
                Memiliki nalar kritis, wawasan sains modern, kecakapan literasi-numerasi, serta prestatif (IQ & EQ).
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-xs font-bold text-[#D5AA53] block mb-1">03. MANDIRI</span>
              <p className="text-[11px] text-stone-200 leading-relaxed">
                Disiplin, bertanggung jawab, mencintai kebersihan, dan memiliki daya juang pantang menyerah (AQ).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BAGIAN MISI SEKOLAH (3 KARTU TERSENDIRI DENGAN IKON RELEVAN & PROFESIONAL) */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block">
            Langkah Nyata Pendidikan
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
            Misi Pendidikan SDIT Insan Cendikia Kalibaru
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            Tiga pilar strategis yang melandasi seluruh kurikulum, pembiasaan adab, dan program pembelajaran di sekolah kami.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Kartu Misi 1 */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-lg group-hover:bg-[#123B35] group-hover:text-[#D5AA53] transition-colors">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black font-mono text-stone-200 group-hover:text-emerald-800 transition-colors">
                  01
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                  Pilar Spiritual & Akhlak
                </span>
                <h3 className="font-bold text-base text-stone-900 leading-snug">
                  Ibadah & Cinta Al-Qur'an
                </h3>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {schoolProfile.mission[0] || "Membekali Peserta Didik Taat Beribadah, Berakhlak Mulia, dan Cinta Al-Qur'an."}
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-stone-100 flex items-center gap-2 text-[11px] font-semibold text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#D5AA53]" />
              <span>Sholat Berjamaah & Tahfidz Al-Qur'an</span>
            </div>
          </div>

          {/* Kartu Misi 2 */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-lg group-hover:bg-[#123B35] group-hover:text-[#D5AA53] transition-colors">
                  <Award className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black font-mono text-stone-200 group-hover:text-emerald-800 transition-colors">
                  02
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                  Pilar Intelektual & Emosional
                </span>
                <h3 className="font-bold text-base text-stone-900 leading-snug">
                  Pembelajaran Menyenangkan & Prestatif
                </h3>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {schoolProfile.mission[1] || "Mengembangkan Proses Pembelajaran yang Menyenangkan dan Prestatif (IQ dan EQ)."}
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-stone-100 flex items-center gap-2 text-[11px] font-semibold text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#D5AA53]" />
              <span>Eksplorasi Tematik, Sains & Coding</span>
            </div>
          </div>

          {/* Kartu Misi 3 */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-lg group-hover:bg-[#123B35] group-hover:text-[#D5AA53] transition-colors">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black font-mono text-stone-200 group-hover:text-emerald-800 transition-colors">
                  03
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                  Pilar Karakter & Ketangguhan
                </span>
                <h3 className="font-bold text-base text-stone-900 leading-snug">
                  Hidup Bersih & Disiplin
                </h3>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {schoolProfile.mission[2] || "Membiasakan Hidup Bersih dan Disiplin (AQ)."}
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-stone-100 flex items-center gap-2 text-[11px] font-semibold text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#D5AA53]" />
              <span>Budaya 5S, Lingkungan Asri & Mandiri</span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Capaian Lulusan */}
      <div className="bg-[#F7F8F5] rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Standar Kompetensi
            </span>
            <h3 className="text-lg font-bold text-stone-900 font-serif">
              Target Profil Capaian Lulusan
            </h3>
          </div>
          <span className="text-xs text-stone-500">Standar mutu lulusan SDIT Insan Cendikia</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {schoolProfile.goals.map((g, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-stone-200 flex items-start gap-3 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-[#D5AA53] shrink-0 mt-0.5" />
              <p className="text-xs text-stone-700 leading-relaxed">{g}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DEWAN GURU & TENAGA KEPENDIDIKAN DENGAN FITUR FOTO PROFIL */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
              Pendidik Berkompeten
            </span>
            <h2 className="text-2xl font-bold text-stone-900 mt-1 font-serif">
              Data Guru & Tenaga Kependidikan
            </h2>
            <p className="text-xs text-stone-600 mt-1">
              Dipandu oleh asatidz dan pimpinan yang amanah, berdedikasi, dan tersertifikasi di bidangnya.
            </p>
          </div>

          {/* Filter division */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {divisions.map(d => (
              <button
                key={d}
                onClick={() => setSelectedDivision(d)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedDivision === d
                    ? 'bg-[#123B35] text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                {d === 'all' ? 'Semua Divisi' : d}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredTeachers.map(tch => (
            <div
              key={tch.id}
              className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                {/* Foto Profil Guru: Seragam, Proporsional, tidak gepeng */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-stone-100 border border-stone-200 mb-3 flex items-center justify-center">
                  {tch.imageUrl ? (
                    <img
                      src={tch.imageUrl}
                      alt={tch.name}
                      className="w-full h-full object-cover object-top"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        // Fallback jika foto gagal load
                        (e.target as HTMLElement).style.display = 'none';
                        const parent = (e.target as HTMLElement).parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.className = 'w-full h-full flex flex-col items-center justify-center bg-[#123B35] text-[#D5AA53] font-bold text-2xl font-serif';
                          fallback.innerText = tch.name.charAt(0);
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-b from-[#123B35] to-[#0d2a26] text-[#D5AA53] p-4 text-center">
                      <div className="w-16 h-16 rounded-full bg-white/10 border border-[#D5AA53]/30 flex items-center justify-center font-bold text-2xl font-serif mb-1 shadow-inner">
                        {tch.name.charAt(0)}
                      </div>
                      <span className="text-[10px] text-stone-300 font-medium">{tch.division}</span>
                    </div>
                  )}

                  {/* Badge Divisi di Sudut Foto */}
                  <span className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-xs">
                    {tch.division}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-stone-900 text-sm leading-snug line-clamp-2" title={tch.name}>
                    {tch.name}
                  </h4>
                  <p className="text-xs text-[#174C80] font-semibold">{tch.title}</p>
                  <p className="text-xs font-semibold text-emerald-900 mt-1">{tch.role}</p>
                  <p className="text-[11px] text-stone-500">{tch.education}</p>
                </div>
              </div>

              {tch.quote && (
                <p className="text-[10px] text-stone-500 italic mt-3 pt-2 border-t border-stone-100">
                  "{tch.quote}"
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Fasilitas Sekolah */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
            Sarana & Prasarana
          </span>
          <h2 className="text-2xl font-bold text-stone-900 mt-1 font-serif">
            Fasilitas Pembelajaran Modern & Asri
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Fasilitas lengkap untuk mendukung kenyamanan ibadah, studi akademik, dan kebugaran ananda.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {schoolProfile.facilities.map(fac => (
            <div key={fac.id} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-2">
                <Building2 className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-stone-900 text-sm">{fac.name}</h4>
              <p className="text-xs text-stone-600 leading-relaxed">{fac.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
