require('dotenv').config();
const {
    sequelize,
    Role,
    User,
    BlogCategory,
    BlogTag,
    BlogArticle,
    BlogArticleTag
} = require('../models');

const blogCategories = [
    {
        name: 'Productivity',
        slug: 'productivity',
        description: 'Tips and tricks to boost your productivity',
        color: '#8b5cf6',
        icon: 'HiOutlineLightningBolt',
        order: 1
    },
    {
        name: 'Technology',
        slug: 'technology',
        description: 'Latest tech trends and updates',
        color: '#06b6d4',
        icon: 'HiOutlineChip',
        order: 2
    },
    {
        name: 'Business',
        slug: 'business',
        description: 'Business insights and strategies',
        color: '#10b981',
        icon: 'HiOutlineBriefcase',
        order: 3
    },
    {
        name: 'Design',
        slug: 'design',
        description: 'UI/UX design principles and inspiration',
        color: '#ec4899',
        icon: 'HiOutlineColorSwatch',
        order: 4
    },
    {
        name: 'Tutorial',
        slug: 'tutorial',
        description: 'Step-by-step guides and tutorials',
        color: '#f59e0b',
        icon: 'HiOutlineAcademicCap',
        order: 5
    }
];

const blogTags = [
    { name: 'React', slug: 'react', color: '#61DAFB' },
    { name: 'JavaScript', slug: 'javascript', color: '#F7DF1E' },
    { name: 'CSS', slug: 'css', color: '#1572B6' },
    { name: 'Node.js', slug: 'nodejs', color: '#339933' },
    { name: 'Tips', slug: 'tips', color: '#8b5cf6' },
    { name: 'Guide', slug: 'guide', color: '#06b6d4' },
    { name: 'Beginner', slug: 'beginner', color: '#10b981' },
    { name: 'Advanced', slug: 'advanced', color: '#ec4899' },
    { name: 'Workflow', slug: 'workflow', color: '#f59e0b' },
    { name: 'Tools', slug: 'tools', color: '#6366f1' }
];

