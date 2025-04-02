//DOM elements
const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll('.tab-content');
let currentTab = 'personal';

// Initialize the chart with the default tab
calculateAndUpdateChart(currentTab);
switchTab(currentTab);


//Adding Event Listener to all tabs
for (let tab of tabs) {
    tab.addEventListener('click', () => {
        const tabType = tab.getAttribute('data-tab');
        calculateAndUpdateChart(tabType);
        switchTab(tabType);
    })
}

function switchTab(tabType) {
    // Update current tab
    currentTab = tabType;

    // Update active tab state
    tabs.forEach(tab => {
        if (tab.getAttribute('data-tab') === tabType) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Show appropriate tab content
    tabContents.forEach(content => {
        if (content.id === tabType) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

//Function for calculating and updating the chart
function calculateAndUpdateChart(tabType) {
    const result = calculateEMI(tabType);
    updatePieChart(result.loanAmount, result.totalInterest);
    animateResults(tabType);
}

//Adding event listeners to calculate button
document.getElementById("personal-calculate-btn").addEventListener('click', () => {
    calculateAndUpdateChart('personal');
});

document.getElementById("home-calculate-btn").addEventListener('click', () => {
    calculateAndUpdateChart('home');
});

document.getElementById("car-calculate-btn").addEventListener('click', () => {
    calculateAndUpdateChart('car');
});

// Format currency values
function formatCurrency(value) {
    return '₹' + value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Update pie chart based on principal and interest values
function updatePieChart(principal, interest) {
    const total = principal + interest;
    const chart = document.querySelector('.pie-chart');

    if (total <= 0) {
        const interestDegrees = 0;
        document.getElementById('principal-percentage').textContent = "";
        document.getElementById('interest-percentage').textContent = "";
        chart.style.background = `conic-gradient(
            rgba(82, 109, 254, 0.9) 0deg ${interestDegrees}deg,
            rgba(232, 237, 250, 0.9) ${interestDegrees}deg 360deg
        )`;
        return;
    }

    // Calculate percentages
    const principalPercent = (principal / total) * 100;
    const interestPercent = (interest / total) * 100;

    // Update percentage text
    document.getElementById('principal-percentage').textContent = principalPercent.toFixed(1) + '%';
    document.getElementById('interest-percentage').textContent = interestPercent.toFixed(1) + '%';

    // Convert percentages to degrees for the arc
    const interestDegrees = (interestPercent / 100) * 360;

    // For the donut style, we'll use conic-gradient instead of clip-path
    if (interestPercent <= 0) {
        // All principal
        chart.style.background = 'rgba(232, 237, 250, 0.9)';
    } else if (principalPercent <= 0) {
        // All interest
        chart.style.background = 'rgba(82, 109, 254, 0.9)';
    } else {
        // Mixed - use conic gradient
        chart.style.background = `conic-gradient(
            rgba(82, 109, 254, 0.9) 0deg ${interestDegrees}deg,
            rgba(232, 237, 250, 0.9) ${interestDegrees}deg 360deg
        )`;
    }
}

// Function to animate results when updated
function animateResults(tabType) {
    const resultValues = document.querySelectorAll(`#${tabType} .result-value`);

    resultValues.forEach(value => {
        value.classList.remove('updated');
        void value.offsetWidth; // Trigger reflow
        value.classList.add('updated');
    });

    // Animate pie chart
    const pieChart = document.querySelector('.pie-chart');
    if (pieChart) {
        pieChart.style.animation = 'pulse 0.5s ease';
        setTimeout(() => {
            pieChart.style.animation = '';
        }, 500);
    }
}

//shows the error message
function showError(id, message) {
    // Check if an error message already exists
    let existingError = id.parentNode.querySelector(".error");
    if (existingError) {
        existingError.textContent = message; // Update the existing error message
    } else {
        let errorMessage = document.createElement("div");
        errorMessage.textContent = message;
        errorMessage.classList.add('error');
        id.parentNode.appendChild(errorMessage);
    }
}

//clear the error message
function clearError(input) {
    let errorMessage = input.parentNode.querySelector(".error");
    if (errorMessage) errorMessage.remove(); // Remove the error message from the DOM
    input.style.border = "";
}

function reset(tabType) {
    document.getElementById(`${tabType}-emi`).textContent = "";
    document.getElementById(`${tabType}-totalprincipal`).textContent = "";
    document.getElementById(`${tabType}-totalinterest`).textContent = "";
    document.getElementById(`${tabType}-totalamount`).textContent = "";
    if (currentTab === tabType) {
        document.getElementById('chartEmi').textContent = 0;
    }
}

// Calculate EMI and update UI for a specific tab
function calculateEMI(tabType) {
    // Get inputs
    const principal = parseFloat(document.getElementById(`${tabType}-principal`).value);
    const rate = parseFloat(document.getElementById(`${tabType}-rate`).value);
    const downPayment = 0;
    if (tabType === 'personal') {
        const downPayment = 0;
    } else {
        const downPayment = parseFloat(document.getElementById(`${tabType}-downpayment`).value);
    }
    const years = parseInt(document.getElementById(`${tabType}-years`).value);
    const months = parseInt(document.getElementById(`${tabType}-months`).value);


    if (isNaN(principal) || isNaN(rate) || isNaN(downPayment) || isNaN(years) || isNaN(months)) {
        reset(tabType);
        return { loanAmount: 0, totalInterest: 0, totalPayment: 0, emi: 0 };
    }

    // Validate inputs
    if (principal < 0) {
        reset(tabType);
        return { loanAmount: 0, totalInterest: 0, totalPayment: 0, emi: 0 };
    }
    if (tabType === 'personal' && (rate < 15 || rate > 25)) {
        reset(tabType);
        return { loanAmount: 0, totalInterest: 0, totalPayment: 0, emi: 0 };
    }

    if (tabType === 'home' && (rate < 10 || rate > 15)) {
        reset(tabType);
        return { loanAmount: 0, totalInterest: 0, totalPayment: 0, emi: 0 };
    }

    if (tabType === 'car' && (rate < 10 || rate > 25)) {
        reset(tabType);
        return { loanAmount: 0, totalInterest: 0, totalPayment: 0, emi: 0 };
    }

    if (years < 0 || months < 0 || months > 11) {
        reset(tabType);
        return { loanAmount: 0, totalInterest: 0, totalPayment: 0, emi: 0 };
    }
    if (downPayment < 0) {
        reset(tabType);
        return { loanAmount: 0, totalInterest: 0, totalPayment: 0, emi: 0 };
    }

    if (rate > 25) {
        reset(tabType);
        return { loanAmount: 0, totalInterest: 0, totalPayment: 0, emi: 0 };
    }

    if (downPayment > principal) {
        reset(tabType);
        return {
            loanAmount: 0,
            totalInterest: 0,
            totalPayment: 0,
            emi: 0
        };
    }



    // Calculate loan amount (principal - down payment)
    const loanAmount = principal - downPayment;

    // Calculate total months
    const totalMonths = (years * 12) + months;

    // Calculate monthly interest rate
    const monthlyRate = (rate / 12) / 100;

    // Calculate EMI
    let emi = 0;
    if (loanAmount > 0 && totalMonths > 0 && rate > 0) {
        const numerator = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths);
        const denominator = Math.pow(1 + monthlyRate, totalMonths) - 1;
        emi = numerator / denominator;
    }

    // Calculate total payment and interest
    const totalPayment = emi * totalMonths;
    const totalInterest = totalPayment - loanAmount;

    // Update UI with calculated values
    document.getElementById(`${tabType}-emi`).textContent = formatCurrency(emi);
    document.getElementById(`${tabType}-totalprincipal`).textContent = formatCurrency(loanAmount);
    document.getElementById(`${tabType}-totalinterest`).textContent = formatCurrency(totalInterest);
    document.getElementById(`${tabType}-totalamount`).textContent = formatCurrency(totalPayment);

    // If this is the current tab, update the chart EMI display
    if (currentTab === tabType) {
        document.getElementById('chartEmi').textContent = formatCurrency(emi);
    }

    return {
        loanAmount,
        totalInterest,
        totalPayment,
        emi
    };
}

function resetButton(tabType) {
    reset(tabType);
    document.getElementById(`${tabType}-principal`).value = "";
    document.getElementById(`${tabType}-rate`).value = "";
    if (tabType === 'personal') {

    } else {
        document.getElementById(`${tabType}-downpayment`).value = "";
    }

    document.getElementById(`${tabType}-years`).value = "";
    document.getElementById(`${tabType}-months`).value = "";
    updatePieChart(0, 0);
    document.getElementById('chartEmi').textContent = 0;
}

//function to validate the principal amount
function addValidation(inputId, validationFn, errorMessage) {
    document.getElementById(inputId).addEventListener('change', function () {
        const value = this.value;
        if (!validationFn(value)) {
            showError(this, errorMessage);
        } else {
            clearError(this);
        }
    });
}

// Add validation for principal inputs
addValidation("personal-principal", value => value !== "" && value >= 0, "⚠️Principal must be greater than 0.");
addValidation("home-principal", value => value !== "" && value >= 0, "⚠️Principal must be greater than 0.");
addValidation("car-principal", value => value !== "" && value >= 0, "⚠️Principal must be greater than 0.");

//function to validate the rate of interest
addValidation("personal-rate", value => value !== "" && value >= 15 && value <= 25, "⚠️Rate must be between 15% and 25%.");
addValidation("home-rate", value => value !== "" && value >= 10 && value <= 15, "⚠️Rate must be between 10 and 15%.");
addValidation("car-rate", value => value !== "" && value >= 10 && value <= 25, "⚠️Rate must be between 0 and 25%.");
//function to validate the downpayment amount
// addValidation("personal-downpayment", value => value !== "" && value >= 0, "⚠️Down payment must be greater than 0.");
addValidation("home-downpayment", value => value !== "" && value >= 0, "⚠️Down payment must be greater than 0.");
addValidation("car-downpayment", value => value !== "" && value >= 0, "⚠️Down payment must be greater than 0.");

//function to validate the years of loan
addValidation("personal-years", value => value !== "" && value >= 0, "⚠️Years of loan must be greater than 0.");
addValidation("home-years", value => value !== "" && value >= 0, "⚠️Years of loan must be greater than 0.");
addValidation("car-years", value => value !== "" && value >= 0, "⚠️Years of loan must be greater than 0.");


//function to validate the months of loan
addValidation("personal-months", value => value !== "" && value >= 0 && value < 12, "⚠️Months of loan must be between 0 and 11.");
addValidation("home-months", value => value !== "" && value >= 0 && value < 12, "⚠️Months of loan must be between 0 and 11.");
addValidation("car-months", value => value !== "" && value >= 0 && value < 12, "⚠️Months of loan must be between 0 and 11.");

//Downpayment should not be greater than principal amount
// addValidation("personal-downpayment", function (value) {
//     const principal = parseFloat(document.getElementById("personal-principal").value);
//     return value !== "" && value >= 0 && value <= principal;
// }, "⚠️Down payment must be less than or equal to principal amount.");

addValidation("home-downpayment", function (value) {
    const principal = parseFloat(document.getElementById("home-principal").value);
    return value !== "" && value >= 0 && value <= principal;
}, "⚠️Down payment must be less than or equal to principal amount.");

addValidation("car-downpayment", function (value) {
    const principal = parseFloat(document.getElementById("car-principal").value);
    return value !== "" && value >= 0 && value <= principal;
}, "⚠️Down payment must be less than or equal to principal amount.");

document.getElementById("personal-reset-btn").addEventListener('click', () => {
    resetButton('personal');
});

document.getElementById("home-reset-btn").addEventListener('click', () => {
    resetButton('home');
});

document.getElementById("car-reset-btn").addEventListener('click', () => {
    resetButton('car');
});