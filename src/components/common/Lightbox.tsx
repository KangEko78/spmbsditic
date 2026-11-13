/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
  description?: string;
  date?: string;
}

export const Lightbox: React.FC<LightboxProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  description,
  date
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs transition-opacity animate-fade-in">
      <button
        onClick={onClose}
        aria-label="Tutup pratinjau foto"
        className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
      >
        <X className="w-6 h-6" />
      </button>

      <div 
        className="max-w-4xl w-full max-h-[90vh] flex flex-col items-center bg-stone-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full flex-1 min-h-[300px] max-h-[70vh] flex items-center justify-center bg-black/50 p-2">
          <img
            src={imageUrl}
            alt={title || 'Pratinjau Foto'}
            referrerPolicy="no-referrer"
            className="max-h-[68vh] w-auto max-w-full object-contain rounded-lg"
          />
        </div>

        {(title || description || date) && (
          <div className="w-full p-4 bg-stone-900/95 border-t border-white/10 text-stone-200">
            {date && <p className="text-xs text-[#D5AA53] font-medium mb-1">{date}</p>}
            {title && <h4 className="text-base font-semibold text-white">{title}</h4>}
            {description && <p className="text-sm text-stone-400 mt-1">{description}</p>}
          </div>
        )}
      </div>
    </div>
  );
};
