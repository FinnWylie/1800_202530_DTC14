// -------------------------------------------------------------
// src/loginSignup.js
// -------------------------------------------------------------
// Part of the COMP1800 Projects 1 Course (BCIT).
// Starter code provided for students to use and adapt.
// Manages the login/signup form behaviour and redirects.
// -------------------------------------------------------------

import './styles/style.css';
import {
    loginUser,
    signupUser,
    authErrorMessage,
} from './authentication.js';


// --- Login and Signup Page ---
// Handles toggling between Login/Signup views and form submits
// using plain DOM APIs for simplicity and maintainability.


function initAuthUI() {
    console.log("initAuthUI running!");

    // --- DOM Elements ---
    const alertEl = document.getElementById('authAlert');
    const loginView = document.getElementById('loginView');
    const signupView = document.getElementById('signupView');
    const toSignupBtn = document.getElementById('toSignup');
    const toLoginBtn = document.getElementById('toLogin');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const redirectUrl = 'main.html';
    console.log("Toggling works!", toSignupBtn, toLoginBtn);

    // --- Helper Functions ---
    // Toggle element visibility
    function setVisible(el, visible) {
        if (el) {
            el.classList.toggle('hidden', !visible);
        }
    }

    // Show error message with accessibility and auto-hide
    let errorTimeout;
    function showError(msg) {
        if (!alertEl) return;

        alertEl.textContent = msg || '';
        alertEl.classList.remove('hidden');
        clearTimeout(errorTimeout);
        errorTimeout = setTimeout(hideError, 5000); // Auto-hide after 5s
    }

    // Hide error message
    function hideError() {
        if (!alertEl) return;

        alertEl.classList.add('hidden');
        alertEl.textContent = '';
        clearTimeout(errorTimeout);
    }

    // Enable/disable submit button for forms
    function setSubmitDisabled(form, disabled) {
        const submitBtn = form?.querySelector('[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = disabled;
            if (disabled) {
                submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
    }

    // --- Event Listeners ---
    // Toggle buttons
    toSignupBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        hideError();
        setVisible(loginView, false);
        setVisible(signupView, true);

        // Clear login form
        if (loginForm) loginForm.reset();

        // Focus first input in signup
        signupView?.querySelector('input')?.focus();
    });

    // Toggle to login view
    toLoginBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        hideError();
        setVisible(signupView, false);
        setVisible(loginView, true);

        // Clear signup form
        if (signupForm) signupForm.reset();

        // Focus first input in login
        loginView?.querySelector('input')?.focus();
    });

    // Login form submit
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();

        const email = document.querySelector('#loginEmail')?.value?.trim() ?? '';
        const password = document.querySelector('#loginPassword')?.value ?? '';

        if (!email || !password) {
            showError('Please enter your email and password.');
            return;
        }

        setSubmitDisabled(loginForm, true);

        try {
            await loginUser(email, password);
            window.location.href = redirectUrl;
        } catch (err) {
            showError(authErrorMessage(err));
            console.error('Login error:', err);
        } finally {
            setSubmitDisabled(loginForm, false);
        }
    });

    // Signup form submit
    signupForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();

        const name = document.querySelector('#signupName')?.value?.trim() ?? '';
        const email = document.querySelector('#signupEmail')?.value?.trim() ?? '';
        const password = document.querySelector('#signupPassword')?.value ?? '';

        if (!name || !email || !password) {
            showError('Please fill in name, email, and password.');
            return;
        }

        if (password.length < 6) {
            showError('Password must be at least 6 characters long.');
            return;
        }

        setSubmitDisabled(signupForm, true);

        try {
            await signupUser(name, email, password);
            window.location.href = redirectUrl;
        } catch (err) {
            showError(authErrorMessage(err));
            console.error('Signup error:', err);
        } finally {
            setSubmitDisabled(signupForm, false);
        }
    });
}

// --- Initialize UI on DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', initAuthUI);
