/* Layout and generic sections keep the teammate design.
   Hotel-specific data (title, location, gallery, price, rating, amenities,
   similar stays) is bound from the shared js/hotels.js dataset by ?id. */

var STAY = (function () {
  var id = new URLSearchParams(location.search).get('id');
  var list = window.GIZASTAY_HOTELS || [];
  if (window.gizastayGetHotel) {
    return window.gizastayGetHotel(id) || list[0] || null;
  }
  return list[0] || null;
})();

var STAY_GALLERY = STAY && STAY.gallery && STAY.gallery.length ? STAY.gallery : (STAY ? [STAY.image] : []);
var NIGHTLY_RATE = (STAY && STAY.price) || 100;
var DEFAULT_NIGHTS = 3;
var lastCalc = { nights: DEFAULT_NIGHTS, fee: 0, total: 0 };

function bindStay() {
  if (!STAY) return;
  var set = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
  document.title = 'GizaStay | ' + STAY.name;
  set('stayTitle', STAY.name);
  set('stayLocation', STAY.location);
  set('descText', STAY.description);
  var dt = document.getElementById('descToggle');
  if (dt) dt.style.display = 'none';
  set('reviewScore', STAY.rating.toFixed(1));
  set('reviewCount', STAY.reviews.toLocaleString());

  var main = document.getElementById('galleryMain');
  if (main) { main.src = STAY_GALLERY[0]; main.alt = STAY.name; }
  document.querySelectorAll('.gallery-side').forEach(function (img, i) {
    img.src = STAY_GALLERY[(i + 1) % STAY_GALLERY.length];
    img.alt = STAY.name;
  });

  var amenList = document.getElementById('amenList');
  if (amenList && STAY.amenities) amenList.innerHTML = STAY.amenities.map(function (a) {
    return '<div class="col-6 small text-dark py-1"><i class="bi bi-check-circle text-primary"></i> ' + a + '</div>';
  }).join('');
  var amenModal = document.getElementById('amenModalList');
  if (amenModal && STAY.amenities) amenModal.innerHTML = STAY.amenities.map(function (a) {
    return '<li class="py-1 small"><i class="bi bi-check-circle"></i> ' + a + '</li>';
  }).join('');
  var amenBtn = document.querySelector('[data-bs-target="#amenModal"]');
  if (amenBtn && STAY.amenities) amenBtn.textContent = 'Show all ' + STAY.amenities.length + ' amenities';
  var amenTitle = document.querySelector('#amenModal .modal-title');
  if (amenTitle && STAY.amenities) amenTitle.textContent = STAY.amenities.length + ' amenities';

  var gm = document.querySelector('#galleryModal .modal-body');
  if (gm) gm.innerHTML = STAY_GALLERY.map(function (src) {
    return '<div class="col-6"><img class="img-fluid rounded" alt="' + STAY.name + '" src="' + src + '"></div>';
  }).join('');
}
bindStay();

