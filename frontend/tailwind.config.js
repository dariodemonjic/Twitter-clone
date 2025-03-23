import daisyui from "daisyui";

export default {
  content: ["./index.html", "./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [daisyui],

  daisyui: {
    themes: [
      "light",
      "dark",
      "night" ,// Default light theme
      {
        black: {
          "primary:" : "rgb(29, 155, 240)",
					"secondary":  "rgb(24, 24, 24)", // Dark background
          "accent": "#1d9bf0",
          "neutral": "#1a1a1a",
          "base-100": "#000000", // Base background
          "info": "#1d9bf0",
          "success": "#00ba7c",
          "warning": "#ffbe0b",
          "error": "#ff5861",
        },
      },
    ],
  },
};