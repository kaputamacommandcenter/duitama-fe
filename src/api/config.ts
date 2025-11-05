// src/api/config.ts
import axios from "axios"

export const api = axios.create({
  baseURL: "https://be-duitama.kaputama.ac.id/api/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})
