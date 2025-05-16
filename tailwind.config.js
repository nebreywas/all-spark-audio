/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.{css,scss}",
    "./docs/**/*.{md,mdx}"
  ],
  // If you use dynamic class names, uncomment and edit the safelist below:
  // safelist: [
  //   { pattern: /btn-(primary|secondary|accent)/ },
  // ],
  theme: { extend: {} },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      // You can add a custom theme here for branding:
      // {
      //   mytheme: {
      //     "primary": "#570df8",
      //     "secondary": "#f000b8",
      //     // ...other colors
      //   },
      // },
      "light", "dark", "cupcake", "bumblebee", "emerald", "corporate",
      "synthwave", "retro", "cyberpunk", "valentine", "halloween",
      "garden", "forest", "aqua", "lofi", "pastel", "fantasy",
      "wireframe", "black", "luxury", "dracula", "cmyk", "autumn",
      "business", "acid", "lemonade", "night", "coffee", "winter"
    ]
  },
};