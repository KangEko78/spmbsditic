/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  StudentData,
  ParentData,
  ResidenceData,
  UploadedDocument,
  Registration,
  SchoolProfile,
  SpmbWave,
  IncomeRange,
  ChildStatus,
  LivingWith,
  HouseStatus,
  PaymentProof
} from '../../types';
import { api } from '../../lib/api';
import { RegistrationReceipt } from './RegistrationReceipt';
import { formatDateId } from '../../lib/utils';
import { downloadElementAsPdf } from '../../lib/pdfGenerator';
import {
  User as UserIcon,
  Users,
  GraduationCap,
  Upload,
  CheckCircle2,
  Send,
  Printer,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  FileText,
  Trash2,
  LogOut,
  X,
  CreditCard,
  Copy,
  Check,
  Building2,
  Home,
  Info,
  Search,
  Eye,
  Download,
  Loader2,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

interface RegistrationWizardProps {
  schoolProfile: SchoolProfile;
  onNavigateToCheckStatus?: (registrationNumber?: string) => void;
  onExit?: () => void;
}

export const INCOME_OPTIONS: IncomeRange[] = [
  'Tidak Berpenghasilan',
  'Rp500.000 – Rp1.000.000',
  'Lebih dari Rp1.000.000 – Rp2.000.000',
  'Lebih dari Rp2.000.000 – Rp3.000.000',
  'Lebih dari Rp3.000.000 – Rp5.000.000',
  'Lebih dari Rp5.000.000 – Rp10.000.000',
  'Lebih dari Rp10.000.000'
];

export const CHILD_STATUS_OPTIONS: ChildStatus[] = [
  'Tidak termasuk ketiganya',
  'Yatim',
  'Piatu',
  'Yatim Piatu'
];

export const LIVING_WITH_OPTIONS: LivingWith[] = [
  'Ayah dan Ibu',
  'Ayah',
  'Ibu',
  'Wali',
  'Kakek/Nenek',
  'Saudara',
  'Lainnya'
];

export const HOUSE_STATUS_OPTIONS: HouseStatus[] = [
  'Hak Milik',
  'Kontrak/Sewa',
  'Rumah Keluarga',
  'Menumpang',
  'Lainnya'
];

export const RegistrationWizard: React.FC<RegistrationWizardProps> = ({
  schoolProfile,
  onNavigateToCheckStatus,
  onExit
}) => {
  // Steps:
  // 1: Data Calon Murid
  // 2: Data Orang Tua / Wali
  // 3: Data Tempat Tinggal & Pendidikan TK
  // 4: Upload Berkas & Bukti Biaya Pendaftaran
  // 5: Tinjau & Konfirmasi Data
  // 6: Bukti Pendaftaran (Nomor Pendaftaran & Unduh PDF)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submittedRegistration, setSubmittedRegistration] = useState<Registration | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedRegNumber, setCopiedRegNumber] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [whatsAppGroup, setWhatsAppGroup] = useState<{
    groupName: string;
    inviteLink: string;
    groupLink?: string;
    isActive: boolean;
    infoMessage: string;
    updatedAt?: string;
  } | null>(null);

  // Waves
  const [waves, setWaves] = useState<SpmbWave[]>([]);
  const [selectedWaveId, setSelectedWaveId] = useState<string>('gelombang-1');

  useEffect(() => {
    api.getSpmbWaves()
      .then(data => {
        setWaves(data);
        const openWave = data.find(w => w.status === 'Dibuka') || data[0];
        if (openWave) setSelectedWaveId(openWave.id);
      })
      .catch(console.error);

    api.getPublicWhatsAppGroup()
      .then(data => {
        if (data) setWhatsAppGroup(data);
      })
      .catch(console.error);
  }, []);

  // STEP 1: Student Data
  const [student, setStudent] = useState<StudentData>({
    fullName: '',
    nickname: '',
    gender: 'Laki-laki',
    birthPlace: '',
    birthDate: '',
    nik: '',
    childNumber: 1, // Anak ke- (wajib)
    totalSiblings: 0, // Jumlah saudara (>= 0, wajib)
    childStatus: 'Tidak termasuk ketiganya', // Yatim / Piatu / Yatim Piatu / Tidak termasuk ketiganya
    hasSpecialNeeds: 'Tidak', // Ya / Tidak
    specialNeedsDescription: '', // Wajib jika Ya
    religion: 'Islam',
    bloodType: 'A',
    address: '',
    rtRw: '01/01',
    village: 'Kalibaru Kulon',
    district: 'Kalibaru',
    regency: 'Kabupaten Banyuwangi',
    province: 'Jawa Timur',
    postalCode: '68467',
    previousSchool: '',
    previousSchoolAddress: '',
    hobby: '',
    ambition: ''
  });

  // STEP 2: Parent Data (All fields required according to family conditions)
  const [parent, setParent] = useState<ParentData>({
    fatherStatus: 'Masih Hidup',
    fatherName: '',
    fatherNik: '',
    fatherPhone: '',
    fatherJob: '',
    fatherEducation: 'SMA / Sederajat',
    fatherIncome: 'Lebih dari Rp2.000.000 – Rp3.000.000',
    motherStatus: 'Masih Hidup',
    motherName: '',
    motherNik: '',
    motherPhone: '',
    motherJob: '',
    motherEducation: 'SMA / Sederajat',
    motherIncome: 'Tidak Berpenghasilan',
    hasGuardian: false,
    guardianName: '',
    guardianNik: '',
    guardianPhone: '',
    guardianRelation: '',
    guardianEducation: 'SMA / Sederajat',
    guardianJob: '',
    guardianIncome: 'Tidak Berpenghasilan',
    parentAddress: ''
  });

  // STEP 3: Residence Data & Previous Education
  const [residence, setResidence] = useState<ResidenceData>({
    livingWith: 'Ayah dan Ibu',
    livingWithOtherNote: '',
    currentAddress: '',
    rtRw: '01/01',
    village: 'Kalibaru Kulon',
    district: 'Kalibaru',
    regency: 'Kabupaten Banyuwangi',
    province: 'Jawa Timur',
    postalCode: '68467',
    houseStatus: 'Hak Milik',
    houseStatusOtherNote: '',
    vehicleCount: 1
  });

  const [previousEducation, setPreviousEducation] = useState({
    schoolName: '',
    schoolAddress: '',
    certificateNumber: '',
    npsnTk: ''
  });

  // STEP 4: Documents & Mandatory Registration Payment Proof (Rp 50.000)
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [paymentProofForm, setPaymentProofForm] = useState<{
    method: 'Tunai di Sekretariat' | 'Transfer Bank Jatim';
    paymentDate: string;
    amount: number;
    senderName: string;
    fileUrl: string;
    fileName: string;
    fileSizeKb: number;
  }>({
    method: 'Transfer Bank Jatim',
    paymentDate: new Date().toISOString().split('T')[0],
    amount: 50000,
    senderName: '',
    fileUrl: '',
    fileName: '',
    fileSizeKb: 0
  });

  const [agreementChecked, setAgreementChecked] = useState(false);

  // Clear specific field error
  const clearError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Handle general file uploads (KK, Akta, Pas Foto, etc.)
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: UploadedDocument['type'],
    label: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError(`Ukuran file "${file.name}" melebihi batas 5MB.`);
      return;
    }

    setUploadError(null);
    clearError(type);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const newDoc: UploadedDocument = {
        id: `doc-${Date.now()}-${type}`,
        name: file.name,
        type,
        label,
        fileUrl: base64,
        fileName: file.name,
        fileSizeKb: Math.round(file.size / 1024),
        uploadedAt: new Date().toISOString(),
        isVerified: false
      };

      setDocuments(prev => [...prev.filter(d => d.type !== type), newDoc]);
    };
    reader.readAsDataURL(file);
  };

  const removeDoc = (type: UploadedDocument['type']) => {
    setDocuments(prev => prev.filter(d => d.type !== type));
  };

  // Handle registration payment proof upload (Mandatory)
  const handlePaymentProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError(`Ukuran file bukti pembayaran "${file.name}" melebihi 5MB.`);
      return;
    }

    setUploadError(null);
    clearError('paymentProofFile');
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPaymentProofForm(prev => ({
        ...prev,
        fileUrl: base64,
        fileName: file.name,
        fileSizeKb: Math.round(file.size / 1024)
      }));
    };
    reader.readAsDataURL(file);
  };

  const removePaymentProof = () => {
    setPaymentProofForm(prev => ({
      ...prev,
      fileUrl: '',
      fileName: '',
      fileSizeKb: 0
    }));
  };

  const copyBankToClipboard = () => {
    navigator.clipboard.writeText('1592015532');
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2500);
  };

  // STEP 1 VALIDATION
  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!student.fullName.trim()) errors.fullName = 'Nama lengkap calon murid wajib diisi sesuai Akta.';
    if (!student.nickname.trim()) errors.nickname = 'Nama panggilan calon murid wajib diisi.';
    if (!student.birthPlace.trim()) errors.birthPlace = 'Tempat lahir wajib diisi.';
    if (!student.birthDate) errors.birthDate = 'Tanggal lahir wajib diisi.';
    if (!student.nik.trim()) {
      errors.nik = 'NIK calon murid wajib diisi (16 digit).';
    } else if (student.nik.length !== 16) {
      errors.nik = 'NIK harus tepat 16 digit angka sesuai Kartu Keluarga.';
    }
    if (student.childNumber === undefined || student.childNumber === null || student.childNumber < 1) {
      errors.childNumber = 'Anak ke- wajib berupa angka minimal 1.';
    }
    if (student.totalSiblings === undefined || student.totalSiblings === null || student.totalSiblings < 0) {
      errors.totalSiblings = 'Jumlah saudara wajib diisi (minimal 0).';
    }
    if (!student.childStatus) {
      errors.childStatus = 'Status anak wajib dipilih.';
    }
    if (!student.hasSpecialNeeds) {
      errors.hasSpecialNeeds = 'Pilihan anak berkebutuhan khusus wajib dipilih.';
    } else if (student.hasSpecialNeeds === 'Ya' && !student.specialNeedsDescription?.trim()) {
      errors.specialNeedsDescription = 'Keterangan kebutuhan khusus wajib diisi jika memilih Ya.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // STEP 2 VALIDATION (Data Orang Tua / Wali)
  const validateStep2 = () => {
    const errors: Record<string, string> = {};

    // Ayah
    if (!parent.fatherName.trim()) {
      errors.fatherName = 'Nama ayah wajib diisi.';
    }
    if (parent.fatherStatus === 'Masih Hidup') {
      if (!parent.fatherNik.trim()) {
        errors.fatherNik = 'NIK ayah wajib diisi (16 digit).';
      } else if (parent.fatherNik.length !== 16) {
        errors.fatherNik = 'NIK ayah harus tepat 16 digit angka.';
      }
      if (!parent.fatherEducation) errors.fatherEducation = 'Pendidikan terakhir ayah wajib dipilih.';
      if (!parent.fatherJob.trim()) errors.fatherJob = 'Pekerjaan ayah wajib diisi.';
      if (!parent.fatherIncome) errors.fatherIncome = 'Rentang penghasilan ayah wajib dipilih.';
      if (!parent.fatherPhone.trim()) errors.fatherPhone = 'Nomor WhatsApp / HP ayah wajib diisi.';
    }

    // Ibu
    if (!parent.motherName.trim()) {
      errors.motherName = 'Nama ibu wajib diisi.';
    }
    if (parent.motherStatus === 'Masih Hidup') {
      if (!parent.motherNik.trim()) {
        errors.motherNik = 'NIK ibu wajib diisi (16 digit).';
      } else if (parent.motherNik.length !== 16) {
        errors.motherNik = 'NIK ibu harus tepat 16 digit angka.';
      }
      if (!parent.motherEducation) errors.motherEducation = 'Pendidikan terakhir ibu wajib dipilih.';
      if (!parent.motherJob.trim()) errors.motherJob = 'Pekerjaan ibu wajib diisi.';
      if (!parent.motherIncome) errors.motherIncome = 'Rentang penghasilan ibu wajib dipilih.';
      if (!parent.motherPhone.trim()) errors.motherPhone = 'Nomor WhatsApp / HP ibu wajib diisi.';
    }

    // Wali (jika diaktifkan atau jika tinggal dengan wali)
    if (parent.hasGuardian || residence.livingWith === 'Wali') {
      if (!parent.guardianName?.trim()) errors.guardianName = 'Nama wali wajib diisi.';
      if (!parent.guardianRelation?.trim()) errors.guardianRelation = 'Hubungan wali dengan calon siswa wajib diisi.';
      if (!parent.guardianJob?.trim()) errors.guardianJob = 'Pekerjaan wali wajib diisi.';
      if (!parent.guardianIncome) errors.guardianIncome = 'Rentang penghasilan wali wajib dipilih.';
      if (!parent.guardianPhone?.trim()) errors.guardianPhone = 'Nomor WhatsApp / HP wali wajib diisi.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // STEP 3 VALIDATION (Data Tempat Tinggal Calon Siswa & TK)
  const validateStep3 = () => {
    const errors: Record<string, string> = {};

    if (!residence.livingWith) {
      errors.livingWith = 'Pilihan bertempat tinggal dengan siapa wajib dipilih.';
    } else if (residence.livingWith === 'Lainnya' && !residence.livingWithOtherNote?.trim()) {
      errors.livingWithOtherNote = 'Keterangan bertempat tinggal lainnya wajib diisi.';
    }

    if (!residence.currentAddress.trim()) errors.currentAddress = 'Alamat lengkap saat ini wajib diisi.';
    if (!residence.rtRw?.trim()) errors.rtRw = 'RT / RW wajib diisi.';
    if (!residence.village.trim()) errors.village = 'Desa / Kelurahan wajib diisi.';
    if (!residence.district.trim()) errors.district = 'Kecamatan wajib diisi.';
    if (!residence.regency.trim()) errors.regency = 'Kabupaten / Kota wajib diisi.';
    if (!residence.province?.trim()) errors.province = 'Provinsi wajib diisi.';

    if (!residence.houseStatus) {
      errors.houseStatus = 'Status kepemilikan rumah wajib dipilih.';
    } else if (residence.houseStatus === 'Lainnya' && !residence.houseStatusOtherNote?.trim()) {
      errors.houseStatusOtherNote = 'Keterangan status rumah lainnya wajib diisi.';
    }

    if (residence.vehicleCount === undefined || residence.vehicleCount === null || residence.vehicleCount < 0) {
      errors.vehicleCount = 'Jumlah kendaraan wajib berupa angka 0 atau lebih.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // STEP 4 VALIDATION (Upload Berkas & Bukti Bayar Rp 50.000)
  const validateStep4 = () => {
    const errors: Record<string, string> = {};

    const hasKk = documents.some(d => d.type === 'kk');
    const hasAkta = documents.some(d => d.type === 'akta');
    const hasFoto = documents.some(d => d.type === 'foto');

    if (!hasKk) errors.doc_kk = 'Kartu Keluarga (KK) wajib diunggah.';
    if (!hasAkta) errors.doc_akta = 'Akta Kelahiran calon murid wajib diunggah.';
    if (!hasFoto) errors.doc_foto = 'Pas foto calon murid (3x4) wajib diunggah.';

    // Mandatory Registration Fee Proof (Rp 50.000)
    if (!paymentProofForm.senderName.trim()) {
      errors.paymentSenderName = 'Nama pengirim / pembayar biaya pendaftaran wajib diisi.';
    }
    if (!paymentProofForm.paymentDate) {
      errors.paymentDate = 'Tanggal pembayaran wajib diisi.';
    }
    if (!paymentProofForm.fileUrl) {
      errors.paymentProofFile = 'Bukti pembayaran biaya pendaftaran Rp50.000,- wajib diunggah sebelum dapat mengirim pendaftaran.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Final Submission to SPMB API
  const handleFinalSubmit = async () => {
    if (!agreementChecked) {
      setErrorMessage('Silakan beri tanda centang pada pernyataan kebenaran data di bawah sebelum mengirim formulir.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const chosenWave = waves.find(w => w.id === selectedWaveId);

      const paymentProofData: PaymentProof = {
        method: paymentProofForm.method,
        paymentDate: paymentProofForm.paymentDate,
        amount: 50000,
        senderName: paymentProofForm.senderName.trim(),
        fileUrl: paymentProofForm.fileUrl,
        fileName: paymentProofForm.fileName || 'Bukti_Pembayaran_Pendaftaran',
        fileSizeKb: paymentProofForm.fileSizeKb,
        uploadedAt: new Date().toISOString(),
        status: 'Menunggu Verifikasi',
        history: [
          {
            status: 'Menunggu Verifikasi',
            notes: `Bukti biaya pendaftaran Rp50.000,- (${paymentProofForm.method}) diunggah saat registrasi online.`,
            timestamp: new Date().toISOString(),
            operator: 'Wali Murid Online'
          }
        ]
      };

      // Ensure payment proof is also in uploaded documents list
      const finalDocuments: UploadedDocument[] = [
        ...documents.filter(d => d.type !== 'bukti_bayar'),
        {
          id: `doc-pay-${Date.now()}`,
          name: paymentProofForm.fileName || 'Bukti_Bayar_Pendaftaran',
          type: 'bukti_bayar',
          label: 'Bukti Pembayaran Pendaftaran (Rp 50.000)',
          fileUrl: paymentProofForm.fileUrl,
          fileName: paymentProofForm.fileName || 'Bukti_Bayar_Pendaftaran',
          fileSizeKb: paymentProofForm.fileSizeKb,
          uploadedAt: new Date().toISOString(),
          isVerified: false
        }
      ];

      const fullStudentData: StudentData = {
        ...student,
        address: residence.currentAddress,
        rtRw: residence.rtRw,
        village: residence.village,
        district: residence.district,
        regency: residence.regency,
        province: residence.province,
        residence: { ...residence },
        previousSchool: previousEducation.schoolName || student.previousSchool,
        previousSchoolAddress: previousEducation.schoolAddress
      };

      const primaryPhone = parent.fatherPhone || parent.motherPhone || parent.guardianPhone || '';

      const payload: Partial<Registration> = {
        userId: `applicant-${Date.now()}`,
        userEmail: primaryPhone ? `${primaryPhone.replace(/\D/g, '')}@spmb.insancendikia.sch.id` : 'pendaftar@sdit.sch.id',
        waveId: selectedWaveId,
        waveName: chosenWave?.name || 'Gelombang 1',
        status: 'Menunggu Verifikasi',
        student: fullStudentData,
        parent: {
          ...parent,
          parentAddress: residence.currentAddress
        },
        residence: { ...residence },
        documents: finalDocuments,
        paymentProof: paymentProofData
      };

      const result = await api.createRegistration(payload);
      setSubmittedRegistration(result);
      try {
        const latestWa = await api.getPublicWhatsAppGroup();
        if (latestWa) setWhatsAppGroup(latestWa);
      } catch (e) {
        // use fallback loaded state
      }
      setCurrentStep(6); // Step 6: Confirmation & Unique Registration Code
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mengirim formulir pendaftaran. Silakan periksa kembali isian Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadReceiptPdf = async () => {
    if (!submittedRegistration) return;
    setIsDownloadingPdf(true);
    try {
      const sanitizedName = (submittedRegistration.student?.fullName || 'Peserta').replace(/[^a-zA-Z0-9]/g, '_');
      const ok = await downloadElementAsPdf(
        'spmb-printable-receipt',
        `Bukti_Pendaftaran_SPMB_${submittedRegistration.registrationNumber}_${sanitizedName}.pdf`
      );
      if (!ok) {
        setShowReceiptModal(true);
      }
    } catch (err: any) {
      console.error(err);
      alert('Gagal mengunduh file PDF secara otomatis: ' + (err.message || 'Error') + '. Silakan gunakan tombol Cetak.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePrintReceipt = () => {
    setShowReceiptModal(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const stepsList = [
    { num: 1, title: 'Data Calon Murid', icon: UserIcon },
    { num: 2, title: 'Data Orang Tua / Wali', icon: Users },
    { num: 3, title: 'Tempat Tinggal & TK', icon: Home },
    { num: 4, title: 'Upload Berkas & Bayar', icon: Upload },
    { num: 5, title: 'Review & Konfirmasi', icon: CheckCircle2 },
    { num: 6, title: 'Bukti Pendaftaran', icon: Send }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Top Header with School Branding & Keluar Button (Clean, Strictly No Internal Role Badges) */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <img
            src={schoolProfile.branding?.navbarLogoUrl || "/assets/aistudio/5_4164f3ac.png"}
            alt="Logo SDIT Insan Cendikia Kalibaru"
            className="w-10 h-10 object-contain rounded-lg p-1 bg-white border border-stone-200"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div>
            <h1 className="text-base sm:text-lg font-bold text-stone-900 font-serif leading-tight">
              Pendaftaran Siswa Baru (SPMB)
            </h1>
            <p className="text-xs text-stone-500">
              {schoolProfile.name} · Tahun Ajaran 2027/2028
            </p>
          </div>
        </div>

        {onExit && (
          <button
            type="button"
            onClick={onExit}
            className="px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Keluar dari formulir dan kembali ke beranda"
          >
            <LogOut className="w-4 h-4 text-stone-500" />
            <span>Keluar</span>
          </button>
        )}
      </div>

      {/* Stepper Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-bold text-[#123B35] mb-2">
          <span>Langkah {currentStep} dari 6</span>
          <span className="text-stone-500">{stepsList[currentStep - 1]?.title}</span>
        </div>
        <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#123B35] h-full transition-all duration-300"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>

        {/* Mobile Mini Step Pills */}
        <div className="flex md:hidden items-center justify-between gap-1.5 mt-2.5 px-0.5">
          {stepsList.map(step => (
            <div
              key={step.num}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                currentStep === step.num
                  ? 'bg-[#123B35] h-2 shadow-xs'
                  : currentStep > step.num
                  ? 'bg-emerald-600'
                  : 'bg-stone-200'
              }`}
              title={`Langkah ${step.num}: ${step.title}`}
            />
          ))}
        </div>

        {/* Step icon tabs */}
        <div className="hidden md:flex justify-between mt-3 px-1 text-[11px] text-stone-500 font-medium">
          {stepsList.map(step => (
            <div
              key={step.num}
              className={`flex flex-col items-center gap-1 ${
                currentStep === step.num
                  ? 'text-[#123B35] font-bold'
                  : currentStep > step.num
                  ? 'text-emerald-700'
                  : 'text-stone-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  currentStep === step.num
                    ? 'bg-[#123B35] text-white shadow-xs'
                    : currentStep > step.num
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-stone-100 text-stone-500'
                }`}
              >
                {step.num}
              </div>
              <span className="text-center">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: DATA CALON MURID BARU */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs">
          <div className="border-b border-stone-100 pb-4 mb-6">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Tahap 1 dari 6
            </span>
            <h3 className="text-xl font-bold text-stone-900 mt-1">
              Data Calon Murid Baru
            </h3>
            <p className="text-xs text-stone-600 mt-1">
              Isi data identitas calon murid sesuai dokumen resmi Akta Kelahiran dan Kartu Keluarga (KK).
            </p>
          </div>

          {/* Wave Selection Cards */}
          {waves.length > 0 && (
            <div className="mb-6 p-4 rounded-2xl bg-[#F7F8F5] border border-stone-200">
              <label className="block font-bold text-stone-800 text-xs mb-2">
                Pilih Gelombang Pendaftaran:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {waves.map(w => {
                  const isOpen = (w.status || 'Dibuka') === 'Dibuka';
                  const isSelected = selectedWaveId === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      disabled={!isOpen}
                      onClick={() => setSelectedWaveId(w.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        !isOpen
                          ? 'bg-stone-100 border-stone-200 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'bg-[#123B35] text-white border-[#123B35] shadow-xs cursor-pointer'
                          : 'bg-white hover:border-[#123B35]/40 text-stone-800 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs">{w.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          w.status === 'Dibuka'
                            ? isSelected ? 'bg-emerald-400 text-stone-900' : 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-300 text-stone-700'
                        }`}>
                          {w.status || 'Dibuka'}
                        </span>
                      </div>
                      <p className={`text-[11px] ${isSelected ? 'text-stone-200' : 'text-stone-500'}`}>
                        Kuota: {w.quota} Siswa · Biaya Pendaftaran: Rp 50.000,-
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-4 text-xs">
            {/* Nama Lengkap & Panggilan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block font-medium text-stone-700 mb-1">
                  Nama Lengkap Calon Murid <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Sesuai Akta Kelahiran"
                  value={student.fullName}
                  onChange={e => {
                    setStudent({ ...student, fullName: e.target.value });
                    clearError('fullName');
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-lg border ${
                    fieldErrors.fullName ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-[#123B35]'
                  } focus:outline-hidden focus:ring-2`}
                />
                {fieldErrors.fullName && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Nama Panggilan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama akrab ananda"
                  value={student.nickname}
                  onChange={e => {
                    setStudent({ ...student, nickname: e.target.value });
                    clearError('nickname');
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-lg border ${
                    fieldErrors.nickname ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-[#123B35]'
                  } focus:outline-hidden focus:ring-2`}
                />
                {fieldErrors.nickname && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.nickname}</p>
                )}
              </div>
            </div>

            {/* JK, TTL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Jenis Kelamin <span className="text-rose-500">*</span>
                </label>
                <select
                  value={student.gender}
                  onChange={e => setStudent({ ...student, gender: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#123B35]"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Tempat Lahir <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Kota/Kabupaten kelahiran"
                  value={student.birthPlace}
                  onChange={e => {
                    setStudent({ ...student, birthPlace: e.target.value });
                    clearError('birthPlace');
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-lg border ${
                    fieldErrors.birthPlace ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-[#123B35]'
                  } focus:outline-hidden focus:ring-2`}
                />
                {fieldErrors.birthPlace && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.birthPlace}</p>
                )}
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Tanggal Lahir <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={student.birthDate}
                  onChange={e => {
                    setStudent({ ...student, birthDate: e.target.value });
                    clearError('birthDate');
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-lg border ${
                    fieldErrors.birthDate ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-[#123B35]'
                  } focus:outline-hidden focus:ring-2`}
                />
                {fieldErrors.birthDate ? (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.birthDate}</p>
                ) : (
                  <span className="text-[10px] text-stone-500 mt-1 block">
                    Digunakan untuk verifikasi di menu Cek Status Pendaftaran.
                  </span>
                )}
              </div>
            </div>

            {/* NIK, Anak Ke, Jumlah Saudara */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  NIK Calon Murid (16 Digit) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={16}
                  required
                  placeholder="Lihat di Kartu Keluarga (KK)"
                  value={student.nik}
                  onChange={e => {
                    setStudent({ ...student, nik: e.target.value.replace(/\D/g, '') });
                    clearError('nik');
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-lg border ${
                    fieldErrors.nik ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-[#123B35]'
                  } font-mono focus:outline-hidden focus:ring-2`}
                />
                {fieldErrors.nik && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.nik}</p>
                )}
              </div>

              {/* A. ANAK KE */}
              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Anak Ke <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  placeholder="Contoh: 2"
                  value={student.childNumber || ''}
                  onChange={e => {
                    const val = e.target.value === '' ? ('' as any) : Math.max(1, parseInt(e.target.value) || 1);
                    setStudent({ ...student, childNumber: val });
                    clearError('childNumber');
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-lg border ${
                    fieldErrors.childNumber ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-[#123B35]'
                  } focus:outline-hidden focus:ring-2`}
                />
                {fieldErrors.childNumber && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.childNumber}</p>
                )}
              </div>

              {/* B. JUMLAH SAUDARA */}
              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Jumlah Saudara Kandung <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  placeholder="0 jika anak tunggal"
                  value={student.totalSiblings !== undefined && student.totalSiblings !== null ? student.totalSiblings : ''}
                  onChange={e => {
                    const val = e.target.value === '' ? ('' as any) : Math.max(0, parseInt(e.target.value) || 0);
                    setStudent({ ...student, totalSiblings: val });
                    clearError('totalSiblings');
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-lg border ${
                    fieldErrors.totalSiblings ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-[#123B35]'
                  } focus:outline-hidden focus:ring-2`}
                />
                {fieldErrors.totalSiblings && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.totalSiblings}</p>
                )}
              </div>
            </div>

            {/* C. STATUS ANAK & D. ANAK BERKEBUTUHAN KHUSUS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* C. STATUS ANAK */}
              <div className="p-3.5 rounded-xl border border-stone-200 bg-[#F7F8F5]">
                <label className="block font-bold text-stone-800 mb-1">
                  Status Anak <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-stone-500 mb-2">Pilih kondisi keberadaan orang tua calon murid.</p>
                <select
                  value={student.childStatus || 'Tidak termasuk ketiganya'}
                  onChange={e => {
                    setStudent({ ...student, childStatus: e.target.value as ChildStatus });
                    clearError('childStatus');
                  }}
                  className="w-full px-3.5 py-2 rounded-lg border border-stone-300 bg-white font-medium"
                >
                  {CHILD_STATUS_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {fieldErrors.childStatus && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.childStatus}</p>
                )}
              </div>

              {/* D. ANAK BERKEBUTUHAN KHUSUS */}
              <div className="p-3.5 rounded-xl border border-stone-200 bg-[#F7F8F5]">
                <label className="block font-bold text-stone-800 mb-1">
                  Anak Berkebutuhan Khusus (ABK) <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-stone-500 mb-2">Apakah ananda memiliki kondisi kebutuhan khusus?</p>
                <div className="flex items-center gap-6 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700">
                    <input
                      type="radio"
                      name="hasSpecialNeeds"
                      value="Tidak"
                      checked={student.hasSpecialNeeds === 'Tidak'}
                      onChange={() => {
                        setStudent({ ...student, hasSpecialNeeds: 'Tidak', specialNeedsDescription: '' });
                        clearError('hasSpecialNeeds');
                        clearError('specialNeedsDescription');
                      }}
                      className="text-[#123B35] focus:ring-[#123B35]"
                    />
                    <span>Tidak</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700">
                    <input
                      type="radio"
                      name="hasSpecialNeeds"
                      value="Ya"
                      checked={student.hasSpecialNeeds === 'Ya'}
                      onChange={() => {
                        setStudent({ ...student, hasSpecialNeeds: 'Ya' });
                        clearError('hasSpecialNeeds');
                      }}
                      className="text-[#123B35] focus:ring-[#123B35]"
                    />
                    <span>Ya (Membutuhkan Perhatian Khusus)</span>
                  </label>
                </div>

                {student.hasSpecialNeeds === 'Ya' && (
                  <div className="mt-3 pt-3 border-t border-stone-200">
                    <label className="block font-medium text-stone-800 mb-1">
                      Keterangan Kebutuhan Khusus & Informasi Tambahan untuk Sekolah <span className="text-rose-500">*</span>:
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Jelaskan kebutuhan khusus atau riwayat kesehatan yang perlu diketahui asatidz/sekolah..."
                      value={student.specialNeedsDescription || ''}
                      onChange={e => {
                        setStudent({ ...student, specialNeedsDescription: e.target.value });
                        clearError('specialNeedsDescription');
                      }}
                      className={`w-full p-2.5 rounded-lg border ${
                        fieldErrors.specialNeedsDescription ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-[#123B35]'
                      } bg-white text-xs`}
                    />
                    {fieldErrors.specialNeedsDescription && (
                      <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.specialNeedsDescription}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Agama, Golongan Darah, Hobi & Cita-cita */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Agama</label>
                <select
                  value={student.religion}
                  onChange={e => setStudent({ ...student, religion: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white"
                >
                  <option value="Islam">Islam</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Golongan Darah</label>
                <select
                  value={student.bloodType || 'A'}
                  onChange={e => setStudent({ ...student, bloodType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                  <option value="Belum Tahu">Belum Tahu</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Hobi</label>
                <input
                  type="text"
                  placeholder="Membaca, Menggambar, dll"
                  value={student.hobby || ''}
                  onChange={e => setStudent({ ...student, hobby: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Cita-cita</label>
                <input
                  type="text"
                  placeholder="Hafidz, Dokter, Guru, dll"
                  value={student.ambition || ''}
                  onChange={e => setStudent({ ...student, ambition: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300"
                />
              </div>
            </div>

            <div className="pt-6 flex items-center justify-end border-t border-stone-100 mt-6">
              <button
                type="button"
                onClick={() => {
                  if (validateStep1()) {
                    setErrorMessage(null);
                    setCurrentStep(2);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    setErrorMessage('Mohon lengkapi seluruh kolom wajib pada Data Calon Murid.');
                  }
                }}
                className="w-full sm:w-auto px-6 py-3 bg-[#123B35] hover:bg-[#1a544b] text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <span>Lanjut ke Data Orang Tua / Wali</span>
                <ChevronRight className="w-4 h-4 text-[#D5AA53]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: DATA ORANG TUA / WALI (All Mandatory According to Family Condition) */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs">
          <div className="border-b border-stone-100 pb-4 mb-6">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Tahap 2 dari 6
            </span>
            <h3 className="text-xl font-bold text-stone-900 mt-1">
              Data Orang Tua / Wali
            </h3>
            <p className="text-xs text-stone-600 mt-1">
              Seluruh data orang tua/wali wajib diisi lengkap sesuai kondisi keluarga untuk komunikasi dan verifikasi resmi sekolah.
            </p>
          </div>

          <div className="space-y-6 text-xs">
            {/* Ayah Kandung Card */}
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
                <h4 className="font-bold text-[#123B35] text-sm flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#D5AA53]" />
                  <span>1. Data Ayah Kandung</span>
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-stone-500 font-medium">Kondisi Ayah:</span>
                  <select
                    value={parent.fatherStatus || 'Masih Hidup'}
                    onChange={e => {
                      const st = e.target.value as any;
                      setParent({
                        ...parent,
                        fatherStatus: st,
                        fatherIncome: st !== 'Masih Hidup' ? 'Tidak Berpenghasilan' : parent.fatherIncome
                      });
                      clearError('fatherNik');
                      clearError('fatherPhone');
                      clearError('fatherJob');
                    }}
                    className="px-2.5 py-1 rounded-md border border-stone-300 bg-white text-xs font-semibold"
                  >
                    <option value="Masih Hidup">Masih Hidup</option>
                    <option value="Meninggal Dunia">Meninggal Dunia (Almarhum)</option>
                    <option value="Tidak Diketahui">Tidak Diketahui Keberadaannya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Nama Lengkap Ayah <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap ayah"
                    value={parent.fatherName}
                    onChange={e => {
                      setParent({ ...parent, fatherName: e.target.value });
                      clearError('fatherName');
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      fieldErrors.fatherName ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-[#123B35]'
                    } bg-white`}
                  />
                  {fieldErrors.fatherName && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.fatherName}</p>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    NIK Ayah (16 Digit) {parent.fatherStatus === 'Masih Hidup' && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    disabled={parent.fatherStatus !== 'Masih Hidup'}
                    placeholder={parent.fatherStatus === 'Masih Hidup' ? "16 Digit NIK Ayah" : "Tidak diperlukan (Almarhum)"}
                    value={parent.fatherNik}
                    onChange={e => {
                      setParent({ ...parent, fatherNik: e.target.value.replace(/\D/g, '') });
                      clearError('fatherNik');
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      fieldErrors.fatherNik ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-[#123B35]'
                    } bg-white font-mono disabled:bg-stone-100 disabled:text-stone-400`}
                  />
                  {fieldErrors.fatherNik && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.fatherNik}</p>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    No. WhatsApp / HP Ayah {parent.fatherStatus === 'Masih Hidup' && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="tel"
                    disabled={parent.fatherStatus !== 'Masih Hidup'}
                    placeholder={parent.fatherStatus === 'Masih Hidup' ? "08xxxxxxxxxx" : "-"}
                    value={parent.fatherPhone}
                    onChange={e => {
                      setParent({ ...parent, fatherPhone: e.target.value });
                      clearError('fatherPhone');
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      fieldErrors.fatherPhone ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-[#123B35]'
                    } bg-white disabled:bg-stone-100 disabled:text-stone-400`}
                  />
                  {fieldErrors.fatherPhone && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.fatherPhone}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Pekerjaan Ayah {parent.fatherStatus === 'Masih Hidup' && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="text"
                    disabled={parent.fatherStatus !== 'Masih Hidup'}
                    placeholder={parent.fatherStatus === 'Masih Hidup' ? "Wiraswasta / PNS / Karyawan" : "-"}
                    value={parent.fatherJob}
                    onChange={e => {
                      setParent({ ...parent, fatherJob: e.target.value });
                      clearError('fatherJob');
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      fieldErrors.fatherJob ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-[#123B35]'
                    } bg-white disabled:bg-stone-100 disabled:text-stone-400`}
                  />
                  {fieldErrors.fatherJob && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.fatherJob}</p>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Pendidikan Terakhir {parent.fatherStatus === 'Masih Hidup' && <span className="text-rose-500">*</span>}
                  </label>
                  <select
                    disabled={parent.fatherStatus !== 'Masih Hidup'}
                    value={parent.fatherEducation}
                    onChange={e => {
                      setParent({ ...parent, fatherEducation: e.target.value });
                      clearError('fatherEducation');
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white disabled:bg-stone-100 disabled:text-stone-400"
                  >
                    <option value="SD / Sederajat">SD / Sederajat</option>
                    <option value="SMP / Sederajat">SMP / Sederajat</option>
                    <option value="SMA / Sederajat">SMA / Sederajat</option>
                    <option value="D3">D3</option>
                    <option value="S1">S1</option>
                    <option value="S2">S2</option>
                    <option value="S3">S3</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                {/* 4. Rentang Penghasilan Ayah (Dropdown Wajib) */}
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Rentang Penghasilan Bulanan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    disabled={parent.fatherStatus !== 'Masih Hidup'}
                    value={parent.fatherIncome}
                    onChange={e => {
                      setParent({ ...parent, fatherIncome: e.target.value as IncomeRange });
                      clearError('fatherIncome');
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white font-medium disabled:bg-stone-100 disabled:text-stone-400"
                  >
                    {INCOME_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Ibu Kandung Card */}
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
                <h4 className="font-bold text-[#123B35] text-sm flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#D5AA53]" />
                  <span>2. Data Ibu Kandung</span>
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-stone-500 font-medium">Kondisi Ibu:</span>
                  <select
                    value={parent.motherStatus || 'Masih Hidup'}
                    onChange={e => {
                      const st = e.target.value as any;
                      setParent({
                        ...parent,
                        motherStatus: st,
                        motherIncome: st !== 'Masih Hidup' ? 'Tidak Berpenghasilan' : parent.motherIncome
                      });
                      clearError('motherNik');
                      clearError('motherPhone');
                      clearError('motherJob');
                    }}
                    className="px-2.5 py-1 rounded-md border border-stone-300 bg-white text-xs font-semibold"
                  >
                    <option value="Masih Hidup">Masih Hidup</option>
                    <option value="Meninggal Dunia">Meninggal Dunia (Almarhumah)</option>
                    <option value="Tidak Diketahui">Tidak Diketahui Keberadaannya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Nama Lengkap Ibu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap ibu"
                    value={parent.motherName}
                    onChange={e => {
                      setParent({ ...parent, motherName: e.target.value });
                      clearError('motherName');
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      fieldErrors.motherName ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-[#123B35]'
                    } bg-white`}
                  />
                  {fieldErrors.motherName && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.motherName}</p>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    NIK Ibu (16 Digit) {parent.motherStatus === 'Masih Hidup' && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    disabled={parent.motherStatus !== 'Masih Hidup'}
                    placeholder={parent.motherStatus === 'Masih Hidup' ? "16 Digit NIK Ibu" : "Tidak diperlukan (Almarhumah)"}
                    value={parent.motherNik}
                    onChange={e => {
                      setParent({ ...parent, motherNik: e.target.value.replace(/\D/g, '') });
                      clearError('motherNik');
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      fieldErrors.motherNik ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-[#123B35]'
                    } bg-white font-mono disabled:bg-stone-100 disabled:text-stone-400`}
                  />
                  {fieldErrors.motherNik && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.motherNik}</p>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    No. WhatsApp / HP Ibu {parent.motherStatus === 'Masih Hidup' && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="tel"
                    disabled={parent.motherStatus !== 'Masih Hidup'}
                    placeholder={parent.motherStatus === 'Masih Hidup' ? "08xxxxxxxxxx" : "-"}
                    value={parent.motherPhone}
                    onChange={e => {
                      setParent({ ...parent, motherPhone: e.target.value });
                      clearError('motherPhone');
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      fieldErrors.motherPhone ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-[#123B35]'
                    } bg-white disabled:bg-stone-100 disabled:text-stone-400`}
                  />
                  {fieldErrors.motherPhone && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.motherPhone}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Pekerjaan Ibu {parent.motherStatus === 'Masih Hidup' && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="text"
                    disabled={parent.motherStatus !== 'Masih Hidup'}
                    placeholder={parent.motherStatus === 'Masih Hidup' ? "Ibu Rumah Tangga / Guru / PNS" : "-"}
                    value={parent.motherJob}
                    onChange={e => {
                      setParent({ ...parent, motherJob: e.target.value });
                      clearError('motherJob');
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      fieldErrors.motherJob ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-[#123B35]'
                    } bg-white disabled:bg-stone-100 disabled:text-stone-400`}
                  />
                  {fieldErrors.motherJob && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.motherJob}</p>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Pendidikan Terakhir {parent.motherStatus === 'Masih Hidup' && <span className="text-rose-500">*</span>}
                  </label>
                  <select
                    disabled={parent.motherStatus !== 'Masih Hidup'}
                    value={parent.motherEducation}
                    onChange={e => {
                      setParent({ ...parent, motherEducation: e.target.value });
                      clearError('motherEducation');
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white disabled:bg-stone-100 disabled:text-stone-400"
                  >
                    <option value="SD / Sederajat">SD / Sederajat</option>
                    <option value="SMP / Sederajat">SMP / Sederajat</option>
                    <option value="SMA / Sederajat">SMA / Sederajat</option>
                    <option value="D3">D3</option>
                    <option value="S1">S1</option>
                    <option value="S2">S2</option>
                    <option value="S3">S3</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                {/* 4. Rentang Penghasilan Ibu (Dropdown Wajib) */}
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Rentang Penghasilan Bulanan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    disabled={parent.motherStatus !== 'Masih Hidup'}
                    value={parent.motherIncome}
                    onChange={e => {
                      setParent({ ...parent, motherIncome: e.target.value as IncomeRange });
                      clearError('motherIncome');
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white font-medium disabled:bg-stone-100 disabled:text-stone-400"
                  >
                    {INCOME_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Data Wali (Opsional / Jika ada wali) */}
            <div className="bg-[#F7F8F5] p-5 rounded-2xl border border-stone-200 space-y-3">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-stone-900 text-sm">3. Data Wali (Jika Ada / Diasuh Wali)</h4>
                  <span className="text-[10px] bg-stone-200 text-stone-700 px-2 py-0.5 rounded font-bold">
                    {parent.hasGuardian || residence.livingWith === 'Wali' ? 'Wajib Diisi' : 'Opsional'}
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#123B35]">
                  <input
                    type="checkbox"
                    checked={parent.hasGuardian || residence.livingWith === 'Wali'}
                    onChange={e => setParent({ ...parent, hasGuardian: e.target.checked })}
                    className="rounded text-[#123B35] focus:ring-[#123B35] cursor-pointer"
                  />
                  <span>Ada Wali / Diasuh Wali</span>
                </label>
              </div>

              {(parent.hasGuardian || residence.livingWith === 'Wali') && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">
                        Nama Lengkap Wali <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Nama lengkap wali"
                        value={parent.guardianName || ''}
                        onChange={e => {
                          setParent({ ...parent, guardianName: e.target.value });
                          clearError('guardianName');
                        }}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          fieldErrors.guardianName ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-[#123B35]'
                        } bg-white`}
                      />
                      {fieldErrors.guardianName && (
                        <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.guardianName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block font-medium text-stone-700 mb-1">
                        Hubungan dengan Calon Siswa <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Paman, Kakek, Kakak, dll"
                        value={parent.guardianRelation || ''}
                        onChange={e => {
                          setParent({ ...parent, guardianRelation: e.target.value });
                          clearError('guardianRelation');
                        }}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          fieldErrors.guardianRelation ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-[#123B35]'
                        } bg-white`}
                      />
                      {fieldErrors.guardianRelation && (
                        <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.guardianRelation}</p>
                      )}
                    </div>

                    <div>
                      <label className="block font-medium text-stone-700 mb-1">
                        Nomor HP / WhatsApp Wali <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                        value={parent.guardianPhone || ''}
                        onChange={e => {
                          setParent({ ...parent, guardianPhone: e.target.value });
                          clearError('guardianPhone');
                        }}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          fieldErrors.guardianPhone ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-[#123B35]'
                        } bg-white`}
                      />
                      {fieldErrors.guardianPhone && (
                        <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.guardianPhone}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">
                        Pekerjaan Wali <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Pekerjaan wali"
                        value={parent.guardianJob || ''}
                        onChange={e => {
                          setParent({ ...parent, guardianJob: e.target.value });
                          clearError('guardianJob');
                        }}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          fieldErrors.guardianJob ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-[#123B35]'
                        } bg-white`}
                      />
                      {fieldErrors.guardianJob && (
                        <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.guardianJob}</p>
                      )}
                    </div>

                    <div>
                      <label className="block font-medium text-stone-700 mb-1">
                        Rentang Penghasilan Bulanan Wali <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={parent.guardianIncome || 'Tidak Berpenghasilan'}
                        onChange={e => {
                          setParent({ ...parent, guardianIncome: e.target.value as IncomeRange });
                          clearError('guardianIncome');
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white font-medium"
                      >
                        {INCOME_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-stone-100 mt-6">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-full sm:w-auto px-4 py-2.5 border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-50 flex items-center justify-center gap-1 cursor-pointer min-h-[44px]"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (validateStep2()) {
                    setErrorMessage(null);
                    setCurrentStep(3);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    setErrorMessage('Mohon lengkapi seluruh data orang tua/wali yang bertanda bintang (*).');
                  }
                }}
                className="w-full sm:w-auto px-6 py-3 bg-[#123B35] hover:bg-[#1a544b] text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <span>Lanjut ke Tempat Tinggal Calon Siswa</span>
                <ChevronRight className="w-4 h-4 text-[#D5AA53]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: DATA TEMPAT TINGGAL CALON SISWA & PENDIDIKAN SEBELUMNYA */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs">
          <div className="border-b border-stone-100 pb-4 mb-6">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Tahap 3 dari 6
            </span>
            <h3 className="text-xl font-bold text-stone-900 mt-1">
              Data Tempat Tinggal Calon Siswa
            </h3>
            <p className="text-xs text-stone-600 mt-1">
              Informasi domisili tempat tinggal ananda saat ini dan asal jenjang prasekolah (TK/RA/PAUD).
            </p>
          </div>

          <div className="space-y-6 text-xs">
            {/* Bagian Tempat Tinggal Calon Siswa */}
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
              <h4 className="font-bold text-[#123B35] text-sm flex items-center gap-1.5 border-b border-stone-200 pb-2">
                <Home className="w-4 h-4 text-[#D5AA53]" />
                <span>Data Tempat Tinggal Calon Siswa</span>
              </h4>

              {/* A. Bertempat Tinggal Dengan */}
              <div>
                <label className="block font-medium text-stone-800 mb-1">
                  Bertempat Tinggal Dengan <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {LIVING_WITH_OPTIONS.map(opt => (
                    <label
                      key={opt}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                        residence.livingWith === opt
                          ? 'bg-[#123B35] text-white border-[#123B35] font-bold shadow-2xs'
                          : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="livingWith"
                        value={opt}
                        checked={residence.livingWith === opt}
                        onChange={() => {
                          setResidence({ ...residence, livingWith: opt });
                          clearError('livingWith');
                        }}
                        className="hidden"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                {residence.livingWith === 'Lainnya' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="Sebutkan keterangan tinggal bersama siapa..."
                      value={residence.livingWithOtherNote || ''}
                      onChange={e => {
                        setResidence({ ...residence, livingWithOtherNote: e.target.value });
                        clearError('livingWithOtherNote');
                      }}
                      className={`w-full p-2.5 rounded-lg border ${
                        fieldErrors.livingWithOtherNote ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-[#123B35]'
                      } bg-white text-xs`}
                    />
                    {fieldErrors.livingWithOtherNote && (
                      <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.livingWithOtherNote}</p>
                    )}
                  </div>
                )}
              </div>

              {/* B. Alamat Saat Ini Lengkap */}
              <div>
                <label className="block font-medium text-stone-800 mb-1">
                  Alamat Saat Ini (Jalan / Gang / No. Rumah / Dusun) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Contoh: Jl. Pahlawan No. 45 Dusun Krajan"
                  value={residence.currentAddress}
                  onChange={e => {
                    setResidence({ ...residence, currentAddress: e.target.value });
                    setStudent(prev => ({ ...prev, address: e.target.value }));
                    clearError('currentAddress');
                  }}
                  className={`w-full p-2.5 rounded-lg border ${
                    fieldErrors.currentAddress ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-[#123B35]'
                  } bg-white text-xs`}
                />
                {fieldErrors.currentAddress && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.currentAddress}</p>
                )}
              </div>

              {/* RT/RW, Desa, Kecamatan, Kabupaten, Provinsi */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    RT / RW <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="01/02"
                    value={residence.rtRw || ''}
                    onChange={e => {
                      setResidence({ ...residence, rtRw: e.target.value });
                      setStudent(prev => ({ ...prev, rtRw: e.target.value }));
                      clearError('rtRw');
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      fieldErrors.rtRw ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-[#123B35]'
                    } bg-white`}
                  />
                  {fieldErrors.rtRw && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.rtRw}</p>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Desa / Kelurahan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Kalibaru Kulon"
                    value={residence.village}
                    onChange={e => {
                      setResidence({ ...residence, village: e.target.value });
                      setStudent(prev => ({ ...prev, village: e.target.value }));
                      clearError('village');
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      fieldErrors.village ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-[#123B35]'
                    } bg-white`}
                  />
                  {fieldErrors.village && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.village}</p>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Kecamatan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Kalibaru"
                    value={residence.district}
                    onChange={e => {
                      setResidence({ ...residence, district: e.target.value });
                      setStudent(prev => ({ ...prev, district: e.target.value }));
                      clearError('district');
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      fieldErrors.district ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-[#123B35]'
                    } bg-white`}
                  />
                  {fieldErrors.district && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.district}</p>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Kabupaten / Kota <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Kabupaten Banyuwangi"
                    value={residence.regency}
                    onChange={e => {
                      setResidence({ ...residence, regency: e.target.value });
                      setStudent(prev => ({ ...prev, regency: e.target.value }));
                      clearError('regency');
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      fieldErrors.regency ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-[#123B35]'
                    } bg-white`}
                  />
                  {fieldErrors.regency && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.regency}</p>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Provinsi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jawa Timur"
                    value={residence.province || 'Jawa Timur'}
                    onChange={e => {
                      setResidence({ ...residence, province: e.target.value });
                      setStudent(prev => ({ ...prev, province: e.target.value }));
                      clearError('province');
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      fieldErrors.province ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-[#123B35]'
                    } bg-white`}
                  />
                  {fieldErrors.province && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.province}</p>
                  )}
                </div>
              </div>

              {/* C. Status Rumah & D. Jumlah Kendaraan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-medium text-stone-800 mb-1">
                    Status Kepemilikan Rumah <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={residence.houseStatus}
                    onChange={e => {
                      setResidence({ ...residence, houseStatus: e.target.value as HouseStatus });
                      clearError('houseStatus');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 bg-white font-medium"
                  >
                    {HOUSE_STATUS_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {residence.houseStatus === 'Lainnya' && (
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="Keterangan status rumah lainnya..."
                        value={residence.houseStatusOtherNote || ''}
                        onChange={e => {
                          setResidence({ ...residence, houseStatusOtherNote: e.target.value });
                          clearError('houseStatusOtherNote');
                        }}
                        className={`w-full p-2.5 rounded-lg border ${
                          fieldErrors.houseStatusOtherNote ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-[#123B35]'
                        } bg-white text-xs`}
                      />
                      {fieldErrors.houseStatusOtherNote && (
                        <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.houseStatusOtherNote}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* D. Jumlah Kendaraan */}
                <div>
                  <label className="block font-medium text-stone-800 mb-1">
                    Jumlah Kendaraan (Motor / Mobil) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    placeholder="0 jika tidak memiliki kendaraan"
                    value={residence.vehicleCount !== undefined && residence.vehicleCount !== null ? residence.vehicleCount : ''}
                    onChange={e => {
                      const val = e.target.value === '' ? ('' as any) : Math.max(0, parseInt(e.target.value) || 0);
                      setResidence({ ...residence, vehicleCount: val });
                      clearError('vehicleCount');
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-lg border ${
                      fieldErrors.vehicleCount ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-[#123B35]'
                    } bg-white text-xs`}
                  />
                  {fieldErrors.vehicleCount ? (
                    <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.vehicleCount}</p>
                  ) : (
                    <span className="text-[11px] text-stone-500 mt-1 block">
                      Isi angka 0 apabila keluarga tidak memiliki kendaraan bermotor.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Riwayat Sekolah Asal (TK / RA / PAUD) */}
            <div className="bg-[#F7F8F5] p-5 rounded-2xl border border-stone-200 space-y-3">
              <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5 border-b border-stone-200 pb-2">
                <GraduationCap className="w-4 h-4 text-[#123B35]" />
                <span>Pendidikan Sebelumnya (TK / RA / PAUD)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Nama TK / RA / PAUD Asal:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: TK Bina Mandiri Kalibaru"
                    value={previousEducation.schoolName}
                    onChange={e => setPreviousEducation({ ...previousEducation, schoolName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-stone-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Alamat Sekolah Asal:
                  </label>
                  <input
                    type="text"
                    placeholder="Kecamatan / Desa sekolah asal"
                    value={previousEducation.schoolAddress}
                    onChange={e => setPreviousEducation({ ...previousEducation, schoolAddress: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-stone-300 bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-stone-100 mt-6">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full sm:w-auto px-4 py-2.5 border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-50 flex items-center justify-center gap-1 cursor-pointer min-h-[44px]"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (validateStep3()) {
                    setErrorMessage(null);
                    setCurrentStep(4);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    setErrorMessage('Mohon lengkapi seluruh data tempat tinggal calon siswa.');
                  }
                }}
                className="w-full sm:w-auto px-6 py-3 bg-[#123B35] hover:bg-[#1a544b] text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <span>Lanjut ke Upload Berkas & Pembayaran</span>
                <ChevronRight className="w-4 h-4 text-[#D5AA53]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: UPLOAD BERKAS & BUKTI BIAYA PENDAFTARAN (MANDATORY RP 50.000) */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs">
          <div className="border-b border-stone-100 pb-4 mb-6">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Tahap 4 dari 6
            </span>
            <h3 className="text-xl font-bold text-stone-900 mt-1">
              Upload Berkas Persyaratan & Bukti Biaya Pendaftaran
            </h3>
            <p className="text-xs text-stone-600 mt-1">
              Format yang didukung: JPG, PNG, atau PDF (Maksimal 5MB). Pastikan dokumen terlihat jelas dan terbaca.
            </p>
          </div>

          {uploadError && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {uploadError}
            </div>
          )}

          <div className="space-y-6 text-xs">
            {/* Bagian Berkas Persyaratan Utama */}
            <div className="space-y-3">
              <h4 className="font-bold text-[#123B35] text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#D5AA53]" />
                <span>Berkas Persyaratan Dokumen Calon Siswa</span>
              </h4>

              {/* 1. Kartu Keluarga (KK) */}
              <div className="p-4 rounded-xl border border-stone-200 bg-[#F7F8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-stone-900">
                      1. Kartu Keluarga (KK) <span className="text-rose-500">*</span>
                    </h5>
                    <p className="text-stone-500 text-[11px]">Foto atau scan jelas KK asli tempat calon murid terdaftar.</p>
                    {documents.find(d => d.type === 'kk') && (
                      <span className="text-emerald-700 font-medium text-[11px] flex items-center gap-1 mt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Terunggah: {documents.find(d => d.type === 'kk')?.fileName}
                      </span>
                    )}
                    {fieldErrors.doc_kk && (
                      <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.doc_kk}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 bg-white border border-stone-300 hover:border-emerald-700 text-stone-700 text-xs font-medium rounded-lg cursor-pointer transition-colors shadow-2xs">
                    <span>{documents.find(d => d.type === 'kk') ? 'Ganti Berkas' : 'Pilih Berkas'}</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={e => handleFileUpload(e, 'kk', 'Kartu Keluarga')}
                    />
                  </label>
                  {documents.find(d => d.type === 'kk') && (
                    <button
                      type="button"
                      onClick={() => removeDoc('kk')}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-md cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Akta Kelahiran */}
              <div className="p-4 rounded-xl border border-stone-200 bg-[#F7F8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-stone-900">
                      2. Akta Kelahiran <span className="text-rose-500">*</span>
                    </h5>
                    <p className="text-stone-500 text-[11px]">Scan atau foto jelas Akta Kelahiran calon murid.</p>
                    {documents.find(d => d.type === 'akta') && (
                      <span className="text-emerald-700 font-medium text-[11px] flex items-center gap-1 mt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Terunggah: {documents.find(d => d.type === 'akta')?.fileName}
                      </span>
                    )}
                    {fieldErrors.doc_akta && (
                      <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.doc_akta}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 bg-white border border-stone-300 hover:border-emerald-700 text-stone-700 text-xs font-medium rounded-lg cursor-pointer transition-colors shadow-2xs">
                    <span>{documents.find(d => d.type === 'akta') ? 'Ganti Berkas' : 'Pilih Berkas'}</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={e => handleFileUpload(e, 'akta', 'Akta Kelahiran')}
                    />
                  </label>
                  {documents.find(d => d.type === 'akta') && (
                    <button
                      type="button"
                      onClick={() => removeDoc('akta')}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-md cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* 3. Pas Foto Calon Siswa (3x4) */}
              <div className="p-4 rounded-xl border border-stone-200 bg-[#F7F8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-stone-900">
                      3. Pas Foto Calon Siswa (3x4) <span className="text-rose-500">*</span>
                    </h5>
                    <p className="text-stone-500 text-[11px]">Foto formal ananda berbusana muslim / rapi.</p>
                    {documents.find(d => d.type === 'foto') && (
                      <span className="text-emerald-700 font-medium text-[11px] flex items-center gap-1 mt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Terunggah: {documents.find(d => d.type === 'foto')?.fileName}
                      </span>
                    )}
                    {fieldErrors.doc_foto && (
                      <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.doc_foto}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 bg-white border border-stone-300 hover:border-emerald-700 text-stone-700 text-xs font-medium rounded-lg cursor-pointer transition-colors shadow-2xs">
                    <span>{documents.find(d => d.type === 'foto') ? 'Ganti Foto' : 'Pilih Foto'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleFileUpload(e, 'foto', 'Pas Foto 3x4')}
                    />
                  </label>
                  {documents.find(d => d.type === 'foto') && (
                    <button
                      type="button"
                      onClick={() => removeDoc('foto')}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-md cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* 4. KTP Orang Tua / Wali */}
              <div className="p-4 rounded-xl border border-stone-200 bg-[#F7F8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-stone-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-stone-900">4. KTP Orang Tua / Wali</h5>
                    <p className="text-stone-500 text-[11px]">Foto atau scan KTP ayah/ibu/wali.</p>
                    {documents.find(d => d.type === 'ktp_ortu') && (
                      <span className="text-emerald-700 font-medium text-[11px] flex items-center gap-1 mt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Terunggah: {documents.find(d => d.type === 'ktp_ortu')?.fileName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 bg-white border border-stone-300 hover:border-emerald-700 text-stone-700 text-xs font-medium rounded-lg cursor-pointer transition-colors shadow-2xs">
                    <span>{documents.find(d => d.type === 'ktp_ortu') ? 'Ganti Berkas' : 'Pilih Berkas'}</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={e => handleFileUpload(e, 'ktp_ortu', 'KTP Orang Tua')}
                    />
                  </label>
                  {documents.find(d => d.type === 'ktp_ortu') && (
                    <button
                      type="button"
                      onClick={() => removeDoc('ktp_ortu')}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-md cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* =================================================================== */}
            {/* 6. BAGIAN KHUSUS: BUKTI PEMBAYARAN BIAYA PENDAFTARAN (WAJIB) */}
            {/* =================================================================== */}
            <div className="bg-amber-50/60 p-6 rounded-2xl border-2 border-[#123B35]/30 space-y-4">
              <div className="flex items-center gap-2 border-b border-amber-200/80 pb-3">
                <CreditCard className="w-5 h-5 text-[#123B35]" />
                <div>
                  <h4 className="font-black text-sm text-[#123B35] uppercase tracking-wide">
                    BUKTI PEMBAYARAN BIAYA PENDAFTARAN (WAJIB)
                  </h4>
                  <p className="text-[11px] text-stone-600">
                    Sesuai ketentuan, formulir pendaftaran hanya dapat diproses setelah bukti pembayaran pendaftaran resmi diunggah.
                  </p>
                </div>
              </div>

              {/* KOTAK INFORMASI RESMI PEMBAYARAN */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* A. PEMBAYARAN LANGSUNG DI SEKRETARIAT */}
                <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs space-y-1.5">
                  <span className="font-bold text-[#123B35] flex items-center gap-1 text-xs">
                    <Building2 className="w-3.5 h-3.5 text-[#D5AA53]" />
                    <span>A. Di Sekretariat Sekolah</span>
                  </span>
                  <p className="text-stone-700 text-[11px]">
                    Kantor Sekretariat SDIT Insan Cendekia
                  </p>
                  <div className="text-[10px] text-stone-600 space-y-0.5 font-medium">
                    <p>• <strong>Senin–Kamis:</strong> 07.00–15.00 WIB</p>
                    <p>• <strong>Jumat:</strong> 07.00–12.30 WIB</p>
                    <p className="text-stone-500 pt-0.5 leading-tight">
                      Jl. Pahlawan, Desa Kalibaru Kulon, Kec. Kalibaru
                    </p>
                  </div>
                </div>

                {/* B. PEMBAYARAN TRANSFER BANK */}
                <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs space-y-1.5">
                  <span className="font-bold text-[#174C80] flex items-center gap-1 text-xs">
                    <CreditCard className="w-3.5 h-3.5 text-[#D5AA53]" />
                    <span>B. Transfer Bank Jatim</span>
                  </span>
                  <div className="space-y-0.5 text-[11px]">
                    <span className="text-stone-500 block text-[10px]">Nomor Rekening:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-stone-900 text-sm">1592015532</span>
                      <button
                        type="button"
                        onClick={copyBankToClipboard}
                        className="px-2 py-0.5 text-[10px] font-bold bg-stone-100 hover:bg-stone-200 rounded text-stone-700 flex items-center gap-1 cursor-pointer"
                        title="Salin Nomor Rekening"
                      >
                        {copiedBank ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedBank ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>
                    <span className="text-stone-700 font-semibold block text-[10px] mt-0.5">
                      a.n. SDIT INSAN CENDEKIA PPDB
                    </span>
                  </div>
                </div>

                {/* C. RINCIAN BIAYA PENDAFTARAN */}
                <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs space-y-1.5 flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-emerald-800 flex items-center gap-1 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>C. Biaya Pendaftaran Resmi</span>
                    </span>
                    <p className="text-stone-500 text-[10px] mt-1">Rincian Biaya Pendaftaran:</p>
                    <p className="text-xl font-mono font-black text-emerald-800 mt-0.5">
                      Rp 50.000,-
                    </p>
                  </div>
                  <span className="text-[10px] text-stone-500 block">
                    * Nominal resmi pendaftaran. Tanpa biaya seragam dan tanpa biaya tambahan lain.
                  </span>
                </div>
              </div>

              {/* FORMULIR UPLOAD BUKTI PEMBAYARAN */}
              <div className="bg-white p-4 rounded-xl border border-amber-300 space-y-3">
                <span className="font-bold text-stone-900 block text-xs border-b border-stone-100 pb-2">
                  Formulir Konfirmasi Pembayaran Biaya Pendaftaran:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Metode Pembayaran <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={paymentProofForm.method}
                      onChange={e => setPaymentProofForm({ ...paymentProofForm, method: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs font-semibold"
                    >
                      <option value="Transfer Bank Jatim">Transfer Bank Jatim</option>
                      <option value="Tunai di Sekretariat">Tunai di Sekretariat</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Tanggal Pembayaran <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={paymentProofForm.paymentDate}
                      onChange={e => {
                        setPaymentProofForm({ ...paymentProofForm, paymentDate: e.target.value });
                        clearError('paymentDate');
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs"
                    />
                    {fieldErrors.paymentDate && (
                      <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.paymentDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Nominal Pembayaran (Tetap)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="Rp 50.000,-"
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-100 font-mono font-bold text-emerald-800 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Nama Pengirim / Pembayar <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama pemilik rekening pengirim atau nama penyetor tunai"
                    value={paymentProofForm.senderName}
                    onChange={e => {
                      setPaymentProofForm({ ...paymentProofForm, senderName: e.target.value });
                      clearError('paymentSenderName');
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      fieldErrors.paymentSenderName ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-[#123B35]'
                    } text-xs`}
                  />
                  {fieldErrors.paymentSenderName && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.paymentSenderName}</p>
                  )}
                </div>

                {/* Upload file area with preview */}
                <div className="pt-2">
                  <label className="block font-medium text-stone-800 mb-1">
                    Unggah File Bukti Pembayaran (JPG, JPEG, PNG, PDF max 5MB) <span className="text-rose-500">*</span>
                  </label>

                  {paymentProofForm.fileUrl ? (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {paymentProofForm.fileUrl.startsWith('data:image') ? (
                          <img
                            src={paymentProofForm.fileUrl}
                            alt="Bukti Bayar"
                            className="w-14 h-14 object-cover rounded-lg border border-emerald-300 shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-800 font-bold font-mono text-xs shrink-0">
                            PDF
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-emerald-950 block text-xs">
                            {paymentProofForm.fileName || 'Bukti_Pembayaran.jpg'}
                          </span>
                          <span className="text-[11px] text-emerald-800">
                            Ukuran: {paymentProofForm.fileSizeKb} KB · Status Awal: <strong>Menunggu Verifikasi</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="px-3 py-1.5 bg-white border border-stone-300 hover:border-emerald-700 text-stone-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-2xs">
                          <span>Ganti File</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg,application/pdf"
                            className="hidden"
                            onChange={handlePaymentProofUpload}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={removePaymentProof}
                          className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg hover:bg-rose-100 cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-stone-300 hover:border-[#123B35] rounded-xl p-4 text-center transition-colors">
                      <Upload className="w-6 h-6 text-stone-400 mx-auto mb-1.5" />
                      <p className="text-xs font-semibold text-stone-800">
                        Klik tombol di bawah untuk memilih file bukti pembayaran
                      </p>
                      <p className="text-[10px] text-stone-500 mb-2">
                        Format didukung: JPG, JPEG, PNG, PDF (Maksimal 5MB)
                      </p>
                      <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#123B35] hover:bg-[#1a544b] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs">
                        <CreditCard className="w-3.5 h-3.5 text-[#D5AA53]" />
                        <span>Pilih Bukti Pembayaran dari Perangkat</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg,application/pdf"
                          className="hidden"
                          onChange={handlePaymentProofUpload}
                        />
                      </label>
                    </div>
                  )}

                  {fieldErrors.paymentProofFile && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.paymentProofFile}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-stone-100 mt-6">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="w-full sm:w-auto px-4 py-2.5 border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-50 flex items-center justify-center gap-1 cursor-pointer min-h-[44px]"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (validateStep4()) {
                    setErrorMessage(null);
                    setCurrentStep(5);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    setErrorMessage('Mohon lengkapi seluruh dokumen wajib dan unggah bukti pembayaran biaya pendaftaran Rp50.000,-');
                  }
                }}
                className="w-full sm:w-auto px-6 py-3 bg-[#123B35] hover:bg-[#1a544b] text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <span>Lanjut ke Tinjau Data Pendaftaran</span>
                <ChevronRight className="w-4 h-4 text-[#D5AA53]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: TINJAU & KONFIRMASI DATA PENDAFTARAN */}
      {/* ========================================================================= */}
      {currentStep === 5 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs">
          <div className="border-b border-stone-100 pb-4 mb-6">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Tahap 5 dari 6
            </span>
            <h3 className="text-xl font-bold text-stone-900 mt-1">
              Tinjau & Konfirmasi Data Pendaftaran
            </h3>
            <p className="text-xs text-stone-600 mt-1">
              Periksa kembali seluruh informasi calon murid, orang tua/wali, tempat tinggal, dan bukti pembayaran biaya pendaftaran.
            </p>
          </div>

          <div className="space-y-5 text-xs text-stone-800">
            {/* Student Preview */}
            <div className="p-4 rounded-xl bg-[#F7F8F5] border border-stone-200">
              <div className="flex items-center justify-between mb-3 border-b border-stone-200 pb-2">
                <h4 className="font-bold text-[#123B35] text-sm flex items-center gap-1.5">
                  <UserIcon className="w-4 h-4 text-[#D5AA53]" />
                  <span>1. Data Calon Murid</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-emerald-800 font-semibold hover:underline cursor-pointer"
                >
                  Ubah Data
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                <div>
                  <span className="text-stone-500 block text-[11px]">Nama Lengkap:</span>
                  <span className="font-bold text-stone-900">{student.fullName}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Nama Panggilan:</span>
                  <span>{student.nickname}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Jenis Kelamin / Gol. Darah:</span>
                  <span>{student.gender} / Gol. {student.bloodType || 'A'}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Tempat, Tanggal Lahir:</span>
                  <span>{student.birthPlace}, {student.birthDate}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">NIK Calon Murid:</span>
                  <span className="font-mono font-bold">{student.nik}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Anak Ke / Dari Bersaudara:</span>
                  <span className="font-semibold">Anak ke-{student.childNumber} dari {student.totalSiblings} bersaudara</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Status Anak:</span>
                  <span className="font-bold text-[#123B35]">{student.childStatus}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Kebutuhan Khusus:</span>
                  <span>{student.hasSpecialNeeds === 'Ya' ? `Ya (${student.specialNeedsDescription || '-'})` : 'Tidak'}</span>
                </div>
              </div>
            </div>

            {/* Parent Preview */}
            <div className="p-4 rounded-xl bg-[#F7F8F5] border border-stone-200">
              <div className="flex items-center justify-between mb-3 border-b border-stone-200 pb-2">
                <h4 className="font-bold text-[#123B35] text-sm flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#D5AA53]" />
                  <span>2. Data Orang Tua / Wali</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-emerald-800 font-semibold hover:underline cursor-pointer"
                >
                  Ubah Data
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                <div>
                  <span className="text-stone-500 block text-[11px]">Ayah Kandung:</span>
                  <span className="font-bold text-stone-900">{parent.fatherName}</span>
                  <span className="text-stone-500 block text-[10px]">
                    Status: {parent.fatherStatus} · {parent.fatherJob || '-'}
                  </span>
                  <span className="text-stone-700 block text-[10px]">
                    Penghasilan: <strong>{parent.fatherIncome}</strong>
                  </span>
                </div>

                <div>
                  <span className="text-stone-500 block text-[11px]">Ibu Kandung:</span>
                  <span className="font-bold text-stone-900">{parent.motherName}</span>
                  <span className="text-stone-500 block text-[10px]">
                    Status: {parent.motherStatus} · {parent.motherJob || '-'}
                  </span>
                  <span className="text-stone-700 block text-[10px]">
                    Penghasilan: <strong>{parent.motherIncome}</strong>
                  </span>
                </div>

                <div>
                  <span className="text-stone-500 block text-[11px]">Kontak WhatsApp:</span>
                  <span className="font-mono block">Ayah: {parent.fatherPhone || '-'}</span>
                  <span className="font-mono block">Ibu: {parent.motherPhone || '-'}</span>
                  {parent.hasGuardian && (
                    <span className="text-[10px] text-stone-600 block pt-1">
                      Wali: {parent.guardianName} ({parent.guardianRelation})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Residence Preview */}
            <div className="p-4 rounded-xl bg-[#F7F8F5] border border-stone-200">
              <div className="flex items-center justify-between mb-3 border-b border-stone-200 pb-2">
                <h4 className="font-bold text-[#123B35] text-sm flex items-center gap-1.5">
                  <Home className="w-4 h-4 text-[#D5AA53]" />
                  <span>3. Data Tempat Tinggal Calon Siswa</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-xs text-emerald-800 font-semibold hover:underline cursor-pointer"
                >
                  Ubah Data
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                <div>
                  <span className="text-stone-500 block text-[11px]">Bertempat Tinggal Dengan:</span>
                  <span className="font-bold text-stone-900">
                    {residence.livingWith} {residence.livingWith === 'Lainnya' ? `(${residence.livingWithOtherNote})` : ''}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-stone-500 block text-[11px]">Alamat Domisili:</span>
                  <span>
                    {residence.currentAddress}, RT {residence.rtRw}, {residence.village}, {residence.district}, {residence.regency}, {residence.province}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Status Rumah / Kendaraan:</span>
                  <span>
                    {residence.houseStatus} · {residence.vehicleCount} Kendaraan
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Proof Preview */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-300">
              <div className="flex items-center justify-between mb-3 border-b border-amber-200 pb-2">
                <h4 className="font-bold text-[#123B35] text-sm flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#D5AA53]" />
                  <span>4. Bukti Pembayaran Biaya Pendaftaran Resmi</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="text-xs text-emerald-800 font-semibold hover:underline cursor-pointer"
                >
                  Ubah Bukti
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                <div>
                  <span className="text-stone-500 block text-[11px]">Metode Pembayaran:</span>
                  <span className="font-bold text-stone-900">{paymentProofForm.method}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Nominal Resmi:</span>
                  <span className="font-mono font-bold text-emerald-800">Rp 50.000,-</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Tanggal Bayar / Penyetor:</span>
                  <span>{paymentProofForm.paymentDate} · {paymentProofForm.senderName}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Berkas Bukti Bayar:</span>
                  <span className="font-medium text-emerald-900 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{paymentProofForm.fileName || 'Bukti_Bayar.jpg'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Checkbox Agreement */}
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-800">
                <input
                  type="checkbox"
                  checked={agreementChecked}
                  onChange={e => setAgreementChecked(e.target.checked)}
                  className="mt-0.5 rounded text-[#123B35] focus:ring-[#123B35] cursor-pointer"
                />
                <span>
                  Saya menyatakan dengan sesungguhnya bahwa seluruh data yang diisikan dalam formulir pendaftaran ini, termasuk data tempat tinggal dan bukti pembayaran biaya pendaftaran Rp50.000,- adalah benar, sah, dan dapat dipertanggungjawabkan sesuai ketentuan panitia SPMB SDIT Insan Cendikia Kalibaru.
                </span>
              </label>
            </div>

            <div className="pt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-stone-100 mt-6">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="w-full sm:w-auto px-4 py-2.5 border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-50 flex items-center justify-center gap-1 cursor-pointer min-h-[44px]"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting || !agreementChecked}
                onClick={handleFinalSubmit}
                className="w-full sm:w-auto px-8 py-3 bg-[#123B35] hover:bg-[#1a544b] text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
              >
                <Send className="w-4 h-4 text-[#D5AA53]" />
                <span>{isSubmitting ? 'Mengirim Pendaftaran...' : 'Kirim Pendaftaran Resmi'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 6: BUKTI PENDAFTARAN RESMI DENGAN 9 URUTAN LENGKAP & GRUP WHATSAPP */}
      {/* ========================================================================= */}
      {currentStep === 6 && submittedRegistration && (
        <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-8 md:p-10 shadow-lg text-center space-y-6">
          {/* 1. NOTIFIKASI PENDAFTARAN BERHASIL */}
          <div className="space-y-3">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700 shadow-sm border border-emerald-200">
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
              <Check className="w-3.5 h-3.5" />
              <span>Pendaftaran Berhasil Disimpan</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif leading-tight">
              Alhamdulillah, Pendaftaran Berhasil Dikirim!
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
              Data formulir calon siswa baru dan bukti pembayaran resmi biaya pendaftaran Rp50.000,- telah tersimpan dalam sistem SPMB {schoolProfile.name}.
            </p>
          </div>

          {/* KARTU INFORMASI BUKTI PENDAFTARAN (URUTAN 2, 3, 4, 5) */}
          <div className="max-w-xl mx-auto w-full bg-[#F7F8F5] border-2 border-[#123B35]/20 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 text-left">
            {/* 2. NOMOR PENDAFTARAN */}
            <div className="pb-3 border-b border-stone-200 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                2. Nomor Pendaftaran Resmi
              </span>
              <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[#123B35]/30 rounded-xl shadow-xs">
                <span className="text-2xl sm:text-3xl font-mono font-black text-[#123B35] tracking-wider">
                  {submittedRegistration.registrationNumber}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(submittedRegistration.registrationNumber);
                    setCopiedRegNumber(true);
                    setTimeout(() => setCopiedRegNumber(false), 2000);
                  }}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                  title="Salin nomor pendaftaran"
                >
                  {copiedRegNumber ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-[11px] text-stone-500 pt-1">
                Status Verifikasi: <span className="text-amber-700 font-bold">Menunggu Verifikasi Berkas & Pembayaran</span>
              </div>
            </div>

            {/* 3. NAMA CALON SISWA */}
            <div className="bg-white p-3.5 rounded-xl border border-stone-200">
              <span className="text-[11px] font-medium text-stone-500 block">
                3. Nama Calon Siswa
              </span>
              <span className="text-base sm:text-lg font-bold text-stone-900 block pt-0.5">
                {submittedRegistration.student?.fullName || student.fullName}
              </span>
              {submittedRegistration.student?.nickname && (
                <span className="text-xs text-stone-500">
                  Nama Panggilan: <strong>{submittedRegistration.student.nickname}</strong>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 4. GELOMBANG PENDAFTARAN */}
              <div className="bg-white p-3.5 rounded-xl border border-stone-200">
                <span className="text-[11px] font-medium text-stone-500 block">
                  4. Gelombang Pendaftaran
                </span>
                <span className="text-sm sm:text-base font-bold text-[#123B35] block pt-0.5">
                  {submittedRegistration.waveName || 'Gelombang 1'}
                </span>
              </div>

              {/* 5. TANGGAL PENDAFTARAN */}
              <div className="bg-white p-3.5 rounded-xl border border-stone-200">
                <span className="text-[11px] font-medium text-stone-500 block">
                  5. Tanggal Pendaftaran
                </span>
                <span className="text-sm sm:text-base font-semibold text-stone-800 block pt-0.5">
                  {formatDateId(submittedRegistration.submittedAt || new Date().toISOString())}
                </span>
              </div>
            </div>
          </div>

          {/* AKSI CETAK & UNDUH PDF (URUTAN 6 & 7) */}
          <div className="max-w-xl mx-auto w-full space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block text-center">
              Dokumen Bukti Pendaftaran
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 6. TOMBOL UNDUH BUKTI PENDAFTARAN PDF */}
              <button
                type="button"
                onClick={handleDownloadReceiptPdf}
                disabled={isDownloadingPdf}
                className="w-full px-4 py-3.5 bg-[#174C80] hover:bg-[#2065AA] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[46px]"
                title="Unduh berkas PDF bukti pendaftaran resmi"
              >
                {isDownloadingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#D5AA53]" />
                ) : (
                  <Download className="w-4 h-4 text-[#D5AA53]" />
                )}
                <span>{isDownloadingPdf ? 'Membuat PDF...' : 'Unduh Bukti Pendaftaran (PDF)'}</span>
              </button>

              {/* 7. TOMBOL CETAK BUKTI PENDAFTARAN */}
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="w-full px-4 py-3.5 bg-[#123B35] hover:bg-[#1a544b] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
                title="Cetak langsung bukti pendaftaran lewat printer"
              >
                <Printer className="w-4 h-4 text-[#D5AA53]" />
                <span>Cetak Bukti Pendaftaran</span>
              </button>
            </div>
          </div>

          {/* URUTAN 8 & 9: GRUP WHATSAPP RESMI SPMB */}
          {whatsAppGroup?.isActive && Boolean((whatsAppGroup.inviteLink || whatsAppGroup.groupLink)?.trim()) && (
            <div className="max-w-xl mx-auto w-full bg-linear-to-b from-[#F0FDF4] to-[#E6F9EE] border-2 border-[#25D366] rounded-2xl p-5 sm:p-6 shadow-md text-left space-y-4">
              {/* 8. INFORMASI AJAKAN BERGABUNG KE GRUP WHATSAPP */}
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <WhatsAppIcon className="w-6 h-6 fill-white" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                      {whatsAppGroup.groupName || 'Grup WhatsApp Resmi SPMB'}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-full text-[10px] font-bold">
                      Resmi SDIT
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-normal">
                    {whatsAppGroup.infoMessage ||
                      'Terima kasih telah mendaftar di SDIT INSAN CENDIKIA KALIBARU. Silakan bergabung dengan Grup WhatsApp Resmi SPMB untuk memperoleh informasi terbaru mengenai tahapan dan proses penerimaan siswa baru.'}
                  </p>
                </div>
              </div>

              {/* 9. TOMBOL GABUNG GRUP WHATSAPP SPMB */}
              <a
                href={(whatsAppGroup.inviteLink || whatsAppGroup.groupLink || '').trim()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1da850] text-white font-black text-sm sm:text-base rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer text-center tracking-wide"
                title="Buka tautan undangan Grup WhatsApp resmi SPMB di tab baru"
              >
                <WhatsAppIcon className="w-5 h-5 fill-white shrink-0" />
                <span>GABUNG GRUP WHATSAPP SPMB</span>
                <ExternalLink className="w-4 h-4 text-emerald-100 shrink-0" />
              </a>
            </div>
          )}

          {/* Petunjuk Penting Tambahan Untuk Wali Murid */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-stone-800 text-xs text-left space-y-2 max-w-xl mx-auto">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Petunjuk Penting Untuk Orang Tua / Wali:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-stone-700 text-[11px]">
              <li>
                <strong>Simpan Nomor Pendaftaran ({submittedRegistration.registrationNumber})</strong> dan <strong>Tanggal Lahir ({submittedRegistration.student?.birthDate || student.birthDate})</strong> ananda.
              </li>
              <li>
                Gunakan nomor pendaftaran tersebut pada menu <strong>"Cek Status Pendaftaran"</strong> untuk memantau status verifikasi berkas, observasi kesiapan belajar, dan pengumuman.
              </li>
              <li>
                Panitia SPMB akan memverifikasi berkas dan bukti pembayaran dalam waktu 1-2 hari kerja.
              </li>
            </ul>
          </div>

          {/* Navigasi Lanjutan */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto">
            {onNavigateToCheckStatus && (
              <button
                type="button"
                onClick={() => onNavigateToCheckStatus(submittedRegistration.registrationNumber)}
                className="w-full sm:w-auto px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4 text-[#174C80]" />
                <span>Cek Status Pendaftaran Sekarang</span>
              </button>
            )}

            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="w-full sm:w-auto px-6 py-2.5 border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Kembali ke Beranda SPMB</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Off-screen Rendered Receipt for instantaneous PDF Generation */}
      {submittedRegistration && (
        <div
          aria-hidden="true"
          className="fixed -left-[99999px] top-0 pointer-events-none opacity-0 overflow-hidden w-[820px]"
        >
          <RegistrationReceipt
            registration={submittedRegistration}
            schoolProfile={schoolProfile}
          />
        </div>
      )}

      {/* Printable Receipt Modal */}
      {showReceiptModal && submittedRegistration && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowReceiptModal(false);
          }}
        >
          <div className="w-full max-w-3xl my-auto">
            <RegistrationReceipt
              registration={submittedRegistration}
              schoolProfile={schoolProfile}
              onClose={() => setShowReceiptModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
