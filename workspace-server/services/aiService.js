/**
 * AI Service
 * Handles communication with various AI providers
 * Supports UserAIConfig for centralized per-user AI configuration
 */

const { SystemSetting, UserAIConfig } = require('../models');
const logger = require('../utils/logger');

class AIService {
    constructor() {
        this.providers = ['gemini', 'openai', 'deepseek', 'claude', 'grok', 'glm'];
    }

    // ============ USER AI CONFIG METHODS ============

    /**
     * Get user's centralized AI config
     */
    async getUserAIConfig(userId) {
        try {
            const config = await UserAIConfig.findOne({ where: { userId } });
            if (!config || !config.isActive) {
                return null;
            }
            return config;
        } catch (error) {
            logger.error('Error fetching user AI config:', error);
            return null;
        }
    }

    /**
     * Generate text using user's centralized AI config
     * @param {number} userId - User ID
     * @param {string} prompt - The user prompt
     * @param {string} promptType - 'analysis' | 'social' | 'blog' | 'custom'
     * @param {object} options - Additional options
     */
    async generateWithUserConfig(userId, prompt, promptType = 'custom', options = {}) {
        const config = await this.getUserAIConfig(userId);
        if (!config) {
            throw new Error('AI configuration not found. Please configure your AI settings first.');
        }

        const apiKey = config.getApiKey();
        if (!apiKey) {
            throw new Error('API key not configured. Please add your API key in AI Settings.');
        }

        // Get system prompt based on type
        let systemPrompt = '';
        switch (promptType) {
            case 'analysis':
                systemPrompt = config.promptAnalysis || '';
                break;
            case 'social':
                systemPrompt = config.promptSocialMedia || '';
                break;
            case 'blog':
                systemPrompt = config.promptBlog || '';
                break;
            case 'custom':
            default:
                systemPrompt = options.systemPrompt || '';
        }

        const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
        const maxTokens = options.maxTokens || 2000;
        const temperature = options.temperature || 0.7;

        // Route to appropriate provider with model from config
        switch (config.provider) {
            case 'openai':
                return this.generateWithOpenAI(apiKey, fullPrompt, { maxTokens, temperature, model: config.model });
            case 'gemini':
                return this.generateWithGemini(apiKey, fullPrompt, { maxTokens, temperature, model: config.model });
            case 'deepseek':
                return this.generateWithDeepSeek(apiKey, fullPrompt, { maxTokens, temperature, model: config.model });
            case 'claude':
                return this.generateWithClaude(apiKey, fullPrompt, { maxTokens, temperature, model: config.model });
            case 'grok':
                return this.generateWithGrok(apiKey, fullPrompt, { maxTokens, temperature, model: config.model });
            case 'glm':
                return this.generateWithGLM(apiKey, fullPrompt, { maxTokens, temperature, model: config.model });
            default:
                throw new Error(`Unknown AI provider: ${config.provider}`);
        }
    }

    /**
     * Enhance social media post using user's config
     */
    async enhanceSocialPost(userId, content, platform = 'general', options = {}) {
        const enhancePrompt = `Platform: ${platform}\n\nOriginal content:\n${content}\n\nPlease enhance this post to be more engaging and viral-worthy. Maintain the core message but improve the writing, add relevant hashtags, and make it more compelling.`;
        return this.generateWithUserConfig(userId, enhancePrompt, 'social', options);
    }

    /**
     * Enhance blog post using user's config
     */
    async enhanceBlogPost(userId, content, options = {}) {
        const enhancePrompt = `Original blog content:\n${content}\n\nPlease enhance this blog post with better structure, engaging introduction, proper headings, and SEO-friendly formatting. Maintain the core message but improve readability and engagement.`;
        return this.generateWithUserConfig(userId, enhancePrompt, 'blog', options);
    }