var ROOMS = [
  { beds: '1', name: 'Superior Twin Room', left: '2 rooms left', rateLabel: 'Excellent', rateNum: '70', meta: [['bi bi-hdd', '1 Single bed'], ['bi bi-person', '1 Person']], details: [['bi bi-check', 'Breakfast'], ['bi bi-check', 'Great View'], ['bi bi-arrows-fullscreen', '40 m2'], ['bi bi-check', 'No Smoking'], ['bi bi-snow', 'Air Conditioner']], extra: 'Free cancellation before 48h * Private bathroom with shower * Soundproof windows * Daily housekeeping included.', price: { off: '18% off', del: '$' + Math.round(NIGHTLY_RATE * 1.2), amount: '$' + NIGHTLY_RATE, total: '$' + (NIGHTLY_RATE * DEFAULT_NIGHTS) }, img: STAY_GALLERY[0], more: '›' },
  { beds: '2', name: 'Suite', left: '', rateLabel: 'Excellent', rateNum: '90', meta: [['bi bi-hdd', '2 Double beds'], ['bi bi-people', '4 Persons']], details: [['bi bi-check', 'Breakfast'], ['bi bi-wifi', 'Free WiFi'], ['bi bi-building', 'City View'], ['bi bi-arrows-fullscreen', '60 m2'], ['bi bi-check', 'No Smoking'], ['bi bi-snow', 'Air Conditioner']], extra: 'King-size beds * Lounge area * Bathtub + rain shower * Espresso machine * Late check-out until 12:00.', price: { big: '$' + Math.round(NIGHTLY_RATE * 1.8), total: '$' + Math.round(NIGHTLY_RATE * 1.8 * DEFAULT_NIGHTS) }, img: STAY_GALLERY[1 % STAY_GALLERY.length], more: '›' },
  { beds: '1', name: 'Spacious Room', left: '4 rooms left', rateLabel: 'Excellent', rateNum: '88', meta: [['bi bi-hdd', '1 King bed'], ['bi bi-people', '2 Persons']], details: [['bi bi-check', 'Breakfast'], ['bi bi-wifi', 'Free WiFi'], ['bi bi-water', 'Great View'], ['bi bi-arrows-fullscreen', '45 m2'], ['bi bi-check', 'No Smoking'], ['bi bi-snow', 'Air Conditioner']], extra: 'Balcony * Work desk * Smart TV 43" * Mini-fridge * Blackout curtains.', price: { off: '10% off', del: '', amount: '$' + Math.round(NIGHTLY_RATE * 1.1), total: '$' + Math.round(NIGHTLY_RATE * 1.1 * DEFAULT_NIGHTS) }, img: STAY_GALLERY[2 % STAY_GALLERY.length], more: '›' },
  { beds: '2', name: 'Deluxe Double Room', left: '', rateLabel: 'Excellent', rateNum: '90', meta: [['bi bi-hdd', '1 Double bed'], ['bi bi-people', '2 Persons']], details: [['bi bi-check', 'Breakfast'], ['bi bi-cup-hot', 'Free WiFi'], ['bi bi-water', 'Great View'], ['bi bi-arrows-fullscreen', '40 m2'], ['bi bi-check', 'No Smoking'], ['bi bi-snow', 'Air Conditioner']], extra: null, price: null, img: STAY_GALLERY[0], more: '›' },
  { beds: '3', name: 'Family Room', left: '', rateLabel: 'Excellent', rateNum: '90', meta: [['bi bi-hdd', '1 Double bed , 2 Single bed'], ['bi bi-people', '3 Persons']], details: [['bi bi-check', 'Breakfast'], ['bi bi-wifi', 'Free WiFi'], ['bi bi-building', 'City View'], ['bi bi-arrows-fullscreen', '35 m2'], ['bi bi-check', 'No Smoking'], ['bi bi-snow', 'Air Conditioner']], extra: null, price: null, img: STAY_GALLERY[1 % STAY_GALLERY.length], more: '›' },
  { beds: '1', name: 'Classic Room', left: '', rateLabel: 'Excellent', rateNum: '90', meta: [['bi bi-hdd', '1 Single bed'], ['bi bi-person', '1 Person']], details: [['bi bi-check', 'Breakfast'], ['bi bi-wifi', 'Free WiFi'], ['bi bi-building', 'City View'], ['bi bi-arrows-fullscreen', '15 m2'], ['bi bi-check', 'No Smoking'], ['bi bi-snow', 'Air Conditioner']], extra: null, price: null, img: STAY_GALLERY[2 % STAY_GALLERY.length], more: '›' }
];

