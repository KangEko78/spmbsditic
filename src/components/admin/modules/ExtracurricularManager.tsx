/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Extracurricular } from '../../../types';
import { api } from '../../../lib/api';
import {
  Trophy,
  Plus,
  Edit2,
  Trash2,
  X,
  Clock,
  User,
  Image as ImageIcon,
  Upload,
  Eye,
  Check,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { ImageUploadPicker } from '../../common/ImageUploadPicker';

interface ExtracurricularManagerProps {
  extracurriculars: Extracurricular[];
  onRefresh: () => void;
}

export const ExtracurricularManager: React.FC<ExtracurricularManagerProps> = ({
  extracurriculars,
  onRefresh
}) => {
  const [editingItem, setEditingItem] = useState<Partial<Extracurricular> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Photo Picker
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTargetType, setPickerTargetType] = useState<'main' | 'additional'>('main');

  // Preview Lightbox
  const [previewLightboxUrl, setPreviewLightboxUrl] = useState<string | null>(null);
  const [previewLightboxTitle, setPreviewLightboxTitle] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.name) return;
    setIsSaving(true);
    try {
      await api.saveExtracurricular(editingItem);
      setEditingItem(null);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan data ekstrakurikuler: ' + err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kegiatan ekstrakurikuler ini?')) return;
    await api.deleteExtracurricular(id);
    onRefresh();
  };

  const openPhotoPicker = (target: 'main' | 'additional') => {
    setPickerTargetType(target);
    setPickerOpen(true);
  };

  const handlePhotoSelected = (url: string) => {
    if (!editingItem) return;

    if (pickerTargetType === 'main') {
      setEditingItem({
        ...editingItem,
        imageUrl: url
      });
    } else {
      const currentAdditional = editingItem.additionalImages || [];
      if (!currentAdditional.includes(url)) {
        setEditingItem({
          ...editingItem,
          additionalImages: [...currentAdditional, url]
        });
      }
    }
  };

  const removeAdditionalImage = (index: number) => {
    if (!editingItem) return;
    const current = [...(editingItem.additionalImages || [])];
    current.splice(index, 1);
    setEditingItem({
      ...editingItem,
      additionalImages: current
    });
  };

  return (
    <div className="space-y-6 text-stone-800">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-emerald-800 tracking-wider">
            <Trophy className="w-4 h-4 text-[#D5AA53]" />
            Modul 12 · Ekstrakurikuler & Dokumentasi Bakat Minat
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mt-1">
            Manajemen Kegiatan Ekstrakurikuler
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Kelola foto utama, dokumentasi kegiatan tambahan, pembina, jadwal, dan status publikasi.
          </p>
        </div>

        <button
          onClick={() => setEditingItem({
            name: '',
            category: 'Olahraga & Beladiri',
            coach: 'Coach Olahraga',
            schedule: 'Sabtu, 08.00 - 10.00 WIB',
            description: '',
            isPublished: true,
            imageUrl: '/src/assets/images/extracurricular_activities_1793682342535.jpg',
            additionalImages: []
          })}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#123B35] hover:bg-[#1a544b] text-white font-bold rounded-xl shadow-xs cursor-pointer text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4 text-[#D5AA53]" />
          <span>Tambah Ekstrakurikuler</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {extracurriculars.map(ekskul => (
          <div
            key={ekskul.id}
            className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            {/* Main Photo with Controls */}
            <div className="relative aspect-16/10 bg-stone-100 overflow-hidden">
              <img
                src={ekskul.imageUrl || '/src/assets/images/extracurricular_activities_1793682342535.jpg'}
                alt={ekskul.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              <div className="absolute top-2.5 left-2.5">
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#123B35]/90 text-white font-bold shadow-xs backdrop-blur-xs">
                  {ekskul.category}
                </span>
              </div>

              {!ekskul.isPublished && (
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-900/80 text-white">
                  Draft (Disembunyikan)
                </div>
              )}

              {/* Photo Overlay Actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewLightboxUrl(ekskul.imageUrl || '');
                    setPreviewLightboxTitle(ekskul.name);
                  }}
                  className="px-3 py-1.5 bg-white text-gray-900 rounded-lg text-xs font-bold shadow-md hover:bg-gray-100 flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview Foto
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(ekskul);
                    openPhotoPicker('main');
                  }}
                  className="px-3 py-1.5 bg-[#D5AA53] text-[#123B35] rounded-lg text-xs font-bold shadow-md hover:bg-[#c99f48] flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Ganti Foto
                </button>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-stone-900 text-base">{ekskul.name}</h4>
                <p className="text-stone-600 text-xs mt-1.5 line-clamp-3 leading-relaxed">
                  {ekskul.description}
                </p>

                {/* Additional Images Thumbnails if present */}
                {ekskul.additionalImages && ekskul.additionalImages.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-stone-100">
                    <span className="text-[10px] text-stone-400 font-semibold block mb-1.5">
                      Dokumentasi Kegiatan ({ekskul.additionalImages.length} Foto):
                    </span>
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {ekskul.additionalImages.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`Dokumentasi ${i + 1}`}
                          onClick={() => {
                            setPreviewLightboxUrl(img);
                            setPreviewLightboxTitle(`${ekskul.name} - Dokumentasi #${i + 1}`);
                          }}
                          className="w-12 h-10 object-cover rounded-md border border-stone-200 cursor-pointer hover:opacity-80 shrink-0"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
                  <p className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#123B35]" />
                    <span className="font-semibold text-stone-800">{ekskul.coach}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#123B35]" />
                    <span>{ekskul.schedule}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(ekskul);
                    openPhotoPicker('main');
                  }}
                  className="px-2.5 py-1 text-xs text-[#123B35] hover:bg-emerald-50 rounded-lg font-semibold flex items-center gap-1"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Pilih Foto
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingItem(ekskul)}
                    className="p-1.5 text-stone-600 hover:text-emerald-800 hover:bg-stone-100 rounded-lg transition-colors"
                    title="Edit Data Ekstrakurikuler"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ekskul.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Hapus Ekstrakurikuler"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingItem(null);
          }}
        >
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl border border-stone-200 max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5"
          >
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#D5AA53]" />
                <h3 className="font-bold text-lg text-stone-900">
                  {editingItem.id ? 'Edit Ekstrakurikuler' : 'Tambah Ekstrakurikuler Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Foto Utama Field */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700">
                Foto Utama Ekstrakurikuler *
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative w-full sm:w-48 h-32 rounded-xl overflow-hidden border border-stone-300 bg-stone-100 shrink-0 group">
                  <img
                    src={editingItem.imageUrl || '/src/assets/images/extracurricular_activities_1793682342535.jpg'}
                    alt="Preview Utama"
                    className="w-full h-full object-cover"
                  />
                  <div
                    onClick={() => {
                      setPreviewLightboxUrl(editingItem.imageUrl || '');
                      setPreviewLightboxTitle(editingItem.name || 'Pratinjau Foto');
                    }}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  >
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <p className="text-xs text-stone-500">
                    Gunakan foto beresolusi tajam yang mencerminkan keceriaan dan kedisiplinan kegiatan siswa.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openPhotoPicker('main')}
                      className="px-3.5 py-1.5 bg-[#123B35] text-white rounded-lg text-xs font-semibold hover:bg-[#0e2f2a] flex items-center gap-1.5 shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#D5AA53]" />
                      Pilih / Ganti Foto
                    </button>
                    {editingItem.imageUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewLightboxUrl(editingItem.imageUrl || '');
                          setPreviewLightboxTitle(editingItem.name || 'Preview Foto');
                        }}
                        className="px-3 py-1.5 border border-stone-300 text-stone-700 rounded-lg text-xs font-semibold hover:bg-stone-50 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview Foto
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Foto Dokumentasi Tambahan */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-stone-700">
                  Foto Dokumentasi Tambahan (Galeri Kegiatan)
                </label>
                <button
                  type="button"
                  onClick={() => openPhotoPicker('additional')}
                  className="text-xs text-[#123B35] hover:underline font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Foto Dokumentasi
                </button>
              </div>

              {editingItem.additionalImages && editingItem.additionalImages.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {editingItem.additionalImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-4/3 rounded-lg overflow-hidden border border-stone-300 group">
                      <img src={img} alt="Doc" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeAdditionalImage(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white p-0.5 rounded-full shadow-md hover:bg-red-700 opacity-90"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-400 italic">
                  Belum ada foto dokumentasi tambahan. Klik "Tambah Foto Dokumentasi" untuk menambah dokumentasi kegiatan.
                </p>
              )}
            </div>

            {/* Nama & Kategori */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Nama Ekstrakurikuler <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Panahan Sunnah (Archery Club)"
                value={editingItem.name || ''}
                onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 font-bold text-sm focus:outline-hidden focus:ring-2 focus:ring-[#123B35]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Kategori
                </label>
                <select
                  value={editingItem.category || 'Olahraga & Beladiri'}
                  onChange={e => setEditingItem({ ...editingItem, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#123B35]"
                >
                  <option value="Olahraga & Beladiri">Olahraga & Beladiri</option>
                  <option value="Keagamaan">Keagamaan</option>
                  <option value="Kecakapan Hidup">Kecakapan Hidup</option>
                  <option value="Sains & Teknologi">Sains & Teknologi</option>
                  <option value="Seni Budaya">Seni Budaya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nama Pelatih / Pembina
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Coach Ardiansyah, S.Or."
                  value={editingItem.coach || ''}
                  onChange={e => setEditingItem({ ...editingItem, coach: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#123B35]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Jadwal Pelaksanaan Kegiatan
              </label>
              <input
                type="text"
                placeholder="Contoh: Sabtu, 08.00 - 10.00 WIB"
                value={editingItem.schedule || ''}
                onChange={e => setEditingItem({ ...editingItem, schedule: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#123B35]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Deskripsi Kegiatan
              </label>
              <textarea
                rows={3}
                placeholder="Jelaskan tujuan kegiatan, target keterampilan anak, dan kecakapan yang diasah..."
                value={editingItem.description || ''}
                onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#123B35]"
              />
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                <input
                  type="checkbox"
                  checked={editingItem.isPublished !== false}
                  onChange={e => setEditingItem({ ...editingItem, isPublished: e.target.checked })}
                  className="rounded text-[#123B35] focus:ring-[#123B35]"
                />
                <span>Tampilkan di Website Publik (Publikasikan)</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 border border-stone-300 rounded-xl text-stone-600 hover:bg-stone-50 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-[#123B35] text-white font-bold rounded-xl hover:bg-[#1a544b] text-xs transition-colors flex items-center gap-2"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Ekstrakurikuler'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Image Upload / Library Picker Modal */}
      <ImageUploadPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handlePhotoSelected}
        title={pickerTargetType === 'main' ? 'Pilih Foto Utama Ekstrakurikuler' : 'Tambah Foto Dokumentasi Ekstrakurikuler'}
        defaultCategory="ekstrakurikuler"
        currentImageUrl={editingItem?.imageUrl || ''}
      />

      {/* Lightbox Preview */}
      {previewLightboxUrl && (
        <div
          onClick={() => setPreviewLightboxUrl(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-3xl max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className="px-4 py-2 bg-gray-900 text-white flex items-center justify-between text-xs">
              <span className="font-semibold">{previewLightboxTitle}</span>
              <button onClick={() => setPreviewLightboxUrl(null)} className="p-1 hover:text-gray-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            <img src={previewLightboxUrl} alt="Preview" className="max-h-[75vh] w-auto object-contain mx-auto" />
          </div>
        </div>
      )}
    </div>
  );
};
