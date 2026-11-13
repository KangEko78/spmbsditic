/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { User, UserRole } from '../../../types';
import { api } from '../../../lib/api';
import { getRoleLabel, formatDateId } from '../../../lib/utils';
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Lock,
  UserCheck,
  UserX,
  AlertCircle,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  Upload,
  Camera,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  ShieldAlert,
  Send,
  Phone,
  Mail,
  User as UserIcon
} from 'lucide-react';

interface UserManagerProps {
  users: User[];
  onRefresh: () => void;
  currentUser?: User | null;
}

export const UserManager: React.FC<UserManagerProps> = ({ users, onRefresh, currentUser }) => {
  // Main form modal (Tambah Akun & Edit Akun Petugas)
  const [editingUser, setEditingUser] = useState<(Partial<User> & { password?: string; confirmPassword?: string }) | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showEditConfirmPassword, setShowEditConfirmPassword] = useState(false);
  const [isSavingPasswordOnly, setIsSavingPasswordOnly] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dedicated "Ubah Password" Modal
  const [changePasswordUser, setChangePasswordUser] = useState<User | null>(null);
  const [changeNewPassword, setChangeNewPassword] = useState('');
  const [changeConfirmPassword, setChangeConfirmPassword] = useState('');
  const [showChangeNewPassword, setShowChangeNewPassword] = useState(false);
  const [showChangeConfirmPassword, setShowChangeConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);

  // Quick "Reset Password" Confirmation Modal
  const [resetPromptUser, setResetPromptUser] = useState<User | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // One-time Temporary Password Credential Modal
  const [tempPasswordCredential, setTempPasswordCredential] = useState<{
    type: 'tambah' | 'ubah' | 'reset';
    name: string;
    username: string;
    temporaryPassword: string;
  } | null>(null);

  // Notification Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const isSuperAdmin = !currentUser || currentUser.role === 'super_admin';

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const generateSecurePassword = () => {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghjkmnpqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$';
    const all = uppercase + lowercase + numbers + symbols;

    let res = 'SDIT-';
    // Ensure at least 1 uppercase, 1 lowercase, 1 number, 1 symbol
    res += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    res += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    res += numbers.charAt(Math.floor(Math.random() * numbers.length));
    res += symbols.charAt(Math.floor(Math.random() * symbols.length));
    for (let i = 0; i < 2; i++) {
      res += all.charAt(Math.floor(Math.random() * all.length));
    }
    return res;
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2500);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  // Save Full Form (Tambah / Edit Akun Petugas)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isSuperAdmin) {
      setErrorMsg('Hanya Super Admin yang berwenang mengelola akun petugas.');
      return;
    }

    if (!editingUser?.email?.trim() || !editingUser?.name?.trim() || !editingUser?.username?.trim()) {
      setErrorMsg('Nama lengkap, username, dan email wajib diisi.');
      return;
    }

    const isCreating = !editingUser.id;

    // Validate password for new user
    if (isCreating) {
      if (!editingUser.password || editingUser.password.trim().length < 10) {
        setErrorMsg('Password akun baru wajib diisi minimal 10 karakter.');
        return;
      }
      if (editingUser.password !== editingUser.confirmPassword) {
        setErrorMsg('Konfirmasi password tidak cocok dengan password akun.');
        return;
      }
    } else {
      // If editing and password is provided, validate confirmation
      if (editingUser.password && editingUser.password.trim().length > 0) {
        if (editingUser.password.trim().length < 10) {
          setErrorMsg('Password baru minimal harus 10 karakter.');
          return;
        }
        if (editingUser.password !== editingUser.confirmPassword) {
          setErrorMsg('Konfirmasi password baru tidak cocok.');
          return;
        }
      }
    }

    setIsSaving(true);
    try {
      const res = await api.saveUser({
        ...editingUser,
        role: editingUser.role || 'panitia_spmb',
        isActive: editingUser.isActive ?? true
      });

      const savedName = editingUser.name || 'Petugas';
      const savedUsername = editingUser.username || '';
      const appliedPassword = editingUser.password ? editingUser.password.trim() : res.temporaryPassword;

      setEditingUser(null);
      onRefresh();

      if (appliedPassword && appliedPassword.length >= 10) {
        setTempPasswordCredential({
          type: isCreating ? 'tambah' : 'ubah',
          name: savedName,
          username: savedUsername,
          temporaryPassword: appliedPassword
        });
      }

      showToast('success', isCreating ? 'Akun petugas baru berhasil dibuat!' : 'Data akun petugas berhasil diperbarui!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan data akun petugas.');
    } finally {
      setIsSaving(false);
    }
  };

  // Dedicated "Simpan Perubahan Password" inside Edit Modal
  const handleSavePasswordOnlyInEdit = async () => {
    if (!editingUser || !editingUser.id) return;
    setErrorMsg(null);

    if (!editingUser.password || editingUser.password.trim().length < 10) {
      setErrorMsg('Password baru minimal harus 10 karakter.');
      return;
    }

    if (editingUser.password !== editingUser.confirmPassword) {
      setErrorMsg('Konfirmasi password baru tidak cocok dengan password baru.');
      return;
    }

    setIsSavingPasswordOnly(true);
    try {
      const cleanPass = editingUser.password.trim();
      await api.changeUserPassword(editingUser.id, cleanPass, currentUser?.name || 'Super Admin');

      const savedName = editingUser.name || 'Petugas';
      const savedUsername = editingUser.username || '';

      // Reset password inputs in editingUser
      setEditingUser(prev => prev ? { ...prev, password: '', confirmPassword: '' } : null);
      onRefresh();

      // Show temporary credential modal
      setTempPasswordCredential({
        type: 'ubah',
        name: savedName,
        username: savedUsername,
        temporaryPassword: cleanPass
      });

      showToast('success', `Password akun @${savedUsername} berhasil diubah.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memperbarui password.');
    } finally {
      setIsSavingPasswordOnly(false);
    }
  };

  // Dedicated "Ubah Password" modal submission
  const handleExecuteChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changePasswordUser) return;
    setChangePasswordError(null);

    if (changeNewPassword.trim().length < 10) {
      setChangePasswordError('Password baru minimal 10 karakter demi keamanan akun.');
      return;
    }

    if (changeNewPassword !== changeConfirmPassword) {
      setChangePasswordError('Konfirmasi password tidak cocok dengan password baru.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const cleanPass = changeNewPassword.trim();
      await api.changeUserPassword(changePasswordUser.id, cleanPass, currentUser?.name || 'Super Admin');

      const targetName = changePasswordUser.name;
      const targetUsername = changePasswordUser.username;

      setChangePasswordUser(null);
      setChangeNewPassword('');
      setChangeConfirmPassword('');
      onRefresh();

      setTempPasswordCredential({
        type: 'ubah',
        name: targetName,
        username: targetUsername,
        temporaryPassword: cleanPass
      });

      showToast('success', `Kata sandi akun @${targetUsername} berhasil diperbarui.`);
    } catch (err: any) {
      setChangePasswordError(err.message || 'Gagal mengubah password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Quick "Reset Password" execution
  const handleExecuteQuickReset = async () => {
    if (!resetPromptUser) return;
    setIsResetting(true);
    try {
      const autoPass = generateSecurePassword();
      await api.resetUserPassword(resetPromptUser.id, autoPass, currentUser?.name || 'Super Admin');

      const targetName = resetPromptUser.name;
      const targetUsername = resetPromptUser.username;

      setResetPromptUser(null);
      onRefresh();

      setTempPasswordCredential({
        type: 'reset',
        name: targetName,
        username: targetUsername,
        temporaryPassword: autoPass
      });

      showToast('success', `Password akun @${targetUsername} berhasil direset.`);
    } catch (err: any) {
      showToast('error', err.message || 'Gagal mereset password.');
      setResetPromptUser(null);
    } finally {
      setIsResetting(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    if (user.role === 'super_admin' && user.username === 'admin_utama') {
      alert('Akun Super Admin Utama tidak dapat dinonaktifkan.');
      return;
    }
    const targetStatus = !user.isActive;
    const confirmMsg = targetStatus
      ? `Aktifkan kembali akun ${user.name}?`
      : `Nonaktifkan akun ${user.name}? Pengguna ini tidak akan bisa login ke dashboard.`;

    if (confirm(confirmMsg)) {
      try {
        await api.toggleUserStatus(user.id, targetStatus);
        onRefresh();
        showToast('success', `Status akun ${user.name} diubah menjadi ${targetStatus ? 'AKTIF' : 'NONAKTIF'}.`);
      } catch (err: any) {
        showToast('error', err.message || 'Gagal memperbarui status akun.');
      }
    }
  };

  const handleDelete = async (user: User) => {
    if (user.role === 'super_admin') {
      alert('Akun Super Admin tidak dapat dihapus demi keamanan sistem.');
      return;
    }
    if (confirm(`Hapus permanen akun "${user.name}" (${user.username})? Tindakan ini tidak dapat dibatalkan.`)) {
      try {
        await api.deleteUser(user.id);
        onRefresh();
        showToast('success', `Akun @${user.username} berhasil dihapus.`);
      } catch (err: any) {
        showToast('error', err.message || 'Gagal menghapus akun.');
      }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setPhotoUploadError('Ukuran file foto maksimal 3MB.');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      setPhotoUploadError('Format file harus berupa JPG, PNG, atau WEBP.');
      return;
    }

    setPhotoUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setEditingUser(prev => prev ? { ...prev, avatarUrl: reader.result as string } : null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setEditingUser(prev => prev ? { ...prev, avatarUrl: '' } : null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 text-xs text-stone-800">
      {/* Toast Feedback */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-2xl shadow-xl border flex items-center gap-2.5 max-w-md animate-in slide-in-from-top-4 duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-800 text-white border-emerald-700'
              : 'bg-rose-800 text-white border-rose-700'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />
          )}
          <span className="text-xs font-semibold">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-auto text-white/80 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase text-emerald-800 tracking-wider">
            Modul 19 · Manajemen Pengguna Internal (RBAC)
          </span>
          <h2 className="text-2xl font-bold text-stone-900 mt-0.5 font-serif">
            Pengelolaan Akun & Password Petugas
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Super Admin berwenang membuat akun, mengubah password, dan mereset kata sandi petugas internal secara terenkripsi dan aman.
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={() => {
              setErrorMsg(null);
              setPhotoUploadError(null);
              setShowEditPassword(false);
              setShowEditConfirmPassword(false);
              setEditingUser({
                name: '',
                username: '',
                email: '',
                role: 'panitia_spmb',
                jabatan: 'Anggota Panitia SPMB',
                phone: '',
                isActive: true,
                password: '',
                confirmPassword: ''
              });
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#123B35] hover:bg-[#1a544b] text-white font-semibold rounded-xl shadow-xs cursor-pointer transition-colors min-h-[44px]"
          >
            <Plus className="w-4 h-4 text-[#D5AA53]" />
            <span>Tambah Akun Petugas</span>
          </button>
        )}
      </div>

      {/* Users Table (Desktop & Tablet) */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8F5] border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Nama Petugas</th>
                <th className="py-3.5 px-4">Username</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Jabatan & Role</th>
                <th className="py-3.5 px-4 text-center">Status Akun</th>
                <th className="py-3.5 px-4 text-center">Pengelolaan Password</th>
                <th className="py-3.5 px-4 text-right">Aksi Akun</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-stone-50 transition-colors">
                  {/* Nama */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover border border-stone-200"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#123B35] text-white font-bold flex items-center justify-center text-xs">
                          {u.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-stone-900 block">{u.name}</span>
                        {u.phone && (
                          <span className="text-[11px] text-stone-500 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-stone-400" />
                            <span>{u.phone}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Username */}
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-1 bg-stone-100 border border-stone-200 rounded-md font-mono text-[11px] font-bold text-stone-800">
                      @{u.username || u.email.split('@')[0]}
                    </span>
                  </td>

                  {/* Email */}
                  <td className="py-3.5 px-4">
                    <span className="text-stone-700 font-mono text-[11px] block">{u.email}</span>
                  </td>

                  {/* Jabatan & Role */}
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-stone-800 block text-[11px]">{u.jabatan || '-'}</span>
                    <span className={`px-2 py-0.5 rounded-full font-semibold text-[9px] inline-block mt-0.5 ${
                      u.role === 'super_admin'
                        ? 'bg-purple-100 text-purple-800'
                        : u.role === 'admin_sekolah'
                        ? 'bg-blue-100 text-blue-800'
                        : u.role === 'panitia_spmb'
                        ? 'bg-amber-100 text-amber-800'
                        : u.role === 'tim_seleksi'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {getRoleLabel(u.role)}
                    </span>
                  </td>

                  {/* Status Akun */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                        u.isActive !== false
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                      title="Klik untuk mengubah status aktif / nonaktif"
                    >
                      {u.isActive !== false ? (
                        <>
                          <UserCheck className="w-3 h-3 text-emerald-700" />
                          <span>Aktif</span>
                        </>
                      ) : (
                        <>
                          <UserX className="w-3 h-3 text-rose-700" />
                          <span>Nonaktif</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Tombol Ubah Password & Reset Password */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1.5 flex-wrap justify-center">
                      {/* Tombol Ubah Password */}
                      <button
                        type="button"
                        onClick={() => {
                          setChangePasswordUser(u);
                          setChangeNewPassword('');
                          setChangeConfirmPassword('');
                          setShowChangeNewPassword(false);
                          setShowChangeConfirmPassword(false);
                          setChangePasswordError(null);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#174C80] hover:bg-[#2065AA] text-white rounded-lg font-semibold text-[11px] shadow-2xs transition-colors cursor-pointer"
                        title="Buka form untuk mengubah password akun petugas ini"
                      >
                        <Key className="w-3 h-3 text-[#D5AA53]" />
                        <span>Ubah Password</span>
                      </button>

                      {/* Tombol Reset Password */}
                      <button
                        type="button"
                        onClick={() => {
                          setResetPromptUser(u);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-[11px] shadow-2xs transition-colors cursor-pointer"
                        title="Reset password ke password sementara baru secara instan"
                      >
                        <RotateCcw className="w-3 h-3 text-amber-200" />
                        <span>Reset Password</span>
                      </button>
                    </div>
                  </td>

                  {/* Aksi Akun (Edit & Hapus) */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setErrorMsg(null);
                          setPhotoUploadError(null);
                          setShowEditPassword(false);
                          setShowEditConfirmPassword(false);
                          setEditingUser({
                            ...u,
                            password: '',
                            confirmPassword: ''
                          });
                        }}
                        className="p-1.5 text-stone-600 hover:text-emerald-800 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Data Lengkap Akun"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {u.role !== 'super_admin' && (
                        <button
                          onClick={() => handleDelete(u)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Akun Petugas"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: TAMBAH AKUN & EDIT AKUN PETUGAS (NON-TRUNCATED, STICKY HEADER & CLOSE) */}
      {/* ========================================================================= */}
      {editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingUser(null);
          }}
        >
          <div className="bg-white rounded-3xl border border-stone-200 max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Sticky Header with Close Button Always Visible */}
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-white shrink-0 sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#123B35] text-white flex items-center justify-center font-bold">
                  {editingUser.id ? <Edit2 className="w-4 h-4 text-[#D5AA53]" /> : <Plus className="w-5 h-5 text-[#D5AA53]" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-stone-900 font-serif">
                    {editingUser.id ? 'Edit Akun Petugas' : 'Tambah Akun Petugas Baru'}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    {editingUser.id ? `Perbarui profil dan kata sandi @${editingUser.username || ''}` : 'Daftarkan akun resmi untuk petugas sekolah'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Tutup Modal"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Data Profil */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-stone-800 mb-1 text-xs">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ahmad Faisal, S.Pd"
                    value={editingUser.name || ''}
                    onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-medium text-xs focus:ring-2 focus:ring-[#123B35] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1 text-xs">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="username_petugas"
                    value={editingUser.username || ''}
                    onChange={e => setEditingUser({ ...editingUser, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-mono text-xs focus:ring-2 focus:ring-[#123B35] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-stone-800 mb-1 text-xs">
                    Alamat Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="petugas@sdit.sch.id"
                    value={editingUser.email || ''}
                    onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-mono text-xs focus:ring-2 focus:ring-[#123B35] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1 text-xs">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={editingUser.phone || ''}
                    onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-mono text-xs focus:ring-2 focus:ring-[#123B35] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-stone-800 mb-1 text-xs">
                    Jabatan / Bagian
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Waka Kesiswaan / Panitia SPMB"
                    value={editingUser.jabatan || ''}
                    onChange={e => setEditingUser({ ...editingUser, jabatan: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#123B35] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1 text-xs">
                    Peran Akses (Role)
                  </label>
                  <select
                    value={editingUser.role || 'panitia_spmb'}
                    onChange={e => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-medium text-xs focus:ring-2 focus:ring-[#123B35] focus:outline-hidden"
                  >
                    <option value="super_admin">Super Admin (Akses Penuh Seluruh Sistem)</option>
                    <option value="admin_sekolah">Admin Sekolah (CMS Konten, Berita & Guru)</option>
                    <option value="panitia_spmb">Panitia SPMB (Verifikasi Dokumen & Kuota)</option>
                    <option value="tim_seleksi">Tim Seleksi (Observasi & Penilaian)</option>
                    <option value="kepala_sekolah">Kepala Sekolah (Laporan & Monitoring)</option>
                  </select>
                </div>
              </div>

              {/* Foto Profil / Avatar */}
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <label className="block font-bold text-stone-900 text-xs">
                  Foto Profil / Avatar Petugas
                </label>

                {photoUploadError && (
                  <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{photoUploadError}</span>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    {editingUser.avatarUrl ? (
                      <img
                        src={editingUser.avatarUrl}
                        alt="Pratinjau Foto"
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-600 shadow-xs"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-stone-200 border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400">
                        <Camera className="w-5 h-5 mb-0.5" />
                        <span className="text-[9px] font-bold">Tanpa Foto</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-[#123B35] hover:bg-[#1a544b] text-white rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#D5AA53]" />
                        <span>{editingUser.avatarUrl ? 'Ganti Foto' : 'Pilih Foto'}</span>
                      </button>

                      {editingUser.avatarUrl && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Foto</span>
                        </button>
                      )}
                    </div>

                    <p className="text-[10px] text-stone-500 leading-tight">
                      Pilih file gambar langsung dari perangkat Anda (JPG, PNG, atau WEBP maks 3MB).
                    </p>
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* BAGIAN PASSWORD AKUN (WAJIB & LENGKAP SESUAI SPESIFIKASI PROMPT) */}
              {/* ========================================================================= */}
              <div className="p-4 bg-linear-to-b from-[#F7F8F5] to-stone-100 rounded-2xl border-2 border-[#123B35]/20 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-[#D5AA53]" />
                    <span className="font-bold text-stone-900 text-xs sm:text-sm">
                      Pengaturan Password Akun
                    </span>
                  </div>

                  {/* Tombol Buat Password Otomatis */}
                  <button
                    type="button"
                    onClick={() => {
                      const auto = generateSecurePassword();
                      setEditingUser({
                        ...editingUser,
                        password: auto,
                        confirmPassword: auto
                      });
                      setShowEditPassword(true);
                      setShowEditConfirmPassword(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg font-bold text-[11px] shadow-2xs transition-colors cursor-pointer"
                    title="Buat kombinasi password acak yang aman dan kuat secara otomatis"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#D5AA53]" />
                    <span>Buat Password Otomatis</span>
                  </button>
                </div>

                <p className="text-[11px] text-stone-600 leading-relaxed">
                  {editingUser.id
                    ? 'Kosongkan kolom password jika Anda tidak ingin mengubah password akun ini. Password lama tetap tersimpan aman dan terenkripsi.'
                    : 'Tentukan password untuk login awal petugas. Password wajib minimal 10 karakter.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Kolom Password Baru */}
                  <div>
                    <label className="block font-medium text-stone-800 mb-1 text-[11px]">
                      {editingUser.id ? 'Password Baru:' : 'Password Akun Login:'}{' '}
                      {!editingUser.id && <span className="text-rose-500">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        type={showEditPassword ? 'text' : 'password'}
                        placeholder={editingUser.id ? 'Kosongkan jika tidak diubah' : 'Minimal 10 karakter'}
                        value={editingUser.password || ''}
                        onChange={e => setEditingUser({ ...editingUser, password: e.target.value })}
                        className="w-full p-2.5 pr-10 rounded-xl border border-stone-300 bg-white font-mono text-xs focus:ring-2 focus:ring-[#123B35] focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPassword(!showEditPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer p-1"
                        title={showEditPassword ? 'Sembunyikan password' : 'Lihat password'}
                      >
                        {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Kolom Konfirmasi Password */}
                  <div>
                    <label className="block font-medium text-stone-800 mb-1 text-[11px]">
                      Konfirmasi Password:{' '}
                      {(!editingUser.id || Boolean(editingUser.password)) && <span className="text-rose-500">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        type={showEditConfirmPassword ? 'text' : 'password'}
                        placeholder={editingUser.id ? 'Ketik ulang password baru' : 'Ketik ulang password'}
                        value={editingUser.confirmPassword || ''}
                        onChange={e => setEditingUser({ ...editingUser, confirmPassword: e.target.value })}
                        className={`w-full p-2.5 pr-10 rounded-xl border bg-white font-mono text-xs focus:ring-2 focus:ring-[#123B35] focus:outline-hidden ${
                          editingUser.password && editingUser.confirmPassword && editingUser.password !== editingUser.confirmPassword
                            ? 'border-rose-400 bg-rose-50/40'
                            : 'border-stone-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditConfirmPassword(!showEditConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer p-1"
                        title={showEditConfirmPassword ? 'Sembunyikan password' : 'Lihat password'}
                      >
                        {showEditConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Match Indicator */}
                {editingUser.password && (
                  <div className="text-[11px] flex items-center justify-between pt-1">
                    {editingUser.password === editingUser.confirmPassword ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Password dan konfirmasi cocok</span>
                      </span>
                    ) : (
                      <span className="text-rose-600 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Konfirmasi password belum cocok</span>
                      </span>
                    )}

                    {/* Tombol Simpan Perubahan Password Khusus (Untuk Modal Edit) */}
                    {editingUser.id && editingUser.password.trim().length >= 10 && (
                      <button
                        type="button"
                        disabled={isSavingPasswordOnly || editingUser.password !== editingUser.confirmPassword}
                        onClick={handleSavePasswordOnlyInEdit}
                        className="px-3 py-1 bg-[#174C80] hover:bg-[#2065AA] text-white rounded-lg font-bold text-[11px] shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                        title="Simpan langsung hanya perubahan password akun ini"
                      >
                        {isSavingPasswordOnly ? 'Menyimpan Password...' : 'Simpan Perubahan Password'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Status Keaktifan Akun */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-stone-900 block text-xs">Status Keaktifan Akun</span>
                  <span className="text-[11px] text-stone-500">
                    {editingUser.isActive !== false ? 'Akun aktif dan diizinkan login ke sistem.' : 'Akun nonaktif dan diblokir dari login.'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingUser.isActive !== false}
                    onChange={e => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#123B35]"></div>
                </label>
              </div>

              {/* Sticky Footer Buttons inside form */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-200 bg-white sticky bottom-0">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 border border-stone-300 rounded-xl text-stone-600 hover:bg-stone-50 font-semibold cursor-pointer text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#123B35] hover:bg-[#1a544b] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer text-xs flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? 'Menyimpan...' : editingUser.id ? 'Simpan Perubahan Akun' : 'Buat Akun Petugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DEDICATED "UBAH PASSWORD" MODAL (DIPANGGIL DARI TOMBOL TABEL) */}
      {/* ========================================================================= */}
      {changePasswordUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setChangePasswordUser(null);
          }}
        >
          <div className="bg-white rounded-3xl border border-stone-200 max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Sticky Header */}
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-white shrink-0 sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#174C80] text-white flex items-center justify-center font-bold">
                  <Key className="w-4 h-4 text-[#D5AA53]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-stone-900 font-serif">
                    Ubah Password Petugas
                  </h3>
                  <p className="text-[11px] text-stone-500 font-mono">
                    @{changePasswordUser.username} · {changePasswordUser.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChangePasswordUser(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleExecuteChangePassword} className="p-6 space-y-4 overflow-y-auto">
              {changePasswordError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{changePasswordError}</span>
                </div>
              )}

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600 space-y-1">
                <p>Nama: <strong>{changePasswordUser.name}</strong></p>
                <p>Email: <span className="font-mono">{changePasswordUser.email}</span></p>
                <p>Jabatan: <strong>{changePasswordUser.jabatan || '-'}</strong></p>
                <p className="text-amber-800 font-semibold pt-1">
                  * Password lama tidak perlu diketahui. Password baru akan langsung aktif dan terenkripsi aman.
                </p>
              </div>

              {/* Tombol Buat Password Otomatis */}
              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-stone-800 text-xs">Password Baru:</span>
                <button
                  type="button"
                  onClick={() => {
                    const auto = generateSecurePassword();
                    setChangeNewPassword(auto);
                    setChangeConfirmPassword(auto);
                    setShowChangeNewPassword(true);
                    setShowChangeConfirmPassword(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#D5AA53]" />
                  <span>Buat Password Otomatis</span>
                </button>
              </div>

              {/* Input Password Baru */}
              <div>
                <label className="block font-medium text-stone-700 mb-1 text-[11px]">
                  Password Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showChangeNewPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimal 10 karakter"
                    value={changeNewPassword}
                    onChange={e => setChangeNewPassword(e.target.value)}
                    className="w-full p-2.5 pr-10 rounded-xl border border-stone-300 bg-white font-mono text-xs focus:ring-2 focus:ring-[#123B35] focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowChangeNewPassword(!showChangeNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer p-1"
                    title={showChangeNewPassword ? 'Sembunyikan' : 'Lihat'}
                  >
                    {showChangeNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Input Konfirmasi Password */}
              <div>
                <label className="block font-medium text-stone-700 mb-1 text-[11px]">
                  Konfirmasi Password Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showChangeConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Ketik ulang password baru"
                    value={changeConfirmPassword}
                    onChange={e => setChangeConfirmPassword(e.target.value)}
                    className="w-full p-2.5 pr-10 rounded-xl border border-stone-300 bg-white font-mono text-xs focus:ring-2 focus:ring-[#123B35] focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowChangeConfirmPassword(!showChangeConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer p-1"
                    title={showChangeConfirmPassword ? 'Sembunyikan' : 'Lihat'}
                  >
                    {showChangeConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {changeNewPassword && (
                <div className="text-[11px]">
                  {changeNewPassword === changeConfirmPassword ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Password dan konfirmasi cocok</span>
                    </span>
                  ) : (
                    <span className="text-rose-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Konfirmasi password belum cocok</span>
                    </span>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setChangePasswordUser(null)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-stone-600 hover:bg-stone-50 font-semibold cursor-pointer text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword || !changeNewPassword || changeNewPassword !== changeConfirmPassword}
                  className="px-5 py-2.5 bg-[#174C80] hover:bg-[#2065AA] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer text-xs flex items-center gap-2 disabled:opacity-50"
                >
                  <Key className="w-3.5 h-3.5 text-[#D5AA53]" />
                  <span>{isChangingPassword ? 'Menyimpan...' : 'Simpan Perubahan Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: QUICK RESET PASSWORD CONFIRMATION */}
      {/* ========================================================================= */}
      {resetPromptUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setResetPromptUser(null);
          }}
        >
          <div className="bg-white rounded-3xl border border-stone-200 max-w-sm w-full p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
              <RotateCcw className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-bold text-base text-stone-900 font-serif">
                Reset Password Akun?
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                Sistem akan membuat password sementara baru secara otomatis untuk petugas:
              </p>
              <div className="mt-2 p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                <span className="font-bold text-stone-900 block">{resetPromptUser.name}</span>
                <span className="text-stone-500 font-mono text-[11px]">@{resetPromptUser.username}</span>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 text-left bg-amber-50 p-2.5 rounded-lg border border-amber-200 leading-relaxed">
              Password lama akan langsung hangus dan digantikan password baru yang dapat disalin setelah proses ini.
            </p>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResetPromptUser(null)}
                className="w-1/2 py-2.5 border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-50 font-semibold cursor-pointer text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={handleExecuteQuickReset}
                className="w-1/2 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isResetting ? 'Mereset...' : 'Reset Sekarang'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: NOTIFIKASI KREDENSIAL PASSWORD SEMENTARA (DITAMPILKAN 1 KALI & SALIN PASSWORD) */}
      {/* ========================================================================= */}
      {tempPasswordCredential && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setTempPasswordCredential(null);
          }}
        >
          <div className="bg-white rounded-3xl border border-stone-200 max-w-md w-full p-6 shadow-2xl space-y-4 my-auto relative animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-stone-900 font-serif">
                    {tempPasswordCredential.type === 'tambah'
                      ? 'Akun Petugas Berhasil Dibuat!'
                      : tempPasswordCredential.type === 'reset'
                      ? 'Reset Password Berhasil!'
                      : 'Password Berhasil Diperbarui!'}
                  </h3>
                  <p className="text-[11px] text-emerald-700 font-semibold">
                    Kredensial login siap digunakan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTempPasswordCredential(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Explanation Note */}
            <p className="text-xs text-stone-600 leading-relaxed">
              Informasi password sementara ini hanya ditampilkan satu kali setelah proses selesai. Silakan salin dan serahkan kredensial ini kepada <strong>{tempPasswordCredential.name}</strong>:
            </p>

            {/* Credential Card */}
            <div className="p-4 bg-linear-to-b from-[#F7F8F5] to-emerald-50/50 rounded-2xl border-2 border-emerald-300 space-y-3">
              {/* Username */}
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-stone-200">
                <div>
                  <span className="text-[10px] text-stone-400 block uppercase font-bold tracking-wider">
                    Username Login
                  </span>
                  <span className="font-mono font-bold text-stone-900 text-sm">
                    @{tempPasswordCredential.username}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(`@${tempPasswordCredential.username}`, 'username_copy')}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-stone-300 hover:bg-stone-50 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedField === 'username_copy' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-stone-500" />}
                  <span>{copiedField === 'username_copy' ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>

              {/* Password Sementara */}
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border-2 border-amber-300">
                <div>
                  <span className="text-[10px] text-amber-700 block uppercase font-bold tracking-wider">
                    Password Sementara
                  </span>
                  <span className="font-mono font-black text-amber-900 text-base tracking-wider">
                    {tempPasswordCredential.temporaryPassword}
                  </span>
                </div>
                {/* Tombol Salin Password */}
                <button
                  type="button"
                  onClick={() => copyToClipboard(tempPasswordCredential.temporaryPassword, 'password_copy')}
                  className="px-3 py-1.5 bg-[#123B35] hover:bg-[#1a544b] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  title="Salin password sementara ke clipboard"
                >
                  {copiedField === 'password_copy' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5 text-[#D5AA53]" />}
                  <span>{copiedField === 'password_copy' ? 'Password Tersalin!' : 'Salin Password'}</span>
                </button>
              </div>
            </div>

            {/* Quick Share via WhatsApp format */}
            <button
              type="button"
              onClick={() => {
                const message = `*KREDENSIAL LOGIN SISTEM SDIT INSAN CENDIKIA KALIBARU*\n\nAssalamu'alaikum Wr. Wb.\nBerikut kredensial akun petugas Anda:\n\n*Nama:* ${tempPasswordCredential.name}\n*Username:* @${tempPasswordCredential.username}\n*Password Sementara:* ${tempPasswordCredential.temporaryPassword}\n\n*Link Login:* https://sditinsancendikia-kalibaru.sch.id\n\n_Catatan: Demi keamanan, jangan membagikan kata sandi ini kepada pihak lain._`;
                copyToClipboard(message, 'wa_format_copy');
              }}
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              {copiedField === 'wa_format_copy' ? <Check className="w-4 h-4 text-emerald-300" /> : <Send className="w-4 h-4 text-[#D5AA53]" />}
              <span>{copiedField === 'wa_format_copy' ? 'Format WhatsApp Tersalin!' : 'Salin Format Pesan WhatsApp'}</span>
            </button>

            {/* Security Note */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[10px] text-stone-600 leading-relaxed">
              <span className="font-bold text-stone-800 block mb-0.5">Keamanan Akun:</span>
              Password lama sudah tidak berlaku. Password baru ini langsung terenkripsi aman di sistem dan dapat digunakan petugas untuk masuk ke dashboard secara resmi.
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setTempPasswordCredential(null)}
                className="w-full sm:w-auto px-6 py-2.5 bg-stone-900 hover:bg-black text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Tutup & Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
