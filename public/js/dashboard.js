/**
 * MediNex AI — Dashboard Overview Logic
 */

import { apiCall } from './auth.js';

let dashboardChartInstance = null;

async function loadDashboardOverview() {
  const dateEl = document.getElementById('todayDate');
  if (dateEl) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = new Date().toLocaleDateString(undefined, options);
  }

  try {
    // Fetch stats in parallel
    const [recordsRes, apptsRes, remindersRes, metricsRes] = await Promise.all([
      apiCall('/api/records?limit=1'),
      apiCall('/api/appointments?upcoming=true'),
      apiCall('/api/reminders?active=true'),
      apiCall('/api/metrics/summary')
    ]);

    // Update stats counters
    document.getElementById('statRecords').textContent = recordsRes.pagination?.total || recordsRes.records?.length || 0;
    document.getElementById('statAppointments').textContent = apptsRes.appointments?.length || 0;
    document.getElementById('statReminders').textContent = remindersRes.reminders?.length || 0;
    document.getElementById('statMetrics').textContent = metricsRes.totalCount || 0;

    // Load recent records
    const recentRecordsContainer = document.getElementById('recentRecords');
    const recentRecords = recordsRes.records || [];
    if (recentRecords.length === 0) {
      recentRecordsContainer.innerHTML = '<p class="text-muted">No health records found yet.</p>';
    } else {
      recentRecordsContainer.innerHTML = recentRecords.slice(0, 3).map(r => `
        <div class="dashboard-item">
          <div>
            <strong>${escapeHtml(r.title)}</strong>
            <span class="badge badge-${r.record_type}">${r.record_type}</span>
          </div>
          <span class="text-muted">${r.record_date}</span>
        </div>
      `).join('');
    }

    // Load upcoming appointments
    const upcomingApptsContainer = document.getElementById('upcomingAppts');
    const upcomingAppts = apptsRes.appointments || [];
    if (upcomingAppts.length === 0) {
      upcomingApptsContainer.innerHTML = '<p class="text-muted">No upcoming appointments scheduled.</p>';
    } else {
      upcomingApptsContainer.innerHTML = upcomingAppts.slice(0, 3).map(a => `
        <div class="dashboard-item">
          <div>
            <strong>${escapeHtml(a.provider_name)}</strong>
            <p class="text-muted">${escapeHtml(a.purpose)}</p>
          </div>
          <span>${new Date(a.appointment_date).toLocaleDateString()}</span>
        </div>
      `).join('');
    }

    // Load trend chart
    loadDashboardChart();

  } catch (err) {
    console.error('Failed to load dashboard overview:', err);
  }
}

async function loadDashboardChart() {
  const canvas = document.getElementById('dashboardChart');
  const noMetricsMsg = document.getElementById('noMetricsMsg');
  if (!canvas) return;

  try {
    const res = await apiCall('/api/metrics?type=heart_rate&limit=30');
    const metrics = res.metrics || [];

    if (metrics.length === 0) {
      canvas.style.display = 'none';
      if (noMetricsMsg) noMetricsMsg.style.display = 'block';
      return;
    }

    canvas.style.display = 'block';
    if (noMetricsMsg) noMetricsMsg.style.display = 'none';

    const labels = metrics.map(m => new Date(m.recorded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })).reverse();
    const data = metrics.map(m => m.value).reverse();

    if (dashboardChartInstance) {
      dashboardChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    dashboardChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Heart Rate (bpm)',
          data: data,
          borderColor: '#00d4ff',
          backgroundColor: 'rgba(0, 212, 255, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#8b8fb0' } },
          y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#8b8fb0' } }
        }
      }
    });
  } catch (err) {
    console.error('Failed to load dashboard chart:', err);
  }
}

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export { loadDashboardOverview };
