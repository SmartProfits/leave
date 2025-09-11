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
const detailCompany = document.getElementById('detailCompany');
const detailCreatedAt = document.getElementById('detailCreatedAt');
const detailUpdatedAt = document.getElementById('detailUpdatedAt');

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

// Half day leave elements
const halfDayOption = document.getElementById('halfDayOption');
const halfDayCheckbox = document.getElementById('halfDayCheckbox');
const halfDayTimeSelection = document.getElementById('halfDayTimeSelection');
const halfDayMorning = document.getElementById('halfDayMorning');
const halfDayAfternoon = document.getElementById('halfDayAfternoon');

// Leave history elements
const leaveHistoryTableBody = document.getElementById('leaveHistoryTableBody');
const refreshLeaveHistoryBtn = document.getElementById('refreshLeaveHistoryBtn');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');

// Public holidays elements
const holidaysContainer = document.getElementById('holidaysContainer');
const refreshHolidaysBtn = document.getElementById('refreshHolidaysBtn');
const toggleHolidaysBtn = document.getElementById('toggleHolidaysBtn');
const holidaysToggleIcon = document.getElementById('holidaysToggleIcon');
const holidaysToggleText = document.getElementById('holidaysToggleText');
const holidaysCollapse = document.getElementById('holidaysCollapse');

// Leave summary elements
const usedAnnualLeave = document.getElementById('usedAnnualLeave');
const remainingAnnualLeave = document.getElementById('remainingAnnualLeave');
const usedMedicalLeave = document.getElementById('usedMedicalLeave');
const remainingMedicalLeave = document.getElementById('remainingMedicalLeave');
const usedHospitalizationLeave = document.getElementById('usedHospitalizationLeave');
const usedUnpaidLeave = document.getElementById('usedUnpaidLeave');
const usedCompassionateLeave = document.getElementById('usedCompassionateLeave');
const usedPaternityLeave = document.getElementById('usedPaternityLeave');
const usedMaternityLeave = document.getElementById('usedMaternityLeave');
const usedEmergencyLeave = document.getElementById('usedEmergencyLeave');

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
    const rawProportionalLeave = (daysWorked / totalDaysInYear) * fullYearLeave;
    
    // Apply custom rounding rules for decimal places
    const proportionalLeave = applyCustomRounding(rawProportionalLeave);
    
    return proportionalLeave;
}

// Apply custom rounding rules for leave calculation
function applyCustomRounding(value) {
    const integerPart = Math.floor(value);
    const decimalPart = value - integerPart;
    
    // Custom rounding rules:
    // 0.0-0.29 = 0 (no additional days)
    // 0.3-0.79 = 0.5 (half day)
    // 0.8-0.99 = 1 (full day)
    
    if (decimalPart >= 0.0 && decimalPart < 0.3) {
        return integerPart; // No additional days
    } else if (decimalPart >= 0.3 && decimalPart < 0.8) {
        return integerPart + 0.5; // Half day
    } else if (decimalPart >= 0.8) {
        return integerPart + 1; // Full day
    }
    
    return integerPart; // Fallback
}

// Test function to verify custom rounding works correctly
function testCustomRounding() {
    console.log('Testing custom rounding rules:');
    console.log('7.03 ->', applyCustomRounding(7.03)); // Should be 7
    console.log('8.35 ->', applyCustomRounding(8.35)); // Should be 8.5
    console.log('7.88 ->', applyCustomRounding(7.88)); // Should be 8
    console.log('6.25 ->', applyCustomRounding(6.25)); // Should be 6
    console.log('9.45 ->', applyCustomRounding(9.45)); // Should be 9.5
    console.log('5.85 ->', applyCustomRounding(5.85)); // Should be 6
}

// Test function to verify Saturday detection works correctly
function testSaturdayDetection() {
    console.log('Testing Saturday detection:');
    console.log('2024-01-01 to 2024-01-07 (includes Saturday):', hasSaturdayInRange('2024-01-01', '2024-01-07')); // Should be true
    console.log('2024-01-01 to 2024-01-05 (no Saturday):', hasSaturdayInRange('2024-01-01', '2024-01-05')); // Should be false
    console.log('2024-01-06 to 2024-01-06 (just Saturday):', hasSaturdayInRange('2024-01-06', '2024-01-06')); // Should be true
    console.log('2024-01-08 to 2024-01-12 (no Saturday):', hasSaturdayInRange('2024-01-08', '2024-01-12')); // Should be false
}

