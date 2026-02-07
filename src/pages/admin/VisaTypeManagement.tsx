import { useEffect, useState } from 'react';
import { Plus, Edit2, Save, X, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { db, Country, VisaType, SubmissionStep, StatusFlowStep } from '../../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, doc, query, where } from 'firebase/firestore';
import { Header } from '../../components/Header';
import { LegalNotice } from '../../components/LegalNotice';

export function VisaTypeManagement() {
  const { profile } = useAuth();
  const { t, language } = useLanguage();
  const [countries, setCountries] = useState<Country[]>([]);
  const [visaTypes, setVisaTypes] = useState<VisaType[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [editingVisaType, setEditingVisaType] = useState<VisaType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<VisaType>>({
    country_id: '',
    code: '',
    name_en: '',
    name_fr: '',
    name_ar: '',
    description_en: '',
    description_fr: '',
    description_ar: '',
    base_fee: 0,
    processing_time_days: 7,
    is_active: true,
    requirements: {},
    submission_steps: [],
    status_flow: [],
    validation_rules: {},
    helper_notes_en: '',
    helper_notes_fr: '',
    helper_notes_ar: '',
  });

  useEffect(() => {
    loadCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      loadVisaTypes(selectedCountry);
    }
  }, [selectedCountry]);

  const loadCountries = async () => {
    try {
      const countriesRef = collection(db, 'countries');
      const querySnapshot = await getDocs(countriesRef);
      const countriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Country[];
      setCountries(countriesData);
      if (countriesData.length > 0) {
        setSelectedCountry(countriesData[0].id);
      }
    } catch (error) {
      console.error('Error loading countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVisaTypes = async (countryId: string) => {
    try {
      const visaTypesRef = collection(db, 'visaTypes');
      const q = query(visaTypesRef, where('country_id', '==', countryId));
      const querySnapshot = await getDocs(q);
      const visaTypesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VisaType[];
      setVisaTypes(visaTypesData);
    } catch (error) {
      console.error('Error loading visa types:', error);
    }
  };

  const addSubmissionStep = () => {
    const newStep: SubmissionStep = {
      step_number: (formData.submission_steps?.length || 0) + 1,
      title_en: '',
      title_fr: '',
      title_ar: '',
      description_en: '',
      description_fr: '',
      description_ar: '',
    };
    setFormData({
      ...formData,
      submission_steps: [...(formData.submission_steps || []), newStep]
    });
  };

  const updateSubmissionStep = (index: number, field: string, value: string) => {
    const steps = [...(formData.submission_steps || [])];
    steps[index] = { ...steps[index], [field]: value };
    setFormData({ ...formData, submission_steps: steps });
  };

  const removeSubmissionStep = (index: number) => {
    const steps = [...(formData.submission_steps || [])];
    steps.splice(index, 1);
    steps.forEach((step, i) => {
      step.step_number = i + 1;
    });
    setFormData({ ...formData, submission_steps: steps });
  };

  const moveSubmissionStep = (index: number, direction: 'up' | 'down') => {
    const steps = [...(formData.submission_steps || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;

    [steps[index], steps[newIndex]] = [steps[newIndex], steps[index]];
    steps.forEach((step, i) => {
      step.step_number = i + 1;
    });
    setFormData({ ...formData, submission_steps: steps });
  };

  const addStatusFlowStep = () => {
    const newStatus: StatusFlowStep = {
      status: '',
      name_en: '',
      name_fr: '',
      name_ar: '',
      order: (formData.status_flow?.length || 0) + 1,
    };
    setFormData({
      ...formData,
      status_flow: [...(formData.status_flow || []), newStatus]
    });
  };

  const updateStatusFlowStep = (index: number, field: string, value: string | number) => {
    const flow = [...(formData.status_flow || [])];
    flow[index] = { ...flow[index], [field]: value };
    setFormData({ ...formData, status_flow: flow });
  };

  const removeStatusFlowStep = (index: number) => {
    const flow = [...(formData.status_flow || [])];
    flow.splice(index, 1);
    flow.forEach((step, i) => {
      step.order = i + 1;
    });
    setFormData({ ...formData, status_flow: flow });
  };

  const handleSave = async () => {
    try {
      if (editingVisaType) {
        const visaTypeRef = doc(db, 'visaTypes', editingVisaType.id);
        await updateDoc(visaTypeRef, {
          ...formData,
          updated_at: Date.now(),
        });
      } else {
        await addDoc(collection(db, 'visaTypes'), {
          ...formData,
          country_id: selectedCountry,
          created_at: Date.now(),
          updated_at: Date.now(),
        });
      }
      setShowForm(false);
      setEditingVisaType(null);
      resetForm();
      await loadVisaTypes(selectedCountry);
    } catch (error) {
      console.error('Error saving visa type:', error);
      alert('Failed to save visa type');
    }
  };

  const handleEdit = (visaType: VisaType) => {
    setEditingVisaType(visaType);
    setFormData(visaType);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingVisaType(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      country_id: '',
      code: '',
      name_en: '',
      name_fr: '',
      name_ar: '',
      description_en: '',
      description_fr: '',
      description_ar: '',
      base_fee: 0,
      processing_time_days: 7,
      is_active: true,
      requirements: {},
      submission_steps: [],
      status_flow: [],
      validation_rules: {},
      helper_notes_en: '',
      helper_notes_fr: '',
      helper_notes_ar: '',
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Visa Type Management</h1>
          <p className="text-gray-600">Configure visa types, submission steps, and status flows</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Country
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent outline-none"
          >
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.flag_emoji} {country.name_en}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-[#00C2A8] text-white px-6 py-3 rounded-lg hover:bg-[#00B098] transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Visa Type</span>
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingVisaType ? 'Edit Visa Type' : 'Add New Visa Type'}
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visa Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent outline-none"
                    placeholder="umrah"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Fee (DZD)
                  </label>
                  <input
                    type="number"
                    value={formData.base_fee}
                    onChange={(e) => setFormData({ ...formData, base_fee: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent outline-none"
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
                    placeholder="Umrah Visa"
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
                    placeholder="Visa Omra"
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
                    placeholder="تأشيرة عمرة"
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
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (English)
                </label>
                <textarea
                  value={formData.description_en || ''}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent outline-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Helper Notes (English)
                </label>
                <textarea
                  value={formData.helper_notes_en || ''}
                  onChange={(e) => setFormData({ ...formData, helper_notes_en: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C2A8] focus:border-transparent outline-none"
                  rows={3}
                  placeholder="Additional notes and tips for processing this visa type..."
                />
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Submission Steps</h3>
                  <button
                    onClick={addSubmissionStep}
                    className="flex items-center space-x-2 text-[#00C2A8] hover:text-[#00B098]"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Add Step</span>
                  </button>
                </div>

                {formData.submission_steps?.map((step, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-900">Step {step.step_number}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => moveSubmissionStep(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveSubmissionStep(index, 'down')}
                          disabled={index === (formData.submission_steps?.length || 0) - 1}
                          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeSubmissionStep(index)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <input
                        type="text"
                        value={step.title_en}
                        onChange={(e) => updateSubmissionStep(index, 'title_en', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Step Title (English)"
                      />
                      <textarea
                        value={step.description_en}
                        onChange={(e) => updateSubmissionStep(index, 'description_en', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        rows={2}
                        placeholder="Step Description (English)"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Status Flow</h3>
                  <button
                    onClick={addStatusFlowStep}
                    className="flex items-center space-x-2 text-[#00C2A8] hover:text-[#00B098]"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Add Status</span>
                  </button>
                </div>

                {formData.status_flow?.map((status, index) => (
                  <div key={index} className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500 w-8">{status.order}.</span>
                    <input
                      type="text"
                      value={status.status}
                      onChange={(e) => updateStatusFlowStep(index, 'status', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="status_code"
                    />
                    <input
                      type="text"
                      value={status.name_en}
                      onChange={(e) => updateStatusFlowStep(index, 'name_en', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Status Name (English)"
                    />
                    <button
                      onClick={() => removeStatusFlowStep(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div>
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
                <span>Save Visa Type</span>
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

        <div className="grid gap-6">
          {visaTypes.map((visaType) => (
            <div
              key={visaType.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {language === 'ar' ? visaType.name_ar :
                     language === 'fr' ? visaType.name_fr :
                     visaType.name_en}
                  </h3>
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                      {visaType.code}
                    </span>
                    <span className="text-sm text-gray-600">
                      {visaType.base_fee} DZD
                    </span>
                    <span className="text-sm text-gray-600">
                      {visaType.processing_time_days} days
                    </span>
                    {visaType.is_active ? (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleEdit(visaType)}
                  className="flex items-center space-x-2 text-[#00C2A8] hover:text-[#00B098] px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Edit</span>
                </button>
              </div>

              {visaType.submission_steps && visaType.submission_steps.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">Submission Steps:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    {visaType.submission_steps.map((step) => (
                      <li key={step.step_number} className="text-sm text-blue-800">
                        {language === 'ar' ? step.title_ar :
                         language === 'fr' ? step.title_fr :
                         step.title_en}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {visaType.status_flow && visaType.status_flow.length > 0 && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-900 mb-2">Status Flow:</p>
                  <div className="flex items-center space-x-2 flex-wrap gap-2">
                    {visaType.status_flow.sort((a, b) => a.order - b.order).map((status, index) => (
                      <div key={index} className="flex items-center">
                        <span className="px-3 py-1 text-xs font-medium bg-white border border-green-300 text-green-800 rounded">
                          {language === 'ar' ? status.name_ar :
                           language === 'fr' ? status.name_fr :
                           status.name_en}
                        </span>
                        {index < visaType.status_flow.length - 1 && (
                          <span className="mx-2 text-green-600">→</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <LegalNotice />
    </div>
  );
}
