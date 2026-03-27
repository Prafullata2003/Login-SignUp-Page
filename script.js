/**
 * script.js — AuthFlow Authentication Logic
 * ==========================================
 * Handles:
 *  - Tab switching between Login and Signup
 *  - Form validation for both forms
 *  - Password visibility toggle
 *  - Real-time password strength meter
 *  - Loading state simulation on submit
 */

/* =============================================
   1. TAB SWITCHING
============================================= */

/**
 * Switches between the Login and Signup tabs.
 * Updates aria attributes, active classes, and
 * slides the indicator pill.
 *
 * @param {'login'|'signup'} tab - The tab to activate
 */
function switchTab(tab) {
  const loginTabBtn  = document.getElementById('loginTabBtn');
  const signupTabBtn = document.getElementById('signupTabBtn');
  const loginForm    = document.getElementById('loginForm');
  const signupForm   = document.getElementById('signupForm');
  const indicator    = document.getElementById('tabIndicator');

  if (tab === 'login') {
    /* --- Activate Login --- */
    loginTabBtn.classList.add('active');
    signupTabBtn.classList.remove('active');
    loginTabBtn.setAttribute('aria-selected', 'true');
    signupTabBtn.setAttribute('aria-selected', 'false');

    /* Show / hide forms */
    loginForm.classList.add('active');
    signupForm.classList.remove('active');

    /* Slide indicator to the left */
    indicator.classList.remove('right');

  } else {
    /* --- Activate Signup --- */
    signupTabBtn.classList.add('active');
    loginTabBtn.classList.remove('active');
    signupTabBtn.setAttribute('aria-selected', 'true');
    loginTabBtn.setAttribute('aria-selected', 'false');

    /* Show / hide forms */
    signupForm.classList.add('active');
    loginForm.classList.remove('active');

    /* Slide indicator to the right */
    indicator.classList.add('right');
  }

  /* Clear success banners when switching tabs */
  clearSuccessBanners();
}


/* =============================================
   2. VALIDATION HELPERS
============================================= */

/**
 * Marks an input group as having an error and shows the message.
 *
 * @param {string} groupId   - ID of the .input-group element
 * @param {string} errorId   - ID of the .error-msg span
 * @param {string} message   - The error text to display
 */
function showError(groupId, errorId, message) {
  const group = document.getElementById(groupId);
  const error = document.getElementById(errorId);
  if (group) group.classList.add('has-error');
  if (error) error.textContent = message;
}

/**
 * Clears error state from an input group.
 *
 * @param {string} groupId - ID of the .input-group element
 * @param {string} errorId - ID of the .error-msg span
 */
function clearError(groupId, errorId) {
  const group = document.getElementById(groupId);
  const error = document.getElementById(errorId);
  if (group) group.classList.remove('has-error');
  if (error) error.textContent = '';
}

/**
 * Validates an email string using a standard regex.
 *
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates a password:
 *  - Minimum 8 characters
 *  - At least one uppercase letter
 *  - At least one lowercase letter
 *  - At least one digit
 *
 * @param {string} password
 * @returns {{ valid: boolean, message: string }}
 */
function validatePassword(password) {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Include at least one uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Include at least one lowercase letter.' };
  }
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Include at least one number.' };
  }
  return { valid: true, message: '' };
}


/* =============================================
   3. PASSWORD STRENGTH METER
============================================= */

/**
 * Calculates password strength (0–4) and updates
 * the visual strength bar and label in real time.
 *
 * Strength levels:
 *  0 – Very Weak (red)
 *  1 – Weak      (orange)
 *  2 – Fair      (yellow)
 *  3 – Good      (lime)
 *  4 – Strong    (green)
 *
 * @param {string} password - The current password value
 */
function updatePasswordStrength(password) {
  const bar   = document.getElementById('strengthBar');
  const label = document.getElementById('strengthLabel');

  if (!bar || !label) return;

  /* Calculate score based on criteria */
  let score = 0;
  if (password.length >= 8)         score++;
  if (/[A-Z]/.test(password))       score++;
  if (/[a-z]/.test(password))       score++;
  if (/\d/.test(password))          score++;
  if (/[^A-Za-z0-9]/.test(password)) score++; // bonus for special chars

  /* Cap at 4 */
  score = Math.min(score, 4);

  /* Map score to visual properties */
  const levels = [
    { width: '0%',   color: 'transparent',          text: '' },
    { width: '25%',  color: 'hsl(0, 80%, 60%)',     text: 'Weak' },
    { width: '50%',  color: 'hsl(30, 90%, 55%)',    text: 'Fair' },
    { width: '75%',  color: 'hsl(60, 80%, 50%)',    text: 'Good' },
    { width: '100%', color: 'hsl(145, 65%, 50%)',   text: 'Strong' },
  ];

  /* Hide meter when field is empty */
  if (password.length === 0) {
    bar.style.width     = '0%';
    label.textContent   = '';
    label.style.color   = '';
    return;
  }

  bar.style.width     = levels[score].width;
  bar.style.background = levels[score].color;
  label.textContent   = levels[score].text;
  label.style.color   = levels[score].color;
}


/* =============================================
   4. PASSWORD VISIBILITY TOGGLE
============================================= */

