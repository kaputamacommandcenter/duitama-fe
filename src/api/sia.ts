// src/api/sia.ts
import axios from "axios"

export const sia = axios.create({
  baseURL: "https://restapi.kaputama.ac.id/public",
  // baseURL: "http://localhost/endpoint-sia/public",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-API-KEY": "INI_API_KEY_RAHASIA_ANDA_12345",
  },
})
