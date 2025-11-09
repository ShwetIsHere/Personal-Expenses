// Dashboard page renderer
async function renderDashboard(container) {
  const data = await window.electronAPI.getDashboardData();
  
  if (!data.success) {
    container.innerHTML = `<div class="p-5"><p class="text-error">Error loading dashboard: ${data.error}</p></div>`;
    return;
  }
  
  const { totals, studyYearTotal, lastFuelDate, gamesCount, gamesTotalPrice, avgOdometerData, lastRecords } = data.data;
  
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
      <div class="grid grid-4" style="gap: 24px; margin-bottom: 32px;">
        <div class="stat-card" style="--gradient: var(--gradient-1)">
          <div class="stat-label">Study Expenses</div>
          <div class="stat-value">${formatCurrency(studyYearTotal)}</div>
          <div class="stat-change positive">
            <i class="fas fa-graduation-cap"></i>
            <span>This Year</span>
          </div>
        </div>
        
        <div class="stat-card" style="--gradient: var(--gradient-2)">
          <div class="stat-label">Last Fuel Fill</div>
          <div class="stat-value" style="font-size: 20px;">${formatDate(lastFuelDate)}</div>
          <div class="stat-change">
            <i class="fas fa-gas-pump"></i>
            <span>Most Recent</span>
          </div>
        </div>
        
        <div class="stat-card" style="--gradient: var(--gradient-3)">
          <div class="stat-label">Total Games</div>
          <div class="stat-value">${gamesCount}</div>
          <div class="stat-change">
            <i class="fas fa-gamepad"></i>
            <span>In Library</span>
          </div>
        </div>
        
        <div class="stat-card" style="--gradient: var(--gradient-4)">
          <div class="stat-label">Games Total Price</div>
          <div class="stat-value">${formatCurrency(gamesTotalPrice)}</div>
          <div class="stat-change">
            <i class="fas fa-tags"></i>
            <span>All Time</span>
          </div>
        </div>
      </div>
      
            <!-- Charts Row -->
      <div class="grid grid-2" style="gap: 24px; margin-bottom: 32px;">
        <!-- Fuel Amount vs KM Run -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <div class="card-icon" style="background: var(--gradient-1)">
                <i class="fas fa-tachometer-alt"></i>
              </div>
              Fuel Amount vs KM Run
            </h3>
          </div>
          <div class="chart-container">
            <canvas id="fuelKmChart"></canvas>
          </div>
        </div>
        
        <!-- Price Distribution Bar Chart -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <div class="card-icon" style="background: var(--gradient-2)">
                <i class="fas fa-chart-bar"></i>
              </div>
              Price Distribution (All Time)
            </h3>
          </div>
          <div class="chart-container">
            <canvas id="priceDistributionChart"></canvas>
          </div>
        </div>
      </div>
      
      <!-- Last Added Records Cards -->
      <div class="card" style="margin-bottom: 32px;">
        <div class="card-header">
          <h3 class="card-title">
            <div class="card-icon" style="background: var(--gradient-5)">
              <i class="fas fa-clock"></i>
            </div>
            Last Added Records
          </h3>
        </div>
        <div class="grid grid-5" style="gap: 20px; padding: 20px;">
          ${lastRecords.slice(0, 5).map(record => `
            <div class="card" style="background: var(--secondary-bg); padding: 16px;">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                <div class="card-icon" style="background: var(--gradient-${getGradientForType(record.type)}); width: 40px; height: 40px; font-size: 18px;">
                  <i class="fas fa-${getIconForType(record.type)}"></i>
                </div>
                <div>
                  <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">${record.type}</div>
                  <div style="font-size: 13px; font-weight: 600; color: var(--text-secondary);">${formatDate(record.record_date)}</div>
                </div>
              </div>
              <div style="font-size: 24px; font-weight: 700; color: var(--accent-${getGradientForType(record.type)});">
                ${formatCurrency(record.amount)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <!-- Last Added Records Table -->
      <div class="grid grid-1" style="gap: 24px;">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <div class="card-icon" style="background: var(--gradient-3)">
                <i class="fas fa-list"></i>
              </div>
              Recent Activity (All Tables)
            </h3>
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${lastRecords.map(record => `
                  <tr>
                    <td style="font-weight: 600;">#${record.id}</td>
                    <td>
                      <span class="badge badge-${record.type.toLowerCase()}">${record.type}</span>
                    </td>
                    <td>${formatDate(record.record_date)}</td>
                    <td class="text-success">${formatCurrency(record.amount)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
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
    .badge-insurance { background: rgba(245, 158, 11, 0.2); color: #fcd34d; }
    .badge-other { background: rgba(245, 158, 11, 0.2); color: #fcd34d; }
  `;
  document.head.appendChild(badgeStyle);
  
  // Render charts
  renderFuelKmChart(avgOdometerData);
  renderPriceDistributionChart(totals);
}

// Helper functions for icons and gradients
function getIconForType(type) {
  const icons = {
    'Fuel': 'gas-pump',
    'Service': 'wrench',
    'Game': 'gamepad',
    'Study': 'graduation-cap',
    'Insurance': 'shield-alt',
    'Other': 'receipt'
  };
  return icons[type] || 'circle';
}

function getGradientForType(type) {
  const gradients = {
    'Fuel': '1',
    'Service': '2',
    'Game': '3',
    'Study': '4',
    'Insurance': '5',
    'Other': '5'
  };
  return gradients[type] || '1';
}

function renderFuelKmChart(data) {
  const ctx = document.getElementById('fuelKmChart');
  if (!ctx) return;
  
  // Prepare data - reverse to show oldest to newest
  const reversedData = [...data].reverse();
  const labels = reversedData.map((item, index) => `Fill #${index + 1}`);
  const fuelAmounts = reversedData.map(item => parseFloat(item.fuelAmount) || 0);
  const kmRuns = reversedData.map(item => parseFloat(item.kmRun) || 0);
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Fuel Amount (₹)',
        data: fuelAmounts,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#667eea',
        yAxisID: 'y'
      }, {
        label: 'KM Run',
        data: kmRuns,
        borderColor: '#ec4899',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#ec4899',
        yAxisID: 'y1'
      }]
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
          labels: {
            color: '#9ca3af',
            usePointStyle: true,
            padding: 15
          }
        },
        tooltip: {
          backgroundColor: 'rgba(35, 41, 56, 0.95)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#667eea',
          borderWidth: 1,
          padding: 12
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#9ca3af'
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: '#9ca3af',
            callback: function(value) {
              return '₹' + value;
            }
          },
          title: {
            display: true,
            text: 'Fuel Amount (₹)',
            color: '#667eea'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: {
            drawOnChartArea: false
          },
          ticks: {
            color: '#9ca3af',
            callback: function(value) {
              return value + ' km';
            }
          },
          title: {
            display: true,
            text: 'KM Run',
            color: '#ec4899'
          }
        }
      }
    }
  });
}

function renderPriceDistributionChart(totals) {
  const ctx = document.getElementById('priceDistributionChart');
  if (!ctx) return;
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Fuel', 'Service', 'Games', 'Study', 'Other', 'Insurance'],
      datasets: [{
        label: 'Total Spent (₹)',
        data: [totals.fuel, totals.service, totals.games, totals.study, totals.other, totals.insurance],
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(20, 184, 166, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(99, 102, 241, 0.8)'
        ],
        borderColor: [
          '#667eea',
          '#8b5cf6',
          '#ec4899',
          '#14b8a6',
          '#f59e0b',
          '#6366f1'
        ],
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 50
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
          callbacks: {
            label: function(context) {
              return 'Total: ₹' + context.parsed.y.toLocaleString('en-IN', { minimumFractionDigits: 2 });
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#9ca3af',
            font: {
              size: 12,
              weight: '500'
            }
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
              return '₹' + (value / 1000).toFixed(0) + 'k';
            }
          },
          title: {
            display: true,
            text: 'Total Spent (₹)',
            color: '#9ca3af'
          }
        }
      }
    }
  });
}
