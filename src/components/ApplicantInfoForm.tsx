import { useLanguage } from '../contexts/LanguageContext';

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

interface ApplicantInfoFormProps {
  applicantInfo: ApplicantInfo;
  onChange: (info: ApplicantInfo) => void;
  errors: Record<string, string>;
}

export function ApplicantInfoForm({ applicantInfo, onChange, errors }: ApplicantInfoFormProps) {
  const { t, language } = useLanguage();

  const handleChange = (field: keyof ApplicantInfo, value: string) => {
    onChange({ ...applicantInfo, [field]: value });
  };

  const getLabel = (key: string) => {
    const labels: Record<string, Record<string, string>> = {
      firstName: { en: 'First Name', fr: 'Prénom', ar: 'الاسم الأول' },
      lastName: { en: 'Last Name', fr: 'Nom', ar: 'اسم العائلة' },
      passportNumber: { en: 'Passport Number', fr: 'Numéro de passeport', ar: 'رقم جواز السفر' },
      nationality: { en: 'Nationality', fr: 'Nationalité', ar: 'الجنسية' },
      dateOfBirth: { en: 'Date of Birth', fr: 'Date de naissance', ar: 'تاريخ الميلاد' },
      gender: { en: 'Gender', fr: 'Genre', ar: 'الجنس' },
      phone: { en: 'Phone Number', fr: 'Numéro de téléphone', ar: 'رقم الهاتف' },
      email: { en: 'Email Address', fr: 'Adresse e-mail', ar: 'البريد الإلكتروني' },
      travelDate: { en: 'Travel Date', fr: 'Date de départ', ar: 'تاريخ السفر' },
      returnDate: { en: 'Return Date', fr: 'Date de retour', ar: 'تاريخ العودة' },
      address: { en: 'Residential Address', fr: 'Adresse résidentielle', ar: 'العنوان السكني' },
    };
    return labels[key]?.[language] || labels[key]?.en || key;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        {language === 'ar' ? 'معلومات مقدم الطلب' : language === 'fr' ? 'Informations du demandeur' : 'Applicant Information'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getLabel('firstName')} <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={applicantInfo.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent outline-none ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={getLabel('firstName')}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getLabel('lastName')} <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={applicantInfo.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent outline-none ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={getLabel('lastName')}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getLabel('passportNumber')} <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={applicantInfo.passportNumber}
            onChange={(e) => handleChange('passportNumber', e.target.value.toUpperCase())}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent outline-none ${
              errors.passportNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="AB1234567"
          />
          {errors.passportNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.passportNumber}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getLabel('nationality')} <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={applicantInfo.nationality}
            onChange={(e) => handleChange('nationality', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent outline-none ${
              errors.nationality ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={language === 'ar' ? 'الجزائر' : language === 'fr' ? 'Algérie' : 'Algeria'}
          />
          {errors.nationality && (
            <p className="mt-1 text-sm text-red-600">{errors.nationality}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getLabel('dateOfBirth')} <span className="text-red-600">*</span>
          </label>
          <input
            type="date"
            value={applicantInfo.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent outline-none ${
              errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.dateOfBirth && (
            <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getLabel('gender')} <span className="text-red-600">*</span>
          </label>
          <select
            value={applicantInfo.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent outline-none ${
              errors.gender ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">
              {language === 'ar' ? 'اختر الجنس' : language === 'fr' ? 'Sélectionner' : 'Select Gender'}
            </option>
            <option value="male">
              {language === 'ar' ? 'ذكر' : language === 'fr' ? 'Homme' : 'Male'}
            </option>
            <option value="female">
              {language === 'ar' ? 'أنثى' : language === 'fr' ? 'Femme' : 'Female'}
            </option>
            <option value="other">
              {language === 'ar' ? 'آخر' : language === 'fr' ? 'Autre' : 'Other'}
            </option>
          </select>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getLabel('phone')} <span className="text-red-600">*</span>
          </label>
          <input
            type="tel"
            value={applicantInfo.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent outline-none ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="+213 555 123 456"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getLabel('email')} <span className="text-red-600">*</span>
          </label>
          <input
            type="email"
            value={applicantInfo.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent outline-none ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="name@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getLabel('travelDate')} <span className="text-red-600">*</span>
          </label>
          <input
            type="date"
            value={applicantInfo.travelDate}
            onChange={(e) => handleChange('travelDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent outline-none ${
              errors.travelDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.travelDate && (
            <p className="mt-1 text-sm text-red-600">{errors.travelDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getLabel('returnDate')} <span className="text-red-600">*</span>
          </label>
          <input
            type="date"
            value={applicantInfo.returnDate}
            onChange={(e) => handleChange('returnDate', e.target.value)}
            min={applicantInfo.travelDate || new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent outline-none ${
              errors.returnDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.returnDate && (
            <p className="mt-1 text-sm text-red-600">{errors.returnDate}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {getLabel('address')} <span className="text-red-600">*</span>
        </label>
        <textarea
          value={applicantInfo.address}
          onChange={(e) => handleChange('address', e.target.value)}
          rows={3}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent outline-none ${
            errors.address ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={language === 'ar' ? 'أدخل عنوانك السكني الكامل' : language === 'fr' ? 'Entrez votre adresse complète' : 'Enter your full residential address'}
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address}</p>
        )}
      </div>
    </div>
  );
}
