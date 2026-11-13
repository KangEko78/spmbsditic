/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Teacher } from '../../../types';
import { api } from '../../../lib/api';
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
  Camera,
  Upload,
  UserCheck,
  AlertCircle,
  GraduationCap
} from 'lucide-react';

interface TeacherManagerProps {
  teachers: Teacher[];
  onRefresh: () => void;
}

export const TeacherManager: React.FC<TeacherManagerProps> = ({ teachers, onRefresh }) => {
  const [editingTeacher, setEditingTeacher] = useState<Partial<Teacher> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setPhotoUploadError('Ukuran file foto maksimal 3MB.');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      setPhotoUploadError('Format file harus berupa JPG, PNG, atau WEBP.');
      return;
    }

    setPhotoUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setEditingTeacher(prev => prev ? { ...prev, imageUrl: reader.result as string } : null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setEditingTeacher(prev => prev ? { ...prev, imageUrl: '' } : null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher?.name || !editingTeacher?.role) return;
    setIsSaving(true);
    try {
      await api.saveTeacher(editingTeacher);
      setEditingTeacher(null);
      setPhotoUploadError(null);
      onRefresh();
    } catch (err: any) {
      console.error(err);
      alert('Gagal menyimpan data guru: ' + (err.message || 'Error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus data guru/staf "${name}"?`)) return;
    await api.deleteTeacher(id);
    onRefresh();
  };

  return (
    <div className="space-y-6 text-xs text-stone-800">
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase text-emerald-800 tracking-wider">
            Modul 10 · Tenaga Pendidik & Kependidikan
          </span>
          <h2 className="text-2xl font-bold text-stone-900 mt-0.5">
            Manajemen Dewan Guru & Pimpinan Sekolah
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Kelola data pimpinan sekolah, ketua panitia SPMB, dewan asatidz tahfidz Al-Qur'an, guru kelas, dan staf kependidikan lengkap dengan foto profil.
          </p>
        </div>

        <button
          onClick={() => {
            setPhotoUploadError(null);
            setEditingTeacher({
              name: '',
              title: 'S.Pd.',
              role: 'Guru Kelas',
              division: 'Guru Kelas',
              education: 'S1 PGSD',
              quote: '',
              imageUrl: '',
              order: teachers.length + 1
            });
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#123B35] hover:bg-[#1a544b] text-white font-semibold rounded-xl shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4 text-[#D5AA53]" />
          <span>Tambah Guru / Pimpinan Baru</span>
        </button>
      </div>

      {/* Grid of Teachers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {teachers.map(tch => (
          <div
            key={tch.id}
            className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs flex flex-col justify-between hover:shadow-md transition-shadow group"
          >
            <div>
              {/* Foto Guru: Seragam, tidak gepeng */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-stone-100 border border-stone-200 mb-3 flex items-center justify-center">
                {tch.imageUrl ? (
                  <img
                    src={tch.imageUrl}
                    alt={tch.name}
                    className="w-full h-full object-cover object-top"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                      const parent = (e.target as HTMLElement).parentElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = 'w-full h-full flex flex-col items-center justify-center bg-[#123B35] text-[#D5AA53] font-bold text-2xl font-serif';
                        fallback.innerText = tch.name.charAt(0);
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-b from-[#123B35] to-[#0d2a26] text-[#D5AA53] p-4 text-center">
                    <div className="w-14 h-14 rounded-full bg-white/10 border border-[#D5AA53]/30 flex items-center justify-center font-bold text-2xl font-serif mb-1 shadow-inner">
                      {tch.name.charAt(0)}
                    </div>
                    <span className="text-[10px] text-stone-300 font-medium">{tch.division}</span>
                  </div>
                )}

                {/* Badge Divisi & Urutan */}
                <span className="absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-xs">
                  {tch.division}
                </span>
                <span className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#D5AA53] text-stone-900 shadow-xs">
                  #{tch.order}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-stone-900 text-sm leading-snug line-clamp-2" title={tch.name}>
                  {tch.name}
                </h4>
                <p className="text-xs text-[#174C80] font-semibold">{tch.title}</p>
                <p className="text-xs font-semibold text-emerald-900 mt-1">{tch.role}</p>
                <p className="text-[11px] text-stone-500">{tch.education}</p>
              </div>

              {tch.quote && (
                <p className="text-stone-500 text-[10px] italic mt-2.5 pt-2 border-t border-stone-100 line-clamp-2">
                  "{tch.quote}"
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-1.5 mt-4 pt-2.5 border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  setPhotoUploadError(null);
                  setEditingTeacher({ ...tch });
                }}
                className="px-2.5 py-1.5 bg-stone-100 hover:bg-[#123B35] text-stone-700 hover:text-white rounded-lg transition-colors flex items-center gap-1 font-medium cursor-pointer"
                title="Edit Profil Guru & Foto"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(tch.id, tch.name)}
                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white rounded-lg transition-colors flex items-center gap-1 font-medium cursor-pointer"
                title="Hapus Data Guru"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Add Modal */}
      {editingTeacher && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingTeacher(null);
          }}
        >
          <form
            onSubmit={handleSave}
            className="bg-white rounded-3xl border border-stone-200 max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4 my-auto relative"
          >
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                  {editingTeacher.id ? 'Perbarui Profil' : 'Formulir Baru'}
                </span>
                <h3 className="font-bold text-base text-stone-900">
                  {editingTeacher.id ? 'Edit Data & Foto Guru' : 'Tambah Guru / Pimpinan Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingTeacher(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ========================================================================= */}
            {/* BAGIAN FOTO PROFIL GURU: UPLOAD LANGSUNG, PRATINJAU, GANTI, HAPUS */}
            {/* ========================================================================= */}
            <div className="p-4 bg-linear-to-b from-[#F7F8F5] to-stone-100 rounded-2xl border border-stone-200 space-y-3">
              <label className="block font-bold text-stone-900 text-xs">
                Foto Profil Guru / Pimpinan:
              </label>

              {photoUploadError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{photoUploadError}</span>
                </div>
              )}

              <div className="flex items-center gap-4">
                {/* Kotak Pratinjau Foto */}
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white border-2 border-[#123B35]/20 shadow-xs flex items-center justify-center shrink-0 relative">
                  {editingTeacher.imageUrl ? (
                    <img
                      src={editingTeacher.imageUrl}
                      alt="Pratinjau Foto"
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full bg-stone-200 flex flex-col items-center justify-center text-stone-400 p-2 text-center">
                      <Camera className="w-6 h-6 mb-1 text-stone-400" />
                      <span className="text-[9px] font-bold">Tanpa Foto</span>
                    </div>
                  )}
                </div>

                {/* Tombol Pilih / Ganti / Hapus Foto */}
                <div className="space-y-1.5 flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-[#123B35] hover:bg-[#1a544b] text-white rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#D5AA53]" />
                      <span>{editingTeacher.imageUrl ? 'Ganti Foto' : 'Pilih Foto'}</span>
                    </button>

                    {editingTeacher.imageUrl && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Foto</span>
                      </button>
                    )}
                  </div>

                  <p className="text-[10px] text-stone-500 leading-tight">
                    Pilih file gambar langsung dari perangkat Anda (JPG, PNG, atau WEBP maks 3MB). Foto akan dipratinjau dan tersimpan permanen.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">Nama Lengkap & Gelar Kehormatan:</label>
              <input
                type="text"
                required
                placeholder="Contoh: Jaya Saputra Ria Novandanu, S.Pd., Gr."
                value={editingTeacher.name || ''}
                onChange={e => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1">Gelar Akademik:</label>
                <input
                  type="text"
                  placeholder="Contoh: S.Pd., Gr. / M.Pd"
                  value={editingTeacher.title || ''}
                  onChange={e => setEditingTeacher({ ...editingTeacher, title: e.target.value })}
                  className="w-full p-2 rounded-xl border border-stone-300"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Divisi:</label>
                <select
                  value={editingTeacher.division || 'Guru Kelas'}
                  onChange={e => setEditingTeacher({ ...editingTeacher, division: e.target.value as any })}
                  className="w-full p-2 rounded-xl border border-stone-300 bg-white"
                >
                  <option value="Pimpinan">Pimpinan</option>
                  <option value="Guru Kelas">Guru Kelas</option>
                  <option value="Guru Al-Qur'an">Guru Al-Qur'an</option>
                  <option value="Guru Bidang Studi">Guru Bidang Studi</option>
                  <option value="Tenaga Kependidikan">Tenaga Kependidikan</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1">Jabatan / Amanah Tugas:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kepala Sekolah / Ketua Panitia SPMB"
                  value={editingTeacher.role || ''}
                  onChange={e => setEditingTeacher({ ...editingTeacher, role: e.target.value })}
                  className="w-full p-2 rounded-xl border border-stone-300"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Nomor Urutan Tampil:</label>
                <input
                  type="number"
                  min="1"
                  value={editingTeacher.order || 1}
                  onChange={e => setEditingTeacher({ ...editingTeacher, order: parseInt(e.target.value, 10) || 1 })}
                  className="w-full p-2 rounded-xl border border-stone-300"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">Pendidikan Terakhir & Perguruan Tinggi:</label>
              <input
                type="text"
                placeholder="Contoh: S1 Pendidikan Guru - Universitas Jember"
                value={editingTeacher.education || ''}
                onChange={e => setEditingTeacher({ ...editingTeacher, education: e.target.value })}
                className="w-full p-2 rounded-xl border border-stone-300"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Motto Pendidik / Kutipan Inspiratif:</label>
              <input
                type="text"
                placeholder="Contoh: Membentuk generasi sholih, cerdas, dan mandiri..."
                value={editingTeacher.quote || ''}
                onChange={e => setEditingTeacher({ ...editingTeacher, quote: e.target.value })}
                className="w-full p-2 rounded-xl border border-stone-300"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setEditingTeacher(null)}
                className="px-4 py-2 border border-stone-300 rounded-xl text-stone-600 hover:bg-stone-50 cursor-pointer font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-[#123B35] text-white font-bold rounded-xl hover:bg-[#1a544b] cursor-pointer shadow-xs transition-colors"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Data Guru'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
