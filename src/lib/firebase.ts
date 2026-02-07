import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error('Missing Firebase configuration. Please check your .env file.');
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  nationality: string | null;
  preferred_language: 'en' | 'fr' | 'ar';
  role: 'user' | 'admin' | 'super_admin';
  is_active: boolean;
  created_at: number;
  updated_at: number;
}

export interface Country {
  id: string;
  code: string;
  name_en: string;
  name_fr: string;
  name_ar: string;
  flag_emoji: string;
  is_active: boolean;
  processing_time_days: number;
  portal_link: string | null;
  admin_instructions_en: string | null;
  admin_instructions_fr: string | null;
  admin_instructions_ar: string | null;
  created_at: number;
  updated_at: number;
}

export interface SubmissionStep {
  step_number: number;
  title_en: string;
  title_fr: string;
  title_ar: string;
  description_en: string;
  description_fr: string;
  description_ar: string;
}

export interface StatusFlowStep {
  status: string;
  name_en: string;
  name_fr: string;
  name_ar: string;
  order: number;
}

export interface VisaType {
  id: string;
  country_id: string;
  code: string;
  name_en: string;
  name_fr: string;
  name_ar: string;
  description_en: string | null;
  description_fr: string | null;
  description_ar: string | null;
  base_fee: number;
  processing_time_days: number;
  is_active: boolean;
  requirements: any;
  submission_steps: SubmissionStep[];
  status_flow: StatusFlowStep[];
  validation_rules: any;
  helper_notes_en: string | null;
  helper_notes_fr: string | null;
  helper_notes_ar: string | null;
  created_at: number;
  updated_at: number;
}

export interface DocumentRequirement {
  id: string;
  visa_type_id: string;
  document_type: string;
  name_en: string;
  name_fr: string;
  name_ar: string;
  description_en: string | null;
  description_fr: string | null;
  description_ar: string | null;
  is_required: boolean;
  validation_rules: any;
  order_index: number;
  created_at: number;
  updated_at: number;
}

export interface Application {
  id: string;
  user_id: string;
  country_id: string;
  visa_type_id: string;
  application_number: string;
  status: 'draft' | 'submitted' | 'awaiting_payment' | 'payment_confirmed' | 'processing' | 'documents_prepared' | 'submitted_to_embassy' | 'approved' | 'rejected' | 'cancelled';
  travel_data: any;
  applicant_data: any;
  is_urgent: boolean;
  admin_notes: string | null;
  rejection_reason: string | null;
  submitted_at: number | null;
  payment_confirmed_at: number | null;
  completed_at: number | null;
  created_at: number;
  updated_at: number;
}

export interface Document {
  id: string;
  application_id: string;
  document_requirement_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  status: 'pending' | 'approved' | 'rejected' | 'reupload_required';
  admin_notes: string | null;
  uploaded_by: string;
  verified_by: string | null;
  verified_at: number | null;
  created_at: number;
  updated_at: number;
}

export interface Payment {
  id: string;
  application_id: string;
  amount: number;
  currency: string;
  payment_method: string | null;
  payment_reference: string | null;
  status: 'pending' | 'confirmed' | 'refunded';
  confirmed_by: string | null;
  confirmed_at: number | null;
  notes: string | null;
  created_at: number;
  updated_at: number;
}

export interface ApplicationStatusLog {
  id: string;
  application_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string | null;
  notes: string | null;
  created_at: number;
}

export interface AdminAction {
  id: string;
  admin_id: string;
  action_type: string;
  target_type: string;
  target_id: string;
  details: any;
  ip_address: string | null;
  created_at: number;
}

export interface Notification {
  id: string;
  user_id: string;
  title_en: string;
  title_fr: string | null;
  title_ar: string | null;
  message_en: string;
  message_fr: string | null;
  message_ar: string | null;
  type: string;
  related_application_id: string | null;
  is_read: boolean;
  created_at: number;
}
