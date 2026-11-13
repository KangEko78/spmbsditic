/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NewsItem } from '../../../types';
import { api } from '../../../lib/api';
import { formatDateId } from '../../../lib/utils';
import { Newspaper, Plus, Edit2, Trash2, X, Eye } from 'lucide-react';

interface NewsManagerProps {
  news: NewsItem[];
  onRefresh: () => void;
}

export const NewsManager: React.FC<NewsManagerProps> = ({ news, onRefresh }) => {
  const [editingItem, setEditingItem] = useState<Partial<NewsItem> | null>(null);
  const [previewItem, setPreviewItem] = useState<NewsItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.title || !editingItem?.content) return;
    setIsSaving(true);
    try {
      await api.saveNews({
        ...editingItem,
        publishedAt: editingItem.publishedAt || new Date().toISOString().split('T')[0],
        author: editingItem.author || 'Tim Media SDIT',
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
    if (!confirm('Hapus artikel/berita ini?')) return;
    await api.deleteNews(id);
    onRefresh();
  };

  return (
    <div className="space-y-6 text-xs text-stone-800">
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase text-emerald-800 tracking-wider">
            Modul 15 · Berita, Artikel & Pengumuman
          </span>
          <h2 className="text-2xl font-bold text-stone-900 mt-0.5">
            Manajemen Berita & Informasi Sekolah
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Tulis, edit, dan terbitkan artikel kegiatan siswa, pembukaan SPMB, dan pengumuman resmi sekolah.
          </p>
        </div>

        <button
          onClick={() => setEditingItem({
            title: '',
            category: 'Berita Sekolah',
            summary: '',
            content: '',
            author: 'Humas SDIT Insan Cendikia',
            publishedAt: new Date().toISOString().split('T')[0],
            isPublished: true,
            imageUrl: '/src/assets/images/hero_school_building_1793682340462.jpg'
          })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#123B35] hover:bg-[#1a544b] text-white font-semibold rounded-lg shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#D5AA53]" />
          <span>Tulis Berita Baru</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F7F8F5] border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px]">
            <tr>
              <th className="py-3 px-4">Judul Berita</th>
              <th className="py-3 px-4">Kategori</th>
              <th className="py-3 px-4">Penulis</th>
              <th className="py-3 px-4">Tanggal Rilis</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {news.map(item => (
              <tr key={item.id} className="hover:bg-stone-50">
                <td className="py-3 px-4 font-bold text-stone-900 max-w-xs truncate">
                  {item.title}
                </td>
                <td className="py-3 px-4 text-stone-600">
                  <span className="px-2 py-0.5 rounded-full bg-stone-100 text-[10px] font-medium">
                    {item.category}
                  </span>
                </td>
                <td className="py-3 px-4 text-stone-600">{item.author}</td>
                <td className="py-3 px-4 text-stone-500 font-mono text-[11px]">
                  {formatDateId(item.publishedAt)}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                  }`}>
                    {item.isPublished ? 'Terbit' : 'Draft'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="p-1.5 text-stone-600 hover:text-emerald-800"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-1.5 text-stone-600 hover:text-emerald-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Editor Modal */}
      {editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingItem(null);
          }}
        >
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-stone-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-stone-200 pb-2">
              <h3 className="font-bold text-base text-stone-900">
                {editingItem.id ? 'Edit Berita / Artikel' : 'Tulis Berita Baru'}
              </h3>
              <button type="button" onClick={() => setEditingItem(null)}>
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            <div>
              <label className="block font-medium mb-1">Judul Artikel:</label>
              <input
                type="text"
                required
                value={editingItem.title || ''}
                onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-stone-300 font-bold"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-medium mb-1">Kategori:</label>
                <select
                  value={editingItem.category || 'Berita Sekolah'}
                  onChange={e => setEditingItem({ ...editingItem, category: e.target.value as any })}
                  className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                >
                  <option value="Berita Sekolah">Berita Sekolah</option>
                  <option value="SPMB">SPMB</option>
                  <option value="Kegiatan Siswa">Kegiatan Siswa</option>
                  <option value="Prestasi">Prestasi</option>
                  <option value="Artikel Parenting">Artikel Parenting</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Penulis:</label>
                <input
                  type="text"
                  value={editingItem.author || ''}
                  onChange={e => setEditingItem({ ...editingItem, author: e.target.value })}
                  className="w-full p-2 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Status Publikasi:</label>
                <select
                  value={editingItem.isPublished ? 'true' : 'false'}
                  onChange={e => setEditingItem({ ...editingItem, isPublished: e.target.value === 'true' })}
                  className="w-full p-2 rounded-lg border border-stone-300 bg-white"
                >
                  <option value="true">Terbitkan Langsung</option>
                  <option value="false">Simpan Draft</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">Ringkasan Singkat (Lead Paragraph):</label>
              <textarea
                rows={2}
                value={editingItem.summary || ''}
                onChange={e => setEditingItem({ ...editingItem, summary: e.target.value })}
                className="w-full p-2 rounded-lg border border-stone-300"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Isi Lengkap Artikel:</label>
              <textarea
                rows={8}
                required
                value={editingItem.content || ''}
                onChange={e => setEditingItem({ ...editingItem, content: e.target.value })}
                className="w-full p-3 rounded-lg border border-stone-300 leading-relaxed font-sans"
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
                {isSaving ? 'Menyimpan...' : 'Simpan Berita'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewItem(null);
          }}
        >
          <div className="bg-white rounded-2xl border border-stone-200 max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800">
                  {previewItem.category} · {formatDateId(previewItem.publishedAt)}
                </span>
                <h3 className="text-lg font-bold text-stone-900 mt-1">{previewItem.title}</h3>
                <p className="text-stone-500 text-[11px]">Oleh: {previewItem.author}</p>
              </div>
              <button onClick={() => setPreviewItem(null)}>
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            <p className="font-semibold text-stone-800 italic bg-[#F7F8F5] p-3 rounded-lg border border-stone-200">
              {previewItem.summary}
            </p>

            <div className="text-stone-700 whitespace-pre-line leading-relaxed text-xs">
              {previewItem.content}
            </div>

            <div className="flex justify-end pt-3 border-t border-stone-100">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 bg-stone-800 text-white font-semibold rounded-lg"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