function roomCardHTML(r) {
  var meta = r.meta.map(function (m) { return '<span><i class="' + m[0] + '"></i> ' + m[1] + '</span>'; }).join('');
  var det = r.details.map(function (d) { return '<span><i class="' + d[0] + '"></i> ' + d[1] + '</span>'; }).join('');
  var price;
  if (!r.price) {
    price = '<div class="room-price unavailable d-flex flex-column justify-content-center align-items-end gap-1 text-end text-muted">'
      + '<small class="text-muted">Not Available</small>'
      + '<button class="btn btn-primary btn-sm w-100" disabled>Reserve</button></div>';
  } else if (r.price.big) {
    price = '<div class="room-price d-flex flex-column justify-content-end gap-1 text-end border-start ps-2">'
      + '<div><strong class="fs-5">' + r.price.big + '</strong></div>'
      + '<small class="text-muted">Total Price : ' + r.price.total + '</small>'
      + '<button class="btn btn-primary btn-sm room-reserve w-100">Reserve</button></div>';
  } else {
    price = '<div class="room-price d-flex flex-column justify-content-end gap-1 text-end border-start ps-2">'
      + '<span class="text-bg-success rounded-2 px-2 fw-bold small align-self-end">' + r.price.off + '</span>'
      + '<div>' + (r.price.del ? '<s class="text-muted small">' + r.price.del + '</s> ' : '') + '<strong>' + r.price.amount + '</strong></div>'
      + '<small class="text-muted">Total Price : ' + r.price.total + '</small>'
      + '<button class="btn btn-primary btn-sm room-reserve w-100">Reserve</button></div>';
  }
  return '<div class="room-card d-flex flex-column flex-md-row gap-2 border rounded-3 p-2 mb-3 bg-white w-100" data-beds="' + r.beds + '">'
    + '<div class="room-img"><img src="' + r.img + '" alt="' + r.name + '">'
    + '<button class="position-absolute top-50 translate-middle-y rounded-circle border-0 bg-white shadow-sm lh-1 p-1 start-0 ms-1 r-arrow left">‹</button><button class="position-absolute top-50 translate-middle-y rounded-circle border-0 bg-white shadow-sm lh-1 p-1 end-0 me-1 r-arrow right">›</button></div>'
    + '<div class="room-info"><div class="d-flex justify-content-between align-items-start"><div>'
    + '<strong class="small fw-bold room-name">' + r.name + '</strong>' + (r.left ? '<span class="small text-danger fw-semibold ms-1">' + r.left + '</span>' : '')
    + '</div><div class="room-rate small text-muted text-nowrap">' + r.rateLabel + ' <span>' + r.rateNum + '</span></div></div>'
    + '<div class="d-flex gap-3 small text-muted my-1">' + meta + '</div>'
    + '<div class="small fw-bold mt-1">Details :</div>'
    + '<div class="row row-cols-2 row-cols-md-3 g-1 mx-0 small text-muted my-1">' + det + '</div>'
    + (r.extra ? '<div class="room-extra small text-muted bg-light rounded-2 p-1 my-1" style="display:none">' + r.extra + '</div>' : '')
    + '<button class="btn btn-link btn-sm text-decoration-none p-0 fw-semibold more-details">More details ' + r.more + '</button>'
    + '</div>' + price + '</div>';
}

