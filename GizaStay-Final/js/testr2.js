const $ = (id) => document.getElementById(id);
const qa = (s) => Array.from(document.querySelectorAll(s));
const modalOf = (el) => bootstrap.Modal.getOrCreateInstance(el);
var esc = (s) =>
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
function paintSidebar(target) {
  qa(".sidebar-btn").forEach((btn) => {
    const on = btn.dataset.target === target;
    btn.classList.toggle("bg-primary-subtle", on);
    btn.classList.toggle("text-primary", on);
    btn.classList.toggle("text-secondary", !on);
  });
}
function showTab(id) {
  qa(".tab-content-item").forEach((c) => c.classList.add("d-none"));
  const el = $(id);
  if (el) el.classList.remove("d-none");
}
function gotoTab(contentId) { showTab(contentId); paintSidebar(contentId); }

document.addEventListener("DOMContentLoaded", () => {
  const sidebarButtons = qa(".sidebar-btn");
  const tabContents = qa(".tab-content-item");

  sidebarButtons.forEach((button) => {
    button.addEventListener("click", () => {
      paintSidebar(button.dataset.target);
      tabContents.forEach((content) => content.classList.add("d-none"));
      const targetContent = document.getElementById(button.getAttribute("data-target"));
      if (targetContent) targetContent.classList.remove("d-none");
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const emptyEl = $("wishlist-empty");
  const gridEl = $("wishlist-grid");
  const rowEl = $("wishlist-row");
  const startSearchBtn = $("start-search-btn");

  if (!emptyEl || !gridEl || !rowEl) return;

  if (startSearchBtn)
    startSearchBtn.addEventListener("click", () => { location.href = "searchgrid.html"; });

  function getFavoriteIds() {
    try { return JSON.parse(localStorage.getItem("gizastay_favorites") || "[]"); } catch (_) { return []; }
  }
  function setFavoriteIds(ids) {
    try { localStorage.setItem("gizastay_favorites", JSON.stringify(ids)); } catch (_) {}
  }
  function hotelCard(hotel) {
    return `
      <div class="col-12 col-md-4" data-hotel-id="${hotel.id}">
        <div class="rounded-4 overflow-hidden mb-2 shadow-sm position-relative" style="height: 200px;">
          <img src="${hotel.image}" class="w-100 h-100 object-fit-cover" alt="${esc(hotel.name)}">
          <button type="button" class="btn btn-light rounded-circle position-absolute top-0 end-0 m-2 wishlist-remove-btn" data-hotel-id="${hotel.id}" style="width:34px;height:34px;" aria-label="Remove from wishlist">
            <i class="bi bi-heart-fill text-danger"></i>
          </button>
        </div>
        <h6 class="fw-bold text-dark mb-0">${esc(hotel.name)}</h6>
        <span class="text-secondary small">${esc(hotel.location)} · $${hotel.price}/night</span>
        <a href="details.html?id=${encodeURIComponent(hotel.id)}" class="stretched-link"></a>
      </div>
    `;
  }
  function renderWishlist() {
    const ids = getFavoriteIds();
    const hotels = (window.GIZASTAY_HOTELS || []).filter((h) => ids.includes(h.id));
    if (!hotels.length) {
      emptyEl.classList.remove("d-none");
      gridEl.classList.add("d-none");
      return;
    }
    emptyEl.classList.add("d-none");
    gridEl.classList.remove("d-none");
    rowEl.innerHTML = hotels.map(hotelCard).join("");
    rowEl.querySelectorAll(".wishlist-remove-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.dataset.hotelId;
        setFavoriteIds(getFavoriteIds().filter((x) => x !== id));
        renderWishlist();
      });
    });
  }
  renderWishlist();
  window.GizaWishlist = { render: renderWishlist };
});
document.addEventListener("DOMContentLoaded", () => {
  const listEl = $("reviews-list");
  const emptyEl = $("reviews-empty");
  const writeBtn = $("write-review-btn");
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

  function imgFor(property) {
    const key = String(property || "").trim().toLowerCase();
    return HOTEL_IMGS[key] || HOTEL_IMGS["default"];
  }
  function labelFor(score) {
    const s = Number(score);
    if (s >= 9) return "Exceptional";
    if (s >= 8) return "Excellent";
    if (s >= 7) return "Good";
    if (s >= 5) return "Average";
    if (s >= 3) return "Poor";
    return "Very poor";
  }
  function statusLabel(status) {
    if (status === "posted") return "Review posted";
    if (status === "rejected") return "Review rejected";
    return "Review Pending";
  }

  function seedIfEmpty() {
    try { if (localStorage.getItem(STORAGE_KEY) !== null) return; } catch (_) { return; }
    const seed = [
      {
        id: "seed-1",
        property: "Via Golden Tulip Hotel",
        img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=300&q=80",
        date: "24 Oct 2024",
        score: 3.0,
        status: "posted",
        liked: "The receptionist was a god guy.",
        disliked: "It doesn't have any daily cleaning or towel changing. It doesn't have any liquid soap; it was empty. The kitchen didn't have any dishwashing liquid.",
        helpful: 2,
        response: "Hi Anna, we are very sorry for this feedback. Our property is a short-let house, not a hotel. Therefore, daily cleaning and towel changes are not foreseen in this type of short let. Probably, if you had kept this distinction in mind, you would not have judged your experience so harshly, and please forgive us for any misunderstanding. In any case, advice from our guests is always welcome. We thank you for choosing us!",
      },
      {
        id: "seed-2",
        property: "Via Forest Whisper Cabin",
        img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=300&q=80",
        date: "24 Jul 2023",
        score: 3.0,
        status: "rejected",
        liked: "Nothing was good. It was my worth experience.",
        disliked: "It doesn't have any daily cleaning or towel changing. It doesn't have any liquid soap; it was empty. The kitchen didn't have any dishwashing liquid.",
        helpful: 0,
        response: "",
      },
      {
        id: "seed-3",
        property: "Via Golden Tulip Hotel",
        img: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=300&q=80",
        date: "24 Jul 2023",
        score: 7.0,
        status: "pending",
        liked: "Nothing was good. It was my worth experience.",
        disliked: "",
        helpful: 77,
        response: "",
      },
    ];
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(seed)); } catch (_) {}
  }

  const load = () => lsGet(STORAGE_KEY, []);
  const save = (v) => lsSet(STORAGE_KEY, v);
  function statusBadgeClass(status) {
    if (status === "posted") return "badge rounded-pill bg-success-subtle text-success border border-success-subtle";
    if (status === "rejected") return "badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle";
    return "badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle";
  }

  function render() {
    const reviews = load();
    listEl.innerHTML = "";
    if (reviews.length === 0) {
      emptyEl.classList.remove("d-none");
    } else {
      emptyEl.classList.add("d-none");
      reviews.forEach((r) => {
        const card = document.createElement("div");
        card.className = "d-flex gap-3 border rounded-4 bg-white p-3 shadow-sm";
        card.dataset.reviewId = r.id;
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
        card.innerHTML = `
          <img src="${esc(r.img || imgFor(r.property))}" class="rounded-3 object-fit-cover flex-shrink-0" style="width:105px;height:120px;" alt="${esc(r.property)}">
          <div class="flex-grow-1 min-vw-0" style="min-width:0;">
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
          </div>`;
        listEl.appendChild(card);
      });
    }
  }

  function resetForm() {
    editingId = null;
    const modalTitle = modalEl ? modalEl.querySelector("#reviewModalLabel") : null;
    if (modalTitle) modalTitle.textContent = "Write a review";
    if (submitBtn) submitBtn.textContent = "Submit review";
    if (propInput) propInput.value = "";
    if (scoreInput) scoreInput.value = "7";
    if (scoreVal) scoreVal.textContent = "7.0";
    if (likedInput) likedInput.value = "";
    if (dislikedInput) dislikedInput.value = "";
    if (errorEl) errorEl.classList.add("d-none");
  }

  function addReview(property, score, liked, disliked = "", opts = {}) {
    const reviews = load();
    const review = {
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
    };
    reviews.unshift(review);
    save(reviews);
    render();
    document.dispatchEvent(new CustomEvent("giza:review-added", { detail: review }));
    return review.id;
  }

  function updateReview(id, property, score, liked, disliked = "") {
    const reviews = load();
    const r = reviews.find((x) => x.id === id);
    if (!r) return false;
    r.property = String(property).trim();
    r.img = imgFor(r.property);
    r.score = Number(score);
    r.liked = String(liked || "").trim();
    r.disliked = String(disliked || "").trim();
    save(reviews);
    render();
    document.dispatchEvent(new CustomEvent("giza:review-updated", { detail: r }));
    return true;
  }

  function openEdit(id) {
    const r = load().find((x) => x.id === id);
    if (!r || !modalEl) return;
    editingId = id;
    const modalTitle = modalEl.querySelector("#reviewModalLabel");
    if (modalTitle) modalTitle.textContent = "Edit review";
    if (submitBtn) submitBtn.textContent = "Save changes";
    if (propInput) propInput.value = r.property || "";
    if (scoreInput) scoreInput.value = r.score || 7;
    if (scoreVal) scoreVal.textContent = Number(r.score || 7).toFixed(1);
    if (likedInput) likedInput.value = r.liked || "";
    if (dislikedInput) dislikedInput.value = r.disliked || "";
    if (errorEl) errorEl.classList.add("d-none");
    modalOf(modalEl).show();
  }

  if (scoreInput && scoreVal) {
    scoreInput.addEventListener("input", () => { scoreVal.textContent = Number(scoreInput.value).toFixed(1); });
  }

  if (writeBtn && modalEl) {
    const modal = modalOf(modalEl);
    writeBtn.addEventListener("click", () => { resetForm(); modal.show(); });
    modalEl.addEventListener("hidden.bs.modal", resetForm);

    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        const prop = propInput ? propInput.value.trim() : "";
        const liked = likedInput ? likedInput.value.trim() : "";
        const disliked = dislikedInput ? dislikedInput.value.trim() : "";
        const score = scoreInput ? Number(scoreInput.value) : 7;
        if (!prop || (!liked && !disliked) || !(score >= 1 && score <= 10)) {
          if (errorEl) errorEl.classList.remove("d-none");
          return;
        }
        if (editingId) updateReview(editingId, prop, score, liked, disliked);
        else addReview(prop, score, liked, disliked);
        modal.hide();
      });
    }
  }

  listEl.addEventListener("click", (e) => {
    const helpfulBtn = e.target.closest(".review-helpful");
    if (helpfulBtn) {
      const card = helpfulBtn.closest("[data-review-id]");
      const reviews = load();
      const r = reviews.find((x) => x.id === (card && card.dataset.reviewId));
      if (r) { r.helpful = (r.helpful || 0) + 1; save(reviews); render(); }
      return;
    }
    const editBtn = e.target.closest(".review-edit");
    if (editBtn) {
      const card = editBtn.closest("[data-review-id]");
      if (card) openEdit(card.dataset.reviewId);
      return;
    }
    const del = e.target.closest(".review-delete");
    if (!del) return;
    const card = del.closest("[data-review-id]");
    if (!card) return;
    save(load().filter((r) => r.id !== card.dataset.reviewId));
    render();
  });

  seedIfEmpty();
  render();

  window.GizaReviews = {
    addReview,
    updateReview,
    openEdit,
    getReviews: () => load(),
    render,
    openModal: () => { if (modalEl) modalOf(modalEl).show(); },
  };
});
document.addEventListener("DOMContentLoaded", () => {
  const firstInput = $("firstNameInput");
  const lastInput = $("lastNameInput");
  const nameEl = $("sidebar-user-name");

  const FIRST_KEY = "giza_first_name";
  const LAST_KEY = "giza_last_name";

  if (!nameEl || (!firstInput && !lastInput)) return;
  try {
    const savedFirst = localStorage.getItem(FIRST_KEY);
    const savedLast = localStorage.getItem(LAST_KEY);
    if (firstInput && savedFirst !== null) firstInput.value = savedFirst;
    if (lastInput && savedLast !== null) lastInput.value = savedLast;
  } catch (_) {}

  function syncName() {
    const first = firstInput ? firstInput.value.trim() : "";
    const last = lastInput ? lastInput.value.trim() : "";
    nameEl.textContent = [first, last].filter(Boolean).join(" ");
    try {
      if (firstInput) localStorage.setItem(FIRST_KEY, firstInput.value);
      if (lastInput) localStorage.setItem(LAST_KEY, lastInput.value);
    } catch (_) {}
  }

  if (firstInput) firstInput.addEventListener("input", syncName);
  if (lastInput) lastInput.addEventListener("input", syncName);

  syncName();
});
document.addEventListener("DOMContentLoaded", () => {
  const editBtn = $("edit-avatar-btn");
  const fileInput = $("avatar-file-input");
  const profileImg = $("profile-avatar");
  const sidebarImg = $("sidebar-avatar");

  const STORAGE_KEY = "giza_avatar";

  function applyAvatar(src) {
    if (profileImg) profileImg.src = src;
    if (sidebarImg) sidebarImg.src = src;
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) applyAvatar(saved);
  } catch (_) {}

  if (!editBtn || !fileInput) return;

  editBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { fileInput.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => {
      applyAvatar(reader.result);
      try { localStorage.setItem(STORAGE_KEY, reader.result); } catch (_) {}
      fileInput.value = "";
    };
    reader.readAsDataURL(file);
  });

  window.GizaAvatar = {
    set: applyAvatar,
    get: () => (profileImg ? profileImg.src : ""),
  };
});
document.addEventListener("DOMContentLoaded", () => {
  const genderSelect = $("genderSelect");
  const genderIcon = $("genderIcon");

  if (!genderSelect || !genderIcon) return;

  const ICONS = { "": "bi bi-gender-ambiguous", female: "bi bi-gender-female", male: "bi bi-gender-male" };

  function syncGenderIcon() { genderIcon.className = ICONS[genderSelect.value] || ICONS[""]; }

  genderSelect.addEventListener("change", syncGenderIcon);

  syncGenderIcon();
});
document.addEventListener("DOMContentLoaded", () => {
  const openBtn = $("add-payment-btn");
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

  if (!openBtn || !modalEl || !typeStep) return;

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

  function seedIfEmpty() {
    try { if (localStorage.getItem(STORAGE_KEY) !== null) return; } catch (_) { return; }
    const seed = [
      { id: "seed-p1", methodId: "visa", label: "Visa .... 1316", sub: "", expiry: "06/2022" },
      { id: "seed-p2", methodId: "mastercard", label: "MasterCard .... 2410", sub: "", expiry: "07/2022" },
    ];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      localStorage.setItem(DEFAULT_KEY, "seed-p1");
    } catch (_) {}
  }

  function getDefaultId(list) {
    const saved = lsGet(DEFAULT_KEY, null);
    if (saved && list.some((p) => p.id === saved)) return saved;
    return list.length ? list[0].id : null;
  }
  const setDefaultId = (id) => lsSet(DEFAULT_KEY, id);

  let selected = null;

  const load = () => lsGet(STORAGE_KEY, []);
  const save = (v) => lsSet(STORAGE_KEY, v);
  function methodById(id) { return METHODS.find((m) => m.id === id); }

  function brandMark(methodId) {
    if (methodId === "visa") {
      return `<span class="fst-italic fw-bold flex-shrink-0" style="color:#1A1F71;font-size:15px;letter-spacing:1px;min-width:52px;">VISA</span>`;
    }
    if (methodId === "mastercard") {
      return `<span class="d-inline-flex align-items-center flex-shrink-0" style="min-width:52px;">
        <span class="rounded-circle d-inline-block" style="width:22px;height:22px;background:#EB001B;"></span><span class="rounded-circle d-inline-block" style="width:22px;height:22px;background:#F79E1B;margin-left:-9px;"></span>
      </span>`;
    }
    if (methodId === "amex") {
      return `<span class="badge text-white flex-shrink-0" style="background:#2E77BC;min-width:52px;">AMEX</span>`;
    }
    const m = methodById(methodId);
    return `<span class="badge bg-light text-dark border flex-shrink-0" style="min-width:52px;">${esc(m ? m.badge : "CARD")}</span>`;
  }

  function expiryDisplay(mmYY) {
    const m = String(mmYY || "").match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
    if (!m) return "";
    return `${m[1]}/20${m[2]}`;
  }

  function renderTypes() {
    typeStep.innerHTML = "";
    METHODS.forEach((m) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-outline-secondary rounded-3 px-3 py-2 d-flex align-items-center gap-3 text-start";
      btn.dataset.methodId = m.id;
      btn.innerHTML = `
        <span class="badge bg-light text-dark border">${esc(m.badge)}</span>
        <span class="fw-medium small text-dark">${esc(m.name)}</span>
        <i class="bi bi-chevron-right ms-auto text-muted"></i>`;
      typeStep.appendChild(btn);
    });
  }

  function showStep(which) {
    const isTypes = which === "types";
    typeStep.classList.toggle("d-none", !isTypes);
    detailsStep.classList.toggle("d-none", isTypes);
    saveBtn.classList.toggle("d-none", isTypes);
    if (errorEl) errorEl.classList.add("d-none");
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
    if (holderInput) holderInput.value = "";
    if (numberInput) numberInput.value = "";
    if (expiryInput) expiryInput.value = "";
    if (cvcInput) cvcInput.value = "";
    if (emailInput) emailInput.value = "";
    showStep("types");
  }

  function validCard() {
    const digits = numberInput.value.replace(/\D/g, "");
    const expiryOk = /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryInput.value.trim());
    return (
      holderInput.value.trim().length >= 2 &&
      digits.length >= 12 &&
      digits.length <= 19 &&
      expiryOk &&
      /^[0-9]{3,4}$/.test(cvcInput.value.trim())
    );
  }

  function handleSave() {
    if (!selected) return;
    let entry = null;
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
    document.dispatchEvent(new CustomEvent("giza:payment-added", { detail: entry }));
    modalOf(modalEl).hide();
  }

  function renderSaved() {
    if (!savedList) return;
    const list = load();
    const defaultId = getDefaultId(list);
    savedList.innerHTML = "";
    list.forEach((p) => {
      const isDefault = p.id === defaultId;
      const div = document.createElement("div");
      div.className = "d-flex align-items-center gap-3 py-3 border-bottom";
      div.dataset.paymentId = p.id;
      const subLine = p.expiry ? `Expiration: ${esc(p.expiry)}` : p.sub ? esc(p.sub) : "";
      div.innerHTML = `
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
        </div>`;
      savedList.appendChild(div);
    });
  }
  if (numberInput) {
    numberInput.addEventListener("input", () => {
      const digits = numberInput.value.replace(/\D/g, "").slice(0, 16);
      numberInput.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
    });
  }
  if (expiryInput) {
    expiryInput.addEventListener("input", () => {
      let d = expiryInput.value.replace(/\D/g, "").slice(0, 4);
      expiryInput.value = d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
    });
  }
  if (cvcInput) {
    cvcInput.addEventListener("input", () => { cvcInput.value = cvcInput.value.replace(/\D/g, "").slice(0, 4); });
  }

  typeStep.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-method-id]");
    if (btn) openDetails(btn.dataset.methodId);
  });
  if (backBtn) backBtn.addEventListener("click", () => showStep("types"));
  if (saveBtn) saveBtn.addEventListener("click", handleSave);

  const modal = modalOf(modalEl);
  openBtn.addEventListener("click", () => { resetModal(); modal.show(); });
  modalEl.addEventListener("hidden.bs.modal", resetModal);

  if (savedList) {
    savedList.addEventListener("click", (e) => {
      const setBtn = e.target.closest(".payment-set-default");
      if (setBtn) {
        const row = setBtn.closest("[data-payment-id]");
        if (row) { setDefaultId(row.dataset.paymentId); renderSaved(); }
        return;
      }
      const del = e.target.closest(".payment-delete");
      if (!del) return;
      const row = del.closest("[data-payment-id]");
      if (!row) return;
      const remaining = load().filter((p) => p.id !== row.dataset.paymentId);
      save(remaining);
      try {
        if (localStorage.getItem(DEFAULT_KEY) === row.dataset.paymentId) {
          if (remaining.length) localStorage.setItem(DEFAULT_KEY, remaining[0].id);
          else localStorage.removeItem(DEFAULT_KEY);
        }
      } catch (_) {}
      renderSaved();
    });
  }

  seedIfEmpty();
  renderTypes();
  renderSaved();

  window.GizaPayments = {
    getMethods: () => METHODS.slice(),
    getSaved: load,
    renderSaved,
  };
});
document.addEventListener("DOMContentLoaded", () => {
  const birthdayInput = $("birthdayInput");
  const iconWrap = $("birthdayIconWrap");

  if (!birthdayInput || !iconWrap) return;

  iconWrap.addEventListener("click", () => {
    if (typeof birthdayInput.showPicker === "function") birthdayInput.showPicker();
    else birthdayInput.focus();
  });
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

  window.GizaTripsData = window.GizaTripsData || [
    {
      id: "t-1",
      bookingId: "ID 173826",
      name: "Golden Tulip Hotel",
      bookingStatus: "confirmed",
      tripStatus: "active",
      img: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=300&q=80",
      checkIn: "12 Mar 2025",
      checkOut: "24 Mar 2025",
      guests: "4 Adults",
      address: "Marina, 19-21, Ciutat Vella, 08005 Barcelona, Spain",
      phone: "+38 540 979 5428",
      gps: "N 040° 50.963, E 14° 15.348",
      cinDay: "14",
      cinMonth: "August",
      cinTime: "14:00 - 21:00",
      coutDay: "19",
      coutMonth: "August",
      coutTime: "08:00 - 10:00",
      rooms: "15",
      nights: "5",
      bedsLine: "2 guests · Studio · 1 bed · 1.5 baths",
      about: "Welcome to my fully refurbished 17 m² studio, ideally located in Versailles, only a 10-minute walk to the Palace of Versailles and a 5-minute walk to the Rive Gauche train station.",
      mapEmbed: "https://www.openstreetmap.org/export/embed.html?bbox=2.1600%2C41.3600%2C2.2300%2C41.4000&layer=mapnik&marker=41.3800%2C2.1950",
      priceRows: [
        { label: "1 unit", value: "€ 168.55" },
        { label: "10% VAT", value: "€ 16.85" },
        { label: "€ 35 Cleaning fee per stay", value: "€ 35" },
      ],
      totalPrice: "€ 2,560",
      guestName: "Anna George",
      maxGuests: "for max. 2 people",
      mealPlan: "There is no meal included in the rate for this apartment.",
      amenities: [
        { icon: "bi-droplet", label: "Hot tub" },
        { icon: "bi-buildings", label: "City view" },
        { icon: "bi-fan", label: "Air conditioning" },
        { icon: "bi-tv", label: "Tv" },
        { icon: "bi-box-seam", label: "Refrigerator" },
        { icon: "bi-wind", label: "Hair dryer" },
        { icon: "bi-archive", label: "Microwave" },
        { icon: "bi-wifi", label: "Wifi" },
        { icon: "bi-disc", label: "Plates" },
        { icon: "bi-camera-video", label: "Security Cameras" },
        { icon: "bi-cup-hot", label: "Coffee machine" },
        { icon: "bi-stack", label: "Towels" },
        { icon: "bi-layers", label: "Sofa" },
      ],
    },
    {
      id: "t-2",
      bookingId: "ID 173826",
      name: "Grand Seaside Hotel",
      bookingStatus: "pending",
      tripStatus: "active",
      img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=300&q=80",
      checkIn: "12 Mar 2025",
      checkOut: "24 Mar 2025",
      guests: "4 Adults",
      address: "Seaside Promenade 8, 08003 Barcelona, Spain",
      phone: "+34 932 145 678",
      gps: "N 041° 22.100, E 02° 11.340",
      cinDay: "20",
      cinMonth: "August",
      cinTime: "15:00 - 22:00",
      coutDay: "25",
      coutMonth: "August",
      coutTime: "07:00 - 11:00",
      rooms: "8",
      nights: "5",
      bedsLine: "4 guests · Apartment · 2 beds · 2 baths",
      about: "Bright seaside apartment with a large terrace overlooking the marina, a 5-minute walk to the beach and close to local restaurants.",
      mapEmbed: "https://www.openstreetmap.org/export/embed.html?bbox=2.1600%2C41.3600%2C2.2300%2C41.4000&layer=mapnik&marker=41.3750%2C2.1900",
      priceRows: [
        { label: "1 unit", value: "€ 210.00" },
        { label: "10% VAT", value: "€ 21.00" },
        { label: "€ 40 Cleaning fee per stay", value: "€ 40" },
      ],
      totalPrice: "€ 1,111",
      guestName: "Anna George",
      maxGuests: "for max. 4 people",
      mealPlan: "Breakfast is included in the rate for this apartment.",
      amenities: [
        { icon: "bi-wifi", label: "Wifi" },
        { icon: "bi-tv", label: "Tv" },
        { icon: "bi-fan", label: "Air conditioning" },
        { icon: "bi-cup-hot", label: "Coffee machine" },
        { icon: "bi-stack", label: "Towels" },
        { icon: "bi-box-seam", label: "Refrigerator" },
      ],
    },
    {
      id: "t-3",
      bookingId: "ID 173810",
      name: "Prague Old Town Suites",
      bookingStatus: "confirmed",
      tripStatus: "completed",
      img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=300&q=80",
      checkIn: "14 May 2025",
      checkOut: "18 May 2025",
      guests: "2 Adults",
      address: "Old Town Square 12, 110 00 Prague, Czechia",
      phone: "+420 222 333 444",
      gps: "N 050° 05.280, E 014° 25.380",
      cinDay: "14",
      cinMonth: "May",
      cinTime: "14:00 - 20:00",
      coutDay: "18",
      coutMonth: "May",
      coutTime: "08:00 - 10:00",
      rooms: "4",
      nights: "4",
      bedsLine: "2 guests · Suite · 1 bed · 1 bath",
      about: "Elegant suite in the heart of the Old Town, steps away from the Astronomical Clock and Charles Bridge.",
      mapEmbed: "https://www.openstreetmap.org/export/embed.html?bbox=14.4000%2C50.0700%2C14.4500%2C50.0950&layer=mapnik&marker=50.0875%2C14.4213",
      priceRows: [
        { label: "1 unit", value: "€ 140.00" },
        { label: "10% VAT", value: "€ 14.00" },
        { label: "€ 25 Cleaning fee per stay", value: "€ 25" },
      ],
      totalPrice: "€ 599",
      guestName: "Anna George",
      maxGuests: "for max. 2 people",
      mealPlan: "There is no meal included in the rate for this apartment.",
      amenities: [
        { icon: "bi-wifi", label: "Wifi" },
        { icon: "bi-tv", label: "Tv" },
        { icon: "bi-buildings", label: "City view" },
        { icon: "bi-cup-hot", label: "Coffee machine" },
      ],
    },
    {
      id: "t-4",
      bookingId: "ID 173799",
      name: "Falkensee Lake House",
      bookingStatus: "canceled",
      tripStatus: "canceled",
      img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=300&q=80",
      checkIn: "02 Aug 2025",
      checkOut: "06 Aug 2025",
      guests: "3 Adults",
      address: "Seestraße 5, 14612 Falkensee, Germany",
      phone: "+49 3322 456 789",
      gps: "N 052° 33.600, E 013° 05.400",
      cinDay: "02",
      cinMonth: "August",
      cinTime: "15:00 - 20:00",
      coutDay: "06",
      coutMonth: "August",
      coutTime: "08:00 - 10:00",
      rooms: "6",
      nights: "4",
      bedsLine: "3 guests · House · 2 beds · 1.5 baths",
      about: "Cozy lake house with a private garden and direct lake access, ideal for a quiet family getaway.",
      mapEmbed: "https://www.openstreetmap.org/export/embed.html?bbox=13.0500%2C52.5400%2C13.1200%2C52.5750&layer=mapnik&marker=52.5600%2C13.0900",
      priceRows: [
        { label: "1 unit", value: "€ 120.00" },
        { label: "10% VAT", value: "€ 12.00" },
        { label: "€ 30 Cleaning fee per stay", value: "€ 30" },
      ],
      totalPrice: "€ 522",
      guestName: "Anna George",
      maxGuests: "for max. 3 people",
      mealPlan: "There is no meal included in the rate for this house.",
      amenities: [
        { icon: "bi-wifi", label: "Wifi" },
        { icon: "bi-tv", label: "Tv" },
        { icon: "bi-stack", label: "Towels" },
        { icon: "bi-disc", label: "Plates" },
      ],
    },
  ];

  let currentFilter = "active";
  let currentTripId = null;

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

  function bookingBadge(status) {
    if (status === "confirmed") return "badge rounded-pill bg-success-subtle text-success border border-success-subtle";
    if (status === "pending") return "badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle";
    if (status === "completed") return "badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle";
    return "badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle";
  }
  function bookingLabel(status) {
    if (status === "confirmed") return "Confirmed";
    if (status === "pending") return "Pending";
    if (status === "completed") return "Completed";
    return "Canceled";
  }

  function showListView() {
    currentTripId = null;
    const listView = $("trips-list-view");
    const detailsView = $("trip-details-view");
    if (listView) listView.classList.remove("d-none");
    if (detailsView) detailsView.classList.add("d-none");
  }

  function showDetailsView() {
    const listView = $("trips-list-view");
    const detailsView = $("trip-details-view");
    if (listView) listView.classList.add("d-none");
    if (detailsView) detailsView.classList.remove("d-none");
  }

  function paintFilters() {
    filterBtns.forEach((btn) => {
      const isActive = btn.dataset.tripFilter === currentFilter;
      btn.classList.toggle("text-primary", isActive);
      btn.classList.toggle("fw-semibold", isActive);
      btn.classList.toggle("border-primary", isActive);
      btn.classList.toggle("text-secondary", !isActive);
      if (isActive) btn.style.removeProperty("border-color");
      else btn.style.setProperty("border-color", "transparent", "important");
    });
  }

  function renderTrips() {
    showListView();
    const trips = (window.GizaTripsData || []).filter((t) => currentFilter === "all" || t.tripStatus === currentFilter);
    const titleEl = $("trips-title");
    if (titleEl) titleEl.textContent = FILTER_TITLES[currentFilter] || "Trips";
    if (subtitleEl) subtitleEl.textContent = FILTER_SUBTITLES[currentFilter] || "";
    if (countBadge) countBadge.textContent = `${trips.length} trip${trips.length === 1 ? "" : "s"}`;
    if (!listEl) return;
    listEl.innerHTML = "";
    if (trips.length === 0) {
      if (emptyEl) emptyEl.classList.remove("d-none");
    } else {
      if (emptyEl) emptyEl.classList.add("d-none");
      trips.forEach((t) => {
        const div = document.createElement("div");
        div.className = "d-flex gap-3 py-3 border-bottom";
        div.dataset.tripId = t.id;
        div.innerHTML = `
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
          </div>`;
        listEl.appendChild(div);
      });
    }
    paintFilters();
  }

  function renderTripDetails(tripId) {
    const t = (window.GizaTripsData || []).find((x) => x.id === tripId);
    if (!t) return;
    currentTripId = tripId;
    const body = $("trip-details-body");
    if (!body) return;
    const priceRows = (t.priceRows || [])
      .map(
        (r) => `
      <div class="d-flex justify-content-between small mb-1">
        <span class="text-secondary">${esc(r.label)}</span>
        <span class="text-dark">${esc(r.value)}</span>
      </div>`,
      )
      .join("");
    const amenities = (t.amenities || [])
      .map(
        (a) => `
      <span class="d-inline-flex align-items-center gap-1 text-secondary me-3 mb-2" style="font-size:12px;">
        <i class="bi ${esc(a.icon)}"></i>${esc(a.label)}
      </span>`,
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
    showDetailsView();
    renderTripReviewBox(t);

    const cancelBtn = $("cancel-booking-btn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        if (!confirm(`Cancel booking ${t.bookingId} at ${t.name}?`)) return;
        t.bookingStatus = "canceled";
        t.tripStatus = "canceled";
        renderTripDetails(t.id);
        document.dispatchEvent(new CustomEvent("giza:trip-canceled", { detail: { id: t.id } }));
      });
    }
    const invoiceBtn = $("download-invoice-btn");
    if (invoiceBtn) invoiceBtn.addEventListener("click", () => downloadInvoice(t));
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

  function openTripsTab() { gotoTab("trips-content"); }

  function gotoReviewsTab() { gotoTab("reviews-content"); }

  function stripVia(name) {
    return String(name || "").replace(/^via\s+/i, "").trim().toLowerCase();
  }

  function findTripReview(tripName) {
    try {
      const reviews = JSON.parse(localStorage.getItem("giza_reviews_v2")) || [];
      return reviews.find((r) => stripVia(r.property) === stripVia(tripName)) || null;
    } catch (_) { return null; }
  }

  function renderTripReviewBox(t) {
    const box = $("trip-review-box");
    if (!box) return;
    const section = $("trip-review-section");
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
      $("trip-review-view-btn").addEventListener("click", gotoReviewsTab);
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
    if (scoreInput && scoreVal) {
      scoreInput.addEventListener("input", () => { scoreVal.textContent = Number(scoreInput.value).toFixed(1); });
    }
    $("tripReviewSubmit").addEventListener("click", () => {
      const liked = $("tripReviewLiked").value.trim();
      const disliked = $("tripReviewDisliked").value.trim();
      const score = Number(scoreInput.value);
      const err = $("tripReviewError");
      if ((!liked && !disliked) || !(score >= 1 && score <= 10)) {
        if (err) err.classList.remove("d-none");
        return;
      }
      if (window.GizaReviews) {
        window.GizaReviews.addReview("Via " + t.name, score, liked, disliked, { img: t.img });
      }
      renderTripReviewBox(t);
      const ok = document.createElement("p");
      ok.className = "text-success small fw-semibold mt-2 mb-0";
      ok.textContent = "Review submitted — it now appears in Reviews.";
      box.appendChild(ok);
    });
  }

  function gotoWishlistTab() { gotoTab("wishlist-content"); }

  function setExpanded(expanded) {
    submenu.classList.toggle("d-none", !expanded);
    if (chevron) {
      chevron.classList.toggle("bi-chevron-down", !expanded);
      chevron.classList.toggle("bi-chevron-up", expanded);
    }
  }
  toggleBtn.addEventListener("click", () => {
    setExpanded(submenu.classList.contains("d-none"));
    renderTrips();
  });

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      currentFilter = btn.dataset.tripFilter;
      setExpanded(true);
      openTripsTab();
      renderTrips();
    });
  });
  if (listEl) {
    listEl.addEventListener("click", (e) => {
      const rateBtn = e.target.closest(".trip-rate-btn");
      if (rateBtn) {
        const row = rateBtn.closest("[data-trip-id]");
        if (row) {
          renderTripDetails(row.dataset.tripId);
          const section = $("trip-review-section");
          if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        return;
      }
      const detailsBtn = e.target.closest(".trip-details-btn");
      if (!detailsBtn) return;
      const row = detailsBtn.closest("[data-trip-id]");
      if (row) renderTripDetails(row.dataset.tripId);
    });
  }

  const backBtn = $("back-to-trips");
  if (backBtn) backBtn.addEventListener("click", renderTrips);

  const startSearchBtn = $("trips-start-search-btn");
  if (startSearchBtn) startSearchBtn.addEventListener("click", gotoWishlistTab);

  renderTrips();

  window.GizaTrips = {
    setFilter: (f) => { currentFilter = f; renderTrips(); },
    getFilter: () => currentFilter,
    openDetails: renderTripDetails,
    getCurrent: () => currentTripId,
    render: renderTrips,
  };
});
document.addEventListener("DOMContentLoaded", () => {
  const RECS_KEY = "giza_recommendations";
  const recsToggle = $("recommendations-toggle");
  if (recsToggle) {
    try {
      const saved = localStorage.getItem(RECS_KEY);
      recsToggle.checked = saved === null ? true : saved === "1";
    } catch (_) {}
    recsToggle.addEventListener("change", () => {
      try { localStorage.setItem(RECS_KEY, recsToggle.checked ? "1" : "0"); } catch (_) {}
      document.dispatchEvent(new CustomEvent("giza:recommendations-changed", { detail: { enabled: recsToggle.checked } }));
    });
  }
  const delBtn = $("delete-account-btn");
  const delModalEl = $("deleteAccountModal");
  const confirmDelBtn = $("confirmDeleteAccount");

  if (delBtn && delModalEl) {
    const delModal = modalOf(delModalEl);
    delBtn.addEventListener("click", () => delModal.show());
    if (confirmDelBtn) {
      confirmDelBtn.addEventListener("click", () => {
        try {
          Object.keys(localStorage)
            .filter((k) => k.startsWith("giza_") || k.startsWith("gizastay_"))
            .forEach((k) => localStorage.removeItem(k));
        } catch (_) {}
        location.href = "index.html";
      });
    }
  }

  window.GizaSettings = {
    recommendationsEnabled: () => {
      if (!recsToggle) return true;
      return recsToggle.checked;
    },
  };
});
