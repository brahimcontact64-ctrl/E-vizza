import { useState } from 'react';
import { Upload, X, CheckCircle, Eye, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

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

interface UploadedFile {
  file: File;
  preview?: string;
  progress: number;
}

interface DocumentUploadProps {
  requirements: DocumentRequirement[];
  uploadedFiles: Record<string, UploadedFile>;
  onFileUpload: (reqId: string, file: File) => void;
  onFileRemove: (reqId: string) => void;
}

export function DocumentUpload({
  requirements,
  uploadedFiles,
  onFileUpload,
  onFileRemove,
}: DocumentUploadProps) {
  const { language } = useLanguage();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const getName = (req: DocumentRequirement) => {
    return language === 'ar' ? req.name_ar :
           language === 'fr' ? req.name_fr :
           req.name_en;
  };

  const getDescription = (req: DocumentRequirement) => {
    return language === 'ar' ? req.description_ar :
           language === 'fr' ? req.description_fr :
           req.description_en;
  };

  const handleFileSelect = (reqId: string, file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onFileUpload(reqId, file);
      };
      reader.readAsDataURL(file);
    } else {
      onFileUpload(reqId, file);
    }
  };

  const handlePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else if (file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
        {language === 'ar' ? 'تحميل المستندات المطلوبة' :
         language === 'fr' ? 'Télécharger les documents requis' :
         'Upload Required Documents'}
      </h2>
      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
        {language === 'ar' ? 'يرجى تحميل جميع المستندات المطلوبة بتنسيق PDF أو صورة (JPEG، PNG)' :
         language === 'fr' ? 'Veuillez télécharger tous les documents requis au format PDF ou image (JPEG, PNG)' :
         'Please upload all required documents in PDF or image format (JPEG, PNG)'}
      </p>

      <div className="space-y-3 sm:space-y-4">
        {requirements.map((req) => {
          const uploaded = uploadedFiles[req.id];

          return (
            <div
              key={req.id}
              className="p-4 sm:p-6 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                    {getName(req)}
                    {req.is_required && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded whitespace-nowrap">
                        {language === 'ar' ? 'مطلوب' : language === 'fr' ? 'Requis' : 'Required'}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">{getDescription(req)}</p>
                </div>
                {uploaded && (
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0 ml-2 sm:ml-4" />
                )}
              </div>

              {uploaded ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                          {uploaded.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(uploaded.file.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2 ml-2 sm:ml-4">
                      {uploaded.file.type.startsWith('image/') && (
                        <button
                          onClick={() => handlePreview(uploaded.file)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={language === 'ar' ? 'معاينة' : language === 'fr' ? 'Aperçu' : 'Preview'}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <label className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                        title={language === 'ar' ? 'استبدال' : language === 'fr' ? 'Remplacer' : 'Replace'}
                      >
                        <RefreshCw className="w-4 h-4" />
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileSelect(req.id, file);
                          }}
                          className="hidden"
                          accept="image/*,application/pdf"
                        />
                      </label>
                      <button
                        onClick={() => onFileRemove(req.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={language === 'ar' ? 'حذف' : language === 'fr' ? 'Supprimer' : 'Remove'}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {uploaded.progress < 100 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>
                          {language === 'ar' ? 'جاري التحميل...' :
                           language === 'fr' ? 'Téléchargement...' :
                           'Uploading...'}
                        </span>
                        <span>{uploaded.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#0F4C81] to-[#00C2A8] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploaded.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center space-y-2 sm:space-y-3 mt-3 sm:mt-4 px-4 py-6 sm:px-6 sm:py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#00C2A8] hover:bg-gray-50 cursor-pointer transition-all group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 group-hover:bg-[#00C2A8]/10 rounded-full flex items-center justify-center transition-colors">
                    <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-[#00C2A8] transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-[#00C2A8] transition-colors">
                      {language === 'ar' ? 'انقر للتحميل أو اسحب الملف هنا' :
                       language === 'fr' ? 'Cliquez pour télécharger ou faites glisser le fichier ici' :
                       'Click to upload or drag and drop'}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                      {language === 'ar' ? 'PDF, JPEG, PNG (حتى 10 ميجابايت)' :
                       language === 'fr' ? 'PDF, JPEG, PNG (jusqu\'à 10 MB)' :
                       'PDF, JPEG, PNG (up to 10MB)'}
                    </p>
                  </div>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 10 * 1024 * 1024) {
                          alert(
                            language === 'ar' ? 'حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت' :
                            language === 'fr' ? 'Fichier trop volumineux. Maximum 10 MB' :
                            'File too large. Maximum 10MB'
                          );
                          return;
                        }
                        handleFileSelect(req.id, file);
                      }
                    }}
                    className="hidden"
                    accept="image/*,application/pdf"
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>

      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
          }}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg p-2">
            <button
              onClick={() => {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
              }}
              className="absolute -top-4 -right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}
