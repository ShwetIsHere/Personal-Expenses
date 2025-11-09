// Games page renderer
async function renderGames(container) {
  const data = await window.electronAPI.getGamesData();
  
  if (!data.success) {
    container.innerHTML = `<div class="p-5"><p class="text-error">Error loading games data: ${data.error}</p></div>`;
    return;
  }
  
  const { games, platforms } = data.data;
  
  // Calculate total spent
  const totalSpent = games.reduce((sum, game) => sum + parseFloat(game.price || 0), 0);
  
  // Group by platform
  const platformStats = {};
  games.forEach(game => {
    if (!platformStats[game.platform]) {
      platformStats[game.platform] = { count: 0, total: 0 };
    }
    platformStats[game.platform].count++;
    platformStats[game.platform].total += parseFloat(game.price || 0);
  });
  
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-gamepad"></i>
        Games Library
      </h1>
      <p class="page-subtitle">Manage your game collection and platforms</p>
    </div>
    
    <div class="p-5">
      <!-- Stats -->
      <div class="grid grid-4 mb-4">
        <div class="stat-card">
          <div class="stat-label">Total Games</div>
          <div class="stat-value">${games.length}</div>
          <div class="stat-change">
            <i class="fas fa-gamepad"></i>
            <span>In Collection</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-label">Total Spent</div>
          <div class="stat-value">${formatCurrency(totalSpent)}</div>
          <div class="stat-change positive">
            <i class="fas fa-chart-line"></i>
            <span>All Time</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-label">Platforms</div>
          <div class="stat-value">${platforms.length}</div>
          <div class="stat-change">
            <i class="fas fa-layer-group"></i>
            <span>Registered</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-label">Average Price</div>
          <div class="stat-value">${formatCurrency(games.length > 0 ? totalSpent / games.length : 0)}</div>
          <div class="stat-change">
            <i class="fas fa-tag"></i>
            <span>Per Game</span>
          </div>
        </div>
      </div>
      
      <!-- Platform Stats -->
      <div class="grid grid-3 mb-4">
        ${Object.entries(platformStats).map(([platform, stats]) => `
          <div class="card">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
              <div class="card-icon" style="background: var(--gradient-2)">
                <i class="fas fa-gamepad"></i>
              </div>
              <div>
                <h3 style="font-size: 18px; font-weight: 600;">${platform}</h3>
                <p style="color: var(--text-muted); font-size: 13px;">${stats.count} games</p>
              </div>
            </div>
            <div style="font-size: 24px; font-weight: 700; color: var(--accent-3);">
              ${formatCurrency(stats.total)}
            </div>
          </div>
        `).join('')}
      </div>
      
      <!-- Tabs -->
      <div class="tabs-container mb-4">
        <button class="tab-btn active" onclick="switchGamesTab('games')">
          <i class="fas fa-gamepad"></i> Games
        </button>
        <button class="tab-btn" onclick="switchGamesTab('platforms')">
          <i class="fas fa-layer-group"></i> Platforms
        </button>
      </div>
      
      <!-- Games Tab -->
      <div id="games-tab" class="tab-content active">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <div class="card-icon" style="background: var(--gradient-2)">
                <i class="fas fa-gamepad"></i>
              </div>
              My Games
            </h3>
            <button class="btn btn-add" onclick="showAddGameModal()">
              <i class="fas fa-plus"></i> Add Game
            </button>
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Platform</th>
                  <th>Purchase Date</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${games.map(game => `
                  <tr>
                    <td style="font-weight: 600;">${game.title}</td>
                    <td><span class="badge badge-game">${game.platform}</span></td>
                    <td>${formatDate(game.date)}</td>
                    <td class="text-success">${formatCurrency(game.price)}</td>
                    <td>
                      <button class="btn btn-edit" onclick="editGame(${game.game_id})">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-delete" onclick="deleteGame(${game.game_id})">
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
      
      <!-- Platforms Tab -->
      <div id="platforms-tab" class="tab-content" style="display: none;">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <div class="card-icon" style="background: var(--gradient-3)">
                <i class="fas fa-layer-group"></i>
              </div>
              Gaming Platforms
            </h3>
            <button class="btn btn-add" onclick="showAddPlatformModal()">
              <i class="fas fa-plus"></i> Add Platform
            </button>
          </div>
          <div class="grid grid-2" style="padding: 20px;">
            ${platforms.map(platform => `
              <div class="card" style="background: var(--secondary-bg);">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                  <div class="card-icon" style="background: var(--gradient-2); width: 50px; height: 50px; font-size: 24px;">
                    <i class="fas fa-gamepad"></i>
                  </div>
                  <div style="display: flex; gap: 8px;">
                    <button class="btn btn-edit" onclick="editPlatform(${platform.platform_id})" style="padding: 4px 8px;">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-delete" onclick="deletePlatform(${platform.platform_id})" style="padding: 4px 8px;">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">${platform.platform_name}</h3>
                <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">
                  <i class="fas fa-user"></i> ${platform.account_username || 'No username'}
                </p>
                <p style="font-size: 13px; color: var(--text-muted);">
                  <i class="fas fa-envelope"></i> ${platform.account_email || 'No email'}
                </p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function switchGamesTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
  
  event.target.closest('.tab-btn').classList.add('active');
  document.getElementById(`${tab}-tab`).style.display = 'block';
}

function showAddGameModal() {
  showToast('Add Game modal - To be implemented', 'success');
}

function showAddPlatformModal() {
  showToast('Add Platform modal - To be implemented', 'success');
}

function editGame(id) {
  showToast(`Edit Game ${id}`, 'success');
}

function deleteGame(id) {
  if (confirm('Are you sure you want to delete this game?')) {
    window.electronAPI.deleteRecord('games', id, 'game_id').then(() => {
      showToast('Game deleted successfully', 'success');
      loadPage('games');
    });
  }
}

function editPlatform(id) {
  showToast(`Edit Platform ${id}`, 'success');
}

function deletePlatform(id) {
  if (confirm('Are you sure you want to delete this platform?')) {
    window.electronAPI.deleteRecord('platforms', id, 'platform_id').then(() => {
      showToast('Platform deleted successfully', 'success');
      loadPage('games');
    });
  }
}
