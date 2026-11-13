/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ProgramUnggulan } from '../../types';
import { CheckCircle2, BookOpen, Sparkles, Heart } from 'lucide-react';

interface ProgramsSectionProps {
  programs: ProgramUnggulan[];
  onStartRegistration: () => void;
}

export const ProgramsSection: React.FC<ProgramsSectionProps> = ({
  programs,
  onStartRegistration
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 text-stone-800">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold text-emerald-800 uppercase tracking-widest block">
          Pendidikan Islam Terpadu
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-serif">
          Program Unggulan SDIT Insan Cendikia Kalibaru
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Kurikulum khas Sekolah Islam Terpadu yang mengintegrasikan kecerdasan intelektual (IQ), emosional (EQ), dan spiritual (SQ).
        </p>
      </div>

      <div className="space-y-12">
        {programs.map((prog, idx) => {
          const isEven = idx % 2 === 1;
          return (
            <div
              key={prog.id}
              className={`bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
                isEven ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className={`lg:col-span-5 aspect-4/3 sm:aspect-16/10 lg:aspect-auto lg:h-full bg-stone-100 overflow-hidden ${isEven ? 'lg:order-2' : ''}`}>
                <img
                  src={prog.imageUrl || '/src/assets/images/tahfidz_quran_activity_1793682341601.jpg'}
                  alt={prog.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className={`lg:col-span-7 p-6 sm:p-10 space-y-4 ${isEven ? 'lg:order-1' : ''}`}>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  <span>Program #{idx + 1}</span>
                  <span aria-hidden="true">·</span>
                  <span>{prog.category}</span>
                </div>

                <h3 className="text-2xl font-bold text-stone-900 font-serif leading-tight">
                  {prog.title}
                </h3>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {prog.description}
                </p>

                <div className="pt-2 border-t border-stone-100">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-stone-800 mb-2">
                    Capaian & Metode Pembiasaan:
                  </h4>
                  <ul className="space-y-2 text-xs text-stone-600">
                    {prog.detailedPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#123B35] rounded-3xl p-8 sm:p-12 text-center text-white space-y-4">
        <h3 className="text-2xl sm:text-3xl font-extrabold font-serif">
          Ingin Ananda Bertumbuh dengan Program Terbaik?
        </h3>
        <p className="text-xs sm:text-sm text-stone-200 max-w-xl mx-auto">
          Daftarkan ananda pada gelombang penerimaan murid baru SDIT Insan Cendikia Kalibaru. Kuota terbatas 60 siswa.
        </p>
        <button
          onClick={onStartRegistration}
          className="px-8 py-3.5 bg-[#D5AA53] hover:bg-[#c49942] text-stone-900 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer"
        >
          Daftar SPMB Online Sekarang
        </button>
      </div>
    </div>
  );
};
