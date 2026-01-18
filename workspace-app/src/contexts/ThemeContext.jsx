import { createContext, useContext, useState, useEffect } from 'react';
import { safeGetItem, safeSetItem } from '../utils/safeStorage';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        return safeGetItem('darkMode', true);
    });

    const [compactMode, setCompactMode] = useState(() => {
        return safeGetItem('compactMode', false);
    });

    useEffect(() => {
        safeSetItem('darkMode', darkMode);

        // Apply theme to document
        if (darkMode) {
            document.documentElement.classList.add('dark-mode');
            document.documentElement.classList.remove('light-mode');
            document.body.style.backgroundColor = '#0a0a14';
            document.body.style.color = '#ffffff';
        } else {
            document.documentElement.classList.add('light-mode');
            document.documentElement.classList.remove('dark-mode');
            document.body.style.backgroundColor = '#f5f5f7';
            document.body.style.color = '#1a1a2e';
        }
    }, [darkMode]);

    useEffect(() => {
        safeSetItem('compactMode', compactMode);

        // Apply compact mode
        if (compactMode) {
            document.documentElement.classList.add('compact-mode');
            document.documentElement.style.setProperty('--spacing-unit', '0.75');
        } else {
            document.documentElement.classList.remove('compact-mode');
            document.documentElement.style.setProperty('--spacing-unit', '1');
        }
    }, [compactMode]);

    const toggleDarkMode = () => setDarkMode(prev => !prev);
    const toggleCompactMode = () => setCompactMode(prev => !prev);

    const value = {
        darkMode,
        setDarkMode,
        toggleDarkMode,
        compactMode,
        setCompactMode,
        toggleCompactMode,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
