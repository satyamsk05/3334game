function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `color-mix(in srgb, var(${variableName}) calc(${opacityValue} * 100%), transparent)`;
    }
    return `var(${variableName})`;
  };
}

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
          primary: withOpacity('--text-primary'),
          secondary: withOpacity('--text-secondary'),
          tertiary: withOpacity('--text-tertiary'),
          inverse: withOpacity('--text-inverse'),
        },
        surface: {
          base: withOpacity('--surface-base'),
          raised: withOpacity('--surface-raised'),
          strong: withOpacity('--surface-strong'),
          muted: withOpacity('--surface-muted'),
          subtle: withOpacity('--surface-subtle'),
        },
        border: {
          default: withOpacity('--border-default'),
          subtle: withOpacity('--border-subtle'),
          strong: withOpacity('--border-strong'),
          focus: withOpacity('--border-focus'),
        },
        accent: {
          primary: withOpacity('--accent-primary'),
          dark: '#000000',
          blue: '#2563eb',
          emerald: '#10b981',
          orange: '#f59e0b',
          purple: '#7c3aed',
        },
        status: {
          positive: '#10b981',
          negative: '#f43f5e',
          warning: '#f59e0b',
          info: '#38bdf8',
        },
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '10px',
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
        full: '9999px',
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
      },
      fontFamily: {
        sans: [
          'var(--font-inter)',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Open Sans',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji',
        ],
        mono: ['SFMono-Regular', 'Roboto Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        '1': 'inset 0px 0px 0px 1px rgba(255, 255, 255, 0.08), 0px 2px 8px rgba(0, 0, 0, 0.4)',
        card: 'inset 0px 0px 0px 1px rgba(255, 255, 255, 0.07), 0px 1px 3px rgba(0, 0, 0, 0.3)',
        floating: 'inset 0px 0px 0px 1px rgba(255, 255, 255, 0.12), 0px 12px 32px -4px rgba(0, 0, 0, 0.7)',
        button: 'inset 0px 0px 0px 1px rgba(255, 255, 255, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.3)',
      },
      dropShadow: {
        xs: '0 1px 1px rgba(0, 0, 0, 0.05)',
      },
      borderWidth: {
        '3': '3px',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionDuration: {
        instant: '100ms',
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
      },
      transitionTimingFunction: {
        'snappy-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        standard: 'cubic-bezier(0.2, 0, 0, 1)',
      },
    },
  },
  plugins: [],
};
