// Weather codes from Open-Meteo → icon + description
const WEATHER_CODES = {
  0:  { icon: '☀️', en: 'Clear sky',        it: 'Cielo sereno' },
  1:  { icon: '🌤️', en: 'Mainly clear',     it: 'Prevalentemente sereno' },
  2:  { icon: '⛅', en: 'Partly cloudy',    it: 'Parzialmente nuvoloso' },
  3:  { icon: '☁️', en: 'Overcast',         it: 'Nuvoloso' },
  45: { icon: '🌫️', en: 'Foggy',            it: 'Nebbia' },
  48: { icon: '🌫️', en: 'Icy fog',          it: 'Nebbia gelata' },
  51: { icon: '🌦️', en: 'Light drizzle',    it: 'Pioggerella leggera' },
  53: { icon: '🌦️', en: 'Drizzle',          it: 'Pioggerella' },
  55: { icon: '🌧️', en: 'Heavy drizzle',    it: 'Pioggerella intensa' },
  61: { icon: '🌧️', en: 'Light rain',       it: 'Pioggia leggera' },
  63: { icon: '🌧️', en: 'Rain',             it: 'Pioggia' },
  65: { icon: '🌧️', en: 'Heavy rain',       it: 'Pioggia intensa' },
  71: { icon: '🌨️', en: 'Light snow',       it: 'Neve leggera' },
  73: { icon: '❄️', en: 'Snow',             it: 'Neve' },
  75: { icon: '❄️', en: 'Heavy snow',       it: 'Neve intensa' },
  80: { icon: '🌦️', en: 'Rain showers',     it: 'Rovesci' },
  81: { icon: '🌧️', en: 'Rain showers',     it: 'Rovesci moderati' },
  82: { icon: '⛈️', en: 'Heavy showers',    it: 'Rovesci intensi' },
  95: { icon: '⛈️', en: 'Thunderstorm',     it: 'Temporale' },
  96: { icon: '⛈️', en: 'Thunderstorm',     it: 'Temporale con grandine' },
  99: { icon: '⛈️', en: 'Thunderstorm',     it: 'Temporale con grandine intensa' },
};

async function fetchWeather(city) {
  const cacheKey = 'bluewelcome_weather';
  const cacheTime = 'bluewelcome_weather_ts';
  const now = Date.now();
  const cached = sessionStorage.getItem(cacheKey);
  const ts = parseInt(sessionStorage.getItem(cacheTime) || '0');

  // Cache for 30 minutes
  if (cached && now - ts < 30 * 60 * 1000) {
    return JSON.parse(cached);
  }

  try {
    // Step 1: geocode city to lat/lon
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );
    const geoData = await geoRes.json();
    if (!geoData.results || geoData.results.length === 0) return null;

    const { latitude, longitude } = geoData.results[0];

    // Step 2: get current weather
    const wxRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
    );
    const wxData = await wxRes.json();
    const current = wxData.current;

    const result = {
      temp: Math.round(current.temperature_2m),
      code: current.weather_code,
    };

    sessionStorage.setItem(cacheKey, JSON.stringify(result));
    sessionStorage.setItem(cacheTime, String(now));
    return result;
  } catch {
    return null;
  }
}

function renderWeatherWidget(weatherData, lang) {
  const widget = document.createElement('div');
  widget.className = 'weather-widget';

  if (!weatherData) {
    widget.classList.add('hidden');
    return widget;
  }

  const info = WEATHER_CODES[weatherData.code] || { icon: '🌡️', en: '', it: '' };
  const desc = lang === 'it' ? info.it : info.en;

  const icon = document.createElement('span');
  icon.className = 'weather-widget__icon';
  icon.textContent = info.icon;

  const temp = document.createElement('span');
  temp.className = 'weather-widget__temp';
  temp.textContent = `${weatherData.temp}°C`;

  const description = document.createElement('span');
  description.className = 'weather-widget__desc';
  description.textContent = desc;

  widget.appendChild(icon);
  widget.appendChild(temp);
  widget.appendChild(description);

  return widget;
}
