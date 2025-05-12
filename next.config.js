// next.config.js
module.exports = {
  // Temporarily disable CSS minification
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.minimize = false;
    }
    return config;
  },
};
