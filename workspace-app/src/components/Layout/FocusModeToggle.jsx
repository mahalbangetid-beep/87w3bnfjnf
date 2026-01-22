import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { useFocusMode } from '../../contexts/FocusModeContext';

/**
 * FocusModeToggle - A toggle button for Focus Mode
 * Shows in the navbar/header to enable distraction-free writing
 */
const FocusModeToggle = ({ showLabel = false, size = 'default' }) => {
    const { isFocusMode, toggleFocusMode } = useFocusMode();

    const sizes = {
        small: { button: '32px', icon: '16px', padding: '6px' },
        default: { button: '40px', icon: '20px', padding: '10px' },
        large: { button: '48px', icon: '24px', padding: '12px' },
    };

    const currentSize = sizes[size] || sizes.default;

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleFocusMode}
            title={isFocusMode ? 'Exit Focus Mode (Esc)' : 'Enter Focus Mode (Ctrl+Shift+F)'}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: showLabel ? `${currentSize.padding} 16px` : currentSize.padding,
                borderRadius: '10px',
                border: isFocusMode
                    ? '1px solid rgba(139, 92, 246, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: isFocusMode
                    ? 'rgba(139, 92, 246, 0.15)'
                    : 'rgba(255, 255, 255, 0.03)',
                color: isFocusMode ? '#a78bfa' : '#9ca3af',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Animated glow effect when active */}
            <AnimatePresence>
                {isFocusMode && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.2), transparent 70%)',
                            pointerEvents: 'none',
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Icon */}
            <motion.div
                animate={{ rotate: isFocusMode ? 0 : 0 }}
                style={{ position: 'relative', zIndex: 1 }}
            >
                {isFocusMode ? (
                    <HiOutlineEyeOff
                        style={{
                            width: currentSize.icon,
                            height: currentSize.icon
                        }}
                    />
                ) : (
                    <HiOutlineEye
                        style={{
                            width: currentSize.icon,
                            height: currentSize.icon
                        }}
                    />
                )}
            </motion.div>

            {/* Label */}
            {showLabel && (
                <span style={{
                    fontSize: '13px',
                    fontWeight: '500',
                    position: 'relative',
                    zIndex: 1,
                }}>
                    {isFocusMode ? 'Exit Focus' : 'Focus Mode'}
                </span>
            )}

            {/* Active indicator dot */}
            <AnimatePresence>
                {isFocusMode && !showLabel && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: '#a78bfa',
                            boxShadow: '0 0 8px rgba(167, 139, 250, 0.5)',
                        }}
                    />
                )}
            </AnimatePresence>
        </motion.button>
    );
};

/**
 * FocusModeIndicator - A small floating indicator when focus mode is active
 */
export const FocusModeIndicator = () => {
    const { isFocusMode, disableFocusMode } = useFocusMode();

    return (
        <AnimatePresence>
            {isFocusMode && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    style={{
                        position: 'fixed',
                        top: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        background: 'rgba(139, 92, 246, 0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        zIndex: 9999,
                        cursor: 'pointer',
                    }}
                    onClick={disableFocusMode}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <HiOutlineEyeOff style={{ width: '16px', height: '16px', color: '#a78bfa' }} />
                    <span style={{ fontSize: '12px', color: '#a78bfa', fontWeight: '500' }}>
                        Focus Mode
                    </span>
                    <span style={{ fontSize: '10px', color: '#9ca3af' }}>
                        Press Esc to exit
                    </span>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FocusModeToggle;
