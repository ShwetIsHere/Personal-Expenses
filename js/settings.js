// Settings page renderer
function renderSettings(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-cog"></i>
        Settings
      </h1>
      <p class="page-subtitle">Configure your application preferences</p>
    </div>
    
    <div class="p-5">
      <div class="grid grid-2">
        <!-- Database Settings -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <div class="card-icon" style="background: var(--gradient-1)">
                <i class="fas fa-database"></i>
              </div>
              Database Configuration
            </h3>
          </div>
          <div style="padding: 20px 0;">
            <div class="form-group">
              <label class="form-label">Database Host</label>
              <input type="text" class="form-input" value="localhost" readonly>
            </div>
            <div class="form-group">
              <label class="form-label">Database Name</label>
              <input type="text" class="form-input" value="personal" readonly>
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <div style="display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: var(--secondary-bg); border: 1px solid var(--success); border-radius: 10px;">
                <i class="fas fa-check-circle" style="color: var(--success);"></i>
                <span style="color: var(--success); font-weight: 600;">Connected</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Appearance Settings -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <div class="card-icon" style="background: var(--gradient-2)">
                <i class="fas fa-palette"></i>
              </div>
              Appearance
            </h3>
          </div>
          <div style="padding: 20px 0;">
            <div class="form-group">
              <label class="form-label">Theme</label>
              <select class="form-select">
                <option selected>Dark Mode (Default)</option>
                <option disabled>Light Mode (Coming Soon)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Currency Format</label>
              <select class="form-select">
                <option selected>Indian Rupee (₹)</option>
                <option>US Dollar ($)</option>
                <option>Euro (€)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Date Format</label>
              <select class="form-select">
                <option selected>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Account Settings -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <div class="card-icon" style="background: var(--gradient-3)">
                <i class="fas fa-user-cog"></i>
              </div>
              Account Settings
            </h3>
          </div>
          <div style="padding: 20px 0;">
            <div class="form-group">
              <label class="form-label">Username</label>
              <input type="text" class="form-input" id="settings-username" value="${currentUser?.username || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Change Password</label>
              <input type="password" class="form-input" placeholder="New password">
            </div>
            <div class="form-group">
              <label class="form-label">Confirm Password</label>
              <input type="password" class="form-input" placeholder="Confirm new password">
            </div>
            <button class="btn btn-add" style="width: 100%;">
              <i class="fas fa-save"></i> Save Changes
            </button>
          </div>
        </div>
        
        <!-- Backup & Export -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <div class="card-icon" style="background: var(--gradient-4)">
                <i class="fas fa-download"></i>
              </div>
              Backup & Export
            </h3>
          </div>
          <div style="padding: 20px 0;">
            <p style="color: var(--text-muted); margin-bottom: 20px; font-size: 14px;">
              Export your data for backup or analysis
            </p>
            <button class="btn btn-add" style="width: 100%; margin-bottom: 12px;" onclick="exportData('csv')">
              <i class="fas fa-file-csv"></i> Export to CSV
            </button>
            <button class="btn btn-add" style="width: 100%; margin-bottom: 12px;" onclick="exportData('json')">
              <i class="fas fa-file-code"></i> Export to JSON
            </button>
            <button class="btn btn-add" style="width: 100%; background: var(--gradient-5);" onclick="createBackup()">
              <i class="fas fa-database"></i> Create Database Backup
            </button>
          </div>
        </div>
        
        <!-- Notifications -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <div class="card-icon" style="background: var(--gradient-5)">
                <i class="fas fa-bell"></i>
              </div>
              Notifications
            </h3>
          </div>
          <div style="padding: 20px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color);">
              <div>
                <div style="font-weight: 600; margin-bottom: 4px;">Insurance Reminders</div>
                <div style="font-size: 13px; color: var(--text-muted);">Get notified before policy expires</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color);">
              <div>
                <div style="font-weight: 600; margin-bottom: 4px;">Service Reminders</div>
                <div style="font-size: 13px; color: var(--text-muted);">Vehicle service due notifications</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
              <div>
                <div style="font-weight: 600; margin-bottom: 4px;">Budget Alerts</div>
                <div style="font-size: 13px; color: var(--text-muted);">Alert when spending exceeds limits</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
        
        <!-- About -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <div class="card-icon" style="background: var(--gradient-1)">
                <i class="fas fa-info-circle"></i>
              </div>
              About
            </h3>
          </div>
          <div style="padding: 20px 0; text-align: center;">
            <div class="card-icon" style="background: var(--gradient-1); width: 80px; height: 80px; font-size: 36px; margin: 0 auto 20px;">
              <i class="fas fa-wallet"></i>
            </div>
            <h3 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">FIQ Finance Manager</h3>
            <p style="color: var(--text-muted); margin-bottom: 16px;">Version 1.0.0</p>
            <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 20px;">
              A modern personal finance management application<br>
              built with Electron and MySQL
            </p>
            <div style="display: flex; gap: 12px; justify-content: center;">
              <button class="btn" style="background: var(--secondary-bg);">
                <i class="fas fa-question-circle"></i> Help
              </button>
              <button class="btn" style="background: var(--secondary-bg);">
                <i class="fas fa-bug"></i> Report Issue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add toggle switch styles
  const toggleStyles = document.createElement('style');
  toggleStyles.textContent = `
    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 26px;
    }
    
    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    
    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: var(--border-color);
      transition: 0.3s;
      border-radius: 34px;
    }
    
    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }
    
    input:checked + .toggle-slider {
      background: var(--gradient-1);
    }
    
    input:checked + .toggle-slider:before {
      transform: translateX(24px);
    }
  `;
  document.head.appendChild(toggleStyles);
}

function exportData(format) {
  showToast(`Exporting data to ${format.toUpperCase()}...`, 'success');
}

function createBackup() {
  showToast('Creating database backup...', 'success');
}
