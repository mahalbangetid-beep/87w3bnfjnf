/**
 * WhatsApp Service
 * Handles sending WhatsApp messages via kewhats.app API
 */

const { User } = require('../models');

const KEWHATS_API_URL = 'https://api.kewhats.app';

// Multi-language message templates
const TEMPLATES = {
    id: {
        bill_reminder: `🔔 *Pengingat Tagihan*\n\nHai! Tagihan *{bill_name}* senilai *{amount}* akan jatuh tempo dalam *{days_before}* hari.\n\n📅 Jatuh Tempo: {due_date}\n💳 Kategori: {category}\n\nJangan sampai terlewat ya!`,
        task_deadline: `⏰ *Deadline Task*\n\nTask *{task_name}* akan deadline dalam *{hours_before}* jam.\n\n📌 Project: {project_name}\n🎯 Priority: {priority}\n\nSemangat menyelesaikannya!`,
        daily_summary: `📊 *Ringkasan Harian*\n\n📅 {date}\n\n✅ Task selesai: {completed_tasks}\n⏳ Task pending: {pending_tasks}\n💰 Pengeluaran hari ini: {today_expense}\n📋 Tagihan jatuh tempo: {due_bills}\n\nSemangat produktif!`,
        weekly_report: `📈 *Laporan Mingguan*\n\n📆 Periode: {week_start} - {week_end}\n\n📊 *Ringkasan*\n• Task selesai: {completed_tasks}\n• Project progress: {project_progress}%\n• Total pengeluaran: {total_expense}\n• Tagihan dibayar: {paid_bills}\n\nTerus semangat! 💪`,
        monthly_report: `📊 *Laporan Bulanan*\n\n📅 Bulan: {month} {year}\n\n💰 *Keuangan*\n• Pemasukan: {total_income}\n• Pengeluaran: {total_expense}\n• Saldo: {balance}\n\n📋 *Produktivitas*\n• Total task: {total_tasks}\n• Selesai: {completed_tasks}\n• Project aktif: {active_projects}\n\n✨ Keep it up!`,
        project_progress: `🎯 *Update Project*\n\nProject *{project_name}* sudah mencapai *{progress}%*!\n\n📊 Status: {status}\n👥 Client: {client}\n📅 Deadline: {deadline}\n\nTerus pertahankan momentum! 🚀`,
    },
    en: {
        bill_reminder: `🔔 *Bill Reminder*\n\nHi! Your bill *{bill_name}* for *{amount}* is due in *{days_before}* days.\n\n📅 Due Date: {due_date}\n💳 Category: {category}\n\nDon't miss it!`,
        task_deadline: `⏰ *Task Deadline*\n\nTask *{task_name}* is due in *{hours_before}* hours.\n\n📌 Project: {project_name}\n🎯 Priority: {priority}\n\nYou've got this!`,
        daily_summary: `📊 *Daily Summary*\n\n📅 {date}\n\n✅ Tasks completed: {completed_tasks}\n⏳ Tasks pending: {pending_tasks}\n💰 Today's expenses: {today_expense}\n📋 Bills due: {due_bills}\n\nStay productive!`,
        weekly_report: `📈 *Weekly Report*\n\n📆 Period: {week_start} - {week_end}\n\n📊 *Summary*\n• Tasks completed: {completed_tasks}\n• Project progress: {project_progress}%\n• Total expenses: {total_expense}\n• Bills paid: {paid_bills}\n\nKeep going! 💪`,
        monthly_report: `📊 *Monthly Report*\n\n📅 Month: {month} {year}\n\n💰 *Financial*\n• Income: {total_income}\n• Expenses: {total_expense}\n• Balance: {balance}\n\n📋 *Productivity*\n• Total tasks: {total_tasks}\n• Completed: {completed_tasks}\n• Active projects: {active_projects}\n\n✨ Great work!`,
        project_progress: `🎯 *Project Update*\n\nProject *{project_name}* has reached *{progress}%*!\n\n📊 Status: {status}\n👥 Client: {client}\n📅 Deadline: {deadline}\n\nKeep up the momentum! 🚀`,
    },
};

// Default to Indonesian if language not found
const getTemplate = (type, language = 'id') => {
    return TEMPLATES[language]?.[type] || TEMPLATES.id[type] || '';
};

// Replace template variables with actual values
const processTemplate = (template, variables) => {
    let message = template;
    for (const [key, value] of Object.entries(variables)) {
        message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return message;
};

// Format currency
const formatCurrency = (amount, currency = 'IDR') => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0
    }).format(amount);
};

