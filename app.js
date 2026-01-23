/* ============================
   SMARTLINKX AUTH (SIMPLE)
   - login.html = public
   - ALL other pages require login
============================ */

// 🔐 CHANGE THIS ACCESS KEY IF NEEDED
const ACCESS_KEY = "SMARTLINKX_01";

// use sessionStorage (logout when browser closes)
const AUTH_STORE = sessionStorage;
const AUTH_FLAG = "SLX_AUTH";

/* ============================
   AUTH HELPERS
============================ */
function isLoggedIn() {
  return AUTH_STORE.getItem(AUTH_FLAG) === "1";
}

function setLoggedIn() {
  AUTH_STORE.setItem(AUTH_FLAG, "1");
}

function clearLogin() {
  AUTH_STORE.removeItem(AUTH_FLAG);
}

/* ============================
   ROUTE GUARD
============================ */
function requireLogin() {
  const page = location.pathname.split("/").pop().toLowerCase();

  // ONLY login.html is allowed without login
  if (page === "login.html" || page === "") return;

  if (!isLoggedIn()) {
    location.href = "login.html";
  }
}

/* ============================
   LOGOUT (GLOBAL)
============================ */
function logout() {
  clearLogin();
  location.href = "login.html";
}

/* ============================
   LOGIN PAGE HANDLER
============================ */
(function initLoginPage() {
  const form = document.getElementById("loginForm");
  if (!form) return; // not login page

  // already logged in → go home
  if (isLoggedIn()) {
    location.href = "index.html";
    return;
  }

  const input = document.getElementById("accessKey");
  const status = document.getElementById("loginStatus");

  function setStatus(msg, type) {
    status.style.display = "block";
    status.className = "alert " + (type || "");
    status.textContent = msg;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const key = input.value.trim();
    if (!key) {
      setStatus("Please enter Access Key.", "bad");
      return;
    }

    if (key !== ACCESS_KEY) {
      setStatus("Invalid Access Key.", "bad");
      input.value = "";
      input.focus();
      return;
    }

    setLoggedIn();
    setStatus("Login successful. Redirecting…", "ok");

    setTimeout(() => {
      location.href = "index.html";
    }, 600);
  });
})();

/* ============================
   GLOBAL INIT
============================ */
document.addEventListener("DOMContentLoaded", () => {
  requireLogin();

  // footer year
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});
