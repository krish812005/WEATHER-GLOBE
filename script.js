const API_KEY = "5a75a5cb41474b1ca54192709260901";
const BASE_URL = "https://api.weatherapi.com/v1/current.json";

/* =====================
   DOM ELEMENTS
===================== */

const globeContainer = document.getElementById("globe-container");
const input = document.getElementById("locationInput");
const searchBtn = document.getElementById("searchBtn");
const weatherCard = document.getElementById("weather");
const loader = document.getElementById("loader");
const errorBox = document.getElementById("error");

/* =====================
   PLACE DATA (LABELS)
===================== */

const countries = [
  { lat: 20, lng: 78, text: "India", size: 2.6 },
  { lat: 37, lng: -95, text: "United States", size: 2.6 },
  { lat: 56, lng: -106, text: "Canada", size: 2.6 }
];

const majorCities = [
  { lat: 28.61, lng: 77.20, text: "Delhi", size: 1.8 },
  { lat: 40.71, lng: -74.00, text: "New York", size: 1.8 },
  { lat: 35.68, lng: 139.69, text: "Tokyo", size: 1.8 }
];

const cities = [
  { lat: 12.97, lng: 77.59, text: "Bengaluru", size: 1.3 },
  { lat: 19.07, lng: 72.87, text: "Mumbai", size: 1.3 },
  { lat: 22.57, lng: 88.36, text: "Kolkata", size: 1.3 }
];

/* =====================
   GLOBE INITIALIZATION
===================== */

const globe = Globe()(globeContainer)
  .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
  .backgroundImageUrl("https://unpkg.com/three-globe/example/img/night-sky.png")
  .showAtmosphere(true)
  .atmosphereAltitude(0.25)
  .enablePointerInteraction(true) // 🔥 REQUIRED FOR CLICK
  .labelLat(d => d.lat)
  .labelLng(d => d.lng)
  .labelText(d => d.text)
  .labelSize(d => d.size)
  .labelResolution(4)
  .labelColor(() => "rgba(255,255,255,0.95)")
  .pointOfView({ lat: 20, lng: 0, altitude: 2.6 });

function resizeGlobe() {
  globe.width(window.innerWidth).height(window.innerHeight);
}
resizeGlobe();
window.addEventListener("resize", resizeGlobe);

/* =====================
   ZOOM-BASED LABELS
===================== */

function updateLabels() {
  const z = globe.pointOfView().altitude;

  if (z > 2.4) globe.labelsData(countries);
  else if (z > 1.8) globe.labelsData(majorCities);
  else globe.labelsData(cities);
}

globe.onZoom(updateLabels);
updateLabels();

/* =====================
   SMOOTH ZOOM
===================== */

function zoomTo(lat, lng) {
  globe.pointOfView({ lat, lng, altitude: 1.2 }, 1200);
}

/* =====================
   🔥 CLICK → WEATHER (FIXED)
===================== */

globe.onGlobeClick(({ lat, lng }) => {
  console.log("Clicked:", lat, lng); // debug-safe
  zoomTo(lat, lng);
  fetchWeatherByCoords(lat, lng);
});

/* =====================
   SEARCH
===================== */

searchBtn.onclick = () => {
  if (input.value.trim()) fetchWeatherByCity(input.value.trim());
};

input.addEventListener("keydown", e => {
  if (e.key === "Enter" && input.value.trim()) {
    fetchWeatherByCity(input.value.trim());
  }
});

/* =====================
   WEATHER FETCHING
===================== */

async function fetchWeatherByCity(city) {
  fetchWeather(`${city}`);
}

async function fetchWeatherByCoords(lat, lng) {
  fetchWeather(`${lat},${lng}`);
}

async function fetchWeather(query) {
  showLoader();

  try {
    const res = await fetch(
      `${BASE_URL}?key=${API_KEY}&q=${query}&aqi=yes`
    );
    const data = await res.json();
    if (data.error) throw "error";

    updateUI(data);
    showWeather();
  } catch {
    showError();
  }
}

/* =====================
   UI
===================== */

function updateUI(data) {
  place.innerText = `${data.location.name}, ${data.location.country}`;
  time.innerText = data.location.localtime;
  temp.innerText = `${data.current.temp_c}°`;
  condition.innerText = data.current.condition.text;
  icon.src = data.current.condition.icon;
  humidity.innerText = `${data.current.humidity}%`;
  wind.innerText = `${data.current.wind_kph} km/h`;
  aqi.innerText = data.current.air_quality["us-epa-index"];
}

function showLoader() {
  loader.classList.remove("hidden");
  weatherCard.classList.add("hidden");
  errorBox.classList.add("hidden");
}

function showWeather() {
  loader.classList.add("hidden");
  weatherCard.classList.remove("hidden");
}

function showError() {
  loader.classList.add("hidden");
  weatherCard.classList.add("hidden");
  errorBox.classList.remove("hidden");
}