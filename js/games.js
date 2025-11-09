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
      <div class="grid grid-4" style="gap: 24px; margin-bottom: 32px;">
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
      <div class="grid grid-3" style="gap: 24px; margin-bottom: 32px;">
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
      <div class="tabs-container" style="margin-bottom: 24px;">
        <button class="tab-btn active" onclick="switchGamesTab('games')">
          <i class="fas fa-gamepad"></i> Games
        </button>
        <button class="tab-btn" onclick="switchGamesTab('platforms')">
          <i class="fas fa-layer-group"></i> Platforms
        </button>
      </div>      <!-- Games Tab -->
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
                  <th>ID</th>
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
                    <td style="font-weight: 600;">#${game.game_id}</td>
                    <td style="font-weight: 600;">${game.title}</td>
                    <td><span class="badge badge-game">${game.platform}</span></td>
                    <td>${formatDate(game.date)}</td>
                    <td class="text-success">${formatCurrency(game.price)}</td>
                    <td>
                      <button class="btn btn-edit" onclick="editGame(${game.game_id}, '${game.title}', '${game.platform}', '${formatDate(game.date)}', ${game.price})">
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
          <div class="grid grid-2" style="gap: 24px; padding: 20px;">
            ${platforms.map(platform => `
              <div class="card" style="background: var(--secondary-bg);">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                  <div class="card-icon" style="background: var(--gradient-2); width: 50px; height: 50px; font-size: 24px;">
                    <i class="fas fa-gamepad"></i>
                  </div>
                  <div style="display: flex; gap: 8px;">
                    <button class="btn btn-edit" onclick="editPlatform(${platform.platform_id}, '${platform.platform_name}', '${platform.account_username || ''}', '${platform.account_email || ''}')" style="padding: 4px 8px;">
                      <i class="fas fa-edit"></i>
                    </button>
                  </div>
                </div>
                <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">ID: #${platform.platform_id}</p>
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

// Game Modal Functions
async function showAddGameModal() {
  // Get platforms for dropdown
  const data = await window.electronAPI.getGamesData();
  const platforms = data.data.platforms || [];
  
  const modal = createModal('Add New Game', `
    <form id="gameForm">
      <div class="form-group">
        <label class="form-label">Game Title</label>
        <input type="text" class="form-input" name="title" required>
      </div>
      <div class="form-group">
        <label class="form-label">Platform</label>
        <select class="form-input" name="platform" required>
          <option value="">Select Platform</option>
          ${platforms.map(p => `<option value="${p.platform_name}">${p.platform_name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Purchase Date</label>
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
  
  document.getElementById('gameForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const result = await window.electronAPI.insertRecord('games', data);
    if (result.success) {
      showToast('Game added successfully!', 'success');
      closeModal();
      loadPage('games');
    } else {
      showToast('Error: ' + result.error, 'error');
    }
  });
}

async function editGame(id, title, platform, date, price) {
  // Get platforms for dropdown
  const data = await window.electronAPI.getGamesData();
  const platforms = data.data.platforms || [];
  
  const modal = createModal('Edit Game', `
    <form id="gameEditForm">
      <div class="form-group">
        <label class="form-label">Game Title</label>
        <input type="text" class="form-input" name="title" required value="${title}">
      </div>
      <div class="form-group">
        <label class="form-label">Platform</label>
        <select class="form-input" name="platform" required>
          <option value="">Select Platform</option>
          ${platforms.map(p => `<option value="${p.platform_name}" ${p.platform_name === platform ? 'selected' : ''}>${p.platform_name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Purchase Date</label>
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
  
  document.getElementById('gameEditForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const result = await window.electronAPI.updateRecord('games', data, id, 'game_id');
    if (result.success) {
      showToast('Game updated successfully!', 'success');
      closeModal();
      loadPage('games');
    } else {
      showToast('Error: ' + result.error, 'error');
    }
  });
}

// Platform Modal Functions
function showAddPlatformModal() {
  const modal = createModal('Add Gaming Platform', `
    <form id="platformForm">
      <div class="form-group">
        <label class="form-label">Platform Name</label>
        <input type="text" class="form-input" name="platform_name" required placeholder="e.g., PlayStation, Xbox, Steam">
      </div>
      <div class="form-group">
        <label class="form-label">Account Username</label>
        <input type="text" class="form-input" name="account_username">
      </div>
      <div class="form-group">
        <label class="form-label">Account Email</label>
        <input type="email" class="form-input" name="account_email">
      </div>
      <div class="modal-actions">
        <button type="submit" class="btn btn-primary">Save</button>
        <button type="button" class="btn" onclick="closeModal()">Cancel</button>
      </div>
    </form>
  `);
  
  document.getElementById('platformForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const result = await window.electronAPI.insertRecord('platforms', data);
    if (result.success) {
      showToast('Platform added successfully!', 'success');
      closeModal();
      loadPage('games');
    } else {
      showToast('Error: ' + result.error, 'error');
    }
  });
}

function editPlatform(id, name, username, email) {
  const modal = createModal('Edit Platform', `
    <form id="platformEditForm">
      <div class="form-group">
        <label class="form-label">Platform Name</label>
        <input type="text" class="form-input" name="platform_name" required value="${name}">
      </div>
      <div class="form-group">
        <label class="form-label">Account Username</label>
        <input type="text" class="form-input" name="account_username" value="${username}">
      </div>
      <div class="form-group">
        <label class="form-label">Account Email</label>
        <input type="email" class="form-input" name="account_email" value="${email}">
      </div>
      <div class="modal-actions">
        <button type="submit" class="btn btn-primary">Update</button>
        <button type="button" class="btn" onclick="closeModal()">Cancel</button>
      </div>
    </form>
  `);
  
  document.getElementById('platformEditForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const result = await window.electronAPI.updateRecord('platforms', data, id, 'platform_id');
    if (result.success) {
      showToast('Platform updated successfully!', 'success');
      closeModal();
      loadPage('games');
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
