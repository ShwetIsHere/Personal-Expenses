# FIQ Finance Manager - User Installation Guide

## 💻 System Requirements
- **Operating System**: Windows 10 or Windows 11 (64-bit)
- **Memory**: 4GB RAM minimum (8GB recommended)
- **Disk Space**: 500MB free space
- **Database**: MySQL Server 8.0 or higher

---

## 📥 Installation Steps

### Step 1: Install MySQL Server
1. Download MySQL from: https://dev.mysql.com/downloads/installer/
2. Choose "MySQL Installer for Windows"
3. Run the installer and select "Developer Default"
4. Set root password (remember this!)
5. Complete installation

### Step 2: Setup Database
1. Open MySQL Command Line Client (or MySQL Workbench)
2. Login with your root password
3. Run these commands:

```sql
CREATE DATABASE personal;
USE personal;

-- Import the database schema
-- (Copy and paste the contents from database-setup.sql)
```

### Step 3: Install FIQ Finance Manager

#### Option A: Portable Version (No Installation)
1. Download `FIQ-Finance-Manager-Portable.exe`
2. Move it anywhere you want (Desktop, Documents, etc.)
3. Double-click to run
4. That's it! No installation needed

#### Option B: Installer Version (Traditional Install)
1. Download `FIQ-Finance-Manager-Setup.exe`
2. Right-click → "Run as Administrator"
3. Follow installation wizard
4. Launch from Start Menu

### Step 4: First Launch
1. Run FIQ Finance Manager
2. Login screen will appear
3. Default credentials (if you imported sample data):
   - Username: admin
   - Password: (your password)

---

## ⚙️ Configuration

### Database Connection
The app connects to MySQL with these default settings:
- **Host**: localhost
- **User**: root
- **Password**: shwet
- **Database**: personal

To change these settings, you'll need to modify the config (contact support).

---

## 🔧 Troubleshooting

### Problem: App won't start
**Solution**: 
- Make sure MySQL is running
- Check Windows Services → MySQL80 should be "Running"
- Restart your computer

### Problem: "Database connection failed"
**Solution**:
- Verify MySQL is running
- Check that database "personal" exists
- Verify your MySQL password matches the app config

### Problem: Login fails
**Solution**:
- Make sure you imported the database schema
- Check that login table exists in database
- Contact support for password reset

### Problem: App is slow
**Solution**:
- Close other applications
- Check your internet connection (for CDN resources)
- Restart the app

---

## 📊 Features Overview

### Dashboard
- View all your expenses at a glance
- Charts and statistics
- Recent transactions

### Vehicle Section
- Track fuel expenses
- Service records
- Insurance details

### Games Library
- Manage your game collection
- Track purchases by platform
- View spending statistics

### Study Expenses
- Educational investments
- Course tracking
- Learning expenses

### Other Expenses
- Miscellaneous expenses
- Categorized spending
- Search and filter

---

## 🔐 Security

### Database Security
- Keep your MySQL password secure
- Regular backups recommended
- Don't share your database credentials

### Application Security
- Keep your login credentials private
- Log out when finished
- Update to latest version regularly

---

## 💾 Backup Your Data

### Backup Database:
```bash
# From command line:
mysqldump -u root -p personal > backup.sql
```

### Restore Database:
```bash
# From command line:
mysql -u root -p personal < backup.sql
```

---

## 🆘 Support

### Common Questions

**Q: Can I use this on multiple computers?**
A: Yes! Just install MySQL and the app on each computer. You can also share the same database over network.

**Q: Is my data stored online?**
A: No, everything is stored locally on your computer in MySQL.

**Q: Can I customize categories?**
A: Currently categories are preset. Future versions may allow customization.

**Q: How do I uninstall?**
A: 
- Portable: Just delete the .exe file
- Installed: Use Windows "Add or Remove Programs"

---

## 📞 Contact & Support

For technical support or questions:
- Email: support@example.com
- Website: www.example.com/support

---

## 📄 License

FIQ Finance Manager v1.0.0
© 2025 All Rights Reserved

---

**Enjoy managing your finances! 💰📊**
