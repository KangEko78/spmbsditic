/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GalleryItem } from '../../types';
import { Lightbox } from '../common/Lightbox';
import { Camera, Eye, Filter } from 'lucide-react';
import { formatDateId } from '../../lib/utils';

interface GallerySectionProps {
  gallery: GalleryItem[];
}

export const GallerySection: React.FC<GallerySectionProps> = ({ gallery }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  const categories = [
    'all',
    'Kegiatan Belajar',
    'Keagamaan',
    'Olahraga',
    'Seni',
    'Ekstrakurikuler',
    'Acara Sekolah'
  ];

  const filtered = selectedCategory === 'all'
    ? gallery
    : gallery.filter(g => g.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-stone-800">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold text-emerald-800 uppercase tracking-widest block">
          Dokumentasi & Memori
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-serif">
          Galeri Kegiatan SDIT Insan Cendikia
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Merekam momen bahagia proses bertumbuh kembang ananda dalam lingkungan sekolah yang aman, asri, dan islami.
        </p>
      </div>

      {/* Category filter tabs */}
      <div className="flex flex-wrap justify-center gap-2 text-xs">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl font-medium transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#123B35] text-white shadow-xs font-bold'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            {cat === 'all' ? 'Semua Album' : cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(item => (
          <div
            key={item.id}
            onClick={() => setLightboxItem(item)}
            className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="relative aspect-4/3 bg-stone-900 overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <span className="p-2.5 rounded-full bg-white/20 backdrop-blur-xs">
                  <Eye className="w-5 h-5" />
                </span>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-1">
                <span className="text-emerald-800 font-semibold">{item.category}</span>
                <span aria-hidden="true">·</span>
                <span>{formatDateId(item.date)}</span>
              </div>
              <h3 className="font-bold text-sm text-stone-900 leading-snug">
                {item.title}
              </h3>
              <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {lightboxItem && (
        <Lightbox
          isOpen={true}
          onClose={() => setLightboxItem(null)}
          imageUrl={lightboxItem.imageUrl}
          title={lightboxItem.title}
          description={lightboxItem.description}
          date={formatDateId(lightboxItem.date)}
        />
      )}
    </div>
  );
};
