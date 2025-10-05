# Weather Probability Dashboard

Welcome to the **Weather Probability Dashboard**, a web application developed for the NASA Space Apps Challenge 2025 by Team Ctrl Shift Elite. This project empowers users to plan outdoor activities with confidence by providing probabilistic weather insights using NASA Earth observation data.

## 🚀 Overview

Unlike traditional weather apps that only offer average conditions, our dashboard reveals the **likelihood of experiencing extreme weather events** (e.g., heatwaves, cold snaps, heavy rain, or strong winds) for any location and date. This "probability-first" approach helps users understand not just what is likely, but also what is *possible*, enabling better decisions for trips, events, and safety planning.

## 🌍 Features

- **Interactive Map:** Select any location worldwide by clicking on the map or searching for a place.
- **Date Selection:** Pick any calendar date for your forecast.
- **Weather Probabilities:** Instantly see the chance of very hot/cold temperatures, heavy precipitation, strong winds, and overall comfort index.
- **Historical Data Visualizations:** View line charts of past weather data for context.
- **Summary & Advice:** Get clear, actionable insights and planning tips for your chosen location and date.
- **Downloadable Data:** Export your results as CSV or JSON for further analysis or sharing.
- **Mobile Responsive:** Optimized for desktop and mobile devices.

## 🧑‍💻 How It Works

1. **User selects a location and date** via the map or search bar.
2. **NASA POWER API** is queried for historical weather data (temperature, precipitation, wind speed) for that location and date.
3. **Probabilities are calculated** for extreme events based on thresholds (e.g., "very hot" if temp > 30°C).
4. **Fallback simulation** is used if NASA API is unreachable, ensuring seamless user experience.
5. **Results are displayed** as probabilities, summaries, and interactive charts.
6. **Advice and download options** are provided based on the computed probabilities.

### Technology Stack

- **Frontend:** HTML, CSS, JavaScript
- **Mapping:** Leaflet.js
- **Charts:** Chart.js
- **Data Source:** [NASA POWER API](https://power.larc.nasa.gov/docs/)

## 🛰️ NASA Space Apps Challenge 2025: Problem & Solution

### The Problem

Traditional weather forecasts focus on averages and typical conditions, but:
- **Extreme events are often missed:** People don't know the *odds* of a heatwave, heavy rain, or sudden cold snap.
- **Poor context for planning:** Event organizers, travelers, and outdoor enthusiasts lack actionable risk assessments.
- **Global accessibility:** Many solutions are limited to specific regions or require paid services.

### Our Solution

The Weather Probability Dashboard:
- **Leverages global NASA satellite data** for any location on Earth.
- **Calculates and visualizes probabilities** of *extreme* weather events, not just averages.
- **Provides a comfort index** for overall outdoor suitability.
- **Enables rapid, accessible planning** for anyone—no registration or fees required.
- **Works seamlessly even with API outages** by simulating realistic fallback data.

#### What This Brings

- **Informed decision-making:** Know your *risk* before you go, not just the forecast.
- **Empowerment:** Individuals and communities can plan safer events, travel, and outdoor activities.
- **Scalable, open-source tool:** Freely usable and extendable for global needs.

## 📦 Getting Started

1. **Clone or download the repository**.
2. **Open `index.html` in your web browser.**
3. **Select a location and date, then click "Get Weather Probabilities".**
4. **Explore the results, download data, and plan with confidence!**

## 📝 Developer Notes

- All logic runs client-side; no backend required.
- NASA POWER API is used for real data; fallback logic ensures demo reliability.
- Contributions, forks, and suggestions are welcome!

## 📚 Resources

- [NASA POWER API Documentation](https://power.larc.nasa.gov/docs/)
- [Leaflet.js](https://leafletjs.com/)
- [Chart.js](https://www.chartjs.org/)

---

*Created for NASA Space Apps Challenge 2025 by Ctrl Shift Elite. Powered by open data, open science, and open minds!*