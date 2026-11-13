/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ProgramUnggulan } from '../../../types';
import { api } from '../../../lib/api';
import { Sparkles, Plus, Edit2, Trash2, X, CheckCircle2 } from 'lucide-react';

interface ProgramManagerProps {
  programs: ProgramUnggulan[];
  onRefresh: () => void;
}

export const ProgramManager: React.FC<ProgramManagerProps> = ({ programs, onRefresh }) => {
  const [editingProgram, setEditingProgram] = useState<Partial<ProgramUnggulan> | null>(null);
  const [pointsInput, setPointsInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenEdit = (prog: ProgramUnggulan) => {
    setEditingProgram(prog);
    setPointsInput(prog.detailedPoints.join('\n'));
  };

  const handleOpenNew = () => {
    setEditingProgram({
      title: '',
      category: 'Pendidikan Islam',
      description: '',
      detailedPoints: [],
      imageUrl: '/src/assets/images/student_learning_activity_1793682341759.jpg',
      isPublished: true,
      order: programs.length + 1
    });
    setPointsInput('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProgram?.title) return;
    setIsSaving(true);
    try {
      const detailedPoints = pointsInput
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      await api.saveProgram({
        ...editingProgram,
        detailedPoints
      });
      setEditingProgram(null);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus program unggulan ini?')) return;
    await api.deleteProgram(id);
    onRefresh();
  };

  return (
    <div className="space-y-6 text-xs text-stone-800">
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase text-emerald-800 tracking-wider">
            Modul 11 · Kurikulum & Program Unggulan
          </span>
          <h2 className="text-2xl font-bold text-stone-900 mt-0.5">
            Manajemen Program Unggulan Sekolah
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Program pendidikan Islam, Tahfidz Al-Qur'an, pembiasaan ibadah, dan pembinaan karakter murid.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#123B35] hover:bg-[#1a544b] text-white font-semibold rounded-lg shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#D5AA53]" />
          <span>Tambah Program Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {programs.map(prog => (
          <div key={prog.id} className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold">
                  {prog.category}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  prog.isPublished ? 'bg-sky-50 text-sky-800' : 'bg-stone-100 text-stone-500'
                }`}>
                  {prog.isPublished ? 'Dipublikasikan' : 'Draft'}
                </span>
              </div>
              <h4 className="font-bold text-stone-900 text-base">{prog.title}</h4>
              <p className="text-stone-600 mt-1 leading-relaxed">{prog.description}</p>

              <ul className="mt-3 space-y-1 pl-4 list-disc text-stone-600">
                {prog.detailedPoints.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end gap-1.5 mt-4 pt-3 border-t border-stone-100">
              <button
                onClick={() => handleOpenEdit(prog)}
                className="p-1.5 text-stone-600 hover:text-emerald-800 hover:bg-stone-50 rounded"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(prog.id)}
                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {editingProgram && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingProgram(null);
          }}
        >
          <form onSubmit={handleSave} className="bg-white rounded-3xl border border-stone-200 max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4 my-auto relative">
            <div className="flex justify-between items-center border-b border-stone-200 pb-2">
              <h3 className="font-bold text-base text-stone-900">
                {editingProgram.id ? 'Edit Program Unggulan' : 'Tambah Program Baru'}
              </h3>
              <button type="button" onClick={() => setEditingProgram(null)}>
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            <div>
              <label className="block font-medium mb-1">Judul Program:</label>
              <input
                type="text"
                required
                value={editingProgram.title || ''}
                onChange={e => setEditingProgram({ ...editingProgram, title: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-stone-300 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1">Kategori:</label>
                <select
                  value={editingProgram.category || 'Pendidikan Islam'}
                  onChange={e => setEditingProgram({ ...editingProgram, category: e.target.value as any })}
                  className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                >
                  <option value="Tahfidz Al-Qur'an">Tahfidz Al-Qur'an</option>
                  <option value="Pendidikan Islam">Pendidikan Islam</option>
                  <option value="Akademik">Akademik</option>
                  <option value="Karakter & Adab">Karakter & Adab</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Status Publikasi:</label>
                <select
                  value={editingProgram.isPublished ? 'true' : 'false'}
                  onChange={e => setEditingProgram({ ...editingProgram, isPublished: e.target.value === 'true' })}
                  className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                >
                  <option value="true">Tampilkan di Web Publik</option>
                  <option value="false">Simpan sebagai Draft</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">Deskripsi Singkat:</label>
              <textarea
                rows={2}
                value={editingProgram.description || ''}
                onChange={e => setEditingProgram({ ...editingProgram, description: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-stone-300"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Poin-poin Detail Kegiatan (1 baris per poin):</label>
              <textarea
                rows={4}
                placeholder="Target hafalan 2 Juz&#10;Murojaah harian pagi&#10;Ujian tasmi satu majelis"
                value={pointsInput}
                onChange={e => setPointsInput(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-stone-300 font-sans"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setEditingProgram(null)}
                className="px-4 py-2 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-[#123B35] text-white font-bold rounded-lg hover:bg-[#1a544b]"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Program'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
