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
        // CourtFlow 3.0 - Premium Palette (Playtomic-Inspired)
        'deep-navy': '#0A1628',
        'dark-navy': '#0F1F3A',
        'midnight': '#1A2942',
        'electric-lime': '#C4FF0D',
        'lime-glow': '#DCFF4D',
        'soft-white': '#F8F9FA',
        'muted-gray': '#8B95A5',
        'success-green': '#00D084',
        'warning-orange': '#FF6B35',
        'error-red': '#FF4757',
        // Aliases for convenience
        'primary': '#C4FF0D', // electric lime
        'accent': '#00D084',  // success green
      },
      borderRadius: {
        'xl-plus': '20px',
        '2xl-plus': '24px',
        '3xl-plus': '32px',
      },
      fontWeight: {
        'heavy': '800',
        'bold-plus': '700',
      },
    },
  },
  plugins: [],
};
export default config;
