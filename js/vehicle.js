// Vehicle page renderer
async function renderVehicle(container) {
  const data = await window.electronAPI.getVehicleData();
  
  if (!data.success) {
    container.innerHTML = `<div class="p-5"><p class="text-error">Error loading vehicle data: ${data.error}</p></div>`;
    return;
  }
  
  const { vehicles, fuel, service, insurance } = data.data;
  
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-car"></i>
        Vehicle Management
      </h1>
      <p class="page-subtitle">Track your vehicle expenses, fuel, service, and insurance</p>
    </div>
    
    <div class="p-5">
      <!-- Vehicle Info Cards -->
      <div class="grid grid-3" style="gap: 24px; margin-bottom: 32px;">
        ${vehicles.map(vehicle => `
          <div class="card">
            <div class="card-icon" style="background: var(--gradient-1); width: 60px; height: 60px; font-size: 28px; margin-bottom: 16px;">
              <i class="fas fa-car"></i>
            </div>
            <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">${vehicle.registration_number}</h3>
            <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 4px;">ID: ${vehicle.vehicle_id}</p>
            <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 4px;">${vehicle.owner_name}</p>
            <p style="color: var(--text-muted); font-size: 12px;">Chassis: ${vehicle.chassis_number}</p>
          </div>
        `).join('')}
        
        <div class="card" style="border: 2px dashed var(--border-color); cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 200px;" onclick="showAddVehicleModal()">
          <i class="fas fa-plus" style="font-size: 32px; color: var(--text-muted); margin-bottom: 12px;"></i>
          <p style="color: var(--text-muted); font-size: 14px;">Add New Vehicle</p>
        </div>
      </div>
      
      <!-- Tabs -->
      <div class="tabs-container" style="margin-bottom: 24px;">
        <button class="tab-btn active" onclick="switchVehicleTab('fuel')">
          <i class="fas fa-gas-pump"></i> Fuel Records
        </button>
        <button class="tab-btn" onclick="switchVehicleTab('service')">
          <i class="fas fa-wrench"></i> Service History
        </button>
        <button class="tab-btn" onclick="switchVehicleTab('insurance')">
          <i class="fas fa-shield-alt"></i> Insurance
        </button>
      </div>
      
      <!-- Fuel Tab -->
      <div id="fuel-tab" class="tab-content active">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <div class="card-icon" style="background: var(--gradient-2)">
                <i class="fas fa-gas-pump"></i>
              </div>
              Fuel Records
            </h3>
            <button class="btn btn-add" onclick="showAddFuelModal()">
              <i class="fas fa-plus"></i> Add Fuel Entry
            </button>
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Odometer</th>
                  <th>KM Done</th>
                  <th>Cost</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${fuel.map((item, index) => {
                  // Calculate KM Done - difference from previous entry
                  let kmDone = '-';
                  if (item.odometer && index < fuel.length - 1) {
                    const prevOdometer = fuel[index + 1].odometer;
                    if (prevOdometer) {
                      kmDone = (item.odometer - prevOdometer).toLocaleString() + ' km';
                    }
                  }
                  
                  return `
                  <tr>
                    <td style="font-weight: 600;">#${item.entry_id}</td>
                    <td>${formatDate(item.date)}</td>
                    <td>${item.odometer ? item.odometer.toLocaleString() + ' km' : '-'}</td>
                    <td style="color: var(--primary);">${kmDone}</td>
                    <td class="text-success">${formatCurrency(item.total_cost)}</td>
                    <td>
                      <button class="btn btn-edit" onclick="editFuel(${item.entry_id}, '${formatDateForInput(item.date)}', ${item.odometer || 0}, ${item.total_cost})">
                        <i class="fas fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Service Tab -->
      <div id="service-tab" class="tab-content" style="display: none;">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <div class="card-icon" style="background: var(--gradient-3)">
                <i class="fas fa-wrench"></i>
              </div>
              Service History
            </h3>
            <button class="btn btn-add" onclick="showAddServiceModal()">
              <i class="fas fa-plus"></i> Add Service Record
            </button>
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Odometer</th>
                  <th>Cost</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${service.map(item => `
                  <tr>
                    <td style="font-weight: 600;">#${item.service_id}</td>
                    <td>${item.name || '-'}</td>
                    <td>${formatDate(item.service_date)}</td>
                    <td><span class="badge badge-service">${item.service_type || '-'}</span></td>
                    <td>${item.odometer ? item.odometer.toLocaleString() + ' km' : '-'}</td>
                    <td class="text-success">${formatCurrency(item.cost)}</td>
                    <td>
                      <button class="btn btn-edit" onclick="editService(${item.service_id}, '${item.name}', '${formatDateForInput(item.service_date)}', '${item.service_type}', ${item.odometer || 0}, ${item.cost})">
                        <i class="fas fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Insurance Tab -->
      <div id="insurance-tab" class="tab-content" style="display: none;">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <div class="card-icon" style="background: var(--gradient-4)">
                <i class="fas fa-shield-alt"></i>
              </div>
              Insurance Policies
            </h3>
            <button class="btn btn-add" onclick="showAddInsuranceModal()">
              <i class="fas fa-plus"></i> Add Insurance
            </button>
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Policy No</th>
                  <th>Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${insurance.map(item => `
                  <tr>
                    <td style="font-weight: 600;">#${item.insurance_id}</td>
                    <td>${item.name}</td>
                    <td>${item.company}</td>
                    <td>${item.policy_no}</td>
                    <td><span class="badge badge-fuel">${item.type}</span></td>
                    <td>${formatDate(item.start)}</td>
                    <td>${formatDate(item.end)}</td>
                    <td class="text-warning">${formatCurrency(item.amount)}</td>
                    <td>
                      <button class="btn btn-edit" onclick="editInsurance(${item.insurance_id}, '${item.name}', '${item.company}', '${item.policy_no}', '${item.type}', '${formatDateForInput(item.start)}', '${formatDateForInput(item.end)}', ${item.amount})">
                        <i class="fas fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add tab styles
  const tabStyles = document.createElement('style');
  tabStyles.textContent = `
    .tabs-container {
      display: flex;
      gap: 8px;
      border-bottom: 2px solid var(--border-color);
      margin-bottom: 24px;
    }
    
    .tab-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 12px 24px;
      cursor: pointer;
      font-family: inherit;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .tab-btn:hover {
      color: var(--text-primary);
    }
    
    .tab-btn.active {
      color: var(--accent-1);
      border-bottom-color: var(--accent-1);
    }
    
    .tab-content {
      animation: fadeIn 0.3s ease;
    }
  `;
  document.head.appendChild(tabStyles);
}

function switchVehicleTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
  
  event.target.closest('.tab-btn').classList.add('active');
  document.getElementById(`${tab}-tab`).style.display = 'block';
}

// Modal functions for Fuel
function showAddFuelModal() {
  const modal = createModal('Add Fuel Entry', `
    <form id="fuelForm">
      <div class="form-group">
        <label class="form-label">Date</label>
        <input type="date" class="form-input" name="date" required value="${new Date().toISOString().split('T')[0]}">
      </div>
      <div class="form-group">
        <label class="form-label">Total Cost (₹)</label>
        <input type="number" step="0.01" class="form-input" name="total_cost" required>
      </div>
      <div class="form-group">
        <label class="form-label">Odometer (km)</label>
        <input type="number" class="form-input" name="odometer">
      </div>
      <div class="modal-actions">
        <button type="submit" class="btn btn-primary">Save</button>
        <button type="button" class="btn" onclick="closeModal()">Cancel</button>
      </div>
    </form>
  `);
  
  document.getElementById('fuelForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const result = await window.electronAPI.insertRecord('fuel', data);
    if (result.success) {
      showToast('Fuel entry added successfully!', 'success');
      closeModal();
      loadPage('vehicle');
    } else {
      showToast('Error: ' + result.error, 'error');
    }
  });
}

function editFuel(id, date, odometer, cost) {
  const modal = createModal('Edit Fuel Entry', `
    <form id="fuelEditForm">
      <div class="form-group">
        <label class="form-label">Date</label>
        <input type="date" class="form-input" name="date" required value="${date}">
      </div>
      <div class="form-group">
        <label class="form-label">Total Cost (₹)</label>
        <input type="number" step="0.01" class="form-input" name="total_cost" required value="${cost}">
      </div>
      <div class="form-group">
        <label class="form-label">Odometer (km)</label>
        <input type="number" class="form-input" name="odometer" value="${odometer}">
      </div>
      <div class="modal-actions">
        <button type="submit" class="btn btn-primary">Update</button>
        <button type="button" class="btn" onclick="closeModal()">Cancel</button>
      </div>
    </form>
  `);
  
  document.getElementById('fuelEditForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const result = await window.electronAPI.updateRecord('fuel', data, id, 'entry_id');
    if (result.success) {
      showToast('Fuel entry updated successfully!', 'success');
      closeModal();
      loadPage('vehicle');
    } else {
      showToast('Error: ' + result.error, 'error');
    }
  });
}

// Service Modal Functions
function showAddServiceModal() {
  const modal = createModal('Add Service Record', `
    <form id="serviceForm">
      <div class="form-group">
        <label class="form-label">Service Name</label>
        <input type="text" class="form-input" name="name" required>
      </div>
      <div class="form-group">
        <label class="form-label">Service Date</label>
        <input type="date" class="form-input" name="service_date" required value="${new Date().toISOString().split('T')[0]}">
      </div>
      <div class="form-group">
        <label class="form-label">Service Type</label>
        <input type="text" class="form-input" name="service_type" placeholder="e.g., Oil Change, Tire Rotation">
      </div>
      <div class="form-group">
        <label class="form-label">Odometer (km)</label>
        <input type="number" class="form-input" name="odometer">
      </div>
      <div class="form-group">
        <label class="form-label">Cost (₹)</label>
        <input type="number" step="0.01" class="form-input" name="cost" required>
      </div>
      <div class="modal-actions">
        <button type="submit" class="btn btn-primary">Save</button>
        <button type="button" class="btn" onclick="closeModal()">Cancel</button>
      </div>
    </form>
  `);
  
  document.getElementById('serviceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const result = await window.electronAPI.insertRecord('service', data);
    if (result.success) {
      showToast('Service record added successfully!', 'success');
      closeModal();
      loadPage('vehicle');
    } else {
      showToast('Error: ' + result.error, 'error');
    }
  });
}

function editService(id, name, date, type, odometer, cost) {
  const modal = createModal('Edit Service Record', `
    <form id="serviceEditForm">
      <div class="form-group">
        <label class="form-label">Service Name</label>
        <input type="text" class="form-input" name="name" required value="${name}">
      </div>
      <div class="form-group">
        <label class="form-label">Service Date</label>
        <input type="date" class="form-input" name="service_date" required value="${date}">
      </div>
      <div class="form-group">
        <label class="form-label">Service Type</label>
        <input type="text" class="form-input" name="service_type" value="${type}">
      </div>
      <div class="form-group">
        <label class="form-label">Odometer (km)</label>
        <input type="number" class="form-input" name="odometer" value="${odometer}">
      </div>
      <div class="form-group">
        <label class="form-label">Cost (₹)</label>
        <input type="number" step="0.01" class="form-input" name="cost" required value="${cost}">
      </div>
      <div class="modal-actions">
        <button type="submit" class="btn btn-primary">Update</button>
        <button type="button" class="btn" onclick="closeModal()">Cancel</button>
      </div>
    </form>
  `);
  
  document.getElementById('serviceEditForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const result = await window.electronAPI.updateRecord('service', data, id, 'service_id');
    if (result.success) {
      showToast('Service record updated successfully!', 'success');
      closeModal();
      loadPage('vehicle');
    } else {
      showToast('Error: ' + result.error, 'error');
    }
  });
}

// Insurance Modal Functions
function showAddInsuranceModal() {
  const modal = createModal('Add Insurance Policy', `
    <form id="insuranceForm">
      <div class="form-group">
        <label class="form-label">Insurance Name</label>
        <input type="text" class="form-input" name="name" required>
      </div>
      <div class="form-group">
        <label class="form-label">Company</label>
        <input type="text" class="form-input" name="company" required>
      </div>
      <div class="form-group">
        <label class="form-label">Policy Number</label>
        <input type="text" class="form-input" name="policy_no" required>
      </div>
      <div class="form-group">
        <label class="form-label">Type</label>
        <input type="text" class="form-input" name="type" placeholder="e.g., Comprehensive, Third Party">
      </div>
      <div class="form-group">
        <label class="form-label">Start Date</label>
        <input type="date" class="form-input" name="start" required>
      </div>
      <div class="form-group">
        <label class="form-label">End Date</label>
        <input type="date" class="form-input" name="end" required>
      </div>
      <div class="form-group">
        <label class="form-label">Amount (₹)</label>
        <input type="number" step="0.01" class="form-input" name="amount" required>
      </div>
      <div class="form-group">
        <label class="form-label">Renewal Date</label>
        <input type="date" class="form-input" name="renew_date">
      </div>
      <div class="modal-actions">
        <button type="submit" class="btn btn-primary">Save</button>
        <button type="button" class="btn" onclick="closeModal()">Cancel</button>
      </div>
    </form>
  `);
  
  document.getElementById('insuranceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const result = await window.electronAPI.insertRecord('insurance', data);
    if (result.success) {
      showToast('Insurance policy added successfully!', 'success');
      closeModal();
      loadPage('vehicle');
    } else {
      showToast('Error: ' + result.error, 'error');
    }
  });
}

function editInsurance(id, name, company, policyNo, type, start, end, amount) {
  const modal = createModal('Edit Insurance Policy', `
    <form id="insuranceEditForm">
      <div class="form-group">
        <label class="form-label">Insurance Name</label>
        <input type="text" class="form-input" name="name" required value="${name}">
      </div>
      <div class="form-group">
        <label class="form-label">Company</label>
        <input type="text" class="form-input" name="company" required value="${company}">
      </div>
      <div class="form-group">
        <label class="form-label">Policy Number</label>
        <input type="text" class="form-input" name="policy_no" required value="${policyNo}">
      </div>
      <div class="form-group">
        <label class="form-label">Type</label>
        <input type="text" class="form-input" name="type" value="${type}">
      </div>
      <div class="form-group">
        <label class="form-label">Start Date</label>
        <input type="date" class="form-input" name="start" required value="${start}">
      </div>
      <div class="form-group">
        <label class="form-label">End Date</label>
        <input type="date" class="form-input" name="end" required value="${end}">
      </div>
      <div class="form-group">
        <label class="form-label">Amount (₹)</label>
        <input type="number" step="0.01" class="form-input" name="amount" required value="${amount}">
      </div>
      <div class="modal-actions">
        <button type="submit" class="btn btn-primary">Update</button>
        <button type="button" class="btn" onclick="closeModal()">Cancel</button>
      </div>
    </form>
  `);
  
  document.getElementById('insuranceEditForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const result = await window.electronAPI.updateRecord('insurance', data, id, 'insurance_id');
    if (result.success) {
      showToast('Insurance policy updated successfully!', 'success');
      closeModal();
      loadPage('vehicle');
    } else {
      showToast('Error: ' + result.error, 'error');
    }
  });
}

function showAddVehicleModal() {
  const modal = createModal('Add New Vehicle', `
    <form id="vehicleForm">
      <div class="form-group">
        <label class="form-label">Registration Number</label>
        <input type="text" class="form-input" name="registration_number" required>
      </div>
      <div class="form-group">
        <label class="form-label">Owner Name</label>
        <input type="text" class="form-input" name="owner_name" required>
      </div>
      <div class="form-group">
        <label class="form-label">Chassis Number</label>
        <input type="text" class="form-input" name="chassis_number">
      </div>
      <div class="modal-actions">
        <button type="submit" class="btn btn-primary">Save</button>
        <button type="button" class="btn" onclick="closeModal()">Cancel</button>
      </div>
    </form>
  `);
  
  document.getElementById('vehicleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const result = await window.electronAPI.insertRecord('vehicle', data);
    if (result.success) {
      showToast('Vehicle added successfully!', 'success');
      closeModal();
      loadPage('vehicle');
    } else {
      showToast('Error: ' + result.error, 'error');
    }
  });
}

// Utility function to create modal
function createModal(title, content) {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.id = 'current-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">${title}</h2>
        <button class="modal-close" onclick="closeModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      ${content}
    </div>
  `;
  document.body.appendChild(modal);
  return modal;
}

function closeModal() {
  const modal = document.getElementById('current-modal');
  if (modal) {
    modal.remove();
  }
}
