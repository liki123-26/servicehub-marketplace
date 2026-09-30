/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
          light: '#3B82F6',
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
        },
        accent: {
          DEFAULT: '#14B8A6',
          dark: '#0F766E',
          light: '#2DD4BF',
          50: '#F0FDFA',
          100: '#CCFBF1',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
        },
        text: {
          main: '#0F172A',
          muted: '#64748B',
          light: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
        card: '0 4px 6px -1px rgba(15, 23, 42, 0.04), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
        elevated: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
      }
    },
  },
  plugins: [],
}
