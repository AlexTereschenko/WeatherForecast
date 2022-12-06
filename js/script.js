const currentSeason = ['winter', 'spring', 'summer', 'fall'][(Math.floor(((new Date()).getMonth()+1) / 3) % 4)];
document.getElementById('wrapper').style.backgroundImage = `url(img/backgrounds/${currentSeason}/${Math.ceil(Math.random()*6)}.jpeg)`;

const cityInputed = {'city': 'Cherkasy', 'country_code': 'ua'};
const cityField = document.querySelector('.js-city-input')
const starBtn = document.querySelector('.js-btn--star');
const loading = document.querySelector('.js-loading');

function loadingScreenToggler(show = true) {
    show ? loading.classList.remove('hide') : loading.classList.add('hide');
};

async function getCityName() {
    const cityName = localStorage.getItem('weather_forecast_cityInfo');
    btnStatusChecker();
    getWeather({city: JSON.parse(cityName).city, country_code: JSON.parse(cityName).country_code});
}

async function successGeo(position) {
    loadingScreenToggler();
    const LAT = position.coords.latitude;
    const LNG = position.coords.longitude;
        
    const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${LAT}+${LNG}&key=fd0569bbd4a64579b3d6ee148c0c3f84`)
    const cityInfo = await response.json(); 
    const path = cityInfo.results[0].components

    const city = path.city;
    const country_code = path.country_code;

    localStorage.setItem('weather_forecast_cityInfo', JSON.stringify({city, country_code}));
    btnStatusChecker();

    getWeather({'city': city, 'country_code': country_code});
    loadingScreenToggler(false);
}

function failedGeo(err) {
    loadingScreenToggler();
    alert(`${err.message}, please insert default city manually`)
    loadingScreenToggler(false);
}

async function getWeather({city, country_code}) {   
    loadingScreenToggler();
    try {
        const response = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city},${country_code}&APPID=4102b94822ffb28c717f40eabec24973`);
        const weatherInfo = await response.json(); 

        const pathMain = weatherInfo.main;
        const pathSys = weatherInfo.sys;
        const pathWeather = weatherInfo.weather[0];
        const pathWind = weatherInfo.wind;

        document.querySelector('.js-info').innerHTML = `${weatherInfo.name}, ${pathSys.country}`;
        document.querySelector('.js-temp').innerHTML = `${Math.round(pathMain.temp - 273.15)}°C`;
        document.querySelector('.js-feeks-like').innerHTML = `Feels like: ${Math.round(pathMain.feels_like - 273.15)}°C`;
        document.querySelector('.js-humidity').innerHTML = `Humidity: ${pathMain.humidity} %`;
        document.querySelector('.js-pressure').innerHTML = `Pressure: ${pathMain.pressure} Pa`;
        document.querySelector('.js-sunrise').innerHTML = `Sunrise: ${new Date(pathSys.sunrise*1000).getHours()}:${new Date(pathSys.sunrise*1000).getMinutes()}`;
        document.querySelector('.js-sunset').innerHTML = `Sunset: ${new Date(pathSys.sunset*1000).getHours()}:${new Date(pathSys.sunset*1000).getMinutes()}`;
        document.querySelector('.js-status').innerHTML = `${[...pathWeather.description][0].toUpperCase()}${[...pathWeather.description].slice(1,-1).join('')}`;
        document.querySelector('.js-icon').style = `background: url('http://openweathermap.org/img/wn/${pathWeather.icon}@2x.png') no-repeat 50% 50%; background-color: #ffffff7b; background-size: 4rem 4rem;`;
        document.querySelector('.js-arrow').style  = `transform: translate(-50%, -50%) rotate(${pathWind.deg}deg);`;
        document.querySelector('.js-speed').innerHTML = `Wind speed: ${pathWind.speed} m/s`;
        document.querySelector('.js-gust').innerHTML = `Gust: ${pathWind.gust} m/s`;

        loadingScreenToggler(false);
    } catch (error) {
        alert('Inputed city does not exist or is entered incorrectly, try adding the country code through a comma, e.g "Cherkasy, UA"')
        cityField.value = 'Cherkasy, ua'
        getWeather({'city': 'Cherkasy', 'country_code': 'ua'});
    }     
}

function btnStatusChecker() {
    const cityName = localStorage.getItem('weather_forecast_cityInfo');
    if (cityName) {
        starBtn.classList.add('btn--saved');
        cityField.value = `${JSON.parse(cityName).city}, ${JSON.parse(cityName).country_code}`;
    } else {
        starBtn.classList.remove('btn--saved');
    };
};


localStorage.getItem('weather_forecast_cityInfo') ? getCityName() : navigator.geolocation.getCurrentPosition(successGeo, failedGeo);

cityField.addEventListener('input', function() {
    cityInputed.city = cityField.value.split(',')[0];
    cityInputed.country_code = cityField.value.split(',')[1] || '';
})

formElem.addEventListener('submit', async (e) => {
    e.preventDefault();

    getWeather(cityInputed);
})

starBtn.addEventListener('click', () => {
    if (starBtn.classList.contains('btn--saved')) {
        localStorage.removeItem('weather_forecast_cityInfo');
    }
    if (!starBtn.classList.contains('btn--saved') && cityField.value) {
        localStorage.setItem('weather_forecast_cityInfo', JSON.stringify(cityInputed));
        getWeather(cityInputed);
        cityField.value = `${cityInputed.city}, ${cityInputed.country_code}`;
    }

    btnStatusChecker();
});