var REVIEWS = [
  { name: 'Julia Kelly', date: '12 May 2025', img: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { name: 'John Wick', date: '3 Apr 2025', img: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { name: 'Amelia Cole', date: '21 Mar 2025', img: 'https://randomuser.me/api/portraits/women/68.jpg' }
];
var REVIEW_TEXT = 'Great location, spotless rooms and a very helpful host. Check-in was quick and everything matched the photos. Would happily stay again.';

function reviewHTML(r) {
  return '<div class="col-md-4 review-card small">'
    + '<div class="d-flex align-items-center gap-2">'
    + '<img src="' + r.img + '" alt="">'
    + '<div><strong class="small fw-bold">' + r.name + '</strong><br><small class="text-muted">' + r.date + '</small></div>'
    + '<span class="small border rounded-2 px-1 ms-auto">' + (STAY ? STAY.rating.toFixed(1) : '5.0') + '</span>'
    + '</div>'
    + '<p class="text-muted my-2">' + REVIEW_TEXT + '</p>'
    + '</div>';
}

var THINGS = [
  { img: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=500&q=80', name: 'City Highlights Tour', badge: 'Explore', badgeCls: 'bg-primary-subtle text-dark', dist: '400 m away', old: '$55', price: '$42' },
  { img: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=500&q=80', name: 'Live Music Evening', badge: 'Show', badgeCls: 'bg-danger-subtle text-dark', dist: '600 m away', old: '$50', price: '$42' },
  { img: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=500&q=80', name: 'Local Museum Pass', badge: 'Museum', badgeCls: 'bg-primary-subtle text-dark', dist: '1.2 km away', old: '$45', price: '$32' },
  { img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=500&q=80', name: 'Food & Wine Tasting', badge: 'Food', badgeCls: 'bg-success-subtle text-dark', dist: '800 m away', old: '', price: '$29' },
  { img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=500&q=80', name: 'Sunset Park Tour', badge: 'Explore', badgeCls: 'bg-primary-subtle text-dark', dist: '1 km away', old: '', price: '$35' }
];

function thingHTML(t) {
  return '<div class="bg-white rounded-3 shadow-sm p-2" style="min-width:200px;max-width:200px">'
    + '<div class="position-relative"><img style="height:130px" class="w-100 object-fit-cover d-block rounded-3" src="' + t.img + '" alt="">'
    + '<span class="position-absolute top-0 start-0 m-2 rounded-pill px-2 py-0 small fw-bold ' + t.badgeCls + '">' + t.badge + '</span>'
    + '<span class="position-absolute top-0 end-0 m-2 bg-white rounded-pill px-2 small">' + t.dist + '</span></div>'
    + '<strong class="d-block fw-bold small mt-1">' + t.name + '</strong><small class="small text-muted">Per Person</small>'
    + '<div>' + (t.old ? '<s class="text-muted small">' + t.old + '</s> ' : '') + '<strong class="d-block fw-bold small mt-1">' + t.price + '</strong></div>'
    + '</div>';
}

function simHTML(s) {
  return '<div class="s-card bg-white rounded-3 overflow-hidden shadow-sm pb-2" style="min-width:220px;max-width:220px">'
    + '<a href="details.html?id=' + encodeURIComponent(s.id) + '" class="text-decoration-none text-dark">'
    + '<img class="w-100 object-fit-cover d-block" style="height:140px" src="' + s.image + '" alt="">'
    + '<strong class="d-block fw-bold small mt-2 px-2">' + s.name + '</strong><small class="small text-muted px-2">' + s.location + '</small>'
    + '<div class="small mt-1 px-2">' + s.rating.toFixed(1) + ' <span class="bg-primary-subtle text-primary rounded-2 px-1 small fw-bold ms-1">' + (s.rating >= 4.8 ? 'Excellent' : 'Very Good') + '</span> <small>* ' + s.reviews + ' reviews</small></div>'
    + '<div class="small mt-1 px-2">3 nights <strong>$' + (s.price * 3) + ' total</strong></div>'
    + '</a></div>';
}

(function renderDetails() {
  var rl = document.getElementById('roomsList');
  if (rl) rl.innerHTML = ROOMS.map(roomCardHTML).join('');
  var rv = document.getElementById('reviewsRow');
  if (rv) rv.innerHTML = REVIEWS.map(reviewHTML).join('');
  var th = document.getElementById('thingsRow');
  if (th) th.innerHTML = THINGS.map(thingHTML).join('');
  var sm = document.getElementById('simRow');
  if (sm) {
    var others = (window.GIZASTAY_HOTELS || []).filter(function (s) { return !STAY || s.id !== STAY.id; }).slice(0, 4);
    sm.innerHTML = others.map(simHTML).join('');
  }
})();

var tabs = document.querySelectorAll('#topTabs .nav-link');
tabs.forEach(function (t) {
  t.addEventListener('click', function () {
    tabs.forEach(function (x) { x.classList.remove('text-primary', 'border-bottom', 'border-primary', 'border-2'); x.classList.add('text-secondary'); });
    t.classList.add('text-primary', 'border-bottom', 'border-primary', 'border-2');
    t.classList.remove('text-secondary');
  });
});

/* Favorite - shared gizastay_favorites */
(function () {
  var favBtn = document.getElementById('favBtn');
  if (!favBtn || !STAY) return;
  function ids() { try { return JSON.parse(localStorage.getItem('gizastay_favorites') || '[]'); } catch (e) { return []; } }
  function paint() {
    var on = ids().indexOf(STAY.id) !== -1;
    favBtn.classList.toggle('text-danger', on);
    var ic = favBtn.querySelector('i');
    if (ic) { ic.classList.toggle('bi-heart-fill', on); ic.classList.toggle('bi-heart', !on); }
  }
  favBtn.addEventListener('click', function () {
    var f = ids();
    var i = f.indexOf(STAY.id);
    if (i === -1) f.push(STAY.id); else f.splice(i, 1);
    try { localStorage.setItem('gizastay_favorites', JSON.stringify(f)); } catch (e) {}
    paint();
  });
  paint();
})();

var descToggle = document.getElementById('descToggle');
var descMore = document.getElementById('descMore');
if (descToggle && descMore) {
  descToggle.addEventListener('click', function () {
    var hidden = descMore.style.display === 'none';
    descMore.style.display = hidden ? 'inline' : 'none';
    descToggle.textContent = hidden ? 'Show Less' : 'Show More';
  });
}

document.querySelectorAll('[data-filter]').forEach(function (pill) {
  pill.addEventListener('click', function () {
    document.querySelectorAll('[data-filter]').forEach(function (p) {
      p.classList.remove('bg-dark', 'text-white', 'border-dark');
      p.classList.add('bg-white', 'text-dark');
    });
    pill.classList.add('bg-dark', 'text-white', 'border-dark');
    pill.classList.remove('bg-white', 'text-dark');
    var f = pill.dataset.filter;
    document.querySelectorAll('#roomsList .room-card').forEach(function (card) {
      card.style.display = (f === 'all' || card.dataset.beds === f) ? 'flex' : 'none';
    });
  });
});

document.querySelectorAll('.more-details').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var extra = btn.previousElementSibling;
    if (extra && extra.classList.contains('room-extra')) {
      var open = extra.style.display !== 'none';
      extra.style.display = open ? 'none' : 'block';
      btn.textContent = open ? 'More details ›' : 'Less details ‹';
    }
  });
});

document.querySelectorAll('.room-card').forEach(function (card) {
  var img = card.querySelector('.room-img img');
  var idx = 0;
  card.querySelector('.r-arrow.left').addEventListener('click', function () {
    idx = (idx - 1 + STAY_GALLERY.length) % STAY_GALLERY.length;
    img.src = STAY_GALLERY[idx];
  });
  card.querySelector('.r-arrow.right').addEventListener('click', function () {
    idx = (idx + 1) % STAY_GALLERY.length;
    img.src = STAY_GALLERY[idx];
  });
});

document.querySelectorAll('.room-reserve').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var reserve = document.getElementById('reserveBtn');
    if (reserve) reserve.click();
  });
});

