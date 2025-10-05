/**
 * Creates charts based on the weather probability data
 * @param {Object} data - The weather probability data
 */
function createCharts(data) {
    // Create temperature chart
    createHistogramChart(
        'temperature-card', 
        data.temperature.historical, 
        'Temperature Distribution',
        'Temperature (°F)',
        'Frequency',
        [
            `Very Hot (${data.temperature.veryHotProbability}%)`,
            `Very Cold (${data.temperature.veryColdProbability}%)`
        ]
    );
    
    // Create precipitation chart
    createHistogramChart(
        'precipitation-card', 
        data.precipitation.historical, 
        'Precipitation Distribution',
        'Precipitation (mm)',
        'Frequency',
        [`Very Wet (${data.precipitation.veryWetProbability}%)`]
    );
    
    // Create wind chart
    createHistogramChart(
        'wind-card', 
        data.wind.historical, 
        'Wind Speed Distribution',
        'Wind Speed (mph)',
        'Frequency',
        [`Very Windy (${data.wind.veryWindyProbability}%)`]
    );
    
    // Create comfort index chart
    createHistogramChart(
        'comfort-card', 
        data.comfortIndex.historical, 
        'Comfort Index Distribution',
        'Comfort Index',
        'Frequency',
        [`Very Uncomfortable (${data.comfortIndex.veryUncomfortableProbability}%)`]
    );
}

/**
 * Creates a histogram chart for the given data
 * @param {string} containerId - ID of the container element
 * @param {Array} data - Array of data points
 * @param {string} title - Chart title
 * @param {string} xAxisLabel - Label for the x-axis
 * @param {string} yAxisLabel - Label for the y-axis
 * @param {Array} legendLabels - Labels for the legend
 */
function createHistogramChart(containerId, data, title, xAxisLabel, yAxisLabel, legendLabels) {
    const container = document.querySelector(`#${containerId} .chart-container`);
    
    // Clear any existing chart
    container.innerHTML = '';
    
    // Create canvas for Chart.js
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    // Process data for histogram
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binCount = 10;
    const binWidth = (max - min) / binCount;
    
    // Create bins
    const bins = Array(binCount).fill(0);
    const binLabels = [];
    
    for (let i = 0; i < binCount; i++) {
        binLabels.push(`${(min + i * binWidth).toFixed(1)} - ${(min + (i + 1) * binWidth).toFixed(1)}`);
    }
    
    // Fill bins with data
    data.forEach(value => {
        const binIndex = Math.min(binCount - 1, Math.floor((value - min) / binWidth));
        bins[binIndex]++;
    });
    
    // Create chart
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: binLabels,
            datasets: [{
                label: legendLabels[0],
                data: bins,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: title
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: (items) => items[0].label,
                        label: (item) => `Count: ${item.raw}`
                    }
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: false,
                        text: yAxisLabel
                    }
                }
            }
        }
    });
}