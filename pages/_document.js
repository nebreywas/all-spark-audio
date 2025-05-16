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