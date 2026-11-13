/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Registration } from '../../../types';
import { formatDateId } from '../../../lib/utils';
import { Search, GraduationCap, User, Phone, MapPin } from 'lucide-react';

interface StudentDatabaseProps {
  registrations: Registration[];
}

export const StudentDatabase: React.FC<StudentDatabaseProps> = ({ registrations }) => {
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Laki-laki' | 'Perempuan'>('all');

  const filtered = registrations.filter(r => {
    const s = r.student;
    const matchSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.nik.includes(search) ||
      (s.previousSchool || '').toLowerCase().includes(search.toLowerCase());
    const matchGender = genderFilter === 'all' || s.gender === genderFilter;
    return matchSearch && matchGender;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase text-emerald-800 tracking-wider">
            Modul 4 · Data Calon Murid
          </span>
          <h2 className="text-2xl font-bold text-stone-900 mt-0.5">
            Buku Induk Master Calon Murid Baru
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Data biodata kependudukan, demografi asal sekolah, dan identitas keluarga ananda.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama anak, NIK 16 digit, atau nama TK..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-[#123B35]"
          />
        </div>
        <select
          value={genderFilter}
          onChange={e => setGenderFilter(e.target.value as any)}
          className="text-xs py-2 px-3 rounded-lg border border-stone-300 bg-white font-medium text-stone-700"
        >
          <option value="all">Semua Jenis Kelamin</option>
          <option value="Laki-laki">Hanya Laki-laki</option>
          <option value="Perempuan">Hanya Perempuan</option>
        </select>
      </div>

      {/* Grid of Student Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(r => (
          <div key={r.id} className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-start justify-between gap-3 mb-3 border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-800 block">
                  {r.registrationNumber}
                </span>
                <h4 className="text-sm font-bold text-stone-900">
                  {r.student.fullName} ({r.student.nickname})
                </h4>
                <p className="text-[11px] text-stone-500">
                  {r.student.gender} · {r.student.birthPlace}, {formatDateId(r.student.birthDate)}
                </p>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-semibold shrink-0">
                Gol. {r.student.bloodType || 'A'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-stone-500">NIK:</span>
                <span className="font-mono font-medium text-stone-800">{r.student.nik}</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>Asal: <strong>{r.student.previousSchool || 'Belum TK'}</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{r.student.address}, {r.student.village}, {r.student.district}</span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-stone-100 text-[11px]">
                <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>Ayah: {r.parent.fatherName} ({r.parent.fatherPhone})</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
