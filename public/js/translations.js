/**
 * MediNex AI — Multilingual Translation System
 * Supports: English (en), Tamil (ta), Hindi (hi), Spanish (es)
 */

const translations = {
  en: {
    "nav.features": "Features",
    "nav.howItWorks": "How It Works",
    "nav.privacy": "Privacy",
    "nav.login": "Sign In",
    "nav.signup": "Get Started",
    "nav.dashboard": "Dashboard",
    "nav.records": "Health Records",
    "nav.metrics": "Analytics",
    "nav.copilot": "AI Copilot",
    "nav.appointments": "Appointments",
    "nav.reminders": "Reminders",
    "nav.profile": "Profile",
    "stats.records": "Health Records",
    "stats.appointments": "Appointments",
    "stats.reminders": "Active Reminders",
    "stats.metrics": "Metrics Logged",
    "actions.addRecord": "Add Record",
    "actions.addAppointment": "Book Appointment",
    "actions.logMetric": "Log Metric",
    "actions.askAI": "Ask AI",
    "dashboard.recentRecords": "Recent Records",
    "dashboard.upcoming": "Upcoming Appointments",
    "dashboard.healthTrend": "Health Trend (Last 30 Days)",
    "dashboard.chartNote": "Based on your logged measurements. For informational purposes only.",
    "search.records": "Search records by title or notes...",
    "copilot.conversations": "Conversations",
    "copilot.disclaimer": "MediNex AI provides general health information only. Not a substitute for professional medical advice. For emergencies, call local services immediately.",
    "copilot.chip1": "What should I ask my doctor?",
    "copilot.chip2": "Explain my recent lab results",
    "copilot.chip3": "Healthy lifestyle tips",
    "copilot.chip4": "Summarize my health data",
    "appts.upcoming": "Upcoming",
    "appts.past": "Past",
    "appts.all": "All"
  },
  ta: {
    "nav.features": "அம்சங்கள்",
    "nav.howItWorks": "இது எப்படி வேலை செய்கிறது",
    "nav.privacy": "தனியுரிமை",
    "nav.login": "உள்நுழைய",
    "nav.signup": "தொடங்க",
    "nav.dashboard": "முகப்பு",
    "nav.records": "சுகாதார பதிவுகள்",
    "nav.metrics": "பகுப்பாய்வு",
    "nav.copilot": "AI உதவியாளர்",
    "nav.appointments": "சந்திப்புகள்",
    "nav.reminders": "நினைவூட்டல்கள்",
    "nav.profile": "சுயவிவரம்",
    "stats.records": "சுகாதார பதிவுகள்",
    "stats.appointments": "சந்திப்புகள்",
    "stats.reminders": "செயலில் உள்ள நினைவூட்டல்கள்",
    "stats.metrics": "பதிவு செய்யப்பட்ட அளவீடுகள்",
    "actions.addRecord": "பதிவு சேர்",
    "actions.addAppointment": "சந்திப்பை பதிவு செய்",
    "actions.logMetric": "அளவீட்டை பதிவு செய்",
    "actions.askAI": "AI-யிடம் கேள்",
    "dashboard.recentRecords": "சமீபத்திய பதிவுகள்",
    "dashboard.upcoming": "வரவிருக்கும் சந்திப்புகள்",
    "dashboard.healthTrend": "சுகாதார போக்கு (கடந்த 30 நாட்கள்)",
    "dashboard.chartNote": "தகவல் நோக்கங்களுக்காக மட்டுமே.",
    "search.records": "தலைப்பு அல்லது குறிப்புகளால் தேடு...",
    "copilot.conversations": "உரையாடல்கள்",
    "copilot.disclaimer": "MediNex AI பொதுவான சுகாதார தகவல்களை மட்டுமே வழங்குகிறது. மருத்துவ ஆலோசனைக்கு மாற்றாகாது.",
    "copilot.chip1": "என் மருத்துவரிடம் நான் என்ன கேட்க வேண்டும்?",
    "copilot.chip2": "எனது சமீபத்திய ஆய்வக முடிவுகளை விளக்குங்கள்",
    "copilot.chip3": "ஆரோக்கியமான வாழ்க்கை முறை குறிப்புகள்",
    "copilot.chip4": "எனது சுகாதார தரவை சுருக்கவும்",
    "appts.upcoming": "வரவிருக்கும்",
    "appts.past": "கடந்த",
    "appts.all": "அனைத்தும்"
  },
  hi: {
    "nav.features": "विशेषताएं",
    "nav.howItWorks": "यह कैसे काम करता है",
    "nav.privacy": "गोपनीयता",
    "nav.login": "साइन इन",
    "nav.signup": "शुरू करें",
    "nav.dashboard": "डैशबोर्ड",
    "nav.records": "स्वास्थ्य रिकॉर्ड",
    "nav.metrics": "विश्लेषण",
    "nav.copilot": "एआई सह-पायलट",
    "nav.appointments": "परामर्श",
    "nav.reminders": "अनुस्मारक",
    "nav.profile": "प्रोफ़ाइल",
    "stats.records": "स्वास्थ्य रिकॉर्ड",
    "stats.appointments": "परामर्श",
    "stats.reminders": "सक्रिय अनुस्मारक",
    "stats.metrics": "दर्ज मेट्रिक्स",
    "actions.addRecord": "रिकॉर्ड जोड़ें",
    "actions.addAppointment": "अपॉइंटमेंट बुक करें",
    "actions.logMetric": "मेट्रिक दर्ज करें",
    "actions.askAI": "एआई से पूछें",
    "dashboard.recentRecords": "हाल के रिकॉर्ड",
    "dashboard.upcoming": "आगामी अपॉइंटमेंट",
    "dashboard.healthTrend": "स्वास्थ्य रुझान (पिछले 30 दिन)",
    "dashboard.chartNote": "केवल सूचना के उद्देश्यों के लिए।",
    "search.records": "शीर्षक या नोट्स द्वारा खोजें...",
    "copilot.conversations": "बातचीत",
    "copilot.disclaimer": "MediNex AI केवल सामान्य स्वास्थ्य जानकारी प्रदान करता है। चिकित्सा सलाह का विकल्प नहीं है।",
    "copilot.chip1": "मुझे अपने डॉक्टर से क्या पूछना चाहिए?",
    "copilot.chip2": "मेरे हालिया लैब परिणामों की व्याख्या करें",
    "copilot.chip3": "स्वस्थ जीवन शैली के सुझाव",
    "copilot.chip4": "मेरे स्वास्थ्य डेटा का सारांश दें",
    "appts.upcoming": "आगामी",
    "appts.past": "पिछला",
    "appts.all": "सभी"
  },
  es: {
    "nav.features": "Características",
    "nav.howItWorks": "Cómo Funciona",
    "nav.privacy": "Privacidad",
    "nav.login": "Iniciar Sesión",
    "nav.signup": "Comenzar",
    "nav.dashboard": "Panel",
    "nav.records": "Registros Médicos",
    "nav.metrics": "Analítica",
    "nav.copilot": "Copiloto IA",
    "nav.appointments": "Citas",
    "nav.reminders": "Recordatorios",
    "nav.profile": "Perfil",
    "stats.records": "Registros Médicos",
    "stats.appointments": "Citas Médicas",
    "stats.reminders": "Recordatorios Activos",
    "stats.metrics": "Métricas Registradas",
    "actions.addRecord": "Agregar Registro",
    "actions.addAppointment": "Programar Cita",
    "actions.logMetric": "Registrar Métrica",
    "actions.askAI": "Preguntar a IA",
    "dashboard.recentRecords": "Registros Recientes",
    "dashboard.upcoming": "Próximas Citas",
    "dashboard.healthTrend": "Tendencia de Salud (Últimos 30 Días)",
    "dashboard.chartNote": "Basado en tus mediciones guardadas. Solo con fines informativos.",
    "search.records": "Buscar registros...",
    "copilot.conversations": "Conversaciones",
    "copilot.disclaimer": "MediNex AI proporciona información general de salud. No sustituye el consejo médico profesional.",
    "copilot.chip1": "¿Qué debo preguntarle a mi doctor?",
    "copilot.chip2": "Explicar mis resultados de laboratorio",
    "copilot.chip3": "Consejos de vida saludable",
    "copilot.chip4": "Resumir mis datos de salud",
    "appts.upcoming": "Próximas",
    "appts.past": "Pasadas",
    "appts.all": "Todas"
  }
};

let currentLang = localStorage.getItem('medinex_lang') || 'en';

function setLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;
    localStorage.setItem('medinex_lang', lang);
    translatePage();
    document.documentElement.setAttribute('lang', lang);
  }
}

function t(key) {
  return translations[currentLang]?.[key] || translations['en']?.[key] || key;
}

function getCurrentLanguage() {
  return currentLang;
}

function translatePage() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[currentLang]?.[key]) {
      el.textContent = translations[currentLang][key];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[currentLang]?.[key]) {
      el.setAttribute('placeholder', translations[currentLang][key]);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const langSelects = document.querySelectorAll('#langSelect, #dashLangSelect, #profileLang');
  langSelects.forEach(sel => {
    if (sel) {
      sel.value = currentLang;
      sel.addEventListener('change', (e) => {
        setLanguage(e.target.value);
        langSelects.forEach(s => { if (s) s.value = e.target.value; });
      });
    }
  });
  translatePage();
});

export { setLanguage, t, getCurrentLanguage, translatePage };
