import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    const saudiArabiaRef = await addDoc(collection(db, 'countries'), {
      code: 'SA',
      name_en: 'Saudi Arabia',
      name_fr: 'Arabie Saoudite',
      name_ar: 'المملكة العربية السعودية',
      flag_emoji: '🇸🇦',
      is_active: true,
      processing_time_days: 5,
      portal_link: 'https://visa.visitsaudi.com',
      admin_instructions_en: '1. Log into visa portal\n2. Select Umrah/Visit visa type\n3. Upload prepared documents\n4. Complete payment\n5. Submit application\n6. Track status',
      admin_instructions_fr: '1. Connectez-vous au portail des visas\n2. Sélectionnez le type de visa Omra/Visite\n3. Téléchargez les documents préparés\n4. Effectuez le paiement\n5. Soumettez la demande\n6. Suivez le statut',
      admin_instructions_ar: '1. تسجيل الدخول إلى بوابة التأشيرات\n2. اختر نوع تأشيرة العمرة/الزيارة\n3. تحميل المستندات المعدة\n4. إتمام الدفع\n5. تقديم الطلب\n6. تتبع الحالة',
      created_at: Date.now(),
      updated_at: Date.now(),
    });
    console.log('Created Saudi Arabia country');

    const indonesiaRef = await addDoc(collection(db, 'countries'), {
      code: 'ID',
      name_en: 'Indonesia',
      name_fr: 'Indonésie',
      name_ar: 'إندونيسيا',
      flag_emoji: '🇮🇩',
      is_active: true,
      processing_time_days: 7,
      portal_link: 'https://molina.imigrasi.go.id',
      admin_instructions_en: '1. Access eVisa portal\n2. Create new application\n3. Fill applicant details\n4. Upload required documents\n5. Pay visa fee\n6. Submit and download receipt',
      admin_instructions_fr: '1. Accédez au portail eVisa\n2. Créer une nouvelle demande\n3. Remplir les détails du demandeur\n4. Télécharger les documents requis\n5. Payer les frais de visa\n6. Soumettre et télécharger le reçu',
      admin_instructions_ar: '1. الوصول إلى بوابة التأشيرة الإلكترونية\n2. إنشاء طلب جديد\n3. ملء تفاصيل المتقدم\n4. تحميل المستندات المطلوبة\n5. دفع رسوم التأشيرة\n6. التقديم وتحميل الإيصال',
      created_at: Date.now(),
      updated_at: Date.now(),
    });
    console.log('Created Indonesia country');

    const umrahVisaRef = await addDoc(collection(db, 'visaTypes'), {
      country_id: saudiArabiaRef.id,
      code: 'umrah',
      name_en: 'Umrah Visa',
      name_fr: 'Visa Omra',
      name_ar: 'تأشيرة عمرة',
      description_en: 'Religious pilgrimage visa for Umrah',
      description_fr: 'Visa de pèlerinage religieux pour la Omra',
      description_ar: 'تأشيرة للحج الديني لأداء العمرة',
      base_fee: 15000,
      processing_time_days: 5,
      is_active: true,
      requirements: {},
      submission_steps: [
        {
          step_number: 1,
          title_en: 'Verify Documents',
          title_fr: 'Vérifier les documents',
          title_ar: 'التحقق من المستندات',
          description_en: 'Check that all required documents are present and valid',
          description_fr: 'Vérifier que tous les documents requis sont présents et valides',
          description_ar: 'تأكد من وجود جميع المستندات المطلوبة وصحتها'
        },
        {
          step_number: 2,
          title_en: 'Access Portal',
          title_fr: 'Accéder au portail',
          title_ar: 'الوصول إلى البوابة',
          description_en: 'Log into the Saudi visa portal with admin credentials',
          description_fr: 'Connectez-vous au portail des visas saoudien avec les identifiants admin',
          description_ar: 'تسجيل الدخول إلى بوابة التأشيرات السعودية ببيانات المسؤول'
        },
        {
          step_number: 3,
          title_en: 'Fill Application',
          title_fr: 'Remplir la demande',
          title_ar: 'ملء الطلب',
          description_en: 'Complete all required fields in the visa application form',
          description_fr: 'Remplir tous les champs requis dans le formulaire de demande de visa',
          description_ar: 'أكمل جميع الحقول المطلوبة في نموذج طلب التأشيرة'
        },
        {
          step_number: 4,
          title_en: 'Submit Application',
          title_fr: 'Soumettre la demande',
          title_ar: 'تقديم الطلب',
          description_en: 'Review and submit the application to the visa authority',
          description_fr: 'Examiner et soumettre la demande à l\'autorité des visas',
          description_ar: 'مراجعة وتقديم الطلب إلى سلطة التأشيرات'
        }
      ],
      status_flow: [
        { status: 'submitted', name_en: 'Submitted', name_fr: 'Soumis', name_ar: 'مقدم', order: 1 },
        { status: 'awaiting_payment', name_en: 'Awaiting Payment', name_fr: 'En attente de paiement', name_ar: 'في انتظار الدفع', order: 2 },
        { status: 'payment_confirmed', name_en: 'Payment Confirmed', name_fr: 'Paiement confirmé', name_ar: 'تم تأكيد الدفع', order: 3 },
        { status: 'processing', name_en: 'Processing', name_fr: 'En traitement', name_ar: 'قيد المعالجة', order: 4 },
        { status: 'submitted_to_embassy', name_en: 'Submitted to Embassy', name_fr: 'Soumis à l\'ambassade', name_ar: 'مقدم للسفارة', order: 5 },
        { status: 'approved', name_en: 'Approved', name_fr: 'Approuvé', name_ar: 'موافق عليه', order: 6 }
      ],
      validation_rules: {},
      helper_notes_en: 'Ensure vaccination certificate is recent. Verify passport validity is at least 6 months.',
      helper_notes_fr: 'Assurez-vous que le certificat de vaccination est récent. Vérifiez que la validité du passeport est d\'au moins 6 mois.',
      helper_notes_ar: 'تأكد من أن شهادة التطعيم حديثة. تحقق من أن صلاحية جواز السفر لا تقل عن 6 أشهر.',
      created_at: Date.now(),
      updated_at: Date.now(),
    });
    console.log('Created Umrah Visa type');

    const visitVisaRef = await addDoc(collection(db, 'visaTypes'), {
      country_id: saudiArabiaRef.id,
      code: 'visit',
      name_en: 'Visit Visa',
      name_fr: 'Visa de Visite',
      name_ar: 'تأشيرة زيارة',
      description_en: 'Tourist and family visit visa',
      description_fr: 'Visa touristique et visite familiale',
      description_ar: 'تأشيرة سياحية وزيارة عائلية',
      base_fee: 12000,
      processing_time_days: 5,
      is_active: true,
      requirements: {},
      submission_steps: [
        {
          step_number: 1,
          title_en: 'Verify Documents',
          title_fr: 'Vérifier les documents',
          title_ar: 'التحقق من المستندات',
          description_en: 'Check passport validity and hotel booking confirmation',
          description_fr: 'Vérifier la validité du passeport et la confirmation de réservation d\'hôtel',
          description_ar: 'تحقق من صلاحية جواز السفر وتأكيد حجز الفندق'
        },
        {
          step_number: 2,
          title_en: 'Access Portal',
          title_fr: 'Accéder au portail',
          title_ar: 'الوصول إلى البوابة',
          description_en: 'Log into the Saudi visa portal',
          description_fr: 'Connectez-vous au portail des visas saoudien',
          description_ar: 'تسجيل الدخول إلى بوابة التأشيرات السعودية'
        },
        {
          step_number: 3,
          title_en: 'Complete Application',
          title_fr: 'Compléter la demande',
          title_ar: 'إكمال الطلب',
          description_en: 'Fill all required fields and upload documents',
          description_fr: 'Remplir tous les champs requis et télécharger les documents',
          description_ar: 'املأ جميع الحقول المطلوبة وحمّل المستندات'
        },
        {
          step_number: 4,
          title_en: 'Submit and Track',
          title_fr: 'Soumettre et suivre',
          title_ar: 'التقديم والمتابعة',
          description_en: 'Submit application and track status',
          description_fr: 'Soumettre la demande et suivre le statut',
          description_ar: 'قدم الطلب وتابع الحالة'
        }
      ],
      status_flow: [
        { status: 'submitted', name_en: 'Submitted', name_fr: 'Soumis', name_ar: 'مقدم', order: 1 },
        { status: 'awaiting_payment', name_en: 'Awaiting Payment', name_fr: 'En attente de paiement', name_ar: 'في انتظار الدفع', order: 2 },
        { status: 'payment_confirmed', name_en: 'Payment Confirmed', name_fr: 'Paiement confirmé', name_ar: 'تم تأكيد الدفع', order: 3 },
        { status: 'processing', name_en: 'Processing', name_fr: 'En traitement', name_ar: 'قيد المعالجة', order: 4 },
        { status: 'submitted_to_embassy', name_en: 'Submitted to Embassy', name_fr: 'Soumis à l\'ambassade', name_ar: 'مقدم للسفارة', order: 5 },
        { status: 'approved', name_en: 'Approved', name_fr: 'Approuvé', name_ar: 'موافق عليه', order: 6 }
      ],
      validation_rules: {},
      helper_notes_en: 'Visit visa is suitable for tourism and family visits. Ensure hotel booking matches travel dates.',
      helper_notes_fr: 'Le visa de visite convient au tourisme et aux visites familiales. Assurez-vous que la réservation d\'hôtel correspond aux dates de voyage.',
      helper_notes_ar: 'تأشيرة الزيارة مناسبة للسياحة والزيارات العائلية. تأكد من أن حجز الفندق يتوافق مع تواريخ السفر.',
      created_at: Date.now(),
      updated_at: Date.now(),
    });
    console.log('Created Visit Visa type');

    const eVisaRef = await addDoc(collection(db, 'visaTypes'), {
      country_id: indonesiaRef.id,
      code: 'evisa',
      name_en: 'eVisa',
      name_fr: 'eVisa',
      name_ar: 'تأشيرة إلكترونية',
      description_en: 'Electronic visa for tourism and business',
      description_fr: 'Visa électronique pour tourisme et affaires',
      description_ar: 'تأشيرة إلكترونية للسياحة والأعمال',
      base_fee: 8000,
      processing_time_days: 7,
      is_active: true,
      requirements: {},
      submission_steps: [
        {
          step_number: 1,
          title_en: 'Prepare Documents',
          title_fr: 'Préparer les documents',
          title_ar: 'تجهيز المستندات',
          description_en: 'Verify all documents including passport, photo, flight tickets, and accommodation proof',
          description_fr: 'Vérifier tous les documents y compris passeport, photo, billets d\'avion et preuve d\'hébergement',
          description_ar: 'تحقق من جميع المستندات بما في ذلك جواز السفر والصورة وتذاكر الطيران وإثبات الإقامة'
        },
        {
          step_number: 2,
          title_en: 'Create Application',
          title_fr: 'Créer la demande',
          title_ar: 'إنشاء الطلب',
          description_en: 'Access the Molina eVisa portal and create new application',
          description_fr: 'Accéder au portail Molina eVisa et créer une nouvelle demande',
          description_ar: 'الوصول إلى بوابة مولينا للتأشيرات الإلكترونية وإنشاء طلب جديد'
        },
        {
          step_number: 3,
          title_en: 'Fill Details',
          title_fr: 'Remplir les détails',
          title_ar: 'ملء التفاصيل',
          description_en: 'Complete applicant information and upload required documents',
          description_fr: 'Compléter les informations du demandeur et télécharger les documents requis',
          description_ar: 'أكمل معلومات المتقدم وحمّل المستندات المطلوبة'
        },
        {
          step_number: 4,
          title_en: 'Payment and Submission',
          title_fr: 'Paiement et soumission',
          title_ar: 'الدفع والتقديم',
          description_en: 'Pay visa fee, submit application, and download receipt',
          description_fr: 'Payer les frais de visa, soumettre la demande et télécharger le reçu',
          description_ar: 'ادفع رسوم التأشيرة وقدم الطلب وحمّل الإيصال'
        }
      ],
      status_flow: [
        { status: 'submitted', name_en: 'Submitted', name_fr: 'Soumis', name_ar: 'مقدم', order: 1 },
        { status: 'awaiting_payment', name_en: 'Awaiting Payment', name_fr: 'En attente de paiement', name_ar: 'في انتظار الدفع', order: 2 },
        { status: 'payment_confirmed', name_en: 'Payment Confirmed', name_fr: 'Paiement confirmé', name_ar: 'تم تأكيد الدفع', order: 3 },
        { status: 'processing', name_en: 'Processing', name_fr: 'En traitement', name_ar: 'قيد المعالجة', order: 4 },
        { status: 'documents_prepared', name_en: 'Documents Prepared', name_fr: 'Documents préparés', name_ar: 'المستندات جاهزة', order: 5 },
        { status: 'submitted_to_embassy', name_en: 'Submitted to Portal', name_fr: 'Soumis au portail', name_ar: 'مقدم للبوابة', order: 6 },
        { status: 'approved', name_en: 'Approved', name_fr: 'Approuvé', name_ar: 'موافق عليه', order: 7 }
      ],
      validation_rules: {},
      helper_notes_en: 'Indonesia eVisa is processed online. Ensure return flight tickets and accommodation booking are confirmed before submission.',
      helper_notes_fr: 'Le eVisa indonésien est traité en ligne. Assurez-vous que les billets d\'avion retour et la réservation d\'hébergement sont confirmés avant la soumission.',
      helper_notes_ar: 'تتم معالجة التأشيرة الإلكترونية الإندونيسية عبر الإنترنت. تأكد من تأكيد تذاكر الطيران ذهاباً وإياباً وحجز الإقامة قبل التقديم.',
      created_at: Date.now(),
      updated_at: Date.now(),
    });
    console.log('Created eVisa type');

    await addDoc(collection(db, 'documentRequirements'), {
      visa_type_id: umrahVisaRef.id,
      document_type: 'passport',
      name_en: 'Passport Copy',
      name_fr: 'Copie du Passeport',
      name_ar: 'نسخة من جواز السفر',
      description_en: 'Valid passport with at least 6 months validity',
      description_fr: 'Passeport valide avec au moins 6 mois de validité',
      description_ar: 'جواز سفر ساري المفعول لمدة 6 أشهر على الأقل',
      is_required: true,
      validation_rules: {},
      order_index: 1,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    await addDoc(collection(db, 'documentRequirements'), {
      visa_type_id: umrahVisaRef.id,
      document_type: 'photo',
      name_en: 'Personal Photo',
      name_fr: 'Photo Personnelle',
      name_ar: 'صورة شخصية',
      description_en: 'Recent passport-sized photo with white background',
      description_fr: 'Photo récente de format passeport sur fond blanc',
      description_ar: 'صورة شخصية حديثة بحجم جواز السفر بخلفية بيضاء',
      is_required: true,
      validation_rules: {},
      order_index: 2,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    await addDoc(collection(db, 'documentRequirements'), {
      visa_type_id: umrahVisaRef.id,
      document_type: 'vaccination',
      name_en: 'Vaccination Certificate',
      name_fr: 'Certificat de Vaccination',
      name_ar: 'شهادة التطعيم',
      description_en: 'Meningitis and other required vaccination certificates',
      description_fr: 'Certificats de vaccination contre la méningite et autres vaccins requis',
      description_ar: 'شهادات التطعيم ضد التهاب السحايا والتطعيمات المطلوبة الأخرى',
      is_required: true,
      validation_rules: {},
      order_index: 3,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    await addDoc(collection(db, 'documentRequirements'), {
      visa_type_id: visitVisaRef.id,
      document_type: 'passport',
      name_en: 'Passport Copy',
      name_fr: 'Copie du Passeport',
      name_ar: 'نسخة من جواز السفر',
      description_en: 'Valid passport with at least 6 months validity',
      description_fr: 'Passeport valide avec au moins 6 mois de validité',
      description_ar: 'جواز سفر ساري المفعول لمدة 6 أشهر على الأقل',
      is_required: true,
      validation_rules: {},
      order_index: 1,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    await addDoc(collection(db, 'documentRequirements'), {
      visa_type_id: visitVisaRef.id,
      document_type: 'photo',
      name_en: 'Personal Photo',
      name_fr: 'Photo Personnelle',
      name_ar: 'صورة شخصية',
      description_en: 'Recent passport-sized photo with white background',
      description_fr: 'Photo récente de format passeport sur fond blanc',
      description_ar: 'صورة شخصية حديثة بحجم جواز السفر بخلفية بيضاء',
      is_required: true,
      validation_rules: {},
      order_index: 2,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    await addDoc(collection(db, 'documentRequirements'), {
      visa_type_id: visitVisaRef.id,
      document_type: 'hotel_booking',
      name_en: 'Hotel Booking',
      name_fr: 'Réservation d\'Hôtel',
      name_ar: 'حجز الفندق',
      description_en: 'Hotel reservation confirmation',
      description_fr: 'Confirmation de réservation d\'hôtel',
      description_ar: 'تأكيد حجز الفندق',
      is_required: true,
      validation_rules: {},
      order_index: 3,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    await addDoc(collection(db, 'documentRequirements'), {
      visa_type_id: eVisaRef.id,
      document_type: 'passport',
      name_en: 'Passport Copy',
      name_fr: 'Copie du Passeport',
      name_ar: 'نسخة من جواز السفر',
      description_en: 'Valid passport with at least 6 months validity',
      description_fr: 'Passeport valide avec au moins 6 mois de validité',
      description_ar: 'جواز سفر ساري المفعول لمدة 6 أشهر على الأقل',
      is_required: true,
      validation_rules: {},
      order_index: 1,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    await addDoc(collection(db, 'documentRequirements'), {
      visa_type_id: eVisaRef.id,
      document_type: 'photo',
      name_en: 'Personal Photo',
      name_fr: 'Photo Personnelle',
      name_ar: 'صورة شخصية',
      description_en: 'Recent passport-sized photo',
      description_fr: 'Photo récente de format passeport',
      description_ar: 'صورة شخصية حديثة بحجم جواز السفر',
      is_required: true,
      validation_rules: {},
      order_index: 2,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    await addDoc(collection(db, 'documentRequirements'), {
      visa_type_id: eVisaRef.id,
      document_type: 'flight_booking',
      name_en: 'Flight Tickets',
      name_fr: 'Billets d\'Avion',
      name_ar: 'تذاكر الطيران',
      description_en: 'Return flight booking confirmation',
      description_fr: 'Confirmation de réservation de vol aller-retour',
      description_ar: 'تأكيد حجز تذكرة الطيران ذهاباً وإياباً',
      is_required: true,
      validation_rules: {},
      order_index: 3,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    await addDoc(collection(db, 'documentRequirements'), {
      visa_type_id: eVisaRef.id,
      document_type: 'accommodation',
      name_en: 'Accommodation Proof',
      name_fr: 'Preuve d\'Hébergement',
      name_ar: 'إثبات الإقامة',
      description_en: 'Hotel booking or accommodation confirmation',
      description_fr: 'Réservation d\'hôtel ou confirmation d\'hébergement',
      description_ar: 'حجز فندق أو تأكيد الإقامة',
      is_required: true,
      validation_rules: {},
      order_index: 4,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

seedDatabase();
