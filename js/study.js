// Study page renderer
async function renderStudy(container) {
  const data = await window.electronAPI.getStudyData();
  
  if (!data.success) {
    container.innerHTML = `<div class="p-5"><p class="text-error">Error loading study data: ${data.error}</p></div>`;
    return;
  }
  
  const { study } = data.data;
  
  // Calculate stats
  const totalSpent = study.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const currentYear = new Date().getFullYear();
  const thisYearExpenses = study.filter(item => new Date(item.date).getFullYear() === currentYear);
  const thisYearTotal = thisYearExpenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-graduation-cap"></i>
        Study Expenses
      </h1>
      <p class="page-subtitle">Track your educational investments and learning expenses</p>
    </div>
    
    <div class="p-5">
      <!-- Stats -->
      <div class="grid grid-4 mb-4">
        <div class="stat-card">
          <div class="stat-label">Total Investments</div>
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
          <div class="stat-label">Total Courses</div>
          <div class="stat-value">${study.length}</div>
          <div class="stat-change">
            <i class="fas fa-book"></i>
            <span>Enrolled</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-label">Average Cost</div>
          <div class="stat-value">${formatCurrency(study.length > 0 ? totalSpent / study.length : 0)}</div>
          <div class="stat-change">
            <i class="fas fa-tag"></i>
            <span>Per Course</span>
          </div>
        </div>
      </div>
      
      <!-- Study Records -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <div class="card-icon" style="background: var(--gradient-4)">
              <i class="fas fa-book-open"></i>
            </div>
            Study Records
          </h3>
          <button class="btn btn-add" onclick="showAddStudyModal()">
            <i class="fas fa-plus"></i> Add Study Entry
          </button>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${study.map(item => `
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div class="card-icon" style="background: var(--gradient-4); width: 40px; height: 40px; font-size: 16px;">
                        <i class="fas fa-graduation-cap"></i>
                      </div>
                      <div>
                        <div style="font-weight: 600; font-size: 15px;">${item.title}</div>
                      </div>
                    </div>
                  </td>
                  <td>${formatDate(item.date)}</td>
                  <td class="text-success" style="font-size: 18px; font-weight: 700;">${formatCurrency(item.amount)}</td>
                  <td>
                    <button class="btn btn-edit" onclick="editStudy(${item.entry_id})">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-delete" onclick="deleteStudy(${item.entry_id})">
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Recent Investments -->
      <div class="grid grid-3 mt-4">
        <h3 style="grid-column: 1 / -1; font-size: 20px; font-weight: 600; margin-bottom: -8px;">
          <i class="fas fa-clock"></i> Recent Investments
        </h3>
        ${study.slice(0, 6).map(item => `
          <div class="card" style="background: var(--secondary-bg);">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
              <div class="card-icon" style="background: var(--gradient-4); width: 50px; height: 50px; font-size: 22px;">
                <i class="fas fa-book"></i>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 20px; font-weight: 700; color: var(--accent-4);">
                  ${formatCurrency(item.amount)}
                </div>
                <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                  ${formatDate(item.date)}
                </div>
              </div>
            </div>
            <h4 style="font-size: 15px; font-weight: 600; color: var(--text-primary);">${item.title}</h4>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function showAddStudyModal() {
  showToast('Add Study Entry modal - To be implemented', 'success');
}

function editStudy(id) {
  showToast(`Edit Study Entry ${id}`, 'success');
}

function deleteStudy(id) {
  if (confirm('Are you sure you want to delete this study entry?')) {
    window.electronAPI.deleteRecord('study', id, 'entry_id').then(() => {
      showToast('Study entry deleted successfully', 'success');
      loadPage('study');
    });
  }
}
