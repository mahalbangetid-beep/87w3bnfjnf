import { motion } from 'framer-motion';

const RingChart = ({ percentage = 75, size = 120, strokeWidth = 10, color = 'violet', label = '' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    const colors = {
        violet: { start: '#8b5cf6', end: '#06b6d4' },
        cyan: { start: '#06b6d4', end: '#3b82f6' },
        pink: { start: '#ec4899', end: '#8b5cf6' },
        emerald: { start: '#10b981', end: '#06b6d4' },
    };

    const gradientId = `ring-gradient-${color}-${percentage}`;
    const { start, end } = colors[color] || colors.violet;

    return (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, type: 'spring' }} className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="ring-chart">
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={start} />
                        <stop offset="100%" stopColor={end} />
                    </linearGradient>
                </defs>
                <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} fill="none" />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={radius}
                    stroke={`url(#${gradientId})`}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span className="text-2xl font-bold text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
                    {percentage}%
                </motion.span>
                {label && <span className="text-xs text-gray-400 mt-1">{label}</span>}
            </div>
        </motion.div>
    );
};

export default RingChart;
