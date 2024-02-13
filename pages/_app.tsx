import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter as FontSans } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import Head from "next/head";
import { Router } from "next/router";
import type { NextPage } from "next";
import NProgress from "nprogress";
import { CacheProvider } from "@emotion/react";
import type { EmotionCache } from "@emotion/cache";
import themeConfig from "@/configs/themeConfig";
import ThemeComponent from "@/core/theme/ThemeComponent";
import nextI18nConfig from "../next-i18next.config";
import { appWithTranslation } from "next-i18next";
type ExtendedAppProps = AppProps & {
  Component: NextPage;
  emotionCache: EmotionCache;
  session?: Session;
};

import {
  SettingsConsumer,
  SettingsProvider,
} from "@/core/context/settingsContext";
import { createEmotionCache } from "@/core/utils/create-emotion-cache";
import "react-perfect-scrollbar/dist/css/styles.css";
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import { Box } from "@mui/material";
import Footer from "@/components/Footer";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});
const clientSideEmotionCache = createEmotionCache();

// ** Pace Loader
if (themeConfig.routingLoader) {
  Router.events.on("routeChangeStart", () => {
    NProgress.start();
  });
  Router.events.on("routeChangeError", () => {
    NProgress.done();
  });
  Router.events.on("routeChangeComplete", () => {
    NProgress.done();
  });
}

const App = ({
  Component,
  emotionCache = clientSideEmotionCache,
  pageProps: { session, ...pageProps },
}: ExtendedAppProps) => {
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>Test SSO</title>
        <meta name='description' content='Test SSO' />
        <meta name='keywords' content='Test SSO' />
        <meta name='viewport' content='initial-scale=1, width=device-width' />
      </Head>
      <SettingsProvider>
        <SettingsConsumer>
          {({ settings }) => {
            return (
              <ThemeComponent settings={settings}>
                <SessionProvider session={session}>
                  <Navbar />
                  <Box py={2}>
                    <Component {...pageProps} />
                  </Box>
                  <Footer />
                </SessionProvider>
              </ThemeComponent>
            );
          }}
        </SettingsConsumer>
      </SettingsProvider>
    </CacheProvider>
  );
};

export default appWithTranslation(App, nextI18nConfig);
