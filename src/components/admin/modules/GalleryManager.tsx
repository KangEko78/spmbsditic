/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GalleryItem } from '../../../types';
import { api } from '../../../lib/api';
import { Camera, Plus, Edit2, Trash2, X, Eye } from 'lucide-react';
import { Lightbox } from '../../common/Lightbox';

interface GalleryManagerProps {
  gallery: GalleryItem[];
  onRefresh: () => void;
}

export const GalleryManager: React.FC<GalleryManagerProps> = ({ gallery, onRefresh }) => {
  const [editingItem, setEditingItem] = useState<Partial<GalleryItem> | null>(null);
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.title || !editingItem?.imageUrl) return;
    setIsSaving(true);
    try {
      await api.saveGallery({
        ...editingItem,
        date: editingItem.date || new Date().toISOString().split('T')[0],
        isPublished: editingItem.isPublished !== false
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
    if (!confirm('Hapus foto dari galeri sekolah?')) return;
    await api.deleteGallery(id);
    onRefresh();
  };

  return (
    <div className="space-y-6 text-xs text-stone-800">
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase text-emerald-800 tracking-wider">
            Modul 13 · Galeri Dokumentasi Kegiatan
          </span>
          <h2 className="text-2xl font-bold text-stone-900 mt-0.5">
            Manajemen Album Foto & Acara Sekolah
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Dokumentasi kegiatan belajar mengajar, acara keagamaan, olahraga, dan perayaan sekolah.
          </p>
        </div>

        <button
          onClick={() => setEditingItem({
            title: '',
            category: 'Kegiatan Belajar',
            imageUrl: '/src/assets/images/student_learning_activity_1793682341759.jpg',
            date: new Date().toISOString().split('T')[0],
            description: '',
            isPublished: true
          })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#123B35] hover:bg-[#1a544b] text-white font-semibold rounded-lg shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#D5AA53]" />
          <span>Unggah Foto Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {gallery.map(item => (
          <div key={item.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs flex flex-col justify-between">
            <div className="relative aspect-4/3 bg-stone-100 overflow-hidden group">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <button
                onClick={() => setPreviewItem(item)}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
              >
                <Eye className="w-6 h-6" />
              </button>
            </div>

            <div className="p-3">
              <span className="text-[10px] text-emerald-800 font-semibold block mb-1">
                {item.category} · {item.date}
              </span>
              <h4 className="font-bold text-stone-900 text-xs truncate">{item.title}</h4>
              <p className="text-stone-500 text-[11px] line-clamp-2 mt-0.5">{item.description}</p>
            </div>

            <div className="flex justify-end gap-1.5 px-3 pb-3 border-t border-stone-100 pt-2">
              <button
                onClick={() => setEditingItem(item)}
                className="p-1 text-stone-600 hover:text-emerald-800"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-1 text-stone-400 hover:text-rose-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
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
                {editingItem.id ? 'Edit Foto Galeri' : 'Tambah Foto Dokumentasi'}
              </h3>
              <button type="button" onClick={() => setEditingItem(null)}>
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            <div>
              <label className="block font-medium mb-1">Judul Foto / Kegiatan:</label>
              <input
                type="text"
                required
                placeholder="Contoh: KBM Tematik Sains Al-Qur'an"
                value={editingItem.title || ''}
                onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-stone-300 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1">Kategori:</label>
                <select
                  value={editingItem.category || 'Kegiatan Belajar'}
                  onChange={e => setEditingItem({ ...editingItem, category: e.target.value as any })}
                  className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                >
                  <option value="Kegiatan Belajar">Kegiatan Belajar</option>
                  <option value="Keagamaan">Keagamaan</option>
                  <option value="Olahraga">Olahraga</option>
                  <option value="Seni">Seni</option>
                  <option value="Ekstrakurikuler">Ekstrakurikuler</option>
                  <option value="Acara Sekolah">Acara Sekolah</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Tanggal Kegiatan:</label>
                <input
                  type="date"
                  value={editingItem.date || ''}
                  onChange={e => setEditingItem({ ...editingItem, date: e.target.value })}
                  className="w-full p-2 rounded-lg border border-stone-300 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">URL / File Foto:</label>
              <input
                type="text"
                required
                value={editingItem.imageUrl || ''}
                onChange={e => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                className="w-full p-2 rounded-lg border border-stone-300 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Keterangan / Caption Foto:</label>
              <textarea
                rows={2}
                value={editingItem.description || ''}
                onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                className="w-full p-2 rounded-lg border border-stone-300"
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
                {isSaving ? 'Menyimpan...' : 'Simpan Foto'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lightbox */}
      {previewItem && (
        <Lightbox
          isOpen={true}
          onClose={() => setPreviewItem(null)}
          imageUrl={previewItem.imageUrl}
          title={previewItem.title}
          description={previewItem.description}
          date={previewItem.date}
        />
      )}
    </div>
  );
};
