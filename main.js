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
    
    // Average vehicle cost based on odometer (km/rupee efficiency)
    const [avgOdometerData] = await dbConnection.execute(`
      SELECT 
        total_cost as fuelAmount,
        odometer as kmRun,
        date
      FROM fuel 
      WHERE odometer > 0
      ORDER BY date DESC
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
        lastRecords
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
