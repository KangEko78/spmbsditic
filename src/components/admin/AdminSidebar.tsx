/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserRole, SchoolBranding } from '../../types';
import {
  LayoutDashboard,
  Users,
  FileCheck2,
  GraduationCap,
  Award,
  BellRing,
  CheckCircle,
  CalendarDays,
  Building2,
  BookOpen,
  Sparkles,
  Camera,
  Trophy,
  Newspaper,
  Globe,
  ShieldAlert,
  FileSpreadsheet,
  Settings,
  History,
  LogOut,
  ExternalLink,
  ChevronRight,
  Palette,
  Image as ImageIcon,
  FolderOpen,
  MessageSquare,
  MessageCircle,
  Layers
} from 'lucide-react';

export type AdminMenuKey =
  | 'stats'
  | 'registrations'
  | 'verification'
  | 'students'
  | 'selection'
  | 'announcements'
  | 'reregistration'
  | 'quota_schedule'
  | 'whatsapp_group'
  | 'whatsapp_admin'
  | 'stages_settings'
  | 'profile'
  | 'branding'
  | 'media_library'
  | 'teachers'
  | 'programs'
  | 'extracurriculars'
  | 'gallery'
  | 'achievements'
  | 'news'
  | 'web_settings'
  | 'users'
  | 'reports'
  | 'system_settings'
  | 'activity_logs';

interface AdminSidebarProps {
  currentMenu: AdminMenuKey;
  onSelectMenu: (menu: AdminMenuKey) => void;
  userRole: UserRole;
  onExitToWebsite: () => void;
  onLogout: () => void;
  collapsed?: boolean;
  branding?: SchoolBranding;
}

interface MenuItemDef {
  key: AdminMenuKey;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
  group: 'spmb' | 'school' | 'system';
}

