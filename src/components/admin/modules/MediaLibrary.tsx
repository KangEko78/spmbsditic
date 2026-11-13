/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Copy,
  Calendar,
  Layers,
  ArrowUpDown,
  ExternalLink,
  Tag,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { MediaItem } from '../../../types';
import { api } from '../../../lib/api';

export const MediaLibrary: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal Upload / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('kegiatan_belajar');
  const [formDate, setFormDate] = useState('');
  const [formOrder, setFormOrder] = useState<number>(1);
  const [formIsThumbnail, setFormIsThumbnail] = useState(false);
  const [formIsPublished, setFormIsPublished] = useState(true);
  const [formPreviewUrl, setFormPreviewUrl] = useState('');
  const [formSelectedFile, setFormSelectedFile] = useState<File | null>(null);
  const [formUsageLocations, setFormUsageLocations] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Warning Dialog
  const [deleteCandidate, setDeleteCandidate] = useState<MediaItem | null>(null);
  const [deleteWarningLocations, setDeleteWarningLocations] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fullscreen Preview Modal
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [previewModalTitle, setPreviewModalTitle] = useState('');

  // Toast Feedback
  const [toastMessage, setToastMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadMedia = async () => {
    setLoading(true);
    try {
      const items = await api.getMedia();
      setMediaList(items);
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('kegiatan_belajar');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormOrder(mediaList.length + 1);
    setFormIsThumbnail(false);
    setFormIsPublished(true);
    setFormPreviewUrl('');
    setFormSelectedFile(null);
    setFormUsageLocations([]);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: MediaItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormDescription(item.description || '');
    setFormCategory(item.category);
    setFormDate(item.activityDate || '');
    setFormOrder(item.order || 1);
    setFormIsThumbnail(Boolean(item.isThumbnail));
    setFormIsPublished(item.isPublished !== false);
    setFormPreviewUrl(item.url);
    setFormSelectedFile(null);
    setFormUsageLocations(item.usageLocations || []);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Ukuran file melebihi 5MB. Silakan pilih foto yang lebih kecil.');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setFormError('Hanya mendukung format JPG, PNG, atau WEBP.');
      return;
    }

    setFormError('');
    setFormSelectedFile(file);
    if (!editingItem) {
      setFormTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPreviewUrl) {
      setFormError('Harap pilih file foto dari perangkat.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      if (editingItem) {
        // If user picked a new file while editing, upload the new file first
        let finalUrl = editingItem.url;
        if (formSelectedFile && formPreviewUrl.startsWith('data:')) {
          const uploaded = await api.uploadMedia({
            fileName: formSelectedFile.name,
            dataUrl: formPreviewUrl,
            title: formTitle,
            description: formDescription,
            category: formCategory,
            activityDate: formDate,
            isThumbnail: formIsThumbnail,
            order: formOrder,
            isPublished: formIsPublished,
            uploadedBy: 'Admin'
          });
          finalUrl = uploaded.url;
        }

        await api.updateMedia(editingItem.id, {
          title: formTitle,
          description: formDescription,
          category: formCategory,
          activityDate: formDate,
          order: Number(formOrder),
          isThumbnail: formIsThumbnail,
          isPublished: formIsPublished,
          url: finalUrl
        });

        showToast('Foto berhasil diperbarui!');
      } else {
        // Add new photo
        await api.uploadMedia({
          fileName: formSelectedFile?.name || 'foto.jpg',
          dataUrl: formPreviewUrl,
          title: formTitle.trim() || 'Foto Dokumentasi Baru',
          description: formDescription,
          category: formCategory,
          activityDate: formDate,
          order: Number(formOrder),
          isThumbnail: formIsThumbnail,
          isPublished: formIsPublished,
          uploadedBy: 'Admin Utama'
        });

        showToast('Foto baru berhasil diunggah ke Media Library!');
      }

      setIsModalOpen(false);
      await loadMedia();
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan foto.');
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = async (item: MediaItem) => {
    try {
      const res = await api.deleteMedia(item.id, false);
      if (res.success) {
        showToast('Foto berhasil dihapus.');
        await loadMedia();
      }
    } catch (err: any) {
      if (err.inUse && err.usageLocations) {
        setDeleteCandidate(item);
        setDeleteWarningLocations(err.usageLocations);
      } else {
        alert(err.message || 'Gagal menghapus foto.');
      }
    }
  };

  const confirmForceDelete = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      await api.deleteMedia(deleteCandidate.id, true);
      showToast('Foto berhasil dihapus secara permanen.');
      setDeleteCandidate(null);
      setDeleteWarningLocations([]);
      await loadMedia();
    } catch (err: any) {
      alert('Gagal menghapus foto: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = mediaList.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalSizeKb = mediaList.reduce((acc, cur) => acc + (cur.fileSizeKb || 0), 0);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#123B35] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-emerald-400 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-[#D5AA53]" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#123B35] uppercase tracking-wider mb-1">
            <FolderOpen className="w-4 h-4 text-[#D5AA53]" />
            Pengelolaan Aset Terpusat
          </div>
          <h2 className="text-2xl font-extrabold text-[#123B35]">Media & Dokumentasi</h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Kelola seluruh foto kegiatan, fasilitas, ekstrakurikuler, dan dokumentasi resmi SDIT Insan Cendikia Kalibaru.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openAddModal}
            className="px-5 py-2.5 bg-[#123B35] hover:bg-[#0e2f2a] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4 text-[#D5AA53]" />
            Upload Foto Baru
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
          <span className="text-xs text-gray-500 block">Total Koleksi Foto</span>
          <span className="text-2xl font-black text-[#123B35]">{mediaList.length} Foto</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
          <span className="text-xs text-gray-500 block">Estimasi Ukuran File</span>
          <span className="text-2xl font-black text-[#174C80]">
            {totalSizeKb > 1024 ? `${(totalSizeKb / 1024).toFixed(1)} MB` : `${totalSizeKb} KB`}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
          <span className="text-xs text-gray-500 block">Ditampilkan di Web</span>
          <span className="text-2xl font-black text-emerald-700">
            {mediaList.filter(m => m.isPublished !== false).length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
          <span className="text-xs text-gray-500 block">Foto Digunakan</span>
          <span className="text-2xl font-black text-[#D5AA53]">
            {mediaList.filter(m => m.usageLocations && m.usageLocations.length > 0).length}
          </span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari foto, judul, atau kegiatan..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#123B35]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-[#123B35]"
          >
            <option value="all">Semua Kategori ({mediaList.length})</option>
            <option value="kegiatan_belajar">Kegiatan Belajar</option>
            <option value="keagamaan">Keagamaan & Tahfidz</option>
            <option value="ekstrakurikuler">Ekstrakurikuler & Kepanduan</option>
            <option value="fasilitas">Fasilitas Sekolah</option>
            <option value="prestasi">Prestasi Siswa</option>
            <option value="berita">Berita & Informasi</option>
          </select>

          <button
            type="button"
            onClick={loadMedia}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Media Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#123B35] mb-2" />
          <p className="text-sm">Memuat koleksi media...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 p-8">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-700 text-lg">Belum ada foto dalam kategori ini</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            Mulai unggah foto dokumentasi kegiatan sekolah atau fasilitas dengan tombol di bawah.
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-4 px-5 py-2 bg-[#123B35] text-white rounded-xl text-xs font-semibold hover:bg-[#0e2f2a]"
          >
            Upload Foto Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
            >
              {/* Image Preview Container */}
              <div className="relative aspect-4/3 bg-gray-100 overflow-hidden">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Badges on image */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#123B35]/90 text-white backdrop-blur-xs">
                    {item.category.replace('_', ' ')}
                  </span>
                  {item.isThumbnail && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#D5AA53] text-[#123B35]">
                      Thumbnail
                    </span>
                  )}
                </div>

                {!item.isPublished && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-800/80 text-white">
                    Tersembunyi
                  </div>
                )}

                {/* Quick actions overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewModalUrl(item.url);
                      setPreviewModalTitle(item.title);
                    }}
                    className="p-2 bg-white text-gray-800 rounded-full hover:bg-gray-100 shadow-md transition-transform hover:scale-110"
                    title="Lihat Pratinjau Penuh"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin + item.url);
                      showToast('URL foto disalin ke clipboard!');
                    }}
                    className="p-2 bg-white text-gray-800 rounded-full hover:bg-gray-100 shadow-md transition-transform hover:scale-110"
                    title="Salin URL Foto"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-gray-900 line-clamp-1" title={item.title}>
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* Usage locations indicator */}
                  {item.usageLocations && item.usageLocations.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-gray-100">
                      <span className="text-[10px] text-gray-400 font-semibold block mb-1">
                        Lokasi Penggunaan Foto:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {item.usageLocations.map((loc, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-medium line-clamp-1"
                          >
                            {loc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Info & Edit Buttons */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="text-[11px]">
                    <span>{item.fileSizeKb ? `${item.fileSizeKb} KB` : 'Foto'}</span>
                    {item.activityDate && (
                      <span className="block text-gray-400 text-[10px]">{item.activityDate}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-gray-600 hover:text-[#123B35] hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit Foto & Metadata"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => requestDelete(item)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus Foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-linear-to-r from-[#123B35] to-[#174C80] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-5 h-5 text-[#D5AA53]" />
                <h3 className="font-bold text-base sm:text-lg">
                  {editingItem ? 'Edit Informasi & Foto Media' : 'Unggah Foto Baru ke Media Library'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Photo selector area */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">
                  File Foto (Pilih dari Perangkat) <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                {formPreviewUrl ? (
                  <div className="relative rounded-xl border border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center h-48">
                    <img
                      src={formPreviewUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-[#123B35] text-white text-xs font-semibold rounded-lg shadow-md hover:bg-[#0e2f2a] flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Ganti Foto
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 hover:border-[#123B35] rounded-xl p-8 text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-gray-700">
                      Klik di sini untuk memilih foto dari perangkat Anda
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Mendukung format JPG, PNG, atau WEBP (Maksimal 5MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Metadata Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Judul Foto / Kegiatan *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Contoh: Upacara Bendera & Doa Pagi"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#123B35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-[#123B35]"
                  >
                    <option value="kegiatan_belajar">Kegiatan Belajar</option>
                    <option value="keagamaan">Keagamaan & Tahfidz</option>
                    <option value="ekstrakurikuler">Ekstrakurikuler & Kepanduan</option>
                    <option value="fasilitas">Fasilitas Sekolah</option>
                    <option value="prestasi">Prestasi Siswa</option>
                    <option value="berita">Berita & Informasi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Tanggal Kegiatan
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#123B35]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Deskripsi Foto / Keterangan
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Tuliskan keterangan singkat mengenai dokumentasi kegiatan ini..."
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#123B35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Urutan Tampilan
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#123B35]"
                  />
                </div>

                <div className="flex flex-col justify-center space-y-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={formIsThumbnail}
                      onChange={(e) => setFormIsThumbnail(e.target.checked)}
                      className="rounded text-[#123B35] focus:ring-[#123B35]"
                    />
                    <span>Jadikan Foto Utama / Thumbnail</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={formIsPublished}
                      onChange={(e) => setFormIsPublished(e.target.checked)}
                      className="rounded text-[#123B35] focus:ring-[#123B35]"
                    />
                    <span>Tampilkan di Website Publik</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving || !formPreviewUrl}
                  className="px-6 py-2 bg-[#123B35] hover:bg-[#0e2f2a] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {editingItem ? 'Simpan Perubahan' : 'Unggah & Simpan'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Warning Modal (if in use) */}
      {deleteCandidate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteCandidate(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-amber-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Peringatan Penggunaan Foto</h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Foto <strong className="text-gray-900">"{deleteCandidate.title}"</strong> saat ini masih digunakan pada beberapa bagian website:
                </p>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 max-h-36 overflow-y-auto space-y-1">
              {deleteWarningLocations.map((loc, idx) => (
                <div key={idx} className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  {loc}
                </div>
              ))}
            </div>

            <p className="text-xs text-red-600 leading-relaxed font-medium">
              Jika foto ini dihapus secara paksa, bagian website di atas akan kehilangan gambar pendukungnya. Apakah Anda yakin ingin melanjutkan penghapusan?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteCandidate(null);
                  setDeleteWarningLocations([]);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={confirmForceDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Tetap Hapus Foto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Preview Lightbox */}
      {previewModalUrl && (
        <div
          onClick={() => setPreviewModalUrl(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-2.5 bg-gray-900 text-white flex items-center justify-between text-xs">
              <span className="font-semibold">{previewModalTitle}</span>
              <button
                onClick={() => setPreviewModalUrl(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img src={previewModalUrl} alt={previewModalTitle} className="max-h-[80vh] w-auto object-contain mx-auto" />
          </div>
        </div>
      )}
    </div>
  );
};
