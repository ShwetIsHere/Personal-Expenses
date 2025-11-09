# Quick Start Guide - FIQ Finance Manager

## 🚀 First Time Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Verify MySQL Database
Make sure your MySQL server is running and you have:
- Database: `personal`
- User: `root`
- Password: `shwet`

### 3. Run the Application
```bash
npm start
```

## 📝 First Login

Use your existing credentials from the `login` table in your database.

If you need to create a new user, run this SQL:
```sql
INSERT INTO login (uname, pass) VALUES ('admin', 'admin123');
```

## 🎯 Quick Tips

### Adding Your First Entry

1. **Login** to the application
2. **Navigate** to the section you want (Vehicle, Games, Study, Other)
3. **Click** the "+ Add" button
4. **Fill** in the details
5. **Save** the entry

### Viewing Your Data

- **Dashboard** - See overview of all expenses
- **Charts** - Interactive visualizations of your spending
- **Tables** - Detailed records with edit/delete options

### Customizing

- Go to **Settings** to customize appearance
- Change currency format, date format, etc.
- Set up notifications for insurance and service reminders

## 🔧 Troubleshooting

### Database Connection Error
- Verify MySQL is running: `mysql -u root -p`
- Check credentials in `main.js`
- Ensure database `personal` exists

### Application Won't Start
- Delete `node_modules` and run `npm install` again
- Check Node.js version: `node --version` (needs 16+)
- Check for port conflicts

### Missing Data
- Verify tables exist in database
- Check table names match exactly (case-sensitive)
- Run the schema from `mysql.txt` if needed

## 🎨 Customization

### Change Database Password
Edit `main.js`:
```javascript
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'YOUR_PASSWORD', // Change here
  database: 'personal'
};
```

### Change App Name
Edit `package.json` and `index.html` title

### Add Your Logo
Replace `assets/icon.png` with your own icon (256x256px recommended)

## 📊 Features Overview

✅ **Implemented:**
- Dashboard with charts
- Vehicle management (fuel, service, insurance)
- Games library
- Study expense tracking
- Other expenses tracking
- Settings page
- Modern UI with animations
- Secure login
- Delete functionality

🚧 **To Be Implemented:**
- Add/Edit modals (currently show toast notifications)
- Data export (CSV/JSON)
- Search and filters
- Reports generation
- Backup/restore

## 💡 Development Mode

For development with console logging:
```bash
npm run dev
```

This will:
- Enable DevTools automatically
- Show console logs
- Enable hot reload (restart app to see changes)

## 🐛 Known Issues

1. **Add/Edit Modals** - Currently show placeholder toasts. Full modals coming soon.
2. **Icon** - Using SVG placeholder. Replace with PNG/ICO for production.
3. **Export Functions** - Placeholders only, full implementation pending.

## 📞 Support

For issues or questions:
1. Check the main README.md
2. Review the database schema in mysql.txt
3. Check console for error messages (F12 or Ctrl+Shift+I)

---

**Happy Tracking! 💰**
