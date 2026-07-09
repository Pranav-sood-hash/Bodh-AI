import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 60 Languages Supported by BodhAI
export interface LanguageItem {
  code: string;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageItem[] = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', dir: 'ltr' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', dir: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', dir: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', dir: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', dir: 'ltr' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', dir: 'rtl' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', dir: 'rtl' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', dir: 'ltr' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', dir: 'ltr' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', dir: 'ltr' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', dir: 'ltr' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', dir: 'ltr' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', dir: 'ltr' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', dir: 'ltr' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', dir: 'ltr' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', dir: 'ltr' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', dir: 'ltr' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', dir: 'ltr' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', dir: 'ltr' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', dir: 'ltr' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', dir: 'ltr' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', dir: 'ltr' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', dir: 'ltr' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', dir: 'ltr' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', dir: 'ltr' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', dir: 'ltr' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', dir: 'ltr' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', dir: 'ltr' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', dir: 'ltr' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', dir: 'ltr' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', dir: 'ltr' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', dir: 'ltr' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски', dir: 'ltr' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', dir: 'ltr' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', dir: 'ltr' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti', dir: 'ltr' },
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული', dir: 'ltr' },
  { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն', dir: 'ltr' },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycanca', dir: 'ltr' },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақ тілі', dir: 'ltr' },
  { code: 'uz', name: 'Uzbek', nativeName: 'Oʻzbekcha', dir: 'ltr' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', dir: 'ltr' },
  { code: 'so', name: 'Somali', nativeName: 'Soomaaliga', dir: 'ltr' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', dir: 'ltr' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', dir: 'ltr' },
  { code: 'ig', name: 'Igbo', nativeName: 'Asụsụ Igbo', dir: 'ltr' },
  { code: 'ha', name: 'Hausa', nativeName: 'Harshen Hausa', dir: 'ltr' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', dir: 'ltr' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', dir: 'ltr' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', dir: 'ltr' }
];

// Helper to check direction
export const getLanguageDirection = (langCode: string): 'ltr' | 'rtl' => {
  const found = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
  return found?.dir || 'ltr';
};

// Setup translations with standard UI fallbacks
const resources = {
  en: {
    translation: {
      dashboard: "Dashboard",
      chat: "AI Doubts / Chat",
      roadmap: "Learning Pathways",
      projects: "Project Builder",
      settings: "Profile & Settings",
      collab: "Collaborative Rooms",
      knowledge: "Knowledge Base",
      logout: "Log Out",
      title: "BodhAI",
      subtitle: "Your Intelligent Personal Learning Mentor",
      quiz: "Take Milestone Quiz"
    }
  },
  hi: {
    translation: {
      dashboard: "डैशबोर्ड",
      chat: "एआई शंका समाधान",
      roadmap: "अध्ययन मार्ग",
      projects: "परियोजना निर्माता",
      settings: "प्रोफ़ाइल और सेटिंग्स",
      collab: "सहयोगी समूह",
      knowledge: "ज्ञानकोश",
      logout: "लॉग आउट",
      title: "बोधएआई",
      subtitle: "आपका बुद्धिमान व्यक्तिगत शिक्षा संरक्षक",
      quiz: "मील का पत्थर प्रश्नोत्तरी"
    }
  },
  es: {
    translation: {
      dashboard: "Tablero",
      chat: "Chat de Dudas IA",
      roadmap: "Rutas de Aprendizaje",
      projects: "Constructor de Proyectos",
      settings: "Perfil y Ajustes",
      collab: "Salas Colaborativas",
      knowledge: "Base de Conocimiento",
      logout: "Cerrar Sesión",
      title: "BodhAI",
      subtitle: "Tu mentor de aprendizaje personal inteligente",
      quiz: "Hacer Cuestionario"
    }
  },
  fr: {
    translation: {
      dashboard: "Tableau de Bord",
      chat: "Chat de Doutes IA",
      roadmap: "Parcours d'Apprentissage",
      projects: "Constructeur de Projets",
      settings: "Profil & Paramètres",
      collab: "Salles Collaboratives",
      knowledge: "Base de Connaissances",
      logout: "Se Déconnecter",
      title: "BodhAI",
      subtitle: "Votre mentor d'apprentissage personnel intelligent",
      quiz: "Passer le Quiz"
    }
  },
  de: {
    translation: {
      dashboard: "Dashboard",
      chat: "KI-Zweifel-Chat",
      roadmap: "Lernpfade",
      projects: "Projekt-Builder",
      settings: "Profil & Einstellungen",
      collab: "Kollaborative Räume",
      knowledge: "Wissensdatenbank",
      logout: "Abmelden",
      title: "BodhAI",
      subtitle: "Ihr intelligenter persönlicher Lernmentor",
      quiz: "Quiz machen"
    }
  },
  ar: {
    translation: {
      dashboard: "لوحة التحكم",
      chat: "المحادثة والشكوك الذكية",
      roadmap: "مسارات التعلم",
      projects: "منشئ المشاريع",
      settings: "الملف الشخصي والإعدادات",
      collab: "الغرف التعاونية",
      knowledge: "قاعدة المعرفة",
      logout: "تسجيل الخروج",
      title: "BodhAI",
      subtitle: "مرشدك التعليمي الشخصي والذكي",
      quiz: "بدء الاختبار"
    }
  },
  he: {
    translation: {
      dashboard: "לוח בקרה",
      chat: "צ'אט שאלות מבוסס בינה מלאכותית",
      roadmap: "נתיבי למידה",
      projects: "בונה פרויקטים",
      settings: "פרופיל והגדרות",
      collab: "חדרים שיתופיים",
      knowledge: "מאגר ידע",
      logout: "התנתק",
      title: "BodhAI",
      subtitle: "מנטור הלמידה האישי והחכם שלך",
      quiz: "ענה על בוחן"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language_code') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

// Apply layout direction on load
const currentLangCode = i18n.language;
document.documentElement.dir = getLanguageDirection(currentLangCode);

// Listen to language changes
i18n.on('languageChanged', (lng) => {
  document.documentElement.dir = getLanguageDirection(lng);
  localStorage.setItem('language_code', lng);
});

export default i18n;
