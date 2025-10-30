import type { Config } from 'tailwindcss'
import daisyui from 'daisyui'

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        duitama: {
          primary: '#2563eb',     // biru korporat
          secondary: '#7dd3fc',   // biru muda
          accent: '#38bdf8',      // biru cerah
          neutral: '#1e293b',     // abu tua
          'base-100': '#ffffff',  // dasar putih
        },
      },
      'light',
      'dark',
    ],
  },
} satisfies Config
