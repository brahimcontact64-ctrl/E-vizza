import { useEffect, useState } from 'react';
import { Plus, FileText, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { Header } from '../components/Header';
import { LegalNotice } from '../components/LegalNotice';

interface Application {
  id: string;
  application_number: string;
  status: string;
  is_urgent: boolean;
  created_at: string;
  submitted_at: string | null;
  country: {
    name_en: string;
    name_fr: string;
    name_ar: string;
    flag_emoji: string;
  };
  visa_type: {
    name_en: string;
    name_fr: string;
    name_ar: string;
  };
}

export function Dashboard() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, [user]);

  const loadApplications = async () => {
    if (!user) return;

    try {
      const applicationsRef = collection(db, 'applications');
      const q = query(
        applicationsRef,
        where('user_id', '==', user.uid),
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const apps = await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
          const appData = { id: docSnap.id, ...docSnap.data() };

          const countryDoc = await getDoc(doc(db, 'countries', appData.country_id));
          const visaTypeDoc = await getDoc(doc(db, 'visaTypes', appData.visa_type_id));

          return {
            ...appData,
            country: countryDoc.exists() ? countryDoc.data() : {},
            visa_type: visaTypeDoc.exists() ? visaTypeDoc.data() : {},
          };
        })
      );

      setApplications(apps as Application[]);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
      case 'documents_prepared':
      case 'submitted_to_embassy':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'awaiting_payment':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'processing':
      case 'documents_prepared':
      case 'submitted_to_embassy':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'awaiting_payment':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'payment_confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCountryName = (app: Application) => {
    return language === 'ar' ? app.country.name_ar :
           language === 'fr' ? app.country.name_fr :
           app.country.name_en;
  };

  const getVisaTypeName = (app: Application) => {
    return language === 'ar' ? app.visa_type.name_ar :
           language === 'fr' ? app.visa_type.name_fr :
           app.visa_type.name_en;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('dashboard')}</h1>
          <p className="text-sm sm:text-base text-gray-600">{t('myApplications')}</p>
        </div>

        <div className="mb-4 sm:mb-6">
          <a
            href="/new-application"
            className="inline-flex items-center justify-center w-full sm:w-auto space-x-2 bg-gradient-to-r from-[#0F4C81] to-[#00C2A8] text-white px-6 py-3 rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">{t('newApplication')}</span>
          </a>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-[#00C2A8] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm sm:text-base text-gray-600">{t('loading')}</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-8 sm:py-12 bg-white rounded-xl border-2 border-dashed border-gray-300 px-4">
            <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Start your visa application journey today</p>
            <a
              href="/new-application"
              className="inline-flex items-center space-x-2 bg-[#00C2A8] text-white px-6 py-3 rounded-lg hover:bg-[#00B098] transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">{t('newApplication')}</span>
            </a>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                    <div className="text-3xl sm:text-4xl flex-shrink-0">{app.country.flag_emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                          {getCountryName(app)}
                        </h3>
                        {app.is_urgent && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full whitespace-nowrap">
                            {t('urgent')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3">{getVisaTypeName(app)}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-500">
                        <span className="truncate">{t('applicationNumber')}: {app.application_number}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{new Date(app.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:space-y-3">
                    <div className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 rounded-lg border ${getStatusColor(app.status)}`}>
                      {getStatusIcon(app.status)}
                      <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{t(app.status)}</span>
                    </div>
                    <a
                      href={`/application/${app.id}`}
                      className="text-xs sm:text-sm text-[#00C2A8] font-medium hover:underline whitespace-nowrap"
                    >
                      {t('viewDetails')} →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <LegalNotice />
    </div>
  );
}
