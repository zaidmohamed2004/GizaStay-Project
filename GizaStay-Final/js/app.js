(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const go = (url) => {
    window.location.href = url;
  };

  function setupGlobalLinks() {
    $$(".navbar a, footer a, a").forEach((a) => {
      if (a.dataset.globalReady) return;
      if (a.closest(".help-grid, .feedback-list, #helpPanel")) return;
      const text = a.textContent.trim().replace(/\s+/g, " ").toLowerCase();
      if (a.getAttribute("href") !== "#") return;
      if (text === "help centre" || text === "help center" || text === "faqs")
        a.href = "helpcen.html";
      else if (text === "contact us" || text === "live chat support")
        a.href = "support.html";
      else if (text === "log in" || text === "sign in to your account")
        a.href = "login.html";
      else if (text === "hotels") a.href = "searchgrid.html?type=Hotels";
      else if (text === "apartments")
        a.href = "searchgrid.html?type=Apartments";
      else if (text === "villas") a.href = "searchgrid.html?type=Villas";
      else if (text === "guesthouses")
        a.href = "searchgrid.html?type=Guesthouses";
      else if (text === "trending destinations")
        a.href = "searchgrid.html?sort=rating-desc";
      else if (text === "summer hotspots")
        a.href = "searchgrid.html?type=Hotels";
      else if (text === "winter getaways")
        a.href = "searchgrid.html?type=Villas";
      else if (text === "weekend deals") a.href = "searchgrid.html?deal=1";
      else if (text === "family-friendly stays") a.href = "searchgrid.html";
      else if (text === "personal data") a.href = "profile.html";
      else if (text === "payment account") a.href = "payment.html";
      else if (text === "trips") a.href = "confirmation.html";
      else if (text === "wish lists") a.href = "searchgrid.html#favorites";
      else if (text === "support") a.href = "support.html";
      else if (text === "my reviews") a.href = "support.html";
      else if (text === "settings") a.href = "profile.html";
      else if (text === "app store" || text === "google play")
        a.href = "index.html#app";
      else if (text === "privacy") a.href = "Interna.html";
      else if (text === "terms") a.href = "Interna.html";
      else a.href = "index.html";
      a.dataset.globalReady = "1";
    });
  }

  function setupCurrency() {
    $$(".currency-choice, [data-currency]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const currency =
          el.dataset.currency || el.textContent.trim().split(" ")[0];
        localStorage.setItem("gizastay_currency", currency);
        alert("Currency changed to " + currency);
      });
    });
  }

  function setupProfile() {
    const loggedIn = localStorage.getItem("gizastay_logged_in") === "1";
    $$(".profile-link").forEach((a) => {
      if (loggedIn) {
        a.href = "profile.html";
      } else {
        a.href = "login.html";
        a.innerHTML =
          '<span class="btn btn-outline-primary btn-sm px-3">Log in</span>';
      }
    });
    $$(".auth-only").forEach((el) => {
      if (!loggedIn) el.hidden = true;
    });
  }

  function setupLogout() {
    $$("a,button").forEach((el) => {
      if (el.dataset.logoutReady) return;
      if (el.textContent.trim().toLowerCase() === "log out") {
        el.dataset.logoutReady = "1";
        el.addEventListener("click", (e) => {
          e.preventDefault();
          localStorage.removeItem("gizastay_logged_in");
          localStorage.removeItem("gizastay_email");
          localStorage.removeItem("gizastay_login_redirect");
          localStorage.removeItem("guestData");
          localStorage.removeItem("paymentData");
          localStorage.removeItem("bookingProperty");
          localStorage.removeItem("gizastay_reservation_code");
          go("index.html");
        });
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupGlobalLinks();
    setupCurrency();
    setupProfile();
    setupLogout();
  });
})();
