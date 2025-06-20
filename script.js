const key = 'b94660cef6f25dc4e211265ba1679e6c';
const cityName1 = "Rivne";
const mainTemp = document.getElementById("main_temp");
const feels_like = document.getElementById("feels_like");
const city = document.getElementById("city");
const date = document.getElementById("date");
const suunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");
const duration = document.getElementById("duration");
const weatherIcon = document.getElementById("weather_icon");
const description = document.getElementById("description_today");
const forecastContainer = document.getElementById("hourly_forecast");
const btn_5_day_forecast = document.getElementById("btn_5_day_forecast")
const nearbyCities = ["Dubno", "Lutsk", "Gorodok", "Obariv"];
const nearbyContainer = document.createElement('div');
nearbyContainer.style.display = 'flex';

main(cityName1)
function main(cityName) {
    $.ajax({
        type: "GET",
        url: `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${key}`,
        success: function (geoResponse) {
            if (geoResponse && geoResponse.length > 0) {
                const { lat, lon } = geoResponse[0];
                renderNearbyPlacesByCoords(lat, lon, cityName);

                $.ajax({
                    type: "GET",
                    url: `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`,
                    success: function (currentWeather) {
                        renderCurrentWeather(currentWeather);

                        $.ajax({
                            type: "GET",
                            url: `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${key}&units=metric`,
                            success: async function (forecastData) {
                                console.log(forecastData)
                                await renderHourlyForecast(forecastData.list);
                            },
                            error: function (error) {
                                console.error("Hourly Forecast API Error:", error);
                            }
                        });
                    },
                    error: function (error) {
                        console.error("Current Weather API Error:", error);
                    }
                });
            } else {
                console.error("No location data found for the specified city.");
            }
        },
        error: function (geoError) {
            console.error("Geocoding API Error:", geoError);
        }
    }
    )
};

function mapOWMtoWI(iconCode, isDay) {
    const map = {
        '01d': 'wi-day-sunny',
        '01n': 'wi-night-clear',
        '02d': 'wi-day-cloudy',
        '02n': 'wi-night-alt-cloudy',
        '03d': 'wi-cloud',
        '03n': 'wi-cloud',
        '04d': 'wi-cloudy',
        '04n': 'wi-cloudy',
        '09d': 'wi-showers',
        '09n': 'wi-showers',
        '10d': 'wi-day-rain',
        '10n': 'wi-night-alt-rain',
        '11d': 'wi-thunderstorm',
        '11n': 'wi-thunderstorm',
        '13d': 'wi-snow',
        '13n': 'wi-snow',
        '50d': 'wi-fog',
        '50n': 'wi-fog',
    };
    return map[iconCode] || 'wi-na';
}

