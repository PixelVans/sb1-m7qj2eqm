/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        fancy: ['"Playfair Display"', 'serif'],
        audiowide: ['Audiowide', 'cursive'],
        orbitron: ['Orbitron', 'sans-serif'],
        zenspot: ['Zen Dots', 'cursive'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
      keyframes: {
        bump: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
      },
      animation: {
        bump: 'bump 6s ease-in-out infinite',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-welcome': 'linear-gradient(to right, var(--tw-gradient-stops))',
        'gradient-card': 'linear-gradient(to bottom right, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'bottom-white': '0 2px 4px rgba(255, 255, 255, 0.2)',
        'card': '0 4px 6px -1px rgb(124 58 237 / 0.05), 0 2px 4px -2px rgb(124 58 237 / 0.05)',
      },
    },
  },
  plugins: [],
};
