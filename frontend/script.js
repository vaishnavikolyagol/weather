// Deployment Consideration: 
// For local development, this defaults to localhost:5000/api.
// When deploying to Render, the window.location.hostname will be the deployed frontend domain (Vercel/GitHub Pages),
// so it will fall back to the live backend URL.
// PLEASE REPLACE 'https://your-production-backend.onrender.com/api' below with the actual Render deployment URL.
const getApiBaseUrl = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5000/api';
    } else {
        // REPLACE THIS URL WITH ACTUAL BACKEND DEPLOYMENT URL ON RENDER
        return 'https://weather-api-bva3.onrender.com/api';
    }
};

const API_BASE_URL = getApiBaseUrl();

// --- DOM References ---
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');
const weatherCard = document.getElementById('weather-card');
const appBody = document.getElementById('app-body');

const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const weatherCondition = document.getElementById('weather-condition');
const weatherIcon = document.getElementById('weather-icon');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');

const unitToggle = document.getElementById('unit-toggle');
const tempUnitLabel = document.getElementById('temp-unit');
const celsiusLabel = document.querySelector('.celsius');
const fahrenheitLabel = document.querySelector('.fahrenheit');

const historyList = document.getElementById('history-list');
const historyLoader = document.getElementById('history-loader');

// --- State Variables ---
let currentTempCelsius = null;
let currentWindMs = null; // OpenWeatherMap returns wind speed in m/s for metric
let isFahrenheit = false;

// --- Event Listeners ---
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) fetchWeather(city);
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) fetchWeather(city);
    }
});

unitToggle.addEventListener('change', (e) => {
    isFahrenheit = e.target.checked;
    updateUnits();
});

// --- Main API Calls ---
async function fetchWeather(city) {
    showLoader(true);
    hideError();
    weatherCard.classList.add('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/weather?city=${encodeURIComponent(city)}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch weather data');
        }

        updateWeatherUI(data);
        fetchHistory(); // Refresh recent searches automatically
    } catch (error) {
        showError(error.message);
    } finally {
        showLoader(false);
    }
}

async function fetchHistory() {
    try {
        historyLoader.classList.remove('hidden');
        const response = await fetch(`${API_BASE_URL}/history`);

        if (!response.ok) {
            throw new Error('Could not retrieve history data');
        }

        const data = await response.json();
        renderHistory(data);
    } catch (error) {
        console.error('Failed to fetch history:', error);
        // Only show a minimal fallback for history error so it doesn't interrupt usage
        if (historyList.children.length === 0) {
            historyList.innerHTML = '<li class="history-item"><span style="opacity:0.7">API unavailable. Running locally? Check console.</span></li>';
        }
    } finally {
        historyLoader.classList.add('hidden');
    }
}

// --- UI Updates ---
function updateWeatherUI(data) {
    cityName.textContent = data.city;
    currentTempCelsius = data.temperature;
    currentWindMs = data.windSpeed;
    weatherCondition.textContent = data.condition;
    humidity.textContent = `${data.humidity}%`;

    // Determine the icon code from condition 
    let iconCode = mapConditionToIcon(data.condition.toLowerCase());
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    // Dynamic background Update
    updateBackground(data.condition.toLowerCase());

    // Sync unit toggle
    updateUnits();

    // Animate display
    weatherCard.classList.remove('hidden');

    // Clear the input
    cityInput.value = '';
}

function updateUnits() {
    if (currentTempCelsius === null) return;

    if (isFahrenheit) {
        const tempF = (currentTempCelsius * 9 / 5) + 32;
        temperature.textContent = Math.round(tempF);
        tempUnitLabel.textContent = '°F';

        // Convert wind speed to mph
        const windMph = currentWindMs * 2.23694;
        windSpeed.textContent = `${windMph.toFixed(1)} mph`;

        celsiusLabel.classList.remove('active');
        fahrenheitLabel.classList.add('active');
    } else {
        temperature.textContent = Math.round(currentTempCelsius);
        tempUnitLabel.textContent = '°C';
        windSpeed.textContent = `${currentWindMs.toFixed(1)} m/s`;

        celsiusLabel.classList.add('active');
        fahrenheitLabel.classList.remove('active');
    }

    // Update history list units as well if it's currently rendered
    fetchHistory();
}

function renderHistory(history) {
    historyList.innerHTML = '';

    if (!history || history.length === 0) {
        historyList.innerHTML = '<li class="history-item"><span style="opacity:0.7">No recent searches</span></li>';
        return;
    }

    history.forEach(item => {
        const li = document.createElement('li');
        li.className = 'history-item';

        let displayTemp = item.temperature;
        let ext = 'C';
        if (isFahrenheit) {
            displayTemp = (item.temperature * 9 / 5) + 32;
            ext = 'F';
        }

        li.innerHTML = `
            <div class="history-item-info">
                <span class="history-city">${item.city}</span>
                <span class="history-desc">${item.condition}</span>
            </div>
            <span class="history-temp">${Math.round(displayTemp)}°${ext}</span>
        `;

        // Make item clickable to trigger the specific search
        li.addEventListener('click', () => {
            fetchWeather(item.city);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        historyList.appendChild(li);
    });
}

// --- Utility Functions ---
function showLoader(show) {
    if (show) {
        loader.classList.remove('hidden');
    } else {
        loader.classList.add('hidden');
    }
}

function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.remove('hidden');
    // Hide error automatically after 4 seconds
    setTimeout(() => {
        hideError();
    }, 4000);
}

function hideError() {
    errorMessage.classList.add('hidden');
}

// Simple deterministic mapping based on string keywords commonly returned by OpenWeatherMap API
function mapConditionToIcon(condition) {
    if (condition.includes('clear')) return '01d';
    if (condition.includes('cloud')) return '03d'; // scattered/broken clouds
    if (condition.includes('rain')) return '10d';
    if (condition.includes('drizzle')) return '09d';
    if (condition.includes('thunderstorm') || condition.includes('storm')) return '11d';
    if (condition.includes('snow')) return '13d';
    // mist, smoke, haze, dust, fog, sand, ash, squall, tornado
    return '50d';
}

function updateBackground(condition) {
    appBody.className = ''; // wipe background classes

    if (condition.includes('clear')) appBody.classList.add('clear');
    else if (condition.includes('cloud')) appBody.classList.add('clouds');
    else if (condition.includes('rain')) appBody.classList.add('rain');
    else if (condition.includes('snow')) appBody.classList.add('snow');
    else if (condition.includes('thunderstorm') || condition.includes('storm')) appBody.classList.add('thunderstorm');
    else if (condition.includes('drizzle')) appBody.classList.add('drizzle');
    // falls back to the default CSS linear gradient if none match
}

// Ensure history loads when page initializes
document.addEventListener('DOMContentLoaded', () => {
    fetchHistory();
});
