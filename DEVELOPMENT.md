# Development Notes - FIQ Finance Manager

## 📐 Architecture

### Electron Process Model
```
Main Process (main.js)
    ├── Window Management
    ├── Database Connection (MySQL)
    └── IPC Handlers
    
Renderer Process (index.html + JS)
    ├── UI Rendering
    ├── Event Handlers
    └── IPC Communication via Preload
```

### File Organization
```
Main Process:
- main.js          - Application entry, window creation, DB connection

Security Layer:
- preload.js       - Secure IPC bridge (contextBridge)

Renderer UI:
- index.html       - App structure
- styles/main.css  - Complete styling
- js/renderer.js   - Core renderer logic, navigation
- js/dashboard.js  - Dashboard page with Chart.js
- js/vehicle.js    - Vehicle management page
- js/games.js      - Games library page
- js/study.js      - Study expenses page
- js/other.js      - Other expenses page
- js/settings.js   - Settings page
```

## 🎨 Design System

### Color Palette
```css
Primary Background: #0f1419 (Deep dark blue)
Secondary Background: #1a1f2e (Lighter dark)
Card Background: #232938 (Card surfaces)
Hover Background: #2d3548 (Interactive states)

Accent Colors:
- Accent 1: #6366f1 (Indigo - Primary actions)
- Accent 2: #8b5cf6 (Purple - Secondary)
- Accent 3: #ec4899 (Pink - Games)
- Accent 4: #14b8a6 (Teal - Study)
- Accent 5: #f59e0b (Amber - Other)

Status Colors:
- Success: #10b981 (Green)
- Warning: #f59e0b (Amber)
- Error: #ef4444 (Red)

Text Colors:
- Primary: #ffffff (White)
- Secondary: #9ca3af (Gray 400)
- Muted: #6b7280 (Gray 500)
```

### Gradients
```css
--gradient-1: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--gradient-2: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
--gradient-3: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
--gradient-4: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
--gradient-5: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
```

### Typography
- Font Family: 'Inter' (Google Fonts)
- Base Size: 14px
- Headings: 600-700 weight
- Body: 400-500 weight

### Spacing Scale
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 40px

## 🔌 IPC Communication

### Available IPC Channels

**Window Controls:**
- `window-minimize` - Minimize window
- `window-maximize` - Toggle maximize/restore
- `window-close` - Close window

**Database Queries:**
- `db-query` - Execute raw SQL query
- `get-dashboard-data` - Fetch dashboard data
- `get-vehicle-data` - Fetch vehicle data
- `get-games-data` - Fetch games data
- `get-study-data` - Fetch study data
- `get-other-data` - Fetch other expenses

**CRUD Operations:**
- `insert-record` - Insert new record
- `update-record` - Update existing record
- `delete-record` - Delete record

**Authentication:**
- `authenticate` - Login verification

### Usage Example
```javascript
// In renderer process
const result = await window.electronAPI.getDashboardData();
if (result.success) {
  console.log(result.data);
}
```

## 💾 Database Integration

### Connection Pool
Using mysql2/promise for async/await support:
```javascript
const dbConnection = await mysql.createConnection(dbConfig);
```

### Query Patterns

**Simple Select:**
```javascript
const [rows] = await dbConnection.execute(
  'SELECT * FROM fuel WHERE YEAR(date) = YEAR(CURDATE())'
);
```

**Parameterized Query:**
```javascript
const [rows] = await dbConnection.execute(
  'SELECT * FROM login WHERE uname = ? AND pass = ?',
  [username, password]
);
```

**Complex Aggregation:**
```javascript
const [result] = await dbConnection.execute(`
  SELECT 
    MONTH(date) as month,
    SUM(total) as total
  FROM (
    SELECT date, total_cost as total FROM fuel
    UNION ALL
    SELECT service_date as date, cost as total FROM service
  ) combined
  GROUP BY MONTH(date)
`);
```

## 📊 Chart.js Integration

### Monthly Line Chart
```javascript
new Chart(ctx, {
  type: 'line',
  data: { ... },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    // Custom tooltips, colors, etc.
  }
});
```