// Test function to verify working days calculation (now async)
async function testWorkingDaysCalculation() {
    console.log('Testing working days calculation with public holidays:');
    
    // Test Annual Leave
    console.log('=== Annual Leave Tests ===');
    console.log('Mon-Fri (5 days, no Saturday):', await calculateLeaveDurationWithSaturday('2024-01-01', '2024-01-05', 'annual', 'no')); // Should exclude public holidays
    console.log('Mon-Sat (6 days, Saturday not working):', await calculateLeaveDurationWithSaturday('2024-01-01', '2024-01-06', 'annual', 'no')); // Should exclude public holidays
    console.log('Mon-Sat (6 days, Saturday working):', await calculateLeaveDurationWithSaturday('2024-01-01', '2024-01-06', 'annual', 'yes')); // Should exclude public holidays
    
    // Test Medical Leave
    console.log('=== Medical Leave Tests ===');
    console.log('Mon-Fri (5 days, no Saturday):', await calculateLeaveDurationWithSaturday('2024-01-01', '2024-01-05', 'medical', 'no')); // Should exclude public holidays
    console.log('Mon-Sat (6 days, Saturday not working):', await calculateLeaveDurationWithSaturday('2024-01-01', '2024-01-06', 'medical', 'no')); // Should exclude public holidays
    console.log('Mon-Sat (6 days, Saturday working):', await calculateLeaveDurationWithSaturday('2024-01-01', '2024-01-06', 'medical', 'yes')); // Should exclude public holidays
    
    // Test Emergency Leave
    console.log('=== Emergency Leave Tests ===');
    console.log('Fri-Sun (3 days, Saturday not working):', await calculateLeaveDurationWithSaturday('2024-01-05', '2024-01-07', 'emergency', 'no')); // Should exclude public holidays
    console.log('Fri-Sun (3 days, Saturday working):', await calculateLeaveDurationWithSaturday('2024-01-05', '2024-01-07', 'emergency', 'yes')); // Should exclude public holidays
    
    // Test Compassionate Leave
    console.log('=== Compassionate Leave Tests ===');
    console.log('Just Saturday (not working):', await calculateLeaveDurationWithSaturday('2024-01-06', '2024-01-06', 'compassionate', 'no')); // Should exclude public holidays
    console.log('Just Saturday (working):', await calculateLeaveDurationWithSaturday('2024-01-06', '2024-01-06', 'compassionate', 'yes')); // Should exclude public holidays
    
    // Test Unpaid Leave
    console.log('=== Unpaid Leave Tests ===');
    console.log('Mon-Sat (6 days, Saturday not working):', await calculateLeaveDurationWithSaturday('2024-01-01', '2024-01-06', 'unpaid', 'no')); // Should exclude public holidays
    console.log('Mon-Sat (6 days, Saturday working):', await calculateLeaveDurationWithSaturday('2024-01-01', '2024-01-06', 'unpaid', 'yes')); // Should exclude public holidays
}

// Test function to verify simple day count calculation for Maternity Leave (now async)
async function testMaternityLeaveCalculation() {
    console.log('Testing Maternity Leave calculation (Simple Day Count - includes public holidays):');
    
    // Test Maternity Leave
    console.log('=== Maternity Leave Tests (Simple Day Count) ===');
    console.log('Mon-Sat (6 days):', await calculateLeaveDurationWithSaturday('2024-01-01', '2024-01-06', 'maternity', 'no')); // Should include public holidays
    console.log('Fri-Sun (3 days):', await calculateLeaveDurationWithSaturday('2024-01-05', '2024-01-07', 'maternity', 'yes')); // Should include public holidays
    console.log('Just Saturday (1 day):', await calculateLeaveDurationWithSaturday('2024-01-06', '2024-01-06', 'maternity', 'no')); // Should include public holidays
}

// Test function to verify paternity leave employment status calculation
function testPaternityLeaveCalculation() {
    console.log('Testing Paternity Leave calculation based on employment status:');
    
    // Test Paternity Leave - Probation Staff
    console.log('=== Paternity Leave - Probation Staff (2 days) ===');
    console.log('Probation staff paternity leave:', 2); // Fixed 2 days
    
    // Test Paternity Leave - Confirmed Staff
    console.log('=== Paternity Leave - Confirmed Staff (7 days) ===');
    console.log('Confirmed staff paternity leave:', 7); // Fixed 7 days
}

// Test function for paternity leave date validation
function testPaternityLeaveDateValidation() {
    console.log('=== Testing Paternity Leave Date Validation ===');
    
    // Test cases for probation staff (2 days max)
    console.log('Testing Probation Staff (2 days max):');
    console.log('Valid: 1 day (today to today)');
    console.log('Valid: 2 days (today to tomorrow)');
    console.log('Invalid: 3+ days (exceeds limit)');
    
    // Test cases for confirmed staff (7 days max)
    console.log('\nTesting Confirmed Staff (7 days max):');
    console.log('Valid: 1-7 days');
    console.log('Invalid: 8+ days (exceeds limit)');
    
    console.log('Paternity leave date validation test completed!');
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
        annualLeave.value = `${entitlements.annualLeave} day${entitlements.annualLeave === 1 ? '' : 's'}`;
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
            employeesTableBody.innerHTML = '<tr><td colspan="10" class="text-center">No employees found for this company</td></tr>';
            updateStats({});
        }
    } catch (error) {
        console.error('Error loading employees:', error);
        showAlert('Failed to load employees.');
        employeesTableBody.innerHTML = '<tr><td colspan="10" class="text-center text-danger">Error loading employees</td></tr>';
    }
}

// Display employees in table
async function displayEmployees(employees) {
    const employeeEntries = Object.entries(employees || {});
    
    if (employeeEntries.length === 0) {
        employeesTableBody.innerHTML = '<tr><td colspan="10" class="text-center">No employees found</td></tr>';
        return;
    }
    
    // Sort employees by Employee Number
    employeeEntries.sort(([,a], [,b]) => {
        const empNoA = a.empNo || '';
        const empNoB = b.empNo || '';
        
        // Extract numeric part for comparison
        const numA = parseInt(empNoA.replace(/\D/g, '')) || 0;
        const numB = parseInt(empNoB.replace(/\D/g, '')) || 0;
        
        // If numeric parts are equal, compare the full string
        if (numA === numB) {
            return empNoA.localeCompare(empNoB);
        }
        
        return numA - numB;
    });
    
    // Show loading while calculating balances
    employeesTableBody.innerHTML = '<tr><td colspan="10" class="text-center">Calculating leave balances...</td></tr>';
    
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
        const annualLeaveText = `${employeeData.annualLeave} day${employeeData.annualLeave === 1 ? '' : 's'}`;
        if (isCurrentYearEmployee) {
            annualLeaveBadge = `<span class="badge bg-secondary">${annualLeaveText}</span>`;
        } else if (isLastYearEmployee) {
            annualLeaveBadge = `<span class="badge bg-success">${annualLeaveText}</span>`;
        } else {
            annualLeaveBadge = `<span class="badge bg-primary">${annualLeaveText}</span>`;
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
                <td><span class="badge bg-success">${employeeData.hospitalizationLeave || 60} days</span></td>
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
    
    // Load user companies and public holidays
    loadUserCompanies();
    loadPublicHolidays();
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

// Refresh public holidays
refreshHolidaysBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loadPublicHolidays();
});

