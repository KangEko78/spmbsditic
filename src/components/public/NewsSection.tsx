/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NewsItem } from '../../types';
import { formatDateId } from '../../lib/utils';
import { Newspaper, ChevronRight, X, Calendar, User, Eye } from 'lucide-react';

interface NewsSectionProps {
  news: NewsItem[];
}

export const NewsSection: React.FC<NewsSectionProps> = ({ news }) => {
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = ['all', 'Berita Sekolah', 'SPMB', 'Kegiatan Siswa', 'Prestasi', 'Artikel Parenting'];

  const filtered = categoryFilter === 'all'
    ? news
    : news.filter(n => n.category === categoryFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-stone-800">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold text-emerald-800 uppercase tracking-widest block">
          Pusat Informasi & Warta
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-serif">
          Berita & Pengumuman Sekolah
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Ikuti perkembangan akademik, pembukaan penerimaan murid baru, dan dokumentasi agenda terpadu.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap justify-center gap-2 text-xs">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCategoryFilter(c)}
            className={`px-4 py-2 rounded-xl font-medium transition-colors cursor-pointer ${
              categoryFilter === c
                ? 'bg-[#123B35] text-white shadow-xs font-bold'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            {c === 'all' ? 'Semua Kategori' : c}
          </button>
        ))}
      </div>

      {/* News Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filtered.map(item => (
          <article
            key={item.id}
            onClick={() => setSelectedNews(item)}
            className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
          >
            <div className="h-48 bg-stone-100 overflow-hidden">
              <img
                src={item.imageUrl || '/src/assets/images/hero_school_building_1793682340462.jpg'}
                alt={item.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-2">
                  <span className="text-emerald-800 font-semibold">{item.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatDateId(item.publishedAt)}</span>
                </div>
                <h3 className="font-bold text-base text-stone-900 leading-snug line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-600 mt-2 line-clamp-3 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#123B35]">
                <span>Baca Selengkapnya</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase text-emerald-800">
                  {selectedNews.category} · {formatDateId(selectedNews.publishedAt)}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mt-1 font-serif">
                  {selectedNews.title}
                </h2>
                <p className="text-xs text-stone-500 mt-1">Ditulis oleh: {selectedNews.author}</p>
              </div>
              <button
                onClick={() => setSelectedNews(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden aspect-16/9 bg-stone-100">
              <img
                src={selectedNews.imageUrl || '/src/assets/images/hero_school_building_1793682340462.jpg'}
                alt={selectedNews.title}
                className="w-full h-full object-cover"
              />
            </div>

            <p className="p-4 bg-[#F7F8F5] rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold italic text-stone-800 leading-relaxed">
              {selectedNews.summary}
            </p>

            <div className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line space-y-2">
              {selectedNews.content}
            </div>

            <div className="pt-4 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setSelectedNews(null)}
                className="px-5 py-2 bg-[#123B35] text-white font-bold rounded-xl text-xs hover:bg-[#1a544b]"
              >
                Tutup Artikel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
