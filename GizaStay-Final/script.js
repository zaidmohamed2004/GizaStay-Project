function getParam(name) {
  return new URLSearchParams(location.search).get(name);
}

function esc(s) {
  return String(s).replace(
    /[&<>'"]/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        c
      ],
  );
}

function setupSearch() {
  const form = document.getElementById("search-form");
  if (!form) return;

  const destination = document.getElementById("destination");
  const destError = document.getElementById("destination-error");
  const value = getParam("destination");
  if (value && destination) destination.value = value;

  document.querySelectorAll(".hero-type-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      document
        .querySelectorAll(".hero-type-pill")
        .forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const checkin = document.getElementById("checkin");
    const checkout = document.getElementById("checkout");
    const guests = document.getElementById("guests");
    const dest = destination.value.trim();

    if (!dest) {
      destination.classList.add("is-invalid");
      if (destError) destError.classList.remove("d-none");
      destination.focus();
      return;
    }
    destination.classList.remove("is-invalid");
    if (destError) destError.classList.add("d-none");

    const datesInvalid =
      checkin.value && checkout.value && checkout.value < checkin.value;
    checkout.classList.toggle("is-invalid", !!datesInvalid);
    if (datesInvalid) return;

    const params = new URLSearchParams();
    params.set("destination", dest);
    if (checkin.value) params.set("checkin", checkin.value);
    if (checkout.value) params.set("checkout", checkout.value);
    if (guests.value) params.set("guests", guests.value);
    location.href = "searchgrid.html?" + params.toString();
  });
}

function getFavoriteIds() {
  try {
    return JSON.parse(localStorage.getItem("gizastay_favorites") || "[]");
  } catch (e) {
    return [];
  }
}

function toggleFavoriteId(id) {
  const ids = getFavoriteIds();
  const i = ids.indexOf(id);
  if (i === -1) ids.push(id);
  else ids.splice(i, 1);
  try {
    localStorage.setItem("gizastay_favorites", JSON.stringify(ids));
  } catch (e) {}
  return i === -1;
}

function hotelCardHTML(h, opts) {
  opts = opts || {};
  const liked = getFavoriteIds().indexOf(h.id) !== -1;
  const label =
    h.rating >= 4.8 ? "Excellent" : h.rating >= 4 ? "Very Good" : "Good";
  const dealBadge = opts.deal
    ? `<span class="badge rounded-pill text-bg-success-subtle text-success border border-success-subtle mb-2">Getaway Deal</span><br>`
    : "";
  const oldPrice = opts.deal
    ? `<s class="text-muted small me-1">$${Math.round(h.price * 1.2)}</s> `
    : "";
  return `
    <div class="hotel-slide-card bg-white rounded-4 overflow-hidden shadow-sm h-100">
      <div class="position-relative">
        <img src="${h.image}" class="w-100" height="180" style="object-fit:cover" alt="${esc(h.name)}">
        <button type="button" class="hotel-heart position-absolute top-0 end-0 m-2 rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center p-2 border-0${liked ? " active" : ""}" data-id="${esc(h.id)}" style="width:36px;height:36px" aria-label="Save ${esc(h.name)}"><i class="bi ${liked ? "bi-heart-fill text-danger" : "bi-heart"} lh-1"></i></button>
      </div>
      <div class="p-3">
        <div class="small mb-1">
          <span class="badge text-bg-primary">${h.rating.toFixed(1)}</span>
          <span class="fw-semibold">${label}</span>
          <span class="text-secondary">${h.reviews.toLocaleString()} reviews</span>
        </div>
        <h6 class="fw-bold mb-0 text-truncate">${esc(h.name)}</h6>
        <p class="text-secondary small mb-2">${esc(h.location)}</p>
        ${dealBadge}
        <div class="small text-secondary">per night ${oldPrice}<strong class="text-dark fs-6">$${h.price}</strong></div>
        <a href="details.html?id=${encodeURIComponent(h.id)}" class="stretched-link"></a>
      </div>
    </div>`;
}

