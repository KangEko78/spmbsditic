/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SchoolProfile } from '../../../types';
import { Save, CheckCircle2, MapPin, Plus, Trash2 } from 'lucide-react';

interface SchoolProfileEditorProps {
  profile: SchoolProfile;
  onUpdateProfile: (profile: Partial<SchoolProfile>) => Promise<void>;
}

export const SchoolProfileEditor: React.FC<SchoolProfileEditorProps> = ({
  profile,
  onUpdateProfile
}) => {
  const [form, setForm] = useState<SchoolProfile>(JSON.parse(JSON.stringify(profile)));
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New facility
  const [newFacilityName, setNewFacilityName] = useState('');
  const [newFacilityDesc, setNewFacilityDesc] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateProfile(form);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFacility = () => {
    if (!newFacilityName) return;
    setForm({
      ...form,
      facilities: [
        ...form.facilities,
        { id: `f-${Date.now()}`, name: newFacilityName, description: newFacilityDesc }
      ]
    });
    setNewFacilityName('');
    setNewFacilityDesc('');
  };

  const handleRemoveFacility = (id: string) => {
    setForm({
      ...form,
      facilities: form.facilities.filter(f => f.id !== id)
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 text-xs text-stone-800">
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase text-emerald-800 tracking-wider">
            Modul 9 · Profil & Identitas Sekolah
          </span>
          <h2 className="text-2xl font-bold text-stone-900 mt-0.5">
            Pengelolaan Data Profil, Visi-Misi & Peta
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Ubah identitas resmi sekolah, titik koordinat peta lokasi, sambutan kepala sekolah, dan fasilitas belajar.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#123B35] hover:bg-[#1a544b] text-white font-bold rounded-lg shadow-xs cursor-pointer"
        >
          <Save className="w-4 h-4 text-[#D5AA53]" />
          <span>{isSaving ? 'Menyimpan...' : 'Simpan Profil'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profil sekolah berhasil diperbarui secara persisten!</span>
        </div>
      )}

      {/* Identitas Resmi */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#123B35] border-b border-stone-100 pb-2">
          Identitas Resmi Sekolah
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-medium text-stone-700 mb-1">Nama Lengkap Lembaga</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-stone-300 font-bold"
            />
          </div>

          <div>
            <label className="block font-medium text-stone-700 mb-1">NPSN (Nomor Pokok Sekolah Nasional)</label>
            <input
              type="text"
              value={form.npsn}
              onChange={e => setForm({ ...form, npsn: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-stone-300 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-medium text-stone-700 mb-1">Status Akreditasi</label>
            <input
              type="text"
              value={form.accreditation}
              onChange={e => setForm({ ...form, accreditation: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-stone-300 font-bold"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-stone-700 mb-1">Tagline / Motto Sekolah</label>
          <input
            type="text"
            value={form.tagline}
            onChange={e => setForm({ ...form, tagline: e.target.value })}
            className="w-full p-2.5 rounded-lg border border-stone-300"
          />
        </div>

        <div>
          <label className="block font-medium text-stone-700 mb-1">Alamat Lengkap</label>
          <input
            type="text"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            className="w-full p-2.5 rounded-lg border border-stone-300"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block font-medium text-stone-700 mb-1">Kecamatan</label>
            <input
              type="text"
              value={form.district}
              onChange={e => setForm({ ...form, district: e.target.value })}
              className="w-full p-2 rounded-lg border border-stone-300"
            />
          </div>
          <div>
            <label className="block font-medium text-stone-700 mb-1">Kabupaten</label>
            <input
              type="text"
              value={form.regency}
              onChange={e => setForm({ ...form, regency: e.target.value })}
              className="w-full p-2 rounded-lg border border-stone-300"
            />
          </div>
          <div>
            <label className="block font-medium text-stone-700 mb-1">Provinsi</label>
            <input
              type="text"
              value={form.province}
              onChange={e => setForm({ ...form, province: e.target.value })}
              className="w-full p-2 rounded-lg border border-stone-300"
            />
          </div>
          <div>
            <label className="block font-medium text-stone-700 mb-1">Kode Pos</label>
            <input
              type="text"
              value={form.postalCode}
              onChange={e => setForm({ ...form, postalCode: e.target.value })}
              className="w-full p-2 rounded-lg border border-stone-300 font-mono"
            />
          </div>
        </div>

        {/* Coordinates */}
        <div className="p-4 bg-[#F7F8F5] rounded-xl border border-stone-200">
          <div className="flex items-center gap-2 font-bold text-stone-900 mb-2">
            <MapPin className="w-4 h-4 text-emerald-800" />
            <span>Koordinat Titik Peta Google Maps</span>
          </div>
          <p className="text-[11px] text-stone-500 mb-3">
            Admin dapat mengoreksi dan menyetel angka desimal latitude dan longitude jika penempatan pin memerlukan penyesuaian lapangan.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-stone-700 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={form.coordinates.lat}
                onChange={e => setForm({
                  ...form,
                  coordinates: { ...form.coordinates, lat: Number(e.target.value) }
                })}
                className="w-full p-2.5 rounded-lg border border-stone-300 font-mono bg-white"
              />
            </div>
            <div>
              <label className="block font-medium text-stone-700 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={form.coordinates.lng}
                onChange={e => setForm({
                  ...form,
                  coordinates: { ...form.coordinates, lng: Number(e.target.value) }
                })}
                className="w-full p-2.5 rounded-lg border border-stone-300 font-mono bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sambutan & Visi Misi */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#123B35] border-b border-stone-100 pb-2">
          Pimpinan Sekolah & Visi Misi
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-stone-700 mb-1">Nama Kepala Sekolah & Gelar</label>
            <input
              type="text"
              value={form.headmasterName}
              onChange={e => setForm({ ...form, headmasterName: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-stone-300 font-bold"
            />
          </div>

          <div>
            <label className="block font-medium text-stone-700 mb-1">Nama Ketua Panitia SPMB & Gelar</label>
            <input
              type="text"
              value={form.spmbChairmanName || ''}
              onChange={e => setForm({ ...form, spmbChairmanName: e.target.value })}
              placeholder="Contoh: Tasyantik Salsabilla, S.Pd."
              className="w-full p-2.5 rounded-lg border border-stone-300 font-bold"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-stone-700 mb-1">Sambutan Hangat Kepala Sekolah</label>
          <textarea
            rows={4}
            value={form.headmasterGreeting}
            onChange={e => setForm({ ...form, headmasterGreeting: e.target.value })}
            className="w-full p-2.5 rounded-lg border border-stone-300 leading-relaxed"
          />
        </div>

        <div>
          <label className="block font-medium text-stone-700 mb-1">Sejarah Singkat Sekolah</label>
          <textarea
            rows={3}
            value={form.history}
            onChange={e => setForm({ ...form, history: e.target.value })}
            className="w-full p-2.5 rounded-lg border border-stone-300 leading-relaxed"
          />
        </div>

        <div>
          <label className="block font-medium text-stone-700 mb-1">Visi Utama Sekolah</label>
          <textarea
            rows={2}
            value={form.vision}
            onChange={e => setForm({ ...form, vision: e.target.value })}
            className="w-full p-2.5 rounded-lg border border-stone-300 font-medium"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block font-bold text-stone-900">
              Misi Pendidikan Sekolah ({form.mission.length} Butir)
            </label>
            <button
              type="button"
              onClick={() => setForm({ ...form, mission: [...form.mission, ''] })}
              className="text-xs text-emerald-800 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Butir Misi</span>
            </button>
          </div>
          <div className="space-y-2">
            {form.mission.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[11px] flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={item}
                  onChange={e => {
                    const newM = [...form.mission];
                    newM[idx] = e.target.value;
                    setForm({ ...form, mission: newM });
                  }}
                  className="flex-1 p-2 rounded-lg border border-stone-300 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newM = form.mission.filter((_, i) => i !== idx);
                    setForm({ ...form, mission: newM });
                  }}
                  className="p-1.5 text-stone-400 hover:text-rose-600 rounded cursor-pointer"
                  title="Hapus butir misi"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fasilitas */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#123B35] border-b border-stone-100 pb-2">
          Fasilitas Sekolah ({form.facilities.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {form.facilities.map(fac => (
            <div key={fac.id} className="p-3 bg-[#F7F8F5] rounded-xl border border-stone-200 flex justify-between items-start gap-2">
              <div>
                <p className="font-bold text-stone-900">{fac.name}</p>
                <p className="text-[11px] text-stone-600 mt-0.5">{fac.description}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveFacility(fac.id)}
                className="p-1 text-stone-400 hover:text-rose-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
          <h4 className="font-bold text-stone-800">Tambah Sarana / Fasilitas Baru:</h4>
          <input
            type="text"
            placeholder="Nama fasilitas (contoh: Studio Robotik)"
            value={newFacilityName}
            onChange={e => setNewFacilityName(e.target.value)}
            className="w-full p-2 rounded-lg border border-stone-300 bg-white"
          />
          <input
            type="text"
            placeholder="Deskripsi fungsi sarana..."
            value={newFacilityDesc}
            onChange={e => setNewFacilityDesc(e.target.value)}
            className="w-full p-2 rounded-lg border border-stone-300 bg-white"
          />
          <button
            type="button"
            onClick={handleAddFacility}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded-lg flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Fasilitas</span>
          </button>
        </div>
      </div>
    </form>
  );
};
