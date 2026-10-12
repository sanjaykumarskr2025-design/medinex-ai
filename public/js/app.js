/**
 * MediNex AI — Main Application Controller & UI Helpers
 */

import { getUser, getToken } from './auth.js';
import { init3DScene } from './scene3d.js';
import { loadDashboardOverview } from './dashboard.js';
import { loadRecords } from './records.js';
import { loadAnalytics } from './analytics.js';
import { loadCopilot } from './copilot.js';
import { loadAppointments } from './appointments.js';
import { loadReminders } from './reminders.js';
import { loadProfile } from './profile.js';

// Global Toast Notification
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> <span>${message}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Global Confirmation Modal
function showConfirm(title, message, onConfirm) {
  const modal = document.getElementById('confirmModal');
  if (!modal) return;

  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMessage').textContent = message;
  modal.classList.add('active');

  const okBtn = document.getElementById('confirmOk');
  const cancelBtn = document.getElementById('confirmCancel');

  const cleanup = () => {
    modal.classList.remove('active');
    okBtn.replaceWith(okBtn.cloneNode(true));
    cancelBtn.replaceWith(cancelBtn.cloneNode(true));
  };

  document.getElementById('confirmOk').addEventListener('click', () => {
    cleanup();
    onConfirm();
  }, { once: true });

  document.getElementById('confirmCancel').addEventListener('click', cleanup, { once: true });
}

// Navigation Router
function navigate(sectionId) {
  document.querySelectorAll('.page-section').forEach(sec => {
    sec.classList.remove('active');
  });
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
    item.classList.remove('active');
  });

  const targetSection = document.getElementById(`section-${sectionId}`);
  const targetNav = document.querySelector(`.sidebar-nav .nav-item[href="#${sectionId}"]`);

  if (targetSection) targetSection.classList.add('active');
  if (targetNav) targetNav.classList.add('active');

  // Update page title
  const titles = {
    dashboard: 'Dashboard',
    records: 'Health Records',
    metrics: 'Health Analytics',
    copilot: 'AI Health Copilot',
    appointments: 'Appointments',
    reminders: 'Reminders',
    profile: 'Profile & Settings'
  };
  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = titles[sectionId] || 'Dashboard';

  // Load section data
  if (sectionId === 'dashboard') loadDashboardOverview();
  if (sectionId === 'records') loadRecords();
  if (sectionId === 'metrics') loadAnalytics();
  if (sectionId === 'copilot') loadCopilot();
  if (sectionId === 'appointments') loadAppointments();
  if (sectionId === 'reminders') loadReminders();
  if (sectionId === 'profile') loadProfile();

  window.location.hash = sectionId;
}

document.addEventListener('DOMContentLoaded', () => {
  if (!window.location.pathname.includes('dashboard.html')) return;

  // User Greeting & Avatar
  const user = getUser();
  if (user) {
    const name = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User';
    const greetingEl = document.getElementById('userGreeting');
    const avatarEl = document.getElementById('userAvatar');
    const profileAvatar = document.getElementById('profileAvatar');

    if (greetingEl) greetingEl.textContent = `Hello, ${name}`;
    if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();
    if (profileAvatar) profileAvatar.textContent = name.charAt(0).toUpperCase();
  }

  // Sidebar navigation click handlers
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const section = item.getAttribute('href').replace('#', '');
      navigate(section);

      // Close mobile sidebar
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.remove('open');
    });
  });

  // Mobile menu toggle
  const menuToggle = document.getElementById('menuToggle');
  const sidebarClose = document.getElementById('sidebarClose');
  const sidebar = document.getElementById('sidebar');

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
  if (sidebarClose && sidebar) {
    sidebarClose.addEventListener('click', () => sidebar.classList.remove('open'));
  }

  // Quick Action buttons
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      if (action === 'addRecord') {
        navigate('records');
        document.getElementById('addRecordBtn')?.click();
      } else if (action === 'addAppointment') {
        navigate('appointments');
        document.getElementById('addAppointmentBtn')?.click();
      } else if (action === 'logMetric') {
        navigate('metrics');
        document.getElementById('addMetricBtn')?.click();
      } else if (action === 'openCopilot') {
        navigate('copilot');
      }
    });
  });

  // Init 3D mini scene
  init3DScene('miniScene', true);

  // Handle initial hash routing
  const initialHash = window.location.hash.replace('#', '') || 'dashboard';
  navigate(initialHash);
});

export { showToast, showConfirm, navigate };
