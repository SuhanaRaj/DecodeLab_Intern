import { API_KEY } from "../config/config.js";

async function fetchWeather(city) {

    const url =
        // `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}`;
        `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city},India`

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Unable to fetch weather");
    }

    const data = await response.json();

console.log(data);

    return {
        city: data.location.name,
        country: data.location.country,
        temperature: data.current.temp_c,
        humidity: data.current.humidity,
        wind: data.current.wind_kph,
        condition: data.current.condition.text
    };
}

export { fetchWeather };