/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Registration, SpmbWave } from '../../../types';
import { formatDateId } from '../../../lib/utils';
import { BellRing, CheckCircle, Search, Calendar, ShieldCheck } from 'lucide-react';

interface SelectionAnnouncementProps {
  registrations: Registration[];
  wave: SpmbWave;
  onUpdateWave: (wave: Partial<SpmbWave>) => Promise<void>;
}

export const SelectionAnnouncement: React.FC<SelectionAnnouncementProps> = ({
  registrations,
  wave,
  onUpdateWave
}) => {
  const [announcementDate, setAnnouncementDate] = useState(wave.announcementDate);
  const [isPublished, setIsPublished] = useState(true);
  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const accepted = registrations.filter(r => r.status === 'Diterima' || r.status === 'Daftar Ulang');
  const filtered = accepted.filter(r => 
    r.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
    r.student.fullName.toLowerCase().includes(search.toLowerCase()) ||
    r.parent.fatherName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveDate = async () => {
    setIsSaving(true);
    try {
      await onUpdateWave({ announcementDate });
      alert('Tanggal pengumuman kelulusan berhasil diperbarui.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase text-emerald-800 tracking-wider">
            Modul 6 · Pengumuman Kelulusan
          </span>
          <h2 className="text-2xl font-bold text-stone-900 mt-0.5">
            Pengelolaan Pengumuman Hasil Seleksi
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Atur tanggal rilis dan kelola publikasi daftar calon murid baru yang dinyatakan diterima.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPublished(!isPublished)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              isPublished
                ? 'bg-emerald-800 text-white'
                : 'bg-stone-200 text-stone-700'
            }`}
          >
            Status: {isPublished ? 'Pengumuman DIBUKA (Aktif)' : 'Pengumuman DITUTUP (Draft)'}
          </button>
        </div>
      </div>

      {/* Date settings card */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-end gap-4 text-xs">
        <div className="flex-1 w-full">
          <label className="block font-bold text-stone-900 mb-1">
            Tanggal Resmi Rilis Pengumuman:
          </label>
          <input
            type="date"
            value={announcementDate}
            onChange={e => setAnnouncementDate(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-stone-300 font-mono text-xs"
          />
        </div>
        <button
          onClick={handleSaveDate}
          disabled={isSaving}
          className="px-5 py-2.5 bg-[#123B35] hover:bg-[#1a544b] text-white font-semibold rounded-lg shadow-xs cursor-pointer"
        >
          {isSaving ? 'Menyimpan...' : 'Simpan Tanggal'}
        </button>
      </div>

      {/* List of Accepted Students */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-stone-900">
              Daftar Calon Murid Diterima ({accepted.length} Siswa)
            </h3>
            <p className="text-xs text-stone-500">
              Siswa yang telah memenuhi ambang batas nilai observasi dan disetujui pimpinan sekolah.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama atau nomor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-300"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8F5] border-b border-stone-200 font-bold uppercase text-stone-600 text-[10px]">
              <tr>
                <th className="py-3 px-4">No. Registrasi</th>
                <th className="py-3 px-4">Nama Calon Murid</th>
                <th className="py-3 px-4">L/P</th>
                <th className="py-3 px-4">Skor Total</th>
                <th className="py-3 px-4">Nama Orang Tua</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-stone-50">
                  <td className="py-3 px-4 font-mono font-bold text-[#123B35]">
                    {r.registrationNumber}
                  </td>
                  <td className="py-3 px-4 font-bold text-stone-900">
                    {r.student.fullName}
                  </td>
                  <td className="py-3 px-4 font-medium">
                    {r.student.gender === 'Laki-laki' ? 'L' : 'P'}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                    {r.selection?.totalScore || '90.0'}
                  </td>
                  <td className="py-3 px-4 text-stone-600">
                    {r.parent.fatherName}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
