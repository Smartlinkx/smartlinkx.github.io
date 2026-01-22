// ===============================
// SMARTLINKX Website Config
// ===============================

// 1) Paste your Google Apps Script Web App URL here:
const API_URL = "https://script.google.com/macros/s/AKfycbyX-2aiopFR0EIcjLhW9Q2OQ-3BJ-zwSJshRgTcOrC_E1WbA0yxOTt2jzs5o67u6DBOLQ/exec";
const ADMIN_KEY = "SMARTLINKX_ISP_04082025";

// 2) Plans (you can add more later)
const PLANS = [
  { name: "20Mbps", monthly: 699 },
  { name: "100Mbps", monthly: 1299 }
];

// 3) Default installation fee
const DEFAULT_INSTALL_FEE = 2000;

// ===============================
// Helpers
// ===============================
function peso(n){
  const x = Number(n);
  return isFinite(x) ? "₱" + x.toLocaleString("en-PH") : "₱0";
}
function todayISO(){
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${yyyy}-${mm}-${dd}`;
}
function setStatus(el, msg, type){
  if (!el) return;
  el.style.display = "block";
  el.className = "alert " + (type || "");
  el.textContent = msg;
}

// ===============================
// Home: render plans
// ===============================
(function renderHomePlans(){
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

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();

// ===============================
// Register Page: fill plan dropdown + submit
// ===============================
(function initRegister(){
  const form = document.getElementById("registrationForm");
  if (!form) {
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
    return;
  }

  const planSelect = document.getElementById("planSelect");
  const monthlyInput = document.getElementById("monthlyPayment");
  const installInput = document.getElementById("installationFee");
  const dateInput = document.getElementById("date");
  const statusBox = document.getElementById("statusBox");
  const submitBtn = document.getElementById("submitBtn");

  dateInput.value = todayISO();
  installInput.value = DEFAULT_INSTALL_FEE;

  planSelect.innerHTML = PLANS.map(p =>
    `<option value="${p.name}" data-monthly="${p.monthly}">${p.name} - ${peso(p.monthly)}/mo</option>`
  ).join("");

  function syncMonthly(){
    const opt = planSelect.options[planSelect.selectedIndex];
    const m = Number(opt.getAttribute("data-monthly") || 0);
    monthlyInput.value = m;
  }
  planSelect.addEventListener("change", syncMonthly);
  syncMonthly();

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();

    if (!API_URL || API_URL.includes("PASTE_YOUR")) {
      setStatus(statusBox, "ERROR: Please paste your Google Apps Script Web App URL in app.js (API_URL).", "bad");
      return;
    }

    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());

    // Ensure numeric fields are numbers
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

      if (!res.ok || !json.ok) {
        throw new Error(json.error || `Request failed (${res.status})`);
      }

      setStatus(statusBox, "Saved! Subscriber registered successfully.", "ok");
      form.reset();

      // Reset defaults
      dateInput.value = todayISO();
      installInput.value = DEFAULT_INSTALL_FEE;
      planSelect.selectedIndex = 0;
      syncMonthly();

      submitBtn.textContent = "Submit Registration";
      submitBtn.disabled = false;
    } catch (err) {
      setStatus(statusBox, "Failed: " + err.message, "bad");
      submitBtn.textContent = "Submit Registration";
      submitBtn.disabled = false;
    }
  });

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();

// ===============================
// Masterfile Page: load + search + sort
// ===============================
(function initMasterfile(){
  const loadBtn = document.getElementById("loadBtn");
  if (!loadBtn) {
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
    return;
  }

  const adminKeyEl = document.getElementById("adminKey");
  const status = document.getElementById("mfStatus");
  const tbody = document.getElementById("masterTbody");
  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");

  let allRows = [];

  function rowText(r){
    return [
      r["Date"], r["Subscriber ID"], r["Plan"], r["Name"], r["Contact No"],
      r["Address"], r["MAC Address"], r["IP Address"], r["Due Date"]
    ].join(" ").toLowerCase();
  }

  function sortRows(rows){
    const key = sortSelect.value;
    const copy = rows.slice();

    copy.sort((a,b) => {
      const av = (a[key] ?? "").toString();
      const bv = (b[key] ?? "").toString();
      return av.localeCompare(bv);
    });

    return copy;
  }

  function render(rows){
    tbody.innerHTML = "";
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="11" class="muted">No records found.</td></tr>`;
      return;
    }

    rows.forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r["Date"] ?? ""}</td>
        <td>${r["Subscriber ID"] ?? ""}</td>
        <td>${r["Name"] ?? ""}</td>
        <td>${r["Plan"] ?? ""}</td>
        <td>${r["Contact No"] ?? ""}</td>
        <td>${r["Address"] ?? ""}</td>
        <td>${r["Installation Fee"] ?? ""}</td>
        <td>${r["Monthly Payment"] ?? ""}</td>
        <td>${r["MAC Address"] ?? ""}</td>
        <td>${r["IP Address"] ?? ""}</td>
        <td>${r["Due Date"] ?? ""}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function applySearchSort(){
    const q = (searchInput.value || "").trim().toLowerCase();
    const filtered = q ? allRows.filter(r => rowText(r).includes(q)) : allRows;
    render(sortRows(filtered));
  }

  searchInput.addEventListener("input", applySearchSort);
  sortSelect.addEventListener("change", applySearchSort);

  loadBtn.addEventListener("click", async () => {
    if (!API_URL || API_URL.includes("PASTE_YOUR")) {
      setStatus(status, "ERROR: Please paste your Google Apps Script Web App URL in app.js (API_URL).", "bad");
      return;
    }

    const key = adminKeyEl.value.trim();
    if (!key) {
      setStatus(status, "Please enter your Admin Key.", "bad");
      return;
    }

    loadBtn.disabled = true;
    loadBtn.textContent = "Loading...";

    try {
      const url = `${API_URL}?action=list&key=${encodeURIComponent(key)}`;
      const res = await fetch(url);
      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.ok) {
        throw new Error(json.error || `Request failed (${res.status})`);
      }

      allRows = Array.isArray(json.rows) ? json.rows : [];
      setStatus(status, `Loaded ${allRows.length} subscriber(s).`, "ok");
      applySearchSort();

      loadBtn.textContent = "Load Masterfile";
      loadBtn.disabled = false;
    } catch (err) {
      setStatus(status, "Failed: " + err.message, "bad");
      loadBtn.textContent = "Load Masterfile";
      loadBtn.disabled = false;
    }
  });

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