/**
 * Toggles the input type between 'password' and 'text'
 * and updates the eye icon to reflect the current state.
 *
 * @param {string} inputId - ID of the password input
 * @param {HTMLElement} btn - The eye toggle button element
 */
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');

  /* Swap icon: open eye vs. crossed eye */
  const icon = btn.querySelector('.eye-icon');
  if (isHidden) {
    /* Eye with line through it (password visible) */
    icon.innerHTML = `
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    `;
  } else {
    /* Normal eye (password hidden) */
    icon.innerHTML = `
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
      <circle cx="12" cy="12" r="3"/>
    `;
  }
}


/* =============================================
   5. LOGIN FORM HANDLER
============================================= */

/**
 * Validates and handles Login form submission.
 * Runs validations on email and password fields.
 * If valid, simulates an async login request.
 *
 * @param {Event} event - The form submit event
 */
function handleLogin(event) {
  event.preventDefault();

  const email    = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  /* Reset previous errors */
  clearError('login-email-group',    'login-email-error');
  clearError('login-password-group', 'login-password-error');

  let hasError = false;

  /* --- Email Validation --- */
  if (!email.trim()) {
    showError('login-email-group', 'login-email-error', 'Email is required.');
    hasError = true;
  } else if (!isValidEmail(email)) {
    showError('login-email-group', 'login-email-error', 'Please enter a valid email address.');
    hasError = true;
  }

  /* --- Password Validation (basic: non-empty) --- */
  if (!password) {
    showError('login-password-group', 'login-password-error', 'Password is required.');
    hasError = true;
  } else if (password.length < 6) {
    showError('login-password-group', 'login-password-error', 'Password must be at least 6 characters.');
    hasError = true;
  }

  /* Stop if there are errors */
  if (hasError) return;

  /* Show loading state and simulate async request */
  simulateSubmit('loginSubmitBtn', 'loginSuccess');
}


/* =============================================
   6. SIGNUP FORM HANDLER
============================================= */

/**
 * Validates and handles Signup form submission.
 * Checks name, email, password rules, confirm-password
 * match, and the T&C checkbox.
 *
 * @param {Event} event - The form submit event
 */
function handleSignup(event) {
  event.preventDefault();

  const name     = document.getElementById('signupName').value;
  const email    = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const confirm  = document.getElementById('signupConfirm').value;
  const agreed   = document.getElementById('agreeTerms').checked;

  /* Reset previous errors */
  clearError('signup-name-group',    'signup-name-error');
  clearError('signup-email-group',   'signup-email-error');
  clearError('signup-password-group','signup-password-error');
  clearError('signup-confirm-group', 'signup-confirm-error');
  clearError('',                     'signup-terms-error');

  let hasError = false;

  /* --- Name Validation --- */
  if (!name.trim()) {
    showError('signup-name-group', 'signup-name-error', 'Full name is required.');
    hasError = true;
  } else if (name.trim().length < 2) {
    showError('signup-name-group', 'signup-name-error', 'Name must be at least 2 characters.');
    hasError = true;
  }

  /* --- Email Validation --- */
  if (!email.trim()) {
    showError('signup-email-group', 'signup-email-error', 'Email is required.');
    hasError = true;
  } else if (!isValidEmail(email)) {
    showError('signup-email-group', 'signup-email-error', 'Please enter a valid email address.');
    hasError = true;
  }

  /* --- Password Validation (strict) --- */
  const pwCheck = validatePassword(password);
  if (!password) {
    showError('signup-password-group', 'signup-password-error', 'Password is required.');
    hasError = true;
  } else if (!pwCheck.valid) {
    showError('signup-password-group', 'signup-password-error', pwCheck.message);
    hasError = true;
  }

  /* --- Confirm Password Validation --- */
  if (!confirm) {
    showError('signup-confirm-group', 'signup-confirm-error', 'Please confirm your password.');
    hasError = true;
  } else if (password !== confirm) {
    showError('signup-confirm-group', 'signup-confirm-error', 'Passwords do not match.');
    hasError = true;
  }

  /* --- Terms & Conditions Checkbox --- */
  if (!agreed) {
    document.getElementById('signup-terms-error').textContent = 'You must agree to the Terms of Service.';
    document.getElementById('signup-terms-error').style.display = 'flex';
    hasError = true;
  }

  /* Stop if there are errors */
  if (hasError) return;

  /* Show loading state and simulate async request */
  simulateSubmit('signupSubmitBtn', 'signupSuccess');
}


/* =============================================
   7. UTILITY FUNCTIONS
============================================= */

/**
 * Simulates an async form submission:
 *  1. Disables button and shows spinner
 *  2. After 1.5s, hides spinner and shows success banner
 *
 * @param {string} btnId     - ID of the submit button
 * @param {string} successId - ID of the success banner element
 */
function simulateSubmit(btnId, successId) {
  const btn     = document.getElementById(btnId);
  const success = document.getElementById(successId);

  /* Enter loading state */
  btn.classList.add('loading');
  btn.disabled = true;

  setTimeout(() => {
    /* Exit loading state */
    btn.classList.remove('loading');
    btn.disabled = false;

    /* Show success banner */
    if (success) {
      success.style.display = 'flex';
      success.removeAttribute('aria-hidden');
    }
  }, 1500);
}

/**
 * Hides all success banners (called on tab switch).
 */
function clearSuccessBanners() {
  const banners = document.querySelectorAll('.success-banner');
  banners.forEach(b => {
    b.style.display = 'none';
    b.setAttribute('aria-hidden', 'true');
  });
}
