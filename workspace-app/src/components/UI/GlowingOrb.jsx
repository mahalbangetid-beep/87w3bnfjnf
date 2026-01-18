import { motion } from 'framer-motion';

const GlowingOrb = ({ size = 200, color = 'violet', className = '' }) => {
    const colors = {
        violet: { primary: 'rgba(139, 92, 246, 0.4)', secondary: 'rgba(167, 139, 250, 0.2)' },
        cyan: { primary: 'rgba(6, 182, 212, 0.4)', secondary: 'rgba(34, 211, 238, 0.2)' },
        pink: { primary: 'rgba(236, 72, 153, 0.4)', secondary: 'rgba(244, 114, 182, 0.2)' },
        emerald: { primary: 'rgba(16, 185, 129, 0.4)', secondary: 'rgba(52, 211, 153, 0.2)' },
    };

    const c = colors[color] || colors.violet;

    return (
        <motion.div
            className={`pointer-events-none absolute ${className}`}
            style={{ width: size, height: size }}
            animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
        >
            <div
                className="w-full h-full rounded-full blur-3xl"
                style={{
                    background: `radial-gradient(circle, ${c.primary} 0%, ${c.secondary} 50%, transparent 70%)`,
                }}
            />
        </motion.div>
    );
};

export default GlowingOrb;
