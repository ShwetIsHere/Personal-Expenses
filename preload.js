const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),
  
  // Database operations
  query: (query, params) => ipcRenderer.invoke('db-query', query, params),
  getDashboardData: () => ipcRenderer.invoke('get-dashboard-data'),
  getVehicleData: () => ipcRenderer.invoke('get-vehicle-data'),
  getGamesData: () => ipcRenderer.invoke('get-games-data'),
  getStudyData: () => ipcRenderer.invoke('get-study-data'),
  getOtherData: () => ipcRenderer.invoke('get-other-data'),
  
  // CRUD operations
  insertRecord: (table, data) => ipcRenderer.invoke('insert-record', table, data),
  updateRecord: (table, data, id, idField) => ipcRenderer.invoke('update-record', table, data, id, idField),
  deleteRecord: (table, id, idField) => ipcRenderer.invoke('delete-record', table, id, idField),
  
  // Authentication
  authenticate: (username, password) => ipcRenderer.invoke('authenticate', username, password),
  getUserProfile: (username) => ipcRenderer.invoke('get-user-profile', username),
  updatePassword: (username, oldPassword, newPassword) => ipcRenderer.invoke('update-password', username, oldPassword, newPassword),
  updateProfilePicture: (username, imageBuffer) => ipcRenderer.invoke('update-profile-picture', username, imageBuffer)
});
