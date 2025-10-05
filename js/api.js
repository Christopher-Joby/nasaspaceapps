/**
 * Gets weather probability data for a specific location and date using NASA POWER API,
 * with fallback to simulated data if fetch fails.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise} - Promise resolving to probability data
 */
async function getWeatherProbabilityData(lat, lng, date) {
    const selectedDate = new Date(date);
    const year = selectedDate.getFullYear();
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const day = selectedDate.getDate().toString().padStart(2, '0');
    const startDate = `${year}${month}${day}`;
    const endDate = startDate;

    // NASA POWER API endpoint for daily data
    const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,PRECTOTCORR,WS10M&community=RE&longitude=${lng}&latitude=${lat}&start=${startDate}&end=${endDate}&format=JSON`;

    try {
        // Simulate loading time for smooth UX
        await new Promise(resolve => setTimeout(resolve, 1500));

        const response = await fetch(url);
        if (!response.ok) throw new Error('NASA API error');
        const result = await response.json();

        // Extract the first date's values
        const dateKey = Object.keys(result.properties.parameter.T2M)[0];
        const t2m = result.properties.parameter.T2M[dateKey];
        const prec = result.properties.parameter.PRECTOTCORR[dateKey];
        const ws10m = result.properties.parameter.WS10M[dateKey];

        // Probability calculations based on thresholds (adjust for your needs)
        return {
            temperature: {
                veryHotProbability: t2m >= 30 ? 80 : t2m >= 25 ? 50 : 10,
                veryColdProbability: t2m <= 5 ? 80 : t2m <= 15 ? 50 : 10,
                historical: [t2m]
            },
            precipitation: {
                veryWetProbability: prec >= 10 ? 80 : prec >= 3 ? 40 : 10,
                historical: [prec]
            },
            wind: {
                veryWindyProbability: ws10m >= 10 ? 70 : ws10m >= 5 ? 40 : 10,
                historical: [ws10m]
            },
            comfortIndex: {
                veryUncomfortableProbability:
                    (t2m >= 30 || t2m <= 5 || prec >= 10 || ws10m >= 10) ? 80 : 20,
                historical: [t2m, prec, ws10m]
            }
        };
    } catch (error) {
        // On error, fallback to simulation for a seamless demo
        const fallbackMonth = selectedDate.getMonth() + 1;
        const fallbackDay = selectedDate.getDate();
        return simulateWeatherProbabilityData(lat, lng, fallbackMonth, fallbackDay);
    }
}

/**
 * Simulates weather probability data for demonstration
 */
function simulateWeatherProbabilityData(lat, lng, month, day) {
    const isNorthernHemisphere = lat > 0;
    const summerMonths = isNorthernHemisphere ? [6, 7, 8] : [12, 1, 2];
    const winterMonths = isNorthernHemisphere ? [12, 1, 2] : [6, 7, 8];
    const equatorialRegion = Math.abs(lat) < 23.5;
    const polarRegion = Math.abs(lat) > 66.5;

    let hotProbability = 0, coldProbability = 0;
    if (equatorialRegion) {
        hotProbability = 60 + Math.random() * 30;
        coldProbability = Math.random() * 10;
    } else if (polarRegion) {
        hotProbability = Math.random() * 20;
        coldProbability = 50 + Math.random() * 40;
    } else {
        if (summerMonths.includes(month)) {
            hotProbability = 30 + Math.random() * 40;
            coldProbability = Math.random() * 15;
        } else if (winterMonths.includes(month)) {
            hotProbability = Math.random() * 15;
            coldProbability = 30 + Math.random() * 40;
        } else {
            hotProbability = 10 + Math.random() * 30;
            coldProbability = 10 + Math.random() * 30;
        }
    }

    let wetProbability;
    if (Math.abs(lat) < 10) {
        wetProbability = 40 + Math.random() * 40;
    } else if ((Math.abs(lat) > 15 && Math.abs(lat) < 35) && (Math.abs(lng) > 0 && Math.abs(lng) < 30)) {
        wetProbability = Math.random() * 20;
    } else {
        wetProbability = 20 + Math.random() * 30;
    }

    let windyProbability;
    const likelyCoastal = Math.random() > 0.5;
    if (likelyCoastal) {
        windyProbability = 30 + Math.random() * 40;
    } else {
        windyProbability = 10 + Math.random() * 30;
    }

    const veryUncomfortableProbability = (
        (hotProbability > 70 || coldProbability > 70) ?
        Math.max(hotProbability, coldProbability) * 0.8 :
        ((hotProbability + coldProbability) / 2) * 0.5
    ) + (wetProbability * 0.3) + (windyProbability * 0.3);

    const temperatureHistorical = generateHistoricalData(50, 90, 30);
    const precipitationHistorical = generateHistoricalData(0, 50, 30);
    const windHistorical = generateHistoricalData(0, 30, 30);
    const comfortHistorical = generateHistoricalData(0, 100, 30);

    return {
        temperature: {
            veryHotProbability: Math.round(hotProbability),
            veryColdProbability: Math.round(coldProbability),
            historical: temperatureHistorical
        },
        precipitation: {
            veryWetProbability: Math.round(wetProbability),
            historical: precipitationHistorical
        },
        wind: {
            veryWindyProbability: Math.round(windyProbability),
            historical: windHistorical
        },
        comfortIndex: {
            veryUncomfortableProbability: Math.round(veryUncomfortableProbability),
            historical: comfortHistorical
        }
    };
}

/**
 * Generates random historical data for charting
 */
function generateHistoricalData(min, max, count) {
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push(min + Math.random() * (max - min));
    }
    return data;
}