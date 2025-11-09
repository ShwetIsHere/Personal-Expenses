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
      <div class="grid grid-3 mb-4">
        ${vehicles.map(vehicle => `
          <div class="card">
            <div class="card-icon" style="background: var(--gradient-1); width: 60px; height: 60px; font-size: 28px; margin-bottom: 16px;">
              <i class="fas fa-car"></i>
            </div>
            <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">${vehicle.registration_number}</h3>
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
      <div class="tabs-container mb-4">
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
                  <th>Date</th>
                  <th>Odometer</th>
                  <th>Cost</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${fuel.map(item => `
                  <tr>
                    <td>${formatDate(item.date)}</td>
                    <td>${item.odometer ? item.odometer.toLocaleString() + ' km' : '-'}</td>
                    <td class="text-success">${formatCurrency(item.total_cost)}</td>
                    <td>
                      <button class="btn btn-edit" onclick="editFuel(${item.entry_id})">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-delete" onclick="deleteFuel(${item.entry_id})">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                `).join('')}
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
                    <td>${item.name || '-'}</td>
                    <td>${formatDate(item.service_date)}</td>
                    <td><span class="badge badge-service">${item.service_type || '-'}</span></td>
                    <td>${item.odometer ? item.odometer.toLocaleString() + ' km' : '-'}</td>
                    <td class="text-success">${formatCurrency(item.cost)}</td>
                    <td>
                      <button class="btn btn-edit" onclick="editService(${item.service_id})">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-delete" onclick="deleteService(${item.service_id})">
                        <i class="fas fa-trash"></i>
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
                    <td>${item.name}</td>
                    <td>${item.company}</td>
                    <td>${item.policy_no}</td>
                    <td><span class="badge badge-fuel">${item.type}</span></td>
                    <td>${formatDate(item.start)}</td>
                    <td>${formatDate(item.end)}</td>
                    <td class="text-warning">${formatCurrency(item.amount)}</td>
                    <td>
                      <button class="btn btn-edit" onclick="editInsurance(${item.insurance_id})">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-delete" onclick="deleteInsurance(${item.insurance_id})">
                        <i class="fas fa-trash"></i>
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

// Modal functions (simplified - you can expand these)
function showAddVehicleModal() {
  showToast('Add Vehicle modal - To be implemented', 'success');
}

function showAddFuelModal() {
  showToast('Add Fuel modal - To be implemented', 'success');
}

function showAddServiceModal() {
  showToast('Add Service modal - To be implemented', 'success');
}

function showAddInsuranceModal() {
  showToast('Add Insurance modal - To be implemented', 'success');
}

function editFuel(id) {
  showToast(`Edit Fuel Entry ${id}`, 'success');
}

function deleteFuel(id) {
  if (confirm('Are you sure you want to delete this fuel entry?')) {
    window.electronAPI.deleteRecord('fuel', id, 'entry_id').then(() => {
      showToast('Fuel entry deleted successfully', 'success');
      loadPage('vehicle');
    });
  }
}

function editService(id) {
  showToast(`Edit Service ${id}`, 'success');
}

function deleteService(id) {
  if (confirm('Are you sure you want to delete this service record?')) {
    window.electronAPI.deleteRecord('service', id, 'service_id').then(() => {
      showToast('Service record deleted successfully', 'success');
      loadPage('vehicle');
    });
  }
}

function editInsurance(id) {
  showToast(`Edit Insurance ${id}`, 'success');
}

function deleteInsurance(id) {
  if (confirm('Are you sure you want to delete this insurance policy?')) {
    window.electronAPI.deleteRecord('insurance', id, 'insurance_id').then(() => {
      showToast('Insurance policy deleted successfully', 'success');
      loadPage('vehicle');
    });
  }
}
