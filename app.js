/* ===============================
   SMARTLINKX - app.js (GLOBAL)
   - API Config
   - Role-based UI (STAFF vs ADMIN)
=============================== */

/* ===============================
   API CONFIG
=============================== */
// ✅ Your Apps Script Web App URL (NO action=... here)
const API_URL = "https://script.google.com/macros/s/AKfycbz-WpBesdbod91BgncMD68J7jZekbMB9aOwO7Yb_Mn2SoiOD-tLO-6rAiNl_suFKFKSkw/exec";

/* ===============================
   ROLE KEYS (UI ONLY)
=============================== */
const ADMIN_KEY = "SMARTLINKX_ISP_04082025";
const STAFF_KEY = "SMARTLINKX_STAFF_2026";

/* ===============================
   LOGIN + NAV CONTROL
=============================== */
function requireLogin() {
  let key = localStorage.getItem("SLX_KEY") || "";

  if (!key) {
    const entered = prompt("Enter Access Key:");
    if (!entered) {
      location.href = "index.html";
      return;
    }
    key = entered.trim();
    localStorage.setItem("SLX_KEY", key);
  }

  applyNavRoles(key);
}

function applyNavRoles(key) {
  const isAdmin = key === ADMIN_KEY;

  // ✅ Hide admin-only links for STAFF
  const adminOnlyIds = ["navMasterfile", "navPayments", "navExpenses", "navAccounting"];
  adminOnlyIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = isAdmin ? "inline-block" : "none";
  });

  // ✅ Block STAFF from opening admin pages via URL
  const adminPages = ["masterfile.html", "payments.html", "daily-expense.html", "accounting.html"];
  const current = location.pathname.split("/").pop();

  if (!isAdmin && adminPages.includes(current)) {
    alert("Access denied. Admin only.");
    location.href = "index.html";
  }
}

/* ===============================
   LOGOUT
=============================== */
function logout() {
  localStorage.removeItem("SLX_KEY");
  location.href = "index.html";
}

/* ===============================
   AUTO RUN ON EVERY PAGE
=============================== */
document.addEventListener("DOMContentLoaded", requireLogin);
