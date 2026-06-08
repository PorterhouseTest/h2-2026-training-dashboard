import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        asphalt: "#101113",
        panel: "#171A1F",
        line: "#2B3038",
        track: "#9FDBA3",
        caution: "#F3B562",
        cool: "#7EA7D8"
      }
    }
  },
  plugins: []
};

export default config;
