import { useEffect, useState } from 'react';
import { Plus, Edit2, Globe, ExternalLink, Save, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { db, Country } from '../../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { Header } from '../../components/Header';
import { LegalNotice } from '../../components/LegalNotice';

export function CountryManagement() {
  const { profile } = useAuth();
  const { t, language } = useLanguage();
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Country>>({
    code: '',
    name_en: '',
    name_fr: '',
    name_ar: '',
    flag_emoji: '',
    is_active: true,
    processing_time_days: 7,
    portal_link: '',
    admin_instructions_en: '',
    admin_instructions_fr: '',
    admin_instructions_ar: '',
  });

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      const countriesRef = collection(db, 'countries');
      const querySnapshot = await getDocs(countriesRef);
      const countriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Country[];
      setCountries(countriesData);
    } catch (error) {
      console.error('Error loading countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingCountry) {
        const countryRef = doc(db, 'countries', editingCountry.id);
        await updateDoc(countryRef, {
          ...formData,
          updated_at: Date.now(),
        });
      } else {
        await addDoc(collection(db, 'countries'), {
          ...formData,
          created_at: Date.now(),
          updated_at: Date.now(),
        });
      }
      setShowForm(false);
      setEditingCountry(null);
      setFormData({
        code: '',
        name_en: '',
        name_fr: '',
        name_ar: '',
        flag_emoji: '',
        is_active: true,
        processing_time_days: 7,
        portal_link: '',
        admin_instructions_en: '',
        admin_instructions_fr: '',
        admin_instructions_ar: '',
      });
      await loadCountries();
    } catch (error) {
      console.error('Error saving country:', error);
      alert('Failed to save country');
    }
  };

  const handleEdit = (country: Country) => {
    setEditingCountry(country);
    setFormData(country);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCountry(null);
    setFormData({
      code: '',
      name_en: '',
      name_fr: '',
      name_ar: '',
      flag_emoji: '',
      is_active: true,
      processing_time_days: 7,
      portal_link: '',
      admin_instructions_en: '',
      admin_instructions_fr: '',
      admin_instructions_ar: '',
    });
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Country Management</h1>
            <p className="text-gray-600">Configure countries and visa portals</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-[#00C2A8] text-white px-6 py-3 rounded-lg hover:bg-[#00B098] transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Country</span>
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingCountry ? 'Edit Country' : 'Add New Country'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country Code (ISO)
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent outline-none"
                  placeholder="SA"
                  maxLength={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flag Emoji
                </label>
                <input
                  type="text"
                  value={formData.flag_emoji}
                  onChange={(e) => setFormData({ ...formData, flag_emoji: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent outline-none"
                  placeholder="🇸🇦"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name (English)
                </label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent outline-none"
                  placeholder="Saudi Arabia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name (French)
                </label>
                <input
                  type="text"
                  value={formData.name_fr}
                  onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent outline-none"
                  placeholder="Arabie Saoudite"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name (Arabic)
                </label>
                <input
                  type="text"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent outline-none"
                  placeholder="المملكة العربية السعودية"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Processing Time (Days)
                </label>
                <input
                  type="number"
                  value={formData.processing_time_days}
                  onChange={(e) => setFormData({ ...formData, processing_time_days: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent outline-none"
                  min="1"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Official Visa Portal Link
                </label>
                <input
                  type="url"
                  value={formData.portal_link || ''}
                  onChange={(e) => setFormData({ ...formData, portal_link: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent outline-none"
                  placeholder="https://visa.gov.example"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Instructions (English)
                </label>
                <textarea
                  value={formData.admin_instructions_en || ''}
                  onChange={(e) => setFormData({ ...formData, admin_instructions_en: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent outline-none"
                  rows={4}
                  placeholder="Step-by-step instructions for admins to submit applications..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Instructions (French)
                </label>
                <textarea
                  value={formData.admin_instructions_fr || ''}
                  onChange={(e) => setFormData({ ...formData, admin_instructions_fr: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent outline-none"
                  rows={4}
                  placeholder="Instructions étape par étape pour les administrateurs..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Instructions (Arabic)
                </label>
                <textarea
                  value={formData.admin_instructions_ar || ''}
                  onChange={(e) => setFormData({ ...formData, admin_instructions_ar: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent outline-none"
                  rows={4}
                  placeholder="تعليمات خطوة بخطوة للمسؤولين..."
                  dir="rtl"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 text-[#00C2A8] focus:ring-[#00C2A8] border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-8">
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 bg-[#00C2A8] text-white px-6 py-3 rounded-lg hover:bg-[#00B098] transition-colors"
              >
                <Save className="w-5 h-5" />
                <span>Save Country</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-[#00C2A8] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading countries...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {countries.map((country) => (
              <div
                key={country.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="text-5xl">{country.flag_emoji}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {language === 'ar' ? country.name_ar :
                           language === 'fr' ? country.name_fr :
                           country.name_en}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                          {country.code}
                        </span>
                        {country.is_active ? (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Processing Time: {country.processing_time_days} days
                      </p>
                      {country.portal_link && (
                        <a
                          href={country.portal_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-sm text-[#00C2A8] hover:underline"
                        >
                          <Globe className="w-4 h-4" />
                          <span>Official Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {country.admin_instructions_en && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs font-medium text-blue-900 mb-1">Admin Instructions:</p>
                          <p className="text-sm text-blue-800 whitespace-pre-wrap">
                            {language === 'ar' ? country.admin_instructions_ar :
                             language === 'fr' ? country.admin_instructions_fr :
                             country.admin_instructions_en}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleEdit(country)}
                    className="flex items-center space-x-2 text-[#00C2A8] hover:text-[#00B098] px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Edit</span>
                  </button>
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
