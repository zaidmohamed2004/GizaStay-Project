let emailStep = document.querySelector("#emailStep");
let otpStep = document.querySelector("#otpStep");
let emailInput = document.querySelector("#emailInput");
let continueBtn = document.querySelector("#continueBtn");
let sentEmail = document.querySelector("#sentEmail");
let otpDigits = document.querySelectorAll(".otpDigit");
let verifyBtn = document.querySelector("#verifyBtn");
let otpError = document.querySelector("#otpError");
let backBtn = document.querySelector("#backBtn");
let editEmailLink = document.querySelector("#editEmailLink");
let resendText = document.querySelector("#resendText");

let generatedCode = "";
let timer;

let handleError = (element, msg) => {
  element.nextElementSibling.innerText = msg;
};

let emailValidation = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(emailInput.value.trim())) {
    continueBtn.disabled = false;
    handleError(emailInput, "");
  } else {
    continueBtn.disabled = true;
    if (emailInput.value.trim().length > 0)
      handleError(emailInput, "please enter a valid email address");
    else handleError(emailInput, "");
  }
};

emailInput.addEventListener("input", emailValidation);

let generateCode = () => {
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += Math.floor(Math.random() * 10);
  }
  alert("Demo verification code: " + code);
  return code;
};

let renderCountdown = (seconds) => {
  resendText.innerHTML = `Didn't receive email? Check your spam folder or
        <a href="#" id="resendLink" class="text-muted" style="pointer-events:none;">request another code</a>
        in <span id="countdown">${seconds}</span> seconds.`;
};

let renderResendReady = () => {
  resendText.innerHTML = `Didn't receive email? Check your spam folder or
        <a href="#" id="resendLink">request another code</a>.`;

  document.querySelector("#resendLink").addEventListener("click", (e) => {
    e.preventDefault();
    generatedCode = generateCode();
    startCountdown();
  });
};

let startCountdown = () => {
  let seconds = 30;
  renderCountdown(seconds);
  clearInterval(timer);

  timer = setInterval(() => {
    seconds--;
    if (seconds <= 0) {
      clearInterval(timer);
      renderResendReady();
    } else {
      renderCountdown(seconds);
    }
  }, 1000);
};

continueBtn.addEventListener("click", () => {
  generatedCode = generateCode();
  sentEmail.innerText = emailInput.value.trim();

  otpDigits.forEach((digit) => (digit.value = ""));
  verifyBtn.disabled = true;
  otpError.innerText = "";

  emailStep.classList.add("d-none");
  otpStep.classList.remove("d-none");

  startCountdown();
  otpDigits[0].focus();
});

let checkOtpComplete = () => {
  let allFilled = [...otpDigits].every((digit) => digit.value.length == 1);
  verifyBtn.disabled = !allFilled;
};

otpDigits.forEach((digit, index) => {
  digit.addEventListener("input", () => {
    digit.value = digit.value.replace(/[^0-9]/g, "");
    if (digit.value.length == 1 && index < otpDigits.length - 1) {
      otpDigits[index + 1].focus();
    }
    checkOtpComplete();
  });

  digit.addEventListener("keydown", (e) => {
    if (e.key == "Backspace" && digit.value == "" && index > 0) {
      otpDigits[index - 1].focus();
    }
  });
});

verifyBtn.addEventListener("click", () => {
  let enteredCode = [...otpDigits].map((digit) => digit.value).join("");

  if (enteredCode.length == 4 && enteredCode === generatedCode) {
    otpError.innerText = "";
    localStorage.setItem("gizastay_logged_in", "1");
    localStorage.setItem("gizastay_email", emailInput.value.trim());
    const redirect = localStorage.getItem("gizastay_login_redirect");
    const pendingBooking = localStorage.getItem("bookingProperty");
    localStorage.removeItem("gizastay_login_redirect");
    window.location.href =
      redirect || (pendingBooking ? "booking-details.html" : "index.html");
  } else {
    otpError.innerText = "incorrect verification code";
  }
});

backBtn.addEventListener("click", (e) => {
  e.preventDefault();
  clearInterval(timer);
  otpStep.classList.add("d-none");
  emailStep.classList.remove("d-none");
});

editEmailLink.addEventListener("click", (e) => {
  e.preventDefault();
  clearInterval(timer);
  otpStep.classList.add("d-none");
  emailStep.classList.remove("d-none");
});
