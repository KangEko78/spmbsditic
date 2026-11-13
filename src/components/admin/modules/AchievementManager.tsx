/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Achievement } from '../../../types';
import { api } from '../../../lib/api';
import { Award, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

interface AchievementManagerProps {
  achievements: Achievement[];
  onRefresh: () => void;
}

export const AchievementManager: React.FC<AchievementManagerProps> = ({
  achievements,
  onRefresh
}) => {
  const [editingItem, setEditingItem] = useState<Partial<Achievement> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.title || !editingItem?.studentName) return;
    setIsSaving(true);
    try {
      await api.saveAchievement({
        ...editingItem,
        isDemo: true // Enforced DEMO label
      });
      setEditingItem(null);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus data prestasi ini?')) return;
    await api.deleteAchievement(id);
    onRefresh();
  };

  return (
    <div className="space-y-6 text-xs text-stone-800">
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase text-emerald-800 tracking-wider">
            Modul 14 · Prestasi Siswa & Lembaga
          </span>
          <h2 className="text-2xl font-bold text-stone-900 mt-0.5">
            Manajemen Penghargaan & Prestasi
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Data prestasi siswa SDIT Insan Cendikia Kalibaru (diberi tanda DEMO transparan untuk membedakan data contoh).
          </p>
        </div>

        <button
          onClick={() => setEditingItem({
            title: '',
            studentName: '',
            level: 'Kabupaten',
            category: 'Tahfidz & Agama',
            rank: 'Juara 1',
            date: new Date().toISOString().split('T')[0],
            description: '',
            isDemo: true,
            imageUrl: '/src/assets/images/tahfidz_quran_activity_1793682341601.jpg'
          })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#123B35] hover:bg-[#1a544b] text-white font-semibold rounded-lg shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#D5AA53]" />
          <span>Tambah Prestasi (Demo)</span>
        </button>
      </div>

      <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl flex items-center gap-2 text-xs">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Kebijakan Integritas Data:</strong> Sesuai instruksi pengerjaan, seluruh prestasi di bawah ini dilabeli sebagai <strong>DEMO</strong> agar tidak mengarang dokumentasi resmi sebelum sekolah memasukkan piagam aslinya.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map(ach => (
          <div key={ach.id} className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold">
                  Tingkat {ach.level} · {ach.category}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold uppercase tracking-wider">
                  CONTOH DEMO
                </span>
              </div>

              <h4 className="font-bold text-stone-900 text-base">{ach.title}</h4>
              <p className="text-emerald-800 font-bold text-xs mt-0.5">{ach.rank}</p>
              <p className="text-stone-700 font-medium text-xs mt-1">Peraih: {ach.studentName}</p>
              <p className="text-stone-500 mt-1 line-clamp-2">{ach.description}</p>
            </div>

            <div className="flex justify-end gap-1.5 mt-4 pt-3 border-t border-stone-100">
              <button
                onClick={() => setEditingItem(ach)}
                className="p-1.5 text-stone-600 hover:text-emerald-800 hover:bg-stone-50 rounded"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(ach.id)}
                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingItem(null);
          }}
        >
          <form onSubmit={handleSave} className="bg-white rounded-3xl border border-stone-200 max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4 my-auto relative">
            <div className="flex justify-between items-center border-b border-stone-200 pb-2">
              <h3 className="font-bold text-base text-stone-900">
                {editingItem.id ? 'Edit Prestasi' : 'Tambah Prestasi Baru (Demo)'}
              </h3>
              <button type="button" onClick={() => setEditingItem(null)}>
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            <div>
              <label className="block font-medium mb-1">Nama Prestasi / Perlombaan:</label>
              <input
                type="text"
                required
                placeholder="Contoh: Juara 1 MHQ 2 Juz Tingkat Kabupaten"
                value={editingItem.title || ''}
                onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-stone-300 font-bold"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Peraih Prestasi (Nama Siswa & Kelas):</label>
              <input
                type="text"
                required
                placeholder="Muhammad Rayyan (Kelas 3)"
                value={editingItem.studentName || ''}
                onChange={e => setEditingItem({ ...editingItem, studentName: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-stone-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1">Tingkat:</label>
                <select
                  value={editingItem.level || 'Kabupaten'}
                  onChange={e => setEditingItem({ ...editingItem, level: e.target.value as any })}
                  className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                >
                  <option value="Kecamatan">Kecamatan</option>
                  <option value="Kabupaten">Kabupaten</option>
                  <option value="Karesidenan">Karesidenan</option>
                  <option value="Provinsi">Provinsi</option>
                  <option value="Nasional">Nasional</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Peringkat:</label>
                <input
                  type="text"
                  placeholder="Juara 1 / Medali Emas"
                  value={editingItem.rank || ''}
                  onChange={e => setEditingItem({ ...editingItem, rank: e.target.value })}
                  className="w-full p-2 rounded-lg border border-stone-300"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">Deskripsi Singkat:</label>
              <textarea
                rows={2}
                value={editingItem.description || ''}
                onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-stone-300"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-[#123B35] text-white font-bold rounded-lg hover:bg-[#1a544b]"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Prestasi'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
