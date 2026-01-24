import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    HiOutlineBell,
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlinePencil,
    HiOutlineX,
    HiOutlineClock,
    HiOutlineCalendar,
    HiOutlineCurrencyDollar,
    HiOutlineClipboardList,
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
    HiOutlinePlay,
    HiOutlinePause,
} from 'react-icons/hi';

const ALERT_TYPES = [
    { id: 'bill_reminder', name: 'Bill Reminder', icon: HiOutlineCurrencyDollar, color: '#ef4444', description: 'Get notified before bills are due' },
    { id: 'task_deadline', name: 'Task Deadline', icon: HiOutlineClipboardList, color: '#f59e0b', description: 'Reminder for upcoming task deadlines' },
    { id: 'project_progress', name: 'Project Progress', icon: HiOutlineCheckCircle, color: '#10b981', description: 'Updates when project reaches milestones' },
    { id: 'daily_summary', name: 'Daily Summary', icon: HiOutlineCalendar, color: '#8b5cf6', description: 'Daily overview of tasks and finances' },
    { id: 'weekly_report', name: 'Weekly Report', icon: HiOutlineClock, color: '#06b6d4', description: 'Weekly summary every specified day' },
    { id: 'monthly_report', name: 'Monthly Report', icon: HiOutlineBell, color: '#ec4899', description: 'Monthly financial and project report' },
];

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
        bill_reminder: `🔔 *Bill Reminder*\\n\\nHi! Your bill *{bill_name}* for *{amount}* is due in *{days_before}* days.\\n\\n📅 Due Date: {due_date}\\n💳 Category: {category}\\n\\nDon't miss it!`,
        task_deadline: `⏰ *Task Deadline*\\n\\nTask *{task_name}* is due in *{hours_before}* hours.\\n\\n📌 Project: {project_name}\\n🎯 Priority: {priority}\\n\\nYou've got this!`,
        daily_summary: `📊 *Daily Summary*\\n\\n📅 {date}\\n\\n✅ Tasks completed: {completed_tasks}\\n⏳ Tasks pending: {pending_tasks}\\n💰 Today's expenses: {today_expense}\\n📋 Bills due: {due_bills}\\n\\nStay productive!`,
        weekly_report: `📈 *Weekly Report*\\n\\n📆 Period: {week_start} - {week_end}\\n\\n📊 *Summary*\\n• Tasks completed: {completed_tasks}\\n• Project progress: {project_progress}%\\n• Total expenses: {total_expense}\\n• Bills paid: {paid_bills}\\n\\nKeep going! 💪`,
        monthly_report: `📊 *Monthly Report*\\n\\n📅 Month: {month} {year}\\n\\n💰 *Financial*\\n• Income: {total_income}\\n• Expenses: {total_expense}\\n• Balance: {balance}\\n\\n📋 *Productivity*\\n• Total tasks: {total_tasks}\\n• Completed: {completed_tasks}\\n• Active projects: {active_projects}\\n\\n✨ Great work!`,
        project_progress: `🎯 *Project Update*\\n\\nProject *{project_name}* has reached *{progress}%*!\\n\\n📊 Status: {status}\\n👥 Client: {client}\\n📅 Deadline: {deadline}\\n\\nKeep up the momentum! 🚀`,
    },
    ms: {
        bill_reminder: `🔔 *Peringatan Bil*\\n\\nHai! Bil *{bill_name}* bernilai *{amount}* akan tamat tempoh dalam *{days_before}* hari.\\n\\n📅 Tarikh Tamat: {due_date}\\n💳 Kategori: {category}\\n\\nJangan terlepas!`,
        task_deadline: `⏰ *Tarikh Akhir Tugasan*\\n\\nTugasan *{task_name}* akan tamat dalam *{hours_before}* jam.\\n\\n📌 Projek: {project_name}\\n🎯 Keutamaan: {priority}\\n\\nSemangat!`,
        daily_summary: `📊 *Ringkasan Harian*\\n\\n📅 {date}\\n\\n✅ Tugasan siap: {completed_tasks}\\n⏳ Tertangguh: {pending_tasks}\\n💰 Perbelanjaan: {today_expense}\\n📋 Bil tertunggak: {due_bills}\\n\\nTeruskan!`,
        weekly_report: `📈 *Laporan Mingguan*\\n\\n📆 Tempoh: {week_start} - {week_end}\\n\\n📊 *Ringkasan*\\n• Siap: {completed_tasks}\\n• Kemajuan: {project_progress}%\\n• Jumlah: {total_expense}\\n• Bil dibayar: {paid_bills}\\n\\nTeruskan! 💪`,
        monthly_report: `📊 *Laporan Bulanan*\\n\\n📅 Bulan: {month} {year}\\n\\n💰 *Kewangan*\\n• Pendapatan: {total_income}\\n• Perbelanjaan: {total_expense}\\n• Baki: {balance}\\n\\n📋 *Produktiviti*\\n• Jumlah: {total_tasks}\\n• Siap: {completed_tasks}\\n• Projek aktif: {active_projects}\\n\\n✨ Teruskan!`,
        project_progress: `🎯 *Kemas Kini Projek*\\n\\nProjek *{project_name}* mencapai *{progress}%*!\\n\\n📊 Status: {status}\\n👥 Pelanggan: {client}\\n📅 Tarikh Akhir: {deadline}\\n\\nTeruskan! 🚀`,
    },
    zh: {
        bill_reminder: `🔔 *账单提醒*\\n\\n账单 *{bill_name}* 金额 *{amount}* 将在 *{days_before}* 天后到期。\\n\\n📅 到期日: {due_date}\\n💳 类别: {category}\\n\\n请勿错过！`,
        task_deadline: `⏰ *任务截止*\\n\\n任务 *{task_name}* 将在 *{hours_before}* 小时后截止。\\n\\n📌 项目: {project_name}\\n🎯 优先级: {priority}\\n\\n加油！`,
        daily_summary: `📊 *每日总结*\\n\\n📅 {date}\\n\\n✅ 已完成: {completed_tasks}\\n⏳ 待处理: {pending_tasks}\\n💰 今日支出: {today_expense}\\n📋 到期账单: {due_bills}\\n\\n保持高效！`,
        weekly_report: `📈 *每周报告*\\n\\n📆 期间: {week_start} - {week_end}\\n\\n📊 *摘要*\\n• 已完成: {completed_tasks}\\n• 进度: {project_progress}%\\n• 总支出: {total_expense}\\n• 已付账单: {paid_bills}\\n\\n继续努力! 💪`,
        monthly_report: `📊 *月度报告*\\n\\n📅 月份: {month} {year}\\n\\n💰 *财务*\\n• 收入: {total_income}\\n• 支出: {total_expense}\\n• 余额: {balance}\\n\\n📋 *生产力*\\n• 总任务: {total_tasks}\\n• 已完成: {completed_tasks}\\n• 活跃项目: {active_projects}\\n\\n✨ 继续保持!`,
        project_progress: `🎯 *项目更新*\\n\\n项目 *{project_name}* 已达到 *{progress}%*！\\n\\n📊 状态: {status}\\n👥 客户: {client}\\n📅 截止日期: {deadline}\\n\\n保持势头! 🚀`,
    },
    ja: {
        bill_reminder: `🔔 *請求書リマインダー*\\n\\n請求書 *{bill_name}* (*{amount}*) は *{days_before}* 日後に期限です。\\n\\n📅 期限: {due_date}\\n💳 カテゴリ: {category}\\n\\nお忘れなく！`,
        task_deadline: `⏰ *タスク期限*\\n\\nタスク *{task_name}* は *{hours_before}* 時間後に期限。\\n\\n📌 プロジェクト: {project_name}\\n🎯 優先度: {priority}\\n\\n頑張って！`,
        daily_summary: `📊 *毎日のまとめ*\\n\\n📅 {date}\\n\\n✅ 完了: {completed_tasks}\\n⏳ 保留中: {pending_tasks}\\n💰 今日の支出: {today_expense}\\n📋 期限の請求書: {due_bills}\\n\\n生産性を維持！`,
        weekly_report: `📈 *週次レポート*\\n\\n📆 期間: {week_start} - {week_end}\\n\\n📊 *まとめ*\\n• 完了: {completed_tasks}\\n• 進捗: {project_progress}%\\n• 総支出: {total_expense}\\n• 支払済み: {paid_bills}\\n\\n頑張りましょう! 💪`,
        monthly_report: `📊 *月次レポート*\\n\\n📅 月: {month} {year}\\n\\n💰 *財務*\\n• 収入: {total_income}\\n• 支出: {total_expense}\\n• 残高: {balance}\\n\\n📋 *生産性*\\n• 総タスク: {total_tasks}\\n• 完了: {completed_tasks}\\n• アクティブ: {active_projects}\\n\\n✨ 素晴らしい!`,
        project_progress: `🎯 *プロジェクト更新*\\n\\n*{project_name}* が *{progress}%* に達成！\\n\\n📊 ステータス: {status}\\n👥 クライアント: {client}\\n📅 期限: {deadline}\\n\\n勢いを維持! 🚀`,
    },
    ko: {
        bill_reminder: `🔔 *청구서 알림*\\n\\n청구서 *{bill_name}* (*{amount}*)이(가) *{days_before}*일 후에 만기.\\n\\n📅 만기일: {due_date}\\n💳 카테고리: {category}\\n\\n놓치지 마세요!`,
        task_deadline: `⏰ *작업 마감*\\n\\n*{task_name}*이(가) *{hours_before}*시간 후에 마감.\\n\\n📌 프로젝트: {project_name}\\n🎯 우선순위: {priority}\\n\\n화이팅!`,
        daily_summary: `📊 *일일 요약*\\n\\n📅 {date}\\n\\n✅ 완료: {completed_tasks}\\n⏳ 대기 중: {pending_tasks}\\n💰 오늘 지출: {today_expense}\\n📋 만기 청구서: {due_bills}\\n\\n생산성 유지!`,
        weekly_report: `📈 *주간 보고서*\\n\\n📆 기간: {week_start} - {week_end}\\n\\n📊 *요약*\\n• 완료: {completed_tasks}\\n• 진행률: {project_progress}%\\n• 총 지출: {total_expense}\\n• 지불됨: {paid_bills}\\n\\n화이팅! 💪`,
        monthly_report: `📊 *월간 보고서*\\n\\n📅 월: {month} {year}\\n\\n💰 *재정*\\n• 수입: {total_income}\\n• 지출: {total_expense}\\n• 잔액: {balance}\\n\\n📋 *생산성*\\n• 총 작업: {total_tasks}\\n• 완료: {completed_tasks}\\n• 활성: {active_projects}\\n\\n✨ 잘했어요!`,
        project_progress: `🎯 *프로젝트 업데이트*\\n\\n*{project_name}*이(가) *{progress}%* 도달!\\n\\n📊 상태: {status}\\n👥 클라이언트: {client}\\n📅 마감일: {deadline}\\n\\n모멘텀 유지! 🚀`,
    },
    th: {
        bill_reminder: `🔔 *เตือนบิล*\\n\\nบิล *{bill_name}* จำนวน *{amount}* จะครบกำหนดใน *{days_before}* วัน\\n\\n📅 วันครบกำหนด: {due_date}\\n💳 หมวดหมู่: {category}\\n\\nอย่าพลาด!`,
        task_deadline: `⏰ *กำหนดส่งงาน*\\n\\n*{task_name}* จะครบกำหนดใน *{hours_before}* ชั่วโมง\\n\\n📌 โปรเจกต์: {project_name}\\n🎯 ความสำคัญ: {priority}\\n\\nสู้ๆ!`,
        daily_summary: `📊 *สรุปประจำวัน*\\n\\n📅 {date}\\n\\n✅ งานเสร็จ: {completed_tasks}\\n⏳ งานค้าง: {pending_tasks}\\n💰 รายจ่าย: {today_expense}\\n📋 บิลครบกำหนด: {due_bills}\\n\\nทำงานต่อไป!`,
        weekly_report: `📈 *รายงานประจำสัปดาห์*\\n\\n📆 ช่วงเวลา: {week_start} - {week_end}\\n\\n📊 *สรุป*\\n• งานเสร็จ: {completed_tasks}\\n• ความคืบหน้า: {project_progress}%\\n• รายจ่ายรวม: {total_expense}\\n• บิลชำระแล้ว: {paid_bills}\\n\\nสู้ต่อไป! 💪`,
        monthly_report: `📊 *รายงานประจำเดือน*\\n\\n📅 เดือน: {month} {year}\\n\\n💰 *การเงิน*\\n• รายได้: {total_income}\\n• รายจ่าย: {total_expense}\\n• ยอดคงเหลือ: {balance}\\n\\n📋 *ประสิทธิภาพ*\\n• งานทั้งหมด: {total_tasks}\\n• เสร็จ: {completed_tasks}\\n• โปรเจกต์: {active_projects}\\n\\n✨ ยอดเยี่ยม!`,
        project_progress: `🎯 *อัปเดตโปรเจกต์*\\n\\n*{project_name}* ถึง *{progress}%* แล้ว!\\n\\n📊 สถานะ: {status}\\n👥 ลูกค้า: {client}\\n📅 กำหนดส่ง: {deadline}\\n\\nรักษาโมเมนตัม! 🚀`,
    },
    vi: {
        bill_reminder: `🔔 *Nhắc nhở hóa đơn*\\n\\nHóa đơn *{bill_name}* trị giá *{amount}* sẽ đến hạn trong *{days_before}* ngày.\\n\\n📅 Ngày đến hạn: {due_date}\\n💳 Danh mục: {category}\\n\\nĐừng bỏ lỡ!`,
        task_deadline: `⏰ *Hạn chót công việc*\\n\\n*{task_name}* sẽ đến hạn trong *{hours_before}* giờ.\\n\\n📌 Dự án: {project_name}\\n🎯 Ưu tiên: {priority}\\n\\nCố lên!`,
        daily_summary: `📊 *Tóm tắt hàng ngày*\\n\\n📅 {date}\\n\\n✅ Hoàn thành: {completed_tasks}\\n⏳ Đang chờ: {pending_tasks}\\n💰 Chi tiêu: {today_expense}\\n📋 Hóa đơn đến hạn: {due_bills}\\n\\nLàm việc hiệu quả!`,
        weekly_report: `📈 *Báo cáo hàng tuần*\\n\\n📆 Kỳ: {week_start} - {week_end}\\n\\n📊 *Tóm tắt*\\n• Hoàn thành: {completed_tasks}\\n• Tiến độ: {project_progress}%\\n• Tổng chi tiêu: {total_expense}\\n• Đã thanh toán: {paid_bills}\\n\\nCố gắng lên! 💪`,
        monthly_report: `📊 *Báo cáo hàng tháng*\\n\\n📅 Tháng: {month} {year}\\n\\n💰 *Tài chính*\\n• Thu nhập: {total_income}\\n• Chi tiêu: {total_expense}\\n• Số dư: {balance}\\n\\n📋 *Năng suất*\\n• Tổng: {total_tasks}\\n• Hoàn thành: {completed_tasks}\\n• Dự án: {active_projects}\\n\\n✨ Tuyệt vời!`,
        project_progress: `🎯 *Cập nhật dự án*\\n\\n*{project_name}* đã đạt *{progress}%*!\\n\\n📊 Trạng thái: {status}\\n👥 Khách hàng: {client}\\n📅 Hạn chót: {deadline}\\n\\nGiữ vững nhịp độ! 🚀`,
    },
};

