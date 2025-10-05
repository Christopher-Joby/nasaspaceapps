document.addEventListener('DOMContentLoaded', function() {
    // Initialize map
    const map = L.map('map').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    let selectedLocation = null;
    let marker = null;

    // Map click handler
    map.on('click', function(e) {
        const lat = e.latlng.lat.toFixed(5);
        const lng = e.latlng.lng.toFixed(5);
        selectedLocation = { lat: parseFloat(lat), lng: parseFloat(lng) };

        if (marker) map.removeLayer(marker);
        marker = L.marker(e.latlng).addTo(map);
        document.getElementById('selected-location').textContent = `Latitude: ${lat}, Longitude: ${lng}`;
    });

    // Search bar suggestion (Nominatim)
    document.getElementById('location-search').addEventListener('input', function() {
        const query = this.value.trim();
        if (query.length < 2) return;
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`)
            .then(res => res.json())
            .then(results => {
                const datalist = document.getElementById('location-suggestions');
                datalist.innerHTML = '';
                results.forEach(place => {
                    const option = document.createElement('option');
                    option.value = place.display_name;
                    datalist.appendChild(option);
                });
            });
    });

    // Search input Enter: geocode & set marker
    document.getElementById('location-search').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const place = this.value.trim();
            if (!place) return;

            if (marker) map.removeLayer(marker);

            geocodePlaceName(place)
                .then(res => {
                    selectedLocation = { lat: res.lat, lng: res.lng };
                    map.setView([res.lat, res.lng], 9);
                    marker = L.marker([res.lat, res.lng]).addTo(map);
                    document.getElementById('selected-location').textContent =
                        `${res.display_name} (Latitude: ${res.lat.toFixed(5)}, Longitude: ${res.lng.toFixed(5)})`;
                })
                .catch(() => {
                    alert("Location not found. Please try a different search or click on the map.");
                });
        }
    });

    // Geocode function for place search
    function geocodePlaceName(place) {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`;
        return fetch(url)
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    return {
                        lat: parseFloat(data[0].lat),
                        lng: parseFloat(data[0].lon),
                        display_name: data[0].display_name
                    };
                } else {
                    throw new Error("Location not found");
                }
            });
    }

    // Form submit: always geocode new search input if not empty, otherwise use marker
    document.getElementById('search-form').addEventListener('submit', function(e) {
        e.preventDefault();

        const place = document.getElementById('location-search').value.trim();
        const dateInput = document.getElementById('date-select').value;

        if (!dateInput) {
            alert('Please select a date.');
            return;
        }

        if (place) {
            if (marker) map.removeLayer(marker);

            geocodePlaceName(place)
                .then(res => {
                    selectedLocation = { lat: res.lat, lng: res.lng };
                    map.setView([res.lat, res.lng], 9);
                    marker = L.marker([res.lat, res.lng]).addTo(map);
                    document.getElementById('selected-location').textContent =
                        `${res.display_name} (Latitude: ${res.lat.toFixed(5)}, Longitude: ${res.lng.toFixed(5)})`;
                    proceedWeatherFetch(selectedLocation, dateInput);
                })
                .catch(() => {
                    alert("Location not found. Please try a different search or click on the map.");
                });
        } else if (selectedLocation) {
            proceedWeatherFetch(selectedLocation, dateInput);
        } else {
            alert('Please search for a location or pick one on the map.');
        }
    });

    function proceedWeatherFetch(location, dateInput) {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('results').style.display = 'none';
        getWeatherProbabilityData(location.lat, location.lng, dateInput)
            .then(data => {
                document.getElementById('loading').style.display = 'none';
                document.getElementById('results').style.display = 'block';
                updateProbabilityDisplay(data);
                updateResultSummary(data);
                // Use Chart.js for line charts (not histogram, as per your original UI)
                createCharts(data);
                updatePlanAdvice(data);
                updateHeroIcon(data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                document.getElementById('loading').style.display = 'none';
                alert('Error fetching data. Please try again.');
            });
    }

    // Download buttons
    document.getElementById('download-csv').addEventListener('click', function() {
        downloadData('csv');
    });
    document.getElementById('download-json').addEventListener('click', function() {
        downloadData('json');
    });

    // Interactive header on scroll
    document.addEventListener('scroll', function() {
        const header = document.getElementById('main-header');
        if (!header) return;
        if (window.scrollY > 30) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
    });
});

