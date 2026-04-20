import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
    resolveAlias: {
      // Turbopack mis-roots to the parent package.json at ~/package-lock.json.
      // This alias pins tailwindcss to the local node_modules installation.
      tailwindcss: path.resolve(__dirname, "node_modules/tailwindcss"),
    },
  },
};

export default nextConfig;
