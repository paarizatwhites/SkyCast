const locSearch = document.getElementById('search-bar');
const suggestionBox = document.getElementById("suggestions");
const btn = document.getElementById('btn');
const errorMessage = document.getElementById('error-message');
const loadingMessage = document.getElementById('loading-message');
const cityName = document.getElementById('city-name');
const date = document.getElementById('date');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const condition = document.getElementById('condition');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');

const days = document.querySelectorAll('.forecast-day');
const icons = document.querySelectorAll('.forecast-icon');
const temps = document.querySelectorAll('.forecast-temp');


locSearch.addEventListener("input", async () => {
    const value = locSearch.value.trim();

    if (value.length < 2) {
        suggestionBox.innerHTML = "";
        return;
    }

    const results = await getSuggestion(value);

    if (!results || results.length === 0) {
        suggestionBox.innerHTML = "";
        return;
    }

    showSuggestions(results);
});

btn.addEventListener('click', ()=>{
       suggestionBox.innerHTML = "";
    getWeather();
    
});

locSearch.addEventListener('keydown', (event) => {
    if (event.key === "Enter") {
           suggestionBox.innerHTML = "";
        getWeather();
    }
});


function showSuggestions(list) {
    suggestionBox.innerHTML = "";

    list.forEach(item => {
        const div = document.createElement("div");
        div.textContent = item.name + ", " + item.country;

        div.addEventListener("click", () => {
            locSearch.value = item.name;
            suggestionBox.innerHTML = "";
            getWeather(item.name);
        });

        suggestionBox.appendChild(div);
    });
}


async function getSuggestion(query) {
    const res = await fetch(`https://api.weatherapi.com/v1/search.json?key=fff35253a3974b0f9c0113114260306&q=${query}`);
    const data = await res.json();
    return data || [];
}

      function getIcons(condition, isDay) {

            if (condition.includes("sunny") || condition.includes("clear")) {
                return isDay
                    ? "icons/clear-day.svg"
                    : "icons/clear-night.svg";
            }

            else if (condition.includes("partly cloudy")) {
                return isDay
                    ? "icons/partly-cloudy-day.svg"
                    : "icons/partly-cloudy-night.svg";
            }

            else if (condition.includes("cloudy")) {
                return "icons/cloudy.svg";
            }

            else if (condition.includes("overcast")) {
                return "icons/overcast.svg";
            }

            else if (condition.includes("mist") || condition.includes("haze")) {
                return "icons/mist.svg";
            }

            else if (condition.includes("fog")) {
                return "icons/fog.svg";
            }

            else if (condition.includes("drizzle")) {
                return "icons/drizzle.svg";
            }

            else if (condition.includes("rain")) {
                return "icons/rain.svg";
            }

            else if (condition.includes("snow") || condition.includes("blizzard")) {
                return "icons/snow.svg";
            }

            else if (condition.includes("thunder")) {
                return "icons/thunderstorms.svg";
            }

            else if (condition.includes("hail")) {
                return "icons/hail.svg";
            }

            else if (condition.includes("sleet")) {
                return "icons/sleet.svg";
            }

            else if (condition.includes("dust") || condition.includes("sand")) {
                return "icons/wind.svg";
            }

            return null;
        }

async function getWeather(searchQuery) {
    let inputValue = searchQuery || locSearch.value.trim();

    if (inputValue === "") return;

    loadingMessage.textContent = "Loading weather...";
    errorMessage.textContent = "";

    try {
        const url = `https://api.weatherapi.com/v1/forecast.json?key=fff35253a3974b0f9c0113114260306&q=${inputValue}&days=7&aqi=no&alerts=no`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            errorMessage.textContent = data.error.message;
            return;
        }

        cityName.textContent = data.location.name;

        const dt = new Date(data.location.localtime);

        date.textContent = dt.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric"
        });

        temperature.textContent = `${Math.round(data.current.temp_c)}°C`;
        condition.textContent = data.current.condition.text;



        const weatherCondition = data.current.condition.text.toLowerCase();
        const isDay = data.current.is_day;

        weatherIcon.src = getIcons(weatherCondition, isDay);

        feelsLike.textContent = `Feels like ${Math.round(data.current.feelslike_c)}°C`;
        humidity.textContent = `${Math.round(data.current.humidity)}%`;
        wind.textContent = `${Math.round(data.current.wind_kph)} km/h`;


        data.forecast.forecastday.forEach((item, i) => {
            const forecastDt = new Date(item.date);

            days[i].textContent = forecastDt.toLocaleDateString("en-US", {
                weekday: "short"
            });

            const forecastCondition = item.day.condition.text.toLowerCase();
            const forecastIsDay = true;

            icons[i].src = getIcons(forecastCondition, forecastIsDay);

            temps[i].textContent =
                `${Math.round(item.day.maxtemp_c)}° / ${Math.round(item.day.mintemp_c)}°`;
        });

    } catch (error) {
        errorMessage.textContent = "Something went wrong. Please try again.";
        console.log(error);
    } finally {
        loadingMessage.textContent = "";
    }
}


window.addEventListener("load", getCurrentLocation);

function getCurrentLocation() {
    if (!navigator.geolocation) {
        errorMessage.textContent = "Geolocation not supported by your browser";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            const location = `${latitude},${longitude}`;
            getWeather(location);
        },

        (error) => {
            if (error.code === 1) {
                errorMessage.textContent = "Location permission denied. Enter city manually.";
            } else {
                errorMessage.textContent = "Unable to get location.";
            }

            getWeather("Delhi");
        }
    );
}
document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-container")) {
        suggestionBox.innerHTML = "";
    }
});

setInterval(() => {
    getCurrentLocation();
}, 600000);