/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                surface: "#f8fafc",
                "surface-alt": "#f1f5f9",
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
        },
    },
    plugins: [require("daisyui")],
    daisyui: {
        themes: [
            {
                light: {
                    ...require("daisyui/src/theming/themes")["light"],
                    primary: "#6366f1",
                    "primary-focus": "#4f46e5",
                    secondary: "#8b5cf6",
                    accent: "#06b6d4",
                    neutral: "#374151",
                    "base-100": "#f8fafc",
                    "base-200": "#f1f5f9",
                    "base-300": "#e2e8f0",
                },
            },
        ],
        darkTheme: false,
        base: true,
        styled: true,
        utils: true,
        logs: false,
    },
};
