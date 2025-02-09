import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <link 
          rel="stylesheet" 
          type="text/css" 
          href="https://js.api.here.com/v3/3.1/mapsjs-ui.css" 
        />
      </Head>
      <body>
        <Main />
        <NextScript />
        <script 
          type="text/javascript" 
          src="https://js.api.here.com/v3/3.1/mapsjs-core.js"
        />
        <script 
          type="text/javascript" 
          src="https://js.api.here.com/v3/3.1/mapsjs-service.js"
        />
        <script 
          type="text/javascript" 
          src="https://js.api.here.com/v3/3.1/mapsjs-ui.js"
        />
        <script 
          type="text/javascript" 
          src="https://js.api.here.com/v3/3.1/mapsjs-mapevents.js"
        />
      </body>
    </Html>
  );
} 