import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0F0A0B',
        surface: '#171014',
        elevated: '#211720',
        line: '#332331',
        gold: '#C9986A',
        wine: '#9B2D4A',
        cream: '#F5F0F0',
        muted: '#B7A8AF',
        hint: '#847079',
        success: '#5DBA83',
        danger: '#D46A6A'
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(201, 152, 106, 0.18), 0 28px 90px rgba(155, 45, 74, 0.18)',
        card: '0 24px 70px rgba(0,0,0,0.35)'
      },
      backgroundImage: {
        'gold-wine': 'linear-gradient(135deg, #C9986A 0%, #9B2D4A 100%)',
        'terminal-grid': 'linear-gradient(rgba(201,152,106,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(201,152,106,0.05) 1px, transparent 1px)'
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '0.95' }
        }
      },
      animation: {
        marquee: 'marquee 32s linear infinite',
        pulseGlow: 'pulseGlow 3.5s ease-in-out infinite'
      }
    }
  },
  plugins: []
};

export default config;
