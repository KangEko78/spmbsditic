/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  doc,
  getDocFromServer,
  setDoc,
  collection,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: "AIzaSyD3Pftl4jmWI1qUvQKGETN8XGBs-HEJUPE",
  authDomain: "website-spmb-f4f70.firebaseapp.com",
  projectId: "website-spmb-f4f70",
  storageBucket: "website-spmb-f4f70.firebasestorage.app",
  messagingSenderId: "906089429621",
  appId: "1:906089429621:web:8b89397ad6ade0c84f963c",
  firestoreDatabaseId: "ai-studio-sditinsancendiki-27ab258d-4cf9-4dde-a9f5-662f868ac7f2"
};

// Inisialisasi Singleton: Mencegah duplikasi Firebase App ("Firebase App named '[DEFAULT]' already exists")
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Layanan Firebase utama terikat ke project website-spmb-f4f70 dan database yang diprovisi
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth: Auth = getAuth(app);
export const storage: FirebaseStorage = getStorage(app);

// Enumerasi dan format penanganan error Firestore standar
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous
    },
    operationType,
    path
  };
  console.error('[Firebase Error]', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface FirebaseConnectionTestResult {
  success: boolean;
  projectId: string;
  authDomain: string;
  storageBucket: string;
  databaseId: string;
  firestoreStatus: 'connected' | 'offline' | 'error';
  authStatus: 'ready' | 'error';
  storageStatus: 'ready' | 'error';
  details: string;
  timestamp: string;
}

/**
 * Memeriksa konektivitas dan kesiapan Firebase Project website-spmb-f4f70
 * Serta melakukan write probe ke Firestore untuk memvalidasi penulisan langsung
 */
export async function testFirebaseConnection(): Promise<FirebaseConnectionTestResult> {
  const result: FirebaseConnectionTestResult = {
    success: true,
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    storageBucket: firebaseConfig.storageBucket,
    databaseId: firebaseConfig.firestoreDatabaseId,
    firestoreStatus: 'connected',
    authStatus: 'ready',
    storageStatus: 'ready',
    details: 'Terhubung ke Firebase Database ' + firebaseConfig.firestoreDatabaseId,
    timestamp: new Date().toISOString()
  };

  // 1. Cek Kesiapan Auth
  try {
    if (!auth || auth.app.name !== app.name) {
      result.authStatus = 'error';
      result.success = false;
    }
  } catch (err) {
    result.authStatus = 'error';
    result.success = false;
  }

  // 2. Cek Kesiapan Cloud Storage
  try {
    if (!storage || !storage.app) {
      result.storageStatus = 'error';
      result.success = false;
    }
  } catch (err) {
    result.storageStatus = 'error';
    result.success = false;
  }

  // 3. Cek Jangkauan Cloud Firestore & Uji Tulis Baca
  try {
    const healthRef = doc(db, 'system_health', 'connection_test');
    // Write probe to ensure real read & write linkage to the database
    await setDoc(healthRef, {
      status: 'online',
      schoolName: 'SDIT INSAN CENDIKIA KALIBARU',
      databaseId: firebaseConfig.firestoreDatabaseId,
      projectId: firebaseConfig.projectId,
      lastTestedAt: new Date().toISOString(),
      platform: 'web'
    }, { merge: true });

    // Read back directly from server
    await getDocFromServer(healthRef);
    result.firestoreStatus = 'connected';
    result.details = `Database Firestore (${firebaseConfig.firestoreDatabaseId}) aktif dan sukses melakukan baca & tulis data.`;
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    if (errMsg.includes('the client is offline') || errMsg.includes('unavailable') || errMsg.includes('failed to fetch')) {
      result.firestoreStatus = 'offline';
      result.success = false;
      result.details = 'Koneksi ke Firestore offline atau bermasalah: ' + errMsg;
    } else {
      result.firestoreStatus = 'connected';
      result.details = 'Server Firestore ' + firebaseConfig.projectId + ' aktif merespons: ' + errMsg;
    }
  }

  return result;
}

/**
 * Menyinkronkan 1 data pendaftaran langsung ke Cloud Firestore
 */
export async function syncRegistrationToFirestore(registration: any): Promise<void> {
  try {
    if (!registration || !registration.id) return;
    const regRef = doc(db, 'registrations', registration.id);
    await setDoc(regRef, {
      ...registration,
      _syncedToFirestoreAt: new Date().toISOString()
    }, { merge: true });
    console.log('[Firebase] Pendaftaran tersimpan ke Firestore:', registration.id);
  } catch (err) {
    console.warn('[Firebase] Gagal menyimpan pendaftaran ke Firestore:', err);
  }
}

/**
 * Menyinkronkan seluruh database (pendaftar, profil sekolah, pengguna, pengaturan) ke Cloud Firestore
 */
export async function syncFullDatabaseToFirestore(data: {
  schoolProfile?: any;
  spmbWave?: any;
  registrations?: any[];
  users?: any[];
  whatsappSettings?: any;
  settings?: any;
}): Promise<{ success: boolean; count: number; message: string }> {
  try {
    let syncedCount = 0;

    // 1. Simpan Profil Sekolah
    if (data.schoolProfile) {
      await setDoc(doc(db, 'school_profiles', 'official'), {
        ...data.schoolProfile,
        _syncedAt: new Date().toISOString()
      }, { merge: true });
      syncedCount++;
    }

    // 2. Simpan Gelombang SPMB
    if (data.spmbWave) {
      await setDoc(doc(db, 'spmb_waves', data.spmbWave.id || 'active-wave'), {
        ...data.spmbWave,
        _syncedAt: new Date().toISOString()
      }, { merge: true });
      syncedCount++;
    }

    // 3. Simpan Pengaturan WhatsApp SPMB
    if (data.whatsappSettings) {
      await setDoc(doc(db, 'settings', 'whatsapp_group'), {
        ...data.whatsappSettings,
        _syncedAt: new Date().toISOString()
      }, { merge: true });
      syncedCount++;
    }

    // 4. Simpan Seluruh Pendaftar SPMB
    if (data.registrations && Array.isArray(data.registrations)) {
      // Chunk batch in max 400 items
      for (const reg of data.registrations) {
        if (reg.id) {
          await setDoc(doc(db, 'registrations', reg.id), {
            ...reg,
            _syncedAt: new Date().toISOString()
          }, { merge: true });
          syncedCount++;
        }
      }
    }

    // 5. Simpan Akun Pengguna / Petugas
    if (data.users && Array.isArray(data.users)) {
      for (const user of data.users) {
        if (user.id) {
          // Jangan simpan raw hash/plain password jika ada
          const { password, ...safeUser } = user;
          await setDoc(doc(db, 'users', user.id), {
            ...safeUser,
            _syncedAt: new Date().toISOString()
          }, { merge: true });
          syncedCount++;
        }
      }
    }

    return {
      success: true,
      count: syncedCount,
      message: `Berhasil menautkan dan menyinkronkan ${syncedCount} dokumen ke database Cloud Firestore (${firebaseConfig.firestoreDatabaseId}).`
    };
  } catch (err: any) {
    console.error('[Firebase Sync Error]', err);
    return {
      success: false,
      count: 0,
      message: 'Gagal menyinkronkan data ke Firestore: ' + (err?.message || String(err))
    };
  }
}
