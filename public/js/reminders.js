/**
 * VitaNex AI — Reminders Management
 */

import { apiCall } from './auth.js';
import { showToast, showConfirm } from './app.js';

let reminderFilter = 'active';

async function loadReminders() {
  const listEl = document.getElementById('remindersList');
  if (!listEl) return;

  listEl.innerHTML = '<div class="loading-skeleton"></div>';

  try {
    const res = await apiCall('/api/reminders');
    const reminders = res.reminders || [];

    const filtered = reminders.filter(r => {
      if (reminderFilter === 'active') return !r.is_completed;
      if (reminderFilter === 'completed') return r.is_completed;
      return true;
    });

    if (filtered.length === 0) {
      listEl.innerHTML = '<div class="empty-state">No reminders found. Click "+ Add Reminder" to create one.</div>';
      attachFilterListeners();
      return;
    }

    listEl.innerHTML = filtered.map(r => `
      <div class="glass-card reminder-card ${r.is_completed ? 'completed' : ''}">
        <div class="reminder-content">
          <input type="checkbox" ${r.is_completed ? 'checked' : ''} class="complete-reminder" data-id="${r.id}">
          <div>
            <strong>${escapeHtml(r.title)}</strong>
            <span class="badge badge-${r.reminder_type}">${r.reminder_type}</span>
            <p class="text-muted">Due: ${new Date(r.due_date).toLocaleString()}</p>
          </div>
        </div>
        <button class="btn btn-danger btn-sm delete-reminder" data-id="${r.id}">Delete</button>
      </div>
    `).join('');

    attachFilterListeners();
    attachReminderListeners();

  } catch (err) {
    listEl.innerHTML = `<p class="error-msg">Failed to load reminders: ${err.message}</p>`;
  }
}

function attachFilterListeners() {
  document.querySelectorAll('.reminder-filters .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.reminder-filters .filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      reminderFilter = btn.getAttribute('data-filter');
      loadReminders();
    });
  });
}

function attachReminderListeners() {
  document.querySelectorAll('.complete-reminder').forEach(checkbox => {
    checkbox.addEventListener('change', async (e) => {
      const id = checkbox.getAttribute('data-id');
      try {
        await apiCall(`/api/reminders/${id}/complete`, {
          method: 'PATCH',
          body: JSON.stringify({ is_completed: e.target.checked })
        });
        showToast('Reminder status updated.', 'success');
        loadReminders();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });

  document.querySelectorAll('.delete-reminder').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      showConfirm('Delete Reminder', 'Are you sure you want to delete this reminder?', async () => {
        try {
          await apiCall(`/api/reminders/${id}`, { method: 'DELETE' });
          showToast('Reminder deleted.', 'success');
          loadReminders();
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.getElementById('addReminderBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const title = prompt('Reminder Title (e.g., Take Blood Pressure Medication):');
      if (!title) return;
      const dueDate = prompt('Due Date and Time (YYYY-MM-DDTHH:MM):', new Date().toISOString().slice(0, 16));
      if (!dueDate) return;

      apiCall('/api/reminders', {
        method: 'POST',
        body: JSON.stringify({
          title,
          reminder_type: 'medication',
          due_date: new Date(dueDate).toISOString(),
          recurrence: 'none'
        })
      }).then(() => {
        showToast('Reminder added successfully!', 'success');
        loadReminders();
      }).catch(err => {
        showToast(err.message, 'error');
      });
    });
  }

  const notifToggle = document.getElementById('notifToggle');
  if (notifToggle && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      notifToggle.textContent = 'Enabled';
      notifToggle.disabled = true;
    }
    notifToggle.addEventListener('click', async () => {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        notifToggle.textContent = 'Enabled';
        notifToggle.disabled = true;
        showToast('Browser notifications enabled!', 'success');
      } else {
        showToast('Notification permission denied.', 'warning');
      }
    });
  }
});

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export { loadReminders };
