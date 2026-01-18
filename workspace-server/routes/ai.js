const express = require('express');
const router = express.Router();
const { AIPromptTemplate, SystemSetting } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const aiService = require('../services/aiService');

// Generate content with AI service (userId is required to use user's AI config)
async function generateWithProvider(userId, provider, prompt, options = {}) {
    return aiService.generate(provider, prompt, { ...options, userId });
}

// ============ AI PROMPT TEMPLATES ============

// Get all templates (user's + public defaults)
router.get('/templates', authenticateToken, async (req, res) => {
    try {
        const { category } = req.query;

        const where = {
            [require('sequelize').Op.or]: [
                { userId: req.user.id },
                { isPublic: true }
            ]
        };

        if (category) where.category = category;

        const templates = await AIPromptTemplate.findAll({
            where,
            order: [['isDefault', 'DESC'], ['usageCount', 'DESC']]
        });

        res.json(templates);
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

// Get single template
router.get('/templates/:id', authenticateToken, async (req, res) => {
    try {
        const template = await AIPromptTemplate.findOne({
            where: { id: req.params.id }
        });

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        // Check access
        if (template.userId !== req.user.id && !template.isPublic) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(template);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch template' });
    }
});

// Create template
router.post('/templates', authenticateToken, async (req, res) => {
    try {
        const { name, prompt, category, provider, variables, isDefault } = req.body;

        if (!name || !prompt) {
            return res.status(400).json({ error: 'Name and prompt are required' });
        }

        const template = await AIPromptTemplate.create({
            userId: req.user.id,
            name,
            prompt,
            category: category || 'caption',
            provider: provider || 'any',
            variables: variables || [],
            isDefault: isDefault || false
        });

        res.status(201).json(template);
    } catch (error) {
        console.error('Error creating template:', error);
        res.status(500).json({ error: 'Failed to create template' });
    }
});

// Update template
router.put('/templates/:id', authenticateToken, async (req, res) => {
    try {
        const template = await AIPromptTemplate.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        const { name, prompt, category, provider, variables, isDefault } = req.body;

        await template.update({
            name: name ?? template.name,
            prompt: prompt ?? template.prompt,
            category: category ?? template.category,
            provider: provider ?? template.provider,
            variables: variables ?? template.variables,
            isDefault: isDefault ?? template.isDefault
        });

        res.json(template);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update template' });
    }
});

// Delete template
router.delete('/templates/:id', authenticateToken, async (req, res) => {
    try {
        const template = await AIPromptTemplate.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        await template.destroy();
        res.json({ message: 'Template deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete template' });
    }
});

// ============ AI GENERATION ============

// Generate content
router.post('/generate', authenticateToken, async (req, res) => {
    try {
        const { prompt, provider = 'gemini', templateId, variables = {} } = req.body;

        if (!prompt && !templateId) {
            return res.status(400).json({ error: 'Either prompt or templateId is required' });
        }

        let finalPrompt = prompt;

        // If using template, get and process it
        if (templateId) {
            const template = await AIPromptTemplate.findByPk(templateId);
            if (!template) {
                return res.status(404).json({ error: 'Template not found' });
            }

            // Replace variables in template
            finalPrompt = template.prompt;
            for (const [key, value] of Object.entries(variables)) {
                finalPrompt = finalPrompt.replace(new RegExp(`{${key}}`, 'g'), value);
            }

            // Increment usage count
            await template.increment('usageCount');
        }

        // Generate content
        const result = await generateWithProvider(req.user.id, provider, finalPrompt);

        res.json(result);
    } catch (error) {
        console.error('Error generating content:', error);
        res.status(500).json({ error: 'Failed to generate content' });
    }
});

// Generate caption specifically
router.post('/generate/caption', authenticateToken, async (req, res) => {
    try {
        const { topic, tone = 'professional', platform, provider = 'gemini', additionalContext = '' } = req.body;

        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        const platformLimits = {
            instagram: 2200,
            facebook: 500,
            twitter: 280,
            linkedin: 700
        };

        const limit = platformLimits[platform] || 500;

        const prompt = `Write a ${tone} social media caption about: ${topic}
Platform: ${platform || 'general'}
Maximum length: ${limit} characters
${additionalContext ? `Additional context: ${additionalContext}` : ''}

Requirements:
- Be engaging and authentic
- Include a call-to-action if appropriate
- Don't include hashtags (they will be added separately)
- Keep within the character limit`;

        const result = await generateWithProvider(req.user.id, provider, prompt);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate caption' });
    }
});

// Generate hashtags
router.post('/generate/hashtags', authenticateToken, async (req, res) => {
    try {
        const { content, count = 10, provider = 'gemini' } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const prompt = `Generate ${count} relevant hashtags for this social media content:

"${content}"

Requirements:
- Return only the hashtags, one per line
- Include a mix of popular and niche hashtags
- Make them relevant to the content
- Don't include the # symbol
- Format: just the hashtag words`;

        const result = await generateWithProvider(req.user.id, provider, prompt);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate hashtags' });
    }
});

// Generate blog post
router.post('/generate/blog', authenticateToken, async (req, res) => {
    try {
        const { topic, outline, style = 'informative', wordCount = 1000, provider = 'gemini' } = req.body;

        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        const prompt = `Write a ${style} blog post about: ${topic}

${outline ? `Outline to follow:\n${outline}` : ''}

Requirements:
- Approximately ${wordCount} words
- Include an engaging introduction
- Use proper headings and subheadings (use markdown ## for headings)
- Include a conclusion with a call-to-action
- Write in a ${style} tone
- Make it SEO-friendly`;

        const result = await generateWithProvider(req.user.id, provider, prompt);
        res.json(result);
    } catch (error) {
        console.error('Blog generation error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate blog post' });
    }
});

// Improve content
router.post('/generate/improve', authenticateToken, async (req, res) => {
    try {
        const { content, improvements = [], provider = 'gemini' } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const improvementTypes = improvements.length > 0
            ? improvements.join(', ')
            : 'grammar, clarity, engagement';

        const prompt = `Improve this content. Focus on: ${improvementTypes}

Original content:
"${content}"

Return only the improved version without any explanations.`;

        const result = await generateWithProvider(req.user.id, provider, prompt);
        res.json(result);
    } catch (error) {
        console.error('Content improvement error:', error);
        res.status(500).json({ error: error.message || 'Failed to improve content' });
    }
});

// Generate SEO metadata
router.post('/generate/seo', authenticateToken, async (req, res) => {
    try {
        const { title, content, provider = 'gemini' } = req.body;

        if (!title && !content) {
            return res.status(400).json({ error: 'Title or content is required' });
        }

        const prompt = `Generate SEO metadata for this blog post:

Title: ${title || 'Not provided'}
Content preview: ${content ? content.substring(0, 500) : 'Not provided'}

Generate the following in JSON format:
{
  "metaTitle": "SEO-optimized title (max 60 characters)",
  "metaDescription": "Compelling meta description (max 160 characters)",
  "slug": "url-friendly-slug",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`;

        const result = await generateWithProvider(req.user.id, provider, prompt);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate SEO metadata' });
    }
});

// Get available providers and their status
router.get('/providers', authenticateToken, async (req, res) => {
    try {
        // Provider display names
        const PROVIDER_NAMES = {
            gemini: 'Google Gemini',
            openai: 'OpenAI GPT',
            deepseek: 'DeepSeek',
            claude: 'Anthropic Claude',
            grok: 'xAI Grok',
            glm: 'Zhipu GLM'
        };

        const providers = Object.keys(PROVIDER_NAMES);
        const status = {};
        let defaultProvider = 'gemini';
        let userConfigured = false;

        // Build basic status first
        for (const provider of providers) {
            status[provider] = {
                configured: false, // Will be updated below
                name: PROVIDER_NAMES[provider]
            };
        }

        // Try to get user's AI config
        try {
            const UserAIConfig = require('../models/UserAIConfig');
            const userConfig = await UserAIConfig.findOne({
                where: { userId: req.user.id }
            });

            if (userConfig) {
                userConfigured = true;
                if (userConfig.provider) {
                    defaultProvider = userConfig.provider;
                }
                // Mark user's provider as configured
                if (userConfig.getApiKey && userConfig.getApiKey()) {
                    status[userConfig.provider] = {
                        ...status[userConfig.provider],
                        configured: true
                    };
                }
            }
        } catch (configErr) {
            console.log('Could not fetch user AI config:', configErr.message);
        }

        // Check system API keys
        try {
            for (const provider of providers) {
                const systemApiKey = await aiService.getApiKey(provider);
                if (systemApiKey) {
                    status[provider].configured = true;
                }
            }
        } catch (apiErr) {
            console.log('Could not check system API keys:', apiErr.message);
        }

        res.json({
            providers: status,
            defaultProvider,
            userConfigured
        });
    } catch (error) {
        console.error('Providers error:', error);
        // Return fallback response instead of 500
        res.json({
            providers: {
                gemini: { name: 'Google Gemini', configured: false },
                openai: { name: 'OpenAI GPT', configured: false },
                deepseek: { name: 'DeepSeek', configured: false },
                claude: { name: 'Anthropic Claude', configured: false },
                grok: { name: 'xAI Grok', configured: false },
                glm: { name: 'Zhipu GLM', configured: false }
            },
            defaultProvider: 'gemini',
            userConfigured: false
        });
    }
});

// ============ AI CHAT (for AI Assistant) ============

// Helper function to get user's context data
async function getUserContextData(userId, module) {
    const { Project, Budget, Expense, Task, FinanceTransaction, FinanceBill } = require('../models');
    const { Op } = require('sequelize');

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    let contextData = {};

    try {
        // Always get basic work data if in work module or general
        if (!module || module === 'work' || module === 'dashboard') {
            // Get projects
            const projects = await Project.findAll({
                where: { userId },
                limit: 10,
                order: [['updatedAt', 'DESC']]
            });

            // Get budgets
            const budgets = await Budget.findAll({
                where: { userId },
                limit: 10
            });

            // Get expenses this month
            const expenses = await Expense.findAll({
                where: {
                    userId,
                    date: { [Op.gte]: startOfMonth }
                },
                limit: 20,
                order: [['date', 'DESC']]
            });

            // Get tasks
            const tasks = await Task.findAll({
                where: { userId },
                limit: 15,
                order: [['createdAt', 'DESC']]
            });

            // Calculate totals
            let totalBudget = 0;
            let totalSpent = 0;
            budgets.forEach(b => {
                totalBudget += parseFloat(b.amount || 0);
                totalSpent += parseFloat(b.spent || 0);
            });

            contextData.work = {
                projects: projects.map(p => ({
                    name: p.name,
                    client: p.client,
                    status: p.status,
                    progress: p.progress || 0,
                    value: p.value,
                    startDate: p.startDate,
                    endDate: p.endDate
                })),
                budgets: budgets.map(b => ({
                    name: b.name,
                    amount: b.amount,
                    spent: b.spent,
                    remaining: parseFloat(b.amount || 0) - parseFloat(b.spent || 0)
                })),
                expenses: expenses.map(e => ({
                    description: e.description,
                    amount: e.amount,
                    category: e.category,
                    date: e.date
                })),
                tasks: tasks.map(t => ({
                    title: t.title,
                    status: t.status,
                    priority: t.priority,
                    dueDate: t.dueDate
                })),
                summary: {
                    totalProjects: projects.length,
                    activeProjects: projects.filter(p => p.status === 'active').length,
                    totalBudget,
                    totalSpent,
                    remainingBudget: totalBudget - totalSpent,
                    pendingTasks: tasks.filter(t => t.status !== 'completed').length,
                    completedTasks: tasks.filter(t => t.status === 'completed').length
                }
            };
        }

        // Get finance data
        if (!module || module === 'finance' || module === 'dashboard') {
            const { FinanceAccount } = require('../models');

            // Get accounts with balances
            const accounts = await FinanceAccount.findAll({
                where: { userId },
                order: [['isDefault', 'DESC'], ['name', 'ASC']]
            });

            const transactions = await FinanceTransaction.findAll({
                where: {
                    userId,
                    transactionDate: { [Op.gte]: startOfMonth }
                },
                limit: 30,
                order: [['transactionDate', 'DESC']]
            });

            const upcomingBills = await FinanceBill.findAll({
                where: {
                    userId,
                    status: { [Op.in]: ['pending', 'overdue'] },
                    dueDate: {
                        [Op.gte]: new Date(),
                        [Op.lte]: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    }
                },
                limit: 10,
                order: [['dueDate', 'ASC']]
            });

            let totalIncome = 0;
            let totalExpense = 0;
            const categoryTotals = {};

            transactions.forEach(tx => {
                if (tx.type === 'income') {
                    totalIncome += parseFloat(tx.amount);
                } else if (tx.type === 'expense') {
                    totalExpense += parseFloat(tx.amount);
                    const cat = tx.description || 'Other';
                    categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(tx.amount);
                }
            });

            // Calculate total balance from accounts
            const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);

            contextData.finance = {
                accounts: accounts.map(a => ({
                    name: a.name,
                    type: a.type,
                    balance: parseFloat(a.balance || 0),
                    isDefault: a.isDefault
                })),
                totalBalance,
                thisMonth: {
                    totalIncome,
                    totalExpense,
                    netFlow: totalIncome - totalExpense,
                    transactionCount: transactions.length
                },
                topExpenseCategories: Object.entries(categoryTotals)
                    .map(([category, amount]) => ({ category, amount }))
                    .sort((a, b) => b.amount - a.amount)
                    .slice(0, 5),
                upcomingBills: upcomingBills.map(b => ({
                    name: b.name,
                    amount: parseFloat(b.amount),
                    dueDate: b.dueDate,
                    category: b.category
                })),
                recentTransactions: transactions.slice(0, 10).map(t => ({
                    description: t.description,
                    amount: t.amount,
                    type: t.type,
                    category: t.category,
                    date: t.transactionDate
                }))
            };
        }

        // Get Social module data (social accounts, posts, blog)
        if (!module || module === 'social' || module === 'dashboard') {
            const { SocialAccount, SocialPost, BlogPost } = require('../models');

            // Get social accounts
            const socialAccounts = await SocialAccount.findAll({
                where: { userId },
                limit: 10
            });

            // Get recent posts
            const posts = await SocialPost.findAll({
                where: { userId },
                limit: 20,
                order: [['createdAt', 'DESC']]
            });

            // Get blog posts
            const blogPosts = await BlogPost.findAll({
                where: { userId },
                limit: 10,
                order: [['createdAt', 'DESC']]
            });

            // Calculate stats
            const postsByStatus = {};
            posts.forEach(p => {
                postsByStatus[p.status] = (postsByStatus[p.status] || 0) + 1;
            });

            const postsByPlatform = {};
            posts.forEach(p => {
                postsByPlatform[p.platform] = (postsByPlatform[p.platform] || 0) + 1;
            });

            contextData.social = {
                accounts: socialAccounts.map(a => ({
                    platform: a.platform,
                    username: a.username,
                    isConnected: a.isConnected
                })),
                recentPosts: posts.slice(0, 10).map(p => ({
                    content: p.content ? p.content.substring(0, 150) : '',
                    platform: p.platform,
                    status: p.status,
                    scheduledAt: p.scheduledAt,
                    postedAt: p.postedAt
                })),
                blogPosts: blogPosts.map(b => ({
                    title: b.title,
                    status: b.status,
                    publishedAt: b.publishedAt
                })),
                summary: {
                    totalAccounts: socialAccounts.length,
                    connectedAccounts: socialAccounts.filter(a => a.isConnected).length,
                    totalPosts: posts.length,
                    postsByStatus,
                    postsByPlatform,
                    scheduledPosts: posts.filter(p => p.status === 'scheduled').length,
                    publishedPosts: posts.filter(p => p.status === 'published').length,
                    draftPosts: posts.filter(p => p.status === 'draft').length,
                    totalBlogPosts: blogPosts.length
                }
            };
        }

        // Get Space module data (project ideas, goals, milestones)
        if (!module || module === 'space' || module === 'dashboard') {
            const { ProjectPlan, Goal, Milestone, Note } = require('../models');


            // Get project plans/ideas
            const projectPlans = await ProjectPlan.findAll({
                where: { userId },
                limit: 15,
                order: [['updatedAt', 'DESC']]
            });


            // Get goals
            const goals = await Goal.findAll({
                where: { userId },
                limit: 10,
                order: [['createdAt', 'DESC']]
            });

            // Get milestones
            const milestones = await Milestone.findAll({
                where: { userId },
                limit: 15,
                order: [['date', 'ASC']]
            });

            // Get recent notes
            const notes = await Note.findAll({
                where: { userId },
                limit: 10,
                order: [['updatedAt', 'DESC']]
            });

            // Calculate stats
            const ideaByStatus = {};
            projectPlans.forEach(p => {
                ideaByStatus[p.status] = (ideaByStatus[p.status] || 0) + 1;
            });

            const goalsByStatus = {};
            goals.forEach(g => {
                goalsByStatus[g.status || 'in_progress'] = (goalsByStatus[g.status || 'in_progress'] || 0) + 1;
            });

            contextData.space = {
                projectIdeas: projectPlans.map(p => ({
                    name: p.name,
                    description: p.description ? p.description.replace(/<[^>]*>/g, '').substring(0, 200) : '',
                    status: p.status,
                    priority: p.priority,
                    progress: p.progress || 0,
                    targetDate: p.targetDate,
                    tags: p.tags || []
                })),
                goals: goals.map(g => ({
                    title: g.title,
                    description: g.description,
                    targetValue: g.targetValue,
                    currentValue: g.currentValue,
                    progress: g.targetValue ? Math.round((g.currentValue / g.targetValue) * 100) : 0,
                    deadline: g.deadline,
                    status: g.status
                })),
                milestones: milestones.map(m => ({
                    title: m.title,
                    description: m.description,
                    date: m.date,
                    status: m.status,
                    completed: m.status === 'completed'
                })),
                recentNotes: notes.map(n => ({
                    title: n.title,
                    content: n.content ? n.content.substring(0, 150) : '',
                    updatedAt: n.updatedAt
                })),
                summary: {
                    totalIdeas: projectPlans.length,
                    ideaByStatus,
                    totalGoals: goals.length,
                    goalsByStatus,
                    upcomingMilestones: milestones.filter(m => m.status !== 'completed' && m.date && new Date(m.date) > new Date()).length,
                    completedMilestones: milestones.filter(m => m.status === 'completed').length
                }
            };
        }
    } catch (err) {
        console.error('Error fetching context data:', err);
    }

    return contextData;
}

// Chat with AI Assistant
router.post('/chat', authenticateToken, async (req, res) => {
    try {
        const { messages, provider = 'gemini', module, locale } = req.body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        // Detect language from Accept-Language header or locale param
        const acceptLanguage = req.headers['accept-language'] || '';
        const isIndonesian = locale === 'id' || acceptLanguage.toLowerCase().includes('id');

        // Get user's context data
        const contextData = await getUserContextData(req.user.id, module);

        // Date formatting based on locale
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const currentDate = new Date().toLocaleDateString(isIndonesian ? 'id-ID' : 'en-US', dateOptions);

        // Build context-aware system prompt with language preference
        const languageInstruction = isIndonesian
            ? 'RESPOND IN INDONESIAN (Bahasa Indonesia). Use casual but professional Indonesian.'
            : 'RESPOND IN ENGLISH. Use clear and professional English.';

        let systemPrompt = `You are a helpful AI assistant for a Workspace productivity app. You have access to the user's real data and should provide specific, data-driven answers.

${languageInstruction}

IMPORTANT: When the user asks about their data (projects, finances, tasks, ideas, goals, etc.), use the ACTUAL DATA provided below. Do NOT ask them to provide data - you already have it!

Current date: ${currentDate}

AVAILABLE DATA MODULES:

📁 WORK MODULE (Projects, Budgets, Tasks, Expenses):
- Analyze project progress and status
- Budget utilization and spending patterns
- Task completion rates and priorities
- Expense tracking and categories

💰 FINANCE MODULE (Transactions, Bills, Income/Expense):
- Monthly financial summary and balance
- Expense categories analysis
- Upcoming bills and payment reminders
- Income vs expense trends

💡 SPACE MODULE (Project Ideas, Goals, Milestones, Notes):
- Project ideas/plans with status (idea, planning, development, testing, launching, launched)
- Goal progress and achievement tracking
- Milestone timeline and completion
- Notes and insights

USER'S ACTUAL DATA:
${JSON.stringify(contextData, null, 2)}

GUIDELINES:
- Give specific answers based on the ACTUAL data above
- Use real numbers, names, and dates from the data
- Provide actionable insights and personalized recommendations
- Identify patterns, risks, and opportunities
- Suggest prioritization when relevant
- Format responses with bullet points, emojis, and clear structure
- If a section has no data, acknowledge it and suggest what the user could add
- Be encouraging and supportive about their progress`;

        const result = await aiService.chat(provider, messages, {
            userId: req.user.id,
            systemPrompt
        });

        res.json(result);
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: error.message || 'Failed to chat with AI' });
    }
});