var baseYear = 2025, baseMonth = 6;
var selected = ['2025-08-12', '2025-08-13', '2025-08-14', '2025-08-15'];
function renderCal(elId, year, month) {
  var el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = '';
  var first = new Date(year, month, 1);
  var offset = (first.getDay() + 6) % 7;
  for (var i = 0; i < offset; i++) {
    var e = document.createElement('span'); e.className = 'py-1 pe-none'; el.appendChild(e);
  }
  var days = new Date(year, month + 1, 0).getDate();
  for (var d = 1; d <= days; d++) {
    var s = document.createElement('span');
    s.className = 'py-1 rounded-2';
    s.textContent = d;
    var key = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    if (selected.indexOf(key) !== -1) {
      if (key === '2025-08-12' || key === '2025-08-15') s.classList.add('bg-primary', 'text-white');
      else s.classList.add('bg-primary-subtle');
    }
    el.appendChild(s);
  }
}
var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function renderAll() {
  renderCal('cal1', baseYear, baseMonth);
  var m2 = baseMonth + 1 > 11 ? 0 : baseMonth + 1;
  var y2 = baseMonth + 1 > 11 ? baseYear + 1 : baseYear;
  renderCal('cal2', y2, m2);
  var t1 = document.getElementById('calTitle1'); if (t1) t1.textContent = monthNames[baseMonth] + '  ' + baseYear;
  var t2 = document.getElementById('calTitle2'); if (t2) t2.textContent = monthNames[m2] + '  ' + y2;
}
if (document.getElementById('calPrev')) document.getElementById('calPrev').addEventListener('click', function () {
  baseMonth--; if (baseMonth < 0) { baseMonth = 11; baseYear--; } renderAll();
});
if (document.getElementById('calNext')) document.getElementById('calNext').addEventListener('click', function () {
  baseMonth++; if (baseMonth > 11) { baseMonth = 0; baseYear++; } renderAll();
});
renderAll();