function bindHeartButtons(container) {
  container.querySelectorAll(".hotel-heart").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      const nowLiked = toggleFavoriteId(btn.dataset.id);
      btn.classList.toggle("active", nowLiked);
      const ic = btn.querySelector("i");
      if (ic) {
        ic.classList.toggle("bi-heart-fill", nowLiked);
        ic.classList.toggle("text-danger", nowLiked);
        ic.classList.toggle("bi-heart", !nowLiked);
      }
    });
  });
}

function setupWeekendDeals() {
  const grid = document.getElementById("weekend-deals-grid");
  if (!grid) return;
  const hotels = (window.GIZASTAY_HOTELS || []).slice(4, 9);
  grid.innerHTML = hotels.map((h) => hotelCardHTML(h, { deal: true })).join("");
  bindHeartButtons(grid);
}

function setupHomesGuestsLove() {
  const grid = document.getElementById("homes-guests-grid");
  if (!grid) return;
  const hotels = (window.GIZASTAY_HOTELS || []).slice(0, 4);
  grid.innerHTML = hotels.map((h) => hotelCardHTML(h)).join("");
  bindHeartButtons(grid);
}

function countryFlag(location) {
  const FLAGS = {
    France: "\u{1F1EB}\u{1F1F7}",
    Portugal: "\u{1F1F5}\u{1F1F9}",
    Mexico: "\u{1F1F2}\u{1F1FD}",
    Italy: "\u{1F1EE}\u{1F1F9}",
    Egypt: "\u{1F1EA}\u{1F1EC}",
    Spain: "\u{1F1EA}\u{1F1F8}",
  };
  const country = String(location || "")
    .split(",")
    .pop()
    .trim();
  return FLAGS[country] || "";
}

function hotelById(id) {
  if (window.gizastayGetHotel) return window.gizastayGetHotel(id);
  return (window.GIZASTAY_HOTELS || []).find((h) => h.id === id) || null;
}

function setupTrendingDestinations() {
  const grid = document.getElementById("trending-destinations-grid");
  if (!grid) return;
  const ids = [
    "villa-san-martino",
    "pyramids-view",
    "palm-grove",
    "coral-reef",
  ];
  const hotels = ids.map(hotelById).filter(Boolean);
  grid.innerHTML = hotels
    .map(
      (h) => `
    <div class="col-6 col-lg-3">
      <a href="details.html?id=${encodeURIComponent(h.id)}" class="dest-card d-block text-decoration-none">
        <img src="${h.image}" alt="${esc(h.name)}">
        <div class="dest-overlay">
          <h6 class="fw-bold mb-0">${esc(h.location)} ${countryFlag(h.location)}</h6>
          <span class="small">From <strong class="text-warning">$${h.price}</strong>/night</span>
          <p class="small mb-0 text-truncate">${esc(h.name)}</p>
        </div>
      </a>
    </div>`,
    )
    .join("");
}

function setupTopSights() {
  const grid = document.getElementById("top-sights-grid");
  if (!grid) return;
  const ids = [
    "azure-horizon",
    "cairo-nile-loft",
    "melia-sky",
    "grand-marina",
    "casa-tranquila",
  ];
  const hotels = ids.map(hotelById).filter(Boolean);
  grid.innerHTML = hotels
    .map(
      (h, i) => `
    <div class="${i < 2 ? "col-md-6" : "col-md-4"}">
      <a href="details.html?id=${encodeURIComponent(h.id)}" class="sight-tile d-block text-decoration-none">
        <img src="${h.image}" alt="${esc(h.name)}">
        <span class="sight-label">${esc(h.location)} ${countryFlag(h.location)}</span>
      </a>
    </div>`,
    )
    .join("");
}

