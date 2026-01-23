/* =====================================================
   SMARTLINKX – GLOBAL app.js (CLEAN & FINAL)
   Roles:
   - STAFF  → Home, Register, Billing only
   - ADMIN  → Full access
===================================================== */

/* ===============================
   CONFIG
=============================== */
const API_URL = "https://script.google.com/macros/s/AKfycbz-WpBesdbod91BgncMD68J7jZekbMB9aOwO7Yb_Mn2SoiOD-tLO-6rAiNl_suFKFKSkw/exec";

const ADMIN_KEY = "SMARTLINKX_ISP_04082025";
const STAFF_KEY = "SMARTLINKX_STAFF_2026";

/* ===============================
   AUTH / ROLE
=============================== */
function getRole() {
  const key = (localStorage.getItem("SLX_KEY") || "").trim();
  if (key === ADMIN_KEY) return "ADMIN";
  if (key === STAFF_KEY) return "STAFF";
  return "";
}

function requireLogin() {
  let key = localStorage.getItem("SLX_KEY");
  if (!key) {
    const entered = prompt("Enter Access Key:");
    if (!entered) {
      location.href = "index.html";
      return;
    }
    localStorage.setItem("SLX_KEY", entered.trim());
  }
}

/* ===============================
   NAV VISIBILITY
=============================== */
function applyNavRoles() {
  const role = getRole();
  const isAdmin = role === "ADMIN";

  const adminOnlyIds = [
    "navMasterfile",
    "navPayments",
    "navExpenses",
    "navAccounting"
  ];

  adminOnlyIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = isAdmin ? "" : "none";
  });
}

/* ===============================
   PAGE PROTECTION (NO POPUPS)
=============================== */
function protectPages() {
  const role = getRole();
  const page = location.pathname.split("/").pop().toLowerCase();

  const adminPages = [
    "masterfile.html",
    "payments.html",
    "daily-expense.html",
    "accounting.html"
  ];

  if (role !== "ADMIN" && adminPages.includes(page)) {
    // silent redirect (NO alert)
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
   RUN ON EVERY PAGE
=============================== */
document.addEventListener("DOMContentLoaded", () => {
  requireLogin();
  applyNavRoles();
  protectPages();
});

/* ===============================
   UTIL HELPERS (UNCHANGED)
=============================== */
function peso(n) {
  const x = Number(n);
  return isFinite(x) ? "₱" + x.toLocaleString("en-PH") : "₱0";
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function setStatus(el, msg, type) {
  if (!el) return;
  el.style.display = "block";
  el.className = "alert " + (type || "");
  el.textContent = msg;
}
