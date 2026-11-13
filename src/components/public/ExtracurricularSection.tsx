/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Extracurricular } from '../../types';
import { Trophy, Clock, User, Shield, Eye, X, Image as ImageIcon } from 'lucide-react';

interface ExtracurricularSectionProps {
  extracurriculars: Extracurricular[];
}

export const ExtracurricularSection: React.FC<ExtracurricularSectionProps> = ({
  extracurriculars
}) => {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState('');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-stone-800">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold text-emerald-800 uppercase tracking-widest block">
          Minat, Bakat & Kepanduan
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-serif">
          Kegiatan Ekstrakurikuler Siswa
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Mengembangkan ketangkasan jasmani, kecakapan hidup (life skills), jiwa kepemimpinan, dan kecintaan pada seni budaya Islam di SDIT Insan Cendikia Kalibaru.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {extracurriculars.map(ekskul => (
          <div
            key={ekskul.id}
            className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between group"
          >
            {/* Main Image */}
            <div className="h-52 bg-stone-100 overflow-hidden relative cursor-pointer"
              onClick={() => {
                setLightboxUrl(ekskul.imageUrl || '/src/assets/images/extracurricular_activities_1793682342535.jpg');
                setLightboxTitle(ekskul.name);
              }}
            >
              <img
                src={ekskul.imageUrl || '/src/assets/images/extracurricular_activities_1793682342535.jpg'}
                alt={ekskul.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-3 left-3 bg-[#123B35]/90 text-[#D5AA53] text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-xs">
                {ekskul.category}
              </span>
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="px-3 py-1 bg-white/90 text-stone-900 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md">
                  <Eye className="w-3.5 h-3.5" />
                  Lihat Foto
                </span>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-bold text-stone-900 leading-snug">
                  {ekskul.name}
                </h3>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  {ekskul.description}
                </p>

                {/* Additional Documentation Photos */}
                {ekskul.additionalImages && ekskul.additionalImages.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-stone-100">
                    <span className="text-[10px] text-stone-400 font-semibold block mb-1.5 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3 text-[#123B35]" />
                      Dokumentasi Kegiatan ({ekskul.additionalImages.length}):
                    </span>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {ekskul.additionalImages.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`${ekskul.name} - ${idx + 1}`}
                          onClick={() => {
                            setLightboxUrl(img);
                            setLightboxTitle(`${ekskul.name} - Dokumentasi Kegiatan`);
                          }}
                          className="w-14 h-11 object-cover rounded-lg border border-stone-200 cursor-pointer hover:scale-105 transition-transform shrink-0"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                  <span>Pelatih / Pembina: <strong className="text-stone-900">{ekskul.coach}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                  <span>Jadwal: <strong className="text-stone-900">{ekskul.schedule}</strong></span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-4xl max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className="px-4 py-3 bg-stone-900 text-white flex items-center justify-between text-xs">
              <span className="font-semibold">{lightboxTitle}</span>
              <button onClick={() => setLightboxUrl(null)} className="p-1 hover:text-stone-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            <img src={lightboxUrl} alt="Preview" className="max-h-[75vh] w-auto object-contain mx-auto" />
          </div>
        </div>
      )}
    </div>
  );
};