const MENU_ITEMS: MenuItemDef[] = [
  // Group SPMB
  { key: 'stats', label: '1. Ringkasan Statistik', icon: LayoutDashboard, roles: ['super_admin', 'admin_sekolah', 'panitia_spmb', 'tim_seleksi', 'kepala_sekolah'], group: 'spmb' },
  { key: 'registrations', label: '2. Data Pendaftar', icon: Users, roles: ['super_admin', 'panitia_spmb', 'kepala_sekolah'], group: 'spmb' },
  { key: 'verification', label: '3. Verifikasi Berkas', icon: FileCheck2, roles: ['super_admin', 'panitia_spmb'], group: 'spmb' },
  { key: 'students', label: '4. Data Calon Murid', icon: GraduationCap, roles: ['super_admin', 'panitia_spmb', 'tim_seleksi', 'kepala_sekolah'], group: 'spmb' },
  { key: 'selection', label: '5. Seleksi & Penilaian', icon: Award, roles: ['super_admin', 'tim_seleksi', 'kepala_sekolah'], group: 'spmb' },
  { key: 'announcements', label: '6. Pengumuman Kelulusan', icon: BellRing, roles: ['super_admin', 'tim_seleksi', 'panitia_spmb'], group: 'spmb' },
  { key: 'reregistration', label: '7. Daftar Ulang', icon: CheckCircle, roles: ['super_admin', 'panitia_spmb'], group: 'spmb' },
  { key: 'quota_schedule', label: '8. Kuota & Gelombang 1-2', icon: CalendarDays, roles: ['super_admin', 'panitia_spmb'], group: 'spmb' },
  { key: 'whatsapp_group', label: '8b. Grup WhatsApp SPMB', icon: MessageSquare, roles: ['super_admin'], group: 'spmb' },
  { key: 'whatsapp_admin', label: '8c. WhatsApp Admin (Observasi & Biaya)', icon: MessageCircle, roles: ['super_admin'], group: 'spmb' },
  { key: 'stages_settings', label: '8d. Pengaturan Alur SPMB', icon: Layers, roles: ['super_admin'], group: 'spmb' },

  // Group Konten Sekolah & Website
  { key: 'branding', label: '9. Identitas & Branding', icon: Palette, roles: ['super_admin', 'admin_sekolah'], group: 'school' },
  { key: 'media_library', label: '10. Media & Dokumentasi', icon: ImageIcon, roles: ['super_admin', 'admin_sekolah'], group: 'school' },
  { key: 'profile', label: '11. Profil & Lokasi Sekolah', icon: Building2, roles: ['super_admin', 'admin_sekolah'], group: 'school' },
  { key: 'teachers', label: '12. Data Guru & Staf', icon: BookOpen, roles: ['super_admin', 'admin_sekolah'], group: 'school' },
  { key: 'programs', label: '13. Program Unggulan', icon: Sparkles, roles: ['super_admin', 'admin_sekolah'], group: 'school' },
  { key: 'extracurriculars', label: '14. Ekstrakurikuler', icon: Trophy, roles: ['super_admin', 'admin_sekolah'], group: 'school' },
  { key: 'gallery', label: '15. Galeri Kegiatan', icon: Camera, roles: ['super_admin', 'admin_sekolah'], group: 'school' },
  { key: 'achievements', label: '16. Prestasi Siswa', icon: Award, roles: ['super_admin', 'admin_sekolah'], group: 'school' },
  { key: 'news', label: '17. Berita & Pengumuman', icon: Newspaper, roles: ['super_admin', 'admin_sekolah'], group: 'school' },
  { key: 'web_settings', label: '18. Pengaturan Halaman Web', icon: Globe, roles: ['super_admin', 'admin_sekolah'], group: 'school' },

  // Group Sistem & Laporan
  { key: 'users', label: '19. Manajemen Pengguna', icon: ShieldAlert, roles: ['super_admin'], group: 'system' },
  { key: 'reports', label: '20. Laporan & Ekspor Data', icon: FileSpreadsheet, roles: ['super_admin', 'panitia_spmb', 'kepala_sekolah'], group: 'system' },
  { key: 'system_settings', label: '21. Database & Google Sheet', icon: FileSpreadsheet, roles: ['super_admin'], group: 'system' },
  { key: 'activity_logs', label: '22. Log Aktivitas Sistem', icon: History, roles: ['super_admin', 'kepala_sekolah'], group: 'system' },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentMenu,
  onSelectMenu,
  userRole,
  onExitToWebsite,
  onLogout,
  branding
}) => {
  const allowedItems = MENU_ITEMS.filter(item => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-[#123B35] text-stone-200 flex flex-col h-screen shrink-0 border-r border-[#1a544b]">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#1b544b] flex items-center gap-3">
        {branding?.mainLogoUrl ? (
          <img
            src={branding.mainLogoUrl}
            alt="Logo Sekolah"
            className="w-9 h-9 object-contain rounded-lg bg-white p-1 shrink-0 shadow-xs"
          />
        ) : (
          <div className="w-9 h-9 rounded-lg bg-[#D5AA53] flex items-center justify-center font-bold text-[#123B35] shrink-0 text-sm">
            IC
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider truncate">
            SDIT Insan Cendikia
          </h2>
          <p className="text-[10px] text-[#D5AA53] tracking-wide font-medium">
            Sistem Informasi & SPMB
          </p>
        </div>
      </div>

      {/* Navigation Menu List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6 text-xs">
        {/* SPMB Group */}
        <div>
          <span className="text-[10px] uppercase font-bold text-[#D5AA53]/80 tracking-wider px-2 block mb-1">
            Modul SPMB Online
          </span>
          <div className="space-y-0.5">
            {allowedItems
              .filter(i => i.group === 'spmb')
              .map(item => {
                const Icon = item.icon;
                const active = currentMenu === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => onSelectMenu(item.key)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#174C80] text-white font-semibold shadow-xs'
                        : 'text-stone-300 hover:bg-[#1a544b] hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#D5AA53]' : 'text-stone-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Content Group */}
        <div>
          <span className="text-[10px] uppercase font-bold text-[#D5AA53]/80 tracking-wider px-2 block mb-1">
            Profil & CMS Sekolah
          </span>
          <div className="space-y-0.5">
            {allowedItems
              .filter(i => i.group === 'school')
              .map(item => {
                const Icon = item.icon;
                const active = currentMenu === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => onSelectMenu(item.key)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#174C80] text-white font-semibold shadow-xs'
                        : 'text-stone-300 hover:bg-[#1a544b] hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#D5AA53]' : 'text-stone-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* System Group */}
        <div>
          <span className="text-[10px] uppercase font-bold text-[#D5AA53]/80 tracking-wider px-2 block mb-1">
            Administrasi & Sistem
          </span>
          <div className="space-y-0.5">
            {allowedItems
              .filter(i => i.group === 'system')
              .map(item => {
                const Icon = item.icon;
                const active = currentMenu === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => onSelectMenu(item.key)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#174C80] text-white font-semibold shadow-xs'
                        : 'text-stone-300 hover:bg-[#1a544b] hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#D5AA53]' : 'text-stone-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-[#1b544b] space-y-1 bg-[#0e302b]">
        <button
          onClick={onExitToWebsite}
          className="w-full px-2.5 py-2 rounded-lg flex items-center justify-between text-xs text-stone-300 hover:text-white hover:bg-[#1a544b] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-[#D5AA53]" />
            <span>Lihat Website Publik</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
        </button>

        <button
          onClick={onLogout}
          className="w-full px-2.5 py-2 rounded-lg flex items-center gap-2 text-xs text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Keluar (Logout)</span>
        </button>
      </div>
    </aside>
  );
};
