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
  const currentDate = new Date();
  const latestExpenseDate = other.length ? new Date(other[0].date) : currentDate;
  const lastMonthStart = new Date(latestExpenseDate.getFullYear(), latestExpenseDate.getMonth(), 1);
  const nextMonthStart = new Date(latestExpenseDate.getFullYear(), latestExpenseDate.getMonth() + 1, 1);
  const lastMonthLabel = lastMonthStart.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const thisYearExpenses = other.filter(item => new Date(item.date).getFullYear() === currentYear);
  const thisYearTotal = thisYearExpenses.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
  const lastMonthTotal = other
    .filter(item => {
      const expenseDate = new Date(item.date);
      return expenseDate >= lastMonthStart && expenseDate < nextMonthStart;
    })
    .reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
  
  // Group by type
  const typeStats = {};
  other.forEach(item => {
    const type = item.type || 'Uncategorized';
    if (!typeStats[type]) {
      typeStats[type] = { count: 0, total: 0, yearTotal: 0, lastMonthTotal: 0, monthlyTotals: {} };
    }
    typeStats[type].count++;
    typeStats[type].total += parseFloat(item.price || 0);
    const expenseMonth = `${new Date(item.date).getFullYear()}-${String(new Date(item.date).getMonth() + 1).padStart(2, '0')}`;
    typeStats[type].monthlyTotals[expenseMonth] = (typeStats[type].monthlyTotals[expenseMonth] || 0) + parseFloat(item.price || 0);
    
    // Add to year total if from current year
    if (new Date(item.date).getFullYear() === currentYear) {
      typeStats[type].yearTotal += parseFloat(item.price || 0);
    }

    const expenseDate = new Date(item.date);
    if (expenseDate >= lastMonthStart && expenseDate < nextMonthStart) {
      typeStats[type].lastMonthTotal += parseFloat(item.price || 0);
    }
  });

  const categoryCharts = Object.entries(typeStats)
    .sort(([, first], [, second]) => second.lastMonthTotal - first.lastMonthTotal);
  
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
          <div class="stat-label">Last Month Expenses</div>
          <div class="stat-value">${formatCurrency(lastMonthTotal)}</div>
          <div class="stat-change">
            <i class="fas fa-calendar"></i>
            <span>${lastMonthLabel}</span>
          </div>
        </div>
      </div>
      
      <!-- Category Breakdown -->
      <div class="grid grid-3" style="gap: 24px; margin-bottom: 32px;">
        <h3 style="grid-column: 1 / -1; font-size: 20px; font-weight: 600; margin-bottom: -8px;">
          <i class="fas fa-chart-pie"></i> Expense Categories
        </h3>
        <div class="category-chart-carousel" style="grid-column: 1 / -1;">
          <div class="category-chart-header">
            <div>
              <h3 class="category-chart-title"><i class="fas fa-chart-line"></i> Monthly Category Trend</h3>
              <p class="category-chart-subtitle">Monthly expenses by category</p>
            </div>
            <button class="category-chart-toggle" type="button" onclick="toggleOtherCategoryChart()" aria-expanded="false">
              <i class="fas fa-expand-alt"></i> Expand
            </button>
          </div>
          <div id="other-category-chart-content" class="category-chart-content" hidden>
            <div class="chart-container category-chart-container">
            <canvas id="otherCategoryChart"></canvas>
            </div>
          </div>
        </div>
        ${Object.entries(typeStats).map(([type, stats]) => `
          <div class="card">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
              <div class="card-icon" style="background: var(${getTypeGradient(type)})">
                <i class="${getTypeIcon(type)}"></i>
              </div>
              <div style="flex: 1;">
                <h3 style="font-size: 18px; font-weight: 600;">${type}</h3>
                <p style="color: var(--text-muted); font-size: 13px;">${stats.count} entries</p>
              </div>
            </div>
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-size: 13px; color: var(--text-muted);">All Time</span>
                <span style="font-size: 20px; font-weight: 700; color: var(--accent-5);">
                  ${formatCurrency(stats.total)}
                </span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-size: 13px; color: var(--text-muted);">${lastMonthLabel}</span>
                <span style="font-size: 16px; font-weight: 600; color: var(--accent-3);">
                  ${formatCurrency(stats.lastMonthTotal)}
                </span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 13px; color: var(--text-muted);">${currentYear}</span>
                <span style="font-size: 16px; font-weight: 600; color: var(--accent-4);">
                  ${formatCurrency(stats.yearTotal)}
                </span>
              </div>
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
        <div style="padding: 20px; padding-bottom: 0;">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input type="text" id="other-search" class="search-input" placeholder="Search expenses by type, topic, date, or amount..." onkeyup="filterOtherTable()">
          </div>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Topic</th>
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
                    <span class="badge badge-${getBadgeClass(item.type)}" style="font-size: 13px; padding: 6px 12px;">
                      ${item.type || 'Uncategorized'}
                    </span>
                  </td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div class="card-icon" style="background: var(${getTypeGradient(item.type)}); width: 40px; height: 40px; font-size: 16px;">
                        <i class="${getTypeIcon(item.type)}"></i>
                      </div>
                      <div>
                        <div style="font-weight: 600; font-size: 15px;">${item.topic || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td>${formatDate(item.date)}</td>
                  <td class="text-warning" style="font-size: 18px; font-weight: 700;">${formatCurrency(item.price)}</td>
                  <td>
                    <button class="btn btn-edit" onclick="editOther(${item.entry_id}, '${item.type || ''}', '${item.topic || ''}', '${formatDateForInput(item.date)}', ${item.price})">
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

  renderOtherCategoryChart(categoryCharts, lastMonthStart);
}

let otherCategoryChart;

function toggleOtherCategoryChart() {
  const content = document.getElementById('other-category-chart-content');
  const button = document.querySelector('.category-chart-toggle');
  if (!content || !button) return;

  const isExpanded = !content.hidden;
  content.hidden = isExpanded;
  button.setAttribute('aria-expanded', String(!isExpanded));
  button.innerHTML = isExpanded
    ? '<i class="fas fa-expand-alt"></i> Expand'
    : '<i class="fas fa-compress-alt"></i> Collapse';

  if (!isExpanded && otherCategoryChart) otherCategoryChart.resize();
}

function renderOtherCategoryChart(categoryCharts, monthStart) {
  const chart = document.getElementById('otherCategoryChart');
  if (!chart || !categoryCharts.length) return;

  if (otherCategoryChart) otherCategoryChart.destroy();

  const months = Array.from({ length: 12 }, (_, index) => new Date(monthStart.getFullYear(), monthStart.getMonth() - 11 + index, 1));
  const monthKeys = months.map(month => `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`);
  const labels = months.map(month => month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }));
  const categoryColors = [
    '#ec4899', '#14b8a6', '#f59e0b', '#6366f1', '#06b6d4', '#84cc16',
    '#f97316', '#a855f7', '#ef4444', '#22c55e', '#eab308', '#64748b'
  ];
  const datasets = categoryCharts.map(([type, stats], index) => ({
    label: type,
    data: monthKeys.map(monthKey => stats.monthlyTotals[monthKey] || 0),
    borderColor: categoryColors[index],
    backgroundColor: `${categoryColors[index]}22`,
    borderWidth: 3,
    tension: 0.35,
    pointRadius: 3,
    pointBackgroundColor: categoryColors[index],
    fill: false
  }));

  otherCategoryChart = new Chart(chart, {
    type: 'line',
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { color: '#9ca3af', usePointStyle: true, padding: 15 }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            title: tooltipItems => tooltipItems.length ? tooltipItems[0].label : '',
            label: context => `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#9ca3af' },
          title: { display: true, text: 'Month', color: '#9ca3af' }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: {
            color: '#9ca3af',
            callback: value => `₹${value}`
          },
          title: { display: true, text: 'Amount spent (₹)', color: '#9ca3af' }
        }
      }
    }
  });
}

