import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'sans': ['Montserrat', 'sans-serif'],
				'serif': ['Crimson Pro', 'serif'],
				'inter': ['Inter', 'sans-serif'],
				'poppins': ['Poppins', 'sans-serif'],
				'roboto': ['Roboto', 'sans-serif'],
				'open-sans': ['Open Sans', 'sans-serif'],
				'lato': ['Lato', 'sans-serif'],
				'source-sans-pro': ['Source Sans Pro', 'sans-serif'],
				'nunito': ['Nunito', 'sans-serif'],
				'raleway': ['Raleway', 'sans-serif'],
				'work-sans': ['Work Sans', 'sans-serif'],
				'dm-sans': ['DM Sans', 'sans-serif'],
				'plus-jakarta-sans': ['Plus Jakarta Sans', 'sans-serif'],
				'playfair-display': ['Playfair Display', 'serif'],
				'merriweather': ['Merriweather', 'serif'],
				'lora': ['Lora', 'serif'],
				'source-serif-pro': ['Source Serif Pro', 'serif'],
				'crimson-text': ['Crimson Text', 'serif'],
				'libre-baskerville': ['Libre Baskerville', 'serif'],
				'eb-garamond': ['EB Garamond', 'serif'],
				'oswald': ['Oswald', 'sans-serif'],
				'bebas-neue': ['Bebas Neue', 'sans-serif'],
				'righteous': ['Righteous', 'sans-serif'],
				'fredoka-one': ['Fredoka One', 'sans-serif'],
				'lobster': ['Lobster', 'cursive'],
				'dancing-script': ['Dancing Script', 'cursive'],
				'jetbrains-mono': ['JetBrains Mono', 'monospace'],
				'source-code-pro': ['Source Code Pro', 'monospace'],
				'fira-code': ['Fira Code', 'monospace'],
				'space-mono': ['Space Mono', 'monospace'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				// Optimized organic floating cloud animations with reduced movement
				'cloud-float-1': {
					'0%, 100%': { 
						transform: 'translate3d(0px, 0px, 0px) scale(1)',
						opacity: '0.15'
					},
					'25%': { 
						transform: 'translate3d(20px, -15px, 0px) scale(1.1)',
						opacity: '0.2'
					},
					'50%': { 
						transform: 'translate3d(35px, 10px, 0px) scale(0.9)',
						opacity: '0.12'
					},
					'75%': { 
						transform: 'translate3d(15px, 30px, 0px) scale(1.05)',
						opacity: '0.18'
					}
				},
				'cloud-float-2': {
					'0%, 100%': { 
						transform: 'translate3d(0px, 0px, 0px) scale(0.95)',
						opacity: '0.18'
					},
					'33%': { 
						transform: 'translate3d(-25px, 20px, 0px) scale(1.15)',
						opacity: '0.25'
					},
					'66%': { 
						transform: 'translate3d(30px, -12px, 0px) scale(0.85)',
						opacity: '0.15'
					}
				},
				'cloud-float-3': {
					'0%, 100%': { 
						transform: 'translate3d(0px, 0px, 0px) scale(1.05)',
						opacity: '0.14'
					},
					'20%': { 
						transform: 'translate3d(12px, -20px, 0px) scale(0.95)',
						opacity: '0.2'
					},
					'40%': { 
						transform: 'translate3d(-18px, -15px, 0px) scale(1.2)',
						opacity: '0.1'
					},
					'60%': { 
						transform: 'translate3d(-28px, 15px, 0px) scale(0.9)',
						opacity: '0.16'
					},
					'80%': { 
						transform: 'translate3d(8px, 35px, 0px) scale(1.1)',
						opacity: '0.12'
					}
				},
				'cloud-float-4': {
					'0%, 100%': { 
						transform: 'translate3d(0px, 0px, 0px) scale(0.9)',
						opacity: '0.16'
					},
					'30%': { 
						transform: 'translate3d(28px, 18px, 0px) scale(1.15)',
						opacity: '0.22'
					},
					'70%': { 
						transform: 'translate3d(-20px, -25px, 0px) scale(0.8)',
						opacity: '0.12'
					}
				},
				'cloud-float-5': {
					'0%, 100%': { 
						transform: 'translate3d(0px, 0px, 0px) scale(1)',
						opacity: '0.15'
					},
					'25%': { 
						transform: 'translate3d(-15px, -28px, 0px) scale(1.05)',
						opacity: '0.2'
					},
					'50%': { 
						transform: 'translate3d(25px, -8px, 0px) scale(0.95)',
						opacity: '0.1'
					},
					'75%': { 
						transform: 'translate3d(5px, 22px, 0px) scale(1.02)',
						opacity: '0.18'
					}
				},
				'cloud-float-6': {
					'0%, 100%': { 
						transform: 'translate3d(0px, 0px, 0px) scale(1)',
						opacity: '0.14'
					},
					'40%': { 
						transform: 'translate3d(-30px, 20px, 0px) scale(1.1)',
						opacity: '0.24'
					},
					'80%': { 
						transform: 'translate3d(25px, -30px, 0px) scale(0.9)',
						opacity: '0.08'
					}
				},
				'scroll-infinite': {
					'0%': { transform: 'translateX(0%)' },
					'100%': { transform: 'translateX(-50%)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				// Organic floating cloud animations
				'cloud-float-1': 'cloud-float-1 25s ease-in-out infinite',
				'cloud-float-2': 'cloud-float-2 30s ease-in-out infinite',
				'cloud-float-3': 'cloud-float-3 35s ease-in-out infinite',
				'cloud-float-4': 'cloud-float-4 28s ease-in-out infinite',
				'cloud-float-5': 'cloud-float-5 32s ease-in-out infinite',
				'cloud-float-6': 'cloud-float-6 27s ease-in-out infinite',
				'scroll-infinite': 'scroll-infinite 12s linear infinite'
			},
			perspective: {
				'1000': '1000px',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
