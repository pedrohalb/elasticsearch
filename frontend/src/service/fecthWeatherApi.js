import axios from "axios";

const weatherApi = "251598e425749e34363acf7f3c7ac605";
const apiURL = "https://api.openweathermap.org/data/2.5/weather?";

function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocalização não suportada."));
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => reject(err)
    );
  });
}

function traduzirClima(main, description) {
  const traducoes = {
    Clear: "Céu limpo",
    Clouds: "Nublado",
    Rain: "Chuva",
    Drizzle: "Garoa",
    Thunderstorm: "Trovoadas",
    Snow: "Neve",
    Mist: "Névoa",
    Smoke: "Fumaça",
    Haze: "Neblina",
    Dust: "Poeira",
    Fog: "Nevoeiro",
    Sand: "Areia",
    Ash: "Cinzas",
    Squall: "Rajada",
    Tornado: "Tornado",
  };

  const descricaoTraduzida = traducoes[main] || description;
  return (
    descricaoTraduzida.charAt(0).toUpperCase() + descricaoTraduzida.slice(1)
  );
}

async function fecthWeatherApi() {
  try {
    const [lat, lon] = await getCurrentLocation();
    const url = `${apiURL}lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${weatherApi}`;
    const response = await axios.get(url);

    const main = response.data.weather[0].main;
    const description = response.data.weather[0].description;

    return {
      temp: Math.round(response.data.main.temp) + " C°",
      main: traduzirClima(main, description),
      country: response.data.sys.country,
      name: response.data.name,
      description: description,
      icon: response.data.weather[0].icon,
    };
  } catch (error) {
    console.error("Erro ao buscar dados do clima:", error);
    throw error;
  }
}

export { fecthWeatherApi };
