const $ = (id) => document.getElementById(id);
const qa = (s) => Array.from(document.querySelectorAll(s));
const modalOf = (el) => bootstrap.Modal.getOrCreateInstance(el);
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
function lsGet(k, fb) {
  try {
    const v = localStorage.getItem(k);
    if (v === null) return fb;
    try { return JSON.parse(v); } catch (_) { return v; }
  } catch (_) { return fb; }
}
function lsSet(k, v) {
  try { localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)); } catch (_) {}
}
function jsonScript(id, fb) {
  try { return JSON.parse(($(id) || {}).textContent); } catch (_) { return fb; }
}
function gotoTab(contentId) {
  const trigger = document.querySelector(`[data-bs-target="#${contentId}"]`);
  if (trigger) bootstrap.Tab.getOrCreateInstance(trigger).show();
}

document.addEventListener("DOMContentLoaded", () => {
  const emptyEl = $("wishlist-empty");
  const gridEl = $("wishlist-grid");
  const rowEl = $("wishlist-row");
  if (!emptyEl || !gridEl || !rowEl) return;

  const getIds = () => lsGet("gizastay_favorites", []);
  const setIds = (ids) => lsSet("gizastay_favorites", ids);

  const hotelCard = (h) => `
    <div class="col-12 col-md-4" data-hotel-id="${h.id}">
      <div class="rounded-4 overflow-hidden mb-2 shadow-sm position-relative" style="height: 200px;">
        <img src="${h.image}" class="w-100 h-100 object-fit-cover" alt="${esc(h.name)}">
        <button type="button" class="btn btn-light rounded-circle position-absolute top-0 end-0 m-2 wishlist-remove-btn" data-hotel-id="${h.id}" style="width:34px;height:34px;" aria-label="Remove from wishlist">
          <i class="bi bi-heart-fill text-danger"></i>
        </button>
      </div>
      <h6 class="fw-bold text-dark mb-0">${esc(h.name)}</h6>
      <span class="text-secondary small">${esc(h.location)} · $${h.price}/night</span>
      <a href="details.html?id=${encodeURIComponent(h.id)}" class="stretched-link"></a>
    </div>`;

  function renderWishlist() {
    const ids = getIds();
    const hotels = (window.GIZASTAY_HOTELS || []).filter((h) => ids.includes(h.id));
    emptyEl.classList.toggle("d-none", hotels.length > 0);
    gridEl.classList.toggle("d-none", hotels.length === 0);
    rowEl.innerHTML = hotels.map(hotelCard).join("");
  }

  rowEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".wishlist-remove-btn");
    if (!btn) return;
    e.preventDefault();
    setIds(getIds().filter((x) => x !== btn.dataset.hotelId));
    renderWishlist();
  });

  renderWishlist();
});

