import { fecthWeatherApi } from "../service/fecthWeatherApi";
import React, { useState, useEffect } from "react";

export function WeatherData() {
  const [weatherData, setWeatherData] = useState();

  useEffect(() => {
    const handleSearch = async () => {
      try {
        const data = await fecthWeatherApi();
        setWeatherData(data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };
    handleSearch();
  }, []);

return (
  <div className="weather-widget-container">
    <div className="weather-widget">
      {weatherData ? (
        <>
          <img
            src={`https://openweathermap.org/img/wn/${weatherData.icon}.png`}
            alt="weather-icon"
            className="weather-icon"
          />
          <div className="weather-info">
            <p className="weather-temp">{weatherData.temp}</p>
            <p className="weather-main">{weatherData.main}</p>
            <p className="weather-location">
              {weatherData.name} | {weatherData.country}
            </p>
          </div>
        </>
      ) : (
        <p className="weather-loading">Carregando clima...</p>
      )}
    </div>
  </div>
);

}
