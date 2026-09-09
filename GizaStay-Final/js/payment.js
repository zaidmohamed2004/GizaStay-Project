const form = document.querySelector("#paymentForm");
const err = (e, m) => {
  e.nextElementSibling.textContent = m;
};
const required = (e, l) => {
  const ok = e.value.trim().length > 0;
  err(e, ok ? "" : "please enter " + l);
  return ok;
};
const cardNum = (e) => {
  const ok = /^\d{12,19}$/.test(e.value.replace(/\s/g, ""));
  err(e, ok ? "" : "please enter a valid card number");
  return ok;
};
const expiry = (e) => {
  const ok = /^(0[1-9]|1[0-2])\/\d{2}$/.test(e.value.trim());
  err(e, ok ? "" : "use MM/YY format");
  return ok;
};
const cvc = (e) => {
  const ok = /^\d{3,4}$/.test(e.value.trim());
  err(e, ok ? "" : "please enter a valid CVC");
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
  const payNowLabel = document.querySelector("#payNowLabel");
  if (payNowLabel)
    payNowLabel.textContent =
      "Pay $" + (b.total != null ? b.total : subtotal) + " now";
}

document.addEventListener("DOMContentLoaded", () => {
  const b = JSON.parse(localStorage.getItem("bookingProperty") || "null");
  const total = b ? b.total : 0;
  if (b) fillHotelSummary(b);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const a = required(
      document.querySelector("#cardName"),
      "the cardholder's name",
    );
    const n = cardNum(document.querySelector("#cardNumber"));
    const x = expiry(document.querySelector("#cardExpiry"));
    const c = cvc(document.querySelector("#cardCvc"));
    if (!(a && n && x && c)) return;
    const digits = document
      .querySelector("#cardNumber")
      .value.replace(/\s/g, "");
    localStorage.setItem(
      "paymentData",
      JSON.stringify({ last4: digits.slice(-4), total }),
    );
    location.href = "confirmation.html";
  });
});
