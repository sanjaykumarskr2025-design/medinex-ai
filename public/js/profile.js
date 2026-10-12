/**
 * VitaNex AI — User Profile & Settings
 */

import { apiCall, getUser, clearSession } from './auth.js';
import { showToast, showConfirm } from './app.js';
import { setLanguage } from './translations.js';

async function loadProfile() {
  const user = getUser();
  if (!user) return;

  const emailEl = document.getElementById('profileEmail');
  const joinedEl = document.getElementById('profileJoined');
  const nameInput = document.getElementById('displayName');
  const langSelect = document.getElementById('profileLang');
  const unitsSelect = document.getElementById('unitsSystem');

  if (emailEl) emailEl.textContent = user.email;
  if (joinedEl) joinedEl.textContent = `Member since ${new Date(user.created_at || Date.now()).toLocaleDateString()}`;

  try {
    const res = await apiCall('/api/profile');
    if (res.profile) {
      if (nameInput) nameInput.value = res.profile.display_name || '';
      if (langSelect) langSelect.value = res.profile.preferred_language || 'en';
      if (unitsSelect) unitsSelect.value = res.profile.units_system || 'metric';
    }
  } catch (err) {
    console.error('Failed to load profile settings:', err);
  }

  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.onsubmit = async (e) => {
      e.preventDefault();
      const display_name = nameInput.value.trim();
      const preferred_language = langSelect.value;
      const units_system = unitsSelect.value;

      try {
        await apiCall('/api/profile', {
          method: 'PUT',
          body: JSON.stringify({ display_name, preferred_language, units_system })
        });
        setLanguage(preferred_language);
        showToast('Profile updated successfully!', 'success');
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  }

  const exportAllBtn = document.getElementById('exportAllDataBtn');
  if (exportAllBtn) {
    exportAllBtn.onclick = async () => {
      try {
        const res = await apiCall('/api/records/export/json');
        const blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vitanex-complete-user-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        showToast('All health data exported successfully.', 'success');
      } catch (err) {
        showToast('Export failed: ' + err.message, 'error');
      }
    };
  }

  const deleteAccountBtn = document.getElementById('deleteAccountBtn');
  if (deleteAccountBtn) {
    deleteAccountBtn.onclick = () => {
      showConfirm('Delete Account', 'Are you absolutely sure you want to delete your account and all associated health records? This action is irreversible.', async () => {
        try {
          await apiCall('/api/profile/account', { method: 'DELETE' });
          clearSession();
          showToast('Account deleted.', 'info');
          setTimeout(() => { window.location.href = 'login.html'; }, 1000);
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    };
  }
}

export { loadProfile };
