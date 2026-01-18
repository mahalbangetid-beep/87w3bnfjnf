const { sequelize } = require('../config/database');
const Role = require('./Role');
const User = require('./User');
const Project = require('./Project');
const Note = require('./Note');
const Task = require('./Task');
const Budget = require('./Budget');
const Expense = require('./Expense');
const Asset = require('./Asset');
const ActivityLog = require('./ActivityLog');
const Milestone = require('./Milestone');
const Goal = require('./Goal');
const IdeaProject = require('./IdeaProject');
const ProjectPlan = require('./ProjectPlan');

// Social Stack Models
const SocialAccount = require('./SocialAccount');
const SocialPost = require('./SocialPost');
const BlogConnection = require('./BlogConnection');
const BlogPost = require('./BlogPost');
const HashtagCollection = require('./HashtagCollection');
const AIPromptTemplate = require('./AIPromptTemplate');
const SystemSetting = require('./SystemSetting');

// Finance Models
const FinanceAccount = require('./FinanceAccount');
const FinanceCategory = require('./FinanceCategory');
const FinanceTransaction = require('./FinanceTransaction');
const FinanceBill = require('./FinanceBill');
const FinanceNote = require('./FinanceNote');

// Assets Models
const AssetAccount = require('./AssetAccount');
const AssetItem = require('./AssetItem');
const AssetNote = require('./AssetNote');
const AssetBookmark = require('./AssetBookmark');

// Notification Models
const Notification = require('./Notification');
const PushSubscription = require('./PushSubscription');
const NotificationPreference = require('./NotificationPreference');

// 2FA Models
const TwoFactorAuth = require('./TwoFactorAuth');
const TrustedDevice = require('./TrustedDevice');

// Collaboration Models
const ProjectCollaborator = require('./ProjectCollaborator');
const ProjectActivity = require('./ProjectActivity');

// Feature Suggestions
const FeatureSuggestion = require('./FeatureSuggestion');

// AI Configuration
const UserAIConfig = require('./UserAIConfig');

// Blog System Models
const BlogCategory = require('./BlogCategory');
const BlogTag = require('./BlogTag');
const BlogArticle = require('./BlogArticle');
const BlogArticleTag = require('./BlogArticleTag');
const BlogComment = require('./BlogComment');

// Page Content Model
const PageContent = require('./PageContent');

// Define relationships

// User - Role
Role.hasMany(User, { foreignKey: 'roleId' });
User.belongsTo(Role, { foreignKey: 'roleId' });

// User - Projects
User.hasMany(Project, { foreignKey: 'userId' });
Project.belongsTo(User, { foreignKey: 'userId' });

// Project Collaborators
Project.hasMany(ProjectCollaborator, { foreignKey: 'projectId' });
ProjectCollaborator.belongsTo(Project, { foreignKey: 'projectId' });
User.hasMany(ProjectCollaborator, { foreignKey: 'userId' });
ProjectCollaborator.belongsTo(User, { foreignKey: 'userId', as: 'user' });
ProjectCollaborator.belongsTo(User, { foreignKey: 'invitedById', as: 'invitedBy' });

// Project Activities
Project.hasMany(ProjectActivity, { foreignKey: 'projectId' });
ProjectActivity.belongsTo(Project, { foreignKey: 'projectId' });
User.hasMany(ProjectActivity, { foreignKey: 'userId' });
ProjectActivity.belongsTo(User, { foreignKey: 'userId' });

// Feature Suggestions
User.hasMany(FeatureSuggestion, { foreignKey: 'userId' });
FeatureSuggestion.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User - AI Configuration (One-to-One)
User.hasOne(UserAIConfig, { foreignKey: 'userId' });
UserAIConfig.belongsTo(User, { foreignKey: 'userId' });

// User - Notes
User.hasMany(Note, { foreignKey: 'userId' });
Note.belongsTo(User, { foreignKey: 'userId' });

// Project - Notes
Project.hasMany(Note, { foreignKey: 'projectId' });
Note.belongsTo(Project, { foreignKey: 'projectId' });

// User - Tasks
User.hasMany(Task, { foreignKey: 'userId' });
Task.belongsTo(User, { foreignKey: 'userId' });

// Project - Tasks
Project.hasMany(Task, { foreignKey: 'projectId' });
Task.belongsTo(Project, { foreignKey: 'projectId' });

// User - Budgets
User.hasMany(Budget, { foreignKey: 'userId' });
Budget.belongsTo(User, { foreignKey: 'userId' });

