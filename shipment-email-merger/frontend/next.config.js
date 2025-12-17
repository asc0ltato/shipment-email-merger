/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    env: {
        NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL 
            ? process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/+$/, '')
            : 'http://localhost:3001',
    },
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            '@': require('path').resolve(__dirname, 'src'),
            '@/components': require('path').resolve(__dirname, 'src/components'),
            '@/hooks': require('path').resolve(__dirname, 'src/hooks'),
            '@/lib': require('path').resolve(__dirname, 'src/lib'),
            '@/types': require('path').resolve(__dirname, 'src/types'),
        };
        return config;
    },
    output: 'standalone'
};

module.exports = nextConfig;