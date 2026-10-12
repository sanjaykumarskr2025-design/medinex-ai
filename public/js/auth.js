/**
 * VitaNex AI — Authentication Client
 */

import { showToast } from './app.js';

const TOKEN_KEY = 'vitanex_auth_token';
const USER_KEY = 'vitanex_user';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getUser() {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function apiCall(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'An error occurred during API request.');
    }
    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// Handle login page forms
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const forgotForm = document.getElementById('forgotForm');
  const logoutBtn = document.getElementById('logoutBtn');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = loginForm.email.value.trim();
      const password = loginForm.password.value;
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      if (!email || !password) {
        showToast('Please enter both email and password.', 'error');
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing in...';
        const res = await apiCall('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });

        setSession(res.token, res.user);
        showToast('Successfully signed in!', 'success');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
      } catch (err) {
        showToast(err.message, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const display_name = signupForm.displayName?.value.trim() || '';
      const email = signupForm.email.value.trim();
      const password = signupForm.password.value;
      const confirmPassword = signupForm.confirmPassword?.value;
      const submitBtn = signupForm.querySelector('button[type="submit"]');

      if (!email || !password) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }
      if (password !== confirmPassword) {
        showToast('Passwords do not match.', 'error');
        return;
      }
      if (password.length < 6) {
        showToast('Password must be at least 6 characters.', 'error');
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating account...';
        const res = await apiCall('/api/auth/signup', {
          method: 'POST',
          body: JSON.stringify({ email, password, display_name })
        });

        if (res.token) {
          setSession(res.token, res.user);
          showToast('Account created successfully!', 'success');
          setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
        } else {
          showToast('Account created! Please check your email to confirm.', 'success');
          signupForm.reset();
        }
      } catch (err) {
        showToast(err.message, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Get Started';
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await apiCall('/api/auth/logout', { method: 'POST' });
      } catch (e) {
        // ignore network error on logout
      }
      clearSession();
      showToast('Signed out successfully.', 'info');
      setTimeout(() => { window.location.href = 'login.html'; }, 500);
    });
  }

  // Protect dashboard.html
  if (window.location.pathname.includes('dashboard.html')) {
    if (!getToken()) {
      window.location.href = 'login.html';
    }
  }
});

export { getToken, getUser, setSession, clearSession, apiCall };