// Toggle holidays visibility
toggleHolidaysBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // The collapse functionality is handled by Bootstrap
    // We just need to update the icon and text
    const isCollapsed = holidaysCollapse.classList.contains('show');
    if (isCollapsed) {
        holidaysToggleIcon.className = 'bi bi-chevron-up me-1';
        holidaysToggleText.textContent = 'Hide';
    } else {
        holidaysToggleIcon.className = 'bi bi-chevron-down me-1';
        holidaysToggleText.textContent = 'Show';
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
    annualLeave.value = employeeData.annualLeave ? `${employeeData.annualLeave} day${employeeData.annualLeave === 1 ? '' : 's'}` : '';
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
            annualLeave.value = `${entitlements.annualLeave} day${entitlements.annualLeave === 1 ? '' : 's'}`;
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
    const annualLeaveValue = parseFloat(annualLeave.value.replace(/ days?$/, ''));
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
        let usedHospitalization = 0;
        let usedUnpaid = 0;
        let usedCompassionate = 0;
        let usedPaternity = 0;
        let usedMaternity = 0;
        let usedEmergency = 0;
        
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
                            usedMedical += leave.duration;
                            break;
                        case 'hospitalization':
                            usedHospitalization += leave.duration;
                            break;
                        case 'unpaid':
                            usedUnpaid += leave.duration;
                            break;
                        case 'compassionate':
                            usedCompassionate += leave.duration;
                            break;
                        case 'paternity':
                            usedPaternity += leave.duration;
                            break;
                        case 'maternity':
                            usedMaternity += leave.duration;
                            break;
                        case 'emergency':
                            usedEmergency += leave.duration;
                            break;
                    }
                }
            });
        }
        
        // Calculate remaining balances
        const annualBalance = Math.max(0, employeeData.annualLeave - usedAnnual);
        const medicalBalance = Math.max(0, employeeData.medicalLeave - usedMedical);
        const hospitalizationBalance = Math.max(0, (employeeData.hospitalizationLeave || 60) - usedHospitalization);
        
        return {
            annual: {
                total: employeeData.annualLeave,
                used: usedAnnual,
                remaining: annualBalance
            },
            medical: {
                total: employeeData.medicalLeave,
                used: usedMedical,
                remaining: medicalBalance
            },
            hospitalization: {
                total: employeeData.hospitalizationLeave || 60,
                used: usedHospitalization,
                remaining: hospitalizationBalance
            },
            unpaid: {
                used: usedUnpaid
            },
            compassionate: {
                used: usedCompassionate
            },
            paternity: {
                used: usedPaternity
            },
            maternity: {
                used: usedMaternity
            },
            emergency: {
                used: usedEmergency
            }
        };
    } catch (error) {
        console.error('Error calculating leave balance:', error);
        return {
            annual: { total: employeeData.annualLeave, used: 0, remaining: employeeData.annualLeave },
            medical: { total: employeeData.medicalLeave, used: 0, remaining: employeeData.medicalLeave },
            hospitalization: { total: employeeData.hospitalizationLeave || 60, used: 0, remaining: employeeData.hospitalizationLeave || 60 },
            unpaid: { used: 0 },
            compassionate: { used: 0 },
            paternity: { used: 0 },
            maternity: { used: 0 },
            emergency: { used: 0 }
        };
    }
}