function parseMDY(str) {
  var m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec((str || '').trim());
  if (!m) return null;
  var d = new Date(+m[3], +m[1] - 1, +m[2]);
  return (d.getMonth() === +m[1] - 1 && d.getDate() === +m[2] && d.getFullYear() === +m[3]) ? d : null;
}
function guestCount() {
  var v = document.getElementById('guests').value;
  if (/^1\b/.test(v)) return 1;
  if (/^3\b/.test(v) || /child/i.test(v)) return 3;
  return 2;
}
function updateTotal() {
  var ci = parseMDY(document.getElementById('checkIn').value);
  var co = parseMDY(document.getElementById('checkOut').value);
  var nights = DEFAULT_NIGHTS;
  if (ci && co && co > ci) nights = Math.round((co - ci) / 86400000);
  var sub = nights * NIGHTLY_RATE;
  var extra = guestCount() > 2 ? 10 : 0;
  var fee = Math.round(sub * 0.1) + extra;
  document.getElementById('nightsLabel').textContent = 'For ' + nights + ' night' + (nights > 1 ? 's' : '') + ' (excl. taxes)';
  document.getElementById('nightsPrice').textContent = '$' + sub;
  document.getElementById('extraPrice').textContent = '$' + fee;
  document.getElementById('totalPrice').textContent = '$' + (sub + fee);
  lastCalc = { nights: nights, fee: fee, total: sub + fee };
}
['guests', 'checkIn', 'checkOut'].forEach(function (id) {
  var el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('input', updateTotal);
  el.addEventListener('change', updateTotal);
});
document.getElementById('nightsPrice').textContent = '$' + (NIGHTLY_RATE * DEFAULT_NIGHTS);
updateTotal();

document.getElementById('clearBtn').addEventListener('click', function () {
  document.getElementById('checkIn').value = '07/10/2025';
  document.getElementById('checkOut').value = '07/13/2025';
  document.getElementById('guests').selectedIndex = 0;
  renderAll();
  updateTotal();
});

document.getElementById('reserveBtn').addEventListener('click', function () {
  if (!STAY) { alert('Reserved!'); return; }
  localStorage.setItem('bookingProperty', JSON.stringify({
    id: STAY.id,
    name: STAY.name,
    location: STAY.location,
    image: STAY_GALLERY[0],
    price: STAY.price,
    nights: lastCalc.nights,
    fee: lastCalc.fee,
    total: lastCalc.total,
    checkin: document.getElementById('checkIn').value,
    checkout: document.getElementById('checkOut').value,
    guests: guestCount()
  }));
  location.href = localStorage.getItem('gizastay_logged_in') === '1' ? 'booking-details.html' : 'login.html';
});

function scrollRow(id, amount) {
  var el = document.getElementById(id);
  if (el) el.scrollBy({ left: amount, behavior: 'smooth' });
}

if (document.getElementById('navSearch')) document.getElementById('navSearch').addEventListener('click', function () {
  var c = document.getElementById('bookingCard');
  if (c) c.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
if (document.getElementById('langBtn')) document.getElementById('langBtn').addEventListener('click', function () {
  alert('Languages: English (US) - Francais - Espanol - Arabic');
});
if (document.getElementById('footLang')) document.getElementById('footLang').addEventListener('click', function () {
  this.innerHTML = this.textContent.indexOf('English') !== -1 ? '<i class="bi bi-globe"></i> Arabic' : '<i class="bi bi-globe"></i> English (US)';
});
if (document.getElementById('footCurr')) document.getElementById('footCurr').addEventListener('click', function () {
  this.textContent = '$ USD';
});
