// DOM elements
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
let currentTab = 'personal';

// Initial data
const defaultData = {
    personal: {
        principalPercent: 88.9,
        interestPercent: 11.1
    },
    home: {
        principalPercent: 54.1,
        interestPercent: 45.9
    },
    car: {
        principalPercent: 84.9,
        interestPercent: 15.1
    }
};

// Initialize the calculator and chart
document.addEventListener('DOMContentLoaded', function() {
    // Set up tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabType = tab.getAttribute('data-tab');
            switchTab(tabType);
        });
    });

    // Set up calculate button for all tabs
    document.getElementById('calculateBtn').addEventListener('click', () => {
        const result = calculateEMI('personal');
        updatePieChart(result.loanAmount, result.totalInterest);
        animateResults('personal');
    });
    
    document.getElementById('homeCalculateBtn').addEventListener('click', () => {
        const result = calculateEMI('home');
        updatePieChart(result.loanAmount, result.totalInterest);
        animateResults('home');
    });
    
    document.getElementById('carCalculateBtn').addEventListener('click', () => {
        const result = calculateEMI('car');
        updatePieChart(result.loanAmount, result.totalInterest);
        animateResults('car');
    });

    // Initial calculations and chart
    calculateEMI('personal');
    calculateEMI('home');
    calculateEMI('car');
    
    // Set initial pie chart values
    updatePieChart(80000, 10000);
});

// Function to switch between tabs
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
    
    // Calculate and update the chart for the selected tab
    const result = calculateEMI(tabType);
    updatePieChart(result.loanAmount, result.totalInterest);
    document.getElementById('chartEmi').textContent = formatCurrency(result.emi);
}

// Calculate EMI and update UI for a specific tab
function calculateEMI(tabType) {
    const prefix = tabType === 'personal' ? '' : tabType;
    
    // Get inputs
    const principal = parseFloat(document.getElementById(`${prefix}${prefix ? 'P' : 'p'}rincipal`).value) || 0;
    const rate = parseFloat(document.getElementById(`${prefix}${prefix ? 'R' : 'r'}ate`).value) || 0;
    const downPayment = parseFloat(document.getElementById(`${prefix}DownPayment`).value) || 0;
    const years = parseInt(document.getElementById(`${prefix}${prefix ? 'Y' : 'y'}ears`).value) || 0;
    const months = parseInt(document.getElementById(`${prefix}${prefix ? 'M' : 'm'}onths`).value) || 0;
    
    // Calculate loan amount (principal - down payment)
    const loanAmount = principal - downPayment;
    
    // Calculate total months
    const totalMonths = (years * 12) + months;
    
    // Calculate monthly interest rate
    const monthlyRate = (rate / 12) / 100;
    
    // Calculate EMI using formula: EMI = [P x R x (1+R)^N]/[(1+R)^N-1]
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
    document.getElementById(`${prefix}${prefix ? 'E' : 'e'}mi`).textContent = formatCurrency(emi);
    document.getElementById(`${prefix}TotalPrincipal`).textContent = formatCurrency(loanAmount);
    document.getElementById(`${prefix}TotalInterest`).textContent = formatCurrency(totalInterest);
    document.getElementById(`${prefix}TotalAmount`).textContent = formatCurrency(totalPayment);
    
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

// Format currency values
function formatCurrency(value) {
    return '₹' + value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Update pie chart based on principal and interest values
function updatePieChart(principal, interest) {
    const total = principal + interest;
    
    if (total <= 0) return;
    
    // Calculate percentages
    const principalPercent = (principal / total) * 100;
    const interestPercent = (interest / total) * 100;
    
    // Update percentage text
    document.getElementById('principalPercentage').textContent = principalPercent.toFixed(1) + '%';
    document.getElementById('interestPercentage').textContent = interestPercent.toFixed(1) + '%';
    
    // Get chart segments
    const principalSegment = document.querySelector('.principal-segment');
    const interestSegment = document.querySelector('.interest-segment');
    
    // Convert percentages to degrees for the arc
    const interestDegrees = (interestPercent / 100) * 360;
    
    // For the donut style, we'll use conic-gradient instead of clip-path
    const chart = document.querySelector('.pie-chart');
    
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
    
    // Hide the original segments since we're using background gradient
    principalSegment.style.display = 'none';
    interestSegment.style.display = 'none';
}

// Helper function to create clip-path for pie slices
function createPieSlice(startAngle, endAngle) {
    // For CSS clip-path, we need to use percentage-based coordinates
    const x1 = 50 + 50 * Math.cos((startAngle - 90) * (Math.PI / 180));
    const y1 = 50 + 50 * Math.sin((startAngle - 90) * (Math.PI / 180));
    const x2 = 50 + 50 * Math.cos((endAngle - 90) * (Math.PI / 180));
    const y2 = 50 + 50 * Math.sin((endAngle - 90) * (Math.PI / 180));
    
    // For angles > 180 degrees, we need a different approach
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    // Create polygon instead of trying to use SVG path syntax in clip-path
    if (endAngle - startAngle >= 360) {
        return 'circle(50% at 50% 50%)';
    }
    
    // Generate points for the polygon
    let points = `50% 50%, ${x1}% ${y1}%`;
    
    // For large arcs, add intermediate points
    if (largeArcFlag) {
        const midAngle = startAngle + (endAngle - startAngle) / 2;
        const xMid = 50 + 50 * Math.cos((midAngle - 90) * (Math.PI / 180));
        const yMid = 50 + 50 * Math.sin((midAngle - 90) * (Math.PI / 180));
        points += `, ${xMid}% ${yMid}%`;
    }
    
    points += `, ${x2}% ${y2}%`;
    
    return `polygon(${points})`;
}

// Function to animate results when updated
function animateResults(tabType) {
    const prefix = tabType === 'personal' ? '' : tabType;
    const resultValues = document.querySelectorAll(`#${tabType} .result-value`);
    
    resultValues.forEach(value => {
        value.classList.remove('updated');
        void value.offsetWidth; // Trigger reflow
        value.classList.add('updated');
    });
    
    // Animate pie chart
    document.querySelector('.pie-chart').style.animation = 'pulse 0.5s ease';
    setTimeout(() => {
        document.querySelector('.pie-chart').style.animation = '';
    }, 500);
}


// Initial calculations for all tabs
const personalResult = calculateEMI('personal');
const homeResult = calculateEMI('home');
const carResult = calculateEMI('car');

// Set initial pie chart to the current tab
updatePieChart(personalResult.loanAmount, personalResult.totalInterest);
document.getElementById('chartEmi').textContent = formatCurrency(personalResult.emi);