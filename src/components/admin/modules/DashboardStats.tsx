/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Registration, SpmbWave } from '../../../types';
import {
  Users,
  Clock,
  CheckCircle,
  Award,
  UserCheck,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

interface DashboardStatsProps {
  registrations: Registration[];
  wave: SpmbWave;
  onNavigateToModule: (moduleKey: any) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  registrations,
  wave,
  onNavigateToModule
}) => {
  const total = registrations.length;
  const waitingVerification = registrations.filter(r => r.status === 'Menunggu Verifikasi').length;
  const verified = registrations.filter(r => r.status === 'Terverifikasi').length;
  const inSelection = registrations.filter(r => r.status === 'Dalam Seleksi').length;
  const accepted = registrations.filter(r => r.status === 'Diterima').length;
  const reRegistered = registrations.filter(r => r.status === 'Daftar Ulang').length;
  const needRevision = registrations.filter(r => r.status === 'Perlu Perbaikan').length;

  const quotaPercent = Math.min(100, Math.round((total / (wave.quota || 1)) * 100));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs font-semibold uppercase text-emerald-800 tracking-wider">
            Pusat Kendali SPMB
          </span>
          <h2 className="text-2xl font-bold text-stone-900 mt-0.5">
            Ringkasan Statistik Penerimaan Murid Baru
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Tahun Ajaran {wave.academicYear} · {wave.name}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/export/registrations.csv"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#123B35] hover:bg-[#1a544b] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#D5AA53]" />
            <span>Unduh Laporan CSV</span>
          </a>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div 
          onClick={() => onNavigateToModule('registrations')}
          className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs hover:border-[#123B35] transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Total Pendaftar</span>
            <Users className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl font-extrabold text-stone-900 font-mono tabular-nums">{total}</p>
          <p className="text-[11px] text-stone-500 mt-1">Kapasitas Kuota: {wave.quota} siswa</p>
        </div>

        <div 
          onClick={() => onNavigateToModule('verification')}
          className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs hover:border-amber-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Menunggu Verifikasi</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-700 font-mono tabular-nums">{waitingVerification}</p>
          <p className="text-[11px] text-stone-500 mt-1">{needRevision} berkas perlu perbaikan</p>
        </div>

        <div 
          onClick={() => onNavigateToModule('students')}
          className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs hover:border-sky-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Terverifikasi</span>
            <CheckCircle className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-extrabold text-sky-700 font-mono tabular-nums">{verified + inSelection}</p>
          <p className="text-[11px] text-stone-500 mt-1">Siap observasi & tes</p>
        </div>

        <div 
          onClick={() => onNavigateToModule('selection')}
          className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs hover:border-emerald-500 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Diterima (Lulus)</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 font-mono tabular-nums">{accepted}</p>
          <p className="text-[11px] text-stone-500 mt-1">Menunggu daftar ulang</p>
        </div>

        <div 
          onClick={() => onNavigateToModule('reregistration')}
          className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs hover:border-teal-500 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Daftar Ulang</span>
            <UserCheck className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-extrabold text-teal-800 font-mono tabular-nums">{reRegistered}</p>
          <p className="text-[11px] text-stone-500 mt-1">Siswa resmi terdaftar</p>
        </div>
      </div>

      {/* Quota Progress & Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quota Gauge */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
          <h3 className="text-sm font-bold text-stone-900 mb-1">
            Keterisian Kuota Gelombang 1
          </h3>
          <p className="text-xs text-stone-500 mb-4">
            Target penerimaan kelas 1 SD: 2 rombel (60 siswa)
          </p>

          <div className="space-y-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-stone-600">Pendaftar Masuk:</span>
              <span className="font-mono text-stone-900 font-bold">{total} / {wave.quota} ({quotaPercent}%)</span>
            </div>
            <div className="w-full bg-stone-100 h-3.5 rounded-full overflow-hidden">
              <div
                className="bg-[#123B35] h-full rounded-full transition-all duration-500"
                style={{ width: `${quotaPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-stone-500">
              <span>Sisa Kuota: <strong>{Math.max(0, wave.quota - total)}</strong> kursi</span>
              <span>Status: <strong className="text-emerald-700">Pendaftaran Buka</strong></span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 text-xs text-stone-600 space-y-1">
            <p><strong>Batas Akhir:</strong> 31 Desember 2026</p>
            <p><strong>Pengumuman:</strong> 10 Januari 2027</p>
            <p><strong>Daftar Ulang:</strong> 12 - 25 Januari 2027</p>
          </div>
        </div>

        {/* Status Distribution Breakdown */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
          <h3 className="text-sm font-bold text-stone-900 mb-1">
            Distribusi Status Pendaftar Saat Ini
          </h3>
          <p className="text-xs text-stone-500 mb-4">
            Alur verifikasi berkas dan tahapan seleksi calon murid
          </p>

          <div className="space-y-3">
            {[
              { label: 'Menunggu Verifikasi Berkas', count: waitingVerification, color: 'bg-amber-500' },
              { label: 'Perlu Perbaikan Dokumen', count: needRevision, color: 'bg-rose-500' },
              { label: 'Berkas Sah & Terverifikasi', count: verified, color: 'bg-sky-500' },
              { label: 'Tahap Observasi & Seleksi', count: inSelection, color: 'bg-indigo-500' },
              { label: 'Diterima / Lulus Seleksi', count: accepted, color: 'bg-emerald-600' },
              { label: 'Telah Selesai Daftar Ulang', count: reRegistered, color: 'bg-teal-700' }
            ].map((item, idx) => {
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-stone-700">{item.label}</span>
                    <span className="font-mono tabular-nums text-stone-900 font-bold">{item.count} siswa ({pct}%)</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`${item.color} h-full rounded-full`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
