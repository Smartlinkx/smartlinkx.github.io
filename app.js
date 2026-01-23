/* =====================================
   SMARTLINKX ACCESS CONTROL (UI ONLY)
   STAFF = Home, New Subscriber, Billing
   ADMIN = ALL ACCESS
===================================== */

const ADMIN_KEY = "SMARTLINKX_ISP_04082025";
const STAFF_KEY = "SMARTLINKX_STAFF_04082025";

/* =============================
   ROLE
============================= */
function getRole() {
  const key = (localStorage.getItem("SLX_KEY") || "").trim();
  if (key === ADMIN_KEY) return "admin";
  if (key === STAFF_KEY) return "staff";
  return "none";
}

function requireRole() {
  let key = localStorage.getItem("SLX_KEY");

  if (!key) {
    key = prompt("Enter Access Key:");
    if (!key) {
      location.href = "index.html";
      return;
    }
    localStorage.setItem("SLX_KEY", key.trim());
  }

  if (getRole() === "none") {
    alert("Invalid key");
    localStorage.removeItem("SLX_KEY");
    location.href = "index.html";
  }
}

/* =============================
   NAV VISIBILITY
============================= */
function applyNavRoles() {
  const role = getRole();
  const isAdmin = role === "admin";

  // STAFF links
  const staffIds = ["navHome", "navNewSubscribers", "navBilling"];

  // ADMIN only links
  const adminOnlyIds = [
    "navMasterfile",
    "navPayments",
    "navExpenses",
    "navAccounting"
  ];

  staffIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "";
  });

  adminOnlyIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = isAdmin ? "" : "none";
  });
}

/* =============================
   PAGE PROTECTION
============================= */
function protectAdminPages() {
  if (getRole() === "admin") return;

  const adminPages = [
    "masterfile.html",
    "payments.html",
    "daily-expense.html",
    "accounting.html"
  ];

  const page = location.pathname.split("/").pop().toLowerCase();
  if (adminPages.includes(page)) {
    alert("Staff access not allowed");
    location.href = "index.html";
  }
}

/* =============================
   LOGOUT
============================= */
function logout() {
  localStorage.removeItem("SLX_KEY");
  location.href = "index.html";
}

/* =============================
   RUN
============================= */
document.addEventListener("DOMContentLoaded", () => {
  requireRole();
  protectAdminPages();
  applyNavRoles();
});