// Project - Budget (One-to-One)
Project.hasOne(Budget, { foreignKey: 'projectId' });
Budget.belongsTo(Project, { foreignKey: 'projectId' });

// User - Expenses
User.hasMany(Expense, { foreignKey: 'userId' });
Expense.belongsTo(User, { foreignKey: 'userId' });

// Project - Expenses
Project.hasMany(Expense, { foreignKey: 'projectId' });
Expense.belongsTo(Project, { foreignKey: 'projectId' });

// User - Assets
User.hasMany(Asset, { foreignKey: 'userId' });
Asset.belongsTo(User, { foreignKey: 'userId' });

// Project - Assets
Project.hasMany(Asset, { foreignKey: 'projectId' });
Asset.belongsTo(Project, { foreignKey: 'projectId' });

// User - Activity Logs
User.hasMany(ActivityLog, { foreignKey: 'userId' });
ActivityLog.belongsTo(User, { foreignKey: 'userId' });

// User - Milestones
User.hasMany(Milestone, { foreignKey: 'userId' });
Milestone.belongsTo(User, { foreignKey: 'userId' });

// Project - Milestones
Project.hasMany(Milestone, { foreignKey: 'projectId' });
Milestone.belongsTo(Project, { foreignKey: 'projectId' });

// User - Goals
User.hasMany(Goal, { foreignKey: 'userId' });
Goal.belongsTo(User, { foreignKey: 'userId' });

// User - Idea Projects (Space module)
User.hasMany(IdeaProject, { foreignKey: 'userId' });
IdeaProject.belongsTo(User, { foreignKey: 'userId' });

// User - Project Plans (Space module)
User.hasMany(ProjectPlan, { foreignKey: 'userId' });
ProjectPlan.belongsTo(User, { foreignKey: 'userId' });

// ============ SOCIAL STACK RELATIONSHIPS ============

// User - Social Accounts
User.hasMany(SocialAccount, { foreignKey: 'userId' });
SocialAccount.belongsTo(User, { foreignKey: 'userId' });

// User - Social Posts
User.hasMany(SocialPost, { foreignKey: 'userId' });
SocialPost.belongsTo(User, { foreignKey: 'userId' });

// User - Blog Connections
User.hasMany(BlogConnection, { foreignKey: 'userId' });
BlogConnection.belongsTo(User, { foreignKey: 'userId' });

// User - Blog Posts
User.hasMany(BlogPost, { foreignKey: 'userId' });
BlogPost.belongsTo(User, { foreignKey: 'userId' });

// Blog Connection - Blog Posts
BlogConnection.hasMany(BlogPost, { foreignKey: 'connectionId' });
BlogPost.belongsTo(BlogConnection, { foreignKey: 'connectionId' });

// User - Hashtag Collections
User.hasMany(HashtagCollection, { foreignKey: 'userId' });
HashtagCollection.belongsTo(User, { foreignKey: 'userId' });

// User - AI Prompt Templates
User.hasMany(AIPromptTemplate, { foreignKey: 'userId' });
AIPromptTemplate.belongsTo(User, { foreignKey: 'userId' });

// ============ FINANCE RELATIONSHIPS ============

// User - Finance Accounts
User.hasMany(FinanceAccount, { foreignKey: 'userId' });
FinanceAccount.belongsTo(User, { foreignKey: 'userId' });

// User - Finance Categories
User.hasMany(FinanceCategory, { foreignKey: 'userId' });
FinanceCategory.belongsTo(User, { foreignKey: 'userId' });

// User - Finance Transactions
User.hasMany(FinanceTransaction, { foreignKey: 'userId' });
FinanceTransaction.belongsTo(User, { foreignKey: 'userId' });

// Finance Account - Transactions
FinanceAccount.hasMany(FinanceTransaction, { foreignKey: 'accountId' });
FinanceTransaction.belongsTo(FinanceAccount, { foreignKey: 'accountId' });

// Finance Category - Transactions
FinanceCategory.hasMany(FinanceTransaction, { foreignKey: 'categoryId' });
FinanceTransaction.belongsTo(FinanceCategory, { foreignKey: 'categoryId' });

// User - Finance Bills
User.hasMany(FinanceBill, { foreignKey: 'userId' });
FinanceBill.belongsTo(User, { foreignKey: 'userId' });

// User - Finance Notes
User.hasMany(FinanceNote, { foreignKey: 'userId' });
FinanceNote.belongsTo(User, { foreignKey: 'userId' });

