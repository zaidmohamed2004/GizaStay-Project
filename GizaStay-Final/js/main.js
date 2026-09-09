(function () {
  "use strict";

  var HOTELS = window.GIZASTAY_HOTELS || [];
  var params = new URLSearchParams(location.search);
  var PRICE_MIN = 50;
  var PRICE_MAX = 250;

  function esc(s) {
    return String(s).replace(/[&<>'"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c];
    });
  }
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  function normSort(s) {
    if (s === "price-asc" || s === "lowToHigh") return "price-asc";
    if (s === "price-desc" || s === "highToLow") return "price-desc";
    if (s === "popular") return "popular";
    return "top";
  }

  var state = {
    view: localStorage.getItem("gizastay_view") || "grid",
    type: params.get("type") || "all",
    destination: params.get("destination") || "",
    max: PRICE_MAX,
    minRating: 0,
    sort: normSort(params.get("sort")),
  };

  function favs() {
    try { return JSON.parse(localStorage.getItem("gizastay_favorites") || "[]"); }
    catch (e) { return []; }
  }
  function saveFavs(v) {
    try { localStorage.setItem("gizastay_favorites", JSON.stringify(v)); } catch (e) {}
  }
  function toggleFav(id) {
    var f = favs();
    var i = f.indexOf(id);
    if (i === -1) f.push(id); else f.splice(i, 1);
    saveFavs(f);
  }

  var SCORES = { score5: 5, score4: 4, score3: 3, score2: 2, score1: 0 };
  function readMinRating() {
    var t = [];
    Object.keys(SCORES).forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.checked) t.push(SCORES[id]);
    });
    return t.length ? Math.min.apply(null, t) : 0;
  }

  function starsHTML(n) {
    var s = "", r = Math.round(n);
    for (var k = 0; k < 5; k++) s += '<i class="bi ' + (k < r ? "bi-star-fill" : "bi-star") + '"></i>';
    return s;
  }
  function ratingCls(r) { return r >= 4.8 ? "text-bg-success" : r >= 4 ? "text-bg-primary" : "text-bg-warning"; }
  function ratingText(r) { return r >= 4.8 ? "Excellent" : r >= 4 ? "Very Good" : "Good"; }

  function cardHTML(h) {
    var liked = favs().indexOf(h.id) !== -1;
    var list = state.view === "list";
    return '<div class="' + (list ? "col-12" : "col-lg-4 col-md-6") + ' hotel-col">'
      + '<div class="bg-white rounded-4 overflow-hidden mb-4 shadow-sm h-100 d-flex flex-column' + (list ? " flex-md-row" : "") + '">'
      + '<div class="position-relative ' + (list ? "stay-list-img" : "") + '">'
      + '<button type="button" class="hotel-heart position-absolute top-0 end-0 m-2 rounded-circle bg-white d-flex align-items-center justify-content-center p-2 border-0' + (liked ? " active" : "") + '" data-id="' + esc(h.id) + '" aria-label="Save ' + esc(h.name) + '"><i class="bi ' + (liked ? "bi-heart-fill text-danger" : "bi-heart") + ' lh-1"></i></button>'
      + '<img class="w-100 d-block object-fit-cover" style="height:210px" src="' + h.image + '" alt="' + esc(h.name) + '">'
      + '</div>'
      + '<div class="p-3 d-flex flex-column flex-grow-1">'
      + '<div class="d-flex align-items-start justify-content-between gap-2">'
      + '<p class="fs-6 fw-bold text-dark mb-0"><a href="details.html?id=' + encodeURIComponent(h.id) + '" class="text-decoration-none text-dark">' + esc(h.name) + '</a></p>'
      + '<span class="small text-warning fw-semibold text-nowrap">' + starsHTML(h.rating) + '</span>'
      + '</div>'
      + '<p class="small text-primary mt-1 mb-2"><i class="bi bi-geo-alt-fill"></i> ' + esc(h.location) + '</p>'
      + '<div class="mb-1"><span class="d-inline-block px-2 rounded-1 small fw-bold me-1 ' + ratingCls(h.rating) + '">' + h.rating.toFixed(1) + '</span> <span class="small fw-semibold text-dark">' + ratingText(h.rating) + '</span> <span class="small text-muted">' + h.reviews.toLocaleString() + ' reviews</span></div>'
      + '<span class="badge text-bg-light border align-self-start mb-1">' + esc(h.type) + '</span>'
      + '<p class="small text-muted mt-1 mb-2">' + esc(h.tags) + '</p>'
      + '<div class="mt-auto d-flex align-items-baseline justify-content-between">'
      + '<div><strong class="fs-5 text-dark">$' + h.price + '</strong> <span class="small text-muted">/ night</span></div>'
      + '<a href="details.html?id=' + encodeURIComponent(h.id) + '" class="btn btn-primary btn-sm">View details</a>'
      + '</div>'
      + '</div></div></div>';
  }

  function filtered() {
    var r = HOTELS.filter(function (h) {
      return (state.type === "all" || h.type === state.type || h.category === state.type)
        && h.price <= state.max
        && h.rating >= state.minRating;
    });
    var q = state.destination.trim().toLowerCase();
    if (q) {
      r = r.filter(function (h) {
        return h.name.toLowerCase().indexOf(q) !== -1
          || h.location.toLowerCase().indexOf(q) !== -1
          || String(h.type || "").toLowerCase().indexOf(q) !== -1;
      });
    }
    if (state.sort === "price-asc") r.sort(function (a, b) { return a.price - b.price; });
    else if (state.sort === "price-desc") r.sort(function (a, b) { return b.price - a.price; });
    else if (state.sort === "popular") r.sort(function (a, b) { return b.reviews - a.reviews; });
    else r.sort(function (a, b) { return b.rating - a.rating || b.reviews - a.reviews; });
    return r;
  }

  var root, emptyEl;

  function paintView() {
    var gb = $("#gridViewBtn"), lb = $("#listViewBtn");
    if (!gb || !lb) return;
    var g = state.view === "grid";
    gb.classList.toggle("btn-light", g);
    gb.classList.toggle("btn-link", !g);
    gb.classList.toggle("text-secondary", !g);
    lb.classList.toggle("btn-light", !g);
    lb.classList.toggle("btn-link", g);
    lb.classList.toggle("text-secondary", g);
  }

  function render() {
    if (!root) return;
    var list = filtered();
    root.innerHTML = list.map(cardHTML).join("");
    root.classList.toggle("list-mode", state.view === "list");
    if (emptyEl) emptyEl.classList.toggle("d-none", list.length > 0);
    var rc = $("#resultCount");
    if (rc) rc.textContent = list.length + (list.length === 1 ? " stay" : " stays");
    root.querySelectorAll(".hotel-heart").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggleFav(b.dataset.id);
        render();
        renderFavs();
      });
    });
    paintView();
  }

  function renderFavs() {
    var ids = favs();
    var items = HOTELS.filter(function (h) { return ids.indexOf(h.id) !== -1; });
    var c1 = $("#favCount"), c2 = $("#favModalCount");
    if (c1) c1.textContent = items.length;
    if (c2) c2.textContent = items.length;
    var fb = $("#favFloatBtn");
    if (fb) {
      fb.classList.toggle("d-none", items.length === 0);
      fb.classList.toggle("d-flex", items.length > 0);
    }
    var fl = $("#favList");
    if (!fl) return;
    fl.innerHTML = items.length
      ? items.map(function (h) {
          return '<div class="d-flex align-items-center gap-2 border rounded-3 p-2 mb-2">'
            + '<img src="' + h.image + '" width="60" height="60" class="rounded-2 object-fit-cover flex-shrink-0" alt="">'
            + '<div class="flex-grow-1" style="min-width:0"><div class="fw-bold text-truncate">' + esc(h.name) + '</div>'
            + '<small class="text-muted">' + h.rating.toFixed(1) + ' &#9733; &middot; $' + h.price + '/night</small></div>'
            + '<a href="details.html?id=' + encodeURIComponent(h.id) + '" class="btn btn-sm btn-outline-primary flex-shrink-0">View</a>'
            + '<button type="button" class="btn btn-sm btn-outline-danger flex-shrink-0" data-remove="' + esc(h.id) + '" title="Remove"><i class="bi bi-trash"></i></button>'
            + '</div>';
        }).join("")
      : '<p class="text-muted text-center my-4">No saved stays yet. Tap the <i class="bi bi-heart"></i> on any stay.</p>';
    fl.querySelectorAll("[data-remove]").forEach(function (b) {
      b.addEventListener("click", function () {
        toggleFav(b.dataset.remove);
        renderFavs();
        render();
      });
    });
  }

  function syncPrice() {
    var pm = $("#priceMax");
    if (!pm) return;
    var v = parseInt(pm.value, 10);
    if (isNaN(v)) v = PRICE_MAX;
    v = Math.min(PRICE_MAX, Math.max(PRICE_MIN, v));
    pm.value = v;
    state.max = v;
    var box = $("#maxBox");
    if (box) box.textContent = v + (v >= PRICE_MAX ? "+" : "");
    var fill = $("#priceFill");
    if (fill) fill.style.width = ((v - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100 + "%";
    render();
  }

  function applySearch(value) {
    state.destination = value || "";
    var navDest = $("#navDest"), mDest = $("#mDest");
    if (navDest) navDest.value = state.destination;
    if (mDest) mDest.value = state.destination;
    var heading = $("#pageHeading");
    if (heading) heading.textContent = state.destination ? "Stays in " + state.destination : "Explore stays";
    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    root = $("#gridRow");
    emptyEl = $("#gridEmpty");
    if (!root) return;

    var heading = $("#pageHeading");
    if (heading && state.destination) heading.textContent = "Stays in " + state.destination;

    var navDest = $("#navDest"), mDest = $("#mDest"), searchApply = $("#searchApply");
    if (navDest) {
      navDest.value = state.destination;
      navDest.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); applySearch(navDest.value); }
      });
    }
    if (mDest) mDest.value = state.destination;
    if (searchApply) searchApply.addEventListener("click", function () {
      var destErr = $("#mDestError");
      var val = mDest ? mDest.value.trim() : "";
      if (!val) {
        if (mDest) mDest.classList.add("is-invalid");
        if (destErr) destErr.classList.remove("d-none");
        if (mDest) mDest.focus();
        return;
      }
      if (mDest) mDest.classList.remove("is-invalid");
      if (destErr) destErr.classList.add("d-none");
      applySearch(val);
      var modalEl = document.getElementById("navSearchModal");
      if (modalEl && window.bootstrap) {
        window.bootstrap.Modal.getOrCreateInstance(modalEl).hide();
      }
    });

    var pm = $("#priceMax");
    if (pm) {
      pm.min = PRICE_MIN;
      pm.max = PRICE_MAX;
      pm.step = 10;
      pm.value = PRICE_MAX;
      pm.addEventListener("input", syncPrice);
    }
    var maxBtn = $("#maxBtn");
    if (maxBtn) maxBtn.addEventListener("click", function () {
      var v = state.max - 20;
      if (v < PRICE_MIN) v = PRICE_MAX;
      if (pm) pm.value = v;
      syncPrice();
    });

    Object.keys(SCORES).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener("change", function () {
        state.minRating = readMinRating();
        render();
      });
    });
    state.minRating = readMinRating();

    $$("#sortDropdownContainer .dropdown-item[data-sort]").forEach(function (it) {
      it.addEventListener("click", function (e) {
        e.preventDefault();
        $$("#sortDropdownContainer .dropdown-item").forEach(function (x) { x.classList.remove("active"); });
        it.classList.add("active");
        var lbl = $("#sortLabel");
        if (lbl) lbl.textContent = it.textContent.trim();
        state.sort = normSort(it.dataset.sort);
        render();
      });
    });
    var gsel = $("#gridSortSelect");
    if (gsel) gsel.addEventListener("change", function () {
      state.sort = normSort(gsel.value);
      render();
    });
    var act = $$("#sortDropdownContainer .dropdown-item[data-sort]").filter(function (x) {
      return normSort(x.dataset.sort) === state.sort;
    })[0];
    if (act) {
      $$("#sortDropdownContainer .dropdown-item").forEach(function (x) { x.classList.remove("active"); });
      act.classList.add("active");
      var lbl = $("#sortLabel");
      if (lbl) lbl.textContent = act.textContent.trim();
    }

    var gb = $("#gridViewBtn"), lb = $("#listViewBtn");
    if (gb) gb.addEventListener("click", function () {
      state.view = "grid";
      localStorage.setItem("gizastay_view", "grid");
      render();
    });
    if (lb) lb.addEventListener("click", function () {
      state.view = "list";
      localStorage.setItem("gizastay_view", "list");
      render();
    });

    var clr = $("#clearFilters");
    if (clr) clr.addEventListener("click", function () {
      state.type = "all";
      state.destination = "";
      state.minRating = 0;
      state.max = PRICE_MAX;
      state.sort = "top";
      if (navDest) navDest.value = "";
      if (mDest) mDest.value = "";
      if (pm) pm.value = PRICE_MAX;
      ["score5", "score4", "score3"].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.checked = true;
      });
      ["score2", "score1"].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.checked = false;
      });
      state.minRating = readMinRating();
      $$("#sortDropdownContainer .dropdown-item").forEach(function (x, i) { x.classList.toggle("active", i === 0); });
      var lbl = $("#sortLabel");
      if (lbl) lbl.textContent = "Sort by: Top Reviewed";
      if (heading) heading.textContent = "Explore stays";
      $$("aside .d-flex.flex-wrap button.bg-dark").forEach(function (p) {
        p.classList.remove("bg-dark", "text-white", "border-dark");
        p.classList.add("bg-white", "text-dark");
        var ic = p.querySelector("i");
        if (ic) ic.classList.remove("text-white");
      });
      syncPrice();
    });

    $$(".collapse-toggle").forEach(function (b) {
      b.addEventListener("click", function () {
        var ic = b.querySelector("i");
        if (ic) {
          ic.classList.toggle("bi-chevron-up");
          ic.classList.toggle("bi-chevron-down");
        }
      });
    });
    $$("aside .d-flex.flex-wrap button").forEach(function (pill) {
      pill.addEventListener("click", function () {
        var on = !pill.classList.contains("bg-dark");
        pill.classList.toggle("bg-dark", on);
        pill.classList.toggle("text-white", on);
        pill.classList.toggle("border-dark", on);
        pill.classList.toggle("bg-white", !on);
        pill.classList.toggle("text-dark", !on);
        var ic = pill.querySelector("i");
        if (ic) ic.classList.toggle("text-white", on);
      });
    });
    var typeBtns = $$("aside .border-black .btn");
    typeBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        typeBtns.forEach(function (x) { x.classList.remove("fw-bold"); x.classList.add("text-muted"); });
        b.classList.add("fw-bold");
        b.classList.remove("text-muted");
      });
    });
    $$("aside .d-inline-flex").forEach(function (row) {
      var btns = row.querySelectorAll("button");
      var num = row.querySelector("span.fw-bold");
      if (btns.length !== 2 || !num) return;
      var isAny = function () { return /any/i.test(num.textContent); };
      btns[0].addEventListener("click", function () {
        var v = isAny() ? 0 : parseInt(num.textContent, 10) || 0;
        v = Math.max(0, v - 1);
        num.textContent = v <= 0 ? "Any" : v;
      });
      btns[1].addEventListener("click", function () {
        var v = isAny() ? 0 : parseInt(num.textContent, 10) || 0;
        v = Math.min(10, v + 1);
        num.textContent = v;
      });
    });

    var searchModalEl = document.getElementById("navSearchModal");
    if (searchModalEl) {
      searchModalEl.addEventListener("hidden.bs.modal", function () {
        var mDestErr = $("#mDestError"), mDatesErr = $("#mDatesError");
        if (mDest) mDest.classList.remove("is-invalid");
        if (mDestErr) mDestErr.classList.add("d-none");
        if (mDatesErr) mDatesErr.classList.add("d-none");
      });
    }

    var fm = $("#favModal");
    if (fm) fm.addEventListener("show.bs.modal", renderFavs);

    syncPrice();
    renderFavs();

    if (location.hash === "#favorites" && fm && window.bootstrap) {
      window.bootstrap.Modal.getOrCreateInstance(fm).show();
    }
  });
})();
