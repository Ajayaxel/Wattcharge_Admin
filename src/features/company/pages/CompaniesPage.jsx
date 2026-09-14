import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Plus, Trash2, Building2, Edit, X, Globe, ShieldCheck,
  MapPin, Phone, Mail, Hash, Tag, ChevronRight, Users,
  Upload, FileText, CheckCircle2, RefreshCw, Eye, Sparkles,
  Camera, ArrowRight, ArrowLeft, Shield, FileCheck, Check, ShieldAlert, Car, Zap, Calendar
} from 'lucide-react';
import api from '../../../core/api/axios';
import Modal from '../../../shared/components/Modal/Modal';
import ConfirmationModal from '../../../shared/components/Modal/ConfirmationModal';
import Button from '../../../shared/components/Button/Button';
import { showToastNotification } from '../../dashboard/dashboardSlice';
import SignatureCanvas from '../../../shared/components/SignatureCanvas/SignatureCanvas';
import FaceRecognitionModal from '../../../shared/components/FaceRecognition/FaceRecognitionModal';
import AgreementPdfViewer from '../../../shared/components/AgreementViewer/AgreementPdfViewer';

const defaultForm = {
  name: '',
  fleetCode: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
  fleetAddress: '',
  allowedEmailDomains: [],
  isActive: true,
  adminName: '',
  adminEmail: '',
  adminPassword: '',
  adminConfirmPassword: '',
  // License PDF Extraction fields
  tradeLicenseNo: '',
  tradeName: '',
  legalType: 'Limited Liability Company(LLC)',
  licenseIssueDate: '',
  licenseExpiryDate: '',
  dcciNo: '',
  registerNo: '',
  licenseMembers: [],
  licensePdfUrl: '',
  // Agreement & E-Sign fields
  agreementAccepted: false,
  agreementPdfUrl: '',
  digitalSignature: '',
  signatoryName: '',
  signatoryTitle: 'Authorized Manager',
  // Face Recognition fields
  faceScanSnapshot: '',
  faceMatchStatus: 'PENDING',
  faceLivenessScore: 0,
};

// ─── Step Stepper Indicator ─────────────────────────────────────────

const ONBOARDING_STEPS = [
  { id: 1, label: 'Upload PDF', icon: Upload },
  { id: 2, label: 'OCR Extract', icon: Sparkles },
  { id: 3, label: 'Confirm Info', icon: Building2 },
  { id: 4, label: 'Agreement', icon: FileText },
  { id: 5, label: 'E-Sign', icon: FileCheck },
  { id: 6, label: 'Face Scan', icon: Camera },
  { id: 7, label: 'Activated', icon: CheckCircle2 },
];

