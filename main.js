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
  const windowConfig = {
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
    }
  };
  
  // Add icon only if file exists
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  const fs = require('fs');
  if (fs.existsSync(iconPath)) {
    windowConfig.icon = iconPath;
  }

  mainWindow = new BrowserWindow(windowConfig);

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
    // Total study expenses per year
    const [studyTotal] = await dbConnection.execute(
      'SELECT SUM(amount) as total FROM study WHERE YEAR(date) = YEAR(CURDATE())'
    );
    
    // Last fuel fill date
    const [lastFuel] = await dbConnection.execute(
      'SELECT MAX(date) as lastDate FROM fuel'
    );
    
    // Total games count and price
    const [gamesStats] = await dbConnection.execute(
      'SELECT COUNT(*) as count, SUM(price) as total FROM games'
    );
    
    // Total games expenses this year
    const [gamesTotal] = await dbConnection.execute(
      'SELECT SUM(price) as total FROM games WHERE YEAR(date) = YEAR(CURDATE())'
    );
    
    // Total other expenses
    const [otherTotal] = await dbConnection.execute(
      'SELECT SUM(price) as total FROM other WHERE YEAR(date) = YEAR(CURDATE())'
    );
    
    // Average vehicle cost based on odometer and KM done
    const [avgOdometerData] = await dbConnection.execute(`
      SELECT 
        f1.total_cost as fuelAmount,
        f1.odometer as kmRun,
        f1.date,
        COALESCE(f1.odometer - f2.odometer, 0) as kmDone
      FROM fuel f1
      LEFT JOIN fuel f2 ON f2.date = (
        SELECT date FROM fuel 
        WHERE date < f1.date AND odometer > 0
        ORDER BY date DESC 
        LIMIT 1
      )
      WHERE f1.odometer > 0
      ORDER BY f1.date DESC
      LIMIT 10
    `);
    
    // Last one added record from all tables
    const [lastRecords] = await dbConnection.execute(`
      SELECT 'Fuel' as type, entry_id as id, date as record_date, total_cost as amount FROM fuel
      UNION ALL
      SELECT 'Service' as type, service_id as id, service_date as record_date, cost as amount FROM service
      UNION ALL
      SELECT 'Game' as type, game_id as id, date as record_date, price as amount FROM games
      UNION ALL
      SELECT 'Study' as type, entry_id as id, date as record_date, amount FROM study
      UNION ALL
      SELECT 'Insurance' as type, insurance_id as id, start as record_date, amount FROM insurance
      UNION ALL
      SELECT type, entry_id as id, date as record_date, price as amount FROM other
      ORDER BY record_date DESC
      LIMIT 10
    `);
    
    // Price/Cost distribution for bar chart (all-time totals)
    const [fuelCost] = await dbConnection.execute(
      'SELECT SUM(total_cost) as total FROM fuel'
    );
    const [serviceCost] = await dbConnection.execute(
      'SELECT SUM(cost) as total FROM service'
    );
    const [gamesCost] = await dbConnection.execute(
      'SELECT SUM(price) as total FROM games'
    );
    const [studyCost] = await dbConnection.execute(
      'SELECT SUM(amount) as total FROM study'
    );
    const [otherCost] = await dbConnection.execute(
      'SELECT SUM(price) as total FROM other'
    );
    const [insuranceCost] = await dbConnection.execute(
      'SELECT SUM(amount) as total FROM insurance'
    );
    
    // Monthly expense trend data (last 12 months)
    const [monthlyExpenses] = await dbConnection.execute(`
      SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        SUM(CASE WHEN source = 'study' THEN amount ELSE 0 END) as study,
        SUM(CASE WHEN source = 'games' THEN amount ELSE 0 END) as games,
        SUM(CASE WHEN source = 'other' THEN amount ELSE 0 END) as other
      FROM (
        SELECT date, amount, 'study' as source FROM study
        UNION ALL
        SELECT date, price as amount, 'games' as source FROM games
        UNION ALL
        SELECT date, price as amount, 'other' as source FROM other
      ) combined
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month ASC
    `);
    
    return {
      success: true,
      data: {
        totals: {
          fuel: fuelCost[0].total || 0,
          service: serviceCost[0].total || 0,
          games: gamesCost[0].total || 0,
          study: studyCost[0].total || 0,
          other: otherCost[0].total || 0,
          insurance: insuranceCost[0].total || 0
        },
        studyYearTotal: studyTotal[0].total || 0,
        lastFuelDate: lastFuel[0].lastDate,
        gamesCount: gamesStats[0].count || 0,
        gamesTotalPrice: gamesStats[0].total || 0,
        avgOdometerData,
        lastRecords,
        monthlyExpenses
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
    const [games] = await dbConnection.execute('SELECT * FROM games ORDER BY game_id DESC');
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
      'SELECT uname, profile_pic FROM login WHERE uname = ? AND pass = ?',
      [username, password]
    );
    
    if (users.length > 0) {
      const user = users[0];
      // Convert BLOB to base64 if profile_pic exists
      const profilePic = user.profile_pic ? user.profile_pic.toString('base64') : null;
      return { 
        success: true, 
        user: { 
          username: user.uname,
          profilePic: profilePic
        } 
      };
    } else {
      return { success: false, error: 'Invalid credentials' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get user profile
ipcMain.handle('get-user-profile', async (event, username) => {
  try {
    const [users] = await dbConnection.execute(
      'SELECT uname, profile_pic FROM login WHERE uname = ?',
      [username]
    );
    
    if (users.length > 0) {
      const user = users[0];
      const profilePic = user.profile_pic ? user.profile_pic.toString('base64') : null;
      return { 
        success: true, 
        user: { 
          username: user.uname,
          profilePic: profilePic
        } 
      };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Update password
ipcMain.handle('update-password', async (event, username, oldPassword, newPassword) => {
  try {
    // First verify old password
    const [users] = await dbConnection.execute(
      'SELECT * FROM login WHERE uname = ? AND pass = ?',
      [username, oldPassword]
    );
    
    if (users.length === 0) {
      return { success: false, error: 'Current password is incorrect' };
    }
    
    // Update password
    await dbConnection.execute(
      'UPDATE login SET pass = ? WHERE uname = ?',
      [newPassword, username]
    );
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Update profile picture
ipcMain.handle('update-profile-picture', async (event, username, imageBuffer) => {
  try {
    await dbConnection.execute(
      'UPDATE login SET profile_pic = ? WHERE uname = ?',
      [imageBuffer, username]
    );
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
