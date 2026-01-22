# 🤖 AI Agentic Workflows

Implementasi fitur AI yang bersifat "Proaktif" (Agent) yang bekerja di latar belakang (background jobs), bukan hanya "Reaktif" (saat user meminta).

## 1. 🌅 Morning Briefing Agent
Agent yang berjalan setiap pagi untuk memberikan ringkasan eksekutif kepada user tentang apa yang harus mereka perhatikan hari ini.

### Architecture Flow
1.  **Trigger:** `node-cron` job berjalan setiap jam (misal 07:00).
2.  **Check User Timezone:** Filter user yang jam lokalnya saat ini adalah 07:00 AM.
3.  **Data Aggregation (Collector Service):**
    *   **Work Module:** Query `Tasks` (deadline hari ini & overdue).
    *   **Finance Module:** Query `Bills` (jatuh tempo H+3) & `Transactions` (pengeluaran abnormal kemarin).
    *   **Social Module:** Query `SocialPost` (performa post kemarin: likes, comments).
4.  **AI Processing (The Brain):**
    *   **Input:** JSON data dari Collector Service.
    *   **Prompt:** "You are an executive assistant. Summarize this data into a friendly, motivating, 3-bullet point briefing. Tone: Professional yet casual."
    *   **Model:** Gemini Flash / GPT-3.5 (Low cost, fast).
5.  **Delivery:**
    *   Simpan ke tabel `Notifications` (Type: 'daily_briefing').
    *   (Opsional) Kirim Email via `nodemailer`.
6.  **UI Display:**
    *   Muncul sebagai Modal/Popup saat user login pertama kali hari itu.

### Technical Implementation Steps
- [ ] Create `services/briefingService.js`.
- [ ] Add cron job in `server.js`.
- [ ] Create `AIPromptTemplate` for "daily_briefing".
- [ ] Build Frontend Modal component `MorningBriefing.jsx`.

---

## 2. 💬 Smart Auto-Reply Agent
Agent yang memantau interaksi sosial media dan menyiapkan draft balasan cerdas.

### Architecture Flow
1.  **Trigger:** Webhook dari Social Platform (Instagram/Twitter) -> New Comment Event.
2.  **Filtering & Context:**
    *   Cek apakah komentator bukan bot/spam.
    *   Ambil konteks: Isi Postingan Asli + Isi Komentar User.
3.  **AI Generation:**
    *   **Prompt:** "Generate 3 reply options for this comment based on the post context. Options: 1. Grateful, 2. Professional, 3. Engaging question."
    *   **Model:** Gemini Pro / GPT-4 (High reasoning needed for context).
4.  **Action:**
    *   Simpan ke tabel `SocialCommentDrafts` dengan status `pending_review`.
5.  **Notification:**
    *   User melihat badge "AI Suggestions" di menu Social Dashboard.
6.  **Human Review:**
    *   User membuka dashboard -> Pilih salah satu opsi draft -> Edit (jika perlu) -> Kirim.

---

## 3. 🧠 Finance Advisor Agent (Weekly)
Agent yang menganalisa pola pengeluaran mingguan.

### Flow
1.  **Trigger:** Cron job setiap Minggu malam.
2.  **Data:** Ambil transaksi seminggu terakhir.
3.  **Analysis:** Bandingkan dengan minggu lalu. Identifikasi kategori yang boros (misal: "Food & Beverage" naik 50%).
4.  **Output:** Notifikasi "Warning/Insight".
    *   *Contoh:* "Minggu ini pengeluaran kopi kamu naik 2x lipat lho. Mau set limit untuk minggu depan?"
