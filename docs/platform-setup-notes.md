# Next.js + Tailwind CSS: Fresh Install Guide

This document describes the stack and the step-by-step process used to set up a new Next.js project with Tailwind CSS and daisyUI from scratch.

---

## 🛠️ Stack Overview

- **Next.js**: 14.2.28
- **React**: 18.2.0
- **Tailwind CSS**: ^3.4.1
- **daisyUI**: 4.10.2 (see notes below)
- **PostCSS**: 8.4.35
- **Autoprefixer**: (latest compatible)

---

## 🚀 Step-by-Step Setup

### 1. Initialize the Project Directory
- Start in an empty directory.
- Run `npm init -y` to create a `package.json`.

### 2. Install Next.js, React, and ReactDOM
```sh
npm install next@14.2.28 react@18.2.0 react-dom@18.2.0
```

### 3. Install Tailwind CSS, PostCSS, and Autoprefixer
```sh
npm install tailwindcss@^3.4.1 postcss@8.4.35 autoprefixer
```

### 4. Install daisyUI (v4.10.2 for compatibility)
```sh
npm install daisyui@4.10.2
```

### 5. Create Tailwind and PostCSS Config Files
- Generate Tailwind config:
  ```sh
  npx tailwindcss init -p
  ```
- This creates `tailwind.config.js` and `postcss.config.js`.

### 6. Configure Tailwind Content Paths and Plugins
- Edit `tailwind.config.js`:
  ```js
  /** @type {import('tailwindcss').Config} */
  module.exports = {
    content: [
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: { extend: {} },
    plugins: [require('daisyui')],
    daisyui: {
      themes: [
        "light", "dark", "cupcake", "bumblebee", "emerald", "corporate",
        "synthwave", "retro", "cyberpunk", "valentine", "halloween",
        "garden", "forest", "aqua", "lofi", "pastel", "fantasy",
        "wireframe", "black", "luxury", "dracula", "cmyk", "autumn",
        "business", "acid", "lemonade", "night", "coffee", "winter"
      ]
    }
  };
  ```

### 7. Add Tailwind Directives to Global CSS
- Create `styles/globals.css` with:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```

### 8. Import Global CSS in Next.js
- Create or edit `pages/_app.js`:
  ```js
  import '../styles/globals.css';
  import { useEffect } from 'react';
  export default function App({ Component, pageProps }) {
    // Ensure the default theme is set on the client after hydration
    useEffect(() => {
      document.documentElement.setAttribute('data-theme', 'light'); // Match the SSR default
    }, []);
    return <Component {...pageProps} />;
  }
  ```

### 9. Set the Default Theme on SSR
- Create or edit `pages/_document.js`:
  ```js
  import { Html, Head, Main, NextScript } from 'next/document';
  // Custom Document to set the default daisyUI theme on SSR
  export default function Document() {
    return (
      <Html data-theme="light"> {/* Set your default theme here */}
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
  ```

### 10. Create a Sample Page
- Create `pages/index.js` with Tailwind and daisyUI classes to verify styling and theme switching:
  ```js
  import React, { useState, useEffect } from 'react';
  // ... (see your homepage code for a full example with theme picker)
  ```

### 11. Start the Development Server
```sh
npm run dev
```
- Visit [http://localhost:3000](http://localhost:3000) to verify Tailwind and daisyUI styles are applied and theme switching works.

---

## 📝 Notes & Troubleshooting
- **daisyUI v5+ is ESM-only and incompatible with Next.js 14.x and Tailwind v3+ CommonJS configs.**
- If you attempt to use daisyUI v5+, you will see warnings about ESM modules and daisyUI styles will not be included in your build.
- **Solution:** Use daisyUI v4.10.2 for full compatibility with the current Next.js and Tailwind stack.
- If styles do not appear, ensure all config files are present and correct, and restart the dev server.
- For customizations, edit `tailwind.config.js` as needed.
- **To prevent a flash of unstyled content (FOUC) and ensure theme switching works:**
  - Set the default theme in both `pages/_document.js` (SSR) and with `useEffect` in `pages/_app.js` (CSR).

---

## 📝 daisyUI + Tailwind + Next.js: Theming Lessons Learned (2024)

### What Works Well
- All built-in daisyUI themes (`light`, `dark`, `cupcake`, etc.) work perfectly for all color roles and components.
- Static class names (e.g., `btn btn-accent`) are required for Tailwind JIT to generate the correct CSS.
- Theme switching between built-in themes is reliable when the above SSR/CSR setup is used.

### What Doesn't Work
- Custom themes (even with both long and short variable names) do **not** reliably apply all color roles (`info`, `success`, `warning`, `error`, etc.).
- Setting the theme server-side and client-side does not resolve the issue for custom themes (daisyUI v4.x limitation).
- Theming quirks are likely due to daisyUI v4.x limitations or bugs.

### Best Practices
- Use built-in daisyUI themes for consistent, reliable theming.
- For custom colors, use Tailwind utility classes directly (e.g., `bg-[#ff0000] text-white`).
- Combine daisyUI component classes with Tailwind color utilities for maximum flexibility.
- Revisit custom theming if/when daisyUI v5+ is compatible with your stack.

### Troubleshooting
- If a color role doesn't work in a custom theme, try a built-in theme to confirm it's not your code.
- Always use static class names for Tailwind/daisyUI classes.
- If you see a flash of unstyled content, set the theme in both `_document.js` and with `useEffect` in `_app.js`.

---

**This setup ensures a clean, modern stack for rapid UI development with Next.js, Tailwind CSS, and daisyUI.** 

node_modules
.next
.env
.DS_Store 