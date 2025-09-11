// Wait for the entire HTML document to be loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURATION ---
    // Personalize your page here
    const yourName = "Casey"; // Change this to your name!
    
    // --- OpenWeatherMap API Configuration ---
    // ⚠️ PASTE YOUR API KEY BETWEEN THE QUOTES
    const apiKey = '1b5a36e10312f87e6562274efe87d867'; 
    
    // Coordinates for Monroe, Washington, USA
    const lat = 47.8554;
    const lon = -121.9723;


    // --- CLOCK WIDGET ---
    const clockElement = document.getElementById('clock');

    function updateClock() {
        const now = new Date();
        // Options to format the time, e.g., "11:58 AM"
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
        // Use a regex to remove the space before AM/PM for a cleaner look
        clockElement.textContent = now.toLocaleTimeString('en-US', timeOptions).replace(' ', '');
    }


    // --- GREETING WIDGET ---
    const greetingElement = document.getElementById('greeting');

    function setGreeting() {
        const hour = new Date().getHours();
        let greeting;
        if (hour >= 5 && hour < 12) {
            greeting = "Good morning";
        } else if (hour >= 12 && hour < 18) {
            greeting = "Good afternoon";
        } else {
            greeting = "Good evening";
        }
        greetingElement.textContent = `${greeting}, ${yourName}.`;
    }


    // --- WEATHER WIDGET ---
    const weatherElement = document.getElementById('weather');
    const forecastElement = document.getElementById('forecast');

    async function getWeather() {
        // Don't run if the API key is missing
        if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
            weatherElement.innerHTML = `<p style="font-size: 0.9rem; color: #ffcc00;">Please add your OpenWeatherMap API key to script.js</p>`;
            return;
        }

        // Construct the API URL with your location, key, and desired units
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

        try {
            const response = await fetch(url);
            // Handle HTTP errors like 401 (invalid key) or 404 (not found)
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${errorData.message || response.statusText}`);
            }
            const data = await response.json();

            // Extract the relevant data
            const icon = data.weather[0].icon;
            const temp = Math.round(data.main.temp);
            const description = data.weather[0].description;
            const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`; // Use @2x for better resolution

            // Create the HTML to display the weather
            weatherElement.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <img src="${iconUrl}" alt="${description}" style="height: 40px; width: 40px;">
                    <span style="font-size: 1.1rem;">${temp}°F, ${description}</span>
                </div>
            `;

        } catch (error) {
            console.error("Error fetching weather:", error);
            weatherElement.innerHTML = `<p style="font-size: 0.9rem; color: #ff6b6b;">Could not fetch weather. ${error.message}</p>`;
        }
    }

    async function getForecast() {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();

        // Group by day
        const days = {};
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const day = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
            if (!days[day]) days[day] = [];
            days[day].push(item);
        });

        // Get daily averages and icons
        const forecastHtml = Object.entries(days).slice(0, 5).map(([day, items]) => {
            const temps = items.map(i => i.main.temp);
            const avgTemp = Math.round(temps.reduce((a, b) => a + b, 0) / temps.length);
            const icon = items[0].weather[0].icon;
            const desc = items[0].weather[0].main;
            return `
                <div class="forecast-day">
                    <div>${day}</div>
                    <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}" title="${desc}">
                    <div>${avgTemp}°F</div>
                </div>
            `;
        }).join('');
        forecastElement.innerHTML = `<div class="forecast-container">${forecastHtml}</div>`;
    }


    // --- INITIALIZE ALL WIDGETS ---
    setGreeting();
    updateClock();
    getWeather(); // Fetch weather on page load
    getForecast();
    
    // Set intervals to update the data automatically
    setInterval(updateClock, 1000); // Update the clock every second
    setInterval(getWeather, 600000); // Update the weather every 10 minutes (600,000 ms)
    setInterval(getForecast, 600000);

    // Set focus to the search input box
    document.querySelector('#search-container input[name="q"]').focus();
});
