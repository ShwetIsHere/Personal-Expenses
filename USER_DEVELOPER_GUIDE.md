# 🎓 Complete User & Developer Guide

## 📖 Table of Contents
1. [User Guide](#user-guide)
2. [Developer Guide](#developer-guide)
3. [Extending the Application](#extending-the-application)
4. [Troubleshooting](#troubleshooting)

---

## 👥 USER GUIDE

### Getting Started

#### First Launch
1. **Start the Application**
   ```bash
   npm start
   ```

2. **Login Screen**
   - You'll see a beautiful purple gradient login screen
   - Enter your username and password from the database
   - Click "Sign In"

3. **Main Dashboard**
   - After login, you'll see the dashboard with:
     - Your total expenses
     - Category breakdowns
     - Interactive charts
     - Recent transactions

### Navigating the App

#### Sidebar Navigation
Located on the left side:
- **📊 Dashboard** - Overview and statistics
- **🚗 Vehicle** - Fuel, service, insurance
- **🎮 Games** - Game library and platforms
- **📚 Study** - Educational expenses
- **💰 Other** - Miscellaneous expenses
- **⚙️ Settings** - App preferences

#### Window Controls
Top-right corner:
- **─** Minimize window
- **□** Maximize/Restore window
- **✕** Close application

### Using Each Section

#### 📊 Dashboard
**What you see:**
- 4 stat cards showing totals
- Line chart of monthly expenses
- Pie chart of category distribution
- Recent transactions list
- Active insurance policies

**Actions:**
- Hover over charts for details
- View recent activity

#### 🚗 Vehicle
**Tabs:**
1. **Fuel Records**
   - Date, odometer reading, cost
   - Actions: Edit ✏️, Delete 🗑️

2. **Service History**
   - Service name, type, date, cost
   - Track maintenance

3. **Insurance**
   - Policy details, dates, amounts
   - Renewal tracking

**Actions:**
- Click **+ Add** buttons to create entries
- Click **✏️** to edit existing records
- Click **🗑️** to delete (confirms first)

#### 🎮 Games
**Features:**
- Game library with platform tags
- Platform statistics
- Total spending analysis

**Tabs:**
1. **Games** - Your collection
2. **Platforms** - Account details

**Actions:**
- Add new games/platforms
- Edit game information
- Delete from collection

#### 📚 Study
**Features:**
- Course/training expenses
- Yearly statistics
- Recent investments grid

**Actions:**
- Track educational spending
- Add courses/certifications
- Monitor learning investments

#### 💰 Other Expenses
**Features:**
- Category-based expenses
- Type breakdown
- Miscellaneous tracking

**Actions:**
- Add any type of expense
- Categorize spending
- Track everything else

#### ⚙️ Settings
**Sections:**

1. **Database Configuration**
   - Connection status
   - Database details

2. **Appearance**
   - Theme selection
   - Currency format
   - Date format

3. **Account Settings**
   - Change password
   - Update profile

4. **Backup & Export**
   - Export to CSV
   - Export to JSON
   - Database backup

5. **Notifications**
   - Insurance reminders
   - Service alerts
   - Budget warnings

### Tips & Tricks

#### Keyboard Shortcuts
- **Ctrl+Q** - Quit application
- **F5** - Refresh current page
- **F12** - Open DevTools (development)

#### Best Practices
1. **Regular Updates** - Add expenses regularly
2. **Categories** - Use consistent categories
3. **Backups** - Export data monthly
4. **Insurance** - Update renewal dates
5. **Service** - Track vehicle maintenance

---

## 💻 DEVELOPER GUIDE

### Project Architecture

#### Tech Stack
```
Frontend:
├── HTML5
├── CSS3 (Custom, no frameworks)
└── Vanilla JavaScript

Backend:
├── Electron (Desktop framework)
└── Node.js

Database:
└── MySQL (via mysql2)

Libraries:
├── Chart.js (Visualizations)
└── Font Awesome (Icons)
```

#### File Structure
```
Application Entry:
└── main.js (Electron main process)

Security Layer:
└── preload.js (IPC bridge)

UI Layer:
├── index.html (Structure)
├── styles/main.css (Styling)
└── js/
    ├── renderer.js (Core)
    ├── dashboard.js (Dashboard page)
    ├── vehicle.js (Vehicle page)
    ├── games.js (Games page)
    ├── study.js (Study page)
    ├── other.js (Other page)
    └── settings.js (Settings page)
```

### Code Organization

#### Main Process (`main.js`)
```javascript
// Handles:
- Window creation
- Database connection
- IPC handlers
- Application lifecycle

// Key Functions:
createWindow()      // Creates main window
initDatabase()      // Connects to MySQL
IPC handlers        // Database operations
```

#### Renderer Process (`renderer.js`)
```javascript
// Handles:
- UI interactions
- Navigation
- Page loading
- Utility functions

// Key Functions:
loadPage(page)          // Switches pages
formatCurrency(amount)  // Formats money
formatDate(date)        // Formats dates
showToast(message)      // Shows notifications
```

#### Page Modules
Each page has its own file:
```javascript
// Pattern:
async function renderPageName(container) {
  // 1. Fetch data
  const data = await window.electronAPI.getData();
  
  // 2. Build HTML
  container.innerHTML = `...`;
  
  // 3. Initialize components (charts, etc.)
  initializeCharts();
}
```

### Database Operations

#### Query Pattern
```javascript
// In main.js
ipcMain.handle('operation-name', async (event, params) => {
  try {
    const [rows] = await dbConnection.execute(
      'SELECT * FROM table WHERE field = ?',
      [params]
    );
    return { success: true, data: rows };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// In renderer
const result = await window.electronAPI.operationName(params);
if (result.success) {
  // Use result.data
}
```

#### Available IPC Channels
```javascript
// Data Retrieval
getDashboardData()
getVehicleData()
getGamesData()
getStudyData()
getOtherData()

// CRUD Operations
insertRecord(table, data)
updateRecord(table, data, id, idField)
deleteRecord(table, id, idField)
query(sql, params)

// Authentication
authenticate(username, password)

// Window Controls
minimizeWindow()
maximizeWindow()
closeWindow()
```

### Styling System

#### CSS Architecture
```css
/* Structure:
1. CSS Variables (colors, fonts)
2. Reset & Base
3. Components (buttons, cards, etc.)
4. Layout (grid, flex)
5. Pages
6. Utilities
7. Animations
*/

/* Using Variables: */
.element {
  background: var(--primary-bg);
  color: var(--text-primary);
}
```

#### Component Classes
```css
.card              // Base card
.stat-card         // Stat display card
.btn               // Base button
.btn-primary       // Primary button
.btn-add           // Add button
.btn-edit          // Edit button
.btn-delete        // Delete button
.modal             // Modal overlay
.modal-content     // Modal box
.form-group        // Form field group
.form-input        // Input field
.table-container   // Table wrapper
```

### Chart.js Integration

#### Creating Charts
```javascript
// 1. Get canvas element
const ctx = document.getElementById('chartId');

// 2. Create chart
const chart = new Chart(ctx, {
  type: 'line', // or 'bar', 'doughnut', etc.
  data: {
    labels: [...],
    datasets: [{
      label: '...',
      data: [...],
      // styling options
    }]
  },
  options: {
    responsive: true,
    // custom options
  }
});

// 3. Update chart
chart.data.datasets[0].data = newData;
chart.update();

// 4. Destroy when done
chart.destroy();
```

---

## 🔧 EXTENDING THE APPLICATION

### Adding a New Page

#### Step 1: Create Page File
```javascript
// js/newpage.js
async function renderNewPage(container) {
  // Fetch data
  const data = await window.electronAPI.getNewPageData();
  
  // Render UI
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-icon"></i>
        New Page
      </h1>
    </div>
    <div class="p-5">
      <!-- Content -->
    </div>
  `;
}
```

#### Step 2: Add Navigation
```html
<!-- In index.html sidebar -->
<a href="#" class="nav-item" data-page="newpage">
  <i class="fas fa-icon"></i>
  <span>New Page</span>
</a>
```

#### Step 3: Add Route
```javascript
// In renderer.js loadPage()
case 'newpage':
  await renderNewPage(contentDiv);
  break;
```

#### Step 4: Include Script
```html
<!-- In index.html -->
<script src="js/newpage.js"></script>
```

### Adding CRUD Modals

#### Step 1: Create Modal HTML
```javascript
function showAddModal() {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">Add Entry</h2>
        <button class="modal-close" onclick="closeModal(this)">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <form id="addForm">
        <div class="form-group">
          <label class="form-label">Field Name</label>
          <input type="text" class="form-input" name="field">
        </div>
        <div class="modal-actions">
          <button type="submit" class="btn btn-primary">Save</button>
          <button type="button" class="btn" onclick="closeModal(this)">Cancel</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Handle form submit
  document.getElementById('addForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const result = await window.electronAPI.insertRecord('table', data);
    if (result.success) {
      showToast('Added successfully!');
      closeModal();
      loadPage('currentPage'); // Refresh
    }
  });
}

function closeModal(button) {
  const modal = button?.closest('.modal') || document.querySelector('.modal');
  modal.remove();
}
```

### Adding New Database Table

#### Step 1: Create Table in MySQL
```sql
CREATE TABLE new_table (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  amount DECIMAL(10,2),
  date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Step 2: Add IPC Handler
```javascript
// In main.js
ipcMain.handle('get-newtable-data', async () => {
  try {
    const [rows] = await dbConnection.execute(
      'SELECT * FROM new_table ORDER BY date DESC'
    );
    return { success: true, data: rows };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
```

#### Step 3: Expose in Preload
```javascript
// In preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  // ... existing methods
  getNewTableData: () => ipcRenderer.invoke('get-newtable-data'),
});
```

#### Step 4: Use in Renderer
```javascript
const result = await window.electronAPI.getNewTableData();
```

### Adding Charts

#### Line Chart Example
```javascript
function renderLineChart(canvasId, labels, data) {
  const ctx = document.getElementById(canvasId);
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Dataset',
        data: data,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(35, 41, 56, 0.95)',
          padding: 12
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#9ca3af' }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#9ca3af' }
        }
      }
    }
  });
}
```

### Custom Components

#### Stat Card Component
```javascript
function createStatCard(label, value, icon, gradient) {
  return `
    <div class="stat-card" style="--gradient: ${gradient}">
      <div class="stat-label">${label}</div>
      <div class="stat-value">${value}</div>
      <div class="stat-change">
        <i class="${icon}"></i>
        <span>Description</span>
      </div>
    </div>
  `;
}

// Usage:
const html = createStatCard(
  'Total Spent',
  formatCurrency(1000),
  'fas fa-chart-line',
  'var(--gradient-1)'
);
```

---

## 🐛 TROUBLESHOOTING

### Common Issues

#### 1. Database Connection Failed
**Problem:** Can't connect to MySQL

**Solutions:**
```bash
# Check MySQL is running
mysql -u root -p

# Verify database exists
SHOW DATABASES;

# Check credentials in main.js
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'shwet',  // Verify this
  database: 'personal' // Verify this
};
```

#### 2. Charts Not Displaying
**Problem:** Blank chart areas

**Solutions:**
```javascript
// 1. Check Chart.js is loaded
console.log(typeof Chart); // Should be 'function'

// 2. Verify canvas element exists
const ctx = document.getElementById('chartId');
console.log(ctx); // Should not be null

// 3. Check data format
console.log(data); // Should be array of numbers

// 4. Set container height
.chart-container {
  height: 300px; // Required!
}
```

#### 3. Modal Not Closing
**Problem:** Modal stays open

**Solution:**
```javascript
function closeModal() {
  const modal = document.querySelector('.modal');
  if (modal) {
    modal.remove(); // or modal.classList.remove('active');
  }
}
```

#### 4. Data Not Refreshing
**Problem:** Changes don't appear

**Solution:**
```javascript
// After insert/update/delete:
await window.electronAPI.insertRecord(...);
loadPage('currentPage'); // Refresh the page
```

#### 5. Styling Issues
**Problem:** Styles not applying

**Solutions:**
```html
<!-- 1. Check CSS file is loaded -->
<link rel="stylesheet" href="styles/main.css">

<!-- 2. Check for CSS errors in DevTools -->
<!-- Press F12 and check Console tab -->

<!-- 3. Verify class names match -->
<div class="card"> <!-- Not "Card" or "cards" -->
```

### Debug Mode

#### Enable DevTools
```javascript
// In main.js createWindow():
mainWindow.webContents.openDevTools(); // Uncomment this
```

#### Console Logging
```javascript
// Add logging
console.log('Data:', data);
console.error('Error:', error);
console.table(array); // Nice table view
```

#### Network Monitoring
```javascript
// Log all IPC calls
// In main.js:
ipcMain.on('*', (event, ...args) => {
  console.log('IPC Event:', args);
});
```

### Performance Issues

#### Slow Chart Rendering
```javascript
// Solution: Limit data points
const limitedData = data.slice(-12); // Last 12 months only
```

#### Large Tables
```javascript
// Solution: Pagination
const pageSize = 20;
const page = 1;
const paginatedData = allData.slice(
  (page - 1) * pageSize,
  page * pageSize
);
```

#### Memory Leaks
```javascript
// Solution: Destroy charts before recreating
if (window.chartInstance) {
  window.chartInstance.destroy();
}
window.chartInstance = new Chart(...);
```

### Build Issues

#### Electron Won't Start
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version # Should be 16+

# Run in dev mode
npm run dev
```

---

## 📚 Additional Resources

### Official Documentation
- [Electron Docs](https://www.electronjs.org/docs)
- [MySQL2 Docs](https://sidorares.github.io/node-mysql2/)
- [Chart.js Docs](https://www.chartjs.org/docs/)
- [Font Awesome](https://fontawesome.com/icons)

### Useful Tools
- **VS Code** - Recommended editor
- **MySQL Workbench** - Database management
- **Postman** - API testing
- **Git** - Version control

### Community
- Electron Forum
- Stack Overflow
- GitHub Discussions

---

**Happy Coding! 🚀**
