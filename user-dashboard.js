// User Dashboard JavaScript

// User roles
const USER_ROLES = {
    SADMIN: 'sadmin',
    ADMIN: 'admin',
    USER: 'user'
};

// DOM elements
const userEmailElement = document.getElementById('userEmail');
const userDisplayNameElement = document.getElementById('userDisplayName');
const logoutBtn = document.getElementById('logoutBtn');
const alertContainer = document.getElementById('alertContainer');

// Company selection elements
const companySelect = document.getElementById('companySelect');
const currentCompanyName = document.getElementById('currentCompanyName');
const currentCompanyLocation = document.getElementById('currentCompanyLocation');

// Employee management elements
const addEmployeeBtn = document.getElementById('addEmployeeBtn');
const addEmployeeBtnHeader = document.getElementById('addEmployeeBtnHeader');
const refreshEmployeesBtn = document.getElementById('refreshEmployeesBtn');
const employeesTableBody = document.getElementById('employeesTableBody');
const employeeTableContainer = document.getElementById('employeeTableContainer');
const noCompanySelected = document.getElementById('noCompanySelected');

// Modal elements
const employeeModal = new bootstrap.Modal(document.getElementById('employeeModal'));
const employeeModalTitle = document.getElementById('employeeModalTitle');
const employeeForm = document.getElementById('employeeForm');
const saveEmployeeBtn = document.getElementById('saveEmployeeBtn');
const saveEmployeeSpinner = document.getElementById('saveEmployeeSpinner');

// Employee Details Modal elements
const employeeDetailsModal = new bootstrap.Modal(document.getElementById('employeeDetailsModal'));
const employeeDetailsName = document.getElementById('employeeDetailsName');
const detailEmpNo = document.getElementById('detailEmpNo');
const detailPosition = document.getElementById('detailPosition');
const detailJoinDate = document.getElementById('detailJoinDate');
const detailYearsOfService = document.getElementById('detailYearsOfService');
const detailAnnualLeave = document.getElementById('detailAnnualLeave');
const detailMedicalLeave = document.getElementById('detailMedicalLeave');
const detailHospitalizationLeave = document.getElementById('detailHospitalizationLeave');

// Record Leave form elements
const recordLeaveForm = document.getElementById('recordLeaveForm');
const leaveType = document.getElementById('leaveType');
const leaveStartDate = document.getElementById('leaveStartDate');
const leaveEndDate = document.getElementById('leaveEndDate');
const leaveReason = document.getElementById('leaveReason');
const leaveDuration = document.getElementById('leaveDuration');
const balanceCheck = document.getElementById('balanceCheck');
const currentBalanceDisplay = document.getElementById('currentBalanceDisplay');
const afterBalanceDisplay = document.getElementById('afterBalanceDisplay');

// Leave history elements
const leaveHistoryTableBody = document.getElementById('leaveHistoryTableBody');
const refreshLeaveHistoryBtn = document.getElementById('refreshLeaveHistoryBtn');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');

// Leave summary elements
const usedAnnualLeave = document.getElementById('usedAnnualLeave');
const remainingAnnualLeave = document.getElementById('remainingAnnualLeave');
const usedMedicalLeave = document.getElementById('usedMedicalLeave');
const remainingMedicalLeave = document.getElementById('remainingMedicalLeave');

// Form elements
const employeeName = document.getElementById('employeeName');
const employeeNo = document.getElementById('employeeNo');
const position = document.getElementById('position');
const joinDate = document.getElementById('joinDate');
const yearsOfService = document.getElementById('yearsOfService');
const annualLeave = document.getElementById('annualLeave');
const medicalLeave = document.getElementById('medicalLeave');
const hospitalizationLeave = document.getElementById('hospitalizationLeave');
const employeeCompany = document.getElementById('employeeCompany');

// Stats elements
const totalEmployeesElement = document.getElementById('totalEmployees');
const activeLeavesElement = document.getElementById('activeLeaves');
const pendingRequestsElement = document.getElementById('pendingRequests');

// Current user data
let currentUser = null;
let currentUserRole = null;
let currentUserCompanies = [];
let selectedCompanyId = null;
let editingEmployeeId = null;

// Current employee details data
let currentEmployeeId = null;
let currentEmployeeData = null;

// Calculate years of service based on join date
function calculateYearsOfService(joinDateString) {
    if (!joinDateString) return null;
    
    const joinDate = new Date(joinDateString);
    const currentDate = new Date();
    
    // Check if joined this year
    if (joinDate.getFullYear() === currentDate.getFullYear()) {
        return 'current-year';
    }
    
    // Check if joined last year
    if (joinDate.getFullYear() === currentDate.getFullYear() - 1) {
        return 'last-year';
    }
    
    // Calculate the difference in years
    let years = currentDate.getFullYear() - joinDate.getFullYear();
    
    // Check if the anniversary has passed this year
    const monthDiff = currentDate.getMonth() - joinDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < joinDate.getDate())) {
        years--;
    }
    
    // Return the range category
    if (years < 2) return '<2';
    else if (years >= 2 && years < 5) return '2-5';
    else return '>5';
}

// Format years of service range for display
function formatYearsOfServiceDisplay(yearsRange) {
    switch(yearsRange) {
        case 'current-year': return 'Current year';
        case 'last-year': return 'Last year';
        case '<2': return 'Less than 2 years';
        case '2-5': return '2 to 5 years';
        case '>5': return 'More than 5 years';
        default: return 'Not specified';
    }
}

// Update years of service based on join date
function updateYearsOfService() {
    const joinDateValue = joinDate.value;
    if (joinDateValue) {
        const yearsRange = calculateYearsOfService(joinDateValue);
        yearsOfService.value = formatYearsOfServiceDisplay(yearsRange);
        yearsOfService.dataset.range = yearsRange; // Store the range for calculations
        updateLeaveEntitlements();
    } else {
        yearsOfService.value = '';
        yearsOfService.dataset.range = '';
        updateLeaveEntitlements();
    }
}