// Finance Transaction - Notes
FinanceTransaction.hasMany(FinanceNote, { foreignKey: 'transactionId' });
FinanceNote.belongsTo(FinanceTransaction, { foreignKey: 'transactionId' });

// User - Asset Accounts
User.hasMany(AssetAccount, { foreignKey: 'userId' });
AssetAccount.belongsTo(User, { foreignKey: 'userId' });

// User - Asset Items
User.hasMany(AssetItem, { foreignKey: 'userId' });
AssetItem.belongsTo(User, { foreignKey: 'userId' });

// User - Asset Notes
User.hasMany(AssetNote, { foreignKey: 'userId' });
AssetNote.belongsTo(User, { foreignKey: 'userId' });

// AssetNote - AssetAccount relationship
AssetAccount.hasMany(AssetNote, { foreignKey: 'accountId' });
AssetNote.belongsTo(AssetAccount, { foreignKey: 'accountId' });

// AssetNote - AssetItem relationship
AssetItem.hasMany(AssetNote, { foreignKey: 'assetItemId' });
AssetNote.belongsTo(AssetItem, { foreignKey: 'assetItemId' });

// User - Asset Bookmarks
User.hasMany(AssetBookmark, { foreignKey: 'userId' });
AssetBookmark.belongsTo(User, { foreignKey: 'userId' });

// ============ NOTIFICATION RELATIONSHIPS ============

// User - Notifications
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// User - Push Subscriptions
User.hasMany(PushSubscription, { foreignKey: 'userId' });
PushSubscription.belongsTo(User, { foreignKey: 'userId' });

// User - Notification Preferences (One-to-One)
User.hasOne(NotificationPreference, { foreignKey: 'userId' });
NotificationPreference.belongsTo(User, { foreignKey: 'userId' });

// ============ BLOG SYSTEM RELATIONSHIPS ============

// Blog Category - Articles
BlogCategory.hasMany(BlogArticle, { foreignKey: 'categoryId', as: 'articles' });
BlogArticle.belongsTo(BlogCategory, { foreignKey: 'categoryId', as: 'category' });

// User (Author) - Blog Articles
User.hasMany(BlogArticle, { foreignKey: 'authorId', as: 'blogArticles' });
BlogArticle.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// Blog Article - Tags (Many-to-Many through BlogArticleTag)
BlogArticle.belongsToMany(BlogTag, {
    through: BlogArticleTag,
    foreignKey: 'articleId',
    otherKey: 'tagId',
    as: 'tags'
});
BlogTag.belongsToMany(BlogArticle, {
    through: BlogArticleTag,
    foreignKey: 'tagId',
    otherKey: 'articleId',
    as: 'articles'
});

// Blog Article - Comments
BlogArticle.hasMany(BlogComment, { foreignKey: 'articleId', as: 'comments' });
BlogComment.belongsTo(BlogArticle, { foreignKey: 'articleId', as: 'article' });

// Blog Comment - Nested Replies (Self-referencing)
BlogComment.hasMany(BlogComment, { foreignKey: 'parentId', as: 'replies' });
BlogComment.belongsTo(BlogComment, { foreignKey: 'parentId', as: 'parent' });

// User - Blog Comments (optional, for logged-in users)
User.hasMany(BlogComment, { foreignKey: 'userId', as: 'blogComments' });
BlogComment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
    sequelize,
    Role,
    User,
    Project,
    Note,
    Task,
    Budget,
    Expense,
    Asset,
    ActivityLog,
    Milestone,
    Goal,
    IdeaProject,
    ProjectPlan,
    // Social Stack
    SocialAccount,
    SocialPost,
    BlogConnection,
    BlogPost,
    HashtagCollection,
    AIPromptTemplate,
    SystemSetting,
    // Finance
    FinanceAccount,
    FinanceCategory,
    FinanceTransaction,
    FinanceBill,
    FinanceNote,
    // Assets
    AssetAccount,
    AssetItem,
    AssetNote,
    AssetBookmark,
    // Notifications
    Notification,
    PushSubscription,
    NotificationPreference,
    // 2FA
    TwoFactorAuth,
    TrustedDevice,
    // Collaboration
    ProjectCollaborator,
    ProjectActivity,
    // Feature Suggestions
    FeatureSuggestion,
    // Blog System
    BlogCategory,
    BlogTag,
    BlogArticle,
    BlogArticleTag,
    BlogComment,
    // Page Content
    PageContent,
    // AI Configuration
    UserAIConfig
};
