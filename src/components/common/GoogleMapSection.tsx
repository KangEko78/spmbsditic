/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MapPin, Navigation, ExternalLink, Info } from 'lucide-react';

interface GoogleMapSectionProps {
  lat?: number;
  lng?: number;
  address?: string;
  schoolName?: string;
  showAdminNote?: boolean;
}

export const GoogleMapSection: React.FC<GoogleMapSectionProps> = ({
  lat = -8.2871,
  lng = 113.9758,
  address = 'Jl. Pahlawan, Kalibaru Kulon, Kecamatan Kalibaru, Kabupaten Banyuwangi, Jawa Timur 68467',
  schoolName = 'SDIT INSAN CENDIKIA KALIBARU',
  showAdminNote = true
}) => {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat}%2C${lng}`;
  const searchUrl = `https://www.google.com/maps/search/?api=1&query=${lat}%2C${lng}`;
  // Standard Google Maps embed iframe without requiring proprietary API key
  const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&hl=id&z=16&output=embed`;

  return (
    <div className="w-full bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
      <div className="p-6 md:p-8 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>Lokasi Sekolah & Peta Interaktif</span>
          </div>
          <h3 className="text-xl font-bold text-stone-900">{schoolName}</h3>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl">{address}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#123B35] hover:bg-[#1a544b] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            <Navigation className="w-4 h-4 text-[#D5AA53]" />
            <span>Buka Petunjuk Arah</span>
          </a>
          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors border border-stone-200"
          >
            <ExternalLink className="w-4 h-4 text-stone-500" />
            <span>Buka di Google Maps</span>
          </a>
        </div>
      </div>

      {/* Map Embed Frame */}
      <div className="relative w-full h-80 md:h-96 bg-stone-100">
        <iframe
          title={`Peta Lokasi ${schoolName}`}
          src={embedUrl}
          className="w-full h-full border-0"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
        
        {/* Float Pin Info Overlay */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs p-3.5 rounded-xl border border-stone-200/80 shadow-md text-xs max-w-xs hidden sm:block">
          <p className="font-semibold text-stone-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
             SDIT Insan Cendikia
          </p>
          <p className="text-stone-600 mt-1 text-[11px] leading-relaxed">
            Jl. Pahlawan, Kalibaru Kulon, Banyuwangi (Sekitar 500m dari Stasiun Kalibaru).
          </p>
          <p className="text-stone-400 mt-1 font-mono text-[10px]">
            Koordinat: {lat.toFixed(4)}, {lng.toFixed(4)}
          </p>
        </div>
      </div>

      {showAdminNote && (
        <div className="px-6 py-3 bg-[#F7F8F5] border-t border-stone-200 text-xs text-stone-600 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Catatan Petugas:</strong> Titik koordinat perkiraan ({lat}, {lng}) dapat disesuaikan dan dikoreksi sewaktu-waktu melalui Dashboard Admin jika posisi pin memerlukan presisi lanjutan.
          </span>
        </div>
      )}
    </div>
  );
};
