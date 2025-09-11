// Admin Dashboard JavaScript

// DOM elements
const userEmailElement = document.getElementById('userEmail');
const alertContainer = document.getElementById('alertContainer');

// Company selection elements
const adminCompanySelect = document.getElementById('adminCompanySelect');
const currentAdminCompanyName = document.getElementById('currentAdminCompanyName');
const currentAdminCompanyLocation = document.getElementById('currentAdminCompanyLocation');

// Leave verification elements
const noAdminCompanySelected = document.getElementById('noAdminCompanySelected');
const leaveRecordsContainer = document.getElementById('leaveRecordsContainer');
const leaveRecordsTableBody = document.getElementById('leaveRecordsTableBody');
const refreshLeavesBtn = document.getElementById('refreshLeavesBtn');

// Navigation elements
const companiesViewBtn = document.getElementById('companiesViewBtn');
const leaveVerificationBtn = document.getElementById('leaveVerificationBtn');

// Current state
let currentUser = null;
let selectedAdminCompanyId = null;
let allCompanies = [];

// Utility Functions
function showAlert(message, type = 'danger') {
    const alertId = 'alert-' + Date.now();
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert" id="${alertId}">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    alertContainer.insertAdjacentHTML('beforeend', alertHtml);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        const alertElement = document.getElementById(alertId);
        if (alertElement) {
            const bsAlert = new bootstrap.Alert(alertElement);
            bsAlert.close();
        }
    }, 5000);
}

// Check authentication and permissions
function checkAuth() {
    const userRole = sessionStorage.getItem('userRole');
    const userId = sessionStorage.getItem('userId');
    const userEmail = sessionStorage.getItem('userEmail');
    
    if (!userId || !userRole) {
        window.location.href = 'index.html';
        return false;
    }
    
    if (userRole !== 'admin') {
        showAlert('Access denied. Admin privileges required.', 'danger');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return false;
    }
    
    currentUser = { uid: userId, email: userEmail };
    
    // Update UI
    userEmailElement.textContent = userEmail;
    
    return true;
}

// Load all companies (admin has access to all)
async function loadAllCompanies() {
    try {
        const companiesRef = window.firebaseRef(window.firebaseDatabase, 'companies');
        const snapshot = await window.firebaseGet(companiesRef);
        
        if (snapshot.exists()) {
            const companies = snapshot.val();
            allCompanies = Object.entries(companies).map(([id, data]) => ({
                id,
                ...data
            }));
            
            updateCompanyDropdown();
        } else {
            adminCompanySelect.innerHTML = '<option value="">No companies found</option>';
        }
    } catch (error) {
        console.error('Error loading companies:', error);
        showAlert('Failed to load company data.');
        adminCompanySelect.innerHTML = '<option value="">Loading failed</option>';
    }
}

// Update company dropdown
function updateCompanyDropdown() {
    adminCompanySelect.innerHTML = '<option value="">Select Company</option>';
    
    allCompanies.forEach(company => {
        const companyDisplayName = `${company.name}${company.location ? ' - ' + company.location : ''}`;
        const option = new Option(companyDisplayName, company.id);
        adminCompanySelect.add(option);
    });
    
    if (allCompanies.length === 0) {
        adminCompanySelect.innerHTML = '<option value="">No companies available</option>';
    }
}

// Load leave records for selected company
async function loadLeaveRecords(companyId) {
    try {
        // Get all employees for this company first
        const employeesRef = window.firebaseRef(window.firebaseDatabase, `employees/${companyId}`);
        const employeesSnapshot = await window.firebaseGet(employeesRef);
        
        if (!employeesSnapshot.exists()) {
            leaveRecordsTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No employee records found for this company</td></tr>';
            return;
        }
        
        const employees = employeesSnapshot.val();
        
        // Get all leave records for this company
        const leavesRef = window.firebaseRef(window.firebaseDatabase, `leaves/${companyId}`);
        const leavesSnapshot = await window.firebaseGet(leavesRef);
        
        if (!leavesSnapshot.exists()) {
            leaveRecordsTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No leave records found for this company</td></tr>';
            return;
        }
        
        const leaves = leavesSnapshot.val();
        
        // Process and display leave records
        displayLeaveRecords(leaves, employees, companyId);
        
    } catch (error) {
        console.error('Error loading leave records:', error);
        showAlert('Failed to load leave records.');
        leaveRecordsTableBody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Error loading leave records</td></tr>';
    }
}

