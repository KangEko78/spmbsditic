/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, SchoolBranding } from '../../types';
import { api } from '../../lib/api';
import { useModalDismiss } from '../../hooks/useModalDismiss';
import {
  X,
  Lock,
  User as UserIcon,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  KeyRound
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  branding?: SchoolBranding;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  branding
}) => {
  useModalDismiss(isOpen, onClose);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password sub-state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await api.login({
        identifier: identifier.trim(),
        password
      });
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa kembali username/email dan kata sandi Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier) return;
    setForgotLoading(true);
    try {
      const res = await api.forgotPassword(forgotIdentifier.trim());
      setForgotMsg(res.message);
    } catch (err: any) {
      setForgotMsg(err.message || 'Gagal memproses permintaan.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#F7F8F5] rounded-3xl border border-stone-200 max-w-md w-full shadow-2xl text-stone-800 text-xs animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col overflow-hidden my-auto relative">
        
        {/* Top Header with School Identity */}
        <div className="bg-[#123B35] px-6 py-5 text-white relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white font-bold transition-all cursor-pointer shadow-xs focus:ring-2 focus:ring-white"
            title="Tutup (Esc)"
            aria-label="Tutup jendela login"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            {branding?.loginLogoUrl || branding?.mainLogoUrl ? (
              <img
                src={branding.loginLogoUrl || branding.mainLogoUrl}
                alt="Logo Sekolah"
                className="w-12 h-12 object-contain rounded-xl p-1 bg-white border border-stone-200 shadow-xs shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#D5AA53] flex items-center justify-center font-serif font-black text-[#123B35] text-lg shrink-0 shadow-xs">
                IC
              </div>
            )}
            <div>
              <span className="text-[10px] uppercase font-bold text-[#D5AA53] tracking-widest block">
                SDIT Insan Cendikia Kalibaru
              </span>
              <h3 className="text-lg font-bold text-white leading-tight">
                Login Sistem Informasi Sekolah
              </h3>
              <p className="text-[11px] text-stone-300 mt-0.5">
                Silakan masuk menggunakan akun resmi Anda
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Akses Masuk Ditolak</p>
                <p className="mt-0.5 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">
                Username atau Alamat Email:
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Contoh: admin_utama atau admin@sdit-insancendikia.sch.id"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 bg-white font-medium text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#123B35] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block font-semibold text-stone-700">
                  Password:
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-bold text-[#174C80] hover:text-[#123B35] hover:underline cursor-pointer"
                >
                  Lupa Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Masukkan password akun Anda"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 bg-white font-medium text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#123B35] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                  title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-600 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#123B35] focus:ring-[#123B35] border-stone-300 cursor-pointer"
                />
                <span>Ingat sesi masuk di perangkat ini</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#123B35] hover:bg-[#1a544b] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer text-xs flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4 text-[#D5AA53]" />
              <span>{isLoading ? 'Memverifikasi Kredensial...' : 'Masuk ke Dashboard Sistem'}</span>
            </button>
          </form>

          {/* Notice: Internal School Only */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-[11px] text-amber-900 leading-relaxed">
            <span className="font-bold block text-amber-950 mb-0.5">Catatan Hak Akses Petugas:</span>
            Halaman login ini khusus bagi tenaga kependidikan dan panitia SPMB resmi SDIT Insan Cendikia Kalibaru. Gunakan akun yang telah diberikan administrator.
          </div>

          {/* Bottom Close Button */}
          <div className="pt-2 text-center border-t border-stone-200/60">
            <button
              type="button"
              onClick={onClose}
              className="text-stone-500 hover:text-stone-800 font-semibold py-1.5 px-4 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer text-[11px]"
            >
              Tutup Jendela Login
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal Dialog */}
      {showForgotModal && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowForgotModal(false);
          }}
        >
          <div className="bg-white rounded-2xl border border-stone-200 max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-start border-b border-stone-100 pb-2">
              <div>
                <h4 className="font-bold text-sm text-stone-900">Bantuan Lupa Kata Sandi</h4>
                <p className="text-[11px] text-stone-500">Pemulihan akun petugas internal sekolah</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotMsg(null);
                }}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotMsg ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] leading-relaxed flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>{forgotMsg}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotMsg(null);
                  }}
                  className="w-full py-2 bg-[#123B35] text-white font-bold rounded-xl"
                >
                  Kembali ke Halaman Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Masukkan username atau email resmi Anda. Sistem akan memverifikasi akun dan mengirimkan instruksi pemulihan.
                </p>
                <div>
                  <label className="block font-semibold mb-1">Username atau Email:</label>
                  <input
                    type="text"
                    required
                    value={forgotIdentifier}
                    onChange={e => setForgotIdentifier(e.target.value)}
                    placeholder="Contoh: admin_utama atau panitia_spmb"
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-medium text-xs focus:ring-2 focus:ring-[#123B35]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3.5 py-2 border border-stone-300 rounded-xl text-stone-600 hover:bg-stone-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-4 py-2 bg-[#174C80] hover:bg-[#2065AA] text-white font-bold rounded-xl"
                  >
                    {forgotLoading ? 'Memeriksa...' : 'Kirim Instruksi'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