const sampleArticles = [
    {
        title: '10 Productivity Hacks to Supercharge Your Workflow',
        slug: '10-productivity-hacks-supercharge-workflow',
        excerpt: 'Discover powerful strategies to maximize your daily output and achieve more in less time.',
        content: `
<h2>Introduction</h2>
<p>In today's fast-paced world, productivity isn't just about working harder—it's about working smarter. Whether you're a freelancer, entrepreneur, or team leader, these proven hacks will transform how you approach your daily tasks.</p>

<h2>1. The Two-Minute Rule</h2>
<p>If a task takes less than two minutes, do it immediately. This simple rule prevents small tasks from piling up and cluttering your mental space. It's a game-changer for maintaining momentum throughout your day.</p>

<h2>2. Time Blocking</h2>
<p>Dedicate specific blocks of time to specific tasks. This technique minimizes context switching and allows for deeper focus. Pro tip: color-code your calendar for visual clarity.</p>

<blockquote>
"The key is not to prioritize what's on your schedule, but to schedule your priorities." - Stephen Covey
</blockquote>

<h2>3. The Pomodoro Technique</h2>
<p>Work in focused 25-minute intervals followed by 5-minute breaks. After four pomodoros, take a longer 15-30 minute break. This rhythm maintains high energy and prevents burnout.</p>

<h2>4. Batch Similar Tasks</h2>
<p>Group similar activities together. Check emails at designated times, make all your calls in one session, and handle administrative tasks in batches. This reduces the cognitive load of constantly switching between different types of work.</p>

<h2>5. The Eisenhower Matrix</h2>
<p>Categorize tasks by urgency and importance:</p>
<ul>
<li><strong>Urgent & Important:</strong> Do immediately</li>
<li><strong>Important but Not Urgent:</strong> Schedule for later</li>
<li><strong>Urgent but Not Important:</strong> Delegate</li>
<li><strong>Neither:</strong> Eliminate</li>
</ul>

<h2>Conclusion</h2>
<p>Implementing even a few of these strategies can dramatically improve your productivity. Start with one technique, master it, then gradually add more to your toolkit. Remember, the goal isn't perfection—it's progress.</p>
        `,
        categorySlug: 'productivity',
        tags: ['Tips', 'Workflow', 'Beginner'],
        status: 'published',
        isFeatured: true
    },
    {
        title: 'Building Modern Web Apps with React and Framer Motion',
        slug: 'building-modern-web-apps-react-framer-motion',
        excerpt: 'Learn how to create stunning, animated user interfaces that captivate your users from the first interaction.',
        content: `
<h2>Why Animation Matters</h2>
<p>Animation isn't just eye candy—it's a crucial part of user experience. Thoughtful motion design guides users, provides feedback, and creates memorable interactions that set your app apart.</p>

<h2>Getting Started with Framer Motion</h2>
<p>Framer Motion is a production-ready motion library for React that makes creating complex animations surprisingly simple.</p>

<pre><code>import { motion } from 'framer-motion';

function AnimatedButton() {
  return (
    &lt;motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    &gt;
      Click me!
    &lt;/motion.button&gt;
  );
}</code></pre>

<h2>Key Animation Principles</h2>
<p>When designing animations, consider:</p>
<ul>
<li><strong>Timing:</strong> Fast enough to feel responsive, slow enough to be noticed</li>
<li><strong>Easing:</strong> Natural motion curves that mimic real-world physics</li>
<li><strong>Purpose:</strong> Every animation should serve a clear function</li>
</ul>

<h2>Advanced Techniques</h2>
<h3>Gesture Animations</h3>
<p>Framer Motion makes it easy to respond to user gestures like drag, hover, and tap.</p>

<h3>Layout Animations</h3>
<p>Animate between layout states seamlessly with the layoutId prop.</p>

<h2>Performance Considerations</h2>
<p>Always animate transform and opacity properties when possible—they're GPU-accelerated and won't cause layout recalculations.</p>
        `,
        categorySlug: 'tutorial',
        tags: ['React', 'JavaScript', 'Advanced'],
        status: 'published',
        isFeatured: false
    },
    {
        title: 'The Ultimate Guide to Remote Team Management',
        slug: 'ultimate-guide-remote-team-management',
        excerpt: 'Master the art of leading distributed teams with strategies that foster collaboration, trust, and high performance.',
        content: `
<h2>The New Reality of Work</h2>
<p>Remote work has evolved from a perk to a standard practice. As a leader, your approach to team management must evolve too.</p>

<h2>Building Trust at a Distance</h2>
<p>Trust is the foundation of effective remote teams. Without the casual office interactions, you need to be intentional about building relationships.</p>

<h3>Regular Check-ins</h3>
<p>Schedule consistent one-on-ones with each team member. These aren't just status updates—they're opportunities to connect on a human level.</p>

<h3>Transparent Communication</h3>
<p>Over-communicate decisions, changes, and expectations. What feels like too much communication is usually just right in a remote setting.</p>

<h2>Tools for Success</h2>
<ul>
<li><strong>Communication:</strong> Slack, Microsoft Teams</li>
<li><strong>Video Meetings:</strong> Zoom, Google Meet</li>
<li><strong>Project Management:</strong> Asana, Notion, Trello</li>
<li><strong>Documentation:</strong> Confluence, Notion</li>
</ul>

<h2>Creating Culture Remotely</h2>
<p>Culture doesn't happen by accident—especially remotely. Be intentional about:</p>
<ul>
<li>Virtual team-building activities</li>
<li>Celebrating wins publicly</li>
<li>Respecting work-life boundaries</li>
<li>Encouraging cameras-on meetings</li>
</ul>

<h2>Key Takeaways</h2>
<p>Successful remote management requires empathy, clear communication, and the right tools. Invest in your people, and they'll invest in your mission.</p>
        `,
        categorySlug: 'business',
        tags: ['Tips', 'Guide', 'Workflow'],
        status: 'published',
        isFeatured: true
    },
    {
        title: 'CSS Grid vs Flexbox: When to Use Each',
        slug: 'css-grid-vs-flexbox-when-to-use',
        excerpt: 'Stop the confusion! Learn the key differences between CSS Grid and Flexbox and when each is the right choice.',
        content: `
<h2>The Age-Old Question</h2>
<p>Both CSS Grid and Flexbox are powerful layout tools, but they're designed for different purposes. Understanding when to use each will level up your CSS game.</p>

<h2>Flexbox: One-Dimensional Layouts</h2>
<p>Flexbox excels at laying out items in a single direction—either a row or a column.</p>

<pre><code>.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}</code></pre>

<h3>Best For:</h3>
<ul>
<li>Navigation menus</li>
<li>Card layouts</li>
<li>Centering content</li>
<li>Equal-height columns</li>
</ul>

<h2>CSS Grid: Two-Dimensional Layouts</h2>
<p>Grid shines when you need to control both rows and columns simultaneously.</p>

<pre><code>.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}</code></pre>

<h3>Best For:</h3>
<ul>
<li>Page layouts</li>
<li>Image galleries</li>
<li>Complex dashboard layouts</li>
<li>Magazine-style designs</li>
</ul>

<h2>The Golden Rule</h2>
<blockquote>
Use Flexbox for component-level layouts and Grid for page-level layouts.
</blockquote>

<h2>They Work Better Together</h2>
<p>The real power comes from combining both. Use Grid for your overall page structure, and Flexbox for the components within each grid area.</p>
        `,
        categorySlug: 'tutorial',
        tags: ['CSS', 'Guide', 'Beginner'],
        status: 'published',
        isFeatured: false
    },
    {
        title: 'Designing for Accessibility: A Practical Approach',
        slug: 'designing-accessibility-practical-approach',
        excerpt: 'Create inclusive digital experiences that work for everyone. Accessibility is not optional—it is essential.',
        content: `
<h2>Why Accessibility Matters</h2>
<p>Over 1 billion people worldwide live with some form of disability. Making your products accessible isn't just the right thing to do—it's good business.</p>

<h2>The POUR Principles</h2>
<p>WCAG guidelines are built on four core principles:</p>

<h3>Perceivable</h3>
<p>Information must be presentable in ways users can perceive. This includes:</p>
<ul>
<li>Alt text for images</li>
<li>Captions for videos</li>
<li>Sufficient color contrast</li>
</ul>

<h3>Operable</h3>
<p>UI components must be operable by all users:</p>
<ul>
<li>Keyboard navigation</li>
<li>Sufficient time to read content</li>
<li>No seizure-inducing animations</li>
</ul>

<h3>Understandable</h3>
<p>Content must be understandable:</p>
<ul>
<li>Clear, simple language</li>
<li>Consistent navigation</li>
<li>Error prevention and recovery</li>
</ul>

<h3>Robust</h3>
<p>Content must work with current and future technologies:</p>
<ul>
<li>Semantic HTML</li>
<li>ARIA labels where needed</li>
<li>Regular testing with assistive technologies</li>
</ul>

<h2>Quick Wins</h2>
<p>Start with these high-impact, low-effort improvements:</p>
<ol>
<li>Add alt text to all images</li>
<li>Ensure 4.5:1 color contrast ratio</li>
<li>Make all interactive elements keyboard-accessible</li>
<li>Use descriptive link text</li>
<li>Add skip-to-main-content links</li>
</ol>
        `,
        categorySlug: 'design',
        tags: ['Guide', 'Beginner', 'Tips'],
        status: 'published',
        isFeatured: false
    }
];