document.addEventListener("DOMContentLoaded", () => {
  const listEl = $("reviews-list");
  const emptyEl = $("reviews-empty");
  const modalEl = $("reviewModal");
  const propInput = $("reviewProperty");
  const scoreInput = $("reviewScore");
  const scoreVal = $("reviewScoreVal");
  const likedInput = $("reviewLiked");
  const dislikedInput = $("reviewDisliked");
  const errorEl = $("reviewError");
  const submitBtn = $("submitReview");
  if (!listEl || !emptyEl) return;

  const STORAGE_KEY = "giza_reviews_v2";
  let editingId = null;

  const HOTEL_IMGS = {
    "via golden tulip hotel": "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=300&q=80",
    "via forest whisper cabin": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=300&q=80",
    "via blue horizon villa": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=300&q=80",
    default: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80",
  };
  const imgFor = (p) => HOTEL_IMGS[String(p || "").trim().toLowerCase()] || HOTEL_IMGS.default;
  const labelFor = (s) =>
    (s = Number(s)) >= 9 ? "Exceptional" : s >= 8 ? "Excellent" : s >= 7 ? "Good" : s >= 5 ? "Average" : s >= 3 ? "Poor" : "Very poor";
  const statusLabel = (s) => (s === "posted" ? "Review posted" : s === "rejected" ? "Review rejected" : "Review Pending");
  const statusBadgeClass = (s) =>
    s === "posted"
      ? "badge rounded-pill bg-success-subtle text-success border border-success-subtle"
      : s === "rejected"
      ? "badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle"
      : "badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle";

  const load = () => lsGet(STORAGE_KEY, []);
  const save = (v) => lsSet(STORAGE_KEY, v);

  function seedIfEmpty() {
    try { if (localStorage.getItem(STORAGE_KEY) !== null) return; } catch (_) { return; }
    save(jsonScript("reviews-seed", []));
  }

  function render() {
    const reviews = load();
    emptyEl.classList.toggle("d-none", reviews.length > 0);
    listEl.innerHTML = reviews
      .map((r) => {
        const helpfulRow =
          r.helpful > 0
            ? `<hr class="my-2"><button type="button" class="btn p-0 border-0 d-flex align-items-center gap-2 review-helpful">
                 <i class="bi bi-hand-thumbs-up-fill text-dark"></i>
                 <span class="small text-muted"><strong class="text-dark">${r.helpful}</strong> people found this review helpful</span>
               </button>`
            : "";
        const responseBox = r.response
          ? `<div class="bg-light rounded-3 p-3 mt-2">
               <p class="fw-bold small mb-1">Property response</p>
               <p class="small text-secondary mb-0">${esc(r.response)}</p>
             </div>`
          : "";
        return `
        <div class="d-flex gap-3 border rounded-4 bg-white p-3 shadow-sm" data-review-id="${esc(r.id)}">
          <img src="${esc(r.img || imgFor(r.property))}" class="rounded-3 object-fit-cover flex-shrink-0" style="width:105px;height:120px;" alt="${esc(r.property)}">
          <div class="flex-grow-1" style="min-width:0;">
            <div class="d-flex justify-content-between align-items-start mb-1">
              <span class="${statusBadgeClass(r.status)}" style="font-size:11px;">${statusLabel(r.status)}</span>
              <div class="dropdown">
                <button class="btn btn-link text-dark p-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow border-0 rounded-3">
                  <li><button class="dropdown-item small review-edit" type="button">Edit review</button></li>
                  <li><button class="dropdown-item small review-delete" type="button">Delete review</button></li>
                </ul>
              </div>
            </div>
            <p class="small mb-1"><strong>You reviewed</strong> <a href="#" class="link-primary fw-semibold small" onclick="return false">Via ${esc(String(r.property).replace(/^via\s+/i, ""))}</a></p>
            <p class="text-muted small mb-1">${esc(r.date)}</p>
            <p class="mb-2"><span class="badge bg-primary-subtle text-primary border border-primary-subtle fw-bold">${Number(r.score).toFixed(1)}</span> <strong class="small">${esc(labelFor(r.score))}</strong></p>
            ${r.liked ? `<div class="d-flex gap-2 mb-1"><i class="bi bi-emoji-smile text-primary"></i><p class="small mb-0">${esc(r.liked)}</p></div>` : ""}
            ${r.disliked ? `<div class="d-flex gap-2 mb-1"><i class="bi bi-emoji-neutral text-muted"></i><p class="small mb-0">${esc(r.disliked)}</p></div>` : ""}
            ${helpfulRow}
            ${responseBox}
          </div>
        </div>`;
      })
      .join("");
  }

  function resetForm() {
    editingId = null;
    modalEl.querySelector("#reviewModalLabel").textContent = "Write a review";
    submitBtn.textContent = "Submit review";
    propInput.value = "";
    scoreInput.value = "7";
    scoreVal.textContent = "7.0";
    likedInput.value = "";
    dislikedInput.value = "";
    errorEl.classList.add("d-none");
  }

  function addReview(property, score, liked, disliked = "", opts = {}) {
    const reviews = load();
    reviews.unshift({
      id: "r-" + Date.now(),
      property: String(property).trim(),
      img: opts.img || imgFor(property),
      date: opts.date || new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      score: Number(score),
      status: opts.status || "pending",
      liked: String(liked || "").trim(),
      disliked: String(disliked || "").trim(),
      helpful: opts.helpful || 0,
      response: opts.response || "",
    });
    save(reviews);
    render();
  }

  function updateReview(id, property, score, liked, disliked = "") {
    const reviews = load();
    const r = reviews.find((x) => x.id === id);
    if (!r) return;
    Object.assign(r, {
      property: String(property).trim(),
      img: imgFor(String(property).trim()),
      score: Number(score),
      liked: String(liked || "").trim(),
      disliked: String(disliked || "").trim(),
    });
    save(reviews);
    render();
  }

  function openEdit(id) {
    const r = load().find((x) => x.id === id);
    if (!r) return;
    editingId = id;
    modalEl.querySelector("#reviewModalLabel").textContent = "Edit review";
    submitBtn.textContent = "Save changes";
    propInput.value = r.property || "";
    scoreInput.value = r.score || 7;
    scoreVal.textContent = Number(r.score || 7).toFixed(1);
    likedInput.value = r.liked || "";
    dislikedInput.value = r.disliked || "";
    errorEl.classList.add("d-none");
    modalOf(modalEl).show();
  }

  scoreInput.addEventListener("input", () => { scoreVal.textContent = Number(scoreInput.value).toFixed(1); });
  modalEl.addEventListener("hidden.bs.modal", resetForm);

  submitBtn.addEventListener("click", () => {
    const prop = propInput.value.trim();
    const liked = likedInput.value.trim();
    const disliked = dislikedInput.value.trim();
    const score = Number(scoreInput.value);
    if (!prop || (!liked && !disliked) || !(score >= 1 && score <= 10)) {
      errorEl.classList.remove("d-none");
      return;
    }
    if (editingId) updateReview(editingId, prop, score, liked, disliked);
    else addReview(prop, score, liked, disliked);
    modalOf(modalEl).hide();
  });

  listEl.addEventListener("click", (e) => {
    const card = e.target.closest("[data-review-id]");
    if (!card) return;
    const id = card.dataset.reviewId;
    if (e.target.closest(".review-helpful")) {
      const reviews = load();
      const r = reviews.find((x) => x.id === id);
      if (r) { r.helpful = (r.helpful || 0) + 1; save(reviews); render(); }
    } else if (e.target.closest(".review-edit")) {
      openEdit(id);
    } else if (e.target.closest(".review-delete")) {
      save(load().filter((r) => r.id !== id));
      render();
    }
  });

  seedIfEmpty();
  render();
  window.GizaReviews = { addReview };
});