function updateProbabilityDisplay(data) {
    document.getElementById('prob-hot').textContent = `${data.temperature.veryHotProbability}%`;
    document.getElementById('prob-cold').textContent = `${data.temperature.veryColdProbability}%`;
    document.getElementById('prob-wet').textContent = `${data.precipitation.veryWetProbability}%`;
    document.getElementById('prob-windy').textContent = `${data.wind.veryWindyProbability}%`;
    document.getElementById('prob-uncomfortable').textContent = `${data.comfortIndex.veryUncomfortableProbability}%`;
}

function updateResultSummary(data) {
    let summary = '';
    if (data.temperature.veryHotProbability >= 70) {
        summary += "High chance of very hot weather. ";
    } else if (data.temperature.veryHotProbability >= 40) {
        summary += "Moderate chance of hot weather. ";
    } else {
        summary += "Low chance of hot weather. ";
    }
    if (data.temperature.veryColdProbability >= 70) {
        summary += "High chance of cold conditions. ";
    } else if (data.temperature.veryColdProbability >= 40) {
        summary += "Moderate chance of cold conditions. ";
    } else {
        summary += "Low chance of cold conditions. ";
    }
    if (data.precipitation.veryWetProbability >= 70) {
        summary += "Expect heavy precipitation. ";
    } else if (data.precipitation.veryWetProbability >= 40) {
        summary += "Possibility of wet weather. ";
    } else {
        summary += "Low likelihood of rain. ";
    }
    if (data.wind.veryWindyProbability >= 70) {
        summary += "Very windy conditions possible. ";
    } else if (data.wind.veryWindyProbability >= 40) {
        summary += "Moderate wind expected. ";
    } else {
        summary += "Winds likely mild. ";
    }
    if (data.comfortIndex.veryUncomfortableProbability >= 70) {
        summary += "Overall: conditions may be uncomfortable.";
    } else if (data.comfortIndex.veryUncomfortableProbability >= 40) {
        summary += "Overall: comfort may be moderate.";
    } else {
        summary += "Overall: comfortable for outdoor activities!";
    }
    document.getElementById('result-summary').textContent = summary;
}

function updatePlanAdvice(data) {
    let advice = "";
    if (data.temperature.veryHotProbability >= 70) advice += "It's likely very hot: stay hydrated! ";
    if (data.temperature.veryColdProbability >= 70) advice += "Dress warmly, possible cold snap. ";
    if (data.precipitation.veryWetProbability >= 70) advice += "High chance of heavy rain: bring an umbrella. ";
    if (data.wind.veryWindyProbability >= 70) advice += "Strong winds expected: secure loose items. ";
    if (data.comfortIndex.veryUncomfortableProbability < 40) advice += "Conditions are comfortable for outdoor activities!";
    document.getElementById("plan-advice").textContent = advice || "No special advice for selected conditions.";
}

function updateHeroIcon(data) {
    const iconEl = document.getElementById('hero-icon');
    let icon = "🌤️";
    if (data.precipitation.veryWetProbability >= 70) icon = "🌧️";
    else if (data.temperature.veryHotProbability >= 70) icon = "☀️";
    else if (data.temperature.veryColdProbability >= 70) icon = "❄️";
    else if (data.wind.veryWindyProbability >= 70) icon = "💨";
    else if (data.comfortIndex.veryUncomfortableProbability >= 70) icon = "😅";
    iconEl.textContent = icon;
}

