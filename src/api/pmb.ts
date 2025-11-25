import axios from "axios"

export const pmb = axios.create({
  baseURL: "https://pmb.kaputama.ac.id/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-API-KEY": "ckidmaxmGnGwa5wP9YK04niegP7uhSU4Mul6ElXaB2ik6sVttW20BCQRdHG",
  },
})
