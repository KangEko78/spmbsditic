/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SpmbStageDefinition, User, ProcessType } from '../../../types';
import { api } from '../../../lib/api';
import { formatDateId } from '../../../lib/utils';
import { useModalDismiss } from '../../../hooks/useModalDismiss';
import {
  Layers,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Send,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calendar,
  Smartphone,
  Monitor,
  X,
  FileText,
  Upload,
  UserCheck,
  CreditCard,
  Check,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';

interface SpmbStagesSettingsModuleProps {
  currentUser: User | null;
}

export const SpmbStagesSettingsModule: React.FC<SpmbStagesSettingsModuleProps> = ({ currentUser }) => {
  const [stages, setStages] = useState<SpmbStageDefinition[]>([]);
  const [publishedStages, setPublishedStages] = useState<SpmbStageDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Modals state
  const [editingStage, setEditingStage] = useState<SpmbStageDefinition | null>(null);
  const [isNewStageModalOpen, setIsNewStageModalOpen] = useState(false);
  const [deleteStageId, setDeleteStageId] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Form state for new stage
  const [newStageForm, setNewStageForm] = useState<Partial<SpmbStageDefinition>>({
    title: '',
    description: '',
    actionInstruction: '',
    processType: 'lainnya',
    isRequired: true,
    showToParents: true,
    isActive: true,
    hasForm: false,
    hasDocumentUpload: false,
    hasObservation: false,
    hasReRegistration: false,
    colorStatus: 'emerald',
    startDate: '',
    endDate: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const draftRes = await api.getDraftSpmbStages();
      const pubRes = await api.getSpmbStages();
      
      const loadedDraft = (draftRes.stages && draftRes.stages.length > 0) ? draftRes.stages : pubRes;
      setStages(loadedDraft.sort((a, b) => a.order - b.order));
      setPublishedStages(pubRes.sort((a, b) => a.order - b.order));
    } catch (err: any) {
      console.error(err);
      setNotification({ type: 'error', message: err.message || 'Gagal memuat alur SPMB.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reordering helpers
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...stages];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    // Re-assign order numbers
    const reordered = updated.map((st, i) => ({ ...st, order: i + 1 }));
    setStages(reordered);
  };

  const handleMoveDown = (index: number) => {
    if (index === stages.length - 1) return;
    const updated = [...stages];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    const reordered = updated.map((st, i) => ({ ...st, order: i + 1 }));
    setStages(reordered);
  };

  // Toggle stage active status
  const handleToggleActive = (stageId: string) => {
    setStages(prev =>
      prev.map(s => (s.id === stageId ? { ...s, isActive: !s.isActive } : s))
    );
  };

  // Toggle stage parent visibility
  const handleToggleShowToParents = (stageId: string) => {
    setStages(prev =>
      prev.map(s => (s.id === stageId ? { ...s, showToParents: !s.showToParents } : s))
    );
  };

  // Toggle global completion checklist
  const handleToggleGlobalCompletion = (stageId: string) => {
    setStages(prev =>
      prev.map(s => (s.id === stageId ? { ...s, isCompletedGlobally: !s.isCompletedGlobally } : s))
    );
  };

  // Save Draft
  const handleSaveDraft = async () => {
    try {
      setIsSavingDraft(true);
      await api.saveDraftSpmbStages(stages, currentUser?.name || 'Super Admin');
      setNotification({
        type: 'success',
        message: 'Draf alur SPMB berhasil disimpan. Klik "Publikasikan Alur" saat siap diterapkan ke website publik.'
      });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal menyimpan draf alur.' });
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Publish to Live
  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      const res = await api.publishSpmbStages(stages, currentUser?.name || 'Super Admin');
      setPublishedStages(res.stages.sort((a, b) => a.order - b.order));
      setNotification({
        type: 'success',
        message: 'Alur SPMB BERHASIL DIPUBLIKASIKAN! Seluruh tahapan sekarang aktif di website dan halaman Cek Status.'
      });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal mempublikasikan alur SPMB.' });
    } finally {
      setIsPublishing(false);
    }
  };

  // Revert Draft
  const handleRevertDraft = async () => {
    if (!window.confirm('Batalkan seluruh perubahan draf dan kembalikan ke alur yang sedang aktif saat ini?')) return;
    try {
      setLoading(true);
      const res = await api.revertDraftSpmbStages();
      setStages(res.stages.sort((a, b) => a.order - b.order));
      setNotification({ type: 'info', message: 'Perubahan draf dibatalkan. Kembali ke alur publik aktif.' });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal membatalkan draf.' });
    } finally {
      setLoading(false);
    }
  };

  // Create Stage
  const handleCreateStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageForm.title?.trim()) return;

    const newId = 'stage-' + Date.now();
    const createdStage: SpmbStageDefinition = {
      id: newId,
      order: stages.length + 1,
      title: newStageForm.title.trim(),
      description: newStageForm.description || '',
      actionInstruction: newStageForm.actionInstruction || '',
      processType: (newStageForm.processType as ProcessType) || 'lainnya',
      isRequired: newStageForm.isRequired ?? true,
      showToParents: newStageForm.showToParents ?? true,
      isActive: newStageForm.isActive ?? true,
      hasForm: newStageForm.hasForm || false,
      hasDocumentUpload: newStageForm.hasDocumentUpload || false,
      hasObservation: newStageForm.hasObservation || false,
      hasReRegistration: newStageForm.hasReRegistration || false,
      colorStatus: newStageForm.colorStatus || 'emerald',
      startDate: newStageForm.startDate || '',
      endDate: newStageForm.endDate || '',
      isCompletedGlobally: false
    };

    setStages(prev => [...prev, createdStage]);
    setIsNewStageModalOpen(false);
    setNewStageForm({
      title: '',
      description: '',
      actionInstruction: '',
      processType: 'lainnya',
      isRequired: true,
      showToParents: true,
      isActive: true,
      hasForm: false,
      hasDocumentUpload: false,
      hasObservation: false,
      hasReRegistration: false,
      colorStatus: 'emerald',
      startDate: '',
      endDate: ''
    });
    setNotification({
      type: 'success',
      message: `Tahapan "${createdStage.title}" berhasil ditambahkan ke draf. Jangan lupa simpan atau publikasikan.`
    });
  };

  // Edit Stage Save
  const handleSaveEditStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStage) return;

    setStages(prev =>
      prev.map(s => (s.id === editingStage.id ? { ...editingStage } : s))
    );
    setEditingStage(null);
    setNotification({
      type: 'success',
      message: `Perubahan tahapan "${editingStage.title}" berhasil diperbarui di draf.`
    });
  };

  // Delete Stage
  const handleConfirmDelete = () => {
    if (!deleteStageId) return;
    const target = stages.find(s => s.id === deleteStageId);
    const updated = stages.filter(s => s.id !== deleteStageId).map((st, i) => ({ ...st, order: i + 1 }));
    setStages(updated);
    setDeleteStageId(null);
    setNotification({
      type: 'info',
      message: `Tahapan "${target?.title || 'Terpilih'}" telah dihapus dari alur draf.`
    });
  };

  // Helper labels for process types
  const processTypeLabels: Record<ProcessType, { label: string; icon: any; color: string }> = {
    pendaftaran: { label: 'Pendaftaran Siswa', icon: FileText, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    verifikasi: { label: 'Verifikasi Berkas', icon: CheckCircle2, color: 'text-sky-700 bg-sky-50 border-sky-200' },
    perbaikan: { label: 'Perbaikan Dokumen', icon: AlertCircle, color: 'text-amber-700 bg-amber-50 border-amber-200' },
    observasi: { label: 'Observasi & Tes', icon: UserCheck, color: 'text-purple-700 bg-purple-50 border-purple-200' },
    seleksi: { label: 'Seleksi & Rapat', icon: Sparkles, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
    pengumuman: { label: 'Pengumuman Kelulusan', icon: Check, color: 'text-emerald-800 bg-emerald-100 border-emerald-300' },
    daftar_ulang: { label: 'Daftar Ulang & Biaya', icon: CreditCard, color: 'text-teal-700 bg-teal-50 border-teal-200' },
    lainnya: { label: 'Proses Lainnya', icon: Layers, color: 'text-stone-700 bg-stone-50 border-stone-200' }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-xs text-stone-500">
        Memuat konfigurasi dinamis alur SPMB...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-xs text-stone-800">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#D5AA53] block">
            Super Admin Control Center
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mt-0.5 flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#123B35]" />
            <span>Pengaturan Alur SPMB (Dinamis & Fleksibel)</span>
          </h2>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
            Atur tahapan penerimaan murid baru sesuai kebutuhan sekolah. Tambah, edit nama, ubah urutan (geser atas/bawah), atur jadwal, instruksi wali murid, dan fitur pendaftaran tanpa mengubah kode aplikasi.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsNewStageModalOpen(true)}
            className="px-4 py-2.5 bg-[#123B35] hover:bg-[#1a544b] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#D5AA53]" />
            <span>Tambah Tahapan</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="px-3.5 py-2.5 bg-[#174C80] hover:bg-[#2065AA] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Pratinjau tampilan alur bagi wali murid di Cek Status"
          >
            <Eye className="w-4 h-4 text-[#D5AA53]" />
            <span>Preview Alur</span>
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSavingDraft}
            className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl border border-stone-300 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-stone-600" />
            <span>{isSavingDraft ? 'Menyimpan...' : 'Simpan Draft'}</span>
          </button>

          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-[#D5AA53]" />
            <span>{isPublishing ? 'Mempublikasikan...' : 'Publikasikan Alur'}</span>
          </button>

          <button
            type="button"
            onClick={handleRevertDraft}
            className="p-2.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            title="Batalkan perubahan draft"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : notification.type === 'info'
              ? 'bg-sky-50 border-sky-200 text-sky-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            ) : notification.type === 'info' ? (
              <Info className="w-5 h-5 text-sky-700 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-700 shrink-0" />
            )}
            <span className="font-semibold">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Info Card on Safe History Migration */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-stone-800 text-xs leading-relaxed space-y-1">
        <div className="flex items-center gap-2 font-bold text-amber-950">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Keamanan Riwayat Pendaftar (Safe Stage Migration):</span>
        </div>
        <p className="text-[11px] text-amber-900">
          Setiap tahapan memiliki identifikasi unik (<code className="font-mono bg-amber-100/60 px-1 py-0.5 rounded">stageId</code>). Perubahan urutan, nama, atau deskripsi tidak akan menghilangkan progres pendaftaran murid lama yang telah diverifikasi panitia.
        </p>
      </div>

      {/* Stages List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
            <span>Daftar Tahapan SPMB ({stages.length} Tahapan Draf / Aktif)</span>
          </h3>
          <span className="text-[11px] text-stone-500">
            Gunakan tombol Geser untuk mengatur urutan tahapan yang tampil ke publik.
          </span>
        </div>

        <div className="space-y-2.5">
          {stages.map((stage, index) => {
            const isCompleted = stage.isCompletedGlobally;
            const typeKey = (stage.processType as ProcessType) || 'lainnya';
            const typeInfo = processTypeLabels[typeKey] || processTypeLabels.lainnya;
            const TypeIcon = typeInfo.icon;

            return (
              <div
                key={stage.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  !stage.isActive
                    ? 'bg-stone-100/80 border-stone-200 opacity-60'
                    : isCompleted
                    ? 'bg-emerald-50/50 border-emerald-300 shadow-2xs'
                    : 'bg-white border-stone-200 shadow-xs hover:border-stone-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Reorder + Order Pill + Info */}
                  <div className="flex items-start gap-3.5 flex-1">
                    {/* Reorder Buttons */}
                    <div className="flex flex-col gap-1 shrink-0 pt-0.5">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveUp(index)}
                        className="p-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="Geser ke Atas"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === stages.length - 1}
                        onClick={() => handleMoveDown(index)}
                        className="p-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="Geser ke Bawah"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Order Circle & Completion Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleGlobalCompletion(stage.id)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer transition-transform hover:scale-105"
                      title={isCompleted ? 'Tahapan ditandai selesai secara global' : 'Klik untuk menandai selesai secara global'}
                    >
                      {isCompleted ? (
                        <div className="w-full h-full rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-full h-full rounded-xl bg-[#123B35]/10 text-[#123B35] border border-[#123B35]/20 flex items-center justify-center font-mono">
                          {stage.order}
                        </div>
                      )}
                    </button>

                    {/* Stage Details */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-stone-900 text-sm sm:text-base">
                          {stage.title}
                        </h4>

                        {/* Process Type Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${typeInfo.color}`}>
                          <TypeIcon className="w-3 h-3" />
                          <span>{typeInfo.label}</span>
                        </span>

                        {stage.isRequired ? (
                          <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Wajib
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-500 font-medium bg-stone-100 px-2 py-0.5 rounded">
                            Opsional
                          </span>
                        )}

                        {!stage.isActive && (
                          <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            Nonaktif
                          </span>
                        )}

                        {stage.showToParents ? (
                          <span className="text-[10px] text-sky-800 font-semibold bg-sky-50 px-2 py-0.5 rounded border border-sky-200 flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>Tampil di Cek Status</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-500 font-medium bg-stone-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <EyeOff className="w-3 h-3" />
                            <span>Internal Sekolah</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed">
                        {stage.description}
                      </p>

                      {stage.actionInstruction && (
                        <p className="text-[11px] text-emerald-900 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100 italic">
                          <strong>Petunjuk Orang Tua:</strong> "{stage.actionInstruction}"
                        </p>
                      )}

                      {/* Feature Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {stage.hasForm && (
                          <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-mono text-[10px] border border-stone-200">
                            + Formulir Online
                          </span>
                        )}
                        {stage.hasDocumentUpload && (
                          <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-mono text-[10px] border border-stone-200">
                            + Upload Dokumen
                          </span>
                        )}
                        {stage.hasObservation && (
                          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-mono text-[10px] border border-purple-200">
                            + Observasi Belajar
                          </span>
                        )}
                        {stage.hasReRegistration && (
                          <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-mono text-[10px] border border-teal-200">
                            + Daftar Ulang & Persetujuan Admin Sekolah
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Schedule & Buttons */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-100">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-stone-500 block">Jadwal Pelaksanaan:</span>
                      <span className="text-xs font-mono font-bold text-stone-800">
                        {stage.startDate ? formatDateId(stage.startDate) : '-'} s.d. {stage.endDate ? formatDateId(stage.endDate) : '-'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleShowToParents(stage.id)}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                          stage.showToParents
                            ? 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100'
                            : 'bg-stone-100 text-stone-400 border-stone-200 hover:bg-stone-200'
                        }`}
                        title={stage.showToParents ? 'Sembunyikan dari Cek Status' : 'Tampilkan di Cek Status'}
                      >
                        {stage.showToParents ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleActive(stage.id)}
                        className={`px-2.5 py-1.5 rounded-xl border font-bold text-[11px] transition-colors cursor-pointer ${
                          stage.isActive
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                        title="Aktifkan/Nonaktifkan tahapan"
                      >
                        {stage.isActive ? 'Aktif' : 'Nonaktif'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingStage({ ...stage })}
                        className="px-3 py-1.5 bg-[#123B35] hover:bg-[#1a544b] text-white font-semibold rounded-xl transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#D5AA53]" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteStageId(stage.id)}
                        className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Hapus tahapan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL 1: ADD NEW STAGE */}
      {isNewStageModalOpen && (
        <StageFormModal
          isOpen={isNewStageModalOpen}
          title="Tambah Tahapan Baru SPMB"
          initialData={newStageForm}
          onClose={() => setIsNewStageModalOpen(false)}
          onSubmit={handleCreateStage}
          setFormData={setNewStageForm}
        />
      )}

      {/* MODAL 2: EDIT STAGE */}
      {editingStage && (
        <StageFormModal
          isOpen={!!editingStage}
          title={`Edit Tahapan SPMB: ${editingStage.title}`}
          initialData={editingStage}
          onClose={() => setEditingStage(null)}
          onSubmit={handleSaveEditStage}
          setFormData={setEditingStage as any}
        />
      )}

      {/* MODAL 3: DELETE CONFIRMATION */}
      {deleteStageId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteStageId(null);
          }}
        >
          <div className="bg-white rounded-3xl border border-stone-200 max-w-sm w-full p-6 shadow-2xl space-y-4 my-auto relative text-xs">
            <div className="flex justify-between items-start border-b border-stone-100 pb-2">
              <h4 className="font-bold text-sm text-rose-900 flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Konfirmasi Hapus Tahapan</span>
              </h4>
              <button
                type="button"
                onClick={() => setDeleteStageId(null)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-stone-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus tahapan ini dari draf alur SPMB? Urutan tahapan lainnya akan disesuaikan secara otomatis.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteStageId(null)}
                className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-50 font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs"
              >
                Ya, Hapus Tahapan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: PREVIEW SIMULATION MODAL (Desktop & Mobile) */}
      {showPreviewModal && (
        <PreviewFlowModal
          isOpen={showPreviewModal}
          stages={stages.filter(s => s.isActive && s.showToParents)}
          device={previewDevice}
          setDevice={setPreviewDevice}
          onClose={() => setShowPreviewModal(false)}
        />
      )}
    </div>
  );
};