// Chart.js rendering for historical data (line charts)
function createCharts(data) {
    if (window.tempChart) window.tempChart.destroy();
    if (window.precipChart) window.precipChart.destroy();
    if (window.windChart) window.windChart.destroy();
    if (window.comfortChart) window.comfortChart.destroy();

    window.tempChart = new Chart(document.getElementById('temp-chart').getContext('2d'), {
        type: 'line',
        data: {
            labels: data.temperature.historical.map((_,i)=>i+1),
            datasets: [{
                label:'Temperature (°C)',
                data:data.temperature.historical,
                borderColor:'#f9cf59',
                backgroundColor:'rgba(249,207,89,0.18)',
                tension:0.3
            }]
        },
        options: {
            plugins:{legend:{display:false}},
            scales: {
                x: {
                    display: true,
                    title: { display: true, text: 'Day', color: '#111', font: { family: 'Inter', size: 14 } },
                    ticks: { color: '#111', font: { family: 'Inter', size: 12 } }
                },
                y: {
                    display: true,
                    title: { display: true, text: 'Temp (°C)', color: '#111', font: { family: 'Inter', size: 14 } },
                    ticks: { color: '#111', font: { family: 'Inter', size: 12 } }
                }
            },
            elements:{point:{radius:0}}
        }
    });
    window.precipChart = new Chart(document.getElementById('precip-chart').getContext('2d'), {
        type: 'line',
        data: {
            labels: data.precipitation.historical.map((_,i)=>i+1),
            datasets: [{
                label:'Precip (mm)',
                data:data.precipitation.historical,
                borderColor:'#90be6d',
                backgroundColor:'rgba(144,190,109,0.18)',
                tension:0.3
            }]
        },
        options: {
            plugins:{legend:{display:false}},
            scales: {
                x: {
                    display: true,
                    title: { display: true, text: 'Day', color: '#111', font: { family: 'Inter', size: 14 } },
                    ticks: { color: '#111', font: { family: 'Inter', size: 12 } }
                },
                y: {
                    display: true,
                    title: { display: true, text: 'Precip (mm)', color: '#111', font: { family: 'Inter', size: 14 } },
                    ticks: { color: '#111', font: { family: 'Inter', size: 12 } }
                }
            },
            elements:{point:{radius:0}}
        }
    });
    window.windChart = new Chart(document.getElementById('wind-chart').getContext('2d'), {
        type: 'line',
        data: {
            labels: data.wind.historical.map((_,i)=>i+1),
            datasets: [{
                label:'Wind (m/s)',
                data:data.wind.historical,
                borderColor:'#1f6feb',
                backgroundColor:'rgba(142,202,230,0.18)',
                tension:0.3
            }]
        },
        options: {
            plugins:{legend:{display:false}},
            scales: {
                x: {
                    display: true,
                    title: { display: true, text: 'Day', color: '#111', font: { family: 'Inter', size: 14 } },
                    ticks: { color: '#111', font: { family: 'Inter', size: 12 } }
                },
                y: {
                    display: true,
                    title: { display: true, text: 'Wind (m/s)', color: '#111', font: { family: 'Inter', size: 14 } },
                    ticks: { color: '#111', font: { family: 'Inter', size: 12 } }
                }
            },
            elements:{point:{radius:0}}
        }
    });
    window.comfortChart = new Chart(document.getElementById('comfort-chart').getContext('2d'), {
        type: 'line',
        data: {
            labels: data.comfortIndex.historical.map((_,i)=>i+1),
            datasets: [{
                label:'Comfort',
                data:data.comfortIndex.historical,
                borderColor:'#e63946',
                backgroundColor:'rgba(230,57,70,0.14)',
                tension:0.3
            }]
        },
        options: {
            plugins:{legend:{display:false}},
            scales: {
                x: {
                    display: true,
                    title: { display: true, text: 'Day', color: '#111', font: { family: 'Inter', size: 14 } },
                    ticks: { color: '#111', font: { family: 'Inter', size: 12 } }
                },
                y: {
                    display: true,
                    title: { display: true, text: 'Comfort', color: '#111', font: { family: 'Inter', size: 14 } },
                    ticks: { color: '#111', font: { family: 'Inter', size: 12 } }
                }
            },
            elements:{point:{radius:0}}
        }
    });
}

function downloadData(format) {
    const currentDate = document.getElementById('date-select').value;
    const location = document.getElementById('selected-location').textContent;
    let data = {
        metadata: {
            date: currentDate,
            location: location,
            source: "NASA Earth Observation Data",
            generatedAt: new Date().toISOString()
        },
        probabilities: {
            temperature: {
                veryHot: document.getElementById('prob-hot').textContent,
                veryCold: document.getElementById('prob-cold').textContent
            },
            precipitation: {
                veryWet: document.getElementById('prob-wet').textContent
            },
            wind: {
                veryWindy: document.getElementById('prob-windy').textContent
            },
            comfortIndex: {
                veryUncomfortable: document.getElementById('prob-uncomfortable').textContent
            }
        }
    };
    let content, filename, contentType;
    if (format === 'json') {
        content = JSON.stringify(data, null, 2);
        filename = `weather-probability-${currentDate}.json`;
        contentType = 'application/json';
    } else {
        let csvContent = "category,condition,probability\n";
        csvContent += `temperature,very hot,${data.probabilities.temperature.veryHot}\n`;
        csvContent += `temperature,very cold,${data.probabilities.temperature.veryCold}\n`;
        csvContent += `precipitation,very wet,${data.probabilities.precipitation.veryWet}\n`;
        csvContent += `wind,very windy,${data.probabilities.wind.veryWindy}\n`;
        csvContent += `comfort,very uncomfortable,${data.probabilities.comfortIndex.veryUncomfortable}\n`;
        content = csvContent;
        filename = `weather-probability-${currentDate}.csv`;
        contentType = 'text/csv';
    }
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}