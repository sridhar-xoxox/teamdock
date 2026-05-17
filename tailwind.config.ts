import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: '#f2faf5',
          100: '#e2f5eb',
          200: '#c4ebd6',
          300: '#96dcb6',
          400: '#60c48e',
          500: '#34a86d', // Apple Alpine Green Pro (Light Mode Tint)
          600: '#248a54', // Apple Alpine Green Pro (Dark Mode Tint)
          700: '#1e6e44',
          800: '#1b5837',
          900: '#17492f',
          950: '#0b2819',
        },
        slate: {
          // Apple Native System Grays (Light & Dark Mode matching iOS/macOS spec)
          50: '#f2f2f7',  // Apple Gray 6 (Light)
          100: '#e5e5ea', // Apple Gray 5 (Light)
          200: '#d1d1d6', // Apple Gray 4 (Light)
          300: '#c7c7cc', // Apple Gray 3 (Light)
          400: '#aeaeab', // Apple Gray 2 (Light)
          500: '#8e8e93', // Apple Gray (Standard)
          600: '#636366', // Apple Gray 2 (Dark)
          700: '#48484a', // Apple Gray 3 (Dark)
          800: '#3a3a3c', // Apple Gray 4 (Dark)
          900: '#2c2c2e', // Apple Gray 5 (Dark - Card Base)
          950: '#1c1c1e', // Apple Gray 6 (Dark - Base Canvas)
        },
        stone: {
          // Warm Apple Gray alternative (iOS/macOS System Gray 6 & Grouped tones)
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
        indigo: {
          // Map default indigo classes directly to Apple Alpine Green for global support
          50: '#f2faf5',
          100: '#e2f5eb',
          200: '#c4ebd6',
          300: '#96dcb6',
          400: '#60c48e',
          500: '#34a86d', 
          600: '#248a54', 
          700: '#1e6e44',
          800: '#1b5837',
          900: '#17492f',
          950: '#0b2819',
        },
        cyan: {
          400: "#22d3ee",
          500: "#06b6d4",
        },
      },
      boxShadow: {
        glow: "0 0 20px rgba(36, 138, 84, 0.25)", // Apple Alpine Green glow
        "glow-sm": "0 0 10px rgba(36, 138, 84, 0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};

export default config;
