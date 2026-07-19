// Grab the elements we need from the page
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const resultBox = document.getElementById('result');

// Weather codes mapped to emoji + text
const weatherCodeMap = {
  0: { icon: '☀️', text: 'Clear sky' },
  1: { icon: '🌤️', text: 'Mainly clear' },
  2: { icon: '⛅', text: 'Partly cloudy' },
  3: { icon: '☁️', text: 'Overcast' },
  45: { icon: '🌫️', text: 'Fog' },
  48: { icon: '🌫️', text: 'Fog' },
  51: { icon: '🌦️', text: 'Light drizzle' },
  61: { icon: '🌧️', text: 'Light rain' },
  63: { icon: '🌧️', text: 'Rain' },
  65: { icon: '🌧️', text: 'Heavy rain' },
  71: { icon: '🌨️', text: 'Light snow' },
  80: { icon: '🌦️', text: 'Rain showers' },
  95: { icon: '⛈️', text: 'Thunderstorm' }
};

async function getWeather() {
  const city = cityInput.value.trim();

  if (city === '') {
    resultBox.innerHTML = '<p class="message">Please type a city name first.</p>';
    return;
  }

  resultBox.innerHTML = '<div class="loader"></div>';

  try {
    // STEP 1: City name -> latitude & longitude
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    );
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      resultBox.innerHTML = '<p class="message">City not found. Try another spelling.</p>';
      return;
    }

    const place = geoData.results[0];
    const { latitude, longitude, name, country } = place;

    // STEP 2: lat/lon -> current weather
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`
    );
    const weatherData = await weatherRes.json();
    const current = weatherData.current;

    const codeInfo = weatherCodeMap[current.weather_code] || { icon: '🌡️', text: 'Weather' };

    // STEP 3: Show it on the page
    resultBox.innerHTML = `
      <div class="weather-icon">${codeInfo.icon}</div>
      <div class="temp">${Math.round(current.temperature_2m)}°C</div>
      <div class="city-name">${name}, ${country}</div>
      <div class="condition">${codeInfo.text}</div>

      <div class="details">
        <div class="detail-item">
          <div class="detail-label">Humidity</div>
          <div class="detail-value">${current.relative_humidity_2m}%</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Wind</div>
          <div class="detail-value">${current.wind_speed_10m} km/h</div>
        </div>
      </div>
    `;

  } catch (error) {
    resultBox.innerHTML = '<p class="message">Something went wrong. Please try again.</p>';
    console.error(error);
  }
}

searchBtn.addEventListener('click', getWeather);

cityInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    getWeather();
  }
});