document.addEventListener("DOMContentLoaded", () => {
  const firstInput = $("firstNameInput");
  const lastInput = $("lastNameInput");
  const nameEl = $("sidebar-user-name");
  if (!nameEl || (!firstInput && !lastInput)) return;

  const saved = { first: lsGet("giza_first_name", null), last: lsGet("giza_last_name", null) };
  if (firstInput && saved.first !== null) firstInput.value = saved.first;
  if (lastInput && saved.last !== null) lastInput.value = saved.last;

  function syncName() {
    nameEl.textContent = [firstInput && firstInput.value.trim(), lastInput && lastInput.value.trim()].filter(Boolean).join(" ");
    if (firstInput) lsSet("giza_first_name", firstInput.value);
    if (lastInput) lsSet("giza_last_name", lastInput.value);
  }
  if (firstInput) firstInput.addEventListener("input", syncName);
  if (lastInput) lastInput.addEventListener("input", syncName);
  syncName();
});

document.addEventListener("DOMContentLoaded", () => {
  const fileInput = $("avatar-file-input");
  const profileImg = $("profile-avatar");
  const sidebarImg = $("sidebar-avatar");
  if (!fileInput) return;

  const apply = (src) => { if (profileImg) profileImg.src = src; if (sidebarImg) sidebarImg.src = src; };
  const saved = lsGet("giza_avatar", null);
  if (saved) apply(saved);

  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file || !file.type.startsWith("image/")) { fileInput.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => { apply(reader.result); lsSet("giza_avatar", reader.result); fileInput.value = ""; };
    reader.readAsDataURL(file);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const sel = $("genderSelect");
  const icon = $("genderIcon");
  if (!sel || !icon) return;
  const ICONS = { "": "bi bi-gender-ambiguous", female: "bi bi-gender-female", male: "bi bi-gender-male" };
  const sync = () => (icon.className = ICONS[sel.value] || ICONS[""]);
  sel.addEventListener("change", sync);
  sync();
});

