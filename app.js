/* ===============================
   SMARTLINKX app.js (FULL REVISION)
   - Access key prompt (ADMIN / STAFF)
   - STAFF: only Home / New Subscriber / Billing
   - ADMIN: full access
   - Admin pages are blocked for STAFF (redirect to index)
   - Admin links are REMOVED (not just hidden) for STAFF
   =============================== */

/* ===============================
   CONFIG
=============================== */
const API_URL = "https://script.google.com/macros/s/AKfycbz-WpBesdbod91BgncMD68J7jZekbMB9aOwO7Yb_Mn2SoiOD-tLO-6rAiNl_suFKFKSkw/exec";

// ✅ KEYS (UI-only gate; real security is still Apps Script)
const ADMIN_KEY = "SMARTLINKX_ISP_04082025";
const STAFF_KEY = "SMARTLINKX_STAFF_2026";

// Plans
const PLANS = [
  { name: "20Mbps", monthly: 699 },
  { name: "100Mbps", monthly: 1299 }
];

const DEFAULT_INSTALL_FEE = 2000;

/* ===============================
   ROLE / AUTH (UI)
=============================== */
function getKey_() {
  return (localStorage.getItem("SLX_KEY") || "").trim();
}

function getRole_() {
  const key = getKey_();
  if (key === ADMIN_KEY) return "ADMIN";
  if (key === STAFF_KEY) return "STAFF";
  return "";
}

// Call this on every page load (DOMContentLoaded)
function requireRole() {
  let key = getKey_();

  // already valid
  if (key === ADMIN_KEY || key === STAFF_KEY) return;

  // ask once
  key = prompt("Enter Access Key (Admin/Staff):");
  if (!key) {
    // If cancel, go home
    location.href = "index.html";
    return;
  }

  key = key.trim();
  if (key !== ADMIN_KEY && key !== STAFF_KEY) {
    alert("Invalid key.");
    location.href = "index.html";
    return;
  }

  localStorage.setItem("SLX_KEY", key);
}

function logout() {
  localStorage.removeItem("SLX_KEY");
  location.href = "index.html";
}

/* ===============================
   NAV CLEANUP (STAFF vs ADMIN)
   STAFF should see ONLY:
   - Home
   - New Subscriber
   - Billing
=============================== */
function applyNavRoles() {
  const role = getRole_();
  const isAdmin = role === "ADMIN";

  // These must exist in your HTML as IDs for admin-only links:
  // <a id="navMasterfile"...>, <a id="navPayments"...>, <a id="navExpenses"...>, <a id="navAccounting"...>
  const adminOnlyIds = ["navMasterfile", "navPayments", "navExpenses", "navAccounting"];

  if (!isAdmin) {
    // ✅ remove completely so they won't show at all
    adminOnlyIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });
  }
}

/* ===============================
   BLOCK ADMIN PAGES FOR STAFF
=============================== */
function protectAdminPages() {
  const role = getRole_();
  const isAdmin = role === "ADMIN";

  const adminPages = ["masterfile.html", "payments.html", "daily-expense.html", "accounting.html"];
  const current = (location.pathname.split("/").pop() || "").toLowerCase();

  if (!isAdmin && adminPages.includes(current)) {
    alert("Staff access: not allowed.");
    location.href = "index.html";
  }
}

/* ===============================
   HELPERS
=============================== */
function peso(n) {
  const x = Number(n);
  return isFinite(x) ? "₱" + x.toLocaleString("en-PH") : "₱0";
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function setStatus(el, msg, type) {
  if (!el) return;
  el.style.display = "block";
  el.className = "alert " + (type || "");
  el.textContent = msg;
}

/* ===============================
   HOME: render plans
=============================== */
function renderHomePlans_() {
  const wrap = document.getElementById("planCards");
  if (!wrap) return;

  wrap.innerHTML = "";
  PLANS.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${p.name}</h3>
      <p class="muted">Monthly Payment</p>
      <div style="font-size:28px;font-weight:900;margin:6px 0 12px;">${peso(p.monthly)}</div>
      <a class="btn primary" href="register.html">Register this plan</a>
    `;
    wrap.appendChild(card);
  });
}

/* ===============================
   REGISTER PAGE: submit (no key needed)
=============================== */
function initRegister_() {
  const form = document.getElementById("registrationForm");
  if (!form) return;

  const planSelect = document.getElementById("planSelect");
  const monthlyInput = document.getElementById("monthlyPayment");
  const installInput = document.getElementById("installationFee");
  const dateInput = document.getElementById("date");
  const statusBox = document.getElementById("statusBox");
  const submitBtn = document.getElementById("submitBtn");

  dateInput.value = todayISO();
  installInput.value = DEFAULT_INSTALL_FEE;

  // Fill dropdown
  planSelect.innerHTML =
    `<option value="" disabled selected>Select a plan</option>` +
    PLANS.map(p => `<option value="${p.name}" data-monthly="${p.monthly}">${p.name} - ${peso(p.monthly)}/mo</option>`).join("");

  function syncMonthly() {
    const opt = planSelect.options[planSelect.selectedIndex];
    const m = Number(opt?.getAttribute("data-monthly") || 0);
    monthlyInput.value = m || "";
  }
  planSelect.addEventListener("change", syncMonthly);

  // Submit
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();

    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());

    payload.installationFee = Number(payload.installationFee || DEFAULT_INSTALL_FEE);
    payload.monthlyPayment = Number(payload.monthlyPayment || 0);

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || `Request failed (${res.status})`);

      setStatus(statusBox, "Saved! Subscriber registered successfully.", "ok");
      form.reset();

      dateInput.value = todayISO();
      installInput.value = DEFAULT_INSTALL_FEE;
      planSelect.selectedIndex = 0;
      monthlyInput.value = "";
    } catch (err) {
      setStatus(statusBox, "Failed: " + err.message, "bad");
    } finally {
      submitBtn.textContent = "Submit Registration";
      submitBtn.disabled = false;
    }
  });
}

/* ===============================
   YEAR FOOTER
=============================== */
function setYear_() {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
}

/* ===============================
   BOOTSTRAP (runs on every page)
=============================== */
document.addEventListener("DOMContentLoaded", () => {
  requireRole();        // prompt for key once
  protectAdminPages();  // staff cannot open admin pages
  applyNavRoles();      // staff sees ONLY 3 links (admin links removed)

  // optional page inits
  renderHomePlans_();
  initRegister_();
  setYear_();
});
