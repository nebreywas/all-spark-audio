import React, { useState, useEffect } from 'react';

// Homepage for a fresh Next.js + Tailwind CSS + daisyUI install
// - Demonstrates daisyUI components
// - Includes a theme picker
// - Lists some installed daisyUI components

// List of built-in daisyUI themes (v4.x)
const themes = [
  'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate',
  'synthwave', 'retro', 'cyberpunk', 'valentine', 'halloween',
  'garden', 'forest', 'aqua', 'lofi', 'pastel', 'fantasy',
  'wireframe', 'black', 'luxury', 'dracula', 'cmyk', 'autumn',
  'business', 'acid', 'lemonade', 'night', 'coffee', 'winter',
];

// List of some daisyUI components to display
const daisyComponents = [
  { name: 'Button', className: 'btn btn-primary', content: 'Button' },
  { name: 'Card', className: '', content: null },
  { name: 'Alert', className: 'alert alert-info', content: 'Info Alert' },
  { name: 'Badge', className: 'badge badge-secondary', content: 'Badge' },
  { name: 'Input', className: '', content: null },
];

export default function Home() {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering (avoids SSR/CSR mismatch)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Set the theme on <html> whenever it changes (client-side only)
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme, mounted]);

  const handleThemeChange = (e) => setTheme(e.target.value);

  if (!mounted) return null; // Prevents SSR mismatch

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 p-4">
      {/* Title and description */}
      <h1 className="text-4xl font-bold text-primary mb-2">Next.js + Tailwind CSS + daisyUI</h1>
      <p className="text-lg text-base-content mb-6 text-center max-w-xl">
        This is a fresh install demo. Use the theme picker below to preview built-in daisyUI themes. Below, see some example daisyUI components.
      </p>

      {/* Theme picker */}
      <div className="mb-8 flex flex-col items-center">
        <label className="mb-2 font-semibold">Theme Picker:</label>
        <select
          className="select select-bordered w-full max-w-xs"
          value={theme}
          onChange={handleThemeChange}
        >
          {themes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Example daisyUI components */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 max-w-2xl w-full">
        {/* Button */}
        <div className="flex flex-col items-center">
          <span className="mb-2 font-medium">Button</span>
          <button className="btn btn-primary">daisyUI Button</button>
        </div>
        {/* Card */}
        <div className="flex flex-col items-center">
          <span className="mb-2 font-medium">Card</span>
          <div className="card w-64 bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">daisyUI Card</h2>
              <p>This is a card component.</p>
              <div className="card-actions justify-end">
                <button className="btn btn-secondary">Action</button>
              </div>
            </div>
          </div>
        </div>
        {/* Alert */}
        <div className="flex flex-col items-center">
          <span className="mb-2 font-medium">Alert</span>
          <div className="alert alert-info">
            <span>Info Alert: daisyUI alert component</span>
          </div>
        </div>
        {/* Badge */}
        <div className="flex flex-col items-center">
          <span className="mb-2 font-medium">Badge</span>
          <span className="badge badge-secondary">daisyUI Badge</span>
        </div>
        {/* Input */}
        <div className="flex flex-col items-center md:col-span-2">
          <span className="mb-2 font-medium">Input</span>
          <input type="text" placeholder="daisyUI Input" className="input input-bordered w-full max-w-xs" />
        </div>
      </div>

      {/* List installed daisyUI components */}
      <div className="mt-10 w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-2">Installed daisyUI Components</h2>
        <ul className="list-disc list-inside text-base-content">
          <li>Button (<code>btn</code>)</li>
          <li>Card (<code>card</code>)</li>
          <li>Alert (<code>alert</code>)</li>
          <li>Badge (<code>badge</code>)</li>
          <li>Input (<code>input</code>)</li>
          {/* Add more as you use them! */}
        </ul>
      </div>
    </div>
  );
}