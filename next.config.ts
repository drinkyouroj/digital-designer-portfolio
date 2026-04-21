import type { NextConfig } from "next";
import path from "path";

// When building in GitHub Actions, deploy to the project subdirectory.
// If you add a custom domain (e.g. justin.hearn.me), remove this basePath.
const basePath = process.env.GITHUB_ACTIONS ? "/digital-designer-portfolio" : "";

const nextConfig: NextConfig = {
  output: "export",      // emit static HTML — no Node server required
  trailingSlash: true,   // /case-studies/ghost-editor → /case-studies/ghost-editor/index.html
  basePath,
  env: {
    // Expose basePath so components can manually prefix public asset URLs.
    // next/image does NOT prepend basePath in static export mode.
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,   // required for static export (no Image Optimization server)
  },
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
