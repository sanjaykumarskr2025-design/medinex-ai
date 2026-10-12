/**
 * MediNex AI — Appointments Management
 */

import { apiCall } from './auth.js';
import { showToast, showConfirm } from './app.js';

let currentTab = 'upcoming';

async function loadAppointments() {
  const listEl = document.getElementById('appointmentsList');
  if (!listEl) return;

  listEl.innerHTML = '<div class="loading-skeleton"></div>';

  try {
    const res = await apiCall('/api/appointments');
    const appointments = res.appointments || [];

    const now = new Date();
    const filtered = appointments.filter(a => {
      const apptDate = new Date(a.appointment_date);
      if (currentTab === 'upcoming') return apptDate >= now && a.status === 'scheduled';
      if (currentTab === 'past') return apptDate < now || a.status === 'completed';
      return true;
    });

    if (filtered.length === 0) {
      listEl.innerHTML = '<div class="empty-state">No appointments found. Click "+ Add Appointment" to schedule one.</div>';
      attachTabListeners();
      return;
    }

    listEl.innerHTML = filtered.map(a => `
      <div class="glass-card appointment-card">
        <div class="appointment-header">
          <div>
            <h3>${escapeHtml(a.provider_name)}</h3>
            <p class="text-muted">${escapeHtml(a.purpose)}</p>
          </div>
          <span class="badge badge-${a.status}">${a.status}</span>
        </div>
        <div class="appointment-details">
          <span>📅 ${new Date(a.appointment_date).toLocaleString()}</span>
          <span>📍 ${escapeHtml(a.location || 'Not specified')}</span>
        </div>
        <p class="appointment-notes">${escapeHtml(a.notes || '')}</p>
        <div class="appointment-actions">
          ${a.status === 'scheduled' ? `<button class="btn btn-outline btn-sm complete-appt" data-id="${a.id}">Mark Completed</button>` : ''}
          <button class="btn btn-danger btn-sm delete-appt" data-id="${a.id}">Delete</button>
        </div>
      </div>
    `).join('');

    attachTabListeners();
    attachAppointmentListeners();

  } catch (err) {
    listEl.innerHTML = `<p class="error-msg">Failed to load appointments: ${err.message}</p>`;
  }
}

function attachTabListeners() {
  document.querySelectorAll('.tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTab = tab.getAttribute('data-tab');
      loadAppointments();
    });
  });
}

function attachAppointmentListeners() {
  document.querySelectorAll('.delete-appt').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      showConfirm('Delete Appointment', 'Are you sure you want to delete this appointment?', async () => {
        try {
          await apiCall(`/api/appointments/${id}`, { method: 'DELETE' });
          showToast('Appointment deleted.', 'success');
          loadAppointments();
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    });
  });

  document.querySelectorAll('.complete-appt').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      try {
        await apiCall(`/api/appointments/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'completed' })
        });
        showToast('Appointment marked as completed.', 'success');
        loadAppointments();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.getElementById('addAppointmentBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const provider = prompt('Provider / Doctor Name:');
      if (!provider) return;
      const purpose = prompt('Purpose of appointment:', 'Check-up');
      const date = prompt('Date and Time (YYYY-MM-DDTHH:MM):', new Date().toISOString().slice(0, 16));

      if (!date) return;

      apiCall('/api/appointments', {
        method: 'POST',
        body: JSON.stringify({
          provider_name: provider,
          purpose: purpose || 'Check-up',
          appointment_date: new Date(date).toISOString(),
          location: 'Clinic'
        })
      }).then(() => {
        showToast('Appointment scheduled successfully!', 'success');
        loadAppointments();
      }).catch(err => {
        showToast(err.message, 'error');
      });
    });
  }
});

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export { loadAppointments };
