import { useEffect, useState } from 'react';
import { FileText, Clock, CheckCircle, DollarSign, AlertTriangle, Filter, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { db, auth as firebaseAuth } from '../lib/firebase';
import { collection, query, orderBy, getDocs, doc, getDoc, updateDoc, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Header } from '../components/Header';
import { LegalNotice } from '../components/LegalNotice';

interface Application {
  id: string;
  application_number: string;
  status: string;
  is_urgent: boolean;
  created_at: string;
  submitted_at: string | null;
  user: {
    full_name: string;
    email: string;
  };
  country: {
    name_en: string;
    flag_emoji: string;
  };
  visa_type: {
    name_en: string;
  };
}

export function AdminDashboard() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    awaitingPayment: 0,
    processing: 0,
    completed: 0,
  });

  useEffect(() => {
    if (profile?.role && ['admin', 'super_admin'].includes(profile.role)) {
      loadApplications();
    }
  }, [profile]);

  useEffect(() => {
    let filtered = applications;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app =>
        app.application_number.toLowerCase().includes(query) ||
        app.user.full_name.toLowerCase().includes(query) ||
        app.user.email.toLowerCase().includes(query) ||
        app.country.name_en.toLowerCase().includes(query) ||
        app.visa_type.name_en.toLowerCase().includes(query)
      );
    }

    setFilteredApplications(filtered);
  }, [statusFilter, searchQuery, applications]);

  const loadApplications = async () => {
    try {
      const applicationsRef = collection(db, 'applications');
      const q = query(applicationsRef, orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);

      const apps = await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
          const appData = { id: docSnap.id, ...docSnap.data() };

          const profileDoc = await getDoc(doc(db, 'profiles', appData.user_id));
          const countryDoc = await getDoc(doc(db, 'countries', appData.country_id));
          const visaTypeDoc = await getDoc(doc(db, 'visaTypes', appData.visa_type_id));

          const userAuth = getAuth();
          let email = 'N/A';
          try {
            const currentUser = userAuth.currentUser;
            if (currentUser && currentUser.uid === appData.user_id) {
              email = currentUser.email || 'N/A';
            }
          } catch (e) {
            console.error('Error getting user email:', e);
          }

          return {
            ...appData,
            user: {
              full_name: profileDoc.exists() ? profileDoc.data().full_name : 'Unknown',
              email: email,
            },
            country: countryDoc.exists() ? countryDoc.data() : {},
            visa_type: visaTypeDoc.exists() ? visaTypeDoc.data() : {},
          };
        })
      );

      setApplications(apps as Application[]);
      calculateStats(apps as Application[]);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (apps: Application[]) => {
    setStats({
      total: apps.length,
      pending: apps.filter(a => a.status === 'submitted').length,
      awaitingPayment: apps.filter(a => a.status === 'awaiting_payment').length,
      processing: apps.filter(a => ['processing', 'documents_prepared', 'submitted_to_embassy'].includes(a.status)).length,
      completed: apps.filter(a => ['approved', 'rejected'].includes(a.status)).length,
    });
  };

  const updateApplicationStatus = async (appId: string, newStatus: string) => {
    try {
      const appRef = doc(db, 'applications', appId);
      await updateDoc(appRef, {
        status: newStatus,
        updated_at: Date.now(),
      });

      await addDoc(collection(db, 'statusLogs'), {
        application_id: appId,
        old_status: null,
        new_status: newStatus,
        changed_by: profile?.id,
        notes: `Status updated to ${newStatus} by admin`,
        created_at: Date.now(),
      });

      await loadApplications();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const confirmPayment = async (appId: string) => {
    try {
      const app = applications.find(a => a.id === appId);
      if (!app) return;

      const visaType = app.visa_type as any;
      const baseFee = visaType.base_fee || 0;

      await addDoc(collection(db, 'payments'), {
        application_id: appId,
        amount: baseFee,
        currency: 'DZD',
        payment_method: null,
        payment_reference: null,
        status: 'confirmed',
        confirmed_by: profile?.id,
        confirmed_at: Date.now(),
        notes: 'Payment confirmed by admin',
        created_at: Date.now(),
        updated_at: Date.now(),
      });

      await updateApplicationStatus(appId, 'payment_confirmed');

      alert('Payment confirmed successfully');
    } catch (error) {
      console.error('Error confirming payment:', error);
      alert('Failed to confirm payment');
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('admin')}</h1>
          <p className="text-gray-600">Application Management Dashboard</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8">
          <div className="flex items-center space-x-4">
            <a
              href="/admin"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#00C2A8] hover:bg-gray-50 rounded-lg transition-colors"
            >
              Applications
            </a>
            <a
              href="/admin/countries"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#00C2A8] hover:bg-gray-50 rounded-lg transition-colors"
            >
              Countries
            </a>
            <a
              href="/admin/visa-types"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#00C2A8] hover:bg-gray-50 rounded-lg transition-colors"
            >
              Visa Types
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-gray-400" />
              <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
            </div>
            <p className="text-sm text-gray-600">{t('allApplications')}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-blue-600">{stats.pending}</span>
            </div>
            <p className="text-sm text-gray-600">{t('pendingReview')}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-600">{stats.awaitingPayment}</span>
            </div>
            <p className="text-sm text-gray-600">{t('awaitingPayment')}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 text-orange-400" />
              <span className="text-2xl font-bold text-orange-600">{stats.processing}</span>
            </div>
            <p className="text-sm text-gray-600">{t('inProgress')}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-green-600">{stats.completed}</span>
            </div>
            <p className="text-sm text-gray-600">{t('completed')}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, app number, country..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent outline-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent outline-none"
              >
                <option value="all">All Applications</option>
                <option value="submitted">Submitted</option>
                <option value="awaiting_payment">Awaiting Payment</option>
                <option value="payment_confirmed">Payment Confirmed</option>
                <option value="processing">Processing</option>
                <option value="documents_prepared">Documents Prepared</option>
                <option value="submitted_to_embassy">Submitted to Embassy</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-[#00C2A8] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">{t('loading')}</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-500">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'No applications have been submitted yet'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Application
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destination
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {app.application_number}
                          </span>
                          {app.is_urgent && (
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                              URGENT
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {app.user.full_name}
                          </div>
                          <div className="text-sm text-gray-500">{app.user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{app.country.flag_emoji}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {app.country.name_en}
                            </div>
                            <div className="text-sm text-gray-500">{app.visa_type.name_en}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <a
                            href={`/admin/application/${app.id}`}
                            className="text-[#00C2A8] hover:underline"
                          >
                            Review
                          </a>
                          {app.status === 'awaiting_payment' && (
                            <button
                              onClick={() => confirmPayment(app.id)}
                              className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                            >
                              Confirm Payment
                            </button>
                          )}
                          {app.status === 'submitted' && (
                            <button
                              onClick={() => updateApplicationStatus(app.id, 'awaiting_payment')}
                              className="px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
                            >
                              Request Payment
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
        )}
      </div>
      <LegalNotice />
    </div>
  );
}
