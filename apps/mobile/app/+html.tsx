import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1, viewport-fit=cover" name="viewport" />
        <meta content="#0A080E" name="theme-color" />
        <meta content="yes" name="mobile-web-app-capable" />
        <meta content="yes" name="apple-mobile-web-app-capable" />
        <meta content="Vita AI" name="apple-mobile-web-app-title" />
        <link href="./manifest.json" rel="manifest" />
        <link href="./icon.svg" rel="icon" />
        <title>Vita AI</title>
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html:
              'html, body, #root { height: 100%; } body { margin: 0; background: #050507; } * { box-sizing: border-box; }',
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