const seedBlogData = async () => {
    try {
        console.log('🔄 Seeding blog data...\n');

        // Check if Blog role exists, if not create it
        let blogRole = await Role.findOne({ where: { name: 'blog' } });
        if (!blogRole) {
            blogRole = await Role.create({
                id: 5,
                name: 'blog',
                displayName: 'Blog Writer',
                description: 'Can create and manage blog articles',
                permissions: {
                    blog: ['create', 'read', 'update', 'delete']
                }
            });
            console.log('   ✅ Created blog role');
        }

        // Get or create admin user for author
        let adminUser = await User.findOne({ where: { email: 'admin@workspace.com' } });
        if (!adminUser) {
            console.log('   ⚠️  Admin user not found. Please run seedDatabase.js first.');
            process.exit(1);
        }

        // Seed Categories
        console.log('📁 Seeding categories...');
        for (const cat of blogCategories) {
            const [category, created] = await BlogCategory.findOrCreate({
                where: { slug: cat.slug },
                defaults: cat
            });
            console.log(`   ${created ? '✅' : '⏭️ '} ${cat.name}`);
        }

        // Seed Tags
        console.log('\n🏷️  Seeding tags...');
        for (const tag of blogTags) {
            const [blogTag, created] = await BlogTag.findOrCreate({
                where: { slug: tag.slug },
                defaults: tag
            });
            console.log(`   ${created ? '✅' : '⏭️ '} ${tag.name}`);
        }

        // Seed Articles
        console.log('\n📝 Seeding articles...');
        for (const articleData of sampleArticles) {
            const { categorySlug, tags, ...data } = articleData;

            // Find category
            const category = await BlogCategory.findOne({ where: { slug: categorySlug } });

            // Check if article exists
            const existingArticle = await BlogArticle.findOne({ where: { slug: data.slug } });
            if (existingArticle) {
                console.log(`   ⏭️  ${data.title.substring(0, 50)}...`);
                continue;
            }

            // Create article
            const article = await BlogArticle.create({
                ...data,
                authorId: adminUser.id,
                categoryId: category?.id,
                publishedAt: new Date(),
                views: Math.floor(Math.random() * 1000) + 100,
                likes: Math.floor(Math.random() * 100)
            });

            // Add tags
            for (const tagName of tags) {
                const tag = await BlogTag.findOne({ where: { name: tagName } });
                if (tag) {
                    await BlogArticleTag.create({
                        articleId: article.id,
                        tagId: tag.id
                    });
                    await tag.increment('usageCount');
                }
            }

            console.log(`   ✅ ${data.title.substring(0, 50)}...`);
        }

        console.log('\n🎉 Blog data seeded successfully!');
        console.log('\n📖 You can now visit /blog to see your articles.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedBlogData();
