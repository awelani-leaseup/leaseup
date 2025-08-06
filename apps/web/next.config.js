/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@leaseup/ui'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }

    return config;
  },
};

export default nextConfig;
