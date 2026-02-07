import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { db } from '../../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, addDoc, orderBy } from 'firebase/firestore';
import { Header } from '../../components/Header';
import { LegalNotice } from '../../components/LegalNotice';
import { ExternalLink, CheckCircle, Clock, AlertTriangle, FileText, User, Calendar, DollarSign, Copy, Check } from 'lucide-react';

interface Application {
  id: string;
  application_number: string;
  status: string;
  is_urgent: boolean;
  created_at: number;
  submitted_at: number | null;
  travel_data: any;
  admin_notes: string | null;
  user_id: string;
  country_id: string;
  visa_type_id: string;
}

interface SubmissionStep {
  step_number: number;
  title_en: string;
  title_fr: string;
  title_ar: string;
  description_en: string;
  description_fr: string;
  description_ar: string;
}

interface StatusFlowStep {
  status: string;
  name_en: string;
  name_fr: string;
  name_ar: string;
  order: number;
}

interface VisaType {
  name_en: string;
  name_fr: string;
  name_ar: string;
  base_fee: number;
  processing_time_days: number;
  submission_steps: SubmissionStep[];
  status_flow: StatusFlowStep[];
  helper_notes_en: string | null;
  helper_notes_fr: string | null;
  helper_notes_ar: string | null;
}

interface Country {
  name_en: string;
  name_fr: string;
  name_ar: string;
  flag_emoji: string;
  portal_link: string | null;
  admin_instructions_en: string | null;
  admin_instructions_fr: string | null;
  admin_instructions_ar: string | null;
}

interface Profile {
  full_name: string;
  email: string;
  phone: string;
}

