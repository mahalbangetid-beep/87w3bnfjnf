import { motion } from 'framer-motion';

const AnimatedChart = ({ data, height = 200, delay = 0 }) => {
    const maxValue = Math.max(...data.map((d) => d.value));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay, duration: 0.5 }}
            className="glass-card p-6"
        >
            <div className="flex items-end justify-between gap-2" style={{ height: `${height}px` }}>
                {data.map((item, index) => {
                    const barHeight = (item.value / maxValue) * 100;
                    return (
                        <motion.div key={item.label} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full relative flex-1 flex items-end">
                                <motion.div
                                    className="w-full rounded-t-lg relative overflow-hidden group cursor-pointer"
                                    initial={{ height: 0 }}
                                    animate={{ height: `${barHeight}%` }}
                                    transition={{ delay: delay + 0.3 + index * 0.1, duration: 0.8, ease: [0.175, 0.885, 0.32, 1.275] }}
                                    whileHover={{ scale: 1.05 }}
                                    style={{ background: `linear-gradient(to top, ${item.color || 'rgb(139, 92, 246)'}, ${item.colorEnd || 'rgb(6, 182, 212)'})` }}
                                >
                                    <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <motion.div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                        {item.value.toLocaleString()}
                                    </motion.div>
                                </motion.div>
                            </div>
                            <motion.span className="text-xs text-gray-400 mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.5 + index * 0.1 }}>
                                {item.label}
                            </motion.span>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default AnimatedChart;