// Get templates based on user's selected language
const getTemplates = () => {
    try {
        const config = JSON.parse(localStorage.getItem('workspace_whatsapp_config') || '{}');
        return TEMPLATES[config.messageLanguage] || TEMPLATES.id;
    } catch {
        return TEMPLATES.id;
    }
};

const WhatsAppAlerts = () => {
    const { t } = useTranslation();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAlert, setEditingAlert] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        type: 'bill_reminder',
        enabled: true,
        triggerValue: 3, // days before, hours before, percentage, etc.
        time: '08:00',
        dayOfWeek: 1, // 0=Sunday, 1=Monday
        dayOfMonth: 1,
        phone: '',
        messageTemplate: '',
    });

    useEffect(() => {
        loadAlerts();
    }, []);

    const loadAlerts = () => {
        setLoading(true);
        try {
            const saved = localStorage.getItem('workspace_whatsapp_alerts');
            if (saved) {
                setAlerts(JSON.parse(saved));
            }
        } catch (err) {
            console.error('Error loading alerts:', err);
        } finally {
            setLoading(false);
        }
    };

    const saveAlerts = (newAlerts) => {
        localStorage.setItem('workspace_whatsapp_alerts', JSON.stringify(newAlerts));

        // Update stats
        const stats = JSON.parse(localStorage.getItem('workspace_whatsapp_stats') || '{"totalSent":0,"successRate":100,"pendingAlerts":0,"activeAlerts":0}');
        stats.activeAlerts = newAlerts.filter(a => a.enabled).length;
        localStorage.setItem('workspace_whatsapp_stats', JSON.stringify(stats));
    };

    const handleOpenModal = (alert = null) => {
        if (alert) {
            setEditingAlert(alert);
            setFormData({
                type: alert.type,
                enabled: alert.enabled,
                triggerValue: alert.triggerValue,
                time: alert.time || '08:00',
                dayOfWeek: alert.dayOfWeek || 1,
                dayOfMonth: alert.dayOfMonth || 1,
                phone: alert.phone || '',
                messageTemplate: alert.messageTemplate || getTemplates()[alert.type] || '',
            });
        } else {
            setEditingAlert(null);
            setFormData({
                type: 'bill_reminder',
                enabled: true,
                triggerValue: 3,
                time: '08:00',
                dayOfWeek: 1,
                dayOfMonth: 1,
                phone: '',
                messageTemplate: getTemplates()['bill_reminder'],
            });
        }
        setShowModal(true);
    };

    const handleSave = () => {
        const config = JSON.parse(localStorage.getItem('workspace_whatsapp_config') || '{}');
        const phone = formData.phone || config.defaultPhone;

        if (!phone) {
            setError('Please set a phone number');
            return;
        }

        const alertData = {
            id: editingAlert?.id || Date.now().toString(),
            ...formData,
            phone,
            createdAt: editingAlert?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        let newAlerts;
        if (editingAlert) {
            newAlerts = alerts.map(a => a.id === editingAlert.id ? alertData : a);
        } else {
            newAlerts = [...alerts, alertData];
        }

        setAlerts(newAlerts);
        saveAlerts(newAlerts);
        setShowModal(false);
        setSuccess(editingAlert ? 'Alert updated!' : 'Alert created!');
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleDelete = (id) => {
        if (!confirm('Delete this alert?')) return;
        const newAlerts = alerts.filter(a => a.id !== id);
        setAlerts(newAlerts);
        saveAlerts(newAlerts);
    };

    const handleToggle = (id) => {
        const newAlerts = alerts.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a);
        setAlerts(newAlerts);
        saveAlerts(newAlerts);
    };

    const getAlertType = (typeId) => ALERT_TYPES.find(t => t.id === typeId) || ALERT_TYPES[0];

    const getTriggerLabel = (alert) => {
        switch (alert.type) {
            case 'bill_reminder':
                return `${alert.triggerValue} days before due date`;
            case 'task_deadline':
                return `${alert.triggerValue} hours before deadline`;
            case 'project_progress':
                return `Every ${alert.triggerValue}% progress`;
            case 'daily_summary':
                return `Every day at ${alert.time}`;
            case 'weekly_report':
                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                return `Every ${days[alert.dayOfWeek]} at ${alert.time}`;
            case 'monthly_report':
                return `Every ${alert.dayOfMonth}${['st', 'nd', 'rd'][alert.dayOfMonth - 1] || 'th'} at ${alert.time}`;
            default:
                return '';
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    border: '3px solid rgba(37,211,102,0.3)',
                    borderTopColor: '#25D366',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                }} />
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading alerts...</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
                        <span style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Custom Alerts</span>
                    </h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px', fontSize: '14px' }}>Setup automated WhatsApp notifications</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOpenModal()}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #25D366, #128C7E)',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    <HiOutlinePlus style={{ width: '18px', height: '18px' }} />
                    Add Alert
                </motion.button>
            </div>

            {/* Messages */}
            {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <span style={{ color: '#f87171', fontSize: '14px' }}>{error}</span>
                </motion.div>
            )}
            {success && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                    <span style={{ color: '#34d399', fontSize: '14px' }}>{success}</span>
                </motion.div>
            )}

            {/* Alert Types */}
            <div className="glass-card" style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '16px' }}>Available Alert Types</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    {ALERT_TYPES.map((type) => {
                        const Icon = type.icon;
                        const activeCount = alerts.filter(a => a.type === type.id && a.enabled).length;
                        return (
                            <motion.div
                                key={type.id}
                                whileHover={{ y: -2, scale: 1.01 }}
                                onClick={() => {
                                    setFormData({ ...formData, type: type.id, messageTemplate: getTemplates()[type.id] || '' });
                                    handleOpenModal();
                                }}
                                style={{
                                    padding: '16px',
                                    borderRadius: '12px',
                                    backgroundColor: `${type.color}10`,
                                    border: `1px solid ${type.color}30`,
                                    cursor: 'pointer',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${type.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Icon style={{ width: '20px', height: '20px', color: type.color }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontWeight: '600', color: 'white', fontSize: '14px', margin: 0 }}>{type.name}</h4>
                                        <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0 0 0' }}>{type.description}</p>
                                    </div>
                                    {activeCount > 0 && (
                                        <span style={{ padding: '2px 8px', borderRadius: '10px', backgroundColor: type.color, color: 'white', fontSize: '11px', fontWeight: '600' }}>
                                            {activeCount}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Active Alerts */}
            <div className="glass-card" style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '20px' }}>Your Alerts</h2>

                {alerts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <HiOutlineBell style={{ width: '48px', height: '48px', color: '#6b7280', margin: '0 auto 16px' }} />
                        <p style={{ color: '#6b7280', fontSize: '14px' }}>No alerts configured yet</p>
                        <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>Click on an alert type above to create one</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {alerts.map((alert) => {
                            const alertType = getAlertType(alert.type);
                            const Icon = alertType.icon;

                            return (
                                <motion.div
                                    key={alert.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        padding: '16px 20px',
                                        borderRadius: '12px',
                                        backgroundColor: 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${alert.enabled ? alertType.color + '30' : 'rgba(255,255,255,0.05)'}`,
                                        opacity: alert.enabled ? 1 : 0.6,
                                    }}
                                >
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '12px',
                                        backgroundColor: `${alertType.color}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <Icon style={{ width: '22px', height: '22px', color: alertType.color }} />
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontWeight: '600', color: 'white', fontSize: '15px', margin: 0 }}>{alertType.name}</h4>
                                        <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0 0' }}>{getTriggerLabel(alert)}</p>
                                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>To: {alert.phone}</p>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            onClick={() => handleToggle(alert.id)}
                                            style={{
                                                padding: '8px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                backgroundColor: alert.enabled ? 'rgba(16,185,129,0.2)' : 'rgba(107,114,128,0.2)',
                                                color: alert.enabled ? '#10b981' : '#6b7280',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {alert.enabled ? <HiOutlinePlay style={{ width: '16px', height: '16px' }} /> : <HiOutlinePause style={{ width: '16px', height: '16px' }} />}
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            onClick={() => handleOpenModal(alert)}
                                            style={{
                                                padding: '8px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                backgroundColor: 'rgba(139,92,246,0.2)',
                                                color: '#8b5cf6',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <HiOutlinePencil style={{ width: '16px', height: '16px' }} />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            onClick={() => handleDelete(alert.id)}
                                            style={{
                                                padding: '8px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                backgroundColor: 'rgba(239,68,68,0.2)',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <HiOutlineTrash style={{ width: '16px', height: '16px' }} />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card"
                            style={{ width: '100%', maxWidth: '550px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white', margin: 0 }}>
                                    {editingAlert ? 'Edit Alert' : 'Create Alert'}
                                </h2>
                                <button onClick={() => setShowModal(false)} style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer' }}>
                                    <HiOutlineX style={{ width: '20px', height: '20px' }} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {/* Alert Type */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Alert Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value, messageTemplate: getTemplates()[e.target.value] || '' })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                    >
                                        {ALERT_TYPES.map(type => (
                                            <option key={type.id} value={type.id}>{type.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Trigger Value */}
                                {['bill_reminder', 'task_deadline', 'project_progress'].includes(formData.type) && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                            {formData.type === 'bill_reminder' ? 'Days before due date' :
                                                formData.type === 'task_deadline' ? 'Hours before deadline' :
                                                    'Notify every X% progress'}
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.triggerValue}
                                            onChange={(e) => setFormData({ ...formData, triggerValue: parseInt(e.target.value) || 0 })}
                                            min="1"
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                )}

                                {/* Time */}
                                {['daily_summary', 'weekly_report', 'monthly_report'].includes(formData.type) && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Time</label>
                                        <input
                                            type="time"
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                )}

                                {/* Day of Week */}
                                {formData.type === 'weekly_report' && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Day of Week</label>
                                        <select
                                            value={formData.dayOfWeek}
                                            onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        >
                                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, i) => (
                                                <option key={i} value={i}>{day}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Day of Month */}
                                {formData.type === 'monthly_report' && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Day of Month</label>
                                        <input
                                            type="number"
                                            value={formData.dayOfMonth}
                                            onChange={(e) => setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) || 1 })}
                                            min="1"
                                            max="28"
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                        />
                                    </div>
                                )}

                                {/* Phone */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Phone Number (optional - uses default if empty)</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+628123456789"
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none' }}
                                    />
                                </div>

                                {/* Message Template */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Message Template</label>
                                    <textarea
                                        value={formData.messageTemplate}
                                        onChange={(e) => setFormData({ ...formData, messageTemplate: e.target.value })}
                                        rows={6}
                                        placeholder="Enter your custom message..."
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                                    />
                                    <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>
                                        Use variables like {'{bill_name}'}, {'{amount}'}, {'{due_date}'} etc.
                                    </p>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#9ca3af', fontSize: '14px', cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSave}
                                        style={{ flex: 1, padding: '14px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #25D366, #128C7E)', color: 'white', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
                                    >
                                        {editingAlert ? 'Update' : 'Create'} Alert
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WhatsAppAlerts;