// Format leave balance for display
function formatLeaveBalance(balance) {
    return `
        <div class="d-flex flex-column">
            <small class="text-muted">Annual: <span class="badge bg-primary">${balance.annual.remaining}/${balance.annual.total}</span></small>
            <small class="text-muted">Medical: <span class="badge bg-info">${balance.medical.remaining}/${balance.medical.total}</span></small>
            <small class="text-muted">Hospitalization: <span class="badge bg-success">${balance.hospitalization.remaining}/${balance.hospitalization.total}</span></small>
            ${balance.unpaid.used > 0 ? `<small class="text-muted">Unpaid: <span class="badge bg-warning">${balance.unpaid.used} day${balance.unpaid.used === 1 ? '' : 's'}</span></small>` : ''}
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
        document.getElementById('saturdayWorkOption').style.display = 'none';
        document.getElementById('paternityEmploymentOption').style.display = 'none';
        halfDayOption.style.display = 'none';
        halfDayTimeSelection.style.display = 'none';
            
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
    
    // Get company name
    const company = currentUserCompanies.find(c => c.id === employeeData.companyId);
    detailCompany.textContent = company ? `${company.name}${company.location ? ' - ' + company.location : ''}` : 'Not specified';
    
    // Format dates
    const createdAt = employeeData.createdAt ? 
        new Date(employeeData.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'Not specified';
    detailCreatedAt.textContent = createdAt;
    
    const updatedAt = employeeData.updatedAt ? 
        new Date(employeeData.updatedAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'Not specified';
    detailUpdatedAt.textContent = updatedAt;
    
    // Set leave entitlements
    detailAnnualLeave.textContent = `${employeeData.annualLeave} day${employeeData.annualLeave === 1 ? '' : 's'}`;
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

// Check if the date range includes Saturday
function hasSaturdayInRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        if (date.getDay() === 6) { // Saturday is 6
            return true;
        }
    }
    return false;
}

// Calculate leave duration considering Saturday work schedule and public holidays
async function calculateLeaveDurationWithSaturday(startDate, endDate, leaveType, saturdayWork = 'no') {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let workingDays = 0;
    
    // Get public holidays to exclude (except for maternity and paternity leave)
    let publicHolidays = [];
    if (leaveType !== 'maternity' && leaveType !== 'paternity') {
        publicHolidays = await getPublicHolidaysInRange(startDate, endDate);
    }
    
    // Count working days (excluding Sundays and public holidays)
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dayOfWeek = date.getDay();
        const dateStr = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        
        // Always exclude Sundays (0)
        if (dayOfWeek === 0) {
            continue;
        }
        
        // Exclude public holidays (except for maternity and paternity leave)
        if (leaveType !== 'maternity' && leaveType !== 'paternity' && publicHolidays.includes(dateStr)) {
            continue;
        }
        
        // For Saturdays (6), check if employee works on Saturday
        if (dayOfWeek === 6) {
            if (saturdayWork === 'yes') {
                workingDays++; // Count Saturday if employee works on Saturday
            }
            // Skip Saturday if employee doesn't work on Saturday
        } else {
            workingDays++; // Count all other weekdays
        }
    }
    
    return workingDays;
}

// Calculate leave duration and update balance display
async function calculateLeaveDuration() {
    const startDate = new Date(leaveStartDate.value);
    const endDate = new Date(leaveEndDate.value);
    
    // Check if half day leave is selected
    const isHalfDay = halfDayCheckbox.checked;
    
    if (leaveStartDate.value && leaveEndDate.value) {
        if (endDate >= startDate) {
            // Show/hide half day option based on leave type and date selection
            if (leaveType.value !== 'maternity' && leaveType.value !== 'paternity' && 
                leaveStartDate.value === leaveEndDate.value) {
                // Show half day option only for single day leaves (except maternity and paternity)
                halfDayOption.style.display = 'block';
            } else {
                halfDayOption.style.display = 'none';
                halfDayCheckbox.checked = false;
                halfDayTimeSelection.style.display = 'none';
            }
            
            // Check if this leave type needs Saturday work option (all except maternity and paternity) and includes Saturday
            if (leaveType.value !== 'maternity' && leaveType.value !== 'paternity' && hasSaturdayInRange(leaveStartDate.value, leaveEndDate.value)) {
                // Show Saturday work option for all leave types except maternity and paternity
                document.getElementById('saturdayWorkOption').style.display = 'block';
                document.getElementById('paternityEmploymentOption').style.display = 'none';
            } else if (leaveType.value === 'paternity') {
                // Show paternity employment status option for paternity leave
                document.getElementById('paternityEmploymentOption').style.display = 'block';
                document.getElementById('saturdayWorkOption').style.display = 'none';
            } else {
                // Hide both options for maternity leave or when no Saturday in range
                document.getElementById('saturdayWorkOption').style.display = 'none';
                document.getElementById('paternityEmploymentOption').style.display = 'none';
            }
            
            // Get Saturday work preference
            const saturdayWorkOption = document.querySelector('input[name="saturdayWork"]:checked');
            const saturdayWork = saturdayWorkOption ? saturdayWorkOption.value : 'no';
            
            // Calculate duration based on leave type and Saturday work schedule
            let daysDiff;
            if (leaveType.value === 'maternity') {
                // For maternity leave, use simple day count (include all days)
                const timeDiff = endDate.getTime() - startDate.getTime();
                daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
            } else if (leaveType.value === 'paternity') {
                // For paternity leave, use fixed days based on employment status
                const paternityEmploymentOption = document.querySelector('input[name="paternityEmployment"]:checked');
                const employmentStatus = paternityEmploymentOption ? paternityEmploymentOption.value : 'confirmed';
                daysDiff = employmentStatus === 'probation' ? 2 : 7;
                
                // Update the duration display to show the fixed days
                leaveDuration.textContent = `${daysDiff} day${daysDiff === 1 ? '' : 's'} (Fixed based on employment status)`;
                
                // Update balance display if leave type is selected
                await updateBalanceDisplay(daysDiff);
                
                return daysDiff;
            } else {
                // For all other leave types, use working days calculation
                daysDiff = await calculateLeaveDurationWithSaturday(leaveStartDate.value, leaveEndDate.value, leaveType.value, saturdayWork);
            }
            
            // Apply half day calculation if selected
            if (isHalfDay && daysDiff === 1) {
                daysDiff = 0.5;
                const halfDayTime = document.querySelector('input[name="halfDayTime"]:checked');
                const timePeriod = halfDayTime ? halfDayTime.value : 'morning';
                const timeText = timePeriod === 'morning' ? 'AM' : 'PM';
                leaveDuration.textContent = `0.5 day (${timeText})`;
            } else {
                leaveDuration.textContent = `${daysDiff} day${daysDiff === 1 ? '' : 's'}`;
            }
            
            // Update balance display if leave type is selected
            await updateBalanceDisplay(daysDiff);
            
            return daysDiff;
        } else {
            leaveDuration.textContent = 'End date must be after start date';
            balanceCheck.style.display = 'none';
            document.getElementById('saturdayWorkOption').style.display = 'none';
            halfDayOption.style.display = 'none';
            return 0;
        }
    } else {
        leaveDuration.textContent = 'Select dates to calculate duration';
        balanceCheck.style.display = 'none';
        document.getElementById('saturdayWorkOption').style.display = 'none';
        halfDayOption.style.display = 'none';
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
                relevantBalance = currentBalance.medical.remaining;
                balanceType = 'Medical Leave (Outpatient)';
                afterBalance = Math.max(0, relevantBalance - requestedDays);
                break;
            case 'hospitalization':
                relevantBalance = currentBalance.hospitalization.remaining;
                balanceType = 'Medical Leave (Hospitalization)';
                afterBalance = Math.max(0, relevantBalance - requestedDays);
                break;
            case 'unpaid':
                // Unpaid leave doesn't affect balance
                currentBalanceDisplay.innerHTML = `<span class="text-info">Unlimited</span><br><small>Unpaid Leave</small>`;
                afterBalanceDisplay.innerHTML = `<span class="text-success">No impact</span><br><small class="text-muted">on balance</small>`;
                balanceCheck.style.display = 'block';
                return;
            case 'compassionate':
                // Compassionate leave doesn't affect regular balance
                currentBalanceDisplay.innerHTML = `<span class="text-info">As needed</span><br><small>Compassionate Leave</small>`;
                afterBalanceDisplay.innerHTML = `<span class="text-success">No impact</span><br><small class="text-muted">on balance</small>`;
                balanceCheck.style.display = 'block';
                return;
            case 'paternity':
                // Paternity leave as per policy
                currentBalanceDisplay.innerHTML = `<span class="text-info">As per policy</span><br><small>Paternity Leave</small>`;
                afterBalanceDisplay.innerHTML = `<span class="text-success">No impact</span><br><small class="text-muted">on balance</small>`;
                balanceCheck.style.display = 'block';
                return;
            case 'maternity':
                // Maternity leave as per policy
                currentBalanceDisplay.innerHTML = `<span class="text-info">As per policy</span><br><small>Maternity Leave</small>`;
                afterBalanceDisplay.innerHTML = `<span class="text-success">No impact</span><br><small class="text-muted">on balance</small>`;
                balanceCheck.style.display = 'block';
                return;
            case 'emergency':
                // Emergency leave doesn't affect balance
                currentBalanceDisplay.innerHTML = `<span class="text-info">As needed</span><br><small>Emergency Leave</small>`;
                afterBalanceDisplay.innerHTML = `<span class="text-success">No impact</span><br><small class="text-muted">on balance</small>`;
                balanceCheck.style.display = 'block';
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
        
        // Calculate how many public holidays were excluded (except for maternity and paternity leave)
        let publicHolidaysExcluded = 0;
        if (leaveData.type !== 'maternity' && leaveData.type !== 'paternity') {
            const publicHolidays = await getPublicHolidaysInRange(leaveData.startDate, leaveData.endDate);
            publicHolidaysExcluded = publicHolidays.length;
        }
        
        const leaveRecord = {
            ...leaveData,
            employeeId: currentEmployeeId,
            companyId: selectedCompanyId,
            status: 'approved', // Auto-approve for now
            createdAt: new Date().toISOString(),
            createdBy: currentUser.uid,
            publicHolidaysExcluded: publicHolidaysExcluded
        };
        
        await window.firebaseSet(leaveRef, leaveRecord);
        
        let successMessage = `Leave recorded successfully! ${leaveData.duration} day${leaveData.duration === 1 ? '' : 's'} of ${leaveData.type} leave has been deducted from balance.`;
        if (publicHolidaysExcluded > 0) {
            successMessage += ` ${publicHolidaysExcluded} public holiday${publicHolidaysExcluded === 1 ? '' : 's'} excluded from calculation.`;
        }
        
        showAlert(successMessage, 'success');
        
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
        
        // Add Saturday work info if available
        const saturdayInfo = leaveData.saturdayWork ? 
            `<br><small class="text-muted"><i class="bi bi-calendar-week me-1"></i>Saturday: ${leaveData.saturdayWork === 'yes' ? 'Working' : 'Non-working'}</small>` : '';
        
        // Add paternity employment status info if available
        const paternityInfo = leaveData.paternityEmployment ? 
            `<br><small class="text-muted"><i class="bi bi-person-badge me-1"></i>Employment: ${leaveData.paternityEmployment === 'probation' ? 'Probation Staff (2 days)' : 'Confirmed Staff (7 days)'}</small>` : '';
        
        // Add working days calculation info for leave types that use working days calculation
        const workingDaysInfo = (leaveData.type !== 'maternity' && leaveData.type !== 'paternity' && leaveData.saturdayWork) ? 
            `<br><small class="text-muted"><i class="bi bi-calculator me-1"></i>Working days calculation applied</small>` : '';
        
        // Add public holidays info if available
        const publicHolidaysInfo = leaveData.publicHolidaysExcluded ? 
            `<br><small class="text-success"><i class="bi bi-calendar-event me-1"></i>Public holidays excluded (${leaveData.publicHolidaysExcluded} day${leaveData.publicHolidaysExcluded === 1 ? '' : 's'})</small>` : '';
        
        // Add half day info if available
        const halfDayInfo = leaveData.isHalfDay && leaveData.halfDayTime ? 
            `<br><small class="text-info"><i class="bi bi-clock-half me-1"></i>Half day (${leaveData.halfDayTime === 'morning' ? 'AM' : 'PM'})</small>` : '';
        
        return `
            <tr>
                <td><span class="badge bg-secondary">${leaveTypeDisplay}</span></td>
                <td>${startDate}</td>
                <td>${endDate}</td>
                <td><strong>${leaveData.duration} day${leaveData.duration === 1 ? '' : 's'}</strong>${saturdayInfo}${paternityInfo}${workingDaysInfo}${publicHolidaysInfo}${halfDayInfo}</td>
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
    let usedHospitalization = 0;
    let usedUnpaid = 0;
    let usedCompassionate = 0;
    let usedPaternity = 0;
    let usedMaternity = 0;
    let usedEmergency = 0;
    
    Object.values(leaves || {}).forEach(leave => {
        const leaveYear = new Date(leave.startDate).getFullYear();
        
        // Only count current year leaves
        if (leaveYear === currentYear && leave.status === 'approved') {
            switch (leave.type) {
                case 'annual':
                    usedAnnual += leave.duration;
                    break;
                case 'medical':
                    usedMedical += leave.duration;
                    break;
                case 'hospitalization':
                    usedHospitalization += leave.duration;
                    break;
                case 'unpaid':
                    usedUnpaid += leave.duration;
                    break;
                case 'compassionate':
                    usedCompassionate += leave.duration;
                    break;
                case 'paternity':
                    usedPaternity += leave.duration;
                    break;
                case 'maternity':
                    usedMaternity += leave.duration;
                    break;
                case 'emergency':
                    usedEmergency += leave.duration;
                    break;
            }
        }
    });
    
    // Update summary display
    usedAnnualLeave.textContent = usedAnnual;
    remainingAnnualLeave.textContent = Math.max(0, currentEmployeeData.annualLeave - usedAnnual);
    usedMedicalLeave.textContent = usedMedical;
    remainingMedicalLeave.textContent = Math.max(0, currentEmployeeData.medicalLeave - usedMedical);
    usedHospitalizationLeave.textContent = usedHospitalization;
    usedUnpaidLeave.textContent = usedUnpaid;
    usedCompassionateLeave.textContent = usedCompassionate;
    usedPaternityLeave.textContent = usedPaternity;
    usedMaternityLeave.textContent = usedMaternity;
    usedEmergencyLeave.textContent = usedEmergency;
}

