import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
    return (
        <html lang="ko">
            <head>
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

                {/* Link Preview / Open Graph Tags */}
                <title>IGCB 젤라크림 레시피</title>
                <meta name="description" content="IGCB의 공식 젤라크림 레시피 관리 시스템입니다." />

                <meta property="og:title" content="IGCB 젤라크림 레시피" />
                <meta property="og:description" content="IGCB의 공식 젤라크림 레시피 관리 시스템입니다." />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="IGCB Gelacream" />

                {/* 
          Add a custom og:image by putting an image in the public/ folder 
          and referencing it here, e.g.,
          <meta property="og:image" content="https://<your_netlify_domain>/og-image.png" /> 
        */}

                <ScrollViewStyleReset />
            </head>
            <body>{children}</body>
        </html>
    );
}