// Format date
const formatDate = (date, locale = 'id-ID') => {
    return new Date(date).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

const whatsappService = {
    /**
     * Get user's WhatsApp configuration
     * For now, we store config in user's settings JSON field
     */
    async getUserConfig(userId) {
        try {
            const user = await User.findByPk(userId);
            if (!user?.settings?.whatsapp) {
                return null;
            }
            return user.settings.whatsapp;
        } catch (error) {
            console.error('Error getting WhatsApp config:', error);
            return null;
        }
    },

    /**
     * Send WhatsApp message via kewhats.app API
     */
    async sendMessage(apiKey, deviceId, phone, message) {
        try {
            if (!apiKey || !deviceId || !phone || !message) {
                console.error('WhatsApp: Missing required parameters');
                return { success: false, error: 'Missing required parameters' };
            }

            const response = await fetch(`${KEWHATS_API_URL}/api/messages/send`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ deviceId, to: phone, message }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                console.log(`WhatsApp: Message sent to ${phone}`);
                return { success: true, data: data.data };
            } else {
                console.error(`WhatsApp: Failed to send - ${data.message}`);
                return { success: false, error: data.message };
            }
        } catch (error) {
            console.error('WhatsApp: Send error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Send Bill Reminder via WhatsApp
     */
    async sendBillReminder(config, bill, daysUntilDue) {
        const { apiKey, deviceId, messageLanguage = 'id' } = config;
        const phone = bill.reminderPhone || config.defaultPhone;

        if (!phone) {
            console.log('WhatsApp: No phone number for bill reminder');
            return { success: false, error: 'No phone number' };
        }

        const template = getTemplate('bill_reminder', messageLanguage);
        const message = processTemplate(template, {
            bill_name: bill.name,
            amount: formatCurrency(bill.amount),
            days_before: daysUntilDue.toString(),
            due_date: formatDate(bill.dueDate),
            category: bill.category || 'Lainnya',
        });

        return await this.sendMessage(apiKey, deviceId, phone, message);
    },

    /**
     * Send Task Deadline Reminder via WhatsApp
     */
    async sendTaskDeadline(config, task, hoursUntilDue) {
        const { apiKey, deviceId, defaultPhone, messageLanguage = 'id' } = config;

        if (!defaultPhone) {
            return { success: false, error: 'No phone number' };
        }

        const template = getTemplate('task_deadline', messageLanguage);
        const message = processTemplate(template, {
            task_name: task.title,
            hours_before: hoursUntilDue.toString(),
            project_name: task.Project?.name || 'No Project',
            priority: task.priority || 'medium',
        });

        return await this.sendMessage(apiKey, deviceId, defaultPhone, message);
    },

    /**
     * Send Daily Summary via WhatsApp
     */
    async sendDailySummary(config, summaryData) {
        const { apiKey, deviceId, defaultPhone, messageLanguage = 'id' } = config;

        if (!defaultPhone) {
            return { success: false, error: 'No phone number' };
        }

        const template = getTemplate('daily_summary', messageLanguage);
        const message = processTemplate(template, {
            date: formatDate(new Date()),
            completed_tasks: summaryData.completedTasks?.toString() || '0',
            pending_tasks: summaryData.pendingTasks?.toString() || '0',
            today_expense: formatCurrency(summaryData.todayExpense || 0),
            due_bills: summaryData.dueBills?.toString() || '0',
        });

        return await this.sendMessage(apiKey, deviceId, defaultPhone, message);
    },

    /**
     * Send Weekly Report via WhatsApp
     */
    async sendWeeklyReport(config, reportData) {
        const { apiKey, deviceId, defaultPhone, messageLanguage = 'id' } = config;

        if (!defaultPhone) {
            return { success: false, error: 'No phone number' };
        }

        const template = getTemplate('weekly_report', messageLanguage);
        const message = processTemplate(template, {
            week_start: formatDate(reportData.weekStart),
            week_end: formatDate(reportData.weekEnd),
            completed_tasks: reportData.completedTasks?.toString() || '0',
            project_progress: reportData.projectProgress?.toString() || '0',
            total_expense: formatCurrency(reportData.totalExpense || 0),
            paid_bills: reportData.paidBills?.toString() || '0',
        });

        return await this.sendMessage(apiKey, deviceId, defaultPhone, message);
    },

    /**
     * Send Project Progress Update via WhatsApp
     */
    async sendProjectProgress(config, project) {
        const { apiKey, deviceId, defaultPhone, messageLanguage = 'id' } = config;

        if (!defaultPhone) {
            return { success: false, error: 'No phone number' };
        }

        const template = getTemplate('project_progress', messageLanguage);
        const message = processTemplate(template, {
            project_name: project.name,
            progress: (project.progress || 0).toString(),
            status: project.status || 'In Progress',
            client: project.client || '-',
            deadline: project.endDate ? formatDate(project.endDate) : '-',
        });

        return await this.sendMessage(apiKey, deviceId, defaultPhone, message);
    },
};

module.exports = whatsappService;
