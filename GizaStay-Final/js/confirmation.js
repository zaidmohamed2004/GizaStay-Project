document.addEventListener("DOMContentLoaded", () => {
  const guest = JSON.parse(localStorage.getItem("guestData") || "null");
  const pay = JSON.parse(localStorage.getItem("paymentData") || "null");
  const b = JSON.parse(localStorage.getItem("bookingProperty") || "null");
  const set = (id, v) => {
    const el = document.querySelector(id);
    if (el) el.textContent = v;
  };

  set("#confirmedEmail", guest?.email || "your email");
  set("#paymentMethodLabel", pay ? "Card **** " + pay.last4 : "Card");
  set("#paymentTotalLabel", "$ " + (pay?.total ?? b?.total ?? 0));
  set("#paymentTimestamp", new Date().toLocaleString());

  let code = localStorage.getItem("gizastay_reservation_code");
  if (!code) {
    code = Math.random().toString(36).slice(2, 12).toUpperCase();
    localStorage.setItem("gizastay_reservation_code", code);
  }
  set("#reservationCode", code);

  if (b) {
    const img = document.querySelector("#bookingHotelImage");
    if (img && b.image) img.src = b.image;
    set("#bookingPropertyName", b.name || "Selected hotel");
    set("#bookingPropertyLocation", b.location || "");
    set(
      "#bookingDatesGuests",
      (b.checkin || "") +
        " - " +
        (b.checkout || "") +
        " · " +
        (b.guests || 2) +
        " guests",
    );
  }

  const add = document.querySelector("#addAnotherEmail");
  if (add)
    add.onclick = (e) => {
      e.preventDefault();
      const wrap = document.querySelector("#emailsContainer");
      const d = document.createElement("div");
      d.className = "col-12 col-md-6 mb-2";
      d.innerHTML =
        '<input type="email" class="form-control extraEmail" placeholder="email address">';
      wrap.appendChild(d);
    };

  const share = document.querySelector("#shareBtn");
  if (share)
    share.onclick = async () => {
      const text = "GizaStay reservation " + code;
      if (navigator.clipboard) await navigator.clipboard.writeText(text);
      alert("Reservation details copied to clipboard");
    };

  const invoice = document.querySelector("#openInvoiceBtn");
  if (invoice) invoice.onclick = () => window.print();
});
