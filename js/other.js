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
      <div class="grid grid-4 mb-4">
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
      <div class="grid grid-3 mb-4">
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
      </div>
      
      <!-- All Expenses -->
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
                <th>Type</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${other.map(item => `
                <tr>
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
                    <button class="btn btn-edit" onclick="editOther(${item.entry_id})">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-delete" onclick="deleteOther(${item.entry_id})">
                      <i class="fas fa-trash"></i>
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

function showAddOtherModal() {
  showToast('Add Other Expense modal - To be implemented', 'success');
}

function editOther(id) {
  showToast(`Edit Other Expense ${id}`, 'success');
}

function deleteOther(id) {
  if (confirm('Are you sure you want to delete this expense?')) {
    window.electronAPI.deleteRecord('other', id, 'entry_id').then(() => {
      showToast('Expense deleted successfully', 'success');
      loadPage('other');
    });
  }
}