function setupTravelPerks() {
  const grid = document.getElementById("travel-perks-grid");
  if (!grid) return;
  const KEY = "giza_travel_perks";
  let perks;
  try {
    perks = JSON.parse(localStorage.getItem(KEY));
  } catch (e) {
    perks = null;
  }
  if (!Array.isArray(perks) || !perks.length) {
    perks = [
      {
        title: "10% discounts on stays",
        text: "Enjoy discounts at participating properties worldwide.",
      },
      {
        title: "Travel of season",
        text: "Avoid peak times and enjoy lower prices and fewer crowds.",
      },
      {
        title: "Exclusive deals",
        text: "Enjoy discounts at participating properties worldwide.",
      },
      {
        title: "Weekend Special",
        text: "Enjoy 12% off weekend stays.",
      },
    ];
    try {
      localStorage.setItem(KEY, JSON.stringify(perks));
    } catch (e) {}
  }
  grid.innerHTML = perks
    .map(
      (p) => `
    <div class="col-6 col-md-3">
      <div class="border border-primary-subtle rounded-3 p-3 h-100">
        <h6 class="fw-bold small mb-1">${esc(p.title)}</h6>
        <p class="text-secondary small mb-0">${esc(p.text)}</p>
      </div>
    </div>`,
    )
    .join("");
}

function setupNewsletter() {
  const form = document.getElementById("newsletter-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    document.getElementById("newsletter-success").classList.remove("d-none");
    form.reset();
  });
}

function setupNavSearch() {
  const applyBtn = document.getElementById("searchApply");
  if (!applyBtn) return;
  const modalEl = document.getElementById("navSearchModal");

  if (modalEl) {
    modalEl.addEventListener("hidden.bs.modal", function () {
      const destInput = document.getElementById("mDest");
      const destError = document.getElementById("mDestError");
      const datesError = document.getElementById("mDatesError");
      if (destInput) destInput.classList.remove("is-invalid");
      if (destError) destError.classList.add("d-none");
      if (datesError) datesError.classList.add("d-none");
    });
  }

  applyBtn.addEventListener("click", function () {
    const destInput = document.getElementById("mDest");
    const destError = document.getElementById("mDestError");
    const datesError = document.getElementById("mDatesError");
    const dest = destInput ? destInput.value.trim() : "";
    const checkin = document.getElementById("mCheckin")?.value || "";
    const checkout = document.getElementById("mCheckout")?.value || "";
    const guestsSelect = document.getElementById("mGuests");
    const guests = guestsSelect ? guestsSelect.value : "2";

    if (!dest) {
      if (destInput) {
        destInput.classList.add("is-invalid");
        destInput.focus();
      }
      if (destError) destError.classList.remove("d-none");
      return;
    }
    if (destInput) destInput.classList.remove("is-invalid");
    if (destError) destError.classList.add("d-none");

    if (checkin && checkout && checkout < checkin) {
      if (datesError) datesError.classList.remove("d-none");
      return;
    }
    if (datesError) datesError.classList.add("d-none");

    const navDest = document.getElementById("navDest");
    const navDates = document.getElementById("navDates");
    const navGuests = document.getElementById("navGuests");
    if (navDest) navDest.value = dest;
    if (navDates && (checkin || checkout))
      navDates.value = (checkin || "?") + " - " + (checkout || "?");
    if (navGuests)
      navGuests.value = guests + (guests === "1" ? " guest" : " guests");

    const params = new URLSearchParams();
    params.set("destination", dest);
    if (checkin) params.set("checkin", checkin);
    if (checkout) params.set("checkout", checkout);
    if (guests) params.set("guests", guests);

    if (modalEl && window.bootstrap) {
      window.bootstrap.Modal.getOrCreateInstance(modalEl).hide();
    }
    location.href = "searchgrid.html?" + params.toString();
  });
}

document.addEventListener("DOMContentLoaded", function () {
  setupSearch();
  setupTrendingDestinations();
  setupWeekendDeals();
  setupHomesGuestsLove();
  setupTravelPerks();
  setupTopSights();
  setupNewsletter();
  setupNavSearch();
});
