/* =========================
   SMARTLINKX app.js
   - Role UI hiding (Staff sees only Home / Register / Billing)
   - Admin page protection (redirect if Staff opens admin URL)
   NOTE: Real security is enforced by Apps Script keys.
========================= */

/* ==== CONFIG ==== */
const ADMIN_KEY = "SMARTLINKX_ISP_04082025";
const STAFF_KEY = "SMARTLINKX_STAFF_2026";

/* ==== OPTIONAL: If you already define API_URL elsewhere, keep it there.
   If not, set it here:
*/
// const API_URL = "https://script.google.com/macros/s/XXXXX/exec";

/* =========================
   LOGIN / KEY STORAGE
========================= */
function getSavedKey_() {
  return (localStorage.getItem("SLX_KEY") || "").trim();
}

function setSavedKey_(k) {
  localStorage.setItem("SLX_KEY", (k || "").trim());
}

function getRoleFromKey_(key) {
  if (key === ADMIN_KEY) return "ADMIN";
  if (key === STAFF_KEY) return "STAFF";
  return "";
}

// Call this on pages you want to force login
function requireRole(allowedRoles) {
  let key = getSavedKey_();
  if (!key) {
    const k = prompt("Enter Access Key:");
    if (!k) {
      location.href = "index.html";
      return false;
    }
    setSavedKey_(k);
    key = getSavedKey_();
  }

  const role = getRoleFromKey_(key);
  if (!role || (Array.isArray(allowedRoles) && !allowedRoles.includes(role))) {
    alert("Access denied.");
    location.href = "index.html";
    return false;
  }

  return true;
}

/* =========================
   NAV: HIDE ADMIN LINKS (UI)
   Works even if IDs are missing (uses href)
========================= */
function applyNavRoles() {
  const key = getSavedKey_();
  const isAdmin = (key === ADMIN_KEY);

  // If no key yet, don't reveal admin links
  if (!key) {
    // hide admin links by default until login
    hideAdminLinks_(true);
    return;
  }

  hideAdminLinks_(!isAdmin);
}

function hideAdminLinks_(hide) {
  // 1) Hide by ID (if you added IDs)
  const adminOnlyIds = ["navMasterfile", "navPayments", "navExpenses", "navAccounting"];
  adminOnlyIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = hide ? "none" : "";
  });

  // 2) Hide by href (works even if IDs are missing)
  const adminHrefs = ["masterfile.html", "payments.html", "daily-expense.html", "accounting.html"];
  adminHrefs.forEach(href => {
    document.querySelectorAll(`a[href="${href}"]`).forEach(a => {
      a.style.display = hide ? "none" : "";
    });
  });
}

/* =========================
   PAGE PROTECTION (redirect staff)
========================= */
function protectAdminPages() {
  const key = getSavedKey_();
  const isAdmin = (key === ADMIN_KEY);

  const adminPages = ["masterfile.html", "payments.html", "daily-expense.html", "accounting.html"];
  const current = (location.pathname.split("/").pop() || "").toLowerCase();

  // If user is not admin, block admin pages
  if (adminPages.includes(current) && !isAdmin) {
    alert("Staff access: not allowed.");
    location.href = "index.html";
  }
}

/* =========================
   LOGOUT
========================= */
function logout() {
  localStorage.removeItem("SLX_KEY");
  localStorage.removeItem("SLX_ROLE");
  location.href = "index.html";
}

/* =========================
   BOOTSTRAP
   Run multiple times to handle:
   - duplicate nav
   - slow DOM render
========================= */
function bootRoles_() {
  applyNavRoles();
  protectAdminPages();
}

// Run ASAP after DOM load
document.addEventListener("DOMContentLoaded", bootRoles_);

// Run again shortly after (handles duplicated / late nav rendering)
setTimeout(bootRoles_, 300);
setTimeout(bootRoles_, 1200);
