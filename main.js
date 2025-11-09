const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const mysql = require('mysql2/promise');

let mainWindow;
let dbConnection;

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'shwet',
  database: 'personal'
};

// Create main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    frame: false,
    backgroundColor: '#0f1419',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  mainWindow.loadFile('index.html');
  
  // Open DevTools in development
  // mainWindow.webContents.openDevTools();
}

// Initialize database connection
async function initDatabase() {
  try {
    dbConnection = await mysql.createConnection(dbConfig);
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

// App lifecycle
app.whenReady().then(() => {
  initDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (dbConnection) dbConnection.end();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('window-minimize', () => {
  mainWindow.minimize();
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.handle('window-close', () => {
  mainWindow.close();
});

// Database queries
ipcMain.handle('db-query', async (event, query, params) => {
  try {
    const [rows] = await dbConnection.execute(query, params || []);
    return { success: true, data: rows };
  } catch (error) {
    console.error('Query error:', error);
    return { success: false, error: error.message };
  }
});

// Get dashboard data
ipcMain.handle('get-dashboard-data', async () => {
  try {
    // Total fuel expenses
    const [fuelTotal] = await dbConnection.execute(
      'SELECT SUM(total_cost) as total FROM fuel WHERE YEAR(date) = YEAR(CURDATE())'
    );
    
    // Total service expenses
    const [serviceTotal] = await dbConnection.execute(
      'SELECT SUM(cost) as total FROM service WHERE YEAR(service_date) = YEAR(CURDATE())'
    );
    
    // Total games expenses
    const [gamesTotal] = await dbConnection.execute(
      'SELECT SUM(price) as total FROM games WHERE YEAR(date) = YEAR(CURDATE())'
    );
    
    // Total study expenses
    const [studyTotal] = await dbConnection.execute(
      'SELECT SUM(amount) as total FROM study WHERE YEAR(date) = YEAR(CURDATE())'
    );
    
    // Total other expenses
    const [otherTotal] = await dbConnection.execute(
      'SELECT SUM(price) as total FROM other WHERE YEAR(date) = YEAR(CURDATE())'
    );
    
    // Monthly expenses for chart
    const [monthlyData] = await dbConnection.execute(`
      SELECT 
        MONTH(date) as month,
        SUM(total) as total
      FROM (
        SELECT date, total_cost as total FROM fuel WHERE YEAR(date) = YEAR(CURDATE())
        UNION ALL
        SELECT service_date as date, cost as total FROM service WHERE YEAR(service_date) = YEAR(CURDATE())
        UNION ALL
        SELECT date, price as total FROM games WHERE YEAR(date) = YEAR(CURDATE())
        UNION ALL
        SELECT date, amount as total FROM study WHERE YEAR(date) = YEAR(CURDATE())
        UNION ALL
        SELECT date, price as total FROM other WHERE YEAR(date) = YEAR(CURDATE())
      ) combined
      GROUP BY MONTH(date)
      ORDER BY MONTH(date)
    `);
    
    // Recent transactions
    const [recentTransactions] = await dbConnection.execute(`
      SELECT * FROM (
        SELECT 'Fuel' as type, date, total_cost as amount FROM fuel
        UNION ALL
        SELECT 'Service' as type, service_date as date, cost as amount FROM service
        UNION ALL
        SELECT 'Game' as type, date, price as amount FROM games
        UNION ALL
        SELECT 'Study' as type, date, amount FROM study
        UNION ALL
        SELECT type, date, price as amount FROM other
      ) combined
      ORDER BY date DESC
      LIMIT 10
    `);

    // Insurance data
    const [insuranceData] = await dbConnection.execute(
      'SELECT * FROM insurance WHERE end >= CURDATE() ORDER BY end ASC'
    );
    
    return {
      success: true,
      data: {
        totals: {
          fuel: fuelTotal[0].total || 0,
          service: serviceTotal[0].total || 0,
          games: gamesTotal[0].total || 0,
          study: studyTotal[0].total || 0,
          other: otherTotal[0].total || 0
        },
        monthlyData,
        recentTransactions,
        insuranceData
      }
    };
  } catch (error) {
    console.error('Dashboard data error:', error);
    return { success: false, error: error.message };
  }
});

// Get vehicle data
ipcMain.handle('get-vehicle-data', async () => {
  try {
    const [vehicles] = await dbConnection.execute('SELECT * FROM vehicle');
    const [fuel] = await dbConnection.execute('SELECT * FROM fuel ORDER BY date DESC LIMIT 20');
    const [service] = await dbConnection.execute('SELECT * FROM service ORDER BY service_date DESC LIMIT 20');
    const [insurance] = await dbConnection.execute('SELECT * FROM insurance ORDER BY start DESC');
    
    return {
      success: true,
      data: { vehicles, fuel, service, insurance }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get games data
ipcMain.handle('get-games-data', async () => {
  try {
    const [games] = await dbConnection.execute('SELECT * FROM games ORDER BY date DESC');
    const [platforms] = await dbConnection.execute('SELECT * FROM platforms');
    
    return {
      success: true,
      data: { games, platforms }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get study data
ipcMain.handle('get-study-data', async () => {
  try {
    const [study] = await dbConnection.execute('SELECT * FROM study ORDER BY date DESC');
    
    return {
      success: true,
      data: { study }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get other expenses data
ipcMain.handle('get-other-data', async () => {
  try {
    const [other] = await dbConnection.execute('SELECT * FROM other ORDER BY date DESC');
    
    return {
      success: true,
      data: { other }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Insert/Update/Delete operations
ipcMain.handle('insert-record', async (event, table, data) => {
  try {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    
    const [result] = await dbConnection.execute(
      `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`,
      values
    );
    
    return { success: true, insertId: result.insertId };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-record', async (event, table, data, id, idField) => {
  try {
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];
    
    await dbConnection.execute(
      `UPDATE ${table} SET ${setClause} WHERE ${idField} = ?`,
      values
    );
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-record', async (event, table, id, idField) => {
  try {
    await dbConnection.execute(
      `DELETE FROM ${table} WHERE ${idField} = ?`,
      [id]
    );
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Login authentication
ipcMain.handle('authenticate', async (event, username, password) => {
  try {
    const [users] = await dbConnection.execute(
      'SELECT * FROM login WHERE uname = ? AND pass = ?',
      [username, password]
    );
    
    if (users.length > 0) {
      return { success: true, user: { username: users[0].uname } };
    } else {
      return { success: false, error: 'Invalid credentials' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});
