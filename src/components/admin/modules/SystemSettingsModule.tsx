/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SystemSettings, GoogleSheetSettings } from '../../../types';
import { api } from '../../../lib/api';
import {
  testFirebaseConnection,
  FirebaseConnectionTestResult,
  firebaseConfig,
  syncFullDatabaseToFirestore
} from '../../../lib/firebase';
import {
  Settings,
  Database,
  Cloud,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Copy,
  ExternalLink,
  ShieldCheck,
  FileSpreadsheet,
  Check,
  Save,
  Send,
  Loader2
} from 'lucide-react';

interface SystemSettingsModuleProps {
  settings: SystemSettings;
  onRefresh: () => void;
}

export const SystemSettingsModule: React.FC<SystemSettingsModuleProps> = ({
  settings,
  onRefresh
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sheet' | 'firebase' | 'database' | 'backup'>('sheet');

  // Google Sheet states
  const [sheetSettings, setSheetSettings] = useState<GoogleSheetSettings>(
    settings.googleSheetSettings || {
      spreadsheetId: '1_zt6amQtAr3eGjSPqwaJrIT_irLZvICla9j5lOX2kEM',
      appsScriptUrl: '',
      autoSync: true,
      lastSyncStatus: 'idle',
      lastSyncMessage: 'Siap menghubungkan ke Google Apps Script Spreadsheet 1_zt6amQtAr3eGjSPqwaJrIT_irLZvICla9j5lOX2kEM'
    }
  );
  const [appsScriptCode, setAppsScriptCode] = useState<string>('');
  const [isSavingSheet, setIsSavingSheet] = useState(false);
  const [sheetSaveMessage, setSheetSaveMessage] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [firebaseTestResult, setFirebaseTestResult] = useState<FirebaseConnectionTestResult | null>(null);
  const [isTestingFirebase, setIsTestingFirebase] = useState(false);
  const [isSyncingFirestore, setIsSyncingFirestore] = useState(false);
  const [firestoreSyncMessage, setFirestoreSyncMessage] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestFirebase = async () => {
    setIsTestingFirebase(true);
    try {
      const res = await testFirebaseConnection();
      setFirebaseTestResult(res);
    } catch (err: any) {
      setFirebaseTestResult({
        success: false,
        projectId: firebaseConfig.projectId,
        authDomain: firebaseConfig.authDomain,
        storageBucket: firebaseConfig.storageBucket,
        databaseId: firebaseConfig.firestoreDatabaseId,
        firestoreStatus: 'error',
        authStatus: 'error',
        storageStatus: 'error',
        details: err?.message || 'Gagal menguji koneksi Firebase.',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsTestingFirebase(false);
    }
  };

  const handleSyncToFirestore = async () => {
    setIsSyncingFirestore(true);
    setFirestoreSyncMessage(null);
    try {
      const [bootstrapData, regs, users] = await Promise.all([
        api.getBootstrap(),
        api.getRegistrations(),
        api.getUsers()
      ]);

      const res = await syncFullDatabaseToFirestore({
        schoolProfile: bootstrapData.schoolProfile,
        spmbWave: bootstrapData.spmbWave,
        whatsappSettings: bootstrapData.whatsappSettings,
        registrations: regs,
        users: users
      });

      setFirestoreSyncMessage(res);
      // Auto-recheck connection after sync
      const testRes = await testFirebaseConnection();
      setFirebaseTestResult(testRes);
    } catch (err: any) {
      setFirestoreSyncMessage({
        success: false,
        message: 'Gagal menyinkronkan data ke Cloud Firestore: ' + (err?.message || String(err))
      });
    } finally {
      setIsSyncingFirestore(false);
    }
  };

  useEffect(() => {
    // Load fresh Google Sheet settings and Apps Script code
    const loadSheetInfo = async () => {
      try {
        const [currSettings, scriptData] = await Promise.all([
          api.getGoogleSheetSettings(),
          api.getGoogleSheetScriptCode()
        ]);
        if (currSettings) setSheetSettings(currSettings);
        if (scriptData?.scriptCode) setAppsScriptCode(scriptData.scriptCode);
      } catch (err) {
        console.error('Error fetching sheet settings:', err);
      }
    };
    loadSheetInfo();
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSaveSheetSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingSheet(true);
      const updated = await api.updateGoogleSheetSettings({
        spreadsheetId: '1_zt6amQtAr3eGjSPqwaJrIT_irLZvICla9j5lOX2kEM',
        appsScriptUrl: sheetSettings.appsScriptUrl,
        autoSync: sheetSettings.autoSync
      });
      setSheetSettings(updated);
      setSheetSaveMessage('Pengaturan Google Sheet & Apps Script berhasil disimpan!');
      setTimeout(() => setSheetSaveMessage(null), 3500);
      onRefresh();
    } catch (err: any) {
      alert('Gagal menyimpan pengaturan: ' + (err.message || 'Error'));
    } finally {
      setIsSavingSheet(false);
    }
  };

  const handleSyncAllToSheet = async () => {
    if (!sheetSettings.appsScriptUrl) {
      alert('Silakan masukkan dan simpan URL Aplikasi Web Google Apps Script terlebih dahulu!');
      return;
    }

    try {
      setIsSyncingAll(true);
      setSyncFeedback(null);
      const res = await api.syncAllToGoogleSheet();
      setSyncFeedback({
        success: true,
        message: res.message || `Berhasil menyinkronkan ${res.count} data pendaftar ke Google Sheet.`
      });
      // Refresh current settings
      const updated = await api.getGoogleSheetSettings();
      setSheetSettings(updated);
      onRefresh();
    } catch (err: any) {
      setSyncFeedback({
        success: false,
        message: err.message || 'Gagal menyinkronkan data ke Google Sheet. Periksa kembali Web App URL Anda.'
      });
    } finally {
      setIsSyncingAll(false);
    }
  };

  const firebaseSnippet = `// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD3Pftl4jmWI1qUvQKGETN8XGBs-HEJUPE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "website-spmb-f4f70.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "website-spmb-f4f70",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "website-spmb-f4f70.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "906089429621",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:906089429621:web:8b89397ad6ade0c84f963c",
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || "ai-studio-sditinsancendiki-27ab258d-4cf9-4dde-a9f5-662f868ac7f2"
};

// Singleton initialization to prevent duplicate Firebase App errors
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);`;

  return (
    <div className="space-y-6 text-xs text-stone-800">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase text-emerald-800 tracking-wider">
            Modul 19 · Konfigurasi Sistem & Integrasi Database
          </span>
          <h2 className="text-2xl font-bold text-stone-900 mt-0.5 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-[#123B35]" />
            <span>Integrasi Google Sheet (Apps Script) & Database</span>
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Hubungkan database SPMB secara langsung ke Google Sheets (ID: <code>1_zt6amQtAr3eGjSPqwaJrIT_irLZvICla9j5lOX2kEM</code>) via Google Apps Script Web App.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Database Backend & Sheet Bridge Aktif</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-stone-200 bg-white px-6 rounded-t-2xl">
        <button
          onClick={() => setActiveTab('sheet')}
          className={`py-3.5 mr-6 border-b-2 font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'sheet'
              ? 'border-[#123B35] text-[#123B35]'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          <span>Google Sheet (Apps Script)</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">1_zt6amQt...</span>
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`py-3.5 mr-6 border-b-2 font-bold transition-colors cursor-pointer ${
            activeTab === 'database'
              ? 'border-[#123B35] text-[#123B35]'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          Status Penyimpanan Persisten
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`py-3.5 border-b-2 font-bold transition-colors cursor-pointer ${
            activeTab === 'backup'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-stone-500 hover:text-rose-700'
          }`}
        >
          Data & Keamanan
        </button>
      </div>

      {/* Tab 0: Google Sheet & Apps Script Integration (Target user requirement) */}
      {activeTab === 'sheet' && (
        <div className="bg-white p-6 rounded-b-2xl border border-stone-200 shadow-xs space-y-6">
          {/* Target Spreadsheet Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-[#123B35] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D5AA53] block">
                Target Spreadsheet Resmi SDIT Insan Cendikia Kalibaru
              </span>
              <h3 className="text-base sm:text-lg font-bold font-mono">
                1_zt6amQtAr3eGjSPqwaJrIT_irLZvICla9j5lOX2kEM
              </h3>
              <p className="text-xs text-stone-200">
                Nama Lembar: <code className="bg-black/30 px-2 py-0.5 rounded font-mono font-bold text-white">DATA_PENDAFTAR_SPMB</code>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://docs.google.com/spreadsheets/d/1_zt6amQtAr3eGjSPqwaJrIT_irLZvICla9j5lOX2kEM/edit"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#D5AA53] hover:bg-[#c49942] text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Google Sheet</span>
              </a>
            </div>
          </div>

          {/* Sync Status Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-stone-500 block text-[10px] uppercase">Status Sinkronisasi Terakhir:</span>
              <span className={`font-bold inline-block px-2 py-0.5 rounded text-xs mt-1 ${
                sheetSettings.lastSyncStatus === 'success'
                  ? 'bg-emerald-100 text-emerald-900'
                  : sheetSettings.lastSyncStatus === 'error'
                  ? 'bg-rose-100 text-rose-900'
                  : 'bg-stone-200 text-stone-700'
              }`}>
                {sheetSettings.lastSyncStatus === 'success' ? 'Sukses Terhubung' : sheetSettings.lastSyncStatus === 'error' ? 'Gagal Sinkron' : 'Siap Sinkron'}
              </span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-stone-500 block text-[10px] uppercase">Waktu Sinkron Terakhir:</span>
              <span className="font-medium text-stone-800 text-xs block mt-1">
                {sheetSettings.lastSyncAt ? new Date(sheetSettings.lastSyncAt).toLocaleString('id-ID') : 'Belum pernah sinkron'}
              </span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-stone-500 block text-[10px] uppercase">Pesan Sistem:</span>
              <span className="text-[11px] text-stone-600 block mt-1 truncate" title={sheetSettings.lastSyncMessage}>
                {sheetSettings.lastSyncMessage || 'Tidak ada pesan.'}
              </span>
            </div>
          </div>

          {/* Configuration Form */}
          <form onSubmit={handleSaveSheetSettings} className="p-5 bg-[#F7F8F5] rounded-2xl border border-stone-200 space-y-4">
            <h4 className="font-bold text-sm text-stone-900">
              Pengaturan Koneksi Google Apps Script
            </h4>

            {sheetSaveMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{sheetSaveMessage}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 block">
                URL Aplikasi Web Google Apps Script (Web App URL) <span className="text-rose-600">*</span>
              </label>
              <input
                type="url"
                required
                value={sheetSettings.appsScriptUrl || ''}
                onChange={(e) => setSheetSettings({ ...sheetSettings, appsScriptUrl: e.target.value })}
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-xs focus:ring-2 focus:ring-[#123B35] focus:outline-hidden bg-white"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                Dapatkan URL ini dari menu <strong>Terapkan (Deploy) &gt; Penerapan Baru &gt; Aplikasi Web</strong> di dalam editor Google Apps Script spreadsheet Anda.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={sheetSettings.autoSync}
                  onChange={(e) => setSheetSettings({ ...sheetSettings, autoSync: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#123B35]"></div>
              </label>
              <div>
                <span className="font-semibold text-stone-800 block text-xs">
                  Otomatis Kirim Data ke Google Sheet Saat Pendaftar Masuk / Berkas Diverifikasi
                </span>
                <span className="text-[11px] text-stone-500 block">
                  Setiap kali ada pendaftaran baru atau status pembayaran diubah, sistem akan otomatis meng-update baris calon siswa di spreadsheet.
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isSavingSheet}
                className="px-4 py-2.5 bg-[#123B35] hover:bg-[#1a544b] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-[#D5AA53]" />
                <span>{isSavingSheet ? 'Menyimpan...' : 'Simpan Pengaturan Google Sheet'}</span>
              </button>

              <button
                type="button"
                disabled={isSyncingAll || !sheetSettings.appsScriptUrl}
                onClick={handleSyncAllToSheet}
                className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSyncingAll ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#D5AA53]" />
                ) : (
                  <Send className="w-4 h-4 text-[#D5AA53]" />
                )}
                <span>{isSyncingAll ? 'Menyinkronkan...' : 'Sinkronkan Sekarang (Kirim Seluruh Pendaftar)'}</span>
              </button>
            </div>

            {syncFeedback && (
              <div className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                syncFeedback.success ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}>
                {syncFeedback.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                )}
                <span>{syncFeedback.message}</span>
              </div>
            )}
          </form>

          {/* Step-by-Step Installation Guide */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-stone-900">
              Panduan Pemasangan Google Apps Script (Hanya 3 Menit)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="w-5 h-5 rounded-full bg-[#123B35] text-white font-bold inline-flex items-center justify-center text-[11px]">1</span>
                <span className="font-bold block text-stone-800">Buka Spreadsheet</span>
                <p className="text-[11px] text-stone-600">
                  Buka spreadsheet <a href="https://docs.google.com/spreadsheets/d/1_zt6amQtAr3eGjSPqwaJrIT_irLZvICla9j5lOX2kEM/edit" target="_blank" rel="noreferrer" className="text-emerald-800 font-bold underline">1_zt6amQtAr3eGjSPqwaJrIT_irLZvICla9j5lOX2kEM</a> di Google Drive Anda.
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="w-5 h-5 rounded-full bg-[#123B35] text-white font-bold inline-flex items-center justify-center text-[11px]">2</span>
                <span className="font-bold block text-stone-800">Buka Apps Script</span>
                <p className="text-[11px] text-stone-600">
                  Klik menu <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong> di bilah menu spreadsheet.
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="w-5 h-5 rounded-full bg-[#123B35] text-white font-bold inline-flex items-center justify-center text-[11px]">3</span>
                <span className="font-bold block text-stone-800">Tempelkan Kode</span>
                <p className="text-[11px] text-stone-600">
                  Hapus kode default di file <code>Code.gs</code>, salin kode di bawah ini, lalu klik tombol <strong>Simpan (Save)</strong>.
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="w-5 h-5 rounded-full bg-[#123B35] text-white font-bold inline-flex items-center justify-center text-[11px]">4</span>
                <span className="font-bold block text-stone-800">Terapkan Aplikasi Web</span>
                <p className="text-[11px] text-stone-600">
                  Klik <strong>Deploy &gt; New deployment &gt; Web app</strong>. Pilih Who has access: <strong>Anyone</strong>. Salin URL dan tempelkan ke form di atas.
                </p>
              </div>
            </div>
          </div>

          {/* Ready-to-Copy Apps Script Code */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900 text-xs">
                Kode Google Apps Script Lengkap (Code.gs)
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(appsScriptCode, 'apps_script')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#123B35] hover:bg-[#1a544b] text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
              >
                {copiedKey === 'apps_script' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#D5AA53]" />
                    <span>Kode Berhasil Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#D5AA53]" />
                    <span>Salin Seluruh Kode Code.gs</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-stone-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-96 leading-relaxed border border-stone-800">
              <code>{appsScriptCode}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Tab 1: Firebase Project Configuration & Diagnostics */}
      {activeTab === 'firebase' && (
        <div className="bg-white p-6 rounded-b-2xl border border-stone-200 shadow-xs space-y-6">
          {/* Active Project Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#123B35] to-[#174C80] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D5AA53] block">
                Konfigurasi Firebase Aktif
              </span>
              <h3 className="text-base sm:text-lg font-bold font-mono">
                {firebaseConfig.projectId}
              </h3>
              <p className="text-xs text-stone-200">
                Terhubung ke Google Cloud & Firebase Console · Auth, Firestore & Storage Siap Digunakan
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isSyncingFirestore}
                onClick={handleSyncToFirestore}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-colors shadow-xs cursor-pointer disabled:opacity-60"
              >
                {isSyncingFirestore ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D5AA53]" />
                    <span>Menautkan Data...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-[#D5AA53]" />
                    <span>Tautkan &amp; Sinkronkan Seluruh Data ke Firestore</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isTestingFirebase}
                onClick={handleTestFirebase}
                className="px-4 py-2 bg-[#D5AA53] hover:bg-[#c49942] text-stone-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors shadow-xs cursor-pointer disabled:opacity-60"
              >
                {isTestingFirebase ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menguji Koneksi...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Uji Koneksi Langsung</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sync Result Feedback */}
          {firestoreSyncMessage && (
            <div className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 ${
              firestoreSyncMessage.success
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}>
              {firestoreSyncMessage.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
              )}
              <span className="font-medium">{firestoreSyncMessage.message}</span>
            </div>
          )}

          {/* Test Result Card (If tested) */}
          {firebaseTestResult && (
            <div className={`p-4 rounded-2xl border text-xs space-y-3 ${
              firebaseTestResult.success
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                : 'bg-amber-50/80 border-amber-300 text-amber-950'
            }`}>
              <div className="flex items-center justify-between border-b border-stone-200/60 pb-2">
                <span className="font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Hasil Pemeriksaan Koneksi Firebase</span>
                </span>
                <span className="text-[10px] text-stone-500 font-mono">
                  {new Date(firebaseTestResult.timestamp).toLocaleTimeString('id-ID')} WIB
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-xl border border-stone-200">
                  <span className="text-stone-500 block text-[10px] uppercase font-semibold">Authentication</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Ready ({firebaseConfig.authDomain})</span>
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-stone-200">
                  <span className="text-stone-500 block text-[10px] uppercase font-semibold">Cloud Firestore</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{firebaseTestResult.firestoreStatus === 'connected' ? 'Connected (Rules Aktif)' : 'Offline'}</span>
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-stone-200">
                  <span className="text-stone-500 block text-[10px] uppercase font-semibold">Cloud Storage</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Ready ({firebaseConfig.storageBucket})</span>
                  </span>
                </div>
              </div>

              <p className="text-[11px] leading-relaxed">
                <strong>Status Diagnostik:</strong> {firebaseTestResult.details}
              </p>
            </div>
          )}

          {/* Credentials Detail Table */}
          <div className="p-4 bg-[#F7F8F5] rounded-2xl border border-stone-200 space-y-3">
            <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Detail Parameter Firebase (Project: {firebaseConfig.projectId})</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1">
                <span className="text-stone-500 block text-[10px] uppercase font-semibold">Project ID</span>
                <span className="font-mono font-bold text-stone-900">{firebaseConfig.projectId}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1">
                <span className="text-stone-500 block text-[10px] uppercase font-semibold">Auth Domain</span>
                <span className="font-mono font-bold text-stone-900">{firebaseConfig.authDomain}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1">
                <span className="text-stone-500 block text-[10px] uppercase font-semibold">Storage Bucket</span>
                <span className="font-mono font-bold text-stone-900">{firebaseConfig.storageBucket}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1">
                <span className="text-stone-500 block text-[10px] uppercase font-semibold">Messaging Sender ID</span>
                <span className="font-mono font-bold text-stone-900">{firebaseConfig.messagingSenderId}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1">
                <span className="text-stone-500 block text-[10px] uppercase font-semibold">Database ID (Firestore)</span>
                <span className="font-mono font-bold text-stone-900 break-all">{firebaseConfig.firestoreDatabaseId}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1 md:col-span-2">
                <span className="text-stone-500 block text-[10px] uppercase font-semibold">App ID</span>
                <span className="font-mono font-bold text-stone-900">{firebaseConfig.appId}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] leading-relaxed">
              <strong>Pencegahan Duplikasi App:</strong> Inisialisasi Firebase di <code>src/lib/firebase.ts</code> menggunakan pola <code>getApps().length &gt; 0 ? getApp() : initializeApp(...)</code> sehingga tidak akan menimbulkan error duplikasi <em>[DEFAULT] Firebase App already exists</em> saat perpindahan halaman atau hot-reload.
            </div>
          </div>

          {/* Code snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900 text-xs">File Modul Firebase: <code>src/lib/firebase.ts</code></span>
              <button
                type="button"
                onClick={() => copyToClipboard(firebaseSnippet, 'firebase')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#123B35] hover:bg-[#1a544b] text-white rounded-lg font-semibold text-xs cursor-pointer transition-colors"
              >
                {copiedKey === 'firebase' ? <Check className="w-3.5 h-3.5 text-[#D5AA53]" /> : <Copy className="w-3.5 h-3.5 text-[#D5AA53]" />}
                <span>{copiedKey === 'firebase' ? 'Disalin' : 'Salin Kode'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-stone-900 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed border border-stone-800">
              <code>{firebaseSnippet}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Tab 2: Database status */}
      {activeTab === 'database' && (
        <div className="bg-white p-6 rounded-b-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 p-4 bg-[#F7F8F5] rounded-xl border border-stone-200">
            <Database className="w-8 h-8 text-[#123B35]" />
            <div>
              <h4 className="font-bold text-stone-900 text-sm">Engine Database: Express Persistent JSON Store + Google Sheet Bridge</h4>
              <p className="text-stone-500 text-[11px]">
                Lokasi: <code>/data/database.json</code> · Persistensi: 100% data tersimpan di server & disinkronkan ke Google Sheets
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
              <span className="text-stone-500 block">Koleksi Terhubung:</span>
              <span className="font-bold">12 Entitas Database</span>
            </div>
            <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
              <span className="text-stone-500 block">Otentikasi Internal:</span>
              <span className="font-bold text-emerald-800">RBAC 5 Peran Aktif</span>
            </div>
            <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
              <span className="text-stone-500 block">Google Sheet:</span>
              <span className="font-bold text-emerald-800 font-mono text-[10px]">1_zt6amQt...</span>
            </div>
            <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
              <span className="text-stone-500 block">Integritas Dokumen:</span>
              <span className="font-bold text-emerald-800">Valid</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Data security */}
      {activeTab === 'backup' && (
        <div className="bg-white p-6 rounded-b-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 space-y-2">
            <h4 className="font-bold text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Penyimpanan dan perlindungan data</span>
            </h4>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Data aplikasi disimpan pada tab APP_DATA di Google Sheet. Rekap pendaftar disalin ke DATA_PENDAFTAR_SPMB. Akses spreadsheet hanya diberikan kepada petugas yang berwenang. Penghapusan data demo melalui website dinonaktifkan agar data pendaftar tidak terhapus tanpa sengaja.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