// Calculate proportional annual leave for last year employees
function calculateProportionalAnnualLeave(joinDateString, positionLevel) {
    const joinDate = new Date(joinDateString);
    const joinYear = joinDate.getFullYear();
    
    // Get the last day of the join year
    const yearEnd = new Date(joinYear, 11, 31); // December 31st of join year
    
    // Calculate days from join date to end of year
    const timeDiff = yearEnd.getTime() - joinDate.getTime();
    const daysWorked = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include join date
    
    // Get full year annual leave entitlement for the position
    const fullYearEntitlements = {
        'Manager Level': 14,
        'Executive Level': 14,
        'Supervisor Level': 14,
        'Clerical Level': 10,
        'Worker Level': 8
    };
    
    const fullYearLeave = fullYearEntitlements[positionLevel] || 0;
    
    // Calculate proportional leave (days worked / total days in year * full entitlement)
    const totalDaysInYear = isLeapYear(joinYear) ? 366 : 365;
    const proportionalLeave = Math.round((daysWorked / totalDaysInYear) * fullYearLeave);
    
    return proportionalLeave;
}

// Check if a year is a leap year
function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// Leave calculation based on position and years of service
function calculateLeaveEntitlements(positionLevel, yearsOfServiceRange, joinDateString = null) {
    // Special case for current year employees
    if (yearsOfServiceRange === 'current-year') {
        return {
            annualLeave: 0, // No annual leave for current year employees
            medicalLeave: 14, // Fixed 14 days medical leave
            hospitalizationLeave: 60 // Fixed for all employees
        };
    }
    
    // Special case for last year employees - proportional annual leave
    if (yearsOfServiceRange === 'last-year' && joinDateString) {
        const proportionalAnnualLeave = calculateProportionalAnnualLeave(joinDateString, positionLevel);
        return {
            annualLeave: proportionalAnnualLeave,
            medicalLeave: 14, // Fixed medical leave for last year employees
            hospitalizationLeave: 60 // Fixed for all employees
        };
    }
    
    // Annual Leave calculation
    const annualLeaveTable = {
        'Manager Level': { '<2': 14, '2-5': 14, '>5': 16 },
        'Executive Level': { '<2': 14, '2-5': 14, '>5': 16 },
        'Supervisor Level': { '<2': 14, '2-5': 14, '>5': 16 },
        'Clerical Level': { '<2': 10, '2-5': 12, '>5': 16 },
        'Worker Level': { '<2': 8, '2-5': 12, '>5': 16 }
    };
    
    // Medical Leave calculation  
    const medicalLeaveTable = {
        'Manager Level': { '<2': 14, '2-5': 18, '>5': 22 },
        'Executive Level': { '<2': 14, '2-5': 18, '>5': 22 },
        'Supervisor Level': { '<2': 14, '2-5': 18, '>5': 22 },
        'Clerical Level': { '<2': 14, '2-5': 18, '>5': 22 },
        'Worker Level': { '<2': 14, '2-5': 18, '>5': 22 }
    };
    
    const annualLeaveDays = annualLeaveTable[positionLevel]?.[yearsOfServiceRange] || 0;
    const medicalLeaveDays = medicalLeaveTable[positionLevel]?.[yearsOfServiceRange] || 0;
    
    return {
        annualLeave: annualLeaveDays,
        medicalLeave: medicalLeaveDays,
        hospitalizationLeave: 60 // Fixed for all employees
    };
}

// Update leave entitlements when position or years of service changes
function updateLeaveEntitlements() {
    const positionValue = position.value;
    const yearsRange = yearsOfService.dataset.range;
    const joinDateValue = joinDate.value;
    
    if (positionValue && yearsRange) {
        const entitlements = calculateLeaveEntitlements(positionValue, yearsRange, joinDateValue);
        annualLeave.value = `${entitlements.annualLeave} days`;
        medicalLeave.value = `${entitlements.medicalLeave} days`;
        hospitalizationLeave.value = `${entitlements.hospitalizationLeave} days`;
    } else {
        annualLeave.value = '';
        medicalLeave.value = '';
        hospitalizationLeave.value = '60 days';
    }
}

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

