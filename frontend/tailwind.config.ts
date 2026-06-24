import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        // BurgReport named palette (existing components use these directly)
        ink: '#0F0A0B',
        surface: '#171014',
        elevated: '#211720',
        line: '#332331',
        gold: '#C9986A',
        wine: '#9B2D4A',
        cream: '#F5F0F0',
        hint: '#847079',
        success: '#5DBA83',
        danger: '#D46A6A',
        // shadcn/ui semantic tokens (so v0-generated components resolve + stay on-brand)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
        serif: ['var(--font-cinzel)', 'Cinzel', 'Georgia', 'serif'],
        display: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif']
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
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        marquee: 'marquee 32s linear infinite',
        pulseGlow: 'pulseGlow 3.5s ease-in-out infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [tailwindcssAnimate]
};

export default config;
