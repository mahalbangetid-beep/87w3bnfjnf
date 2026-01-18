/**
 * Scheduler Service
 * Handles scheduled jobs for notifications like bill reminders, deadline alerts, etc.
 */

const cron = require('node-cron');
const { Op } = require('sequelize');
const {
    User,
    FinanceBill,
    Project,
    IdeaProject,
    SocialPost,
    Goal,
    NotificationPreference
} = require('../models');
const notificationService = require('./notificationService');

// Store scheduled jobs
const scheduledJobs = new Map();

// ============================================
// Scheduler Service
// ============================================

const schedulerService = {
    /**
     * Initialize all scheduled jobs
     */
    init() {
        console.log('🕐 Initializing notification scheduler...');

        // Bill reminders - Run every day at 8:00 AM
        this.scheduleJob('billReminders', '0 8 * * *', this.checkBillReminders);

        // Project deadline reminders - Run every day at 9:00 AM
        this.scheduleJob('deadlineReminders', '0 9 * * *', this.checkDeadlineReminders);

        // Goal progress weekly summary - Run every Monday at 10:00 AM
        this.scheduleJob('goalProgress', '0 10 * * 1', this.sendGoalProgressSummary);

        // Scheduled post check - Run every 5 minutes
        this.scheduleJob('scheduledPosts', '*/5 * * * *', this.checkScheduledPosts);

        // Cleanup old notifications - Run every day at 2:00 AM
        this.scheduleJob('cleanup', '0 2 * * *', this.cleanupOldData);

        console.log('✅ Scheduler initialized with', scheduledJobs.size, 'jobs');
    },

    /**
     * Schedule a cron job
     */
    scheduleJob(name, cronExpression, handler) {
        if (scheduledJobs.has(name)) {
            scheduledJobs.get(name).stop();
        }

        const job = cron.schedule(cronExpression, async () => {
            console.log(`⏰ Running scheduled job: ${name}`);
            try {
                await handler.call(this);
            } catch (error) {
                console.error(`Error in scheduled job ${name}:`, error);
            }
        }, {
            timezone: 'Asia/Jakarta'
        });

        scheduledJobs.set(name, job);
        console.log(`  📅 Scheduled: ${name} (${cronExpression})`);
    },

    /**
     * Stop all scheduled jobs
     */
    stopAll() {
        for (const [name, job] of scheduledJobs) {
            job.stop();
            console.log(`  ⏹️ Stopped: ${name}`);
        }
        scheduledJobs.clear();
    },

    // ============================================
    // Bill Reminders
    // ============================================
    async checkBillReminders() {
        console.log('📋 Checking bill reminders...');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get all pending bills
        const bills = await FinanceBill.findAll({
            where: {
                status: 'pending',
                dueDate: {
                    [Op.gte]: today
                }
            },
            include: [{ model: User, include: [NotificationPreference] }]
        });

        let sentCount = 0;

        for (const bill of bills) {
            const user = bill.User;
            const prefs = user?.NotificationPreference;

            // Skip if bill reminders disabled
            if (prefs && !prefs.billReminders) continue;

            // Calculate days until due
            const dueDate = new Date(bill.dueDate);
            const diffTime = dueDate.getTime() - today.getTime();
            const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Check if we should remind today
            const reminderDays = prefs?.billReminderDays || [7, 3, 1];
            if (!reminderDays.includes(daysUntilDue) && daysUntilDue !== 0) continue;

            // Format currency
            const formatter = new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            });

            // Build notification
            let title, message, priority;
            if (daysUntilDue === 0) {
                title = `⚠️ Tagihan ${bill.name} Jatuh Tempo Hari Ini!`;
                message = `Tagihan ${bill.name} sebesar ${formatter.format(bill.amount)} jatuh tempo HARI INI. Segera lakukan pembayaran.`;
                priority = 'urgent';
            } else if (daysUntilDue === 1) {
                title = `⏰ Tagihan ${bill.name} Jatuh Tempo Besok`;
                message = `Tagihan ${bill.name} sebesar ${formatter.format(bill.amount)} akan jatuh tempo besok.`;
                priority = 'high';
            } else {
                title = `📅 Pengingat Tagihan: ${bill.name}`;
                message = `Tagihan ${bill.name} sebesar ${formatter.format(bill.amount)} akan jatuh tempo dalam ${daysUntilDue} hari (${dueDate.toLocaleDateString('id-ID')}).`;
                priority = 'normal';
            }

            try {
                await notificationService.send(user.id, 'bill_reminder', title, message, {
                    priority,
                    data: { billId: bill.id, daysUntilDue },
                    actionUrl: '/finance/tagihan'
                });
                sentCount++;
            } catch (error) {
                console.error('Failed to send bill reminder:', error);
            }
        }

        console.log(`  ✅ Sent ${sentCount} bill reminders`);
    },

    // ============================================
    // Project Deadline Reminders
    // ============================================
    async checkDeadlineReminders() {
        console.log('📋 Checking deadline reminders...');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check IdeaProjects (Space module)
        const ideaProjects = await IdeaProject.findAll({
            where: {
                status: { [Op.notIn]: ['completed', 'cancelled'] },
                endDate: { [Op.gte]: today }
            },
            include: [{ model: User, include: [NotificationPreference] }]
        });

        let sentCount = 0;

        for (const project of ideaProjects) {
            const user = project.User;
            const prefs = user?.NotificationPreference;

            if (prefs && !prefs.projectDeadlines) continue;

            const endDate = new Date(project.endDate);
            const diffTime = endDate.getTime() - today.getTime();
            const daysUntilDeadline = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const reminderDays = prefs?.deadlineReminderDays || [7, 2];
            if (!reminderDays.includes(daysUntilDeadline)) continue;

            let title = `⏰ Deadline Mendekati: ${project.name}`;
            let message = `Proyek "${project.name}" akan berakhir dalam ${daysUntilDeadline} hari. Progress saat ini: ${project.progress || 0}%.`;
            let priority = daysUntilDeadline <= 2 ? 'high' : 'normal';

            try {
                await notificationService.send(user.id, 'project_deadline', title, message, {
                    priority,
                    data: { projectId: project.id, daysUntilDeadline },
                    actionUrl: '/space/projects-plan'
                });
                sentCount++;
            } catch (error) {
                console.error('Failed to send deadline reminder:', error);
            }
        }

        console.log(`  ✅ Sent ${sentCount} deadline reminders`);
    },

    // ============================================
    // Goal Progress Summary
    // ============================================
    async sendGoalProgressSummary() {
        console.log('📋 Sending goal progress summaries...');

        // Get users with active goals
        const users = await User.findAll({
            include: [
                {
                    model: Goal,
                    where: { status: 'active' },
                    required: true
                },
                { model: NotificationPreference }
            ]
        });

        let sentCount = 0;

        for (const user of users) {
            const prefs = user.NotificationPreference;
            if (prefs && !prefs.goalProgress) continue;

            const goals = user.Goals;
            const totalGoals = goals.length;
            const avgProgress = Math.round(
                goals.reduce((sum, g) => sum + (g.current / g.target * 100), 0) / totalGoals
            );

            const title = `📊 Ringkasan Progress Mingguan`;
            const message = `Anda memiliki ${totalGoals} goal aktif dengan rata-rata progress ${avgProgress}%. Terus semangat!`;

            try {
                await notificationService.send(user.id, 'goal_progress', title, message, {
                    priority: 'low',
                    data: { totalGoals, avgProgress },
                    actionUrl: '/space/targeting'
                });
                sentCount++;
            } catch (error) {
                console.error('Failed to send goal summary:', error);
            }
        }

        console.log(`  ✅ Sent ${sentCount} goal progress summaries`);
    },

    // ============================================
    // Scheduled Post Check
    // ============================================
    async checkScheduledPosts() {
        const now = new Date();

        // Find posts that should have been published
        const posts = await SocialPost.findAll({
            where: {
                status: 'scheduled',
                scheduledAt: { [Op.lte]: now }
            },
            include: [{ model: User }]
        });

        for (const post of posts) {
            // In real implementation, this would publish to social media
            // For now, just update status and notify
            try {
                post.status = 'published';
                post.publishedAt = now;
                await post.save();

                await notificationService.send(post.userId, 'post_published',
                    '✅ Post Berhasil Dipublish',
                    `Post "${post.content?.substring(0, 50)}..." telah berhasil dipublish.`,
                    {
                        priority: 'low',
                        data: { postId: post.id },
                        actionUrl: '/social/sosmed-posting'
                    }
                );
            } catch (error) {
                console.error('Failed to process scheduled post:', error);

                post.status = 'failed';
                await post.save();

                await notificationService.send(post.userId, 'post_failed',
                    '❌ Gagal Mempublish Post',
                    `Post gagal dipublish. Silakan coba lagi.`,
                    {
                        priority: 'high',
                        data: { postId: post.id, error: error.message },
                        actionUrl: '/social/sosmed-posting'
                    }
                );
            }
        }

        if (posts.length > 0) {
            console.log(`  ✅ Processed ${posts.length} scheduled posts`);
        }
    },

    // ============================================
    // Cleanup Old Data
    // ============================================
    async cleanupOldData() {
        console.log('🧹 Running cleanup...');

        // Cleanup old read notifications (older than 30 days)
        const deletedNotifs = await notificationService.cleanupOldNotifications(30);
        console.log(`  ✅ Cleaned up ${deletedNotifs} old notifications`);
    },

    // ============================================
    // Manual Trigger (for testing)
    // ============================================
    async runJob(jobName) {
        const handlers = {
            billReminders: this.checkBillReminders,
            deadlineReminders: this.checkDeadlineReminders,
            goalProgress: this.sendGoalProgressSummary,
            scheduledPosts: this.checkScheduledPosts,
            cleanup: this.cleanupOldData
        };

        if (handlers[jobName]) {
            console.log(`⚡ Manually triggering: ${jobName}`);
            await handlers[jobName].call(this);
            return true;
        }
        return false;
    }
};

module.exports = schedulerService;
