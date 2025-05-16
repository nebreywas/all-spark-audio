import '../styles/globals.css';
import { useEffect } from 'react';

export default function App({ Component, pageProps }) {
  // Ensure the default theme is set on the client after hydration
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light'); // Match the SSR default
  }, []);
  return <Component {...pageProps} />;
}