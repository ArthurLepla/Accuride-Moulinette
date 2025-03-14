/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
    unoptimized: true,
    remotePatterns: [],
  },
  output: 'standalone',
  // Configuration du débogage avancé
  webpack: (config, { dev, isServer }) => {
    // Activer le source map en développement
    if (dev) {
      config.devtool = 'source-map';
      config.optimization.minimize = false;
    }
    return config;
  },
  // Activer le débogage des erreurs React
  reactStrictMode: true,
  // Activer le débogage des erreurs de compilation
  compiler: {
    removeConsole: false,
  },
}

module.exports = nextConfig
