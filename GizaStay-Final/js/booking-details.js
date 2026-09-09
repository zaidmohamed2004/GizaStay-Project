const bookingForm = document.querySelector("#bookingForm");
const guestsContainer = document.querySelector("#guestsContainer");
const addGuestBtn = document.querySelector("#addGuestBtn");
let guestCount = 1;

const error = (e, m) => {
  e.nextElementSibling.textContent = m;
};
const validName = (e) => {
  const ok = e.value.trim().length >= 3;
  error(e, ok ? "" : "please enter at least 3 characters");
  return ok;
};
const validEmail = (e) => {
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.value.trim());
  error(e, ok ? "" : "invalid email");
  return ok;
};
const validPhone = (e) => {
  const ok = /^[0-9+\-\s()]{7,}$/.test(e.value.trim());
  error(e, ok ? "" : "please enter a valid phone number");
  return ok;
};

function fillHotelSummary(b) {
  const set = (id, v) => {
    const el = document.querySelector(id);
    if (el) el.textContent = v;
  };
  const img = document.querySelector("#bookingHotelImage");
  if (img && b.image) img.src = b.image;
  set("#bookingPropertyName", b.name || "Selected hotel");
  set("#bookingTripName", b.name || "Your selected stay");
  set("#bookingPropertyLocation", b.location || "");
  const hotel = window.gizastayGetHotel ? window.gizastayGetHotel(b.id) : null;
  set("#bookingPropertyRating", hotel ? hotel.rating.toFixed(1) : "5.0");
  set("#bookingPropertyReviews", hotel ? hotel.reviews + " reviews" : "");
  set("#bookingCheckin", b.checkin || "—");
  set("#bookingCheckout", b.checkout || "—");
  set("#bookingGuests", "1 room, " + (b.guests || 2) + " guests");
  const nights = b.nights || 1;
  const subtotal = (b.price || 0) * nights;
  set(
    "#bookingNightsLabel",
    "$" +
      (b.price || 0) +
      " x " +
      nights +
      " night" +
      (nights === 1 ? "" : "s"),
  );
  set("#bookingSubtotal", "$" + subtotal);
  set("#bookingFee", "$" + (b.fee != null ? b.fee : 0));
  set("#bookingTotal", "$" + (b.total != null ? b.total : subtotal));
  set("#bookingTotalNote", "$" + (b.total != null ? b.total : subtotal));
}

document.addEventListener("DOMContentLoaded", () => {
  const b = JSON.parse(localStorage.getItem("bookingProperty") || "null");
  if (b) fillHotelSummary(b);
  document.querySelectorAll(".edit-booking-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      location.href =
        "details.html" + (b && b.id ? "?id=" + encodeURIComponent(b.id) : "");
    });
  });

  if (addGuestBtn)
    addGuestBtn.onclick = () => {
      guestCount++;
      const d = document.createElement("div");
      d.className = "guestBlock mb-4";
      d.innerHTML = `<h5>Guest ${guestCount}</h5><div class="row gy-3"><div class="col-md-6"><label class="form-label">First Name</label><input class="form-control guestFirstName"><small class="text-danger"></small></div><div class="col-md-6"><label class="form-label">Last Name</label><input class="form-control guestLastName"><small class="text-danger"></small></div></div>`;
      guestsContainer.appendChild(d);
    };

  bookingForm.addEventListener("input", (e) => {
    if (
      e.target.classList.contains("guestFirstName") ||
      e.target.classList.contains("guestLastName")
    )
      validName(e.target);
    if (e.target.id === "guestEmail") validEmail(e.target);
    if (e.target.id === "guestPhone") validPhone(e.target);
  });

  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fields = [
      ...document.querySelectorAll(".guestFirstName,.guestLastName"),
    ];
    const ok =
      fields.every(validName) &&
      validEmail(document.querySelector("#guestEmail")) &&
      validPhone(document.querySelector("#guestPhone"));
    if (!ok) return;
    const guests = fields.reduce(
      (a, x, i) => (
        i % 2 === 0
          ? a.push({ firstName: x.value.trim() })
          : (a[a.length - 1].lastName = x.value.trim()),
        a
      ),
      [],
    );
    localStorage.setItem(
      "guestData",
      JSON.stringify({
        firstName: fields[0].value.trim(),
        lastName: fields[1].value.trim(),
        email: document.querySelector("#guestEmail").value.trim(),
        phone: document.querySelector("#guestPhone").value.trim(),
        guests,
      }),
    );
    location.href = "payment.html";
  });
});
