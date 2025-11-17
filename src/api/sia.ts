// src/api/sia.ts
import axios from "axios"

export const sia = axios.create({
  baseURL: "https://restapi.kaputama.ac.id/",
  // baseURL: "http://localhost/endpoint-sia/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-API-KEY": "KAPUTAMA-SECRET-123",
  },
})