function renderCurrentWeather(currentWeather) {
    const today = new Date();
    const sunriseTimestamp = currentWeather.sys.sunrise;
    const sunsetTimestamp = currentWeather.sys.sunset;
    const sunriseDate = new Date(sunriseTimestamp * 1000);
    const sunsetDate = new Date(sunsetTimestamp * 1000);
    mainTemp.textContent = `${Math.round(currentWeather.main.temp)}°C`;
    feels_like.textContent = `Feels like: ${Math.round(currentWeather.main.feels_like)}°C`;
    city.textContent = currentWeather.name;
    date.textContent = today.toLocaleDateString();
    suunrise.textContent = `Sunrise: ${sunriseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    sunset.textContent = `Sunset: ${sunsetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    description.textContent = currentWeather.weather[0].main;
    const dayDuration = sunsetTimestamp - sunriseTimestamp;
    const hours = Math.floor(dayDuration / 3600);
    const minutes = Math.floor((dayDuration % 3600) / 60);
    duration.textContent = `Duration: ${hours}h ${minutes}m`;
    const iconCode = currentWeather.weather[0].icon;
    const iconElem = document.getElementById("weather_icon");
    if (iconElem) {
        iconElem.outerHTML = `<i id="weather_icon" class="wi ${mapOWMtoWI(iconCode, true)} sunny_first_block" title="${currentWeather.weather[0].description}"></i>`;
    }
}
async function renderHourlyForecast(hourlyData) {
    forecastContainer.innerHTML = `<div>
    <h3>Hourly</h3>
    <div style="height: 60px;"></div>
    <h5>Forecast</h5>
    <h5>Temp(°С)</h5>
    <h5>RealFeel</h5>
    <h5>Wind(km/h)</h5>
    </div>`;

    for (let index = 0; index < 12; index++) {
        const iconCode = hourlyData[index].weather[0].icon;
        let do_time = hourlyData[index].dt_txt;
        let ne_time = do_time.split(" ");
        let ttt = ne_time[1].split(":");
        forecastContainer.innerHTML += `<div class="forecast">
        <h3>${ttt[0]}.00</h3>
        <div><i class="wi ${mapOWMtoWI(iconCode, true)} icon-forecast" title="${hourlyData[index].weather[0].description}"></i></div>
        <h5>${hourlyData[index].weather[0].main}</h5>
        <h5>${hourlyData[index].main.temp}</h5>
        <h5>${hourlyData[index].main.feels_like}</h5>
        <h5>${hourlyData[index].wind.speed} km/h</h5>
        </div>`
    }
}
function EnterHandler(event) {
    console.log(event)
    if (event.key != "Enter") {
        return
    }
    let input_search = document.getElementById("searchcity").value
    main(input_search)

}

document.addEventListener('DOMContentLoaded', () => {
    const mainThird = document.getElementById('main-third');
    if (mainThird) {
        const oldNearby = mainThird.querySelectorAll('.nearby_places');
        oldNearby.forEach(el => el.parentNode.removeChild(el));
        mainThird.appendChild(nearbyContainer);
        renderNearbyPlaces(cityName1);
    }
});

function renderNearbyPlaces(baseCity) {
    nearbyContainer.innerHTML = '';
    nearbyCities.forEach(city => {
        $.ajax({
            type: "GET",
            url: `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}&units=metric`,
            success: function (data) {
                const iconCode = data.weather[0].icon;
                const temp = Math.round(data.main.temp);
                const weatherMain = data.weather[0].main;
                const placeDiv = document.createElement('div');
                placeDiv.className = 'nearby_places';
                placeDiv.innerHTML = `
                    <p>${city}</p>
                    <div><i class="wi ${mapOWMtoWI(iconCode, true)} icon-nearby" title="${weatherMain}"></i></div>
                    <p>${temp}°C</p>
                `;
                nearbyContainer.appendChild(placeDiv);
            },
            error: function () {
                const placeDiv = document.createElement('div');
                placeDiv.className = 'nearby_places';
                placeDiv.innerHTML = `<p>${city}</p><div><i class="wi wi-na icon-nearby"></i></div><p>--°C</p>`;
                nearbyContainer.appendChild(placeDiv);
            }
        });
    });
}

function renderNearbyPlacesByCoords(lat, lon, excludeCity) {
    nearbyContainer.innerHTML = '';
    $.ajax({
        type: "GET",
        url: `https://api.openweathermap.org/data/2.5/find?lat=${lat}&lon=${lon}&cnt=10&units=metric&appid=${key}`,
        success: function (data) {
            if (!data.list || data.list.length === 0) {
                nearbyContainer.innerHTML = '<p>No nearby places found.</p>';
                return;
            }
            const nearby = data.list.filter(c => c.name.toLowerCase() !== excludeCity.toLowerCase()).slice(0, 4);
            if (nearby.length === 0) {
                nearbyContainer.innerHTML = '<p>No nearby places found.</p>';
                return;
            }
            nearby.forEach(cityObj => {
                const iconCode = cityObj.weather[0].icon;
                const temp = Math.round(cityObj.main.temp);
                const weatherMain = cityObj.weather[0].main;
                const placeDiv = document.createElement('div');
                placeDiv.className = 'nearby_places';
                placeDiv.innerHTML = `
                    <p>${cityObj.name}</p>
                    <div><i class="wi ${mapOWMtoWI(iconCode, true)} icon-nearby" title="${weatherMain}"></i></div>
                    <p>${temp}°C</p>
                `;
                nearbyContainer.appendChild(placeDiv);
            });
        },
        error: function () {
            nearbyContainer.innerHTML = '<p>Could not load nearby places.</p>';
        }
    });
}