document.addEventListener("DOMContentLoaded", () => {
  const modalEl = $("paymentMethodsModal");
  const typeStep = $("payment-type-step");
  const detailsStep = $("payment-details-step");
  const backBtn = $("payment-back-btn");
  const brandBadge = $("payment-brand-badge");
  const brandName = $("payment-brand-name");
  const cardFields = $("card-fields");
  const walletFields = $("wallet-fields");
  const holderInput = $("payment-holder");
  const numberInput = $("payment-number");
  const expiryInput = $("payment-expiry");
  const cvcInput = $("payment-cvc");
  const emailInput = $("payment-email");
  const errorEl = $("payment-error");
  const saveBtn = $("save-payment-btn");
  const savedList = $("saved-payments-list");
  if (!modalEl || !typeStep) return;

  const STORAGE_KEY = "giza_payments";
  const DEFAULT_KEY = "giza_default_payment";
  const METHODS = [
    { id: "visa", name: "Visa", badge: "VISA", kind: "card" },
    { id: "mastercard", name: "Mastercard", badge: "MC", kind: "card" },
    { id: "amex", name: "American Express", badge: "AMEX", kind: "card" },
    { id: "discover", name: "Discover", badge: "DISC", kind: "card" },
    { id: "paypal", name: "PayPal", badge: "PayPal", kind: "wallet" },
    { id: "applepay", name: "Apple Pay", badge: " Pay", kind: "wallet" },
    { id: "googlepay", name: "Google Pay", badge: "G Pay", kind: "wallet" },
  ];
  const methodById = (id) => METHODS.find((m) => m.id === id);
  const load = () => lsGet(STORAGE_KEY, []);
  const save = (v) => lsSet(STORAGE_KEY, v);
  const setDefaultId = (id) => lsSet(DEFAULT_KEY, id);
  const getDefaultId = (list) => {
    const saved = lsGet(DEFAULT_KEY, null);
    return saved && list.some((p) => p.id === saved) ? saved : list.length ? list[0].id : null;
  };
  let selected = null;

  function seedIfEmpty() {
    try { if (localStorage.getItem(STORAGE_KEY) !== null) return; } catch (_) { return; }
    save([
      { id: "seed-p1", methodId: "visa", label: "Visa .... 1316", sub: "", expiry: "06/2022" },
      { id: "seed-p2", methodId: "mastercard", label: "MasterCard .... 2410", sub: "", expiry: "07/2022" },
    ]);
    setDefaultId("seed-p1");
  }

  function brandMark(methodId) {
    if (methodId === "visa")
      return `<span class="fst-italic fw-bold flex-shrink-0" style="color:#1A1F71;font-size:15px;letter-spacing:1px;min-width:52px;">VISA</span>`;
    if (methodId === "mastercard")
      return `<span class="d-inline-flex align-items-center flex-shrink-0" style="min-width:52px;">
        <span class="rounded-circle d-inline-block" style="width:22px;height:22px;background:#EB001B;"></span><span class="rounded-circle d-inline-block" style="width:22px;height:22px;background:#F79E1B;margin-left:-9px;"></span>
      </span>`;
    if (methodId === "amex")
      return `<span class="badge text-white flex-shrink-0" style="background:#2E77BC;min-width:52px;">AMEX</span>`;
    const m = methodById(methodId);
    return `<span class="badge bg-light text-dark border flex-shrink-0" style="min-width:52px;">${esc(m ? m.badge : "CARD")}</span>`;
  }

  const expiryDisplay = (mmYY) => {
    const m = String(mmYY || "").match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
    return m ? `${m[1]}/20${m[2]}` : "";
  };

  function renderTypes() {
    typeStep.innerHTML = METHODS.map(
      (m) => `
      <button type="button" class="btn btn-outline-secondary rounded-3 px-3 py-2 d-flex align-items-center gap-3 text-start" data-method-id="${m.id}">
        <span class="badge bg-light text-dark border">${esc(m.badge)}</span>
        <span class="fw-medium small text-dark">${esc(m.name)}</span>
        <i class="bi bi-chevron-right ms-auto text-muted"></i>
      </button>`
    ).join("");
  }

  function showStep(which) {
    const isTypes = which === "types";
    typeStep.classList.toggle("d-none", !isTypes);
    detailsStep.classList.toggle("d-none", isTypes);
    saveBtn.classList.toggle("d-none", isTypes);
    errorEl.classList.add("d-none");
  }

  function openDetails(methodId) {
    selected = methodById(methodId);
    if (!selected) return;
    brandBadge.textContent = selected.badge;
    brandName.textContent = selected.name;
    const isCard = selected.kind === "card";
    cardFields.classList.toggle("d-none", !isCard);
    walletFields.classList.toggle("d-none", isCard);
    showStep("details");
  }

  function resetModal() {
    selected = null;
    [holderInput, numberInput, expiryInput, cvcInput, emailInput].forEach((i) => i && (i.value = ""));
    showStep("types");
  }

  const validCard = () => {
    const digits = numberInput.value.replace(/\D/g, "");
    return (
      holderInput.value.trim().length >= 2 &&
      digits.length >= 12 &&
      digits.length <= 19 &&
      /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryInput.value.trim()) &&
      /^[0-9]{3,4}$/.test(cvcInput.value.trim())
    );
  };

  function handleSave() {
    if (!selected) return;
    let entry;
    if (selected.kind === "card") {
      if (!validCard()) { errorEl.classList.remove("d-none"); return; }
      const digits = numberInput.value.replace(/\D/g, "");
      entry = {
        id: "p-" + Date.now(),
        methodId: selected.id,
        label: `${selected.name} .... ${digits.slice(-4)}`,
        sub: holderInput.value.trim(),
        expiry: expiryDisplay(expiryInput.value.trim()),
      };
    } else {
      const email = emailInput.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errorEl.classList.remove("d-none"); return; }
      entry = { id: "p-" + Date.now(), methodId: selected.id, label: selected.name, sub: email };
    }
    const list = load();
    list.unshift(entry);
    save(list);
    try { if (!localStorage.getItem(DEFAULT_KEY)) setDefaultId(entry.id); } catch (_) {}
    renderSaved();
    modalOf(modalEl).hide();
  }

  function renderSaved() {
    if (!savedList) return;
    const list = load();
    const defaultId = getDefaultId(list);
    savedList.innerHTML = list
      .map((p) => {
        const isDefault = p.id === defaultId;
        const subLine = p.expiry ? `Expiration: ${esc(p.expiry)}` : p.sub ? esc(p.sub) : "";
        return `
        <div class="d-flex align-items-center gap-3 py-3 border-bottom" data-payment-id="${esc(p.id)}">
          ${brandMark(p.methodId)}
          <div style="min-width:0;">
            <p class="mb-0 small">
              <span class="fw-semibold text-dark">${esc(p.label)}</span>
              ${isDefault ? `<span class="badge bg-light text-muted border ms-2" style="font-size:10px;">DEFAULT</span>` : ""}
            </p>
            ${subLine ? `<p class="text-muted mb-0" style="font-size:11px;">${subLine}</p>` : ""}
          </div>
          <div class="dropdown ms-auto">
            <button class="btn btn-link text-dark text-decoration-none p-0" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Payment options">
              <i class="bi bi-three-dots"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow border-0 rounded-3">
              ${isDefault ? "" : `<li><button class="dropdown-item small payment-set-default" type="button">Set as default</button></li>`}
              <li><button class="dropdown-item small payment-delete" type="button">Delete</button></li>
            </ul>
          </div>
        </div>`;
      })
      .join("");
  }

  numberInput.addEventListener("input", () => {
    numberInput.value = numberInput.value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
  });
  expiryInput.addEventListener("input", () => {
    const d = expiryInput.value.replace(/\D/g, "").slice(0, 4);
    expiryInput.value = d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  });
  cvcInput.addEventListener("input", () => { cvcInput.value = cvcInput.value.replace(/\D/g, "").slice(0, 4); });

  typeStep.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-method-id]");
    if (btn) openDetails(btn.dataset.methodId);
  });
  backBtn.addEventListener("click", () => showStep("types"));
  saveBtn.addEventListener("click", handleSave);
  modalEl.addEventListener("hidden.bs.modal", resetModal);

  if (savedList) {
    savedList.addEventListener("click", (e) => {
      const row = e.target.closest("[data-payment-id]");
      if (!row) return;
      if (e.target.closest(".payment-set-default")) {
        setDefaultId(row.dataset.paymentId);
        renderSaved();
      } else if (e.target.closest(".payment-delete")) {
        const remaining = load().filter((p) => p.id !== row.dataset.paymentId);
        save(remaining);
        try {
          if (localStorage.getItem(DEFAULT_KEY) === row.dataset.paymentId) {
            if (remaining.length) setDefaultId(remaining[0].id);
            else localStorage.removeItem(DEFAULT_KEY);
          }
        } catch (_) {}
        renderSaved();
      }
    });
  }

  seedIfEmpty();
  renderTypes();
  renderSaved();
  resetModal();
});

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = $("trips-toggle-btn");
  const submenu = $("trips-submenu");
  const chevron = $("trips-chevron");
  const filterBtns = qa(".trip-filter-btn");
  const listEl = $("trips-list");
  const emptyEl = $("trips-empty");
  const subtitleEl = $("trips-subtitle");
  const countBadge = $("trips-count-badge");
  if (!toggleBtn || !submenu) return;

  const TRIPS = jsonScript("trips-data", []);
  let currentFilter = "active";

  const FILTER_TITLES = {
    all: "All Reservations",
    active: "Active Reservations",
    completed: "Completed Reservations",
    canceled: "Canceled Reservations",
  };
  const FILTER_SUBTITLES = {
    all: "View and manage all your bookings here.",
    active: "View and manage your current bookings here.",
    completed: "View your past bookings here.",
    canceled: "View your canceled bookings here.",
  };
  const bookingBadge = (s) =>
    s === "confirmed"
      ? "badge rounded-pill bg-success-subtle text-success border border-success-subtle"
      : s === "pending"
      ? "badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle"
      : s === "completed"
      ? "badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle"
      : "badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle";
  const bookingLabel = (s) =>
    s === "confirmed" ? "Confirmed" : s === "pending" ? "Pending" : s === "completed" ? "Completed" : "Canceled";

  const listView = $("trips-list-view");
  const detailsView = $("trip-details-view");
  const showList = () => { listView.classList.remove("d-none"); detailsView.classList.add("d-none"); };
  const showDetails = () => { listView.classList.add("d-none"); detailsView.classList.remove("d-none"); };

  function paintFilters() {
    filterBtns.forEach((btn) => {
      const on = btn.dataset.tripFilter === currentFilter;
      btn.classList.toggle("text-primary", on);
      btn.classList.toggle("fw-semibold", on);
      btn.classList.toggle("border-primary", on);
      btn.classList.toggle("text-secondary", !on);
      if (on) btn.style.removeProperty("border-color");
      else btn.style.setProperty("border-color", "transparent", "important");
    });
  }

  function renderTrips() {
    showList();
    const trips = TRIPS.filter((t) => currentFilter === "all" || t.tripStatus === currentFilter);
    $("trips-title").textContent = FILTER_TITLES[currentFilter] || "Trips";
    subtitleEl.textContent = FILTER_SUBTITLES[currentFilter] || "";
    countBadge.textContent = `${trips.length} trip${trips.length === 1 ? "" : "s"}`;
    emptyEl.classList.toggle("d-none", trips.length > 0);
    listEl.innerHTML = trips
      .map(
        (t) => `
        <div class="d-flex gap-3 py-3 border-bottom" data-trip-id="${esc(t.id)}">
          <img src="${esc(t.img)}" class="rounded-3 object-fit-cover flex-shrink-0" style="width:72px;height:72px;" alt="${esc(t.name)}">
          <div class="flex-grow-1" style="min-width:0;">
            <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
              <p class="fw-semibold small mb-0 text-truncate"><i class="bi bi-building me-1 text-muted"></i>${esc(t.name)}</p>
              <div class="d-flex align-items-center gap-2 flex-shrink-0">
                <span class="${bookingBadge(t.bookingStatus)}" style="font-size:11px;">${bookingLabel(t.bookingStatus)}</span>
                <span class="text-muted" style="font-size:11px;">${esc(t.bookingId)}</span>
              </div>
            </div>
            <div class="d-flex justify-content-between align-items-end gap-2">
              <p class="text-muted mb-0" style="font-size:11px;">Check in: ${esc(t.checkIn)} &nbsp;&nbsp; Check out: ${esc(t.checkOut)} &nbsp;&nbsp; Guests: ${esc(t.guests)}</p>
              <div class="d-flex gap-2 flex-shrink-0">
                ${t.tripStatus === "completed" ? `<button type="button" class="btn btn-link text-warning text-decoration-none p-0 trip-rate-btn" style="font-size:12px;"><i class="bi bi-star-fill me-1"></i>Rate stay</button>` : ""}
                <button type="button" class="btn btn-link text-primary text-decoration-none p-0 trip-details-btn" style="font-size:12px;">Check Details</button>
              </div>
            </div>
          </div>
        </div>`
      )
      .join("");
    paintFilters();
  }

  function renderTripDetails(tripId) {
    const t = TRIPS.find((x) => x.id === tripId);
    if (!t) return;
    const body = $("trip-details-body");
    const priceRows = (t.priceRows || [])
      .map(
        (r) => `
      <div class="d-flex justify-content-between small mb-1">
        <span class="text-secondary">${esc(r.label)}</span>
        <span class="text-dark">${esc(r.value)}</span>
      </div>`
      )
      .join("");
    const amenities = (t.amenities || [])
      .map(
        (a) => `
      <span class="d-inline-flex align-items-center gap-1 text-secondary me-3 mb-2" style="font-size:12px;">
        <i class="bi ${esc(a.icon)}"></i>${esc(a.label)}
      </span>`
      )
      .join("");
    const canCancel = t.bookingStatus === "confirmed" || t.bookingStatus === "pending";
    body.innerHTML = `
      <div class="border rounded-3 p-3 mb-3">
        <div class="d-flex gap-3 flex-wrap">
          <img src="${esc(t.img)}" class="rounded-3 object-fit-cover flex-shrink-0" style="width:90px;height:90px;" alt="${esc(t.name)}">
          <div class="flex-grow-1" style="min-width:200px;">
            <p class="fw-bold small mb-1">${esc(t.name)}</p>
            <p class="text-muted mb-1" style="font-size:11px;">Address: ${esc(t.address)}</p>
            <p class="text-muted mb-1" style="font-size:11px;">Phone: ${esc(t.phone)}</p>
            <p class="text-muted mb-0" style="font-size:11px;">GPS coordinates: ${esc(t.gps)}</p>
          </div>
          <div class="d-flex gap-3 text-center ms-auto">
            <div>
              <p class="text-muted mb-0" style="font-size:11px;">Check-In</p>
              <p class="fw-bold h4 mb-0">${esc(t.cinDay)}</p>
              <p class="small mb-1">${esc(t.cinMonth)}</p>
              <p class="text-muted mb-0" style="font-size:11px;"><i class="bi bi-clock me-1"></i>${esc(t.cinTime)}</p>
            </div>
            <div class="vr"></div>
            <div>
              <p class="text-muted mb-0" style="font-size:11px;">Check-Out</p>
              <p class="fw-bold h4 mb-0">${esc(t.coutDay)}</p>
              <p class="small mb-1">${esc(t.coutMonth)}</p>
              <p class="text-muted mb-0" style="font-size:11px;"><i class="bi bi-clock me-1"></i>${esc(t.coutTime)}</p>
            </div>
            <div class="vr"></div>
            <div>
              <span class="${bookingBadge(t.bookingStatus)}" style="font-size:11px;">${bookingLabel(t.bookingStatus)}</span>
              <p class="text-muted mt-2 mb-0" style="font-size:11px;">Rooms &nbsp;&nbsp; Nights</p>
              <p class="fw-bold mb-0">${esc(t.rooms)} <span class="text-muted fw-normal">/</span> ${esc(t.nights)}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3 mb-3">
        <div class="col-md-7">
          <p class="fw-bold small mb-1">About this property</p>
          <p class="text-muted mb-2" style="font-size:12px;">${esc(t.bedsLine)}</p>
          <p class="text-secondary" style="font-size:12px;">${esc(t.about)}</p>
        </div>
        <div class="col-md-5">
          <iframe src="${esc(t.mapEmbed)}" class="w-100 rounded-3 border" style="height:170px;" loading="lazy" title="Property map"></iframe>
        </div>
      </div>

      <p class="fw-bold small mb-2">Price</p>
      ${priceRows}
      <div class="d-flex justify-content-between fw-bold small mb-3">
        <span>Total Price</span><span>${esc(t.totalPrice)}</span>
      </div>

      <p class="small mb-1"><strong>Guest name:</strong> ${esc(t.guestName)} / ${esc(t.maxGuests)}</p>
      <p class="text-secondary mb-3" style="font-size:12px;"><strong class="text-dark">Meal Plan:</strong> ${esc(t.mealPlan)}</p>

      <div class="mb-3">${amenities}</div>

      <div id="trip-review-section" class="border rounded-3 p-3 mb-3 bg-light">
        <p class="fw-bold small mb-1">Rate your stay</p>
        <div id="trip-review-box"></div>
      </div>

      <div class="d-flex justify-content-end gap-2">
        ${canCancel ? `<button type="button" id="cancel-booking-btn" class="btn btn-outline-secondary rounded-3 px-3 small">Cancel Booking</button>` : ""}
        <button type="button" id="download-invoice-btn" class="btn btn-outline-primary rounded-3 px-3 small">
          <i class="bi bi-download me-1"></i>Download Invoice
        </button>
      </div>`;
    showDetails();
    renderTripReviewBox(t);

    const cancelBtn = $("cancel-booking-btn");
    if (cancelBtn)
      cancelBtn.addEventListener("click", () => {
        if (!confirm(`Cancel booking ${t.bookingId} at ${t.name}?`)) return;
        t.bookingStatus = "canceled";
        t.tripStatus = "canceled";
        renderTripDetails(t.id);
      });
    $("download-invoice-btn").addEventListener("click", () => downloadInvoice(t));
  }

  function downloadInvoice(t) {
    const lines = [
      "GizaStay - Booking Invoice",
      "==============================",
      `Hotel: ${t.name}`,
      `Booking: ${t.bookingId}`,
      `Status: ${bookingLabel(t.bookingStatus)}`,
      `Address: ${t.address}`,
      `Check-In: ${t.cinDay} ${t.cinMonth} (${t.cinTime})`,
      `Check-Out: ${t.coutDay} ${t.coutMonth} (${t.coutTime})`,
      `Rooms: ${t.rooms} / Nights: ${t.nights}`,
      `Guest: ${t.guestName} (${t.maxGuests})`,
      "------------------------------",
      ...(t.priceRows || []).map((r) => `${r.label}: ${r.value}`),
      `TOTAL: ${t.totalPrice}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Invoice-${String(t.bookingId).replace(/\s+/g, "")}.txt`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  const stripVia = (n) => String(n || "").replace(/^via\s+/i, "").trim().toLowerCase();
  const findTripReview = (name) => lsGet("giza_reviews_v2", []).find((r) => stripVia(r.property) === stripVia(name)) || null;

  function renderTripReviewBox(t) {
    const box = $("trip-review-box");
    const section = $("trip-review-section");
    if (!box) return;
    if (t.tripStatus !== "completed") {
      if (section) section.classList.add("d-none");
      return;
    }
    if (section) section.classList.remove("d-none");

    const existing = findTripReview(t.name);
    if (existing) {
      box.innerHTML = `
        <div class="d-flex align-items-center gap-2 mb-1">
          <span class="badge bg-primary-subtle text-primary border border-primary-subtle fw-bold">${Number(existing.score).toFixed(1)}</span>
          <span class="badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle" style="font-size:11px;">Review Pending</span>
        </div>
        ${existing.liked ? `<p class="small mb-1"><i class="bi bi-emoji-smile text-primary me-1"></i>${esc(existing.liked)}</p>` : ""}
        ${existing.disliked ? `<p class="small mb-2"><i class="bi bi-emoji-neutral text-muted me-1"></i>${esc(existing.disliked)}</p>` : ""}
        <button type="button" id="trip-review-view-btn" class="btn btn-outline-primary rounded-3 px-3 small">View in Reviews</button>`;
      $("trip-review-view-btn").addEventListener("click", () => gotoTab("reviews-content"));
      return;
    }

    box.innerHTML = `
      <p class="text-secondary small mb-2">How was <strong>${esc(t.name)}</strong>? Your rating will appear in Reviews.</p>
      <label class="form-label fw-semibold text-secondary small d-flex justify-content-between">
        <span>Your score (1 - 10)</span><span id="tripReviewScoreVal" class="fw-bold text-dark">7.0</span>
      </label>
      <input type="range" id="tripReviewScore" class="form-range mb-2" min="1" max="10" step="0.5" value="7">
      <label class="form-label fw-semibold text-secondary small">What was good?</label>
      <textarea id="tripReviewLiked" class="form-control rounded-3 px-3 mb-2" rows="2" placeholder="e.g. Great location and staff..." maxlength="500"></textarea>
      <label class="form-label fw-semibold text-secondary small">What wasn't good? <span class="fw-normal">(optional)</span></label>
      <textarea id="tripReviewDisliked" class="form-control rounded-3 px-3 mb-2" rows="2" placeholder="e.g. Noisy at night..." maxlength="500"></textarea>
      <div id="tripReviewError" class="text-danger small mt-1 d-none">Please add at least one comment.</div>
      <button type="button" id="tripReviewSubmit" class="btn btn-primary rounded-3 px-4 small mt-1">Submit review</button>`;

    const scoreInput = $("tripReviewScore");
    const scoreVal = $("tripReviewScoreVal");
    scoreInput.addEventListener("input", () => { scoreVal.textContent = Number(scoreInput.value).toFixed(1); });
    $("tripReviewSubmit").addEventListener("click", () => {
      const liked = $("tripReviewLiked").value.trim();
      const disliked = $("tripReviewDisliked").value.trim();
      const score = Number(scoreInput.value);
      if ((!liked && !disliked) || !(score >= 1 && score <= 10)) {
        $("tripReviewError").classList.remove("d-none");
        return;
      }
      if (window.GizaReviews) window.GizaReviews.addReview("Via " + t.name, score, liked, disliked, { img: t.img });
      renderTripReviewBox(t);
      const ok = document.createElement("p");
      ok.className = "text-success small fw-semibold mt-2 mb-0";
      ok.textContent = "Review submitted — it now appears in Reviews.";
      box.appendChild(ok);
    });
  }

  toggleBtn.addEventListener("click", () => {
    const open = submenu.classList.toggle("d-none") === false;
    if (chevron) {
      chevron.classList.toggle("bi-chevron-down", !open);
      chevron.classList.toggle("bi-chevron-up", open);
    }
    renderTrips();
  });

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      currentFilter = btn.dataset.tripFilter;
      submenu.classList.remove("d-none");
      if (chevron) { chevron.classList.remove("bi-chevron-down"); chevron.classList.add("bi-chevron-up"); }
      gotoTab("trips-content");
      renderTrips();
    });
  });

  listEl.addEventListener("click", (e) => {
    const row = e.target.closest("[data-trip-id]");
    if (!row) return;
    if (e.target.closest(".trip-rate-btn")) {
      renderTripDetails(row.dataset.tripId);
      const section = $("trip-review-section");
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (e.target.closest(".trip-details-btn")) {
      renderTripDetails(row.dataset.tripId);
    }
  });

  const backBtn = $("back-to-trips");
  if (backBtn) backBtn.addEventListener("click", renderTrips);

  renderTrips();
});

document.addEventListener("DOMContentLoaded", () => {
  const recsToggle = $("recommendations-toggle");
  if (recsToggle) {
    const saved = lsGet("giza_recommendations", null);
    recsToggle.checked = saved === null ? true : saved === "1" || saved === 1 || saved === true;
    recsToggle.addEventListener("change", () => lsSet("giza_recommendations", recsToggle.checked ? "1" : "0"));
  }

  const confirmDelBtn = $("confirmDeleteAccount");
  if (confirmDelBtn)
    confirmDelBtn.addEventListener("click", () => {
      try {
        Object.keys(localStorage)
          .filter((k) => k.startsWith("giza_") || k.startsWith("gizastay_"))
          .forEach((k) => localStorage.removeItem(k));
      } catch (_) {}
      location.href = "index.html";
    });
});
