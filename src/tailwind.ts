import animate from 'tailwindcss-animate'
import defaultTheme from 'tailwindcss/defaultTheme.js'
import plugin from 'tailwindcss/plugin.js'
import type { PresetsConfig } from 'tailwindcss/types/config'

export default function (): PresetsConfig {
	return {
		darkMode: ['class'],
		theme: {
			container: {
				center: true,
				padding: '2rem',
				screens: {
					'2xl': '1400px',
				},
			},
			extend: {
				colors: {
					border: 'hsl(var(--border))',
					input: 'hsl(var(--input))',
					ring: 'hsl(var(--ring))',
					background: 'hsl(var(--background))',
					foreground: 'hsl(var(--foreground))',
					primary: {
						DEFAULT: 'hsl(var(--primary))',
						foreground: 'hsl(var(--primary-foreground))',
					},
					secondary: {
						DEFAULT: 'hsl(var(--secondary))',
						foreground: 'hsl(var(--secondary-foreground))',
					},
					destructive: {
						DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
						foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
					},
					muted: {
						DEFAULT: 'hsl(var(--muted))',
						foreground: 'hsl(var(--muted-foreground))',
					},
					accent: {
						DEFAULT: 'hsl(var(--accent))',
						foreground: 'hsl(var(--accent-foreground))',
					},
					popover: {
						DEFAULT: 'hsl(var(--popover))',
						foreground: 'hsl(var(--popover-foreground))',
					},
					card: {
						DEFAULT: 'hsl(var(--card))',
						foreground: 'hsl(var(--card-foreground))',
					},
				},
				borderRadius: {
					xl: 'calc(var(--radius) + 4px)',
					lg: 'var(--radius)',
					md: 'calc(var(--radius) - 2px)',
					sm: 'calc(var(--radius) - 4px)',
				},
				fontFamily: {
					sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
				},
				keyframes: {
					'caret-blink': {
						'0%,70%,100%': { opacity: '1' },
						'20%,50%': { opacity: '0' },
					},
				},
				animation: {
					'caret-blink': 'caret-blink 1.25s ease-out infinite',
				},
			},
		},
		plugins: [
			animate,
			plugin(({ addBase }) => {
				addBase({
					':root': {
						'--background': '0 0% 100%',
						'--foreground': '240 10% 3.9%',
						'--card': '0 0% 100%',
						'--card-foreground': '240 10% 3.9%',
						'--popover': '0 0% 100%',
						'--popover-foreground': '240 10% 3.9%',
						'--primary': '240 5.9% 10%',
						'--primary-foreground': '0 0% 98%',
						'--secondary': '240 4.8% 95.9%',
						'--secondary-foreground': '240 5.9% 10%',
						'--muted': '240 4.8% 95.9%',
						'--muted-foreground': '240 3.8% 46.1%',
						'--accent': '240 4.8% 95.9%',
						'--accent-foreground': '240 5.9% 10%',
						'--destructive': '0 72.22% 50.59%',
						'--destructive-foreground': '0 0% 98%',
						'--border': '240 5.9% 90%',
						'--input': '240 5.9% 90%',
						'--ring': '240 5% 64.9%',
						'--radius': '0.5rem',
						'--chart-1': '12 76% 61%',
						'--chart-2': '173 58% 39%',
						'--chart-3': '197 37% 24%',
						'--chart-4': '43 74% 66%',
						'--chart-5': '27 87% 67%',

						'--font-sans': 'Geist Sans',
					},

					'.dark': {
						'--background': '240 10% 3.9%',
						'--foreground': '0 0% 98%',
						'--card': '240 10% 3.9%',
						'--card-foreground': '0 0% 98%',
						'--popover': '240 10% 3.9%',
						'--popover-foreground': '0 0% 98%',
						'--primary': '0 0% 98%',
						'--primary-foreground': '240 5.9% 10%',
						'--secondary': '240 3.7% 15.9%',
						'--secondary-foreground': '0 0% 98%',
						'--muted': '240 3.7% 15.9%',
						'--muted-foreground': '240 5% 64.9%',
						'--accent': '240 3.7% 15.9%',
						'--accent-foreground': '0 0% 98%',
						'--destructive': '0 62.8% 30.6%',
						'--destructive-foreground': ' 0 85.7% 97.3%',
						'--border': '240 3.7% 15.9%',
						'--input': '240 3.7% 15.9%',
						'--ring': '240 4.9% 83.9%',
						'--chart-1': '220 70% 50%',
						'--chart-2': '160 60% 45%',
						'--chart-3': '30 80% 55%',
						'--chart-4': '280 65% 60%',
						'--chart-5': '340 75% 55%',
					},
				})

				addBase({
					'*': {
						'@apply border-border': {},
					},
					body: {
						'@apply bg-background text-foreground': {},
						'font-feature-settings': `"rlig" 1, "calt" 1`,
					},
				})
			}),
		],
	}
}