// Reset leave summary
function resetLeaveSummary() {
    usedAnnualLeave.textContent = '0';
    remainingAnnualLeave.textContent = currentEmployeeData?.annualLeave || '0';
    usedMedicalLeave.textContent = '0';
    remainingMedicalLeave.textContent = currentEmployeeData?.medicalLeave || '0';
    usedHospitalizationLeave.textContent = '0';
    usedUnpaidLeave.textContent = '0';
    usedCompassionateLeave.textContent = '0';
    usedPaternityLeave.textContent = '0';
    usedMaternityLeave.textContent = '0';
    usedEmergencyLeave.textContent = '0';
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
        doc.text(`Annual Leave: ${currentEmployeeData.annualLeave} day${currentEmployeeData.annualLeave === 1 ? '' : 's'}`, 20, 110);
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

// Add real-time validation for paternity leave date selection
leaveStartDate.addEventListener('change', validatePaternityLeaveDates);
leaveEndDate.addEventListener('change', validatePaternityLeaveDates);

// Function to validate paternity leave dates in real-time
function validatePaternityLeaveDates() {
    if (leaveType.value === 'paternity' && leaveStartDate.value && leaveEndDate.value) {
        const paternityEmploymentOption = document.querySelector('input[name="paternityEmployment"]:checked');
        const employmentStatus = paternityEmploymentOption ? paternityEmploymentOption.value : 'confirmed';
        const maxDays = employmentStatus === 'probation' ? 2 : 7;
        
        const startDate = new Date(leaveStartDate.value);
        const endDate = new Date(leaveEndDate.value);
        const timeDiff = endDate.getTime() - startDate.getTime();
        const selectedDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
        
        if (selectedDays > maxDays) {
            // Show warning in the duration display
            leaveDuration.innerHTML = `<span class="text-danger">
                <i class="bi bi-exclamation-triangle me-1"></i>
                <strong>${selectedDays} days</strong> 
                <small class="text-muted">(Exceeds ${maxDays} day${maxDays === 1 ? '' : 's'} limit for ${employmentStatus} staff)</small>
            </span>`;
            
            // Disable the submit button
            const submitBtn = document.querySelector('#recordLeaveForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="bi bi-exclamation-triangle me-1"></i>Date Range Exceeds Limit';
            }
        } else {
            // Reset to normal display
            leaveDuration.textContent = `${selectedDays} day${selectedDays === 1 ? '' : 's'} (Manual selection)`;
            
            // Enable the submit button
            const submitBtn = document.querySelector('#recordLeaveForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Record Leave';
            }
        }
    }
}
// This event listener is now handled by the new paternity-specific handler above

// Handle Saturday work option changes
document.addEventListener('change', (e) => {
    if (e.target.name === 'saturdayWork') {
        // Recalculate duration when Saturday work option changes
        calculateLeaveDuration();
    }
});

// Handle paternity employment status option changes
document.addEventListener('change', (e) => {
    if (e.target.name === 'paternityEmployment') {
        // Recalculate duration when paternity employment status changes
        calculateLeaveDuration();
        
        // Also validate dates if they are manually selected
        validatePaternityLeaveDates();
    }
});

// Handle half day checkbox changes
halfDayCheckbox.addEventListener('change', (e) => {
    if (e.target.checked) {
        halfDayTimeSelection.style.display = 'block';
        // Default to morning if no selection
        if (!document.querySelector('input[name="halfDayTime"]:checked')) {
            halfDayMorning.checked = true;
        }
    } else {
        halfDayTimeSelection.style.display = 'none';
    }
    // Recalculate duration
    calculateLeaveDuration();
});

// Handle half day time selection changes
document.addEventListener('change', (e) => {
    if (e.target.name === 'halfDayTime') {
        // Recalculate duration when half day time changes
        calculateLeaveDuration();
    }
});

// Handle paternity leave selection
leaveType.addEventListener('change', async (e) => {
    if (e.target.value === 'paternity') {
        // Show paternity employment status option immediately
        document.getElementById('paternityEmploymentOption').style.display = 'block';
        document.getElementById('saturdayWorkOption').style.display = 'none';
        
        // Show note about automatic date setting
        document.getElementById('paternityDateNote').style.display = 'block';
        
        // Make date fields optional for paternity leave
        document.getElementById('leaveStartDate').required = false;
        document.getElementById('leaveEndDate').required = false;
        
        // Calculate and display paternity leave duration immediately
        const paternityEmploymentOption = document.querySelector('input[name="paternityEmployment"]:checked');
        const employmentStatus = paternityEmploymentOption ? paternityEmploymentOption.value : 'confirmed';
        const daysDiff = employmentStatus === 'probation' ? 2 : 7;
        
        leaveDuration.textContent = `${daysDiff} day${daysDiff === 1 ? '' : 's'} (Fixed based on employment status)`;
        
        // Reset submit button to normal state
        const submitBtn = document.querySelector('#recordLeaveForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Record Leave';
        }
        
        // Update balance display
        await updateBalanceDisplay(daysDiff);
    } else {
        // Hide paternity employment option for other leave types
        document.getElementById('paternityEmploymentOption').style.display = 'none';
        document.getElementById('paternityDateNote').style.display = 'none';
        
        // Make date fields required for other leave types
        document.getElementById('leaveStartDate').required = true;
        document.getElementById('leaveEndDate').required = true;
        
        // Calculate duration normally for other leave types
    const duration = await calculateLeaveDuration();
    }
});

// Record leave form submission
recordLeaveForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const duration = await calculateLeaveDuration();
    if (duration <= 0) {
        showAlert('Please select valid dates.');
        return;
    }
    
    // Get Saturday work preference
    const saturdayWorkOption = document.querySelector('input[name="saturdayWork"]:checked');
    const saturdayWork = saturdayWorkOption ? saturdayWorkOption.value : 'no';
    
    // Get paternity employment status
    const paternityEmploymentOption = document.querySelector('input[name="paternityEmployment"]:checked');
    const paternityEmployment = paternityEmploymentOption ? paternityEmploymentOption.value : 'confirmed';
    
    // Get half day information
    const isHalfDay = halfDayCheckbox.checked;
    const halfDayTimeOption = document.querySelector('input[name="halfDayTime"]:checked');
    const halfDayTime = halfDayTimeOption ? halfDayTimeOption.value : null;
    
    // Set default dates for paternity leave if not provided
    let startDate = leaveStartDate.value;
    let endDate = leaveEndDate.value;
    
    if (leaveType.value === 'paternity') {
        // For paternity leave, use current date as start date and calculate end date based on duration
        const today = new Date();
        startDate = today.toISOString().split('T')[0];
        
        // Calculate end date based on duration
        const endDateObj = new Date(today);
        endDateObj.setDate(today.getDate() + duration - 1);
        endDate = endDateObj.toISOString().split('T')[0];
    }
    
    const leaveData = {
        type: leaveType.value,
        startDate: startDate,
        endDate: endDate,
        duration: duration,
        reason: leaveReason.value.trim(),
        saturdayWork: saturdayWork,
        paternityEmployment: leaveType.value === 'paternity' ? paternityEmployment : null,
        isHalfDay: isHalfDay,
        halfDayTime: halfDayTime
    };
    
    // Validation
    if (!leaveData.type || !leaveData.reason) {
        showAlert('Please fill in all required fields.');
        return;
    }
    
    // For paternity leave, dates are not required as it uses fixed days
    if (leaveData.type !== 'paternity' && (!leaveData.startDate || !leaveData.endDate)) {
        showAlert('Please select start and end dates.');
        return;
    }
    
    // For paternity leave, validate that selected dates don't exceed the fixed duration
    if (leaveData.type === 'paternity') {
        const paternityEmploymentOption = document.querySelector('input[name="paternityEmployment"]:checked');
        const employmentStatus = paternityEmploymentOption ? paternityEmploymentOption.value : 'confirmed';
        const maxDays = employmentStatus === 'probation' ? 2 : 7;
        
        // Check if user manually selected dates that exceed the allowed duration
        if (leaveStartDate.value && leaveEndDate.value) {
            const startDate = new Date(leaveStartDate.value);
            const endDate = new Date(leaveEndDate.value);
            const timeDiff = endDate.getTime() - startDate.getTime();
            const selectedDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
            
            if (selectedDays > maxDays) {
                showAlert(`Paternity leave for ${employmentStatus} staff is limited to ${maxDays} day${maxDays === 1 ? '' : 's'}. Selected period is ${selectedDays} days. Please adjust the date range or let the system auto-set the dates.`);
                return;
            }
        }
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
            hasEnoughBalance = duration <= currentBalance.medical.remaining;
            balanceMessage = `You have ${currentBalance.medical.remaining} days remaining of medical leave (outpatient). Cannot approve ${duration} days.`;
            break;
        case 'hospitalization':
            hasEnoughBalance = duration <= currentBalance.hospitalization.remaining;
            balanceMessage = `You have ${currentBalance.hospitalization.remaining} days remaining of hospitalization leave. Cannot approve ${duration} days.`;
            break;
        case 'unpaid':
            hasEnoughBalance = true; // Unpaid leave doesn't have balance restrictions
            break;
        case 'compassionate':
            hasEnoughBalance = true; // Compassionate leave as needed
            break;
        case 'paternity':
            hasEnoughBalance = true; // Paternity leave as per policy
            break;
        case 'maternity':
            hasEnoughBalance = true; // Maternity leave as per policy
            break;
        case 'emergency':
            hasEnoughBalance = true; // Emergency leave as needed
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
        document.getElementById('saturdayWorkOption').style.display = 'none';
        document.getElementById('paternityEmploymentOption').style.display = 'none';
        halfDayOption.style.display = 'none';
        halfDayTimeSelection.style.display = 'none';
        
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

// Public Holidays Functions

// Get public holidays within a specific date range
async function getPublicHolidaysInRange(startDate, endDate) {
    try {
        const holidaysRef = window.firebaseRef(window.firebaseDatabase, 'publicHolidays');
        const snapshot = await window.firebaseGet(holidaysRef);
        
        if (!snapshot.exists()) {
            return [];
        }
        
        const holidays = snapshot.val();
        const holidayDates = [];
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        Object.values(holidays).forEach(holiday => {
            const holidayDate = new Date(holiday.date);
            
            // Check if holiday falls within the date range
            if (holidayDate >= start && holidayDate <= end) {
                holidayDates.push(holiday.date); // Return date in YYYY-MM-DD format
            }
        });
        
        return holidayDates;
    } catch (error) {
        console.error('Error fetching public holidays:', error);
        return []; // Return empty array if error occurs
    }
}

// Load and display public holidays
async function loadPublicHolidays() {
    try {
        const holidaysRef = window.firebaseRef(window.firebaseDatabase, 'publicHolidays');
        const snapshot = await window.firebaseGet(holidaysRef);
        
        if (snapshot.exists()) {
            const holidays = snapshot.val();
            displayPublicHolidays(holidays);
        } else {
            holidaysContainer.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="bi bi-calendar-x display-4 mb-2"></i>
                    <p>No public holidays found</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading public holidays:', error);
        holidaysContainer.innerHTML = `
            <div class="text-center text-danger py-4">
                <i class="bi bi-exclamation-triangle display-4 mb-2"></i>
                <p>Failed to load public holidays</p>
            </div>
        `;
    }
}

// Display public holidays in list format
function displayPublicHolidays(holidays) {
    const holidayEntries = Object.entries(holidays || {});
    
    if (holidayEntries.length === 0) {
        holidaysContainer.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="bi bi-calendar-x display-4 mb-2"></i>
                <p>No public holidays found</p>
            </div>
        `;
        return;
    }
    
    // Sort holidays by date (upcoming first)
    const currentDate = new Date();
    holidayEntries.sort(([,a], [,b]) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        
        // Separate current year holidays from others
        const yearA = dateA.getFullYear();
        const yearB = dateB.getFullYear();
        const currentYear = currentDate.getFullYear();
        
        // Prioritize current year holidays
        if (yearA === currentYear && yearB !== currentYear) return -1;
        if (yearB === currentYear && yearA !== currentYear) return 1;
        
        // Within same priority, sort by date
        return dateA - dateB;
    });
    
    const holidayList = holidayEntries.map(([holidayId, holidayData]) => {
        const holidayDate = new Date(holidayData.date);
        
        // Format date
        const dateDisplay = holidayDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        
        // Get days until/since holiday
        const timeDiff = holidayDate.getTime() - currentDate.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        let timeIndicator = '';
        let rowClass = '';
        
        if (daysDiff === 0) {
            timeIndicator = '<span class="badge bg-success">Today</span>';
            rowClass = 'table-success';
        } else if (daysDiff === 1) {
            timeIndicator = '<span class="badge bg-warning">Tomorrow</span>';
            rowClass = 'table-warning';
        } else if (daysDiff > 0 && daysDiff <= 7) {
            timeIndicator = `<span class="badge bg-info">In ${daysDiff} day${daysDiff === 1 ? '' : 's'}</span>`;
            rowClass = 'table-info';
        } else if (daysDiff > 0) {
            timeIndicator = `<span class="badge bg-primary">In ${daysDiff} day${daysDiff === 1 ? '' : 's'}</span>`;
            rowClass = 'table-primary';
        } else {
            timeIndicator = `<span class="badge bg-secondary">${Math.abs(daysDiff)} day${Math.abs(daysDiff) === 1 ? '' : 's'} ago</span>`;
            rowClass = 'table-secondary';
        }
        
        // Get type badge
        const typeBadge = getHolidayTypeBadge(holidayData.type);
        
        // Recurring indicator
        const recurringIndicator = holidayData.recurring ? 
            '<i class="bi bi-arrow-repeat text-primary ms-1" title="Recurring Annual Holiday"></i>' : '';
        
        return `
            <tr class="${rowClass}">
                <td>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-calendar-event me-2 text-primary"></i>
                        <div>
                            <strong>${holidayData.name}${recurringIndicator}</strong>
                            ${holidayData.description ? `<br><small class="text-muted">${holidayData.description}</small>` : ''}
                        </div>
                    </div>
                </td>
                <td>
                    <i class="bi bi-calendar3 me-1"></i>${dateDisplay}
                </td>
                <td>${typeBadge}</td>
                <td class="text-end">${timeIndicator}</td>
            </tr>
        `;
    }).join('');
    
    holidaysContainer.innerHTML = `
        <div class="table-responsive">
            <table class="table table-hover mb-0">
                <thead class="table-light">
                    <tr>
                        <th><i class="bi bi-calendar-event me-1"></i>Holiday Name</th>
                        <th><i class="bi bi-calendar3 me-1"></i>Date</th>
                        <th><i class="bi bi-tag me-1"></i>Type</th>
                        <th class="text-end"><i class="bi bi-clock me-1"></i>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${holidayList}
                </tbody>
            </table>
        </div>
        <div class="mt-3 text-center text-muted">
            <small>Showing ${holidayEntries.length} public holiday${holidayEntries.length === 1 ? '' : 's'}</small>
        </div>
    `;
}

// Get holiday type badge (same as sadmin dashboard)
function getHolidayTypeBadge(type) {
    switch (type) {
        case 'national':
            return '<span class="badge bg-danger">National</span>';
        case 'religious':
            return '<span class="badge bg-warning">Religious</span>';
        case 'cultural':
            return '<span class="badge bg-info">Cultural</span>';
        case 'company':
            return '<span class="badge bg-success">Company</span>';
        case 'other':
            return '<span class="badge bg-secondary">Other</span>';
        default:
            return '<span class="badge bg-light text-dark">Unknown</span>';
    }
}

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