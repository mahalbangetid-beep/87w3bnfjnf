import { motion } from 'framer-motion';
import { HiOutlinePlus } from 'react-icons/hi';

/**
 * EmptyState - Reusable component for displaying empty states with CTA
 * 
 * @param {string} icon - Emoji or icon component to display
 * @param {string} title - Main title text
 * @param {string} description - Description text
 * @param {string} actionLabel - Button label (optional)
 * @param {function} onAction - Button click handler (optional)
 * @param {string} variant - 'default' | 'minimal' | 'card' (styling variant)
 * @param {string} color - Accent color for styling
 * @param {boolean} isFiltered - If true, shows "adjust filters" message
 * @param {ReactNode} children - Custom content/buttons
 */
const EmptyState = ({
    icon = '📭',
    title = 'No data found',
    description = 'Get started by creating your first item',
    actionLabel,
    onAction,
    variant = 'default',
    color = '#8b5cf6',
    isFiltered = false,
    children,
    IconComponent,
}) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'minimal':
                return {
                    container: {
                        textAlign: 'center',
                        padding: '40px 20px',
                    },
                    iconContainer: {
                        width: '64px',
                        height: '64px',
                        margin: '0 auto 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    },
                };
            case 'card':
                return {
                    container: {
                        textAlign: 'center',
                        padding: '48px 24px',
                        borderRadius: '20px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                    },
                    iconContainer: {
                        width: '80px',
                        height: '80px',
                        borderRadius: '20px',
                        background: `linear-gradient(135deg, ${color}20, ${color}10)`,
                        border: `1px solid ${color}30`,
                        margin: '0 auto 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    },
                };
            default:
                return {
                    container: {
                        textAlign: 'center',
                        padding: '60px 20px',
                    },
                    iconContainer: {
                        width: '80px',
                        height: '80px',
                        borderRadius: '20px',
                        background: `linear-gradient(135deg, ${color}15, ${color}05)`,
                        border: `1px solid ${color}20`,
                        margin: '0 auto 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    },
                };
        }
    };

    const styles = getVariantStyles();

    // Determine description based on filter state
    const displayDescription = isFiltered 
        ? 'Try adjusting your search or filters to find what you\'re looking for'
        : description;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={styles.container}
        >
            {/* Icon */}
            <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                style={styles.iconContainer}
            >
                {IconComponent ? (
                    <IconComponent 
                        style={{ 
                            width: '36px', 
                            height: '36px', 
                            color: color 
                        }} 
                    />
                ) : (
                    <span style={{ fontSize: '36px' }}>{icon}</span>
                )}
            </motion.div>

            {/* Title */}
            <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '8px',
                }}
            >
                {title}
            </motion.h3>

            {/* Description */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                    fontSize: '14px',
                    color: '#9ca3af',
                    marginBottom: actionLabel || children ? '24px' : '0',
                    maxWidth: '320px',
                    margin: '0 auto',
                    lineHeight: '1.6',
                }}
            >
                {displayDescription}
            </motion.p>

            {/* Action Button */}
            {actionLabel && onAction && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{ marginTop: '24px' }}
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onAction}
                        className="btn-glow"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                        }}
                    >
                        <HiOutlinePlus style={{ width: '18px', height: '18px' }} />
                        {actionLabel}
                    </motion.button>
                </motion.div>
            )}

            {/* Custom Children */}
            {children && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{ marginTop: '24px' }}
                >
                    {children}
                </motion.div>
            )}

            {/* Motivational Tips for Empty Data */}
            {!isFiltered && !actionLabel && !children && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        marginTop: '32px',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        maxWidth: '320px',
                        margin: '32px auto 0',
                    }}
                >
                    <p style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}>
                        <span style={{ fontSize: '16px' }}>💡</span>
                        <span>Start small, stay consistent, and watch your progress grow!</span>
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
};

// Pre-configured Empty State variants for common use cases
export const ProjectsEmptyState = ({ onAction, isFiltered }) => (
    <EmptyState
        icon="📂"
        title={isFiltered ? "No projects match your filters" : "No projects yet"}
        description="Track your client projects, set deadlines, and monitor progress all in one place"
        actionLabel={!isFiltered ? "Create Your First Project" : undefined}
        onAction={onAction}
        color="#8b5cf6"
        isFiltered={isFiltered}
    />
);

export const NotesEmptyState = ({ onAction, isFiltered }) => (
    <EmptyState
        icon="📝"
        title={isFiltered ? "No notes match your search" : "No notes yet"}
        description="Capture ideas, meeting notes, and important information here"
        actionLabel={!isFiltered ? "Create Your First Note" : undefined}
        onAction={onAction}
        color="#06b6d4"
        isFiltered={isFiltered}
    />
);