function setLoading(button, isLoading, spinner, originalText = '') {
    if (isLoading) {
        button.disabled = true;
        spinner.classList.remove('d-none');
        button.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Saving...`;
    } else {
        button.disabled = false;
        spinner.classList.add('d-none');
        button.innerHTML = originalText || '<i class="bi bi-check-lg me-1"></i>Save Employee';
    }
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
    
    if (userRole !== USER_ROLES.USER) {
        showAlert('Access denied. User privileges required.', 'danger');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return false;
    }
    
    currentUserRole = userRole;
    currentUser = { uid: userId, email: userEmail };
    
    // Update UI
    userEmailElement.textContent = userEmail;
    userDisplayNameElement.textContent = userEmail.split('@')[0]; // Use email prefix as display name
    
    return true;
}

// Load user's accessible companies
async function loadUserCompanies() {
    try {
        const userRef = window.firebaseRef(window.firebaseDatabase, `users/${currentUser.uid}`);
        const snapshot = await window.firebaseGet(userRef);
        
        if (snapshot.exists()) {
            const userData = snapshot.val();
            const companyPermissions = userData.companyPermissions || {};
            
            // Load company details
            const companiesRef = window.firebaseRef(window.firebaseDatabase, 'companies');
            const companiesSnapshot = await window.firebaseGet(companiesRef);
            
            if (companiesSnapshot.exists()) {
                const allCompanies = companiesSnapshot.val();
                currentUserCompanies = [];
                
                // Filter companies based on user permissions
                for (const [companyId, permissions] of Object.entries(companyPermissions)) {
                    if (allCompanies[companyId]) {
                        currentUserCompanies.push({
                            id: companyId,
                            ...allCompanies[companyId],
                            permissions: permissions
                        });
                    }
                }
                
                updateCompanyDropdowns();
            }
        }
    } catch (error) {
        console.error('Error loading user companies:', error);
        showAlert('Failed to load company data.');
    }
}

// Update company dropdown options
function updateCompanyDropdowns() {
    // Main company selector
    companySelect.innerHTML = '<option value="">Select Company</option>';
    
    // Employee modal company selector
    employeeCompany.innerHTML = '<option value="">Select Company</option>';
    
    currentUserCompanies.forEach(company => {
        const companyDisplayName = `${company.name}${company.location ? ' - ' + company.location : ''}`;
        const option1 = new Option(companyDisplayName, company.id);
        const option2 = new Option(companyDisplayName, company.id);
        companySelect.add(option1);
        employeeCompany.add(option2);
    });
    
    if (currentUserCompanies.length === 0) {
        companySelect.innerHTML = '<option value="">No companies available</option>';
        employeeCompany.innerHTML = '<option value="">No companies available</option>';
    }
}

// Load employees for selected company
async function loadEmployees(companyId) {
    try {
        const employeesRef = window.firebaseRef(window.firebaseDatabase, `employees/${companyId}`);
        const snapshot = await window.firebaseGet(employeesRef);
        
        if (snapshot.exists()) {
            const employees = snapshot.val();
            await displayEmployees(employees);
            updateStats(employees);
        } else {
            employeesTableBody.innerHTML = '<tr><td colspan="9" class="text-center">No employees found for this company</td></tr>';
            updateStats({});
        }
    } catch (error) {
        console.error('Error loading employees:', error);
        showAlert('Failed to load employees.');
        employeesTableBody.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Error loading employees</td></tr>';
    }
}

// Display employees in table
async function displayEmployees(employees) {
    const employeeEntries = Object.entries(employees || {});
    
    if (employeeEntries.length === 0) {
        employeesTableBody.innerHTML = '<tr><td colspan="9" class="text-center">No employees found</td></tr>';
        return;
    }
    
    // Show loading while calculating balances
    employeesTableBody.innerHTML = '<tr><td colspan="9" class="text-center">Calculating leave balances...</td></tr>';
    
    const tableRowPromises = employeeEntries.map(async ([employeeId, employeeData]) => {
        // Format join date display
        const joinDateDisplay = employeeData.joinDate ? 
            new Date(employeeData.joinDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit', 
                year: 'numeric'
            }) : 'Not specified';
        
        // Check employee year status for highlighting
        const isCurrentYearEmployee = employeeData.yearsOfService === 'current-year';
        const isLastYearEmployee = employeeData.yearsOfService === 'last-year';
        
        // Format years of service display
        let yearsDisplay = '';
        switch(employeeData.yearsOfService) {
            case 'current-year': 
                yearsDisplay = '<span class="badge bg-warning text-dark"><i class="bi bi-star-fill me-1"></i>Current year</span>'; 
                break;
            case 'last-year': 
                yearsDisplay = '<span class="badge bg-info text-white"><i class="bi bi-clock-history me-1"></i>Last year</span>'; 
                break;
            case '<2': yearsDisplay = 'Less than 2 years'; break;
            case '2-5': yearsDisplay = '2 to 5 years'; break;
            case '>5': yearsDisplay = 'More than 5 years'; break;
            default: yearsDisplay = employeeData.yearsOfService || 'Not specified';
        }
        
        // Apply highlighting for special employees
        let rowClass = '';
        let empNoDisplay = `<strong>${employeeData.empNo}</strong>`;
        if (isCurrentYearEmployee) {
            rowClass = 'table-warning';
            empNoDisplay = `<strong>${employeeData.empNo}</strong> <i class="bi bi-star-fill text-warning ms-1" title="New Employee - Current Year"></i>`;
        } else if (isLastYearEmployee) {
            rowClass = 'table-info';
            empNoDisplay = `<strong>${employeeData.empNo}</strong> <i class="bi bi-clock-history text-info ms-1" title="New Employee - Last Year"></i>`;
        }
        
        // Special badge styling for special employees
        let annualLeaveBadge;
        if (isCurrentYearEmployee) {
            annualLeaveBadge = `<span class="badge bg-secondary">${employeeData.annualLeave} days</span>`;
        } else if (isLastYearEmployee) {
            annualLeaveBadge = `<span class="badge bg-success">${employeeData.annualLeave} days</span>`;
        } else {
            annualLeaveBadge = `<span class="badge bg-primary">${employeeData.annualLeave} days</span>`;
        }
        
        // Calculate leave balance
        const leaveBalance = await calculateEmployeeLeaveBalance(employeeId, employeeData);
        const leaveBalanceDisplay = formatLeaveBalance(leaveBalance);
            
        return `
            <tr class="${rowClass}">
                <td>${empNoDisplay}</td>
                <td><a href="#" class="text-decoration-none fw-bold" onclick="openEmployeeDetails('${employeeId}')" title="View Employee Details">${employeeData.name}</a></td>
                <td>${employeeData.position}</td>
                <td>${joinDateDisplay}</td>
                <td>${yearsDisplay}</td>
                <td>${annualLeaveBadge}</td>
                <td><span class="badge bg-info">${employeeData.medicalLeave} days</span></td>
                <td>${leaveBalanceDisplay}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-secondary" onclick="editEmployee('${employeeId}')" title="Edit Employee">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteEmployee('${employeeId}', '${employeeData.name}')" title="Delete Employee">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    // Wait for all balance calculations to complete
    const tableRows = await Promise.all(tableRowPromises);
    employeesTableBody.innerHTML = tableRows.join('');
}

// Update dashboard stats
function updateStats(employees) {
    const employeeEntries = Object.entries(employees || {});
    totalEmployeesElement.textContent = employeeEntries.length;
    
    // For now, set leave stats to 0 as we haven't implemented leave requests yet
    activeLeavesElement.textContent = '0';
    pendingRequestsElement.textContent = '0';
}

// Create new employee
async function saveEmployee(employeeData, isEdit = false) {
    try {
        if (!selectedCompanyId) {
            showAlert('Please select a company first.');
            return false;
        }
        
        const employeeId = isEdit ? editingEmployeeId : 'emp_' + Date.now();
        const employeeRef = window.firebaseRef(window.firebaseDatabase, `employees/${selectedCompanyId}/${employeeId}`);
        
        await window.firebaseSet(employeeRef, {
            ...employeeData,
            companyId: selectedCompanyId,
            createdAt: isEdit ? employeeData.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        
        showAlert(`Employee ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
        
        // Reload employees
        await loadEmployees(selectedCompanyId);
        
        return true;
    } catch (error) {
        console.error('Error saving employee:', error);
        showAlert('Failed to save employee. Please try again.');
        return false;
    }
}

// Validate employee number uniqueness within company
async function validateEmployeeNumber(empNo, companyId, excludeEmployeeId = null) {
    try {
        const employeesRef = window.firebaseRef(window.firebaseDatabase, `employees/${companyId}`);
        const snapshot = await window.firebaseGet(employeesRef);
        
        if (snapshot.exists()) {
            const employees = snapshot.val();
            for (const [employeeId, employeeData] of Object.entries(employees)) {
                if (employeeId !== excludeEmployeeId && employeeData.empNo === empNo) {
                    return false; // Employee number already exists
                }
            }
        }
        return true; // Employee number is unique
    } catch (error) {
        console.error('Error validating employee number:', error);
        return true; // Allow saving if validation fails
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!checkAuth()) return;
    
    // Load user companies
    loadUserCompanies();
});

// Company selection change
companySelect.addEventListener('change', (e) => {
    selectedCompanyId = e.target.value;
    
    if (selectedCompanyId) {
        const selectedCompany = currentUserCompanies.find(c => c.id === selectedCompanyId);
        currentCompanyName.textContent = selectedCompany ? selectedCompany.name : 'Unknown';
        currentCompanyLocation.textContent = selectedCompany ? selectedCompany.location || 'Not specified' : '-';
        
        // Show employee table and load employees
        noCompanySelected.style.display = 'none';
        employeeTableContainer.style.display = 'block';
        loadEmployees(selectedCompanyId);
    } else {
        currentCompanyName.textContent = 'None selected';
        currentCompanyLocation.textContent = '-';
        noCompanySelected.style.display = 'block';
        employeeTableContainer.style.display = 'none';
        updateStats({});
    }
});

// Position and join date change handlers
position.addEventListener('change', updateLeaveEntitlements);
joinDate.addEventListener('change', updateYearsOfService);

// Add employee buttons
addEmployeeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openEmployeeModal();
});

addEmployeeBtnHeader.addEventListener('click', (e) => {
    e.preventDefault();
    openEmployeeModal();
});

// Refresh employees
refreshEmployeesBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (selectedCompanyId) {
        loadEmployees(selectedCompanyId);
    }
});

// Open employee modal for adding/editing
function openEmployeeModal(employeeData = null, employeeId = null) {
    if (!selectedCompanyId) {
        showAlert('Please select a company first.');
        return;
    }
    
    editingEmployeeId = employeeId;
    
    if (employeeData) {
        // Edit mode
        employeeModalTitle.textContent = 'Edit Employee';
        populateEmployeeForm(employeeData);
    } else {
        // Add mode
        employeeModalTitle.textContent = 'Add New Employee';
        employeeForm.reset();
        employeeCompany.value = selectedCompanyId;
        hospitalizationLeave.value = '60 days';
    }
    
    employeeModal.show();
}

// Populate employee form for editing
function populateEmployeeForm(employeeData) {
    employeeName.value = employeeData.name || '';
    employeeNo.value = employeeData.empNo || '';
    position.value = employeeData.position || '';
    joinDate.value = employeeData.joinDate || '';
    employeeCompany.value = employeeData.companyId || selectedCompanyId;
    
    // Set leave values (these will be read-only display values)
    annualLeave.value = employeeData.annualLeave ? `${employeeData.annualLeave} days` : '';
    medicalLeave.value = employeeData.medicalLeave ? `${employeeData.medicalLeave} days` : '';
    hospitalizationLeave.value = '60 days';
    
    // Update years of service and leave entitlements based on join date
    if (employeeData.joinDate) {
        const yearsRange = calculateYearsOfService(employeeData.joinDate);
        yearsOfService.value = formatYearsOfServiceDisplay(yearsRange);
        yearsOfService.dataset.range = yearsRange;
        
        // Calculate leave entitlements with join date for accurate calculation
        if (employeeData.position) {
            const entitlements = calculateLeaveEntitlements(employeeData.position, yearsRange, employeeData.joinDate);
            annualLeave.value = `${entitlements.annualLeave} days`;
            medicalLeave.value = `${entitlements.medicalLeave} days`;
            hospitalizationLeave.value = `${entitlements.hospitalizationLeave} days`;
        }
    } else {
        yearsOfService.value = '';
        yearsOfService.dataset.range = '';
    }
}

// Save employee form submission
employeeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Extract numeric values from the readonly fields
    const annualLeaveValue = parseInt(annualLeave.value.replace(' days', ''));
    const medicalLeaveValue = parseInt(medicalLeave.value.replace(' days', ''));
    const yearsRange = yearsOfService.dataset.range;
    
    // Recalculate leave entitlements to ensure accuracy
    const entitlements = calculateLeaveEntitlements(position.value, yearsRange, joinDate.value);
    
    const formData = {
        name: employeeName.value.trim(),
        empNo: employeeNo.value.trim(),
        position: position.value,
        joinDate: joinDate.value,
        yearsOfService: yearsRange,
        annualLeave: entitlements.annualLeave,
        medicalLeave: entitlements.medicalLeave,
        hospitalizationLeave: entitlements.hospitalizationLeave
    };
    
    // Validation
    if (!formData.name || !formData.empNo || !formData.position || !formData.joinDate) {
        showAlert('Please fill in all required fields.');
        return;
    }
    
    if (isNaN(formData.annualLeave) || isNaN(formData.medicalLeave)) {
        showAlert('Please select position and join date to calculate leave entitlements.');
        return;
    }
    
    // Check employee number uniqueness
    const isEmpNoUnique = await validateEmployeeNumber(formData.empNo, selectedCompanyId, editingEmployeeId);
    if (!isEmpNoUnique) {
        showAlert('Employee number already exists in this company. Please use a different number.');
        return;
    }
    
    setLoading(saveEmployeeBtn, true, saveEmployeeSpinner);
    
    const isEdit = !!editingEmployeeId;
    const success = await saveEmployee(formData, isEdit);
    
    if (success) {
        employeeModal.hide();
        employeeForm.reset();
        yearsOfService.value = '';
        yearsOfService.dataset.range = '';
        hospitalizationLeave.value = '60 days';
        editingEmployeeId = null;
    }
    
    setLoading(saveEmployeeBtn, false, saveEmployeeSpinner);
});

// Global functions for employee table actions
window.editEmployee = async function(employeeId) {
    if (!selectedCompanyId) {
        showAlert('Please select a company first.');
        return;
    }
    
    try {
        const employeeRef = window.firebaseRef(window.firebaseDatabase, `employees/${selectedCompanyId}/${employeeId}`);
        const snapshot = await window.firebaseGet(employeeRef);
        
        if (snapshot.exists()) {
            const employeeData = snapshot.val();
            openEmployeeModal(employeeData, employeeId);
        } else {
            showAlert('Employee not found.');
        }
    } catch (error) {
        console.error('Error loading employee data:', error);
        showAlert('Failed to load employee data.');
    }
};

window.deleteEmployee = async function(employeeId, employeeName) {
    if (!selectedCompanyId) {
        showAlert('Please select a company first.');
        return;
    }
    
    if (confirm(`Are you sure you want to delete employee: ${employeeName}?\n\nThis action cannot be undone.`)) {
        try {
            const employeeRef = window.firebaseRef(window.firebaseDatabase, `employees/${selectedCompanyId}/${employeeId}`);
            await window.firebaseSet(employeeRef, null); // Delete by setting to null
            
            showAlert(`Employee ${employeeName} deleted successfully.`, 'success');
            
            // Reload employees
            await loadEmployees(selectedCompanyId);
        } catch (error) {
            console.error('Error deleting employee:', error);
            showAlert('Failed to delete employee. Please try again.');
        }
    }
};

// Logout functionality
logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    
    try {
        await window.signOut(window.firebaseAuth);
        sessionStorage.clear();
        localStorage.removeItem('rememberEmail');
        showAlert('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (error) {
        console.error('Logout error:', error);
        showAlert('Error logging out. Please try again.');
    }
});

// Leave Balance Calculation Functions

// Calculate leave balance for an employee
async function calculateEmployeeLeaveBalance(employeeId, employeeData) {
    try {
        const currentYear = new Date().getFullYear();
        let usedAnnual = 0;
        let usedMedical = 0;
        
        // Get leave records for this employee
        const leavesRef = window.firebaseRef(window.firebaseDatabase, `leaves/${selectedCompanyId}/${employeeId}`);
        const snapshot = await window.firebaseGet(leavesRef);
        
        if (snapshot.exists()) {
            const leaves = snapshot.val();
            
            Object.values(leaves).forEach(leave => {
                const leaveYear = new Date(leave.startDate).getFullYear();
                
                // Only count current year approved leaves
                if (leaveYear === currentYear && leave.status === 'approved') {
                    switch (leave.type) {
                        case 'annual':
                            usedAnnual += leave.duration;
                            break;
                        case 'medical':
                        case 'hospitalization':
                            usedMedical += leave.duration;
                            break;
                    }
                }
            });
        }
        
        // Calculate remaining balances
        const annualBalance = Math.max(0, employeeData.annualLeave - usedAnnual);
        const medicalBalance = Math.max(0, (employeeData.medicalLeave + (employeeData.hospitalizationLeave || 60)) - usedMedical);
        
        return {
            annual: {
                total: employeeData.annualLeave,
                used: usedAnnual,
                remaining: annualBalance
            },
            medical: {
                total: employeeData.medicalLeave + (employeeData.hospitalizationLeave || 60),
                used: usedMedical,
                remaining: medicalBalance
            }
        };
    } catch (error) {
        console.error('Error calculating leave balance:', error);
        return {
            annual: { total: employeeData.annualLeave, used: 0, remaining: employeeData.annualLeave },
            medical: { total: employeeData.medicalLeave + (employeeData.hospitalizationLeave || 60), used: 0, remaining: employeeData.medicalLeave + (employeeData.hospitalizationLeave || 60) }
        };
    }
}

// Format leave balance for display
function formatLeaveBalance(balance) {
    return `
        <div class="d-flex flex-column">
            <small class="text-muted">Annual: <span class="badge bg-primary">${balance.annual.remaining}/${balance.annual.total}</span></small>
            <small class="text-muted">Medical: <span class="badge bg-info">${balance.medical.remaining}/${balance.medical.total}</span></small>
        </div>
    `;
}

// Employee Details Functions

// Open employee details modal
async function openEmployeeDetails(employeeId) {
    if (!selectedCompanyId) {
        showAlert('Please select a company first.');
        return;
    }
    
    try {
        const employeeRef = window.firebaseRef(window.firebaseDatabase, `employees/${selectedCompanyId}/${employeeId}`);
        const snapshot = await window.firebaseGet(employeeRef);
        
        if (snapshot.exists()) {
            currentEmployeeId = employeeId;
            currentEmployeeData = snapshot.val();
            populateEmployeeDetails(currentEmployeeData);
            await loadLeaveHistory(employeeId);
            
            // Reset leave form
            recordLeaveForm.reset();
            leaveDuration.textContent = 'Select dates to calculate duration';
            balanceCheck.style.display = 'none';
            
            employeeDetailsModal.show();
        } else {
            showAlert('Employee not found.');
        }
    } catch (error) {
        console.error('Error loading employee details:', error);
        showAlert('Failed to load employee details.');
    }
}

// Populate employee details in the modal
function populateEmployeeDetails(employeeData) {
    employeeDetailsName.textContent = employeeData.name;
    detailEmpNo.textContent = employeeData.empNo;
    detailPosition.textContent = employeeData.position;
    
    // Format join date
    const joinDateDisplay = employeeData.joinDate ? 
        new Date(employeeData.joinDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric'
        }) : 'Not specified';
    detailJoinDate.textContent = joinDateDisplay;
    
    // Format years of service
    detailYearsOfService.textContent = formatYearsOfServiceDisplay(employeeData.yearsOfService);
    
    // Set leave entitlements
    detailAnnualLeave.textContent = `${employeeData.annualLeave} days`;
    detailMedicalLeave.textContent = `${employeeData.medicalLeave} days`;
    detailHospitalizationLeave.textContent = `${employeeData.hospitalizationLeave || 60} days`;
    
    // Apply special styling for current/last year employees
    if (employeeData.yearsOfService === 'current-year') {
        detailAnnualLeave.className = 'badge bg-secondary';
    } else if (employeeData.yearsOfService === 'last-year') {
        detailAnnualLeave.className = 'badge bg-success';
    } else {
        detailAnnualLeave.className = 'badge bg-primary';
    }
}

// Calculate leave duration and update balance display
async function calculateLeaveDuration() {
    const startDate = new Date(leaveStartDate.value);
    const endDate = new Date(leaveEndDate.value);
    
    if (leaveStartDate.value && leaveEndDate.value) {
        if (endDate >= startDate) {
            const timeDiff = endDate.getTime() - startDate.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
            leaveDuration.textContent = `${daysDiff} day${daysDiff === 1 ? '' : 's'}`;
            
            // Update balance display if leave type is selected
            await updateBalanceDisplay(daysDiff);
            
            return daysDiff;
        } else {
            leaveDuration.textContent = 'End date must be after start date';
            balanceCheck.style.display = 'none';
            return 0;
        }
    } else {
        leaveDuration.textContent = 'Select dates to calculate duration';
        balanceCheck.style.display = 'none';
        return 0;
    }
}

// Update balance display based on leave type and duration
async function updateBalanceDisplay(requestedDays) {
    if (!leaveType.value || !requestedDays || !currentEmployeeData) {
        balanceCheck.style.display = 'none';
        return;
    }
    
    try {
        const currentBalance = await calculateEmployeeLeaveBalance(currentEmployeeId, currentEmployeeData);
        
        let relevantBalance, balanceType, afterBalance;
        
        switch (leaveType.value) {
            case 'annual':
                relevantBalance = currentBalance.annual.remaining;
                balanceType = 'Annual Leave';
                afterBalance = Math.max(0, relevantBalance - requestedDays);
                break;
            case 'medical':
            case 'hospitalization':
                relevantBalance = currentBalance.medical.remaining;
                balanceType = 'Medical Leave';
                afterBalance = Math.max(0, relevantBalance - requestedDays);
                break;
            case 'emergency':
                // Emergency leave might not deduct from balance
                balanceCheck.style.display = 'none';
                return;
            default:
                balanceCheck.style.display = 'none';
                return;
        }
        
        // Update display
        currentBalanceDisplay.innerHTML = `<span class="text-info">${relevantBalance} days</span><br><small>${balanceType}</small>`;
        
        if (requestedDays > relevantBalance) {
            afterBalanceDisplay.innerHTML = `<span class="text-danger">${afterBalance} days</span><br><small class="text-danger">Insufficient!</small>`;
        } else {
            afterBalanceDisplay.innerHTML = `<span class="text-success">${afterBalance} days</span><br><small class="text-muted">Remaining</small>`;
        }
        
        balanceCheck.style.display = 'block';
        
    } catch (error) {
        console.error('Error updating balance display:', error);
        balanceCheck.style.display = 'none';
    }
}

// Record leave
async function recordLeave(leaveData) {
    try {
        const leaveId = 'leave_' + Date.now();
        const leaveRef = window.firebaseRef(window.firebaseDatabase, `leaves/${selectedCompanyId}/${currentEmployeeId}/${leaveId}`);
        
        const leaveRecord = {
            ...leaveData,
            employeeId: currentEmployeeId,
            companyId: selectedCompanyId,
            status: 'approved', // Auto-approve for now
            createdAt: new Date().toISOString(),
            createdBy: currentUser.uid
        };
        
        await window.firebaseSet(leaveRef, leaveRecord);
        showAlert(`Leave recorded successfully! ${leaveData.duration} day${leaveData.duration === 1 ? '' : 's'} of ${leaveData.type} leave has been deducted from balance.`, 'success');
        
        // Refresh leave history and summary
        await loadLeaveHistory(currentEmployeeId);
        
        return true;
    } catch (error) {
        console.error('Error recording leave:', error);
        showAlert('Failed to record leave. Please try again.');
        return false;
    }
}

// Load leave history for employee
async function loadLeaveHistory(employeeId) {
    try {
        const leavesRef = window.firebaseRef(window.firebaseDatabase, `leaves/${selectedCompanyId}/${employeeId}`);
        const snapshot = await window.firebaseGet(leavesRef);
        
        if (snapshot.exists()) {
            const leaves = snapshot.val();
            displayLeaveHistory(leaves);
            calculateLeaveSummary(leaves);
        } else {
            leaveHistoryTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No leave records found</td></tr>';
            resetLeaveSummary();
        }
    } catch (error) {
        console.error('Error loading leave history:', error);
        showAlert('Failed to load leave history.');
        leaveHistoryTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading leave history</td></tr>';
    }
}

// Display leave history in table
function displayLeaveHistory(leaves) {
    const leaveEntries = Object.entries(leaves || {});
    
    if (leaveEntries.length === 0) {
        leaveHistoryTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No leave records found</td></tr>';
        return;
    }
    
    // Sort by start date (newest first)
    leaveEntries.sort(([,a], [,b]) => new Date(b.startDate) - new Date(a.startDate));
    
    const tableRows = leaveEntries.map(([leaveId, leaveData]) => {
        const startDate = new Date(leaveData.startDate).toLocaleDateString('en-GB');
        const endDate = new Date(leaveData.endDate).toLocaleDateString('en-GB');
        
        // Format leave type
        const leaveTypeDisplay = leaveData.type.charAt(0).toUpperCase() + leaveData.type.slice(1);
        
        // Status badge
        const statusBadge = getStatusBadge(leaveData.status);
        
        return `
            <tr>
                <td><span class="badge bg-secondary">${leaveTypeDisplay}</span></td>
                <td>${startDate}</td>
                <td>${endDate}</td>
                <td><strong>${leaveData.duration} day${leaveData.duration === 1 ? '' : 's'}</strong></td>
                <td>${leaveData.reason}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-outline-danger btn-sm" onclick="deleteLeaveRecord('${leaveId}')" title="Delete Record">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    leaveHistoryTableBody.innerHTML = tableRows;
}

// Get status badge HTML
function getStatusBadge(status) {
    switch (status) {
        case 'approved':
            return '<span class="badge bg-success">Approved</span>';
        case 'pending':
            return '<span class="badge bg-warning">Pending</span>';
        case 'rejected':
            return '<span class="badge bg-danger">Rejected</span>';
        default:
            return '<span class="badge bg-secondary">Unknown</span>';
    }
}

// Calculate leave summary
function calculateLeaveSummary(leaves) {
    const currentYear = new Date().getFullYear();
    let usedAnnual = 0;
    let usedMedical = 0;
    
    Object.values(leaves || {}).forEach(leave => {
        const leaveYear = new Date(leave.startDate).getFullYear();
        
        // Only count current year leaves
        if (leaveYear === currentYear && leave.status === 'approved') {
            switch (leave.type) {
                case 'annual':
                    usedAnnual += leave.duration;
                    break;
                case 'medical':
                case 'hospitalization':
                    usedMedical += leave.duration;
                    break;
            }
        }
    });
    
    // Update summary display
    usedAnnualLeave.textContent = usedAnnual;
    remainingAnnualLeave.textContent = Math.max(0, currentEmployeeData.annualLeave - usedAnnual);
    usedMedicalLeave.textContent = usedMedical;
    remainingMedicalLeave.textContent = Math.max(0, currentEmployeeData.medicalLeave + (currentEmployeeData.hospitalizationLeave || 60) - usedMedical);
}

// Reset leave summary
function resetLeaveSummary() {
    usedAnnualLeave.textContent = '0';
    remainingAnnualLeave.textContent = currentEmployeeData?.annualLeave || '0';
    usedMedicalLeave.textContent = '0';
    remainingMedicalLeave.textContent = (currentEmployeeData?.medicalLeave || 0) + (currentEmployeeData?.hospitalizationLeave || 60);
}

// Generate PDF report
async function generatePDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Set font
        doc.setFont('helvetica');
        
        // Add header
        doc.setFontSize(20);
        doc.setTextColor(40, 116, 166);
        doc.text('Employee Leave Report', 20, 25);
        
        // Add employee info
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Employee: ${currentEmployeeData.name}`, 20, 45);
        doc.text(`Employee No: ${currentEmployeeData.empNo}`, 20, 55);
        doc.text(`Position: ${currentEmployeeData.position}`, 20, 65);
        doc.text(`Join Date: ${new Date(currentEmployeeData.joinDate).toLocaleDateString('en-GB')}`, 20, 75);
        
        // Add leave entitlements
        doc.setFontSize(14);
        doc.setTextColor(40, 116, 166);
        doc.text('Leave Entitlements', 20, 95);
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Annual Leave: ${currentEmployeeData.annualLeave} days`, 20, 110);
        doc.text(`Medical Leave: ${currentEmployeeData.medicalLeave} days`, 20, 120);
        doc.text(`Hospitalization Leave: ${currentEmployeeData.hospitalizationLeave || 60} days`, 20, 130);
        
        // Add summary
        doc.setFontSize(14);
        doc.setTextColor(40, 116, 166);
        doc.text('Leave Summary (Current Year)', 20, 150);
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Annual Leave Used: ${usedAnnualLeave.textContent} days`, 20, 165);
        doc.text(`Annual Leave Remaining: ${remainingAnnualLeave.textContent} days`, 20, 175);
        doc.text(`Medical Leave Used: ${usedMedicalLeave.textContent} days`, 20, 185);
        doc.text(`Medical Leave Remaining: ${remainingMedicalLeave.textContent} days`, 20, 195);
        
        // Add leave history table
        doc.setFontSize(14);
        doc.setTextColor(40, 116, 166);
        doc.text('Leave History', 20, 215);
        
        // Get leave history data
        const leavesRef = window.firebaseRef(window.firebaseDatabase, `leaves/${selectedCompanyId}/${currentEmployeeId}`);
        const snapshot = await window.firebaseGet(leavesRef);
        
        if (snapshot.exists()) {
            const leaves = snapshot.val();
            const leaveEntries = Object.entries(leaves);
            leaveEntries.sort(([,a], [,b]) => new Date(b.startDate) - new Date(a.startDate));
            
            let yPos = 230;
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            
            // Table headers
            doc.text('Type', 20, yPos);
            doc.text('Start Date', 60, yPos);
            doc.text('End Date', 100, yPos);
            doc.text('Duration', 140, yPos);
            doc.text('Status', 170, yPos);
            
            yPos += 10;
            
            // Table data
            leaveEntries.forEach(([, leaveData]) => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                
                doc.text(leaveData.type.charAt(0).toUpperCase() + leaveData.type.slice(1), 20, yPos);
                doc.text(new Date(leaveData.startDate).toLocaleDateString('en-GB'), 60, yPos);
                doc.text(new Date(leaveData.endDate).toLocaleDateString('en-GB'), 100, yPos);
                doc.text(`${leaveData.duration} day${leaveData.duration === 1 ? '' : 's'}`, 140, yPos);
                doc.text(leaveData.status, 170, yPos);
                
                yPos += 8;
            });
        }
        
        // Add footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(`Generated on ${new Date().toLocaleDateString('en-GB')} | Page ${i} of ${pageCount}`, 20, 285);
        }
        
        // Save the PDF
        doc.save(`${currentEmployeeData.name}_Leave_Report.pdf`);
        showAlert('PDF downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        showAlert('Failed to generate PDF. Please try again.');
    }
}

// Delete leave record
async function deleteLeaveRecord(leaveId) {
    if (confirm('Are you sure you want to delete this leave record?')) {
        try {
            const leaveRef = window.firebaseRef(window.firebaseDatabase, `leaves/${selectedCompanyId}/${currentEmployeeId}/${leaveId}`);
            await window.firebaseSet(leaveRef, null);
            
            showAlert('Leave record deleted successfully! Leave balance has been restored.', 'success');
            
            // Refresh leave history and employee details
            await loadLeaveHistory(currentEmployeeId);
            
            // Refresh the main employee table to update leave balance
            if (selectedCompanyId) {
                await loadEmployees(selectedCompanyId);
            }
            
        } catch (error) {
            console.error('Error deleting leave record:', error);
            showAlert('Failed to delete leave record.');
        }
    }
}

// Event Listeners for Employee Details Modal

// Calculate duration when dates change
leaveStartDate.addEventListener('change', calculateLeaveDuration);
leaveEndDate.addEventListener('change', calculateLeaveDuration);
leaveType.addEventListener('change', async () => {
    const duration = await calculateLeaveDuration();
    // updateBalanceDisplay is already called within calculateLeaveDuration
});

// Record leave form submission
recordLeaveForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const duration = await calculateLeaveDuration();
    if (duration <= 0) {
        showAlert('Please select valid dates.');
        return;
    }
    
    const leaveData = {
        type: leaveType.value,
        startDate: leaveStartDate.value,
        endDate: leaveEndDate.value,
        duration: duration,
        reason: leaveReason.value.trim()
    };
    
    // Validation
    if (!leaveData.type || !leaveData.startDate || !leaveData.endDate || !leaveData.reason) {
        showAlert('Please fill in all required fields.');
        return;
    }
    
    // Check leave balance before recording
    const currentBalance = await calculateEmployeeLeaveBalance(currentEmployeeId, currentEmployeeData);
    
    let hasEnoughBalance = false;
    let balanceMessage = '';
    
    switch (leaveData.type) {
        case 'annual':
            hasEnoughBalance = duration <= currentBalance.annual.remaining;
            balanceMessage = `You have ${currentBalance.annual.remaining} days remaining of annual leave. Cannot approve ${duration} days.`;
            break;
        case 'medical':
        case 'hospitalization':
            hasEnoughBalance = duration <= currentBalance.medical.remaining;
            balanceMessage = `You have ${currentBalance.medical.remaining} days remaining of medical leave (including hospitalization). Cannot approve ${duration} days.`;
            break;
        case 'emergency':
            hasEnoughBalance = true; // Emergency leave might not be restricted by balance
            break;
        default:
            hasEnoughBalance = true;
    }
    
    if (!hasEnoughBalance) {
        showAlert(balanceMessage, 'warning');
        return;
    }
    
    const success = await recordLeave(leaveData);
    if (success) {
        recordLeaveForm.reset();
        leaveDuration.textContent = 'Select dates to calculate duration';
        balanceCheck.style.display = 'none';
        
        // Refresh the main employee table to update leave balance
        if (selectedCompanyId) {
            await loadEmployees(selectedCompanyId);
        }
    }
});

// Refresh leave history
refreshLeaveHistoryBtn.addEventListener('click', () => {
    if (currentEmployeeId) {
        loadLeaveHistory(currentEmployeeId);
    }
});

// Download PDF
downloadPdfBtn.addEventListener('click', generatePDF);

// Global functions
window.openEmployeeDetails = openEmployeeDetails;
window.deleteLeaveRecord = deleteLeaveRecord;

// Listen for auth state changes
window.onAuthStateChanged(window.firebaseAuth, (user) => {
    if (!user) {
        // User is signed out
        window.location.href = 'index.html';
    }
}); 