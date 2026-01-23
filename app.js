/* ============================
   DEDICATED LOGIN (ONE KEY ONLY)
   - NO staff/admin separation
   - Redirects to login.html if not logged in
============================ */

const ACCESS_KEY = "SMARTLINKX_01";
const AUTH_STORE = sessionStorage;

/* ---------- AUTH ---------- */
function isLoggedIn() {
  return AUTH_STORE.getItem("SLX_AUTH") === "1";
}

function setLoggedIn() {
  AUTH_STORE.setItem("SLX_AUTH", "1");
}

function clearLogin() {
  AUTH_STORE.removeItem("SLX_AUTH");
}

function logout() {
  clearLogin();
  location.href = "login.html";
}

function requireLogin() {
  const page = location.pathname.split("/").pop().toLowerCase();
  const allow = ["login.html", "home.html", ""];

  if (allow.includes(page)) return;

  if (!isLoggedIn()) {
    location.href =
      "login.html?next=" + encodeURIComponent(page || "index.html");
  }
}

/* ---------- UI STATUS ---------- */
function setStatus(el, msg, type) {
  if (!el) return;
  el.style.display = "block";
  el.className = "alert " + (type || "");
  el.textContent = msg;
}

/* ============================
   LOGIN PAGE HANDLER
============================ */
(function initLoginPage() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  if (isLoggedIn()) {
    const next =
      new URLSearchParams(location.search).get("next") || "home.html";
    location.href = next;
    return;
  }

  const input = document.getElementById("accessKey");
  const status = document.getElementById("loginStatus");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const key = (input.value || "").trim();
    if (!key) {
      setStatus(status, "Please enter Access Key.", "bad");
      return;
    }

    if (key !== ACCESS_KEY) {
      setStatus(status, "Invalid Access Key.", "bad");
      input.value = "";
      input.focus();
      return;
    }

    setLoggedIn();
    setStatus(status, "Login successful. Redirecting...", "ok");

    const next =
      new URLSearchParams(location.search).get("next") || "home.html";
    location.href = next;
  });

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();

/* ===============================
   SMARTLINKX Website Config
=============================== */

const API_URL =
  "https://script.google.com/macros/s/AKfycbz-WpBesdbod91BgncMD68J7jZekbMB9aOwO7Yb_Mn2SoiOD-tLO-6rAiNl_suFKFKSkw/exec";

const PLANS = [
  { name: "20Mbps", monthly: 699 },
  { name: "100Mbps", monthly: 1299 },
];

const DEFAULT_INSTALL_FEE = 2000;

/* ---------- HELPERS ---------- */
function peso(n) {
  const x = Number(n);
  return isFinite(x) ? "₱" + x.toLocaleString("en-PH") : "₱0";
}

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

/* ===============================
   HOME
=============================== */
(function renderHomePlans() {
  const wrap = document.getElementById("planCards");
  if (!wrap) return;

  wrap.innerHTML = "";
  PLANS.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${p.name}</h3>
      <p class="muted">Monthly Payment</p>
      <div style="font-size:28px;font-weight:900;margin:6px 0 12px;">
        ${peso(p.monthly)}
      </div>
      <a class="btn primary" href="register.html">Register this plan</a>
    `;
    wrap.appendChild(card);
  });
})();

/* ===============================
   REGISTER PAGE
=============================== */
(function initRegister() {
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

  planSelect.innerHTML = PLANS.map(
    (p) =>
      `<option value="${p.name}" data-monthly="${p.monthly}">
        ${p.name} - ${peso(p.monthly)}/mo
      </option>`
  ).join("");

  function syncMonthly() {
    monthlyInput.value =
      planSelect.selectedOptions[0].dataset.monthly || 0;
  }

  planSelect.addEventListener("change", syncMonthly);
  syncMonthly();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = Object.fromEntries(new FormData(form).entries());
    payload.installationFee = Number(payload.installationFee);
    payload.monthlyPayment = Number(payload.monthlyPayment);

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.error);

      setStatus(statusBox, "Saved successfully.", "ok");
      form.reset();
      dateInput.value = todayISO();
      installInput.value = DEFAULT_INSTALL_FEE;
      syncMonthly();
    } catch (err) {
      setStatus(statusBox, err.message, "bad");
    }

    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Registration";
  });
})();

/* ===============================
   GLOBAL GUARD
=============================== */
document.addEventListener("DOMContentLoaded", () => {
  requireLogin();
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});