    /**
     * Analyze data using user's config
     */
    async analyzeDataWithUserConfig(userId, data, analysisType = 'general', options = {}) {
        const analyzePrompt = `Analysis Type: ${analysisType}\n\nData to analyze:\n${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}\n\nPlease provide a comprehensive analysis with key insights, trends, and actionable recommendations.`;
        return this.generateWithUserConfig(userId, analyzePrompt, 'analysis', options);
    }

    // ============ NEW PROVIDER METHODS ============

    // Anthropic Claude API
    async generateWithClaude(apiKey, prompt, options = {}) {
        const { maxTokens = 1000, temperature = 0.7, model } = options;

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: model || 'claude-3-haiku-20240307',
                    max_tokens: maxTokens,
                    messages: [{ role: 'user', content: prompt }]
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Claude API error');
            }

            const data = await response.json();
            return {
                provider: 'claude',
                content: data.content?.[0]?.text || '',
                usage: {
                    promptTokens: data.usage?.input_tokens || 0,
                    completionTokens: data.usage?.output_tokens || 0,
                    totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
                }
            };
        } catch (error) {
            logger.error('Claude API error:', error);
            throw error;
        }
    }

    // xAI Grok API
    async generateWithGrok(apiKey, prompt, options = {}) {
        const { maxTokens = 1000, temperature = 0.7, model } = options;

        try {
            const response = await fetch('https://api.x.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model || 'grok-beta',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: maxTokens,
                    temperature
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || error.error || 'Grok API error');
            }

            const data = await response.json();
            return {
                provider: 'grok',
                content: data.choices?.[0]?.message?.content || '',
                usage: {
                    promptTokens: data.usage?.prompt_tokens || 0,
                    completionTokens: data.usage?.completion_tokens || 0,
                    totalTokens: data.usage?.total_tokens || 0
                }
            };
        } catch (error) {
            logger.error('Grok API error:', error);
            throw error;
        }
    }

    // Zhipu GLM API
    async generateWithGLM(apiKey, prompt, options = {}) {
        const { maxTokens = 1000, temperature = 0.7, model } = options;

        try {
            const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model || 'glm-4',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: maxTokens,
                    temperature
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'GLM API error');
            }

            const data = await response.json();
            return {
                provider: 'glm',
                content: data.choices?.[0]?.message?.content || '',
                usage: {
                    promptTokens: data.usage?.prompt_tokens || 0,
                    completionTokens: data.usage?.completion_tokens || 0,
                    totalTokens: data.usage?.total_tokens || 0
                }
            };
        } catch (error) {
            logger.error('GLM API error:', error);
            throw error;
        }
    }

    // ============ LEGACY METHODS (kept for backward compatibility) ============

    // Get API key from system settings or environment
    async getApiKey(provider) {
        const keyNames = {
            gemini: 'GEMINI_API_KEY',
            openai: 'OPENAI_API_KEY',
            deepseek: 'DEEPSEEK_API_KEY'
        };

        // First check environment variable
        if (process.env[keyNames[provider]]) {
            return process.env[keyNames[provider]];
        }

        // Then check database settings
        const setting = await SystemSetting.findOne({
            where: { key: keyNames[provider] }
        });

        return setting?.value || null;
    }

    // Get user's custom API key if BYOK enabled
    async getUserApiKey(userId, provider) {
        const { UserSetting } = require('../models');

        const keyNames = {
            gemini: 'user_gemini_api_key',
            openai: 'user_openai_api_key',
            deepseek: 'user_deepseek_api_key'
        };

        try {
            const setting = await UserSetting.findOne({
                where: { userId, key: keyNames[provider] }
            });
            return setting?.value || null;
        } catch {
            return null;
        }
    }

    // Generate content with specified provider
    async generate(provider, prompt, options = {}) {
        const { userId, maxTokens = 1000, temperature = 0.7, model } = options;

        let apiKey = null;
        let actualProvider = provider;
        let actualModel = model;

        // PRIORITY 1: Check UserAIConfig (centralized user AI settings)
        if (userId) {
            const userConfig = await this.getUserAIConfig(userId);
            if (userConfig) {
                apiKey = userConfig.getApiKey();
                // Use user's configured provider if no specific provider was requested
                if (!provider || provider === 'gemini') {
                    actualProvider = userConfig.provider || provider;
                }
                // Use user's model if not specified
                if (!model) {
                    actualModel = userConfig.model;
                }
            }
        }

        // PRIORITY 2: Legacy UserSetting (BYOK)
        if (!apiKey && userId) {
            apiKey = await this.getUserApiKey(userId, actualProvider);
        }

        // PRIORITY 3: System settings or environment
        if (!apiKey) {
            apiKey = await this.getApiKey(actualProvider);
        }

        if (!apiKey) {
            throw new Error(`${actualProvider} API key not configured. Please add it in AI Settings (Settings > AI Configuration).`);
        }

        const genOptions = { maxTokens, temperature, model: actualModel };

        switch (actualProvider) {
            case 'gemini':
                return this.generateWithGemini(apiKey, prompt, genOptions);
            case 'openai':
                return this.generateWithOpenAI(apiKey, prompt, genOptions);
            case 'deepseek':
                return this.generateWithDeepSeek(apiKey, prompt, genOptions);
            case 'claude':
                return this.generateWithClaude(apiKey, prompt, genOptions);
            case 'grok':
                return this.generateWithGrok(apiKey, prompt, genOptions);
            case 'glm':
                return this.generateWithGLM(apiKey, prompt, genOptions);
            default:
                throw new Error(`Unknown provider: ${actualProvider}`);
        }
    }

    // Google Gemini API
    async generateWithGemini(apiKey, prompt, options = {}) {
        const { maxTokens = 1000, temperature = 0.7 } = options;

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            maxOutputTokens: maxTokens,
                            temperature: temperature
                        }
                    })
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Gemini API error');
            }

            const data = await response.json();
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

            return {
                provider: 'gemini',
                content,
                usage: {
                    promptTokens: data.usageMetadata?.promptTokenCount || 0,
                    completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
                    totalTokens: data.usageMetadata?.totalTokenCount || 0
                }
            };
        } catch (error) {
            console.error('Gemini API error:', error);
            throw error;
        }
    }

    // OpenAI API
    async generateWithOpenAI(apiKey, prompt, options = {}) {
        const { maxTokens = 1000, temperature = 0.7 } = options;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: maxTokens,
                    temperature: temperature
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'OpenAI API error');
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || '';

            return {
                provider: 'openai',
                content,
                usage: {
                    promptTokens: data.usage?.prompt_tokens || 0,
                    completionTokens: data.usage?.completion_tokens || 0,
                    totalTokens: data.usage?.total_tokens || 0
                }
            };
        } catch (error) {
            console.error('OpenAI API error:', error);
            throw error;
        }
    }

    // DeepSeek API (OpenAI compatible)
    async generateWithDeepSeek(apiKey, prompt, options = {}) {
        const { maxTokens = 1000, temperature = 0.7 } = options;

        try {
            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: maxTokens,
                    temperature: temperature
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'DeepSeek API error');
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || '';

            return {
                provider: 'deepseek',
                content,
                usage: {
                    promptTokens: data.usage?.prompt_tokens || 0,
                    completionTokens: data.usage?.completion_tokens || 0,
                    totalTokens: data.usage?.total_tokens || 0
                }
            };
        } catch (error) {
            console.error('DeepSeek API error:', error);
            throw error;
        }
    }

    // Chat completion with context (for AI Assistant)
    async chat(provider, messages, options = {}) {
        const { userId, maxTokens = 1000, temperature = 0.7, systemPrompt } = options;

        let apiKey = null;
        let actualProvider = provider;

        // PRIORITY 1: Check UserAIConfig (centralized user AI settings)
        if (userId) {
            const userConfig = await this.getUserAIConfig(userId);
            if (userConfig) {
                apiKey = userConfig.getApiKey();
                // Use user's configured provider if no specific provider was requested
                if (!provider || provider === 'gemini') {
                    actualProvider = userConfig.provider || provider;
                }
            }
        }

        // PRIORITY 2: Legacy UserSetting (BYOK)
        if (!apiKey && userId) {
            apiKey = await this.getUserApiKey(userId, actualProvider);
        }

        // PRIORITY 3: System settings or environment
        if (!apiKey) {
            apiKey = await this.getApiKey(actualProvider);
        }

        if (!apiKey) {
            throw new Error(`${actualProvider} API key not configured. Please add it in AI Settings.`);
        }

        // Build messages with system prompt
        const systemMessage = systemPrompt || this.getDefaultSystemPrompt();

        switch (actualProvider) {
            case 'gemini':
                return this.chatWithGemini(apiKey, messages, { maxTokens, temperature, systemMessage });
            case 'openai':
            case 'deepseek':
            case 'claude':
            case 'grok':
            case 'glm':
                return this.chatWithOpenAICompat(apiKey, actualProvider, messages, { maxTokens, temperature, systemMessage });
            default:
                throw new Error(`Unknown provider: ${actualProvider}`);
        }
    }

    // Default system prompt for Workspace AI Assistant
    getDefaultSystemPrompt() {
        return `Kamu adalah Workspace AI Assistant, asisten cerdas dalam aplikasi produktivitas Workspace.

Kemampuanmu:
1. **Finance** - Analisis pengeluaran, saran budget, deteksi anomali
2. **Social Media** - Saran waktu posting, ide konten, optimasi hashtag
3. **Work** - Manajemen proyek, reminder deadline, tracking task
4. **Goals** - Progress tracking, saran pencapaian target

Panduan:
- Jawab dalam bahasa Indonesia yang ramah dan profesional
- Berikan saran yang praktis dan actionable
- Gunakan emoji untuk membuat respons lebih engaging 😊
- Jika ditanya tentang data spesifik, jelaskan bahwa kamu butuh context lebih lanjut
- Format respons dengan bullet points atau numbering jika perlu

Context: User menggunakan Workspace untuk mengelola pekerjaan, keuangan, dan media sosial mereka.`;
    }

    // Gemini chat (multi-turn)
    async chatWithGemini(apiKey, messages, options = {}) {
        const { maxTokens = 1000, temperature = 0.7, systemMessage } = options;

        try {
            // Convert messages to Gemini format
            const contents = [];

            // Add system instruction as first user message context
            if (systemMessage) {
                contents.push({
                    role: 'user',
                    parts: [{ text: `System: ${systemMessage}\n\nUser: ${messages[0]?.content || ''}` }]
                });

                // Add rest of messages
                for (let i = 1; i < messages.length; i++) {
                    contents.push({
                        role: messages[i].role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: messages[i].content }]
                    });
                }
            } else {
                for (const msg of messages) {
                    contents.push({
                        role: msg.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: msg.content }]
                    });
                }
            }

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents,
                        generationConfig: {
                            maxOutputTokens: maxTokens,
                            temperature
                        }
                    })
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Gemini API error');
            }

            const data = await response.json();
            return {
                provider: 'gemini',
                content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
                usage: {
                    promptTokens: data.usageMetadata?.promptTokenCount || 0,
                    completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
                    totalTokens: data.usageMetadata?.totalTokenCount || 0
                }
            };
        } catch (error) {
            console.error('Gemini chat error:', error);
            throw error;
        }
    }

    // OpenAI/DeepSeek chat (OpenAI-compatible)
    async chatWithOpenAICompat(apiKey, provider, messages, options = {}) {
        const { maxTokens = 1000, temperature = 0.7, systemMessage } = options;

        const baseUrl = provider === 'deepseek'
            ? 'https://api.deepseek.com/v1'
            : 'https://api.openai.com/v1';

        const model = provider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini';

        try {
            const apiMessages = [];

            if (systemMessage) {
                apiMessages.push({ role: 'system', content: systemMessage });
            }

            for (const msg of messages) {
                apiMessages.push({
                    role: msg.role,
                    content: msg.content
                });
            }

            const response = await fetch(`${baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model,
                    messages: apiMessages,
                    max_tokens: maxTokens,
                    temperature
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || `${provider} API error`);
            }

            const data = await response.json();
            return {
                provider,
                content: data.choices?.[0]?.message?.content || '',
                usage: {
                    promptTokens: data.usage?.prompt_tokens || 0,
                    completionTokens: data.usage?.completion_tokens || 0,
                    totalTokens: data.usage?.total_tokens || 0
                }
            };
        } catch (error) {
            console.error(`${provider} chat error:`, error);
            throw error;
        }
    }

    // Financial analysis prompt
    async analyzeFinances(userId, data, provider = 'gemini') {
        const prompt = `Analisis data keuangan berikut dan berikan insights:

Data Transaksi (Ringkasan):
- Total Pemasukan: Rp ${data.totalIncome?.toLocaleString('id-ID') || 0}
- Total Pengeluaran: Rp ${data.totalExpense?.toLocaleString('id-ID') || 0}
- Saldo: Rp ${data.balance?.toLocaleString('id-ID') || 0}

Kategori Pengeluaran Tertinggi:
${data.topCategories?.map((c, i) => `${i + 1}. ${c.category}: Rp ${c.amount?.toLocaleString('id-ID')}`).join('\n') || 'Tidak ada data'}

Tagihan yang Mendatang:
${data.upcomingBills?.map(b => `- ${b.name}: Rp ${b.amount?.toLocaleString('id-ID')} (jatuh tempo: ${b.dueDate})`).join('\n') || 'Tidak ada tagihan'}

Berikan:
1. 📊 Ringkasan kondisi keuangan
2. ⚠️ Peringatan atau anomali jika ada
3. 💡 3 saran praktis untuk menghemat pengeluaran
4. 🎯 Tips untuk mencapai financial goal

Format respons dengan emoji dan bullet points.`;

        return this.generate(provider, prompt, { userId });
    }

    // Content calendar suggestions
    async suggestPostingTime(userId, platform, contentType, provider = 'gemini') {
        const prompt = `Sebagai pakar social media marketing, berikan saran waktu posting terbaik:

Platform: ${platform}
Jenis Konten: ${contentType}
Zona Waktu: Asia/Jakarta (WIB)

Berikan:
1. ⏰ 3 waktu posting terbaik (hari dan jam spesifik)
2. 📈 Alasan mengapa waktu tersebut optimal
3. 💡 Tips tambahan untuk engagement maksimal

Format respons dengan emoji yang menarik.`;

        return this.generate(provider, prompt, { userId });
    }

    // Auto-categorize transaction
    async categorizeTransaction(description, amount, provider = 'gemini') {
        const prompt = `Kategorikan transaksi berikut ke salah satu kategori:

Deskripsi: "${description}"
Jumlah: Rp ${amount?.toLocaleString('id-ID')}

Kategori yang tersedia:
- food (Makanan & Minuman)
- transport (Transportasi)
- shopping (Belanja)
- entertainment (Hiburan)
- bills (Tagihan & Utilitas)
- health (Kesehatan)
- education (Pendidikan)
- salary (Gaji)
- investment (Investasi)
- other (Lainnya)

Jawab HANYA dengan nama kategori dalam bahasa Inggris (lowercase), tanpa penjelasan.
Contoh: food`;

        const result = await this.generate(provider, prompt, { maxTokens: 50 });
        return result.content.trim().toLowerCase();
    }
}

module.exports = new AIService();
