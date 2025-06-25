import axios from "axios";
const apiURL = "http://localhost:8080/v1/search?query=";

async function fetchApi(q, page) {
  const p = "&page=" + page;
  try {
    const response = await axios.get(apiURL + q + p);
    console.log("API DATA:", response.data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export { fetchApi };
