/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RegistrationStatus } from '../types';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDateId(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function formatDateTimeId(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function getStatusBadge(status: RegistrationStatus): {
  bg: string;
  text: string;
  border: string;
  label: string;
} {
  switch (status) {
    case 'Draft':
      return {
        bg: 'bg-stone-100',
        text: 'text-stone-700',
        border: 'border-stone-300',
        label: 'Draft Formulir'
      };
    case 'Menunggu Verifikasi':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        label: 'Menunggu Verifikasi Berkas'
      };
    case 'Perlu Perbaikan':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-800',
        border: 'border-rose-200',
        label: 'Perlu Perbaikan Berkas'
      };
    case 'Terverifikasi':
      return {
        bg: 'bg-sky-50',
        text: 'text-sky-800',
        border: 'border-sky-200',
        label: 'Berkas Terverifikasi'
      };
    case 'Dalam Seleksi':
      return {
        bg: 'bg-indigo-50',
        text: 'text-indigo-800',
        border: 'border-indigo-200',
        label: 'Dalam Proses Seleksi'
      };
    case 'Diterima':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
        label: 'Diterima (Lulus Seleksi)'
      };
    case 'Tidak Diterima':
      return {
        bg: 'bg-zinc-100',
        text: 'text-zinc-700',
        border: 'border-zinc-300',
        label: 'Tidak Lolos'
      };
    case 'Menunggu Daftar Ulang':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-300',
        label: 'Menunggu Daftar Ulang'
      };
    case 'Selesai Daftar Ulang':
    case 'Daftar Ulang':
      return {
        bg: 'bg-teal-50',
        text: 'text-teal-800',
        border: 'border-teal-300',
        label: 'Selesai Daftar Ulang'
      };
    default:
      return {
        bg: 'bg-stone-50',
        text: 'text-stone-700',
        border: 'border-stone-200',
        label: status
      };
  }
}

export function getRoleLabel(role: string): string {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'admin_sekolah':
      return 'Admin Sekolah';
    case 'panitia_spmb':
      return 'Panitia SPMB';
    case 'tim_seleksi':
      return 'Tim Seleksi';
    case 'kepala_sekolah':
      return 'Kepala Sekolah';
    case 'wali_murid':
      return 'Wali Murid';
    default:
      return role;
  }
}

export function getStatusBadgeClass(status: RegistrationStatus): string {
  const b = getStatusBadge(status);
  return `${b.bg} ${b.text} ${b.border} border`;
}