// ============ AI ANALYSIS ============

// Analyze finances
router.post('/analyze/finances', authenticateToken, async (req, res) => {
    try {
        const { provider = 'gemini' } = req.body;

        // Get user's financial data
        const { FinanceTransaction, FinanceBill } = require('../models');
        const { Op } = require('sequelize');

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        // Get transactions for this month
        const transactions = await FinanceTransaction.findAll({
            where: {
                userId: req.user.id,
                date: { [Op.gte]: startOfMonth }
            }
        });

        // Calculate totals
        let totalIncome = 0;
        let totalExpense = 0;
        const categoryTotals = {};

        for (const tx of transactions) {
            if (tx.type === 'income') {
                totalIncome += parseFloat(tx.amount);
            } else {
                totalExpense += parseFloat(tx.amount);
                categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + parseFloat(tx.amount);
            }
        }

        // Sort categories by amount
        const topCategories = Object.entries(categoryTotals)
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);

        // Get upcoming bills
        const upcomingBills = await FinanceBill.findAll({
            where: {
                userId: req.user.id,
                status: 'active',
                nextDueDate: {
                    [Op.gte]: new Date(),
                    [Op.lte]: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                }
            },
            limit: 5,
            order: [['nextDueDate', 'ASC']]
        });

        const financialData = {
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense,
            topCategories,
            upcomingBills: upcomingBills.map(b => ({
                name: b.name,
                amount: b.amount,
                dueDate: b.nextDueDate
            }))
        };

        const result = await aiService.analyzeFinances(req.user.id, financialData, provider);
        res.json(result);
    } catch (error) {
        console.error('Finance analysis error:', error);
        res.status(500).json({ error: error.message || 'Failed to analyze finances' });
    }
});

// Suggest posting time
router.post('/analyze/posting-time', authenticateToken, async (req, res) => {
    try {
        const { platform, contentType, provider = 'gemini' } = req.body;

        if (!platform) {
            return res.status(400).json({ error: 'Platform is required' });
        }

        const result = await aiService.suggestPostingTime(
            req.user.id,
            platform,
            contentType || 'general',
            provider
        );

        res.json(result);
    } catch (error) {
        console.error('Posting time suggestion error:', error);
        res.status(500).json({ error: error.message || 'Failed to suggest posting time' });
    }
});

// Auto-categorize transaction
router.post('/categorize', authenticateToken, async (req, res) => {
    try {
        const { description, amount, provider = 'gemini' } = req.body;

        if (!description) {
            return res.status(400).json({ error: 'Description is required' });
        }

        const category = await aiService.categorizeTransaction(description, amount, provider);
        res.json({ category });
    } catch (error) {
        console.error('Categorization error:', error);
        res.status(500).json({ error: error.message || 'Failed to categorize transaction' });
    }
});

module.exports = router;

