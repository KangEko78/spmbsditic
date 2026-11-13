/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  SchoolProfile,
  ProgramUnggulan,
  Extracurricular,
  GalleryItem,
  Achievement,
  NewsItem,
  SpmbWave,
  SystemSettings
} from './types';
import { api, BootstrapData } from './lib/api';

// Layout & Common
import { Navbar, PublicPage } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LoginModal } from './components/auth/LoginModal';
import { PrivacyPolicyModal } from './components/public/PrivacyPolicyModal';

// Public Pages
import { HomeSection } from './components/public/HomeSection';
import { ProfileSection } from './components/public/ProfileSection';
import { ProgramsSection } from './components/public/ProgramsSection';
import { ExtracurricularSection } from './components/public/ExtracurricularSection';
import { GallerySection } from './components/public/GallerySection';
import { AchievementsSection } from './components/public/AchievementsSection';
import { NewsSection } from './components/public/NewsSection';
import { SpmbSection } from './components/public/SpmbSection';
import { ContactSection } from './components/public/ContactSection';
import { CheckStatusSection } from './components/public/CheckStatusSection';

// SPMB Wizard
import { RegistrationWizard } from './components/spmb/RegistrationWizard';

// Admin Dashboard (20 Modules)
import { AdminDashboard } from './components/admin/AdminDashboard';

export default function App() {
  const [viewMode, setViewMode] = useState<'public' | 'admin'>('public');
  const [currentPage, setCurrentPage] = useState<PublicPage>('beranda');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [bootstrap, setBootstrap] = useState<BootstrapData | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [activeNewsModal, setActiveNewsModal] = useState<NewsItem | null>(null);

  // Load initial data
  const loadData = async () => {
    try {
      const data = await api.getBootstrap();
      setBootstrap(data);
      const signedInUser = await api.getCurrentUser();
      if (signedInUser) {
        setCurrentUser(signedInUser);
        setViewMode('admin');
      }

    } catch (err) {
      console.error('Failed to bootstrap applet:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    if (currentUser) {
      void api.logout(currentUser.id, currentUser.name, currentUser.role);
    }
    setCurrentUser(null);
    setViewMode('public');
    setCurrentPage('beranda');
  };

  const openAdmin = () => {
    if (currentUser) setViewMode('admin');
    else setIsLoginModalOpen(true);
  };

  if (loading || !bootstrap) {
    return (
      <div className="min-h-screen bg-[#F7F8F5] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#123B35] text-[#D5AA53] flex items-center justify-center font-bold text-xl mx-auto shadow-md animate-pulse">
            IC
          </div>
          <h2 className="text-base font-bold text-[#123B35]">
            SDIT INSAN CENDIKIA KALIBARU
          </h2>
          <p className="text-xs text-stone-500">
            Menyiapkan Sistem Informasi & SPMB Terpadu...
          </p>
        </div>
      </div>
    );
  }

  // Admin Dashboard Mode
  if (viewMode === 'admin') {
    return (
      <AdminDashboard
        currentUser={currentUser}
        onExitToWebsite={() => setViewMode('public')}
        onLogout={handleLogout}
      />
    );
  }

  // Public Website Mode
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F5]">
      {/* Top Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={(p) => {
          setCurrentPage(p);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onGoToDashboard={openAdmin}
        onLogout={handleLogout}
        schoolProfile={bootstrap.schoolProfile}
      />

      {/* Main Content View */}
      <main className="flex-1">
        {currentPage === 'beranda' && (
          <HomeSection
            schoolProfile={bootstrap.schoolProfile}
            programs={bootstrap.programs}
            extracurriculars={bootstrap.extracurriculars}
            gallery={bootstrap.gallery}
            achievements={bootstrap.achievements}
            news={bootstrap.news}
            wave={bootstrap.spmbWave}
            onNavigate={(p) => {
              setCurrentPage(p);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenNewsDetail={(n) => setActiveNewsModal(n)}
          />
        )}

        {currentPage === 'profil' && (
          <ProfileSection
            schoolProfile={bootstrap.schoolProfile}
            teachers={bootstrap.teachers}
          />
        )}

        {currentPage === 'program' && (
          <ProgramsSection
            programs={bootstrap.programs}
            onStartRegistration={() => {
              setCurrentPage('wizard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentPage === 'ekstrakurikuler' && (
          <ExtracurricularSection
            extracurriculars={bootstrap.extracurriculars}
          />
        )}

        {currentPage === 'galeri' && (
          <GallerySection
            gallery={bootstrap.gallery}
          />
        )}

        {currentPage === 'prestasi' && (
          <AchievementsSection
            achievements={bootstrap.achievements}
          />
        )}

        {currentPage === 'berita' && (
          <NewsSection
            news={bootstrap.news}
          />
        )}

        {currentPage === 'spmb' && (
          <SpmbSection
            wave={bootstrap.spmbWave}
            schoolProfile={bootstrap.schoolProfile}
            onStartRegistration={() => {
              setCurrentPage('wizard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onGoToPortal={() => {
              setCurrentPage('cek-status');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentPage === 'cek-status' && (
          <CheckStatusSection
            onNavigate={(p) => {
              setCurrentPage(p);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
          />
        )}

        {currentPage === 'kontak' && (
          <ContactSection
            schoolProfile={bootstrap.schoolProfile}
          />
        )}

        {currentPage === 'wizard' && (
          <RegistrationWizard
            schoolProfile={bootstrap.schoolProfile}
            onExit={() => {
              setCurrentPage('beranda');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToCheckStatus={() => {
              setCurrentPage('cek-status');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Fallback for legacy portal URL to Cek Status */}
        {currentPage === 'portal' && (
          <CheckStatusSection
            onNavigate={(p) => {
              setCurrentPage(p);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
          />
        )}
      </main>

      {/* Institutional Footer */}
      <Footer
        schoolProfile={bootstrap.schoolProfile}
        onNavigate={(p) => {
          setCurrentPage(p);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
        onGoToDashboard={openAdmin}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        branding={bootstrap.schoolProfile.branding}
        onLoginSuccess={(u) => {
          setCurrentUser(u);
          setViewMode('admin');
        }}
      />

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
}
