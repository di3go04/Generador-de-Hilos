/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || "https://generadordehilos.com",
  generateRobotsTxt: true,
  changefreq: "weekly",
  priority: 0.7,
  exclude: [
    "/dashboard*",
    "/admin*",
    "/api*",
    "/login",
    "/register",
    "/forgot-password",
    "/verify-email",
  ],
  additionalPaths: async () => [
    { loc: "/", changefreq: "daily", priority: 1.0 },
    { loc: "/pricing", changefreq: "weekly", priority: 0.9 },
  ],
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/dashboard", "/admin", "/api"] },
    ],
  },
};

module.exports = config;
