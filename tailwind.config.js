/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // プライマリーカラー
        'primary-gold': '#E6B964',
        'primary-green': '#2D4A3E',
        
        // セカンダリーカラー
        'dark': '#121212',
        'charcoal': '#1E1E1E',
        'light-gray': '#E0E0E0',
        
        // アクセントカラー
        'bright-gold': '#F7D380',
        'sage-green': '#7EA491',
        
        // 追加カラー
        'error': '#FF5252',
        'success': '#4CAF50',
        'overlay': 'rgba(0, 0, 0, 0.7)',
      },
      fontFamily: {
        'sans': ['Roboto', 'Noto Sans JP', 'sans-serif'],
        'display': ['Rajdhani', 'Montserrat', 'sans-serif'],
      },
      fontSize: {
        'heading-lg': '24px',
        'heading-md': '20px',
        'heading-sm': '16px',
        'body': '14px',
        'caption': '12px',
      },
      spacing: {
        '4': '4px',
        '8': '8px',
        '16': '16px',
        '24': '24px',
        '32': '32px',
        '48': '48px',
      },
      borderRadius: {
        'card': '8px',
        'full': '9999px',
      },
      boxShadow: {
        'card': '0 4px 8px rgba(0, 0, 0, 0.2)',
        'button': '0 2px 4px rgba(0, 0, 0, 0.3)',
        'floating': '0 8px 16px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'bounce-sm': 'bounce-sm 0.5s ease-in-out',
        'fade': 'fade 0.3s ease-in-out',
        'scale': 'scale 0.2s ease-in-out',
      },
      keyframes: {
        'bounce-sm': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
        'fade': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        'scale': {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      screens: {
        'xs': '375px',
        'sm': '576px',
        'md': '768px',
        'lg': '992px',
        'xl': '1200px',
      },
    },
  },
  plugins: [],
}
