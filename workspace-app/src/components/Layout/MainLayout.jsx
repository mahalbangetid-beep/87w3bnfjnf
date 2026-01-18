import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';
import ParticlesBackground from '../UI/ParticlesBackground';
import { AIChatWidget } from '../AI';

const MainLayout = () => {
    return (
        <div style={{ minHeight: '100dvh', position: 'relative' }}>
            {/* Particles Background */}
            <ParticlesBackground />

            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                    marginLeft: '280px',
                    minHeight: '100dvh',
                    padding: '24px 32px',
                    position: 'relative',
                    zIndex: 10,
                }}
                className="main-content"
            >
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
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
                }
                
                /* Mobile breakpoint */
                @media (max-width: 767px) {
                    .main-content {
                        margin-left: 0 !important;
                        padding: 16px !important;
                        padding-bottom: calc(90px + env(safe-area-inset-bottom)) !important;
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