// Reusable Stage Form Modal for Add/Edit
interface StageFormModalProps {
  isOpen: boolean;
  title: string;
  initialData: Partial<SpmbStageDefinition>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const StageFormModal: React.FC<StageFormModalProps> = ({
  isOpen,
  title,
  initialData,
  onClose,
  onSubmit,
  setFormData
}) => {
  useModalDismiss(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-3xl border border-stone-200 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto relative text-xs"
      >
        {/* Top Header */}
        <div className="bg-[#123B35] px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D5AA53] block">
              Konfigurasi Alur SPMB Dinamis
            </span>
            <h3 className="font-bold text-base text-white">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white font-bold transition-all cursor-pointer shadow-xs focus:ring-2 focus:ring-white shrink-0"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 bg-[#F7F8F5]">
          <div>
            <label className="block font-bold text-stone-800 mb-1">
              Nama Tahapan <span className="text-rose-500">*</span>:
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Pendaftaran Online & Pengisian Formulir"
              value={initialData.title || ''}
              onChange={e => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-stone-300 font-bold text-stone-900 bg-white focus:ring-2 focus:ring-[#123B35]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                Kategori Proses:
              </label>
              <select
                value={initialData.processType || 'lainnya'}
                onChange={e => setFormData((prev: any) => ({ ...prev, processType: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-stone-300 font-medium text-stone-900 bg-white"
              >
                <option value="pendaftaran">Pendaftaran Murid Baru</option>
                <option value="verifikasi">Verifikasi Berkas Panitia</option>
                <option value="perbaikan">Perbaikan Dokumen Oleh Orang Tua</option>
                <option value="observasi">Observasi Pemetaan Belajar</option>
                <option value="seleksi">Seleksi & Rapat Dewan Guru</option>
                <option value="pengumuman">Pengumuman Kelulusan</option>
                <option value="daftar_ulang">Daftar Ulang & Administrasi</option>
                <option value="lainnya">Tahapan Proses Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-800 mb-1">
                Warna Indikator Status:
              </label>
              <select
                value={initialData.colorStatus || 'emerald'}
                onChange={e => setFormData((prev: any) => ({ ...prev, colorStatus: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-stone-300 font-medium text-stone-900 bg-white"
              >
                <option value="emerald">Hijau (Emerald / Positif)</option>
                <option value="sky">Biru (Sky / Proses)</option>
                <option value="amber">Kuning / Emas (Amber / Perhatian)</option>
                <option value="purple">Ungu (Observasi / Khusus)</option>
                <option value="stone">Abu-abu (Netral)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-800 mb-1">Tanggal Mulai:</label>
              <input
                type="date"
                value={initialData.startDate || ''}
                onChange={e => setFormData((prev: any) => ({ ...prev, startDate: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-800 mb-1">Tanggal Selesai:</label>
              <input
                type="date"
                value={initialData.endDate || ''}
                onChange={e => setFormData((prev: any) => ({ ...prev, endDate: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-800 mb-1">Deskripsi Lengkap Tahapan:</label>
            <textarea
              rows={2}
              placeholder="Jelaskan apa yang terjadi pada tahapan ini..."
              value={initialData.description || ''}
              onChange={e => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-800 mb-1">
              Instruksi Tindakan untuk Orang Tua (Tampil di Cek Status):
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Silakan unduh bukti pendaftaran dan hubungi admin jika berkas perlu perbaikan."
              value={initialData.actionInstruction || ''}
              onChange={e => setFormData((prev: any) => ({ ...prev, actionInstruction: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
            />
          </div>

          {/* Feature Tags Checkboxes */}
          <div>
            <span className="block font-bold text-stone-800 mb-2">Tag Fitur & Integrasi Sistem:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={initialData.hasForm || false}
                  onChange={e => setFormData((prev: any) => ({ ...prev, hasForm: e.target.checked }))}
                  className="rounded text-[#123B35] focus:ring-[#123B35]"
                />
                <span className="font-semibold text-stone-800">Memiliki Formulir Pendaftaran</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={initialData.hasDocumentUpload || false}
                  onChange={e => setFormData((prev: any) => ({ ...prev, hasDocumentUpload: e.target.checked }))}
                  className="rounded text-[#123B35] focus:ring-[#123B35]"
                />
                <span className="font-semibold text-stone-800">Memiliki Upload Dokumen</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={initialData.hasObservation || false}
                  onChange={e => setFormData((prev: any) => ({ ...prev, hasObservation: e.target.checked }))}
                  className="rounded text-[#123B35] focus:ring-[#123B35]"
                />
                <span className="font-semibold text-stone-800">Integrasi Observasi Belajar</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={initialData.hasReRegistration || false}
                  onChange={e => setFormData((prev: any) => ({ ...prev, hasReRegistration: e.target.checked }))}
                  className="rounded text-[#123B35] focus:ring-[#123B35]"
                />
                <span className="font-semibold text-stone-800">Integrasi Daftar Ulang Sekolah</span>
              </label>
            </div>
          </div>

          {/* Visibility and Active Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-stone-200">
            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-stone-200 cursor-pointer">
              <input
                type="checkbox"
                checked={initialData.isRequired ?? true}
                onChange={e => setFormData((prev: any) => ({ ...prev, isRequired: e.target.checked }))}
                className="rounded text-amber-600 focus:ring-amber-600"
              />
              <span className="font-semibold text-stone-800">Tahapan Wajib</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-stone-200 cursor-pointer">
              <input
                type="checkbox"
                checked={initialData.showToParents ?? true}
                onChange={e => setFormData((prev: any) => ({ ...prev, showToParents: e.target.checked }))}
                className="rounded text-sky-600 focus:ring-sky-600"
              />
              <span className="font-semibold text-stone-800">Tampilkan ke Orang Tua</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-stone-200 cursor-pointer">
              <input
                type="checkbox"
                checked={initialData.isActive ?? true}
                onChange={e => setFormData((prev: any) => ({ ...prev, isActive: e.target.checked }))}
                className="rounded text-emerald-600 focus:ring-emerald-600"
              />
              <span className="font-semibold text-stone-800">Status Aktif</span>
            </label>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 px-6 bg-white border-t border-stone-200 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-50 font-semibold cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-[#123B35] hover:bg-[#1a544b] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Simpan Tahapan
          </button>
        </div>
      </form>
    </div>
  );
};

// Preview Flow Modal simulation
interface PreviewFlowModalProps {
  isOpen: boolean;
  stages: SpmbStageDefinition[];
  device: 'desktop' | 'mobile';
  setDevice: (d: 'desktop' | 'mobile') => void;
  onClose: () => void;
}

const PreviewFlowModal: React.FC<PreviewFlowModalProps> = ({
  isOpen,
  stages,
  device,
  setDevice,
  onClose
}) => {
  useModalDismiss(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl border border-stone-200 w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto relative text-xs">
        {/* Header */}
        <div className="bg-[#123B35] px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D5AA53] block">
              Simulasi Pratinjau Wali Murid
            </span>
            <h3 className="font-bold text-base text-white">
              Tampilan Alur Tahapan SPMB di Halaman "Cek Status Pendaftaran"
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {/* Device Switcher */}
            <div className="flex items-center gap-1 bg-black/25 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setDevice('desktop')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  device === 'desktop' ? 'bg-white text-[#123B35]' : 'text-stone-300 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop (Horizontal Scroll)</span>
              </button>
              <button
                type="button"
                onClick={() => setDevice('mobile')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  device === 'mobile' ? 'bg-white text-[#123B35]' : 'text-stone-300 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile (Vertical Stack)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white font-bold transition-all cursor-pointer shadow-xs focus:ring-2 focus:ring-white shrink-0"
              title="Tutup (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#F7F8F5] space-y-6">
          <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
              Status Simulasi Contoh Calon Siswa:
            </span>
            <h4 className="font-bold text-stone-900 text-sm">
              M. Fatih Al-Habsyi (Reg: SPMB-2027-001) · Tahap 1 Selesai, Tahap 2 Dalam Proses
            </h4>
          </div>

          {device === 'desktop' ? (
            /* DESKTOP VIEW: Horizontal scroll card deck */
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-stone-700">Tampilan Desktop (Geser ke samping):</span>
                <span className="text-[11px] text-stone-500 font-medium">← Scroll horizontal →</span>
              </div>
              <div className="overflow-x-auto pb-4 pt-1 flex gap-4 no-scrollbar">
                {stages.map((st, idx) => {
                  const isSampleDone = idx === 0;
                  const isSampleActive = idx === 1;

                  return (
                    <div
                      key={st.id}
                      className={`min-w-[280px] max-w-[280px] p-5 rounded-2xl border flex flex-col justify-between shadow-xs transition-all ${
                        isSampleDone
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : isSampleActive
                          ? 'bg-sky-50/70 border-sky-300 ring-2 ring-sky-400'
                          : 'bg-white border-stone-200'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-black/5 text-stone-700">
                            Tahap {st.order}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isSampleDone
                              ? 'bg-emerald-200 text-emerald-900'
                              : isSampleActive
                              ? 'bg-sky-200 text-sky-900'
                              : 'bg-stone-200 text-stone-600'
                          }`}>
                            {isSampleDone ? 'Selesai' : isSampleActive ? 'Sedang Berlangsung' : 'Menunggu'}
                          </span>
                        </div>

                        <h5 className="font-bold text-stone-900 text-sm">{st.title}</h5>
                        <p className="text-[11px] text-stone-600 line-clamp-3">{st.description}</p>
                      </div>

                      {st.actionInstruction && (
                        <div className="mt-3 pt-3 border-t border-stone-200/60 text-[10px] text-stone-500 italic">
                          "{st.actionInstruction}"
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* MOBILE VIEW: Vertical responsive stack */
            <div className="max-w-md mx-auto space-y-3">
              <span className="font-bold text-stone-700 block mb-2">Tampilan Smartphone (Vertikal):</span>
              {stages.map((st, idx) => {
                const isSampleDone = idx === 0;
                const isSampleActive = idx === 1;

                return (
                  <div
                    key={st.id}
                    className={`p-4 rounded-2xl border shadow-xs ${
                      isSampleDone
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : isSampleActive
                        ? 'bg-sky-50/70 border-sky-300 ring-2 ring-sky-400'
                        : 'bg-white border-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-black/5 text-stone-700">
                        Tahap {st.order}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isSampleDone
                          ? 'bg-emerald-200 text-emerald-900'
                          : isSampleActive
                          ? 'bg-sky-200 text-sky-900'
                          : 'bg-stone-200 text-stone-600'
                      }`}>
                        {isSampleDone ? 'Selesai' : isSampleActive ? 'Sedang Berlangsung' : 'Menunggu'}
                      </span>
                    </div>
                    <h5 className="font-bold text-stone-900 text-sm">{st.title}</h5>
                    <p className="text-[11px] text-stone-600 mt-1">{st.description}</p>
                    {st.actionInstruction && (
                      <p className="text-[10px] text-emerald-900 mt-2 italic bg-white/60 p-2 rounded-lg">
                        "{st.actionInstruction}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-white border-t border-stone-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-stone-500">
            Pratinjau ini merefleksikan tampilan langsung yang akan dilihat oleh wali murid setelah dipublikasikan.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#123B35] hover:bg-[#1a544b] text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
          >
            Selesai Pratinjau
          </button>
        </div>
      </div>
    </div>
  );
};
