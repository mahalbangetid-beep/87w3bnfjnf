# 📋 Development Plan: Mobile Experience & PWA

Fokus improvisasi User Experience (UX) untuk pengguna Mobile Web (SaaS Free Tier), tanpa membuat aplikasi Native (Android/iOS).

## 1. 📱 Mobile-First "Native Feel" (PWA)
Tujuannya adalah membuat web terasa seperti aplikasi native saat dibuka di browser HP.

### A. Quick Action Widget (FAB - Floating Action Button)
Tombol mengambang di pojok kanan bawah yang hanya muncul di layar mobile (< 768px).
*   **Trigger:** Tap tombol (+).
*   **Menu:** Muncul 3 opsi cepat dengan icon besar:
    1.  📝 **New Note** (Langsung buka modal input catatan).
    2.  💸 **Add Expense** (Langsung buka form input pengeluaran).
    3.  🐦 **Post Idea** (Langsung buka form draft sosial media).
*   **Why:** Mengurangi jumlah klik untuk aksi yang paling sering dilakukan saat mobile (on-the-go).

### B. Offline Capabilities (Service Worker)
Menggunakan Vite PWA Plugin.
*   **Strategy:** `Stale-While-Revalidate`.
*   **Cache:**
    *   Shell Aplikasi (HTML, CSS, JS).
    *   Asset Statis (Icons, Fonts).
    *   Data "Read-Only" terakhir (misal: list project, saldo terakhir) agar tidak blank saat sinyal hilang.
*   **Sync:** Queue aksi "Create/Update" di LocalStorage jika offline, dan auto-sync saat online kembali.

### C. Touch Gestures
*   **Swipe to Delete/Archive:** Di list notifikasi atau list email.
*   **Pull to Refresh:** Di halaman dashboard untuk reload data.

---

## 2. 🎨 UI/UX Refinement for SaaS

### A. Onboarding Flow (First Impression)
Karena ini gratis, barrier to entry rendah, tapi churn rate bisa tinggi jika user bingung.
*   **Interactive Tour:** Saat login pertama, highlight fitur kunci: "Ini Dashboard mu", "Klik disini untuk post sosmed".
*   **Empty States:** Perbaiki tampilan saat data masih kosong (jangan cuma blank space, tapi kasih Call to Action: "Belum ada Project? Buat yang pertama sekarang!").

### B. "Focus Mode" (Sederhana)
*   Menyembunyikan elemen distraksi saat user sedang menulis (Blog) atau fokus coding.
*   Toggle di Navbar.

---

## 3. 🛣️ Roadmap Summary
1.  **Phase 1 (Core AI):** Implementasi `flow.md` (Morning Briefing & Auto-Reply).
2.  **Phase 2 (Mobile Polish):** Implementasi PWA & FAB Widget.
3.  **Phase 3 (Stability):** Bug fixing & Performance tuning sebelum public launch.
