const key = 'b94660cef6f25dc4e211265ba1679e6c';
const cityName1 = "Rivne";
const forecastContainer = document.getElementById("forecast_5day_container");
main(cityName1);

function main(cityName) {
    $.ajax({
        type: "GET",
        url: `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${key}`,
        success: function (geoResponse) {
            if (geoResponse && geoResponse.length > 0) {
                const { lat, lon } = geoResponse[0];
                $.ajax({
                    type: "GET",
                    url: `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=metric`,
                    success: function (forecastData) {
                        render5DayForecast(forecastData.list);
                    },
                    error: function (error) {
                        console.error("5-Day Forecast API Error:", error);
                    }
                });
            } else {
                console.error("No location data found for the specified city.");
            }
        },
        error: function (geoError) {
            console.error("Geocoding API Error:", geoError);
        }
    });
}

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

function render5DayForecast(hourlyList) {
    const days = {};
    hourlyList.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!days[date]) days[date] = [];
        days[date].push(item);
    });
    const dayKeys = Object.keys(days).slice(0, 5);
    forecastContainer.innerHTML = '';
    dayKeys.forEach(date => {
        const dayData = days[date];
        const midday = dayData[Math.floor(dayData.length / 2)];
        const iconCode = midday.weather[0].icon;
        const weatherMain = midday.weather[0].main;
        const temps = dayData.map(d => d.main.temp);
        const feels = dayData.map(d => d.main.feels_like);
        const wind = dayData.map(d => d.wind.speed);
        const minTemp = Math.round(Math.min(...temps));
        const maxTemp = Math.round(Math.max(...temps));
        const avgFeel = Math.round(feels.reduce((a, b) => a + b, 0) / feels.length);
        const avgWind = Math.round(wind.reduce((a, b) => a + b, 0) / wind.length);
        forecastContainer.innerHTML += `
        <div class="forecast" style="min-width: 160px;">
            <h3>${date}</h3>
            <div><i class="wi ${mapOWMtoWI(iconCode, true)} icon-forecast" title="${weatherMain}"></i></div>
            <h5>${weatherMain}</h5>
            <h5>${minTemp}°C / ${maxTemp}°C</h5>
            <h5>RealFeel: ${avgFeel}°C</h5>
            <h5>Wind: ${avgWind} km/h</h5>
        </div>
        `;
    });
}

function EnterHandler(event) {
    if (event.key != "Enter") return;
    let input_search = document.getElementById("searchcity").value;
    main(input_search);
} 