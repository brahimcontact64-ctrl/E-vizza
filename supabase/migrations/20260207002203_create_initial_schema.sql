/*
  # e-vizza Platform - Initial Database Schema

  ## Overview
  Complete database structure for eVisa assistance platform with multi-country support,
  document management, application tracking, and admin workflow tools.

  ## Tables Created

  1. **profiles** - Extended user information
     - id (uuid, references auth.users)
     - full_name (text)
     - phone (text)
     - nationality (text)
     - preferred_language (text) - 'en', 'fr', 'ar'
     - created_at, updated_at (timestamptz)

  2. **countries** - Supported destination countries
     - id (uuid, primary key)
     - code (text, unique) - ISO country code
     - name_en, name_fr, name_ar (text)
     - flag_emoji (text)
     - is_active (boolean)
     - processing_time_days (int)
     - created_at, updated_at (timestamptz)

  3. **visa_types** - Visa types for each country
     - id (uuid, primary key)
     - country_id (uuid, foreign key)
     - code (text) - e.g., 'umrah', 'visit', 'evisa'
     - name_en, name_fr, name_ar (text)
     - description_en, description_fr, description_ar (text)
     - base_fee (decimal)
     - processing_time_days (int)
     - is_active (boolean)
     - requirements (jsonb) - dynamic requirements per visa type
     - created_at, updated_at (timestamptz)

  4. **document_requirements** - Required documents per visa type
     - id (uuid, primary key)
     - visa_type_id (uuid, foreign key)
     - document_type (text) - 'passport', 'photo', 'hotel_booking', etc.
     - name_en, name_fr, name_ar (text)
     - description_en, description_fr, description_ar (text)
     - is_required (boolean)
     - validation_rules (jsonb)
     - order_index (int)
     - created_at, updated_at (timestamptz)

  5. **applications** - User visa applications
     - id (uuid, primary key)
     - user_id (uuid, foreign key to auth.users)
     - country_id (uuid, foreign key)
     - visa_type_id (uuid, foreign key)
     - application_number (text, unique, auto-generated)
     - status (text) - 'draft', 'submitted', 'awaiting_payment', 'payment_confirmed', 'processing', 'documents_prepared', 'submitted_to_embassy', 'approved', 'rejected', 'cancelled'
     - travel_data (jsonb) - travel dates, purpose, etc.
     - applicant_data (jsonb) - full applicant information
     - is_urgent (boolean)
     - admin_notes (text)
     - rejection_reason (text)
     - submitted_at, payment_confirmed_at, completed_at (timestamptz)
     - created_at, updated_at (timestamptz)

  6. **documents** - Uploaded documents
     - id (uuid, primary key)
     - application_id (uuid, foreign key)
     - document_requirement_id (uuid, foreign key)
     - file_name (text)
     - file_path (text) - Supabase storage path
     - file_size (bigint)
     - mime_type (text)
     - status (text) - 'pending', 'approved', 'rejected', 'reupload_required'
     - admin_notes (text)
     - uploaded_by (uuid, foreign key to auth.users)
     - verified_by (uuid, foreign key to auth.users)
     - verified_at (timestamptz)
     - created_at, updated_at (timestamptz)

  7. **application_status_logs** - Track status changes
     - id (uuid, primary key)
     - application_id (uuid, foreign key)
     - old_status (text)
     - new_status (text)
     - changed_by (uuid, foreign key to auth.users)
     - notes (text)
     - created_at (timestamptz)

  8. **admin_actions** - Audit trail for admin activities
     - id (uuid, primary key)
     - admin_id (uuid, foreign key to auth.users)
     - action_type (text) - 'review', 'verify_document', 'update_status', 'confirm_payment', 'add_note'
     - target_type (text) - 'application', 'document', 'user'
     - target_id (uuid)
     - details (jsonb)
     - ip_address (text)
     - created_at (timestamptz)

  9. **payments** - Manual payment tracking
     - id (uuid, primary key)
     - application_id (uuid, foreign key)
     - amount (decimal)
     - currency (text)
     - payment_method (text) - 'cash', 'bank_transfer', 'mobile_money', etc.
     - payment_reference (text)
     - status (text) - 'pending', 'confirmed', 'refunded'
     - confirmed_by (uuid, foreign key to auth.users)
     - confirmed_at (timestamptz)
     - notes (text)
     - created_at, updated_at (timestamptz)

  10. **notifications** - User and admin notifications
      - id (uuid, primary key)
      - user_id (uuid, foreign key to auth.users)
      - title_en, title_fr, title_ar (text)
      - message_en, message_fr, message_ar (text)
      - type (text) - 'status_update', 'payment_required', 'document_issue', 'approval'
      - related_application_id (uuid)
      - is_read (boolean)
      - created_at (timestamptz)

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Users can only access their own data
  - Admins have elevated permissions based on role in profiles table
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  nationality text,
  preferred_language text DEFAULT 'en' CHECK (preferred_language IN ('en', 'fr', 'ar')),
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create countries table
CREATE TABLE IF NOT EXISTS countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name_en text NOT NULL,
  name_fr text NOT NULL,
  name_ar text NOT NULL,
  flag_emoji text,
  is_active boolean DEFAULT true,
  processing_time_days int DEFAULT 7,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create visa_types table
CREATE TABLE IF NOT EXISTS visa_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id uuid REFERENCES countries(id) ON DELETE CASCADE,
  code text NOT NULL,
  name_en text NOT NULL,
  name_fr text NOT NULL,
  name_ar text NOT NULL,
  description_en text,
  description_fr text,
  description_ar text,
  base_fee decimal(10,2) DEFAULT 0,
  processing_time_days int DEFAULT 7,
  is_active boolean DEFAULT true,
  requirements jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(country_id, code)
);

-- Create document_requirements table
CREATE TABLE IF NOT EXISTS document_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visa_type_id uuid REFERENCES visa_types(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  name_en text NOT NULL,
  name_fr text NOT NULL,
  name_ar text NOT NULL,
  description_en text,
  description_fr text,
  description_ar text,
  is_required boolean DEFAULT true,
  validation_rules jsonb DEFAULT '{}'::jsonb,
  order_index int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  country_id uuid REFERENCES countries(id),
  visa_type_id uuid REFERENCES visa_types(id),
  application_number text UNIQUE,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'awaiting_payment', 'payment_confirmed', 'processing', 'documents_prepared', 'submitted_to_embassy', 'approved', 'rejected', 'cancelled')),
  travel_data jsonb DEFAULT '{}'::jsonb,
  applicant_data jsonb DEFAULT '{}'::jsonb,
  is_urgent boolean DEFAULT false,
  admin_notes text,
  rejection_reason text,
  submitted_at timestamptz,
  payment_confirmed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  document_requirement_id uuid REFERENCES document_requirements(id),
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  mime_type text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'reupload_required')),
  admin_notes text,
  uploaded_by uuid REFERENCES auth.users(id),
  verified_by uuid REFERENCES auth.users(id),
  verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create application_status_logs table
CREATE TABLE IF NOT EXISTS application_status_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  changed_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create admin_actions table
CREATE TABLE IF NOT EXISTS admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id),
  action_type text NOT NULL,
  target_type text NOT NULL,
  target_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'DZD',
  payment_method text,
  payment_reference text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'refunded')),
  confirmed_by uuid REFERENCES auth.users(id),
  confirmed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title_en text NOT NULL,
  title_fr text,
  title_ar text,
  message_en text NOT NULL,
  message_fr text,
  message_ar text,
  type text NOT NULL,
  related_application_id uuid REFERENCES applications(id) ON DELETE SET NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create function to generate application number
CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS text AS $$
DECLARE
  new_number text;
  prefix text := 'VF';
  year_suffix text := TO_CHAR(NOW(), 'YY');
  sequence_num text;
BEGIN
  sequence_num := LPAD((SELECT COUNT(*) + 1 FROM applications)::text, 6, '0');
  new_number := prefix || year_suffix || sequence_num;
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate application number
CREATE OR REPLACE FUNCTION set_application_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.application_number IS NULL THEN
    NEW.application_number := generate_application_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_application_number
BEFORE INSERT ON applications
FOR EACH ROW
EXECUTE FUNCTION set_application_number();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER trigger_update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_update_countries_updated_at
BEFORE UPDATE ON countries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_update_visa_types_updated_at
BEFORE UPDATE ON visa_types
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_update_applications_updated_at
BEFORE UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_update_documents_updated_at
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_update_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_application_id ON documents(application_id);
CREATE INDEX IF NOT EXISTS idx_status_logs_application_id ON application_status_logs(application_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_payments_application_id ON payments(application_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE visa_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for countries (public read, admin write)
CREATE POLICY "Anyone can view active countries"
  ON countries FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage countries"
  ON countries FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for visa_types (public read, admin write)
CREATE POLICY "Anyone can view active visa types"
  ON visa_types FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage visa types"
  ON visa_types FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for document_requirements (public read, admin write)
CREATE POLICY "Anyone can view document requirements"
  ON document_requirements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage document requirements"
  ON document_requirements FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for applications
CREATE POLICY "Users can view own applications"
  ON applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own draft applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'draft')
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
  ON applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update all applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for documents
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = documents.application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload documents to own applications"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all documents"
  ON documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for application_status_logs
CREATE POLICY "Users can view own application logs"
  ON application_status_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = application_status_logs.application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all logs"
  ON application_status_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "System can insert status logs"
  ON application_status_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for admin_actions
CREATE POLICY "Admins can view all admin actions"
  ON admin_actions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can log actions"
  ON admin_actions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for payments
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = payments.application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage payments"
  ON payments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);