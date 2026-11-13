/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Registration,
  SchoolProfile,
  Teacher,
  ProgramUnggulan,
  Extracurricular,
  GalleryItem,
  Achievement,
  NewsItem,
  SpmbWave,
  User,
  ActivityLog,
  SystemSettings,
  RegistrationStatus
} from '../../types';
import { api } from '../../lib/api';
import { AdminSidebar, AdminMenuKey } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

// 20 Modules
import { DashboardStats } from './modules/DashboardStats';
import { RegistrationsList } from './modules/RegistrationsList';
import { DocumentVerification } from './modules/DocumentVerification';
import { StudentDatabase } from './modules/StudentDatabase';
import { SelectionManagement } from './modules/SelectionManagement';
import { SelectionAnnouncement } from './modules/SelectionAnnouncement';
import { ReRegistrationModule } from './modules/ReRegistrationModule';
import { QuotaScheduleSettings } from './modules/QuotaScheduleSettings';
import { SchoolProfileEditor } from './modules/SchoolProfileEditor';
import { TeacherManager } from './modules/TeacherManager';
import { ProgramManager } from './modules/ProgramManager';
import { ExtracurricularManager } from './modules/ExtracurricularManager';
import { GalleryManager } from './modules/GalleryManager';
import { AchievementManager } from './modules/AchievementManager';
import { NewsManager } from './modules/NewsManager';
import { WebsiteSettingsEditor } from './modules/WebsiteSettingsEditor';
import { UserManager } from './modules/UserManager';
import { ReportExportModule } from './modules/ReportExportModule';
import { SystemSettingsModule } from './modules/SystemSettingsModule';
import { ActivityLogsViewer } from './modules/ActivityLogsViewer';
import { MediaLibrary } from './modules/MediaLibrary';
import { BrandingSettings } from './modules/BrandingSettings';
import { WhatsAppGroupSettingsModule } from './modules/WhatsAppGroupSettingsModule';
import { AdminWhatsAppSettingsModule } from './modules/AdminWhatsAppSettingsModule';
import { SpmbStagesSettingsModule } from './modules/SpmbStagesSettingsModule';

