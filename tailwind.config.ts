import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}", // Ook lib scannen
  ],
  theme: {
    extend: {
      colors: {
        // CourtFlow Brand Colors (from logo)
        'courtflow': {
          'navy': '#1e3a5f',
          'green': '#00d084',
          'orange': '#ff6b35',
        },
        // Override default blue with our brand colors
        'primary': '#00d084', // green
        'accent': '#ff6b35',  // orange
      },
    },
  },
  plugins: [],
};
export default config;
