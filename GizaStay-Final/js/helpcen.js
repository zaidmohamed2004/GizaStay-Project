(function () {
  "use strict";

  const TOPICS = {
    stays: {
      title: "Stays",
      items: [
        {
          q: "How do I book a stay?",
          a: "Search a destination on the home page, open a property, choose your dates and guests, then select Reserve. You confirm guest details and pay to finish.",
        },
        {
          q: "Can I change or cancel a booking?",
          a: "Open Profile then Trips, select the booking and choose Cancel Booking. Whether cancellation is free depends on the property policy shown at checkout.",
        },
        {
          q: "When am I charged?",
          a: "Payment is taken at the payment step. Some stays offer paying part now and part later; the amounts and dates are shown before you confirm.",
        },
      ],
    },
    "loyalty-rewards": {
      title: "Loyalty & Rewards",
      items: [
        {
          q: "How do I earn rewards?",
          a: "You earn points automatically on completed stays booked while signed in to your account.",
        },
        {
          q: "Do my points expire?",
          a: "Points stay valid for 24 months from your most recent completed booking.",
        },
      ],
    },
    security: {
      title: "Security",
      items: [
        {
          q: "How do I keep my account secure?",
          a: "Use an email address you control and never share your verification code. GizaStay will never ask for that code by phone or email.",
        },
        {
          q: "I received a login code I did not request",
          a: "You can ignore it; the code cannot be used by anyone else. Sign in and review your recent activity in your profile.",
        },
      ],
    },
    "things-to-do": {
      title: "Things to do",
      items: [
        {
          q: "Can I book activities through GizaStay?",
          a: "Activities listed on a property page are informational in this version. Arrange them with the property after check-in.",
        },
        {
          q: "Are activity prices per person?",
          a: "Yes, activity prices are shown per person unless the listing states otherwise.",
        },
      ],
    },
    "refunds-charges": {
      title: "Refunds & Charges",
      items: [
        {
          q: "How long does a refund take?",
          a: "Approved refunds are returned to your original payment method within 5 to 10 business days.",
        },
        {
          q: "Why was I charged a service fee?",
          a: "The GizaStay service fee covers support and secure payment. It is always shown in the price breakdown before you pay.",
        },
        {
          q: "I see a charge I do not recognise",
          a: "Check Profile then Trips for the matching booking, then contact support with the reservation code.",
        },
      ],
    },
    account: {
      title: "Account",
      items: [
        {
          q: "How do I update my details?",
          a: "Go to Profile then Personal Data, edit your name, phone, address or photo, and select Save changes.",
        },
        {
          q: "How do I delete my account?",
          a: "Profile then Settings then Delete account removes your local data from this device.",
        },
        {
          q: "International travel documents",
          a: "Passports, visas, ESTA, ETA and rules for travelling with minors are covered in the full article.",
          link: "Interna.html",
        },
        {
          q: "See all account articles",
          a: "Open the full list of account help articles.",
          link: "account.html",
        },
      ],
    },
    privacy: {
      title: "Privacy",
      items: [
        {
          q: "What data does GizaStay store?",
          a: "In this project your login state, profile details, wishlist and bookings are stored only in your browser using localStorage.",
        },
        {
          q: "How do I clear my data?",
          a: "Log out to clear session data, or use Profile then Settings then Delete account to remove everything.",
        },
      ],
    },
    "travel-alerts": {
      title: "Travel Alerts",
      items: [
        {
          q: "Where do I see travel alerts?",
          a: "Important destination notices appear on the property page and again before checkout.",
        },
        {
          q: "Do alerts affect my cancellation options?",
          a: "If an official travel alert affects your dates, contact support with your reservation code to review the options.",
        },
      ],
    },
  };

  const ARTICLES = {
    "update-info":
      "Go to Profile then Personal Data, edit your name, phone, address or photo, then select Save changes.",
    "sign-in":
      "Open the Log in page, enter your email, then type the 4-digit demo verification code shown on screen.",
    customs:
      "Customs limits depend on your destination. Check the customs authority of the country you are entering before you travel.",
    unsubscribe:
      "Marketing messages can be turned off in Profile then Settings by turning off Personalized recommendations.",
    manage:
      "Profile then Trips shows every booking with its dates, guests, status and invoice.",
    delete:
      "Profile then Settings then Delete account permanently removes your local data from this device.",
  };

  function esc(s) {
    return String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  }

  function faqHtml(it) {
    const link = it.link
      ? `<a class="help-faq-link" href="${it.link}">Read the full article</a>`
      : "";
    return `<div class="help-faq">
      <button type="button" class="help-faq-q" aria-expanded="false">
        <span>${esc(it.q)}</span><i class="bi bi-plus-lg"></i>
      </button>
      <div class="help-faq-a" hidden><p class="mb-2">${esc(it.a)}</p>${link}</div>
    </div>`;
  }

  function toggleFaq(e) {
    const btn = e.currentTarget;
    const ans = btn.nextElementSibling;
    const open = !ans.hidden;
    ans.hidden = open;
    btn.setAttribute("aria-expanded", String(!open));
    btn.querySelector("i").className = open ? "bi bi-plus-lg" : "bi bi-dash-lg";
  }

  // ---- Hub mode: helpcen.html ----
  const grid = document.querySelector(".Explore-articles .help-grid");
  const panel = document.getElementById("helpPanel");

  if (grid && panel) {
    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("exampleDataList");

    function showGrid() {
      panel.hidden = true;
      panel.innerHTML = "";
      grid.hidden = false;
    }

    function showPanel(title, items) {
      const back =
        '<button type="button" class="help-back"><i class="bi bi-chevron-left"></i> Back to all topics</button>';
      const body = items.length
        ? items.map(faqHtml).join("")
        : `<p class="text-muted">No help articles matched your search. Try another word, or contact support.</p>
           <a class="btn btn-outline-primary btn-sm" href="support.html">Contact support</a>`;
      panel.innerHTML = `${back}<h3 class="help-panel-title">${esc(title)}</h3>${body}`;
      panel.hidden = false;
      grid.hidden = true;
      panel.querySelector(".help-back").addEventListener("click", showGrid);
      panel
        .querySelectorAll(".help-faq-q")
        .forEach((b) => b.addEventListener("click", toggleFaq));
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    grid.querySelectorAll(".help-item[data-cat]").forEach((card) => {
      card.addEventListener("click", (e) => {
        e.preventDefault();
        const topic = TOPICS[card.dataset.cat];
        if (topic) showPanel(topic.title, topic.items);
      });
    });

    function runSearch() {
      const raw = (searchInput.value || "").trim();
      if (!raw) {
        searchInput.focus();
        return;
      }
      const q = raw.toLowerCase();
      const results = [];
      Object.values(TOPICS).forEach((t) =>
        t.items.forEach((it) => {
          if ((it.q + " " + it.a).toLowerCase().includes(q)) results.push(it);
        }),
      );
      showPanel('Results for "' + raw + '"', results);
    }

    if (searchBtn) searchBtn.addEventListener("click", runSearch);
    if (searchInput)
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          runSearch();
        }
      });
  }

  // ---- Article list mode: account.html ----
  const accGrid = document.querySelector(".acc-page .help-grid");
  if (accGrid) {
    accGrid.querySelectorAll(".help-item[data-article]").forEach((card) => {
      card.addEventListener("click", (e) => {
        e.preventDefault();
        const next = card.nextElementSibling;
        if (next && next.classList.contains("help-answer")) {
          next.hidden = !next.hidden;
          return;
        }
        const ans = document.createElement("div");
        ans.className = "help-answer";
        ans.textContent = ARTICLES[card.dataset.article] || "";
        card.after(ans);
      });
    });
  }
})();
