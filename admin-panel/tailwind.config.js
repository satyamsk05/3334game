/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        text: {
          primary: '#f5f5f5',
          secondary: '#a3a3a3',
          tertiary: '#737373',
          inverse: '#0a0a0a',
        },
        surface: {
          base: '#000000',
          raised: '#141416',
          strong: '#1f1f22',
          muted: '#0a0a0b',
        },
        border: {
          default: '#2a2a2e',
          muted: '#1c1c1f',
        },
        accent: {
          primary: '#2988ff',
        },
        status: {
          positive: '#22c55e',
          negative: '#fb7185',
          warning: '#f59e0b',
        },
      },
      spacing: {
        'space-1': '2px',
        'space-2': '4px',
        'space-3': '8px',
        'space-4': '12px',
        'space-5': '16px',
        'space-6': '20px',
        'space-7': '24px',
        'space-8': '32px',
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
      },
      fontSize: {
        xs: ['12px', { lineHeight: '18px' }],
        sm: ['13px', { lineHeight: '19.5px' }],
        md: ['14px', { lineHeight: '21px' }],
        lg: ['16px', { lineHeight: '24px' }],
        xl: ['18px', { lineHeight: '27px' }],
        '2xl': ['22px', { lineHeight: '30px' }],
        '3xl': ['28px', { lineHeight: '36px' }],
        '4xl': ['34px', { lineHeight: '42px' }],
      },
      fontFamily: {
        mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'Roboto Mono', 'Menlo', 'monospace'],
        sans: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'Roboto Mono', 'Menlo', 'monospace'],
      },
      transitionDuration: {
        instant: '100ms',
        fast: '150ms',
        normal: '200ms',
      },
    },
  },
  plugins: [],
};
