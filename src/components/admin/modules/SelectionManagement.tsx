/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Registration } from '../../../types';
import { api } from '../../../lib/api';
import { Award, CheckCircle, XCircle, Calculator, FileCheck } from 'lucide-react';

interface SelectionManagementProps {
  registrations: Registration[];
  onRefresh: () => void;
}

export const SelectionManagement: React.FC<SelectionManagementProps> = ({
  registrations,
  onRefresh
}) => {
  // Only students with verified docs can be evaluated
  const eligible = registrations.filter(
    r => ['Terverifikasi', 'Dalam Seleksi', 'Diterima', 'Tidak Diterima', 'Daftar Ulang'].includes(r.status)
  );

  const [selectedReg, setSelectedReg] = useState<Registration | null>(eligible[0] || null);
  const [observasi, setObservasi] = useState<number>(selectedReg?.selection?.observasiKesiapan || 85);
  const [bacaQuran, setBacaQuran] = useState<number>(selectedReg?.selection?.bacaQuranIqro || 80);
  const [wawancara, setWawancara] = useState<number>(selectedReg?.selection?.wawancaraOrtu || 90);
  const [catatan, setCatatan] = useState<string>(selectedReg?.selection?.catatanSeleksi || '');
  const [isSaving, setIsSaving] = useState(false);

  const totalScore = Number(((observasi * 0.4) + (bacaQuran * 0.3) + (wawancara * 0.3)).toFixed(1));

  const handleSelectApplicant = (reg: Registration) => {
    setSelectedReg(reg);
    setObservasi(reg.selection?.observasiKesiapan || 85);
    setBacaQuran(reg.selection?.bacaQuranIqro || 80);
    setWawancara(reg.selection?.wawancaraOrtu || 90);
    setCatatan(reg.selection?.catatanSeleksi || '');
  };

  const handleSaveAssessment = async (isPassed: boolean) => {
    if (!selectedReg) return;
    setIsSaving(true);
    try {
      await api.updateSelectionScore(selectedReg.id, {
        observasiKesiapan: observasi,
        bacaQuranIqro: bacaQuran,
        wawancaraOrtu: wawancara,
        catatanSeleksi: catatan,
        evaluatedBy: 'Tim Seleksi SPMB',
        isPassed
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
        <span className="text-xs font-semibold uppercase text-emerald-800 tracking-wider">
          Modul 5 · Seleksi Calon Murid
        </span>
        <h2 className="text-2xl font-bold text-stone-900 mt-0.5">
          Penilaian Observasi Kesiapan Belajar & Wawancara
        </h2>
        <p className="text-xs text-stone-600 mt-1">
          Input skor observasi motorik/kognitif (bobot 40%), bacaan Iqro/Al-Qur'an (bobot 30%), dan komitmen orang tua (bobot 30%).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Applicant List */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-2">
          <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider px-2 mb-2">
            Peserta Seleksi ({eligible.length})
          </h4>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {eligible.map(reg => {
              const isSelected = selectedReg?.id === reg.id;
              const hasScore = !!reg.selection;
              return (
                <div
                  key={reg.id}
                  onClick={() => handleSelectApplicant(reg)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-700 shadow-xs'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono font-bold text-[#123B35]">
                      {reg.registrationNumber}
                    </span>
                    {hasScore && (
                      <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
                        Skor: {reg.selection?.totalScore}
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-stone-900">{reg.student.fullName}</p>
                  <p className="text-[11px] text-stone-500">Status: {reg.status}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Scoring Form */}
        {selectedReg ? (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-5">
            <div className="border-b border-stone-100 pb-3">
              <span className="text-xs font-mono font-bold text-emerald-800">
                {selectedReg.registrationNumber}
              </span>
              <h3 className="text-lg font-bold text-stone-900">
                Penilaian: {selectedReg.student.fullName}
              </h3>
              <p className="text-xs text-stone-500">
                Lahir: {selectedReg.student.birthPlace}, {selectedReg.student.birthDate} · Asal: {selectedReg.student.previousSchool || 'PAUD/TK'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                <label className="block font-bold text-stone-900 mb-1">
                  1. Observasi Kesiapan (40%)
                </label>
                <p className="text-[11px] text-stone-500 mb-2">Motorik halus & kemandirian</p>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={observasi}
                  onChange={e => setObservasi(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-stone-300 font-mono font-bold text-lg bg-white"
                />
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                <label className="block font-bold text-stone-900 mb-1">
                  2. Pengenalan Iqro (30%)
                </label>
                <p className="text-[11px] text-stone-500 mb-2">Huruf hijaiyah & doa harian</p>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={bacaQuran}
                  onChange={e => setBacaQuran(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-stone-300 font-mono font-bold text-lg bg-white"
                />
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                <label className="block font-bold text-stone-900 mb-1">
                  3. Wawancara Ortu (30%)
                </label>
                <p className="text-[11px] text-stone-500 mb-2">Komitmen pendampingan anak</p>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={wawancara}
                  onChange={e => setWawancara(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-stone-300 font-mono font-bold text-lg bg-white"
                />
              </div>
            </div>

            {/* Total Weighted Score Banner */}
            <div className="p-4 rounded-xl bg-[#123B35] text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-[#D5AA53] uppercase font-bold tracking-wider">
                  Hasil Kalkulasi Bobot Skor Terpadu
                </span>
                <p className="text-xs text-stone-300 mt-0.5">
                  Standar kelulusan rata-rata minimal: 70.0
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-mono font-black text-[#D5AA53] tabular-nums">
                  {totalScore}
                </span>
                <span className="text-xs text-stone-300 block">/ 100</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-800 text-xs mb-1">
                Catatan Evaluator & Rekomendasi Guru:
              </label>
              <textarea
                rows={3}
                placeholder="Tuliskan catatan khusus terkait karakter ananda atau kebutuhan pendampingan belajar..."
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-[#123B35]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-stone-100">
              <button
                disabled={isSaving}
                onClick={() => handleSaveAssessment(false)}
                className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Simpan & Tetapkan: Tidak Lolos
              </button>

              <button
                disabled={isSaving}
                onClick={() => handleSaveAssessment(true)}
                className="px-6 py-2.5 bg-[#123B35] hover:bg-[#1a544b] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Award className="w-4 h-4 text-[#D5AA53]" />
                <span>Simpan Skor & Tetapkan LULUS (DITERIMA)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500 text-xs">
            Pilih peserta seleksi di kolom kiri untuk memasukkan nilai observasi.
          </div>
        )}
      </div>
    </div>
  );
};