// Display leave records in table
function displayLeaveRecords(leaves, employees, companyId) {
    const leaveRecords = [];
    
    // Process all leave records
    Object.entries(leaves).forEach(([employeeId, employeeLeaves]) => {
        const employee = employees[employeeId];
        if (!employee) return; // Skip if employee not found
        
        Object.entries(employeeLeaves).forEach(([leaveId, leaveData]) => {
            leaveRecords.push({
                id: leaveId,
                employeeId,
                employeeName: employee.name,
                employeeNo: employee.empNo,
                companyId,
                ...leaveData
            });
        });
    });
    
    if (leaveRecords.length === 0) {
        leaveRecordsTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No leave records found</td></tr>';
        return;
    }
    
    // Sort by creation date (newest first)
    leaveRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const tableRows = leaveRecords.map(record => {
        const startDate = new Date(record.startDate).toLocaleDateString('zh-CN');
        const endDate = new Date(record.endDate).toLocaleDateString('zh-CN');
        
        // Format leave type
        const leaveTypeMap = {
            'annual': 'Annual Leave',
            'medical': 'Medical Leave',
            'hospitalization': 'Hospitalization Leave',
            'unpaid': 'Unpaid Leave',
            'compassionate': 'Compassionate Leave',
            'paternity': 'Paternity Leave',
            'maternity': 'Maternity Leave',
            'emergency': 'Emergency Leave'
        };
        const leaveTypeDisplay = leaveTypeMap[record.type] || record.type;
        
        // Status badge and verification button
        let statusBadge, verificationButton;
        
        if (record.verified) {
            statusBadge = '<span class="badge bg-success"><i class="bi bi-check-circle-fill me-1"></i>Verified</span>';
            verificationButton = `
                <button class="btn btn-outline-warning btn-sm" onclick="toggleVerification('${record.companyId}', '${record.employeeId}', '${record.id}', false)" title="Unverify">
                    <i class="bi bi-x-circle"></i> Unverify
                </button>
            `;
        } else {
            statusBadge = '<span class="badge bg-warning"><i class="bi bi-clock me-1"></i>Pending</span>';
            verificationButton = `
                <button class="btn btn-outline-success btn-sm" onclick="toggleVerification('${record.companyId}', '${record.employeeId}', '${record.id}', true)" title="Verify">
                    <i class="bi bi-check-circle"></i> Verify
                </button>
            `;
        }
        
        // Row styling based on verification status
        const rowClass = record.verified ? 'table-success' : '';
        
        return `
            <tr class="${rowClass}">
                <td>
                    <strong>${record.employeeName}</strong>
                    <br><small class="text-muted">Emp No: ${record.employeeNo}</small>
                </td>
                <td><span class="badge bg-secondary">${leaveTypeDisplay}</span></td>
                <td>${startDate}</td>
                <td>${endDate}</td>
                <td>
                    <strong>${record.duration}</strong> day${record.duration === 1 ? '' : 's'}
                    ${record.isHalfDay ? '<br><small class="text-info">Half day</small>' : ''}
                </td>
                <td>${record.reason}</td>
                <td>${statusBadge}</td>
                <td>${verificationButton}</td>
            </tr>
        `;
    }).join('');
    
    leaveRecordsTableBody.innerHTML = tableRows;
}

// Toggle leave verification status
async function toggleVerification(companyId, employeeId, leaveId, verified) {
    try {
        const leaveRef = window.firebaseRef(window.firebaseDatabase, `leaves/${companyId}/${employeeId}/${leaveId}`);
        
        // Update verification status
        await window.firebaseUpdate(leaveRef, {
            verified: verified,
            verifiedAt: new Date().toISOString(),
            verifiedBy: currentUser.uid
        });
        
        const action = verified ? 'verified' : 'unverified';
        showAlert(`Leave record ${action} successfully!`, 'success');
        
        // Reload leave records
        await loadLeaveRecords(companyId);
        
    } catch (error) {
        console.error('Error toggling verification:', error);
        showAlert('Operation failed, please try again.');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!checkAuth()) return;
    
    // Load all companies
    loadAllCompanies();
});

// Company selection change
adminCompanySelect.addEventListener('change', (e) => {
    selectedAdminCompanyId = e.target.value;
    
    if (selectedAdminCompanyId) {
        const selectedCompany = allCompanies.find(c => c.id === selectedAdminCompanyId);
        currentAdminCompanyName.textContent = selectedCompany ? selectedCompany.name : '未知';
        currentAdminCompanyLocation.textContent = selectedCompany ? selectedCompany.location || '未指定' : '-';
        
        // Show leave records table and load data
        noAdminCompanySelected.style.display = 'none';
        leaveRecordsContainer.style.display = 'block';
        loadLeaveRecords(selectedAdminCompanyId);
    } else {
        currentAdminCompanyName.textContent = '未选择';
        currentAdminCompanyLocation.textContent = '-';
        noAdminCompanySelected.style.display = 'block';
        leaveRecordsContainer.style.display = 'none';
    }
});

// Refresh leaves button
refreshLeavesBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (selectedAdminCompanyId) {
        loadLeaveRecords(selectedAdminCompanyId);
    }
});

// Navigation buttons
companiesViewBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // For now, just show alert - can be implemented later
    showAlert('Company management feature coming soon!', 'info');
});

leaveVerificationBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // Scroll to leave verification section
    document.getElementById('leaveVerificationSection').scrollIntoView({ behavior: 'smooth' });
});

// Global function for toggle verification (called from HTML)
window.toggleVerification = toggleVerification;

// Listen for auth state changes
window.onAuthStateChanged(window.firebaseAuth, (user) => {
    if (!user) {
        // User is signed out
        window.location.href = 'index.html';
    }
});
