/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SpmbWave } from '../../../types';
import { api } from '../../../lib/api';
import { formatRupiah } from '../../../lib/utils';
import {
  CalendarDays,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface QuotaScheduleSettingsProps {
  wave?: SpmbWave;
  onUpdateWave?: (wave: Partial<SpmbWave>) => Promise<void>;
}

export const QuotaScheduleSettings: React.FC<QuotaScheduleSettingsProps> = () => {
  const [waves, setWaves] = useState<SpmbWave[]>([]);
  const [activeWaveId, setActiveWaveId] = useState<string>('gelombang-1');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New FAQ item
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  const loadWaves = async () => {
    try {
      setLoading(true);
      const data = await api.getSpmbWaves();
      setWaves(data);
      if (data.length > 0 && !data.some(w => w.id === activeWaveId)) {
        setActiveWaveId(data[0].id);
      }
    } catch (err: any) {
      console.error(err);
      setNotification({ type: 'error', message: err.message || 'Gagal memuat data gelombang.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWaves();
  }, []);

  const currentWave = waves.find(w => w.id === activeWaveId) || waves[0];

  const handleUpdateCurrentWave = (changes: Partial<SpmbWave>) => {
    if (!currentWave) return;
    setWaves(prev =>
      prev.map(w => (w.id === currentWave.id ? { ...w, ...changes } : w))
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWave) return;

    setIsSaving(true);
    setNotification(null);
    try {
      await api.updateSpmbWave(currentWave.id, currentWave);
      setNotification({
        type: 'success',
        message: `Pengaturan ${currentWave.name} (${currentWave.status || 'Aktif'}) berhasil disimpan ke database!`
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal menyimpan pengaturan gelombang.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFaq = () => {
    if (!newQuestion.trim() || !newAnswer.trim() || !currentWave) return;
    const updatedFaq = [...(currentWave.faq || []), { question: newQuestion.trim(), answer: newAnswer.trim() }];
    handleUpdateCurrentWave({ faq: updatedFaq });
    setNewQuestion('');
    setNewAnswer('');
  };

  const handleRemoveFaq = (idx: number) => {
    if (!currentWave) return;
    const updatedFaq = (currentWave.faq || []).filter((_, i) => i !== idx);
    handleUpdateCurrentWave({ faq: updatedFaq });
  };

  if (loading || !currentWave) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-xs text-stone-500">
        Memuat konfigurasi Gelombang SPMB 1 & 2...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 text-xs text-stone-800">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider block">
            Pengaturan Super Admin & Panitia
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mt-0.5 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-[#123B35]" />
            <span>Pengaturan Gelombang Pendaftaran (Gelombang 1 & 2)</span>
          </h2>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
            Kelola kuota calon siswa, status pembukaan (Akan Dibuka, Dibuka, Ditutup), tanggal pendaftaran, infaq, dan jadwal seleksi untuk Gelombang 1 dan Gelombang 2.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#123B35] hover:bg-[#1a544b] text-white font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4 text-[#D5AA53]" />
          <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
        </button>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-700 shrink-0" />
          )}
          <span className="font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Wave Selector Tabs */}
      <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-stone-200 shadow-2xs">
        {waves.map(w => {
          const isSelected = w.id === currentWave.id;
          const status = w.status || 'Dibuka';
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => setActiveWaveId(w.id)}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-all text-left flex items-center justify-between cursor-pointer ${
                isSelected
                  ? 'bg-[#123B35] text-white shadow-md'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
              }`}
            >
              <div>
                <span className="block text-xs">{w.name}</span>
                <span className={`text-[10px] font-mono ${isSelected ? 'text-[#D5AA53]' : 'text-stone-500'}`}>
                  Kuota: {w.quota} Siswa
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                status === 'Dibuka'
                  ? 'bg-emerald-500 text-white'
                  : status === 'Akan Dibuka'
                  ? 'bg-amber-400 text-stone-900'
                  : 'bg-stone-400 text-white'
              }`}>
                {status}
              </span>
            </button>
          );
        })}
      </div>

      {/* Basic Wave & Quota Info */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="text-sm font-bold text-[#123B35]">
            Konfigurasi: {currentWave.name}
          </h3>

          <div className="flex items-center gap-2">
            <label className="font-bold text-stone-700">Status Gelombang:</label>
            <select
              value={currentWave.status || 'Dibuka'}
              onChange={e => handleUpdateCurrentWave({ status: e.target.value as any })}
              className="p-2 rounded-xl border border-stone-300 font-bold bg-white text-stone-900 focus:ring-2 focus:ring-[#123B35]"
            >
              <option value="Dibuka">🟢 Dibuka (Pendaftaran Aktif)</option>
              <option value="Akan Dibuka">🟡 Akan Dibuka (Jadwal Mendatang)</option>
              <option value="Ditutup">🔴 Ditutup (Pendaftaran Selesai)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-medium text-stone-700 mb-1">Nama Gelombang</label>
            <input
              type="text"
              required
              value={currentWave.name}
              onChange={e => handleUpdateCurrentWave({ name: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-stone-300 font-bold"
            />
          </div>

          <div>
            <label className="block font-medium text-stone-700 mb-1">Tahun Ajaran</label>
            <input
              type="text"
              required
              value={currentWave.academicYear}
              onChange={e => handleUpdateCurrentWave({ academicYear: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-stone-300 font-bold"
            />
          </div>

          <div>
            <label className="block font-medium text-stone-700 mb-1">Kuota Murid Baru</label>
            <input
              type="number"
              min={1}
              max={300}
              required
              value={currentWave.quota}
              onChange={e => handleUpdateCurrentWave({ quota: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl border border-stone-300 font-mono font-bold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-stone-700 mb-1">Tanggal Mulai Pendaftaran</label>
            <input
              type="date"
              required
              value={currentWave.startDate}
              onChange={e => handleUpdateCurrentWave({ startDate: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-stone-300"
            />
          </div>

          <div>
            <label className="block font-medium text-stone-700 mb-1">Tanggal Penutupan Pendaftaran</label>
            <input
              type="date"
              required
              value={currentWave.endDate}
              onChange={e => handleUpdateCurrentWave({ endDate: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-stone-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-medium text-stone-700 mb-1">Tanggal Rilis Pengumuman</label>
            <input
              type="date"
              value={currentWave.announcementDate}
              onChange={e => handleUpdateCurrentWave({ announcementDate: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-stone-300"
            />
          </div>

          <div>
            <label className="block font-medium text-stone-700 mb-1">Mulai Daftar Ulang</label>
            <input
              type="date"
              value={currentWave.reRegistrationStartDate}
              onChange={e => handleUpdateCurrentWave({ reRegistrationStartDate: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-stone-300"
            />
          </div>

          <div>
            <label className="block font-medium text-stone-700 mb-1">Batas Akhir Daftar Ulang</label>
            <input
              type="date"
              value={currentWave.reRegistrationEndDate}
              onChange={e => handleUpdateCurrentWave({ reRegistrationEndDate: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-stone-300"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-stone-700 mb-1">Infaq / Biaya Pendaftaran Form (Rp)</label>
          <input
            type="number"
            min={0}
            step={5000}
            value={currentWave.registrationFee || 0}
            onChange={e => handleUpdateCurrentWave({ registrationFee: Number(e.target.value) })}
            className="w-full sm:w-1/2 p-2.5 rounded-xl border border-stone-300 font-mono font-bold"
          />
          <p className="text-[11px] text-stone-500 mt-1">
            Isi 0 jika pendaftaran formulir gratis. Biaya daftar ulang akhir diatur terpisah pada menu Daftar Ulang.
          </p>
        </div>
      </div>

      {/* FAQ Management */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#123B35] border-b border-stone-100 pb-2">
          Kelola Pertanyaan Umum (FAQ) untuk {currentWave.name}
        </h3>

        <div className="space-y-2">
          {(currentWave.faq || []).map((item, idx) => (
            <div key={idx} className="p-3.5 bg-[#F7F8F5] rounded-2xl border border-stone-200 flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-stone-900">{item.question}</p>
                <p className="text-stone-600 mt-1 leading-relaxed">{item.answer}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveFaq(idx)}
                className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg cursor-pointer shrink-0"
                title="Hapus FAQ"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add FAQ Form */}
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
          <h4 className="font-bold text-stone-800">Tambah Pertanyaan Baru:</h4>
          <input
            type="text"
            placeholder="Contoh: Apakah ada tes baca Al-Qur'an saat observasi?"
            value={newQuestion}
            onChange={e => setNewQuestion(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
          />
          <textarea
            rows={2}
            placeholder="Jawaban resmi dari pihak sekolah..."
            value={newAnswer}
            onChange={e => setNewAnswer(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
          />
          <button
            type="button"
            onClick={handleAddFaq}
            className="px-4 py-2 bg-[#123B35] text-white font-bold rounded-xl hover:bg-[#1a544b] flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#D5AA53]" />
            <span>Tambah ke FAQ {currentWave.name}</span>
          </button>
        </div>
      </div>
    </form>
  );
};
