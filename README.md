# FIQ - Personal Finance Manager

A beautiful, modern desktop application for managing personal expenses, built with Electron and MySQL.

![FIQ Finance Manager](https://img.shields.io/badge/version-1.0.0-blue)
![Electron](https://img.shields.io/badge/Electron-39.x-47848F?logo=electron)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?logo=mysql)

## ✨ Features

- **📊 Dashboard** - Beautiful overview with charts and statistics
- **🚗 Vehicle Management** - Track fuel, service, and insurance
- **🎮 Games Library** - Manage your game collection and platforms
- **📚 Study Expenses** - Track educational investments
- **💰 Other Expenses** - Categorize miscellaneous purchases
- **⚙️ Settings** - Customize your experience
- **🌙 Dark Theme** - Easy on the eyes with modern UI
- **📈 Charts & Graphs** - Visual insights with Chart.js
- **🔒 Secure Login** - Password-protected access

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MySQL](https://www.mysql.com/) (v8.0 or higher)
- MySQL database named `personal` with password `shwet`

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd e:\Personal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the MySQL database**
   
   Make sure you have MySQL running with:
   - Database name: `personal`
   - Root password: `shwet`
   - Tables: fuel, games, insurance, login, other, platforms, service, study, vehicle
   
   (Your existing database is already configured!)

4. **Run the application**
   ```bash
   npm start
   ```

## 📁 Project Structure

```
personal/
├── main.js              # Electron main process
├── preload.js           # Preload script for IPC
├── index.html           # Main HTML file
├── package.json         # Project configuration
├── mysql.txt            # Database schema reference
├── styles/
│   └── main.css        # All application styles
├── js/
│   ├── renderer.js     # Main renderer process
│   ├── dashboard.js    # Dashboard page
│   ├── vehicle.js      # Vehicle management
│   ├── games.js        # Games library
│   ├── study.js        # Study expenses
│   ├── other.js        # Other expenses
│   └── settings.js     # Settings page
└── assets/
    └── icon.png        # Application icon (add your own)
```

## 🎨 UI Features

### Modern Design Elements
- **Gradient Backgrounds** - Beautiful color gradients throughout
- **Smooth Animations** - Fade-in effects and transitions
- **Card-based Layout** - Clean, organized information
- **Responsive Charts** - Interactive data visualization
- **Custom Scrollbars** - Styled to match the theme
- **Glass-morphism Effects** - Backdrop blur on modals

### Pages

1. **Dashboard**
   - Total expenses overview
   - Monthly expense chart
   - Category distribution pie chart
   - Recent transactions
   - Active insurance policies

2. **Vehicle**
   - Vehicle information cards
   - Fuel records with odometer tracking
   - Service history
   - Insurance management

3. **Games**
   - Game collection with platform info
   - Platform accounts management
   - Spending statistics by platform

4. **Study**
   - Educational expense tracking
   - Course/training investments
   - Yearly statistics

5. **Other**
   - Miscellaneous expenses
   - Category-wise breakdown
   - Type-based filtering

6. **Settings**
   - Database configuration
   - Appearance settings
   - Account management
   - Backup & export
   - Notifications

## 🔧 Configuration

### Database Connection

Edit the database configuration in `main.js`:

```javascript
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'shwet',  // Change if needed
  database: 'personal'
};
```

### Login Credentials

Default credentials are stored in the `login` table of your MySQL database.

## 📊 Database Schema

The application uses the following tables:

- **fuel** - Fuel purchase records
- **games** - Game collection
- **insurance** - Insurance policies
- **login** - User authentication
- **other** - Miscellaneous expenses
- **platforms** - Gaming platform accounts
- **service** - Vehicle service records
- **study** - Educational expenses
- **vehicle** - Vehicle information

(See `mysql.txt` for detailed schema)

## 🛠️ Development

### Run in Development Mode
```bash
npm run dev
```

This will start the application with logging enabled.

### Technologies Used

- **Electron** - Desktop app framework
- **MySQL2** - Database driver
- **Chart.js** - Data visualization
- **Font Awesome** - Icons
- **Google Fonts (Inter)** - Typography

## 📝 TODO / Future Enhancements

- [ ] Add full CRUD modals for all entities
- [ ] Implement data export (CSV/JSON)
- [ ] Add budget tracking and alerts
- [ ] Implement search and filtering
- [ ] Add reports generation
- [ ] Multi-user support
- [ ] Light theme option
- [ ] Backup/restore functionality
- [ ] Data encryption
- [ ] Recurring expense tracking
- [ ] Mobile companion app

## 🎯 Usage Tips

1. **Navigation** - Use the sidebar to switch between different sections
2. **Adding Data** - Click the "+ Add" buttons to create new entries
3. **Editing** - Click the edit icon on any table row to modify
4. **Deleting** - Click the delete icon and confirm to remove entries
5. **Charts** - Hover over charts for detailed information
6. **Window Controls** - Use the custom title bar to minimize/maximize/close

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome!

## 📄 License

ISC License

## 🙏 Credits

- UI inspired by modern finance applications
- Icons by [Font Awesome](https://fontawesome.com/)
- Charts by [Chart.js](https://www.chartjs.org/)

---

**Enjoy managing your finances! 💰**
