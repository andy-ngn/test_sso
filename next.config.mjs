//@ts-check
import config from "./next-i18next.config.js";
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  i18n: config.i18n,
};

export default nextConfig;
