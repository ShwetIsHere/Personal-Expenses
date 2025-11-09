// Settings page renderer
async function renderSettings(container) {
  // Get user profile
  const profileResult = await window.electronAPI.getUserProfile(currentUser.username);
  const profilePic = profileResult.success && profileResult.user.profilePic 
    ? `data:image/jpeg;base64,${profileResult.user.profilePic}` 
    : null;
  
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-cog"></i>
        Settings
      </h1>
      <p class="page-subtitle">Configure your application preferences</p>
    </div>
    
    <div class="p-5">
      <div class="grid grid-2">
        <!-- Profile Settings -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <div class="card-icon" style="background: var(--gradient-1)">
                <i class="fas fa-user"></i>
              </div>
              Profile Settings
            </h3>
          </div>
          <div style="padding: 20px 0;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div id="profile-preview" style="width: 120px; height: 120px; margin: 0 auto 16px; border-radius: 50%; overflow: hidden; background: var(--gradient-1); display: flex; align-items: center; justify-content: center; border: 4px solid var(--border-color);">
                ${profilePic 
                  ? `<img src="${profilePic}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">` 
                  : `<i class="fas fa-user" style="font-size: 48px; color: white;"></i>`
                }
              </div>
              <input type="file" id="profile-pic-input" accept="image/*" style="display: none;">
              <button class="btn btn-add" onclick="document.getElementById('profile-pic-input').click()">
                <i class="fas fa-camera"></i> Change Profile Picture
              </button>
            </div>
            
            <div class="form-group">
              <label class="form-label">Username</label>
              <input type="text" class="form-input" id="settings-username" value="${currentUser?.username || ''}" readonly style="background: var(--secondary-bg); cursor: not-allowed;">
            </div>
          </div>
        </div>
        
        <!-- Change Password -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <div class="card-icon" style="background: var(--gradient-2)">
                <i class="fas fa-lock"></i>
              </div>
              Change Password
            </h3>
          </div>
          <div style="padding: 20px 0;">
            <form id="change-password-form">
              <div class="form-group">
                <label class="form-label">Current Password</label>
                <input type="password" class="form-input" id="current-password" required>
              </div>
              <div class="form-group">
                <label class="form-label">New Password</label>
                <input type="password" class="form-input" id="new-password" required minlength="4">
              </div>
              <div class="form-group">
                <label class="form-label">Confirm New Password</label>
                <input type="password" class="form-input" id="confirm-password" required minlength="4">
              </div>
              <button type="submit" class="btn btn-add" style="width: 100%;">
                <i class="fas fa-save"></i> Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  // Profile picture upload handler
  document.getElementById('profile-pic-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }
    
    // Show loading toast
    showToast('Uploading profile picture...', 'info');
    
    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Update profile picture in database
      const result = await window.electronAPI.updateProfilePicture(currentUser.username, uint8Array);
      
      if (result.success) {
        // Update preview
        const profilePreview = document.getElementById('profile-preview');
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target.result;
          profilePreview.innerHTML = `<img src="${base64}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">`;
          
          // Update sidebar avatar
          const userAvatar = document.querySelector('.user-avatar');
          if (userAvatar) {
            userAvatar.innerHTML = `<img src="${base64}" alt="${currentUser.username}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
          }
          
          // Update global currentUser
          currentUser.profilePic = base64.split(',')[1]; // Store base64 without data URI prefix
        };
        reader.readAsDataURL(file);
        
        showToast('Profile picture updated successfully', 'success');
      } else {
        showToast(result.error || 'Failed to update profile picture', 'error');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      showToast('Error uploading profile picture', 'error');
    }
  });

  // Password change form handler
  document.getElementById('change-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    
    // Validate password length
    if (newPassword.length < 4) {
      showToast('Password must be at least 4 characters', 'error');
      return;
    }
    
    try {
      const result = await window.electronAPI.updatePassword(
        currentUser.username,
        currentPassword,
        newPassword
      );
      
      if (result.success) {
        showToast('Password updated successfully', 'success');
        // Clear form
        document.getElementById('change-password-form').reset();
      } else {
        showToast(result.error || 'Failed to update password', 'error');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      showToast('Error updating password', 'error');
    }
  });
}
