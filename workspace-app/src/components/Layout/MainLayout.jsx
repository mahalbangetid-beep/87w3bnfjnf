import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';
import ParticlesBackground from '../UI/ParticlesBackground';
import { AIChatWidget } from '../AI';
import FocusModeToggle, { FocusModeIndicator } from './FocusModeToggle';
import { useFocusMode } from '../../contexts/FocusModeContext';

const MainLayout = () => {
    const { isFocusMode } = useFocusMode();

    return (
        <div style={{ minHeight: '100dvh', position: 'relative' }}>
            {/* Particles Background */}
            <ParticlesBackground />

            {/* Focus Mode Indicator - shows at top when active */}
            <FocusModeIndicator />

            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                    marginLeft: isFocusMode ? '0' : '280px',
                    minHeight: '100dvh',
                    padding: '24px 32px',
                    position: 'relative',
                    zIndex: 10,
                    transition: 'margin-left 0.3s ease',
                }}
                className="main-content"
            >
                {/* Focus Mode Toggle - Fixed position in top right */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{
                        position: 'fixed',
                        top: '20px',
                        right: '24px',
                        zIndex: 100,
                    }}
                    className="focus-toggle-container"
                >
                    <FocusModeToggle />
                </motion.div>

                <div
                    style={{ maxWidth: '1400px', margin: '0 auto' }}
                    className="content-container"
                >
                    <Outlet />
                </div>
            </motion.main>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />

            {/* AI Chat Widget */}
            <AIChatWidget />

            {/* Responsive styles */}
            <style>{`
                /* Tablet breakpoint */
                @media (max-width: 1023px) {
                    .main-content {
                        margin-left: 0 !important;
                        padding: 20px !important;
                    }
                    .focus-toggle-container {
                        top: 16px !important;
                        right: 16px !important;
                    }
                }
                
                /* Mobile breakpoint */
                @media (max-width: 767px) {
                    .main-content {
                        margin-left: 0 !important;
                        padding: 16px !important;
                        padding-bottom: calc(90px + env(safe-area-inset-bottom)) !important;
                    }
                    .focus-toggle-container {
                        top: 12px !important;
                        right: 12px !important;
                    }
                }
                
                /* Extra small */
                @media (max-width: 374px) {
                    .main-content {
                        padding: 12px !important;
                        padding-bottom: calc(90px + env(safe-area-inset-bottom)) !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default MainLayout;