### Category Doughnut Chart
```javascript
new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: ['Fuel', 'Service', 'Games', 'Study', 'Other'],
    datasets: [{ data: [...], backgroundColor: [...] }]
  },
  options: { cutout: '65%' }
});
```

## 🎭 Animations

### CSS Animations
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Hover Effects
- Card hover: `translateY(-4px)` + shadow increase
- Button hover: `translateY(-2px)` + shadow glow
- Nav item hover: Background color change + scale

## 🔐 Security Considerations

### Current Implementation
1. **Context Isolation**: Enabled in BrowserWindow
2. **Node Integration**: Disabled
3. **Preload Script**: Whitelist specific APIs
4. **SQL Injection**: Using parameterized queries

### Future Enhancements
- [ ] Hash passwords (bcrypt)
- [ ] Encrypt sensitive data
- [ ] Add CSRF protection
- [ ] Implement session tokens
- [ ] Add rate limiting

## 🚀 Performance Tips

### Optimization Strategies
1. **Lazy Loading**: Load page content only when navigated
2. **Database Indexing**: Add indexes on frequently queried columns
3. **Pagination**: Limit records displayed in tables
4. **Debouncing**: For search/filter inputs
5. **Chart Caching**: Cache chart data for faster re-renders

### Memory Management
```javascript
// Destroy charts before re-creating
if (chartInstance) {
  chartInstance.destroy();
}
chartInstance = new Chart(ctx, config);
```

## 🧪 Testing Checklist

### Before Release
- [ ] Test all CRUD operations
- [ ] Verify chart rendering
- [ ] Test login/logout flow
- [ ] Check responsive behavior
- [ ] Test with empty database
- [ ] Test with large datasets (1000+ records)
- [ ] Verify error handling
- [ ] Test window controls
- [ ] Check memory leaks
- [ ] Test on Windows/Mac/Linux

## 🐛 Debugging

### Enable DevTools
Uncomment in `main.js`:
```javascript
mainWindow.webContents.openDevTools();
```

### Database Debug
Check MySQL connection:
```sql
SHOW PROCESSLIST;
SELECT * FROM information_schema.PROCESSLIST;
```

### IPC Debug
```javascript
// In main.js
ipcMain.on('*', (event, channel, ...args) => {
  console.log('IPC:', channel, args);
});
```

## 📦 Build & Distribution

### Electron Builder Configuration
Add to `package.json`:
```json
"build": {
  "appId": "com.fiq.finance",
  "productName": "FIQ Finance Manager",
  "win": {
    "target": "nsis",
    "icon": "assets/icon.ico"
  }
}
```

### Build Commands
```bash
npm install electron-builder --save-dev
npm run build
```

## 🔄 Future Roadmap

### Phase 1 - Core Functionality (Current)
✅ Dashboard with charts
✅ All page layouts
✅ Database integration
✅ Basic CRUD (delete implemented)

### Phase 2 - Enhanced CRUD
- [ ] Modal forms for Add
- [ ] Modal forms for Edit
- [ ] Form validation
- [ ] Inline editing

### Phase 3 - Advanced Features
- [ ] Search & Filtering
- [ ] Export to CSV/JSON/PDF
- [ ] Import data
- [ ] Backup/Restore
- [ ] Data encryption

### Phase 4 - Intelligence
- [ ] Budget tracking
- [ ] Spending predictions
- [ ] Anomaly detection
- [ ] Smart reminders
- [ ] AI-powered insights

### Phase 5 - Ecosystem
- [ ] Mobile app
- [ ] Cloud sync
- [ ] Multi-currency
- [ ] Multi-language
- [ ] Plugins system

## 📚 Resources

### Documentation
- [Electron Docs](https://www.electronjs.org/docs)
- [MySQL2 Docs](https://sidorares.github.io/node-mysql2/)
- [Chart.js Docs](https://www.chartjs.org/docs/)
- [IPC Tutorial](https://www.electronjs.org/docs/latest/tutorial/ipc)

### Tools
- VS Code with Electron extension
- MySQL Workbench
- Chrome DevTools
- Postman (for API testing)

---

**Last Updated:** November 2025
**Version:** 1.0.0
