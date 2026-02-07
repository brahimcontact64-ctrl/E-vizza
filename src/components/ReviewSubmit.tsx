import { CheckCircle, FileText, User, MapPin, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

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
  base_fee: number;
  processing_time_days: number;
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

interface DocumentRequirement {
  id: string;
  name_en: string;
  name_fr: string;
  name_ar: string;
}

interface ReviewSubmitProps {
  country: Country;
  visaType: VisaType;
  applicantInfo: ApplicantInfo;
  uploadedDocuments: Record<string, { file: File }>;
  documentRequirements: DocumentRequirement[];
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ReviewSubmit({
  country,
  visaType,
  applicantInfo,
  uploadedDocuments,
  documentRequirements,
  onSubmit,
  isSubmitting,
}: ReviewSubmitProps) {
  const { language } = useLanguage();

  const getName = (item: any) => {
    return language === 'ar' ? item.name_ar :
           language === 'fr' ? item.name_fr :
           item.name_en;
  };

  const getLabel = (key: string) => {
    const labels: Record<string, Record<string, string>> = {
      firstName: { en: 'First Name', fr: 'Prénom', ar: 'الاسم الأول' },
      lastName: { en: 'Last Name', fr: 'Nom', ar: 'اسم العائلة' },
      passportNumber: { en: 'Passport Number', fr: 'Numéro de passeport', ar: 'رقم جواز السفر' },
      nationality: { en: 'Nationality', fr: 'Nationalité', ar: 'الجنسية' },
      dateOfBirth: { en: 'Date of Birth', fr: 'Date de naissance', ar: 'تاريخ الميلاد' },
      gender: { en: 'Gender', fr: 'Genre', ar: 'الجنس' },
      phone: { en: 'Phone', fr: 'Téléphone', ar: 'الهاتف' },
      email: { en: 'Email', fr: 'E-mail', ar: 'البريد الإلكتروني' },
      travelDate: { en: 'Travel Date', fr: 'Date de départ', ar: 'تاريخ السفر' },
      returnDate: { en: 'Return Date', fr: 'Date de retour', ar: 'تاريخ العودة' },
      address: { en: 'Address', fr: 'Adresse', ar: 'العنوان' },
    };
    return labels[key]?.[language] || labels[key]?.en || key;
  };

  const formatGender = (gender: string) => {
    const genderLabels: Record<string, Record<string, string>> = {
      male: { en: 'Male', fr: 'Homme', ar: 'ذكر' },
      female: { en: 'Female', fr: 'Femme', ar: 'أنثى' },
      other: { en: 'Other', fr: 'Autre', ar: 'آخر' },
    };
    return genderLabels[gender]?.[language] || gender;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#0F4C81] to-[#00C2A8] rounded-full mb-3 sm:mb-4">
          <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {language === 'ar' ? 'مراجعة وإرسال' :
           language === 'fr' ? 'Révision et soumission' :
           'Review & Submit'}
        </h2>
        <p className="text-sm sm:text-base text-gray-600 px-4">
          {language === 'ar' ? 'يرجى مراجعة المعلومات قبل إرسال طلبك' :
           language === 'fr' ? 'Veuillez vérifier vos informations avant de soumettre' :
           'Please review your information before submitting'}
        </p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-teal-50 border-2 border-blue-200 rounded-xl p-4 sm:p-6">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
          <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-[#0F4C81]" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            {language === 'ar' ? 'معلومات التأشيرة' :
             language === 'fr' ? 'Informations sur le visa' :
             'Visa Information'}
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <p className="text-sm text-gray-600">
              {language === 'ar' ? 'البلد' : language === 'fr' ? 'Pays' : 'Country'}
            </p>
            <p className="font-semibold text-gray-900 flex items-center space-x-2">
              <span className="text-2xl">{country.flag_emoji}</span>
              <span>{getName(country)}</span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              {language === 'ar' ? 'نوع التأشيرة' : language === 'fr' ? 'Type de visa' : 'Visa Type'}
            </p>
            <p className="font-semibold text-gray-900">{getName(visaType)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              {language === 'ar' ? 'الرسوم' : language === 'fr' ? 'Frais' : 'Fee'}
            </p>
            <p className="font-semibold text-gray-900">{visaType.base_fee} DZD</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              {language === 'ar' ? 'مدة المعالجة' : language === 'fr' ? 'Délai de traitement' : 'Processing Time'}
            </p>
            <p className="font-semibold text-gray-900">
              {visaType.processing_time_days}{' '}
              {language === 'ar' ? 'يوم' : language === 'fr' ? 'jours' : 'days'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
          <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#0F4C81]" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            {language === 'ar' ? 'معلومات مقدم الطلب' :
             language === 'fr' ? 'Informations du demandeur' :
             'Applicant Information'}
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {Object.entries(applicantInfo).map(([key, value]) => (
            <div key={key}>
              <p className="text-sm text-gray-600">{getLabel(key)}</p>
              <p className="font-medium text-gray-900">
                {key === 'gender' ? formatGender(value) :
                 key === 'dateOfBirth' || key === 'travelDate' || key === 'returnDate' ?
                 formatDate(value) : value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#0F4C81]" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            {language === 'ar' ? 'المستندات المحملة' :
             language === 'fr' ? 'Documents téléchargés' :
             'Uploaded Documents'}
          </h3>
        </div>
        <div className="space-y-2 sm:space-y-3">
          {documentRequirements.map((req) => {
            const uploaded = uploadedDocuments[req.id];
            return (
              <div
                key={req.id}
                className="flex items-center justify-between p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm sm:text-base font-medium text-gray-900 truncate">{getName(req)}</p>
                    {uploaded && (
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{uploaded.file.name}</p>
                    )}
                  </div>
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-green-700 bg-green-100 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap ml-2">
                  {language === 'ar' ? 'تم التحميل' : language === 'fr' ? 'Téléchargé' : 'Uploaded'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 sm:p-6">
        <div className="flex items-start space-x-2 sm:space-x-3">
          <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">
              {language === 'ar' ? 'ماذا سيحدث بعد ذلك؟' :
               language === 'fr' ? 'Et ensuite ?' :
               'What happens next?'}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                <span>
                  {language === 'ar' ? 'سيتم مراجعة طلبك خلال 1-2 أيام عمل' :
                   language === 'fr' ? 'Votre demande sera examinée dans un délai de 1 à 2 jours ouvrables' :
                   'Your application will be reviewed within 1-2 business days'}
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                <span>
                  {language === 'ar' ? 'ستتلقى تأكيدًا عبر البريد الإلكتروني' :
                   language === 'fr' ? 'Vous recevrez une confirmation par e-mail' :
                   'You will receive an email confirmation'}
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                <span>
                  {language === 'ar' ? 'يمكنك تتبع حالة طلبك في لوحة التحكم' :
                   language === 'fr' ? 'Vous pouvez suivre le statut dans votre tableau de bord' :
                   'Track your application status in the dashboard'}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center pt-4">
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 bg-gradient-to-r from-[#0F4C81] to-[#00C2A8] text-white text-base sm:text-lg font-semibold rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>
                {language === 'ar' ? 'جاري الإرسال...' :
                 language === 'fr' ? 'Envoi en cours...' :
                 'Submitting...'}
              </span>
            </span>
          ) : (
            <span>
              {language === 'ar' ? 'إرسال الطلب' :
               language === 'fr' ? 'Soumettre la demande' :
               'Submit Application'}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
