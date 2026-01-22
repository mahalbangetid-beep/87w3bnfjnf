import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineGlobeAlt, HiOutlineCheck } from 'react-icons/hi';
import { changeLanguage, getSupportedLanguages, getCurrentLanguage } from '../i18n';

const LanguageSwitcher = ({ variant = 'dropdown', showLabel = true }) => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const languages = getSupportedLanguages();
    const currentLang = getCurrentLanguage();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageChange = async (langCode) => {
        await changeLanguage(langCode);
        setIsOpen(false);
    };

    const currentLanguage = languages.find(l => l.code === currentLang) || languages[1];

    // Toggle variant - simple button that toggles between languages
    if (variant === 'toggle') {
        const nextLang = currentLang === 'id' ? 'en' : 'id';
        const nextLangData = languages.find(l => l.code === nextLang);

        return (
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleLanguageChange(nextLang)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                }}
            >
                <span style={{ fontSize: '18px' }}>{currentLanguage.flag}</span>
                {showLabel && (
                    <span>{currentLanguage.code.toUpperCase()}</span>
                )}
            </motion.button>
        );
    }

    // Dropdown variant
    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: isOpen ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.03)',
                    color: isOpen ? '#a78bfa' : '#9ca3af',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    minWidth: showLabel ? '140px' : 'auto',
                }}
            >
                <HiOutlineGlobeAlt style={{ width: '18px', height: '18px' }} />
                <span style={{ fontSize: '18px' }}>{currentLanguage.flag}</span>
                {showLabel && (
                    <span style={{ flex: 1, textAlign: 'left' }}>{currentLanguage.name}</span>
                )}
                <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ fontSize: '12px' }}
                >
                    ▼
                </motion.span>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            right: 0,
                            minWidth: '180px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: 'rgba(17,17,27,0.98)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                            overflow: 'hidden',
                            zIndex: 1000,
                        }}
                    >
                        {languages.map((lang, index) => (
                            <motion.button
                                key={lang.code}
                                whileHover={{ backgroundColor: 'rgba(139,92,246,0.1)' }}
                                onClick={() => handleLanguageChange(lang.code)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: 'none',
                                    borderBottom: index < languages.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                    backgroundColor: 'transparent',
                                    color: lang.code === currentLang ? '#a78bfa' : '#9ca3af',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    textAlign: 'left',
                                }}
                            >
                                <span style={{ fontSize: '20px' }}>{lang.flag}</span>
                                <span style={{ flex: 1 }}>{lang.name}</span>
                                {lang.code === currentLang && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        style={{ color: '#10b981' }}
                                    >
                                        <HiOutlineCheck style={{ width: '18px', height: '18px' }} />
                                    </motion.span>
                                )}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LanguageSwitcher;
