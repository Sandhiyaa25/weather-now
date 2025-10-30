import React, { useState, useRef } from "react";
import "./App.css";
import {
  WiDaySunny,
  WiCloudy,
  WiRain,
  WiThunderstorm,
  WiSnow,
  WiStrongWind,
  WiHumidity,
} from "react-icons/wi";
import { AiOutlineClose } from "react-icons/ai";
import { BiSearch } from "react-icons/bi";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [bgVideo, setBgVideo] = useState("/default.mp4");
  const [showSearch, setShowSearch] = useState(false);
  const inputRef = useRef(null);
  // suggestion bar
  const [suggestions, setSuggestions] = useState([]);



  // ✅ Open-Meteo Weather Code Mapping
  const mapWeatherCode = (code) => {
    const mapping = {
      0: { text: "Clear Sky", icon: <WiDaySunny size={70} color="#FFD93D" /> },
      1: { text: "Mostly Clear", icon: <WiDaySunny size={70} color="#FFD93D" /> },
      2: { text: "Partly Cloudy", icon: <WiCloudy size={70} color="#9BB0FF" /> },
      3: { text: "Overcast", icon: <WiCloudy size={70} color="#9BB0FF" /> },
      45: { text: "Fog", icon: <WiCloudy size={70} color="#A8B1C8" /> },
      48: { text: "Depositing Rime Fog", icon: <WiCloudy size={70} color="#A8B1C8" /> },
      51: { text: "Light Drizzle", icon: <WiRain size={70} color="#A1C4FD" /> },
      53: { text: "Moderate Drizzle", icon: <WiRain size={70} color="#7FB5FF" /> },
      55: { text: "Dense Drizzle", icon: <WiRain size={70} color="#7FB5FF" /> },
      61: { text: "Slight Rain", icon: <WiRain size={70} color="#7FB5FF" /> },
      63: { text: "Moderate Rain", icon: <WiRain size={70} color="#7FB5FF" /> },
      65: { text: "Heavy Rain", icon: <WiRain size={70} color="#7FB5FF" /> },
      71: { text: "Slight Snowfall", icon: <WiSnow size={70} color="#CFEFFF" /> },
      73: { text: "Moderate Snowfall", icon: <WiSnow size={70} color="#CFEFFF" /> },
      75: { text: "Heavy Snowfall", icon: <WiSnow size={70} color="#CFEFFF" /> },
      80: { text: "Light Rain Showers", icon: <WiRain size={70} color="#7FB5FF" /> },
      81: { text: "Moderate Rain Showers", icon: <WiRain size={70} color="#7FB5FF" /> },
      82: { text: "Violent Rain Showers", icon: <WiRain size={70} color="#7FB5FF" /> },
      95: { text: "Thunderstorm", icon: <WiThunderstorm size={70} color="#FFD86B" /> },
      96: { text: "Thunderstorm with Light Hail", icon: <WiThunderstorm size={70} color="#FFD86B" /> },
      99: { text: "Thunderstorm with Heavy Hail", icon: <WiThunderstorm size={70} color="#FFD86B" /> },
    };
    return mapping[code] || { text: "Unknown", icon: <WiCloudy size={70} color="#9BB0FF" /> };
  };

  // 🎥 Dynamic video selection
 const getVideo = (text) => {
  const t = text.toLowerCase();

  // ☀️ Sunny / Clear
  if (
    t.includes("clear") ||
    t.includes("sun") ||
    t.includes("bright") ||
    t.includes("hot")
  )
    return "/sunny.mp4";

  // ☁️ Cloudy / Overcast / Fog / Haze
  if (
    t.includes("cloud") ||
    t.includes("fog") ||
    t.includes("mist") ||
    t.includes("haze") ||
    t.includes("overcast") ||
    t.includes("smog")
  )
    return "/clouds.mp4";

  // 🌧️ Rain / Drizzle / Shower
  if (
    t.includes("rain") ||
    t.includes("drizzle") ||
    t.includes("shower") ||
    t.includes("wet") ||
    t.includes("pour")
  )
    return "/rain.mp4";

  // ❄️ Snow / Sleet
  if (
    t.includes("snow") ||
    t.includes("flurry") ||
    t.includes("sleet") ||
    t.includes("blizzard") ||
    t.includes("ice")
  )
    return "/snow.mp4";

  // ⛈️ Thunder / Storm
  if (
    t.includes("thunder") ||
    t.includes("storm") ||
    t.includes("lightning") ||
    t.includes("tempest")
  )
    return "/storm.mp4";

  // 🌫️ Fallback (unknown weather)
  return "/default.mp4";
};

  // 🌤️ Fetch precise weather
  const getWeather = async () => {
    try {
      setError("");
      setWeather(null);

      if (!city.trim()) {
        setError("Please enter a city name");
        return;
      }

      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      );
      const geoData = await geoRes.json();
      if (!geoData.results?.length) {
        setError("City not found");
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weathercode,wind_speed_10m`
      );
      const data = await weatherRes.json();
      const cw = data.current;
      const mapped = mapWeatherCode(cw.weathercode);

      setBgVideo(getVideo(mapped.text));

      setWeather({
        city: `${name}, ${country}`,
        temperature: Math.round(cw.temperature_2m),
        windspeed: Math.round(cw.wind_speed_10m),
        humidity: cw.relative_humidity_2m,
        precipitation: cw.precipitation,
        conditionText: mapped.text,
        conditionIcon: mapped.icon,
        date: new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      });
    } catch (err) {
      console.error(err);
      setError("Failed to fetch weather data ❌");
    }
  };

// ❌ Clear input
const clearInput = () => {
  setCity("");
  setWeather(null);
  setError("");
  inputRef.current?.focus();
};

// 🧠 Fetch city suggestions (add this below clearInput)
const fetchCitySuggestions = async (query) => {
  if (query.length < 3) {
    setSuggestions([]);
    return;
  }

  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
    );
    const data = await res.json();
    if (data.results) {
      setSuggestions(data.results.map((r) => `${r.name}, ${r.country}`));
    } else {
      setSuggestions([]);
    }
  } catch {
    setSuggestions([]);
  }
};

  

  const onKeyDown = (e) => e.key === "Enter" && getWeather();

  return (
    <div className="app">
      <video key={bgVideo} autoPlay loop muted className="bg-video">
        <source src={bgVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="weather-container">
        {!showSearch && !weather && (
          <div className="intro-card fadeIn">
            <h2>Your Daily Window to the World's Weather</h2>
            <p>Let Us Be Your Weather Whisperer.</p>
            <button
              className="main-btn"
              onClick={() => {
                setShowSearch(true);
                setTimeout(() => inputRef.current?.focus(), 200);
              }}
            >
              Explore Weather
            </button>
          </div>
        )}

        {showSearch && (
          <div className="search-row">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search city..."
              value={city}
             // onChange={(e) => setCity(e.target.value)}
             onChange={(e) => {
  const value = e.target.value;
  setCity(value);
  fetchCitySuggestions(value);
}}

              onKeyDown={onKeyDown}
            />

          {suggestions.length > 0 && (
  <ul className="suggestions-list">
    {suggestions.map((s, i) => (
      <li
        key={i}
        onClick={() => {
          setCity(s.split(",")[0]);
          setSuggestions([]);
        }}
      >
        {s}
      </li>
    ))}
  </ul>
)}

    
            <div className="search-icons">
              {city && (
                <button className="icon-btn" onClick={clearInput}>
                  <AiOutlineClose size={32} />
                </button>
              )}
              <button className="icon-btn" onClick={getWeather}>
                <BiSearch size={32} />
              </button>
            </div>
          </div>
        )}

        {error && <p className="error">{error}</p>}

        {weather && (
          <div className="weather-card fadeIn">
            <div className="top">
              {weather.conditionIcon}
              <div className="loc">
                <h2>{weather.city}</h2>
                <p className="date">{weather.date}</p>
              </div>
            </div>

            <h1 className="temp">{weather.temperature}°C</h1>
            <p className="condition-text">{weather.conditionText}</p>

            <div className="stats">
              <div className="stat">
                <WiStrongWind size={26} />
                <span>{weather.windspeed} km/h</span>
                <p>Wind</p>
              </div>
              <div className="stat">
                <WiHumidity size={26} />
                <span>{weather.humidity}%</span>
                <p>Humidity</p>
              </div>
              <div className="stat">
                <WiRain size={26} />
                <span>{weather.precipitation} mm</span>
                <p>Precipitation</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
