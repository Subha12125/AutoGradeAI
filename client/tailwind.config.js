/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#2563eb",
        "primary-container": "#1d4ed8",
        "primary-fixed": "#dbeafe",
        "primary-fixed-dim": "#bfdbfe",
        "on-primary": "#ffffff",
        "on-primary-container": "#ffffff",
        "on-primary-fixed": "#1e3a8a",
        "on-primary-fixed-variant": "#1d4ed8",

        "secondary": "#7c3aed",
        "secondary-container": "#6d28d9",
        "secondary-fixed": "#ede9fe",
        "secondary-fixed-dim": "#ddd6fe",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#ffffff",
        "on-secondary-fixed": "#4c1d95",
        "on-secondary-fixed-variant": "#5b21b6",

        "tertiary": "#06b6d4",
        "tertiary-container": "#0891b2",
        "tertiary-fixed": "#cffafe",
        "tertiary-fixed-dim": "#a5f3fc",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#ffffff",
        "on-tertiary-fixed": "#164e63",
        "on-tertiary-fixed-variant": "#155e75",

        "success": "#10b981",
        "on-success": "#ffffff",
        "success-container": "#d1fae5",
        "on-success-container": "#065f46",

        "warning": "#f59e0b",
        "on-warning": "#ffffff",
        "warning-container": "#fef3c7",
        "on-warning-container": "#92400e",

        "error": "#ef4444",
        "on-error": "#ffffff",
        "error-container": "#fee2e2",
        "on-error-container": "#991b1b",

        "background": "#f8fafc",
        "surface": "#ffffff",
        "surface-bright": "#ffffff",
        "surface-dim": "#f1f5f9",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f8fafc",
        "surface-container": "#f1f5f9",
        "surface-container-high": "#e2e8f0",
        "surface-container-highest": "#cbd5e1",
        "surface-variant": "#f1f5f9",
        "surface-tint": "#2563eb",

        "on-background": "#0f172a",
        "on-surface": "#0f172a",
        "on-surface-variant": "#475569",
        "inverse-surface": "#0f172a",
        "inverse-on-surface": "#f8fafc",
        "inverse-primary": "#93c5fd",

        "outline": "#94a3b8",
        "outline-variant": "#e2e8f0"
      },
      fontFamily: {
        headline: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
        label: ["Inter", "sans-serif"],
        manrope: ["Manrope", "sans-serif"],
      },
    },
  },
  plugins: [],
}
