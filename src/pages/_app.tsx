import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "../utils/api";

import "../styles/globals.css";
import Head from "next/head";

interface AppProps {
  session: Session;
}

const MyApp: AppType<AppProps> = ({ Component, pageProps }) => {
  return (
    <SessionProvider session={pageProps.session}>
      <Head>
        <title>TartanHacks 2023 | Feb 3-4, 2023</title>
        <meta name="title" content="TartanHacks 2023 | Feb 3-4, 2023" />
        <meta
          name="description"
          content="TartanHacks is Carnegie Mellon's largest hackathon! It is a 24-hour hackathon where participants from all over the country create innovative projects."
        />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tartanhacks.com/" />
        <meta property="og:title" content="TartanHacks 2023 | Feb 3-4, 2023" />
        <meta
          property="og:description"
          content="TartanHacks is Carnegie Mellon's largest hackathon! It is a 24-hour hackathon where participants from all over the country create innovative projects."
        />
        <meta
          property="og:image"
          content="https://tartanhacks.com/cover-photo-2023.png"
        />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://tartanhacks.com/" />
        <meta
          property="twitter:title"
          content="TartanHacks 2023 | Feb 3-4, 2023"
        />
        <meta
          property="twitter:description"
          content="TartanHacks is Carnegie Mellon's largest hackathon! It is a 24-hour hackathon where participants from all over the country create innovative projects."
        />
        <meta
          property="twitter:image"
          content="https://tartanhacks.com/cover-photo-2023.png"
        />
        <link rel="icon" href="https://tartanhacks.com/favicon.png" />
      </Head>
      <Component {...pageProps} />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
