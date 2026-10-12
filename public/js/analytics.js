/**
 * MediNex AI — Health Analytics & Metrics Logic
 */

import { apiCall } from './auth.js';
import { showToast } from './app.js';

let metricChartInstance = null;
let currentMetricType = 'heart_rate';

async function loadAnalytics() {
  const typeButtons = document.querySelectorAll('.metric-type-btn');
  typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      typeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMetricType = btn.getAttribute('data-type');
      document.getElementById('currentMetricTitle').textContent = btn.textContent;
      fetchAndRenderMetricData();
    });
  });

  const dateRangeSelect = document.getElementById('metricDateRange');
  if (dateRangeSelect) {
    dateRangeSelect.addEventListener('change', () => fetchAndRenderMetricData());
  }

  const addMetricBtn = document.getElementById('addMetricBtn');
  if (addMetricBtn) {
    addMetricBtn.addEventListener('click', () => openMetricModal());
  }

  fetchAndRenderMetricData();
}

async function fetchAndRenderMetricData() {
  const canvas = document.getElementById('metricChart');
  const summaryEl = document.getElementById('metricSummary');
  const listEl = document.getElementById('metricsList');
  const days = document.getElementById('metricDateRange')?.value || 30;

  if (!canvas) return;

  try {
    const res = await apiCall(`/api/metrics?type=${currentMetricType}&days=${days}`);
    const metrics = res.metrics || [];

    // Render Summary
    if (metrics.length === 0) {
      summaryEl.innerHTML = '<p class="text-muted">No data logged for this metric yet.</p>';
      listEl.innerHTML = '<p class="text-muted">No measurements recorded.</p>';
      if (metricChartInstance) metricChartInstance.destroy();
      return;
    }

    const values = metrics.map(m => Number(m.value));
    const latest = values[0];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
    const unit = metrics[0].unit || '';

    summaryEl.innerHTML = `
      <div class="summary-stats">
        <div class="stat-box"><span>Latest</span><strong>${latest} ${unit}</strong></div>
        <div class="stat-box"><span>Average</span><strong>${avg} ${unit}</strong></div>
        <div class="stat-box"><span>Min</span><strong>${min} ${unit}</strong></div>
        <div class="stat-box"><span>Max</span><strong>${max} ${unit}</strong></div>
      </div>
    `;

    // Render List
    listEl.innerHTML = metrics.slice(0, 5).map(m => `
      <div class="metric-row">
        <span>${new Date(m.recorded_at).toLocaleString()}</span>
        <strong>${m.value} ${m.unit}</strong>
      </div>
    `).join('');

    // Render Chart
    const labels = metrics.map(m => new Date(m.recorded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })).reverse();
    const data = metrics.map(m => m.value).reverse();

    if (metricChartInstance) metricChartInstance.destroy();

    const ctx = canvas.getContext('2d');
    metricChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: `${currentMetricType} (${unit})`,
          data,
          borderColor: '#00d4ff',
          backgroundColor: 'rgba(0, 212, 255, 0.15)',
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointBackgroundColor: '#00d4ff'
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
    console.error('Failed to load metrics:', err);
  }
}

function openMetricModal() {
  const value = prompt(`Enter value for ${currentMetricType}:`);
  if (!value) return;
  const unit = prompt('Enter unit (e.g., bpm, kg, mmHg):', 'bpm');

  apiCall('/api/metrics', {
    method: 'POST',
    body: JSON.stringify({
      metric_type: currentMetricType,
      value: Number(value),
      unit: unit || 'units',
      recorded_at: new Date().toISOString()
    })
  }).then(() => {
    showToast('Metric logged successfully!', 'success');
    fetchAndRenderMetricData();
  }).catch(err => {
    showToast(err.message, 'error');
  });
}

export { loadAnalytics };