export const TasksEmptyState = ({ onAction, isFiltered }) => (
    <EmptyState
        icon="✅"
        title={isFiltered ? "No tasks match your filters" : "All clear!"}
        description={isFiltered ? undefined : "You're all caught up! Add new tasks to stay productive"}
        actionLabel={!isFiltered ? "Add New Task" : undefined}
        onAction={onAction}
        color="#10b981"
        isFiltered={isFiltered}
    />
);

export const TransactionsEmptyState = ({ onAction, isFiltered, type }) => {
    const config = {
        income: {
            icon: '💰',
            title: isFiltered ? "No income records match your filters" : "No income recorded yet",
            description: "Track your earnings and see your money flow",
            actionLabel: "Record Income",
            color: '#10b981',
        },
        expense: {
            icon: '💸',
            title: isFiltered ? "No expenses match your filters" : "No expenses recorded",
            description: "Track your spending to understand where your money goes",
            actionLabel: "Record Expense",
            color: '#ef4444',
        },
        default: {
            icon: '📊',
            title: isFiltered ? "No transactions match your filters" : "No transactions yet",
            description: "Start tracking your income and expenses",
            actionLabel: "Add Transaction",
            color: '#8b5cf6',
        },
    };
    
    const c = config[type] || config.default;
    
    return (
        <EmptyState
            icon={c.icon}
            title={c.title}
            description={c.description}
            actionLabel={!isFiltered ? c.actionLabel : undefined}
            onAction={onAction}
            color={c.color}
            isFiltered={isFiltered}
        />
    );
};

export const SocialPostsEmptyState = ({ onAction, isFiltered }) => (
    <EmptyState
        icon="🐦"
        title={isFiltered ? "No posts match your filters" : "No social posts yet"}
        description="Create engaging content for your audience and schedule posts"
        actionLabel={!isFiltered ? "Create Your First Post" : undefined}
        onAction={onAction}
        color="#ec4899"
        isFiltered={isFiltered}
    />
);

export const AccountsEmptyState = ({ onAction }) => (
    <EmptyState
        icon="💳"
        title="No accounts set up"
        description="Add your bank accounts, e-wallets, and cash to start tracking your finances"
        actionLabel="Add Your First Account"
        onAction={onAction}
        color="#3b82f6"
        variant="card"
    />
);

export const BookmarksEmptyState = ({ onAction, isFiltered }) => (
    <EmptyState
        icon="🔖"
        title={isFiltered ? "No bookmarks match your search" : "No bookmarks yet"}
        description="Save important links, resources, and references for quick access"
        actionLabel={!isFiltered ? "Add Bookmark" : undefined}
        onAction={onAction}
        color="#f59e0b"
        isFiltered={isFiltered}
    />
);

export const NotificationsEmptyState = () => (
    <EmptyState
        icon="🔔"
        title="All caught up!"
        description="You have no new notifications. We'll let you know when something important happens"
        color="#8b5cf6"
        variant="minimal"
    />
);

export const SearchEmptyState = ({ query }) => (
    <EmptyState
        icon="🔍"
        title="No results found"
        description={`We couldn't find anything matching "${query}". Try a different search term.`}
        color="#6b7280"
        variant="minimal"
    />
);

export const BillsEmptyState = ({ onAction, isFiltered }) => (
    <EmptyState
        icon="📋"
        title={isFiltered ? "No bills match your filters" : "No bills yet"}
        description="Track your recurring bills and never miss a payment deadline"
        actionLabel={!isFiltered ? "Add Your First Bill" : undefined}
        onAction={onAction}
        color="#f59e0b"
        isFiltered={isFiltered}
    />
);

export const GoalsEmptyState = ({ onAction }) => (
    <EmptyState
        icon="🎯"
        title="No goals set"
        description="Set your goals and track your progress towards achieving them"
        actionLabel="Create Your First Goal"
        onAction={onAction}
        color="#8b5cf6"
    />
);

export const IdeasEmptyState = ({ onAction, isFiltered }) => (
    <EmptyState
        icon="💡"
        title={isFiltered ? "No ideas match your filters" : "No ideas yet"}
        description="Capture your project ideas and turn them into reality"
        actionLabel={!isFiltered ? "Add New Idea" : undefined}
        onAction={onAction}
        color="#06b6d4"
        isFiltered={isFiltered}
    />
);

export default EmptyState;
