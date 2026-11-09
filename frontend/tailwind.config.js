/** @type {import('tailwindcss').Config} */
module.exports = {
    corePlugins: {
        preflight: false,
    },
    darkMode: ['selector', '[class*="app-dark"]'],
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
        // "./node_modules/primereact/**/*.{js,ts,jsx,tsx}",
    ],
};
