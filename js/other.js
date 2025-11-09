// Other expenses page renderer
async function renderOther(container) {
  const data = await window.electronAPI.getOtherData();
  
  if (!data.success) {
    container.innerHTML = `<div class="p-5"><p class="text-error">Error loading other expenses: ${data.error}</p></div>`;
    return;
  }
  
  const { other } = data.data;
  
  // Calculate stats
  const totalSpent = other.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
  const currentYear = new Date().getFullYear();
  const thisYearExpenses = other.filter(item => new Date(item.date).getFullYear() === currentYear);
  const thisYearTotal = thisYearExpenses.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
  
  // Group by type
  const typeStats = {};
  other.forEach(item => {
    const type = item.type || 'Uncategorized';
    if (!typeStats[type]) {
      typeStats[type] = { count: 0, total: 0 };
    }
    typeStats[type].count++;
    typeStats[type].total += parseFloat(item.price || 0);
  });
  
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-receipt"></i>
        Other Expenses
      </h1>
      <p class="page-subtitle">Track miscellaneous expenses and purchases</p>
    </div>
    
    <div class="p-5">
      
      <!-- Stats -->
      <div class="grid grid-4" style="gap: 24px; margin-bottom: 32px;">
        <div class="stat-card">
          <div class="stat-label">Total Expenses</div>
          <div class="stat-value">${formatCurrency(totalSpent)}</div>
          <div class="stat-change positive">
            <i class="fas fa-chart-line"></i>
            <span>All Time</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-label">This Year</div>
          <div class="stat-value">${formatCurrency(thisYearTotal)}</div>
          <div class="stat-change">
            <i class="fas fa-calendar"></i>
            <span>${currentYear}</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-label">Total Entries</div>
          <div class="stat-value">${other.length}</div>
          <div class="stat-change">
            <i class="fas fa-list"></i>
            <span>Recorded</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-label">Categories</div>
          <div class="stat-value">${Object.keys(typeStats).length}</div>
          <div class="stat-change">
            <i class="fas fa-tags"></i>
            <span>Different Types</span>
          </div>
        </div>
      </div>
      
      <!-- Category Breakdown -->
      <div class="grid grid-3" style="gap: 24px; margin-bottom: 32px;">
        <h3 style="grid-column: 1 / -1; font-size: 20px; font-weight: 600; margin-bottom: -8px;">
          <i class="fas fa-chart-pie"></i> Expense Categories
        </h3>
        ${Object.entries(typeStats).map(([type, stats]) => `
          <div class="card">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
              <div class="card-icon" style="background: var(--gradient-5)">
                <i class="fas fa-tag"></i>
              </div>
              <div>
                <h3 style="font-size: 18px; font-weight: 600;">${type}</h3>
                <p style="color: var(--text-muted); font-size: 13px;">${stats.count} entries</p>
              </div>
            </div>
            <div style="font-size: 24px; font-weight: 700; color: var(--accent-5);">
              ${formatCurrency(stats.total)}
            </div>
          </div>
        `).join('')}
      </div>      <!-- All Expenses -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <div class="card-icon" style="background: var(--gradient-5)">
              <i class="fas fa-receipt"></i>
            </div>
            All Expenses
          </h3>
          <button class="btn btn-add" onclick="showAddOtherModal()">
            <i class="fas fa-plus"></i> Add Expense
          </button>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${other.map(item => `
                <tr>
                  <td style="font-weight: 600;">#${item.entry_id}</td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div class="card-icon" style="background: var(--gradient-5); width: 40px; height: 40px; font-size: 16px;">
                        <i class="fas fa-shopping-bag"></i>
                      </div>
                      <div>
                        <div style="font-weight: 600; font-size: 15px;">${item.type || 'Uncategorized'}</div>
                      </div>
                    </div>
                  </td>
                  <td>${formatDate(item.date)}</td>
                  <td class="text-warning" style="font-size: 18px; font-weight: 700;">${formatCurrency(item.price)}</td>
                  <td>
                    <button class="btn btn-edit" onclick="editOther(${item.entry_id}, '${item.type}', '${formatDate(item.date)}', ${item.price})">
                      <i class="fas fa-edit"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// Other Expense Modal Functions
function showAddOtherModal() {
  const modal = createModal('Add Other Expense', `
    <form id="otherForm">
      <div class="form-group">
        <label class="form-label">Expense Type</label>
        <input type="text" class="form-input" name="type" required placeholder="e.g., Shopping, Entertainment, Bills">
      </div>
      <div class="form-group">
        <label class="form-label">Date</label>
        <input type="date" class="form-input" name="date" required value="${new Date().toISOString().split('T')[0]}">
      </div>
      <div class="form-group">
        <label class="form-label">Price (₹)</label>
        <input type="number" step="0.01" class="form-input" name="price" required>
      </div>
      <div class="modal-actions">
        <button type="submit" class="btn btn-primary">Save</button>
        <button type="button" class="btn" onclick="closeModal()">Cancel</button>
      </div>
    </form>
  `);
  
  document.getElementById('otherForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const result = await window.electronAPI.insertRecord('other', data);
    if (result.success) {
      showToast('Expense added successfully!', 'success');
      closeModal();
      loadPage('other');
    } else {
      showToast('Error: ' + result.error, 'error');
    }
  });
}

function editOther(id, type, date, price) {
  const modal = createModal('Edit Other Expense', `
    <form id="otherEditForm">
      <div class="form-group">
        <label class="form-label">Expense Type</label>
        <input type="text" class="form-input" name="type" required value="${type}">
      </div>
      <div class="form-group">
        <label class="form-label">Date</label>
        <input type="date" class="form-input" name="date" required value="${date}">
      </div>
      <div class="form-group">
        <label class="form-label">Price (₹)</label>
        <input type="number" step="0.01" class="form-input" name="price" required value="${price}">
      </div>
      <div class="modal-actions">
        <button type="submit" class="btn btn-primary">Update</button>
        <button type="button" class="btn" onclick="closeModal()">Cancel</button>
      </div>
    </form>
  `);
  
  document.getElementById('otherEditForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const result = await window.electronAPI.updateRecord('other', data, id, 'entry_id');
    if (result.success) {
      showToast('Expense updated successfully!', 'success');
      closeModal();
      loadPage('other');
    } else {
      showToast('Error: ' + result.error, 'error');
    }
  });
}

// Utility function to create modal
function createModal(title, content) {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.id = 'current-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">${title}</h2>
        <button class="modal-close" onclick="closeModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      ${content}
    </div>
  `;
  document.body.appendChild(modal);
  return modal;
}

function closeModal() {
  const modal = document.getElementById('current-modal');
  if (modal) {
    modal.remove();
  }
}
