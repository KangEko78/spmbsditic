/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SpmbWave, SchoolProfile } from '../../types';
import { formatDateId, formatRupiah } from '../../lib/utils';
import {
  CalendarDays,
  Users,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Clock,
  UserCheck
} from 'lucide-react';

interface SpmbSectionProps {
  wave: SpmbWave;
  schoolProfile: SchoolProfile;
  onStartRegistration: () => void;
  onGoToPortal: () => void;
}

export const SpmbSection: React.FC<SpmbSectionProps> = ({
  wave,
  schoolProfile,
  onStartRegistration,
  onGoToPortal
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const remainingQuota = Math.max(0, wave.quota - wave.registeredCount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 text-stone-800">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold text-emerald-800 uppercase tracking-widest block">
          Penerimaan Murid Baru
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-serif">
          Sistem Informasi SPMB Online TA {wave.academicYear}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Pendaftaran calon siswa baru jenjang Sekolah Dasar (SD) secara terpadu, mudah, transparan, dan terpercaya.
        </p>
      </div>

      {/* Quota & Dates Big Card */}
      <div className="bg-gradient-to-r from-[#123B35] to-[#174C80] text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none">
          <img
            src={schoolProfile.branding?.spmbBannerUrl || '/src/assets/images/student_learning_activity_1793682341759.jpg'}
            alt="Suasana Belajar Siswa"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold text-[#D5AA53] uppercase tracking-wider block">
              {wave.name}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Pendaftaran Gelombang 1 Dibuka
            </h2>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed max-w-lg">
              Periode pendaftaran: <strong>{formatDateId(wave.startDate)}</strong> s.d. <strong>{formatDateId(wave.endDate)}</strong>. Segera daftarkan ananda sebelum kuota terpenuhi.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onStartRegistration}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#D5AA53] hover:bg-[#c49942] text-stone-900 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
              >
                <span>Mulai Pendaftaran Online</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onGoToPortal}
                className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 transition-colors cursor-pointer text-center min-h-[44px] flex items-center justify-center"
              >
                <span>Cek Status Pendaftaran</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-300">Target Daya Tampung:</span>
              <span className="font-bold text-lg font-mono text-[#D5AA53]">{wave.quota} Siswa</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-300">Pendaftar Terverifikasi:</span>
              <span className="font-bold font-mono">{wave.registeredCount} Siswa</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-300">Sisa Kuota Tersedia:</span>
              <span className="font-bold font-mono text-emerald-300 text-base">{remainingQuota} Kursi</span>
            </div>

            <div className="pt-3 border-t border-white/15 text-[11px] text-stone-300 space-y-1">
              <p>📅 Pengumuman: <strong>{formatDateId(wave.announcementDate)}</strong></p>
              <p>📋 Daftar Ulang: <strong>{formatDateId(wave.reRegistrationStartDate)} - {formatDateId(wave.reRegistrationEndDate)}</strong></p>
            </div>
          </div>
        </div>
      </div>

      {/* Persyaratan Pendaftaran */}
      <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-10 shadow-xs space-y-6">
        <div className="border-b border-stone-100 pb-3">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
            Kelengkapan Berkas
          </span>
          <h3 className="text-2xl font-bold text-stone-900 mt-1 font-serif">
            Persyaratan Calon Murid Baru
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {wave.requirements.map((req, i) => (
            <div key={i} className="p-4 bg-[#F7F8F5] rounded-xl border border-stone-200 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span className="text-stone-700 leading-relaxed font-medium">{req}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Alur Pendaftaran (6 Steps Overview) */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
            Panduan Langkah
          </span>
          <h3 className="text-2xl font-bold text-stone-900 mt-1 font-serif">
            Alur Penerimaan Murid Baru
          </h3>
          <p className="text-xs text-stone-600 mt-1">
            Enam langkah mudah dari pengisian formulir hingga penyelesaian daftar ulang resmi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wave.selectionFlow.map(step => (
            <div key={step.step} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-full bg-[#123B35] text-[#D5AA53] font-bold text-xs flex items-center justify-center">
                {step.step}
              </div>
              <h4 className="font-bold text-sm text-stone-900">{step.title}</h4>
              <p className="text-xs text-stone-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-10 shadow-xs space-y-6">
        <div>
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
            Tanya Jawab Seputar SPMB
          </span>
          <h3 className="text-2xl font-bold text-stone-900 mt-1 font-serif">
            Pertanyaan Sering Diajukan (FAQ)
          </h3>
          <p className="text-xs text-stone-600 mt-1">
            Penjelasan seputar usia minimal, kesiapan baca Al-Qur'an, dan fasilitas katering/antar jemput.
          </p>
        </div>

        <div className="divide-y divide-stone-200">
          {wave.faq.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div key={index} className="py-4">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center text-left text-xs sm:text-sm font-bold text-stone-900 cursor-pointer gap-4"
                >
                  <span>{item.question}</span>
                  <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <p className="mt-2 text-xs text-stone-600 leading-relaxed pl-1 animate-fade-in">
                    {item.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
