// src/api/config.ts
import axios from "axios"

export const api = axios.create({
  baseURL: "https://be-duitama.kaputama.ac.id/api/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-API-KEY": "ckey_TZlsLgiC90mhmS7BMQVlKP6pDmQ0poFLjZexjhA8",
  },
})
