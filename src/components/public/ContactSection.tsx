/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SchoolProfile } from '../../types';
import { GoogleMapSection } from '../common/GoogleMapSection';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';

interface ContactSectionProps {
  schoolProfile: SchoolProfile;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ schoolProfile }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    setTimeout(() => setIsSent(false), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 text-stone-800">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold text-emerald-800 uppercase tracking-widest block">
          Layanan Informasi & Konsultasi
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-serif">
          Hubungi SDIT Insan Cendikia Kalibaru
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Kami siap menyambut dan mendampingi bapak/ibu wali murid dalam konsultasi pendidikan ananda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Details Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200 p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-stone-900 mb-1">Sekretariat Sekolah</h3>
            <p className="text-xs text-stone-600">
              Silakan berkunjung langsung pada jam operasional layanan tata usaha.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-900">Alamat Sekolah:</strong>
                <p className="text-stone-600 mt-0.5">
                  {schoolProfile.address}, {schoolProfile.district}, {schoolProfile.regency}, {schoolProfile.province} {schoolProfile.postalCode}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-900">Telepon & WhatsApp:</strong>
                <p className="text-stone-600 mt-0.5">
                  Telp: {schoolProfile.phone} <br />
                  WhatsApp SPMB: {schoolProfile.whatsapp}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-900">Email Resmi:</strong>
                <p className="text-stone-600 mt-0.5">{schoolProfile.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-3 border-t border-stone-100">
              <Clock className="w-5 h-5 text-[#D5AA53] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-stone-900">Jam Operasional Layanan:</strong>
                <p className="text-stone-600 mt-0.5">
                  Senin - Jumat: 07.30 - 15.30 WIB <br />
                  Sabtu: 08.00 - 12.00 WIB (Pendaftaran & Observasi)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-8 shadow-xs">
          <h3 className="text-lg font-bold text-stone-900 mb-1">Kirim Pesan / Pertanyaan</h3>
          <p className="text-xs text-stone-600 mb-6">
            Tim humas dan tata usaha sekolah akan membalas pesan Anda sesegera mungkin.
          </p>

          {isSent && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Jazakumullahu khairan. Pesan Anda telah terkirim ke tim sekretariat sekolah.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Nama Lengkap Wali:</label>
                <input
                  type="text"
                  required
                  placeholder="Bapak/Ibu..."
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-[#123B35]"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">No. WhatsApp:</label>
                <input
                  type="tel"
                  required
                  placeholder="081234567890"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-[#123B35]"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">Subjek / Topik:</label>
              <input
                type="text"
                required
                placeholder="Contoh: Pertanyaan seputar pendaftaran kelas 1 atau rute antar jemput"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-[#123B35]"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Isi Pesan:</label>
              <textarea
                rows={4}
                required
                placeholder="Tuliskan pertanyaan Anda secara lengkap..."
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-[#123B35]"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#123B35] hover:bg-[#1a544b] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4 text-[#D5AA53]" />
              <span>Kirim Pesan Sekarang</span>
            </button>
          </form>
        </div>
      </div>

      {/* Interactive Google Maps Frame */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-stone-900 font-serif">Peta Lokasi Sekolah</h3>
        <GoogleMapSection
          lat={schoolProfile.coordinates.lat}
          lng={schoolProfile.coordinates.lng}
          address={schoolProfile.address}
          schoolName={schoolProfile.name}
        />
      </div>
    </div>
  );
};
