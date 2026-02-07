import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function LegalNotice() {
  const { t } = useLanguage();

  return (
    <div className="bg-yellow-50 border-t border-yellow-200 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">
            <strong>IMPORTANT:</strong> {t('legalNotice')}
          </p>
        </div>
      </div>
    </div>
  );
}
