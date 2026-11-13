/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Upload, Image as ImageIcon, X, Check, Search, AlertCircle, RefreshCw, Eye } from 'lucide-react';
import { MediaItem } from '../../types';
import { api } from '../../lib/api';
import { useModalDismiss } from '../../hooks/useModalDismiss';

interface ImageUploadPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string, mediaItem?: MediaItem) => void;
  title?: string;
  defaultCategory?: string;
  currentImageUrl?: string;
}

export const ImageUploadPicker: React.FC<ImageUploadPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = 'Pilih atau Unggah Foto',
  defaultCategory = 'kegiatan_belajar',
  currentImageUrl = ''
}) => {
  const [tab, setTab] = useState<'upload' | 'library'>('library');
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState(defaultCategory);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadMedia();
      setErrorMsg('');
      setSelectedFile(null);
      setPreviewUrl('');
      setUploadTitle('');
      setUploadCategory(defaultCategory);
    }
  }, [isOpen, defaultCategory]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const items = await api.getMedia();
      setMediaList(items);
    } catch (err) {
      console.error('Failed to load media list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran file melebihi 5MB. Silakan pilih foto dengan ukuran lebih kecil.');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMsg('Format file tidak didukung. Harap pilih gambar JPG, PNG, atau WEBP.');
      return;
    }

    setErrorMsg('');
    setSelectedFile(file);
    setUploadTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl) {
      setErrorMsg('Silakan pilih file foto terlebih dahulu.');
      return;
    }

    setUploading(true);
    setErrorMsg('');

    try {
      const newMedia = await api.uploadMedia({
        fileName: selectedFile?.name || 'foto.jpg',
        dataUrl: previewUrl,
        title: uploadTitle.trim() || selectedFile?.name || 'Foto Baru',
        category: uploadCategory,
        activityDate: new Date().toISOString().split('T')[0],
        isPublished: true,
        usageLocation: title
      });

      onSelect(newMedia.url, newMedia);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengunggah foto ke server.');
    } finally {
      setUploading(false);
    }
  };

  const filteredMedia = mediaList.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  useModalDismiss(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 my-auto relative">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#123B35] to-[#174C80] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <ImageIcon className="w-5 h-5 text-[#D5AA53]" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">{title}</h3>
              <p className="text-xs text-white/80">Pilih dari Media Library sekolah atau unggah foto baru dari perangkat</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white font-bold transition-all cursor-pointer shadow-xs focus:ring-2 focus:ring-white shrink-0"
            title="Tutup (Esc)"
            aria-label="Tutup jendela pemilih gambar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setTab('library')}
            className={`px-4 py-2.5 font-semibold text-sm rounded-t-lg transition-all flex items-center gap-2 ${
              tab === 'library'
                ? 'bg-white text-[#123B35] border-t-2 border-[#123B35] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Media Library ({mediaList.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`px-4 py-2.5 font-semibold text-sm rounded-t-lg transition-all flex items-center gap-2 ${
              tab === 'upload'
                ? 'bg-white text-[#123B35] border-t-2 border-[#123B35] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload Foto Baru
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'library' ? (
            <div className="space-y-4">
              {/* Filter bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari foto berdasarkan judul atau deskripsi..."
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#123B35]"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#123B35] bg-white"
                >
                  <option value="all">Semua Kategori</option>
                  <option value="kegiatan_belajar">Kegiatan Belajar</option>
                  <option value="keagamaan">Keagamaan & Tahfidz</option>
                  <option value="ekstrakurikuler">Ekstrakurikuler</option>
                  <option value="fasilitas">Fasilitas</option>
                  <option value="prestasi">Prestasi</option>
                  <option value="berita">Berita & Informasi</option>
                </select>
                <button
                  type="button"
                  onClick={loadMedia}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-600"
                  title="Segarkan Foto"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Grid of photos */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#123B35] mb-2" />
                  <p className="text-sm">Memuat galeri media...</p>
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-700">Belum ada foto yang cocok</h4>
                  <p className="text-sm text-gray-500 mt-1">Silakan cari kata kunci lain atau unggah foto baru dari perangkat Anda.</p>
                  <button
                    type="button"
                    onClick={() => setTab('upload')}
                    className="mt-4 px-4 py-2 bg-[#123B35] text-white rounded-lg text-sm font-medium hover:bg-[#0e2f2a] transition-colors"
                  >
                    Unggah Foto Baru
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredMedia.map((item) => {
                    const isSelected = currentImageUrl === item.url;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          onSelect(item.url, item);
                          onClose();
                        }}
                        className={`group relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                          isSelected
                            ? 'border-[#D5AA53] ring-3 ring-[#D5AA53]/30 shadow-md'
                            : 'border-gray-200 hover:border-[#123B35]'
                        }`}
                      >
                        <div className="aspect-4/3 bg-gray-100 overflow-hidden relative">
                          <img
                            src={item.url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-[#D5AA53] text-[#123B35] p-1 rounded-full shadow-md">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <span className="px-3 py-1 bg-white/90 text-[#123B35] rounded-md text-xs font-bold shadow-xs">
                              Gunakan Foto
                            </span>
                          </div>
                        </div>
                        <div className="p-2.5 bg-white">
                          <h5 className="font-medium text-xs text-gray-800 line-clamp-1" title={item.title}>
                            {item.title}
                          </h5>
                          <div className="flex items-center justify-between mt-1 text-[10px] text-gray-500">
                            <span className="capitalize">{item.category.replace('_', ' ')}</span>
                            {item.fileSizeKb ? <span>{item.fileSizeKb} KB</span> : null}
                          </div>
                          {item.usageLocations && item.usageLocations.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              <span className="text-[9px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-200 line-clamp-1">
                                Digunakan: {item.usageLocations[0]}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Upload Tab */
            <form onSubmit={handleUploadSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-[#123B35] bg-gray-50 hover:bg-gray-100/70 rounded-2xl p-6 text-center cursor-pointer transition-colors"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
                {previewUrl ? (
                  <div className="space-y-3">
                    <div className="max-h-56 max-w-sm mx-auto overflow-hidden rounded-xl border border-gray-300 shadow-sm relative group">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-3 py-1.5 bg-white text-xs font-semibold rounded-lg text-gray-800">
                          Klik untuk ganti file
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 font-medium">
                      {selectedFile?.name} ({(selectedFile?.size ? selectedFile.size / 1024 : 0).toFixed(1)} KB)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 py-6">
                    <div className="w-14 h-14 bg-emerald-100 text-[#123B35] rounded-full flex items-center justify-center mx-auto mb-2">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-gray-800 text-sm">
                      Klik untuk memilih foto dari perangkat Anda
                    </p>
                    <p className="text-xs text-gray-500">
                      Mendukung format JPG, PNG, atau WEBP (Maksimal 5MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Form Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Judul Foto / Dokumentasi *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="Contoh: Gedung Sekolah Tampak Depan"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#123B35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Kategori Foto
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#123B35] bg-white"
                  >
                    <option value="kegiatan_belajar">Kegiatan Belajar Mengajar</option>
                    <option value="keagamaan">Keagamaan & Tahfidz</option>
                    <option value="ekstrakurikuler">Ekstrakurikuler & Kepanduan</option>
                    <option value="fasilitas">Fasilitas Sekolah</option>
                    <option value="prestasi">Prestasi Siswa</option>
                    <option value="berita">Berita & Pengumuman</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading || !previewUrl}
                  className="px-5 py-2 bg-[#123B35] hover:bg-[#0e2f2a] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Mengunggah...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Unggah & Gunakan Foto
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
