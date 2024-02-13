const HttpBackend = require("i18next-http-backend/cjs");
const ChainedBackend = require("i18next-chained-backend").default;
const LocalStorageBackend = require("i18next-localstorage-backend").default;

const isBrowser = typeof window !== "undefined";
const isDev = process.env.NODE_ENV === "development";

/** @type {import('next-i18next').UserConfig} */
module.exports = {
  backend: {
    backendOptions: [
      { expirationTime: 60 * 60 * 1000 },
      {
        /* loadPath: 'https:// somewhere else' */
      },
    ], // 1 hour
    backends: typeof isBrowser ? [LocalStorageBackend, HttpBackend] : [],
  },
  partialBundledLanguages: isBrowser && true,
  debug: isDev,
  i18n: {
    defaultLocale: "en",
    locales: ["en", "de"],
  },
  reloadOnPrerender: true,
  serializeConfig: false,
  use: isBrowser ? [ChainedBackend] : [],
  saveMissing: isDev,
};
