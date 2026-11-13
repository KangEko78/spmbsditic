/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Achievement } from '../../types';
import { Award, AlertCircle, Calendar } from 'lucide-react';
import { formatDateId } from '../../lib/utils';

interface AchievementsSectionProps {
  achievements: Achievement[];
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({ achievements }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-stone-800">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold text-emerald-800 uppercase tracking-widest block">
          Penghargaan & Apresiasi
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-serif">
          Prestasi Siswa SDIT Insan Cendikia
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Ikhtiar dan kerja keras ananda dalam mengharumkan nama sekolah dan keluarga di berbagai kompetisi tahfidz, sains, dan olahraga.
        </p>
      </div>

      {/* Demo notice alert */}
      <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-center gap-3 text-xs max-w-3xl mx-auto shadow-2xs">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
        <p className="leading-relaxed">
          <strong>Keterangan Resmi Data Contoh (DEMO):</strong> Sesuai panduan integritas sekolah, seluruh prestasi pada daftar di bawah ini merupakan <em>contoh simulasi (mock demo)</em> yang dapat diperbarui dan diganti dengan data sertifikat asli sekolah oleh operator melalui Dashboard Admin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {achievements.map(ach => (
          <div
            key={ach.id}
            className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-emerald-800">
                  Tingkat {ach.level} · {ach.category}
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold tracking-wider">
                  CONTOH DEMO
                </span>
              </div>

              <h3 className="text-lg font-bold text-stone-900 leading-snug">
                {ach.title}
              </h3>
              <p className="text-sm font-black text-[#174C80] mt-1">{ach.rank}</p>

              <div className="mt-3 p-3 rounded-xl bg-[#F7F8F5] border border-stone-200 space-y-1 text-xs">
                <p className="text-stone-700">
                  Peraih: <strong className="text-stone-900">{ach.studentName}</strong>
                </p>
                <p className="text-[11px] text-stone-500 font-mono">
                  Waktu: {formatDateId(ach.date)}
                </p>
              </div>

              <p className="text-xs text-stone-600 mt-3 leading-relaxed">
                {ach.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
