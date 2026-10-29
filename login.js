import { initializePackDayAuth } from './firebase-auth.js';

const form = document.getElementById('authForm');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const confirmPasswordInput = document.getElementById('confirmPasswordInput');
const confirmPasswordField = document.getElementById('confirmPasswordField');
const submitButton = document.getElementById('submitButton');
const googleButton = document.getElementById('googleButton');
const modeButton = document.getElementById('modeButton');
const forgotButton = document.getElementById('forgotButton');
const message = document.getElementById('message');
const formTitle = document.getElementById('formTitle');
const switchPrompt = document.getElementById('switchPrompt');

let createAccountMode = false;
let authReady = false;

function setMessage(text, isError = true) {
  message.textContent = text;
  message.style.color = isError ? '#ffb4ab' : '#4edea3';
}

function errorMessage(error) {
  switch (error?.code) {
    case 'auth/email-already-in-use':
      return 'That email already has an account. Sign in instead, or reset the password.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/weak-password':
      return 'Choose a password with at least 6 characters.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email or password is incorrect. Check your details or create an account.';
    case 'auth/operation-not-allowed':
      return 'Email and password sign-in is not enabled. The app owner must enable it in Firebase Authentication settings.';
    case 'auth/unauthorized-domain':
      return 'This site is not authorized in Firebase. Add silver0812.github.io to Authentication → Settings → Authorized domains.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a little while, then try again.';
    case 'auth/network-request-failed':
      return 'Could not reach Firebase. Check your internet connection and try again.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the Google sign-in popup. Allow popups for this site and try again.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled.';
    default:
      return error?.code
        ? `Sign-in failed (${error.code}). Please check your details and Firebase settings.`
        : 'Sign-in failed. Check your connection and try again.';
  }
}

function setBusy(busy) {
  submitButton.disabled = busy || !authReady;
  googleButton.disabled = busy || !authReady;
  modeButton.disabled = busy || !authReady;
  forgotButton.disabled = busy || !authReady || createAccountMode;
}

function setMode(createAccount) {
  createAccountMode = createAccount;
  formTitle.textContent = createAccount ? 'Create your account' : 'Welcome back';
  submitButton.textContent = createAccount ? 'Create account' : 'Sign in';
  switchPrompt.textContent = createAccount ? 'Already have an account?' : 'New to PackDay?';
  modeButton.textContent = createAccount ? 'Sign in' : 'Create account';
  confirmPasswordField.hidden = !createAccount;
  confirmPasswordInput.required = createAccount;
  passwordInput.autocomplete = createAccount ? 'new-password' : 'current-password';
  forgotButton.hidden = createAccount;
  setMessage('');
}

function continueIntoApp() {
  const next = new URLSearchParams(location.search).get('next');
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    location.replace(next);
  } else {
    location.replace('./index.html');
  }
}

window.addEventListener('packday-auth-state', (event) => {
  if (!event.detail?.configured) {
    authReady = false;
    setBusy(false);
    setMessage('Firebase Authentication could not start. Check the Firebase web config and your connection.');
    return;
  }
  if (event.detail.user) {
    continueIntoApp();
    return;
  }
  authReady = true;
  setBusy(false);
});

modeButton.addEventListener('click', () => setMode(!createAccountMode));

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!authReady || !window.packdayAuth) {
    setMessage('Connecting to Firebase. Please try again in a moment.');
    return;
  }
  if (createAccountMode && passwordInput.value !== confirmPasswordInput.value) {
    setMessage('The passwords do not match.');
    confirmPasswordInput.focus();
    return;
  }

  setMessage('');
  setBusy(true);
  try {
    if (createAccountMode) {
      await window.packdayAuth.createAccount(emailInput.value.trim(), passwordInput.value);
    } else {
      await window.packdayAuth.signInWithEmail(emailInput.value.trim(), passwordInput.value);
    }
  } catch (error) {
    console.error('PackDay email authentication failed.', error);
    setMessage(errorMessage(error));
    setBusy(false);
  }
});

googleButton.addEventListener('click', async () => {
  if (!authReady || !window.packdayAuth) {
    setMessage('Connecting to Firebase. Please try again in a moment.');
    return;
  }
  setMessage('');
  setBusy(true);
  try {
    await window.packdayAuth.signIn();
  } catch (error) {
    console.error('PackDay Google sign-in failed.', error);
    setMessage(errorMessage(error));
    setBusy(false);
  }
});

forgotButton.addEventListener('click', async () => {
  if (!authReady || !window.packdayAuth) {
    setMessage('Connecting to Firebase. Please try again in a moment.');
    return;
  }
  if (!emailInput.value.trim()) {
    setMessage('Enter your email address first.');
    emailInput.focus();
    return;
  }
  setBusy(true);
  try {
    await window.packdayAuth.sendPasswordReset(emailInput.value.trim());
    setMessage('If an account exists for this address, Firebase will email a password reset link.', false);
  } catch (error) {
    console.error('PackDay could not send a password reset email.', error);
    setMessage(errorMessage(error));
  } finally {
    setBusy(false);
  }
});

setMode(false);
setBusy(true);
initializePackDayAuth(window.PACKDAY_FIREBASE_CONFIG).catch((error) => {
  console.error('PackDay login could not initialize Firebase Authentication.', error);
  authReady = false;
  setBusy(false);
  setMessage('Firebase Authentication could not start. Check your connection and Firebase setup.');
});
