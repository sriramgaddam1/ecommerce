import axios from "axios";

/* ✅ BACKEND BASE URL FROM ENV */
const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

/* ❌ REMOVE AUTH HEADER BY DEFAULT */
delete API.defaults.headers.common["Authorization"];

export default API;