interface AdminDashboardProps {
  currentUser: User | null;
  onExitToWebsite: () => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onExitToWebsite,
  onLogout
}) => {
  const [currentMenu, setCurrentMenu] = useState<AdminMenuKey>('stats');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // System states
  const [profile, setProfile] = useState<SchoolProfile | null>(null);
  const [wave, setWave] = useState<SpmbWave | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [programs, setPrograms] = useState<ProgramUnggulan[]>([]);
  const [extracurriculars, setExtracurriculars] = useState<Extracurricular[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  const fetchAllData = async () => {
    try {
      const boot = await api.getBootstrap();
      setProfile(boot.schoolProfile);
      setWave(boot.spmbWave);
      setTeachers(boot.teachers);
      setPrograms(boot.programs);
      setExtracurriculars(boot.extracurriculars);
      setGallery(boot.gallery);
      setAchievements(boot.achievements);
      setNews(boot.news);
      setSettings(boot.settings);

      const [regList, usrList, logs] = await Promise.all([
        api.getRegistrations(),
        api.getUsers(),
        api.getActivityLogs()
      ]);
      setRegistrations(regList);
      setUsers(usrList);
      setActivityLogs(logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleUpdateStatus = async (id: string, status: RegistrationStatus, notes?: string) => {
    await api.updateRegistrationStatus(id, {
      status,
      notes,
      verifiedBy: currentUser?.name || 'Panitia SPMB',
      verifierRole: currentUser?.role || 'panitia_spmb'
    });
    await fetchAllData();
  };

  const handleDeleteRegistration = async (id: string) => {
    await api.deleteRegistration(id);
    await fetchAllData();
  };

  const handleUpdateProfile = async (p: Partial<SchoolProfile>) => {
    const updated = await api.updateProfile(p);
    setProfile(updated);
    await fetchAllData();
  };

  const handleUpdateWave = async (w: Partial<SpmbWave>) => {
    const updated = await api.updateWave(w);
    setWave(updated);
    await fetchAllData();
  };

  const handleUpdateSettings = async (s: Partial<SystemSettings>) => {
    const updated = await api.updateSettings(s);
    setSettings(updated);
    await fetchAllData();
  };

  if (loading || !profile || !wave || !settings) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F7F8F5]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-[#123B35] text-[#D5AA53] flex items-center justify-center font-bold text-lg mx-auto mb-3 animate-pulse">
            IC
          </div>
          <p className="text-xs font-semibold text-stone-700">Memuat Dashboard Manajemen Sekolah...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F7F8F5] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar
          currentMenu={currentMenu}
          onSelectMenu={(k) => setCurrentMenu(k)}
          userRole={currentUser?.role || 'super_admin'}
          onExitToWebsite={onExitToWebsite}
          onLogout={onLogout}
          branding={profile?.branding}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-64">
            <AdminSidebar
              currentMenu={currentMenu}
              onSelectMenu={(k) => {
                setCurrentMenu(k);
                setMobileSidebarOpen(false);
              }}
              userRole={currentUser?.role || 'super_admin'}
              onExitToWebsite={onExitToWebsite}
              onLogout={onLogout}
              branding={profile?.branding}
            />
          </div>
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader
          currentUser={currentUser}
          onRefreshData={fetchAllData}
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          activeMenuTitle={`Modul ${currentMenu.toUpperCase()}`}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {currentMenu === 'stats' && (
            <DashboardStats
              registrations={registrations}
              wave={wave}
              onNavigateToModule={(k) => setCurrentMenu(k)}
            />
          )}

          {currentMenu === 'registrations' && (
            <RegistrationsList
              registrations={registrations}
              schoolProfile={profile}
              onUpdateStatus={handleUpdateStatus}
              onDeleteRegistration={handleDeleteRegistration}
              onRefresh={fetchAllData}
            />
          )}

          {currentMenu === 'verification' && (
            <DocumentVerification
              registrations={registrations}
              onUpdateStatus={handleUpdateStatus}
            />
          )}

          {currentMenu === 'students' && (
            <StudentDatabase registrations={registrations} />
          )}

          {currentMenu === 'selection' && (
            <SelectionManagement
              registrations={registrations}
              onRefresh={fetchAllData}
            />
          )}

          {currentMenu === 'announcements' && (
            <SelectionAnnouncement
              registrations={registrations}
              wave={wave}
              onUpdateWave={handleUpdateWave}
            />
          )}

          {currentMenu === 'reregistration' && (
            <ReRegistrationModule
              registrations={registrations}
              onRefresh={fetchAllData}
              currentUser={currentUser}
            />
          )}

          {currentMenu === 'quota_schedule' && (
            <QuotaScheduleSettings
              wave={wave}
              onUpdateWave={handleUpdateWave}
            />
          )}

          {currentMenu === 'whatsapp_group' && (
            <WhatsAppGroupSettingsModule currentUser={currentUser} />
          )}

          {currentMenu === 'whatsapp_admin' && (
            <AdminWhatsAppSettingsModule currentUser={currentUser} />
          )}

          {currentMenu === 'stages_settings' && (
            <SpmbStagesSettingsModule currentUser={currentUser} />
          )}

          {currentMenu === 'branding' && (
            <BrandingSettings
              onBrandingUpdated={(newBranding) => {
                setProfile(prev => prev ? ({ ...prev, branding: newBranding }) : prev);
              }}
            />
          )}

          {currentMenu === 'media_library' && (
            <MediaLibrary />
          )}

          {currentMenu === 'profile' && (
            <SchoolProfileEditor
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
            />
          )}

          {currentMenu === 'teachers' && (
            <TeacherManager
              teachers={teachers}
              onRefresh={fetchAllData}
            />
          )}

          {currentMenu === 'programs' && (
            <ProgramManager
              programs={programs}
              onRefresh={fetchAllData}
            />
          )}

          {currentMenu === 'extracurriculars' && (
            <ExtracurricularManager
              extracurriculars={extracurriculars}
              onRefresh={fetchAllData}
            />
          )}

          {currentMenu === 'gallery' && (
            <GalleryManager
              gallery={gallery}
              onRefresh={fetchAllData}
            />
          )}

          {currentMenu === 'achievements' && (
            <AchievementManager
              achievements={achievements}
              onRefresh={fetchAllData}
            />
          )}

          {currentMenu === 'news' && (
            <NewsManager
              news={news}
              onRefresh={fetchAllData}
            />
          )}

          {currentMenu === 'web_settings' && (
            <WebsiteSettingsEditor
              profile={profile}
              settings={settings}
              onUpdateProfile={handleUpdateProfile}
              onUpdateSettings={handleUpdateSettings}
            />
          )}

          {currentMenu === 'users' && (
            <UserManager
              users={users}
              onRefresh={fetchAllData}
              currentUser={currentUser}
            />
          )}

          {currentMenu === 'reports' && (
            <ReportExportModule
              registrations={registrations}
              schoolProfile={profile}
              wave={wave}
            />
          )}

          {currentMenu === 'system_settings' && (
            <SystemSettingsModule
              settings={settings}
              onRefresh={fetchAllData}
            />
          )}

          {currentMenu === 'activity_logs' && (
            <ActivityLogsViewer
              logs={activityLogs}
              onRefresh={fetchAllData}
            />
          )}
        </main>
      </div>
    </div>
  );
};
