/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  SchoolProfile,
  ProgramUnggulan,
  Extracurricular,
  GalleryItem,
  Achievement,
  NewsItem,
  SpmbWave
} from '../../types';
import { GoogleMapSection } from '../common/GoogleMapSection';
import { Lightbox } from '../common/Lightbox';
import { formatDateId } from '../../lib/utils';
import { PublicPage } from '../layout/Navbar';
import {
  ArrowRight,
  Sparkles,
  BookOpen,
  Award,
  Users,
  CheckCircle,
  Calendar,
  ChevronRight,
  Eye,
  HeartHandshake
} from 'lucide-react';

interface HomeSectionProps {
  schoolProfile: SchoolProfile;
  programs: ProgramUnggulan[];
  extracurriculars: Extracurricular[];
  gallery: GalleryItem[];
  achievements: Achievement[];
  news: NewsItem[];
  wave: SpmbWave;
  onNavigate: (page: PublicPage) => void;
  onOpenNewsDetail: (item: NewsItem) => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  schoolProfile,
  programs,
  extracurriculars,
  gallery,
  achievements,
  news,
  wave,
  onNavigate,
  onOpenNewsDetail
}) => {
  const [lightboxImage, setLightboxImage] = useState<GalleryItem | null>(null);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#123B35] to-[#0e302b] text-white">
        <div className="absolute inset-0 opacity-15 mix-blend-overlay">
          <img
            src={schoolProfile.branding?.heroBannerUrl || "/src/assets/images/hero_school_building_1793682340462.jpg"}
            alt="Gedung Sekolah SDIT Insan Cendikia Kalibaru"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#D5AA53] uppercase tracking-widest">
                <span>Sekolah Dasar Islam Terpadu</span>
                <span aria-hidden="true">·</span>
                <span>NPSN: {schoolProfile.npsn}</span>
                <span aria-hidden="true">·</span>
                <span>Terakreditasi {schoolProfile.accreditation}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white font-serif max-w-2xl">
                Membangun Generasi Islami, Cerdas, dan Berakhlak Mulia
              </h1>

              <p className="text-sm sm:text-base text-stone-200 leading-relaxed max-w-xl">
                Pendidikan dasar Islam terpadu yang memadukan keunggulan tahfidz Al-Qur'an bersanad, pembiasaan akhlak karimah, dan sains modern di lingkungan asri lereng Gunung Raung Kalibaru Banyuwangi.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-4">
                <button
                  onClick={() => onNavigate('wizard')}
                  className="w-full sm:w-auto px-6 py-3.5 bg-[#D5AA53] hover:bg-[#c49942] text-stone-900 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <span>Daftar SPMB Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('cek-status')}
                  className="w-full sm:w-auto px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <span>Cek Status Pendaftaran</span>
                </button>

                <button
                  onClick={() => onNavigate('profil')}
                  className="w-full sm:w-auto px-5 py-3 text-stone-300 hover:text-white font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                >
                  <span>Jelajahi Profil</span>
                  <ChevronRight className="w-4 h-4 text-[#D5AA53]" />
                </button>
              </div>

              {/* Trust stats */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-[#D5AA53] block">
                    A Unggul
                  </span>
                  <span className="text-stone-300 text-[11px]">Akreditasi Sekolah</span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-[#D5AA53] block">
                    3 Juz
                  </span>
                  <span className="text-stone-300 text-[11px]">Target Tahfidz SD</span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-[#D5AA53] block">
                    1 : 14
                  </span>
                  <span className="text-stone-300 text-[11px]">Rasio Guru & Siswa</span>
                </div>
              </div>
            </div>

            {/* Right Featured Image Frame */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-stone-900 group aspect-4/3">
                <img
                  src="/src/assets/images/hero_school_building_1793682340462.jpg"
                  alt="Gedung SDIT Insan Cendikia Kalibaru"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                  <span className="text-xs text-[#D5AA53] font-semibold">Lingkungan Sekolah Terpadu</span>
                  <h4 className="text-sm font-bold mt-0.5">Jl. Pahlawan, Kalibaru Kulon, Banyuwangi</h4>
                  <p className="text-[11px] text-stone-300 mt-1">Lingkungan belajar ramah anak, nyaman, dan berwawasan alam hijau.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SAMBUTAN KEPALA SEKOLAH & PROFIL RINGKAS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 flex flex-col items-center text-center">
              <div className="w-36 h-36 rounded-2xl bg-emerald-900 overflow-hidden border-4 border-emerald-100 shadow-md mb-4 flex items-center justify-center text-white">
                <span className="text-4xl font-serif text-[#D5AA53]">RH</span>
              </div>
              <h3 className="font-bold text-base text-stone-900">
                {schoolProfile.headmasterName}
              </h3>
              <p className="text-xs text-emerald-800 font-semibold mt-0.5">
                Kepala Sekolah SDIT Insan Cendikia Kalibaru
              </p>
              <span className="text-[11px] text-stone-500 mt-1">
                Magister Pendidikan Islam
              </span>
            </div>

            <div className="lg:col-span-8 space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed border-t lg:border-t-0 lg:border-l border-stone-200 lg:pl-8 pt-6 lg:pt-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                <span>Sambutan Pimpinan Sekolah</span>
              </div>
              <blockquote className="font-serif italic text-base sm:text-lg text-stone-900 leading-snug">
                "{schoolProfile.headmasterGreeting}"
              </blockquote>
              <p className="text-stone-600">
                Kami meyakini bahwa setiap anak memiliki fitrah kebaikan dan kecerdasan unik. Di SDIT Insan Cendikia Kalibaru, proses belajar bukan sekadar transfer ilmu pengetahuan, namun penanaman adab, cinta Al-Qur'an, dan pembentukan watak tangguh berkarakter.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('profil')}
                  className="font-bold text-[#123B35] hover:text-[#174C80] inline-flex items-center gap-1 text-xs cursor-pointer"
                >
                  <span>Baca Sejarah & Visi Misi Lengkap</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROGRAM UNGGULAN HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              <span>Kurikulum & Pembiasaan</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
              Program Unggulan Sekolah
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
              Pilar pendidikan terpadu yang membekali ananda dengan kekuatan spiritual, intelektual, dan ketangkasan sosial.
            </p>
          </div>

          <button
            onClick={() => onNavigate('program')}
            className="text-xs font-bold text-[#123B35] hover:text-[#174C80] flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>Lihat Semua Program</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {programs.slice(0, 4).map(prog => (
            <div
              key={prog.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="h-44 bg-stone-100 overflow-hidden relative">
                <img
                  src={prog.imageUrl || '/src/assets/images/student_learning_activity_1793682341759.jpg'}
                  alt={prog.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-[#123B35]/90 text-[#D5AA53] text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                  {prog.category}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-stone-900 leading-snug">
                    {prog.title}
                  </h3>
                  <p className="text-xs text-stone-600 mt-2 line-clamp-3 leading-relaxed">
                    {prog.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100">
                  <span className="text-[11px] text-emerald-800 font-semibold block">
                    {prog.detailedPoints.length} Fokus Pembiasaan Terarah
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. EKSTRAKURIKULER PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#F7F8F5] rounded-3xl border border-stone-200 p-8 sm:p-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
                Pengembangan Bakat & Minat
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
                Ekstrakurikuler Pilihan Siswa
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
                Dari kepanduan Pramuka SIT, olahraga sunnah panahan, hingga coding dan kaligrafi mushaf.
              </p>
            </div>

            <button
              onClick={() => onNavigate('ekstrakurikuler')}
              className="text-xs font-bold text-[#123B35] hover:text-[#174C80] flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Jelajahi Ekstrakurikuler</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {extracurriculars.slice(0, 3).map(ekskul => (
              <div key={ekskul.id} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs">
                <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block mb-1">
                  {ekskul.category}
                </span>
                <h4 className="text-base font-bold text-stone-900">{ekskul.name}</h4>
                <p className="text-xs text-stone-600 mt-1.5 line-clamp-2 leading-relaxed">
                  {ekskul.description}
                </p>
                <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-500 space-y-0.5">
                  <p>Pelatih: <strong className="text-stone-800">{ekskul.coach}</strong></p>
                  <p>Waktu: <strong>{ekskul.schedule}</strong></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. GALERI KEGIATAN SISWA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
              Dokumentasi Sekolah
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
              Galeri Kegiatan Siswa
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Potret keceriaan ananda saat belajar, menghafal Al-Qur'an, dan berinteraksi di sekolah.
            </p>
          </div>

          <button
            onClick={() => onNavigate('galeri')}
            className="text-xs font-bold text-[#123B35] hover:text-[#174C80] flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>Buka Galeri Lengkap</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {gallery.slice(0, 4).map(item => (
            <div
              key={item.id}
              onClick={() => setLightboxImage(item)}
              className="group relative rounded-2xl overflow-hidden aspect-4/3 bg-stone-900 cursor-pointer shadow-2xs"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-white">
                <span className="text-[10px] text-[#D5AA53]">{item.category}</span>
                <p className="text-xs font-bold truncate">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. PRESTASI SISWA (DEMO TAGGED) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
                Capaian & Prestasi
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
                Prestasi Siswa Cendikia
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Penghargaan di bidang tahfidz Al-Qur'an, olimpiade sains matematika, dan seni olahraga.
              </p>
            </div>

            <button
              onClick={() => onNavigate('prestasi')}
              className="text-xs font-bold text-[#123B35] hover:text-[#174C80] flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Lihat Semua Prestasi</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.slice(0, 2).map(ach => (
              <div key={ach.id} className="p-5 rounded-2xl bg-[#F7F8F5] border border-stone-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-800">
                      Tingkat {ach.level} · {ach.category}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold uppercase tracking-wider">
                      CONTOH DEMO
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-stone-900">{ach.title}</h4>
                  <p className="text-xs font-bold text-[#174C80] mt-1">{ach.rank}</p>
                  <p className="text-xs text-stone-700 mt-1">Peraih: <strong>{ach.studentName}</strong></p>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">{ach.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. BERITA & PENGUMUMAN TERBARU */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
              Warta & Informasi
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
              Berita & Artikel Sekolah
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Kabar kegiatan terkini, panduan parenting islami, dan pengumuman resmi.
            </p>
          </div>

          <button
            onClick={() => onNavigate('berita')}
            className="text-xs font-bold text-[#123B35] hover:text-[#174C80] flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>Arsip Berita</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.slice(0, 3).map(item => (
            <div
              key={item.id}
              onClick={() => onOpenNewsDetail(item)}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
            >
              <div className="h-44 bg-stone-100 overflow-hidden">
                <img
                  src={item.imageUrl || '/src/assets/images/hero_school_building_1793682340462.jpg'}
                  alt={item.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-2">
                    <span className="text-emerald-800 font-semibold">{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatDateId(item.publishedAt)}</span>
                  </div>
                  <h4 className="font-bold text-sm text-stone-900 leading-snug line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="text-xs text-stone-600 mt-2 line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 text-xs font-bold text-[#123B35] flex items-center gap-1">
                  <span>Baca Selengkapnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. SPMB CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#123B35] to-[#174C80] text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-bold text-[#D5AA53] uppercase tracking-wider block">
              Penerimaan Murid Baru TA {wave.academicYear}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Daftarkan Ananda Sekarang di SDIT Insan Cendikia Kalibaru
            </h2>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
              Kuota terbatas 60 siswa (2 rombel paralel). Pendaftaran online dibuka hingga {formatDateId(wave.endDate)}. Fasilitas ruang ber-AC, masjid luas, dan guru bersertifikasi.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => onNavigate('wizard')}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#D5AA53] hover:bg-[#c49942] text-stone-900 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-transform hover:-translate-y-0.5 cursor-pointer text-center min-h-[44px] flex items-center justify-center gap-2"
              >
                <span>Mulai Pendaftaran Online</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('spmb')}
                className="w-full sm:w-auto px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 transition-colors cursor-pointer text-center min-h-[44px] flex items-center justify-center"
              >
                <span>Persyaratan & Jadwal</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. PETA LOKASI SEKOLAH GOOGLE MAPS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
            Akses & Navigasi
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
            Lokasi Sekolah
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Mudah dijangkau di pusat Kalibaru Kulon Banyuwangi, hanya beberapa menit dari jalur utama provinsi.
          </p>
        </div>

        <GoogleMapSection
          lat={schoolProfile.coordinates.lat}
          lng={schoolProfile.coordinates.lng}
          address={schoolProfile.address}
          schoolName={schoolProfile.name}
        />
      </section>

      {/* Lightbox for gallery preview */}
      {lightboxImage && (
        <Lightbox
          isOpen={true}
          onClose={() => setLightboxImage(null)}
          imageUrl={lightboxImage.imageUrl}
          title={lightboxImage.title}
          description={lightboxImage.description}
          date={lightboxImage.date}
        />
      )}
    </div>
  );
};
