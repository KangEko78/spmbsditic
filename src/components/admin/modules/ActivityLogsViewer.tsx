/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ActivityLog } from '../../../types';
import { formatDateTimeId, getRoleLabel } from '../../../lib/utils';
import { History, Search, ShieldAlert, RefreshCw } from 'lucide-react';

interface ActivityLogsViewerProps {
  logs: ActivityLog[];
  onRefresh: () => void;
}

export const ActivityLogsViewer: React.FC<ActivityLogsViewerProps> = ({ logs, onRefresh }) => {
  const [search, setSearch] = useState('');

  const filtered = logs.filter(l =>
    l.userName.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-xs text-stone-800">
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase text-emerald-800 tracking-wider">
            Modul 20 · Audit Trail & Keamanan
          </span>
          <h2 className="text-2xl font-bold text-stone-900 mt-0.5">
            Log Aktivitas & Riwayat Transaksi Sistem
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Pencatatan rekam jejak setiap aksi administratif: login, verifikasi berkas, penilaian, dan mutasi data pendaftar.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-lg border border-stone-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-emerald-800" />
          <span>Segarkan Log</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-3 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama pengguna, jenis tindakan, atau detail aktivitas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-stone-300"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F7F8F5] border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px]">
            <tr>
              <th className="py-3 px-4">Waktu (WIB)</th>
              <th className="py-3 px-4">Pengguna</th>
              <th className="py-3 px-4">Peran</th>
              <th className="py-3 px-4">Tindakan</th>
              <th className="py-3 px-4">Rincian Aktivitas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-stone-400">
                  Belum ada log aktivitas yang tercatat.
                </td>
              </tr>
            ) : (
              filtered.map(l => (
                <tr key={l.id} className="hover:bg-stone-50">
                  <td className="py-2.5 px-4 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                    {formatDateTimeId(l.timestamp)}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-stone-900">{l.userName}</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 text-[10px] font-semibold text-stone-700">
                      {getRoleLabel(l.userRole)}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-[#123B35] whitespace-nowrap">
                    {l.action}
                  </td>
                  <td className="py-2.5 px-4 text-stone-600">{l.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
