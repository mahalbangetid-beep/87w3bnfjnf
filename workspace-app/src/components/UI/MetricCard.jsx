import { motion } from 'framer-motion';
import AnimatedCounter from './AnimatedCounter';

const colorStyles = {
    violet: {
        bg: 'rgba(139, 92, 246, 0.1)',
        border: 'rgba(139, 92, 246, 0.3)',
        text: '#a78bfa',
    },
    cyan: {
        bg: 'rgba(6, 182, 212, 0.1)',
        border: 'rgba(6, 182, 212, 0.3)',
        text: '#22d3ee',
    },
    pink: {
        bg: 'rgba(236, 72, 153, 0.1)',
        border: 'rgba(236, 72, 153, 0.3)',
        text: '#f472b6',
    },
    emerald: {
        bg: 'rgba(16, 185, 129, 0.1)',
        border: 'rgba(16, 185, 129, 0.3)',
        text: '#34d399',
    },
    orange: {
        bg: 'rgba(249, 115, 22, 0.1)',
        border: 'rgba(249, 115, 22, 0.3)',
        text: '#fb923c',
    },
};

const MetricCard = ({
    title,
    value,
    prefix = '',
    suffix = '',
    icon: Icon,
    trend,
    trendValue,
    color = 'violet',
    delay = 0,
}) => {
    const colors = colorStyles[color] || colorStyles.violet;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            whileHover={{ y: -3 }}
            className="glass-card p-4 relative overflow-hidden"
        >
            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div
                        className="icon-container"
                        style={{ backgroundColor: colors.bg, borderColor: colors.border }}
                    >
                        {Icon && <Icon className="w-5 h-5" style={{ color: colors.text }} />}
                    </div>

                    {/* Trend Badge */}
                    {trend && (
                        <div
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                                backgroundColor: trend === 'up' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                color: trend === 'up' ? '#34d399' : '#f87171',
                            }}
                        >
                            <svg
                                className="w-3 h-3"
                                style={{ transform: trend === 'up' ? 'rotate(0deg)' : 'rotate(180deg)' }}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                            {trendValue}
                        </div>
                    )}
                </div>

                {/* Value */}
                <div className="mb-1">
                    <span className="text-2xl font-bold text-white">
                        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} duration={1.5} />
                    </span>
                </div>

                {/* Title */}
                <p className="text-xs text-gray-400">{title}</p>

                {/* Animated Line */}
                <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <motion.div
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${colors.text}, rgba(6, 182, 212, 0.8))` }}
                        initial={{ width: 0 }}
                        animate={{ width: '70%' }}
                        transition={{ delay: delay + 0.3, duration: 1 }}
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default MetricCard;
