// Global state
let currentUser = null;
let currentPage = 'dashboard';

// Window controls
document.getElementById('minimize-btn').addEventListener('click', () => {
  window.electronAPI.minimizeWindow();
});

document.getElementById('maximize-btn').addEventListener('click', () => {
  window.electronAPI.maximizeWindow();
});

document.getElementById('close-btn').addEventListener('click', () => {
  window.electronAPI.closeWindow();
});

// Login form handler
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('login-error');
  
  const result = await window.electronAPI.authenticate(username, password);
  
  if (result.success) {
    currentUser = result.user;
    document.getElementById('user-name').textContent = username;
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-container').style.display = 'flex';
    loadPage('dashboard');
  } else {
    errorDiv.textContent = result.error || 'Invalid credentials';
  }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
  currentUser = null;
  document.getElementById('app-container').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('login-form').reset();
});

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const page = item.dataset.page;
    
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');
    
    loadPage(page);
  });
});

// Load page content
async function loadPage(page) {
  currentPage = page;
  const contentDiv = document.getElementById('page-content');
  
  switch(page) {
    case 'dashboard':
      await renderDashboard(contentDiv);
      break;
    case 'vehicle':
      await renderVehicle(contentDiv);
      break;
    case 'games':
      await renderGames(contentDiv);
      break;
    case 'study':
      await renderStudy(contentDiv);
      break;
    case 'other':
      await renderOther(contentDiv);
      break;
    case 'settings':
      renderSettings(contentDiv);
      break;
  }
}

// Utility functions
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount || 0);
}

function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 60px;
    right: 20px;
    background: ${type === 'success' ? 'var(--success)' : 'var(--error)'};
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideInRight 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Add CSS for toast animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
