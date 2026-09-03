import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // Analytics merged into Reports (it opens as a modal from the Reports
      // toolbar now, so the standalone route redirects to the report page).
      {
        source: "/dashboard/analytics",
        destination: "/dashboard/reports",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
