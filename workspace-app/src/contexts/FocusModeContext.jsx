import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const FocusModeContext = createContext(undefined);

export const FocusModeProvider = ({ children }) => {
    const [isFocusMode, setIsFocusMode] = useState(() => {
        // Persist focus mode preference
        const saved = localStorage.getItem('focusMode');
        return saved === 'true';
    });

    const toggleFocusMode = useCallback(() => {
        setIsFocusMode(prev => {
            const newValue = !prev;
            localStorage.setItem('focusMode', String(newValue));
            return newValue;
        });
    }, []);

    const enableFocusMode = useCallback(() => {
        setIsFocusMode(true);
        localStorage.setItem('focusMode', 'true');
    }, []);

    const disableFocusMode = useCallback(() => {
        setIsFocusMode(false);
        localStorage.setItem('focusMode', 'false');
    }, []);

    // Keyboard shortcut: Cmd/Ctrl + Shift + F
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'F') {
                e.preventDefault();
                toggleFocusMode();
            }
            // Escape to exit focus mode
            if (e.key === 'Escape' && isFocusMode) {
                disableFocusMode();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFocusMode, toggleFocusMode, disableFocusMode]);

    // Add/remove body class for global focus mode styling
    useEffect(() => {
        if (isFocusMode) {
            document.body.classList.add('focus-mode-active');
        } else {
            document.body.classList.remove('focus-mode-active');
        }

        return () => {
            document.body.classList.remove('focus-mode-active');
        };
    }, [isFocusMode]);

    return (
        <FocusModeContext.Provider
            value={{
                isFocusMode,
                toggleFocusMode,
                enableFocusMode,
                disableFocusMode,
            }}
        >
            {children}
        </FocusModeContext.Provider>
    );
};

export const useFocusMode = () => {
    const context = useContext(FocusModeContext);
    if (context === undefined) {
        throw new Error('useFocusMode must be used within a FocusModeProvider');
    }
    return context;
};

export default FocusModeContext;
