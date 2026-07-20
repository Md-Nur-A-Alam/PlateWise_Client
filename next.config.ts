import type { NextConfig } from "next";

const requiredClientVars = [
  'NEXT_PUBLIC_API_URL', 'MONGODB_URI', 'BETTER_AUTH_SECRET', 
  'BETTER_AUTH_URL', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'
];
console.log('--- CLIENT ENV AUDIT ---');
console.log('Current working directory:', process.cwd());
const missingClientVars = requiredClientVars.filter(v => process.env[v] === undefined);
if (missingClientVars.length > 0) {
  console.error('MISSING REQUIRED CLIENT ENV VARS:', missingClientVars);
} else {
  console.log('All required client env vars are defined.');
}
console.log('------------------------');

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
