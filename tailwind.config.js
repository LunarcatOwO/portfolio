/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'text': '#ffffff',
        'bounding-box': '#1c1319', // Changed from blue-gray to dark pink-tinted
        'background': '#000000',
        'primary': '#ff80b3', // More vibrant pink
        'secondary': '#b3005f', // Deeper pink instead of dark red
        'accent': '#ff3399', // Bright pink instead of bright red
        'contentBorder': '#ff80b311', // Added pink tint
        'contentBackground': '#ff80b309', // Added pink tint
        'rustPrimary': "#F74C00",
        'rustSecondary': "#2A3439",
        'typescriptPrimary': "#3178C6",
        'typescriptSecondary': "#FFFFFF",
        'pythonPrimary': "#306998",
        'pythonSecondary': "#FFD43B",
      },
    animation: {
      'border': 'border 4s linear infinite',
      'bounce-perlin': 'bouncePerlin 6s ease-in-out infinite',
    },
    backgroundImage: {
      'grainy': "url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 600 600%27%3E%3Cfilter id=%27a%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency='.65' numOctaves='3' stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23a)%27/%3E%3C/svg%3E')",
    },
    backgroundSize: {
      'grainy': '182px',
    },
    opacity: {
      12: '0.12', // Custom opacity scale
    },
  keyframes: {
      'border': {
          to: { '--border-angle': '360deg' },
      },
      bouncePerlin: {
        '0%, 100%': { transform: 'translateX(0)' },
        '50%': { transform: 'translateX(50px)' }, // Adjust the 50px as per your needs
      },
    }
  },
  },
  plugins: [
    require('postcss-import'), // Correct plugin syntax as an array
  ],
}