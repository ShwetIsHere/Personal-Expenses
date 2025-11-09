// Dashboard page renderer
async function renderDashboard(container) {
  const data = await window.electronAPI.getDashboardData();
  
  if (!data.success) {
    container.innerHTML = `<div class="p-5"><p class="text-error">Error loading dashboard: ${data.error}</p></div>`;
    return;
  }
  
  const { totals, monthlyData, recentTransactions, insuranceData } = data.data;
  const totalExpenses = totals.fuel + totals.service + totals.games + totals.study + totals.other;
  
  // Prepare monthly chart data
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyAmounts = new Array(12).fill(0);
  
  monthlyData.forEach(item => {
    monthlyAmounts[item.month - 1] = parseFloat(item.total);
  });
  
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-chart-line"></i>
        Dashboard
      </h1>
      <p class="page-subtitle">Welcome back! Here's your financial overview</p>
    </div>
    
    <div class="p-5">
      <!-- Stats Overview -->
      <div class="grid grid-4 mb-4">
        <div class="stat-card" style="--gradient: var(--gradient-1)">
          <div class="stat-label">Total Expenses</div>
          <div class="stat-value">${formatCurrency(totalExpenses)}</div>
          <div class="stat-change positive">
            <i class="fas fa-arrow-up"></i>
            <span>This Year</span>
          </div>
        </div>
        
        <div class="stat-card" style="--gradient: var(--gradient-2)">
          <div class="stat-label">Vehicle Expenses</div>
          <div class="stat-value">${formatCurrency(totals.fuel + totals.service)}</div>
          <div class="stat-change">
            <i class="fas fa-car"></i>
            <span>Fuel & Service</span>
          </div>
        </div>
        
        <div class="stat-card" style="--gradient: var(--gradient-3)">
          <div class="stat-label">Games & Study</div>
          <div class="stat-value">${formatCurrency(totals.games + totals.study)}</div>
          <div class="stat-change">
            <i class="fas fa-gamepad"></i>
            <span>Entertainment & Education</span>
          </div>
        </div>
        
        <div class="stat-card" style="--gradient: var(--gradient-4)">
          <div class="stat-label">Other Expenses</div>
          <div class="stat-value">${formatCurrency(totals.other)}</div>
          <div class="stat-change">
            <i class="fas fa-receipt"></i>
            <span>Miscellaneous</span>
          </div>
        </div>
      </div>
      
      <!-- Charts Row -->
      <div class="grid grid-2 mb-4">
        <!-- Monthly Expenses Chart -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <div class="card-icon" style="background: var(--gradient-1)">
                <i class="fas fa-chart-area"></i>
              </div>
              Monthly Expenses
            </h3>
          </div>
          <div class="chart-container">
            <canvas id="monthlyChart"></canvas>
          </div>
        </div>
        
        <!-- Category Distribution Chart -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <div class="card-icon" style="background: var(--gradient-2)">
                <i class="fas fa-chart-pie"></i>
              </div>
              Expense Distribution
            </h3>
          </div>
          <div class="chart-container">
            <canvas id="categoryChart"></canvas>
          </div>
        </div>
      </div>
      
      <!-- Recent Transactions & Insurance -->
      <div class="grid grid-2">
        <!-- Recent Transactions -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <div class="card-icon" style="background: var(--gradient-3)">
                <i class="fas fa-history"></i>
              </div>
              Recent Transactions
            </h3>
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${recentTransactions.map(tx => `
                  <tr>
                    <td>
                      <span class="badge badge-${tx.type.toLowerCase()}">${tx.type}</span>
                    </td>
                    <td>${formatDate(tx.date)}</td>
                    <td class="text-success">${formatCurrency(tx.amount)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Upcoming Insurance -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <div class="card-icon" style="background: var(--gradient-5)">
                <i class="fas fa-shield-alt"></i>
              </div>
              Active Insurance Policies
            </h3>
          </div>
          <div style="padding: 16px 0;">
            ${insuranceData.length > 0 ? insuranceData.map(ins => `
              <div style="padding: 16px; border-bottom: 1px solid var(--border-color);">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                  <div>
                    <h4 style="font-size: 15px; font-weight: 600; margin-bottom: 4px;">${ins.name}</h4>
                    <p style="font-size: 13px; color: var(--text-muted);">${ins.company} - ${ins.type}</p>
                    <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                      Expires: ${formatDate(ins.end)}
                    </p>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 18px; font-weight: 700; color: var(--accent-5);">
                      ${formatCurrency(ins.amount)}
                    </div>
                  </div>
                </div>
              </div>
            `).join('') : '<p style="text-align: center; color: var(--text-muted); padding: 40px;">No active insurance policies</p>'}
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add badge styles
  const badgeStyle = document.createElement('style');
  badgeStyle.textContent = `
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-fuel { background: rgba(99, 102, 241, 0.2); color: #a5b4fc; }
    .badge-service { background: rgba(139, 92, 246, 0.2); color: #c4b5fd; }
    .badge-game { background: rgba(236, 72, 153, 0.2); color: #f9a8d4; }
    .badge-study { background: rgba(20, 184, 166, 0.2); color: #5eead4; }
    .badge-other { background: rgba(245, 158, 11, 0.2); color: #fcd34d; }
  `;
  document.head.appendChild(badgeStyle);
  
  // Render charts
  renderMonthlyChart(monthlyAmounts, monthNames);
  renderCategoryChart(totals);
}

function renderMonthlyChart(data, labels) {
  const ctx = document.getElementById('monthlyChart');
  if (!ctx) return;
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Expenses',
        data: data,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#667eea',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(35, 41, 56, 0.95)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#667eea',
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: function(context) {
              return formatCurrency(context.parsed.y);
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false,
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: '#9ca3af'
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            borderDash: [5, 5]
          },
          ticks: {
            color: '#9ca3af',
            callback: function(value) {
              return '₹' + value.toLocaleString();
            }
          }
        }
      }
    }
  });
}

function renderCategoryChart(totals) {
  const ctx = document.getElementById('categoryChart');
  if (!ctx) return;
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Fuel', 'Service', 'Games', 'Study', 'Other'],
      datasets: [{
        data: [totals.fuel, totals.service, totals.games, totals.study, totals.other],
        backgroundColor: [
          '#6366f1',
          '#8b5cf6',
          '#ec4899',
          '#14b8a6',
          '#f59e0b'
        ],
        borderWidth: 0,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#9ca3af',
            padding: 16,
            usePointStyle: true,
            font: {
              size: 12,
              family: 'Inter'
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(35, 41, 56, 0.95)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#667eea',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = formatCurrency(context.parsed);
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      },
      cutout: '65%'
    }
  });
}
