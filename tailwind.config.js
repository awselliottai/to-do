module.exports = {
    darkMode: 'class',
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                bg: 'var(--bg)',
                fg: 'var(--fg)',
                elev: 'var(--elev)',
                border: 'var(--border)',
                muted: 'var(--muted)',
                accent: 'var(--accent)',
            },
        },
    },
    plugins: [require('@tailwindcss/typography')],
}