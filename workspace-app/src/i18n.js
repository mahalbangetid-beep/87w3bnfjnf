import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// IP-based language detection
const detectLanguageByIP = async () => {
    try {
        // Check if we already have a stored preference
        const storedLang = localStorage.getItem('i18nextLng');
        if (storedLang && ['id', 'en'].includes(storedLang)) {
            return storedLang;
        }

        // Try to detect by IP
        const response = await fetch('https://ipapi.co/json/', {
            signal: AbortSignal.timeout(3000) // 3 second timeout
        });

        if (response.ok) {
            const data = await response.json();
            // If user is from Indonesia, use Indonesian
            if (data.country_code === 'ID') {
                return 'id';
            }
        }

        // Default to English for other countries
        return 'en';
    } catch (error) {
        console.warn('IP detection failed, using browser language');
        // Fallback to browser language detection
        const browserLang = navigator.language?.toLowerCase();
        if (browserLang?.startsWith('id')) {
            return 'id';
        }
        return 'en';
    }
};

// Custom language detector
const ipLanguageDetector = {
    name: 'ipDetector',
    async: true,
    detect: async (callback) => {
        const lang = await detectLanguageByIP();
        callback(lang);
    },
    cacheUserLanguage: (lng) => {
        localStorage.setItem('i18nextLng', lng);
    }
};

// Initialize i18n
i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        supportedLngs: ['id', 'en'],
        debug: process.env.NODE_ENV === 'development',

        interpolation: {
            escapeValue: false, // React already escapes
        },

        backend: {
            loadPath: '/locales/{{lng}}/translation.json',
        },

        detection: {
            order: ['localStorage', 'querystring', 'cookie', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'i18nextLng',
            lookupQuerystring: 'lang',
            lookupCookie: 'i18next',
        },

        react: {
            useSuspense: true,
        },
    });

// Export helper functions
export const changeLanguage = async (lng) => {
    await i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);

    // Update document lang attribute
    document.documentElement.lang = lng;

    return lng;
};

export const getCurrentLanguage = () => {
    return i18n.language || 'en';
};

export const getSupportedLanguages = () => [
    { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
];

// Initialize IP-based detection on first load
export const initIPDetection = async () => {
    const storedLang = localStorage.getItem('i18nextLng');
    if (!storedLang) {
        const detectedLang = await detectLanguageByIP();
        await changeLanguage(detectedLang);
    }
};

export default i18n;