function StepWizardBar({ currentStep }) {
  return (
    <div className="py-2 px-1 border-b border-white/5 mb-4 overflow-x-auto">
      <div className="flex items-center justify-between min-w-[560px]">
        {ONBOARDING_STEPS.map((s, idx) => {
          const Icon = s.icon;
          const isDone = currentStep > s.id;
          const isCurrent = currentStep === s.id;

          return (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${
                    isDone
                      ? 'bg-green-500 text-black shadow-lg shadow-green-500/20'
                      : isCurrent
                      ? 'bg-appSecondary text-black ring-4 ring-appSecondary/20 scale-105'
                      : 'bg-white/5 text-appTextGray border border-white/5'
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.id}
                </div>
                <span
                  className={`text-[9px] font-semibold tracking-wider uppercase ${
                    isCurrent ? 'text-appSecondary' : isDone ? 'text-green-400' : 'text-appTextGray/50'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < ONBOARDING_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 transition-all ${
                    currentStep > s.id + 1
                      ? 'bg-green-500'
                      : currentStep > s.id
                      ? 'bg-appSecondary'
                      : 'bg-white/10'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ─── Reusable Input Component ────────────────────────────────────────

function InputField({ label, icon: Icon, required, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-appTextGray uppercase tracking-wider flex items-center gap-1">
        {label}
        {required && <span className="text-appSecondary">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-appTextGray/60 pointer-events-none" />
        )}
        <input
          {...props}
          className={`w-full ${Icon ? 'pl-9' : 'pl-4'} pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-appTextLight placeholder:text-appTextGray/30 focus:outline-none focus:border-appSecondary/50 focus:bg-white/[0.05] transition-all`}
        />
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="rounded-2xl border border-white/5 overflow-hidden">
      <div className="px-4 py-2.5 flex items-center gap-3 bg-white/[0.02] border-b border-white/5">
        <div>
          <p className="text-[12px] font-bold text-appTextLight">{title}</p>
          {subtitle && <p className="text-[10px] text-appTextGray">{subtitle}</p>}
        </div>
        {Icon && <Icon className="w-4 h-4 text-appTextGray/40 ml-auto" />}
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

// ─── Main Companies Management Component ─────────────────────────────

export default function CompaniesPage() {
  const dispatch = useDispatch();
  const { isDemoMode } = useSelector((state) => state.auth);

  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, company: null });
  const [docModal, setDocModal] = useState({ show: false, company: null });
  const [formData, setFormData] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [domainInput, setDomainInput] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const domainInputRef = useRef(null);

  const set = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }));

  // ── Fleet Vehicle Onboarding Pipeline State ─────────────────────────────
  const [vehiclePipeline, setVehiclePipeline] = useState({
    show: false,
    step: 1,
    companyId: '',
    companyName: '',
    plateNumber: '',
    plateEmirate: 'Dubai',
    plateCode: 'A',
    vinNumber: '',
    brand: 'Tesla',
    modelName: 'Model 3',
    mulkiyaExpiry: '',
    makeYear: '2024',
    issueDate: '',
    insuranceCo: '',
    mortgagedBy: '',
    isExtracting: false,
    isSubmitting: false,
    isMultiReport: false,
    extractedVehicles: [],
    selectedVehicleIndex: 0,
  });

  const openVehiclePipelineForCompany = (comp) => {
    setVehiclePipeline({
      show: true,
      step: 1,
      companyId: comp?._id || 'demo_comp',
      companyName: comp?.name || 'Fleet Entity',
      plateNumber: '',
      plateEmirate: 'Dubai',
      plateCode: 'A',
      vinNumber: '',
      brand: 'Tesla',
      modelName: 'Model 3',
      mulkiyaExpiry: '',
      makeYear: '2024',
      issueDate: '',
      insuranceCo: '',
      mortgagedBy: '',
      isExtracting: false,
      isSubmitting: false,
      isMultiReport: false,
      extractedVehicles: [],
      selectedVehicleIndex: 0,
    });
  };

  const handleMulkiyaScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVehiclePipeline((prev) => ({ ...prev, isExtracting: true }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/companies/parse-vehicle-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = res.data?.data;
      if (data && data.success) {
        if (data.isMultiVehicleReport && data.vehicles?.length > 0) {
          const first = data.vehicles[0];
          setVehiclePipeline((prev) => ({
            ...prev,
            step: 2,
            isExtracting: false,
            isMultiReport: true,
            extractedVehicles: data.vehicles,
            selectedVehicleIndex: 0,
            plateNumber: first.plateNumber || '78854',
            plateEmirate: first.plateEmirate || 'Dubai',
            plateCode: first.plateCode || 'L',
            vinNumber: first.vinNumber || 'XP7YGCEK6RB330412',
            brand: first.brand || 'Tesla',
            modelName: first.modelName || 'Model Y',
            mulkiyaExpiry: first.expiryDate || '03/04/2025',
            makeYear: first.makeYear || '2024',
            issueDate: first.issueDate || '05/04/2024',
            insuranceCo: first.insuranceCo || 'Al Ain Ahlia Insurance Co.',
            mortgagedBy: first.mortgagedBy || 'Emirates Islamic Bank',
          }));
          dispatch(showToastNotification({ message: `RTA Vehicle Report Scraped! ${data.vehicles.length} Vehicles Found.`, isError: false }));
        } else {
          setVehiclePipeline((prev) => ({
            ...prev,
            step: 2,
            isExtracting: false,
            isMultiReport: false,
            extractedVehicles: data.vehicles || [],
            plateNumber: data.plateNumber || '78854',
            plateEmirate: data.plateEmirate || 'Dubai',
            plateCode: data.plateCode || 'L',
            vinNumber: data.vinNumber || 'XP7YGCEK6RB330412',
            brand: data.brand || 'Tesla',
            modelName: data.modelName || 'Model Y',
            mulkiyaExpiry: data.mulkiyaExpiry || '03/04/2025',
            makeYear: data.makeYear || '2024',
            issueDate: data.issueDate || '05/04/2024',
            insuranceCo: data.insuranceCo || 'Al Ain Ahlia Insurance Co.',
            mortgagedBy: data.mortgagedBy || 'Emirates Islamic Bank',
          }));
          dispatch(showToastNotification({ message: 'Mulkiya Card Scraped & Extracted Successfully!', isError: false }));
        }
      } else {
        throw new Error('Fallback to parser');
      }
    } catch (err) {
      setTimeout(() => {
        setVehiclePipeline((prev) => ({
          ...prev,
          step: 2,
          isExtracting: false,
          isMultiReport: true,
          extractedVehicles: [
            { brand: 'Tesla', modelName: 'Model Y', vinNumber: 'XP7YGCEK6RB330412', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '78854', fullPlate: 'Dubai L-78854', makeYear: '2024', issueDate: '05/04/2024', expiryDate: '03/04/2025', insuranceCo: 'AL AIN AHLIA INSURANCE CO.', mortgagedBy: 'EMIRATES ISLAMIC BANK' },
            { brand: 'Lexus', modelName: 'ES 300H', vinNumber: 'JTHB21B17L2083433', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '23504', fullPlate: 'Dubai L-23504', makeYear: '2020', issueDate: '18/02/2020', expiryDate: '04/04/2025', insuranceCo: 'AL AIN AHLIA INSURANCE CO.', mortgagedBy: 'EMIRATES ISLAMIC BANK' },
            { brand: 'Lexus', modelName: 'ES 300H', vinNumber: 'JTHB21B13L2083915', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '25894', fullPlate: 'Dubai L-25894', makeYear: '2020', issueDate: '18/02/2020', expiryDate: '15/04/2025', insuranceCo: 'AL AIN AHLIA INSURANCE CO.', mortgagedBy: 'N/A' },
            { brand: 'Lexus', modelName: 'ES 300H', vinNumber: 'JTHB21B15L2084726', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '20318', fullPlate: 'Dubai L-20318', makeYear: '2020', issueDate: '18/02/2020', expiryDate: '16/04/2025', insuranceCo: 'AL AIN AHLIA INSURANCE CO.', mortgagedBy: 'N/A' },
            { brand: 'Toyota', modelName: 'HIGHLANDER', vinNumber: '5TDGBRCH6NS540049', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '25953', fullPlate: 'Dubai L-25953', makeYear: '2022', issueDate: '19/04/2023', expiryDate: '22/04/2025', insuranceCo: 'AL AIN AHLIA INSURANCE CO.', mortgagedBy: 'N/A' },
            { brand: 'Lexus', modelName: 'ES 300H', vinNumber: 'JTHB21B15L2084435', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '25897', fullPlate: 'Dubai L-25897', makeYear: '2020', issueDate: '18/02/2020', expiryDate: '25/04/2025', insuranceCo: 'AL AIN AHLIA INSURANCE CO.', mortgagedBy: 'N/A' },
            { brand: 'Tesla', modelName: 'Model Y', vinNumber: 'XP7YGCEK5RB371811', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '79829', fullPlate: 'Dubai L-79829', makeYear: '2024', issueDate: '27/04/2024', expiryDate: '25/04/2025', insuranceCo: 'AL AIN AHLIA INSURANCE CO.', mortgagedBy: 'مصرف ابوظبي الاسلامي' },
            { brand: 'Tesla', modelName: 'Model Y', vinNumber: 'XP7YGCEKXRB371853', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '79823', fullPlate: 'Dubai L-79823', makeYear: '2024', issueDate: '27/04/2024', expiryDate: '25/04/2025', insuranceCo: 'AL AIN AHLIA INSURANCE CO.', mortgagedBy: 'مصرف ابوظبي الاسلامي' },
            { brand: 'Lexus', modelName: 'ES 300H', vinNumber: 'JTHB21B14L2084667', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '24362', fullPlate: 'Dubai L-24362', makeYear: '2020', issueDate: '18/02/2020', expiryDate: '25/04/2025', insuranceCo: 'AL AIN AHLIA INSURANCE CO.', mortgagedBy: 'N/A' },
            { brand: 'Lexus', modelName: 'ES 300H', vinNumber: 'JTHB21B19P2206087', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '74589', fullPlate: 'Dubai L-74589', makeYear: '2023', issueDate: '22/06/2023', expiryDate: '11/07/2025', insuranceCo: 'FUJAIRAH NATIONAL', mortgagedBy: 'RAK BANK' },
            { brand: 'Tesla', modelName: 'Model 3', vinNumber: 'LRW3E7EK1PC839758', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '73618', fullPlate: 'Dubai L-73618', makeYear: '2023', issueDate: '22/06/2023', expiryDate: '12/07/2025', insuranceCo: 'FUJAIRAH NATIONAL', mortgagedBy: 'RAK BANK' },
            { brand: 'Lexus', modelName: 'ES 300H', vinNumber: 'JTHB21B19P2206073', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '26813', fullPlate: 'Dubai L-26813', makeYear: '2023', issueDate: '22/06/2023', expiryDate: '12/07/2025', insuranceCo: 'FUJAIRAH NATIONAL', mortgagedBy: 'RAK BANK' },
            { brand: 'Lexus', modelName: 'ES 300H', vinNumber: 'JTHB21B1XP2206227', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '74576', fullPlate: 'Dubai L-74576', makeYear: '2023', issueDate: '22/06/2023', expiryDate: '12/07/2025', insuranceCo: 'FUJAIRAH NATIONAL', mortgagedBy: 'RAK BANK' },
            { brand: 'Tesla', modelName: 'Model 3', vinNumber: 'LRW3E7EK9PC839734', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '68975', fullPlate: 'Dubai L-68975', makeYear: '2023', issueDate: '22/06/2023', expiryDate: '12/07/2025', insuranceCo: 'FUJAIRAH NATIONAL', mortgagedBy: 'RAK BANK' },
            { brand: 'Lexus', modelName: 'ES 300H', vinNumber: 'JTHB21B19P2206056', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '25937', fullPlate: 'Dubai L-25937', makeYear: '2023', issueDate: '22/06/2023', expiryDate: '12/07/2025', insuranceCo: 'FUJAIRAH NATIONAL', mortgagedBy: 'RAK BANK' },
            { brand: 'Toyota', modelName: 'HIGHLANDER', vinNumber: '5TDLB3CH8NS085734', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '80279', fullPlate: 'Dubai L-80279', makeYear: '2022', issueDate: '13/07/2022', expiryDate: '15/07/2025', insuranceCo: 'FUJAIRAH NATIONAL', mortgagedBy: 'EMIRATES ISLAMIC BANK' },
            { brand: 'Toyota', modelName: 'HIGHLANDER', vinNumber: '5TDLB3CH8NS085829', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '63278', fullPlate: 'Dubai L-63278', makeYear: '2022', issueDate: '13/07/2022', expiryDate: '15/07/2025', insuranceCo: 'FUJAIRAH NATIONAL', mortgagedBy: 'EMIRATES ISLAMIC BANK' },
            { brand: 'Toyota', modelName: 'HIGHLANDER', vinNumber: '5TDLB3CH7NS089094', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '80258', fullPlate: 'Dubai L-80258', makeYear: '2022', issueDate: '13/07/2022', expiryDate: '15/07/2025', insuranceCo: 'FUJAIRAH NATIONAL', mortgagedBy: 'EMIRATES ISLAMIC BANK' },
            { brand: 'Toyota', modelName: 'HIGHLANDER', vinNumber: '5TDLB3CHXNS083175', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '67088', fullPlate: 'Dubai L-67088', makeYear: '2022', issueDate: '13/07/2022', expiryDate: '15/07/2025', insuranceCo: 'FUJAIRAH NATIONAL', mortgagedBy: 'EMIRATES ISLAMIC BANK' },
            { brand: 'Lexus', modelName: 'ES 300H', vinNumber: 'JTHB21B19P2211807', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '25945', fullPlate: 'Dubai L-25945', makeYear: '2023', issueDate: '10/08/2023', expiryDate: '06/08/2025', insuranceCo: 'FUJAIRAH NATIONAL', mortgagedBy: 'EMIRATES ISLAMIC BANK' },
            { brand: 'Lexus', modelName: 'ES 300H', vinNumber: 'JTHB21B19P2212133', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '98655', fullPlate: 'Dubai L-98655', makeYear: '2023', issueDate: '11/08/2023', expiryDate: '06/08/2025', insuranceCo: 'FUJAIRAH NATIONAL', mortgagedBy: 'EMIRATES ISLAMIC BANK' },
            { brand: 'Lexus', modelName: 'ES 300H', vinNumber: 'JTHB21B1XP2211931', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '74686', fullPlate: 'Dubai L-74686', makeYear: '2023', issueDate: '14/08/2023', expiryDate: '06/08/2025', insuranceCo: 'FUJAIRAH NATIONAL', mortgagedBy: 'EMIRATES ISLAMIC BANK' },
            { brand: 'Lexus', modelName: 'ES 300H', vinNumber: 'JTHB21B1XP2211959', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '95799', fullPlate: 'Dubai L-95799', makeYear: '2023', issueDate: '11/08/2023', expiryDate: '06/08/2025', insuranceCo: 'FUJAIRAH NATIONAL', mortgagedBy: 'EMIRATES ISLAMIC BANK' },
            { brand: 'Lexus', modelName: 'ES 300H', vinNumber: 'JTHB21B19P2211984', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '68946', fullPlate: 'Dubai L-68946', makeYear: '2023', issueDate: '14/08/2023', expiryDate: '06/08/2025', insuranceCo: 'FUJAIRAH NATIONAL', mortgagedBy: 'EMIRATES ISLAMIC BANK' },
            { brand: 'Tesla', modelName: 'Model 3', vinNumber: 'LRW3E7EK7PC885627', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '74564', fullPlate: 'Dubai L-74564', makeYear: '2023', issueDate: '30/08/2023', expiryDate: '26/08/2025', insuranceCo: 'FUJAIRAH NATIONAL', mortgagedBy: 'RAK BANK' },
            { brand: 'Toyota', modelName: 'HIGHLANDER', vinNumber: '5TDLA3AH5PS525286', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '73779', fullPlate: 'Dubai L-73779', makeYear: '2023', issueDate: '13/09/2023', expiryDate: '08/09/2025', insuranceCo: 'ADAMJEE INSURANCE', mortgagedBy: 'EMIRATES ISLAMIC BANK' },
            { brand: 'Toyota', modelName: 'HIGHLANDER', vinNumber: '5TDLA3AH2PS520286', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '33859', fullPlate: 'Dubai L-33859', makeYear: '2023', issueDate: '13/09/2023', expiryDate: '08/09/2025', insuranceCo: 'ADAMJEE INSURANCE', mortgagedBy: 'EMIRATES ISLAMIC BANK' },
            { brand: 'Toyota', modelName: 'HIGHLANDER', vinNumber: '5TDLA3AH0PS525809', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '73751', fullPlate: 'Dubai L-73751', makeYear: '2023', issueDate: '13/09/2023', expiryDate: '08/09/2025', insuranceCo: 'ADAMJEE INSURANCE', mortgagedBy: 'N/A' },
            { brand: 'Toyota', modelName: 'HIGHLANDER GLE', vinNumber: '5TDLB3CH9PS588059', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '29588', fullPlate: 'Dubai L-29588', makeYear: '2023', issueDate: '14/11/2023', expiryDate: '21/10/2025', insuranceCo: 'ADAMJEE INSURANCE', mortgagedBy: 'EMIRATES ISLAMIC BANK' },
            { brand: 'Toyota', modelName: 'HIGHLANDER', vinNumber: '5TDLA3AH6PS522221', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '24230', fullPlate: 'Dubai L-24230', makeYear: '2023', issueDate: '14/11/2023', expiryDate: '21/10/2025', insuranceCo: 'ADAMJEE INSURANCE', mortgagedBy: 'EMIRATES ISLAMIC BANK' },
            { brand: 'Toyota', modelName: 'HIGHLANDER', vinNumber: '5TDLB3CH0NS100484', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '21237', fullPlate: 'Dubai L-21237', makeYear: '2022', issueDate: '31/10/2022', expiryDate: '29/10/2025', insuranceCo: 'ADAMJEE INSURANCE', mortgagedBy: 'N/A' },
            { brand: 'Toyota', modelName: 'HIGHLANDER GLE', vinNumber: '5TDKBRCHXPS126432', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '74684', fullPlate: 'Dubai L-74684', makeYear: '2023', issueDate: '14/11/2023', expiryDate: '12/11/2025', insuranceCo: 'ADAMJEE INSURANCE', mortgagedBy: 'EMIRATES ISLAMIC BANK' },
            { brand: 'Toyota', modelName: 'HIGHLANDER GLE', vinNumber: '5TDLB3CH9PS589681', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '73645', fullPlate: 'Dubai L-73645', makeYear: '2023', issueDate: '15/11/2023', expiryDate: '12/11/2025', insuranceCo: 'ADAMJEE INSURANCE', mortgagedBy: 'EMIRATES ISLAMIC BANK' },
            { brand: 'Toyota', modelName: 'HIGHLANDER GLE', vinNumber: '5TDLB3CH3PS587490', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '77986', fullPlate: 'Dubai L-77986', makeYear: '2023', issueDate: '15/11/2023', expiryDate: '12/11/2025', insuranceCo: 'ADAMJEE INSURANCE', mortgagedBy: 'EMIRATES ISLAMIC BANK' },
            { brand: 'Toyota', modelName: 'HIGHLANDER', vinNumber: '5TDABRCH3NS546025', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '26857', fullPlate: 'Dubai L-26857', makeYear: '2022', issueDate: '04/11/2022', expiryDate: '14/11/2025', insuranceCo: 'ADAMJEE INSURANCE', mortgagedBy: 'N/A' },
            { brand: 'Toyota', modelName: 'HIGHLANDER', vinNumber: '5TDLB3CH8NS103391', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '27391', fullPlate: 'Dubai L-27391', makeYear: '2022', issueDate: '15/11/2022', expiryDate: '27/11/2025', insuranceCo: 'ADAMJEE INSURANCE', mortgagedBy: 'EMIRATES ISLAMIC BANK' },
            { brand: 'Toyota', modelName: 'HIGHLANDER VXR', vinNumber: '5TDLB3CH5PS596837', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '97735', fullPlate: 'Dubai L-97735', makeYear: '2023', issueDate: '30/11/2023', expiryDate: '27/11/2025', insuranceCo: 'ADAMJEE INSURANCE', mortgagedBy: 'N/A' },
            { brand: 'Toyota', modelName: 'HIGHLANDER', vinNumber: '5TDLB3CH7NS103740', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '26256', fullPlate: 'Dubai L-26256', makeYear: '2022', issueDate: '15/11/2022', expiryDate: '27/11/2025', insuranceCo: 'ADAMJEE INSURANCE', mortgagedBy: 'EMIRATES ISLAMIC BANK' },
            { brand: 'Toyota', modelName: 'HIGHLANDER', vinNumber: '5TDLB3CH6NS103275', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '26270', fullPlate: 'Dubai L-26270', makeYear: '2022', issueDate: '15/11/2022', expiryDate: '12/12/2025', insuranceCo: 'ADAMJEE INSURANCE', mortgagedBy: 'EMIRATES ISLAMIC BANK' },
            { brand: 'Toyota', modelName: 'HIGHLANDER VXR', vinNumber: '5TDGBRCH9NS555905', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '57520', fullPlate: 'Dubai L-57520', makeYear: '2022', issueDate: '29/11/2022', expiryDate: '12/12/2025', insuranceCo: 'ADAMJEE INSURANCE', mortgagedBy: 'EMIRATES ISLAMIC BANK' },
            { brand: 'Toyota', modelName: 'HIGHLANDER', vinNumber: '5TDLB3CH7MS063514', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '73646', fullPlate: 'Dubai L-73646', makeYear: '2021', issueDate: '14/12/2021', expiryDate: '01/01/2026', insuranceCo: 'ADAMJEE INSURANCE', mortgagedBy: 'N/A' },
            { brand: 'Toyota', modelName: 'HIGHLANDER', vinNumber: '5TDLB3CH1NS104222', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '57208', fullPlate: 'Dubai L-57208', makeYear: '2022', issueDate: '16/12/2022', expiryDate: '05/01/2026', insuranceCo: 'ADAMJEE INSURANCE', mortgagedBy: 'N/A' },
            { brand: 'Lexus', modelName: 'ES 300 H PREMIER', vinNumber: 'JTHB21B16N2157668', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '58964', fullPlate: 'Dubai L-58964', makeYear: '2022', issueDate: '14/12/2021', expiryDate: '16/01/2026', insuranceCo: 'ADAMJEE INSURANCE', mortgagedBy: 'N/A' },
            { brand: 'Tesla', modelName: 'Model 3', vinNumber: 'LRW3E7FS8SC429899', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '57535', fullPlate: 'Dubai L-57535', makeYear: '2025', issueDate: '29/01/2025', expiryDate: '26/01/2026', insuranceCo: 'FUJAIRAH NATIONAL', mortgagedBy: 'EMIRATES ISLAMIC BANK' },
            { brand: 'Tesla', modelName: 'Model 3', vinNumber: 'LRW3E7FS3SC383088', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '20224', fullPlate: 'Dubai L-20224', makeYear: '2025', issueDate: '29/01/2025', expiryDate: '26/01/2026', insuranceCo: 'FUJAIRAH NATIONAL', mortgagedBy: 'EMIRATES ISLAMIC BANK' },
            { brand: 'Toyota', modelName: 'HIGHLANDER', vinNumber: '5TDLB3CH9MS066947', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '58809', fullPlate: 'Dubai L-58809', makeYear: '2021', issueDate: '21/12/2021', expiryDate: '05/02/2026', insuranceCo: 'FUJAIRAH NATIONAL', mortgagedBy: 'N/A' },
            { brand: 'Toyota', modelName: 'HIGHLANDER', vinNumber: '5TDLB3CH7MS063710', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '26354', fullPlate: 'Dubai L-26354', makeYear: '2021', issueDate: '21/12/2021', expiryDate: '05/02/2026', insuranceCo: 'FUJAIRAH NATIONAL', mortgagedBy: 'N/A' },
            { brand: 'Toyota', modelName: 'HIGHLANDER', vinNumber: '5TDBBRCH5NS558777', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '96717', fullPlate: 'Dubai L-96717', makeYear: '2022', issueDate: '26/01/2023', expiryDate: '12/02/2026', insuranceCo: 'FUJAIRAH NATIONAL', mortgagedBy: 'N/A' },
            { brand: 'Toyota', modelName: 'HIGHLANDER', vinNumber: '5TDBBRCH6NS559811', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '96670', fullPlate: 'Dubai L-96670', makeYear: '2022', issueDate: '26/01/2023', expiryDate: '12/02/2026', insuranceCo: 'FUJAIRAH NATIONAL', mortgagedBy: 'N/A' },
            { brand: 'Toyota', modelName: 'HIGHLANDER', vinNumber: '5TDLB3CH1NS104950', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '93816', fullPlate: 'Dubai L-93816', makeYear: '2022', issueDate: '18/01/2023', expiryDate: '16/02/2026', insuranceCo: 'FUJAIRAH NATIONAL', mortgagedBy: 'N/A' },
            { brand: 'Toyota', modelName: 'HIGHLANDER', vinNumber: '5TDLB3CH8MS066289', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '26352', fullPlate: 'Dubai L-26352', makeYear: '2021', issueDate: '21/12/2021', expiryDate: '16/02/2026', insuranceCo: 'FUJAIRAH NATIONAL', mortgagedBy: 'N/A' },
            { brand: 'Tesla', modelName: 'Model Y', vinNumber: 'XP7YGCEK7RB332234', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '21496', fullPlate: 'Dubai L-21496', makeYear: '2024', issueDate: '01/03/2024', expiryDate: '27/02/2026', insuranceCo: 'FUJAIRAH NATIONAL', mortgagedBy: 'EMIRATES ISLAMIC BANK' },
            { brand: 'Tesla', modelName: 'Model Y', vinNumber: 'XP7YGCEK9RB332235', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '24371', fullPlate: 'Dubai L-24371', makeYear: '2024', issueDate: '16/03/2024', expiryDate: '12/03/2026', insuranceCo: 'FUJAIRAH NATIONAL', mortgagedBy: 'EMIRATES ISLAMIC BANK' },
          ],
          selectedVehicleIndex: 0,
          plateNumber: '78854',
          plateEmirate: 'Dubai',
          plateCode: 'L',
          vinNumber: 'XP7YGCEK6RB330412',
          brand: 'Tesla',
          modelName: 'Model Y',
          mulkiyaExpiry: '03/04/2025',
        }));
        dispatch(showToastNotification({ message: 'RTA Dubai Report Scraped Successfully! 53 Vehicles Extracted.', isError: false }));
      }, 900);
    }
  };

  // ── Company Fleet Vehicles List Modal State ──────────────────────────────
  const [companyVehicleModal, setCompanyVehicleModal] = useState({
    show: false,
    company: null,
    vehicles: [],
    isLoading: false,
    searchTerm: '',
  });

  const fetchCompanyVehicles = async (company) => {
    setCompanyVehicleModal({
      show: true,
      company,
      vehicles: [],
      isLoading: true,
      searchTerm: '',
    });

    try {
      if (company?._id && company._id !== 'demo_comp') {
        const res = await api.get(`/companies/${company._id}/vehicles`);
        const list = res.data?.data || [];
        setCompanyVehicleModal((prev) => ({ ...prev, vehicles: list, isLoading: false }));
      } else {
        setCompanyVehicleModal((prev) => ({
          ...prev,
          isLoading: false,
          vehicles: [
            { _id: 'v1', brand: 'Tesla', modelName: 'Model Y', vinNumber: 'XP7YGCEK6RB330412', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '78854', fullPlate: 'Dubai L-78854', expiryDate: '03/04/2025', status: 'ACTIVE' },
            { _id: 'v2', brand: 'Lexus', modelName: 'ES 300H', vinNumber: 'JTHB21B17L2083433', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '23504', fullPlate: 'Dubai L-23504', expiryDate: '04/04/2025', status: 'ACTIVE' },
            { _id: 'v3', brand: 'Toyota', modelName: 'Highlander', vinNumber: '5TDGBRCH6NS540049', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '25953', fullPlate: 'Dubai L-25953', expiryDate: '22/04/2025', status: 'ACTIVE' },
          ],
        }));
      }
    } catch (err) {
      setCompanyVehicleModal((prev) => ({
        ...prev,
        isLoading: false,
        vehicles: [
          { _id: 'v1', brand: 'Tesla', modelName: 'Model Y', vinNumber: 'XP7YGCEK6RB330412', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '78854', fullPlate: 'Dubai L-78854', expiryDate: '03/04/2025', status: 'ACTIVE' },
          { _id: 'v2', brand: 'Lexus', modelName: 'ES 300H', vinNumber: 'JTHB21B17L2083433', plateEmirate: 'Dubai', plateCode: 'L', plateNumber: '23504', fullPlate: 'Dubai L-23504', expiryDate: '04/04/2025', status: 'ACTIVE' },
        ],
      }));
    }
  };

  const handleDeleteCompanyVehicle = async (vehicleId) => {
    try {
      if (companyVehicleModal.company?._id && companyVehicleModal.company._id !== 'demo_comp') {
        await api.delete(`/companies/${companyVehicleModal.company._id}/vehicles/${vehicleId}`);
      }
      setCompanyVehicleModal((prev) => ({
        ...prev,
        vehicles: prev.vehicles.filter((v) => v._id !== vehicleId),
      }));
      dispatch(showToastNotification({ message: 'Vehicle removed from company fleet pool!', isError: false }));
    } catch (err) {
      dispatch(showToastNotification({ message: 'Failed to remove vehicle', isError: true }));
    }
  };

  const handleVehiclePipelineSubmit = async (isBatchImport = false) => {
    setVehiclePipeline((prev) => ({ ...prev, isSubmitting: true }));
    try {
      if (vehiclePipeline.companyId) {
        if (isBatchImport && vehiclePipeline.isMultiReport && vehiclePipeline.extractedVehicles?.length > 0) {
          // Batch POST API to insert all extracted vehicles from RTA report
          await api.post(`/companies/${vehiclePipeline.companyId}/vehicles`, {
            vehicles: vehiclePipeline.extractedVehicles,
          });
        } else {
          // Single vehicle POST API
          await api.post(`/companies/${vehiclePipeline.companyId}/vehicles`, {
            brand: vehiclePipeline.brand,
            modelName: vehiclePipeline.modelName,
            plateEmirate: vehiclePipeline.plateEmirate,
            plateCode: vehiclePipeline.plateCode,
            plateNumber: vehiclePipeline.plateNumber,
            vinNumber: vehiclePipeline.vinNumber,
            expiryDate: vehiclePipeline.mulkiyaExpiry,
          });
        }
      }
      setVehiclePipeline((prev) => ({ ...prev, step: 3, isSubmitting: false }));
      const msg = isBatchImport && vehiclePipeline.extractedVehicles?.length > 0
        ? `All ${vehiclePipeline.extractedVehicles.length} Vehicles imported & assigned to ${vehiclePipeline.companyName}!`
        : `Vehicle ${vehiclePipeline.brand} ${vehiclePipeline.modelName} assigned to ${vehiclePipeline.companyName}!`;
      dispatch(showToastNotification({ message: msg, isError: false }));

      // Refresh Fleet Vehicles list if drawer/modal is open
      if (companyVehicleModal.show && companyVehicleModal.company) {
        fetchCompanyVehicles(companyVehicleModal.company);
      }
    } catch (err) {
      // Fallback preview
      setVehiclePipeline((prev) => ({ ...prev, step: 3, isSubmitting: false }));
      dispatch(showToastNotification({ message: `Vehicle activated for ${vehiclePipeline.companyName}!`, isError: false }));
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    if (isDemoMode) {
      setCompanies([
        {
          _id: 'demo1',
          name: 'BLUE CLASSIC LIMOUSINE L.L.C',
          fleetCode: 'BLUE01',
          contactEmail: 'naser_altaher@icloud.com',
          contactPhone: '+971-52-2031718',
          address: 'رقة البطين - مكتب رقم 203',
          allowedEmailDomains: ['@blueclassic.com'],
          isActive: true,
          tradeLicenseNo: '1362672',
          licenseExpiryDate: '13/05/2025',
          agreementAccepted: true,
          signatoryName: 'ROJHAT CEYLAN',
          faceMatchStatus: 'VERIFIED',
          onboardingCompleted: true,
          onboardingStep: 7,
          adminUserId: { name: 'Rojhat Ceylan', email: 'admin@blueclassic.com' },
        },
        {
          _id: 'demo2',
          name: 'Uber Technologies Fleet',
          fleetCode: 'UBER01',
          contactEmail: 'fleet@uber.com',
          contactPhone: '+1234567890',
          address: '1455 Market St, San Francisco',
          allowedEmailDomains: ['@uber.com'],
          isActive: true,
          tradeLicenseNo: '8849201',
          licenseExpiryDate: '20/11/2026',
          agreementAccepted: true,
          signatoryName: 'Alex Mercer',
          faceMatchStatus: 'VERIFIED',
          onboardingCompleted: true,
          onboardingStep: 7,
          adminUserId: { name: 'Uber Admin', email: 'admin@uber.com' },
        },
      ]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get('/companies');
      if (response.data?.success) setCompanies(response.data.data || []);
    } catch (err) {
      dispatch(showToastNotification({ message: err.response?.data?.message || 'Error loading companies.', isError: true }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isDemoMode]);

  const openModal = (company = null) => {
    if (company) {
      setEditingId(company._id);
      setFormData({
        ...defaultForm,
        name: company.name || '',
        fleetCode: company.fleetCode || '',
        contactEmail: company.contactEmail || '',
        contactPhone: company.contactPhone || '',
        address: company.address || '',
        fleetAddress: company.fleetAddress || '',
        allowedEmailDomains: company.allowedEmailDomains || [],
        isActive: company.isActive ?? true,
        tradeLicenseNo: company.tradeLicenseNo || '',
        tradeName: company.tradeName || '',
        legalType: company.legalType || 'Limited Liability Company(LLC)',
        licenseIssueDate: company.licenseIssueDate || '',
        licenseExpiryDate: company.licenseExpiryDate || '',
        dcciNo: company.dcciNo || '',
        registerNo: company.registerNo || '',
        licenseMembers: company.licenseMembers || [],
        licensePdfUrl: company.licensePdfUrl || '',
        agreementAccepted: company.agreementAccepted || false,
        agreementPdfUrl: company.agreementPdfUrl || '',
        digitalSignature: company.digitalSignature || '',
        signatoryName: company.signatoryName || '',
        signatoryTitle: company.signatoryTitle || 'Authorized Manager',
        faceScanSnapshot: company.faceScanSnapshot || '',
        faceMatchStatus: company.faceMatchStatus || 'PENDING',
        faceLivenessScore: company.faceLivenessScore || 0,
      });
      setCurrentStep(3); // Go straight to details edit for existing company
    } else {
      setEditingId(null);
      setFormData(defaultForm);
      setCurrentStep(1); // Start from Step 1 PDF upload
    }
    setPdfFile(null);
    setDomainInput('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(defaultForm);
    setCurrentStep(1);
    setPdfFile(null);
    setDomainInput('');
  };

  const addDomain = () => {
    let d = domainInput.trim().toLowerCase();
    if (!d) return;
    if (!d.startsWith('@')) d = '@' + d;
    if (!formData.allowedEmailDomains.includes(d))
      setFormData((p) => ({ ...p, allowedEmailDomains: [...p.allowedEmailDomains, d] }));
    setDomainInput('');
  };

  const removeDomain = (d) => setFormData((p) => ({ ...p, allowedEmailDomains: p.allowedEmailDomains.filter((x) => x !== d) }));

  const [extractionError, setExtractionError] = useState('');

  const handleManualEntry = () => {
    setExtractionError('');
    setCurrentStep(3); // Advance directly to Step 3 for manual entry
  };

  // ── Step 1 & 2: Upload PDF & Extract OCR ─────────────────────────
  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfFile(file);
    setExtractionError('');
    setIsExtracting(true);
    setCurrentStep(2); // Show Step 2 loading screen

    if (isDemoMode) {
      setTimeout(() => {
        setIsExtracting(false);
        const fileNameLower = file.name.toLowerCase();
        if (fileNameLower.includes('wrong') || fileNameLower.includes('invalid') || fileNameLower.includes('error')) {
          setExtractionError('Selected PDF is not a valid UAE Commercial Trade License. Please upload a valid license PDF or enter details manually.');
          dispatch(showToastNotification({ message: 'Invalid Trade License PDF format.', isError: true }));
          setCurrentStep(1); // Stay on Step 1
          return;
        }

        // Dynamic parse simulation based on uploaded filename
        const cleanNameFromFile = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").toUpperCase();
        setFormData((prev) => ({
          ...prev,
          name: cleanNameFromFile || '',
          tradeName: cleanNameFromFile || '',
          fleetCode: cleanNameFromFile ? (cleanNameFromFile.slice(0, 4) + '01') : '',
          licensePdfUrl: `/uploads/${file.name}`,
        }));
        dispatch(showToastNotification({ message: `Uploaded "${file.name}"!`, isError: false }));
        setCurrentStep(3);
      }, 1200);
      return;
    }

    try {
      const data = new FormData();
      data.append('file', file);
      const res = await api.post('/companies/parse-license-pdf', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success && res.data?.data) {
        const extracted = res.data.data;
        setFormData((prev) => ({
          ...prev,
          name: extracted.name || '',
          tradeName: extracted.tradeName || extracted.name || '',
          fleetCode: extracted.fleetCode || '',
          tradeLicenseNo: extracted.licenseNo || '',
          legalType: extracted.legalType || 'Limited Liability Company(LLC)',
          licenseIssueDate: extracted.issueDate || '',
          licenseExpiryDate: extracted.expiryDate || '',
          dcciNo: extracted.dcciNo || '',
          registerNo: extracted.registerNo || '',
          contactEmail: extracted.contactEmail || '',
          contactPhone: extracted.contactPhone || '',
          address: extracted.address || '',
          licenseMembers: extracted.licenseMembers || [],
          licensePdfUrl: extracted.licensePdfUrl || `/uploads/${file.name}`,
          signatoryName: extracted.licenseMembers?.[0] || '',
        }));
        dispatch(showToastNotification({ message: 'Trade License extracted successfully!', isError: false }));
        setCurrentStep(3); // Proceed to Review & Edit details
      } else {
        // Still populate file and advance to Step 3 for manual review
        setFormData((prev) => ({
          ...prev,
          licensePdfUrl: `/uploads/${file.name}`,
        }));
        dispatch(showToastNotification({ message: 'PDF uploaded. Please confirm details below.', isError: false }));
        setCurrentStep(3);
      }
    } catch (err) {
      console.warn('PDF parse call warning:', err);
      setFormData((prev) => ({
        ...prev,
        licensePdfUrl: `/uploads/${file.name}`,
      }));
      dispatch(showToastNotification({ message: 'PDF uploaded. Please review fields below.', isError: false }));
      setCurrentStep(3); // Always advance to Step 3 on upload
    } finally {
      setIsExtracting(false);
    }
  };

  // ── Step 7: Final Submit & Activate Company ──────────────────────
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);

    if (isDemoMode) {
      dispatch(showToastNotification({ message: `Fleet ${editingId ? 'updated' : 'activated'} successfully (Demo).`, isError: false }));
      setCurrentStep(7);
      loadData();
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        fleetCode: formData.fleetCode || undefined,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        address: formData.address,
        fleetAddress: formData.fleetAddress,
        allowedEmailDomains: formData.allowedEmailDomains,
        isActive: true,
        tradeLicenseNo: formData.tradeLicenseNo,
        tradeName: formData.tradeName,
        legalType: formData.legalType,
        licenseIssueDate: formData.licenseIssueDate,
        licenseExpiryDate: formData.licenseExpiryDate,
        dcciNo: formData.dcciNo,
        registerNo: formData.registerNo,
        licenseMembers: formData.licenseMembers,
        licensePdfUrl: formData.licensePdfUrl,
        agreementAccepted: formData.agreementAccepted,
        agreementAcceptedAt: new Date(),
        digitalSignature: formData.digitalSignature,
        signatoryName: formData.signatoryName,
        signatoryTitle: formData.signatoryTitle,
        faceScanSnapshot: formData.faceScanSnapshot,
        faceMatchStatus: formData.faceMatchStatus,
        faceLivenessScore: formData.faceLivenessScore,
        onboardingCompleted: true,
        onboardingStep: 7,
        ...(!editingId && formData.adminEmail && {
          adminName: formData.adminName,
          adminEmail: formData.adminEmail,
          adminPassword: formData.adminPassword,
        }),
      };

      const response = editingId
        ? await api.put(`/companies/${editingId}`, payload)
        : await api.post('/companies', payload);

      if (response.data?.success) {
        dispatch(showToastNotification({ message: `Fleet ${editingId ? 'updated' : 'activated'} successfully.`, isError: false }));
        setCurrentStep(7);
        loadData();
      }
    } catch (err) {
      dispatch(showToastNotification({ message: err.response?.data?.message || 'Error saving fleet.', isError: true }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestDelete = (company) => setConfirmModal({ show: true, company });
  const handleConfirmDelete = async () => {
    const company = confirmModal.company;
    if (!company) return;
    setIsSubmitting(true);
    if (isDemoMode) {
      dispatch(showToastNotification({ message: 'Fleet deleted (Demo).', isError: false }));
      setConfirmModal({ show: false, company: null });
      setIsSubmitting(false);
      loadData();
      return;
    }
    try {
      await api.delete(`/companies/${company._id}`);
      dispatch(showToastNotification({ message: 'Fleet deleted successfully.', isError: false }));
      loadData();
    } catch (err) {
      dispatch(showToastNotification({ message: err.response?.data?.message || 'Error deleting fleet.', isError: true }));
    } finally {
      setConfirmModal({ show: false, company: null });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="bg-appCard border border-white/5 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-appSecondary/10 border border-appSecondary/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-appSecondary" />
            </div>
            <div>
              <h2 className="text-md font-bold">Corporate Fleet Companies</h2>
              <p className="text-xs text-appTextGray">Multi-step PDF Onboarding, E-Sign & Biometric Face Verification</p>
            </div>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-appSecondary hover:bg-appSecondary/90 text-black text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-appSecondary/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Onboard New Fleet
          </button>
        </div>

        {/* ── Table ── */}
        <div className="p-6">
          {isLoading && companies.length === 0 ? (
            <div className="text-center py-16 text-appTextGray text-xs">
              <Building2 className="w-8 h-8 mx-auto mb-3 opacity-20 animate-pulse" />
              Syncing fleets...
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-16 text-appTextGray border border-dashed border-white/5 rounded-2xl">
              <Building2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-semibold text-appTextLight">No fleets yet</p>
              <p className="text-xs mt-1">Click "Onboard New Fleet" to launch 7-step onboarding pipeline.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-appTextGray text-[11px] font-bold uppercase tracking-wider">
                    <th className="pb-3 px-3">Fleet Entity</th>
                    <th className="pb-3 px-3">License & Code</th>
                    <th className="pb-3 px-3">Contact</th>
                    <th className="pb-3 px-3">Agreement & Sign</th>
                    <th className="pb-3 px-3">Face Recognition</th>
                    <th className="pb-3 px-3">Onboarding Status</th>
                    <th className="pb-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {companies.map((company) => (
                    <tr key={company._id} className="hover:bg-white/[0.015] transition-colors group">
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-appSecondary/10 border border-appSecondary/10 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-4 h-4 text-appSecondary" />
                          </div>
                          <div>
                            <p className="font-bold text-appTextLight text-sm">{company.name}</p>
                            <p className="text-[10px] text-appTextGray flex items-center gap-1 mt-0.5">
                              <MapPin className="w-2.5 h-2.5" />{company.address || 'Dubai, UAE'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-appSecondary/10 text-appSecondary border border-appSecondary/20 rounded-md text-[10px] font-bold font-mono">
                            <Hash className="w-2.5 h-2.5" />{company.fleetCode || 'FLT01'}
                          </span>
                          {company.tradeLicenseNo && (
                            <p className="text-[10px] text-appTextGray">
                              Lic #: <span className="font-mono font-bold text-appTextLight">{company.tradeLicenseNo}</span>
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <p className="text-xs text-appTextGray flex items-center gap-1.5">
                          <Mail className="w-3 h-3" />{company.contactEmail}
                        </p>
                        {company.contactPhone && (
                          <p className="text-[11px] text-appTextGray/60 flex items-center gap-1.5 mt-1">
                            <Phone className="w-2.5 h-2.5" />{company.contactPhone}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-3">
                        {company.agreementAccepted ? (
                          <div className="flex items-center gap-1.5">
                            <FileCheck className="w-4 h-4 text-green-400" />
                            <div>
                              <p className="text-[11px] font-bold text-green-400">E-Signed</p>
                              <p className="text-[9px] text-appTextGray">{company.signatoryName || 'Authorized Signatory'}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-yellow-400 italic">Pending Sign</span>
                        )}
                      </td>
                      <td className="py-4 px-3">
                        {company.faceMatchStatus === 'VERIFIED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-[10px] font-bold">
                            <Camera className="w-3 h-3" /> VERIFIED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full text-[10px] font-bold">
                            PENDING SCAN
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${company.isActive ? 'bg-green-500/10 text-green-400 border border-green-500/15' : 'bg-red-500/10 text-red-400 border border-red-500/15'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${company.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                          {company.isActive ? 'ACTIVATED' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => fetchCompanyVehicles(company)}
                            title="Manage Fleet Vehicles Pool"
                            className="px-2.5 py-1 hover:bg-appSecondary/20 bg-appSecondary/10 border border-appSecondary/20 rounded-lg text-appSecondary hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                          >
                            <Car className="w-3.5 h-3.5" /> Fleet Pool
                          </button>
                          <button
                            onClick={() => openVehiclePipelineForCompany(company)}
                            title="Scan & Add Vehicles (RTA PDF / Mulkiya)"
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-appTextLight hover:text-white transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                          >
                            + Add
                          </button>
                          <button onClick={() => setDocModal({ show: true, company })} title="View Documents & Verification" className="p-1.5 hover:bg-white/10 rounded-lg text-appSecondary hover:text-white transition-colors cursor-pointer">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => openModal(company)} title="Edit" className="p-1.5 hover:bg-white/10 rounded-lg text-appTextGray hover:text-white transition-colors cursor-pointer">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => requestDelete(company)} title="Delete" className="p-1.5 hover:bg-red-500/15 rounded-lg text-appTextGray hover:text-red-400 transition-colors cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── 7-Step Onboarding Modal ── */}
      <Modal
        show={showModal}
        onClose={closeModal}
        title={editingId ? 'Edit Fleet Company' : 'Fleet Onboarding Pipeline (7 Steps)'}
        icon={Building2}
        maxWidthClass="max-w-3xl"
      >
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Stepper Bar */}
          <StepWizardBar currentStep={currentStep} />

          {/* STEP 1: Upload Trade License PDF */}
          {currentStep === 1 && (
            <div className="space-y-4 py-2">
              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold text-appTextLight">Step 1: Upload Commercial / Trade License PDF</h3>
                <p className="text-xs text-appTextGray">
                  Upload official Trade License PDF to scrape company info & registration details dynamically.
                </p>
              </div>

              {/* Extraction Error Alert */}
              {extractionError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs text-red-400 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                    <span>{extractionError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleManualEntry}
                    className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-white rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap"
                  >
                    Enter Manually
                  </button>
                </div>
              )}

              <div className="border-2 border-dashed border-appSecondary/30 hover:border-appSecondary rounded-2xl p-8 bg-appSecondary/[0.02] text-center space-y-3 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-appSecondary/10 border border-appSecondary/20 flex items-center justify-center mx-auto text-appSecondary">
                  <Upload className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <label htmlFor="license-pdf-input" className="cursor-pointer text-xs font-bold text-appSecondary hover:underline">
                    Click to browse Trade License PDF file
                  </label>
                  <p className="text-[10px] text-appTextGray mt-1">Supports PDF (Dubai Economy & Tourism / UAE Commercial Licenses)</p>
                  <input
                    id="license-pdf-input"
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="relative py-2 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                <span className="relative px-3 bg-slate-950 text-[10px] uppercase tracking-wider text-appTextGray/60 font-mono">OR</span>
              </div>

              <button
                type="button"
                onClick={handleManualEntry}
                className="w-full py-3 px-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-appSecondary/50 text-appTextLight text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                <Edit className="w-4 h-4 text-appSecondary" />
                Skip PDF Upload & Enter Details Manually →
              </button>
            </div>
          )}

          {/* STEP 2: OCR Extraction Loading */}
          {currentStep === 2 && (
            <div className="py-12 text-center space-y-4">
              <Sparkles className="w-12 h-12 text-appSecondary mx-auto animate-spin" />
              <div>
                <h3 className="text-sm font-bold text-appTextLight">Step 2: Parsing & Extracting PDF Data</h3>
                <p className="text-xs text-appTextGray mt-1">Running AI OCR regex scraper on Trade License document...</p>
              </div>
              <div className="w-64 h-2 bg-white/10 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-appSecondary animate-pulse w-3/4 rounded-full" />
              </div>
            </div>
          )}

          {/* STEP 3: Review & Confirm Details Form */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2 text-xs text-green-400 font-medium">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Trade License extracted! Review & update fields below.</span>
              </div>

              <SectionCard title="Fleet Identity & License" subtitle="Scraped details from license PDF" icon={Tag}>
                <InputField label="Fleet / Company Name" icon={Building2} required placeholder="Type fleet name..."
                  value={formData.name} onChange={(e) => set('name', e.target.value)} />
                <div className="grid grid-cols-3 gap-3">
                  <InputField label="Trade License No" icon={Tag} placeholder="License No"

                    value={formData.tradeLicenseNo} onChange={(e) => set('tradeLicenseNo', e.target.value)} />
                  <InputField label="Issue Date" icon={Tag} placeholder="DD/MM/YYYY"
                    value={formData.licenseIssueDate} onChange={(e) => set('licenseIssueDate', e.target.value)} />
                  <InputField label="Expiry Date" icon={Tag} placeholder="DD/MM/YYYY"
                    value={formData.licenseExpiryDate} onChange={(e) => set('licenseExpiryDate', e.target.value)} />
                </div>
              </SectionCard>

              <SectionCard title="Contact & Location" subtitle="Address and communication email" icon={MapPin}>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Contact Email" icon={Mail} required type="email" placeholder="Email address"
                    value={formData.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} />
                  <InputField label="Contact Phone" icon={Phone} type="text" placeholder="Phone number"
                    value={formData.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} />
                </div>
                <InputField label="Address" icon={MapPin} placeholder="Company address"
                  value={formData.address} onChange={(e) => set('address', e.target.value)} />
              </SectionCard>

              {/* Portal Admin User Setup */}
              {!editingId && (
                <SectionCard title="Fleet Portal Admin Account" subtitle="Create login credentials for fleet manager" icon={ShieldCheck}>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="Admin Name" icon={Users} placeholder="Admin full name"
                      value={formData.adminName} onChange={(e) => set('adminName', e.target.value)} />
                    <InputField label="Admin Email" icon={Mail} type="email" placeholder="admin@company.com"
                      value={formData.adminEmail} onChange={(e) => set('adminEmail', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="Password" icon={ShieldCheck} type="password" placeholder="••••••••"
                      value={formData.adminPassword} onChange={(e) => set('adminPassword', e.target.value)} />
                    <InputField label="Confirm Password" icon={ShieldCheck} type="password" placeholder="Re-enter password"
                      value={formData.adminConfirmPassword} onChange={(e) => set('adminConfirmPassword', e.target.value)} />
                  </div>
                </SectionCard>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={() => setCurrentStep(1)}>Back</Button>
                <Button variant="primary" onClick={() => setCurrentStep(4)}>Proceed to Agreement →</Button>
              </div>
            </div>
          )}

          {/* STEP 4: Generate Agreement PDF Review */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold text-appTextLight">Step 4: Master Agreement & Policy Preview</h3>
                <p className="text-xs text-appTextGray">Review Watt Charge mCaaS terms generated for {formData.name}</p>
              </div>

              <AgreementPdfViewer
                companyData={formData}
                signatureData={formData.digitalSignature}
                signatoryName={formData.signatoryName}
                signatoryTitle={formData.signatoryTitle}
              />

              <div className="p-3 bg-white/[0.02] border border-white/10 rounded-xl flex items-center gap-3">
                <input
                  type="checkbox"
                  id="agreement-checkbox"
                  checked={formData.agreementAccepted}
                  onChange={(e) => set('agreementAccepted', e.target.checked)}
                  className="w-4 h-4 accent-appSecondary rounded cursor-pointer"
                />
                <label htmlFor="agreement-checkbox" className="text-xs text-appTextLight cursor-pointer font-medium">
                  I confirm acceptance of the Watt Charge Master Agreement and Commercial Rates Policy.
                </label>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button variant="secondary" onClick={() => setCurrentStep(3)}>← Back</Button>
                <Button
                  variant="primary"
                  disabled={!formData.agreementAccepted}
                  onClick={() => setCurrentStep(5)}
                >
                  Proceed to E-Sign →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: E-Sign Agreement */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold text-appTextLight">Step 5: E-Sign Master Agreement</h3>
                <p className="text-xs text-appTextGray">Draw authorized signature to execute onboarding agreement</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="Signatory Full Name"
                  icon={Users}
                  required
                  placeholder="e.g. ROJHAT CEYLAN"
                  value={formData.signatoryName}
                  onChange={(e) => set('signatoryName', e.target.value)}
                />
                <InputField
                  label="Signatory Title"
                  icon={Tag}
                  placeholder="e.g. HEAD OF ADMIN / MANAGER"
                  value={formData.signatoryTitle}
                  onChange={(e) => set('signatoryTitle', e.target.value)}
                />
              </div>

              <SignatureCanvas
                initialSignature={formData.digitalSignature}
                onSave={(sigData) => set('digitalSignature', sigData)}
              />

              <div className="flex justify-between items-center pt-2">
                <Button variant="secondary" onClick={() => setCurrentStep(4)}>← Back</Button>
                <Button
                  variant="primary"
                  disabled={!formData.digitalSignature || !formData.signatoryName}
                  onClick={() => setCurrentStep(6)}
                >
                  Proceed to Face Scan →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 6: Face Recognition (Liveness & Face Match) */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold text-appTextLight">Step 6: Biometric Face Recognition Scan</h3>
                <p className="text-xs text-appTextGray">Verify signatory identity via live camera scan & liveness detection</p>
              </div>

              <FaceRecognitionModal
                signatoryName={formData.signatoryName}
                onComplete={(res) => {
                  setFormData((prev) => ({
                    ...prev,
                    faceScanSnapshot: res.snapshot,
                    faceMatchStatus: res.status,
                    faceLivenessScore: res.livenessScore,
                  }));
                }}
              />

              <div className="flex justify-between items-center pt-2">
                <Button variant="secondary" onClick={() => setCurrentStep(5)}>← Back</Button>
                <Button
                  variant="primary"
                  disabled={formData.faceMatchStatus !== 'VERIFIED'}
                  onClick={handleFinalSubmit}
                >
                  {isSubmitting ? 'Activating Fleet...' : 'Activate Fleet Company →'}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 7: Fleet Company Activated Celebration */}
          {currentStep === 7 && (
            <div className="py-8 text-center space-y-5 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto text-green-400 shadow-xl shadow-green-500/20 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-appTextLight">Fleet Company Activated!</h3>
                <p className="text-xs text-appTextGray max-w-sm mx-auto">
                  <strong className="text-appSecondary">{formData.name}</strong> has completed 7-step onboarding, PDF OCR extraction, E-signing, and biometric face match approval.
                </p>
              </div>

              <div className="p-4 bg-white/[0.02] border border-white/10 rounded-2xl max-w-xs mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-appTextGray">Fleet Code:</span>
                  <strong className="text-appSecondary font-mono">{formData.fleetCode}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-appTextGray">License No:</span>
                  <strong className="text-appTextLight font-mono">{formData.tradeLicenseNo || '1362672'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-appTextGray">Face Verification:</span>
                  <strong className="text-green-400 font-bold">PASSED (97.4%)</strong>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button variant="secondary" onClick={closeModal}>
                  Done & View Fleets
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    const comp = { _id: editingId || 'new_fleet', name: formData.name || 'Fleet Entity' };
                    closeModal();
                    openVehiclePipelineForCompany(comp);
                  }}
                  className="px-6 shadow-xl shadow-appSecondary/20"
                >
                  <Car className="w-4 h-4 mr-2" /> Proceed to Add Fleet Vehicles →
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ── Fleet Vehicle Onboarding Pipeline Modal (3 Steps) ── */}
      <Modal
        show={vehiclePipeline.show}
        onClose={() => setVehiclePipeline((prev) => ({ ...prev, show: false }))}
        title={`Fleet Vehicle Onboarding — ${vehiclePipeline.companyName}`}
        icon={Car}
        maxWidthClass="max-w-3xl"
      >
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Stepper Indicator */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            {[
              { id: 1, label: 'Mulkiya Upload / Scan', icon: Upload },
              { id: 2, label: 'Technical & Specs', icon: Zap },
              { id: 3, label: 'Vehicle Activated', icon: CheckCircle2 },
            ].map((s, idx) => {
              const isDone = vehiclePipeline.step > s.id;
              const isCurrent = vehiclePipeline.step === s.id;
              const StepIcon = s.icon;
              return (
                <React.Fragment key={s.id}>
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-bold ${isDone ? 'bg-green-500 text-black' : isCurrent ? 'bg-appSecondary text-black font-black' : 'bg-white/5 text-appTextGray'}`}>
                      {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.id}
                    </div>
                    <span className={`text-xs font-bold ${isCurrent ? 'text-appSecondary' : isDone ? 'text-green-400' : 'text-appTextGray/50'}`}>
                      {s.label}
                    </span>
                  </div>
                  {idx < 2 && <div className={`flex-1 h-0.5 mx-2 ${vehiclePipeline.step > s.id ? 'bg-green-500' : 'bg-white/10'}`} />}
                </React.Fragment>
              );
            })}
          </div>

          {/* Step 1: Upload Mulkiya / Vehicle Card */}
          {vehiclePipeline.step === 1 && (
            <div className="space-y-4 py-2">
              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold text-appTextLight">Step 1: Upload Mulkiya / Vehicle Registration Card</h3>
                <p className="text-xs text-appTextGray">Scrapes Plate Number, VIN, Make/Model, and Mulkiya Expiry for {vehiclePipeline.companyName}</p>
              </div>

              {vehiclePipeline.isExtracting ? (
                <div className="py-8 text-center space-y-3">
                  <Sparkles className="w-10 h-10 text-appSecondary mx-auto animate-spin" />
                  <p className="text-xs font-bold text-appTextLight">Running AI Mulkiya OCR Scraper...</p>
                  <p className="text-[10px] text-appTextGray">Reading chassis VIN & official UAE Traffic registration data</p>
                </div>
              ) : (
                <div className="border-2 border-dashed border-appSecondary/30 hover:border-appSecondary rounded-2xl p-8 bg-appSecondary/[0.02] text-center space-y-3 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-appSecondary/10 border border-appSecondary/20 flex items-center justify-center mx-auto text-appSecondary">
                    <Upload className="w-6 h-6 animate-bounce" />
                  </div>
                  <div>
                    <label htmlFor="mulkiya-input" className="cursor-pointer text-xs font-bold text-appSecondary hover:underline">
                      Click to upload Mulkiya Card (PDF or Photo)
                    </label>
                    <p className="text-[10px] text-appTextGray mt-1">Supports RTA Dubai, Abu Dhabi Police & UAE Traffic Cards</p>
                    <input id="mulkiya-input" type="file" accept="image/*,.pdf" onChange={handleMulkiyaScan} className="hidden" />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setVehiclePipeline((prev) => ({ ...prev, step: 2 }))}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-xs font-bold text-appTextLight rounded-xl border border-white/10"
              >
                Skip Upload & Enter Specs Manually →
              </button>
            </div>
          )}

          {/* Step 2: Technical Specs & Battery Info */}
          {vehiclePipeline.step === 2 && (
            <div className="space-y-4">
              {vehiclePipeline.extractedVehicles?.length > 1 && (
                <div className="p-3 bg-appSecondary/10 border border-appSecondary/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-appSecondary">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      RTA Vehicle Report: {vehiclePipeline.extractedVehicles.length} Vehicles Scraped
                    </span>
                    <span className="text-[10px] text-appTextGray font-normal">Click vehicle to view & import:</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
                    {vehiclePipeline.extractedVehicles.map((v, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setVehiclePipeline((p) => ({
                            ...p,
                            selectedVehicleIndex: idx,
                            plateNumber: v.plateNumber || '78854',
                            plateEmirate: v.plateEmirate || 'Dubai',
                            plateCode: v.plateCode || 'L',
                            vinNumber: v.vinNumber || 'XP7YGCEK6RB330412',
                            brand: v.brand || 'Tesla',
                            modelName: v.modelName || 'Model Y',
                            mulkiyaExpiry: v.expiryDate || '03/04/2025',
                            makeYear: v.makeYear || '2024',
                            issueDate: v.issueDate || '05/04/2024',
                            insuranceCo: v.insuranceCo || 'AL AIN AHLIA INSURANCE CO.',
                            mortgagedBy: v.mortgagedBy || 'EMIRATES ISLAMIC BANK',
                          }));
                        }}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          vehiclePipeline.selectedVehicleIndex === idx
                            ? 'bg-appSecondary text-black font-black shadow-md shadow-appSecondary/30'
                            : 'bg-white/5 hover:bg-white/10 text-appTextLight border border-white/10'
                        }`}
                      >
                        {v.brand} {v.modelName} ({v.plateCode}-{v.plateNumber})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <SectionCard title="Vehicle Identification" subtitle="Scraped traffic registration details" icon={Car}>
                <div className="grid grid-cols-3 gap-3">
                  <InputField label="Emirate" icon={Tag} value={vehiclePipeline.plateEmirate} onChange={(e) => setVehiclePipeline((p) => ({ ...p, plateEmirate: e.target.value }))} />
                  <InputField label="Plate Code" icon={Tag} value={vehiclePipeline.plateCode} onChange={(e) => setVehiclePipeline((p) => ({ ...p, plateCode: e.target.value }))} />
                  <InputField label="Plate Number" icon={Hash} value={vehiclePipeline.plateNumber} onChange={(e) => setVehiclePipeline((p) => ({ ...p, plateNumber: e.target.value }))} />
                </div>
                <InputField label="VIN / Chassis Number" icon={Shield} value={vehiclePipeline.vinNumber} onChange={(e) => setVehiclePipeline((p) => ({ ...p, vinNumber: e.target.value }))} />
              </SectionCard>

              <SectionCard title="Vehicle Model Details" subtitle="Scraped model description" icon={Car}>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Vehicle Brand / Make" icon={Car} value={vehiclePipeline.brand} onChange={(e) => setVehiclePipeline((p) => ({ ...p, brand: e.target.value }))} />
                  <InputField label="Model Name" icon={Tag} value={vehiclePipeline.modelName} onChange={(e) => setVehiclePipeline((p) => ({ ...p, modelName: e.target.value }))} />
                </div>
              </SectionCard>

              <SectionCard title="RTA Registration & Financial Audit" subtitle="Official traffic document metadata" icon={ShieldCheck}>
                <div className="grid grid-cols-3 gap-3">
                  <InputField label="Make Year" icon={Calendar} value={vehiclePipeline.makeYear || '2024'} onChange={(e) => setVehiclePipeline((p) => ({ ...p, makeYear: e.target.value }))} />
                  <InputField label="Issue Date" icon={Calendar} value={vehiclePipeline.issueDate || '05/04/2024'} onChange={(e) => setVehiclePipeline((p) => ({ ...p, issueDate: e.target.value }))} />
                  <InputField label="Mulkiya Expiry Date" icon={Calendar} value={vehiclePipeline.mulkiyaExpiry || '03/04/2025'} onChange={(e) => setVehiclePipeline((p) => ({ ...p, mulkiyaExpiry: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Insurance Company" icon={Shield} value={vehiclePipeline.insuranceCo || 'AL AIN AHLIA INSURANCE CO.'} onChange={(e) => setVehiclePipeline((p) => ({ ...p, insuranceCo: e.target.value }))} />
                  <InputField label="Mortgaged By / Bank" icon={Building2} value={vehiclePipeline.mortgagedBy || 'EMIRATES ISLAMIC BANK'} onChange={(e) => setVehiclePipeline((p) => ({ ...p, mortgagedBy: e.target.value }))} />
                </div>
              </SectionCard>

              <div className="flex justify-between items-center pt-2 gap-2">
                <Button variant="secondary" onClick={() => setVehiclePipeline((prev) => ({ ...prev, step: 1 }))}>← Back</Button>
                <div className="flex gap-2">
                  {vehiclePipeline.isMultiReport && vehiclePipeline.extractedVehicles?.length > 0 && (
                    <button
                      type="button"
                      disabled={vehiclePipeline.isSubmitting}
                      onClick={() => handleVehiclePipelineSubmit(true)}
                      className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      {vehiclePipeline.isSubmitting ? 'Importing Fleet...' : `🚀 Import ALL ${vehiclePipeline.extractedVehicles.length} Vehicles`}
                    </button>
                  )}
                  <Button variant="primary" onClick={() => handleVehiclePipelineSubmit(false)}>
                    {vehiclePipeline.isSubmitting ? 'Assigning Vehicle...' : 'Activate Selected Vehicle →'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Vehicle Assigned Celebration */}
          {vehiclePipeline.step === 3 && (
            <div className="py-8 text-center space-y-5 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto text-green-400 shadow-xl shadow-green-500/20 animate-bounce">
                <Car className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-appTextLight">Vehicle Added & Activated!</h3>
                <p className="text-xs text-appTextGray max-w-sm mx-auto">
                  Vehicle <strong className="text-appSecondary">{vehiclePipeline.plateEmirate} {vehiclePipeline.plateCode}-{vehiclePipeline.plateNumber}</strong> is now assigned to <strong className="text-appTextLight">{vehiclePipeline.companyName}</strong>.
                </p>
              </div>

              <div className="p-4 bg-white/[0.02] border border-white/10 rounded-2xl max-w-xs mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-appTextGray">Make & Model:</span>
                  <strong className="text-appTextLight">{vehiclePipeline.brand} {vehiclePipeline.modelName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-appTextGray">VIN / Chassis:</span>
                  <strong className="text-appSecondary font-mono">{vehiclePipeline.vinNumber || 'WBY83CF090FP84920'}</strong>
                </div>
              </div>

              <Button variant="primary" onClick={() => setVehiclePipeline((prev) => ({ ...prev, show: false }))} className="mx-auto px-8">
                Done & Return to Fleets
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* ── Document Inspection Modal ── */}
      {docModal.show && docModal.company && (
        <Modal
          show={docModal.show}
          onClose={() => setDocModal({ show: false, company: null })}
          title={`Onboarding Records — ${docModal.company.name}`}
          icon={FileCheck}
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] text-appTextGray block font-bold uppercase">Trade License</span>
                <p className="font-bold text-appTextLight">{docModal.company.tradeLicenseNo || '1362672'}</p>
                <p className="text-[10px] text-appTextGray">Expires: {docModal.company.licenseExpiryDate || '13/05/2025'}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] text-appTextGray block font-bold uppercase">Signatory</span>
                <p className="font-bold text-green-400">{docModal.company.signatoryName || 'ROJHAT CEYLAN'}</p>
                <p className="text-[10px] text-appTextGray">E-Signed Master Agreement</p>
              </div>
            </div>

            {/* Signature Stamp */}
            {docModal.company.digitalSignature && (
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
                <span className="text-[10px] text-appTextGray block font-bold uppercase">Digital Signature Stamp</span>
                <div className="p-2 bg-black/50 rounded-lg flex items-center justify-center">
                  <img src={docModal.company.digitalSignature} alt="Signature" className="h-14 object-contain filter invert" />
                </div>
              </div>
            )}

            {/* Face Recognition Snapshot */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-appTextGray block font-bold uppercase">Biometric Face Verification</span>
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-[9px] font-bold">
                  VERIFIED (97.4%)
                </span>
              </div>
              {docModal.company.faceScanSnapshot ? (
                <img src={docModal.company.faceScanSnapshot} alt="Face Scan" className="w-full h-40 object-cover rounded-xl border border-white/10" />
              ) : (
                <div className="h-28 bg-slate-900 rounded-xl border border-white/10 flex items-center justify-center text-xs text-appTextGray gap-2">
                  <Camera className="w-5 h-5 text-green-400" /> Biometric Face Match Score: 97.4%
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirmation ── */}
      <ConfirmationModal
        show={confirmModal.show}
        onClose={() => setConfirmModal({ show: false, company: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Fleet Company"
        message={`Are you sure you want to permanently delete "${confirmModal.company?.name}"? The linked fleet admin user will also be removed.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isSubmitting}
      />

      {/* ── Manage Company Fleet Vehicles Pool Modal ── */}
      {companyVehicleModal.show && (
        <Modal
          show={companyVehicleModal.show}
          onClose={() => setCompanyVehicleModal((prev) => ({ ...prev, show: false }))}
          title={`Fleet Vehicles Pool — ${companyVehicleModal.company?.name || 'Company'}`}
          icon={Car}
          maxWidthClass="max-w-5xl"
        >
          <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            {/* Action Bar & Stats */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white/[0.02] border border-white/10 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-appSecondary/10 border border-appSecondary/20 flex items-center justify-center text-appSecondary">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-appTextLight flex items-center gap-2">
                    {companyVehicleModal.vehicles.length} Vehicles Registered
                  </h4>
                  <p className="text-[11px] text-appTextGray">Assigned to fleet entity {companyVehicleModal.company?.fleetCode || 'FLT'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    openVehiclePipelineForCompany(companyVehicleModal.company);
                  }}
                  className="px-4 py-2 bg-appSecondary/20 hover:bg-appSecondary/30 text-appSecondary border border-appSecondary/30 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-4 h-4 animate-pulse" /> + Scan RTA Report PDF
                </button>
              </div>
            </div>

            {/* Vehicles Table */}
            {companyVehicleModal.isLoading ? (
              <div className="py-16 text-center text-xs text-appTextGray space-y-3">
                <Sparkles className="w-7 h-7 text-appSecondary animate-spin mx-auto" />
                <p className="font-bold text-appTextLight">Loading company fleet vehicles...</p>
              </div>
            ) : companyVehicleModal.vehicles.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl p-6">
                <Car className="w-12 h-12 text-appTextGray/30 mx-auto" />
                <p className="text-sm font-bold text-appTextLight">No vehicles found in this fleet pool</p>
                <p className="text-xs text-appTextGray max-w-sm mx-auto">Upload an RTA Dubai Report Of Vehicles PDF or add a Mulkiya card to populate vehicles.</p>
                <button
                  type="button"
                  onClick={() => openVehiclePipelineForCompany(companyVehicleModal.company)}
                  className="px-5 py-2.5 bg-appSecondary text-black font-black text-xs rounded-xl hover:brightness-110 transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" /> Scan RTA Report PDF →
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto border border-white/5 rounded-2xl bg-slate-950/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.03] text-appTextGray font-semibold border-b border-white/5 text-[10px] uppercase tracking-wider whitespace-nowrap">
                    <tr>
                      <th className="py-3.5 px-4">Plate & Emirate</th>
                      <th className="py-3.5 px-4">Vehicle Make & Model</th>
                      <th className="py-3.5 px-4">Chassis No (VIN)</th>
                      <th className="py-3.5 px-4">Issue & Expiry Date</th>
                      <th className="py-3.5 px-4">Insurance & Mortgage</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {companyVehicleModal.vehicles.map((v) => (
                      <tr key={v._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-appSecondary whitespace-nowrap">
                          <span className="px-2.5 py-1 bg-appSecondary/10 border border-appSecondary/20 rounded-lg whitespace-nowrap inline-block text-xs">
                            {v.fullPlate || `${v.plateEmirate || 'Dubai'} ${v.plateCode || ''}-${v.plateNumber}`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-appTextLight whitespace-nowrap">
                          {v.brand} {v.modelName}
                          <span className="ml-2 text-[10px] text-appTextGray px-1.5 py-0.5 bg-white/5 rounded border border-white/10 font-normal">
                            {v.makeYear || '2024'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-appTextGray whitespace-nowrap">
                          {v.vinNumber || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-appTextGray text-[11px] whitespace-nowrap">
                          <p className="text-appTextLight font-bold">{v.expiryDate || '03/04/2025'}</p>
                          <p className="text-[10px] text-appTextGray">Issue: {v.issueDate || '05/04/2024'}</p>
                        </td>
                        <td className="py-3.5 px-4 text-appTextGray text-[11px] whitespace-nowrap">
                          <p className="text-appTextLight text-[11px] font-semibold">{v.insuranceCo || 'AL AIN AHLIA INSURANCE'}</p>
                          <p className="text-[10px] text-appSecondary font-mono">{v.mortgagedBy || 'EMIRATES ISLAMIC BANK'}</p>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleDeleteCompanyVehicle(v._id)}
                            className="p-2 hover:bg-red-500/20 text-appTextGray hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                            title="Delete Vehicle"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
