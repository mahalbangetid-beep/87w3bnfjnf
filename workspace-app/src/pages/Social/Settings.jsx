import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineGlobe, HiOutlineExternalLink, HiOutlineClipboard,
    HiOutlineCheck, HiOutlineChevronDown, HiOutlineChevronRight,
    HiOutlineSparkles, HiOutlineCode, HiOutlineKey, HiOutlineCog,
    HiOutlineBookOpen, HiOutlineLightBulb
} from 'react-icons/hi';
import {
    SiWordpress, SiMedium, SiGhost, SiWebflow, SiShopify, SiBlogger
} from 'react-icons/si';

const Settings = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [expandedGuide, setExpandedGuide] = useState(null);
    const [copiedCode, setCopiedCode] = useState(null);

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const platforms = [
        {
            id: 'wordpress',
            name: 'WordPress',
            icon: SiWordpress,
            color: '#21759b',
            description: 'Connect to self-hosted WordPress or WordPress.com',
            difficulty: 'Easy',
            steps: [
                {
                    title: 'Install Application Passwords Plugin',
                    content: 'Go to Plugins → Add New → Search "Application Passwords" → Install & Activate. (For WordPress 5.6+, this is built-in!)'
                },
                {
                    title: 'Generate Application Password',
                    content: 'Go to Users → Profile → Scroll to "Application Passwords" → Enter a name (e.g., "Workspace App") → Click "Add New Application Password"'
                },
                {
                    title: 'Copy Your Credentials',
                    content: 'Save the generated password (shown only once). Your API credentials are: Username: your WordPress username, Password: the generated application password'
                },
                {
                    title: 'Configure in Workspace',
                    content: 'Go to Social → Blog Settings → Add WordPress connection. Enter your site URL, username, and application password.'
                }
            ],
            apiEndpoint: 'https://your-site.com/wp-json/wp/v2/',
            codeExample: `// WordPress REST API Example
fetch('https://your-site.com/wp-json/wp/v2/posts', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa('username:app_password')
    },
    body: JSON.stringify({
        title: 'My Post Title',
        content: 'Post content here...',
        status: 'publish'
    })
});`
        },
        {
            id: 'medium',
            name: 'Medium',
            icon: SiMedium,
            color: '#000000',
            description: 'Publish directly to your Medium publication',
            difficulty: 'Easy',
            steps: [
                {
                    title: 'Get Integration Token',
                    content: 'Go to Medium.com → Settings → Security and apps → Integration tokens → Generate new token'
                },
                {
                    title: 'Copy Your Token',
                    content: 'Copy the generated token. Keep it secure - you won\'t be able to see it again!'
                },
                {
                    title: 'Find Your User ID',
                    content: 'Use the token to call GET https://api.medium.com/v1/me - this returns your userId'
                },
                {
                    title: 'Configure in Workspace',
                    content: 'Go to Social → Blog Settings → Add Medium connection. Enter your integration token.'
                }
            ],
            apiEndpoint: 'https://api.medium.com/v1/',
            codeExample: `// Medium API Example
fetch('https://api.medium.com/v1/users/{userId}/posts', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_INTEGRATION_TOKEN'
    },
    body: JSON.stringify({
        title: 'My Post Title',
        contentFormat: 'html',
        content: '<p>Post content here...</p>',
        publishStatus: 'public'
    })
});`
        },
        {
            id: 'ghost',
            name: 'Ghost CMS',
            icon: SiGhost,
            color: '#15171a',
            description: 'Connect to your Ghost publication',
            difficulty: 'Medium',
            steps: [
                {
                    title: 'Create Custom Integration',
                    content: 'Go to Ghost Admin → Settings → Integrations → Add Custom Integration → Name it "Workspace"'
                },
                {
                    title: 'Get API Keys',
                    content: 'Copy the Content API Key and Admin API Key. The Admin API Key is needed for publishing.'
                },
                {
                    title: 'Note Your API URL',
                    content: 'Your API URL is your Ghost site URL (e.g., https://your-blog.ghost.io)'
                },
                {
                    title: 'Configure in Workspace',
                    content: 'Go to Social → Blog Settings → Add Ghost connection. Enter your site URL and Admin API key.'
                }
            ],
            apiEndpoint: 'https://your-blog.ghost.io/ghost/api/admin/',
            codeExample: `// Ghost Admin API Example
const jwt = require('jsonwebtoken');

// Create JWT token
const [id, secret] = ADMIN_API_KEY.split(':');
const token = jwt.sign({}, Buffer.from(secret, 'hex'), {
    kid: id,
    algorithm: 'HS256',
    expiresIn: '5m',
    audience: '/admin/'
});

fetch('https://your-blog.ghost.io/ghost/api/admin/posts/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Ghost ' + token
    },
    body: JSON.stringify({
        posts: [{
            title: 'My Post Title',
            html: '<p>Post content...</p>',
            status: 'published'
        }]
    })
});`
        },
        {
            id: 'webflow',
            name: 'Webflow CMS',
            icon: SiWebflow,
            color: '#4353ff',
            description: 'Manage Webflow CMS collections',
            difficulty: 'Medium',
            steps: [
                {
                    title: 'Generate API Token',
                    content: 'Go to Webflow Dashboard → Account Settings → Workspaces → Select Workspace → Apps & Integrations → Generate API token'
                },
                {
                    title: 'Find Collection ID',
                    content: 'Open your Webflow project → CMS Collections → Click on your Blog collection → Copy the Collection ID from the URL'
                },
                {
                    title: 'Get Site ID',
                    content: 'Go to Project Settings → General → Copy the Site ID'
                },
                {
                    title: 'Configure in Workspace',
                    content: 'Go to Social → Blog Settings → Add Webflow connection. Enter your API token, Site ID, and Collection ID.'
                }
            ],
            apiEndpoint: 'https://api.webflow.com/v2/',
            codeExample: `// Webflow CMS API Example
fetch('https://api.webflow.com/v2/collections/{collection_id}/items', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_TOKEN'
    },
    body: JSON.stringify({
        fieldData: {
            name: 'My Post Title',
            slug: 'my-post-title',
            'post-body': '<p>Post content...</p>',
            '_archived': false,
            '_draft': false
        }
    })
});`
        },
        {
            id: 'shopify',
            name: 'Shopify Blog',
            icon: SiShopify,
            color: '#96bf48',
            description: 'Publish to your Shopify store blog',
            difficulty: 'Medium',
            steps: [
                {
                    title: 'Create Private App',
                    content: 'Go to Shopify Admin → Apps → Develop apps → Create an app → Configure Admin API scopes (enable write_content)'
                },
                {
                    title: 'Get API Credentials',
                    content: 'After creating the app, go to API credentials tab → Copy the Admin API access token'
                },
                {
                    title: 'Find Blog ID',
                    content: 'Go to Online Store → Blog posts → Click on your blog → Copy the blog ID from the URL'
                },
                {
                    title: 'Configure in Workspace',
                    content: 'Go to Social → Blog Settings → Add Shopify connection. Enter your store URL, access token, and blog ID.'
                }
            ],
            apiEndpoint: 'https://{store}.myshopify.com/admin/api/2024-01/',
            codeExample: `// Shopify Blog API Example
fetch('https://{store}.myshopify.com/admin/api/2024-01/blogs/{blog_id}/articles.json', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': 'YOUR_ACCESS_TOKEN'
    },
    body: JSON.stringify({
        article: {
            title: 'My Post Title',
            body_html: '<p>Post content...</p>',
            published: true
        }
    })
});`
        },
        {
            id: 'blogger',
            name: 'Google Blogger',
            icon: SiBlogger,
            color: '#f57d00',
            description: 'Publish to your Blogger/Blogspot blogs',
            difficulty: 'Medium',
            steps: [
                {
                    title: 'Create Google Cloud Project',
                    content: 'Go to Google Cloud Console → Create a new project → Enable the Blogger API from the API Library'
                },
                {
                    title: 'Create OAuth Credentials',
                    content: 'Go to APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID → Configure consent screen first if needed'
                },
                {
                    title: 'Get Access Token',
                    content: 'Use OAuth 2.0 flow to get an access token. You can use Google\'s OAuth Playground (https://developers.google.com/oauthplayground) for testing'
                },
                {
                    title: 'Find Your Blog ID',
                    content: 'Go to Blogger Dashboard → Settings → Your blog ID is in the URL (e.g., blogger.com/blog/posts/1234567890)'
                },
                {
                    title: 'Configure in Workspace',
                    content: 'Go to Social → Blog Settings → Add Blogger connection. Enter your Blog URL, Blog ID, and OAuth Access Token.'
                }
            ],
            apiEndpoint: 'https://www.googleapis.com/blogger/v3/',
            codeExample: `// Google Blogger API Example
// First, get access token via OAuth 2.0

fetch('https://www.googleapis.com/blogger/v3/blogs/{blogId}/posts', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
    },
    body: JSON.stringify({
        kind: 'blogger#post',
        title: 'My Post Title',
        content: '<p>Post content here...</p>',
        labels: ['tag1', 'tag2']
    })
});

// To publish as draft, add isDraft: true to query params
// fetch('.../posts?isDraft=true', {...})`
        }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div>
                <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                    <span className="gradient-text">{t('social.settings.title', 'Social Settings')}</span>
                </h1>
                <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>
                    {t('social.settings.connectSubtitle', 'Connect your blog platforms and learn how to integrate with popular CMS')}
                </p>
            </div>

            {/* Quick Actions */}
            <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/settings/ai')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '16px 24px',
                            borderRadius: '12px',
                            border: '1px solid rgba(139,92,246,0.3)',
                            backgroundColor: 'rgba(139,92,246,0.1)',
                            color: 'white',
                            cursor: 'pointer',
                            flex: 1,
                            minWidth: '200px'
                        }}
                    >
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(139,92,246,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <HiOutlineSparkles style={{ width: '20px', height: '20px', color: '#a78bfa' }} />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
                                AI Configuration
                            </h4>
                            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                                Set up AI providers for content generation
                            </p>
                        </div>
                        <HiOutlineChevronRight style={{ width: '18px', height: '18px', color: '#9ca3af', marginLeft: 'auto' }} />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/social/blog-settings')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '16px 24px',
                            borderRadius: '12px',
                            border: '1px solid rgba(6,182,212,0.3)',
                            backgroundColor: 'rgba(6,182,212,0.1)',
                            color: 'white',
                            cursor: 'pointer',
                            flex: 1,
                            minWidth: '200px'
                        }}
                    >
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(6,182,212,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <HiOutlineCog style={{ width: '20px', height: '20px', color: '#22d3ee' }} />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
                                Blog Settings
                            </h4>
                            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                                Manage connected blog platforms
                            </p>
                        </div>
                        <HiOutlineChevronRight style={{ width: '18px', height: '18px', color: '#9ca3af', marginLeft: 'auto' }} />
                    </motion.button>
                </div>
            </div>

            {/* Integration Guides */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <HiOutlineBookOpen style={{ width: '24px', height: '24px', color: '#a78bfa' }} />
                    <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white', margin: 0 }}>
                        Integration Guides
                    </h2>
                </div>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
                    Step-by-step guides to connect your blog platforms with Workspace
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {platforms.map((platform) => (
                        <motion.div
                            key={platform.id}
                            className="glass-card"
                            style={{ overflow: 'hidden' }}
                        >
                            {/* Platform Header */}
                            <motion.button
                                onClick={() => setExpandedGuide(expandedGuide === platform.id ? null : platform.id)}
                                style={{
                                    width: '100%',
                                    padding: '20px 24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: 'white',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    backgroundColor: `${platform.color}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <platform.icon style={{ width: '24px', height: '24px', color: platform.color === '#000000' ? '#fff' : platform.color }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
                                            {platform.name}
                                        </h3>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            backgroundColor: platform.difficulty === 'Easy' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                                            color: platform.difficulty === 'Easy' ? '#10b981' : '#f59e0b'
                                        }}>
                                            {platform.difficulty}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0' }}>
                                        {platform.description}
                                    </p>
                                </div>
                                <motion.div
                                    animate={{ rotate: expandedGuide === platform.id ? 180 : 0 }}
                                    style={{ color: '#9ca3af' }}
                                >
                                    <HiOutlineChevronDown style={{ width: '20px', height: '20px' }} />
                                </motion.div>
                            </motion.button>

                            {/* Expanded Content */}
                            <AnimatePresence>
                                {expandedGuide === platform.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div style={{
                                            padding: '0 24px 24px',
                                            borderTop: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            {/* Steps */}
                                            <div style={{ marginTop: '20px' }}>
                                                <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'white', marginBottom: '16px' }}>
                                                    Setup Steps
                                                </h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    {platform.steps.map((step, idx) => (
                                                        <div
                                                            key={idx}
                                                            style={{
                                                                display: 'flex',
                                                                gap: '16px',
                                                                padding: '16px',
                                                                borderRadius: '10px',
                                                                backgroundColor: 'rgba(255,255,255,0.02)',
                                                                border: '1px solid rgba(255,255,255,0.05)'
                                                            }}
                                                        >
                                                            <div style={{
                                                                width: '28px',
                                                                height: '28px',
                                                                borderRadius: '50%',
                                                                backgroundColor: 'rgba(139,92,246,0.2)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '13px',
                                                                fontWeight: '600',
                                                                color: '#a78bfa',
                                                                flexShrink: 0
                                                            }}>
                                                                {idx + 1}
                                                            </div>
                                                            <div>
                                                                <h5 style={{ fontSize: '14px', fontWeight: '500', color: 'white', margin: '0 0 4px' }}>
                                                                    {step.title}
                                                                </h5>
                                                                <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0, lineHeight: '1.5' }}>
                                                                    {step.content}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* API Endpoint */}
                                            <div style={{ marginTop: '24px' }}>
                                                <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'white', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <HiOutlineGlobe style={{ width: '16px', height: '16px' }} />
                                                    API Endpoint
                                                </h4>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    padding: '12px 16px',
                                                    borderRadius: '8px',
                                                    backgroundColor: 'rgba(0,0,0,0.3)',
                                                    border: '1px solid rgba(255,255,255,0.05)'
                                                }}>
                                                    <code style={{ flex: 1, color: '#22d3ee', fontSize: '13px' }}>
                                                        {platform.apiEndpoint}
                                                    </code>
                                                    <button
                                                        onClick={() => copyToClipboard(platform.apiEndpoint, `${platform.id}-endpoint`)}
                                                        style={{
                                                            padding: '6px',
                                                            borderRadius: '6px',
                                                            border: 'none',
                                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                                            color: '#9ca3af',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {copiedCode === `${platform.id}-endpoint` ? (
                                                            <HiOutlineCheck style={{ width: '16px', height: '16px', color: '#10b981' }} />
                                                        ) : (
                                                            <HiOutlineClipboard style={{ width: '16px', height: '16px' }} />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Code Example */}
                                            <div style={{ marginTop: '24px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                                        <HiOutlineCode style={{ width: '16px', height: '16px' }} />
                                                        Code Example
                                                    </h4>
                                                    <button
                                                        onClick={() => copyToClipboard(platform.codeExample, `${platform.id}-code`)}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            padding: '6px 12px',
                                                            borderRadius: '6px',
                                                            border: 'none',
                                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                                            color: '#9ca3af',
                                                            cursor: 'pointer',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        {copiedCode === `${platform.id}-code` ? (
                                                            <>
                                                                <HiOutlineCheck style={{ width: '14px', height: '14px', color: '#10b981' }} />
                                                                Copied!
                                                            </>
                                                        ) : (
                                                            <>
                                                                <HiOutlineClipboard style={{ width: '14px', height: '14px' }} />
                                                                Copy
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                                <pre style={{
                                                    padding: '16px',
                                                    borderRadius: '10px',
                                                    backgroundColor: 'rgba(0,0,0,0.4)',
                                                    border: '1px solid rgba(255,255,255,0.05)',
                                                    overflow: 'auto',
                                                    fontSize: '12px',
                                                    lineHeight: '1.6',
                                                    color: '#e5e7eb',
                                                    margin: 0
                                                }}>
                                                    <code>{platform.codeExample}</code>
                                                </pre>
                                            </div>

                                            {/* External Link */}
                                            <a
                                                href={`https://developers.${platform.id === 'wordpress' ? 'developer.wordpress.org/rest-api' : platform.id === 'medium' ? 'medium.com' : platform.id === 'ghost' ? 'ghost.org/docs/admin-api' : platform.id === 'webflow' ? 'webflow.com' : 'shopify.dev'}/`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    marginTop: '20px',
                                                    padding: '10px 16px',
                                                    borderRadius: '8px',
                                                    backgroundColor: 'rgba(139,92,246,0.1)',
                                                    border: '1px solid rgba(139,92,246,0.3)',
                                                    color: '#a78bfa',
                                                    textDecoration: 'none',
                                                    fontSize: '13px'
                                                }}
                                            >
                                                <HiOutlineExternalLink style={{ width: '16px', height: '16px' }} />
                                                View Official Documentation
                                            </a>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Tips Section */}
            <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(245,158,11,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <HiOutlineLightBulb style={{ width: '24px', height: '24px', color: '#f59e0b' }} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: '0 0 12px' }}>
                            Pro Tips
                        </h3>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#9ca3af', fontSize: '14px', lineHeight: '1.8' }}>
                            <li>Always keep your API keys secure and never share them publicly</li>
                            <li>Use environment variables for storing API keys in production</li>
                            <li>Test your connection with a draft post before publishing</li>
                            <li>Set up webhooks to receive notifications when posts are published</li>
                            <li>Configure AI in Settings → AI Configuration to auto-generate content</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