// Other Expense Modal Functions
function showAddOtherModal() {
  const modal = createModal('Add Other Expense', `
    <form id="otherForm">
      <div class="form-group">
        <label class="form-label">Expense Type *</label>
        <select class="form-input" name="type" required>
          <option value="">Select Type</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Food">Food</option>
          <option value="Trip">Trip</option>
          <option value="Recharge">Recharge</option>
          <option value="Grocery">Grocery</option>
          <option value="Shopping">Shopping</option>
          <option value="Medical">Medical</option>
          <option value="Bills">Bills</option>
          <option value="Transport">Transport</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Topic/Description</label>
        <input type="text" class="form-input" name="topic" placeholder="e.g., Movie tickets, Restaurant, etc.">
      </div>
      <div class="form-group">
        <label class="form-label">Date *</label>
        <input type="date" class="form-input" name="date" required value="${new Date().toISOString().split('T')[0]}">
      </div>
      <div class="form-group">
        <label class="form-label">Price (₹) *</label>
        <input type="number" step="0.01" class="form-input" name="price" required placeholder="0.00">
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

function editOther(id, type, topic, date, price) {
  const modal = createModal('Edit Other Expense', `
    <form id="otherEditForm">
      <div class="form-group">
        <label class="form-label">Expense Type *</label>
        <select class="form-input" name="type" required>
          <option value="">Select Type</option>
          <option value="Entertainment" ${type === 'Entertainment' ? 'selected' : ''}>Entertainment</option>
          <option value="Food" ${type === 'Food' ? 'selected' : ''}>Food</option>
          <option value="Trip" ${type === 'Trip' ? 'selected' : ''}>Trip</option>
          <option value="Recharge" ${type === 'Recharge' ? 'selected' : ''}>Recharge</option>
          <option value="Grocery" ${type === 'Grocery' ? 'selected' : ''}>Grocery</option>
          <option value="Shopping" ${type === 'Shopping' ? 'selected' : ''}>Shopping</option>
          <option value="Medical" ${type === 'Medical' ? 'selected' : ''}>Medical</option>
          <option value="Bills" ${type === 'Bills' ? 'selected' : ''}>Bills</option>
          <option value="Transport" ${type === 'Transport' ? 'selected' : ''}>Transport</option>
          <option value="Other" ${type === 'Other' ? 'selected' : ''}>Other</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Topic/Description</label>
        <input type="text" class="form-input" name="topic" value="${topic}" placeholder="e.g., Movie tickets, Restaurant, etc.">
      </div>
      <div class="form-group">
        <label class="form-label">Date *</label>
        <input type="date" class="form-input" name="date" required value="${date}">
      </div>
      <div class="form-group">
        <label class="form-label">Price (₹) *</label>
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

// Helper function to get badge class based on expense type
function getBadgeClass(type) {
  const badgeMap = {
    'Entertainment': 'primary',
    'Food': 'success',
    'Trip': 'info',
    'Recharge': 'warning',
    'Grocery': 'success',
    'Shopping': 'primary',
    'Medical': 'error',
    'Bills': 'warning',
    'Transport': 'info',
    'Other': 'secondary'
  };
  return badgeMap[type] || 'secondary';
}

// Helper function to get icon based on expense type
function getTypeIcon(type) {
  const iconMap = {
    'Entertainment': 'fas fa-film',
    'Food': 'fas fa-utensils',
    'Trip': 'fas fa-plane',
    'Recharge': 'fas fa-mobile-alt',
    'Grocery': 'fas fa-shopping-cart',
    'Shopping': 'fas fa-shopping-bag',
    'Medical': 'fas fa-heartbeat',
    'Bills': 'fas fa-file-invoice-dollar',
    'Transport': 'fas fa-bus',
    'Other': 'fas fa-receipt'
  };
  return iconMap[type] || 'fas fa-receipt';
}

// Helper function to get gradient based on expense type
function getTypeGradient(type) {
  const gradientMap = {
    'Entertainment': '--gradient-1',
    'Food': '--gradient-4',
    'Trip': '--gradient-3',
    'Recharge': '--gradient-5',
    'Grocery': '--gradient-4',
    'Shopping': '--gradient-2',
    'Medical': '--gradient-2',
    'Bills': '--gradient-5',
    'Transport': '--gradient-3',
    'Other': '--gradient-1'
  };
  return gradientMap[type] || '--gradient-1';
}

// Search filter function for other expenses table
function filterOtherTable() {
  const input = document.getElementById('other-search');
  const filter = input.value.toLowerCase();
  const table = document.querySelector('.card table tbody');
  const rows = table.getElementsByTagName('tr');

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const type = row.cells[1]?.textContent || '';
    const topic = row.cells[2]?.textContent || '';
    const date = row.cells[3]?.textContent || '';
    const amount = row.cells[4]?.textContent || '';
    
    const searchText = (type + topic + date + amount).toLowerCase();
    
    if (searchText.includes(filter)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  }
}
