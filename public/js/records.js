/**
 * VitaNex AI — Health Records Management
 */

import { apiCall } from './auth.js';
import { showToast, showConfirm } from './app.js';

let currentRecordsPage = 1;
let currentFilters = { search: '', type: '', sort: 'date_desc' };

async function loadRecords(page = 1) {
  currentRecordsPage = page;
  const listEl = document.getElementById('recordsList');
  if (!listEl) return;

  listEl.innerHTML = '<div class="loading-skeleton"></div>';

  const params = new URLSearchParams({
    page,
    limit: 10,
    sort: currentFilters.sort,
    ...(currentFilters.type ? { type: currentFilters.type } : {}),
    ...(currentFilters.search ? { search: currentFilters.search } : {})
  });

  try {
    const res = await apiCall(`/api/records?${params.toString()}`);
    const records = res.records || [];

    if (records.length === 0) {
      listEl.innerHTML = '<div class="empty-state">No health records found. Click "+ Add Record" to create one.</div>';
      renderPagination(1, 1);
      return;
    }

    listEl.innerHTML = records.map(r => `
      <div class="glass-card record-card" data-id="${r.id}">
        <div class="record-header">
          <span class="badge badge-${r.record_type}">${r.record_type}</span>
          <span class="text-muted">${r.record_date}</span>
        </div>
        <h4>${escapeHtml(r.title)}</h4>
        <p class="record-notes">${escapeHtml(r.notes || 'No notes provided.')}</p>
        <div class="record-actions">
          <button class="btn btn-outline btn-sm edit-record" data-id="${r.id}">Edit</button>
          <button class="btn btn-danger btn-sm delete-record" data-id="${r.id}">Delete</button>
        </div>
      </div>
    `).join('');

    renderPagination(res.pagination?.page || 1, res.pagination?.totalPages || 1);
    attachRecordListeners();

  } catch (err) {
    listEl.innerHTML = `<p class="error-msg">Failed to load records: ${err.message}</p>`;
  }
}

function renderPagination(currentPage, totalPages) {
  const paginationEl = document.getElementById('recordsPagination');
  if (!paginationEl) return;

  if (totalPages <= 1) {
    paginationEl.innerHTML = '';
    return;
  }

  let html = `<button class="btn btn-outline btn-sm" ${currentPage === 1 ? 'disabled' : ''} onclick="window.changeRecordsPage(${currentPage - 1})">Previous</button>`;
  html += `<span>Page ${currentPage} of ${totalPages}</span>`;
  html += `<button class="btn btn-outline btn-sm" ${currentPage === totalPages ? 'disabled' : ''} onclick="window.changeRecordsPage(${currentPage + 1})">Next</button>`;
  paginationEl.innerHTML = html;
}

window.changeRecordsPage = (page) => loadRecords(page);

function attachRecordListeners() {
  document.querySelectorAll('.delete-record').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      showConfirm('Delete Record', 'Are you sure you want to delete this health record? This action cannot be undone.', async () => {
        try {
          await apiCall(`/api/records/${id}`, { method: 'DELETE' });
          showToast('Record deleted successfully.', 'success');
          loadRecords(currentRecordsPage);
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('recordSearch');
  const typeFilter = document.getElementById('recordTypeFilter');
  const sortSelect = document.getElementById('recordSort');
  const addBtn = document.getElementById('addRecordBtn');
  const exportBtn = document.getElementById('exportRecordsBtn');

  if (searchInput) {
    let debounce;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        currentFilters.search = e.target.value.trim();
        loadRecords(1);
      }, 300);
    });
  }

  if (typeFilter) {
    typeFilter.addEventListener('change', (e) => {
      currentFilters.type = e.target.value;
      loadRecords(1);
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentFilters.sort = e.target.value;
      loadRecords(1);
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      try {
        const res = await apiCall('/api/records/export/json');
        const blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vitanex-health-records-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        showToast('Records exported successfully.', 'success');
      } catch (err) {
        showToast('Export failed: ' + err.message, 'error');
      }
    });
  }

  // Modal setup for adding record can be expanded here
});

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export { loadRecords };
