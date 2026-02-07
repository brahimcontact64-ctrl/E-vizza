import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { db, storage } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Header } from '../components/Header';
import { LegalNotice } from '../components/LegalNotice';
import { ApplicantInfoForm } from '../components/ApplicantInfoForm';
import { DocumentUpload } from '../components/DocumentUpload';
import { ReviewSubmit } from '../components/ReviewSubmit';

interface Country {
  id: string;
  code: string;
  name_en: string;
  name_fr: string;
  name_ar: string;
  flag_emoji: string;
}

interface VisaType {
  id: string;
  code: string;
  name_en: string;
  name_fr: string;
  name_ar: string;
  description_en: string;
  description_fr: string;
  description_ar: string;
  base_fee: number;
  processing_time_days: number;
}

interface DocumentRequirement {
  id: string;
  document_type: string;
  name_en: string;
  name_fr: string;
  name_ar: string;
  description_en: string;
  description_fr: string;
  description_ar: string;
  is_required: boolean;
}

interface ApplicantInfo {
  firstName: string;
  lastName: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  travelDate: string;
  returnDate: string;
  address: string;
}

interface UploadedFile {
  file: File;
  preview?: string;
  progress: number;
}

export function NewApplication() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [step, setStep] = useState(1);
  const [countries, setCountries] = useState<Country[]>([]);
  const [visaTypes, setVisaTypes] = useState<VisaType[]>([]);
  const [documentRequirements, setDocumentRequirements] = useState<DocumentRequirement[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedVisaType, setSelectedVisaType] = useState<VisaType | null>(null);
  const [applicantInfo, setApplicantInfo] = useState<ApplicantInfo>({
    firstName: '',
    lastName: '',
    passportNumber: '',
    nationality: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    email: user?.email || '',
    travelDate: '',
    returnDate: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      loadVisaTypes(selectedCountry.id);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedVisaType) {
      loadDocumentRequirements(selectedVisaType.id);
    }
  }, [selectedVisaType]);

  const loadCountries = async () => {
    try {
      const countriesRef = collection(db, 'countries');
      const q = query(countriesRef, where('is_active', '==', true), orderBy('name_en'));
      const querySnapshot = await getDocs(q);

      const countriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Country[];

      setCountries(countriesData);
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  };

  const loadVisaTypes = async (countryId: string) => {
    setLoading(true);
    try {
      const visaTypesRef = collection(db, 'visaTypes');
      const q = query(
        visaTypesRef,
        where('country_id', '==', countryId),
        where('is_active', '==', true)
      );
      const querySnapshot = await getDocs(q);

      const visaTypesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VisaType[];

      setVisaTypes(visaTypesData);
    } catch (error) {
      console.error('Error loading visa types:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDocumentRequirements = async (visaTypeId: string) => {
    setLoading(true);
    try {
      const docReqRef = collection(db, 'documentRequirements');
      const q = query(
        docReqRef,
        where('visa_type_id', '==', visaTypeId),
        orderBy('order_index')
      );
      const querySnapshot = await getDocs(q);

      const requirements = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DocumentRequirement[];

      setDocumentRequirements(requirements);
    } catch (error) {
      console.error('Error loading document requirements:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateApplicantInfo = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!applicantInfo.firstName.trim()) {
      newErrors.firstName = language === 'ar' ? 'مطلوب' : language === 'fr' ? 'Requis' : 'Required';
    }
    if (!applicantInfo.lastName.trim()) {
      newErrors.lastName = language === 'ar' ? 'مطلوب' : language === 'fr' ? 'Requis' : 'Required';
    }
    if (!applicantInfo.passportNumber.trim()) {
      newErrors.passportNumber = language === 'ar' ? 'مطلوب' : language === 'fr' ? 'Requis' : 'Required';
    }
    if (!applicantInfo.nationality.trim()) {
      newErrors.nationality = language === 'ar' ? 'مطلوب' : language === 'fr' ? 'Requis' : 'Required';
    }
    if (!applicantInfo.dateOfBirth) {
      newErrors.dateOfBirth = language === 'ar' ? 'مطلوب' : language === 'fr' ? 'Requis' : 'Required';
    }
    if (!applicantInfo.gender) {
      newErrors.gender = language === 'ar' ? 'مطلوب' : language === 'fr' ? 'Requis' : 'Required';
    }
    if (!applicantInfo.phone.trim()) {
      newErrors.phone = language === 'ar' ? 'مطلوب' : language === 'fr' ? 'Requis' : 'Required';
    }
    if (!applicantInfo.email.trim()) {
      newErrors.email = language === 'ar' ? 'مطلوب' : language === 'fr' ? 'Requis' : 'Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicantInfo.email)) {
      newErrors.email = language === 'ar' ? 'بريد إلكتروني غير صالح' : language === 'fr' ? 'E-mail invalide' : 'Invalid email';
    }
    if (!applicantInfo.travelDate) {
      newErrors.travelDate = language === 'ar' ? 'مطلوب' : language === 'fr' ? 'Requis' : 'Required';
    }
    if (!applicantInfo.returnDate) {
      newErrors.returnDate = language === 'ar' ? 'مطلوب' : language === 'fr' ? 'Requis' : 'Required';
    } else if (applicantInfo.travelDate && applicantInfo.returnDate <= applicantInfo.travelDate) {
      newErrors.returnDate = language === 'ar' ? 'يجب أن يكون بعد تاريخ السفر' : language === 'fr' ? 'Doit être après la date de départ' : 'Must be after travel date';
    }
    if (!applicantInfo.address.trim()) {
      newErrors.address = language === 'ar' ? 'مطلوب' : language === 'fr' ? 'Requis' : 'Required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (reqId: string, file: File) => {
    setUploadedFiles(prev => ({
      ...prev,
      [reqId]: { file, progress: 100 }
    }));
  };

  const handleRemoveFile = (reqId: string) => {
    setUploadedFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[reqId];
      return newFiles;
    });
  };

  const handleSubmit = async () => {
    if (!user || !selectedCountry || !selectedVisaType) return;

    setSubmitting(true);
    try {
      const year = new Date().getFullYear().toString().slice(-2);
      const appsCount = (await getDocs(collection(db, 'applications'))).size;
      const appNumber = `VF${year}${String(appsCount + 1).padStart(6, '0')}`;

      const applicationData = {
        user_id: user.uid,
        country_id: selectedCountry.id,
        visa_type_id: selectedVisaType.id,
        application_number: appNumber,
        status: 'submitted',
        applicant_data: applicantInfo,
        is_urgent: false,
        admin_notes: null,
        rejection_reason: null,
        submitted_at: Date.now(),
        payment_confirmed_at: null,
        completed_at: null,
        created_at: Date.now(),
        updated_at: Date.now(),
      };

      const applicationRef = await addDoc(collection(db, 'applications'), applicationData);
      const applicationId = applicationRef.id;

      for (const [reqId, uploadedFile] of Object.entries(uploadedFiles)) {
        const file = uploadedFile.file;
        const fileExt = file.name.split('.').pop();
        const fileName = `${reqId}.${fileExt}`;
        const filePath = `applications/${applicationId}/${fileName}`;

        const storageRef = ref(storage, filePath);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        await addDoc(collection(db, 'documents'), {
          application_id: applicationId,
          document_requirement_id: reqId,
          file_name: file.name,
          file_path: downloadURL,
          file_size: file.size,
          mime_type: file.type,
          status: 'pending',
          admin_notes: null,
          uploaded_by: user.uid,
          verified_by: null,
          verified_at: null,
          created_at: Date.now(),
          updated_at: Date.now(),
        });
      }

      await addDoc(collection(db, 'statusLogs'), {
        application_id: applicationId,
        old_status: null,
        new_status: 'submitted',
        changed_by: user.uid,
        notes: 'Application submitted by user',
        created_at: Date.now(),
      });

      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error submitting application:', error);
      alert(
        language === 'ar' ? 'فشل إرسال الطلب. يرجى المحاولة مرة أخرى.' :
        language === 'fr' ? 'Échec de la soumission. Veuillez réessayer.' :
        'Failed to submit application. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return selectedCountry !== null;
    if (step === 2) return selectedVisaType !== null;
    if (step === 3) {
      return applicantInfo.firstName && applicantInfo.lastName && applicantInfo.passportNumber &&
             applicantInfo.nationality && applicantInfo.dateOfBirth && applicantInfo.gender &&
             applicantInfo.phone && applicantInfo.email && applicantInfo.travelDate &&
             applicantInfo.returnDate && applicantInfo.address;
    }
    if (step === 4) {
      const requiredDocs = documentRequirements.filter(d => d.is_required);
      return requiredDocs.every(d => uploadedFiles[d.id]);
    }
    return true;
  };

  const handleNext = () => {
    if (step === 3) {
      if (!validateApplicantInfo()) {
        return;
      }
    }
    setStep(step + 1);
  };

  const getName = (item: any) => {
    return language === 'ar' ? item.name_ar :
           language === 'fr' ? item.name_fr :
           item.name_en;
  };

  const getDescription = (item: any) => {
    return language === 'ar' ? item.description_ar :
           language === 'fr' ? item.description_fr :
           item.description_en;
  };

  const getStepLabel = (stepNum: number) => {
    const labels: Record<number, Record<string, string>> = {
      1: { en: 'Country', fr: 'Pays', ar: 'البلد' },
      2: { en: 'Visa Type', fr: 'Type', ar: 'النوع' },
      3: { en: 'Information', fr: 'Info', ar: 'المعلومات' },
      4: { en: 'Documents', fr: 'Documents', ar: 'المستندات' },
      5: { en: 'Review', fr: 'Révision', ar: 'المراجعة' },
    };
    return labels[stepNum]?.[language] || '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('newApplication')}</h1>
          <p className="text-sm sm:text-base text-gray-600">
            {language === 'ar' ? 'أكمل جميع الخطوات لتقديم طلب التأشيرة' :
             language === 'fr' ? 'Complétez toutes les étapes pour soumettre votre demande de visa' :
             'Complete all steps to submit your visa application'}
          </p>

          <div className="flex items-center justify-between mt-6 relative overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex flex-col items-center relative z-10 min-w-[60px] sm:min-w-[80px]">
                <div
                  className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-lg transition-all ${
                    s < step
                      ? 'bg-green-500 text-white'
                      : s === step
                      ? 'bg-gradient-to-r from-[#0F4C81] to-[#00C2A8] text-white ring-2 sm:ring-4 ring-blue-100'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s}
                </div>
                <span className={`text-[10px] sm:text-xs mt-1 sm:mt-2 font-medium text-center ${
                  s === step ? 'text-[#0F4C81]' : 'text-gray-500'
                }`}>
                  {getStepLabel(s)}
                </span>
              </div>
            ))}
            <div className="absolute top-4 sm:top-6 left-0 right-0 h-1 bg-gray-200 -z-0">
              <div
                className="h-full bg-gradient-to-r from-[#0F4C81] to-[#00C2A8] transition-all duration-500"
                style={{ width: `${((step - 1) / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-8">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('selectCountry')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {countries.map((country) => (
                  <button
                    key={country.id}
                    onClick={() => setSelectedCountry(country)}
                    className={`p-6 border-2 rounded-xl text-left transition-all ${
                      selectedCountry?.id === country.id
                        ? 'border-[#00C2A8] bg-[#00C2A8]/5 shadow-md'
                        : 'border-gray-200 hover:border-[#00C2A8]/50'
                    }`}
                  >
                    <div className="text-5xl mb-3">{country.flag_emoji}</div>
                    <h3 className="text-lg font-semibold text-gray-900">{getName(country)}</h3>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('selectVisaType')}</h2>
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-[#00C2A8] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {visaTypes.map((visa) => (
                    <button
                      key={visa.id}
                      onClick={() => setSelectedVisaType(visa)}
                      className={`w-full p-6 border-2 rounded-xl text-left transition-all ${
                        selectedVisaType?.id === visa.id
                          ? 'border-[#00C2A8] bg-[#00C2A8]/5 shadow-md'
                          : 'border-gray-200 hover:border-[#00C2A8]/50'
                      }`}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{getName(visa)}</h3>
                      <p className="text-gray-600 text-sm mb-3">{getDescription(visa)}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-[#0F4C81] font-medium">{visa.base_fee} DZD</span>
                        <span className="text-gray-500">
                          {visa.processing_time_days}{' '}
                          {language === 'ar' ? 'يوم' : language === 'fr' ? 'jours' : 'days'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <ApplicantInfoForm
              applicantInfo={applicantInfo}
              onChange={setApplicantInfo}
              errors={errors}
            />
          )}

          {step === 4 && (
            <DocumentUpload
              requirements={documentRequirements}
              uploadedFiles={uploadedFiles}
              onFileUpload={handleFileUpload}
              onFileRemove={handleRemoveFile}
            />
          )}

          {step === 5 && selectedCountry && selectedVisaType && (
            <ReviewSubmit
              country={selectedCountry}
              visaType={selectedVisaType}
              applicantInfo={applicantInfo}
              uploadedDocuments={uploadedFiles}
              documentRequirements={documentRequirements}
              onSubmit={handleSubmit}
              isSubmitting={submitting}
            />
          )}

          {step < 5 && (
            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6 sm:mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className="flex items-center justify-center space-x-2 px-6 py-3 text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors order-2 sm:order-1"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>{t('back')}</span>
              </button>

              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center justify-center space-x-2 px-8 py-3 bg-gradient-to-r from-[#0F4C81] to-[#00C2A8] text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all order-1 sm:order-2"
              >
                <span>{t('next')}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
      <LegalNotice />
    </div>
  );
}
