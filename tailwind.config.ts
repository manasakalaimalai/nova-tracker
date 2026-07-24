import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        nova: {
          background: "#FAF7F2",
          card: "#EDE6DA",
          text: "#2B2620",
          credit: "#6B8F71",
          debit: "#B5725A",
          border: "#D9D0C3",
        },
      },
      fontFamily: {
        fraunces: ["Fraunces", "Georgia", "serif"],
        inter: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