export function ApplicationDetail() {
  const { profile } = useAuth();
  const { t, language } = useLanguage();
  const [application, setApplication] = useState<Application | null>(null);
  const [visaType, setVisaType] = useState<VisaType | null>(null);
  const [country, setCountry] = useState<Country | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [statusLogs, setStatusLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const appId = window.location.pathname.split('/').pop();
    if (appId) {
      loadApplication(appId);
    }
  }, []);

  const loadApplication = async (appId: string) => {
    try {
      const appDoc = await getDoc(doc(db, 'applications', appId));
      if (!appDoc.exists()) {
        alert('Application not found');
        window.location.href = '/admin';
        return;
      }

      const appData = { id: appDoc.id, ...appDoc.data() } as Application;
      setApplication(appData);
      setNewStatus(appData.status);
      setAdminNotes(appData.admin_notes || '');

      const visaTypeDoc = await getDoc(doc(db, 'visaTypes', appData.visa_type_id));
      if (visaTypeDoc.exists()) {
        setVisaType(visaTypeDoc.data() as VisaType);
      }

      const countryDoc = await getDoc(doc(db, 'countries', appData.country_id));
      if (countryDoc.exists()) {
        setCountry(countryDoc.data() as Country);
      }

      const profileDoc = await getDoc(doc(db, 'profiles', appData.user_id));
      if (profileDoc.exists()) {
        setUserProfile(profileDoc.data() as Profile);
      }

      const docsQuery = query(collection(db, 'documents'), where('application_id', '==', appId));
      const docsSnapshot = await getDocs(docsQuery);
      setDocuments(docsSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));

      const logsQuery = query(
        collection(db, 'statusLogs'),
        where('application_id', '==', appId),
        orderBy('created_at', 'desc')
      );
      const logsSnapshot = await getDocs(logsQuery);
      setStatusLogs(logsSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error('Error loading application:', error);
      alert('Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!application || !profile) return;

    setUpdating(true);
    try {
      await updateDoc(doc(db, 'applications', application.id), {
        status: newStatus,
        admin_notes: adminNotes,
        updated_at: Date.now(),
      });

      await addDoc(collection(db, 'statusLogs'), {
        application_id: application.id,
        old_status: application.status,
        new_status: newStatus,
        changed_by: profile.id,
        notes: adminNotes || `Status updated to ${newStatus}`,
        created_at: Date.now(),
      });

      alert('Status updated successfully');
      window.location.reload();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard');
    }
  };

  const getText = (obj: any, field: string) => {
    if (!obj) return '';
    const key = language === 'ar' ? `${field}_ar` :
                language === 'fr' ? `${field}_fr` :
                `${field}_en`;
    return obj[key] || obj[`${field}_en`] || '';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: 'bg-blue-100 text-blue-800',
      awaiting_payment: 'bg-yellow-100 text-yellow-800',
      payment_confirmed: 'bg-green-100 text-green-800',
      processing: 'bg-purple-100 text-purple-800',
      documents_prepared: 'bg-indigo-100 text-indigo-800',
      submitted_to_embassy: 'bg-orange-100 text-orange-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">Access denied. Admin privileges required.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-[#00C2A8] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!application || !visaType || !country) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">Application not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <a href="/admin" className="text-[#00C2A8] hover:underline">
            ← Back to Dashboard
          </a>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Application {application.application_number}
              </h1>
              <div className="flex items-center space-x-2">
                <span className="text-xl">{country.flag_emoji}</span>
                <span className="text-gray-600">
                  {getText(country, 'name')} - {getText(visaType, 'name')}
                </span>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
              {application.status}
            </span>
          </div>
        </div>

        <div className="mb-6 bg-gradient-to-r from-[#0F4C81] to-[#00C2A8] rounded-xl p-6 text-white shadow-lg">
          <h2 className="text-xl font-bold mb-4">Quick Reference Card</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <div className="text-xs opacity-80 mb-1">Full Name</div>
              <div className="font-mono font-medium flex items-center justify-between">
                <span className="truncate">{userProfile?.full_name || 'N/A'}</span>
                {userProfile?.full_name && (
                  <button
                    onClick={() => copyToClipboard(userProfile.full_name, 'quickName')}
                    className="ml-2 p-1 hover:bg-white/20 rounded"
                  >
                    {copiedField === 'quickName' ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <div className="text-xs opacity-80 mb-1">Email</div>
              <div className="font-mono font-medium flex items-center justify-between text-sm">
                <span className="truncate">{userProfile?.email || 'N/A'}</span>
                {userProfile?.email && (
                  <button
                    onClick={() => copyToClipboard(userProfile.email, 'quickEmail')}
                    className="ml-2 p-1 hover:bg-white/20 rounded"
                  >
                    {copiedField === 'quickEmail' ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <div className="text-xs opacity-80 mb-1">Phone</div>
              <div className="font-mono font-medium flex items-center justify-between">
                <span className="truncate">{userProfile?.phone || 'N/A'}</span>
                {userProfile?.phone && (
                  <button
                    onClick={() => copyToClipboard(userProfile.phone, 'quickPhone')}
                    className="ml-2 p-1 hover:bg-white/20 rounded"
                  >
                    {copiedField === 'quickPhone' ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <div className="text-xs opacity-80 mb-1">Departure</div>
              <div className="font-mono font-medium flex items-center justify-between">
                <span>{application.travel_data?.departure || 'N/A'}</span>
                {application.travel_data?.departure && (
                  <button
                    onClick={() => copyToClipboard(application.travel_data.departure, 'quickDeparture')}
                    className="ml-2 p-1 hover:bg-white/20 rounded"
                  >
                    {copiedField === 'quickDeparture' ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <div className="text-xs opacity-80 mb-1">Return</div>
              <div className="font-mono font-medium flex items-center justify-between">
                <span>{application.travel_data?.return || 'N/A'}</span>
                {application.travel_data?.return && (
                  <button
                    onClick={() => copyToClipboard(application.travel_data.return, 'quickReturn')}
                    className="ml-2 p-1 hover:bg-white/20 rounded"
                  >
                    {copiedField === 'quickReturn' ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <div className="text-xs opacity-80 mb-1">App Number</div>
              <div className="font-mono font-medium flex items-center justify-between text-sm">
                <span>{application.application_number}</span>
                <button
                  onClick={() => copyToClipboard(application.application_number, 'quickAppNum')}
                  className="ml-2 p-1 hover:bg-white/20 rounded"
                >
                  {copiedField === 'quickAppNum' ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Applicant Information</span>
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Full Name:</span>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-gray-900 font-medium">{userProfile?.full_name || 'N/A'}</p>
                    {userProfile?.full_name && (
                      <button
                        onClick={() => copyToClipboard(userProfile.full_name, 'fullName')}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedField === 'fullName' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Email:</span>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-gray-900 font-medium">{userProfile?.email || 'N/A'}</p>
                    {userProfile?.email && (
                      <button
                        onClick={() => copyToClipboard(userProfile.email, 'email')}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedField === 'email' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Phone:</span>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-gray-900 font-medium">{userProfile?.phone || 'N/A'}</p>
                    {userProfile?.phone && (
                      <button
                        onClick={() => copyToClipboard(userProfile.phone, 'phone')}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedField === 'phone' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Application Number:</span>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-gray-900 font-medium font-mono">{application.application_number}</p>
                    <button
                      onClick={() => copyToClipboard(application.application_number, 'appNumber')}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedField === 'appNumber' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Travel Information</span>
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Departure Date:</span>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-gray-900 font-medium">
                      {application.travel_data?.departure || 'N/A'}
                    </p>
                    {application.travel_data?.departure && (
                      <button
                        onClick={() => copyToClipboard(application.travel_data.departure, 'departure')}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedField === 'departure' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Return Date:</span>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-gray-900 font-medium">
                      {application.travel_data?.return || 'N/A'}
                    </p>
                    {application.travel_data?.return && (
                      <button
                        onClick={() => copyToClipboard(application.travel_data.return, 'return')}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedField === 'return' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {country.portal_link && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <ExternalLink className="w-5 h-5 text-blue-600" />
                  <span>Embassy Portal</span>
                </h2>
                <div className="space-y-3">
                  <div className="bg-white/80 rounded-lg p-3 font-mono text-sm text-gray-700 break-all">
                    {country.portal_link}
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={country.portal_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <span>Open Portal</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => copyToClipboard(country.portal_link!, 'portalLink')}
                      className="px-4 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                      title="Copy portal link"
                    >
                      {copiedField === 'portalLink' ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {visaType.submission_steps && visaType.submission_steps.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Submission Steps Guide</span>
                </h2>
                <div className="space-y-4">
                  {visaType.submission_steps
                    .sort((a, b) => a.step_number - b.step_number)
                    .map((step, index) => (
                      <div key={step.step_number} className="bg-white/80 rounded-lg p-4">
                        <div className="flex space-x-4">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#0F4C81] to-[#00C2A8] text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                            {step.step_number}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg">{getText(step, 'title')}</h3>
                            <p className="text-sm text-gray-700 mt-2 leading-relaxed">{getText(step, 'description')}</p>
                          </div>
                        </div>
                        {index < visaType.submission_steps.length - 1 && (
                          <div className="ml-5 mt-2 border-l-2 border-green-300 h-4"></div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {getText(country, 'admin_instructions') && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Instructions</h2>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                  {getText(country, 'admin_instructions')}
                </pre>
              </div>
            )}

            {getText(visaType, 'helper_notes') && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Helper Notes</h2>
                <p className="text-sm text-gray-700">{getText(visaType, 'helper_notes')}</p>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Uploaded Documents</span>
              </h2>
              {documents.length === 0 ? (
                <p className="text-gray-500">No documents uploaded yet</p>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.file_name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <a
                        href={doc.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00C2A8] hover:underline text-sm"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Status History</span>
              </h2>
              {statusLogs.length === 0 ? (
                <p className="text-gray-500">No status changes yet</p>
              ) : (
                <div className="space-y-3">
                  {statusLogs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {log.old_status || 'Created'} → {log.new_status}
                        </p>
                        {log.notes && (
                          <p className="text-xs text-gray-600 mt-1">{log.notes}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Update Status</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent outline-none"
                  >
                    {visaType.status_flow && visaType.status_flow.length > 0 ? (
                      visaType.status_flow
                        .sort((a, b) => a.order - b.order)
                        .map((statusStep) => (
                          <option key={statusStep.status} value={statusStep.status}>
                            {getText(statusStep, 'name')}
                          </option>
                        ))
                    ) : (
                      <>
                        <option value="submitted">Submitted</option>
                        <option value="awaiting_payment">Awaiting Payment</option>
                        <option value="payment_confirmed">Payment Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="documents_prepared">Documents Prepared</option>
                        <option value="submitted_to_embassy">Submitted to Embassy</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent outline-none resize-none"
                    placeholder="Add notes about this status update..."
                  />
                </div>

                <button
                  onClick={handleUpdateStatus}
                  disabled={updating || newStatus === application.status}
                  className="w-full px-4 py-3 bg-[#00C2A8] text-white rounded-lg hover:bg-[#00B098] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Fee Information</span>
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Fee:</span>
                  <span className="font-semibold text-gray-900">{visaType.base_fee} DZD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Time:</span>
                  <span className="font-semibold text-gray-900">{visaType.processing_time_days} days</span>
                </div>
                {application.is_urgent && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <span className="text-sm text-red-800 font-medium">⚡ URGENT APPLICATION</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <LegalNotice />
    </div>
  );
}
