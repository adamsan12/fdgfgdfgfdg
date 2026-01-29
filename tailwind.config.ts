import type { Config } from "tailwindcss";

const config = {
    content: [
        "./app/**/*.{ts,tsx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
    },
    plugins: [],
} satisfies Config;

export default config;
